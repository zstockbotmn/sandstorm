import * as THREE from 'three';

const MAG = 30;
const RECOIL_RECOVER = 6; // 1/s, recoil pitch recovery
let reloadEnd = 0;
const RELOAD_TIME = 2.0;
const SHOT_INTERVAL = 60 / 600;
const PITCH_LIMIT = 35 * Math.PI / 180;
const HIP_SPREAD = 0.6 * Math.PI / 180;
const ADS_SPREAD = 0.08 * Math.PI / 180; // steadier scope
const COVER_SPREAD = 3.5 * Math.PI / 180; // blind fire from cover

const _dir = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _origin = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _hip = new THREE.Vector3(0.34, -0.32, -0.48);
const _ads = new THREE.Vector3(0.0, -0.2, -0.4);
const _cover = new THREE.Vector3(0.28, -0.78, -0.32);
const _desired = new THREE.Vector3();
const _tp = new THREE.Vector3();
const ASSIST_HIP = 3.0 * Math.PI / 180, ASSIST_ADS = 1.2 * Math.PI / 180, ASSIST_PULL = 0.6; // slight aim assist
const ASSIST_TOUCH = 5.0 * Math.PI / 180, ASSIST_PULL_TOUCH = 0.8; // stronger on touch

function softCircle(r, g, b, a) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g2 = c.getContext('2d');
  const grd = g2.createRadialGradient(32, 32, 2, 32, 32, 30);
  grd.addColorStop(0, `rgba(${r},${g},${b},${a})`);
  grd.addColorStop(1, `rgba(${r},${g},${b},0)`);
  g2.fillStyle = grd;
  g2.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function addBox(parent, color, x, y, z, sx, sy, sz, metalness) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(sx, sy, sz),
    new THREE.MeshStandardMaterial({ color, roughness: 0.62, metalness: metalness ?? 0.4 })
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = false;
  mesh.receiveShadow = false;
  parent.add(mesh);
  return mesh;
}

export function createWeapon(camera, world, scene) {
  const targets = [];
  const weapon = {
    ammo: MAG,
    magSize: MAG,
    reloading: false,
    shotsFired: 0,
    shotsHit: 0,
    targets,
    onHit: null,
    onShot: null,
    onReload: null,
  };

  const rig = new THREE.Group();
  rig.position.copy(_hip);
  camera.add(rig);

  addBox(rig, 0x4a3424, 0, -0.02, 0.16, 0.055, 0.09, 0.22, 0.05);
  addBox(rig, 0x2a2c28, 0, 0.02, -0.06, 0.05, 0.075, 0.28, 0.55);
  addBox(rig, 0x1a1c1a, 0, 0.03, -0.42, 0.02, 0.02, 0.46, 0.7);
  addBox(rig, 0x242624, 0, -0.09, -0.04, 0.03, 0.14, 0.07, 0.3);
  addBox(rig, 0x3a2a1c, 0, -0.07, 0.08, 0.038, 0.1, 0.05, 0.1);
  addBox(rig, 0x111111, 0, 0.075, -0.1, 0.012, 0.028, 0.08, 0.8);

  const flash = new THREE.PointLight(0xffb060, 0, 3.2, 2);
  flash.position.set(0, 0.03, -0.66);
  rig.add(flash);
  const flashSprite = new THREE.Sprite(new THREE.SpriteMaterial({
    map: softCircle(255, 200, 120, 1),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  flashSprite.position.copy(flash.position);
  flashSprite.scale.setScalar(0.16);
  flashSprite.visible = false;
  rig.add(flashSprite);

  const dustMat = new THREE.SpriteMaterial({
    map: softCircle(196, 168, 120, 0.85),
    transparent: true,
    depthWrite: false,
  });
  const puffs = [];
  const fx = new THREE.Group();
  scene.add(fx);
  for (let i = 0; i < 16; i++) {
    const sprite = new THREE.Sprite(dustMat.clone());
    sprite.visible = false;
    sprite.scale.setScalar(0.2);
    fx.add(sprite);
    puffs.push({ sprite, life: 0, max: 0.28 });
  }

  const raycaster = new THREE.Raycaster();
  raycaster.far = 180;
  let cooldown = 0;
  let reloadT = 0;
  let flashT = 0;
  let kick = 0;

  function spawnPuff(point, normal) {
    let slot = puffs[0];
    for (let i = 0; i < puffs.length; i++) {
      if (puffs[i].life <= 0) { slot = puffs[i]; break; }
      if (puffs[i].life < slot.life) slot = puffs[i];
    }
    slot.life = slot.max;
    slot.sprite.visible = true;
    slot.sprite.position.copy(point);
    if (normal) slot.sprite.position.addScaledVector(normal, 0.06);
    slot.sprite.material.opacity = 0.75;
    slot.sprite.scale.setScalar(0.12);
  }

  let recoil = 0;
  function startReload() {
    if (weapon.reloading || weapon.ammo >= MAG) return;
    weapon.reloading = true;
    reloadT = 0;
    reloadEnd = performance.now() + RELOAD_TIME * 1000; // real time: slow frames must not stretch the reload
    if (weapon.onReload) weapon.onReload('start');
  }

  function shoot(input) {
    weapon.ammo -= 1;
    weapon.shotsFired += 1;
    cooldown = SHOT_INTERVAL;
    flashT = 0.05;
    flash.intensity = 5;
    flashSprite.visible = true;
    const kickAmt = input.scope ? 0.005 : 0.02;
    input.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, input.pitch - kickAmt));
    recoil += kickAmt; // recovered over time in update()
    kick = input.scope ? 0.03 : 0.07;
    if (weapon.onShot) weapon.onShot();

    camera.getWorldDirection(_dir);
    _right.crossVectors(_dir, _up.set(0, 1, 0));
    if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0);
    _right.normalize();
    _camUp.crossVectors(_right, _dir).normalize();
    camera.getWorldPosition(_origin);
    { // Slight aim assist: bend the shot part-way toward the nearest enemy torso near the crosshair.
      const lim = input.scope ? ASSIST_ADS : input.touch ? ASSIST_TOUCH : ASSIST_HIP; let best = null, bestA = lim;
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i]; if (!t.userData || t.userData.part === 'head' || !t.visible) continue;
        t.getWorldPosition(_tp); _tp.sub(_origin); const a = _tp.angleTo(_dir);
        if (a < bestA) { bestA = a; best = _tp.clone().normalize(); }
      }
      if (best) _dir.lerp(best, input.touch && !input.scope ? ASSIST_PULL_TOUCH : ASSIST_PULL).normalize();
    }
    if (input.cover) _origin.y += 0.5; // blind fire over the top of cover
    const spread = input.cover ? COVER_SPREAD : input.scope ? ADS_SPREAD : HIP_SPREAD;
    const a = Math.random() * Math.PI * 2;
    const r = Math.tan(spread) * Math.sqrt(Math.random());
    _dir.addScaledVector(_right, Math.cos(a) * r);
    _dir.addScaledVector(_camUp, Math.sin(a) * r);
    _dir.normalize();
    raycaster.set(_origin, _dir);

    const worldHits = raycaster.intersectObjects(world.colliders, false);
    const targetHits = targets.length ? raycaster.intersectObjects(targets, false) : [];
    const w0 = worldHits[0];
    const t0 = targetHits[0];
    const hit = !t0 ? w0 : !w0 ? t0 : (t0.distance < w0.distance ? t0 : w0);
    if (!hit) {
      if (weapon.ammo <= 0) startReload();
      return;
    }
    const ud = hit.object.userData || {};
    if (ud.enemy) {
      weapon.shotsHit += 1;
      if (weapon.onHit) {
        weapon.onHit({ enemy: ud.enemy, part: ud.part, point: hit.point.clone() });
      }
    } else {
      _normal.set(0, 1, 0);
      if (hit.face) {
        _normal.copy(hit.face.normal);
        _normal.transformDirection(hit.object.matrixWorld);
      }
      spawnPuff(hit.point, _normal);
    }
    if (weapon.ammo <= 0) startReload();
  }

  weapon.update = function update(dt, input) {
    const k = 1 - Math.exp(-10 * dt);
    if (input.cover) _desired.copy(_cover);
    else if (input.scope) _desired.copy(_ads);
    else _desired.copy(_hip);
    rig.position.lerp(_desired, k);
    kick += (0 - kick) * (1 - Math.exp(-8 * dt));
    rig.rotation.x = kick;
    rig.rotation.y = input.scope || input.cover ? 0 : 0.05;

    if (flashT > 0) {
      flashT -= dt;
      if (flashT <= 0) {
        flash.intensity = 0;
        flashSprite.visible = false;
      }
    }

    for (let i = 0; i < puffs.length; i++) {
      const p = puffs[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      const u = Math.max(0, p.life / p.max);
      p.sprite.material.opacity = 0.75 * u;
      p.sprite.scale.setScalar(0.12 + (1 - u) * 0.28);
      if (p.life <= 0) p.sprite.visible = false;
    }

    if (weapon.reloading) {
      reloadT += dt;
      if (performance.now() >= reloadEnd) {
        weapon.reloading = false;
        weapon.ammo = MAG;
        if (weapon.onReload) weapon.onReload('end');
      }
    } else if (input.reloadPressed) {
      startReload();
    } else if (weapon.ammo <= 0) {
      startReload();
    }

    // Recoil recovery: return the kicked pitch toward where the player aimed (no upward creep).
    if (recoil > 0) { const r = Math.min(recoil, recoil * (1 - Math.exp(-RECOIL_RECOVER * dt)) + 0.002 * dt * 60); recoil -= r; input.pitch = Math.min(PITCH_LIMIT, input.pitch + r); }
    // On-target check for the crosshair (same cone as the aim assist).
    { camera.getWorldDirection(_dir); camera.getWorldPosition(_origin); const lim = input.scope ? ASSIST_ADS : ASSIST_HIP; let on = false;
      for (let i = 0; i < targets.length && !on; i++) { const t = targets[i]; if (!t.visible) continue; t.getWorldPosition(_tp); _tp.sub(_origin); if (_tp.length() < 180 && _tp.angleTo(_dir) < lim) on = true; }
      weapon.onTarget = on; }
    cooldown -= dt;
    if (input.clickShot && !weapon.reloading && weapon.ammo > 0 && cooldown <= 0) { input.clickShot = false; shoot(input); }
    else if (input.clickShot && (weapon.ammo <= 0)) input.clickShot = false; // a click during reload fires when it ends
    const wants = input.fire && !weapon.reloading && weapon.ammo > 0;
    if (wants && cooldown <= 0) shoot(input);
  };

  weapon.reset = function reset() {
    weapon.ammo = MAG;
    weapon.reloading = false;
    weapon.shotsFired = 0;
    weapon.shotsHit = 0;
    cooldown = 0;
    reloadT = 0;
    recoil = 0;
    kick = 0;
    flashT = 0;
    flash.intensity = 0;
    flashSprite.visible = false;
  };

  return weapon;
}
