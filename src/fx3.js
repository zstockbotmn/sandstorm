// Step 3a sensory core. Only constructed when ?fx=3 is set, so the rest of the game never calls it.
import * as THREE from 'three';
const DEG = Math.PI / 180;
const ROT_CAP = 3 * DEG;
const POS_CAP = 0.06;
// Amplitudes are the ceiling of each axis (two sines, each in [-1, 1]).
// Blast axes are sized so a full alignment is ~2.5 deg and ~4 cm, then the sum is clamped.
const KIND = {
  shot:   { decay: 12, pitch: 0.25 * DEG, yaw: 0.05 * DEG, roll: 0.03 * DEG, x: 0, y: 0, up: true },
  impact: { decay: 9,  pitch: 0.28 * DEG, yaw: 0.28 * DEG, roll: 0.10 * DEG, x: 0.008, y: 0.008, up: false },
  hit:    { decay: 6,  pitch: 1.80 * DEG, yaw: 1.10 * DEG, roll: 0.90 * DEG, x: 0.02, y: 0.016, up: true }, // A6: flinch on every hit taken (A8: ~1.6x, tester saw none)
  blast:  { decay: 4,  pitch: 1.80 * DEG, yaw: 1.40 * DEG, roll: 1.00 * DEG, x: 0.0283, y: 0.0283, up: false },
};
const W1 = [11.3, 17.6, 13.1, 9.7, 19.4];
const W2 = [23.1, 8.4, 29.7, 14.8, 21.5];

function reduceScale() {
  try { if (localStorage.getItem('ss.reduceShake') === '1') return 0.3; } catch (e) { /* storage blocked */ }
  try { if (/[?&]shake=0(?:&|$)/.test(location.search)) return 0.3; } catch (e) { /* no location */ }
  return 1;
}

function noiseAt(t, p1, p2, w1, w2) {
  return 0.5 * (Math.sin(w1 * t + p1) + Math.sin(w2 * t + p2));
}

function qName() {
  let q = '';
  try { q = (window.SS && window.SS.quality) || window.SS_QUALITY || ''; } catch (e) { q = ''; }
  if (q === 'low' || q === 'ultra-low' || q === 'high') return q;
  return 'high';
}
function poolCap() {
  const q = qName();
  return q === 'ultra-low' ? 12 : q === 'low' ? 48 : 96; // A8: Ultra-low gets 12 sprites for cover/wall chips only
}
let softRound = null;
function puffTex() {
  if (softRound) return softRound;
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  // A6 tester: puffs read faint and the 10-20 cm chips not at all (alpha 0.4 at 40% radius left a ~6 cm dot of a 15 cm
  // chip). Dense core out to ~55% radius, then a soft edge; a few offset lobes so big puffs are not perfect discs.
  const blob = (x, y, r, a) => { const rg = g.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, 'rgba(255,255,255,' + a + ')'); rg.addColorStop(0.55, 'rgba(255,255,255,' + (a * 0.85) + ')');
    rg.addColorStop(0.8, 'rgba(255,255,255,' + (a * 0.35) + ')'); rg.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = rg; g.fillRect(0, 0, 32, 32); };
  blob(16, 16, 15, 1); blob(12, 13, 8, 0.5); blob(20, 18, 8, 0.5);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  softRound = t;
  return t;
}
function plasterish(surface) {
  if (!surface) return false;
  if (typeof surface === 'string') return /plaster/i.test(surface);
  try {
    const n = surface.name || surface.type || surface.mat || '';
    const ud = (surface.userData && (surface.userData.mat || surface.userData.kind || surface.userData.surface)) || '';
    return /plaster/i.test(String(n) + ' ' + String(ud));
  } catch (e) { return false; }
}

export function createFx3({ camera, audio, scene }) {
  const kicks = [];
  let time = 0;
  const dbg = { kicks: 0, last: null, muffle: 0, puffs: { live: 0, pool: 0, spawned: 0 }, skyline: { flashes: 0, tracers: 0, lastZ: null, inView: 0, occluded: 0, lastFlash: null, lastTracer: null } };
  if (typeof window !== 'undefined') {
    const SS = window.SS || (window.SS = {});
    SS.fx3 = dbg;
  }
  const scn = scene || (typeof window !== 'undefined' && window.SS && window.SS.scene) || (camera && camera.parent);
  const api = { puffs: null };
  let mesh = null, cap = 0, live = 0, spawned = 0, parts = null, inited = false;
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), vv = new THREE.Vector3(), ss = new THREE.Vector3(), cc = new THREE.Color();
  const _rd = new THREE.Vector3(), _hitN = new THREE.Vector3(), _gnd = new THREE.Vector3();
  const _sx = new THREE.Vector3(), _sy = new THREE.Vector3(), _sz = new THREE.Vector3(), _scam = new THREE.Vector3();
  let surfRay = null;

  function ensurePool() {
    if (inited) return mesh;
    inited = true;
    cap = poolCap();
    dbg.puffs.pool = cap;
    if (cap <= 0) return null;
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = new THREE.MeshBasicMaterial({
      map: puffTex(),
      transparent: true,
      depthWrite: false,
      // no vertexColors: PlaneGeometry has no colour attribute (it would read black); instanceColor tints on its own
      side: THREE.DoubleSide,
      fog: false, // A8: Low fog (0.022) hazed the tan puffs toward the pale sky colour at 15-20 m
    });
    mesh = new THREE.InstancedMesh(geo, mat, cap);
    mesh.frustumCulled = false;
    mesh.castShadow = mesh.receiveShadow = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    parts = new Array(cap);
    ss.set(0, 0, 0); qq.identity();
    for (let i = 0; i < cap; i++) {
      parts[i] = { i, on: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), col: new THREE.Color(), life: 0, max: 1, size0: 0, size1: 0, grav: 0, seen: 0, mark: -1, r0: 0, rDur: 0, minF: 2 };
      mesh.setMatrixAt(i, m4.compose(vv.set(0, 0, 0), qq, ss));
      mesh.setColorAt(i, cc.setRGB(1, 1, 1));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    if (scn) scn.add(mesh);
    api.puffs = mesh;
    return mesh;
  }
  function alloc() {
    if (!ensurePool()) return null;
    let slot = null;
    for (let i = 0; i < cap; i++) { if (!parts[i].on) { slot = parts[i]; break; } }
    if (!slot) {
      slot = parts[0];
      for (let i = 1; i < cap; i++) if (parts[i].life < slot.life) slot = parts[i];
    } else live++;
    slot.on = true;
    slot.seen = 0;
    slot.mark = -1;
    spawned++;
    return slot;
  }
  // A8 (A7 tester: Low wall dust 'a pale 25 px puff that fades within a few frames'): particle life ran on GAME time only
  // (~0.2 game-s per painted frame at ~1 fps), so a 1.5 s cloud grew/shrank out in ~5-7 frames. rDur (ms) = a REAL-time
  // floor on the lifetime and the grow/shrink curve; minF = painted frames it must be seen first.
  let emitRDur = 0, emitMinF = 2;
  function emit(point, vx, vy, vz, life, size0, size1, grav, color) {
    const p = alloc();
    if (!p) return;
    p.r0 = typeof performance !== 'undefined' ? performance.now() : 0; p.rDur = emitRDur; p.minF = emitMinF;
    // A8 tester (Low, ducked: a dust haze over the lower ~40% of the screen): cover-lip puffs are ~1 m from the eye, where a
    // 1.3-2 m billboard fills the view. Dust (not chips) shrinks inside 5 m of the camera, down to 0.2x at <= 1.4 m.
    if (camera && grav > -5) { const dc = camera.position.distanceTo(point), k = Math.max(0.2, Math.min(1, (dc - 0.5) / 4.5)); size0 *= k; size1 *= k; }
    p.pos.set(point.x, point.y, point.z);
    p.vel.set(vx, vy, vz);
    p.life = life; p.max = life;
    p.size0 = size0; p.size1 = size1; p.grav = grav;
    p.col.copy(color);
    mesh.setColorAt(p.i, p.col);
    mesh.instanceColor.needsUpdate = true;
    if (camera) qq.copy(camera.quaternion); else qq.identity();
    mesh.setMatrixAt(p.i, m4.compose(p.pos, qq, ss.set(size0, size0, size0)));
    mesh.instanceMatrix.needsUpdate = true;
  }
  function nrm(normal) {
    let x = 0, y = 1, z = 0;
    if (normal) { x = normal.x || 0; y = normal.y || 0; z = normal.z || 0; }
    const l = Math.hypot(x, y, z) || 1;
    return { x: x / l, y: y / l, z: z / l };
  }
  function sandCol(hex) {
    cc.setHex(hex);
    const k = 0.9 + Math.random() * 0.2;
    cc.r = Math.min(1, cc.r * k); cc.g = Math.min(1, cc.g * k); cc.b = Math.min(1, cc.b * k);
    return cc;
  }
  function dust(point, normal, n, hex) {
    if (!point || poolCap() <= 0) return;
    const N = n == null ? 6 : Math.max(0, n | 0);
    const d = nrm(normal);
    const base = hex != null ? hex : 0xc9b38a;
    for (let i = 0; i < N; i++) {
      const spd = 0.5 + Math.random() * 0.6, r = () => (Math.random() * 2 - 1) * 0.35;
      // A5 tester: Low puffs did not read at 10-20 m. 0.35 -> 1.3 m, 0.8-1.5 s, drag + slow sink (see updatePuffs), shrink at the end
      emit(point, (d.x + r()) * spd, (d.y + r()) * spd + 0.35, (d.z + r()) * spd, 0.8 + Math.random() * 0.7, 0.35, 1.3, -0.3, sandCol(base));
    }
    publish();
  }
  function debris(point, normal, n) {
    if (!point || poolCap() <= 0) return;
    const N = n == null ? 4 : Math.max(0, n | 0);
    const d = nrm(normal);
    cc.setHex(0x5a4a3a);
    for (let i = 0; i < N; i++) {
      const spd = 2.2 + Math.random() * 1.6, r = () => (Math.random() * 2 - 1) * 0.6;
      const sz = 0.1 + Math.random() * 0.1; // chunks: 10-20 cm (4-7 cm were sub-pixel at 15 m; ~2-4 px at 25 m on Low), bounce on the street
      emit(point, (d.x + r()) * spd, (d.y + r()) * spd + 1.2, (d.z + r()) * spd, 0.8 + Math.random() * 0.4, sz, sz, -9.8, cc);
    }
    publish();
  }
  const PUFF_FRAME_CAP = 24;
  let capFrame = null, capUsed = 0;
  // Impacts and near-miss dust share this many particles per rendered frame (window.SS.frameN).
  function take(n) {
    if (!(n > 0)) return 0;
    const f = puffFrame();
    if (f == null) return n;
    if (f !== capFrame) { capFrame = f; capUsed = 0; }
    const room = PUFF_FRAME_CAP - capUsed;
    if (room <= 0) return 0;
    const k = n < room ? n : room;
    capUsed += k;
    return k;
  }
  // A8 cause of the faint Low wall dust: art buildings are shot through an INVISIBLE collider set back to the facade's
  // median depth (world.js), so the impact point sat ~0.3-0.6 m INSIDE the visible facade (walldust15: collider 15.9 m,
  // painted facade 15.32 m) and the puffs were mostly hidden behind it. Move such a hit out to the first painted surface
  // on the line from the eye (the collider's own segment group only).
  let visRay = null; const _vEye = new THREE.Vector3(), _vDir = new THREE.Vector3(), _vOut = new THREE.Vector3(), _vN = new THREE.Vector3();
  function paintedHit(point, normal, surface) {
    if (!camera || !surface || !surface.material || surface.material.visible !== false || !surface.parent) return null;
    camera.getWorldPosition(_vEye); _vDir.subVectors(point, _vEye); const d = _vDir.length(); if (d < 0.5) return null; _vDir.divideScalar(d);
    if (!visRay) visRay = new THREE.Raycaster(); visRay.set(_vEye, _vDir); visRay.near = Math.max(0, d - 3); visRay.far = d + 0.05;
    const hh = visRay.intersectObject(surface.parent, true);
    for (const h of hh) { const o = h.object; if (o === surface || !o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) continue; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.visible === false) continue;
      let q = o, vis = true; while (q) { if (!q.visible) { vis = false; break; } q = q.parent; } if (!vis) continue;
      if (h.distance > d - 0.05) return null;
      _vOut.copy(h.point).addScaledVector(_vDir, -0.04); if (h.face) { _vN.copy(h.face.normal).transformDirection(o.matrixWorld); if (_vN.dot(_vDir) > 0) _vN.negate(); } else _vN.copy(_vDir).negate();
      if (typeof window !== 'undefined' && window.SS) window.SS.paintedHits = (window.SS.paintedHits | 0) + 1;
      return { point: _vOut, normal: _vN, surface: o }; }
    return null; }
  function impact(point, normal, surface) {
    if (!point || poolCap() <= 0) return;
    { const ph = paintedHit(point, normal, surface); if (ph) { point = ph.point; normal = ph.normal; surface = ph.surface; } }
    const wall = normal && Math.abs(normal.y || 0) < 0.5;
    const ultra = qName() === 'ultra-low', near = camera ? camera.position.distanceTo(point) < 4 : false;
    if (ultra) { // A8: Ultra-low = 3-4 dark chips only (cheap), bigger so they read at 0.75 x resolution
      const n = take(4); if (!n) return; const d = nrm(normal); cc.setHex(0x3a3028); emitRDur = 700; emitMinF = 2;
      for (let i = 0; i < n; i++) { const spd = 2 + Math.random() * 1.5, r = () => (Math.random() * 2 - 1) * 0.6, sz = 0.14 + Math.random() * 0.1;
        emit(point, (d.x + r()) * spd, (d.y + r()) * spd + 1.2, (d.z + r()) * spd, 0.7 + Math.random() * 0.3, sz, sz, -9.8, cc); }
      emitRDur = 0; emitMinF = 2; publish(); return; }
    const dustN = take(near ? 2 : wall ? 4 : 6);
    const debN = take(near ? 6 : 5); // chips stay: they are what reads at the cover lip
    const cloudN = wall && !near ? take(3) : 0;
    if (!dustN && !debN && !cloudN) return;
    const col = plasterish(surface) ? 0xd8cfc0 : 0xc9b38a;
    emitRDur = 1400; emitMinF = 3;
    if (dustN) dust(point, normal, dustN, col);
    emitRDur = 900; emitMinF = 3;
    if (debN) debris(point, normal, debN);
    emitRDur = 0; emitMinF = 2;
    if (cloudN) { // wall hit: a dense, darker cloud (3 stacked billboards) that hangs on the facade (A6: read faint at 10-12 m)
      // A8: 1.1 -> 2.1 m, held >= 2.6 s real time / 5 painted frames, and a real dark brown-grey (the old x0.72 was in
      // LINEAR space: only ~14% darker on screen, tan on a tan facade). Not fogged (material fog off).
      // readable at range: past 8 m the cloud grows with distance (x1.6 at 15 m, cap x2.2), so it stays ~70-90 px on a phone
      const dk = camera ? Math.max(1, Math.min(2.2, camera.position.distanceTo(point) / 9.5)) : 1;
      const d = nrm(normal); emitRDur = 2600; emitMinF = 5;
      for (let i = 0; i < cloudN; i++) {
        const c = cc.setHex(i === 0 ? 0x5e5244 : i === 1 ? 0x7a6a55 : 0x8f7d62);
        emit(vv.set(point.x + d.x * (0.15 + 0.1 * i) + (Math.random() - 0.5) * 0.3, point.y + (Math.random() - 0.5) * 0.3, point.z + d.z * (0.15 + 0.1 * i) + (Math.random() - 0.5) * 0.3),
          d.x * 0.35 * dk, 0.08, d.z * 0.35 * dk, 1.8 + Math.random() * 0.3, 1.1 * dk, 2.1 * dk, -0.1, c);
      }
      emitRDur = 0; emitMinF = 2;
      if (typeof window !== 'undefined' && window.SS) window.SS.wallPuffs = (window.SS.wallPuffs | 0) + 1;
      publish();
    }
  }
  function puffFrame() {
    try { return (window.SS && window.SS.frameN != null) ? (window.SS.frameN | 0) : null; } catch (e) { return null; }
  }
  function updatePuffs(pd) {
    const want = poolCap();
    dbg.puffs.pool = want;
    if (want <= 0) {
      if (mesh) mesh.visible = false;
      if (parts) {
        ss.set(0, 0, 0); if (camera) qq.copy(camera.quaternion); else qq.identity();
        for (let i = 0; i < cap; i++) {
          if (!parts[i].on) continue;
          parts[i].on = false;
          mesh.setMatrixAt(i, m4.compose(parts[i].pos, qq, ss));
        }
        if (live) mesh.instanceMatrix.needsUpdate = true;
      }
      live = 0; dbg.puffs.live = 0; dbg.puffs.spawned = spawned;
      return;
    }
    if (!ensurePool() || !live) { dbg.puffs.live = live; dbg.puffs.spawned = spawned; return; }
    mesh.visible = true;
    if (camera) qq.copy(camera.quaternion); else qq.identity();
    const fn = puffFrame(), nowR = typeof performance !== 'undefined' ? performance.now() : 0;
    for (let i = 0; i < cap; i++) {
      const p = parts[i];
      if (!p.on) continue;
      if (fn == null) p.seen++;
      else if (p.mark !== fn) { p.seen++; p.mark = fn; }
      p.vel.y += p.grav * pd;
      if (p.grav > -5) { const k = Math.max(0, 1 - 1.6 * pd); p.vel.x *= k; p.vel.y *= k; p.vel.z *= k; } // dust: air drag
      p.pos.x += p.vel.x * pd; p.pos.y += p.vel.y * pd; p.pos.z += p.vel.z * pd;
      if (p.grav <= -5 && p.pos.y < 0.03 && p.vel.y < 0) { p.pos.y = 0.03; p.vel.y *= -0.3; p.vel.x *= 0.5; p.vel.z *= 0.5; } // chunk bounce
      p.life -= pd;
      const rAge = p.rDur ? nowR - p.r0 : 0;
      if (p.life <= 0 && p.seen >= p.minF && rAge >= p.rDur) {
        p.on = false; live--;
        mesh.setMatrixAt(i, m4.compose(p.pos, qq, ss.set(0, 0, 0)));
        continue;
      }
      let u = p.max > 0 ? 1 - Math.max(p.life, 0) / p.max : 1;
      if (p.rDur) u = Math.min(u, rAge / p.rDur); // never shrink out before the real-time floor
      let s = p.size0 + (p.size1 - p.size0) * Math.min(1, Math.max(0, u));
      if (p.grav > -5 && u > 0.8) s *= Math.max(0, (1 - u) / 0.2); // no alpha per instance: shrink out instead of popping
      mesh.setMatrixAt(i, m4.compose(p.pos, qq, ss.set(s, s, s)));
    }
    mesh.instanceMatrix.needsUpdate = true;
    dbg.puffs.live = live; dbg.puffs.spawned = spawned;
  }

  // Distant skyline shots. Own 6-slot pools, not the puff cap. Ultra-low still flashes; tracers stay off.
  // A5 shots, on paper (camera y 1.7 looking down the street (-Z), vfov 70, phone ~2.16:1 so hfov ~113; facades at x +-6.2,
// 11-16 m tall; the street end closes the view at ~7-8 deg above the horizon). A flash at 100 m, x +-10, y 10-22 sat only
// 3-11 deg up, i.e. behind the street-end rooflines or, off-axis, behind the near facades (which cover any azimuth beyond
// atan(6.2 / dz)); and 2.4-5 m at 100 m is 8-16 px tall on a 473 px phone view. So: aim by angle, not metres. Azimuth within
// +-4.5 deg of the street axis (the corridor that stays open to 150 m), elevation 9-17 deg (clear of the street end and the
// rooflines), 60-150 m out; size scaled with distance to ~30 px, plus a 2.6x soft glow. Spots that a world ray finds blocked
// are re-rolled (3 tries). Tracers start at the same far distance on one side of the corridor and run across it.
const SKY_N = 12, TR_W_K = 0.005, TR_SPEED = 170, SKY_AZ = 0.078, SKY_EL0 = 0.157, SKY_EL1 = 0.297, TR_MIN_D = 40;
  let skyInited = false, glowMesh = null, hemi = null, hemiBase = 0, hemiT = 0, flashMesh = null, tracerMesh = null, flashParts = null, tracerParts = null;
  let flashLive = 0, tracerLive = 0;
  function ensureSky() {
    if (skyInited) return flashMesh;
    skyInited = true;
    const geo = new THREE.PlaneGeometry(1, 1);
    // normal blending, not additive: additive on the bright desert sky washed the flash out to nothing (A5 shots)
    const flashMat = new THREE.MeshBasicMaterial({
      map: puffTex(),
      color: 0xffc060,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      fog: false,
      side: THREE.DoubleSide,
    });
    const tracerMat = new THREE.MeshBasicMaterial({
      color: 0xffd890,
      toneMapped: false,
      transparent: true,
      depthWrite: false,
      fog: false,
      opacity: 0.95,
      side: THREE.DoubleSide,
    });
    const glowMat = new THREE.MeshBasicMaterial({ map: puffTex(), color: 0xffb050, toneMapped: false, transparent: true, opacity: 0.35, depthWrite: false, fog: false, side: THREE.DoubleSide });
    glowMesh = new THREE.InstancedMesh(geo, glowMat, SKY_N);
    glowMesh.frustumCulled = false; glowMesh.castShadow = glowMesh.receiveShadow = false; glowMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    glowMesh.visible = false; glowMesh.renderOrder = 1;
    flashMesh = new THREE.InstancedMesh(geo, flashMat, SKY_N);
    flashMesh.renderOrder = 2;
    tracerMesh = new THREE.InstancedMesh(geo, tracerMat, SKY_N);
    flashParts = new Array(SKY_N);
    tracerParts = new Array(SKY_N);
    ss.set(0, 0, 0); qq.identity();
    for (let i = 0; i < SKY_N; i++) {
      flashParts[i] = { i, on: false, pos: new THREE.Vector3(), life: 0, size: 1, seen: 0, mark: -1 };
      tracerParts[i] = { i, on: false, pos: new THREE.Vector3(), dir: new THREE.Vector3(), life: 0, len: 6, w: 0.5, speed: TR_SPEED, seen: 0, mark: -1 };
      flashMesh.setMatrixAt(i, m4.compose(vv.set(0, 0, 0), qq, ss)); glowMesh.setMatrixAt(i, m4);
      tracerMesh.setMatrixAt(i, m4);
    }
    flashMesh.instanceMatrix.needsUpdate = tracerMesh.instanceMatrix.needsUpdate = true;
    flashMesh.frustumCulled = tracerMesh.frustumCulled = false;
    flashMesh.castShadow = flashMesh.receiveShadow = false;
    tracerMesh.castShadow = tracerMesh.receiveShadow = false;
    flashMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    tracerMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    flashMesh.visible = tracerMesh.visible = false;
    if (scn) { scn.add(glowMesh); scn.add(flashMesh); scn.add(tracerMesh);
      scn.traverse((o) => { if (!hemi && o.isHemisphereLight) hemi = o; }); }
    return flashMesh;
  }
  function grab(parts) {
    for (let i = 0; i < SKY_N; i++) if (!parts[i].on) return parts[i];
    let slot = parts[0];
    for (let i = 1; i < SKY_N; i++) if (parts[i].life < slot.life) slot = parts[i];
    return slot;
  }
  // Spawn is after fx.update, and that frame is drawn. Pin mark to it so seen counts later frames only.
  function arm(slot) {
    const fn0 = puffFrame();
    slot.on = true;
    slot.seen = 0;
    slot.mark = fn0 == null ? -1 : fn0;
  }
  function noteSeen(p, fn) {
    if (fn == null) p.seen++;
    else if (p.mark !== fn) { p.seen++; p.mark = fn; }
  }
  function writeTracer(slot) {
    _sy.copy(slot.dir);
    if (camera) _scam.copy(camera.position).sub(slot.pos); else _scam.set(0, 1, 0);
    if (_scam.lengthSq() < 1e-8) _scam.set(0, 1, 0);
    _sx.crossVectors(_sy, _scam);
    if (_sx.lengthSq() < 1e-8) {
      _sx.crossVectors(_sy, _scam.set(0, 1, 0));
      if (_sx.lengthSq() < 1e-8) _sx.crossVectors(_sy, _scam.set(1, 0, 0));
    }
    _sx.normalize();
    _sz.crossVectors(_sx, _sy).normalize();
    m4.makeBasis(_sx, _sy, _sz);
    m4.scale(ss.set(slot.w, slot.len, 1));
    m4.setPosition(slot.pos);
    tracerMesh.setMatrixAt(slot.i, m4);
  }
  // Screen readout: NDC x/y, in view (in front, |ndc| <= 1), approx px height of the flash (debug + test).
  const _sp = new THREE.Vector3();
  function project(p, size) {
    _sp.copy(p).project(camera);
    const inView = _sp.z < 1 && Math.abs(_sp.x) <= 1 && Math.abs(_sp.y) <= 1;
    const h = (typeof window !== 'undefined' && window.innerHeight) || 600;
    const d = camera.position.distanceTo(p), fy = Math.tan((camera.fov || 70) * Math.PI / 360);
    return { x: +_sp.x.toFixed(3), y: +_sp.y.toFixed(3), inView, px: size ? Math.round(size / (d * fy) * h * 0.5) : 0, d: Math.round(d) };
  }
  let skyRay = null; const _sd = new THREE.Vector3();
  function blocked(p) {
    const meshes = (typeof window !== 'undefined' && window.SS && window.SS.world && window.SS.world.colliders) || null;
    if (!meshes || !meshes.length) return false;
    if (!skyRay) skyRay = new THREE.Raycaster();
    _sd.copy(p).sub(camera.position); const len = _sd.length(); if (len < 1e-3) return false;
    skyRay.set(camera.position, _sd.multiplyScalar(1 / len)); skyRay.far = len - 1;
    return skyRay.intersectObjects(meshes, false).length > 0;
  }
  const _fp = new THREE.Vector3();
  function skylineShot(near) {
    if (!camera) return;
    let n = +near;
    if (!(n >= 0)) n = 0; else if (n > 1) n = 1;
    ensureSky();
    // street axis is -Z from the street centre (x 0); distance ahead of the camera 150 m far -> 60 m close
    const c = camera.position, dz = 150 - 90 * n;
    let occl = true;
    for (let k = 0; k < 3 && occl; k++) {
      const az = (Math.random() * 2 - 1) * SKY_AZ, el = SKY_EL0 + Math.random() * (SKY_EL1 - SKY_EL0);
      _fp.set(Math.tan(az) * dz, c.y + Math.tan(el) * dz, c.z - dz);
      occl = blocked(_fp);
    }
    const z = _fp.z;
    const slot = grab(flashParts);
    if (!slot.on) flashLive++;
    arm(slot);
    slot.life = 0.12;
    slot.size = dz * (0.07 + 0.03 * n); // ~25-35 px tall on a 473 px phone view at any distance
    slot.pos.copy(_fp);
    if (camera) qq.copy(camera.quaternion); else qq.identity();
    writeFlash(slot, 1);
    flashMesh.visible = glowMesh.visible = true;
    dbg.skyline.flashes++;
    dbg.skyline.lastZ = z;
    const fs = project(slot.pos, slot.size);
    fs.occluded = occl; dbg.skyline.lastFlash = fs;
    if (fs.inView && !occl) dbg.skyline.inView++;
    if (occl) dbg.skyline.occluded++;
    // light flicker: High only, near fire only, a brief hemisphere bump (no new light, so no shader recompile)
    if (hemi && n > 0.5 && qName() === 'high') { if (hemiT <= 0) hemiBase = hemi.intensity; hemiT = 0.07; hemi.intensity = hemiBase * (1 + 0.1 * n); }
    if (qName() !== 'ultra-low' && Math.random() < 0.6) {
      const t = grab(tracerParts);
      if (!t.on) tracerLive++;
      arm(t);
      const side = Math.random() < 0.5 ? -1 : 1;
      const td = dz * (0.9 + Math.random() * 0.25);
      // start just outside one edge of the corridor, run across it (mostly sideways, a little toward/away, slight drop)
      t.pos.set(side * Math.tan(SKY_AZ * 1.2) * td, c.y + Math.tan(SKY_EL0 + Math.random() * 0.08) * td, c.z - td);
      // A5 tester: tracers showed for one frame. Visible 0.4-0.6 s: the streak's speed is set so it crosses the open corridor
      // in its life (far rounds read slow, as they would), with a longer streak (~35-45 px)
      t.dir.set(-side, -0.04 - Math.random() * 0.05, (Math.random() * 2 - 1) * 0.45).normalize();
      t.len = td * (0.11 + Math.random() * 0.04); t.w = Math.max(0.35, td * TR_W_K);
      t.life = 0.4 + Math.random() * 0.2;
      t.speed = (2 * Math.tan(SKY_AZ * 1.2) * td) / Math.max(0.2, Math.abs(t.dir.x)) / t.life;
      writeTracer(t);
      tracerMesh.instanceMatrix.needsUpdate = true;
      tracerMesh.visible = true;
      dbg.skyline.tracers++;
      dbg.skyline.lastTracer = { start: project(t.pos, 0), end: project(_fp.copy(t.dir).multiplyScalar(t.speed * t.life).add(t.pos), 0), life: +t.life.toFixed(2) };
    }
  }
  function writeFlash(p, k) {
    flashMesh.setMatrixAt(p.i, m4.compose(p.pos, qq, ss.set(p.size * k, p.size * k, p.size * k)));
    glowMesh.setMatrixAt(p.i, m4.compose(p.pos, qq, ss.set(p.size * 2.6 * k, p.size * 2.6 * k, p.size * 2.6 * k)));
    flashMesh.instanceMatrix.needsUpdate = glowMesh.instanceMatrix.needsUpdate = true;
  }
  function updateSky(pd) {
    if (hemiT > 0) { hemiT -= pd; if (hemiT <= 0 && hemi) hemi.intensity = hemiBase; }
    if (!skyInited || (flashLive === 0 && tracerLive === 0)) return;
    const fn = puffFrame();
    if (flashLive > 0) {
      if (camera) qq.copy(camera.quaternion); else qq.identity();
      for (let i = 0; i < SKY_N; i++) {
        const p = flashParts[i];
        if (!p.on) continue;
        noteSeen(p, fn);
        p.life -= pd;
        if (p.life <= 0 && p.seen >= 2) {
          p.on = false; flashLive--;
          writeFlash(p, 0);
          continue;
        }
        writeFlash(p, 0.75 + 0.25 * Math.random()); // muzzle flicker
      }
      if (flashLive === 0) flashMesh.visible = glowMesh.visible = false;
    }
    if (tracerLive > 0) {
      for (let i = 0; i < SKY_N; i++) {
        const p = tracerParts[i];
        if (!p.on) continue;
        noteSeen(p, fn);
        const step = p.speed * pd;
        p.pos.x += p.dir.x * step; p.pos.y += p.dir.y * step; p.pos.z += p.dir.z * step;
        p.life -= pd;
        if ((p.life <= 0 && p.seen >= 2) || (camera && p.pos.distanceToSquared(camera.position) < TR_MIN_D * TR_MIN_D)) { // never near the camera
          p.on = false; tracerLive--;
          tracerMesh.setMatrixAt(i, m4.compose(p.pos, qq, ss.set(0, 0, 0)));
          continue;
        }
        writeTracer(p);
      }
      tracerMesh.instanceMatrix.needsUpdate = true;
      if (tracerLive === 0) tracerMesh.visible = false;
    }
  }

  function publish() {
    dbg.kicks = kicks.length;
    let m = 0;
    try { if (audio && audio.muffleLevel) m = audio.muffleLevel() || 0; } catch (e) { m = 0; }
    dbg.muffle = m;
    dbg.puffs.live = live;
    dbg.puffs.pool = poolCap();
    dbg.puffs.spawned = spawned;
  }

  function kick(kind, strength) {
    const spec = KIND[kind];
    if (!spec) return;
    const str = strength == null ? 1 : +strength;
    if (!(str > 0)) return;
    const ph = new Float64Array(10);
    for (let i = 0; i < 10; i++) ph[i] = Math.random() * Math.PI * 2;
    // A8 (tester A7: no shake in any captured frame): a kick holds full strength for >= 2 painted frames AND >= 250 ms real
    // time before it starts to decay (at ~1 fps the old game-time decay was over inside one frame).
    const fN = (typeof window !== 'undefined' && window.SS) ? (window.SS.frameN | 0) : 0;
    kicks.push({ kind, spec, str, age: 0, ph, held: false, f0: fN, r0: (typeof performance !== 'undefined' ? performance.now() : 0) });
    dbg.last = { kind, t: (typeof performance !== 'undefined' ? performance.now() : 0) };
    publish();
  }

  function sample(k) {
    const env = Math.exp(-k.spec.decay * k.age) * k.str;
    const n = (i) => noiseAt(time, k.ph[i], k.ph[i + 5], W1[i], W2[i]);
    const pitchN = k.spec.up ? (1 + 0.12 * n(0)) : n(0); // shot: ~0.25 deg up, small wobble, never flips down
    return {
      pitch: k.spec.pitch * env * pitchN,
      yaw: k.spec.yaw * env * n(1),
      roll: k.spec.roll * env * n(2),
      x: k.spec.x * env * n(3),
      y: k.spec.y * env * n(4),
    };
  }

  function update(dt) {
    const d = dt > 0 ? dt : 0;
    time += d;
    const fN = (typeof window !== 'undefined' && window.SS) ? (window.SS.frameN | 0) : 0, rN = typeof performance !== 'undefined' ? performance.now() : 0;
    for (let i = kicks.length - 1; i >= 0; i--) {
      const k = kicks[i];
      if (!k.held) { if (fN - k.f0 >= 3 && rN - k.r0 >= 250) k.held = true; else continue; } // frames f0+1 and f0+2 paint at full strength
      k.age += d;
      if (kicks[i].age * kicks[i].spec.decay > 6.5) kicks.splice(i, 1); // exp(-6.5) ~ 0.0015
    }
    const pd = d > 0.1 ? 0.1 : d;
    updatePuffs(pd);
    updateSky(pd);
    publish();
  }

  function offsets() {
    const s = reduceScale();
    let pitch = 0, yaw = 0, roll = 0, x = 0, y = 0;
    for (let i = 0; i < kicks.length; i++) {
      const o = sample(kicks[i]);
      pitch += o.pitch; yaw += o.yaw; roll += o.roll; x += o.x; y += o.y;
    }
    pitch *= s; yaw *= s; roll *= s; x *= s; y *= s;
    const rot = Math.hypot(pitch, yaw, roll);
    if (rot > ROT_CAP) { const k = ROT_CAP / rot; pitch *= k; yaw *= k; roll *= k; }
    const pos = Math.hypot(x, y);
    if (pos > POS_CAP) { const k = POS_CAP / pos; x *= k; y *= k; }
    return { pitch, yaw, roll, x, y };
  }

  function blast(pos) {
    if (!pos || !camera) return;
    const c = camera.position;
    const dx = pos.x - c.x, dy = pos.y - c.y, dz = pos.z - c.z;
    const d = Math.hypot(dx, dy, dz);
    const shake = 1 - d / 12;
    if (shake > 0) kick('blast', shake);
    if (d < 10 && audio && typeof audio.muffle === 'function') audio.muffle(1 - d / 10);
    publish();
  }

  function nearMiss(point, dir) {
    let dx = 0, dy = 0, dz = 0;
    if (dir) { dx = +dir.x || 0; dy = +dir.y || 0; dz = +dir.z || 0; }
    const inCover = typeof window !== 'undefined' && window.SS && window.SS.input && window.SS.input.cover;
    kick('impact', inCover ? 1.6 : 1.1); // A6: 0.6 (~0.17 deg) was not felt; still well under the blast shake
    // A6: there never was an audio.whizz, so near misses were silent and unlogged; use the supersonic crack (+ whizz sweep)
    if (audio && typeof audio.whizz === 'function') audio.whizz(point); else if (audio && typeof audio.crack === 'function' && point) audio.crack(point);
    if (audio && typeof audio.log === 'function') audio.log('near miss', (typeof window !== 'undefined' && window.SS && window.SS.input && window.SS.input.cover) ? 'in cover' : '');
    if (typeof window !== 'undefined' && window.SS) { window.SS.nearMisses = (window.SS.nearMisses | 0) + 1; if (window.SS.input && window.SS.input.cover) window.SS.coverNearMisses = (window.SS.coverNearMisses | 0) + 1; }
    if (!point || poolCap() <= 0 || qName() === 'ultra-low') return; // Ultra-low: chips on impacts only, no near-miss dust
    const n = take(inCover ? 3 : 6); // A8: ducked near misses were a big part of the Low haze
    if (!n) return;
    const px = +point.x || 0, py = +point.y || 0, pz = +point.z || 0;
    const len = Math.hypot(dx, dy, dz);
    const meshes = (typeof window !== 'undefined' && window.SS && window.SS.world && window.SS.world.colliders) || null;
    // 2 m further along the round from the closest point; no hit falls back to the ground under that point.
    if (len > 1e-8 && meshes && meshes.length) {
      if (!surfRay) surfRay = new THREE.Raycaster();
      _rd.set(dx / len, dy / len, dz / len);
      _gnd.set(px, py, pz);
      surfRay.set(_gnd, _rd);
      surfRay.far = 2;
      const hit = surfRay.intersectObjects(meshes, false)[0];
      if (hit) {
        if (hit.face) {
          _hitN.copy(hit.face.normal).transformDirection(hit.object.matrixWorld);
          if (_hitN.lengthSq() > 1e-8) { dust(hit.point, _hitN, n); return; }
        }
        dust(hit.point, _hitN.set(-_rd.x, -_rd.y, -_rd.z), n);
        return;
      }
    }
    dust(_gnd.set(px, 0, pz), _hitN.set(0, 1, 0), n);
  }

  publish();
  api.kick = kick; api.update = update; api.offsets = offsets; api.blast = blast; api.nearMiss = nearMiss;
  api.dust = dust; api.debris = debris; api.impact = impact; api.skylineShot = skylineShot;
  try { Promise.resolve().then(() => { ensurePool(); publish(); }); } catch (e) { ensurePool(); publish(); }
  return api;
}
