// Enemy clip side-by-side: each locomotion clip (with the aim-pose upper body) at 4 m, front + 3/4 views, plus head look-at.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/poses'); fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8797);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 500000 });
  const errs = [], res = {};
  try { const p = await (await b.newContext({ viewport: { width: 640, height: 360 }, isMobile: true, hasTouch: true })).newPage(); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8797/?calm=1&seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1200);
    res.clips = await p.evaluate(() => { SS.walking = false; const e = SS.debug.spawnEnemy('shifter'); window.__e = e; const c = SS.camera.position; SS.enemies.debugPose(e, c.x + 0.6, c.z - 4.2, 'idle'); e.debugVel = null;
      document.querySelectorAll('#hud, .hud, #controls').forEach((x) => x.style.visibility = 'hidden'); return Object.keys(e.actions); });
    for (const clip of ['idle', 'aim', 'walk', 'run', 'strafe', 'crouch', 'crouchIdle', 'lean']) { if (!res.clips.includes(clip)) continue;
      for (const yaw of [0, 0.8]) { await p.evaluate(([clip, yaw]) => { const e = window.__e; e.forceAnim = clip; e.group.rotation.y = Math.atan2(SS.camera.position.x - e.group.position.x, SS.camera.position.z - e.group.position.z) + yaw; e.turned = true; }, [clip, yaw]);
        await p.waitForTimeout(900); await p.screenshot({ path: OUT + '/' + clip + (yaw ? '-34' : '-front') + '.png' }); } }
    if (process.env.SS_PROBE) { for (const np of [1, 0]) for (const clip of ['idle', 'run', 'strafe', 'crouch', 'idle']) { await p.evaluate(([clip, np]) => { window.SS_NOPROC = !!np; const e = window.__e; e.forceAnim = clip; e.group.rotation.y = Math.atan2(SS.camera.position.x - e.group.position.x, SS.camera.position.z - e.group.position.z); }, [clip, np]);
      await p.waitForTimeout(900); await p.screenshot({ path: OUT + '/probe-' + np + '-' + clip + '-' + Date.now() % 100000 + '.png' }); } }
    // head look-at: player moves left/right of the enemy, head follows within limits
    await p.evaluate(() => { window.__e.forceAnim = 'idle'; }); for (const dx of [-2.5, 2.5]) { await p.evaluate((dx) => { SS.camera.position.x += dx; }, dx); await p.waitForTimeout(900); await p.screenshot({ path: OUT + '/look-' + (dx < 0 ? 'left' : 'right') + '.png' }); await p.evaluate((dx) => { SS.camera.position.x -= dx; }, dx); }
    // truck close-up
    await p.evaluate(() => { SS.enemies.debugTruck(); }); await p.waitForTimeout(6500); await p.screenshot({ path: OUT + '/truck.png' });
  } catch (e) { errs.push('exception ' + e.message); }
  console.log(JSON.stringify({ res, errs })); console.log(errs.length ? 'POSES FAIL' : 'POSES PASS'); await b.close(); srv.close(); process.exit(errs.length ? 1 : 0); })();
