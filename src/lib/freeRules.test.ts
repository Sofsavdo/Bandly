import assert from 'node:assert/strict';
import { DEFAULT_LIMITS as LIM, applyUnlock, decide, emptyState, leftToday, nextReset, tashkentDay, weekKey } from './freeRules';

// Toshkent kuni: UTC 19:00 = Toshkent 00:00 (keyingi kun)
assert.equal(tashkentDay(Date.UTC(2026, 10, 18, 18, 59)), '2026-11-18');
assert.equal(tashkentDay(Date.UTC(2026, 10, 18, 19, 0)), '2026-11-19');
assert.equal(nextReset(Date.UTC(2026, 10, 18, 10, 0)), Date.UTC(2026, 10, 18, 19, 0));
assert.equal(weekKey(Date.UTC(2026, 10, 18, 10)), '2026-11-16', 'hafta dushanbadan'); assert.equal(weekKey(Date.UTC(2026, 10, 22, 18)), '2026-11-16'); assert.equal(weekKey(Date.UTC(2026, 10, 22, 19, 30)), '2026-11-23');

const d1 = '2026-11-18', d2 = '2026-11-19';
let s = emptyState();
// Birinchi kun: har kursda 3 ta
for (const id of ['a1-u1-l1', 'a1-u1-l2', 'a1-u1-l3']) { const r = decide(s, 'ge', id, d1, LIM); assert.ok(r.ok, id); s = applyUnlock(s, 'ge', id, d1); }
assert.equal(decide(s, 'ge', 'a1-u2-l1', d1, LIM).ok, false, '4-dars birinchi kuni yopiq');
assert.ok(decide(s, 'ielts', 'ie-rs-l1', d1, LIM).ok, 'boshqa kursning o‘z kvotasi bor');
assert.deepEqual(decide(s, 'ge', 'a1-u1-l2', d1, LIM), { ok: true, already: true, left: 0 }, 'ochilgan dars — takrorlash bepul');
// Ikkinchi kun: 1 ta
assert.equal(leftToday(s, 'ge', d2, LIM), 1);
assert.ok(decide(s, 'ge', 'a1-u2-l1', d2, LIM).ok); s = applyUnlock(s, 'ge', 'a1-u2-l1', d2);
assert.equal(decide(s, 'ge', 'a1-u2-l2', d2, LIM).ok, false);
assert.ok(decide(s, 'ge', 'a1-u1-l1', d2, LIM).ok, 'kechagi dars ham ochiq');
assert.equal(applyUnlock(s, 'ge', 'a1-u1-l1', d2), s, 'qayta ochish holatni o‘zgartirmaydi');
// Sozlanadigan chegaralar
assert.ok(decide(emptyState(), 'sat', 'sat-rw', d1, { ...LIM, firstDay: 0, perDay: 0 }).ok === false);
console.log('freeRules.test: OK');
