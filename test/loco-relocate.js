// p1b (?loco=2&repos=1): enemies relocate on the REAL level at LOW fps with the DEFAULT timers (no SS_REPOS_S / SS_RELOC_S).
// Real waves (no calm, no spawnEnemy). After first contact the page is slowed to ~1 fps (busy-wait before each frame,
// SS_SPIN_MS, default 800) so the game runs its 4 x 50 ms catch-up steps like the tester's box.
// Case A (squad): with >= 2 live fighters, within SS_A_SIM sim-s (default 40) at least one non-last fighter repositions
//   (SS.reposSquad), never two at once, and no two fighters hold cover points closer than 1.5 m (stacking).
// Case B (last): kill all but one, no spawns; the last fighter repositions or falls back within 32 sim-s (20-25 s timer +
//   3-5 s retries), runs exposed, no per-frame jump > 1.2 m. Logs _reposWhy / _reposRej / reposFails when it does not.
// Usage: SS_QS='&q=low&test=fast' node test/loco-relocate.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8838;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '', SPIN = Number(process.env.SS_SPIN_MS || 800), A_SIM = Number(process.env.SS_A_SIM || 40);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = { spinMs: SPIN }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const s = window.__spinMs | 0; if (s) { const t0 = performance.now(); while (performance.now() - t0 < s) {} } cb(t + 0); if (window.__post && t !== window.__pfT) { window.__pfT = t; try { window.__post(); } catch (_) {} } }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&repos=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { SS.player.health = 1e6; setInterval(() => { if (SS.player) SS.player.health = 1e6; }, 500); });
  await p.waitForFunction(() => (SS.enemies.list || []).filter((e) => e.alive && e.engaged).length >= 2, null, { timeout: 180000 }).catch(() => {});
  res.overrides = await p.evaluate(() => [typeof window.SS_REPOS_S, typeof window.SS_RELOC_S]);
  await p.evaluate((s) => { window.__spinMs = s; }, SPIN);
  // Case A: squad relocation, one at a time, no stacking
  res.A = await p.evaluate(async (A_SIM) => { const t0 = SS.simTime, r0 = SS.reposSquad | 0; let two = 0, minGap = 99, frames = 0, wall0 = performance.now(), why = {};
    while (SS.simTime - t0 < A_SIM) { await new Promise((r) => requestAnimationFrame(r)); frames++;
      const L = (SS.enemies.list || []).filter((e) => e.alive); if (L.length < 2) break;
      if (L.filter((e) => e._repositioning && e.moving).length > 1) two++;
      for (const e of L) why[e._reposWhy || '-'] = (why[e._reposWhy || '-'] | 0) + 1;
      const held = L.filter((e) => e.anchor && e.anchor.pos && ['takeCover', 'hide', 'peek', 'fire'].includes(e.phase) && e.group.position.y < 0.5);
      for (let i = 0; i < held.length; i++) for (let j = i + 1; j < held.length; j++) minGap = Math.min(minGap, Math.hypot(held[i].anchor.pos.x - held[j].anchor.pos.x, held[i].anchor.pos.z - held[j].anchor.pos.z));
      if ((SS.reposSquad | 0) > r0 && SS.simTime - t0 > 5) break; }
    return { squadMoves: (SS.reposSquad | 0) - r0, simS: +(SS.simTime - t0).toFixed(1), wallS: Math.round((performance.now() - wall0) / 1000), fps: +(frames / ((performance.now() - wall0) / 1000)).toFixed(2), twoAtOnce: two, minGapM: +minGap.toFixed(2), why,
      alive: (SS.enemies.list || []).filter((e) => e.alive).length }; }, A_SIM);
  // Case B: last fighter, default 20-25 s timer
  res.B = await p.evaluate(async () => { const L = (SS.enemies.list || []).filter((e) => e.alive); const keep = L.find((x) => !(x.anchor && /roof|window/.test(x.anchor.type))) || L[0];
    if (!keep) return { skipped: 'no fighter' }; SS.debug.noSpawn = true; for (const x of L) if (x !== keep) { x.health = 1; try { x.takeHit('head', x.group.position.clone().setY(1.6)); } catch (_) {} }
    const t0 = SS.simTime, r0 = keep.repositions | 0; let jump = 0, jumpAt = null, last = keep.group.position.clone(), runF = 0, exp = 0, why = {};
    while (SS.simTime - t0 < 34) { await new Promise((r) => requestAnimationFrame(r)); const p2 = keep.group.position; const jd = p2.distanceTo(last); if (jd > jump) { jump = jd; jumpAt = { phase: keep.phase, teleports: keep.teleports | 0, last: SS.lastTeleport || null, simS: +(SS.simTime - t0).toFixed(1) }; } last.copy(p2);
      why[keep._reposWhy || '-'] = (why[keep._reposWhy || '-'] | 0) + 1; if (keep._repositioning && keep.moving) { runF++; if (keep.exposed) exp++; }
      if ((keep.repositions | 0) > r0 && runF > 4) break; if (!keep.alive) break; }
    return { repositions: (keep.repositions | 0) - r0, atSimS: +(SS.simTime - t0).toFixed(1), reposAt: keep._reposAt && +keep._reposAt.toFixed(1), fails: keep.reposFails | 0, fellBack: keep.fellBack | 0, rej: keep._reposRej || null, why,
      jumpM: +jump.toFixed(2), jumpAt, teleports: keep.teleports | 0, seenForced: keep.seenForced | 0, exposedFrac: runF ? +(exp / runF).toFixed(2) : null, alive: keep.alive, phase: keep.phase, anchor: keep.anchor && keep.anchor.type }; });
  await p.evaluate(() => { window.__spinMs = 0; });
  if (res.overrides.some((t) => t !== 'undefined')) fail.push('timer override set ' + res.overrides);
  const A = res.A; if (A.alive >= 2 || A.squadMoves) { if (A.squadMoves < 1) fail.push('no squad relocation in ' + A.simS + ' sim-s ' + JSON.stringify(A.why)); if (A.twoAtOnce) fail.push(A.twoAtOnce + ' frames with two fighters relocating at once'); }
  else fail.push('case A: fewer than 2 live fighters (' + A.alive + ')');
  if (A.minGapM < 1.5) fail.push('two fighters stacked ' + A.minGapM + ' m apart');
  const B = res.B; if (B.skipped) fail.push('case B ' + B.skipped); else { if (B.repositions < 1) fail.push('last fighter never moved in ' + B.atSimS + ' sim-s ' + JSON.stringify({ why: B.why, rej: B.rej, fails: B.fails }));
    if (B.jumpM > 1.2) fail.push('last fighter jumped ' + B.jumpM + ' m in one frame ' + JSON.stringify(B.jumpAt)); if (B.exposedFrac != null && B.exposedFrac < 0.8) fail.push('reposition run not exposed (' + B.exposedFrac + ')'); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'LOCORELOC FAIL ' + fail.join(' ; ').slice(0, 1200) : 'LOCORELOC PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('LOCORELOC FAIL exception ' + e.message); process.exit(1); });
