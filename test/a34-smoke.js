// A34 smoke: door+cxnade only — must see truck + same-wave RPG + grenade with gaps. Fail if RPG missing.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8851;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const out = process.argv[2] || 'logs/a34/smoke.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const fail = [], warn = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&door=1&cxnade=1&debug&q=low&nosw=1');
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const R = await p.evaluate(async () => {
      const out = { ticks: 0 }; let lastKill = 0, waveAt = null;
      const t0 = performance.now();
      const aliveN = () => (SS.enemies && SS.enemies.list ? SS.enemies.list.filter((e) => e.alive && !e.dying).length : 0);
      const kindsOf = () => new Set((SS.spLog || []).map((x) => x.kind));
      while (performance.now() - t0 < 1200000) {
        out.ticks++;
        const sim = SS.simTime || 0, clears = SS.waveClears | 0;
        SS.input.scope = false;
        if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        if (SS.bursting && waveAt == null) waveAt = { n: Math.max(SS.burstIndex | 0, clears + 1), start: sim };
        if (waveAt && clears >= waveAt.n) waveAt = null;
        const kinds = kindsOf();
        const age = waveAt ? sim - waveAt.start : 0;
        const calm = SS.bigBeatCalmUntil != null && sim < SS.bigBeatCalmUntil;
        const cs = SS.climaxState;
        const climaxLive = !!(cs && (cs.phase === 'tell' || cs.phase === 'active'));
        const pick = SS.spPick && SS.spPick.pick;
        const beatPending = (pick === 'truck' && !kinds.has('truck') || pick === 'rpg' && !kinds.has('rpg') || !!(SS.spPick && SS.spPick.followRpg && !kinds.has('rpg'))) && age < 80;
        const spare = !!(SS.truckPendingWave || calm || climaxLive || beatPending || (SS.rpgDueAt != null && sim < SS.rpgDueAt + 20));
        if (!spare && sim - lastKill > 2.0 && SS.debugKillNearest && (clears < 1 ? age > 8 : age > 6)) { SS.debugKillNearest(); lastKill = sim; }
        out.hpMax = Math.max(out.hpMax || 0, +SS.player.health || 0, +SS.health || 0); // A37c: HP never above max (Tester read 163)
        if (!SS.player.alive) { out.died = +sim.toFixed(1); break; }
        if (kinds.has('truck') && kinds.has('rpg') && kinds.has('grenade')) break;
        if (clears >= 4 || sim >= 180) break;
        await new Promise((r) => setTimeout(r, 200));
      }
      out.spLog = (SS.spLog || []).map((x) => ({ kind: x.kind, sim: x.sim, wave: x.wave, pick: x.pick || null }));
      out.picks = (SS.spPick && SS.spPick.hist) || [];
      out.followRpg = !!(SS.spPick && SS.spPick.followRpg);
      out.rpgDueAt = SS.rpgDueAt;
      out.sim = +(SS.simTime || 0).toFixed(1);
      out.clears = SS.waveClears | 0;
      out.doorStop = SS.doorStop ? { state: SS.doorStop.state, count: SS.doorStop.count } : null;
      out.held = !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held'));
      out.calm = SS.bigBeatCalmLog || [];
      out.regenDuringCalm = !!SS.regenDuringCalm;
      out.doorPressure = SS.doorPressure || null;
      out.climaxLog = (SS.climaxLog || []).slice(-4);
      out.nade = (SS.spLog || []).some((x) => x.kind === 'grenade');
      return out;
    });
    R.errs = err.slice(0, 5);
    const kinds = new Set((R.spLog || []).map((x) => x.kind));
    R.kinds = [...kinds];
    if (!kinds.has('truck')) fail.push('no truck');
    if (!kinds.has('rpg')) fail.push('no rpg kinds=' + R.kinds.join(',') + ' follow=' + R.followRpg + ' due=' + R.rpgDueAt);
    if (!kinds.has('grenade')) fail.push('no grenade');
    const truckE = (R.spLog || []).find((x) => x.kind === 'truck');
    const rpgE = (R.spLog || []).find((x) => x.kind === 'rpg');
    if (truckE && rpgE && rpgE.wave !== truckE.wave) fail.push('RPG wave ' + rpgE.wave + ' != truck ' + truckE.wave);
    if (truckE && rpgE && rpgE.sim - truckE.sim < 11.5) fail.push('truck→RPG gap ' + (rpgE.sim - truckE.sim).toFixed(1));
    const nadeE = (R.spLog || []).find((x) => x.kind === 'grenade');
    if (rpgE && nadeE && rpgE.sim > nadeE.sim) fail.push('RPG after grenade (want truck→RPG→grenade); rpg@' + rpgE.sim + ' nade@' + nadeE.sim);
    const big = (R.spLog || []).filter((x) => x.kind === 'truck' || x.kind === 'rpg' || x.kind === 'grenade').sort((a, b) => a.sim - b.sim);
    for (let i = 1; i < big.length; i++) {
      const g = big[i].sim - big[i - 1].sim;
      if (g < 11.5) fail.push('gap ' + big[i - 1].kind + '→' + big[i].kind + ' ' + g.toFixed(1));
    }
    if (!(R.calm && R.calm.length)) warn.push('no calm log');
    if (R.died != null) fail.push('died ' + R.died);
    if (!(R.hpMax <= 100)) fail.push('HP above max: ' + R.hpMax);
    if (R.errs && R.errs.length) fail.push('pageerr ' + R.errs[0]);
    R.fail = fail; R.warn = warn;
    fs.writeFileSync(out, JSON.stringify(R, null, 2));
    console.log(fail.length ? 'A34 SMOKE FAIL ' + fail.join(' | ') : 'A34 SMOKE PASS kinds=' + R.kinds.join(',') + ' follow=' + R.followRpg + ' sim=' + R.sim);
    if (warn.length) console.log('WARN ' + warn.join(' | '));
    await ctx.close();
  } catch (e) { fail.push(String(e && e.message || e)); fs.writeFileSync(out, JSON.stringify({ fail }, null, 2)); console.log('A34 SMOKE FAIL ' + fail.join(' | ')); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
