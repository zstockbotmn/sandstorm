import * as THREE from 'three';
// Shared Poly Haven CC0 PBR loader + box geometry with world-scaled UVs (Meshy-free surfaces, no stretched texels).
const cache = new Map();
function tex(url, srgb) {
  let t = cache.get(url);
  if (!t) {
    t = new THREE.TextureLoader().load(url);
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
    if (srgb) t.colorSpace = THREE.SRGBColorSpace;
    cache.set(url, t);
  }
  return t;
}
// full = High tier: normal + ARM (roughness/metal/AO). Low: diffuse only (still textured from every angle).
export function pbrMaterial(base, opts = {}) {
  const root = 'assets/textures/' + base;
  const m = new THREE.MeshStandardMaterial({ color: opts.color != null ? opts.color : 0xffffff, roughness: 1, metalness: 0, map: tex(root + '_diff.webp', true), vertexColors: !!opts.vertexColors });
  if (opts.full) {
    m.normalMap = tex(root + '_nor.webp', false);
    m.roughnessMap = tex(root + '_arm.webp', false);
    if (opts.normalScale) m.normalScale.setScalar(opts.normalScale);
  }
  return m;
}
// Unit-free box whose UVs are in metres / tile on every face (BoxGeometry face order +x,-x,+y,-y,+z,-z).
export function worldBox(sx, sy, sz, tile = 3) {
  const g = new THREE.BoxGeometry(sx, sy, sz);
  const uv = g.attributes.uv;
  const dims = [[sz, sy], [sz, sy], [sx, sz], [sx, sz], [sx, sy], [sx, sy]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) {
    const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / tile, uv.getY(i) * dims[f][1] / tile);
  }
  return g;
}
