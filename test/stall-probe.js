// Light probe: long tasks (>50 ms) from load through ~25 s of play, with labeled timings. node test/stall-probe.js [query]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.wasm': 'application/wasm' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8799);
(async () => { const q = process.argv[2] || '?seed=7&q=high';
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 200000 });
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
    await p.addInitScript(() => { window.__lt = []; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); });
    await p.goto('http://127.0.0.1:8799/' + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 90000 });
    const tPlay = await p.evaluate(() => Math.round(performance.now())); await p.tap('#play'); if (process.env.EXP) { await p.waitForTimeout(4000); await p.evaluate(process.env.EXP); await p.waitForTimeout(8000); } else await p.waitForTimeout(25000);
    console.log(JSON.stringify(await p.evaluate((tPlay) => ({ tPlay, long: window.__lt.filter(x => x[1] > 300), T: window.SS_T, prewarm: SS.prewarmMs, spikes: window.SS_SPIKES, prog: SS.prog, progLog: SS.progLog, quality: SS.quality, autoLow: SS.autoLow }), tPlay)));
  } finally { await b.close(); srv.close(); } })().catch(e => { console.error(e); process.exit(1); });
