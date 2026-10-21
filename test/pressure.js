// 5f (DRAFT, not yet run): the step-5e pressure curve. App PM: standing in the open becomes deadly again through rising
// PRESSURE, not bigger hits; ducked stays front-safe. Each run plays one live wave twice-over with SS.pressForce = 0 and = 1
// (order alternates per run so wave progress does not bias it), each phase = 20 game-s EXPOSED (scoped, looking at the
// nearest fighter, HP topped up) + 20 game-s DUCKED. Then a ?press=0 page checks the kill switch.
// Pass: exposed at p=1 gets more pressure (shots/10 s up >= 15% OR hits up, and first hit no later than p=0 + 2 s);
// damage per hit unchanged (max within 0.5, mean within 10%); ducked front-arc hits = 0 at both; SS.pressureP mirrors the
// force; with ?press=0 pressureP stays 0 even when forced. Usage: SS_QS='&q=low' SS_RUNS=2 node test/pressure.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8849;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '&q=low', RUNS = +(process.env.SS_RUNS || 2), PH_S = +(process.env.SS_PHASE_S || 20);
const BASE = (seed, extra) => 'http://127.0.0.1:' + PORT + '/?seed=' + seed + '&loco=2&repos=1&hits=2&fx=3&sp=5&debug' + QS + (extra || '');
async function boot(b, url) { const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }), p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await p.goto(url); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }); return { ctx, p, errs }; }
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1800000 });
  const fail = [], out = { runs: [] };
  try {
    for (let run = 0; run < RUNS; run++) { const { ctx, p, errs } = await boot(b, BASE(7 + run)); const order = run % 2 ? [1, 0] : [0, 1];
      const r = await p.evaluate(async ({ order, PH_S }) => { const pl = SS.player, orig = pl.damage, sleep = (ms) => new Promise((ok) => setTimeout(ok, ms));
        const t0 = performance.now(); while (!((SS.engaged | 0) > 0) && performance.now() - t0 < 240000) { if (pl.health < 60) pl.health = 100; await sleep(150); }
        const nearest = () => { const c = SS.camera.position; let best = null, bd = 1e9; for (const e of SS.enemies.list || []) { if (!e || !e.alive || e.dying) continue; const d = e.group.position.distanceTo(c); if (d < bd) { bd = d; best = e; } } return best; };
        const phases = [];
        for (const force of order) { SS.pressForce = force; await sleep(300); const ph = { force, pPub: SS.pressureP };
          // exposed: scoped (pops out of cover), looking at the nearest live fighter; every hit is recorded, then HP topped up
          let hits = [], first = null; pl.damage = function (a, from, src) { if (src === 'gun' || src === 'flank') hits.push(+((+a) / (((SS.waveClears | 0) === 0 && SS.simTime < 40) ? 0.6 : 1)).toFixed(2)); /* A11: undo the wave-1 opening softening (WAVE1_DAMAGE 0.6 for 40 s) so phases compare like for like */ /* set-piece blasts (rpg/truck/grenade) are not 'pressure' */ if (first == null && (src === 'gun' || src === 'flank')) first = SS.simTime; orig.call(this, a, from, src); pl.health = 100; };
          let s0 = SS.simTime, sh0 = SS.enemyShots | 0; while (SS.simTime - s0 < PH_S && pl.alive && performance.now() - t0 < 1500000) { SS.input.scope = true; const e = nearest();
            if (e) { const c = SS.camera.position, dx = e.group.position.x - c.x, dz = e.group.position.z - c.z; SS.input.yaw = Math.atan2(dx, -dz); SS.input.pitch = -Math.atan2(e.group.position.y + 1.3 - c.y, Math.hypot(dx, dz)); }
            if ((SS.engaged | 0) === 0 && SS.enemies.list.every((x) => !x.alive)) break; await sleep(120); }
          const gE = Math.max(0.1, SS.simTime - s0);
          ph.exposed = { gameS: +gE.toFixed(1), shotsPer10: +((((SS.enemyShots | 0) - sh0) / gE) * 10).toFixed(1), hits: hits.length, firstHitS: first == null ? null : +(first - s0).toFixed(1), dmgMax: hits.length ? Math.max(...hits) : 0, dmgMean: hits.length ? +(hits.reduce((a, x) => a + x, 0) / hits.length).toFixed(2) : 0, chanceEnd: SS.threat && SS.threat.chance };
          // ducked: no scope; classify every hit (front arc must stay 0)
          const fr = { front: 0, flank: 0, exposed: 0 }; const fl0 = (SS.flankLog || []).length;
          pl.damage = function (a, from, src) { const ducked = !!SS.input.cover; if (!ducked) fr.exposed++; else if (src !== 'gun' && src !== 'flank') fr.setpiece = (fr.setpiece | 0) + 1; else if (from && SS.enemies.inFrontArc && SS.enemies.inFrontArc(from)) fr.front++; else fr.flank++; orig.call(this, a, from, src); pl.health = 100; };
          SS.input.scope = false; s0 = SS.simTime; let duck0 = null;
          while (SS.simTime - s0 < PH_S && pl.alive && performance.now() - t0 < 1600000) { SS.input.scope = false; if (duck0 == null && SS.input.cover) duck0 = SS.simTime; await sleep(150); }
          const fl = (SS.flankLog || []).slice(fl0); ph.ducked = { ...fr, gameS: +(SS.simTime - s0).toFixed(1), flankTells: fl.length, firstTellAfterDuckS: fl.length && duck0 != null ? +(fl[0].tellSim - duck0).toFixed(1) : null };
          pl.damage = orig; phases.push(ph); }
        SS.pressForce = null; return { phases, waveClears: SS.waveClears | 0 }; }, { order, PH_S });
      r.run = run; r.errs = errs; out.runs.push(r); console.log(JSON.stringify(r)); await ctx.close();
      const A = r.phases.find((x) => x.force === 0), B = r.phases.find((x) => x.force === 1);
      if (A.pPub !== 0 || B.pPub !== 1) fail.push('run ' + run + ': SS.pressureP ' + A.pPub + '/' + B.pPub);
      if (!(B.exposed.shotsPer10 >= A.exposed.shotsPer10 * 1.15 || B.exposed.hits > A.exposed.hits)) fail.push('run ' + run + ': no extra exposed pressure at p=1 ' + JSON.stringify([A.exposed, B.exposed]));
      if (B.exposed.firstHitS == null || (A.exposed.firstHitS != null && B.exposed.firstHitS > A.exposed.firstHitS + 2)) fail.push('run ' + run + ': p=1 first exposed hit ' + B.exposed.firstHitS + ' vs ' + A.exposed.firstHitS);
      if (A.exposed.hits && B.exposed.hits && (B.exposed.dmgMax > A.exposed.dmgMax + 0.5 || Math.abs(B.exposed.dmgMean - A.exposed.dmgMean) > 0.1 * A.exposed.dmgMean)) fail.push('run ' + run + ': damage per hit changed ' + A.exposed.dmgMean + ' -> ' + B.exposed.dmgMean);
      for (const ph of r.phases) if (ph.ducked.front > 0) fail.push('run ' + run + ' p=' + ph.force + ': ' + ph.ducked.front + ' front-arc hits while ducked');
      if (errs.length) fail.push('run ' + run + ' errors ' + errs.join(' | '));
    }
    // kill switch: ?press=0 keeps p = 0 even when forced
    { const { ctx, p, errs } = await boot(b, BASE(7, '&press=0')); out.kill = await p.evaluate(async () => { SS.pressForce = 1; await new Promise((ok) => setTimeout(ok, 1500)); return { pressureP: SS.pressureP }; }); await ctx.close();
      if (out.kill.pressureP !== 0) fail.push('?press=0 kill switch: pressureP ' + out.kill.pressureP); if (errs.length) fail.push('kill-switch page errors ' + errs.join(' | ')); }
  } catch (e) { fail.push('exception ' + String(e).slice(0, 200)); } finally { await b.close(); srv.close(); }
  fs.mkdirSync('logs/a11', { recursive: true }); fs.writeFileSync('logs/a11/pressure.json', JSON.stringify({ out, fail }, null, 1));
  console.log(fail.length ? 'PRESSURE FAIL ' + fail.join('; ') : 'PRESSURE PASS'); process.exit(fail.length ? 1 : 0); })();
