// Bepul tarif qoidalari (egasi tanlagan B varianti, 2026-11-18). Server ham, ilova ham shu sof funksiyalardan foydalanadi.
//  - Har bir kursda (General English, IELTS kursi, CEFR, SAT) kuniga LIMITS.perDay ta YANGI dars; birinchi kuni LIMITS.firstDay ta.
//  - Bir marta ochilgan dars abadiy ochiq (takrorlash bepul). Mock testlar, o'yinlar, xatolar ustida ishlash — cheklanmaydi.
//  - AI baholash: obunasiz o'quvchiga haftasiga writingPerWeek / speakingPerWeek ta.
//  - Kun Toshkent vaqti bilan (UTC+5) 00:00 da yangilanadi.
export type Course = 'ge' | 'ielts' | 'cefr' | 'sat';
export const COURSES: Course[] = ['ge', 'ielts', 'cefr', 'sat'];
/** Qaysi obuna kursni to'liq ochadi: General English → grammar (General / All Access), qolganlari → exam (Exam / All Access). */
export const COURSE_TRACK: Record<Course, 'grammar' | 'exam'> = { ge: 'grammar', ielts: 'exam', cefr: 'exam', sat: 'exam' };

export interface FreeLimits { perDay: number; firstDay: number; writingPerWeek: number; speakingPerWeek: number }
export const DEFAULT_LIMITS: FreeLimits = { perDay: 1, firstDay: 3, writingPerWeek: 1, speakingPerWeek: 1 };

export interface FreeState {
  /** ochilgan darslar: id → kurs va ochilgan kun */
  unlocked: Record<string, { course: Course; day: string }>;
  /** birinchi bepul dars ochilgan kun (birinchi kun bonusi uchun) */
  firstDay: string | null;
}
export const emptyState = (): FreeState => ({ unlocked: {}, firstDay: null });

const TZ_MS = 5 * 3600_000; // Toshkent, UTC+5 (yozgi vaqt yo'q)
export const tashkentDay = (now: number): string => new Date(now + TZ_MS).toISOString().slice(0, 10);
/** Keyingi Toshkent yarim tuni (ms). */
export const nextReset = (now: number): number => { const d = new Date(now + TZ_MS); d.setUTCHours(24, 0, 0, 0); return d.getTime() - TZ_MS; };
/** Hafta kaliti: Toshkent bo'yicha dushanbadan boshlanadigan hafta. */
export function weekKey(now: number): string {
  const d = new Date(now + TZ_MS); const dow = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

export const isCourse = (c: unknown): c is Course => COURSES.includes(c as Course);
export const validLessonId = (id: unknown): id is string => typeof id === 'string' && /^[\w-]{2,48}$/.test(id);

export function limitFor(state: FreeState, today: string, limits: FreeLimits): number {
  return !state.firstDay || state.firstDay === today ? limits.firstDay : limits.perDay;
}
export function usedToday(state: FreeState, course: Course, today: string): number {
  return Object.values(state.unlocked).filter((u) => u.course === course && u.day === today).length;
}
/** Bugun shu kursda yana nechta yangi dars ochish mumkin. */
export const leftToday = (state: FreeState, course: Course, today: string, limits: FreeLimits): number =>
  Math.max(0, limitFor(state, today, limits) - usedToday(state, course, today));

export interface Decision { ok: boolean; already: boolean; left: number }
/** Darsni ochish mumkinmi (obunasiz o'quvchi uchun). Avval ochilgan dars — doim mumkin va kvota sarflanmaydi. */
export function decide(state: FreeState, course: Course, lessonId: string, today: string, limits: FreeLimits): Decision {
  if (state.unlocked[lessonId]) return { ok: true, already: true, left: leftToday(state, course, today, limits) };
  const left = leftToday(state, course, today, limits);
  return { ok: left > 0, already: false, left: Math.max(0, left - 1) };
}
export function applyUnlock(state: FreeState, course: Course, lessonId: string, today: string): FreeState {
  if (state.unlocked[lessonId]) return state;
  return { unlocked: { ...state.unlocked, [lessonId]: { course, day: today } }, firstDay: state.firstDay ?? today };
}
