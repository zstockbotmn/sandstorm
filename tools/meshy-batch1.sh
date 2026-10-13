#!/bin/bash
set -u
cd /workspace/sandstorm
run(){ node tools/meshy.js "$@" || echo "FAIL $1"; }
run fighter2 "realistic Middle Eastern desert militia fighter, tan and olive clothing, keffiyeh headscarf wrapped over face, plate carrier vest, holding AK rifle, full body, game character" "realistic dusty tan fabric, olive vest, checkered keffiyeh" a-pose 20000
run fighter3 "realistic desert insurgent sniper, dark brown robe, black headwrap covering face, ammo bandolier, holding long rifle, full body, game character" "realistic worn dark brown cloth, black headwrap, leather straps" a-pose 20000
run bldg1 "realistic Middle Eastern two-story sandstone house facade, flat roof with parapet, wooden door, arched windows with shutters, game asset" "weathered sandstone plaster, dusty, wooden shutters" t-pose 20000
run bldg2 "realistic Middle Eastern three-story mud brick apartment building, flat roof, small balconies, satellite dish, game asset" "cracked beige plaster, rusted metal railings" t-pose 20000
run bldg3 "realistic Middle Eastern market shop row, roll-up metal shutters, cloth awnings, signage, single story, game asset" "dusty concrete, faded colorful awnings, rusty shutters" t-pose 20000
run bldg4 "realistic damaged Middle Eastern concrete building, bullet holes, partially collapsed corner, rebar, two story, game asset" "scorched grey concrete, dust, exposed rebar" t-pose 20000
