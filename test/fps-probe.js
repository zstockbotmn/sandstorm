// FPS probe: high tier + low tier (?art=0), swiftshader. Serves dist/ on :8797.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8797);
async function probe(pageUrl, label) {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: 180000 });
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const p = await ctx.newPage();
    await p.goto(pageUrl);
    await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
    await p.waitForFunction(() => window.SS.art && window.SS.art.done, null, { timeout: 45000 }).catch(() => {});
    await p.tap('#play');
    await p.waitForTimeout(2500);
    const fps = await p.evaluate(async () => {
      const samples = [];
      let last = performance.now(), frames = 0;
      await new Promise((resolve) => {
        function tick(now) {
          frames++;
          if (now - last >= 1000) { samples.push(frames); frames = 0; last = now; }
          if (samples.length >= 5) resolve();
          else requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
      return { samples, avg: Math.round(avg * 10) / 10, tier: (window.SS.art && window.SS.art.tier) || null };
    });
    console.log(JSON.stringify({ label, ...fps }));
    return fps;
  } finally { await b.close().catch(() => {}); }
}
(async () => {
  const high = await probe('http://127.0.0.1:8797/?calm=1&seed=7', 'desktop-high-swiftshader');
  const low = await probe('http://127.0.0.1:8797/?calm=1&seed=7&art=0', 'low-tier-swiftshader');
  fs.mkdirSync(path.resolve(__dirname, '../screenshots'), { recursive: true });
  fs.writeFileSync(path.resolve(__dirname, '../screenshots/fps-probe.json'), JSON.stringify({ high, low }, null, 2));
  console.log('FPS_PROBE_DONE');
  srv.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
