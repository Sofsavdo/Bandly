// Anonim o'sish hodisalari (mehmon ham): faqat kun + nom + son — shaxsiy ma'lumot, IP yoki token saqlanmaydi.
// Maqsad: hisobsiz bosqichlarni o'lchash (daraja testi → ro'yxat, ulashishlar, duel taklifi) — tahlil hujjatidagi
// maqsadlar (daraja testi → ro'yxat ≥ 35%, K-faktor) shu raqamlarsiz tekshirib bo'lmaydi.
import type { DatabaseSync } from 'node:sqlite';
import { tzDay } from './day';

export const EVENT_NAMES = ['placement_start', 'placement_done', 'share_placement_tg', 'share_placement_img', 'duel_guest_view', 'duel_share', 'seo_cta'] as const;
export type EventName = (typeof EVENT_NAMES)[number];
export const isEventName = (x: unknown): x is EventName => (EVENT_NAMES as readonly unknown[]).includes(x);

export function ensureEventsTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS events_daily (day TEXT NOT NULL, name TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, name))');
}

// Bir manbadan (IP xeshi emas — faqat xotirada, kun bo'yi) bir hodisa bir marta sanaladi: yangilash/takror bosish sonni shishirmasin
let seenDay = '';
const seen = new Set<string>();
export function recordEvent(db: DatabaseSync, name: unknown, source: string, now = Date.now()): boolean {
  if (!isEventName(name)) return false;
  const day = tzDay(now);
  if (day !== seenDay) { seen.clear(); seenDay = day; }
  const k = `${source}|${name}`;
  if (seen.has(k)) return false;
  if (seen.size > 200_000) seen.clear(); // xotira chegarasi
  seen.add(k);
  db.prepare('INSERT INTO events_daily (day, name, n) VALUES (?, ?, 1) ON CONFLICT(day, name) DO UPDATE SET n = n + 1').run(day, name);
  return true;
}

export function eventTotals(db: DatabaseSync, fromDay: string, toDay = '9999-12-31'): Record<EventName, number> {
  const out = Object.fromEntries(EVENT_NAMES.map((n) => [n, 0])) as Record<EventName, number>;
  for (const r of db.prepare('SELECT name, SUM(n) AS n FROM events_daily WHERE day >= ? AND day <= ? GROUP BY name').all(fromDay, toDay) as { name: string; n: number }[]) if (isEventName(r.name)) out[r.name] = r.n;
  return out;
}
