// A37b (App PM item 2): during doorway pressure on ?door=1&q=low a flanker must step into a visible, shootable lane of the
// DEFAULT street view and hold there >= 2 s (on screen, inside the street view, a clear ray from the eye to its hit volume -
// drawn meshes AND the shot colliders), fire while exposed, move with feet on the ground (no pops), then fall back; and a
// scripted shot at it (real fire path: red crosshair on the drawn frame -> input.pendingShots) must register a hit.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8856;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const out = process.argv[2] || 'logs/a37/flanker-lane.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const fail = [];
  let R = {};
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?loco=2&hits=2&repos=1&fx=3&sp=5&door=1&debug&q=low&nosw=1');
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    R = await p.evaluate(async () => {
      const T3 = SS.THREE, W = SS.world, wt = SS.weapon, sleep = (ms) => new Promise((r) => setTimeout(r, ms)), t0 = performance.now(), REAL = 1500000;
      const out = { samples: 0, runs: [], best: 0, moves: { maxSpeed: 0, maxY: 0, n: 0 }, holds: [] };
      const frame = async (n) => { const f0 = SS.frameN | 0, t1 = performance.now(); while ((SS.frameN | 0) < f0 + n && performance.now() - t1 < 30000) await sleep(20); };
      const held = () => !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held')) && SS.cover && SS.cover.state === 'in' && SS.cover.kind === 'door';
      // 1) reach the doorway hold (clear the street fights on the way)
      let lastKill = 0;
      while (!held() && performance.now() - t0 < REAL) { const sim = SS.simTime || 0; SS.input.scope = false; if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        if (sim - lastKill > 2 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; } if (!SS.player.alive || sim > 220) break; await sleep(200); }
      if (!held()) return Object.assign(out, { noHold: true, sim: SS.simTime });
      out.doorYaw = SS.doorYaw || null; out.holdSim = +(SS.simTime || 0).toFixed(1);
      const meshes = []; for (const sg of W.segments) sg.group.traverseVisible((o) => { if (!o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.transparent || m.visible === false) return; meshes.push(o); });
      const clip = (h) => { if (!(W.inRoomClip && W.inRoomClip(h.point))) return false; const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return !!(m && m.userData && m.userData.roomClip); };
      const rc = new T3.Raycaster();
      const seen = (e) => { // on screen, in the street view, eye -> hit volume clear (drawn + shot)
        SS.camera.updateMatrixWorld(); const c = SS.camera.position.clone();
        const vols = wt.targets.filter((m) => m.userData.enemy === e && m.userData.part !== 'limb'); let okVol = null, why = 'no volume';
        for (const m of vols) { const v = new T3.Vector3(); m.getWorldPosition(v); const pr = v.clone().project(SS.camera);
          if (!(pr.z > -1 && pr.z < 1 && Math.abs(pr.x) <= 0.94 && Math.abs(pr.y) <= 0.94)) { why = 'off screen ndc ' + pr.x.toFixed(2); continue; }
          const yw = SS.input.yaw, ang = Math.atan2(Math.sin(Math.atan2(v.x - c.x, -(v.z - c.z)) - yw), Math.cos(Math.atan2(v.x - c.x, -(v.z - c.z)) - yw)) * 180 / Math.PI;
          if (Math.abs(ang) > 35) { why = 'outside street view ' + ang.toFixed(1) + 'deg'; continue; }
          const dv = v.clone().sub(c), dT = dv.length(); dv.normalize(); rc.set(c, dv); rc.far = dT;
          let vh = null; for (const h of rc.intersectObjects(meshes, false)) { if (clip(h)) continue; vh = h; break; }
          if (vh && vh.distance < dT - 0.12) { why = 'drawn block ' + (vh.object.name || vh.object.type); continue; }
          const sh = wt.firstHit(c, dv); if (!(sh && sh.object.userData && sh.object.userData.enemy === e)) { why = 'shot block ' + (sh ? (sh.object.name || sh.object.type) : 'none'); continue; }
          okVol = { part: m.userData.part, ang: +ang.toFixed(1), dist: +dT.toFixed(1), ndc: [+pr.x.toFixed(2), +pr.y.toFixed(2)] }; break; }
        return okVol || { no: why };
      };
      // 2) default view only (no aim input): watch the pressure flanker's lane visits
      let runStart = null, prev = null, pe = null, shots0 = null, shot = null; const tW = SS.simTime || 0;
      while ((SS.simTime || 0) - tW < 70 && performance.now() - t0 < REAL && SS.player.alive) {
        SS.input.aimMovedT = 0; SS.input.scope = false; SS.input.cover = true; if (SS.player.health < 60) SS.player.health = 100;
        const L = SS.doorLane; const pid = L ? L.id : (SS.doorPressure && SS.doorPressure.id);
        pe = pid != null ? SS.enemies.list.find((e) => e.id === pid) : null;
        if (pe && pe.alive) {
          const sim = SS.simTime || 0, gp = pe.group.position;
          if (prev && prev.id === pe.id && sim - prev.sim > 0.04) { const v = Math.hypot(gp.x - prev.x, gp.z - prev.z) / (sim - prev.sim); out.moves.n++; if (v > out.moves.maxSpeed) out.moves.maxSpeed = +v.toFixed(2), out.moves.atSim = +sim.toFixed(1); }
          out.moves.maxY = Math.max(out.moves.maxY, +Math.abs(gp.y).toFixed(3)); prev = { id: pe.id, x: gp.x, z: gp.z, sim };
          if (L && L.state === 'hold') {
            if (shots0 == null) shots0 = pe.shotsTaken | 0;
            const s = seen(pe); out.samples++;
            if (!s.no) { if (runStart == null) runStart = sim; const len = sim - runStart; if (len > out.best) { out.best = +len.toFixed(2); out.bestAt = s; } }
            else { if (runStart != null) out.runs.push([+runStart.toFixed(2), +sim.toFixed(2)]); runStart = null; out.lastNo = s.no; }
          } else if (runStart != null) { out.runs.push([+runStart.toFixed(2), +(SS.simTime || 0).toFixed(2)]); runStart = null; }
          if (L && L.state !== 'hold' && shots0 != null && out.firedInHold == null) out.firedInHold = (pe.shotsTaken | 0) - shots0;
          // 3) scripted shot: once a >= 2 s visible hold has been seen, on a hold with time left
          if (out.best >= 2 && !shot && L && L.state === 'hold') {
            const vol = wt.targets.find((m) => m.userData.enemy === pe && m.userData.part === 'body'); const h0 = pe.health;
            for (let k = 0; k < 6 && !shot; k++) { const v = new T3.Vector3(); vol.getWorldPosition(v); const dv = v.sub(SS.camera.position).normalize();
              SS.input.yaw = Math.atan2(dv.x, -dv.z); SS.input.pitch = -Math.asin(dv.y); SS.input.aimMovedT = performance.now(); await frame(1);
              if (!wt.onTarget) continue; const before = wt.lastShot; SS.input.pendingShots = 1; await frame(1);
              if (wt.lastShot !== before) shot = { hit: !!(wt.lastShot.hit && wt.lastShot.hit.enemy), part: wt.lastShot.hit && wt.lastShot.hit.part, name: wt.lastShot.hit && wt.lastShot.hit.name, dmg: h0 - pe.health, alive: pe.alive, sim: +(SS.simTime || 0).toFixed(2), lane: SS.doorLane && SS.doorLane.state }; }
            if (!shot) shot = { hit: false, why: 'no red crosshair in 6 frames' };
            out.shot = shot; break;
          }
        } else if (pe && !pe.alive) { out.flankerDied = +(SS.simTime || 0).toFixed(1); break; }
        await sleep(100);
      }
      if (runStart != null) out.runs.push([+runStart.toFixed(2), +(SS.simTime || 0).toFixed(2)]);
      if (out.firedInHold == null && pe && shots0 != null) out.firedInHold = (pe.shotsTaken | 0) - shots0;
      out.lane = SS.doorLane || null; out.press = SS.doorPressure || null; out.flankTells = SS.flankTells | 0; out.flankHits = SS.flankHits | 0;
      out.sim = +(SS.simTime || 0).toFixed(1); out.died = !SS.player.alive; out.fps = SS.fps;
      return out;
    });
    R.errs = err.slice(0, 3);
    if (R.noHold) fail.push('never held the doorway');
    else {
      if (!R.lane) fail.push('no doorway lane (SS.doorLane) - pressure flanker never chose an in-view lane');
      if (!(R.best >= 2)) fail.push('flanker visible+shootable in the default street view only ' + R.best + ' s (< 2 s); last block: ' + R.lastNo);
      if (!R.lane || !R.lane.log || !R.lane.log.some((l) => l.out != null)) fail.push('flanker never fell back from the lane');
      if (!(R.firedInHold > 0)) fail.push('flanker did not fire while exposed in the lane (' + R.firedInHold + ')');
      if (R.moves.maxSpeed > 8) fail.push('flanker popped: ' + R.moves.maxSpeed + ' m/s at ' + R.moves.atSim);
      if (R.moves.maxY > 0.08) fail.push('flanker feet off the ground y=' + R.moves.maxY);
      if (!R.shot) fail.push('no scripted shot taken');
      else if (!R.shot.hit) fail.push('scripted shot did not register a hit: ' + JSON.stringify(R.shot));
    }
    if (R.died) fail.push('player died');
    if (R.errs.length) fail.push('pageerr ' + R.errs[0]);
  } catch (e) { fail.push(String(e && e.message || e)); }
  R.fail = fail; fs.writeFileSync(out, JSON.stringify(R, null, 1));
  console.log(fail.length ? 'A37 FLANKER-LANE FAIL ' + fail.join(' | ') : 'A37 FLANKER-LANE PASS visible ' + R.best + ' s, fired ' + R.firedInHold + ', shot ' + JSON.stringify(R.shot) + ', holds ' + (R.lane && R.lane.holds) + ', maxSpeed ' + R.moves.maxSpeed);
  try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {}
  process.exit(fail.length ? 1 : 0);
})();
