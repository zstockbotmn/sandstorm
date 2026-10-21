// Per-bone hit reaction: critically damped springs, no per-frame allocation.
import * as THREE from 'three';
const _ax = new THREE.Vector3();
const _perp = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
// Critically damped, sub-stepped at 1/60 s (measured): arm kick 54 peaks ~36 deg, back to 10% in 0.32 s; torso spine 23 -> 15 deg; leg buckle 30 -> 0.89, 0.55 s.
const W_ARM = 16, W_SPINE = 16, W_BUCKLE = 9;
const PEAK_ARM = 0.55, PEAK_SPINE = 0.3, PEAK_BUCKLE = 1, EPS = 1e-3;
export function createReactState() {
  return {
    arm: { x: 0, v: 0 }, spine: { x: 0, v: 0 }, buckle: { x: 0, v: 0 },
    zone: null, side: 1, dir: new THREE.Vector3(),
    stepLeft: 0, stepDir: new THREE.Vector3(), w: 0,
  };
}

// Semi-implicit Euler on x'' = -2*w*v - w*w*x, then clamp x to ±peak.
function spring(s, w, peak, h) {
  const a = -2 * w * s.v - w * w * s.x;
  s.v += a * h;
  s.x += s.v * h;
  if (s.x > peak) s.x = peak;
  else if (s.x < -peak) s.x = -peak;
}
function idle(s) {
  return Math.abs(s.x) < EPS && Math.abs(s.v) < EPS;
}
export function kickReact(st, zone, dir, rightWorld) {
  st.zone = zone;
  // Flatten the bullet; a vertical shot falls back to +Z.
  st.dir.copy(dir);
  st.dir.y = 0;
  if (st.dir.lengthSq() < 1e-8) st.dir.set(0, 0, 1);
  else st.dir.normalize();
  if (zone.endsWith('L')) st.side = -1;
  else if (zone.endsWith('R')) st.side = 1;
  else st.side = Math.sign(dir.dot(rightWorld)) || 1;
  // Stack on velocity so repeat hits add; position clamps in stepReact.
  if (zone.startsWith('arm')) st.arm.v += 54;
  st.spine.v += zone === 'torso' ? 23 : 7;
  st.buckle.v += zone.startsWith('leg') ? 30 : 0;
  if (zone === 'torso') {
    st.stepLeft = 0.3 + Math.random() * 0.1;
    st.stepDir.copy(st.dir);
  } else if (zone.startsWith('leg')) {
    st.stepLeft = 0.18;
    // Sideways stumble: horizontal perp of dir, aimed toward st.side.
    _perp.crossVectors(_up, st.dir);
    if (_perp.dot(rightWorld) * st.side < 0) _perp.negate();
    if (_perp.lengthSq() < 1e-8) _perp.copy(rightWorld).multiplyScalar(st.side);
    st.stepDir.copy(_perp);
    st.stepDir.y = 0;
    if (st.stepDir.lengthSq() > 1e-8) st.stepDir.normalize();
  }
}
export function stepReact(st, dt) {
  let t = dt < 0 ? 0 : dt > 0.1 ? 0.1 : dt;
  const total = t;
  // Sub-step at <= 1/60 s so a long frame cannot blow the springs.
  while (t > 1e-8) {
    const h = t > 1 / 60 ? 1 / 60 : t;
    spring(st.arm, W_ARM, PEAK_ARM, h);
    spring(st.spine, W_SPINE, PEAK_SPINE, h);
    spring(st.buckle, W_BUCKLE, PEAK_BUCKLE, h);
    t -= h;
    const wi = Math.max(Math.abs(st.arm.x) / PEAK_ARM, Math.abs(st.spine.x) / PEAK_SPINE, st.buckle.x); if (wi > (st.wPeak || 0)) st.wPeak = Math.min(1, wi); // in-sim peak (tests sample per frame)
  }
  if (st.stepLeft < 0) st.stepLeft = 0;
  const move = Math.min(st.stepLeft, total * (st.stepLeft > 0 ? 0.9 : 0));
  st.stepLeft -= move;
  const wound = Math.max(Math.abs(st.arm.x) / PEAK_ARM, Math.abs(st.spine.x) / PEAK_SPINE, st.buckle.x);
  st.w = wound < 0 ? 0 : wound > 1 ? 1 : wound;
  // At rest, zero the channels and drop the zone latch.
  if (idle(st.arm) && idle(st.spine) && idle(st.buckle) && st.stepLeft <= 0) {
    st.arm.x = st.arm.v = st.spine.x = st.spine.v = st.buckle.x = st.buckle.v = 0;
    st.stepLeft = 0;
    st.w = 0;
    st.zone = null;
  }
  return move;
}

export function applyReact(st, bones, bendBone, upWorld, rightWorld, fwdWorld, level) {
  if (level < 1) return 0;
  // up × bullet tips the top of a bone along the shot; fwd is the fallback.
  _ax.crossVectors(upWorld, st.dir);
  if (_ax.lengthSq() < 1e-8) _ax.crossVectors(upWorld, fwdWorld);
  if (_ax.lengthSq() < 1e-8) _ax.copy(rightWorld);
  if (_ax.lengthSq() > 1e-8) _ax.normalize();
  const sA = bones.Spine01 || bones.Spine;
  const sB = bones.Spine02 || bones.Spine;
  if (sA) bendBone(sA, _ax, st.spine.x * 0.6);
  if (sB) bendBone(sB, _ax, st.spine.x * 0.4);
  if (sA) bendBone(sA, upWorld, -st.side * st.spine.x * 0.25);
  if (level === 2 && st.zone) {
    const left = st.zone.endsWith('L');
    if (st.zone.startsWith('arm')) {
      const upper = left ? bones.LeftArm : bones.RightArm;
      const fore = left ? bones.LeftForeArm : bones.RightForeArm;
      if (upper) bendBone(upper, _ax, st.arm.x);
      if (fore) bendBone(fore, _ax, st.arm.x * 0.6);
    } else if (st.zone.startsWith('leg')) {
      const b = st.buckle.x;
      const upLeg = left ? bones.LeftUpLeg : bones.RightUpLeg;
      const leg = left ? bones.LeftLeg : bones.RightLeg;
      if (upLeg) bendBone(upLeg, rightWorld, -0.35 * b);
      if (leg) bendBone(leg, rightWorld, 0.7 * b);
    }
  }
  // Meters the caller sinks the model root.
  return level === 2 ? 0.09 * st.buckle.x + 0.03 * Math.abs(st.spine.x) / PEAK_SPINE : 0;
}
