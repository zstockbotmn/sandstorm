import * as THREE from 'three';
import { createTruckMoment } from './setpiece-truck.js';
import { createAmbient } from './setpiece-ambient.js';
const RPG_FLANK_LULL_S = 6; // A14: game-s after a rifle flank hit before any RPG launch (forced too)

const FLIGHT_S = 1.1, FLIGHT_MS = 900, PUFF_N = 72, PUFF_LIFE = 2.6, PUFF_STEP = 0.35; // A9: thicker, longer trail (reads at 24-38 m on Low)

function roundTex() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.4, 'rgba(255,255,255,0.45)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function createSetPieces({ scene, camera, player, hud }) {
  const truck = createTruckMoment({ scene, camera, player, hud });
  const ambient = createAmbient({ scene, camera, hud });
  const tex = roundTex(), geo = new THREE.PlaneGeometry(1, 1);
  const puff = (color, opacity) => new THREE.MeshBasicMaterial({
    map: tex, color, transparent: true, opacity, side: THREE.DoubleSide,
    depthWrite: false, fog: false, toneMapped: false,
  });
  const puffs = [];
  for (let i = 0; i < PUFF_N; i++) {
    const mat = puff(0x4f4943, 0), mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false; mesh.frustumCulled = false; scene.add(mesh);
    puffs.push({ mesh, mat, life: 0 });
  }
  const flashMat = puff(0xffa63a, 1) /* A10: hot orange - the pale flash vanished on beige facades and sky */, flash = new THREE.Mesh(geo, flashMat);
  flash.visible = false; flash.frustumCulled = false; scene.add(flash);
  let flashLife = 0, flashDur = 0.15, flashHoldR = 0, flashHoldF = 0;
  // A10: the shooter - a cheap dark silhouette with the tube on its shoulder, shown from launch to ~1.2 s after impact
  const shooterMat = new THREE.MeshBasicMaterial({ color: 0x1f1b18, fog: false });
  const shooter = new THREE.Group(); { const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.95, 0.3), shooterMat); b.position.y = 0.95;
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), shooterMat); h.position.y = 1.6;
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 1.15, 8), shooterMat); tube.rotation.x = Math.PI / 2; tube.position.set(0.18, 1.45, 0); tube.name = 'tube';
    shooter.add(b, h, tube); shooter.traverse((o) => { o.frustumCulled = false; }); shooter.visible = false; scene.add(shooter); }
  let shooterUntilR = 0;
  const dark = new THREE.MeshBasicMaterial({ color: 0x2a2622, fog: false });
  const rocket = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8), dark);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 8), dark);
  nose.position.y = 0.48; body.frustumCulled = nose.frustumCulled = false;
  rocket.scale.setScalar(1.6); // A9: bigger body
  rocket.add(body, nose); rocket.visible = false; rocket.frustumCulled = false; scene.add(rocket);
  // A9: motor glow = a bright core + a wide orange halo, sized with distance so it stays ~25-40 px at 24-38 m
  const glow = new THREE.Mesh(geo, puff(0xffd070, 1)); const halo = new THREE.Mesh(geo, puff(0xff7a20, 0.55));
  halo.visible = false; halo.frustumCulled = false; scene.add(halo);
  glow.scale.setScalar(0.42); glow.visible = false; glow.frustumCulled = false; scene.add(glow);
  const launch = new THREE.Vector3(), target = new THREE.Vector3();
  const prev = new THREE.Vector3(), pos = new THREE.Vector3();
  const dir = new THREE.Vector3(), tmp = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), yAxis = new THREE.Vector3(0, 1, 0);
  const state = { wave: 0, rpgs: 0, flying: false };
  const forced = /[?&]rpg=1\b/.test(location.search);
  const FORCED_ANY = forced || /[?&]truck=1\b/.test(location.search); // A14: the director is random mode only
  let wasBurst = false, waveT = 0, firedWave = false, lastAt = -1e9, fireAt = -1;
  let flying = false, launchSim = 0, launchR = 0, smokeAcc = 0, warned = false, rec = null;
  const clip = () => (window.SS && window.SS.audio) || null;
  const fx = () => (window.SS && window.SS.fx) || null;

  function angleTo(p) {
    const yaw = (window.SS && window.SS.input && window.SS.input.yaw) || 0;
    const dx = p.x - camera.position.x, dz = p.z - camera.position.z;
    return Math.atan2(dx * Math.cos(yaw) + dz * Math.sin(yaw), dx * Math.sin(yaw) - dz * Math.cos(yaw));
  }
  function spawnSmoke(p) {
    let s = puffs[0];
    for (let i = 0; i < PUFF_N; i++) if (puffs[i].life <= 0) { s = puffs[i]; break; }
    s.life = PUFF_LIFE; s.mesh.visible = true; s.mesh.position.copy(p);
    s.mesh.scale.setScalar(1.0); s.mat.opacity = 0.75; s.mesh.lookAt(camera.position);
  }
  function trail(a, b) {
    dir.subVectors(b, a);
    const dist = dir.length();
    if (!(dist > 1e-5)) return;
    let walked = 0, n = 0;
    while (walked < dist && smokeAcc + (dist - walked) >= PUFF_STEP && n++ < 120) {
      walked += PUFF_STEP - smokeAcc;
      spawnSmoke(tmp.copy(a).addScaledVector(dir, walked / dist));
      smokeAcc = 0;
    }
    smokeAcc = Math.max(0, smokeAcc + (dist - walked));
  }
  function showFlash(p, size, dur) {
    flash.position.copy(p); flash.scale.setScalar(size); flash.lookAt(camera.position);
    flashLife = flashDur = dur; flashMat.opacity = 1; flash.visible = true;
    flashHoldR = performance.now() + 250; flashHoldF = ((window.SS && window.SS.frameN) | 0) + 2; // A10: full strength >= 250 ms AND >= 2 painted frames
  }
  function aimRocket(at) {
    dir.subVectors(target, launch);
    if (dir.lengthSq() < 1e-8) return;
    dir.normalize(); rocket.quaternion.setFromUnitVectors(yAxis, dir); rocket.position.copy(at);
    glow.position.copy(at).addScaledVector(dir, -0.7); glow.lookAt(camera.position); glow.visible = true;
    const gd = Math.max(1, camera.position.distanceTo(at)), fl = 0.85 + 0.3 * Math.random();
    glow.scale.setScalar(Math.max(0.5, gd * 0.022) * fl); halo.position.copy(glow.position); halo.lookAt(camera.position); halo.scale.setScalar(Math.max(1.1, gd * 0.055) * fl); halo.visible = true;
  }
  function publish() { if (window.SS) window.SS.setpiece = { rpgs: state.rpgs, lastRpg: rec }; }
  // A9: the launch point is found on the real street, never inside a collider: a horizontal ray finds the facade on one
  // side at 6 m up; a down ray finds its roof. Low roof -> rooftop edge, tall -> a window 0.6 m out from the wall, no wall
  // within 12 m -> an alley mouth at street level. Rejected if inside any collider box or without a clear line to the target.
  const ray = new THREE.Raycaster(), _o = new THREE.Vector3(), _d = new THREE.Vector3(), _bx = new THREE.Box3();
  function cols() { const w = window.SS && window.SS.world; return (w && (w.shotList ? w.shotList() : w.colliders)) || []; }
  function firstHit(o, d, far, list) { ray.set(o, d); ray.near = 0; ray.far = far; const h = ray.intersectObjects(list, false); return h.length ? h[0] : null; }
  function insideAny(p) { const w = window.SS && window.SS.world, list = (w && w.colliders) || []; for (const m of list) { if (!m.geometry) continue; _bx.setFromObject(m); _bx.expandByScalar(0.15); if (_bx.containsPoint(p)) return true; } return false; } // box colliders only (cheap)
  // A10 variety: 40% of the time (ducked behind real cover) the rocket hits the cover top on the enemy side - debris shower,
  // 25-30 dmg; otherwise the ground 1.2-4.2 m from the player toward the shooter (30 -> 10 dmg with distance).
  let aimCover = false;
  const _head = new THREE.Vector3(), _dir = new THREE.Vector3(), _hp = new THREE.Vector3(), _fwdN = new THREE.Vector3(0, 0.3, -1).normalize(), _ray = new THREE.Ray(), _box = new THREE.Box3();
  function pickTarget() { const cv = window.SS && window.SS.cover, sf = cv && cv.state === 'in' && cv.surface;
    if (sf && aimCover) { target.set(Math.max(sf.min.x + 0.2, Math.min(sf.max.x - 0.2, camera.position.x + (Math.random() - 0.5) * 0.8)), sf.max.y - 0.05, sf.min.z + 0.15); return; }
    const dx = launch.x - camera.position.x, dz = launch.z - camera.position.z, h = Math.hypot(dx, dz) || 1, sway = (Math.random() - 0.5) * 1.6, ix = dx / h, iz = dz / h, r = 1.2 + Math.random() * 3.0;
    target.set(camera.position.x + ix * r - iz * sway, 0.3 + Math.random() * 0.5, camera.position.z + iz * r + ix * sway); }
  function pickLaunch() { const list = cols(); let kind = 'street';
    for (let t = 0; t < 8; t++) { const side = Math.random() < 0.5 ? -1 : 1, z = camera.position.z - (24 + Math.random() * 14);
      const wall = list.length ? firstHit(_o.set(0, 6, z), _d.set(side, 0, 0), 12, list) : null;
      if (wall) { const hx = wall.point.x, roof = firstHit(_o.set(hx + side * 0.6, 60, z), _d.set(0, -1, 0), 60, list), top = roof ? roof.point.y : 0;
        if (roof && top > 3 && top < 10) { launch.set(hx - side * 0.35, top + 0.9, z); kind = 'roof'; } else { launch.set(hx - side * 0.6, 5.5 + Math.random() * 2.5, z); kind = 'window'; } }
      else { launch.set(side * 5.2, 1.6, z); kind = 'alley'; }
      if (insideAny(launch)) continue;
      pickTarget(); _d.subVectors(target, launch); const L = _d.length(); _d.divideScalar(L);
      const blk = list.length ? firstHit(_o.copy(launch).addScaledVector(_d, 0.3), _d, Math.max(0.1, L - 1.6), list) : null; if (blk) continue;
      return kind; }
    launch.set(0, 2.2, camera.position.z - 30); pickTarget(); return 'street'; } // last resort: down the middle of the street
  let whooshed = false;
  function launchNow(sim) {
    { const cv = window.SS && window.SS.cover; aimCover = !!(cv && cv.state === 'in' && cv.surface && Math.random() < 0.4); }
    const lkind = pickLaunch(); whooshed = false; if (window.SS) window.SS.setPieceAt = sim; try { window.SS.enemies.spLog('rpg'); } catch (_) {} // A15 spacing check
    flying = state.flying = true; launchSim = sim; launchR = performance.now();
    warned = false; smokeAcc = 0; prev.copy(launch); rocket.visible = true; aimRocket(launch);
    showFlash(launch, 2.4, 0.3);
    tmp.subVectors(launch, target).setY(0); if (tmp.lengthSq() < 1e-6) tmp.set(0, 0, 1); tmp.normalize();
    // back-blast: a puff cloud behind the tube + dust at the shooter's feet (A10)
    for (let i = 0; i < 5; i++) spawnSmoke(pos.copy(launch).addScaledVector(tmp, 0.6 + i * 0.45).add(_o.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.3) * 0.5, (Math.random() - 0.5) * 0.5)));
    { const f = fx(); if (f && f.impact) for (let i = 0; i < 2; i++) f.impact(pos.copy(launch).addScaledVector(tmp, 0.5).setY(launch.y - 1.4 + Math.random() * 0.3), up, null); }
    shooter.position.copy(launch).addScaledVector(tmp, 0.25); shooter.position.y = launch.y - 1.45; shooter.lookAt(_o.set(target.x, shooter.position.y, target.z)); shooter.visible = true; shooterUntilR = 0;
    const a = clip();
    if (a && a.thump) a.thump(launch.clone()); else if (a && a.crack) a.crack(launch.clone()); // whoosh follows 0.3 s later (stepFlight)
    if (hud && hud.callout) hud.callout('RPG!', true);
    if (hud && hud.edgeWarn) hud.edgeWarn(angleTo(launch));
    state.rpgs += 1; firedWave = true; lastAt = sim;
    rec = { launchSim: sim, launchR, impactSim: null, impactR: null, dmg: 0, hpBefore: player.health, dist: 0, kind: lkind, from: [+launch.x.toFixed(1), +launch.y.toFixed(1), +(launch.z - camera.position.z).toFixed(1)] };
    publish();
    return rec;
  }
  function impact(sim) {
    flying = state.flying = false; rocket.visible = false; glow.visible = false; halo.visible = false;
    const f = fx();
    if (f && f.blast) f.blast(target.clone());
    if (f && f.impact) for (let i = 0; i < 3; i++) {
      tmp.copy(target);
      tmp.x += (Math.random() - 0.5) * 1.2; tmp.y += Math.random() * 0.35; tmp.z += (Math.random() - 0.5) * 1.2;
      f.impact(tmp.clone(), up, null);
    }
    showFlash(target, 2.5, 0.2);
    const a = clip();
    if (a && a.boom) a.boom(target.clone());
    else if (a && a.enemyShot) a.enemyShot(target.clone());
    const hpBefore = player.health;
    const d = Math.hypot(camera.position.x - target.x, camera.position.z - target.z);
    // A10: 30 at <= 1 m -> 10 at 4.4 m. A11: + jitter (+-4) so the same spot never reads as a fixed number; a cover hit is
    // judged from the cover lip (the player is ~0.8 m behind it) and rolls 18-30. Clamped 10-30, 5 HP floor below.
    let raw = d > 4.4 ? 0 : 27 - 17 * Math.max(0, Math.min(1, (d - 1.0) / 3.4)) + (Math.random() * 6 - 3);
    if (aimCover) raw = 18 + Math.random() * 12;
    if (raw > 0) raw = Math.max(10, Math.min(30, raw));
    // A13 (PM: RPG vs cover): IN COVER with the cover box between the blast and the head, the sandbags take most of it -
    // ~45% (40-50%) of the roll, a dust burst + debris off the cover top and front, log '(RPG, cover)'. Out of cover or
    // from a flank (the head ray misses the box) it stays full. Cap 30 and the 5 HP floor still apply after the scale.
    let shielded = false; { const cv = window.SS && window.SS.cover, sf = cv && cv.state === 'in' && cv.surface;
      if (sf && raw > 0) { _head.copy(camera.position); _box.copy(sf).expandByScalar(0.05); _dir.subVectors(_head, target); const len = _dir.length();
        if (len > 1e-3) { _ray.set(target, _dir.multiplyScalar(1 / len)); const hit = _box.containsPoint(target) || _ray.intersectBox(_box, _hp); shielded = !!hit && (_box.containsPoint(target) || target.distanceTo(_hp) < len); }
        // or by facing: ducked behind it and the blast on its enemy side (z <= the near face) within its width + 1.5 m
        if (!shielded && window.SS.input && window.SS.input.cover && target.z <= sf.max.z + 0.1 && target.x > sf.min.x - 1.5 && target.x < sf.max.x + 1.5) shielded = true;
        if (shielded) { raw *= 0.4 + Math.random() * 0.1;
          if (f && f.dust) { tmp.set(Math.max(sf.min.x, Math.min(sf.max.x, target.x)), sf.max.y + 0.05, Math.max(sf.min.z, Math.min(sf.max.z, target.z))); f.dust(tmp.clone(), up, 10, 0x8a7a62);
            tmp.z = sf.min.z - 0.05; tmp.y = (sf.min.y + sf.max.y) * 0.5; f.dust(tmp.clone(), _fwdN, 8, 0x8a7a62); }
          if (f && f.debris) { tmp.set(Math.max(sf.min.x, Math.min(sf.max.x, target.x)), sf.max.y, (sf.min.z + sf.max.z) * 0.5); f.debris(tmp.clone(), up, 8); tmp.z = sf.min.z - 0.05; f.debris(tmp.clone(), _fwdN, 5); } } } }
    const dmg = raw > 0 ? Math.max(0, Math.min(raw, 30, hpBefore - 5)) : 0;
    if (rec) { rec.aim = aimCover ? 'cover' : 'ground'; rec.shielded = shielded; }
    if (aimCover && f && f.impact) for (let i = 0; i < 5; i++) { tmp.copy(target); tmp.x += (Math.random() - 0.5) * 1.4; tmp.y += Math.random() * 0.2; f.impact(tmp.clone(), up, null); } // cover hit: debris shower
    if (window.SS) window.SS.setPieceAt = sim; shooterUntilR = performance.now() + 1200;
    if (rec) { rec.impactSim = sim; rec.impactR = performance.now(); rec.dmg = dmg; rec.hpBefore = hpBefore; rec.dist = d; }
    publish();
    // Duck does not cancel a warned blast; the cap leaves at least 5 hp.
    if (dmg > 0 && player.damage) player.damage(dmg, target.clone(), shielded ? 'rpg-cover' : 'rpg');
  }
  function stepFlight(sim) {
    const simElapsed = sim - launchSim, realElapsedMs = performance.now() - launchR;
    // Min of the two clocks: a 1 fps step cannot launch and impact before two paints.
    let k = Math.min(simElapsed / FLIGHT_S, realElapsedMs / FLIGHT_MS);
    if (k < 0) k = 0; else if (k > 1) k = 1;
    pos.lerpVectors(launch, target, k);
    if (!warned && simElapsed >= 0.5) { warned = true; if (hud && hud.edgeWarn) hud.edgeWarn(angleTo(launch)); }
    if (!whooshed && realElapsedMs >= 300 && simElapsed >= 0.25) { whooshed = true; const a = clip(); if (a && a.whoosh) a.whoosh(pos.clone(), Math.max(0.4, FLIGHT_S - simElapsed)); } // A10: thump, then the whoosh as it approaches
    trail(prev, pos); prev.copy(pos); aimRocket(pos);
    if (k >= 1) impact(sim);
  }
  let vfxR = 0;
  function stepVfx(dt) {
    // A9: real-time floor - at 2-5 fps a sim step can be ~0.5 s, which killed the trail before it was ever painted
    const nowR = performance.now(), rdt = vfxR ? (nowR - vfxR) / 1000 : dt; vfxR = nowR; dt = Math.min(dt, Math.max(0, rdt));
    if (flashLife > 0) {
      if (nowR < flashHoldR || ((window.SS && window.SS.frameN) | 0) < flashHoldF) { flashMat.opacity = 1; flash.lookAt(camera.position); } else {
      flashLife -= dt; flashMat.opacity = Math.max(0, flashLife / (flashDur || 1)); flash.lookAt(camera.position); }
      if (flashLife <= 0) flash.visible = false;
    }
    if (shooter.visible && shooterUntilR && nowR > shooterUntilR) shooter.visible = false;
    for (let i = 0; i < PUFF_N; i++) {
      const s = puffs[i];
      if (s.life <= 0) continue;
      s.life -= dt;
      const u = Math.max(0, s.life / PUFF_LIFE);
      s.mesh.scale.setScalar(1.0 + 1.6 * (1 - u)); s.mat.opacity = 0.75 * Math.min(1, u * 1.6); s.mesh.lookAt(camera.position);
      if (s.life <= 0) s.mesh.visible = false;
    }
  }
  let starvedAt = null, prevWaveT = 0;
  function update(dt) {
    const SS = window.SS || {}, sim = SS.simTime || 0, bursting = !!SS.bursting;
    if (bursting && !wasBurst) { state.wave += 1; prevWaveT = waveT; waveT = sim; firedWave = false; // A10: a random moment in the wave (4-18 s), ~65% of waves from wave 2; ?rpg=1 keeps 6 s every wave
      // A14 (tester: truck -> RPG every wave, predictable): random mode has a per-wave DIRECTOR - wave 1 quiet, then each
      // wave picks one of rpg / grenade (an earlier camping grenade) / truck / quiet, never the same as the last wave, at a
      // varied moment. Forced flags (rpg=1 / truck=1) bypass it and behave as before. SS.spPick = { wave, pick, hist }.
      if (!FORCED_ANY) { const hist = state.wave <= 1 ? [] : ((SS.spPick && SS.spPick.hist) || []), last = hist[hist.length - 1];
        let pick = 'quiet';
        // A15a: no repeat of last wave's pick NOR of any set piece that actually happened last wave (a long-camp grenade counts).
        const did = new Set((SS.spLog || []).filter((x) => x.sim >= prevWaveT && x.sim < sim).map((x) => x.kind)); SS.spLastDid = [...did];
        if (state.wave >= 2) { const W = { rpg: 0.3, grenade: 0.3, truck: 0.25, quiet: 0.15 }; if (last) delete W[last]; for (const k of did) delete W[k];
          // A16 (PM: no truck in the A15 run's 5 waves): a truck is due by wave 5 - x2.5 weight on wave 4, forced on wave 5 if allowed
          if (W.truck && !hist.includes('truck')) { if (state.wave >= 5) { for (const k in W) if (k !== 'truck') delete W[k]; } else if (state.wave === 4) W.truck *= 2.5; }
          let tot = 0; for (const k in W) tot += W[k]; let r = Math.random() * tot; for (const k in W) { r -= W[k]; if (r <= 0) { pick = k; break; } } }
        hist.push(pick); if (hist.length > 12) hist.shift(); SS.spPick = { wave: state.wave, pick, hist, sim };
        fireAt = pick === 'rpg' ? 10 + Math.random() * 16 : -1; } // A13 window 10-26 s kept
      else fireAt = forced ? 6 : (state.wave >= 2 && sim - lastAt >= 45 && Math.random() < 0.65) ? 10 + Math.random() * 16 : -1; } // A13: random mode 10-26 s (middle / late wave; it may fire after the spawn window now)
    wasBurst = bursting;
    if (flying) stepFlight(sim);
    stepVfx(dt || 0);
    truck.update(dt || 0, sim);
    ambient.update(dt || 0, sim);
    // A12 (tester: no RPG at all in waves 1-5 with rpg=1&truck=1): this needed SS.bursting, which is only the 8-14 s spawn
    // window, so anything that pushed the launch past it (the truck tell + crash, the 8 s shared gap after the crash or a
    // grenade, a starved grenade) cancelled it for the whole wave, and random fireAt 14-18 s could never fire. Now the RPG may
    // launch while the wave is alive (SS.waveActive: wave members left) and the player is engaged; it just waits for the gate.
    const waveOn = !!(SS.running && player.alive && (bursting || SS.waveActive) && ((SS.engaged | 0) > 0));
    if (flying || !waveOn || firedWave || fireAt < 0 || sim - waveT < fireAt) return;
    if (truck.state.phase === 'drive' || truck.state.phase === 'crash') return; // 5c: never an RPG on top of the truck tell
    // A13: truck waves - the RPG comes >= 12 s after the bail-out (measured from the bail, not the crash); none while the
    // wave's truck is still pending
    if (SS.truckPendingWave) return;
    if (SS.truckBailAt != null && SS.truckBailAt >= waveT - 0.5 && sim >= SS.truckBailAt && sim - SS.truckBailAt < 12) return;
    // A14 (tester: flank hit -> RPG 5.7 s later -> flank hit): no launch within RPG_FLANK_LULL_S game-s after a rifle flank
    // hit, forced mode too (replaces the A13 random-only 4.5 s rule). The launch waits; it is not cancelled.
    if (SS.lastFlankHitSim != null && sim - SS.lastFlankHitSim >= 0 && sim - SS.lastFlankHitSim < RPG_FLANK_LULL_S) { SS.rpgFlankWaits = (SS.rpgFlankWaits | 0) + 1; return; }
    if (SS.setPieceAt != null && sim - SS.setPieceAt >= 0 && sim - SS.setPieceAt < 15) return; // A15: >= 15 s between any two set pieces (RPG / truck / grenade; was 8)
    // A11: a starved camping grenade goes first (the forced RPG used to keep starving it). A12: but only for 6 s - with no
    // thrower in range the grenade can stay 'starved' for the rest of the wave, which cancelled the RPG (wave 3, rpg=1).
    if (SS.nadeStarved) { if (starvedAt == null) starvedAt = sim; if (sim - starvedAt < 6) return; } else starvedAt = null;
    launchNow(sim);
  }
  function debugRpg() { return launchNow((window.SS && window.SS.simTime) || 0); }
  function debugTruck() { return truck.debugTruck(); }
  function truckProbe() { return truck.probe(); }
  function debugAmbient(kind) { return ambient.debugAmbient(kind); }
  function trailStats() { let live = 0, vis = 0, op = 0, near = 1e9, far = 0; for (const q of puffs) { if (q.life > 0) live++; if (q.mesh.visible) { vis++; op = Math.max(op, q.mat.opacity); const d = q.mesh.position.distanceTo(camera.position); near = Math.min(near, d); far = Math.max(far, d); } } return { live, vis, op: +op.toFixed(2), near: +near.toFixed(1), far: +far.toFixed(1), inScene: !!puffs[0].mesh.parent }; }
  function probe(dist) { const f = new THREE.Vector3(); camera.getWorldDirection(f); const q = puffs[0]; q.life = 99; q.mesh.visible = true; q.mesh.position.copy(camera.getWorldPosition(new THREE.Vector3())).addScaledVector(f, dist || 4); q.mesh.scale.setScalar(1.5); q.mat.opacity = 0.85; q.mesh.lookAt(camera.position); return { pos: q.mesh.position.toArray().map((v) => +v.toFixed(1)), depthTest: q.mat.depthTest, layers: q.mesh.layers.mask, camLayers: camera.layers.mask, ro: q.mesh.renderOrder, parent: q.mesh.parent && q.mesh.parent.type }; }
  return { update, debugRpg, debugTruck, truckProbe, debugAmbient, state, trailStats, probe };
}
