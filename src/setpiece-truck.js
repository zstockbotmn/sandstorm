import * as THREE from 'three';
import { art } from './art.js';

const DRIVE_MS = 1300; // real-time floor so the tell cannot collapse inside one long frame

function glowMap() {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.4, 'rgba(255,255,255,0.45)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
}

export function createTruckMoment({ scene, camera, player, hud }) {
  const state = { wave: 0, count: 0, phase: 'idle' };
  const forced = /[?&]truck=1\b/.test(location.search);
  const up = new THREE.Vector3(0, 1, 0), tmp = new THREE.Vector3();
  let wasBurst = false, waveT = 0, delay = 2, firedWave = false, armed = false, seenRun = null, run = null, tex = null;

  function angleTo(p) {
    const yaw = (window.SS && window.SS.input && window.SS.input.yaw) || 0;
    const dx = p.x - camera.position.x, dz = p.z - camera.position.z;
    return Math.atan2(dx * Math.cos(yaw) + dz * Math.sin(yaw), dx * Math.sin(yaw) - dz * Math.cos(yaw));
  }
  function publish() { if (window.SS) window.SS.truckMoment = { count: state.count, last: run ? run.rec : null }; }
  function build() {
    const g = new THREE.Group(); g.name = 'truck_moment';
    let model = 'box';
    const kenney = art.done && art.get && art.get('truck_mil') ? art.staticInstance('truck_mil') : null;
    if (kenney) {
      art.fitToBox(kenney, 2.3, 2.5, 5.6, { keepAspect: true, alignLong: true });
      kenney.name = 'truck_mil'; kenney.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      g.add(kenney); model = 'kenney';
    } else {
      const bed = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.3, 3.6), new THREE.MeshStandardMaterial({ color: 0x6b5a3a, roughness: 0.82 }));
      const cab = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x3c4a3a, roughness: 0.82 }));
      bed.position.set(0, 0.65, -1); cab.position.set(0, 0.8, 1.7); bed.castShadow = cab.castShadow = true; g.add(bed, cab);
    }
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfff2c0, toneMapped: false, fog: false });
    const sph = new THREE.SphereGeometry(0.22, 8, 6);
    if (!tex) tex = glowMap();
    const gMat = new THREE.MeshBasicMaterial({ map: tex, color: 0xfff0b0, transparent: true, opacity: 0.7, depthWrite: false, fog: false, toneMapped: false, side: THREE.DoubleSide });
    const geo = new THREE.PlaneGeometry(1, 1), glows = [];
    for (const x of [-0.85, 0.85]) {
      const s = new THREE.Mesh(sph, lampMat); s.position.set(x, 1.0, 2.62); s.frustumCulled = false; g.add(s);
      const m = new THREE.Mesh(geo, gMat); m.position.set(x, 1.0, 2.78); m.scale.setScalar(1.4); m.frustumCulled = false; m.renderOrder = 2; g.add(m); glows.push(m);
    }
    let spot = null;
    if (window.SS && window.SS.quality === 'high') {
      spot = new THREE.SpotLight(0xfff2c0, 5, 30, 0.5, 0.45, 1); spot.position.set(0, 1.1, 2.5);
      const tgt = new THREE.Object3D(); tgt.position.set(0, 0.4, 18); g.add(spot, tgt); spot.target = tgt;
    }
    return { g, lampMat, glows, spot, model };
  }
  function faceGlows() {
    const d = camera.position.distanceTo(run.g.position), sc = Math.max(1.2, d * 0.04);
    for (let i = 0; i < run.glows.length; i++) { run.glows[i].lookAt(camera.position); run.glows[i].scale.setScalar(sc); }
  }
  function tell(pos, dur) {
    const a = window.SS && window.SS.audio;
    if (a && a.engine) a.engine(pos.clone(), dur); else if (a && a.whoosh) a.whoosh(pos.clone(), dur);
    if (hud && hud.callout) hud.callout('VEHICLE!', true);
    if (hud && hud.edgeWarn) hud.edgeWarn(angleTo(pos));
  }
  function start(sim) {
    if (run && run.g) scene.remove(run.g);
    const cam = camera.position, side = cam.x > 0 ? -1 : 1;
    let cx = side * (4.6 + Math.random() * 0.8);
    if (Math.abs(cx - cam.x) < 3.5) cx = cam.x + (Math.sign(cx - cam.x) || side) * 3.5;
    const cz = cam.z - (9 + Math.random() * 5), sx = side * 2.8, sz = cam.z - 60;
    const T = Math.max((cz - sz) / 22, 1.6);
    const rig = build(); rig.g.position.set(sx, 0, sz); scene.add(rig.g);
    const rec = { startSim: sim, startR: performance.now(), crashSim: null, crashR: null, dmg: 0, hpBefore: player.health, dist: 0, fighters: 0, model: rig.model };
    state.count += 1; state.phase = 'drive'; firedWave = true; if (window.SS) window.SS.setPieceAt = sim;
    run = { phase: 'drive', sx, sz, cx, cz, side, T, startSim: sim, startR: rec.startR, warned: false, rec, crashSim: 0, g: rig.g, lampMat: rig.lampMat, glows: rig.glows, spot: rig.spot };
    publish(); faceGlows(); tell(rig.g.position, T);
    return rec;
  }
  function crash(sim) {
    run.phase = 'crash'; state.phase = 'crash'; run.crashSim = sim; if (window.SS) window.SS.setPieceAt = sim;
    run.g.position.set(run.cx, 0, run.cz); run.g.rotation.set(0, 0.6, 0.25);
    run.lampMat.color.setHex(0x554430);
    for (let i = 0; i < run.glows.length; i++) run.glows[i].visible = false;
    if (run.spot) run.spot.visible = false;
    const p = new THREE.Vector3(run.cx, 0.5, run.cz), f = window.SS && window.SS.fx;
    if (f && f.blast) f.blast(p.clone());
    if (f && f.impact) for (let i = 0; i < 4; i++) {
      tmp.set(p.x + (Math.random() - 0.5) * 3, p.y + Math.random() * 1.5, p.z + (Math.random() - 0.5) * 3);
      f.impact(tmp.clone(), up, null);
    }
    const a = window.SS && window.SS.audio;
    if (a && a.boom) a.boom(p.clone());
    const hpBefore = player.health;
    const d = Math.hypot(camera.position.x - p.x, camera.position.z - p.z);
    const dmg = d < 8 ? Math.max(0, Math.min(20 * (1 - d / 8), 20, player.health - 5)) : 0;
    run.rec.crashSim = sim; run.rec.crashR = performance.now(); run.rec.dmg = dmg; run.rec.hpBefore = hpBefore; run.rec.dist = d;
    publish();
    if (dmg > 0 && player.damage) player.damage(dmg, p.clone(), 'truck');
  }
  function stepDrive(sim) {
    const simElapsed = sim - run.startSim, realMs = performance.now() - run.startR;
    let k = Math.min(simElapsed / run.T, realMs / DRIVE_MS);
    if (k < 0) k = 0; else if (k > 1) k = 1;
    const sw = k <= 0.7 ? 0 : (k - 0.7) / 0.3;
    run.g.position.set(run.sx + (run.cx - run.sx) * sw, 0, run.sz + (run.cz - run.sz) * k);
    run.g.rotation.y = sw * 0.5 * Math.sign(run.cx - run.sx || run.side);
    faceGlows();
    if (!run.warned && simElapsed >= 0.6) { run.warned = true; if (hud && hud.edgeWarn) hud.edgeWarn(angleTo(run.g.position)); }
    if (k >= 1) crash(sim);
  }
  function bail() {
    const n = 1 + ((Math.random() * 2) | 0), enemies = window.SS && window.SS.enemies;
    let fighters = 0;
    for (let k = 0; k < n; k++) {
      const e = enemies && enemies.spawnEnemy ? enemies.spawnEnemy('shifter') : null;
      if (!e || !e.group) continue;
      e.group.position.set(run.cx - Math.sign(run.cx || run.side) * 1.2, 0, run.cz + 2.6 + k * 0.9);
      if (enemies.dismount) enemies.dismount(e); // re-path from the wreck (else it slides on its old spawn path)
      fighters += 1;
    }
    run.rec.fighters = fighters; publish();
    if (hud && hud.radio) hud.radio('Truck down - bailing out!', 2200);
    run.phase = 'wreck'; state.phase = 'wreck';
  }
  function resetRun() {
    const id = (window.SS && window.SS.runs) || 0;
    if (seenRun == null) { seenRun = id; return; }
    if (id === seenRun) return;
    seenRun = id; state.wave = 0; state.count = 0; state.phase = 'idle';
    wasBurst = false; firedWave = false; armed = false; waveT = (window.SS && window.SS.simTime) || 0;
    if (run && run.g) scene.remove(run.g);
    run = null;
    if (window.SS) window.SS.truckMoment = { count: 0, last: null };
  }
  function update(dt, sim) {
    const SS = window.SS || {}; sim = sim || SS.simTime || 0; resetRun();
    const bursting = !!SS.bursting;
    if (bursting && !wasBurst) {
      state.wave += 1;
      if (forced) { waveT = sim; delay = 2; firedWave = false; armed = true; }
      else if (!armed && state.count === 0 && state.wave >= 3) { waveT = sim; delay = 2 + Math.random() * 2; firedWave = false; armed = true; }
    }
    wasBurst = bursting;
    if (run && run.phase === 'drive') stepDrive(sim);
    else if (run && run.phase === 'crash' && sim - run.crashSim >= 0.6) bail();
    else if (run && run.phase === 'wreck' && camera.position.z < run.cz - 25) { scene.remove(run.g); run = null; state.phase = 'idle'; }
    if (armed && !firedWave && SS.running && player.alive && sim - waveT >= delay && !(SS.setPieceAt != null && sim - SS.setPieceAt < 8)) start(sim); // A10: shared set-piece gap
  }
  function debugTruck() { return start((window.SS && window.SS.simTime) || 0); }
  return { update, debugTruck, state };
}
