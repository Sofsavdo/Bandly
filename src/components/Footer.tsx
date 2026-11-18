import { BRAND } from '../brand';
import { useT } from '../i18n';
import { Mascot } from './Mascot';
import { L } from '../i18n';

/** Ixcham pastki qism: barcha sahifalar menyuda guruhlangan, bu yerda faqat asosiy havolalar. */
export function Footer() {
  const t = useT();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-row">
          <a className="logo" href="#/"><Mascot mood="happy" size={30} />{BRAND.name}</a>
          <nav className="footer-links" aria-label={L('Pastki havolalar')}>
            <a href="#/learn">{t('nav.learn')}</a><a href="#/exam">{t('nav.exam')}</a><a href="#/mocks">{t('nav.mocks')}</a><a href="#/pricing">{t('nav.pricing')}</a><a href="/vositalar/">{L('Bepul vositalar')}</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
