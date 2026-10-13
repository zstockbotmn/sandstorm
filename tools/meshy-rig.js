// Meshy auto-rig (5 credits) + optional animation clips (3 credits each) for a text-to-3D character.
// Usage: node tools/meshy-rig.js <name> <refineTaskId> [actionIdsCSV]
// Writes assets-src/meshy/<name>.rig.raw.glb (rigged, bind pose) and <name>.anim.raw.glb (clips) and appends to ledger.jsonl.
// Never prints the key. Refuses to start below MIN_BALANCE (default 60).
const fs = require('fs'), K = process.env.MESHY_API_KEY, H = { Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' }, A = 'https://api.meshy.ai/openapi';
const [name, refine, acts = ''] = process.argv.slice(2), MIN = +(process.env.MIN_BALANCE || 60), D = __dirname + '/../assets-src/meshy/';
const j = async (u, o = {}) => { const r = await fetch(A + u, { ...o, headers: H }); const t = await r.text(); if (!r.ok) throw new Error(r.status + ' ' + t.slice(0, 200)); return JSON.parse(t || '{}'); };
const bal = async () => (await j('/v1/balance')).balance;
const wait = async (path, id) => { for (;;) { const t = await j(path + id); if (['SUCCEEDED', 'FAILED', 'CANCELED'].includes(t.status)) { if (t.status !== 'SUCCEEDED') throw new Error(t.status + ' ' + JSON.stringify(t.task_error)); return t; } console.log(name, id, t.status, t.progress); await new Promise(r => setTimeout(r, 5000)); } };
const dl = async (url, f) => fs.writeFileSync(D + f, Buffer.from(await (await fetch(url)).arrayBuffer()));
(async () => {
  const b0 = await bal(); console.log('balance before', b0); if (b0 < MIN + 5) throw new Error('balance below floor ' + MIN);
  const r = await j('/v1/rigging', { method: 'POST', body: JSON.stringify({ input_task_id: refine, height_meters: 1.8 }) });
  const rt = await wait('/v1/rigging/', r.result); await dl(rt.result.rigged_character_glb_url, name + '.rig.raw.glb');
  const rec = { name: name + '-rig', rig: r.result, rigCredits: rt.consumed_credits };
  const ids = acts.split(',').filter(Boolean).map(Number);
  if (ids.length) { const b = await bal(); if (b - 3 * ids.length < MIN) throw new Error('animation would cross floor');
    const a = await j('/v1/animations', { method: 'POST', body: JSON.stringify({ rig_task_id: r.result, action_ids: ids }) });
    const at = await wait('/v1/animations/', a.result); await dl(at.result.animation_glb_url, name + '.anim.raw.glb'); Object.assign(rec, { anim: a.result, actions: ids, animCredits: at.consumed_credits }); }
  const b1 = await bal(); Object.assign(rec, { before: b0, after: b1, used: b0 - b1, date: new Date().toISOString() });
  fs.appendFileSync(D + 'ledger.jsonl', JSON.stringify(rec) + '\n'); console.log('DONE', JSON.stringify(rec));
})().catch(e => { console.error('MESHY FAIL', e.message); process.exit(1); });
