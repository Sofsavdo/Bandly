// Kirgan o'quvchi uchun majburiy boshlang'ich qadamlar: 1) shaxsiy reja savolnomasi (ustoz uslubi shu yerda tanlanadi),
// 2) daraja testi. Ular bajarilmaguncha asosiy sahifalardan shu qadamlarga yo'naltiriladi (to'lov, profil va xodim sahifalari ochiq).
import { getAccount } from './account';
import { loadAnswers } from './onboarding';
import { getProfile } from './store';

const FREE = /^#\/(start|placement|pricing|profile|studio|admin|creator|leads|groups|welcome|login|certificates|duel\/)/;

/** Mehmon (kirmagan) bo'limlarni KO'RA oladi: bosh sahifa, darslar xaritasi, IELTS kursi ro'yxati, Imtihon va Mock Arena ro'yxatlari,
 *  o'yinlar ro'yxati, tariflar, bepul vositalar va duel taklifi. Kirish faqat HARAKATda so'raladi: darsni ochish, AI ustoz, test topshirish,
 *  o'yin o'ynash, Writing/Speaking, daraja testi, profil va boshqalar (qaytish manzili saqlanadi) — natija darhol hisobga yoziladi.
 *  (Egasi qarori 2026-11-23: oldingi "mehmon faqat landing" siyosati o'rniga.) */
const PUBLIC = /^#\/(welcome|learn|ielts|exam|mocks|mocks\/(reading|listening)|games|pricing|tools|duel\/[A-Za-z0-9]{4,12})?$/;
const LOGIN = /^#\/login(\?|$)/;
const path = (hash: string): string => hash.split('?')[0] || '#/';
export const needsLogin = (hash: string, account: boolean): boolean => !account && !PUBLIC.test(path(hash)) && !LOGIN.test(hash);
/** Kirishdan keyin qaytiladigan sahifa (faqat ichki hash yo'llari — tashqi manzilga yo'naltirib bo'lmaydi). */
export function nextOf(hash: string): string {
  const q = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  const n = new URLSearchParams(q).get('next') ?? '';
  return /^#\/[\w\-/]*$/.test(n) && !LOGIN.test(n) ? n : '#/';
}
/** Yagona kirish qoidasi: mehmon ichki sahifada — login sahifasiga (qaytish manzili bilan); kirgan o'quvchi login sahifasida — qaytish manziliga. */
export function authRoute(hash: string, account: boolean): string | null {
  const h = hash || '#/';
  if (!account) return needsLogin(h, false) ? `#/login?next=${encodeURIComponent(path(h))}` : null;
  return LOGIN.test(h) ? nextOf(h) : null;
}

export function setupRoute(hash: string, s: { account: boolean; onboarded: boolean; level: string | null } = { account: !!getAccount(), onboarded: !!loadAnswers(), level: getProfile().level }): string | null {
  if (!s.account || FREE.test(hash)) return null;
  if (!s.onboarded) return '#/start';
  if (!s.level) return '#/placement';
  return null;
}
