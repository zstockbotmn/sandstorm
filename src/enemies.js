const CALM = typeof location !== 'undefined' && /[?&]calm=1/.test(location.search); // tests: no auto spawns
import * as THREE from 'three';
import { art, SPLIT_ANIMS } from './art.js';
import { LOCO2, createLoco, updateLoco, aimBody, clipYawRate, turnPlayback, yawRateStep, wrapPi, stepPhase, smooth01, MOVE_YAW_MAX, PLANT_YAW_MAX, TWIST_MAX, HEAD_YAW_MAX, PLANT_TWIST_MAX, TURN_ENTER, TURN_DONE } from './locomotion.js';
// Last fighter only: after ~20 s on one ground cover, run to another. Off unless ?loco=2 or ?repos=1.
const BODY_YAW_CAP = 270 * Math.PI / 180, TWIST_RATE = 240 * Math.PI / 180, HEAD_RATE = 300 * Math.PI / 180; // ?loco=2 facing rate caps (App PM: no whipping)
const REPOS = (() => { try { return !!(LOCO2 || /[?&]repos=1\b/.test(location.search)); } catch (_) { return !!LOCO2; } })();
const HITS2 = (() => { try { return /[?&]hits=2\b/.test(location.search); } catch (_) { return false; } })();
import { createRagdollSystem } from './ragdoll.js';
import { createReactState, kickReact, stepReact, applyReact } from './hitreact.js';

// m1v tunables: wave-1 enemy damage multiplier (tester died at the first cover every run) and the cover grace period
export const WAVE1_DAMAGE = 0.6;
// m1v: the softer first wave covers the opening only (game seconds) - a player who never clears wave 1 (standing still)
// goes back to full damage after this, so loitering stays lethal (stand-still death target 60-90 s).
export const WAVE1_SOFT_S = 40;
// far-hit (Low): a fighter could land a hit in its very first visible frame (peek / relocation) and be gone again before
// the player could see it. A hit now needs the shooter continuously visible (game's own gate) for this long, in real AND
// game time; a relocation/teleport restarts that clock, cancels the burst and holds fire for the same time.
export const SEEN_BEFORE_HIT_S = 0.6; // within 3 s of a relocation/teleport
export const SEEN_PEEK_S = 0; // ordinary peeks from the same cover: only the instantaneous gate (the 0.2 s hold pushed stand-still death past 180 s)
// cover grace: COVER_GRACE_S in cover.js
const BODY_DMG = 55;
const HEAD_DMG = 100;
const LIMB_DMG = 34; // m1x (App PM): torso kills in 2, head in 1, limbs can take more (3)
const MAX_HEALTH = 100;

const _look = new THREE.Vector3();
const _muzzle = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _wA = new THREE.Vector3();
const _wB = new THREE.Vector3();

const ENEMY_SCALE = 1.2; // ~20% larger; adult silhouette ~1.85–2.1 m
const HB_TORSO_W = 1.12, HB_HEAD = 1.2, HB_Q_LIMB = 0.65, HB_Q_TORSO = 0.65, HB_Q_HEAD = 0.75; // fit percentiles: below the max so hip/shoulder vertices skinned to limb bones do not inflate the boxes (aim-reg: 92% silhouette cover, <= 36% spill) // m1w item 6: hit volumes fitted to the visible skinned body (test/aim-reg.js coverage)

function shemaghTexture() {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = '#4a1410';
  g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#1a0c0a';
  g.lineWidth = 10;
  for (let i = -128; i < 256; i += 16) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + 128, 128);
    g.stroke();
  }
  g.strokeStyle = '#c45c42';
  g.lineWidth = 5;
  for (let i = -120; i < 256; i += 16) {
    g.beginPath();
    g.moveTo(i + 8, 0);
    g.lineTo(i + 136, 128);
    g.stroke();
  }
  g.strokeStyle = '#f2e6d4';
  g.lineWidth = 3;
  for (let y = 0; y < 128; y += 16) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(128, y);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}

function visMat(color, extra = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: extra.roughness ?? 0.82,
    metalness: extra.metalness ?? 0.02,
    map: extra.map || null,
    emissive: extra.emissive != null ? extra.emissive : color,
    emissiveIntensity: extra.emissiveIntensity ?? 0.06,
  });
}

function soft(r, g, b) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, `rgba(${r},${g},${b},0.95)`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Pressure / stall tuning
const UNSEEN_LIMIT = 5;       // s an enemy may stay out of sight before it is despawned
const NOPROGRESS_LIMIT = 5;   // s without progress and no visible enemy -> resume walking
const STREET_X = 5.6;         // ground enemies stay on the street side of the facades (|x| <= this)
const HOLD_RANGE = 45;        // walking pauses only for exposed enemies within this range
const STALL_LIMIT = 20;       // s stalled without a hit before the failsafe kicks in
const STALL_GRACE = 6;        // s of forced walking after the failsafe
const PRESSURE_RAMP = 55;     // s standing still to reach full pressure
const PRESSURE_HIT = 1.0;     // extra hit chance multiplier at full pressure
const PRESSURE_TEMPO = 0.8;   // extra enemy tempo (fire rate, push-in speed) at full pressure
const RUN_RAMP = 300;         // s of run time adding up to +30% pressure
function difficulty() {
  const dist = window.SS && window.SS.distance ? window.SS.distance : 0;
  return Math.max(0, Math.min(1, dist / 500)); // ramps with distance: full at 500 m
}

export function createEnemies(scene, camera, world, weapon, player) {
  const root = new THREE.Group();
  scene.add(root);
  const ragdolls = createRagdollSystem(scene);

  const S = ENEMY_SCALE;
  const scarfMap = shemaghTexture();
  const matSkin = visMat(0xa56b48, { roughness: 0.72, emissive: 0x3a2014 });
  const matCloth = visMat(0x2c3228, { roughness: 0.88, emissive: 0x121510 });
  const matClothDark = visMat(0x161814, { roughness: 0.9, emissive: 0x080907 });
  const matVest = visMat(0x0c0d0c, { roughness: 0.86, emissive: 0x050505 });
  const matScarf = visMat(0xffffff, { map: scarfMap, roughness: 0.92, emissive: 0x3a1810, emissiveIntensity: 0.08 });
  const matRifle = visMat(0x0a0b0a, { roughness: 0.5, metalness: 0.35, emissive: 0x050505 });
  const matWood = visMat(0x2a1c12, { roughness: 0.78, emissive: 0x120c08 });
  const matRim = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
    depthWrite: false,
  });

  // Small red chevron over enemies at range when unscoped, so they read without the scope.
  const markerMat = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const g = c.getContext('2d');
    // Clearer marker: screen-constant size (sizeAttenuation off), red chevron with a white outline + dark rim.
    g.lineJoin = 'round'; g.beginPath(); g.moveTo(4, 6); g.lineTo(28, 6); g.lineTo(16, 27); g.closePath();
    g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,0.6)'; g.stroke(); g.lineWidth = 2.5; g.strokeStyle = '#fff'; g.stroke(); g.fillStyle = '#ff2a1f'; g.fill();
    const t = new THREE.CanvasTexture(c); return new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }); })();
  // Hitboxes stay mesh.visible so shots connect; this material is what hides them.
  const ghostMat = new THREE.MeshBasicMaterial({ visible: false });
  // ?hitbox: debug overlay draws enemy hitboxes (wireframe, through walls).
  if (/[?&]hitbox/.test(location.search)) Object.assign(ghostMat, { visible: true, wireframe: true, color: new THREE.Color(0x00ff66), depthTest: false, transparent: true, opacity: 0.8 });
  let fighterCursor = 0;
  const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 3, 6);
  const geoTorso = capsule(0.17 * S, 0.42 * S);
  const geoHead = new THREE.SphereGeometry(0.135 * S, 10, 8);
  const geoLimb = capsule(0.055 * S, 0.28 * S);
  const geoLeg = capsule(0.07 * S, 0.38 * S);
  const geoScar = new THREE.SphereGeometry(0.14 * S, 8, 6);

  function addRim(mesh, extra = 1.07) {
    const rim = new THREE.Mesh(mesh.geometry, matRim);
    rim.scale.setScalar(extra);
    rim.castShadow = false;
    rim.receiveShadow = false;
    mesh.add(rim);
    return rim;
  }

  const bloodMat = new THREE.SpriteMaterial({
    map: soft(160, 16, 12),
    transparent: true,
    depthWrite: false,
  });
  const flashes = [];
  const tracers = [];
  const blood = [];
  const decals = [];
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));

  for (let i = 0; i < 8; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({
      map: soft(255, 190, 90),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }));
    s.visible = false;
    s.scale.setScalar(0.35);
    scene.add(s);
    flashes.push({ sprite: s, life: 0 });
  }
  for (let i = 0; i < 10; i++) {
    const line = new THREE.Line(lineGeo.clone(), new THREE.LineBasicMaterial({
      color: 0xffc56a,
      transparent: true,
      opacity: 0.9,
    }));
    line.visible = false;
    line.frustumCulled = false;
    scene.add(line);
    tracers.push({ line, life: 0 });
  }
  for (let i = 0; i < 36; i++) {
    const s = new THREE.Sprite(bloodMat.clone());
    s.visible = false;
    scene.add(s);
    blood.push({ sprite: s, life: 0, vel: new THREE.Vector3() });
  }

  const list = [];
  const hitZones = HITS2 ? { armL: 0, armR: 0, legL: 0, legR: 0, torso: 0 } : null;
  const api = { list, update };
  // Test hook: pin an enemy at (x, z) facing the camera in a posture, AI frozen (stagger), for hit-registration tests.
  api.debugPose = (e, x, z, posture) => { e.pinned = true; e.group.position.set(x, 0, z); e.staggerT = 1e9; e.moving = false; e.exposed = true; e.posture = posture || 'idle'; e.phase = 'peek'; e.turned = false;
  api.playerSees = (e) => playerSees(e);
    turnTo(e, camera.position.x, camera.position.z, 100); e.shootCd = 1e9; return e; };

  let phase = 'quiet';
  let phaseT = 0;
  let quietCap = 0, waveOpen = false, regenWaitT = 0; // never stragglers (a quiet-phase spawn made the first wave 1 or 3)
  const FIRST_WAVE_AT = 6;
  // m1x pacing preview (App PM): a run opens with a quiet walk; distant gunfire swells from APPROACH_S, a TEXT radio
  // warning shows RADIO_WARN_S before contact, first contact no earlier than FIRST_CONTACT_S of run time (and FIRST_WAVE_AT m).
  // Tunable: ?contact=<s> (debug/test builds only) overrides FIRST_CONTACT_S.
  const FIRST_CONTACT_S = (() => { try { const m = /[?&]contact=([0-9.]+)/.exec(location.search); if (m && (navigator.webdriver || /[?&]debug\b/.test(location.search))) return +m[1]; } catch (_) {} return 11; })(); // App PM (bundle): the opening walk was 24 s, Zack found it long
  const RADIO_WARN_S = 5, APPROACH_S = 3; // build-up from ~3 s, radio at ~6 s (11 - 5); the radio line still holds >= 6 s real / 5 frames, so at low fps it may overlap contact
  let quietRunT = 0, quietRealAt = 0, radioWarned = false;
  api.FIRST_CONTACT_S = FIRST_CONTACT_S; api.RADIO_WARN_S = RADIO_WARN_S;
  let waveSpawned = 0, waveTotal = 0; // hard cap: every wave has a fixed total, truck included
  let burstCap = 3, burstSpawned = 0, waveActive = false, roofWave = false;
  let spawnCd = 1.2;
  let lastReal = 0, lastProg = 0, noProgT = 0, losT = 0, anySeen = false;
  const losRay = new THREE.Raycaster(); const _ep = new THREE.Vector3(), _ed = new THREE.Vector3();
  let stallT = 0, standT = 0, graceT = 0, runT = 0, pressure = 0;
  let waveClears = 0;
  let breatherTo = 6;          // no spawns until the player has walked this far (breather after WAVE CLEARED)
  let prevHold = false;       // edge-detect walk resume -> WAVE CLEARED
  let displayEngaged = 0;     // stable ENEMIES HUD: only rises on new engage, falls on death
  let contactHintShown = false;
  let burstIndex = 0;         // softens first waves

  function register(mesh, enemy, part) {
    mesh.userData.enemy = enemy;
    mesh.userData.part = part;
    weapon.targets.push(mesh);
  }

  function unregister(enemy) {
    const targets = weapon.targets;
    for (let i = targets.length - 1; i >= 0; i--) {
      if (targets[i].userData && targets[i].userData.enemy === enemy) targets.splice(i, 1);
    }
  }

  function hideKids(mesh) {
    for (let i = 0; i < mesh.children.length; i++) mesh.children[i].visible = false;
  }

  // Feet land on the group origin. Height was measured on bones before this scale.
  function plantFeet(root) {
    root.updateMatrixWorld(true);
    let minY = Infinity;
    const names = ['LeftToeBase', 'RightToeBase', 'LeftFoot', 'RightFoot'];
    for (let i = 0; i < names.length; i++) {
      const b = root.getObjectByName(names[i]);
      if (!b) continue;
      b.getWorldPosition(_wA);
      if (_wA.y < minY) minY = _wA.y;
    }
    if (minY !== Infinity) root.position.y -= minY;
  }

  function crossTo(enemy, next, fade) {
    const prev = enemy.currentAction;
    next.reset().setEffectiveWeight(1).setEffectiveTimeScale(1);
    const dur = next.getClip().duration || 0;
    if (dur > 0 && next !== enemy.actions.hit) next.time = enemy.animPhase * dur;
    next.play();
    if (prev && prev !== next) prev.crossFadeTo(next, fade, false);
    enemy.currentAction = next;
  }

  // walk/run while moving, crouch in cover, lean on a peek, idle exposed, hit/death override.
  function desiredAnim(enemy) {
    if (enemy.dying) return 'death';
    if (enemy.forceAnim && enemy.actions[enemy.forceAnim]) return enemy.forceAnim; // pose-shots test hook
    if (!enemy.moving) {
      const A = enemy.actions;
      if (enemy.posture === 'crouch') return A.crouchIdle ? 'crouchIdle' : 'crouch';
      if (enemy.posture === 'lean') return 'lean';
      if (enemy.exposed && A.aim && enemy.phase !== 'relocate') return 'aim';
      return 'idle';
    }
    if (enemy.posture === 'crouch' && enemy.actions.crouch) return 'crouch';
    if (enemy.moveKind === 'walk') return 'walk';
    if (enemy.moveKind === 'strafe') return enemy.actions.strafe ? 'strafe' : 'walk';
    if (enemy.actions.jog && (enemy.moveSpeed || 0) < 3.6) return 'jog';
    return 'run';
  }

  // Procedural spine lean (no CC0 rifle-lean clip exists): roll the spine about the body's forward axis toward
  // the street when peeking, plus a slight forward hunch while aiming. Applied after the mixer, weight eased.
  const _lnAxis = new THREE.Vector3(), _lnQ = new THREE.Quaternion(), _lnP = new THREE.Quaternion();
  function bendBone(bone, worldAxis, ang) {
    if (!bone || !bone.parent || !ang) return;
    bone.parent.getWorldQuaternion(_lnP).invert();
    _lnAxis.copy(worldAxis).applyQuaternion(_lnP).normalize();
    bone.quaternion.premultiply(_lnQ.setFromAxisAngle(_lnAxis, ang));
  }
  const _fwdW = new THREE.Vector3(), _rightW = new THREE.Vector3();
  // Head look-at toward the player, limited to +-55 deg yaw / +-25 deg pitch, eased (no snapping or bobbing).
  // ?loco=2: the player when engaged, otherwise the last threat. Total head yaw +-75 deg, spine twist included.
  const _hlD = new THREE.Vector3(), _hlF = new THREE.Vector3(), _hlR = new THREE.Vector3();
  const SPINE_CHAIN = ['Spine02', 'Spine01', 'Spine', 'neck', 'Neck'];
  function spineBones(enemy) {
    if (enemy._spineChain) return enemy._spineChain;
    const r = enemy.art && enemy.art.root;
    const list = [], seen = new Set();
    if (r) for (let i = 0; i < SPINE_CHAIN.length; i++) {
      const b = r.getObjectByName(SPINE_CHAIN[i]);
      if (b && !seen.has(b)) { seen.add(b); list.push(b); }
    }
    if (!list.length && enemy.bones) {
      if (enemy.bones.Spine01) list.push(enemy.bones.Spine01);
      if (enemy.bones.Spine && enemy.bones.Spine !== enemy.bones.Spine01) list.push(enemy.bones.Spine);
    }
    enemy._spineChain = list;
    return list;
  }
  function lowFar(enemy) {
    let q = '';
    try { q = (window.SS && window.SS.quality) || window.SS_QUALITY || ''; } catch (e) { q = ''; }
    if (q !== 'low' && q !== 'ultra-low') return false;
    const p = enemy.group.position, c = camera.position;
    const dx = p.x - c.x, dy = p.y - c.y, dz = p.z - c.z;
    return dx * dx + dy * dy + dz * dz > 900;
  }
  // Spine twist toward aimYaw, spread over the chain, eased. Low / ultra-low past 30 m keep the head only.
  function aimPose(enemy, dt) {
    const body = Number.isFinite(enemy.bodyYaw) ? enemy.bodyYaw : groupYaw(enemy.group);
    const aim = Number.isFinite(enemy.aimYaw) ? enemy.aimYaw : body;
    const rel = wrapPi(aim - body - (enemy._hipShown || 0));
    const skip = lowFar(enemy);
    const goal = skip ? 0 : (rel < -TWIST_MAX ? -TWIST_MAX : rel > TWIST_MAX ? TWIST_MAX : rel);
    const k = dt > 0 ? 1 - Math.exp(-dt / 0.09) : 0;
    let dtw = (goal - (enemy.twist || 0)) * k; const capT = TWIST_RATE * (dt > 0 ? dt : 0); if (dtw > capT) dtw = capT; else if (dtw < -capT) dtw = -capT; // rate-capped: no upper-body whip at low fps
    let tw = (enemy.twist || 0) + dtw;
    if (tw > TWIST_MAX) tw = TWIST_MAX; else if (tw < -TWIST_MAX) tw = -TWIST_MAX;
    if (Math.abs(tw) < 1e-4) tw = 0;
    enemy.twist = tw;
    if (skip || !tw) return;
    const chain = spineBones(enemy);
    if (!chain.length) return;
    const part = tw / chain.length;
    for (let i = 0; i < chain.length; i++) {
      bendBone(chain[i], _up, part);
      chain[i].updateMatrixWorld(true);
    }
  }
  function headLook(enemy, dt) {
    const h = enemy.bones && enemy.bones.Head; if (!h || !h.parent) return;
    enemy.group.updateMatrixWorld(true);
    h.getWorldPosition(_hlD);
    const locoAim = LOCO2 && !enemy.pinned && !(enemy.staggerT > 0) && !enemy.hitPlaying;
    if (!locoAim) {
      _hlD.subVectors(camera.position, _hlD);
      _hlF.set(0, 0, 1).applyQuaternion(enemy.group.quaternion); _hlR.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
      const yaw = Math.atan2(_hlD.dot(_hlR), _hlD.dot(_hlF)), pitch = Math.atan2(_hlD.y, Math.hypot(_hlD.x, _hlD.z));
      const ty = Math.max(-0.96, Math.min(0.96, yaw)), tp = Math.max(-0.44, Math.min(0.44, pitch));
      const k = Math.min(1, dt * 5); enemy.lookY = (enemy.lookY || 0) + (ty - (enemy.lookY || 0)) * k; enemy.lookP = (enemy.lookP || 0) + (tp - (enemy.lookP || 0)) * k;
      bendBone(h, _up, enemy.lookY); bendBone(h, _hlR, -enemy.lookP);
      return;
    }
    const engaged = aimEngaged(enemy);
    const lookAt = engaged ? camera.position : enemy.threatPos;
    _hlF.set(0, 0, 1).applyQuaternion(enemy.group.quaternion); _hlR.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
    let yaw = 0, pitch = 0;
    if (lookAt) {
      _hlD.subVectors(lookAt, _hlD);
      yaw = Math.atan2(_hlD.dot(_hlR), _hlD.dot(_hlF)); pitch = Math.atan2(_hlD.y, Math.hypot(_hlD.x, _hlD.z));
    }
    const ty = Math.max(-HEAD_YAW_MAX, Math.min(HEAD_YAW_MAX, yaw)), tp = Math.max(-0.44, Math.min(0.44, pitch));
    let extra = ty - (enemy.twist || 0) - (enemy._hipShown || 0);
    if (LOCO2 && enemy.fidget === 'glance') extra += (enemy._fidYaw || 0) * (enemy._fidEase || 0);
    if (extra > HEAD_YAW_MAX) extra = HEAD_YAW_MAX; else if (extra < -HEAD_YAW_MAX) extra = -HEAD_YAW_MAX;
    const k = dt > 0 ? 1 - Math.exp(-dt * 6) : 0; // framerate-independent (min(1, dt*6) snapped fully on a 0.2 s frame)
    { let d = (extra - (enemy.lookY || 0)) * k; const capH = HEAD_RATE * (dt > 0 ? dt : 0); if (d > capH) d = capH; else if (d < -capH) d = -capH; enemy.lookY = (enemy.lookY || 0) + d; }
    enemy.lookP = (enemy.lookP || 0) + (tp - (enemy.lookP || 0)) * k;
    const sum = enemy.lookY + (enemy.twist || 0) + (enemy._hipShown || 0);
    if (sum > HEAD_YAW_MAX) enemy.lookY -= sum - HEAD_YAW_MAX;
    else if (sum < -HEAD_YAW_MAX) enemy.lookY -= sum + HEAD_YAW_MAX;
    bendBone(h, _up, enemy.lookY); bendBone(h, _hlR, -enemy.lookP);
  }
  function proceduralLean(enemy, name, dt) {
    const b = enemy.bones; if (!b || enemy.dying || window.SS_NOPROC) { enemy.leanW = 0; return; }
    if (LOCO2 && !enemy.pinned && !(enemy.staggerT > 0) && !enemy.hitPlaying) { leadHips(enemy, dt); aimPose(enemy, dt); }
    else if (LOCO2) { enemy.twist = 0; enemy._hipShown = 0; }
    headLook(enemy, dt);
    // ?loco=2 cover peek: leanW IS the smoothstep peek, not the old dt*6 chase.
    const driven = !!(LOCO2 && enemy._coverDrive && !enemy.pinned);
    const tgtRoll = driven ? (enemy.peekT || 0) : (name === 'lean' ? 1 : 0);
    const tgtHunch = (name === 'aim' || name === 'lean') ? 1 : 0;
    const k = Math.min(1, dt * 6);
    if (driven) { enemy.leanW = tgtRoll; enemy.hunchW = tgtRoll; }
    else { enemy.leanW = (enemy.leanW || 0) + (tgtRoll - (enemy.leanW || 0)) * k; enemy.hunchW = (enemy.hunchW || 0) + (tgtHunch - (enemy.hunchW || 0)) * k; }
    if (enemy.leanW < 0.01 && enemy.hunchW < 0.01) return;
    const g = enemy.group;
    _fwdW.set(0, 0, 1).applyQuaternion(g.quaternion);
    _rightW.set(1, 0, 0).applyQuaternion(g.quaternion);
    // Lean toward the street centre (x = 0) from whichever side the fighter is on.
    const side = g.position.x > 0 ? 1 : -1;
    let roll = 0.32 * enemy.leanW * side * (_rightW.x >= 0 ? 1 : -1);
    let hunch = 0.12 * enemy.hunchW;
    // Over-the-top pitch (low cover). A crouch-peek hunches a little more. Side roll stays the street lean.
    if (driven && enemy.peekKind === 'over') {
      roll *= 0.2;
      hunch = (enemy.peekHigh === false ? 0.34 : 0.18) * enemy.leanW;
    } else if (driven && enemy.peekKind && enemy.peekHigh === false) hunch = 0.2 * enemy.leanW;
    g.updateMatrixWorld(true);
    bendBone(b.Spine01 || b.Spine, _fwdW, roll * 0.5);
    bendBone(b.Spine01 || b.Spine, _rightW, hunch * 0.5);
    if (b.Spine && b.Spine01) { b.Spine01.updateMatrixWorld(true); bendBone(b.Spine, _fwdW, roll * 0.5); bendBone(b.Spine, _rightW, hunch * 0.5); }
    if (b.Head) bendBone(b.Head, _fwdW, -roll * 0.4);
  }

  // Fix 9: the native idle (and aim, which reuses it) holds the left arm stiffly straight out, off the rifle. Two-bone IK
  // brings the left hand onto the handguard (a point ahead of the right hand along the body's facing), eased in/out.
  const _saT = new THREE.Vector3(), _saF = new THREE.Vector3(), _saR = new THREE.Vector3(), _saS = new THREE.Vector3();
  function supportArm(enemy, name, dt) {
    const want = (name === 'idle' || name === 'aim') && !enemy.hitPlaying && !enemy.dying && !window.SS_NOPROC ? 1 : 0;
    enemy.saW = (enemy.saW || 0) + (want - (enemy.saW || 0)) * Math.min(1, dt * 8);
    if (enemy.saW < 0.01) return;
    const b = enemy.bones, r = enemy.art.root; if (!b || !b.LeftArm || !b.LeftForeArm || !b.RightArm || !b.RightForeArm || !b.RightHand) return;
    const lh = enemy.leftHand || (enemy.leftHand = r.getObjectByName('LeftHand')); if (!lh) return;
    enemy.group.updateMatrixWorld(true);
    _saF.set(0, 0, 1).applyQuaternion(enemy.group.quaternion); _saF.y = 0; _saF.normalize();
    if (LOCO2 && !enemy.pinned && !(enemy.staggerT > 0)) {
      const off = (enemy.twist || 0) + (enemy._hipShown || 0);
      if (off) {
        const c = Math.cos(off), s = Math.sin(off), x = _saF.x, z = _saF.z;
        _saF.x = c * x + s * z; _saF.z = -s * x + c * z;
      }
    }
    _saR.set(0, 1, 0).cross(_saF).negate(); // fighter's right
    const qa = b.LeftArm.quaternion.clone(), qf = b.LeftForeArm.quaternion.clone(), ra = b.RightArm.quaternion.clone(), rf = b.RightForeArm.quaternion.clone();
    // right (trigger) hand low at the chest, just right of centre; the clip held it straight out to the side
    b.RightArm.getWorldPosition(_saS); _saT.copy(_saS).addScaledVector(_saF, 0.3).addScaledVector(_saR, -0.08); _saT.y -= 0.24;
    twoBone(b.RightArm, b.RightForeArm, b.RightHand, _saT); twoBone(b.RightArm, b.RightForeArm, b.RightHand, _saT);
    // left (support) hand on the handguard ahead of it
    b.RightHand.getWorldPosition(_saT); _saT.addScaledVector(_saF, 0.32).addScaledVector(_saR, -0.06); _saT.y += 0.04;
    twoBone(b.LeftArm, b.LeftForeArm, lh, _saT); twoBone(b.LeftArm, b.LeftForeArm, lh, _saT);
    if (enemy.saW < 0.99) { for (const [bone, q0] of [[b.LeftArm, qa], [b.LeftForeArm, qf], [b.RightArm, ra], [b.RightForeArm, rf]]) bone.quaternion.copy(q0.slerp(bone.quaternion.clone(), enemy.saW)); r.updateMatrixWorld(true); }
  }

  // Foot IK + foot locking: after the mixer, each leg (UpLeg-Leg-Foot) is solved with an analytic two-bone IK so the
  // ankle reaches its target. A foot that is down (near ankle height) locks its world XZ until it lifts or would
  // over-stretch (0.32 m), so planted feet don't slide while the body moves. Ground = the fighter's support height.
  const _ikH = new THREE.Vector3(), _ikK = new THREE.Vector3(), _ikF = new THREE.Vector3(), _ikT = new THREE.Vector3();
  const _ikA = new THREE.Vector3(), _ikB = new THREE.Vector3(), _ikN = new THREE.Vector3(), _ikQ = new THREE.Quaternion(), _ikP = new THREE.Quaternion();
  function rotWorld(bone, q) { bone.parent.getWorldQuaternion(_ikP); const inv = _ikP.clone().invert(); bone.quaternion.premultiply(inv.multiply(q).multiply(_ikP)); bone.updateMatrixWorld(true); }
  function twoBone(up, knee, foot, T) {
    up.getWorldPosition(_ikH); knee.getWorldPosition(_ikK); foot.getWorldPosition(_ikF);
    const a = _ikH.distanceTo(_ikK), b = _ikK.distanceTo(_ikF); let d = _ikH.distanceTo(T);
    d = Math.min(Math.max(d, Math.abs(a - b) + 1e-3), a + b - 1e-3);
    // knee: current vs desired interior angle, rotated about the leg-plane normal
    _ikA.subVectors(_ikH, _ikK).normalize(); _ikB.subVectors(_ikF, _ikK).normalize();
    const cur = Math.acos(Math.max(-1, Math.min(1, _ikA.dot(_ikB))));
    const want = Math.acos(Math.max(-1, Math.min(1, (a * a + b * b - d * d) / (2 * a * b))));
    _ikN.crossVectors(_ikA, _ikB); if (_ikN.lengthSq() < 1e-8) return; _ikN.normalize();
    rotWorld(knee, _ikQ.setFromAxisAngle(_ikN, cur - want));
    // hip: swing the solved chain so the ankle points at the target
    foot.getWorldPosition(_ikF); _ikA.subVectors(_ikF, _ikH).normalize(); _ikB.subVectors(T, _ikH).normalize();
    rotWorld(up, _ikQ.setFromUnitVectors(_ikA, _ikB));
  }
  function leadHips(enemy, dt) {
    const planted = !!(enemy.footPlant && !enemy.moving && !enemy._turnBig && !(enemy.replantT > 0));
    const want = planted ? (enemy.hipLead || 0) : 0;
    const k = dt > 0 ? 1 - Math.exp(-dt / 0.1) : 1;
    enemy._hipShown = (enemy._hipShown || 0) + (want - (enemy._hipShown || 0)) * k;
    if (Math.abs(enemy._hipShown) < 1e-4) enemy._hipShown = 0;
    const h = enemy.bones && enemy.bones.Hips;
    if (!h || !enemy._hipShown) return;
    enemy.group.updateMatrixWorld(true);
    bendBone(h, _up, enemy._hipShown);
    h.updateMatrixWorld(true);
  }
  function footIK(enemy, dt) {
    const r = enemy.art && enemy.art.root; if (!r || enemy.dying || window.SS_NOPROC) return;
    if (!enemy.legs) {
      enemy.legs = [['LeftUpLeg', 'LeftLeg', 'LeftFoot'], ['RightUpLeg', 'RightLeg', 'RightFoot']].map((n) => ({ up: r.getObjectByName(n[0]), knee: r.getObjectByName(n[1]), foot: r.getObjectByName(n[2]), lock: null }))
        .filter((l) => l.up && l.knee && l.foot);
      r.updateMatrixWorld(true); const gy = enemy.group.position.y;
      enemy.ankleH = Math.max(0.04, Math.min(0.2, Math.min(...enemy.legs.map((l) => l.foot.getWorldPosition(_ikF).y - gy))));
    }
    // Pelvis drop: clips whose hips float (the jog/run retarget left both feet ~0.3-0.4 m up) are lowered so the lowest
    // foot meets the ground; eased so the body doesn't pop.
    if (enemy.rootY0 == null) enemy.rootY0 = r.position.y;
    r.updateMatrixWorld(true);
    { const gy0 = enemy.group.position.y + enemy.ankleH; let lo = Infinity; for (const L of enemy.legs) lo = Math.min(lo, L.foot.getWorldPosition(_ikF).y);
      const want = Math.min(0, (enemy.pelvisOff || 0) + (gy0 - lo) / Math.max(1e-3, r.parent ? r.parent.getWorldScale(_ikA).y : 1));
      enemy.pelvisOff = (enemy.pelvisOff || 0) + (want - (enemy.pelvisOff || 0)) * Math.min(1, dt * 12);
      r.position.y = enemy.rootY0 + enemy.pelvisOff + 0; r.updateMatrixWorld(true);
      // hard floor: never leave the lowest foot more than 4 cm above its rest height (the ease above lags on big swings)
      let lo2 = Infinity; for (const L of enemy.legs) lo2 = Math.min(lo2, L.foot.getWorldPosition(_ikF).y);
      const sc = Math.max(1e-3, r.parent ? r.parent.getWorldScale(_ikA).y : 1);
      if (lo2 > gy0 + 0.04) { enemy.pelvisOff -= (lo2 - gy0 - 0.04) / sc; r.position.y = enemy.rootY0 + enemy.pelvisOff; r.updateMatrixWorld(true); }
      enemy.ikLo = lo2; enemy.ikGy = gy0; }
    // Cover sink / breath sit on the root after the clip plant and before the two-bone, so the feet
    // stay down and syncArt (later this step) reads the same hips the mesh draws.
    if (LOCO2) {
      const yOff = coverYOffset(enemy, dt);
      const shifted = applyFidgetShift(enemy, r);
      if (yOff) r.position.y += yOff;
      if (yOff || shifted) r.updateMatrixWorld(true);
    }
    // Hit-react sink. footIK rewrites root y from rootY0 + pelvisOff every frame, so a
    // one-shot root.y -= drop in stepArt would vanish. Same offset path as cover yOff.
    if (enemy._reactDrop) { r.position.y -= enemy._reactDrop; r.updateMatrixWorld(true); }
    // Limp hip dip (set after the mixer). Same root-y path as the hit sink: footIK rewrites y each frame.
    if (HITS2 && enemy._limpDip) { r.position.y -= enemy._limpDip; r.updateMatrixWorld(true); }
    // pelvis drop runs at every range/tier (cheap); the two-bone solve + locking only on High within 30 m
    if (art.tier !== 'high' || camera.position.distanceToSquared(enemy.group.position) > 900) { enemy.legs.forEach((l) => { l.lock = null; }); return; }
    const ground = enemy.group.position.y + enemy.ankleH, out = enemy.ikDbg || (enemy.ikDbg = []);
    for (let i = 0; i < enemy.legs.length; i++) {
      const L = enemy.legs[i]; L.foot.getWorldPosition(_ikF);
      const down = _ikF.y < ground + 0.05;
      const was = L.lock;
      // ?loco=2 planted turn: hold the feet while the body yaws under 60 deg (the hip counter leads the chest).
      const plant = LOCO2 && enemy.footPlant && !enemy.moving;
      if (down && (enemy.moving || plant)) { if (!L.lock) L.lock = _ikF.clone().setY(ground); }
      else L.lock = null;
      if (L.lock && L.lock.distanceTo(_ikF.clone().setY(ground)) > 0.32) L.lock = null; // stride too long: release
      // Fix 11: a released lock eases back to the clip foot over ~0.12 s instead of snapping (the visible foot "pop").
      if (was && !L.lock) { L.rel = was; L.relT = 0.12; }
      if (L.lock) L.relT = 0;
      if (!L.lock && L.relT > 0) { L.relT = Math.max(0, L.relT - dt); const w = L.relT / 0.12; _ikT.copy(_ikF).lerp(L.rel, w * w); }
      else _ikT.copy(L.lock || _ikF);
      if (_ikT.y < ground) _ikT.y = ground; // never through the ground
      if (_ikT.distanceToSquared(_ikF) > 1e-6) {
        const d0 = _ikT.distanceTo(_ikF), qu = L.up.quaternion.clone(), qk = L.knee.quaternion.clone();
        twoBone(L.up, L.knee, L.foot, _ikT); twoBone(L.up, L.knee, L.foot, _ikT);
        L.foot.getWorldPosition(_ikF);
        // a solve that made things worse (or lifted the foot) is discarded: the clip pose + pelvis drop is the fallback
        if (_ikF.distanceTo(_ikT) > Math.min(d0, 0.05) || _ikF.y > ground + 0.06) { L.up.quaternion.copy(qu); L.knee.quaternion.copy(qk); L.up.updateMatrixWorld(true); L.lock = null; enemy.ikRejects = (enemy.ikRejects | 0) + 1; }
      }
      L.foot.getWorldPosition(_ikF); enemy.ikEnd = i ? Math.min(enemy.ikEnd, _ikF.y) : _ikF.y; out[i] = { err: +_ikF.distanceTo(_ikT).toFixed(3), tx: +_ikT.x.toFixed(2), ty: +_ikT.y.toFixed(2), locked: !!L.lock, x: +_ikF.x.toFixed(3), y: +_ikF.y.toFixed(3), z: +_ikF.z.toFixed(3) };
    }
  }

  // Clip ground speeds (m/s) for stride matching: playback rate follows real speed so feet don't slide.
  const STRIDE = { walk: 1.4, jog: 3.0, run: 5.2, crouch: 1.1, strafe: 1.4 };
  // Body frame matches the rig: forward is the group's +Z, right is the character's right (-X when facing +Z).
  const _locoF = new THREE.Vector3(), _locoR = new THREE.Vector3();
  function bodyFrame(enemy, dt) {
    const g = enemy.group, p = g.position;
    let fwd = 0, right = 0, turnRate = 0;
    if (enemy._locoPos && dt > 1e-5) {
      const dx = p.x - enemy._locoPos.x, dz = p.z - enemy._locoPos.z;
      _locoF.set(0, 0, 1).applyQuaternion(g.quaternion);
      _locoF.y = 0;
      const fl = Math.hypot(_locoF.x, _locoF.z);
      if (fl > 1e-6) { _locoF.x /= fl; _locoF.z /= fl; } else _locoF.set(0, 0, 1);
      _locoR.set(-_locoF.z, 0, _locoF.x);
      // A multi-metre jump is a cover reassignment, not a step. Leave it out of the gait.
      if (Math.hypot(dx, dz) < 1.25) {
        const inv = 1 / dt;
        fwd = (dx * _locoF.x + dz * _locoF.z) * inv;
        right = (dx * _locoR.x + dz * _locoR.z) * inv;
      }
      const gy = groupYaw(g); const dyaw = Math.atan2(Math.sin(gy - enemy._locoYaw), Math.cos(gy - enemy._locoYaw)); // groupYaw, not Euler rotation.y (that flips past +-90 deg: fake 1000+ deg/s turn rates fed the turn clips)
      turnRate = dyaw / dt;
    }
    if (!enemy._locoPos) enemy._locoPos = new THREE.Vector3();
    enemy._locoPos.copy(p);
    enemy._locoYaw = groupYaw(g);
    return { vel: { fwd, right }, turnRate };
  }
  // Stationary clip desiredAnim picks when the fighter is not moving.
  function locoBase(enemy) {
    const A = enemy.actions;
    if (enemy.posture === 'crouch') return A.crouchIdle ? 'crouchIdle' : 'crouch';
    if (enemy.posture === 'lean') return 'lean';
    if (enemy.exposed && A.aim && enemy.phase !== 'relocate') return 'aim';
    return 'idle';
  }
  function adoptLiveWeights(enemy) {
    const W = enemy.locoW, A = enemy.actions;
    if (!W || !A) return;
    for (const name in W) {
      const a = A[name];
      if (!a || a.enabled === false || (a.isScheduled && !a.isScheduled())) W[name] = 0;
      else W[name] = a.getEffectiveWeight ? (a.getEffectiveWeight() || 0) : 0;
    }
  }
  // Ease managed clips out while a hit / death / forceAnim owns the mixer, so they do not stack on the override.
  function parkBlend(enemy, dt, keep) {
    const W = enemy.locoW, A = enemy.actions;
    if (!W || !A) return;
    const k = dt > 0 ? 1 - Math.exp(-10 * dt) : 1;
    for (const name in W) {
      const a = A[name];
      if (name === keep || (a && a === enemy.currentAction)) {
        if (a && a.getEffectiveWeight) W[name] = a.enabled === false ? 0 : (a.getEffectiveWeight() || 0);
        continue;
      }
      let w = W[name] || 0;
      w += (0 - w) * k;
      if (w < 1e-3) w = 0;
      W[name] = w;
      if (!a) continue;
      if (!(w > 0)) {
        a.setEffectiveWeight(0);
        if (a.isScheduled && a.isScheduled()) a.stop();
        a.enabled = false;
      } else {
        a.enabled = true;
        a.setEffectiveWeight(w);
      }
    }
  }
  function upperFromBlend(enemy) {
    if (!enemy.actions.upper) return;
    let uw = 0;
    const W = enemy.locoW;
    if (W) for (const n in W) if (SPLIT_ANIMS.has(n) && W[n] > 0) uw += W[n];
    enemy.actions.upper.setEffectiveWeight(uw > 1 ? 1 : uw);
  }
  function noteDominant(enemy) {
    if (enemy.hitPlaying || enemy.dying) return; // playHit / kill crossfade from the clip that is actually down
    const W = enemy.locoW, A = enemy.actions;
    if (!W || !A) return;
    let best = null, bw = 0.05;
    for (const name in W) if (W[name] > bw && A[name]) { bw = W[name]; best = A[name]; }
    if (best) enemy.currentAction = best;
  }
  // ?loco=2 clip choice. Returns true when the blend layer owns this step (updateLoco already ran).
  // Death, forceAnim, and the body of a hit return false so the caller keeps today's crossTo.
  // The last 0.1 s of a hit returns true: the hit eases out and the blend eases back in.
  function applyLoco(enemy, dt) {
    const force = !!(enemy.forceAnim && enemy.actions[enemy.forceAnim]);
    if (enemy.hitPlaying && !enemy.hitReturning && enemy.actions.hit) {
      const hit = enemy.actions.hit;
      const dur = hit.getClip().duration || 0;
      const left = dur - hit.time;
      if (hit.time > 0 && left <= 0.1) enemy.hitReturning = true;
    }
    const m = bodyFrame(enemy, dt);
    enemy.loco.turnRate = m.turnRate;
    const hold = enemy.dying || force || (enemy.hitPlaying && !enemy.hitReturning);
    if (hold) {
      // The override owns the pose, so don't run the weight blend. Keep locoVel on the
      // measured velocity or a hit-stop would resume into the pre-hit gait.
      const v = enemy.locoVel;
      if (v) { v.fwd = m.vel.fwd; v.right = m.vel.right; v.speed = Math.hypot(m.vel.fwd, m.vel.right); }
      return false;
    }
    if (enemy._locoHeld) {
      adoptLiveWeights(enemy);
      const a = enemy.currentAction;
      const clip = a && a.getClip && a.getClip();
      if (a && clip && clip.duration > 0 && a !== enemy.actions.hit && a !== enemy.actions.hitHead && a !== enemy.actions.death) {
        const t = a.time || 0;
        enemy.animPhase = ((t % clip.duration) + clip.duration) % clip.duration / clip.duration;
      }
      enemy._locoHeld = false;
    }
    const base = locoBase(enemy);
    enemy.loco.base = base;
    // Raw body-frame velocity (diagonals included). updateLoco eases speed; do not smooth again.
    // Turn clips come from steerFacing (last frame). A moving yaw is not a turn-in-place.
    const cmd = enemy._turnCmd;
    const drive = !!enemy._coverDrive;
    updateLoco(enemy, dt, {
      vel: m.vel, crouch: enemy.posture === 'crouch', base: drive ? coverBase(enemy) : base, turnRate: m.turnRate, tier: art.tier,
      turnExplicit: true, turnClip: (cmd && cmd.clip) || null,
      turnBlend: cmd && cmd.blend != null ? cmd.blend : 0, turnPlay: (cmd && cmd.play) || 0,
      cover: drive ? (enemy.coverT || 0) : undefined,
      // Crouch-peek keeps the crouch blend (rise 0). Standing peek still hands weight to lean.
      peek: drive ? ((enemy.peekKind && enemy.peekHigh === false) ? 0 : (enemy.peekT || 0)) : undefined,
      limpSide: (HITS2 && enemy._limpSide && (enemy.limp || 0) > 0 && qName() !== 'ultra-low') ? enemy._limpSide : 0,
    });
    if (enemy.hitPlaying && enemy.hitReturning && enemy.actions.hit) {
      const hit = enemy.actions.hit;
      const dur = hit.getClip().duration || 0;
      const left = dur - hit.time;
      hit.setEffectiveWeight(left <= 0 ? 0 : Math.min(1, left / 0.1));
    }
    upperFromBlend(enemy);
    noteDominant(enemy);
    return true;
  }
  function qName() {
    let q = '';
    try { q = (window.SS && window.SS.quality) || window.SS_QUALITY || ''; } catch (e) { q = ''; }
    if (q === 'low' || q === 'ultra-low' || q === 'high') return q;
    return 'high';
  }
  function coverDestDist(enemy) {
    const path = enemy.path;
    const dest = (path && path.length && path[path.length - 1]) || enemy.goal;
    if (!dest) return 1e9;
    const p = enemy.group.position;
    return Math.hypot(dest.x - p.x, dest.z - p.z);
  }
  // Chest yaw in cover. Facade covers face the street; cars and barrels face +Z, the player side of the prop.
  function coverYawOf(enemy) {
    const a = enemy.anchor;
    if (!a || !a.pos) return null;
    if (a.type === 'car' || a.type === 'barrel') return 0;
    const side = Math.sign(a.pos.x) || 1;
    return side > 0 ? -Math.PI / 2 : Math.PI / 2;
  }
  // Standing clip the crouch blend rises toward. Hidden weight sits on crouchIdle via coverT, not this name.
  // A crouch-peek (peekHigh false) stays in the crouch clip instead of rising into lean.
  function coverBase(enemy) {
    const A = enemy.actions || {};
    if ((enemy.peekT || 0) > 0 && enemy.peekKind && enemy.peekHigh === false) {
      if (A.crouchIdle) return 'crouchIdle';
      if (A.crouch) return 'crouch';
    }
    if ((enemy.peekT || 0) > 0 && A.lean) return 'lean';
    if ((enemy.peekT || 0) > 0 && A.aim) return 'aim';
    return A.idle ? 'idle' : locoBase(enemy);
  }
  function crouchPeek(enemy) { return !!(enemy.peekKind && enemy.peekHigh === false); }
  // Wall/door/alley: both corners. Car/barrel: over the top or either end. Null = today's lean (roof/window).
  function peekChoices(type) {
    if (type === 'wall' || type === 'door' || type === 'alley') return ['left', 'right'];
    if (type === 'car' || type === 'barrel') return ['left', 'right', 'over'];
    return null;
  }
  // One peek plan. Skips lastPeekKind when the cover allows more than one spot. Rise 0.2–0.35 s; fire window scale ±30%.
  function armPeek(enemy) {
    if (enemy._peekArm) return;
    enemy._peekArm = true;
    enemy._peekFired = false;
    enemy._settleRoll = false;
    enemy.settleT = 0;
    enemy._peekRise = 0.2 + Math.random() * 0.15;
    enemy._fireScale = 0.7 + Math.random() * 0.6;
    const type = enemy.anchor && enemy.anchor.type;
    const opts = peekChoices(type);
    if (!opts) {
      enemy.peekSide = enemy.peekSide ? -enemy.peekSide : (Math.random() < 0.5 ? -1 : 1);
      enemy._stepDist = 0.25 + Math.random() * 0.15;
      return;
    }
    let pool = opts;
    if (enemy.lastPeekKind && opts.length > 1) {
      const next = [];
      for (let i = 0; i < opts.length; i++) if (opts[i] !== enemy.lastPeekKind) next.push(opts[i]);
      if (next.length) pool = next;
    }
    const kind = pool[(Math.random() * pool.length) | 0];
    enemy.peekKind = kind;
    enemy.lastPeekKind = kind;
    const low = type === 'car' || type === 'barrel';
    // A crouched head stays below a car roof, so over a car is always a standing peek. Barrels can be crouched over.
    if (kind === 'over') enemy.peekHigh = type === 'car' ? true : Math.random() < 0.2;
    else if (low) enemy.peekHigh = Math.random() < 0.35;
    else enemy.peekHigh = Math.random() < 0.8;
    enemy.peekSide = kind === 'left' ? -1 : kind === 'right' ? 1 : 0;
    enemy._stepDist = kind === 'over' ? (0.12 + Math.random() * 0.1) : (0.25 + Math.random() * 0.15);
  }
  // Entry 0.35 s, exit 0.30 s. Peek rise 0.25 s, or 0.2–0.35 s once a LOCO2 peek is armed. Duck 0.20 s.
  // Ultra-low: crouch only, and nothing past 30 m.
  function tickCover(enemy, dt) {
    if (enemy.pinned) { enemy._coverDrive = false; enemy._coverFace = false; enemy._sideStep = false; return; }
    const ph = enemy.phase;
    const q = qName();
    const farOff = q === 'ultra-low' && camera.position.distanceToSquared(enemy.group.position) > 900;
    const near = !farOff && (ph === 'approach' || ph === 'relocate' || ph === 'climb') && coverDestDist(enemy) <= 1;
    const wantC = !farOff && (ph === 'takeCover' || ph === 'hide' || ph === 'peek' || ph === 'fire' || near);
    const ducking = (enemy.duckT || 0) > 0;
    const wantP = !farOff && q !== 'ultra-low' && (ph === 'peek' || ph === 'fire') && !ducking;
    enemy._coverPh = stepPhase(enemy._coverPh, wantC ? 1 : 0, dt, wantC ? 0.35 : 0.30);
    const riseS = enemy._peekRise > 0 ? enemy._peekRise : 0.25;
    enemy._peekPh = stepPhase(enemy._peekPh, wantP ? 1 : 0, dt, wantP ? riseS : (ducking ? 0.17 : 0.20));
    enemy.coverT = smooth01(enemy._coverPh);
    enemy.peekT = smooth01(enemy._peekPh);
    if (ducking) enemy.duckT = Math.max(0, enemy.duckT - dt);
    if (ph === 'approach' || ph === 'relocate' || ph === 'takeCover') {
      const remain = coverDestDist(enemy);
      enemy.approachK = remain >= 1.5 ? 0 : remain <= 0 ? 1 : smooth01((1.5 - remain) / 1.5);
    } else enemy.approachK = 0;
    const leaving = (ph === 'approach' || ph === 'relocate') && !wantC;
    if (leaving && ((enemy._coverPh || 0) > 0.02 || ((enemy._exitPh || 0) > 0 && (enemy._exitPh || 0) < 1))) {
      enemy._exitPh = Math.min(1, (enemy._exitPh || 0) + dt / 0.4);
      enemy.exitK = smooth01(enemy._exitPh);
    } else { enemy._exitPh = 0; enemy.exitK = 0; }
    enemy._coverNear = !!near;
    enemy._coverYaw = coverYawOf(enemy);
    enemy._coverDrive = !!(wantC || wantP || enemy._coverPh > 0.001 || enemy._peekPh > 0.001);
    const rising = (ph === 'peek' || ph === 'fire') && enemy.peekT < 0.92 && enemy.coverT > 0.45;
    enemy._coverFace = !!(enemy._coverDrive && Number.isFinite(enemy._coverYaw) && !enemy.pinned && !(enemy.staggerT > 0) && (ph === 'takeCover' || ph === 'hide' || near || rising));
    const type = enemy.anchor && enemy.anchor.type;
    if (wantP && !enemy._peekArm) armPeek(enemy);
    if ((enemy.settleT || 0) > 0 && enemy._settleRoll) enemy.settleT = Math.max(0, enemy.settleT - dt);
    if (wantP && enemy.peekT >= 0.9 && !enemy._settleRoll) {
      enemy._settleRoll = true;
      enemy.settleT = 0.25 + Math.random() * 0.2; // look, then the first round of this peek
    }
    if (!wantP && enemy._peekPh <= 0) {
      enemy._peekArm = false;
      enemy.settleT = 0;
      enemy._settleRoll = false;
    }
    const corner = type === 'wall' || type === 'door' || type === 'alley';
    const lowC = type === 'car' || type === 'barrel';
    const stepOk = q === 'high' && !farOff && (corner || lowC);
    enemy._sideStep = !!(stepOk && enemy._peekArm && enemy._stepDist > 0 && enemy._peekPh > 0.001 && !enemy.pinned);
    tickFidget(enemy, dt);
  }
  // 1 = full braking over the last 1.5 m into cover. Exit: 0 at the first step (~1 m/s) → 1 at run speed.
  function coverGaitSpeed(enemy, speed) {
    const ph = enemy.phase;
    if (ph === 'approach' || ph === 'relocate' || ph === 'takeCover') {
      const k = enemy.approachK || 0;
      if (k > 0) speed = Math.max(0.5, speed + (0.6 - speed) * k);
    }
    if ((ph === 'approach' || ph === 'relocate') && ((enemy._exitPh || 0) > 0 || (enemy.coverT || 0) > 0.05)) {
      const e = enemy.exitK || 0;
      speed = 1 + (Math.max(speed, 1) - 1) * e;
      if ((enemy.curSpeed || 0) < 1) enemy.curSpeed = 1;
    }
    if (speed < 2.2 && enemy.moveKind === 'run') enemy.moveKind = 'walk';
    return speed;
  }
  function beginCoverExit(enemy) {
    if ((enemy.coverT || 0) > 0.05 || (enemy._coverPh || 0) > 0.05) {
      if (!(enemy._exitPh > 0)) { enemy._exitPh = 0.001; enemy.exitK = 0; }
    }
  }
  function fidEase(enemy) {
    if (!enemy.fidget) return 0;
    const dur = enemy._fidDur || 1;
    const left = Math.max(0, enemy._fidT || 0);
    const u = dur > 0 ? 1 - left / dur : 1;
    if (!(u > 0) || u >= 1) return 0;
    return Math.sin(u * Math.PI);
  }
  function tickFidget(enemy, dt) {
    const q = qName();
    const hidden = (enemy.coverT || 0) > 0.82 && (enemy.peekT || 0) < 0.18 && !enemy.moving
      && !enemy.hitPlaying && !enemy.dying && !(enemy.staggerT > 0);
    const allow = hidden && q !== 'ultra-low';
    if (!allow) {
      if (enemy.fidget) enemy._fidWait = 3 + Math.random() * 5;
      enemy.fidget = null; enemy._fidEase = 0; enemy._fidT = 0;
      return;
    }
    if (enemy.fidget) {
      enemy._fidT = (enemy._fidT || 0) - dt;
      enemy._fidEase = fidEase(enemy);
      if (enemy._fidT <= 0) {
        enemy.fidget = null; enemy._fidEase = 0;
        enemy._fidWait = 3 + Math.random() * 5;
      }
      return;
    }
    enemy._fidEase = 0;
    if (enemy._fidWait == null) enemy._fidWait = 3 + Math.random() * 5;
    enemy._fidWait -= dt;
    if (enemy._fidWait > 0) return;
    const d2 = camera.position.distanceToSquared(enemy.group.position);
    const kinds = ['shift', 'regrip'];
    if (!(q === 'low' && d2 > 625)) kinds.push('glance');
    const name = kinds[(Math.random() * kinds.length) | 0];
    enemy.fidget = name;
    enemy.fidgets = (enemy.fidgets | 0) + 1;
    enemy._fidDur = 0.8 + Math.random() * 0.8;
    enemy._fidT = enemy._fidDur;
    enemy._fidSide = Math.random() < 0.5 ? -1 : 1;
    enemy._fidMag = 0.03 + Math.random() * 0.02;
    enemy._fidEase = fidEase(enemy);
    if (name === 'glance') {
      const body = groupYaw(enemy.group);
      const aim = Number.isFinite(enemy.aimYaw) ? enemy.aimYaw : body;
      const rel = wrapPi(aim - body);
      const away = Math.abs(rel) > 0.1 ? (rel >= 0 ? -1 : 1) : enemy._fidSide;
      enemy._fidYaw = away * (20 + Math.random() * 15) * (Math.PI / 180);
    }
  }
  // Pelvis sideways 3-5 cm on the art root (reset each frame). FootIK then plants on High.
  function applyFidgetShift(enemy, r) {
    if (enemy._rootX0 == null) { enemy._rootX0 = r.position.x; enemy._rootZ0 = r.position.z; }
    let ox = 0, oz = 0;
    if (enemy.fidget === 'shift' && (enemy._fidEase || 0) > 0.001) {
      const mag = (enemy._fidMag || 0.04) * enemy._fidEase;
      const s = enemy._fidSide || 1;
      _rightW.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
      ox = _rightW.x * mag * s;
      oz = _rightW.z * mag * s;
    }
    const need = !!(ox || oz) || !!enemy._fidShiftOn;
    if (need) { r.position.x = enemy._rootX0 + ox; r.position.z = enemy._rootZ0 + oz; }
    enemy._fidShiftOn = !!(ox || oz);
    return need;
  }
  // Spine counter-tilt / shoulder-roll / hand offset. After mixer + supportArm, before syncArt.
  function applyFidget(enemy) {
    if (!enemy.fidget || !((enemy._fidEase || 0) > 0.001) || window.SS_NOPROC || enemy.dying || enemy.pinned) return;
    const b = enemy.bones; if (!b) return;
    const ease = enemy._fidEase;
    const g = enemy.group;
    g.updateMatrixWorld(true);
    _fwdW.set(0, 0, 1).applyQuaternion(g.quaternion);
    _rightW.set(1, 0, 0).applyQuaternion(g.quaternion);
    if (enemy.fidget === 'shift') {
      const ang = -(enemy._fidSide || 1) * 0.16 * ease;
      bendBone(b.Spine01 || b.Spine, _fwdW, ang);
      if (b.Spine && b.Spine01) { b.Spine01.updateMatrixWorld(true); bendBone(b.Spine, _fwdW, ang); }
    } else if (enemy.fidget === 'regrip') {
      const root = enemy.art && enemy.art.root;
      const sh = (root && (root.getObjectByName('RightShoulder') || root.getObjectByName('Right_Shoulder'))) || b.RightArm;
      bendBone(sh, _fwdW, 0.2 * ease);
      if (b.RightArm && sh !== b.RightArm) bendBone(b.RightArm, _rightW, 0.08 * ease);
      bendBone(b.RightForeArm, _up, 0.12 * ease);
    }
  }
  // Take the peek step off the group before pathing, then put it back after. Otherwise the
  // 0.25-0.4 m lateral never lets stepToward reach the fire point.
  function parkCoverStep(enemy) {
    const have = enemy._stepVec;
    if (!have || (have.x === 0 && have.z === 0)) return;
    enemy.group.position.x -= have.x;
    enemy.group.position.z -= have.z;
    have.x = 0;
    have.z = 0;
  }
  // Lateral clear of a wall/corner edge. World offset follows peekT so the duck reverses it.
  function applyCoverStep(enemy) {
    const have = enemy._stepVec || (enemy._stepVec = { x: 0, z: 0 });
    if (enemy.dying || enemy.pinned) return;
    let tx = 0, tz = 0;
    if (enemy._sideStep && enemy._stepDist > 0) {
      const yaw = Number.isFinite(enemy._coverYaw) ? enemy._coverYaw : groupYaw(enemy.group);
      const mag = (enemy.peekT || 0) * enemy._stepDist;
      if (enemy.peekKind === 'over') { tx = Math.sin(yaw) * mag; tz = Math.cos(yaw) * mag; } // crest the low cover
      else {
        const s = enemy.peekSide < 0 ? -1 : 1;
        tx = -Math.cos(yaw) * s * mag;
        tz = Math.sin(yaw) * s * mag;
      }
    }
    const dx = tx - have.x, dz = tz - have.z;
    if (dx * dx + dz * dz < 1e-12) return;
    enemy.group.position.x += dx;
    enemy.group.position.z += dz;
    have.x = tx;
    have.z = tz;
  }
  // Eased pelvis drop (entry) and <= 1.2 cm breath. Only while the two-bone plant can keep the feet down.
  function coverYOffset(enemy, dt) {
    if (!enemy._coverDrive || enemy.dying || enemy.pinned || enemy.hitPlaying || enemy.staggerT > 0 || window.SS_NOPROC) return 0;
    const c = enemy.coverT || 0, k = enemy.peekT || 0;
    const hidden = c > 0.82 && k < 0.18 && !enemy.moving;
    const goal = hidden ? 1 : 0;
    const a = dt > 0 ? 1 - Math.exp(-dt / 0.22) : 0;
    enemy._bobW = (enemy._bobW || 0) + (goal - (enemy._bobW || 0)) * a;
    if (enemy._bobPh == null) enemy._bobPh = Math.random() * Math.PI * 2;
    enemy._bobPh += dt * 1.6;
    const d2 = camera.position.distanceToSquared(enemy.group.position);
    if (art.tier !== 'high' || d2 > 900) return 0;
    const bob = Math.sin(enemy._bobPh) * 0.012 * (enemy._bobW || 0);
    // Crouch-peek keeps the cover sink; a standing peek still rises out of it.
    const sink = (enemy.peekKind && enemy.peekHigh === false && k > 0) ? -0.04 * c : -0.04 * c * (1 - k);
    return bob + sink;
  }
  function stepArt(enemy, dt) {
    _turnDt = dt;
    if (LOCO2) { tickCover(enemy, dt); noteAim(enemy); }
    const name = desiredAnim(enemy);
    enemy.animState = name;
    const loco = !!(LOCO2 && enemy.loco && enemy.art && enemy.bones);
    const owned = !!(loco && applyLoco(enemy, dt)); enemy._locoOwned = owned; // test hook: did the blend layer own this step
    if (!owned) {
      const ref = STRIDE[name];
      const cur = enemy.actions[name];
      if (cur && !enemy.hitPlaying) {
        const ts = ref && enemy.moving ? Math.min(1.6, Math.max(0.6, (enemy.moveSpeed || ref) / ref)) : 1;
        enemy.animTS = enemy.animTS == null ? ts : enemy.animTS + (ts - enemy.animTS) * Math.min(1, dt * 8);
        cur.setEffectiveTimeScale(enemy.animTS);
      }
      if (enemy.hitPlaying) {
        const hit = enemy.actions.hit;
        const dur = hit.getClip().duration || 0;
        const left = dur - hit.time;
        if (!enemy.hitReturning && hit.time > 0 && left <= 0.1) {
          enemy.hitReturning = true;
          crossTo(enemy, enemy.actions[name] || enemy.actions.idle, 0.1);
        }
      } else {
        const next = enemy.actions[name];
        if (next && enemy.currentAction !== next) crossTo(enemy, next, 0.2);
      }
      if (enemy.actions.upper) enemy.actions.upper.setEffectiveWeight(SPLIT_ANIMS.has(name) ? 1 : 0); // stance arms only under legs-only clips
      if (loco) { enemy._locoHeld = true; parkBlend(enemy, dt, (enemy.forceAnim && enemy.actions[enemy.forceAnim]) ? enemy.forceAnim : null); }
    }
    // Rest-pose reset before the mixer: some clips (Combat_Stance has no Spine track) leave bones untouched, so the
    // procedural hunch/lean bends and the previous clip's values piled up on them every frame - the "bent, rifle over
    // the head" idle/aim pose. Bones the clip animates are overwritten by the mixer right after.
    if (!enemy.restQ) enemy.restQ = enemy.art.restQ; if (!enemy.restQ) { enemy.restQ = []; enemy.art.root.traverse((o) => { if (o.isBone) enemy.restQ.push(o, o.quaternion.clone()); }); }
    for (let i = 0; i < enemy.restQ.length; i += 2) enemy.restQ[i].quaternion.copy(enemy.restQ[i + 1]);
    enemy.mixer.update(dt);
    proceduralLean(enemy, name, dt);
    try { supportArm(enemy, name, dt); } catch (err) { reportErr('support arm', err); }
    if (LOCO2) applyFidget(enemy);
    if (HITS2 && enemy.reactSt) applyHitReact(enemy, dt);
    if (HITS2) applyLastingWounds(enemy);
    if (enemy.hitPlaying && !enemy.actions.hit.enabled) {
      enemy.hitPlaying = false;
      enemy.hitReturning = false;
    }
  }

  // stepToward does not test colliders. Reject a stumble whose destination sits in any
  // world.colliders box expanded by 0.3 m. Road and sand are ground slabs (top <= 5 cm);
  // expanding those would block every street step.
  const _reactP = new THREE.Vector3();
  function reactDestClear(p) {
    const cols = world.colliders;
    if (!cols) return true;
    const x = p.x, y = p.y, z = p.z;
    for (let i = 0; i < cols.length; i++) {
      const m = cols[i];
      const hy0 = Math.abs(m.scale.y) * 0.5;
      if (m.position.y + hy0 <= 0.05) continue;
      const hx = Math.abs(m.scale.x) * 0.5 + 0.3;
      const hy = hy0 + 0.3;
      const hz = Math.abs(m.scale.z) * 0.5 + 0.3;
      if (Math.abs(x - m.position.x) < hx && Math.abs(y - m.position.y) < hy && Math.abs(z - m.position.z) < hz) return false;
    }
    return true;
  }
  function applyHitReact(enemy, dt) {
    const st = enemy.reactSt;
    const step = stepReact(st, dt);
    enemy.reactW = st.w;
    if (!st.zone && st.w <= 0) { enemy._reactDrop = 0; return; }
    const dist = camera.position.distanceTo(enemy.group.position);
    const level = qName() === 'ultra-low' ? 1 : (art.tier === 'high' || dist < 25) ? 2 : 1;
    enemy.group.updateMatrixWorld(true);
    _fwdW.set(0, 0, 1).applyQuaternion(enemy.group.quaternion);
    _rightW.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
    const drop = enemy.bones ? applyReact(st, enemy.bones, bendBone, _up, _rightW, _fwdW, level) : 0;
    enemy._reactDrop = drop || 0;
    if (step > 0 && !enemy.pinned && !enemy.dying && !isElevated(enemy.anchor && enemy.anchor.type)) {
      const gp = enemy.group.position;
      _reactP.copy(gp).addScaledVector(st.stepDir, step);
      if (reactDestClear(_reactP)) gp.copy(_reactP);
    }
  }

  // Lasting wounds (?hits=2). Scalars every frame; the pose (clutch IK, torso hunch, hip dip) is after the mixer.
  function tickWounds(enemy, dt) {
    const w = enemy.wounds;
    const armL = !!(w && w.armL > 0), armR = !!(w && w.armR > 0);
    const legL = !!(w && w.legL > 0), legR = !!(w && w.legR > 0);
    enemy.spreadMul = (armL || armR) ? 2.5 : 1;
    enemy.speedMul = (legL || legR) ? 0.6 : 1;
    enemy.limp = (legL || legR) ? 1 : 0;
    if (legL || legR) enemy._limpSide = w.legL > w.legR ? 'L' : w.legR > w.legL ? 'R' : (enemy.lastHitZone === 'legL' ? 'L' : 'R');
    else enemy._limpSide = 0;
    if (armL || armR) enemy._clutchSide = w.armL > w.armR ? 'L' : w.armR > w.armL ? 'R' : (enemy.lastHitZone === 'armL' ? 'L' : 'R');
    else enemy._clutchSide = 0;
    const show = (armL || armR) && enemy.phase !== 'fire' && enemy.phase !== 'peek' && !enemy.dying && !enemy.hitPlaying;
    const step = dt > 0 ? dt / 0.3 : 1;
    const c = enemy.clutchW || 0;
    enemy.clutchW = show ? (c + step > 1 ? 1 : c + step) : (c - step < 0 ? 0 : c - step);
  }
  // 0 at the edges of the wounded half-cycle, 1 at mid-stance. Left [0, 0.5), right [0.5, 1).
  function stanceW(phase, side) {
    let u = phase - (side === 'R' ? 0.5 : 0);
    u -= Math.floor(u);
    if (u >= 0.5) return 0;
    return Math.sin(u * Math.PI * 2);
  }
  // Other hand onto the wounded arm (mid upper-arm / mid-forearm). Same two-bone solve as supportArm.
  function clutchWound(enemy) {
    const b = enemy.bones, r = enemy.art && enemy.art.root;
    const side = enemy._clutchSide;
    if (!b || !r || (side !== 'L' && side !== 'R')) return;
    const clutchL = side !== 'L';
    const up = clutchL ? b.LeftArm : b.RightArm;
    const fore = clutchL ? b.LeftForeArm : b.RightForeArm;
    const hand = clutchL ? (enemy.leftHand || (enemy.leftHand = r.getObjectByName('LeftHand'))) : b.RightHand;
    const wUp = side === 'L' ? b.LeftArm : b.RightArm;
    const wFore = side === 'L' ? b.LeftForeArm : b.RightForeArm;
    const wHand = side === 'L' ? (enemy.leftHand || (enemy.leftHand = r.getObjectByName('LeftHand'))) : b.RightHand;
    if (!up || !fore || !hand || !wUp || !wFore) return;
    const wgt = enemy.clutchW || 0;
    const qa = up.quaternion.clone(), qf = fore.quaternion.clone();
    enemy.group.updateMatrixWorld(true);
    wUp.getWorldPosition(_saS);
    wFore.getWorldPosition(_saT);
    _saF.copy(_saS).lerp(_saT, 0.5);
    if (wHand) { wHand.getWorldPosition(_saR); _saT.lerp(_saR, 0.5); }
    _saT.add(_saF).multiplyScalar(0.5);
    twoBone(up, fore, hand, _saT); twoBone(up, fore, hand, _saT);
    if (wgt < 0.999) {
      up.quaternion.copy(qa.slerp(up.quaternion.clone(), wgt));
      fore.quaternion.copy(qf.slerp(fore.quaternion.clone(), wgt));
      r.updateMatrixWorld(true);
    }
  }
  function applyLastingWounds(enemy) {
    enemy._limpDip = 0;
    if (!enemy.bones || enemy.dying || window.SS_NOPROC) return;
    if (qName() === 'ultra-low') return; // ultra-low: speed and aim only
    const b = enemy.bones, w = enemy.wounds;
    if (w && w.torso > 0 && (b.Spine || b.Spine01)) {
      enemy.group.updateMatrixWorld(true);
      _rightW.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
      const bend = 4 * Math.PI / 180;
      bendBone(b.Spine01 || b.Spine, _rightW, bend * 0.5);
      if (b.Spine && b.Spine01) { b.Spine01.updateMatrixWorld(true); bendBone(b.Spine, _rightW, bend * 0.5); }
    }
    if ((enemy.clutchW || 0) > 0.01) clutchWound(enemy);
    if ((enemy.limp || 0) > 0 && enemy._limpSide && enemy.moving) enemy._limpDip = 0.05 * enemy.limp * stanceW(enemy.animPhase || 0, enemy._limpSide);
  }

  function playHit(enemy, head) {
    if (head && enemy.actions.hitHead && enemy.actions.hit !== enemy.actions.hitHead) {
      enemy.actions.hitBody = enemy.actions.hitBody || enemy.actions.hit;
    }
    if (enemy.actions.hitBody) enemy.actions.hit = head ? enemy.actions.hitHead : enemy.actions.hitBody;
    const hit = enemy.actions.hit;
    if (!hit) return;
    const prev = enemy.currentAction;
    hit.reset().setEffectiveWeight(1).setEffectiveTimeScale(1);
    hit.play();
    if (prev && prev !== hit) prev.crossFadeTo(hit, 0.1, false);
    else hit.fadeIn(0.1);
    enemy.currentAction = hit;
    enemy.hitPlaying = true;
    enemy.hitReturning = false;
  }

  const hitBoxGeo = new THREE.BoxGeometry(1, 1, 1);
  // m2a (tester: hit markers with the crosshair just beside the body): limb volumes are round (cylinder, diameter w). The
  // square boxes had an arbitrary roll, so seen across a corner they were sqrt(2) x w wide - 10-19 cm past the drawn
  // crouched limbs (test/hitvol-margin.js). A cylinder is w wide from every side.
  const limbGeo = new THREE.CylinderGeometry(0.56, 0.56, 1, 12); // diameter 1.12 w: the boxes' mean width over all rolls (~1.2 w) kept aim-reg's >= 88% visible-body coverage
  const _hY = new THREE.Vector3(0, 1, 0), _hD = new THREE.Vector3(), _hQ = new THREE.Quaternion(), _gQi = new THREE.Quaternion();
  // Place a unit box between two world points (group-local), oriented along the segment.
  function boxBetween(group, m, pa, pb, w) {
    group.worldToLocal(_wA.copy(pa)); group.worldToLocal(_wB.copy(pb));
    _hD.subVectors(_wB, _wA); const len = Math.max(0.05, _hD.length());
    m.position.addVectors(_wA, _wB).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(_hY, _hD.multiplyScalar(1 / len));
    m.scale.set(w, len + w * 0.5, w);
  }
  const _pA = new THREE.Vector3(), _pB = new THREE.Vector3();
  function syncArt(enemy) {
    const group = enemy.group;
    const bones = enemy.bones;
    if (!bones) return;
    group.updateMatrixWorld(true);
    const headB = bones.Head;
    if (headB) {
      if (enemy.hbFit) headB.localToWorld(_wA.copy(enemy.hbFit.headOff)); // m1w: centre of the head's skinned vertices, in the head bone's frame
      else { headB.getWorldPosition(_wA); _wA.y += 0.09; }
      group.worldToLocal(_wA);
      enemy.parts.head.position.copy(_wA); enemy.parts.head.scale.setScalar(enemy.hbFit ? enemy.hbFit.head : HB_HEAD);
    }
    if (bones.Spine && bones.Hips) {
      // Torso capsule spans hips -> upper spine and tilts with crouch / lean / procedural spine roll.
      const top = enemy.spineTop || bones.Spine;
      bones.Hips.getWorldPosition(_pA); top.getWorldPosition(_pB);
      const t = enemy.parts.torso;
      group.worldToLocal(_wA.copy(_pA)); group.worldToLocal(_wB.copy(_pB));
      t.position.addVectors(_wA, _wB).multiplyScalar(0.5);
      _hD.subVectors(_wB, _wA); const len = _hD.length();
      if (len > 0.05) t.quaternion.setFromUnitVectors(_hY, _hD.multiplyScalar(1 / len));
      // capsule spans hips..neck only (the fixed 0.91 m capsule poked into the head zone and stole headshots)
      { const tw = enemy.hbFit ? enemy.hbFit.torso : HB_TORSO_W; t.scale.set(tw, Math.max(0.4, (len + 0.18) / (0.76 * S)), tw); } // m1w: 0.9 was narrower than the shoulders/chest
    }
    if (enemy.limbBoxes) for (let i = 0; i < enemy.limbBoxes.length; i++) {
      const L = enemy.limbBoxes[i]; L.ba.getWorldPosition(_pA); L.bb.getWorldPosition(_pB);
      boxBetween(group, L.m, _pA, _pB, L.m.userData.w / Math.max(1e-3, group.scale.x));
    }
    group.updateMatrixWorld(true);
    if (enemy.legs && enemy.legs.length) { let m = Infinity; for (const L of enemy.legs) m = Math.min(m, L.foot.getWorldPosition(_wA).y); enemy.ikSync = m; }
  }

  // stopAllAction restores the bind pose; write the death pose back so unmapped bones keep it.
  function stopMixer(root, mixer) {
    const saved = [];
    root.traverse((obj) => {
      if (!obj.isBone) return;
      saved.push(obj, obj.position.clone(), obj.quaternion.clone(), obj.scale.clone());
    });
    mixer.stopAllAction();
    mixer.timeScale = 0;
    for (let i = 0; i < saved.length; i += 4) {
      saved[i].position.copy(saved[i + 1]);
      saved[i].quaternion.copy(saved[i + 2]);
      saved[i].scale.copy(saved[i + 3]);
    }
    root.updateMatrixWorld(true);
  }

  function mountFighter(enemy, group, extras) {
    if (art.tier !== 'high') return;
    const inst = art.fighterInstance(fighterCursor);
    if (!inst) return;
    fighterCursor += 1;
    const h = inst.height > 0.3 ? inst.height : 1.8;
    inst.root.scale.setScalar(1.95 / h); // code silhouette is ~2 m at ENEMY_SCALE 1.2
    group.add(inst.root); // model faces +Z; group.lookAt already aims +Z at the target

    const head = enemy.parts.head;
    const torso = enemy.parts.torso;
    head.material = ghostMat;
    torso.material = ghostMat;
    head.castShadow = torso.castShadow = false;
    head.receiveShadow = torso.receiveShadow = false;
    hideKids(head);
    hideKids(torso);
    for (let i = 0; i < extras.length; i++) extras[i].visible = false;
    // Limb hitboxes that follow the animated skeleton (thighs, shins, upper arms, forearms). Without them shots at
    // legs/arms - and at anything the vertical torso capsule didn't cover in a crouch or lean - were false misses.
    enemy.limbBoxes = [];
    // m1w item 6: widths fitted to the skinned body (aim-reg silhouette rays: the thinner set left ~35% of the visible
    // body - shins, feet, shoulders, head top - outside every volume: 'shots miss low'); feet added.
    const LIMBS = [['LeftUpLeg', 'LeftLeg', 0.23], ['LeftLeg', 'LeftFoot', 0.2], ['RightUpLeg', 'RightLeg', 0.23], ['RightLeg', 'RightFoot', 0.2],
      ['LeftFoot', 'LeftToeBase', 0.16], ['RightFoot', 'RightToeBase', 0.16],
      ['LeftArm', 'LeftForeArm', 0.17], ['LeftForeArm', 'LeftHand', 0.14], ['RightArm', 'RightForeArm', 0.17], ['RightForeArm', 'RightHand', 0.14]];
    for (const [a, b, w] of LIMBS) {
      const ba = inst.root.getObjectByName(a), bb = inst.root.getObjectByName(b); if (!ba || !bb) continue;
      const m = new THREE.Mesh(limbGeo, ghostMat); m.castShadow = m.receiveShadow = false; m.userData.w = w; m.userData.seg = [a, b]; group.add(m);
      register(m, enemy, 'limb'); enemy.limbBoxes.push({ m, ba, bb });
    }
    enemy.spineTop = inst.root.getObjectByName('neck') || inst.root.getObjectByName('Neck') || inst.root.getObjectByName('Spine02') || inst.root.getObjectByName('Spine01') || null;

    enemy.art = inst;
    enemy.mixer = inst.mixer;
    enemy.actions = inst.actions;
    enemy.bones = inst.bones;
    enemy.animPhase = Math.random();
    enemy.animState = 'idle';
    enemy.hitPlaying = false;
    enemy.hitReturning = false;
    const idle = inst.actions.idle;
    idle.reset().setEffectiveWeight(1).play();
    const idleDur = idle.getClip().duration || 1;
    idle.time = enemy.animPhase * idleDur;
    enemy.currentAction = idle;
    inst.restQ = []; inst.root.traverse((o) => { if (o.isBone) inst.restQ.push(o, o.quaternion.clone()); }); // bind pose, before any clip
    inst.mixer.update(0);
    plantFeet(inst.root);
    try { fitHitVolumes(enemy, inst); } catch (err) { reportErr('hit fit', err); }
    if (LOCO2) {
      createLoco(enemy); // once: weights, locoVel, locoW. Pose already sampled above.
      enemy.loco = { vel: enemy.locoVel, w: enemy.locoW, turnRate: 0, base: 'idle' };
    }
  }

  // m1w item 6: fit the hit volumes to THIS model's skinned body (idle pose): every vertex goes to its dominant bone;
  // limb box width = 2.1 x the 65th-percentile vertex distance from the bone segment (<= 0.3 m), torso capsule radius from the hips/
  // spine/neck/shoulder vertices, head sphere centred on the head vertices (kept in the head bone's frame) with their
  // 75th-percentile radius. Cached per model geometry. The fixed sizes left ~25-35% of the visible body unhittable.
  const hbFitCache = new Map();
  function fitHitVolumes(enemy, inst) {
    const sk = []; inst.root.traverse((o) => { if (o.isSkinnedMesh) sk.push(o); }); if (!sk.length || !enemy.bones || !enemy.bones.Head) return;
    const key = sk.map((m) => m.geometry.uuid).join('|'); let fit = hbFitCache.get(key);
    if (!fit) {
      enemy.group.updateMatrixWorld(true); const gs = enemy.group.getWorldScale(new THREE.Vector3()).x || 1;
      const byBone = new Map(), v = new THREE.Vector3();
      for (const m of sk) { m.skeleton.update(); const g = m.geometry, pos = g.attributes.position, si = g.attributes.skinIndex, sw = g.attributes.skinWeight; if (!si || !sw) continue; const step = Math.max(1, Math.floor(pos.count / 8000));
        for (let i = 0; i < pos.count; i += step) { let bi = 0, bw = -1; for (let k = 0; k < 4; k++) { const w = sw.getComponent(i, k); if (w > bw) { bw = w; bi = si.getComponent(i, k); } }
          const bone = m.skeleton.bones[bi]; if (!bone) continue; m.getVertexPosition(i, v); v.applyMatrix4(m.matrixWorld); let arr = byBone.get(bone.name); if (!arr) byBone.set(bone.name, (arr = [])); arr.push(v.clone()); } }
      const pct = (a, q) => { if (!a.length) return 0; a.sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.floor(a.length * q))]; };
      const wp = (o) => o.getWorldPosition(new THREE.Vector3());
      const segD = (names, A, B) => { const d = [], ab = B.clone().sub(A), L2 = Math.max(1e-6, ab.lengthSq()), q = new THREE.Vector3();
        for (const n of names) for (const p of byBone.get(n) || []) { const t = Math.max(0, Math.min(1, q.copy(p).sub(A).dot(ab) / L2)); d.push(p.distanceTo(q.copy(A).addScaledVector(ab, t))); } return d; };
      fit = { limbs: {} }; const R = inst.root;
      for (const L of enemy.limbBoxes || []) { const [a, b] = L.m.userData.seg; const names = [...byBone.keys()].filter((n) => n === a || (/Foot$/.test(a) && n.startsWith(a.replace('Foot', 'ToeBase')))); const d = segD(names, wp(L.ba), wp(L.bb));
        if (d.length >= 12) fit.limbs[a + '>' + b] = Math.max(0.1, Math.min(0.3, 2.1 * pct(d, HB_Q_LIMB))); } // world width (boxBetween divides by the group scale)
      const B = enemy.bones, top = enemy.spineTop || B.Spine; if (B.Hips && top) { const names = [...byBone.keys()].filter((n) => /hips|spine|chest|neck|shoulder|clavicle/i.test(n)); const d = segD(names, wp(B.Hips), wp(top));
        if (d.length >= 12) fit.torso = Math.max(0.9, Math.min(1.5, pct(d, HB_Q_TORSO) / gs / (0.17 * S))); }
      const hv = [...byBone.keys()].filter((n) => /^head|headtop|head_end/i.test(n)).flatMap((n) => byBone.get(n)); if (hv.length >= 12) { const c = new THREE.Vector3(); hv.forEach((p) => c.add(p)); c.multiplyScalar(1 / hv.length);
        fit.head = Math.max(1, Math.min(1.6, pct(hv.map((p) => p.distanceTo(c)), HB_Q_HEAD) / gs / (0.135 * S))); fit.headOff = B.Head.worldToLocal(c.clone()); }
      void R; hbFitCache.set(key, fit); if (window.SS) (window.SS.hbFit = window.SS.hbFit || {})[key.slice(0, 8)] = { limbs: fit.limbs, torso: fit.torso, head: fit.head };
    }
    for (const L of enemy.limbBoxes || []) { const w = fit.limbs[L.m.userData.seg.join('>')]; if (w) L.m.userData.w = w; }
    enemy.hbFit = { torso: fit.torso || HB_TORSO_W, head: fit.head || HB_HEAD, headOff: fit.headOff || new THREE.Vector3(0, 0.09, 0) };
    if (!fit.headOff) enemy.hbFit = null;
    else if (!fit.head) enemy.hbFit.head = HB_HEAD;
  }

  function buildEnemy(behavior, anchor) {
    const group = new THREE.Group();
    const marker = new THREE.Sprite(markerMat); marker.scale.set(0.045, 0.045, 1); marker.position.y = 2.25 * S; marker.renderOrder = 5; group.add(marker);
    const enemy = {
      marker,
      behavior,
      group,
      anchor,
      health: MAX_HEALTH,
      alive: true,
      exposed: false,
      phase: 'approach',
      phaseT: 0,
      posture: 'idle',
      moving: false,
      moveKind: 'run',
      path: null,
      pathI: 0,
      dying: false,
      moveT: 0,
      shootCd: 0.4 + Math.random() * 0.8,
      goal: null,
      home: anchor.pos.clone(),
      flankFrom: anchor.pos.clone(),
      flankTo: anchor.pos.clone(),
      suppressT: 0,
      engaged: false,
      coverHoldT: 0,
      repositions: 0,
    };
    if (LOCO2) {
      enemy.bodyYaw = 0; enemy.turning = null; enemy.aimYaw = 0; enemy.twist = 0; enemy.coverT = 0; enemy.peekT = 0;
      enemy.approachK = 0; enemy.exitK = 0; enemy._exitPh = 0; enemy.fidget = null; enemy.fidgets = 0; enemy.duckT = 0; enemy.ducks = 0;
      enemy.peekKind = null; enemy.peekHigh = false; enemy.lastPeekKind = null; enemy.settleT = 0;
    }
    if (HITS2) {
      enemy.wounds = { armL: 0, armR: 0, legL: 0, legR: 0, torso: 0 };
      enemy.clutchW = 0; enemy.spreadMul = 1; enemy.limp = 0; enemy.speedMul = 1;
      enemy.lastHitZone = null; enemy.lastHitDir = null; enemy.lastHitT = 0; enemy.react = null;
      enemy.reactSt = createReactState(); enemy.reactW = 0;
    }

    const torso = new THREE.Mesh(geoTorso, matVest);
    torso.position.y = 1.15 * S;
    torso.castShadow = true;
    group.add(torso);
    addRim(torso, 1.12);
    const head = new THREE.Mesh(geoHead, matSkin);
    head.position.y = 1.68 * S;
    head.castShadow = true;
    group.add(head);
    addRim(head, 1.14);
    const wrap = new THREE.Mesh(geoScar, matScarf);
    wrap.scale.set(1.08, 0.78, 1.12);
    wrap.position.y = 1.64 * S;
    group.add(wrap);
    addRim(wrap, 1.06);

    const extras = [];
    function limb(geo, x, y, z, mat) {
      const m = new THREE.Mesh(geo, mat || matClothDark);
      m.position.set(x * S, y * S, z * S);
      m.castShadow = true;
      group.add(m);
      addRim(m, 1.1);
      extras.push(m);
      return m;
    }
    limb(geoLimb, -0.24, 1.2, 0.02, matCloth);
    limb(geoLimb, 0.24, 1.15, 0.12, matCloth);
    limb(geoLeg, -0.09, 0.55, 0, matClothDark);
    limb(geoLeg, 0.09, 0.55, 0, matClothDark);

    const rifle = new THREE.Group();
    const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05 * S, 0.08 * S, 0.22 * S), matWood);
    stock.position.set(0.18 * S, 1.2 * S, 0.12 * S);
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.045 * S, 0.07 * S, 0.36 * S), matRifle);
    body.position.set(0.18 * S, 1.24 * S, -0.08 * S);
    const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.02 * S, 0.02 * S, 0.42 * S), matRifle);
    barrel.position.set(0.18 * S, 1.27 * S, -0.4 * S);
    rifle.add(stock, body, barrel);
    group.add(rifle);
    extras.push(wrap, rifle);
    enemy.muzzleLocal = new THREE.Vector3(0.18 * S, 1.27 * S, -0.62 * S);

    register(head, enemy, 'head');
    register(torso, enemy, 'body');
    enemy.parts = { head, torso };
    mountFighter(enemy, group, extras);

    enemy.home = standPos(anchor);
    enemy.flankFrom = enemy.home.clone();
    enemy.flankTo = enemy.home.clone();
    group.position.copy(enemy.home);
    root.add(group);
    enemy.takeHit = (part, point) => hitEnemy(enemy, part, point);
    list.push(enemy);
    return enemy;
  }

  function standPos(anchor) {
    const elevated = anchor.type === 'window' || anchor.type === 'roof';
    // Feet on the parapet top (h+0.55) for roofs; at the sill for windows (front of the facade, never inside it).
    const y = anchor.type === 'roof' ? anchor.pos.y - 0.15 : elevated ? Math.max(0, anchor.pos.y - 1.2) : 0;
    const side = Math.sign(anchor.pos.x) || 1;
    // Nudge 0.3 m out of cover toward the street so pop-outs are not clipped in walls.
    let x = anchor.pos.x - side * 0.3;
    if (y === 0) x = side * Math.min(Math.abs(x), STREET_X); // alley/door spots at the street mouth, never inside a building
    return new THREE.Vector3(x, y, anchor.pos.z);
  }

  // Cars/barrels shield along the street axis: crouch on the FAR side (away from the player, -z), and lean out past the
  // street-side edge to fire. Walls run along the street, so for them tuck outward in x (old behaviour).
  const FAR = { car: 2.75, barrel: 0.75 }, EDGE = { car: 1.3, barrel: 0.6 };
  function farHide(anchor) { const a = anchor.pos, side = Math.sign(a.x) || 1; return new THREE.Vector3(a.x + side * 0.15, 0, a.z - FAR[anchor.type]); }
  function edgePeek(anchor) { const a = anchor.pos, side = Math.sign(a.x) || 1; return new THREE.Vector3(a.x - side * EDGE[anchor.type], 0, a.z - FAR[anchor.type] + 0.25); }
  // Behind ground cover, away from the street center. Feet stay on y=0.
  function tuckOf(home, anchor) {
    if (anchor && FAR[anchor.type]) return farHide(anchor);
    const side = Math.sign(home.x) || 1;
    return new THREE.Vector3(side * Math.min(Math.abs(home.x) + 0.7, 6.5), 0, home.z);
  }

  // Sill/parapet tuck: step toward the facade at the same height. Never drop under the opening.
  function sillTuck(home, anchor) {
    const side = Math.sign(anchor.pos.x) || 1;
    return new THREE.Vector3(home.x + side * 0.35, home.y, home.z);
  }

  function isElevated(type) {
    return type === 'window' || type === 'roof';
  }

  function groundPoint(x, z) {
    const side = Math.sign(x) || 1;
    return new THREE.Vector3(side * Math.min(Math.abs(x), 6.3), 0, z);
  }

  // Smooth turning: rotate toward the target yaw at a capped rate instead of snapping.
  const _turnQ = new THREE.Quaternion();
  const _turnM = new THREE.Matrix4();
  const _up = new THREE.Vector3(0, 1, 0);
  let _turnDt = 1 / 60;
  function turnTo(enemy, x, z, rate) {
    const g = enemy.group;
    const dx = x - g.position.x, dz = z - g.position.z;
    if (dx * dx + dz * dz < 1e-4) return;
    _turnQ.setFromAxisAngle(_up, Math.atan2(dx, dz));
    if (!enemy.turned) { g.quaternion.copy(_turnQ); enemy.turned = true; return; }
    g.quaternion.rotateTowards(_turnQ, (rate || 7) * _turnDt);
  }
  function facePlayer(enemy) {
    if (LOCO2) return; // steerFacing keeps the aim; today's turnTo path stays when the flag is off
    turnTo(enemy, camera.position.x, camera.position.z, 6);
  }
  function groupYaw(g) {
    _fwd.set(0, 0, 1).applyQuaternion(g.quaternion);
    return Math.atan2(_fwd.x, _fwd.z);
  }
  function distToPlayer(enemy) {
    return enemy.group.position.distanceTo(camera.position);
  }
  function remainPath(enemy) {
    const g = enemy.group.position;
    const path = enemy.path;
    let d = 0, x = g.x, z = g.z, any = false;
    if (path && path.length) {
      for (let i = enemy.pathI | 0; i < path.length; i++) {
        const q = path[i];
        if (!q) continue;
        d += Math.hypot(q.x - x, q.z - z);
        x = q.x; z = q.z;
        any = true;
      }
    }
    if (!any && enemy.goal) return Math.hypot(enemy.goal.x - g.x, enemy.goal.z - g.z);
    return d;
  }
  const COVER_PHASE = { peek: 1, hide: 1, fire: 1, takeCover: 1 };
  function aimEngaged(enemy) {
    return !!(enemy.engaged || COVER_PHASE[enemy.phase]);
  }
  function yawAt(enemy, x, z) {
    const dx = x - enemy.group.position.x, dz = z - enemy.group.position.z;
    if (dx * dx + dz * dz < 1e-6) return null;
    return Math.atan2(dx, dz);
  }
  function noteAim(enemy) {
    if (aimEngaged(enemy)) {
      const y = yawAt(enemy, camera.position.x, camera.position.z);
      if (y != null) {
        enemy.threatYaw = y;
        if (!enemy.threatPos) enemy.threatPos = new THREE.Vector3();
        enemy.threatPos.copy(camera.position);
      }
    }
    enemy.aimYaw = Number.isFinite(enemy.threatYaw) ? enemy.threatYaw : groupYaw(enemy.group);
  }
  function travelYaw(enemy) {
    const g = enemy.group.position;
    let dx = 0, dz = 0;
    if (enemy._locoPos) { dx = g.x - enemy._locoPos.x; dz = g.z - enemy._locoPos.z; }
    if (dx * dx + dz * dz < 1e-8) {
      const dest = (enemy.path && enemy.path[enemy.pathI | 0]) || enemy.goal;
      if (dest) { dx = dest.x - g.x; dz = dest.z - g.z; }
    }
    if (dx * dx + dz * dz < 1e-8) return null;
    return Math.atan2(dx, dz);
  }
  function wantBodyYaw(enemy, still) {
    if (enemy._coverFace && Number.isFinite(enemy._coverYaw)) return enemy._coverYaw;
    if (!still) {
      const lateral = enemy.phase === 'peek' || enemy.phase === 'hide';
      if (!aimBody(aimEngaged(enemy), distToPlayer(enemy), remainPath(enemy), lateral)) {
        const t = travelYaw(enemy);
        if (t != null) return t;
      }
    }
    return Number.isFinite(enemy.aimYaw) ? enemy.aimYaw : groupYaw(enemy.group);
  }
  function exposeYaw(enemy) {
    enemy.bodyYaw = groupYaw(enemy.group);
    if (enemy.turning !== 'L' && enemy.turning !== 'R') enemy.turning = null;
    if (!Number.isFinite(enemy.aimYaw)) enemy.aimYaw = enemy.bodyYaw;
    if (!Number.isFinite(enemy.twist)) enemy.twist = 0;
  }
  function easePlant(enemy, ydt) {
    const p = (enemy.plantTwist || 0) * Math.exp(-(ydt > 0 ? ydt : 0.016) / 0.12);
    enemy.plantTwist = Math.abs(p) < 1e-3 ? 0 : p;
  }
  // ?loco=2: body yaw is not the travel direction. Short engaged hops and cover shuffles stay aimed
  // at the player; long moves face travel. Stationary turns use the turn clips or a planted yaw.
  function steerFacing(enemy, dt) {
    if (enemy.dying) { exposeYaw(enemy); return; }
    noteAim(enemy);
    const ydt = dt > 0 ? dt : 0;
    const spd = enemy.moving ? (enemy.curSpeed || 0) : 0;
    const still = spd < 0.25 && !enemy.moving;
    const want = wantBodyYaw(enemy, still);
    const err = wrapPi(want - groupYaw(enemy.group));
    const abs = Math.abs(err);
    const meta = (enemy.art && enemy.art.locoMeta) || enemy.locoMeta || null;
    let rate = 0, play = 0;
    enemy.turning = null;
    if (!still) {
      enemy._turnBig = false;
      enemy.footPlant = false;
      enemy.replantT = 0;
      easePlant(enemy, ydt);
      rate = yawRateStep(enemy._yawRate, err, MOVE_YAW_MAX, ydt, 0.03);
    } else if (abs > TURN_ENTER || (enemy._turnBig && abs > TURN_DONE)) {
      enemy._turnBig = true;
      enemy.footPlant = false;
      enemy.replantT = 0;
      easePlant(enemy, ydt);
      const side = err >= 0 ? 'L' : 'R';
      enemy.turning = side;
      play = turnPlayback(abs);
      rate = (err >= 0 ? 1 : -1) * Math.abs(clipYawRate(meta, side)) * play;
      if (ydt > 0 && Math.abs(rate) * ydt > abs) rate = err / ydt;
    } else {
      enemy._turnBig = false;
      rate = yawRateStep(enemy._yawRate, err, PLANT_YAW_MAX, ydt, 0.08);
      if (enemy.replantT > 0) {
        enemy.replantT = Math.max(0, enemy.replantT - ydt);
        enemy.footPlant = false;
        const u = enemy.replantT / 0.3;
        enemy.plantTwist = (enemy._replant0 || 0) * (u > 0 ? u : 0);
        if (enemy.replantT > 0) { enemy.turning = (enemy._replant0 || err) >= 0 ? 'L' : 'R'; play = 1.35; }
      } else if (Math.abs(enemy.plantTwist || 0) > PLANT_TWIST_MAX) {
        enemy._replant0 = enemy.plantTwist;
        enemy.replantT = 0.3;
        enemy.footPlant = false;
        enemy.turning = enemy.plantTwist >= 0 ? 'L' : 'R';
        play = 1.35;
      } else {
        enemy.footPlant = abs > 0.05 || Math.abs(rate) > 0.15 || Math.abs(enemy.plantTwist || 0) > 0.08;
      }
    }
    if (rate > BODY_YAW_CAP) rate = BODY_YAW_CAP; else if (rate < -BODY_YAW_CAP) rate = -BODY_YAW_CAP; // hard cap for every path (turn-in-place clip x2.2 = ~186 deg/s)
    enemy._yawRate = rate;
    const y0 = groupYaw(enemy.group);
    if (ydt > 0 && Math.abs(rate) > 1e-5 && abs > 1e-4) {
      _turnQ.setFromAxisAngle(_up, want);
      enemy.group.quaternion.rotateTowards(_turnQ, Math.min(abs, Math.abs(rate) * ydt));
    }
    if (enemy.footPlant) enemy.plantTwist = (enemy.plantTwist || 0) + wrapPi(groupYaw(enemy.group) - y0);
    const ptw = enemy.plantTwist || 0;
    enemy.hipLead = ptw < -PLANT_TWIST_MAX ? PLANT_TWIST_MAX : ptw > PLANT_TWIST_MAX ? -PLANT_TWIST_MAX : -ptw;
    if (Math.abs(enemy.hipLead) < 1e-4) enemy.hipLead = 0;
    enemy._turnCmd = enemy.turning ? { clip: enemy.turning, blend: 1, play: play || 1 } : null;
    exposeYaw(enemy);
  }

  function spray(point) {
    let spawned = 0;
    for (let i = 0; i < blood.length && spawned < 8; i++) {
      const b = blood[i];
      if (b.life > 0) continue;
      b.life = 0.22 + Math.random() * 0.13; // never outlives the hit marker (fix 3)
      b.sprite.visible = true;
      b.sprite.position.copy(point);
      b.sprite.material.opacity = 0.9;
      b.sprite.scale.setScalar(0.12 + Math.random() * 0.12);
      b.vel.set((Math.random() - 0.5) * 2.4, 1.2 + Math.random() * 2.2, (Math.random() - 0.5) * 2.4);
      spawned += 1;
    }
  }

  function dropDecal(pos) {
    let mesh = null;
    for (let i = 0; i < decals.length; i++) {
      if (!decals[i].visible) { mesh = decals[i]; break; }
    }
    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.CircleGeometry(0.55, 10),
        new THREE.MeshBasicMaterial({ color: 0x4a0808, transparent: true, opacity: 0.82, depthWrite: false })
      );
      mesh.rotation.x = -Math.PI / 2;
      scene.add(mesh);
      decals.push(mesh);
    }
    mesh.visible = true;
    mesh.position.set(pos.x, 0.04, pos.z);
    mesh.scale.setScalar(0.7 + Math.random() * 0.5); mesh.userData.t0 = performance.now(); mesh.material.opacity = 0.82;
  }

  function kill(enemy, point, part) {
    if (!enemy.alive) return;
    enemy.alive = false;
    unregister(enemy);
    const origin = enemy.group.position;
    spray(point || origin.clone().setY(origin.y + 1.3));
    dropDecal(origin);
    // Hit-to-ragdoll blend: the native Gunshot_Reaction clip plays on the live skeleton for ~0.3 s, then the ragdoll takes
    // over from that pose (bindSkin offsets absorb it, no pop) with the hips' measured velocity + the shot impulse.
    if (enemy.art && enemy.mixer && enemy.actions && !enemy.pinned) {
      enemy.dying = true; enemy.fallT = 0.3; enemy.fallPart = part; enemy.fallPoint = point;
      const hit = (part === 'head' && enemy.actions.hitHead) || enemy.actions.hitBody || enemy.actions.hit;
      if (hit) { hit.reset().setEffectiveWeight(1).setEffectiveTimeScale(1.25).play(); if (enemy.currentAction && enemy.currentAction !== hit) enemy.currentAction.crossFadeTo(hit, 0.05, false); enemy.currentAction = hit; }
      if (enemy.bones && enemy.bones.Hips) enemy.hipPrev = enemy.bones.Hips.getWorldPosition(new THREE.Vector3());
      fallers.push(enemy);
    } else fall(enemy, point, part);
    killFx(enemy, point, part);
  }
  let squadReposS = -1e9; // last sim time any fighter repositioned (non-last moves are one at a time, >= 8 s apart)
  const fallers = [];
  function stepFallers(dt) {
    for (let i = fallers.length - 1; i >= 0; i--) {
      const e = fallers[i]; e.fallT -= dt;
      try { e.mixer.update(dt); proceduralLean(e, 'hit', dt); } catch (err) { e.fallT = 0; }
      if (e.bones && e.bones.Hips) { const h = e.bones.Hips.getWorldPosition(_wA); if (e.hipPrev && dt > 0) { e.hipVel = (e.hipVel || new THREE.Vector3()).subVectors(h, e.hipPrev).multiplyScalar(1 / dt); } (e.hipPrev || (e.hipPrev = new THREE.Vector3())).copy(h); }
      if (e.fallT <= 0) { fallers.splice(i, 1); fall(e, e.fallPoint, e.fallPart); }
    }
  }
  function fall(enemy, point, part) {
    const origin = enemy.group.position;
    const yaw = enemy.group.rotation.y;
    enemy.group.updateMatrixWorld(true);
    // A ragdoll/physics failure must never block a kill (tester soft-lock: hit markers but nobody died, loop frozen).
    let doll = null;
    _aim.copy(origin).sub(camera.position).normalize();
    if (enemy.hipVel) { const hv = enemy.hipVel; if (hv.lengthSq() < 36) _aim.addScaledVector(hv, 0.12); }
    try { doll = ragdolls.spawn(origin, yaw, _aim); ragdolls.addNearbyStatics(doll, world.colliders, origin); }
    catch (err) { reportErr('ragdoll spawn', err); doll = null; }
    if (enemy.art && doll) try {
      const model = enemy.art.root;
      scene.attach(model); // keeps the world transform
      // Freeze the current (hit-clip) pose for the ragdoll skin; the death clip is only sampled when no hit blend ran.
      const death = enemy.actions && enemy.actions.death;
      if (death && enemy.mixer && !enemy.dying) {
        enemy.dying = true;
        enemy.mixer.stopAllAction();
        death.reset().setEffectiveWeight(1).setEffectiveTimeScale(1).play();
        const dur = death.getClip().duration || 0.6;
        enemy.mixer.update(Math.min(0.7, dur * 0.62));
        enemy.animState = 'death';
      }
      stopMixer(model, enemy.mixer);
      for (let i = 0; i < doll.parts.length; i++) {
        doll.parts[i].mesh.traverse((obj) => { obj.visible = false; });
      }
      // Bones leave the mesh origin as the body falls; don't frustum-cull the skin.
      model.traverse((obj) => { if (obj.isMesh) obj.frustumCulled = false; });
      doll.skin = { model, links: ragdolls.bindSkin(doll, enemy.bones) };
    } catch (err) { reportErr('ragdoll skin', err); if (enemy.art && enemy.art.root.parent) enemy.art.root.parent.remove(enemy.art.root); }
    else if (enemy.art) { // no ragdoll (physics failed): leave the body in its death pose for 25 s instead of vanishing
      try { const model = enemy.art.root; scene.attach(model); const death = enemy.actions && enemy.actions.death;
        if (death && enemy.mixer) { enemy.mixer.stopAllAction(); death.reset().setLoop(THREE.LoopOnce, 1); death.clampWhenFinished = true; death.play(); enemy.mixer.update((death.getClip().duration || 1) * 0.99); }
        stopMixer(model, enemy.mixer); setTimeout(() => { if (model.parent) model.parent.remove(model); }, 25000); } catch (err) { reportErr('static corpse', err); } }
    enemy.group.visible = false;
    root.remove(enemy.group);
  }
  let dryKills = 0, lastDropT = performance.now();
  let runSpawns = 0, firstKill = false; // App PM: first wave is exactly 2 fighters; nothing more arrives until the first kill
  function killFx(enemy, point, part) {
    const origin = enemy.group.position;
    if (window.SS && window.SS.scoreSys) window.SS.scoreSys.addKill(part === 'head');
    // Kill confirmation: kill marker + sound; headshot burst; brief slow-mo on the wave's last kill.
    const SSx = window.SS || {};
    if (SSx.hud && SSx.hud.hitMarker) SSx.hud.hitMarker(part === 'head' ? 'headkill' : 'kill');
    if (SSx.audio && SSx.audio.kill) SSx.audio.kill();
    if (part === 'head') { const hp = (point || origin.clone().setY(origin.y + 1.6)); spray(hp); spray(hp); spray(hp); }
    // Drops (tester: none in a whole run, ammo dead-ended): 50% per kill, guaranteed after 2 dry kills or 20 s (pity);
    // the kind follows need (low reserve -> ammo, low health -> health).
    firstKill = true;
    if (SSx.stakes) { dryKills += 1; const now = performance.now(); const w = SSx.weapon || {};
      const dry = (w.reserve | 0) <= 0; // tester: a kill at 22/0 gave nothing - an empty reserve always earns an ammo drop
      if (dry || Math.random() < 0.5 || dryKills >= 3 || now - lastDropT > 20000) { dryKills = 0; lastDropT = now;
        // never health at full HP; otherwise whichever need is bigger (missing HP vs missing reserve of a 120-round load)
        const hp = SSx.player ? SSx.player.health : (SSx.health ?? 100), hpNeed = (100 - hp) / 100, ammoNeed = 1 - Math.min(1, (w.reserve | 0) / 120);
        const kind = dry || hp >= 99.5 ? 'ammo' : hpNeed > ammoNeed ? 'health' : ammoNeed > hpNeed ? 'ammo' : (Math.random() < 0.5 ? 'ammo' : 'health');
        SSx.stakes.drop(kind, origin.clone()); } }
    if (aliveCount() === 0 && !truckPending && SSx.input && SSx.input.dropQueuedFire) SSx.input.dropQueuedFire(); // m2a: the fight's queued FIRE taps never fire into the walk
    if (aliveCount() === 0) { SSx.slowmoUntil = performance.now() + 750; if (SSx.hud && SSx.hud.banner) setTimeout(() => {}, 0); }
  }

  function zoneFromSeg(seg) {
    if (!seg) return null;
    const s = Array.isArray(seg) ? seg.join(' ') : String(seg);
    const side = /Left/.test(s) ? 'L' : /Right/.test(s) ? 'R' : '';
    if (!side) return null;
    if (/Arm|Hand/.test(s)) return 'arm' + side;
    if (/UpLeg|Leg|Foot|Toe/.test(s)) return 'leg' + side;
    return null;
  }
  function nearestLimbSeg(enemy, point) {
    const boxes = enemy && enemy.limbBoxes;
    if (!boxes || !boxes.length || !point) return null;
    let best = null, bestD = Infinity;
    for (let i = 0; i < boxes.length; i++) {
      const L = boxes[i];
      L.ba.getWorldPosition(_pA); L.bb.getWorldPosition(_pB);
      _wB.subVectors(_pB, _pA);
      const L2 = _wB.lengthSq();
      const t = L2 < 1e-12 ? 0 : Math.max(0, Math.min(1, _wA.copy(point).sub(_pA).dot(_wB) / L2));
      const d = _wA.copy(_pA).addScaledVector(_wB, t).distanceToSquared(point);
      if (d < bestD) { bestD = d; best = L.m.userData.seg; }
    }
    return best;
  }
  function hitZoneOf(enemy, part, point) {
    if (part === 'head') return 'head';
    if (part === 'body') return 'torso';
    return zoneFromSeg(nearestLimbSeg(enemy, point));
  }
  function hitReact(enemy, zone, dir, point) {
    enemy.react = { zone, t: 0, dur: zone === 'torso' ? 0.45 : zone.startsWith('leg') ? 0.6 : 0.35, dir: dir.clone() };
    _rightW.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
    kickReact(enemy.reactSt, zone, dir, _rightW);
  }

  function hitEnemy(enemy, part, point) {
    if (!enemy.alive) return;
    const dmg = part === 'head' ? HEAD_DMG : part === 'limb' ? LIMB_DMG : BODY_DMG;
    enemy.health -= dmg;
    if (HITS2) {
      const zone = hitZoneOf(enemy, part, point);
      _fwd.copy(point || enemy.group.position).sub(camera.position);
      if (_fwd.lengthSq() < 1e-12) _fwd.set(0, 0, 1); else _fwd.normalize();
      enemy.lastHitZone = zone;
      (enemy.lastHitDir || (enemy.lastHitDir = new THREE.Vector3())).copy(_fwd);
      enemy.lastHitT = (window.SS && window.SS.simTime) || 0;
    }
    // Fix 3: blood, damage and the hit marker all come from this one registered hit (spray is emitted with the marker below
    // or with the kill marker in kill()); nothing else spawns blood on a live enemy.
    if (enemy.health <= 0) kill(enemy, point, part);
    else {
      if (HITS2) {
        const zone = enemy.lastHitZone;
        if (zone && zone !== 'head') {
          if (enemy.wounds && zone in enemy.wounds) { enemy.wounds[zone] += 1; hitZones[zone] += 1; }
          hitReact(enemy, zone, enemy.lastHitDir, point);
        }
        try { if (window.SS) window.SS.hitZones = hitZones; } catch (_) {}
      }
      if (LOCO2) forceDuck(enemy, weapon.lastShot);
      const springs = HITS2 && enemy.reactSt && enemy.lastHitZone && enemy.lastHitZone !== 'head'; // ?hits=2: zone springs replace the full-body Hit clip and the 0.3 m one-frame shove
      if (enemy.art && !springs) playHit(enemy, part === 'head');
      // Bigger hit reaction: shove back ~0.3 m from the shooter (ground enemies) + a brief exposed stagger.
      // Never shove into a building: a fighter pushed inside a wall collider became unhittable (false misses).
      if (!springs && enemy.group.position.y < 0.5 && !enemy.pinned) { const gp = enemy.group.position, x0 = gp.x; _aim.copy(gp).sub(camera.position).setY(0).normalize(); gp.addScaledVector(_aim, 0.3);
        const lim = Math.max(5.6, Math.abs(x0)); if (Math.abs(gp.x) > lim) gp.x = Math.sign(gp.x) * lim; }
      if (!enemy.pinned) enemy.staggerT = springs ? (enemy.lastHitZone === 'torso' ? 0.45 : enemy.lastHitZone.startsWith('leg') ? 0.5 : 0.3) : 0.45; enemy.shootCd = Math.max(enemy.shootCd || 0, 0.6);
      if (point) spray(point);
      if (window.SS && window.SS.hud && window.SS.hud.hitMarker) window.SS.hud.hitMarker(part === 'head' ? 'head' : 'hit');
      if (window.SS) window.SS.lastEnemyHit = { part, dmg, health: enemy.health, t: performance.now() };
    }
  }

  weapon.onHit = function onHit(info) {
    if (!info || !info.enemy || !info.enemy.takeHit) return;
    const dirPoint = info.point;
    info.enemy.takeHit(info.part, dirPoint);
  };
  // Read-only: player rounds already land in weapon.lastShot / onHit. Do not edit weapon.js.
  let _seenShot = null;
  function forceDuck(enemy, shot) {
    if (!enemy || !enemy.alive || enemy.dying || enemy.pinned) return;
    const peeking = enemy.phase === 'peek' || enemy.phase === 'fire' || (enemy.peekT || 0) > 0.18 || (enemy._peekPh || 0) > 0.18;
    if (!peeking) return;
    if (shot && enemy._duckShot === shot) { enemy.duckT = Math.max(enemy.duckT || 0, 0.8); return; }
    if (shot) enemy._duckShot = shot;
    enemy.ducks = (enemy.ducks | 0) + 1;
    enemy.duckT = Math.max(enemy.duckT || 0, 0.8);
  }
  function notePlayerRound() {
    const shot = weapon.lastShot;
    if (!shot || shot === _seenShot) return;
    _seenShot = shot;
    const o = shot.origin, d = shot.dir;
    if (!o || !d) return;
    const hitP = shot.hit && shot.hit.point;
    const maxD = hitP ? o.distanceTo(hitP) : 80;
    const dx = d.x, dy = d.y, dz = d.z;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e.alive || e.dying || e.pinned) continue;
      const p = e.group.position;
      const cx = p.x - o.x, cy = (p.y + 1.0) - o.y, cz = p.z - o.z;
      let t = cx * dx + cy * dy + cz * dz;
      if (t < 0) t = 0; else if (t > maxD) t = maxD;
      const px = o.x + dx * t - p.x, py = o.y + dy * t - (p.y + 1.0), pz = o.z + dz * t - p.z;
      if (px * px + py * py + pz * pz <= 2.25) forceDuck(e, shot);
    }
  }

  function muzzleFlash(pos) {
    let slot = flashes[0];
    for (let i = 0; i < flashes.length; i++) {
      if (flashes[i].life <= 0) { slot = flashes[i]; break; }
    }
    slot.life = 0.05;
    slot.sprite.visible = true;
    slot.sprite.position.copy(pos);
  }

  function tracer(a, b, long) {
    let slot = tracers[0];
    for (let i = 0; i < tracers.length; i++) {
      if (tracers[i].life <= 0) { slot = tracers[i]; break; }
    }
    // m1w: real-time life + at least 2 rendered frames (0.07 s of sim time expired inside one low-fps frame: never drawn)
    slot.life = 0.07; slot.untilR = performance.now() + (long ? 260 : 120); slot.frame0 = (window.SS && window.SS.frameN) | 0;
    const attr = slot.line.geometry.attributes.position;
    attr.setXYZ(0, a.x, a.y, a.z);
    attr.setXYZ(1, b.x, b.y, b.z);
    attr.needsUpdate = true;
    slot.line.geometry.computeBoundingSphere();
    slot.line.visible = true;
    slot.line.material.opacity = 0.9;
  }

  let lastPlayerHitS = 0, lastPlayerHitSim = -99;
  // m1w item 7: engaged fights were too lethal (a lone fighter took the player 100% -> ~5% in ~20 s). Incoming gunfire
  // is capped at DMG_CAP_HPS hp per second (token bucket, accrues on the slower of real and game time, holds one full
  // hit). A hit the bucket cannot pay for becomes a near miss (tracer/crack still), so the lone-enemy kill takes >= ~30 s.
  const LOW_HP_CHANCE = 0.3, LOW_HP_SLIVER = 6; // m1x: hit-chance floor once a hit would be lethal and the player is exposed
  const DMG_CAP_HPS = 2.8, DMG_CAP_BURST = 22; let dmgBucket = DMG_CAP_BURST, dmgBucketR = 0, dmgBucketSim = 0;
  function dmgBudget(nowS, simS) { if (dmgBucketR) dmgBucket = Math.min(DMG_CAP_BURST, dmgBucket + DMG_CAP_HPS * Math.max(0, Math.min(nowS - dmgBucketR, simS - dmgBucketSim))); dmgBucketR = nowS; dmgBucketSim = simS; return dmgBucket; }
  // m1v: warning for fire from outside the view - edge flash on the shooter's side + a supersonic crack
  function warnFrom(pos) { const SSx = window.SS; if (!SSx) return; const c = camera.position, yaw = SSx.input ? SSx.input.yaw : 0, dx = pos.x - c.x, dz = pos.z - c.z;
    const fwd = dx * Math.sin(yaw) + dz * -Math.cos(yaw), right = dx * Math.cos(yaw) + dz * Math.sin(yaw);
    if (SSx.hud && SSx.hud.edgeWarn) SSx.hud.edgeWarn(Math.atan2(right, fwd)); if (SSx.audio && SSx.audio.crack) SSx.audio.crack(pos); }
  function enemyShoot(enemy) {
    { const nR = performance.now() / 1000, nS = window.SS ? (window.SS.simTime || 0) : 0; if (enemy.noFireUntilR > nR || enemy.noFireUntilSim > nS) { enemy.shootCd = Math.max(enemy.shootCd || 0, 0.1); return; } } // just relocated: let the player see them first
    // m1u: a balcony/window/roof shooter fires only while visibly present (a tracer from an empty balcony otherwise)
    enemy.group.getWorldPosition(_losP); _losP.y += 1.25; const offView = !onScreen(_losP) && !onScreen(_losP.setY(_losP.y + 0.37));
    // m1v: fire from outside the view is never damaging; it comes with a warning (edge flash on the shooter's side + crack)
    if (!offView && ((enemy.anchor && isElevated(enemy.anchor.type)) || enemy.group.position.y > 0.05) && !playerSees(enemy)) { enemy.silentSkips = (enemy.silentSkips | 0) + 1; return; }
    if (window.SS) window.SS.enemyShots = (window.SS.enemyShots | 0) + 1;
    const diff = difficulty();
    enemy.group.updateMatrixWorld(true);
    if (enemy.art && enemy.bones && enemy.bones.RightHand) {
      enemy.bones.RightHand.getWorldPosition(_muzzle);
      _fwd.set(0, 0, 1).transformDirection(enemy.group.matrixWorld);
      _muzzle.addScaledVector(_fwd, 0.45);
    } else {
      _muzzle.copy(enemy.muzzleLocal).applyMatrix4(enemy.group.matrixWorld);
    }
    const dist = _muzzle.distanceTo(camera.position);
    // Fix 7 (tester: slightly easier): ~20% lower base accuracy; each enemy's first 3 shots at first contact are mostly
    // misses (sighting-in), so the player gets a beat to react. Damage per hit is unchanged (~5 hits to kill).
    let chance = (0.42 - dist * 0.006) * (0.55 + 0.7 * diff) * 0.8;
    enemy.shotsTaken = (enemy.shotsTaken | 0) + 1;
    if (enemy.shotsTaken <= 3) chance *= 0.35 + 0.2 * (enemy.shotsTaken - 1);
    enemy.engaged = true; // shooting engages: the walk halts until this enemy is dead
    if (window.SS && window.SS.input && window.SS.input.cover) chance *= 0.3; // ducked in cover
    chance *= 1 + PRESSURE_HIT * pressure;
    // Early soften: first ~120 m / first bursts are less deadly
    const prog = window.SS ? window.SS.distance : 0;
    if ((prog < 120 || burstIndex <= 2) && pressure < 0.45) chance *= 0.72; // still lethal once standing-still pressure builds
    if ((enemy.suppressT || 0) > 0) chance *= 0.45; // blind-fire suppression
    if (HITS2 && enemy.spreadMul > 1) chance /= enemy.spreadMul; // wounded arm: weaker aim (fewer hits, wider misses)
    // Grace ramp (tester: nearly dead after one burst): the first ~60 s of a run land fewer hits, and any two hits on the
    // player are spaced >= 0.9 s early (0.4 s later) so one burst can't chain 3-4 hits. Damage per hit unchanged (~5 to die).
    const runT = window.SS && window.SS.startedAt ? (performance.now() - window.SS.startedAt) / 1000 : 999;
    const grace = Math.min(1, runT / 60);
    chance *= 0.45 + 0.55 * grace;
    if (window.SS && window.SS.testAccuracy) chance *= window.SS.testAccuracy; // tests only: draw enough hits to exercise the sight check
    chance = Math.max(0.02, Math.min(0.85, chance));
    // m1x (tester: held at a sliver ~30 s, felt fake): there was no explicit HP floor; the sliver came from the damage cap
    // (a hit had to wait for a FULL 18-22 hp in the shared 2.8 hp/s bucket, ~7 s, even when 3 hp would kill) stacked with
    // the low early hit chance. Once one hit would be lethal and the player is exposed (not ducked), a seen shooter's hit
    // chance is at least LOW_HP_CHANCE and the lethal hit only needs the HP that is left in the bucket: low HP resolves
    // within a few seconds of real fire (death, or survive by ducking into cover / killing the shooter).
    const dmgAmt0 = Math.max(18, Math.min(22, 20 + (diff - 0.5) * 4)) * (waveClears === 0 && (window.SS.simTime || 0) < WAVE1_SOFT_S ? WAVE1_DAMAGE : 1) * (window.SS && window.SS.input && window.SS.input.cover ? 0.6 : 1);
    const lowHp = !!(player && player.alive && player.health <= dmgAmt0 && !(window.SS && window.SS.input && window.SS.input.cover));
    if (lowHp) chance = Math.max(chance, LOW_HP_CHANCE);
    // m1y: at a sliver (< LOW_HP_SLIVER hp) a seen, exposed player's next hit lands with >= 0.6 chance; in game time the
    // fire cadence slows at ~1 fps (sim dt capped), so the old floor still left a ~20 s wall-clock sliver at 1 fps.
    if (lowHp && player.health < LOW_HP_SLIVER) chance = Math.max(chance, 0.6);
    const gap = 0.9 - 0.5 * grace, nowS = performance.now() / 1000;
    const simS = window.SS ? (window.SS.simTime || 0) : 0; // game-time clock (sim dt summed): at 1 fps game time runs slower than real time
    let hit = Math.random() < chance && player && player.alive && nowS - (lastPlayerHitS || 0) >= gap && simS - (lastPlayerHitSim || -99) >= gap; // spacing holds in BOTH real and game time
    // m1v grace: no damage for COVER_GRACE_S (real time) after first reaching cover in a run
    if (hit && window.SS && window.SS.coverGraceUntil && performance.now() < window.SS.coverGraceUntil) { hit = false; window.SS.graceBlocked = (window.SS.graceBlocked | 0) + 1; }
    if (offView) { hit = false; enemy.offViewShots = (enemy.offViewShots | 0) + 1; if (window.SS) window.SS.offViewShots = (window.SS.offViewShots | 0) + 1; warnFrom(enemy.group.position); }
    // m1t: no hits from out of the player's sight (tester: 6 min of hits from a fighter hidden behind a far burned car).
    // far-hit: the shooter must have been continuously visible for SEEN_BEFORE_HIT_S (no first-frame hits from a peek/relocation)
    const needSeen = nowS - (enemy.movedR || -99) < 3 ? SEEN_BEFORE_HIT_S : SEEN_PEEK_S; // full hold right after a relocation, a short one for peeks from known cover
    if (hit && needSeen > 0 && !(enemy.seenSinceR && nowS - enemy.seenSinceR >= needSeen && simS - (enemy.seenSinceSim || 0) >= needSeen)) { hit = false; enemy.freshBlocked = (enemy.freshBlocked | 0) + 1; if (window.SS) window.SS.freshBlocked = (window.SS.freshBlocked | 0) + 1; }
    if (hit && !playerSees(enemy)) { hit = false; enemy.blindHitsBlocked = (enemy.blindHitsBlocked | 0) + 1; if (window.SS) window.SS.blindHitsBlocked = (window.SS.blindHitsBlocked | 0) + 1; }
    const dmgAmt = dmgAmt0, dmgCost = lowHp ? Math.min(dmgAmt, Math.max(1, player.health)) : dmgAmt;
    if (dmgBudget(nowS, simS) < dmgCost - 1e-6 && hit) { hit = false; if (window.SS) window.SS.dmgCapBlocked = (window.SS.dmgCapBlocked | 0) + 1; } // m1w: incoming damage-per-second cap
    if (hit) { lastPlayerHitS = nowS; lastPlayerHitSim = simS; }
    _aim.copy(camera.position);
    if (!hit) {
      const sp = (HITS2 && enemy.spreadMul > 1) ? enemy.spreadMul : 1; // arm wound: this fighter's miss spread x2.5
      _aim.x += (Math.random() - 0.5) * 2.4 * sp;
      _aim.y += (Math.random() - 0.5) * 1.2 * sp;
      _aim.z += (Math.random() - 0.5) * 2.4 * sp;
    }
    // m1w: an off-view shot's tracer ends in front of the player on the shooter's side, so it streaks in from that edge
    if (offView) { const yw = window.SS && window.SS.input ? window.SS.input.yaw : 0, fx = Math.sin(yw), fz = -Math.cos(yw), sx = Math.cos(yw), sz = Math.sin(yw);
      const side = Math.sign((_muzzle.x - camera.position.x) * sx + (_muzzle.z - camera.position.z) * sz) || 1;
      _aim.set(camera.position.x + fx * 3.2 + sx * side * 0.9, camera.position.y - 0.15, camera.position.z + fz * 3.2 + sz * side * 0.9); if (window.SS) window.SS.offViewTracers = (window.SS.offViewTracers | 0) + 1; }
    muzzleFlash(_muzzle);
    tracer(_muzzle, _aim, offView);
    if (window.SS && window.SS.audio) window.SS.audio.enemyShot(_muzzle);
    enemy.rounds = (enemy.rounds || 0) + 1;
    if (enemy.rounds >= 6) {
      enemy.rounds = 0;
    }
    if (hit) {
      const amount = dmgAmt; // m1v: softer first wave (opening only); cover softening (x0.6) included
      // final gate AT the moment damage lands: the shooter must be visibly on screen now (nothing queued from earlier frames)
      if (!playerSees(enemy)) { enemy.blindHitsBlocked = (enemy.blindHitsBlocked | 0) + 1; if (window.SS) window.SS.blindHitsBlocked = (window.SS.blindHitsBlocked | 0) + 1; return; }
      dmgBucket -= Math.min(amount, dmgCost); player.damage(amount, _muzzle); // cover also softens hits (x0.6, in dmgAmt)
    }
  }

  const reported = new Set();
  function reportErr(where, err) {
    const key = where + ':' + (err && err.message);
    if (reported.has(key)) return; reported.add(key);
    console.error('[sandstorm] ' + where + ' failed:', err && (err.stack || err.message || err));
    if (window.SS) (window.SS.errors = window.SS.errors || []).push(key);
  }
  function squadCall(text) {
    const hud = window.SS && window.SS.hud;
    if (hud && typeof hud.callout === 'function') hud.callout(text);
  }

  // Step B: most enemies 10-20 m away (closer, readable fights); ~20% further (22-40 m), e.g. rooftop shooters.
  let poolRange = [10, 20];
  function coverPool(types, range) {
    const out = [];
    const rg = range || poolRange;
    const segs = world.segments || [];
    const pz = camera.position.z;
    for (let s = 0; s < segs.length; s++) {
      const pts = segs[s].coverPoints || [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const ahead = pz - p.pos.z;
        if (ahead < rg[0] || ahead > rg[1]) continue;
        if (types && types.indexOf(p.type) < 0) continue;
        out.push(p);
      }
    }
    return out;
  }

  // Cover-slot reservation + spacing (tester p1b: two fighters 30 px apart on one barrier, the other cover empty).
  // A spot is taken when another live fighter's anchor (its reserved slot, set as soon as it picks it), its stand spot,
  // or where it actually is (a car/barrel hide sits 0.75-2.75 m behind the anchor) is within COVER_GAP of it.
  const COVER_GAP2 = 1.8 * 1.8;
  function occupiedBy(pos, self) {
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e.alive || e === self) continue;
      const h = e.home;
      if ((h.x - pos.x) ** 2 + (h.z - pos.z) ** 2 < COVER_GAP2) return true;
      const a = e.anchor && e.anchor.pos;
      if (a && (a.x - pos.x) ** 2 + (a.z - pos.z) ** 2 < COVER_GAP2) return true;
      const g = e.group && e.group.position;
      if (g && g.y < 0.5 && (g.x - pos.x) ** 2 + (g.z - pos.z) ** 2 < COVER_GAP2) return true;
    }
    return false;
  }
  // Prefer spread: +1 per other live fighter within 4 m of the spot (anchor or body).
  function crowdAt(pos, self) {
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      const e = list[i]; if (!e.alive || e === self) continue;
      const a = (e.anchor && e.anchor.pos) || e.group.position;
      if ((a.x - pos.x) ** 2 + (a.z - pos.z) ** 2 < 16) n++;
    }
    return n;
  }

  function spawnOne(prefer) { const ts = performance.now(); const r = spawnOne_(prefer); const d = performance.now() - ts; if (d > 40) (window.SS_SPIKES = window.SS_SPIKES || []).push(['spawn', Math.round(ts), Math.round(d)]); return r; }
  function spawnOne_(prefer) {
    poolRange = Math.random() < 0.8 ? [10, 20] : [22, 40];
    const roofOnly = prefer === 'roof'; if (roofOnly) { prefer = 'popper'; poolRange = [12, 40]; }
    const diff = difficulty();
    const roll = prefer || (Math.random() < 0.45 ? 'popper' : Math.random() < 0.55 ? 'shifter' : 'flanker');
    let types;
    if (roofOnly) types = ['roof'];
    else if (roll === 'popper') types = ['window', 'roof', 'wall', 'barrel', 'car'];
    else if (roll === 'flanker') types = ['alley', 'door'];
    else types = ['wall', 'barrel', 'car', 'door', 'alley'];
    let pool = coverPool(types);
    if (!pool.length && roofOnly) return null;
    if (!pool.length) pool = coverPool(null);
    if (!pool.length) return null;
    let pick = pool[(Math.random() * pool.length) | 0];
    for (let n = 0; n < 6; n++) {
      const tryP = pool[(Math.random() * pool.length) | 0];
      if (!occupiedBy(tryP.pos, null)) { pick = tryP; break; }
    }
    if (occupiedBy(pick.pos, null)) return null;
    const enemy = buildEnemy(roll, pick);
    if (roll === 'flanker') {
      const side = Math.sign(pick.pos.x) || (Math.random() < 0.5 ? -1 : 1);
      enemy.flankFrom.copy(enemy.home);
      // flankers emerge from the alley but start at the street mouth if the alley spot is deep
      enemy.flankFrom.x = Math.sign(enemy.flankFrom.x) * Math.min(Math.abs(enemy.flankFrom.x), 6.9);
      // Flank to real cover: the nearest free car/barrel/wall on this side that is closer to the player than the alley.
      // On arrival the flanker becomes a cover fighter there (crouch, lean out, fire, hide). No standing in the open street.
      let dest = null, bd = 1e9;
      const pool = coverPool(['car', 'barrel', 'wall']);
      for (let i = 0; i < pool.length; i++) { const c = pool[i];         const toward = c.pos.z - enemy.home.z; if (toward < 1 || toward > 18) continue; if (occupiedBy(c.pos, enemy)) continue;
        // Visible flank: prefer cover across the street so the run crosses the player's view.
        const d = Math.abs(toward - 8) + (Math.sign(c.pos.x) === side ? 6 : 0); if (d < bd) { bd = d; dest = c; } }
      enemy.flankCover = dest;
      squadCall('Flanking!');
      if (dest) enemy.flankTo.copy(tuckOf(standPos(dest), dest));
      else enemy.flankTo.set(side * 5.6, 0, enemy.home.z + 2 + Math.random() * 3); // hug the facade line at the alley mouth
    }
    setupLoco(enemy);
    enemy.shootCd = 0.35 + Math.random() * (0.9 - diff * 0.4);
    return enemy;
  }

  // Ground path into the opening, then a short climb. No underground hide point.
  // Bring a hidden/stuck/behind-the-player enemy to a visible ground cover spot 12-30 m ahead, already leaning out to fire.
  const _frM = new THREE.Matrix4(), _frF = new THREE.Frustum();
  // m1t: what the player can actually see - the drawn geometry the player's shots use (world.shotList), inside the haze.
  const _losR = new THREE.Raycaster(), _losP = new THREE.Vector3(), _losD = new THREE.Vector3();
  function clearToEye(pt) { const c = camera.position; _losD.copy(pt).sub(c); const d = _losD.length(); if (d < 0.01) return true;
    if (scene.fog && scene.fog.density && d > 1.05 / scene.fog.density) return false; _losD.divideScalar(d); _losR.set(c, _losD); _losR.far = d - 0.35;
    return _losR.intersectObjects(world.shotList ? world.shotList() : world.colliders, false).length === 0; }
  // m1u: 'sees' = a meaningful part of the fighter: the chest centre AND one more point (head or a shoulder) clear,
  // and the body at least ~12 px tall on screen (a few pixels behind a far cart is not visible).
  const _losS = new THREE.Vector3();
  // m1v: on screen = inside the CURRENT camera frustum (matrices refreshed now, so it holds at 1 fps), with a margin
  const _osV = new THREE.Vector3();
  function onScreen(pt, margin) { camera.updateMatrixWorld(); _osV.copy(pt).project(camera); const m = margin == null ? 0.94 : margin; return _osV.z > -1 && _osV.z < 1 && Math.abs(_osV.x) <= m && Math.abs(_osV.y) <= m; }
  api.onScreen = onScreen;
  function playerSees(e) { e.group.getWorldPosition(_losP); const x0 = _losP.x, y0 = _losP.y, z0 = _losP.z, c = camera.position;
    _losS.set(x0, y0 + 1.25, z0); if (!onScreen(_losS)) { _losS.set(x0, y0 + 1.62, z0); if (!onScreen(_losS)) return false; } // chest or head on screen
    const d = Math.hypot(x0 - c.x, z0 - c.z, y0 + 1.2 - c.y); const px = 1.7 / (2 * d * Math.tan(camera.fov * Math.PI / 360)) * (window.innerHeight || 390); if (px < 12) return false;
    _losP.set(x0, y0 + 1.25, z0); if (!clearToEye(_losP)) return false;
    const rx = (z0 - c.z), rz = -(x0 - c.x), rl = Math.hypot(rx, rz) || 1; // sideways unit (shoulders)
    for (const [ox, oy] of [[0, 1.62], [0.22, 1.4], [-0.22, 1.4]]) { _losS.set(x0 + rx / rl * ox, y0 + oy, z0 + rz / rl * ox); if (clearToEye(_losS)) return true; }
    return false; }
  function inView(e) { _frM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); _frF.setFromProjectionMatrix(_frM); return _frF.containsPoint(e.group.position); }
  // m1t: the last fighter, unseen by the player for 10 s, is moved to a spot the player can really see (ground fighters;
  // roof/window shooters are made to peek instead - no vertical pops). Candidates are checked with clearToEye.
  function relocated(e) { const nowR = performance.now() / 1000; e.seenSinceR = 0; e.movedR = nowR; e.noFireUntilR = nowR + SEEN_BEFORE_HIT_S; e.noFireUntilSim = (window.SS ? (window.SS.simTime || 0) : 0) + SEEN_BEFORE_HIT_S; e.shootCd = Math.max(e.shootCd || 0, SEEN_BEFORE_HIT_S); e.rounds = 0; }
  function toSeenSpot(e) {
    // roof/window shooters first get a forced peek; if still unseen next time, they are moved to the street while the
    // player cannot see them (no visible pop; e.warps marks it so the motion test ignores the jump)
    if (((e.anchor && isElevated(e.anchor.type)) || e.group.position.y > 0.05) && !e.peekForced) { e.peekForced = true; e.engaged = true; e.hiddenT = 6; try { beginFire(e); } catch (_) {} return false; }
    if (playerSees(e)) { e.hiddenT = 0; return false; }
    if (REPOS && e.phase === 'fire') { e.hiddenT = 5; return false; } // p1b: never rescue mid-fire
    e.peekForced = false; e.warps = (e.warps | 0) + 1;
    const pz = camera.position.z, a0 = e.anchor, h0 = e.home; let best = null, bd = 1e9;
    for (const seg of world.segments || []) for (const c of seg.coverPoints || []) {
      if (!['car', 'barrel', 'wall', 'door'].includes(c.type)) continue; const ahead = pz - c.pos.z; if (ahead < 10 || ahead > 26 || Math.abs(c.pos.x) > 9 || occupiedBy(c.pos, e)) continue;
      e.anchor = c; e.home = standPos(c); const fp = firePoint(e); _losP.set(fp.x, 1.25, fp.z); if (!clearToEye(_losP)) continue;
      const d = Math.abs(ahead - 16) + Math.abs(c.pos.x) * 0.3; if (d < bd) { bd = d; best = c; } }
    e.anchor = a0; e.home = h0;
    e.behavior = 'shifter'; e.unseenT = 0; e.hiddenT = 0; e.engaged = true; e.afterHide = false; e.vanishSaved = 0;
    // p1b: a ground fighter RUNS to the seen spot (exposed, 'Moving!') instead of warping. The warp also reset the
    // last-enemy hold clock, so the 20-25 s reposition never came up.
    if (best && REPOS && e.group.position.y < 0.05 && !(a0 && isElevated(a0.type))) {
      e.warps = Math.max(0, (e.warps | 0) - 1); e.seenForced = (e.seenForced | 0) + 1; if (window.SS) window.SS.seenForced = (window.SS.seenForced | 0) + 1;
      startReposition(e, best); return true;
    }
    if (REPOS && inView(e)) { e.anchor = a0; e.home = h0; e.hiddenT = 0; try { beginFire(e); } catch (_) {} return false; } // on screen: step out, never pop
    e.teleports = (e.teleports | 0) + 1; if (window.SS) window.SS.lastTeleport = { why: 'toSeenSpot', best: !!best, t: window.SS.simTime };
    if (best) { e.anchor = best; e.home = standPos(best); e.group.position.copy(firePoint(e)); }
    else { let pt = null; for (const ah of [16, 13, 19, 10, 22]) { for (const x of [0, -1.5, 1.5, -3, 3]) { _losP.set(camera.position.x + x, 1.25, pz - ah); if (clearToEye(_losP)) { pt = new THREE.Vector3(_losP.x, 0, _losP.z); break; } } if (pt) break; }
      if (!pt) pt = new THREE.Vector3(camera.position.x, 0, pz - 14);
      e.anchor = { type: 'door', pos: new THREE.Vector3(pt.x, 1.2, pt.z) }; e.home = pt.clone(); e.group.position.copy(pt); }
    e.group.position.y = 0; e.path = null; e.pathI = 0; e.seenForced = (e.seenForced | 0) + 1; if (window.SS) window.SS.seenForced = (window.SS.seenForced | 0) + 1;
    beginFire(e); relocated(e); return true;
  }
  function toVisibleCover(e) {
    const aheadE = camera.position.z - e.group.position.z, dE = e.group.position.distanceTo(camera.position);
    // (m1p stall) a roof/window shooter stays up only while it is ahead and close enough to see through the haze
    if ((e.anchor && isElevated(e.anchor.type)) || e.group.position.y > 0.05) { e.unseenT = 0; e.engaged = true; try { beginFire(e); } catch (_) {} return; } // m1t: never teleport anyone off a roof/window/climb (vertical pop); they peek (hits still need the player's sight) // never teleport a roof/window shooter to the street
    // p1b (Zack: no popping): never rescue a fighter that is firing or that the player can see; it retries later.
    if (REPOS && (e.phase === 'fire' || playerSees(e))) { e.unseenT = UNSEEN_LIMIT * 0.6; e.behindT = 0; return; }
    // Never teleport a fighter the player could be looking at (tester: a close fighter vanished mid-turn): within 25 m,
    // or on screen, it steps out and fights from where it is instead.
    { const d = e.group.position.distanceTo(camera.position); camera.updateMatrixWorld(); _frM.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); _frF.setFromProjectionMatrix(_frM);
      // ...but only a fighter hiding in cover (not exposed). An exposed fighter that is still unseen is blocked by geometry
      // (e.g. inside a doorway collider): it can't be hit there, so it must still be moved (tester: 110 rounds, no kill).
      // (m1p stall) ...and only when it is ahead and on screen: one hiding beside/behind the player held the wave forever.
      if (d < 25 && aheadE > 2 && _frF.containsPoint(e.group.position) && e.anchor && !e.exposed) { e.unseenT = 0; e.engaged = true; try { beginFire(e); } catch (_) {} e.vanishSaved = (e.vanishSaved | 0) + 1; return; } }
    const pz = camera.position.z; let best = null, bd = 1e9;
    for (const seg of world.segments || []) for (const c of seg.coverPoints || []) {
      if (!['car', 'barrel', 'wall', 'door'].includes(c.type)) continue;
      const ahead = pz - c.pos.z; if (ahead < 12 || ahead > 30 || occupiedBy(c.pos, e)) continue;
      const d = Math.abs(ahead - 18) + Math.abs(c.pos.x) * 0.3; if (d < bd) { bd = d; best = c; } }
    e.behavior = 'shifter'; e.unseenT = 0; e.seen = true; e.engaged = true; e.afterHide = false;
    // p1b: a ground fighter hiding in cover RUNS there (the warp popped 9-10 m and reset the hold clock). An exposed one
    // that is still unseen runs too (a path leads it out of any collider); only no-cover / elevated cases still warp.
    if (best && REPOS && e.group.position.y < 0.05) { e.seenForced = (e.seenForced | 0) + 1; startReposition(e, best); return; }
    const a0 = e.anchor, h0 = e.home;
    if (best) { e.anchor = best; e.home = standPos(best); }
    else { const side = Math.sign(e.group.position.x) || 1; e.anchor = { type: 'door', pos: new THREE.Vector3(side * 5.4, 1.2, pz - 18) }; e.home = standPos(e.anchor); }
    // A warp is left only for the no-run cases, and only when BOTH ends are out of view; otherwise run (or step out here).
    const dest = firePoint(e); dest.y = 0;
    if (REPOS && (inView(e) || onScreen(_losS.set(dest.x, 1.2, dest.z), 1.05))) {
      if (best && e.group.position.y < 0.05) { e.anchor = a0; e.home = h0; startReposition(e, best); return; }
      e.anchor = a0; e.home = h0; e.unseenT = 0; e.vanishSaved = (e.vanishSaved | 0) + 1; try { beginFire(e); } catch (_) {} return;
    }
    e.teleports = (e.teleports | 0) + 1; if (window.SS) window.SS.lastTeleport = { why: 'toVisibleCover', exposed: !!e.exposed, offscreen: true, t: window.SS.simTime };
    e.group.position.copy(dest); e.path = null; e.pathI = 0;
    beginFire(e); relocated(e);
  }
  function setupLoco(enemy) {
    enemy.posture = 'idle';
    enemy.moving = false;
    enemy.moveKind = 'run';
    enemy.phaseT = 0;
    enemy.pathI = 0;
    const type = enemy.anchor.type;
    if (enemy.behavior === 'flanker') {
      enemy.phase = 'relocate';
      enemy.path = [enemy.flankTo.clone()];
      enemy.group.position.copy(enemy.flankFrom);
      enemy.group.position.y = 0;
      enemy.exposed = false;
      return;
    }
    const home = enemy.home;
    const zOff = (Math.random() < 0.5 ? -1 : 1) * (2.0 + Math.random() * 1.4);
    if (isElevated(type)) {
      // Already up there (Zack: no facade climbing / vertical hops): roof shooters step out along the parapet from a
      // roof door ~1 m away at roof height; window shooters appear in the opening.
      const start = type === 'roof' ? home.clone().setZ(home.z + Math.sign(zOff) * 1.0) : home.clone();
      enemy.phase = 'approach';
      enemy.path = [home.clone()];
      enemy.group.position.copy(start);
    } else if (type === 'door' || type === 'alley') {
      const start = groundPoint(home.x, home.z + zOff);
      const at = home.clone();
      at.y = 0;
      enemy.phase = 'approach';
      enemy.path = [at];
      enemy.group.position.copy(start);
    } else {
      const tuck = tuckOf(home, enemy.anchor);
      const start = new THREE.Vector3(tuck.x, 0, tuck.z + zOff);
      start.x = Math.sign(start.x || 1) * Math.min(Math.abs(start.x), STREET_X);
      enemy.phase = 'approach';
      enemy.path = [tuck];
      enemy.group.position.copy(start);
    }
    enemy.exposed = false;
    enemy.goal = enemy.path[0].clone();
  }

  function enterCover(enemy, hold) {
    enemy._repositioning = false;
    enemy.phase = 'takeCover';
    enemy.phaseT = hold != null ? hold : 0.22 + Math.random() * 0.2;
    enemy.posture = 'crouch';
    enemy.moving = false;
    enemy.exposed = false;
    enemy.goal = null;
  }

  function firePoint(enemy) {
    if (isElevated(enemy.anchor.type)) return enemy.home.clone();
    if (FAR[enemy.anchor.type]) return edgePeek(enemy.anchor);
    const p = enemy.home.clone();
    p.y = 0;
    return p;
  }

  // Where this peek stands. Walls keep firePoint (the side-step clears the corner). Cars/barrels:
  // over = rear centre, left/right = either end. LOS still samples firePoint.
  function peekDest(enemy) {
    const a = enemy.anchor;
    if (!LOCO2 || !enemy.peekKind || !a || !FAR[a.type]) return firePoint(enemy);
    const far = FAR[a.type], edge = EDGE[a.type], p = a.pos;
    const z = p.z - far + (enemy.peekKind === 'over' ? 0.35 : 0.25);
    const x = enemy.peekKind === 'left' ? p.x + edge : enemy.peekKind === 'right' ? p.x - edge : p.x;
    return new THREE.Vector3(x, 0, z);
  }

  function hidePoint(enemy) {
    if (isElevated(enemy.anchor.type)) return sillTuck(enemy.home, enemy.anchor);
    return tuckOf(enemy.home, enemy.anchor);
  }

  function startPeek(enemy) {
    if (LOCO2 && (enemy.duckT || 0) > 0) {
      if (enemy.phase !== 'takeCover') enterCover(enemy, Math.max(0.08, enemy.duckT));
      return;
    }
    if (LOCO2 && qName() !== 'ultra-low') {
      if ((enemy._peekPh || 0) <= 0.02) enemy._peekArm = false;
      armPeek(enemy);
    }
    enemy.phase = 'peek';
    enemy.posture = crouchPeek(enemy) ? 'crouch' : 'lean';
    enemy.path = [peekDest(enemy)];
    enemy.pathI = 0;
    enemy.exposed = true;
    enemy.goal = enemy.path[0];
  }

  function startHide(enemy) {
    enemy.phase = 'hide';
    enemy.posture = 'crouch';
    enemy.exposed = false;
    enemy.path = [hidePoint(enemy)];
    enemy.pathI = 0;
    enemy.moveKind = 'strafe';
    enemy.goal = enemy.path[0];
  }

  function pathOnto(enemy, anchor) {
    const home = standPos(anchor);
    const here = enemy.group.position;
    const pts = [];
    if (here.y > 0.45) pts.push(groundPoint(here.x, here.z));
    const elev = isElevated(anchor.type);
    if (elev && here.y < 0.45) return [groundPoint(home.x, home.z)]; // never climb a facade from the street
    const at = elev ? groundPoint(home.x, home.z) : (anchor.type === 'door' || anchor.type === 'alley' ? home.clone().setY(0) : tuckOf(home, anchor));
    pts.push(at);
    if (elev) pts.push(home);
    return pts;
  }

  function startRelocate(enemy) {
    const elevated = isElevated(enemy.anchor.type);
    if (elevated) { enterCover(enemy); return; } // elevated shooters hold their spot (relocating meant climbing down/up a facade)
    const types = elevated ? ['window', 'roof', 'door'] : ['wall', 'barrel', 'car', 'door'];
    const pool = coverPool(types);
    let best = null;
    let bestD = 1e9;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (p === enemy.anchor) continue;
      const d = p.pos.distanceToSquared(enemy.home);
      if (d < 1.2 || d > 81) continue;
      if (occupiedBy(p.pos, enemy)) continue;
      const dS = d + 12 * crowdAt(p.pos, enemy); // nearest, but away from the others
      if (dS < bestD) { bestD = dS; best = p; }
    }
    if (!best) {
      startPeek(enemy);
      return;
    }
    enemy.anchor = best;
    enemy.home = standPos(best);
    enemy.path = pathOnto(enemy, best);
    enemy.pathI = 0;
    const pathLen = enemy.path && enemy.path.length
      ? enemy.group.position.distanceTo(enemy.path[enemy.path.length - 1])
      : 0;
    if (!enemy.moveCalled && pathLen > 2) {
      enemy.moveCalled = true;
      squadCall('Moving!');
    }
    enemy.phase = 'relocate';
    enemy.posture = 'idle';
    if (!enemy._repositioning) enemy.exposed = false;
    enemy.moveKind = 'run';
    enemy.goal = enemy.path[0];
    if (LOCO2) beginCoverExit(enemy);
  }

  // Tester m1s: a lone last fighter far down the street (>35 m) dragged the fight out. It runs up to ground cover
  // 14-28 m from the player (in the open, so it can be shot on the way).
  function advanceNearer(enemy) {
    const pz = camera.position.z, here = enemy.group.position; const pool = coverPool(['wall', 'barrel', 'car', 'door']);
    let best = null, bestD = 1e9;
    for (let i = 0; i < pool.length; i++) { const c = pool[i]; const ahead = pz - c.pos.z; if (ahead < 12 || ahead > 28 || Math.abs(c.pos.x) > 9) continue;
      if (occupiedBy(c.pos, enemy)) continue; const d = c.pos.distanceToSquared(here); if (d < bestD) { bestD = d; best = c; } }
    if (!best) return; // no cover in range: stay put (the unseen/behind rules still apply)
    enemy.anchor = best; enemy.home = standPos(best); enemy.path = pathOnto(enemy, best); enemy.pathI = 0;
    enemy.phase = 'relocate'; enemy.posture = 'idle'; enemy.exposed = true; enemy.moveKind = 'run'; enemy.goal = enemy.path[0]; enemy.advanced = (enemy.advanced | 0) + 1;
    if (LOCO2) beginCoverExit(enemy);
    try { squadCall('He\'s moving up!'); } catch (_) {}
  }

  // Last ground fighter who has camped one cover: another wall/barrel/car/door 6-20 m away, 12-30 m ahead, clear shot.
  // Tier 0 is the 3c spec (6-20 m hop, 12-30 m ahead, clear shot). p1b: on the real street that often found nothing
  // (the pool was also clipped to the last spawn's 10-20 m window), so widen in steps before giving up.
  // e._reposRej counts why candidates were dropped (tests / ?debug).
  const REPOS_TIERS = [[6, 20, 12, 30, true], [3, 24, 8, 38, true], [3, 24, 8, 38, false]];
  function pickRepositionCover(e) {
    if (!e.anchor || !e.anchor.pos) return null;
    const pool = coverPool(['wall', 'barrel', 'car', 'door'], [6, 42]);
    const pz = camera.position.z, a0 = e.anchor, h0 = e.home;
    const rej = e._reposRej = { pool: pool.length, same: 0, occupied: 0, hop: 0, ahead: 0, los: 0, tier: -1 };
    for (let t = 0; t < REPOS_TIERS.length; t++) {
      const [dMin, dMax, aMin, aMax, needLos] = REPOS_TIERS[t];
      let best = null, bestS = 1e9;
      try {
        for (let i = 0; i < pool.length; i++) {
          const c = pool[i];
          if (c === a0 || !c.pos) { rej.same++; continue; }
          if (occupiedBy(c.pos, e)) { rej.occupied++; continue; }
          const d2 = c.pos.distanceToSquared(a0.pos);
          if (d2 < dMin * dMin || d2 > dMax * dMax) { rej.hop++; continue; }
          const ahead = pz - c.pos.z;
          if (ahead < aMin || ahead > aMax) { rej.ahead++; continue; }
          e.anchor = c; e.home = standPos(c);
          const fp = firePoint(e); _losP.set(fp.x, 1.25, fp.z);
          const los = clearToEye(_losP);
          if (needLos && !los) { rej.los++; continue; }
          const dist = Math.sqrt(d2);
          const score = Math.abs(dist - 12) + 0.3 * Math.abs(c.pos.x) + 6 * crowdAt(c.pos, e) + (los ? 0 : 8);
          if (score < bestS) { bestS = score; best = c; }
        }
      } finally { e.anchor = a0; e.home = h0; }
      if (best) { rej.tier = t; return best; }
    }
    return null;
  }

  // No 12-30 m hop: same pool and filters, but 5-12 m further ahead of the player (still <= 40 m).
  function pickFallbackCover(e) {
    if (!e.anchor || !e.anchor.pos) return null;
    const pool = coverPool(['wall', 'barrel', 'car', 'door'], [6, 42]);
    const pz = camera.position.z, a0 = e.anchor, h0 = e.home;
    const aAhead = pz - a0.pos.z;
    let best = null, bestS = 1e9;
    try {
      for (let i = 0; i < pool.length; i++) {
        const c = pool[i];
        if (c === a0 || !c.pos) continue;
        if (occupiedBy(c.pos, e)) continue;
        const d2 = c.pos.distanceToSquared(a0.pos);
        if (d2 < 36 || d2 > 400) continue;
        const ahead = pz - c.pos.z;
        const extra = ahead - aAhead;
        if (extra < 5 || extra > 12 || ahead > 40) continue;
        e.anchor = c; e.home = standPos(c);
        const fp = firePoint(e); _losP.set(fp.x, 1.25, fp.z);
        if (!clearToEye(_losP)) continue;
        const score = Math.abs(extra - 8) + 0.3 * Math.abs(c.pos.x);
        if (score < bestS) { bestS = score; best = c; }
      }
    } finally { e.anchor = a0; e.home = h0; }
    return best;
  }

  // Hops under 6 m use crouchRun when that clip exists. The blend and desiredAnim have no crouchRun, so they run.
  function repositionMoveKind(e, dist) {
    if (dist < 6 && e.actions && e.actions.crouchRun) return 'crouchRun';
    return 'run';
  }

  // Hand the run to the existing relocate path. Rise overlaps the first steps. No teleport.
  function startReposition(e, c) {
    if (LOCO2) beginCoverExit(e);
    e.anchor = c;
    e.home = standPos(c);
    e.path = pathOnto(e, c);
    e.pathI = 0;
    const end = e.path && e.path[e.path.length - 1];
    const dist = end ? Math.hypot(end.x - e.group.position.x, end.z - e.group.position.z) : 0;
    e._reposDist = dist;
    e.phase = 'relocate';
    e.posture = 'idle';
    e.exposed = true;
    e._repositioning = true;
    e.moveKind = repositionMoveKind(e, dist);
    e.goal = e.path[0];
    e.repositions = (e.repositions | 0) + 1;
    if (window.SS) window.SS.lastRepos = (window.SS.lastRepos | 0) + 1;
    e._lastReposS = window.SS ? (window.SS.simTime || 0) : 0;
    e.coverHoldT = 0;
    e._holdAnchor = null;
    e._holdPos = null;
    if (window.SS) { const last = aliveCount() === 1; window.SS.reposLast = (window.SS.reposLast | 0) + (last ? 1 : 0); window.SS.reposSquad = (window.SS.reposSquad | 0) + (last ? 0 : 1); }
    squadCall('Moving!');
  }

  // Horizontal run/walk, or a short climb when the waypoint is up the facade. No Y pop.
  function stepToward(enemy, dest, speed, dt) {
    const p = enemy.group.position;
    _fwd.copy(dest).sub(p);
    const dist = _fwd.length();
    if (dist <= 0.07) {
      p.copy(dest);
      enemy.moving = false; enemy.curSpeed = 0;
      return true;
    }
    const horiz = Math.hypot(_fwd.x, _fwd.z);
    const climb = Math.abs(_fwd.y) > 0.3 && horiz < 1.2;
    const lateral = enemy.phase === 'peek' || enemy.phase === 'hide';
    enemy.moveKind = lateral ? 'strafe' : climb ? 'walk' : 'run';
    if (!lateral && !climb && dist < 1.5) enemy.moveKind = 'walk';
    else if (!lateral && !climb && enemy._repositioning) enemy.moveKind = repositionMoveKind(enemy, enemy._reposDist != null ? enemy._reposDist : dist);
    enemy.moving = true;
    if (HITS2 && enemy.speedMul > 0 && enemy.speedMul < 1) speed *= enemy.speedMul; // leg wound: path speed x0.6
    if (LOCO2) speed = coverGaitSpeed(enemy, speed);
    // Human locomotion: accelerate ~7 m/s², brake into the last metre, no instant starts/stops (no sliding).
    const prevV = enemy.curSpeed || 0;
    const brake = Math.sqrt(2 * 6 * Math.max(0, dist - 0.05)) + 0.3;
    let want = Math.min(speed, brake);
    if (LOCO2 && (enemy.approachK || 0) > 0 && dist > 0.07) want = Math.max(0.5, want);
    enemy.curSpeed = want > prevV ? Math.min(want, prevV + 7 * dt) : Math.max(want, prevV - 9 * dt);
    const step = Math.min(dist, enemy.curSpeed * dt);
    const dy = _fwd.y; _fwd.y = 0; const hd = Math.max(1e-4, horiz);
    p.addScaledVector(_fwd.multiplyScalar(1 / hd), Math.min(hd, step));
    p.y += Math.sign(dy) * Math.min(Math.abs(dy), 0.45 * dt); // vertical drift ≤0.45 m/s (stairs-free scene: no hops)
    if (p.y < 0) p.y = 0;
    if (horiz > 0.12 && !LOCO2) turnTo(enemy, dest.x, dest.z, 9);
    enemy.moveSpeed = step / Math.max(dt, 1e-4);
    return false;
  }

  function followPath(enemy, dt, diff) {
    const dest = enemy.path && enemy.path[enemy.pathI];
    if (!dest) return true;
    enemy.goal = dest;
    const p = enemy.group.position;
    const horiz = Math.hypot(dest.x - p.x, dest.z - p.z);
    const climb = Math.abs(dest.y - p.y) > 0.3 && horiz < 1.2;
    const lateral = enemy.phase === 'peek' || enemy.phase === 'hide';
    const speed = lateral ? 1.85 : climb ? 3.15 : 4.15 * (1 + 0.22 * diff);
    if (climb && (enemy.phase === 'approach' || enemy.phase === 'relocate')) enemy.phase = 'climb';
    if (!stepToward(enemy, dest, speed, dt)) return false;
    enemy.pathI += 1;
    if (enemy.pathI < enemy.path.length) {
      const nxt = enemy.path[enemy.pathI];
      if (nxt && nxt.y > 0.8 && enemy.group.position.y < 0.45) enemy.phase = 'climb';
      return false;
    }
    enemy.moving = false;
    return true;
  }

  function beginFire(enemy) {
    if (LOCO2 && qName() !== 'ultra-low' && !enemy._peekArm) armPeek(enemy);
    enemy.phase = 'fire';
    let hold = 0.5 + Math.random() * 0.65;
    if (LOCO2 && enemy._fireScale > 0) hold *= enemy._fireScale; // ±30% around today's fire window
    enemy.phaseT = hold;
    enemy.posture = crouchPeek(enemy) ? 'crouch' : 'lean';
    enemy.moving = false;
    enemy.exposed = true;
    enemy.shootCd = Math.min(enemy.shootCd, (enemy.shotsTaken | 0) < 1 ? 0.45 + Math.random() * 0.3 : 0.12 + Math.random() * 0.1); // first contact: a beat before the first shot
    if (LOCO2 && !enemy._peekFired && (enemy.settleT || 0) > 0) enemy.shootCd = Math.max(enemy.shootCd, enemy.settleT);
  }

  function tickFire(enemy, dt, diff) {
    enemy.moving = false;
    enemy.posture = crouchPeek(enemy) ? 'crouch' : 'lean';
    enemy.exposed = true;
    facePlayer(enemy);
    enemy.phaseT -= dt;
    if ((enemy.suppressT || 0) > 0) enemy.suppressT = Math.max(0, enemy.suppressT - dt);
    if (player.alive && window.SS.running) {
      const slow = (enemy.suppressT || 0) > 0 ? 0.55 : 1;
      // First round of this peek only: no shot until the rise is full and settleT has run out.
      const waiting = !!(LOCO2 && enemy._peekArm && !enemy._peekFired && (!enemy._settleRoll || (enemy.settleT || 0) > 0));
      if (waiting) enemy.shootCd = Math.max(enemy.shootCd || 0, enemy._settleRoll ? (enemy.settleT || 0) : 0.05);
      else enemy.shootCd -= dt * slow;
      if (!waiting && enemy.shootCd <= 0) {
        enemyShoot(enemy);
        if (LOCO2) enemy._peekFired = true;
        let cd = (0.55 + Math.random() * 0.5) * (1.12 - 0.35 * diff) * 1.2; // fix 7: ~20% slower fire
        if (((window.SS ? window.SS.distance : 0) < 120 || burstIndex <= 2) && pressure < 0.45) cd *= 1.35;
        if ((enemy.suppressT || 0) > 0) cd *= 1.5;
        enemy.shootCd = cd;
      }
    }
    if (enemy.phaseT <= 0) startHide(enemy);
  }

  function updateFlanker(enemy, dt, diff) {
    const dest = enemy.flankTo;
    const d = enemy.group.position.distanceTo(dest);
    if ((enemy.suppressT || 0) > 0) enemy.suppressT = Math.max(0, enemy.suppressT - dt);
    if (d > 0.4) {
      // Callout only once movement has begun (rule: callouts match real movement).
      if (!enemy.flankCalled) {
        enemy.flankCalled = true;
        squadCall(dest.x >= 0 ? 'Flanking right!' : 'Flanking left!');
      }
      enemy.phase = 'relocate';
      enemy.exposed = false;
      enemy.posture = 'idle';
      enemy.path = [dest];
      enemy.pathI = 0;
      enemy.moving = true;
      enemy.moveKind = 'run';
      stepToward(enemy, dest, 4.0 * (1 + 0.25 * diff), dt);
      return;
    }
    enemy.moving = false;
    enemy.group.position.y = 0;
    { // arrived: fight from cover like everyone else
      enemy.behavior = 'shifter';
      if (enemy.flankCover) { enemy.anchor = enemy.flankCover; enemy.home = standPos(enemy.flankCover); }
      else { enemy.anchor = { type: 'door', pos: enemy.group.position.clone() }; enemy.home = enemy.group.position.clone(); }
      enemy.afterHide = false; enterCover(enemy, 0.3 + Math.random() * 0.4);
      squadCall(enemy.flankCover ? 'In cover!' : 'Set!');
      return;
    }
    enemy.exposed = true;
    enemy.posture = 'idle';
    enemy.phase = 'fire';
    facePlayer(enemy);
    if (player.alive && window.SS.running) {
      const slow = (enemy.suppressT || 0) > 0 ? 0.55 : 1;
      enemy.shootCd -= dt * slow;
      if (enemy.shootCd <= 0) {
        enemyShoot(enemy);
        let cd = (0.65 + Math.random() * 0.7) * (1.1 - 0.35 * diff) * 1.2;
        if (((window.SS ? window.SS.distance : 0) < 120 || burstIndex <= 2) && pressure < 0.45) cd *= 1.35;
        if ((enemy.suppressT || 0) > 0) cd *= 1.5;
        enemy.shootCd = cd;
      }
    }
  }

  // approach → (climb) → takeCover → peek/lean → fire → hide/crouch → relocate
  function updateCover(enemy, dt, diff) {
    const phase = enemy.phase;
    if (phase === 'approach' || phase === 'climb' || phase === 'relocate' || phase === 'peek' || phase === 'hide') {
      if (enemy._repositioning) enemy.exposed = true;
      else if (phase !== 'peek') enemy.exposed = false;
      if (LOCO2 && phase === 'hide' && ((enemy.peekT || 0) > 0.05 || (enemy._peekPh || 0) > 0.05)) {
        enemy.moving = false; enemy.curSpeed = 0;
        return;
      }
      if (followPath(enemy, dt, diff)) {
        if (phase === 'peek') beginFire(enemy);
        else if (phase === 'hide') {
          enemy.afterHide = true;
          enterCover(enemy, 0.45 + Math.random() * 0.7);
        } else enterCover(enemy);
      }
      return;
    }
    if (phase === 'takeCover') {
      enemy.moving = false;
      enemy.posture = 'crouch';
      enemy.exposed = false;
      enemy.phaseT -= dt;
      if (enemy.phaseT <= 0) {
        if (LOCO2 && (enemy.duckT || 0) > 0) return;
        if (enemy.afterHide && Math.random() < 0.45) startRelocate(enemy);
        else startPeek(enemy);
        enemy.afterHide = false;
      }
      return;
    }
    tickFire(enemy, dt, diff);
  }

  function updateEnemy(enemy, dt, diff) {
    if (!enemy.alive) return;
    if (enemy.staggerT > 0) {
      enemy.staggerT -= dt;
      if (LOCO2) { enemy.turning = null; enemy._turnCmd = null; enemy.footPlant = false; enemy._turnBig = false; exposeYaw(enemy); }
      return;
    } // hit stagger: frozen, exposed
    if (enemy.debugHold) { enemy.moving = false; if (LOCO2) steerFacing(enemy, dt); return; } // test hook (loco-facing): AI frozen in place, facing still steered
    if (enemy.behavior === 'flanker') updateFlanker(enemy, dt, diff);
    else updateCover(enemy, dt, diff);
    if (LOCO2) steerFacing(enemy, dt);
  }

  function aliveCount() {
    let n = 0;
    for (let i = 0; i < list.length; i++) if (list[i].alive) n += 1;
    return n;
  }

  // ---- Step C: grenade flush. A ground enemy lobs a grenade at a player who camps in cover; it lands beside the
  // cover, auto-cover immediately runs to another spot, and it blows 2.4 s after landing (35 dmg within 3.5 m).
  const nadeMat = visMat(0x2f3324); const nadeGeo = new THREE.SphereGeometry(0.12, 10, 8);
  // Visible grenade (tester: the camera turned with no visible grenade): red blinking warning ring where it lands.
  const nadeRingMat = new THREE.MeshBasicMaterial({ color: 0xff2a1a, transparent: true, opacity: 0.8, depthWrite: false, side: THREE.DoubleSide }); const nadeRingGeo = new THREE.RingGeometry(0.35, 0.55, 24);
  const nades = []; let nadeThisWave = false, campT = 0;
  function throwGrenade(e) {
    const m = new THREE.Mesh(nadeGeo, nadeMat); m.castShadow = true; scene.add(m);
    const from = e.group.position.clone().setY(e.group.position.y + 1.6);
    const to = camera.position.clone().setY(0.1); to.x += (Math.random() - 0.5) * 1.2; to.z -= 0.6 + Math.random() * 0.6;
    nades.push({ m, from, to, t: 0, flight: 1.1, fuse: 2.4, landed: false });
    squadCall('Grenade!'); if (window.SS && window.SS.hud && window.SS.hud.hint) window.SS.hud.hint('GRENADE! Moving cover');
    if (window.SS) window.SS.grenades = (window.SS.grenades | 0) + 1;
  }
  function updateGrenades(dt) {
    const cov = window.SS && window.SS.cover;
    if (waveActive && cov && cov.state === 'in') campT += dt; else if (!waveActive) { campT = 0; nadeThisWave = false; }
    if (waveActive && !nadeThisWave && campT > 5 && burstIndex >= 3 && Math.random() < dt * 0.35) {
      const th = list.filter((e) => e.alive && e.engaged && e.group.position.y < 0.5 && e.group.position.distanceTo(camera.position) < 26)[0];
      if (th) { nadeThisWave = true; campT = 0; throwGrenade(th); }
    }
    for (let i = nades.length - 1; i >= 0; i--) { const n = nades[i]; n.t += dt;
      if (!n.landed) { const k = Math.min(1, n.t / n.flight); n.m.position.lerpVectors(n.from, n.to, k); n.m.position.y += Math.sin(k * Math.PI) * 3.2;
        if (k >= 1) { n.landed = true; n.t = 0; n.ring = new THREE.Mesh(nadeRingGeo, nadeRingMat); n.ring.rotation.x = -Math.PI / 2; n.ring.position.copy(n.to).setY(0.05); n.ring.renderOrder = 4; scene.add(n.ring); if (window.SS && window.SS.hud && window.SS.hud.hint) window.SS.hud.hint('GRENADE! Moving cover'); if (cov && cov.relocate) cov.relocate(camera.position.x > 0 ? -1 : 1, 'grenade'); } }
      else if (n.ring && n.t < n.fuse) { n.ring.visible = Math.floor(n.t * 6) % 2 === 0; }
      if (n.landed && n.t >= n.fuse) { if (n.ring) { scene.remove(n.ring); n.ring = null; }
        for (let j = 0; j < 4; j++) muzzleFlash(n.m.position.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 0.3 + Math.random(), (Math.random() - 0.5) * 1.5)));
        const d = n.m.position.distanceTo(camera.position.clone().setY(n.m.position.y)); if (d < 3.5) player.damage(35 * (1 - d / 4.5), n.m.position);
        if (window.SS && window.SS.audio && window.SS.audio.enemyShot) window.SS.audio.enemyShot(n.m.position);
        scene.remove(n.m); nades.splice(i, 1); } }
  }

  // Reinforcement truck: drives in from 70 m ahead, stops ~20 m out and unloads 2 fighters (part of this wave's fixed total).
  let truck = null, truckPending = 0;
  const truckBody = visMat(0x6b5a3a), truckCab = visMat(0x3c4a3a);
  function startTruck() {
    const g = new THREE.Group(); const side = Math.random() < 0.5 ? -1 : 1;
    const bed = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.3, 3.6), truckBody); bed.position.set(0, 1.15, 1.0); bed.castShadow = true;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.6), truckCab); cab.position.set(0, 1.3, -1.7); cab.castShadow = true;
    for (const [x, z] of [[-1, 1.8], [1, 1.8], [-1, -1.6], [1, -1.6]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10), truckCab); w.rotation.z = Math.PI / 2; w.position.set(x, 0.42, z); bed.add(w); w.position.y -= 1.15; w.position.z -= 1.0; }
    const model = art.done && art.get && art.get('truck_mil') ? art.staticInstance('truck_mil') : null;
    if (model) { // Kenney Car Kit flatbed (CC0), repainted olive drab; replaces the box truck
      art.fitToBox(model, 2.3, 2.5, 5.6, { keepAspect: true, alignLong: true }); model.name = 'truck_mil';
      let rubber = null; const isWheel = (o) => { for (let q = o; q && q !== model; q = q.parent) if (/wheel/i.test(q.name)) return true; return false; };
      model.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true;
        if (isWheel(o)) { rubber = rubber || (() => { const m = o.material.clone(); m.color.setRGB(0.16, 0.16, 0.15); m.roughness = 0.95; return m; })(); o.material = rubber; } } }); // dark rubber tyres
      g.add(model);
    } else g.add(bed, cab);
    g.position.set(side * 2.6, 0, camera.position.z - 70); scene.add(g);
    truck = { g, stopZ: camera.position.z - 20, unloaded: false, t: 0 }; truckPending = 2; squadCall('Truck inbound!');
    if (window.SS) { window.SS.trucks = (window.SS.trucks | 0) + 1; if (window.SS.hud && window.SS.hud.banner) window.SS.hud.banner('REINFORCEMENTS'); }
  }
  function updateTruck(dt) {
    if (!truck) return; truck.t += dt;
    if (!truck.unloaded) { truck.g.position.z = Math.min(truck.stopZ, truck.g.position.z + 9 * dt);
      if (truck.g.position.z >= truck.stopZ - 0.01) { truck.unloaded = true;
        for (let k = 0; k < 2; k++) { const e = spawnOne('shifter'); truckPending -= 1; if (e) { e.group.position.set(truck.g.position.x - Math.sign(truck.g.position.x) * 1.3, 0, truck.g.position.z + 2.6 + k * 0.8); e.engaged = waveActive;
            // dismount: run from the tailgate to the assigned cover (exposed while moving)
            try { e.path = pathOnto(e, e.anchor); e.pathI = 0; e.phase = 'relocate'; e.posture = 'idle'; e.moveKind = 'run'; e.exposed = true; e.goal = e.path && e.path[0]; e.fromTruck = true; } catch (err) { reportErr('truck dismount', err); } } } truckPending = 0; } }
    else if (truck.t > 40 || (!waveActive && truck.g.position.z > camera.position.z - 5)) { scene.remove(truck.g); truck = null; }
  }

  function update(dt) {
    if (HITS2) { try { if (window.SS) window.SS.hitZones = hitZones; } catch (_) {} }
    updateGrenades(dt); updateTruck(dt);
    const diff = difficulty();
    phaseT -= dt;
    const alive = aliveCount();
    const dNow = window.SS ? window.SS.distance : 0;
    if (burstIndex === 0 && window.SS && window.SS.running) { // m1x: opening quiet walk (real time, capped per frame)
      const nr = performance.now(); quietRunT += quietRealAt ? Math.min(2.0, (nr - quietRealAt) / 1000) : 0; /* m1z: cap 2 s/frame (was 0.5: at 0.6 fps the then-24 s quiet walk took ~77 s of wall time) - a tab switch still cannot skip it */ quietRealAt = nr;
      const k = FIRST_CONTACT_S > APPROACH_S ? Math.max(0, Math.min(1, (quietRunT - APPROACH_S) / (FIRST_CONTACT_S - APPROACH_S))) : 1;
      window.SS.approach = quietRunT >= APPROACH_S ? k : 0; window.SS.quietRunT = quietRunT;
      if (!radioWarned && FIRST_CONTACT_S > 0 && quietRunT >= FIRST_CONTACT_S - RADIO_WARN_S) { radioWarned = true; window.SS.radioWarnAt = performance.now();
        if (window.SS.hud && window.SS.hud.radio) window.SS.hud.radio('Contact reported ahead. Stay sharp.'); else squadCall('Contact reported ahead'); }
    } else if (window.SS) window.SS.approach = null;
    if (phase === 'quiet') {
      // m1u: the next wave waits (up to 8 s past its distance) for out-of-combat regen to bring the player to >= 90 hp
      if (dNow >= breatherTo && waveClears > 0 && !waveActive && alive === 0) { regenWaitT += dt; } else regenWaitT = 0;
      const healthy = !window.SS || waveClears === 0 || (window.SS.health == null ? 100 : window.SS.health) >= 90 || regenWaitT > 8;
      if (phaseT <= 0 && dNow >= breatherTo && (burstIndex > 0 || quietRunT >= FIRST_CONTACT_S) && !waveActive && alive === 0 && truckPending === 0 && healthy) { // never start a wave on top of a live one (m1r: ENEMIES kept refilling) // a real 25-40 m walk after each cleared wave
        phase = 'burst';
        burstIndex += 1;
        if (window.SS) window.SS.bursting = true;
        squadCall('Contact!'); if (window.SS && window.SS.hud && window.SS.hud.banner) window.SS.hud.banner('CONTACT');
        if (!contactHintShown && window.SS && window.SS.hud && window.SS.hud.hint) {
          contactHintShown = true;
          setTimeout(() => { if (window.SS && window.SS.hud && window.SS.hud.hint) window.SS.hud.hint('Drag to aim · shots go to center'); }, 1400);
        }
        // Soften wave 2 / early bursts: fewer simultaneous enemies
        const early = burstIndex <= 2 || (window.SS && window.SS.distance < 120);
        // Tester: 2-3 enemies per wave; the last one of a 3-wave (or 1 in 2 of 2-waves) is a visible flanker.
        // Step D: escalating waves (2, 2, 3, 3, then 3-4) + a reinforcement truck (+2) every 4th wave.
        burstCap = burstIndex <= 2 ? 2 : burstIndex <= 4 ? 3 : (Math.random() < 0.5 ? 4 : 3);
        waveOpen = true; waveSpawned = 0; waveTotal = burstCap + (burstIndex >= 4 && burstIndex % 4 === 0 ? 2 : 0); if (window.SS) window.SS.waveTotal = waveTotal;
        if (burstIndex >= 4 && burstIndex % 4 === 0) startTruck();
        burstSpawned = 0; roofWave = Math.random() < 0.5;
        phaseT = 8 + Math.random() * 6;
        spawnCd = 0.25;
      }
    } else if (phaseT <= 0 || (alive === 0 && phaseT < 6)) {
      phase = 'quiet';
      if (window.SS) window.SS.bursting = false;
      quietCap = 0; // waves only: no stragglers between waves
      // Breather: ~10–16 s at 3 m/s ≈ 30–48 m; floor 9 s so early game always gets a walk
      phaseT = Math.max(9, 10 + Math.random() * 6 - diff * 1);
      spawnCd = 0.8;
    }

    const cap = phase === 'quiet' ? quietCap : burstCap;
    spawnCd -= dt;
    // Fixed wave: the whole wave (burstCap) spawns at burst start in one go; no reinforcements ever, no spawns once engaged.
    const canSpawn = (phase === 'burst' ? (burstSpawned < burstCap && !waveActive) : alive < cap) && (firstKill || runSpawns < 2) && phase === 'burst' && waveSpawned < burstCap; // hard cap: a wave never spawns more than its size (truck adds its own 2 once)
    if (window.SS && window.SS.running && !CALM && canSpawn && dNow >= breatherTo) for (let tries = 0; tries < 6 && (phase === 'burst' ? burstSpawned < burstCap : tries < 1) && (phase === 'burst' || spawnCd <= 0); tries++) {
      const flankSlot = phase === 'burst' && burstSpawned === burstCap - 1 && (burstCap === 3 || Math.random() < 0.5);
      const roofSlot = phase === 'burst' && burstSpawned === 1 && burstIndex >= 2 && roofWave;
      const made = spawnOne(flankSlot ? 'flanker' : roofSlot ? 'roof' : (phase === 'burst' && burstSpawned === 0 ? 'shifter' : undefined)) || ((flankSlot || roofSlot) ? spawnOne() : null);
      if (made && roofSlot && made.anchor && made.anchor.type === 'roof') { squadCall('Rooftop!'); if (window.SS) window.SS.roofShooters = (window.SS.roofShooters | 0) + 1; }
      if (made) { runSpawns++; waveSpawned++; if (window.SS && !window.SS.firstWave && burstIndex === 1) window.SS.firstWave = { d: +dNow.toFixed(1) }; }
      if (made && phase === 'burst') burstSpawned++;
      if (made && (window.SS.engaged > 0 || waveActive) && !made.fromTruck) window.SS.spawnsWhileEngaged = (window.SS.spawnsWhileEngaged | 0) + 1; // must stay 0 (no reinforcements)
      spawnCd = made ? 2.2 : 0.6;
    }

    const running = !!(window.SS && window.SS.running);
    if (running) runT += dt;
    const prog = window.SS ? window.SS.distance : 0;
    if (running && prog > lastProg + 0.05) { lastProg = prog; noProgT = 0; stallT = 0; standT = Math.max(0, standT - 2 * dt); }
    else if (running) { standT += dt; stallT += dt; noProgT += dt; }
    pressure = Math.min(1, standT / PRESSURE_RAMP + Math.min(0.3, runT / RUN_RAMP));
    if (graceT > 0) graceT -= dt;
    if (stallT > STALL_LIMIT) {
      // Failsafe: drop enemies hiding out of reach, pull the rest into the street, resume walking.
      for (let i = list.length - 1; i >= 0; i--) {
        const e = list[i];
        if (!e.alive) continue;
        if (!e.seen) toVisibleCover(e); // Zack's rule: waves clear only on kills; stuck enemies are brought into view, never removed
      }
      stallT = 0;
    }
    // Line-of-sight watchdog (4x/s): an enemy counts only if exposed and not blocked by geometry.
    // watchdog runs on real time, so slow frames (dt is capped at 50 ms) can't stretch the 5 s limits
    const nowR = performance.now() / 1000; const rdt = Math.min(1, nowR - (lastReal || nowR)); lastReal = nowR;
    if (running && !(prog > lastProg - 0.05 && noProgT === 0)) noProgT += rdt - dt;
    losT -= rdt;
    if (losT <= 0) {
      const step = 0.25 - losT; losT = 0.25; anySeen = false;
      for (let i = list.length - 1; i >= 0; i--) {
        const e = list[i]; if (!e.alive) continue;
        e.group.getWorldPosition(_ep); _ep.y += 1.3; _ed.copy(_ep).sub(camera.position); const d = _ed.length(); _ed.divideScalar(d);
        losRay.set(camera.position, _ed); losRay.far = d - 0.6;
        // seen = exposed, clear line, and not lost in the haze (m1p: a fogged-out roof shooter counted as seen and held the wave)
        e.seen = e.exposed && !(scene.fog && scene.fog.density && d > 1.05 / scene.fog.density) && losRay.intersectObjects(world.shotList ? world.shotList() : world.colliders, false).length === 0;
        e.unseenT = e.seen ? 0 : (e.unseenT || 0) + step;
        if (e.seen && d < HOLD_RANGE) { anySeen = true; e.engaged = true; }
        e.hiddenT = playerSees(e) ? 0 : (e.hiddenT || 0) + step;
        { const jumped = e._seenP && e._seenP.distanceToSquared(e.group.position) > 6.25; (e._seenP || (e._seenP = new THREE.Vector3())).copy(e.group.position);
          if (jumped || e.phase === 'relocate') e.movedR = nowR; if (e.hiddenT === 0 && !jumped && e.phase !== 'relocate') { if (!e.seenSinceR) { e.seenSinceR = nowR; e.seenSinceSim = window.SS ? (window.SS.simTime || 0) : 0; } } else e.seenSinceR = 0; } // continuous visibility clock
        if (e.hiddenT > 10 && e.engaged && !e.pinned && !e.dying && aliveCount() === 1 && truckPending === 0) toSeenSpot(e); // last fighter out of sight 10 s
        else if (e.unseenT > UNSEEN_LIMIT && e.engaged && !e.pinned) toVisibleCover(e); // hidden/stuck engaged enemy -> visible cover near the player
      }
    }

    const tempo = 1 + PRESSURE_TEMPO * pressure;
    const pz = camera.position.z;
    let hold = false, engagedN = 0;
    if (LOCO2) notePlayerRound();
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (!e.alive) {
        list.splice(i, 1);
        continue;
      }
      if (!(e.group.position.z > pz - 0.5)) e.behindT = 0;
      { const dP = e.group.position.distanceTo(camera.position); // lone far last fighter -> advances (8 s beyond 35 m)
        if (e.engaged && !e.pinned && !e.dying && dP > 35 && e.phase !== 'relocate' && e.group.position.y < 0.05 && !(e.anchor && isElevated(e.anchor.type)) && aliveCount() === 1 && truckPending === 0) { e.farT = (e.farT || 0) + dt;
          if (e.farT > 8) { e.farT = 0; advanceNearer(e); } } else e.farT = 0; } // ground fighters only: they run up (no vertical pop)
      if (REPOS) { // fighters holding one ground cover move (sim time). Off: this block never runs.
        // p1b: the hold clock reset on every anchor change (short shuffles, toSeenSpot) and on any phase outside
        // takeCover/hide/peek/fire, and a failed pick waited a whole new 20-25 s. Now it follows the AREA held (resets
        // only after a move of > 5 m), a failed pick retries in 3-5 s, and the last fighter's 20-25 s clock is separate
        // from the 15-30 s clock that moves the others, one at a time.
        const simS = window.SS ? (window.SS.simTime || 0) : 0;
        const last1 = aliveCount() === 1 && truckPending === 0;
        const ground = e.alive && !e.dying && !e.pinned && e.anchor && e.anchor.pos && !isElevated(e.anchor.type) && e.behavior !== 'flanker';
        const holding = ['takeCover', 'hide', 'peek', 'fire'].includes(e.phase) || (e.phase === 'relocate' && !e._repositioning && e._holdPos);
        if (ground && holding) {
          const ap = e.anchor.pos;
          const ovr = last1 ? window.SS_REPOS_S : window.SS_RELOC_S;
          const timer = () => (typeof ovr === 'number' ? ovr : last1 ? 20 + Math.random() * 5 : 15 + Math.random() * 15);
          if (!e._holdPos || (e.phase !== 'relocate' && e._holdPos.distanceToSquared(ap) > 25)) {
            (e._holdPos || (e._holdPos = new THREE.Vector3())).copy(ap); e.coverHoldT = 0; e._reposAt = timer(); e._reposLast = last1;
          } else e.coverHoldT += dt * ((e.suppressT || 0) > 0 ? 1.6 : 1); // pinned down by fire: moves sooner
          if (last1 && !e._reposLast) { e._reposLast = true; e._reposAt = Math.min(e._reposAt, timer()); } // just became the last one
          const gap = simS - (e._lastReposS != null ? e._lastReposS : -1e9) >= 15;
          const token = last1 || (simS - squadReposS >= 8 && !list.some((x) => x !== e && x.alive && x._repositioning));
          e._reposWhy = e.coverHoldT < e._reposAt ? 'holding' : !gap ? 'cooldown' : !token ? 'waiting-turn' : 'due';
          if (e._reposWhy === 'due') {
            const spot = pickRepositionCover(e);
            if (spot) { startReposition(e, spot); squadReposS = simS; e._reposWhy = 'moved'; }
            else {
              const back = pickFallbackCover(e);
              if (back) { startReposition(e, back); e.fellBack = (e.fellBack | 0) + 1; squadReposS = simS; e._reposWhy = 'fell-back'; }
              else { e.coverHoldT = Math.max(0, e._reposAt - (3 + Math.random() * 2)); e.reposFails = (e.reposFails | 0) + 1; e._reposWhy = 'no-cover'; }
            }
          }
        } else if (!ground || e.phase === 'approach' || e.phase === 'climb') { e.coverHoldT = 0; e._holdPos = null; e._reposWhy = ground ? 'travelling' : 'not-ground'; }
      }
      if (e.pinned) { if (e.debugVel) { e.group.position.addScaledVector(e.debugVel, dt); e.moving = true; e.moveKind = 'run'; e.moveSpeed = e.debugVel.length(); } }
      // Tester m1r / waves (Ultra-low): a fighter that flanked behind the player and stays out of view kept ENEMIES at 1 and the
      // walk halted for good. Engaged fighters behind the player (and off-screen) for 6 s are brought to visible cover ahead.
      else if (e.engaged && !e.dying && Math.abs(e.group.position.y) < 0.05 && !(e.anchor && isElevated(e.anchor.type)) && e.group.position.z > pz - 0.5 && !inView(e) && ((e.behindT = (e.behindT || 0) + dt) > 6)) { e.behindT = 0; toVisibleCover(e); }
      else if (e.group.position.z > pz + 40 && e.engaged && !(e.anchor && isElevated(e.anchor.type))) toVisibleCover(e); // engaged enemies behind stay put (360 deg aim); only far-behind ones are brought back
      // Despawn only unengaged fighters left behind, or anything very far behind (tester: an engaged fighter ~12 m to the
      // side, slightly behind, vanished - every enemy 6-40 m behind was despawned, engaged or not).
      else if ((e.group.position.z > pz + 6 && !e.engaged) || e.group.position.z > pz + 60) {
        e.alive = false;
        unregister(e);
        root.remove(e.group);
        list.splice(i, 1);
        continue;
      }
      if (HITS2) tickWounds(e, dt);
      if (e.art) stepArt(e, dt);
      else if (LOCO2) tickCover(e, dt);
      if (LOCO2) parkCoverStep(e);
      try { updateEnemy(e, dt * tempo, diff); }
      catch (err) { reportErr('enemy update', err); despawn(e); list.splice(i, 1); continue; } // a broken enemy is removed, never freezes the fight
      // Ground snap + gravity for street fighters (no floating, no hops): y eases down at up to 6 m/s, never below 0.
      if (!(e.anchor && isElevated(e.anchor.type)) && !e.pinned) { const gp = e.group.position; if (gp.y > 0) gp.y = Math.max(0, gp.y - 6 * dt); else gp.y = 0; }
      if (e.art) { if (LOCO2) applyCoverStep(e); try { footIK(e, dt); } catch (err) { e.legs = []; reportErr('foot ik', err); } syncArt(e); } // IK after the body moved this frame; cover step before IK so the plant matches the peek
      if (e.marker) e.marker.visible = !(window.SS && window.SS.input && window.SS.input.scope) && Math.abs(e.group.position.z - pz) > 7;
      const dx = e.group.position.x - camera.position.x;
      const dy = e.group.position.y - camera.position.y;
      const dz = e.group.position.z - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (waveActive && e.alive && !e.engaged && !e.dying) e.engaged = true; // the whole wave is in the fight once it starts
      if (e.engaged) { hold = true; engagedN += 1; } // halt until ALL engaged enemies are dead (hidden ones still despawn after 5 s)
    }

    // Fix 1: enemy-to-enemy separation (crouched fighters sharing a cover clipped into each other). Ground enemies closer
    // than 0.85 m are eased apart (<= 1.5 m/s, no pops), sideways along the cover line, never into a facade.
    for (let i = 0; i < list.length; i++) { const a = list[i]; if (!a.alive || a.dying || a.pinned || (a.anchor && isElevated(a.anchor.type))) continue;
      for (let j = i + 1; j < list.length; j++) { const b = list[j]; if (!b.alive || b.dying || b.pinned || (b.anchor && isElevated(b.anchor.type))) continue;
        const pa = a.group.position, pb = b.group.position; let dx = pb.x - pa.x, dz = pb.z - pa.z; const d = Math.hypot(dx, dz);
        if (d >= 0.85) continue; if (d < 1e-3) { dx = (i & 1) ? 1 : -1; dz = 0; } else { dx /= d; dz /= d; }
        const push = Math.min((0.85 - d) * 0.5, 1.5 * dt); const la = Math.max(STREET_X, Math.abs(pa.x)), lb = Math.max(STREET_X, Math.abs(pb.x));
        pa.x -= dx * push; pa.z -= dz * push; pb.x += dx * push; pb.z += dz * push;
        if (Math.abs(pa.x) > la) pa.x = Math.sign(pa.x) * la; if (Math.abs(pb.x) > lb) pb.x = Math.sign(pb.x) * lb; } }
    // Prop clipping (tester: a fighter inside a market cart): street fighters are pushed out of nearby prop boxes
    // (named 'prop' colliders: carts, crates, cars, drums), along the shallowest axis, plus a 0.3 m body radius.
    { const cols = world.colliders || [];
      for (let i = 0; i < list.length; i++) { const e = list[i]; if (!e.alive || e.dying || e.pinned || (e.anchor && isElevated(e.anchor.type))) continue; const gp = e.group.position;
        for (let k = 0; k < cols.length; k++) { const m = cols[k]; if (m.name !== 'prop') continue; const pp = m.position; if (Math.abs(pp.x - gp.x) > 3 || Math.abs(pp.z - gp.z) > 3) continue;
          const hx = Math.abs(m.scale.x) * 0.5 + 0.3, hz = Math.abs(m.scale.z) * 0.5 + 0.3, dx = gp.x - pp.x, dz = gp.z - pp.z;
          if (Math.abs(dx) >= hx || Math.abs(dz) >= hz) continue; const ox = hx - Math.abs(dx), oz = hz - Math.abs(dz);
          if (ox < oz) gp.x += Math.sign(dx || 1) * Math.min(ox, 3 * dt + 0.02); else gp.z += Math.sign(dz || 1) * Math.min(oz, 3 * dt + 0.02); } } }
    if (window.SS) { let mn = 99; for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i], b = list[j]; if (!a.alive || !b.alive) continue; const pa = a.group.position, pb = b.group.position; if (Math.abs(pa.y - pb.y) > 1) continue; mn = Math.min(mn, Math.hypot(pa.x - pb.x, pa.z - pb.z)); } window.SS.minEnemyGap = mn; }

    if (hold) waveActive = true;
    if (waveActive && aliveCount() === 0 && truckPending === 0) waveActive = false; // clear only when every wave member (incl. truck) is dead
    if (waveActive) hold = true;
    if (running) window.SS.walking = !hold; // halt from first engage until the last engaged enemy is KILLED
    // Stable ENEMIES counter: rises only when newly engaged appear, falls on engaged deaths (no silent mid-fight bumps from unengaged spawns).
    displayEngaged = aliveCount() + truckPending; // total remaining in the wave (incl. truck still driving in)
    if (!hold) displayEngaged = 0;
    // Tester m1r: a wave is cleared once its fixed total has spawned and every member is dead, whether or not the
    // squad halted for it (fighters dropped before engaging used to leave the wave 'uncleared': no cue, no count).
    const waveDone = (waveOpen && waveSpawned >= burstCap && aliveCount() === 0 && truckPending === 0 && !hold) || (prevHold && !hold);
    if (waveDone) waveOpen = false;
    if (running && waveDone && window.SS.hud && window.SS.hud.banner) {
      waveClears += 1; window.SS.waveClears = waveClears; window.SS.hud.banner('WAVE CLEARED'); if (window.SS.hud.hint) window.SS.hud.hint('Wave cleared \u2013 advancing'); try { squadCall('Clear! Moving up.'); } catch (_) {} // tester m1q: clear cue when the walk resumes
      breatherTo = window.SS.distance + 10 + Math.random() * 5; phase = 'quiet'; phaseT = 0; // tester: short 10-15 m breather window.SS.bursting = false;
    }
    prevHold = hold;
    if (window.SS && window.SS.hud && window.SS.hud.setNext) window.SS.hud.setNext(running && !hold && waveClears > 0 ? breatherTo - window.SS.distance : 0);
    if (window.SS) { window.SS.engaged = engagedN; if (window.SS.hud && window.SS.hud.setRemaining) window.SS.hud.setRemaining(running && hold ? displayEngaged : 0); }
    if (window.SS) { window.SS.pressure = { pressure, standT, stallT, graceT }; window.SS.breatherTo = breatherTo; }

    for (let i = 0; i < flashes.length; i++) {
      const f = flashes[i];
      if (f.life <= 0) continue;
      f.life -= dt;
      if (f.life <= 0) f.sprite.visible = false;
    }
    for (let i = 0; i < tracers.length; i++) {
      const t = tracers[i];
      if (t.life <= 0) continue;
      { const nowR = performance.now(), fN = (window.SS && window.SS.frameN) | 0, left = Math.max(0, (t.untilR || 0) - nowR);
        t.line.material.opacity = 0.35 + 0.55 * Math.min(1, left / 120);
        if (left <= 0 && fN >= (t.frame0 | 0) + 2) { t.life = 0; t.line.visible = false; } }
    }
    for (let i = 0; i < blood.length; i++) {
      const b = blood[i];
      if (b.life <= 0) continue;
      b.life -= dt;
      b.vel.y -= 9 * dt;
      b.sprite.position.addScaledVector(b.vel, dt);
      if (b.sprite.position.y < 0.05) {
        b.sprite.position.y = 0.05;
        b.vel.y *= -0.2;
        b.vel.x *= 0.6;
        b.vel.z *= 0.6;
      }
      b.sprite.material.opacity = Math.max(0, b.life * 2);
      if (b.life <= 0) b.sprite.visible = false;
    }
    // Kill pools fade out after ~8 s, so a later enemy standing on an old spot doesn't look bloodied without a hit (fix 3).
    { const now = performance.now(); for (let i = 0; i < decals.length; i++) { const m = decals[i]; if (!m.visible) continue; const age = (now - (m.userData.t0 || now)) / 1000;
      if (age > 8) m.visible = false; else if (age > 6) m.material.opacity = 0.82 * (8 - age) / 2; } }
    if (decals.length > 12) {
      const old = decals.shift();
      scene.remove(old);
      old.geometry.dispose();
    }

    stepFallers(dt);
    try { ragdolls.update(dt, pz); } catch (err) { reportErr('ragdoll update', err); } // never wipe every corpse on one error
  }

  function despawn(enemy) {
    if (enemy.alive) unregister(enemy);
    enemy.alive = false;
    enemy.group.visible = false;
    root.remove(enemy.group);
  }

  function reset() {
    if (truck) { scene.remove(truck.g); truck = null; } truckPending = 0;
    for (const n of nades) { scene.remove(n.m); if (n.ring) scene.remove(n.ring); } nades.length = 0; nadeThisWave = false; campT = 0;
    for (let i = list.length - 1; i >= 0; i--) despawn(list[i]);
    list.length = 0;
    while (fallers.length) { const f = fallers.pop(); if (f.group.parent) f.group.parent.remove(f.group); }
    if (ragdolls.clear) ragdolls.clear();
    for (let i = 0; i < decals.length; i++) decals[i].visible = false;
    for (let i = 0; i < blood.length; i++) {
      blood[i].life = 0;
      blood[i].sprite.visible = false;
    }
    phase = 'quiet';
    phaseT = 0;
    breatherTo = FIRST_WAVE_AT; // first wave at the same distance every run (tester: 6/8/12 m)
    quietCap = 0;
    burstCap = 3; burstSpawned = 0; waveActive = false; runSpawns = 0; firstKill = false;
    spawnCd = 1.2;
    stallT = standT = graceT = runT = pressure = 0; lastProg = 0; noProgT = 0; anySeen = false;
    prevHold = false; displayEngaged = 0; contactHintShown = false; burstIndex = 0; quietRunT = 0; quietRealAt = 0; radioWarned = false; if (window.SS) { window.SS.approach = 0; window.SS.radioWarnAt = 0; }
    squadReposS = -1e9; if (window.SS) { window.SS.reposLast = 0; window.SS.reposSquad = 0; }
    waveClears = 0; dryKills = 0; lastDropT = performance.now(); lastPlayerHitS = 0; lastPlayerHitSim = -99; dmgBucket = DMG_CAP_BURST; dmgBucketR = 0; losT = 0; roofWave = false; waveSpawned = 0; waveTotal = 0; waveOpen = false; regenWaitT = 0;
    if (window.SS) { window.SS.waveClears = 0; window.SS.engaged = 0; window.SS.spawnsWhileEngaged = 0; window.SS.trucks = 0; window.SS.firstWave = null; }
    if (window.SS) window.SS.bursting = false;
    if (HITS2 && hitZones) {
      hitZones.armL = hitZones.armR = hitZones.legL = hitZones.legR = hitZones.torso = 0;
      try { if (window.SS) window.SS.hitZones = hitZones; } catch (_) {}
    }
  }

  function killAll() {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].alive) kill(list[i], null, 'body');
    }
  }

  api.update = update;
  api.reset = reset;
  // Shader prewarm set: one object per material family enemies use (marker sprite, blood, rim, body, decal).
  api.prewarmSet = function prewarmSet() { const g = new THREE.Group(); const box = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    g.add(new THREE.Sprite(markerMat), new THREE.Sprite(bloodMat), new THREE.Mesh(box, matRim), new THREE.Mesh(box, visMat(0x777777)), new THREE.Mesh(box, visMat(0x777777, { transparent: true, opacity: 0.5 })),
      new THREE.Mesh(new THREE.CircleGeometry(0.1, 6), new THREE.MeshBasicMaterial({ color: 0x4a0808, transparent: true, opacity: 0.82, depthWrite: false })));
    return g; };
  api.debugTruck = () => startTruck();
  api.debugGrenade = () => { const th = list.find((e) => e.alive); if (th) throwGrenade(th); return !!th; };
  api.debugRoof = () => spawnOne('roof');
  api.tracerState = () => tracers.map((t) => ({ vis: !!t.line.visible, life: t.life, a: t.line.geometry.attributes.position.array.slice(0, 6) })); // tests (m1w)
  api.debugShoot = (e) => enemyShoot(e); // tests: one real enemy shot (all gates apply)
  api.debugClearSpacing = () => { lastPlayerHitS = 0; lastPlayerHitSim = -99; dmgBucket = DMG_CAP_BURST; dmgBucketR = 0; }; api.DMG_CAP_HPS = DMG_CAP_HPS; // tests (fast-parity): back-to-back sample shots
  api.spawnEnemy = function spawnEnemy(behavior) {
    return spawnOne(behavior || undefined);
  };
  api.killAll = killAll;

  return api;
}
