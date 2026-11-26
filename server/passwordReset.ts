// Parolni tiklash (telefon + parol hisoblari uchun) — Telegram bot orqali. SMS yo'q (pullik servis), shuning uchun raqam egasini
// Telegram tasdiqlaydi: bot faqat o'z kontaktini ("Raqamni ulashish", contact.user_id === from.id) qabul qiladi (leads.tg_phones).
// Bot shu raqamli hisob uchun bir martalik havola yuboradi: 15 daqiqa amal qiladi, bazada faqat xeshi, ishlatilgach bekor;
// yangi parol o'rnatilganda hisobning boshqa barcha sessiyalari yopiladi (parolni bilgan boshqa odam chiqib ketadi).
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, hashToken, newSession } from './db';
import { normPhone } from './credentials';

export const RESET_TTL_MS = 15 * 60_000;
const PER_HOUR = 3;

export function ensureResetTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS password_resets (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, used_at INTEGER)');
}

export type ResetOffer = { ok: true; token: string; nickname: string } | { ok: false; reason: 'nophone' | 'noaccount' | 'limit' };

/** Bot: Telegram tasdiqlagan raqam bo'yicha telefon-hisob topiladi va bir martalik tiklash kaliti yaratiladi. */
export function offerReset(db: DatabaseSync, tgId: number, now = Date.now()): ResetOffer {
  const row = db.prepare('SELECT phone FROM tg_phones WHERE tg_id = ?').get(tgId) as { phone: string } | undefined;
  const phone = row ? normPhone(row.phone) : null;
  if (!phone) return { ok: false, reason: 'nophone' };
  const acc = db.prepare('SELECT id, nickname FROM players WHERE phone = ? AND pass_hash IS NOT NULL').get(phone) as { id: number; nickname: string } | undefined;
  if (!acc) return { ok: false, reason: 'noaccount' };
  const recent = (db.prepare('SELECT COUNT(*) AS n FROM password_resets WHERE player_id = ? AND created_at > ?').get(acc.id, now - 3_600_000) as { n: number }).n;
  if (recent >= PER_HOUR) return { ok: false, reason: 'limit' };
  const token = randomBytes(24).toString('hex');
  db.prepare('INSERT INTO password_resets (player_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)').run(acc.id, hashToken(token), now, now + RESET_TTL_MS);
  return { ok: true, token, nickname: acc.nickname };
}

/** Sayt: kalit yaroqli bo'lsa — yangi parol xeshi yoziladi, kalit bekor, boshqa sessiyalar yopiladi; yangi sessiya qaytadi. */
export function consumeReset(db: DatabaseSync, token: unknown, passHash: string, now = Date.now()): { token: string; nickname: string } {
  if (typeof token !== 'string' || !/^[a-f0-9]{48}$/.test(token)) throw new ApiError(400, 'Havola noto‘g‘ri');
  const r = db.prepare('SELECT id, player_id, expires_at, used_at FROM password_resets WHERE token_hash = ?').get(hashToken(token)) as { id: number; player_id: number; expires_at: number; used_at: number | null } | undefined;
  if (!r || r.used_at) throw new ApiError(410, 'Havola allaqachon ishlatilgan yoki noto‘g‘ri. Botda /parol buyrug‘ini qayta yuboring.');
  if (now > r.expires_at) throw new ApiError(410, 'Havola muddati tugagan (15 daqiqa). Botda /parol buyrug‘ini qayta yuboring.');
  db.prepare('UPDATE password_resets SET used_at = ? WHERE id = ?').run(now, r.id);
  db.prepare('UPDATE players SET pass_hash = ?, updated_at = ? WHERE id = ?').run(passHash, now, r.player_id);
  db.prepare('UPDATE sessions SET revoked_at = ? WHERE player_id = ? AND revoked_at IS NULL').run(now, r.player_id);
  const nick = (db.prepare('SELECT nickname FROM players WHERE id = ?').get(r.player_id) as { nickname: string }).nickname;
  return { token: newSession(db, r.player_id, now), nickname: nick };
}

/** Kalit tekshiruvi (sahifa ochilganda: amal qiladimi). Ishlatmaydi. */
export function resetValid(db: DatabaseSync, token: unknown, now = Date.now()): boolean {
  if (typeof token !== 'string' || !/^[a-f0-9]{48}$/.test(token)) return false;
  const r = db.prepare('SELECT expires_at, used_at FROM password_resets WHERE token_hash = ?').get(hashToken(token)) as { expires_at: number; used_at: number | null } | undefined;
  return !!r && !r.used_at && now <= r.expires_at;
}
