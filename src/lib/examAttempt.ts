// Imtihon urinishi (E1, REAL_EXAM_EXPERIENCE_SPEC.md §6): vaqt mutlaq "deadline" sifatida saqlanadi,
// javoblar har o'zgarishda qurilmaga yoziladi, sahifa yangilansa davom etadi, topshirish bir martalik.
// Server tomoni (E3) keyin: bu yerdagi sof funksiyalar serverda ham xuddi shunday ishlatiladi.
import type { Answer } from './grade';

export interface HighlightRange { p: number; start: number; end: number } // paragraf indeksi va belgilar oralig'i [start, end)

export interface ExamAttempt {
  v: 1;
  testKey: string;
  startedAt: number;
  deadlineAt: number;
  status: 'in_progress' | 'submitted';
  submittedAt: number | null;
  autoSubmitted: boolean;
  answers: Record<number, Answer>;
  flags: number[];
  current: number | null;
  notes: string;
  highlights: HighlightRange[];
  audioPlays: number;
}

const PREFIX = 'bandly.attempt.v1.';

export function createAttempt(testKey: string, minutes: number, now = Date.now()): ExamAttempt {
  return { v: 1, testKey, startedAt: now, deadlineAt: now + Math.round(minutes * 60_000), status: 'in_progress', submittedAt: null, autoSubmitted: false, answers: {}, flags: [], current: null, notes: '', highlights: [], audioPlays: 0 };
}

/** Qolgan soniyalar — har doim saqlangan muddatdan hisoblanadi (qayta yuklash vaqtni tiklamaydi). */
export const remainingSeconds = (a: ExamAttempt, now = Date.now()): number => Math.max(0, Math.ceil((a.deadlineAt - now) / 1000));
export const isExpired = (a: ExamAttempt, now = Date.now()): boolean => a.status === 'in_progress' && now >= a.deadlineAt;

export function setAnswer(a: ExamAttempt, id: number, ans: Answer): ExamAttempt {
  if (a.status !== 'in_progress') return a;
  const answers = { ...a.answers };
  if (ans === undefined || ans === '') delete answers[id]; else answers[id] = ans;
  return { ...a, answers, current: id };
}

export function toggleFlag(a: ExamAttempt, id: number): ExamAttempt {
  if (a.status !== 'in_progress') return a;
  const flags = a.flags.includes(id) ? a.flags.filter((x) => x !== id) : [...a.flags, id].sort((x, y) => x - y);
  return { ...a, flags };
}

/** Bir martalik: allaqachon topshirilgan urinish o'zgarmaydi (ikki marta bosish = bitta natija). */
export function submitAttempt(a: ExamAttempt, now = Date.now(), auto = false): ExamAttempt {
  if (a.status === 'submitted') return a;
  return { ...a, status: 'submitted', submittedAt: now, autoSubmitted: auto };
}

export const unanswered = (a: ExamAttempt, ids: number[]): number[] => ids.filter((id) => a.answers[id] === undefined || a.answers[id] === '');

// ---------------- Belgilangan matn (highlight) ----------------
/** Yangi oraliqni qo'shadi; bir paragrafdagi ustma-ust/yonma-yon oraliqlar birlashtiriladi. */
export function addHighlight(list: HighlightRange[], r: HighlightRange): HighlightRange[] {
  if (r.end <= r.start) return list;
  const same = list.filter((x) => x.p === r.p);
  const other = list.filter((x) => x.p !== r.p);
  const all = [...same, r].sort((a, b) => a.start - b.start);
  const merged: HighlightRange[] = [];
  for (const x of all) {
    const last = merged[merged.length - 1];
    if (last && x.start <= last.end) last.end = Math.max(last.end, x.end);
    else merged.push({ ...x });
  }
  return [...other, ...merged].sort((a, b) => a.p - b.p || a.start - b.start);
}

/** Paragraf matnini oddiy va belgilangan bo'laklarga ajratadi (React shu bo'laklarni chizadi). */
export function segments(text: string, ranges: HighlightRange[], p: number): { text: string; hl: boolean }[] {
  const rs = ranges.filter((r) => r.p === p).map((r) => ({ start: Math.max(0, r.start), end: Math.min(text.length, r.end) })).filter((r) => r.end > r.start);
  const out: { text: string; hl: boolean }[] = [];
  let i = 0;
  for (const r of rs) {
    if (r.start > i) out.push({ text: text.slice(i, r.start), hl: false });
    out.push({ text: text.slice(Math.max(i, r.start), r.end), hl: true });
    i = Math.max(i, r.end);
  }
  if (i < text.length) out.push({ text: text.slice(i), hl: false });
  return out.filter((s) => s.text.length > 0);
}

// ---------------- Saqlash ----------------
export function loadAttempt(testKey: string): ExamAttempt | null {
  try {
    const raw = localStorage.getItem(PREFIX + testKey);
    if (!raw) return null;
    const a = JSON.parse(raw) as ExamAttempt;
    return a && a.v === 1 && a.testKey === testKey ? a : null;
  } catch { return null; }
}
export function saveAttempt(a: ExamAttempt): void {
  try { localStorage.setItem(PREFIX + a.testKey, JSON.stringify(a)); } catch { /* saqlash imkonsiz — test baribir davom etadi */ }
}
export function clearAttempt(testKey: string): void {
  try { localStorage.removeItem(PREFIX + testKey); } catch { /* ignore */ }
}
