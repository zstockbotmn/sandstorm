// A15 checks (tester A14 notes). Low, preview flags (random director, sp=5) or 'forced' (rpg=1&truck=1). The player stays
// ducked the whole run; SS.testAccuracy = 3; each wave the nearest fighter is K-killed only after 45 game-s (so flanks,
// stalls and two grenades get time); 4 waves. Checks:
//  1 flank tell : every flank hit landed 1.5-5 s after ITS OWN FLANKED tell (a tell is consumed by the hit)
//  2 flank cap  : <= 2 flank hits per wave; hits >= 5 s apart; flankRetired >= 1 when a flanker landed 2
//  3 stall push : >= 1 'advances' push in the run, each to a nearer cover (to < from), and in the sound log
//  4 nade re-arm: some wave >= 3 got a 2nd grenade; 'gren:' lines continue after the 1st throw in that wave
//  5 spacing    : any two set pieces (RPG launch / truck start / grenade) in the same wave >= 15 s apart
// Usage: node test/a15.js [low] [out] [random|forced]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a15/a15', mode = 'random'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = { tier, mode }, fail = [], warn = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=11&loco=2&hits=2&repos=1&fx=3&sp=5&debug' + (mode === 'forced' ? '&rpg=1&truck=1' : '') + '&q=' + tier);
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    Object.assign(res, await p.evaluate(async () => { SS.testAccuracy = 3; const R = { waves: [] }; let waveAt = null, lastKill = 0; const t0 = performance.now();
      while (performance.now() - t0 < 1400000 && (SS.waveClears | 0) < 4) { const sim = SS.simTime || 0; SS.input.scope = false; if (SS.player.health < 40) SS.player.health = 90;
        if (SS.waveActive) { if (waveAt == null) { waveAt = sim; R.waves.push({ start: +sim.toFixed(1), n: (SS.waveClears | 0) + 1 }); } if (sim - waveAt > 45 && sim - lastKill > 2) { SS.debugKillNearest(); lastKill = sim; } } else waveAt = null;
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; } await new Promise((r) => setTimeout(r, 250)); }
      R.sim = +(SS.simTime || 0).toFixed(1); R.recs = SS.flankHitRecs || []; R.spLog = SS.spLog || []; R.push = SS.stallPushLog || [];
      R.counters = { flankTells: SS.flankTells | 0, flankCapBlocked: SS.flankCapBlocked | 0, flankRetired: SS.flankRetired | 0, stallPushes: SS.stallPushes | 0, stallPushNone: SS.stallPushNone | 0, frontArcDuckHits: SS.frontArcDuckHits | 0 };
      R.log = (SS.audioLog || []).filter((x) => /grenade|gren|enemy|wave|rpg|truck/.test(x.kind)).map((x) => ({ t: x.t, kind: x.kind, d: x.detail })); return R; }));
    // 1 + 2
    const perWave = {}; for (const r of res.recs) { if (!(r.tellAge >= 1.5 && r.tellAge <= 5)) fail.push('flank hit ' + r.sim + ' tellAge ' + r.tellAge + ' (want 1.5-5)'); if (!r.mover) fail.push('flank hit ' + r.sim + ' non-mover'); perWave[r.wave] = (perWave[r.wave] | 0) + 1; }
    for (const w in perWave) if (perWave[w] > 2) fail.push('wave ' + w + ': ' + perWave[w] + ' flank hits (cap 2)');
    for (let i = 1; i < res.recs.length; i++) if (res.recs[i].sim - res.recs[i - 1].sim < 5) fail.push('flank hits ' + res.recs[i - 1].sim + ' -> ' + res.recs[i].sim + ' (< 5 s)');
    if (Object.values(perWave).some((n) => n >= 2) && !res.counters.flankRetired) fail.push('a flanker landed 2 but none retired');
    if (res.counters.frontArcDuckHits) fail.push('front-arc ducked hits ' + res.counters.frontArcDuckHits);
    res.flankPerWave = perWave;
    // 3
    if (!res.push.length) fail.push('no stall push in ' + res.waves.length + ' waves (none-found ' + res.counters.stallPushNone + ')');
    for (const q of res.push) if (!(q.to < q.from)) fail.push('stall push ' + q.sim + ' not nearer (' + q.from + ' -> ' + q.to + ')');
    if (res.push.length && !res.log.some((x) => x.kind === 'enemy' && /advances/.test(x.d))) fail.push('no "advances" line in the sound log');
    // 4
    const nadesBy = {}; for (const s of res.spLog) if (s.kind === 'grenade') (nadesBy[s.wave] = nadesBy[s.wave] || []).push(s.sim);
    res.nadesBy = nadesBy; if (!Object.keys(nadesBy).some((w) => w >= 3 && nadesBy[w].length >= 2)) fail.push('no wave >= 3 with a 2nd grenade ' + JSON.stringify(nadesBy));
    if (Object.values(nadesBy).some((a) => a.length > 2)) fail.push('more than 2 grenades in a wave');
    const firstThrow = res.log.find((x) => x.kind === 'grenade'); if (firstThrow && !res.log.some((x) => x.kind === 'gren' && x.t > firstThrow.t + 4)) fail.push('no gren: lines after the first throw');
    // 5
    const byW = {}; for (const s of res.spLog) (byW[s.wave] = byW[s.wave] || []).push(s);
    for (const w in byW) { const a = byW[w].sort((x, y) => x.sim - y.sim); for (let i = 1; i < a.length; i++) if (a[i].sim - a[i - 1].sim < 14.9) fail.push('wave ' + w + ': ' + a[i - 1].kind + ' ' + a[i - 1].sim + ' -> ' + a[i].kind + ' ' + a[i].sim + ' (< 15 s)'); }
    if (res.died != null) fail.push('died ' + res.died); if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; res.warn = warn; fs.writeFileSync(out + '_' + mode + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ ...res, log: undefined }).slice(0, 4000)); console.log(fail.length ? 'A15 FAIL ' + fail.join(' ; ') : 'A15 PASS'); process.exit(fail.length ? 1 : 0);
})();
