#!/bin/bash
# Batch 2: regenerate failed buildings with NO pose (pose_mode omitted). Same prompts as batch 1.
set -u
cd /workspace/sandstorm
run(){ node tools/meshy.js "$@" || echo "FAIL $1"; }
run bldg3 "realistic Middle Eastern market shop row, roll-up metal shutters, cloth awnings, signage, single story, game asset" "dusty concrete, faded colorful awnings, rusty shutters" "" 20000
run bldg4 "realistic damaged Middle Eastern concrete building, bullet holes, partially collapsed corner, rebar, two story, game asset" "scorched grey concrete, dust, exposed rebar" "" 20000
