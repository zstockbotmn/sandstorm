// Step 3a sensory core. Only constructed when ?fx=3 is set, so the rest of the game never calls it.
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

export function createFx3({ camera, audio }) {
  const kicks = [];
  let time = 0;
  const dbg = { kicks: 0, last: null, muffle: 0 };
  if (typeof window !== 'undefined') {
    const SS = window.SS || (window.SS = {});
    SS.fx3 = dbg;
  }

  function publish() {
    dbg.kicks = kicks.length;
    let m = 0;
    try { if (audio && audio.muffleLevel) m = audio.muffleLevel() || 0; } catch (e) { m = 0; }
    dbg.muffle = m;
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
  return { kick, update, offsets, blast, nearMiss };
}
