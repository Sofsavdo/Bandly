// Lesson engine: deterministic checking, mastery-check scoring and local progress. Pure functions + a small localStorage store.
import type { Item, Lesson, Unit, WritingTask } from '../content/lessons/types';
import { findIssues, type Issue } from './grammarCheck';
import { L } from '../i18n';

export const PASS_RATE = 0.8; // mastery check pass mark (hypothesis; reviewed with the curriculum)

/** Lower-case, unify apostrophes, collapse spaces, drop final punctuation. "I'm  Ali." == "i’m ali" */
export const normalize = (s: string): string =>
  s.toLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '').trim();

export type ItemAnswer = number | string | string[] | number[] | undefined;

export function checkItem(item: Item, a: ItemAnswer): boolean {
  if (a === undefined) return false;
  switch (item.kind) {
    case 'choice': return a === item.answer;
    case 'gap': return typeof a === 'string' && item.accept.some((x) => normalize(x) === normalize(a));
    case 'order': return normalize(Array.isArray(a) ? a.join(' ') : String(a)) === normalize(item.answer);
    case 'multi': { // to'g'ri variantlarning aynan o'zi tanlangan bo'lsin (ortiqcha yoki yetishmayotgani xato)
      if (!Array.isArray(a)) return false;
      const sel = [...new Set((a as unknown[]).map(Number))].sort((x, y) => x - y);
      const key = [...item.answers].sort((x, y) => x - y);
      return sel.length === key.length && sel.every((v, i) => v === key[i]);
    }
  }
}

export function correctAnswerText(item: Item): string {
  if (item.kind === 'multi') return item.answers.map((i) => item.options[i]!).join(' · ');
  return item.kind === 'choice' ? item.options[item.answer]! : item.kind === 'gap' ? item.accept[0]! : item.answer;
}

/** Javob qo'yilgan to'liq inglizcha gap (fikr-mulohazada ko'rsatish va eshittirish uchun): bo'shliq to'ldiriladi, qavsdagi
 *  yordamchi so'z olib tashlanadi. Bo'shliqsiz savollarda (masalan "Choose the correct sentence") — tanlangan variantning o'zi. */
export function fullSentence(item: Item): string | null {
  if (item.kind === 'choice' && item.meaning) return item.listen ?? null; // eshitilgan ingliz gapi (variantlar — o'zbekcha ma'no)
  if (item.kind === 'multi') return null;
  const ans = correctAnswerText(item);
  if (item.kind === 'order') return ans;
  const p = item.prompt;
  if (!p.includes('___')) return item.kind === 'choice' && /[a-z].*\s.*[a-z]/i.test(ans) && /[.?!]$/.test(ans.trim()) ? ans : null;
  if (/[=:]\s*___/.test(p) || /^choose|^pick|^which/i.test(p)) return null; // "Short form: I am = ___" kabi — gap emas
  const zero = /^[—–-]$|^\(?(no article|nothing|ø)\)?$/i.test(ans.trim()); // artiklsiz javob: bo'shliq shunchaki olib tashlanadi
  const filled = p.replace(/___\s*(\([^)]*\))?/, zero ? '' : ans + ' ')
    .replace(/\s*\([^)]*\)/g, '') // qavsdagi ishoralar: "(inkor)", "(juda)", "(100%)"
    .replace(/\s+([’'](ll|s|re|ve|d|m|t)\b)/g, '$1').replace(/\s+([,.?!])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  return /___/.test(filled) ? null : filled;
}

export interface CheckResult { correct: number; total: number; rate: number; passed: boolean }
export function scoreCheck(items: Item[], answers: ItemAnswer[]): CheckResult {
  const correct = items.filter((it, i) => checkItem(it, answers[i])).length;
  const total = items.length;
  const rate = total ? correct / total : 0;
  return { correct, total, rate, passed: total > 0 && rate >= PASS_RATE };
}

/** Problems in lesson content (empty = valid). Used by tests so broken content never ships. */
export function validateLesson(l: Lesson): string[] {
  const p: string[] = [];
  const need = (c: boolean, m: string) => { if (!c) p.push(`${l.id}: ${m}`); };
  need(!!l.objectiveUz.trim() && !!l.objective.trim(), 'objective missing');
  need(l.explanationUz.length > 0, 'explanation missing');
  need(l.examples.length >= 3, 'needs ≥ 3 examples');
  need(l.practice.length >= 4, 'needs ≥ 4 practice items');
  need(l.check.length >= 5, 'mastery check needs ≥ 5 items');
  need(l.taxonomyIds.length > 0, 'no taxonomy ids');
  need(l.minutes > 0, 'minutes must be > 0');
  for (const [i, it] of [...l.practice, ...l.check].entries()) {
    if (!it.explainUz.trim()) p.push(`${l.id} item ${i}: no explanation`);
    if (it.kind === 'choice') { if (it.answer < 0 || it.answer >= it.options.length) p.push(`${l.id} item ${i}: answer index out of range`); if (new Set(it.options).size !== it.options.length) p.push(`${l.id} item ${i}: duplicate options`); }
    if (it.kind === 'multi') {
      if (!it.answers.length || it.answers.some((x) => x < 0 || x >= it.options.length) || new Set(it.answers).size !== it.answers.length) p.push(`${l.id} item ${i}: multi answers invalid`);
      if (it.options.length < 3 || it.answers.length >= it.options.length) p.push(`${l.id} item ${i}: multi needs ≥ 3 options and at least one wrong`);
      if (new Set(it.options).size !== it.options.length) p.push(`${l.id} item ${i}: duplicate options`);
    }
    if (it.kind === 'gap') { if (!it.prompt.includes('___')) p.push(L('{0} item {1}: gap prompt lacks ___', [l.id, i])); if (!it.accept.length) p.push(`${l.id} item ${i}: no accepted answer`); }
    if (it.kind === 'order') { const w = normalize(it.words.join(' ')).split(' ').sort().join(' '); const a = normalize(it.answer).split(' ').sort().join(' '); if (w !== a) p.push(`${l.id} item ${i}: words do not form the answer`); }
  }
  if (l.writing) {
    const w = l.writing;
    try { [...w.require, ...(w.forbid ?? [])].forEach((r) => new RegExp(r.re, 'i')); } catch { p.push(`${l.id}: writing regex does not compile`); return p; }
    const c = checkWriting(w, w.model);
    if (!c.passed) p.push(`${l.id}: writing model answer fails its own check (${JSON.stringify({ words: c.words, reqs: c.reqs.filter((r) => !r.ok).map((r) => r.labelUz), forbidden: c.forbidden, issues: c.issues.map((i) => i.id) })})`);
  }
  return p;
}

// ---------- writing (rule-based, not AI) ----------
export interface WritingCheck { words: number; tooLong: boolean; enoughWords: boolean; reqs: { labelUz: string; ok: boolean }[]; forbidden: string[]; issues: Issue[]; passed: boolean }
const unifyQuotes = (s: string): string => s.replace(/[’‘`´]/g, "'");
export const wordCount = (s: string): number => (unifyQuotes(s).trim().match(/[A-Za-z']+/g) ?? []).length;
export function checkWriting(task: WritingTask, raw: string): WritingCheck {
  const text = unifyQuotes(raw);
  const words = wordCount(text);
  const reqs = task.require.map((r) => ({ labelUz: r.labelUz, ok: new RegExp(r.re, 'i').test(text) }));
  const forbidden = (task.forbid ?? []).filter((f) => new RegExp(f.re, 'i').test(text)).map((f) => f.labelUz);
  const issues = findIssues(text);
  const enoughWords = words >= task.minWords;
  const tooLong = task.maxWords !== undefined && words > task.maxWords;
  return { words, tooLong, enoughWords, reqs, forbidden, issues, passed: enoughWords && !tooLong && reqs.every((r) => r.ok) && !forbidden.length && !issues.length };
}

// ---------- local progress (moves server-side with accounts) ----------
const KEY = 'bandly.lessons.v1';
export interface LessonProgress { attempts: number; best: number; passedAt: number | null }
export type ProgressMap = Record<string, LessonProgress>;
export function loadProgress(): ProgressMap {
  try { const raw = localStorage.getItem(KEY); const d = raw ? JSON.parse(raw) as ProgressMap : {}; return d && typeof d === 'object' ? d : {}; } catch { return {}; }
}
export function saveAttempt(lessonId: string, r: CheckResult, now = Date.now()): LessonProgress {
  const all = loadProgress(); const prev = all[lessonId] ?? { attempts: 0, best: 0, passedAt: null };
  const next: LessonProgress = { attempts: prev.attempts + 1, best: Math.max(prev.best, r.rate), passedAt: prev.passedAt ?? (r.passed ? now : null) };
  all[lessonId] = next;
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* storage unavailable */ }
  return next;
}

/** Next lesson to continue: the first unlocked, not-passed lesson at or above the learner's level (falls back to the very first open one). */
export function nextLesson(units: Unit[], progress: ProgressMap, level: string | null | undefined): { unitId: string; lessonId: string } | null {
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const min = level ? Math.max(0, order.indexOf(level)) : 0;
  // Starter (noldan boshlovchilar) bo'limlari tavsiya etiladi, lekin kursni allaqachon boshlagan o'quvchini ularga qaytarmaymiz
  const begun = units.some((u) => !isStarterUnit(u) && u.lessons.some((l) => !!progress[l.id]?.passedAt));
  const pick = (from: number) => {
    for (const u of units) {
      if (order.indexOf(u.level) < from || (begun && isStarterUnit(u))) continue;
      for (let i = 0; i < u.lessons.length; i++) if (isUnlocked(u, i, progress, { units, level }) && !progress[u.lessons[i]!.id]?.passedAt) return { unitId: u.id, lessonId: u.lessons[i]!.id };
    }
    return null;
  };
  return pick(min) ?? pick(0);
}

/** Darsning ochiqligi. ctx berilsa — qat'iy yo'l: o'quvchining darajasidan past darslar ochiq (takrorlash uchun),
 *  o'z darajasi va undan yuqorida bo'lim faqat oldingi bo'lim to'liq o'tilganda, dars esa oldingi dars o'tilganda ochiladi.
 *  ctx bo'lmasa — eski qoida: bo'limning birinchi darsi ochiq, qolganlari oldingisidan keyin. */
export const isStarterUnit = (u: Unit): boolean => /^a1-s\d/.test(u.id);
export function isUnlocked(unit: Unit, index: number, progress: ProgressMap, ctx?: { units: Unit[]; level: string | null | undefined }): boolean {
  if (progress[unit.lessons[index]?.id ?? '']?.passedAt) return true; // o'tilgan dars hech qachon yopilmaydi (keyin oldiga yangi dars qo'shilsa ham)
  if (index > 0) return !!progress[unit.lessons[index - 1]!.id]?.passedAt;
  if (!ctx || isStarterUnit(unit)) return true;
  if (unit.lessons.some((l) => !!progress[l.id]?.passedAt)) return true; // bo'lim allaqachon boshlangan
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const lv = ctx.level ? order.indexOf(ctx.level) : 0;
  if (order.indexOf(unit.level) < lv) return true;
  const main = ctx.units.filter((u) => !isStarterUnit(u)); // Starter bo'limlari majburiy emas — a1-u1 ularsiz ham ochiq
  const k = main.findIndex((u) => u.id === unit.id);
  const prev = k > 0 ? main[k - 1] : undefined;
  if (!prev || order.indexOf(prev.level) < lv) return true;
  return prev.lessons.every((l) => !!progress[l.id]?.passedAt);
}
