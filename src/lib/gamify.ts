// O'yin mexanikalari (GAMIFIED_LEARNING_SPEC.md §3) — sof funksiyalar, qurilmada saqlash.
// XP mukofot, mastery emas: bu yerdagi hech narsa mastery'ni o'zgartirmaydi (mastery — src/lib/adaptive).

// ---------------- Jon (hearts) va combo ----------------
export const MAX_HEARTS = 5;
export const REFILL_HEARTS = 3;
export interface LessonPlay { hearts: number; combo: number; maxCombo: number; xp: number }
export const newPlay = (): LessonPlay => ({ hearts: MAX_HEARTS, combo: 0, maxCombo: 0, xp: 0 });

/** Combo bonusi: combo ≥ 3 → +1, ≥ 10 → +2 (asosiy XP'ning 50% idan oshmaydi — asos 2 XP). */
export const comboBonus = (combo: number): number => (combo >= 10 ? 2 : combo >= 3 ? 1 : 0);
export const PRACTICE_XP = 2; // mashqdagi birinchi urinishdagi to'g'ri javob

/** Mashq javobi: to'g'ri → combo+1 va XP; xato → jon−1 (0 dan pastga tushmaydi), combo 0. */
export function answer(p: LessonPlay, correct: boolean): LessonPlay {
  if (correct) {
    const combo = p.combo + 1;
    const bonus = Math.min(comboBonus(combo), Math.floor(PRACTICE_XP * 0.5)); // spec: bonus ≤ 50% of base XP
    return { ...p, combo, maxCombo: Math.max(p.maxCombo, combo), xp: p.xp + PRACTICE_XP + bonus };
  }
  return { ...p, hearts: Math.max(0, p.hearts - 1), combo: 0 };
}
/** "Qayta o'rganish" tugaganda 3 ta jon qaytadi (hech qachon pulga sotilmaydi — PXD-03). */
export const refill = (p: LessonPlay): LessonPlay => ({ ...p, hearts: Math.max(p.hearts, REFILL_HEARTS) });

// ---------------- Dars tekshiruvi XP (takror bir kunda kamayadi) ----------------
/** Birinchi o'tish: 3×to'g'ri + 15; o'sha kuni qayta: 1×to'g'ri; avval o'tilgan darsda o'tish bonusi 4. */
export function checkXp(correct: number, passed: boolean, firstPassEver: boolean, repeatToday: boolean): number {
  const base = repeatToday ? correct : correct * 3;
  const bonus = passed ? (firstPassEver ? 15 : 4) : 0;
  return base + bonus;
}
const XPKEY = 'bandly.lessonxp.v1';
export function lessonXpDay(lessonId: string): string | null {
  try { const j = JSON.parse(localStorage.getItem(XPKEY) ?? '{}') as Record<string, string>; return j[lessonId] ?? null; } catch { return null; }
}
export function markLessonXp(lessonId: string, day: string): void {
  try { const j = JSON.parse(localStorage.getItem(XPKEY) ?? '{}') as Record<string, string>; j[lessonId] = day; localStorage.setItem(XPKEY, JSON.stringify(j)); } catch { /* ignore */ }
}

// ---------------- Kunlik vazifalar ----------------
export interface QuestInput {
  day: string;
  lessonsPassedToday: number;
  dailyXp: number; dailyGoal: number;
  dueMistakes: number;
  mistakeAttemptsToday: number;
  gamesToday: number;
}
export interface Quest { id: 'lesson' | 'xp' | 'mistakes' | 'game'; titleUz: string; progress: number; target: number; href: string; done: boolean }
export const QUEST_XP = 20;

/** Har kuni 3 ta vazifa; tasodifiy emas — o'quvchi holatidan aniqlanadi. Har biri bepul imkoniyatlar bilan bajariladi. */
export function dailyQuests(q: QuestInput): Quest[] {
  const mk = (id: Quest['id'], titleUz: string, progress: number, target: number, href: string): Quest =>
    ({ id, titleUz, progress: Math.min(progress, target), target, href, done: progress >= target });
  const third = q.dueMistakes > 0
    ? mk('mistakes', '3 ta xato ustida ishlang', q.mistakeAttemptsToday, 3, '#/mistakes')
    : mk('game', '1 ta so‘z o‘yini o‘ynang', q.gamesToday, 1, '#/games');
  return [
    mk('lesson', '1 ta darsdan o‘ting', q.lessonsPassedToday, 1, '#/learn'),
    mk('xp', `Kunlik maqsad: ${q.dailyGoal} XP`, q.dailyXp, q.dailyGoal, '#/learn'),
    third,
  ];
}

export interface QuestDay { day: string; claimed: string[]; base: { games: number; mistakeAttempts: number } }
const QKEY = 'bandly.quests.v1';
/** Kun boshidagi qiymatlar saqlanadi: "bugun nechta o'yin" = hozirgi − kun boshidagi. */
export function loadQuestDay(day: string, current: { games: number; mistakeAttempts: number }): QuestDay {
  try {
    const j = JSON.parse(localStorage.getItem(QKEY) ?? 'null') as QuestDay | null;
    if (j && j.day === day) return j;
  } catch { /* yangi kun */ }
  const fresh: QuestDay = { day, claimed: [], base: current };
  try { localStorage.setItem(QKEY, JSON.stringify(fresh)); } catch { /* ignore */ }
  return fresh;
}
/** Mukofotni bir marta olish mumkin; bajarilmagan vazifa uchun berilmaydi. */
export function claimQuest(qd: QuestDay, quest: Quest): { qd: QuestDay; xp: number } {
  if (!quest.done || qd.claimed.includes(quest.id)) return { qd, xp: 0 };
  const next = { ...qd, claimed: [...qd.claimed, quest.id] };
  try { localStorage.setItem(QKEY, JSON.stringify(next)); } catch { /* ignore */ }
  return { qd: next, xp: QUEST_XP };
}

// ---------------- Xarita tugunlari ----------------
export type NodeState = 'locked' | 'open' | 'current' | 'passed' | 'mastered' | 'revise';
/** Xarita tugunining holati: ochilish qoidasi isUnlocked() bilan bir xil; mastery faqat ko'rsatiladi. */
export function nodeState(unlocked: boolean, passed: boolean, isCurrent: boolean, mastery: 'new' | 'learning' | 'known' | 'needs_revision' | 'mastered' | null): NodeState {
  if (passed) return mastery === 'mastered' ? 'mastered' : mastery === 'needs_revision' ? 'revise' : 'passed';
  if (!unlocked) return 'locked';
  return isCurrent ? 'current' : 'open';
}
