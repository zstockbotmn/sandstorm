// Tester: at 0.3-1.5 fps a red crosshair on a fighter 7 m away never killed it, and FIRE holds fired 0 rounds.
// Frames are slowed to ~1.3 fps with a busy-wait in requestAnimationFrame; then: crosshair on a pinned fighter's chest,
// red crosshair must match the hit ray, a 300 ms tap (press+release inside one frame) fires >= 1, a 6 s hold kills.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8804;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}; const fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage();
    await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForTimeout(1500);
    await p.evaluate(() => { SS.player.health = 1e9; SS.walking = false;  SS.weapon.reserve = 300; const e = window.__e = SS.debug.spawnEnemy('shifter'); });
    await p.waitForTimeout(8000); // let auto-cover settle
    const aim = () => p.evaluate(() => { clearInterval(window.__aimT); window.__aimT = setInterval(window.__aimF, 100); return window.__aimF(); });
    await p.evaluate(() => { window.__aimF = () => { SS.walking = false; const e = window.__e, c = SS.camera.position; for (const q of SS.enemies.list) if (q !== e && q.alive) { q.group.position.y = -50; q.pinned = true; q.shootCd = 1e9; }
      if (window.__spot == null) { const o = c.clone(), d = c.clone(); window.__spot = 0;
        for (const dx of [0.4, -0.4, 1, -1, 1.6, -1.6, 2.2, -2.2]) { d.set(dx, -0.05, -7).normalize(); const h = SS.weapon.firstHit(o, d);
          if (!h || h.distance > 7.6 || (h.object.userData && h.object.userData.enemy)) { window.__spot = dx; break; } } } // clear line (no wall) to 7 m
      SS.enemies.debugPose(e, c.x + window.__spot, c.z - 7, 'idle'); e.shootCd = 1e9; const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); const v = e.group.position.clone(); v.y += 1.25; if (bm && bm.getWorldPosition(c.clone()).distanceTo(v) < 0.8) bm.getWorldPosition(v); v.sub(c); // aim at the body hitbox the player sees
      SS.input.scope = false; SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); return { d: +v.length().toFixed(2), hp: e.health, spot: window.__spot }; }; });
    res.setup = await aim(); await p.waitForTimeout(600);
    res.diag = await p.evaluate(() => { const e = window.__e, c = SS.camera.position; const s = SS.weapon.debugShoot(SS.input); return { alive: e.alive, vis: e.group.visible, ep: e.group.position.toArray().map((v) => +v.toFixed(2)), cp: c.toArray().map((v) => +v.toFixed(2)), yaw: +SS.input.yaw.toFixed(3), pitch: +SS.input.pitch.toFixed(3), shot: s && s.hit, dir: s && s.dir.toArray().map((v) => +v.toFixed(3)) }; }); await p.evaluate(() => { window.__slowMs = 700; }); await p.waitForTimeout(3000); await aim(); await p.waitForTimeout(2500);
    res.fps = await p.evaluate(() => SS.benchFps || null);
    res.target = await p.evaluate(() => ({ onTarget: SS.weapon.onTarget, name: SS.weapon.onTargetName, ray: (() => { const c = SS.camera; c.updateMatrixWorld(); const o = c.position.clone(), d = c.position.clone(); c.getWorldPosition(o); c.getWorldDirection(d); const h = SS.weapon.firstHit(o, d); return h ? (h.object.userData && h.object.userData.enemy ? 'enemy:' + h.object.userData.part : 'world:' + h.object.name) : null; })() }));
    if (!(res.target.onTarget === /^enemy/.test(res.target.ray || ''))) fail.push('red crosshair does not match the hit ray ' + JSON.stringify(res.target));
    const bb = await p.locator('[data-ctl=fire]').boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    // tap: press + release well inside one slow frame
    await p.evaluate(() => { window.__e.health = 1e9; }); let s0 = await p.evaluate(() => SS.weapon.shotsFired);
    await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(250); await p.mouse.up(); await p.waitForTimeout(2500);
    res.tap = (await p.evaluate(() => SS.weapon.shotsFired)) - s0; res.holds = await p.evaluate(() => SS.input.holdLog.map((h) => [Math.round(h.start), h.end && Math.round(h.end), Math.round(h.at)])); if (res.tap < 1) fail.push('tap at low fps fired ' + res.tap);
    // hold: must hit and kill
    await aim(); await p.waitForTimeout(1500); await p.evaluate(() => { window.__e.health = 100; SS.weapon.ammo = 30; }); s0 = await p.evaluate(() => [SS.weapon.shotsFired, SS.weapon.shotsHit]);
    await p.mouse.down(); await p.waitForTimeout(6000); await p.mouse.up(); await p.waitForTimeout(2000);
    res.hold = await p.evaluate((s0) => ({ shots: SS.weapon.shotsFired - s0[0], hits: SS.weapon.shotsHit - s0[1], alive: window.__e.alive, hp: window.__e.health }), s0);
    if (res.hold.shots < 12) fail.push('6 s hold at low fps fired ' + res.hold.shots); if (res.hold.alive) fail.push('hold on a 7 m fighter did not kill ' + JSON.stringify(res.hold));
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'LOWFPS FAIL' : 'LOWFPS PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
