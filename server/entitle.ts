// Server tomonidagi huquqlar va AI baholash kvotasi (MONETIZATION_SPEC §7, AI_COST_CONTROL_SPEC).
// Obuna holati faqat serverdagi subscriptions jadvalidan olinadi — mijozdagi "plan" belgilariga ishonilmaydi.
import type { DatabaseSync } from 'node:sqlite';
import { SALE_PLANS, type PlanId } from '../src/config';
import { ApiError, byToken } from './db';
import { freeAssessKey, freeAssessLimit, freeLimitsFromEnv } from './freeQuota';

/** Faol tarif: exam + grammar → all, faqat exam → exam, faqat grammar → general. */
export function planOf(db: DatabaseSync, playerId: number, now = Date.now()): PlanId | null {
  const rows = db.prepare('SELECT track FROM subscriptions WHERE player_id = ? AND until > ?').all(playerId, now) as { track: string }[];
  const has = (t: string) => rows.some((r) => r.track === t);
  return has('exam') && has('grammar') ? 'all' : has('exam') ? 'exam' : has('grammar') ? 'general' : null;
}

export type AssessKind = 'writing' | 'speaking';
/** Oylik kvota: tarifdagi son (EXAM 10, ALL 20; GENERAL va bepul — 0). */
export const assessLimit = (plan: PlanId | null, kind: AssessKind): number => (plan ? SALE_PLANS.find((p) => p.id === plan)![kind] : 0);
const monthKey = (kind: string, now: number) => `assess-${kind}:${new Date(now).toISOString().slice(0, 7)}`;

/** Baholashdan OLDIN chaqiriladi: tarif va oylik kvota tekshiriladi va 1 ta band qilinadi. Xato bo'lsa refundAssessment. */
export function useAssessment(db: DatabaseSync, token: string, kind: AssessKind, now = Date.now()): { playerId: number; used: number; limit: number } {
  const p = byToken(db, token);
  const name = kind === 'writing' ? 'Writing' : 'Speaking';
  const paidLimit = assessLimit(planOf(db, p.id, now), kind);
  // Obunasiz (yoki General): haftalik bepul ulush — AI baholashni sinab ko'rish uchun (B varianti)
  const free = paidLimit <= 0;
  const limit = free ? freeAssessLimit(kind, freeLimitsFromEnv()) : paidLimit;
  if (limit <= 0) throw new ApiError(402, `AI ${name} baholash Exam Preparation va All Access tariflarida bor.`);
  const key = free ? freeAssessKey(kind, now) : monthKey(kind, now);
  const row = db.prepare('SELECT calls FROM ai_usage WHERE player_id = ? AND day = ?').get(p.id, key) as { calls: number } | undefined;
  const used = row?.calls ?? 0;
  if (used >= limit) throw new ApiError(free ? 402 : 429, free ? `Bu haftalik bepul AI ${name} baholash ishlatildi. Keyingisi dushanba kuni ochiladi; cheksiz baholash — Exam Preparation va All Access tariflarida.` : `Bu oylik AI ${name} baholash limiti tugadi (${limit} ta).`);
  db.prepare('INSERT INTO ai_usage (player_id, day, calls) VALUES (?, ?, 1) ON CONFLICT(player_id, day) DO UPDATE SET calls = calls + 1').run(p.id, key);
  return { playerId: p.id, used: used + 1, limit };
}
export function refundAssessment(db: DatabaseSync, playerId: number, kind: AssessKind, now = Date.now()): void {
  const key = assessLimit(planOf(db, playerId, now), kind) > 0 ? monthKey(kind, now) : freeAssessKey(kind, now);
  db.prepare('UPDATE ai_usage SET calls = MAX(0, calls - 1) WHERE player_id = ? AND day = ?').run(playerId, key);
}
export function assessmentUsage(db: DatabaseSync, playerId: number, now = Date.now()): Record<AssessKind, { used: number; limit: number; period: 'month' | 'week' }> {
  const plan = planOf(db, playerId, now);
  const lim = freeLimitsFromEnv();
  const one = (k: AssessKind) => {
    const paid = assessLimit(plan, k) > 0;
    const key = paid ? monthKey(k, now) : freeAssessKey(k, now);
    const used = (db.prepare('SELECT calls FROM ai_usage WHERE player_id = ? AND day = ?').get(playerId, key) as { calls: number } | undefined)?.calls ?? 0;
    return { used, limit: paid ? assessLimit(plan, k) : freeAssessLimit(k, lim), period: paid ? 'month' as const : 'week' as const };
  };
  return { writing: one('writing'), speaking: one('speaking') };
}
