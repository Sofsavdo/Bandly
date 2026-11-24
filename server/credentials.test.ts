import assert from 'node:assert/strict';
import { AttemptLimiter, hashPassword, loginGoogle, normPhone, passwordProblem, phoneRecord, registerPhone, sessionFor, verifyPassword } from './credentials';
import { ApiError, createDb, getProgress, join, playerIdOf, putProgress } from './db';

// ---- Telefon raqam ----
for (const [raw, want] of [['+998 90 123-45-67', '+998901234567'], ['998901234567', '+998901234567'], ['90 123 45 67', '+998901234567'], ['(90) 123-45-67', '+998901234567'], ['+1 (415) 555-0132', '+14155550132']] as const) assert.equal(normPhone(raw), want, raw);
for (const bad of ['', '123', 'abcdefghi', '+998 90 123', '99890123456789', '0901234567', null, undefined, 42, '9989012345678']) assert.equal(normPhone(bad), null, String(bad));

// ---- Parol ----
assert.equal(passwordProblem('abc12345'), null);
for (const bad of ['short', '1234567', 'aaaaaaaa', '', 'x'.repeat(129), 5, undefined]) assert.ok(passwordProblem(bad), String(bad));
assert.ok(passwordProblem('998901234567', '+998901234567'), 'parol = telefon raqam bo‘lmasin');
const h1 = await hashPassword('To‘g‘ri-parol 123'), h2 = await hashPassword('To‘g‘ri-parol 123');
assert.match(h1, /^scrypt\$16384\$[A-Za-z0-9+/=]+\$[A-Za-z0-9+/=]+$/);
assert.notEqual(h1, h2, 'har safar boshqa tuz');
assert.ok(!h1.includes('parol'), 'xeshda parol ko‘rinmaydi');
assert.equal(await verifyPassword('To‘g‘ri-parol 123', h1), true);
assert.equal(await verifyPassword('to‘g‘ri-parol 123', h1), false, 'harf registri muhim');
assert.equal(await verifyPassword('boshqa', h1), false);
for (const broken of [null, undefined, '', 'plain', 'scrypt$1$x$y', 'scrypt$16384$$']) assert.equal(await verifyPassword('To‘g‘ri-parol 123', broken as string | null), false, `buzuq xesh: ${broken}`);

// ---- Urinishlar cheklovi ----
{
  const l = new AttemptLimiter(3, 1000);
  l.check('a', 0); l.fail('a', 0); l.fail('a', 10); l.check('a', 20);
  l.fail('a', 30);
  assert.throws(() => l.check('a', 40), (e: unknown) => e instanceof ApiError && e.status === 429);
  l.check('b', 40); // boshqa kalit ta'sirlanmaydi
  l.check('a', 1500); // oyna tugadi
  l.fail('a', 1500); l.fail('a', 1501); l.ok('a'); l.check('a', 1502); // muvaffaqiyatdan keyin tozalanadi
}

// ---- Baza: ro'yxatdan o'tish, kirish, bog'lash ----
const db = createDb(':memory:');
const phone = '+998901234567';
const reg = registerPhone(db, phone, h1, 'Ali', undefined);
assert.equal(reg.nickname, 'Ali'); assert.equal(reg.linked, false); assert.ok(playerIdOf(db, reg.token));
assert.throws(() => registerPhone(db, phone, h1, 'Vali'), (e: unknown) => e instanceof ApiError && e.status === 409, 'raqam band');
const rec = phoneRecord(db, phone)!;
assert.equal(rec.pass_hash, h1); assert.equal(rec.nickname, 'Ali');
assert.equal(phoneRecord(db, '+998909999999'), undefined);
const t2 = sessionFor(db, rec.id); assert.notEqual(t2, reg.token, 'har kirish — yangi sessiya'); assert.equal(playerIdOf(db, t2), rec.id);
// laqab: yaroqsiz yoki band bo'lsa — avtomatik
assert.match(registerPhone(db, '+998901112233', h1, 'x', undefined).nickname, /^Foydalanuvchi 2233$/);
assert.match(registerPhone(db, '+998901112244', h1, 'Ali', undefined).nickname, /^Ali\d+$/, 'band laqab — raqam qo‘shiladi');
// Qurilmadagi eski hisobga bog'lash: XP/progress saqlanadi, yangi hisob ochilmaydi
const legacy = join(db, 'Eski');
putProgress(db, legacy.token, { 'bandly.lessons.v1': '{"a":1}' }, 0);
const linked = registerPhone(db, '+998933334455', h1, 'Yangi', legacy.token);
assert.equal(linked.linked, true); assert.equal(linked.nickname, 'Eski');
assert.equal(playerIdOf(db, linked.token), playerIdOf(db, legacy.token), 'bitta hisob');
assert.deepEqual(getProgress(db, linked.token).data, { 'bandly.lessons.v1': '{"a":1}' });
// Allaqachon doimiy identifikatorli hisob bog'lanmaydi (birovning hisobiga boshqa raqam ulab bo'lmaydi)
assert.equal(registerPhone(db, '+998935556677', h1, 'Z', linked.token).linked, false, 'phone bor hisob legacy emas');

// ---- Google ----
const g = loginGoogle(db, '1234567890', 'Gulnora', undefined);
assert.equal(g.created, true); assert.equal(g.nickname, 'Gulnora');
const g2 = loginGoogle(db, '1234567890', 'Boshqa', undefined);
assert.equal(g2.created, false); assert.equal(playerIdOf(db, g2.token), playerIdOf(db, g.token), 'bitta sub — bitta hisob');
const leg2 = join(db, 'Eski2');
const g3 = loginGoogle(db, '5555555555', '', leg2.token);
assert.equal(g3.linked, true); assert.equal(g3.nickname, 'Eski2');
assert.match(loginGoogle(db, '777777777', '', undefined).nickname, /^Foydalanuvchi/);
assert.equal(db.prepare('SELECT COUNT(*) AS n FROM players WHERE google_sub IS NOT NULL').get()!.n, 3);
// Parol/telefon/google ustunlari bir-biriga to'qnashmaydi
assert.equal(db.prepare('SELECT phone, pass_hash FROM players WHERE google_sub = ?').get('1234567890')!.phone, null);
console.log('credentials.test: OK');
