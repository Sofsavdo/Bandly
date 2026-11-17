import { ChevronDown, Flame, LogIn, LogOut, Menu, Pencil, Star, Target, User, X } from 'lucide-react';
import { getAccount, onAccountChange } from '../lib/account';
import { SignOutDialog } from './SignOutDialog';
import { useEffect, useState } from 'react';
import { BRAND } from '../brand';
import { levelProgress, dayKey, displayStreak } from '../lib/game';
import { useProfile } from '../lib/store';
import { useT } from '../i18n';
import { Mascot } from './Mascot';
import { NAV_GROUPS, PROFILE, isActive } from './nav';

function Stats() {
  const t = useT();
  const p = useProfile();
  const lp = levelProgress(p.xp);
  const goal = Math.min(1, p.dailyXp / Math.max(1, p.dailyGoal));
  return (
    <div className="stats" aria-label={t('stat.title')}>
      <span className="stat" title={t('stat.streak')}><Flame color="#ff7a1a" fill="#ff7a1a" />{displayStreak(p, dayKey())}</span>
      <span className="stat" title={`${lp.into}/${lp.span} XP`}><Star color="#f5b400" fill="#f5b400" />{lp.level}<span className="mini"><i style={{ width: `${lp.pct * 100}%` }} /></span></span>
      <span className="stat" title={t('stat.daily')}><Target color="#12b76a" />{Math.min(p.dailyXp, p.dailyGoal)}/{p.dailyGoal}<span className="mini"><i style={{ width: `${goal * 100}%`, background: goal >= 1 ? 'var(--ok)' : undefined }} /></span></span>
    </div>
  );
}

export function Header({ hash }: { hash: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [bye, setBye] = useState(false);
  const [acc, setAcc] = useState(getAccount());
  useEffect(() => onAccountChange(() => setAcc(getAccount())), []);
  // Xodimlar (metodist/admin) uchun kabinet havolasi — rol serverdan
  const [staff, setStaff] = useState(false);
  useEffect(() => {
    if (!acc) { setStaff(false); return; }
    void fetch('/api/me', { headers: { 'x-token': acc.token } }).then((r) => (r.ok ? r.json() : null)).then((j: { role?: string | null } | null) => setStaff(!!j?.role)).catch(() => setStaff(false));
  }, [acc]);
  useEffect(() => setOpen(false), [hash]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  return (
    <>
      <header className="app-header">
        <div className="container">
          <a className="logo" href="#/" aria-label={BRAND.name}><Mascot mood="happy" size={36} />{BRAND.name}</a>
          <nav className="nav" aria-label={t('nav.main')}>
            {NAV_GROUPS.map((g) => (
              <div key={g.id} className="nav-group">
                {g.id !== 'main' && <span className="nav-label">{t(g.label)}</span>}
                {g.items.map((n) => <a key={n.href} href={n.href} className={isActive(hash, n.href) ? 'active' : ''} aria-current={isActive(hash, n.href) ? 'page' : undefined}><n.icon size={16} />{t(n.label)}</a>)}
              </div>
            ))}
            {staff && <a href="#/studio" className={isActive(hash, '#/studio') ? 'active' : ''}><Pencil size={16} />Metodist kabineti</a>}
          </nav>
          <div className="header-right">
            <Stats />
            <a className="btn primary sm header-cta" href="#/pricing">{t('cta.plans')}</a>
            <a className="icon-btn desk-only" href={PROFILE.href} aria-label={t('nav.profile')}><User size={18} /></a>
            <button className="icon-btn menu-btn" aria-label={t('nav.menu')} onClick={() => setOpen(true)}><Menu size={20} /></button>
          </div>
        </div>
      </header>
      {open && (
        <>
          <div className="drawer-back" onClick={() => setOpen(false)} />
          <aside className="drawer" aria-label={t('nav.menu')}>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="logo"><Mascot mood="happy" size={34} />{BRAND.name}</span>
              <button className="icon-btn" aria-label={t('nav.close')} onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <div className="dstats"><Stats /></div>
            {NAV_GROUPS.map((g) => {
              const here = g.items.some((n) => isActive(hash, n.href));
              return (
                <details key={g.id} className="dgroup" open={g.id === 'main' || here}>
                  <summary>{t(g.label)}<ChevronDown size={18} /></summary>
                  {g.items.map((n) => <a key={n.href} href={n.href} className={`dlink ${isActive(hash, n.href) ? 'active' : ''}`}><n.icon size={20} />{t(n.label)}</a>)}
                </details>
              );
            })}
            {staff && <a className={`dlink ${isActive(hash, '#/studio') ? 'active' : ''}`} href="#/studio"><Pencil size={20} />Metodist kabineti</a>}
            <div className="dacct">
              <span>{acc ? <>Hisob: <b>{acc.nickname}</b></> : 'Hisobga kirmagansiz'}</span>
              {acc
                ? <button className="btn sm" onClick={() => { setOpen(false); setBye(true); }}><LogOut size={14} /> Chiqish</button>
                : <a className="btn sm primary" href="#/profile"><LogIn size={14} /> Kirish</a>}
            </div>
          </aside>
        </>
      )}
      {bye && <SignOutDialog onClose={() => setBye(false)} />}
    </>
  );
}
