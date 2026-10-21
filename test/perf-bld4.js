// Step 4 perf (NOT run yet): fps + draw calls + triangles with ?bld=4 vs without (bld off) on Low and Ultra-low.
// calm=1, staged camera (window.__freezeCam), two views (start, +60 m down the street); per view 3 s settle, then
// 8 s of real rAF frames -> fps, plus SS.lastRI [calls, tris] and SS.pr. One browser, a fresh context per config.
// WARN (not fail) when bld=4 costs > 15 % fps or > 30 % draw calls against bld off; fails only on page errors.
// Usage: node test/perf-bld4.js [outJson]   (default logs/step4/perf-bld4.json)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const OUT = process.argv[2] || 'logs/step4/perf-bld4.json'; fs.mkdirSync(path.dirname(OUT), { recursive: true });
(async () => { const rows = [], warn = [], fail = [];
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1200000 });
  try {
    for (const tier of ['low', 'ultra-low']) for (const bld of ['off', '4']) {
      const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
      await p.goto('http://127.0.0.1:' + PORT + '/?calm=1&seed=7&q=' + tier + (bld === '4' ? '&bld=4' : '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
      await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
      const row = { tier, bld, quality: await p.evaluate(() => SS.quality) };
      await p.evaluate(() => { SS.walking = false; window.__freezeCam = true; window.__z0 = SS.camera.position.z; });
      for (const [name, dz] of [['start', 0], ['mid', 60]]) {
        const set = (dz) => { const c = SS.camera; c.position.set(0, 1.7, window.__z0 - dz); c.lookAt(0, 1.7, window.__z0 - dz - 40); c.updateMatrixWorld(); };
        await p.evaluate(set, dz); await p.waitForTimeout(3000); await p.evaluate(set, dz);
        row[name] = await p.evaluate(() => new Promise((res) => { let n = 0; const t0 = performance.now(); const tick = () => { n++; if (performance.now() - t0 < 8000) requestAnimationFrame(tick); else res({ fps: +(n / ((performance.now() - t0) / 1000)).toFixed(2), calls: SS.lastRI && SS.lastRI[0], tris: SS.lastRI && SS.lastRI[1], pr: SS.pr }); }; requestAnimationFrame(tick); }));
      }
      row.bld4 = await p.evaluate(() => SS.bld4 || null); row.errs = errs; if (errs.length) fail.push(tier + ' bld ' + bld + ': page errors');
      console.log(JSON.stringify(row)); rows.push(row); await ctx.close();
    }
  } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); } finally { await b.close(); srv.close(); }
  console.log('tier       view   off fps/calls/tris        bld4 fps/calls/tris       fps ratio');
  for (const t of ['low', 'ultra-low']) for (const v of ['start', 'mid']) { const a = rows.find((r) => r.tier === t && r.bld === 'off'), o = rows.find((r) => r.tier === t && r.bld === '4'); if (!a || !o || !a[v] || !o[v]) continue;
    const rf = o[v].fps / Math.max(0.01, a[v].fps), rc = o[v].calls / Math.max(1, a[v].calls);
    if (rf < 0.85) warn.push(t + ' ' + v + ' fps x' + rf.toFixed(2)); if (rc > 1.3) warn.push(t + ' ' + v + ' calls x' + rc.toFixed(2));
    console.log(t.padEnd(10), v.padEnd(6), (a[v].fps + '/' + a[v].calls + '/' + a[v].tris).padEnd(25), (o[v].fps + '/' + o[v].calls + '/' + o[v].tris).padEnd(25), rf.toFixed(2)); }
  fs.writeFileSync(OUT, JSON.stringify({ rows, warn, fail }, null, 1));
  if (warn.length) console.log('WARN ' + warn.join('; '));
  console.log(fail.length ? 'PERFBLD4 FAIL ' + fail.join('; ') : 'PERFBLD4 PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
