// Referal dasturi: har o'quvchining taklif kodi; yangi hisob kod bilan ochilsa — taklif qilgan kishiga bog'lanadi.
// Mukofot (o'yin ichidagi, pul emas): taklif qilingan o'quvchi birinchi dars yoki daraja testini bajarganda IKKALASIGA REF_XP.
// Ixtiyoriy pulga teng mukofot (egasi qarori): REF_PLAN_DAYS > 0 bo'lsa — ikkalasiga shuncha kun All Access.
// Taklif qilgan uchun 30 kunlik cheklov (REF_PLAN_MONTHLY_CAP, standart 3) — ko'p soxta hisob ochib kun yig'ishning oldini oladi.
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { awardXp } from './xp';
import { extend } from './payments';
import { tracksOf } from './pricing';

/** Ikkala tomonga beriladigan XP (admin panel: REF_XP). Har chaqiruvda o'qiladi. */
export const refXp = (env: NodeJS.ProcessEnv = process.env): number => Math.max(0, Math.min(150, Math.floor(Number(env.REF_XP ?? 100) || 0)));
const DAY = 86_400_000;
/** Ikkala tomonga beriladigan All Access kunlari (0 — o'chiq, eng ko'pi 30). */
export const refPlanDays = (env: NodeJS.ProcessEnv = process.env): number => Math.max(0, Math.min(30, Math.floor(Number(env.REF_PLAN_DAYS ?? 0) || 0)));
/** Taklif qilgan kishi 30 kun ichida necha marta kun oladi (taklif qilingan esa har doim oladi). */
export const refPlanCap = (env: NodeJS.ProcessEnv = process.env): number => Math.max(0, Math.floor(Number(env.REF_PLAN_MONTHLY_CAP ?? 3) || 0));

export function ensureReferralColumns(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('ref_code')) db.exec('ALTER TABLE players ADD COLUMN ref_code TEXT');
  if (!cols.includes('referred_by')) db.exec('ALTER TABLE players ADD COLUMN referred_by INTEGER');
  if (!cols.includes('ref_rewarded')) db.exec('ALTER TABLE players ADD COLUMN ref_rewarded INTEGER NOT NULL DEFAULT 0');
  if (!cols.includes('ref_rewarded_at')) db.exec('ALTER TABLE players ADD COLUMN ref_rewarded_at INTEGER');
  if (!cols.includes('ref_host_days')) db.exec('ALTER TABLE players ADD COLUMN ref_host_days INTEGER NOT NULL DEFAULT 0'); // shu taklif uchun taklif qilganga berilgan kunlar
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
/** Creator tracking linkining kodi (creator_links): faol link va tasdiqlangan hamkor bo'lsagina taklif qilganga aylanadi. Eski ref_code'lar o'zgarishsiz ishlaydi. */
function linkOwner(db: DatabaseSync, code: string): { id: number } | undefined {
  try {
    return db.prepare(`SELECT l.creator_id AS id FROM creator_links l JOIN players p ON p.id = l.creator_id LEFT JOIN creator_profiles cp ON cp.player_id = l.creator_id
      WHERE l.code = ? AND l.active = 1 AND p.role = 'creator' AND COALESCE(cp.status, 'approved') = 'approved'`).get(code) as { id: number } | undefined;
  } catch { return undefined; } // jadval yo'q (eski baza/test)
}
export function attachReferral(db: DatabaseSync, newPlayerId: number, code: unknown): boolean {
  if (!isRefCode(code)) return false;
  const ref = (db.prepare('SELECT id FROM players WHERE ref_code = ?').get(code) as { id: number } | undefined) ?? linkOwner(db, code);
  if (!ref || ref.id === newPlayerId) return false;
  return Number(db.prepare('UPDATE players SET referred_by = ? WHERE id = ? AND referred_by IS NULL').run(ref.id, newPlayerId).changes) > 0;
}

/** Taklif qilingan o'quvchi haqiqiy mashg'ulot (dars yoki daraja testi) bajargach — bir marta, ikkala tomonga XP. */
export function maybeRewardReferral(db: DatabaseSync, playerId: number, now = Date.now(), env: NodeJS.ProcessEnv = process.env): boolean {
  const p = db.prepare('SELECT referred_by, ref_rewarded FROM players WHERE id = ?').get(playerId) as { referred_by: number | null; ref_rewarded: number } | undefined;
  if (!p?.referred_by || p.ref_rewarded) return false;
  const did = db.prepare("SELECT 1 FROM xp_events WHERE player_id = ? AND source IN ('lesson', 'placement') AND accepted > 0 LIMIT 1").get(playerId);
  if (!did) return false;
  if (Number(db.prepare('UPDATE players SET ref_rewarded = 1, ref_rewarded_at = ? WHERE id = ? AND ref_rewarded = 0').run(now, playerId).changes) === 0) return false;
  const xpBonus = refXp(env);
  if (xpBonus > 0) { awardXp(db, playerId, `ref:new:${playerId}`, 'referral', xpBonus, now); awardXp(db, p.referred_by, `ref:by:${playerId}`, 'referral', xpBonus, now); }
  const days = refPlanDays(env);
  if (days > 0) {
    for (const t of tracksOf('all')) extend(db, playerId, t, days, now); // taklif qilingan — har doim (bir marta: ref_rewarded)
    const recent = (db.prepare('SELECT COUNT(*) AS n FROM players WHERE referred_by = ? AND ref_host_days > 0 AND ref_rewarded_at > ?').get(p.referred_by, now - 30 * DAY) as { n: number }).n;
    if (recent < refPlanCap(env)) {
      for (const t of tracksOf('all')) extend(db, p.referred_by, t, days, now);
      db.prepare('UPDATE players SET ref_host_days = ? WHERE id = ?').run(days, playerId);
    }
  }
  return true;
}

export interface RefStats { code: string; invited: number; activated: number; xpEach: number; planDays: number }
export function refStats(db: DatabaseSync, playerId: number): RefStats {
  const r = db.prepare('SELECT COUNT(*) AS invited, COALESCE(SUM(ref_rewarded), 0) AS activated FROM players WHERE referred_by = ?').get(playerId) as { invited: number; activated: number };
  return { code: refCodeOf(db, playerId), invited: r.invited, activated: r.activated, xpEach: refXp(), planDays: refPlanDays() };
}
