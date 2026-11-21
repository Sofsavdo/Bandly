// Tarif ↔ server limitlari mosligi: sotilgan narsa (src/config.ts SALE_PLANS va undagi "features" matni)
// server haqiqatda beradigan narsaga teng bo'lishi kerak. Biri o'zgarib, ikkinchisi unutilsa — shu test yiqiladi.
import assert from 'node:assert/strict';
import { SALE_PLANS } from '../src/config';
import { createDb } from './db';
import { assessLimit, planOf } from './entitle';
import { tracksOf, priceFor } from './pricing';
import { CALL_MONTH_SECONDS, PLAN_VOICE_MINUTES } from './callMinutes';

const db = createDb();
const now = Date.UTC(2026, 10, 21);
let pid = 0;
for (const plan of SALE_PLANS) {
  // 1) To'lov yozuvidagi tarif → ochiladigan bo'limlar → serverdagi faol tarif yana o'sha tarif (aylana yopiq)
  const id = Number(db.prepare('INSERT INTO players (token, nickname, created_at, updated_at) VALUES (?, ?, ?, ?)').run(`t-${plan.id}`, `n-${plan.id}`, now, now).lastInsertRowid);
  pid = id;
  for (const t of tracksOf(plan.id)) db.prepare('INSERT INTO subscriptions (player_id, track, until) VALUES (?, ?, ?)').run(id, t, now + 86_400_000);
  assert.deepEqual(tracksOf(plan.id), plan.tracks, `${plan.id}: tracksOf = SALE_PLANS.tracks`);
  assert.equal(planOf(db, id, now), plan.id, `${plan.id}: obuna bo'limlaridan server shu tarifni taniydi`);
  // 2) AI baholash kvotasi = tarifdagi son
  assert.equal(assessLimit(plan.id, 'writing'), plan.writing, `${plan.id}: Writing kvotasi`);
  assert.equal(assessLimit(plan.id, 'speaking'), plan.speaking, `${plan.id}: Speaking kvotasi`);
  // 3) "features" matnidagi raqamlar haqiqiy limitlarga mos (UI'da yolg'on va'da bo'lmasin)
  const f = plan.features.join(' | ');
  if (/ovozli suhbat/.test(f)) assert.ok(f.includes(`${plan.voiceMin} daqiqa`), `${plan.id}: features ${plan.voiceMin} daqiqa deydi`);
  if (plan.writing > 0) assert.ok(new RegExp(`Writing baholash: ${plan.writing} ta`).test(f), `${plan.id}: features Writing ${plan.writing} ta deydi`);
  if (plan.speaking > 0) assert.ok(new RegExp(`Speaking baholash[^|]*: ${plan.speaking} ta`).test(f), `${plan.id}: features Speaking ${plan.speaking} ta deydi`);
  // 4) Narx formulasi faqat bitta joyda: 30 kun = oylik narx (env o'zgartirmasa)
  assert.equal(priceFor(plan.id, 30, {}), plan.monthlyUzs);
}
assert.ok(pid > 0);
// 5) Ovozli suhbat daqiqalari: server standarti tarifdagi qiymatdan olinadi (alohida "60" konstantasi yo'q)
assert.equal(PLAN_VOICE_MINUTES, Math.min(...SALE_PLANS.map((p) => p.voiceMin)));
if (process.env.COACH_CALL_MONTH_MINUTES === undefined) assert.equal(CALL_MONTH_SECONDS, PLAN_VOICE_MINUTES * 60, 'server oylik daqiqasi = tarifdagi voiceMin');
// Obunasiz: AI baholash pullik kvotasi yo'q
assert.equal(assessLimit(null, 'writing'), 0);
console.log('planParity: OK');
