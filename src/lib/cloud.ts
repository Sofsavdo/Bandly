// Hisob progressi (2026-11-17): qurilmadagi Bandly ma'lumotlari (XP, darslar, xatolar, natijalar, boss…) hisobga saqlanadi.
// - Kirganda: hisobda progress bo'lsa — u yuklanadi (qurilmadagi mehmon progressida XP ko'proq bo'lsa, u hisobga yoziladi).
// - Hisobda progress yo'q bo'lsa — qurilmadagi progress hisobga yuklanadi (eski natijalar yo'qolmaydi).
// - Kirgan holatda o'zgarishlar har 20 soniyada va sahifa yopilayotganda yuboriladi.
// - Chiqishda: avval oxirgi holat yuboriladi, keyin qurilmadan tozalanadi — hisob progressi hisobda qoladi.
import { getAccount } from './account';

import { PENDING, REV, clearLocal, syncable } from './cloudBoot';
export { clearLocal, syncable };

export function snapshot(): Record<string, string> {
  const out: Record<string, string> = {};
  try { for (const k of Object.keys(localStorage).sort()) if (syncable(k)) out[k] = localStorage.getItem(k) ?? ''; } catch { /* */ }
  return out;
}
const xpOf = (d: Record<string, string> | null): number => { try { return Number((JSON.parse(d?.['bandly.profile.v1'] ?? '{}') as { xp?: number }).xp) || 0; } catch { return 0; } };
const getRev = (): number => { try { return Number(localStorage.getItem(REV)) || 0; } catch { return 0; } };
const setRev = (r: number): void => { try { localStorage.setItem(REV, String(r)); } catch { /* */ } };

let frozen = false;
/** Progressni keyingi yuklanishda qurilmaga yozish uchun navbatga qo'yadi (cloudBoot.ts bajaradi). */
function stage(data: Record<string, string>, rev: number): void {
  frozen = true; // yangilanishgacha boshqa yuborish yo'q
  try { sessionStorage.setItem(PENDING, JSON.stringify({ data, rev })); } catch { /* */ }
}
/** Chiqishda: qurilmadagi hisob progressi keyingi yuklanishda tozalanadi. */
export function stageClear(): void { stage({}, 0); clearLocal(); }

async function req<T>(method: 'GET' | 'PUT', body?: unknown, keepalive = false): Promise<{ ok: boolean; status: number; json: T }> {
  const a = getAccount();
  const r = await fetch('/api/progress', { method, keepalive, headers: { 'x-token': a?.token ?? '', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { ok: r.ok, status: r.status, json: (await r.json().catch(() => ({}))) as T };
}
type Remote = { data: Record<string, string> | null; rev: number };

let lastSent = '';
/** O'zgarish bo'lsa hisobga yuboradi. Boshqa qurilma yangiroq yozgan bo'lsa (409) — yangisini oladi. */
export async function pushProgress(keepalive = false): Promise<void> {
  if (!getAccount() || frozen) return;
  const data = snapshot();
  const j = JSON.stringify(data);
  if (j === lastSent || !Object.keys(data).length) return;
  try {
    const r = await req<{ rev: number }>('PUT', { data, rev: getRev() }, keepalive);
    if (r.ok) { setRev(r.json.rev); lastSent = j; }
    else if (r.status === 409) {
      // Boshqa qurilma yangilagan: XP ko'prog'i qoladi. Qurilmadagisi ko'p bo'lsa — ustidan yoziladi; aks holda
      // hisobdagisi keyingi ochilishda yuklanadi (to'lov yoki dars o'rtasida sahifa birdan yangilanmaydi).
      const g = await req<Remote>('GET');
      if (!g.ok) return;
      if (!g.json.data || xpOf(data) >= xpOf(g.json.data)) { setRev(g.json.rev); const r2 = await req<{ rev: number }>('PUT', { data, rev: g.json.rev }, keepalive); if (r2.ok) { setRev(r2.json.rev); lastSent = j; } }
      else stage(g.json.data, g.json.rev);
    }
  } catch { /* tarmoq: keyingi safar */ }
}

/** Ilova ochilganda: boshqa qurilmada yangilangan bo'lsa — yangi progressni yuklab, sahifani yangilaydi. */
export async function pullIfNewer(force = false): Promise<void> {
  if (!getAccount()) return;
  try {
    const r = await req<Remote>('GET');
    if (!r.ok) return;
    if (r.json.data && (force || r.json.rev > getRev())) { stage(r.json.data, r.json.rev); location.reload(); }
    else if (!r.json.data) await pushProgress();
  } catch { /* oflayn: qurilmadagi holat bilan davom etadi */ }
}

/** Hisobga kirgandan keyin (laqab, kod yoki Telegram). Hisob progressi qurilmaga yuklanadi yoki mehmon progressi hisobga yoziladi. */
export async function onLogin(): Promise<void> {
  try {
    const r = await req<Remote>('GET');
    if (!r.ok) return;
    const local = snapshot();
    const remote = r.json.data;
    if (!remote || xpOf(local) > xpOf(remote)) {
      // Hisob bo'sh yoki qurilmada ko'proq o'rganilgan — qurilmadagi progress hisobga yoziladi
      setRev(r.json.rev); lastSent = '';
      await pushProgress();
      return;
    }
    if (JSON.stringify(local) === JSON.stringify(remote)) { setRev(r.json.rev); return; }
    stage(remote, r.json.rev);
    location.reload();
  } catch { /* */ }
}

let started = false;
export function startCloud(): void {
  if (started) return; started = true;
  setInterval(() => void pushProgress(), 20_000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void pushProgress(true); });
}
