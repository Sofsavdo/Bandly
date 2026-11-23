// Ovoz inventari ilovada haqiqatan chalinadigan matnlarni to'liq qamrab oladi (aks holda tugma bor, ovoz yo'q qoladi).
import assert from 'node:assert/strict';
import { clipKey } from '../../src/lib/clipHash';
import { ALL_LESSONS, IELTS_LESSONS } from '../../src/content/lessons';
import { fullSentence } from '../../src/lib/lessons';
import { clipInventory } from './inventory';

const keys = new Set(clipInventory().map((c) => c.key));
let sentences = 0;
for (const { lesson } of [...ALL_LESSONS, ...IELTS_LESSONS]) {
  for (const e of lesson.examples) if (!e.audio) assert.ok(keys.has(clipKey(e.en)), `${lesson.id}: misol ovozlanmaydi: ${e.en}`);
  for (const v of lesson.vocab ?? []) assert.ok(keys.has(clipKey(v.en)), `${lesson.id}: so‘z ovozlanmaydi: ${v.en}`);
  // Javobdan keyingi «Eshitish» tugmasi: brauzer aynan shu matn kaliti bilan fayl qidiradi
  for (const it of [...lesson.practice, ...lesson.check]) { const s = fullSentence(it); if (s && /[A-Za-z]/.test(s)) { sentences++; assert.ok(keys.has(clipKey(s)), `${lesson.id}: to‘liq gap ovozlanmaydi: ${s}`); } }
}
assert.ok(sentences > 1000, `to‘liq gaplar topildi: ${sentences}`);
assert.ok(clipInventory().some((c) => c.category === 'lesson-feedback'));
console.log(`audio inventory.test: OK (${sentences} to‘liq gap, ${keys.size} klip)`);
