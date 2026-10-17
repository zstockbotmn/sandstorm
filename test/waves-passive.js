// m1u: the bot holds fire for the first 40 s so enemies get to shoot; every hit on the player must come from a fighter
// the player can see (test eye: drawn meshes + haze). The player is topped up below 40 hp during that phase.
process.env.SS_WAVES_PASSIVE = process.env.SS_WAVES_PASSIVE || '40'; process.env.SS_WAVES_MODES = process.env.SS_WAVES_MODES || 'ultra,low'; process.env.SS_WAVES_S = process.env.SS_WAVES_S || '200';
require('./waves.js');
