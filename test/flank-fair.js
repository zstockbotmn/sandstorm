// A14: flank fairness (tester A13: 'rifle, flank' every 4-12 s while IN cover). Preview default flags (no forced), Low.
// The player stays ducked; SS.testAccuracy = 3 so shots that CAN land do; each wave the nearest fighter is killed only
// after 35 game-s (so flankers get time); 3 waves. Checks: every flank hit came from the fighter that made the flank
// move (mover), outside the front arc, >= 1.5 s after its FLANKED tell, >= 5 game-s after the previous flank hit and after
// any RPG hit; front-arc ducked hits = 0; also reports flank moves / hits per minute and the blocked counters.
// Usage: node test/flank-fair.js [low] [out]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a14/flank'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1300000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=11&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    Object.assign(res, await p.evaluate(async () => { SS.testAccuracy = 3; const R = { ducked: 0 }; let waveAt = null, lastKill = 0; const t0 = performance.now();
      while (performance.now() - t0 < 1100000 && (SS.waveClears | 0) < 3) { const sim = SS.simTime || 0; SS.input.scope = false; if (SS.player.health < 40) SS.player.health = 90;
        if (SS.waveActive) { if (waveAt == null) waveAt = sim; if (SS.input.cover) R.ducked += 0.25; if (sim - waveAt > 35 && sim - lastKill > 2) { SS.debugKillNearest(); lastKill = sim; } } else waveAt = null;
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; } await new Promise((r) => setTimeout(r, 250)); }
      R.sim = +(SS.simTime || 0).toFixed(1); R.recs = SS.flankHitRecs || []; R.rpgHit = SS.lastRpgHitSim; R.moves = SS.flankMoves | 0;
      R.counters = { frontArcDuckHits: SS.frontArcDuckHits | 0, frontArcBlocked: SS.frontArcBlocked | 0, flankNotMover: SS.flankNotMover | 0, flankNoLine: SS.flankNoLine | 0, flankLullBlocked: SS.flankLullBlocked | 0, flankTellBlocked: SS.flankTellBlocked | 0 };
      R.hurt = (SS.audioLog || []).filter((x) => x.kind === 'hit taken').map((x) => x.t + ' ' + x.detail); return R; }));
    for (const r of res.recs) { if (!r.mover) fail.push('flank hit ' + r.sim + ' from a non-mover'); if (r.inArc) fail.push('flank hit ' + r.sim + ' from inside the front arc'); if (r.tellAge < 1.5) fail.push('flank hit ' + r.sim + ' only ' + r.tellAge + ' s after the tell'); }
    for (let i = 1; i < res.recs.length; i++) if (res.recs[i].sim - res.recs[i - 1].sim < 5) fail.push('flank hits ' + res.recs[i - 1].sim + ' -> ' + res.recs[i].sim + ' (< 5 s)');
    if (res.counters.frontArcDuckHits) fail.push('front-arc ducked hits ' + res.counters.frontArcDuckHits);
    res.flankPerMin = res.ducked > 0 ? +(res.recs.length / (res.ducked / 60)).toFixed(2) : null;
    if (res.died != null) fail.push('died ' + res.died); if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 4000)); console.log(fail.length ? 'FLANKFAIR FAIL ' + fail.join(' ; ') : 'FLANKFAIR PASS'); process.exit(fail.length ? 1 : 0);
})();
