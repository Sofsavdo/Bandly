import { Flag, NotebookPen, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Question } from '../content/types';
import { gradeAll, isCorrect, type Answer } from '../lib/grade';
import { scaledBand } from '../lib/band';
import type { Cefr } from '../lib/levels';
import { BAND_CAP, capBand } from '../lib/progress';
import { saveResult } from '../lib/storage';
import { addXp, getProfile } from '../lib/store';
import { recordTestAnswers } from '../lib/adaptive/record';
import { clearAttempt, createAttempt, isExpired, loadAttempt, remainingSeconds, saveAttempt, setAnswer, submitAttempt, toggleFlag, unanswered, type ExamAttempt } from '../lib/examAttempt';
import { fmt } from './hooks';
import { QuestionList } from './QuestionList';

const hasFull = (): boolean => { try { return !!localStorage.getItem('bandly.fullexam.v1'); } catch { return false; } };

export interface ExamLeftState { started: boolean; submitted: boolean; attempt: ExamAttempt | null; update: (fn: (a: ExamAttempt) => ExamAttempt) => void }

interface Props {
  kind: 'reading' | 'listening';
  /** Barqaror test identifikatori: urinish shu kalit bilan saqlanadi */
  testId: string;
  title: string;
  minutes: number;
  groups: { instruction: string; questionIds: number[] }[];
  questions: Question[];
  table: ReadonlyArray<readonly [number, number]>;
  /** Test qiyinligi: past darajali testda band yuqori ko'rsatilmaydi */
  level?: Cefr;
  /** started=true bo'lganda ko'rsatiladigan chap panel (matn yoki audio) */
  left: (state: ExamLeftState) => ReactNode;
  intro: ReactNode;
}

/** Imtihon rejimi (Focus mode): global menyu yashiriladi, faqat test qoladi (BANDLY_DESIGN_SYSTEM.md §1.2). */
function useFocusMode(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    document.body.dataset.mode = 'focus';
    return () => { delete document.body.dataset.mode; };
  }, [on]);
}

export function MockTest({ kind, testId, title, minutes, groups, questions, table, level, left, intro }: Props) {
  const key = `${kind}:${testId}`;
  const [attempt, setAttempt] = useState<ExamAttempt | null>(() => loadAttempt(key));
  const [now, setNow] = useState(() => Date.now());
  const [confirm, setConfirm] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [hideTimer, setHideTimer] = useState(false);
  const [announce, setAnnounce] = useState('');
  const [pane, setPane] = useState<'left' | 'right'>('left'); // telefon: "Matn | Savollar" tablari
  const recorded = useRef(false);
  const ids = groups.flatMap((g) => g.questionIds).sort((a, b) => a - b); // savollar paneli raqam tartibida

  const started = attempt !== null;
  const submitted = attempt?.status === 'submitted';
  useFocusMode(started && !submitted);

  const update = useCallback((fn: (a: ExamAttempt) => ExamAttempt) => {
    setAttempt((prev) => {
      if (!prev) return prev;
      const next = fn(prev);
      if (next !== prev) saveAttempt(next);
      return next;
    });
  }, []);

  /** Natijani bir marta yozadi (XP, tarix, mastery). Urinish topshirilgan bo'lsa qayta yozilmaydi. */
  const finalize = useCallback((a: ExamAttempt, auto: boolean) => {
    const done = submitAttempt(a, Date.now(), auto);
    if (done === a) return a;
    saveAttempt(done);
    if (!recorded.current) {
      recorded.current = true;
      const correct = gradeAll(questions, done.answers);
      saveResult({ kind, title, correct, total: questions.length, band: capBand(scaledBand(correct, questions.length, table), level), level });
      addXp(correct * 5 + (correct / questions.length >= 0.8 ? 20 : 0));
      recordTestAnswers(kind, questions.map((q) => ({ type: q.type, correct: isCorrect(q, done.answers[q.id]) })), level, getProfile().level);
    }
    return done;
  }, [kind, level, questions, table, title]);

  // Taymer: har soniyada saqlangan muddatdan hisoblanadi; 0 da avtomatik topshiriladi (sahifa yopilgan bo'lsa ham, qaytib kelganda).
  useEffect(() => {
    if (!attempt || attempt.status !== 'in_progress') return;
    if (isExpired(attempt)) { setAttempt(finalize(attempt, true)); return; }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [attempt, finalize]);
  const left_ = attempt ? remainingSeconds(attempt, now) : minutes * 60;
  useEffect(() => {
    if (attempt?.status === 'in_progress' && left_ === 0) setAttempt(finalize(attempt, true));
  }, [left_, attempt, finalize]);
  // Ekran o'quvchi uchun faqat 10 / 5 / 1 daqiqada e'lon
  useEffect(() => {
    if (!started || submitted) return;
    if (left_ === 600 || left_ === 300 || left_ === 60) setAnnounce(`${left_ / 60} daqiqa qoldi`);
  }, [left_, started, submitted]);

  const go = useCallback((id: number) => {
    setPane('right');
    update((a) => ({ ...a, current: id }));
    const el = document.getElementById(`q-${testId}-${id}`);
    if (el) { el.scrollIntoView({ block: 'center', behavior: 'smooth' }); (el.querySelector('input,select,button') as HTMLElement | null)?.focus({ preventScroll: true }); }
  }, [testId, update]);
  const step = useCallback((d: number) => {
    const cur = attempt?.current ?? ids[0];
    const i = Math.max(0, Math.min(ids.length - 1, ids.indexOf(cur) + d));
    go(ids[i]);
  }, [attempt?.current, go, ids]);

  // Klaviatura: Alt+N / Alt+P — keyingi/oldingi savol, Alt+F — belgilash
  useEffect(() => {
    if (!started || submitted) return;
    const on = (e: KeyboardEvent) => {
      if (!e.altKey) return;
      const k = e.key.toLowerCase();
      if (k === 'n') { e.preventDefault(); step(1); }
      else if (k === 'p') { e.preventDefault(); step(-1); }
      else if (k === 'f') { e.preventDefault(); const cur = attempt?.current ?? ids[0]; update((a) => toggleFlag(a, cur)); }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [started, submitted, step, update, attempt?.current, ids]);

  const begin = () => { recorded.current = false; const a = createAttempt(key, minutes); saveAttempt(a); setAttempt(a); setNow(Date.now()); };
  const restart = () => { clearAttempt(key); recorded.current = false; setAttempt(null); setConfirm(false); };

  if (!attempt) {
    return (
      <div className="card">
        <h2>{title}</h2>
        {intro}
        <p className="pill">{questions.length} ta savol · {minutes} daqiqa{level ? ` · ${level} daraja` : ''}</p>
        <ul className="rules" style={{ marginTop: 10 }}>
          <li>Imtihon rejimida menyu yashiriladi; javoblar avtomatik saqlanadi — sahifa yangilansa ham davom etasiz.</li>
          <li>Vaqt to‘xtamaydi: sahifani yopsangiz ham hisoblanadi, tugaganda test o‘zi topshiriladi.</li>
          <li>Savolni belgilash (⚑), matnni bo‘yash va eslatma yozish mumkin. Klaviatura: Alt+N / Alt+P / Alt+F.</li>
        </ul>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={begin}>Testni boshlash</button>
        </div>
      </div>
    );
  }

  const correct = gradeAll(questions, attempt.answers);
  const rawBand = scaledBand(correct, questions.length, table);
  const band = capBand(rawBand, level);
  const missing = unanswered(attempt, ids);
  const current = attempt.current ?? ids[0];

  return (
    <div className={submitted ? '' : 'exam'}>
      <div className="exam-bar card" role="region" aria-label="Imtihon boshqaruvi">
        <b className="exam-title">{title}</b>
        {!submitted && (
          <span className="exam-timer-wrap">
            {!hideTimer && <span className={`timer ${left_ <= 300 ? 'low' : left_ <= 600 ? 'warn' : ''}`} aria-hidden="true">{fmt(left_)}</span>}
            <button type="button" className="icon-btn sm" onClick={() => setHideTimer((h) => !h)} aria-label={hideTimer ? 'Vaqtni ko‘rsatish' : 'Vaqtni yashirish'}>{hideTimer ? <Eye size={16} /> : <EyeOff size={16} />}</button>
          </span>
        )}
        <span className="sr-only" aria-live="polite">{announce}</span>
        {!submitted && <span className="pill" title="Belgilangan savollar"><Flag size={13} /> {attempt.flags.length}</span>}
        {!submitted && <button type="button" className="btn sm" onClick={() => setNotesOpen((o) => !o)} aria-expanded={notesOpen}><NotebookPen size={15} /> Eslatma</button>}
        {!submitted ? (
          <button className="btn primary sm" onClick={() => setConfirm(true)}>Topshirish</button>
        ) : (
          <button className="btn sm" onClick={restart}>Qayta boshlash</button>
        )}
        {!submitted && <span className="saved muted" aria-live="off">Saqlandi ✓</span>}
      </div>

      {notesOpen && !submitted && (
        <div className="card">
          <label htmlFor={`notes-${testId}`}><b>Eslatmalar</b> <span className="muted">(baholanmaydi)</span></label>
          <textarea id={`notes-${testId}`} rows={4} style={{ width: '100%', marginTop: 6 }} value={attempt.notes} onChange={(e) => { const v = e.target.value; update((a) => ({ ...a, notes: v })); }} />
        </div>
      )}

      {submitted && (
        <div className="card">
          {attempt.autoSubmitted && <p className="notice">Vaqt tugadi — javoblaringiz avtomatik topshirildi.</p>}
          {hasFull() && <p><a className="btn sm primary" href="#/mocks/full">To‘liq imtihonga qaytish</a></p>}
          <div className="score">{correct} / {questions.length}</div>
          <div>
            Taxminiy band: <b>{band.toFixed(1)}</b> <span className="pill">40 ballik shkalaga keltirilgan, rasmiy natija emas</span>
            {level && rawBand > band && <p className="evidence">Bu test {level} darajali, shuning uchun band {BAND_CAP[level].toFixed(1)} dan yuqori ko‘rsatilmaydi: yuqori ball uchun qiyinroq testlarni yeching.</p>}
          </div>
        </div>
      )}

      {!submitted && (
        <div className="exam-tabs" role="tablist" aria-label="Bo‘lim">
          <button type="button" role="tab" aria-selected={pane === 'left'} className={pane === 'left' ? 'on' : ''} onClick={() => setPane('left')}>{kind === 'reading' ? 'Matn' : 'Audio'}</button>
          <button type="button" role="tab" aria-selected={pane === 'right'} className={pane === 'right' ? 'on' : ''} onClick={() => setPane('right')}>Savollar ({ids.length - missing.length}/{ids.length})</button>
        </div>
      )}
      <div className={`split${submitted ? '' : ` pane-${pane}`}`}>
        <div className="card scroll pane-l">{left({ started, submitted, attempt, update })}</div>
        <div className="card scroll pane-r">
          <QuestionList
            groups={groups}
            questions={questions}
            answers={attempt.answers}
            onChange={(id, a) => update((x) => setAnswer(x, id, a))}
            submitted={submitted}
            flags={attempt.flags}
            onFlag={submitted ? undefined : (id) => update((x) => toggleFlag(x, id))}
            anchorPrefix={`q-${testId}-`}
            current={submitted ? null : current}
          />
        </div>
      </div>

      {!submitted && (
        <nav className="exam-nav" aria-label="Savollar paneli">
          <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label="Oldingi savol"><ChevronLeft size={18} /></button>
          <div className="exam-cells">
            {ids.map((id) => {
              const answered = !missing.includes(id);
              const flagged = attempt.flags.includes(id);
              return (
                <button key={id} type="button" onClick={() => go(id)}
                  className={`cell${answered ? ' done' : ''}${flagged ? ' flag' : ''}${id === current ? ' now' : ''}`}
                  aria-label={`Savol ${id}${answered ? ', javob berilgan' : ', javobsiz'}${flagged ? ', belgilangan' : ''}`}
                  aria-current={id === current ? 'true' : undefined}>{id}</button>
              );
            })}
          </div>
          <button type="button" className="icon-btn" onClick={() => step(1)} aria-label="Keyingi savol"><ChevronRight size={18} /></button>
        </nav>
      )}

      {confirm && !submitted && (
        <div className="exam-dialog-backdrop" role="presentation">
          <div className="card exam-dialog" role="dialog" aria-modal="true" aria-labelledby={`sub-${testId}`}>
            <h3 id={`sub-${testId}`}>Testni topshirasizmi?</h3>
            <p>Javob berilgan: <b>{ids.length - missing.length} / {ids.length}</b> · Qolgan vaqt: <b>{fmt(left_)}</b></p>
            {missing.length > 0 && <p className="evidence">Javobsiz: {missing.join(', ')}</p>}
            {attempt.flags.length > 0 && <p className="evidence">Belgilangan: {attempt.flags.join(', ')}</p>}
            <p className="evidence">Topshirgandan keyin javoblarni o‘zgartirib bo‘lmaydi.</p>
            <div className="row">
              <button type="button" className="btn" onClick={() => setConfirm(false)} autoFocus>Qaytish</button>
              <button type="button" className="btn primary" onClick={() => { setAttempt(finalize(attempt, false)); setConfirm(false); }}>Topshirish</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
