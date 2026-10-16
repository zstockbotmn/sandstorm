// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/armprobe'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8798);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 500000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8798/?calm=1&seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1200);
    res.clips = await p.evaluate(() => { SS.walking = false; const e = SS.debug.spawnEnemy('shifter'); window.__e = e; const c = SS.camera.position; SS.enemies.debugPose(e, c.x + 0.6, c.z - 4.2, 'idle'); e.debugVel = null;
      document.querySelectorAll('#hud, .hud, #controls').forEach((x) => x.style.visibility = 'hidden'); return Object.keys(e.actions); });
    await p.waitForTimeout(12000); res.cam = await p.evaluate(() => ({ y: +SS.camera.position.y.toFixed(2), cover: SS.input.cover, state: SS.cover && SS.cover.state })); // let auto-cover settle so the camera isn't ducked below the fighter
    res.others = await p.evaluate(() => { const e = window.__e; let n = 0; for (const x of SS.enemies.list || []) if (x !== e && x.alive) { x.group.visible = false; x.pinned = true; x.staggerT = 1e9; x.group.position.y = -50; n++; }
      const c = SS.camera.position; SS.enemies.debugPose(e, c.x + 0.6, c.z - 4.2, 'idle'); return n; }); // lone fighter, placed after the camera settled
    for (const yaw of [0, 0.8]) { await p.evaluate((yaw) => { const e = window.__e; e.forceAnim = 'idle'; e.group.rotation.y = Math.atan2(SS.camera.position.x - e.group.position.x, SS.camera.position.z - e.group.position.z) + yaw; e.turned = true; }, yaw);
      await p.waitForTimeout(900); await p.screenshot({ path: OUT + '/idle' + yaw + '.png' });
      res['y' + yaw] = await p.evaluate(() => { const e = window.__e, V = () => new SS.THREE.Vector3(), r = e.art.root; const g = (n) => { const o = r.getObjectByName(n); return o ? o.getWorldPosition(V()).toArray().map((v) => +v.toFixed(2)) : null; };
        return { saW: e.saW, anim: e.animState, L: g('LeftHand'), R: g('RightHand'), Ls: g('LeftArm'), Rs: g('RightArm'), hips: g('Hips'), pos: e.group.position.toArray().map((v) => +v.toFixed(2)) }; }); }
  } catch (e) { res.err = e.message; }
  console.log(JSON.stringify(res)); await b.close(); srv.close(); process.exit(0); })();
