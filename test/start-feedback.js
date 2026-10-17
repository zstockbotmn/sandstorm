const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8816;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
// m1u: Play/Restart show 'Starting…' at once (same input event) and stay silent until the first run frame is drawn.
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 400000 });
  const fail = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await p.addInitScript(() => { window.__sf = []; new MutationObserver(() => { try { const on = document.body.classList.contains('starting'); const L = window.__sf; if (!L.length || L[L.length - 1].on !== on) {
        const el = document.getElementById('starting'); L.push({ on, t: performance.now(), disp: el ? getComputedStyle(el).display : 'none', live: !!(window.SS && SS.audio && SS.audio.isLive && SS.audio.isLive()), running: !!(window.SS && SS.running) }); } } catch (er) { window.__sfErr = String(er); } })
      .observe(document, { attributes: true, subtree: true, attributeFilter: ['class'] }); });
    await p.goto('http://localhost:' + PORT + '/?seed=7&calm=1' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    const check = async (label) => { await p.waitForFunction(() => window.SS && SS.running && !document.body.classList.contains('starting'), null, { timeout: 90000 }); await p.waitForTimeout(300);
      const r = await p.evaluate(() => ({ pressT: SS.pressT, sfType: typeof window.__sf, sfErr: window.__sfErr, sf: (window.__sf || []).splice(0), startPaintMs: SS.startPaintMs, liveNow: SS.audio.isLive() }));
      const on = r.sf.find((x) => x.on), off = r.sf.find((x) => !x.on && on && x.t >= on.t);
      res[label] = { sfType: r.sfType, sfErr: r.sfErr, n: r.sf.length, onLagMs: on && Math.round(on.t - r.pressT), overlay: on && on.disp, liveWhileStarting: on && on.live, offRunning: off && off.running, startPaintMs: r.startPaintMs, liveNow: r.liveNow };
      if (!on) fail.push(label + ': no Starting… state'); else { if (on.t - r.pressT > 50) fail.push(label + ': Starting… came ' + Math.round(on.t - r.pressT) + ' ms after the press'); if (on.disp !== 'flex') fail.push(label + ': overlay not displayed'); if (on.live) fail.push(label + ': audio live before the picture'); }
      if (!r.liveNow) fail.push(label + ': audio not live after the first frame'); };
    fs.mkdirSync(path.resolve(__dirname, '../screenshots/feedback'), { recursive: true }); await p.evaluate(() => document.body.classList.add('starting')); await p.waitForTimeout(300); await p.screenshot({ path: path.resolve(__dirname, '../screenshots/feedback/6-starting.png') }); await p.evaluate(() => { document.body.classList.remove('starting'); window.__sf.length = 0; });
    await p.click('#play'); await check('play');
    await p.waitForTimeout(3000); await p.evaluate(() => SS.onDeath()); await p.waitForTimeout(1500); await p.click('#restart'); await check('restart');
  } catch (e) { fail.push(String(e)); }
  console.log(JSON.stringify(res)); await b.close(); srv.close(); console.log(fail.length ? 'START FEEDBACK FAIL ' + fail.join('; ') : 'START FEEDBACK PASS'); process.exit(fail.length ? 1 : 0); })();
