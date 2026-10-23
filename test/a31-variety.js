// A31: set-piece variety + spacing + big-beat calm + unstick spam tame.
// Usage: node test/a31-variety.js [low] [out]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8851;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a31/variety'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
const NW = 5, KILL_AFTER = 42;

(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const res = { tier }, fail = [], warn = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=11&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier);
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    Object.assign(res, await p.evaluate(async ([NW, KILL_AFTER]) => {
      SS.testAccuracy = 3; const R = { waves: [], spLog: [], picks: [], calm: [], unstick: null, variety: null }; let lastKill = 0, waveAt = null;
      const t0 = performance.now();
      while (performance.now() - t0 < 2400000 && (SS.waveClears | 0) < NW) {
        const sim = SS.simTime || 0, clears = SS.waveClears | 0;
        if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        if (SS.bursting && waveAt == null) waveAt = { n: Math.max(SS.burstIndex | 0, clears + 1), start: +sim.toFixed(1) };
        if (waveAt && clears >= waveAt.n) { R.waves.push({ n: waveAt.n, start: waveAt.start, end: +sim.toFixed(1) }); waveAt = null; }
        if (waveAt && sim - waveAt.start > KILL_AFTER && sim - lastKill > 2.5 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
        await new Promise((r) => setTimeout(r, 250));
      }
      R.spLog = (SS.spLog || []).map((x) => ({ kind: x.kind, sim: x.sim, wave: x.wave, pick: x.pick || null, camp: x.camp }));
      R.picks = (SS.spPick && SS.spPick.hist) || [];
      R.variety = SS.spVariety || null;
      R.calm = SS.bigBeatCalmLog || [];
      R.unstick = SS.unstickSpam || null;
      R.sim = +(SS.simTime || 0).toFixed(1);
      R.clears = SS.waveClears | 0;
      R.doorCampBoostSeen = !!SS.doorCampBoost;
      return R;
    }, [NW, KILL_AFTER]));
    res.errs = errs.slice(0, 5); await ctx.close();

    const kinds = new Set((res.spLog || []).map((x) => x.kind));
    res.kinds = [...kinds];
    if (kinds.size < 2) fail.push('variety: fewer than 2 beat types in spLog (' + res.kinds.join(',') + ')');
    if (!kinds.has('rpg')) fail.push('variety: no RPG in run');
    if (!kinds.has('truck')) {
      if ((res.clears | 0) >= 4) fail.push('variety: no truck by wave 4+');
      else warn.push('variety: no truck (only ' + res.clears + ' clears)');
    }
    // spacing >= 14.5 s within same wave (A16: grenade-wave 2nd throw may follow 1st at ~12 s)
    const byW = {};
    for (const s of res.spLog || []) (byW[s.wave] = byW[s.wave] || []).push(s);
    for (const w of Object.keys(byW)) {
      const a = byW[w].slice().sort((x, y) => x.sim - y.sim);
      for (let i = 1; i < a.length; i++) {
        const gap = a[i].sim - a[i - 1].sim;
        const nadeRearm = a[i].kind === 'grenade' && a[i - 1].kind === 'grenade';
        const need = nadeRearm ? 11.5 : 14.5;
        if (gap < need) fail.push('spacing: wave ' + w + ' ' + a[i - 1].kind + '@' + a[i - 1].sim + ' → ' + a[i].kind + '@' + a[i].sim + ' gap ' + gap.toFixed(1) + 's');
      }
    }
    const big = (res.spLog || []).filter((x) => x.kind === 'rpg' || x.kind === 'truck');
    if (big.length && !(res.calm && res.calm.length)) fail.push('calm: big beat fired but bigBeatCalmLog empty');
    if (res.unstick) {
      const { nudges, logged } = res.unstick;
      if (nudges > 0 && logged / nudges > 0.15 && logged >= 12) fail.push('unstick spam: logged ' + logged + '/' + nudges + ' nudges');
    }
    if (res.died != null) fail.push('died at ' + res.died);
    if (res.errs && res.errs.length) fail.push('page errors: ' + res.errs[0]);
  } catch (e) { fail.push('harness: ' + e.message); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  res.fail = fail; res.warn = warn;
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 2));
  console.log(fail.length ? 'A31 FAIL ' + fail.join(' | ') : 'A31 PASS kinds=' + (res.kinds || []).join(',') + ' calm=' + ((res.calm || []).length) + ' clears=' + res.clears);
  if (warn.length) console.log('A31 WARN ' + warn.join(' | '));
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
