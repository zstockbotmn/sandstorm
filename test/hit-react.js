// step 2 (?hits=2&loco=2): per-body-part hit reactions. NOT RUN YET (box busy when written).
// A fighter is posed 15 m ahead (debugPose). Per zone it is hit through the real shot test (weapon.firstHit -> takeHit):
//  armL / legR / torso: lastHitZone matches, wounds[zone] +1, SS.hitZones[zone] +1, reactW peaks >= 0.5 within 0.25 s and falls
//  < 0.1 within 1.0 s (torso/arm) / 1.3 s (leg); the hit-side limb volume stays on its drawn bones (<= 8 cm) while reacting;
//  torso: root steps back 0.2-0.5 m away from the shooter, never into a collider; no per-frame bone pop > 25 cm.
//  Lasting (AI released for 4 s): arm wound -> spreadMul >= 2.4 and clutchW > 0.5 at some point while not firing;
//  leg wound -> limp > 0.5 and speedMul <= 0.65.
//  Kills (2d): see killCase below (zone, pre-fall, knee buckle, no pop, fall direction, cover slump, settle, stays, Low cap).
// Usage: SS_QS='&q=low&test=fast' node test/hit-react.js   (also run with &q=high)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8839;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { zones: [], kills: [] }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { window.__more = () => { for (let i = 0; i < 10; i++) { const e = SS.debug.spawnEnemy(); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; return e; } } return null; }; /* 3 m cover spacing: spawn on demand once earlier fighters are dead */ SS.walking = false; SS.player.health = 1e6; window.__pool = []; for (let i = 0; i < 20 && window.__pool.length < 12; i++) { const e = SS.debug.spawnEnemy(); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; window.__pool.push(e); } } });
  const BONE = { armL: ['LeftArm', 'LeftForeArm'], legR: ['RightUpLeg', 'RightLeg'], torso: null, head: null };
  const shoot = async (zone, kill) => p.evaluate(async ([zone, kill, BONE]) => { const THREE = SS.THREE, c = SS.camera.position.clone(); const e = window.__pool.shift() || window.__more(); if (!e) return { skipped: 'no fighter' };
    for (const q of window.__pool) SS.enemies.debugPose(q, c.x + 40, c.z - 5, 'idle'); SS.enemies.debugPose(e, c.x, c.z - 15, 'idle'); e.group.rotation.y = 0; e.pinned = false; e.staggerT = 0; e.debugHold = true; /* AI frozen but not test-pinned, so the root step runs */ e.health = kill ? 1 : 1e9;
    const preA = e.group.position.clone(), preT = performance.now(); await new Promise((ok) => setTimeout(ok, 1000)); const driftV = e.group.position.clone().sub(preA).multiplyScalar(1 / Math.max(1, performance.now() - preT)); /* High: fighters creep (separation) even AI-frozen; subtract it */ e.group.updateMatrixWorld(true); const B = e.bones, W = (n) => B[n].getWorldPosition(new THREE.Vector3());
    const pt = zone === 'head' ? W('Head') : zone === 'torso' ? W('Hips').lerp((e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()), 0.6) : zone === 'armL' ? W('LeftArm').lerp(W('LeftForeArm'), 0.5) : zone === 'legR' ? W('RightUpLeg').lerp(W('RightLeg'), 0.5) : W('Hips');
    const eye = SS.camera.getWorldPosition(new THREE.Vector3()); let dir = pt.clone().sub(eye).normalize(), h = SS.weapon.firstHit(eye, dir), ud = h && h.object.userData;
    if (zone === 'armL' || zone === 'legR') { const [a1, a2] = BONE[zone], tail = zone === 'armL' ? 'LeftHand' : 'RightFoot'; /* the rifle arm sits in front of the chest (body ranks first): walk the limb for a clean limb hit */
      const pts = []; for (let k = 0; k <= 10; k++) pts.push(W(a1).lerp(W(a2), k / 10)); if (B[tail]) for (let k = 1; k <= 6; k++) pts.push(W(a2).lerp(W(tail), k / 6));
      for (const q of pts) { const d2 = q.clone().sub(eye).normalize(), h2 = SS.weapon.firstHit(eye, d2), u2 = h2 && h2.object.userData; if (u2 && u2.enemy === e && u2.part === 'limb' && /Left.*(Arm|Hand)|Right.*(Leg|Foot)/.test(String(u2.seg))) { dir = d2; h = h2; ud = u2; break; } } }
    if (!ud || ud.enemy !== e) return { zone, skipped: 'shot missed (' + (h ? h.object.name || 'world' : 'none') + ')' };
    if ((zone === 'armL' || zone === 'legR') && ud.part !== 'limb') return { zone, skipped: 'no clean limb hit on that limb (got ' + ud.part + ')' };
    const z0 = { ...(SS.hitZones || {}) }, w0 = e.wounds ? { ...e.wounds } : null, pos0 = e.group.position.clone(); const hips = [];
    if (e.reactSt) e.reactSt.wPeak = 0; e.takeHit(ud.part, h.point); const stepCmd = e.reactSt ? { m: +(e.reactSt.stepLeft || 0).toFixed(2), away: e.reactSt.stepDir.dot(dir) > 0 } : null; const t0 = performance.now(); let peak = 0, peakT = null, downT = null, hv = 0, pop = 0, prev = null;
    const segDist = (q, a, b2) => { const ab = b2.clone().sub(a), t = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()))); return q.distanceTo(a.addScaledVector(ab, t)); };
    while (performance.now() - t0 < 1500) { await new Promise((r) => requestAnimationFrame(r)); const el = (performance.now() - t0) / 1000; const B2 = e.bones; if (!B2 || !B2.Hips) break;
      const hp = B2.Hips.getWorldPosition(new THREE.Vector3()); if (prev && SS.lastSimDt < 0.06) pop = Math.max(pop, hp.distanceTo(prev)); prev = hp; hips.push(hp.y);
      if (!kill) { const w = +e.reactW || 0, wp = Math.max(w, (e.reactSt && +e.reactSt.wPeak) || 0); if (wp > peak) { peak = wp; peakT = el; } if (peak >= 0.5 && downT == null && w < 0.1) downT = el;
        if (BONE[zone]) { const [a, b2] = BONE[zone]; for (const m of SS.weapon.targets) { if (m.userData.enemy !== e || m.userData.part !== 'limb') continue; const seg = m.userData.seg; if (!seg || String(seg) !== String([a, b2])) continue;
          hv = Math.max(hv, segDist(m.getWorldPosition(new THREE.Vector3()), B2[a].getWorldPosition(new THREE.Vector3()), B2[b2].getWorldPosition(new THREE.Vector3()))); } } } }
    const out = { zone, part: ud.part, kill, lastHitZone: e.lastHitZone, wound: w0 && e.wounds ? (e.wounds[zone] | 0) - (w0[zone] | 0) : null, ssZone: SS.hitZones ? (SS.hitZones[zone] | 0) - (z0[zone] | 0) : null,
      reactPeak: +peak.toFixed(2), peakS: peakT && +peakT.toFixed(2), downS: downT && +downT.toFixed(2), limbVolCm: Math.round(hv * 100), popCm: Math.round(pop * 100),
      ...(() => { const dt = performance.now() - t0, q = e.group.position.clone().sub(pos0); const drift = driftV.length() * dt; /* High: AI-frozen fighters still creep ~0.5 m per 1.5 s, so there read the commanded step */ if (drift > 0.1 && stepCmd) return { stepM: stepCmd.m, stepAway: stepCmd.away, driftM: +drift.toFixed(2), stepFrom: 'react state' }; return { stepM: +Math.hypot(q.x, q.z).toFixed(2), stepAway: q.z < 0, driftM: +drift.toFixed(2) }; })(), fall: kill ? (SS.lastFall || null) : undefined };
    if (!kill) { e.pinned = false; e.debugHold = false; e.staggerT = 0; e.phase = 'hide'; let clutch = 0, limp = 0; const t1 = performance.now();
      while (performance.now() - t1 < 4000) { await new Promise((r) => requestAnimationFrame(r)); if (e.phase !== 'fire') clutch = Math.max(clutch, +e.clutchW || 0); limp = Math.max(limp, +e.limp || 0); }
      Object.assign(out, { clutchMax: +clutch.toFixed(2), spreadMul: e.spreadMul, limpMax: +limp.toFixed(2), speedMul: e.speedMul }); e.health = 1; try { e.takeHit('head', e.group.position.clone().setY(1.6)); } catch (_) {} }
    return out; }, [zone, kill, BONE]);
  for (const z of ['armL', 'legR', 'torso']) { const r = await shoot(z, false); res.zones.push(r); if (r.skipped) { fail.push(z + ': ' + r.skipped); continue; }
    if (r.lastHitZone !== z) fail.push(z + ': lastHitZone ' + r.lastHitZone); if (r.wound !== 1) fail.push(z + ': wounds +' + r.wound); if (r.ssZone !== 1) fail.push(z + ': SS.hitZones +' + r.ssZone);
    if (r.reactPeak < 0.5 || r.peakS > 0.25) fail.push(z + ': reaction peak ' + r.reactPeak + ' at ' + r.peakS + ' s'); if (r.downS == null || r.downS > (z === 'legR' ? 1.3 : 1.0)) fail.push(z + ': reaction did not settle (' + r.downS + ' s)');
    if (r.limbVolCm > 8) fail.push(z + ': limb hit volume ' + r.limbVolCm + ' cm off its bones while reacting'); if (r.popCm > 25) fail.push(z + ': hips popped ' + r.popCm + ' cm in one frame');
    if (z === 'torso' && (r.stepM < 0.2 || r.stepM > 0.5 || !r.stepAway)) fail.push('torso: step back ' + r.stepM + ' m (away ' + r.stepAway + ')');
    if (z === 'armL' && (!(r.spreadMul >= 2.4) || r.clutchMax <= 0.5)) fail.push('arm wound: spreadMul ' + r.spreadMul + ', clutch ' + r.clutchMax);
    if (z === 'legR' && (r.limpMax <= 0.5 || !(r.speedMul <= 0.65))) fail.push('leg wound: limp ' + r.limpMax + ', speedMul ' + r.speedMul); }
  // 2d kills: zone-aware ragdoll falls. Per case: lastFall zone/preFallS/mode, the pre-fall knee buckle (hips drop before the
  // ragdoll on torso/leg kills), no pop over the takeover (hips <= 30 cm per fast frame), falls along the shot (head/torso),
  // a kill behind cover slumps (inCover, hips travel <= 0.8 m from the shooter side), never under the ground, settles
  // (hips move < 2 cm over the last 1 s of 5 s) and the body is still there at 5 s.
  const killCase = (zone, opt) => p.evaluate(async ([zone, opt]) => { const THREE = SS.THREE, c = SS.camera.position.clone(); const e = window.__pool.shift() || window.__more(); if (!e) return { zone, skipped: 'no fighter' };
    for (const q of window.__pool) SS.enemies.debugPose(q, c.x + 40, c.z - 5, 'idle'); SS.enemies.debugPose(e, c.x + (opt.x || 0), c.z - 15, opt.posture || 'idle'); e.group.rotation.y = 0; e.pinned = false; e.staggerT = 0; e.debugHold = true; e.health = 1;
    if (opt.cover) { e.phase = 'hide'; } else e.phase = 'approach'; /* in the open (debugPose leaves 'peek', which counts as cover) */
    await new Promise((ok) => setTimeout(ok, 1000)); e.group.updateMatrixWorld(true); const B = e.bones, W = (n) => B[n].getWorldPosition(new THREE.Vector3());
    const pt = zone === 'head' ? W('Head') : zone === 'torso' ? W('Hips').lerp((e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()), 0.6) : W('RightUpLeg').lerp(W('RightLeg'), 0.5);
    const eye = SS.camera.getWorldPosition(new THREE.Vector3()), dir = pt.clone().sub(eye).normalize(), h = SS.weapon.firstHit(eye, dir), ud = h && h.object.userData;
    if (!ud || ud.enemy !== e) return { zone, skipped: 'shot missed (' + (h ? h.object.name || 'world' : 'none') + ')' };
    e.phase = opt.cover ? 'hide' : 'approach'; if (!opt.cover) { e.coverT = 0; e._coverPh = 0; } const hip0 = W('Hips'); SS.lastFall = null; e.takeHit(ud.part, h.point); const t0 = performance.now(); let prev = hip0.clone(), pop = 0, minPre = hip0.y, minY = 1e9, settleRef = null, move = 0;
    while (performance.now() - t0 < 5000) { await new Promise((r) => requestAnimationFrame(r)); const el = performance.now() - t0; const hp = e.bones.Hips.getWorldPosition(new THREE.Vector3());
      if (SS.lastSimDt < 0.06) pop = Math.max(pop, hp.distanceTo(prev)); if (el < 800) (window.__tr || (window.__tr = [])).push([zone, Math.round(el), +hp.y.toFixed(3), +(e.fallT || 0).toFixed(3), e.art && +e.art.root.position.y.toFixed(3), +hp.distanceTo(prev).toFixed(3), SS.lastFall && SS.lastFall.mode]); prev.copy(hp); minY = Math.min(minY, hp.y);
      if (!SS.lastFall || SS.lastFall.mode == null) minPre = Math.min(minPre, hp.y); /* pre-fall beat: lastFall lands at takeover */
      if (el > 4000) { if (!settleRef) settleRef = hp.clone(); move = Math.max(move, hp.distanceTo(settleRef)); } }
    const end = e.bones.Hips.getWorldPosition(new THREE.Vector3()), dv = end.clone().sub(hip0).setY(0), sd = dir.clone().setY(0).normalize();
    let present = false; try { let o = e.bones.Hips; while (o.parent) o = o.parent; present = o === SS.scene || o.isScene; } catch (_) {}
    const __t = window.__tr || []; window.__tr = []; return { trace: __t, zone, opt, fall: SS.lastFall, popCm: Math.round(pop * 100), preDropCm: Math.round((hip0.y - minPre) * 100), alongShotM: +dv.dot(sd).toFixed(2), travelM: +dv.length().toFixed(2), minHipY: +minY.toFixed(2), settleCm: Math.round(move * 100), present }; }, [zone, opt]);
  const tier = /q=ultra-low/.test(QS) ? 'ultra-low' : /q=high/.test(QS) ? 'high' : 'low';
  for (const [z, opt] of [['head', {}], ['torso', {}], ['legR', {}], ['torso', { cover: true, posture: 'crouch', tag: 'cover' }]]) { const r = await killCase(z, opt); res.kills.push(r); const n = 'kill ' + z + (opt.tag ? '/' + opt.tag : '');
    if (r.skipped) { fail.push(n + ': ' + r.skipped); continue; } const f = r.fall; if (!f) { fail.push(n + ': no SS.lastFall'); continue; }
    if (f.zone !== z) fail.push(n + ': fall zone ' + f.zone); if (tier === 'ultra-low' ? f.mode !== 'canned' : f.mode !== 'ragdoll') fail.push(n + ': mode ' + f.mode + ' on ' + tier);
    if (z === 'head' && f.preFallS > 0.15) fail.push(n + ': pre-fall ' + f.preFallS + ' s'); if (z === 'legR' && f.preFallS < 0.3) fail.push(n + ': pre-fall ' + f.preFallS + ' s');
    if (z === 'torso' && !opt.cover && (f.preFallS < 0.2 || f.preFallS > 0.32)) fail.push(n + ': pre-fall ' + f.preFallS + ' s');
    if ((z === 'torso' || z === 'legR') && tier !== 'ultra-low' && r.preDropCm < 8) fail.push(n + ': knees did not buckle first (hips dropped ' + r.preDropCm + ' cm before the ragdoll)');
    if (r.popCm > 30) fail.push(n + ': hips popped ' + r.popCm + ' cm in one frame (takeover)'); if (r.minHipY < -0.05) fail.push(n + ': body sank under the ground (' + r.minHipY + ')');
    if (!opt.cover && (z === 'head' || z === 'torso') && tier !== 'ultra-low' && r.alongShotM < -0.1) fail.push(n + ': fell toward the shooter (' + r.alongShotM + ' m)');
    if (opt.cover) { if (!f.inCover) fail.push(n + ': inCover not set'); if (r.travelM > 0.8) fail.push(n + ': flew ' + r.travelM + ' m from cover (no slump)'); }
    if (r.settleCm > 2) fail.push(n + ': body still moving at 4-5 s (' + r.settleCm + ' cm)'); if (!r.present) fail.push(n + ': body gone by 5 s'); }
  // Low cap: 4 kills in one frame -> at most 3 live ragdolls, the rest canned (High: all ragdolls).
  if (tier !== 'ultra-low') { res.cap = await p.evaluate(async () => { const c = SS.camera.position.clone(), L = window.__pool.filter((q) => q.alive !== false && q.bones).slice(0, 4); while (L.length < 4) { const m = window.__more(); if (!m) break; L.push(m); } if (L.length < 4) return { skipped: 'pool ' + L.length }; const modes = [];
      L.forEach((e, i) => { SS.enemies.debugPose(e, c.x - 4.5 + i * 3, c.z - 18, 'idle'); e.pinned = false; e.debugHold = true; e.staggerT = 0; e.health = 1; });
      await new Promise((ok) => setTimeout(ok, 800)); for (const e of L) { SS.lastFall = null; e.takeHit('head', e.group.position.clone().setY(1.6)); } await new Promise((ok) => setTimeout(ok, 1500));
      return { modes: L.map((e) => e.fallMode || null), dbg: L.map((e) => [e.alive, e.health, e.dying, e.phase]), last: SS.lastFall && SS.lastFall.mode }; });
    if (res.cap.skipped) fail.push('cap: ' + res.cap.skipped); else if (tier === 'low' && res.cap.last !== 'canned') fail.push('low cap: 4th simultaneous kill used ' + res.cap.last + ' (expected canned)'); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'HITREACT FAIL ' + fail.join(' ; ').slice(0, 1200) : 'HITREACT PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('HITREACT FAIL exception ' + e.message); process.exit(1); });
