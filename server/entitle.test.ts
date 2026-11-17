import assert from 'node:assert/strict';
import { ApiError, createDb, join } from './db';
import { assessLimit, assessmentUsage, planOf, refundAssessment, useAssessment } from './entitle';
import { extend } from './payments';

const T0 = Date.UTC(2026, 10, 17);
const db = createDb();
const free = join(db, 'Free1', T0), gen = join(db, 'Gen1', T0), ex = join(db, 'Exam1', T0), all = join(db, 'All1', T0);
const id = (nick: string) => (db.prepare('SELECT id FROM players WHERE nickname = ?').get(nick) as { id: number }).id;
extend(db, id('Gen1'), 'grammar', 30, T0);
extend(db, id('Exam1'), 'exam', 30, T0);
extend(db, id('All1'), 'exam', 30, T0); extend(db, id('All1'), 'grammar', 30, T0);

assert.deepEqual([planOf(db, id('Free1'), T0), planOf(db, id('Gen1'), T0), planOf(db, id('Exam1'), T0), planOf(db, id('All1'), T0)], [null, 'general', 'exam', 'all']);
assert.equal(planOf(db, id('Exam1'), T0 + 31 * 86_400_000), null, 'muddati tugagan obuna hisoblanmaydi');
assert.deepEqual([assessLimit('exam', 'writing'), assessLimit('all', 'speaking'), assessLimit('general', 'writing'), assessLimit(null, 'speaking')], [10, 20, 0, 0]);

// Bepul va General — AI baholash yo'q (402); mijoz "plan" belgisiga ishonilmaydi
assert.throws(() => useAssessment(db, free.token, 'writing', T0), (e: ApiError) => e.status === 402);
assert.throws(() => useAssessment(db, gen.token, 'speaking', T0), (e: ApiError) => e.status === 402);
assert.throws(() => useAssessment(db, 'yolgon', 'writing', T0), (e: ApiError) => e.status === 401);

// EXAM: oyiga 10 ta; 11-chisi rad etiladi; xato bo'lsa qaytariladi; yangi oyda yangilanadi
for (let i = 1; i <= 10; i++) assert.equal(useAssessment(db, ex.token, 'writing', T0).used, i);
assert.throws(() => useAssessment(db, ex.token, 'writing', T0), (e: ApiError) => e.status === 429);
refundAssessment(db, id('Exam1'), 'writing', T0);
assert.equal(useAssessment(db, ex.token, 'writing', T0).used, 10, 'provayder xatosidan keyin qaytarilgan kvota qayta ishlatiladi');
assert.equal(useAssessment(db, ex.token, 'speaking', T0).used, 1, 'writing va speaking alohida hisoblanadi');
assert.equal(useAssessment(db, ex.token, 'writing', Date.UTC(2026, 11, 2)).used, 1, 'yangi oy');
assert.deepEqual(assessmentUsage(db, id('All1'), T0), { writing: { used: 0, limit: 20 }, speaking: { used: 0, limit: 20 } });
console.log('entitle.test: OK');
