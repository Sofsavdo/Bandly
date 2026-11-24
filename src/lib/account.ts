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
  // Telegram'ga bog'langan hisob: shu qurilma tokeni serverda bekor qilinadi (qayta kirish — Telegram orqali).
  // Bog'lanmagan eski hisobda token yagona kalit (hisob kodi), shuning uchun bekor qilinmaydi.
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
export interface AuthConfig { telegram: { bot: string; host?: string | null } | null } // host — BotFather domeni: vidjet faqat shu manzilda ishlaydi
let cfg: Promise<AuthConfig> | null = null;
export const authConfig = (): Promise<AuthConfig> => (cfg ??= fetch('/api/auth/config').then((r) => (r.ok ? r.json() as Promise<AuthConfig> : { telegram: null })).catch(() => ({ telegram: null })));

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

// ---- Bot orqali kirish: 1) kod olinadi va bot ochiladi (/start login_<kod>); 2) foydalanuvchi botda tasdiqlaguncha har 2 s so'raladi.
// Mobil brauzer Telegram ilovasiga o'tganda sahifani xotiradan chiqarib yuborishi mumkin — shuning uchun maxfiy `poll` kaliti
// 10 daqiqaga saqlanadi va sahifa qayta ochilganda so'rash davom etadi (pendingBotLogin). Kalit bir martalik, token faqat botda tasdiqlangandan keyin beriladi.
const BOT_KEY = 'sz.botlogin';
const BOT_TTL = 10 * 60_000;
export interface BotPending { poll: string; until: number }
export const pendingBotLogin = (): BotPending | null => {
  try { const j = JSON.parse(localStorage.getItem(BOT_KEY) ?? 'null') as BotPending | null; return j && /^[a-f0-9]{32}$/.test(String(j.poll)) && j.until > Date.now() ? j : null; } catch { return null; }
};
const clearBotPending = (): void => { try { localStorage.removeItem(BOT_KEY); } catch { /* */ } };
export async function startBotLogin(): Promise<{ url: string; poll: string }> {
  const s = await call<{ code: string; poll: string; bot: string }>('/api/auth/bot/start', { method: 'POST' });
  try { localStorage.setItem(BOT_KEY, JSON.stringify({ poll: s.poll, until: Date.now() + BOT_TTL } satisfies BotPending)); } catch { /* xotira yo'q: faqat shu sahifada davom etadi */ }
  return { url: `https://t.me/${s.bot}?start=login_${s.code}`, poll: s.poll };
}
export async function waitBotLogin(poll: string, signal: { cancelled: boolean }, until = Date.now() + BOT_TTL, everyMs = 2000): Promise<Account> {
  while (!signal.cancelled && Date.now() < until) {
    await new Promise((r) => setTimeout(r, everyMs));
    if (signal.cancelled) break;
    let r: { pending?: boolean; token?: string; nickname?: string };
    try { r = await call(`/api/auth/bot/${poll}`); } catch (e) { // poll — havoladagi koddan farqli maxfiy kalit
      if (/eskirgan|expired|410/i.test((e as Error).message)) { clearBotPending(); throw e; }
      continue; // tarmoq uzilishi — qayta urinamiz
    }
    if (r.token && r.nickname) {
      clearBotPending();
      setAccount({ token: r.token, nickname: r.nickname, tg: true });
      await onLogin();
      void syncNow();
      return getAccount()!;
    }
  }
  if (!signal.cancelled) clearBotPending();
  throw new Error(L('Kirish tasdiqlanmadi — qayta urinib ko‘ring.'));
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

/** Boshqa qurilmada kirish: hisob kodi (token) bilan. */
export async function restoreAccount(code: string): Promise<Account> {
  const token = code.trim();
  const me = await call<{ nickname: string }>('/api/me', { headers: { 'x-token': token } });
  const a = { token, nickname: me.nickname };
  setAccount(a);
  await onLogin();
  return a;
}
