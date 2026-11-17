// Hamkor (creator) dasturi: bloger/o'qituvchi o'z taklif havolasi orqali kelgan o'quvchilarni va ularning to'lovlarini ko'radi.
// Komissiya foizi — egasi qarori: CREATOR_COMMISSION_PCT (o'rnatilmagan bo'lsa — faqat tushum ko'rsatiladi, hisob-kitob yo'q).
import type { DatabaseSync } from 'node:sqlite';
import { refCodeOf } from './referral';
import { tzDay } from './day';

const DAY = 86_400_000;
export const commissionPct = (env: NodeJS.ProcessEnv = process.env): number | null => {
  const v = Number(env.CREATOR_COMMISSION_PCT);
  return Number.isFinite(v) && v > 0 && v <= 90 ? v : null;
};

export interface CreatorStats {
  nickname: string; code: string; invited: number; invited30: number; activated: number; payers: number;
  revenue: number; revenue30: number; commissionPct: number | null; commission: number | null;
  months: { month: string; signups: number; payers: number; revenue: number }[];
}

export function creatorStats(db: DatabaseSync, playerId: number, now = Date.now(), env: NodeJS.ProcessEnv = process.env): CreatorStats {
  const nick = (db.prepare('SELECT nickname FROM players WHERE id = ?').get(playerId) as { nickname: string }).nickname;
  const invitees = db.prepare('SELECT id, created_at AS c, ref_rewarded AS r FROM players WHERE referred_by = ?').all(playerId) as { id: number; c: number; r: number }[];
  const pays = db.prepare(`SELECT p.player_id AS pid, p.paid_at AS t, COALESCE(p.hamyon_amount, p.amount) AS a FROM payments p JOIN players u ON u.id = p.player_id WHERE u.referred_by = ? AND p.status = 'success'`).all(playerId) as { pid: number; t: number; a: number }[];
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(now); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() - (5 - i)); return { month: tzDay(d.getTime() + DAY).slice(0, 7), signups: 0, payers: 0, revenue: 0 }; });
  const byMonth = (t: number) => months.find((m) => m.month === tzDay(t).slice(0, 7));
  for (const u of invitees) { const m = byMonth(u.c); if (m) m.signups++; }
  const payerMonth = new Map<string, Set<number>>();
  for (const p of pays) { const m = byMonth(p.t); if (!m) continue; m.revenue += p.a; if (!payerMonth.has(m.month)) payerMonth.set(m.month, new Set()); payerMonth.get(m.month)!.add(p.pid); }
  for (const m of months) m.payers = payerMonth.get(m.month)?.size ?? 0;
  const revenue = pays.reduce((s, p) => s + p.a, 0);
  const pct = commissionPct(env);
  return {
    nickname: nick, code: refCodeOf(db, playerId), invited: invitees.length, invited30: invitees.filter((u) => u.c >= now - 30 * DAY).length,
    activated: invitees.filter((u) => u.r).length, payers: new Set(pays.map((p) => p.pid)).size,
    revenue, revenue30: pays.filter((p) => p.t >= now - 30 * DAY).reduce((s, p) => s + p.a, 0),
    commissionPct: pct, commission: pct === null ? null : Math.round((revenue * pct) / 100), months,
  };
}

export function creatorsOverview(db: DatabaseSync, now = Date.now()): CreatorStats[] {
  const ids = db.prepare("SELECT id FROM players WHERE role = 'creator' ORDER BY nickname").all() as { id: number }[];
  return ids.map((r) => creatorStats(db, r.id, now)).sort((a, b) => b.revenue - a.revenue || b.invited - a.invited);
}
