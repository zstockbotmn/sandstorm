// Fix 4 probe: holding FIRE (mouse and touch) auto-fires at the rifle rate.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8797;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}; const fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.waitForTimeout(1500); await p.evaluate(() => { SS.player.health = 1e9; SS.weapon.reserve = 999; });
    const bb = await p.locator('[data-ctl=fire]').boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    const s0 = await p.evaluate(() => SS.weapon.shotsFired); await p.mouse.move(x, y); await p.mouse.down(); await p.waitForTimeout(1500); await p.mouse.up();
    res.mouse = (await p.evaluate(() => SS.weapon.shotsFired)) - s0; await p.waitForTimeout(3000); await p.evaluate(() => { SS.weapon.ammo = 30; });
    const c = await ctx.newCDPSession(p); const s1 = await p.evaluate(() => SS.weapon.shotsFired);
    await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await p.waitForTimeout(1500);
    await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    res.touch = (await p.evaluate(() => SS.weapon.shotsFired)) - s1;
    // Tester repro: an auto-reload while FIRE is held must resume firing (1/30 -> reload -> keeps firing)
    for (const [am, rs, how] of [[1, 30, 'mouse'], [30, 0, 'mouse'], [20, 60, 'touch'], [1, 30, 'touch']]) {
      await p.waitForTimeout(800); await p.evaluate(([am, rs]) => { SS.weapon.reloading = false; SS.weapon.ammo = am; SS.weapon.reserve = rs; }, [am, rs]); const s2 = await p.evaluate(() => SS.weapon.shotsFired);
      if (how === 'mouse') { await p.mouse.move(x, y); await p.mouse.down(); } else await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 2 }] });
      await p.waitForTimeout(5000);
      const st = await p.evaluate(() => ({ fire: SS.input.fire, ammo: SS.weapon.ammo, reserve: SS.weapon.reserve, reloading: SS.weapon.reloading }));
      if (how === 'mouse') await p.mouse.up(); else await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      const n = (await p.evaluate(() => SS.weapon.shotsFired)) - s2; (res.reload = res.reload || []).push({ am, rs, how, n, st });
      const need = am + Math.min(rs, 30) >= 8 ? 8 : am; if (n < Math.min(need, am + rs)) fail.push('hold through reload fired ' + n + ' at ' + am + '/' + rs + ' ' + how + ' ' + JSON.stringify(st)); }
    if (!(res.mouse >= 6)) fail.push('mouse hold fired ' + res.mouse); if (!(res.touch >= 6)) fail.push('touch hold fired ' + res.touch);
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'FIREHOLD FAIL' : 'FIREHOLD PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
