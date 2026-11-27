import assert from 'node:assert/strict';
import { createDb, join, byToken } from './db';
import { createPayment, entitlements, reconcile, statusFor } from './payments';
import {
  OWN_PREFIX, acquireLease, cardPayConfigFromEnv, ensureCardPayTables, handleNotice, matchNotice, ownCardApi, parseCardNotice, parseUzs,
  pruneNotices, recentNotices, recordNotice, releaseLease, routedApi, shadowReport, type CardPayConfig, type RawNotice,
} from './cardPay';
import { startCardWatch, type NoticeFeed } from './cardWatch';
import type { HamyonApi } from './hamyon';

const T0 = Date.UTC(2026, 0, 1, 10);
const MIN = 60_000;
const cfg = (mode: CardPayConfig['mode'] = 'live'): CardPayConfig => ({ mode, card: '8600 1234 5678 9012', windowMs: 15 * MIN, graceMs: 180 * MIN, sources: ['CardXabarBot'], strategy: 'spread', reservePct: 0 });

// ---- Sozlama ----
assert.equal(cardPayConfigFromEnv({}).mode, 'off', 'standart: o‘chiq');
assert.equal(cardPayConfigFromEnv({ PAY_OWN_MODE: 'LIVE' }).mode, 'live');
assert.equal(cardPayConfigFromEnv({ PAY_OWN_MODE: 'yoq' }).mode, 'off', 'noma’lum qiymat — o‘chiq');
assert.deepEqual(cardPayConfigFromEnv({ TG_NOTICE_SOURCES: '@A, B ,' }).sources, ['A', 'B']);
assert.equal(cardPayConfigFromEnv({ PAY_OWN_WINDOW_MIN: '5' }).windowMs, 5 * MIN);
assert.equal(cardPayConfigFromEnv({ PAY_OWN_WINDOW_MIN: '0' }).windowMs, 15 * MIN, 'noto‘g‘ri oyna — standart');

// ---- Summani o'qish ----
assert.equal(parseUzs('79 001.00'), 79001);
assert.equal(parseUzs('79,001.00'), 79001);
assert.equal(parseUzs('79.001,00'), 79001);
assert.equal(parseUzs('79001'), 79001);
assert.equal(parseUzs('1.234.567'), 1234567);
assert.equal(parseUzs('79 001,50'), null, 'tiyinli summa avtomatik emas');
assert.equal(parseUzs('abc'), null);
assert.equal(parseUzs('0'), null);

// ---- Xabarni tahlil qilish (namunalar sintetik: haqiqiy bot xabarlari bilan tasdiqlanmagan) ----
assert.deepEqual(parseCardNotice('➕ 79 001.00 UZS\n💳 *1234\n🕓 12:30\n💰 Balans: 1 234 567.00 UZS'), { amount: 79001, direction: 'in' });
assert.deepEqual(parseCardNotice('Пополнение: 79 001,00 сум. Остаток: 5 000 000 сум'), { amount: 79001, direction: 'in' });
assert.deepEqual(parseCardNotice('Kirim: UZS 129 000'), { amount: 129000, direction: 'in' });
assert.deepEqual(parseCardNotice('➖ 79 001.00 UZS Xarid: MARKET\nBalans: 1 000 UZS'), { amount: 79001, direction: 'out' });
assert.deepEqual(parseCardNotice('➕ 79 001.00 UZS ➖ 5 000 UZS'), { amount: null, direction: 'unknown' }, 'ikki xil summa — noaniq');
assert.equal(parseCardNotice('➕ 79 001.00 UZS to‘lov').direction, 'unknown', 'ham kirim, ham chiqim belgisi — noaniq');
assert.equal(parseCardNotice('Salom! Botga xush kelibsiz').amount, null);
assert.equal(parseCardNotice('➕ 79 001.50 UZS').amount, null, 'tiyinli summa — noaniq');
assert.equal(parseCardNotice('Balans: 1 234 567 UZS').amount, null, 'faqat balans — operatsiya summasi emas');
assert.equal(parseCardNotice('➕ 79 001 UZS').direction, 'in');
assert.equal(parseCardNotice('➕ 79 001.00 UZS').amount, 79001, 'qattiq bo‘shliq');

// ---- Yordamchi: o'quvchi va to'lov ----
const mk = () => { const db = createDb(':memory:'); ensureCardPayTables(db); const u = join(db, 'Ali', T0); return { db, token: u.token, pid: byToken(db, u.token).id }; };
const notice = (over: Partial<RawNotice> = {}): RawNotice => ({ source: 'CardXabarBot', msgId: 1, text: '➕ 69 000.00 UZS\nBalans: 5 000 000.00 UZS', at: T0 + 2 * MIN, ...over });

// ---- ownCardApi: summa, karta, oyna ----
{
  const { db, token } = mk();
  const api = ownCardApi(db, cfg(), () => T0);
  const p = await createPayment(db, api, token, 'general', 30, T0, {});
  assert.equal(p.amount, 69_000);
  assert.equal(p.pay_amount, 69_000, 'birinchi to‘lov — aniq narx');
  assert.equal(p.card, '8600 1234 5678 9012');
  assert.equal(p.expire_at, Math.floor((T0 + 15 * MIN) / 1000));
  const u2 = join(db, 'Vali', T0);
  const p2 = await createPayment(db, api, u2.token, 'general', 30, T0 + MIN, {});
  assert.equal(p2.pay_amount, 69_001, 'band summa → +1 so‘m');
  const u3 = join(db, 'Gulnora', T0);
  const p3 = await createPayment(db, api, u3.token, 'general', 30, T0 + 2 * MIN, {});
  assert.equal(p3.pay_amount, 69_002);
  const row = db.prepare('SELECT hamyon_payment_id FROM payments WHERE id = ?').get(p.id) as { hamyon_payment_id: string };
  assert.ok(row.hamyon_payment_id.startsWith(OWN_PREFIX));
  // karta berilmagan bo'lsa to'lov ochilmaydi
  const bad = ownCardApi(db, { ...cfg(), card: '' });
  const u4 = join(db, 'Dilnoza', T0);
  await assert.rejects(() => createPayment(db, bad, u4.token, 'general', 30, T0, {}));
}

// ---- To'liq oqim (live): to'lov ochiladi → xabar → obuna bir marta ----
{
  const { db, token, pid } = mk();
  const api = ownCardApi(db, cfg(), () => T0);
  const p = await createPayment(db, api, token, 'general', 30, T0, {});
  assert.equal(entitlements(db, token, T0).plan, null);
  // noto'g'ri summa, chiqim, boshqa bot xabari — hech narsa bermaydi
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 1, text: '➕ 68 999.00 UZS' }), T0 + 3 * MIN).outcome, 'no-payment');
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 2, text: '➖ 69 000.00 UZS Xarid' }), T0 + 3 * MIN).outcome, 'not-credit');
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 3, text: 'Salom' }), T0 + 3 * MIN).outcome, 'no-amount');
  assert.equal(entitlements(db, token, T0).plan, null, 'noto‘g‘ri xabarlar obuna bermaydi');
  // to'lov ochilishidan OLDIN kelgan xabar (boshqa kishining o'tkazmasi) bu to'lovga bog'lanmaydi
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 4, at: T0 - 10 * MIN }), T0 + 3 * MIN).outcome, 'no-payment');
  // to'g'ri xabar
  const ok = handleNotice(db, cfg(), notice({ msgId: 5 }), T0 + 3 * MIN);
  assert.equal(ok.outcome, 'delivered');
  assert.equal(entitlements(db, token, T0 + 3 * MIN).plan, 'general');
  assert.equal((await api.status(OWN_PREFIX + p.id)).status, 'paid');
  assert.equal((await statusFor(db, api, '', token, p.id, T0 + 4 * MIN)).status, 'success');
  // takror xabar (xuddi shu msg_id) va yangi xabar (boshqa msg_id) obunani ikkinchi marta bermaydi
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 5 }), T0 + 4 * MIN).id, null, 'takror xabar e’tiborsiz');
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 6 }), T0 + 4 * MIN).outcome, 'no-payment', 'to‘lov allaqachon yetkazilgan');
  const until = entitlements(db, token, T0 + 5 * MIN).subs.grammar!;
  assert.ok(until - (T0 + 3 * MIN) < 31 * 86_400_000 && until - (T0 + 3 * MIN) > 29 * 86_400_000, 'obuna 30 kun, bir marta');
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM payments WHERE status = \'success\' AND player_id = ?').get(pid) as { n: number }).n, 1);
}

// ---- Kech to'lov: oyna tugagan, lekin grace ichida — yetkaziladi; grace dan keyin — yo'q ----
{
  const { db, token } = mk();
  let clock = T0;
  const api = ownCardApi(db, cfg(), () => clock);
  const p = await createPayment(db, api, token, 'general', 30, T0, {});
  clock = T0 + 20 * MIN;
  assert.equal(await reconcile(db, api, '', T0 + 20 * MIN), 1, 'oyna tugadi → to‘lov yopildi');
  assert.equal((db.prepare('SELECT status FROM payments WHERE id = ?').get(p.id) as { status: string }).status, 'cancelled');
  const late = handleNotice(db, cfg(), notice({ msgId: 10, at: T0 + 25 * MIN }), T0 + 25 * MIN);
  assert.equal(late.outcome, 'delivered', 'kech kelgan to‘lov yo‘qolmaydi');
  assert.equal(entitlements(db, token, T0 + 25 * MIN).plan, 'general');
  const { db: db2, token: t2 } = mk();
  const api2 = ownCardApi(db2, cfg(), () => T0);
  await createPayment(db2, api2, t2, 'general', 30, T0, {});
  assert.equal(handleNotice(db2, cfg(), notice({ msgId: 11, at: T0 + 5 * MIN }), T0 + 4 * 60 * MIN).outcome, 'no-payment', 'grace dan keyin yetkazilmaydi (qo‘lda hal qilinadi)');
}

// ---- Bir xil summa: ochiq to'lov ustun; bir nechta yopiq nomzod — noaniq ----
{
  const { db, token } = mk();
  const u2 = join(db, 'Vali', T0);
  let clock = T0;
  const api = ownCardApi(db, cfg(), () => clock);
  const a = await createPayment(db, api, token, 'general', 30, T0, {});
  // oyna tugadi (a yopildi), keyin boshqa kishi xuddi shu summani oladi? Yo'q: grace davomida summa band
  clock = T0 + 20 * MIN;
  await reconcile(db, api, '', T0 + 20 * MIN);
  const b = await createPayment(db, ownCardApi(db, cfg(), () => T0 + 21 * MIN), u2.token, 'general', 30, T0 + 21 * MIN, {});
  assert.notEqual(b.pay_amount, a.pay_amount, 'yopilgan, lekin grace ichidagi summa qayta berilmaydi');
}
{
  const { db } = mk();
  const u = byToken(db, join(db, 'Vali', T0).token).id;
  // sun'iy holat: bir xil summali ikki yopiq to'lov → noaniq
  for (const id of ['x1', 'x2']) db.prepare("INSERT INTO payments (id, player_id, track, days, amount, hamyon_payment_id, hamyon_amount, card, status, expire_at, created_at) VALUES (?, ?, 'general', 30, 69000, ?, 69000, 'c', 'cancelled', ?, ?)").run(id, u, OWN_PREFIX + id, Math.floor(T0 / 1000), T0);
  assert.equal(handleNotice(db, cfg(), notice({ msgId: 20, at: T0 + 5 * MIN }), T0 + 6 * MIN).outcome, 'ambiguous');
}

// ---- Rejimlar ----
{
  const { db, token } = mk();
  const api = ownCardApi(db, cfg(), () => T0);
  const p = await createPayment(db, api, token, 'general', 30, T0, {});
  assert.deepEqual(handleNotice(db, cfg('off'), notice({ msgId: 30 }), T0 + MIN), { id: null, outcome: null }, 'off: hech narsa yozilmaydi');
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM card_notices').get() as { n: number }).n, 0);
  const cap = handleNotice(db, cfg('capture'), notice({ msgId: 31 }), T0 + MIN);
  assert.ok(cap.id !== null && cap.outcome === null, 'capture: yozadi, solishtirmaydi');
  assert.equal(entitlements(db, token, T0 + MIN).plan, null);
  const sh = handleNotice(db, cfg('shadow'), notice({ msgId: 32 }), T0 + MIN);
  assert.equal(sh.outcome, 'would-deliver', 'shadow: "yetkazgan bo‘lardi"');
  assert.equal(entitlements(db, token, T0 + MIN).plan, null, 'shadow obuna bermaydi');
  assert.equal((db.prepare('SELECT status FROM payments WHERE id = ?').get(p.id) as { status: string }).status, 'pending');
}

// ---- Shadow hisoboti: Hamyon yetkazgan to'lovlarni biz ham topgan bo'lardikmi ----
{
  const { db } = mk();
  const u = byToken(db, join(db, 'Vali', T0).token).id;
  const ins = (id: string, status: string, amt: number, paidAt: number | null) => db.prepare("INSERT INTO payments (id, player_id, track, days, amount, hamyon_payment_id, hamyon_amount, card, status, created_at, paid_at) VALUES (?, ?, 'general', 30, 69000, ?, ?, 'c', ?, ?, ?)").run(id, u, `h${id}`, amt, status, T0, paidAt);
  ins('p1', 'pending', 69_000, null); ins('p2', 'pending', 69_005, null);
  handleNotice(db, cfg('shadow'), notice({ msgId: 40, text: '➕ 69 000.00 UZS' }), T0 + MIN); // p1: topildi
  db.prepare("UPDATE payments SET status = 'success', paid_at = ? WHERE id = 'p1'").run(T0 + 2 * MIN); // Hamyon ham yetkazdi
  db.prepare("UPDATE payments SET status = 'success', paid_at = ? WHERE id = 'p2'").run(T0 + 2 * MIN); // Hamyon yetkazdi, biz xabarni ko'rmadik
  const r = shadowReport(db, T0);
  assert.equal(r.hamyonPaid, 2);
  assert.equal(r.found, 1);
  assert.deepEqual(r.missed, ['p2']);
  assert.deepEqual(r.wrong, []);
}

// ---- Qayta yozish / tozalash / ro'yxat ----
{
  const { db } = mk();
  assert.ok(recordNotice(db, notice({ msgId: 50 }), T0) !== null);
  assert.equal(recordNotice(db, notice({ msgId: 50 }), T0), null);
  assert.equal(recordNotice(db, notice({ msgId: 50, source: 'HUMOcardbot' }), T0) !== null, true, 'boshqa manbada shu id — boshqa xabar');
  assert.equal(recentNotices(db, 10).length, 2);
  assert.equal(pruneNotices(db, 30 * 86_400_000, T0 + 31 * 86_400_000), 2);
  assert.equal(matchNotice(db, 999, { apply: true, scope: 'own', graceMs: 1 }), 'no-payment');
}

// ---- Bitta nusxa (lease) ----
{
  const { db } = mk();
  assert.equal(acquireLease(db, 'A', T0), true);
  assert.equal(acquireLease(db, 'B', T0 + 10_000), false, 'band: boshqa nusxa ulana olmaydi');
  assert.equal(acquireLease(db, 'A', T0 + 10_000), true, 'egasi uzaytiradi');
  assert.equal(acquireLease(db, 'B', T0 + 100_000), true, 'muddati tugagach olinadi');
  releaseLease(db, 'A'); // begona nusxa bo'shatmaydi
  assert.equal(acquireLease(db, 'A', T0 + 100_001), false);
  releaseLease(db, 'B');
  assert.equal(acquireLease(db, 'A', T0 + 100_002), true);
}

// ---- Yo'naltiruvchi: eski (Hamyon) to'lovlar o'z xizmatida yakunlanadi ----
{
  const calls: string[] = [];
  const mkApi = (name: string): HamyonApi => ({
    async create() { calls.push(`${name}.create`); return { payment_id: `${name}1`, card: 'c', amount: 1, expire_at: 1 }; },
    async status(id) { calls.push(`${name}.status:${id}`); return { status: 'pending', amount: 1 }; },
    async cancel(id) { calls.push(`${name}.cancel:${id}`); },
  });
  const r1 = routedApi(mkApi('own'), mkApi('ham'), false)!;
  await r1.create('o', 1); await r1.status('own_x'); await r1.status('12345'); await r1.cancel('own_y');
  assert.deepEqual(calls, ['ham.create', 'own.status:own_x', 'ham.status:12345', 'own.cancel:own_y']);
  calls.length = 0;
  await routedApi(mkApi('own'), mkApi('ham'), true)!.create('o', 1);
  assert.deepEqual(calls, ['own.create']);
  assert.equal(routedApi(null, null, false), null);
  await assert.rejects(() => routedApi(null, mkApi('ham'), false)!.status('own_x'), 'own o‘chiq bo‘lsa own_ to‘lov holati noma’lum');
}

// ---- Kuzatuvchi (soxta Telegram oqimi): ulanadi, xabarni yozadi, xato bo'lsa qayta ulanadi, to'xtaganda lease bo'shaydi ----
{
  const { db, token } = mk();
  const api = ownCardApi(db, cfg('live'), () => Date.now());
  const p = await createPayment(db, api, token, 'general', 30, Date.now() - 2 * MIN, {});
  let starts = 0, stops = 0;
  const emit: { fn: ((n: RawNotice) => void) | null } = { fn: null };
  const feed = (failFirst: boolean): NoticeFeed => ({
    async start(on) { starts++; if (failFirst && starts === 1) throw new Error('ulanmadi'); emit.fn = on; on({ source: 'CardXabarBot', msgId: 77, text: `➕ ${p.pay_amount} UZS`, at: Date.now() - MIN }); },
    async poll() { /* */ },
    async stop() { stops++; },
  });
  const logs: string[] = [];
  const w = startCardWatch({ db, cfg: cfg('live'), creds: { apiId: 1, apiHash: 'h', session: 's' }, log: (m) => logs.push(m) }, () => feed(false));
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(starts, 1);
  assert.equal(entitlements(db, token).plan, 'general', 'oqimdan kelgan xabar obuna berdi');
  assert.ok(logs.some((l) => l.includes('delivered')));
  assert.ok(!logs.some((l) => l.includes('UZS')), 'jurnalga xabar matni yozilmaydi');
  await w.stop();
  assert.equal(stops >= 1, true);
  assert.equal(acquireLease(db, 'other', Date.now()), true, 'to‘xtagach lease bo‘shatilgan');
}
{
  const { db } = mk();
  acquireLease(db, 'boshqa-nusxa', Date.now());
  let starts = 0;
  const w = startCardWatch({ db, cfg: cfg('live'), creds: { apiId: 1, apiHash: 'h', session: 's' } }, () => ({ async start() { starts++; }, async poll() { /* */ }, async stop() { /* */ } }));
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(starts, 0, 'lease boshqa nusxada: ulanmaydi');
  await w.stop();
}
{
  const { db } = mk();
  let starts = 0;
  const logs: string[] = [];
  const w = startCardWatch({ db, cfg: cfg('capture'), creds: { apiId: 1, apiHash: 'h', session: 's' }, log: (m) => logs.push(m) }, () => ({ async start() { starts++; throw new Error('sessiya yaroqsiz'); }, async poll() { /* */ }, async stop() { /* */ } }));
  await new Promise((r) => setTimeout(r, 60));
  assert.equal(starts, 1);
  assert.ok(logs.some((l) => l.includes('sessiya yaroqsiz')), 'xato jurnalga yoziladi, server yiqilmaydi');
  await w.stop();
}

console.log('cardPay.test: OK');
