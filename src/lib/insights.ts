// Shaxsiy o'quv tahlili (Personal Learning Intelligence, P1.1). Faqat o'quvchining HAQIQIY ma'lumotlari:
//   - grammatika/so'z: dars tugunlarining o'zlashtirish darajasi (adaptive mastery, vaqt o'tishi bilan susayadi);
//   - reading/listening/writing/speaking: oxirgi 5 ta natija (band → 0–100, bo'lmasa to'g'ri javoblar ulushi);
//   - takrorlanuvchi xatolar: oxirgi 30 kundagi hal qilinmagan xatolar, bir xil turdagisi kamida 2 marta.
// Qoidalar (deterministik, AI ishlatilmaydi — AI faqat izohlashi mumkin, ma'lumotni o'ylab topmaydi):
//   1) navbatdagi xatolar ≥ 3 → «Xatolarim»; 2) takrorlanuvchi xato → shu xatoni nishonga olgan, hali o'zlashtirilmagan dars;
//   3) eng zaif ko'nikma (dalili bor) → o'sha ko'nikma mashqi; 4) maqsad uchun dalil yo'q ko'nikma → o'lchash; 5) aks holda — keyingi dars.
// O'zlashtirilgan dars (o'tilgan yoki mastery ≥ 0,8) qayta tavsiya qilinmaydi. Natija: tavsiya qilinganda ko'nikma bali saqlanadi,
// keyingi yangi dalildan keyin farq ko'rsatiladi (yaxshilandi / o'zgarmadi / pasaydi). Barcha ballar taxminiy.
import type { CurriculumNode } from '../content/curriculum/types';
import type { Lesson } from '../content/lessons/types';
import { effectiveMastery, type MasteryRecord } from './adaptive/mastery';
import { skillOf, type TaxonomyId } from './adaptive/taxonomy';
import type { Mistake } from './mistakes';
import type { ResultRecord } from './storage';

export type Skill = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing' | 'speaking';
export const SKILLS: Skill[] = ['grammar', 'vocabulary', 'reading', 'listening', 'writing', 'speaking'];
export interface SkillScore { skill: Skill; score: number | null; evidence: number }
export interface Recurring { taxonomy: TaxonomyId; count: number; lastAt: number }
export type ReasonCode = 'mistakes_due' | 'recurring_error' | 'weak_skill' | 'no_evidence' | 'next_lesson';
export interface Recommendation { reason: ReasonCode; href: string; skill: Skill | null; params: Record<string, string | number>; lessonId?: string }
export interface InsightInput {
  mastery: Record<string, MasteryRecord>;
  nodes: CurriculumNode[];
  results: ResultRecord[];          // eng yangisi birinchi (loadResults tartibi)
  mistakes: Mistake[];
  lessons: { lesson: Lesson; level: string }[];
  passed: Set<string>;              // o'tilgan dars id lari
  goal: 'general' | 'ielts' | 'cefr' | 'sat';
  level: string | null;
  now: number;
}

const DAY = 86_400_000;
export const MASTERED = 0.8;
export const MIN_EVIDENCE = 2;      // ko'nikmani "zaif" deb atash uchun kamida 2 ta dalil
const LV = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const avg = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);
const resultScore = (r: ResultRecord): number | null => (typeof r.band === 'number' ? (r.band / 9) * 100 : r.total > 0 ? (r.correct / r.total) * 100 : null);

export function skillScores(i: InsightInput): SkillScore[] {
  const byNode = new Map(i.nodes.map((n) => [n.id, n]));
  const nodeScores: Record<string, number[]> = {};
  for (const [id, rec] of Object.entries(i.mastery)) {
    const n = byNode.get(id);
    if (!n || rec.attempts === 0) continue;
    const sk = n.skill === 'everyday' ? 'grammar' : n.skill;
    (nodeScores[sk] ??= []).push(effectiveMastery(rec, i.now) * 100);
  }
  return SKILLS.map((skill) => {
    const res = i.results.filter((r) => r.kind === skill).slice(0, 5).map(resultScore).filter((x): x is number => x !== null);
    const all = [...res, ...(nodeScores[skill] ?? [])];
    return { skill, score: avg(all), evidence: all.length };
  });
}

export function recurringErrors(mistakes: Mistake[], now: number): Recurring[] {
  const m = new Map<TaxonomyId, Recurring>();
  for (const x of mistakes) {
    if (x.resolvedAt || now - x.createdAt > 30 * DAY) continue;
    for (const t of x.taxonomy) { const r = m.get(t) ?? { taxonomy: t, count: 0, lastAt: 0 }; r.count += 1 + Math.max(0, x.attempts - x.streak); r.lastAt = Math.max(r.lastAt, x.createdAt); m.set(t, r); }
  }
  return [...m.values()].filter((r) => r.count >= 2).sort((a, b) => b.count - a.count || b.lastAt - a.lastAt);
}

const isMastered = (i: InsightInput, lessonId: string) => i.passed.has(lessonId) || effectiveMastery(i.mastery[`ge.lesson.${lessonId}`] ?? { attempts: 0 } as MasteryRecord, i.now) >= MASTERED;
const SKILL_HREF: Record<Skill, string> = { grammar: '#/grammar', vocabulary: '#/games/pairs', reading: '#/mocks/reading', listening: '#/mocks/listening', writing: '#/exam/writing', speaking: '#/exam/speaking' };
const SKILL_OF_PREFIX: Record<string, Skill> = { G: 'grammar', V: 'vocabulary', R: 'reading', L: 'listening', W: 'writing', S: 'speaking', P: 'speaking' };

/** Shu xato turini nishonga olgan, o'quvchi darajasidan oshmaydigan, hali o'zlashtirilmagan dars — darajaga ENG YAQINI
 *  (B1 o'quvchiga A1 Starter darsi emas, B1/A2 dagi mos dars); bir darajada — kurs tartibida birinchisi. */
export function lessonFor(i: InsightInput, t: TaxonomyId): Lesson | null {
  const cap = Math.max(0, i.level ? LV.indexOf(i.level) : LV.length - 1);
  const c = i.lessons.filter((x) => x.lesson.taxonomyIds.includes(t) && LV.indexOf(x.level) <= cap && !isMastered(i, x.lesson.id));
  const best = Math.max(-1, ...c.map((x) => LV.indexOf(x.level)));
  return c.find((x) => LV.indexOf(x.level) === best)?.lesson ?? null;
}

export function recommend(i: InsightInput, dueMistakes: number): Recommendation {
  if (dueMistakes >= 3) return { reason: 'mistakes_due', href: '#/mistakes', skill: null, params: { count: dueMistakes } };
  for (const r of recurringErrors(i.mistakes, i.now).slice(0, 3)) {
    const l = lessonFor(i, r.taxonomy);
    if (l) return { reason: 'recurring_error', href: `#/learn/${l.id}`, skill: SKILL_OF_PREFIX[skillOf(r.taxonomy)] ?? null, params: { taxonomy: r.taxonomy, count: r.count, lesson: l.titleUz }, lessonId: l.id };
  }
  const scores = skillScores(i);
  const examSkills: Skill[] = i.goal === 'general' ? [] : ['reading', 'listening', 'writing', 'speaking'];
  const known = scores.filter((s) => s.score !== null && s.evidence >= MIN_EVIDENCE && (i.goal === 'general' ? true : examSkills.includes(s.skill) || s.skill === 'grammar'));
  const weakest = known.sort((a, b) => (a.score as number) - (b.score as number))[0];
  if (weakest && (weakest.score as number) < 70) return { reason: 'weak_skill', href: SKILL_HREF[weakest.skill], skill: weakest.skill, params: { score: weakest.score as number } };
  const unmeasured = examSkills.find((s) => (scores.find((x) => x.skill === s)?.evidence ?? 0) === 0);
  if (unmeasured) return { reason: 'no_evidence', href: SKILL_HREF[unmeasured], skill: unmeasured, params: {} };
  const next = i.lessons.find((x) => !isMastered(i, x.lesson.id) && (!i.level || LV.indexOf(x.level) >= LV.indexOf(i.level)));
  return next ? { reason: 'next_lesson', href: `#/learn/${next.lesson.id}`, skill: 'grammar', params: { lesson: next.lesson.titleUz }, lessonId: next.lesson.id } : { reason: 'next_lesson', href: '#/learn', skill: null, params: {} };
}

// ---- Tavsiya natijasini kuzatish ----
export interface FollowLog { at: number; reason: ReasonCode; skill: Skill | null; baseline: number | null; evidence: number }
export type Outcome = { state: 'pending' } | { state: 'improved' | 'same' | 'declined'; delta: number };
/** Tavsiyadan keyin shu ko'nikmada yangi dalil paydo bo'lganmi va ball qanday o'zgargan (±3 ichida — o'zgarmagan). */
export function outcomeOf(log: FollowLog, scores: SkillScore[]): Outcome {
  if (!log.skill || log.baseline === null) return { state: 'pending' };
  const s = scores.find((x) => x.skill === log.skill);
  if (!s || s.score === null || s.evidence <= log.evidence) return { state: 'pending' };
  const delta = s.score - log.baseline;
  return { state: delta > 3 ? 'improved' : delta < -3 ? 'declined' : 'same', delta };
}
