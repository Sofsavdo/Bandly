import { ArrowRight, BookOpenCheck, Bot, ClipboardList, Compass, Flame, Gamepad2, ListChecks, LineChart, Plus, Puzzle, Send, Target, Timer, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authConfig, getAccount } from '../lib/account';
import { ALL_LESSONS, UNITS } from '../content/lessons';
import { DailyCards } from '../components/DailyCards';
import { ProgressCard } from '../components/ProgressCard';
import { PlanCard } from '../components/PlanCard';
import { QuestsCard } from '../components/QuestsCard';
import { Illo } from '../components/Illo';
import { PRing } from '../components/PRing';
import { WeekBars } from '../components/WeekBars';
import { listeningTests, readingTests } from '../content/mockTests';
import { vocab } from '../content/vocab';
import { useProfile } from '../lib/store';
import { LEVEL_INFO } from '../lib/levels';
import { dayKey, displayStreak, levelProgress } from '../lib/game';
import { loadProgress, nextLesson } from '../lib/lessons';
import { openExamTab } from '../lib/examTab';

const faq: [string, string][] = [
  ['Nima bepul?', 'Darajani aniqlash testi, Mock Arena (Listening va Reading), so‘z o‘yinlari va darslarning bir qismi.'],
  ['Qanday kiraman?', 'Telegram orqali, bir bosishda. Progress, reyting va obuna boshqa qurilmada ham ochiladi.'],
  ['Ovozim saqlanadimi?', 'Yo‘q. Ovoz yozib olinmaydi; AI yoqilganda faqat suhbat matni yuboriladi.'],
];

/** preview=true — #/welcome: yangi foydalanuvchi ko'radigan sahifa (progressdan qat'i nazar; reklama havolasi uchun ham). */
export default function Home({ preview = false }: { preview?: boolean }) {
  const p = useProfile();
  const lvl = p.level;
  const isNew = preview || (!lvl && p.xp === 0);
  const [bot, setBot] = useState<string | null>(null);
  const acc = getAccount();
  useEffect(() => { void authConfig().then((c) => setBot(c.telegram?.bot ?? null)); }, []);
  const tests = readingTests.length + listeningTests.length;

  if (isNew) return (
    <div>
      <section className="w-hero">
        <div>
          <span className="eyebrow" style={{ whiteSpace: 'nowrap' }}>General English · IELTS · CEFR · SAT</span>
          <h1>Ingliz tilini <span className="hl">o‘yin kabi</span> o‘rganing</h1>
          <p className="lead">A1–C2 darslar, bepul mock testlar va o‘zbekcha tushuntiradigan AI ustoz.</p>
          <div className="cta">
            <a className="btn primary lg" href="#/placement">Darajamni aniqlash <ArrowRight size={18} /></a>
            <a className="btn lg" href="#/mocks">Bepul mock test</a>
          </div>
          <div className="w-proof">
            <div><b>{ALL_LESSONS.length}</b><span>dars</span></div>
            <div><b>{tests}</b><span>bepul test</span></div>
            <div><b>{vocab.length}</b><span>so‘z</span></div>
            <div><b>3 daq</b><span>daraja testi</span></div>
          </div>
        </div>
        <div className="w-art" aria-hidden="true">
          <Illo kind="books" className="main" />
          <Illo kind="headphones" className="a" />
          <Illo kind="trophy" className="b" />
          <span className="burst b1">Hello</span>
          <span className="burst b2">Salom</span>
        </div>
      </section>

      <div className="section-title" style={{ marginTop: 26 }}><h2>Nimani <em className="it">o‘rganasiz?</em></h2></div>
      <div className="courses">
        <a className="course c-coral tall" href="#/learn"><h3>Ingliz tili</h3><p>A1 dan C2 gacha darslar xaritasi</p><span className="go"><ArrowRight size={17} /></span><span className="tag">Boshlash bepul</span><Illo kind="books" /></a>
        <a className="course c-butter" href="#/exam" onClick={() => openExamTab('ielts')}><h3>IELTS</h3><p>4 ko‘nikma, AI baho</p><span className="go"><ArrowRight size={17} /></span><Illo kind="target" /></a>
        <a className="course c-mint" href="#/exam" onClick={() => openExamTab('cefr')}><h3>CEFR</h3><p>Multilevel</p><span className="go"><ArrowRight size={17} /></span><Illo kind="cap" /></a>
        <a className="course c-sky" href="#/exam" onClick={() => openExamTab('sat')}><h3>SAT</h3><p>Reading & Writing</p><span className="go"><ArrowRight size={17} /></span><Illo kind="pencil" /></a>
        <a className="course c-pink" href="#/coach"><h3>AI ustoz</h3><p>Ovozli suhbat</p><span className="go"><ArrowRight size={17} /></span><Illo kind="chat" /></a>
        <a className="course c-lilac wide" href="#/mocks"><h3>Mock Arena</h3><p>{tests} ta test, taymer va izohlar</p><span className="go"><ArrowRight size={17} /></span><span className="tag">Bepul</span><Illo kind="clock" /></a>
      </div>

      {bot && (
        <a className="card tg-promo" href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer">
          <span className="blob blue"><Send /></span>
          <div><h3 style={{ margin: 0 }}>Telegram’da ham</h3><p className="muted" style={{ margin: '4px 0 0' }}>@{bot}</p></div>
          <ArrowRight size={18} />
        </a>
      )}

      <div className="section-title"><h2>Savollar</h2></div>
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
  const hello = h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech';
  const quick = [
    { href: '#/learn', icon: BookOpenCheck, label: 'Darslar', c: 'var(--coral)' },
    { href: '#/coach', icon: Bot, label: 'AI ustoz', c: 'var(--brand)' },
    { href: '#/exam', icon: Target, label: 'Imtihon', c: 'var(--orange)' },
    { href: '#/mocks', icon: Timer, label: 'Mock', c: 'var(--teal)' },
    { href: '#/grammar', icon: Puzzle, label: 'Grammar', c: 'var(--blue)' },
    { href: '#/games', icon: Gamepad2, label: 'O‘yinlar', c: 'var(--pink)' },
    { href: '#/league', icon: Trophy, label: 'Liga', c: 'var(--yellow)' },
    { href: '#/mistakes', icon: ClipboardList, label: 'Xatolar', c: 'var(--red)' },
    { href: '#/homework', icon: ListChecks, label: 'Vazifa', c: 'var(--green)' },
    { href: '#/results', icon: LineChart, label: 'Natijalar', c: 'var(--ink-2)' },
  ];

  return (
    <div>
      <div className="hello">
        <span className="avatar sm" aria-hidden="true">{(acc?.nickname ?? 'B').slice(0, 1).toUpperCase()}</span>
        <div className="grow">
          <h2>{hello}{acc?.nickname ? `, ${acc.nickname}` : ''}!</h2>
          <small>{lvl ? `Daraja ${lvl}` : 'Daraja aniqlanmagan'} · {Math.round(lp.pct * 100)}% keyingi bosqichgacha</small>
        </div>
      </div>

      {!lvl && (
        <div className="banner">
          <div><h3><Compass size={20} style={{ verticalAlign: -4 }} /> Darajangizni aniqlang</h3><p>3 daqiqalik test — kunlik reja shunga qarab tuziladi.</p></div>
          <a className="btn primary" href="#/placement">Boshlash <ArrowRight size={18} /></a>
        </div>
      )}

      <section className="lvlcard">
        <h3>{lvl ? `${lvl} · ${LEVEL_INFO[lvl].name}` : 'Bandly'} — {lp.level}-bosqich</h3>
        <p>{left === 0 ? 'Bugungi maqsad bajarildi — seriya saqlandi!' : `Bugungi maqsadgacha ${left} XP`}</p>
        <div className="slider" role="progressbar" aria-valuemin={0} aria-valuemax={lp.span} aria-valuenow={lp.into} aria-label="Keyingi bosqichgacha XP"><i style={{ width: `${lp.pct * 100}%` }} /><b style={{ left: `${Math.max(4, Math.min(96, lp.pct * 100))}%` }} /></div>
        <Illo kind="trophy" />
      </section>

      <nav className="quick" aria-label="Bo‘limlar">
        {quick.map((q) => <a key={q.href} href={q.href}><span className="q-ico" style={{ color: q.c }}><q.icon /></span>{q.label}</a>)}
      </nav>

      <div className="dash2">
        <a className="cont" href={nl ? `#/learn/${nl.id}` : '#/learn'}>
          <small>{nl ? 'Davom ettirish' : 'Darslar'}</small>
          <h3>{nl ? nl.titleUz : 'Darslar xaritasi'}</h3>
          <p>{nu ? `${nu.level} · ${nu.titleUz}` : `${passed}/${total} dars o‘tildi`}</p>
          <span className="btn primary sm">Boshlash <ArrowRight size={16} /></span>
          <Illo kind="books" />
        </a>
        <div className="twin">
          <a className="stat2 s-lilac" href="#/learn"><div className="s-top"><span><BookOpenCheck size={20} /></span><span className="go"><ArrowRight size={15} /></span></div><b>{passed}</b><small>/ {total} dars</small></a>
          <a className="stat2 s-mint" href="#/league"><div className="s-top"><span><Flame size={20} /></span><span className="go"><ArrowRight size={15} /></span></div><b>{streak}</b><small>kunlik seriya</small></a>
        </div>
      </div>

      <section className="card">
        <div className="daytask">
          <PRing value={p.dailyXp} max={p.dailyGoal} size={78} stroke={8} color="var(--coral)" label={`Kunlik maqsad ${p.dailyXp}/${p.dailyGoal} XP`}><b style={{ fontSize: 19 }}>{Math.round(Math.min(1, p.dailyXp / Math.max(1, p.dailyGoal)) * 100)}%</b></PRing>
          <div><h3>Kunlik maqsad</h3><p>{Math.min(p.dailyXp, p.dailyGoal)} / {p.dailyGoal} XP · bu hafta {Object.entries(p.activity).filter(([k]) => Date.now() - new Date(k).getTime() < 7 * 86400000).reduce((s, [, v]) => s + v, 0)} XP</p></div>
        </div>
        <WeekBars activity={p.activity} />
      </section>

      {!acc && <p className="notice">Progress hozir faqat shu qurilmada. <a href="#/profile">Hisob oching</a> — boshqa qurilmada ham ochiladi.</p>}
      <PlanCard />
      <QuestsCard />
      <ProgressCard />
      <DailyCards />
    </div>
  );
}
