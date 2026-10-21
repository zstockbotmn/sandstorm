// A2 tester: corpses launched up and over cover (behind a car or cart, headshots and K kills). Stages a crouched fighter
// tight behind a car-sized and a cart-sized cover box (parts start overlapping it), kills it with the K helper (head hit)
// and with a torso hit, and asserts: peak hip rise < 0.3 m over the hips at the kill, the body never crosses to the
// shooter's side of the cover, it ends above the ground, and it settles. Usage: SS_QS='&q=low&test=fast' node test/kill-cover.js
// (also &q=high).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8842;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { cases: [] }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  if (process.env.SS_PERSIST) await p.evaluate((v) => { window.__persist = v; }, +process.env.SS_PERSIST);
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  res.boxes = await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; const THREE = SS.THREE, c = SS.camera.position, out = { car: null, cart: null };
    for (const m of SS.world.colliders || []) { if (!m.geometry || m.geometry.type !== 'BoxGeometry') continue; m.updateWorldMatrix(true, false); const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); m.matrixWorld.decompose(pos, q, sc);
      const g = m.geometry.parameters, sx = Math.abs(sc.x) * g.width, sy = Math.abs(sc.y) * g.height, sz = Math.abs(sc.z) * g.depth, dz = c.z - pos.z; if (dz < 8 || dz > 90) continue;
      const long = Math.max(sx, sz), kind = m.name === 'car' ? 'car' : m.name === 'prop' && long >= 1.7 ? 'cart' : null; if (!kind) continue; /* world.js: burned car body 'car' (+ 'carcab'), market cart 'prop' */
      if (!out[kind] || dz < out[kind].dz) out[kind] = { kind, x: pos.x, y: pos.y, z: pos.z, sx, sy, sz, dz, name: m.name }; }
    window.__more = () => { for (let i = 0; i < 10; i++) { const e = SS.debug.spawnEnemy(); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; return e; } } return null; }; return out; });
  for (const kind of ['car', 'cart']) { const box = res.boxes[kind]; if (!box) { res.cases.push({ kind, skipped: 'no ' + kind + ' box in range' }); continue; }
    for (const how of ['K', 'torso']) {
      let r = null; for (let attempt = 0; attempt < 3 && (!r || r.retry); attempt++) r = await p.evaluate(async ([box, how]) => { const THREE = SS.THREE, c = SS.camera.position; let e = null; for (let k = 0; k < 6 && !e; k++) { const q = window.__more(); if (q && q.alive && q.group.parent && !(q.anchor && /roof|window/.test(q.anchor.type))) e = q; } if (!e) return { skipped: 'no live ground fighter' };
        for (const q of SS.enemies.list) if (q !== e && q.alive) SS.enemies.debugPose(q, c.x + 40, c.z + 30, 'idle'); /* far from the camera so K picks this fighter */
        // behind the box, on the far side from the camera, 0.15 m off its face so the crouched body overlaps it
        const dx = box.x - c.x, dz = box.z - c.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L; const halfAlong = Math.abs(ux) * box.sx / 2 + Math.abs(uz) * box.sz / 2;
        const px = box.x + ux * (halfAlong + 0.15), pz = box.z + uz * (halfAlong + 0.15);
        SS.enemies.debugPose(e, px, pz, 'crouch'); e.group.rotation.y = Math.atan2(-ux, -uz); e.pinned = false; e.staggerT = 0; e.debugHold = true; e.health = 1; e.phase = 'hide'; e.engaged = true;
        await new Promise((ok) => setTimeout(ok, 1000)); const hip0 = e.bones.Hips.getWorldPosition(new THREE.Vector3());
        if (!e.alive || !e.group.parent) return { retry: 'fighter gone during the settle wait' }; const pre = { alive: e.alive, dying: !!e.dying, hp: e.health, y: +e.group.position.y.toFixed(2), anchor: e.anchor && e.anchor.type, visible: e.group.visible, inScene: !!e.group.parent }; e.phase = 'hide'; SS.lastFall = null; SS.lastDoll = null; if (how === 'K') { const k = SS.debugKillNearest(); if (k !== e) return { skipped: 'K hit another fighter' }; }
        else { const pt = e.bones.Hips.getWorldPosition(new THREE.Vector3()).lerp((e.spineTop || e.bones.Spine).getWorldPosition(new THREE.Vector3()), 0.6); e.takeHit('body', pt); }
        const t0 = performance.now(); let maxY = -1e9, minY = 1e9, minAlong = 1e9, settleRef = null, move = 0;
        const DUR = window.__persist || 5000, top = box.y + box.sy / 2; let hidden = 0, onHood = 0, frames = 0, lastHip = null;
        const inScene = () => { let o = e.bones.Hips, vis = true; while (o.parent) { if (!o.visible) vis = false; o = o.parent; } return o.isScene && vis; };
        while (performance.now() - t0 < DUR) { await new Promise((ok) => requestAnimationFrame(ok)); const hp = e.bones.Hips.getWorldPosition(new THREE.Vector3()); maxY = Math.max(maxY, hp.y); minY = Math.min(minY, hp.y); frames++; lastHip = hp; if (!inScene()) hidden++; if (hp.y > top - 0.15 && Math.abs(hp.x - box.x) < box.sx / 2 && Math.abs(hp.z - box.z) < box.sz / 2) onHood++;
          minAlong = Math.min(minAlong, (hp.x - box.x) * ux + (hp.z - box.z) * uz); { const d = SS.lastDoll, pv = d && d.parts && d.parts.find((q) => q.name === 'pelvis'); if (pv && pv.rb) { const ty = pv.rb.translation().y; window.__pmin = Math.min(window.__pmin == null ? 9 : window.__pmin, ty); } } if (performance.now() - t0 > 4000) { if (!settleRef) settleRef = hp.clone(); move = Math.max(move, hp.distanceTo(settleRef)); } }
        const SSf = SS.lastFall || {}; const pelvisMinY = window.__pmin == null ? null : +window.__pmin.toFixed(2); window.__pmin = null; return { persist: { ms: DUR, frames, hiddenFrames: hidden, onHoodFrames: onHood, endHip: lastHip && [+lastHip.x.toFixed(2), +lastHip.y.toFixed(2), +lastHip.z.toFixed(2)], endOnHood: !!(lastHip && lastHip.y > top - 0.15 && Math.abs(lastHip.x - box.x) < box.sx / 2 && Math.abs(lastHip.z - box.z) < box.sz / 2), carTop: +top.toFixed(2) }, pelvisMinY, pre, fallT: e.fallT, dying: !!e.dying, dead: e.alive === false, how, riseM: +(maxY - hip0.y).toFixed(2), minHipY: +minY.toFixed(2), minAlongM: +minAlong.toFixed(2), halfAlong: +halfAlong.toFixed(2), settleCm: Math.round(move * 100), mode: SSf.mode, inCover: SSf.inCover, pushedOut: SS.lastDoll && +(SS.lastDoll.pushedOut || 0).toFixed(2), boxes: SS.lastDoll && SS.lastDoll.boxes ? SS.lastDoll.boxes.length : 0 }; }, [box, how]);
      r.kind = kind; res.cases.push(r); if (r.retry) r.skipped = r.retry; if (r.skipped) { fail.push(kind + '/' + how + ': ' + r.skipped); continue; }
      if (!r.dead || !r.mode) { fail.push(kind + '/' + how + ': fighter not killed / no fall (' + r.mode + ')'); continue; }
      if (r.persist && process.env.SS_PERSIST) { if (r.persist.hiddenFrames) fail.push(kind + '/' + how + ': body left the scene/hidden on ' + r.persist.hiddenFrames + '/' + r.persist.frames + ' frames'); if (r.persist.endOnHood) fail.push(kind + '/' + how + ': body ended on top of the cover at ' + r.persist.endHip); }
      if (r.riseM > 0.3) fail.push(kind + '/' + how + ': hips rose ' + r.riseM + ' m (launch)');
      if (r.minAlongM < 0) fail.push(kind + '/' + how + ': body crossed to the shooter side of the cover (' + r.minAlongM + ' m)');
      if (r.minHipY < -0.05) fail.push(kind + '/' + how + ': body under the ground (' + r.minHipY + ')'); if (r.settleCm > 3) fail.push(kind + '/' + how + ': still moving at 4-5 s (' + r.settleCm + ' cm)'); } }
  if (!res.cases.some((c) => !c.skipped)) fail.push('no cover box found');
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'KILLCOVER FAIL ' + fail.join(' ; ') : 'KILLCOVER PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
