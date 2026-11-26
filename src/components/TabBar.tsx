import { useT } from '../i18n';
import { TABS, tabActive } from './nav';

export function TabBar({ hash }: { hash: string }) {
  const t = useT();
  return (
    <nav className="tabbar" aria-label={t('nav.quick')}>
      {TABS.map((x) => <a key={x.href} href={x.href} className={tabActive(hash, x.href) ? 'active' : ''} aria-label={x.label === 'nav.home' ? t('nav.home.short') : t(x.label)} aria-current={tabActive(hash, x.href) ? 'page' : undefined}><x.icon size={21} /><span>{x.label === 'nav.home' ? t('nav.home.short') : t(x.label)}</span></a>)}
    </nav>
  );
}
