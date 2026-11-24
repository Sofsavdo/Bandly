import assert from 'node:assert/strict';
import { accuracyPct, addTally, emptyTally, fmtDuration, unitDots, weekDots, weekdayNames } from './lessonStats';

let t = emptyTally();
assert.equal(accuracyPct(t), 0, 'javob yo‘q — 0');
for (const ok of [true, true, false, true]) t = addTally(t, ok);
assert.deepEqual(t, { ok: 3, total: 4 }); assert.equal(accuracyPct(t), 75);
assert.equal(accuracyPct({ ok: 1, total: 3 }), 33);

assert.equal(fmtDuration(0), '00:00'); assert.equal(fmtDuration(281_000), '04:41'); assert.equal(fmtDuration(61_400), '01:01');
assert.equal(fmtDuration(-5), '00:00'); assert.equal(fmtDuration(10 * 3600_000), '99:59', 'juda uzoq — 99:59 dan oshmaydi');

assert.deepEqual(unitDots(['a', 'b', 'c'], (id) => id === 'a', 'b'), [{ done: true, now: false }, { done: true, now: true }, { done: false, now: false }]);

// 2026-11-24 — seshanba. Seriya 3 kun (22, 23, 24-noyabr) → dushanba, seshanba — bajarilgan.
const w = weekDots('2026-11-24', '2026-11-24', 2);
assert.equal(w.length, 7); assert.equal(w[0]!.day, '2026-11-23'); assert.equal(w[6]!.day, '2026-11-29');
assert.deepEqual(w.map((x) => x.state), ['done', 'done', 'todo', 'todo', 'todo', 'todo', 'todo']);
// bugun hali bajarilmagan (oxirgi faol kun kecha, seriya 1) — dushanba bajarilgan, bugun "today"
assert.deepEqual(weekDots('2026-11-24', '2026-11-23', 1).map((x) => x.state), ['done', 'today', 'todo', 'todo', 'todo', 'todo', 'todo']);
// seriya o'tgan haftadan davom etadi: 5 kun, oxirgisi seshanba → dushanba va seshanba
assert.deepEqual(weekDots('2026-11-24', '2026-11-24', 5).slice(0, 2).map((x) => x.state), ['done', 'done']);
// hech qachon faol bo'lmagan
assert.ok(weekDots('2026-11-24', null, 0).every((x) => x.state !== 'done'));
// yakshanba — hafta oxiri
assert.equal(weekDots('2026-11-29', '2026-11-29', 1)[6]!.state, 'done');
assert.deepEqual(weekdayNames('en'), ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'dushanbadan boshlanadi');
for (const lang of ['uz', 'ru', 'kk', 'ky', 'tg']) { const n = weekdayNames(lang); assert.equal(n.length, 7, lang); assert.ok(n.every((x) => x.length >= 1), lang); }
assert.equal(weekdayNames('xx-invalid-lang-!!').length, 7, 'noma’lum til — ingliz tiliga qaytadi');
console.log('lessonStats.test: OK');
