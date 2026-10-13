// Art stills for the high tier: street, fighters, scope, ragdoll, roadside props. Serves dist/ on :8796.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'), OUT = path.resolve(__dirname, '../screenshots/m2-art');
fs.mkdirSync(OUT, { recursive: true });
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8796);
const res = {};
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: +(process.env.SS_TIMEOUT_MS || 480000) });
 try {
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1' });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push('console: ' + m.text()));
  await p.goto('http://127.0.0.1:8796/?calm=1&seed=7');
  await p.waitForFunction(() => window.SS && document.querySelector('#play'), null, { timeout: 60000 });
  await p.waitForFunction(() => window.SS.art && window.SS.art.done, null, { timeout: 40000 });
  res.art = await p.evaluate(() => ({ tier: SS.art.tier, loaded: SS.art.loaded.slice(), failed: SS.art.failed.slice() }));
  await p.tap('#play');
  await p.waitForTimeout(3000); // walk down the street before the stills
  // Slightly left, then right, still looking down the street.
  await p.evaluate(() => { SS.input.yaw = -0.35; });
  await p.waitForFunction(() => Math.abs(SS.camera.rotation.y - 0.35) < 0.02);
  await p.screenshot({ path: OUT + '/1-street.png' });
  await p.evaluate(() => { SS.input.yaw = 0.35; });
  await p.waitForFunction(() => Math.abs(SS.camera.rotation.y + 0.35) < 0.02);
  await p.screenshot({ path: OUT + '/2-street-right.png' });
  await p.evaluate(() => { SS.debug.spawnEnemy('popper'); SS.debug.spawnEnemy('shifter'); SS.debug.spawnEnemy('flanker'); });
  await p.waitForTimeout(2500);
  res.aimed = await p.evaluate(() => {
    const list = (SS.enemies && SS.enemies.list) || [];
    const cam = SS.camera.position;
    let best = null, bestD = Infinity;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (!e.alive || !e.exposed) continue;
      const d = e.group.position.distanceTo(cam);
      if (d < bestD) { best = e; bestD = d; }
    }
    SS._artEnemy = best;
    const e = SS._artEnemy; if (!e || !e.alive) return false;
    const v = new SS.camera.position.constructor(); e.group.getWorldPosition(v); v.y += 1.3; v.sub(SS.camera.position);
    SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); return true;
  });
  await p.waitForTimeout(150);
  await p.screenshot({ path: OUT + '/3-fighters.png' });
  await p.keyboard.press('q');
  await p.waitForTimeout(800);
  await p.evaluate(() => {
    const e = SS._artEnemy; if (!e || !e.alive) return false;
    const v = new SS.camera.position.constructor(); e.group.getWorldPosition(v); v.y += 1.3; v.sub(SS.camera.position);
    SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); return true;
  });
  await p.waitForTimeout(150);
  await p.screenshot({ path: OUT + '/4-scoped.png' });
  // Hold fire on that enemy until it drops, same loop as the m1 shoot test.
  res.kill = await p.evaluate(async () => {
    const e = SS._artEnemy; if (!e) return { spawned: false, killed: false };
    const until = performance.now() + 9000; const v = new SS.camera.position.constructor();
    while (performance.now() < until && e.alive) {
      if (e.exposed) { e.group.getWorldPosition(v); v.y += 1.3; v.sub(SS.camera.position);
        SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); SS.input.fire = true; }
      else SS.input.fire = false;
      if (SS.weapon.ammo === 0) SS.input.reloadPressed = true;
      await new Promise(r => setTimeout(r, 30));
    }
    SS.input.fire = false; return { spawned: true, killed: !e.alive };
  });
  await p.waitForTimeout(600);
  await p.screenshot({ path: OUT + '/5-ragdoll.png' });
  // Roadside props: yaw ±0.6 toward the nearer curb, level, unscoped.
  if (await p.evaluate(() => SS.input.scope)) await p.keyboard.press('q');
  res.propYaw = await p.evaluate(() => {
    SS.input.pitch = 0;
    const cam = SS.camera.position;
    let side = 1, best = Infinity;
    const segs = (SS.world && SS.world.segments) || [];
    for (let s = 0; s < segs.length; s++) {
      const pts = segs[s].coverPoints || [];
      for (let i = 0; i < pts.length; i++) {
        const pos = pts[i].pos;
        const dx = pos.x - cam.x, dz = pos.z - cam.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 6 || dist > 35) continue;
        const yaw = Math.atan2(dx, -dz);
        if (Math.abs(yaw) < 0.2) continue;
        if (dist < best) { best = dist; side = yaw > 0 ? 1 : -1; }
      }
    }
    SS.input.yaw = side * 0.6;
    return SS.input.yaw;
  });
  await p.waitForFunction(() => Math.abs(Math.abs(SS.input.yaw) - 0.6) < 0.001 && Math.abs(SS.camera.rotation.y + SS.input.yaw) < 0.02);
  await p.waitForTimeout(500);
  await p.screenshot({ path: OUT + '/6-props.png' });
  res.renderer = await p.evaluate(() => {
    const render = SS.renderer && SS.renderer.info && SS.renderer.info.render;
    return render ? { triangles: render.triangles, calls: render.calls } : null;
  });
  res.triangles = res.renderer ? res.renderer.triangles : null;
  res.errors = errs;
  console.log(JSON.stringify(res, null, 1));
  if (errs.length) throw new Error('page errors: ' + errs.join(' | '));
  console.log('ART SHOTS PASS');
 } finally { await b.close(); srv.close(); } })().catch(e => { console.error('ART SHOTS FAIL', e.message); process.exit(1); });
