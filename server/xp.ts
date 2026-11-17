// XP jurnali (server hisoblaydi): mijoz umumiy XP yubormaydi — faqat alohida hodisalar (id, manba, miqdor).
// Server har hodisani bir marta qabul qiladi (id bo'yicha), har manba va kun uchun chegara qo'yadi.
// Server o'zi tekshira oladigan natijalar (Mock Arena baholash) XP'ni to'g'ridan-to'g'ri server beradi.
import type { DatabaseSync } from 'node:sqlite';
import { byToken } from './db';
import { joinWeek } from './league';

export const XP_SOURCES = ['lesson', 'boss', 'game', 'exam', 'grammar', 'practice', 'mistakes', 'placement', 'quest', 'other', 'mock'] as const;
export type XpSource = (typeof XP_SOURCES)[number];
/** Kunlik chegaralar (UTC kun): bitta manbadan va jami. */
export const SOURCE_DAILY: Record<XpSource, number> = { lesson: 400, boss: 200, game: 200, exam: 300, grammar: 200, practice: 200, mistakes: 150, placement: 30, quest: 60, other: 100, mock: 300 };
export const EVENT_MAX = 150;
export const TOTAL_DAILY = 1000;

export function ensureXpTables(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS xp_events (player_id INTEGER NOT NULL REFERENCES players(id), event_id TEXT NOT NULL, source TEXT NOT NULL, claimed INTEGER NOT NULL, accepted INTEGER NOT NULL, ts INTEGER NOT NULL, PRIMARY KEY (player_id, event_id))');
  db.exec('CREATE INDEX IF NOT EXISTS xp_events_day ON xp_events (player_id, ts)');
}

const dayStart = (now: number) => { const d = new Date(now); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };

/** Bitta hodisani qabul qiladi (takror id — 0). Qaytaradi: qabul qilingan XP. */
export function awardXp(db: DatabaseSync, playerId: number, eventId: string, source: string, amount: number, now = Date.now()): number {
  if (!/^[\w:.-]{6,80}$/.test(eventId)) return 0;
  const src = (XP_SOURCES as readonly string[]).includes(source) ? (source as XpSource) : 'other';
  const claimed = Number.isFinite(amount) ? Math.max(0, Math.min(EVENT_MAX, Math.floor(amount))) : 0;
  if (db.prepare('SELECT 1 FROM xp_events WHERE player_id = ? AND event_id = ?').get(playerId, eventId)) return 0;
  const since = dayStart(now);
  const used = (q: string, ...a: unknown[]) => (db.prepare(q).get(...(a as [])) as { s: number }).s;
  const bySrc = used('SELECT COALESCE(SUM(accepted),0) AS s FROM xp_events WHERE player_id = ? AND source = ? AND ts >= ?', playerId, src, since);
  const total = used('SELECT COALESCE(SUM(accepted),0) AS s FROM xp_events WHERE player_id = ? AND ts >= ?', playerId, since);
  const accepted = Math.max(0, Math.min(claimed, SOURCE_DAILY[src] - bySrc, TOTAL_DAILY - total));
  db.prepare('INSERT INTO xp_events (player_id, event_id, source, claimed, accepted, ts) VALUES (?, ?, ?, ?, ?, ?)').run(playerId, eventId, src, claimed, accepted, now);
  if (accepted > 0) {
    db.prepare('UPDATE players SET xp = xp + ?, updated_at = ? WHERE id = ?').run(accepted, now, playerId);
    db.prepare('INSERT INTO xp_log (player_id, ts, delta) VALUES (?, ?, ?)').run(playerId, now, accepted);
    joinWeek(db, playerId, now); // haftalik liga: faol o'quvchi o'z darajasidagi guruhga qo'shiladi
  }
  return accepted;
}

/** POST /api/xp: mijoz hodisalari. "mock" manbasini mijoz yubora olmaydi (uni server beradi). */
export function submitXp(db: DatabaseSync, token: string, events: unknown, now = Date.now()): { xp: number; accepted: number; done: string[] } {
  const p = byToken(db, token);
  const list = Array.isArray(events) ? events.slice(0, 50) : [];
  let accepted = 0; const done: string[] = [];
  for (const e of list) {
    const ev = e as { id?: unknown; source?: unknown; amount?: unknown };
    const id = String(ev.id ?? ''); const src = String(ev.source ?? 'other');
    if (src === 'mock') { done.push(id); continue; }
    accepted += awardXp(db, p.id, id, src, Number(ev.amount), now);
    done.push(id);
  }
  const xp = (db.prepare('SELECT xp FROM players WHERE id = ?').get(p.id) as { xp: number }).xp;
  return { xp, accepted, done };
}
