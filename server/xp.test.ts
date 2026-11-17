import assert from 'node:assert/strict';
import { byToken, createDb, join } from './db';
import { EVENT_MAX, SOURCE_DAILY, TOTAL_DAILY, awardXp, submitXp } from './xp';

const T0 = Date.UTC(2026, 10, 17, 9);
const db = createDb();
const u = join(db, 'Xpchi', T0);
const id = byToken(db, u.token).id;
const xpNow = () => (db.prepare('SELECT xp FROM players WHERE id = ?').get(id) as { xp: number }).xp;

// Oddiy hodisa va takror id
assert.equal(awardXp(db, id, 'evt-0001', 'lesson', 30, T0), 30);
assert.equal(awardXp(db, id, 'evt-0001', 'lesson', 30, T0), 0, 'bir hodisa bir marta');
// Bitta hodisa chegarasi
assert.equal(awardXp(db, id, 'evt-0002', 'lesson', 9999, T0), EVENT_MAX);
// Manba bo'yicha kunlik chegara
let g = 0; for (let i = 0; i < 10; i++) g += awardXp(db, id, `game-${i}xx`, 'game', 100, T0);
assert.equal(g, SOURCE_DAILY.game);
// Jami kunlik chegara
let t = 30 + EVENT_MAX + g; for (let i = 0; i < 40; i++) t += awardXp(db, id, `oth-${i}xxx`, ['lesson', 'exam', 'practice', 'grammar', 'boss'][i % 5]!, 100, T0);
assert.equal(t, TOTAL_DAILY); assert.equal(xpNow(), TOTAL_DAILY);
// Ertasi kun yana
assert.equal(awardXp(db, id, 'evt-next', 'lesson', 40, T0 + 86_400_000), 40);
// Noto'g'ri qiymatlar
assert.equal(awardXp(db, id, 'evt-neg1', 'lesson', -50, T0 + 86_400_000), 0);
assert.equal(awardXp(db, id, 'x', 'lesson', 10, T0 + 86_400_000), 0, 'noto‘g‘ri id');
// HTTP qatlami: mijoz "mock" manbasini yubora olmaydi; ro'yxat cheklangan
const before = xpNow();
const r = submitXp(db, u.token, [{ id: 'cli-mock-1', source: 'mock', amount: 100 }, { id: 'cli-less-1', source: 'lesson', amount: 10 }], T0 + 86_400_000);
assert.equal(r.accepted, 10); assert.equal(r.xp, before + 10); assert.deepEqual(r.done, ['cli-mock-1', 'cli-less-1']);
assert.equal(submitXp(db, u.token, 'yolgon', T0).accepted, 0);
console.log('xp.test: OK');
