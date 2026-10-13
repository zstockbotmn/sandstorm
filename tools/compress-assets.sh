#!/bin/sh
# Compress accepted raw art: assets-src/meshy/*.raw.glb -> assets/models/<name>.glb (WebP textures sized by kind via
# tools/compress.mjs, then gltfpack meshopt -cc). Skips assets-src/meshy/rejected/ and *.thumb.png (thumbnails are review-only).
set -e; cd "$(dirname "$0")/.."; mkdir -p assets/models
for f in $(find assets-src/meshy -maxdepth 1 -name '*.raw.glb' 2>/dev/null | sort); do b=$(basename "$f" .raw.glb)
  node tools/compress.mjs "$f" /tmp/ss_$b.glb && npx gltfpack -i /tmp/ss_$b.glb -o assets/models/$b.glb -cc -kn -km; done
ls -la assets/models; echo compress done
