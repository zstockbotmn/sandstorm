const CALM = typeof location !== 'undefined' && /[?&]calm=1/.test(location.search); // tests: no auto spawns
import * as THREE from 'three';
import { art } from './art.js';
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
  let fighterCursor = 0;
  const capsule = (r, len) => new THREE.CapsuleGeometry(r, len, 3, 6);
  const geoTorso = capsule(0.17 * S, 0.42 * S);
  const geoHead = new THREE.SphereGeometry(0.125 * S, 10, 8);
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

  let phase = 'quiet';
  let phaseT = 2.5;
  let quietCap = 1;
  let burstCap = 3, burstSpawned = 0, waveActive = false, roofWave = false;
  let spawnCd = 1.2;
  let lastReal = 0, lastProg = 0, noProgT = 0, losT = 0, anySeen = false;
  const losRay = new THREE.Raycaster(); const _ep = new THREE.Vector3(), _ed = new THREE.Vector3();
  let stallT = 0, standT = 0, graceT = 0, runT = 0, pressure = 0;
  let waveClears = 0;
  let breatherTo = 0;          // no spawns until the player has walked this far (breather after WAVE CLEARED)
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
    if (!enemy.moving) {
      if (enemy.posture === 'crouch') return 'crouch';
      if (enemy.posture === 'lean') return 'lean';
      return 'idle';
    }
    if (enemy.moveKind === 'walk') return 'walk';
    if (enemy.moveKind === 'strafe') return 'strafe';
    return 'run';
  }

  function stepArt(enemy, dt) {
    const name = desiredAnim(enemy);
    enemy.animState = name;
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
    enemy.mixer.update(dt);
    if (enemy.hitPlaying && !enemy.actions.hit.enabled) {
      enemy.hitPlaying = false;
      enemy.hitReturning = false;
    }
  }

  function playHit(enemy) {
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
      bones.Spine.getWorldPosition(_wA);
      bones.Hips.getWorldPosition(_wB);
      _wA.add(_wB).multiplyScalar(0.5);
      group.worldToLocal(_wA);
      enemy.parts.torso.position.copy(_wA);
    }
    group.updateMatrixWorld(true);
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

  function facePlayer(enemy) {
    _look.set(camera.position.x, enemy.group.position.y, camera.position.z);
    enemy.group.lookAt(_look);
  }

  function spray(point) {
    let spawned = 0;
    for (let i = 0; i < blood.length && spawned < 8; i++) {
      const b = blood[i];
      if (b.life > 0) continue;
      b.life = 0.35 + Math.random() * 0.25;
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
    mesh.scale.setScalar(0.7 + Math.random() * 0.5);
  }

  function kill(enemy, point, part) {
    if (!enemy.alive) return;
    enemy.alive = false;
    unregister(enemy);
    const origin = enemy.group.position;
    spray(point || origin.clone().setY(origin.y + 1.3));
    dropDecal(origin);
    const yaw = enemy.group.rotation.y;
    enemy.group.updateMatrixWorld(true);
    // A ragdoll/physics failure must never block a kill (tester soft-lock: hit markers but nobody died, loop frozen).
    let doll = null;
    try { doll = ragdolls.spawn(origin, yaw, _aim.copy(origin).sub(camera.position).normalize()); ragdolls.addNearbyStatics(doll, world.colliders, origin); }
    catch (err) { reportErr('ragdoll spawn', err); doll = null; }
    if (enemy.art && doll) try {
      const model = enemy.art.root;
      scene.attach(model); // keeps the world transform
      // Sample the death clip, then freeze that pose for the ragdoll skin.
      const death = enemy.actions && enemy.actions.death;
      if (death && enemy.mixer) {
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
    else if (enemy.art && enemy.art.root.parent === scene) scene.remove(enemy.art.root);
    enemy.group.visible = false;
    root.remove(enemy.group);
    if (window.SS && window.SS.scoreSys) window.SS.scoreSys.addKill(part === 'head');
    // Kill confirmation: kill marker + sound; headshot burst; brief slow-mo on the wave's last kill.
    const SSx = window.SS || {};
    if (SSx.hud && SSx.hud.hitMarker) SSx.hud.hitMarker(part === 'head' ? 'headkill' : 'kill');
    if (SSx.audio && SSx.audio.kill) SSx.audio.kill();
    if (part === 'head') { const hp = (point || origin.clone().setY(origin.y + 1.6)); spray(hp); spray(hp); spray(hp); }
    if (SSx.stakes && Math.random() < 0.28) SSx.stakes.drop(SSx.health < 65 ? 'health' : (Math.random() < 0.5 ? 'ammo' : 'health'), origin.clone());
    if (aliveCount() === 0) { SSx.slowmoUntil = performance.now() + 750; if (SSx.hud && SSx.hud.banner) setTimeout(() => {}, 0); }
  }

  function hitEnemy(enemy, part, point) {
    if (!enemy.alive) return;
    const dmg = part === 'head' ? HEAD_DMG : BODY_DMG;
    enemy.health -= dmg;
    if (point) spray(point);
    if (enemy.health <= 0) kill(enemy, point, part);
    else {
      if (enemy.art) playHit(enemy);
      // Bigger hit reaction: shove back ~0.3 m from the shooter (ground enemies) + a brief exposed stagger.
      if (enemy.group.position.y < 0.5) { _aim.copy(enemy.group.position).sub(camera.position).setY(0).normalize(); enemy.group.position.addScaledVector(_aim, 0.3); }
      enemy.staggerT = 0.45; enemy.shootCd = Math.max(enemy.shootCd || 0, 0.6);
      if (window.SS && window.SS.hud && window.SS.hud.hitMarker) window.SS.hud.hitMarker(part === 'head' ? 'head' : 'hit');
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
    let chance = (0.42 - dist * 0.006) * (0.55 + 0.7 * diff);
    enemy.engaged = true; // shooting engages: the walk halts until this enemy is dead
    if (window.SS && window.SS.input && window.SS.input.cover) chance *= 0.3; // ducked in cover
    chance *= 1 + PRESSURE_HIT * pressure;
    // Early soften: first ~120 m / first bursts are less deadly
    const prog = window.SS ? window.SS.distance : 0;
    if ((prog < 120 || burstIndex <= 2) && pressure < 0.45) chance *= 0.72; // still lethal once standing-still pressure builds
    if ((enemy.suppressT || 0) > 0) chance *= 0.45; // blind-fire suppression
    chance = Math.max(0.02, Math.min(0.85, chance));
    const hit = Math.random() < chance && player && player.alive;
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
  function toVisibleCover(e) {
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
      const start = groundPoint(home.x, home.z + zOff);
      const atDoor = groundPoint(home.x, home.z);
      enemy.phase = 'approach';
      enemy.path = [atDoor, home.clone()];
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
    const at = elev ? groundPoint(home.x, home.z) : (anchor.type === 'door' || anchor.type === 'alley' ? home.clone().setY(0) : tuckOf(home, anchor));
    pts.push(at);
    if (elev) pts.push(home);
    return pts;
  }

  function startRelocate(enemy) {
    const elevated = isElevated(enemy.anchor.type);
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
      enemy.moving = false;
      return true;
    }
    const horiz = Math.hypot(_fwd.x, _fwd.z);
    const climb = Math.abs(_fwd.y) > 0.3 && horiz < 1.2;
    const lateral = enemy.phase === 'peek' || enemy.phase === 'hide';
    enemy.moveKind = lateral ? 'strafe' : climb ? 'walk' : 'run';
    if (!lateral && !climb && dist < 1.5) enemy.moveKind = 'walk';
    enemy.moving = true;
    const step = Math.min(dist, speed * dt);
    p.addScaledVector(_fwd.multiplyScalar(1 / dist), step);
    if (p.y < 0) p.y = 0;
    if (horiz > 0.12) enemy.group.lookAt(dest.x, p.y, dest.z);
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
    enemy.shootCd = Math.min(enemy.shootCd, 0.12 + Math.random() * 0.1);
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
        let cd = (0.55 + Math.random() * 0.5) * (1.12 - 0.35 * diff);
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
        let cd = (0.65 + Math.random() * 0.7) * (1.1 - 0.35 * diff);
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
  const nadeMat = visMat(0x2f3324); const nadeGeo = new THREE.SphereGeometry(0.09, 10, 8);
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
        if (k >= 1) { n.landed = true; n.t = 0; if (cov && cov.relocate) cov.relocate(camera.position.x > 0 ? -1 : 1, 'grenade'); } }
      else if (n.t >= n.fuse) {
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
    for (const [x, z] of [[-1, 1.8], [1, 1.8], [-1, -1.6], [1, -1.6]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.3, 10), truckCab); w.rotation.z = Math.PI / 2; w.position.set(x, 0.42, z); g.add(w); }
    g.add(bed, cab); g.position.set(side * 2.6, 0, camera.position.z - 70); scene.add(g);
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
      if (phaseT <= 0 && dNow >= breatherTo) { // a real 25-40 m walk after each cleared wave
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
    const canSpawn = phase === 'burst' ? (burstSpawned < burstCap && !waveActive) : alive < cap;
    if (window.SS && window.SS.running && !CALM && canSpawn && dNow >= breatherTo) for (let tries = 0; tries < 6 && (phase === 'burst' ? burstSpawned < burstCap : tries < 1) && (phase === 'burst' || spawnCd <= 0); tries++) {
      const flankSlot = phase === 'burst' && burstSpawned === burstCap - 1 && (burstCap === 3 || Math.random() < 0.5);
      const roofSlot = phase === 'burst' && burstSpawned === 1 && burstIndex >= 2 && roofWave;
      const made = spawnOne(flankSlot ? 'flanker' : roofSlot ? 'roof' : (phase === 'burst' && burstSpawned === 0 ? 'shifter' : undefined)) || ((flankSlot || roofSlot) ? spawnOne() : null);
      if (made && roofSlot && made.anchor && made.anchor.type === 'roof') { squadCall('Rooftop!'); if (window.SS) window.SS.roofShooters = (window.SS.roofShooters | 0) + 1; }
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
        e.seen = e.exposed && losRay.intersectObjects(world.colliders, false).length === 0;
        e.unseenT = e.seen ? 0 : (e.unseenT || 0) + step;
        if (e.seen && d < HOLD_RANGE) { anySeen = true; e.engaged = true; }
        if (e.unseenT > UNSEEN_LIMIT && e.engaged) toVisibleCover(e); // hidden/stuck engaged enemy -> visible cover near the player
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
      if (e.group.position.z > pz + 6 && e.engaged) toVisibleCover(e);
      else if (e.group.position.z > pz + 6) {
        e.alive = false;
        unregister(e);
        root.remove(e.group);
        list.splice(i, 1);
        continue;
      }
      if (e.art) stepArt(e, dt);
      try { updateEnemy(e, dt * tempo, diff); }
      catch (err) { reportErr('enemy update', err); despawn(e); list.splice(i, 1); continue; } // a broken enemy is removed, never freezes the fight
      if (e.art) syncArt(e);
      if (e.marker) e.marker.visible = !(window.SS && window.SS.input && window.SS.input.scope) && Math.abs(e.group.position.z - pz) > 7;
      const dx = e.group.position.x - camera.position.x;
      const dy = e.group.position.y - camera.position.y;
      const dz = e.group.position.z - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (waveActive && e.alive && !e.engaged && !e.dying) e.engaged = true; // the whole wave is in the fight once it starts
      if (e.engaged) { hold = true; engagedN += 1; } // halt until ALL engaged enemies are dead (hidden ones still despawn after 5 s)
    }

    if (hold) waveActive = true;
    if (waveActive && aliveCount() === 0 && truckPending === 0) waveActive = false; // clear only when every wave member (incl. truck) is dead
    if (waveActive) hold = true;
    if (running) window.SS.walking = !hold; // halt from first engage until the last engaged enemy is KILLED
    // Stable ENEMIES counter: rises only when newly engaged appear, falls on engaged deaths (no silent mid-fight bumps from unengaged spawns).
    displayEngaged = aliveCount() + truckPending; // total remaining in the wave (incl. truck still driving in)
    if (!hold) displayEngaged = 0;
    if (running && prevHold && !hold && window.SS.hud && window.SS.hud.banner) {
      waveClears += 1; window.SS.waveClears = waveClears; window.SS.hud.banner('WAVE CLEARED');
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
    if (decals.length > 12) {
      const old = decals.shift();
      scene.remove(old);
      old.geometry.dispose();
    }

    try { ragdolls.update(dt, pz); } catch (err) { reportErr('ragdoll update', err); try { ragdolls.clear && ragdolls.clear(); } catch (_) {} }
  }

  function despawn(enemy) {
    if (enemy.alive) unregister(enemy);
    enemy.alive = false;
    enemy.group.visible = false;
    root.remove(enemy.group);
  }

  function reset() {
    if (truck) { scene.remove(truck.g); truck = null; } truckPending = 0;
    for (const n of nades) scene.remove(n.m); nades.length = 0; nadeThisWave = false; campT = 0;
    for (let i = list.length - 1; i >= 0; i--) despawn(list[i]);
    list.length = 0;
    if (ragdolls.clear) ragdolls.clear();
    for (let i = 0; i < decals.length; i++) decals[i].visible = false;
    for (let i = 0; i < blood.length; i++) {
      blood[i].life = 0;
      blood[i].sprite.visible = false;
    }
    phase = 'quiet';
    phaseT = 2.5;
    breatherTo = 0;
    quietCap = 1;
    burstCap = 3; burstSpawned = 0; waveActive = false;
    spawnCd = 1.2;
    stallT = standT = graceT = runT = pressure = 0; lastProg = 0; noProgT = 0; anySeen = false;
    prevHold = false; displayEngaged = 0; contactHintShown = false; burstIndex = 0;
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
