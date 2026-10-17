// m1u: a fresh profile (no pick) on a weak GPU must fall back automatically - on the title and in a run. Frames are
// slowed to ~3 fps; the page starts on High (?start=high only sets the starting tier; auto stays on).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8815;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}, fail = [];
  try {
    for (const where of ['title', 'run']) {
      const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
      await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs == null ? 300 : window.__slowMs; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
      await p.addInitScript((w) => { if (w === 'run') window.__slowMs = 0; }, where);
      await p.goto('http://127.0.0.1:' + PORT + '/?start=high' + (where === 'run' ? '&titlebench=0' : '')); await p.waitForFunction(() => window.SS && SS.quality, null, { timeout: 120000 });
      const q0 = await p.evaluate(() => SS.quality);
      if (where === 'run') { await p.waitForFunction(() => SS.art && SS.art.done, null, { timeout: 180000 }); await p.click('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.waitForFunction(() => SS.running, null, { timeout: 60000 }); await p.evaluate(() => { window.__slowMs = 300; SS.player.health = 1e9; }); }
      const t0 = Date.now(); let st = null;
      while (Date.now() - t0 < 90000) { st = await p.evaluate(() => ({ q: SS.quality, auto: SS.autoLow || null, saved: localStorage.getItem('ss.quality'), label: document.getElementById('quality').textContent })); if (st.q === 'ultra-low') break; await p.waitForTimeout(1000); }
      res[where] = { q0, st, secs: Math.round((Date.now() - t0) / 1000) };
      if (q0 !== 'high') fail.push(where + ': did not start on High (' + q0 + ')');
      if (!st || st.q === 'high') fail.push(where + ': stayed on High at ~3 fps ' + JSON.stringify(res[where]));
      else if (!st.auto) fail.push(where + ': dropped but not marked auto ' + JSON.stringify(st));
      await ctx.close();
    }
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'AUTOTIER FAIL' : 'AUTOTIER PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
