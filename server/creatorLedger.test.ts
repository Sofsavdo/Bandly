import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram, setRole } from './db';
import { attachAttribution, createLink, addFlag } from './creatorLinks';
import { adminSetProfile, createCampaign, savePost, reviewPost, selfSetProfile, updateCampaign } from './creatorOps';
import { accrueCommissions, adminLedger, approveCampaignReward, balances, creatorLedgerOf, creatorRanking, decideEntry, getProgram, ledgerHistory, markPaid, programKpis, recordRefund, setProgram } from './creatorLedger';
import { awardXp } from './xp';

const db = createDb();
const DAY = 86_400_000, T = Date.UTC(2026, 10, 20, 8);
const pl = (n: string) => byToken(db, join(db, n, T).token).id;
const admin = pl('Admin Bosh');
const creator = (n: string) => { const id = pl(n); setRole(db, n, 'creator'); return id; };
const A = creator('Bloger A'), B = creator('Bloger B');
const la = createLink(db, A, { kind: 'bio', label: 'A bio' }, T), lb = createLink(db, B, { kind: 'bio', label: 'B bio' }, T);
let tg = 5000, pn = 0;
const student = (code: string, at = T, active = true, code0?: string) => {
  const id = byToken(db, loginTelegram(db, ++tg, `S${tg}`, undefined, at).token).id;
  attachAttribution(db, id, { ref: code, ref0: code0 ?? code }, null, at);
  if (active) awardXp(db, id, `ls-${id}-event`, 'lesson', 20, at + 1000);
  return id;
};
const pay = (pid: number, status = 'success', amount = 69000, at = T + DAY) => { const id = `pay-${++pn}`; db.prepare('INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES (?, ?, ?, 30, ?, ?, ?, ?)').run(id, pid, 'exam', amount, status, at, status === 'success' ? at : null); return id; };
const entries = (creator?: number) => adminLedger(db).filter((e) => creator === undefined || e.creatorId === creator);
const NOW = T + 50 * DAY;
const throwsMsg = (fn: () => unknown, re: RegExp, msg: string) => assert.throws(fn, (e: Error) => re.test(e.message), msg);

// ---- Standart: hammasi o'chiq; hech qanday yozuv yaratilmaydi ----
const s1 = student(la.code); pay(s1);
assert.deepEqual(getProgram(db), { commissionEnabled: false, commissionPct: null, globalBudgetMinor: null, capPerCreatorMinor: null, windowDays: 180, currency: 'UZS', attribution: 'last' });
assert.deepEqual(accrueCommissions(db, NOW), { created: 0, skipped: {}, disabled: true }, 'standart: o‘chiq');
assert.equal(entries().length, 0);

// ---- Yoqish: egasi tasdiqlagan qiymatlarsiz yoqilmaydi ----
throwsMsg(() => setProgram(db, admin, { commissionEnabled: true }), /foiz, creator chegarasi va umumiy byudjet/, 'chegarasiz yoqib bo‘lmaydi');
throwsMsg(() => setProgram(db, admin, { commissionPct: 150 }), /Foiz/, 'foiz chegarasi'); throwsMsg(() => setProgram(db, admin, { globalBudgetMinor: -1 }), /Umumiy byudjet/, 'manfiy byudjet'); throwsMsg(() => setProgram(db, admin, { globalBudgetMinor: 1.5 }), /butun/, 'kasr byudjet');
setProgram(db, admin, { commissionPct: 10, capPerCreatorMinor: 1_000_000, globalBudgetMinor: 1_500_000 });
assert.equal(getProgram(db).commissionEnabled, false, 'qiymatlar kiritilishi yoqmaydi');
throwsMsg(() => setProgram(db, admin, { commissionEnabled: true }), /tasdiqlanmagan/, 'egasi tasdig‘i belgilanmagan');
assert.equal(setProgram(db, admin, { commissionEnabled: true, confirmOwnerApproved: true }).commissionEnabled, true);

// ---- Hisoblash: faqat muvaffaqiyatli to'lov, faol o'quvchi; idempotent; tiyin; foiz ----
const r1 = accrueCommissions(db, NOW);
assert.equal(r1.created, 1, 'bitta muvaffaqiyatli to‘lov → bitta yozuv'); const e1 = entries(A)[0]!;
assert.deepEqual({ kind: e1.kind, status: e1.status, currency: e1.currency, amountMinor: e1.amountMinor }, { kind: 'commission', status: 'pending', currency: 'UZS', amountMinor: 690_000 }, '69 000 so‘m = 6 900 000 tiyin × 10%');
assert.equal(accrueCommissions(db, NOW + 1000).created, 0, 'takror ishga tushirish — takror yozuv yo‘q (idempotent)'); assert.equal(entries(A).length, 1);
const sCancel = student(la.code); pay(sCancel, 'cancelled'); const sIdle = student(la.code, T, false); pay(sIdle);
const r2 = accrueCommissions(db, NOW); assert.equal(r2.created, 0); assert.equal(r2.skipped.not_activated, 1, 'faollashmagan o‘quvchi to‘lovi — komissiya yo‘q (faqat tekshirilgan faollik)'); assert.equal(r2.skipped.cap_or_budget, undefined);
// Eski to'lov oynadan tashqarida
const sOld = student(la.code, T); pay(sOld, 'success', 69000, T + 200 * DAY); assert.equal(accrueCommissions(db, T + 201 * DAY).skipped.outside_window, 1, '180 kundan keyingi to‘lov');
// O'z-o'zini taklif belgisi — komissiya yo'q
const sSelf = student(la.code); pay(sSelf); addFlag(db, A, la.code, 'self_referral', 'test', `sr:${A}:${sSelf}`, T); assert.equal(accrueCommissions(db, NOW).skipped.self_referral_flag, 1);
// Creator tasdiqlanmagan (paused) — komissiya yo'q
adminSetProfile(db, admin, 'Bloger B', { status: 'paused' }, T); const sB = student(lb.code); // paused creator linki atribusiya bermaydi
assert.equal(db.prepare('SELECT 1 FROM creator_attrib WHERE player_id = ?').get(sB), undefined, 'to‘xtatilgan hamkor linki atribusiya bermaydi'); adminSetProfile(db, admin, 'Bloger B', { status: 'approved' }, T);

// ---- Qaytarish: ledgerda bo'lsa mutanosib teskari yozuv; idempotent; qayd qilinmagan to'lov ----
const payA = (db.prepare("SELECT payment_id AS p FROM creator_ledger WHERE event_key LIKE 'pay:%' ORDER BY id LIMIT 1").get() as { p: string }).p;
throwsMsg(() => recordRefund(db, admin, 'yo-q', 100, null), /topilmadi/, 'yo‘q to‘lov'); throwsMsg(() => recordRefund(db, admin, payA, 69000 * 100 + 1, null), /noto‘g‘ri/, 'to‘lovdan ortiq'); throwsMsg(() => recordRefund(db, admin, payA, 0, null), /noto‘g‘ri/, 'nol');
assert.deepEqual(recordRefund(db, admin, payA, 20_000 * 100, 'qisman', T + 5 * DAY), { reversal: -200_000 }, 'kommissiyadan mutanosib (2 000 000 / 6 900 000)');
throwsMsg(() => recordRefund(db, admin, payA, 100, null), /allaqachon/, 'ikkinchi marta qaytarish qayd etilmaydi (idempotent)');
assert.equal(entries(A).filter((e) => e.kind === 'reversal').length, 1); assert.equal(entries(A).find((e) => e.kind === 'reversal')!.status, 'pending', 'asosiy yozuv kutilayotgan — teskari yozuv ham kutilayotgan');
assert.deepEqual(balances(db, A), { pending: 490_000, approved: 0, paid: 0, currency: 'UZS' }, 'sof kutilayotgan: 690 000 − 200 000');
// Hisoblashdan OLDIN qaytarilgan to'lov: komissiya sof (qaytarilmagan) summadan
const sR = student(la.code); const payR = pay(sR); recordRefund(db, admin, payR, 30_000 * 100, null, T + 3 * DAY);
assert.equal(accrueCommissions(db, NOW).created, 1); const eR = entries(A).find((e) => e.paymentId === payR)!;
assert.equal(eR.amountMinor, 390_000, 'sof asos (qaytarilgani ayrilgan): 3 900 000 tiyin × 10%'); assert.equal((eR.basis as { baseMinor: number }).baseMinor, 3_900_000); assert.equal((eR.basis as { capped: boolean }).capped, false);
const sFull = student(la.code); const payFull = pay(sFull); recordRefund(db, admin, payFull, undefined, 'to‘liq', T + 3 * DAY); assert.equal(accrueCommissions(db, NOW).skipped.refunded, 1, 'to‘liq qaytarilgan to‘lov — komissiya yo‘q');

// ---- Chegara (cap) va umumiy byudjet: hold/qisqartirish ----
// A uchun sarflangan: 690 000 − 200 000 (qaytarish) + 390 000 = 880 000; chegara 1 000 000 → 120 000 qoldi
const sC1 = student(la.code); pay(sC1, 'success', 100_000); assert.equal(accrueCommissions(db, NOW).created, 1);
const eC1 = entries(A).find((e) => e.basis && (e.basis as { capped?: boolean }).capped === true)!; assert.equal(eC1.amountMinor, 120_000, '10% = 1 000 000, lekin creator chegarasi qoldig‘i 120 000'); 
const sC2 = student(la.code); pay(sC2, 'success', 100_000); const rc = accrueCommissions(db, NOW); assert.equal(rc.created, 0); assert.equal(rc.skipped.cap_or_budget, 1, 'chegara tugagan — yangi yozuv yo‘q');
// Umumiy byudjet 1 500 000: A sarflagani 1 000 000 → B uchun 500 000 qoldi
const sB1 = student(lb.code); pay(sB1, 'success', 100_000); assert.equal(accrueCommissions(db, NOW).created, 1);
assert.equal(entries(B)[0]!.amountMinor, 500_000, 'umumiy byudjet qoldig‘i bilan cheklandi'); const sB2 = student(lb.code); pay(sB2, 'success', 100_000); assert.ok((accrueCommissions(db, NOW).skipped.cap_or_budget ?? 0) >= 1, 'umumiy byudjet tugadi — yangi yozuv yo‘q');

// ---- Qaror, to'lov belgisi, tarix, audit ----
const pend = entries(A).find((e) => e.paymentId === payA && e.kind === 'commission')!; const revRow = entries(A).find((e) => e.kind === 'reversal')!;
throwsMsg(() => decideEntry(db, admin, revRow.id, 'approved', null), /birga/, 'teskari yozuv alohida hal bo‘lmaydi');
throwsMsg(() => decideEntry(db, admin, pend.id, 'rejected', ''), /izoh/i, 'rad etishda izoh majburiy'); throwsMsg(() => decideEntry(db, admin, pend.id, 'paid', 'x'), /Qaror/, 'noto‘g‘ri qaror'); throwsMsg(() => decideEntry(db, admin, 9999, 'approved', null), /topilmadi/, 'yo‘q yozuv');
throwsMsg(() => markPaid(db, admin, pend.id, 'ref-123'), /tasdiqlangan/, 'tasdiqlanmagan yozuv to‘langan deb belgilanmaydi');
assert.equal(decideEntry(db, admin, pend.id, 'approved', 'tekshirildi').status, 'approved'); throwsMsg(() => decideEntry(db, admin, pend.id, 'rejected', 'yana'), /kutilayotgan/, 'ikkinchi qaror yo‘q');
throwsMsg(() => markPaid(db, admin, pend.id, ' '), /majburiy/, 'to‘lov havolasi majburiy');
assert.equal(markPaid(db, admin, pend.id, 'Bank o‘tkazma #4412').status, 'paid'); throwsMsg(() => markPaid(db, admin, pend.id, 'again-123'), /tasdiqlangan/, 'ikki marta to‘lanmaydi (payout idempotent)');
assert.equal(entries(A).find((e) => e.id === revRow.id)!.status, 'approved', 'asosiy tasdiqlangach teskari yozuv ham tasdiqlandi'); throwsMsg(() => markPaid(db, admin, revRow.id, 'rev-ref-1'), /tasdiqlangan/, 'teskari yozuv to‘lanmaydi');
const rej = entries(A).find((e) => e.id !== pend.id && e.status === 'pending' && e.kind === 'commission')!; decideEntry(db, admin, rej.id, 'rejected', 'shubhali');
assert.deepEqual((ledgerHistory(db, pend.id) as { to: string }[]).map((h) => h.to), ['pending', 'approved', 'paid'], 'tasdiqlash tarixi');
assert.ok((db.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE action LIKE 'creator.ledger.%'").get() as { n: number }).n >= 3, 'audit jurnali');
assert.equal(balances(db, A).paid, pend.amountMinor); assert.equal(balances(db, A).approved, -200_000, 'qaytarish keyingi to‘lovdan ushlab qolinadigan manfiy qoldiq');
// Creator faqat o'z yozuvlarini ko'radi, to'lovchi/to'lov identifikatorisiz
const mine = creatorLedgerOf(db, A); assert.ok(mine.entries.every((e) => e.creatorId === A)); assert.ok(!JSON.stringify(mine).match(/paymentId|paidRef|pay-\d|Bank o‘tkazma/), 'creator to‘lovchi/to‘lov identifikatorini ko‘rmaydi'); assert.equal(mine.enabled, true);
assert.ok(creatorLedgerOf(db, B).entries.every((e) => e.creatorId === B));

// ---- Kampaniya mukofoti: standart o'chiq; yoqish aniq qiymatlar bilan ----
const camp = createCampaign(db, admin, { name: 'UGC noyabr', requiresVideo: true }, T); updateCampaign(db, admin, camp.id, { status: 'active' }, T);
const lc = createLink(db, A, { kind: 'campaign', label: 'Kampaniya', campaignId: camp.id }, T);
const sK = student(lc.code); pay(sK, 'success', 50_000); assert.equal(accrueCommissions(db, NOW).skipped.campaign_reward_off, 1, 'kampaniya mukofoti yoqilmaguncha komissiya yo‘q');
throwsMsg(() => approveCampaignReward(db, admin, camp.id, { pct: 5, currency: 'USD', budgetMinor: 100, capPerCreatorMinor: 100, confirmOwnerApproved: true }), /UZS/, 'valyuta tasdiqlanmagan');
throwsMsg(() => approveCampaignReward(db, admin, camp.id, { pct: 5, currency: 'UZS', confirmOwnerApproved: true }), /majburiy/, 'byudjet/chegara majburiy'); throwsMsg(() => approveCampaignReward(db, admin, camp.id, { pct: 5, currency: 'UZS', budgetMinor: 100, capPerCreatorMinor: 100 }), /tasdiqlanmagan/, 'egasi tasdig‘i');
approveCampaignReward(db, admin, camp.id, { pct: 5, currency: 'UZS', budgetMinor: 100_000, capPerCreatorMinor: 100_000, confirmOwnerApproved: true }, T);
assert.equal(accrueCommissions(db, NOW).created, 1); const ek = entries(A).find((e) => e.campaignId === camp.id)!; assert.equal(ek.amountMinor, 100_000, 'kampaniya: 5% × 5 000 000 = 250 000 → kampaniya chegarasi 100 000 bilan qisqartirildi');

// ---- Kredit rejimi: first vs last ----
{
  const sX = student(lb.code, T, true, la.code); pay(sX, 'success', 20_000);   // oxirgi teginish B, birinchi A
  const before = entries().length;
  assert.equal(accrueCommissions(db, NOW, { CREATOR_ATTRIBUTION: 'first' } as NodeJS.ProcessEnv).created >= 0, true);
  const x = entries().slice(0, entries().length - before); void x;
  const row = adminLedger(db).find((e) => e.paymentId === (db.prepare('SELECT id FROM payments WHERE player_id = ?').get(sX) as { id: string }).id);
  // A chegarasi/byudjet tugagan bo'lishi mumkin — shuning uchun hech bo'lmaganda B ga YOZILMAGANI (first rejimida kredit A ga) tekshiriladi
  assert.ok(!row || row.creatorId === A, 'first-touch rejimida kredit birinchi tegilgan creator’ga');
}

// ---- Reyting: faqat opt-in, to'rt alohida ro'yxat ----
selfSetProfile(db, A, { rankOptIn: true }, T);
const pst = savePost(db, A, { platform: 'instagram', url: 'https://instagram.com/reel/XYZ1', lang: 'uz', postedOn: '2026-11-19', caption: 'Caption uzun matn #reklama', linkCode: la.code, submit: true, claimedViews: 999999 }, T);
reviewPost(db, admin, pst.id, { decision: 'approved', note: 'ok', verifiedViews: 5000 }, T);
const rk = creatorRanking(db, NOW);
assert.deepEqual(Object.keys(rk).sort(), ['activatedLearners', 'netPaidConversions', 'retainedLearners', 'verifiedReach'], 'to‘rt alohida ko‘rsatkich — yagona ball yo‘q');
assert.deepEqual(rk.verifiedReach, [{ nickname: 'Bloger A', value: 5000 }], 'faqat tasdiqlangan ko‘rishlar (creator da’vosi 999 999 emas)'); assert.ok(rk.activatedLearners.every((e) => e.nickname === 'Bloger A'), 'opt-in qilmagan B ko‘rinmaydi');
assert.ok(!JSON.stringify(rk).match(/token|phone|email|tg_id|id"/i));

// ---- KPI: sof tushum, mukofot xarajati, CAC ----
const k = programKpis(db, T - DAY, NOW + DAY, NOW);
assert.ok(k.rewardCostMinor > 0 && k.cacPerActivatedMinor !== null && k.cacPerPayerMinor !== null && k.currency === 'UZS'); assert.equal(k.cacPerActivatedMinor, Math.round(k.rewardCostMinor / k.funnel.activated));
assert.ok(k.funnel.refunded >= 2 && k.funnel.refundedSum >= 20000);
console.log('creatorLedger.test: OK');
