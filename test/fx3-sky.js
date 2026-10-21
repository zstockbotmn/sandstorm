// A5 follow-up (NOT run yet): skyline flashes must land where the player sees them during the opening build-up.
// fx3.js placement is by angle down the street (azimuth +-4.5 deg of -Z, elevation 9-17 deg, 60-150 m, re-rolled up to 3x if a
// world ray to the spot is blocked); SS.fx3.skyline publishes inView / occluded counts and lastFlash / lastTracer screen
// readouts (NDC x/y, inView, px height, distance). With the player looking down the street (yaw 0, pitch 0) at approach 0.1
// and 0.9 for 9 s each, assert: >= N flashes (default 3) in the viewport and unblocked, >= 70 % of flashes in view, each sampled
// flash's px height 18-60 at 844x390, every tracer start >= 40 m away and its start/end NDC x on opposite sides or both
// inside the view (it runs across), Ultra-low no tracers. Usage: SS_QS='&q=low&test=fast' SS_N=3 node test/fx3-sky.js
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8846;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
let QS = process.env.SS_QS || '&q=low&test=fast'; const N = +(process.env.SS_N || 3); const ultra = /[?&]q=ultra-low/.test(QS); QS = QS.replace('q=ultra-low', 'q=low');
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] }, { timeoutMs: 600000 });
  const fail = []; const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 160)));
  await p.goto('http://127.0.0.1:' + PORT + '/?seed=7&calm=1&loco=2&hits=2&fx=3' + QS); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 }); if (ultra) await p.evaluate(() => SS.goUltra('test'));
  await p.click('#play'); await p.waitForFunction(() => SS.running && !document.body.classList.contains('starting'), null, { timeout: 120000 });
  const res = await p.evaluate(async () => { SS.player.health = 1e6; window.SS_VIEW_YAW = 0; if (SS.input) SS.input.pitch = 0; const flashes = [], tracers = []; let lf = null, lt = null;
    const s0 = { ...SS.fx3.skyline }; const poll = setInterval(() => { const s = SS.fx3.skyline; if (s.lastFlash && s.lastFlash !== lf) { lf = s.lastFlash; flashes.push(lf); } if (s.lastTracer && s.lastTracer !== lt) { lt = s.lastTracer; tracers.push(lt); } }, 16);
    for (const a of [0.1, 0.9]) { SS.approachForce = a; await new Promise((r) => setTimeout(r, 9000)); } SS.approachForce = null; clearInterval(poll);
    const s = SS.fx3.skyline; return { flashes: s.flashes - s0.flashes, inView: s.inView - s0.inView, occluded: s.occluded - s0.occluded, tracers: s.tracers - s0.tracers, sampF: flashes, sampT: tracers }; });
  await b.close(); srv.close();
  console.log(JSON.stringify({ ...res, sampF: res.sampF.slice(0, 6), sampT: res.sampT.slice(0, 4) }));
  if (!(res.inView >= N)) fail.push('only ' + res.inView + ' flashes in view (want >= ' + N + ')');
  if (res.flashes && res.inView / res.flashes < 0.7) fail.push(res.inView + '/' + res.flashes + ' flashes in view');
  for (const f of res.sampF) if (f.inView && !(f.px >= 18 && f.px <= 60)) { fail.push('flash ' + f.px + ' px at ' + f.d + ' m'); break; }
  if (ultra) { if (res.tracers) fail.push('ultra-low drew ' + res.tracers + ' tracers'); }
  else { if (!res.tracers) fail.push('no tracers'); for (const t of res.sampT) { if (t.start.d < 40) { fail.push('tracer started ' + t.start.d + ' m away'); break; }
      if (!(Math.sign(t.start.x) !== Math.sign(t.end.x) || (Math.abs(t.start.x) <= 1 && Math.abs(t.end.x) <= 1))) { fail.push('tracer did not cross the view ' + JSON.stringify(t)); break; } } }
  if (errs.length) fail.push('page errors: ' + errs.join(' | '));
  console.log(fail.length ? 'FX3SKY FAIL ' + fail.join(' ; ') : 'FX3SKY PASS'); process.exit(fail.length ? 1 : 0); })();
