#!/bin/bash
# Runs each prompt file through Grok Build, commits after each. No tests (run separately).
cd /workspace/sandstorm
COMMON="Repo: /workspace/sandstorm (Sandstorm, landscape mobile web FPS runner, three.js, src/*.js, built by tools/build.js). Make a minimal focused change. Do NOT run test/m1.js or browsers, do NOT git commit, do not touch logs/, assets-src/, tools/meshy*. You may run 'node tools/build.js' to check it compiles. Vertical aim convention: camera.rotation.x = -input.pitch, and dragging up must decrease pitch (look up); keep that."
for f in tools/prompts/[0-9]*.txt; do
  echo "=== $f $(date +%T)"
  timeout 900 ~/.grok/bin/grok --always-approve -p "$COMMON

TASK: $(cat $f)" 2>&1 | tail -15
  node tools/build.js || { echo "BUILD FAIL after $f"; exit 1; }
  git add src index.html style.css tools/build.js test 2>/dev/null
  git commit -qm "$(head -1 $f) (Grok Build)" && git log --oneline -1
done
echo ALLDONE
