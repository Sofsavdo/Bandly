// Bugungi rejani bir bosishda boshlash: vazifalar navbati sessiyada saqlanadi, pastdagi panel "Keyingisi" bilan olib boradi.
// Dars vazifasi o'tilgach (passedAt) keyingisiga o'zi o'tadi.
export interface RunTask { href: string; title: string; lessonId?: string }
export interface Run { tasks: RunTask[]; i: number; day: string }
const KEY = 'bandly.planrun';
const listeners = new Set<() => void>();
const today = (): string => new Date().toISOString().slice(0, 10);

export function getRun(): Run | null {
  try {
    const r = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Run | null;
    return r && Array.isArray(r.tasks) && r.i < r.tasks.length && r.day === today() ? r : null;
  } catch { return null; }
}
function put(r: Run | null): void {
  try { if (r) sessionStorage.setItem(KEY, JSON.stringify(r)); else sessionStorage.removeItem(KEY); } catch { /* */ }
  listeners.forEach((l) => l());
}
export const onRun = (cb: () => void): (() => void) => { listeners.add(cb); return () => listeners.delete(cb); };

/** Navbatni boshlaydi va birinchi vazifaga o'tadi. */
export function startRun(tasks: RunTask[]): void {
  if (!tasks.length) return;
  put({ tasks, i: 0, day: today() });
  location.hash = tasks[0]!.href;
}
/** Keyingi vazifa (oxirgisi bo'lsa — navbat tugaydi va bosh sahifaga qaytadi). */
export function nextTask(): void {
  const r = getRun();
  if (!r) return;
  const i = r.i + 1;
  if (i >= r.tasks.length) { put(null); location.hash = '#/'; return; }
  put({ ...r, i });
  location.hash = r.tasks[i]!.href;
}
export const stopRun = (): void => put(null);
