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
- NOTE for step 3: the opening gunfire build-up is text/audio only. Add VISUAL build-up: distant tracers and muzzle flashes down the street before contact (tester p1b).
- Box caveat: at 0.7 fps the game advances at most 0.2 sim-s per frame (4 x 50 ms catch-up), so 200 s wall is only ~28 sim-s. Timers are sim time (correct for real phones).

## PAUSED (Oct 18, 2026, 10:25 AM ET, Zack via App PM)
Step 1 state on step1-movement: blendspace + measured clip directions, facing (yaw capped 270/240/300 deg/s, 40-deg re-plant step OK'd), cover 3a/3b, last-enemy reposition 3c all built and tested (loco-cover, loco-facing green). Internal preview A0 = ss-ee912e469c (tools/preview-step1.sh, localhost:8850; server stopped).
Not started: peek polish (prompt drafted at tools/prompts/step1/3d-peek-polish.txt), step 2 hit reactions (prompts drafted in tools/prompts/step2/, tool note in DECISIONS.md draft).
Open: strafe coverage at 26 m (78% vs 90%), crouch-head hit-volume trim (10-14 cm vs 13), deterministic foot-slide test. b1 + 11 s walk are on main 280a9a4, unpublished (bundle rule). Live remains m2a ss-556a20f839.
