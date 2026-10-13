// M1 quick headless landscape check: load, controls, run loop, enemies/kill, no page errors, offline via sw. Serves dist/ on :8790.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), assert = require('assert');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/m1');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8790);
const res = {};
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 480000) });
 try {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  await p.goto('http://127.0.0.1:8790/?seed=7'); await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
  await p.screenshot({ path: OUT + '/1-start.png' });
  await p.tap('#play'); await p.waitForTimeout(4000);
  const d0 = await p.evaluate(() => SS.distance); await p.waitForTimeout(4000); const d1 = await p.evaluate(() => SS.distance);
  res.walk = { d0, d1, walking: await p.evaluate(() => SS.walking) };
  await p.screenshot({ path: OUT + '/2-walking.png' });
  // aim drag
  const y0 = await p.evaluate(() => SS.input.yaw); await p.mouse.move(300, 200); await p.mouse.down(); await p.mouse.move(200, 180, { steps: 8 }); await p.mouse.up(); res.aim = { y0, y1: await p.evaluate(() => SS.input.yaw) };
  // fire / scope / cover / reload via keys
  const a0 = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag); await p.keyboard.down('Space'); await p.waitForTimeout(700); await p.keyboard.up('Space'); const a1 = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag); res.fire = { a0, a1 };
  await p.keyboard.press('q'); await p.waitForTimeout(800); res.scopeFov = await p.evaluate(() => SS.camera.fov); await p.screenshot({ path: OUT + '/3-scoped.png' }); await p.keyboard.press('q');
  await p.keyboard.press('c'); await p.waitForTimeout(800); res.coverY = await p.evaluate(() => SS.camera.position.y); await p.keyboard.press('c'); await p.waitForTimeout(500);
  await p.keyboard.press('r'); await p.waitForTimeout(2600); res.afterReload = await p.evaluate(() => SS.weapon.ammo ?? SS.weapon.mag);
  // enemies
  await p.evaluate(() => { SS.debug.spawnEnemy('popper'); SS.debug.spawnEnemy('shifter'); SS.debug.spawnEnemy('flanker'); }); await p.waitForTimeout(3000);
  res.enemyStop = await p.evaluate(() => SS.walking); await p.screenshot({ path: OUT + '/4-enemies.png' });
  await p.evaluate(() => SS.debug.killAll()); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + '/5-ragdoll.png' }); await p.waitForTimeout(3000); res.resumed = await p.evaluate(() => SS.walking);
  res.score = await p.evaluate(() => JSON.parse(JSON.stringify(SS.score && (SS.score.value ?? SS.score.score ?? SS.score))));
  await p.evaluate(() => SS.debug.damage(1000)); await p.waitForTimeout(1500); res.over = await p.evaluate(() => { const o = document.querySelector('#over'); return !!o && getComputedStyle(o).display !== 'none'; });
  res.highscores = await p.evaluate(() => localStorage.getItem('ss-highscores')); await p.screenshot({ path: OUT + '/6-gameover.png' });
  // offline
  await p.waitForFunction(() => navigator.serviceWorker.controller, null, { timeout: 30000 }).catch(() => {}); res.caches = await p.evaluate(() => caches.keys());
  await ctx.setOffline(true); await p.reload(); await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 30000 }).then(() => res.offline = true).catch(() => res.offline = false); await ctx.setOffline(false);
  await p.screenshot({ path: OUT + '/7-offline.png' });
  res.errors = errs; console.log(JSON.stringify(res, null, 1));
  assert.ok(d1 > d0, 'walks'); assert.notEqual(res.aim.y1, y0, 'aim'); assert.ok(a1 < a0, 'fires'); assert.ok(res.scopeFov < 60, 'scope'); assert.ok(res.coverY < 1.4, 'cover');
  assert.equal(res.enemyStop, false, 'stops for enemies'); assert.equal(res.resumed, true, 'resumes'); assert.ok(res.over, 'game over'); assert.ok(res.highscores, 'highscore saved');
  assert.ok(res.caches.some(k => k.startsWith('ss-')), 'ss- cache'); assert.ok(res.offline, 'offline'); assert.equal(errs.length, 0, 'no page errors');
  console.log('M1 PASS');
 } finally { await b.close(); srv.close(); } })().catch(e => { console.error('M1 FAIL', e.message); process.exit(1); });
