// Ro'yxatdan o'tishdan oldingi qisqa savolnoma (8 qadam, har biri bir bosish) va unga qarab shaxsiy reja.
// Reja hisob-kitobi oshkora: bir CEFR darajasi (~1 IELTS band) uchun ~200 soat yo'naltirilgan mashg'ulot (Cambridge "guided learning
// hours" bo'yicha keng tarqalgan taxmin). Natija "taxminiy" deb ko'rsatiladi — kafolat emas.
import type { Cefr } from './levels';
import { LEVEL_BAND } from './progress';
import { weeklyLessonTarget, type Goal } from './planPrefs';

export type Why = 'abroad' | 'local' | 'career' | 'self';
export type When = 'm1' | 'm3' | 'm6' | 'later' | 'unknown';
export type Skill = 'speaking' | 'writing' | 'listening' | 'reading' | 'grammar' | 'vocab';
export type Tutor = 'friendly' | 'strict' | 'savage';

export interface Answers {
  goal: Goal;
  why: Why;
  when: When;
  examDate: string | null;   // aniq sana (ixtiyoriy)
  target: string | null;     // IELTS: "6.5", CEFR: "B2", SAT: "1400"
  level: Cefr;               // o'zi baholagan daraja (daraja testi aniqlashtiradi)
  hard: Skill[];
  minutes: number;
  tutor: Tutor;
}

export const HOURS_PER_BAND = 200;
const WEEKS: Record<When, number | null> = { m1: 4, m3: 12, m6: 24, later: 40, unknown: null };
export const isExam = (g: Goal): boolean => g !== 'general';

/** Maqsadni IELTS band shkalasiga keltiradi (SAT uchun — null: band shkalasi yo'q). */
export function targetBand(goal: Goal, target: string | null): number | null {
  if (!target) return null;
  if (goal === 'ielts') { const n = Number(target); return n >= 4 && n <= 9 ? n : null; }
  if (goal === 'cefr') return (LEVEL_BAND as Record<string, number>)[target] ?? null;
  return null;
}

export function weeksUntil(a: Pick<Answers, 'when' | 'examDate'>, now = Date.now()): number | null {
  if (a.examDate) {
    const t = Date.parse(`${a.examDate}T00:00:00+05:00`);
    if (Number.isFinite(t) && t > now) return Math.max(1, Math.round((t - now) / (7 * 86_400_000)));
  }
  return WEEKS[a.when];
}

export interface Plan {
  weeks: number | null;          // imtihongacha
  weeklyLessons: number;
  fromBand: number;              // hozirgi taxminiy band
  toBand: number | null;         // maqsad (band shkalasida)
  hoursNeeded: number | null;    // maqsadgacha taxminiy soat
  weeksNeeded: number | null;    // tanlangan kunlik vaqt bilan
  minutesNeeded: number | null;  // imtihon sanasiga ulgurish uchun kunlik daqiqa
  verdict: 'ok' | 'tight' | 'reached' | 'open';
  focus: Skill[];
}

/** Javoblardan reja: maqsadgacha qancha mashg'ulot kerak, tanlangan kunlik vaqt yetadimi. */
export function buildPlan(a: Answers, now = Date.now()): Plan {
  const weeks = isExam(a.goal) ? weeksUntil(a, now) : null;
  const fromBand = LEVEL_BAND[a.level];
  const toBand = targetBand(a.goal, a.target);
  const gap = toBand === null ? null : Math.max(0, toBand - fromBand);
  const hoursNeeded = gap === null ? null : Math.round(gap * HOURS_PER_BAND);
  const weeksNeeded = hoursNeeded === null ? null : hoursNeeded === 0 ? 0 : Math.ceil(hoursNeeded / ((a.minutes * 7) / 60));
  const minutesNeeded = hoursNeeded && weeks ? Math.ceil((hoursNeeded * 60) / (weeks * 7)) : null;
  const verdict: Plan['verdict'] = gap === 0 ? 'reached' : weeksNeeded === null || weeks === null ? 'open' : weeksNeeded <= weeks ? 'ok' : 'tight';
  const focus = (a.hard.length ? a.hard : (['speaking', 'vocab'] as Skill[])).slice(0, 2);
  return { weeks, weeklyLessons: weeklyLessonTarget(a.minutes), fromBand, toBand, hoursNeeded, weeksNeeded, minutesNeeded, verdict, focus };
}

const KEY = 'bandly.onboard.v1';
export function loadAnswers(): Answers | null {
  try { const d = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Answers | null; return d && typeof d.goal === 'string' && typeof d.minutes === 'number' ? d : null; } catch { return null; }
}
export function saveAnswers(a: Answers): void { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch { /* */ } }
