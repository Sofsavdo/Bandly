import assert from 'node:assert/strict';
import { addHighlight, createAttempt, isExpired, remainingSeconds, segments, setAnswer, submitAttempt, toggleFlag, unanswered } from './examAttempt';

const T0 = 1_700_000_000_000;
const a0 = createAttempt('reading:r1', 15, T0);
assert.equal(remainingSeconds(a0, T0), 900);
// Qayta yuklash vaqtni tiklamaydi: qolgan vaqt saqlangan muddatdan hisoblanadi
assert.equal(remainingSeconds(a0, T0 + 61_000), 839);
assert.equal(remainingSeconds(a0, T0 + 2_000_000), 0);
assert.equal(isExpired(a0, T0 + 900_000), true);
assert.equal(isExpired(a0, T0 + 899_000), false);

// Javoblar va belgilar
let a = setAnswer(a0, 3, 'True');
a = setAnswer(a, 5, 2);
assert.deepEqual(unanswered(a, [1, 3, 5]), [1]);
a = setAnswer(a, 5, undefined);
assert.deepEqual(unanswered(a, [3, 5]), [5]);
a = toggleFlag(a, 7); a = toggleFlag(a, 2);
assert.deepEqual(a.flags, [2, 7]);
a = toggleFlag(a, 7);
assert.deepEqual(a.flags, [2]);

// Topshirish bir martalik; topshirilgandan keyin o'zgarmaydi
const s1 = submitAttempt(a, T0 + 100_000);
const s2 = submitAttempt(s1, T0 + 200_000, true);
assert.equal(s2, s1, 'ikkinchi topshirish hech narsani o‘zgartirmaydi');
assert.equal(s1.submittedAt, T0 + 100_000);
assert.equal(setAnswer(s1, 1, 'False'), s1);
assert.equal(toggleFlag(s1, 1), s1);
assert.equal(isExpired(s1, T0 + 10_000_000), false);

// Highlight: birlashtirish va bo'laklash
let h = addHighlight([], { p: 0, start: 5, end: 10 });
h = addHighlight(h, { p: 0, start: 8, end: 15 });
h = addHighlight(h, { p: 1, start: 0, end: 3 });
h = addHighlight(h, { p: 0, start: 20, end: 20 }); // bo'sh oraliq e'tiborsiz
assert.deepEqual(h, [{ p: 0, start: 5, end: 15 }, { p: 1, start: 0, end: 3 }]);
const segs = segments('The quick brown fox jumps', h, 0);
assert.deepEqual(segs, [{ text: 'The q', hl: false }, { text: 'uick brown', hl: true }, { text: ' fox jumps', hl: false }]);
assert.equal(segs.map((s) => s.text).join(''), 'The quick brown fox jumps', 'matn o‘zgarmaydi');
assert.deepEqual(segments('abc', [{ p: 0, start: 1, end: 99 }], 0), [{ text: 'a', hl: false }, { text: 'bc', hl: true }]);
console.log('examAttempt.test: OK');
