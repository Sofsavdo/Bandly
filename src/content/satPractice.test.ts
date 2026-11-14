import assert from 'node:assert/strict';
import { SAT_RW, SAT_MATH } from './satPractice';
import { DIGITAL_SAT } from './examFormats';
import { checkItem } from '../lib/lessons';

const domains = new Set(DIGITAL_SAT.domains.map((d) => d.name));
for (const { domain, item } of [...SAT_RW, ...SAT_MATH]) {
  assert.ok(domains.has(domain), `known domain ${domain}`);
  const key = item.kind === 'choice' ? item.answer : item.kind === 'gap' ? item.accept[0]! : item.answer.split(' ');
  assert.ok(checkItem(item, key), 'answer key passes');
  if (item.kind === 'choice') assert.equal(new Set(item.options).size, item.options.length);
}
assert.ok(SAT_RW.every((x) => x.item.kind === 'choice'), 'R&W items are multiple choice');
assert.ok(SAT_MATH.some((x) => x.item.kind === 'gap'), 'math includes student-produced responses');
assert.deepEqual([DIGITAL_SAT.totals.questions, DIGITAL_SAT.totals.minutes], [54 + 44, 64 + 70], 'totals consistent with sections');
// independently re-check the math keys
assert.equal((15.5 - 12) / 0.05, 70); assert.equal(2 * 16 - 3 * 4, 20); assert.equal(Math.hypot(6, 8), 10);
console.log('satPractice.test: OK');
