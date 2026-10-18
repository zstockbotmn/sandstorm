// Fast-mode parity: the same seeded street + the same fighter/camera poses give IDENTICAL visibility-gate, on-screen,
// player hit-ray and enemy-shot (hit / damage / blocked) outcomes in normal and ?test=fast mode. Each mode samples in one
// synchronous page call (no frame can interleave); Math.random is pinned inside it so the shot roll is the same.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8823;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const QS = (process.env.SS_QS || '&q=low').replace(/&test=fast/g, '');
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 900000 });
  const res = {}, fail = [];
  async function sample(extra) { const t0 = Date.now(); const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1' + QS + extra); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    await p.evaluate(() => { SS.walking = false; SS.player.health = 100; }); await p.waitForTimeout(2500);
    const out = await p.evaluate(() => { const E = SS.enemies, cam = SS.camera, R = Math.random; const rows = [];
      const e = SS.debug.spawnEnemy('shifter'); e.health = 1e9; e.shootCd = 1e9; e.engaged = true;
      const c0 = new cam.position.constructor(0, 1.7, 0); // absolute spot on the seeded street (both modes)
      const lods = []; SS.scene.traverse((o) => { if (o.isLOD) lods.push(o); }); const bg = SS.blindHitsBlocked | 0, fv = SS.offViewShots | 0;
      const keep = { d: SS.distance, st: SS.startedAt, sim: SS.simTime };
      try { Math.random = () => 0; // shot roll always 'hit' -> the gates alone decide
        SS.distance = 0; SS.startedAt = performance.now() - 120000; SS.simTime = 100; // pin run-time inputs (difficulty ramp, shot grace, wave-1 window)
        for (const yaw of [0, 0.9]) for (const dz of [8, 14, 22, 32, 45]) for (const dx of [-7, -3.5, 0, 3.5, 7]) {
          cam.position.copy(c0); cam.rotation.set(0, -yaw, 0, 'YXZ'); cam.updateMatrixWorld(true); SS.input.yaw = yaw; SS.input.pitch = 0; SS.input.cover = false;
          for (const l of lods) l.update(cam); { const tw = performance.now(); while (performance.now() - tw < 110) {} } // what render would select for this camera + a fresh shotList (100 ms cache)
          E.debugPose(e, c0.x + dx, c0.z - dz, 'idle'); e.group.updateMatrixWorld(true); e.seenSinceR = 1; e.seenSinceSim = -99; e.movedR = -99; e.noFireUntilR = 0; e.noFireUntilSim = 0; SS.coverGraceUntil = 0;
          const v = e.group.position.clone(); v.y += 1.25; const onS = E.onScreen(v.clone()); const sees = E.playerSees(e);
          const h = SS.weapon.firstHit(cam.position.clone(), v.clone().sub(cam.position).normalize()); const part = h && h.object && h.object.userData ? (h.object.userData.enemy === e ? 'enemy:' + h.object.userData.part : 'world') : 'none';
          E.debugClearSpacing(); SS.player.health = 100; const b0 = SS.blindHitsBlocked | 0; E.debugShoot(e);
          rows.push([yaw, dz, dx, onS ? 1 : 0, sees ? 1 : 0, part, +(100 - SS.player.health).toFixed(3), (SS.blindHitsBlocked | 0) - b0]);
          if (part === 'world' || (dz === 45 && dx === 3.5)) (window.__dbg = window.__dbg || []).push({ yaw, dz, dx, hd: h ? +h.distance.toFixed(2) : null, ed: +v.distanceTo(cam.position).toFixed(2), name: h && h.object ? h.object.name + '|' + (h.object.parent && h.object.parent.name) + '|vis' + h.object.visible : null }); }
      } finally { Math.random = R; SS.distance = keep.d; SS.startedAt = keep.st; SS.simTime = keep.sim; }
      return { dbg: window.__dbg || [], rows, blocked: (SS.blindHitsBlocked | 0) - bg, offView: (SS.offViewShots | 0) - fv, fast: !!SS.fast, override: !!SS.scene && !!SS.scene.overrideMaterial, buf: [document.querySelector('canvas').width, document.querySelector('canvas').height], inner: [innerWidth, innerHeight] }; });
    out.ms = Date.now() - t0; out.errs = errs; await ctx.close(); return out; }
  res.normal = await sample(''); res.fast = await sample('&test=fast');
  const diff = []; res.normal.rows.forEach((r, i) => { const f = res.fast.rows[i]; if (JSON.stringify(r) !== JSON.stringify(f)) diff.push({ normal: r, fast: f }); });
  res.summary = { n: res.normal.rows.length, diffs: diff.length, sees: res.normal.rows.filter((r) => r[4]).length, hits: res.normal.rows.filter((r) => r[6] > 0).length, onScreen: res.normal.rows.filter((r) => r[3]).length,
    msNormal: res.normal.ms, msFast: res.fast.ms, bufNormal: res.normal.buf, bufFast: res.fast.buf, fastFlag: res.fast.fast, fastOverride: res.fast.override, normalFlag: res.normal.fast };
  if (diff.length) fail.push('fast mode changed ' + diff.length + ' of ' + res.normal.rows.length + ' outcomes: ' + JSON.stringify(diff.slice(0, 6)));
  if (!res.fast.fast || !res.fast.override) fail.push('fast mode not active under the harness'); if (res.normal.fast) fail.push('fast mode on without ?test=fast');
  if (!res.summary.sees || !res.summary.hits || res.summary.sees === res.summary.n) fail.push('scenario not exercising the gate (sees ' + res.summary.sees + '/' + res.summary.n + ', hits ' + res.summary.hits + ')');
  for (const k of ['normal', 'fast']) if (res[k].errs.length) fail.push(k + ' page errors: ' + res[k].errs.join(' | '));
  console.log(JSON.stringify({ dbgN: res.normal.dbg, dbgF: res.fast.dbg, summary: res.summary, diffs: diff.slice(0, 10), fail })); console.log(fail.length ? 'PARITY FAIL ' + fail[0].slice(0, 200) : 'PARITY PASS'); srv.close(); await b.close(); process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.log('PARITY FAIL exception ' + e.message); process.exit(1); });
