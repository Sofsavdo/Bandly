// Admin kabineti: foydalanuvchini laqab bo'yicha topish (qo'llab-quvvatlash uchun) — obunalari, to'lovlari, roli va faolligi.
// Faqat o'qish uchun ko'rinish; obuna berish payments.grant orqali (audit bilan). Telegram ID, telefon kabi shaxsiy ma'lumot qaytarilmaydi.
import type { DatabaseSync } from 'node:sqlite';

export interface AdminUser {
  id: number; nickname: string; xp: number; streak: number; role: string | null; createdAt: number; updatedAt: number;
  subs: { track: string; until: number }[]; paidCount: number; paidSum: number; lastPaidAt: number | null;
}

/** Laqabning bir qismi bo'yicha qidiruv (katta-kichik harf farqsiz), eng faol 20 ta. Bo'sh so'rov — eng yangi ro'yxatdan o'tganlar. */
export function findUsers(db: DatabaseSync, q: string, limit = 20): AdminUser[] {
  const term = String(q ?? '').trim().slice(0, 40);
  const like = `%${term.replace(/[\\%_]/g, (c) => '\\' + c)}%`;
  const rows = (term
    ? db.prepare("SELECT id, nickname, xp, streak, role, created_at, updated_at FROM players WHERE lower(nickname) LIKE lower(?) ESCAPE '\\' ORDER BY (lower(nickname) = lower(?)) DESC, updated_at DESC LIMIT ?").all(like, term, limit)
    : db.prepare('SELECT id, nickname, xp, streak, role, created_at, updated_at FROM players ORDER BY created_at DESC LIMIT ?').all(limit)) as { id: number; nickname: string; xp: number; streak: number; role: string | null; created_at: number; updated_at: number }[];
  const subQ = db.prepare('SELECT track, until FROM subscriptions WHERE player_id = ? ORDER BY until DESC');
  const payQ = db.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(COALESCE(hamyon_amount, amount)), 0) AS s, MAX(paid_at) AS last FROM payments WHERE player_id = ? AND status = 'success'");
  return rows.map((r) => {
    const pay = payQ.get(r.id) as { n: number; s: number; last: number | null };
    return { id: r.id, nickname: r.nickname, xp: r.xp, streak: r.streak, role: r.role, createdAt: r.created_at, updatedAt: r.updated_at, subs: subQ.all(r.id) as { track: string; until: number }[], paidCount: pay.n, paidSum: pay.s, lastPaidAt: pay.last };
  });
}
