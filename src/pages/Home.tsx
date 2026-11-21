import { ArrowRight, BookOpenCheck, Compass, Flame, Plus, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authConfig, getAccount } from '../lib/account';
import { ALL_LESSONS, UNITS } from '../content/lessons';
import { DailyCards } from '../components/DailyCards';
import { ProgressCard } from '../components/ProgressCard';
import { PlanCard } from '../components/PlanCard';
import { ExamHero } from '../components/ExamHero';
import { QuestsCard } from '../components/QuestsCard';
import { Illo } from '../components/Illo';
import { PRing } from '../components/PRing';
import { WeekBars } from '../components/WeekBars';
import { LangPicker } from '../components/LangPicker';
import { listeningTests, readingTests } from '../content/mockTests';
import { vocab } from '../content/vocab';
import { useProfile } from '../lib/store';
import { LEVEL_INFO } from '../lib/levels';
import { dayKey, displayStreak, levelProgress } from '../lib/game';
import { loadProgress, nextLesson } from '../lib/lessons';
import { openExamTab } from '../lib/examTab';
import { loadAnswers } from '../lib/onboarding';
import { L } from '../i18n';

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

  if (isNew) return (
    <div>
      <section className="w-hero">
        <div>
          <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}><span className="eyebrow" style={{ whiteSpace: 'nowrap', marginBottom: 0 }}>{L('General English · IELTS · CEFR · SAT')}</span><LangPicker /></div>
          <h1>{L('Ingliz tilini')} <span className="hl">{L('o‘yin kabi')}</span>  {L('o‘rganing')}</h1>
          <p className="lead">{L('A1–C2 darslar, bepul mock testlar va o‘zbekcha tushuntiradigan AI ustoz.')}</p>
          <div className="cta">
            {!acc ? <>
              {/* Mehmon uchun birinchi qadam — ro'yxatdan o'tmasdan qiymat: 3 daqiqalik daraja testi (natijani saqlash uchun keyin kiradi) */}
              <a className="btn primary lg" href="#/placement">{L('Darajamni aniqlash')} <ArrowRight size={18} /></a>
              <a className="btn lg" href={`#/login?next=${encodeURIComponent('#/start')}`}>{L('Bepul ro‘yxatdan o‘tish')}</a>
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
    <div>
      <div className="hello">
        <span className="avatar sm" aria-hidden="true">{(acc?.nickname ?? 'B').slice(0, 1).toUpperCase()}</span>
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

      <section className="lvlcard">
        <h3>{lvl ? `${lvl} · ${LEVEL_INFO[lvl].name}` : 'Sellzen'} — {lp.level}{L('-bosqich')}</h3>
        <p>{left === 0 ? L('Bugungi maqsad bajarildi — seriya saqlandi!') : L('Bugungi maqsadgacha {0} XP', [left])}</p>
        <div className="slider" role="progressbar" aria-valuemin={0} aria-valuemax={lp.span} aria-valuenow={lp.into} aria-label={L('Keyingi bosqichgacha XP')}><i style={{ width: `${lp.pct * 100}%` }} /><b style={{ left: `${Math.max(4, Math.min(96, lp.pct * 100))}%` }} /></div>
        <Illo kind="trophy" />
      </section>


      <div className="dash2">
        <a className="cont" href={nl ? `#/learn/${nl.id}` : '#/learn'}>
          <small>{nl ? L('Davom ettirish') : L('Darslar')}</small>
          <h3>{nl ? nl.titleUz : L('Darslar xaritasi')}</h3>
          <p>{nu ? `${nu.level} · ${nu.titleUz}` : L('{0}/{1} dars o‘tildi', [passed, total])}</p>
          <span className="btn primary sm">{L('Boshlash')} <ArrowRight size={16} /></span>
          <Illo kind="books" />
        </a>
        <div className="twin">
          <a className="stat2 s-lilac" href="#/learn"><div className="s-top"><span><BookOpenCheck size={20} /></span><span className="go"><ArrowRight size={15} /></span></div><b>{passed}</b><small>/ {total}  {L('dars')}</small></a>
          <a className="stat2 s-mint" href="#/league"><div className="s-top"><span><Flame size={20} /></span><span className="go"><ArrowRight size={15} /></span></div><b>{streak}</b><small>{L('kunlik seriya')}</small></a>
        </div>
      </div>

      <section className="card">
        <div className="daytask">
          <PRing value={p.dailyXp} max={p.dailyGoal} size={78} stroke={8} color="var(--coral)" label={L('Kunlik maqsad {0}/{1} XP', [p.dailyXp, p.dailyGoal])}><b style={{ fontSize: 19 }}>{Math.round(Math.min(1, p.dailyXp / Math.max(1, p.dailyGoal)) * 100)}%</b></PRing>
          <div><h3>{L('Kunlik maqsad')}</h3><p>{Math.min(p.dailyXp, p.dailyGoal)} / {p.dailyGoal}  {L('XP · bu hafta')} {Object.entries(p.activity).filter(([k]) => Date.now() - new Date(k).getTime() < 7 * 86400000).reduce((s, [, v]) => s + v, 0)}  {L('XP')}</p></div>
        </div>
        <WeekBars activity={p.activity} />
      </section>

      {!acc && <p className="notice">{L('Progress hozir faqat shu qurilmada.')} <a href="#/profile">{L('Hisob oching')}</a>  {L('— boshqa qurilmada ham ochiladi.')}</p>}
      {!lvl && <PlanCard />}
      <QuestsCard />
      <ProgressCard />
      <DailyCards />
    </div>
  );
}
