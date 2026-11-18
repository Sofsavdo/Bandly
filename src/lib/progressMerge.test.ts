import assert from 'node:assert/strict';
import { mergeSnapshot } from './progressMerge';

const J = JSON.stringify;
const P = (o: object) => J({ v: 1, xp: 0, longestStreak: 0, achievements: [], srs: {}, activity: {}, ...o });

// Ikki qurilma: A'da 1-dars, B'da 2-dars o'tilgan — ikkalasi ham qoladi
const A = {
  'bandly.profile.v1': P({ xp: 120, achievements: ['first'], srs: { w1: { box: 2, due: 10, seen: 3, correct: 2, wrong: 1 } }, activity: { '2026-11-17': 50 }, dailyGoal: 50 }),
  'bandly.lessons.v1': J({ l1: { attempts: 1, best: 0.9, passedAt: 1000 } }),
  'bandly.results.v1': J([{ id: 'r1', date: '2026-11-17T10:00:00Z', title: 'A' }]),
  'bandly.mistakes.v1': J([{ id: 'm1', due: 5 }]),
  'bandly.free.v1': J({ unlocked: { l1: 'ge' }, firstDay: '2026-11-17' }),
  'bandly.planprefs.v1': J({ minutes: 20 }),
};
const B = {
  'bandly.profile.v1': P({ xp: 90, achievements: ['streak3'], srs: { w1: { box: 3, due: 20, seen: 5, correct: 4, wrong: 1 }, w2: { box: 1, due: 1, seen: 1, correct: 1, wrong: 0 } }, activity: { '2026-11-17': 70, '2026-11-18': 20 }, longestStreak: 4, dailyGoal: 100 }),
  'bandly.lessons.v1': J({ l1: { attempts: 2, best: 0.7, passedAt: 2000 }, l2: { attempts: 1, best: 1, passedAt: 3000 } }),
  'bandly.results.v1': J([{ id: 'r2', date: '2026-11-18T10:00:00Z', title: 'B' }, { id: 'r1', date: '2026-11-17T10:00:00Z', title: 'A' }]),
  'bandly.mistakes.v1': J([{ id: 'm1', due: 9 }, { id: 'm2', due: 1 }]),
  'bandly.free.v1': J({ unlocked: { l2: 'ge' }, firstDay: '2026-11-16' }),
  'bandly.onboard.v1': J({ goal: 'ielts' }),
};
const m = mergeSnapshot(A, B);
const lessons = JSON.parse(m['bandly.lessons.v1']!);
assert.ok(lessons.l1 && lessons.l2, 'ikkala qurilmadagi darslar saqlanadi');
assert.deepEqual(lessons.l1, { attempts: 2, best: 0.9, passedAt: 1000 }, 'urinish va eng yaxshi natija maksimum, o‘tilgan sana birinchisi');
const prof = JSON.parse(m['bandly.profile.v1']!);
assert.equal(prof.xp, 120);
assert.deepEqual(prof.achievements.sort(), ['first', 'streak3']);
assert.equal(prof.srs.w1.seen, 5, 'SRS: ko‘proq ko‘rilgan karta');
assert.ok(prof.srs.w2, 'faqat bir qurilmada bo‘lgan karta ham qoladi');
assert.deepEqual(prof.activity, { '2026-11-17': 70, '2026-11-18': 20 });
assert.equal(prof.longestStreak, 4);
assert.equal(prof.dailyGoal, 50, 'sozlama — XP ko‘p bo‘lgan qurilmadan');
assert.deepEqual(JSON.parse(m['bandly.results.v1']!).map((r: { id: string }) => r.id), ['r2', 'r1'], 'natijalar id bo‘yicha birlashadi, takrorsiz');
const mis = JSON.parse(m['bandly.mistakes.v1']!);
assert.equal(mis.length, 2); assert.equal(mis.find((x: { id: string }) => x.id === 'm1').due, 9);
assert.deepEqual(JSON.parse(m['bandly.free.v1']!), { unlocked: { l1: 'ge', l2: 'ge' }, firstDay: '2026-11-16' });
assert.ok(m['bandly.planprefs.v1'] && m['bandly.onboard.v1'], 'bir tomondagi kalitlar ham qoladi');
// Simmetriya (o'tilgan darslar va natijalar tartibga bog'liq emas)
assert.deepEqual(JSON.parse(mergeSnapshot(B, A)['bandly.lessons.v1']!), lessons);
// Idempotent: qayta birlashtirish o'zgartirmaydi
assert.deepEqual(mergeSnapshot(m, B), m);
// Buzilgan JSON — xato emas, XP ko'p bo'lgan tomon
assert.equal(mergeSnapshot({ ...A, 'bandly.lessons.v1': '{bad' }, B)['bandly.lessons.v1'], '{bad');
console.log('progressMerge.test: OK');
