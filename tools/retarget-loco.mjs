// Retarget CMU BVH + KayKit locomotion onto the Meshy fighter rig (legs+hips only).
// World-swing retarget, in-place, heading-stripped, loop-closed.
// Usage: node tools/retarget-loco.mjs
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as THREE from 'three';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { BVHLoader } from 'three/examples/jsm/loaders/BVHLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

globalThis.self = globalThis;

const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const RIG = path.join(R, 'assets/models/fighter1.rig.glb');
const OUT = path.join(R, 'assets/models/fighter.loco.anim.glb');
const META = path.join(R, 'assets/models/fighter.loco.meta.json');
const TMP = path.join(R, 'assets/models/.fighter.loco.anim.tmp.glb');
const CMU = path.join(R, 'assets-src/cmu');
const KAY = path.join(R, 'assets-src/kaykit/src/KayKit_Character_Animations_1.1/Animations/gltf/Rig_Medium/Rig_Medium_MovementAdvanced.glb');

const FPS = 30;
const ANALYZE_FPS = 60;
const LOOP_BLEND = 0.2;
const OUT_BONES = [
  { dst: 'Hips', cmu: 'Hips', kay: 'hips', hips: true },
  { dst: 'Spine02', cmu: 'LowerBack', kay: 'spine', half: true },
  { dst: 'LeftUpLeg', cmu: 'LeftUpLeg', kay: 'upperleg.l' },
  { dst: 'LeftLeg', cmu: 'LeftLeg', kay: 'lowerleg.l' },
  { dst: 'LeftFoot', cmu: 'LeftFoot', kay: 'foot.l' },
  { dst: 'LeftToeBase', cmu: 'LeftToeBase', kay: 'toes.l' },
  { dst: 'RightUpLeg', cmu: 'RightUpLeg', kay: 'upperleg.r' },
  { dst: 'RightLeg', cmu: 'RightLeg', kay: 'lowerleg.r' },
  { dst: 'RightFoot', cmu: 'RightFoot', kay: 'foot.r' },
  { dst: 'RightToeBase', cmu: 'RightToeBase', kay: 'toes.r' },
];
const ORDER = OUT_BONES.map((b) => b.dst);
const PARENT = {
  Hips: null, Spine02: 'Hips',
  LeftUpLeg: 'Hips', LeftLeg: 'LeftUpLeg', LeftFoot: 'LeftLeg', LeftToeBase: 'LeftFoot',
  RightUpLeg: 'Hips', RightLeg: 'RightUpLeg', RightFoot: 'RightLeg', RightToeBase: 'RightFoot',
};
const DIR_CHILD = {
  Hips: { dst: 'Spine02', cmu: 'Spine', kay: 'spine' },
  Spine02: { dst: 'Spine01', cmu: 'Spine', kay: 'chest' },
  LeftUpLeg: { dst: 'LeftLeg', cmu: 'LeftLeg', kay: 'lowerleg.l' },
  LeftLeg: { dst: 'LeftFoot', cmu: 'LeftFoot', kay: 'foot.l' },
  LeftFoot: { dst: 'LeftToeBase', cmu: 'LeftToeBase', kay: 'toes.l' },
  LeftToeBase: { dst: null, cmu: 'ENDSITE', kay: null },
  RightUpLeg: { dst: 'RightLeg', cmu: 'RightLeg', kay: 'lowerleg.r' },
  RightLeg: { dst: 'RightFoot', cmu: 'RightFoot', kay: 'foot.r' },
  RightFoot: { dst: 'RightToeBase', cmu: 'RightToeBase', kay: 'toes.r' },
  RightToeBase: { dst: null, cmu: 'ENDSITE', kay: null },
};

const _v = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _q = new THREE.Quaternion();
const Y_UP = new THREE.Vector3(0, 1, 0);

function qFromTo(from, to) {
  const f = from.clone().normalize();
  const t = to.clone().normalize();
  const c = f.dot(t);
  const q = new THREE.Quaternion();
  if (c > 0.999999) return q.identity();
  if (c < -0.999999) {
    const axis = Math.abs(f.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    axis.cross(f).normalize();
    return q.setFromAxisAngle(axis, Math.PI);
  }
  const axis = f.clone().cross(t);
  q.set(axis.x, axis.y, axis.z, 1 + c);
  return q.normalize();
}

function yawFromQuat(q) {
  _v.set(0, 0, 1).applyQuaternion(q);
  return Math.atan2(_v.x, _v.z);
}

// Yaw of a bone relative to its OWN rest orientation: a rig whose hips bone axes are not world-aligned at rest (KayKit:
// local +Z is not forward) read a constant ~90 deg heading, and the heading strip turned its strafes into forward runs.
function yawRel(wq, restWq) { return yawFromQuat(_q.copy(wq).multiply(restWq.clone().invert())); }

// Facing (heading) of the source actor: the SHOULDER line, not the hips. Strafes turn the pelvis toward the motion (KayKit
// run strafes: hips 58 deg, chest 16 deg), so a hips-yaw heading strip rotated them into diagonal/forward runs.
// KayKit clips are in place with a fixed root facing: heading 0.
function facingYaw(root, kind) { if (kind === 'kay') return 0; const l = findBone(root, 'LeftArm'), r = findBone(root, 'RightArm'); if (!l || !r) return null;
  const a = l.getWorldPosition(new THREE.Vector3()), b = r.getWorldPosition(new THREE.Vector3()); const dx = a.x - b.x, dz = a.z - b.z; // right->left shoulder
  return Math.atan2(-dz, dx); } // forward = up x (L-R) : (x,z) = (-dz, dx) -> yaw atan2(fx, fz)

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

function fitLine(ts, ys) {
  const n = ts.length;
  if (n < 2) return { a: ys[0] || 0, b: 0 };
  let sumT = 0, sumY = 0, sumTT = 0, sumTY = 0;
  for (let i = 0; i < n; i++) {
    sumT += ts[i]; sumY += ys[i]; sumTT += ts[i] * ts[i]; sumTY += ts[i] * ys[i];
  }
  const det = n * sumTT - sumT * sumT;
  const b = Math.abs(det) < 1e-12 ? 0 : (n * sumTY - sumT * sumY) / det;
  return { a: (sumY - b * sumT) / n, b };
}

function mean(arr) {
  if (!arr.length) return 0;
  let s = 0;
  for (let i = 0; i < arr.length; i++) s += arr[i];
  return s / arr.length;
}

function stdev(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  let s = 0;
  for (let i = 0; i < arr.length; i++) { const d = arr[i] - m; s += d * d; }
  return Math.sqrt(s / arr.length);
}

function qAngle(a, b) {
  let d = Math.abs(a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w);
  if (d > 1) d = 1;
  return 2 * Math.acos(d);
}

function qToArr(q) { return [q.x, q.y, q.z, q.w]; }

function makeContinuous(vals, stride) {
  for (let i = 1; i < vals.length / stride; i++) {
    const o = i * stride, p = o - stride;
    let dot = 0;
    for (let k = 0; k < stride; k++) dot += vals[o + k] * vals[p + k];
    if (dot < 0) for (let k = 0; k < stride; k++) vals[o + k] = -vals[o + k];
  }
}

function slerpArr(a, b, t) {
  let ax = a[0], ay = a[1], az = a[2], aw = a[3];
  let bx = b[0], by = b[1], bz = b[2], bw = b[3];
  let cos = ax * bx + ay * by + az * bz + aw * bw;
  if (cos < 0) { cos = -cos; bx = -bx; by = -by; bz = -bz; bw = -bw; }
  if (cos > 0.9995) {
    const x = ax + (bx - ax) * t, y = ay + (by - ay) * t, z = az + (bz - az) * t, w = aw + (bw - aw) * t;
    const l = Math.hypot(x, y, z, w) || 1;
    return [x / l, y / l, z / l, w / l];
  }
  const th = Math.acos(Math.min(1, cos));
  const s = Math.sin(th);
  const w1 = Math.sin((1 - t) * th) / s;
  const w2 = Math.sin(t * th) / s;
  return [ax * w1 + bx * w2, ay * w1 + by * w2, az * w1 + bz * w2, aw * w1 + bw * w2];
}

function findBone(root, name) {
  if (!name || !root) return null;
  const aliases = [name];
  if (name.includes('.')) aliases.push(name.replace(/\./g, ''));
  else if (/[lr]$/.test(name) && name.length > 3) aliases.push(name.slice(0, -1) + '.' + name.slice(-1));
  for (const n of aliases) {
    if (root.name === n) return root;
    const hit = root.getObjectByName(n);
    if (hit) return hit;
  }
  return null;
}

function worldDelta(a, b) {
  a.getWorldPosition(_v);
  b.getWorldPosition(_v2);
  return _v2.clone().sub(_v);
}

function boneDirection(bone, childName) {
  if (!bone) return new THREE.Vector3(0, 1, 0);
  if (childName) {
    for (let i = 0; i < bone.children.length; i++) {
      const c = bone.children[i];
      if (c.name === childName || c.name === childName.replace(/\./g, '')) {
        const d = worldDelta(bone, c);
        if (d.lengthSq() > 1e-10) return d.normalize();
      }
    }
    const named = findBone(bone, childName);
    if (named && named !== bone) {
      const d = worldDelta(bone, named);
      if (d.lengthSq() > 1e-10) return d.normalize();
    }
  }
  let best = null, bestL = 0;
  for (let i = 0; i < bone.children.length; i++) {
    const d = worldDelta(bone, bone.children[i]);
    const L = d.lengthSq();
    if (L > bestL) { bestL = L; best = d; }
  }
  if (best && bestL > 1e-10) return best.normalize();
  const y = new THREE.Vector3(0, 1, 0);
  bone.getWorldQuaternion(_q);
  return y.applyQuaternion(_q).normalize();
}

function captureRest(root, kind) {
  root.updateMatrixWorld(true);
  const rest = {};
  for (const row of OUT_BONES) {
    const bone = findBone(root, row[kind]);
    if (!bone) { console.warn('missing source bone', kind, row[kind]); continue; }
    const wq = new THREE.Quaternion();
    const wp = new THREE.Vector3();
    bone.getWorldQuaternion(wq);
    bone.getWorldPosition(wp);
    const hint = DIR_CHILD[row.dst];
    rest[row.dst] = { srcName: row[kind], wq, wp, lq: bone.quaternion.clone(), dir: boneDirection(bone, hint ? hint[kind] : null), bone };
  }
  return rest;
}

function poseWorld(root, kind) {
  root.updateMatrixWorld(true);
  const out = {};
  for (const row of OUT_BONES) {
    const bone = findBone(root, row[kind]);
    if (!bone) continue;
    const wq = new THREE.Quaternion();
    const wp = new THREE.Vector3();
    bone.getWorldQuaternion(wq);
    bone.getWorldPosition(wp);
    out[row.dst] = { wq, wp };
  }
  return out;
}

function makePoser(root, clip) {
  const mixer = new THREE.AnimationMixer(root);
  const action = mixer.clipAction(clip);
  action.enabled = true;
  action.play();
  return (t) => {
    mixer.setTime(Math.max(0, Math.min(t, clip.duration || 0)));
    root.updateMatrixWorld(true);
  };
}

function loadGltf(file) {
  const buf = fs.readFileSync(file);
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  return new Promise((resolve, reject) => gltfLoader.parse(ab, path.dirname(file) + '/', resolve, reject));
}

function contactsFrom(times, footY, footXZ, opts) {
  opts = opts || {};
  const n = times.length;
  if (n < 8) return [];
  const dt = (times[n - 1] - times[0]) / Math.max(1, n - 1);
  const trim = opts.trim || 0;
  const t0 = times[0] + trim;
  const t1 = times[n - 1] - trim;
  const sm = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    sm[i] = (footY[Math.max(0, i - 1)] + footY[i] + footY[Math.min(n - 1, i + 1)]) / 3;
  }
  const interior = [];
  for (let i = 0; i < n; i++) if (times[i] >= t0 && times[i] <= t1) interior.push(sm[i]);
  if (!interior.length) return [];
  const sorted = interior.slice().sort((a, b) => a - b);
  const yCut = sorted[Math.floor(sorted.length * 0.38)];
  const speedCut = opts.speedCut || 0.6;
  const raw = [];
  for (let i = 2; i < n - 2; i++) {
    if (times[i] < t0 || times[i] > t1) continue;
    const sp = Math.hypot(footXZ[i + 1][0] - footXZ[i - 1][0], footXZ[i + 1][1] - footXZ[i - 1][1]) / (2 * dt);
    if (sm[i] <= sm[i - 1] && sm[i] <= sm[i + 1] && sm[i] <= sm[i - 2] && sm[i] <= sm[i + 2]
      && sm[i] <= yCut && sp <= speedCut) raw.push(i);
  }
  const minSep = opts.minSep || 0.45;
  const kept = [];
  for (const i of raw) {
    if (kept.length && times[i] - times[kept[kept.length - 1]] < minSep) {
      if (sm[i] < sm[kept[kept.length - 1]]) kept[kept.length - 1] = i;
    } else kept.push(i);
  }
  return kept;
}

function analyzeWindow(frames, i0, i1) {
  const n = i1 - i0 + 1;
  if (n < 4) return null;
  const ts = [], yaws = [], fwds = [], rights = [], headings = [];
  for (let i = i0; i <= i1; i++) { ts.push(frames[i].t - frames[i0].t); yaws.push(frames[i].yaw); }
  const uw = unwrap(yaws);
  const { a, b } = fitLine(ts, uw);
  for (let i = i0 + 1; i <= i1; i++) {
    const dt = frames[i].t - frames[i - 1].t;
    if (dt <= 1e-6) continue;
    const vx = (frames[i].hip.x - frames[i - 1].hip.x) / dt;
    const vz = (frames[i].hip.z - frames[i - 1].hip.z) / dt;
    const yaw = uw[i - i0];
    const s = Math.sin(yaw), c = Math.cos(yaw);
    const fwd = vx * s + vz * c;
    const right = vz * s - vx * c; // character's right is -X when facing +Z (was +X: CMU strafe L/R were swapped)
    fwds.push(fwd); rights.push(right);
    if (Math.hypot(fwd, right) > 0.08) headings.push(Math.atan2(right, fwd));
  }
  const dur = frames[i1].t - frames[i0].t;
  const fwd = mean(fwds), right = mean(rights);
  return {
    i0, i1, dur, fwd, right, speed: Math.hypot(fwd, right),
    dirStd: stdev(unwrap(headings.length ? headings : [0])) * 180 / Math.PI,
    turnRate: b * 180 / Math.PI, a, b,
  };
}

function scoreStrafe(s) {
  if (!s || s.dur < 0.55 || s.dur > 3.6) return -Infinity;
  if (s.dirStd > 15 || Math.abs(s.turnRate) > 10 || s.speed < 0.2) return -Infinity;
  const side = Math.abs(s.right) / (s.speed + 1e-4);
  if (side < 0.6) return -Infinity;
  const cycle = s.cycles === 2 ? 2.2 : s.cycles === 1 ? 1.2 : 1;
  return cycle * side * s.speed * s.dur / (1 + s.dirStd / 6) / (1 + Math.abs(s.turnRate) / 4);
}

function scoreBack(s) {
  if (!s || s.dur < 0.7 || s.dur > 3.6) return -Infinity;
  if (s.dirStd > 15 || Math.abs(s.turnRate) > 16 || s.fwd > -0.22 || s.speed < 0.28) return -Infinity;
  if (-s.fwd / (s.speed + 1e-4) < 0.6) return -Infinity;
  const cycle = s.cycles === 2 ? 2.2 : s.cycles === 1 ? 1.2 : 1;
  return cycle * (-s.fwd) * s.speed * s.dur / (1 + s.dirStd / 6) / (1 + Math.abs(s.turnRate) / 8);
}

function scoreTurn(s, sign) {
  if (!s || s.dur < 0.4 || s.dur > 2.2) return -Infinity;
  if (s.turnRate * sign <= 12 || s.speed > 0.45) return -Infinity;
  return Math.abs(s.turnRate) / (1 + s.speed * 4) * Math.min(s.dur, 1.4);
}

function sampleSource(root, kind, poser, t0, t1, fps, scale, rest) {
  const dur = Math.max(0, t1 - t0);
  const steps = Math.max(2, Math.round(dur * fps) + 1);
  const frames = [];
  for (let i = 0; i < steps; i++) {
    const t = t0 + dur * (i / (steps - 1));
    poser(t);
    const world = poseWorld(root, kind);
    frames.push({
      t: t - t0, srcT: t, world,
      hip: world.Hips.wp.clone().multiplyScalar(scale),
      yaw: facingYaw(root, kind) ?? yawRel(world.Hips.wq, rest.Hips.wq),
      lfoot: world.LeftFoot.wp.clone().multiplyScalar(scale),
    });
  }
  return frames;
}

function retargetFrames(frames, srcRest, tgtRest, C, tgtLocalRest) {
  const headingFit = fitLine(frames.map((f) => f.t), unwrap(frames.map((f) => f.yaw)));
  const out = [];
  const Tw = {};
  for (let i = 0; i < frames.length; i++) {
    const f = frames[i];
    const heading = new THREE.Quaternion().setFromAxisAngle(Y_UP, -(headingFit.a + headingFit.b * f.t));
    const locals = {};
    for (let b = 0; b < ORDER.length; b++) {
      const name = ORDER[b];
      const Sw = heading.clone().multiply(f.world[name].wq);
      const Twb = Sw.multiply(srcRest[name].wq.clone().invert()).multiply(C[name]).multiply(tgtRest[name].wq);
      Tw[name] = Twb;
      const pName = PARENT[name];
      let Tl = pName ? Tw[pName].clone().invert().multiply(Twb) : Twb.clone();
      if (OUT_BONES[b].half) Tl.slerp(tgtLocalRest[name], 0.5);
      locals[name] = Tl;
    }
    out.push({ t: f.t, locals, hipY: f.hip.y, headingFit });
  }
  return { frames: out, headingFit };
}

function loopClose(posed) {
  const n = posed.length;
  if (n < 2) return { posed, loopErr: 0 };
  const dur = posed[n - 1].t;
  const blend = Math.min(LOOP_BLEND, dur * 0.45);
  let loopErr = 0;
  for (const name of ORDER) loopErr = Math.max(loopErr, qAngle(posed[0].locals[name], posed[n - 1].locals[name]) * 180 / Math.PI);
  loopErr = Math.max(loopErr, Math.abs(posed[n - 1].hipY - posed[0].hipY) * 100);
  if (blend > 1e-4) {
    for (let i = 0; i < n; i++) {
      const remain = dur - posed[i].t;
      if (remain > blend) continue;
      const u = 1 - remain / blend;
      for (const name of ORDER) {
        const s = slerpArr(qToArr(posed[i].locals[name]), qToArr(posed[0].locals[name]), u);
        posed[i].locals[name].set(s[0], s[1], s[2], s[3]);
      }
      posed[i].hipY += (posed[0].hipY - posed[i].hipY) * u;
    }
  }
  for (const name of ORDER) posed[n - 1].locals[name].copy(posed[0].locals[name]);
  posed[n - 1].hipY = posed[0].hipY;
  return { posed, loopErr };
}

function resampleOut(posed, fps) {
  const dur = posed[posed.length - 1].t;
  const steps = Math.max(2, Math.round(dur * fps) + 1);
  const times = new Float32Array(steps);
  const rots = {};
  for (const name of ORDER) rots[name] = new Float32Array(steps * 4);
  const pos = new Float32Array(steps * 3);
  function at(t) {
    if (t <= posed[0].t) return { lo: posed[0], hi: posed[0], u: 0 };
    if (t >= posed[posed.length - 1].t) return { lo: posed[posed.length - 1], hi: posed[posed.length - 1], u: 0 };
    let hi = 1;
    while (hi < posed.length && posed[hi].t < t) hi += 1;
    const lo = hi - 1;
    return { lo: posed[lo], hi: posed[hi], u: (t - posed[lo].t) / (posed[hi].t - posed[lo].t || 1) };
  }
  for (let i = 0; i < steps; i++) {
    const t = dur * (i / (steps - 1));
    times[i] = t;
    const s = at(t);
    for (const name of ORDER) {
      const q = slerpArr(qToArr(s.lo.locals[name]), qToArr(s.hi.locals[name]), s.u);
      rots[name][i * 4] = q[0]; rots[name][i * 4 + 1] = q[1]; rots[name][i * 4 + 2] = q[2]; rots[name][i * 4 + 3] = q[3];
    }
    const y = s.lo.hipY + (s.hi.hipY - s.lo.hipY) * s.u;
    pos[i * 3] = 0; pos[i * 3 + 1] = y; pos[i * 3 + 2] = 0;
  }
  for (const name of ORDER) makeContinuous(rots[name], 4);
  return { times, rots, pos, dur };
}

function applyToRig(rig, tgtLocalRest, tgtRestT, sample, i) {
  for (const name of ORDER) {
    const bone = findBone(rig, name);
    if (!bone) continue;
    bone.quaternion.fromArray(sample.rots[name], i * 4);
    if (name === 'Hips') bone.position.set(tgtRestT[0], sample.pos[i * 3 + 1], tgtRestT[2]);
    else bone.position.copy(tgtLocalRest._pos[name]);
  }
  rig.updateMatrixWorld(true);
}

// Body velocity = minus the planted foot's velocity, from frame-to-frame differences of the SAME planted foot (the old
// single line fit through alternating left/right foot positions read the feet's side offset as sideways speed).
function supportVel(times, lPos, rPos, lY, rY, yaws) {
  const n = times.length, ys = [];
  for (let i = 0; i < n; i++) ys.push(Math.min(lY[i], rY[i]));
  const sorted = ys.slice().sort((a, b) => a - b);
  const yCut = sorted[Math.max(0, Math.floor(n * 0.25))];
  const uw = unwrap(yaws); let sf = 0, sr = 0, st = 0;
  for (let i = 1; i < n; i++) {
    if (ys[i] > yCut || ys[i - 1] > yCut) continue;
    const left = lY[i] <= rY[i], leftPrev = lY[i - 1] <= rY[i - 1]; if (left !== leftPrev) continue;
    const p = left ? lPos[i] : rPos[i], q = left ? lPos[i - 1] : rPos[i - 1], dt = times[i] - times[i - 1]; if (dt <= 0) continue;
    const dx = p.x - q.x, dz = p.z - q.z, s = Math.sin(uw[i]), c = Math.cos(uw[i]);
    sf += dx * s + dz * c; sr += dx * c - dz * s; st += dt;
  }
  if (st <= 0) return { fwd: 0, right: 0, speed: 0 };
  // facing +Z (Y up, right-handed) the character's right is -X: body velocity = -foot velocity, so right = +foot dx
  const fwd = -sf / st, right = sr / st;
  return { fwd, right, speed: Math.hypot(fwd, right) };
}

function measureTarget(rig, tgtLocalRest, tgtRestT, sample, velOverride) {
  const n = sample.times.length;
  const lY = [], rY = [], lXZ = [], lPos = [], rPos = [], yaws = [];
  let minFoot = Infinity, maxDelta = 0;
  const prevQ = {};
  for (const name of ORDER) prevQ[name] = null;
  for (let i = 0; i < n; i++) {
    applyToRig(rig, tgtLocalRest, tgtRestT, sample, i);
    const hips = findBone(rig, 'Hips');
    const lf = findBone(rig, 'LeftFoot'), rf = findBone(rig, 'RightFoot');
    const lt = findBone(rig, 'LeftToeBase'), rt = findBone(rig, 'RightToeBase');
    const lp = new THREE.Vector3(), rp = new THREE.Vector3(), ltp = new THREE.Vector3(), rtp = new THREE.Vector3();
    lf.getWorldPosition(lp); rf.getWorldPosition(rp); lt.getWorldPosition(ltp); rt.getWorldPosition(rtp);
    minFoot = Math.min(minFoot, lp.y, rp.y, ltp.y, rtp.y);
    lY.push(lp.y); rY.push(rp.y); lXZ.push([lp.x, lp.z]); lPos.push(lp.clone()); rPos.push(rp.clone());
    yaws.push(0); void hips; // output clips face +Z by construction (heading stripped by the shoulder facing): measure in that frame
    for (const name of ORDER) {
      const q = findBone(rig, name).quaternion.clone();
      if (prevQ[name]) maxDelta = Math.max(maxDelta, qAngle(prevQ[name], q) * 180 / Math.PI);
      prevQ[name] = q;
    }
  }
  const times = Array.from(sample.times);
  if (process.env.LOCO_DBG) { const rg = (k) => (Math.max(...lPos.map((p) => p[k])) - Math.min(...lPos.map((p) => p[k]))).toFixed(2); console.log('   dbg footL range x', rg('x'), 'z', rg('z'), 'hipsYaw0', (yawFromQuat(findBone(rig, 'Hips').getWorldQuaternion(new THREE.Quaternion())) * 57.3).toFixed(0)); }
  const lock = supportVel(times, lPos, rPos, lY, rY, yaws);
  const fwd = velOverride ? velOverride.fwd : lock.fwd;
  const right = velOverride ? velOverride.right : lock.right;
  const contacts = contactsFrom(times, lY, lXZ, { trim: 0, speedCut: 0.55, minSep: 0.28 });
  const uw = unwrap(yaws);
  const windows = [];
  const plantIdx = contacts.length ? contacts : [];
  for (const i of plantIdx) {
    const y0 = lY[i];
    let a = i, b = i;
    while (a > 0 && lY[a] < y0 + 0.012 && times[i] - times[a] < 0.05) a -= 1;
    while (b < n - 1 && lY[b] < y0 + 0.012 && times[b] - times[i] < 0.05) b += 1;
    windows.push([a, b, i]);
  }
  if (!windows.length) {
    const order = lY.map((y, i) => [y, i]).sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < Math.min(5, order.length); k++) {
      const i = order[k][1];
      windows.push([Math.max(0, i - 1), Math.min(n - 1, i + 1), i]);
    }
  }
  let drift = 0;
  for (const [a, b, i] of windows) {
    const s = Math.sin(uw[i]), c = Math.cos(uw[i]);
    const x0 = lPos[i].x + (right * c + fwd * s) * times[i];
    const z0 = lPos[i].z + (-right * s + fwd * c) * times[i];
    for (let k = a; k <= b; k++) {
      const t = times[k];
      const px = lPos[k].x + (right * c + fwd * s) * t;
      const pz = lPos[k].z + (-right * s + fwd * c) * t;
      drift = Math.max(drift, Math.hypot(px - x0, pz - z0));
    }
  }
  return { fwd, right, speed: Math.hypot(fwd, right), maxDelta, driftCm: drift * 100, minFootCm: minFoot * 100, lock };
}

function addChannel(out, anim, node, path, times, values, buffer) {
  const input = out.createAccessor().setType('SCALAR').setArray(times).setBuffer(buffer);
  const output = out.createAccessor().setType(path === 'rotation' ? 'VEC4' : 'VEC3').setArray(values).setBuffer(buffer);
  const sampler = out.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
  const channel = out.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(sampler);
  anim.addSampler(sampler);
  anim.addChannel(channel);
}

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);
const bvhLoader = new BVHLoader();

console.log('loading Meshy rig');
const rigGltf = await loadGltf(RIG);
const rigRoot = rigGltf.scene;
rigRoot.updateMatrixWorld(true);
const hipsBone = findBone(rigRoot, 'Hips');
const meshyHip = new THREE.Vector3();
hipsBone.getWorldPosition(meshyHip);
const meshyHipY = meshyHip.y;
const tgtRestWorld = {};
const tgtLocalRest = { _pos: {} };
const tgtRestT = hipsBone.position.clone();
const toeL = findBone(rigRoot, 'LeftToeBase');
const footL = findBone(rigRoot, 'LeftFoot');
const toeP = new THREE.Vector3(), footP = new THREE.Vector3();
toeL.getWorldPosition(toeP); footL.getWorldPosition(footP);
console.log('Meshy hip Y', meshyHipY.toFixed(4), 'm; toes point', (toeP.z - footP.z) >= 0 ? '+Z' : '-Z');

for (const row of OUT_BONES) {
  const bone = findBone(rigRoot, row.dst);
  if (!bone) throw new Error('missing dest bone ' + row.dst);
  const wq = new THREE.Quaternion();
  bone.getWorldQuaternion(wq);
  const hint = DIR_CHILD[row.dst];
  tgtRestWorld[row.dst] = { wq, lq: bone.quaternion.clone(), lp: bone.position.clone(), dir: boneDirection(bone, hint ? hint.dst : null) };
  tgtLocalRest[row.dst] = bone.quaternion.clone();
  tgtLocalRest._pos[row.dst] = bone.position.clone();
}

function corrections(srcRest) {
  const C = {};
  for (const row of OUT_BONES) {
    C[row.dst] = qFromTo(tgtRestWorld[row.dst].dir, srcRest[row.dst].dir);
    const ang = 2 * Math.acos(Math.min(1, Math.abs(C[row.dst].w))) * 180 / Math.PI;
    if (ang > 50) console.warn('large swing', row.dst, ang.toFixed(1), 'deg');
  }
  return C;
}

function hipYcm(yMetres) { return tgtRestT.y + (yMetres - meshyHipY) * 100; }

function restoreRigBind() {
  for (const row of OUT_BONES) {
    const bone = findBone(rigRoot, row.dst);
    bone.quaternion.copy(tgtLocalRest[row.dst]);
    bone.position.copy(tgtLocalRest._pos[row.dst]);
  }
  rigRoot.updateMatrixWorld(true);
}

function packClip(name, posed, srcLabel, headingFit, opts) {
  opts = opts || {};
  const closed = loopClose(posed);
  for (let i = 0; i < closed.posed.length; i++) closed.posed[i].hipY = hipYcm(closed.posed[i].hipY);
  const sample = resampleOut(closed.posed, FPS);
  const restT = [tgtRestT.x, tgtRestT.y, tgtRestT.z];
  let m = measureTarget(rigRoot, tgtLocalRest, restT, sample, null);
  if (m.minFootCm < -0.5) {
    const lift = -m.minFootCm + 0.5;
    for (let i = 0; i < sample.times.length; i++) sample.pos[i * 3 + 1] += lift;
    m = measureTarget(rigRoot, tgtLocalRest, restT, sample, null);
    m.lifted = lift;
  }
  const vel = opts.zeroVel ? { fwd: 0, right: 0 } : { fwd: m.lock.fwd, right: m.lock.right };
  m = measureTarget(rigRoot, tgtLocalRest, restT, sample, vel);
  if (m.lifted) { /* keep */ }
  const turnRate = headingFit.b * 180 / Math.PI;
  const meta = {
    src: srcLabel,
    duration: +sample.dur.toFixed(4),
    fwd: +m.fwd.toFixed(4),
    right: +m.right.toFixed(4),
    speed: +m.speed.toFixed(4),
    turnRate: +turnRate.toFixed(3),
    loopErr: +closed.loopErr.toFixed(3),
  };
  console.log(
    'clip', name, meta.src,
    'dur', meta.duration.toFixed(2),
    'fwd', meta.fwd.toFixed(2), 'right', meta.right.toFixed(2), 'speed', meta.speed.toFixed(2),
    'turn', meta.turnRate.toFixed(1), 'loopErr', meta.loopErr.toFixed(2),
    'maxd', m.maxDelta.toFixed(1), 'drift', m.driftCm.toFixed(1), 'minY', m.minFootCm.toFixed(1),
    m.lifted ? ('lift ' + m.lifted.toFixed(1)) : '',
  );
  return { name, sample, meta, measure: m };
}

function loadBvh(file) {
  const parsed = bvhLoader.parse(fs.readFileSync(file, 'utf8'));
  const root = parsed.skeleton.bones[0];
  return { root, clip: parsed.clip, rest: captureRest(root, 'cmu'), file };
}

function cmuScale(root, poser, duration) {
  const ys = [];
  const n = Math.max(8, Math.round(duration * 8));
  for (let i = 0; i < n; i++) {
    poser(duration * (i / Math.max(1, n - 1)));
    findBone(root, 'Hips').getWorldPosition(_v);
    ys.push(_v.y);
  }
  ys.sort((a, b) => a - b);
  return meshyHipY / (ys[ys.length >> 1] || 18);
}

function collectCmuFrames(spec) {
  const { root, clip, rest, file } = spec;
  const poser = makePoser(root, clip);
  const scale = cmuScale(root, poser, clip.duration);
  const C = corrections(rest);
  const n = Math.max(8, Math.round(clip.duration * ANALYZE_FPS) + 1);
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = clip.duration * (i / Math.max(1, n - 1));
    poser(t);
    const world = poseWorld(root, 'cmu');
    const hip = world.Hips.wp.clone().multiplyScalar(scale);
    const lf = world.LeftFoot.wp.clone().multiplyScalar(scale);
    frames.push({ t, world, hip, yaw: facingYaw(root, 'cmu') ?? yawRel(world.Hips.wq, rest.Hips.wq), lfoot: lf });
  }
  const times = frames.map((f) => f.t);
  const idx = contactsFrom(times, frames.map((f) => f.lfoot.y), frames.map((f) => [f.lfoot.x, f.lfoot.z]), { trim: 0.18, speedCut: 0.6, minSep: 0.45 });
  return { root, clip, rest, C, scale, poser, frames, contacts: idx, file };
}

function candidatesFrom(data, cycles) {
  const out = [];
  for (let i = 0; i + cycles < data.contacts.length; i++) {
    const s = analyzeWindow(data.frames, data.contacts[i], data.contacts[i + cycles]);
    if (s) { s.file = data.file; s.scale = data.scale; s.cycles = cycles; s._data = data; out.push(s); }
  }
  return out;
}

function slideWindows(data, dur, step) {
  const frames = data.frames;
  if (frames.length < 10) return [];
  const dt = frames[1].t - frames[0].t;
  const span = Math.max(6, Math.round(dur / dt));
  const st = Math.max(1, Math.round((step || 0.2) / dt));
  const out = [];
  for (let i = 0; i + span < frames.length; i += st) {
    if (frames[i].t < 0.16 || frames[i + span].t > data.clip.duration - 0.16) continue;
    const s = analyzeWindow(frames, i, i + span);
    if (s) { s.file = data.file; s.scale = data.scale; s.cycles = 0; s._data = data; out.push(s); }
  }
  return out;
}

// Loop snap: move a window's end (+-0.25 s) to the frame whose leg pose (relative to the hips) best matches the start,
// so the cycle closes on the same phase (sliding windows closed 13-35 deg apart and popped at the wrap).
const LEGS = ['LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'];
function legPoseErr(fa, fb) { let e = 0; const ia = fa.world.Hips.wq.clone().invert(), ib = fb.world.Hips.wq.clone().invert();
  for (const n of LEGS) { if (!fa.world[n] || !fb.world[n]) continue; e = Math.max(e, qAngle(ia.clone().multiply(fa.world[n].wq), ib.clone().multiply(fb.world[n].wq))); } return e * 180 / Math.PI; }
function snapLoop(data, seg) { const F = data.frames, dt = F[1].t - F[0].t, w = Math.round(0.25 / dt); let best = seg.i1, be = Infinity;
  for (let j = Math.max(seg.i0 + 8, seg.i1 - w); j <= Math.min(F.length - 1, seg.i1 + w); j++) { const e = legPoseErr(F[seg.i0], F[j]); if (e < be) { be = e; best = j; } }
  if (best === seg.i1) return { ...seg, snapErr: be }; const s2 = analyzeWindow(F, seg.i0, best); return s2 ? { ...seg, ...s2, snapErr: be } : { ...seg, snapErr: be }; }

function retargetCmuSegment(data, seg0, label, opts) {
  const seg = snapLoop(data, seg0);
  const t0 = data.frames[seg.i0].t, t1 = data.frames[seg.i1].t;
  const srcFrames = sampleSource(data.root, 'cmu', data.poser, t0, t1, ANALYZE_FPS, data.scale, data.rest);
  const { frames: posed, headingFit } = retargetFrames(srcFrames, data.rest, tgtRestWorld, data.C, tgtLocalRest);
  restoreRigBind();
  return packClip(label, posed, path.basename(data.file) + ` t=${t0.toFixed(2)}-${t1.toFixed(2)}`, headingFit, {
    sourceVel: opts && opts.zeroVel ? null : { fwd: seg.fwd, right: seg.right, speed: seg.speed },
    ...(opts || {}),
  });
}

function pickAndPack(cands, name, extra) {
  if (!cands.length) { console.warn('NO', name, 'segment'); return null; }
  const sorted = cands.slice().sort((a, b) => b._score - a._score);
  let best = null;
  const nTry = Math.min(5, sorted.length);
  for (let i = 0; i < nTry; i++) {
    const p = retargetCmuSegment(sorted[i]._data, sorted[i], name, extra);
    const cost = p.meta.loopErr + p.measure.driftCm * 3 + Math.max(0, p.measure.maxDelta - 35) * 4;
    console.log('  try', name, p.meta.src, 'cost', cost.toFixed(1));
    if (!best || cost < best._cost) { best = p; best._cost = cost; }
  }
  return best;
}

const cache = new Map();
function getCmu(file) {
  if (!cache.has(file)) {
    console.log('  parse', path.basename(file));
    const data = collectCmuFrames(loadBvh(file));
    console.log('    contacts', data.contacts.length, 'dur', data.clip.duration.toFixed(2));
    cache.set(file, data);
  }
  return cache.get(file);
}

const STRAFE_FILES = [];
for (let i = 42; i <= 67; i++) STRAFE_FILES.push(path.join(CMU, `69_${i}.bvh`));
const BACK_FILES = [];
for (let i = 50; i <= 55; i++) BACK_FILES.push(path.join(CMU, `69_${i}.bvh`));
const TURN_FILES = [];
for (let i = 16; i <= 19; i++) TURN_FILES.push(path.join(CMU, `69_${i}.bvh`));

console.log('scanning CMU strafes');
const strafeLCands = [], strafeRCands = [];
for (const file of STRAFE_FILES) {
  if (!fs.existsSync(file)) continue;
  const data = getCmu(file);
  const cands = [...candidatesFrom(data, 2), ...slideWindows(data, 1.8, 0.25)];
  for (const c of cands) {
    const sc = scoreStrafe(c);
    if (sc < 0) continue;
    c._score = sc;
    (c.right < 0 ? strafeLCands : strafeRCands).push(c);
  }
}
console.log('strafeL candidates', strafeLCands.length, 'strafeR', strafeRCands.length);

console.log('scanning CMU backWalk');
const backCands = [];
for (const file of BACK_FILES) {
  if (!fs.existsSync(file)) continue;
  const data = getCmu(file);
  const cands = [...candidatesFrom(data, 2), ...candidatesFrom(data, 1), ...slideWindows(data, 1.2, 0.15), ...slideWindows(data, 1.8, 0.2)];
  for (const c of cands) {
    const sc = scoreBack(c);
    if (sc < 0) continue;
    c._score = sc;
    backCands.push(c);
  }
}
console.log('backWalk candidates', backCands.length);

console.log('scanning CMU turns');
const turnLCands = [], turnRCands = [];
for (const file of TURN_FILES) {
  if (!fs.existsSync(file)) continue;
  const data = getCmu(file);
  const cands = [...candidatesFrom(data, 1), ...candidatesFrom(data, 2), ...slideWindows(data, 0.8, 0.1), ...slideWindows(data, 1.2, 0.15)];
  for (const c of cands) {
    const sl = scoreTurn(c, +1), sr = scoreTurn(c, -1);
    if (sl > 0) turnLCands.push({ ...c, _score: sl });
    if (sr > 0) turnRCands.push({ ...c, _score: sr });
  }
}
console.log('turnL candidates', turnLCands.length, 'turnR', turnRCands.length);

const packed = [];
const strafeL = pickAndPack(strafeLCands, 'strafeL');
const strafeR = pickAndPack(strafeRCands, 'strafeR');
const backWalk = pickAndPack(backCands, 'backWalk');
const turnL = pickAndPack(turnLCands, 'turnL', { zeroVel: true });
const turnR = pickAndPack(turnRCands, 'turnR', { zeroVel: true });
if (strafeL) packed.push(strafeL);
if (strafeR) packed.push(strafeR);
if (backWalk) packed.push(backWalk);
if (turnL) packed.push(turnL);
if (turnR) packed.push(turnR);

console.log('loading KayKit');
const kayGltf = await loadGltf(KAY);
const kayRoot = kayGltf.scene;
kayRoot.updateMatrixWorld(true);
const kayRest = captureRest(kayRoot, 'kay');
const kayC = corrections(kayRest);
const kayHips = findBone(kayRoot, 'hips');
const kayHipPos = new THREE.Vector3();
kayHips.getWorldPosition(kayHipPos);
const kayScale = meshyHipY / kayHipPos.y;
console.log('KayKit hip Y', kayHipPos.y.toFixed(4), 'scale', kayScale.toFixed(3));
const kayAnims = new Map();
for (const a of kayGltf.animations) kayAnims.set(a.name, a);

function retargetKay(clipName, outName) {
  const clip = kayAnims.get(clipName);
  if (!clip) throw new Error('missing KayKit clip ' + clipName);
  const poser = makePoser(kayRoot, clip);
  const srcFrames = sampleSource(kayRoot, 'kay', poser, 0, clip.duration || 1 / FPS, ANALYZE_FPS, kayScale, kayRest);
  const { frames: posed, headingFit } = retargetFrames(srcFrames, kayRest, tgtRestWorld, kayC, tgtLocalRest);
  restoreRigBind();
  return packClip(outName, posed, 'KayKit ' + clipName, headingFit, {});
}

function meanHip(clipName) {
  const clip = kayAnims.get(clipName);
  const poser = makePoser(kayRoot, clip);
  const n = 24, ys = [];
  for (let i = 0; i < n; i++) {
    poser((clip.duration || 0) * (i / Math.max(1, n - 1)));
    kayHips.getWorldPosition(_v);
    ys.push(_v.y);
  }
  return mean(ys);
}

packed.push(retargetKay('Running_Strafe_Left', 'runStrafeL'));
packed.push(retargetKay('Running_Strafe_Right', 'runStrafeR'));
packed.push(retargetKay('Walking_Backwards', 'backRun'));
const sneakY = meanHip('Sneaking');
const crouchY = meanHip('Crouching');
const crouchSrc = crouchY <= sneakY ? 'Crouching' : 'Sneaking';
console.log('crouchWalk pick', crouchSrc, 'hips Sneaking', sneakY.toFixed(3), 'Crouching', crouchY.toFixed(3));
packed.push(retargetKay(crouchSrc, 'crouchWalk'));
if (!packed.find((p) => p.name === 'backWalk')) {
  console.log('backWalk fallback KayKit Walking_Backwards');
  packed.push(retargetKay('Walking_Backwards', 'backWalk'));
}
restoreRigBind();

const names = packed.map((p) => p.name);
const expect = ['strafeL', 'strafeR', 'backWalk', 'runStrafeL', 'runStrafeR', 'backRun', 'crouchWalk', 'turnL', 'turnR'];
for (const n of expect) if (!names.includes(n)) console.warn('missing clip', n);

const out = new Document();
const scene = out.createScene('fighter-loco');
const buffer = out.createBuffer();
const dstNodes = new Map();
for (const row of OUT_BONES) {
  const rest = tgtRestWorld[row.dst];
  const node = out.createNode(row.dst).setRotation(qToArr(rest.lq)).setTranslation(rest.lp.toArray());
  scene.addChild(node);
  dstNodes.set(row.dst, node);
}
const meta = {};
for (const clip of packed) {
  const anim = out.createAnimation(clip.name);
  for (const row of OUT_BONES) {
    addChannel(out, anim, dstNodes.get(row.dst), 'rotation', clip.sample.times, clip.sample.rots[row.dst], buffer);
    if (row.hips) {
      const posVals = new Float32Array(clip.sample.times.length * 3);
      for (let i = 0; i < clip.sample.times.length; i++) {
        posVals[i * 3] = tgtRestT.x;
        posVals[i * 3 + 1] = clip.sample.pos[i * 3 + 1];
        posVals[i * 3 + 2] = tgtRestT.z;
      }
      addChannel(out, anim, dstNodes.get(row.dst), 'translation', clip.sample.times, posVals, buffer);
    }
  }
  meta[clip.name] = clip.meta;
}

await io.write(TMP, out);
execFileSync(path.join(R, 'node_modules/.bin/gltfpack'), ['-i', TMP, '-o', OUT, '-cc', '-kn', '-km', '-ac'], { stdio: 'inherit' });
fs.rmSync(TMP, { force: true });
fs.writeFileSync(META, JSON.stringify(meta, null, 2) + '\n');
const bytes = fs.statSync(OUT).size;
console.log('wrote', OUT, bytes, 'meta', META);
console.log('\nclip          src                              dur   fwd    right  speed  turn   loopErr');
for (const n of expect) {
  const m = meta[n];
  if (!m) { console.log(n.padEnd(13), 'MISSING'); continue; }
  console.log(n.padEnd(13), String(m.src).padEnd(32).slice(0, 32), m.duration.toFixed(2).padStart(5),
    m.fwd.toFixed(2).padStart(6), m.right.toFixed(2).padStart(6), m.speed.toFixed(2).padStart(6),
    m.turnRate.toFixed(1).padStart(6), String(m.loopErr.toFixed(2)).padStart(7));
}
if (bytes > 600 * 1024) console.warn('output exceeds 600 KB:', bytes);
