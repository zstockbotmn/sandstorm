#!/bin/bash
# Batch 3: rig the 3 fighters (fighter1 also gets 4 rifle clips shared by all), then street props (no pose).
set -u
cd /workspace/sandstorm
while pgrep -f meshy-batch2.sh >/dev/null; do sleep 10; done
R(){ grep "\"name\":\"$1\"" assets-src/meshy/ledger.jsonl | tail -1 | node -pe 'JSON.parse(require("fs").readFileSync(0)).refine'; }
node tools/meshy-rig.js fighter1 "$(R fighter1)" 89,528,98,177 || echo "FAIL rig fighter1"
node tools/meshy-rig.js fighter2 "$(R fighter2)" || echo "FAIL rig fighter2"
node tools/meshy-rig.js fighter3 "$(R fighter3)" || echo "FAIL rig fighter3"
run(){ node tools/meshy.js "$@" || echo "FAIL $1"; }
run prop_sandbags "realistic military sandbag barricade wall, stacked burlap sandbags, curved low wall, game asset" "dusty tan burlap sandbags, dirt" "" 12000
run prop_burnedcar "realistic burned out wrecked sedan car, scorched rusted metal, broken windows, no wheels, game asset" "charred black and rust orange metal, ash, soot" "" 15000
run prop_drum "realistic rusty steel oil drum barrel, dented, faded blue paint, game asset" "rusty dented steel, faded blue paint, dust" "" 4000
run prop_crates "realistic stack of old wooden shipping crates, three crates stacked, game asset" "weathered wooden planks, dusty, stenciled markings" "" 6000
run prop_cart "realistic wooden market vendor cart with two wheels, empty, Middle Eastern street market, game asset" "weathered wood, faded cloth canopy, dust" "" 12000
echo BATCH3 DONE
