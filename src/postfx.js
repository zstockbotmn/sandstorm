import * as THREE from 'three';
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
} from 'postprocessing';

// iPhone, ?art=0, and software GL skip bloom + SMAA. Tone mapping stays on the renderer.
function wantLow(renderer) {
  try {
    const search = (typeof location !== 'undefined' && location && location.search) || '';
    if (/[?&]art=0(?:&|$)/.test(search)) return true;
  } catch (e) { /* no location */ }
  try {
    const ua = (typeof navigator !== 'undefined' && navigator && navigator.userAgent) || '';
    if (/iPhone|iPad|iPod/i.test(ua)) return true;
  } catch (e) { /* no navigator */ }
  try {
    const gl = renderer.getContext();
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    const gpu = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '') : '';
    if (/swiftshader|llvmpipe|softpipe|microsoft basic render/i.test(gpu)) return true;
  } catch (e) { /* no gpu string */ }
  return false;
}

export function createPostFx(renderer, scene, camera) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const low = wantLow(renderer);
  if (low) {
    return {
      low: true,
      render() { renderer.render(scene, camera); },
      setSize() {},
    };
  }

  // Composer does the ACES pass. Leave the renderer unmapped so it is not applied twice.
  renderer.toneMapping = THREE.NoToneMapping;
  const composer = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType });
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new BloomEffect({
    intensity: 0.22,
    luminanceThreshold: 0.96,
    luminanceSmoothing: 0.18,
    mipmapBlur: true,
    radius: 0.35,
    levels: 4,
  });
  const smaa = new SMAAEffect();
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.ACES_FILMIC });
  composer.addPass(new EffectPass(camera, bloom, smaa, tone));
  return {
    low: false,
    render() { composer.render(); },
    setSize(w, h) { composer.setSize(w, h); },
  };
}
