// Bosh sahifadagi imtihon bloki: maqsad, imtihongacha qolgan kunlar va hozirgi taxminiy ball (natijalaringizdan).
import { CalendarDays, Target } from 'lucide-react';
import { CEFR, type Cefr } from '../lib/levels';
import { loadAnswers } from '../lib/onboarding';
import { loadPrefs } from '../lib/planPrefs';
import { LEVEL_BAND, currentBand } from '../lib/progress';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { PRing } from './PRing';
import { L } from '../i18n';

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
  const cur = currentBand(p, loadResults());
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
        <a className="btn sm eh-btn" href="#/mocks">{L('Mock test — ballni aniqlash')}</a>
      </div>
      <PRing value={exam === 'sat' || cur === null ? 0 : cur} max={exam === 'sat' ? 1 : p.target} size={104} stroke={9} color="var(--peach)" label={L('Hozirgi natija: {0}', [curLabel])}>
        <div className="eh-ring"><b>{curLabel}</b><small>{L('hozir')}</small></div>
      </PRing>
    </section>
  );
}
