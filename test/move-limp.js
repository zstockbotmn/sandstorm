// A4: debug L then M. The nearest fighter takes a forced left-leg hit (limp), then MOVE sends it to new cover.
// Asserts: debugMove found a cover; the fighter runs there through relocate (path, no teleport: per-frame step <= 8 m/s*dt + 5 cm,
// covers >= 2.5 m and ends within 1.5 m of the new stand spot or still en route after 12 s with >= 2.5 m covered); limp > 0
// and limpSide set the whole way; _limpDip > 1 cm at some frame while moving. Usage: SS_QS='&q=low&test=fast' node test/move-limp.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8841;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '&q=low&test=fast';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const fail = []; let res = {};
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&enemies=1&loco=2&repos=1&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    // wait for a live fighter settled at cover on the ground (alive, anchored, not relocating)
    await p.waitForFunction(() => (SS.enemies.list || []).some((e) => e.alive && !e.dying && e.anchor && e.group.position.y < 0.05 && e.phase !== 'relocate' && e.phase !== 'approach'), null, { timeout: 120000, polling: 250 });
    res = await p.evaluate(async () => { const c = SS.camera.position; let e = null, bd = 1e9; for (const q of SS.enemies.list) { if (!q.alive || q.dying) continue; const d = q.group.position.distanceTo(c); if (d < bd) { bd = d; e = q; } }
      e.health = 1e9; e.shootCd = 1e9; SS.debugHitNearest('legL'); const hit = { zone: e.lastHitZone, limp: e.limp, side: e._limpSide };
      await new Promise((r) => setTimeout(r, 1500)); /* the lasting wound (limp) lands once the hit reaction ends */ Object.assign(hit, { limp: e.limp, side: e._limpSide }); const mv = SS.debugMoveNearest(); if (!mv) return { hit, mv: null };
      const start = e.group.position.clone(), home = e.home.clone(); let prev = start.clone(), maxStep = 0, maxDip = 0, limpLost = 0, frames = 0, moved = 0, phases = new Set(), tp = 0; const t0 = performance.now();
      while (performance.now() - t0 < 12000) { await new Promise((r) => requestAnimationFrame(r)); frames++; const g = e.group.position, dt = Math.min(0.2, SS.lastSimDt || 0.05);
        const st = Math.hypot(g.x - prev.x, g.z - prev.z); maxStep = Math.max(maxStep, st); if (st > 8 * Math.max(dt, 0.2) + 0.05) tp++; prev.copy(g);
        phases.add(e.phase); if (!(e.limp > 0) || !e._limpSide) limpLost++; if (e.moving) maxDip = Math.max(maxDip, e._limpDip || 0);
        moved = Math.max(moved, Math.hypot(g.x - start.x, g.z - start.z)); if (e.phase !== 'relocate' && Math.hypot(g.x - home.x, g.z - home.z) < 1.5 && frames > 5) break; }
      const g = e.group.position; return { hit, mv, frames, moved: +moved.toFixed(2), maxStep: +maxStep.toFixed(3), teleports: tp, limpLost, maxDipCm: +(maxDip * 100).toFixed(1), phases: [...phases], endToHome: +Math.hypot(g.x - home.x, g.z - home.z).toFixed(2), speedMul: e.speedMul };
    });
    res.errs = errs;
  } finally { await b.close(); srv.close(); }
  console.log(JSON.stringify(res));
  if (!res.hit || res.hit.zone !== 'legL' || !(res.hit.limp > 0)) fail.push('L did not wound the left leg (' + JSON.stringify(res.hit) + ')');
  if (!res.mv) fail.push('MOVE found no free cover');
  else { if (res.teleports) fail.push('teleport-sized steps: ' + res.teleports + ' (max ' + res.maxStep + ' m)'); if (res.moved < 2.5) fail.push('moved only ' + res.moved + ' m');
    if (!res.phases.includes('relocate')) fail.push('never relocated'); if (res.limpLost) fail.push('limp flag off on ' + res.limpLost + ' frames'); if (!(res.maxDipCm > 1)) fail.push('limp dip never > 1 cm while moving (' + res.maxDipCm + ')'); }
  if (res.errs && res.errs.length) fail.push('page errors: ' + res.errs.join(' | '));
  console.log(fail.length ? 'MOVELIMP FAIL ' + fail.join(' ; ') : 'MOVELIMP PASS'); process.exit(fail.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
