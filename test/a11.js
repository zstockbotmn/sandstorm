// A11 targeted checks on one tier (?sp=5&rpg=1&truck=1&debug&test=fast):
//  calm  - every wave clear gives >= 15 game-s before the next wave, >= 1 ambient event and no enemy shots in it
//  nade  - wave 3, ducked, waves 1-2 K-skipped, the two nearest fighters killed: a grenade by ~22 game-s, ring + GRENADE!
//  rpg   - 6 debug RPGs at 100 HP: damage spread inside 10-30, HP >= 5, hurt log line names (RPG)
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
        const ws = SS.simTime; out.waves.push({ w, start: +ws.toFixed(1) });
        if (w < 3) { await waitFor(() => !SS.bursting, 30); await waitFor(() => false, 3); const c0 = SS.waveClears | 0;
          SS.enemies.killAll(); await waitFor(() => (SS.waveClears | 0) > c0 && live() === 0, 20);
          const cs = SS.simTime, sh0 = SS.enemyShots | 0, a0 = Object.values((SS.ambient && SS.ambient.counts) || {}).reduce((a, b) => a + b, 0);
          await waitFor(() => SS.bursting, 60);
          const a1 = Object.values((SS.ambient && SS.ambient.counts) || {}).reduce((a, b) => a + b, 0);
          out.calms.push({ after: w, calm: +(SS.simTime - cs).toFixed(1), ambient: a1 - a0, shots: (SS.enemyShots | 0) - sh0, last: SS.ambient && SS.ambient.last });
        } else {
          // wave 3: emulate the tester - stay ducked, kill the nearest two (leaving far / roof shooters)
          await waitFor(() => !SS.bursting, 30); await waitFor(() => !!SS.input.cover, 15); SS.debugKillNearest(); await sleep(600); SS.debugKillNearest();
          const g0 = SS.grenades | 0, s0 = SS.simTime; let ring = false, hint = '', gate = null;
          const t0 = performance.now(); while ((SS.grenades | 0) === g0 && SS.simTime - s0 < 30 && performance.now() - t0 < 500000 && live() > 0) { top(); gate = SS.nadeGate; await sleep(120); }
          out.nade = { thrown: (SS.grenades | 0) > g0, after: +(SS.simTime - s0).toFixed(1), live: live(), gate, throw: SS.lastNadeThrow, ducked: !!SS.input.cover };
          const t1 = performance.now(); while (performance.now() - t1 < 8000 && out.nade.thrown) { const h = (SS.hud && SS.hud.hintText) || ''; if (/GRENADE!/.test(h)) hint = h; if (SS.nadeRingAt >= s0) ring = true; top(); await sleep(100); }
          out.nade.ring = ring; out.nade.hint = hint; out.nade.land = SS.lastGrenade;
        }
      }
      // RPG damage variety
      SS.enemies.killAll(); await sleep(500); out.rpg = [];
      for (let i = 0; i < 6; i++) { SS.player.health = 100; SS.setPieceAt = -1e9; SS.setpieces.debugRpg(); const t0 = performance.now(); let r = null;
        while (performance.now() - t0 < 40000) { r = SS.setpiece && SS.setpiece.lastRpg; if (r && r.impactR && (!out.rpg.length || r.impactR !== out.rpg[out.rpg.length - 1].impactR)) break; await sleep(100); }
        await sleep(300); out.rpg.push({ impactR: r && r.impactR, dmg: r && r.dmg, d: r && r.dist, aim: r && r.aim, hp: SS.player.health }); }
      out.hitLog = (SS.audioLog || []).filter((x) => x.kind === 'hit taken').slice(-10).map((x) => x.detail);
      return out; });
    const r = res.run; if (r.err) fail.push(r.err);
    for (const c of r.calms || []) { if (c.calm < 15) fail.push('calm ' + c.calm + ' s'); if (c.ambient < 1) fail.push('no ambient in calm after wave ' + c.after); if (c.shots > 0) fail.push(c.shots + ' enemy shots in calm'); }
    if (r.nade && !r.nade.thrown) fail.push('no wave-3 grenade ' + JSON.stringify(r.nade.gate)); else if (r.nade && (!r.nade.ring || !r.nade.hint)) fail.push('grenade ring/callout missing');
    const hits = (r.rpg || []).filter((x) => x.dmg > 0).map((x) => x.dmg);
    if ((r.rpg || []).some((x) => x.dmg > 30 || x.hp < 5)) fail.push('rpg dmg out of range');
    if (hits.some((d) => d < 10)) fail.push('rpg hit < 10');
    if (hits.length >= 2 && Math.max(...hits) - Math.min(...hits) < 3) fail.push('rpg damage does not vary ' + hits);
    if (hits.length && !(r.hitLog || []).some((x) => /\(RPG\)/.test(x))) fail.push('hurt log lacks (RPG)');
    res.errs = errs; if (errs.length) fail.push('errors');
  } finally { await b.close(); srv.close(); }
  fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'A11 FAIL ' + fail.join(' ; ') : 'A11 PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
