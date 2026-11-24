import { ArrowRight, BookOpenCheck, Check, Compass, Flame, Plus, Send } from 'lucide-react';
import { UserAvatar } from '../components/UserAvatar';
import { useEffect, useState } from 'react';
import { authConfig, getAccount } from '../lib/account';
import { ALL_LESSONS, UNITS } from '../content/lessons';
import { DailyCards } from '../components/DailyCards';
import { ProgressCard } from '../components/ProgressCard';
import { PlanCard } from '../components/PlanCard';
import { InsightsCard } from '../components/InsightsCard';
import { ExamHero } from '../components/ExamHero';
import { QuestsCard } from '../components/QuestsCard';
import { Illo } from '../components/Illo';
import { PRing } from '../components/PRing';
import { WeekBars } from '../components/WeekBars';
import { listeningTests, readingTests } from '../content/mockTests';
import { vocab } from '../content/vocab';
import { useProfile } from '../lib/store';
import { dayKey, displayStreak, levelProgress } from '../lib/game';
import { loadProgress, nextLesson } from '../lib/lessons';
import { openExamTab } from '../lib/examTab';
import { loadAnswers } from '../lib/onboarding';
import { L } from '../i18n';
import { FREE_INFO, SALE_PLANS } from '../config';
import { fmtSum } from '../lib/pay';
import { QuickLinks } from '../components/QuickLinks';
import { track } from '../lib/track';

/** Ro'yxatdan o'tish → shaxsiy reja (maqsad) → daraja testi: mehmon uchun yagona yo'l. */
const SIGNUP = `#/login?next=${encodeURIComponent('#/start')}`;

const faq: [string, string][] = [
  [L('Nima bepul?'), L('Darajani aniqlash testi, Mock Arena (Listening va Reading), so‘z o‘yinlari va darslarning bir qismi.')],
  [L('Qanday kiraman?'), L('Telegram orqali, bir bosishda. Progress, reyting va obuna boshqa qurilmada ham ochiladi.')],
  [L('Ovozim saqlanadimi?'), L('Yo‘q. Ovoz yozib olinmaydi; AI yoqilganda faqat suhbat matni yuboriladi.')],
];

/** preview=true — #/welcome: yangi foydalanuvchi ko'radigan sahifa (progressdan qat'i nazar; reklama havolasi uchun ham). */
export default function Home({ preview = false }: { preview?: boolean }) {
  const p = useProfile();
  const lvl = p.level;
  const acc = getAccount();
  const isNew = preview || !acc || (!lvl && p.xp === 0);
  const [bot, setBot] = useState<string | null>(null);
  useEffect(() => { void authConfig().then((c) => setBot(c.telegram?.bot ?? null)); }, []);
  const tests = readingTests.length + listeningTests.length;
  const onboarded = !!loadAnswers();
  useEffect(() => { if (isNew && !acc) track('landing_view'); }, [isNew, acc]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isNew) return (
    <div>
      <section className="w-hero">
        <div>
          <div className="row"><span className="eyebrow" style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>{L('General English · IELTS · CEFR · SAT')}</span></div>
          <h1>{L('Ingliz tilini')} <span className="hl">{L('o‘yin kabi')}</span>  {L('o‘rganing')}</h1>
          <p className="lead">{L('A1–C2 darslar, bepul mock testlar va o‘zbekcha tushuntiradigan AI ustoz.')}</p>
          <div className="cta">
            {!acc ? <>
              {/* Mehmon faqat landingni ko'radi: ro'yxatdan o'tish → maqsad va reja → daraja testi (natija darhol hisobda) */}
              <a className="btn primary lg" href={SIGNUP} onClick={() => track('signup_start')}>{L('Bepul boshlash')} <ArrowRight size={18} /></a>
              <a className="btn lg" href="#/login">{L('Kirish')}</a>
            </> : onboarded
              ? <><a className="btn primary lg" href="#/placement">{L('Darajamni aniqlash')} <ArrowRight size={18} /></a><a className="btn lg" href="#/start">{L('Mening rejam')}</a></>
              : <><a className="btn primary lg" href="#/start">{L('Shaxsiy reja tuzish')} <ArrowRight size={18} /></a><a className="btn lg" href="#/placement">{L('Darajamni aniqlash')}</a></>}
          </div>
          <div className="w-proof">
            <div><b>{ALL_LESSONS.length}</b><span>{L('dars')}</span></div>
            <div><b>{tests}</b><span>{L('bepul test')}</span></div>
            <div><b>{vocab.length}</b><span>{L('so‘z')}</span></div>
            <div><b>{L('3 daq')}</b><span>{L('daraja testi')}</span></div>
          </div>
        </div>
        <div className="w-art" aria-hidden="true">
          <Illo kind="books" className="main" />
          <Illo kind="headphones" className="a" />
          <Illo kind="trophy" className="b" />
          <span className="burst b1">{'Hello'}</span>
          <span className="burst b2">{L('Salom')}</span>
        </div>
      </section>

      <div className="section-title" style={{ marginTop: 26 }}><h2>{L('Nimani')} <em className="it">{L('o‘rganasiz?')}</em></h2></div>
      <div className="courses">
        <a className="course c-coral tall" href="#/learn"><h3>{L('Ingliz tili')}</h3><p>{L('A1 dan C2 gacha darslar xaritasi')}</p><span className="go"><ArrowRight size={17} /></span><span className="tag">{L('Boshlash bepul')}</span><Illo kind="books" /></a>
        <a className="course c-butter" href="#/exam" onClick={() => openExamTab('ielts')}><h3>{L('IELTS')}</h3><p>{L('4 ko‘nikma, AI baho')}</p><span className="go"><ArrowRight size={17} /></span><Illo kind="target" /></a>
        <a className="course c-mint" href="#/exam" onClick={() => openExamTab('cefr')}><h3>{L('CEFR')}</h3><p>{L('Multilevel')}</p><span className="go"><ArrowRight size={17} /></span><Illo kind="cap" /></a>
        <a className="course c-sky" href="#/exam" onClick={() => openExamTab('sat')}><h3>{L('SAT')}</h3><p>{L('Reading & Writing')}</p><span className="go"><ArrowRight size={17} /></span><Illo kind="pencil" /></a>
        <a className="course c-pink" href="#/coach"><h3>{L('AI ustoz')}</h3><p>{L('Ovozli suhbat')}</p><span className="go"><ArrowRight size={17} /></span><Illo kind="chat" /></a>
        <a className="course c-lilac wide" href="#/mocks"><h3>{L('Mock Arena')}</h3><p>{tests}  {L('ta test, taymer va izohlar')}</p><span className="go"><ArrowRight size={17} /></span><span className="tag">{L('Bepul')}</span><Illo kind="clock" /></a>
      </div>

      {!acc && (
        <>
          <div className="section-title"><h2>{L('Qanday')} <em className="it">{L('ishlaydi?')}</em></h2></div>
          <ol className="how-steps">
            <li><b>1</b><div><h3>{L('Ro‘yxatdan o‘ting')}</h3><p>{L('Telegram orqali, bir bosishda — bepul.')}</p></div></li>
            <li><b>2</b><div><h3>{L('Maqsad va daraja')}</h3><p>{L('Maqsadingizni tanlaysiz, 3 daqiqalik test darajangizni aniqlaydi.')}</p></div></li>
            <li><b>3</b><div><h3>{L('O‘rganing va sinang')}</h3><p>{L('Darslar, AI ustoz va mock testlar — bitta joyda, natija hisobingizda.')}</p></div></li>
          </ol>
          <div className="section-title"><h2>{L('Narxlar')}</h2></div>
          <div className="land-prices">
            <div className="card"><h3>{L('Bepul')}</h3><p className="price">0 {L('so‘m')}</p><ul><li><Check size={15} />{L('Daraja testi va mock testlar')}</li><li><Check size={15} />{FREE_INFO.lessonsPerDay === 1 ? L('Har kuni bitta yangi dars') : L('Har kuni {0} ta yangi dars', [FREE_INFO.lessonsPerDay])}</li><li><Check size={15} />{L('So‘z o‘yinlari va duel')}</li></ul></div>
            {SALE_PLANS.map((pl) => (
              <div key={pl.id} className={`card${pl.recommended ? ' best' : ''}`}><h3>{pl.title}</h3><p className="price">{fmtSum(pl.monthlyUzs)} {L('so‘m / oy')}</p><ul>{pl.features.slice(0, 3).map((f) => <li key={f}><Check size={15} />{f}</li>)}</ul></div>
            ))}
          </div>
          <div className="row" style={{ justifyContent: 'center', margin: '6px 0 22px' }}><a className="btn primary lg" href={SIGNUP} onClick={() => track('signup_start')}>{L('Bepul boshlash')} <ArrowRight size={18} /></a></div>
        </>
      )}

      {bot && (
        <a className="card tg-promo" href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer">
          <span className="blob blue"><Send /></span>
          <div><h3 style={{ margin: 0 }}>{L('Telegram’da ham')}</h3><p className="muted" style={{ margin: '4px 0 0' }}>@{bot}</p></div>
          <ArrowRight size={18} />
        </a>
      )}

      <div className="section-title"><h2>{L('Savollar')}</h2></div>
      <div className="faq">
        {faq.map(([q, a]) => <details key={q}><summary>{q}<Plus size={20} /></summary><p>{a}</p></details>)}
      </div>
    </div>
  );

  const streak = displayStreak(p, dayKey());
  const lp = levelProgress(p.xp);
  const progress = loadProgress();
  const next = nextLesson(UNITS, progress, lvl);
  const nl = next ? UNITS.find((u) => u.id === next.unitId)?.lessons.find((l) => l.id === next.lessonId) : null;
  const nu = next ? UNITS.find((u) => u.id === next.unitId) : null;
  const total = UNITS.reduce((s, u) => s + u.lessons.length, 0);
  const passed = UNITS.flatMap((u) => u.lessons).filter((l) => progress[l.id]?.passedAt).length;
  const left = Math.max(0, p.dailyGoal - p.dailyXp);
  const h = new Date().getHours();
  const hello = h < 12 ? L('Xayrli tong') : h < 18 ? L('Xayrli kun') : L('Xayrli kech');

  return (
    <div className="home">
      <div className="hello">
        <UserAvatar acc={acc} className="avatar xs" />
        <div className="grow">
          <h2>{hello}{acc?.nickname ? `, ${acc.nickname}` : ''}!</h2>
          <small>{lvl ? L('Daraja {0}', [lvl]) : L('Daraja aniqlanmagan')} · {Math.round(lp.pct * 100)}{L('% keyingi bosqichgacha')}</small>
        </div>
      </div>

      {!lvl && (
        <div className="banner">
          <div><h3><Compass size={20} style={{ verticalAlign: -4 }} />  {L('Darajangizni aniqlang')}</h3><p>{L('3 daqiqalik test — kunlik reja shunga qarab tuziladi.')}</p></div>
          <a className="btn primary" href="#/placement">{L('Boshlash')} <ArrowRight size={18} /></a>
        </div>
      )}

      <ExamHero />
      {lvl && <PlanCard />}

      {/* Bitta ixcham kartochka: davom ettirish + asosiy ko'rsatkichlar + bugungi maqsad (avval 4 ta katta blok edi) */}
      <section className="card prog">
        <a className="prog-next" href={nl ? `#/learn/${nl.id}` : '#/learn'}>
          <span className="prog-ic"><BookOpenCheck size={20} /></span>
          <span className="grow"><small>{nl ? L('Davom ettirish') : L('Darslar')}</small><b>{nl ? nl.titleUz : L('Darslar xaritasi')}</b><em>{nu ? `${nu.level} · ${nu.titleUz}` : L('{0}/{1} dars o‘tildi', [passed, total])}</em></span>
          <ArrowRight size={18} className="prog-go" />
        </a>
        <div className="prog-stats">
          <a href="#/learn"><b>{passed}<small>/{total}</small></b><span>{L('dars')}</span></a>
          <a href="#/league"><b><Flame size={15} />{streak}</b><span>{L('kunlik seriya')}</span></a>
          <div><b>{Math.min(p.dailyXp, p.dailyGoal)}<small>/{p.dailyGoal}</small></b><span>{L('bugun XP')}</span></div>
          <div><b>{lp.level}</b><span>{lvl ? `${lvl} · ${L('bosqich')}` : L('bosqich')}</span></div>
        </div>
        <div className="prog-bar" role="progressbar" aria-valuemin={0} aria-valuemax={p.dailyGoal} aria-valuenow={Math.min(p.dailyXp, p.dailyGoal)} aria-label={L('Kunlik maqsad {0}/{1} XP', [p.dailyXp, p.dailyGoal])}><i style={{ width: `${Math.min(1, p.dailyXp / Math.max(1, p.dailyGoal)) * 100}%` }} /></div>
      </section>

      <QuickLinks />
      {lvl && <InsightsCard />}
      {!acc && <p className="notice">{L('Progress hozir faqat shu qurilmada.')} <a href="#/profile">{L('Hisob oching')}</a>  {L('— boshqa qurilmada ham ochiladi.')}</p>}
      {!lvl && <PlanCard />}
      <QuestsCard />
      <ProgressCard />
      <DailyCards />
    </div>
  );
}
