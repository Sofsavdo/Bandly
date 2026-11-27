import assert from 'node:assert/strict';
import { handleBot, type BotDeps } from './botFlow';
import { isAdminTg, statNumbers, statText } from './botStats';
import { createDb } from './db';
import { ensureLeadsTable, saveBotPhone } from './leads';
import { ensureLiveTable, recordLive } from './live';

const now = Date.UTC(2026, 10, 27, 9); // 14:00 Toshkent
const db = createDb(); ensureLeadsTable(db); ensureLiveTable(db);
const add = (nick: string, tg: number | null, at: number, role: string | null = null) =>
  Number(db.prepare('INSERT INTO players (token, nickname, created_at, updated_at, tg_id, role) VALUES (?, ?, ?, ?, ?, ?)').run(`t_${nick}`, nick, at, at, tg, role).lastInsertRowid);
const admin = add('boss', 111, now - 40 * 86_400_000, 'admin');
const a = add('ali', 222, now - 3_600_000), b = add('vali', null, now - 3 * 86_400_000), c = add('gani', 333, now - 20 * 86_400_000);
const sub = (p: number, tracks: string[]) => { for (const t of tracks) db.prepare('INSERT INTO subscriptions (player_id, track, until) VALUES (?, ?, ?)').run(p, t, now + 86_400_000); };
sub(a, ['exam', 'grammar']); sub(b, ['exam', 'grammar', 'voice']); sub(c, ['grammar']);
db.prepare('INSERT INTO subscriptions (player_id, track, until) VALUES (?, ?, ?)').run(admin, 'exam', now - 1); // muddati o'tgan — kirmaydi
const payRow = (id: string, p: number, amount: number, at: number, status = 'success') => db.prepare('INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, p, 'all', 30, amount, status, at, at);
payRow('p1', a, 199000, now - 3_600_000); payRow('p2', b, 499000, now - 2 * 86_400_000); payRow('p3', a, 99000, now - 60 * 86_400_000); payRow('p4', c, 50000, now - 3_600_000, 'pending');
saveBotPhone(db, 222, '+998901112233', now);
recordLive(db, a, 600, now, false); recordLive(db, c, 120, now, true);

const s = statNumbers(db, now);
assert.deepEqual(s.players, { total: 4, telegram: 3, today: 1, week: 2, month: 3 });
assert.deepEqual(s.subs, { paid: 2, gift: 1, general: 1, exam: 0, all: 1, premium: 1 }, 'tariflar planOf qoidasi bilan; to‘lovsiz — sovg‘a');
assert.deepEqual(s.pay.today, [1, 199000]); assert.deepEqual(s.pay.week, [2, 698000]); assert.deepEqual(s.pay.total, [3, 797000], 'kutilayotgan to‘lov kirmaydi');
assert.equal(s.phones, 1); assert.equal(s.voiceToday.minutes, 12); assert.equal(s.voiceToday.freeMinutes, 2); assert.equal(s.voiceToday.people, 2);
const text = statText(s, now, 1500, '@Sellzen_AI');
assert.match(text, /14:00 \(Toshkent\)/); assert.match(text, /Faol obunachilar: 3 \(to‘lagan 2, sovg‘a\/bonus 1\)/); assert.match(text, /Bugun: 1 ta — 199 000 so‘m/); assert.match(text, /a‘zolari: 1 500/);
assert.doesNotMatch(statText(s, now, null), /Kanal/, 'kanal soni olinmasa — qator yo‘q');
// Bo'sh baza ham xato bermaydi
assert.equal(statNumbers(createDb(), now).phones, 0);

// Faqat admin
assert.equal(isAdminTg(db, 111), true); assert.equal(isAdminTg(db, 222), false); assert.equal(isAdminTg(db, 999), false);
assert.equal(isAdminTg(db, 222, { ADMIN_NICKNAMES: 'Ali' } as NodeJS.ProcessEnv), true, 'ADMIN_NICKNAMES ham ishlaydi');

const calls: { m: string; b: Record<string, unknown> }[] = [];
const d: BotDeps = {
  api: async (m, body) => { calls.push({ m, b: body }); return true; }, publicUrl: 'https://sellzen.uz', tr: () => (t) => t,
  isMember: async () => true, hasPhone: () => true, savePhone: () => undefined, setRef: () => undefined, getRef: () => undefined, setRemind: () => true,
  requireSubscribe: () => false, requirePhone: () => false,
  isAdmin: (id) => isAdminTg(db, id), statText: async () => statText(statNumbers(db, now), now),
};
const msg = (tg: number, text: string) => ({ message: { message_id: 1, chat: { id: tg, type: 'private' }, from: { id: tg }, text } });
await handleBot(msg(111, '/stat'), d);
assert.equal(calls.length, 1); assert.match(String(calls[0]!.b.text), /^📊 Sellzen statistikasi/);
calls.length = 0;
await handleBot(msg(222, '/stat'), d);
assert.equal(calls.length, 1); assert.doesNotMatch(String(calls[0]!.b.text ?? calls[0]!.b.caption), /statistika/, 'oddiy o‘quvchiga statistika ko‘rsatilmaydi');
calls.length = 0;
await handleBot({ message: { chat: { id: -5, type: 'group' }, from: { id: 111 }, text: '/stat' } }, d);
assert.equal(calls.length, 0, 'guruhda javob yo‘q (statistika guruhga chiqmaydi)');
console.log('botStats: OK');
