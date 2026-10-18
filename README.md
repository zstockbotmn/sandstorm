# Sandstorm

Landscape mobile web FPS (three.js r186 + Rapier PWA). Live: https://zstockbotmn.github.io/sandstorm/

Build: `node tools/build.js --force` -> `dist/`. Tests: `tools/suite.sh fast|visual high|low|release` (Playwright, swiftshader).

## Credits

Full list with licences: [CREDITS.md](CREDITS.md). Animation sources (free, no paid packs, no Mixamo):

- **CMU Graphics Lab Motion Capture Database** (mocap.cs.cmu.edu; subjects 16, 41, 69: walks, strafes, backpedal, turn-in-place). The data used in this project was obtained from mocap.cs.cmu.edu; the database was created with funding from NSF EIA-0196217.
- **KayKit Character Animations 1.1** by Kay Lousberg (CC0): run strafes, walking backwards, crouch walk.
- **Quaternius Universal Animation Library** (CC0): walk, jog, sprint, crouch, idle, aim, hit and death clips.

All are retargeted offline onto the fighter rig (`tools/retarget-quaternius.mjs`, `tools/retarget-loco.mjs`).
