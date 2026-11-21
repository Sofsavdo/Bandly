import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram } from './db';
import { REF_XP, attachReferral, isRefCode, maybeRewardReferral, refCodeOf, refPlanCap, refPlanDays, refStats } from './referral';
import { planOf } from './entitle';
import { awardXp } from './xp';
import { handleUpdate } from './telegram';

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
assert.deepEqual({ ...refStats(db, host.id), code: 'x' }, { code: 'x', invited: 1, activated: 0, xpEach: REF_XP, planDays: refPlanDays() });

// O'yin o'ynash mukofot bermaydi; birinchi dars — ikkalasiga XP, faqat bir marta
const xp = (id: number) => (db.prepare('SELECT COALESCE(SUM(accepted),0) AS s FROM xp_events WHERE player_id = ?').get(id) as { s: number }).s;
awardXp(db, guest.id, 'game-000001', 'game', 20, T);
assert.equal(maybeRewardReferral(db, guest.id, T), false);
awardXp(db, guest.id, 'lesson-000001', 'lesson', 30, T);
const h0 = xp(host.id);
assert.equal(maybeRewardReferral(db, guest.id, T), true);
assert.equal(maybeRewardReferral(db, guest.id, T), false);
assert.equal(xp(host.id) - h0, REF_XP);
assert.equal(refStats(db, host.id).activated, 1);

// Telegram: /start ref_KOD — ilova tugmalari havolasida kod bor
const rep = handleUpdate({ message: { chat: { id: 7, type: 'private' }, from: { id: 7 }, text: `/start ref_${code}` } }, 'https://app.example');
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
console.log('referral: OK');
