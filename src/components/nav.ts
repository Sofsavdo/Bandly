import { Bot, BookOpenCheck, GraduationCap, BookOpen, Clapperboard, ClipboardList, CreditCard, LineChart as ChartIcon, ListChecks, PenLine, Gamepad2, House, Puzzle, Swords, Target, Timer, Trophy, User, type LucideIcon } from 'lucide-react';

import type { Key } from '../i18n';

export interface NavItem { href: string; label: Key; icon: LucideIcon }

export const NAV: NavItem[] = [
  { href: '#/learn', label: 'nav.learn', icon: BookOpenCheck },
  { href: '#/coach', label: 'nav.coach', icon: Bot },
  { href: '#/exam', label: 'nav.exam', icon: Target },
  { href: '#/grammar', label: 'nav.grammar', icon: Puzzle },
  { href: '#/mocks', label: 'nav.mocks', icon: Timer },
  { href: '#/games', label: 'nav.games', icon: Gamepad2 },
  { href: '#/league', label: 'nav.league', icon: Trophy },
  { href: '#/duel', label: 'nav.duel', icon: Swords },
];
export const MISTAKES: NavItem = { href: '#/mistakes', label: 'nav.mistakes', icon: ClipboardList };
export const HOME: NavItem = { href: '#/', label: 'nav.home', icon: House };
export const PROFILE: NavItem = { href: '#/profile', label: 'nav.profile', icon: User };
export const TABS: NavItem[] = [HOME, NAV[0]!, NAV[1]!, NAV[2]!, PROFILE]; // Home, General English, AI Coach, Exam, Profile
export const PRACTICE: NavItem = { href: '#/practice', label: 'nav.practice', icon: PenLine };
export const HOMEWORK: NavItem = { href: '#/homework', label: 'nav.homework', icon: ListChecks };
export const RESULTS: NavItem = { href: '#/results', label: 'nav.results', icon: ChartIcon };
export const SHADOW: NavItem = { href: '#/shadow', label: 'nav.shadow', icon: Clapperboard };
export const TOOLS: NavItem = { href: '#/tools', label: 'nav.tools', icon: BookOpen };
export const IELTS_COURSE: NavItem = { href: '#/ielts', label: 'nav.ieltsCourse', icon: GraduationCap };

export const isActive = (hash: string, base: string): boolean =>
  base === '#/' ? hash === '#/' || hash === '' : hash === base || hash.startsWith(base + '/');
export const PRICING: NavItem = { href: '#/pricing', label: 'nav.pricing', icon: CreditCard };
const by = (h: string): NavItem => NAV.find((n) => n.href === h)!;

/** 7 ta asosiy bo'lim. Har bo'limning ichki sahifalari bo'lim tepasidagi yorliqlarda (SubNav) — menyu qisqa, hech bir sahifa yo'qolmaydi. */
export interface Section { id: string; item: NavItem; children: NavItem[] }
const LESSONS: NavItem = { href: '#/learn', label: 'nav.lessons', icon: BookOpenCheck };
const PRACTICE_SECTION: NavItem = { href: '#/practice', label: 'nav.practiceSection', icon: PenLine };
export const SECTIONS: Section[] = [
  { id: 'home', item: HOME, children: [] },
  { id: 'learn', item: by('#/learn'), children: [LESSONS, by('#/grammar'), by('#/games')] },
  { id: 'coach', item: by('#/coach'), children: [] },
  { id: 'exam', item: by('#/exam'), children: [by('#/exam'), IELTS_COURSE, by('#/mocks'), RESULTS, TOOLS] },
  { id: 'practice', item: PRACTICE_SECTION, children: [PRACTICE, MISTAKES, SHADOW, HOMEWORK] },
  { id: 'league', item: by('#/league'), children: [by('#/league'), by('#/duel')] },
  { id: 'profile', item: PROFILE, children: [PROFILE, PRICING] },
];

/** Joriy manzil qaysi bo'limga va qaysi ichki sahifaga tegishli (eng uzun mos keluvchi). */
export function sectionOf(hash: string): { section: Section; page: NavItem } | null {
  let best: { section: Section; page: NavItem } | null = null;
  for (const s of SECTIONS) for (const n of [s.item, ...s.children]) {
    if (isActive(hash, n.href) && (!best || n.href.length > best.page.href.length)) best = { section: s, page: n };
  }
  return best;
}
