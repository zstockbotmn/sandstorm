// A37b (App PM item 2): during doorway pressure on ?door=1&q=low a flanker must step into a visible, shootable lane of the
// DEFAULT street view and hold there >= 2 s (on screen, inside the street view, a clear ray from the eye to its hit volume -
// drawn meshes AND the shot colliders), fire while exposed, move with feet on the ground (no pops), then fall back; and a
// scripted shot at it (real fire path: red crosshair on the drawn frame -> input.pendingShots) must register a hit.
// A37c (Tester A37 + App PM): the >= 2 s must come from the DEFAULT yaw with no aim input, on the street side of the pillar
// (bearing past doorstop's first clear ray + 3 deg) and near centre (|ndc x| <= 0.7); no enemy marker may sit on drawn
// geometry within 3.5 m of the eye (pillar / doorframe) while held; a hit = hit tick + body flash + flinch, a miss into
// cover = dust puff and NO tick.
// A38 (App PM Fun ruling, option A): the FIRST lane visit holds >= 3.3 s game time (target 3.5), later visits 2.2-2.9 s;
// the flanker fires during the first visit; the scripted shots now wait until two visits have completed (visit 3+), then
// kill it - ENEMY DOWN / HEADSHOT must be on screen within 1 painted frame of the kill. No visit may end 'superseded'.
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
      const out = { samples: 0, runs: [], best: 0, moves: { maxSpeed: 0, maxY: 0, n: 0 }, holds: [], visitShots: {} };
      const frame = async (n) => { const f0 = SS.frameN | 0, t1 = performance.now(); while ((SS.frameN | 0) < f0 + n && performance.now() - t1 < 30000) await sleep(20); };
      const held = () => !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held')) && SS.cover && SS.cover.state === 'in' && SS.cover.kind === 'door';
      // 1) reach the doorway hold (clear the street fights on the way)
      let lastKill = 0;
      while (!held() && performance.now() - t0 < REAL) { const sim = SS.simTime || 0; SS.input.scope = false; if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        if (sim - lastKill > 2 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; } if (!SS.player.alive || sim > 220) break; await sleep(200); }
      if (!held()) return Object.assign(out, { noHold: true, sim: SS.simTime });
      out.doorYaw = SS.doorYaw || null; out.holdSim = +(SS.simTime || 0).toFixed(1);
      await frame(2); const yaw0 = SS.input.yaw, sideOut = -((SS.cover.door && SS.cover.door.side) || 1); out.yaw0 = +yaw0.toFixed(4); out.yawDrift = 0;
      const dY = SS.doorYaw || {}, pillarEdge = (dY.firstClearDeg != null ? dY.firstClearDeg : 21) - (dY.deg != null ? dY.deg : 28) + 3; out.streetMinRel = +pillarEdge.toFixed(1);
      out.markers = { checks: 0, overNear: 0, worst: null, dim: 0, shown: 0 };
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
          const rel = ang * sideOut; if (rel < pillarEdge) { why = 'pillar side rel ' + rel.toFixed(1) + ' < ' + pillarEdge.toFixed(1); continue; }
          if (Math.abs(pr.x) > 0.7) { why = 'not near centre ndc ' + pr.x.toFixed(2); continue; }
          const dv = v.clone().sub(c), dT = dv.length(); dv.normalize(); rc.set(c, dv); rc.far = dT;
          let vh = null; for (const h of rc.intersectObjects(meshes, false)) { if (clip(h)) continue; vh = h; break; }
          if (vh && vh.distance < dT - 0.12) { why = 'drawn block ' + (vh.object.name || vh.object.type); continue; }
          const sh = wt.firstHit(c, dv); if (!(sh && sh.object.userData && sh.object.userData.enemy === e)) { why = 'shot block ' + (sh ? (sh.object.name || sh.object.type) : 'none'); continue; }
          okVol = { part: m.userData.part, ang: +ang.toFixed(1), rel: +rel.toFixed(1), dist: +dT.toFixed(1), ndc: [+pr.x.toFixed(2), +pr.y.toFixed(2)], px: Math.round(Math.abs(pr.x) * innerWidth / 2) }; break; }
        return okVol || { no: why };
      };
      const markerCheck = () => { const c = SS.camera.position.clone(); SS.camera.updateMatrixWorld(); const right = new T3.Vector3(1, 0, 0).applyQuaternion(SS.camera.quaternion);
        for (const e of SS.enemies.list) { const m = e.marker; if (!m || !m.visible || !e.alive) continue; let vis = true; for (let o = m; o; o = o.parent) if (!o.visible) { vis = false; break; } if (!vis) continue;
          out.markers.shown++; if (m.material && m.material.opacity < 0.5) out.markers.dim++;
          const mp = new T3.Vector3(); m.getWorldPosition(mp); const pr = mp.clone().project(SS.camera); if (!(pr.z > -1 && pr.z < 1 && Math.abs(pr.x) <= 1 && Math.abs(pr.y) <= 1)) continue;
          out.markers.checks++; const w = mp.distanceTo(c) * 0.03;
          for (const k of [0, -1, 1]) { const q = mp.clone().addScaledVector(right, k * w), dv = q.clone().sub(c), dT = dv.length(); dv.normalize(); rc.set(c, dv); rc.far = dT;
            let vh = null; for (const h of rc.intersectObjects(meshes, false)) { if (clip(h)) continue; vh = h; break; }
            if (vh && vh.distance < 3.5) { out.markers.overNear++; if (!out.markers.worst) out.markers.worst = { id: e.id, d: +vh.distance.toFixed(2), obj: vh.object.name || vh.object.type, ndc: [+pr.x.toFixed(2), +pr.y.toFixed(2)], sim: +(SS.simTime || 0).toFixed(1) }; break; } } } };
      // 2) default view only (no aim input): watch the pressure flanker's lane visits
      let runStart = null, prev = null, pe = null, shots0 = null, shot = null; const tW = SS.simTime || 0;
      while ((SS.simTime || 0) - tW < 70 && performance.now() - t0 < REAL && SS.player.alive) {
        SS.input.aimMovedT = 0; SS.input.scope = false; SS.input.cover = true; if (SS.player.health < 60) SS.player.health = 100;
        if (!shot) out.yawDrift = Math.max(out.yawDrift, +(Math.abs(SS.input.yaw - yaw0) * 180 / Math.PI).toFixed(2)); if (held()) markerCheck();
        const L = SS.doorLane; const pid = L ? L.id : (SS.doorPressure && SS.doorPressure.id);
        pe = pid != null ? SS.enemies.list.find((e) => e.id === pid) : null;
        if (pe && pe.alive) {
          const sim = SS.simTime || 0, gp = pe.group.position;
          if (prev && prev.id === pe.id && sim - prev.sim > 0.04) { const v = Math.hypot(gp.x - prev.x, gp.z - prev.z) / (sim - prev.sim); out.moves.n++; if (v > out.moves.maxSpeed) out.moves.maxSpeed = +v.toFixed(2), out.moves.atSim = +sim.toFixed(1); }
          out.moves.maxY = Math.max(out.moves.maxY, +Math.abs(gp.y).toFixed(3)); prev = { id: pe.id, x: gp.x, z: gp.z, sim };
          if (L && L.state === 'hold') {
            if (shots0 == null) shots0 = pe.shotsTaken | 0;
            { const vi = L.holds | 0, vs = out.visitShots[vi] || (out.visitShots[vi] = { s0: pe.shotsTaken | 0, s1: 0 }); vs.s1 = pe.shotsTaken | 0; }
            const s = seen(pe); out.samples++;
            if (!s.no) { if (runStart == null) runStart = sim; const len = sim - runStart; if (len > out.best) { out.best = +len.toFixed(2); out.bestAt = s; } }
            else { if (runStart != null) out.runs.push([+runStart.toFixed(2), +sim.toFixed(2)]); runStart = null; out.lastNo = s.no; }
          } else if (runStart != null) { out.runs.push([+runStart.toFixed(2), +(SS.simTime || 0).toFixed(2)]); runStart = null; }
          if (L && L.state !== 'hold' && shots0 != null && out.firedInHold == null) out.firedInHold = (pe.shotsTaken | 0) - shots0;
          // 3) scripted shot: once a >= 2 s visible hold has been seen, on a hold with time left
          if (out.best >= 2 && !shot && L && L.state === 'hold' && (L.holds | 0) >= 2) {
            const vol = wt.targets.find((m) => m.userData.enemy === pe && m.userData.part === 'body'); const h0 = pe.health; const tk0 = SS.hitTicks | 0, fl0 = SS.hitFlashes | 0, pf0 = SS.missPuffs | 0;
            for (let k = 0; k < 6 && !shot; k++) { const v = new T3.Vector3(); vol.getWorldPosition(v); const dv = v.sub(SS.camera.position).normalize();
              SS.input.yaw = Math.atan2(dv.x, -dv.z); SS.input.pitch = -Math.asin(dv.y); SS.input.aimMovedT = performance.now(); await frame(1);
              if (!wt.onTarget) continue; const before = wt.lastShot; SS.input.pendingShots = 1; await frame(1);
              if (wt.lastShot !== before) shot = { hit: !!(wt.lastShot.hit && wt.lastShot.hit.enemy), part: wt.lastShot.hit && wt.lastShot.hit.part, name: wt.lastShot.hit && wt.lastShot.hit.name, dmg: h0 - pe.health, alive: pe.alive, sim: +(SS.simTime || 0).toFixed(2), lane: SS.doorLane && SS.doorLane.state, ticks: (SS.hitTicks | 0) - tk0, flashes: (SS.hitFlashes | 0) - fl0, puffs: (SS.missPuffs | 0) - pf0, flashOn: !!pe._flash, flinch: !!(pe.lastHitT != null && (SS.simTime || 0) - pe.lastHitT < 1.5) }; }
            if (!shot) shot = { hit: false, why: 'no red crosshair in 6 frames' };
            out.shot = shot;
            // A38: finish it and time the kill confirm in painted frames
            const kc0 = SS.hud.killConfirms | 0;
            for (let k = 0; k < 8 && shot.hit && pe.alive && !pe.dying; k++) { const vol2 = wt.targets.find((m) => m.userData.enemy === pe && m.userData.part === 'body'); if (!vol2) break;
              const v = new T3.Vector3(); vol2.getWorldPosition(v); const dv = v.sub(SS.camera.position).normalize();
              SS.input.yaw = Math.atan2(dv.x, -dv.z); SS.input.pitch = -Math.asin(dv.y); SS.input.aimMovedT = performance.now(); await frame(1);
              if (!wt.onTarget) continue; const f0 = SS.frameN | 0; SS.input.pendingShots = 1;
              const t1 = performance.now(); while ((SS.frameN | 0) < f0 + 1 && performance.now() - t1 < 30000) await sleep(5);
              if (pe.alive && !pe.dying) continue;
              const fK = SS.frameN | 0; let shown = false, shownAt = null; // the shot is taken (and the kill made) in frame f0+1
              for (let j = 0; j < 3 && !shown; j++) { const el = document.getElementById('kill-confirm'); if (el && el.classList.contains('show') && /ENEMY DOWN|HEADSHOT/.test(el.textContent)) { shown = true; shownAt = SS.frameN | 0; break; } const fj = SS.frameN | 0, t2 = performance.now(); while ((SS.frameN | 0) < fj + 1 && performance.now() - t2 < 30000) await sleep(5); }
              out.kill = { sim: +(SS.simTime || 0).toFixed(2), shotFrame: f0 + 1, seenFrame: fK, kcFrame: SS.hud.lastKillConfirmFrame, kcDelta: (SS.hud.lastKillConfirmFrame | 0) - (f0 + 1), shown, shownAt, text: SS.hud.lastKillConfirm, confirms: (SS.hud.killConfirms | 0) - kc0, lane: SS.doorLane && SS.doorLane.state }; }
            // 4) a miss into cover: aim at drawn/shot world geometry beside the doorway (no enemy on the ray) and fire once
            for (const pd of [0, -0.12, 0.12, -0.25]) for (const off of [-12, -18, -24, -30, -8, 40]) { if (out.miss) break;
              const yw = yaw0 + off * sideOut * Math.PI / 180, dv = new T3.Vector3(Math.sin(yw) * Math.cos(pd), Math.sin(pd), -Math.cos(yw) * Math.cos(pd)).normalize(); const fh = wt.firstHit(SS.camera.position.clone(), dv);
              if (!fh || (fh.object.userData && fh.object.userData.enemy) || fh.distance > 25) continue;
              SS.input.yaw = yw; SS.input.pitch = pd; SS.input.aimMovedT = performance.now(); await frame(2);
              const tk = SS.hitTicks | 0, pf = SS.missPuffs | 0, before = wt.lastShot; SS.input.pendingShots = 1; await frame(2);
              if (wt.lastShot === before) continue; const eh = !!(wt.lastShot.hit && wt.lastShot.hit.enemy);
              out.miss = { off, pitch: pd, dist: +fh.distance.toFixed(1), obj: fh.object.name || fh.object.type, enemyHit: eh, ticks: (SS.hitTicks | 0) - tk, puffs: (SS.missPuffs | 0) - pf }; }
            break;
          }
        } else if (pe && !pe.alive) { out.flankerDied = +(SS.simTime || 0).toFixed(1); break; }
        await sleep(100);
      }
      if (runStart != null) out.runs.push([+runStart.toFixed(2), +(SS.simTime || 0).toFixed(2)]);
      if (out.firedInHold == null && pe && shots0 != null) out.firedInHold = (pe.shotsTaken | 0) - shots0;
      out.markerStats = SS.markerStats || null; out.laneSpot = SS.doorLaneSpot || null; out.laneBeatWaits = SS.laneBeatWaits | 0;
      out.flankLog = (SS.flankLog || []).slice(-12); out.laneGuard = SS.laneGuard || null; out.laneEndNoHit = SS.laneEndNoHit | 0; out.flankSuperseded = SS.flankSuperseded | 0;
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
      const lg = (R.lane && R.lane.log) || [], done = lg.filter((l) => l.out != null), lens = done.map((l) => +(l.out - l.in).toFixed(2)); R.holdLens = lens;
      const first = lg.find((l) => l.first);
      if (!first || first.out == null) fail.push('first lane visit not seen to completion (log ' + JSON.stringify(lg) + ')');
      else if (!(first.out - first.in >= 3.3)) fail.push('first lane visit held ' + (first.out - first.in).toFixed(2) + ' s (< 3.3 s)');
      const later = done.filter((l) => !l.first); if (!later.length) fail.push('no later lane visit completed');
      for (const l of later) if (!(l.out - l.in >= 2.2 && l.out - l.in <= 2.9)) fail.push('later lane visit at ' + l.in + ' held ' + (l.out - l.in).toFixed(2) + ' s (want 2.2-2.9)');
      const v0 = R.visitShots && R.visitShots[0]; if (!(v0 && v0.s1 - v0.s0 > 0)) fail.push('flanker did not fire during the first visit ' + JSON.stringify(v0));
      if (!R.kill) fail.push('lane flanker not killed by the scripted shots');
      else { if (!R.kill.shown) fail.push('kill confirm not on screen within 2 frames of the kill ' + JSON.stringify(R.kill)); if (!(R.kill.kcDelta <= 1)) fail.push('kill confirm ' + R.kill.kcDelta + ' frames after the kill frame (> 1)'); }
      if (R.flankSuperseded > 0) fail.push('flank tell ended superseded x' + R.flankSuperseded);
      if (R.moves.maxSpeed > 8) fail.push('flanker popped: ' + R.moves.maxSpeed + ' m/s at ' + R.moves.atSim);
      if (R.moves.maxY > 0.08) fail.push('flanker feet off the ground y=' + R.moves.maxY);
      if (!R.shot) fail.push('no scripted shot taken');
      else if (!R.shot.hit) fail.push('scripted shot did not register a hit: ' + JSON.stringify(R.shot));
      else { if (!(R.shot.ticks >= 1)) fail.push('hit without a hit tick'); if (!(R.shot.flashes >= 1)) fail.push('hit without a body flash'); if (!R.shot.flinch && R.shot.alive) fail.push('hit without a flinch'); }
      if (!(R.yawDrift <= 0.5)) fail.push('view moved off the default yaw by ' + R.yawDrift + ' deg before the scripted shot (no-drag rule)');
      if (R.markers.overNear > 0) fail.push('enemy marker drawn over the pillar/doorframe x' + R.markers.overNear + ' ' + JSON.stringify(R.markers.worst));
      if (!R.miss) fail.push('no miss-into-cover shot taken');
      else { if (R.miss.enemyHit) fail.push('miss shot hit an enemy'); if (R.miss.ticks !== 0) fail.push('miss into cover played a hit tick'); if (!(R.miss.puffs >= 1)) fail.push('miss into cover made no dust puff'); }
    }
    if (R.died) fail.push('player died');
    if (R.errs.length) fail.push('pageerr ' + R.errs[0]);
  } catch (e) { fail.push(String(e && e.message || e)); }
  R.fail = fail; fs.writeFileSync(out, JSON.stringify(R, null, 1));
  console.log(fail.length ? 'A37 FLANKER-LANE FAIL ' + fail.join(' | ') : 'A37 FLANKER-LANE PASS visible ' + R.best + ' s at ' + JSON.stringify(R.bestAt) + ', markers ' + JSON.stringify(R.markers) + ', miss ' + JSON.stringify(R.miss) + ', fired ' + R.firedInHold + ', shot ' + JSON.stringify(R.shot) + ', holds ' + (R.lane && R.lane.holds) + ' lens ' + JSON.stringify(R.holdLens) + ', firstFired ' + JSON.stringify(R.visitShots && R.visitShots[0]) + ', kill ' + JSON.stringify(R.kill) + ', guard ' + JSON.stringify(R.laneGuard && { refused: R.laneGuard.refused, retire: R.laneGuard.retire, duck: R.laneGuard.duck }) + ', maxSpeed ' + R.moves.maxSpeed);
  try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {}
  process.exit(fail.length ? 1 : 0);
})();
