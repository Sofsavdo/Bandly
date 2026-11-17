// main.tsx dagi BIRINCHI import: boshqa modullar (profil store va h.k.) localStorage'ni o'qishidan OLDIN
// navbatdagi hisob progressini qurilmaga yozadi. Shu bilan sahifa yangilanayotganda eski xotira yangi progress ustidan yozolmaydi.
// Bu fayl hech narsani import qilmaydi.
export const SKIP = /^bandly\.(account\.v1|lang|sound|stt|tg|tg\.auth|pay\.open|bossrun\.v1|learnview\.v1|xpq\.v1|cloud\..*|attempt\.v1\..*)$/;
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
    const p = JSON.parse(raw) as { data: Record<string, string>; rev: number };
    clearLocal();
    for (const [k, v] of Object.entries(p.data ?? {})) if (syncable(k)) localStorage.setItem(k, v);
    if (p.rev) localStorage.setItem(REV, String(p.rev));
  }
} catch { /* xotira yo'q — oddiy rejimda davom etadi */ }
