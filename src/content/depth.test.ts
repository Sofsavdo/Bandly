// Kontent chuqurligi pol (floor) tekshiruvi: tasodifan kontent yo'qolib ketmasin va yupqa joylar qaytmasin.
// Raqamlar 2026-11-24 holatidan (docs/SELLZEN_MARKET_REVIEW_2026-11-24.md) — kontent faqat ko'payishi kerak; kamaytirish ongli qaror bo'lsin.
import assert from 'node:assert/strict';
import { ALL_LESSONS, SAT_LESSONS, UNITS } from './lessons';
import { SAT_MATH, SAT_RW } from './satPractice';
import { vocab } from './vocab';
import { grammar } from './grammar';
import { readingTests } from './readingTests';
import { listeningTests } from './listeningTests';
import { CAN_DO } from '../components/mapArt';

const byLevel = (lv: string) => ALL_LESSONS.filter((x) => x.unit.level === lv).length;
assert.ok(ALL_LESSONS.length >= 228, `darslar: ${ALL_LESSONS.length}`);
assert.ok(byLevel('A1') >= 78, `A1 darslar: ${byLevel('A1')}`);
for (const lv of ['A2', 'B1', 'B2', 'C1', 'C2']) assert.ok(byLevel(lv) >= 30, `${lv} darslar: ${byLevel(lv)}`);

for (const { lesson } of ALL_LESSONS) {
  assert.ok(lesson.practice.length >= 5 && lesson.check.length >= 6, `${lesson.id}: mashq/nazorat soni`);
  assert.ok(lesson.examples.length >= 3 && (lesson.vocab?.length ?? 0) >= 3, `${lesson.id}: misol va so‘zlar`);
  assert.ok(!!lesson.writing, `${lesson.id}: yozma topshiriq`);
  const listen = lesson.practice.filter((it) => (it.kind === 'choice' || it.kind === 'gap') && it.listen).length;
  assert.ok(listen >= 2, `${lesson.id}: darsda kamida 2 ta eshitib tushunish mashqi bo‘lishi kerak (${listen})`);
}
const kinds = new Set(ALL_LESSONS.flatMap((x) => [...x.lesson.practice, ...x.lesson.check].map((it) => it.kind)));
for (const k of ['choice', 'gap', 'order', 'multi']) assert.ok(kinds.has(k as never), `mashq turi yo‘qolgan: ${k}`);
assert.ok(UNITS.every((u) => !!u.situationUz?.trim()), 'har bo‘limda vaziyat tavsifi');

const wl = (lv: string) => vocab.filter((w) => w.level === lv).length;
assert.ok(vocab.length >= 1280 && wl('A1') >= 240 && wl('B2') >= 300, `so‘zlar: ${vocab.length} (A1 ${wl('A1')})`);
assert.ok(grammar.length >= 80, `grammatika savollari: ${grammar.length}`);
assert.ok(readingTests.length >= 21 && listeningTests.length >= 20, `mock: ${readingTests.length}/${listeningTests.length}`);
for (const lv of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) assert.ok(CAN_DO[lv]?.startsWith('I can'), `${lv}: can-do sarlavha`);
// Digital SAT: to'liq darslik (R&W + Math) va savollar banki
assert.ok(SAT_LESSONS.length >= 29, `SAT darslar: ${SAT_LESSONS.length}`);
for (const { lesson } of SAT_LESSONS) assert.ok(lesson.practice.length >= 5 && lesson.check.length >= 4 && lesson.examples.length >= 4 && lesson.explanationUz.length >= 3, `${lesson.id}: SAT dars chuqurligi`);
assert.ok(SAT_RW.length >= 85 && SAT_MATH.length >= 85, `SAT banki: R&W ${SAT_RW.length}, Math ${SAT_MATH.length}`);
console.log(`depth.test: OK (${ALL_LESSONS.length} dars, ${vocab.length} so‘z)`);
