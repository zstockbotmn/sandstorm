// step 1 prompt 3a (?loco=2): cover enter/exit, crouch-behind-cover idle, peek-out. NOT RUN YET (box busy).
// Real AI fighters in cover for ~60 s game time. Per fighter per frame: enemy.coverT / enemy.peekT (0..1) must change
// smoothly (<= 0.35 per frame at >= 20 fps, never 0<->1 in one frame), the head height must not pop (> 12 cm in one frame
// outside death/hit), sinks/rises must take >= 0.2 s, peeks must reach peekT >= 0.9 while firing, and the hit volumes stay
// on the drawn bones during peeks (head <= 12 cm, torso <= 8 cm). Shot registration on peeks: run test/cover-occl.js with SS_QS='&loco=2'.
// 3b/3c (added, not run): approach braking (approachK reaches >= 0.5 before cover, ground speed falls), fidgets while hidden
// (fidgets >= 1 in 90 s, none while peeking), exitK ramps on leaving cover, a near-miss round 0.8 m beside a peeking fighter makes
// it duck (ducks +1, peekT < 0.2 within 0.35 s, no new peek for 0.8 s), and the LAST enemy pinned on one cover point repositions
// (SS_REPOS_S=6 debug override): anchor changes, it moves along a path (no per-frame jump > 1 m at >= 20 fps), exposed while running.
// Usage: SS_QS='&q=low&test=fast' node test/loco-cover.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8836;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = {}, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { cb(t); if (window.__post && t !== window.__pfT) { window.__pfT = t; try { window.__post(); } catch (_) {} } }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { SS.player.health = 1e6; const THREE = SS.THREE; window.__E = [];
    for (let i = 0; i < 3; i++) { const e = SS.debug.spawnEnemy(i === 0 ? 'shifter' : undefined); if (e) { e.health = 1e9; window.__E.push(e); } }
    const R = window.__R = { frames: 0, hooks: {}, coverJump: 0, peekJump: 0, flips: 0, headPop: 0, sinks: [], peaks: [], hv: { head: 0, torso: 0 }, peekFrames: 0 };
    const segDist = (q, a, b2) => { const ab = b2.clone().sub(a), t = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()))); return q.distanceTo(a.addScaledVector(ab, t)); };
    const st = new Map(); let lastT = performance.now();
    window.__post = () => { const now = performance.now(), dt = (now - lastT) / 1000; lastT = now; R.frames++; const fast = dt > 0 && dt < 0.05;
      for (const e of window.__E) { if (!e.alive || !e.bones) continue; R.hooks.coverT = R.hooks.coverT || ('coverT' in e); R.hooks.peekT = R.hooks.peekT || ('peekT' in e);
        const s = st.get(e) || { c: e.coverT || 0, k: e.peekT || 0, hy: null, sinkT0: null, peakK: 0 }; const c = +e.coverT || 0, k = +e.peekT || 0; const busy = e.hitPlaying || e.dying || !e.alive;
        if (fast && !busy) { R.coverJump = Math.max(R.coverJump, Math.abs(c - s.c)); R.peekJump = Math.max(R.peekJump, Math.abs(k - s.k)); if (Math.abs(c - s.c) > 0.95 || Math.abs(k - s.k) > 0.95) R.flips++; }
        if (s.c < 0.05 && c >= 0.05) s.sinkT0 = now; if (s.sinkT0 != null && c >= 0.95) { R.sinks.push(now - s.sinkT0 + dt * 1000); s.sinkT0 = null; } /* + one frame gap: at ~10 fps the 0.05/0.95 crossings are quantised by a frame */
        if (k > 0.05) s.peakK = Math.max(s.peakK, k); if (s.k > 0.05 && k <= 0.05) { R.peaks.push({ k: +s.peakK.toFixed(2), fired: !!s.fired }); s.peakK = 0; s.fired = false; } if (k > 0.05 && e.phase === 'fire') s.fired = true;
        e.group.updateMatrixWorld(true); const hy = e.bones.Head.getWorldPosition(new THREE.Vector3()).y; if (fast && !busy && s.hy != null) R.headPop = Math.max(R.headPop, Math.abs(hy - s.hy)); s.hy = hy;
        if (k > 0.5) { R.peekFrames++; const B = e.bones; for (const m of SS.weapon.targets) { if (m.userData.enemy !== e) continue; const ctr = m.getWorldPosition(new THREE.Vector3());
          if (m.userData.part === 'head') { const l = B.Head.worldToLocal(ctr.clone()).multiplyScalar(B.Head.getWorldScale(new THREE.Vector3()).x); if (!s.h0) s.h0 = l.clone(); R.hv.head = Math.max(R.hv.head, l.distanceTo(s.h0)); }
          else if (m.userData.part === 'body') R.hv.torso = Math.max(R.hv.torso, segDist(ctr, B.Hips.getWorldPosition(new THREE.Vector3()), (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()))); } }
        if (e.approachK > 0.5) R.approach = (R.approach | 0) + 1; if (e.exitK > 0 && e.exitK < 1) R.exitRamp = (R.exitRamp | 0) + 1;
        if (e.fidget && k > 0.5) R.fidgetPeek = (R.fidgetPeek | 0) + 1; R.hooks3b = R.hooks3b || ('approachK' in e && 'fidgets' in e && 'duckT' in e && 'exitK' in e);
        s.c = c; s.k = k; st.set(e, s); } }; });
  await p.waitForTimeout(Number(process.env.SS_COVER_MS || 90000));
  res.fidgets = await p.evaluate(() => window.__E.reduce((a, e) => a + (e.fidgets | 0), 0));
  // near-miss duck: wait for a peeking fighter, fire one real round 0.8 m beside its chest
  const duckLeg = async () => { const THREE = SS.THREE; const t0 = performance.now(); let e = null;
    while (performance.now() - t0 < 30000 && !(e = window.__E.find((x) => x.alive && (x.peekT || 0) > 0.9))) await new Promise((r) => setTimeout(r, 50));
    if (!e) return { skipped: 'no peek in 30 s' }; window.__duckTry = (window.__duckTry | 0) + 1; const d0 = e.ducks | 0; e.group.updateMatrixWorld(true);
    const c = e.bones.Spine.getWorldPosition(new THREE.Vector3()), side = new THREE.Vector3().subVectors(c, SS.camera.position).setY(0).normalize(); side.set(-side.z, 0, side.x);
    const pt = c.addScaledVector(side, 0.8), dv = pt.clone().sub(SS.camera.position); SS.input.yaw = Math.atan2(dv.x, -dv.z); SS.input.pitch = -Math.atan2(dv.y, Math.hypot(dv.x, dv.z));
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); const ts = performance.now(); SS.input.pendingShots = (SS.input.pendingShots | 0) + 1;
    let downMs = null, repeekMs = null; while (performance.now() - ts < 2500) { await new Promise((r) => requestAnimationFrame(r)); const k = e.peekT || 0, el = performance.now() - ts;
      if (downMs == null && k < 0.2) downMs = el; if (downMs != null && repeekMs == null && k > 0.5) repeekMs = el; }
    return { ducks: (e.ducks | 0) - d0, downMs: downMs && Math.round(downMs), repeekMs: repeekMs && Math.round(repeekMs), tries: window.__duckTry }; };
  res.duck = await p.evaluate(duckLeg);
  for (let i = 0; i < 2 && res.duck && !res.duck.skipped && res.duck.ducks < 1; i++) res.duck = await p.evaluate(duckLeg); /* the peek can end on its own before the round arrives: up to 3 tries */
  Object.assign(res, await p.evaluate(() => { window.__post = null; const R = window.__R; return { ...R, coverJump: +R.coverJump.toFixed(2), peekJump: +R.peekJump.toFixed(2), headPopCm: +(R.headPop * 100).toFixed(1), sinkMinMs: R.sinks.length ? Math.round(Math.min(...R.sinks)) : null, peaks: R.peaks.slice(0, 20) }; }));
  delete res.headPop;
  res.repos = await p.evaluate(async () => { const THREE = SS.THREE; window.SS_REPOS_S = 6; const keep = window.__E.find((x) => x.alive && !(x.anchor && /roof|window/.test(x.anchor.type)));
    if (!keep) return { skipped: 'no ground fighter' }; SS.debug.noSpawn = true; for (const x of SS.enemies.list || []) if (x !== keep && x.alive) { x.health = 1; try { x.takeHit('head', x.group.position.clone().setY(1.6)); } catch (_) {} }
    await new Promise((r) => setTimeout(r, 1500)); const a0 = keep.anchor, r0 = keep.repositions | 0, g0 = (SS.lastRepos | 0); let jump = 0, exposedRun = 0, runF = 0, last = keep.group.position.clone(), lt = performance.now(), holdMax = 0;
    const t0 = performance.now(); while (performance.now() - t0 < 30000) { await new Promise((r) => requestAnimationFrame(r)); const now = performance.now(), dt = (now - lt) / 1000; lt = now;
      const p2 = keep.group.position; if (dt < 0.05) jump = Math.max(jump, p2.distanceTo(last)); last.copy(p2); holdMax = Math.max(holdMax, keep.coverHoldT || 0);
      if (keep._repositioning && keep.moving) { runF++; if (keep.exposed) exposedRun++; } /* only the reposition run itself (not the cover shuffles after it) */ if ((keep.repositions | 0) > r0 && runF > 20) break; }
    return { alive: SS.enemies.list ? SS.enemies.list.filter((x) => x.alive).length : null, repositions: (keep.repositions | 0) - r0, global: (SS.lastRepos | 0) - g0, anchorChanged: keep.anchor !== a0,
      jumpM: +jump.toFixed(2), exposedFrac: runF ? +(exposedRun / runF).toFixed(2) : null, holdMaxS: +holdMax.toFixed(1), hp: keep.health }; });
  if (!res.hooks.coverT || !res.hooks.peekT) fail.push('3a hooks missing (coverT ' + !!res.hooks.coverT + ', peekT ' + !!res.hooks.peekT + ')');
  if (res.flips) fail.push(res.flips + ' coverT/peekT 0<->1 flips in one frame');
  if (res.coverJump > 0.35) fail.push('coverT jumps ' + res.coverJump + ' in one frame'); if (res.peekJump > 0.35) fail.push('peekT jumps ' + res.peekJump + ' in one frame');
  if (res.headPopCm > 12) fail.push('head height pops ' + res.headPopCm + ' cm in one frame');
  if (!res.sinks.length) fail.push('no cover entry (sink) seen in the run'); else if (res.sinkMinMs < 200) fail.push('fastest sink into cover ' + res.sinkMinMs + ' ms (< 200)');
  const firedPeeks = res.peaks.filter((q) => q.fired); if (!firedPeeks.length) fail.push('no peek-to-fire seen'); else if (firedPeeks.some((q) => q.k < 0.9)) fail.push('a firing peek did not fully rise ' + JSON.stringify(firedPeeks));
  if (res.peekFrames && (res.hv.head > 0.12 || res.hv.torso > 0.08)) fail.push('hit volumes off the bones while peeking ' + JSON.stringify(res.hv));
  if (!res.hooks3b) fail.push('3b hooks missing (approachK/fidgets/duckT/exitK)');
  if (!res.approach) fail.push('no approach braking seen (approachK > 0.5)'); if (!res.exitRamp) fail.push('no exit-into-run ramp seen (0 < exitK < 1)');
  if (!res.fidgets) fail.push('no fidget while hidden in the run'); if (res.fidgetPeek > 3) fail.push('fidget while peeking (' + res.fidgetPeek + ' frames)');
  if (res.duck && !res.duck.skipped) { if (res.duck.ducks < 1) fail.push('near miss did not force a duck'); else if (res.duck.downMs == null || res.duck.downMs > 350) fail.push('duck took ' + res.duck.downMs + ' ms'); else if (res.duck.repeekMs != null && res.duck.repeekMs < 800) fail.push('re-peeked ' + res.duck.repeekMs + ' ms after the near miss'); }
  if (res.repos && !res.repos.skipped) { const r = res.repos; if (r.repositions < 1 || !r.anchorChanged) fail.push('last enemy did not reposition ' + JSON.stringify(r)); if (r.jumpM > 1) fail.push('last enemy jumped ' + r.jumpM + ' m in one frame (teleport)'); if (r.exposedFrac != null && r.exposedFrac < 0.8) fail.push('repositioning run not exposed (' + r.exposedFrac + ')'); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | ')); delete res.sinks;
  console.log(JSON.stringify(res)); console.log(fail.length ? 'LOCOCOVER FAIL ' + fail.join(' ; ').slice(0, 900) : 'LOCOCOVER PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('LOCOCOVER FAIL exception ' + e.message); process.exit(1); });
