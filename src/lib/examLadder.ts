// IELTS zinapoyasi: haqiqiy imtihon formati (savol turlari, taymer, bir marta eshitish), lekin qiyinlik o'quvchi darajasida.
// A2 dagi o'quvchi A2 matnlarida IELTS savollarini yechadi; pog'onadagi 2 ta testdan ≥70% olsa — keyingi pog'ona ochiladi.
// Hech narsa qulflanmaydi (qiyinrog'ini ham sinash mumkin), faqat tavsiya va tartib. Natijalar qurilmadagi natijalardan hisoblanadi.
import type { Cefr } from './levels';
import { CEFR, levelIndex } from './levels';
import { L } from '../i18n';

export interface LadderTest { id: string; title: string; level: Cefr; exam?: 'ielts' | 'cefr'; full?: boolean }
export interface LadderResult { title: string; correct: number; total: number }

export const PASS_SHARE = 0.7;
export const NEED_PASSED = 2;
export const STAGE: Record<Cefr, { name: string; descUz: string }> = {
  A1: { name: 'IELTS Start', descUz: L('Qisqa matnlar va sodda savollar — formatni o‘rganamiz') },
  A2: { name: 'IELTS Start', descUz: L('Qisqa matnlar va sodda savollar — formatni o‘rganamiz') },
  B1: { name: 'IELTS Foundation', descUz: L('O‘rta uzunlikdagi matnlar, barcha savol turlari') },
  B2: { name: 'IELTS Core', descUz: L('Imtihon darajasidagi matnlar, qattiq vaqt') },
  C1: { name: 'IELTS Exam', descUz: L('To‘liq imtihon: 3 matn, 40 savol, 60 daqiqa') },
};

const best = (t: LadderTest, results: LadderResult[]): number | null => {
  const mine = results.filter((r) => r.title === t.title && r.total > 0);
  return mine.length ? Math.max(...mine.map((r) => r.correct / r.total)) : null;
};

export interface Ladder {
  working: Cefr;            // hozir ishlaydigan pog'ona
  pool: LadderTest[];       // shu pog'onadagi testlar (to'liq mocklarsiz)
  passed: number;           // pog'onada ≥70% olingan testlar soni
  need: number;
  next: LadderTest | null;  // tavsiya etilgan keyingi test
  climbed: boolean;         // boshlang'ich darajadan yuqoriga ko'tarildi
  struggling: boolean;      // pog'onadagi oxirgi 2 urinish < 40% — pastroqdan boshlash tavsiya
  fullReady: boolean;       // to'liq imtihon uchun tayyor (B2 pog'onasi bajarilgan yoki daraja ≥ C1)
}

/** Pog'ona: daraja (yoki A2) dan boshlab, bajarilgan pog'onalardan yuqoriga ko'tariladi. */
export function examLadder(tests: LadderTest[], results: LadderResult[], level: Cefr | null | undefined): Ladder {
  const ielts = tests.filter((t) => t.exam !== 'cefr');
  const mini = ielts.filter((t) => !t.full);
  const start = Math.max(levelIndex('A2'), levelIndex(level ?? 'A2'));
  const passedAt = (i: number) => mini.filter((t) => t.level === CEFR[i] && (best(t, results) ?? 0) >= PASS_SHARE).length;
  let wi = start;
  while (wi < CEFR.length - 1 && passedAt(wi) >= Math.min(NEED_PASSED, mini.filter((t) => t.level === CEFR[wi]).length || NEED_PASSED)) wi++;
  const working = CEFR[wi]!;
  const pool = mini.filter((t) => t.level === working);
  const unsolved = pool.filter((t) => best(t, results) === null);
  const weakest = [...pool].filter((t) => (best(t, results) ?? 0) < PASS_SHARE).sort((a, b) => (best(a, results) ?? 0) - (best(b, results) ?? 0));
  const tried = pool.flatMap((t) => results.filter((r) => r.title === t.title && r.total > 0)).slice(0, 2); // natijalar yangi → eski
  const struggling = tried.length >= 2 && tried.every((r) => r.correct / r.total < 0.4) && wi > levelIndex('A2');
  return {
    working, pool, passed: passedAt(wi), need: Math.min(NEED_PASSED, pool.length || NEED_PASSED),
    next: unsolved[0] ?? weakest[0] ?? (working === 'C1' ? ielts.find((t) => t.full && best(t, results) === null) ?? null : null),
    climbed: wi > start, struggling,
    fullReady: wi >= levelIndex('C1') || levelIndex(level) >= levelIndex('C1'),
  };
}
