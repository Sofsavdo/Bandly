// Lidlar (sotuv bo'limi uchun): ro'yxatdan o'tgan o'quvchining telefon raqami — FAQAT uning roziligi bilan — va
// operator ishlashi uchun kontekst (maqsad, daraja, kunlik vaqt, obuna holati, faollik). Raqam ikki yo'l bilan keladi:
// 1) shaxsiy reja savolnomasidagi forma (rozilik belgisi majburiy); 2) Telegram botda "Raqamni ulashish" tugmasi
// (raqamni Telegram tasdiqlaydi; faqat o'z kontaktini ulashsa qabul qilinadi).
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';

export const LEAD_STATUSES = ['new', 'called', 'no_answer', 'interested', 'paid', 'declined'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export function ensureLeadsTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS leads (
    player_id INTEGER PRIMARY KEY REFERENCES players(id),
    phone TEXT NOT NULL, source TEXT NOT NULL, consent_at INTEGER NOT NULL,
    goal TEXT, level TEXT, minutes INTEGER,
    status TEXT NOT NULL DEFAULT 'new', note TEXT, handled_by TEXT,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
  // Botda ulashilgan raqam (ilova hali ochilmagan bo'lishi mumkin) va taklif kodi — hisob ochilganda lidga o'tkaziladi
  db.exec('CREATE TABLE IF NOT EXISTS tg_phones (tg_id INTEGER PRIMARY KEY, phone TEXT NOT NULL, at INTEGER NOT NULL)');
  db.exec('CREATE TABLE IF NOT EXISTS tg_refs (tg_id INTEGER PRIMARY KEY, ref TEXT NOT NULL, at INTEGER NOT NULL)');
}

/** Botdagi "Raqamni ulashish": har doim saqlanadi; hisob bo'lsa — darhol lidga ham. */
export function saveBotPhone(db: DatabaseSync, tgId: number, phone: string, now = Date.now()): void {
  const p = normalizePhone(phone); if (!p) return;
  db.prepare('INSERT INTO tg_phones (tg_id, phone, at) VALUES (?, ?, ?) ON CONFLICT(tg_id) DO UPDATE SET phone = excluded.phone, at = excluded.at').run(tgId, p, now);
  const pl = db.prepare('SELECT id FROM players WHERE tg_id = ?').get(tgId) as { id: number } | undefined;
  if (pl) saveLead(db, pl.id, { phone: p, consent: true, source: 'telegram' }, now);
}
export const hasBotPhone = (db: DatabaseSync, tgId: number): boolean => !!db.prepare('SELECT 1 FROM tg_phones WHERE tg_id = ?').get(tgId);
/** Telegram orqali kirganda: botda ulashilgan raqam lidga o'tadi (agar hali yo'q bo'lsa). */
export function claimBotPhone(db: DatabaseSync, tgId: number, playerId: number, now = Date.now()): void {
  const r = db.prepare('SELECT phone FROM tg_phones WHERE tg_id = ?').get(tgId) as { phone: string } | undefined;
  if (r && !hasLead(db, playerId)) saveLead(db, playerId, { phone: r.phone, consent: true, source: 'telegram' }, now);
}
export const setBotRef = (db: DatabaseSync, tgId: number, ref: string, now = Date.now()): void => { db.prepare('INSERT INTO tg_refs (tg_id, ref, at) VALUES (?, ?, ?) ON CONFLICT(tg_id) DO UPDATE SET ref = excluded.ref, at = excluded.at').run(tgId, ref.slice(0, 16), now); };
export const getBotRef = (db: DatabaseSync, tgId: number): string | undefined => (db.prepare('SELECT ref FROM tg_refs WHERE tg_id = ?').get(tgId) as { ref: string } | undefined)?.ref;

/** Telefon raqamini +998XXXXXXXXX ko'rinishiga keltiradi (O'zbekiston) yoki xalqaro +<9–15 raqam>. Noto'g'ri bo'lsa — null. */
export function normalizePhone(raw: unknown): string | null {
  const d = String(raw ?? '').replace(/[^\d+]/g, '');
  const digits = d.replace(/\D/g, '');
  if (/^(998)?\d{9}$/.test(digits) && (digits.length === 9 || digits.startsWith('998'))) return '+998' + digits.slice(-9);
  if (d.startsWith('+') && digits.length >= 10 && digits.length <= 15) return '+' + digits;
  return null;
}

const clip = (s: unknown, n: number) => String(s ?? '').replace(/[<>]/g, ' ').trim().slice(0, n);
const GOALS = new Set(['general', 'ielts', 'cefr', 'sat', 'speaking', 'work', 'travel', 'school']);
const LEVELS = new Set(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);

/** Raqamni saqlaydi (qayta yuborilsa yangilanadi; operator holati va izohi saqlanib qoladi). */
export function saveLead(db: DatabaseSync, playerId: number, b: { phone: unknown; consent: unknown; source: 'form' | 'telegram'; goal?: unknown; level?: unknown; minutes?: unknown }, now = Date.now()): { phone: string } {
  if (b.consent !== true) throw new ApiError(400, 'Rozilik belgilanmagan');
  const phone = normalizePhone(b.phone);
  if (!phone) throw new ApiError(400, 'Telefon raqami noto‘g‘ri');
  const goal = GOALS.has(String(b.goal)) ? String(b.goal) : null;
  const level = LEVELS.has(String(b.level)) ? String(b.level) : null;
  const minutes = Number.isFinite(Number(b.minutes)) && Number(b.minutes) > 0 ? Math.min(240, Math.round(Number(b.minutes))) : null;
  db.prepare(`INSERT INTO leads (player_id, phone, source, consent_at, goal, level, minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(player_id) DO UPDATE SET phone = excluded.phone, source = excluded.source, consent_at = excluded.consent_at,
      goal = COALESCE(excluded.goal, leads.goal), level = COALESCE(excluded.level, leads.level), minutes = COALESCE(excluded.minutes, leads.minutes), updated_at = excluded.updated_at`)
    .run(playerId, phone, b.source, now, goal, level, minutes, now, now);
  return { phone };
}

/** Telegram kontakti: faqat o'z raqamini ulashgan bo'lsa (contact.user_id === from.id) va hisob shu Telegramga ulangan bo'lsa. */
export function saveTelegramContact(db: DatabaseSync, fromId: number, contact: { phone_number?: unknown; user_id?: unknown } | undefined, now = Date.now()): boolean {
  if (!contact || Number(contact.user_id) !== fromId) return false;
  const p = db.prepare('SELECT id FROM players WHERE tg_id = ?').get(fromId) as { id: number } | undefined;
  if (!p) return false;
  const phone = String(contact.phone_number ?? '');
  saveLead(db, p.id, { phone: phone.startsWith('+') ? phone : '+' + phone, consent: true, source: 'telegram' }, now);
  return true;
}

export const hasLead = (db: DatabaseSync, playerId: number): boolean => !!db.prepare('SELECT 1 FROM leads WHERE player_id = ?').get(playerId);

export interface LeadRow {
  playerId: number; nickname: string; phone: string; source: string; goal: string | null; level: string | null; minutes: number | null;
  status: LeadStatus; note: string | null; handledBy: string | null; signedUpAt: number; lastActiveAt: number; xp: number;
  subscribedUntil: number | null; paidCount: number; createdAt: number; updatedAt: number;
}

/** Operator ro'yxati: eng yangi lidlar birinchi; holat bo'yicha filtr. */
export function listLeads(db: DatabaseSync, status: string | null, limit = 200, now = Date.now()): LeadRow[] {
  const st = status && (LEAD_STATUSES as readonly string[]).includes(status) ? status : null;
  const rows = db.prepare(`SELECT l.player_id, p.nickname, l.phone, l.source, l.goal, l.level, l.minutes, l.status, l.note, l.handled_by, p.created_at, p.updated_at, p.xp, l.created_at AS lc, l.updated_at AS lu,
      (SELECT MAX(until) FROM subscriptions s WHERE s.player_id = l.player_id AND s.until > ?) AS sub,
      (SELECT COUNT(*) FROM payments y WHERE y.player_id = l.player_id AND y.status = 'success') AS paid
    FROM leads l JOIN players p ON p.id = l.player_id ${st ? 'WHERE l.status = ?' : ''} ORDER BY l.created_at DESC LIMIT ?`)
    .all(...(st ? [now, st, limit] : [now, limit])) as Record<string, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  return rows.map((r) => ({ playerId: r.player_id, nickname: r.nickname, phone: r.phone, source: r.source, goal: r.goal, level: r.level, minutes: r.minutes, status: r.status, note: r.note, handledBy: r.handled_by, signedUpAt: r.created_at, lastActiveAt: r.updated_at, xp: r.xp, subscribedUntil: r.sub ?? null, paidCount: r.paid, createdAt: r.lc, updatedAt: r.lu }));
}

/** Operator holat va izoh qo'yadi. */
export function updateLead(db: DatabaseSync, playerId: number, b: { status?: unknown; note?: unknown }, by: string, now = Date.now()): void {
  const status = b.status === undefined ? null : String(b.status);
  if (status !== null && !(LEAD_STATUSES as readonly string[]).includes(status)) throw new ApiError(400, 'Noma’lum holat');
  const r = db.prepare('UPDATE leads SET status = COALESCE(?, status), note = COALESCE(?, note), handled_by = ?, updated_at = ? WHERE player_id = ?')
    .run(status, b.note === undefined ? null : clip(b.note, 500), clip(by, 40), now, playerId);
  if (!r.changes) throw new ApiError(404, 'Lid topilmadi');
}
