import { BookOpen, FlaskConical, GraduationCap, Headphones, Target } from 'lucide-react';
import { Illo } from '../components/Illo';
import { listeningTests, readingTests } from '../content/mockTests';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { openExamTab } from '../lib/examTab';

/** Mock Arena: bepul, avtomatik baholanadigan Reading va Listening mocklari; to'liq simulyatsiya (Writing/Speaking bilan) obunada. */
export default function Mocks() {
  const p = useProfile();
  const res = loadResults().filter((r) => r.kind === 'reading' || r.kind === 'listening');
  const solved = new Set(res.map((r) => r.title)).size;
  const total = readingTests.length + listeningTests.length;
  const bands = res.filter((r) => typeof r.band === 'number').slice(0, 6).map((r) => r.band as number);
  const avg = bands.length ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2 : null;
  const ielts = (k: 'reading' | 'listening') => (k === 'reading' ? readingTests : listeningTests).filter((t) => t.exam !== 'cefr').length;
  const cefr = [...readingTests, ...listeningTests].filter((t) => t.exam === 'cefr').length;
  const rows = [
    { href: '#/mocks/reading', icon: BookOpen, sq: 'sky', tag: 'IELTS · bepul', title: 'Reading testlari', meta: `${ielts('reading')} ta` },
    { href: '#/mocks/listening', icon: Headphones, sq: 'coral', tag: 'IELTS · bepul', title: 'Listening testlari', meta: `${ielts('listening')} ta` },
    { href: '#/exam', icon: GraduationCap, sq: 'mint', tag: 'CEFR Multilevel · bepul', title: 'CEFR mashq testlari', meta: `${cefr} ta`, tab: 'cefr' as const },
    { href: '#/mocks/full', icon: FlaskConical, sq: 'lilac', tag: p.plan.mocks ? 'Obunada' : 'Obuna kerak', title: 'To‘liq imtihon simulyatsiyasi', meta: '4 bo‘lim' },
    { href: '#/exam', icon: Target, sq: 'butter', tag: 'Tahlil', title: 'IELTS tayyorgarligim', meta: 'band' },
  ];
  return (
    <div>
      <div className="card page-head with-illo">
        <h2 style={{ margin: 0 }}>Mock <em className="it">Arena</em></h2>
        <p style={{ margin: '6px 0 12px' }}>Imtihon sharoiti: taymer, avtomatik baho va izohlar.</p>
        <div className="row">
          <span className="pill">Yechilgan {solved}/{total}</span>
          <span className="pill">Urinish {res.length}</span>
          <span className="pill">O‘rtacha {avg !== null ? avg.toFixed(1) : '—'}</span>
        </div>
        <Illo kind="clock" size={128} />
      </div>
      <div className="lrows">
        {rows.map((r) => (
          <a key={r.title} className="lrow" href={r.href} onClick={() => r.tab && openExamTab(r.tab)}>
            <span className={`sq ${r.sq}`}><r.icon /></span>
            <span className="grow"><small>{r.tag}</small><b>{r.title}</b></span>
            <span className="meta">{r.meta}</span>
          </a>
        ))}
      </div>
      <p className="evidence" style={{ marginTop: 12 }}>Ballar taxminiy, rasmiy natija emas.</p>
    </div>
  );
}
