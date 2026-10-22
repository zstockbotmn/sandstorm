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
const [tier = 'low', out = 'logs/a15/a15', mode = 'random'] = process.argv.slice(2);
// A15f: every flank hit needs ITS OWN FLANKED tell from the same fighter 1.5-5 s before it (a tell is used by one hit only).
// Independent of the game's own tellAge: matches SS.flankLog tells (tellSim, id) to hits greedily, oldest first.
function unmatchedHits(hits, tells) { const used = new Set(), bad = [];
  for (const h of [...hits].sort((a, b) => a.sim - b.sim)) { let k = -1;
    tells.forEach((t, i) => { if (used.has(i) || t.id !== h.id) return; const age = h.sim - t.tellSim; if (age >= 1.5 - 0.05 && age <= 5 + 0.05 && (k < 0 || t.tellSim < tells[k].tellSim)) k = i; });
    if (k < 0) bad.push(h.sim); else used.add(k); }
  return bad; }
{ // self-check on the tester's A14 cases: W2 one tell then hits 219.5 / 236.6 / 252.5, W5 575.7 and W6 631.8 with no tell before
  const tells = [{ id: 1, tellSim: 216.9 }, { id: 2, tellSim: 560.0 }, { id: 3, tellSim: 620.2 }];
  const hits = [{ id: 1, sim: 219.5 }, { id: 1, sim: 236.6 }, { id: 1, sim: 252.5 }, { id: 2, sim: 575.7 }, { id: 3, sim: 631.8 }];
  const bad = unmatchedHits(hits, tells); if (bad.join() !== '236.6,252.5,575.7,631.8') { console.log('A15 FAIL tell-matcher self-check got ' + bad.join()); process.exit(1); } } fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 2500000 });
  const res = { tier, mode }, fail = [], warn = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=11&loco=2&hits=2&repos=1&fx=3&sp=5&debug' + (mode === 'forced' ? '&rpg=1&truck=1' : mode === 'quiet' ? '&spquiet=1' : '') + '&q=' + tier);
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    Object.assign(res, await p.evaluate(async ([NW, KILL_AFTER]) => { SS.testAccuracy = 3; const R = { waves: [], advLines: [], grenT: [], waveEnds: [] }; let waveAt = null, lastKill = 0; const t0 = performance.now();
      while (performance.now() - t0 < 2400000 && (SS.waveClears | 0) < NW) { const sim = SS.simTime || 0; SS.input.scope = false; if (SS.player.health < 40) SS.player.health = 90;
        if (SS.waveActive) { if (waveAt == null) { waveAt = sim; R.waves.push({ start: +sim.toFixed(1), n: (SS.waveClears | 0) + 1 }); } if (sim - waveAt > KILL_AFTER && sim - lastKill > 2) { SS.debugKillNearest(); lastKill = sim; } } else waveAt = null;
        for (const x of (SS.audioLog || [])) if (x.kind === 'gren' && !R.grenT.includes(x.t)) R.grenT.push(x.t);
        if (R._wa && !SS.waveActive) R.waveEnds.push(+sim.toFixed(1)); R._wa = !!SS.waveActive;
        for (const x of (SS.audioLog || [])) if (x.kind === 'enemy' && /advances/.test(x.detail) && !R.advLines.includes(x.t)) R.advLines.push(x.t);
        R.spLines = R.spLines || []; for (const x of (SS.audioLog || [])) if (/launch thump|whoosh|boom|grenade|blast|hit taken/.test(x.kind) && !R.spLines.some((y) => y.t === x.t && y.kind === x.kind && y.d === x.detail)) R.spLines.push({ t: x.t, kind: x.kind, d: x.detail });
        R.noneLines = R.noneLines || []; for (const x of (SS.audioLog || [])) if (x.kind === 'enemy' && /stall push none/.test(x.detail) && !R.noneLines.some((y) => y.t === x.t)) R.noneLines.push({ t: x.t, d: x.detail });
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; } await new Promise((r) => setTimeout(r, 250)); }
      R.sim = +(SS.simTime || 0).toFixed(1); R.recs = SS.flankHitRecs || []; R.spLog = SS.spLog || []; R.push = SS.stallPushLog || []; R.tells = (SS.flankLog || []).map((t) => ({ id: t.id, tellSim: t.tellSim, outcome: t.outcome || null, outSim: t.outSim })); R.aborts = SS.flankAbortLog || []; R.flankCalls = SS.flankCallLog || []; R.tells2 = (SS.flankLog || []).map((t) => ({ id: t.id, tellSim: t.tellSim })); R.mid = SS.midBeatLog || []; R.contacts = SS.waveContactLog || []; R.held = SS.stallPushHeld | 0; R.noneWhy = SS.stallNoneWhy || null; R.picks = (SS.spPick && SS.spPick.hist) || [];
      R.counters = { flankTells: SS.flankTells | 0, flankCapBlocked: SS.flankCapBlocked | 0, flankRetired: SS.flankRetired | 0, stallPushes: SS.stallPushes | 0, stallPushNone: SS.stallPushNone | 0, frontArcDuckHits: SS.frontArcDuckHits | 0 };
      R.log = (SS.audioLog || []).filter((x) => /grenade|gren|enemy|wave|rpg|truck/.test(x.kind)).map((x) => ({ t: x.t, kind: x.kind, d: x.detail })); return R; }, mode === 'random' || mode === 'quiet' ? [6, 40] : [4, 45]));
    // 1 + 2
    const perWave = {}; for (const r of res.recs) { if (!(r.tellAge >= 1.5 && r.tellAge <= 5)) fail.push('flank hit ' + r.sim + ' tellAge ' + r.tellAge + ' (want 1.5-5)'); if (!r.mover) fail.push('flank hit ' + r.sim + ' non-mover'); perWave[r.wave] = (perWave[r.wave] | 0) + 1; }
    for (const w in perWave) if (perWave[w] > 2) fail.push('wave ' + w + ': ' + perWave[w] + ' flank hits (cap 2)');
    for (let i = 1; i < res.recs.length; i++) if (res.recs[i].sim - res.recs[i - 1].sim < 5) fail.push('flank hits ' + res.recs[i - 1].sim + ' -> ' + res.recs[i].sim + ' (< 5 s)');
    res.untold = unmatchedHits(res.recs, res.tells); for (const u of res.untold) fail.push('flank hit ' + u + ' has no own FLANKED tell 1.5-5 s before');
    if (res.recs.length && res.tells.length >= 79) warn.push('flankLog may have wrapped');
    if (Object.values(perWave).some((n) => n >= 2) && !res.counters.flankRetired) fail.push('a flanker landed 2 but none retired');
    if (res.counters.frontArcDuckHits) fail.push('front-arc ducked hits ' + res.counters.frontArcDuckHits);
    res.flankPerWave = perWave;
    // 3
    // A16: stall pushes re-arm every wave and repeat during long camps
    { const byW = {}; for (const q of res.push) (byW[q.wave] = byW[q.wave] || []).push(q.sim); res.pushByWave = byW;
      for (const w of res.waves) { if (w.n < 2) continue; const wv = byW[w.n] || []; if (!wv.length) fail.push('no stall push in wave ' + w.n + ' (' + JSON.stringify(res.noneWhy || null) + ')'); }
      if (!Object.values(byW).some((a) => a.length >= 2)) fail.push('no wave with 2+ stall pushes (repeat during a long camp)'); }
    // A16: no FLANKED tell after the wave's 2nd flank hit; every tell -> hit or 'flank aborted'
    for (const w in perWave) { if (perWave[w] < 2) continue; const hs = res.recs.filter((r) => String(r.wave) === w).map((r) => r.sim).sort((a, b) => a - b), cap = hs[1];
      const wEnd = (res.waves.find((x) => String(x.n) === String(+w + 1)) || {}).start || 1e9; const late = res.tells.filter((t) => t.tellSim > cap + 0.05 && t.tellSim < wEnd);
      if (late.length) fail.push('wave ' + w + ': FLANKED at ' + late.map((t) => t.tellSim).join(',') + ' after the 2-hit cap ' + cap); }
    if (res.tells.length > res.recs.length + (res.aborts || []).length + 1) fail.push('tells ' + res.tells.length + ' > hits ' + res.recs.length + ' + aborts ' + (res.aborts || []).length);
    if (!res.push.length) fail.push('no stall push in ' + res.waves.length + ' waves (none-found ' + res.counters.stallPushNone + ')');
    // A16b: an 'advances' push must really bring the fighter >= 5 m nearer, measured on ARRIVAL (repositions / runs in are other kinds)
    for (const q of res.push.filter((x) => /^advances/.test(x.kind))) { if (q.died) continue; if (q.arrived == null) { if (q.cancelled) warn.push('push ' + q.sim + ' cancelled: ' + q.cancelled); else if (q.sim < res.sim - 15) fail.push('stall push ' + q.sim + ' never arrived'); continue; }
      if (q.from - q.arrived < 4.5) fail.push('stall push ' + q.sim + ' arrived ' + q.arrived + ' m (from ' + q.from + ', < 5 m nearer)'); }
    // A17: exactly one outcome per FLANKED tell (a hit 1.5-5 s later OR 'flank aborted' by 5 s), and '[RADIO] Flanking!' only with a tell
    for (const t of res.tells) {
      const hits = res.recs.filter((r) => r.id === t.id && Math.abs((r.sim - r.tellAge) - t.tellSim) < 0.15).length;
      const abs = (res.aborts || []).filter((a) => a.id === t.id && a.tell != null && Math.abs(a.tell - t.tellSim) < 0.06);
      if (t.id == null) fail.push('tell ' + t.tellSim + ' has no fighter id');
      const n = hits + abs.length + (t.outcome === 'hit (other)' ? 1 : 0); if (n > 1) fail.push('tell ' + t.tellSim + ' (id ' + t.id + ') had ' + n + ' outcomes (' + hits + ' hits, ' + abs.length + ' aborts)');
      if (n === 0 && t.tellSim < res.sim - 5.5) fail.push('tell ' + t.tellSim + ' (id ' + t.id + ') had no outcome (no hit, no abort by 5 s)');
      for (const a of abs) if (a.sim - a.tell > 5.15) fail.push('tell ' + t.tellSim + ' aborted late at ' + a.sim + ' (+' + (a.sim - a.tell).toFixed(2) + ' s, want <= 5)'); }
    for (const c of res.flankCalls || []) if (!res.tells.some((t) => Math.abs(t.tellSim - c) < 0.25)) fail.push("'Flanking!' radio at " + c + ' with no FLANKED tell');
    // A19: stall pushes keep coming all wave (warn on a > 22 s gap; kills no longer re-arm the timer)
    for (const w of res.waves) { const nx = res.waves.find((x) => x.n === w.n + 1), end = (res.waveEnds || []).find((t) => t > w.start) || (nx && nx.start) || res.sim;
      const ts = [w.start].concat((res.push || []).filter((q) => q.wave === w.n).map((q) => q.sim)).concat([end]); for (let i = 1; i < ts.length; i++) if (ts[i] - ts[i - 1] > 22) warn.push('wave ' + w.n + ': no stall push ' + ts[i - 1] + ' -> ' + ts[i]); }
    // A18: from wave 2 on, one mid-wave beat 18-28 s after contact (waves that last that long); no 'stall push none'
    for (const c of res.contacts || []) { if (c.wave < 2) continue; const w = res.waves.find((x) => x.n === c.wave), nx = res.waves.find((x) => x.n === c.wave + 1);
      const end = (res.waveEnds || []).find((t) => t > c.sim) || (nx && nx.start) || res.sim; const mb = (res.mid || []).filter((m) => m.wave === c.wave);
      if (end - c.sim < 28.5) { if (mb.length > 1) fail.push('wave ' + c.wave + ': ' + mb.length + ' mid-wave beats'); continue; }
      if (mb.length !== 1) fail.push('wave ' + c.wave + ': ' + mb.length + ' mid-wave beats (want 1; contact ' + c.sim + ', end ' + end + ')');
      for (const m of mb) if (!(m.afterContact >= 18 && m.afterContact <= 30.5)) fail.push('wave ' + c.wave + ': mid-wave ' + m.kind + ' at +' + m.afterContact + ' s after contact (want 18-30)');
      // A19 (PM 8): a push beat keeps >= 8 s from every set piece (RPG launch / truck start / grenade) before or after
      for (const m of mb.filter((x) => x.kind === 'push')) for (const sp of res.spLog) if (Math.abs(sp.sim - m.sim) < 8) fail.push('wave ' + c.wave + ': mid-wave push ' + m.sim + ' only ' + Math.abs(sp.sim - m.sim).toFixed(1) + ' s from ' + sp.kind + ' ' + sp.sim);
      void w; }
    // A19 (PM 10): ?spquiet=1 - the grenade / RPG beat fires, warns ~1 s+ ahead (launch thump -> boom, throw -> blast), no death
    if (mode === 'quiet') { const sb = (res.mid || []).filter((m) => m.kind === 'rpg' || m.kind === 'grenade'); res.spBeats = sb; if (!sb.length) fail.push('quiet mode: no grenade / RPG mid-wave beat');
      const L = res.spLines || []; for (const m of sb) { const isR = m.kind === 'rpg', start = L.find((x) => x.t >= m.sim - 0.3 && x.t <= m.sim + 3 && (isR ? x.kind === 'launch thump' : x.kind === 'grenade' && /thrown/.test(x.d)));
        const bang = start && L.find((x) => x.t > start.t && x.t <= start.t + 6 && (x.kind === 'boom' || /blast/.test(x.kind + ' ' + x.d)));
        m.warnS = start && bang ? +(bang.t - start.t).toFixed(1) : null; if (m.warnS == null) warn.push('quiet: ' + m.kind + ' beat ' + m.sim + ' start/boom lines not both seen'); else if (m.warnS < 0.8) fail.push('quiet: ' + m.kind + ' beat ' + m.sim + ' warning only ' + m.warnS + ' s');
        const hits = L.filter((x) => x.kind === 'hit taken' && x.t >= m.sim && x.t <= m.sim + 7 && /RPG|grenade/.test(x.d)); for (const h of hits) { const dm = +((/-(\d+)/.exec(h.d) || [])[1] || 0); if (dm >= 40) fail.push('quiet: ' + m.kind + ' hit ' + h.d + ' (near-instant kill)'); } } }

    if ((res.mid || []).some((m) => m.wave < 2)) fail.push('mid-wave beat in wave 1');
    for (const n of res.noneLines || []) fail.push('stall push none at ' + n.t + ': ' + n.d);
    // A16b: 'flank aborted' once per attempt (no repeats within 1 s)
    for (let i = 1; i < (res.aborts || []).length; i++) if (res.aborts[i].sim - res.aborts[i - 1].sim < 1) { fail.push('flank aborted repeats (' + res.aborts[i - 1].sim + ', ' + res.aborts[i].sim + ')'); break; }
    if (res.push.length && !res.advLines.length) fail.push('no "advances" line in the sound log');
    // 4
    // A15a: a quick camp grenade (and a 2nd) only on a director 'grenade' wave; elsewhere <= 1 after a 22 s camp (30 s after a grenade wave)
    const nadesBy = {}; for (const s of res.spLog) if (s.kind === 'grenade') (nadesBy[s.wave] = nadesBy[s.wave] || []).push(s);
    res.nadesBy = nadesBy; const pickWaves = Object.keys(nadesBy).filter((w) => nadesBy[w].some((x) => x.pick === 'grenade'));
    if (mode === 'random') { if (!pickWaves.length) warn.push('no director grenade wave this run (2nd-grenade re-arm unchecked)');
      else if (!pickWaves.some((w) => nadesBy[w].length >= 2)) fail.push('no 2nd grenade in a grenade wave ' + JSON.stringify(nadesBy)); }
    for (const w of pickWaves) { const a = nadesBy[w]; if (a.length >= 2 && (a[1].sim - a[0].sim < 11.5 || a[1].sim - a[0].sim > 14)) fail.push('wave ' + w + ' 2nd throw ' + (a[1].sim - a[0].sim).toFixed(1) + ' s after the 1st (want ~12)'); }
    for (const w in nadesBy) { const a = nadesBy[w], quick = a.some((x) => x.pick === 'grenade'); if (a.length > (quick ? 2 : 1)) fail.push('wave ' + w + ': ' + a.length + ' grenades');
      for (const x of a) if (x.pick !== 'grenade') { if (nadesBy[w - 1]) { fail.push('wave ' + w + ': long-camp grenade right after a grenade wave'); continue; } const need = res.spLog.some((y) => (y.kind === 'rpg' || y.kind === 'truck') && y.wave === x.wave && y.sim < x.sim) ? 40 : 25; const prevSp = res.spLog.filter((y) => y.sim < x.sim).slice(-1)[0], heldBySpacing = prevSp && x.sim - prevSp.sim < 15 + 2; if (x.camp > 40.6 && !heldBySpacing) fail.push('wave ' + w + ' long-camp grenade at ' + x.camp + ' s (cap 40)'); if (!(x.camp >= need - 0.5)) fail.push('wave ' + w + ' long-camp grenade after ' + x.camp + ' s (want >= ' + need + ')'); } }
    // A15a variety (random): the same set-piece kind never opens two waves in a row unless it is a long-camp grenade
    if (mode === 'random') { const kinds = {}; for (const s of res.spLog) (kinds[s.wave] = kinds[s.wave] || new Set()).add(s.kind + (s.kind === 'grenade' && s.pick !== 'grenade' ? '-long' : ''));
      for (const w in kinds) { const prev = kinds[w - 1]; if (!prev) continue; for (const k of kinds[w]) if (!/-long$/.test(k) && (prev.has(k) || (k === 'grenade' && prev.has('grenade-long')))) fail.push('wave ' + w + ' repeats ' + k + ' from wave ' + (w - 1)); }
      // A15e: director variety over waves 2-6 - log the sequence (pick + what happened), want >= 3 different picks and no back-to-back pick
      res.sequence = res.picks.map((pk, i) => 'w' + (i + 1) + ' ' + pk + (kinds[i + 1] ? ' [' + [...kinds[i + 1]].join('+') + ']' : ''));
      if (res.picks.length >= 5 && !res.picks.slice(0, 5).includes('truck')) fail.push('no truck pick in waves 1-5: ' + res.picks.join(','));
      const p26 = res.picks.slice(1, 6); if (p26.length >= 5 && new Set(p26).size < 3) fail.push('director picks w2-6 not varied: ' + p26.join(','));
      for (let i = 1; i < p26.length; i++) if (p26[i] === p26[i - 1]) fail.push('director repeated ' + p26[i] + ' (w' + (i + 1) + '->w' + (i + 2) + ')');
      if (p26.length < 5) warn.push('only ' + p26.length + ' director picks w2+');
      res.kinds = Object.fromEntries(Object.entries(kinds).map(([k, v]) => [k, [...v]]));
      // A15b: wave 1 quiet - no flank hits, no set pieces
      if (res.recs.some((r) => r.wave === 1)) fail.push('flank hit in wave 1'); if (res.spLog.some((x) => x.wave === 1)) fail.push('set piece in wave 1 ' + JSON.stringify(res.spLog.filter((x) => x.wave === 1))); }
    // gren: lines must keep coming after a throw while the wave goes on (checked where the wave lasted >= 7 s after the throw)
    for (const g of res.spLog.filter((x) => x.kind === 'grenade')) { const end = res.waveEnds.find((t) => t > g.sim) ?? res.sim; if (end - g.sim < 7) continue;
      if (!res.grenT.some((t) => t > g.sim + 0.5 && t <= end + 0.5)) fail.push('no gren: line after the throw at ' + g.sim + ' (wave went on to ' + end + ')'); }
    // 5
    const byW = {}; for (const s of res.spLog) (byW[s.wave] = byW[s.wave] || []).push(s);
    for (const w in byW) { const a = byW[w].sort((x, y) => x.sim - y.sim); for (let i = 1; i < a.length; i++) if (a[i].sim - a[i - 1].sim < 14.9 && !(a[i].kind === 'grenade' && a[i - 1].kind === 'grenade' && a[i].pick === 'grenade' && a[i].sim - a[i - 1].sim >= 11.8)) fail.push('wave ' + w + ': ' + a[i - 1].kind + ' ' + a[i - 1].sim + ' -> ' + a[i].kind + ' ' + a[i].sim + ' (< 15 s)'); }
    if (res.died != null) fail.push('died ' + res.died); if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; res.warn = warn; fs.writeFileSync(out + '_' + mode + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify({ ...res, log: undefined }).slice(0, 4000)); console.log(fail.length ? 'A15 FAIL ' + fail.join(' ; ') : 'A15 PASS'); process.exit(fail.length ? 1 : 0);
})();
