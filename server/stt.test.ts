import assert from 'node:assert/strict';
import { ApiError, byToken, createDb, join } from './db';
import { recordStt, sttAllowed, sttConfigFromEnv, transcribe, type SttConfig } from './stt';

assert.equal(sttConfigFromEnv({}), null, 'kalitsiz — o‘chiq');
assert.ok(sttConfigFromEnv({ ELEVENLABS_API_KEY: 'k' }));
let sent: FormData | null = null;
const cfg: SttConfig = { key: 'k', model: 'scribe_v1', dailySecondsPerUser: 60, globalDailySeconds: 120, pricePerHour: 0.4,
  fetchImpl: (async (_u: string, init: { body: FormData }) => { sent = init.body; return new Response(JSON.stringify({ text: ' I  go to market yesterday ', language_code: 'eng', words: [{ type: 'word', end: 0.5 }, { type: 'spacing', end: 0.6 }, { type: 'word', end: 2.4 }] }), { status: 200 }); }) as never };
const r = await transcribe(cfg, Buffer.alloc(2000, 1), 'audio/webm;codecs=opus');
assert.deepEqual(r, { text: 'I go to market yesterday', lang: 'eng', seconds: 2.4 });
assert.equal((sent as unknown as FormData).get('model_id'), 'scribe_v1');
assert.equal((sent as unknown as FormData).get('language_code'), null, 'til avtomatik aniqlanadi');
await assert.rejects(transcribe(cfg, Buffer.alloc(2000), 'text/html'), ApiError);
await assert.rejects(transcribe(cfg, Buffer.alloc(100), 'audio/webm'), ApiError);

// Limitlar: o'quvchi 60 s, platforma 120 s
const db = createDb();
const a = byToken(db, join(db, 'Aaa').token).id, b = byToken(db, join(db, 'Bbb').token).id, c = byToken(db, join(db, 'Ccc').token).id;
sttAllowed(db, cfg, a); recordStt(db, a, 61);
assert.throws(() => sttAllowed(db, cfg, a), ApiError);
recordStt(db, b, 50); sttAllowed(db, cfg, c); recordStt(db, c, 10);
assert.throws(() => sttAllowed(db, cfg, c), (e: ApiError) => e.status === 503);
console.log('stt: OK');

// Qisqa gapda boshqa til aniqlansa (marathi, shved) — ingliz tili deb qayta tanadi; o'zbekcha yoki inglizcha bo'lsa — bir marta
{
  const { transcribeLearner } = await import('./stt');
  const calls: (string | null)[] = [];
  const fake = (async (_u: string, init: { body: FormData }) => { const lc = init.body.get('language_code') as string | null; calls.push(lc); return { ok: true, status: 200, json: async () => (lc === 'eng' ? { text: 'I go to school', language_code: 'eng', words: [{ end: 1.2 }] } : { text: 'आय गो टू स्कूल', language_code: 'mar', words: [{ end: 1.1 }] }) }; }) as never;
  const cfg = { key: 'k', model: 'scribe_v1', dailySecondsPerUser: 999, globalDailySeconds: 9999, pricePerHour: 0.4, fetchImpl: fake };
  const r = await transcribeLearner(cfg, Buffer.alloc(2000), 'audio/webm', 'uzb');
  assert.equal(r.text, 'I go to school'); assert.equal(r.forced, true); assert.deepEqual([...calls].sort(), ['eng', null].sort());
  const calls2: (string | null)[] = [];
  const uz = (async (_u: string, init: { body: FormData }) => { calls2.push(init.body.get('language_code') as string | null); return { ok: true, status: 200, json: async () => ({ text: 'salom qalaysan', language_code: 'uzb', words: [] }) }; }) as never;
  const r2 = await transcribeLearner({ ...cfg, fetchImpl: uz }, Buffer.alloc(2000), 'audio/webm', 'uzb');
  assert.equal(r2.forced, false); assert.equal(r2.text, 'salom qalaysan', 'o‘zbekcha — o‘zi aniqlagani olinadi');
  // Mashqlar (matnni ovoz chiqarib o'qish, speaking): faqat ingliz tili kutiladi — aksentli ovoz o'zbekcha deb tanilmaydi
  const calls3: (string | null)[] = [];
  const en = (async (_u: string, init: { body: FormData }) => { calls3.push(init.body.get('language_code') as string | null); return { ok: true, status: 200, json: async () => ({ text: 'I go to school', language_code: 'eng', words: [{ end: 1 }] }) }; }) as never;
  const r3 = await transcribeLearner({ ...cfg, fetchImpl: en }, Buffer.alloc(2000), 'audio/webm', 'uzb', 'en');
  assert.deepEqual(calls3, ['eng'], 'bitta so‘rov, ingliz tili majburiy'); assert.equal(r3.text, 'I go to school');
  console.log('stt (til): OK');
}
