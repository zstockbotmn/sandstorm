import * as THREE from 'three';
// Step D run stakes: goal (reach the market at 200 m, banner + bonus, endless after) and health/ammo pickups.
const GOAL_M = 200;
export function createStakes(scene, camera, hud, player, weapon, score, audio) {
  const items = [];
  const geo = new THREE.BoxGeometry(0.42, 0.32, 0.42);
  // Tester: a plain white box beside an enemy read as a prop crate. Health is now a red-cross medkit on every face.
  const kitTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#f2efe8'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#d81e14'; g.fillRect(24, 10, 16, 44); g.fillRect(10, 24, 44, 16);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const mats = { health: new THREE.MeshStandardMaterial({ map: kitTex, emissive: 0x551010, emissiveIntensity: 0.35, roughness: 0.7 }),
    ammo: new THREE.MeshStandardMaterial({ color: 0x4f5a2c, emissive: 0x3a3000, emissiveIntensity: 0.6, roughness: 0.7 }) };
  const cross = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#e3261b'; g.fillRect(24, 8, 16, 48); g.fillRect(8, 24, 48, 16); const t = new THREE.CanvasTexture(c);
    return new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }); })();
  const bullet = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#ffd23a'; for (const x of [14, 28, 42]) { g.fillRect(x, 20, 9, 34); g.beginPath(); g.arc(x + 4.5, 20, 4.5, Math.PI, 0); g.fill(); }
    const t = new THREE.CanvasTexture(c); return new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }); })();
  let goalDone = false;
  const st = { items, drop, update, reset, prewarm, pickAt };
  // m1w: tap/click hit-test for drops (generous touch radius: >= 56 px or 9% of the short screen side, box or icon)
  const _pp = new THREE.Vector3();
  function pickAt(cx, cy) { const W = window.innerWidth || 844, H = window.innerHeight || 390, R = Math.max(56, Math.min(W, H) * 0.09); camera.updateMatrixWorld();
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; let best = 1e9;
      for (const y of [0.16, 0.45, 0.75]) { _pp.set(0, y, 0); it.g.localToWorld(_pp); _pp.project(camera); if (_pp.z <= -1 || _pp.z >= 1) continue;
        best = Math.min(best, Math.hypot((_pp.x + 1) / 2 * W - cx, (1 - _pp.y) / 2 * H - cy)); }
      if (best <= R) { take(it); scene.remove(it.g); items.splice(i, 1); if (window.SS) window.SS.pickupsTapped = (window.SS.pickupsTapped | 0) + 1; return true; } }
    return false; }
  function drop(kind, pos) {
    const g = new THREE.Group(); const box = new THREE.Mesh(geo, mats[kind]); box.position.y = 0.16; box.castShadow = true; g.add(box);
    const icon = new THREE.Sprite(kind === 'health' ? cross : bullet); icon.scale.set(0.05, 0.05, 1); icon.position.y = 0.75; icon.renderOrder = 5; g.add(icon);
    g.position.set(Math.max(-3.6, Math.min(3.6, pos.x)), 0, pos.z); scene.add(g); items.push({ kind, g, t: 0 });
    if (window.SS) window.SS.pickupsDropped = (window.SS.pickupsDropped | 0) + 1;
  }
  function take(it) {
    if (it.kind === 'health') { it.gained = Math.min(100, player.health + 35) - player.health; player.health = Math.min(100, player.health + 35); if (window.SS) window.SS.health = player.health; if (hud.setHealth) hud.setHealth(player.health); hud.hint && hud.hint('+35 HEALTH'); }
    else { const before = weapon.reserve; weapon.reserve = Math.max(before | 0, Math.min(weapon.reserveMax || 210, (weapon.reserve | 0) + 60)); it.gained = weapon.reserve - before; }
    popup(it.kind === 'health' ? '+35 HP' : '+' + (it.gained | 0) + ' AMMO', it.kind === 'health' ? '#ff6a5a' : '#ffd23a');
    if (audio && audio.pickup) audio.pickup(it.kind); else if (audio && audio.reload) audio.reload('end');
    if (window.SS) { window.SS.lastPickup = { kind: it.kind, health: player.health, reserve: weapon.reserve }; }
    if (window.SS) window.SS.pickupsTaken = (window.SS.pickupsTaken | 0) + 1;
  }
  function popup(text, color) {
    const el = document.createElement('div'); el.textContent = text; el.className = 'ss-pickpop';
    el.style.cssText = 'position:fixed;left:50%;top:58%;transform:translate(-50%,0);font:800 22px system-ui,sans-serif;color:' + color + ';text-shadow:0 2px 4px #000;pointer-events:none;z-index:40;transition:transform .9s ease-out,opacity .9s ease-in;opacity:1';
    document.body.appendChild(el); requestAnimationFrame(() => { el.style.transform = 'translate(-50%,-60px)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 1000);
  }
  const _tgt = new THREE.Vector3();
  function update(dt) {
    const pz = camera.position.z;
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; it.t += dt; it.g.children[0].rotation.y += dt * 1.5; it.g.children[1].position.y = 0.75 + Math.sin(it.t * 3) * 0.06;
      const dx = it.g.position.x - camera.position.x, dz = it.g.position.z - pz;
      // auto-collect (Zack): after ~0.6 s on the ground the drop flies to the player and applies on arrival
      // Every drop is collected wherever it fell (a drop > 40 m away used to sit there forever, looking like a prop).
      if (it.t > 0.6) {
        it.fly = (it.fly || 0) + dt;
        _tgt.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
        const k = Math.min(1, dt * (3 + it.fly * 10)); it.g.position.lerp(_tgt, k); it.g.scale.setScalar(Math.max(0.4, 1 - it.fly));
        if (it.g.position.distanceTo(_tgt) < 0.6 || it.fly > 1.2) { take(it); scene.remove(it.g); items.splice(i, 1); }
      } }
    const d = window.SS ? window.SS.distance : 0;
    if (!goalDone) { hud.setGoal && hud.setGoal('GOAL: reach the market · ' + Math.max(0, Math.ceil(GOAL_M - d)) + ' m');
      if (d >= GOAL_M) { goalDone = true; if (window.SS) window.SS.goalReached = true; hud.banner && hud.banner('MARKET REACHED! +500'); score.addBonus && score.addBonus(500);
        hud.hint && hud.hint('Endless mode: keep going'); } }
    else hud.setGoal && hud.setGoal('ENDLESS · ' + Math.floor(d) + ' m');
  }
  function reset() { for (const it of items) scene.remove(it.g); items.length = 0; goalDone = false; if (window.SS) window.SS.goalReached = false; }
  function prewarm() { const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mats.health), new THREE.Mesh(geo, mats.ammo), new THREE.Sprite(cross), new THREE.Sprite(bullet)); return g; }
  return st;
}
