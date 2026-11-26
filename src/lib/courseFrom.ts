// CEFR kursidan ochilgan General English darsi: dars ichida va keyingi darslarda "Imtihon → CEFR kursi" konteksti saqlansin
// (yuqori menyu, sarlavha va «orqaga» tugmasi General English'ni ko'rsatmasin). IELTS va SAT darslari o'z id prefiksi bilan aniqlanadi.
const KEY = 'bandly.course.from.v1';
const TTL_MS = 3 * 3_600_000;
export const CEFR_HREF = '#/cefr';

export function rememberCourse(href: string, now = Date.now()): void {
  try { sessionStorage.setItem(KEY, JSON.stringify({ href, at: now })); } catch { /* sessionStorage yo'q */ }
}
export function clearCourse(): void { try { sessionStorage.removeItem(KEY); } catch { /* */ } }
/** Hozir ochiq kurs konteksti (muddati o'tmagan bo'lsa), aks holda null. */
export function currentCourse(now = Date.now()): string | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as { href?: string; at?: number } | null;
    return v?.href && typeof v.at === 'number' && now - v.at < TTL_MS ? v.href : null;
  } catch { return null; }
}
