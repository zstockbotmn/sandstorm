// Low/High quality. Order: ?q=low|high, then localStorage 'ss.quality', then the default:
// Low on iPhone/iOS and touch devices, High elsewhere. Changing it from the start screen saves and reloads.
const KEY = 'ss.quality';
function detect() {
  try { const m = /[?&]q=(low|high)\b/.exec(location.search); if (m) return m[1]; } catch (e) {}
  try { const v = localStorage.getItem(KEY); if (v === 'low' || v === 'high') return v; if (v === 'ultra-low') return 'low'; } catch (e) {}
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  // Automated / headless / software-GL browsers (the tester's replays) also default to Low.
  const auto = navigator.webdriver === true || /HeadlessChrome/i.test(ua);
  return ios || touch || auto || softwareGL() ? 'low' : 'high';
}
function softwareGL() {
  try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); if (!gl) return true;
    const r = isSoftwareRenderer(gl); const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext(); if (r) return true;
    return isSoftwareRenderer(gl); } catch (e) { return false; }
}
// UNMASKED_RENDERER via WEBGL_debug_renderer_info, plus the plain RENDERER/VENDOR strings (newer Chrome unmasks those).
export function rendererString(gl) {
  let s = ''; try { const ext = gl.getExtension('WEBGL_debug_renderer_info'); if (ext) s += gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) + ' ' + gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) + ' '; } catch (e) {}
  try { s += gl.getParameter(gl.RENDERER) + ' ' + gl.getParameter(gl.VENDOR); } catch (e) {}
  return s;
}
export function isSoftwareRenderer(gl) { return /swiftshader|llvmpipe|softpipe|software|microsoft basic render/i.test(rendererString(gl));
}
export let QUALITY = detect();
export let LOWQ = QUALITY === 'low';
// PICKED: the player chose a tier in the menu (tester: auto saved ultra-low with no way out). A pick is never
// overridden or re-saved by the automatic steps.
export const PICKED = (() => { try { return localStorage.getItem('ss.qualityPick') === '1'; } catch (e) { return false; } })();
export const EXPLICIT = (() => { try { return /[?&]q=(low|high)\b/.test(location.search); } catch (e) { return false; } })();
// Low: ~0.85 render scale, no postfx, no shadows, shorter LOD and draw/fog distance.
const LOW = { res: 0.85, post: false, shadows: false, lodNear: 20, lodNearProp: 12, drawAhead: 95, fog: 0.022, far: 300 };
const HIGH = { res: 1, post: true, shadows: true, lodNear: 38, lodNearProp: 22, drawAhead: 140, fog: 0.016, far: 420 };
export const Q = Object.assign({}, LOWQ ? LOW : HIGH);
// Live switch to Low (software GL at start, or sustained low fps mid-run). Saved so the next start is Low too.
const lowHooks = [];
export function onLow(fn) { lowHooks.push(fn); }
// Ultra-low: Low still under 10 fps -> half resolution, 60 m draw distance (fewer buildings), thicker fog.
export let ULTRA = false;
export function goUltra(reason) {
  if (ULTRA) return false; ULTRA = true; try { if (!EXPLICIT && !PICKED) localStorage.setItem(KEY, 'ultra-low'); } catch (e) {} Object.assign(Q, LOW, { res: 0.4, drawAhead: 60, fog: 0.03, far: 200, lodNear: 10, lodNearProp: 6 } /* view distance as before: the m1o cut (fog .035, far 85) hid fighters in the haze (m1p stall) */);
  if (typeof window !== 'undefined' && window.SS) { window.SS.quality = 'ultra-low'; window.SS.autoLow = reason; }
  for (const f of lowHooks) { try { f(reason); } catch (e) { console.warn('goUltra', e); } }
  return true;
}
export function goLow(reason) {
  if (LOWQ) return false; QUALITY = 'low'; LOWQ = true; Object.assign(Q, LOW);
  try { if (!EXPLICIT && !PICKED) localStorage.setItem(KEY, 'low'); } catch (e) {}
  if (typeof window !== 'undefined') { window.SS_QUALITY = 'low'; if (window.SS) { window.SS.quality = 'low'; window.SS.autoLow = reason; } }
  for (const f of lowHooks) { try { f(reason); } catch (e) { console.warn('goLow', e); } }
  return true;
}
export function setQuality(v) { try { localStorage.setItem(KEY, v); localStorage.setItem('ss.qualityPick', '1'); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete('q'); location.replace(u.toString()); }
if (typeof window !== 'undefined') window.SS_QUALITY = QUALITY;
