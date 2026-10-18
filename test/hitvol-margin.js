// m2a: hit volume vs drawn mesh margin (tester: hit markers with the crosshair just beside the body) and hits-to-kill per zone.
// A fighter is posed straight ahead at 20/40/65 m (idle and crouch). Horizontal rays from the eye sweep across it at head,
// chest, belly, hips and thigh heights in 1 cm steps on the target plane; each ray is tested against the DRAWN skinned mesh
// and through the game's shot test (weapon.firstHit). Per row: mesh extent, volume extent, margin per side (cm), and
// that margin in screen px (hip fov 70 / scoped 28 at 390 px height). Then hits-to-kill per zone (torso, head, arm, thigh)
// with the registered parts logged. Usage: SS_QS='&q=low&test=fast' node test/hitvol-margin.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8837;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '';
const MAX_MARGIN_CM = +(process.env.SS_MAX_MARGIN_CM || 13);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = { rows: [], kills: [] }, fail = []; const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  p.on('pageerror', (e) => (res.pageErrors = res.pageErrors || []).push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  res.pool = await p.evaluate(() => { SS.walking = false; SS.player.health = 1e6; window.__freezeCam = true; window.__pool = [];
    for (let i = 0; i < 12 && window.__pool.length < 5; i++) { const e = SS.debug.spawnEnemy(i % 2 ? undefined : 'shifter'); if (e && e.bones) { e.health = 1e9; e.shootCd = 1e9; e.noFireUntilR = 1e15; window.__pool.push(e); } }
    window.__e = window.__pool.shift(); return window.__pool.length + (window.__e ? 1 : 0); });
  if (res.pool < 5) fail.push('only ' + res.pool + ' fighters spawned (need 5)');
  for (const d of [20, 40, 65]) for (const posture of ['idle', 'crouch']) {
    const r = await p.evaluate(async ([d, posture]) => { const THREE = SS.THREE, c = SS.camera.position.clone();
      const e = window.__e; e.health = 1e9; e.shootCd = 1e9; e.noFireUntilR = 1e15;
      for (const q of window.__pool) SS.enemies.debugPose(q, c.x + 40, c.z - 5, 'idle'); SS.enemies.debugPose(e, c.x, c.z - d, posture); e.group.rotation.y = 0; // facing the camera (+Z)
      await new Promise((ok) => setTimeout(ok, 1500)); // settle into the pose (several frames)
      e.group.updateMatrixWorld(true); const B = e.bones || {}; const meshes = []; e.group.traverse((o) => { if ((o.isSkinnedMesh || o.isMesh) && o.visible && !SS.weapon.targets.includes(o)) { o.boundingSphere = null; o.boundingBox = null; if (o.geometry) { o.geometry.boundingSphere = null; } meshes.push(o); } });
      const ray = new THREE.Raycaster(); ray.far = 200; const eye = SS.camera.getWorldPosition(new THREE.Vector3());
      const at = (n) => (B[n] ? B[n].getWorldPosition(new THREE.Vector3()).y : null);
      const hips = at('Hips'), head = at('Head'), spine = (e.spineTop || B.Spine) ? (e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()).y : null, knee = at('LeftLeg');
      const rowsY = { head, chest: spine, belly: hips != null && spine != null ? (hips + spine) / 2 : null, hips, thigh: hips != null && knee != null ? (hips + knee) / 2 : null };
      const z = e.group.position.z, x0 = e.group.position.x, out = [];
      for (const [name, y] of Object.entries(rowsY)) { if (y == null) continue; let mL = null, mR = null, vL = null, vR = null, vParts = {};
        for (let dx = -0.7; dx <= 0.7001; dx += 0.01) { const tgt = new THREE.Vector3(x0 + dx, y, z); const dir = tgt.clone().sub(eye).normalize(); ray.set(eye, dir);
          const mh = ray.intersectObjects(meshes, false)[0]; const sh = SS.weapon.firstHit(eye, dir); const vh = sh && sh.object.userData && sh.object.userData.enemy === e;
          if (mh) { if (mL == null) mL = dx; mR = dx; } if (vh) { if (vL == null) vL = dx; vR = dx; vParts[sh.object.userData.part] = (vParts[sh.object.userData.part] | 0) + 1; } }
        const cm = (v) => (v == null ? null : Math.round(v * 100));
        const left = mL != null && vL != null ? Math.round((mL - vL) * 100) : null, right = mR != null && vR != null ? Math.round((vR - mR) * 100) : null;
        const pxPerCm = (fov) => 390 / (2 * Math.tan(fov / 2 * Math.PI / 180) * d) / 100;
        out.push({ d, posture, row: name, mesh: [cm(mL), cm(mR)], vol: [cm(vL), cm(vR)], marginCm: [left, right], marginPxHip: [left, right].map((m) => (m == null ? null : +(m * pxPerCm(70)).toFixed(1))), marginPxScope: [left, right].map((m) => (m == null ? null : +(m * pxPerCm(28)).toFixed(1))), parts: vParts }); }
      return out; }, [d, posture]);
    res.rows.push(...r);
    for (const q of r) { const m = Math.max(...q.marginCm.filter((v) => v != null)); if (q.mesh[0] == null) fail.push(d + 'm ' + posture + ' ' + q.row + ': the mesh was not hit by any ray');
      else if (q.vol[0] == null) fail.push(d + 'm ' + posture + ' ' + q.row + ': no hit volume on this row (gap)'); else if (m > MAX_MARGIN_CM) fail.push(d + 'm ' + posture + ' ' + q.row + ': volume extends ' + m + ' cm beyond the mesh (> ' + MAX_MARGIN_CM + ')'); }
  }
  // hits to kill per zone: aim at a body point through the shot test, apply each registered hit, log parts until death
  for (const zone of ['chest', 'belly', 'head', 'arm', 'thigh']) {
    const k = await p.evaluate(async (zone) => { const THREE = SS.THREE, c = SS.camera.position.clone(); const e = window.__e; for (const q of window.__pool) SS.enemies.debugPose(q, c.x + 40, c.z - 5, 'idle'); SS.enemies.debugPose(e, c.x, c.z - 20, 'idle'); e.group.rotation.y = 0; e.health = 100;
      await new Promise((ok) => setTimeout(ok, 800)); e.group.updateMatrixWorld(true); const B = e.bones; const W = (n) => B[n].getWorldPosition(new THREE.Vector3());
      const ptOf = () => zone === 'chest' ? W('Hips').lerp((e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()), 0.72) : zone === 'belly' ? W('Hips').lerp((e.spineTop || B.Spine).getWorldPosition(new THREE.Vector3()), 0.5) : zone === 'head' ? W('Head') : zone === 'arm' ? W('LeftArm').lerp(W('LeftForeArm'), 0.5) : W('LeftUpLeg').lerp(W('LeftLeg'), 0.5); // re-aimed at the bone every shot (hit reactions move it), like a player tracking it
      const eye = SS.camera.getWorldPosition(new THREE.Vector3()); const parts = []; let n = 0;
      while (e.alive && n < 8) { n++; e.group.updateMatrixWorld(true); const pt = ptOf(); const dir = pt.clone().sub(eye).normalize(); const h = SS.weapon.firstHit(eye, dir); const ud = h && h.object.userData;
        if (!ud || ud.enemy !== e) { parts.push('miss:' + (h ? h.object.name || 'world' : 'none')); continue; } parts.push(ud.part); e.takeHit(ud.part, h.point); await new Promise((ok) => setTimeout(ok, 120)); }
      return { zone, hits: parts.filter((q) => !q.startsWith('miss')).length, parts, dead: !e.alive }; }, zone);
    res.kills.push(k); if (!k.dead) fail.push('kill ' + zone + ': not dead after ' + k.parts.join(','));
    const want = { chest: 2, belly: 2, head: 1, arm: 3, thigh: 3 }[zone]; if (k.dead && k.hits !== want) fail.push('kill ' + zone + ': ' + k.hits + ' hits (spec ' + want + ') ' + k.parts.join(','));
    await p.evaluate(() => { window.__e = window.__pool.shift() || window.__e; }); }
  if (res.pageErrors) fail.push('page errors: ' + res.pageErrors.join(' | '));
  for (const q of res.rows) console.log([q.d + 'm', q.posture.padEnd(6), q.row.padEnd(6), 'mesh', JSON.stringify(q.mesh), 'vol', JSON.stringify(q.vol), 'margin cm', JSON.stringify(q.marginCm), 'px hip', JSON.stringify(q.marginPxHip), 'px scope', JSON.stringify(q.marginPxScope)].join(' '));
  for (const k of res.kills) console.log('kill', k.zone, k.hits, k.parts.join(','));
  console.log(JSON.stringify(res)); console.log(fail.length ? 'HITVOL FAIL ' + fail.join(' ; ').slice(0, 900) : 'HITVOL PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('HITVOL FAIL exception ' + e.message); process.exit(1); });
