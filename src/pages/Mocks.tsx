import { BookOpen, FlaskConical, GraduationCap, Headphones, Target } from 'lucide-react';
import { GuestMockResume } from '../components/GuestMockResume';
import { Illo } from '../components/Illo';
import { listeningTests, readingTests } from '../content/mockTests';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { openExamTab } from '../lib/examTab';
import { L } from '../i18n';

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
    { href: '#/mocks/reading', icon: BookOpen, sq: 'sky', tag: L('IELTS · bepul'), title: L('Reading testlari'), meta: L('{0} ta', [ielts('reading')]) },
    { href: '#/mocks/listening', icon: Headphones, sq: 'coral', tag: L('IELTS · bepul'), title: L('Listening testlari'), meta: L('{0} ta', [ielts('listening')]) },
    { href: '#/exam', icon: GraduationCap, sq: 'mint', tag: L('CEFR Multilevel · bepul'), title: L('CEFR mashq testlari'), meta: L('{0} ta', [cefr]), tab: 'cefr' as const },
    { href: '#/mocks/full', icon: FlaskConical, sq: 'lilac', tag: L('Bepul'), title: L('To‘liq imtihon simulyatsiyasi'), meta: L('4 bo‘lim') },
    { href: '#/exam', icon: Target, sq: 'butter', tag: L('Tahlil'), title: L('IELTS tayyorgarligim'), meta: L('band') },
  ];
  return (
    <div>
      <div className="card page-head with-illo">
        <h2 style={{ margin: 0 }}>{L('Mock')} <em className="it">{L('Arena')}</em></h2>
        <p style={{ margin: '6px 0 12px' }}>{L('Imtihon sharoiti: taymer, avtomatik baho va izohlar.')}</p>
        <div className="stat-pills">
          <span><b>{solved}<small>/{total}</small></b>{L('Yechilgan')}</span>
          <span><b>{res.length}</b>{L('Urinish')}</span>
          <span><b>{avg !== null ? avg.toFixed(1) : '—'}</b>{L('O‘rtacha')}</span>
        </div>
        <Illo kind="clock" size={128} />
      </div>
      <GuestMockResume />
      <div className="lrows">
        {rows.map((r) => (
          <a key={r.title} className="lrow" href={r.href} onClick={() => r.tab && openExamTab(r.tab)}>
            <span className={`sq ${r.sq}`}><r.icon /></span>
            <span className="grow"><small>{r.tag}</small><b>{r.title}</b></span>
            <span className="meta">{r.meta}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
