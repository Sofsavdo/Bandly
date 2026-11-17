import { Bot, BookOpenCheck, BookOpen, Clapperboard, ClipboardList, CreditCard, LineChart as ChartIcon, ListChecks, PenLine, Gamepad2, House, Puzzle, Swords, Target, Timer, Trophy, User, type LucideIcon } from 'lucide-react';

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
/** Yon panel (kompyuter): asosiy bo'limlar; qolganlari "Barcha bo'limlar" menyusida. */
export const SIDE_NAV_IDS = ['#/', '#/learn', '#/coach', '#/exam', '#/mocks', '#/grammar', '#/games', '#/league', '#/profile'];
export const MISTAKES: NavItem = { href: '#/mistakes', label: 'nav.mistakes', icon: ClipboardList };
export const HOME: NavItem = { href: '#/', label: 'nav.home', icon: House };
export const PROFILE: NavItem = { href: '#/profile', label: 'nav.profile', icon: User };
export const TABS: NavItem[] = [HOME, NAV[0]!, NAV[1]!, NAV[2]!, PROFILE]; // Home, General English, AI Coach, Exam, Profile
export const PRACTICE: NavItem = { href: '#/practice', label: 'nav.practice', icon: PenLine };
export const HOMEWORK: NavItem = { href: '#/homework', label: 'nav.homework', icon: ListChecks };
export const RESULTS: NavItem = { href: '#/results', label: 'nav.results', icon: ChartIcon };
export const SHADOW: NavItem = { href: '#/shadow', label: 'nav.shadow', icon: Clapperboard };
export const TOOLS: NavItem = { href: '#/tools', label: 'nav.tools', icon: BookOpen };

export const isActive = (hash: string, base: string): boolean =>
  base === '#/' ? hash === '#/' || hash === '' : hash === base || hash.startsWith(base + '/');
export const PRICING: NavItem = { href: '#/pricing', label: 'nav.pricing', icon: CreditCard };
const by = (h: string): NavItem => NAV.find((n) => n.href === h)!;

/** Menyu guruhlari: har bir sahifa bitta joyda; guruhlar yig'iladi (joriy sahifa guruhi ochiq turadi). */
export interface NavGroup { id: string; label: Key; items: NavItem[] }
export const NAV_GROUPS: NavGroup[] = [
  { id: 'main', label: 'nav.group.main', items: [HOME, by('#/learn'), by('#/coach')] },
  { id: 'exam', label: 'nav.group.exam', items: [by('#/exam'), by('#/mocks'), RESULTS, TOOLS] },
  { id: 'practice', label: 'nav.group.practice', items: [by('#/grammar'), PRACTICE, SHADOW, MISTAKES, HOMEWORK, by('#/games')] },
  { id: 'compete', label: 'nav.group.compete', items: [by('#/league'), by('#/duel')] },
  { id: 'account', label: 'nav.group.account', items: [PROFILE, PRICING] },
];

export const SIDE_NAV: NavItem[] = SIDE_NAV_IDS.map((h) => (h === '#/' ? HOME : h === '#/profile' ? PROFILE : by(h)));
