// A10 perf: Ultra-low in a live wave at pixel ratio 0.4 / 0.6 / 0.75 (pinned via SS.setPR), fps + effect counts per setting.
// Usage: node test/ultra-perf.js [width height] -> logs/a10/ultra-perf.json
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8847;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const W = +(process.argv[2] || 1280), H = +(process.argv[3] || 800); fs.mkdirSync('logs/a10', { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { W, H, runs: [] };
  try { const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=ultra-low'); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    res.label = await p.evaluate(() => document.getElementById('quality').textContent);
    await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    res.prStart = await p.evaluate(() => SS.pr);
    res.wave = await p.evaluate(async () => { const t0 = performance.now(); while (!((SS.engaged | 0) > 0) && performance.now() - t0 < 240000) { if (SS.player.health < 60) SS.player.health = 100; await new Promise((r) => setTimeout(r, 200)); } return { engaged: SS.engaged | 0, sim: +(SS.simTime || 0).toFixed(1) }; });
    for (const pr of [0.4, 0.6, 0.75, 0.5]) {
      res.runs.push(await p.evaluate(async (pr) => { SS.setPR(pr); await new Promise((r) => setTimeout(r, 2500)); const f0 = SS.frameN, t0 = performance.now(); let maxFx = 0, maxCalls = 0, maxTris = 0, maxTrail = 0;
        while (performance.now() - t0 < 10000) { if (SS.player.health < 60) SS.player.health = 100; maxFx = Math.max(maxFx, (SS.fx3 && SS.fx3.puffs && SS.fx3.puffs.live) | 0); const ri = SS.lastRI || [0, 0]; maxCalls = Math.max(maxCalls, ri[0]); maxTris = Math.max(maxTris, ri[1]);
          if (SS.setpieces && SS.setpieces.trailStats) maxTrail = Math.max(maxTrail, SS.setpieces.trailStats().vis); await new Promise((r) => setTimeout(r, 100)); }
        const c = SS.renderer.domElement; return { pr, gotPR: SS.pr, canvas: [c.width, c.height], fps: +((SS.frameN - f0) / ((performance.now() - t0) / 1000)).toFixed(2), maxFx, maxTrail, maxCalls, maxTris, engaged: SS.engaged | 0 }; }, pr));
    }
    res.errs = errs;
  } finally { await b.close(); srv.close(); }
  fs.writeFileSync('logs/a10/ultra-perf.json', JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); })();
