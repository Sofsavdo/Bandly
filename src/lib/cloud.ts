// Hisob progressi (2026-11-17): qurilmadagi Sellzen ma'lumotlari (XP, darslar, xatolar, natijalar, boss…) hisobga saqlanadi.
// - Ikki qurilma (yoki mehmon progressi + hisob) to'qnashganda yozuv darajasida birlashtiriladi (progressMerge.ts):
//   bir qurilmada o'tilgan dars, natija, xato yoki SRS kartasi ikkinchi qurilmadagi eski holat sabab yo'qolmaydi.
// - Kirgan holatda o'zgarishlar har 20 soniyada va sahifa yopilayotganda yuboriladi.
// - Chiqishda: avval oxirgi holat yuboriladi, keyin qurilmadan tozalanadi — hisob progressi hisobda qoladi.
import { getAccount } from './account';

import { PENDING, REV, clearLocal, syncable } from './cloudBoot';
import { mergeSnapshot } from './progressMerge';
export { clearLocal, syncable };

export function snapshot(): Record<string, string> {
  const out: Record<string, string> = {};
  try { for (const k of Object.keys(localStorage).sort()) if (syncable(k)) out[k] = localStorage.getItem(k) ?? ''; } catch { /* */ }
  return out;
}
const getRev = (): number => { try { return Number(localStorage.getItem(REV)) || 0; } catch { return 0; } };
const setRev = (r: number): void => { try { localStorage.setItem(REV, String(r)); } catch { /* */ } };

let frozen = false;
/** Progressni keyingi yuklanishda qurilmaga yozish uchun navbatga qo'yadi (cloudBoot.ts bajaradi). */
function stage(data: Record<string, string>, rev: number, mode: 'merge' | 'replace' = 'merge'): void {
  if (mode === 'replace') frozen = true; // chiqish: tozalashgacha boshqa yuborish yo'q
  try { sessionStorage.setItem(PENDING, JSON.stringify({ data, rev, mode })); } catch { /* */ }
}
/** Chiqishda: qurilmadagi hisob progressi keyingi yuklanishda tozalanadi. */
export function stageClear(): void { stage({}, 0, 'replace'); clearLocal(); }

async function req<T>(method: 'GET' | 'PUT', body?: unknown, keepalive = false): Promise<{ ok: boolean; status: number; json: T }> {
  const a = getAccount();
  const r = await fetch('/api/progress', { method, keepalive, headers: { 'x-token': a?.token ?? '', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { ok: r.ok, status: r.status, json: (await r.json().catch(() => ({}))) as T };
}
type Remote = { data: Record<string, string> | null; rev: number };

let lastSent = '';
/** Shu sahifada hisob progressi serverdan o'qildi (daraja, reja) — majburiy qadamlar (savolnoma, daraja testi) faqat shundan keyin so'raladi. */
let verified = false;
export const cloudVerified = (): boolean => verified;
/** Boshqa qurilmadan kelgan, hali shu sahifaga yuklanmagan qism: keyingi yuborishlarda ham qo'shib yuboriladi (aks holda qayta o'chib ketardi). */
let carry: Record<string, string> | null = null;
const outgoing = (): Record<string, string> => (carry ? mergeSnapshot(snapshot(), carry) : snapshot());

/** O'zgarish bo'lsa hisobga yuboradi. Boshqa qurilma yangiroq yozgan bo'lsa (409) — ikkalasi birlashtirilib yoziladi. */
export async function pushProgress(keepalive = false): Promise<void> {
  if (!getAccount() || frozen) return;
  const data = outgoing();
  const j = JSON.stringify(data);
  if (j === lastSent || !Object.keys(data).length) return;
  try {
    const r = await req<{ rev: number }>('PUT', { data, rev: getRev() }, keepalive);
    if (r.ok) { setRev(r.json.rev); lastSent = j; return; }
    if (r.status === 400 || r.status === 413) { lastSent = j; return; } // server rad etdi: shu ma'lumotni har 20 s qayta yubormaymiz, o'zgarganda yana urinadi
    if (r.status !== 409) return;
    for (let i = 0; i < 3; i++) { // parallel yozuvlar bo'lsa bir necha marta urinadi
      const g = await req<Remote>('GET');
      if (!g.ok) return;
      const merged = g.json.data ? mergeSnapshot(data, g.json.data) : data;
      const r2 = await req<{ rev: number }>('PUT', { data: merged, rev: g.json.rev }, keepalive);
      if (r2.status === 409) continue;
      if (!r2.ok) return;
      setRev(r2.json.rev); lastSent = JSON.stringify(merged);
      if (lastSent !== JSON.stringify(snapshot())) { carry = merged; stage(merged, r2.json.rev); } // keyingi ochilishda qurilmaga ham yoziladi
      return;
    }
  } catch { /* tarmoq: keyingi safar */ }
}

/** Ilova ochilganda: boshqa qurilmada yangilangan bo'lsa — birlashtirib yuklaydi va sahifani yangilaydi. */
export async function pullIfNewer(force = false): Promise<void> {
  if (!getAccount()) return;
  try {
    const r = await req<Remote>('GET');
    if (!r.ok) return;
    if (r.json.data && (force || r.json.rev > getRev())) {
      const merged = mergeSnapshot(snapshot(), r.json.data);
      if (JSON.stringify(merged) === JSON.stringify(snapshot())) { setRev(r.json.rev); verified = true; return; }
      stage(r.json.data, r.json.rev); location.reload();
    } else { verified = true; if (!r.json.data) await pushProgress(); }
  } catch { /* oflayn: qurilmadagi holat bilan davom etadi */ }
}

/** Hisobga kirgandan keyin (laqab, kod yoki Telegram): mehmon progressi va hisob progressi birlashtiriladi. */
export async function onLogin(): Promise<void> {
  try {
    const r = await req<Remote>('GET');
    if (!r.ok) return;
    const local = snapshot();
    const remote = r.json.data;
    setRev(r.json.rev); lastSent = '';
    if (!remote) { verified = true; await pushProgress(); return; }
    const merged = mergeSnapshot(local, remote);
    if (JSON.stringify(merged) !== JSON.stringify(remote)) { carry = merged; await pushProgress(); }
    if (JSON.stringify(merged) === JSON.stringify(local)) { verified = true; return; }
    stage(remote, getRev()); // yuklanishda qurilmadagisi bilan birlashtiriladi
    location.reload();
  } catch { /* */ }
}

let started = false;
export function startCloud(): void {
  if (started) return; started = true;
  setInterval(() => void pushProgress(), 20_000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void pushProgress(true); });
  window.addEventListener('online', () => void pushProgress()); // internet qaytganda kutmasdan yuboriladi
}
