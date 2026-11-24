// Test natijasi tahlili: savol turlari bo'yicha, vaqt, javobsiz savollar, oldingi urinishlar va (yetarli ma'lumot bo'lsa) boshqa o'quvchilar bilan solishtirish.
import { BarChart3, Clock, GraduationCap, History, Users } from 'lucide-react';
import type { Question } from '../content/types';
import type { Graded } from '../content/mockShared';
import { loadResults } from '../lib/storage';
import { L } from '../i18n';

export interface MockStats { count: number; avgPct?: number; percentile?: number }
type QType = Question['type'];

export const TYPE_UZ: Record<QType, string> = { tfng: 'True / False / Not Given', mcq: L('Test savollari (A/B/C)'), fill: L('Bo‘sh joyni to‘ldirish'), match: L('Moslashtirish (sarlavha, ma’lumot)') };
/** Zaif savol turi → IELTS kursidagi shu turni o'rgatadigan dars. */
const LESSON: Record<'reading' | 'listening', Partial<Record<QType, { id: string; title: string }>>> = {
  reading: { tfng: { id: 'ie-rs-l4', title: L('True / False / Not Given asoslari') }, mcq: { id: 'ie-rc-l3', title: L('Test savollari: chalg‘ituvchi variantlar') }, fill: { id: 'ie-rs-l5', title: L('Gapni to‘ldirish va so‘z chegarasi') }, match: { id: 'ie-rc-l1', title: L('Matching headings: abzats sarlavhasi') } },
  listening: { fill: { id: 'ie-ls-l2', title: L('Ismlar, sonlar va harflab aytish') }, mcq: { id: 'ie-lc-l1', title: L('Test savollari: eshitilgan paraphrase') }, match: { id: 'ie-lc-l2', title: L('Xarita va reja (map/plan)') } },
};

export interface TypeRow { type: QType; correct: number; total: number }
/** Savol turlari bo'yicha natija (sof funksiya — test qilinadi). */
export function byType(questions: Pick<Question, 'id' | 'type'>[], graded: Graded): TypeRow[] {
  const m = new Map<QType, TypeRow>();
  for (const q of questions) { const r = m.get(q.type) ?? { type: q.type, correct: 0, total: 0 }; r.total++; if (graded[q.id]?.correct) r.correct++; m.set(q.type, r); }
  return [...m.values()];
}
/** Eng zaif tur: kamida 3 savol bo'lgan va ulushi 70% dan past turlar ichida eng pasti. */
export function weakest(rows: TypeRow[]): TypeRow | null {
  return [...rows].filter((r) => r.total >= 3 && r.correct / r.total < 0.7).sort((a, b) => a.correct / a.total - b.correct / b.total)[0] ?? null;
}
const mmss = (ms: number) => { const s = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

export function TestReport({ kind, title, questions, graded, answers, startedAt, submittedAt, minutes, stats }: {
  kind: 'reading' | 'listening'; title: string; questions: Pick<Question, 'id' | 'type'>[]; graded: Graded; answers: Record<number, unknown>;
  startedAt: number; submittedAt: number | null; minutes: number; stats?: MockStats;
}) {
  const rows = byType(questions, graded);
  const weak = weakest(rows);
  const lesson = weak ? LESSON[kind][weak.type] : undefined;
  const blank = questions.filter((q) => answers[q.id] === undefined || answers[q.id] === '').length;
  const used = submittedAt ? submittedAt - startedAt : 0;
  const correct = questions.filter((q) => graded[q.id]?.correct).length;
  const prior = loadResults().filter((r) => r.title === title && r.total > 0).slice(1); // [0] — shu urinish (yangi → eski)
  const best = prior.length ? Math.max(...prior.map((r) => r.correct)) : null;
  return (
    <div className="test-report">
      <h3><BarChart3 size={18} />  {L('Savol turlari bo‘yicha')}</h3>
      <div className="tr-rows">
        {rows.map((r) => {
          const pct = Math.round((r.correct / r.total) * 100);
          return (
            <div key={r.type} className="tr-row">
              <span>{TYPE_UZ[r.type]}</span>
              <span className="tr-bar" aria-hidden="true"><i style={{ width: `${pct}%`, background: pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--peach)' : 'var(--coral)' }} /></span>
              <b>{r.correct}/{r.total}</b>
            </div>
          );
        })}
      </div>
      {weak && <p className="notice"><GraduationCap size={16} />  {L('Eng ko‘p xato: {0} ({1}/{2}).', [TYPE_UZ[weak.type], weak.correct, weak.total])} {lesson && <a href={`#/learn/${lesson.id}`}>{L('IELTS kursidagi dars: {0}', [lesson.title])} →</a>}</p>}
      <p className="row">
        {used > 0 && <span className="pill"><Clock size={13} />  {L('Vaqt: {0} / {1}:00', [mmss(used), minutes])}</span>}
        {blank > 0 && <p className="notice tr-blank">{L('{0} ta savol javobsiz qoldi — imtihonda bo‘sh joy qoldirmang, taxmin qiling', [blank])}</p>}
      </p>
      <h3><History size={18} />  {L('Oldingi urinishlar')}</h3>
      {prior.length === 0 ? <p className="muted">{L('Bu testni birinchi marta yechdingiz.')}</p> : (
        <p>{L('Avval {0} marta yechgansiz. Eng yaxshi natija: {1}/{2}.', [prior.length, best ?? 0, questions.length])} {best !== null && (correct > best ? <b className="ok">{L('Yangi rekord!')}</b> : correct === best ? <span className="muted">{L('Rekordga teng.')}</span> : <span className="muted">{L('Rekorddan {0} ta kam.', [best - correct])}</span>)}</p>
      )}
      <h3><Users size={18} />  {L('Boshqa o‘quvchilar bilan')}</h3>
      {stats?.percentile !== undefined ? (
        <p>{L('Bu testni {0} kishi yechgan, o‘rtacha natija {1}%. Siz ularning {2}% idan yaxshiroq natija ko‘rsatdingiz.', [stats.count, stats.avgPct ?? 0, stats.percentile])}</p>
      ) : <p className="muted">{L('Solishtirish 20 ta urinishdan keyin (hozir: {0}).', [stats?.count ?? 0])}</p>}
    </div>
  );
}
