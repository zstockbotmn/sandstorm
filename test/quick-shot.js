// Quick high-tier still for visual review: node test/quick-shot.js <out.png> "<query>" "<js to run after play>" [waitMs]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8797);
(async () => { const [out, q = '?calm=1&seed=7', js = '', wait = '2500'] = process.argv.slice(2);
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 240000 });
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8797/' + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 90000 });
    await p.tap('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.waitForTimeout(800); if (js) await p.evaluate(js); await p.waitForTimeout(+wait);
    await p.screenshot({ path: out }); console.log(JSON.stringify({ out, errs, dbg: await p.evaluate(() => window.__dbg), art: await p.evaluate(() => ({ loaded: SS.art.loaded, failed: SS.art.failed })) }));
  } finally { await b.close(); srv.close(); } })().catch(e => { console.error(e); process.exit(1); });
