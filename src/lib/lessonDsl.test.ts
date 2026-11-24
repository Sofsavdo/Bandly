import assert from 'node:assert/strict';
import { UNITS } from '../content/lessons';
import { checkItem } from './lessons';
import { formatItems, parseItems, parsePairs } from './lessonDsl';

const { items, errors } = parseItems(`? I ___ a student. | is | *am | are | Men + am.
_ She ___ (go) to school every day. | goes | 3-shaxs: -s.
= I am from Tashkent | Ega + am + from.

x noto'g'ri qator
? Savol | *a | *b | izoh`);
assert.equal(items.length, 3);
assert.deepEqual(errors.map((e) => e.line), [5, 6]);
assert.ok(checkItem(items[0]!, 1) && checkItem(items[1]!, 'goes') && checkItem(items[2]!, 'I am from Tashkent'.split(' ')));
assert.notDeepEqual((items[2] as { words: string[] }).words, ['I', 'am', 'from', 'Tashkent'], 'so‘zlar aralashtirilgan');
// Mavjud darslar formatga o'tkazilib, qaytarilganda kalitlar ishlaydi
for (const l of UNITS.flatMap((u) => u.lessons)) {
  const back = parseItems(formatItems(l.check));
  assert.deepEqual(back.errors, [], l.id);
  back.items.forEach((it, i) => { const o = l.check[i]!; const key = o.kind === 'choice' ? o.answer : o.kind === 'gap' ? o.accept[0]! : o.kind === 'multi' ? o.answers : o.answer.split(' '); assert.ok(checkItem(it, key), `${l.id} #${i}`); });
}
assert.deepEqual(parsePairs('Hello ::: Salom\n\nBye:::Xayr'), [['Hello', 'Salom'], ['Bye', 'Xayr']]);
console.log('lessonDsl.test: OK');

// Ko'p tanlov ("+" qator): bir nechta * — barchasini tanlash kerak; formatga qaytganda saqlanadi
{
  const r = parseItems(`+ Choose ALL the correct sentences. | *I am a student. | He are a doctor. | *She is a nurse. | am / is / are: ega bilan moslashadi.
+ Xato | *a | *b | *c | hammasi to'g'ri
+ Xato2 | a | b | c | to'g'ri variant yo'q
+ Qisqa | *a | b | izoh`);
  assert.equal(r.items.length, 1, 'faqat to‘g‘ri yozilgan qator qabul qilinadi');
  assert.deepEqual(r.errors.map((e) => e.line), [2, 3, 4], 'hammasi to‘g‘ri / to‘g‘risi yo‘q / variantlar kam — xato');
  const m = r.items[0]!;
  assert.equal(m.kind, 'multi'); assert.deepEqual((m as { answers: number[] }).answers, [0, 2]);
  assert.ok(checkItem(m, [0, 2]) && !checkItem(m, [0]) && !checkItem(m, [0, 1, 2]));
  const back = parseItems(formatItems(r.items));
  assert.deepEqual(back.errors, []); assert.deepEqual(back.items, r.items, 'format → parse bir xil');
}
console.log('lessonDsl multi: OK');
