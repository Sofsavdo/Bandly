import type { TrackId } from './lib/types';
import { L } from './i18n';

export const FREE_GAMES_PER_DAY = Infinity; // o'yinlar bepul va cheksiz (pullik API ishlatmaydi)

// Eski alohida obunalar (exam/grammar/mocks) endi sotilmaydi: tariflar SALE_PLANS'da, ular shu bo'limlarni ochadi.
export const TRACK_NAME: Record<TrackId, string> = {
  exam: L('Imtihon tayyorgarligi'),
  grammar: 'Grammar',
  mocks: L('Mock testlar'),
  voice: L('Premium: ovozli ustoz'),
};

// ---------------- Tariflar (owner qarori 2026-11-15, MONETIZATION_SPEC §7; 2026-11-17 dan saytda) ----------------
// Narxlar ma'lumot sifatida: Railway'da PLAN_PRICE_GENERAL / PLAN_PRICE_EXAM / PLAN_PRICE_ALL (so'm/oy) bilan almashtiriladi.
// Har bir tarif ichki bo'limlarni (TrackId) ochadi; eski alohida obunalar (exam/grammar/mocks) ham amal qilishda davom etadi.
export type PlanId = 'general' | 'exam' | 'all' | 'premium';
export interface SalePlan {
  id: PlanId; title: string; short: string; monthlyUzs: number; usd: string; tracks: TrackId[]; recommended?: boolean;
  voiceMin: number; writing: number; speaking: number; features: string[];
  /** Premium: kunlik ovozli suhbat daqiqasi (voiceMin = oylik jami, kunlik × 30) */
  voiceDaily?: number;
}
// Limit raqamlari (ovozli daqiqa, AI baholash soni) va narx admin panelda o'zgaradi: ilova ochilganda serverdan olinadi
// (applyServerLimits) va "features" matni shu raqamlardan quriladi — e'lon qilingan va haqiqiy limit doim bir xil.
const voiceLine = (n: number) => L('Sellzen bilan ovozli suhbat: {0} daqiqa / oy', [n]);
export const SALE_PLANS: SalePlan[] = [
  {
    id: 'general', title: 'General English', short: L('A1–C2 darslar, grammar va Sellzen bilan ovozli suhbat.'), monthlyUzs: 69_000, usd: '$5.99',
    tracks: ['grammar', 'mocks'], voiceMin: 60, writing: 0, speaking: 0,
    get features() { return [L('A1–C2 darslar — kunlik cheklovsiz'), L('Grammar: barcha mavzular, o‘zbekcha izohlar'), voiceLine(this.voiceMin), L('Darslar, xatolar ustida ishlash va kunlik reja')].concat(this.writing > 0 ? [L('AI Writing baholash: {0} ta / oy', [this.writing])] : [], this.speaking > 0 ? [L('AI Speaking baholash: {0} ta / oy', [this.speaking])] : []); },
  },
  {
    id: 'exam', title: 'Exam Preparation', short: L('IELTS, CEFR (Multilevel) va SAT: bo‘limlar bo‘yicha tayyorgarlik va AI baholash.'), monthlyUzs: 99_000, usd: '$7.99',
    tracks: ['exam', 'mocks'], voiceMin: 60, writing: 10, speaking: 10,
    get features() { return [L('IELTS kursi, CEFR va SAT — kunlik cheklovsiz'), L('Reading, Listening, Writing, Speaking mashqlari'), ...(this.writing > 0 ? [L('AI Writing baholash: {0} ta / oy', [this.writing])] : []), ...(this.speaking > 0 ? [L('AI Speaking baholash (to‘liq mock): {0} ta / oy', [this.speaking])] : []), voiceLine(this.voiceMin), L('Eshit va takrorla — cheksiz')]; },
  },
  {
    id: 'all', title: 'All Access', short: L('Hammasi bitta obunada: General English + imtihon tayyorgarligi.'), monthlyUzs: 129_000, usd: '$9.99',
    tracks: ['exam', 'grammar', 'mocks'], voiceMin: 60, writing: 20, speaking: 20, recommended: true,
    get features() { return [L('General English va Exam Preparation’dagi hamma narsa'), ...(this.writing > 0 ? [L('AI Writing baholash: {0} ta / oy', [this.writing])] : []), ...(this.speaking > 0 ? [L('AI Speaking baholash: {0} ta / oy', [this.speaking])] : []), voiceLine(this.voiceMin), L('Barcha Sellzen xarakterlari')]; },
  },
  {
    // Egasi (2026-11-26): "AI ustozni cheksiz qilib yoqish uchun kattaroq tarif" → kuniga 30 daqiqa, 499 000 so'm/oy; eng yuqori AI baholash limitlari.
    // Daqiqa, narx va limitlar admin panelda (PREMIUM_DAILY_MINUTES, PLAN_PRICE_PREMIUM, PLAN_PREMIUM_*).
    id: 'premium', title: 'Premium', short: L('All Access’dagi hamma narsa + har kuni Sellzen ustoz bilan uzoq ovozli suhbat.'), monthlyUzs: 499_000, usd: '$38.99',
    tracks: ['exam', 'grammar', 'mocks', 'voice'], voiceMin: 900, voiceDaily: 30, writing: 60, speaking: 60,
    get features() { return [L('Sellzen bilan ovozli suhbat: kuniga {0} daqiqa ({1} daqiqa / oy)', [this.voiceDaily ?? 30, this.voiceMin]), L('All Access’dagi hamma narsa'), L('Erkak yoki ayol ustoz, barcha xarakterlar'), ...(this.writing > 0 ? [L('AI Writing baholash: {0} ta / oy', [this.writing])] : []), ...(this.speaking > 0 ? [L('AI Speaking baholash: {0} ta / oy', [this.speaking])] : [])]; },
  },
];
/** Bepul tarif raqamlari (landing va ogohlantirishlarda ko'rsatiladi). Server qiymati bilan yangilanadi. */
export const FREE_INFO = { lessonsPerDay: 1, firstDayLessons: 3, writingPerWeek: 1, speakingPerWeek: 1, liveMinutesPerDay: 5 };
export interface ServerLimits {
  free: typeof FREE_INFO;
  plans: Record<PlanId, { voiceMin: number; writing: number; speaking: number; voiceDaily?: number }>;
}
/** Serverdagi (admin paneldagi) limitlar va 30 kunlik narxlarni tariflarga yozadi. */
export function applyServerLimits(limits: ServerLimits | undefined, monthly?: Partial<Record<PlanId, number>>): void {
  for (const p of SALE_PLANS) {
    const l = limits?.plans?.[p.id];
    if (l) { p.voiceMin = l.voiceMin; p.writing = l.writing; p.speaking = l.speaking; if (l.voiceDaily !== undefined) p.voiceDaily = l.voiceDaily; }
    const m = monthly?.[p.id];
    if (typeof m === 'number' && m > 0) p.monthlyUzs = m;
  }
  if (limits?.free) Object.assign(FREE_INFO, limits.free);
}
export interface PeriodDef { days: number; label: string; note?: string }
export const SALE_PERIODS: PeriodDef[] = [{ days: 30, label: L('1 oy') }, { days: 90, label: L('3 oy'), note: '−10%' }, { days: 365, label: L('12 oy'), note: L('2 oy bepul') }];
/** 3 oy = 3 × oylik × 0,9 (mingga pastga yaxlitlanadi); 12 oy = 10 × oylik. */
export function periodPrice(monthly: number, days: number): number {
  if (days === 30) return monthly;
  if (days === 90) return Math.floor((monthly * 3 * 0.9) / 1000) * 1000;
  if (days === 365) return monthly * 10;
  throw new Error('period');
}
/** Qulflangan bo'limni ochadigan eng arzon tarif. */
export const planForTrack = (t: TrackId): PlanId => (t === 'exam' ? 'exam' : 'general');
