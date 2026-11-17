// Bosh sahifadagi IELTS / CEFR / SAT kartalari "Imtihon" sahifasini kerakli bo'lim bilan ochadi.
export type ExamTab = 'ielts' | 'cefr' | 'sat';
const KEY = 'bandly.examtab';
export const openExamTab = (t: ExamTab): void => { try { sessionStorage.setItem(KEY, t); } catch { /* ignore */ } };
export const takeExamTab = (): ExamTab => {
  try { const v = sessionStorage.getItem(KEY); sessionStorage.removeItem(KEY); if (v === 'cefr' || v === 'sat' || v === 'ielts') return v; } catch { /* ignore */ }
  return 'ielts';
};
