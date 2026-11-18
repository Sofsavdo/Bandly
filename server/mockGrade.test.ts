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

// Regressiya: qayta yuborish XP va statistikani takrorlamaydi
{
  const { createDb, join, byToken } = await import('./db');
  const { gradeRequest } = await import('./mockGrade');
  const db = createDb(); const u = join(db, 'Mockchi', Date.UTC(2026, 10, 18, 8));
  const now = Date.UTC(2026, 10, 18, 9);
  const xpOf = () => (db.prepare('SELECT xp FROM players WHERE id = ?').get(byToken(db, u.token).id) as { xp: number }).xp;
  const first = gradeRequest(db, u.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-000001' }, [], now);
  assert.ok(first.xp > 0, 'birinchi urinish XP beradi');
  const same = gradeRequest(db, u.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-000001' }, [], now + 1000);
  assert.equal(same.xp, 0, 'ikki marta yuborilgan submit XP bermaydi');
  const fresh = gradeRequest(db, u.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-000002' }, [], now + 2000);
  assert.equal(fresh.xp, 0, 'yangi attemptId bilan o‘sha kuni XP yig‘ib bo‘lmaydi');
  assert.equal(xpOf(), first.xp);
  const n = (db.prepare('SELECT COUNT(*) AS n FROM mock_stats WHERE test_id = ?').get(t.id) as { n: number }).n;
  assert.equal(n, 2, 'statistika: har urinish bir marta');
  assert.throws(() => gradeRequest(db, '', { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-guest1' }, [], now), (e: { status?: number }) => e.status === 401, 'mehmon Mock Arena ishlata olmaydi');
  assert.throws(() => gradeRequest(db, 'f'.repeat(48), { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-bad01' }, [], now), (e: { status?: number }) => e.status === 401, 'noto‘g‘ri token — 401');
  assert.ok(gradeRequest(db, u.token, { kind: 'reading', testId: t.id, answers: right, attemptId: 'att-000003' }, [], now + 86_400_000).xp > 0, 'ertasi kuni yana');
}
console.log('mockGrade.test: OK');
