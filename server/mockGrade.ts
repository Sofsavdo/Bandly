// Mock Arena baholash serverda: javob kalitlari faqat shu yerda. Bepul (hisob talab qilinmaydi), deterministik.
import { correctText, isCorrect, type Answer } from '../src/lib/grade';
import { listeningTests } from '../src/content/listeningTests';
import { readingTests } from '../src/content/readingTests';
import type { Graded } from '../src/content/mockShared';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, byToken } from './db';
import { tzDay } from './day';
import { mockStats, recordMockStat, type MockStats } from './mockStats';
import { awardXp } from './xp';

export function gradeMock(kind: unknown, testId: unknown, answers: unknown, extra: { kind: string; id: string; questions: import('../src/content/types').Question[] }[] = []): { graded: Graded; correct: number; total: number } {
  const list = kind === 'reading' ? readingTests : kind === 'listening' ? listeningTests : null;
  if (!list) throw new ApiError(400, 'Noma’lum test turi');
  // Metodist kabinetida e'lon qilingan testlar ham shu yerda baholanadi
  const t = list.find((x) => x.id === testId) ?? extra.find((x) => x.kind === kind && x.id === testId);
  if (!t) throw new ApiError(404, 'Test topilmadi');
  const a = (answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {}) as Record<string, unknown>;
  const graded: Graded = {};
  let correct = 0;
  for (const q of t.questions) {
    const v = a[String(q.id)];
    const ans: Answer = typeof v === 'number' ? v : typeof v === 'string' ? v.slice(0, 200) : undefined;
    const ok = isCorrect(q, ans);
    if (ok) correct++;
    graded[q.id] = { correct: ok, answer: correctText(q), evidence: q.evidence };
  }
  return { graded, correct, total: t.questions.length };
}

/** POST /api/mock/grade: baholash (bepul tarif, hisob talab qilinadi), XP va anonim statistika.
 *  XP: bitta test — kuniga bir marta (yangi attemptId bilan qayta yuborib XP yig'ib bo'lmaydi).
 *  Statistika: bitta urinish bir marta (ikki marta yuborilgan submit takror yozilmaydi). */
export function gradeRequest(db: DatabaseSync, token: string, b: { kind?: unknown; testId?: unknown; answers?: unknown; attemptId?: unknown },
  studio: { kind: string; id: string; questions: import('../src/content/types').Question[] }[] = [], now = Date.now()): ReturnType<typeof gradeMock> & { xp: number; stats: MockStats } {
  const p = byToken(db, token); // Mock Arena faqat ro'yxatdan o'tganlar uchun (bepul tarif ham hisob bilan) — mehmon 401
  const g = gradeMock(b.kind, b.testId, b.answers, studio);
  const testId = String(b.testId); const attemptId = String(b.attemptId ?? '');
  let xp = 0;
  if (/^[\w:.-]{6,60}$/.test(attemptId)) xp = awardXp(db, p.id, `mock:${testId}:${tzDay(now)}`, 'mock', g.correct * 5 + (g.correct / Math.max(1, g.total) >= 0.8 ? 20 : 0), now);
  const stats = mockStats(db, testId, g.correct); // avval solishtirish (o'zini hisobga olmasdan), keyin shu urinish yoziladi
  recordMockStat(db, testId, attemptId, g.correct, g.total, now);
  return { ...g, xp, stats };
}
