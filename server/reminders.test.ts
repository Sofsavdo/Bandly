import assert from 'node:assert/strict';
import { byToken, createDb, loginTelegram } from './db';
import { dueReminders, reminderMessage, runReminders, setRemind } from './reminders';
import { awardXp } from './xp';

const db = createDb();
const T20 = Date.UTC(2026, 10, 17, 15, 30); // 20:30 Toshkent
const T12 = Date.UTC(2026, 10, 17, 7, 0);   // 12:00 Toshkent
const a = byToken(db, loginTelegram(db, 1001, 'Ali', undefined, T12).token);
const b = byToken(db, loginTelegram(db, 1002, 'Vali', undefined, T12).token);
const c = byToken(db, loginTelegram(db, 1003, 'Sami', undefined, T12).token);
db.prepare('UPDATE players SET streak = 5 WHERE id IN (?, ?)').run(a.id, b.id); // c — seriyasi yo'q

// Kunduzi hech kimga yozilmaydi
assert.equal(dueReminders(db, T12).length, 0);
// Bugun XP olgan (b) eslatma olmaydi; seriyasiz (c) ham
awardXp(db, b.id, 'evt-today-1', 'lesson', 20, T12);
assert.deepEqual(dueReminders(db, T20).map((d) => d.tgId), [1001]);

// Yuboriladi va kuniga bir marta
const sent: Record<string, unknown>[] = [];
assert.equal(await runReminders(db, async (m) => { sent.push(m); }, 'https://x/app', T20), 1);
assert.equal(sent[0]!.chat_id, 1001);
assert.equal(dueReminders(db, T20 + 600_000).length, 0);

// /stop o'chiradi, bloklangan bot avtomatik o'chiradi
assert.equal(setRemind(db, 1001, false), true);
assert.equal(setRemind(db, 9999, false), false);
const next = T20 + 86_400_000;
assert.equal(dueReminders(db, next).length, 1); // b (ertaga XP yo'q)
await runReminders(db, async () => { throw new Error('Telegram sendMessage: Forbidden: bot was blocked by the user'); }, 'https://x/app', next);
assert.equal(dueReminders(db, next + 86_400_000).length, 0);
assert.match(String(reminderMessage(1, 7, 'u').text), /7 kunlik/);
console.log('reminders: OK');
