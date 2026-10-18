import * as THREE from 'three';

const MAG = 30;
const RESERVE_START = 120, RESERVE_MAX = 210; // finite reserve (Zack): 120 at start, ammo drops top up to 210
const RECOVER_MS = [150, 250], RECOVER_DRIFT = 0.04 * Math.PI / 180; // b1: timed recoil recovery (smoothstep, real time) + small random drift (0.15 deg = 17 cm at 65 m threw an aim-reg head shot off; 0.04 deg = 4.5 cm)
let reloadEnd = 0;
const RELOAD_TIME = 2.0;
const SHOT_INTERVAL = 60 / 600;
const PITCH_LIMIT = 35 * Math.PI / 180;
const HIP_SPREAD = 0.08 * Math.PI / 180; // m1s: 0.25 deg threw half of centre-aimed rounds off a torso at 50 m (red crosshair, no kill); was 0.6 before that // // was 0.6: at 40 m that threw centre-aimed hip shots off a torso
const ADS_SPREAD = 0.02 * Math.PI / 180; // steadier scope
const COVER_SPREAD = 0.08 * Math.PI / 180; // // ducked fire: the crosshair is visible over the cover, so shots go where it points (was 2.2 deg = false misses)

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
    reserve: RESERVE_START,
    reserveMax: RESERVE_MAX,
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
  let cooldown = 0, lastUpd = 0, holdId = 0, holdFired = 0, holdBase = 0;
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

  let recoil = 0, recT0 = 0, recDur = 200, recTot = 0, recDone = 0, drP = 0, drY = 0, drDone = 0;
  function startReload() {
    if (weapon.reloading || weapon.ammo >= MAG || weapon.reserve <= 0) return;
    weapon.reloading = true;
    reloadT = 0;
    reloadEnd = performance.now() + RELOAD_TIME * 1000; // real time: slow frames must not stretch the reload
    if (weapon.onReload) weapon.onReload('start');
  }

  let frameShots = 0, seenShot = true; // debugShoot (tests that stage the camera synchronously) uses the live camera
  function shoot(input) {
    weapon.ammo -= 1; pushAmmo(); // m1w: the counter follows the shot itself (it lagged seconds at 2-5 fps)
    weapon.shotsFired += 1;
    cooldown = Math.max(cooldown, -SHOT_INTERVAL * 3) + SHOT_INTERVAL; // real-time cadence (keeps the remainder)
    flashT = 0.05;
    flash.intensity = 5;
    flashSprite.visible = true;
    const p0 = input.pitch; const kickAmt0 = (input.scope ? 0.003 : 0.02) * (frameShots++ < 1 ? 1 : 0.25); // m1s: at ~6 fps several rounds land per frame; full kick for each threw the view metres over a far target
    input.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, input.pitch - kickAmt0)); const kickAmt = p0 - input.pitch;
    if (recoil > 0.07) { input.pitch += kickAmt; } else recoil += kickAmt; // cap recoil climb at ~4 deg (long holds / many rounds per frame) // only what was actually applied is recovered (clamped kicks drifted the view down) // recovered over time in update()
    // b1: each shot restarts a 150-250 ms smoothstep return of everything still kicked, ending on a tiny random drift
    recTot = recoil; recDone = 0; recT0 = performance.now(); recDur = RECOVER_MS[0] + Math.random() * (RECOVER_MS[1] - RECOVER_MS[0]);
    { const a = Math.random() * Math.PI * 2, m = Math.random() * RECOVER_DRIFT * (input.scope ? 0.3 : 1); drP = Math.sin(a) * m; drY = Math.cos(a) * m; drDone = 0; }
    kick = input.scope ? 0.03 : 0.07;
    if (weapon.onShot) weapon.onShot();

    // m1x: fire along the view the player SAW (last rendered camera) against the fighters as drawn in that frame (shots
    // run in sim step 0, before fighters move). At 1-8 fps a tracking drag applied before the shot moved the ray one frame
    // ahead of the drawn target (~v*dt = 0.5-1 m at a strafing fighter): 20 'on the torso' rounds registered nothing.
    const seen = seenShot && weapon.seenAim !== false && window.SS && window.SS.lastCam && window.SS.lastCam.ok ? window.SS.lastCam : null;
    if (seen) _dir.set(0, 0, -1).applyQuaternion(seen.q); else camera.getWorldDirection(_dir);
    _right.crossVectors(_dir, _up.set(0, 1, 0));
    if (_right.lengthSq() < 1e-6) _right.set(1, 0, 0);
    _right.normalize();
    _camUp.crossVectors(_right, _dir).normalize();
    if (seen) _origin.copy(seen.p); else camera.getWorldPosition(_origin);
    // No shot-bending aim assist (App PM): the hit ray is exactly the crosshair ray (+ weapon spread). The only assist is
    // the touch view assist in input.js, which moves the view, never the shot.
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
    const w0 = _fhRay.intersectObjects(world.shotList ? world.shotList() : world.colliders, false)[0];
    const th = targets.length ? _fhRay.intersectObjects(targets, false) : [];
    let t0 = th[0] || null;
    // Same enemy, overlapping boxes: prefer head > body > limb within 0.35 m (an aiming arm in front of the face, or the
    // torso capsule top, must not turn a crosshair-on-head shot into a body/limb hit).
    if (t0) { const rank = (o) => (o.object.userData.part === 'head' ? 2 : o.object.userData.part === 'body' ? 1 : 0);
      // b1 (App PM): an arm (upper arm/forearm) volume in front of the torso counts as a body hit when the same ray goes on into that
      // fighter's torso within 0.6 m (the extended aiming forearm sits ~0.4-0.5 m in front of the chest: chest kills took 3 rounds).
      const armFirst = th[0].object.userData.part === 'limb' && /Arm/.test(((th[0].object.userData.seg || [])[0]) || '');
      for (let i = 1; i < th.length; i++) { const o = th[i]; if (o.object.userData.enemy !== t0.object.userData.enemy) break; const gap = o.distance - th[0].distance;
        if (gap > (armFirst && o.object.userData.part === 'body' ? 0.6 : 0.35)) { if (armFirst && gap <= 0.6) continue; break; } if (rank(o) > rank(t0)) t0 = o; } }
    return !t0 ? w0 : !w0 ? t0 : (t0.distance <= w0.distance + 0.05 ? t0 : w0);
  }
  weapon.firstHit = firstHit;
  let lastGap = 0;
  weapon.debugShoot = (input) => { if (weapon.ammo <= 0) weapon.ammo = MAG; seenShot = false; try { shoot(input); } finally { seenShot = true; } return weapon.lastShot; };
  // A drag after a shot means the player is controlling the muzzle: drop the pending recoil recovery (no drift back).
  weapon.cancelRecoil = function cancelRecoil() { recoil = 0; recTot = 0; drP = drY = 0; weapon.recoverT = 1; drDone = 1; };
  function pushAmmo() { const h = window.SS && window.SS.hud; if (h && h.setAmmo) h.setAmmo(weapon.ammo, weapon.reserve); }
  weapon.update = function update(dt, input) {
    frameShots = 0;
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
        { const take = Math.min(MAG - weapon.ammo, weapon.reserve); weapon.ammo += take; weapon.reserve -= take; pushAmmo(); }
        if (weapon.onReload) weapon.onReload('end');
        { const h = window.SS && window.SS.hud; if (h && h.hintText === 'Emergency magazine' && h.hint) h.hint(''); } // message ends with the reload
      }
    } else if (input.reloadPressed) {
      startReload();
    } else if (weapon.ammo <= 0) {
      // Ammo floor (tester: 0/0 dead end): an empty rifle with no reserve gets one emergency magazine.
      if (weapon.reserve <= 0) { weapon.reserve = MAG; weapon.emergencyRefills = (weapon.emergencyRefills | 0) + 1; if (window.SS && window.SS.hud && window.SS.hud.hint) window.SS.hud.hint('Emergency magazine'); }
      startReload();
    }

    // Recoil recovery: return the kicked pitch toward where the player aimed (no upward creep).
    // b1: timed in real time (at a 1.6 s frame gap it simply lands at the end); a drag cancels it (cancelRecoil from input).
    if (recoil > 0 || drDone < 1) { const u = Math.min(1, (performance.now() - recT0) / recDur), k = u * u * (3 - 2 * u); weapon.recoverT = k;
      if (recoil > 0) { const r = Math.min(recoil, Math.max(0, recTot * k - recDone)); recDone += r; recoil -= r; if (u >= 1) { recDone += recoil; input.pitch += recoil; recoil = 0; } input.pitch = Math.min(PITCH_LIMIT, input.pitch + r); }
      const dk = k - drDone; if (dk > 0) { input.pitch = Math.max(-PITCH_LIMIT, Math.min(PITCH_LIMIT, input.pitch + drP * dk)); input.yaw += drY * dk; drDone = k; } }
    // On-target check for the crosshair (same cone as the aim assist).
    // Red crosshair = the actual hit ray (same firstHit the shot uses) is on an enemy; was an angle cone around part
    // origins, which turned red over cover/doorways the shot could not pass (tester: red crosshair, 110 rounds, no kill).
    { camera.updateMatrixWorld(); camera.getWorldDirection(_dir); camera.getWorldPosition(_origin); const h = firstHit(_origin, _dir);
      weapon.onTarget = !!(h && h.object.userData && h.object.userData.enemy); weapon.onTargetName = h ? (h.object.name || h.object.type) : null; }
    // Fire cadence runs on the real-time clock (sim dt is capped at low fps, which starved held FIRE).
    { const now = performance.now(); const rdt = lastUpd ? Math.min(0.5, (now - lastUpd) / 1000) : dt; lastGap = lastUpd ? (now - lastUpd) / 1000 : 0; lastUpd = now; cooldown -= rdt; }
    // m1w: shots only in a frame's FIRST sim step: catch-up steps 2-4 run after fighters moved, so a shot there tested
    // positions the player never saw (scoped misses on moving fighters at low fps). Timers/recoil still run every step.
    if (window.SS && (window.SS.subStep | 0) > 0) { pushAmmo(); return; }
    // m1y: queued clicks expire by EVENT time: older than max(1.5 s, 3.5 frames) they no longer fire (a click held back by
    // a reload/cooldown or 1-2 s of input lag fired late, mid-drag). Only clicks queued by input.js carry times.
    if (input.tapT && input.tapT.length) { const ttl = Math.max(1500, 3500 * lastGap, 3.5 * ((input.gapMs) || 0)), nowE /* b1: update() runs per sim substep, so lastGap is ~0 after the first substep of a slow frame; at 0.6 fps that expired real taps (gapMs = real frame gap) */ = performance.now(); // a click waits up to ~1 frame for its handler and ~1 frame of busy frame before the sim sees it
      while (input.tapT.length && (input.pendingShots | 0) > 0 && nowE - input.tapT[0] > ttl) { input.tapT.shift(); input.pendingShots -= 1; input.tapsExpired = (input.tapsExpired | 0) + 1; }
      if ((input.pendingShots | 0) <= 0) input.tapT.length = 0; }
    // Drain queued still-clicks one per cooldown slot so rapid taps never drop every other shot.
    // m1v: at low fps every queued click fires this frame (each was a separate real-time click; one per frame dropped/lagged them)
    // m1y: a tap made while (or just before) a reload starts is spent on nothing; it must not fire seconds later
    if (weapon.reloading && (input.pendingShots | 0) > 0) { input.tapsExpired = (input.tapsExpired | 0) + input.pendingShots; input.pendingShots = 0; if (input.tapT) input.tapT.length = 0; }
    { const slowFrame = lastGap > SHOT_INTERVAL * 2; for (let n = 0; n < 8 && (input.pendingShots | 0) > 0 && !weapon.reloading && weapon.ammo > 0 && (cooldown <= 0 || (slowFrame && n > 0)); n++) { input.pendingShots -= 1; if (input.tapT && input.tapT.length > input.pendingShots) input.tapT.shift(); shoot(input); } }
    if ((input.pendingShots | 0) > 0 && weapon.ammo <= 0 && !weapon.reloading) {
      input.pendingShots = 0; if (input.tapT) input.tapT.length = 0; // empty mag: drop queue (reload will start)
    }
    if (input.pollFire) input.pollFire();
    // Swallow the Play press (tester: clicking Play fired a round): nothing fires in the first 500 ms of a run.
    if (window.SS && window.SS.startedAt && performance.now() - window.SS.startedAt < 500) { input.pendingShots = 0; input.hold = null; if (input.holdQ) input.holdQ.length = 0; input.fire = false; }
    // FIRE-button hold timeline (input.hold): fire every round the hold has earned at the rifle's rate since it began,
    // up to 6 per frame. While reloading/empty nothing is owed beyond one round, so firing resumes the moment the
    // reload ends with FIRE still held.
    // m1v: every queued tap is processed THIS frame (at ~1 fps several taps arrive between two frames; one tap per frame
    // lagged them by seconds and the target had moved/ducked by then). Up to 8 rounds per frame.
    for (let hq = 0, fired0 = weapon.shotsFired; hq < 8 && weapon.shotsFired - fired0 < 8; hq++) { const H = input.hold; const I = SHOT_INTERVAL * 1000; if (!H) { if (input.holdQ && input.holdQ.length) { input.hold = input.holdQ.shift(); continue; } break; }
      if (H) { if (H.id !== holdId) { holdId = H.id; holdFired = 0; holdBase = H.start; }
        const now = performance.now(), until = H.end || now, blocked = weapon.reloading || weapon.ammo <= 0;
        // Reloading/empty: owe nothing, and resume one interval after the reload ends (tester: a round fired as the
        // reload finished, so 0/150 became 29/120). A hold released during the reload is simply over.
        if (blocked && H.end) input.hold = null; else if (blocked) { holdBase = Math.max(holdBase, now - (holdFired - 1) * I); }
        if (input.hold) { const owed = 1 + Math.floor((until - holdBase) / I);
        for (let n = 0; n < 6 && holdFired < owed && !weapon.reloading && weapon.ammo > 0; n++) { shoot(input); holdFired++; }
        if (H.end && (holdFired >= owed || now - H.end > 3000)) input.hold = null; }
        weapon.holdFired = holdFired; }
      if (input.hold) break; // a hold still running (FIRE held) continues next frame
      if (input.holdQ && input.holdQ.length) input.hold = input.holdQ.shift(); else break; } // next queued tap: same frame
    for (let n = 0; n < 4; n++) { const wants = input.fire && !weapon.reloading && weapon.ammo > 0; if (!(wants && cooldown <= 0)) break; shoot(input); }
    if (!input.fire && (input.pendingShots | 0) <= 0 && cooldown < 0) cooldown = 0; // no stored burst while idle
  };

  weapon.reloadProgress = () => weapon.reloading ? Math.max(0, Math.min(1, 1 - (reloadEnd - performance.now()) / (RELOAD_TIME * 1000))) : 0;
  weapon.reset = function reset() {
    weapon.ammo = MAG; weapon.reserve = RESERVE_START;
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
