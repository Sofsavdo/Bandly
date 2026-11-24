// Admin paneldagi limitlar: ustunlik (admin > Railway > standart), tekshiruv, qayta tiklash va darhol kuchga kirish.
import assert from 'node:assert/strict';
import { createDb, join, byToken, ApiError } from './db';
import { ensureSettings, listSettings, publicLimits, settingValue, updateSettings, SETTINGS } from './settings';
import { assessLimit } from './entitle';
import { freeLimitsFromEnv } from './freeQuota';
import { callMonthSeconds } from './callMinutes';
import { refXp, refPlanDays } from './referral';
import { liveConfigFromEnv, liveAllowance } from './live';
import { monthlyPrice } from './pricing';
import { creditMode } from './creatorLinks';

const db = createDb(':memory:');
const env = process.env;
for (const s of SETTINGS) delete env[s.key];
env.FREE_LESSONS_PER_DAY = '2'; // "Railway" qiymati
ensureSettings(db, env);

// Standart va Railway qiymati
assert.equal(settingValue('FREE_FIRST_DAY_LESSONS'), 3);
assert.equal(settingValue('FREE_LESSONS_PER_DAY'), 2);
const v0 = Object.fromEntries(listSettings(db).map((s) => [s.key, s]));
assert.equal(v0.FREE_LESSONS_PER_DAY!.source, 'env');
assert.equal(v0.FREE_FIRST_DAY_LESSONS!.source, 'default');

// Admin qiymati Railway'dan ustun va darhol kuchga kiradi (serverni qayta ishga tushirmasdan)
const admin = byToken(db, join(db, 'Boss').token).id;
updateSettings(db, { FREE_LESSONS_PER_DAY: 4, PLAN_EXAM_WRITING: 15, COACH_CALL_MONTH_MINUTES: 90, REF_XP: 50, REF_PLAN_DAYS: 7, LIVE_FREE_DAILY_MINUTES: 8, PLAN_PRICE_EXAM: 109_000 }, admin);
assert.equal(freeLimitsFromEnv().perDay, 4);
assert.equal(assessLimit('exam', 'writing'), 15);
assert.equal(assessLimit('all', 'writing'), 20);
assert.equal(assessLimit(null, 'writing'), 0);
assert.equal(callMonthSeconds(), 90 * 60);
assert.equal(refXp(), 50);
assert.equal(refPlanDays(), 7);
assert.equal(monthlyPrice('exam'), 109_000);
const cfg = liveConfigFromEnv('k')!;
assert.equal(cfg.freeDailySeconds, 8 * 60);
assert.equal(liveAllowance(cfg, { staff: false, subscriberLeftSec: 0, freeUsedTodaySec: 0 }), 8 * 60);
updateSettings(db, { LIVE_FREE_DAILY_MINUTES: 3 }, admin);
assert.equal(cfg.freeDailySeconds, 3 * 60, 'mavjud konfiguratsiya ham yangi qiymatni oladi');

// Mijozga e'lon qilinadigan raqamlar bir xil manbadan
const pub = publicLimits();
assert.equal(pub.plans.exam.writing, 15);
assert.equal(pub.plans.general.voiceMin, 90);
assert.equal(pub.free.lessonsPerDay, 4);

// Saqlanadi: server qayta ishga tushganda bazadan o'qiladi
delete env.FREE_LESSONS_PER_DAY; delete env.PLAN_EXAM_WRITING;
ensureSettings(db, env);
assert.equal(settingValue('PLAN_EXAM_WRITING'), 15);

// Noto'g'ri qiymatlar rad etiladi va hech narsa yozilmaydi
for (const bad of [{ FREE_LESSONS_PER_DAY: -1 }, { FREE_LESSONS_PER_DAY: 1.5 }, { REF_XP: 151 }, { PLAN_PRICE_ALL: 500 }, { NOPE: 1 }, { FREE_LESSONS_PER_DAY: '3' }, {}]) {
  assert.throws(() => updateSettings(db, bad as Record<string, unknown>, admin), (e: unknown) => e instanceof ApiError && e.status === 400, JSON.stringify(bad));
}
assert.throws(() => updateSettings(db, { REF_XP: 10, FREE_LESSONS_PER_DAY: 999 }, admin));
assert.equal(refXp(), 50, 'qisman yozilmaydi');

// Qayta tiklash: admin qiymati o'chadi, Railway (server ishga tushgandagi) yoki standart qiymat qaytadi
updateSettings(db, { FREE_LESSONS_PER_DAY: null, REF_PLAN_DAYS: null }, admin);
assert.equal(settingValue('FREE_LESSONS_PER_DAY'), 2, 'Railway qiymati qaytdi');
assert.equal(refPlanDays(), 0);
assert.equal(Object.fromEntries(listSettings(db).map((s) => [s.key, s.source])).FREE_LESSONS_PER_DAY, 'env');

// Creator krediti (birinchi/oxirgi havola) — admin paneldan; admin > eski Railway o'zgaruvchisi > oxirgi havola
{
  assert.equal(settingValue('CREATOR_CREDIT_FIRST'), 0, 'standart — oxirgi havola'); assert.equal(creditMode(), 'last');
  updateSettings(db, { CREATOR_CREDIT_FIRST: 1 }, admin); assert.equal(creditMode(), 'first', 'admin birinchi havolani tanladi — darhol kuchga kirdi');
  assert.throws(() => updateSettings(db, { CREATOR_CREDIT_FIRST: 2 }, admin), ApiError, '0 yoki 1');
  updateSettings(db, { CREATOR_CREDIT_FIRST: null }, admin); assert.equal(creditMode(), 'last', 'admin qiymati o‘chirilsa — standart');
  assert.equal(creditMode({ CREATOR_ATTRIBUTION: 'first' } as NodeJS.ProcessEnv), 'first', 'eski Railway o‘zgaruvchisi hamon ishlaydi');
  assert.equal(creditMode({ CREATOR_ATTRIBUTION: 'first', CREATOR_CREDIT_FIRST: '0' } as NodeJS.ProcessEnv), 'last', 'admin sozlamasi Railway’dan ustun');
  assert.ok(listSettings(db).some((s) => s.key === 'CREATOR_CREDIT_FIRST' && s.group === 'creator'));
}
// Audit yozuvi
const audit = db.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE action = 'settings.update'").get() as { n: number };
assert.ok(audit.n >= 3);

console.log('settings.test: OK');
