// Bo'lim boss sinovi (GAMIFIED_LEARNING_SPEC.md §3.5): 12 savol, ~70% shu bo'limdan, ~30% oldingi bo'limlardan takror.
// Tanlov deterministik (urug' bo'yicha) — bir xil urug' = bir xil savollar. Mastery'ni faqat adaptiv dvigatel o'zgartiradi.
import type { Item, Unit } from '../content/lessons/types';
import type { ProgressMap } from './lessons';

export interface BossRef { lessonId: string; part: 'check' | 'practice'; index: number }
export const BOSS_SIZE = 12;
export const BOSS_HEARTS = 3;
export const BOSS_PASS = 0.8;
export const BOSS_XP_FIRST = 100;
export const BOSS_XP_REPEAT = 25;

/** Kichik, barqaror PRNG (mulberry32) — satr urug'idan. */
export function rng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const shuffle = <T,>(xs: T[], r: () => number): T[] => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; } return a; };
const key = (x: BossRef) => `${x.lessonId}:${x.part}:${x.index}`;

/** Bo'lim boss uchun ochiqmi: barcha darslari o'tilgan bo'lishi kerak (boss ixtiyoriy — keyingi bo'limni yopmaydi, PXD-17). */
export const bossAvailable = (unit: Unit, progress: ProgressMap): boolean => unit.lessons.every((l) => !!progress[l.id]?.passedAt);

export interface RevisionSignal { openMistakes: Record<string, number>; needsRevision: Set<string> }

/** Boss savollari: shu bo'limdan (darslar bo'yicha navbatma-navbat, tekshiruv savollari oldin) va oldingi bo'limlardan takror. */
export function selectBossItems(unit: Unit, units: Unit[], progress: ProgressMap, sig: RevisionSignal, seed: string, size = BOSS_SIZE): BossRef[] {
  const r = rng(seed);
  const refsOf = (lessonId: string, items: { check: Item[]; practice: Item[] }): BossRef[] => [
    ...items.check.map((_, index) => ({ lessonId, part: 'check' as const, index })),
    ...items.practice.map((_, index) => ({ lessonId, part: 'practice' as const, index })),
  ];
  const before = units.slice(0, Math.max(0, units.findIndex((u) => u.id === unit.id)));
  const revLessons = before.flatMap((u) => u.lessons).filter((l) => progress[l.id]?.passedAt)
    .map((l) => ({ l, score: (sig.openMistakes[l.id] ?? 0) * 3 + (sig.needsRevision.has(l.id) ? 2 : 0) + (1 - (progress[l.id]?.best ?? 1)) + r() * 0.01 }))
    .sort((a, b) => b.score - a.score);
  const revTarget = revLessons.length ? Math.round(size * 0.3) : 0;
  const ownTarget = size - revTarget;

  // Shu bo'lim: darslar bo'yicha aylanib, har darsdan avval tekshiruv savollari (aralashtirilgan)
  const perLesson = unit.lessons.map((l) => [...shuffle(refsOf(l.id, l).filter((x) => x.part === 'check'), r), ...shuffle(refsOf(l.id, l).filter((x) => x.part === 'practice'), r)]);
  const own: BossRef[] = [];
  for (let round = 0; own.length < ownTarget && perLesson.some((q) => q.length > round); round++)
    for (const q of perLesson) if (q[round] && own.length < ownTarget) own.push(q[round]!);

  // Takror: eng zarur darslardan bittadan, aylanib
  const revQueues = revLessons.slice(0, Math.max(1, revTarget)).map(({ l }) => shuffle(refsOf(l.id, l), r));
  const rev: BossRef[] = [];
  for (let round = 0; rev.length < revTarget && revQueues.some((q) => q.length > round); round++)
    for (const q of revQueues) if (q[round] && rev.length < revTarget) rev.push(q[round]!);

  // Yetmasa shu bo'limdan to'ldiriladi; takrorlanish yo'q
  const seen = new Set<string>();
  const out: BossRef[] = [];
  for (const x of [...own, ...rev, ...perLesson.flat()]) { if (out.length >= size) break; if (!seen.has(key(x))) { seen.add(key(x)); out.push(x); } }
  return shuffle(out, r);
}

// ---------------- Natijalar va davom ettirish (qurilmada) ----------------
export interface BossRecord { attempts: number; best: number; passedAt: number | null }
export interface BossRun { unitId: string; seed: string; refs: BossRef[]; answers: (number | string | string[] | undefined)[]; shown: boolean[]; hearts: number; startedAt: number; done: 'won' | 'lost' | null; before: Record<string, number>; suppressed: number }
const RKEY = 'bandly.boss.v1';
const PKEY = 'bandly.bossrun.v1';
export const RESUME_MS = 24 * 3_600_000;

export function loadBoss(): Record<string, BossRecord> {
  try { const j = JSON.parse(localStorage.getItem(RKEY) ?? '{}') as Record<string, BossRecord>; return j && typeof j === 'object' ? j : {}; } catch { return {}; }
}
/** Natijani yozadi; birinchi g'alabami — qaytaradi (XP va yutuq uchun). */
export function saveBossResult(unitId: string, rate: number, passed: boolean, now = Date.now()): { firstWin: boolean } {
  const all = loadBoss(); const prev = all[unitId] ?? { attempts: 0, best: 0, passedAt: null };
  const firstWin = passed && !prev.passedAt;
  all[unitId] = { attempts: prev.attempts + 1, best: Math.max(prev.best, rate), passedAt: prev.passedAt ?? (passed ? now : null) };
  try { localStorage.setItem(RKEY, JSON.stringify(all)); } catch { /* ignore */ }
  return { firstWin };
}
export function loadRun(unitId: string, now = Date.now()): BossRun | null {
  try { const j = JSON.parse(localStorage.getItem(PKEY) ?? 'null') as BossRun | null; return j && j.unitId === unitId && now - j.startedAt < RESUME_MS ? j : null; } catch { return null; }
}
export const saveRun = (run: BossRun | null): void => { try { if (run) localStorage.setItem(PKEY, JSON.stringify(run)); else localStorage.removeItem(PKEY); } catch { /* ignore */ } };
