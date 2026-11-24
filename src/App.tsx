import { Suspense, lazy, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Gate } from './components/Gate';
import { useHash } from './components/hooks';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { TabBar } from './components/TabBar';
import { PaySheet } from './components/PaySheet';
import { Toasts } from './components/Toasts';
import { sectionOf } from './components/nav';
import { authRoute, setupRoute } from './lib/setupGate';
import { getAccount, onAccountChange } from './lib/account';
import { cloudVerified } from './lib/cloud';
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
import Groups from './pages/Groups';
import Login from './pages/Login';
import { L } from './i18n';
// Kam ishlatiladigan og'ir sahifalar alohida bo'laklarda (vite.config.ts manualChunks): xodimlar paneli, sertifikat
// chizish + QR, IELTS kursi kontenti. Ular kerak bo'lganda yuklanadi — asosiy "app" bo'lagi kichrayadi.
const Studio = lazy(() => import('./pages/Studio'));
const Admin = lazy(() => import('./pages/Admin'));
const Creator = lazy(() => import('./pages/Creator'));
const Leads = lazy(() => import('./pages/Leads'));
const IeltsCourse = lazy(() => import('./pages/IeltsCourse'));
const Certificates = lazy(() => import('./pages/Certificates'));
const CertificateVerify = lazy(() => import('./pages/CertificateVerify'));
const Loading = () => <div className="page-loading" role="status" aria-label={L('Yuklanmoqda…')}><div className="card skel" /><div className="card skel" /></div>; // sahifa joyini egallaydi — footer sakramaydi

const routes: Record<string, () => ReactNode> = {
  '#/': () => <Home />,
  '#/welcome': () => <Home preview />,
  '#/studio': () => <Studio />,
  '#/admin': () => <Admin />,
  '#/creator': () => <Creator />,
  '#/leads': () => <Leads />,
  '#/groups': () => <Groups />,
  '#/learn': () => <Learn />,
  '#/skills': () => <SkillCheck />,
  '#/coach': () => <Coach />,
  '#/mistakes': () => <Mistakes />,
  '#/challenge': () => <Challenge />,
  '#/exam': () => <Exam />,
  '#/ielts': () => <IeltsCourse />,
  // B varianti: Writing/Speaking mashqi ochiq; AI baho obunasizlarga haftasiga 1 tadan (server tekshiradi)
  '#/exam/writing': () => <Writing />,
  '#/exam/speaking': () => <Speaking />,
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
  '#/certificates': () => <Certificates />,
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

/** Ommaviy sertifikat tekshirish: /certificate/<ID> (QR-kod) — hash yo'llaridan oldin, hisobsiz. */
export default function App() {
  const certId = typeof location !== 'undefined' ? location.pathname.match(/^\/certificate\/([A-Za-z0-9-]{6,40})\/?$/)?.[1] : undefined;
  return certId ? <Suspense fallback={<Loading />}><CertificateVerify id={certId.toUpperCase()} /></Suspense> : <MainApp />;
}

function MainApp() {
  const hash = useHash();
  const t = useT();
  const [acc, setAcc] = useState(() => !!getAccount());
  useEffect(() => onAccountChange(() => setAcc(!!getAccount())), []);
  // Har sahifada bitta h1 (ekran o'quvchilar uchun): bo'lim nomi menyudan
  const where = sectionOf(hash);
  const section = where?.page;
  // Menyu bosilganda yangi sahifa har doim tepadan boshlansin
  // Sahifa almashganda tepaga (o'quv xaritasi o'zi hozirgi dars joyini ochadi)
  useLayoutEffect(() => { if (hash !== '#/learn') window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [hash]);
  useEffect(() => { document.title = section ? `${t(section.label)} — Sellzen` : L('Sellzen — ingliz tili, IELTS, CEFR, SAT va Sellzen ustoz'); }, [section, t]);
  // Tavsif (meta description) ham tanlangan tilda — ulashilgan havola va brauzer ko'rinishi uchun
  useEffect(() => { document.querySelector('meta[name="description"]')?.setAttribute('content', L('Sellzen: A1 dan C2 gacha ingliz tili darslari, shaxsiy reja, IELTS mock testlar, CEFR va SAT tayyorgarligi hamda shaxsiy ustoz — Sellzen AI.')); }, []);
  // Kirgan o'quvchi: avval shaxsiy reja (Sellzen uslubi bilan), keyin daraja testi — shundan keyin darslar darajaga qarab ochiladi
  useEffect(() => {
    const check = () => { const to = setupRoute(window.location.hash || '#/'); if (to) window.location.hash = to; };
    const t = setTimeout(check, 600);
    // Hisob progressi serverdan o'qilguncha qaror qilinmaydi (setupGate): shu vaqt ichida qayta tekshiramiz (eng ko'pi ~15 s)
    let n = 0;
    const poll = setInterval(() => { if (!getAccount() || cloudVerified() || ++n > 20) { clearInterval(poll); if (cloudVerified()) check(); } }, 750);
    const off = onAccountChange(() => setTimeout(check, 600));
    return () => { clearTimeout(t); clearInterval(poll); off(); };
  }, [hash]);
  const shadowId = hash.match(/^#\/shadow\/([\w-]+)$/)?.[1];
  const lessonId = hash.match(/^#\/learn\/([\w-]+)$/)?.[1];
  const bossUnit = hash.match(/^#\/boss\/([\w-]+)$/)?.[1];
  const duelCode = hash.match(/^#\/duel\/([A-Za-z0-9]{4,8})$/)?.[1];
  const tr = testRoute(hash);
  // Yagona kirish qoidasi (setupGate.authRoute): mehmon ichki sahifada — login sahifasiga, kirgandan keyin — so'ralgan sahifaga
  const redirect = authRoute(hash, acc);
  useLayoutEffect(() => { if (redirect) window.location.replace(redirect); }, [redirect]);
  const wall = !acc ? redirect !== null || hash.startsWith('#/login') : hash.startsWith('#/login');
  const page = wall ? <Login /> : tr ? tr : lessonId ? <LessonPage key={lessonId} id={lessonId} /> : bossUnit ? <Boss key={bossUnit} unitId={bossUnit} /> : shadowId ? <Gate track="exam"><ShadowHub id={shadowId} /></Gate> : duelCode ? <DuelRoom key={duelCode} code={duelCode.toUpperCase()} /> : (routes[hash] ?? routes['#/'])();
  return (
    <>
      <Header hash={hash} />
      <main className="container">{section && hash !== '#/welcome' && <h1 className="sr-only">{t(section.label)}</h1>}{!wall && where && where.section.children.length > 1 && !lessonId && !tr && !bossUnit && !duelCode && <SubNav items={where.section.children} hash={hash} active={where.page.href} />}<Suspense fallback={<Loading />}>{page}</Suspense></main>
      <Footer />
      <PlanRunBar hash={hash} />
      <TabBar hash={hash} />
      <Toasts />
      <PaySheet />
    </>
  );
}
