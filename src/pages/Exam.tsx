import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react';
import { useState } from 'react';
import { Tile } from '../components/Tile';
import { useProfile } from '../lib/store';
import { ReadinessCard } from '../components/ReadinessCard';
import { CefrPrep } from '../components/CefrPrep';
import { SatPrep } from '../components/SatPrep';

const skills = [
  { href: '#/exam/reading', icon: BookOpen, tone: 'blue', title: 'Reading', text: 'Matn va savollar, taymer, dalil izohlari', free: true },
  { href: '#/exam/listening', icon: Headphones, tone: 'red', title: 'Listening', text: 'Tabiiy ovozli audio, forma va test savollari', free: true },
  { href: '#/exam/writing', icon: PenLine, tone: 'orange', title: 'Writing', text: 'Task 1 va Task 2, taymer, tekshiruv va AI baho', free: false },
  { href: '#/exam/speaking', icon: Mic, tone: 'purple', title: 'Speaking', text: 'Jonli ovozli suhbat: Part 1, 2, 3', free: false },
] as const;

export default function Exam() {
  const p = useProfile();
  const [tab, setTab] = useState<'ielts' | 'sat' | 'cefr'>('ielts');
  return (
    <div>
      <div className="card night page-head">
        <h2>Imtihon tayyorgarligi {p.plan.exam && <span className="badge on">{p.planUntil.exam ? 'Obuna faol' : 'Demo'}</span>}</h2>
        <p className="muted" style={{ margin: '4px 0 10px', fontSize: 14 }}>Reading va Listening testlari bepul. Writing, Speaking va AI baholash — Exam Preparation va All Access tariflarida.</p>
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`btn ${tab === 'ielts' ? 'dark' : ''}`} onClick={() => setTab('ielts')}>IELTS</button>
          <button className={`btn ${tab === 'sat' ? 'dark' : ''}`} onClick={() => setTab('sat')}>SAT <span className="badge on">Digital</span></button>
          <button className={`btn ${tab === 'cefr' ? 'dark' : ''}`} onClick={() => setTab('cefr')}>CEFR <span className="badge on">Multilevel</span></button>
        </div>
        
      </div>
      {tab === 'cefr' && <CefrPrep />}
      {tab === 'sat' && <SatPrep />}
      {tab === 'ielts' && <ReadinessCard />}
      {tab === 'ielts' && (
        <div className="grid">
          {skills.map((s) => <Tile key={s.href} href={s.href} icon={s.icon} tone={s.tone} title={s.title} text={s.text} badge={s.free ? <span className="badge on">Bepul</span> : !p.plan.exam && <span className="badge">Tarifda</span>} />)}
        </div>
      )}
    </div>
  );
}
