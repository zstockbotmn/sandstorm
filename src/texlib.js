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
// A4 tester: the burnt cover car's Meshy map is 512 px stretched over a car the player sits 1-2 m from (blurry, smeared flames).
// World-space triplanar detail: a tiling CC0 texture (tiles every `tile` m) modulates the base colour everywhere and, on
// up-facing faces (hood/roof/trunk, the worst-stretched), replaces most of it with the detail tinted by the base's mean colour.
// One extra texture, 3 taps per pixel, no new UVs. Patches the material once (flag), so shared materials stay shared.
export function triplanarDetail(material, base, opts = {}) {
  if (!material || material.userData.triplanar) return material;
  material.userData.triplanar = true;
  const detail = tex('assets/textures/' + base + '_diff.webp', true);
  const U = { uDetail: { value: detail }, uTile: { value: 1 / (opts.tile || 0.9) }, uMix: { value: opts.mix != null ? opts.mix : 0.55 }, uTop: { value: opts.top != null ? opts.top : 0.7 }, uTint: { value: new THREE.Color(opts.tint != null ? opts.tint : 0x8a5a36) } };
  material.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vTpW; varying vec3 vTpN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvTpW = (modelMatrix * vec4(transformed, 1.0)).xyz; vTpN = normalize(mat3(modelMatrix) * objectNormal);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vTpW; varying vec3 vTpN; uniform sampler2D uDetail; uniform float uTile, uMix, uTop; uniform vec3 uTint;')
      .replace('#include <map_fragment>', `#include <map_fragment>
      { vec3 bw = pow(abs(normalize(vTpN)), vec3(4.0)); bw /= (bw.x + bw.y + bw.z + 1e-5);
        vec3 d = texture2D(uDetail, vTpW.zy * uTile).rgb * bw.x + texture2D(uDetail, vTpW.xz * uTile).rgb * bw.y + texture2D(uDetail, vTpW.xy * uTile).rgb * bw.z;
        float dl = dot(d, vec3(0.299, 0.587, 0.114));
        diffuseColor.rgb *= mix(1.0, clamp(dl / 0.22, 0.4, 1.8), uMix);
        float up = smoothstep(0.55, 0.85, normalize(vTpN).y) * uTop;
        diffuseColor.rgb = mix(diffuseColor.rgb, d * uTint * 2.2, up); }`);
  };
  material.customProgramCacheKey = () => 'triplanar-' + base;
  material.needsUpdate = true;
  return material;
}
