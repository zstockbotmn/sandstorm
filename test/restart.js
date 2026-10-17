// Tester m1r: Restart from the end screen 3x; every run's first wave must be exactly 2 fighters, spawned at the same
// distance, with nothing more arriving before the first kill.
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8808;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 600000 });
  const res = { runs: [] }, fail = [];
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.goto('http://127.0.0.1:' + PORT + '/?seed=5' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    for (let run = 0; run < 4; run++) {
      if (run === 0) await p.click('#play'); else { await p.evaluate(() => SS.onDeath()); await p.waitForTimeout(1200); await p.click('#restart'); }
      await p.evaluate(() => { SS.player.health = 1e9; window.__fw = { max: 0, at: null }; });
      const t0 = Date.now(); let r = null;
      while (Date.now() - t0 < 40000) { r = await p.evaluate(() => { const alive = SS.enemies.list.filter((e) => e.alive).length, W = window.__fw; W.max = Math.max(W.max, alive);
          return { d0: SS.distance, alive, max: W.max, fw: SS.firstWave, walking: SS.walking }; });
        if (r.fw && Date.now() - t0 > 2000 && r.max >= 2) { await p.waitForTimeout(8000); r = await p.evaluate(() => { const W = window.__fw; return { max: Math.max(W.max, SS.enemies.list.filter((e) => e.alive).length), fw: SS.firstWave, kills: SS.scoreSys.state.kills }; }); break; }
        await p.waitForTimeout(250); }
      res.runs.push(r);
      if (!r || !r.fw) fail.push('run ' + run + ': first wave never came'); else if (r.max !== 2) fail.push('run ' + run + ': first wave had ' + r.max + ' fighters (want exactly 2, nothing more before the first kill)');
    }
    const ds = res.runs.filter((r) => r && r.fw).map((r) => r.fw.d); if (ds.length && Math.max(...ds) - Math.min(...ds) > 1.0) fail.push('first wave distance varies ' + JSON.stringify(ds));
  } catch (e) { fail.push('exception ' + e.message); }
  res.fail = fail; console.log(JSON.stringify(res)); console.log(fail.length ? 'RESTART FAIL' : 'RESTART PASS'); await b.close(); srv.close(); process.exit(fail.length ? 1 : 0); })();
