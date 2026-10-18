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
  await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { if (window.__preFrame) try { window.__preFrame(); } catch (_) {} cb(t); }); });
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; SS.debug.killAll && SS.debug.killAll();
    const THREE = SS.THREE; const ray = new THREE.Raycaster(); ray.far = 200;
    // visible aim points from the animated skeleton (what the skin is drawn from this frame)
    window.__vis = (e, part) => { const B = e.bones, v = new THREE.Vector3(); if (part === 'head') { B.Head.getWorldPosition(v); const up = new THREE.Vector3(0, 1, 0).applyQuaternion(B.Head.getWorldQuaternion(new THREE.Quaternion())); return v.addScaledVector(up, 0.1 * e.group.scale.y / (e.group.scale.y || 1)); }
      const a = B.Hips.getWorldPosition(new THREE.Vector3()), top = (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()); return a.lerp(top, 0.55); };
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
  if (process.env.SS_AIMREG_DIAG) { cases = [{ where: 'ground', dist: 20, move: 'still' }]; await p.evaluate(() => { window.__diag = true; }); }
  for (const C of cases) { const r = await p.evaluate((C) => { const THREE = SS.THREE; const c = SS.camera.position.clone(); if (window.__e && window.__e.alive) { SS.debug.killAll(); }
      const e = SS.debug.spawnEnemy('shifter'); window.__e = e; let spot = null;
      if (C.where === 'ground') { for (const dd of [0, 2, -2, 4, -4]) { for (const dx of [0, -1.5, 1.5, -3, 3, -4.5, 4.5]) { const z = c.z - Math.sqrt(Math.max(1, (C.dist + dd) ** 2 - dx * dx)); SS.enemies.debugPose(e, c.x + dx, z, 'idle'); e.group.updateMatrixWorld(true); e.group.position.y = 0;
          if (e.art) { e.mixer.update(0); e.group.updateMatrixWorld(true); } if (__clear(__vis(e, 'head')) && __clear(__vis(e, 'body')) && __clear(e.group.position.clone().setY(1.0))) { spot = [dx, z]; break; } } if (spot) break; } }
      else { const roofs = []; for (const s of SS.world.segments) for (const cp of s.coverPoints) if (cp.type === 'roof' && cp.pos.z < c.z - 5) roofs.push(cp); roofs.sort((a, b) => Math.abs(Math.hypot(a.pos.x - c.x, a.pos.z - c.z) - C.dist) - Math.abs(Math.hypot(b.pos.x - c.x, b.pos.z - c.z) - C.dist));
        for (const cp of roofs.slice(0, 6)) { const side = Math.sign(cp.pos.x) || 1; SS.enemies.debugPose(e, cp.pos.x - side * 0.3, cp.pos.z, 'idle'); e.group.position.y = cp.pos.y - 0.15; e.anchor = cp; e.group.updateMatrixWorld(true); if (e.art) e.mixer.update(0);
          if (__clear(__vis(e, 'head')) && __clear(__vis(e, 'body'))) { spot = [e.group.position.x, e.group.position.z, +e.group.position.y.toFixed(2)]; break; } } }
      if (!spot) return { C, spot: null };
      e.health = 1e9; e.shootCd = 1e9; e.noFireUntilR = 1e15; const ax = C.where === 'roof' ? 'z' : 'x'; window.__x0 = e.group.position[ax];
      if (C.move === 'moving') { e.debugVel = new THREE.Vector3(ax === 'x' ? 2.2 : 0, 0, ax === 'z' ? 2.2 : 0); clearInterval(window.__flip); window.__flip = setInterval(() => { const ex = e.group.position[ax] - window.__x0; if (Math.abs(ex) > 1.6) e.debugVel[ax] = -Math.sign(ex) * 2.2; }, 100); }
      SS.input.scope = true; SS.weapon.ammo = 30; SS.weapon.reserve = 200; window.__part = 'body';
      SS.weapon.onShotDebug = (L) => { const aim = window.__aimPt; if (!aim) return; const t = aim.clone().sub(L.origin).dot(L.dir); const q = L.origin.clone().addScaledVector(L.dir, t); window.__lastMiss = [+(q.x - aim.x).toFixed(3), +(q.y - aim.y).toFixed(3), +(q.z - aim.z).toFixed(3)]; };
      window.__preFrame = () => { if (!window.__e || !window.__e.alive) return; window.__aimPt = __vis(window.__e, window.__part); const v = window.__aimPt.clone().sub(SS.camera.position); SS.input.yaw = Math.atan2(v.x, -v.z); SS.input.pitch = -Math.atan2(v.y, Math.hypot(v.x, v.z)); };
      return { C, spot, d: +e.group.position.distanceTo(c).toFixed(1) }; }, C);
    if (!r.spot) { r.skip = 'no clear spot'; res.cases.push(r); if (!(C.where === 'roof' && C.dist === 65)) fail.push(C.where + ' ' + C.dist + ' m: no clear spot'); continue; }
    await p.waitForTimeout(700); r.cover = await p.evaluate(() => __cover(window.__e)); r.shots = [];
    for (const part of ['body', 'head']) for (let k = 0; k < 4; k++) { await p.evaluate((part) => { window.__part = part; }, part); await p.waitForTimeout(250);
      const s = await p.evaluate(() => { window.__h0 = SS.weapon.shotsFired; SS.input.pendingShots = (SS.input.pendingShots | 0) + 1; return SS.weapon.shotsFired; });
      await p.waitForFunction((n) => SS.weapon.shotsFired > n, s, { timeout: 5000 }).catch(() => {});
      r.shots.push(await p.evaluate((part) => { const L = SS.weapon.lastShot, h = L && L.hit; const miss = window.__lastMiss; // how far (m) the shot ray passed from the visible aim point of the shot's own frame
        return { part, hit: h ? (h.enemy ? h.part : 'world:' + h.name) : 'none', miss }; }, part)); }
    await p.evaluate(() => { clearInterval(window.__flip); window.__preFrame = null; if (window.__e) window.__e.debugVel = null; });
    r.ok = r.shots.filter((s) => s.hit === (s.part === 'head' ? 'head' : 'body')).length; r.reg = r.shots.filter((s) => s.hit === 'head' || s.hit === 'body' || s.hit === 'limb').length;
    res.cases.push(r); const tag = C.where + ' ' + C.dist + ' m ' + C.move;
    if (r.reg < r.shots.length) fail.push(tag + ': ' + (r.shots.length - r.reg) + '/' + r.shots.length + ' aimed shots did not register ' + JSON.stringify(r.shots.filter((s) => !/head|body|limb/.test(s.hit))).slice(0, 300));
    else if (r.ok < r.shots.length - 1) fail.push(tag + ': only ' + r.ok + '/' + r.shots.length + ' hit the aimed part');
    if (r.cover.covered < 0.8) fail.push(tag + ': hit volumes cover only ' + Math.round(r.cover.covered * 100) + '% of the visible body ' + JSON.stringify(r.cover)); }
  // the shot ray IS the crosshair: a point 50 m down the last shot ray projects to the screen centre, where the crosshair / scope reticle sit
  res.centre = await p.evaluate(() => { const L = SS.weapon.lastShot; SS.camera.updateMatrixWorld(); const q = L.origin.clone().addScaledVector(L.dir, 50).project(SS.camera); const ch = document.getElementById('crosshair').getBoundingClientRect(); const rd = document.querySelector('#scope-overlay .rd'); const rr = rd ? rd.getBoundingClientRect() : null;
    return { ndc: [+q.x.toFixed(4), +q.y.toFixed(4)], cross: [+(ch.x + ch.width / 2 - innerWidth / 2).toFixed(1), +(ch.y + ch.height / 2 - innerHeight / 2).toFixed(1)], dot: rr && rr.width ? [+(rr.x + rr.width / 2 - innerWidth / 2).toFixed(1), +(rr.y + rr.height / 2 - innerHeight / 2).toFixed(1)] : null, canvas: [SS.renderer ? 0 : null] }; });
  if (Math.abs(res.centre.ndc[0]) * 422 > 1.5 || Math.abs(res.centre.ndc[1]) * 195 > 1.5) fail.push('shot ray off the screen centre ' + JSON.stringify(res.centre)); if (Math.abs(res.centre.cross[0]) > 1 || Math.abs(res.centre.cross[1]) > 1) fail.push('crosshair off the screen centre ' + JSON.stringify(res.centre));
  if (res.centre.dot && (Math.abs(res.centre.dot[0]) > 1 || Math.abs(res.centre.dot[1]) > 1)) fail.push('scope dot off the screen centre ' + JSON.stringify(res.centre));
  res.hbFit = await p.evaluate(() => SS.hbFit || null); res.spill = Math.max(...res.cases.filter((c) => c.cover).map((c) => c.cover.boxOnly / Math.max(1, c.cover.body))).toFixed(2);
  { const cv = res.cases.filter((c) => c.cover); const avg = cv.reduce((a, c) => a + c.cover.covered, 0) / Math.max(1, cv.length); res.avgCover = +avg.toFixed(2);
    if (avg < 0.88) fail.push('hit volumes cover ' + Math.round(avg * 100) + '% of the visible body on average (< 88%)'); if (+res.spill > 0.45) fail.push('hit volumes spill ' + res.spill + ' x the body area outside the silhouette (> 0.45)'); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'AIMREG FAIL ' + fail.join(' ; ').slice(0, 600) : 'AIMREG PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('AIMREG FAIL exception ' + e.message); process.exit(1); });
