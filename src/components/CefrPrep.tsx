import { BookOpen, Headphones, Mic, PenLine } from 'lucide-react';
import { useState } from 'react';
import { UZ_MULTILEVEL as F } from '../content/examFormats';
import type { WritingTask } from '../content/lessons/types';
import { loadSkills } from '../lib/skillCheck';
import { useProfile } from '../lib/store';
import { LessonWrite } from './LessonWrite';

// Bandly's own practice prompts in the official word ranges (task TYPES of the real exam are not verified, so prompts are generic).
const TASKS: { title: string; task: WritingTask }[] = [
  { title: '1-topshiriq · 100–150 so‘z', task: { promptUz: 'Do‘stingizga xat yozing: yaqinda borgan bayram yoki tadbir haqida gapirib bering, nima yoqqanini va keyingi safar birga borishni taklif qiling.', minWords: 100, maxWords: 150, require: [], model: '' } },
  { title: '2-topshiriq · 200–250 so‘z', task: { promptUz: '“Ba’zi odamlar universitetda o‘qish ishga kirish uchun shart emas deb hisoblaydi.” Bu fikrga qanchalik qo‘shilasiz? Sabablar va misollar keltiring.', minWords: 200, maxWords: 250, require: [{ re: String.raw`\b(because|since|therefore|however|although|for example|for instance|in my opinion|I believe|I think)\b`, labelUz: 'fikrni asoslovchi bog‘lovchi (because, however, for example…)' }], model: '' } },
];

/** CEFR Multilevel (Uzbekistan): verified format + preparation tools. No official materials are reproduced and no Multilevel score is invented. */
export function CefrPrep() {
  const p = useProfile();
  const s = loadSkills();
  const [w, setW] = useState<number | null>(null);
  return (
    <div>
      <div className="card">
        <h3>{F.nameUz}</h3>
        <p className="muted" style={{ fontSize: 13 }}>Darajalar: {F.levels.value.join(', ')} · rasmiy manbalar {F.verifiedAt} sanasida tekshirildi.</p>
        <div className="stack">
          {F.sections.map((x) => (
            <div key={x.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <span><b>{x.nameUz}</b> <span className="muted">· {x.items.value}</span></span><b>{x.minutes.value} daq</b>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 10 }}><b>Ball chegaralari ({F.scoring.value.scale}):</b> {F.scoring.value.cutoffs.map((c) => `${c.level}: ${c.range}`).join(' · ')}</p>
        <ul className="muted" style={{ fontSize: 13 }}>{F.notesUz.map((n) => <li key={n}>{n}</li>)}</ul>
        <p className="muted" style={{ fontSize: 13 }}>Manbalar: {F.sources.map((x, i) => <span key={x.url}>{i ? ' · ' : ''}<a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></span>)}</p>
      </div>

      <div className="card">
        <h3>Sizning holatingiz (yo‘naltiruvchi)</h3>
        <p className="row">
          <span className="pill">General English: {p.level ?? '—'}</span>
          <span className="pill">Reading: {s.reading?.level ?? '—'}</span>
          <span className="pill">Listening: {s.listening?.level ?? '—'}</span>
        </p>
        <p className="muted" style={{ fontSize: 13 }}>Bu Bandly’ning taxminiy CEFR darajalari; Multilevel balli emas va uni bashorat qilmaydi.</p>
        {!s.reading && <a className="btn sm" href="#/skills">Reading / Listening darajasini aniqlash</a>}
      </div>

      <div className="card">
        <h3>Tayyorgarlik</h3>
        <div className="stack">
          <a className="path-step" href="#/mocks/reading"><b><BookOpen size={16} /> O‘qish</b><span>Bepul Reading mocklar (IELTS formatida, umumiy o‘qish ko‘nikmasi uchun) va B1–C1 darslar</span></a>
          <a className="path-step" href="#/mocks/listening"><b><Headphones size={16} /> Tinglab tushunish</b><span>Bepul Listening mocklar va ko‘nikmalar tekshiruvi</span></a>
          <a className="path-step" href="#/coach"><b><Mic size={16} /> Gapirish</b><span>AI ustoz bilan suhbat va “Jim qolma!” — ravon gapirish mashqi</span></a>
        </div>
        <h3 style={{ marginTop: 14 }}><PenLine size={16} /> Yozma ish mashqi (rasmiy so‘z hajmida)</h3>
        <p className="row">{TASKS.map((t, i) => <button key={t.title} type="button" className={`chipbtn ${w === i ? 'on' : ''}`} onClick={() => setW(i)}>{t.title}</button>)}</p>
        {w !== null && <LessonWrite key={w} task={TASKS[w]!.task} />}
      </div>
    </div>
  );
}
