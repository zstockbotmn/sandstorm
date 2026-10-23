// A28 doorway cover stop (HOLD full run until parent says tester browser closed / :8850 free).
// Checks (default Low — no ?bld=4 needed): stop exactly once; IN COVER·DOORWAY while held; front-arc hits while ducked = 0
// with front-arc shots > 0; detour walk 11 +- 1.5 s; screenshot.
// Absent: ?rooms=0 and ?bld=0. Ultra-low NOW keeps rooms+doorway (A28; cheaper furniture).
// Force: ?door=1 / ?doorstop=1 arms early (see test/a28-force.js).
// Usage: node test/doorway-stop.js [low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/4e5/door'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
const BASE = '/?seed=7&loco=2&hits=2&repos=1&fx=3&debug'; // A28: rooms/doorway default ON (no ?bld=4)
// page-side driver: stays ducked (no scope); outside the door kills the nearest fighter every ~2 s game; at the door waits
// 10 s game (so the front arc gets to shoot) before killing; keeps HP >= 40 through the regen path only (no heals).
const DRIVE = async ({ maxSim, stopWhenDone, maxDist }) => {
  const R = { holdSnap: null, maxCount: 0, coverAt: [], shotAt: null }; let lastKill = 0;
  while ((SS.simTime || 0) < maxSim) {
    SS.input.scope = false; const ds = SS.doorStop || { count: 0 }; R.maxCount = Math.max(R.maxCount, ds.count | 0);
    const sim = SS.simTime || 0, atDoor = ds.state === 'held';
    if (atDoor && !R.holdSnap && SS.cover && SS.cover.state === 'in') R.holdSnap = { sim: +sim.toFixed(1), kind: SS.cover.kind, ducked: !!SS.input.cover, hp: Math.round(SS.player.health) };
    if (atDoor && SS.cover) R.coverAt.push(SS.cover.kind + ':' + SS.cover.state);
    const wait = atDoor ? (sim - (ds.arriveSim || sim) > 10) : true;
    if (wait && sim - lastKill > 2 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
    if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
    if (stopWhenDone && ds.state === 'done') break; if (maxDist && SS.distance >= maxDist) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  R.coverAt = [...new Set(R.coverAt)]; R.end = { sim: +(SS.simTime || 0).toFixed(1), dist: +(SS.distance || 0).toFixed(1), clears: SS.waveClears | 0 };
  R.doorStop = SS.doorStop ? JSON.parse(JSON.stringify(SS.doorStop)) : null;
  R.roomPoints = (SS.world && SS.world.segments || []).reduce((n, s) => n + (s.coverPoints || []).filter((p) => p.type === 'room').length, 0);
  return R; };
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const res = { tier }, fail = [];
  const run = async (name, q, opts, onHold) => { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    try { await p.goto('http://127.0.0.1:' + PORT + BASE + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
      await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
      if (onHold) { // screenshot once in cover at the frame (rAF-pause trick so the frame is steady)
        p.waitForFunction(() => SS.doorStop && SS.doorStop.state === 'held' && SS.cover && SS.cover.state === 'in', null, { timeout: 900000, polling: 500 }).then(async () => {
          await p.waitForTimeout(800); await p.screenshot({ path: out + '_' + tier + '_frame.png' }); res.shot = out + '_' + tier + '_frame.png'; }).catch(() => {}); }
      const r = await p.evaluate(DRIVE, opts); if (errs.length) r.errs = errs.slice(0, 5); await ctx.close(); return r;
    } catch (e) { await ctx.close().catch(() => {}); return { exception: e.message, errs }; } };
  try {
    // 1) default Low (release/iPhone path): the stop — no ?bld=4
    const a = res.on = await run('on', '&q=' + tier, { maxSim: 240, stopWhenDone: true, maxDist: 0 }, true);
    if (a.exception) fail.push('on: ' + a.exception); else {
      const ds = a.doorStop || {};
      if ((ds.count | 0) !== 1 || a.maxCount !== 1) fail.push('doorway stop count ' + ds.count + ' (max ' + a.maxCount + ', want exactly 1)');
      if (ds.state !== 'done') fail.push('stop never finished (state ' + ds.state + ')');
      if (!a.holdSnap) fail.push('never IN COVER at the door'); else { if (a.holdSnap.kind !== 'door') fail.push('cover kind at the door ' + a.holdSnap.kind); if (!a.holdSnap.ducked) fail.push('not ducked at the door'); }
      const duck = ds.duck || {}; if ((duck.front | 0) !== 0) fail.push('front-arc hits while ducked at the door: ' + duck.front);
      if (!((duck.frontShots | 0) > 0)) fail.push('no front-arc shots at the door (0 hits proves nothing)');
      const walk = (ds.inWalkS || 0) + (ds.outWalkS || 0); res.walkS = +walk.toFixed(1); if (Math.abs(walk - 11) > 1.5) fail.push('detour walk ' + walk.toFixed(1) + ' s (want 11 +- 1.5)');
      if (!(a.roomPoints > 0)) fail.push('default: no room points'); if (a.died != null) fail.push('player died at ' + a.died + ' s'); if (a.errs) fail.push('on: page errors'); if (!res.shot) fail.push('no frame screenshot'); }
    // 2) rooms=0: absent
    const z = res.rooms0 = await run('rooms0', '&rooms=0&q=' + tier, { maxSim: 240, maxDist: 120 });
    if (z.exception) fail.push('rooms0: ' + z.exception); else { if (z.maxCount !== 0 || (z.doorStop && z.doorStop.count)) fail.push('rooms=0: doorway stop happened'); if (z.errs) fail.push('rooms0: page errors'); }
    // 3) bld=0: absent (opt-out)
    const b0 = res.bld0 = await run('bld0', '&bld=0&q=' + tier, { maxSim: 180, maxDist: 100 });
    if (b0.exception) fail.push('bld0: ' + b0.exception); else { if (b0.maxCount !== 0 || (b0.doorStop && b0.doorStop.count)) fail.push('bld=0: doorway stop happened'); if (b0.roomPoints) fail.push('bld=0: ' + b0.roomPoints + ' room points'); if (b0.errs) fail.push('bld0: page errors'); }
    // 4) Ultra-low: A28 keeps rooms + doorway (cheaper furniture)
    const u = res.ultra = await run('ultra', '&q=ultra-low', { maxSim: 240, stopWhenDone: true, maxDist: 0 }, false);
    if (u.exception) fail.push('ultra: ' + u.exception); else {
      if (!(u.roomPoints > 0)) fail.push('ultra-low: no room points (A28 should keep rooms)');
      if ((u.maxCount | 0) < 1 && !(u.doorStop && u.doorStop.count)) fail.push('ultra-low: doorway stop missing (A28 should keep doorway)');
      if (u.errs) fail.push('ultra: page errors');
    }
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 4000)); console.log(fail.length ? 'DOORWAY FAIL ' + fail.join(' ; ') : 'DOORWAY PASS'); process.exit(fail.length ? 1 : 0);
})();
