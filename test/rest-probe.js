// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/rest'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8799);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 500000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8799/?calm=1&seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1200);
    res.clips = await p.evaluate(() => { SS.walking = false; const e = SS.debug.spawnEnemy('shifter'); window.__e = e; const c = SS.camera.position; SS.enemies.debugPose(e, c.x + 0.6, c.z - 4.2, 'idle'); e.debugVel = null;
      document.querySelectorAll('#hud, .hud, #controls').forEach((x) => x.style.visibility = 'hidden'); return Object.keys(e.actions); });
    res.rest = [];
    for (const x of [5.4, 2.2, -5.4]) {
      await p.evaluate(() => { for (const q of SS.enemies.list || []) if (q.alive) { q.group.visible = false; q.pinned = true; q.staggerT = 1e9; q.group.position.y = -50; q.shootCd = 1e9; } });
      res.rest.push(await p.evaluate(async (x) => { const e = window.__e = SS.debug.spawnEnemy('shifter'); const c = SS.camera.position; e.group.visible = true; SS.enemies.debugPose(e, x, c.z - 4, 'idle'); e.debugVel = null;
        await new Promise((r) => setTimeout(r, 1500)); const bonesOf = () => { let m = 1e9; e.art.root.traverse((o) => { if (o.isBone) { const v = new SS.THREE.Vector3(); o.getWorldPosition(v); m = Math.min(m, v.y); } }); return m; };
        e.takeHit('body', e.group.position.clone().setY(1.2)); e.takeHit('body', e.group.position.clone().setY(1.2));
        await new Promise((r) => setTimeout(r, 6000)); let hips = null; const h = e.art.root.getObjectByName('Hips'); if (h) { const v = new SS.THREE.Vector3(); h.getWorldPosition(v); hips = +v.y.toFixed(2); }
        return { x, alive: e.alive, minBone: +bonesOf().toFixed(2), hips }; }, x));
      await p.screenshot({ path: OUT + '/rest' + x + '.png' }); }
    if (res.rest.some((r) => r.hips > 0.45)) res.fail = 'body resting above ground';
  } catch (e) { res.err = e.message; }
  console.log(JSON.stringify(res)); console.log(res.fail || res.err ? 'REST FAIL' : 'REST PASS'); await b.close(); srv.close(); process.exit(0); })();
