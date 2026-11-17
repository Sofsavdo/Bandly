import assert from 'node:assert/strict';
import { buildPlan, targetBand, weeksUntil, type Answers } from './onboarding';

const now = Date.UTC(2026, 10, 17, 6);
const base: Answers = { goal: 'ielts', why: 'abroad', when: 'm3', examDate: null, target: '6.5', level: 'B1', hard: ['speaking', 'writing', 'grammar'], minutes: 30, tutor: 'strict' };

assert.equal(targetBand('ielts', '6.5'), 6.5);
assert.equal(targetBand('cefr', 'B2'), 6.0);
assert.equal(targetBand('sat', '1400'), null);
assert.equal(weeksUntil({ when: 'm6', examDate: null }, now), 24);
assert.equal(weeksUntil({ when: 'unknown', examDate: '2026-12-15' }, now), 4, 'aniq sana ustun');
assert.equal(weeksUntil({ when: 'm3', examDate: '2020-01-01' }, now), 12, 'o‘tgan sana e’tiborsiz');

// B1 (5.0) → 6.5: 1.5 band × 150 = 225 soat; 30 daq/kun = 3.5 soat/hafta → 65 hafta; 12 haftaga ulgurish uchun kuniga 161 daq
let p = buildPlan(base, now);
assert.equal(p.hoursNeeded, 225); assert.equal(p.weeksNeeded, 65); assert.equal(p.weeks, 12);
assert.equal(p.verdict, 'tight'); assert.equal(p.minutesNeeded, 161);
assert.deepEqual(p.focus, ['speaking', 'writing'], 'eng ko‘pi 2 ta yo‘nalish');
assert.equal(p.weeklyLessons, 12);

p = buildPlan({ ...base, level: 'B2', target: '6.5', when: 'later', minutes: 60 }, now);
assert.equal(p.hoursNeeded, 75); assert.equal(p.weeksNeeded, 11); assert.equal(p.verdict, 'ok');
assert.equal(buildPlan({ ...base, level: 'C1', target: '6.5' }, now).verdict, 'reached');
p = buildPlan({ ...base, goal: 'general', target: null, hard: [] }, now);
assert.equal(p.weeks, null); assert.equal(p.verdict, 'open'); assert.deepEqual(p.focus, ['speaking', 'vocab']);
assert.equal(buildPlan({ ...base, goal: 'sat', target: '1400' }, now).verdict, 'open', 'SAT uchun band hisobi yo‘q');
console.log('onboarding: OK');
