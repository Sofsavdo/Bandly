import type { Profile } from './types';
import { MASTERED_BOX } from './srs';
import { L } from '../i18n';

export const dayKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const utcDays = (key: string): number => {
  const [y, m, d] = key.split('-').map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
};
export const daysBetween = (a: string, b: string): number => utcDays(b) - utcDays(a);

export function nextStreak(last: string | null, today: string, streak: number): number {
  if (!last) return 1;
  const diff = daysBetween(last, today);
  if (diff <= 0) return Math.max(streak, 1);
  return diff === 1 ? streak + 1 : 1;
}

export const MAX_FREEZES = 2;
export const REPAIR_WINDOW_DAYS = 2;   // 48 soat
export const REPAIR_COOLDOWN_DAYS = 30;

type StreakState = Pick<Profile, 'streak' | 'longestStreak' | 'lastActiveDay' | 'freezes' | 'brokenStreak' | 'lastRepairDay'>;

/** Kunlik maqsad bajarilgan kun uchun seriyani yangilaydi (GAMIFIED_LEARNING_SPEC §3.4).
 *  O'tkazib yuborilgan kunlar muzlatish bilan yopiladi; yetmasa seriya uziladi va 48 soat tiklash uchun saqlanadi. */
export function goalDay(s: StreakState, today: string): StreakState {
  const last = s.lastActiveDay;
  if (last && daysBetween(last, today) <= 0) return s; // bugun allaqachon hisoblangan (yoki soat orqaga surilgan)
  let { streak, freezes, brokenStreak } = s;
  if (!last) streak = 1;
  else {
    const missed = daysBetween(last, today) - 1;
    if (missed === 0) streak += 1;
    else if (missed <= freezes) { freezes -= missed; streak += 1; }
    else { brokenStreak = streak > 1 ? { value: streak, day: today } : brokenStreak; streak = 1; }
  }
  if (streak > 1 && streak % 7 === 0) freezes = Math.min(MAX_FREEZES, freezes + 1);
  return { ...s, streak, freezes, brokenStreak, lastActiveDay: today, longestStreak: Math.max(s.longestStreak, streak) };
}

/** Uzilgan seriyani tiklash: uzilgandan keyin 48 soat ichida ikki baravar maqsad, 30 kunda bir marta. */
export function tryRepair(s: StreakState, today: string, dailyXp: number, dailyGoal: number): StreakState {
  const b = s.brokenStreak;
  if (!b || dailyXp < dailyGoal * 2 || daysBetween(b.day, today) > REPAIR_WINDOW_DAYS) return s;
  if (s.lastRepairDay && daysBetween(s.lastRepairDay, today) < REPAIR_COOLDOWN_DAYS) return s;
  const streak = b.value + s.streak;
  return { ...s, streak, brokenStreak: null, lastRepairDay: today, longestStreak: Math.max(s.longestStreak, streak) };
}

/** Uzilgan seriyani hozir tiklash mumkinmi (48 soat oynasi va 30 kunlik cheklov) — faqat ko'rsatish uchun. */
export const repairOpen = (s: StreakState, today: string): boolean =>
  !!s.brokenStreak && daysBetween(s.brokenStreak.day, today) <= REPAIR_WINDOW_DAYS && (!s.lastRepairDay || daysBetween(s.lastRepairDay, today) >= REPAIR_COOLDOWN_DAYS);

/** Ko'rsatiladigan seriya: muzlatish bilan yopib bo'lmaydigan bo'shliq bo'lsa 0. */
export function displayStreak(p: StreakState, today: string): number {
  if (!p.lastActiveDay) return 0;
  const missed = daysBetween(p.lastActiveDay, today) - 1;
  return missed <= Math.max(0, p.freezes) ? p.streak : 0;
}

export const xpForLevel = (level: number): number => 50 * (level - 1) * (level - 1);
export const levelFromXp = (xp: number): number => Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;

export function levelProgress(xp: number): { level: number; into: number; span: number; pct: number } {
  const level = levelFromXp(xp);
  const base = xpForLevel(level);
  const span = xpForLevel(level + 1) - base;
  return { level, into: xp - base, span, pct: Math.min(1, (xp - base) / span) };
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  check: (p: Profile) => boolean;
}

const masteredCount = (p: Profile): number => Object.values(p.srs).filter((c) => c.box >= MASTERED_BOX).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-xp', title: L('Birinchi qadam'), desc: L('Birinchi XP ni yig‘ing'), check: (p) => p.xp > 0 },
  { id: 'streak-3', title: L('3 kunlik seriya'), desc: L('Ketma-ket 3 kun mashq qiling'), check: (p) => p.streak >= 3 },
  { id: 'streak-7', title: L('Haftalik seriya'), desc: L('Ketma-ket 7 kun mashq qiling'), check: (p) => p.streak >= 7 },
  { id: 'level-5', title: L('5-daraja'), desc: L('5-darajaga yeting'), check: (p) => levelFromXp(p.xp) >= 5 },
  { id: 'words-10', title: L('10 ta so‘z'), desc: L('10 ta so‘zni o‘zlashtiring'), check: (p) => masteredCount(p) >= 10 },
  { id: 'words-30', title: L('So‘z ustasi'), desc: L('30 ta so‘zni o‘zlashtiring'), check: (p) => masteredCount(p) >= 30 },
  { id: 'games-10', title: L('O‘yinchi'), desc: L('10 ta o‘yin o‘ynang'), check: (p) => p.gamesPlayed >= 10 },
  { id: 'daily-goal', title: L('Kunlik maqsad'), desc: L('Kunlik XP maqsadini bajaring'), check: (p) => p.dailyXp >= p.dailyGoal },
  { id: 'streak-30', title: L('30 kunlik seriya'), desc: L('Ketma-ket 30 kun kunlik maqsadni bajaring'), check: (p) => p.streak >= 30 },
  { id: 'boss-1', title: L('Birinchi boss'), desc: L('Birinchi bo‘lim boss sinovini yuting'), check: (p) => (p.bossWins ?? 0) >= 1 },
  { id: 'boss-5', title: L('Boss ovchisi'), desc: L('5 ta bo‘lim boss sinovini yuting'), check: (p) => (p.bossWins ?? 0) >= 5 },
  { id: 'level-10', title: L('10-daraja'), desc: L('Sellzen darajasi 10 ga yeting'), check: (p) => levelFromXp(p.xp) >= 10 },
];

export interface XpResult {
  profile: Profile;
  levelUp: number | null;
  unlocked: Achievement[];
}

/** Sof funksiya: XP qo'shadi, seriya va kunlik hisobni yangilaydi, yutuqlarni tekshiradi. */
export function applyXp(p: Profile, amount: number, today: string): XpResult {
  const amt = Math.max(0, Math.round(amount));
  const rolled: Profile = p.dailyDay === today ? p : { ...p, dailyDay: today, dailyXp: 0 };
  const dailyXp = rolled.dailyXp + amt;
  // Seriya faqat kunlik maqsad bajarilgan kuni o'sadi (1 XP bilan seriya saqlanmaydi)
  let st: StreakState = rolled;
  if (dailyXp >= rolled.dailyGoal) st = goalDay(st, today);
  st = tryRepair(st, today, dailyXp, rolled.dailyGoal);
  const next: Profile = { ...rolled, ...st, xp: rolled.xp + amt, dailyXp };
  const before = new Set(next.achievements);
  const unlocked = ACHIEVEMENTS.filter((a) => !before.has(a.id) && a.check(next));
  next.achievements = [...next.achievements, ...unlocked.map((a) => a.id)];
  const lv0 = levelFromXp(p.xp);
  const lv1 = levelFromXp(next.xp);
  return { profile: next, levelUp: lv1 > lv0 ? lv1 : null, unlocked };
}
