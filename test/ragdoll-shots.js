// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/ragdoll'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8802);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 500000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8802/?seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1200);
    // wait for an exposed enemy within 30 m, freeze the camera on it
    res.tgt = await p.evaluate(async () => { const t0 = performance.now(); while (performance.now() - t0 < 120000) {
      const c = SS.camera.position, e = (SS.enemies.list || []).filter((x) => x.alive && x.exposed && x.art && x.group.position.distanceTo(c) < 30).sort((a, b) => a.group.position.distanceTo(c) - b.group.position.distanceTo(c))[0];
      if (e) { window.__rdT = e; const v = e.group.position.clone(); v.y += 1.0; v.sub(c); SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); return +e.group.position.distanceTo(c).toFixed(1); }
      await new Promise((r) => setTimeout(r, 250)); } return null; });
    await p.waitForTimeout(300); await p.evaluate(() => { window.__freezeCam = true; SS.input.fire = false; });
    await p.screenshot({ path: OUT + '/0-before.png' });
    res.kill = await p.evaluate(() => { const e = window.__rdT; if (!e) return null; const pt = e.group.position.clone(); pt.y += 1.25; let n = 0; while (e.alive && n < 10) { e.takeHit('torso', pt); n++; } return { n, alive: e.alive, dying: !!e.dying }; });
    for (const [ms, n] of [[60, '1-hit'], [120, '2-react'], [200, '3-handoff'], [350, '4-fall'], [900, '5-down']]) { await p.waitForTimeout(ms); await p.screenshot({ path: OUT + '/' + n + '.png' }); }
    res.ssErrors = await p.evaluate(() => SS.errors || []);
  } catch (e) { errs.push('exception ' + e.message); }
  await b.close(); srv.close();
  console.log(JSON.stringify({ res, errs })); console.log(errs.length || !res.kill || res.kill.alive ? 'RAGDOLL FAIL' : 'RAGDOLL PASS'); process.exit(errs.length ? 1 : 0);
})();
