import { Logo } from './Logo';
import { BarChart3, Megaphone, Users, Flame, LogIn, LogOut, Menu, Pencil, Phone, Star, Target, User, X } from 'lucide-react';
import { getAccount, onAccountChange } from '../lib/account';
import { SignOutDialog } from './SignOutDialog';
import { LangPicker } from './LangPicker';
import { useEffect, useState } from 'react';
import { BRAND } from '../brand';
import { levelProgress, dayKey, displayStreak } from '../lib/game';
import { useProfile } from '../lib/store';
import { useT } from '../i18n';
import { PROFILE, SECTIONS, isActive, sectionOf } from './nav';
import { L } from '../i18n';

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
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    if (!acc) { setRole(null); return; }
    void fetch('/api/me', { headers: { 'x-token': acc.token } }).then((r) => (r.ok ? r.json() : null)).then((j: { role?: string | null } | null) => setRole(j?.role ?? null)).catch(() => setRole(null));
  }, [acc]);
  const staff = role === 'admin' || role === 'methodologist';
  // Rolga qarab qo'shimcha bo'limlar: admin — analitika, hamkor — hamkor kabineti, o'qituvchi — guruhlar
  const extra = [
    ...(staff ? [{ href: '#/studio', icon: Pencil, label: L('Metodist kabineti') }] : []),
    ...(role === 'admin' ? [{ href: '#/admin', icon: BarChart3, label: L('Admin kabineti') }] : []),
    ...(role === 'admin' || role === 'creator' ? [{ href: '#/creator', icon: Megaphone, label: L('Hamkor kabineti') }] : []),
    ...(role === 'sales' ? [{ href: '#/leads', icon: Phone, label: L('Lidlar') }] : []),
    ...(role === 'admin' || role === 'teacher' ? [{ href: '#/groups', icon: Users, label: L('Guruhlarim') }] : []),
  ];
  const here = sectionOf(hash)?.section.id ?? null;
  useEffect(() => setOpen(false), [hash]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);
  return (
    <>
      <header className="app-header">
        <div className="container">
          <a className="logo" href="#/" aria-label={BRAND.name}><Logo size={36} /></a>
          <nav className="nav" aria-label={t('nav.main')}>
            {SECTIONS.map((sc) => <a key={sc.id} href={sc.item.href} className={here === sc.id ? 'active' : ''} aria-current={here === sc.id ? 'page' : undefined}><sc.item.icon size={16} />{t(sc.item.label)}</a>)}
            {extra.map((x) => <a key={x.href} href={x.href} className={isActive(hash, x.href) ? 'active' : ''}><x.icon size={16} />{x.label}</a>)}
          </nav>
          <div className="header-right">
            <LangPicker compact />
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
              <span className="logo"><Logo size={34} /></span>
              <button className="icon-btn" aria-label={t('nav.close')} onClick={() => setOpen(false)}><X size={20} /></button>
            </div>
            <div className="dstats"><Stats /></div>
            <LangPicker />
            {SECTIONS.map((sc) => <a key={sc.id} href={sc.item.href} className={`dlink ${here === sc.id ? 'active' : ''}`}><sc.item.icon size={20} />{t(sc.item.label)}</a>)}
            {extra.map((x) => <a key={x.href} className={`dlink ${isActive(hash, x.href) ? 'active' : ''}`} href={x.href}><x.icon size={20} />{x.label}</a>)}
            <div className="dacct">
              <span>{acc ? <>{L('Hisob:')} <b>{acc.nickname}</b></> : L('Hisobga kirmagansiz')}</span>
              {acc
                ? <button className="btn sm" onClick={() => { setOpen(false); setBye(true); }}><LogOut size={14} />  {L('Chiqish')}</button>
                : <a className="btn sm primary" href="#/profile"><LogIn size={14} />  {L('Kirish')}</a>}
            </div>
          </aside>
        </>
      )}
      {bye && <SignOutDialog onClose={() => setBye(false)} />}
    </>
  );
}
