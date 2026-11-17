import { Lock, LogOut, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authConfig, getAccount, onAccountChange, restoreAccount } from '../lib/account';
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

export default function Profile() {
  const p = useProfile();
  const [snd, setSnd] = useState(soundOn());
  const [code, setCode] = useState('');
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
        <span className="avatar" aria-hidden="true">{(acc?.nickname ?? 'B').slice(0, 1).toUpperCase()}</span>
        <h2>{acc?.nickname ?? 'Mehmon'}</h2>
        <p className="muted">{p.level ? `${p.level} · ${LEVEL_INFO[p.level].name}` : 'Daraja aniqlanmagan'} · {lp.level}-bosqich · jami {p.xp} XP</p>
        <div className="bar" style={{ width: '100%', maxWidth: 420 }}><i style={{ width: `${lp.pct * 100}%` }} /></div>
        <small className="muted">{lp.into} / {lp.span} XP keyingi bosqichgacha</small>
      </section>
      <div className="ptiles">
        <div className="ptile"><PRing value={displayStreak(p, dayKey())} max={Math.max(7, displayStreak(p, dayKey()))} color="var(--orange)" label="Seriya"><b>{displayStreak(p, dayKey())}</b></PRing><div><b>Seriya</b><small>eng uzun {p.longestStreak}{p.freezes > 0 ? ` · ❄ ${p.freezes}` : ''}</small></div></div>
        <div className="ptile"><PRing value={mastered} max={vocab.length} color="var(--teal)" label="So‘zlar"><b>{mastered}</b></PRing><div><b>So‘zlar</b><small>/ {vocab.length} yodlangan</small></div></div>
        <div className="ptile"><PRing value={earned.length} max={ACHIEVEMENTS.length} color="var(--yellow)" label="Yutuqlar"><b>{earned.length}</b></PRing><div><b>Yutuqlar</b><small>/ {ACHIEVEMENTS.length}</small></div></div>
        <div className="ptile"><PRing value={p.gamesPlayed} max={Math.max(10, p.gamesPlayed)} color="var(--brand)" label="O‘yinlar"><b>{p.gamesPlayed}</b></PRing><div><b>O‘yinlar</b><small>o‘ynalgan</small></div></div>
      </div>
      {p.brokenStreak && repairOpen(p, dayKey()) && <p className="notice">{p.brokenStreak?.value} kunlik seriya uzildi. 48 soat ichida kunlik maqsadni 2 barobar bajarsangiz, tiklanadi (30 kunda bir marta).</p>}
      <section className="card"><h3 style={{ margin: 0 }}>Bu hafta</h3><WeekBars activity={p.activity} /></section>

      <ProgressCard />

      <div className="card">
        <h3>Hisob</h3>
        {acc ? (
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <p style={{ margin: 0 }}>Siz <b>{acc.nickname}</b> sifatida kirgansiz.</p>
            <button className="btn sm" onClick={() => setBye(true)}><LogOut size={14} /> Chiqish</button>
          </div>
        ) : <>
          <JoinForm onJoined={(a) => setAcc(a)} text="Kirsangiz hozirgi XP, darslar va natijalaringiz hisobingizga yoziladi va boshqa qurilmada ham ochiladi." />
          <button className="btn sm danger" style={{ marginTop: 10 }} onClick={() => setBye(true)}><LogOut size={14} /> Qurilmani tozalash va boshidan boshlash</button>
        </>}
        {bye && <SignOutDialog onClose={() => setBye(false)} />}
        {acc && tgOn && !acc.tg && <div style={{ marginTop: 10 }}><JoinForm onJoined={(a) => setAcc(a)} text="Hisobingizni Telegram'ga bog‘lang: XP va obuna saqlanadi, keyin istalgan qurilmada Telegram orqali kirasiz." /></div>}
        <h4 style={{ margin: '14px 0 4px' }}>Obunalar</h4>
        {(() => {
          const now = Date.now(); const u = p.planUntil;
          const on = (t: 'exam' | 'grammar') => !!u[t] && u[t]! > now;
          const id = on('exam') && on('grammar') ? 'all' : on('exam') ? 'exam' : on('grammar') ? 'general' : null;
          const pl = SALE_PLANS.find((x) => x.id === id);
          if (pl) { const until = Math.min(...pl.tracks.filter((t) => t !== 'mocks').map((t) => u[t]!)); return <p style={{ margin: '4px 0' }}>Tarif: <b className="ok">{pl.title}</b>, {fmtDate(until)} gacha</p>; }
          const demo = (['exam', 'grammar'] as const).filter((t) => p.plan[t]);
          return <p style={{ margin: '4px 0' }}>{demo.length ? <>Demo: {demo.map((t) => TRACK_NAME[t]).join(', ')} (faqat shu qurilmada)</> : <span className="evidence">Bepul tarif.</span>} <a href="#/pricing">Tariflar</a></p>;
        })()}
        <details className="fold" style={{ marginTop: 10 }}>
          <summary>Eski hisob kodi</summary>
          {acc && !acc.tg && <div className="row"><button className="btn sm" onClick={async () => { await navigator.clipboard.writeText(acc.token).catch(() => {}); setMsg('Hisob kodi nusxalandi. Xavfsiz joyda saqlang, hech kimga bermang.'); }}>Hisob kodini nusxalash</button></div>}
          <div className="row" style={{ marginTop: 8 }}>
            <input type="text" value={code} placeholder="Boshqa qurilmadagi hisob kodi" onChange={(e) => setCode(e.target.value)} style={{ minWidth: 220 }} />
            <button className="btn sm" disabled={code.trim().length < 20} onClick={async () => { try { const a = await restoreAccount(code); await refreshEntitlements(); setMsg(`Kirdingiz: ${a.nickname}`); setCode(''); } catch (e) { setMsg((e as Error).message); } }}>Kod bilan kirish</button>
          </div>
          <p className="evidence">Telegram'dan oldin ochilgan hisoblar uchun. Kod bilan kirgach, hisobni Telegram'ga bog‘lab qo‘ying.</p>
        </details>
        {msg && <p className="evidence">{msg}</p>}
      </div>

      <div className="card">
        <details className="fold">
          <summary><h3 style={{ display: 'inline', margin: 0 }}>Yutuqlar · {earned.length}/{ACHIEVEMENTS.length}</h3></summary>
          {[...earned, ...ACHIEVEMENTS.filter((a) => !p.achievements.includes(a.id))].map((a) => {
            const on = p.achievements.includes(a.id);
            return <div key={a.id} className={`ach ${on ? '' : 'off'}`}><span className="ach-ico">{on ? <Trophy size={20} /> : <Lock size={18} />}</span><div><b>{a.title}</b><div className="evidence">{a.desc}</div></div></div>;
          })}
        </details>
        {earned.length > 0 && <p className="row" style={{ marginTop: 8 }}>{earned.slice(-4).map((a) => <span key={a.id} className="pill"><Trophy size={13} /> {a.title}</span>)}</p>}
      </div>

      <div className="card">
        <h3>Sozlamalar</h3>
        <div style={{ marginBottom: 12 }}><LangPicker /></div>
        <div className="row" style={{ marginBottom: 10 }}>
          <a className="btn sm" href="#/placement">{p.level ? `Darajani qayta aniqlash (${p.level})` : 'Darajani aniqlash'}</a>
          <label><input type="checkbox" checked={snd} onChange={(e) => { setSnd(e.target.checked); setSound(e.target.checked); if (e.target.checked) sfx('ok'); }} /> Ovozli effektlar</label>
        </div>
        <div className="row">
          <label>Kunlik maqsad:{' '}
            <select value={p.dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))}>
              {[30, 50, 100, 150].map((g) => <option key={g} value={g}>{g} XP</option>)}
            </select>
          </label>
        </div>
        <details className="fold" style={{ margin: '10px 0' }}><summary>AI ustoz xarakteri</summary><PersonaPicker /></details>
      </div>

      <div className="card">
        <h3>Natijalar tarixi</h3>
        {results.length === 0 ? <p>Hozircha natija yo‘q.</p> : (
          <table className="data">
            <thead><tr><th>Sana</th><th>Test</th><th>Natija</th><th>Band (taxm.)</th></tr></thead>
            <tbody>{results.map((r) => <tr key={r.id}><td>{new Date(r.date).toLocaleDateString('uz-UZ')}</td><td>{r.title}</td><td>{r.correct} / {r.total}</td><td>{r.band !== undefined ? r.band.toFixed(1) : '—'}</td></tr>)}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
