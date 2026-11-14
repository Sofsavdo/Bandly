import assert from 'node:assert/strict';
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: () => undefined, clear: () => mem.clear(), key: () => null, length: 0 } as Storage;
const L = await import('./planLog');

L.recordPlanned('2026-11-10', ['a', 'b']); L.recordPlanned('2026-11-10', ['x']);
assert.deepEqual(L.loadLog()['2026-11-10'], ['a', 'b'], 'first plan of the day is kept');
const log = { '2026-11-10': ['a', 'b'], '2026-11-11': ['a', 'c'], '2026-11-12': ['b', 'c'], '2026-11-14': ['z'] };
const answered = new Set(['a@2026-11-10', 'c@2026-11-12']);
const r = L.review(log, {}, '2026-11-14', (id, d) => answered.has(`${id}@${d}`));
assert.deepEqual([r.days, r.planned, r.done], [3, 6, 2], 'today is excluded'); assert.ok(Math.abs(r.rate! - 1 / 3) < 1e-9);
assert.deepEqual(L.adjustMinutes(30, r), { minutes: 20, lowered: true, suggestMore: false });
assert.deepEqual(L.adjustMinutes(10, r), { minutes: 10, lowered: false, suggestMore: false }, 'never below 10');
assert.equal(L.review({ '2026-11-12': ['a'] }, {}, '2026-11-14').rate, null, 'needs ≥ 3 days');
const full = L.review({ d1: ['a'], d2: ['a'], d3: ['a'], d4: ['a'], d5: ['a'] } as never, {}, 'z', () => true);
assert.deepEqual(L.adjustMinutes(20, full), { minutes: 20, lowered: false, suggestMore: true }, 'suggest, never auto-raise');
// default checker uses the mastery record's lastDay
const rec = { m: 0.5, attempts: 1, distinctDays: 1, lastDay: '2026-11-11', lastSeen: 0, recent: [true], streak: 1, everKnown: false, dueAt: 0 };
assert.equal(L.review({ '2026-11-11': ['n'], '2026-11-12': ['n'], '2026-11-13': ['n'] }, { n: rec }, '2026-11-14').done, 1);
console.log('planLog.test: OK');
