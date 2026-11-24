import assert from 'node:assert/strict';
import { byToken, createDb, join } from './db';
import { awardXp } from './xp';
import { recordResult } from './certificates';
import { cohortReport, ensureUserEventsTable, recordUserEvent } from './userEvents';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 22, 10, 0);
const db = createDb();
ensureUserEventsTable(db);
const T0 = NOW - 10 * DAY;
const a = byToken(db, join(db, 'Ann', T0).token), b = byToken(db, join(db, 'Ben', T0).token), c = byToken(db, join(db, 'Cid', T0).token);
const old = byToken(db, join(db, 'Old', NOW - 60 * DAY).token); // kohortaga kirmaydi

// Deduplikatsiya: bir kunda bir hodisa bir marta sanaladi, noma'lum nom rad etiladi
assert.equal(recordUserEvent(db, a.id, 'lesson_start', T0 + 3600_000), 'new');
assert.equal(recordUserEvent(db, a.id, 'lesson_start', T0 + 7200_000), 'repeat');
assert.equal(recordUserEvent(db, a.id, 'hack', T0), 'rejected');
assert.equal(recordUserEvent(db, -1, 'lesson_start', T0), 'rejected');
recordUserEvent(db, b.id, 'lesson_start', T0 + DAY);
recordUserEvent(db, old.id, 'lesson_start', T0 + DAY);
recordUserEvent(db, a.id, 'onboarding_done', T0 + 600_000);

// a: 1-kuni dars (faollashdi), 7-kuni faol, to'lov ×2 (uzaytirdi); b: 9-kuni dars (7 kundan keyin — faollashmagan); c: hech narsa
awardXp(db, a.id, 'ls-a-00001', 'lesson', 30, T0 + DAY);
awardXp(db, a.id, 'ls-a-00007', 'lesson', 30, T0 + 7 * DAY);
awardXp(db, b.id, 'ls-b-00009', 'lesson', 30, T0 + 9 * DAY);
awardXp(db, old.id, 'ls-o-00001', 'lesson', 30, T0 + DAY);
for (const [id, t] of [['p1', T0 + 2 * DAY], ['p2', T0 + 8 * DAY]] as const) db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES (?, ?, 'exam', 30, 99000, 'success', ?, ?)").run(id, a.id, t, t);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at) VALUES ('p3', ?, 'exam', 30, 99000, 'cancelled', ?)").run(c.id, T0 + DAY);
recordResult(db, a.id, { module: 'ai', kind: 'writing', testId: 'ai-writing', title: 'Writing', attemptKey: 'ai:writing:x1', band: 6 }, T0 + 3 * DAY);
db.prepare("INSERT INTO ai_cost_events (ts, day, player_id, feature, provider, model, units, unit_kind, cost_usd) VALUES (?, '2026-11-15', ?, 'writing_eval', 'gemini', 'm', 100, 'tokens', 0.02)").run(T0 + 3 * DAY, a.id);

const r = cohortReport(db, T0 - 1000, NOW, NOW);
assert.equal(r.signups, 3, 'eski o‘quvchi kohortaga kirmaydi');
const step = (k: string) => r.steps.find((s) => s.key === k)!;
assert.equal(step('lesson_start').users, 2, 'noyob o‘quvchilar (a ikki marta yuborgan)');
assert.equal(step('lesson_done').users, 2);
assert.equal(step('onboarding_done').users, 1);
assert.equal(step('writing_evaluated').users, 1);
assert.equal(step('checkout_start').users, 2, 'to‘lov yaratgan (bekor bo‘lsa ham) — a va c');
assert.equal(step('payment_done').users, 1);
assert.equal(step('lesson_done').pct, 66.7);
assert.equal(r.activated, 1, 'faqat 7 kun ichidagi dars faollashtiradi');
assert.equal(r.paid, 1); assert.equal(r.renewed, 1); assert.equal(r.renewalPct, 100);
// Tariflar bo'yicha daromad: faqat muvaffaqiyatli to'lovlar, tarif bo'yicha guruhlangan
assert.deepEqual(r.period.byPlan, [{ plan: 'exam', payments: 2, revenue: 198000 }]);
assert.equal(r.activationToPaidPct, 100); assert.equal(r.freeToPaidPct, 33.3);
assert.equal(r.retention.d1, 33.3); assert.equal(r.retention.d7, 33.3); assert.equal(r.retention.d30, null, '30 kun hali o‘tmagan');
assert.equal(r.period.activeUsers, 3, 'davr: a, b va eski o‘quvchi');
assert.equal(r.period.revenue, 198000); assert.equal(r.period.arpu, 66000);
assert.equal(r.period.aiEvals, 1); assert.equal(r.period.aiUsdPerEval, 0.02);
assert.ok(!JSON.stringify(r).includes('Ann'), 'hisobotda shaxsiy ma’lumot yo‘q');
console.log('userEvents.test: OK');
