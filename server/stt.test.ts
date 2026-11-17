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
