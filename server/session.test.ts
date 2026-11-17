import assert from 'node:assert/strict';
import { ApiError, byToken, createDb, hashToken, join, loginTelegram, revokeSession } from './db';

const db = createDb();
// Yangi hisob: bazada xom token yo'q, faqat xesh
const a = join(db, 'Aziz');
assert.match(a.token, /^[a-f0-9]{48}$/);
const raw = db.prepare('SELECT token FROM players WHERE nickname = ?').get('Aziz') as { token: string };
assert.notEqual(raw.token, a.token, 'players.token ustunida mijoz tokeni saqlanmaydi');
assert.ok(db.prepare('SELECT 1 FROM sessions WHERE token_hash = ?').get(hashToken(a.token)), 'sessiya xeshi bor');
assert.equal(JSON.stringify(db.prepare('SELECT * FROM sessions').all()).includes(a.token), false, 'xom token hech qayerda yo‘q');

// Eski (migratsiyadan oldingi) token: ishlaydi va birinchi ishlatilganda sessiyaga ko'chadi
const old = 'cd'.repeat(24);
db.prepare('INSERT INTO players (token, nickname, created_at, updated_at) VALUES (?, ?, 1, 1)').run(old, 'Eski');
assert.equal(byToken(db, old).nickname, 'Eski');
assert.ok(db.prepare('SELECT 1 FROM sessions WHERE token_hash = ?').get(hashToken(old)));

// Ikki qurilma: alohida tokenlar, bittasidan chiqish ikkinchisini buzmaydi
const t1 = loginTelegram(db, 5, 'dev').token, t2 = loginTelegram(db, 5, 'dev').token;
revokeSession(db, t1);
assert.throws(() => byToken(db, t1), (e: ApiError) => e.status === 401, 'chiqilgan qurilma tokeni ishlamaydi');
assert.equal(byToken(db, t2).nickname, 'dev');
// Eski tokendan chiqish — u ham bekor bo'ladi
revokeSession(db, old);
assert.throws(() => byToken(db, old), (e: ApiError) => e.status === 401);
// Noto'g'ri shakl
assert.throws(() => byToken(db, 'x'), (e: ApiError) => e.status === 401);
console.log('session.test: OK');
