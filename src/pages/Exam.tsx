import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react';
import { useState } from 'react';
import { Tile } from '../components/Tile';
import { useProfile } from '../lib/store';
import { ReadinessCard } from '../components/ReadinessCard';
import { BandProgress } from '../components/BandProgress';
import { CefrPrep } from '../components/CefrPrep';
import { SatPrep } from '../components/SatPrep';
import { Illo } from '../components/Illo';
import { takeExamTab, type ExamTab } from '../lib/examTab';
import { IeltsCourseCard } from './IeltsCourse';
import { L } from '../i18n';

const skills = [
  { href: '#/exam/reading', icon: BookOpen, tone: 'blue', title: 'Reading', text: L('Matn va savollar, taymer, dalil izohlari'), free: true },
  { href: '#/exam/listening', icon: Headphones, tone: 'red', title: 'Listening', text: L('Tabiiy ovozli audio, forma va test savollari'), free: true },
  { href: '#/exam/writing', icon: PenLine, tone: 'orange', title: 'Writing', text: L('Task 1 va Task 2, taymer, tekshiruv va AI baho'), free: false },
  { href: '#/exam/speaking', icon: Mic, tone: 'purple', title: 'Speaking', text: L('Jonli ovozli suhbat: Part 1, 2, 3'), free: false },
] as const;

export default function Exam() {
  const p = useProfile();
  const [tab, setTab] = useState<ExamTab>(takeExamTab);
  return (
    <div>
      <div className="card page-head with-illo t-butter">
        <h2>{L('Imtihonga')} <em className="it">{L('tayyorgarlik')}</em> {p.plan.exam && <span className="badge on">{p.planUntil.exam ? L('Obuna faol') : L('Demo')}</span>}</h2>
        <p style={{ margin: '4px 0 6px' }}>{L('Mock testlar — bepul. AI baho: haftasiga 1 ta Writing va 1 ta Speaking bepul, cheksiz — tarifda.')}</p>
        <div className="seg seg-dark" role="tablist" aria-label={L('Imtihon')}>
          {(['ielts', 'cefr', 'sat'] as const).map((k) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{k.toUpperCase()}</button>)}
        </div>
        <Illo kind="target" size={128} />
      </div>
      {tab === 'cefr' && <CefrPrep />}
      {tab === 'sat' && <SatPrep />}
      {tab === 'ielts' && <IeltsCourseCard />}
      {tab === 'ielts' && <BandProgress compact />}
      {tab === 'ielts' && <ReadinessCard />}
      {tab === 'ielts' && (
        <div className="grid">
          {skills.map((s) => <Tile key={s.href} href={s.href} icon={s.icon} tone={s.tone} title={s.title} text={s.text} badge={s.free ? <span className="badge on">{L('Bepul')}</span> : !p.plan.exam && <span className="badge">{L('Haftasiga 1 bepul')}</span>} />)}
        </div>
      )}
    </div>
  );
}
