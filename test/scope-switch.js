const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8814;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
// m1u: a SWITCH COVER move must leave the scope (tester: scope stayed up through the move).
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 300000 });
  const fail = [], res = { tries: [] };
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true })).newPage();
    await p.goto('http://localhost:' + PORT + '/?seed=7&calm=1' + (process.env.SS_QS || '')); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 });
    await p.tap('#play'); await p.waitForFunction(() => window.SS && SS.running, null, { timeout: 90000 }); await p.evaluate(() => { SS.player.health = 1e9; });
    for (let k = 0; k < 3; k++) { const ok = await p.waitForFunction(() => SS.cover && SS.cover.state === 'in', null, { timeout: 60000 }).then(() => true).catch(() => false); if (ok) break;
      res.provoked = (res.provoked | 0) + 1; await p.evaluate(() => { const e = SS.debug.spawnEnemy('shifter'); if (e) { e.shootCd = 1e9; } }); }
    res.state = await p.evaluate(() => SS.cover.state);
    for (const side of ['coverR', 'coverL']) {
      await p.waitForFunction(() => SS.cover.state === 'in' && document.getElementById('switch-cover').classList.contains('on'), null, { timeout: 60000 }).catch(() => {});
      await p.tap('button[data-ctl=scope]'); await p.waitForTimeout(400);
      const before = await p.evaluate(() => [!!SS.input.scope, document.getElementById('switch-cover').classList.contains('on')]);
      await p.tap('button[data-ctl=' + side + ']', { timeout: 10000 }).catch((er) => fail.push(side + ': switch button not tappable (cover ' + before + ')')); await p.waitForTimeout(600);
      const after = await p.evaluate(() => { const o = document.getElementById('scope-overlay'); return [!!SS.input.scope, SS.cover.state, o ? getComputedStyle(o).display + '/' + getComputedStyle(o).opacity : 'none']; });
      res.tries.push({ side, before, after });
      if (!before[0]) fail.push(side + ': scope did not come up before the move');
      else if (after[0]) fail.push(side + ': scope still up after SWITCH COVER');
      await p.waitForTimeout(2500); }
    fs.mkdirSync(path.resolve(__dirname, '../screenshots/feedback'), { recursive: true }); await p.screenshot({ path: path.resolve(__dirname, '../screenshots/feedback/5-after-switch.png') });
  } catch (e) { fail.push(String(e)); }
  console.log(JSON.stringify(res)); await b.close(); srv.close(); console.log(fail.length ? 'SCOPE SWITCH FAIL ' + fail.join('; ') : 'SCOPE SWITCH PASS'); process.exit(fail.length ? 1 : 0); })();
