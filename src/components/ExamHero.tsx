// Bosh sahifadagi imtihon bloki: maqsad, imtihongacha qolgan kunlar va hozirgi taxminiy ball (natijalaringizdan).
import { CalendarDays, Target } from 'lucide-react';
import { CEFR, type Cefr } from '../lib/levels';
import { loadAnswers } from '../lib/onboarding';
import { loadPrefs } from '../lib/planPrefs';
import { LEVEL_BAND, currentBand } from '../lib/progress';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { PRing } from './PRing';
import { examPlan, type FocusSkill } from '../lib/examPlan';
import type { ResultRecord } from '../lib/storage';
import { L } from '../i18n';

const SK: Record<FocusSkill | 'revision', string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking', revision: L('takrorlash va dam olish') };
/** Imtihongacha: real imkoniyat (taxminiy), haftalik bosqichlar va keyingi mock. Kunlik vazifalar PlanCard'da qoladi. */
function PlanDetails({ examDate, current, target, results }: { examDate: string | null; current: number | null; target: number; results: ResultRecord[] }) {
  const t = examDate ? Date.parse(`${examDate}T00:00:00+05:00`) : NaN;
  if (!Number.isFinite(t)) return null;
  const lastBand = (k: ResultRecord['kind']) => results.find((r) => r.kind === k && typeof r.band === 'number')?.band ?? null;
  const skills: FocusSkill[] = ['reading', 'listening', 'writing', 'speaking'];
  const weakest = [...skills].sort((a, b) => (lastBand(a) ?? -1) - (lastBand(b) ?? -1)).slice(0, 2);
  const mockAt = results.filter((r) => r.kind === 'reading' || r.kind === 'listening').map((r) => Date.parse(r.date)).filter(Number.isFinite).sort((a, b) => b - a)[0] ?? null;
  const plan = examPlan({ examAt: t, now: Date.now(), minutesPerDay: loadPrefs().minutes, current, target, weakest, lastMockAt: mockAt });
  if (plan.risk === 'past' || plan.daysLeft === null) return null;
  const RISK: Record<string, string> = {
    reached: L('Hozirgi natijangiz maqsadga yetgan. Darajani ushlab turish uchun mock va takrorlashni davom ettiring.'),
    ok: L('Tanlagan vaqtingiz bilan maqsadga yetasiz: {0} soat o‘qish imkoni bor, kerak — {1} soat.', [plan.availableHours ?? 0, plan.neededHours ?? 0]),
    tight: L('Vaqt zich: {0} soat o‘qish imkoni bor, kerak — {1} soat. Kunlik vaqtni oshirsangiz, ulgurasiz.', [plan.availableHours ?? 0, plan.neededHours ?? 0]),
    unlikely: L('Shu sana va kunlik vaqt bilan maqsadga yetish qiyin: {0} soat bor, kerak — {1} soat. Sanani surish, kunlik vaqtni oshirish yoki oraliq maqsad qo‘yishni tavsiya qilamiz.', [plan.availableHours ?? 0, plan.neededHours ?? 0]),
    unknown: L('Imkoniyatni baholash uchun avval bitta mock test topshiring — hozirgi natijangiz noma’lum.'),
  };
  return (
    <details className="eh-plan fold">
      <summary>{L('Tayyorgarlik rejasi')}</summary>
      <p className={`eh-risk ${plan.risk}`}>{RISK[plan.risk]}</p>
      <ol className="eh-weeks">{plan.milestones.slice(0, 6).map((m) => <li key={m.week}><b>{L('{0}-hafta', [m.week])}</b> {L('Asosiy e’tibor: {0}', [SK[m.focus]])}{m.mock ? ` · ${L('mock test')}` : ''}</li>)}</ol>
      <p className="muted" style={{ fontSize: 12, margin: '6px 0 0' }}>{plan.nextMockInDays === 0 ? L('Keyingi mock: bugun.') : L('Keyingi mock: {0} kundan keyin.', [plan.nextMockInDays ?? 0])} {L('Hisob: haftasiga 5 kun o‘qish va har 0,5 band uchun ~50 soat.')}</p>
    </details>
  );
}

const DAY = 86_400_000;
export const daysLeft = (examDate: string | null, now = Date.now()): number | null => {
  if (!examDate) return null;
  const t = Date.parse(`${examDate}T00:00:00+05:00`);
  return Number.isFinite(t) ? Math.ceil((t - now) / DAY) : null;
};
const bandToCefr = (b: number): Cefr => [...CEFR].reverse().find((l) => LEVEL_BAND[l] <= b) ?? 'A1';

export function ExamHero() {
  const p = useProfile();
  const goal = loadPrefs().goal;
  if (goal === 'general' && !p.examDate) return null;
  const ans = loadAnswers();
  const days = daysLeft(p.examDate);
  const results = loadResults();
  const raw = currentBand(p, results);
  const cur = raw !== null && raw > 0 ? raw : null; // natija yo'q bo'lsa "0.0" emas, "—" ko'rsatiladi
  const exam = goal === 'general' ? 'ielts' : goal;
  const targetLabel = exam === 'ielts' ? `IELTS ${p.target.toFixed(1)}` : exam === 'cefr' ? `CEFR ${ans?.target ?? bandToCefr(p.target)}` : `SAT${ans?.target ? ` ${ans.target}` : ''}`;
  const curLabel = cur === null ? '—' : exam === 'cefr' ? bandToCefr(cur) : exam === 'sat' ? (p.level ?? '—') : cur.toFixed(1);
  return (
    <section className="exam-hero">
      <div className="eh-main">
        <span className="eh-eye"><Target size={15} /> {L('Maqsad:')} {targetLabel}</span>
        {days !== null && days > 0
          ? <p className="eh-days"><b>{days}</b> {L('kun qoldi')}</p>
          : <a className="eh-set" href="#/start"><CalendarDays size={16} /> {days !== null ? L('Imtihon sanasi o‘tdi — yangisini belgilang') : L('Imtihon sanasini belgilang')}</a>}
        <a className="btn sm eh-btn" href="#/mocks">{L('Mock test')}</a>
      </div>
      {exam !== 'sat' && <PlanDetails examDate={p.examDate} current={cur} target={p.target} results={results} />}
      <PRing value={exam === 'sat' || cur === null ? 0 : cur} max={exam === 'sat' ? 1 : p.target} size={76} stroke={7} color="var(--peach)" label={L('Hozirgi natija: {0}', [curLabel])}>
        <div className="eh-ring"><b>{curLabel}</b><small>{L('hozir')}</small></div>
      </PRing>
    </section>
  );
}
