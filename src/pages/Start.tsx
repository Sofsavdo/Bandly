// #/start — ro'yxatdan o'tishdan oldingi savolnoma: 8 ta qisqa savol (bir bosishda keyingisiga o'tadi) → shaxsiy reja → hisob.
import { ArrowLeft, ArrowRight, CalendarDays, Check, Rocket } from 'lucide-react';
import { useMemo, useState } from 'react';
import { JoinForm } from '../components/JoinForm';
import { Illo } from '../components/Illo';
import { getAccount, type Account } from '../lib/account';
import { CEFR, type Cefr } from '../lib/levels';
import { buildPlan, isExam, loadAnswers, saveAnswers, targetBand, type Answers, type Skill, type Tutor, type When, type Why } from '../lib/onboarding';
import { MINUTES, savePrefs, type Goal } from '../lib/planPrefs';
import { getProfile, setPersona, setTarget, useProfile } from '../lib/store';
import { L } from '../i18n';

type StepId = 'goal' | 'why' | 'when' | 'target' | 'level' | 'hard' | 'minutes' | 'tutor';
const GOAL_OPTS: { id: Goal; label: string }[] = [{ id: 'ielts', label: 'IELTS' }, { id: 'cefr', label: L('CEFR (Multilevel)') }, { id: 'sat', label: 'SAT' }, { id: 'general', label: L('Umumiy ingliz tili') }];
const WHY_OPTS: { id: Why; label: string }[] = [{ id: 'abroad', label: L('Chet elda o‘qish') }, { id: 'local', label: L('O‘zbekistondagi universitet') }, { id: 'career', label: L('Ish va karyera') }, { id: 'self', label: L('Sayohat va o‘zim uchun') }];
const WHEN_OPTS: { id: When; label: string }[] = [{ id: 'm1', label: L('1 oy ichida') }, { id: 'm3', label: L('1–3 oyda') }, { id: 'm6', label: L('3–6 oyda') }, { id: 'later', label: L('6 oydan keyin') }, { id: 'unknown', label: L('Hali bilmayman') }];
const TARGETS: Record<Goal, string[]> = { ielts: ['5.5', '6.0', '6.5', '7.0', '7.5', '8.0'], cefr: ['B1', 'B2', 'C1'], sat: ['1200', '1300', '1400', '1500'], general: [] };
const LEVEL_OPTS: { id: Cefr; label: string }[] = [
  { id: 'A1', label: L('Endi boshlayapman') }, { id: 'A2', label: L('Oddiy gaplarni tushunaman') }, { id: 'B1', label: L('Kundalik mavzularda gaplasha olaman') },
  { id: 'B2', label: L('Erkin gapiraman, ba’zan xato qilaman') }, { id: 'C1', label: L('Deyarli ravon') },
];
const SKILL_OPTS: { id: Skill; label: string }[] = [{ id: 'speaking', label: 'Speaking' }, { id: 'writing', label: 'Writing' }, { id: 'listening', label: 'Listening' }, { id: 'reading', label: 'Reading' }, { id: 'grammar', label: 'Grammar' }, { id: 'vocab', label: L('So‘z boyligi') }];
const TUTOR_OPTS: { id: Tutor; label: string; sub: string }[] = [
  { id: 'friendly', label: L('Hazil, lekin so‘kinmasin'), sub: L('Kuladi, kesatadi — toza tilda') },
  { id: 'savage', label: L('So‘kinsa ham bo‘ladi (18+)'), sub: L('Xatolaringiz ustidan so‘kinib kuladi') },
];
const SKILL_HREF: Record<Skill, string> = { speaking: '#/coach', writing: '#/exam/writing', listening: '#/mocks', reading: '#/mocks', grammar: '#/grammar', vocab: '#/games' };
const SKILL_STEP: Record<Skill, string> = { speaking: L('Speaking: AI ustoz bilan ovozli suhbat'), writing: L('Writing: insho va AI baho'), listening: L('Listening: mock testlar'), reading: L('Reading: mock testlar'), grammar: L('Grammar: zaif mavzular'), vocab: L('So‘z o‘yinlari: har kuni 5 daqiqa') };

const QUESTION: Record<StepId, string> = {
  goal: L('Nimaga tayyorlanyapsiz?'), why: L('Ingliz tili sizga nima uchun kerak?'), when: L('Imtihon qachon?'), target: L('Qaysi natija kerak?'),
  level: L('Hozirgi darajangiz qanday?'), hard: L('Nima eng qiyin? (bir nechtasini tanlang)'), minutes: L('Kuniga qancha vaqt ajratasiz?'), tutor: L('AI ustoz Bandi qanday gaplashsin?'),
};

const blank = (): Partial<Answers> => ({ hard: [], examDate: null, target: null });

export default function Start() {
  const p = useProfile();
  const [a, setA] = useState<Partial<Answers>>(() => loadAnswers() ?? blank());
  const [i, setI] = useState(0);
  const [done, setDone] = useState(() => !!loadAnswers());
  const [adultOk, setAdultOk] = useState(p.adult);
  const [acc, setAcc] = useState<Account | null>(() => getAccount());

  const steps = useMemo<StepId[]>(() => (['goal', 'why', ...(a.goal && isExam(a.goal) ? ['when', 'target'] as const : []), 'level', 'hard', 'minutes', 'tutor'] as StepId[]), [a.goal]);
  const step = steps[Math.min(i, steps.length - 1)]!;

  /** Javobni yozadi va keyingi savolga o'tadi. */
  const pick = (patch: Partial<Answers>, advance = true) => {
    const next = { ...a, ...patch };
    setA(next);
    if (!advance) return;
    if (i + 1 < steps.length) setI(i + 1); else finish(next as Answers);
  };

  const finish = (ans: Answers) => {
    saveAnswers(ans);
    savePrefs({ goal: ans.goal, minutes: ans.minutes });
    const band = targetBand(ans.goal, ans.target);
    if (band !== null || ans.examDate) setTarget(band ?? p.target, ans.examDate ?? p.examDate);
    const adult = ans.tutor === 'savage' ? true : p.adult;
    setPersona(ans.tutor === 'savage' ? 2 : 0, ans.tutor === 'savage' ? true : adult);
    setDone(true);
    window.scrollTo({ top: 0 });
  };

  if (done && a.goal && a.level && a.minutes && a.tutor) return <Result a={a as Answers} acc={acc} onJoined={(x) => { setAcc(x); if (!getProfile().level) setTimeout(() => { window.location.hash = '#/placement'; }, 300); }} onRedo={() => { setDone(false); setI(0); }} />;

  const opts = (list: { id: string; label: string; sub?: string }[], key: keyof Answers, current: unknown) => (
    <div className="opts" key={step}>
      {list.map((o) => (
        <button key={o.id} type="button" className={`opt ${current === o.id ? 'sel' : ''}`} onClick={(e) => { e.currentTarget.blur(); pick({ [key]: key === 'minutes' ? Number(o.id) : o.id } as Partial<Answers>); }}>
          {o.label}{o.sub && <small className="opt-sub">{o.sub}</small>}
        </button>
      ))}
    </div>
  );

  return (
    <div className="stage placement onboard">
      <div className="stage-top">
        <button type="button" className="icon-btn" disabled={i === 0} onClick={() => setI(i - 1)} aria-label={L('Orqaga')}><ArrowLeft size={18} /></button>
        <div className="seg-progress grow" role="img" aria-label={L('{0} / {1} qadam', [i + 1, steps.length])}>{steps.map((s, k) => <i key={s} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      </div>
      <h1 className="say placement-q">{QUESTION[step]}</h1>

      {step === 'goal' && opts(GOAL_OPTS, 'goal', a.goal)}
      {step === 'why' && opts(WHY_OPTS, 'why', a.why)}
      {step === 'when' && (
        <>
          {opts(WHEN_OPTS, 'when', a.when)}
          <label className="evidence onboard-date"><CalendarDays size={16} />  {L('Aniq sana (ixtiyoriy):')}
            <input type="date" className="input" value={a.examDate ?? ''} min={new Date().toISOString().slice(0, 10)} onChange={(e) => pick({ examDate: e.target.value || null }, false)} />
          </label>
        </>
      )}
      {step === 'target' && a.goal && opts(TARGETS[a.goal].map((t) => ({ id: t, label: a.goal === 'ielts' ? `IELTS ${t}` : a.goal === 'sat' ? `SAT ${t}` : t })), 'target', a.target)}
      {step === 'level' && opts(LEVEL_OPTS.map((l) => ({ ...l, label: `${l.id} · ${l.label}` })), 'level', a.level)}
      {step === 'hard' && (
        <>
          <div className="opts two" key="hard">
            {SKILL_OPTS.map((o) => {
              const on = a.hard?.includes(o.id) ?? false;
              return <button key={o.id} type="button" aria-pressed={on} className={`opt ${on ? 'sel' : ''}`} onClick={(e) => { e.currentTarget.blur(); pick({ hard: on ? a.hard!.filter((x) => x !== o.id) : [...(a.hard ?? []), o.id] }, false); }}>{on && <Check size={16} />} {o.label}</button>;
            })}
          </div>
          <button className="btn primary lg onboard-next" onClick={() => pick({})}>{L('Davom etish')} <ArrowRight size={18} /></button>
        </>
      )}
      {step === 'minutes' && opts(MINUTES.map((m) => ({ id: String(m), label: L('{0} daqiqa', [m]) })), 'minutes', a.minutes === undefined ? undefined : String(a.minutes))}
      {step === 'tutor' && (
        <div className="opts" key="tutor">
          {TUTOR_OPTS.map((o) => (
            <button key={o.id} type="button" className={`opt ${a.tutor === o.id ? 'sel' : ''}`} disabled={o.id === 'savage' && !adultOk}
              onClick={(e) => { e.currentTarget.blur(); pick({ tutor: o.id }); }}>{o.label}<small className="opt-sub">{o.sub}</small></button>
          ))}
          {!p.adult && <label className="evidence onboard-adult"><input type="checkbox" checked={adultOk} onChange={(e) => setAdultOk(e.target.checked)} /> {L('18 yoshdan oshganman (qo‘pol xarakter uchun)')}</label>}
        </div>
      )}
    </div>
  );
}

/** Natija: shaxsiy reja, birinchi qadamlar va hisobga kirish. */
function Result({ a, acc, onJoined, onRedo }: { a: Answers; acc: Account | null; onJoined: (x: Account) => void; onRedo: () => void }) {
  const plan = buildPlan(a);
  const [min, setMin] = useState(a.minutes);
  const goalName = GOAL_OPTS.find((g) => g.id === a.goal)!.label;
  const targetName = a.target ? (a.goal === 'ielts' ? `IELTS ${a.target}` : a.goal === 'sat' ? `SAT ${a.target}` : a.target) : goalName;
  const better = plan.minutesNeeded ? MINUTES.find((m) => m >= plan.minutesNeeded!) ?? null : null;
  const steps = [
    { t: L('Daraja testi — 3 daqiqa'), href: '#/placement' },
    ...plan.focus.map((s) => ({ t: SKILL_STEP[s], href: SKILL_HREF[s] })),
    { t: L('Kunlik reja: har kuni {0} daqiqa', [min]), href: '#/' },
  ];
  const raise = (m: number) => { setMin(m); savePrefs({ goal: a.goal, minutes: m }); saveAnswers({ ...a, minutes: m }); };
  return (
    <div className="onboard-result">
      <section className="stage placement result">
        <div className="stage-center">
          <Illo kind="target" size={96} />
          <span className="eyebrow"><Check size={15} />  {L('Rejangiz tayyor')}</span>
          <h1 className="say">{CEFR.includes(a.level) ? a.level : ''} → {targetName}</h1>
        </div>
        <div className="kpis">
          {plan.weeks !== null && <div className="kpi2"><span>{L('Imtihongacha')}</span><b>{L('{0} hafta', [plan.weeks])}</b></div>}
          <div className="kpi2"><span>{L('Har kuni')}</span><b>{L('{0} daq', [min])}</b></div>
          <div className="kpi2"><span>{L('Haftasiga')}</span><b>{L('{0} dars', [Math.max(1, Math.floor((min * 5) / 12))])}</b></div>
          {plan.hoursNeeded !== null && plan.hoursNeeded > 0 && <div className="kpi2"><span>{L('Maqsadgacha')}</span><b>{L('~{0} soat', [plan.hoursNeeded])}</b></div>}
        </div>
        {plan.verdict === 'ok' && <p className="onboard-verdict ok">{L('Shu tempda ulgurasiz.')}</p>}
        {plan.verdict === 'reached' && <p className="onboard-verdict ok">{L('Darajangiz maqsadga yaqin — imtihon formatini mashq qilamiz.')}</p>}
        {plan.verdict === 'tight' && min < (plan.minutesNeeded ?? 0) && (
          <p className="onboard-verdict tight">
            {L('Ulgurish uchun kuniga ~{0} daqiqa kerak.', [plan.minutesNeeded!])}{' '}
            {better ? <button className="btn sm" onClick={() => raise(better)}>{L('{0} daqiqa qilish', [better])}</button> : <span>{L('Sanani surish yoki maqsadni pasaytirish kerak.')}</span>}
          </p>
        )}
        <p className="muted onboard-note">{L('Taxminiy hisob. Daraja testi aniqroq qiladi.')}</p>
      </section>

      <section className="card">
        <h3>{L('Birinchi qadamlar')}</h3>
        <div className="plan-list">
          {steps.map((s, k) => <a key={s.t} className="plan-step" href={s.href}><span className="n">{k + 1}</span><div><b>{s.t}</b></div></a>)}
        </div>
      </section>

      {acc
        ? <div className="row"><a className="btn primary lg" href="#/placement"><Rocket size={18} />  {L('Boshlash')}</a><button className="btn lg" onClick={onRedo}>{L('Javoblarni o‘zgartirish')}</button></div>
        : <>
          <JoinForm onJoined={onJoined} text={L('Rejangiz hisobingizda saqlanadi.')} />
          <button className="btn" onClick={onRedo}>{L('Javoblarni o‘zgartirish')}</button>
        </>}
    </div>
  );
}
