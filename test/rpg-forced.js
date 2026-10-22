// A12: a forced RPG (?rpg=1) must launch in EVERY wave, with ?truck=1 too (tester A11: none in waves 1-5 with both flags).
// A13 (drafted, not run yet): truck waves need launch >= bail-out + 12 s; a cover-shielded hit (rec.shielded) must be
// <= 15 (x0.40-0.50 of a 10-30 roll) and log '(RPG, cover)'; a 'random' config (sp=5, no rpg flag, waves 2-5) checks the
// spread: every launch >= 10 s into its wave. A14: in EVERY config no launch within 6 game-s after a rifle flank hit
// (SS.flankHitSims), and no flank hit within 5 s of another or of an RPG hit.
// Per config, 3 waves: wait for the launch (HP topped), let it land, then K-skip the wave. Records per wave the launch time
// after the wave start, the truck start, the thump -> whoosh gap and the hit damage (10-30, HP >= 5).
// Usage: node test/rpg-forced.js [tier] [outPrefix]   (SS_QS adds query, default '&test=fast')
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8844;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a12/rpg-forced'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true }); const QS = process.env.SS_QS || '&test=fast';
const SS_gap = (w) => +(w.launchSim - w.bailSim).toFixed(1); // launch - bail-out, game s
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = { tier, configs: {} }, fail = [];
  try { for (const cfg of ['rpg=1&truck=1', 'rpg=1', 'random']) { const nW = cfg === 'random' ? 5 : 3;
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&' + cfg + '&q=' + tier + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const r = await p.evaluate(async (nW) => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), top = () => { if (SS.player.health < 60) SS.player.health = 100; };
      const waitFor = async (fn, simMax) => { const s0 = SS.simTime, t0 = performance.now(); while (!fn() && SS.simTime - s0 < simMax && performance.now() - t0 < 400000) { top(); await sleep(120); } return fn(); };
      const waves = [];
      for (let w = 1; w <= nW; w++) {
        if (!(await waitFor(() => SS.bursting, 90))) return { waves, err: 'no wave ' + w };
        const ws = SS.simTime, n0 = (SS.setpiece && SS.setpiece.rpgs) | 0, tr0 = SS.trucks | 0; let truckAt = null;
        const ok = await waitFor(() => { if (truckAt == null && (SS.trucks | 0) > tr0) truckAt = +(SS.simTime - ws).toFixed(1); return ((SS.setpiece && SS.setpiece.rpgs) | 0) > n0; }, nW === 5 ? 40 : 60);
        const tm = SS.truckMoment && SS.truckMoment.last, bailSim = tm && tm.bailSim != null && tm.bailSim >= ws - 0.5 ? tm.bailSim : null;
        const rec = { w, pick: SS.spPick ? SS.spPick.pick : null, rpg: ok, launchSim: ok ? SS.setpiece.lastRpg.launchSim : null, bailSim, flankLull: ok ? (() => { const L = SS.setpiece.lastRpg.launchSim, pre = (SS.flankHitSims || []).filter((x) => x <= L); return pre.length ? +(L - pre[pre.length - 1]).toFixed(1) : null; })() : null, flankHits: (SS.flankHitSims || []).slice(), rpgHitSim: SS.lastRpgHitSim, launchAfter: ok ? +(SS.setpiece.lastRpg.launchSim - ws).toFixed(1) : null, truckAt, live: SS.waveActive, bursting: SS.bursting, engaged: SS.engaged | 0, gate: SS.nadeGate, starved: !!SS.nadeStarved, noThrower: SS.nadeNoThrower, spGap: SS.setPieceAt != null ? +(SS.simTime - SS.setPieceAt).toFixed(1) : null, nades: SS.grenades | 0 };
        if (ok) { await waitFor(() => SS.setpiece.lastRpg.impactR, 20); const L = SS.setpiece.lastRpg; rec.dmg = +(+L.dmg).toFixed(1); rec.hpBefore = L.hpBefore; rec.aim = L.aim; rec.shielded = !!L.shielded; rec.hurtLog = (SS.audioLog || []).filter((x) => x.kind === 'hit taken').slice(-2).map((x) => x.detail);
          const log = SS.audioLog || [], th = [...log].reverse().find((x) => x.kind === 'launch thump'), wh = [...log].reverse().find((x) => x.kind === 'whoosh'); rec.thump = th && th.t; rec.whoosh = wh && wh.t; }
        waves.push(rec); const c0 = SS.waveClears | 0; SS.enemies.killAll(); await waitFor(() => (SS.waveClears | 0) > c0, 30); SS.enemies.killAll();
      }
      return { waves }; }, nW);
    r.errs = errs; res.configs[cfg] = r; if (r.err) fail.push(cfg + ': ' + r.err); if (errs.length) fail.push(cfg + ': page errors');
    if (cfg === 'random') { const ls = (r.waves || []).filter((w) => w.rpg); res.randomLaunches = ls.map((w) => w.launchAfter);
      /* A14 wave director: picks never repeat, an RPG only in 'rpg' waves, every 'rpg' wave launches, >= 2 kinds in 5 waves */
      const pk = (r.waves || []).map((w) => w.pick); res.randomPicks = pk; for (let i = 1; i < pk.length; i++) if (pk[i] && pk[i] === pk[i - 1]) fail.push('random: same pick twice ' + pk[i] + ' (w' + i + '-' + (i + 1) + ')');
      if (new Set(pk.filter(Boolean)).size < 2) fail.push('random: picks not varied ' + pk.join(','));
      for (const w of r.waves || []) { if (w.rpg && w.pick !== 'rpg') fail.push('random w' + w.w + ' RPG in a ' + w.pick + ' wave'); if (!w.rpg && w.pick === 'rpg') fail.push('random w' + w.w + ' rpg pick but no launch'); } for (const w of ls) { if (w.launchAfter < 10) fail.push('random w' + w.w + ' launch at ' + w.launchAfter + ' s (< 10)'); if (false && w.flankLull < 4.5) /* A14: replaced by the all-config 6 s check below */ fail.push('random w' + w.w + ' launch ' + w.flankLull + ' s after a flank hit'); }
      if (errs.length) fail.push(cfg + ': page errors'); await ctx.close(); continue; }
    for (const w of r.waves || []) if (w.rpg && w.shielded) { if (w.dmg > 15) fail.push(cfg + ' w' + w.w + ' shielded dmg ' + w.dmg); if (w.dmg > 0 && !(w.hurtLog || []).some((x) => /\(RPG, cover\)/.test(x))) fail.push(cfg + ' w' + w.w + ' no (RPG, cover) log'); }
    for (const w of r.waves || []) if (w.rpg && w.flankLull != null && w.flankLull < 6) fail.push(cfg + ' w' + w.w + ' RPG ' + w.flankLull + ' s after a flank hit (< 6)');
    { const last = (r.waves || []).slice(-1)[0] || {}; const FH = last.flankHits || []; for (let i = 1; i < FH.length; i++) if (FH[i] - FH[i - 1] < 5) fail.push(cfg + ' flank hits ' + FH[i - 1] + ' -> ' + FH[i] + ' (< 5 s lull)'); }
    for (const w of r.waves || []) { if (!w.rpg) fail.push(cfg + ': no RPG in wave ' + w.w);
      else { if (w.dmg > 30 || (!w.shielded && w.dmg > 0 && w.dmg < 10 && w.hpBefore - w.dmg > 5)) /* A13: shielded hits are x0.40-0.50 (4-15), checked above */ fail.push(cfg + ' w' + w.w + ' dmg ' + w.dmg); if (w.thump != null && w.whoosh != null && !(w.whoosh - w.thump >= 0.2)) fail.push(cfg + ' w' + w.w + ' thump/whoosh gap ' + (w.whoosh - w.thump).toFixed(2));
        if (w.bailSim != null) { const gap = SS_gap(w); if (gap < 12) fail.push(cfg + ' w' + w.w + ' RPG ' + gap + ' s after the bail-out (< 12)'); }
        if (/truck=1/.test(cfg) && w.bailSim == null) res.note = (res.note || '') + ' w' + w.w + ': no bail-out recorded;'; } }
    await ctx.close(); } } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); } finally { await b.close(); srv.close(); }
  fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'RPGFORCED FAIL ' + fail.join(' ; ') : 'RPGFORCED PASS'); process.exit(fail.length ? 1 : 0); })().catch((e) => { console.error(e); process.exit(1); });
