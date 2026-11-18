import { SALE_PERIODS, SALE_PLANS, periodPrice, type PlanId } from '../src/config';
import type { TrackId } from '../src/lib/types';

// Narxlar serverda belgilanadi (mijozdan kelgan summaga ishonilmaydi).
// Tariflar: src/config.ts SALE_PLANS (owner qarori, MONETIZATION_SPEC §7). Railway'da oylik narxni
// PLAN_PRICE_GENERAL / PLAN_PRICE_EXAM / PLAN_PRICE_ALL (so'm) bilan almashtirish mumkin (30 kunlik narx testi uchun).
export interface Period { days: number; label: string; note?: string }
export const PERIODS: Period[] = SALE_PERIODS;
export const PLAN_IDS: PlanId[] = SALE_PLANS.map((p) => p.id);
/** Eski alohida obunalar (faqat qo'lda berish va mavjud yozuvlar uchun; endi sotilmaydi). */
export const TRACKS: TrackId[] = ['exam', 'grammar', 'mocks'];

export function monthlyPrice(plan: PlanId, env: NodeJS.ProcessEnv = process.env): number {
  const o = Number(env[`PLAN_PRICE_${plan.toUpperCase()}`]);
  if (Number.isFinite(o) && o >= 1000) return Math.round(o);
  return SALE_PLANS.find((p) => p.id === plan)!.monthlyUzs;
}

export function priceFor(plan: PlanId, days: number, env: NodeJS.ProcessEnv = process.env): number {
  if (!PERIODS.some((p) => p.days === days)) throw new Error('period');
  return periodPrice(monthlyPrice(plan, env), days);
}

/** To'lov yozuvidagi nom → ochiladigan bo'limlar. Yangi to'lovlarda tarif (general/exam/all), eskilarida bo'lim nomi. */
export function tracksOf(planOrTrack: string): TrackId[] {
  const sp = SALE_PLANS.find((p) => p.id === planOrTrack);
  if (sp) return sp.tracks;
  return (TRACKS as string[]).includes(planOrTrack) ? [planOrTrack as TrackId] : [];
}
export const isPlan = (x: string): x is PlanId => (PLAN_IDS as string[]).includes(x);
