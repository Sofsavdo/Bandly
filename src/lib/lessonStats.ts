// Dars yakunidagi ko'rsatkichlar (yulduz, XP, aniqlik, vaqt) va haftalik seriya nuqtalari — sof funksiyalar (brauzersiz sinovdan o'tadi).
import { daysBetween } from './game';

export interface Tally { ok: number; total: number }
export const emptyTally = (): Tally => ({ ok: 0, total: 0 });
export const addTally = (t: Tally, ok: boolean): Tally => ({ ok: t.ok + (ok ? 1 : 0), total: t.total + 1 });
/** Aniqlik, butun foizda (javob berilmagan bo'lsa 0). */
export const accuracyPct = (t: Tally): number => (t.total > 0 ? Math.round((t.ok / t.total) * 100) : 0);

/** "mm:ss" (99:59 dan oshmaydi — kompyuter uyquga ketgan holat uchun). */
export function fmtDuration(ms: number): string {
  const s = Math.min(99 * 60 + 59, Math.max(0, Math.round(ms / 1000)));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

/** Bo'lim nuqtalari: nechta dars o'tilgan (yakunlangan dars ham hisobda, hozirgisi bo'lsa ham). */
export function unitDots(lessonIds: string[], passed: (id: string) => boolean, currentId?: string): { done: boolean; now: boolean }[] {
  return lessonIds.map((id) => ({ done: passed(id) || id === currentId, now: id === currentId }));
}

export type WeekDot = { day: string; state: 'done' | 'today' | 'todo' };
/** Joriy hafta (dushanbadan yakshanbagacha) nuqtalari. Seriya `lastActiveDay` da tugaydi va `streak` kun davom etadi. */
export function weekDots(today: string, lastActiveDay: string | null, streak: number): WeekDot[] {
  const [y, m, d] = today.split('-').map(Number) as [number, number, number];
  const dow = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // 0 = dushanba
  const out: WeekDot[] = [];
  for (let i = 0; i < 7; i++) {
    const dt = new Date(Date.UTC(y, m - 1, d - dow + i));
    const key = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
    const ago = lastActiveDay ? daysBetween(key, lastActiveDay) : -1; // lastActiveDay dan necha kun oldin
    const done = !!lastActiveDay && ago >= 0 && ago < Math.max(0, streak);
    out.push({ day: key, state: key === today ? (done ? 'done' : 'today') : done ? 'done' : 'todo' });
  }
  return out;
}

/** Haftaning qisqa kun nomlari (dushanbadan boshlab), interfeys tilida — brauzerning o'z kalendaridan (tarjima kerak emas). */
export function weekdayNames(lang: string): string[] {
  const names = (loc: string) => Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(loc, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + i)))); // 2024-01-01 — dushanba
  try { return names(lang); } catch { return names('en'); }
}
