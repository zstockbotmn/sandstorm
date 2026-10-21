// step 1 prompt 3d (?loco=2): peek polish. NOT RUN YET (box busy).
// Real AI fighters in cover for ~90 s. Each peek (peekT rising past 0.05) records enemy.peekKind / peekHigh / anchor type,
// the rise time (0.05 -> 0.9), and the gap from peekT >= 0.9 to the first round of that peek (shotsTaken +1).
// Pass: hooks exist; >= 6 peeks; no fighter peeks the same kind twice in a row on cover that allows more than one;
// >= 2 kinds and both heights seen overall; rise times vary (spread >= 60 ms); first round of a peek never < 0.2 s after full rise;
// no crouch-peek over a car; hit volumes stay on the drawn bones while peeking (head <= 12 cm, torso <= 8 cm).
// Usage: SS_QS='&q=low&test=fast' node test/loco-peek.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8837;
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
    for (let i = 0; i < 4; i++) { const e = SS.debug.spawnEnemy(); if (e) { e.health = 1e9; window.__E.push(e); } }
    const R = window.__R = { hooks: false, peeks: [], repeats: 0, multi: 0, early: [], carCrouch: 0, hv: { head: 0, torso: 0 } };
    const segDist = (q, a, b2) => { const ab = b2.clone().sub(a), t = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()))); return q.distanceTo(a.addScaledVector(ab, t)); };
    const st = new Map();
    window.__post = () => { const now = performance.now();
      for (const e of window.__E) { if (!e.alive || !e.bones) continue; R.hooks = R.hooks || ('peekKind' in e && 'peekHigh' in e && 'lastPeekKind' in e && 'settleT' in e);
        const s = st.get(e) || { k: 0, t05: null, full: null, shots: e.shotsTaken | 0, cur: null, lastKind: null }; const k = +e.peekT || 0;
        if (s.k <= 0.05 && k > 0.05) { if (s.anchor !== e.anchor) { s.anchor = e.anchor; s.lastKind = null; } /* 'no same spot twice' is per cover: a new cover after a reposition starts fresh */ s.t05 = now; s.full = null; s.firstGap = null; s.cur = { kind: e.peekKind, high: e.peekHigh, type: e.anchor && e.anchor.type };
          const multi = s.cur.type === 'wall' || s.cur.type === 'door' || s.cur.type === 'alley' || s.cur.type === 'car' || s.cur.type === 'barrel';
          if (multi && s.lastKind && s.cur.kind) { R.multi++; if (s.cur.kind === s.lastKind) R.repeats++; }
          if (s.cur.type === 'car' && s.cur.kind === 'over' && s.cur.high === false) R.carCrouch++; s.lastKind = s.cur.kind || s.lastKind; }
        if (s.cur && s.full == null && k >= 0.9) { s.full = now; s.cur.riseMs = Math.round(now - s.t05); s.shots = e.shotsTaken | 0; }
        if (s.cur && s.full != null && s.cur.firstMs == null && (e.shotsTaken | 0) > s.shots) { s.cur.firstMs = Math.round(now - s.full); if (s.cur.firstMs < 200) R.early.push(s.cur.firstMs); }
        if (s.k > 0.05 && k <= 0.05 && s.cur) { R.peeks.push(s.cur); s.cur = null; }
        if (k > 0.5) { e.group.updateMatrixWorld(true); const B = e.bones; for (const m of SS.weapon.targets) { if (m.userData.enemy !== e) continue; const ctr = m.getWorldPosition(new THREE.Vector3());
          if (m.userData.part === 'head') R.hv.head = Math.max(R.hv.head, ctr.distanceTo(B.Head.getWorldPosition(new THREE.Vector3())) - 0.1);
          else if (m.userData.part === 'body') R.hv.torso = Math.max(R.hv.torso, segDist(ctr, B.Hips.getWorldPosition(new THREE.Vector3()), (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()))); } }
        s.k = k; st.set(e, s); } }; });
  await p.waitForTimeout(Number(process.env.SS_PEEK_MS || 90000));
  Object.assign(res, await p.evaluate(() => { window.__post = null; const R = window.__R; return R; }));
  const pk = res.peeks || [], kinds = new Set(pk.map((q) => q.kind).filter(Boolean)), highs = new Set(pk.filter((q) => q.kind).map((q) => !!q.high));
  const rises = pk.map((q) => q.riseMs).filter((x) => x != null); res.riseMs = rises.length ? [Math.min(...rises), Math.max(...rises)] : null;
  if (!res.hooks) fail.push('3d hooks missing (peekKind/peekHigh/lastPeekKind/settleT)');
  if (pk.length < 6) fail.push('only ' + pk.length + ' peeks in the run (< 6)');
  if (res.repeats) fail.push(res.repeats + '/' + res.multi + ' peeks repeated the last spot');
  if (kinds.size < 2) fail.push('peek kinds seen: ' + [...kinds].join(',')); if (highs.size < 2) fail.push('only one peek height seen');
  if (rises.length >= 4 && res.riseMs[1] - res.riseMs[0] < 60) fail.push('peek rise never varies ' + JSON.stringify(res.riseMs));
  if (res.early.length) fail.push('first round of a peek too soon after full rise (ms): ' + res.early.join(','));
  if (res.carCrouch) fail.push(res.carCrouch + ' crouch-peeks over a car (head below the roof)');
  if (res.hv.head > 0.12 || res.hv.torso > 0.08) fail.push('hit volumes off the bones while peeking ' + JSON.stringify(res.hv));
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | ')); res.peeks = pk.slice(0, 16);
  console.log(JSON.stringify(res)); console.log(fail.length ? 'LOCOPEEK FAIL ' + fail.join(' ; ').slice(0, 900) : 'LOCOPEEK PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('LOCOPEEK FAIL exception ' + e.message); process.exit(1); });
