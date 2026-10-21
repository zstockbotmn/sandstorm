// A5 follow-up (NOT run yet, written while the tester plays A5). hood-fall.js staged the fighter beside the car's near face, so
// all 3 bodies fell next to it (hoodS 0): it never tested a hood landing. Here: take the nearest burnt-car collider box, find
// its long axis, and stand a fighter 0.35 m off the END that faces the camera (cars are parked along the street, so that end
// points at the player), back to the camera, facing the car. A torso hit from the camera (hit dir = camera -> point) pitches
// him forward along the long axis onto the hood/bonnet end. Runs shift him sideways across the hood (-0.4, 0, +0.4 m).
// Per run over 10 s: torsoOnHoodS (torso/head part centre over the end 40 % of the box and above top - 0.25 m), whether the
// torso ever reached the hood, end position (hood / ground), part penetration into the box, settle jitter (last 2 s) and
// frame jumps. PASS: at least one run actually reaches the hood (else the staging missed, FAIL 'no hood contact'), every run
// max penetration <= 8 cm, settle jitter <= 3 cm, no frame jump > 25 cm. Resting on the hood or sliding off are both fine.
// Usage: SS_QS='&q=low&test=fast' SS_RUNS=3 node test/hood-land.js   (also &q=high)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8845;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '&q=low&test=fast', RUNS = +(process.env.SS_RUNS || 3);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const cases = [], fail = []; const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  for (let run = 0; run < RUNS; run++) {
    cases.push(await p.evaluate(async ([run, RUNS]) => { SS.walking = false; SS.player.health = 1e6; const THREE = SS.THREE, c = SS.camera.position; let box = null;
      for (const m of SS.world.colliders || []) { if (m.name !== 'car' || !m.geometry || m.geometry.type !== 'BoxGeometry') continue; m.updateWorldMatrix(true, false); const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); m.matrixWorld.decompose(pos, q, sc);
        const g = m.geometry.parameters, dz = c.z - pos.z; if (dz < 8 || dz > 90) continue; if (!box || dz < box.dz) box = { pos, q, qi: q.clone().invert(), hx: Math.abs(sc.x) * g.width / 2, hy: Math.abs(sc.y) * g.height / 2, hz: Math.abs(sc.z) * g.depth / 2, dz }; }
      if (!box) return { run, skipped: 'no car' };
      // long axis in world space; pick the end facing the camera
      const longX = box.hx >= box.hz, ax = new THREE.Vector3(longX ? 1 : 0, 0, longX ? 0 : 1).applyQuaternion(box.q).setY(0).normalize(), lat = new THREE.Vector3(-ax.z, 0, ax.x);
      const halfL = longX ? box.hx : box.hz, toCam = new THREE.Vector3(c.x - box.pos.x, 0, c.z - box.pos.z); if (toCam.dot(ax) < 0) ax.negate();
      const align = +Math.abs(toCam.clone().normalize().dot(ax)).toFixed(2); // 1 = the shot runs straight along the car
      const side = (run - (RUNS - 1) / 2) * 0.4, foot = box.pos.clone().addScaledVector(ax, halfL + 0.35).addScaledVector(lat, side);
      let e = null; for (let k = 0; k < 8 && !e; k++) { const q = SS.debug.spawnEnemy(); if (q && q.bones && q.alive && !(q.anchor && /roof|window/.test(q.anchor.type))) e = q; } if (!e) return { run, skipped: 'no fighter' };
      for (const q of SS.enemies.list) if (q !== e && q.alive) SS.enemies.debugPose(q, c.x + 40, c.z + 30, 'idle');
      SS.enemies.debugPose(e, foot.x, foot.z, 'idle'); e.group.rotation.y = Math.atan2(-ax.x, -ax.z); /* faces the car (back to the hood end's outside) */
      Object.assign(e, { pinned: false, staggerT: 0, debugHold: true, health: 1, engaged: true, shootCd: 1e9 });
      await new Promise((ok) => setTimeout(ok, 1000)); if (!e.alive) return { run, skipped: 'fighter gone' };
      const pt = e.bones.Hips.getWorldPosition(new THREE.Vector3()).lerp((e.spineTop || e.bones.Spine).getWorldPosition(new THREE.Vector3()), 0.6); SS.lastDoll = null; e.takeHit('body', pt);
      const L2 = new THREE.Vector3(), endZone = (v) => { L2.copy(v).sub(box.pos).applyQuaternion(box.qi); const along = longX ? L2.x : L2.z, across = longX ? L2.z : L2.x, wid = longX ? box.hz : box.hx;
        const s = Math.sign(new THREE.Vector3(longX ? 1 : 0, 0, longX ? 0 : 1).applyQuaternion(box.q).dot(ax)); return s * along > halfL * 0.2 && s * along < halfL && Math.abs(across) < wid && L2.y > box.hy - 0.25; };
      const t0 = performance.now(); let maxPen = 0, hoodMs = 0, last = t0, ref = null, jit = 0, prevHip = null, maxJump = 0, maxTorsoY = 0, reached = false;
      while (performance.now() - t0 < 10000) { await new Promise((ok) => requestAnimationFrame(ok)); const now = performance.now(), hp = e.bones.Hips.getWorldPosition(new THREE.Vector3());
        if (prevHip && (SS.lastSimDt || 0) < 0.06) maxJump = Math.max(maxJump, hp.distanceTo(prevHip)); prevHip = hp;
        const d = SS.lastDoll; let onHood = false;
        if (d && d.parts) for (const part of d.parts) { if (!part.rb) continue; const t = part.rb.translation(), v = new THREE.Vector3(t.x, t.y, t.z);
          if (part.name === 'torso' || part.name === 'head') { if (endZone(v)) onHood = true; if (part.name === 'torso') maxTorsoY = Math.max(maxTorsoY, t.y); }
          L2.copy(v).sub(box.pos).applyQuaternion(box.qi); const pen = Math.min(box.hx - Math.abs(L2.x), box.hy - Math.abs(L2.y), box.hz - Math.abs(L2.z)); if (pen > maxPen) maxPen = pen; }
        if (onHood) { hoodMs += now - last; reached = true; } last = now;
        if (now - t0 > 8000) { if (!ref) ref = hp.clone(); jit = Math.max(jit, hp.distanceTo(ref)); } }
      let endOnHood = false; const d = SS.lastDoll; if (d && d.parts) for (const part of d.parts) if (part.rb && part.name === 'torso') { const t = part.rb.translation(); endOnHood = endZone(new THREE.Vector3(t.x, t.y, t.z)); }
      const hp = e.bones.Hips.getWorldPosition(new THREE.Vector3());
      return { run, mode: (SS.lastFall || {}).mode, align, side: +side.toFixed(2), carTop: +(box.pos.y + box.hy).toFixed(2), reached, torsoOnHoodS: +(hoodMs / 1000).toFixed(1), maxTorsoY: +maxTorsoY.toFixed(2), endOnHood, endHipY: +hp.y.toFixed(2),
        maxPenCm: Math.round(maxPen * 100), settleJitCm: Math.round(jit * 100), maxFrameJumpCm: Math.round(maxJump * 100) }; }, [run, RUNS]));
  }
  await b.close(); srv.close();
  for (const r of cases) { console.log(JSON.stringify(r)); if (r.skipped) { fail.push('run ' + r.run + ': ' + r.skipped); continue; }
    if (r.maxPenCm > 8) fail.push('run ' + r.run + ': a part sat ' + r.maxPenCm + ' cm inside the car'); if (r.settleJitCm > 3) fail.push('run ' + r.run + ': settle jitter ' + r.settleJitCm + ' cm'); if (r.maxFrameJumpCm > 25) fail.push('run ' + r.run + ': frame jump ' + r.maxFrameJumpCm + ' cm'); }
  if (!cases.some((r) => r.reached)) fail.push('no hood contact in any run (staging missed; check align / side)');
  if (errs.length) fail.push('page errors: ' + errs.join(' | '));
  console.log(fail.length ? 'HOODLAND FAIL ' + fail.join(' ; ') : 'HOODLAND PASS (' + cases.filter((r) => r.reached).length + '/' + cases.length + ' reached the hood, ' + cases.filter((r) => r.endOnHood).length + ' rested there)'); process.exit(fail.length ? 1 : 0); })();
