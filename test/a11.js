// A11 targeted checks on one tier (?sp=5&rpg=1&truck=1&debug&test=fast):
//  calm  - every wave clear gives a 10-12 game-s walk to first contact (A17), exactly 1 ambient beat (radio / dog / gunfire, no back-to-back repeat, all 3 by the 3rd calm; SS.calmLog) plus a mid-walk cue and no enemy shots in it
//  nade  - wave 3, ducked, waves 1-2 K-skipped, the two nearest fighters killed: a grenade by ~22 game-s, ring + GRENADE!
//  rpg   - 6 debug RPGs at 100 HP: damage spread inside 10-30, HP >= 5, hurt log line names (RPG)
//  nm    - near misses in cover at most ~1 per 1.5 s
//  tag   - debug HUD tag says FORCED rpg=1 truck=1
// Usage: node test/a11.js [low|ultra-low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8846;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a11/a11'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&rpg=1&truck=1&debug&test=fast&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    res.tag = await p.evaluate(() => { const t = document.getElementById('dbg-forced'); return t ? t.textContent : null; });
    if (!/rpg=1/.test(res.tag || '') || !/truck=1/.test(res.tag || '')) fail.push('forced tag ' + res.tag);
    res.run = await p.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), top = () => { SS.input.scope = false; if (SS.player.health < 60) SS.player.health = 100; };
      const live = () => ((SS.enemies && SS.enemies.list) || []).filter((e) => e.alive && !e.dying).length;
      const waitFor = async (fn, simMax) => { const s0 = SS.simTime, t0 = performance.now(); while (!fn() && SS.simTime - s0 < simMax && performance.now() - t0 < 500000) { top(); await sleep(120); } return fn(); };
      const out = { calms: [], waves: [] };
      for (let w = 1; w <= 3; w++) {
        if (!(await waitFor(() => SS.bursting, 90))) { out.err = 'no wave ' + w; return out; }
        const ws = SS.simTime; out.waves.push({ w, start: +ws.toFixed(1) }); const gw = SS.grenades | 0; // A12: count wave-3 grenades from the wave start (Ultra-low threw one before the ducked wait ended)
        if (w < 3) { await waitFor(() => !SS.bursting, 30); await waitFor(() => false, 3); const c0 = SS.waveClears | 0;
          SS.enemies.killAll(); await waitFor(() => (SS.waveClears | 0) > c0 && live() === 0, 20);
          const cs = SS.simTime, sh0 = SS.enemyShots | 0, a0 = Object.values((SS.ambient && SS.ambient.counts) || {}).reduce((a, b) => a + b, 0);
          await waitFor(() => SS.bursting, 60);
          const a1 = Object.values((SS.ambient && SS.ambient.counts) || {}).reduce((a, b) => a + b, 0), spawnS = SS.simTime, sh1 = SS.enemyShots | 0;
          await waitFor(() => (SS.enemyShots | 0) > sh1, 12); // A17: the walk ends at first contact (first enemy shot)
          out.calms.push({ after: w, calm: +(spawnS - cs).toFixed(1), walk: +(SS.simTime - cs).toFixed(1), ambient: a1 - a0, shots: sh1 - sh0, last: SS.ambient && SS.ambient.last });
        } else {
          // wave 3: emulate the tester - stay ducked, kill the nearest two (leaving far / roof shooters)
          await waitFor(() => !SS.bursting, 30); await waitFor(() => !!SS.input.cover, 15); SS.debugKillNearest(); await sleep(600); SS.debugKillNearest();
          const g0 = gw, s0 = SS.simTime, nm0 = SS.nearMisses | 0, nk0 = SS.nearMissSkipped | 0; let ring = false, hint = '', gate = null;
          const t0 = performance.now(); while ((SS.grenades | 0) === g0 && SS.simTime - s0 < 62 /* A15a: forced flags = non-grenade wave with RPG/truck: 40 s long camp + spacing */ && performance.now() - t0 < 500000 && live() > 0) { top(); gate = SS.nadeGate; await sleep(120); }
          out.nearMiss = { shown: (SS.nearMisses | 0) - nm0, skipped: (SS.nearMissSkipped | 0) - nk0, gameS: +(SS.simTime - s0).toFixed(1) };
          out.nade = { thrown: (SS.grenades | 0) > g0, after: +(SS.simTime - s0).toFixed(1), live: live(), gate, throw: SS.lastNadeThrow, ducked: !!SS.input.cover };
          const t1 = performance.now(); while (performance.now() - t1 < 8000 && out.nade.thrown) { const h = (SS.hud && SS.hud.hintText) || ''; if (/GRENADE!/.test(h)) hint = h; if (SS.nadeRingAt >= s0) ring = true; top(); await sleep(100); }
          out.nade.ring = ring; out.nade.hint = hint; out.nade.land = SS.lastGrenade;
        }
      }
      // RPG damage variety
      SS.enemies.killAll(); await sleep(500); out.rpg = [];
      for (let i = 0; i < 6; i++) { SS.player.health = 100; SS.setPieceAt = -1e9; SS.setpieces.debugRpg(); const t0 = performance.now(); let r = null;
        while (performance.now() - t0 < 40000) { r = SS.setpiece && SS.setpiece.lastRpg; if (r && r.impactR && (!out.rpg.length || r.impactR !== out.rpg[out.rpg.length - 1].impactR)) break; await sleep(100); }
        await sleep(300); out.rpg.push({ impactR: r && r.impactR, dmg: r && r.dmg, d: r && r.dist, aim: r && r.aim, shielded: !!(r && r.shielded), inCover: !!(SS.cover && SS.cover.state === 'in'), ducked: !!SS.input.cover, hp: SS.player.health }); }
      out.hitLog = (SS.audioLog || []).filter((x) => x.kind === 'hit taken').slice(-10).map((x) => x.detail); out.hitSrc = (SS.hitLog || []).map((x) => x.src);
      out.calmLog = SS.calmLog || []; return out; });
    const r = res.run; if (r.err) fail.push(r.err);
    // A16: calmLog - one beat per calm, kinds radio / dog / fire, no back-to-back repeat
    { const cl = (r.calmLog || []).filter((c) => c.kind); r.beats = cl.map((c) => c.kind + ':' + (c.beats | 0));
      for (const c of cl) { if ((c.beats | 0) !== 1) fail.push('calm at ' + c.clearSim + ': ' + c.beats + ' beats'); if (!/^(radio|dog|gunfire)$/.test(c.kind)) fail.push('calm beat kind ' + c.kind); }
      for (const c of cl) if (c.clearSim != null && c.kind && !c.walkCue) fail.push('calm at ' + c.clearSim + ' had no mid-walk cue');
      if (cl.length >= 3 && new Set(cl.slice(0, 3).map((c) => c.kind)).size < 3) fail.push('not all 3 beat kinds by the 3rd calm: ' + cl.slice(0, 3).map((c) => c.kind).join(','));
      for (let i = 1; i < cl.length; i++) if (cl[i].kind === cl[i - 1].kind) fail.push('calm beat repeated ' + cl[i].kind); }
    for (const c of r.calms || []) { if (!(c.walk >= 10 && c.walk <= 12.8)) fail.push('walk clear -> contact ' + c.walk + ' s (want 10-12; spawn at ' + c.calm + ' s)'); if (c.ambient !== 1) fail.push(c.ambient + ' ambient beats in calm after wave ' + c.after + ' (want exactly 1)'); if (c.shots > 0) fail.push(c.shots + ' enemy shots in calm'); }
    if (r.nade && !r.nade.thrown) fail.push('no wave-3 grenade ' + JSON.stringify(r.nade.gate)); else if (r.nade && (!r.nade.ring || !r.nade.hint)) fail.push('grenade ring/callout missing');
    if (r.nearMiss && r.nearMiss.shown > Math.ceil(r.nearMiss.gameS / 1.4) + 1) fail.push('near misses ' + JSON.stringify(r.nearMiss));
    const hits = (r.rpg || []).filter((x) => x.dmg > 0 && !x.shielded).map((x) => x.dmg);
    if ((r.rpg || []).some((x) => x.dmg > 30 || x.hp < 5)) fail.push('rpg dmg out of range');
    // A13 (drafted, not run yet): shielded hits (in cover, blast on the enemy side) x0.40-0.50 -> <= 15, logged '(RPG, cover)';
    // unshielded ones keep 10-30
    const sh = (r.rpg || []).filter((x) => x.shielded && x.dmg > 0), un = (r.rpg || []).filter((x) => !x.shielded && x.dmg > 0);
    res.rpgCover = { shielded: sh.map((x) => +x.dmg.toFixed(1)), full: un.map((x) => +x.dmg.toFixed(1)) };
    if (sh.some((x) => x.dmg > 15)) fail.push('shielded RPG dmg > 15 ' + JSON.stringify(res.rpgCover));
    if (sh.length && !(r.hitLog || []).some((x) => /\(RPG, cover\)/.test(x)) && !(r.hitSrc || []).includes('rpg-cover')) fail.push('hurt log lacks (RPG, cover)'); /* A23: audioLog keeps 30; the cover line can rotate out, SS.hitLog is the durable record */
    if (un.some((x) => x.dmg < 10)) fail.push('unshielded rpg hit < 10');
    if (hits.length >= 2 && Math.max(...hits) - Math.min(...hits) < 3) fail.push('rpg damage does not vary ' + hits);
    if (hits.length && !(r.hitLog || []).some((x) => /\(RPG(, cover)?\)/.test(x))) fail.push('hurt log lacks (RPG)');
    res.errs = errs; if (errs.length) fail.push('errors');
  } finally { await b.close(); srv.close(); }
  fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'A11 FAIL ' + fail.join(' ; ') : 'A11 PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
