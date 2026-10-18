// Browser guard for every test/render script: tags our Chrome with --ss-harness, waits while another headless run is active,
// always closes the browser on exit/error/signal (the "finally"), and a watchdog kills everything after SS_TIMEOUT_MS
// (default 20 min). Usage: const b = await require('../../tools/guard').launch(chromium, opts, { timeoutMs })
const { execSync } = require('child_process');
const TAG = '--ss-harness';
function killStrays() { try { execSync(`pkill -9 -f -- '${TAG}'`, { stdio: 'ignore' }); } catch (e) {} }   // only Chrome started by our scripts carries the tag
let browsers = [], armed = false;
async function closeAll() { const bs = browsers.splice(0); await Promise.all(bs.map(b => b.close().catch(() => {}))); }
function arm(timeoutMs) {
  if (armed) return; armed = true;
  const t = setTimeout(async () => { console.error(`WATCHDOG: no finish after ${timeoutMs} ms, closing browser`); await Promise.race([closeAll(), new Promise(r => setTimeout(r, 5000))]); process.exit(124); }, timeoutMs); t.unref();
  const bail = code => async (err) => { if (err && err.stack) console.error(err.stack); await Promise.race([closeAll(), new Promise(r => setTimeout(r, 5000))]); process.exit(code); };
  process.on('SIGINT', bail(130)); process.on('SIGTERM', bail(143)); process.on('uncaughtException', bail(1)); process.on('unhandledRejection', bail(1));
  process.on('exit', () => { browsers.forEach(b => { try { const pr = b.process && b.process(); pr && pr.kill('SIGKILL'); } catch (e) {} }); });   // only our own browser
}
async function launch(chromium, opts = {}, { timeoutMs = +(process.env.SS_TIMEOUT_MS || 20 * 60 * 1000), fresh = !browsers.length } = {}) {
  if (fresh) { // shared box: never kill or overlap another run; wait for it to finish (up to the watchdog time)
    const { execSync: x } = require('child_process'), busy = () => { try { x(JSON.stringify(require('path').join(__dirname, 'busy.sh')), { stdio: 'ignore' }); return true; } catch (e) { return false; } }; // tools/busy.sh (SS_PAR aware)
    const t0 = Date.now(); while (busy() && Date.now() - t0 < timeoutMs) { console.error('guard: another headless run is active, waiting'); await new Promise(r => setTimeout(r, 20000)); } }
  arm(timeoutMs);
  const b = await chromium.launch({ ...opts, args: [...(opts.args || []), TAG] }); browsers.push(b);
  const close = b.close.bind(b); b.close = async () => { browsers = browsers.filter(x => x !== b); return close(); };
  return b;
}
module.exports = { launch, killStrays, closeAll, TAG };
