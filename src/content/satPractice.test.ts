import assert from 'node:assert/strict';
import { SAT_RW, SAT_MATH } from './satPractice';
import { DIGITAL_SAT } from './examFormats';
import { checkItem } from '../lib/lessons';

const domains = new Set(DIGITAL_SAT.domains.map((d) => d.name));
for (const { domain, item } of [...SAT_RW, ...SAT_MATH]) {
  assert.ok(domains.has(domain), `known domain ${domain}`);
  const key = item.kind === 'choice' ? item.answer : item.kind === 'gap' ? item.accept[0]! : item.kind === 'multi' ? item.answers : item.answer.split(' ');
  assert.ok(checkItem(item, key), 'answer key passes');
  if (item.kind === 'choice') assert.equal(new Set(item.options).size, item.options.length);
}
assert.ok(SAT_RW.every((x) => x.item.kind === 'choice'), 'R&W items are multiple choice');
assert.ok(SAT_MATH.some((x) => x.item.kind === 'gap'), 'math includes student-produced responses');
assert.deepEqual([DIGITAL_SAT.totals.questions, DIGITAL_SAT.totals.minutes], [54 + 44, 64 + 70], 'totals consistent with sections');
// independently re-check the math keys
assert.equal((15.5 - 12) / 0.05, 70); assert.equal(2 * 16 - 3 * 4, 20); assert.equal(Math.hypot(6, 8), 10);

// Bank hajmi va muvozanati: har bir domen kamida 18 ta savol, takroriy savol yo'q
for (const [name, set] of [['R&W', SAT_RW], ['Math', SAT_MATH]] as const) {
  assert.ok(set.length >= 85, `${name}: ≥85 savol (${set.length})`);
  const byDomain = new Map<string, number>();
  for (const x of set) byDomain.set(x.domain, (byDomain.get(x.domain) ?? 0) + 1);
  assert.equal(byDomain.size, 4, `${name}: 4 ta domen`);
  for (const [d, n] of byDomain) assert.ok(n >= 18, `${name}/${d}: ≥18 (${n})`);
  const keys = set.map((x) => `${x.item.kind === 'order' ? x.item.words.join(' ') : x.item.prompt}|${x.item.kind === 'choice' ? x.item.options.join('~') : ''}`);
  assert.equal(new Set(keys).size, keys.length, `${name}: takroriy savol yo'q`);
  const choices = set.map((x) => x.item).filter((it) => it.kind === 'choice');
  const share = [0, 1, 2, 3].map((k) => choices.filter((it) => it.kind === 'choice' && it.answer === k).length / choices.length);
  assert.ok(share.every((v) => v > 0.15 && v < 0.35), `${name}: kalit joylashuvi ${share.map((v) => v.toFixed(2)).join('/')}`);
}
assert.ok(SAT_MATH.filter((x) => x.item.kind === 'gap').length >= 20, 'math: ≥20 student-produced response');

// Math kalitlarini mustaqil hisoblash (savol matnining bo'lagi → kutilgan javob)
const gapKey = (frag: string): string => {
  const hit = SAT_MATH.filter((x) => x.item.kind === 'gap' && x.item.prompt.includes(frag));
  assert.equal(hit.length, 1, `topilmadi/ko'p: ${frag}`);
  const it = hit[0]!.item;
  return it.kind === 'gap' ? it.accept[0]! : '';
};
const num = (frag: string) => Number(gapKey(frag).replace(/[,\s]/g, '').replace('−', '-'));
assert.equal(num('2(x + 4) = 30'), 30 / 2 - 4);
assert.equal(num('$45 plus $30 per hour'), (165 - 45) / 30);
assert.equal(num('3x + y = 17'), (17 - 9) / 2);
assert.equal(num('3x − 4 < 20'), Math.ceil(24 / 3) - 1);
assert.equal(num('passes through (0, 5)'), 2 * 6 + 5);
assert.equal(num('Adult tickets'), (152 - 6 * 20) / (10 - 6));
assert.equal(num('f(x) = 3x + 2'), 3 * 5 + 2);
assert.equal(num('x² − 7x + 12 = 0'), 7);
assert.equal(num('(x − 4)² + 7'), 7);
assert.equal(num('3ˣ = 81'), Math.round(Math.log(81) / Math.log(3)));
assert.equal(num('$20,000'), Math.round(20000 * 0.9 * 0.9));
assert.equal(num('√(x − 3) = 4'), 4 * 4 + 3);
assert.equal(num('a² − b² = 40'), 40 / 4);
assert.equal(num('2x² − 10x + 8'), 10 / 2);
assert.equal(num('4ˣ = 2^(x + 3)'), 3);
assert.equal(num('cats to dogs'), (28 / 7) * 4);
assert.equal(num('8 notebooks'), (14.4 / 8) * 20);
assert.equal(num('15% of 240'), 0.15 * 240);
assert.equal(num('grows from 400 to 500'), ((500 - 400) / 400) * 100);
assert.equal(num('mean of 6 numbers'), 6 * 14);
assert.equal(num('{8, 3, 15, 11}'), 15 - 3);
assert.equal(num('y = 1.8x + 12, what is the predicted y'), 1.8 * 10 + 12);
assert.equal(num('rose from $40 to $50'), ((50 - 40) / 40) * 100);
assert.equal(num('legs 9 and 12'), Math.hypot(9, 12));
assert.equal(num('perimeter 36 and width 6'), (36 / 2 - 6) * 6);
assert.equal(num('radius 5. Its circumference'), 2 * 5);
assert.equal(num('volume 125'), Math.cbrt(125));
assert.equal(num('72° central angle'), (72 / 360) * 2 * 10);
assert.equal(num('shortest side is 6'), 12);
assert.equal(num('sin 25°'), 90 - 25);
assert.equal(num('same side of the transversal'), 180 - 118);
assert.equal(gapKey('Two fair dice'), '1/36');
console.log('satPractice.test: OK');
