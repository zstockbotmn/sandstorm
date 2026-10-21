#!/bin/sh
# Compress accepted raw art: assets-src/meshy/*.raw.glb -> assets/models/<name>.glb (WebP textures sized by kind via
# tools/compress.mjs, then gltfpack meshopt -cc). Skips assets-src/meshy/rejected/ and *.thumb.png (thumbnails are review-only).
# A4: building far LODs are now UV-preserving: for b in bldg1 bldg2 bldg3 bldg4; do node tools/lod-uv.mjs assets/models/$b.glb assets/models/$b.lod.glb 0.35 0.02 16; done
# (the geometry-only LOD below drew one texel of the shared texture = the A3 smeared facades; do not regenerate bldg LODs with it)
set -e; cd "$(dirname "$0")/.."; mkdir -p assets/models
for f in $(find assets-src/meshy -maxdepth 1 -name '*.raw.glb' 2>/dev/null | sort); do b=$(basename "$f" .raw.glb)
  # Perf: simplify static art (buildings 35%, props 40%); rigged fighters/anims untouched.
  # Buildings: full mesh (seam-locked, UVs intact) + a geometry-only far LOD (<b>.lod.glb, -si 0.3 -sa; aggressive
  # simplification smears UVs up close, invisible past ~40 m). Props keep -si 0.35 -sa. Rigged fighters untouched.
  SI="" # full meshes everywhere; bldg*/prop_* get a far LOD below
  node tools/compress.mjs "$f" /tmp/ss_$b.glb && npx gltfpack -i /tmp/ss_$b.glb -o assets/models/$b.glb -cc -kn -km $SI
  case $b in bldg*|prop_*) LR=0.3; case $b in prop_*) LR=0.35;; esac; npx gltfpack -i /tmp/ss_$b.glb -o /tmp/ss_${b}_lo.glb -kn -km -si $LR -sa && node tools/strip-tex.mjs /tmp/ss_${b}_lo.glb /tmp/ss_${b}_lo2.glb \
    && npx gltfpack -i /tmp/ss_${b}_lo2.glb -o assets/models/$b.lod.glb -cc -kn -km;; esac; done
ls -la assets/models; echo compress done
