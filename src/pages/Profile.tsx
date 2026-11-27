// Profil (egasi, 2026-11-27: "profil bo'limi juda chalkash") — qayta tuzildi, hech bir funksiya olib tashlanmadi:
//   1) tepada: ism, daraja, XP, chiqish (va kabinetlar);  2) hisob bog'lanmagan bo'lsa — bitta ixcham ogohlantirish + "Ulash";
//   3) Natijalarim: ko'rsatkichlar, hafta, progress, yutuqlar, natijalar tarixi;  4) Obuna — bitta qator;
//   5) Sozlamalar: til, kunlik maqsad, ovozli effektlar, daraja; bolalar rejimi (PIN) alohida (ustoz/xarakter tanlovi — Sellzen sahifasida);
//   6) Ko'proq imkoniyatlar: do'st taklifi, guruh, bepul maslahat, hamkorlik — ixcham qatorlar, bosilganda ochiladi;  7) hisobni o'chirish — eng pastda.
// Sertifikat ma'lumoti "Sertifikat" tabida (takror emas).
import { ArrowRight, BarChart3, Baby, Gift, Lock, LogOut, Megaphone, Phone, ShieldAlert, Trophy, Users } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { useEffect, useState } from 'react';
import { eraseAccount, getAccount, onAccountChange } from '../lib/account';
import { JoinForm } from '../components/JoinForm';
import { SignOutDialog } from '../components/SignOutDialog';
import { fmtDate } from '../lib/pay';
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
import { L } from '../i18n';
import { LeadCard } from '../components/LeadCard';

export default function Profile() {
  const p = useProfile();
  const [snd, setSnd] = useState(soundOn());
  const [acc, setAcc] = useState(getAccount());
  const [bye, setBye] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
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
  const streak = displayStreak(p, dayKey());
  const anyStats = streak > 0 || p.longestStreak > 0 || mastered > 0 || p.gamesPlayed > 0;
  const partner = role === 'creator' || role === 'admin';

  // Obuna — bitta qator
  const plan = (() => {
    const now = Date.now(); const u = p.planUntil;
    const on = (t: 'exam' | 'grammar' | 'voice') => !!u[t] && u[t]! > now;
    const id = on('voice') && on('exam') && on('grammar') ? 'premium' : on('exam') && on('grammar') ? 'all' : on('exam') ? 'exam' : on('grammar') ? 'general' : null;
    const pl = SALE_PLANS.find((x) => x.id === id);
    if (pl) { const until = Math.min(...pl.tracks.filter((t) => t !== 'mocks').map((t) => u[t]!)); return <span><b className="ok">{pl.title}</b> · {L('{0} gacha', [fmtDate(until)])}</span>; }
    const demo = (['exam', 'grammar'] as const).filter((t) => p.plan[t]);
    return demo.length ? <span>{L('Demo:')} {demo.map((t) => TRACK_NAME[t]).join(', ')} <small className="muted">{L('(faqat shu qurilmada)')}</small></span> : <span>{L('Bepul tarif')}</span>;
  })();

  return (
    <div className="profile">
      <section className="card prof-head">
        <UserAvatar acc={acc} />
        <h2>{acc?.nickname}</h2>
        <p className="muted">{p.level ? `${p.level} · ${LEVEL_INFO[p.level].name}` : L('Daraja aniqlanmagan')} · {lp.level}{L('-bosqich · jami')} {p.xp}  {L('XP')}</p>
        <div className="bar" style={{ width: '100%', maxWidth: 420 }}><i style={{ width: `${lp.pct * 100}%` }} /></div>
        <small className="muted">{lp.into} / {lp.span}  {L('XP keyingi bosqichgacha')}</small>
        {/* Egasi (2026-11-26): "akkauntdan chiqishni topa olmadim" — chiqish va kabinetlar profil boshida */}
        <div className="prof-actions">
          {partner && <a className="btn sm" href="#/creator"><Megaphone size={14} />  {L('Hamkor kabineti')}</a>}
          {role === 'admin' && <a className="btn sm" href="#/admin"><BarChart3 size={14} />  {L('Admin kabineti')}</a>}
          {acc && <button className="btn sm" onClick={() => setBye(true)}><LogOut size={14} />  {L('Hisobdan chiqish')}</button>}
        </div>
        {bye && <SignOutDialog onClose={() => setBye(false)} />}
      </section>

      {/* Hisob hech narsaga bog'lanmagan — bitta ixcham ogohlantirish (forma faqat bosilganda ochiladi) */}
      {acc && !acc.tg && (
        <section className="card save-acc" id="link-account">
          <div className="save-acc-row">
            <span className="blob orange"><ShieldAlert /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0 }}>{L('Hisobingizni saqlang')}</h3>
              <p className="muted" style={{ margin: '2px 0 0' }}>{L('Telegram, Google yoki telefon raqamni ulang — boshqa qurilmadan ham kira olasiz va natijalaringiz yo‘qolmaydi.')}</p>
            </div>
          </div>
          {linkOpen
            ? <div style={{ marginTop: 10 }}><JoinForm onJoined={(a) => setAcc(a)} title={L('Kirish usulini tanlang')} /></div>
            : <button className="btn primary sm" style={{ marginTop: 10 }} onClick={() => setLinkOpen(true)}>{L('Ulash')} <ArrowRight size={15} /></button>}
        </section>
      )}
      {p.brokenStreak && repairOpen(p, dayKey()) && <p className="notice">{p.brokenStreak?.value}  {L('kunlik seriya uzildi. 48 soat ichida kunlik maqsadni 2 barobar bajarsangiz, tiklanadi (30 kunda bir marta).')}</p>}

      {/* 1. Natijalarim */}
      <div className="section-title"><h2>{L('Natijalarim')}</h2></div>
      {anyStats ? (
        <div className="ptiles three">
          <div className="ptile"><PRing value={streak} max={Math.max(7, streak)} color="var(--orange)" label={L('Seriya')}><b>{streak}</b></PRing><div><b>{L('Seriya')}</b><small>{L('eng uzun')} {p.longestStreak}{p.freezes > 0 ? ` · ❄ ${p.freezes}` : ''}</small></div></div>
          <div className="ptile"><PRing value={mastered} max={vocab.length} color="var(--teal)" label={L('So‘zlar')}><b>{mastered}</b></PRing><div><b>{L('So‘zlar')}</b><small>/ {vocab.length}  {L('yodlangan')}</small></div></div>
          <div className="ptile"><PRing value={p.gamesPlayed} max={Math.max(10, p.gamesPlayed)} color="var(--brand)" label={L('O‘yinlar')}><b>{p.gamesPlayed}</b></PRing><div><b>{L('O‘yinlar')}</b><small>{L('o‘ynalgan')}</small></div></div>
        </div>
      ) : (
        <section className="card"><p style={{ margin: 0 }}>{L('Birinchi darsni tugating — seriya, so‘zlar va natijalaringiz shu yerda ko‘rinadi.')} <a href="#/learn">{L('Darsni boshlash')}</a></p></section>
      )}
      <section className="card"><h3 style={{ margin: 0 }}>{L('Bu hafta')}</h3><WeekBars activity={p.activity} /></section>
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
        <h3>{L('Natijalar tarixi')}</h3>
        <ResultList results={results} limit={10} moreHref="#/results" />
      </div>

      {/* 2. Obuna — bitta qator (batafsil — «Obuna» tabida) */}
      <section className="card prof-plan">
        <span>{L('Obuna:')} {plan}</span>
        <a className="btn sm" href="#/pricing">{L('Tariflar')}</a>
      </section>

      {/* 3. Sozlamalar */}
      <div className="section-title"><h2>{L('Sozlamalar')}</h2></div>
      <div className="card prof-settings">
        <div className="set-row"><span>{L('Til')}</span><LangPicker /></div>
        <div className="set-row">
          <label htmlFor="daily-goal">{L('Kunlik maqsad')}</label>
          <select id="daily-goal" value={p.dailyGoal} onChange={(e) => setDailyGoal(Number(e.target.value))}>
            {[30, 50, 100, 150].map((g) => <option key={g} value={g}>{g}  {L('XP')}</option>)}
          </select>
        </div>
        <div className="set-row"><label htmlFor="snd">{L('Ovozli effektlar')}</label><input id="snd" type="checkbox" checked={snd} onChange={(e) => { setSnd(e.target.checked); setSound(e.target.checked); if (e.target.checked) sfx('ok'); }} /></div>
        <div className="set-row"><span>{L('Daraja')}: <b>{p.level ?? '—'}</b></span><a className="btn sm" href="#/placement">{p.level ? L('Qayta aniqlash') : L('Darajani aniqlash')}</a></div>
        <details className="fold set-fold"><summary><Baby size={16} />  {L('Bolalar rejimi (PIN bilan)')}</summary><PersonaPicker only="kids" /></details>
      </div>

      {/* 4. Ko'proq imkoniyatlar — ixcham qatorlar */}
      <div className="section-title"><h2>{L('Ko‘proq imkoniyatlar')}</h2></div>
      <div className="card more-opts">
        {acc && <details className="fold"><summary><Gift size={16} />  {L('Do‘stlarni taklif qiling')}</summary><InviteCard /></details>}
        <details className="fold"><summary><Users size={16} />  {L('O‘qituvchi guruhiga qo‘shilish')}</summary><JoinGroupCard /></details>
        <details className="fold"><summary><Phone size={16} />  {L('Bepul maslahat')}</summary><LeadCard level={p.level ?? undefined} /></details>
        {!partner && <a className="more-link" href="#/partners"><Megaphone size={16} />  <span>{L('Bloger yoki o‘qituvchimisiz? Hamkorlik')}</span><ArrowRight size={16} /></a>}
      </div>

      {/* Xavfli amal — sahifa oxirida */}
      {acc && (
        <details className="card fold danger-zone">
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
    </div>
  );
}
