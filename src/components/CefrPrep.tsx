import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react';
import { useState } from 'react';
import { UZ_MULTILEVEL as F } from '../content/examFormats';
import type { WritingTask } from '../content/lessons/types';
import { listeningTests, readingTests } from '../content/mockTests';
import { loadSkills } from '../lib/skillCheck';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { LessonWrite } from './LessonWrite';
import { L } from '../i18n';

// Sellzen's own practice prompts in the official word ranges (task TYPES of the real exam are not verified, so prompts are generic).
const TASKS: { title: string; task: WritingTask }[] = [
  { title: L('1-topshiriq · 100–150 so‘z'), task: { promptUz: L('Do‘stingizga xat yozing: yaqinda borgan bayram yoki tadbir haqida gapirib bering, nima yoqqanini va keyingi safar birga borishni taklif qiling.'), minWords: 100, maxWords: 150, require: [], model: '' } },
  { title: L('2-topshiriq · 200–250 so‘z'), task: { promptUz: L('“Ba’zi odamlar universitetda o‘qish ishga kirish uchun shart emas deb hisoblaydi.” Bu fikrga qanchalik qo‘shilasiz? Sabablar va misollar keltiring.'), minWords: 200, maxWords: 250, require: [{ re: String.raw`\b(because|since|therefore|however|although|for example|for instance|in my opinion|I believe|I think)\b`, labelUz: L('fikrni asoslovchi bog‘lovchi (because, however, for example…)') }], model: '' } },
];

/** Barcha CEFR mashq testlari: keyingi topshirilmagani katta tugma, qolganlari raqamli qator (✓ — topshirilgan). */
function CefrSet({ kind, icon, label, meta }: { kind: 'reading' | 'listening'; icon: React.ReactNode; label: (n: number) => string; meta: string }) {
  const tests = (kind === 'reading' ? readingTests : listeningTests).filter((t) => t.exam === 'cefr');
  const done = new Set(loadResults().filter((r) => r.kind === kind).map((r) => r.title));
  if (!tests.length) return null;
  const next = Math.max(0, tests.findIndex((t) => !done.has(t.title)));
  return (
    <div>
      <a className="path-step" href={`#/mocks/${kind}/${tests[next]!.id}`}><b>{icon}  {label(next + 1)}</b><span>{meta}</span></a>
      {tests.length > 1 && <p className="row" style={{ marginTop: 6 }}>{tests.map((t, i) => <a key={t.id} className={`chipbtn ${i === next ? 'on' : ''}`} href={`#/mocks/${kind}/${t.id}`} aria-label={label(i + 1)}>{i + 1}{done.has(t.title) ? ' ✓' : ''}</a>)}</p>}
    </div>
  );
}

/** CEFR Multilevel (Uzbekistan): verified format + preparation tools. No official materials are reproduced and no Multilevel score is invented. */
export function CefrPrep() {
  const p = useProfile();
  const s = loadSkills();
  const [w, setW] = useState<number | null>(null);
  return (
    <div>
      <div className="card">
        <h3>{F.nameUz}</h3>
        <div className="stack">
          {F.sections.map((x) => (
            <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <span><b>{x.nameUz}</b> <span className="muted">· {x.items.value}</span></span><b>{x.minutes.value}  {L('daq')}</b>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 10 }}><b>{L('Ball chegaralari (')}{F.scoring.value.scale}):</b> {F.scoring.value.cutoffs.map((c) => `${c.level}: ${c.range}`).join(' · ')}</p>
        <details className="fold"><summary className="muted" style={{ fontSize: 13 }}>{L('Manbalar va izohlar')}</summary>
        <ul className="muted" style={{ fontSize: 13 }}>{F.notesUz.map((n) => <li key={n}>{n}</li>)}</ul>
        <p className="muted" style={{ fontSize: 13 }}>{L('Manbalar:')} {F.sources.map((x, i) => <span key={x.url}>{i ? ' · ' : ''}<a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></span>)}</p>
        </details>
      </div>

      <div className="card">
        <h3>{L('Sizning holatingiz (yo‘naltiruvchi)')}</h3>
        <p className="row">
          <span className="pill">{L('General English:')} {p.level ?? '—'}</span>
          <span className="pill">{L('Reading:')} {s.reading?.level ?? '—'}</span>
          <span className="pill">{L('Listening:')} {s.listening?.level ?? '—'}</span>
        </p>
        {!s.reading && <a className="btn sm" href="#/skills">{L('Reading / Listening darajasini aniqlash')}</a>}
      </div>

      <div className="card">
        <h3>{L('Tayyorgarlik')}</h3>
        <div className="stack">
          <CefrSet kind="reading" icon={<BookOpen size={16} />} label={(n) => L('O‘qish — mashq testi {0}', [n])} meta={L('35 savol · 60 daqiqa · B1→C1 matnlar · bepul')} />
          <CefrSet kind="listening" icon={<Headphones size={16} />} label={(n) => L('Tinglab tushunish — mashq testi {0}', [n])} meta={L('35 savol · 45 daqiqa · 5 qism, turli talaffuzlar · bepul')} />
          <a className="path-step" href="#/coach"><b><Mic size={16} />  {L('Gapirish')}</b><span>{L('Sellzen bilan suhbat va “Jim qolma!” — ravon gapirish mashqi')}</span></a>
        </div>
        <h3 style={{ marginTop: 14 }}><PenLine size={16} />  {L('Yozma ish mashqi')}</h3>
        <p className="row">{TASKS.map((t, i) => <button key={t.title} type="button" className={`chipbtn ${w === i ? 'on' : ''}`} onClick={() => setW(i)}>{t.title}</button>)}</p>
        {w !== null && <LessonWrite key={w} task={TASKS[w]!.task} />}
      </div>
    </div>
  );
}
