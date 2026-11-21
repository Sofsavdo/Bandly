import assert from 'node:assert/strict';
import { createDb, join } from './db';
import { grant } from './payments';
import { findUsers } from './adminUsers';

const db = createDb();
const T = Date.UTC(2026, 10, 1);
join(db, 'Ali_100', T); join(db, 'Aliya', T + 1000); join(db, 'Vali', T + 2000); join(db, 'x_y', T + 3000);
grant(db, 'Aliya', 'all', 30, T);
const aliyaId = (db.prepare("SELECT id FROM players WHERE nickname = 'Aliya'").get() as { id: number }).id;
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, hamyon_amount, status, created_at, paid_at) VALUES ('p1', ?, 'all', 30, 129000, 129000, 'paid', ?, ?)").run(aliyaId, T, T + 5);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at) VALUES ('p2', ?, 'all', 30, 129000, 'cancel', ?)").run(aliyaId, T);

const r = findUsers(db, 'ali');
assert.deepEqual(r.map((u) => u.nickname).sort(), ['Ali_100', 'Aliya', 'Vali'].sort(), 'qism bo‘yicha, harf farqsiz');
const a = findUsers(db, 'aliya')[0]!;
assert.equal(a.nickname, 'Aliya', 'aniq moslik birinchi');
assert.equal(a.subs.length, 3, 'All Access — 3 yo‘nalish'); assert.ok(a.subs.every((s) => s.until > T));
assert.equal(a.paidCount, 1); assert.equal(a.paidSum, 129000, 'faqat to‘langanlar'); assert.equal(a.lastPaidAt, T + 5);
assert.deepEqual(findUsers(db, '_').map((u) => u.nickname).sort(), ['Ali_100', 'x_y'].sort(), '"_" oddiy belgi (har qanday harf emas)');
assert.equal(findUsers(db, '').length, 4, 'bo‘sh so‘rov — eng yangilar');
assert.equal(findUsers(db, '')[0]!.nickname, 'x_y');
assert.ok(!('token' in a), 'token qaytarilmaydi');
console.log('adminUsers: OK');
