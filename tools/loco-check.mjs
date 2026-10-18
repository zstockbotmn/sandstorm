// Check fighter.loco.anim.glb on the Meshy rig (node, no browser).
// Usage: node tools/loco-check.mjs
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
  const lY = lFoot.map((p) => p.y);
  let minFY = Infinity, maxFY = -Infinity;
  for (let i = 0; i < n; i++) { if (lY[i] < minFY) minFY = lY[i]; if (lY[i] > maxFY) maxFY = lY[i]; }
  const yCut = minFY + Math.max(0.02, (maxFY - minFY) * 0.28);
  const dt = dur / Math.max(1, n - 1);
  const contacts = [];
  for (let i = 2; i < n - 2; i++) {
    if (lY[i] <= lY[i - 1] && lY[i] <= lY[i + 1] && lY[i] <= yCut) {
      const sp = Math.hypot(lFoot[i + 1].x - lFoot[i - 1].x, lFoot[i + 1].z - lFoot[i - 1].z) / (2 * dt || 1);
      if (sp < 0.55) contacts.push(i);
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
  let drift = 0;
  const plants = kept.length ? kept : [Math.floor(n * 0.2), Math.floor(n * 0.5), Math.floor(n * 0.8)];
  for (const i of plants) {
    const yaw = uw[i] || 0;
    const s = Math.sin(yaw), c = Math.cos(yaw);
    const y0 = lY[i];
    let a = i, b = i;
    while (a > 0 && lY[a] < y0 + 0.012 && times[i] - times[a] < 0.05) a -= 1;
    while (b < n - 1 && lY[b] < y0 + 0.012 && times[b] - times[i] < 0.05) b += 1;
    const world = (k) => {
      const t = times[k];
      return [lFoot[k].x + (right * c + fwd * s) * t, lFoot[k].z + (-right * s + fwd * c) * t];
    };
    const p0 = world(i);
    for (let k = a; k <= b; k++) {
      const p = world(k);
      drift = Math.max(drift, Math.hypot(p[0] - p0[0], p[1] - p0[1]));
    }
  }
  const driftCm = drift * 100;
  const minYcm = minY * 100;
  const ok = maxDelta <= MAX_FLIP && driftCm <= MAX_DRIFT;
  if (!ok) fails += 1;
  const mark = ok ? 'ok' : (maxDelta > MAX_FLIP ? 'FLIP' : 'DRIFT');
  console.log(
    clip.name.padEnd(12), dur.toFixed(2).padStart(6), maxDelta.toFixed(1).padStart(8),
    driftCm.toFixed(2).padStart(8), minYcm.toFixed(1).padStart(8),
    fwd.toFixed(2).padStart(7), right.toFixed(2).padStart(7), (m.turnRate || 0).toFixed(1).padStart(7), mark,
  );
}

restore();
const bytes = fs.statSync(ANIM).size;
console.log('\nfile', bytes, 'bytes', bytes > 600 * 1024 ? 'OVER 600KB' : 'size ok');
console.log(fails ? `${fails} clip(s) failed` : 'all clips within flip/drift limits');
if (fails) process.exitCode = 1;
