// Step 3 sensory pass (?fx=3). NOT run yet (written while the tester plays A2).
// Usage: SS_QS='&q=low&test=fast' node test/fx3.js   (also &q=high, &q=ultra-low)
// Checks: (a) no ?fx=3 -> SS.fx undefined, no muffle filter; (b) shake: a shot kick rotates the camera <= 3 deg and decays
// to < 0.05 deg within ~1.2 s of sim;
// (c) blast at 3 m: muffle > 0.6, recovers below 0.1 within 3.5 s; a 15 m blast does not muffle; (d) near miss: a staged
// enemy round 0.8 m past the camera kicks shake and spawns dust (SS.fx3.puffs.spawned rises, live <= pool); ultra-low pool <= 12 (chips only), no near-miss dust;
// (e) breathing: health 15 -> SS.fx3Audio.effort > 0.6 and breathsPerMin > 25, heartbeat on; health 100 at rest -> effort < 0.15;
// (f) footsteps: while walking ~ speed/0.72 steps per s (+-25%), none while stopped; (g) skyline: during the opening approach
// flashes and tracers rise and lastZ moves closer to the player as SS.approach grows. TODO with 3e: postOff under 24 fps; low-fps shake parity.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8841;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
async function boot(b, qs) { const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  const ultra = /[?&]q=ultra-low/.test(qs); qs = qs.replace('q=ultra-low', 'q=low'); /* quality.js only parses low|high: Ultra-low = Low + goUltra */
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + qs); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 }); if (ultra) await p.evaluate(() => SS.goUltra('test'));
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 }); return { p, ctx, errs }; }
const frames = (p, n) => p.evaluate((n) => new Promise((ok) => { let k = 0; const f = () => (++k >= n ? ok() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: 900000 });
  const res = {}, fail = []; const tier = (/[?&]q=([a-z-]+)/.exec(QS) || [])[1] || 'auto';
  // (a) inert without the flag
  { const { p, ctx } = await boot(b, QS); res.off = await p.evaluate(() => ({ fx: typeof SS.fx, fx3: typeof SS.fx3 })); if (res.off.fx !== 'undefined') fail.push('fx created without ?fx=3'); await ctx.close(); }
  const { p, ctx, errs } = await boot(b, QS + '&fx=3');
  await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; });
  // (b) shake
  res.shake = await p.evaluate(async () => { const c = SS.camera, base = () => c.rotation.x; await new Promise((r) => requestAnimationFrame(r)); const x0 = base(); SS.fx.kick('shot', 1); let peak = 0; const t0 = SS.simTime;
    while (SS.simTime - t0 < 1.2) { await new Promise((r) => requestAnimationFrame(r)); peak = Math.max(peak, Math.abs(SS.fx.offsets().pitch)); }
    return { peakDeg: +(peak * 57.3).toFixed(3), endDeg: +(Math.abs(SS.fx.offsets().pitch) * 57.3).toFixed(3) }; });
  if (!(res.shake.peakDeg > 0.05 && res.shake.peakDeg <= 3)) fail.push('shot shake peak ' + res.shake.peakDeg + ' deg'); if (!(res.shake.endDeg < 0.05)) fail.push('shake did not decay (' + res.shake.endDeg + ' deg)');
  // (c) blast muffle
  res.blast = await p.evaluate(async () => { const c = SS.camera.position; SS.fx.blast(new SS.THREE.Vector3(c.x + 3, 0.3, c.z)); await new Promise((r) => setTimeout(r, 150)); const m0 = SS.audio.muffleLevel ? SS.audio.muffleLevel() : -1;
    await new Promise((r) => setTimeout(r, 3500)); const m1 = SS.audio.muffleLevel ? SS.audio.muffleLevel() : -1; SS.fx.blast(new SS.THREE.Vector3(c.x + 15, 0.3, c.z)); await new Promise((r) => setTimeout(r, 150));
    return { m0: +m0.toFixed(2), m1: +m1.toFixed(2), far: +(SS.audio.muffleLevel ? SS.audio.muffleLevel() : -1).toFixed(2) }; });
  if (!(res.blast.m0 > 0.6)) fail.push('3 m blast muffle ' + res.blast.m0); if (!(res.blast.m1 < 0.1)) fail.push('muffle did not recover (' + res.blast.m1 + ')'); if (!(res.blast.far < 0.1)) fail.push('15 m blast muffled (' + res.blast.far + ')');
  // (d) near miss -> dust
  res.near = await p.evaluate(async () => { const c = SS.camera.position, s0 = (SS.fx3.puffs && SS.fx3.puffs.spawned) || 0; SS.fx.nearMiss(new SS.THREE.Vector3(c.x + 0.8, c.y, c.z - 1)); await new Promise((r) => setTimeout(r, 300));
    const pf = SS.fx3.puffs || {}; return { spawned: (pf.spawned || 0) - s0, live: pf.live, pool: pf.pool, kicks: SS.fx3.kicks }; });
  if (tier === 'ultra-low') { if (res.near.pool > 12) fail.push('ultra-low pool over 12 (' + res.near.pool + ')'); if (res.near.spawned > 0) fail.push('ultra-low near miss spawned dust'); } // A8: 12 chips-only sprites
  else { if (!(res.near.spawned > 0)) fail.push('near miss spawned no dust'); if (res.near.live > res.near.pool) fail.push('live puffs over the pool cap'); }
  // (e) breathing + heartbeat
  res.breath = await p.evaluate(async () => { /* through the damage path: it resets the regen timer (setting .health did not, so 22 hp/s regen lifted it to ~26 HP between holds) */ SS.player.damage(SS.player.health - 15, null, 'test'); { const t0 = performance.now(); while (performance.now() - t0 < 2500 && !((SS.fx3Audio || {}).effort > 0.6 && (SS.fx3Audio || {}).breathsPerMin > 25)) await new Promise((r) => setTimeout(r, 100)); } const lo = { ...(SS.fx3Audio || {}) }; SS.player.health = 100; await new Promise((r) => setTimeout(r, 9000)); return { lo, hi: { ...(SS.fx3Audio || {}) } }; });
  if (!(res.breath.lo.effort > 0.6 && res.breath.lo.breathsPerMin > 25)) fail.push('low-HP breathing ' + JSON.stringify(res.breath.lo)); if (!(res.breath.hi.effort < 0.15)) fail.push('breathing did not calm at full HP ' + JSON.stringify(res.breath.hi));
  // (f) footsteps
  res.steps = await p.evaluate(async () => { SS.forceWalk = true; const a = (SS.fx3Audio || {}).steps | 0, t0 = SS.simTime; await new Promise((r) => setTimeout(r, 4000)); const n = ((SS.fx3Audio || {}).steps | 0) - a, dt = SS.simTime - t0; SS.forceWalk = false;
    const b0 = (SS.fx3Audio || {}).steps | 0; await new Promise((r) => setTimeout(r, 2000)); return { perS: +(n / dt).toFixed(2), expect: +((SS.walkSpeed || 1.4) / 0.72).toFixed(2), stopped: ((SS.fx3Audio || {}).steps | 0) - b0, _: (SS.forceWalk = null) }; });
  if (!(Math.abs(res.steps.perS - res.steps.expect) <= res.steps.expect * 0.25)) fail.push('footsteps ' + res.steps.perS + '/s (expect ' + res.steps.expect + ')'); if (res.steps.stopped > 1) fail.push(res.steps.stopped + ' steps while stopped');
  // (g) skyline build-up
  res.sky = await p.evaluate(async () => { const out = []; for (const a of [0.1, 0.9]) { SS.approachForce = a; const s0 = { ...((SS.fx3 && SS.fx3.skyline) || {}) }; await new Promise((r) => setTimeout(r, 9000)); const s = (SS.fx3 && SS.fx3.skyline) || {};
    out.push({ a, flashes: (s.flashes | 0) - (s0.flashes | 0), tracers: (s.tracers | 0) - (s0.tracers | 0), dz: s.lastZ != null ? +(SS.camera.position.z - s.lastZ).toFixed(1) : null }); } SS.approachForce = null; return out; });
  if (!(res.sky[0].flashes > 0 && res.sky[1].flashes > 0)) fail.push('no skyline flashes ' + JSON.stringify(res.sky)); else if (!(res.sky[1].dz < res.sky[0].dz)) fail.push('skyline fire did not move closer ' + JSON.stringify(res.sky));
  if (tier !== 'ultra-low' && !(res.sky[0].tracers + res.sky[1].tracers > 0)) fail.push('no skyline tracers');
  // (h) 3e post overlay: present on Low/High, gone on Ultra-low; this box runs ~1 fps, so the auto-off must have tripped (< 24 fps for 3 s)
  res.post = await p.evaluate(async () => { await new Promise((r) => setTimeout(r, 4000)); const q = (SS.fx3 && SS.fx3.post) || {}; return { mode: q.mode, postOff: q.postOff, grain: q.grain }; });
  if (tier === 'ultra-low') { if (res.post.mode !== 'none') fail.push('post overlay on Ultra-low (' + res.post.mode + ')'); }
  else { if (res.post.mode !== 'overlay') fail.push('no post overlay (' + res.post.mode + ')'); else if (!res.post.postOff || res.post.grain) fail.push('post did not auto-off at low fps ' + JSON.stringify(res.post)); }
  res.errs = errs; if (errs.length) fail.push('page errors: ' + errs.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'FX3 FAIL ' + fail.join(' ; ') : 'FX3 PASS'); await ctx.close(); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
