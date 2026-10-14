// Zack's rules: feet on the ground (street fighters), no vertical motion > 0.5 m/s, no prop overlap, pickups applied.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist');
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.hdr': 'application/octet-stream' };
const PORT = 8796;
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = {}; const errs = []; let fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForTimeout(1000);
    await p.evaluate(() => { SS.player.health = 1e9; for (let i = 0; i < 3; i++) { const e = SS.debug.spawnEnemy('shifter'); if (e) e.engaged = true; } SS.enemies.debugTruck(); SS.enemies.debugRoof();
      window.__r = { samples: 0, maxVy: 0, vyAt: null, floatMax: 0, floatAt: null, overlaps: 0 }; const last = new Map(); let lt = performance.now();
      const foot = (e) => { let m = 1e9; e.group.traverse((o) => { if (o.isBone && /Foot$/.test(o.name)) { const v = new SS.THREE.Vector3(); o.getWorldPosition(v); m = Math.min(m, v.y); } }); return m; };
      window.__iv = setInterval(() => { const t = performance.now(), dt = (t - lt) / 1000; lt = t; const R = window.__r; R.samples++;
        { const n = SS.world.overlapCount(); if (n > R.overlaps) { R.overlaps = n; R.ovl = SS.world.overlapCount.last; } }
        for (const e of SS.enemies.list || []) { if (!e.alive || e.fromTruckRide) { last.delete(e); continue; }
          const y = e.group.position.y; if (last.has(e) && dt > 0) { const vy = Math.abs(y - last.get(e)) / dt; if (vy > R.maxVy) { R.maxVy = vy; R.vyAt = { type: e.anchor && e.anchor.type, y, phase: e.phase }; } } last.set(e, y);
          const elev = e.anchor && /roof|window|balcony/.test(e.anchor.type); if (!elev && e.art) { const f = foot(e); if (f < 1e8 && f > R.floatMax) { R.floatMax = f; R.floatAt = { type: e.anchor && e.anchor.type, y, phase: e.phase, kind: e.moveKind, po: e.pelvisOff, r0: e.rootY0, rn: e.art.root && e.art.root.name, ry: e.art.root && e.art.root.position.y, ah: e.ankleH, lo: e.ikLo, gy: e.ikGy, dy: e.dying, st: e.state, legs: e.legs && e.legs.length, d: +SS.camera.position.distanceTo(e.group.position).toFixed(1), anim: e.currentAction && e.currentAction.getClip().name }; } } } }, 100); });
    await p.waitForTimeout(+(process.env.SS_RULES_MS || 45000));
    res.motion = await p.evaluate(() => { clearInterval(window.__iv); return window.__r; });
    // pickups
    res.pick = await p.evaluate(async () => { SS.player.health = 40; SS.weapon.reserve = 30; const h0 = SS.player.health, r0 = SS.weapon.reserve; const c = SS.camera.position;
      SS.stakes.drop('health', c.clone().add(new SS.THREE.Vector3(1, 0, -6))); SS.stakes.drop('ammo', c.clone().add(new SS.THREE.Vector3(-1, 0, -6)));
      await new Promise((r) => setTimeout(r, 4000)); return { h0, h1: SS.player.health, r0, r1: SS.weapon.reserve, left: SS.stakes.items.length, pop: document.querySelectorAll('.ss-pickpop').length }; });
    res.hud = await p.evaluate(() => document.getElementById('ammo').textContent);
    const M = res.motion;
    if (M.maxVy > 0.5) fail.push('vertical speed ' + M.maxVy.toFixed(2) + ' m/s ' + JSON.stringify(M.vyAt));
    if (M.floatMax > 0.25) fail.push('foot float ' + M.floatMax.toFixed(2) + ' m ' + JSON.stringify(M.floatAt));
    if (M.overlaps > 0) fail.push('prop overlaps ' + M.overlaps);
    if (!(res.pick.h1 > res.pick.h0 && res.pick.r1 > res.pick.r0 && res.pick.left === 0)) fail.push('pickups not applied ' + JSON.stringify(res.pick));
    if (!/\/ \d+$/.test(res.hud)) fail.push('HUD reserve missing: ' + res.hud);
  } catch (e) { fail.push('exception ' + e.message); }
  res.errs = errs; res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'RULES FAIL' : 'RULES PASS');
  await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
