import type { Cefr } from './levels';

/** voice — Premium: kuniga N daqiqa ovozli ustoz (egasi, 2026-11-26) */
export type TrackId = 'exam' | 'grammar' | 'mocks' | 'voice';

export interface CardState {
  box: number; // 0 = o'rganilmoqda, 5 = o'zlashtirilgan
  due: number; // keyingi takrorlash vaqti (ms)
  seen: number;
  correct: number;
  wrong: number;
}

export interface Profile {
  v: 1;
  xp: number;
  streak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  dailyXp: number;
  dailyDay: string;
  dailyGoal: number;
  achievements: string[];
  /** DEMO: to'lov ulangunga qadar obuna holati qurilmada saqlanadi */
  plan: Record<TrackId, boolean>;
  /** Server tasdiqlagan obuna tugash vaqti (ms); demo rejimda null */
  planUntil: Record<TrackId, number | null>;
  srs: Record<string, CardState>;
  gamesPlayed: number;
  freeGames: { day: string; n: number };
  hardMode: boolean;
  /** Ustoz xarakteri 0–3 (2–3 faqat adult=true bo'lsa amal qiladi) */
  roastLevel: number;
  /** Foydalanuvchi 18 yoshdan oshganini o'zi tasdiqlagan */
  adult: boolean;
  /** Ustoz ovozi: erkak (standart) yoki ayol (egasi, 2026-11-26) */
  tutorVoice?: 'male' | 'female';
  /** Qo'shimcha xarakter: romantik (18+) yoki bolalar uchun; null — roastLevel (0–3) amal qiladi */
  tutorExtra?: 'romantic' | 'kids' | null;
  /** Bolalar rejimi: faqat bolalar xarakteri, 18+ xarakterlar yopiq; o'chirish — ota-ona PIN kodi bilan (shu qurilmada) */
  kidsMode?: boolean;
  /** Bolalar rejimi PIN kodining xeshi (ochiq saqlanmaydi) */
  kidsPin?: string | null;
  /** Daraja aniqlash natijasi (null = hali aniqlanmagan) */
  level: Cefr | null;
  /** Maqsad IELTS bali */
  target: number;
  /** Imtihon sanasi (YYYY-MM-DD) yoki null */
  examDate: string | null;
  placementAt: string | null;
  /** Birinchi daraja aniqlash natijasidan taxminiy boshlang'ich band */
  baselineBand: number | null;
  /** Daraja aniqlash natijalari tarixi (o'sishni ko'rsatish uchun) */
  checkpoints: { at: string; level: Cefr; band: number }[];
  /** Kunlar bo'yicha olingan XP (oxirgi 90 kun) */
  activity: Record<string, number>;
  /** Bugungi reja bajarilishi */
  today: { day: string; done: string[] };
  /** Seriyani saqlash (GAMIFIED_LEARNING_SPEC §3.4): har 7 kunda +1 muzlatish, ko'pi bilan 2 */
  freezes: number;
  /** Uzilgan seriya — 48 soat ichida ikki baravar kunlik maqsad bilan tiklash mumkin */
  brokenStreak: { value: number; day: string } | null;
  lastRepairDay: string | null;
  /** Yutilgan boss sinovlari soni (birinchi g'alabalar) */
  bossWins: number;
}

export const defaultProfile = (today: string): Profile => ({
  v: 1,
  xp: 0,
  streak: 0,
  longestStreak: 0,
  lastActiveDay: null,
  dailyXp: 0,
  dailyDay: today,
  dailyGoal: 50,
  achievements: [],
  plan: { exam: false, grammar: false, mocks: false, voice: false },
  planUntil: { exam: null, grammar: null, mocks: null, voice: null },
  srs: {},
  gamesPlayed: 0,
  freeGames: { day: today, n: 0 },
  hardMode: false,
  roastLevel: 0,
  adult: false,
  level: null,
  target: 6.5,
  examDate: null,
  placementAt: null,
  baselineBand: null,
  checkpoints: [],
  activity: {},
  today: { day: today, done: [] },
  freezes: 0,
  brokenStreak: null,
  lastRepairDay: null,
  bossWins: 0,
});
