// Variant (tester m1r): Restart from the end screen before playing, then 2 waves must actually clear (Ultra-low, Low).
process.env.SS_WAVES_RESTART = '1'; process.env.SS_WAVES_MODES = process.env.SS_WAVES_MODES || 'ultra,low'; process.env.SS_WAVES_S = process.env.SS_WAVES_S || '200';
require('./waves.js');
