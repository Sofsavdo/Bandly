import assert from 'node:assert/strict';
import { byToken, createDb, loginTelegram } from './db';
import { NUDGES, NUDGE_GAP_MS, dueNudges, nudgeMessage, runNudges } from './nudges';
import { runReminders, setRemind } from './reminders';
import { awardXp } from './xp';

const DAY = 86_400_000;
const T0 = Date.UTC(2026, 10, 17, 7, 0);          // 12:00 Toshkent
const EVE = Date.UTC(2026, 10, 19, 14, 30);       // 19:30 Toshkent (2 kun o'tgan)
const db = createDb();
const mk = (tg: number, nick: string, at = T0): number => byToken(db, loginTelegram(db, tg, nick, undefined, at).token).id;
const a = mk(2001, 'Ali'), b = mk(2002, 'Vali'), c = mk(2003, 'Sami'), d = mk(2004, 'Nodir');
const fresh = mk(2005, 'Yangi', EVE - 3_600_000);  // 1 soat oldin kirgan
void a; void d;

// Faqat 18:00–21:00 (Toshkent): kunduzi ham, kechasi ham yozilmaydi
assert.equal(dueNudges(db, Date.UTC(2026, 10, 19, 7, 0)).length, 0, 'kunduzi yozilmaydi');
assert.equal(dueNudges(db, Date.UTC(2026, 10, 19, 17, 30)).length, 0, '22:30 da yozilmaydi');
// Yangi hisobga (20 soatdan kam) yozilmaydi; /stop va Telegram'siz hisob tashqarida
setRemind(db, 2002, false);
db.prepare('UPDATE players SET tg_id = NULL WHERE id = ?').run(c);
assert.deepEqual(dueNudges(db, EVE).map((x) => x.tgId).sort(), [2001, 2004], 'faqat eski, ulangan va eslatma yoqilganlar');
assert.ok(!dueNudges(db, EVE).some((x) => x.id === fresh), 'yangi hisobga yozilmaydi');
setRemind(db, 2002, true); db.prepare('UPDATE players SET tg_id = 2003 WHERE id = ?').run(c);

// Yuboriladi: har kimga bitta, matn aylanma, bir kechada ikkinchi marta yo'q
const sent: Record<string, unknown>[] = [];
const url = (r: string) => `https://x/app${r}`;
const n1 = await runNudges(db, async (m) => { sent.push(m); }, url, EVE);
assert.equal(n1, 4, 'to‘rt nafar');
assert.equal(sent.length, 4);
assert.match(String(sent[0]!.text), /Eslatmalarni o‘chirish: \/stop/);
const btn = ((sent[0]!.reply_markup as { inline_keyboard: { web_app: { url: string } }[][] }).inline_keyboard[0]![0]!).web_app.url;
assert.equal(btn, `https://x/app${NUDGES[0]!.route}`, 'tugma ilovaning tegishli sahifasini ochadi');
assert.equal(await runNudges(db, async () => { throw new Error('yuborilmasligi kerak'); }, url, EVE + 10 * 60_000), 0, 'shu kechada ikkinchi marta yo‘q');
assert.deepEqual(dueNudges(db, EVE + DAY).map((x) => x.id), [fresh], 'ertasiga faqat yangi hisob (20 soatdan o‘tgan) — qolganlarga kamida 2 kun');

// 2 kundan keyin yana — keyingi matn bilan
const EVE2 = EVE + NUDGE_GAP_MS + 5 * 60_000;
const sent2: Record<string, unknown>[] = [];
assert.equal(await runNudges(db, async (m) => { sent2.push(m); }, url, EVE2), 5, 'to‘rt nafar + endi yangi hisob ham');
assert.notEqual(sent2.find((m) => m.chat_id === 2001)!.text, sent.find((m) => m.chat_id === 2001)!.text, 'matn almashadi');
assert.equal(nudgeMessage({ id: 1, tgId: 1, lang: null, n: NUDGES.length }, url).text, nudgeMessage({ id: 1, tgId: 1, lang: null, n: 0 }, url).text, 'matnlar aylanadi');

// Bloklangan bot — shu kishiga xabarlar o'chadi, qolganlarga yetadi
const EVE3 = EVE2 + NUDGE_GAP_MS + 5 * 60_000;
let calls = 0;
const sent3 = await runNudges(db, async (m) => { calls++; if (m.chat_id === 2001) throw new Error('403 Forbidden: bot was blocked by the user'); }, url, EVE3);
assert.equal(calls, 5); assert.equal(sent3, 4);
assert.equal((db.prepare('SELECT remind FROM players WHERE id = ?').get(a) as { remind: number }).remind, 0, 'bloklagan kishi uchun o‘chdi');

// Tarjima: foydalanuvchi tili bo'yicha
db.prepare("UPDATE players SET lang = 'ru' WHERE id = ?").run(b);
const EVE4 = EVE3 + NUDGE_GAP_MS + 5 * 60_000;
const langs: (string | null)[] = [];
await runNudges(db, async () => { /* */ }, url, EVE4, (l, s) => { langs.push(l); return s; });
assert.ok(langs.includes('ru'), 'tarjima foydalanuvchi tilida chaqirildi');

// Seriya eslatmasi bilan birga: eslatma yuborgan odamga shu kunlarda umumiy xabar yozilmaydi
const db2 = createDb();
const p = byToken(db2, loginTelegram(db2, 3001, 'Seriyali', undefined, T0).token).id;
db2.prepare('UPDATE players SET streak = 4 WHERE id = ?').run(p);
const T20 = Date.UTC(2026, 10, 19, 15, 30); // 20:30 Toshkent
assert.equal(await runReminders(db2, async () => { /* */ }, 'https://x/app', T20), 1);
assert.equal(dueNudges(db2, T20 + 3_600_000).length, 0, 'eslatmadan keyin 2 kun yozilmaydi');
// remindersOn: seriyasi bor va bugun o'qimagan odamga umumiy xabar yozilmaydi (eslatma o'zi yetadi)
const db3 = createDb();
const q = byToken(db3, loginTelegram(db3, 3002, 'Seriya2', undefined, T0).token).id;
db3.prepare('UPDATE players SET streak = 3 WHERE id = ?').run(q);
assert.equal(dueNudges(db3, EVE, true).length, 0, 'seriyasi bor, bugun o‘qimagan — eslatma bor');
assert.equal(dueNudges(db3, EVE, false).length, 1, 'eslatmalar o‘chiq bo‘lsa — umumiy xabar boradi');
awardXp(db3, q, 'evt-nudge-1', 'lesson', 20, EVE - 3_600_000);
assert.equal(dueNudges(db3, EVE, true).length, 1, 'bugun o‘qigan — umumiy xabar mumkin');
console.log('nudges.test: OK');
