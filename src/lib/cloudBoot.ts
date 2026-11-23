// main.tsx dagi BIRINCHI import: boshqa modullar (profil store va h.k.) localStorage'ni o'qishidan OLDIN
// navbatdagi hisob progressini qurilmaga yozadi. Shu bilan sahifa yangilanayotganda eski xotira yangi progress ustidan yozolmaydi.
// Faqat progressMerge.ts (o'zi hech narsani import qilmaydi) import qilinadi.
import { mergeSnapshot } from './progressMerge';
export const SKIP = /^bandly\.(account\.v1|lang|sound|stt|tg|tg\.auth|pay\.open|bossrun\.v1|learnview\.v1|xpq\.v1|content\.v\d+|i18n\..*|cloud\..*|attempt\.v1\..*)$/; // kesh va qurilma sozlamalari — progress emas
export const REV = 'bandly.cloud.rev';
export const PENDING = 'bandly.cloud.pending';
export const syncable = (k: string): boolean => k.startsWith('bandly.') && !SKIP.test(k);

export function clearLocal(): void {
  try { Object.keys(localStorage).filter(syncable).forEach((k) => localStorage.removeItem(k)); localStorage.removeItem(REV); } catch { /* */ }
}

try {
  const raw = sessionStorage.getItem(PENDING);
  if (raw) {
    sessionStorage.removeItem(PENDING);
    const p = JSON.parse(raw) as { data: Record<string, string>; rev: number; mode?: 'merge' | 'replace' };
    // "merge": hisobdagi progress qurilmadagisi bilan birlashtiriladi — oxirgi sinxrondan keyingi ish yo'qolmaydi.
    // "replace": chiqishda tozalash (bo'sh ma'lumot) yoki eski navbat.
    const local: Record<string, string> = {};
    for (const k of Object.keys(localStorage)) if (syncable(k)) local[k] = localStorage.getItem(k) ?? '';
    const next = p.mode === 'merge' ? mergeSnapshot(local, p.data ?? {}) : (p.data ?? {});
    clearLocal();
    for (const [k, v] of Object.entries(next)) if (syncable(k)) localStorage.setItem(k, v);
    if (p.rev) localStorage.setItem(REV, String(p.rev));
  }
} catch { /* xotira yo'q — oddiy rejimda davom etadi */ }
