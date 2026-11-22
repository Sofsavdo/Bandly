import assert from 'node:assert/strict';
import { examPlan, HOURS_PER_HALF_BAND } from './examPlan';

const NOW = Date.UTC(2026, 10, 22);
const DAY = 86_400_000;
const base = { now: NOW, minutesPerDay: 30, current: 5.5, target: 6.5, weakest: ['writing' as const], lastMockAt: null };

assert.equal(examPlan({ ...base, examAt: null }).risk, 'unknown', 'sana yo‘q — baho yo‘q');
assert.equal(examPlan({ ...base, examAt: NOW - DAY }).risk, 'past');
const unknown = examPlan({ ...base, current: null, examAt: NOW + 70 * DAY });
assert.equal(unknown.risk, 'unknown', 'hozirgi ball yo‘q — taxmin qilinmaydi'); assert.equal(unknown.gap, null);
assert.equal(examPlan({ ...base, current: 0, examAt: NOW + 70 * DAY }).risk, 'unknown', '0 ball = ma’lumot yo‘q');
assert.equal(examPlan({ ...base, current: 7, examAt: NOW + 70 * DAY }).risk, 'reached');

// 70 kun × 5/7 × 0,5 soat = 25 soat; kerak: 2 × 50 = 100 soat → unlikely
const p = examPlan({ ...base, examAt: NOW + 70 * DAY });
assert.equal(p.availableHours, 25); assert.equal(p.neededHours, 2 * HOURS_PER_HALF_BAND); assert.equal(p.risk, 'unlikely');
// 180 kun × 5/7 × 1 soat ≈ 129 soat ≥ 100 × 1,2 → ok
assert.equal(examPlan({ ...base, minutesPerDay: 60, examAt: NOW + 180 * DAY }).risk, 'ok');
assert.equal(examPlan({ ...base, minutesPerDay: 60, examAt: NOW + 120 * DAY }).risk, 'tight');

// Bosqichlar: birinchi fokus — eng zaif ko'nikma; oxirgi hafta — takrorlash va mock; oxirgi 4 haftada har hafta mock
const m = examPlan({ ...base, examAt: NOW + 6 * 7 * DAY }).milestones;
assert.equal(m.length, 6); assert.equal(m[0]!.focus, 'writing'); assert.equal(m[0]!.note, 'start');
assert.equal(m.at(-1)!.focus, 'revision'); assert.equal(m.at(-1)!.note, 'exam_week');
assert.deepEqual(m.map((x) => x.mock), [false, true, true, true, true, true]);
assert.equal(examPlan({ ...base, examAt: NOW + 400 * DAY }).milestones.length, 12, 'ko‘pi bilan 12 hafta ko‘rsatiladi');
// Mock jadvali: hech qachon topshirmagan — bugun; 4 haftadan kam qolganda har 7 kunda
assert.equal(p.nextMockInDays, 0);
assert.equal(examPlan({ ...base, examAt: NOW + 20 * DAY, lastMockAt: NOW - 3 * DAY }).nextMockInDays, 4);
assert.equal(examPlan({ ...base, examAt: NOW + 90 * DAY, lastMockAt: NOW - 3 * DAY }).nextMockInDays, 11);
// Yuk tanlangan vaqtdan oshmaydi: availableHours faqat minutesPerDay ga proporsional
assert.equal(examPlan({ ...base, minutesPerDay: 10, examAt: NOW + 70 * DAY }).availableHours, 8);
console.log('examPlan.test: OK');
