// Mock Arena baholash serverda: javob kalitlari faqat shu yerda. Bepul tarif (hisob bilan), deterministik.
// Natija serverda saqlanadi (exam_results) — sertifikatlar faqat shu natijalardan beriladi.
import { correctText, isCorrect, type Answer } from '../src/lib/grade';
import { listeningTests } from '../src/content/listeningTests';
import { readingTests } from '../src/content/readingTests';
import type { Graded } from '../src/content/mockShared';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, byToken } from './db';
import { tzDay } from './day';
import { mockStats, recordMockStat, type MockStats } from './mockStats';
import { awardXp } from './xp';
import { LISTENING_TABLE, READING_ACADEMIC_TABLE, scaledBand } from '../src/lib/band';
import { issueFor, recordResult, type CertType } from './certificates';

/** Past darajali testda yuqori band ko'rsatilmaydi (mijozdagi src/lib/progress.ts BAND_CAP bilan bir xil). */
const BAND_CAP: Record<string, number> = { A1: 3.5, A2: 4.5, B1: 5.5, B2: 7.0, C1: 9.0 };

type Extra = { kind: string; id: string; title?: string; level?: string; exam?: string; questions: import('../src/content/types').Question[] };
export function gradeMock(kind: unknown, testId: unknown, answers: unknown, extra: Extra[] = []): { graded: Graded; correct: number; total: number; answered: number; meta: { title: string; level: string | null; exam: 'ielts' | 'cefr' } } {
  const list = kind === 'reading' ? readingTests : kind === 'listening' ? listeningTests : null;
  if (!list) throw new ApiError(400, 'Noma’lum test turi');
  // Metodist kabinetida e'lon qilingan testlar ham shu yerda baholanadi
  const t = list.find((x) => x.id === testId) ?? extra.find((x) => x.kind === kind && x.id === testId);
  if (!t) throw new ApiError(404, 'Test topilmadi');
  const a = (answers && typeof answers === 'object' && !Array.isArray(answers) ? answers : {}) as Record<string, unknown>;
  const graded: Graded = {};
  let correct = 0, answered = 0;
  for (const q of t.questions) {
    const v = a[String(q.id)];
    const ans: Answer = typeof v === 'number' ? v : typeof v === 'string' ? v.slice(0, 200) : undefined;
    if (ans !== undefined && String(ans).trim() !== '') answered++;
    const ok = isCorrect(q, ans);
    if (ok) correct++;
    graded[q.id] = { correct: ok, answer: correctText(q), evidence: q.evidence };
  }
  const m = t as { title?: string; level?: string; exam?: string };
  return { graded, correct, total: t.questions.length, answered, meta: { title: String(m.title ?? t.id), level: m.level ?? null, exam: m.exam === 'cefr' ? 'cefr' : 'ielts' } };
}

/** POST /api/mock/grade: baholash (bepul tarif, hisob talab qilinadi), XP va anonim statistika.
 *  XP: bitta test — kuniga bir marta (yangi attemptId bilan qayta yuborib XP yig'ib bo'lmaydi).
 *  Statistika: bitta urinish bir marta (ikki marta yuborilgan submit takror yozilmaydi). */
export function gradeRequest(db: DatabaseSync, token: string, b: { kind?: unknown; testId?: unknown; answers?: unknown; attemptId?: unknown },
  studio: Extra[] = [], now = Date.now(), mediaDir = ''): Omit<ReturnType<typeof gradeMock>, 'meta'> & { xp: number; stats: MockStats; resultId: number | null; certificates: { id: string; type: CertType }[]; certMissing: ('photo' | 'name')[] } {
  const p = byToken(db, token); // Mock Arena faqat ro'yxatdan o'tganlar uchun (bepul tarif ham hisob bilan) — mehmon 401
  const { meta, ...g } = gradeMock(b.kind, b.testId, b.answers, studio);
  const testId = String(b.testId); const attemptId = String(b.attemptId ?? '');
  let xp = 0, resultId: number | null = null; let certificates: { id: string; type: CertType }[] = []; let certMissing: ('photo' | 'name')[] = [];
  if (/^[\w:.-]{6,60}$/.test(attemptId)) {
    xp = awardXp(db, p.id, `mock:${testId}:${tzDay(now)}`, 'mock', g.correct * 5 + (g.correct / Math.max(1, g.total) >= 0.8 ? 20 : 0), now);
    // Server natijasi: band ham serverda hisoblanadi (mijoz yuborgan ballga ishonilmaydi)
    const table = b.kind === 'listening' ? LISTENING_TABLE : READING_ACADEMIC_TABLE;
    const band = meta.exam === 'cefr' ? null : Math.min(scaledBand(g.correct, g.total, table), meta.level ? BAND_CAP[meta.level] ?? 9 : 9);
    const rec = recordResult(db, p.id, { module: meta.exam === 'cefr' ? 'cefr' : 'ielts-skill', kind: b.kind === 'listening' ? 'listening' : 'reading', testId, title: meta.title, attemptKey: `mock:${testId}:${attemptId}`,
      correct: g.correct, total: g.total, answered: g.answered, band, level: meta.level }, now);
    resultId = rec.result.id;
    if (mediaDir) { const iss = issueFor(db, p.id, resultId, mediaDir, now); certificates = iss.issued; certMissing = iss.missing; }
  }
  const stats = mockStats(db, testId, g.correct); // avval solishtirish (o'zini hisobga olmasdan), keyin shu urinish yoziladi
  recordMockStat(db, testId, attemptId, g.correct, g.total, now);
  return { ...g, xp, stats, resultId, certificates, certMissing };
}
