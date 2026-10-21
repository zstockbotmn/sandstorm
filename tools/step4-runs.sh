#!/bin/bash
# Step 4 run list + A11 leftovers, ONE job at a time, each under a hard timeout (tools/run.sh also waits while any other
# headless run is active, so this never overlaps the tester or another agent's job). Logs: logs/step4/<n>-<name>.log.
# A failing job is recorded and the list goes on; the summary is printed at the end and saved to logs/step4/summary.txt.
# Never touches 8850 (the preview serves its own copy in /workspace/preview/step1), never publishes, no Grok / Meshy calls.
# Usage: tools/step4-runs.sh [from-step]   e.g. tools/step4-runs.sh 5 to resume at step 5
cd "$(dirname "$0")/.." || exit 1
L=logs/step4; mkdir -p "$L"; FROM=${1:-1}; N=0; SUM=()
job() { # job <secs> <name> <cmd...>
  local secs=$1 name=$2; shift 2; N=$((N + 1)); [ "$N" -lt "$FROM" ] && { SUM+=("$N $name: skipped (resume)"); return; }
  local log="$L/$(printf %02d $N)-$name.log"; echo "[$(date +%H:%M:%S)] $N $name (<= ${secs}s) -> $log"
  local t0=$(date +%s); tools/run.sh "$secs" "$@" > "$log" 2>&1; local rc=$?
  local verdict=$(grep -aoE '[A-Z0-9]+ (PASS|FAIL)( .*)?$' "$log" | tail -1 | cut -c1-160)
  [ "$rc" = 124 ] && verdict="TIMEOUT after ${secs}s"
  SUM+=("$N $name: rc=$rc $(( $(date +%s) - t0 ))s ${verdict:-}"); echo "    rc=$rc ${verdict:-}"
}

# 1-2: window table for the Meshy facades (writes assets/models/windows.json, new asset -> review + commit it), then rebuild dist
job 600  window-table   node tools/window-table.mjs
job 300  build          node tools/build.js
[ -s assets/models/windows.json ] && node -e "JSON.parse(require('fs').readFileSync('assets/models/windows.json'))" \
  && SUM+=("   windows.json ok ($(wc -c < assets/models/windows.json) bytes)") || SUM+=("   windows.json MISSING/INVALID: art windows will be skipped")

# 3-8: stills, bld=4p (procedural only) and bld=4 (art + interior windows + art rooms) on Low, High, Ultra-low (sky view = 4d skyline)
for t in low high ultra-low; do for b in 4p 4; do job 600 "shots-$t-bld$b" node test/bld4-shots.js "$t" "$b" "$L/bld4"; done; done

# 9: skyline flashes still land in view with the 4d roof detail on (Low, normal render: test=fast hides the backdrop rows)
job 900  skyline-low    env SS_QS='&q=low&bld=4' SS_N=3 node test/fx3-sky.js

# 10: perf, bld=4 vs bld off, Low + Ultra-low (fps, draw calls, triangles)
job 1500 perf-bld4      node test/perf-bld4.js "$L/perf-bld4.json"

# 11-13: A11 leftovers (default flags: no bld)
job 900  rpg-wave-low   node test/rpg-wave.js low "$L/rpg"
job 1500 a11-ultralow   node test/a11.js ultra-low "$L/a11"
job 1200 truck-ultralow node test/truck.js ultra-low "$L/truck"

printf '%s\n' "${SUM[@]}" | tee "$L/summary.txt"
