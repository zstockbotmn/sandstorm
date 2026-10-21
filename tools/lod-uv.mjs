// UV-preserving far LOD for the Meshy buildings (A4 perf): meshopt simplifyWithAttributes with weighted UV + normal
// attributes and the Permissive flag (collapses across UV seams only when the UV error stays small). Only indices change and
// vertices are compacted, so the kept UVs stay in the full model's quantized space and the full model's material
// (KHR_texture_transform included) maps them correctly at runtime. Textures are dropped (runtime reuses the full material).
// Usage: node tools/lod-uv.mjs full.glb out.lod.glb [ratio=0.35] [error=0.02] [uvWeight=16]
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions'; import { prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier as S } from 'meshoptimizer';
const [inp, out, r = '0.35', er = '0.02', uw = '16'] = process.argv.slice(2); await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, S.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(inp); let t0 = 0, t1 = 0;
for (const mesh of doc.getRoot().listMeshes()) for (const prim of mesh.listPrimitives()) {
  const P = prim.getAttribute('POSITION'), UV = prim.getAttribute('TEXCOORD_0'), N = prim.getAttribute('NORMAL'), I = prim.getIndices(); if (!P || !UV || !I) continue;
  const n = P.getCount(), pos = new Float32Array(n * 3), att = new Float32Array(n * 5), e = [];
  for (let i = 0; i < n; i++) { P.getElement(i, e); pos.set(e.slice(0, 3), i * 3); UV.getElement(i, e); att[i * 5] = e[0]; att[i * 5 + 1] = e[1]; if (N) { N.getElement(i, e); att[i * 5 + 2] = e[0]; att[i * 5 + 3] = e[1]; att[i * 5 + 4] = e[2]; } }
  const idx = new Uint32Array(I.getArray()); t0 += idx.length / 3;
  const target = Math.floor(idx.length * +r / 3) * 3;
  const [ni] = S.simplifyWithAttributes(idx, pos, 3, att, 5, [+uw, +uw, 0.3, 0.3, 0.3], null, target, +er, ['Permissive']);
  t1 += ni.length / 3;
  const [remap, unique] = S.compactMesh(ni); // ni rewritten in place to the compacted vertex order
  for (const sem of prim.listSemantics()) { const a = prim.getAttribute(sem), sz = a.getElementSize(), src = a.getArray(), dst = new src.constructor(unique * sz);
    for (let v = 0; v < n; v++) { const m = remap[v]; if (m === 0xffffffff || m >= unique) continue; for (let k = 0; k < sz; k++) dst[m * sz + k] = src[v * sz + k]; }
    const na = doc.createAccessor().setType(a.getType()).setArray(dst).setNormalized(a.getNormalized()).setBuffer(a.getBuffer()); prim.setAttribute(sem, na); }
  prim.setIndices(doc.createAccessor().setType('SCALAR').setArray(unique > 65535 ? new Uint32Array(ni) : new Uint16Array(ni)).setBuffer(I.getBuffer()));
}
for (const t of doc.getRoot().listTextures()) t.dispose();
await doc.transform(prune({ keepAttributes: true })); await io.write(out, doc);
console.log(out, 'tris', t0, '->', t1, (t1 / t0).toFixed(2));
