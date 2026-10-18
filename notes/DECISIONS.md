
## Step 1 sources (Oct 17, free only)
- Have: UAL1 Standard (Idle, Walk, Jog_Fwd, Sprint, Crouch_Fwd/Idle, Pistol_*, Hit_*, Death01). No strafes or turns. UAL2 Standard is not in the repo (its free tier has no locomotion anyway).
- Walk strafes, backpedal and turns: CMU 41_02-03, 69_16-19 (turn in place), 69_42-67 (sideways), 16_17-20 and 16_41-54 (90-degree turns). Credit mocap.cs.cmu.edu.
- Run strafes: KayKit Running_Strafe_Left/Right, Walking_Backward (CC0). Check the free download for crouch and turn clips.
- Creep: CMU 17_03-04, 77_14-15, 77_29-33. Limp for step 2: CMU 77_19-24.
- Procedural: crouch strafes, diagonals (blended) and running backpedal. Adds about 2-3 h to the 12-16 h estimate.

## Step 1 tool choices (Oct 17, 12:50 ET)
- Clips: CMU mocap BVH (mocap.cs.cmu.edu; per-file mirror github.com/una-dinosauria/cmu-mocap, no login): 69_42-67 walk sideways, 69_50-55 walk backwards, 69_16-19 turn in place, 16_xx 90-degree turns, 41_02-03 mixed strafes. KayKit Character Animations 1.1 (CC0, itch free download, no login): Running_Strafe_Left/Right, Walking_Backwards, Crouching, Sneaking. KayKit has no turn clips, so turns come from CMU. Retargeted legs+hips only onto the Meshy rig (per-bone world swing alignment, in place, loop-closed); the Meshy Combat_Stance upper layer keeps the rifle. Why: free, real human motion, no paid pack.
- Procedural: diagonals (blend weights), crouch strafes, running backpedal (back clip sped up), reload and idle fidgets (upper-body IK layers on the existing support-arm IK; KayKit reloads are 1H/2H-generic and twist on our rig).
- Paths + separation: recast-navigation-js 0.43 (MIT), lazy-loaded like Rapier (wasm 2 MB unpacked). Navmesh rebuilt from street colliders in a window around the player; crowd/separation keeps fighters >= 0.6 m apart. three-pathfinding rejected (needs a prebuilt navmesh).
- IK: keep our analytic two-bone foot IK + foot locking (no extra lib); tier plans per dev-plan section 1.

## Step 2 tool choice: hit reactions (Oct 18, 10:30 ET)
- Choice: procedural reactions, our own code with no new library. Each zone hit kicks critically-damped per-bone springs along the bullet direction, applied after mixer.update and before syncArt (arm jerk, torso stagger with a root step back, leg buckle). Lasting wounds reuse what we already have: the analytic two-bone IK for the arm clutch, the step-1 locomotion meta for the limp (0.6 speed scale, uneven stride phase, hip dip), and enemy spread x2.5 for a wounded arm. Head shots and kills keep the existing lazy-loaded Rapier ragdoll. Everything is behind ?hits=2.
- Why: there are no asset or retarget dependencies, and each reaction follows the actual hit direction and zone. The cost is a handful of quaternion springs per fighter, which is fine for iPhone Safari. Tests can check it, because the hit volumes follow the drawn bones. Tiers: High full; Low full within 25 m and flinch only beyond; Ultra-low flinch plus speed/aim penalties.
- Rejected: three's AnimationUtils.makeClipAdditive flinches (our Hit_* clips are full-body, need extra retarget and binding, and cannot follow the bullet direction; kept as an optional High-tier extra later). A powered/active Rapier ragdoll on every hit (too costly on iPhone). CCDIKSolver (iterative, jitters, overkill for a 2-bone arm).
