// Frame trace for the under-street skin draw (A3: Hips bone drew 0.09-0.26 m under the street while the ragdoll
// pelvis body stayed >= 0.11 m). NOT run yet. Stages the kill-cover case (crouched behind the nearest car or cart,
// K kill) and logs one row per rendered frame for 2.5 s: phase (pre = before takeover, blend, rag), hips bone world y,
// pelvis rb y, pelvis body.position y (interpolated), |hips - pelvis| world, root-link offP length, blendW, model root y,
// art root y, doll.settled. Usage: SS_QS='&q=low&test=fast' SS_KIND=cart node test/trace-skin.js > logs/s2/trace-skin.log
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8843;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = process.env.SS_QS || '', KIND = process.env.SS_KIND || 'cart', RUNS = Number(process.env.SS_RUNS || 3);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 } }); const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  for (let run = 0; run < RUNS; run++) {
    const out = await p.evaluate(async (KIND) => { SS.walking = false; SS.player.health = 1e6; const THREE = SS.THREE, c = SS.camera.position; let box = null;
      for (const m of SS.world.colliders || []) { if (!m.geometry || m.geometry.type !== 'BoxGeometry') continue; m.updateWorldMatrix(true, false); const pos = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(); m.matrixWorld.decompose(pos, q, sc);
        const g = m.geometry.parameters, sx = Math.abs(sc.x) * g.width, sz = Math.abs(sc.z) * g.depth, dz = c.z - pos.z; if (dz < 8 || dz > 90) continue; const long = Math.max(sx, sz);
        const kind = m.name === 'car' ? 'car' : m.name === 'prop' && long >= 1.7 ? 'cart' : null; if (kind === KIND && (!box || dz < box.dz)) box = { x: pos.x, z: pos.z, sx, sz, dz }; }
      if (!box) return { skipped: 'no ' + KIND };
      let e = null; for (let k = 0; k < 8 && !e; k++) { const q = SS.debug.spawnEnemy(); if (q && q.bones && q.alive && !(q.anchor && /roof|window/.test(q.anchor.type))) e = q; } if (!e) return { skipped: 'no fighter' };
      for (const q of SS.enemies.list) if (q !== e && q.alive) SS.enemies.debugPose(q, c.x + 40, c.z + 30, 'idle');
      const dx = box.x - c.x, dz = box.z - c.z, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, half = Math.abs(ux) * box.sx / 2 + Math.abs(uz) * box.sz / 2;
      SS.enemies.debugPose(e, box.x + ux * (half + 0.15), box.z + uz * (half + 0.15), 'crouch'); e.group.rotation.y = Math.atan2(-ux, -uz);
      Object.assign(e, { pinned: false, staggerT: 0, debugHold: true, health: 1, phase: 'hide', engaged: true, shootCd: 1e9 });
      await new Promise((ok) => setTimeout(ok, 1000)); if (!e.alive) return { skipped: 'fighter gone' };
      SS.lastDoll = null; SS.debugKillNearest(); const rows = [], t0 = performance.now();
      while (performance.now() - t0 < 2500) { await new Promise((ok) => requestAnimationFrame(ok)); const d = SS.lastDoll, hp = e.bones.Hips.getWorldPosition(new THREE.Vector3());
        const pv = d && d.parts && d.parts.find((q) => q.name === 'pelvis'); const rl = d && d.skin && d.skin.links && d.skin.links.find((l) => l.root);
        const model = d && d.skin && d.skin.model; const pt = pv && pv.rb ? pv.rb.translation() : null;
        rows.push({ ms: Math.round(performance.now() - t0), ph: !d ? 'pre' : (d.blendW < 1 ? 'blend' : 'rag'), hipY: +hp.y.toFixed(3), rbY: pt && +pt.y.toFixed(3), bodyY: pv && +pv.body.position.y.toFixed(3),
          gap: pv ? +hp.distanceTo(new THREE.Vector3(pv.body.position.x, pv.body.position.y, pv.body.position.z)).toFixed(3) : null, offP: rl ? +rl.offP.length().toFixed(3) : null,
          w: d && +(d.blendW || 0).toFixed(2), modelY: model && +model.position.y.toFixed(3), artRootY: e.art && +e.art.root.position.y.toFixed(3), pushed: d && +(d.pushedOut || 0).toFixed(2), settled: d && d.settled, simDt: SS.lastSimDt && +SS.lastSimDt.toFixed(3) }); }
      return { kind: KIND, minHip: Math.min(...rows.map((r) => r.hipY)), rows }; }, KIND);
    console.log(JSON.stringify(out)); }
  await b.close(); srv.close(); process.exit(0); })();
