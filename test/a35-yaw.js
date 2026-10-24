// A35: doorway street peek yaw — when IN COVER · DOORWAY, look OUT to street so flankers are in FOV.
// Fail if yaw still aims into the room wall (A34 residual) or street-side aim is yanked back.
// A37 (stricter): run on the REAL ?door=1 placement (FIX4: room 20-50 m past the W1 contact point), and prove the default
// held look actually SEES the street (centre ray through the aperture, drawn meshes incl. art facade, room clip honoured)
// and that the doorway pressure flanker stands visible, on screen and near the peek centre (not a marker behind a wall).
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8852;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream', '.jpg': 'image/jpeg', '.png': 'image/png' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const out = process.argv[2] || 'logs/a35/yaw.json';
fs.mkdirSync(path.dirname(out), { recursive: true });
(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const fail = [], warn = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&loco=2&hits=2&repos=1&fx=3&sp=5&door=1&cxnade=1&debug&q=low&nosw=1');
    await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    const R = await p.evaluate(async () => {
      const out = { ticks: 0, samples: [] }; let lastKill = 0;
      const t0 = performance.now();
      // Drive to doorway hold, then sample yaw with no aim drag.
      while (performance.now() - t0 < 900000) {
        out.ticks++;
        const sim = SS.simTime || 0;
        SS.input.scope = false;
        if (SS.cover && SS.cover.state === 'in') SS.input.cover = true;
        const held = !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held'));
        if (!held && sim - lastKill > 2.0 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
        if (held && SS.cover && SS.cover.state === 'in' && SS.cover.kind === 'door') {
          // Clear aimMoved so recenter/peek can settle (wall clock).
          SS.input.aimMovedT = 0;
          // Wait ~3 sim-s for settle, sampling each tick.
          const tHold = sim;
          while ((SS.simTime || 0) - tHold < 3.5 && performance.now() - t0 < 900000) {
            SS.input.aimMovedT = 0;
            SS.input.scope = false;
            SS.input.cover = true;
            const door = SS.cover && SS.cover.door;
            const yaw = SS.input.yaw || 0;
            const side = (door && door.side) || (SS.doorPeek && SS.doorPeek.side) || 1;
            const want = (SS.doorPeek && SS.doorPeek.want != null) ? SS.doorPeek.want : null;
            const fx = Math.sin(yaw), fz = -Math.cos(yaw);
            // Street flanker proxy: on rail ahead of doorway.
            const standX = door ? door.x + side * 0.45 : SS.camera.position.x;
            const standZ = SS.camera.position.z;
            const ex = 0 - standX, ez = (standZ - 12) - standZ; // (0, z-12)
            const el = Math.hypot(ex, ez) || 1;
            const ang = Math.acos(Math.max(-1, Math.min(1, (fx * ex + fz * ez) / el)));
            out.samples.push({
              sim: +(SS.simTime || 0).toFixed(2),
              yaw: +yaw.toFixed(3),
              want: want != null ? +want.toFixed(3) : null,
              side,
              fx: +fx.toFixed(3),
              fz: +fz.toFixed(3),
              flankAngDeg: +(ang * 180 / Math.PI).toFixed(1),
              cam: { x: +SS.camera.position.x.toFixed(2), z: +SS.camera.position.z.toFixed(2) },
              doorPeek: SS.doorPeek ? { street: !!SS.doorPeek.street, side: SS.doorPeek.side } : null,
            });
            // After 2+ sim-s settled, also prove street-side aim is not yanked into the room.
            if ((SS.simTime || 0) - tHold > 2.0 && !out.dragTest) {
              const yaw0 = SS.input.yaw;
              // Drag further toward street center (away from room): for side=+1, more negative yaw.
              SS.input.yaw = yaw0 - side * 0.45;
              SS.input.aimMovedT = performance.now();
              const tDrag = SS.simTime || 0;
              // Hold aimMoved fresh for ~1 sim-s, then idle 2.5 sim-s and ensure we did not cross back past street want into room.
              while ((SS.simTime || 0) - tDrag < 1.0 && performance.now() - t0 < 900000) {
                SS.input.aimMovedT = performance.now();
                await new Promise((r) => setTimeout(r, 150));
              }
              const yawDrag = SS.input.yaw;
              SS.input.aimMovedT = 0;
              const tIdle = SS.simTime || 0;
              while ((SS.simTime || 0) - tIdle < 2.5 && performance.now() - t0 < 900000) {
                await new Promise((r) => setTimeout(r, 150));
              }
              const yawAfter = SS.input.yaw;
              const want2 = (SS.doorPeek && SS.doorPeek.want != null) ? SS.doorPeek.want : yaw0;
              // into-room delta from want: positive*side means into room
              const into = Math.atan2(Math.sin(yawAfter - want2), Math.cos(yawAfter - want2));
              out.dragTest = {
                yaw0: +yaw0.toFixed(3),
                yawDrag: +yawDrag.toFixed(3),
                yawAfter: +yawAfter.toFixed(3),
                want: +want2.toFixed(3),
                intoRoom: +into.toFixed(3),
                yankedIntoRoom: into * side > 0.15,
              };
            }
            await new Promise((r) => setTimeout(r, 150));
          }
          // A37: placement (FIX4 W1-relative band) and what the default look really sees.
          {
            const T3 = SS.THREE, door = SS.cover.door, side = door.side || 1, cam = SS.camera.position.clone();
            const w1d = SS.firstWave && SS.firstWave.d != null ? +SS.firstWave.d : null;
            out.place = { doorX: +door.x.toFixed(2), doorZ: +door.z.toFixed(2), side, w1d, aheadFromW1: w1d != null ? +((4 - w1d) - door.z).toFixed(1) : null, roomFront: SS.roomFront || null, doorYaw: SS.doorYaw || null };
            const meshes = []; for (const sg of SS.world.segments) sg.group.traverseVisible((o) => { if (!o.isMesh) return; const m = Array.isArray(o.material) ? o.material[0] : o.material; if (!m || m.transparent || m.visible === false) return; meshes.push(o); });
            // art/shell mats are shader-discarded in a room clip box; the room's own plaster jambs there still block
            const clip = (h) => { if (!(SS.world.inRoomClip && SS.world.inRoomClip(h.point))) return false; const m = Array.isArray(h.object.material) ? h.object.material[0] : h.object.material; return !!(m && m.userData && m.userData.roomClip); };
            const rc = new T3.Raycaster();
            const firstHit = (from, dir, far) => { rc.set(from, dir); rc.far = far; for (const h of rc.intersectObjects(meshes, false)) { if (clip(h)) continue; return h; } return null; };
            // the DEFAULT held yaw (before the drag test moved it); restore it so the flanker is judged from the default view too
            const yaw = out.dragTest ? out.dragTest.yaw0 : SS.input.yaw; SS.input.yaw = yaw; const dir = new T3.Vector3(Math.sin(yaw), 0, -Math.cos(yaw));
            const exitX = door.x - side * 1.5; const sx = Math.abs(dir.x) > 1e-3 ? (exitX - cam.x) / dir.x : -1;
            const need = sx > 0 ? Math.min(30, sx) : 30;
            const h = firstHit(cam, dir, need + 0.5);
            out.sight = { yaw: +yaw.toFixed(3), need: +need.toFixed(2), hitD: h ? +h.distance.toFixed(2) : null, hit: h ? (h.object.name || h.object.type) + ' @' + h.point.x.toFixed(2) + ',' + h.point.z.toFixed(2) : null, clear: !h, outDeg: +(Math.abs(yaw) * 180 / Math.PI).toFixed(1) };
            // Doorway pressure flanker: wait (game time) for it to arrive, then it must be seen.
            const tF = SS.simTime || 0; let pe = null;
            while ((SS.simTime || 0) - tF < 25 && performance.now() - t0 < 900000) {
              SS.input.aimMovedT = 0; SS.input.scope = false; SS.input.cover = true;
              const pid = SS.doorPressure && SS.doorPressure.id;
              pe = pid != null ? SS.enemies.list.find((e) => e.id === pid && e.alive && !e.dying) : null;
              if (pe && pe.phase !== 'relocate' && !pe._flankMove) break;
              if (!SS.player.alive) break;
              await new Promise((r) => setTimeout(r, 200));
            }
            if (pe) {
              const c = SS.camera.position.clone(), q = pe.group.position.clone(); q.y = 1.2; const dv = q.clone().sub(c), dist = dv.length();
              const hb = firstHit(c, dv.clone().normalize(), dist - 0.35);
              const yw = SS.input.yaw, ang = Math.atan2(Math.sin(Math.atan2(q.x - c.x, -(q.z - c.z)) - yw), Math.cos(Math.atan2(q.x - c.x, -(q.z - c.z)) - yw));
              SS.camera.updateMatrixWorld(); const pr = q.clone().project(SS.camera);
              out.flanker = { id: pe.id, x: +q.x.toFixed(1), z: +q.z.toFixed(1), dist: +dist.toFixed(1), angDeg: +(ang * 180 / Math.PI).toFixed(1), visClear: !hb, block: hb ? (hb.object.name || hb.object.type) + ' @' + hb.point.x.toFixed(2) + ',' + hb.point.z.toFixed(2) : null, onScreen: pr.z > -1 && pr.z < 1 && Math.abs(pr.x) <= 0.94 && Math.abs(pr.y) <= 0.94, ndcX: +pr.x.toFixed(2), press: SS.doorPressure };
            } else out.flanker = { none: true, press: SS.doorPressure || null };
          }
          break;
        }
        if (!SS.player.alive) { out.died = +sim.toFixed(1); break; }
        if (sim >= 200) break;
        await new Promise((r) => setTimeout(r, 200));
      }
      out.sim = +(SS.simTime || 0).toFixed(1);
      out.doorStop = SS.doorStop ? { state: SS.doorStop.state, count: SS.doorStop.count, side: SS.doorStop.side } : null;
      out.held = !!(SS.doorHold || (SS.doorStop && SS.doorStop.state === 'held'));
      out.doorPeek = SS.doorPeek || null;
      out.cover = SS.cover ? { kind: SS.cover.kind, state: SS.cover.state } : null;
      return out;
    });
    R.errs = err.slice(0, 5);
    if (!R.held) fail.push('never held doorway');
    if (!(R.samples && R.samples.length)) fail.push('no yaw samples');
    else {
      const last = R.samples[R.samples.length - 1];
      R.last = last;
      // Look must be mostly down-street (fz dominant negative) and toward street center (fx opposite door.side).
      if (!(last.fz < -0.7)) fail.push('not facing down-street fz=' + last.fz);
      if (!(last.fx * last.side < 0)) fail.push('look not toward street center fx=' + last.fx + ' side=' + last.side + ' (still into room?)');
      // Flanker proxy within ~40° of look (centered / shootable, not far edge).
      if (!(last.flankAngDeg <= 40)) fail.push('flanker ang ' + last.flankAngDeg + '° (>40 — not centered)');
      // Must not match A34 room-into sign: A34 was yaw * side > 0 (~+0.38).
      if (last.yaw * last.side > 0.1) fail.push('yaw still into-room sign yaw=' + last.yaw + ' side=' + last.side);
      if (last.want != null && Math.abs(Math.atan2(Math.sin(last.yaw - last.want), Math.cos(last.yaw - last.want))) > 0.35) {
        warn.push('yaw drifted from want Δ=' + Math.abs(last.yaw - last.want).toFixed(3));
      }
    }
    // A37: real FIX4 placement + street actually visible + flanker seen.
    const P = R.place || {};
    if (P.w1d == null) fail.push('no W1 record (SS.firstWave)');
    else if (!(P.aheadFromW1 >= 20 && P.aheadFromW1 <= 50)) fail.push('door not in FIX4 W1+20-50 m band (aheadFromW1=' + P.aheadFromW1 + ')');
    if (!R.sight) fail.push('no sightline sample');
    else if (!R.sight.clear) fail.push('default look hits ' + R.sight.hit + ' at ' + R.sight.hitD + 'm (needs ' + R.sight.need + 'm clear to reach the street) - facing wall/pillar');
    if (!R.flanker || R.flanker.none) fail.push('no doorway pressure flanker arrived');
    else {
      if (!R.flanker.visClear) fail.push('pressure flanker hidden behind ' + R.flanker.block);
      if (!R.flanker.onScreen) fail.push('pressure flanker off screen (ndcX ' + R.flanker.ndcX + ')');
      if (!(Math.abs(R.flanker.angDeg) <= 35)) fail.push('pressure flanker ' + R.flanker.angDeg + '° off the look centre (>35)');
    }
    if (R.dragTest) {
      if (R.dragTest.yankedIntoRoom) fail.push('street-side aim yanked into room after idle (yawAfter=' + R.dragTest.yawAfter + ' want=' + R.dragTest.want + ')');
    } else warn.push('dragTest not run');
    if (R.died != null) fail.push('died ' + R.died);
    if (R.errs && R.errs.length) fail.push('pageerr ' + R.errs[0]);
    R.fail = fail; R.warn = warn;
    fs.writeFileSync(out, JSON.stringify(R, null, 2));
    console.log(fail.length ? 'A35 YAW FAIL ' + fail.join(' | ') : 'A35 YAW PASS yaw=' + (R.last && R.last.yaw) + ' flankAng=' + (R.last && R.last.flankAngDeg) + ' side=' + (R.last && R.last.side) + ' sightClear=' + (R.sight && R.sight.clear) + ' flanker=' + (R.flanker && R.flanker.angDeg) + '°/vis ' + (R.flanker && R.flanker.visClear) + ' aheadW1=' + (R.place && R.place.aheadFromW1));
    if (warn.length) console.log('WARN ' + warn.join(' | '));
    await ctx.close();
  } catch (e) { fail.push(String(e && e.message || e)); fs.writeFileSync(out, JSON.stringify({ fail }, null, 2)); console.log('A35 YAW FAIL ' + fail.join(' | ')); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
