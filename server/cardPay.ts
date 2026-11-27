import type { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { HamyonError, type Created, type HamyonApi, type HamyonStatus } from './hamyon';
import { OPEN, applyResult, type PaymentRow } from './payments';
import { ensureCardPool, fmtCardNumber, pickCard, type PoolConfig, type Strategy } from './cardPool';

// O'z karta-to'lov moduli (Hamyon'ga bog'liq bo'lmagan yo'l). G'oya Hamyon bilan bir xil:
//   1) har to'lovga AYNAN bir xil bo'lmagan summa beriladi (narx + 1, 2, … so'm) va bizning karta ko'rsatiladi;
//   2) foydalanuvchi shu summani o'tkazadi, karta egasining Telegram akkauntiga CardXabar / HUMOcard botidan "pul tushdi" xabari keladi;
//   3) server shu xabarni o'qiydi (server/cardWatch.ts), summani ochiq to'lov bilan solishtiradi va obunani bir marta beradi.
// Rejimlar (PAY_OWN_MODE): off (standart, hech narsa qilmaydi) → capture (xabarlarni faqat yozib oladi, hech kimga obuna bermaydi)
//   → shadow (xabarni ochiq to'lov bilan solishtiradi va jurnalga "yetkazgan bo'lardi" deb yozadi; obuna bermaydi — Hamyon bilan solishtirish uchun)
//   → live (yangi to'lovlar o'z kartamizga ochiladi va xabar kelganda obuna beriladi).
// MUHIM: xabar matni formati namunalar bilan tasdiqlanmagan — parseCardNotice ehtiyotkor (shubhali xabar → "unknown", avtomatik yetkazilmaydi).

export type CardPayMode = 'off' | 'capture' | 'shadow' | 'live';
export interface CardPayConfig { mode: CardPayMode; card: string; windowMs: number; graceMs: number; sources: string[]; strategy: Strategy; reservePct: number }

export function cardPayConfigFromEnv(env: NodeJS.ProcessEnv = process.env): CardPayConfig {
  const raw = (env.PAY_OWN_MODE ?? 'off').trim().toLowerCase();
  const mode: CardPayMode = raw === 'capture' || raw === 'shadow' || raw === 'live' ? raw : 'off';
  const mins = (v: string | undefined, d: number): number => { const n = Number(v); return Number.isFinite(n) && n >= 1 && n <= 24 * 60 ? n : d; };
  return {
    mode,
    card: (env.PAY_OWN_CARD ?? '').trim(),
    windowMs: mins(env.PAY_OWN_WINDOW_MIN, 15) * 60_000, // to'lov oynasi: shu vaqtgacha summa band
    graceMs: mins(env.PAY_OWN_GRACE_MIN, 180) * 60_000, // oyna tugagach ham shu vaqt ichida kelgan to'lov yetkaziladi
    sources: (env.TG_NOTICE_SOURCES ?? 'CardXabarBot,HUMOcardbot').split(',').map((s) => s.trim().replace(/^@/, '')).filter(Boolean),
    strategy: (env.PAY_OWN_STRATEGY ?? '').trim().toLowerCase() === 'fill' ? 'fill' : 'spread',
    reservePct: (() => { const n = Number(env.PAY_OWN_RESERVE_PCT); return Number.isFinite(n) && n >= 0 && n <= 90 ? n : 10; })(),
  };
}

/** Sozlama: admin panelda saqlangan qiymat (pay_config) > Railway o'zgaruvchisi > standart. Har chaqiruvda o'qiladi — o'zgarish darhol kuchga kiradi. */
export function loadCardPayConfig(db: DatabaseSync, env: NodeJS.ProcessEnv = process.env): CardPayConfig {
  const base = cardPayConfigFromEnv(env);
  let rows: { key: string; value: string }[] = [];
  try { rows = db.prepare('SELECT key, value FROM pay_config').all() as { key: string; value: string }[]; } catch { /* jadval hali yo'q */ }
  const v = new Map(rows.map((r) => [r.key, r.value]));
  const mode = v.get('mode');
  const strategy = v.get('strategy');
  const reserve = Number(v.get('reserve_pct'));
  const win = Number(v.get('window_min'));
  return {
    ...base,
    mode: mode === 'off' || mode === 'capture' || mode === 'shadow' || mode === 'live' ? mode : base.mode,
    strategy: strategy === 'fill' || strategy === 'spread' ? strategy : base.strategy,
    reservePct: v.has('reserve_pct') && Number.isFinite(reserve) && reserve >= 0 && reserve <= 90 ? reserve : base.reservePct,
    windowMs: v.has('window_min') && Number.isFinite(win) && win >= 1 && win <= 24 * 60 ? win * 60_000 : base.windowMs,
  };
}

export const poolOf = (cfg: CardPayConfig): PoolConfig => ({ strategy: cfg.strategy, reservePct: cfg.reservePct, legacyCard: cfg.card });

export function ensureCardPayTables(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS card_notices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      msg_id INTEGER NOT NULL,
      at INTEGER NOT NULL,
      received_at INTEGER NOT NULL,
      text TEXT NOT NULL,
      direction TEXT,
      amount INTEGER,
      payment_id TEXT,
      outcome TEXT,
      UNIQUE (source, msg_id)
    );
    CREATE INDEX IF NOT EXISTS card_notices_at ON card_notices (at);
    CREATE TABLE IF NOT EXISTS card_watch_lease (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      owner TEXT NOT NULL,
      until INTEGER NOT NULL
    );
  `);
  db.exec('CREATE TABLE IF NOT EXISTS admin_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, actor_id INTEGER, action TEXT NOT NULL, target TEXT, detail TEXT)');
  ensureCardPool(db);
}

// ---------------------------------------------------------------- xabarni tahlil qilish

export type Direction = 'in' | 'out' | 'unknown';
export interface ParsedNotice { amount: number | null; direction: Direction }

const NUM = String.raw`\d{1,3}(?:[ .,]\d{3})+(?:[.,]\d{1,2})?|\d+(?:[.,]\d{1,2})?`;
// Valyuta belgisi regex literal ko'rinishida (matn literali emas): tarjima katalogi uni foydalanuvchi matni deb olmasin
const CUR_RE = /(?:uzs|so['‘’ʻʼ`]?m|сум|сўм|sum)(?![\p{L}\p{N}])/u;
const CUR = CUR_RE.source;
const BALANCE = /(balans|баланс|остаток|qoldiq|balance|доступно|mavjud)[^\n]{0,24}$/iu;
const CREDIT = /(➕|пополнен|поступлен|зачислен|kirim|tushum|tushdi|o['‘’ʻʼ`]?tkazma\s+qabul|received|credit)/iu;
const DEBIT = /(➖|списан|покупк|оплат|chiqim|xarid|to['‘’ʻʼ`]?lov|снят|yechib|debit|purchase|withdraw)/iu;

/** "79 001.00", "79,001.00", "79.001,00", "79001" → 79001. Tiyinli (kasrli) yoki tushunarsiz summa → null (bizning to'lovlar butun so'mda). */
export function parseUzs(raw: string): number | null {
  const m = /^(\d+(?:[.,]\d{3})*)(?:[.,](\d{1,2}))?$/.exec(raw.replace(/\s/g, ''));
  if (!m) return null;
  if (m[2] && Number(m[2]) !== 0) return null;
  const n = Number(m[1]!.replace(/[.,]/g, ''));
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

export function parseCardNotice(text: string): ParsedNotice {
  const t = text.replace(/[   ]/g, ' ');
  const found: number[] = [];
  const seen = new Set<number>();
  for (const re of [new RegExp(`(?<![\\d.,])(${NUM})\\s*${CUR}`, 'giu'), new RegExp(`${CUR}\\s*(${NUM})(?![\\d])`, 'giu')]) {
    for (const m of t.matchAll(re)) {
      const idx = m.index ?? 0;
      const lineStart = t.lastIndexOf('\n', idx) + 1;
      if (BALANCE.test(t.slice(lineStart, idx))) continue; // "Balans: 1 234 567 UZS" — operatsiya summasi emas
      const n = parseUzs(m[1]!);
      if (n === null) return { amount: null, direction: 'unknown' }; // kasrli/noaniq summa: avtomatik emas
      if (!seen.has(n)) { seen.add(n); found.push(n); }
    }
  }
  const amount = found.length === 1 ? found[0]! : null; // bir nechta har xil summa — noaniq
  const c = CREDIT.test(t), d = DEBIT.test(t);
  return { amount, direction: c && !d ? 'in' : d && !c ? 'out' : 'unknown' };
}

// ---------------------------------------------------------------- yozib olish va solishtirish

export interface RawNotice { source: string; msgId: number; text: string; at: number }

/** Xabarni saqlaydi (source+msg_id bo'yicha bir marta). Takror bo'lsa null. */
export function recordNotice(db: DatabaseSync, n: RawNotice, now = Date.now()): number | null {
  const p = parseCardNotice(n.text);
  const r = db.prepare('INSERT OR IGNORE INTO card_notices (source, msg_id, at, received_at, text, direction, amount) VALUES (?, ?, ?, ?, ?, ?, ?)').run(n.source, n.msgId, n.at, now, n.text.slice(0, 2000), p.direction, p.amount);
  return Number(r.changes) ? Number(r.lastInsertRowid) : null;
}

export type MatchOutcome = 'delivered' | 'would-deliver' | 'already' | 'no-amount' | 'not-credit' | 'no-payment' | 'ambiguous' | 'mismatch';

const isOpen = (s: string): boolean => (OPEN as readonly string[]).includes(s);

/**
 * Pul tushganini bildiruvchi xabarni to'lovga bog'laydi: summa AYNAN bir xil, to'lov xabardan oldin ochilgan, hali yetkazilmagan.
 * apply=false (shadow): faqat natijani yozadi. scope 'own': faqat bizning (own_) to'lovlar; 'any': Hamyon to'lovlari ham (shadow solishtirish uchun).
 */
export function matchNotice(db: DatabaseSync, noticeId: number, opts: { apply: boolean; scope: 'own' | 'any'; graceMs: number }, now = Date.now()): MatchOutcome {
  const n = db.prepare('SELECT * FROM card_notices WHERE id = ?').get(noticeId) as { id: number; at: number; direction: string | null; amount: number | null; outcome: string | null } | undefined;
  if (!n) return 'no-payment';
  const done = (outcome: MatchOutcome, paymentId?: string): MatchOutcome => { db.prepare('UPDATE card_notices SET outcome = ?, payment_id = COALESCE(?, payment_id) WHERE id = ?').run(outcome, paymentId ?? null, n.id); return outcome; };
  if (n.outcome === 'delivered') return 'already';
  if (n.amount === null) return done('no-amount');
  if (n.direction !== 'in') return done('not-credit');
  const own = opts.scope === 'own' ? "AND hamyon_payment_id LIKE 'own\\_%' ESCAPE '\\'" : '';
  const rows = db.prepare(`SELECT * FROM payments WHERE hamyon_amount = ? AND status IN ('pending', 'prepared', 'cancelled', 'expired') AND created_at <= ? AND created_at >= ? ${own} ORDER BY created_at DESC`).all(n.amount, n.at + 60_000, now - opts.graceMs) as unknown as PaymentRow[];
  if (!rows.length) return done('no-payment');
  const open = rows.filter((p) => isOpen(p.status));
  const pick = open.length === 1 ? open[0]! : open.length === 0 && rows.length === 1 ? rows[0]! : null;
  if (!pick) return done('ambiguous'); // bir nechta nomzod: odam hal qiladi (admin → qo'lda obuna berish)
  if (!opts.apply) return done('would-deliver', pick.id);
  const r = applyResult(db, pick.id, 'paid', { paidAmount: n.amount }, now);
  return done(r === 'delivered' ? 'delivered' : r === 'already' ? 'already' : 'mismatch', pick.id);
}

/** Xabar keldi: yozib oladi va rejimga qarab solishtiradi. Qaytaradi: yozilgan xabar id va natija (rejim capture/off bo'lsa natija null). */
export function handleNotice(db: DatabaseSync, cfg: CardPayConfig, n: RawNotice, now = Date.now()): { id: number | null; outcome: MatchOutcome | null } {
  if (cfg.mode === 'off') return { id: null, outcome: null };
  const id = recordNotice(db, n, now);
  if (id === null) return { id: null, outcome: null }; // takror xabar
  if (cfg.mode === 'capture') return { id, outcome: null };
  const outcome = matchNotice(db, id, cfg.mode === 'live' ? { apply: true, scope: 'own', graceMs: cfg.graceMs } : { apply: false, scope: 'any', graceMs: cfg.graceMs }, now);
  return { id, outcome };
}

/** Xabarlar ro'yxati (admin) va shadow hisoboti: Hamyon yetkazgan to'lovlardan nechtasini o'z modulimiz ham topgan bo'lardi. */
export function recentNotices(db: DatabaseSync, limit = 100) {
  return db.prepare('SELECT id, source, at, direction, amount, payment_id, outcome, substr(text, 1, 400) AS text FROM card_notices ORDER BY at DESC LIMIT ?').all(limit);
}
export function shadowReport(db: DatabaseSync, since: number): { hamyonPaid: number; found: number; missed: string[]; wouldDeliver: number; wrong: string[] } {
  const paid = db.prepare("SELECT id FROM payments WHERE status = 'success' AND paid_at >= ? AND (hamyon_payment_id IS NULL OR hamyon_payment_id NOT LIKE 'own\\_%' ESCAPE '\\')").all(since) as { id: string }[];
  const matched = new Set((db.prepare("SELECT payment_id FROM card_notices WHERE at >= ? AND outcome = 'would-deliver' AND payment_id IS NOT NULL").all(since - 3_600_000) as { payment_id: string }[]).map((r) => r.payment_id));
  const missed = paid.filter((p) => !matched.has(p.id)).map((p) => p.id);
  const wouldRows = db.prepare("SELECT n.payment_id AS id, p.status FROM card_notices n JOIN payments p ON p.id = n.payment_id WHERE n.at >= ? AND n.outcome = 'would-deliver'").all(since - 3_600_000) as { id: string; status: string }[];
  const wrong = wouldRows.filter((r) => r.status !== 'success').map((r) => r.id); // biz "yetkazardik", Hamyon esa yo'q
  return { hamyonPaid: paid.length, found: paid.length - missed.length, missed, wouldDeliver: wouldRows.length, wrong };
}
export const pruneNotices = (db: DatabaseSync, olderThanMs: number, now = Date.now()): number => Number(db.prepare('DELETE FROM card_notices WHERE received_at < ?').run(now - olderThanMs).changes);

// ---------------------------------------------------------------- bitta nusxa (lease)

/** Telegram sessiyasi bir vaqtda faqat bitta jarayonda ishlashi kerak (aks holda Telegram sessiyani bekor qiladi). */
export function acquireLease(db: DatabaseSync, owner: string, now = Date.now(), ttlMs = 60_000): boolean {
  const r = db.prepare('INSERT INTO card_watch_lease (id, owner, until) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET owner = excluded.owner, until = excluded.until WHERE card_watch_lease.until < ? OR card_watch_lease.owner = excluded.owner').run(owner, now + ttlMs, now);
  return Number(r.changes) > 0;
}
export const releaseLease = (db: DatabaseSync, owner: string): void => { db.prepare('DELETE FROM card_watch_lease WHERE id = 1 AND owner = ?').run(owner); };

// ---------------------------------------------------------------- to'lov xizmati (Hamyon bilan bir xil interfeys)

export const OWN_PREFIX = 'own_';
export const MAX_OWN_BUMPS = 99;

/** Bizning kartamizga to'lov: summa narx + 1, 2, … so'm (band summalar o'tkazib yuboriladi). */
export function ownCardApi(db: DatabaseSync, cfgOrGetter: CardPayConfig | (() => CardPayConfig), nowFn: () => number = Date.now): HamyonApi {
  const getCfg = typeof cfgOrGetter === 'function' ? cfgOrGetter : () => cfgOrGetter;
  return {
    async create(orderId, amount, busy = new Set<number>()): Promise<Created> {
      const cfg = getCfg();
      const now = nowFn();
      // band: oyna ichidagi ochiq to'lovlar + oyna tugagan, lekin hali yetkazilishi mumkin bo'lgan (grace) to'lovlar
      const rows = db.prepare("SELECT hamyon_amount AS a FROM payments WHERE hamyon_amount IS NOT NULL AND status IN ('pending', 'prepared', 'cancelled', 'expired') AND created_at >= ? AND id <> ?").all(now - cfg.graceMs, orderId) as { a: number }[];
      const taken = new Set<number>([...busy, ...rows.map((r) => r.a)]);
      for (let k = 0; k <= MAX_OWN_BUMPS; k++) {
        const cand = amount + k;
        if (taken.has(cand)) continue;
        const card = pickCard(db, cand, poolOf(cfg), now); // limit: sig'maydigan karta mijozga ko'rsatilmaydi
        if (!card) throw new HamyonError('no card with free limit');
        return { payment_id: `${OWN_PREFIX}${orderId}`, card: fmtCardNumber(card.number), amount: cand, expire_at: Math.floor((now + cfg.windowMs) / 1000) };
      }
      throw new HamyonError('no free amount');
    },
    async status(paymentId): Promise<HamyonStatus> {
      const p = db.prepare('SELECT status, hamyon_amount, expire_at FROM payments WHERE hamyon_payment_id = ?').get(paymentId) as { status: string; hamyon_amount: number | null; expire_at: number | null } | undefined;
      if (!p) throw new HamyonError('not found');
      const amount = p.hamyon_amount ?? 0;
      if (p.status === 'success') return { status: 'paid', amount };
      if ((p.expire_at ?? 0) * 1000 <= nowFn()) return { status: 'cancel', amount };
      return { status: 'pending', amount };
    },
    async cancel() { /* o'zimizda yopiladigan narsa yo'q: oyna tugaganda to'lov o'zi yopiladi */ },
  };
}

/** Eski (Hamyon) to'lovlari tugamaguncha ikkala xizmat yonma-yon: yangilar tanlangan xizmatga, mavjudlari o'z xizmatiga ketadi.
 *  O'z xizmatimiz yangi to'lov ocha olmasa (karta limiti to'lgan, karta yo'q) va Hamyon ulangan bo'lsa — Hamyonga o'tiladi. */
export function routedApi(own: HamyonApi | null, hamyon: HamyonApi | null, useOwnForNew: boolean | (() => boolean), warn: (m: string) => void = () => undefined): HamyonApi | null {
  if (!own && !hamyon) return null;
  const useOwn = typeof useOwnForNew === 'function' ? useOwnForNew : () => useOwnForNew;
  const pick = (id: string): HamyonApi => { const a = id.startsWith(OWN_PREFIX) ? own : hamyon; if (!a) throw new HamyonError('provider off'); return a; };
  return {
    async create(orderId, amount, busy) {
      if (useOwn() && own) {
        try { return await own.create(orderId, amount, busy); } catch (e) {
          if (!hamyon) throw e;
          warn(`[cardpay] o'z xizmat to'lov ocha olmadi (${(e as Error).message}) — Hamyonga o'tildi`);
        }
      }
      if (!hamyon) throw new HamyonError('provider off');
      return hamyon.create(orderId, amount, busy);
    },
    async status(id) { return pick(id).status(id); },
    async cancel(id) { return pick(id).cancel(id); },
  };
}

export const newLeaseOwner = (): string => randomBytes(8).toString('hex');
