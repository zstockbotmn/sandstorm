
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
