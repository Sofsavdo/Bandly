import { Target } from 'lucide-react';
import { loadResults } from '../lib/storage';
import { readiness, type ExamSkill } from '../lib/readiness';
import { useProfile } from '../lib/store';
import { L } from '../i18n';

const NAME: Record<ExamSkill, string> = { reading: 'Reading', listening: 'Listening', speaking: 'Speaking' };
const HREF: Record<ExamSkill, string> = { reading: '#/mocks/reading', listening: '#/mocks/listening', speaking: '#/exam/speaking' }; // reading/listening mocks are free

/** IELTS readiness, shown next to — never merged with — the General English level. */
export function ReadinessCard() {
  const p = useProfile();
  const r = readiness(loadResults(), p.target, p.examDate);
  // Hali test yo'q — bo'sh jadval o'rniga "Boshlang'ich band" kartasi yetarli
  if ((['reading', 'listening', 'speaking'] as const).every((k) => !r.skills[k].evidence)) return null;
  return (
    <div className="card">
      <span className="eyebrow"><Target size={15} />  {L('IELTS tayyorgarligi')}</span>
      <div className="stack">
        {(['reading', 'listening', 'speaking'] as const).map((k) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
            <span>{NAME[k]} <span className="muted">· {r.skills[k].evidence ? L('{0} ta natija', [r.skills[k].evidence]) : L('hali test yo‘q')}</span></span>
            <b>{r.skills[k].band?.toFixed(1) ?? '—'}</b>
          </div>
        ))}
      </div>
      <p className="row" style={{ marginTop: 10 }}>
        <span className="pill">{L('Umumiy:')} {r.overall?.toFixed(1) ?? '—'} {L('(taxm.)')}</span>
        <span className="pill">{L('Maqsad:')} {r.target.toFixed(1)}</span>
        {r.gap !== null && <span className="pill">{L('Farq:')} {r.gap.toFixed(1)}</span>}
        {r.daysToExam !== null && r.daysToExam >= 0 && <span className="pill">{L('Imtihongacha')} {r.daysToExam}  {L('kun')}</span>}
      </p>
      {r.weakest && (
        <a className="btn primary" style={{ whiteSpace: 'normal' }} href={HREF[r.weakest]}>
          {r.skills[r.weakest].band === null ? L('{0} bo‘yicha birinchi testni topshiring', [NAME[r.weakest]]) : L('Eng zaif ko‘nikma: {0} — mashq qilish', [NAME[r.weakest]])}
        </a>
      )}
    </div>
  );
}
