// Bo'lim ichidagi sahifalar (masalan, Imtihon: Imtihon · Mock Arena · Natijalar · Band kalkulyatori). Bo'limning barcha sahifalarida
// (dars/test o'ynash ekranlaridan tashqari) sarlavha ostida yopishib turadi: pastga aylantirilsa ham ko'rinadi; telefonda to'liq kenglikda,
// yonga aylantirmasdan — har bir sahifa teng ustun.
import { useT } from '../i18n';
import type { NavItem } from './nav';

export function SubNav({ items, hash, active = hash }: { items: NavItem[]; hash: string; active?: string }) {
  const t = useT();
  return (
    <nav className="subnav seg" aria-label={t('nav.sub')} style={{ ['--n' as string]: items.length }}>
      {items.map((n) => <a key={n.href} href={n.href} className={active === n.href ? 'on' : ''} aria-current={hash === n.href ? 'page' : undefined} title={t(n.label)}><span>{t(n.short ?? n.label)}</span></a>)}
    </nav>
  );
}
