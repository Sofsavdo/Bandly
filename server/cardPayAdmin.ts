import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';
import { audit } from './certificates';
import { cardUsage, deleteCard, fmtCardNumber, listCards, saveCard, type PayCard } from './cardPool';
import { loadCardPayConfig, recentNotices, shadowReport, type CardPayConfig } from './cardPay';
import { watchState } from './cardWatch';

// Admin paneldagi "O'z karta-to'lov" bo'limi uchun: sozlama, kartalar (limit va yuklama), Telegram holati, xabarlar, shadow hisoboti.

export interface CardView extends PayCard { numberFmt: string; usedDay: number; usedMonth: number; reserved: number; full: boolean }

export function overview(db: DatabaseSync, creds: { configured: boolean }, now = Date.now(), env: NodeJS.ProcessEnv = process.env) {
  const cfg = loadCardPayConfig(db, env);
  const cards: CardView[] = listCards(db).map((c) => {
    const u = cardUsage(db, c.number, now);
    const eff = (limit: number): number => (limit > 0 ? Math.floor((limit * (100 - cfg.reservePct)) / 100) : Infinity);
    return { ...c, numberFmt: fmtCardNumber(c.number), usedDay: u.day, usedMonth: u.month, reserved: u.reserved, full: u.day + u.reserved >= eff(c.dailyLimit) || u.month + u.reserved >= eff(c.monthlyLimit) };
  });
  return {
    config: { mode: cfg.mode, strategy: cfg.strategy, reservePct: cfg.reservePct, windowMin: Math.round(cfg.windowMs / 60_000), sources: cfg.sources, legacyCard: !cards.length && /\d{16}/.test(cfg.card.replace(/\D/g, '')) ? fmtCardNumber(cfg.card.replace(/\D/g, '')) : '' },
    telegram: { configured: creds.configured, state: watchState.state, since: watchState.since, error: watchState.error, lastNoticeAt: watchState.lastNoticeAt },
    cards,
    notices: recentNotices(db, 30),
    shadow: shadowReport(db, now - 7 * 86_400_000),
  };
}

const MODES = ['off', 'capture', 'shadow', 'live'];
export function setConfig(db: DatabaseSync, body: Record<string, unknown>, actorId: number | null, now = Date.now(), env: NodeJS.ProcessEnv = process.env): CardPayConfig {
  const put = (key: string, value: string): void => { db.prepare('INSERT INTO pay_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').run(key, value, now); };
  if (body.mode !== undefined) {
    if (!MODES.includes(String(body.mode))) throw new ApiError(400, 'Noma’lum rejim');
    // live: kamida bitta ishlaydigan karta bo'lmasa yoqilmaydi (mijozga karta ko'rsatilmay qolmasin)
    if (body.mode === 'live' && !listCards(db).some((c) => c.enabled) && !/\d{16}/.test(loadCardPayConfig(db, env).card.replace(/\D/g, ''))) throw new ApiError(400, 'Avval kamida bitta karta qo‘shing');
    put('mode', String(body.mode));
  }
  if (body.strategy !== undefined) { if (body.strategy !== 'spread' && body.strategy !== 'fill') throw new ApiError(400, 'Noma’lum tanlash usuli'); put('strategy', String(body.strategy)); }
  if (body.reservePct !== undefined) { const n = Number(body.reservePct); if (!Number.isInteger(n) || n < 0 || n > 90) throw new ApiError(400, 'Zaxira foizi 0–90 oralig‘ida bo‘lsin'); put('reserve_pct', String(n)); }
  if (body.windowMin !== undefined) { const n = Number(body.windowMin); if (!Number.isInteger(n) || n < 1 || n > 1440) throw new ApiError(400, 'To‘lov oynasi 1–1440 daqiqa'); put('window_min', String(n)); }
  audit(db, actorId, 'pay.config', null, body, now);
  return loadCardPayConfig(db, env);
}

export function addCard(db: DatabaseSync, body: Record<string, unknown>, actorId: number | null, now = Date.now()): PayCard {
  const c = saveCard(db, body, undefined, now);
  audit(db, actorId, 'pay.card.add', c.id, { last4: c.number.slice(-4), dailyLimit: c.dailyLimit, monthlyLimit: c.monthlyLimit }, now);
  return c;
}
export function editCard(db: DatabaseSync, id: string, body: Record<string, unknown>, actorId: number | null, now = Date.now()): PayCard {
  const c = saveCard(db, body, id, now);
  audit(db, actorId, 'pay.card.edit', c.id, { last4: c.number.slice(-4), enabled: c.enabled, dailyLimit: c.dailyLimit, monthlyLimit: c.monthlyLimit }, now);
  return c;
}
export function removeCard(db: DatabaseSync, id: string, actorId: number | null, now = Date.now()): void {
  deleteCard(db, id);
  audit(db, actorId, 'pay.card.remove', id, null, now);
}
