// step 2 (?hits=2&loco=2): per-body-part hit reactions. NOT RUN YET (box busy when written).
// A fighter is posed 15 m ahead (debugPose). Per zone it is hit through the real shot test (weapon.firstHit -> takeHit):
//  armL / legR / torso: lastHitZone matches, wounds[zone] +1, SS.hitZones[zone] +1, reactW peaks >= 0.5 within 0.25 s and falls
//  < 0.1 within 1.0 s (torso/arm) / 1.3 s (leg); the hit-side limb volume stays on its drawn bones (<= 8 cm) while reacting;
//  torso: root steps back 0.2-0.5 m away from the shooter, never into a collider; no per-frame bone pop > 25 cm.
//  Lasting (AI released for 4 s): arm wound -> spreadMul >= 2.4 and clutchW > 0.5 at some point while not firing;
//  leg wound -> limp > 0.5 and speedMul <= 0.65.
//  Kills (2d): head -> SS.lastFall.zone 'head', preFallS <= 0.15; leg -> preFallS >= 0.3; Hips never jump > 30 cm in one
//  frame over the first 1 s of the fall (blended takeover, no pop).
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
  await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; window.__pool = []; for (let i = 0; i < 10 && window.__pool.length < 6; i++) { const e = SS.debug.spawnEnemy(); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; window.__pool.push(e); } } });
  const BONE = { armL: ['LeftArm', 'LeftForeArm'], legR: ['RightUpLeg', 'RightLeg'], torso: null, head: null };
  const shoot = async (zone, kill) => p.evaluate(async ([zone, kill, BONE]) => { const THREE = SS.THREE, c = SS.camera.position.clone(); const e = window.__pool.shift(); if (!e) return { skipped: 'no fighter' };
    for (const q of window.__pool) SS.enemies.debugPose(q, c.x + 40, c.z - 5, 'idle'); SS.enemies.debugPose(e, c.x, c.z - 15, 'idle'); e.group.rotation.y = 0; e.pinned = false; e.staggerT = 0; e.debugHold = true; /* AI frozen but not test-pinned, so the root step runs */ e.health = kill ? 1 : 1e9;
    await new Promise((ok) => setTimeout(ok, 1000)); e.group.updateMatrixWorld(true); const B = e.bones, W = (n) => B[n].getWorldPosition(new THREE.Vector3());
    const pt = zone === 'head' ? W('Head') : zone === 'torso' ? W('Hips').lerp((e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()), 0.6) : zone === 'armL' ? W('LeftArm').lerp(W('LeftForeArm'), 0.5) : zone === 'legR' ? W('RightUpLeg').lerp(W('RightLeg'), 0.5) : W('Hips');
    const eye = SS.camera.getWorldPosition(new THREE.Vector3()), dir = pt.clone().sub(eye).normalize(), h = SS.weapon.firstHit(eye, dir), ud = h && h.object.userData;
    if (!ud || ud.enemy !== e) return { zone, skipped: 'shot missed (' + (h ? h.object.name || 'world' : 'none') + ')' };
    const z0 = { ...(SS.hitZones || {}) }, w0 = e.wounds ? { ...e.wounds } : null, pos0 = e.group.position.clone(); const hips = [];
    e.takeHit(ud.part, h.point); const t0 = performance.now(); let peak = 0, peakT = null, downT = null, hv = 0, pop = 0, prev = null;
    const segDist = (q, a, b2) => { const ab = b2.clone().sub(a), t = Math.max(0, Math.min(1, q.clone().sub(a).dot(ab) / Math.max(1e-9, ab.lengthSq()))); return q.distanceTo(a.addScaledVector(ab, t)); };
    while (performance.now() - t0 < 1500) { await new Promise((r) => requestAnimationFrame(r)); const el = (performance.now() - t0) / 1000; const B2 = e.bones; if (!B2 || !B2.Hips) break;
      const hp = B2.Hips.getWorldPosition(new THREE.Vector3()); if (prev && SS.lastSimDt < 0.06) pop = Math.max(pop, hp.distanceTo(prev)); prev = hp; hips.push(hp.y);
      if (!kill) { const w = +e.reactW || 0; if (w > peak) { peak = w; peakT = el; } if (peak >= 0.5 && downT == null && w < 0.1) downT = el;
        if (BONE[zone]) { const [a, b2] = BONE[zone]; for (const m of SS.weapon.targets) { if (m.userData.enemy !== e || m.userData.part !== 'limb') continue; const seg = m.userData.seg; if (!seg || String(seg) !== String([a, b2])) continue;
          hv = Math.max(hv, segDist(m.getWorldPosition(new THREE.Vector3()), B2[a].getWorldPosition(new THREE.Vector3()), B2[b2].getWorldPosition(new THREE.Vector3()))); } } } }
    const out = { zone, part: ud.part, kill, lastHitZone: e.lastHitZone, wound: w0 && e.wounds ? (e.wounds[zone] | 0) - (w0[zone] | 0) : null, ssZone: SS.hitZones ? (SS.hitZones[zone] | 0) - (z0[zone] | 0) : null,
      reactPeak: +peak.toFixed(2), peakS: peakT && +peakT.toFixed(2), downS: downT && +downT.toFixed(2), limbVolCm: Math.round(hv * 100), popCm: Math.round(pop * 100),
      stepM: +Math.hypot(e.group.position.x - pos0.x, e.group.position.z - pos0.z).toFixed(2), stepAway: e.group.position.z < pos0.z, fall: kill ? (SS.lastFall || null) : undefined };
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
  for (const z of ['head', 'legR']) { const r = await shoot(z, true); res.kills.push(r); if (r.skipped) { fail.push('kill ' + z + ': ' + r.skipped); continue; }
    const f = r.fall; if (!f) fail.push('kill ' + z + ': no SS.lastFall'); else { if (f.zone !== z) fail.push('kill ' + z + ': fall zone ' + f.zone);
      if (z === 'head' && f.preFallS > 0.15) fail.push('head kill pre-fall ' + f.preFallS + ' s'); if (z === 'legR' && f.preFallS < 0.3) fail.push('leg kill pre-fall ' + f.preFallS + ' s'); }
    if (r.popCm > 30) fail.push('kill ' + z + ': hips popped ' + r.popCm + ' cm in one frame (ragdoll takeover)'); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'HITREACT FAIL ' + fail.join(' ; ').slice(0, 1200) : 'HITREACT PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('HITREACT FAIL exception ' + e.message); process.exit(1); });
