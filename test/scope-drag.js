const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8815;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
// m1u: scoped drag must be linear and predictable: same angle per px for small and large drags, at normal and low fps,
// right after scoping in, and equal to scope FOV / viewport height (the scene tracks the finger).
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 300000 });
  const fail = [], res = { rows: [] };
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
    await p.goto('http://localhost:' + PORT + '/?seed=7&calm=1&noassist' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 });
    await p.evaluate(() => { SS.player.health = 1e9; window.__freezeCam = true; for (const e of SS.enemies.list) { e.group.position.y = -50; e.pinned = true; e.shootCd = 1e9; } });
    const want = 28 * Math.PI / 180 / 390;
    for (const slow of [0, 180]) {
      await p.evaluate((s) => { window.__slowMs = s; }, slow); await p.waitForTimeout(800);
      for (const px of [12, 24, 48]) {
        await p.evaluate(() => { SS.input.scope = false; }); await p.waitForTimeout(slow ? 900 : 200);
        await p.evaluate(() => { SS.input.scope = true; }); // drag starts right after scoping in, before a frame applied the zoom
        const y0 = await p.evaluate(() => SS.input.yaw);
        await p.mouse.move(600, 200); await p.mouse.down();
        for (let i = 1; i <= px / 4; i++) await p.mouse.move(600 + i * 4, 200);
        await p.mouse.up(); await p.waitForTimeout(slow ? 1500 : 400);
        const y1 = await p.evaluate(() => SS.input.yaw); const per = Math.abs(y1 - y0) / px;
        res.rows.push({ slow, px, perRatio: +(per / want).toFixed(3) });
        if (Math.abs(per / want - 1) > 0.1) fail.push('slow ' + slow + ' drag ' + px + ' px: ' + (per / want).toFixed(2) + 'x expected rate'); } }
  } catch (e) { fail.push(String(e)); }
  console.log(JSON.stringify(res)); await b.close(); srv.close(); console.log(fail.length ? 'SCOPE DRAG FAIL ' + fail.join('; ') : 'SCOPE DRAG PASS'); process.exit(fail.length ? 1 : 0); })();
