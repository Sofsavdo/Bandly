// Seriya eslatmasi (Telegram): seriyasi bor, lekin bugun (Toshkent vaqti) hali XP olmagan o'quvchiga kechqurun bitta xabar.
// Yoqish: TG_REMINDERS=1 (sukut bo'yicha o'chiq). O'quvchi /stop bilan o'chiradi, /remind bilan qayta yoqadi.
import type { DatabaseSync } from 'node:sqlite';
import { TZ_OFFSET_MS, tzDay, tzDayStart } from './day';

export const REMIND_HOUR = 20;      // Toshkent vaqti bilan 20:00 dan
export const REMIND_UNTIL = 23;     // 23:00 gacha (tunda yozilmaydi)
export const BATCH = 300;           // bir aylanishda eng ko'pi

export function ensureReminderColumns(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('remind')) db.exec('ALTER TABLE players ADD COLUMN remind INTEGER NOT NULL DEFAULT 1');
  if (!cols.includes('reminded_day')) db.exec('ALTER TABLE players ADD COLUMN reminded_day TEXT');
  if (!cols.includes('lang')) db.exec('ALTER TABLE players ADD COLUMN lang TEXT');
}

export const tzHour = (now: number): number => new Date(now + TZ_OFFSET_MS).getUTCHours();

export interface Due { id: number; tgId: number; streak: number; lang: string | null }
/** Bugun eslatma kerak bo'lganlar: Telegram'ga ulangan, eslatma yoqilgan, seriya > 0, bugun XP yo'q, bugun hali yozilmagan. */
export function dueReminders(db: DatabaseSync, now: number, limit = BATCH): Due[] {
  const h = tzHour(now);
  if (h < REMIND_HOUR || h >= REMIND_UNTIL) return [];
  const day = tzDay(now), since = tzDayStart(now);
  return (db.prepare(`SELECT p.id, p.tg_id AS tgId, p.streak, p.lang FROM players p
      WHERE p.tg_id IS NOT NULL AND p.remind = 1 AND p.streak > 0 AND (p.reminded_day IS NULL OR p.reminded_day <> ?)
        AND NOT EXISTS (SELECT 1 FROM xp_events e WHERE e.player_id = p.id AND e.ts >= ? AND e.accepted > 0)
      ORDER BY p.streak DESC LIMIT ?`).all(day, since, limit) as unknown as Due[]);
}

export const markReminded = (db: DatabaseSync, id: number, now: number): void => { db.prepare('UPDATE players SET reminded_day = ?, last_bot_msg = ? WHERE id = ?').run(tzDay(now), now, id); };
export const setRemind = (db: DatabaseSync, tgId: number, on: boolean): boolean => Number(db.prepare('UPDATE players SET remind = ? WHERE tg_id = ?').run(on ? 1 : 0, tgId).changes) > 0;

export function reminderMessage(chatId: number, streak: number, appUrl: string, tr: (s: string) => string = (s) => s): Record<string, unknown> {
  return {
    chat_id: chatId,
    text: `🔥 ${tr('{0} kunlik seriyangiz bugun uzilib qolmasin! 5 daqiqalik dars yoki bitta o‘yin yetarli.').replace('{0}', String(streak))}\n\n${tr('Eslatmalarni o‘chirish: /stop')}`,
    reply_markup: { inline_keyboard: [[{ text: `▶️ ${tr('Davom ettirish')}`, web_app: { url: appUrl } }]] },
  };
}

/** Bir aylanish: yuboradi va belgilaydi. Telegram xatosi (bot bloklangan va h.k.) — eslatma o'sha kishi uchun o'chiriladi. */
export async function runReminders(db: DatabaseSync, send: (body: Record<string, unknown>) => Promise<void>, appUrl: string, now = Date.now(), tr: (lang: string | null, s: string) => string = (_l, s) => s): Promise<number> {
  let n = 0;
  for (const d of dueReminders(db, now)) {
    markReminded(db, d.id, now); // avval belgilaymiz: xato bo'lsa ham qayta-qayta yozilmaydi
    try { await send(reminderMessage(d.tgId, d.streak, appUrl, (t) => tr(d.lang, t))); n++; }
    catch (e) { if (/403|blocked|deactivated|chat not found/i.test((e as Error).message)) db.prepare('UPDATE players SET remind = 0 WHERE id = ?').run(d.id); }
    await new Promise((r) => setTimeout(r, 40)); // Telegram chegarasi: ~25 xabar/soniya
  }
  return n;
}
