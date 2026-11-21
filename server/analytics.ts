// Admin analitikasi (faqat o'qish): faollik, yangi o'quvchilar, saqlanib qolish (D1/D7/D30), voronka, to'lovlar, AI xarajati.
// "Faol" = o'sha kuni XP olgan (xp_events, accepted > 0). Kunlar Toshkent vaqti bo'yicha.
import type { DatabaseSync } from 'node:sqlite';
import { TZ_OFFSET_MS, tzDay, tzDayStart } from './day';
import { ensureEventsTable, eventTotals, type EventName } from './events';

const DAY = 86_400_000;
const dayIdx = (ts: number) => Math.floor((ts + TZ_OFFSET_MS) / DAY);

export interface Analytics {
  generatedAt: number;
  totals: { players: number; telegram: number; payingNow: number; subscribedNow: number; dau: number; wau: number; mau: number };
  days: { day: string; signups: number; active: number; paid: number; revenue: number; aiUsd: number }[];
  retention: { cohort: number; d1: number | null; d7: number | null; d30: number | null };
  funnel: { step: string; n: number }[];
  bySource: { source: string; events: number; xp: number }[];
  aiByFeature: { feature: string; usd: number }[];
  revenue30: number; paid30: number;
  /** O'sish voronkasi (tanlangan davr): anonim hodisalar + ro'yxat/referal; nisbatlar foizda (ma'lumot bo'lmasa null). */
  growth: { events: Record<EventName, number>; signups: number; referredSignups: number; referredActivated: number; placementToSignupPct: number | null; referredSharePct: number | null };
}

const one = <T>(db: DatabaseSync, sql: string, ...a: (number | string)[]): T => db.prepare(sql).get(...a) as T;

export function analytics(db: DatabaseSync, now = Date.now(), span = 30): Analytics {
  const today = dayIdx(now), from = tzDayStart(now) - (span - 1) * DAY;
  const distinctSince = (t: number) => one<{ n: number }>(db, 'SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE accepted > 0 AND ts >= ?', t).n;

  const totals = {
    players: one<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM players').n,
    telegram: one<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM players WHERE tg_id IS NOT NULL').n,
    // To'lovchi = faol obunasi bor VA kamida bir marta haqiqiy to'lov qilgan (referal/admin sovg'a kunlari to'lov emas)
    payingNow: one<{ n: number }>(db, "SELECT COUNT(DISTINCT s.player_id) AS n FROM subscriptions s WHERE s.until > ? AND EXISTS (SELECT 1 FROM payments p WHERE p.player_id = s.player_id AND p.status = 'success')", now).n,
    subscribedNow: one<{ n: number }>(db, 'SELECT COUNT(DISTINCT player_id) AS n FROM subscriptions WHERE until > ?', now).n,
    dau: distinctSince(tzDayStart(now)), wau: distinctSince(tzDayStart(now) - 6 * DAY), mau: distinctSince(tzDayStart(now) - 29 * DAY),
  };

  // Kunlik qatorlar
  const days = Array.from({ length: span }, (_, i) => ({ day: tzDay(from + i * DAY + DAY / 2), signups: 0, active: 0, paid: 0, revenue: 0, aiUsd: 0 }));
  const at = (ts: number) => days[dayIdx(ts) - (today - span + 1)];
  for (const r of db.prepare('SELECT created_at AS ts FROM players WHERE created_at >= ?').all(from) as { ts: number }[]) { const d = at(r.ts); if (d) d.signups++; }
  const act = new Map<number, Set<number>>();
  for (const r of db.prepare('SELECT player_id AS p, ts FROM xp_events WHERE accepted > 0 AND ts >= ?').all(from) as { p: number; ts: number }[]) { const k = dayIdx(r.ts); if (!act.has(k)) act.set(k, new Set()); act.get(k)!.add(r.p); }
  for (const [k, s] of act) { const d = days[k - (today - span + 1)]; if (d) d.active = s.size; }
  for (const r of db.prepare("SELECT paid_at AS ts, COALESCE(hamyon_amount, amount) AS a FROM payments WHERE status = 'success' AND paid_at >= ?").all(from) as { ts: number; a: number }[]) { const d = at(r.ts); if (d) { d.paid++; d.revenue += r.a; } }
  for (const r of db.prepare('SELECT ts, cost_usd AS c FROM ai_cost_events WHERE ts >= ?').all(from) as { ts: number; c: number }[]) { const d = at(r.ts); if (d) d.aiUsd += r.c; }
  for (const d of days) d.aiUsd = Math.round(d.aiUsd * 100) / 100;

  // Saqlanib qolish: oxirgi 60 kunda ro'yxatdan o'tganlar; N-kuni faol bo'lganlar ulushi (kohorta yetarlicha eski bo'lsa)
  const cohort = db.prepare('SELECT id, created_at AS c FROM players WHERE created_at >= ?').all(now - 60 * DAY) as { id: number; c: number }[];
  const activeDays = new Map<number, Set<number>>();
  for (const r of db.prepare('SELECT player_id AS p, ts FROM xp_events WHERE accepted > 0 AND ts >= ?').all(now - 91 * DAY) as { p: number; ts: number }[]) { if (!activeDays.has(r.p)) activeDays.set(r.p, new Set()); activeDays.get(r.p)!.add(dayIdx(r.ts)); }
  const rate = (n: number): number | null => {
    const eligible = cohort.filter((u) => dayIdx(u.c) + n <= today);
    if (!eligible.length) return null;
    return Math.round((eligible.filter((u) => activeDays.get(u.id)?.has(dayIdx(u.c) + n)).length / eligible.length) * 1000) / 10;
  };
  const retention = { cohort: cohort.length, d1: rate(1), d7: rate(7), d30: rate(30) };

  // Voronka (barcha vaqt): ro'yxatdan o'tdi → birinchi XP → daraja testi → dars → mock → to'lov
  const withSource = (src: string) => one<{ n: number }>(db, 'SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE source = ? AND accepted > 0', src).n;
  const funnel = [
    { step: 'Ro‘yxatdan o‘tdi', n: totals.players },
    { step: 'Birinchi XP', n: one<{ n: number }>(db, 'SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE accepted > 0').n },
    { step: 'Daraja testi', n: withSource('placement') },
    { step: 'Dars', n: withSource('lesson') },
    { step: 'Mock test', n: withSource('mock') },
    { step: 'To‘lov', n: one<{ n: number }>(db, "SELECT COUNT(DISTINCT player_id) AS n FROM payments WHERE status = 'success'").n },
  ];

  const bySource = (db.prepare('SELECT source, COUNT(*) AS events, COALESCE(SUM(accepted), 0) AS xp FROM xp_events WHERE ts >= ? GROUP BY source ORDER BY xp DESC').all(from) as { source: string; events: number; xp: number }[]);
  const aiByFeature = (db.prepare('SELECT feature, ROUND(SUM(cost_usd), 2) AS usd FROM ai_cost_events WHERE ts >= ? GROUP BY feature ORDER BY usd DESC').all(from) as { feature: string; usd: number }[]);
  const revenue30 = days.reduce((s, d) => s + d.revenue, 0), paid30 = days.reduce((s, d) => s + d.paid, 0);
  ensureEventsTable(db);
  const events = eventTotals(db, tzDay(from + DAY / 2), tzDay(now));
  const signups = days.reduce((x, d) => x + d.signups, 0);
  const ref = one<{ n: number; a: number }>(db, 'SELECT COUNT(*) AS n, COALESCE(SUM(ref_rewarded), 0) AS a FROM players WHERE referred_by IS NOT NULL AND created_at >= ? AND created_at <= ?', from, now);
  const pct = (a: number, b: number): number | null => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);
  const growth = { events, signups, referredSignups: ref.n, referredActivated: ref.a, placementToSignupPct: pct(signups, events.placement_done), referredSharePct: pct(ref.n, signups) };
  return { generatedAt: now, totals, days, retention, funnel, bySource, aiByFeature, revenue30, paid30, growth };
}
