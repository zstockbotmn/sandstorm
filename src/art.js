import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

// Names match assets/models/<name>.glb. dist/ serves index.html with assets/ beside it.
const PRIMARY = ['fighter1.rig', 'fighter2.rig', 'fighter3.rig', 'fighter.quaternius.anim', 'bldg1', 'bldg2', 'bldg3', 'bldg4'];
const ANIM_FALLBACK = 'fighter1.anim';
const PROP_ART = ['prop_sandbags', 'prop_burnedcar', 'prop_drum', 'prop_crates', 'prop_cart'];
const PROPS = ['bldg1.lod', 'bldg2.lod', 'bldg3.lod', 'bldg4.lod', 'rifle_ak47', ...PROP_ART, ...PROP_ART.map((n) => n + '.lod')];
const RIGS = ['fighter1.rig', 'fighter2.rig', 'fighter3.rig'];
const BONE_NAMES = ['Hips', 'Spine01', 'Spine', 'Head', 'RightHand', 'LeftArm', 'LeftForeArm', 'RightArm', 'RightForeArm', 'LeftUpLeg', 'LeftLeg', 'RightUpLeg', 'RightLeg'];
const CLIP_KEYS = {
  Combat_Stance: 'idle',
  Walk_Left_with_Gun: 'strafe',
  Run_and_Shoot: 'run',
  Gunshot_Reaction: 'hit',
  walk: 'walk',
  run: 'run',
  crouch: 'crouch',
  lean: 'lean',
  death: 'death',
  idle: 'idle',
  hit: 'hit',
};

const assets = Object.create(null);
let clips = null;
const waiters = [];

function detectTier() {
  try {
    const search = (typeof location !== 'undefined' && location && location.search) || '';
    if (/[?&]art=0(?:&|$)/.test(search)) return 'low';
  } catch (e) { /* no location */ }
  try {
    if (typeof localStorage !== 'undefined' && localStorage && localStorage.getItem('ss-art') === '0') return 'low';
  } catch (e) { /* private mode */ }
  return 'high';
}

function isMissing(err) {
  const status = err && err.response && err.response.status;
  if (status === 404) return true;
  const msg = String((err && err.message) || err || '');
  return /\b404\b/.test(msg) || /not found/i.test(msg);
}

// No scene env map: cap metalness so albedo stays visible, keep metalnessMap.
function fixObject(root) {
  root.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.castShadow = true;
    obj.receiveShadow = true;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    for (let i = 0; i < mats.length; i++) {
      const m = mats[i];
      if (!m || m.metalness == null) continue;
      m.metalness = Math.min(m.metalness, 0.05);
      if (m.roughness != null) m.roughness = Math.max(m.roughness, 0.6);
    }
  });
}

// Drop scale tracks. Keep hips Y bob, pin X/Z so the clip plays in place.
function pinHipXZ(track) {
  const times = track.times;
  const src = track.values;
  if (!times.length || src.length < 3) return track;
  const stride = src.length / times.length;
  if (stride < 3) return track;
  const values = new Float32Array(src);
  const base = stride === 9 ? 3 : 0;
  const x0 = values[base];
  const z0 = values[base + 2];
  for (let i = 0; i < values.length; i += stride) {
    values[i + base] = x0;
    values[i + base + 2] = z0;
  }
  const next = new THREE.VectorKeyframeTrack(track.name, times, values);
  if (track.createInterpolant && track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline) {
    next.createInterpolant = track.createInterpolant;
  }
  return next;
}

function bakeClips(animations) {
  const out = {};
  for (let i = 0; i < animations.length; i++) {
    const clip = animations[i];
    const key = CLIP_KEYS[clip.name];
    if (!key) continue;
    const tracks = [];
    for (let t = 0; t < clip.tracks.length; t++) {
      const track = clip.tracks[t];
      if (track.name.endsWith('.scale')) continue;
      if (track.name === 'Hips.position' || track.name.endsWith('/Hips.position')) tracks.push(pinHipXZ(track));
      else tracks.push(track);
    }
    if (tracks.length) out[key] = new THREE.AnimationClip(clip.name, clip.duration, tracks);
  }
  // Gameplay strafe is a walk cycle. Quaternius has no lateral clip.
  if (out.walk && !out.strafe) out.strafe = out.walk;
  return out;
}

function makeLoader() {
  const loader = new GLTFLoader();
  loader.setMeshoptDecoder(MeshoptDecoder);
  return loader;
}

function loadOne(name) {
  return makeLoader().loadAsync('assets/models/' + name + '.glb');
}

function clipsUsable(baked) {
  return !!(baked && baked.idle && baked.run && baked.hit && (baked.strafe || baked.walk));
}

function adopt(name, gltf) {
  fixObject(gltf.scene);
  if (name === 'fighter.quaternius.anim' || name === 'fighter1.anim') {
    const baked = bakeClips(gltf.animations || []);
    if (clipsUsable(baked)) clips = baked;
  }
  assets[name] = gltf.scene;
}

const _hp = new THREE.Vector3();

// Bind-pose height: toe/foot world Y up to Head + 0.15. Armature scale is already in the file.
function measureHeight(root) {
  root.updateMatrixWorld(true);
  let minY = Infinity;
  const feet = ['LeftToeBase', 'RightToeBase', 'LeftFoot', 'RightFoot'];
  for (let i = 0; i < feet.length; i++) {
    const b = root.getObjectByName(feet[i]);
    if (!b) continue;
    b.getWorldPosition(_hp);
    if (_hp.y < minY) minY = _hp.y;
  }
  const head = root.getObjectByName('Head');
  if (!head || minY === Infinity) return 0;
  head.getWorldPosition(_hp);
  return (_hp.y + 0.15) - minY;
}

function makeAction(mixer, clip, once) {
  const action = mixer.clipAction(clip);
  if (once) {
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = false;
  } else {
    action.setLoop(THREE.LoopRepeat, Infinity);
  }
  return action;
}

function fighterInstance(i) {
  const rigs = [];
  for (let k = 0; k < RIGS.length; k++) if (assets[RIGS[k]]) rigs.push(RIGS[k]);
  if (!rigs.length || !clips || !clips.idle || !clips.strafe || !clips.run || !clips.hit) return null;
  const n = Number.isFinite(i) ? i : 0;
  const name = rigs[((n % rigs.length) + rigs.length) % rigs.length];
  const root = SkeletonUtils.clone(assets[name]);
  const mixer = new THREE.AnimationMixer(root);
  const actions = {
    idle: makeAction(mixer, clips.idle, false),
    strafe: makeAction(mixer, clips.strafe || clips.walk, false),
    walk: makeAction(mixer, clips.walk || clips.strafe, false),
    run: makeAction(mixer, clips.run, false),
    crouch: makeAction(mixer, clips.crouch || clips.idle, false),
    lean: makeAction(mixer, clips.lean || clips.idle, false),
    hit: makeAction(mixer, clips.hit, true),
  };
  if (clips.death) actions.death = makeAction(mixer, clips.death, true);
  const bones = {};
  for (let k = 0; k < BONE_NAMES.length; k++) {
    bones[BONE_NAMES[k]] = root.getObjectByName(BONE_NAMES[k]) || null;
  }
  return { root, mixer, actions, bones, height: measureHeight(root), name };
}

function staticInstance(name) {
  const src = assets[name];
  if (!src) return null;
  // Shares geometry and materials. Do not clone textures.
  const full = src.clone(true);
  const lo = assets[name + '.lod'];
  if (!lo) return full;
  // Perf LOD: full (UV-correct) mesh within LOD_NEAR m, geometry-only simplified mesh beyond, using the full model's material.
  let mat = null; full.traverse((o) => { if (!mat && o.isMesh) mat = o.material; });
  const far = lo.clone(true); far.traverse((o) => { if (o.isMesh) { o.material = mat || o.material; o.castShadow = false; } });
  const lod = new THREE.LOD(); lod.addLevel(full, 0); lod.addLevel(far, /^prop_/.test(name) ? LOD_NEAR_PROP : LOD_NEAR); lod.name = name;
  return lod;
}
const LOD_NEAR = 38, LOD_NEAR_PROP = 22;

const _box = new THREE.Box3();
const _size = new THREE.Vector3();

// Fit object inside sx,sy,sz. alignLong swaps X/Z with a 90° yaw when the long axes disagree.
// longStretch lets the long horizontal axis grow past the uniform scale (sandbags), capped.
function fitToBox(object, sx, sy, sz, opts) {
  opts = opts || {};
  const keepAspect = opts.keepAspect !== false;
  const alignLong = opts.alignLong !== false;
  const longStretch = opts.longStretch > 1 ? opts.longStretch : 1;
  object.position.set(0, 0, 0);
  object.rotation.set(0, 0, 0);
  object.scale.set(1, 1, 1);
  object.updateMatrixWorld(true);
  _box.setFromObject(object);
  _box.getSize(_size);
  const sizeX = Math.max(Math.abs(_size.x), 1e-4);
  const sizeY = Math.max(Math.abs(_size.y), 1e-4);
  const sizeZ = Math.max(Math.abs(_size.z), 1e-4);
  const modelLongX = sizeX > sizeZ;
  const modelLongZ = sizeZ > sizeX;
  const boxLongX = sx > sz;
  const boxLongZ = sz > sx;
  const rot = alignLong && (modelLongX || modelLongZ) && (boxLongX || boxLongZ) && modelLongX !== boxLongX;
  const ex = rot ? sizeZ : sizeX;
  const ez = rot ? sizeX : sizeZ;
  const ey = sizeY;
  let kx;
  let ky;
  let kz;
  if (!keepAspect) {
    kx = sx / ex;
    ky = sy / ey;
    kz = sz / ez;
  } else {
    const s = Math.min(sx / ex, sy / ey, sz / ez);
    kx = s;
    ky = s;
    kz = s;
    if (longStretch > 1 && sz > sx) kz = s * Math.min(longStretch, Math.max(1, sz / (ez * s)));
    else if (longStretch > 1 && sx > sz) kx = s * Math.min(longStretch, Math.max(1, sx / (ex * s)));
  }
  // Local X maps to world Z after +90° yaw, so the world-axis scales swap.
  object.rotation.y = rot ? Math.PI / 2 : 0;
  object.scale.set(rot ? kz : kx, ky, rot ? kx : kz);
  object.updateMatrixWorld(true);
  _box.setFromObject(object);
  object.position.set(
    -(_box.min.x + _box.max.x) * 0.5,
    -_box.min.y,
    -(_box.min.z + _box.max.z) * 0.5
  );
  object.updateMatrixWorld(true);
  _box.setFromObject(object);
  return new THREE.Vector3(_box.max.x - _box.min.x, _box.max.y - _box.min.y, _box.max.z - _box.min.z);
}

function finish() {
  if (art.done) return;
  art.done = true;
  const list = waiters.splice(0, waiters.length);
  for (let i = 0; i < list.length; i++) {
    try { list[i](); } catch (err) { console.warn('art onReady', err); }
  }
}

// Soft caps: abandon remaining downloads past the wall-clock timeout or byte budget and keep code-built fallbacks.
const LOAD_TIMEOUT_MS = 12000;
const BYTE_BUDGET = 12 * 1024 * 1024;
let bytesUsed = 0;
let timedOut = false;

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(Object.assign(new Error('art load timeout'), { timeout: true })), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function loadOneBudget(name) {
  if (timedOut || bytesUsed >= BYTE_BUDGET) {
    return { name, skipped: true };
  }
  const url = 'assets/models/' + name + '.glb';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = new Error('HTTP ' + res.status);
      err.response = res;
      throw err;
    }
    const buf = await res.arrayBuffer();
    bytesUsed += buf.byteLength;
    if (bytesUsed > BYTE_BUDGET) {
      // Keep this last asset only if primary; otherwise drop to stay near the cap.
      if (PROPS.indexOf(name) >= 0) {
        return { name, skipped: true, overBudget: true };
      }
    }
    const gltf = await makeLoader().parseAsync(buf, 'assets/models/');
    return { name, gltf, bytes: buf.byteLength };
  } catch (err) {
    return { name, err, missing: isMissing(err), timeout: !!(err && err.timeout) };
  }
}

async function loadGroup(names, optional) {
  const remaining = Math.max(500, LOAD_TIMEOUT_MS - (performance.now() - loadStarted));
  let rows;
  try {
    rows = await withTimeout(Promise.all(names.map(loadOneBudget)), remaining);
  } catch (err) {
    timedOut = true;
    console.warn('art load timeout; falling back to code-built art for remaining assets');
    rows = names.map((name) => ({ name, skipped: true, timeout: true }));
  }
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.gltf) {
      adopt(row.name, row.gltf);
      art.loaded.push(row.name);
      art.bytes = bytesUsed;
    } else if (row.skipped) {
      art.failed.push(row.name);
    } else if (!(optional && row.missing)) {
      art.failed.push(row.name);
      if (!optional) console.warn('art failed:', row.name, row.err && (row.err.message || row.err));
    }
  }
}

const art = {
  tier: detectTier(),
  loaded: [],
  failed: [],
  done: false,
  bytes: 0,
  budget: BYTE_BUDGET,
  get(name) {
    return assets[name] || null;
  },
  onReady(fn) {
    if (art.done) fn();
    else waiters.push(fn);
  },
  fighterInstance,
  staticInstance,
  fitToBox,
  measureHeight,
};

let loadStarted = 0;
if (art.tier === 'low') {
  finish();
} else {
  loadStarted = performance.now();
  loadGroup(PRIMARY, false).then(() => {
    if (clipsUsable(clips)) return null;
    return loadGroup([ANIM_FALLBACK], false);
  }).then(() => loadGroup(PROPS, true)).then(finish).catch((err) => {
    console.warn('art load', err);
    finish();
  });
}

export { art };
