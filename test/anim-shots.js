// Foot IK / locking and hit-to-ragdoll sequences. Serves dist/ on :8785.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/anim');
fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8785);
const res = {};
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 480000) });
 try {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://127.0.0.1:8785/?calm=1&seed=7' + (process.env.SS_QS || ''));
  await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
  await p.waitForFunction(() => window.SS.art && window.SS.art.done, null, { timeout: 60000 });
  await p.tap('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.waitForTimeout(2500);
  // Foot sequence: a fighter runs across 7 m ahead; planted (locked) feet must not slide.
  const foot = await p.evaluate(async () => {
    const frames = (n) => new Promise((ok) => { let k = 0; const f = () => (++k >= n ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); });
    const e = SS.debug.spawnEnemy('popper'); const c = SS.camera.position;
    SS.enemies.debugPose(e, c.x - 3, c.z - 7, 'idle'); e.health = 1e6; e.debugVel = new SS.THREE.Vector3(1.6, 0, 0); e.group.rotation.set(0, Math.PI / 2, 0); e.group.quaternion.setFromEuler(e.group.rotation);
    SS.input.yaw = 0; SS.input.pitch = 0.12; window.__footE = e;
    let slide = 0, lockedFrames = 0; const prev = [null, null];
    for (let k = 0; k < 60; k++) { await frames(1); if (k < 6) { prev[0] = prev[1] = null; continue; } const d = e.ikDbg || []; for (let i = 0; i < 2; i++) { const f = d[i]; if (!f) continue;
      if (f.locked && prev[i] && prev[i].locked) { slide = Math.max(slide, Math.hypot(f.x - prev[i].x, f.z - prev[i].z)); lockedFrames++; } prev[i] = f; } }
    return { slide, lockedFrames, legs: (e.legs || []).length, dist: +SS.camera.position.distanceTo(e.group.position).toFixed(1), ank: e.ankleH, gy: e.group.position.y, ik: e.ikDbg, pinned: e.pinned, moving: e.moving, anim: e.animState };
  });
  for (let i = 0; i < 4; i++) { await p.screenshot({ path: OUT + '/foot-' + i + '.png' }); await p.waitForTimeout(250); }
  res.foot = foot;
  // Hit sequence: kill the runner; hit clip then ragdoll.
  await p.evaluate(() => { const e = window.__footE; e.pinned = false; e.debugVel = null; e.health = 1; e.takeHit('body', e.group.position.clone().setY(1.3)); });
  for (let i = 0; i < 5; i++) { await p.screenshot({ path: OUT + '/hit-' + i + '.png' }); await p.waitForTimeout(120); }
  res.dolls = await p.evaluate(() => (SS.enemies.ragdolls || {}).length);
  res.errors = errs; console.log(JSON.stringify(res));
  if (errs.length) throw new Error('page errors');
  if (foot.legs === 2 && foot.lockedFrames > 5 && foot.slide > 0.02) throw new Error('locked foot slid ' + foot.slide);
  console.log('ANIM SHOTS PASS');
 } finally { await b.close(); srv.close(); } })().catch(e => { console.error('ANIM SHOTS FAIL', e.message); process.exit(1); });
