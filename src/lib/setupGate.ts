// Kirgan o'quvchi uchun majburiy boshlang'ich qadamlar: 1) shaxsiy reja savolnomasi (ustoz uslubi shu yerda tanlanadi),
// 2) daraja testi. Ular bajarilmaguncha asosiy sahifalardan shu qadamlarga yo'naltiriladi (to'lov, profil va xodim sahifalari ochiq).
import { getAccount } from './account';
import { loadAnswers } from './onboarding';
import { loadAttempt } from './examAttempt';
import { getProfile } from './store';

const FREE = /^#\/(start|placement|pricing|profile|studio|admin|creator|leads|groups|welcome|login|certificates|duel\/)/;

/** Mehmon (kirmagan) bo'limlarni KO'RA oladi: bosh sahifa, darslar xaritasi, IELTS kursi ro'yxati, Imtihon va Mock Arena ro'yxatlari,
 *  o'yinlar ro'yxati, tariflar, bepul vositalar, duel taklifi va 3 daqiqalik daraja testi (o'sish voronkasi: test → natija → ro'yxatdan o'tish). Kirish faqat HARAKATda so'raladi: darsni ochish, Sellzen, test topshirish,
 *  o'yin o'ynash, Writing/Speaking, profil va boshqalar (qaytish manzili saqlanadi) — natija darhol hisobga yoziladi.
 *  (Egasi qarori 2026-11-23: oldingi "mehmon faqat landing" siyosati o'rniga.) */
const PUBLIC = /^#\/(welcome|placement|learn|ielts|exam|mocks|mocks\/(reading|listening)|games|pricing|tools|duel\/[A-Za-z0-9]{4,12})?$/;
/** Mock Arena'ning bitta testi (Reading/Listening): mehmon uni boshidan oxirigacha topshira oladi; javoblar qurilmada saqlanadi, natijani
 *  baholash (javob kalitlari faqat serverda) va ko'rsatish ro'yxatdan o'tgandan keyin (egasi qarori 2026-11-24: mehmon mock → ro'yxat → reja). */
const GUEST_MOCK = /^#\/(exam|mocks)\/(reading|listening)\/[\w-]+$/;
const LOGIN = /^#\/login(\?|$)/;
const path = (hash: string): string => hash.split('?')[0] || '#/';
export const needsLogin = (hash: string, account: boolean): boolean => !account && !PUBLIC.test(path(hash)) && !GUEST_MOCK.test(path(hash)) && !LOGIN.test(hash);
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

const SKIP_KEY = 'bandly.setup.skip';
/** Mock natijasi rejasidagi havola bosilganda: shu sahifa savolnoma/daraja testi qadamlariga yo'naltirilmaydi (bevosita havola ishlaydi). Faqat shu tab sessiyasida. */
export function allowDirect(href: string): void { try { sessionStorage.setItem(SKIP_KEY, path(href)); } catch { /* sessiya xotirasi yo'q */ } }
const directAllowed = (hash: string): boolean => { try { return sessionStorage.getItem(SKIP_KEY) === path(hash); } catch { return false; } };
/** Hozirgi sahifa — mehmon sifatida topshirilgan (yoki boshlangan) mock testi: natija ochilguncha va ko'rilguncha savolnomaga yo'naltirilmaydi. */
function guestMockHere(hash: string): boolean {
  const m = /^#\/(?:exam|mocks)\/(reading|listening)\/([\w-]+)$/.exec(path(hash));
  return !!m && loadAttempt(`${m[1]}:${m[2]}`)?.guest === true;
}

export function setupRoute(hash: string, s: { account: boolean; onboarded: boolean; level: string | null; guestMock?: boolean; direct?: boolean } = { account: !!getAccount(), onboarded: !!loadAnswers(), level: getProfile().level }): string | null {
  if (!s.account || FREE.test(hash)) return null;
  // Mehmon sifatida topshirilgan mock natijasi hisobga bog'lanayotgan paytda: avval natijani ko'ramiz, savolnoma/daraja testiga keyin o'tiladi
  if (s.guestMock ?? guestMockHere(hash)) return null;
  if (s.direct ?? directAllowed(hash)) return null;
  if (!s.onboarded) return '#/start';
  if (!s.level) return '#/placement';
  return null;
}
