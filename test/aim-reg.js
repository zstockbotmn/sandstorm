// m1w item 6: player shots aimed at the VISIBLE head / torso centre of fighters (from the animated skeleton, never the
// hitboxes) at 20 / 40 / 65 m, on the ground and on a rooftop, standing and strafing, all register (scoped, real fire
// queue). Also measures how well the hit volumes cover the visible, skinned body (rays through the body silhouette).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8831;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { cases: [] }, fail = [];
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms && !window.__inSlow) { window.__inSlow = true; const t0 = performance.now(); while (performance.now() - t0 < ms) {} setTimeout(() => { window.__inSlow = false; }, 0); } if (window.__preFrame && t !== window.__pfT) { window.__pfT = t; try { window.__preFrame(); } catch (_) {} } cb(t); }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; SS.debug.killAll && SS.debug.killAll();
    const THREE = SS.THREE; const ray = new THREE.Raycaster(); ray.far = 200;
    // visible aim points from the animated skeleton (what the skin is drawn from this frame)
    window.__vis = (e, part) => { const B = e.bones, v = new THREE.Vector3(); if (part === 'head') { B.Head.getWorldPosition(v); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(B.Head.getWorldQuaternion(new THREE.Quaternion())); return v.addScaledVector(up, 0.1 * e.group.scale.y / (e.group.scale.y || 1)); }
      const a = B.Hips.getWorldPosition(new THREE.Vector3()), top = (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()); return a.lerp(top, 0.55); };
    // A38 (App PM: state waits, not fixed ms): a frame cap (12 per case, 4 per shot) bounds them. pose landed = the fighter's hit volumes and skin root have stopped moving
    // (< 1 cm per painted frame over 2 frames, posture blend done); view settled = camera forward changed < 0.05 deg over 2 frames.
    window.__settle = async (still, maxF, camOnly) => { const tmo = 60000; const t0 = performance.now(), V = SS.THREE.Vector3, f0 = SS.frameN | 0; let prev = null, ok = 0;
      const snap = () => { const e = window.__e, a = []; if (e) for (const m of SS.weapon.targets) if (m.userData.enemy === e) a.push(m.getWorldPosition(new V())); return { v: a, f: SS.camera.getWorldDirection(new V()), n: SS.frameN | 0 }; };
      while (performance.now() - t0 < tmo) { await new Promise((r) => setTimeout(r, 15)); const s = snap(); if (prev && s.n === prev.n) continue;
        if (prev && (s.n - f0) >= 2) { let dv = 0; if (still && !camOnly) for (let i = 0; i < Math.min(s.v.length, prev.v.length); i++) dv = Math.max(dv, s.v[i].distanceTo(prev.v[i]));
          const da = s.f.angleTo(prev.f) * 180 / Math.PI, e = window.__e, blend = !e || e._crouchW == null || Math.abs(e._crouchW - Math.round(e._crouchW)) < 0.01;
          if ((!still || dv < 0.01) && (!still || da < 0.05) && blend) ok++; else ok = 0; if (ok >= 2) return { frames: s.n - f0, ms: Math.round(performance.now() - t0) }; if (s.n - f0 >= maxF) return { capped: true, frames: s.n - f0, ms: Math.round(performance.now() - t0) }; }
        prev = s; }
      return { timeout: true, frames: (SS.frameN | 0) - f0 }; };
    window.__skins = (e) => { const s = []; e.group.traverse((o) => { if (o.isSkinnedMesh && o.visible) s.push(o); }); return s; };
    window.__clear = (to) => { const c = SS.camera.position, d = to.clone().sub(c); const L = d.length(); ray.set(c, d.normalize()); const h = ray.intersectObjects(SS.world.shotList ? SS.world.shotList() : SS.world.colliders, false)[0]; return !h || h.distance > L + 0.2; };
    // silhouette coverage: rays through a grid over the skinned body; share that also hit one of this fighter's hit volumes
    window.__cover = (e) => { const sk = __skins(e); sk.forEach((m) => { m.boundingSphere = null; m.boundingBox = null; }); e.group.updateMatrixWorld(true); const box = new THREE.Box3(); sk.forEach((m) => { m.computeBoundingBox(); box.union(m.boundingBox.clone().applyMatrix4(m.matrixWorld)); });
      const c = SS.camera.position, ctr = box.getCenter(new THREE.Vector3()), f = ctr.clone().sub(c).normalize(), r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0)).normalize(), u = new THREE.Vector3().crossVectors(r, f);
      const sz = box.getSize(new THREE.Vector3()), W = Math.max(sz.x, sz.z) * 0.6, H = sz.y * 0.55; const tg = SS.weapon.targets.filter((m) => m.userData.enemy === e); const miss = []; let body = 0, both = 0, boxOnly = 0, lowMiss = 0, highMiss = 0;
      for (let i = 0; i <= 14; i++) for (let j = 0; j <= 28; j++) { const pt = ctr.clone().addScaledVector(r, (i / 14 - 0.5) * 2 * W).addScaledVector(u, (j / 28 - 0.5) * 2 * H); ray.set(c, pt.sub(c).normalize());
        const hm = ray.intersectObjects(sk, false).length > 0, hb = ray.intersectObjects(tg, false).length > 0; if (hm) { body++; if (hb) both++; else { if (j < 14) lowMiss++; else highMiss++; const hp = ray.intersectObjects(sk, false)[0].point; let nb = '', nd = 9; if (window.__diag) e.art.root.traverse((o) => { if (o.isBone) { const d = o.getWorldPosition(new THREE.Vector3()).distanceTo(hp); if (d < nd) { nd = d; nb = o.name; } } }); miss.push([+(hp.y - e.group.position.y).toFixed(2), +((hp.clone().sub(ctr)).dot(r)).toFixed(2), nb, +nd.toFixed(2)]); } } else if (hb) boxOnly++; }
      return { miss: window.__diag ? miss : undefined, body, covered: body ? +(both / body).toFixed(2) : 0, boxOnly, lowMiss, highMiss, h: +sz.y.toFixed(2) }; };
  });
  let cases = []; for (const where of ['ground', 'roof']) for (const dist of [20, 40, 65]) for (const move of ['still', 'moving']) cases.push({ where, dist, move });
  // m1x: a strafing fighter at 26 m at real strafe speed (4.6 m/s, an aggressive run across) at the tester's frame rates
  for (const fps of [2, 5, 8]) cases.push({ where: 'ground', dist: 26, move: 'strafe', speed: 4.6, fps });
  // m1x: crouched fighters (cover posture): the hit volumes must follow the visible crouched body
  for (const dist of [20, 40]) cases.push({ where: 'ground', dist, move: 'still', posture: 'crouch' });
  if (process.env.SS_AIMREG_ONLY) cases = cases.filter((c) => (c.move + c.dist + (c.posture || '')).includes(process.env.SS_AIMREG_ONLY));
  const OLD = !!process.env.SS_AIMREG_OLD; // A/B: pre-m1x shot path (live camera after this frame's aim) to show the bug
  if (process.env.SS_AIMREG_DIAG) { cases = [{ where: 'ground', dist: 20, move: 'still' }]; await p.evaluate(() => { window.__diag = true; }); }
  for (const C of cases) { const r = await p.evaluate((C) => { const THREE = SS.THREE; const c = SS.camera.position.clone(); if (window.__e && window.__e.alive) { SS.debug.killAll(); }
      const e = SS.debug.spawnEnemy('shifter'); window.__e = e; let spot = null;
      if (C.where === 'ground') { for (const dd of [0, 2, -2, 4, -4]) { for (const dx of [0, -1.5, 1.5, -3, 3, -4.5, 4.5]) { const z = c.z - Math.sqrt(Math.max(1, (C.dist + dd) ** 2 - dx * dx)); SS.enemies.debugPose(e, c.x + dx, z, C.posture || 'idle'); e.group.updateMatrixWorld(true); e.group.position.y = 0;
          if (e.art) { e.mixer.update(0); e.group.updateMatrixWorld(true); } if (__clear(__vis(e, 'head')) && __clear(__vis(e, 'body')) && __clear(e.group.position.clone().setY(1.0))) { spot = [dx, z]; break; } } if (spot) break; } }
      else { const roofs = []; for (const s of SS.world.segments) for (const cp of s.coverPoints) if (cp.type === 'roof' && cp.pos.z < c.z - 5) roofs.push(cp); roofs.sort((a, b) => Math.abs(Math.hypot(a.pos.x - c.x, a.pos.z - c.z) - C.dist) - Math.abs(Math.hypot(b.pos.x - c.x, b.pos.z - c.z) - C.dist));
        for (const cp of roofs.slice(0, 6)) { const side = Math.sign(cp.pos.x) || 1; SS.enemies.debugPose(e, cp.pos.x - side * 0.3, cp.pos.z, 'idle'); e.group.position.y = cp.pos.y - 0.15; e.anchor = cp; e.group.updateMatrixWorld(true); if (e.art) e.mixer.update(0);
          if (__clear(__vis(e, 'head')) && __clear(__vis(e, 'body'))) { spot = [e.group.position.x, e.group.position.z, +e.group.position.y.toFixed(2)]; break; } } }
      if (!spot) return { C, spot: null };
      e.health = 1e9; e.shootCd = 1e9; e.noFireUntilR = 1e15; const ax = C.where === 'roof' ? 'z' : 'x'; window.__x0 = e.group.position[ax];
      // m1x: direction flips happen in the per-frame hook (deterministic), so the aim's one-frame lead knows the velocity
      clearInterval(window.__flip); window.__vmax = C.move === 'strafe' ? C.speed : 2.2; window.__bound = C.move === 'strafe' ? 2.5 : 1.6; window.__ax = ax;
      if (C.move !== 'still') { e.debugVel = new THREE.Vector3(ax === 'x' ? window.__vmax : 0, 0, ax === 'z' ? window.__vmax : 0); }
      SS.input.scope = true; SS.weapon.ammo = 30; SS.weapon.reserve = 200; window.__part = 'body';
      SS.weapon.onShotDebug = (L) => { const aim = SS.weapon.seenAim === false ? window.__aimPt : (window.__aimSeen || window.__aimPt); if (!aim) return; const t = aim.clone().sub(L.origin).dot(L.dir); const q = L.origin.clone().addScaledVector(L.dir, t); window.__lastMiss = [+(q.x - aim.x).toFixed(3), +(q.y - aim.y).toFixed(3), +(q.z - aim.z).toFixed(3)]; };
      // The emulated player tracks like a person does: the view it sets this frame is drawn together with the fighter's
      // NEW position, so it leads by the fighter's motion over this frame (v * this frame's sim dt); a shot then fires along
      // the view that was on screen (m1x) against the fighter as drawn in that same frame.
      window.__lastPF = 0; window.__preFrame = () => { if (!window.__e || !window.__e.alive) return; const e = window.__e, now = performance.now(); const gap = window.__lastPF ? Math.min(0.2, (now - window.__lastPF) / 1000) : 0.016; window.__lastPF = now;
        if (e.debugVel) { const ex = e.group.position[window.__ax] - window.__x0, vx = e.debugVel[window.__ax]; if (Math.abs(ex) > window.__bound && Math.sign(vx) === Math.sign(ex)) e.debugVel[window.__ax] = -vx; }
        window.__aimSeen = window.__aimPt; window.__aimPt = __vis(e, window.__part); if (e.debugVel) window.__aimPt.addScaledVector(e.debugVel, gap * (SS.timeScale || 1)); const v = window.__aimPt.clone().sub(SS.camera.position); SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); };
      return { C, spot, d: +e.group.position.distanceTo(c).toFixed(1) }; }, C);
    if (!r.spot) { r.skip = 'no clear spot'; res.cases.push(r); if (!(C.where === 'roof' && C.dist === 65)) fail.push(C.where + ' ' + C.dist + ' m: no clear spot'); continue; }
    await p.evaluate(([fps, old]) => { window.__slowMs = fps ? Math.round(1000 / fps) : 0; SS.weapon.seenAim = old ? false : undefined; }, [C.fps || 0, OLD]);
    r.settle = await p.evaluate((st) => __settle(st, 12), C.move === 'still'); r.cover = await p.evaluate(() => __cover(window.__e)); r.shots = [];
    for (const part of ['body', 'head']) for (let k = 0; k < 4; k++) { await p.evaluate((part) => { window.__part = part; }, part); await p.evaluate((st) => __settle(st, 4), C.move === 'still');
      const s = await p.evaluate(() => { window.__h0 = SS.weapon.shotsFired; SS.input.pendingShots = (SS.input.pendingShots | 0) + 1; return SS.weapon.shotsFired; });
      await p.waitForFunction((n) => SS.weapon.shotsFired > n, s, { timeout: 8000, polling: 100 }).catch(() => {});
      r.shots.push(await p.evaluate((part) => { const L = SS.weapon.lastShot, h = L && L.hit; const miss = window.__lastMiss; // how far (m) the shot ray passed from the visible aim point of the shot's own frame
        return { part, hit: h ? (h.enemy ? h.part : 'world:' + h.name) : 'none', miss }; }, part)); }
    await p.evaluate(() => { clearInterval(window.__flip); window.__preFrame = null; window.__slowMs = 0; SS.weapon.seenAim = undefined; if (window.__e) window.__e.debugVel = null; });
    r.ok = r.shots.filter((s) => s.hit === (s.part === 'head' ? 'head' : 'body')).length; r.reg = r.shots.filter((s) => s.hit === 'head' || s.hit === 'body' || s.hit === 'limb').length;
    res.cases.push(r); const tag = C.where + ' ' + C.dist + ' m ' + C.move + (C.posture ? ' ' + C.posture : '') + (C.fps ? ' @' + C.fps + 'fps' : '');
    if (r.reg < r.shots.length) fail.push(tag + ': ' + (r.shots.length - r.reg) + '/' + r.shots.length + ' aimed shots did not register ' + JSON.stringify(r.shots.filter((s) => !/head|body|limb/.test(s.hit))).slice(0, 300));
    else if (r.ok < r.shots.length - 1) fail.push(tag + ': only ' + r.ok + '/' + r.shots.length + ' hit the aimed part');
    if (r.cover.covered < 0.8) fail.push(tag + ': hit volumes cover only ' + Math.round(r.cover.covered * 100) + '% of the visible body ' + JSON.stringify(r.cover)); }
  // m1x: shots fly along the view that was ON SCREEN; take the centre check on a still view (one more shot after the camera settled)
  await p.evaluate(() => __settle(true, 12, true)); { const s0 = await p.evaluate(() => { SS.input.pendingShots = (SS.input.pendingShots | 0) + 1; return SS.weapon.shotsFired; }); await p.waitForFunction((n) => SS.weapon.shotsFired > n, s0, { timeout: 8000 }).catch(() => {}); res.centreSettle = await p.evaluate(() => __settle(true, 12, true)); }
  // the shot ray IS the crosshair: a point 50 m down the last shot ray projects to the screen centre, where the crosshair / scope reticle sit
  res.centre = await p.evaluate(() => { const L = SS.weapon.lastShot; SS.camera.updateMatrixWorld(); const q = L.origin.clone().addScaledVector(L.dir, 50).project(SS.camera); const ce = document.getElementById('crosshair'); ce.style.display = 'block'; ce.style.visibility = 'visible'; const ch = ce.getBoundingClientRect(); ce.style.display = ''; ce.style.visibility = ''; /* hidden while scoped: measure its anchor */ const rd = document.querySelector('#scope-overlay .rd'); const rr = rd ? rd.getBoundingClientRect() : null;
    return { ndc: [+q.x.toFixed(4), +q.y.toFixed(4)], cross: [+(ch.x + ch.width / 2 - innerWidth / 2).toFixed(1), +(ch.y + ch.height / 2 - innerHeight / 2).toFixed(1)], dot: rr && rr.width ? [+(rr.x + rr.width / 2 - innerWidth / 2).toFixed(1), +(rr.y + rr.height / 2 - innerHeight / 2).toFixed(1)] : null, canvas: [SS.renderer ? 0 : null] }; });
  if (Math.abs(res.centre.ndc[0]) * 422 > 1.5 || Math.abs(res.centre.ndc[1]) * 195 > 1.5) fail.push('shot ray off the screen centre ' + JSON.stringify(res.centre)); if (Math.abs(res.centre.cross[0]) > 1 || Math.abs(res.centre.cross[1]) > 1) fail.push('crosshair off the screen centre ' + JSON.stringify(res.centre));
  if (res.centre.dot && (Math.abs(res.centre.dot[0]) > 1 || Math.abs(res.centre.dot[1]) > 1)) fail.push('scope dot off the screen centre ' + JSON.stringify(res.centre));
  res.hbFit = await p.evaluate(() => SS.hbFit || null); res.spill = Math.max(...res.cases.filter((c) => c.cover).map((c) => c.cover.boxOnly / Math.max(1, c.cover.body))).toFixed(2);
  { const cv = res.cases.filter((c) => c.cover); const avg = cv.reduce((a, c) => a + c.cover.covered, 0) / Math.max(1, cv.length); res.avgCover = +avg.toFixed(2);
    if (avg < 0.88) fail.push('hit volumes cover ' + Math.round(avg * 100) + '% of the visible body on average (< 88%)'); if (+res.spill > 0.45) fail.push('hit volumes spill ' + res.spill + ' x the body area outside the silhouette (> 0.45)'); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'AIMREG FAIL ' + fail.join(' ; ').slice(0, 600) : 'AIMREG PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('AIMREG FAIL exception ' + e.message); process.exit(1); });
