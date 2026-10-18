// step 1 (?loco=2 blendspace) harness check: foot slide, pose snap and hit-volume follow on a live fighter.
// Runtime counterpart of tools/loco-check.mjs (which checks the baked clips offline):
//  slide  planted-foot slide (cm) per ground contact, world space, for walk/run in 8 directions, crouch strafes, turn-in-place
//  snap   largest per-frame rotation (deg, normalised to 30 fps) of hips/legs, incl. the start/stop and direction changes
//  hitvol every hit volume follows its bones in the drawn pose (torso on Hips->spineTop, head on Head, limbs on their seg)
//  blend  locoW is set, <= the tier cap, and diagonals blend two directions
//  overlap blend weights do not stack (sum of loco+base weights ~1, no double-counted clip), the feet never cross/interpenetrate
//          (min foot gap), and the fighter's legs stay out of its own torso capsule; offline: tools/loco-check.mjs (baked clips) must pass
// Same-frame shot registration with ?loco=2: run test/aim-reg.js with SS_QS='&loco=2...' (strafe 26 m @2/5/8 fps + crouch).
// Usage: SS_QS='&q=low&test=fast' node test/loco-foot.js   (SS_LOCO_DIAG=1 prints per-case rows)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8833;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
const LIM = { slideWalk: 8, slideRun: 14, slideCrouch: 8, slideTurn: 6, snapDeg: 25, torso: 0.08, head: 0.12, limb: 0.06, wSumMax: 1.15, wSumMin: 0.85, footGap: 0.06 };
const CAP = { 'ultra-low': 2, low: 3 }; // locomotion.js tierCap (others 4)
// offline clip check first (node only, no browser): foot drift / snap / loop seam of the baked loco clips
let offline = null; { const r = require('child_process').spawnSync('node', [path.resolve(__dirname, '../tools/loco-check.mjs'), '--json'], { encoding: 'utf8', timeout: 120000 }); const ln = String(r.stdout || '').split('\n').find((l) => l.startsWith('[{'));
  try { const rows = JSON.parse(ln); offline = { clips: rows.length, fail: rows.filter((q) => !q.ok) }; } catch (e) { offline = { error: 'no JSON rows (exit ' + r.status + ') ' + String(r.stderr || '').slice(0, 160) }; } }
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { cases: [], offline }, fail = [];
  if (offline && offline.error) fail.push('tools/loco-check.mjs failed: ' + offline.error); else if (offline && offline.fail && offline.fail.length) fail.push('loco-check (offline clips): ' + JSON.stringify(offline.fail).slice(0, 300));
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { if (window.__preFrame && t !== window.__pfT) { window.__pfT = t; try { window.__preFrame(); } catch (_) {} } cb(t); }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  res.setup = await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; window.__freezeCam = true;
    const c = SS.camera.position; const e = SS.debug.spawnEnemy('shifter'); window.__e = e; SS.enemies.debugPose(e, c.x + 1.5, c.z - 12, 'idle'); e.health = 1e9; e.shootCd = 1e9; e.noFireUntilR = 1e15;
    return { bones: !!e.bones, tier: SS.art && SS.art.tier, loco: !!(SS.art && SS.art.locoMeta), locoW: !!e.locoW }; });
  if (!res.setup.bones) fail.push('fighter has no bones (art tier ' + res.setup.tier + ')');
  if (!res.setup.loco) fail.push('?loco=2 did not load fighter.loco meta (art.locoMeta missing)');
  // per-frame sampler: feet, leg/hip rotations, hit-volume offsets
  await p.evaluate((LIM) => { const THREE = SS.THREE, e = window.__e, B = e.bones;
    const legs = ['Hips', 'LeftUpLeg', 'LeftLeg', 'LeftFoot', 'RightUpLeg', 'RightLeg', 'RightFoot'].filter((n) => B[n]);
    const segDist = (p, a, b) => { const ab = b.clone().sub(a), t = Math.max(0, Math.min(1, p.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()))); return p.distanceTo(a.addScaledVector(ab, t)); };
    window.__S = null; window.__start = (name, setup) => { window.__S = { name, f: [], snap: 0, hv: { torso: 0, head: 0, limb: 0 }, lastQ: null, lastT: 0, wMax: 0, wMin: 9, wN: 0, diag: 0, gap: 9, legInTorso: 0 }; };
    window.__preFrame = () => { const S = window.__S; if (!S) return; if (window.__drive) window.__drive(); e.group.updateMatrixWorld(true); const now = performance.now();
      const fr = { t: now }; for (const n of ['LeftFoot', 'RightFoot']) { const v = B[n].getWorldPosition(new THREE.Vector3()); fr[n] = [v.x, v.y, v.z]; } S.f.push(fr);
      const qs = legs.map((n) => B[n].getWorldQuaternion(new THREE.Quaternion()));
      if (S.lastQ && now > S.lastT) { const k = (1000 / 30) / (now - S.lastT); for (let i = 0; i < qs.length; i++) S.snap = Math.max(S.snap, qs[i].angleTo(S.lastQ[i]) * 180 / Math.PI * Math.min(1, k)); }
      S.lastQ = qs; S.lastT = now;
      // hit volumes vs bones (same pose the shot test uses this frame)
      for (const m of SS.weapon.targets) { if (m.userData.enemy !== e) continue; const ctr = m.getWorldPosition(new THREE.Vector3()); const part = m.userData.part;
        if (part === 'body') { const a = B.Hips.getWorldPosition(new THREE.Vector3()), top = (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()); S.hv.torso = Math.max(S.hv.torso, segDist(ctr, a, top)); }
        else if (part === 'head') { const h = B.Head.getWorldPosition(new THREE.Vector3()); S.hv.head = Math.max(S.hv.head, ctr.distanceTo(h)); }
        else if (part === 'limb' && m.userData.seg) { const [n0, n1] = m.userData.seg; if (B[n0] && B[n1]) S.hv.limb = Math.max(S.hv.limb, segDist(ctr, B[n0].getWorldPosition(new THREE.Vector3()), B[n1].getWorldPosition(new THREE.Vector3()))); } }
      const W = e.locoW || {}; const on = Object.values(W).filter((w) => w > 0.02); S.wN = Math.max(S.wN, on.length); const sum = on.reduce((a, w) => a + w, 0); S.wMax = Math.max(S.wMax, sum); if (on.length) S.wMin = Math.min(S.wMin, sum); if (on.length >= 2) S.diag++;
      // overlap: feet crossing (horizontal gap between the two feet) and knees inside the torso capsule (pose interpenetration)
      { const l = fr.LeftFoot, r = fr.RightFoot; S.gap = Math.min(S.gap, Math.hypot(l[0] - r[0], l[2] - r[2])); }
      if (B.Hips && B.LeftLeg && B.RightLeg) { const a = B.Hips.getWorldPosition(new THREE.Vector3()), top = (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3());
        for (const n of ['LeftLeg', 'RightLeg']) { const k = B[n].getWorldPosition(new THREE.Vector3()); if (k.y > a.y + 0.02 && segDist(k, a.clone(), top.clone()) < 0.08) S.legInTorso++; } } };
  }, LIM);
  // planted-foot slide: spans where a foot sits within 3 cm of its lowest height; horizontal world travel inside the span
  const slideOf = (f) => { const spans = []; for (const n of ['LeftFoot', 'RightFoot']) { const ys = f.map((q) => q[n][1]); const lo = Math.min(...ys); let s = null;
      for (const q of f) { const [x, y, z] = q[n]; if (y < lo + 0.03) { if (!s) s = { x0: x, z0: z, d: 0, px: x, pz: z, n: 0 }; s.d += Math.hypot(x - s.px, z - s.pz); s.px = x; s.pz = z; s.n++; } else if (s) { if (s.n >= 3) spans.push(s.d * 100); s = null; } }
      if (s && s.n >= 3) spans.push(s.d * 100); }
    spans.sort((a, b) => a - b); return { n: spans.length, p50: +(spans[Math.floor(spans.length * 0.5)] || 0).toFixed(1), p90: +(spans[Math.floor(spans.length * 0.9)] || 0).toFixed(1) }; };
  const cases = [];
  for (const [band, speed] of [['walk', 1.4], ['run', 4.2]]) for (let a = 0; a < 360; a += 45) cases.push({ name: band + a, band, speed, ang: a });
  for (const a of [0, 90, 180, 270]) cases.push({ name: 'crouch' + a, band: 'crouch', speed: 1.1, ang: a, crouch: true });
  cases.push({ name: 'turnL', band: 'turn', speed: 0, turn: 1.5 }, { name: 'turnR', band: 'turn', speed: 0, turn: -1.5 });
  cases.push({ name: 'startstop', band: 'walk', speed: 1.4, ang: 0, startStop: true }, { name: 'dirflip', band: 'run', speed: 4.2, ang: 90, flip: true });
  for (const C of cases) {
    await p.evaluate((C) => { const THREE = SS.THREE, e = window.__e, c = SS.camera.position; SS.enemies.debugPose(e, c.x + 1.5, c.z - 12, C.crouch ? 'crouch' : 'idle'); e.health = 1e9; e.shootCd = 1e9;
      const yaw0 = e.group.rotation.y; const t0 = performance.now(); let lastT = t0;
      // body-frame direction ang (0 = forward, 90 = character's right) -> world velocity; facing from the group's +Z
      const vel = (ang) => { const f = new THREE.Vector3(0, 0, 1).applyAxisAngle(new THREE.Vector3(0, 1, 0), e.group.rotation.y), r = new THREE.Vector3(-f.z, 0, f.x); /* model faces +Z: its right is -X */ const a = ang * Math.PI / 180; return f.multiplyScalar(Math.cos(a)).addScaledVector(r, Math.sin(a)).multiplyScalar(C.speed); };
      e.debugVel = C.speed ? vel(C.ang) : null; window.__x0 = e.group.position.clone();
      window.__drive = () => { const now = performance.now(), dt = Math.min(0.2, (now - lastT) / 1000), T = (now - t0) / 1000; lastT = now;
        if (C.turn) e.group.rotation.y += C.turn * dt;
        if (C.startStop) e.debugVel = (Math.floor(T / 1.2) % 2 === 0) ? vel(0) : null;
        if (C.flip && Math.floor(T / 1.0) !== window.__fl) { window.__fl = Math.floor(T / 1.0); e.debugVel = vel(window.__fl % 2 ? 270 : 90); }
        if (e.group.position.distanceTo(window.__x0) > 4 && e.debugVel) { e.group.position.copy(window.__x0); } }; // stay in front of the camera (the reset frame is not a contact: spans need >= 3 frames)
      window.__start(C.name); }, C);
    await p.waitForTimeout(1000); await p.evaluate(() => { window.__S.f.length = 0; window.__S.snap = 0; window.__S.lastQ = null; }); // skip the first second (posture change)
    await p.waitForTimeout(C.startStop || C.flip ? 4800 : 3000);
    const S = await p.evaluate(() => { const S = window.__S; window.__S = null; window.__drive = null; window.__e.debugVel = null; return { f: S.f, snap: +S.snap.toFixed(1), hv: { torso: +S.hv.torso.toFixed(3), head: +S.hv.head.toFixed(3), limb: +S.hv.limb.toFixed(3) }, wN: S.wN, wMax: +S.wMax.toFixed(2), wMin: +S.wMin.toFixed(2), gap: +S.gap.toFixed(3), legInTorso: S.legInTorso, diag: S.diag, frames: S.f.length }; });
    const r = { name: C.name, band: C.band, frames: S.frames, slide: slideOf(S.f), snap: S.snap, hv: S.hv, wN: S.wN, wMax: S.wMax, wMin: S.wMin, gap: S.gap, legInTorso: S.legInTorso, diag: S.diag }; res.cases.push(r);
    const lim = C.band === 'run' ? LIM.slideRun : C.band === 'crouch' ? LIM.slideCrouch : C.band === 'turn' ? LIM.slideTurn : LIM.slideWalk;
    if (r.frames < 10) fail.push(C.name + ': only ' + r.frames + ' frames sampled');
    if (r.slide.p90 > lim) fail.push(C.name + ': planted foot slides ' + r.slide.p90 + ' cm (p90 > ' + lim + ')');
    if (r.snap > LIM.snapDeg) fail.push(C.name + ': pose snap ' + r.snap + ' deg/frame@30fps (> ' + LIM.snapDeg + ')');
    if (r.hv.torso > LIM.torso || r.hv.head > LIM.head || r.hv.limb > LIM.limb) fail.push(C.name + ': hit volumes off the bones ' + JSON.stringify(r.hv));
    if (C.speed && !r.wN) fail.push(C.name + ': no loco weights (locoW empty)');
    if (C.ang % 90 === 45 && C.speed && r.diag < r.frames * 0.5) fail.push(C.name + ': diagonal did not blend two directions (' + r.diag + '/' + r.frames + ')');
    { const cap = CAP[res.setup.tier] || 4; if (r.wN > cap + 1) fail.push(C.name + ': ' + r.wN + ' clips weighted (tier ' + res.setup.tier + ' cap ' + cap + ' + base)'); }
    if (r.wN && (r.wMax > LIM.wSumMax || r.wMin < LIM.wSumMin)) fail.push(C.name + ': blend weights overlap/underfill (sum ' + r.wMin + '..' + r.wMax + ', want ' + LIM.wSumMin + '..' + LIM.wSumMax + ')');
    if (r.gap < LIM.footGap) fail.push(C.name + ': feet overlap (min gap ' + (r.gap * 100).toFixed(1) + ' cm < ' + LIM.footGap * 100 + ')');
    if (r.legInTorso) fail.push(C.name + ': knee inside the torso capsule on ' + r.legInTorso + ' frames');
    if (process.env.SS_LOCO_DIAG) console.log(JSON.stringify(r)); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'LOCOFOOT FAIL ' + fail.join(' ; ').slice(0, 900) : 'LOCOFOOT PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('LOCOFOOT FAIL exception ' + e.message); process.exit(1); });
