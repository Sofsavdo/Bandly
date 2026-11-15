import assert from 'node:assert/strict';
import { applyXp, daysBetween, displayStreak, goalDay, levelFromXp, levelProgress, nextStreak, tryRepair, xpForLevel } from './game';
import { INTERVALS, isMastered, pickSession, review } from './srs';
import { defaultProfile, type CardState } from './types';

// Kunlar va seriya
assert.equal(daysBetween('2026-02-28', '2026-03-01'), 1);
assert.equal(daysBetween('2026-12-31', '2027-01-01'), 1);
assert.equal(nextStreak(null, '2026-11-13', 0), 1);
assert.equal(nextStreak('2026-11-13', '2026-11-13', 4), 4);
assert.equal(nextStreak('2026-11-12', '2026-11-13', 4), 5);
assert.equal(nextStreak('2026-11-10', '2026-11-13', 4), 1);

// Daraja
assert.equal(levelFromXp(0), 1);
assert.equal(levelFromXp(49), 1);
assert.equal(levelFromXp(50), 2);
assert.equal(levelFromXp(200), 3);
assert.equal(xpForLevel(3), 200);
const lp = levelProgress(125);
assert.equal(lp.level, 2);
assert.equal(lp.into, 75);
assert.equal(lp.span, 150);

// XP, kunlik hisob, yutuqlar
const t1 = '2026-11-13';
let p = defaultProfile(t1);
let r = applyXp(p, 30, t1);
assert.equal(r.profile.xp, 30);
assert.equal(r.profile.streak, 0, 'kunlik maqsad (50) bajarilmaguncha seriya o‘smaydi');
assert.ok(r.unlocked.some((a) => a.id === 'first-xp'));
assert.equal(r.levelUp, null);
r = applyXp(r.profile, 30, t1);
assert.equal(r.profile.dailyXp, 60);
assert.equal(r.profile.streak, 1, 'maqsad bajarildi — seriya 1');
assert.ok(r.profile.achievements.includes('daily-goal'));
assert.equal(r.levelUp, 2);
// Ertasi kuni: kunlik hisob nolga tushadi; 10 XP maqsad emas — seriya o'zgarmaydi
r = applyXp(r.profile, 10, '2026-11-14');
assert.equal(r.profile.dailyXp, 10);
assert.equal(r.profile.streak, 1);
r = applyXp(r.profile, 45, '2026-11-14');
assert.equal(r.profile.streak, 2, 'maqsad bajarilgach oshadi');
assert.equal(r.profile.longestStreak, 2);
r = applyXp(r.profile, 50, '2026-11-14');
assert.equal(r.profile.streak, 2, 'bir kunda ikki marta oshmaydi');
// Yutuq ikki marta berilmaydi
const again = applyXp(r.profile, 5, '2026-11-14');
assert.equal(again.unlocked.filter((a) => a.id === 'first-xp').length, 0);
// Manfiy XP qo'shilmaydi
assert.equal(applyXp(p, -50, t1).profile.xp, 0);

// Muzlatish va tiklash (GAMIFIED §3.4)
{
  const base = { streak: 0, longestStreak: 0, lastActiveDay: null as string | null, freezes: 0, brokenStreak: null as { value: number; day: string } | null, lastRepairDay: null as string | null };
  let s = base;
  const days = ['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-07'];
  for (const d of days) s = goalDay(s, d);
  assert.equal(s.streak, 7); assert.equal(s.freezes, 1, '7 kunda 1 muzlatish');
  s = goalDay(s, '2026-11-09'); // 8-noyabr o'tkazib yuborildi → muzlatish ishlatiladi
  assert.equal(s.streak, 8); assert.equal(s.freezes, 0);
  assert.equal(displayStreak(s, '2026-11-10'), 8, 'kecha bajarilgan — seriya ko‘rinadi');
  assert.equal(displayStreak(s, '2026-11-12'), 0, 'muzlatishsiz 2 kun bo‘shliq — 0');
  s = goalDay(s, '2026-11-12'); // 10, 11 o'tkazildi, muzlatish yo'q → uziladi
  assert.equal(s.streak, 1); assert.deepEqual(s.brokenStreak, { value: 8, day: '2026-11-12' });
  assert.equal(tryRepair(s, '2026-11-12', 60, 50).streak, 1, 'ikki baravar maqsadsiz tiklanmaydi');
  const rep = tryRepair(s, '2026-11-13', 100, 50);
  assert.equal(rep.streak, 9); assert.equal(rep.brokenStreak, null); assert.equal(rep.lastRepairDay, '2026-11-13');
  assert.equal(tryRepair(s, '2026-11-15', 100, 50).streak, 1, '48 soatdan keyin tiklanmaydi');
  const again = tryRepair({ ...goalDay(goalDay(rep, '2026-11-14'), '2026-11-20'), brokenStreak: { value: 5, day: '2026-11-20' } }, '2026-11-21', 100, 50);
  assert.equal(again.brokenStreak?.value, 5, '30 kunda bir martadan ko‘p tiklanmaydi');
  assert.equal(goalDay(s, '2026-11-11').streak, s.streak, 'soat orqaga surilsa seriya o‘smaydi');
  let f = base; for (let i = 1; i <= 21; i++) f = goalDay(f, `2026-10-${String(i).padStart(2, '0')}`);
  assert.equal(f.freezes, 2, 'ko‘pi bilan 2 ta muzlatish');
}

// SRS
const now = 1_000_000;
let c = review(undefined, true, now);
assert.equal(c.box, 1);
assert.equal(c.due, now + INTERVALS[1]);
c = review(c, true, now);
assert.equal(c.box, 2);
c = review(c, false, now);
assert.equal(c.box, 0);
assert.equal(c.wrong, 1);
assert.equal(c.due, now);
let m: CardState | undefined;
for (let i = 0; i < 10; i++) m = review(m, true, now);
assert.equal(m!.box, 5);
assert.ok(isMastered(m));
assert.ok(!isMastered(c));

// Sessiya tanlash
const ids = Array.from({ length: 20 }, (_, i) => `w${i}`);
const srs: Record<string, CardState> = {
  w0: { box: 1, due: now - 10, seen: 1, correct: 1, wrong: 0 }, // muddati kelgan
  w1: { box: 3, due: now + 10 * 86_400_000, seen: 3, correct: 3, wrong: 0 }, // kelmagan
  w2: { box: 0, due: now - 5, seen: 2, correct: 0, wrong: 2 }, // muddati kelgan, eng past quti
};
const s = pickSession(ids, srs, now, 10, () => 0.5);
assert.equal(s.length, 10);
assert.ok(s.includes('w0') && s.includes('w2'));
assert.ok(!s.includes('w1'));
assert.ok(s.indexOf('w2') < s.indexOf('w0')); // past quti oldinroq
assert.equal(new Set(s).size, s.length);
{
  const { repairOpen } = await import('./game');
  const base = { streak: 1, longestStreak: 9, lastActiveDay: '2026-11-10', freezes: 0, brokenStreak: { value: 9, day: '2026-11-10' }, lastRepairDay: null };
  assert.equal(repairOpen(base, '2026-11-12'), true);
  assert.equal(repairOpen(base, '2026-11-13'), false, '48 soatdan keyin yopiq');
  assert.equal(repairOpen({ ...base, lastRepairDay: '2026-10-20' }, '2026-11-11'), false, '30 kun ichida ikkinchi marta yo‘q');
}
console.log('game.test: OK');
