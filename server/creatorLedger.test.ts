import assert from 'node:assert/strict';
import { byToken, createDb, join, loginTelegram, setRole } from './db';
import { addFlag, attachAttribution, createLink } from './creatorLinks';
import { adminSetProfile, createCampaign, reviewPost, savePost, selfSetProfile, updateCampaign } from './creatorOps';
import { accrueRewards, addManualEntry, adminLedger, balances, createRule, creatorCosts, creatorEarnings, creatorRanking, decideEntry, disableRule, enableRule, ledgerHistory, listRules, markPaid, programKpis, recordRefund, ruleUsage, updateRule } from './creatorLedger';
import { awardXp } from './xp';

const DAY = 86_400_000, T = Date.UTC(2026, 10, 20, 8), NOW = T + 50 * DAY;
const throwsMsg = (fn: () => unknown, re: RegExp, msg: string) => assert.throws(fn, (e: Error) => re.test(e.message), msg);
const ENV_FIRST = { CREATOR_ATTRIBUTION: 'first' } as NodeJS.ProcessEnv;

/** Har blok o'z bazasida: qoidalar bir-biriga ta'sir qilmasin. */
function fresh() {
  const db = createDb(); let tg = 5000, pn = 0;
  const pl = (n: string) => byToken(db, join(db, n, T).token).id;
  const admin = pl('Admin Bosh');
  const creator = (n: string) => { const id = pl(n); setRole(db, n, 'creator'); return { id, nick: n, link: createLink(db, id, { kind: 'bio', label: `${n} bio` }, T) }; };
  const student = (code: string, at = T, active = true, code0?: string, fp: string | null = null) => {
    const id = byToken(db, loginTelegram(db, ++tg, `S${tg}`, undefined, at).token).id;
    attachAttribution(db, id, { ref: code, ref0: code0 ?? code }, fp, at);
    if (active) awardXp(db, id, `ls-${id}-event`, 'lesson', 20, at + 1000);
    return id;
  };
  const pay = (pid: number, status = 'success', amount = 69000, at = T + DAY) => { const id = `pay-${++pn}`; db.prepare('INSERT INTO payments (id, player_id, track, days, amount, status, created_at, paid_at) VALUES (?, ?, ?, 30, ?, ?, ?, ?)').run(id, pid, 'exam', amount, status, at, status === 'success' ? at : null); return id; };
  const rule = (b: Record<string, unknown>, on = true) => { const r = createRule(db, admin, { hold: 0, capPerCreatorMinor: 10_000_000, budgetMinor: 50_000_000, holdDays: 0, ...b }, T); return on ? enableRule(db, admin, r.id, { confirmOwnerApproved: true }, T) : r; };
  const entries = (creatorId?: number) => adminLedger(db).filter((e) => creatorId === undefined || e.creatorId === creatorId);
  return { db, admin, pl, creator, student, pay, rule, entries };
}

// ---- 1. Standart: qoida yo'q → hech narsa hisoblanmaydi; creator "yoqilmagan" ko'radi ----
{
  const E = fresh(); const A = E.creator('Bloger A'); const s = E.student(A.link.code); E.pay(s);
  assert.deepEqual(accrueRewards(E.db, NOW), { created: 0, skipped: {}, disabled: true, byRule: {} }, 'standart: o‘chiq');
  assert.equal(E.entries().length, 0); assert.equal(creatorEarnings(E.db, A.id, NOW).enabled, false); assert.equal(listRules(E.db).length, 0);
}

// ---- 2. Qoida yaratish/yoqish: egasi tasdig'i, byudjet, o'zgartirish taqiqi ----
{
  const E = fresh();
  throwsMsg(() => createRule(E.db, E.admin, { kind: 'signup_flat', name: 'Qoida' }), /turi/, 'ro‘yxatdan o‘tganlik uchun mukofot turi yo‘q');
  throwsMsg(() => createRule(E.db, E.admin, { kind: 'paid_pct', name: 'ab' }), /nomi/, 'nom'); throwsMsg(() => createRule(E.db, E.admin, { kind: 'paid_pct', name: 'Qoida 1', pct: 150 }), /Foiz/, 'foiz');
  throwsMsg(() => createRule(E.db, E.admin, { kind: 'activated_flat', name: 'Qoida 1', amountMinor: -5 }), /Summa/, 'summa'); throwsMsg(() => createRule(E.db, E.admin, { kind: 'paid_pct', name: 'Qoida 1', pct: 5, holdDays: 100 }), /Kutish/, 'kutish davri');
  throwsMsg(() => createRule(E.db, E.admin, { kind: 'paid_pct', name: 'Qoida 1', pct: 5, campaignId: 999 }), /Kampaniya/, 'yo‘q kampaniya'); throwsMsg(() => createRule(E.db, E.admin, { kind: 'paid_pct', name: 'Qoida 1', pct: 5, startsAt: T, endsAt: T - 1 }), /Tugash/, 'sana tartibi');
  const r = createRule(E.db, E.admin, { kind: 'paid_pct', name: 'Komissiya 10%', pct: 10 }, T);
  assert.equal(r.enabled, false, 'yangi qoida hamisha o‘chiq'); assert.equal(r.currency, 'UZS');
  throwsMsg(() => enableRule(E.db, E.admin, r.id, { confirmOwnerApproved: true }), /creator chegarasi va umumiy byudjet/, 'byudjetsiz yoqilmaydi');
  updateRule(E.db, E.admin, r.id, { capPerCreatorMinor: 1_000_000, budgetMinor: 1_500_000 }, T);
  throwsMsg(() => enableRule(E.db, E.admin, r.id, {}), /tasdiqlanmagan/, 'egasi tasdig‘isiz yoqilmaydi'); assert.equal(listRules(E.db)[0]!.enabled, false);
  assert.equal(enableRule(E.db, E.admin, r.id, { confirmOwnerApproved: true }, T).enabled, true);
  throwsMsg(() => updateRule(E.db, E.admin, r.id, { pct: 50 }), /o‘zgartirib bo‘lmaydi/, 'yoqilgan qoida shartlari jimgina o‘zgarmaydi');
  assert.equal(disableRule(E.db, E.admin, r.id, T).enabled, false); assert.equal(updateRule(E.db, E.admin, r.id, { pct: 12 }, T).pct, 12);
  const v = createRule(E.db, E.admin, { kind: 'verified_views_per_1k', name: 'Ko‘rishlar', amountMinor: 50_000, capPerCreatorMinor: 1_000_000, budgetMinor: 5_000_000 }, T);
  throwsMsg(() => enableRule(E.db, E.admin, v.id, { confirmOwnerApproved: true }), /post chegarasi/, 'ko‘rishlar mukofoti post chegarasisiz yoqilmaydi');
  const f = createRule(E.db, E.admin, { kind: 'activated_flat', name: 'Faollashgan boshiga', capPerCreatorMinor: 1_000, budgetMinor: 1_000 }, T);
  throwsMsg(() => enableRule(E.db, E.admin, f.id, { confirmOwnerApproved: true }), /foiz yoki summani/, 'summasiz yoqilmaydi');
  throwsMsg(() => updateRule(E.db, E.admin, 999, {}), /topilmadi/, 'yo‘q qoida');
  assert.ok((E.db.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE action LIKE 'reward.rule.%'").get() as { n: number }).n >= 5, 'audit jurnali');
}

// ---- 3. paid_pct: faqat muvaffaqiyatli, faollashgan, qaytarilmagan; idempotent; cap/byudjet; kutish davri; refund ----
{
  const E = fresh(); const A = E.creator('Bloger A'); const B = E.creator('Bloger B');
  E.rule({ kind: 'paid_pct', name: 'Komissiya 10%', pct: 10, capPerCreatorMinor: 1_000_000, budgetMinor: 1_500_000, holdDays: 7 });
  const s1 = E.student(A.link.code); const p1 = E.pay(s1, 'success', 69000, T + DAY);
  // kutish davri: 7 kun o'tmaguncha hisoblanmaydi, lekin creator "kutish davrida" taxminiy summani ko'radi
  assert.deepEqual({ ...accrueRewards(E.db, T + 7 * DAY), byRule: {} }, { created: 0, skipped: { hold: 1 }, disabled: false, byRule: {} }, 'kutish davri o‘tmagan');
  assert.equal(creatorEarnings(E.db, A.id, T + 7 * DAY).inHoldMinor, 690_000, 'creator kutish davridagi taxminiy summani ko‘radi'); assert.equal(creatorEarnings(E.db, B.id, T + 7 * DAY).inHoldMinor, 0, 'boshqa creator’niki ko‘rinmaydi');
  assert.equal(accrueRewards(E.db, T + 8 * DAY).created, 1, 'kutish davridan keyin'); const e1 = E.entries(A.id)[0]!;
  assert.deepEqual({ kind: e1.kind, status: e1.status, currency: e1.currency, amountMinor: e1.amountMinor }, { kind: 'commission', status: 'pending', currency: 'UZS', amountMinor: 690_000 }, '69 000 so‘m = 6 900 000 tiyin × 10%');
  assert.equal(accrueRewards(E.db, NOW).created, 0, 'takror ishga tushirish — takror yozuv yo‘q (idempotent)'); assert.equal(creatorEarnings(E.db, A.id, NOW).inHoldMinor, 0);
  // Mos kelmaydiganlar: bekor qilingan to'lov, faollashmagan o'quvchi, oynadan tashqari, o'z-o'zini taklif belgisi, to'xtatilgan creator
  E.pay(E.student(A.link.code), 'cancelled'); E.pay(E.student(A.link.code, T, false)); E.pay(E.student(A.link.code), 'success', 69000, T + 200 * DAY);
  const sSelf = E.student(A.link.code); E.pay(sSelf); addFlag(E.db, A.id, A.link.code, 'self_referral', '{}', `sr:${A.id}:${sSelf}`, T);
  assert.equal(accrueRewards(E.db, T + 300 * DAY).created, 0, 'bekor qilingan / faollashmagan / 180 kundan keyingi / belgilangan — mukofot yo‘q'); assert.equal(E.entries().length, 1);
  adminSetProfile(E.db, E.admin, 'Bloger B', { status: 'paused' }, T); assert.equal(E.db.prepare('SELECT 1 FROM creator_attrib WHERE player_id = ?').get(E.student(B.link.code)), undefined, 'to‘xtatilgan hamkor linki atribusiya bermaydi'); adminSetProfile(E.db, E.admin, 'Bloger B', { status: 'approved' }, T);
  // Qaytarish
  throwsMsg(() => recordRefund(E.db, E.admin, 'yo-q', 100, null), /topilmadi/, 'yo‘q to‘lov'); throwsMsg(() => recordRefund(E.db, E.admin, p1, 69000 * 100 + 1, null), /noto‘g‘ri/, 'to‘lovdan ortiq');
  assert.deepEqual(recordRefund(E.db, E.admin, p1, 20_000 * 100, 'qisman', T + 5 * DAY), { reversal: -200_000 }, 'komissiyadan mutanosib');
  throwsMsg(() => recordRefund(E.db, E.admin, p1, 100, null), /allaqachon/, 'ikkinchi marta qayd etilmaydi (idempotent)');
  const rev = E.entries(A.id).find((e) => e.kind === 'reversal')!; assert.equal(rev.status, 'pending', 'asosiy yozuv kutilayotgan — teskari ham');
  assert.deepEqual(balances(E.db, A.id), { pending: 490_000, approved: 0, paid: 0, currency: 'UZS' });
  // Hisoblashdan OLDIN qaytarilgan: sof asosdan; to'liq qaytarilgan: yozuv yo'q
  const sR = E.student(A.link.code); const pR = E.pay(sR); recordRefund(E.db, E.admin, pR, 30_000 * 100, null, T + 3 * DAY);
  const sF = E.student(A.link.code); recordRefund(E.db, E.admin, E.pay(sF), undefined, 'to‘liq', T + 3 * DAY);
  assert.equal(accrueRewards(E.db, NOW).created, 1); const eR = E.entries(A.id).find((e) => e.paymentId === pR)!; assert.equal(eR.amountMinor, 390_000, 'sof asos 3 900 000 tiyin × 10%'); assert.equal((eR.basis as { baseMinor: number }).baseMinor, 3_900_000);
  // Cap va byudjet: A sarflagan 690 000 − 200 000 + 390 000 = 880 000; cap 1 000 000 → 120 000 qoldi
  E.pay(E.student(A.link.code), 'success', 100_000); assert.equal(accrueRewards(E.db, NOW).created, 1);
  assert.equal(E.entries(A.id).find((e) => (e.basis as { capped?: boolean } | null)?.capped === true)!.amountMinor, 120_000, 'creator chegarasi qoldig‘i bilan qisqartirildi');
  E.pay(E.student(A.link.code), 'success', 100_000); assert.equal(accrueRewards(E.db, NOW).created, 0, 'creator chegarasi tugadi'); assert.equal(accrueRewards(E.db, NOW).skipped.cap_or_budget, 1);
  E.pay(E.student(B.link.code), 'success', 100_000); assert.equal(accrueRewards(E.db, NOW).created, 1); assert.equal(E.entries(B.id)[0]!.amountMinor, 500_000, 'umumiy byudjet qoldig‘i (1 500 000 − 1 000 000) bilan cheklandi');
  const u = ruleUsage(E.db)[0]!; assert.equal(u.spentMinor, 1_500_000); assert.equal(u.remainingMinor, 0, 'byudjet ishlatilishi ko‘rinadi');
  // Qaror, to'lov belgisi, tarix, audit
  const pend = E.entries(A.id).find((e) => e.paymentId === p1 && e.kind === 'commission')!;
  throwsMsg(() => decideEntry(E.db, E.admin, rev.id, 'approved', null), /birga/, 'teskari yozuv alohida hal bo‘lmaydi'); throwsMsg(() => decideEntry(E.db, E.admin, pend.id, 'rejected', ''), /izoh/i, 'rad etishda izoh majburiy'); throwsMsg(() => decideEntry(E.db, E.admin, pend.id, 'paid', 'x'), /Qaror/, 'noto‘g‘ri qaror');
  throwsMsg(() => markPaid(E.db, E.admin, pend.id, 'ref-123'), /tasdiqlangan/, 'tasdiqlanmagan yozuv to‘lanmaydi');
  assert.equal(decideEntry(E.db, E.admin, pend.id, 'approved', 'tekshirildi').status, 'approved'); assert.equal(E.entries(A.id).find((e) => e.id === rev.id)!.status, 'approved', 'asosiy tasdiqlangach teskari yozuv ham');
  throwsMsg(() => decideEntry(E.db, E.admin, pend.id, 'rejected', 'yana'), /kutilayotgan/, 'ikkinchi qaror yo‘q'); throwsMsg(() => markPaid(E.db, E.admin, pend.id, ' '), /majburiy/, 'to‘lov havolasi majburiy');
  assert.equal(markPaid(E.db, E.admin, pend.id, 'Bank o‘tkazma #4412').status, 'paid'); throwsMsg(() => markPaid(E.db, E.admin, pend.id, 'again-123'), /tasdiqlangan/, 'ikki marta to‘lanmaydi (payout idempotent)'); throwsMsg(() => markPaid(E.db, E.admin, rev.id, 'rev-ref-1'), /tasdiqlangan/, 'teskari yozuv to‘lanmaydi');
  assert.deepEqual((ledgerHistory(E.db, pend.id) as { to: string }[]).map((h) => h.to), ['pending', 'approved', 'paid']);
  assert.ok((E.db.prepare("SELECT COUNT(*) AS n FROM admin_audit WHERE action LIKE 'creator.ledger.%'").get() as { n: number }).n >= 2, 'audit jurnali');
  assert.equal(balances(E.db, A.id).paid, 690_000); assert.equal(balances(E.db, A.id).approved, -200_000, 'qaytarish keyingi to‘lovdan ushlab qolinadigan manfiy qoldiq');
  // Creator ko'rinishi: faqat o'ziniki, to'lovchi/to'lov/byudjetsiz, shartlar ochiq
  const mine = creatorEarnings(E.db, A.id, NOW); assert.ok(mine.entries.every((e) => e.creatorId === A.id)); assert.equal(mine.enabled, true);
  { const j = JSON.stringify(mine); const bad = j.match(/paymentId|paidRef|pay-\d|Bank o‘tkazma|budget|capPer/); assert.ok(!bad, `creator to‘lovchi/to‘lov/byudjet ma’lumotini ko‘rmaydi: ${bad?.[0]} ${j.slice(0, 400)}`); } assert.deepEqual(mine.terms.map((t) => [t.kind, t.pct, t.holdDays]), [['paid_pct', 10, 7]]);
  assert.ok(creatorEarnings(E.db, B.id, NOW).entries.every((e) => e.creatorId === B.id));
  // Admin: creator boshiga xarajat
  const costs = creatorCosts(E.db); const cA = costs.find((c) => c.creatorId === A.id)!; assert.equal(cA.paid, 690_000); assert.equal(cA.total, cA.pending + cA.approved + cA.paid); assert.equal(costs.find((c) => c.creatorId === B.id)!.pending, 500_000);
  const k = programKpis(E.db, T - DAY, NOW + DAY, NOW); assert.ok(k.rewardCostMinor > 0 && k.cacPerActivatedMinor !== null && k.currency === 'UZS'); assert.equal(k.cacPerActivatedMinor, Math.round(k.rewardCostMinor / k.funnel.activated));
}

// ---- 4. activated_flat: faollashgan o'quvchi boshiga qat'iy summa (bir marta; ro'yxatdan o'tganlik uchun emas) ----
{
  const E = fresh(); const A = E.creator('Bloger A');
  E.rule({ kind: 'activated_flat', name: 'Faollashgan boshiga 50 000', amountMinor: 5_000_000, holdDays: 3, capPerCreatorMinor: 12_000_000, budgetMinor: 12_000_000 });
  const act = E.student(A.link.code); E.student(A.link.code, T, false); E.student(A.link.code, T, false);   // 1 faollashgan, 2 faqat ro'yxatdan o'tgan
  assert.equal(accrueRewards(E.db, T + 2 * DAY).created, 0, 'kutish davri o‘tmagan'); assert.equal(creatorEarnings(E.db, A.id, T + 2 * DAY).inHoldMinor, 5_000_000);
  assert.equal(accrueRewards(E.db, T + 4 * DAY).created, 1, 'faqat faollashgan o‘quvchi uchun; ro‘yxatdan o‘tganlik uchun mukofot yo‘q'); const e = E.entries(A.id)[0]!;
  assert.deepEqual({ kind: e.kind, amount: e.amountMinor, status: e.status }, { kind: 'cpa_activated', amount: 5_000_000, status: 'pending' });
  assert.equal(accrueRewards(E.db, NOW).created, 0, 'bir o‘quvchi — bir marta'); assert.equal(E.entries().length, 1);
  // 7 kundan keyin faollashgan o'quvchi — faollashgan hisoblanmaydi
  const late = E.student(A.link.code, T, false); awardXp(E.db, late, `ls-${late}-late1`, 'lesson', 20, T + 8 * DAY); assert.equal(accrueRewards(E.db, NOW).created, 0, '7 kundan keyin bajargan — faollashgan emas');
  // Firibgarlik belgilari: o'z-o'zini taklif, bir qurilmadan ko'p hisob, click qayta ishlatilgan
  const sSelf = E.student(A.link.code); addFlag(E.db, A.id, A.link.code, 'self_referral', '{}', `sr:${A.id}:${sSelf}`, T);
  for (let i = 0; i < 3; i++) E.student(A.link.code, T, true, undefined, 'samefp0000000000');
  addFlag(E.db, A.id, A.link.code, 'same_device_signups', '{"n":3}', `sds:${A.id}:samefp0000000000:2026-11-20`, T);
  assert.equal(accrueRewards(E.db, NOW).created, 0, 'belgilangan o‘quvchilar uchun mukofot yo‘q'); void act;
  // Byudjet 12 000 000: 5 000 000 sarflangan → yana bitta to'liq (5 000 000), keyingisi 2 000 000 bilan cheklanadi, undan keyingisi — yozuvsiz
  for (let i = 0; i < 3; i++) E.student(A.link.code); const r = accrueRewards(E.db, NOW);
  assert.equal(r.created, 2); assert.equal(r.skipped.cap_or_budget, 1); assert.deepEqual(E.entries(A.id).map((x) => x.amountMinor).sort((a, b) => a - b), [2_000_000, 5_000_000, 5_000_000], 'byudjet qoldig‘i bilan cheklangan oxirgi yozuv');
  assert.equal(ruleUsage(E.db)[0]!.remainingMinor, 0);
}

// ---- 5. first_paid_flat: birinchi to'lov boshiga (bir marta); faqat to'liq qaytarilsa teskari yozuv ----
{
  const E = fresh(); const A = E.creator('Bloger A');
  E.rule({ kind: 'first_paid_flat', name: 'Birinchi to‘lov 30 000', amountMinor: 3_000_000 });
  const s = E.student(A.link.code); const p1 = E.pay(s, 'success', 69000, T + DAY); E.pay(s, 'success', 69000, T + 40 * DAY);
  assert.equal(accrueRewards(E.db, NOW).created, 1, 'ikki to‘lov — bitta mukofot'); assert.equal(E.entries(A.id)[0]!.kind, 'cpa_first_paid');
  assert.equal(recordRefund(E.db, E.admin, p1, 10_000 * 100, 'qisman', NOW).reversal, 0, 'qisman qaytarish qat’iy summani qaytarmaydi');
  const E2 = fresh(); const A2 = E2.creator('Bloger A'); E2.rule({ kind: 'first_paid_flat', name: 'Birinchi to‘lov 30 000', amountMinor: 3_000_000 });
  const q1 = E2.pay(E2.student(A2.link.code)); accrueRewards(E2.db, NOW); assert.equal(recordRefund(E2.db, E2.admin, q1, undefined, 'to‘liq', NOW).reversal, -3_000_000, 'to‘liq qaytarish — to‘liq teskari yozuv'); assert.equal(balances(E2.db, A2.id).pending, 0);
}

// ---- 6. verified_views_per_1k: faqat ADMIN tasdiqlagan ko'rishlar; creator da'vosiga hech qachon ----
{
  const E = fresh(); const A = E.creator('Bloger A');
  E.rule({ kind: 'verified_views_per_1k', name: 'Har 1000 ko‘rish 5 000', amountMinor: 500_000, capPerItemMinor: 1_500_000, capPerCreatorMinor: 5_000_000, budgetMinor: 8_000_000 });
  const submit = (url: string, views: number) => savePost(E.db, A.id, { platform: 'instagram', url, lang: 'uz', postedOn: '2026-11-19', caption: 'Caption uzun matn #reklama', linkCode: A.link.code, claimedViews: views, submit: true }, T);
  const p1 = submit('https://instagram.com/reel/AAA1', 900_000);   // creator katta da'vo qiladi
  assert.equal(accrueRewards(E.db, NOW).created, 0, 'topshirilgan, tasdiqlanmagan post uchun — mukofot yo‘q');
  reviewPost(E.db, E.admin, p1.id, { decision: 'approved', note: 'ok' }, T); assert.equal(accrueRewards(E.db, NOW).created, 0, 'tasdiqlangan, lekin ko‘rishlar tasdiqlanmagan — mukofot yo‘q (creator da’vosiga to‘lanmaydi)');
  const p2 = submit('https://instagram.com/reel/BBB2', 100); reviewPost(E.db, E.admin, p2.id, { decision: 'approved', note: 'ok', verifiedViews: 5400 }, T);
  assert.equal(accrueRewards(E.db, NOW).created, 1); const e = E.entries(A.id)[0]!; assert.deepEqual({ kind: e.kind, amount: e.amountMinor }, { kind: 'views', amount: 1_500_000 }, '5 × 500 000 = 2 500 000, post chegarasi 1 500 000');
  assert.equal(accrueRewards(E.db, NOW).created, 0, 'idempotent');
  const p3 = submit('https://instagram.com/reel/CCC3', 0); reviewPost(E.db, E.admin, p3.id, { decision: 'rejected', note: 'brend qoidalari' }, T); assert.equal(accrueRewards(E.db, NOW).created, 0, 'rad etilgan post');
  const p4 = submit('https://instagram.com/reel/DDD4', 0); reviewPost(E.db, E.admin, p4.id, { decision: 'approved', note: 'ok', verifiedViews: 999 }, T); assert.equal(accrueRewards(E.db, NOW).created, 0, '1000 dan kam tasdiqlangan ko‘rish');
}

// ---- 7. Kampaniya doirasi: kampaniya linki faqat kampaniya qoidasiga bo'ysunadi; global qoida kampaniyasiz linklarga ----
{
  const E = fresh(); const A = E.creator('Bloger A'); const camp = createCampaign(E.db, E.admin, { name: 'UGC noyabr' }, T); updateCampaign(E.db, E.admin, camp.id, { status: 'active' }, T);
  const lc = createLink(E.db, A.id, { kind: 'campaign', label: 'Kampaniya', campaignId: camp.id }, T);
  E.rule({ kind: 'paid_pct', name: 'Global 10%', pct: 10 }); const sK = E.student(lc.code); E.pay(sK, 'success', 50_000);
  assert.equal(accrueRewards(E.db, NOW).created, 0, 'kampaniya linki global qoidaga tushmaydi (kampaniya qoidasi yoqilmagan)');
  E.rule({ kind: 'paid_pct', name: 'Kampaniya 5%', pct: 5, campaignId: camp.id, capPerCreatorMinor: 100_000, budgetMinor: 100_000 });
  assert.equal(accrueRewards(E.db, NOW).created, 1); assert.equal(E.entries(A.id)[0]!.amountMinor, 100_000, 'kampaniya: 5% × 5 000 000 = 250 000 → chegara 100 000'); assert.equal(E.entries(A.id)[0]!.campaignId, camp.id);
  E.pay(E.student(A.link.code), 'success', 20_000); assert.equal(accrueRewards(E.db, NOW).created, 1, 'kampaniyasiz link — global qoida'); assert.equal(E.entries(A.id).filter((e) => e.campaignId === null).length, 1);
}

// ---- 8. Kredit rejimi: first-touch va last-touch ----
{
  const E = fresh(); const A = E.creator('Bloger A'); const B = E.creator('Bloger B');
  E.rule({ kind: 'activated_flat', name: 'Faollashgan 10 000', amountMinor: 1_000_000 }); E.student(B.link.code, T, true, A.link.code);   // oxirgi B, birinchi A
  assert.equal(accrueRewards(E.db, NOW).created, 1); assert.equal(E.entries(B.id).length, 1, 'standart (last): oxirgi tegilgan creator'); assert.equal(E.entries(A.id).length, 0);
  const E2 = fresh(); const A2 = E2.creator('Bloger A'); const B2 = E2.creator('Bloger B'); E2.rule({ kind: 'activated_flat', name: 'Faollashgan 10 000', amountMinor: 1_000_000 }); E2.student(B2.link.code, T, true, A2.link.code);
  assert.equal(accrueRewards(E2.db, NOW, ENV_FIRST).created, 1); assert.equal(E2.entries(A2.id).length, 1, 'CREATOR_ATTRIBUTION=first: birinchi tegilgan creator'); assert.equal(E2.entries(B2.id).length, 0);
}

// ---- 9. Qo'lda yozuv (admin summa kiritadi) va creator boshiga xarajat ----
{
  const E = fresh(); const A = E.creator('Bloger A'); E.pl('Oddiy User');
  const r = E.rule({ kind: 'paid_pct', name: 'Global 10%', pct: 10, budgetMinor: 1_000_000, capPerCreatorMinor: 1_000_000 });
  throwsMsg(() => addManualEntry(E.db, E.admin, { nickname: 'Oddiy User', amountMinor: 100, note: 'sabab matni' }), /topilmadi/, 'creator bo‘lmagan'); throwsMsg(() => addManualEntry(E.db, E.admin, { nickname: 'Bloger A', amountMinor: 0, note: 'sabab matni' }), /Summa/, 'nol'); throwsMsg(() => addManualEntry(E.db, E.admin, { nickname: 'Bloger A', amountMinor: 1.5, note: 'sabab matni' }), /Summa/, 'kasr');
  throwsMsg(() => addManualEntry(E.db, E.admin, { nickname: 'Bloger A', amountMinor: 100, note: 'abc' }), /Sabab/, 'sabab majburiy');
  const b = addManualEntry(E.db, E.admin, { nickname: 'bloger a', amountMinor: 2_500_000, note: 'Reel uchun maxsus bonus' }, T); assert.deepEqual({ kind: b.kind, status: b.status, amount: b.amountMinor }, { kind: 'bonus', status: 'pending', amount: 2_500_000 });
  throwsMsg(() => addManualEntry(E.db, E.admin, { nickname: 'Bloger A', amountMinor: 2_000_000, note: 'qoida byudjetidan oshadi', ruleId: r.id }), /byudjet/, 'qoida byudjetidan oshmaydi');
  const adj = addManualEntry(E.db, E.admin, { nickname: 'Bloger A', amountMinor: -500_000, note: 'oldingi bonusni tuzatish' }, T); assert.equal(adj.kind, 'adjustment');
  assert.equal(decideEntry(E.db, E.admin, b.id, 'approved', null).status, 'approved'); throwsMsg(() => markPaid(E.db, E.admin, adj.id, 'ref-adj-1'), /tasdiqlangan/, 'tuzatish to‘lanmaydi'); assert.equal(markPaid(E.db, E.admin, b.id, 'Payme #991').status, 'paid');
  assert.equal(decideEntry(E.db, E.admin, adj.id, 'approved', null).status, 'approved');
  const c = creatorCosts(E.db)[0]!; assert.deepEqual({ nick: c.nickname, paid: c.paid, approved: c.approved, total: c.total }, { nick: 'Bloger A', paid: 2_500_000, approved: -500_000, total: 2_000_000 }, 'admin creator boshiga xarajatni ko‘radi');
}

// ---- 10. Reyting: faqat opt-in, to'rt alohida ro'yxat; faqat tasdiqlangan ko'rishlar ----
{
  const E = fresh(); const A = E.creator('Bloger A'); E.creator('Bloger B'); const s = E.student(A.link.code); E.pay(s);
  selfSetProfile(E.db, A.id, { rankOptIn: true }, T);
  const pst = savePost(E.db, A.id, { platform: 'instagram', url: 'https://instagram.com/reel/XYZ1', lang: 'uz', postedOn: '2026-11-19', caption: 'Caption uzun matn #reklama', linkCode: A.link.code, submit: true, claimedViews: 999999 }, T); reviewPost(E.db, E.admin, pst.id, { decision: 'approved', note: 'ok', verifiedViews: 5000 }, T);
  const rk = creatorRanking(E.db, NOW); assert.deepEqual(Object.keys(rk).sort(), ['activatedLearners', 'netPaidConversions', 'retainedLearners', 'verifiedReach'], 'to‘rt alohida ko‘rsatkich — yagona ball yo‘q');
  assert.deepEqual(rk.verifiedReach, [{ nickname: 'Bloger A', value: 5000 }], 'faqat tasdiqlangan ko‘rishlar'); assert.ok(rk.activatedLearners.every((e) => e.nickname === 'Bloger A'), 'opt-in qilmagan B ko‘rinmaydi'); assert.ok(!JSON.stringify(rk).match(/token|phone|email|tg_id|"id"/i));
}
console.log('creatorLedger.test: OK');
