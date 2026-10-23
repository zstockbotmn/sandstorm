// A32: beat spacing ≥12–15 s + RPG/calm in typical play + doorway shafts (thin Fun fix).
// Run A: variety (rpg + truck|grenade, consecutive big-beat gaps ≥ 11.5 s, calm after rpg/truck).
// Run B: ?door=1&cxnade=1 — climax grenade still fires, ≥11.5 s from truck|rpg; doorway open+lit.
// Usage: node test/a32-spacing.js [low] [out]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8851;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a32/spacing'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
const BIG = { truck: 1, rpg: 1, grenade: 1 };

function gapFails(spLog, tol) {
  const a = (spLog || []).filter((x) => BIG[x.kind]).slice().sort((x, y) => x.sim - y.sim);
  const bad = [];
  for (let i = 1; i < a.length; i++) {
    const gap = a[i].sim - a[i - 1].sim;
    if (gap < tol) bad.push(a[i - 1].kind + '@' + a[i - 1].sim + ' → ' + a[i].kind + '@' + a[i].sim + ' gap ' + gap.toFixed(1) + 's');
  }
  return { a, bad };
}

(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const res = { tier }, fail = [], warn = [];
  try {
    const ctxA = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const pA = await ctxA.newPage(); const errA = []; pA.on('pageerror', (e) => errA.push(String(e)));
    await pA.goto('http://127.0.0.1:' + PORT + '/?seed=11&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier);
    await pA.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await pA.tap('#play'); await pA.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const A = await pA.evaluate(async () => {
      const NW = 5, KILL_AFTER = 42;
      const R = { waves: [], spLog: [], calm: [], picks: [] }; let lastKill = 0, waveAt = null;
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
      R.spLog = (SS.spLog || []).map((x) => ({ kind: x.kind, sim: x.sim, wave: x.wave, pick: x.pick || null }));
      R.calm = SS.bigBeatCalmLog || [];
      R.picks = (SS.spPick && SS.spPick.hist) || [];
      R.sim = +(SS.simTime || 0).toFixed(1);
      R.clears = SS.waveClears | 0;
      R.waitSpacing = (SS.audioLog || []).filter((x) => x.kind === 'enemy' && /climax wait spacing/.test(x.detail || '')).length;
      return R;
    });
    A.errs = errA.slice(0, 5); res.A = A; await ctxA.close();

    const kinds = new Set((A.spLog || []).map((x) => x.kind));
    A.kinds = [...kinds];
    if (!kinds.has('rpg')) fail.push('A: no RPG in spLog (' + A.kinds.join(',') + ')');
    if (!(kinds.has('truck') || kinds.has('grenade'))) fail.push('A: no truck or grenade in spLog (' + A.kinds.join(',') + ')');
    const gA = gapFails(A.spLog, 11.5);
    A.gaps = gA.bad;
    for (const s of gA.bad) fail.push('A spacing: ' + s);
    const big = (A.spLog || []).filter((x) => x.kind === 'rpg' || x.kind === 'truck');
    if (big.length && !(A.calm && A.calm.length)) fail.push('A: rpg/truck fired but bigBeatCalmLog empty');
    if (A.calm && A.calm.length && !A.calm.some((c) => (c.until || 0) - (c.sim || 0) >= 6))
      warn.push('A: no calm entry with until-sim ≥ 6');
    if (A.died != null) fail.push('A: died at ' + A.died);
    if (A.errs && A.errs.length) fail.push('A: page errors: ' + A.errs[0]);

    const ctxB = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const pB = await ctxB.newPage(); const errB = []; pB.on('pageerror', (e) => errB.push(String(e)));
    await pB.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&door=1&cxnade=1&debug&q=' + tier);
    await pB.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await pB.tap('#play'); await pB.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const B = await pB.evaluate(async () => {
      const R = { held: null, climax: null, nade: null, door: null }; let lastKill = 0, duckedLatch = false;
      const t0 = performance.now();
      const probeDoor = () => {
        let heldDoor = null;
        for (const seg of (SS.world && SS.world.segments) || []) for (const pt of seg.coverPoints || []) {
          if (pt.type === 'room' && pt.door && SS.doorStop && SS.doorStop.room && Math.abs(pt.door.z - SS.doorStop.room[1]) < 0.5) heldDoor = pt.door;
        }
        let lit = 0, rim = 0, shaft = 0, beam = 0;
        if (SS.world && SS.world.segments) for (const seg of SS.world.segments) seg.group && seg.group.traverse((o) => {
          if (o.isPointLight && o.name === 'roomLit') lit++;
          if (o.isPointLight && o.name === 'roomLitRim') rim++;
          if (o.isPointLight && o.name === 'roomShaft') shaft++;
          if (o.isMesh && o.name === 'roomShaftBeam') beam++;
        });
        return {
          leafOpen: heldDoor && heldDoor.leafOpen != null ? +heldDoor.leafOpen.toFixed(2) : null,
          doorOpenFlag: !!(heldDoor && heldDoor.open),
          roomLit: lit, roomLitRim: rim, roomShaft: shaft, roomShaftBeam: beam,
          doorPeek: SS.doorPeek || null,
          yaw: +(SS.input.yaw || 0).toFixed(3),
        };
      };
      while ((SS.simTime || 0) < 180 && (SS.waveClears | 0) < 3 && performance.now() - t0 < 1200000) {
        SS.input.scope = false;
        if (SS.cover && SS.cover.state === 'in') { SS.input.cover = true; duckedLatch = true; }
        const ds = SS.doorStop || {};
        if (ds.state === 'held' && !R.held) { R.held = { sim: +(SS.simTime || 0).toFixed(1), kind: SS.cover && SS.cover.kind }; R.door = probeDoor(); }
        const sim = SS.simTime || 0;
        const cs = SS.climaxState;
        if (cs && cs.phase === 'active' && !R.climax) R.climax = { wave: cs.wave, due: cs.due, sim: +sim.toFixed(1) };
        for (const x of (SS.audioLog || [])) {
          if (x.kind === 'enemy' && /climax grenade/.test(x.detail || '') && !R.nade)
            R.nade = { sim: x.t, detail: x.detail };
        }
        if (R.nade && R.climax && sim > (R.nade.sim || 0) + 2.5) break;
        const clears = SS.waveClears | 0;
        if (clears < 1 && sim - lastKill > 1.5 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
        else if (clears >= 1 && (SS.enemies && SS.enemies.list ? SS.enemies.list.filter((e) => e.alive && !e.dying).length : 0) > 3 && sim - lastKill > 4 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!R.door) R.door = probeDoor();
      R.spLog = (SS.spLog || []).map((x) => ({ kind: x.kind, sim: x.sim, wave: x.wave, pick: x.pick || null }));
      R.climaxLog = (SS.climaxLog || []).slice(-5);
      R.calm = SS.bigBeatCalmLog || [];
      R.waitSpacing = (SS.audioLog || []).filter((x) => x.kind === 'enemy' && /climax wait spacing/.test(x.detail || '')).length;
      R.end = { sim: +(SS.simTime || 0).toFixed(1), clears: SS.waveClears | 0 };
      R.doorStop = SS.doorStop ? { state: SS.doorStop.state, count: SS.doorStop.count } : null;
      R.doorPeek = SS.doorPeek || null;
      R.duckedLatch = duckedLatch;
      return R;
    });
    B.errs = errB.slice(0, 5); res.B = B; await ctxB.close();

    const hadNade = !!(B.nade || (B.climaxLog || []).some((c) => c.nade != null) || (B.spLog || []).some((x) => x.kind === 'grenade' && x.pick === 'climax'));
    if (!B.climax && !(B.climaxLog && B.climaxLog.length) && !hadNade) fail.push('B: no climax');
    if (!hadNade) fail.push('B: no climax grenade (door+cxnade)');
    const gB = gapFails(B.spLog, 11.5);
    B.gaps = gB.bad;
    const hasTruckRpg = (B.spLog || []).some((x) => x.kind === 'truck' || x.kind === 'rpg');
    const hasGrenade = (B.spLog || []).some((x) => x.kind === 'grenade') || hadNade;
    if (hasTruckRpg && hasGrenade) {
      for (const s of gB.bad) fail.push('B spacing: ' + s);
    }
    if (B.door) {
      if (!(B.door.roomLit > 0)) fail.push('B: no roomLit PointLight');
      if (B.door.leafOpen != null && !(B.door.leafOpen >= 1.7)) fail.push('B: leafOpen ' + B.door.leafOpen + ' (want >= 110deg)');
    }
    if (B.died != null) fail.push('B: died at ' + B.died);
    if (B.errs && B.errs.length) fail.push('B: page errors: ' + B.errs[0]);
  } catch (e) { fail.push('harness: ' + e.message); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  res.fail = fail; res.warn = warn;
  fs.writeFileSync(out + '.json', JSON.stringify(res, null, 2));
  console.log(fail.length ? 'A32 FAIL ' + fail.join(' | ') : 'A32 PASS A kinds=' + ((res.A && res.A.kinds) || []).join(',') + ' B nade=' + !!(res.B && res.B.nade));
  if (warn.length) console.log('A32 WARN ' + warn.join(' | '));
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
