import assert from 'node:assert/strict';
import { answer, checkXp, claimQuest, comboBonus, dailyQuests, MAX_HEARTS, newPlay, nodeState, refill, type QuestDay } from './gamify';

// Jon va combo
let p = newPlay();
assert.equal(p.hearts, MAX_HEARTS);
p = answer(p, true); p = answer(p, true); p = answer(p, true);
assert.equal(p.combo, 3); assert.equal(p.maxCombo, 3);
assert.equal(p.xp, 2 + 2 + 3, 'combo 3 dan +1 bonus');
p = answer(p, false);
assert.equal(p.hearts, 4); assert.equal(p.combo, 0); assert.equal(p.maxCombo, 3);
for (let i = 0; i < 10; i++) p = answer(p, false);
assert.equal(p.hearts, 0, 'jon 0 dan pastga tushmaydi');
p = refill(p);
assert.equal(p.hearts, 3);
assert.equal(comboBonus(2), 0); assert.equal(comboBonus(3), 1); assert.equal(comboBonus(10), 2);
let q = newPlay(); for (let i = 0; i < 20; i++) q = answer(q, true);
const base = 20 * 2; assert.ok(q.xp - base <= base * 0.5, `combo bonusi asosiy XP'ning 50% idan oshmaydi: ${q.xp - base}`);
assert.equal(q.xp, 40 + 18, 'combo 3..20 → 18 ta +1');

// Tekshiruv XP: takror va qayta o'tish kamroq to'laydi
const first = checkXp(5, true, true, false);
assert.equal(first, 30);
const sameDay = checkXp(5, true, false, true);
assert.ok(sameDay <= first * 0.35, `bir kunda takror ≤35%: ${sameDay}`);
assert.equal(checkXp(2, false, false, false), 6);
// Tasodifiy bosish (≈ 1/3 to'g'ri) haqiqiy o'tishdan ancha kam
assert.ok(checkXp(2, false, false, false) <= first * 0.2 + 1e-9 + 0.01, 'tasodifiy bosish kam to‘laydi');

// Kunlik vazifalar
const qs = dailyQuests({ day: '2026-11-15', lessonsPassedToday: 0, dailyXp: 30, dailyGoal: 60, dueMistakes: 4, mistakeAttemptsToday: 1, gamesToday: 0 });
assert.deepEqual(qs.map((x) => x.id), ['lesson', 'xp', 'mistakes']);
assert.equal(qs[1].progress, 30); assert.equal(qs[1].done, false);
const qs2 = dailyQuests({ day: '2026-11-15', lessonsPassedToday: 2, dailyXp: 80, dailyGoal: 60, dueMistakes: 0, mistakeAttemptsToday: 0, gamesToday: 1 });
assert.deepEqual(qs2.map((x) => [x.id, x.done]), [['lesson', true], ['xp', true], ['game', true]]);
assert.equal(qs2[1].progress, 60, 'progress maqsaddan oshmaydi');
const qd: QuestDay = { day: '2026-11-15', claimed: [], base: { games: 0, mistakeAttempts: 0 } };
const c1 = claimQuest(qd, qs2[0]); assert.equal(c1.xp, 20);
const c2 = claimQuest(c1.qd, qs2[0]); assert.equal(c2.xp, 0, 'bir marta');
assert.equal(claimQuest(qd, qs[1]).xp, 0, 'bajarilmagan vazifa uchun XP yo‘q');

// Xarita tugunlari
assert.equal(nodeState(false, false, false, null), 'locked');
assert.equal(nodeState(true, false, true, null), 'current');
assert.equal(nodeState(true, false, false, null), 'open');
assert.equal(nodeState(true, true, false, 'learning'), 'passed');
assert.equal(nodeState(true, true, false, 'mastered'), 'mastered');
assert.equal(nodeState(true, true, false, 'needs_revision'), 'revise');
console.log('gamify.test: OK');

// Shoshilinch javoblar
{
  const { pace, newPace } = await import('./gamify');
  let p = newPace(0); let s = false; const out: boolean[] = [];
  for (let i = 1; i <= 4; i++) { ({ pace: p, suppress: s } = pace(p, i * 100, i % 2)); out.push(s); }
  assert.deepEqual(out, [false, false, true, true], '3-chi tez javobdan boshlab XP yo‘q');
  ({ pace: p, suppress: s } = pace(p, 5000, 0)); assert.equal(s, false, 'sekinlashsa — yana XP');
  p = newPace(0); const same: boolean[] = [];
  for (let i = 1; i <= 6; i++) { ({ pace: p, suppress: s } = pace(p, i * 5000, 2)); same.push(s); }
  assert.deepEqual(same, [false, false, false, false, true, true], '5 marta bir xil variant');
  ({ pace: p, suppress: s } = pace(p, 40000, null)); assert.equal(s, false);
  assert.equal(p.same, 0, 'boshqa turdagi savol hisobni uzadi');
  console.log('gamify pace: OK');
}
