import type { Graded, PublicQuestion } from '../content/mockShared';
import { Flag } from 'lucide-react';
import type { Answer } from '../lib/grade';

interface Props {
  groups: { instruction: string; questionIds: number[] }[];
  questions: PublicQuestion[];
  /** Server bahosi: topshirilgandan keyin keladi */
  graded?: Graded | null;
  answers: Record<number, Answer>;
  onChange: (id: number, a: Answer) => void;
  submitted: boolean;
  /** Imtihon rejimi: belgilangan savollar, belgilash tugmasi, savol langari va joriy savol */
  flags?: number[];
  onFlag?: (id: number) => void;
  anchorPrefix?: string;
  current?: number | null;
}

const TFNG = ['True', 'False', 'Not Given'] as const;

export function QuestionList({ groups, questions, answers, onChange, submitted, graded, flags, onFlag, anchorPrefix, current }: Props) {
  return (
    <div>
      {groups.map((g) => (
        <div key={g.instruction}>
          <div className="instr">{g.instruction}</div>
          {(() => {
            const first = questions.find((x) => x.id === g.questionIds[0]);
            if (first?.type !== 'match' || first.options.every((o) => o.length <= 2)) return null;
            return <div className="notice" style={{ margin: '8px 0' }}><b>List of Headings</b><ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>{first.options.map((o) => <li key={o} style={{ listStyle: 'none', marginLeft: -18 }}>{o}</li>)}</ul></div>;
          })()}
          {g.questionIds.map((id) => {
            const q = questions.find((x) => x.id === id)!;
            const a = answers[id];
            const g = submitted ? graded?.[id] : undefined;
            const ok = !!g?.correct;
            const flagged = !!flags?.includes(id);
            const cls = (g ? (ok ? 'q correct' : 'q wrong') : 'q') + (flagged ? ' flagged' : '') + (current === id ? ' current' : '');
            return (
              <div className={cls} key={id} id={anchorPrefix ? `${anchorPrefix}${id}` : undefined}>
                <div className="q-head">
                  <span><b>{id}.</b> {q.text}</span>
                  {onFlag && (
                    <button type="button" className={`flag-btn${flagged ? ' on' : ''}`} onClick={() => onFlag(id)} aria-pressed={flagged} aria-label={flagged ? `${id}-savol belgisini olib tashlash` : `${id}-savolni belgilash`} title="Keyinroq qaytish uchun belgilash">
                      <Flag size={15} />
                    </button>
                  )}
                </div>
                {q.type === 'tfng' &&
                  TFNG.map((opt) => (
                    <label key={opt}>
                      <input type="radio" name={`q${id}`} disabled={submitted} checked={a === opt} onChange={() => onChange(id, opt)} /> {opt}
                    </label>
                  ))}
                {q.type === 'mcq' &&
                  q.options.map((opt, i) => (
                    <label key={opt}>
                      <input type="radio" name={`q${id}`} disabled={submitted} checked={a === i} onChange={() => onChange(id, i)} /> {String.fromCharCode(65 + i)}. {opt}
                    </label>
                  ))}
                {q.type === 'match' && (
                  <select disabled={submitted} value={typeof a === 'number' ? a : ''} onChange={(e) => onChange(id, e.target.value === '' ? undefined : Number(e.target.value))} style={{ marginTop: 6, maxWidth: '100%' }}>
                    <option value="">Tanlang…</option>
                    {q.options.map((opt, i) => <option key={opt} value={i}>{opt}</option>)}
                  </select>
                )}
                {q.type === 'fill' && (
                  <input type="text" autoComplete="off" disabled={submitted} value={typeof a === 'string' ? a : ''} onChange={(e) => onChange(id, e.target.value)} />
                )}
                {g && (
                  <div className="evidence">
                    {ok ? <span className="ok">To‘g‘ri</span> : <span className="bad">Noto‘g‘ri</span>} — to‘g‘ri javob: <b>{g.answer}</b>
                    <div>{g.evidence}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
