import { useEffect, useLayoutEffect, type ReactNode } from 'react';
import { Gate } from './components/Gate';
import { useHash } from './components/hooks';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { PaySheet } from './components/PaySheet';
import { Toasts } from './components/Toasts';
import { sectionOf } from './components/nav';
import { setupRoute } from './lib/setupGate';
import { onAccountChange } from './lib/account';
import { SubNav } from './components/SubNav';
import { PlanRunBar } from './components/PlanRunBar';
import { useT } from './i18n';
import Home from './pages/Home';
import Exam from './pages/Exam';
import Mocks from './pages/Mocks';
import Pricing from './pages/Pricing';
import Placement from './pages/Placement';
import Start from './pages/Start';
import Practice from './pages/Practice';
import FullExam from './pages/FullExam';
import Homework from './pages/Homework';
import Results from './pages/Results';
import ShadowHub from './pages/Shadow';
import Profile from './pages/Profile';
import League from './pages/League';
import DuelHub, { DuelRoom } from './pages/Duel';
import Reading from './pages/Reading';
import Listening from './pages/Listening';
import TestList from './pages/TestList';
import { listeningTests, readingTests } from './content/mockTests';
import Grammar from './pages/Grammar';
import Writing from './pages/Writing';
import Speaking from './pages/Speaking';
import Tools from './pages/Tools';
import GamesHub from './pages/games/GamesHub';
import WordRush from './pages/games/WordRush';
import Pairs from './pages/games/Pairs';
import Spell from './pages/games/Spell';
import Learn from './pages/Learn';
import LessonPage from './pages/Lesson';
import SkillCheck from './pages/SkillCheck';
import Coach from './pages/Coach';
import Mistakes from './pages/Mistakes';
import Challenge from './pages/Challenge';
import Boss from './pages/Boss';
import Studio from './pages/Studio';
import Admin from './pages/Admin';
import Creator from './pages/Creator';
import IeltsCourse from './pages/IeltsCourse';
import Groups from './pages/Groups';

const routes: Record<string, () => ReactNode> = {
  '#/': () => <Home />,
  '#/welcome': () => <Home preview />,
  '#/studio': () => <Studio />,
  '#/admin': () => <Admin />,
  '#/creator': () => <Creator />,
  '#/groups': () => <Groups />,
  '#/learn': () => <Learn />,
  '#/skills': () => <SkillCheck />,
  '#/coach': () => <Coach />,
  '#/mistakes': () => <Mistakes />,
  '#/challenge': () => <Challenge />,
  '#/exam': () => <Exam />,
  '#/ielts': () => <IeltsCourse />,
  '#/exam/writing': () => <Gate track="exam"><Writing /></Gate>,
  '#/exam/speaking': () => <Gate track="exam"><Speaking /></Gate>,
  '#/grammar': () => <Grammar />,
  '#/mocks': () => <Mocks />,
  // PXD-09 (owner, 2026-11-15): the full objective mock (Listening + Reading) is free (DR-19); AI-scored Writing/Speaking stay in the plan (their own routes are gated).
  '#/mocks/full': () => <FullExam />,
  '#/games': () => <GamesHub />,
  '#/games/rush': () => <WordRush />,
  '#/games/pairs': () => <Pairs />,
  '#/games/spell': () => <Spell />,
  '#/tools': () => <Tools />,
  '#/pricing': () => <Pricing />,
  '#/league': () => <League />,
  '#/duel': () => <DuelHub />,
  '#/profile': () => <Profile />,
  '#/placement': () => <Placement />,
  '#/start': () => <Start />,
  '#/practice': () => <Practice />,
  '#/homework': () => <Homework />,
  '#/results': () => <Results />,
  '#/shadow': () => <Gate track="exam"><ShadowHub /></Gate>,
};

/** #/exam|mocks/reading|listening[/id] yo'nalishi: ro'yxat yoki bitta test, tegishli obuna bilan */
function testRoute(hash: string): ReactNode | null {
  const m = hash.match(/^#\/(exam|mocks)\/(reading|listening)(?:\/([\w-]+))?$/);
  if (!m) return null;
  const [, track, kind, id] = m as [string, 'exam' | 'mocks', 'reading' | 'listening', string | undefined];
  let body: ReactNode;
  if (!id) body = <TestList track={track} kind={kind} />;
  else if (kind === 'reading') { const t = readingTests.find((x) => x.id === id); body = t ? <Reading test={t} /> : <TestList track={track} kind={kind} />; }
  else { const t = listeningTests.find((x) => x.id === id); body = t ? <Listening test={t} /> : <TestList track={track} kind={kind} />; }
  // Obyektiv Reading/Listening testlari bepul (Mock Arena, DR-19) — ular "Imtihon" bo'limidan ochilganda ham bir xil testlar,
  // shuning uchun u yerda ham qulflanmaydi. Pullik qism: Writing/Speaking va AI baholash.
  void track;
  return <>{body}</>;
}

export default function App() {
  const hash = useHash();
  const t = useT();
  // Har sahifada bitta h1 (ekran o'quvchilar uchun): bo'lim nomi menyudan
  const where = sectionOf(hash);
  const section = where?.page;
  // Menyu bosilganda yangi sahifa har doim tepadan boshlansin
  // Sahifa almashganda tepaga (o'quv xaritasi o'zi hozirgi dars joyini ochadi)
  useLayoutEffect(() => { if (hash !== '#/learn') window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [hash]);
  // Kirgan o'quvchi: avval shaxsiy reja (Bandi uslubi bilan), keyin daraja testi — shundan keyin darslar darajaga qarab ochiladi
  useEffect(() => {
    const check = () => { const to = setupRoute(window.location.hash || '#/'); if (to) window.location.hash = to; };
    const t = setTimeout(check, 600); // hisob progressi tiklanishiga vaqt
    const off = onAccountChange(() => setTimeout(check, 600));
    return () => { clearTimeout(t); off(); };
  }, [hash]);
  const shadowId = hash.match(/^#\/shadow\/([\w-]+)$/)?.[1];
  const lessonId = hash.match(/^#\/learn\/([\w-]+)$/)?.[1];
  const bossUnit = hash.match(/^#\/boss\/([\w-]+)$/)?.[1];
  const duelCode = hash.match(/^#\/duel\/([A-Za-z0-9]{4,8})$/)?.[1];
  const tr = testRoute(hash);
  const page = tr ? tr : lessonId ? <LessonPage key={lessonId} id={lessonId} /> : bossUnit ? <Boss key={bossUnit} unitId={bossUnit} /> : shadowId ? <Gate track="exam"><ShadowHub id={shadowId} /></Gate> : duelCode ? <DuelRoom key={duelCode} code={duelCode.toUpperCase()} /> : (routes[hash] ?? routes['#/'])();
  return (
    <>
      <Header hash={hash} />
      <main className="container">{section && hash !== '#/welcome' && <h1 className="sr-only">{t(section.label)}</h1>}{where && where.section.children.some((c) => c.href === hash) && <SubNav items={where.section.children} hash={hash} />}{page}</main>
      <Footer />
      <PlanRunBar hash={hash} />
      <TabBar hash={hash} />
      <Toasts />
      <PaySheet />
    </>
  );
}
