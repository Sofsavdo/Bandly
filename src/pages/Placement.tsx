import { ArrowRight, CalendarDays, CheckCircle2, Rocket, Target } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Illo } from '../components/Illo';
import { placement } from '../content/placement';
import { CEFR, LEVEL_INFO, suggestedTarget, type Cefr } from '../lib/levels';
import { evaluate, nextQuestion } from '../lib/placement';
import { LEVEL_BAND } from '../lib/progress';
import { addXp, setLevel, setTarget, useProfile } from '../lib/store';
import { confetti, sfx } from '../lib/fx';
import { L } from '../i18n';
import { getAccount, myRefCode } from '../lib/account';
import { renderStory, resultLink, shareCard } from '../lib/shareCard';
import { track } from '../lib/track';
import { takeGo } from '../lib/setupGate';

const TARGETS = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0];

function planFor(level: Cefr): { title: string; text: string; href: string }[] {
  const low = level === 'A1' || level === 'A2';
  return [
    { title: L('Har kuni so‘z o‘yini'), text: low ? L('Eng kerakli A1–A2 so‘zlar bilan boshlaysiz.') : L('Darajangizga mos IELTS so‘zlari takrorlanadi.'), href: '#/games' },
    { title: low ? 'Grammar asoslari' : L('Grammar: zaif joylar'), text: low ? L('Zamonlar va artikllarni noldan mustahkamlaysiz.') : L('Xatolaringiz bo‘yicha mavzular tavsiya etiladi.'), href: '#/grammar' },
    { title: low ? L('Oson Reading va Listening') : L('IELTS Reading va Listening'), text: low ? L('Avval qisqa va oddiy matnlar, keyin imtihon formati.') : L('To‘liq imtihon formatidagi testlar.'), href: '#/exam' },
    { title: 'Speaking', text: low ? L('Ustoz sodda savollar beradi va sekin gapiradi.') : L('IELTS Part 1–3, darajangizga mos savollar.'), href: '#/exam/speaking' },
  ];
}

export default function Placement() {
  const p = useProfile();
  const [started, setStarted] = useState(takeGo);
  // Oldingi natija (taqqoslash uchun) — test boshlanishidagi holat; yangi natija avtomatik saqlangach ham to'g'ri ko'rinadi
  const [prev] = useState(() => p.checkpoints[p.checkpoints.length - 1]?.level ?? null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [target, setTargetState] = useState<number | null>(null);
  const [date, setDate] = useState('');
  const [saved, setSaved] = useState(false);
  const [ref, setRef] = useState<string | null>(null);
  useEffect(() => { void myRefCode().then(setRef); }, []);

  const q = useMemo(() => nextQuestion(answers), [answers]);
  const result = useMemo(() => evaluate(answers), [answers]);
  const done = started && q === null;
  const answeredN = Object.keys(answers).length;
  useEffect(() => { if (done) track('placement_done'); }, [done]);
  // Natija avtomatik saqlanadi: "saqlash" tugmasini bosmasa ham daraja yo'qolmaydi va test qayta so'ralmaydi
  useEffect(() => { if (done && !saved) finish(); }, [done, saved]); // eslint-disable-line react-hooks/exhaustive-deps
  const lvlName = (l: Cefr) => `${l} · ${LEVEL_INFO[l].name}`;

  const finish = () => {
    const t = target ?? suggestedTarget(result.level);
    setLevel(result.level, t, date || null);
    if (!p.placementAt) addXp(30);
    setSaved(true);
    sfx('level'); confetti(100);
  };

  if (!started) {
    return (
      <div className="stage placement">
        <div className="stage-center">
          <Illo kind="target" size={110} />
          <h1 className="say">{L('Avval darajangizni aniqlaymiz')}</h1>
          <p className="lead" style={{ maxWidth: 560 }}>
            
            {L('20 tagacha qisqa savol, A1 dan C1 gacha. Natijaga qarab sizga alohida dastur tuziladi.')}
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <span className="pill">{L('~3 daqiqa')}</span><span className="pill">{L('Istalgan payt qayta topshirish')}</span>
          </div>
          <button className="btn primary lg" onClick={() => { setStarted(true); track('placement_start'); }}>{L('Testni boshlash')} <ArrowRight size={18} /></button>
          {p.level && <a className="evidence" href="#/">{L('Hozirgi daraja:')} {p.level}{L('. Bekor qilish')}</a>}
        </div>
      </div>
    );
  }

  if (!done && q) {
    const blockIdx = CEFR.indexOf(q.level);
    return (
      <div className="stage placement">
        <div className="stage-top">
          <span className="pill">{q.kind === 'Grammar' ? L('Grammatika') : L('Lug‘at')}</span>
          <span className="pill">{L('Savol')} {answeredN + 1}</span>
        </div>
        <div className="level-steps" aria-label={L('Bosqichlar')}>
          {CEFR.map((l, i) => <i key={l} className={i < blockIdx ? 'done' : i === blockIdx ? 'now' : ''}><b>{l}</b></i>)}
        </div>
        <p className="say placement-q">{q.q}</p>
        <div className="opts" key={q.id}>
          {q.options.map((o, i) => (
            <button key={`${q.id}-${i}`} type="button" className="opt" onClick={(e) => { e.currentTarget.blur(); setAnswers((a) => ({ ...a, [q.id]: i })); }}>
              <b style={{ opacity: .5, marginRight: 10 }}>{'ABCD'[i]}</b>{o}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const lvl = result.level;
  const info = LEVEL_INFO[lvl];
  const t = target ?? suggestedTarget(lvl);
  const link = resultLink('/placement', ref);
  const shareStory = async () => {
    const blob = await renderStory({
      eyebrow: L('Mening ingliz tili darajam'), big: lvl, title: info.name, sub: info.band,
      steps: { labels: [...CEFR], active: CEFR.indexOf(lvl) },
      cta: L('Sen ham 3 daqiqada bepul tekshir!'), link: 'sellzen.uz',
    });
    if (blob) await shareCard(blob, `sellzen-${lvl}`, `${L('Mening ingliz tili darajam:')} ${lvl}. ${L('Sen ham 3 daqiqada bepul tekshir!')} ${link}`);
  };
  return (
    <div>
      <div className="stage placement result">
        <div className="stage-center">
          <Illo kind="trophy" size={110} />
          <span className="eyebrow"><CheckCircle2 size={15} />  {L('Natija tayyor')}</span>
          <h1 className="say">{L('Sizning darajangiz:')} <span className="lvl-big">{lvl}</span></h1>
          <p className="lead">{lvlName(lvl)} · {info.band}</p>
          <p style={{ maxWidth: 560 }}>{info.desc}</p>
          <div className="level-steps big">
            {CEFR.map((l) => <i key={l} className={l === lvl ? 'now' : CEFR.indexOf(l) < CEFR.indexOf(lvl) ? 'done' : ''}><b>{l}</b></i>)}
          </div>
          <p className="evidence"><CheckCircle2 size={14} />  {L('Darajangiz saqlandi. Darslar shu darajadan ochiladi.')}</p>
          {getAccount()
            ? <a className="btn primary lg" href="#/"><Rocket size={18} />  {L('Darslarni boshlash')}</a>
            : <a className="btn primary lg" href={`#/login?next=${encodeURIComponent('#/start')}`}>{L('Bepul ro‘yxatdan o‘tish')} <ArrowRight size={18} /></a>}
        </div>
      </div>

      {prev && (
        <div className="card"><b>{L('Oldingi natija:')} {prev}</b> → <b>{L('yangi:')} {lvl}</b>{LEVEL_BAND[lvl] > LEVEL_BAND[prev] ? <span className="ok"> · +{(LEVEL_BAND[lvl] - LEVEL_BAND[prev]).toFixed(1)}  {L('band o‘sdingiz')}</span> : null}</div>
      )}

      <div className="card">
        <h3><Target size={18} style={{ verticalAlign: -3 }} />  {L('Maqsadingiz: IELTS')} {t.toFixed(1)}</h3>
        <p className="evidence">{L('Maqsadga qarab kunlik reja va tavsiyalar o‘zgaradi. Hozir tavsiya:')} {suggestedTarget(lvl).toFixed(1)}.</p>
        <div className="row" style={{ marginBottom: 12 }}>
          {TARGETS.map((x) => <button key={x} className={`chipbtn ${t === x ? 'on' : ''}`} onClick={() => { setTargetState(x); if (saved) setTarget(x, date || p.examDate); }}>{x.toFixed(1)}</button>)}
        </div>
        <label className="evidence" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <CalendarDays size={16} />  {L('Imtihon sanasi (ixtiyoriy):')}
          <input type="date" value={date} onChange={(e) => { setDate(e.target.value); if (saved) setTarget(t, e.target.value || null); }} className="input" style={{ width: 'auto' }} />
        </label>
      </div>

      <div className="card">
        <h3>{L('Sizga tuzilgan dastur')}</h3>
        <div className="plan-list">
          {planFor(lvl).map((s, i) => (
            <a key={s.title} className="plan-step" href={s.href}>
              <span className="n">{i + 1}</span><div><b>{s.title}</b><p>{s.text}</p></div>
            </a>
          ))}
        </div>
        <div className="row" style={{ marginTop: 16 }}>
          {getAccount() && <a className="btn lg" href="#/skills">{L('Reading va Listening’ni ham tekshirish')}</a>}
          {/* Virallik: natijani do'stga yuborish — "sen ham tekshir" (Telegram O'zbekistonda asosiy kanal); kirgan bo'lsa taklif kodi bilan */}
          <a className="btn lg" target="_blank" rel="noreferrer" onClick={() => track('share_placement_tg')} href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(`${L('Mening ingliz tili darajam:')} ${lvl}. ${L('Sen ham 3 daqiqada bepul tekshir!')}`)}`}>{L('Telegramda ulashish')}</a>
          <button className="btn lg" onClick={() => { track('share_placement_img'); void shareStory(); }}>{L('Rasm bilan ulashish')}</button>
          <button className="btn lg" onClick={() => { setAnswers({}); setSaved(false); }}>{L('Qayta topshirish')}</button>
        </div>
      </div>
    </div>
  );
}
