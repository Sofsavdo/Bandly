// Anonim o'sish hodisalari (mehmon ham). Shaxsiy ma'lumot saqlanmaydi:
//  - Brauzer tasodifiy anonim identifikator yuboradi (localStorage `bandly.vid`, kirish/telefon/IP bilan bog'lanmagan).
//  - Serverda u maxfiy tuz bilan xeshlanadi (16 belgi) va faqat (kun, hodisa, xesh) ko'rinishida saqlanadi — 180 kundan keyin o'chiriladi.
//  - IP hech qachon bazaga yozilmaydi: faqat xotirada, suiiste'molni cheklash uchun (bir manbadan 10 daqiqada ko'pi bilan 120 hodisa).
// Shunday qilib bir Wi-Fi'dagi turli odamlar alohida sanaladi, IP o'zgarsa ham bir odam ikki marta sanalmaydi.
// Hisobotda ikki raqam: jami hodisalar (takrorlar bilan) va noyob tashrifchilar (kun bo'yicha).
import { createHash, randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { tzDay } from './day';

export const EVENT_NAMES = [
  'landing_view', 'signup_start', 'pricing_view', 'checkout_start',
  'placement_start', 'placement_done', 'share_placement_tg', 'share_placement_img', 'duel_guest_view', 'duel_share', 'share_mock', 'seo_cta',
  'login_widget_missing', 'login_bot_start', 'login_bot_done', // kirish oynasi: Telegram vidjeti chiqmadi / bot orqali kirish boshlandi va tugadi (anonim hisoblagich)
] as const;
export type EventName = (typeof EVENT_NAMES)[number];
export const isEventName = (x: unknown): x is EventName => (EVENT_NAMES as readonly unknown[]).includes(x);
const VID = /^[A-Za-z0-9_-]{16,64}$/;
export const RETENTION_DAYS = 180;

export function ensureEventsTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS events_daily (day TEXT NOT NULL, name TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, name))');
  db.exec('CREATE TABLE IF NOT EXISTS events_unique (day TEXT NOT NULL, name TEXT NOT NULL, vid TEXT NOT NULL, PRIMARY KEY (day, name, vid))');
  db.exec('CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
}

/** Xesh tuzi: EVENTS_SALT yoki bazada bir marta yaratilgan tasodifiy qiymat (kodda yoki logda ko'rinmaydi). */
let saltCache: { db: DatabaseSync; salt: string } | null = null;
function salt(db: DatabaseSync): string {
  if (saltCache?.db === db) return saltCache.salt;
  let s = process.env.EVENTS_SALT?.trim() || (db.prepare("SELECT value FROM app_meta WHERE key = 'events_salt'").get() as { value: string } | undefined)?.value;
  if (!s) { s = randomBytes(24).toString('hex'); db.prepare("INSERT OR IGNORE INTO app_meta (key, value) VALUES ('events_salt', ?)").run(s); }
  saltCache = { db, salt: s };
  return s;
}
export const hashVid = (db: DatabaseSync, vid: string): string => createHash('sha256').update(`${salt(db)}:${vid}`).digest('hex').slice(0, 16);

// Suiiste'mol chegarasi (faqat xotirada)
const bursts = new Map<string, { at: number; n: number }>();
const BURST_MS = 10 * 60_000, BURST_MAX = 120;
function abusive(source: string, now: number): boolean {
  const b = bursts.get(source);
  if (!b || now - b.at > BURST_MS) { if (bursts.size > 50_000) bursts.clear(); bursts.set(source, { at: now, n: 1 }); return false; }
  b.n++;
  return b.n > BURST_MAX;
}

let lastPurge = '';
/** Hodisani yozadi. Qaytaradi: 'unique' (yangi tashrifchi uchun), 'repeat' (shu tashrifchi bugun takrorladi), 'rejected'. */
export function recordEvent(db: DatabaseSync, name: unknown, source: string, vid?: unknown, now = Date.now()): 'unique' | 'repeat' | 'rejected' {
  if (!isEventName(name) || abusive(source, now)) return 'rejected';
  const day = tzDay(now);
  db.prepare('INSERT INTO events_daily (day, name, n) VALUES (?, ?, 1) ON CONFLICT(day, name) DO UPDATE SET n = n + 1').run(day, name);
  if (lastPurge !== day) { lastPurge = day; db.prepare('DELETE FROM events_unique WHERE day < ?').run(tzDay(now - RETENTION_DAYS * 86_400_000)); }
  if (typeof vid !== 'string' || !VID.test(vid)) return 'repeat'; // eski mijoz: faqat jami songa qo'shiladi
  const r = db.prepare('INSERT OR IGNORE INTO events_unique (day, name, vid) VALUES (?, ?, ?)').run(day, name, hashVid(db, vid));
  return Number(r.changes) ? 'unique' : 'repeat';
}

export interface EventStat { total: number; unique: number }
/** Davr bo'yicha: jami hodisalar va noyob tashrifchilar (bir odam bir kunda bir marta; davr bo'yicha noyob). */
export function eventStats(db: DatabaseSync, fromDay: string, toDay = '9999-12-31'): Record<EventName, EventStat> {
  const out = Object.fromEntries(EVENT_NAMES.map((n) => [n, { total: 0, unique: 0 }])) as Record<EventName, EventStat>;
  for (const r of db.prepare('SELECT name, SUM(n) AS n FROM events_daily WHERE day >= ? AND day <= ? GROUP BY name').all(fromDay, toDay) as { name: string; n: number }[]) if (isEventName(r.name)) out[r.name].total = r.n;
  for (const r of db.prepare('SELECT name, COUNT(DISTINCT vid) AS n FROM events_unique WHERE day >= ? AND day <= ? GROUP BY name').all(fromDay, toDay) as { name: string; n: number }[]) if (isEventName(r.name)) out[r.name].unique = r.n;
  return out;
}

/** Orqaga moslik: faqat jami sonlar. */
export function eventTotals(db: DatabaseSync, fromDay: string, toDay = '9999-12-31'): Record<EventName, number> {
  const s = eventStats(db, fromDay, toDay);
  return Object.fromEntries(EVENT_NAMES.map((n) => [n, s[n].total])) as Record<EventName, number>;
}
