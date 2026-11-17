import assert from 'node:assert/strict';
import { readingTests } from '../src/content/readingTests';
import { isCorrect } from '../src/lib/grade';
import { ApiError } from './db';
import { gradeMock } from './mockGrade';

const t = readingTests[0]!;
const right: Record<number, string | number> = {};
for (const q of t.questions) right[q.id] = q.type === 'fill' ? q.answers[0]! : q.answer;
const all = gradeMock('reading', t.id, right);
assert.equal(all.correct, t.questions.length);
assert.equal(all.total, t.questions.length);
assert.ok(Object.values(all.graded).every((g) => g.correct && g.answer && g.evidence));
const none = gradeMock('reading', t.id, {});
assert.equal(none.correct, 0);
// Natija klient tomonidagi eski baholash bilan bir xil
const half: Record<number, string | number> = {};
t.questions.forEach((q, i) => { if (i % 2 === 0) half[q.id] = right[q.id]!; });
assert.equal(gradeMock('reading', t.id, half).correct, t.questions.filter((q) => isCorrect(q, half[q.id])).length);
assert.throws(() => gradeMock('writing', t.id, {}), (e: ApiError) => e.status === 400);
assert.throws(() => gradeMock('reading', 'yoq', {}), (e: ApiError) => e.status === 404);
assert.equal(gradeMock('reading', t.id, { [t.questions[0]!.id]: { evil: 1 } }).correct, 0, 'noto‘g‘ri turdagi javob hisoblanmaydi');
console.log('mockGrade.test: OK');
