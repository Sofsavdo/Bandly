// Referal dasturi: har o'quvchining taklif kodi; yangi hisob kod bilan ochilsa — taklif qilgan kishiga bog'lanadi.
// Mukofot (o'yin ichidagi, pul emas): taklif qilingan o'quvchi birinchi dars yoki daraja testini bajarganda IKKALASIGA REF_XP.
// Obuna kunlari kabi pulga teng mukofot — egasi qarori; hozircha yo'q.
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { awardXp } from './xp';

export const REF_XP = Math.max(0, Math.min(150, Number(process.env.REF_XP ?? 100)));

export function ensureReferralColumns(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('ref_code')) db.exec('ALTER TABLE players ADD COLUMN ref_code TEXT');
  if (!cols.includes('referred_by')) db.exec('ALTER TABLE players ADD COLUMN referred_by INTEGER');
  if (!cols.includes('ref_rewarded')) db.exec('ALTER TABLE players ADD COLUMN ref_rewarded INTEGER NOT NULL DEFAULT 0');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS players_ref_code ON players (ref_code) WHERE ref_code IS NOT NULL');
}

const ALPH = 'abcdefghjkmnpqrstuvwxyz23456789';
export const isRefCode = (s: unknown): s is string => typeof s === 'string' && /^[a-z2-9]{6,10}$/.test(s);

/** O'quvchining taklif kodi (birinchi so'ralganda yaratiladi). */
export function refCodeOf(db: DatabaseSync, playerId: number): string {
  const row = db.prepare('SELECT ref_code FROM players WHERE id = ?').get(playerId) as { ref_code: string | null } | undefined;
  if (row?.ref_code) return row.ref_code;
  for (;;) {
    const code = [...randomBytes(7)].map((b) => ALPH[b % ALPH.length]).join('');
    try { db.prepare('UPDATE players SET ref_code = ? WHERE id = ? AND ref_code IS NULL').run(code, playerId); break; } catch { /* takror — boshqasi */ }
  }
  return (db.prepare('SELECT ref_code FROM players WHERE id = ?').get(playerId) as { ref_code: string }).ref_code;
}

/** Yangi hisobni taklif qilgan kishiga bog'laydi (faqat yangi ochilgan, hali bog'lanmagan va o'zi emas). */
export function attachReferral(db: DatabaseSync, newPlayerId: number, code: unknown): boolean {
  if (!isRefCode(code)) return false;
  const ref = db.prepare('SELECT id FROM players WHERE ref_code = ?').get(code) as { id: number } | undefined;
  if (!ref || ref.id === newPlayerId) return false;
  return Number(db.prepare('UPDATE players SET referred_by = ? WHERE id = ? AND referred_by IS NULL').run(ref.id, newPlayerId).changes) > 0;
}

/** Taklif qilingan o'quvchi haqiqiy mashg'ulot (dars yoki daraja testi) bajargach — bir marta, ikkala tomonga XP. */
export function maybeRewardReferral(db: DatabaseSync, playerId: number, now = Date.now()): boolean {
  const p = db.prepare('SELECT referred_by, ref_rewarded FROM players WHERE id = ?').get(playerId) as { referred_by: number | null; ref_rewarded: number } | undefined;
  if (!p?.referred_by || p.ref_rewarded) return false;
  const did = db.prepare("SELECT 1 FROM xp_events WHERE player_id = ? AND source IN ('lesson', 'placement') AND accepted > 0 LIMIT 1").get(playerId);
  if (!did) return false;
  if (Number(db.prepare('UPDATE players SET ref_rewarded = 1 WHERE id = ? AND ref_rewarded = 0').run(playerId).changes) === 0) return false;
  if (REF_XP > 0) { awardXp(db, playerId, `ref:new:${playerId}`, 'referral', REF_XP, now); awardXp(db, p.referred_by, `ref:by:${playerId}`, 'referral', REF_XP, now); }
  return true;
}

export interface RefStats { code: string; invited: number; activated: number; xpEach: number }
export function refStats(db: DatabaseSync, playerId: number): RefStats {
  const r = db.prepare('SELECT COUNT(*) AS invited, COALESCE(SUM(ref_rewarded), 0) AS activated FROM players WHERE referred_by = ?').get(playerId) as { invited: number; activated: number };
  return { code: refCodeOf(db, playerId), invited: r.invited, activated: r.activated, xpEach: REF_XP };
}
