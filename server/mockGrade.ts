// Mock Arena baholash serverda: javob kalitlari faqat shu yerda. Bepul (hisob talab qilinmaydi), deterministik.
import { correctText, isCorrect, type Answer } from '../src/lib/grade';
import { listeningTests } from '../src/content/listeningTests';
import { readingTests } from '../src/content/readingTests';
import type { Graded } from '../src/content/mockShared';
import { ApiError } from './db';

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
