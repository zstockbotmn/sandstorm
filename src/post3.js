// Cheap DOM post look for ?fx=3. One overlay div: vignette, optional backdrop grade, warm tint, grain.
export function createPost3({ renderer } = {}) {
  const VIG = 'radial-gradient(ellipse at center, transparent, rgba(20,12,4,0.55))';
  const EPS = 0.02;
  const root = document.createElement('div');
  root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;';

  function layer() {
    const el = document.createElement('div');
    el.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
    return el;
  }

  const vig = layer();
  vig.style.background = VIG;
  vig.style.opacity = '0.55';

  let bf = null;
  let soft = false;
  try {
    if (typeof CSS !== 'undefined' && CSS.supports) {
      if (CSS.supports('backdrop-filter', 'grayscale(1)') || CSS.supports('-webkit-backdrop-filter', 'grayscale(1)')) {
        bf = layer();
        bf.style.display = 'none';
      }
      soft = !!CSS.supports('mix-blend-mode', 'soft-light');
    }
  } catch (e) { /* no CSS.supports */ }

  const grade = layer();
  grade.style.background = 'rgba(255,190,120,0.06)';
  if (soft) grade.style.mixBlendMode = 'soft-light';

  const grain = layer();
  grain.style.opacity = '0.06';
  grain.style.backgroundRepeat = 'repeat';
  grain.style.backgroundSize = '64px 64px';
  const url = grainURL();
  if (url) grain.style.backgroundImage = 'url(' + url + ')';

  // Backdrop under the vignette so hurt desaturates the scene and the red edge stays sharp.
  if (bf) root.appendChild(bf);
  root.appendChild(vig);
  root.appendChild(grade);
  root.appendChild(grain);

  const canvas = renderer && renderer.domElement;
  if (canvas && canvas.parentNode) canvas.insertAdjacentElement('afterend', root);
  else document.body.appendChild(root);

  const post = { mode: 'overlay', postOff: false, hurt: 0, blast: 0, grain: true };
  let postOff = false;
  let ultraS = false;
  let extraS = true;
  let opS = 0.55;
  let redS = 0;
  let gS = 0;
  let bS = 0;
  let grainT = 0;
  let prev = 0;
  let lowSince = 0;
  let highSince = 0;
  const dts = [];
  let dtSum = 0;

  function clearBf() {
    gS = 0;
    bS = 0;
    if (!bf) return;
    bf.style.display = 'none';
    bf.style.backdropFilter = 'none';
    bf.style.webkitBackdropFilter = 'none';
  }

  function track(now) {
    let fps = null;
    if (prev > 0) {
      const delta = now - prev;
      if (delta > 0 && delta < 10000) {
        dts.push(delta);
        dtSum += delta;
        while (dts.length > 1 && dtSum - dts[0] >= 2000) dtSum -= dts.shift();
        if (dtSum >= 2000) fps = (dts.length * 1000) / dtSum;
      } else if (delta >= 10000) {
        dts.length = 0;
        dtSum = 0;
        lowSince = 0;
        highSince = 0;
      }
    }
    prev = now;
    return fps;
  }

  function consider(fps, now) {
    if (fps == null) {
      lowSince = 0;
      highSince = 0;
      return;
    }
    if (fps < 24) {
      highSince = 0;
      if (!lowSince) lowSince = now;
      if (!postOff && now - lowSince >= 3000) postOff = true;
    } else if (fps > 30) {
      lowSince = 0;
      if (!highSince) highSince = now;
      if (postOff && now - highSince >= 6000) postOff = false;
    } else {
      lowSince = 0;
      highSince = 0;
    }
  }

  function publish(SS, mode, hurt, blast, grainOn) {
    post.mode = mode;
    post.postOff = postOff;
    post.hurt = hurt;
    post.blast = blast;
    post.grain = grainOn;
    if (!SS) return;
    const slot = SS.fx3 || (SS.fx3 = {});
    slot.post = post;
  }

  const ultra0 = typeof window !== 'undefined' && window.SS && window.SS.quality === 'ultra-low';
  if (ultra0) {
    ultraS = true;
    extraS = false;
    root.style.display = 'none';
    grade.style.display = 'none';
    grain.style.display = 'none';
  }
  publish(typeof window !== 'undefined' ? window.SS : null, ultra0 ? 'none' : 'overlay', 0, 0, !!extraS);

  function update(dt) {
    void dt;
    const now = performance.now();
    consider(track(now), now);

    const SS = typeof window !== 'undefined' ? window.SS : null;
    const ultra = !!(SS && SS.quality === 'ultra-low');
    let hp = 100;
    if (SS && SS.player && SS.player.health != null) hp = +SS.player.health;
    if (hp !== hp) hp = 100;
    let hurt = (45 - hp) / 35;
    if (hurt < 0) hurt = 0;
    else if (hurt > 1) hurt = 1;
    if (SS && SS.areaClearAt != null) { const dt = (SS.simTime || 0) - SS.areaClearAt; if (dt >= 0 && dt < 10) { const k = Math.min(1, dt / 1.5), back = Math.max(0, Math.min(1, (dt - 7) / 3)); hurt *= 1 - k * (1 - back); } } // A23: combat look eases out after a clear
    let blast = (SS && SS.fx3 && SS.fx3.muffle) || 0;
    blast = +blast || 0;
    if (blast < 0) blast = 0;

    if (ultra !== ultraS) {
      ultraS = ultra;
      root.style.display = ultra ? 'none' : '';
    }

    const showExtra = !ultra && !postOff;
    if (showExtra !== extraS) {
      extraS = showExtra;
      const disp = showExtra ? '' : 'none';
      grade.style.display = disp;
      grain.style.display = disp;
      if (!showExtra) clearBf();
    }

    if (!ultra) {
      const edge = hurt > blast ? hurt : blast;
      const op = 0.55 + 0.4 * edge;
      if (Math.abs(op - opS) > EPS) {
        opS = op;
        vig.style.opacity = (Math.round(op * 1000) / 1000).toString();
      }
      const red = 0.5 * hurt;
      if (Math.abs(red - redS) > EPS) {
        redS = red;
        vig.style.background = red > EPS
          ? 'radial-gradient(ellipse at center, transparent, rgba(140,0,0,' + red.toFixed(3) + ')),' + VIG
          : VIG;
      }
      if (showExtra && bf) {
        const g = 0.6 * hurt;
        const b = 2 * blast;
        if (Math.abs(g - gS) > EPS || Math.abs(b - bS) > EPS) {
          gS = g;
          bS = b;
          if (g <= EPS && b <= EPS) {
            bf.style.display = 'none';
            bf.style.backdropFilter = 'none';
            bf.style.webkitBackdropFilter = 'none';
          } else {
            const f = 'grayscale(' + g.toFixed(3) + ') blur(' + b.toFixed(2) + 'px)';
            bf.style.display = '';
            bf.style.backdropFilter = f;
            bf.style.webkitBackdropFilter = f;
          }
        }
      }
      if (showExtra && now - grainT >= 1000 / 12) {
        grainT = now;
        grain.style.backgroundPosition = ((Math.random() * 64) | 0) + 'px ' + ((Math.random() * 64) | 0) + 'px';
      }
    }

    publish(SS, ultra ? 'none' : 'overlay', hurt, blast, showExtra);
  }

  return { update };
}

function grainURL() {
  try {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const g = c.getContext('2d');
    if (!g) return '';
    const im = g.createImageData(64, 64);
    const d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() * 256) | 0;
      d[i] = n;
      d[i + 1] = n;
      d[i + 2] = n;
      d[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return c.toDataURL();
  } catch (e) {
    return '';
  }
}
