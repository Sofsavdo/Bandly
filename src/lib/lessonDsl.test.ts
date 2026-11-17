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
  back.items.forEach((it, i) => { const o = l.check[i]!; const key = o.kind === 'choice' ? o.answer : o.kind === 'gap' ? o.accept[0]! : o.answer.split(' '); assert.ok(checkItem(it, key), `${l.id} #${i}`); });
}
assert.deepEqual(parsePairs('Hello ::: Salom\n\nBye:::Xayr'), [['Hello', 'Salom'], ['Bye', 'Xayr']]);
console.log('lessonDsl.test: OK');
