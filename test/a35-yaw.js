// A35: doorway street peek yaw — when IN COVER · DOORWAY, look OUT to street so flankers are in FOV.
// Fail if yaw still aims into the room wall (A34 residual) or street-side aim is yanked back.
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
    if (R.dragTest) {
      if (R.dragTest.yankedIntoRoom) fail.push('street-side aim yanked into room after idle (yawAfter=' + R.dragTest.yawAfter + ' want=' + R.dragTest.want + ')');
    } else warn.push('dragTest not run');
    if (R.died != null) fail.push('died ' + R.died);
    if (R.errs && R.errs.length) fail.push('pageerr ' + R.errs[0]);
    R.fail = fail; R.warn = warn;
    fs.writeFileSync(out, JSON.stringify(R, null, 2));
    console.log(fail.length ? 'A35 YAW FAIL ' + fail.join(' | ') : 'A35 YAW PASS yaw=' + (R.last && R.last.yaw) + ' flankAng=' + (R.last && R.last.flankAngDeg) + ' side=' + (R.last && R.last.side));
    if (warn.length) console.log('WARN ' + warn.join(' | '));
    await ctx.close();
  } catch (e) { fail.push(String(e && e.message || e)); fs.writeFileSync(out, JSON.stringify({ fail }, null, 2)); console.log('A35 YAW FAIL ' + fail.join(' | ')); }
  finally { try { await b.close(); } catch (_) {} try { srv.close(); } catch (_) {} }
  process.exit(fail.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
