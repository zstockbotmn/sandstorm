// A4 tester: a body briefly sprawled across the burnt car's hood. Stage a STANDING fighter in the open 0.45 m on the shooter's
// side of the nearest car, back to the camera (facing the car), torso hit from the camera, so he falls forward onto the hood.
// Over 10 s: hips track, parts never deep inside the car box (> 8 cm), settle jitter (last 2 s) <= 3 cm, and where he rests
// (hood vs ground). Usage: SS_QS='&q=low&test=fast' SS_RUNS=3 node test/hood-fall.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8844;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '&q=low&test=fast', RUNS = +(process.env.SS_RUNS || 3);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const cases = [], fail = []; const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  for (let run = 0; run < RUNS; run++) {
    cases.push(await p.evaluate(async (run) => { SS.walking = false; SS.player.health = 1e6; const THREE = SS.THREE, c = SS.camera.position; let box = null;
      for (const m of SS.world.colliders || []) { if (m.name !== 'car' || !m.geometry || m.geometry.type !== 'BoxGeometry') continue; m.updateWorldMatrix(true, false); const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); m.matrixWorld.decompose(pos, q, sc);
        const g = m.geometry.parameters, dz = c.z - pos.z; if (dz < 8 || dz > 90) continue; if (!box || dz < box.dz) box = { pos, q, qi: q.clone().invert(), hx: Math.abs(sc.x) * g.width / 2, hy: Math.abs(sc.y) * g.height / 2, hz: Math.abs(sc.z) * g.depth / 2, dz }; }
      if (!box) return { skipped: 'no car' };
      let e = null; for (let k = 0; k < 8 && !e; k++) { const q = SS.debug.spawnEnemy(); if (q && q.bones && q.alive && !(q.anchor && /roof|window/.test(q.anchor.type))) e = q; } if (!e) return { skipped: 'no fighter' };
      for (const q of SS.enemies.list) if (q !== e && q.alive) SS.enemies.debugPose(q, c.x + 40, c.z + 30, 'idle');
      // near face of the car toward the camera, a little to the side per run so the fall crosses the hood at different spots
      const dx = c.x - box.pos.x, dzc = c.z - box.pos.z, L = Math.hypot(dx, dzc), ux = dx / L, uz = dzc / L, half = Math.abs(ux) * box.hx + Math.abs(uz) * box.hz; // approx (car mostly axis-aligned)
      const side = (run - 1) * 0.6, px = box.pos.x + ux * (half + 0.45) - uz * side, pz = box.pos.z + uz * (half + 0.45) + ux * side;
      SS.enemies.debugPose(e, px, pz, 'idle'); e.group.rotation.y = Math.atan2(-ux, -uz) + Math.PI * 0; /* faces away from the camera, toward the car */
      e.group.rotation.y = Math.atan2(-ux, -uz); Object.assign(e, { pinned: false, staggerT: 0, debugHold: true, health: 1, engaged: true, shootCd: 1e9 });
      await new Promise((ok) => setTimeout(ok, 1000)); if (!e.alive) return { skipped: 'fighter gone' };
      const pt = e.bones.Hips.getWorldPosition(new THREE.Vector3()).lerp((e.spineTop || e.bones.Spine).getWorldPosition(new THREE.Vector3()), 0.6); SS.lastDoll = null; e.takeHit('body', pt);
      const t0 = performance.now(), L2 = new THREE.Vector3(); let maxPen = 0, hoodMs = 0, last = performance.now(), ref = null, jit = 0, maxHip = 0, prevHip = null, maxJump = 0;
      while (performance.now() - t0 < 10000) { await new Promise((ok) => requestAnimationFrame(ok)); const now = performance.now(), hp = e.bones.Hips.getWorldPosition(new THREE.Vector3()); maxHip = Math.max(maxHip, hp.y);
        if (prevHip && (SS.lastSimDt || 0) < 0.06) maxJump = Math.max(maxJump, hp.distanceTo(prevHip)); prevHip = hp;
        L2.copy(hp).sub(box.pos).applyQuaternion(box.qi); const overCar = Math.abs(L2.x) < box.hx && Math.abs(L2.z) < box.hz && L2.y > box.hy - 0.25; if (overCar) hoodMs += now - last; last = now;
        const d = SS.lastDoll; if (d && d.parts) for (const part of d.parts) { if (!part.rb) continue; const t = part.rb.translation(); L2.set(t.x, t.y, t.z).sub(box.pos).applyQuaternion(box.qi);
          const pen = Math.min(box.hx - Math.abs(L2.x), box.hy - Math.abs(L2.y), box.hz - Math.abs(L2.z)); if (pen > maxPen) maxPen = pen; }
        if (now - t0 > 8000) { if (!ref) ref = hp.clone(); jit = Math.max(jit, hp.distanceTo(ref)); } }
      const hp = e.bones.Hips.getWorldPosition(new THREE.Vector3()); L2.copy(hp).sub(box.pos).applyQuaternion(box.qi); const endOnHood = Math.abs(L2.x) < box.hx && Math.abs(L2.z) < box.hz && L2.y > box.hy - 0.25;
      return { run, mode: (SS.lastFall || {}).mode, carTop: +(box.pos.y + box.hy).toFixed(2), maxHipY: +maxHip.toFixed(2), hoodS: +(hoodMs / 1000).toFixed(1), endOnHood, endHipY: +hp.y.toFixed(2), maxPenCm: Math.round(maxPen * 100), settleJitCm: Math.round(jit * 100), maxFrameJumpCm: Math.round(maxJump * 100) }; }, run));
  }
  await b.close(); srv.close();
  for (const r of cases) { console.log(JSON.stringify(r)); if (r.skipped) { fail.push('run ' + r.run + ': ' + r.skipped); continue; }
    if (r.maxPenCm > 8) fail.push('run ' + r.run + ': a part sat ' + r.maxPenCm + ' cm inside the car'); if (r.settleJitCm > 3) fail.push('run ' + r.run + ': settle jitter ' + r.settleJitCm + ' cm'); }
  if (errs.length) fail.push('page errors: ' + errs.join(' | '));
  console.log(fail.length ? 'HOODFALL FAIL ' + fail.join(' ; ') : 'HOODFALL PASS (' + cases.filter((r) => r.endOnHood).length + '/' + cases.length + ' rested on the hood)'); process.exit(fail.length ? 1 : 0); })();
