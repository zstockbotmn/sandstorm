// A14: wave-3 grenade with NO forced flags (tester A13 part 1: none in > 70 game-s ducked, 4 alive; it only came with
// rpg=1&truck=1). Preview default flags only. Waves 1-2: the nearest fighter is killed every ~2 game-s; wave 3: stay
// ducked, no kills, until a grenade or 75 game-s. PASS: a grenade in wave 3 within 30 game-s of camping in cover.
// Logs SS.nadeGate / SS.nadeWhy samples so a miss names its gate. Usage: node test/nade-normal.js [low|ultra-low] [out]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8848;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a14/nade'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1200000 });
  const res = { tier }, fail = [];
  try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&debug&q=' + tier); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    Object.assign(res, await p.evaluate(async () => { const R = { samples: [], waves: [] }; let lastKill = 0, campStart = null, w3Start = null, sampleT = 0;
      const t0 = performance.now(); const g0 = SS.grenades | 0;
      while (performance.now() - t0 < 1000000) { const sim = SS.simTime || 0; SS.input.scope = false; if (SS.player.health < 45) SS.player.health = 80; // test only: survive the camp
        const clears = SS.waveClears | 0;
        if (clears < 2) { if (SS.waveActive && sim - lastKill > 2 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; } }
        else { if (SS.waveActive && w3Start == null) w3Start = sim;
          if (w3Start != null && SS.cover && SS.cover.state === 'in' && campStart == null) campStart = sim;
          if (sim - sampleT > 2) { sampleT = sim; const alive = (SS.enemies.list || []).filter((e) => e.alive && !e.dying); R.samples.push({ sim: +sim.toFixed(1), gate: SS.nadeGate, why: SS.nadeWhy && SS.nadeWhy.why, cover: SS.cover && SS.cover.state, wa: SS.waveActive, alive: alive.length, d: alive.map((e) => Math.round(e.group.position.distanceTo(SS.camera.position))) }); }
          if ((SS.grenades | 0) > g0) { R.nade = { sim: +sim.toFixed(1), afterCamp: campStart != null ? +(sim - campStart).toFixed(1) : null, throw: SS.lastNadeThrow, gate: SS.nadeGate }; break; }
          if (campStart != null && sim - campStart > 75) break; if (clears >= 3) { R.w3ClearedEarly = true; break; } }
        if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
        await new Promise((r) => setTimeout(r, 200)); }
      R.w3Start = w3Start; R.campStart = campStart; R.log = (SS.audioLog || []).slice(-30).map((x) => x.t + ' ' + x.kind + ' ' + x.detail + (x.n > 1 ? ' x' + x.n : '')); return R; }));
    if (!res.nade) fail.push('no wave-3 grenade (last why: ' + ((res.samples.slice(-1)[0] || {}).why) + ')'); else { const g = res.nade.gate || {}, lim = g.nadeWave ? 30 : (g.longCamp || 22) + 16; res.nade.limit = lim; /* A15a: a non-grenade wave needs a long camp (22/30 s) + up to 15 s set-piece spacing */ if (res.nade.afterCamp == null || res.nade.afterCamp > lim) fail.push('grenade late: ' + res.nade.afterCamp + ' s after camping (limit ' + lim + ')'); }
    if (res.died != null) fail.push('died ' + res.died); if (errs.length) { res.errs = errs.slice(0, 5); fail.push('page errors'); } await ctx.close();
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail; fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 5000)); console.log(fail.length ? 'NADENORMAL FAIL ' + fail.join(' ; ') : 'NADENORMAL PASS'); process.exit(fail.length ? 1 : 0);
})();
