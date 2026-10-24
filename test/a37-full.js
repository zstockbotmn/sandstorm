// A37c: one full ?door=1&cxnade=1 Low run to the climax grenade (Tester-style budget). W1 is played with REAL fire only
// (aim at a visible body volume, fire on the red crosshair, <= 1 shot / 0.8 game-s) so W1 clear time and damage taken can be
// compared build vs build; from W2 the A34-smoke pacing bot (debugKillNearest outside set-piece windows) plus real fire at
// the doorway pressure flanker while it is visible from the held doorway. Asserts: climax grenade reached, truck->RPG and
// big-beat gaps 11.5..17 s, HP never above 100, no page errors. Args: <out.json> [distDir] [port]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(process.argv[3] || path.join(__dirname, '../dist')); const PORT = +(process.argv[4] || 8857);
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const out = process.argv[2] || 'logs/a37/full.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const fail = []; let R = {};
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&door=1&cxnade=1&debug&q=low&nosw=1');
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    R = await p.evaluate(async () => {
      const T3 = SS.THREE, wt = SS.weapon, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), t0 = performance.now();
      const out = { build: (document.querySelector('meta[name=build]') || {}).content || null, dmg: [], taken: 0, hpMax: 0, w1: { shots: 0, hits: 0, kills: 0 }, pf: { seenSamples: 0, shots: 0, hits: 0, kills: 0, ids: [] } };
      const pl = SS.player, orig = pl.damage; pl.damage = function (a, from, src) { const h0 = pl.health; const r = orig.apply(this, arguments); const d = h0 - pl.health; if (d > 0) { out.taken += d; out.dmg.push([+(SS.simTime || 0).toFixed(1), +d.toFixed(1), src || null, Math.round(pl.health)]); } return r; };
      const frame = async (n) => { const f0 = SS.frameN | 0, t1 = performance.now(); while ((SS.frameN | 0) < f0 + n && performance.now() - t1 < 30000) await sleep(20); };
      const aliveL = () => SS.enemies.list.filter((e) => e.alive && !e.dying);
      const kindsOf = () => new Set((SS.spLog || []).map((x) => x.kind));
      const vis = (e) => { const c = SS.camera.position.clone(); for (const part of ['body', 'head']) { const m = wt.targets.find((t) => t.userData.enemy === e && t.userData.part === part); if (!m) continue; const v = new T3.Vector3(); m.getWorldPosition(v); const dv = v.sub(c).normalize(); const h = wt.firstHit(c, dv); if (h && h.object.userData && h.object.userData.enemy === e) return dv; } return null; };
      const fireAt = async (e, dv, tally) => { const y0 = SS.input.yaw, p0 = SS.input.pitch, h0 = e.health; SS.input.yaw = Math.atan2(dv.x, -dv.z); SS.input.pitch = -Math.asin(dv.y); SS.input.aimMovedT = performance.now(); await frame(1);
        if (wt.onTarget) { const before = wt.lastShot; SS.input.pendingShots = 1; await frame(1); if (wt.lastShot !== before) { tally.shots++; if (e.health < h0 || !e.alive) tally.hits++; if (!e.alive || e.dying) tally.kills++; } }
        return [y0, p0]; };
      let lastShot = -9, lastKill = 0, waveAt = null;
      while (performance.now() - t0 < 1500000) {
        const sim = SS.simTime || 0, clears = SS.waveClears | 0; SS.input.scope = false; if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        out.hpMax = Math.max(out.hpMax, +pl.health || 0, +SS.health || 0);
        if (!pl.alive) { out.died = +sim.toFixed(1); break; }
        if (clears >= 1 && out.w1.clear == null) out.w1.clear = +sim.toFixed(1), out.w1.taken = +out.taken.toFixed(1);
        if (clears < 1) { // W1: real fire only
          if (sim - lastShot >= 0.8) { const c = SS.camera.position; const cand = aliveL().map((e) => [e, e.group.position.distanceTo(c)]).sort((a, b) => a[1] - b[1]);
            for (const [e] of cand) { const dv = vis(e); if (!dv) continue; await fireAt(e, dv, out.w1); lastShot = SS.simTime || 0; break; } }
        } else {
          if (SS.bursting && waveAt == null) waveAt = { n: Math.max(SS.burstIndex | 0, clears + 1), start: sim };
          if (waveAt && clears >= waveAt.n) waveAt = null;
          const kinds = kindsOf(), age = waveAt ? sim - waveAt.start : 0, calm = SS.bigBeatCalmUntil != null && sim < SS.bigBeatCalmUntil;
          const cs = SS.climaxState, climaxLive = !!(cs && (cs.phase === 'tell' || cs.phase === 'active')), pick = SS.spPick && SS.spPick.pick;
          const beatPending = (pick === 'truck' && !kinds.has('truck') || pick === 'rpg' && !kinds.has('rpg') || !!(SS.spPick && SS.spPick.followRpg && !kinds.has('rpg'))) && age < 80;
          const spare = !!(SS.truckPendingWave || calm || climaxLive || beatPending || (SS.rpgDueAt != null && sim < SS.rpgDueAt + 20));
          // the doorway pressure flanker: real fire while it is visible within 35 deg of the held look
          const pid = SS.doorPressure && SS.doorPressure.id, pe = pid != null ? SS.enemies.list.find((e) => e.id === pid && e.alive && !e.dying) : null;
          const held = !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held'));
          if (pe && held) { const dv = vis(pe); const want = SS.doorPeek && SS.doorPeek.want != null ? SS.doorPeek.want : SS.input.yaw;
            if (dv && Math.abs(Math.atan2(Math.sin(Math.atan2(dv.x, -dv.z) - want), Math.cos(Math.atan2(dv.x, -dv.z) - want))) < 35 * Math.PI / 180) { out.pf.seenSamples++; if (!out.pf.ids.includes(pid)) out.pf.ids.push(pid);
              if (sim - lastShot >= 0.8) { const [y0, p0] = await fireAt(pe, dv, out.pf); lastShot = SS.simTime || 0; SS.input.yaw = want; SS.input.pitch = p0; } } }
          if (!spare && sim - lastKill > 2.0 && SS.debugKillNearest && (age > 6)) { const e = SS.debugKillNearest((x) => !(x.id === pid && held)); lastKill = sim; }
        }
        const cx = (SS.spLog || []).find((x) => x.kind === 'grenade' && x.pick === 'climax');
        if (cx && sim - cx.sim > 2) break;
        if (sim >= 260) break;
        await sleep(200);
      }
      out.spLog = (SS.spLog || []).map((x) => ({ kind: x.kind, sim: x.sim, wave: x.wave, pick: x.pick || null }));
      out.climaxLog = (SS.climaxLog || []).slice(-4); out.climaxState = SS.climaxState || null;
      out.sim = +(SS.simTime || 0).toFixed(1); out.clears = SS.waveClears | 0; out.taken = +out.taken.toFixed(1);
      out.lane = SS.doorLane || null; out.laneBeatWaits = SS.laneBeatWaits | 0; out.flankHits = SS.flankHits | 0; out.flankHitRecs = (SS.flankHitRecs || []).slice(-8); out.rpgFlankWaits = SS.rpgFlankWaits | 0;
      out.doorPressure = SS.doorPressure || null; out.truck = SS.truckMoment && SS.truckMoment.last ? { start: SS.truckMoment.last.startSim, crash: SS.truckMoment.last.crashSim, bail: SS.truckMoment.last.bailSim } : null; out.lastFlankHitSim = SS.lastFlankHitSim; out.markerStats = SS.markerStats || null; out.sw = SS.buildId || null;
      out.dmg = out.dmg.slice(-60);
      return out;
    });
    R.errs = err.slice(0, 5);
    const L = R.spLog || [], tr = L.find((x) => x.kind === 'truck'), rp = L.find((x) => x.kind === 'rpg'), cx = L.find((x) => x.kind === 'grenade' && x.pick === 'climax');
    R.gaps = { truckToRpg: tr && rp ? +(rp.sim - tr.sim).toFixed(1) : null, boomToRpg: R.truck && R.truck.crash != null && rp ? +(rp.sim - R.truck.crash).toFixed(1) : null, rpgToClimaxNade: rp && cx ? +(cx.sim - rp.sim).toFixed(1) : null, climaxNadeAt: cx ? cx.sim : null };
    const big = L.filter((x) => x.kind === 'truck' || x.kind === 'rpg' || x.kind === 'grenade'); R.bigGaps = big.slice(1).map((x, i) => +(x.sim - big[i].sim).toFixed(1));
    if (R.died != null) fail.push('died ' + R.died);
    if (!cx) fail.push('climax grenade not reached by ' + R.sim + ' (cs ' + JSON.stringify(R.climaxState) + ')');
    if (!tr || !rp) fail.push('missing truck/rpg ' + L.map((x) => x.kind).join(','));
    else if (!(R.gaps.boomToRpg >= 11.5 && R.gaps.boomToRpg <= 17)) fail.push('truck boom->RPG gap ' + R.gaps.boomToRpg + ' (A35 15.1; want ~13-15)');
    if (!(R.hpMax <= 100)) fail.push('HP above max ' + R.hpMax);
    if (R.errs.length) fail.push('pageerr ' + R.errs[0]);
  } catch (e) { fail.push(String(e && e.message || e)); }
  R.fail = fail; fs.writeFileSync(out, JSON.stringify(R, null, 1));
  console.log((fail.length ? 'A37 FULL FAIL ' + fail.join(' | ') : 'A37 FULL PASS') + ' gaps ' + JSON.stringify(R.gaps) + ' big ' + JSON.stringify(R.bigGaps) + ' w1 ' + JSON.stringify(R.w1) + ' taken ' + R.taken + ' hpMax ' + R.hpMax + ' pf ' + JSON.stringify(R.pf) + ' sim ' + R.sim);
  try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {}
  process.exit(fail.length ? 1 : 0);
})();
