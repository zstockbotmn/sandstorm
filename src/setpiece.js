import * as THREE from 'three';

const FLIGHT_S = 1.1, FLIGHT_MS = 900, PUFF_N = 40;

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
  const tex = roundTex(), geo = new THREE.PlaneGeometry(1, 1);
  const puff = (color, opacity) => new THREE.MeshBasicMaterial({
    map: tex, color, transparent: true, opacity, side: THREE.DoubleSide,
    depthWrite: false, fog: false, toneMapped: false,
  });
  const puffs = [];
  for (let i = 0; i < PUFF_N; i++) {
    const mat = puff(0x9a948a, 0), mesh = new THREE.Mesh(geo, mat);
    mesh.visible = false; mesh.frustumCulled = false; scene.add(mesh);
    puffs.push({ mesh, mat, life: 0 });
  }
  const flashMat = puff(0xfff4cc, 1), flash = new THREE.Mesh(geo, flashMat);
  flash.visible = false; flash.frustumCulled = false; scene.add(flash);
  let flashLife = 0, flashDur = 0.15;
  const dark = new THREE.MeshBasicMaterial({ color: 0x2a2622, fog: false });
  const rocket = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.7, 8), dark);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.26, 8), dark);
  nose.position.y = 0.48; body.frustumCulled = nose.frustumCulled = false;
  rocket.add(body, nose); rocket.visible = false; rocket.frustumCulled = false; scene.add(rocket);
  const glow = new THREE.Mesh(geo, puff(0xff6414, 0.95));
  glow.scale.setScalar(0.42); glow.visible = false; glow.frustumCulled = false; scene.add(glow);
  const launch = new THREE.Vector3(), target = new THREE.Vector3();
  const prev = new THREE.Vector3(), pos = new THREE.Vector3();
  const dir = new THREE.Vector3(), tmp = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), yAxis = new THREE.Vector3(0, 1, 0);
  const state = { wave: 0, rpgs: 0, flying: false };
  const forced = /[?&]rpg=1\b/.test(location.search);
  let wasBurst = false, waveT = 0, firedWave = false, lastAt = -1e9;
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
    s.life = 1.6; s.mesh.visible = true; s.mesh.position.copy(p);
    s.mesh.scale.setScalar(0.25); s.mat.opacity = 0.6; s.mesh.lookAt(camera.position);
  }
  function trail(a, b) {
    dir.subVectors(b, a);
    const dist = dir.length();
    if (!(dist > 1e-5)) return;
    let walked = 0, n = 0;
    while (walked < dist && smokeAcc + (dist - walked) >= 0.6 && n++ < 70) {
      walked += 0.6 - smokeAcc;
      spawnSmoke(tmp.copy(a).addScaledVector(dir, walked / dist));
      smokeAcc = 0;
    }
    smokeAcc = Math.max(0, smokeAcc + (dist - walked));
  }
  function showFlash(p, size, dur) {
    flash.position.copy(p); flash.scale.setScalar(size); flash.lookAt(camera.position);
    flashLife = flashDur = dur; flashMat.opacity = 1; flash.visible = true;
  }
  function aimRocket(at) {
    dir.subVectors(target, launch);
    if (dir.lengthSq() < 1e-8) return;
    dir.normalize(); rocket.quaternion.setFromUnitVectors(yAxis, dir); rocket.position.copy(at);
    glow.position.copy(at).addScaledVector(dir, -0.4); glow.lookAt(camera.position); glow.visible = true;
  }
  function publish() { if (window.SS) window.SS.setpiece = { rpgs: state.rpgs, lastRpg: rec }; }
  function launchNow(sim) {
    const side = Math.random() < 0.5 ? -1 : 1;
    launch.set(side * (5.2 + Math.random() * 1.5), 5.5 + Math.random() * 3.5, camera.position.z - (24 + Math.random() * 14));
    const dx = launch.x - camera.position.x, dz = launch.z - camera.position.z, h = Math.hypot(dx, dz) || 1;
    const sway = (Math.random() - 0.5) * 2, ix = dx / h, iz = dz / h;
    target.set(camera.position.x + ix * 2.8 - iz * sway, 0.3 + Math.random() * 0.6, camera.position.z + iz * 2.8 + ix * sway);
    flying = state.flying = true; launchSim = sim; launchR = performance.now();
    warned = false; smokeAcc = 0; prev.copy(launch); rocket.visible = true; aimRocket(launch);
    showFlash(launch, 1.6, 0.15);
    tmp.subVectors(launch, target).setY(0); if (tmp.lengthSq() < 1e-6) tmp.set(0, 0, 1); tmp.normalize();
    spawnSmoke(pos.copy(launch).addScaledVector(tmp, 0.9));
    spawnSmoke(pos.copy(launch).addScaledVector(tmp, 1.7));
    const a = clip();
    if (a && a.crack) a.crack(launch.clone());
    if (a && a.whoosh) a.whoosh(launch.clone(), 1.1);
    if (hud && hud.callout) hud.callout('RPG!', true);
    if (hud && hud.edgeWarn) hud.edgeWarn(angleTo(launch));
    state.rpgs += 1; firedWave = true; lastAt = sim;
    rec = { launchSim: sim, launchR, impactSim: null, impactR: null, dmg: 0, hpBefore: player.health, dist: 0 };
    publish();
    return rec;
  }
  function impact(sim) {
    flying = state.flying = false; rocket.visible = false; glow.visible = false;
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
    const raw = 34 * (1 - d / 6);
    const dmg = Math.max(0, Math.min(raw, 30, hpBefore - 5));
    if (rec) { rec.impactSim = sim; rec.impactR = performance.now(); rec.dmg = dmg; rec.hpBefore = hpBefore; rec.dist = d; }
    publish();
    // Duck does not cancel a warned blast; the cap leaves at least 5 hp.
    if (dmg > 0 && player.damage) player.damage(dmg, target.clone(), 'rpg');
  }
  function stepFlight(sim) {
    const simElapsed = sim - launchSim, realElapsedMs = performance.now() - launchR;
    // Min of the two clocks: a 1 fps step cannot launch and impact before two paints.
    let k = Math.min(simElapsed / FLIGHT_S, realElapsedMs / FLIGHT_MS);
    if (k < 0) k = 0; else if (k > 1) k = 1;
    pos.lerpVectors(launch, target, k);
    if (!warned && simElapsed >= 0.5) { warned = true; if (hud && hud.edgeWarn) hud.edgeWarn(angleTo(launch)); }
    trail(prev, pos); prev.copy(pos); aimRocket(pos);
    if (k >= 1) impact(sim);
  }
  function stepVfx(dt) {
    if (flashLife > 0) {
      flashLife -= dt; flashMat.opacity = Math.max(0, flashLife / (flashDur || 1)); flash.lookAt(camera.position);
      if (flashLife <= 0) flash.visible = false;
    }
    for (let i = 0; i < PUFF_N; i++) {
      const s = puffs[i];
      if (s.life <= 0) continue;
      s.life -= dt;
      const u = Math.max(0, s.life / 1.6);
      s.mesh.scale.setScalar(0.25 + 0.65 * (1 - u)); s.mat.opacity = 0.6 * u; s.mesh.lookAt(camera.position);
      if (s.life <= 0) s.mesh.visible = false;
    }
  }
  function update(dt) {
    const SS = window.SS || {}, sim = SS.simTime || 0, bursting = !!SS.bursting;
    if (bursting && !wasBurst) { state.wave += 1; waveT = sim; firedWave = false; }
    wasBurst = bursting;
    if (flying) stepFlight(sim);
    stepVfx(dt || 0);
    const waveOn = !!(SS.running && player.alive && bursting && ((SS.engaged | 0) > 0));
    if (flying || !waveOn || firedWave || sim - waveT < 6) return;
    if (forced) { launchNow(sim); return; }
    if (state.wave >= 2 && sim - lastAt >= 45 && Math.random() < (dt || 0) * 0.12) launchNow(sim);
  }
  function debugRpg() { return launchNow((window.SS && window.SS.simTime) || 0); }
  return { update, debugRpg, state };
}
