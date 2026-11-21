import { Flag, NotebookPen, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Graded, PublicQuestion } from '../content/mockShared';
import type { Answer } from '../lib/grade';
import { scaledBand } from '../lib/band';
import { CertNotice } from './CertNotice';
import type { Cefr } from '../lib/levels';
import { BAND_CAP, capBand } from '../lib/progress';
import { saveResult } from '../lib/storage';
import { addXp, getProfile } from '../lib/store';
import { getAccount, myRefCode } from '../lib/account';
import { renderStory, resultLink, shareCard } from '../lib/shareCard';
import { track } from '../lib/track';
import { recordTestAnswers } from '../lib/adaptive/record';
import { clearAttempt, createAttempt, isExpired, loadAttempt, remainingSeconds, saveAttempt, setAnswer, submitAttempt, toggleFlag, unanswered, type ExamAttempt } from '../lib/examAttempt';
import { fmt } from './hooks';
import { QuestionList } from './QuestionList';
import { TestReport } from './TestReport';
import { L } from '../i18n';

const hasFull = (): boolean => { try { return !!localStorage.getItem('bandly.fullexam.v1'); } catch { return false; } };

export interface ExamLeftState { started: boolean; submitted: boolean; attempt: ExamAttempt | null; update: (fn: (a: ExamAttempt) => ExamAttempt) => void }

interface Props {
  kind: 'reading' | 'listening';
  /** Barqaror test identifikatori: urinish shu kalit bilan saqlanadi */
  testId: string;
  title: string;
  minutes: number;
  groups: { instruction: string; questionIds: number[] }[];
  questions: PublicQuestion[];
  table: ReadonlyArray<readonly [number, number]>;
  /** 'raw' — IELTS band ko'rsatilmaydi (masalan CEFR Multilevel uslubidagi test: rasmiy ball o'ylab topilmaydi) */
  scoring?: 'ielts' | 'raw';
  /** Test qiyinligi: past darajali testda band yuqori ko'rsatilmaydi */
  level?: Cefr;
  /** started=true bo'lganda ko'rsatiladigan chap panel (matn yoki audio) */
  left: (state: ExamLeftState) => ReactNode;
  intro: ReactNode;
}

/** Imtihon rejimi (Focus mode): global menyu yashiriladi, faqat test qoladi (docs/SELLZEN_DESIGN_SYSTEM.md §1.2). */
function useFocusMode(on: boolean): void {
  useEffect(() => {
    if (!on) return;
    document.body.dataset.mode = 'focus';
    return () => { delete document.body.dataset.mode; };
  }, [on]);
}

export function MockTest({ kind, testId, title, minutes, groups, questions, table, level, left, intro, scoring = 'ielts' }: Props) {
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

  /** Topshiradi (baholash serverda — javob kalitlari brauzerda yo'q). */
  const finalize = useCallback((a: ExamAttempt, auto: boolean) => {
    const done = submitAttempt(a, Date.now(), auto);
    if (done === a) return a;
    saveAttempt(done);
    return done;
  }, []);

  // Topshirilgan, lekin hali baholanmagan urinish: serverdan natija olinadi va BIR MARTA yoziladi (XP, tarix, mastery)
  const [gradeErr, setGradeErr] = useState('');
  const [gradeTry, setGradeTry] = useState(0);
  const [cert, setCert] = useState<{ issued: { id: string; type: string }[]; missing: string[] } | null>(null);
  useEffect(() => {
    if (!attempt || attempt.status !== 'submitted' || attempt.graded) return;
    let stop = false;
    setGradeErr('');
    fetch('/api/mock/grade', { method: 'POST', headers: { 'content-type': 'application/json', 'x-token': getAccount()?.token ?? '' }, body: JSON.stringify({ kind, testId, answers: attempt.answers, attemptId: String(attempt.startedAt) }) })
      .then(async (r) => { const j = await r.json().catch(() => ({})) as { graded?: Graded; correct?: number; error?: string }; if (!r.ok || !j.graded) throw new Error(j.error ?? L('Xato {0}', [r.status])); return j as { graded: Graded; correct: number; stats?: ExamAttempt['stats']; certificates?: { id: string; type: string }[]; certMissing?: string[] }; })
      .then(({ graded, correct, stats, certificates, certMissing }) => {
        if (stop) return;
        setCert({ issued: certificates ?? [], missing: certMissing ?? [] });
        update((a) => {
          if (a.graded) return a;
          if (!a.recorded && !recorded.current) {
            recorded.current = true;
            saveResult({ kind, title, correct, total: questions.length, band: scoring === 'raw' ? undefined : capBand(scaledBand(correct, questions.length, table), level), level });
            addXp(correct * 5 + (correct / questions.length >= 0.8 ? 20 : 0), 'server'); // serverdagi XP'ni server o'zi yozdi
            recordTestAnswers(kind, questions.map((q) => ({ type: q.type, correct: !!graded[q.id]?.correct })), level, getProfile().level);
          }
          return { ...a, graded, recorded: true, stats };
        });
      })
      .catch((e: Error) => { if (!stop) setGradeErr(e.message === 'Failed to fetch' ? L('Server bilan aloqa yo‘q') : e.message); });
    return () => { stop = true; };
  }, [attempt?.status, attempt?.graded, gradeTry, kind, testId, title, questions, table, level, update]);

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
    if (left_ === 600 || left_ === 300 || left_ === 60) setAnnounce(L('{0} daqiqa qoldi', [left_ / 60]));
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
        <p className="pill">{questions.length}  {L('ta savol ·')} {minutes}  {L('daqiqa')}{level ? L(' · {0} daraja', [level]) : ''}</p>
        <ul className="rules" style={{ marginTop: 10 }}>
          <li>{L('Imtihon rejimida menyu yashiriladi; javoblar avtomatik saqlanadi — sahifa yangilansa ham davom etasiz.')}</li>
          <li>{L('Vaqt to‘xtamaydi: sahifani yopsangiz ham hisoblanadi, tugaganda test o‘zi topshiriladi.')}</li>
          <li>{L('Savolni belgilash (⚑), matnni bo‘yash va eslatma yozish mumkin. Klaviatura: Alt+N / Alt+P / Alt+F.')}</li>
        </ul>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn primary" onClick={begin}>{L('Testni boshlash')}</button>
        </div>
      </div>
    );
  }

  const graded = attempt.graded ?? null;
  const correct = graded ? questions.filter((q) => graded[q.id]?.correct).length : 0;
  const rawBand = scaledBand(correct, questions.length, table);
  const band = capBand(rawBand, level);
  const missing = unanswered(attempt, ids);
  const current = attempt.current ?? ids[0];

  return (
    <div className={submitted ? '' : 'exam'}>
      <div className="exam-bar card" role="region" aria-label={L('Imtihon boshqaruvi')}>
        <b className="exam-title">{title}</b>
        {!submitted && (
          <span className="exam-timer-wrap">
            {!hideTimer && <span className={`timer ${left_ <= 300 ? 'low' : left_ <= 600 ? 'warn' : ''}`} aria-hidden="true">{fmt(left_)}</span>}
            <button type="button" className="icon-btn sm" onClick={() => setHideTimer((h) => !h)} aria-label={hideTimer ? L('Vaqtni ko‘rsatish') : L('Vaqtni yashirish')}>{hideTimer ? <Eye size={16} /> : <EyeOff size={16} />}</button>
          </span>
        )}
        <span className="sr-only" aria-live="polite">{announce}</span>
        {!submitted && <span className="pill" title={L('Belgilangan savollar')}><Flag size={13} /> {attempt.flags.length}</span>}
        {!submitted && <button type="button" className="btn sm" onClick={() => setNotesOpen((o) => !o)} aria-expanded={notesOpen}><NotebookPen size={15} /><span className="hide-sm">{L('Eslatma')}</span></button>}
        {!submitted ? (
          <button className="btn primary sm" onClick={() => setConfirm(true)}>{L('Topshirish')}</button>
        ) : (
          <button className="btn sm" onClick={restart}>{L('Qayta boshlash')}</button>
        )}
        {!submitted && <span className="saved muted" aria-live="off">{L('Saqlandi ✓')}</span>}
      </div>

      {notesOpen && !submitted && (
        <div className="card">
          <label htmlFor={`notes-${testId}`}><b>{L('Eslatmalar')}</b> <span className="muted">{L('(baholanmaydi)')}</span></label>
          <textarea id={`notes-${testId}`} rows={4} style={{ width: '100%', marginTop: 6 }} value={attempt.notes} onChange={(e) => { const v = e.target.value; update((a) => ({ ...a, notes: v })); }} />
        </div>
      )}

      {submitted && (
        <div className="card">
          {attempt.autoSubmitted && <p className="notice">{L('Vaqt tugadi — javoblaringiz avtomatik topshirildi.')}</p>}
          {hasFull() && <p><a className="btn sm primary" href="#/mocks/full">{L('To‘liq imtihonga qaytish')}</a></p>}
          {!graded && !gradeErr && <p className="muted" role="status">{L('Natija hisoblanmoqda…')}</p>}
          {!graded && gradeErr && <p className="notice" role="alert">{L('Natijani olib bo‘lmadi:')} {gradeErr}{L('. Javoblaringiz saqlangan.')} <button className="btn sm" onClick={() => setGradeTry((n) => n + 1)}>{L('Qayta urinish')}</button></p>}
          {graded && <><div className="score">{correct} / {questions.length}</div>
          {scoring === 'raw' ? <p>{L('To‘g‘ri javoblar:')} <b>{Math.round((correct / questions.length) * 100)}%</b>.</p> : <div>
            
            {L('Band:')} <b>{band.toFixed(1)}</b>
            {level && rawBand > band && <p className="evidence">{L('Bu test')} {level}  {L('darajali, shuning uchun band')} {BAND_CAP[level].toFixed(1)}  {L('dan yuqori ko‘rsatilmaydi: yuqori ball uchun qiyinroq testlarni yeching.')}</p>}
          </div>}
          {correct > 0 && <p><button className="btn sm" onClick={() => void shareMock({ kind, correct, total: questions.length, band: scoring === 'raw' ? null : band })}>{L('Natijani ulashish')}</button></p>}
          {cert && <CertNotice issued={cert.issued} missing={cert.missing} />}
          <TestReport kind={kind} title={title} questions={questions} graded={graded} answers={attempt.answers} startedAt={attempt.startedAt} submittedAt={attempt.submittedAt} minutes={minutes} stats={attempt.stats} /></>}
        </div>
      )}

      {!submitted && (
        <div className="exam-tabs" role="tablist" aria-label={L('Bo‘lim')}>
          <button type="button" role="tab" aria-selected={pane === 'left'} className={pane === 'left' ? 'on' : ''} onClick={() => setPane('left')}>{kind === 'reading' ? L('Matn') : 'Audio'}</button>
          <button type="button" role="tab" aria-selected={pane === 'right'} className={pane === 'right' ? 'on' : ''} onClick={() => setPane('right')}>{L('Savollar (')}{ids.length - missing.length}/{ids.length})</button>
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
            graded={graded}
            flags={attempt.flags}
            onFlag={submitted ? undefined : (id) => update((x) => toggleFlag(x, id))}
            anchorPrefix={`q-${testId}-`}
            current={submitted ? null : current}
          />
          {!submitted && (
            <div className="qlist-end">
              <span className="muted">{L('Javob berilgan: {0}/{1}', [ids.length - missing.length, ids.length])}</span>
              <button type="button" className="btn primary lg" onClick={() => setConfirm(true)}>{L('Topshirish')}</button>
            </div>
          )}
        </div>
      </div>

      {!submitted && (
        <nav className="exam-nav" aria-label={L('Savollar paneli')}>
          <button type="button" className="icon-btn" onClick={() => step(-1)} aria-label={L('Oldingi savol')}><ChevronLeft size={18} /></button>
          <div className="exam-cells">
            {ids.map((id) => {
              const answered = !missing.includes(id);
              const flagged = attempt.flags.includes(id);
              return (
                <button key={id} type="button" onClick={() => go(id)}
                  className={`cell${answered ? ' done' : ''}${flagged ? ' flag' : ''}${id === current ? ' now' : ''}`}
                  aria-label={L('Savol {0}{1}{2}', [id, answered ? L(', javob berilgan') : L(', javobsiz'), flagged ? L(', belgilangan') : ''])}
                  aria-current={id === current ? 'true' : undefined}>{id}</button>
              );
            })}
          </div>
          <button type="button" className="icon-btn" onClick={() => step(1)} aria-label={L('Keyingi savol')}><ChevronRight size={18} /></button>
        </nav>
      )}

      {confirm && !submitted && (
        <div className="exam-dialog-backdrop" role="presentation">
          <div className="card exam-dialog" role="dialog" aria-modal="true" aria-labelledby={`sub-${testId}`}>
            <h3 id={`sub-${testId}`}>{L('Testni topshirasizmi?')}</h3>
            <p>{L('Javob berilgan:')} <b>{ids.length - missing.length} / {ids.length}</b>  {L('· Qolgan vaqt:')} <b>{fmt(left_)}</b></p>
            {missing.length > 0 && <p className="evidence">{L('Javobsiz:')} {missing.join(', ')}</p>}
            {attempt.flags.length > 0 && <p className="evidence">{L('Belgilangan:')} {attempt.flags.join(', ')}</p>}
            <p className="evidence">{L('Topshirgandan keyin javoblarni o‘zgartirib bo‘lmaydi.')}</p>
            <div className="row">
              <button type="button" className="btn" onClick={() => setConfirm(false)} autoFocus>{L('Qaytish')}</button>
              <button type="button" className="btn primary" onClick={() => { setAttempt(finalize(attempt, false)); setConfirm(false); }}>{L('Topshirish')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mock natijasini story rasmi (1080×1920) qilib ulashish; band doim "taxminiy" deb yoziladi (rasmiy IELTS balli emas). */
async function shareMock(r: { kind: 'reading' | 'listening'; correct: number; total: number; band: number | null }): Promise<void> {
  track('share_mock');
  const skill = r.kind === 'reading' ? 'Reading' : 'Listening';
  const link = resultLink('/mocks', await myRefCode());
  const big = r.band !== null ? r.band.toFixed(1) : `${Math.round((r.correct / r.total) * 100)}%`;
  const blob = await renderStory({
    eyebrow: L('Mening {0} mock natijam', [skill]), big,
    title: L('{0} / {1} to‘g‘ri', [r.correct, r.total]),
    sub: r.band !== null ? L('Taxminiy band · rasmiy IELTS emas') : undefined,
    cta: L('Sen ham bepul mock test topshir!'), link: 'sellzen.uz',
  });
  if (blob) await shareCard(blob, `sellzen-${r.kind}-mock`, `${L('Mening {0} mock natijam', [skill])}: ${big}. ${L('Sen ham bepul mock test topshir!')} ${link}`);
}
