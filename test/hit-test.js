// Hit registration: crosshair-on-enemy shots must hit at 10/20/40 m, front/behind/sides, standing/crouched/leaning, hip (ducked) and scoped. Serves dist/ on :8793.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/hit');
fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8793);
const res = {};
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 480000) });
 try {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8793/?calm=1&seed=7&hitbox=1' + (process.env.SS_QS || ''));
  await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
  await p.waitForFunction(() => window.SS.art && window.SS.art.done, null, { timeout: 60000 });
  await p.tap('#play');
  await p.waitForTimeout(2500);
  res.tier = await p.evaluate(() => SS.art.tier);
  const cases = [];
  for (const [dir, ang] of [['front', 0], ['behind', Math.PI], ['left', -Math.PI / 2], ['right', Math.PI / 2], ['back-left', -2.4], ['front-right', 0.6]])
    for (const d of (dir === 'left' || dir === 'right' ? [4.5] : dir.includes('-') ? [5.5] : [10, 20, 40]))
      for (const posture of ['idle', 'crouch', 'lean'])
        for (const mode of ['hip', 'scoped']) cases.push({ dir, ang, d, posture, mode });
  for (const d of [10, 20]) for (const mode of ['hip', 'scoped']) cases.push({ dir: 'front', ang: 0, d, posture: 'idle', mode, moving: true });
  res.cases = []; let fails = 0;
  for (const c of cases) {
    const r = await p.evaluate(async (c) => {
      const wait = (ms) => new Promise((ok) => setTimeout(ok, ms)); const frames = (n) => new Promise((ok) => { let k = 0; const f = () => (++k >= n ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); });
      SS.player.health = 100; if (SS.health != null) SS.health = 100;
      (SS.enemies.list || []).forEach((x) => { if (x.pinned && x.alive) { x.health = 0.01; x.takeHit('body', x.group.position.clone()); } });
      await wait(150);
      const cam = SS.camera.position;
      // direction 0 = street ahead (-z), PI = behind (+z), -PI/2 = left (-x)
      const x = cam.x + Math.sin(c.ang) * c.d, z = cam.z - Math.cos(c.ang) * c.d;
      const e = SS.debug.spawnEnemy('popper'); if (!e) return { err: 'no spawn' };
      SS.enemies.debugPose(e, Math.max(-5.2, Math.min(5.2, x)), z, c.posture);
      e.health = 1e6;
      if (c.moving) { e.debugVel = new SS.THREE.Vector3(e.group.position.x > 0 ? -4.5 : 4.5, 0, 0); }
      SS.input.scope = c.mode === 'scoped'; await frames(3); for (let k = 0; k < 40 && c.mode === 'scoped' && SS.camera.fov > 40; k++) await frames(1); await wait(700);
      const out = [];
      for (const part of ['torso', 'head', 'legs']) {
        if (part === 'legs' && (c.moving || (c.d > 20 && c.mode === 'hip'))) continue;
        if (part === 'head' && c.d > 20 && c.mode === 'hip') continue;
        const tgt = part === 'legs' ? (e.limbBoxes && e.limbBoxes[0] ? e.limbBoxes[0].m : null) : e.parts[part];
        if (!tgt) { out.push({ part, skip: true }); continue; }
        // aim the real camera (input.yaw/pitch) at the hitbox centre
        for (let k = 0; k < 2; k++) {
          SS.camera.updateMatrixWorld(); const tp = tgt.getWorldPosition(new SS.THREE.Vector3()); const cp = SS.camera.getWorldPosition(new SS.THREE.Vector3());
          const dx = tp.x - cp.x, dy = tp.y - cp.y, dz = tp.z - cp.z, len = Math.hypot(dx, dy, dz);
          SS.input.yaw = -Math.atan2(-dx, -dz); SS.input.pitch = -Math.asin(dy / len); SS.weapon.cancelRecoil(); await frames(1);
        }
        // Is the aim point really visible? Ray against rendered geometry only (no proxies, no enemies, no viewmodel).
        SS.camera.updateMatrixWorld(); const tp2 = tgt.getWorldPosition(new SS.THREE.Vector3()); const cp2 = SS.camera.getWorldPosition(new SS.THREE.Vector3());
        const rc = new SS.THREE.Raycaster(cp2, tp2.clone().sub(cp2).normalize(), 0.05, cp2.distanceTo(tp2) - 0.25);
        const vis = []; SS.scene.traverseVisible((o) => { if (!o.isMesh || o.isSkinnedMesh || !o.material || o.material.visible === false) return; let q = o; while (q) { if (q === e.group || q === SS.camera || q.isSprite) return; q = q.parent; } vis.push(o); });
        const occ = rc.intersectObjects(vis, false)[0];
        if (occ) { out.push({ part, skip: true, occluded: occ.object.name || occ.object.type, at: +occ.distance.toFixed(2) }); continue; }
        { // final synchronous aim on this frame's hitbox (what the player sees), then fire
          const tp = tgt.getWorldPosition(new SS.THREE.Vector3()), cp = SS.camera.getWorldPosition(new SS.THREE.Vector3());
          const dx = tp.x - cp.x, dy = tp.y - cp.y, dz = tp.z - cp.z, len = Math.hypot(dx, dy, dz);
          SS.input.yaw = -Math.atan2(-dx, -dz); SS.input.pitch = -Math.asin(dy / len);
          SS.camera.rotation.set(-SS.input.pitch, -SS.input.yaw, 0); SS.camera.updateMatrixWorld(); }
        let shot;
        if (c.moving) { const n0 = SS.weapon.shotsFired; SS.weapon.ammo = 30; SS.input.pendingShots = 1; for (let k = 0; k < 10 && SS.weapon.shotsFired === n0; k++) { // keep tracking the moving hitbox until the shot leaves (Low tier frames are long)
            if (k) { const tp = tgt.getWorldPosition(new SS.THREE.Vector3()), cp = SS.camera.getWorldPosition(new SS.THREE.Vector3()); const dx = tp.x - cp.x, dy = tp.y - cp.y, dz = tp.z - cp.z, len = Math.hypot(dx, dy, dz);
              SS.input.yaw = -Math.atan2(-dx, -dz); SS.input.pitch = -Math.asin(dy / len); SS.camera.rotation.set(-SS.input.pitch, -SS.input.yaw, 0); SS.camera.updateMatrixWorld(); }
            await frames(1); } shot = SS.weapon.lastShot; }
        else shot = SS.weapon.debugShoot(SS.input);
        const ok = !!(shot && shot.hit && shot.hit.enemy && shot.hit.point.distanceTo(e.group.position.clone().setY(shot.hit.point.y)) < 1.2);
        // a moving target that walked behind a prop between aim and the fire frame is occluded, not a false miss
        const occl = c.moving && !ok && shot && shot.hit && !shot.hit.enemy && shot.hit.point.distanceTo(SS.camera.position) < e.group.position.distanceTo(SS.camera.position) - 0.6;
        if (occl) { out.push({ part, skip: true, why: 'moved behind ' + shot.hit.name }); continue; }
        out.push({ part, ok, hit: shot && shot.hit ? (shot.hit.enemy ? 'enemy:' + shot.hit.part : 'world:' + shot.hit.name) : 'none', cover: SS.input.cover });
      }
      e.pinned = false; e.health = 1; e.takeHit('body', e.group.position.clone());
      SS.input.scope = false;
      return { out };
    }, c);
    console.log(c.dir, c.d, c.posture, c.mode, JSON.stringify(r.out || r.err));
    const bad = (r.out || []).filter((o) => !o.skip && !o.ok);
    if (r.err || bad.length) fails++;
    res.cases.push({ ...c, ang: undefined, ...r });
    if (c.dir === 'behind' && c.d === 20 && c.posture === 'lean') await p.screenshot({ path: OUT + '/behind-20-lean-' + c.mode + '.png' });
    if (c.dir === 'front' && c.d === 10 && c.posture === 'crouch' && c.mode === 'hip') await p.screenshot({ path: OUT + '/front-10-crouch-hip.png' });
  }
  res.fails = fails; res.total = cases.length; res.errors = errs;
  console.log(JSON.stringify(res.cases.filter((c) => c.err || (c.out || []).some((o) => !o.skip && !o.ok))));
  console.log('cases', cases.length, 'fails', fails, 'errors', errs.length);
  if (fails || errs.length) throw new Error(fails + ' failing cases');
  console.log('HIT TEST PASS');
 } finally { await b.close(); srv.close(); } })().catch(e => { console.error('HIT TEST FAIL', e.message); process.exit(1); });
