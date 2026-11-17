// Bo'lim ichidagi sahifalar (masalan, Imtihon: Imtihon · Mock Arena · Natijalar · Band kalkulyatori). Faqat ro'yxat sahifalarida ko'rinadi.
import { useT } from '../i18n';
import type { NavItem } from './nav';

export function SubNav({ items, hash }: { items: NavItem[]; hash: string }) {
  const t = useT();
  return (
    <nav className="subnav seg" aria-label={t('nav.sub')}>
      {items.map((n) => <a key={n.href} href={n.href} className={hash === n.href ? 'on' : ''} aria-current={hash === n.href ? 'page' : undefined}><n.icon size={15} />{t(n.label)}</a>)}
    </nav>
  );
}
