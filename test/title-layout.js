const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = path.resolve(__dirname, '../dist'); const PORT = 8813;
const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(PORT);
// m1u: the title quality button must not move when 'Loading street…' hides (space reserved).
(async () => { const b = await require('../tools/guard').launch(chromium, { executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }, { timeoutMs: 240000 });
  const fail = []; const seen = [];
  try { const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await p.goto('http://localhost:' + PORT + '/?titlebench=0');
    for (let i = 0; i < 120; i++) { const s = await p.evaluate(() => { const q = document.getElementById('quality').getBoundingClientRect(), pl = document.getElementById('play').getBoundingClientRect();
        return { q: Math.round(q.top * 10) / 10, p: Math.round(pl.top * 10) / 10, ready: document.body.classList.contains('ready') }; });
      if (!seen.length || seen[seen.length - 1].q !== s.q || seen[seen.length - 1].p !== s.p || seen[seen.length - 1].ready !== s.ready) seen.push(s);
      if (s.ready && i > 10 && seen[seen.length - 1].ready) { await p.waitForTimeout(1500); break; } await p.waitForTimeout(250); }
    const fin = await p.evaluate(() => ({ q: document.getElementById('quality').getBoundingClientRect().top, ready: document.body.classList.contains('ready') }));
    if (!fin.ready) fail.push('title never became ready');
    const qs = seen.map(s => s.q).concat([fin.q]); const span = Math.max(...qs) - Math.min(...qs);
    if (span > 1) fail.push('quality button moved ' + span.toFixed(1) + ' px');
    fs.mkdirSync(path.resolve(__dirname, '../screenshots/feedback'), { recursive: true });
    await p.screenshot({ path: path.resolve(__dirname, '../screenshots/feedback/4-title-ready.png') });
    console.log(JSON.stringify({ seen, fin, fail }));
  } catch (e) { fail.push(String(e)); }
  await b.close(); srv.close(); console.log(fail.length ? 'TITLE LAYOUT FAIL ' + fail.join('; ') : 'TITLE LAYOUT PASS'); process.exit(fail.length ? 1 : 0); })();
