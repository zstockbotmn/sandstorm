const CALM = typeof location !== 'undefined' && /[?&]calm=1/.test(location.search); // tests: no auto spawns
import * as THREE from 'three';
import { art, SPLIT_ANIMS } from './art.js';
import { createRagdollSystem } from './ragdoll.js';

const BODY_DMG = 55;
const HEAD_DMG = 100;
const MAX_HEALTH = 100;

const _look = new THREE.Vector3();
const _muzzle = new THREE.Vector3();
const _aim = new THREE.Vector3();
const _fwd = new THREE.Vector3();
const _wA = new THREE.Vector3();
const _wB = new THREE.Vector3();

const ENEMY_SCALE = 1.2; // ~20% larger; adult silhouette ~1.85–2.1 m

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
  const api = { list, update };
  // Test hook: pin an enemy at (x, z) facing the camera in a posture, AI frozen (stagger), for hit-registration tests.
  api.debugPose = (e, x, z, posture) => { e.pinned = true; e.group.position.set(x, 0, z); e.staggerT = 1e9; e.moving = false; e.exposed = true; e.posture = posture || 'idle'; e.phase = 'peek'; e.turned = false;
    turnTo(e, camera.position.x, camera.position.z, 100); e.shootCd = 1e9; return e; };

  let phase = 'quiet';
  let phaseT = 0;
  let quietCap = 0, waveOpen = false; // never stragglers (a quiet-phase spawn made the first wave 1 or 3)
  const FIRST_WAVE_AT = 6;
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
  const _hlD = new THREE.Vector3(), _hlF = new THREE.Vector3(), _hlR = new THREE.Vector3();
  function headLook(enemy, dt) {
    const h = enemy.bones && enemy.bones.Head; if (!h || !h.parent) return;
    enemy.group.updateMatrixWorld(true);
    h.getWorldPosition(_hlD); _hlD.subVectors(camera.position, _hlD);
    _hlF.set(0, 0, 1).applyQuaternion(enemy.group.quaternion); _hlR.set(1, 0, 0).applyQuaternion(enemy.group.quaternion);
    const yaw = Math.atan2(_hlD.dot(_hlR), _hlD.dot(_hlF)), pitch = Math.atan2(_hlD.y, Math.hypot(_hlD.x, _hlD.z));
    const ty = Math.max(-0.96, Math.min(0.96, yaw)), tp = Math.max(-0.44, Math.min(0.44, pitch));
    const k = Math.min(1, dt * 5); enemy.lookY = (enemy.lookY || 0) + (ty - (enemy.lookY || 0)) * k; enemy.lookP = (enemy.lookP || 0) + (tp - (enemy.lookP || 0)) * k;
    bendBone(h, _up, enemy.lookY); bendBone(h, _hlR, -enemy.lookP);
  }
  function proceduralLean(enemy, name, dt) {
    const b = enemy.bones; if (!b || enemy.dying || window.SS_NOPROC) { enemy.leanW = 0; return; }
    headLook(enemy, dt);
    const tgtRoll = name === 'lean' ? 1 : 0;
    const tgtHunch = (name === 'aim' || name === 'lean') ? 1 : 0;
    const k = Math.min(1, dt * 6);
    enemy.leanW = (enemy.leanW || 0) + (tgtRoll - (enemy.leanW || 0)) * k;
    enemy.hunchW = (enemy.hunchW || 0) + (tgtHunch - (enemy.hunchW || 0)) * k;
    if (enemy.leanW < 0.01 && enemy.hunchW < 0.01) return;
    const g = enemy.group;
    _fwdW.set(0, 0, 1).applyQuaternion(g.quaternion);
    _rightW.set(1, 0, 0).applyQuaternion(g.quaternion);
    // Lean toward the street centre (x = 0) from whichever side the fighter is on.
    const side = g.position.x > 0 ? 1 : -1;
    const roll = 0.32 * enemy.leanW * side * (_rightW.x >= 0 ? 1 : -1);
    const hunch = 0.12 * enemy.hunchW;
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
    _saF.set(0, 0, 1).applyQuaternion(enemy.group.quaternion); _saF.y = 0; _saF.normalize(); _saR.set(0, 1, 0).cross(_saF).negate(); // fighter's right
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
    // pelvis drop runs at every range/tier (cheap); the two-bone solve + locking only on High within 30 m
    if (art.tier !== 'high' || camera.position.distanceToSquared(enemy.group.position) > 900) { enemy.legs.forEach((l) => { l.lock = null; }); return; }
    const ground = enemy.group.position.y + enemy.ankleH, out = enemy.ikDbg || (enemy.ikDbg = []);
    for (let i = 0; i < enemy.legs.length; i++) {
      const L = enemy.legs[i]; L.foot.getWorldPosition(_ikF);
      const down = _ikF.y < ground + 0.05;
      const was = L.lock;
      if (down && enemy.moving) { if (!L.lock) L.lock = _ikF.clone().setY(ground); }
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
  function stepArt(enemy, dt) {
    _turnDt = dt;
    const name = desiredAnim(enemy);
    enemy.animState = name;
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
    // Rest-pose reset before the mixer: some clips (Combat_Stance has no Spine track) leave bones untouched, so the
    // procedural hunch/lean bends and the previous clip's values piled up on them every frame - the "bent, rifle over
    // the head" idle/aim pose. Bones the clip animates are overwritten by the mixer right after.
    if (!enemy.restQ) enemy.restQ = enemy.art.restQ; if (!enemy.restQ) { enemy.restQ = []; enemy.art.root.traverse((o) => { if (o.isBone) enemy.restQ.push(o, o.quaternion.clone()); }); }
    for (let i = 0; i < enemy.restQ.length; i += 2) enemy.restQ[i].quaternion.copy(enemy.restQ[i + 1]);
    enemy.mixer.update(dt);
    proceduralLean(enemy, name, dt);
    try { supportArm(enemy, name, dt); } catch (err) { reportErr('support arm', err); }
    if (enemy.hitPlaying && !enemy.actions.hit.enabled) {
      enemy.hitPlaying = false;
      enemy.hitReturning = false;
    }
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
      headB.getWorldPosition(_wA);
      _wA.y += 0.1;
      group.worldToLocal(_wA);
      enemy.parts.head.position.copy(_wA);
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
      t.scale.set(0.9, Math.max(0.4, (len + 0.18) / (0.76 * S)), 0.9);
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
    const LIMBS = [['LeftUpLeg', 'LeftLeg', 0.17], ['LeftLeg', 'LeftFoot', 0.14], ['RightUpLeg', 'RightLeg', 0.17], ['RightLeg', 'RightFoot', 0.14],
      ['LeftArm', 'LeftForeArm', 0.12], ['LeftForeArm', 'LeftHand', 0.1], ['RightArm', 'RightForeArm', 0.12], ['RightForeArm', 'RightHand', 0.1]];
    for (const [a, b, w] of LIMBS) {
      const ba = inst.root.getObjectByName(a), bb = inst.root.getObjectByName(b); if (!ba || !bb) continue;
      const m = new THREE.Mesh(hitBoxGeo, ghostMat); m.castShadow = m.receiveShadow = false; m.userData.w = w; group.add(m);
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
    };

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
    turnTo(enemy, camera.position.x, camera.position.z, 6);
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
    if (aliveCount() === 0) { SSx.slowmoUntil = performance.now() + 750; if (SSx.hud && SSx.hud.banner) setTimeout(() => {}, 0); }
  }

  function hitEnemy(enemy, part, point) {
    if (!enemy.alive) return;
    const dmg = part === 'head' ? HEAD_DMG : BODY_DMG;
    enemy.health -= dmg;
    // Fix 3: blood, damage and the hit marker all come from this one registered hit (spray is emitted with the marker below
    // or with the kill marker in kill()); nothing else spawns blood on a live enemy.
    if (enemy.health <= 0) kill(enemy, point, part);
    else {
      if (enemy.art) playHit(enemy, part === 'head');
      // Bigger hit reaction: shove back ~0.3 m from the shooter (ground enemies) + a brief exposed stagger.
      // Never shove into a building: a fighter pushed inside a wall collider became unhittable (false misses).
      if (enemy.group.position.y < 0.5 && !enemy.pinned) { const gp = enemy.group.position, x0 = gp.x; _aim.copy(gp).sub(camera.position).setY(0).normalize(); gp.addScaledVector(_aim, 0.3);
        const lim = Math.max(5.6, Math.abs(x0)); if (Math.abs(gp.x) > lim) gp.x = Math.sign(gp.x) * lim; }
      if (!enemy.pinned) enemy.staggerT = 0.45; enemy.shootCd = Math.max(enemy.shootCd || 0, 0.6);
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

  function muzzleFlash(pos) {
    let slot = flashes[0];
    for (let i = 0; i < flashes.length; i++) {
      if (flashes[i].life <= 0) { slot = flashes[i]; break; }
    }
    slot.life = 0.05;
    slot.sprite.visible = true;
    slot.sprite.position.copy(pos);
  }

  function tracer(a, b) {
    let slot = tracers[0];
    for (let i = 0; i < tracers.length; i++) {
      if (tracers[i].life <= 0) { slot = tracers[i]; break; }
    }
    slot.life = 0.07;
    const attr = slot.line.geometry.attributes.position;
    attr.setXYZ(0, a.x, a.y, a.z);
    attr.setXYZ(1, b.x, b.y, b.z);
    attr.needsUpdate = true;
    slot.line.geometry.computeBoundingSphere();
    slot.line.visible = true;
    slot.line.material.opacity = 0.9;
  }

  let lastPlayerHitS = 0;
  function enemyShoot(enemy) {
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
    // Grace ramp (tester: nearly dead after one burst): the first ~60 s of a run land fewer hits, and any two hits on the
    // player are spaced >= 0.9 s early (0.4 s later) so one burst can't chain 3-4 hits. Damage per hit unchanged (~5 to die).
    const runT = window.SS && window.SS.startedAt ? (performance.now() - window.SS.startedAt) / 1000 : 999;
    const grace = Math.min(1, runT / 60);
    chance *= 0.45 + 0.55 * grace;
    chance = Math.max(0.02, Math.min(0.85, chance));
    const gap = 0.9 - 0.5 * grace, nowS = performance.now() / 1000;
    let hit = Math.random() < chance && player && player.alive && nowS - (lastPlayerHitS || 0) >= gap;
    if (hit) lastPlayerHitS = nowS;
    _aim.copy(camera.position);
    if (!hit) {
      _aim.x += (Math.random() - 0.5) * 2.4;
      _aim.y += (Math.random() - 0.5) * 1.2;
      _aim.z += (Math.random() - 0.5) * 2.4;
    }
    muzzleFlash(_muzzle);
    tracer(_muzzle, _aim);
    if (window.SS && window.SS.audio) window.SS.audio.enemyShot(_muzzle);
    enemy.rounds = (enemy.rounds || 0) + 1;
    if (enemy.rounds >= 6) {
      enemy.rounds = 0;
    }
    if (hit) {
      const amount = Math.max(18, Math.min(22, 20 + (diff - 0.5) * 4));
      player.damage(window.SS && window.SS.input && window.SS.input.cover ? amount * 0.6 : amount, _muzzle); // cover also softens hits
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
  function coverPool(types) {
    const out = [];
    const segs = world.segments || [];
    const pz = camera.position.z;
    for (let s = 0; s < segs.length; s++) {
      const pts = segs[s].coverPoints || [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const ahead = pz - p.pos.z;
        if (ahead < poolRange[0] || ahead > poolRange[1]) continue;
        if (types && types.indexOf(p.type) < 0) continue;
        out.push(p);
      }
    }
    return out;
  }

  function occupiedBy(pos, self) {
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e.alive || e === self) continue;
      const h = e.home;
      if ((h.x - pos.x) ** 2 + (h.z - pos.z) ** 2 < 2.2) return true;
    }
    return false;
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
  function toVisibleCover(e) {
    const aheadE = camera.position.z - e.group.position.z, dE = e.group.position.distanceTo(camera.position);
    // (m1p stall) a roof/window shooter stays up only while it is ahead and close enough to see through the haze
    if (e.anchor && isElevated(e.anchor.type) && aheadE > 4 && dE < 30) { e.unseenT = 0; e.seen = true; e.engaged = true; beginFire(e); return; } // never teleport a roof/window shooter to the street
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
    if (best) { e.anchor = best; e.home = standPos(best); }
    else { const side = Math.sign(e.group.position.x) || 1; e.anchor = { type: 'door', pos: new THREE.Vector3(side * 5.4, 1.2, pz - 18) }; e.home = standPos(e.anchor); }
    e.group.position.copy(firePoint(e)); e.group.position.y = 0; e.path = null; e.pathI = 0;
    beginFire(e);
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

  function hidePoint(enemy) {
    if (isElevated(enemy.anchor.type)) return sillTuck(enemy.home, enemy.anchor);
    return tuckOf(enemy.home, enemy.anchor);
  }

  function startPeek(enemy) {
    enemy.phase = 'peek';
    enemy.posture = 'lean';
    enemy.path = [firePoint(enemy)];
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
      if (d < bestD) { bestD = d; best = p; }
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
    enemy.exposed = false;
    enemy.moveKind = 'run';
    enemy.goal = enemy.path[0];
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
    enemy.moving = true;
    // Human locomotion: accelerate ~7 m/s², brake into the last metre, no instant starts/stops (no sliding).
    const prevV = enemy.curSpeed || 0;
    const brake = Math.sqrt(2 * 6 * Math.max(0, dist - 0.05)) + 0.3;
    const want = Math.min(speed, brake);
    enemy.curSpeed = want > prevV ? Math.min(want, prevV + 7 * dt) : Math.max(want, prevV - 9 * dt);
    const step = Math.min(dist, enemy.curSpeed * dt);
    const dy = _fwd.y; _fwd.y = 0; const hd = Math.max(1e-4, horiz);
    p.addScaledVector(_fwd.multiplyScalar(1 / hd), Math.min(hd, step));
    p.y += Math.sign(dy) * Math.min(Math.abs(dy), 0.45 * dt); // vertical drift ≤0.45 m/s (stairs-free scene: no hops)
    if (p.y < 0) p.y = 0;
    if (horiz > 0.12) turnTo(enemy, dest.x, dest.z, 9);
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
    enemy.phase = 'fire';
    enemy.phaseT = 0.5 + Math.random() * 0.65;
    enemy.posture = 'lean';
    enemy.moving = false;
    enemy.exposed = true;
    enemy.shootCd = Math.min(enemy.shootCd, (enemy.shotsTaken | 0) < 1 ? 0.45 + Math.random() * 0.3 : 0.12 + Math.random() * 0.1); // first contact: a beat before the first shot
  }

  function tickFire(enemy, dt, diff) {
    enemy.moving = false;
    enemy.posture = 'lean';
    enemy.exposed = true;
    facePlayer(enemy);
    enemy.phaseT -= dt;
    if ((enemy.suppressT || 0) > 0) enemy.suppressT = Math.max(0, enemy.suppressT - dt);
    if (player.alive && window.SS.running) {
      const slow = (enemy.suppressT || 0) > 0 ? 0.55 : 1;
      enemy.shootCd -= dt * slow;
      if (enemy.shootCd <= 0) {
        enemyShoot(enemy);
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
      if (phase !== 'peek') enemy.exposed = false;
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
    if (enemy.staggerT > 0) { enemy.staggerT -= dt; return; } // hit stagger: frozen, exposed
    if (enemy.behavior === 'flanker') updateFlanker(enemy, dt, diff);
    else updateCover(enemy, dt, diff);
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
    updateGrenades(dt); updateTruck(dt);
    const diff = difficulty();
    phaseT -= dt;
    const alive = aliveCount();
    const dNow = window.SS ? window.SS.distance : 0;
    if (phase === 'quiet') {
      if (phaseT <= 0 && dNow >= breatherTo && !waveActive && alive === 0 && truckPending === 0) { // never start a wave on top of a live one (m1r: ENEMIES kept refilling) // a real 25-40 m walk after each cleared wave
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
        if (e.unseenT > UNSEEN_LIMIT && e.engaged && !e.pinned) toVisibleCover(e); // hidden/stuck engaged enemy -> visible cover near the player
      }
    }

    const tempo = 1 + PRESSURE_TEMPO * pressure;
    const pz = camera.position.z;
    let hold = false, engagedN = 0;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (!e.alive) {
        list.splice(i, 1);
        continue;
      }
      if (e.pinned) { if (e.debugVel) { e.group.position.addScaledVector(e.debugVel, dt); e.moving = true; e.moveKind = 'run'; e.moveSpeed = e.debugVel.length(); } }
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
      if (e.art) stepArt(e, dt);
      try { updateEnemy(e, dt * tempo, diff); }
      catch (err) { reportErr('enemy update', err); despawn(e); list.splice(i, 1); continue; } // a broken enemy is removed, never freezes the fight
      // Ground snap + gravity for street fighters (no floating, no hops): y eases down at up to 6 m/s, never below 0.
      if (!(e.anchor && isElevated(e.anchor.type)) && !e.pinned) { const gp = e.group.position; if (gp.y > 0) gp.y = Math.max(0, gp.y - 6 * dt); else gp.y = 0; }
      if (e.art) { try { footIK(e, dt); } catch (err) { e.legs = []; reportErr('foot ik', err); } syncArt(e); } // IK after the body moved this frame
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
      t.life -= dt;
      t.line.material.opacity = Math.max(0, t.life / 0.07);
      if (t.life <= 0) t.line.visible = false;
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
    prevHold = false; displayEngaged = 0; contactHintShown = false; burstIndex = 0;
    waveClears = 0; dryKills = 0; lastDropT = performance.now(); lastPlayerHitS = 0; losT = 0; roofWave = false; waveSpawned = 0; waveTotal = 0; waveOpen = false;
    if (window.SS) { window.SS.waveClears = 0; window.SS.engaged = 0; window.SS.spawnsWhileEngaged = 0; window.SS.trucks = 0; window.SS.firstWave = null; }
    if (window.SS) window.SS.bursting = false;
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
  api.spawnEnemy = function spawnEnemy(behavior) {
    return spawnOne(behavior || undefined);
  };
  api.killAll = killAll;

  return api;
}
