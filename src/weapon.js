import * as THREE from 'three';

const MAG = 30;
const RECOIL_RECOVER = 6; // 1/s, recoil pitch recovery
let reloadEnd = 0;
const RELOAD_TIME = 2.0;
const SHOT_INTERVAL = 60 / 600;
const PITCH_LIMIT = 35 * Math.PI / 180;
const HIP_SPREAD = 0.25 * Math.PI / 180; // was 0.6: at 40 m that threw centre-aimed hip shots off a torso
const ADS_SPREAD = 0.04 * Math.PI / 180; // steadier scope
const COVER_SPREAD = 0.25 * Math.PI / 180; // ducked fire: the crosshair is visible over the cover, so shots go where it points (was 2.2 deg = false misses)
const ASSIST_COVER = 4.0 * Math.PI / 180, ASSIST_PULL_COVER = 0.45; // weak blind-fire pull toward torso

const _dir = new THREE.Vector3();
const _right = new THREE.Vector3();
const _up = new THREE.Vector3();
const _camUp = new THREE.Vector3();
const _origin = new THREE.Vector3();
const _normal = new THREE.Vector3();
const _hip = new THREE.Vector3(0.34, -0.32, -0.48);
const _ads = new THREE.Vector3(0.0, -0.2, -0.4); // replaced per model in setModel so the iron-sight line sits on the crosshair
const _cover = new THREE.Vector3(0.3, -0.4, -0.44); // tester: rifle stays in view while in cover (was lowered off-screen at y -0.78)
const _desired = new THREE.Vector3();
const _tp = new THREE.Vector3();
const ASSIST_HIP = 3.0 * Math.PI / 180, ASSIST_ADS = 1.8 * Math.PI / 180, ASSIST_PULL = 0.6; // slight aim assist
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

  const boxGun = new THREE.Group(); rig.add(boxGun); // code-built fallback rifle
  addBox(boxGun, 0x4a3424, 0, -0.02, 0.16, 0.055, 0.09, 0.22, 0.05);
  addBox(boxGun, 0x2a2c28, 0, 0.02, -0.06, 0.05, 0.075, 0.28, 0.55);
  addBox(boxGun, 0x1a1c1a, 0, 0.03, -0.42, 0.02, 0.02, 0.46, 0.7);
  addBox(boxGun, 0x242624, 0, -0.09, -0.04, 0.03, 0.14, 0.07, 0.3);
  addBox(boxGun, 0x3a2a1c, 0, -0.07, 0.08, 0.038, 0.1, 0.05, 0.1);
  addBox(boxGun, 0x111111, 0, 0.075, -0.1, 0.012, 0.028, 0.08, 0.8);

  // Real rifle model (CC0 Quaternius AK47): fit its long axis to -Z (barrel forward), ~0.86 m, replacing the boxes.
  weapon.setModel = function setModel(obj, flip) {
    if (!obj) return;
    obj.updateMatrixWorld(true); let b = new THREE.Box3().setFromObject(obj); const sz = b.getSize(new THREE.Vector3());
    if (sz.x > sz.z) obj.rotation.y = flip ? Math.PI / 2 : -Math.PI / 2; else if (flip) obj.rotation.y = Math.PI;
    obj.updateMatrixWorld(true); b = new THREE.Box3().setFromObject(obj); b.getSize(sz);
    const k = 0.74 / Math.max(sz.z, 1e-4); obj.scale.multiplyScalar(k); obj.updateMatrixWorld(true);
    b = new THREE.Box3().setFromObject(obj); const ctr = b.getCenter(new THREE.Vector3());
    const sightH = b.max.y - ctr.y; // top of the rail / rear sight above the model centre
    const holder = new THREE.Group(); holder.add(obj); obj.position.sub(ctr); if (obj.name === 'rifle_m4') holder.position.set(0.0, 0.0, -0.3); else holder.position.set(0.035, -0.045, -0.12); holder.rotation.set(0, obj.name === 'rifle_m4' ? 0.2 : 0.09, obj.name === 'rifle_m4' ? -0.16 : -0.05); // slight yaw/cant so the curved mag and wood furniture read
    obj.traverse((m) => { if (m.isMesh) { m.castShadow = false; m.frustumCulled = false; if (m.material) { m.material = m.material.clone(); m.material.roughness = Math.max(0.5, m.material.roughness ?? 0.6);
        if (!/wood/i.test(m.material.name || '')) { m.material.color.multiplyScalar(0.6); m.material.metalness = 0.5; } } } }); // gunmetal, not toy grey
    rig.add(holder); boxGun.visible = false; weapon.model = holder; weapon.modelName = obj.name || 'rifle_ak47';
    // ADS: put the sight line on the camera axis (holder offset cancelled, yaw/cant removed while scoping).
    weapon.holderHip = { x: holder.position.x, y: holder.position.y, ry: holder.rotation.y, rz: holder.rotation.z };
    _ads.set(-holder.position.x, -(holder.position.y + sightH) - 0.012, -0.36);
  };
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
  let cooldown = 0, lastUpd = 0;
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
    cooldown = Math.max(cooldown, -SHOT_INTERVAL * 3) + SHOT_INTERVAL; // real-time cadence (keeps the remainder)
    flashT = 0.05;
    flash.intensity = 5;
    flashSprite.visible = true;
    const kickAmt = input.scope ? 0.003 : 0.02;
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
      const lim = input.cover ? ASSIST_COVER : input.scope ? ASSIST_ADS : input.touch ? ASSIST_TOUCH : ASSIST_HIP;
      let best = null, bestA = lim, bestEnemy = null;
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i]; if (!t.userData || t.userData.part === 'head' || !t.visible) continue;
        t.getWorldPosition(_tp); _tp.sub(_origin); const a = _tp.angleTo(_dir);
        if (a < bestA) { bestA = a; best = _tp.clone().normalize(); bestEnemy = t.userData.enemy; }
      }
      const pull = input.cover ? ASSIST_PULL_COVER : (input.touch && !input.scope ? ASSIST_PULL_TOUCH : ASSIST_PULL);
      // Assist only when the crosshair ray itself would miss every enemy, and only if the bent ray reaches that enemy
      // unobstructed. Before, a crosshair already on a head over cover was pulled toward the hidden torso -> hit the cover.
      if (best) {
        const raw = firstHit(_origin, _dir);
        if (!(raw && raw.object.userData && raw.object.userData.enemy)) {
          _tp.copy(_dir); _dir.lerp(best, pull).normalize();
          const bent = firstHit(_origin, _dir);
          if (!(bent && bent.object.userData && bent.object.userData.enemy === bestEnemy)) _dir.copy(_tp);
        }
      }
    }
    if (input.cover) {
      // Ducked fire goes exactly down the crosshair from the eye (the eye already clears the cover). The old +0.5 m
      // raised origin sent shots along a different line than the crosshair and clipped cover/props: false misses.
      // Suppression: blind shots pin nearby alive enemies (slows their return fire).
      if (window.SS && window.SS.enemies && window.SS.enemies.list) {
        const el = window.SS.enemies.list;
        for (let i = 0; i < el.length; i++) {
          const en = el[i];
          if (!en || !en.alive) continue;
          const d = en.group.position.distanceTo(camera.position);
          if (d < 55) en.suppressT = Math.max(en.suppressT || 0, 1.35);
        }
      }
    }
    const spread = input.cover ? COVER_SPREAD : input.scope ? ADS_SPREAD : HIP_SPREAD;
    const a = Math.random() * Math.PI * 2;
    const r = Math.tan(spread) * Math.sqrt(Math.random());
    _dir.addScaledVector(_right, Math.cos(a) * r);
    _dir.addScaledVector(_camUp, Math.sin(a) * r);
    _dir.normalize();
    raycaster.set(_origin, _dir);

    const hit = firstHit(_origin, _dir);
    weapon.lastShot = { origin: _origin.clone(), dir: _dir.clone(), hit: hit ? { point: hit.point.clone(), enemy: !!(hit.object.userData && hit.object.userData.enemy), part: hit.object.userData && hit.object.userData.part, name: hit.object.name || hit.object.type } : null };
    if (weapon.onShotDebug) weapon.onShotDebug(weapon.lastShot);
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

  // Nearest of world colliders and enemy hitboxes along a ray (camera centre; muzzle/viewmodel play no part).
  const _fhRay = new THREE.Raycaster(); _fhRay.far = 180;
  function firstHit(o, d) {
    _fhRay.set(o, d);
    const w0 = _fhRay.intersectObjects(world.colliders, false)[0];
    const th = targets.length ? _fhRay.intersectObjects(targets, false) : [];
    let t0 = th[0] || null;
    // Same enemy, overlapping boxes: prefer head > body > limb within 0.35 m (an aiming arm in front of the face, or the
    // torso capsule top, must not turn a crosshair-on-head shot into a body/limb hit).
    if (t0) { const rank = (o) => (o.object.userData.part === 'head' ? 2 : o.object.userData.part === 'body' ? 1 : 0);
      for (let i = 1; i < th.length; i++) { const o = th[i]; if (o.object.userData.enemy !== t0.object.userData.enemy || o.distance - th[0].distance > 0.35) break; if (rank(o) > rank(t0)) t0 = o; } }
    return !t0 ? w0 : !w0 ? t0 : (t0.distance <= w0.distance + 0.05 ? t0 : w0);
  }
  weapon.firstHit = firstHit;
  weapon.debugShoot = (input) => { if (weapon.ammo <= 0) weapon.ammo = MAG; shoot(input); return weapon.lastShot; };
  // A drag after a shot means the player is controlling the muzzle: drop the pending recoil recovery (no drift back).
  weapon.cancelRecoil = function cancelRecoil() { recoil = 0; };
  weapon.update = function update(dt, input) {
    const k = 1 - Math.exp(-10 * dt);
    if (input.cover) _desired.copy(_cover);
    else if (input.scope) _desired.copy(_ads);
    else _desired.copy(_hip);
    rig.position.lerp(_desired, k);
    if (weapon.model && weapon.holderHip) { const H = weapon.holderHip, s = input.scope && !input.cover ? 0 : 1, hm = weapon.model;
      hm.rotation.y += (H.ry * s - hm.rotation.y) * k; hm.rotation.z += (H.rz * s - hm.rotation.z) * k; }
    kick += (0 - kick) * (1 - Math.exp(-8 * dt));
    rig.rotation.x = kick;
    rig.rotation.y = input.scope || input.cover ? 0 : 0.05;
    // Scoped: hide the viewmodel once zoomed in (it filled the view as a grey block); hip/cover always show it.
    rig.visible = !(input.scope && camera.fov < 45);

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
    // Fire cadence runs on the real-time clock (sim dt is capped at low fps, which starved held FIRE).
    { const now = performance.now(); const rdt = lastUpd ? Math.min(0.5, (now - lastUpd) / 1000) : dt; lastUpd = now; cooldown -= rdt; }
    // Drain queued still-clicks one per cooldown slot so rapid taps never drop every other shot.
    if ((input.pendingShots | 0) > 0 && !weapon.reloading && weapon.ammo > 0 && cooldown <= 0) {
      input.pendingShots -= 1;
      shoot(input);
    } else if ((input.pendingShots | 0) > 0 && weapon.ammo <= 0 && !weapon.reloading) {
      input.pendingShots = 0; // empty mag: drop queue (reload will start)
    }
    for (let n = 0; n < 4; n++) { const wants = input.fire && !weapon.reloading && weapon.ammo > 0; if (!(wants && cooldown <= 0)) break; shoot(input); }
    if (!input.fire && (input.pendingShots | 0) <= 0 && cooldown < 0) cooldown = 0; // no stored burst while idle
  };

  weapon.reloadProgress = () => weapon.reloading ? Math.max(0, Math.min(1, 1 - (reloadEnd - performance.now()) / (RELOAD_TIME * 1000))) : 0;
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
