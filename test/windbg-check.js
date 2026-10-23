// A27: ?bld=4&winDbg=1 overlay check — counts SS.winDbg + facade stills on Low/High.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low'] = process.argv.slice(2); const out = 'logs/a27/windbg_' + tier;
fs.mkdirSync('logs/a27', { recursive: true });
(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 300000 });
  const res = { tier }, fail = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?calm=1&seed=7&bld=4&winDbg=1&q=' + tier);
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { SS.walking = false; window.__freezeCam = true; window.__z0 = SS.camera.position.z; });
    await p.waitForTimeout(4000);
    // aim at a side facade where art windows live
    await p.evaluate(() => { const c = SS.camera, z = window.__z0; c.position.set(0, 1.7, z - 30); c.lookAt(-12, 3, z - 38.6); c.updateMatrixWorld(); });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: out + '_facadeL.png' });
    await p.evaluate(() => { const c = SS.camera, z = window.__z0; c.position.set(0, 1.7, z - 30); c.lookAt(12, 3, z - 38.6); c.updateMatrixWorld(); });
    await p.waitForTimeout(1500);
    await p.screenshot({ path: out + '_facadeR.png' });
    res.winDbg = await p.evaluate(() => SS.winDbg || null);
    res.bld4 = await p.evaluate(() => SS.bld4 || null);
    res.rooms = await p.evaluate(() => SS.bld4rooms | 0);
    res.errs = errs;
    if (!res.winDbg) fail.push('SS.winDbg missing');
    else {
      const t = (res.winDbg.placed | 0) + (res.winDbg.inferred | 0) + (res.winDbg.skipped | 0);
      if (t < 1) fail.push('winDbg drew 0 rects');
      if ((res.winDbg.placed | 0) + (res.winDbg.inferred | 0) < 1) fail.push('no placed/inferred rects');
    }
    if (errs.length) fail.push('page errors');
  } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); }
  finally { await b.close(); srv.close(); }
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  console.log(fail.length ? 'WINDBG FAIL ' + fail.join(' ; ') : 'WINDBG PASS');
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
