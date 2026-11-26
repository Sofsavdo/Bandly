// Mock natijasi asosidagi qisqa shaxsiy reja (src/lib/mockPlan.ts): zaif savol turlari → mos dars, keyingi mock, kerak bo'lsa daraja testi.
// Taxminiy tavsiya: natija yoki band kafolatlanmaydi. Bajarilganlik mavjud progressdan (dars o'tilgan sana, natijalar tarixi) olinadi.
import { CalendarCheck, Check } from 'lucide-react';
import { useMemo } from 'react';
import { listeningTests, readingTests } from '../content/mockTests';
import type { Question } from '../content/types';
import { freeLeft, freePerDay } from '../lib/freeQuota';
import { loadProgress } from '../lib/lessons';
import { buildMockPlan, isTaskDone, type Kind, type PlanTask } from '../lib/mockPlan';
import { loadAnswers } from '../lib/onboarding';
import { DEFAULT_PREFS, loadPrefs } from '../lib/planPrefs';
import { loadResults } from '../lib/storage';
import { allowDirect } from '../lib/setupGate';
import { useProfile } from '../lib/store';
import { TYPE_UZ, type TypeRow } from './TestReport';
import { L } from '../i18n';

const dayLabel = (d: number): string => (d === 1 ? L('Bugun') : d === 2 ? L('Ertaga') : L('{0}-kun', [d]));
const SKILL: Record<Kind, string> = { reading: 'Reading', listening: 'Listening' };

function reason(t: PlanTask): string {
  const q = t.params.qtype ? TYPE_UZ[t.params.qtype as Question['type']] : '';
  switch (t.reason) {
    case 'weak_type': return L('«{0}» bo‘yicha {1}/{2} to‘g‘ri — shu turga qaratilgan dars', [q, t.params.correct ?? 0, t.params.total ?? 0]);
    case 'prereq': return L('«{0}» bo‘yicha {1}/{2} to‘g‘ri. Avval shu dars: kursda ketma-ketlik shunday', [q, t.params.correct ?? 0, t.params.total ?? 0]);
    case 'next_test': return L('Keyingi test: natijangizni solishtirib ko‘ring');
    case 'other_skill': return L('{0} bo‘yicha hali natija yo‘q', [SKILL[t.params.skill ?? 'reading']]);
    default: return L('Reja aniq darajangizga moslashishi uchun');
  }
}

export function MockPlanCard({ kind, exam, rows, takenTestId, since }: { kind: Kind; exam: 'ielts' | 'cefr'; rows: TypeRow[]; takenTestId: string; since: number }) {
  const p = useProfile();
  const plan = useMemo(() => {
    const res = loadResults();
    const mins = (t: { minutes: number }) => t.minutes;
    return buildMockPlan({
      kind, exam, rows, takenTestId,
      tests: { reading: readingTests.map((t) => ({ id: t.id, title: t.title, level: t.level, exam: t.exam, full: !!t.sections?.length, minutes: mins(t) })), listening: listeningTests.map((t) => ({ id: t.id, title: t.title, level: t.level, exam: t.exam, full: !!t.sections?.length, minutes: mins(t) })) },
      results: { reading: res.filter((r) => r.kind === 'reading'), listening: res.filter((r) => r.kind === 'listening') },
      level: p.level, progress: loadProgress(),
      minutesPerDay: loadAnswers() ? loadPrefs().minutes : DEFAULT_PREFS.minutes,
      freeLeftToday: freeLeft('ielts'), freePerDay: freePerDay('ielts'),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, exam, takenTestId, p.level, rows]);
  if (!plan.length) return null;
  const progress = loadProgress(); const results = loadResults();
  const done = (t: PlanTask) => isTaskDone(t, { passedAt: (id) => progress[id]?.passedAt ?? null, resultAfter: (title, s) => results.some((r) => r.title === title && Date.parse(r.date) >= s), level: p.level, since });
  const doneN = plan.filter(done).length;
  const days = [...new Set(plan.map((t) => t.day))];
  return (
    <section className="card mock-plan">
      <h3><CalendarCheck size={18} style={{ verticalAlign: -3 }} />  {L('Natijangiz asosida shaxsiy reja')} <span className="pill">{doneN}/{plan.length}</span></h3>
      <p className="evidence" style={{ margin: '0 0 8px' }}>{L('Reja shu test natijangizga tayanadi.')}</p>
      {days.map((d) => (
        <div key={d}>
          <h4 className="list-h" style={{ margin: '10px 0 4px' }}>{dayLabel(d)}</h4>
          <div className="stack">
            {plan.filter((t) => t.day === d).map((t) => (
              <a key={t.id} className={`path-step${done(t) ? ' done' : ''}`} href={t.href} onClick={() => allowDirect(t.href)}>
                <b>{done(t) ? <Check size={15} style={{ verticalAlign: -2 }} /> : null} {t.type === 'placement' ? L('Daraja testi (~3 daqiqa)') : t.type === 'lesson' ? L('IELTS darsi: {0}', [t.title]) : t.title}</b>
                <span>{t.minutes}  {L('daq')} · {reason(t)}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
      <p className="muted" style={{ fontSize: 13, margin: '10px 0 0' }}>{L('Darslar bepul kunlik limitga moslab kunlarga bo‘lingan. Mock testlar cheklanmaydi.')} {!loadAnswers() && <a href="#/start">{L('Maqsad va kunlik vaqtni sozlash')}</a>}</p>
    </section>
  );
}
