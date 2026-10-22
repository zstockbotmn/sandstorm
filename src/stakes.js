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
    // A16 (tester A15: 'a flat green box floats over the burnt car during kills'): the ammo drop was a plain olive box, and
    // the auto-collect flight carried it through the air at the player (at 1-2 fps it hung mid-air over the cover). Now it
    // is a stencilled ammo can on the ground, and only its small icon flies in (the box hides when the flight starts).
    ammo: new THREE.MeshStandardMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
      g.fillStyle = '#4f5a2c'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#2e3418'; g.fillRect(0, 0, 64, 6); g.fillRect(0, 58, 64, 6); g.fillStyle = '#e2c13a'; g.fillRect(0, 40, 64, 5);
      g.font = 'bold 15px monospace'; g.textAlign = 'center'; g.fillText('AMMO', 32, 30); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), emissive: 0x1a1600, emissiveIntensity: 0.4, roughness: 0.75 }) };
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
  // m1x: at 1-5 fps a tap lands ~1 s after the player saw the kit; by then it is flying in (auto-collect) or already taken,
  // so the old current-position test missed and the click FIRED (tester 2/2). Every drop keeps a short trail of where it
  // was drawn; a tap on any recent spot of a live, flying or just-collected kit is a pickup tap: it collects (if still
  // there) and never fires.
  // m2a: ?autopickup=0 (debug/test only: needs ?debug or an automated browser) leaves drops on the ground so they can be tapped at low fps
  const AUTO_PICK = (() => { try { return !(/[?&]autopickup=0\b/.test(location.search) && (/[?&]debug\b/.test(location.search) || navigator.webdriver)); } catch (_) { return true; } })();
  const TRAIL_S = 2.5, recent = []; const trailMs = () => Math.max(TRAIL_S * 1000, 4.5 * ((window.SS && window.SS.input && window.SS.input.gapMs) || 0)); // m1y: >= 4.5 frames at ~1 fps // s: a tap may land up to ~2 s after the frame the player saw (1-5 fps + input lag)
  function nearTrail(trail, VP, W, H, cx, cy, now) { let best = 1e9;
    for (let j = trail.length - 1; j >= 0; j--) { const q = trail[j]; if (now - q.t > trailMs()) break;
      for (const y of [0.16, 0.45, 0.75]) { _pp.set(q.x, q.y + y * q.s, q.z); if (q.vp) _pp.applyMatrix4(_vpm.fromArray(q.vp)); else if (VP) _pp.applyMatrix4(VP); else _pp.project(camera); if (_pp.z <= -1 || _pp.z >= 1) continue;
        best = Math.min(best, Math.hypot((_pp.x + 1) / 2 * W - cx, (1 - _pp.y) / 2 * H - cy)); } }
    return best; }
  // b1 (App PM): with auto-pickup ON (the real game) pickups never take taps: a world tap is ALWAYS a shot. Tap-to-pickup
  // (60 px radius on the drawn spot or the recent trail) exists only under the debug ?autopickup=0.
  st.tapPick = !AUTO_PICK;
  function pickAt(cx, cy, dry) { if (AUTO_PICK) return false; const W = window.innerWidth || 844, H = window.innerHeight || 390, R = Math.max(60, Math.min(W, H) * 0.09); camera.updateMatrixWorld(); const VP = window.SS && window.SS.lastVP; // the camera of the last RENDERED frame
    const now = performance.now(); let bestAll = 1e9;
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; let best = 1e9;
      for (const y of [0.16, 0.45, 0.75]) { _pp.set(0, y, 0); it.g.localToWorld(_pp); if (VP) _pp.applyMatrix4(VP); else _pp.project(camera); if (_pp.z <= -1 || _pp.z >= 1) continue;
        best = Math.min(best, Math.hypot((_pp.x + 1) / 2 * W - cx, (1 - _pp.y) / 2 * H - cy)); }
      if (it.trail) best = Math.min(best, nearTrail(it.trail, VP, W, H, cx, cy, now)); bestAll = Math.min(bestAll, best);
      if (!dry && best <= R) { take(it); gone(it); scene.remove(it.g); items.splice(i, 1); if (window.SS) window.SS.pickupsTapped = (window.SS.pickupsTapped | 0) + 1; return true; } }
    for (let i = recent.length - 1; i >= 0; i--) { const r = recent[i]; if (now - r.t > trailMs()) { recent.splice(i, 1); continue; }
      const best = nearTrail(r.trail, VP, W, H, cx, cy, now); bestAll = Math.min(bestAll, best);
      if (!dry && best <= R) { if (window.SS) window.SS.pickupsLateTaps = (window.SS.pickupsLateTaps | 0) + 1; return true; } } // already collected: just swallow the tap
    return dry ? { best: Math.round(bestAll), R: Math.round(R), n: items.length, recent: recent.length } : false; }
  // each entry: where the kit was DRAWN last frame + that frame's view-projection (the player walks on; a ~2 s old spot
  // must be projected with the camera it was seen through). Pushed once per frame, before this frame moves the kit.
  const _vpm = new THREE.Matrix4();
  function trailPush(it) { if (window.SS && (window.SS.subStep | 0) > 0) return; const VP = window.SS && window.SS.lastVP; const tr = it.trail || (it.trail = []); const p = it.g.position;
    tr.push({ x: p.x, y: p.y, z: p.z, s: it.g.scale.x, t: performance.now(), vp: VP ? VP.toArray(new Float32Array(16)) : null }); while (tr.length > 150 || (tr.length && performance.now() - tr[0].t > trailMs())) tr.shift(); }
  function gone(it) { if (it.trail && it.trail.length) recent.push({ trail: it.trail, t: performance.now() }); if (recent.length > 8) recent.shift(); }
  function drop(kind, pos) {
    const g = new THREE.Group(); const box = new THREE.Mesh(geo, mats[kind]); box.position.y = 0.16; box.castShadow = true; g.add(box);
    const icon = new THREE.Sprite(kind === 'health' ? cross : bullet); icon.scale.set(0.05, 0.05, 1); icon.position.y = 0.75; icon.renderOrder = 5; g.add(icon);
    g.position.set(Math.max(-3.6, Math.min(3.6, pos.x)), 0, pos.z); scene.add(g); items.push({ kind, g, t: 0 });
    if (window.SS) window.SS.pickupsDropped = (window.SS.pickupsDropped | 0) + 1;
  }
  function take(it) {
    if (it.kind === 'health') { it.gained = Math.min(100, player.health + 35) - player.health; player.health = Math.min(100, player.health + 35); if (window.SS) window.SS.health = player.health; if (hud.setHealth) hud.setHealth(player.health); hud.hint && hud.hint('+35 HEALTH'); }
    else { const before = weapon.reserve; weapon.reserve = Math.max(before | 0, Math.min(weapon.reserveMax || 210, (weapon.reserve | 0) + 60)); it.gained = weapon.reserve - before; }
    popup(it.kind === 'health' ? '+35 HP' : (it.gained | 0) > 0 ? '+' + (it.gained | 0) + ' AMMO' : 'AMMO FULL', it.kind === 'health' ? '#ff6a5a' : '#ffd23a'); // A17: no '+0 AMMO'
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
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; trailPush(it); it.t += dt; it.g.children[0].rotation.y += dt * 1.5; it.g.children[1].position.y = 0.75 + Math.sin(it.t * 3) * 0.06;
      const dx = it.g.position.x - camera.position.x, dz = it.g.position.z - pz;
      // auto-collect (Zack): after ~0.6 s on the ground the drop flies to the player and applies on arrival
      // Every drop is collected wherever it fell (a drop > 40 m away used to sit there forever, looking like a prop).
      if (it.t > 0.6 && AUTO_PICK) {
        if (!it.fly) it.g.children[0].visible = false; // A16: the box stays out of the flight (no floating crate over the cover)
        it.fly = (it.fly || 0) + dt;
        _tgt.set(camera.position.x, camera.position.y - 0.5, camera.position.z);
        const k = Math.min(1, dt * (3 + it.fly * 10)); it.g.position.lerp(_tgt, k); it.g.scale.setScalar(Math.max(0.4, 1 - it.fly));
        if (it.g.position.distanceTo(_tgt) < 0.6 || it.fly > 1.2) { take(it); gone(it); scene.remove(it.g); items.splice(i, 1); }
      } }
    const d = window.SS ? window.SS.distance : 0;
    if (!goalDone) { hud.setGoal && hud.setGoal('GOAL: reach the market · ' + Math.max(0, Math.ceil(GOAL_M - d)) + ' m');
      if (d >= GOAL_M) { goalDone = true; if (window.SS) window.SS.goalReached = true; hud.banner && hud.banner('MARKET REACHED! +500'); score.addBonus && score.addBonus(500);
        hud.hint && hud.hint('Endless mode: keep going'); } }
    else hud.setGoal && hud.setGoal('ENDLESS · ' + Math.floor(d) + ' m');
  }
  function reset() { for (const it of items) scene.remove(it.g); items.length = 0; recent.length = 0; goalDone = false; if (window.SS) window.SS.goalReached = false; }
  function prewarm() { const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mats.health), new THREE.Mesh(geo, mats.ammo), new THREE.Sprite(cross), new THREE.Sprite(bullet)); return g; }
  return st;
}
