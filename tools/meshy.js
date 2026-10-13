// Meshy text-to-3D (meshy-6 preview + refine, ~30 credits). Usage: node tools/meshy.js <name> "<prompt>" "<texture prompt>" [pose|''] [polycount]   (empty pose => pose_mode omitted, use for buildings/props)
// Logs balance before/after to assets-src/meshy/ledger.jsonl. Never prints the key. Refuses to start below MIN_BALANCE (default 60).
const fs = require('fs'), K = process.env.MESHY_API_KEY, H = { Authorization: 'Bearer ' + K, 'Content-Type': 'application/json' }, A = 'https://api.meshy.ai/openapi';
const [name, prompt, tprompt, pose = '', poly = '20000'] = process.argv.slice(2), MIN = +(process.env.MIN_BALANCE || 60), D = __dirname + '/../assets-src/meshy/';
const j = async (u, o = {}) => { const r = await fetch(A + u, { ...o, headers: H }); const t = await r.text(); if (!r.ok) throw new Error(r.status + ' ' + t.slice(0, 200)); return JSON.parse(t || '{}'); };
const bal = async () => (await j('/v1/balance')).balance;
const wait = async id => { for (;;) { const t = await j('/v2/text-to-3d/' + id); if (['SUCCEEDED', 'FAILED', 'CANCELED'].includes(t.status)) { if (t.status !== 'SUCCEEDED') throw new Error(t.status + ' ' + JSON.stringify(t.task_error)); return t; } console.log(name, id, t.status, t.progress); await new Promise(r => setTimeout(r, 10000)); } };
(async () => {
  const b0 = await bal(); console.log('balance before', b0); if (b0 < MIN) throw new Error('balance below floor ' + MIN);
  const p = await j('/v2/text-to-3d', { method: 'POST', body: JSON.stringify({ mode: 'preview', prompt, ai_model: 'meshy-6', should_remesh: true, topology: 'triangle', target_polycount: +poly, ...(pose ? { pose_mode: pose } : {}), target_formats: ['glb'] }) });
  console.log('preview task', p.result); const pt = await wait(p.result);
  const r = await j('/v2/text-to-3d', { method: 'POST', body: JSON.stringify({ mode: 'refine', preview_task_id: p.result, enable_pbr: true, texture_prompt: tprompt, remove_lighting: true, target_formats: ['glb'] }) });
  console.log('refine task', r.result); const rt = await wait(r.result);
  fs.writeFileSync(D + name + '.raw.glb', Buffer.from(await (await fetch(rt.model_urls.glb)).arrayBuffer()));
  fs.writeFileSync(D + name + '.thumb.png', Buffer.from(await (await fetch(rt.thumbnail_url)).arrayBuffer()));
  const b1 = await bal(); const rec = { name, preview: p.result, refine: r.result, before: b0, after: b1, used: b0 - b1, previewCredits: pt.consumed_credits, refineCredits: rt.consumed_credits, date: new Date().toISOString() };
  fs.appendFileSync(D + 'ledger.jsonl', JSON.stringify(rec) + '\n'); console.log('DONE', JSON.stringify(rec));
})().catch(e => { console.error('MESHY FAIL', e.message); process.exit(1); });
