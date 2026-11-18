import assert from 'node:assert/strict';
import { byToken, createDb, join } from './db';
import { EVENT_MAX, SOURCE_DAILY, TOTAL_DAILY, awardXp, eventKey, submitXp } from './xp';
import { tzDay } from './day';

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
const T1 = T0 + 86_400_000; const d1 = tzDay(T1);
const known = { lesson: (x: string) => x === 'a1-u1-l1', unit: (x: string) => x === 'a1-u1' };
const r = submitXp(db, u.token, [{ id: 'cli-mock-1', source: 'mock', amount: 100 }, { id: `lesson:a1-u1-l1:check:${d1}`, source: 'lesson', amount: 10 }], T1, known);
assert.equal(r.accepted, 10); assert.equal(r.xp, before + 10); assert.deepEqual(r.done, ['cli-mock-1', `lesson:a1-u1-l1:check:${d1}`]);
assert.equal(submitXp(db, u.token, 'yolgon', T0).accepted, 0);

// Regressiya: soxta XP hodisalari
const T2 = T0 + 2 * 86_400_000; const d2 = tzDay(T2);
const sub = (ev: object[]) => submitXp(db, u.token, ev, T2, known).accepted;
assert.equal(sub([{ id: 'ref-fake-1', source: 'referral', amount: 100 }]), 0, 'referral XP faqat server beradi');
assert.equal(sub([{ id: 'random-less-1', source: 'lesson', amount: 50 }]), 0, 'darsga bog‘lanmagan lesson hodisasi rad etiladi');
assert.equal(sub([{ id: `lesson:fake-lesson:check:${d2}`, source: 'lesson', amount: 50 }]), 0, 'mavjud bo‘lmagan dars');
assert.equal(sub([{ id: 'lesson:a1-u1-l1:check:2020-01-01', source: 'lesson', amount: 50 }]), 0, 'eski kun bilan qayta yig‘ib bo‘lmaydi');
assert.equal(sub([{ id: `lesson:a1-u1-l1:check:${d2}`, source: 'lesson', amount: 50 }]), 50);
assert.equal(sub([{ id: `lesson:a1-u1-l1:check:${d2}`, source: 'lesson', amount: 50 }]), 0, 'bitta dars kuniga bir marta');
assert.equal(sub([{ id: `lesson:a1-u1-l1:practice:${d2}`, source: 'lesson', amount: 20 }]), 20, 'mashq qismi alohida');
assert.equal(sub([{ id: `boss:a1-u1:${d2}`, source: 'boss', amount: 60 }]), 60);
assert.equal(sub([{ id: `boss:a1-u1:${d2}`, source: 'boss', amount: 60 }, { id: `boss:nope:${d2}`, source: 'boss', amount: 60 }]), 0, 'boss: bo‘lim kuniga bir marta, noma’lum bo‘lim yo‘q');
assert.equal(sub([{ id: 'plc-aaaa-1', source: 'placement', amount: 30 }]), 30);
assert.equal(submitXp(db, u.token, [{ id: 'plc-bbbb-2', source: 'placement', amount: 30 }], T2 + 5 * 86_400_000, known).accepted, 0, 'daraja testi XP bir umrda bir marta');
assert.equal(eventKey('game', 'g-123456', T2), 'g-123456', 'boshqa manbalar kunlik chegara bilan');
console.log('xp.test: OK');
