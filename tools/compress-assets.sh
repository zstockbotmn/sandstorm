#!/bin/sh
# Compress raw art: assets-src/**/*.glb -> assets/models (textures 1024 WebP + meshopt -cc), assets-src/**/*.png|jpg -> assets/tex/*.webp
set -e; cd "$(dirname "$0")/.."; mkdir -p assets/models assets/tex
for f in $(find assets-src -name '*.glb' 2>/dev/null); do b=$(basename "$f" .glb)
  npx gltf-transform resize "$f" /tmp/ss_$b.glb --width 1024 --height 1024 && npx gltf-transform webp /tmp/ss_$b.glb /tmp/ss_${b}w.glb && npx gltfpack -i /tmp/ss_${b}w.glb -o assets/models/$b.glb -cc -kv; done
for f in $(find assets-src \( -name '*.png' -o -name '*.jpg' \) 2>/dev/null); do b=$(basename "${f%.*}"); node -e "require('sharp')('$f').webp({quality:82}).toFile('assets/tex/$b.webp')"; done
echo compress done
