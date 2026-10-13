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
const HOLD_RANGE = 45;        // walking pauses only for exposed enemies within this range
const STALL_LIMIT = 20;       // s stalled without a hit before the failsafe kicks in
const STALL_GRACE = 6;        // s of forced walking after the failsafe
const PRESSURE_RAMP = 55;     // s standing still to reach full pressure
const PRESSURE_HIT = 1.0;     // extra hit chance multiplier at full pressure
const PRESSURE_TEMPO = 0.8;   // extra enemy tempo (fire rate, push-in speed) at full pressure
const RUN_RAMP = 300;         // s of run time adding up to +30% pressure
function difficulty() {
  const dist = window.SS && window.SS.distance ? window.SS.distance : 0;
  return Math.max(0, Math.min(1, dist / 700));
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
    g.fillStyle = '#ff3b2f'; g.beginPath(); g.moveTo(4, 8); g.lineTo(28, 8); g.lineTo(16, 26); g.closePath(); g.fill();
    const t = new THREE.CanvasTexture(c); return new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }); })();
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
  let burstCap = 4;
  let spawnCd = 1.2;
  let stallT = 0, standT = 0, graceT = 0, runT = 0, pressure = 0;

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

  // exposed + still -> idle; shifter moving -> strafe; flanker moving -> run
  function desiredAnim(enemy) {
    if (enemy.behavior === 'shifter' && enemy.moveT <= 0 && enemy.goal &&
        enemy.group.position.distanceTo(enemy.goal) > 0.35) return 'strafe';
    if (enemy.behavior === 'flanker' && enemy.group.position.distanceTo(enemy.flankTo) > 0.4) return 'run';
    return 'idle';
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
    const marker = new THREE.Sprite(markerMat); marker.scale.set(0.35, 0.35, 1); marker.position.y = 2.25 * S; marker.renderOrder = 5; group.add(marker);
    const enemy = {
      marker,
      behavior,
      group,
      anchor,
      health: MAX_HEALTH,
      alive: true,
      exposed: behavior !== 'popper',
      hideT: 0.4 + Math.random() * 1.2,
      showT: 0,
      moveT: 0,
      shootCd: 0.4 + Math.random() * 0.8,
      goal: null,
      home: anchor.pos.clone(),
      flankFrom: anchor.pos.clone(),
      flankTo: anchor.pos.clone(),
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
    if (enemy.behavior === 'popper') group.position.copy(hidePos(enemy));
    return enemy;
  }

  function standPos(anchor) {
    const elevated = anchor.type === 'window' || anchor.type === 'roof';
    // Feet on the parapet top (h+0.55) for roofs; at the sill for windows (front of the facade, never inside it).
    const y = anchor.type === 'roof' ? anchor.pos.y - 0.15 : elevated ? Math.max(0, anchor.pos.y - 1.2) : 0;
    const side = Math.sign(anchor.pos.x) || 1;
    // Nudge 0.3 m out of cover toward the street so pop-outs are not clipped in walls.
    return new THREE.Vector3(anchor.pos.x - side * 0.3, y, anchor.pos.z);
  }

  function hidePos(enemy) {
    const pos = enemy.home;
    const side = Math.sign(pos.x) || 1;
    const drop = enemy.anchor.type === 'roof' ? 0.9 : 0.15;
    return new THREE.Vector3(pos.x + side * 0.9, Math.max(0, pos.y - drop), pos.z);
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
    const doll = ragdolls.spawn(origin, yaw, _aim.copy(origin).sub(camera.position).normalize());
    ragdolls.addNearbyStatics(doll, world.colliders, origin);
    if (enemy.art) {
      const model = enemy.art.root;
      scene.attach(model); // keeps the world transform
      stopMixer(model, enemy.mixer);
      for (let i = 0; i < doll.parts.length; i++) {
        doll.parts[i].mesh.traverse((obj) => { obj.visible = false; });
      }
      // Bones leave the mesh origin as the body falls; don't frustum-cull the skin.
      model.traverse((obj) => { if (obj.isMesh) obj.frustumCulled = false; });
      doll.skin = { model, links: ragdolls.bindSkin(doll, enemy.bones) };
    }
    enemy.group.visible = false;
    root.remove(enemy.group);
    if (window.SS && window.SS.scoreSys) window.SS.scoreSys.addKill(part === 'head');
  }

  function hitEnemy(enemy, part, point) {
    if (!enemy.alive) return;
    const dmg = part === 'head' ? HEAD_DMG : BODY_DMG;
    enemy.health -= dmg;
    if (point) spray(point);
    if (enemy.health <= 0) kill(enemy, point, part);
    else if (enemy.art) playHit(enemy);
  }

  weapon.onHit = function onHit(info) {
    stallT = 0;
    if (!info || !info.enemy || !info.enemy.takeHit) return;
    const dirPoint = info.point;
    info.enemy.takeHit(info.part, dirPoint);
    if (window.SS && window.SS.hud && window.SS.hud.hitMarker) window.SS.hud.hitMarker();
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
    if (window.SS && window.SS.input && window.SS.input.cover) chance *= 0.18;
    chance *= 1 + PRESSURE_HIT * pressure;
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
      squadCall('Reloading!');
    }
    if (hit) {
      const amount = Math.max(18, Math.min(22, 20 + (diff - 0.5) * 4));
      player.damage(amount, _muzzle);
    }
  }

  function squadCall(text) {
    const hud = window.SS && window.SS.hud;
    if (hud && typeof hud.callout === 'function') hud.callout(text);
  }

  function coverPool(types) {
    const out = [];
    const segs = world.segments || [];
    const pz = camera.position.z;
    for (let s = 0; s < segs.length; s++) {
      const pts = segs[s].coverPoints || [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const ahead = pz - p.pos.z;
        if (ahead < 20 || ahead > 55) continue;
        if (types && types.indexOf(p.type) < 0) continue;
        out.push(p);
      }
    }
    return out;
  }

  function occupied(pos) {
    for (let i = 0; i < list.length; i++) {
      if (!list[i].alive) continue;
      const h = list[i].home;
      if ((h.x - pos.x) ** 2 + (h.z - pos.z) ** 2 < 2.2) return true;
    }
    return false;
  }

  function spawnOne(prefer) {
    const diff = difficulty();
    const roll = prefer || (Math.random() < 0.45 ? 'popper' : Math.random() < 0.55 ? 'shifter' : 'flanker');
    let types;
    if (roll === 'popper') types = ['window', 'roof', 'wall', 'barrel', 'car'];
    else if (roll === 'flanker') types = ['alley', 'door'];
    else types = ['wall', 'barrel', 'car', 'door', 'alley'];
    let pool = coverPool(types);
    if (!pool.length) pool = coverPool(null);
    if (!pool.length) return null;
    let pick = pool[(Math.random() * pool.length) | 0];
    for (let n = 0; n < 6; n++) {
      const tryP = pool[(Math.random() * pool.length) | 0];
      if (!occupied(tryP.pos)) { pick = tryP; break; }
    }
    if (occupied(pick.pos)) return null;
    const enemy = buildEnemy(roll, pick);
    if (roll === 'flanker') {
      const side = Math.sign(pick.pos.x) || (Math.random() < 0.5 ? -1 : 1);
      enemy.flankFrom.copy(enemy.home);
      enemy.flankTo.set(side * (1.6 + Math.random() * 1.2), 0, enemy.home.z + (Math.random() - 0.5) * 2);
      enemy.group.position.copy(enemy.flankFrom);
      enemy.exposed = false;
    }
    if (roll === 'shifter') {
      enemy.goal = enemy.home.clone();
      enemy.moveT = 0.2;
    }
    enemy.shootCd = 0.6 + Math.random() * (1.4 - diff);
    return enemy;
  }

  function nearestCover(from, avoid) {
    const pool = coverPool(['wall', 'barrel', 'car', 'door']);
    let best = null;
    let bestD = 1e9;
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i].pos;
      if (avoid && (p.x - avoid.x) ** 2 + (p.z - avoid.z) ** 2 < 1) continue;
      const d = p.distanceToSquared(from);
      if (d > 0.8 && d < 64 && d < bestD) {
        bestD = d;
        best = p;
      }
    }
    if (!best) return null;
    const side = Math.sign(best.x) || 1;
    return new THREE.Vector3(best.x - side * 0.3, 0, best.z);
  }

  function updateEnemy(enemy, dt, diff) {
    if (!enemy.alive) return;
    const popScale = 1 - 0.45 * diff;
    if (enemy.behavior === 'popper') {
      if (enemy.exposed) {
        enemy.showT -= dt;
        facePlayer(enemy);
        enemy.group.position.lerp(enemy.home, 1 - Math.exp(-10 * dt));
        if (enemy.showT <= 0) {
          enemy.exposed = false;
          enemy.hideT = (1 + Math.random() * 3) * popScale;
        } else if (player.alive && window.SS.running) {
          enemy.shootCd -= dt;
          if (enemy.shootCd <= 0) {
            enemyShoot(enemy);
            enemy.shootCd = (0.7 + Math.random() * 0.8) * (1.15 - 0.4 * diff);
          }
        }
      } else {
        enemy.hideT -= dt;
        const hid = hidePos(enemy);
        enemy.group.position.lerp(hid, 1 - Math.exp(-8 * dt));
        if (enemy.hideT <= 0) {
          enemy.exposed = true;
          enemy.showT = 0.55 + Math.random() * 0.7;
          enemy.shootCd = 0.12 + Math.random() * 0.25;
        }
      }
    } else if (enemy.behavior === 'shifter') {
      if (!enemy.goal) enemy.goal = enemy.home.clone();
      const moving = enemy.group.position.distanceTo(enemy.goal) > 0.35 && enemy.moveT <= 0;
      if (enemy.moveT > 0) {
        enemy.moveT -= dt;
        enemy.exposed = true;
        facePlayer(enemy);
        if (player.alive && window.SS.running) {
          enemy.shootCd -= dt;
          if (enemy.shootCd <= 0) {
            enemyShoot(enemy);
            enemy.shootCd = 0.55 + Math.random() * 0.5;
          }
        }
        if (enemy.moveT <= 0) {
          const next = nearestCover(enemy.group.position, enemy.goal);
          enemy.goal = next || enemy.home.clone();
        }
      } else if (moving) {
        if (!enemy.moveCalled) {
          enemy.moveCalled = true;
          squadCall('Moving!');
        }
        enemy.exposed = true;
        const step = 3.4 * dt * (1 + 0.35 * diff);
        const dir = _look.copy(enemy.goal).sub(enemy.group.position);
        dir.y = 0;
        const len = dir.length();
        if (len > 0.05) {
          dir.multiplyScalar(step / len);
          enemy.group.position.add(dir);
          enemy.group.lookAt(enemy.goal.x, enemy.group.position.y, enemy.goal.z);
        }
      } else {
        enemy.moveCalled = false;
        enemy.moveT = 0.7 + Math.random() * 0.8;
        enemy.shootCd = 0.15;
      }
    } else {
      const dest = enemy.exposed ? enemy.flankTo : enemy.flankTo;
      const d = enemy.group.position.distanceTo(enemy.flankTo);
      if (d > 0.4) {
        if (!enemy.flankCalled) {
          enemy.flankCalled = true;
          squadCall(enemy.flankTo.x >= 0 ? 'Flanking right!' : 'Flanking left!');
        }
        enemy.exposed = false;
        const step = 3.8 * dt * (1 + 0.3 * diff);
        _look.copy(enemy.flankTo).sub(enemy.group.position);
        _look.y = 0;
        const len = _look.length() || 1;
        enemy.group.position.addScaledVector(_look, step / len);
        enemy.group.lookAt(enemy.flankTo.x, enemy.group.position.y, enemy.flankTo.z);
      } else {
        enemy.exposed = true;
        enemy.group.position.y += (0 - enemy.group.position.y) * (1 - Math.exp(-6 * dt));
        facePlayer(enemy);
        if (player.alive && window.SS.running) {
          enemy.shootCd -= dt;
          if (enemy.shootCd <= 0) {
            enemyShoot(enemy);
            enemy.shootCd = (0.65 + Math.random() * 0.7) * (1.1 - 0.35 * diff);
          }
        }
      }
    }
  }

  function aliveCount() {
    let n = 0;
    for (let i = 0; i < list.length; i++) if (list[i].alive) n += 1;
    return n;
  }

  function update(dt) {
    const diff = difficulty();
    phaseT -= dt;
    const alive = aliveCount();
    if (phase === 'quiet') {
      if (phaseT <= 0) {
        phase = 'burst';
        if (window.SS) window.SS.bursting = true;
        squadCall('Contact!');
        burstCap = 3 + Math.min(3, (diff * 3 + Math.random() * 2) | 0);
        phaseT = 8 + Math.random() * 6;
        spawnCd = 0.25;
      }
    } else if (phaseT <= 0 || (alive === 0 && phaseT < 6)) {
      phase = 'quiet';
      if (window.SS) window.SS.bursting = false;
      quietCap = Math.random() < 0.4 ? 0 : (Math.random() < 0.5 ? 1 : 2);
      phaseT = 7 + Math.random() * 6 - diff * 2;
      spawnCd = 0.8;
    }

    const cap = phase === 'quiet' ? quietCap : burstCap;
    spawnCd -= dt;
    if (window.SS && window.SS.running && !CALM && alive < cap && spawnCd <= 0) {
      const made = spawnOne();
      spawnCd = made ? (phase === 'burst' ? 0.45 + (1 - diff) * 0.55 : 2.2) : 0.6;
    }

    const running = !!(window.SS && window.SS.running);
    if (running) runT += dt;
    if (running && window.SS.walking) { standT = Math.max(0, standT - 2 * dt); stallT = 0; }
    else if (running) { standT += dt; stallT += dt; }
    pressure = Math.min(1, standT / PRESSURE_RAMP + Math.min(0.3, runT / RUN_RAMP));
    if (graceT > 0) graceT -= dt;
    if (stallT > STALL_LIMIT) {
      // Failsafe: drop enemies hiding out of reach, pull the rest into the street, resume walking.
      for (let i = list.length - 1; i >= 0; i--) {
        const e = list[i];
        if (!e.alive) continue;
        if (!e.exposed || e.group.position.y > 0.5) { despawn(e); list.splice(i, 1); }
        else if (e.behavior !== 'flanker') { e.behavior = 'flanker'; e.flankTo.set((Math.sign(e.group.position.x) || 1) * 2, 0, e.group.position.z); }
      }
      stallT = 0; graceT = STALL_GRACE; squadCall('Fall back!');
    }
    const tempo = 1 + PRESSURE_TEMPO * pressure;
    const pz = camera.position.z;
    let hold = false;
    for (let i = list.length - 1; i >= 0; i--) {
      const e = list[i];
      if (!e.alive) {
        list.splice(i, 1);
        continue;
      }
      if (e.group.position.z > pz + 6) {
        e.alive = false;
        unregister(e);
        root.remove(e.group);
        list.splice(i, 1);
        continue;
      }
      if (e.art) stepArt(e, dt);
      updateEnemy(e, dt * tempo, diff);
      if (e.art) syncArt(e);
      if (e.marker) e.marker.visible = !(window.SS && window.SS.input && window.SS.input.scope) && Math.abs(e.group.position.z - pz) > 12;
      const dx = e.group.position.x - camera.position.x;
      const dy = e.group.position.y - camera.position.y;
      const dz = e.group.position.z - camera.position.z;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (e.exposed && dist < HOLD_RANGE && e.group.position.z < pz + 3) hold = true;
    }

    if (running) window.SS.walking = !hold || graceT > 0;
    if (window.SS) window.SS.pressure = { pressure, standT, stallT, graceT };

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

    ragdolls.update(dt, pz);
  }

  function despawn(enemy) {
    if (enemy.alive) unregister(enemy);
    enemy.alive = false;
    enemy.group.visible = false;
    root.remove(enemy.group);
  }

  function reset() {
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
    quietCap = 1;
    burstCap = 4;
    spawnCd = 1.2;
    stallT = standT = graceT = runT = pressure = 0;
    if (window.SS) window.SS.bursting = false;
  }

  function killAll() {
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].alive) kill(list[i], null, 'body');
    }
  }

  api.update = update;
  api.reset = reset;
  api.spawnEnemy = function spawnEnemy(behavior) {
    return spawnOne(behavior || undefined);
  };
  api.killAll = killAll;

  return api;
}
