// Shots of the new fight features: truck, grenade + cover move, SWITCH COVER button, pickups, streak/goal HUD, roof shooter.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/stakes'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8794);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 400000 });
  const res = {}; const errs = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8794/?calm=1&seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 120000 });
    await p.tap('#play'); await p.waitForTimeout(1500);
    // engage: one enemy -> halt -> auto cover; truck rolls in
    await p.evaluate(() => { const e = SS.debug.spawnEnemy('shifter'); if (e) e.engaged = true; SS.enemies.debugTruck(); SS.enemies.debugRoof(); });
    await p.waitForFunction(() => SS.cover.state === 'in', null, { timeout: 60000, polling: 250 }).catch(() => {});
    res.coverIn = await p.evaluate(() => ({ state: SS.cover.state, btn: document.getElementById('switch-cover').classList.contains('on') }));
    await p.screenshot({ path: OUT + '/1-cover-switch-button-truck.png' });
    const x0 = await p.evaluate(() => SS.camera.position.x);
    await p.evaluate(() => SS.cover.relocate(SS.camera.position.x > 0 ? -1 : 1, 'switch')); await p.waitForTimeout(2500);
    res.switch = await p.evaluate((x0) => ({ moves: SS.cover.moves, dx: SS.camera.position.x - x0, state: SS.cover.state }), x0);
    await p.evaluate(() => SS.enemies.debugGrenade()); await p.waitForTimeout(1200);
    await p.screenshot({ path: OUT + '/2-grenade.png' });
    await p.waitForTimeout(3500); res.grenade = await p.evaluate(() => ({ n: SS.grenades, moves: SS.cover.moves, last: SS.cover.lastMove, health: SS.health }));
    await p.evaluate(() => { SS.stakes.drop('health', SS.camera.position.clone().add(new SS.camera.position.constructor(1, 0, -6))); SS.stakes.drop('ammo', SS.camera.position.clone().add(new SS.camera.position.constructor(-1.5, 0, -7))); });
    await p.waitForTimeout(800); await p.screenshot({ path: OUT + '/3-pickups.png' });
    res.end = await p.evaluate(() => ({ trucks: SS.trucks, roof: (SS.enemies.list || []).filter(e => e.alive && e.anchor && e.anchor.type === 'roof').map(e => +e.group.position.y.toFixed(2)), dropped: SS.pickupsDropped, errors: SS.errors || [] }));
  } finally { await b.close(); srv.close(); }
  res.errs = errs; console.log(JSON.stringify(res, null, 1));
  if (errs.length || (res.end.errors || []).length) throw new Error('page errors');
  if (!(res.coverIn.state === 'in' && res.coverIn.btn)) throw new Error('switch cover button not shown in cover');
  if (!(res.switch.moves >= 1 && Math.abs(res.switch.dx) > 0.8)) throw new Error('switch cover did not move');
  if (!(res.grenade.n >= 1 && res.grenade.moves >= 2)) throw new Error('grenade did not force a cover move');
  console.log('STAKES SHOTS PASS'); })().catch(e => { console.error(e); process.exit(1); });
