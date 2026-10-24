// A30 force: open lit doorway payoff + deterministic climax grenade (thin Immersion fix).
// 1) ?door=1 — post-W1 hold at door; leafOpen >= 110deg; roomLit present; peek sees into room (not shut leaf).
// 2) ?cxnade=1 — climax grenade fires; ducked no-yank; flushBeforeCx=0.
// 3) ?door=1&cxnade=1 combined — climax grenade still fires this run (A29 human fail).
// 4) camp nade in normal cover — A36: forced cover move (yank=true, Moving cover warning), never an instant kill.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8849;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.hdr': 'application/octet-stream' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const [tier = 'low', out = 'logs/a30/force'] = process.argv.slice(2); fs.mkdirSync(path.dirname(out), { recursive: true });
const BASE = '/?seed=7&loco=2&hits=2&repos=1&fx=3&debug&q=' + tier;

(async () => {
  const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 3600000 });
  const res = { tier }, fail = [];
  const boot = async (q) => {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1.5, isMobile: true, hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.goto('http://127.0.0.1:' + PORT + BASE + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
    return { ctx, p, errs };
  };
  try {
    // --- 1) force doorway post-W1 ---
    {
      const { ctx, p, errs } = await boot('&door=1');
      const r = await p.evaluate(async () => {
        const R = { maxCount: 0, held: null, roomPoints: 0, doorZ: null, logs: [], doorDbg: null, probe: null }; let lastKill = 0;
        const t0 = performance.now();
        const probeDoor = () => {
          let heldDoor = null;
          for (const seg of (SS.world && SS.world.segments) || []) for (const pt of seg.coverPoints || []) {
            if (pt.type === 'room' && pt.door && SS.doorStop && SS.doorStop.room && Math.abs(pt.door.z - SS.doorStop.room[1]) < 0.5) heldDoor = pt.door;
          }
          let lit = 0, rim = 0;
          if (SS.world && SS.world.segments) for (const seg of SS.world.segments) seg.group && seg.group.traverse((o) => {
            if (o.isPointLight && o.name === 'roomLit') lit++;
            if (o.isPointLight && o.name === 'roomLitRim') rim++;
          });
          const P = { leafOpen: heldDoor && heldDoor.leafOpen != null ? +heldDoor.leafOpen.toFixed(2) : null, doorOpenFlag: !!(heldDoor && heldDoor.open), roomLit: lit, roomLitRim: rim, yaw: +(SS.input.yaw || 0).toFixed(3), cam: { x: +SS.camera.position.x.toFixed(2), z: +SS.camera.position.z.toFixed(2) }, aperture: null };
          try {
            const THREE = SS.THREE;
            if (heldDoor && THREE && SS.scene) {
              const side = heldDoor.side || 1;
              const ox = SS.camera.position.x, oy = SS.camera.position.y || 1.5, oz = SS.camera.position.z;
              const dx = side * 0.85, dy = -0.05, dz = 0.1;
              const len = Math.hypot(dx, dy, dz) || 1;
              const rc = new THREE.Raycaster(new THREE.Vector3(ox, oy, oz), new THREE.Vector3(dx / len, dy / len, dz / len), 0.05, 8);
              const meshes = []; SS.scene.traverse((o) => { if (o.isMesh && o.visible) meshes.push(o); });
              const hs = rc.intersectObjects(meshes, false);
              P.aperture = hs[0] ? { name: hs[0].object.name || '', dist: +hs[0].distance.toFixed(2), leaf: hs[0].object.name === 'doorLeaf' } : { name: 'none', dist: 8, leaf: false };
            }
          } catch (e) { P.apertureErr = String(e); }
          return P;
        };
        while ((SS.simTime || 0) < 200 && performance.now() - t0 < 900000) {
          const ds = SS.doorStop || { count: 0 }; R.maxCount = Math.max(R.maxCount, ds.count | 0);
          if (ds.state === 'held' && !R.held && SS.cover) {
            R.held = { sim: +(SS.simTime || 0).toFixed(1), kind: SS.cover.kind, state: SS.cover.state, ducked: !!SS.input.cover };
            R.probe = probeDoor();
          }
          if (ds.state === 'done') break;
          const sim = SS.simTime || 0;
          if (sim - lastKill > 2 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
          if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
        R.doorStop = SS.doorStop ? JSON.parse(JSON.stringify(SS.doorStop)) : null;
        R.doorDbg = SS.doorDbg || null;
        R.logs = (SS.audioLog || []).filter((x) => x.kind === 'door').map((x) => x.kind + ' ' + (x.detail || '')).slice(-8);
        const rooms = [];
        for (const seg of (SS.world && SS.world.segments) || []) for (const p of seg.coverPoints || []) if (p.type === 'room' && p.door) rooms.push(p.door.z);
        R.roomPoints = rooms.length;
        // A36 (App PM): the forced band is 25-40 m ahead of where W1 is fought (fps-independent opening walk), not spawn.
        R.w1d = SS.firstWave && SS.firstWave.d != null ? +(+SS.firstWave.d).toFixed(1) : null;
        const w1Z = 4 - (R.w1d != null ? R.w1d : 0); // spawn z≈4
        R.doorZ = rooms.length ? rooms.reduce((a, z) => (Math.abs(z - (w1Z - 32)) < Math.abs(a - (w1Z - 32)) ? z : a), rooms[0]) : null;
        R.aheadFromSpawn = R.doorZ != null ? +(4 - R.doorZ).toFixed(1) : null;
        R.aheadFromW1 = R.doorZ != null ? +(w1Z - R.doorZ).toFixed(1) : null;
        if (R.probe) { R.leafOpen = R.probe.leafOpen; R.doorOpenFlag = R.probe.doorOpenFlag; R.roomLit = R.probe.roomLit; R.roomLitRim = R.probe.roomLitRim; R.yaw = R.probe.yaw; R.cam = R.probe.cam; R.aperture = R.probe.aperture; }
        R.end = { sim: +(SS.simTime || 0).toFixed(1), dist: +(SS.distance || 0).toFixed(1), clears: SS.waveClears | 0 };
        return R;
      });
      r.errs = errs.slice(0, 5); res.door = r; await ctx.close();
      if (!(r.roomPoints > 0)) fail.push('door=1: no room points');
      if ((r.maxCount | 0) < 1) fail.push('door=1: doorway never armed');
      if (!r.held) fail.push('door=1: never held at doorway'); else if (r.held.kind !== 'door') fail.push('door=1: cover kind ' + r.held.kind);
      if (r.w1d == null) fail.push('door=1: no W1 record');
      if (r.aheadFromW1 != null && (r.aheadFromW1 < 20 || r.aheadFromW1 > 50)) fail.push('door=1: nearest room ahead of W1 ' + r.aheadFromW1 + 'm (want ~25–40)');
      const joined = (r.logs || []).join(' | ');
      if (!/door arm/.test(joined) && !(r.doorDbg && /door arm/.test(r.doorDbg))) fail.push('door=1: missing door arm log');
      if (!/veer start/.test(joined) && !(r.doorDbg && /veer|DOORWAY/.test(r.doorDbg))) fail.push('door=1: missing veer start log');
      if (!(r.leafOpen >= 1.7)) fail.push('door=1: leafOpen ' + r.leafOpen + ' (want >= 110deg / 1.92rad)');
      if (!(r.roomLit > 0)) fail.push('door=1: no roomLit PointLight');
      if (r.aperture && r.aperture.leaf && r.aperture.dist < 0.9) fail.push('door=1: aperture blocked by doorLeaf at ' + r.aperture.dist + 'm');
      if (r.died != null) fail.push('door=1: died at ' + r.died); if (r.errs && r.errs.length) fail.push('door=1: page errors');
    }
    // --- 2) force climax grenade + in-cover no-yank ---
    {
      const { ctx, p, errs } = await boot('&cxnade=1');
      const r = await p.evaluate(async () => {
        const R = { climax: null, nade: null, yank: false, coverAfter: null, flushBeforeCx: 0 }; let lastKill = 0; let duckedLatch = false;
        const t0 = performance.now();
        while ((SS.simTime || 0) < 220 && performance.now() - t0 < 1200000) {
          SS.input.scope = false;
          if (SS.cover && SS.cover.state === 'in') { SS.input.cover = true; duckedLatch = true; }
          const sim = SS.simTime || 0;
          const cs = SS.climaxState;
          if (cs && cs.phase === 'active' && !R.climax) R.climax = { wave: cs.wave, due: cs.due, sim: +sim.toFixed(1) };
          if (!R.climax) R.flushBeforeCx = SS.grenades | 0;
          const log = (SS.audioLog || []).concat([]);
          for (const x of log) if (x.kind === 'enemy' && /climax grenade/.test(x.detail || '') && !R.nade) {
            R.nade = { sim: x.t, detail: x.detail, ducked: !!SS.input.cover, coverState: SS.cover && SS.cover.state, kind: SS.cover && SS.cover.kind };
          }
          if (R.nade && duckedLatch && SS.cover && SS.cover.state === 'moving' && SS.cover.lastMove === 'grenade') R.yank = true;
          if (R.nade && R.climax && sim > (R.nade.sim || 0) + 3) {
            R.coverAfter = { state: SS.cover && SS.cover.state, kind: SS.cover && SS.cover.kind, ducked: !!SS.input.cover, lastMove: SS.cover && SS.cover.lastMove };
            break;
          }
          const clears = SS.waveClears | 0;
          if (clears < 1 && sim - lastKill > 1.5 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
          if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
        R.climaxLog = (SS.climaxLog || []).slice(-5);
        R.climaxState = SS.climaxState || null;
        R.end = { sim: +(SS.simTime || 0).toFixed(1), clears: SS.waveClears | 0 };
        return R;
      });
      r.errs = errs.slice(0, 5); res.cxnade = r; await ctx.close();
      if (!r.climax && !(r.climaxLog && r.climaxLog.length)) fail.push('cxnade=1: no climax');
      const hadNade = !!(r.nade || (r.climaxLog || []).some((c) => c.nade != null));
      if (!hadNade) fail.push('cxnade=1: no climax grenade');
      if (r.yank) fail.push('cxnade=1: Moving-cover yank fired during climax while ducked');
      if (r.coverAfter && r.coverAfter.lastMove === 'grenade' && r.coverAfter.state === 'moving') fail.push('cxnade=1: cover still moving from grenade after climax nade');
      if ((r.flushBeforeCx | 0) > 0) fail.push('cxnade=1: camping flush before climax (' + r.flushBeforeCx + ')');
      if (r.died != null) fail.push('cxnade=1: died at ' + r.died); if (r.errs && r.errs.length) fail.push('cxnade=1: page errors');
    }
    // --- 3) combined door=1&cxnade=1 (A29 human: climax never fired while in doorway) ---
    {
      const { ctx, p, errs } = await boot('&door=1&cxnade=1');
      const r = await p.evaluate(async () => {
        const R = { held: null, climax: null, nade: null, yank: false, soak: null, flushBeforeCx: 0 }; let lastKill = 0; let duckedLatch = false;
        const t0 = performance.now();
        while ((SS.simTime || 0) < 200 && performance.now() - t0 < 1200000) {
          SS.input.scope = false;
          if (SS.cover && SS.cover.state === 'in') { SS.input.cover = true; duckedLatch = true; }
          const ds = SS.doorStop || {};
          if (ds.state === 'held' && !R.held) R.held = { sim: +(SS.simTime || 0).toFixed(1), kind: SS.cover && SS.cover.kind };
          const sim = SS.simTime || 0;
          const cs = SS.climaxState;
          if (cs && cs.phase === 'active' && !R.climax) R.climax = { wave: cs.wave, due: cs.due, sim: +sim.toFixed(1) };
          if (!R.climax) R.flushBeforeCx = SS.grenades | 0;
          for (const x of (SS.audioLog || [])) {
            if (x.kind === 'enemy' && /climax grenade/.test(x.detail || '') && !R.nade)
              R.nade = { sim: x.t, detail: x.detail, ducked: !!SS.input.cover, coverState: SS.cover && SS.cover.state, kind: SS.cover && SS.cover.kind };
            if (x.kind === 'grenade, cover' && !R.soak) R.soak = { detail: x.detail, t: x.t };
          }
          if (R.nade && duckedLatch && SS.cover && SS.cover.state === 'moving' && SS.cover.lastMove === 'grenade') R.yank = true;
          if (R.nade && R.climax && sim > (R.nade.sim || 0) + 2.5) break;
          const clears = SS.waveClears | 0;
          // Clear W1 fast; once held at door let climax cook (only kill if >3 alive to keep throwers)
          if (clears < 1 && sim - lastKill > 1.5 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
          else if (clears >= 1 && (SS.enemies && SS.enemies.list ? SS.enemies.list.filter(e => e.alive && !e.dying).length : 0) > 3 && sim - lastKill > 4 && SS.debugKillNearest) { SS.debugKillNearest(); lastKill = sim; }
          if (!SS.player.alive) { R.died = +sim.toFixed(1); break; }
          await new Promise((r) => setTimeout(r, 250));
        }
        R.climaxLog = (SS.climaxLog || []).slice(-5);
        R.end = { sim: +(SS.simTime || 0).toFixed(1), clears: SS.waveClears | 0 };
        R.doorStop = SS.doorStop ? { state: SS.doorStop.state, count: SS.doorStop.count } : null;
        return R;
      });
      r.errs = errs.slice(0, 5); res.combined = r; await ctx.close();
      if (!r.held) fail.push('combined: never held doorway');
      if (!r.climax && !(r.climaxLog && r.climaxLog.length)) fail.push('combined: no climax');
      const hadNade = !!(r.nade || (r.climaxLog || []).some((c) => c.nade != null));
      if (!hadNade) fail.push('combined: no climax grenade (door+cxnade)');
      if (r.yank) fail.push('combined: Moving-cover yank while ducked');
      if ((r.flushBeforeCx | 0) > 0) fail.push('combined: camping flush before climax');
      if (r.died != null) fail.push('combined: died at ' + r.died); if (r.errs && r.errs.length) fail.push('combined: page errors');
    }
    // --- 4) ducked camping nade in NORMAL cover (no climax): A36 App PM ruling - the grenade forces the announced cover move
    //        even when ducked (no-yank + soak is doorway cover / climax only); never an instant kill ---
    {
      const { ctx, p, errs } = await boot('');
      const r = await p.evaluate(async () => {
        const R = { yank: false, soak: null, hint: null, cover: null, logs: [] };
        const t0 = performance.now();
        // Reach cover: wait until IN COVER ducked, or force take nearest by walking into fight briefly.
        while ((SS.simTime || 0) < 90 && performance.now() - t0 < 600000) {
          SS.input.scope = false;
          if (SS.cover && SS.cover.state === 'in') { SS.input.cover = true; break; }
          if (SS.player.health < 50) SS.player.health = 100;
          await new Promise((r) => setTimeout(r, 200));
        }
        if (!(SS.cover && SS.cover.state === 'in')) { R.noCover = true; return R; }
        SS.input.cover = true; SS.input.scope = false;
        SS.player.health = 80;
        const hp0 = SS.player.health;
        const g0 = SS.grenades | 0;
        const ok = SS.enemies.debugGrenade(false);
        R.thrown = !!ok;
        const t1 = performance.now();
        while ((SS.grenades | 0) === g0 && performance.now() - t1 < 5000) await new Promise((r) => setTimeout(r, 50));
        // Watch through flight+fuse (~3.5s game; wall can be long at low fps)
        const t2 = performance.now(); const sim0 = SS.simTime || 0;
        while ((SS.simTime || 0) - sim0 < 6 && performance.now() - t2 < 180000) {
          SS.input.scope = false; SS.input.cover = true;
          if (SS.hud && SS.hud.hintText) { R.hint = SS.hud.hintText; if (R.hint === 'GRENADE! Moving cover') R.hintMove = true; }
          if (SS.cover && SS.cover.state === 'moving' && SS.cover.lastMove === 'grenade') R.yank = true;
          if (SS.lastGrenade && SS.lastGrenade.hpBefore != null) break;
          await new Promise((r) => setTimeout(r, 100));
        }
        R.cover = { state: SS.cover && SS.cover.state, lastMove: SS.cover && SS.cover.lastMove, ducked: !!SS.input.cover };
        R.lastGrenade = SS.lastGrenade || null;
        R.hp = SS.player.health;
        R.hp0 = hp0;
        R.logs = (SS.audioLog || []).filter((x) => /grenade/.test(x.kind) || /grenade/.test(x.detail || '')).slice(-10)
          .map((x) => x.kind + ':' + (x.detail || ''));
        const soakLog = (SS.audioLog || []).find((x) => x.kind === 'grenade, cover');
        R.soak = soakLog ? { detail: soakLog.detail, t: soakLog.t } : null;
        if (R.lastGrenade && R.lastGrenade.src === 'grenade-cover') R.soakSrc = true;
        return R;
      });
      r.errs = errs.slice(0, 5); res.campNade = r; await ctx.close();
      if (r.noCover) fail.push('campNade: never reached IN COVER');
      else {
        if (!r.thrown) fail.push('campNade: debugGrenade failed');
        if (!r.yank) fail.push('campNade: no Moving-cover yank in normal cover while ducked (A36 PM: grenade must force a cover move)');
        if (!r.hintMove) fail.push('campNade: no GRENADE! Moving cover warning (hint ' + r.hint + ')');
        if (r.lastGrenade && r.lastGrenade.src === 'grenade-cover') fail.push('campNade: normal-cover soak/no-yank path used (doorway/climax only)');
        const ha = r.lastGrenade && r.lastGrenade.hpAfter;
        if (!r.lastGrenade) fail.push('campNade: no blast recorded');
        else if (!(ha > 0)) fail.push('campNade: instant kill (' + r.lastGrenade.hpBefore + ' -> ' + ha + ')');
      }
      if (r.errs && r.errs.length) fail.push('campNade: page errors');
    }
  } catch (e) { fail.push('exception ' + e.message); }
  await b.close(); srv.close(); res.fail = fail;
  fs.writeFileSync(out + '_' + tier + '.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res).slice(0, 6000));
  console.log(fail.length ? 'A30-FORCE FAIL ' + fail.join(' ; ') : 'A30-FORCE PASS');
  process.exit(fail.length ? 1 : 0);
})();
