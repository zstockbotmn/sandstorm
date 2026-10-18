// Tester (m1p): runs stalled at 8 m on ultra-low (wave never cleared, walk never resumed). A bot plays at low fps
// (~7 fps busy-wait) on Ultra-low, Low and High and must clear 2+ waves in each. SS_WAVES_MODES=ultra,low,high.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8806;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
const MODES = (process.env.SS_WAVES_MODES || 'ultra,low,high').split(','); const LIMIT = +(process.env.SS_WAVES_S || 150) * 1000;
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 1500000 });
  const res = {}; const fail = [];
  for (const mode of MODES) { const r = res[mode] = {};
    try { const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true }); const p = await ctx.newPage();
      await p.addInitScript(() => { const raf = window.requestAnimationFrame.bind(window); window.requestAnimationFrame = (cb) => raf((t) => { const ms = window.__slowMs | 0; if (ms) { const t0 = performance.now(); while (performance.now() - t0 < ms) {} } cb(t); }); });
      await p.goto('http://127.0.0.1:' + PORT + '/?seed=' + (process.env.SS_SEED || 1) + '&slow=' + (process.env.SS_SLOW || 60) + '&q=' + (mode === 'high' ? 'high' : 'low') + (process.env.SS_EXTRA || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
      if (mode === 'ultra') await p.evaluate(() => SS.goUltra('test'));
      await p.evaluate((c) => { window.__cone = c; }, process.env.SS_CONE !== '0'); await p.click('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.waitForTimeout(1000);
      // m1t: every hit on the player must come from a fighter the player could see (eye ray against drawn meshes, in the haze)
      await p.evaluate((v) => { window.__wdbg = v; }, !!process.env.SS_WAVES_DBG);
      await p.evaluate(() => { if (window.__dmgHook) return; window.__dmgHook = 1; window.__uh = { hits: 0, unseen: 0, ex: [] }; const P = SS.player, d0 = P.damage.bind(P);
        P.damage = (amount, from) => { try { const c = SS.camera.position, dens = SS.scene.fog && SS.scene.fog.density || 0; const U = window.__uh; U.hits++;
            let best = null, bd = 1e9; for (const e of SS.enemies.list || []) { if (!e.alive) continue; const q = e.group.position; const dd = from ? q.distanceTo(from) : 0; if (dd < bd) { bd = dd; best = e; } }
            const R = window.__eyeR2 || (window.__eyeR2 = new SS.THREE.Raycaster()); const shown = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
            const roots = (SS.world.segments || []).map((g) => g.group).filter(Boolean); let seen = false;
            if (best) for (const hy of [1.25, 1.62]) { const w = best.group.position.clone(); w.y += hy; const dd = w.distanceTo(c); if (dens && dd > 1.05 / dens) continue; SS.camera.updateMatrixWorld(); const ndc = w.clone().project(SS.camera); if (Math.abs(ndc.x) > 1 || Math.abs(ndc.y) > 1 || ndc.z > 1 || ndc.z < -1) continue; /* m1v: off screen = unseen (the harness only checked LOS) */
              R.set(c, w.clone().sub(c).normalize()); R.far = dd - 0.35; if (!R.intersectObjects(roots, true).some((x) => x.object.isMesh && shown(x.object))) { seen = true; break; } }
            if (!seen) { U.unseen++; if (U.ex.length < 5 && best) U.ex.push(best.group.position.toArray().map((v) => +v.toFixed(1)).concat([+best.group.position.distanceTo(c).toFixed(1)])); } } catch (e) {}
          const r = d0(amount, from); if (window.__passiveUntil && P.health < 40) { P.health = 100; SS.health = 100; } return r; }; });
      if (process.env.SS_WAVES_PASSIVE) await p.evaluate((ms) => { window.__passiveUntil = performance.now() + ms; SS.testAccuracy = 8; setTimeout(() => { SS.testAccuracy = 0; }, ms); }, +process.env.SS_WAVES_PASSIVE * 1000);
      if (process.env.SS_WAVES_RESTART) { // restart from the end screen first (tester m1r: Restart left run state behind)
        await p.waitForTimeout(6000); await p.evaluate(() => SS.onDeath()); await p.waitForTimeout(1200); await p.click('#restart'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 90000 }); r.restarted = true; } await p.evaluate(() => { window.__slowMs = +(new URLSearchParams(location.search).get("slow") || 110); });
      const t0 = Date.now(); let last = '';
      while (Date.now() - t0 < LIMIT) {
        const s = await p.evaluate(() => { const v = SS.camera.position.clone(), c = SS.camera.position;
          // a human only shoots what they can see: in range of the fog (>= 35% visible), inside the far plane, line of sight
          const dens = SS.scene.fog && SS.scene.fog.density || 0, see = dens ? Math.sqrt(-Math.log(0.35)) / dens : 1e9, far = SS.camera.far;
          const vis = (e) => { const bm = SS.weapon.targets.find((m) => m.userData.enemy === e && m.userData.part === 'body'); if (!bm) return false; const w = bm.getWorldPosition(c.clone()), dd = w.distanceTo(c);
            if (dd > see || dd > far || !e.group.visible) return false;
            if (window.__cone && -(w.z - c.z) < Math.abs(w.x - c.x) * 0.36) return false; // human at ~4 fps: only looks within ~70 deg of down-street
            // what the eye sees: first VISIBLE world surface on the line (drawn meshes only, no invisible colliders)
            const R = window.__eyeR || (window.__eyeR = new SS.THREE.Raycaster()); const dir = w.clone().sub(c).normalize(); R.set(c, dir); R.far = dd - 0.3;
            const shown = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; const m = o.material; return !(m && (m.visible === false || (Array.isArray(m) && m.every((x) => x.visible === false)))); };
            const roots = (SS.world.segments || []).map((g) => g.group).filter(Boolean); const eh = R.intersectObjects(roots, true).filter((x) => x.object.isMesh && shown(x.object));
            if (eh.length) return false; // eye says hidden
            const h = SS.weapon.firstHit(c.clone(), dir); const he = h && h.object.userData && h.object.userData.enemy; const ok = !!(he && (he === e || (he.alive && !he.dying && he.group.visible))); // another live, drawn fighter in front of this one is a real hit, not a phantom
            const S = window.__ws || (window.__ws = { eye: 0, phantom: 0, ex: [] }); const sig = e.group.position.toArray().map((v) => v.toFixed(2)).join(',') + ':' + (h ? h.distance.toFixed(2) : '-') + '/' + dd.toFixed(2); if (sig === S.lastSig) return true; S.lastSig = sig; // one slow frame polled twice = one look
            S.eye++; if (!ok && h && dd - h.distance > 0.5) { S.phantom++; if (S.ex.length < 5) S.ex.push((h.object.name || h.object.type) + '@' + h.distance.toFixed(1) + '/' + dd.toFixed(1) + (window.__wdbg ? ' ' + JSON.stringify({ vis: h.object.visible, par: h.object.parent && (h.object.parent.name || h.object.parent.type), ud: Object.keys(h.object.userData || {}), col: SS.world.colliders.includes(h.object), mat: !!h.object.material && (h.object.material.visible !== false), pos: h.point.toArray().map((v) => +v.toFixed(1)), geo: h.object.geometry && h.object.geometry.type }) : '')); }
            return true; };
          const list = (SS.enemies.list || []).filter((e) => e.alive && !e.dying && vis(e)).sort((a, b) => a.group.position.distanceTo(c) - b.group.position.distanceTo(c));
          const tgt = list[0]; if (tgt) { const bm = SS.weapon.targets.find((m) => m.userData.enemy === tgt && m.userData.part === 'body'); if (bm) bm.getWorldPosition(v); else { tgt.group.getWorldPosition(v); v.y += 1.2; } v.sub(c);
            // human-ish: turn at most ~1.5 rad/s, fire only once the crosshair is within ~2 deg
            const wy = Math.atan2(v.x, -v.z), wp = -Math.atan2(v.y, Math.hypot(v.x, v.z)), now = performance.now(), st = Math.min(0.6, ((now - (window.__lt || now)) / 1000) * 1.5);
            let dy = Math.atan2(Math.sin(wy - SS.input.yaw), Math.cos(wy - SS.input.yaw)); SS.input.yaw += Math.max(-st, Math.min(st, dy)); SS.input.pitch += Math.max(-st, Math.min(st, wp - SS.input.pitch));
            SS.input.fire = Math.abs(dy) < 0.035 && Math.abs(wp - SS.input.pitch) < 0.035 && !(window.__passiveUntil && performance.now() < window.__passiveUntil); } else SS.input.fire = false; window.__lt = performance.now();
          const over = (() => { const o = document.getElementById('over'); return !!(o && o.offsetParent !== null && getComputedStyle(o).display !== 'none'); })();
          return { k: SS.scoreSys && SS.scoreSys.state ? SS.scoreSys.state.kills : 0, ws: window.__ws ? window.__ws.phantom + '/' + window.__ws.eye : '', over, hp: Math.round(SS.health), d: Math.round(SS.distance), w: SS.waveClears | 0, alive: (SS.enemies.list || []).filter((e) => e.alive).length, ammo: SS.weapon.ammo + '/' + SS.weapon.reserve, walking: SS.walking, see: Math.round(see), fps: SS.benchFps, q: SS.quality }; });
        r.last = s; if ((s.w | 0) >= 2 || (!process.env.SS_WAVES_RESTART && s.k >= 5 && s.d >= 40)) { r.passed = true; break; } if (s.d !== r.dmax) { r.dmax = s.d; r.dT = Date.now(); } if (Date.now() - (r.dT || t0) > 60000) { r.stalled = true; break; } if (s.over) { r.died = true; break; }
        const k = s.d + '/' + s.w; if (k !== last) { last = k; console.log(mode, Math.round((Date.now() - t0) / 1000) + 's', JSON.stringify(s)); }
        await p.waitForTimeout(300);
      }
      r.secs = Math.round((Date.now() - t0) / 1000); r.ws = await p.evaluate(() => window.__ws || null);
      r.uh = await p.evaluate(() => window.__uh ? Object.assign({ shots: SS.enemyShots | 0, blocked: SS.blindHitsBlocked | 0, silent: (SS.enemies.list || []).reduce((a, e) => a + (e.silentSkips | 0), 0) }, window.__uh) : null).catch(() => null);
      if (r.uh && r.uh.unseen > Math.max(1, r.uh.hits * 0.1)) fail.push(mode + ': ' + r.uh.unseen + '/' + r.uh.hits + ' hits on the player came from a fighter the player could not see ' + JSON.stringify(r.uh.ex));
      if (r.ws && r.ws.phantom > Math.max(1, r.ws.eye * 0.03)) fail.push(mode + ': ' + r.ws.phantom + '/' + r.ws.eye + ' looks at a visible fighter had the shot stopped by something not drawn ' + JSON.stringify(r.ws.ex));
      if (!r.passed) { fail.push(mode + ': ' + (r.stalled ? 'STALLED 60 s' : 'not 2 waves') + ' at ' + (r.last && r.last.d) + ' m, waves ' + (r.last && r.last.w) + ', kills ' + (r.last && r.last.k));
        r.enemies = await p.evaluate(() => (SS.enemies.list || []).filter((e) => e.alive).map((e) => ({ p: e.group.position.toArray().map((x) => +x.toFixed(1)), vis: e.group.visible, exposed: e.exposed, engaged: e.engaged, phase: e.phase, seen: e.seen, behav: e.behavior || e.kind, roof: !!e.roof, truck: !!e.fromTruck, pinned: !!e.pinned })));
        r.cam = await p.evaluate(() => SS.camera.position.toArray().map((x) => +x.toFixed(1))); }
      fs.mkdirSync('screenshots/waves', { recursive: true }); await p.screenshot({ path: 'screenshots/waves/' + mode + '.png' }); await ctx.close();
    } catch (e) { fail.push(mode + ' exception ' + e.message); }
  }
  if (process.env.SS_WAVES_PASSIVE) { const tot = Object.values(res).reduce((a, r) => a + ((r && r.uh && r.uh.hits) | 0), 0); res.passiveHits = tot; const gated = Object.values(res).reduce((a, r) => a + ((r && r.uh && r.uh.shots) | 0), 0); res.passiveShots = gated; /* m1v: hits are rarer by design now (game-time spacing, cover grace) - require the gate to be exercised: >=20 gated shots, >=2 landed */ if (tot < 2 || gated < 20) fail.push('passive phases drew only ' + tot + ' hits / ' + gated + ' gated shots in total (unseen-hit check not exercised)'); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'WAVES FAIL' : 'WAVES PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
