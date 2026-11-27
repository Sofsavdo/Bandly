import assert from 'node:assert/strict';
import { createDb, join } from './db';
import { applyResult, createPayment, type PaymentRow } from './payments';
import { OWN_PREFIX, cardPayConfigFromEnv, ensureCardPayTables, loadCardPayConfig, ownCardApi, poolOf, routedApi, type CardPayConfig } from './cardPay';
import { activeCards, cardUsage, deleteCard, digitsOf, fits, fmtCardNumber, listCards, monthStart, pickCard, saveCard } from './cardPool';
import { addCard, editCard, overview, removeCard, setConfig } from './cardPayAdmin';
import type { HamyonApi } from './hamyon';

const T0 = Date.UTC(2026, 0, 15, 10); // 15-yanvar, Toshkent 15:00
const MIN = 60_000, DAY = 86_400_000;
const C1 = '8600123456789012', C2 = '5614681742449584', C3 = '9860111122223333';
const base = (over: Partial<CardPayConfig> = {}): CardPayConfig => ({ mode: 'live', card: '', windowMs: 15 * MIN, graceMs: 180 * MIN, sources: ['CardXabarBot'], strategy: 'spread', reservePct: 10, ...over });
const mk = () => { const db = createDb(':memory:'); ensureCardPayTables(db); return db; };
let n = 0;
const player = (db: ReturnType<typeof mk>) => join(db, `User${++n}`, T0).token;
const open = async (db: ReturnType<typeof mk>, api: HamyonApi, now: number, track = 'general') => createPayment(db, api, player(db), track, 30, now, {});
const pay = (db: ReturnType<typeof mk>, id: string, amount: number, now: number) => applyResult(db, id, 'paid', { paidAmount: amount }, now);

// ---- Yordamchilar ----
assert.equal(digitsOf('8600 1234-5678 9012'), C1);
assert.equal(fmtCardNumber(C1), '8600 1234 5678 9012');
assert.equal(monthStart(T0), Date.UTC(2026, 0, 1) - 5 * 3_600_000, 'oy boshi — Toshkent vaqti bilan');

// ---- Karta qo'shish/tahrirlash/o'chirish ----
{
  const db = mk();
  const a = saveCard(db, { number: '8600 1234 5678 9012', label: 'Asosiy', dailyLimit: 5_000_000, monthlyLimit: 50_000_000 }, undefined, T0);
  assert.equal(a.number, C1); assert.equal(a.enabled, true); assert.equal(a.priority, 100);
  assert.throws(() => saveCard(db, { number: '1234' }), /16/, 'noto‘g‘ri raqam');
  assert.throws(() => saveCard(db, { number: C1 }), /allaqachon/, 'takror karta');
  assert.throws(() => saveCard(db, { number: C2, dailyLimit: -1 }), /butun son/);
  assert.throws(() => saveCard(db, { number: C2, dailyLimit: 1.5 }), /butun son/);
  const e = saveCard(db, { enabled: false, label: 'Zaxira' }, a.id);
  assert.equal(e.enabled, false); assert.equal(e.label, 'Zaxira'); assert.equal(e.dailyLimit, 5_000_000, 'berilmagan maydon saqlanadi');
  assert.throws(() => saveCard(db, { label: 'x' }, 'nope'), /topilmadi/);
  assert.equal(listCards(db).length, 1);
  deleteCard(db, a.id);
  assert.equal(listCards(db).length, 0);
  assert.throws(() => deleteCard(db, a.id), /topilmadi/);
}

// ---- Eski (bitta karta, env) rejimi ----
{
  const db = mk();
  assert.equal(activeCards(db, { strategy: 'spread', reservePct: 0, legacyCard: C1 })[0]!.number, C1, 'havzada karta yo‘q — env karta');
  assert.deepEqual(activeCards(db, { strategy: 'spread', reservePct: 0, legacyCard: '' }), []);
  saveCard(db, { number: C2, enabled: false });
  assert.deepEqual(activeCards(db, { strategy: 'spread', reservePct: 0, legacyCard: C1 }), [], 'havzada karta bor, lekin o‘chiq — env karta ishlatilmaydi');
}

// ---- Limit: sig'maydigan karta ko'rsatilmaydi; zaxira foizi; ochiq to'lov joyni band qiladi ----
{
  const db = mk();
  saveCard(db, { number: C1, dailyLimit: 100_000 }, undefined, T0);
  const cfg = base();
  const api = ownCardApi(db, cfg, () => T0);
  const p1 = await open(db, api, T0);
  assert.equal(p1.card, fmtCardNumber(C1)); assert.equal(p1.pay_amount, 69_000);
  // 69 000 band (ochiq): yana 69 000 → 138 000 > 90 000 (zaxira 10%) — karta sig'maydi, boshqa karta yo'q
  const b = player(db);
  await assert.rejects(() => createPayment(db, api, b, 'general', 30, T0 + MIN, {}), (e: unknown) => (e as { status?: number }).status === 502);
  assert.equal(cardUsage(db, C1, T0).reserved, 69_000);
  pay(db, p1.id, 69_000, T0 + 2 * MIN);
  const u = cardUsage(db, C1, T0 + 3 * MIN);
  assert.equal(u.day, 69_000); assert.equal(u.reserved, 0); assert.equal(u.month, 69_000);
  assert.equal(fits(listCards(db)[0]!, u, 69_000, 10), false);
  assert.equal(fits(listCards(db)[0]!, u, 20_000, 10), true, '69 000 + 20 000 = 89 000 ≤ 90 000');
  assert.equal(fits(listCards(db)[0]!, u, 22_000, 10), false);
  assert.equal(fits(listCards(db)[0]!, u, 22_000, 0), true, 'zaxirasiz — 91 000 ≤ 100 000');
  // keyingi kun: kunlik yuklama nolga qaytadi
  assert.equal(cardUsage(db, C1, T0 + DAY).day, 0);
  assert.equal(cardUsage(db, C1, T0 + DAY).month, 69_000, 'oylik yuklama saqlanadi');
}

// ---- Oylik limit ----
{
  const db = mk();
  saveCard(db, { number: C1, monthlyLimit: 150_000 }, undefined, T0);
  const api = ownCardApi(db, base({ reservePct: 0 }), () => T0);
  const p1 = await open(db, api, T0); pay(db, p1.id, p1.pay_amount!, T0 + MIN);
  const p2 = await open(db, api, T0 + 2 * MIN); pay(db, p2.id, p2.pay_amount!, T0 + 3 * MIN);
  const b = player(db);
  await assert.rejects(() => createPayment(db, api, b, 'general', 30, T0 + 4 * MIN, {}), 'oylik limit (150 000) to‘ldi: 69 000 + 69 001');
  // keyingi oyda yana ochiladi
  const nextMonth = Date.UTC(2026, 1, 3, 10);
  const api2 = ownCardApi(db, base({ reservePct: 0 }), () => nextMonth);
  const p3 = await createPayment(db, api2, b, 'general', 30, nextMonth, {});
  assert.equal(p3.card, fmtCardNumber(C1));
}

// ---- spread: kartalar navbatma-navbat/barobar to'ladi; limitga yetgani ko'rsatilmaydi ----
{
  const db = mk();
  saveCard(db, { number: C1, priority: 1, dailyLimit: 1_000_000 }, undefined, T0);
  saveCard(db, { number: C2, priority: 2, dailyLimit: 1_000_000 }, undefined, T0 + 1);
  const api = ownCardApi(db, base({ reservePct: 0 }), () => T0);
  const used: string[] = [];
  for (let i = 0; i < 6; i++) { const p = await open(db, api, T0 + i * MIN); used.push(digitsOf(p.card!)); pay(db, p.id, p.pay_amount!, T0 + i * MIN + 1000); }
  const c1 = used.filter((x) => x === C1).length, c2 = used.filter((x) => x === C2).length;
  assert.equal(c1, 3); assert.equal(c2, 3); // 6 ta to'lov teng bo'lindi
  assert.notEqual(used[0], used[1], 'ketma-ket to‘lovlar har xil kartaga');
}

// ---- fill: birinchi karta limitga yetguncha, keyin keyingisi ----
{
  const db = mk();
  saveCard(db, { number: C1, priority: 1, dailyLimit: 200_000 }, undefined, T0);
  saveCard(db, { number: C2, priority: 2, dailyLimit: 1_000_000 }, undefined, T0 + 1);
  const api = ownCardApi(db, base({ strategy: 'fill', reservePct: 0 }), () => T0);
  const used: string[] = [];
  for (let i = 0; i < 4; i++) { const p = await open(db, api, T0 + i * MIN); used.push(digitsOf(p.card!)); pay(db, p.id, p.pay_amount!, T0 + i * MIN + 1000); }
  assert.deepEqual(used, [C1, C1, C2, C2], '1-karta 138 001 gacha, 3-to‘lov 200 000 dan oshadi → 2-karta');
}

// ---- O'chirilgan karta ko'rsatilmaydi ----
{
  const db = mk();
  const a = saveCard(db, { number: C1, priority: 1 }, undefined, T0);
  saveCard(db, { number: C2, priority: 2 }, undefined, T0);
  saveCard(db, { enabled: false }, a.id);
  const p = pickCard(db, 69_000, poolOf(base()), T0);
  assert.equal(p?.number, C2);
}

// ---- Limit to'lganda Hamyonga o'tish (zaxira yo'li) ----
{
  const db = mk();
  saveCard(db, { number: C1, dailyLimit: 50_000 }, undefined, T0); // 69 000 sig'maydi
  const api = ownCardApi(db, base(), () => T0);
  const calls: string[] = [];
  const ham: HamyonApi = { async create(id, amount) { calls.push('ham.create'); return { payment_id: 'h1', card: '5614 6817 4244 9584', amount, expire_at: Math.floor(T0 / 1000) + 300 }; }, async status() { return { status: 'pending', amount: 0 }; }, async cancel() { /* */ } };
  const warns: string[] = [];
  const routed = routedApi(api, ham, () => true, (m) => warns.push(m))!;
  const p = await open(db, routed, T0);
  assert.deepEqual(calls, ['ham.create']); assert.ok(warns.some((w) => w.includes('Hamyonga')));
  assert.equal(p.pay_amount, 69_000);
  const row = db.prepare('SELECT hamyon_payment_id FROM payments WHERE id = ?').get(p.id) as Pick<PaymentRow, 'hamyon_payment_id'>;
  assert.ok(!row.hamyon_payment_id!.startsWith(OWN_PREFIX), 'Hamyon to‘lovi o‘z xizmatiga aralashmaydi');
  // Hamyon bo'lmasa — xato (to'lov ochilmaydi)
  const only = routedApi(api, null, () => true)!;
  await assert.rejects(() => only.create('x', 69_000));
}

// ---- Sozlama: admin (DB) > env > standart ----
{
  const db = mk();
  assert.equal(loadCardPayConfig(db, {}).mode, 'off');
  assert.equal(loadCardPayConfig(db, { PAY_OWN_MODE: 'shadow' }).mode, 'shadow');
  setConfig(db, { mode: 'capture', strategy: 'fill', reservePct: 25, windowMin: 20 }, null, T0, {});
  const c = loadCardPayConfig(db, { PAY_OWN_MODE: 'shadow' });
  assert.equal(c.mode, 'capture', 'admin qiymati env dan ustun');
  assert.equal(c.strategy, 'fill'); assert.equal(c.reservePct, 25); assert.equal(c.windowMs, 20 * MIN);
  assert.throws(() => setConfig(db, { mode: 'xyz' }, null, T0, {}), /rejim/);
  assert.throws(() => setConfig(db, { reservePct: 95 }, null, T0, {}), /Zaxira/);
  assert.throws(() => setConfig(db, { windowMin: 0 }, null, T0, {}), /oynasi/);
  assert.throws(() => setConfig(db, { strategy: 'x' }, null, T0, {}), /usuli/);
  // live: karta bo'lmasa yoqilmaydi
  assert.throws(() => setConfig(db, { mode: 'live' }, null, T0, {}), /karta/);
  addCard(db, { number: C1, label: 'A' }, null, T0);
  assert.equal(setConfig(db, { mode: 'live' }, null, T0, {}).mode, 'live');
  assert.equal(cardPayConfigFromEnv({ PAY_OWN_RESERVE_PCT: '95' }).reservePct, 10, 'noto‘g‘ri env — standart');
}

// ---- Admin ko'rinishi: yuklama, to'lgan karta, Telegram holati ----
{
  const db = mk();
  const a = addCard(db, { number: C1, label: 'Asosiy', dailyLimit: 100_000 }, null, T0);
  const api = ownCardApi(db, base(), () => T0);
  const p = await open(db, api, T0);
  let o = overview(db, { configured: false }, T0 + MIN, {});
  assert.equal(o.cards.length, 1); assert.equal(o.cards[0]!.reserved, 69_000); assert.equal(o.cards[0]!.full, false);
  assert.equal(o.cards[0]!.numberFmt, '8600 1234 5678 9012'); assert.equal(o.telegram.configured, false);
  pay(db, p.id, p.pay_amount!, T0 + 2 * MIN);
  o = overview(db, { configured: true }, T0 + 3 * MIN, {});
  assert.equal(o.cards[0]!.usedDay, 69_000); assert.equal(o.cards[0]!.full, false, '69 000 < 90 000');
  editCard(db, a.id, { dailyLimit: 70_000 }, null, T0);
  assert.equal(overview(db, { configured: true }, T0 + 3 * MIN, {}).cards[0]!.full, true, '69 000 ≥ 63 000 (zaxira 10%)');
  assert.equal(o.config.mode, 'off');
  removeCard(db, a.id, null, T0);
  assert.equal(overview(db, { configured: true }, T0, {}).cards.length, 0);
  const audits = (db.prepare("SELECT action FROM admin_audit ORDER BY id").all() as { action: string }[]).map((r) => r.action);
  assert.deepEqual(audits, ['pay.card.add', 'pay.card.edit', 'pay.card.remove'], 'har o‘zgarish audit jurnaliga yoziladi');
  // karta raqami jurnalga to'liq yozilmaydi
  const det = (db.prepare("SELECT detail FROM admin_audit WHERE action = 'pay.card.add'").get() as { detail: string }).detail;
  assert.ok(!det.includes(C1) && det.includes('9012'));
}

console.log('cardPool.test: OK');
