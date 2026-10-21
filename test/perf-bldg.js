// A4 perf: renderer.info triangles / draw calls with the UV-preserving building LOD vs full meshes everywhere (?blod=0), on Low, High and
// Ultra-low, at the start, mid-street (camera +60 m) and far (+120 m, looking down the street). One browser per config.
// Usage: node test/perf-bldg.js [extraQS]   -> one JSON line per config + a summary table
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8798);
const EXTRA = process.argv[2] || '';
(async () => { const rows = [];
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  try {
    for (const tier of ['low', 'high', 'ultra']) for (const mode of ['uvlod', 'full']) {
      const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      const p = await ctx.newPage();
      const q = '?calm=1&seed=7&q=' + (tier === 'high' ? 'high' : 'low') + (mode === 'full' ? '&blod=0' : "") + EXTRA;
      await p.goto('http://127.0.0.1:8798/' + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 120000 });
      if (tier === 'ultra') await p.evaluate(() => SS.goUltra('perf-probe'));
      await p.tap('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 });
      const row = { tier, mode, q: await p.evaluate(() => SS.quality) };
      let z0 = null;
      for (const [name, dz] of [['start', 0], ['mid', 60], ['far', 120]]) {
        await p.evaluate((dz) => { const c = SS.camera; if (window.__z0 == null) window.__z0 = c.position.z; c.position.z = window.__z0 - dz; SS.walking = false; }, dz);
        await p.waitForTimeout(2500);
        const ri = await p.evaluate((dz) => { SS.camera.position.z = window.__z0 - dz; return new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(() => res(SS.lastRI)))); }, dz);
        row[name] = { calls: ri[0], tris: ri[1] };
      }
      console.log(JSON.stringify(row)); rows.push(row); await ctx.close();
    }
  } finally { await b.close(); srv.close(); }
  console.log('tier   view   uvLOD tris/calls  full tris/calls    ratio');
  for (const t of ['low', 'high', 'ultra']) for (const v of ['start', 'mid', 'far']) { const a = rows.find(r => r.tier === t && r.mode === 'uvlod'), o = rows.find(r => r.tier === t && r.mode === 'full'); if (!a || !o) continue;
    console.log(t.padEnd(6), v.padEnd(6), (a[v].tris + '/' + a[v].calls).padEnd(15), (o[v].tris + '/' + o[v].calls).padEnd(17), (a[v].tris / Math.max(1, o[v].tris)).toFixed(2)); }
})().catch(e => { console.error(e); process.exit(1); });
