import { Brain } from 'lucide-react';
import { ALL_NODES, skillNodeTitle, topicOfNode } from '../content/curriculum/inventory';
import { ALL_LESSONS } from '../content/lessons';
import { effectiveMastery, stateOf, type MasteryState } from '../lib/adaptive/mastery';
import { loadAdaptive } from '../lib/adaptive/store';
import { TAXONOMY, type TaxonomyId } from '../lib/adaptive/taxonomy';
import { loadSkills } from '../lib/skillCheck';
import { L } from '../i18n';

const STATE_UZ: Record<MasteryState, string> = { new: 'yangi', learning: L('o‘rganilmoqda'), known: 'biladi', needs_revision: L('takrorlash kerak'), mastered: L('o‘zlashtirilgan') };

function SkillLine() {
  const s = loadSkills();
  return (
    <p className="row">
      <span className="pill">{L('Reading:')} {s.reading?.level ?? '—'}</span><span className="pill">{L('Listening:')} {s.listening?.level ?? '—'}</span>
      <a className="btn sm" style={{ whiteSpace: 'normal' }} href="#/skills">{s.reading || s.listening ? L('Qayta tekshirish') : L('Reading / Listening darajasini aniqlash')}</a>
    </p>
  );
}

function titleOf(id: string): string {
  const l = ALL_LESSONS.find((x) => `ge.lesson.${x.lesson.id}` === id);
  if (l) return L('Dars: {0}', [l.lesson.titleUz]);
  const n = ALL_NODES.find((x) => x.id === id);
  if (n?.skill === 'vocabulary') return L('So‘z boyligi · {0}', [n.level]);
  return skillNodeTitle(id) ?? topicOfNode(id) ?? id;
}

/** "My knowledge map": only practised nodes, real mastery values and the error types that repeat most. No numbers are invented. */
export function MasteryCard() {
  const s = loadAdaptive();
  const now = Date.now();
  const rows = Object.entries(s.mastery)
    .map(([id, r]) => ({ id, eff: effectiveMastery(r, now), state: stateOf(r, now), attempts: r.attempts }))
    .sort((a, b) => a.eff - b.eff);
  const counts = new Map<string, number>();
  for (const e of s.errors) counts.set(e, (counts.get(e) ?? 0) + 1);
  const topErrors = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="card">
      <span className="eyebrow"><Brain size={15} />  {L('Bilim xaritam')}</span>
      <SkillLine />
      <p><a className="btn sm" href="#/mistakes">{L('Xatolar ustida ishlash')}</a></p>
      {rows.length === 0 ? (
        <p className="muted">{L('Hali ma’lumot yo‘q — birinchi mashqdan keyin chiqadi.')}</p>
      ) : (
        <>
          <p className="evidence">{L('Javoblar, qiyinlik va unutish hisobga olinadi.')}</p>
          <div className="stack">
            {rows.map((r) => (
              <div key={r.id} className="skill" style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 4 }}>
                <span>{titleOf(r.id)} <span className="muted">· {STATE_UZ[r.state]} · {r.attempts}  {L('javob')}</span></span>
                <b>{Math.round(r.eff * 100)}%</b>
                <div className="bar" style={{ gridColumn: '1 / -1' }}><i style={{ width: `${Math.round(r.eff * 100)}%` }} /></div>
              </div>
            ))}
          </div>
          {topErrors.length > 0 && (
            <>
              <h3 style={{ marginTop: 14 }}>{L('Ko‘p takrorlanayotgan xatolar (oxirgi')} {s.errors.length}  {L('ta xato ichida)')}</h3>
              <p className="row">{topErrors.map(([t, c]) => <span key={t} className="pill">{TAXONOMY[t as TaxonomyId] ?? t} · {c}</span>)}</p>
            </>
          )}
        </>
      )}
    </div>
  );
}
