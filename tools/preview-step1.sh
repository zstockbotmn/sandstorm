#!/bin/bash
# Internal step-1 preview (NOT gh-pages). Rebuilds step1-movement, copies dist to /workspace/preview/step1,
# forces ?loco=2&repos=1&hits=2&fx=3&sp=5 by default (A9+; rpg=1 not forced), and serves it on http://localhost:8850/ (own origin = own service-worker scope).
set -e
cd /workspace/sandstorm-step1 && node tools/build.js >/dev/null
rm -rf /workspace/preview/step1 && cp -r dist /workspace/preview/step1
python3 - <<'PY'
p='/workspace/preview/step1/index.html'; s=open(p).read()
inj="<script>window.__SS_LABEL='internal preview A14';/* internal preview A14: step-1/2/3/5 flags on by default (loco=2, repos=1, hits=2, fx=3, sp=5; rpg=1 stays OFF); an explicit value in the URL wins */(function(){var q=location.search,add=[];if(!/[?&]loco=/.test(q))add.push('loco=2');if(!/[?&]repos=/.test(q))add.push('repos=1');if(!/[?&]hits=/.test(q))add.push('hits=2');if(!/[?&]fx=/.test(q))add.push('fx=3');if(!/[?&]sp=/.test(q))add.push('sp=5');if(add.length){location.replace(location.pathname+(q?q+'&':'?')+add.join('&')+location.hash);}})();</script>"
s=s.replace('<head>','<head>'+inj,1); open(p,'w').write(s)
PY
pkill -f "http.server 8850" 2>/dev/null || true
cd /workspace/preview/step1 && nohup python3 -m http.server 8850 --bind 127.0.0.1 > /workspace/preview/step1-server.log 2>&1 &
sleep 1; echo "serving $(grep -o 'ss-[0-9a-f]*' /workspace/preview/step1/sw.js | head -1) at http://localhost:8850/"
