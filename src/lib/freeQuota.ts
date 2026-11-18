// Bepul tarif kvotasi ilova tomonida. Hisobli o'quvchi — server hisoblaydi (POST /api/free/unlock); mehmon — shu qurilmada,
// bir xil qoidalar bilan (src/lib/freeRules.ts). Obunachiga cheklov yo'q.
import { getAccount, logout } from './account';
import { getProfile } from './store';
import { COURSE_TRACK, DEFAULT_LIMITS, applyUnlock, decide, emptyState, leftToday, nextReset, tashkentDay, type Course, type FreeLimits, type FreeState } from './freeRules';

const KEY = 'bandly.free.v1';
let limits: FreeLimits = DEFAULT_LIMITS;

const load = (): FreeState => { try { const s = JSON.parse(localStorage.getItem(KEY) ?? 'null') as FreeState | null; return s && typeof s.unlocked === 'object' ? s : emptyState(); } catch { return emptyState(); } };
const save = (s: FreeState) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* */ } };

export const isSubscribed = (course: Course): boolean => !!getProfile().plan[COURSE_TRACK[course]];

/** Serverdagi holatni olish (hisob bo'lsa): chegaralar va ochilgan darslar boshqa qurilmalar bilan mos bo'ladi. */
export async function syncFree(): Promise<void> {
  const acc = getAccount(); if (!acc) return;
  try {
    const r = await fetch('/api/free', { headers: { 'x-token': acc.token } });
    if (!r.ok) return;
    const j = await r.json() as { limits: FreeLimits; state: FreeState };
    limits = j.limits;
    const local = load();
    save({ unlocked: { ...local.unlocked, ...j.state.unlocked }, firstDay: j.state.firstDay ?? local.firstDay });
  } catch { /* oflayn */ }
}

/** Darsni ochish ruxsati. Avval ochilgan dars yoki obuna — darhol ruxsat. Aks holda kunlik kvotadan bittasi sarflanadi. */
export async function requestUnlock(course: Course, lessonId: string, now = Date.now()): Promise<{ ok: boolean; resetAt: number }> {
  const resetAt = nextReset(now);
  if (isSubscribed(course)) return { ok: true, resetAt };
  const today = tashkentDay(now);
  const s = load();
  if (s.unlocked[lessonId]) return { ok: true, resetAt };
  const acc = getAccount();
  if (acc) {
    try {
      const r = await fetch('/api/free/unlock', { method: 'POST', headers: { 'content-type': 'application/json', 'x-token': acc.token }, body: JSON.stringify({ course, lessonId }) });
      if (r.status === 401) { logout(); return { ok: false, resetAt }; } // soxta yoki eskirgan token — qayta kirish kerak
      if (r.ok) {
        const j = await r.json() as { ok: boolean; resetAt: number };
        if (j.ok) save(applyUnlock(s, course, lessonId, today));
        return { ok: j.ok, resetAt: j.resetAt ?? resetAt };
      }
    } catch { /* tarmoq yo'q — qurilmadagi hisob bilan davom etadi */ }
  }
  const d = decide(s, course, lessonId, today, limits);
  if (d.ok) save(applyUnlock(s, course, lessonId, today));
  return { ok: d.ok, resetAt };
}

/** Bugun shu kursda yana nechta yangi bepul dars ochish mumkin (obunachi uchun null — cheklovsiz). */
export function freeLeft(course: Course, now = Date.now()): number | null {
  if (isSubscribed(course)) return null;
  return leftToday(load(), course, tashkentDay(now), limits);
}
export const isUnlockedFree = (lessonId: string): boolean => !!load().unlocked[lessonId];
