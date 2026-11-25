// Telegram'da aloqada bo'lish: Telegram'ga ulangan o'quvchiga kamida 2–3 kunda bitta qisqa va foydali xabar.
// Sukut bo'yicha yoqilgan (o'chirish: TG_NUDGES=0). O'quvchi /stop bilan to'xtatadi, /remind bilan qayta yoqadi.
// Boshqa bot xabarlari (seriya eslatmasi, liga natijasi) ham `last_bot_msg` ga yoziladi — shuning uchun xabarlar to'planib qolmaydi.
import type { DatabaseSync } from 'node:sqlite';
import { tzDayStart } from './day';
import { tzHour } from './reminders';

export const NUDGE_GAP_MS = 2 * 86_400_000;       // ikki xabar orasi kamida 2 kun → o'rtacha 2–3 kunda bitta
export const NUDGE_FROM = 18;                      // Toshkent vaqti bilan 18:00 dan
export const NUDGE_UNTIL = 21;                     // 21:00 gacha (tunda yozilmaydi)
export const NUDGE_BATCH = 200;                    // bir aylanishda eng ko'pi (Telegram chegarasidan ancha past)
export const NEW_ACCOUNT_MS = 20 * 3_600_000;      // yangi hisobga dastlabki 20 soatda yozilmaydi (u hozirgina kirdi)

export function ensureNudgeColumns(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('last_bot_msg')) db.exec('ALTER TABLE players ADD COLUMN last_bot_msg INTEGER');
  if (!cols.includes('nudge_n')) db.exec('ALTER TABLE players ADD COLUMN nudge_n INTEGER NOT NULL DEFAULT 0');
}

/** Aylanma xabarlar: har biri — emoji, matn, tugma yozuvi va ilova sahifasi. Matnlar tarjima kalitlari (o'zbekcha). */
export const NUDGES: { emoji: string; text: string; button: string; route: string }[] = [
  { emoji: '📚', text: 'Bugungi 5 daqiqalik dars sizni kutmoqda — bitta yangi mavzu va bir nechta mashq.', button: 'Darsni boshlash', route: '/learn' },
  { emoji: '🗣', text: 'Sellzen ustoz bilan 2 daqiqa inglizcha gaplashib ko‘ring — bosib turing va gapiring.', button: 'Gaplashish', route: '/coach' },
  { emoji: '🧠', text: 'So‘z o‘yini: 10 ta so‘zni takrorlang — shunda ular xotirada mustahkamlanadi.', button: 'O‘ynash', route: '/games' },
  { emoji: '🏆', text: 'Bu haftaning reytingida o‘rningiz qanday? Bitta dars bilan yuqoriga chiqing.', button: 'Reyting', route: '/league' },
  { emoji: '📝', text: 'Mock test bilan darajangizni sinab ko‘ring — Listening va Reading testlari bepul.', button: 'Mock testlar', route: '/mocks' },
  { emoji: '🎯', text: 'Kichik odat katta natija beradi: bugun kamida bitta mashq qiling.', button: 'Davom ettirish', route: '/learn' },
];

export interface DueNudge { id: number; tgId: number; lang: string | null; n: number }
/**
 * Xabar kerak bo'lganlar: Telegram'ga ulangan, eslatma yoqilgan, hisobi yangi emas va oxirgi bot xabaridan kamida 2 kun o'tgan.
 * `remindersOn` — seriya eslatmalari yoqilgan bo'lsa, ularga muhtoj (seriyasi bor, bugun o'qimagan) o'quvchiga umumiy xabar yozilmaydi: eslatma o'zi yetadi.
 */
export function dueNudges(db: DatabaseSync, now: number, remindersOn = false, limit = NUDGE_BATCH): DueNudge[] {
  const h = tzHour(now);
  if (h < NUDGE_FROM || h >= NUDGE_UNTIL) return [];
  const since = tzDayStart(now);
  const skipStreak = remindersOn ? `AND NOT (p.streak > 0 AND NOT EXISTS (SELECT 1 FROM xp_events e WHERE e.player_id = p.id AND e.ts >= ${Number(since)} AND e.accepted > 0))` : '';
  return db.prepare(`SELECT p.id, p.tg_id AS tgId, p.lang, p.nudge_n AS n FROM players p
      WHERE p.tg_id IS NOT NULL AND p.remind = 1 AND p.created_at <= ? AND (p.last_bot_msg IS NULL OR p.last_bot_msg <= ?) ${skipStreak}
      ORDER BY COALESCE(p.last_bot_msg, 0) ASC, p.id ASC LIMIT ?`).all(now - NEW_ACCOUNT_MS, now - NUDGE_GAP_MS, limit) as unknown as DueNudge[];
}

export function nudgeMessage(d: DueNudge, appUrl: (route: string) => string, tr: (s: string) => string = (s) => s): Record<string, unknown> {
  const x = NUDGES[d.n % NUDGES.length]!;
  return {
    chat_id: d.tgId,
    text: `${x.emoji} ${tr(x.text)}\n\n${tr('Eslatmalarni o‘chirish: /stop')}`,
    reply_markup: { inline_keyboard: [[{ text: `▶️ ${tr(x.button)}`, web_app: { url: appUrl(x.route) } }]] },
  };
}

/** Bir aylanish: yuboradi va belgilaydi. Telegram xatosi (bot bloklangan va h.k.) — shu kishi uchun xabarlar o'chiriladi. */
export async function runNudges(db: DatabaseSync, send: (body: Record<string, unknown>) => Promise<void>, appUrl: (route: string) => string, now = Date.now(), tr: (lang: string | null, s: string) => string = (_l, s) => s, remindersOn = false): Promise<number> {
  let n = 0;
  for (const d of dueNudges(db, now, remindersOn)) {
    db.prepare('UPDATE players SET last_bot_msg = ?, nudge_n = nudge_n + 1 WHERE id = ?').run(now, d.id); // avval belgilaymiz: xato bo'lsa ham qayta-qayta yozilmaydi
    try { await send(nudgeMessage(d, appUrl, (t) => tr(d.lang, t))); n++; }
    catch (e) { if (/403|blocked|deactivated|chat not found/i.test((e as Error).message)) db.prepare('UPDATE players SET remind = 0 WHERE id = ?').run(d.id); }
    await new Promise((r) => setTimeout(r, 40)); // Telegram chegarasi: ~25 xabar/soniya
  }
  return n;
}


