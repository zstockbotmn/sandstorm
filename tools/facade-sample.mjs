import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });

const applyWorld = (m, x, y, z) => [
  m[0] * x + m[4] * y + m[8] * z + m[12],
  m[1] * x + m[5] * y + m[9] * z + m[13],
  m[2] * x + m[6] * y + m[10] * z + m[14],
];

export async function loadFacade(file) {
  const doc = await io.read(file);
  const tris = [], uvs = [], texI = [], textures = [], cache = new Map();
  const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  const el = [0, 0, 0], tuv = [0, 0];

  async function texOf(mat) {
    const out = { ti: -1, scale: [1, 1], offset: [0, 0] };
    if (!mat) return out;
    const base = mat.getBaseColorTexture();
    if (base && base.getImage()) {
      if (cache.has(base)) out.ti = cache.get(base);
      else {
        out.ti = textures.length;
        const { data, info } = await sharp(Buffer.from(base.getImage())).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
        textures.push({ data, width: info.width, height: info.height });
        cache.set(base, out.ti);
      }
    }
    const tinfo = mat.getBaseColorTextureInfo();
    const tt = tinfo && tinfo.getExtension('KHR_texture_transform');
    if (tt) { out.offset = tt.getOffset(); out.scale = tt.getScale(); }
    return out;
  }

  async function addPrim(prim, m) {
    const pos = prim.getAttribute('POSITION');
    if (!pos) return;
    const uva = prim.getAttribute('TEXCOORD_0');
    const ia = prim.getIndices();
    const idx = ia ? ia.getArray() : null;
    const n = idx ? idx.length : pos.getCount();
    const { ti, scale, offset } = await texOf(prim.getMaterial());
    const P = (i) => (pos.getElement(i, el), applyWorld(m, el[0], el[1], el[2]));
    const U = (i) => {
      if (uva) uva.getElement(i, tuv); else tuv[0] = tuv[1] = 0;
      return [tuv[0] * scale[0] + offset[0], tuv[1] * scale[1] + offset[1]];
    };
    for (let t = 0; t + 2 < n; t += 3) {
      const i0 = idx ? idx[t] : t, i1 = idx ? idx[t + 1] : t + 1, i2 = idx ? idx[t + 2] : t + 2;
      const a = P(i0), b = P(i1), c = P(i2);
      tris.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
      const u0 = U(i0), u1 = U(i1), u2 = U(i2);
      uvs.push(u0[0], u0[1], u1[0], u1[1], u2[0], u2[1]);
      texI.push(ti);
      for (const v of [a, b, c]) for (let k = 0; k < 3; k++) {
        if (v[k] < bbox.min[k]) bbox.min[k] = v[k];
        if (v[k] > bbox.max[k]) bbox.max[k] = v[k];
      }
    }
  }

  async function walk(node) {
    const mesh = node.getMesh();
    if (mesh) for (const p of mesh.listPrimitives()) await addPrim(p, node.getWorldMatrix());
    for (const c of node.listChildren()) await walk(c);
  }
  for (const node of doc.getRoot().listScenes()[0].listChildren()) await walk(node);
  if (!texI.length) { bbox.min = [0, 0, 0]; bbox.max = [0, 0, 0]; }
  return { tris: new Float32Array(tris), uvs: new Float32Array(uvs), tex: new Int32Array(texI), textures, bbox };
}

export function raycast(f, ox, oy, oz, dx, dy, dz) {
  const { tris, uvs, tex } = f;
  let best = Infinity, hit = null;
  for (let i = 0, n = tex.length; i < n; i++) {
    const o = i * 9;
    const ax = tris[o], ay = tris[o + 1], az = tris[o + 2];
    const bx = tris[o + 3], by = tris[o + 4], bz = tris[o + 5];
    const cx = tris[o + 6], cy = tris[o + 7], cz = tris[o + 8];
    const e1x = bx - ax, e1y = by - ay, e1z = bz - az, e2x = cx - ax, e2y = cy - ay, e2z = cz - az;
    const hx = dy * e2z - dz * e2y, hy = dz * e2x - dx * e2z, hz = dx * e2y - dy * e2x;
    const det = e1x * hx + e1y * hy + e1z * hz;
    if (det > -1e-8 && det < 1e-8) continue;
    const inv = 1 / det, sx = ox - ax, sy = oy - ay, sz = oz - az;
    const bu = inv * (sx * hx + sy * hy + sz * hz);
    if (bu < 0 || bu > 1) continue;
    const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
    const bv = inv * (dx * qx + dy * qy + dz * qz);
    if (bv < 0 || bu + bv > 1) continue;
    const t = inv * (e2x * qx + e2y * qy + e2z * qz);
    if (t <= 1e-8 || t >= best) continue;
    best = t;
    const w = 1 - bu - bv, uo = i * 6;
    hit = { t, u: w * uvs[uo] + bu * uvs[uo + 2] + bv * uvs[uo + 4], v: w * uvs[uo + 1] + bu * uvs[uo + 3] + bv * uvs[uo + 5], tex: tex[i] };
  }
  return hit;
}

const fract = (x) => x - Math.floor(x);

export function texel(f, hit) {
  const image = hit && hit.tex >= 0 ? f.textures[hit.tex] : null;
  if (!image) return [0, 0, 0];
  const { data, width, height } = image;
  let col = Math.floor(fract(hit.u) * width), row = Math.floor(fract(hit.v) * height);
  if (col >= width) col = width - 1;
  if (row >= height) row = height - 1;
  const i = (row * width + col) * 4;
  return [data[i] / 255, data[i + 1] / 255, data[i + 2] / 255];
}
