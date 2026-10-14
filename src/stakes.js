import * as THREE from 'three';
// Step D run stakes: goal (reach the market at 200 m, banner + bonus, endless after) and health/ammo pickups.
const GOAL_M = 200;
export function createStakes(scene, camera, hud, player, weapon, score, audio) {
  const items = [];
  const geo = new THREE.BoxGeometry(0.42, 0.32, 0.42);
  const mats = { health: new THREE.MeshStandardMaterial({ color: 0xe8e2d6, emissive: 0x7a0c0c, emissiveIntensity: 0.6, roughness: 0.7 }),
    ammo: new THREE.MeshStandardMaterial({ color: 0x4f5a2c, emissive: 0x3a3000, emissiveIntensity: 0.6, roughness: 0.7 }) };
  const cross = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#e3261b'; g.fillRect(24, 8, 16, 48); g.fillRect(8, 24, 48, 16); const t = new THREE.CanvasTexture(c);
    return new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }); })();
  const bullet = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    g.fillStyle = '#ffd23a'; for (const x of [14, 28, 42]) { g.fillRect(x, 20, 9, 34); g.beginPath(); g.arc(x + 4.5, 20, 4.5, Math.PI, 0); g.fill(); }
    const t = new THREE.CanvasTexture(c); return new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true, sizeAttenuation: false }); })();
  let goalDone = false;
  const st = { items, drop, update, reset, prewarm };
  function drop(kind, pos) {
    const g = new THREE.Group(); const box = new THREE.Mesh(geo, mats[kind]); box.position.y = 0.16; box.castShadow = true; g.add(box);
    const icon = new THREE.Sprite(kind === 'health' ? cross : bullet); icon.scale.set(0.05, 0.05, 1); icon.position.y = 0.75; icon.renderOrder = 5; g.add(icon);
    g.position.set(Math.max(-3.6, Math.min(3.6, pos.x)), 0, pos.z); scene.add(g); items.push({ kind, g, t: 0 });
    if (window.SS) window.SS.pickupsDropped = (window.SS.pickupsDropped | 0) + 1;
  }
  function take(it) {
    if (it.kind === 'health') { player.health = Math.min(100, player.health + 35); if (window.SS) window.SS.health = player.health; if (hud.setHealth) hud.setHealth(player.health); hud.hint && hud.hint('+35 HEALTH'); }
    else { weapon.ammo = weapon.magSize; weapon.reloading = false; hud.hint && hud.hint('AMMO: mag full'); }
    if (audio && audio.reload) audio.reload('end');
    if (window.SS) window.SS.pickupsTaken = (window.SS.pickupsTaken | 0) + 1;
  }
  function update(dt) {
    const pz = camera.position.z;
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; it.t += dt; it.g.children[0].rotation.y += dt * 1.5; it.g.children[1].position.y = 0.75 + Math.sin(it.t * 3) * 0.06;
      const dx = it.g.position.x - camera.position.x, dz = it.g.position.z - pz;
      // collected when the walk/cover run brings you within 2.6 m (or you pass it); despawn if left far behind
      if (Math.hypot(dx, dz) < 2.6 || (dz > 0 && dz < 3 && Math.abs(dx) < 4.5)) { take(it); scene.remove(it.g); items.splice(i, 1); }
      else if (dz > 12) { scene.remove(it.g); items.splice(i, 1); } }
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
