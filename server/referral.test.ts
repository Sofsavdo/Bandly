import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram } from './db';
import { refXp, attachReferral, isRefCode, maybeRewardReferral, refCodeOf, refPlanCap, refPlanDays, refStats } from './referral';
import { planOf } from './entitle';
import { awardXp } from './xp';
import { welcomeMsg } from './botFlow';
import { ensureCertTables, recordResult } from './certificates';

const db = createDb();
const T = Date.UTC(2026, 10, 17, 8);
const host = byToken(db, join(db, 'Ustoz', T).token);
const code = refCodeOf(db, host.id);
assert.ok(isRefCode(code)); assert.equal(refCodeOf(db, host.id), code, 'kod barqaror');

// Yangi Telegram hisobi kod bilan bog'lanadi; o'zini taklif qila olmaydi; ikkinchi marta bog'lanmaydi
const guest = byToken(db, loginTelegram(db, 5001, 'Mehmon', undefined, T).token);
assert.equal(attachReferral(db, guest.id, code), true);
assert.equal(attachReferral(db, guest.id, code), false);
assert.equal(attachReferral(db, host.id, code), false);
assert.equal(attachReferral(db, guest.id, 'BAD!!'), false);
assert.deepEqual({ ...refStats(db, host.id), code: 'x' }, { code: 'x', invited: 1, activated: 0, xpEach: refXp(), planDays: refPlanDays() });

// O'yin o'ynash mukofot bermaydi; birinchi dars — ikkalasiga XP, faqat bir marta
const xp = (id: number) => (db.prepare('SELECT COALESCE(SUM(accepted),0) AS s FROM xp_events WHERE player_id = ?').get(id) as { s: number }).s;
awardXp(db, guest.id, 'game-000001', 'game', 20, T);
assert.equal(maybeRewardReferral(db, guest.id, T), false);
awardXp(db, guest.id, 'lesson-000001', 'lesson', 30, T);
const h0 = xp(host.id);
assert.equal(maybeRewardReferral(db, guest.id, T), true);
assert.equal(maybeRewardReferral(db, guest.id, T), false);
assert.equal(xp(host.id) - h0, refXp());
assert.equal(refStats(db, host.id).activated, 1);

// Telegram: /start ref_KOD — ilova tugmalari havolasida kod bor
const rep = welcomeMsg(7, 'https://app.example', (t) => t, 'Ali', code);
assert.match(JSON.stringify(rep), new RegExp(`ref=${code}`));
// Obuna kunlari mukofoti (REF_PLAN_DAYS): standart o'chiq; yoqilganda ikkalasiga All Access, taklif qilganga 30 kunda cheklov
assert.equal(refPlanDays({}), 0, 'standart: o‘chiq (egasi qarori)');
assert.equal(refPlanDays({ REF_PLAN_DAYS: '99' }), 30, 'eng ko‘pi 30 kun');
assert.equal(refPlanCap({}), 3);
assert.equal(planOf(db, guest.id, T), null, 'o‘chiq holatda obuna berilmagan');
{
  const env = { REF_PLAN_DAYS: '7', REF_PLAN_MONTHLY_CAP: '2' } as NodeJS.ProcessEnv;
  const boss = byToken(db, join(db, 'Bloger', T).token);
  const bcode = refCodeOf(db, boss.id);
  const until = (id: number) => (db.prepare("SELECT until FROM subscriptions WHERE player_id = ? AND track = 'exam'").get(id) as { until: number } | undefined)?.until ?? 0;
  const invite = (tg: number, at: number) => {
    const u = byToken(db, loginTelegram(db, tg, `Dost${tg}`, undefined, at).token);
    attachReferral(db, u.id, bcode);
    awardXp(db, u.id, `lesson-${tg}0001`, 'lesson', 30, at);
    assert.equal(maybeRewardReferral(db, u.id, at, env), true);
    assert.equal(maybeRewardReferral(db, u.id, at, env), false, 'takroriy chaqiruv — mukofot yo‘q');
    return u;
  };
  const a = invite(6001, T);
  assert.equal(planOf(db, a.id, T), 'all', 'taklif qilingan: All Access');
  assert.equal(until(a.id), T + 7 * 86_400_000);
  assert.equal(until(boss.id), T + 7 * 86_400_000, 'taklif qilgan: +7 kun');
  invite(6002, T + 1000);
  assert.equal(until(boss.id), T + 14 * 86_400_000, 'ikkinchi taklif: yana +7 (kunlar qo‘shiladi)');
  const c = invite(6003, T + 2000);
  assert.equal(until(boss.id), T + 14 * 86_400_000, 'cheklov (2/30 kun): uchinchisiga taklif qilganga kun yo‘q');
  assert.equal(planOf(db, c.id, T), 'all', '…lekin taklif qilingan baribir oladi');
  invite(6004, T + 31 * 86_400_000);
  assert.ok(until(boss.id) > T + 31 * 86_400_000, '30 kundan keyin cheklov yangilanadi');
}

// Mehmon mock → ro'yxat: mazmunli mock ham "haqiqiy mashg'ulot" (kamida yarmiga javob + kamida bittasi to'g'ri); bo'sh/tasodifiy topshirish emas
{
  ensureCertTables(db);
  const h = byToken(db, join(db, 'MockHost', T).token); const hc = refCodeOf(db, h.id);
  const u = byToken(db, loginTelegram(db, 7001, 'MockDost', undefined, T).token);
  assert.equal(attachReferral(db, u.id, hc), true);
  const r = (key: string, correct: number, answered: number) => recordResult(db, u.id, { module: 'ielts-skill', kind: 'reading', testId: 'reading-5', title: 'T', attemptKey: key, correct, total: 10, answered, band: 4, level: 'A2' }, T);
  r('mock:reading-5:1', 0, 10);
  assert.equal(maybeRewardReferral(db, u.id, T), false, 'hammasi xato — mukofot yo‘q');
  r('mock:reading-5:2', 3, 2);
  assert.equal(maybeRewardReferral(db, u.id, T), false, 'savollarning yarmidan kamiga javob — mukofot yo‘q');
  const before = xp(h.id);
  r('mock:reading-5:3', 4, 8);
  assert.equal(maybeRewardReferral(db, u.id, T), true, 'mazmunli mock — mukofot');
  assert.equal(xp(h.id) - before, refXp());
  assert.equal(maybeRewardReferral(db, u.id, T), false, 'takroriy chaqiruv (refresh/callback) — ikkinchi mukofot yo‘q');
  r('mock:reading-5:4', 9, 10);
  assert.equal(maybeRewardReferral(db, u.id, T), false, 'yana bir mock mukofotni qayta bermaydi');
  assert.equal(xp(h.id) - before, refXp());
}
console.log('referral: OK');
