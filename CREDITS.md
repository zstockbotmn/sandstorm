# Credits

Sandstorm uses these third-party assets and libraries. Versions match `package.json` unless noted.

## Art

| Asset | License | Source |
| --- | --- | --- |
| Fighter rigs, fighter1 animation clips, buildings (`bldg1`–`bldg4`), props (sandbags, burned car, drum, crates, cart) | Generated for this project on Zack's Meshy AI account. Meshy output terms apply to the account that created them. | https://www.meshy.ai/ |
| `noon_grass` 1k HDRI (`assets/env/noon_grass_1k.hdr`) | CC0 | https://polyhaven.com/a/noon_grass |
| `sand_01` diffuse / normal / ARM (`assets/textures/sand_01_*.webp`) | CC0 | https://polyhaven.com/a/sand_01 |
| `asphalt_01` diffuse / normal / ARM | CC0 | https://polyhaven.com/a/asphalt_01 |
| `dirty_concrete` diffuse / normal / ARM | CC0 | https://polyhaven.com/a/dirty_concrete |
| Universal Animation Library, Godot Standard (`AnimationLibrary_Godot_Standard`, retargeted to `assets/models/fighter.quaternius.anim.glb`) | CC0 | https://quaternius.com/packs/universalanimationlibrary.html and https://quaternius.itch.io/universal-animation-library — Godot Standard glTF used from the pack (also published via https://github.com/Quaternius/quaternius.github.io) |

Poly Haven downloads were resized to 512 webp. Quaternius clips were retargeted onto the Meshy fighter bones at build time (`tools/retarget-quaternius.mjs`). No Mixamo clips are used. Clips used: Walk_Loop, Jog_Fwd_Loop, Sprint_Loop, Crouch_Fwd_Loop, Crouch_Idle_Loop, Idle_Loop, Pistol_Aim_Neutral (aim + lean), Pistol_Shoot, Hit_Chest, Hit_Head, Death01 (all CC0).

## Code

| Library | License | Source |
| --- | --- | --- |
| three.js | MIT | https://github.com/mrdoob/three.js |
| @dimforge/rapier3d-compat | Apache-2.0 | https://github.com/dimforge/rapier |
| postprocessing (pmndrs) | Zlib | https://github.com/pmndrs/postprocessing |
| meshoptimizer / MeshoptDecoder (via three.js) | MIT | https://github.com/zeux/meshoptimizer |
| gltfpack | MIT | https://github.com/zeux/meshoptimizer |
| @gltf-transform/core and extensions | MIT | https://github.com/donmccurdy/glTF-Transform |
| esbuild | MIT | https://github.com/evanw/esbuild |
| sharp | Apache-2.0 | https://github.com/lovell/sharp |
| cannon-es | MIT | https://github.com/pmndrs/cannon-es — kept as a devDependency; ragdolls run on Rapier |
| playwright | Apache-2.0 | https://github.com/microsoft/playwright — tests only |

Game code in `src/` and `tools/` is part of this repository.

Step 3 textures (Poly Haven, CC0, 1k JPG -> WebP): beige_wall_001, plastered_wall_02, brick_wall_02, concrete_wall_008 (building sides/backs/roofs and background rows), hessian_230 (sandbags). https://polyhaven.com/license

First-person rifle: `assets/models/rifle_m4.glb` generated with Meshy (text-to-3D meshy-6, PBR refine) for this project, 40 credits (ledger 2026-10-14, 203 -> 163); optimized with tools/compress.mjs + gltfpack. The previous Quaternius AK47 stays as fallback.
