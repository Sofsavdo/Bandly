import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { byToken, createDb, join, loginTelegram } from './db';
import { botFromEnv, handleUpdate, nickFrom, TgAuthError, verifyInitData, verifyWidget, webhookSecret } from './telegram';

const TOKEN = '123456789:AAtest_token_value_for_unit_tests_only';
const now = 1_800_000_000;
const dcs = (f: Record<string, string>) => Object.keys(f).filter((k) => k !== 'hash').sort().map((k) => `${k}=${f[k]}`).join('\n');

// Login Widget
const w: Record<string, string> = { id: '42', first_name: 'Ali', username: 'ali_uz', auth_date: String(now - 10) };
w.hash = createHmac('sha256', createHash('sha256').update(TOKEN).digest()).update(dcs(w)).digest('hex');
assert.deepEqual(verifyWidget(w, TOKEN, now), { id: 42, first_name: 'Ali', last_name: undefined, username: 'ali_uz' });
assert.throws(() => verifyWidget({ ...w, first_name: 'Vali' }, TOKEN, now), TgAuthError, 'o‘zgartirilgan maydon');
assert.throws(() => verifyWidget(w, '123456789:AAother_token_value_xxxxxxxxxxxxxxx', now), TgAuthError, 'boshqa bot');
assert.throws(() => verifyWidget(w, TOKEN, now + 400), /eskirgan/, '5 daqiqadan eski');
assert.throws(() => verifyWidget({ ...w, hash: 'zz' }, TOKEN, now), TgAuthError);

// Mini App initData
const user = JSON.stringify({ id: 77, first_name: 'Dilnoza', last_name: 'K', language_code: 'uz' });
const f: Record<string, string> = { auth_date: String(now - 60), query_id: 'AAE1', user, signature: 'sig123' };
const secret = createHmac('sha256', 'WebAppData').update(TOKEN).digest();
f.hash = createHmac('sha256', secret).update(dcs(f)).digest('hex');
const initData = new URLSearchParams(f).toString();
assert.equal(verifyInitData(initData, TOKEN, now).id, 77);
// "signature"siz imzolangan variant ham qabul qilinadi
const f2 = { ...f }; f2.hash = createHmac('sha256', secret).update(Object.keys(f2).filter((k) => k !== 'hash' && k !== 'signature').sort().map((k) => `${k}=${f2[k as keyof typeof f2]}`).join('\n')).digest('hex');
assert.equal(verifyInitData(new URLSearchParams(f2).toString(), TOKEN, now).id, 77);
assert.throws(() => verifyInitData(initData.replace('Dilnoza', 'Hacker'), TOKEN, now), TgAuthError);
assert.throws(() => verifyInitData(initData, TOKEN, now + 7200), /eskirgan/);
// Widget imzosi Mini App sifatida o'tmaydi (kalitlar har xil)
assert.throws(() => verifyInitData(new URLSearchParams(w).toString(), TOKEN, now), TgAuthError);

// Laqab
assert.equal(nickFrom({ id: 1, username: 'ali_uz' }), 'ali_uz');
assert.equal(nickFrom({ id: 1, first_name: 'Ali', last_name: 'Valiyev' }), 'Ali Valiyev');
assert.equal(nickFrom({ id: 12345, first_name: '🙂' }), 'Talaba2345');

// Hisob: yangi, qayta kirish, eski hisobni bog'lash, laqab bandligi
const db = createDb();
const a = loginTelegram(db, 42, 'ali_uz');
assert.equal(a.created, true);
const again = loginTelegram(db, 42, 'boshqa');
assert.equal(byToken(db, again.token).id, byToken(db, a.token).id, 'bir Telegram id — bitta hisob');
assert.notEqual(again.token, a.token, 'har kirish — alohida qurilma sessiyasi');
const legacy = join(db, 'Sardor');
const linked = loginTelegram(db, 99, 'sardor_tg', legacy.token);
assert.deepEqual([byToken(db, linked.token).id, linked.nickname, linked.linked], [byToken(db, legacy.token).id, 'Sardor', true], 'eski hisob XP/obunasi bilan bog‘lanadi');
assert.equal(loginTelegram(db, 100, 'x_y', legacy.token).created, true, 'boshqa Telegram’ga bog‘langan hisobni qayta bog‘lab bo‘lmaydi');
const dup = loginTelegram(db, 101, 'ali_uz');
assert.ok(dup.created && dup.nickname !== 'ali_uz' && dup.nickname.startsWith('ali_uz'), 'band laqabga raqam qo‘shiladi');
// Migratsiya: eski sxemali fayl bazasida ikki marta ishga tushsa ham buzilmaydi, ma'lumot saqlanadi
{
  const { mkdtempSync } = await import('node:fs'); const { tmpdir } = await import('node:os'); const { join: pj } = await import('node:path');
  const { DatabaseSync } = await import('node:sqlite');
  const file = pj(mkdtempSync(pj(tmpdir(), 'bandly-')), 'old.sqlite');
  const old = new DatabaseSync(file);
  old.exec("CREATE TABLE players (id INTEGER PRIMARY KEY AUTOINCREMENT, token TEXT NOT NULL UNIQUE, nickname TEXT NOT NULL, xp INTEGER NOT NULL DEFAULT 0, streak INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL); INSERT INTO players (token, nickname, xp, created_at, updated_at) VALUES ('abababababababababababababababababababababababab', 'Eski', 500, 1, 1);");
  old.close();
  createDb(file).close();
  const d2 = createDb(file);
  assert.equal((d2.prepare("SELECT xp FROM players WHERE token='abababababababababababababababababababababababab'").get() as { xp: number }).xp, 500);
  assert.equal(loginTelegram(d2, 7, 'yangi', 'abababababababababababababababababababababababab').linked, true);
  d2.close();
}

// Bot
assert.equal(botFromEnv({}), null);
assert.equal(botFromEnv({ TELEGRAM_BOT_TOKEN: 'bad' }), null);
assert.equal(botFromEnv({ TELEGRAM_BOT_TOKEN: TOKEN, RAILWAY_PUBLIC_DOMAIN: 'x.up.railway.app' })?.publicUrl, 'https://x.up.railway.app');
assert.equal(webhookSecret(TOKEN).length, 48);
assert.notEqual(webhookSecret(TOKEN), webhookSecret(TOKEN + 'x'));
const r = handleUpdate({ message: { chat: { id: 5, type: 'private' }, from: { id: 5, first_name: 'Ali' }, text: '/start' } }, 'https://b.app');
assert.equal(r?.method, 'sendMessage');
assert.match(JSON.stringify(r?.body), /https:\/\/b\.app\/\?tg=1&r=%2Fmocks/);
assert.equal(handleUpdate({ message: { chat: { id: -5, type: 'group' }, text: '/start' } }, 'https://b.app'), null, 'guruhlarga javob yo‘q');
assert.match(JSON.stringify(handleUpdate({ message: { chat: { id: 5, type: 'private' }, text: '/mock' } }, 'https://b.app')?.body), /Mock testni ochish/);
console.log('telegram.test: OK');
