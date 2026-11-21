import assert from 'node:assert/strict';
import { byToken, createDb, join } from './db';
import { awardXp } from './xp';
import { analytics } from './analytics';
import { recordEvent, ensureEventsTable, eventStats } from './events';

const DAY = 86_400_000;
const NOW = Date.UTC(2026, 10, 17, 10, 0); // 15:00 Toshkent
const db = createDb();
// 4 o'quvchi: 10 kun oldin ro'yxatdan o'tgan; a — 1- va 7-kuni faol, b — faqat 1-kuni, c — hech qachon, d — bugun yangi
const T0 = NOW - 10 * DAY;
const a = byToken(db, join(db, 'Alpha', T0).token), b = byToken(db, join(db, 'Bravo', T0).token);
byToken(db, join(db, 'Charlie', T0).token); const d = byToken(db, join(db, 'Delta', NOW - 3600_000).token);
awardXp(db, a.id, 'pl-a-00001', 'placement', 20, T0 + DAY);
awardXp(db, a.id, 'ls-a-00007', 'lesson', 30, T0 + 7 * DAY);
awardXp(db, b.id, 'ls-b-00001', 'lesson', 30, T0 + DAY);
awardXp(db, d.id, 'ls-d-00000', 'lesson', 10, NOW - 60_000);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES ('p1', ?, 'exam', 30, 99000, 'success', ?, ?)").run(a.id, NOW - 2 * DAY, NOW - 2 * DAY);
db.prepare("INSERT INTO subscriptions (player_id, track, until) VALUES (?, 'exam', ?)").run(a.id, NOW + 20 * DAY);
db.prepare("INSERT INTO ai_cost_events (ts, day, player_id, feature, provider, model, units, unit_kind, cost_usd) VALUES (?, '2026-11-17', ?, 'coach', 'anthropic', 'm', 100, 'tokens', 0.25)").run(NOW - 1000, a.id);

const r = analytics(db, NOW);
assert.equal(r.totals.players, 4);
assert.equal(r.totals.payingNow, 1);
assert.equal(r.totals.dau, 1);   // faqat d bugun
assert.equal(r.totals.wau, 2);   // a 3 kun oldin (T0+7) va d bugun
// a: T0+7 = NOW-3 kun → haftalik oynada; shuning uchun WAU = 2
assert.equal(analytics(db, NOW).totals.mau, 3);
assert.equal(r.days.length, 30);
assert.equal(r.days.at(-1)!.signups, 1);
assert.equal(r.days.reduce((s, x) => s + x.signups, 0), 4);
assert.equal(r.revenue30, 99000); assert.equal(r.paid30, 1);
assert.equal(r.days.at(-1)!.aiUsd, 0.25);
// Saqlanib qolish: kohorta 4; D1 — 10 kun oldingi 3 kishidan 2 tasi (a, b) faol → 66.7%; D7 — 1/3 → 33.3%; D30 — hali yo'q
assert.equal(r.retention.cohort, 4);
assert.equal(r.retention.d1, 66.7);
assert.equal(r.retention.d7, 33.3);
assert.equal(r.retention.d30, null);
assert.deepEqual(r.funnel.map((f) => f.n), [4, 3, 1, 3, 0, 1]);
// Sovg'a qilingan obuna (referal/admin) to'lovchi hisoblanmaydi; faol obunachilar alohida
db.prepare("INSERT INTO subscriptions (player_id, track, until) VALUES (?, 'exam', ?)").run(b.id, NOW + 5 * DAY);
const r2 = analytics(db, NOW);
assert.equal(r2.totals.payingNow, 1, 'b sovg‘a kunlari bilan — to‘lovchi emas');
assert.equal(r2.totals.subscribedNow, 2);

// Anonim hodisalar: noma'lum nom rad etiladi; noyoblik anonim brauzer identifikatori bo'yicha (IP emas)
ensureEventsTable(db);
const V = (n: number) => `visitor${String(n).padStart(12, '0')}`;
assert.equal(recordEvent(db, 'hack', '1.1.1.1', V(1), NOW), 'rejected');
assert.equal(recordEvent(db, 'landing_view', '1.1.1.1', V(1), NOW), 'unique');
assert.equal(recordEvent(db, 'landing_view', '1.1.1.1', V(1), NOW + 1000), 'repeat', 'takror — jami songa, noyobga emas');
// Bir Wi-Fi (bir IP) dagi 3 xil odam — 3 noyob tashrifchi
for (const v of [2, 3, 4]) assert.equal(recordEvent(db, 'landing_view', '9.9.9.9', V(v), NOW), 'unique');
// IP o'zgardi, odam o'sha — yana noyob emas
assert.equal(recordEvent(db, 'landing_view', '5.5.5.5', V(2), NOW + 2000), 'repeat');
// Identifikatorsiz eski mijoz — faqat jami songa
assert.equal(recordEvent(db, 'landing_view', '7.7.7.7', undefined, NOW), 'repeat');
assert.equal(recordEvent(db, 'signup_start', '9.9.9.9', V(2), NOW), 'unique');
// Suiiste'mol: bir manbadan 10 daqiqada 120 tadan ko'p — rad etiladi
let rej = 0; for (let i = 0; i < 130; i++) if (recordEvent(db, 'seo_cta', '6.6.6.6', V(100 + i), NOW) === 'rejected') rej++;
assert.equal(rej, 10);
// Ertasi kuni o'sha odam yana sanaladi (kunlik noyob), davr bo'yicha esa bir marta
assert.equal(recordEvent(db, 'landing_view', '1.1.1.1', V(1), NOW + DAY), 'unique');
const st = eventStats(db, '2026-11-17', '2026-11-18');
assert.deepEqual(st.landing_view, { total: 8, unique: 4 }, 'jami 8 hodisa, davr bo‘yicha 4 noyob brauzer');
// Bazada IP yoki ochiq identifikator yo'q — faqat tuzlangan xesh
const raw = JSON.stringify(db.prepare('SELECT * FROM events_unique').all());
assert.ok(!raw.includes('visitor') && !raw.includes('1.1.1.1'), 'xom identifikator va IP saqlanmaydi');

const g = analytics(db, NOW).growth;
assert.deepEqual(g.events.landing_view, { total: 7, unique: 4 }, 'davr bugun bilan tugaydi');
assert.equal(g.visitors.landing, 4); assert.equal(g.visitors.signupStart, 1); assert.equal(g.visitors.landingToSignupStartPct, 25);
// Kohorta (shu 30 kunda ro'yxatdan o'tgan 4 kishi): daraja testi — a; dars — a, b, d; to'lov — a
assert.deepEqual({ s: g.cohort.signups, p: g.cohort.placement, l: g.cohort.lesson, paid: g.cohort.paid, r: g.cohort.renewed }, { s: 4, p: 1, l: 3, paid: 1, r: 0 });
assert.equal(g.cohort.placementPct, 25); assert.equal(g.cohort.paidPct, 25);
assert.equal(g.previous.signups, 0, 'oldingi davr bo‘sh');
// Kohortadan tashqaridagi (eski) o'quvchining to'lovi bu kohortaga qo'shilmaydi
const old = byToken(db, join(db, 'Oldie', NOW - 45 * DAY).token);
db.prepare("INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES ('p9', ?, 'exam', 30, 99000, 'success', ?, ?)").run(old.id, NOW - DAY, NOW - DAY);
assert.equal(analytics(db, NOW).growth.cohort.paid, 1); assert.equal(analytics(db, NOW).growth.previous.signups, 1);
assert.equal(analytics(db, NOW).growth.previous.paid, 1);
assert.equal(g.referredSignups, 0); assert.equal(g.referredSharePct, 0);
console.log('analytics: OK');
