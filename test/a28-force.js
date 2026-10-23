// A28 force flags (HOLD full browser run until parent says tester browser closed / :8850 free).
// 1) ?door=1 — doorway stop arms soon (count>=1, state reaches held/done, cover kind door).
// 2) ?cxnade=1 — W2+ climax uses grenade path; if ducked/IN COVER during climax grenade, no "Moving cover" yank
//    (cover state stays 'in', hint is GRENADE! not GRENADE! Moving cover). Also asserts climaxStay / no relocate mid-cx.
// Syntax-check only until :8850 free: node --check test/a28-force.js
// Usage: node test/a28-force.js [low] [outPrefix]
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8849;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a28/force'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
const BASE = '/?seed=7&loco=2&hits=2&repos=1&fx=3&debug&q=' + tier;

(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const res = { tier }, fail = [];
  const boot = async (q) => {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + BASE + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    return { ctx, p, errs };
  };
  try {
    // --- 1) force doorway ---
    {
      const { ctx, p, errs } = await boot('&door=1');
      const r = await p.evaluate(async () => {
        const R = { maxCount: 0, held: null, roomPoints: 0 }; let lastKill = 0;
        const t0 = performance.now();
        while ((SS.simTime || 0) < 180 && performance.now() - t0 < 900000) {
          const ds = SS.doorStop || { count: 0 }; R.maxCount = Math.max(R.maxCount, ds.count | 0);
          if (ds.state === 'held' && !R.held && SS.cover) R.held = { sim: +(SS.simTime || 0).toFixed(1), kind: SS.cover.kind, state: SS.cover.state, ducked: !!SS.input.cover };
          if (ds.state === 'done') break;
          const sim = SS.simTime || 0;
          if (sim - lastKill > 2 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
          if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
        R.doorStop = SS.doorStop ? JSON.parse(JSON.stringify(SS.doorStop)) : null;
        R.roomPoints = (SS.world && SS.world.segments || []).reduce((n, s) => n + (s.coverPoints || []).filter((p) => p.type === 'room').length, 0);
        R.end = { sim: +(SS.simTime || 0).toFixed(1), dist: +(SS.distance || 0).toFixed(1) };
        return R;
      });
      r.errs = errs.slice(0, 5); res.door = r; await ctx.close();
      if (!(r.roomPoints > 0)) fail.push('door=1: no room points');
      if ((r.maxCount | 0) < 1) fail.push('door=1: doorway never armed');
      if (!r.held) fail.push('door=1: never held at doorway'); else if (r.held.kind !== 'door') fail.push('door=1: cover kind ' + r.held.kind);
      if (r.died != null) fail.push('door=1: died at ' + r.died); if (r.errs && r.errs.length) fail.push('door=1: page errors');
    }
    // --- 2) force climax grenade + in-cover no-yank ---
    {
      const { ctx, p, errs } = await boot('&cxnade=1');
      const r = await p.evaluate(async () => {
        const R = { climax: null, nade: null, yank: false, hints: [], coverAfter: null }; let lastKill = 0; let duckedLatch = false;
        const t0 = performance.now();
        // Stay ducked once we can; clear W1 fast so W2 climax can fire (~8 s after contact with force).
        while ((SS.simTime || 0) < 220 && performance.now() - t0 < 1200000) {
          SS.input.scope = false;
          if (SS.cover && SS.cover.state === 'in') { SS.input.cover = true; duckedLatch = true; }
          const sim = SS.simTime || 0;
          const cs = SS.climaxState;
          if (cs && cs.phase === 'active' && !R.climax) R.climax = { wave: cs.wave, due: cs.due, sim: +sim.toFixed(1) };
          const log = (SS.audioLog || []).concat([]);
          for (const x of log) if (x.kind === 'enemy' && /climax grenade/.test(x.detail || '') && !R.nade) {
            R.nade = { sim: x.t, detail: x.detail, ducked: !!SS.input.cover, coverState: SS.cover && SS.cover.state, kind: SS.cover && SS.cover.kind };
          }
          // Detect Moving-cover yank during climax: cover leaves 'in' right after climax grenade while we intended to stay ducked.
          if (R.nade && duckedLatch && SS.cover && SS.cover.state === 'moving' && SS.cover.lastMove === 'grenade') R.yank = true;
          if (R.nade && R.climax && sim > (R.nade.sim || 0) + 3) {
            R.coverAfter = { state: SS.cover && SS.cover.state, kind: SS.cover && SS.cover.kind, ducked: !!SS.input.cover, lastMove: SS.cover && SS.cover.lastMove };
            break;
          }
          // Kill enough to reach W2, then camp ducked so climax can fire with us in cover.
          const clears = SS.waveClears | 0;
          if (clears < 1 && sim - lastKill > 1.5 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
          if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
        R.climaxLog = (SS.climaxLog || []).slice(-5);
        R.climaxState = SS.climaxState || null;
        R.end = { sim: +(SS.simTime || 0).toFixed(1), clears: SS.waveClears | 0 };
        return R;
      });
      r.errs = errs.slice(0, 5); res.cxnade = r; await ctx.close();
      if (!r.climax && !(r.climaxLog && r.climaxLog.length)) fail.push('cxnade=1: no climax');
      const hadNade = !!(r.nade || (r.climaxLog || []).some((c) => c.nade != null));
      if (!hadNade) fail.push('cxnade=1: no climax grenade');
      if (r.yank) fail.push('cxnade=1: Moving-cover yank fired during climax while ducked');
      if (r.coverAfter && r.coverAfter.lastMove === 'grenade' && r.coverAfter.state === 'moving') fail.push('cxnade=1: cover still moving from grenade after climax nade');
      if (r.died != null) fail.push('cxnade=1: died at ' + r.died); if (r.errs && r.errs.length) fail.push('cxnade=1: page errors');
    }
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail;
  fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 5000));
  console.log(fail.length ? 'A28-FORCE FAIL ' + fail.join(' ; ') : 'A28-FORCE PASS');
  process.exit(fail.length ? 1 : 0);
})();
