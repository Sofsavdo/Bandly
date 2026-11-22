// Bosh sahifa: shaxsiy o'quv tahlili (src/lib/insights.ts). Ko'nikmalar, takrorlanuvchi xatolar, navbatdagi eng foydali mashq
// va NIMA UCHUN aynan u — hammasi o'quvchining o'z ma'lumotidan. Avvalgi tavsiyaning natijasi ham ko'rsatiladi.
import { ArrowRight, Lightbulb, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useMemo } from 'react';
import { ALL_NODES } from '../content/curriculum/inventory';
import { ALL_LESSONS } from '../content/lessons';
import { loadAdaptive } from '../lib/adaptive/store';
import { outcomeOf, recommend, recurringErrors, skillScores, type FollowLog, type Recommendation, type Skill } from '../lib/insights';
import { loadProgress } from '../lib/lessons';
import { dueMistakes, load as loadMistakes } from '../lib/mistakes';
import { loadPrefs } from '../lib/planPrefs';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { trackUser } from '../lib/track';
import { ERR_UZ } from './PlanCard';
import { L } from '../i18n';

const LOG_KEY = 'bandly.insights.v1';
const SKILL_UZ: Record<Skill, string> = { grammar: L('Grammatika'), vocabulary: L('So‘z boyligi'), reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };
const loadLog = (): FollowLog | null => { try { return JSON.parse(localStorage.getItem(LOG_KEY) ?? 'null') as FollowLog | null; } catch { return null; } };
const saveLog = (l: FollowLog) => { try { localStorage.setItem(LOG_KEY, JSON.stringify(l)); } catch { /* saqlab bo'lmadi */ } };

function why(r: Recommendation): string {
  switch (r.reason) {
    case 'mistakes_due': return L('{0} ta xatoingiz takrorlash vaqtiga yetdi. Ularni hozir tuzatish yangi mavzudan ko‘ra ko‘proq foyda beradi.', [r.params.count!]);
    case 'recurring_error': return L('Oxirgi 30 kunda «{0}» bo‘yicha {1} marta xato qildingiz. «{2}» darsi aynan shu xatoni nishonga oladi.', [ERR_UZ[String(r.params.taxonomy)] ?? String(r.params.taxonomy), r.params.count!, r.params.lesson!]);
    case 'weak_skill': return L('{0} — hozircha eng zaif ko‘nikmangiz (taxminan {1}/100). Shu ko‘nikmani mashq qilish umumiy natijani tezroq ko‘taradi.', [SKILL_UZ[r.skill!], r.params.score!]);
    case 'no_evidence': return L('{0} bo‘yicha hali birorta natija yo‘q. Darajangizni bilish uchun avval bir marta o‘lchab olaylik.', [SKILL_UZ[r.skill!]]);
    default: return r.params.lesson ? L('Yo‘lingizdagi keyingi qadam: «{0}».', [r.params.lesson]) : L('Yo‘lingizdagi keyingi qadam.');
  }
}

export function InsightsCard() {
  const p = useProfile();
  const data = useMemo(() => {
    const saved = loadAdaptive();
    const prog = loadProgress();
    const input = {
      mastery: saved.mastery, nodes: ALL_NODES, results: loadResults(), mistakes: loadMistakes(),
      lessons: ALL_LESSONS.map((x) => ({ lesson: x.lesson, level: x.unit.level })),
      passed: new Set(Object.entries(prog).filter(([, v]) => v?.passedAt).map(([k]) => k)),
      goal: loadPrefs().goal, level: p.level ?? null, now: Date.now(),
    };
    const scores = skillScores(input);
    return { scores, errors: recurringErrors(input.mistakes, input.now).slice(0, 3), rec: recommend(input, dueMistakes().length) };
  }, [p.level]);
  const prev = loadLog();
  const outcome = prev ? outcomeOf(prev, data.scores) : null;
  const measured = data.scores.filter((s) => s.score !== null);
  if (!measured.length && !data.errors.length) return null; // ma'lumot yo'q — taxmin ko'rsatmaymiz

  const follow = () => {
    const s = data.scores.find((x) => x.skill === data.rec.skill);
    saveLog({ at: Date.now(), reason: data.rec.reason, skill: data.rec.skill, baseline: s?.score ?? null, evidence: s?.evidence ?? 0 });
    trackUser('insight_follow');
  };
  return (
    <section className="card insights">
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Lightbulb size={18} /> {L('Sizni nima to‘xtatyapti?')}</h3>
      <div className="ins-rec">
        <p style={{ margin: 0 }}>{why(data.rec)}</p>
        <a className="btn primary sm" href={data.rec.href} onClick={follow}>{L('Shu mashqni boshlash')} <ArrowRight size={14} /></a>
      </div>
      {outcome && outcome.state !== 'pending' && prev?.skill && (
        <p className={`ins-out ${outcome.state}`}>
          {outcome.state === 'improved' ? <TrendingUp size={15} /> : outcome.state === 'declined' ? <TrendingDown size={15} /> : <Minus size={15} />}
          {' '}{outcome.state === 'improved' ? L('Avvalgi tavsiyadan keyin {0} {1} ballga oshdi.', [SKILL_UZ[prev.skill], Math.round(outcome.delta)]) : outcome.state === 'declined' ? L('Avvalgi tavsiyadan keyin {0} {1} ballga pasaydi — yana bir bor takrorlang.', [SKILL_UZ[prev.skill], Math.round(-outcome.delta)]) : L('Avvalgi tavsiyadan keyin {0} deyarli o‘zgarmadi.', [SKILL_UZ[prev.skill]])}
        </p>
      )}
      <div className="ins-skills">
        {data.scores.map((s) => (
          <div key={s.skill} className="ins-skill">
            <span>{SKILL_UZ[s.skill]}</span>
            {s.score === null ? <small className="muted">{L('hali ma’lumot yo‘q')}</small> : <><i><b style={{ width: `${s.score}%` }} /></i><small>{s.score}</small></>}
          </div>
        ))}
      </div>
      {data.errors.length > 0 && <p className="muted" style={{ margin: '8px 0 0', fontSize: 13 }}>{L('Takrorlanayotgan xatolar:')} {data.errors.map((e) => `${ERR_UZ[e.taxonomy] ?? e.taxonomy} (${e.count})`).join(', ')}</p>}
      <p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>{L('Ballar taxminiy (0–100): oxirgi natijalaringiz va darslardagi o‘zlashtirishdan hisoblanadi, rasmiy imtihon bahosi emas.')}</p>
    </section>
  );
}
