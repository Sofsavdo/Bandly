import type { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { ApiError } from './db';
import { tzDayStart } from './day';

// Karta havzasi: bir nechta karta, har biriga kunlik/oylik limit. Yangi to'lov uchun karta tanlanadi:
//  • spread — yuklamasi eng kam karta (kartalar barobar to'ladi, birortasi limitga yetmaydi);
//  • fill   — birinchi (priority bo'yicha) karta limitga yetguncha, keyin keyingisi.
// Limit "zaxira foizi" bilan kichraytiriladi: kartaga bizdan boshqa tushumlar ham kelishi mumkin, shuning uchun limitning
// oxirigacha olib borilmaydi. Hisob bizning to'lovlarimiz bo'yicha: to'langan (kun/oy, Toshkent vaqti) + hozir ochiq (band) summalar.
// Limit to'lgan bo'lsa karta mijozga ko'rsatilmaydi; hech bir karta sig'masa — to'lov ochilmaydi (Hamyon bo'lsa, unga o'tiladi).

export type Strategy = 'spread' | 'fill';
export interface PayCard { id: string; number: string; label: string; enabled: boolean; dailyLimit: number; monthlyLimit: number; priority: number; createdAt: number }
export interface CardUsage { day: number; month: number; reserved: number; lastAt: number }
export interface PoolConfig { strategy: Strategy; reservePct: number; legacyCard: string }

const MAX_LIMIT = 100_000_000_000;
const TZ_OFFSET_MS = 5 * 3_600_000; // Toshkent (UTC+5)

interface CardRow { id: string; number: string; label: string; enabled: number; daily_limit: number; monthly_limit: number; priority: number; created_at: number }
const fromRow = (r: CardRow): PayCard => ({ id: r.id, number: r.number, label: r.label, enabled: !!r.enabled, dailyLimit: r.daily_limit, monthlyLimit: r.monthly_limit, priority: r.priority, createdAt: r.created_at });

export const digitsOf = (s: string): string => s.replace(/\D/g, '');
/** 16 xonali raqam → "8600 1234 5678 9012" */
export const fmtCardNumber = (digits: string): string => digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
export const monthStart = (now: number): number => { const d = new Date(now + TZ_OFFSET_MS); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1) - TZ_OFFSET_MS; };

export function ensureCardPool(db: DatabaseSync): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS pay_cards (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      daily_limit INTEGER NOT NULL DEFAULT 0,
      monthly_limit INTEGER NOT NULL DEFAULT 0,
      priority INTEGER NOT NULL DEFAULT 100,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pay_config (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
  `);
}

export const listCards = (db: DatabaseSync): PayCard[] =>
  (db.prepare('SELECT * FROM pay_cards ORDER BY priority, created_at').all() as unknown as CardRow[]).map(fromRow);

const int = (v: unknown, min: number, max: number, def: number): number => {
  if (v === undefined || v === null || v === '') return def;
  const n = Number(v);
  if (!Number.isInteger(n) || n < min || n > max) throw new ApiError(400, 'Limit yoki tartib noto‘g‘ri: butun son kerak');
  return n;
};

/** Karta qo'shish/yangilash. Raqam 16 xonali; limit so'mda (0 — cheklovsiz). */
export function saveCard(db: DatabaseSync, input: Record<string, unknown>, id?: string, now = Date.now()): PayCard {
  const cur = id ? (db.prepare('SELECT * FROM pay_cards WHERE id = ?').get(id) as unknown as CardRow | undefined) : undefined;
  if (id && !cur) throw new ApiError(404, 'Karta topilmadi');
  const number = input.number === undefined && cur ? cur.number : digitsOf(String(input.number ?? ''));
  if (!/^\d{16}$/.test(number)) throw new ApiError(400, 'Karta raqami 16 ta raqamdan iborat bo‘lishi kerak');
  const label = String(input.label ?? cur?.label ?? '').trim().slice(0, 40);
  const enabled = input.enabled === undefined ? (cur ? !!cur.enabled : true) : input.enabled === true || input.enabled === 1;
  const dailyLimit = int(input.dailyLimit ?? cur?.daily_limit, 0, MAX_LIMIT, 0);
  const monthlyLimit = int(input.monthlyLimit ?? cur?.monthly_limit, 0, MAX_LIMIT, 0);
  const priority = int(input.priority ?? cur?.priority, 0, 10_000, 100);
  try {
    if (cur) db.prepare('UPDATE pay_cards SET number = ?, label = ?, enabled = ?, daily_limit = ?, monthly_limit = ?, priority = ? WHERE id = ?').run(number, label, enabled ? 1 : 0, dailyLimit, monthlyLimit, priority, cur.id);
    else { id = randomBytes(6).toString('hex'); db.prepare('INSERT INTO pay_cards (id, number, label, enabled, daily_limit, monthly_limit, priority, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, number, label, enabled ? 1 : 0, dailyLimit, monthlyLimit, priority, now); }
  } catch (e) {
    if (/UNIQUE/i.test(String((e as Error).message))) throw new ApiError(409, 'Bu karta allaqachon qo‘shilgan');
    throw e;
  }
  return fromRow(db.prepare('SELECT * FROM pay_cards WHERE id = ?').get(id!) as unknown as CardRow);
}

export function deleteCard(db: DatabaseSync, id: string): void {
  if (!Number(db.prepare('DELETE FROM pay_cards WHERE id = ?').run(id).changes)) throw new ApiError(404, 'Karta topilmadi');
}

/** Karta yuklamasi: shu kunda va oyda to'langan summa, hozir ochiq (band) summa, oxirgi to'lov ochilgan vaqt. */
export function cardUsage(db: DatabaseSync, number: string, now = Date.now()): CardUsage {
  const d = digitsOf(number);
  const sum = (cond: string, ...args: number[]): number => (db.prepare(`SELECT COALESCE(SUM(COALESCE(hamyon_amount, amount)), 0) AS s FROM payments WHERE replace(card, ' ', '') = ? AND ${cond}`).get(d, ...args) as { s: number }).s;
  return {
    day: sum("status = 'success' AND paid_at >= ?", tzDayStart(now)),
    month: sum("status = 'success' AND paid_at >= ?", monthStart(now)),
    reserved: sum("status IN ('pending', 'prepared') AND expire_at > ?", Math.floor(now / 1000)),
    lastAt: (db.prepare("SELECT COALESCE(MAX(created_at), 0) AS t FROM payments WHERE replace(card, ' ', '') = ?").get(d) as { t: number }).t,
  };
}

/** Karta shu summani qabul qila oladimi (zaxira foizi hisobga olingan holda). */
export function fits(card: PayCard, u: CardUsage, amount: number, reservePct: number): boolean {
  const eff = (limit: number): number => (limit > 0 ? Math.floor((limit * (100 - reservePct)) / 100) : Infinity);
  return u.day + u.reserved + amount <= eff(card.dailyLimit) && u.month + u.reserved + amount <= eff(card.monthlyLimit);
}
const load = (card: PayCard, u: CardUsage): number => {
  const r = (used: number, limit: number): number => (limit > 0 ? used / limit : 0);
  return Math.max(r(u.day + u.reserved, card.dailyLimit), r(u.month + u.reserved, card.monthlyLimit));
};

/** Eski (bitta karta, PAY_OWN_CARD) rejimi: havzada karta bo'lmasa, shu karta limitsiz ishlatiladi. */
export function activeCards(db: DatabaseSync, cfg: PoolConfig): PayCard[] {
  const cards = listCards(db).filter((c) => c.enabled);
  if (cards.length || listCards(db).length) return cards; // havzada karta bor (hammasi o'chiq bo'lsa ham) — env karta ishlatilmaydi
  const legacy = digitsOf(cfg.legacyCard);
  return /^\d{16}$/.test(legacy) ? [{ id: 'env', number: legacy, label: '', enabled: true, dailyLimit: 0, monthlyLimit: 0, priority: 0, createdAt: 0 }] : [];
}

/** Yangi to'lov uchun karta tanlaydi; sig'adigan karta bo'lmasa null. */
export function pickCard(db: DatabaseSync, amount: number, cfg: PoolConfig, now = Date.now()): PayCard | null {
  const cand = activeCards(db, cfg).map((c) => ({ c, u: cardUsage(db, c.number, now) })).filter((x) => fits(x.c, x.u, amount, cfg.reservePct));
  if (!cand.length) return null;
  cand.sort(cfg.strategy === 'fill'
    ? (a, b) => a.c.priority - b.c.priority || a.c.createdAt - b.c.createdAt
    : (a, b) => load(a.c, a.u) - load(b.c, b.u) || a.u.lastAt - b.u.lastAt || a.c.priority - b.c.priority);
  return cand[0]!.c;
}
