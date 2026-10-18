// step 1 prompt 3a (?loco=2): cover enter/exit, crouch-behind-cover idle, peek-out. NOT RUN YET (box busy).
// Real AI fighters in cover for ~60 s game time. Per fighter per frame: enemy.coverT / enemy.peekT (0..1) must change
// smoothly (<= 0.35 per frame at >= 20 fps, never 0<->1 in one frame), the head height must not pop (> 12 cm in one frame
// outside death/hit), sinks/rises must take >= 0.2 s, peeks must reach peekT >= 0.9 while firing, and the hit volumes stay
// on the drawn bones during peeks (head <= 12 cm, torso <= 8 cm). Shot registration on peeks: run test/cover-occl.js with SS_QS='&loco=2'.
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
        if (s.c < 0.05 && c >= 0.05) s.sinkT0 = now; if (s.sinkT0 != null && c >= 0.95) { R.sinks.push(now - s.sinkT0); s.sinkT0 = null; }
        if (k > 0.05) s.peakK = Math.max(s.peakK, k); if (s.k > 0.05 && k <= 0.05) { R.peaks.push({ k: +s.peakK.toFixed(2), fired: !!s.fired }); s.peakK = 0; s.fired = false; } if (k > 0.05 && e.phase === 'fire') s.fired = true;
        e.group.updateMatrixWorld(true); const hy = e.bones.Head.getWorldPosition(new THREE.Vector3()).y; if (fast && !busy && s.hy != null) R.headPop = Math.max(R.headPop, Math.abs(hy - s.hy)); s.hy = hy;
        if (k > 0.5) { R.peekFrames++; const B = e.bones; for (const m of SS.weapon.targets) { if (m.userData.enemy !== e) continue; const ctr = m.getWorldPosition(new THREE.Vector3());
          if (m.userData.part === 'head') R.hv.head = Math.max(R.hv.head, ctr.distanceTo(B.Head.getWorldPosition(new THREE.Vector3())));
          else if (m.userData.part === 'body') R.hv.torso = Math.max(R.hv.torso, segDist(ctr, B.Hips.getWorldPosition(new THREE.Vector3()), (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()))); } }
        s.c = c; s.k = k; st.set(e, s); } }; });
  await p.waitForTimeout(Number(process.env.SS_COVER_MS || 90000));
  Object.assign(res, await p.evaluate(() => { window.__post = null; const R = window.__R; return { ...R, coverJump: +R.coverJump.toFixed(2), peekJump: +R.peekJump.toFixed(2), headPopCm: +(R.headPop * 100).toFixed(1), sinkMinMs: R.sinks.length ? Math.round(Math.min(...R.sinks)) : null, peaks: R.peaks.slice(0, 20) }; }));
  delete res.headPop;
  if (!res.hooks.coverT || !res.hooks.peekT) fail.push('3a hooks missing (coverT ' + !!res.hooks.coverT + ', peekT ' + !!res.hooks.peekT + ')');
  if (res.flips) fail.push(res.flips + ' coverT/peekT 0<->1 flips in one frame');
  if (res.coverJump > 0.35) fail.push('coverT jumps ' + res.coverJump + ' in one frame'); if (res.peekJump > 0.35) fail.push('peekT jumps ' + res.peekJump + ' in one frame');
  if (res.headPopCm > 12) fail.push('head height pops ' + res.headPopCm + ' cm in one frame');
  if (!res.sinks.length) fail.push('no cover entry (sink) seen in the run'); else if (res.sinkMinMs < 200) fail.push('fastest sink into cover ' + res.sinkMinMs + ' ms (< 200)');
  const firedPeeks = res.peaks.filter((q) => q.fired); if (!firedPeeks.length) fail.push('no peek-to-fire seen'); else if (firedPeeks.some((q) => q.k < 0.9)) fail.push('a firing peek did not fully rise ' + JSON.stringify(firedPeeks));
  if (res.peekFrames && (res.hv.head > 0.12 || res.hv.torso > 0.08)) fail.push('hit volumes off the bones while peeking ' + JSON.stringify(res.hv));
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | ')); delete res.sinks;
  console.log(JSON.stringify(res)); console.log(fail.length ? 'LOCOCOVER FAIL ' + fail.join(' ; ').slice(0, 900) : 'LOCOCOVER PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('LOCOCOVER FAIL exception ' + e.message); process.exit(1); });
