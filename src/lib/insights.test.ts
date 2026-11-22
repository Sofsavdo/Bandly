import assert from 'node:assert/strict';
import { outcomeOf, recommend, recurringErrors, skillScores, lessonFor, type InsightInput } from './insights';
import type { Mistake } from './mistakes';
import type { Lesson } from '../content/lessons/types';

const NOW = Date.UTC(2026, 10, 22, 10);
const DAY = 86_400_000;

const rec = (m: number, attempts = 3, lastSeen = NOW) => ({ m, attempts, distinctDays: attempts, lastDay: '2026-11-22', lastSeen, recent: [true], streak: 1, everKnown: m >= 0.8, dueAt: NOW + DAY });
const lesson = (id: string, tax: string[]): Lesson => ({ id, title: id, titleUz: `Dars ${id}`, objectiveUz: 'x', objective: 'x', taxonomyIds: tax as Lesson['taxonomyIds'], minutes: 8, explanationUz: [], examples: [], practice: [], check: [] });
const mistake = (id: string, tax: string[], ago: number, resolved = false, attempts = 0): Mistake => ({ id, source: 'lesson', ref: { kind: 'grammar', grammarId: 1 }, taxonomy: tax as Mistake['taxonomy'], createdAt: NOW - ago * DAY, due: NOW, streak: 0, attempts, resolvedAt: resolved ? NOW : null });
const base = (): InsightInput => ({
  mastery: { 'ge.lesson.a1': rec(0.9), 'ge.lesson.a2': rec(0.3) },
  nodes: [{ id: 'ge.lesson.a1', skill: 'grammar' }, { id: 'ge.lesson.a2', skill: 'grammar' }] as InsightInput['nodes'],
  results: [{ id: 'r1', kind: 'reading', title: 'R', correct: 0, total: 0, band: 4.5, date: '' }, { id: 'r2', kind: 'reading', title: 'R', correct: 0, total: 0, band: 5, date: '' }, { id: 'r3', kind: 'listening', title: 'L', correct: 30, total: 40, date: '' }],
  mistakes: [],
  lessons: [{ lesson: lesson('a1', ['G.tense']), level: 'A1' }, { lesson: lesson('a2', ['G.tense', 'G.article']), level: 'A1' }, { lesson: lesson('b1', ['G.article']), level: 'B1' }],
  passed: new Set(['a1']), goal: 'ielts', level: 'A2', now: NOW,
});

// Ko'nikma ballari haqiqiy ma'lumotdan: reading band 4.5 va 5 → (50+55.6)/2 ≈ 53; listening 75%; grammatika (90+30)/2 = 60
const s = skillScores(base());
assert.equal(s.find((x) => x.skill === 'reading')!.score, 53);
assert.equal(s.find((x) => x.skill === 'listening')!.score, 75);
assert.equal(s.find((x) => x.skill === 'grammar')!.score, 60);
assert.equal(s.find((x) => x.skill === 'writing')!.score, null, 'dalil yo‘q — ball o‘ylab topilmaydi');

// Takrorlanuvchi xato: 30 kundan eski va hal qilinganlar hisoblanmaydi
const ms = [mistake('m1', ['G.article'], 1), mistake('m2', ['G.article'], 3), mistake('m3', ['G.article'], 40), mistake('m4', ['G.tense'], 2, true), mistake('m5', ['G.tense'], 2)];
const rr = recurringErrors(ms, NOW);
assert.deepEqual(rr.map((r) => [r.taxonomy, r.count]), [['G.article', 2]]);
assert.equal(recurringErrors([mistake('x', ['G.modal'], 1, false, 3)], NOW)[0]!.count, 4, 'qayta xato qilingan urinishlar og‘irroq');

// Tavsiya tartibi
assert.equal(recommend(base(), 5).reason, 'mistakes_due');
const withErr = { ...base(), mistakes: ms };
const r1 = recommend(withErr, 0);
assert.equal(r1.reason, 'recurring_error'); assert.equal(r1.lessonId, 'a2', 'o‘tilgan a1 emas; daraja B1 dan yuqori b1 emas');
assert.equal(lessonFor({ ...withErr, passed: new Set(['a1', 'a2']) }, 'G.article'), null, 'o‘zlashtirilgan dars qayta berilmaydi');
assert.equal(lessonFor({ ...withErr, level: 'B1' }, 'G.article')!.id, 'b1', 'B1 o‘quvchiga darajasiga eng yaqin dars (A1 emas)');
const r2 = recommend(base(), 0);
assert.equal(r2.reason, 'weak_skill'); assert.equal(r2.skill, 'reading'); assert.equal(r2.href, '#/mocks/reading');
const strong = { ...base(), results: [...base().results.slice(2), { id: 'a', kind: 'reading' as const, title: '', correct: 0, total: 0, band: 7.5, date: '' }, { id: 'b', kind: 'reading' as const, title: '', correct: 0, total: 0, band: 7.5, date: '' }], mastery: { 'ge.lesson.a1': rec(0.9), 'ge.lesson.a2': rec(0.9) } };
const r3 = recommend(strong, 0);
assert.equal(r3.reason, 'no_evidence'); assert.equal(r3.skill, 'writing', 'imtihon maqsadida o‘lchanmagan ko‘nikma');
const general = recommend({ ...strong, goal: 'general', level: 'A1' }, 0);
assert.equal(general.reason, 'next_lesson'); assert.equal(general.lessonId, 'b1');

// Natijani kuzatish
const log = { at: NOW - DAY, reason: 'weak_skill' as const, skill: 'reading' as const, baseline: 53, evidence: 2 };
assert.deepEqual(outcomeOf(log, s), { state: 'pending' }, 'yangi dalil yo‘q');
assert.equal(outcomeOf({ ...log, evidence: 1 }, s).state, 'same');
assert.equal(outcomeOf({ ...log, evidence: 1, baseline: 40 }, s).state, 'improved');
assert.equal(outcomeOf({ ...log, evidence: 1, baseline: 70 }, s).state, 'declined');
console.log('insights.test: OK');
