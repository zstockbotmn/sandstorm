// Retarget Quaternius CC0 Universal Animation Library (Godot Standard) onto the Meshy fighter rig.
// Local rotation deltas (anim * inv(rest)) transfer when both rigs use glTF Y-along-bone.
// Hips X/Z are pinned; Y bob is scaled metres -> the rig's centimetre node space.
// Usage: node tools/retarget-quaternius.mjs
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Document, NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

const R = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(R, 'assets-src/quaternius/AnimationLibrary_Godot_Standard.gltf');
const RIG = path.join(R, 'assets/models/fighter1.rig.glb');
const OUT = path.join(R, 'assets/models/fighter.quaternius.anim.glb');
const TMP = path.join(R, 'assets/models/.fighter.quaternius.anim.tmp.glb');

// Quaternius bone -> Meshy bone. Spine02 is the hips child on the Meshy rig.
const MAP = [
  ['DEF-hips', 'Hips', true],
  ['DEF-spine.001', 'Spine02'],
  ['DEF-spine.002', 'Spine01'],
  ['DEF-spine.003', 'Spine'],
  ['DEF-neck', 'neck'],
  ['DEF-head', 'Head'],
  ['DEF-shoulder.L', 'LeftShoulder'],
  ['DEF-upper_arm.L', 'LeftArm'],
  ['DEF-forearm.L', 'LeftForeArm'],
  ['DEF-hand.L', 'LeftHand'],
  ['DEF-shoulder.R', 'RightShoulder'],
  ['DEF-upper_arm.R', 'RightArm'],
  ['DEF-forearm.R', 'RightForeArm'],
  ['DEF-hand.R', 'RightHand'],
  ['DEF-thigh.L', 'LeftUpLeg'],
  ['DEF-shin.L', 'LeftLeg'],
  ['DEF-foot.L', 'LeftFoot'],
  ['DEF-toe.L', 'LeftToeBase'],
  ['DEF-thigh.R', 'RightUpLeg'],
  ['DEF-shin.R', 'RightLeg'],
  ['DEF-foot.R', 'RightFoot'],
  ['DEF-toe.R', 'RightToeBase'],
];

const CLIPS = [
  ['walk', 'Walk_Loop'],
  ['run', 'Sprint_Loop'],
  ['crouch', 'Crouch_Fwd_Loop'],
  ['lean', 'Pistol_Aim_Neutral'],
  ['death', 'Death01'],
  ['idle', 'Idle_Loop'],
  ['hit', 'Hit_Chest'],
  ['jog', 'Jog_Fwd_Loop'],
  ['crouchIdle', 'Crouch_Idle_Loop'],
  ['aim', 'Pistol_Aim_Neutral'],
  ['shoot', 'Pistol_Shoot'],
  ['hitHead', 'Hit_Head'],
];

const FPS = 20;
const CM = 100; // Quaternius translations are metres; Meshy nodes are centimetres.

function qmul(a, b) {
  const ax = a[0], ay = a[1], az = a[2], aw = a[3];
  const bx = b[0], by = b[1], bz = b[2], bw = b[3];
  return [
    ax * bw + aw * bx + ay * bz - az * by,
    ay * bw + aw * by + az * bx - ax * bz,
    az * bw + aw * bz + ax * by - ay * bx,
    aw * bw - ax * bx - ay * by - az * bz,
  ];
}
function qinv(a) { return [-a[0], -a[1], -a[2], a[3]]; }
function qnorm(a) {
  const l = Math.hypot(a[0], a[1], a[2], a[3]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l, a[3] / l];
}
function qaxis(x, y, z, ang) {
  const h = ang * 0.5;
  const s = Math.sin(h);
  const l = Math.hypot(x, y, z) || 1;
  return [x / l * s, y / l * s, z / l * s, Math.cos(h)];
}
function slerp(a, b, t) {
  let cos = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let bb = b;
  if (cos < 0) { cos = -cos; bb = [-b[0], -b[1], -b[2], -b[3]]; }
  if (cos > 0.9995) return qnorm([
    a[0] + (bb[0] - a[0]) * t,
    a[1] + (bb[1] - a[1]) * t,
    a[2] + (bb[2] - a[2]) * t,
    a[3] + (bb[3] - a[3]) * t,
  ]);
  const th = Math.acos(Math.min(1, cos));
  const s = Math.sin(th);
  const w1 = Math.sin((1 - t) * th) / s;
  const w2 = Math.sin(t * th) / s;
  return [a[0] * w1 + bb[0] * w2, a[1] * w1 + bb[1] * w2, a[2] * w1 + bb[2] * w2, a[3] * w1 + bb[3] * w2];
}
function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function indexNodes(doc) {
  const map = new Map();
  for (const n of doc.getRoot().listNodes()) map.set(n.getName(), n);
  return map;
}

function channelTable(anim) {
  const table = new Map();
  for (const ch of anim.listChannels()) {
    const node = ch.getTargetNode();
    if (!node) continue;
    const path = ch.getTargetPath();
    if (path !== 'rotation' && path !== 'translation') continue;
    const sampler = ch.getSampler();
    table.set(node.getName() + '|' + path, {
      times: sampler.getInput().getArray(),
      values: sampler.getOutput().getArray(),
      interp: sampler.getInterpolation(),
      stride: path === 'rotation' ? 4 : 3,
    });
  }
  return table;
}

function sample(keys, t) {
  const times = keys.times;
  const n = times.length;
  const stride = keys.stride;
  const at = (i) => keys.values.subarray(i * stride, i * stride + stride);
  if (n === 1 || t <= times[0]) return at(0);
  if (t >= times[n - 1]) return at(n - 1);
  let hi = 1;
  while (hi < n && times[hi] < t) hi += 1;
  const lo = hi - 1;
  if (keys.interp === 'STEP') return at(lo);
  const span = times[hi] - times[lo] || 1;
  const u = (t - times[lo]) / span;
  if (stride === 4) return slerp(at(lo), at(hi), u);
  return lerp3(at(lo), at(hi), u);
}

function durationOf(table) {
  let d = 0;
  for (const keys of table.values()) {
    const times = keys.times;
    if (times.length) d = Math.max(d, times[times.length - 1]);
  }
  return d;
}

// Slight torso yaw + side lean. No dedicated lean clip in the library.
const LEAN_BONES = new Set(['Spine', 'Spine01', 'Spine02']);
const LEAN_Q = qnorm(qmul(qaxis(0, 1, 0, 0.22), qaxis(0, 0, 1, 0.28)));

await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
});
const src = await io.read(SRC);
const rig = await io.read(RIG);
const srcNodes = indexNodes(src);
const rigNodes = indexNodes(rig);

const pairs = [];
for (const row of MAP) {
  const srcNode = srcNodes.get(row[0]);
  const dstNode = rigNodes.get(row[1]);
  if (!srcNode || !dstNode) {
    console.warn('missing bone', row[0], !!srcNode, row[1], !!dstNode);
    continue;
  }
  pairs.push({
    srcName: row[0],
    dstName: row[1],
    hips: !!row[2],
    srcRestQ: srcNode.getRotation().slice(),
    srcRestT: srcNode.getTranslation().slice(),
    dstRestQ: dstNode.getRotation().slice(),
    dstRestT: dstNode.getTranslation().slice(),
    srcInv: qinv(qnorm(srcNode.getRotation().slice())),
  });
}
if (!pairs.some((p) => p.dstName === 'Hips')) throw new Error('Hips map failed');

const anims = new Map();
for (const a of src.getRoot().listAnimations()) anims.set(a.getName(), a);

const out = new Document();
const scene = out.createScene('fighter-anims');
const buffer = out.createBuffer();
const dstNodes = new Map();
for (const p of pairs) {
  const node = out.createNode(p.dstName)
    .setRotation(p.dstRestQ)
    .setTranslation(p.dstRestT);
  scene.addChild(node);
  dstNodes.set(p.dstName, node);
}

for (const spec of CLIPS) {
  const clipName = spec[0];
  const srcAnim = anims.get(spec[1]);
  if (!srcAnim) throw new Error('missing clip ' + spec[1]);
  const table = channelTable(srcAnim);
  const dur = durationOf(table);
  const steps = Math.max(2, Math.round(dur * FPS) + 1);
  const times = new Float32Array(steps);
  for (let i = 0; i < steps; i++) times[i] = dur * (i / (steps - 1));

  const anim = out.createAnimation(clipName);
  for (const p of pairs) {
    const rotKeys = table.get(p.srcName + '|rotation');
    const rotVals = new Float32Array(steps * 4);
    for (let i = 0; i < steps; i++) {
      const qSrc = rotKeys ? qnorm(sample(rotKeys, times[i])) : qnorm(p.srcRestQ);
      let q = qnorm(qmul(p.dstRestQ, qmul(p.srcInv, qSrc)));
      if (clipName === 'lean' && LEAN_BONES.has(p.dstName)) q = qnorm(qmul(q, LEAN_Q));
      rotVals[i * 4] = q[0];
      rotVals[i * 4 + 1] = q[1];
      rotVals[i * 4 + 2] = q[2];
      rotVals[i * 4 + 3] = q[3];
    }
    addChannel(anim, dstNodes.get(p.dstName), 'rotation', times, rotVals, buffer);

    if (!p.hips) continue;
    const posKeys = table.get(p.srcName + '|translation');
    const posVals = new Float32Array(steps * 3);
    let x0 = p.dstRestT[0];
    let z0 = p.dstRestT[2];
    for (let i = 0; i < steps; i++) {
      const tSrc = posKeys ? sample(posKeys, times[i]) : p.srcRestT;
      const y = p.dstRestT[1] + (tSrc[1] - p.srcRestT[1]) * CM;
      if (i === 0) { x0 = p.dstRestT[0]; z0 = p.dstRestT[2]; }
      posVals[i * 3] = x0;
      posVals[i * 3 + 1] = y;
      posVals[i * 3 + 2] = z0;
    }
    addChannel(anim, dstNodes.get(p.dstName), 'translation', times, posVals, buffer);
  }
  console.log('clip', clipName, 'from', spec[1], 'keys', steps, 'dur', dur.toFixed(2));
}

function addChannel(anim, node, path, times, values, buffer) {
  const input = out.createAccessor().setType('SCALAR').setArray(times).setBuffer(buffer);
  const output = out.createAccessor()
    .setType(path === 'rotation' ? 'VEC4' : 'VEC3')
    .setArray(values)
    .setBuffer(buffer);
  const sampler = out.createAnimationSampler().setInput(input).setOutput(output).setInterpolation('LINEAR');
  const channel = out.createAnimationChannel().setTargetNode(node).setTargetPath(path).setSampler(sampler);
  anim.addSampler(sampler);
  anim.addChannel(channel);
}

await io.write(TMP, out);
const pack = path.join(R, 'node_modules/.bin/gltfpack');
execFileSync(pack, ['-i', TMP, '-o', OUT, '-cc', '-kn', '-km', '-ac'], { stdio: 'inherit' });
fs.rmSync(TMP, { force: true });
const bytes = fs.statSync(OUT).size;
console.log('wrote', OUT, bytes);
