import { Lock, LogOut, Trophy } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { useEffect, useState } from 'react';
import { authConfig, getAccount, onAccountChange } from '../lib/account';
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
  const [msg, setMsg] = useState('');
  const [acc, setAcc] = useState(getAccount());
  const [tgOn, setTgOn] = useState(false);
  const [bye, setBye] = useState(false);
  useEffect(() => { void authConfig().then((c) => setTgOn(!!c.telegram)); return onAccountChange(() => setAcc(getAccount())); }, []);
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
      </section>
      <div className="ptiles">
        <div className="ptile"><PRing value={displayStreak(p, dayKey())} max={Math.max(7, displayStreak(p, dayKey()))} color="var(--orange)" label={L('Seriya')}><b>{displayStreak(p, dayKey())}</b></PRing><div><b>{L('Seriya')}</b><small>{L('eng uzun')} {p.longestStreak}{p.freezes > 0 ? ` · ❄ ${p.freezes}` : ''}</small></div></div>
        <div className="ptile"><PRing value={mastered} max={vocab.length} color="var(--teal)" label={L('So‘zlar')}><b>{mastered}</b></PRing><div><b>{L('So‘zlar')}</b><small>/ {vocab.length}  {L('yodlangan')}</small></div></div>
        <div className="ptile"><PRing value={earned.length} max={ACHIEVEMENTS.length} color="var(--yellow)" label={L('Yutuqlar')}><b>{earned.length}</b></PRing><div><b>{L('Yutuqlar')}</b><small>/ {ACHIEVEMENTS.length}</small></div></div>
        <div className="ptile"><PRing value={p.gamesPlayed} max={Math.max(10, p.gamesPlayed)} color="var(--brand)" label={L('O‘yinlar')}><b>{p.gamesPlayed}</b></PRing><div><b>{L('O‘yinlar')}</b><small>{L('o‘ynalgan')}</small></div></div>
      </div>
      {p.brokenStreak && repairOpen(p, dayKey()) && <p className="notice">{p.brokenStreak?.value}  {L('kunlik seriya uzildi. 48 soat ichida kunlik maqsadni 2 barobar bajarsangiz, tiklanadi (30 kunda bir marta).')}</p>}
      <InviteCard />
      <JoinGroupCard />
      <section className="card"><h3 style={{ margin: 0 }}>{L('Bu hafta')}</h3><WeekBars activity={p.activity} /></section>
      <LeadCard level={p.level ?? undefined} />

      <ProgressCard />

      <div className="card">
        <h3>{L('Hisob')}</h3>
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <p style={{ margin: 0 }}><b>{acc?.nickname}</b></p>
          <button className="btn sm" onClick={() => setBye(true)}><LogOut size={14} />  {L('Chiqish')}</button>
        </div>
        {bye && <SignOutDialog onClose={() => setBye(false)} />}
        {acc && tgOn && !acc.tg && <div style={{ marginTop: 10 }}><JoinForm onJoined={(a) => setAcc(a)} text={L('Hisobni Telegram\'ga bog‘lang.')} /></div>}
        <h4 style={{ margin: '14px 0 4px' }}>{L('Obunalar')}</h4>
        {(() => {
          const now = Date.now(); const u = p.planUntil;
          const on = (t: 'exam' | 'grammar') => !!u[t] && u[t]! > now;
          const id = on('exam') && on('grammar') ? 'all' : on('exam') ? 'exam' : on('grammar') ? 'general' : null;
          const pl = SALE_PLANS.find((x) => x.id === id);
          if (pl) { const until = Math.min(...pl.tracks.filter((t) => t !== 'mocks').map((t) => u[t]!)); return <p style={{ margin: '4px 0' }}>{L('Tarif:')} <b className="ok">{pl.title}</b>, {fmtDate(until)}  {L('gacha')}</p>; }
          const demo = (['exam', 'grammar'] as const).filter((t) => p.plan[t]);
          return <p style={{ margin: '4px 0' }}>{demo.length ? <>{L('Demo:')} {demo.map((t) => TRACK_NAME[t]).join(', ')}  {L('(faqat shu qurilmada)')}</> : <span className="evidence">{L('Bepul tarif.')}</span>} <a href="#/pricing">{L('Tariflar')}</a></p>;
        })()}
        {acc && !acc.tg && <button className="btn sm" style={{ marginTop: 8 }} onClick={async () => { await navigator.clipboard.writeText(acc.token).catch(() => {}); setMsg(L('Hisob kodi nusxalandi. Hech kimga bermang.')); }}>{L('Hisob kodini nusxalash')}</button>}
        {msg && <p className="evidence">{msg}</p>}
      </div>

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
        <details className="fold" style={{ margin: '10px 0' }}><summary>{L('AI ustoz xarakteri')}</summary><PersonaPicker /></details>
      </div>

      <details className="card fold cert-fold"><summary><h3 style={{ display: 'inline', margin: 0 }}>{L('Sertifikat uchun ma’lumot')}</h3></summary><CertProfileCard /></details>
      <div className="card">
        <h3>{L('Natijalar tarixi')}</h3>
        <ResultList results={results} limit={10} moreHref="#/results" />
      </div>
    </div>
  );
}
