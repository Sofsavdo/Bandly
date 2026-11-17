// Kirgan o'quvchi uchun majburiy boshlang'ich qadamlar: 1) shaxsiy reja savolnomasi (Bandi uslubi shu yerda tanlanadi),
// 2) daraja testi. Ular bajarilmaguncha asosiy sahifalardan shu qadamlarga yo'naltiriladi (to'lov, profil va xodim sahifalari ochiq).
import { getAccount } from './account';
import { loadAnswers } from './onboarding';
import { getProfile } from './store';

const FREE = /^#\/(start|placement|pricing|profile|studio|admin|creator|groups|welcome|duel\/)/;

export function setupRoute(hash: string, s: { account: boolean; onboarded: boolean; level: string | null } = { account: !!getAccount(), onboarded: !!loadAnswers(), level: getProfile().level }): string | null {
  if (!s.account || FREE.test(hash)) return null;
  if (!s.onboarded) return '#/start';
  if (!s.level) return '#/placement';
  return null;
}
