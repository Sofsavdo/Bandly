import { ArrowRight, BarChart3, Lock, LogOut, Megaphone, Trophy } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { useEffect, useState } from 'react';
import { eraseAccount, getAccount, onAccountChange } from '../lib/account';
import { JoinForm } from '../components/JoinForm';
import { SignOutDialog } from '../components/SignOutDialog';
import { fmtDate, refreshEntitlements } from '../lib/pay';
import { SALE_PLANS, TRACK_NAME } from '../config';
import { setSound, sfx, soundOn } from '../lib/fx';
import { LEVEL_INFO } from '../lib/levels';
import { ACHIEVEMENTS, levelProgress, dayKey, displayStreak, repairOpen } from '../lib/game';
import { loadResults } from '../lib/storage';
import { setDailyGoal, useProfile } from '../lib/store';
import { PersonaPicker } from '../components/PersonaPicker';
import { vocab } from '../content/vocab';
import { isMastered } from '../lib/srs';
import { ProgressCard } from '../components/ProgressCard';
import { PRing } from '../components/PRing';
import { WeekBars } from '../components/WeekBars';
import { LangPicker } from '../components/LangPicker';
import { InviteCard } from '../components/InviteCard';
import { JoinGroupCard } from '../components/JoinGroupCard';
import { ResultList } from '../components/ResultList';
import { CertProfileCard } from '../components/CertProfileCard';
import { L } from '../i18n';
import { LeadCard } from '../components/LeadCard';

export default function Profile() {
  const p = useProfile();
  const [snd, setSnd] = useState(soundOn());
  const [acc, setAcc] = useState(getAccount());
  const [bye, setBye] = useState(false);
  const [erasing, setErasing] = useState(false);
  const [eraseErr, setEraseErr] = useState('');
  useEffect(() => onAccountChange(() => setAcc(getAccount())), []);
  // Rol (hamkor/admin) — profil boshida o'z kabinetiga havola
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => { if (!acc) { setRole(null); return; } void fetch('/api/me', { headers: { 'x-token': acc.token } }).then((r) => (r.ok ? r.json() : null)).then((j: { role?: string | null } | null) => setRole(j?.role ?? null)).catch(() => setRole(null)); }, [acc]);
  const earned = ACHIEVEMENTS.filter((a) => p.achievements.includes(a.id));
  const lp = levelProgress(p.xp);
  const results = loadResults();
  const mastered = vocab.filter((w) => isMastered(p.srs[w.id])).length;
  return (
    <div>
      <section className="card prof-head">
        <UserAvatar acc={acc} />
        <h2>{acc?.nickname}</h2>
        <p className="muted">{p.level ? `${p.level} · ${LEVEL_INFO[p.level].name}` : L('Daraja aniqlanmagan')} · {lp.level}{L('-bosqich · jami')} {p.xp}  {L('XP')}</p>
        <div className="bar" style={{ width: '100%', maxWidth: 420 }}><i style={{ width: `${lp.pct * 100}%` }} /></div>
        <small className="muted">{lp.into} / {lp.span}  {L('XP keyingi bosqichgacha')}</small>
        {/* Egasi (2026-11-26): "akkauntdan chiqishni topa olmadim" — chiqish va kabinetlar profil boshida */}
        <div className="prof-actions">
          {(role === 'creator' || role === 'admin') && <a className="btn sm" href="#/creator"><Megaphone size={14} />  {L('Hamkor kabineti')}</a>}
          {role === 'admin' && <a className="btn sm" href="#/admin"><BarChart3 size={14} />  {L('Admin kabineti')}</a>}
          {acc && <button className="btn sm" onClick={() => setBye(true)}><LogOut size={14} />  {L('Hisobdan chiqish')}</button>}
        </div>
      </section>
      <div className="ptiles">
        <div className="ptile"><PRing value={displayStreak(p, dayKey())} max={Math.max(7, displayStreak(p, dayKey()))} color="var(--orange)" label={L('Seriya')}><b>{displayStreak(p, dayKey())}</b></PRing><div><b>{L('Seriya')}</b><small>{L('eng uzun')} {p.longestStreak}{p.freezes > 0 ? ` · ❄ ${p.freezes}` : ''}</small></div></div>
        <div className="ptile"><PRing value={mastered} max={vocab.length} color="var(--teal)" label={L('So‘zlar')}><b>{mastered}</b></PRing><div><b>{L('So‘zlar')}</b><small>/ {vocab.length}  {L('yodlangan')}</small></div></div>
        <div className="ptile"><PRing value={earned.length} max={ACHIEVEMENTS.length} color="var(--yellow)" label={L('Yutuqlar')}><b>{earned.length}</b></PRing><div><b>{L('Yutuqlar')}</b><small>/ {ACHIEVEMENTS.length}</small></div></div>
        <div className="ptile"><PRing value={p.gamesPlayed} max={Math.max(10, p.gamesPlayed)} color="var(--brand)" label={L('O‘yinlar')}><b>{p.gamesPlayed}</b></PRing><div><b>{L('O‘yinlar')}</b><small>{L('o‘ynalgan')}</small></div></div>
      </div>
      <div className="card">
        <h3>{L('Hisob va obuna')}</h3>
        <p style={{ margin: 0 }}><b>{acc?.nickname}</b></p>
        {bye && <SignOutDialog onClose={() => setBye(false)} />}
        {acc && (
          <details className="fold" style={{ marginTop: 10 }}>
            <summary>{L('Hisobni o‘chirish')}</summary>
            <p className="evidence">{L('Hisobingiz va barcha shaxsiy ma’lumotlaringiz (progress, natijalar, xatolar, telefon) o‘chiriladi. Bu amalni qaytarib bo‘lmaydi. To‘lov yozuvlari hisob-kitob uchun anonim holda qoladi.')}</p>
            <button className="btn sm danger" disabled={erasing} onClick={() => {
              if (!window.confirm(L('Hisob butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi. Davom etasizmi?'))) return;
              setErasing(true); setEraseErr('');
              eraseAccount().catch((e: unknown) => { setErasing(false); setEraseErr(e instanceof Error ? e.message : L('Hisobni o‘chirib bo‘lmadi. Qayta urinib ko‘ring.')); });
            }}>{L('Hisobni butunlay o‘chirish')}</button>
            {eraseErr && <p className="err" role="alert">{eraseErr}</p>}
          </details>
        )}
        {acc && !acc.tg && <div style={{ marginTop: 10 }}><JoinForm onJoined={(a) => setAcc(a)} title={L('Kirish usulini ulang')} text={L('Hisobingizni bog‘lang (Telegram, Google yoki telefon raqam) — shunda qayta kira olasiz.')} /></div>}
        <h4 style={{ margin: '14px 0 4px' }}>{L('Obunalar')}</h4>
        {(() => {
          const now = Date.now(); const u = p.planUntil;
          const on = (t: 'exam' | 'grammar' | 'voice') => !!u[t] && u[t]! > now;
          const id = on('voice') && on('exam') && on('grammar') ? 'premium' : on('exam') && on('grammar') ? 'all' : on('exam') ? 'exam' : on('grammar') ? 'general' : null;
          const pl = SALE_PLANS.find((x) => x.id === id);
          if (pl) { const until = Math.min(...pl.tracks.filter((t) => t !== 'mocks').map((t) => u[t]!)); return <p style={{ margin: '4px 0' }}>{L('Tarif:')} <b className="ok">{pl.title}</b>, {fmtDate(until)}  {L('gacha')}</p>; }
          const demo = (['exam', 'grammar'] as const).filter((t) => p.plan[t]);
          return <p style={{ margin: '4px 0' }}>{demo.length ? <>{L('Demo:')} {demo.map((t) => TRACK_NAME[t]).join(', ')}  {L('(faqat shu qurilmada)')}</> : <span className="evidence">{L('Bepul tarif.')}</span>} <a href="#/pricing">{L('Tariflar')}</a></p>;
        })()}
      </div>

      {p.brokenStreak && repairOpen(p, dayKey()) && <p className="notice">{p.brokenStreak?.value}  {L('kunlik seriya uzildi. 48 soat ichida kunlik maqsadni 2 barobar bajarsangiz, tiklanadi (30 kunda bir marta).')}</p>}
      <InviteCard />
      {role !== 'creator' && role !== 'admin' && <a className="card partner-promo" href="#/partners"><span className="blob"><Megaphone /></span><div><h3 style={{ margin: 0 }}>{L('Bloger yoki o‘qituvchimisiz?')}</h3><p className="muted" style={{ margin: '4px 0 0' }}>{L('Sellzen haqida video qiling — har bir video uchun to‘lov, ko‘rishlar va kelgan o‘quvchilar uchun bonus oling.')}</p></div><ArrowRight size={18} /></a>}
      <JoinGroupCard />
      <section className="card"><h3 style={{ margin: 0 }}>{L('Bu hafta')}</h3><WeekBars activity={p.activity} /></section>
      <LeadCard level={p.level ?? undefined} />

      <ProgressCard />

      <div className="card">
        <details className="fold">
          <summary><h3 style={{ display: 'inline', margin: 0 }}>{L('Yutuqlar ·')} {earned.length}/{ACHIEVEMENTS.length}</h3></summary>
          {[...earned, ...ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id))].map((a) => {
            const on = p.achievements.includes(a.id);
            return <div key={a.id} className={`ach ${on ? '' : 'off'}`}><span className="ach-ico">{on ? <Trophy size={20} /> : <Lock size={18} />}</span><div><b>{a.title}</b><div className="evidence">{a.desc}</div></div></div>;
          })}
        </details>
        {earned.length > 0 && <p className="row" style={{ marginTop: 8 }}>{earned.slice(-4).map((a) => <span key={a.id} className="pill"><Trophy size={13} /> {a.title}</span>)}</p>}
      </div>

      <div className="card">
        <h3>{L('Sozlamalar')}</h3>
        <div style={{ marginBottom: 12 }}><LangPicker /></div>
        <div className="row" style={{ marginBottom: 10 }}>
          <a className="btn sm" href="#/placement">{p.level ? L('Darajani qayta aniqlash ({0})', [p.level]) : L('Darajani aniqlash')}</a>
          <label><input type="checkbox" checked={snd} onChange={(e) => { setSnd(e.target.checked); setSound(e.target.checked); if (e.target.checked) sfx('ok'); }} />  {L('Ovozli effektlar')}</label>
        </div>
        <div className="row">
          <label>{L('Kunlik maqsad:')}{' '}
            <select value={p.dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))}>
              {[30, 50, 100, 150].map((g) => <option key={g} value={g}>{g}  {L('XP')}</option>)}
            </select>
          </label>
        </div>
        <details className="fold" style={{ margin: '10px 0' }}><summary>{L('Sellzen ustoz: ovoz, xarakter, bolalar rejimi')}</summary><PersonaPicker /></details>
      </div>

      <details className="card fold cert-fold"><summary><h3 style={{ display: 'inline', margin: 0 }}>{L('Sertifikat uchun ma’lumot')}</h3></summary><CertProfileCard /></details>
      <div className="card">
        <h3>{L('Natijalar tarixi')}</h3>
        <ResultList results={results} limit={10} moreHref="#/results" />
      </div>
    </div>
  );
}
