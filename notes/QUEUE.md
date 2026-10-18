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
Rules: one heavy job at a time (coordinate with tester), no Meshy spend without me, arms opt-in until gloved grip reads right.
