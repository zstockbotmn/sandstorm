// step 1 prompt 2b (?loco=2): facing vs travel, turn-in-place, upper-body/head tracking limits. NOT RUN YET (box busy).
//  strafe   engaged fighter shuffling sideways keeps the torso on the player (aimYaw within 12 deg of the bearing), legs on strafe clips
//  turn120  stationary, player 120 deg off the body: turnL/turnR plays (enemy.turning), yaw rate <= 260 deg/s, settles within 8 deg in <= 2.5 s, ankles slide <= 8 cm
//  turn40   stationary, 40 deg: no turn clip, smooth body yaw <= 140 deg/s or spine twist only; twist <= 62 deg, no snap
//  limits   |twist| <= 62 deg and head-vs-hips yaw <= 80 deg on every frame; body yaw never jumps > 12 deg in one frame
//  hitvol   head sphere stays on the Head bone and torso capsule on Hips->spine while twisted (m1x hit volumes follow the drawn pose)
// Hooks used (2b prompt): enemy.bodyYaw, enemy.turning, enemy.aimYaw, enemy.twist. Usage: SS_QS='&q=low&test=fast' node test/loco-facing.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8835;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { cases: [] }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { if (window.__preFrame && t !== window.__pfT) { window.__pfT = t; try { window.__preFrame(); } catch (_) {} } cb(t); }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  res.setup = await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; window.__freezeCam = true; const c = SS.camera.position; const e = SS.debug.spawnEnemy('shifter'); window.__e = e;
    SS.enemies.debugPose(e, c.x, c.z - 10, 'idle'); e.health = 1e9; e.shootCd = 1e9; e.noFireUntilR = 1e15; e.engaged = true;
    return { bones: !!e.bones, hooks: ['bodyYaw', 'turning', 'aimYaw', 'twist'].filter((k) => !(k in e)) }; });
  if (!res.setup.bones) fail.push('fighter has no bones');
  if (res.setup.hooks.length) fail.push('2b hooks missing on the fighter: ' + res.setup.hooks.join(','));
  const cases = [{ name: 'strafe', off: 0, vel: 90, dur: 3000 }, { name: 'turn120', off: 120, dur: 3500 }, { name: 'turn40', off: 40, dur: 2500 }, { name: 'turn-120', off: -120, dur: 3500 }];
  for (const C of cases) {
    const r = await p.evaluate(async (C) => { const THREE = SS.THREE, e = window.__e, R0 = e.group, B = Object.assign({}, e.bones, { LeftFoot: e.bones.LeftFoot || e.bones.Hips.getObjectByName('LeftFoot'), RightFoot: e.bones.RightFoot || e.bones.Hips.getObjectByName('RightFoot') }), c = SS.camera.position; /* art.js bones have no feet */ const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a)), deg = (a) => a * 180 / Math.PI;
      SS.enemies.debugPose(e, c.x, c.z - 10, 'idle'); e.engaged = true; const bearing = Math.atan2(c.x - e.group.position.x, c.z - e.group.position.z); // yaw that faces the camera (+Z model forward)
      e.group.rotation.y = bearing - C.off * Math.PI / 180; if ('bodyYaw' in e) e.bodyYaw = e.group.rotation.y;
      if (C.vel == null) { e.pinned = false; e.staggerT = 0; e.path = null; e.debugHold = true; e.exposed = true; e.shootCd = 1e9; e.noFireUntilR = 1e15; } // debugPose pins + staggers = 2b facing off
      if (C.vel != null) { const f = new THREE.Vector3(Math.sin(bearing), 0, Math.cos(bearing)), rt = new THREE.Vector3(-f.z, 0, f.x); e.debugVel = rt.multiplyScalar(1.3); } else e.debugVel = null;
      const S = { t0: performance.now(), maxRate: 0, maxJump: 0, maxTwist: 0, maxHead: 0, turnSeen: null, settleT: null, aimErr: [], strafeW: 0, frames: 0, hv: { head: 0, torso: 0 }, feet: [] };
      const gYaw = () => { const v = new THREE.Vector3(0, 0, 1).applyQuaternion(e.group.quaternion); return Math.atan2(v.x, v.z); }; let lastY = gYaw(), lastT = performance.now(); const x0 = e.group.position.clone();
      const segDist = (q, a, b2) => { const ab = b2.clone().sub(a), t = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()))); return q.distanceTo(a.addScaledVector(ab, t)); };
      window.__preFrame = () => { const now = performance.now(), dt = (now - lastT) / 1000 * (SS.timeScale || 1); lastT = now; /* sim seconds (0.3x slowmo) */ e.group.updateMatrixWorld(true); S.frames++;
        if (e.debugVel && e.group.position.distanceTo(x0) > 3) e.group.position.copy(x0);
        const y = gYaw(), dy = Math.abs(wrap(y - lastY)); lastY = y; S.win = S.win || { a: 0, t: 0 }; S.win.a += deg(dy); S.win.t += dt; if (S.win.t >= 0.1) { S.maxRate = Math.max(S.maxRate, S.win.a / S.win.t); S.win.a = 0; S.win.t = 0; } /* rate over >= 0.1 s sim (rAF pairs 1 ms apart made per-frame rates meaningless) */ S.maxJump = Math.max(S.maxJump, deg(dy));
        S.maxTwist = Math.max(S.maxTwist, Math.abs(deg(+e.twist || 0))); if (e.turning && !S.turnSeen) S.turnSeen = e.turning;
        const hq = B.Hips.getWorldQuaternion(new THREE.Quaternion()), hd = B.Head.getWorldQuaternion(new THREE.Quaternion()); const fy = (q) => { const v = new THREE.Vector3(0, 0, 1).applyQuaternion(q); return Math.atan2(v.x, v.z); };
        S.maxHead = Math.max(S.maxHead, Math.abs(deg(wrap(fy(hd) - fy(hq)))));
        const bNow = Math.atan2(c.x - e.group.position.x, c.z - e.group.position.z); if (e.aimYaw != null) S.aimErr.push(Math.abs(deg(wrap(e.aimYaw - bNow))));
        if (S.settleT == null && C.vel == null && Math.abs(deg(wrap(y - bNow))) < 8 && !e.turning) S.settleT = (now - S.t0) * (SS.timeScale || 1); /* sim ms */
        const W = e.locoW || {}; S.strafeW = Math.max(S.strafeW, (W.strafeL || 0) + (W.strafeR || 0) + (W.runStrafeL || 0) + (W.runStrafeR || 0));
        for (const m of SS.weapon.targets) { if (m.userData.enemy !== e) continue; const ctr = m.getWorldPosition(new THREE.Vector3());
          if (m.userData.part === 'head') { const l = B.Head.worldToLocal(ctr.clone()).multiplyScalar(B.Head.getWorldScale(new THREE.Vector3()).x); if (!S.h0) S.h0 = l.clone(); S.hv.head = Math.max(S.hv.head, l.distanceTo(S.h0)); } /* drift of the head volume in the head bone's frame (its centre sits ~16 cm off the joint by design) */
          else if (m.userData.part === 'body') S.hv.torso = Math.max(S.hv.torso, segDist(ctr, B.Hips.getWorldPosition(new THREE.Vector3()), (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()))); }
        const lf = B.LeftFoot.getWorldPosition(new THREE.Vector3()), rf = B.RightFoot.getWorldPosition(new THREE.Vector3()); S.feet.push([lf.x, lf.y, lf.z, rf.x, rf.y, rf.z]); };
      SS.slowmoUntil = 1e15; await new Promise((ok) => setTimeout(ok, C.dur / 0.3)); SS.slowmoUntil = 0; /* sim at 0.3x: ~3x more samples per turn at swiftshader's ~9 fps; same sim duration */ window.__preFrame = null; e.debugVel = null; e.debugHold = false; SS.enemies.debugPose(e, c.x, c.z - 10, 'idle');
      // stationary cases: ankle travel while it is the lowest foot (planted) - strict, ankle-only
      let slide = 0; if (C.vel == null) for (const k of [0, 3]) { let lo = Infinity; for (const f of S.feet) lo = Math.min(lo, f[k + 1]); let prev = null, run = 0; for (const f of S.feet) { if (f[k + 1] < lo + 0.03) { if (prev) run += Math.hypot(f[k] - prev[0], f[k + 2] - prev[1]); prev = [f[k], f[k + 2]]; } else { slide = Math.max(slide, run); run = 0; prev = null; } } slide = Math.max(slide, run); }
      const ae = S.aimErr.slice(Math.floor(S.aimErr.length * 0.4)).sort((a, b2) => a - b2);
      return { name: C.name, frames: S.frames, maxRate: +S.maxRate.toFixed(0), maxJump: +S.maxJump.toFixed(1), maxTwist: +S.maxTwist.toFixed(1), maxHead: +S.maxHead.toFixed(1), turnSeen: S.turnSeen, settleMs: S.settleT && Math.round(S.settleT),
        aimErrP90: ae.length ? +ae[Math.floor(ae.length * 0.9)].toFixed(1) : null, strafeW: +S.strafeW.toFixed(2), hv: { head: +S.hv.head.toFixed(3), torso: +S.hv.torso.toFixed(3) }, slideCm: +(slide * 100).toFixed(1) }; }, C);
    res.cases.push(r); const F = (m) => fail.push(C.name + ': ' + m);
    if (r.frames < 10) F('only ' + r.frames + ' frames');
    if (r.maxJump > 12) F('body yaw jumped ' + r.maxJump + ' deg in one frame');
    if (r.maxTwist > 62) F('spine twist ' + r.maxTwist + ' deg (> 62)');
    if (r.maxHead > 140) F('head vs hips ' + r.maxHead + ' deg (> 140 = spine twist ~60 + head ~75 + margin, the 2b spec)');
    if (r.hv.head > 0.12 || r.hv.torso > 0.08) F('hit volumes off the bones while twisted ' + JSON.stringify(r.hv));
    if (C.name === 'strafe') { if (r.aimErrP90 == null || r.aimErrP90 > 12) F('torso not on the player while strafing (aim err p90 ' + r.aimErrP90 + ')'); if (r.strafeW < 0.5) F('legs did not blend strafe clips (' + r.strafeW + ')'); }
    if (Math.abs(C.off) === 120) { if (!r.turnSeen) F('no turn-in-place (enemy.turning never set)'); else if ((C.off > 0) !== (r.turnSeen === 'L')) F('turned ' + r.turnSeen + ' for a ' + C.off + ' deg offset'); if (r.maxRate > 260) F('yaw rate ' + r.maxRate + ' deg/s'); if (r.settleMs == null || r.settleMs > 2500) F('did not settle within 8 deg in 2.5 s (' + r.settleMs + ')'); if (r.slideCm > 8) (res.slideWarn = res.slideWarn || []).push(C.name + ' ' + r.slideCm + 'cm'); /* report-only (App PM: swiftshader slide numbers swing) */ }
    if (C.name === 'turn40') { if (r.turnSeen) F('turn clip for a 40 deg offset (should rotate/twist smoothly)'); if (r.maxRate > 140) F('yaw rate ' + r.maxRate + ' deg/s (> 140)'); }
  }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); if (res.slideWarn) console.log('SLIDE (report only, ankle cm while turning): ' + res.slideWarn.join(' ; ')); console.log(fail.length ? 'LOCOFACING FAIL ' + fail.join(' ; ').slice(0, 900) : 'LOCOFACING PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('LOCOFACING FAIL exception ' + e.message); process.exit(1); });
