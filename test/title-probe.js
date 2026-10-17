const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path');
const D = '/workspace/sandstorm/dist'; const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.glb': 'model/gltf-binary' };
const srv = http.createServer((q, r) => { let f = path.join(D, decodeURIComponent(q.url.split('?')[0])); if (f.endsWith('/')) f += 'index.html';
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'content-type': T[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); }).listen(8809);
(async () => { const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const q of (process.env.QS || 'low,high').split(',')) { const p = await (await b.newContext({ viewport: { width: 844, height: 390 } })).newPage();
    await p.goto('http://127.0.0.1:8809/?q=' + q); await p.waitForFunction(() => window.SS && SS.art && SS.art.done, null, { timeout: 180000 }); await p.waitForTimeout(+(process.env.WAIT || 1500));
    await p.screenshot({ path: '/workspace/sandstorm/screenshots/title/' + q + '.png' });
    await p.setViewportSize({ width: 1024, height: 570 }); await p.waitForTimeout(1500);
    await p.screenshot({ path: '/workspace/sandstorm/screenshots/title/' + q + '-resized.png' });
    const px = await p.evaluate(() => { const c = document.createElement('canvas'), s = document.querySelector('canvas'); c.width = 32; c.height = 18; const x = c.getContext('2d'); x.drawImage(s, 0, 0, 32, 18); const d = x.getImageData(0, 0, 32, 18).data; let m = 0; for (let i = 0; i < d.length; i += 4) m += d[i] + d[i + 1] + d[i + 2]; return Math.round(m / (d.length / 4) / 3); });
    console.log(q, 'mean luma after resize', px); }
  await b.close(); srv.close(); })();
