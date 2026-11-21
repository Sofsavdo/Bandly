import assert from 'node:assert/strict';
import { addLiveUsage, emptyLive, liveCost, livePrice, parseUsage, reportUsage, setUsageSink, textCost, textPrice, withAiCtx } from './aiUsage';
import { complete } from './ai';

// Provayder javoblaridan token soni
assert.deepEqual(parseUsage('gemini', { usageMetadata: { promptTokenCount: 1200, candidatesTokenCount: 300, thoughtsTokenCount: 200 } }), { inTok: 1200, outTok: 500 }, 'o‘ylash tokenlari chiqishda');
assert.deepEqual(parseUsage('openai', { usage: { prompt_tokens: 50, completion_tokens: 20 } }), { inTok: 50, outTok: 20 });
assert.deepEqual(parseUsage('anthropic', { usage: { input_tokens: 10, output_tokens: 5, cache_read_input_tokens: 90 } }), { inTok: 100, outTok: 5 });
assert.equal(parseUsage('gemini', {}), null, 'usage yo‘q — taxmin qilinmaydi');

// Narx: env berilsa haqiqiy, aks holda standart (estimated)
assert.deepEqual(textPrice({ AI_PRICE_IN_PER_M: '0.3', AI_PRICE_OUT_PER_M: '2.5' }), { inPerM: 0.3, outPerM: 2.5, estimated: false });
assert.equal(textPrice({}).estimated, true);
assert.equal(textCost({ inTok: 1_000_000, outTok: 1_000_000 }, { inPerM: 0.3, outPerM: 2.5, estimated: false }), 2.8);

// Live: modallik bo'yicha yig'indi
const lu = emptyLive();
addLiveUsage(lu, { promptTokenCount: 1000, promptTokensDetails: [{ modality: 'AUDIO', tokenCount: 700 }, { modality: 'TEXT', tokenCount: 300 }], responseTokenCount: 500, responseTokensDetails: [{ modality: 'AUDIO', tokenCount: 500 }] });
addLiveUsage(lu, { promptTokenCount: 100, responseTokenCount: 10 }); // tafsilotsiz — matn
assert.deepEqual(lu, { textIn: 400, audioIn: 700, textOut: 10, audioOut: 500 });
const lp = livePrice({ PRICE_LIVE_TEXT_IN_PER_M: '1', PRICE_LIVE_AUDIO_IN_PER_M: '2', PRICE_LIVE_TEXT_OUT_PER_M: '3', PRICE_LIVE_AUDIO_OUT_PER_M: '4' });
assert.equal(lp.estimated, false);
assert.equal(liveCost(lu, lp), (400 * 1 + 700 * 2 + 10 * 3 + 500 * 4) / 1e6);
assert.equal(livePrice({}).estimated, true);

// Kontekst: faqat withAiCtx ichidagi so'rovlar yoziladi; complete() javobdagi usage'ni uzatadi
const got: { feature: string; pid: number | null; inTok: number; outTok: number; model: string }[] = [];
setUsageSink((c, _p, model, u) => got.push({ feature: c.feature, pid: c.playerId, inTok: u.inTok, outTok: u.outTok, model }));
reportUsage('gemini', 'm', { inTok: 5, outTok: 5 });
assert.equal(got.length, 0, 'kontekstsiz — yozilmaydi');
const fake = (async () => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [{ text: 'hi' }] } }], usageMetadata: { promptTokenCount: 42, candidatesTokenCount: 7 } }) })) as never;
const cfg = { provider: 'gemini', key: 'k', model: 'gemini-x', baseUrl: 'https://g.test' } as never;
const out = await withAiCtx({ playerId: 9, feature: 'writing_eval' }, () => complete(cfg, 'sys', 'user', { fetchImpl: fake }));
assert.equal(out, 'hi');
assert.deepEqual(got, [{ feature: 'writing_eval', pid: 9, inTok: 42, outTok: 7, model: 'gemini-x' }]);
setUsageSink(null);
console.log('aiUsage: OK');
