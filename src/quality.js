// Low/High quality. Order: ?q=low|high, then localStorage 'ss.quality', then the default:
// Low on iPhone/iOS and touch devices, High elsewhere. Changing it from the start screen saves and reloads.
const KEY = 'ss.quality';
function detect() {
  try { const m = /[?&]q=(low|high)\b/.exec(location.search); if (m) return m[1]; } catch (e) {}
  try { const v = localStorage.getItem(KEY); if (v === 'low' || v === 'high') return v; } catch (e) {}
  const ua = navigator.userAgent || '';
  const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
  // Automated / headless / software-GL browsers (the tester's replays) also default to Low.
  const auto = navigator.webdriver === true || /HeadlessChrome/i.test(ua);
  return ios || touch || auto || softwareGL() ? 'low' : 'high';
}
function softwareGL() {
  try { const c = document.createElement('canvas'); const gl = c.getContext('webgl'); if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    const lose = gl.getExtension('WEBGL_lose_context'); if (lose) lose.loseContext();
    return /swiftshader|llvmpipe|software/i.test(String(r)); } catch (e) { return false; }
}
export const QUALITY = detect();
export const LOWQ = QUALITY === 'low';
// Low: ~0.85 render scale, no postfx, no shadows, shorter LOD and draw/fog distance.
export const Q = LOWQ
  ? { res: 0.85, post: false, shadows: false, lodNear: 20, lodNearProp: 12, drawAhead: 95, fog: 0.022, far: 300 }
  : { res: 1, post: true, shadows: true, lodNear: 38, lodNearProp: 22, drawAhead: 140, fog: 0.016, far: 420 };
export function setQuality(v) { try { localStorage.setItem(KEY, v); } catch (e) {}
  const u = new URL(location.href); u.searchParams.delete('q'); location.replace(u.toString()); }
if (typeof window !== 'undefined') window.SS_QUALITY = QUALITY;
