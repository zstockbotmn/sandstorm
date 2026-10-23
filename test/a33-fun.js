// A33: door+cxnade beat density (truck AND rpg AND grenade, gaps ≥ 11.5 s), visible calm regen, doorway pressure.
// Run A (primary): ?door=1&cxnade=1, no truck=1 / rpg=1.
// Run B: variety regression, rpg + (truck|grenade), same gaps.
// Usage: node test/a33-fun.js [low] [out.json]
// Do not require ?truck=1 or ?rpg=1. Exit 1 on fail. Parent runs this; do not publish.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8851;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', outArg = 'logs/a33/fun'] = process.argv.slice(2);
const out = outArg.endsWith('.json') ? outArg : outArg + '.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
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
    await pA.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&door=1&cxnade=1&debug&q=' + tier);
    await pA.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await pA.tap('#play'); await pA.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const A = await pA.evaluate(async () => {
      const R = { waves: [], held: null }; let lastKill = 0, waveAt = null;
      const t0 = performance.now();
      const aliveN = () => (SS.enemies && SS.enemies.list ? SS.enemies.list.filter((e) => e.alive && !e.dying).length : 0);
      const kindsOf = () => new Set((SS.spLog || []).map((x) => x.kind));
      const hasNade = () => {
        if (kindsOf().has('grenade')) return true;
        return (SS.audioLog || []).some((x) => x.kind === 'enemy' && /climax grenade/.test(x.detail || ''));
      };
      const regenOk = () => !!(SS.regenDuringCalm || (SS.regenCalmLog || []).some((r) => r.hpAfter > r.hpBefore));
      const probeDoor = () => {
        let heldDoor = null;
        for (const seg of (SS.world && SS.world.segments) || []) for (const pt of seg.coverPoints || []) {
          if (pt.type === 'room' && pt.door && SS.doorStop && SS.doorStop.room && Math.abs(pt.door.z - SS.doorStop.room[1]) < 0.5) heldDoor = pt.door;
        }
        let lit = 0, shaft = 0, beam = 0, dust = 0;
        if (SS.world && SS.world.segments) for (const seg of SS.world.segments) seg.group && seg.group.traverse((o) => {
          if (o.isPointLight && o.name === 'roomLit') lit++;
          if (o.isPointLight && o.name === 'roomShaft') shaft++;
          if (o.isMesh && o.name === 'roomShaftBeam') beam++;
          if (o.isMesh && o.name === 'roomDust') dust++;
        });
        return {
          leafOpen: heldDoor && heldDoor.leafOpen != null ? +heldDoor.leafOpen.toFixed(2) : null,
          doorOpenFlag: !!(heldDoor && heldDoor.open),
          roomLit: lit, roomShaft: shaft, roomShaftBeam: beam, roomDust: dust,
          doorPeek: SS.doorPeek || null,
        };
      };
      while (performance.now() - t0 < 2400000) {
        const sim = SS.simTime || 0, clears = SS.waveClears | 0;
        SS.input.scope = false;
        if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        if (SS.bursting && waveAt == null) waveAt = { n: Math.max(SS.burstIndex | 0, clears + 1), start: sim };
        if (waveAt && clears >= waveAt.n) { R.waves.push({ n: waveAt.n, start: +waveAt.start.toFixed(1), end: +sim.toFixed(1) }); waveAt = null; }
        const ds = SS.doorStop || {};
        if (ds.state === 'held' && !R.held) { R.held = { sim: +sim.toFixed(1), kind: SS.cover && SS.cover.kind }; R.door = probeDoor(); }
        const kinds = kindsOf();
        const age = waveAt ? sim - waveAt.start : 0;
        const waveNo = Math.max(SS.burstIndex | 0, clears + 1);
        const calm = SS.bigBeatCalmUntil != null && sim < SS.bigBeatCalmUntil;
        const cs = SS.climaxState;
        const climaxLive = !!(cs && (cs.phase === 'tell' || cs.phase === 'active'));
        const pick = SS.spPick && SS.spPick.pick;
        const beatPending = (pick === 'truck' && !kinds.has('truck') || pick === 'rpg' && !kinds.has('rpg')) && age < 70;
        const spareNade = waveNo >= 2 && !hasNade() && aliveN() <= 2 && age < 55;
        const spare = !!(SS.truckPendingWave || calm || climaxLive || beatPending || spareNade || (SS.rpgDueAt != null && sim < SS.rpgDueAt + 8));
        if (!spare && sim - lastKill > 2.5 && SS.debugKillNearest && (clears < 1 ? age > 10 : age > 8)) { SS.debugKillNearest(); lastKill = sim; }
        const trio = kinds.has('truck') && kinds.has('rpg') && kinds.has('grenade');
        const press = !!(SS.doorPressure && SS.doorPressure.armed);
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
        if (trio && regenOk() && press && hasNade()) break;
        if (clears >= 3 && trio) break;
        if (clears >= 5 || sim >= 240) break;
        await new Promise((r) => setTimeout(r, 250));
      }
      if (!R.door) R.door = probeDoor();
      R.spLog = (SS.spLog || []).map((x) => ({ kind: x.kind, sim: x.sim, wave: x.wave, pick: x.pick || null }));
      R.calm = SS.bigBeatCalmLog || [];
      R.regenDuringCalm = !!SS.regenDuringCalm;
      R.regenCalmLog = SS.regenCalmLog || [];
      R.doorPressure = SS.doorPressure || null;
      R.flankHits = (SS.flankHitRecs || []).length;
      R.rifleHits = (SS.rifleHitLog || []).length;
      R.picks = (SS.spPick && SS.spPick.hist) || [];
      R.sim = +(SS.simTime || 0).toFixed(1);
      R.clears = SS.waveClears | 0;
      R.climaxLog = (SS.climaxLog || []).slice(-6);
      R.waitSpacing = (SS.audioLog || []).filter((x) => x.kind === 'enemy' && /climax wait spacing/.test(x.detail || '')).length;
      R.nade = (SS.audioLog || []).some((x) => x.kind === 'enemy' && /climax grenade/.test(x.detail || '')) || (SS.spLog || []).some((x) => x.kind === 'grenade' && x.pick === 'climax');
      R.doorStop = SS.doorStop ? { state: SS.doorStop.state, count: SS.doorStop.count } : null;
      return R;
    });
    A.errs = errA.slice(0, 5); res.A = A; await ctxA.close();

    const kindsA = new Set((A.spLog || []).map((x) => x.kind));
    A.kinds = [...kindsA];
    if (!kindsA.has('truck')) fail.push('A: no truck in spLog (' + A.kinds.join(',') + ')');
    if (!kindsA.has('rpg')) fail.push('A: no rpg in spLog (' + A.kinds.join(',') + ')');
    if (!kindsA.has('grenade')) fail.push('A: no grenade in spLog (' + A.kinds.join(',') + ')');
    const gA = gapFails(A.spLog, 11.5);
    A.gaps = gA.bad;
    for (const s of gA.bad) fail.push('A spacing: ' + s);
    if (!(A.calm && A.calm.length)) fail.push('A: bigBeatCalmLog empty');
    const regen = !!(A.regenDuringCalm || (A.regenCalmLog || []).some((r) => r.hpAfter > r.hpBefore));
    if (!regen) fail.push('A: no regen during calm');
    if (!(A.nade || (A.spLog || []).some((x) => x.kind === 'grenade' && x.pick === 'climax') || (A.climaxLog || []).some((c) => c.nade != null))) fail.push('A: no climax grenade under cxnade');
    const pressOk = !!(A.doorPressure && A.doorPressure.armed) || (A.flankHits | 0) > 0 || (A.rifleHits | 0) > 0;
    if (!A.held) fail.push('A: never IN COVER · DOORWAY');
    else if (!pressOk) fail.push('A: doorHold without doorPressure / flank / rifle evidence');
    if (A.door) {
      if (!(A.door.roomLit > 0)) fail.push('A: no roomLit');
      if (A.door.leafOpen != null && !(A.door.leafOpen >= 1.7)) fail.push('A: leafOpen ' + A.door.leafOpen);
      if (!(A.door.roomShaftBeam > 0)) warn.push('A: no roomShaftBeam mesh');
    }
    if (A.died != null) fail.push('A: died at ' + A.died);
    if (A.errs && A.errs.length) fail.push('A: page errors: ' + A.errs[0]);

    const ctxB = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const pB = await ctxB.newPage(); const errB = []; pB.on('pageerror', (e) => errB.push(String(e)));
    await pB.goto('http://127.0.0.1:' + PORT + '/?seed=11&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier);
    await pB.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await pB.tap('#play'); await pB.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const B = await pB.evaluate(async () => {
      const R = { waves: [] }; let lastKill = 0, waveAt = null;
      const t0 = performance.now();
      while (performance.now() - t0 < 1500000 && (SS.waveClears | 0) < 5 && (SS.simTime || 0) < 200) {
        const sim = SS.simTime || 0, clears = SS.waveClears | 0;
        if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        if (SS.bursting && waveAt == null) waveAt = { n: Math.max(SS.burstIndex | 0, clears + 1), start: sim };
        if (waveAt && clears >= waveAt.n) { R.waves.push({ n: waveAt.n, start: +waveAt.start.toFixed(1), end: +sim.toFixed(1) }); waveAt = null; }
        const kinds = new Set((SS.spLog || []).map((x) => x.kind));
        const age = waveAt ? sim - waveAt.start : 0;
        const calm = SS.bigBeatCalmUntil != null && sim < SS.bigBeatCalmUntil;
        const cs = SS.climaxState;
        const pick = SS.spPick && SS.spPick.pick;
        const beatPending = (pick === 'truck' && !kinds.has('truck') || pick === 'rpg' && !kinds.has('rpg')) && age < 50;
        const spare = !!(SS.truckPendingWave || calm || beatPending || (cs && (cs.phase === 'tell' || cs.phase === 'active')) || (SS.rpgDueAt != null && sim < SS.rpgDueAt + 8));
        if (!spare && waveAt && sim - waveAt.start > 36 && sim - lastKill > 2.5 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
        if (kinds.has('rpg') && (kinds.has('truck') || kinds.has('grenade')) && clears >= 4) break;
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
    B.errs = errB.slice(0, 5); res.B = B; await ctxB.close();

    const kindsB = new Set((B.spLog || []).map((x) => x.kind));
    B.kinds = [...kindsB];
    if (!kindsB.has('rpg')) fail.push('B: no RPG in spLog (' + B.kinds.join(',') + ')');
    if (!(kindsB.has('truck') || kindsB.has('grenade'))) fail.push('B: no truck or grenade in spLog (' + B.kinds.join(',') + ')');
    const gB = gapFails(B.spLog, 11.5);
    B.gaps = gB.bad;
    for (const s of gB.bad) fail.push('B spacing: ' + s);
    const bigB = (B.spLog || []).filter((x) => x.kind === 'rpg' || x.kind === 'truck');
    if (bigB.length && !(B.calm && B.calm.length)) warn.push('B: rpg/truck fired but bigBeatCalmLog empty');
    if (B.died != null) fail.push('B: died at ' + B.died);
    if (B.errs && B.errs.length) fail.push('B: page errors: ' + B.errs[0]);
  } catch (e) { fail.push('harness: ' + (e && e.message ? e.message : e)); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  res.fail = fail; res.warn = warn;
  fs.writeFileSync(out, JSON.stringify(res, null, 2));
  console.log(fail.length ? 'A33 FAIL ' + fail.join(' | ') : 'A33 PASS A kinds=' + ((res.A && res.A.kinds) || []).join(',') + ' B kinds=' + ((res.B && res.B.kinds) || []).join(','));
  if (warn.length) console.log('A33 WARN ' + warn.join(' | '));
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
