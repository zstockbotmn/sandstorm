import * as THREE from 'three';
import { art } from './art.js';

const SEG_LEN = 60;
const SEG_COUNT = 5;
const START_Z = 24;      // first segment starts behind the spawn so the run opens in a street, not open desert
import { Q, LOWQ, ULTRA } from './quality.js';
import { pbrMaterial, worldBox, triplanarDetail } from './texlib.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { createInteriorAtlas, createInteriorMaterial, createInteriorFallback, buildWindowMesh, ROOM_WALLS, ROOM_FLOORS } from './interior.js';

// A28: bld4 (interiors + enterable rooms) ON by default for release/iPhone. Opt out: ?bld=0. Legacy ?bld=4 still on.
// ?bld=4p = procedural buildings only. ?rooms=0 kills enterable rooms + doorway stop (windows/interiors stay).
const BLD4 = typeof location === 'undefined' || !/[?&]bld=0\b/.test(location.search);
const BLD4P = typeof location !== 'undefined' && /[?&]bld=4p\b/.test(location.search);
const ROOMS_OFF = typeof location !== 'undefined' && /[?&]rooms=0\b/.test(location.search);
// A29: ?door=1 / ?doorstop=1 — force ≥1 enterable room with door ~25–40 m ahead of the W1 contact point (A36; was spawn-relative).
const FORCE_DOOR = typeof location !== 'undefined' && /[?&](?:door|doorstop)=1\b/.test(location.search);
if (typeof window !== 'undefined' && window.SS) { window.SS.bld4roomsOff = ROOMS_OFF; window.SS.bld4Default = BLD4; window.SS.forceDoor = FORCE_DOOR; }
let _roomsPlaced = 0; // A28: guarantee ≥1 room in the first ~60 m so doorway stop can fire after W1
// A36 (App PM): the forced ?door=1 room band is relative to where W1 is fought, not to spawn. The opening walk (A36 FIX2)
// is fps-independent and meets W1 at FIRST_CONTACT_S x walk speed (11 s x 3 m/s = 33 m; ?contact=<s> in test builds), so
// the W1 point is known when the street is built; the door band sits ~25-40 m ahead of it (Low used to meet W1 at ~11 m,
// which is why the A29 band was spawn-relative -25..-40 and High/fixed-fps runs passed it during W1).
const DOOR_SPAWN_Z = 4, DOOR_WALK = 3.0;
const DOOR_W1_D = (() => { let s = 11; try { const m = /[?&]contact=([0-9.]+)/.exec(location.search); if (m && (navigator.webdriver || /[?&]debug\b/.test(location.search))) s = +m[1]; } catch (_) {} return Math.max(6, s * DOOR_WALK); })();
const DOOR_W1_Z = DOOR_SPAWN_Z - DOOR_W1_D; // ≈ -29 at the 11 s spec
const DOOR_LO = DOOR_W1_Z - 40, DOOR_HI = DOOR_W1_Z - 25; // door z snaps into [W1-40, W1-25]
function doorBandZ(z) { return FORCE_DOOR && !_roomsPlaced && z < DOOR_W1_Z - 21 && z > DOOR_W1_Z - 44; } // building centre band ~21–44 m past W1
let winMat = null;
function windowMaterial() {
  if (!winMat) {
    const atlas = createInteriorAtlas();
    winMat = ULTRA ? createInteriorFallback({ atlas }) : createInteriorMaterial({ atlas });
  }
  return winMat;
}
let WIN_TABLE = null;
// A15: ?bld=4&winDbg=1 draws every windows.json rect on the art facades (green placed, yellow placed + grid-inferred,
// red skipped: too low / door / quality tier / occluded) so the table can be checked by eye. Debug only, no rng() use.
const WIN_DBG = BLD4 && typeof location !== 'undefined' && /[?&]winDbg=1\b/.test(location.search);
const _winDbgMats = {};
function winDbgRect(seg, x, y, z, w, h, hex) {
  const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y - h / 2, z - w / 2), new THREE.Vector3(x, y - h / 2, z + w / 2), new THREE.Vector3(x, y + h / 2, z + w / 2), new THREE.Vector3(x, y + h / 2, z - w / 2)]);
  const m = _winDbgMats[hex] || (_winDbgMats[hex] = new THREE.LineBasicMaterial({ color: hex, depthTest: false, transparent: true }));
  const l = new THREE.LineLoop(g, m); l.renderOrder = 999; l.name = 'winDbg'; seg.group.add(l);
  if (typeof window !== 'undefined' && window.SS) { const d = window.SS.winDbg || (window.SS.winDbg = { placed: 0, inferred: 0, skipped: 0 }); d[hex === 0xff3030 ? 'skipped' : hex === 0xffd000 ? 'inferred' : 'placed']++; } }
if (BLD4 && typeof fetch !== 'undefined') fetch('assets/models/windows.json').then((r) => (r.ok ? r.json() : null)).then((j) => { WIN_TABLE = j || {}; }).catch(() => { WIN_TABLE = {}; });
const ROOM_N = SEG_COUNT;
const ROOM_UA = { value: Array.from({ length: ROOM_N }, () => new THREE.Vector3(1e9, 1e9, 1e9)) }, ROOM_UB = { value: Array.from({ length: ROOM_N }, () => new THREE.Vector3(-1e9, -1e9, -1e9)) };
const ROOM_ALLA = { value: new THREE.Vector3(1e9, 1e9, 1e9) }, ROOM_ALLB = { value: new THREE.Vector3(-1e9, -1e9, -1e9) };
const ROOMS = new Map();
function syncRoomClip() { let i = 0; ROOM_ALLA.value.set(1e9, 1e9, 1e9); ROOM_ALLB.value.set(-1e9, -1e9, -1e9); for (const b of ROOMS.values()) { if (i >= ROOM_N) break; ROOM_UA.value[i].copy(b.min); ROOM_UB.value[i].copy(b.max); ROOM_ALLA.value.min(b.min); ROOM_ALLB.value.max(b.max); i++; } for (; i < ROOM_N; i++) { ROOM_UA.value[i].set(1e9, 1e9, 1e9); ROOM_UB.value[i].set(-1e9, -1e9, -1e9); } }
function roomClipPatch(mat) {
  if (ROOMS_OFF) return;
  if (!mat || mat.userData.roomClip) return;
  mat.userData.roomClip = true; const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = function (sh, r) {
    if (prev) prev.call(this, sh, r);
    sh.uniforms.uRA = ROOM_UA; sh.uniforms.uRB = ROOM_UB; sh.uniforms.uRAllA = ROOM_ALLA; sh.uniforms.uRAllB = ROOM_ALLB;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vClipW;').replace('#include <project_vertex>', '#include <project_vertex>\nvClipW = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vClipW;\nuniform vec3 uRA[' + ROOM_N + '];\nuniform vec3 uRB[' + ROOM_N + '];\nuniform vec3 uRAllA;\nuniform vec3 uRAllB;').replace('void main() {', 'void main() {\n  if (all(greaterThan(vClipW, uRAllA)) && all(lessThan(vClipW, uRAllB))) { for (int i = 0; i < ' + ROOM_N + '; i++) { if (all(greaterThan(vClipW, uRA[i])) && all(lessThan(vClipW, uRB[i]))) discard; } }');
  };
  const pk = mat.customProgramCacheKey ? mat.customProgramCacheKey.bind(mat) : () => ''; mat.customProgramCacheKey = () => pk() + '|roomclip2'; mat.needsUpdate = true;
}

const DRAW_AHEAD = Q.drawAhead;  // segments wholly beyond this (fogged out anyway) are not drawn
const DRAW_BEHIND = 20;

function mulberry32(a) {
  a >>>= 0;
  return function rand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePlasterTexture() {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#c9a36a';
  g.fillRect(0, 0, 256, 256);
  const rng = mulberry32(0x51a7);
  const img = g.getImageData(0, 0, 256, 256);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (rng() - 0.5) * 36;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n * 0.85));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 0.55));
  }
  g.putImageData(img, 0, 0);
  g.strokeStyle = 'rgba(90, 60, 30, 0.18)';
  g.lineWidth = 2;
  for (let y = 32; y < 256; y += 32) {
    g.beginPath();
    g.moveTo(0, y + (rng() * 2));
    g.lineTo(256, y + (rng() * 2));
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
boxGeo.setAttribute('uv2', boxGeo.attributes.uv);
const barrelGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.9, 8);

function prepTex(tex, repeatX, repeatY, srgb) {
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.anisotropy = 4;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// High tier swaps in Poly Haven CC0 maps. A failed fetch leaves the colored material.
function upgradeMaterial(mat, base, repeatX, repeatY, full = true) {
  const loader = new THREE.TextureLoader();
  const root = 'assets/textures/' + base;
  loader.load(root + '_diff.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, true);
    mat.map = tex;
    mat.color.set(0xffffff);
    mat.needsUpdate = true;
  });
  if (!full) return;
  loader.load(root + '_nor.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, false);
    mat.normalMap = tex;
    mat.needsUpdate = true;
  });
  loader.load(root + '_arm.webp', (tex) => {
    prepTex(tex, repeatX, repeatY, false);
    mat.roughnessMap = tex;
    mat.metalnessMap = tex;
    mat.aoMap = tex;
    mat.roughness = 1;
    mat.metalness = 1;
    mat.aoMapIntensity = 0.85;
    mat.needsUpdate = true;
  });
}

export function createWorld(scene, seed) {
  const plasterMap = makePlasterTexture();
  plasterMap.repeat.set(1, 1);

  const matPlaster = new THREE.MeshStandardMaterial({ map: plasterMap, roughness: 0.92, metalness: 0 });
  const matDark = new THREE.MeshStandardMaterial({ color: 0x1a140e, roughness: 1 });
  const matRoad = new THREE.MeshStandardMaterial({ color: 0x8d7b64, roughness: 1 });
  const matSand = new THREE.MeshStandardMaterial({ color: 0xd7bf8a, roughness: 1 });
  const matAwning = new THREE.MeshStandardMaterial({ color: 0xb5523a, roughness: 0.85 });
  const matAwningAlt = new THREE.MeshStandardMaterial({ color: 0xd8c7a0, roughness: 0.85 });
  const matBarrel = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.8 });
  const matWall = new THREE.MeshStandardMaterial({ color: 0xb8956a, roughness: 0.95 });
  const carColors = [0xb33a2b, 0xd8d2c4, 0x2c3a44, 0xc4a15a, 0x3d4a32].map(
    (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.15 })
  );
  const matGlass = new THREE.MeshStandardMaterial({ color: 0x9ec4d4, roughness: 0.25, metalness: 0.1 });
  // Shared by art colliders: not drawn, still raycastable (mesh.visible stays true).
  const matInvisible = new THREE.MeshBasicMaterial({ visible: false });
  if (/[?&]hitbox=2/.test(location.search)) Object.assign(matInvisible, { visible: true, wireframe: true, color: new THREE.Color(0xff8800) }); // world colliders too
  const ROOM_DIM = [0.62, 0.5, 0.38], _roomMats = [];
  function roomMat(i) {
    if (_roomMats[i]) return _roomMats[i];
    // A16 (tester A15: inside walls flat tan): matPlaster's procedural map stretched once over a 3.5 m unit box. Interior
    // walls / floor / ceiling are now Poly Haven CC0 plastered_wall_02 with world-tiled UVs (uvTile at the call sites), dimmed.
    const m = pbrMaterial('plastered_wall_02', { full: !LOWQ }); m.color.setRGB(1.0, 0.9, 0.78).multiplyScalar(ROOM_DIM[i] * 1.25); m.roughness = 0.95;
    return (_roomMats[i] = m);
  }
  const _artMats = new Map();
  function artRoomMat(cell, part) {
    const key = cell + part; const hit = _artMats.get(key); if (hit) return hit;
    const hex = part === 'floor' ? ROOM_FLOORS[cell % 3] : ROOM_WALLS[cell % 4];
    const k = (part === 'ceil' ? 0.7 : part === 'side' ? 0.8 : part === 'floor' ? 0.85 : 1) * 0.75;
    // Color('#hex') is already linear here; park the hex so convertSRGBToLinear runs once and matches the atlas.
    const color = new THREE.Color().setStyle(hex, THREE.LinearSRGBColorSpace).convertSRGBToLinear().multiplyScalar(k);
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 });
    return _artMats.set(key, m), m;
  }
  let _roomWood = null;
  // A14 (tester: door / table / rug read as blocky flat-shaded boxes): Poly Haven CC0 planks (wood) and hessian (rug,
  // tinted red) with world-tiled UVs; the planks are dark (sRGB ~80) so the colour lifts them to a warm mid wood.
  function roomWood() { if (!_roomWood) { _roomWood = pbrMaterial('weathered_planks'); _roomWood.color.setRGB(1.35, 1.08, 0.82); /* A16: less lift so the board grain keeps its contrast */ _roomWood.roughness = 0.82; } return _roomWood; }
  let _tableWood = null, _clothMat = null;
  function tableWood() { if (!_tableWood) { _tableWood = pbrMaterial('wood_table_001'); _tableWood.roughness = 0.7; } return _tableWood; }
  function clothMat() { if (!_clothMat) { _clothMat = pbrMaterial('fabric_pattern_07'); _clothMat.roughness = 0.95; } return _clothMat; }
  let _rugMat = null;
  // A16 (tester A15: rug solid red): a tinted hessian weave reads as flat red at 8 m. The rug map is now a woven-rug pattern
  // (border bands, field, medallion; canvas) multiplied by the CC0 hessian weave once that loads; one rug per UV square.
  function rugMat() { if (_rugMat) return _rugMat;
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const pat = () => { g.globalCompositeOperation = 'source-over'; g.fillStyle = '#7a1f17'; g.fillRect(0, 0, 256, 256);
      g.fillStyle = '#d9b26a'; g.fillRect(10, 10, 236, 236); g.fillStyle = '#1f2f4a'; g.fillRect(18, 18, 220, 220); g.fillStyle = '#a3322a'; g.fillRect(30, 30, 196, 196);
      g.fillStyle = '#e6cf98'; for (let i = 0; i < 12; i++) { g.fillRect(36 + i * 16, 22, 6, 4); g.fillRect(36 + i * 16, 230, 6, 4); g.fillRect(22, 36 + i * 16, 4, 6); g.fillRect(230, 36 + i * 16, 4, 6); }
      g.save(); g.translate(128, 128); g.rotate(Math.PI / 4); g.fillStyle = '#1f2f4a'; g.fillRect(-48, -48, 96, 96); g.fillStyle = '#d9b26a'; g.fillRect(-30, -30, 60, 60); g.fillStyle = '#7a1f17'; g.fillRect(-14, -14, 28, 28); g.restore();
      g.fillStyle = '#1f2f4a'; for (const [x, y] of [[48, 48], [208, 48], [48, 208], [208, 208]]) { g.beginPath(); g.arc(x, y, 9, 0, Math.PI * 2); g.fill(); } };
    pat(); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    const im = new Image(); im.onload = () => { pat(); g.globalCompositeOperation = 'multiply'; for (let y = 0; y < 256; y += 128) for (let x = 0; x < 256; x += 128) g.drawImage(im, x, y, 128, 128); g.globalCompositeOperation = 'source-over'; t.needsUpdate = true; };
    im.src = 'assets/textures/hessian_230_diff.webp';
    _rugMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.97, metalness: 0 }); return _rugMat; }
  const BLDGS = [['bldg1', 0.3], ['bldg2', 0.3], ['bldg3', 0.2], ['bldg4', 0.2]];
  const ROOF_OK = { bldg1: 1, bldg2: 1, bldg3: 1 };
  // Poly Haven CC0 1k PBR (WebP) for building sides/backs/roofs and the background rows. World-scaled box UVs.
  const FULL = !LOWQ;
  const WALL_TEX = ['beige_wall_001', 'plastered_wall_02', 'brick_wall_02'];
  const shellMats = WALL_TEX.map((b) => pbrMaterial(b, { full: FULL, vertexColors: true }));
  const roofMat = pbrMaterial('concrete_wall_008', { full: FULL, vertexColors: true });
  const bgWindowMat = new THREE.MeshStandardMaterial({ color: 0x2a2520, roughness: 0.6 });
  // Grime: vertex colour darkens toward the ground and tints per building (dust/soot band at street level).
  function tint(g, r, gg, b, grime) {
    g.computeBoundingBox(); const y0 = g.boundingBox.min.y, y1 = g.boundingBox.max.y, pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { const t = (pos.getY(i) - y0) / Math.max(0.01, y1 - y0); const d = 1 - grime * Math.max(0, 1 - t * 2.5) - grime * 0.35 * (1 - t);
      col[i * 3] = r * d; col[i * 3 + 1] = gg * d; col[i * 3 + 2] = b * d; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g;
  }
  // Decals: one canvas atlas (oil stain, cracks, torn poster, grime streak), alpha-tested (no blending: the transparent
  // first-draw stall on software GL), polygon-offset, merged into one mesh per segment.
  const decalTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); let sd = 11;
    const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
    // 0: oil stain
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(28,22,16,${0.35 + r() * 0.4})`; g.beginPath(); g.ellipse(128 + (r() - 0.5) * 110, 128 + (r() - 0.5) * 90, 18 + r() * 50, 12 + r() * 36, r() * 3, 0, 7); g.fill(); }
    // 1: cracks
    g.strokeStyle = 'rgba(70,60,48,0.95)'; g.lineWidth = 1.6;
    for (let k = 0; k < 5; k++) { g.beginPath(); let x = 300 + r() * 170, y = 20 + r() * 60; g.moveTo(x, y); for (let i = 0; i < 9; i++) { x += (r() - 0.5) * 50; y += 18 + r() * 12; g.lineTo(Math.max(260, Math.min(500, x)), Math.min(250, y)); } g.stroke(); }
    // 2: torn poster
    g.fillStyle = '#c8b27a'; g.fillRect(30, 290, 196, 200); g.fillStyle = '#7a2a1e'; g.fillRect(44, 304, 168, 60); g.fillStyle = '#2b2a28';
    for (let i = 0; i < 6; i++) g.fillRect(48, 380 + i * 16, 80 + r() * 80, 7);
    g.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(30 + r() * 196, 490); g.lineTo(30 + r() * 196, 420 + r() * 60); g.lineTo(30 + r() * 196, 490); g.fill(); } g.globalCompositeOperation = 'source-over';
    // 3: grime streaks (rain/soot running down)
    for (let i = 0; i < 40; i++) { const x = 266 + r() * 236, w = 3 + r() * 12, h = 60 + r() * 180; g.fillStyle = `rgba(45,36,28,${0.35 + r() * 0.35})`; g.fillRect(x, 258, w, h); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
  })();
  const decalMat = new THREE.MeshStandardMaterial({ map: decalTex, alphaTest: 0.35, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
  function decal(seg, cell, w, h, pos, normal) {
    const g = new THREE.PlaneGeometry(w, h); const uv = g.attributes.uv; const ox = (cell % 2) * 0.5, oy = cell < 2 ? 0.5 : 0;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, ox + uv.getX(i) * 0.5, oy + uv.getY(i) * 0.5);
    if (normal.y > 0.5) g.rotateX(-Math.PI / 2); else g.rotateY(Math.atan2(normal.x, normal.z));
    g.translate(pos.x + normal.x * 0.01, pos.y + normal.y * 0.004, pos.z + normal.z * 0.01);
    (seg._decals || (seg._decals = [])).push(g);
  }
  function boxAt(sx, sy, sz, x, y, z, tile) { const g = worldBox(sx, sy, sz, tile); g.translate(x, y, z); return g; }
  // Shell: sides, back and roof of a Meshy building get a textured box just inside the street facade, so no face shows
  // the smeared Meshy back texture from any angle. Height stops under the roof-shooter spot.
  function addShell(seg, _rng, side, box, roof, shellModel) {
    const rng = mulberry32(((box.min.z * 977) | 0) ^ (side * 0x5bd1e995) ^ seed);
    // Real wall plane: bbox front includes awnings/balconies, so raycast into the model from the street and sit the
    // shell front behind the deepest common wall hit (90th percentile), capped at 45% of the depth.
    const fx0 = side < 0 ? box.max.x : box.min.x, depthAll = box.max.x - box.min.x, hits = [];
    const dir = new THREE.Vector3(side, 0, 0);
    for (const y of [1.2, 2.4, 3.8, 5.5]) for (let k = 0; k < 7; k++) {
      const z = box.min.z + (0.12 + 0.76 * k / 6) * (box.max.z - box.min.z);
      _rc.set(new THREE.Vector3(fx0 - side * 0.5, Math.min(y, box.max.y - 0.3), z), dir); _rc.far = depthAll + 1;
      const h = _rc.intersectObject(shellModel, true)[0]; hits.push(h ? Math.abs(h.point.x - fx0) : depthAll); // a miss = open/see-through front
    }
    hits.sort((p, q) => p - q);
    const wallD = hits.length ? hits[Math.min(hits.length - 1, Math.floor(hits.length * 0.9))] : 0.6;
    const inset = Math.min(depthAll * 0.6, wallD + 0.3);
    const front = fx0 + side * inset;
    const back = side < 0 ? box.min.x - 0.06 : box.max.x + 0.06;
    const top = roof ? Math.min(box.max.y, roof.y - 0.25) : box.max.y * 0.985;
    const sx = Math.abs(front - back), sz = box.max.z - box.min.z + 0.12;
    const cx = (front + back) / 2, cz = (box.min.z + box.max.z) / 2;
    const k = (rng() * WALL_TEX.length) | 0, tr = 0.85 + rng() * 0.15;
    const walls = tint(boxAt(sx, top, sz, cx, top / 2, cz, 3), tr, tr * (0.95 + rng() * 0.05), tr * (0.88 + rng() * 0.1), 0.35);
    // grime streaks along the back and sides, an occasional poster on the street-visible side near the front
    const bx = back, nB = new THREE.Vector3(side, 0, 0);
    for (let i = 0; i < 0; i++) decal(seg, 3, 2.5 + rng() * 2, Math.min(top * 0.6, 3.5), new THREE.Vector3(bx, top - 1.6 - rng(), box.min.z + (0.2 + rng() * 0.6) * sz), nB);
    for (const zf of [box.min.z - 0.06, box.max.z + 0.06]) {
      const nz = new THREE.Vector3(0, 0, Math.sign(zf - cz));
      if (rng() < 0.5) decal(seg, 2, 0.8, 0.8, new THREE.Vector3(front + side * (0.6 + rng()), 1.6 + rng() * 0.4, zf), nz);
    }
    const m = new THREE.Mesh(walls, shellMats[k]); m.userData.ownGeo = true; m.castShadow = m.receiveShadow = true; seg.group.add(m);
    const cap = new THREE.Mesh(tint(boxAt(sx + 0.1, 0.12, sz + 0.1, cx, top + 0.04, cz, 4), 0.9, 0.88, 0.84, 0), roofMat); cap.receiveShadow = true; cap.userData.ownGeo = true; seg.group.add(cap);
  }
  // Background: 2-3 layered rows of textured low-poly buildings behind each side (not a flat skyline), merged per
  // material per segment. Rows step back and up; window bands on the street-facing side. Ultra 1 row, Low 2, High 3.
  const ROWS = [[20, 5, 10], [31, 7, 14], [44, 9, 20]];
  function addBackdrop(seg, rng, side, oz) {
    const nRows = ULTRA ? 1 : LOWQ ? 2 : 3;
    const byMat = shellMats.map(() => []); const roofs = [], wins = [];
    // Separate stream so BLD4 roof clutter never shifts the backdrop layout rng.
    const xr = BLD4 ? mulberry32(((oz * 131) | 0) ^ (side * 0x2c1b3c6d) ^ 0x51ed) : null;
    let nPar = 0, nTank = 0, nAnt = 0, nDome = 0, nMin = 0;
    const skyPrim = (g, x, y, z, cr, cg, cb) => {
      g.translate(x, y, z);
      for (const name of Object.keys(g.attributes)) if (name !== 'position' && name !== 'normal' && name !== 'uv') g.deleteAttribute(name);
      return tint(g, cr, cg, cb, 0);
    };
    for (let r = 0; r < nRows; r++) {
      const [x0, hMin, hMax] = ROWS[r];
      let z = oz + rng() * 4;
      while (z > oz - SEG_LEN) {
        const lot = Math.min(z - (oz - SEG_LEN), 6 + rng() * 9); if (lot < 2) break;
        if (rng() < 0.12) { z -= lot * 0.5; continue; }
        const depth = 7 + rng() * 6, h = hMin + rng() * (hMax - hMin);
        const cx = side * (x0 + depth / 2 + rng() * 2), cz = z - lot / 2;
        const k = (rng() * WALL_TEX.length) | 0, tr = 0.78 + rng() * 0.22;
        byMat[k].push(tint(boxAt(depth, h, lot - 0.3, cx, h / 2, cz, 3), tr, tr * 0.96, tr * 0.9, 0.3));
        const slab = tint(boxAt(depth + 0.3, 0.4, lot, cx, h + 0.2, cz, 4), 0.85, 0.82, 0.78, 0);
        roofs.push(slab);
        if (rng() < 0.3) roofs.push(tint(boxAt(1.4, 1.2, 1.4, cx + (rng() - 0.5) * depth * 0.5, h + 1, cz + (rng() - 0.5) * lot * 0.5, 2), 0.8, 0.8, 0.78, 0));
        if (BLD4) {
          const rt = 0.75 + xr() * 0.15;
          tint(slab, rt, rt * 0.82 / 0.85, rt * 0.78 / 0.85, 0);
          if (xr() < 0.55) {
            const rw = depth + 0.3, rl = lot, t = 0.25, ph = 0.6, py = h + 0.4 + ph / 2;
            roofs.push(tint(boxAt(t, ph, rl, cx - rw / 2 + t / 2, py, cz, 4), tr, tr * 0.96, tr * 0.9, 0.3));
            roofs.push(tint(boxAt(t, ph, rl, cx + rw / 2 - t / 2, py, cz, 4), tr, tr * 0.96, tr * 0.9, 0.3));
            roofs.push(tint(boxAt(rw - 2 * t, ph, t, cx, py, cz - rl / 2 + t / 2, 4), tr, tr * 0.96, tr * 0.9, 0.3));
            roofs.push(tint(boxAt(rw - 2 * t, ph, t, cx, py, cz + rl / 2 - t / 2, 4), tr, tr * 0.96, tr * 0.9, 0.3));
            nPar++;
          }
          if (r <= 1 && xr() < 0.25) {
            const tx = cx + (xr() - 0.5) * (depth + 0.3 - 1.4), tz = cz + (xr() - 0.5) * (lot - 1.4);
            roofs.push(skyPrim(new THREE.CylinderGeometry(0.6, 0.6, 1.3, 8), tx, h + 0.4 + 0.65, tz, 0.55, 0.55, 0.55));
            nTank++;
          }
          if (xr() < 0.2) {
            const ah = 2 + xr() * 2.5;
            roofs.push(tint(boxAt(0.06, ah, 0.06, cx, h + 0.4 + ah / 2, cz, 4), 0.3, 0.3, 0.3, 0));
            nAnt++;
          }
          if ((r === 1 || r === 2) && depth > 8 && lot > 7 && xr() < 0.06) {
            roofs.push(skyPrim(new THREE.SphereGeometry(2.2, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), cx, h + 0.4, cz, 0.85, 0.8, 0.7));
            nDome++;
            if (xr() < 0.5) {
              const mx = cx + side * ((depth + 0.3) / 2 - 0.7), mz = cz - lot / 2 + 0.7;
              roofs.push(skyPrim(new THREE.CylinderGeometry(0.45, 0.55, 7, 8), mx, h + 0.4 + 3.5, mz, 0.82, 0.78, 0.7));
              roofs.push(skyPrim(new THREE.ConeGeometry(0.6, 1.2, 8), mx, h + 0.4 + 7 + 0.6, mz, 0.82, 0.78, 0.7));
              nMin++;
            }
          }
        }
        if (r < 2) {
          const fx = cx - side * (depth / 2 + 0.02), floors = Math.max(1, Math.floor((h - 1) / 3.1)), nw = Math.max(1, Math.floor(lot / 2.6));
          for (let f = 0; f < floors; f++) for (let w = 0; w < nw; w++) {
            if (rng() < 0.2) continue;
            const g = new THREE.PlaneGeometry(0.9, 1.3); g.rotateY(side < 0 ? Math.PI / 2 : -Math.PI / 2);
            g.translate(fx, 1.9 + f * 3.1, cz - lot / 2 + (w + 0.5) * (lot / nw)); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g.computeVertexNormals(); wins.push(g);
          }
        } else if (BLD4 && nRows === 3 && r === 2) {
          const fx = cx - side * (depth / 2 + 0.02), floors = Math.max(1, Math.floor((h - 1) / 3.1)), nw = Math.max(1, Math.floor(lot / 2.6));
          for (let f = 0; f < floors; f += 2) for (let w = 0; w < nw; w++) {
            if (xr() < 0.5) continue;
            const g = new THREE.PlaneGeometry(0.9, 1.3); g.rotateY(side < 0 ? Math.PI / 2 : -Math.PI / 2);
            g.translate(fx, 1.9 + f * 3.1, cz - lot / 2 + (w + 0.5) * (lot / nw)); g.deleteAttribute('uv'); g.deleteAttribute('normal'); g.computeVertexNormals(); wins.push(g);
          }
        }
        z -= lot;
      }
    }
    if (BLD4 && typeof window !== 'undefined' && window.SS) {
      const s4 = window.SS.bld4sky || (window.SS.bld4sky = { parapets: 0, tanks: 0, antennas: 0, domes: 0, minarets: 0 });
      s4.parapets += nPar; s4.tanks += nTank; s4.antennas += nAnt; s4.domes += nDome; s4.minarets += nMin;
    }
    const add = (list, mat, shadow) => { if (!list.length) return; const g = mergeGeometries(list.map((x) => x.index ? x.toNonIndexed() : x)); if (!g) return;
      const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.castShadow = false; m.userData.backdrop = true; m.userData.ownGeo = true; seg.group.add(m); };
    byMat.forEach((l, i) => add(l, shellMats[i]));
    add(roofs, roofMat); add(wins, bgWindowMat);
  }

  scene.background = new THREE.Color(0x8ec8ea);
  scene.fog = new THREE.FogExp2(0xdccdaa, Q.fog); // matched to the sky horizon band so far rows melt into haze
  // Endless desert floor that follows the player, so side views and alley gaps never show sky below the road.
  const desertMat = new THREE.MeshStandardMaterial({ color: 0xc8b48a, roughness: 1, metalness: 0 });
  const desertGeo = new THREE.PlaneGeometry(800, 800);
  desertGeo.setAttribute('uv2', desertGeo.attributes.uv);
  const desert = new THREE.Mesh(desertGeo, desertMat);
  desert.rotation.x = -Math.PI / 2; desert.position.y = -0.1; desert.receiveShadow = false; scene.add(desert);

  {
    // Diffuse on every tier (nothing untextured from any angle); normal + ARM on High only.
    const full = art.tier === 'high' && !LOWQ;
    upgradeMaterial(desertMat, 'sand_01', 48, 48, full);
    upgradeMaterial(matRoad, 'asphalt_01', 4, 18, full);
    upgradeMaterial(matSand, 'sand_01', 4, 14, full);
    upgradeMaterial(matPlaster, 'dirty_concrete', 2, 3, full);
    upgradeMaterial(matWall, 'dirty_concrete', 1, 2, full);
  }

  const hemi = new THREE.HemisphereLight(0xbcd8ee, 0xb8915c, 0.75); // warmer sand bounce, slightly less flat fill
  scene.add(hemi);

  const sun = new THREE.DirectionalLight(0xffeccb, 2.8); // late-morning desert sun: warmer, stronger key for contrast
  sun.position.set(28, 48, 16);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 160;
  sun.shadow.camera.left = -36;
  sun.shadow.camera.right = 36;
  sun.shadow.camera.top = 36;
  sun.shadow.camera.bottom = -36;
  sun.shadow.bias = -0.0004;
  scene.add(sun);
  scene.add(sun.target);

  const segments = [];
  const colliders = [];
  // Shots and sight lines test the visible prop models themselves, not their movement boxes (tester: shots stopped by
  // invisible volume round market carts and burned-car cabs). Movement/cover/ragdolls keep the boxes (world.colliders).
  const shotMeshes = []; let shotVer = 0, shotCache = null, shotKey = '';
  function shotModel(seg, obj, ...boxes) { for (const b of boxes) if (b) b.userData.noShot = true;
    obj.traverse((o) => { if (o.isMesh) { o.userData.segId = seg.id; o.userData.shotProp = true; shotMeshes.push(o); (seg.shotOwned || (seg.shotOwned = [])).push(o); } }); shotVer++; }
  // Shots stop only on what is drawn: a prop mesh hidden by LOD / Ultra-low trim must not block (waves phantom metric).
  const drawn = (o) => { for (; o; o = o.parent) if (!o.visible) return false; return true; };
  let shotT = -1;
  function shotList() { const k = colliders.length + ':' + shotVer, now = performance.now(); if (k !== shotKey || !shotCache || now - shotT > 100) { shotKey = k; shotT = now; shotCache = colliders.filter((m) => !m.userData.noShot).concat(shotMeshes.filter(drawn)); } return shotCache; }

  // A14: opts.uvTile -> a world-UV box (texture tiles every uvTile m on every face, no stretch); cached by size
  const _uvBoxes = new Map();
  function addBox(seg, mat, x, y, z, sx, sy, sz, opts = {}) {
    let geo = boxGeo; if (opts.uvTile) { const k = sx.toFixed(2) + ',' + sy.toFixed(2) + ',' + sz.toFixed(2) + ',' + opts.uvTile; geo = _uvBoxes.get(k); if (!geo) _uvBoxes.set(k, geo = worldBox(sx, sy, sz, opts.uvTile)); }
    const m = new THREE.Mesh(geo, mat);
    if (geo === boxGeo) m.scale.set(sx, sy, sz);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== false;
    m.receiveShadow = true;
    m.userData.segId = seg.id;
    seg.group.add(m);
    if (opts.collide !== false) {
      colliders.push(m);
      seg.owned.push(m);
    }
    return m;
  }

  function addInvisibleBox(seg, x, y, z, sx, sy, sz) {
    const m = addBox(seg, matInvisible, x, y, z, sx, sy, sz, { cast: false });
    m.visible = true;
    return m;
  }

  // Spawn separation: footprint (half-extents hx,hz + margin) must not touch any solid prop already in this segment.
  const _fb = new THREE.Box3();
  const SOLID = new Set(['car', 'carcab', 'barrel', 'lowwall', 'prop', 'sandbag']);
  function footFree(seg, x, z, hx, hz, margin = 0.35) {
    for (const m of seg.owned) {
      if (!m.isMesh || !SOLID.has(m.name)) continue;
      _fb.setFromObject(m);
      if (x + hx + margin > _fb.min.x && x - hx - margin < _fb.max.x && z + hz + margin > _fb.min.z && z - hz - margin < _fb.max.z) return false;
    }
    return true;
  }
  function overlapCount() { // test hook: pairs of overlapping solid props across live segments
    let n = 0; const a = new THREE.Box3(), b = new THREE.Box3();
    const solids = colliders.filter((m) => SOLID.has(m.name) && m.name !== 'carcab');
    for (let i = 0; i < solids.length; i++) { a.setFromObject(solids[i]); a.expandByScalar(-0.02);
      for (let j = i + 1; j < solids.length; j++) { b.setFromObject(solids[j]); if (a.intersectsBox(b) && !(solids[i].name === 'car' && solids[j].name === 'carcab')) { n++; overlapCount.last = [solids[i].name, solids[j].name, a.min.x.toFixed(1), a.min.z.toFixed(1), b.min.x.toFixed(1), b.min.z.toFixed(1)]; } } }
    return n;
  }

  function useProp(name) {
    return art.tier === 'high' && art.done && !!art.get(name);
  }

  function buildingsReady() {
    if (art.tier !== 'high' || !art.done) return false;
    for (let i = 0; i < BLDGS.length; i++) if (art.get(BLDGS[i][0])) return true;
    return false;
  }

  function pickBuilding(rng) {
    let total = 0;
    const opts = [];
    for (let i = 0; i < BLDGS.length; i++) {
      if (art.get(BLDGS[i][0])) {
        opts.push(BLDGS[i]);
        total += BLDGS[i][1];
      }
    }
    let r = rng() * total;
    for (let i = 0; i < opts.length; i++) {
      r -= opts[i][1];
      if (r <= 0) return opts[i][0];
    }
    return opts[opts.length - 1][0];
  }

  // Low cover: sandbags when the prop is loaded, same box collider either way.
  function addLowWall(seg, x, y, z, sx, sy, sz) {
    if (useProp('prop_sandbags')) {
      const obj = art.staticInstance('prop_sandbags');
      art.fitToBox(obj, sx, sy, sz, { keepAspect: true, alignLong: true, longStretch: 1.5 });
      obj.position.x += x;
      obj.position.z += z;
      seg.group.add(obj);
      { const _c = addInvisibleBox(seg, x, y, z, sx, sy, sz); _c.name = 'lowwall'; shotModel(seg, obj, _c); return _c; }
    }
    { const w = addBox(seg, matWall, x, y, z, sx, sy, sz); w.name = 'lowwall'; return w; }
  }

  function maybeFrontWall(seg, rng, side, cz, lot) {
    if (rng() < 0.45) {
      const wz = cz + (rng() - 0.5) * lot * 0.5;
      const wallLen = 2.2 + rng() * 2;
      addLowWall(seg, side * 5.5, 0.35, wz, 0.4, 0.7, wallLen);
      seg.coverPoints.push({ pos: new THREE.Vector3(side * 5.5, 0.9, wz), type: 'wall' });
    }
  }

  let sign2Mat = null;
  let signMat = null;
  function shopSign(raw) {
    if (!signMat) {
      const c = document.createElement('canvas'); c.width = 512; c.height = 160; const g = c.getContext('2d');
      g.fillStyle = '#e9e1cf'; g.fillRect(0, 0, 512, 160); g.fillStyle = '#7a1e14'; g.fillRect(0, 0, 512, 10); g.fillRect(0, 150, 512, 10);
      g.fillStyle = '#2a2420'; g.textAlign = 'center'; g.font = 'bold 64px sans-serif'; g.fillText('SOUK', 256, 76);
      g.font = 'bold 34px sans-serif'; g.fillText('MARKET · سوق', 256, 128);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      signMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 });
    }
    if (!sign2Mat) { // second board baked as gibberish 'IVNEBIS 1961' -> readable 'CAFÉ · مقهى'
      const c = document.createElement('canvas'); c.width = 384; c.height = 160; const g = c.getContext('2d');
      g.fillStyle = '#d8d2c4'; g.fillRect(0, 0, 384, 160); g.strokeStyle = '#3b5e3a'; g.lineWidth = 10; g.strokeRect(5, 5, 374, 150);
      g.fillStyle = '#2a2420'; g.textAlign = 'center'; g.font = 'bold 60px sans-serif'; g.fillText('CAFÉ', 192, 80);
      g.font = 'bold 34px sans-serif'; g.fillText('مقهى', 192, 130);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
      sign2Mat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.9, polygonOffset: true, polygonOffsetFactor: -2 });
    }
    const w = raw.max.x - raw.min.x, h = raw.max.y - raw.min.y, d = raw.max.z - raw.min.z;
    const grp = new THREE.Group();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.24, h * 0.19), signMat);
    m.position.set(raw.min.x + w * 0.2, raw.min.y + h * 0.765, raw.max.z - d * 0.18);
    const p2 = (window.SS && window.SS.sign2) || [0.665, 0.785, 0.1, 0.3, 0.3];
    const m2 = new THREE.Mesh(new THREE.PlaneGeometry(w * p2[3], h * p2[4]), sign2Mat);
    m2.position.set(raw.min.x + w * p2[0], raw.min.y + h * p2[1], raw.max.z - d * p2[2]);
    grp.add(m, m2);
    return grp;
  }
  let plankMat = null;
  const _ppO = new THREE.Vector3(), _ppD = new THREE.Vector3(0, 0, -1);
  // A12 tester ("a large black and white square panel at the left edge"): bldg4 (the burnt ruin) has Meshy end walls
  // (local +-X) that are one flat, stretched soot texel patch, read as a floating panel up close at a lot edge. Cap each
  // end with a plain ruin-grey board shaped to the real mass (raycast in raw local space once per model, cached).
  // A14 (tester / Zack: the grey board read as a big untextured slab; every face textured): CC0 plastered_wall_02 with
  // world-metre UVs (tiles every 2.2 m) and a soot tint - vertex colour darkens toward the base and the top edge.
  const _capCache = {}; let _capMat = null;
  function capMat() { if (!_capMat) { _capMat = pbrMaterial('plastered_wall_02', { full: !LOWQ, vertexColors: true }); _capMat.color.set(0xc9bfae); } return _capMat; }
  function sootBox(mw, mh, md) { const g = worldBox(mw, mh, md, 2.2), pos = g.attributes.position, col = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) { const v = pos.getY(i) / mh + 0.5; const k = v < 0.5 ? 0.62 + 0.5 * v : 0.87 - 0.12 * Math.max(0, v - 0.85) / 0.15; col[i * 3] = k; col[i * 3 + 1] = k * 0.97; col[i * 3 + 2] = k * 0.93; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); return g; }
  const _capD = new THREE.Vector3(), _capO = new THREE.Vector3();
  function endCaps(model, raw, name, sc, yMul) {
    let spec = _capCache[name];
    if (!spec) { spec = _capCache[name] = [];
      const d = raw.max.z - raw.min.z, h = raw.max.y - raw.min.y, w = raw.max.x - raw.min.x;
      for (const e of [-1, 1]) { let top = 0, z0 = Infinity, z1 = -Infinity, n = 0; const ds = [];
        for (let i = 0; i < 5; i++) for (let j = 0; j < 10; j++) {
          const z = raw.min.z + d * (0.06 + 0.88 * i / 4), y = raw.min.y + h * (0.04 + 0.92 * j / 9);
          _capO.set(e > 0 ? raw.max.x + 0.5 : raw.min.x - 0.5, y, z); _capD.set(-e, 0, 0); _rc.set(_capO, _capD); _rc.far = 0.5 + w * 0.12;
          const hit = _rc.intersectObject(model, true)[0]; if (hit) { n++; ds.push(hit.distance); top = Math.max(top, y); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } }
        ds.sort((a, b) => a - b); const xd = ds.length ? ds[Math.floor(ds.length * 0.3)] - 0.5 : 0; // the wall plane (30th pct), not the rubble-padded bbox
        if (n >= 4) spec.push({ e, xd, top: Math.min(raw.max.y, top + h * 0.05), z0: Math.max(raw.min.z, z0 - d * 0.06), z1: Math.min(raw.max.z - d * 0.04, z1 + d * 0.06) }); } }
    const out = [];
    for (const c of spec) { const t = (raw.max.x - raw.min.x) * 0.006;
      const ss = sc || 1, sy = ss * (yMul || 1); // build in metres (world UVs), then undo the model's scale
      const m = new THREE.Mesh(sootBox(t * ss, (c.top - raw.min.y) * sy, (c.z1 - c.z0) * ss), capMat()); m.scale.set(1 / ss, 1 / sy, 1 / ss);
      m.position.set(c.e > 0 ? raw.max.x - c.xd + t / 2 : raw.min.x + c.xd - t / 2, (raw.min.y + c.top) / 2, (c.z0 + c.z1) / 2); m.name = 'endCap'; m.receiveShadow = true; out.push(m); }
    return out;
  }
  function plankPatch(model, raw, s, yMul) {
    const P = (window.SS && window.SS.plankPatch) || [0.5, 0.97, 0.0, 0.31]; // x0, x1, y0, y1 as fractions of the raw bbox
    const w = raw.max.x - raw.min.x, h = raw.max.y - raw.min.y;
    const x0 = raw.min.x + w * P[0], x1 = raw.min.x + w * P[1], y0 = raw.min.y + h * P[2], y1 = raw.min.y + h * P[3];
    let front = -Infinity;
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) {
      _ppO.set(x0 + (x1 - x0) * (0.15 + 0.7 * i / 3), y0 + (y1 - y0) * (0.2 + 0.6 * j / 2), raw.max.z + 1); _rc.set(_ppO, _ppD); _rc.far = raw.max.z - raw.min.z + 1;
      const hit = _rc.intersectObject(model, true)[0]; if (hit) front = Math.max(front, hit.point.z);
    }
    if (!Number.isFinite(front)) return null;
    if (!plankMat) { plankMat = pbrMaterial('weathered_planks'); plankMat.color.setRGB(2.5, 2.3, 2.1) /* the CC0 planks are dark (sRGB ~80): sun-bleached boards next to the ~180 plaster */; plankMat.polygonOffset = true; plankMat.polygonOffsetFactor = -2; }
    // panel dims in metres after the model's scale (s, s*yMul, s); worldBox tiles every 1.6 m, so build it in metres and undo the scale
    const mw = (x1 - x0) * s, mh = (y1 - y0) * s * yMul, md = 0.12;
    const m = new THREE.Mesh(worldBox(mw, mh, md, 1.6), plankMat);
    m.scale.set(1 / s, 1 / (s * yMul), 1 / s);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, front + md / 2 / s + 0.01 / s);
    m.receiveShadow = true; m.name = 'plankPatch';
    return m;
  }
  // Front (+Z) faces the street. Width (local X) becomes the lot length along Z.
  function placeArtBuilding(seg, rng, name, side, zCursor, lot, doors) {
    const model = art.staticInstance(name);
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
    model.updateMatrixWorld(true);
    const raw = new THREE.Box3().setFromObject(model);
    const sizeX = Math.max(1e-4, raw.max.x - raw.min.x);
    const sizeY = Math.max(1e-4, raw.max.y - raw.min.y);
    const s = (lot - 0.35) / sizeX;
    let yMul = 1;
    const h = sizeY * s;
    if (h < 3.6) yMul = Math.min(1.12, 3.6 / h); // max 12% vertical stretch (tester: stretched facades)
    else if (h > 11) yMul = Math.max(1 / 1.12, 11 / h);
    // A4 tester: bldg2's ground-floor masonry block (front, lower right) is a stretched, lumpy Meshy texel patch with a dark
    // smudge. Board it over with a clean CC0 planks panel (world-scaled UVs) placed on the block's front face (raycast).
    const patch = name === 'bldg2' ? plankPatch(model, raw, s, yMul) : null;
    model.scale.set(s, s * yMul, s);
    if (patch) model.add(patch);
    if (name === 'bldg4') for (const c of endCaps(model, raw, name, s, yMul)) model.add(c);
    // bldg3's Meshy texture bakes AI-gibberish shop lettering ('NAIVATS'); the glyphs are not mirrored, so a UV flip
    // would make it worse. Cover the main sign board with a readable painted sign instead.
    if (name === 'bldg3') model.add(shopSign(raw));
    model.rotation.y = side < 0 ? Math.PI / 2 : -Math.PI / 2;
    model.updateMatrixWorld(true);
    let box = new THREE.Box3().setFromObject(model);
    const facadeX = side * 6.2;
    const frontX = side < 0 ? box.max.x : box.min.x;
    const cz = zCursor - lot * 0.5;
    model.position.x += facadeX - frontX;
    model.position.y += -box.min.y;
    model.position.z += cz - (box.min.z + box.max.z) * 0.5;
    model.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(model);
    model.name = 'art_' + name; model.userData.side = side; // A12 probes
    seg.group.add(model);
    if (BLD4) { model.traverse((o) => { if (o.isMesh) (Array.isArray(o.material) ? o.material : [o.material]).forEach(roomClipPatch); }); shellMats.forEach(roomClipPatch); roomClipPatch(roofMat); }
    // Collider = the real building mass, not the bbox: the bbox front includes awnings/balconies and its top is above
    // the roof, so door-front and roof enemies stood INSIDE the invisible box and every shot hit the box (false misses).
    const roofEarly = ROOF_OK[name] ? findRoof(model, box, side, facadeX, cz) : null;
    let pending = null;
    {
      const fx0 = side < 0 ? box.max.x : box.min.x, depthAll = box.max.x - box.min.x, d = [];
      const dir = new THREE.Vector3(side, 0, 0);
      for (const y of [1.2, 2.4, 3.8]) for (let k = 0; k < 7; k++) {
        const z = box.min.z + (0.12 + 0.76 * k / 6) * (box.max.z - box.min.z);
        _rc.set(new THREE.Vector3(fx0 - side * 0.5, Math.min(y, box.max.y - 0.3), z), dir); _rc.far = depthAll + 1;
        const h = _rc.intersectObject(model, true)[0]; d.push(h ? Math.abs(h.point.x - fx0) : depthAll);
      }
      d.sort((p, q) => p - q);
      const wallIn = Math.min(depthAll * 0.6, Math.max(0, d[Math.floor(d.length * 0.5)] - 0.05));
      const front = fx0 + side * wallIn, back = side < 0 ? box.min.x : box.max.x;
      const top = roofEarly ? Math.min(box.max.y, roofEarly.y - 0.17) : box.max.y;
      // A28: rooms stay on ultra-low; force first room by ~60 m. A29 ?door=1: force in door-band (~25–40 m ahead of spawn).
      const spanOk = (box.max.z - box.min.z) >= 7;
      const midZ = (box.min.z + box.max.z) * 0.5;
      const earlyForce = BLD4 && !ROOMS_OFF && !_roomsPlaced && !seg._roomDone && spanOk && (
        doorBandZ(midZ) || (!FORCE_DOOR && seg.originZ < -20 && seg.originZ > -150));
      const artRoom = BLD4 && !ROOMS_OFF && !seg._roomDone && spanOk && (earlyForce || ((FORCE_DOOR ? doorBandZ(midZ) : seg.originZ < -20) && seg._wrng() < 0.35));
      if (artRoom) pending = { front, back, top, z0: box.min.z, z1: box.max.z };
      else { const col = addInvisibleBox(seg, (front + back) * 0.5, (box.min.y + top) * 0.5, (box.min.z + box.max.z) * 0.5, Math.abs(back - front), top - box.min.y, box.max.z - box.min.z); col.name = 'building'; col.userData.building = true; }
    }
    const spanZ = Math.max(0.5, box.max.z - box.min.z);
    let doorZ = box.min.z + (0.12 + rng() * 0.76) * spanZ;
    // A29: when forcing the early door room, snap door z into the 25–40 m band if the facade spans it.
    if (FORCE_DOOR && pending && !_roomsPlaced) {
      const lo = Math.max(box.min.z + 1.2, DOOR_LO), hi = Math.min(box.max.z - 1.2, DOOR_HI);
      if (lo < hi) doorZ = lo + rng() * (hi - lo);
    }
    doors.push(doorZ);
    if (pending) pending.front = doorFront(model, box, side, pending, doorZ);
    if (pending) { if (addRoom(seg, side, 0, 0, 0, 0, 0, pending.front, doorZ, pending)) { seg._roomDone = true; _roomsPlaced++; } else { const col = addInvisibleBox(seg, (pending.front + pending.back) * 0.5, (box.min.y + pending.top) * 0.5, (pending.z0 + pending.z1) * 0.5, Math.abs(pending.back - pending.front), pending.top - box.min.y, pending.z1 - pending.z0); col.name = 'building'; col.userData.building = true; } }
    if (seg._wins && WIN_TABLE && WIN_TABLE[name] && Array.isArray(WIN_TABLE[name].windows)) {
      const spec = WIN_TABLE[name];
      const f = spec.face;
      const fn = new THREE.Vector3(f === '+X' ? 1 : f === '-X' ? -1 : 0, 0, f === '+Z' ? 1 : f === '-Z' ? -1 : 0).transformDirection(model.matrixWorld);
      if (fn.dot(new THREE.Vector3(-side, 0, 0)) < 0.7) {
        if (typeof window !== 'undefined' && window.SS) window.SS.bld4Skip = name;
      } else {
        for (let i = 0; i < spec.windows.length; i++) {
          const wi = spec.windows[i];
          const centre = new THREE.Vector3(wi.c[0], wi.c[1], wi.c[2]).applyMatrix4(model.matrixWorld);
          centre.x += side * (wi.depth || 0) * s - side * 0.03; // c is on the bbox face plane; the dark window sits depth (model units) behind it
          const ww = wi.w * s, wh = wi.h * s * yMul;
          let why = centre.y < 0.8 ? 'low' : (centre.y < 3 && Math.abs(centre.z - doorZ) < 0.8 + ww / 2) ? 'door' : (LOWQ && !ULTRA && centre.y > 7) ? 'tier' : (ULTRA && centre.y > 4) ? 'tier' : null;
          if (!why) { _rc.set(new THREE.Vector3(centre.x - side * 1.5, centre.y, centre.z), new THREE.Vector3(side, 0, 0));
            _rc.far = 1.5;
            const hh = _rc.intersectObject(model, true)[0];
            if (hh && hh.distance < 1.5 - 0.03 - 0.25) why = 'occluded'; }
          if (WIN_DBG) winDbgRect(seg, centre.x - side * (wi.depth || 0) * s, centre.y, centre.z, ww, wh, why ? 0xff3030 : wi.inferred ? 0xffd000 : 0x30ff60);
          if (why) continue;
          seg._wins.push({ pos: centre, normal: new THREE.Vector3(-side, 0, 0), w: ww, h: wh, room: Math.floor(seg._wrng() * 8), lit: seg._wrng() < 0.3 ? 0.6 + 0.4 * seg._wrng() : 0 });
          seg._artWinN = (seg._artWinN | 0) + 1;
        }
      }
    }
    seg.coverPoints.push({
      pos: new THREE.Vector3(facadeX - side * 0.4, 1.2, doorZ),
      type: 'door',
    });
    if (ROOF_OK[name]) {
      // Real roof only: raycast down onto the model just behind the facade; need a flat hit (normal.y > 0.8) near the top.
      const roof = roofEarly;
      if (roof) seg.coverPoints.push({ pos: roof, type: 'roof' });
      addShell(seg, rng, side, box, roof, model);
    } else addShell(seg, rng, side, box, null, model);
    maybeFrontWall(seg, rng, side, cz, lot);
  }

  const _rc = new THREE.Raycaster(); const _down = new THREE.Vector3(0, -1, 0);
  function findRoof(model, box, side, facadeX, cz) {
    const h = box.max.y - box.min.y; let best = null;
    for (const inset of [0.8, 1.3, 2.0, 2.8]) for (const dz of [0, -1.2, 1.2]) {
      const x = facadeX + side * inset, z = cz + dz;
      _rc.set(new THREE.Vector3(x, box.max.y + 2, z), _down); _rc.far = h + 3;
      const hit = _rc.intersectObject(model, true)[0];
      if (!hit || !hit.face) continue;
      const n = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (n.y < 0.8 || hit.point.y < box.min.y + h * 0.55) continue;
      if (!best || hit.point.y > best.y) best = new THREE.Vector3(x, hit.point.y + 0.02, z);
    }
    return best ? (best.y += 0.15, best) : null; // enemies place roof feet at pos.y - 0.15
  }
  function nearDoor(z, half, doors) {
    const need = half + 0.8;
    for (let i = 0; i < doors.length; i++) {
      if (Math.abs(doors[i] - z) < need) return true;
    }
    return false;
  }

  function placeDecor(seg, rng, side, oz, doors) {
    if (art.tier !== 'high' || !art.done) return;
    const choices = [];
    if (art.get('prop_crates')) choices.push(['prop_crates', 1.4, 1.6, 1.4]);
    if (art.get('prop_cart')) choices.push(['prop_cart', 1.6, 1.6, 2.6]);
    if (!choices.length) return;
    if (rng() >= 0.5) return;
    const choice = choices[(rng() * choices.length) | 0];
    const obj = art.staticInstance(choice[0]);
    const dims = art.fitToBox(obj, choice[1], choice[2], choice[3], { keepAspect: true, alignLong: true });
    const half = dims.z * 0.5;
    let z = null;
    const x = side * (5.3 + rng() * 0.6);
    for (let attempt = 0; attempt < 8; attempt++) {
      const tryZ = oz - 4 - rng() * (SEG_LEN - 8);
      if (!nearDoor(tryZ, half, doors) && footFree(seg, x, tryZ, dims.x * 0.5, half)) { z = tryZ; break; }
    }
    if (z == null) return;
    obj.position.x += x;
    obj.position.z += z;
    seg.group.add(obj);
    { const pb = addInvisibleBox(seg, x, dims.y * 0.5, z, dims.x, dims.y, dims.z); pb.name = 'prop'; shotModel(seg, obj, pb); }
    seg.coverPoints.push({
      pos: new THREE.Vector3(x - side * (dims.x * 0.5), 0.9, z),
      type: 'wall',
    });
  }

  function fill(seg) {
    const set = new Set(seg.owned);
    for (let i = colliders.length - 1; i >= 0; i--) {
      if (set.has(colliders[i])) colliders.splice(i, 1);
    }
    if (seg.shotOwned && seg.shotOwned.length) { const so = new Set(seg.shotOwned); for (let i = shotMeshes.length - 1; i >= 0; i--) if (so.has(shotMeshes[i])) shotMeshes.splice(i, 1); seg.shotOwned.length = 0; shotVer++; }
    seg.owned.length = 0;
    seg.coverPoints.length = 0;
    while (seg.group.children.length) { const ch = seg.group.children[0]; if (ch.userData.ownGeo && ch.geometry) ch.geometry.dispose(); seg.group.remove(ch); }

    const rng = mulberry32((seed ^ Math.imul(seg.gen + 1, 0x9e3779b1) ^ Math.imul(seg.id + 1, 0x85ebca6b)) >>> 0);
    if (BLD4) { seg._wins = []; seg._artWinN = 0; seg._roomDone = false; if (ROOMS.delete(seg.id)) syncRoomClip(); seg._wrng = mulberry32((seed ^ Math.imul(seg.gen + 11, 0x2c1b3c6d) ^ Math.imul(seg.id + 5, 0x297a2d39)) >>> 0); } else seg._wins = null;
    const oz = seg.originZ;

    addBox(seg, matRoad, 0, -0.05, oz - SEG_LEN / 2, 10, 0.1, SEG_LEN, { cast: false });
    addBox(seg, matSand, -10.5, -0.02, oz - SEG_LEN / 2, 12, 0.08, SEG_LEN, { cast: false });
    addBox(seg, matSand, 10.5, -0.02, oz - SEG_LEN / 2, 12, 0.08, SEG_LEN, { cast: false });

    buildSide(seg, rng, -1, oz);
    buildSide(seg, rng, 1, oz);
    // Separate RNG so the backdrop never shifts gameplay layout (covers, cars, barrels).
    const brng = mulberry32((seed ^ Math.imul(seg.gen + 7, 0x27d4eb2d) ^ Math.imul(seg.id + 3, 0x165667b1)) >>> 0);
    addBackdrop(seg, brng, -1, oz);
    addBackdrop(seg, brng, 1, oz);
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0, n = 5 + ((brng() * 4) | 0); i < n; i++) decal(seg, brng() < 0.7 ? 0 : 1, 1.0 + brng() * 1.4, 0.9 + brng() * 1.1, new THREE.Vector3((brng() - 0.5) * 8.5, 0.0, oz - brng() * SEG_LEN), up);
    if (seg._decals && seg._decals.length) {
      const g = mergeGeometries(seg._decals.map((x) => x.index ? x.toNonIndexed() : x)); seg._decals.forEach((x) => x.dispose()); seg._decals = null;
      if (g) { const dm = new THREE.Mesh(g, decalMat); dm.receiveShadow = true; dm.userData.ownGeo = true; seg.group.add(dm); }
    }
    if (seg._wins && seg._wins.length) { seg.group.add(buildWindowMesh(seg._wins, windowMaterial())); }
    seg._winN = seg._wins ? seg._wins.length : 0;
    seg._wins = null;
    if (BLD4 && typeof window !== 'undefined' && window.SS) {
      let w = 0, m = 0, aw = 0;
      for (const s of segments) { if (s._winN) { w += s._winN; m++; } aw += s._artWinN | 0; }
      window.SS.bld4 = { windows: w, meshes: m, mode: ULTRA ? 'flat' : 'interior', artWindows: aw };
    }

    const cars = 1 + (rng() * 3) | 0;
    for (let i = 0; i < cars; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      let z = oz - 6 - rng() * (SEG_LEN - 12); const x = side * (3.2 + rng() * 0.6);
      let ok = footFree(seg, x, z, 1.0, 2.3);
      for (let t = 0; t < 6 && !ok; t++) { z = oz - 6 - rng() * (SEG_LEN - 12); ok = footFree(seg, x, z, 1.0, 2.3); }
      if (ok) addCar(seg, rng, x, z);
    }

    const barrels = 2 + (rng() * 4) | 0;
    for (let i = 0; i < barrels; i++) {
      const side = rng() < 0.5 ? -1 : 1;
      let z = oz - 4 - rng() * (SEG_LEN - 8);
      const x = side * (5.4 + rng() * 1.2);
      let ok = footFree(seg, x, z, 0.36, 0.36);
      for (let t = 0; t < 6 && !ok; t++) { z = oz - 4 - rng() * (SEG_LEN - 8); ok = footFree(seg, x, z, 0.36, 0.36); }
      if (!ok) continue;
      let m;
      if (useProp('prop_drum')) {
        const drum = art.staticInstance('prop_drum');
        art.fitToBox(drum, 0.62, 0.9, 0.62, { keepAspect: true, alignLong: true });
        drum.position.x += x;
        drum.position.z += z;
        seg.group.add(drum);
        m = new THREE.Mesh(barrelGeo, matInvisible); m.scale.set(0.88, 1, 0.88); // proxy inside the drum silhouette
        m.castShadow = false;
        m.visible = true;
      } else {
        m = new THREE.Mesh(barrelGeo, matBarrel);
        m.castShadow = true;
      }
      m.position.set(x, 0.45, z); m.name = 'barrel';
      m.receiveShadow = true;
      m.userData.segId = seg.id;
      seg.group.add(m);
      colliders.push(m);
      seg.owned.push(m);
      seg.coverPoints.push({ pos: new THREE.Vector3(x, 0.7, z), type: 'barrel' });
    }
  }

  // A37: the art room front was the facade's MEDIAN depth (wallIn). On the FIX4 (W1+25-40 m) building the door-level relief
  // sits ~0.6-0.9 m street-side of that, past the 0.28 m clip, so unclipped art mesh stood in the aperture and beside it and
  // the doorway look (any yaw 0-75 deg outward) hit a wall/pillar 1-2.5 m away. Put the room front flush with the outermost
  // art surface across the aperture itself, so the opening really opens onto the street wherever the room lands.
  function doorFront(model, box, side, art, doorZ) {
    const fx0 = side < 0 ? box.max.x : box.min.x, depthAll = box.max.x - box.min.x;
    const W = Math.min(3.6, (art.z1 - art.z0) - 2.4), zc = Math.max(art.z0 + W / 2 + 0.3, Math.min(art.z1 - W / 2 - 0.3, doorZ));
    const dir = new THREE.Vector3(side, 0, 0); let dmin = Infinity;
    // door-height rows only (a low stoop/step under the eye does not block the look and must not drag the front out)
    for (const y of [1.1, 1.8]) for (const dz of [-0.55, -0.3, 0, 0.3, 0.55]) {
      _rc.set(new THREE.Vector3(fx0 - side * 0.5, y, zc + dz), dir); _rc.far = depthAll + 1;
      const h = _rc.intersectObject(model, true)[0]; if (h) dmin = Math.min(dmin, Math.abs(h.point.x - fx0));
    }
    const cur = Math.abs(art.front - fx0);
    if (!isFinite(dmin) || dmin >= cur - 0.1) return art.front;
    const front = fx0 + side * Math.max(0, dmin - 0.05);
    if (typeof window !== 'undefined' && window.SS) window.SS.roomFront = { was: +art.front.toFixed(2), now: +front.toFixed(2), z: +zc.toFixed(1) };
    return front;
  }
  // A37: world point inside a room clip box (art mesh there is discarded in the shader) - for doorway sightline rays.
  function inRoomClip(q) { for (const b of ROOMS.values()) if (q.x > b.min.x && q.x < b.max.x && q.y > b.min.y && q.y < b.max.y && q.z > b.min.z && q.z < b.max.z) return true; return false; }
  function addRoom(seg, side, cx, cz, depth, h, lot, facadeX, doorZ, art) {
    const c0 = seg.group.children.length;
    if (art && Math.abs(art.back - art.front) < 4.4) return false;
    if (art) facadeX = art.front;
    const W = Math.min(3.6, (art ? art.z1 - art.z0 : lot) - 2.4), RH = 3, L = art ? art.z1 - art.z0 : lot - 0.35, z0 = art ? art.z0 : cz - L / 2, z1 = art ? art.z1 : cz + L / 2;
    const zc = Math.max(z0 + W / 2 + 0.3, Math.min(z1 - W / 2 - 0.3, doorZ));
    const X = (a) => facadeX + side * a, nc = { collide: false, cast: false };
    const solid = (x, y, z, sx, sy, sz) => { if (!art) return addBox(seg, matPlaster, x, y, z, sx, sy, sz); const m = addInvisibleBox(seg, x, y, z, sx, sy, sz); m.name = 'building'; m.userData.building = true; };
    if (art) {
      const span = Math.abs(art.back - art.front), zm = (z0 + z1) / 2;
      solid(X(span / 2), (RH + art.top) / 2, zm, span, art.top - RH, L);
      solid(X((3.8 + span) / 2), RH / 2, zm, span - 3.8, RH, L);
    } else {
      solid(cx, (RH + h) / 2, cz, depth, h - RH, L);
      if (depth - 3.8 >= 0.2) solid(X((3.8 + depth) / 2), RH / 2, cz, depth - 3.8, RH, L);
    }
    for (let s = 0; s < 2; s++) {
      const za = s ? zc + W / 2 : z0, zb = s ? z1 : zc - W / 2;
      if (zb - za >= 0.05) solid(X(1.9), RH / 2, (za + zb) / 2, 3.8, RH, zb - za);
    }
    const jw = W / 2 - 0.6;
    if (jw >= 0.05) {
      addBox(seg, matPlaster, X(0.15), RH / 2, zc - W / 4 - 0.3, 0.3, RH, jw);
      addBox(seg, matPlaster, X(0.15), RH / 2, zc + W / 4 + 0.3, 0.3, RH, jw);
    }
    addBox(seg, matPlaster, X(0.15), (2.2 + RH) / 2, zc, 0.3, RH - 2.2, 1.2);
    const iw = W - 0.06, id = 3.47; let cell;
    if (art) { cell = (seg.id * 5 + 3) % 8; if (typeof window !== 'undefined' && window.SS) window.SS.bld4roomCell = cell; }
    addBox(seg, art ? artRoomMat(cell, 'floor') : roomMat(0), X(2.035), 0.02, zc, id, 0.02, iw, { ...nc, uvTile: 1.6 });
    addBox(seg, art ? artRoomMat(cell, 'ceil') : roomMat(1), X(2.035), RH - 0.02, zc, id, 0.02, iw, { ...nc, uvTile: 1.6 });
    addBox(seg, art ? artRoomMat(cell, 'side') : roomMat(0), X(2.035), RH / 2, zc - W / 2 + 0.02, id, RH - 0.04, 0.02, { ...nc, uvTile: 1.6 });
    addBox(seg, art ? artRoomMat(cell, 'side') : roomMat(0), X(2.035), RH / 2, zc + W / 2 - 0.02, id, RH - 0.04, 0.02, { ...nc, uvTile: 1.6 });
    addBox(seg, art ? artRoomMat(cell, 'back') : roomMat(2), X(3.78), RH / 2, zc, 0.02, RH - 0.04, iw, { ...nc, uvTile: 1.6 });
    // A30: leaf flat against the -z interior side wall — fully clear of the 1.2×2.2 aperture so IN COVER peeks into the lit room (not a shut-door face).
    const A = Math.PI * 0.92; // ~166° parked
    const leaf = addBox(seg, roomWood(), X(0.55), 1.075, zc - W / 2 + 0.08, 1.15, 2.15, 0.06, { collide: false, uvTile: 0.9 });
    leaf.rotation.y = side * (Math.PI / 2);
    leaf.name = 'doorLeaf'; leaf.userData.doorOpen = A;
    // A28: Ultra-low keeps the lit shell + door + cover point, skips table/crates/rubble/rug (cheaper than disabling rooms).
    const cS = seg._wrng() < 0.5 ? -1 : 1;
    if (!ULTRA) {
      // A16d (tester A15: table a plain brown slab): CC0 wood_table_001 top + four legs (no block base), world-tiled UVs, and a
      // CC0 fabric_pattern_07 runner across it; diffuse maps on every tier (pbrMaterial).
      { const tw = tableWood(); addBox(seg, tw, X(2.2), 0.76, zc, 1.2, 0.05, 0.8, { uvTile: 0.7 });
        for (const lx of [-0.52, 0.52]) for (const lz of [-0.33, 0.33]) addBox(seg, tw, X(2.2 + lx), 0.37, zc + lz, 0.06, 0.74, 0.06, { uvTile: 0.7, cast: false, collide: false });
        addBox(seg, clothMat(), X(2.2), 0.79, zc, 0.36, 0.01, 0.86, { collide: false, cast: false, uvTile: 0.35 });
        addInvisibleBox(seg, X(2.2), 0.38, zc, 1.1, 0.76, 0.7); }
      const nC = 2 + Math.floor(seg._wrng() * 2);
      for (let i = 0; i < nC; i++) addBox(seg, roomWood(), X(3.4), 0.3 + i * 0.6, zc + cS * (W / 2 - 0.4), 0.6, 0.6, 0.6, { uvTile: 0.9 });
      addBox(seg, roomWood(), X(3.58), 0.9, zc, 0.35, 1.8, 1.6, { uvTile: 0.9 });
      addBox(seg, rugMat(), X(1.35), 0.03, zc, 1.6, 0.02, 1.0, { collide: false });
      for (let i = 0, n = 3 + Math.floor(seg._wrng() * 3); i < n; i++) {
        const rs = 0.15 + seg._wrng() * 0.2;
        addBox(seg, matPlaster, X(0.9 + seg._wrng() * 1.8), rs / 2, zc - cS * (W / 2 - 0.45) + (seg._wrng() - 0.5) * 0.4, rs, rs, rs, nc);
      }
    }
    seg.coverPoints.push({
      pos: new THREE.Vector3(X(1.0), 1.2, zc + 0.9), type: 'room',
      door: {
        x: facadeX, z: zc, side, w: 1.2,
        // A30: cover jamb = +z free edge (opposite the hinged leaf) so IN COVER peeks across the open aperture into the lit room.
        jamb: new THREE.Box3(
          new THREE.Vector3(Math.min(X(0), X(0.3)), 0, zc + 0.6),
          new THREE.Vector3(Math.max(X(0), X(0.3)), RH, zc + W / 2)),
        leafOpen: A,
        open: true,
      },
    });
    // A30/A31/A32: warmer fill + doorway rim + window shaft in the peek frustum (not only the back wall).
    {
      const pl = new THREE.PointLight(0xffd6a0, FORCE_DOOR ? 3.0 : 1.9, 11, 2);
      pl.position.set(X(2.0), 2.4, zc); pl.name = 'roomLit'; seg.group.add(pl);
      const rim = new THREE.PointLight(0xffe2b0, FORCE_DOOR ? 1.8 : 1.0, 5.5, 2);
      rim.position.set(X(0.55), 1.6, zc); rim.name = 'roomLitRim'; seg.group.add(rim);
      if (!ULTRA) {
        const winMat = new THREE.MeshBasicMaterial({ color: 0xffe6c0, transparent: true, opacity: FORCE_DOOR ? 0.72 : 0.55, depthWrite: false, side: THREE.DoubleSide, fog: false });
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.9), winMat);
        win.position.set(X(3.76), 1.7, zc); win.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        win.name = 'roomWindow'; win.castShadow = false; win.receiveShadow = false; seg.group.add(win);
        // A32: bright patch closer to the aperture so IN COVER · DOORWAY looking in sees it (back wall sat outside peek FOV).
        const winPeek = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.05), winMat);
        winPeek.position.set(X(1.45), 1.7, zc);
        winPeek.rotation.y = side > 0 ? -Math.PI / 2 : Math.PI / 2;
        winPeek.name = 'roomWindow'; winPeek.castShadow = false; winPeek.receiveShadow = false; seg.group.add(winPeek);
        const shaft = new THREE.PointLight(0xffefd0, FORCE_DOOR ? 2.8 : 1.05, FORCE_DOOR ? 9 : 7, 2);
        shaft.position.set(X(1.55), 1.7, zc); shaft.name = 'roomShaft'; seg.group.add(shaft);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xffefd0, transparent: true, opacity: FORCE_DOOR ? 0.52 : 0.32, depthWrite: false, side: THREE.DoubleSide, fog: false, toneMapped: false });
        const beam = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.45), beamMat);
        beam.position.set(X(1.9), 1.65, zc);
        beam.rotation.y = side > 0 ? -Math.PI / 2 + 0.4 : Math.PI / 2 - 0.4;
        beam.name = 'roomShaftBeam'; beam.castShadow = false; beam.receiveShadow = false; beam.frustumCulled = false; seg.group.add(beam);
        // A33: a brighter wedge nearer the aperture, plus dust in the peek. Own geos so the box merge does not eat them. Leaf stays open.
        const beamNearMat = beamMat.clone(); beamNearMat.opacity = FORCE_DOOR ? 0.7 : 0.4;
        const beamNear = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.15), beamNearMat);
        beamNear.position.set(X(1.35), 1.62, zc);
        beamNear.rotation.y = side > 0 ? -Math.PI / 2 + 0.22 : Math.PI / 2 - 0.22;
        beamNear.name = 'roomShaftBeam'; beamNear.castShadow = false; beamNear.receiveShadow = false; beamNear.frustumCulled = false; seg.group.add(beamNear);
        const dustGeo = new THREE.SphereGeometry(0.045, 5, 4);
        const nDust = FORCE_DOOR ? 6 : 3;
        for (let di = 0; di < nDust; di++) {
          const dm = new THREE.MeshBasicMaterial({ color: 0xfff1d4, transparent: true, opacity: FORCE_DOOR ? 0.5 : 0.3, depthWrite: false, fog: false, toneMapped: false });
          const mote = new THREE.Mesh(dustGeo, dm);
          mote.position.set(X(1.15 + di * 0.28), 1.42 + (di % 3) * 0.16, zc + (di % 2 ? 0.2 : -0.16));
          mote.name = 'roomDust'; mote.castShadow = false; mote.receiveShadow = false; mote.frustumCulled = false; seg.group.add(mote);
        }
      }
    }
    if (typeof window !== 'undefined' && window.SS) window.SS.bld4rooms = (window.SS.bld4rooms | 0) + 1;
    if (art) {
      const x0 = facadeX - side * 0.28, x1 = facadeX + side * 3.85; // A30: clip further street-side so art facade door mesh is discarded
      ROOMS.set(seg.id, { min: new THREE.Vector3(Math.min(x0, x1), -0.1, zc - W / 2 + 0.01), max: new THREE.Vector3(Math.max(x0, x1), RH - 0.01, zc + W / 2 - 0.01) });
      syncRoomClip();
      let removed = 0;
      if (seg._wins) for (let i = seg._wins.length - 1; i >= 0; i--) {
        const e = seg._wins[i];
        if (Math.abs(e.pos.x - facadeX) < 1.0 && e.pos.y - e.h / 2 < RH + 0.3 && Math.abs(e.pos.z - zc) < W / 2 + e.w / 2 + 0.3) {
          seg._wins.splice(i, 1); seg._artWinN--; removed++;
        }
      }
      if (typeof window !== 'undefined' && window.SS) window.SS.bld4roomWinCut = (window.SS.bld4roomWinCut | 0) + removed;
    }
    // Non-colliding shared boxGeo only; leaf stays separate (rotated). ownGeo matches other merged meshes on recycle.
    if (BLD4) {
      const added = seg.group.children.slice(c0), before = added.length, byMat = new Map();
      for (const m of added) if (m.isMesh && m.geometry === boxGeo && m !== leaf && !colliders.includes(m)) {
        const a = byMat.get(m.material); if (a) a.push(m); else byMat.set(m.material, [m]);
      }
      byMat.forEach((list, mat) => {
        if (list.length < 2) return;
        const geos = list.map((m) => { m.updateMatrix(); const g = boxGeo.clone().applyMatrix4(m.matrix); if (!g.index) return g; const n = g.toNonIndexed(); g.dispose(); return n; });
        const geometry = mergeGeometries(geos); geos.forEach((g) => g.dispose()); if (!geometry) return;
        const mesh = new THREE.Mesh(geometry, mat);
        mesh.castShadow = false; mesh.receiveShadow = true; mesh.userData.segId = seg.id; mesh.userData.ownGeo = true;
        seg.group.add(mesh); list.forEach((m) => seg.group.remove(m));
      });
      if (typeof window !== 'undefined' && window.SS) window.SS.bld4roomMeshes = { before, after: seg.group.children.length - c0 };
    }
    return true;
  }

  function buildSide(seg, rng, side, oz) {
    const doors = [];
    let z = oz - 3;
    const end = oz - SEG_LEN + 2;
    while (z - 6 > end) {
      const lot = 8 + rng() * 8;
      if (z - lot < end) break;
      if (rng() < 0.2) {
        const gap = 4 + rng() * 3;
        seg.coverPoints.push({
          pos: new THREE.Vector3(side * 7.2, 1.2, z - gap * 0.5),
          type: 'alley',
        });
        if (rng() < 0.6) {
          addLowWall(seg, side * 6.2, 0.35, z - gap * 0.5, 0.35, 0.7, Math.min(gap - 0.5, 3.5));
          seg.coverPoints.push({
            pos: new THREE.Vector3(side * 6.2, 1.0, z - gap * 0.5),
            type: 'wall',
          });
        }
        z -= gap;
        continue;
      }
      // Extra roll only once art is in, so low tier and the pre-load fill stay identical.
      if (buildingsReady() && rng() < 1.01 && !BLD4P) {
        placeArtBuilding(seg, rng, pickBuilding(rng), side, z, lot, doors);
        z -= lot;
        continue;
      }
      const depth = 6 + rng() * 3;
      const floors = rng() < 0.4 ? 2 : 3;
      const h = floors * 3.15;
      const cx = side * (6.2 + depth * 0.5);
      const cz = z - lot * 0.5;
      // A29 ?door=1: force room when building center is in the 25–40 m door band; else A28 ~60 m earlyForce.
      let doorZ = cz + (rng() - 0.5) * lot * 0.3;
      if (FORCE_DOOR && !_roomsPlaced && doorBandZ(cz)) {
        const lo = Math.max(cz - lot * 0.35, DOOR_LO), hi = Math.min(cz + lot * 0.35, DOOR_HI);
        if (lo < hi) doorZ = lo + rng() * (hi - lo);
      }
      const earlyForce = BLD4 && !ROOMS_OFF && !_roomsPlaced && !seg._roomDone && lot >= 7 && depth >= 6 && (
        doorBandZ(doorZ) || doorBandZ(cz) || (!FORCE_DOOR && seg.originZ < -20 && seg.originZ > -150));
      const room = BLD4 && !ROOMS_OFF && !seg._roomDone && lot >= 7 && depth >= 6 && (earlyForce || ((FORCE_DOOR ? (doorBandZ(doorZ) || doorBandZ(cz)) : seg.originZ < -20) && seg._wrng() < 0.35));
      if (room) { seg._roomDone = true; _roomsPlaced++; }
      if (!room) addBox(seg, matPlaster, cx, h * 0.5, cz, depth, h, lot - 0.35);
      addBox(seg, matPlaster, cx, h + 0.28, cz, depth + 0.35, 0.55, lot, { collide: false });
      const facadeX = cx - side * (depth * 0.5);
      // Roof spot sits on the street-side parapet edge (not the roof centre, which put enemies inside the building).
      seg.coverPoints.push({ pos: new THREE.Vector3(facadeX + side * 0.45, h + 0.7, cz), type: 'roof' });
      doors.push(doorZ);
      if (room) addRoom(seg, side, cx, cz, depth, h, lot, facadeX, doorZ);
      else addBox(seg, matDark, facadeX - side * 0.12, 1.15, doorZ, 0.28, 2.3, 1.15);
      seg.coverPoints.push({
        pos: new THREE.Vector3(facadeX - side * 0.4, 1.2, doorZ),
        type: 'door',
      });

      if (rng() < 0.65) {
        const aw = rng() < 0.5 ? matAwning : matAwningAlt;
        addBox(seg, aw, facadeX - side * 1.15, 2.55, doorZ, 2.1, 0.08, 2.4, { collide: false });
      }

      for (let f = 0; f < floors; f++) {
        const wy = 1.7 + f * 3.15;
        const count = Math.max(2, Math.round(lot / 4));
        for (let w = 0; w < count; w++) {
          const wz = cz - lot * 0.38 + ((w + 0.5) / count) * lot * 0.76;
          if (Math.abs(wz - doorZ) < 0.9 && f === 0) continue;
          addBox(seg, matDark, facadeX - side * 0.1, wy, wz, 0.22, 1.15, 0.85);
          if (seg._wins) { const wr = seg._wrng; seg._wins.push({ pos: new THREE.Vector3(facadeX - side * 0.215, wy, wz), normal: new THREE.Vector3(-side, 0, 0), w: 0.85, h: 1.15, room: Math.floor(wr() * 8), lit: wr() < 0.3 ? 0.6 + 0.4 * wr() : 0 }); }
          seg.coverPoints.push({
            pos: new THREE.Vector3(facadeX - side * 0.45, wy, wz),
            type: 'window',
          });
        }
      }

      maybeFrontWall(seg, rng, side, cz, lot);

      z -= lot;
    }
    placeDecor(seg, rng, side, oz, doors);
  }

  function addCar(seg, rng, x, z) {
    const bodyMat = carColors[(rng() * carColors.length) | 0];
    const yaw = rng() < 0.5 ? 0 : Math.PI;
    if (useProp('prop_burnedcar')) {
      const jitter = (rng() - 0.5) * 0.3;
      const obj = art.staticInstance('prop_burnedcar');
      obj.traverse((o) => { if (o.isMesh) triplanarDetail(o.material, 'rust_coarse_01', { tile: 0.9, mix: 0.5, top: 0.7 }); }); // A4: stretched 512 px hood map
      art.fitToBox(obj, 1.8, 1.5, 4.3, { keepAspect: true, alignLong: true });
      const pivot = new THREE.Group();
      pivot.add(obj);
      pivot.rotation.y = yaw + jitter;
      pivot.position.set(x, 0, z);
      seg.group.add(pivot);
      const carB = addInvisibleBox(seg, x, 0.48, z, 1.75, 0.62, 4.15); carB.name = 'car';
      const cabin = addInvisibleBox(seg, x, 1.05, z + 0.15, 1.5, 0.52, 2.0); cabin.name = 'carcab';
      cabin.rotation.y = yaw;
      shotModel(seg, pivot, carB, cabin);
    } else {
      addBox(seg, bodyMat, x, 0.48, z, 1.75, 0.62, 4.15);
      const cabin = addBox(seg, matGlass, x, 1.05, z + 0.15, 1.5, 0.52, 2.0);
      cabin.rotation.y = yaw;
    }
    seg.coverPoints.push({ pos: new THREE.Vector3(x, 1.15, z), type: 'car' });
  }

  for (let i = 0; i < SEG_COUNT; i++) {
    const group = new THREE.Group();
    scene.add(group);
    const seg = {
      id: i,
      gen: 0,
      originZ: START_Z - i * SEG_LEN,
      group,
      coverPoints: [],
      owned: [],
    };
    segments.push(seg);
    fill(seg);
  }

  let playerZ = 0;

  // Art loads after the first fill. Before Play, rebuild every segment; during a run, only segments whose near end is > 25 m ahead.
  art.onReady(() => {
    if (art.tier !== 'high') return;
    const ss = typeof window !== 'undefined' ? window.SS : null;
    const running = !!(ss && ss.running);
    const pz = (ss && ss.camera) ? ss.camera.position.z : playerZ;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (!running || seg.originZ < pz - 25) fill(seg);
    }
  });

  function update(playerZIn) {
    playerZ = playerZIn;
    desert.position.z = playerZ;
    sun.position.set(26, 46, playerZ + 18);
    sun.target.position.set(0, 0, playerZ - 30);
    sun.target.updateMatrixWorld();

    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      // distance culling: only segments overlapping [player-ahead, player+behind] are drawn
      seg.group.visible = seg.originZ - SEG_LEN < playerZ + DRAW_BEHIND && seg.originZ > playerZ - Q.drawAhead;
      if (playerZ < seg.originZ - SEG_LEN - 8) {
        seg.originZ -= SEG_COUNT * SEG_LEN;
        seg.gen += 1;
        const tf = performance.now(); fill(seg); const dtf = performance.now() - tf;
        if (typeof window !== 'undefined' && dtf > 40) (window.SS_SPIKES = window.SS_SPIKES || []).push(['fill', Math.round(tf), Math.round(dtf)]);
      }
    }
  }

  function reset(playerZ) {
    _roomsPlaced = 0; // A28: re-guarantee an early room on a fresh run
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      seg.gen = 0;
      seg.originZ = START_Z - i * SEG_LEN;
      fill(seg);
    }
    update(playerZ == null ? 0 : playerZ);
  }

  return { update, reset, segments, colliders, shotList, sun, overlapCount, footFree, inRoomClip };
}
