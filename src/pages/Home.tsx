import { ArrowRight, Bot, Clapperboard, PenLine, Compass, Map as MapIcon, Flame, Mic, Plus, Puzzle, Send, Star, Target, Timer, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authConfig, getAccount } from '../lib/account';
import { ALL_LESSONS } from '../content/lessons';
import { Mascot } from '../components/Mascot';
import { DailyCards } from '../components/DailyCards';
import { ProgressCard } from '../components/ProgressCard';
import { PlanCard } from '../components/PlanCard';
import { QuestsCard } from '../components/QuestsCard';
import { HeroShowcase } from '../components/HeroShowcase';
import { TodayHero } from '../components/TodayHero';
import { listeningTests, readingTests } from '../content/mockTests';
import { vocab } from '../content/vocab';
import { useProfile } from '../lib/store';
import { LEVEL_INFO } from '../lib/levels';

const faq: [string, string][] = [
  ['Nima bepul?', 'Darajani aniqlash testi, Mock Arena (Listening va Reading), so‘z o‘yinlari va darslarning bir qismi bepul. Narxlar va har bir tarifga nima kirishi — «Obuna turlari» sahifasida.'],
  ['Qanday kiraman?', 'Telegram orqali, bir bosishda: parol va SMS kerak emas. Kirsangiz progress, reyting va obuna boshqa qurilmada ham ochiladi.'],
  ['Speaking’da ovozim saqlanadimi?', 'Yo‘q. Ovoz yozib olinmaydi va saqlanmaydi. AI yoqilganda faqat suhbat matni yuboriladi.'],
  ['Baholar rasmiy natijami?', 'Yo‘q. Barcha ballar taxminiy va tayyorgarlikni kuzatish uchun. Rasmiy natijani faqat imtihon markazi beradi.'],
  ['“Qattiq” ustoz nima?', 'Ixtiyoriy, faqat 18+ tasdiqlash bilan: ustoz xatoingiz ustidan kuladi. Oila, din, millat, tashqi ko‘rinish haqida hech qachon gapirmaydi. Imtihon rejimida o‘chiq.'],
];

/** preview=true — #/welcome: yangi foydalanuvchi ko'radigan sahifa (progressdan qat'i nazar; reklama havolasi uchun ham). */
export default function Home({ preview = false }: { preview?: boolean }) {
  const p = useProfile();
  const lvl = p.level;
  const isNew = preview || (!lvl && p.xp === 0);
  const [bot, setBot] = useState<string | null>(null);
  const signedIn = !!getAccount();
  useEffect(() => { void authConfig().then((c) => setBot(c.telegram?.bot ?? null)); }, []);
  const tests = readingTests.length + listeningTests.length;
  const daysLeft = p.examDate ? Math.ceil((new Date(p.examDate).getTime() - Date.now()) / 86400000) : null;
  const low = lvl === 'A1' || lvl === 'A2';
  const more = [
    { icon: Puzzle, title: 'Grammar', text: low ? 'Asoslar: to be, Present Simple' : 'Mavzular bo‘yicha mashq', href: '#/grammar' },
    { icon: PenLine, title: 'Gap tuzish', text: 'Tarjima va so‘z tartibi', href: '#/practice' },
    { icon: Clapperboard, title: 'Eshit va takrorla', text: 'Shadowing va dictant', href: '#/shadow' },
    { icon: Zap, title: 'So‘z o‘yinlari', text: 'Poyga, juftlik, imlo', href: '#/games' },
    { icon: Timer, title: 'Mock Arena', text: `${tests} ta bepul test`, href: '#/mocks' },
    { icon: Mic, title: 'Speaking', text: 'IELTS Part 1–3', href: '#/exam/speaking' },
  ];

  if (isNew) return (
    <div>
      <section className="night hero2">
        <div>
          <span className="eyebrow"><Zap size={15} /> General English · IELTS · CEFR · SAT</span>
          <h1>Ingliz tilini <span className="grad-text">o‘yin kabi</span> o‘rganing — imtihonga ishonch bilan boring</h1>
          <p className="lead">A1 dan C2 gacha darslar xaritasi, sizga moslashadigan kunlik reja, real formatdagi bepul mock testlar va o‘zbekcha tushuntiradigan AI ustoz.</p>
          <div className="cta">
            <a className="btn primary lg" href="#/placement">Darajamni aniqlash <ArrowRight size={18} /></a>
            <a className="btn ghost-light lg" href="#/mocks"><Timer size={18} /> Bepul mock test</a>
          </div>
          <div className="proof">
            <div><b>{ALL_LESSONS.length}</b><span>dars, A1–C2</span></div>
            <div><b>{tests}</b><span>bepul mock test</span></div>
            <div><b>{vocab.length}</b><span>so‘z</span></div>
            <div><b>3 daq</b><span>daraja testi</span></div>
          </div>
        </div>
        <HeroShowcase />
      </section>

      <div className="bento">
        <a className="b-lg" href="#/learn">
          <span className="blob green"><MapIcon /></span>
          <h3>Ingliz tili — darslar xaritasi</h3>
          <p>Har dars: qisqa tushuntirish, mashq, gapirish va tekshiruv. Jon, combo, kunlik vazifalar va bo‘lim oxirida boss sinovi.</p>
          <div className="b-foot"><span className="badge on">Boshlash bepul</span><ArrowRight size={18} /></div>
        </a>
        <a className="b-sm night" href="#/mocks">
          <span className="blob red"><Timer /></span>
          <h3>Mock Arena</h3>
          <p>IELTS va CEFR formatidagi to‘liq testlar, taymer va izohlar bilan.</p>
          <div className="b-foot"><span style={{ color: '#ffd28a' }}>Bepul</span><ArrowRight size={18} /></div>
        </a>
        <a className="b-md" href="#/exam">
          <span className="blob orange"><Target /></span>
          <h3>Imtihonga tayyorgarlik</h3>
          <p>Reading, Listening, Writing, Speaking — AI baholash bilan.</p>
          <div className="b-foot"><span className="muted">IELTS · CEFR · SAT</span><ArrowRight size={18} /></div>
        </a>
        <a className="b-md" href="#/coach">
          <span className="blob blue"><Bot /></span>
          <h3>AI ustoz</h3>
          <p>O‘zbekcha tushuntiradi, xatoingizni topib, to‘g‘ri aytilishini ko‘rsatadi. 5 xil xarakter.</p>
          <div className="b-foot"><span className="muted">Ovozli suhbat</span><ArrowRight size={18} /></div>
        </a>
      </div>

      {bot && (
        <a className="card tg-promo" href={`https://t.me/${bot}`} target="_blank" rel="noopener noreferrer">
          <span className="blob blue"><Send /></span>
          <div><h3 style={{ margin: 0 }}>Telegram’da ham</h3><p className="muted" style={{ margin: '4px 0 0' }}>@{bot} — darslar va mock testlarni Telegram ichida oching.</p></div>
          <ArrowRight size={18} />
        </a>
      )}

      <div className="section-title"><h2>Savollar</h2></div>
      <div className="faq">
        {faq.map(([q, a]) => <details key={q}><summary>{q}<Plus size={20} /></summary><p>{a}</p></details>)}
      </div>
    </div>
  );

  return (
    <div>
      {!lvl && (
        <div className="banner">
          <div><h3><Compass size={20} style={{ verticalAlign: -4 }} /> Darajangizni aniqlang</h3><p>3 daqiqalik test — shunga qarab kunlik reja tuziladi.</p></div>
          <a className="btn lg" href="#/placement">Testni boshlash <ArrowRight size={18} /></a>
        </div>
      )}
      <TodayHero />
      {!signedIn && <p className="notice">Progressingiz hozir faqat shu qurilmada. <a href="#/profile">Hisob oching</a> — XP va darslaringiz hisobga yoziladi va boshqa qurilmada ham ochiladi.</p>}
      <PlanCard />
      <QuestsCard />
      <ProgressCard />
      <DailyCards />
      <section className="card">
        <details className="fold">
          <summary>
            <span className="eyebrow"><MapIcon size={15} /> Boshqa mashqlar</span>
            {lvl && <span className="muted" style={{ marginLeft: 8, fontWeight: 500 }}>Daraja {lvl} · {LEVEL_INFO[lvl].name} · maqsad IELTS {p.target.toFixed(1)}{daysLeft !== null && daysLeft >= 0 ? ` · imtihongacha ${daysLeft} kun` : ''}</span>}
          </summary>
          <div className="path" style={{ marginTop: 10 }}>
            {more.map((s) => <a key={s.title} className="path-step" href={s.href}><s.icon size={22} /><b>{s.title}</b><span>{s.text}</span></a>)}
          </div>
          <div className="row"><a className="btn sm" href="#/homework">Uyga vazifa</a><a className="btn sm" href="#/results">Natijalar</a><a className="btn sm" href="#/placement">Darajani qayta aniqlash</a></div>
        </details>
      </section>
    </div>
  );
}
