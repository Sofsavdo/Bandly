import type { TrackId } from './lib/types';

export const FREE_GAMES_PER_DAY = 2;

export interface Plan {
  id: TrackId;
  title: string;
  short: string;
  features: string[];
  /** NAMUNAVIY narx (so'm/oy). Haqiqiy narx oldindan sotuv (pre-sale) sinovidan keyin belgilanadi. */
  priceUzs: number;
  icon: string;
}

export const PLANS: Plan[] = [
  {
    id: 'exam',
    title: 'Imtihon tayyorgarligi',
    short: 'IELTS (Reading, Listening, Writing, Speaking). SAT va CEFR tez orada.',
    features: ['IELTS 4 ta bo‘lim', 'Kunlik reja va maqsad', 'So‘z o‘yinlari cheksiz', 'SAT va CEFR qo‘shilganda bepul'],
    priceUzs: 149_000,
    icon: '🎯',
  },
  {
    id: 'grammar',
    title: 'Grammar',
    short: 'Mavzular bo‘yicha mashqlar, o‘zbekcha tushuntirish, xatolar ustida ishlash.',
    features: ['Barcha grammar mavzulari', 'O‘zbekcha izohlar', 'Xatolarni takrorlash', 'So‘z o‘yinlari cheksiz'],
    priceUzs: 79_000,
    icon: '🧩',
  },
  {
    id: 'mocks',
    title: 'Mock testlar',
    short: 'Reading va Listening mocklar endi bepul (Mock Arena). Obuna: to‘liq imtihon simulyatsiyasi (Writing + Speaking bilan).',
    features: ['To‘liq imtihon simulyatsiyasi', 'Writing va Speaking qismlari', 'Natijalar tarixi', 'So‘z o‘yinlari cheksiz'],
    priceUzs: 99_000,
    icon: '⏱️',
  },
];

export const TRACK_NAME: Record<TrackId, string> = {
  exam: 'Imtihon tayyorgarligi',
  grammar: 'Grammar',
  mocks: 'Mock testlar',
};

// ---------------- Tariflar (owner qarori 2026-11-15, MONETIZATION_SPEC §7; 2026-11-17 dan saytda) ----------------
// Narxlar ma'lumot sifatida: Railway'da PLAN_PRICE_GENERAL / PLAN_PRICE_EXAM / PLAN_PRICE_ALL (so'm/oy) bilan almashtiriladi.
// Har bir tarif ichki bo'limlarni (TrackId) ochadi; eski alohida obunalar (exam/grammar/mocks) ham amal qilishda davom etadi.
export type PlanId = 'general' | 'exam' | 'all';
export interface SalePlan {
  id: PlanId; title: string; short: string; monthlyUzs: number; usd: string; tracks: TrackId[]; recommended?: boolean;
  voiceMin: number; writing: number; speaking: number; features: string[];
}
export const SALE_PLANS: SalePlan[] = [
  {
    id: 'general', title: 'General English', short: 'A1–C2 darslar, grammar va AI ustoz bilan ovozli suhbat.', monthlyUzs: 69_000, usd: '$5.99',
    tracks: ['grammar', 'mocks'], voiceMin: 60, writing: 0, speaking: 0,
    features: ['Grammar: barcha mavzular, o‘zbekcha izohlar', 'AI ustoz bilan ovozli suhbat: 60 daqiqa / oy', 'Darslar, xatolar ustida ishlash va kunlik reja', 'So‘z o‘yinlari cheksiz'],
  },
  {
    id: 'exam', title: 'Exam Preparation', short: 'IELTS, CEFR (Multilevel) va SAT: bo‘limlar bo‘yicha tayyorgarlik va AI baholash.', monthlyUzs: 99_000, usd: '$7.99',
    tracks: ['exam', 'mocks'], voiceMin: 60, writing: 10, speaking: 10,
    features: ['Reading, Listening, Writing, Speaking mashqlari', 'AI Writing baholash: 10 ta / oy', 'AI Speaking baholash (to‘liq mock): 10 ta / oy', 'AI ustoz bilan ovozli suhbat: 60 daqiqa / oy', 'Eshit va takrorla, so‘z o‘yinlari cheksiz'],
  },
  {
    id: 'all', title: 'All Access', short: 'Hammasi bitta obunada: General English + imtihon tayyorgarligi.', monthlyUzs: 129_000, usd: '$9.99',
    tracks: ['exam', 'grammar', 'mocks'], voiceMin: 60, writing: 20, speaking: 20, recommended: true,
    features: ['General English va Exam Preparation’dagi hamma narsa', 'AI Writing baholash: 20 ta / oy', 'AI Speaking baholash: 20 ta / oy', 'AI ustoz bilan ovozli suhbat: 60 daqiqa / oy', 'Barcha AI ustoz xarakterlari'],
  },
];
export interface PeriodDef { days: number; label: string; note?: string }
export const SALE_PERIODS: PeriodDef[] = [{ days: 30, label: '1 oy' }, { days: 90, label: '3 oy', note: '−10%' }, { days: 365, label: '12 oy', note: '2 oy bepul' }];
/** 3 oy = 3 × oylik × 0,9 (mingga pastga yaxlitlanadi); 12 oy = 10 × oylik. */
export function periodPrice(monthly: number, days: number): number {
  if (days === 30) return monthly;
  if (days === 90) return Math.floor((monthly * 3 * 0.9) / 1000) * 1000;
  if (days === 365) return monthly * 10;
  throw new Error('period');
}
/** Qulflangan bo'limni ochadigan eng arzon tarif. */
export const planForTrack = (t: TrackId): PlanId => (t === 'exam' ? 'exam' : 'general');
