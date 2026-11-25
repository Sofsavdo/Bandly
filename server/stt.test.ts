import assert from 'node:assert/strict';
import { ApiError, byToken, createDb, join } from './db';
import { recordStt, sttAllowed, sttConfigFromEnv, transcribe, type SttConfig } from './stt';

assert.equal(sttConfigFromEnv({}), null, 'kalitsiz — o‘chiq');
assert.ok(sttConfigFromEnv({ ELEVENLABS_API_KEY: 'k' }));
assert.equal(sttConfigFromEnv({ ELEVENLABS_API_KEY: 'k' })!.model, 'scribe_v2', 'standart — Scribe v2 (egasi rozi, 2026-11-25)');
assert.equal(sttConfigFromEnv({ ELEVENLABS_API_KEY: 'k', STT_MODEL: 'scribe_v1' })!.model, 'scribe_v1', 'muhit o‘zgaruvchisi bilan qaytarish mumkin');
let sent: FormData | null = null;
const cfg: SttConfig = { key: 'k', model: 'scribe_v1', dailySecondsPerUser: 60, globalDailySeconds: 120, pricePerHour: 0.4,
  fetchImpl: (async (_u: string, init: { body: FormData }) => { sent = init.body; return new Response(JSON.stringify({ text: ' I  go to market yesterday ', language_code: 'eng', words: [{ type: 'word', end: 0.5 }, { type: 'spacing', end: 0.6 }, { type: 'word', end: 2.4 }] }), { status: 200 }); }) as never };
const r = await transcribe(cfg, Buffer.alloc(2000, 1), 'audio/webm;codecs=opus');
assert.deepEqual(r, { text: 'I go to market yesterday', lang: 'eng', seconds: 2.4, score: null }, 'logprob bo‘lmasa — score null');
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

// Til: avto-aniqlash ISHLATILMAYDI (qisqa o'zbekchani turk/serb/ingliz deb adashtirardi) — ona tili ko'rsatmasi bilan bitta so'rov; shubhali bo'lsa ingliz ham sinaladi
{
  const { transcribeLearner, LOW_CONFIDENCE } = await import('./stt');
  const mk = (by: Record<string, { text: string; lp?: number; end?: number } | Error>, calls: (string | null)[]) => (async (_u: string, init: { body: FormData }) => {
    const lc = init.body.get('language_code') as string | null; calls.push(lc);
    const x = by[lc ?? 'auto']; if (x instanceof Error) throw x;
    const w = x ? x.text.split(' ').filter(Boolean).map((_, i) => ({ type: 'word', end: (x.end ?? 1) * (i + 1), logprob: x.lp })) : [];
    return { ok: true, status: 200, json: async () => ({ text: x?.text ?? '', language_code: lc ?? 'eng', words: w.map((q) => (q.logprob === undefined ? { type: 'word', end: q.end } : q)) }) };
  }) as never;
  const base = { key: 'k', model: 'scribe_v1', dailySecondsPerUser: 999, globalDailySeconds: 9999, pricePerHour: 0.4 };
  const audio = Buffer.alloc(2000);
  // 1) Toza o'zbekcha gap: BITTA so'rov, ona tili ko'rsatmasi bilan (avto-aniqlash yo'q)
  const c1: (string | null)[] = [];
  const r1 = await transcribeLearner({ ...base, fetchImpl: mk({ uzb: { text: 'Darsga o\'tamiz', lp: -0.07 } }, c1) }, audio, 'audio/wav', 'uzb');
  assert.deepEqual(c1, ['uzb']); assert.equal(r1.text, 'Darsga o\'tamiz'); assert.equal(r1.forced, false); assert.ok(r1.score! > LOW_CONFIDENCE);
  // 2) Ona tili natijasi ishonchsiz, inglizcha ishonchli: ikkala so'rov, ishonchlisi olinadi; soniyalar ikkalasi uchun
  const c2: (string | null)[] = [];
  const r2 = await transcribeLearner({ ...base, fetchImpl: mk({ uzb: { text: 'yesterday ay go skul', lp: -0.6, end: 1 }, eng: { text: 'Yesterday I go school', lp: -0.05, end: 1 } }, c2) }, audio, 'audio/wav', 'uzb');
  assert.deepEqual(c2, ['uzb', 'eng']); assert.equal(r2.text, 'Yesterday I go school'); assert.equal(r2.forced, true); assert.equal(r2.seconds, 4 + 4, 'ikki so‘rov ham hisobga olinadi');
  // 3) Ishonchsiz, lekin inglizcha yomonroq: ona tili natijasi qoladi
  const c3: (string | null)[] = [];
  const r3 = await transcribeLearner({ ...base, fetchImpl: mk({ uzb: { text: 'Men tushunmadim', lp: -0.3 }, eng: { text: 'Дарске ўтамиз', lp: -0.9 } }, c3) }, audio, 'audio/wav', 'uzb');
  assert.equal(r3.text, 'Men tushunmadim'); assert.equal(r3.forced, false);
  // 4) Ona tili natijasi bo'sh: ingliz sinaladi; ikkinchisi xato bersa — bo'sh natija (qo'ng'iroq "ovoz eshitilmadi" deydi, qulamaydi)
  const c4: (string | null)[] = [];
  const r4 = await transcribeLearner({ ...base, fetchImpl: mk({ uzb: { text: '' }, eng: { text: 'Hello', lp: -0.02 } }, c4) }, audio, 'audio/wav', 'uzb'); assert.equal(r4.text, 'Hello'); assert.equal(r4.forced, true);
  const r5 = await transcribeLearner({ ...base, fetchImpl: mk({ uzb: { text: '' }, eng: new Error('tarmoq') }, []) }, audio, 'audio/wav', 'uzb'); assert.equal(r5.text, '');
  // 5) Ona tili — rus: ko'rsatma rus tilida (uzb emas)
  const c6: (string | null)[] = [];
  await transcribeLearner({ ...base, fetchImpl: mk({ rus: { text: 'Привет', lp: -0.05 } }, c6) }, audio, 'audio/wav', 'rus'); assert.deepEqual(c6, ['rus']);
  // 6) Mashqlar (matnni ovoz chiqarib o'qish, speaking): faqat ingliz tili, bitta so'rov
  const c7: (string | null)[] = [];
  const r7 = await transcribeLearner({ ...base, fetchImpl: mk({ eng: { text: 'I go to school', lp: -0.01 } }, c7) }, audio, 'audio/wav', 'uzb', 'en');
  assert.deepEqual(c7, ['eng'], 'bitta so‘rov, ingliz tili majburiy'); assert.equal(r7.text, 'I go to school');
  // 7) Moslashuvchan tartib: o'quvchi inglizcha gapirayotgan bo'lsa avval inglizcha — ishonchli bo'lsa BITTA so'rov
  const c8: (string | null)[] = [];
  const r8 = await transcribeLearner({ ...base, fetchImpl: mk({ eng: { text: 'I went to the market', lp: -0.04 } }, c8) }, audio, 'audio/wav', 'uzb', 'en-first');
  assert.deepEqual(c8, ['eng']); assert.equal(r8.text, 'I went to the market'); assert.equal(r8.forced, true);
  // o'quvchi o'zbekchaga o'tdi: inglizcha ishonchsiz → ona tili ham sinaladi va yaxshirog'i olinadi
  const c9: (string | null)[] = [];
  const r9 = await transcribeLearner({ ...base, fetchImpl: mk({ eng: { text: 'men bugun bozorga bordim', lp: -0.7 }, uzb: { text: 'Men bugun bozorga bordim', lp: -0.05 } }, c9) }, audio, 'audio/wav', 'uzb', 'en-first');
  assert.deepEqual(c9, ['eng', 'uzb']); assert.equal(r9.text, 'Men bugun bozorga bordim'); assert.equal(r9.forced, false);
  // kirill harfli "inglizcha" natija ishonchli hisoblanmaydi
  const c10: (string | null)[] = [];
  const r10 = await transcribeLearner({ ...base, fetchImpl: mk({ eng: { text: 'Дарске ўтамиз', lp: -0.05 }, uzb: { text: 'Darsga o‘tamiz', lp: -0.1 } }, c10) }, audio, 'audio/wav', 'uzb', 'en-first');
  assert.deepEqual(c10, ['eng', 'uzb']); assert.equal(r10.text, 'Darsga o‘tamiz');
  console.log('stt (til): OK');
}
