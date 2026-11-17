import assert from 'node:assert/strict';
import { createDb } from './db';
import { __setCatalog, coverage, dictFor, listTranslations, setTranslation, translateBatch, translateMissing, trServer } from './i18n';
import type { AiConfig } from './ai';

const db = createDb();
__setCatalog(['Darslar', '{0} ta dars', 'Topilmadi', 'Mashq qiling']);
const cfg: AiConfig = { provider: 'anthropic', key: 'k', model: 'm', baseUrl: 'http://fake' };
let calls = 0;
const fakeAi = (map: (s: string) => string) => async (_u: string, init?: { body?: string }) => {
  calls++;
  const user = (JSON.parse(String(init?.body)) as { messages: { content: string }[] }).messages[0]!.content;
  const items = JSON.parse(user.match(/\[[\s\S]*\]/)![0]) as string[];
  return new Response(JSON.stringify({ content: [{ text: JSON.stringify(items.map(map)) }] }), { status: 200 });
};

// To'liq tarjima, {o'rinlar} saqlanadi
const r = await translateMissing(db, cfg, 'ru', { call: { fetchImpl: fakeAi((s) => `RU ${s}`) as never } });
assert.deepEqual(r, { added: 4, remaining: 0 });
assert.equal(dictFor(db, 'ru').dict['{0} ta dars'], 'RU {0} ta dars');
assert.equal(coverage(db).ru.done, 4);

// {o'rin} yo'qolgan tarjima rad etiladi
const bad = await translateBatch(db, cfg, 'kk', ['{0} ta dars'], { fetchImpl: fakeAi(() => 'сабақ') as never });
assert.equal(bad, 0);

// Qo'lda tuzatilgani AI tomonidan qayta yozilmaydi
setTranslation(db, 'ru', 'Darslar', 'Уроки', 'human');
await translateBatch(db, cfg, 'ru', ['Darslar'], { fetchImpl: fakeAi(() => 'AI урок') as never });
assert.equal(dictFor(db, 'ru').dict.Darslar, 'Уроки');
assert.equal(listTranslations(db, 'ru', 'уро')[0]!.by, 'human');

// Server xabarlari: aniq va shablon orqali
assert.equal(trServer(db, 'ru', 'Topilmadi'), 'RU Topilmadi');
assert.equal(trServer(db, 'ru', '5 ta dars'), 'RU 5 ta dars');
assert.equal(trServer(db, 'uz', 'Topilmadi'), 'Topilmadi');
assert.equal(trServer(db, undefined, 'Topilmadi'), 'Topilmadi');
// Lug'at versiyasi o'zgarishda yangilanadi
const v1 = dictFor(db, 'ru').v; setTranslation(db, 'ru', 'Mashq qiling', 'Тренируйтесь', 'human'); assert.notEqual(dictFor(db, 'ru').v, v1);
assert.ok(calls >= 3);
console.log('i18n server: OK');
