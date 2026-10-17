// Ultra-low simplification: draw calls before/after goUltra, screenshot. Not in the suite (diagnostic).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8805;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 300000 });
  const res = {}; try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&q=low'); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    res.titleHudHidden = await p.evaluate(() => getComputedStyle(document.getElementById('hud')).visibility);
    fs.mkdirSync('screenshots/ultra', { recursive: true }); await p.screenshot({ path: 'screenshots/ultra/0-title.png' });
    await p.click('#play'); await p.waitForTimeout(4000); res.hudRun = await p.evaluate(() => getComputedStyle(document.getElementById('hud')).visibility);
    res.low = await p.evaluate(() => SS.renderer.info.render.calls); await p.screenshot({ path: 'screenshots/ultra/1-low.png' });
    await p.evaluate(() => SS.goUltra('probe')); await p.waitForTimeout(4000);
    res.ultra = await p.evaluate(() => ({ calls: SS.renderer.info.render.calls, hidden: SS.ultraHidden, q: SS.quality })); await p.screenshot({ path: 'screenshots/ultra/2-ultra.png' });
  } catch (e) { res.err = e.message; } console.log(JSON.stringify(res)); await b.close(); srv.close(); process.exit(0); })();
