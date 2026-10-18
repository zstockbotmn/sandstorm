// Check fighter.loco.anim.glb on the Meshy rig (node, no browser).
// Foot-slide / pose-snap check. Per clip: maxΔ° = largest bone rotation between consecutive samples (pose snap / flip),
// wrap° = last vs first frame per bone (loop seam snap), driftcm = planted-foot slide against the clip's meta velocity.
// Usage: node tools/loco-check.mjs [--json]
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

globalThis.self = globalThis;

const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RIG = path.join(R, 'assets/models/fighter1.rig.glb');
const ANIM = path.join(R, 'assets/models/fighter.loco.anim.glb');
const META = path.join(R, 'assets/models/fighter.loco.meta.json');
const SAMPLES = 60;
const MAX_FLIP = 40;
const MAX_DRIFT = 5;
const MAX_WRAP = 3; const JSON_OUT = process.argv.includes('--json'); const rows = [];

await MeshoptDecoder.ready;
const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

function loadGltf(file) {
  const buf = fs.readFileSync(file);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => loader.parse(ab, path.dirname(file) + '/', resolve, reject));
}

function qAngle(a, b) {
  let d = Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w);
  if (d > 1) d = 1;
  return 2 * Math.acos(d) * 180 / Math.PI;
}

function unwrap(yaws) {
  const out = [yaws[0] || 0];
  for (let i = 1; i < yaws.length; i++) {
    let d = yaws[i] - yaws[i - 1];
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    out.push(out[i - 1] + d);
  }
  return out;
}

const rigGltf = await loadGltf(RIG);
const animGltf = await loadGltf(ANIM);
const meta = JSON.parse(fs.readFileSync(META, 'utf8'));
const root = rigGltf.scene;
root.updateMatrixWorld(true);

const BONES = ['Hips', 'Spine02', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'LeftToeBase',
  'RightUpLeg', 'RightLeg', 'RightFoot', 'RightToeBase'];
const bones = {};
for (const n of BONES) {
  bones[n] = root.getObjectByName(n);
  if (!bones[n]) console.warn('missing bone', n);
}
const bindQ = {}, bindP = {};
for (const n of BONES) {
  bindQ[n] = bones[n].quaternion.clone();
  bindP[n] = bones[n].position.clone();
}

function restore() {
  for (const n of BONES) {
    bones[n].quaternion.copy(bindQ[n]);
    bones[n].position.copy(bindP[n]);
  }
  root.position.set(0, 0, 0);
  root.updateMatrixWorld(true);
}

function poseClip(mixer, clip, t) {
  mixer.setTime(Math.max(0, Math.min(t, clip.duration || 0)));
  root.updateMatrixWorld(true);
}

const wp = new THREE.Vector3();
const wq = new THREE.Quaternion();
let fails = 0;

console.log(
  'clip'.padEnd(12), 'dur'.padStart(6), 'maxΔ°'.padStart(8), 'driftcm'.padStart(8),
  'minYcm'.padStart(8), 'fwd'.padStart(7), 'right'.padStart(7), 'turn'.padStart(7), 'ok',
);

for (const clip of animGltf.animations) {
  const m = meta[clip.name] || { fwd: 0, right: 0, turnRate: 0 };
  const dur = clip.duration || 0;
  const n = SAMPLES;
  const qs = [];
  const lFoot = [], rFoot = [], lToe = [], rToe = [], yaws = [];
  let maxDelta = 0, minY = Infinity;
  restore();
  const mixer = new THREE.AnimationMixer(root);
  const action = mixer.clipAction(clip);
  action.play();
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0 : dur * (i / (n - 1));
    poseClip(mixer, clip, t);
    const frameQ = {};
    for (const name of BONES) {
      frameQ[name] = bones[name].quaternion.clone();
      if (i > 0) maxDelta = Math.max(maxDelta, qAngle(qs[i - 1][name], frameQ[name]));
    }
    qs.push(frameQ);
    bones.LeftFoot.getWorldPosition(wp); lFoot.push(wp.clone());
    bones.RightFoot.getWorldPosition(wp); rFoot.push(wp.clone());
    bones.LeftToeBase.getWorldPosition(wp); lToe.push(wp.clone());
    bones.RightToeBase.getWorldPosition(wp); rToe.push(wp.clone());
    minY = Math.min(minY, lFoot[i].y, rFoot[i].y, lToe[i].y, rToe[i].y);
    bones.Hips.getWorldQuaternion(wq);
    const f = new THREE.Vector3(0, 0, 1).applyQuaternion(wq);
    yaws.push(Math.atan2(f.x, f.z));
  }

  const times = [];
  for (let i = 0; i < n; i++) times.push(dur * (i / Math.max(1, n - 1)));
  // Drift of one contact point series (ankle or toe). A foot is planted if its heel OR its toe holds still: the ankle
  // swings forward over a planted toe in back-steps and crouch steps, so the clip's drift is the better of the two.
  const driftOf = (P, tag) => {
    const lY = P.map((p) => p.y);
    let minFY = Infinity, maxFY = -Infinity;
    for (let i = 0; i < n; i++) { if (lY[i] < minFY) minFY = lY[i]; if (lY[i] > maxFY) maxFY = lY[i]; }
    const fwd0 = m.fwd || 0, right0 = m.right || 0;
    const yCut = minFY + Math.max(0.02, (maxFY - minFY) * 0.28);
    const dt = dur / Math.max(1, n - 1);
    const contacts = [];
    for (let i = 2; i < n - 2; i++) {
      if (lY[i] <= lY[i - 1] && lY[i] <= lY[i + 1] && lY[i] <= yCut) {
        // ground-frame foot speed (clips are in place: add the body travel back, else a run's planted foot reads as moving)
        const gx = (k) => P[k].x - (m.right || 0) * times[k], gz = (k) => P[k].z + (m.fwd || 0) * times[k]; // root frame: F = +Z, R = -X
        // speed over +-2 samples: heel-to-toe roll moves the foot bone ~2 cm in one sample at run cadence (60 samples/0.8 s)
        const sp = Math.hypot(gx(i + 2) - gx(i - 2), gz(i + 2) - gz(i - 2)) / (4 * dt || 1);
        if (sp < Math.max(0.55, 0.2 * (m.speed || 0))) contacts.push(i); // planted = under 20% of the travel speed (runs: ~1 m/s)
      }
    }
    const kept = [];
    for (const i of contacts) {
      if (kept.length && times[i] - times[kept[kept.length - 1]] < 0.22) {
        if (lY[i] < lY[kept[kept.length - 1]]) kept[kept.length - 1] = i;
      } else kept.push(i);
    }

    const fwd = m.fwd || 0, right = m.right || 0;
    const uw = unwrap(yaws);
    if (process.env.LOCO_DIAG === clip.name + ':' + tag) { const k0 = lY.indexOf(minFY); for (let k = Math.max(0, k0 - 6); k <= Math.min(n - 1, k0 + 6); k++) console.log(' ', k, times[k].toFixed(3), 'y', lY[k].toFixed(3), 'gx', (P[k].x - right0 * times[k]).toFixed(3), 'gz', (P[k].z + fwd0 * times[k]).toFixed(3), 'mx', P[k].x.toFixed(3), 'mz', P[k].z.toFixed(3)); }
    if (process.env.LOCO_DIAG) console.log(clip.name, tag, 'contacts', contacts.length, 'kept', kept.length, 'lY', minFY.toFixed(3), maxFY.toFixed(3));
    let drift = 0;
    const plants = kept.length ? kept : [Math.floor(n * 0.2), Math.floor(n * 0.5), Math.floor(n * 0.8)];
    for (const i of plants) {
      // Body frame = the character root (+Z forward, -X right), the frame the game feeds updateLoco from the group's facing.
      // (Was the Hips yaw with right = +X: strafes turn the pelvis toward the motion, so runStrafe read as forward travel,
      // and every lateral clip had its side speed mirrored.)
      const yaw = 0;
      const s = Math.sin(yaw), c = Math.cos(yaw);
      const y0 = lY[i];
      let a = i, b = i;
      while (a > 0 && lY[a] < y0 + 0.012 && times[i] - times[a] < 0.05) a -= 1;
      while (b < n - 1 && lY[b] < y0 + 0.012 && times[b] - times[i] < 0.05) b += 1;
      const world = (k) => {
        const t = times[k];
        return [P[k].x + (fwd * s - right * c) * t, P[k].z + (fwd * c + right * s) * t]; // + body travel fwd*F + right*R, R = (-cos, sin)
      };
      const p0 = world(i);
      for (let k = a; k <= b; k++) {
        const p = world(k);
        drift = Math.max(drift, Math.hypot(p[0] - p0[0], p[1] - p0[1]));
      }
    }
    return drift;
  };
  const dFoot = driftOf(lFoot, 'foot'), dToe = driftOf(lToe, 'toe');
  const drift = Math.min(dFoot, dToe); const fwd = m.fwd || 0, right = m.right || 0;
  const driftCm = drift * 100;
  const minYcm = minY * 100;
  let wrap = 0; for (const name of BONES) wrap = Math.max(wrap, qAngle(qs[0][name], qs[qs.length - 1][name])); const wrapDeg = wrap; // qAngle is in degrees
  const ok = maxDelta <= MAX_FLIP && driftCm <= MAX_DRIFT && wrapDeg <= MAX_WRAP;
  if (!ok) fails += 1;
  const mark = ok ? 'ok' : (maxDelta > MAX_FLIP ? 'FLIP' : wrapDeg > MAX_WRAP ? 'SNAP' : 'DRIFT'); rows.push({ clip: clip.name, maxDelta: +maxDelta.toFixed(1), wrapDeg: +wrapDeg.toFixed(1), driftCm: +driftCm.toFixed(1), ok });
  console.log(
    clip.name.padEnd(12), dur.toFixed(2).padStart(6), maxDelta.toFixed(1).padStart(8),
    driftCm.toFixed(2).padStart(8), minYcm.toFixed(1).padStart(8),
    fwd.toFixed(2).padStart(7), right.toFixed(2).padStart(7), (m.turnRate || 0).toFixed(1).padStart(7), mark,
  );
}

restore();
const bytes = fs.statSync(ANIM).size;
console.log('\nfile', bytes, 'bytes', bytes > 600 * 1024 ? 'OVER 600KB' : 'size ok');
console.log('wrap° per clip', rows.map((r) => r.clip + ' ' + r.wrapDeg).join(', '));
if (JSON_OUT) console.log(JSON.stringify(rows));
console.log(fails ? `${fails} clip(s) failed` : 'all clips within flip/snap/drift limits');
if (fails) process.exitCode = 1;
