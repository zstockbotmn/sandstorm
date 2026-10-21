
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

## Step 2 tool choice: hit reactions (final, Oct 20, 10:30 PM ET)
- Choice: our own procedural reactions with no new library, behind ?hits=2. A hit on an arm, leg or the torso kicks springs on those bones along the bullet's direction: an arm jerks then the free hand clutches it and aim gets 2.5x worse, a leg buckles into a stumble then a lasting limp at 0.6x speed, and the torso staggers back a step. Head hits and kills use the Rapier ragdoll we already load, with a zone-aware push and a 0.15 s blend from the animated pose so falls never pop.
- Why: it's free, adds nothing to download, needs no new clips or retargeting, and every reaction follows where and from which way the round hit. It's only a few springs per fighter plus our existing two-bone IK, which is cheap enough for iPhone Safari. Hitboxes follow the drawn pose, so the tests can check it. Low tier runs full reactions within 25 m and a flinch beyond that. Ultra-low gets a flinch plus the speed and aim penalties.
- Rejected: three.js additive Hit_* clips (full-body, can't follow the shot direction, need retargeting), an active Rapier ragdoll on every hit (too heavy on iPhone), and CCDIK (jittery and more than a two-bone arm needs).

## Step 3 tool choice: sensory pass (Oct 21, 2:20 AM ET, behind ?fx=3)
- Choice: no new library. Puffs, debris, impacts and skyline flashes come from our own pool of instanced camera-facing sprites: one InstancedMesh per tier, capped per tier (High 96, Low 48, Ultra-low none), no per-frame allocation. Sounds are our WebAudio synth (whizz, ring, breathing, heartbeat, footsteps, lowpass muffle) plus a few Kenney Impact Sounds one-shots (CC0, kenney.nl, no login) for debris and ricochets. Callouts stay text-only.
- Post: one combined pass on the existing `postprocessing` composer (MIT) does vignette, desaturate and a hurt/blast blur. On iPhone it is a single cheap pass, or a DOM overlay on Low, and it switches itself off when fps falls under about 24. Shake is a capped, framerate-independent sum of decaying kicks in applyCamera, with a reduce-shake toggle.
- Rejected: three.quarks (MIT, good, but 185 KB minified for effects a 150-line sprite pool covers, and more overdraw on iPhone), three-nebula (heavier), three-mesh-bvh (our colliders are boxes, so a near-miss is a closest-approach check on each enemy round), Freesound (needs a login) and Sonniss (licence bans redistribution).

## Step 4 tool choice: building interiors (Oct 21, 6:50 AM ET, behind ?bld=4)
- Choice: our own ~120-line interior-mapping ShaderMaterial (unlit, one texture fetch, single-image "projected room" form: back wall plus perspective-squashed floor, ceiling and side walls in one atlas cell), drawn on window quads as one InstancedMesh per street segment (one draw call), with a per-window room/lit/curtain seed as instance attributes. The 4x2 room atlas (512x256) is painted at boot on a canvas in a desert palette (plaster, tiles, rugs, shelves, a back doorway, curtains, two shuttered/dark rooms), so there is nothing to download and no licence to track.
- Fallbacks: Low uses the same shader (it is one fetch); Ultra-low draws the atlas cell flat with MeshBasicMaterial. Enterable rooms (4c) are a few real box rooms with box colliders; the far skyline (4d) gets a shader window grid, merged roofline shapes and per-box colour on its existing merged geometry (no extra draw calls).
- Rejected: three-fenestra (MIT, good, but a MeshStandardMaterial subclass with a PBR front layer, heavier per pixel on iPhone than we need, and its starter rooms are modern offices), cubemap interiors such as mohsenheydari/three-interior-mapping and emirhanyener/three-interior-plane (MIT; 5-6 fetches or a cubemap per room style), and CC0 atlases (Poly Haven and ambientCG have no interior-mapping atlases; their interior HDRIs are MBs each).

## Step 5 tool choice: set pieces + pacing (Oct 21, 1:10 PM ET, behind ?sp=5)
- Choice: no new library and no new paid or login-gated assets. Set pieces (RPG strike first, then a truck moment) are our own
  module `src/setpiece.js`: a few meshes (rocket = small cylinder + cone; launch flash and smoke trail = our own sprite pool,
  same idea as the step-3 puffs), driven by the existing fx3 `blast` (shake + muffle), `impact` (dust + debris) and HUD cues.
  Audio is WebAudio synth in `audio.js` (whoosh = filtered noise sweep, boom = noise burst + low sine thump, engine roar =
  detuned sawtooth through a lowpass); Kenney CC0 only if a sample is ever needed (decision #3: no Freesound). The truck
  reuses the Kenney Car Kit flatbed already in assets (CC0). Pacing = a small director inside the same module (ambient events
  in quiet stretches, pressure curve read by enemies.js), no state-machine or behaviour-tree library.
- Rules (decision #4 + App PM A8 ruling): every set-piece hit has >= ~1 s of visual + audio tell before damage, blast damage
  is capped (30) and never takes the player below 5 HP in one blast, and it is the only damage (besides a flanker) that
  reaches a ducked player.
- Rejected: three.quarks / three-nebula (size, overdraw on iPhone; the sprite pool covers trails), Howler.js (we already have
  a WebAudio graph with the muffle filter), Yuka (steering/FSM library: more than a timer-driven director needs), any paid
  SFX pack or Freesound.
