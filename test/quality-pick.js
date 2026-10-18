// m1t: a manual quality pick on the title must stick: never auto-lowered, never overwritten ('auto: saved'), and one
// press = one step even when pressed twice under lag. Frames are slowed (~6 fps) so the auto fallback would fire.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8812;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { steps: [] }, fail = [];
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const t0 = performance.now(); while (performance.now() - t0 < 150) {} cb(t); }); });
    const state = () => p.evaluate(() => ({ q: SS.quality, auto: SS.autoLow || null, saved: localStorage.getItem('ss.quality'), pick: localStorage.getItem('ss.qualityPick'), label: document.getElementById('quality').textContent }));
    await p.goto('http://127.0.0.1:' + PORT + '/' + (process.env.SS_EXTRA ? '?' + process.env.SS_EXTRA.replace(/^&/, '') : '')); await p.evaluate(() => localStorage.clear()); await p.reload();
    await p.waitForFunction(() => window.SS && SS.quality === 'ultra-low', null, { timeout: 120000 }).catch(() => {});
    res.steps.push(['auto', await state()]);
    const next = (c) => (c === 'ultra-low' ? 'low' : c === 'low' ? 'high' : 'ultra-low'); let cur = res.steps[0][1].q;
    for (let k = 0; k < 3; k++) { const want = next(cur); cur = want;
      const bb = await p.locator('#quality').boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
      const nav = p.waitForNavigation({ timeout: 60000 }).catch(() => null);
      await p.mouse.move(x, y); await p.mouse.down(); await p.mouse.up(); await p.mouse.down(); await p.mouse.up(); // double press under lag: must step once
      await nav; await p.waitForFunction(() => window.SS && SS.quality, null, { timeout: 120000 }); await p.waitForTimeout(15000); // slow frames: auto would drop it here
      const st = await state(); res.steps.push([want, st]);
      if (st.q !== want) fail.push('picked ' + want + ' but running ' + st.q + ' ' + JSON.stringify(st));
      if (st.saved !== want) fail.push('picked ' + want + ' but saved ' + st.saved);
      if (st.auto || /auto/.test(st.label)) fail.push('picked ' + want + ' shows auto ' + JSON.stringify(st));
    }
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'QPICK FAIL' : 'QPICK PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
