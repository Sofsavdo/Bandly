// Hamkorlik (blogerlar, o'qituvchilar, faol o'quvchilar): ommaviy ariza va ochiq shartlar.
// Egasi (2026-11-26): "hamkorlik uchun deb qo'yishimiz yaxshimi? blogerlar, blog yurituvchi o'quvchilar bo'lishi mumkin".
// Mukofot summalari bu yerda BELGILANMAYDI: sahifada faqat admin yoqqan (egasi tasdiqlagan) hamkor qoidalari va referal sozlamalari
// ko'rsatiladi; qoida bo'lmasa — "shartlar ariza ko'rib chiqilgach kelishiladi". Ariza adminga tushadi, u hamkor rolini beradi.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';
import { listRules } from './creatorLedger';
import { refPlanDays, refXp } from './referral';

export const PARTNER_KINDS = ['blogger', 'teacher', 'learner'] as const;
export const AUDIENCES = ['<1k', '1k-10k', '10k-100k', '100k+'] as const;
export const APP_STATUSES = ['new', 'contacted', 'approved', 'rejected'] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

export function ensurePartnersTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS partner_applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, name TEXT NOT NULL, link TEXT NOT NULL, audience TEXT NOT NULL,
    contact TEXT NOT NULL, note TEXT, player_id INTEGER, status TEXT NOT NULL DEFAULT 'new', admin_note TEXT,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)`);
}

const clean = (v: unknown, n: number): string => (typeof v === 'string' ? v.replace(/[\u0000-\u001f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');

/** Ijtimoiy tarmoq havolasi: http(s) manzil yoki @username (Telegram/Instagram). */
export function normLink(v: unknown): string | null {
  const s = clean(v, 200);
  if (/^@[A-Za-z0-9_.]{3,40}$/.test(s)) return s;
  try { const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`); return /\./.test(u.hostname) && u.hostname.length <= 100 ? u.toString().slice(0, 200) : null; } catch { return null; }
}
/** Aloqa: Telegram @username yoki telefon (+998…). */
export function normContact(v: unknown): string | null {
  const s = clean(v, 60);
  if (/^@[A-Za-z0-9_]{4,32}$/.test(s)) return s;
  const d = s.replace(/[^\d+]/g, '');
  return /^\+?\d{9,15}$/.test(d) ? d : null;
}

const recent = new Map<string, number[]>();
/** Bir manzildan soatiga 5 tadan ko'p ariza qabul qilinmaydi (spam). */
function allowIp(ip: string, now: number): boolean {
  const a = (recent.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (a.length >= 5) return false;
  a.push(now); recent.set(ip, a); return true;
}

export function submitApplication(db: DatabaseSync, b: Record<string, unknown>, o: { ip: string; playerId?: number | null }, now = Date.now()): { id: number; duplicate: boolean } {
  if (b.consent !== true) throw new ApiError(400, 'Ma’lumotlaringizni ko‘rib chiqishimizga rozilik bering');
  const kind = PARTNER_KINDS.includes(b.kind as never) ? (b.kind as string) : null;
  if (!kind) throw new ApiError(400, 'Kim ekaningizni tanlang');
  const name = clean(b.name, 60); if (name.length < 2) throw new ApiError(400, 'Ismingizni yozing');
  const link = normLink(b.link); if (!link) throw new ApiError(400, 'Sahifangiz havolasini yozing (masalan, instagram.com/… yoki @kanal)');
  const audience = AUDIENCES.includes(b.audience as never) ? (b.audience as string) : null;
  if (!audience) throw new ApiError(400, 'Auditoriya hajmini tanlang');
  const contact = normContact(b.contact); if (!contact) throw new ApiError(400, 'Telegram (@username) yoki telefon raqamingizni yozing');
  const note = clean(b.note, 500) || null;
  // Bir xil aloqa bilan ochiq ariza bo'lsa — yangisi yaratilmaydi (takroriy bosish)
  const dup = db.prepare("SELECT id FROM partner_applications WHERE contact = ? AND status IN ('new', 'contacted')").get(contact) as { id: number } | undefined;
  if (dup) return { id: dup.id, duplicate: true };
  if (!allowIp(o.ip, now)) throw new ApiError(429, 'Juda ko‘p ariza — birozdan keyin urinib ko‘ring');
  const r = db.prepare('INSERT INTO partner_applications (kind, name, link, audience, contact, note, player_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(kind, name, link, audience, contact, note, o.playerId ?? null, 'new', now, now);
  return { id: Number(r.lastInsertRowid), duplicate: false };
}

export interface PartnerApp { id: number; kind: string; name: string; link: string; audience: string; contact: string; note: string | null; playerId: number | null; nickname: string | null; status: AppStatus; adminNote: string | null; createdAt: number }
export function listApplications(db: DatabaseSync, status?: string | null): PartnerApp[] {
  const st = status && APP_STATUSES.includes(status as AppStatus) ? status : null;
  const rows = db.prepare(`SELECT a.*, p.nickname FROM partner_applications a LEFT JOIN players p ON p.id = a.player_id ${st ? 'WHERE a.status = ?' : ''} ORDER BY a.id DESC LIMIT 300`).all(...(st ? [st] : [])) as Record<string, unknown>[];
  return rows.map((r) => ({ id: Number(r.id), kind: String(r.kind), name: String(r.name), link: String(r.link), audience: String(r.audience), contact: String(r.contact), note: (r.note as string) ?? null, playerId: r.player_id === null ? null : Number(r.player_id), nickname: (r.nickname as string) ?? null, status: r.status as AppStatus, adminNote: (r.admin_note as string) ?? null, createdAt: Number(r.created_at) }));
}
export function setApplicationStatus(db: DatabaseSync, id: number, status: unknown, adminNote: unknown, now = Date.now()): void {
  if (!APP_STATUSES.includes(status as AppStatus)) throw new ApiError(400, 'Holat noto‘g‘ri');
  const r = db.prepare('UPDATE partner_applications SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?').run(status as string, clean(adminNote, 300) || null, now, id);
  if (!r.changes) throw new ApiError(404, 'Ariza topilmadi');
}

/** Ochiq shartlar (sahifada ko'rsatiladi): faqat yoqilgan va amal muddatidagi hamkor qoidalari + do'st taklif mukofoti. Summalar so'mda. */
export interface PublicTerms { rules: { kind: string; pct: number | null; som: number | null; holdDays: number }[]; invite: { xp: number; days: number } }
export function publicTerms(db: DatabaseSync, now = Date.now(), env: NodeJS.ProcessEnv = process.env): PublicTerms {
  const rules = listRules(db)
    .filter((r) => r.enabled && r.approvedAt !== null && r.campaignId === null && (r.startsAt === null || r.startsAt <= now) && (r.endsAt === null || r.endsAt > now))
    .map((r) => ({ kind: r.kind, pct: r.kind === 'paid_pct' ? r.pct : null, som: r.kind === 'paid_pct' || r.amountMinor === null ? null : Math.round(r.amountMinor / 100), holdDays: r.holdDays }));
  return { rules, invite: { xp: refXp(env), days: refPlanDays(env) } };
}
