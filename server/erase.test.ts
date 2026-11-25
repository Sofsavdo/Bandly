import assert from 'node:assert/strict';
import { ApiError, byToken, createDb, join, putProgress, setRole } from './db';
import { ensureMemoryTable } from './coachMemory';
import { awardXp } from './xp';
import { erasePlayer } from './erase';

const T0 = Date.UTC(2026, 10, 25, 9);
const db = createDb();
ensureMemoryTable(db);
db.exec('CREATE TABLE IF NOT EXISTS tg_phones (tg_id INTEGER PRIMARY KEY, phone TEXT NOT NULL, at INTEGER NOT NULL)');

const a = join(db, 'Ochiriluvchi', T0);
const b = join(db, 'Qoluvchi', T0);
const aid = byToken(db, a.token).id;
const bid = byToken(db, b.token).id;
db.prepare("UPDATE players SET tg_id = 777, phone = '+998901234567', pass_hash = 'scrypt$x', full_name = 'Ali Valiyev' WHERE id = ?").run(aid);
db.prepare('INSERT INTO tg_phones (tg_id, phone, at) VALUES (777, ?, ?)').run('+998901234567', T0);
putProgress(db, a.token, { 'bandly.profile.v1': '{"level":"B1"}' }, 0, T0);
putProgress(db, b.token, { 'bandly.profile.v1': '{"level":"A2"}' }, 0, T0);
awardXp(db, aid, 'evt-erase-a', 'lesson', 30, T0);
awardXp(db, bid, 'evt-erase-b', 'lesson', 30, T0);
db.prepare('INSERT INTO coach_memory (player_id, data, updated_at) VALUES (?, ?, ?)').run(aid, '{"goal":"IELTS"}', T0);
db.prepare('INSERT INTO coach_memory (player_id, data, updated_at) VALUES (?, ?, ?)').run(bid, '{"goal":"work"}', T0);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at) VALUES ('pay-a', ?, 'all', 30, 129000, 'paid', ?)").run(aid, T0);
db.prepare("INSERT INTO subscriptions (player_id, track, until) VALUES (?, 'exam', ?)").run(aid, T0 + 30 * 86_400_000);

const count = (sql: string, id: number): number => (db.prepare(sql).get(id) as { n: number }).n;
const r = erasePlayer(db, aid);
assert.ok(Object.keys(r.tables).length >= 3, 'bir nechta jadvaldan o‘chirildi');
// shaxsiy ma'lumotlar yo'q
assert.equal(count('SELECT COUNT(*) AS n FROM progress WHERE player_id = ?', aid), 0, 'progress o‘chdi');
assert.equal(count('SELECT COUNT(*) AS n FROM xp_events WHERE player_id = ?', aid), 0, 'XP hodisalari o‘chdi');
assert.equal(count('SELECT COUNT(*) AS n FROM coach_memory WHERE player_id = ?', aid), 0, 'ustoz xotirasi o‘chdi');
assert.equal(count('SELECT COUNT(*) AS n FROM sessions WHERE player_id = ?', aid), 0, 'sessiyalar o‘chdi');
assert.equal((db.prepare('SELECT COUNT(*) AS n FROM tg_phones WHERE tg_id = 777').get() as { n: number }).n, 0, 'Telegram raqami o‘chdi');
assert.throws(() => byToken(db, a.token), 'eski token ishlamaydi');
// hisob anonim
const row = db.prepare('SELECT nickname, phone, pass_hash, tg_id, full_name, xp FROM players WHERE id = ?').get(aid) as Record<string, unknown>;
assert.deepEqual({ ...row }, { nickname: `deleted-${aid}`, phone: null, pass_hash: null, tg_id: null, full_name: null, xp: 0 });
// to'lov va obuna hisob-kitob uchun qoladi
assert.equal(count('SELECT COUNT(*) AS n FROM payments WHERE player_id = ?', aid), 1, 'to‘lov yozuvi qoldi');
assert.equal(count('SELECT COUNT(*) AS n FROM subscriptions WHERE player_id = ?', aid), 1, 'obuna yozuvi qoldi');
// boshqa foydalanuvchi tegilmagan
assert.equal(count('SELECT COUNT(*) AS n FROM progress WHERE player_id = ?', bid), 1);
assert.equal(count('SELECT COUNT(*) AS n FROM coach_memory WHERE player_id = ?', bid), 1);
assert.equal(byToken(db, b.token).nickname, 'Qoluvchi');
// laqab bo'shadi: yangi foydalanuvchi shu laqabni olishi mumkin
assert.equal(join(db, 'Ochiriluvchi', T0 + 1000).nickname, 'Ochiriluvchi');
// xodim hisobini o'chirib bo'lmaydi; yo'q hisob — 404
setRole(db, 'Qoluvchi', 'admin');
assert.throws(() => erasePlayer(db, bid), (e: unknown) => e instanceof ApiError && e.status === 403);
assert.throws(() => erasePlayer(db, 99999), (e: unknown) => e instanceof ApiError && e.status === 404);
console.log('erase.test: OK');
