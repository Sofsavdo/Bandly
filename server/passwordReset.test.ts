import assert from 'node:assert/strict';
import { createDb, playerIdOf } from './db';
import { ensureLeadsTable, saveBotPhone } from './leads';
import { hashPassword, registerPhone, verifyPassword } from './credentials';
import { consumeReset, ensureResetTable, offerReset, RESET_TTL_MS, resetValid } from './passwordReset';
import { handleBot } from './botFlow';

const db = createDb(); ensureLeadsTable(db); ensureResetTable(db);
const T = 1_800_000_000_000;
const acc = registerPhone(db, '+998901112233', await hashPassword('eski-parol-1'), 'Aziz');
const oldToken = acc.token;
assert.ok(playerIdOf(db, oldToken, T));

// Raqam botda tasdiqlanmagan — havola berilmaydi
assert.deepEqual(offerReset(db, 777, T), { ok: false, reason: 'nophone' });
// Telegram tasdiqlagan raqam boshqa bo'lsa — hisob topilmaydi
saveBotPhone(db, 888, '+998909999999', T);
assert.deepEqual(offerReset(db, 888, T), { ok: false, reason: 'noaccount' });
// To'g'ri raqam: bir martalik kalit
saveBotPhone(db, 777, '998901112233', T);
const o = offerReset(db, 777, T);
assert.ok(o.ok && o.nickname === 'Aziz' && /^[a-f0-9]{48}$/.test(o.token));
if (!o.ok) throw new Error('x');
assert.equal(resetValid(db, o.token, T + 60_000), true);
assert.equal(resetValid(db, o.token, T + RESET_TTL_MS + 1), false, '15 daqiqadan keyin yaroqsiz');
assert.throws(() => consumeReset(db, o.token, 'h', T + RESET_TTL_MS + 1), /muddati tugagan/);
// Yangi parol: kalit bekor, eski sessiya yopiladi, yangi sessiya beriladi
const fresh = consumeReset(db, o.token, await hashPassword('yangi-parol-2'), T + 60_000);
assert.equal(fresh.nickname, 'Aziz');
assert.equal(playerIdOf(db, oldToken, T + 61_000), null, 'eski sessiyalar yopildi');
assert.ok(playerIdOf(db, fresh.token, T + 61_000));
const ph = (db.prepare('SELECT pass_hash FROM players WHERE phone = ?').get('+998901112233') as { pass_hash: string }).pass_hash;
assert.ok(await verifyPassword('yangi-parol-2', ph)); assert.ok(!(await verifyPassword('eski-parol-1', ph)));
assert.throws(() => consumeReset(db, o.token, 'h', T + 70_000), /allaqachon ishlatilgan/, 'bir martalik');
assert.throws(() => consumeReset(db, 'zz', 'h', T), /noto‘g‘ri/);
// Soatiga 3 tadan ko'p emas
offerReset(db, 777, T + 1); offerReset(db, 777, T + 2);
assert.deepEqual(offerReset(db, 777, T + 3), { ok: false, reason: 'limit' });

// Bot: /parol → raqam so'raladi → kontakt ulashilgach havola keladi (kontakt — faqat o'ziniki)
{
  const sent: Record<string, unknown>[] = [];
  const db2 = createDb(); ensureLeadsTable(db2); ensureResetTable(db2);
  registerPhone(db2, '+998905556677', await hashPassword('parol-123456'), 'Bobur');
  const d = { api: async (_m: string, b: Record<string, unknown>) => { sent.push(b); return {}; }, publicUrl: 'https://sellzen.uz', tr: () => ((s: string) => s), isMember: async () => true, hasPhone: () => true,
    requireSubscribe: () => false, requirePhone: () => false, savePhone: (id: number, p: string) => saveBotPhone(db2, id, p), setRef: () => undefined, getRef: () => undefined, setRemind: () => true, resetOffer: (id: number) => offerReset(db2, id) };
  const msg = (extra: Record<string, unknown>) => ({ message: { chat: { id: 55, type: 'private' }, from: { id: 55 }, ...extra } });
  await handleBot(msg({ text: '/parol' }), d);
  assert.match(String(sent.at(-1)!.text), /raqamingizni tasdiqlang/);
  await handleBot(msg({ contact: { phone_number: '998905556677', user_id: 999 } }), d);
  assert.match(String(sent.at(-1)!.text), /o‘zingizning raqamingizni/, 'birovning kontakti qabul qilinmaydi');
  await handleBot(msg({ contact: { phone_number: '998905556677', user_id: 55 } }), d);
  const last = sent.at(-1)! as { text: string; reply_markup: { inline_keyboard: { url: string }[][] } };
  assert.match(last.text, /Bobur/);
  assert.match(last.reply_markup.inline_keyboard[0]![0]!.url, /^https:\/\/sellzen\.uz\/#\/reset\?t=[a-f0-9]{48}$/);
  await handleBot(msg({ text: '/start reset' }), d);
  assert.match(String((sent.at(-1)! as { text: string }).text), /15 daqiqa/, '/start reset ham havola beradi');
}
console.log('passwordReset: OK');
