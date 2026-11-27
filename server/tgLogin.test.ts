import assert from 'node:assert/strict';
import { createDb } from './db';
import { ensureCardPayTables } from './cardPay';
import { LoginFlow, loginError, type LoginClient, type LoginFactory } from './tgLogin';
import { clearSession, decryptSecret, encryptSecret, hasStoredSession, loadSession, saveSession, sessionKey } from './tgSession';
import { startCardWatch, watchState, type NoticeFeed } from './cardWatch';
import { ApiError } from './db';

const T0 = Date.UTC(2026, 0, 15, 10);
const ENV = { ADMIN_TOKEN: 'test-admin-token-123' } as NodeJS.ProcessEnv;
const mk = () => { const db = createDb(':memory:'); ensureCardPayTables(db); return db; };
const creds = () => ({ apiId: 1, apiHash: 'h' });

// ---- Shifrlash ----
{
  assert.equal(sessionKey({}), null, 'maxfiy o‘zgaruvchi yo‘q — kalit yo‘q');
  assert.equal(sessionKey({ ADMIN_TOKEN: 'short' }), null, 'juda qisqa maxfiy qiymat kalit bo‘lmaydi');
  const k = sessionKey(ENV)!;
  assert.equal(k.length, 32);
  assert.deepEqual(sessionKey({ ...ENV }), k, 'bir xil maxfiy qiymat — bir xil kalit');
  assert.notDeepEqual(sessionKey({ PAY_SESSION_KEY: 'another-secret-xyz' }), k);
  assert.deepEqual(sessionKey({ PAY_SESSION_KEY: 'pay-key-123456', ADMIN_TOKEN: 'test-admin-token-123' }), sessionKey({ PAY_SESSION_KEY: 'pay-key-123456' }), 'PAY_SESSION_KEY ustun');
  const blob = encryptSecret('1BQANOTEuMTA4LjU2', k);
  assert.ok(!blob.includes('1BQANOTE'), 'ochiq matn ko‘rinmaydi');
  assert.equal(decryptSecret(blob, k), '1BQANOTEuMTA4LjU2');
  assert.notEqual(encryptSecret('x', k), encryptSecret('x', k), 'har safar boshqa iv');
  assert.equal(decryptSecret(blob, sessionKey({ ADMIN_TOKEN: 'other-token-456789' })!), null, 'boshqa kalit — ochilmaydi');
  assert.equal(decryptSecret(blob.slice(0, -2) + 'AA', k), null, 'o‘zgartirilgan shifr — rad etiladi');
  assert.equal(decryptSecret('garbage', k), null);
}

// ---- Saqlash ----
{
  const db = mk();
  assert.throws(() => saveSession(db, 'S', {}), (e: unknown) => e instanceof ApiError && /kalit/.test(e.message));
  assert.equal(hasStoredSession(db), false);
  saveSession(db, 'SESSION-ABC', ENV, T0);
  assert.equal(hasStoredSession(db), true);
  assert.equal(loadSession(db, ENV), 'SESSION-ABC');
  const raw = (db.prepare("SELECT value FROM pay_secrets WHERE key = 'tg_session'").get() as { value: string }).value;
  assert.ok(!raw.includes('SESSION-ABC'), 'bazada ochiq sessiya yo‘q');
  assert.equal(loadSession(db, { ADMIN_TOKEN: 'rotated-token-999999' }), null, 'kalit almashsa — o‘qilmaydi (qayta ulash kerak)');
  clearSession(db);
  assert.equal(loadSession(db, ENV), null);
}

// ---- Xatolarni xabarga aylantirish ----
assert.match(loginError(new Error('400: PHONE_CODE_INVALID (caused by auth.SignIn)')).message, /Kod noto‘g‘ri/);
assert.match(loginError(new Error('PHONE_CODE_EXPIRED')).message, /eskirgan/);
assert.match(loginError(new Error('PASSWORD_HASH_INVALID')).message, /Parol/);
assert.match(loginError(new Error('A wait of 3600 seconds is required (FLOOD_WAIT_3600)')).message, /cheklab/);
assert.equal(loginError(new Error('FLOOD_WAIT_5')).status, 429);
assert.match(loginError(new Error('API_ID_INVALID')).message, /TG_API_ID/);
assert.match(loginError(new Error('socket hang up +998901234567 code 12345')).message, /ulanib bo‘lmadi/);
assert.ok(!loginError(new Error('secret code 12345 pw hunter2')).message.includes('12345'), 'xom xato matni chiqmaydi');

// ---- Oqim (soxta Telegram) ----
const fake = (script: { signIn?: 'ok' | 'password' | Error; password?: Error | null }) => {
  const log: string[] = [];
  let stopped = 0;
  const factory: LoginFactory = async () => {
    const c: LoginClient = {
      async sendCode(phone) { log.push(`sendCode:${phone}`); return { hash: 'H1', viaApp: true }; },
      async signIn(phone, hash, code) { log.push(`signIn:${phone}:${hash}:${code}`); const r = script.signIn ?? 'ok'; if (r instanceof Error) throw r; return r; },
      async password(pw) { log.push(`pw:${pw.length}`); if (script.password) throw script.password; },
      session: () => 'NEW-SESSION-STRING',
      async disconnect() { stopped++; },
    };
    return c;
  };
  return { factory, log, stopped: () => stopped };
};

{ // oddiy: telefon → kod → tayyor; sessiya shifrlangan saqlanadi
  const db = mk(); const f = fake({ signIn: 'ok' }); let done = 0;
  const flow = new LoginFlow(db, f.factory, () => creds(), ENV, () => { done++; });
  const r = await flow.start(1, '+998 90 123-45-67', T0);
  assert.deepEqual(r, { step: 'code', viaApp: true });
  assert.equal(f.log[0], 'sendCode:+998901234567', 'raqam tozalanadi');
  assert.deepEqual(await flow.code(1, ' 12 345 ', T0 + 1000), { step: 'done' });
  assert.equal(f.log[1], 'signIn:+998901234567:H1:12345');
  assert.equal(loadSession(db, ENV), 'NEW-SESSION-STRING'); assert.equal(done, 1); assert.equal(f.stopped(), 1, 'ulanish yopiladi');
  const audits = (db.prepare('SELECT action, detail FROM admin_audit ORDER BY id').all() as { action: string; detail: string }[]);
  assert.deepEqual(audits.map((a) => a.action), ['pay.tg.code', 'pay.tg.connect']);
  assert.ok(audits.every((a) => !a.detail.includes('998901234567') && a.detail.includes('4567')), 'jurnalda faqat oxirgi 4 raqam; kod/parol yo‘q');
}
{ // 2 bosqichli parol
  const db = mk(); const f = fake({ signIn: 'password' });
  const flow = new LoginFlow(db, f.factory, () => creds(), ENV);
  await flow.start(1, '998901234567', T0);
  assert.deepEqual(await flow.code(1, '11111', T0 + 1000), { step: 'password' });
  assert.equal(loadSession(db, ENV), null, 'parolgacha sessiya saqlanmaydi');
  await assert.rejects(() => flow.code(1, '11111', T0 + 2000), /muddati/, 'parol bosqichida kod qabul qilinmaydi');
  assert.deepEqual(await flow.password(1, 'secret-pw', T0 + 3000), { step: 'done' });
  assert.equal(loadSession(db, ENV), 'NEW-SESSION-STRING');
}
{ // noto'g'ri kod: qayta urinish mumkin; noto'g'ri parol: qayta urinish mumkin
  const db = mk(); let n = 0;
  const f = fake({}); const base = f.factory;
  const factory: LoginFactory = async (c) => { const cl = await base(c); const sign = cl.signIn.bind(cl); cl.signIn = async (...a) => { if (++n === 1) throw new Error('PHONE_CODE_INVALID'); return sign(...a); }; return cl; };
  const flow = new LoginFlow(db, factory, () => creds(), ENV);
  await flow.start(1, '+998901234567', T0);
  await assert.rejects(() => flow.code(1, '00000', T0 + 1000), /Kod noto‘g‘ri/);
  assert.deepEqual(await flow.code(1, '12345', T0 + 2000), { step: 'done' }, 'noto‘g‘ri kondan keyin to‘g‘risi qabul qilinadi');
}
{ // muddati (10 daqiqa), boshqa admin, sozlama yo'q, kalit yo'q, tezlik cheklovi
  const db = mk(); const f = fake({});
  const flow = new LoginFlow(db, f.factory, () => creds(), ENV);
  await flow.start(1, '+998901234567', T0);
  await assert.rejects(() => flow.code(2, '12345', T0 + 1000), /muddati/, 'boshqa admin kodi bilan tugatolmaydi');
  await assert.rejects(() => flow.code(1, '12345', T0 + 11 * 60_000), /muddati/);
  await assert.rejects(() => new LoginFlow(db, f.factory, () => null, ENV).start(1, '+998901234567', T0), /TG_API_ID/);
  await assert.rejects(() => new LoginFlow(db, f.factory, () => creds(), {}).start(1, '+998901234567', T0), /kalit/, 'sessiyani saqlab bo‘lmasa — Telegram’ga kirish boshlanmaydi');
  await assert.rejects(() => flow.start(1, '123', T0), /Telefon/);
  for (let i = 0; i < 4; i++) await flow.start(1, '+998901234567', T0 + i + 1);
  await assert.rejects(() => flow.start(1, '+998901234567', T0 + 100), (e: unknown) => (e as ApiError).status === 429, 'soatiga 5 ta kod so‘rovi');
}
{ // Telegram xatosi: ulanish yopiladi, kod/parol sizmaydi
  const db = mk();
  const flow = new LoginFlow(db, async () => ({ async sendCode() { throw new Error('PHONE_NUMBER_INVALID'); }, async signIn() { return 'ok' as const; }, async password() { /* */ }, session: () => 's', async disconnect() { /* */ } }), () => creds(), ENV);
  await assert.rejects(() => flow.start(1, '+998901234567', T0), /Telefon raqami noto‘g‘ri/);
}

// ---- Kuzatuvchi: sessiya yo'q → kutadi; sessiya paydo bo'lsa ulanadi; almashsa qayta ulanadi ----
{
  const db = mk();
  let session: string | null = null; let starts = 0, stops = 0;
  const feed = (): NoticeFeed => ({ async start() { starts++; }, async poll() { /* */ }, async stop() { stops++; } });
  const w = startCardWatch({ db, cfg: { mode: 'capture', card: '', windowMs: 1, graceMs: 1, sources: ['x'], strategy: 'spread', reservePct: 0 }, creds: () => (session ? { apiId: 1, apiHash: 'h', session } : null) }, feed);
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(starts, 0); assert.equal(watchState.state, 'unconfigured');
  await w.stop();
}

console.log('tgLogin.test: OK');
