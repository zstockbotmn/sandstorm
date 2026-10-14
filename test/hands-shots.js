// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/hands'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8800);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 500000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8800/?calm=1&seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1200);
    await p.waitForTimeout(3000);
    res.arms = await p.evaluate(() => !!SS.arms);
    const shot = async (n) => { await p.screenshot({ path: OUT + '/' + n + '.png' }); };
    await shot('hip');
    await p.evaluate(() => { SS.input.pendingShots = 3; }); await p.waitForTimeout(90); await shot('recoil');
    await p.waitForTimeout(800); await p.evaluate(() => { SS.weapon.ammo = 0; }); await p.waitForTimeout(700); await shot('reload-mid'); await p.waitForTimeout(1600);
    await p.evaluate(() => { SS.input.state.scope = true; }); await p.waitForTimeout(500); await shot('ads-in'); await p.waitForTimeout(1200); await shot('ads');
    await p.evaluate(() => { SS.input.state.scope = false; });
    res.reach = await p.evaluate(() => SS.arms && SS.arms.reach);
    res.dbg = await p.evaluate(() => { const A = SS.arms; if (!A) return null; const o = {}; const w = (x) => { const v = x.getWorldPosition(A.grip.position.clone()); return [v.x, v.y, v.z].map((n) => +n.toFixed(3)); };
      for (const k of ['grip', 'guard', 'mag']) o[k] = w(A[k]); for (const s of ['R', 'L']) for (const k of ['up', 'hand', 'ctl']) o[s + k] = w(A[s][k]); o.len = [A.R.la, A.R.lb, A.L.la, A.L.lb].map((n) => +n.toFixed(3)); return o; });
  } catch (e) { errs.push('exception ' + e.message); }
  console.log(JSON.stringify({ res, errs })); console.log(errs.length ? 'HANDS FAIL' : 'HANDS PASS'); await b.close(); srv.close(); process.exit(errs.length ? 1 : 0); })();
