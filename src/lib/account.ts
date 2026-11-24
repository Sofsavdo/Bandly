import { clearServerPlans, dropXpQueue, getProfile, takeXpQueue } from './store';
import { getRef } from './referral';
import { onLogin, pushProgress, stageClear } from './cloud';
import { L } from '../i18n';

const KEY = 'bandly.account.v1';
export interface Account { token: string; nickname: string; tg?: boolean; /** Telegram profil rasmi (bo'lmasa — bosh harf) */ photo?: string | null }
/** Profil rasmini yangilaydi (/api/me javobidan). */
export const setPhoto = (photo: string | null | undefined): void => { const a = getAccount(); if (a && photo !== undefined && a.photo !== photo) setAccount({ ...a, photo }); };

export const getAccount = (): Account | null => {
  try { return JSON.parse(localStorage.getItem(KEY) ?? 'null') as Account | null; } catch { return null; }
};
const listeners = new Set<() => void>();
/** Hisob o'zgarishini kuzatish (kirish/chiqish). */
export const onAccountChange = (cb: () => void): (() => void) => { listeners.add(cb); return () => listeners.delete(cb); };
const setAccount = (a: Account | null) => {
  queueMicrotask(() => listeners.forEach((cb) => cb()));
  try { if (a) localStorage.setItem(KEY, JSON.stringify(a)); else localStorage.removeItem(KEY); } catch { /* */ }
};
export const leaveLeague = (): void => setAccount(null);
/** Hisobdan chiqish: token va serverdan kelgan obunalar bu qurilmadan o'chiriladi; darslar progressi qurilmada qoladi. */
export function logout(): void {
  setAccount(null);
  clearServerPlans();
  try { sessionStorage.removeItem('bandly.tg.auth'); } catch { /* */ }
}

const KEEP = new Set(['bandly.lang', 'bandly.sound', 'bandly.tg']);
/**
 * Chiqish. wipe=true — bu qurilmadagi barcha Sellzen ma'lumotlari (progress, XP, natijalar, xatolar) ham o'chiriladi:
 * sayt yangi foydalanuvchiga qanday ko'rinsa, shunday ochiladi. Hisobdagi obuna va reyting serverda qoladi.
 */
export async function signOut(wipe: boolean): Promise<void> {
  const had = !!getAccount();
  if (had) await pushProgress(); // progress hisobda qoladi
  // Doimiy identifikatorga (Telegram, Google yoki telefon) bog'langan hisob: shu qurilma tokeni serverda bekor qilinadi (qayta kirish — shu usullar bilan).
  // Hech narsaga bog'lanmagan eski hisobda token yagona kalit, shuning uchun bekor qilinmaydi.
  const acc0 = getAccount(); const tok = acc0?.tg ? acc0.token : null;
  if (tok) { try { await fetch('/api/auth/logout', { method: 'POST', headers: { 'x-token': tok } }); } catch { /* oflayn: token qurilmadan baribir o'chiriladi */ } }
  logout();
  if (had) stageClear(); // hisob progressi qurilmada qolmaydi — qayta kirganda yuklanadi
  if (wipe) {
    for (const st of [localStorage, sessionStorage]) {
      try { Object.keys(st).filter((k) => k.startsWith('bandly.') && !KEEP.has(k)).forEach((k) => st.removeItem(k)); } catch { /* */ }
    }
  }
  location.replace(`${location.pathname}${location.search}#/`);
  location.reload();
}

// ---------------- Telegram orqali kirish (OD-05) ----------------
export interface AuthConfig { telegram: { bot: string; host?: string | null } | null; phone?: boolean; google?: { clientId: string } | null } // host — BotFather domeni: vidjet faqat shu manzilda ishlaydi
let cfg: Promise<AuthConfig> | null = null;
export const authConfig = (): Promise<AuthConfig> => (cfg ??= fetch('/api/auth/config').then((r) => (r.ok ? r.json() as Promise<AuthConfig> : { telegram: null })).catch(() => ({ telegram: null })));

/** Telefon raqam + parol (kirish yoki yangi hisob). Qurilmadagi eski hisob bo'lsa unga bog'lanadi (XP/obuna/progress saqlanadi). */
export async function phoneAuth(kind: 'login' | 'register', phone: string, password: string, nickname?: string): Promise<Account> {
  const r = await call<Account>(`/api/auth/phone/${kind}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone, password, nickname: nickname || undefined, link: getAccount()?.token, ref: getRef() }) });
  return finishLogin(r);
}
/** Google ID token bilan kirish (token serverda tekshiriladi). */
export async function googleLogin(credential: string): Promise<Account> {
  const r = await call<Account>('/api/auth/google', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ credential, link: getAccount()?.token, ref: getRef() }) });
  return finishLogin(r);
}
// `tg: true` — hisob doimiy identifikatorga (Telegram, telefon yoki Google) bog'langan: qayta kirish mumkin, hisob tokenini saqlash shart emas.
async function finishLogin(r: Account): Promise<Account> {
  setAccount({ token: r.token, nickname: r.nickname, tg: true, photo: r.photo ?? null });
  await onLogin();
  void syncNow();
  return getAccount()!;
}

/** Telegram ma'lumoti bilan kirish. Qurilmada eski (laqabli) hisob bo'lsa, u Telegram'ga bog'lanadi — XP va obuna saqlanadi. */
export async function loginTelegram(kind: 'widget' | 'webapp', payload: unknown): Promise<Account & { linked: boolean }> {
  const link = getAccount()?.token;
  const ref = getRef();
  const body = kind === 'webapp' ? { initData: payload, link, ref } : { user: payload, link, ref };
  const r = await call<Account & { linked: boolean }>(kind === 'webapp' ? '/api/auth/telegram/webapp' : '/api/auth/telegram', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  setAccount({ token: r.token, nickname: r.nickname, tg: true, photo: (r as { photo?: string | null }).photo ?? null });
  await onLogin();
  void syncNow();
  return r;
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try { res = await fetch(path, init); } catch { throw new Error(L('Server bilan aloqa yo‘q')); }
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error ?? L('Xato {0}', [res.status]));
  return body;
}

export async function joinLeague(nickname: string): Promise<Account> {
  const a = await call<Account>('/api/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nickname, ref: getRef() }) });
  setAccount(a);
  await onLogin(); // qurilmadagi progress yangi hisobga yoziladi
  void syncNow();
  return a;
}

export interface Row { rank: number; nickname: string; xp: number; streak: number; me: boolean }
export interface Board { top: Row[]; me: Row | null; since: number | null }

export const fetchBoard = (period: 'week' | 'all'): Promise<Board> =>
  call<Board>(`/api/leaderboard?period=${period}`, { headers: { 'x-token': getAccount()?.token ?? '' } });

let lastStreak = -1;
/** XP hodisalarini serverga yuboradi (server qabul qiladi/cheklaydi) va seriyani yangilaydi. */
export async function syncNow(): Promise<void> {
  const a = getAccount();
  if (!a) return;
  const p = getProfile();
  try {
    const q = takeXpQueue();
    if (q.length) {
      const r = await call<{ done: string[] }>('/api/xp', { method: 'POST', headers: { 'content-type': 'application/json', 'x-token': a.token }, body: JSON.stringify({ events: q.slice(0, 50) }) });
      dropXpQueue(r.done);
    }
    if (p.streak !== lastStreak) {
      await call('/api/sync', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: a.token, streak: p.streak }) });
      lastStreak = p.streak;
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'Noma’lum token') leaveLeague(); // server bazasi tiklangan bo'lishi mumkin
  }
}

/** Har 15 soniyada va sahifa yopilayotganda sinxronlaydi. */
export function startSync(): void {
  setInterval(() => void syncNow(), 15_000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') void syncNow(); });
}

// ---------------- Duel ----------------
export interface DuelPlayer { nickname: string; score: number | null; correct: number | null; ms: number | null; me: boolean; rank: number | null }
export interface DuelInfo { code: string; words: string[]; expired: boolean; full: boolean; players: DuelPlayer[]; iFinished: boolean }

const json = (body: unknown): RequestInit => ({ method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export const createDuel = (): Promise<{ code: string; words: string[] }> => call('/api/duel/create', json({ token: getAccount()?.token ?? '' }));
export const fetchDuel = (code: string): Promise<DuelInfo> => call(`/api/duel/${encodeURIComponent(code)}`, { headers: { 'x-token': getAccount()?.token ?? '' } });
export const submitDuel = (code: string, score: number, correct: number, ms: number): Promise<DuelInfo> =>
  call(`/api/duel/${encodeURIComponent(code)}/submit`, json({ token: getAccount()?.token ?? '', score, correct, ms }));

/** Duel havolasi; ref berilsa — taklif kodi bilan (do'st shu havoladan ro'yxatdan o'tsa taklif qilganga yoziladi, lib/referral.ts captureRef). */
export const duelUrl = (code: string, ref?: string | null): string => `${window.location.origin}${window.location.pathname}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}#/duel/${code}`;

let refCode: Promise<string | null> | null = null;
/** O'z taklif kodim (/api/referral), sahifa davomida bir marta so'raladi. Xato yoki mehmon — null. */
export function myRefCode(): Promise<string | null> {
  const a = getAccount();
  if (!a) return Promise.resolve(null);
  refCode ??= fetch('/api/referral', { headers: { 'x-token': a.token } }).then((r) => (r.ok ? r.json() : null)).then((j: { code?: string } | null) => j?.code ?? null).catch(() => { refCode = null; return null; });
  return refCode;
}

