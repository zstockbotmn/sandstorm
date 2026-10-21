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
  return q === 'ultra-low' ? 0 : q === 'low' ? 48 : 96;
}
function puffTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const g = c.getContext('2d');
  const rg = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  rg.addColorStop(0, 'rgba(255,255,255,0.95)');
  rg.addColorStop(0.4, 'rgba(255,255,255,0.4)');
  rg.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rg; g.fillRect(0, 0, 32, 32);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
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
  const dbg = { kicks: 0, last: null, muffle: 0, puffs: { live: 0, pool: 0, spawned: 0 } };
  if (typeof window !== 'undefined') {
    const SS = window.SS || (window.SS = {});
    SS.fx3 = dbg;
  }
  const scn = scene || (typeof window !== 'undefined' && window.SS && window.SS.scene) || (camera && camera.parent);
  const api = { puffs: null };
  let mesh = null, cap = 0, live = 0, spawned = 0, parts = null, inited = false;
  const m4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), vv = new THREE.Vector3(), ss = new THREE.Vector3(), cc = new THREE.Color();

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
    });
    mesh = new THREE.InstancedMesh(geo, mat, cap);
    mesh.frustumCulled = false;
    mesh.castShadow = mesh.receiveShadow = false;
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    parts = new Array(cap);
    ss.set(0, 0, 0); qq.identity();
    for (let i = 0; i < cap; i++) {
      parts[i] = { i, on: false, pos: new THREE.Vector3(), vel: new THREE.Vector3(), col: new THREE.Color(), life: 0, max: 1, size0: 0, size1: 0, grav: 0, seen: 0, mark: -1 };
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
  function emit(point, vx, vy, vz, life, size0, size1, grav, color) {
    const p = alloc();
    if (!p) return;
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
      const spd = 0.6 + Math.random() * 0.6;
      emit(point, d.x * spd, d.y * spd + 0.4, d.z * spd, 0.6 + Math.random() * 0.3, 0.15, 0.6, -0.6, sandCol(base));
    }
    publish();
  }
  function debris(point, normal, n) {
    if (!point || poolCap() <= 0) return;
    const N = n == null ? 4 : Math.max(0, n | 0);
    const d = nrm(normal);
    cc.setHex(0x5a4a3a);
    for (let i = 0; i < N; i++) {
      const spd = 2 + Math.random();
      const sz = 0.04 + Math.random() * 0.03;
      emit(point, d.x * spd, d.y * spd, d.z * spd, 0.5, sz, sz, -9.8, cc);
    }
    publish();
  }
  function impact(point, normal, surface) {
    dust(point, normal, 6, plasterish(surface) ? 0xd8cfc0 : 0xc9b38a);
    debris(point, normal, 4);
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
    const fn = puffFrame();
    for (let i = 0; i < cap; i++) {
      const p = parts[i];
      if (!p.on) continue;
      if (fn == null) p.seen++;
      else if (p.mark !== fn) { p.seen++; p.mark = fn; }
      p.vel.y += p.grav * pd;
      p.pos.x += p.vel.x * pd; p.pos.y += p.vel.y * pd; p.pos.z += p.vel.z * pd;
      p.life -= pd;
      if (p.life <= 0 && p.seen >= 2) {
        p.on = false; live--;
        mesh.setMatrixAt(i, m4.compose(p.pos, qq, ss.set(0, 0, 0)));
        continue;
      }
      const u = p.max > 0 ? 1 - Math.max(p.life, 0) / p.max : 1;
      const s = p.size0 + (p.size1 - p.size0) * Math.min(1, Math.max(0, u));
      mesh.setMatrixAt(i, m4.compose(p.pos, qq, ss.set(s, s, s)));
    }
    mesh.instanceMatrix.needsUpdate = true;
    dbg.puffs.live = live; dbg.puffs.spawned = spawned;
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
    kicks.push({ kind, spec, str, age: 0, ph });
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
    for (let i = kicks.length - 1; i >= 0; i--) {
      kicks[i].age += d;
      if (kicks[i].age * kicks[i].spec.decay > 6.5) kicks.splice(i, 1); // exp(-6.5) ~ 0.0015
    }
    updatePuffs(d > 0.1 ? 0.1 : d);
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

  function nearMiss(point) {
    kick('impact', 0.6);
    if (audio && typeof audio.whizz === 'function') audio.whizz(point);
  }

  publish();
  api.kick = kick; api.update = update; api.offsets = offsets; api.blast = blast; api.nearMiss = nearMiss;
  api.dust = dust; api.debris = debris; api.impact = impact;
  try { Promise.resolve().then(() => { ensurePool(); publish(); }); } catch (e) { ensurePool(); publish(); }
  return api;
}
