# Sandstorm queue (after m1u publish + tester replay)
**APPROVED (App PM 12:35, relaying Zack): run steps 1-6 per /workspace/pm/sandstorm/dev-plan.md in order after m1u publishes; publish each after the suite passes on High+Low and send App PM a priority note per publish. Decisions: #1 NO paid tools ever (Zack, 12:36): UAL Source dropped; strafes from KayKit + CMU + procedural only; #2 one combined cheap post pass on iPhone, auto-off when fps drops; #3 no Freesound, use Kenney CC0 + synth; #4 set pieces can hurt with ~1 s warning, never an instant kill. Credit CMU mocap (mocap.cs.cmu.edu) in credits/README. Heavy jobs one at a time with the tester.**
**Coding split (App PM 12:37, replaces the earlier note): minor coding (small fixes, tweaks, wiring, tests) can be done directly. New systems (blend layer, procedural strafes, hit reactions, pacing director, shaders) go through Grok Build (`grok -p`) in small prompt steps.**
North star (Zack): "I love to feel like I am in the game and it's real, with real danger and excitement. It doesn't need to be fast-paced high adrenaline all the time. It should slow down at times, have high intensity moments." Quiet tense stretches -> sharp peaks -> release.
Order (App PM, Oct 17 12:03): m1u -> 1 movement -> 2 hit reactions -> 3 immersion pass -> 4 building interiors -> 5 set pieces. Publish each, full suite both tiers, report each.
Approved by App PM Oct 17 12:07. Per step: FIRST survey best free, no-login, open-source options for Three.js on iPhone Safari (three-mesh-bvh, Rapier, Quaternius/Kenney/CC0 mocap clips, CCDIK or similar IK, recast-navigation-js navmesh, interior-mapping shaders, meshoptimizer, KTX2/basis), pick best fit, write choice + why in notes/DECISIONS.md, send App PM a short tool-choice note as the step starts, then build with Grok Build. Paid/login tools need Zack OK.

1. TOP: enemies move like real people. Smooth locomotion blending (walk/run/strafe/crouch, turn-in-place, accel/decel, foot planting, no sliding/snapping), realistic cover entry/exit and peeking, natural reloads and idle fidgets. Free CC0 anim (Quaternius etc, no login); root motion / foot-lock IK. Add tests for foot sliding (foot world-velocity while planted) and snapping (pose delta per frame).
   - Step 1 / 3a follow-up (App PM, m2a, tester m1za "last-enemy grind"): after ~20-25 s pinned on one cover point, the LAST
     enemy of a wave repositions to another cover or falls back (exposed while moving). No extra HP. Not rushed: do it with 3b
     (cover AI), behind ?loco=2 first.
2. Per-body-part hit reactions: arm jerk then clutch with free hand (IK), weaker aim; leg stumble then persistent limp/slower; torso stagger; head/kill ragdoll. Persistent wounded state. Test zone detection + reaction plays. Smooth on iPhone.
3. Immersion pass (scale by tier, CC0 audio only):
   - Danger: edge damage arc (done m1u), near-miss whizz, dust/plaster puffs near player.
   - Tension: shake + muffled hearing on close blasts, breathing/heartbeat at low HP, blur clearing in cover.
   - Presence: head bob, weapon sway, camera dip on cover move, shell casings, muzzle flash lighting walls, truck dust.
4. Buildings: (a) interior-mapping fake-depth room shader on ALL windows, a few randomized room atlases (furniture, lighting, curtains), cheap on iPhone, flat-texture fallback on ultra-low. (b) A few real enterable ground-floor rooms with open doorways (doors can swing) that enemies step out of / fall back into via real paths, never window pops. Keep draw calls in check.
5. Set pieces + pacing: quiet walk -> sudden contact -> occasional truck crash / RPG strike -> short calm with regen. No instant heal.
Off list: living soundscape, smarter AI, voiced radio (callouts text-only).
Known (b1, test/hitvol-margin.js): with the forearm-over-chest fix the chest kill is 2 hits (spec). The margin check is flaky
by ~1 cm: 20 m crouch head measured 10 cm in one b1 run and 14 cm (> 13 limit) in the next (pose/idle variance). Not loosened again.
B1 NOT PUBLISHED (App PM, 08:39): b1 + the 11 s walk are folded into the steps 1-5 bundle; no public builds until it ships.
Old note - Known (m2a, test/hitvol-margin.js): a chest shot at 20 m sometimes takes 3 hits (limb,body,body) - the aiming forearm sits
in front of the chest and the first round registers as a limb hit (34). Margins pass (crouch limb volumes <= 12 cm past the
mesh after the box->cylinder change, limit 13). Candidate fix later: rank body over limb when the torso capsule is within
~0.35 m behind a forearm hit (firstHit rank already does this when the ray reaches the capsule).
Rules: one heavy job at a time (coordinate with tester), no Meshy spend without me, arms opt-in until gloved grip reads right.

## RESUMED (Oct 20, 10:16 PM ET, Zack via App PM)
Order: peek polish (3d, done 2a4118d) -> p1b fixes (last-enemy reposition never fired in play, static fights, stacking) -> step 2 hit reactions (2a done) -> internal preview A -> step 3 sensory -> step 4 buildings (preview B) -> step 5 set piece -> ONE bundle release.
- p1b reposition: hold clock now follows the cover AREA (reset only on a > 5 m move), failed picks retry in 3-5 s, pick widens in 3 tiers with its own 6-42 m pool (was clipped to the last spawn's 10-20 m window). Non-last fighters also move after 15-30 s on one area (x1.6 when suppressed), one at a time, >= 8 s apart. Cover slots reserved + 1.8 m spacing (anchor, stand spot and body) and a spread bonus. Tests: test/loco-relocate.js (real level, ~1 fps, default timers), loco-cover repos leg on the default timer.
- p1b teleport (App PM, Zack: no popping): loco-relocate reloc3 caught the last fighter warping 11.8 m via toVisibleCover (exposed, phase 'fire'). Now, with ?loco=2/repos=1: the unseen/stuck/behind/stall rescues (toVisibleCover, toSeenSpot) never act on a fighter that is firing or that the player can see (retry later); a ground fighter RUNS to the visible cover via startReposition (cover exit, exposed, 'Moving!'); a warp is left only for no-run cases (no cover / elevated) and only when BOTH the start and the target spot are off screen, else it steps out and fights where it is. Stuck fighters are still brought into view, never removed. Teleports are counted (e.teleports, SS.lastTeleport).
- NOTE for step 3: the opening gunfire build-up is text/audio only. Add VISUAL build-up: distant tracers and muzzle flashes down the street before contact (tester p1b).
- Box caveat: at 0.7 fps the game advances at most 0.2 sim-s per frame (4 x 50 ms catch-up), so 200 s wall is only ~28 sim-s. Timers are sim time (correct for real phones).

## PAUSED (Oct 18, 2026, 10:25 AM ET, Zack via App PM)
Step 1 state on step1-movement: blendspace + measured clip directions, facing (yaw capped 270/240/300 deg/s, 40-deg re-plant step OK'd), cover 3a/3b, last-enemy reposition 3c all built and tested (loco-cover, loco-facing green). Internal preview A0 = ss-ee912e469c (tools/preview-step1.sh, localhost:8850; server stopped).
Not started: peek polish (prompt drafted at tools/prompts/step1/3d-peek-polish.txt), step 2 hit reactions (prompts drafted in tools/prompts/step2/, tool note in DECISIONS.md draft).
Open: strafe coverage at 26 m (78% vs 90%), crouch-head hit-volume trim (10-14 cm vs 13), deterministic foot-slide test. b1 + 11 s walk are on main 280a9a4, unpublished (bundle rule). Live remains m2a ss-556a20f839.

## Step 4 (buildings) notes from tester A4 (2026-10-21)
- Far skyline is plain flat sand-coloured boxes (no texture, no silhouette). Give it cheap detail: a window-grid / facade atlas
  (one shared texture, world-scaled UVs or a shader grid), varied rooflines (parapets, water tanks, stair huts, antennas,
  domes/minarets as a few instanced shapes), slight colour variation per box. Must stay ~free on iPhone (merged geometry,
  one material, no extra draw calls per box).
- Meshy texture residue: bldg2's ground-floor masonry block was a stretched/smudged patch (A4: boarded over with a CC0
  planks panel); review the other Meshy facades for similar low-res patches when step 4 swaps/extends buildings.
- Burnt cover car hood map is 512 px stretched (A4: world triplanar CC0 rust detail on top faces); a better car asset is a step 4 option.

## Step 5 (set piece / pacing) note from tester A4
- The quiet rail between waves has little to do. Give it texture without losing the calm: distant skyline fights (3d),
  radio chatter, civilians/dogs crossing far ahead, a pickup or a look-around moment, a scripted vehicle pass; no combat.

## Step 4c follow-ups (2026-10-21)
- 4c rooms exist only on procedural buildings (Low / Ultra-low off / ?bld=4p); art buildings on High need a cut or a separate room shell (follow-up).
- Enemy use of rooms: a 'room' cover point is pushed inside each room but no AI type list uses it yet ('door' would trigger left/right peeks into the 0.3 m jambs). Follow-up: a 'room' behaviour (stand back in the shadow, fire through the doorway, no sidesteps).
- Cost: ~22 meshes per room (addBox per piece), <= 1 room per segment at 35%; merge per material if the perf run shows it.

## A8 (queued Oct 21 11:44 AM ET; blocked: account out of Grok Bot usage)
App PM ruling (Oct 21, tuning call): ducked behind solid cover = NO direct hits from the front arc.
Damage while ducked only from (a) a flanker with a clear line: FLANKED cue + hit arc, 1-2 s tell before its first hit;
(b) set-piece blasts with ~1 s warning. Keep the exposed ramp high. Enemies flank now and then so hiding forever isn't safe.
Pressure while ducked = suppression (cracks, cover-lip dust/chips, shake).
Also from the A7 test: cover-lip/wall-behind impacts and shake not seen (hold >= 2 frames/250 ms); visible arc wedge + flinch;
full-screen flash ~60%; Low wall dust still a pale 25 px puff (check the Low path, game-time lifetime; verify by screenshot at 15 m);
a small ducked/exposed HUD indicator. Tester feel sessions: Ultra-low (~40 fps) + one short Low visual pass.
STATUS 12:40 PM ET: all 5 items coded + pushed (b1ad6a1..HEAD). threat Low PASS (before SS.cover fix), walldust15 Low PASS, a8-hud Low PASS.
Remaining: rerun threat Low + Ultra-low and fx3 Low on the SS.cover build, rebuild 8850 as 'preview A8', report + tester checklist.
Then the step 4 run list (window-table.mjs, bld=4p/bld=4 screenshots, skyline, perf) and the art-building rooms follow-up.

## Step 5 (started Oct 21 1:10 PM ET, behind ?sp=5)
- Prompts: tools/prompts/step5/5a..5f. 5a RPG strike done (b71149f, Grok, reviewed; smoke-checked via a8-hud: tell ~1.3-2.5 s, dmg ~18, HP 82).
- Next: 5b synth whoosh/boom/engine (audio.js), 5c truck moment, 5d quiet-stretch texture, 5e pressure curve, 5f tests.
- 5a polish to do: rocket is small / hard to see mid-flight at 24-38 m (bigger glow + brighter trail); launch point can sit inside a facade (x 5.2-6.7).
- A8 follow-ups 1-5 done (q parse + keep q, FLANKED on flanker side, thinner Low ducked haze, Ultra-low chips, DPR floor 0.75).

## A9 (2026-10-21) - preview A9 = ss-5caec8104c on :8850 (sp=5 default, rpg=1 off)
- 1 camping grenade under set-piece rules (<=30, >=5 HP floor, only inside 3 m; switch/grenade moves >= 3.4 m) - 2f3553f
- 2 step5 5b audio (whoosh / boom / distance-delayed launch thump) via Grok - 417c23a; boom double-muffle removed - 0fd0f45
- 3 RPG reads at range (1.6x, motor core+halo, raycast-checked roof/window/alley launch) - 94e28f2; smoke was invisible (light on beige) -> dark 0x4f4943, real-time puff life - 0fd0f45, 7670ed1
- runs: threat Ultra-low (real) PASS x2; walldust15 Low PASS; rpg-wave Low (real wave sp=5&rpg=1, haze shot, escape + no-escape grenade) PASS
- next: 5c truck moment, 5d quiet-stretch texture, 5e pressure curve, 5f tests

## Step 5 status (2026-10-21 2:35 PM ET)
- 5c truck moment: 2f432bd (code only, not yet run). Needs: a ?sp=5&truck=1 run (Low + Ultra-low): headlights face the camera (Kenney truck_mil front = +z?), tell >= 1.2 s, crash clear of colliders/props, 1-2 fighters re-path from the wreck, dmg <= 20 & >= 5 HP, no RPG overlap.
- 5d quiet-stretch texture: prompt rewritten (fire, radio chatter, dog, door slam, far heli; ambient director only with no wave and no live enemy, >= 6 s after a wave); NOT run yet (did not fit the 30-min chunk).
- 5e pressure curve: NEXT CHUNK (prompt tools/prompts/step5/5e-pressure-curve.txt; review it against the RPG/truck/ambient timings first).

## A10 (2026-10-21 3:30 PM ET) - preview A10 = ss-e6e675ccaa on :8850 (sp=5 default, rpg=1 / truck=1 off)
- 5d ambient 983fbd3; 5e Grok output parked as tools/prompts/step5/5e.patch (08656f3), NOT applied - next chunk: re-check vs A10 set-piece gap, apply, run threat Low/Ultra-low.
- A9 tester fixes: 78acace (perf pr, grenade trigger + gap + ring, Ultra chips, quality label), e6bba82 (RPG launch/variety/gap), 12f7ff7 + 8d0013c + 91d49c9 (truck facing, lamps, fog; orange flash)
- Ultra-low perf (1280x800 swiftshader, live wave): pr 0.4 3.28 fps / 0.5 2.89 / 0.6 2.39 / 0.75 1.89; draws 66, tris ~186k, fx <= 4 -> pixel-bound; Ultra-low now 0.6, 0.5 if < 20 fps 4 s.

## Step 5e/5f (2026-10-21 3:40 PM ET) - code only, nothing run
- 5e applied by hand 5cfe97f (behind sp=5; ?press=0 kill switch; SS.pressForce for tests). 5f draft test/pressure.js 1eddb35.
- Run list (one at a time): pressure.js Low (2 runs) + Ultra-low (1); threat.js Low + Ultra-low with sp=5 (and with &press=0) for no regression; rpg-wave + truck Low (grenade/RPG gap with the shorter camp threshold); quick visual of a late wave (SS.pressForce=1) for 4-fighter waves.

## A11 (Oct 21)
- 1 grenade wave 3 (7bd892d): any thrower within 40 m (roof fallback), starved grenade beats forced RPG/truck, gap 3 s once certain. Trigger = cover.state 'in' (same as HUD IN COVER).
- 2 RPG damage 10-30 by distance + jitter (direct 24-30, edge 10-13, cover 18-30), 5 HP floor; hurt log names source (rifle / rifle, flank / RPG / grenade / truck). Tester's -18s were rifle hits.
- 3 truck crash kick 0.55-1.1 + 9 impacts + 7 chunks (Ultra-low 3/3); SS.truckCrash.
- 4 calm 15-25 game-s after every clear (SS.calmUntil, not cut by 5e); ambient fires 2-3.5 s into calm then every 5-8 s. Root cause: SS.bursting window vs ~5 s gaps.
- 5 near misses: max 1 per 1.5-2 s, closer louder.
- 6/7 SET PIECE pinned block in debug sound log (12 s); FORCED tag in debug.
- Tests: test/a11.js, truck.js crashFx, pressure.js (wave-1 softening normalised).

## Step 4 run list + art-room follow-up (prepared Oct 21, 5:45 PM ET; NOT run - tester on A11)
- tools/step4-runs.sh [from-step]: one job at a time via tools/run.sh (hard timeout each), logs + summary in logs/step4/.
  Order: 1 window-table.mjs (writes assets/models/windows.json - it does not exist yet, so art windows have never been placed;
  review + commit it) -> 2 build -> 3-8 test/bld4-shots.js low/high/ultra-low x bld=4p/4 (street, facades, room, sky) ->
  9 fx3-sky.js Low with bld=4 (skyline) -> 10 test/perf-bld4.js (Low + Ultra-low, bld=4 vs off: fps, calls, tris) ->
  11 rpg-wave Low -> 12 a11 Ultra-low -> 13 truck Ultra-low (A11 leftovers).
- New tests (unrun): test/bld4-shots.js, test/perf-bld4.js.
- 4e art rooms (4c2 cut exists, never seen): prompts tools/prompts/step4/4e0 plan + 4e1 windows over the opening, 4e2 atlas
  palette linings, 4e3 merge room meshes, 4e4 clip-loop cost + ?rooms=0. Run step4-runs.sh first (baseline), then 4e1-4e4, then again.

## A12 (Oct 21, preview A12 = ss-ba04818a30 on 8850)
- RPG starvation: launch needed SS.bursting (8-14 s spawn window) -> truck tell/crash + 8 s gap + starved grenade pushed it past the window every wave. Now gated on SS.waveActive; a starved grenade holds it <= 6 s. rpg-forced Low PASS 6/6 waves.
- FORCED tag top-right; bldg4 end walls capped (the "black and white panel" = stretched Meshy soot end wall); camera personal space 2.4 m push / 1.0 m hide.
- Flank rifle 19 = base rifle damage (18-22 by difficulty) without the 0.6 ducked softening (flank rule, A8): intended.
- windows.json: tool fixed (units, +Z, recesses) but PROVISIONAL (4/6/4/2 windows) - 4b tuning pass needed before 4e.

## A13 (Oct 21, 8:20 PM ET; code only, tester on A12 - NOT built / run yet)
- 1 RPG vs cover: in cover with the box between blast and head (ray), or ducked with the blast on the enemy side, dmg x0.40-0.50, dust + debris off the cover top/front, log '(RPG, cover)'; full otherwise; cap 30 + 5 HP floor kept.
- 2 truck waves: RPG held while the wave's truck is pending (< 20 s), then until bail-out + 12 s (SS.truckBailAt).
- 3 random mode: fireAt 10-26 s; 4.5 s lull after a rifle flank hit (SS.lastFlankHitSim). Forced unchanged.
- HUD untouched (no numeric HP).
- Drafted checks: rpg-forced.js (bail +12 s, shielded <= 15 + '(RPG, cover)', 'random' config spread), a11.js (shielded vs full split).
- Rerun when the tester is done: node tools/build.js; tools/run.sh 1500 node test/rpg-forced.js low logs/a13/rpg-forced;
  tools/run.sh 1500 node test/a11.js low logs/a13/a11; tools/run.sh 900 node test/rpg-wave.js low logs/a13/rpg;
  tools/run.sh 1200 node test/truck.js low logs/a13/truck; then preview A13.

## A13 — room reachability (for PM, step 4 issue)
- Tester A12 "rail stops ~17 m short of the souk": not a rail stop. The walk is endless past the 200 m goal; the tester's
  budget ended at ~183 m (0.5x sim). Rooms (bld=4, Low/High only) appear on segments with originZ < -30 at 35% each,
  so a room is usually passed within the first ~40-120 m.
- But the rail is the street centre (x=0) and the doorways sit on the facades (x=±6.2): normal play walks PAST rooms and
  never enters one; the 'room' cover point is used by no AI and never picked by player cover. => STEP 4 ISSUE: rooms must
  sit on the walked rail (e.g. a rail detour/cover stop in the doorway) to be reachable in play.
- Debug: ?debug&bld=4 then G (R is reload) jumps to 2.5 m short of the nearest room doorway ahead, facing it, holds the
  walk (G again or 25 s resumes; enemies reset). &room=1 does it at start.
- Notes: RPG hitting IN COVER -> A13 item 1 (shielded ~45%, '(RPG, cover)'). Natural wave-3 truck without truck=1 = intended.

## 4e5 — doorway cover stop (PM approved 8:46 PM, part of 4e) — DRAFTED, NOT RUN
- Plan: tools/prompts/step4/4e5-doorway-plan.txt. Grok chunks: 4e5a-doorway-walk (world door data, enemies
  deferWaveTo/waveNow + doorHold gate, new src/doorstop.js Bezier veer in/out, main hook), 4e5b-doorway-cover (cover.takeDoor,
  jamb = cover surface so the normal front arc/flank rules apply, door duck counters, HUD 'IN COVER · DOORWAY'),
  4e5c-enemy-doorway (optional: one fighter per wave walks into another room's doorway).
- Test draft: test/doorway-stop.js (once only, IN COVER kind 'door' ducked, front hits 0 with front shots > 0, detour
  walk 11 +- 1.5 s, absent with rooms=0 and Ultra-low, frame screenshot). syntax-checked only.
- Interpretations to confirm with PM: "walk ~11 s" = the detour's walking time (in + out, fight excluded);
  ?rooms=0 turns off the doorway stop + enemy doorway use (rooms are still drawn).
- Order (after the tester finishes A13; one heavy job at a time): 4e1 -> 4e2 -> 4e3 -> 4e4 -> 4e5a -> 4e5b -> build +
  test/doorway-stop.js -> 4e5c -> step4 shots/perf regressions (tools/step4-runs.sh) -> rpg-forced/a11 quick reruns -> preview.
  Not merged with 4e1: 4e1-4e4 all edit addRoom; 4e5a only adds door data on top.

## A14 (tester pA13 parts 1+2)
1 Flank fairness: only the fighter that made the flank move (still at its arrival spot) can land flank hits; others
  outside the arc = front (misses). Line = muzzle -> head or torso clear of the cover box + buildings. 5 s lull after a
  flank hit, an RPG hit or an RPG launch. Cause: any fighter outside the 60 deg arc counted (drifted / passed fighters),
  flank shots got the exposed hit ramp, and only the 0.9 s global spacing applied.
2 RPG waits 6 s after a flank hit in every mode (was random-only 4.5 s).
3 Grenade: gate now uses max(burstIndex, waveClears+1) (WAVE CLEARED can fire mid-burst, e.g. after K kills, leaving
  burstIndex behind - the likely part-1 miss); 'gren: <why>' every 5 s; 'grenade thrown Dm'. test/nade-normal.js.
4 Calm: first ambient 2-3 s after each clear, logged 'ambient <kind> (calm +Ns)', SS.calmLog; radio logs.
5 Sound log: 'kill (head|torso|limb)', 'wave N clear'.
6 Label: window.__SS_LABEL from preview-step1.sh -> corner tag '<label> · build ss-…' (menu + play, no debug needed).
+ Director (random sp=5): wave 1 quiet, then rpg/grenade/truck/quiet, never twice in a row (SS.spPick). Forced unchanged.
+ Room jump: G always jumps (next room), W walks on, 40 game-s hold. + CC0 textures: room wood/rug, bldg4 end caps.
+ HUD: streak below the IN COVER tag.
Then: window-table tuning, 4e1-4e4, 4e5.

## A15 window-table tuning (light, not built / not run in a browser)
- tools/window-table.mjs: local-contrast darkness (13x13 neighbourhood, >= 28% darker, not the absolute < 0.22 that the
  bright Meshy facades never hit), shallow recess 0.05-4 m (was 0.12), 3x3 closing, two passes (recess components first,
  then dark-only components away from them, fill > 55%) so dirt/sill cells no longer chain windows into one blob, shop
  windows up to 3.4 m when >= 1.2 m tall, and a row x column grid prior that fills slots with >= 30% evidence (inferred:true).
  Flags: --dry (no write), --map=bldgN (ASCII: # recess, d dark), --list (positions in m). ~10 s, pure node.
- Counts (bldg1-4): before 4/6/4/2, after 12/14/4/9 (1 inferred on bldg1). bldg3 (souk, 5 m tall arcade) stays low.
- ?bld=4&winDbg=1 draws every table rect: green placed, yellow placed+inferred, red skipped (low/door/tier/occluded);
  SS.winDbg counts. Verify by eye on Low/High before trusting the table.
- Run order after the tester: build -> winDbg look (Low + High screenshots) -> tools/step4-runs.sh (shots/skyline/perf) ->
  4e1 -> 4e2 -> 4e3 -> 4e4 -> 4e5a -> 4e5b -> doorway-stop.js -> 4e5c.

## A15 (tester A14 notes, pA14) - code done, NOT run (tester mid-session)
- 1 flank tell: the bypass was the old re-arm (a new tell only after 5 s with no flank SHOTS) - a flanker shooting every
  2-3 s reused one tell for hit after hit. Now a tell buys ONE hit 1.5-5 s later; the hit consumes it; older tell -> re-shown.
- 2 flank cap: <= 2 flank hits/wave (flankCapBlocked); a flanker with 2 hits (or at the cap) runs back to front-arc cover (flankRetired).
- 3 stall push: 15-20 game-s with no kill/advance -> farthest ground fighter runs to cover >= 5 m nearer (advanceNearer;
  'enemy advances Nm'; SS.stallPushes / stallPushLog).
- 4 grenade re-arm: <= 2/wave, camp timer restarts at a throw, 2nd needs the full 'certain' time; gren: lines continue ('cap 2/wave').
- 5 set-piece spacing 15 s (RPG / truck / grenade; starved-grenade 3 s exception removed). SS.spLog for checks.
- Check: test/a15.js (random + forced). Risk: a11's forced-flags grenade case may now wait longer (15 s gap).

## A23 → A24 (Oct 22–23 ET)
- A23 tip 8c9bd95 / ss-4aa357a708: Immersion 4 · Fun 4 · Graphics 4 · Ease 4 · Depth 3 (first Fun 4).
- A24 tip 935bfdb / ss-c9bf0052be "internal preview A24" on 8850: last-stand ~4–6s stand before flee; AREA CLEAR sole banner ~3.8s + clear radio always; camera AABB unstick; ?w4end=1; a15/a11 Low PASS.
- A24 scores (pA24, ~1:08 AM Oct 23): Immersion 4 · Fun 4 · Graphics 4 · Ease 4 · Depth 3 (held). Cover/quiet/AREA CLEAR/last-stand timing PASS; climax grenade|flank in-event PARTIAL; camera unstick NOT OBSERVED; w4end grows via mid-wave push; first load stale SW until site data cleared.
- Tester ranked: (1) climax always grenade|flank in-event (2) fairer last-stand shootable (3) w4end suppress mid-wave (4) bust SW on preview deploy (5) camera unstick debug hook.
- WAITING App PM: thin A25 for 1–4 vs resume winDbg + step4-runs + Grok 4e1–4e5 / doorway-stop. Dev rec: A25 first (depth still needs interiors track later).

## A25 (App PM Oct 23 ~1:09 AM ET — DONE Oct 23 ~3:25 AM ET)
DONE: build ss-b63efd2aff, label 'internal preview A25', preview :8850. Tests PASS: a11; a15 random (a15-random2: 5/5 climaxes have in-event grenade; last-stand holds 4.1–5.9 s, kill-clear 3/5, flee-after-stand 2/5); a15 forced; a15 w4end (w4AliveMax 2, midPush 0). Code: 0788674, 2c77074, 6dd1154. Camera-unstick hook skipped.
Thin polish, no new systems. After scores hold 4+ → winDbg → step-4 rooms / doorway stop (depth).
1. Every climax always grenade OR flanking pair (in-event; no bound+suppress-only)
2. Fairer last-stand hit target; keep ~5 s exposed window; kill-clear common
3. w4end: suppress mid-wave reinforcements (stay ~1–2)
4. Bust SW cache on every preview deploy
5. Optional cheap camera-unstick debug hook only if free

## A25 scores (App Tester ~3:53 AM ET Oct 23) — WAITING PM
Immersion 3 · Fun 3 · Graphics 4 · Ease 4 · Depth 3 (down from A24 4/4/4/4/3).
PASS: SW bust, climax in-event grenade, w4end no mid-wave, AREA CLEAR + flee radio, quiet ~13s, cover chip.
FAIL: last-stand charge→stand missing (straight flee ~26s alone); exposed climax HP bottom 63 (Moving cover / auto-cover after 1 hit).
Rec A26: restore rush→stand 4–6s; sustain climax exposure for HP 35–50; keep A25 wins. Then re-score before winDbg/step-4.

## A26 (App PM Oct 23 ~3:53 AM ET — DONE Oct 23 ~6:20 AM ET)
DONE: tip 093e3c8, build ss-251ae99e75, label 'internal preview A26', preview :8850 HTTP 200. Tests PASS (logs/a26): a15 expose (cxHp W2=42 W3=36 W4=35); a15 w4end (rush→stand 5.8s, aliveMax 2); a15 forced; a15 random; a11 Low. Code: 595d709, 0890ef5, 093e3c8. Next: tester rescore, then winDbg → step-4 rooms/doorway.
Fix-only. After scores hold Immersion/Fun 4+ → winDbg → step-4 rooms/doorway (depth).
1. Restore last-stand charge → open stand ~4–6s before flee; force rush on w4end
2. Climax: while scoped/exposed, no grenade Moving-cover yank; HP can reach ~35–50; ducked + 35 floor kept
3. Keep A25 wins (SW, climax grenade|flank, w4end size, AREA CLEAR + flee radio, quiet)
4. Mix flank into some climaxes when prior climax used grenade

## A27 (App PM Oct 23 — DONE Oct 23 ~9:05 AM ET)
DONE: tip cbb0d67, build ss-957b1b79a3, label 'internal preview A27', preview :8850 HTTP 200. Tests PASS (logs/a27): doorway-stop Low (walkS 12.3, count 1, door:in, duck.front=0 frontShots=10, rooms=0/ultra off); a15 w4end; a15 forced; a11 Low. Earlier: winDbg Low/High. Code: afb56c5 (no climax yank in cover), e4c9c11 (preview+winDbg), 4416bc3..945f96e (4e1–4e4 rooms), f4e704d (4e5a+b doorway stop), 3530028 (4e5c enemy doorway), 28679cf+5077d8a (walk length + sticky door cover). Protects A26 wins (last-stand, climax 35 floor, flank mix, SW, w4end, AREA CLEAR, ducked muffle, no-yank-in-cover).
Known: doorway detour walkS 12.3 (inside 11±1.5); box ~1–2 fps so doorway/a15 wall times are long. ?rooms=0 keeps rooms drawn but disables doorway stop + enemy doorway. No GH Pages / no Tester-PM ping this ship.
Next: tester rescore A27 doorway + rooms depth.

