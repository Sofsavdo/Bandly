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
// Bot profili (rebrend): ko'rinadigan nom/tavsif faqat farq qilsa yoziladi; xato sayt ishga tushishini to'xtatmaydi
{
  const { syncBotProfile, BOT_PROFILE, setupBot } = await import('./telegram');
  const state: Record<string, string> = { name: 'Bandly', short_description: '', description: BOT_PROFILE.description };
  const calls: string[] = [];
  const fake = (async (url: string, init: { body: string }) => {
    const m = url.split('/').pop()!; calls.push(m); const b = JSON.parse(init.body || '{}') as Record<string, string>;
    const map: Record<string, string> = { getMyName: 'name', getMyShortDescription: 'short_description', getMyDescription: 'description' };
    if (m === 'getMe') return { json: async () => ({ ok: true, result: { username: 'Bandly_robot' } }) };
    if (map[m]) return { json: async () => ({ ok: true, result: { [map[m]!]: state[map[m]!] } }) };
    if (m.startsWith('setMy')) { Object.assign(state, b); return { json: async () => ({ ok: true, result: true }) }; }
    return { json: async () => ({ ok: true, result: true }) };
  }) as never;
  assert.deepEqual(await syncBotProfile('t', fake), ['setMyName', 'setMyShortDescription'], 'faqat farq qilganlar yoziladi');
  assert.equal(state.name, BOT_PROFILE.name);
  assert.ok(!/Bandly/.test(BOT_PROFILE.name + BOT_PROFILE.short + BOT_PROFILE.description), 'profil matnlarida eski brend yo‘q');
  assert.ok(BOT_PROFILE.name.length <= 64 && BOT_PROFILE.short.length <= 120 && BOT_PROFILE.description.length <= 512, 'Telegram chegaralari');
  calls.length = 0;
  assert.deepEqual(await syncBotProfile('t', fake), [], 'ikkinchi ishga tushishda hech narsa yozilmaydi');
  const broken = (async (url: string) => ({ json: async () => (url.endsWith('getMe') ? { ok: true, result: { username: 'x' } } : { ok: false, description: 'Too Many Requests' }) })) as never;
  assert.equal(await setupBot({ token: 't', publicUrl: null } as never, broken), 'x', 'profil xatosi setupBot’ni yiqitmaydi');
}
// Webhook DNS xatosi username'ni yo'qotmaydi va qayta urinadi (2026-11-21 production hodisasi)
{
  const { setupBot } = await import('./telegram');
  let hooks = 0; let got: string | null = null;
  const flaky = (async (url: string) => {
    const m = url.split('/').pop()!;
    if (m === 'getMe') return { json: async () => ({ ok: true, result: { username: 'Bandly_robot' } }) };
    if (m === 'setWebhook') { hooks++; return { json: async () => (hooks < 3 ? { ok: false, description: 'Bad Request: bad webhook: Failed to resolve host' } : { ok: true, result: true }) }; }
    if (m.startsWith('getMy')) return { json: async () => ({ ok: true, result: {} }) };
    return { json: async () => ({ ok: true, result: true }) };
  }) as never;
  const u = await setupBot({ token: 't', username: null, publicUrl: 'https://x.example' }, flaky, { onUsername: (n) => { got = n; }, retries: 5, delayMs: 1 });
  assert.equal(got, 'Bandly_robot', 'username webhook’dan oldin beriladi');
  assert.equal(u, 'Bandly_robot');
  assert.equal(hooks, 3, 'ikki xatodan keyin uchinchi urinishda o‘rnatildi');
  hooks = -100; got = null;
  assert.equal(await setupBot({ token: 't', username: null, publicUrl: 'https://x.example' }, flaky, { onUsername: (n) => { got = n; }, retries: 2, delayMs: 1 }), 'Bandly_robot', 'urinishlar tugasa ham username qaytadi (yiqilmaydi)');
  assert.equal(got, 'Bandly_robot');
}
// /start phone — raqamni ulashish tugmasi (request_contact)
{
  const r = handleUpdate({ message: { chat: { id: 5, type: 'private' }, from: { id: 5 }, text: '/start phone' } }, 'https://www.sellzen.uz');
  const kb = (r!.body.reply_markup as { keyboard: { request_contact?: boolean }[][] }).keyboard;
  assert.equal(kb[0]![0]!.request_contact, true);
}
console.log('telegram.test: OK');
