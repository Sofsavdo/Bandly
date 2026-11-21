// Bosh sahifadagi tezkor kirish: eng kuchli imkoniyatlar (ovozli ustoz, mock testlar, o'yinlar, duel, IELTS kursi, xatolar)
// ichki menyularda yashirinib qolmasin — bir bosishda ochiladi.
import { Bot, ClipboardList, Gamepad2, GraduationCap, Swords, Timer, type LucideIcon } from 'lucide-react';
import { useT, type Key } from '../i18n';

const LINKS: { href: string; label: Key; icon: LucideIcon; tone: string }[] = [
  { href: '#/coach', label: 'nav.coach', icon: Bot, tone: 'pink' },
  { href: '#/mocks', label: 'nav.mocks', icon: Timer, tone: 'lilac' },
  { href: '#/games', label: 'nav.games', icon: Gamepad2, tone: 'mint' },
  { href: '#/duel', label: 'nav.duel', icon: Swords, tone: 'coral' },
  { href: '#/ielts', label: 'nav.ieltsCourse', icon: GraduationCap, tone: 'butter' },
  { href: '#/mistakes', label: 'nav.mistakes', icon: ClipboardList, tone: 'sky' },
];

export function QuickLinks() {
  const t = useT();
  return (
    <nav className="quick" aria-label={t('nav.quick')}>
      {LINKS.map((l) => <a key={l.href} href={l.href} className={`q-${l.tone}`}><span><l.icon size={22} /></span>{t(l.label)}</a>)}
    </nav>
  );
}
