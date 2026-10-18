// Fit fighter.loco.meta fwd/right/speed to the planted-foot travel of each baked clip (node, no browser).
// The clips are in place; a planted foot slides backwards at the ground speed, so meta velocity = -(stance foot velocity),
// fitted by least squares over every stance span of BOTH feet (yaw-corrected). locomotion.js scales playback by meta speed.
// Usage: node tools/loco-fitmeta.mjs [--write] [--only clip,clip]
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


const WRITE = process.argv.includes('--write');
const oi = process.argv.indexOf('--only'); const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const N = 240, out = {};
for (const clip of animGltf.animations) {
  if (ONLY && !ONLY.includes(clip.name)) continue;
  const m = meta[clip.name]; if (!m) continue;
  restore(); const mixer = new THREE.AnimationMixer(root); mixer.clipAction(clip).play();
  const dur = clip.duration, F = { L: [], R: [] }, yaw = [], T = [];
  for (let i = 0; i < N; i++) { const t = dur * i / (N - 1); poseClip(mixer, clip, t); T.push(t);
    bones.LeftFoot.getWorldPosition(wp); F.L.push(wp.clone()); bones.RightFoot.getWorldPosition(wp); F.R.push(wp.clone());
    bones.Hips.getWorldQuaternion(wq); const f = new THREE.Vector3(0, 0, 1).applyQuaternion(wq); yaw.push(Math.atan2(f.x, f.z)); }
  const uw = unwrap(yaw);
  // stance spans: foot within 1.5 cm (2.5 for runs) of its own lowest point for >= 4 samples
  let A11 = 0, A12 = 0, A22 = 0, b1 = 0, b2 = 0, nS = 0;
  for (const k of ['L', 'R']) { const ys = F[k].map((p) => p.y), lo = Math.min(...ys), hi = Math.max(...ys); const cut = lo + Math.max(0.015, (hi - lo) * 0.12);
    let s = -1; for (let i = 0; i <= N; i++) { const inS = i < N && ys[i] <= cut; if (inS && s < 0) s = i; if (!inS && s >= 0) { if (i - s >= 4) {
          // per-sample: d(foot)/dt = -R(yaw) * [fwd,right]  ->  vx = -(right c + fwd s), vz = -(fwd c - right s)
          for (let j = s; j < i - 1; j++) { const dt = T[j + 1] - T[j]; const vx = (F[k][j + 1].x - F[k][j].x) / dt, vz = (F[k][j + 1].z - F[k][j].z) / dt; const y = 0, si = Math.sin(y), c = Math.cos(y); // root frame (see loco-check): F = (sin, cos), R = (-cos, sin)
            // foot velocity = -(fwd*F + right*R): vx = -(si*fwd - c*right), vz = -(c*fwd + si*right)
            const r1 = [-si, c], r2 = [-c, -si];
            A11 += r1[0] * r1[0] + r2[0] * r2[0]; A12 += r1[0] * r1[1] + r2[0] * r2[1]; A22 += r1[1] * r1[1] + r2[1] * r2[1]; b1 += r1[0] * vx + r2[0] * vz; b2 += r1[1] * vx + r2[1] * vz; nS++; } }
        s = -1; } } }
  const det = A11 * A22 - A12 * A12; if (!nS || Math.abs(det) < 1e-9) { console.log(clip.name, 'no stance found'); continue; }
  let fwd = (b1 * A22 - b2 * A12) / det, right = (A11 * b2 - A12 * b1) / det;
  if (m.speed === 0 && /^turn/.test(clip.name)) { fwd = 0; right = 0; } // turn-in-place stays at 0 travel
  out[clip.name] = { fwd: +fwd.toFixed(4), right: +right.toFixed(4), speed: +Math.hypot(fwd, right).toFixed(4), stanceSamples: nS };
  console.log(clip.name.padEnd(12), 'old', m.fwd.toFixed(2), m.right.toFixed(2), '-> fit', fwd.toFixed(2), right.toFixed(2), 'speed', Math.hypot(fwd, right).toFixed(2), 'n', nS);
}
if (WRITE) { for (const [k, v] of Object.entries(out)) { meta[k].fwd = v.fwd; meta[k].right = v.right; meta[k].speed = v.speed; meta[k].velFit = 'stance-foot LSQ'; }
  fs.writeFileSync(META, JSON.stringify(meta, null, 2) + '\n'); console.log('wrote', META); }
