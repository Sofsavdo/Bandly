// Kunlik avtomatik zaxira nusxa: server ishlab turganda bazaning izchil nusxasi (VACUUM INTO, asosiy faylga yozmaydi)
// shu disk ichidagi backups/ papkasiga olinadi, tekshiriladi va 14 kundan eskilari o'chiriladi (eng yangi yaroqli nusxa doim qoladi).
// Disk butunlay yo'qolishidan himoya: BACKUP_S3_* sozlangan bo'lsa, har yangi nusxa tashqi S3-mos omborga ham yuboriladi (server/offsite.ts).
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { checkSnapshot, prune, snapshot } from '../scripts/backup/lib';
import { offsiteConfigFromEnv, uploadBackup, type OffsiteConfig } from './offsite';

const TS = /^bandly-(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z\.sqlite$/;
export const BACKUP_EVERY_MS = 24 * 3_600_000;

function newestAt(dir: string): number {
  let best = 0;
  try { for (const f of readdirSync(dir)) { const m = TS.exec(f); if (m) best = Math.max(best, Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!, +m[4]!, +m[5]!, +m[6]!)); } } catch { /* papka hali yo'q */ }
  return best;
}

/** Oxirgi nusxadan 24 soat o'tgan bo'lsa yangisini oladi. Qaytaradi: yangi fayl yoki null. */
export function backupIfDue(dbFile: string, dir: string, keepDays = 14, now = new Date()): string | null {
  if (now.getTime() - newestAt(dir) < BACKUP_EVERY_MS) return null;
  const r = snapshot(dbFile, dir, now);
  const c = checkSnapshot(r.file);
  if (!c.ok) throw new Error(`backup check failed: ${c.problems.join('; ')}`);
  prune(dir, keepDays, now);
  return r.file;
}

/** Zaxira holati (Admin kabinetida ko'rsatiladi): mahalliy va tashqi nusxa qachon olingani, xatolar, tashqi ombor sozlanganmi.
 *  Faqat fakt: sozlanmagan tashqi ombor "ishlayapti" deb ko'rsatilmaydi. Kalit va manzillar qaytarilmaydi. */
export interface BackupStatus {
  enabled: boolean; keepDays: number; newestLocalAt: number | null; localCount: number; lastError: string | null; lastErrorAt: number | null;
  offsite: 'not_configured' | 'misconfigured' | 'configured'; lastOffsiteAt: number | null; lastOffsiteError: string | null; stale: boolean;
}
const st = { enabled: false, dir: '', keep: 14, lastError: null as string | null, lastErrorAt: null as number | null, offsite: 'not_configured' as BackupStatus['offsite'], lastOffsiteAt: null as number | null, lastOffsiteError: null as string | null };
export function backupStatus(now = Date.now()): BackupStatus {
  let count = 0; try { count = readdirSync(st.dir).filter((f) => TS.test(f)).length; } catch { /* papka yo'q */ }
  const newest = st.dir ? newestAt(st.dir) || null : null;
  return { enabled: st.enabled, keepDays: st.keep, newestLocalAt: newest, localCount: count, lastError: st.lastError, lastErrorAt: st.lastErrorAt, offsite: st.offsite, lastOffsiteAt: st.lastOffsiteAt, lastOffsiteError: st.lastOffsiteError, stale: st.enabled && (!newest || now - newest > BACKUP_EVERY_MS + 3 * 3_600_000) };
}
/** Bitta tekshiruv (test va taymer uchun): mahalliy nusxa, keyin (sozlangan bo'lsa) tashqi nusxa. */
export async function runBackupTick(dbFile: string, dir: string, keep: number, offsite: OffsiteConfig | null, upload = uploadBackup, now = new Date()): Promise<void> {
  let f: string | null = null;
  try { f = backupIfDue(dbFile, dir, keep, now); if (f) { console.log(`backup: ${f}`); st.lastError = null; } }
  catch (e) { st.lastError = (e as Error).message.slice(0, 200); st.lastErrorAt = now.getTime(); console.error('backup failed:', st.lastError); }
  // Tashqi nusxa: mahalliy nusxa muvaffaqiyatli bo'lsa; xato mahalliy zaxirani buzmaydi, keyingi kunda yana urinadi
  if (f && offsite) {
    try { const r = await upload(offsite, f); st.lastOffsiteAt = now.getTime(); st.lastOffsiteError = null; console.log(`backup offsite: ${r.key} (${r.bytes} B)`); }
    catch (e) { st.lastOffsiteError = (e as Error).message.slice(0, 200); console.error('backup offsite failed:', st.lastOffsiteError); }
  }
}

export function startAutoBackup(dbFile: string, env: NodeJS.ProcessEnv = process.env): void {
  if (dbFile === ':memory:' || env.BACKUP_DISABLED === '1') return;
  const dir = env.BACKUP_DIR ?? join(dirname(dbFile), 'backups');
  const keep = Number(env.BACKUP_KEEP_DAYS ?? 14) || 14;
  let offsite: OffsiteConfig | null = null;
  try { offsite = offsiteConfigFromEnv(env); st.offsite = offsite ? 'configured' : 'not_configured'; } catch (e) { st.offsite = 'misconfigured'; console.error('backup offsite config:', (e as Error).message); }
  Object.assign(st, { enabled: true, dir, keep });
  const tick = () => { void runBackupTick(dbFile, dir, keep, offsite); };
  setTimeout(tick, 60_000).unref(); // ishga tushgandan 1 daqiqa keyin
  setInterval(tick, 3_600_000).unref(); // har soat tekshiradi, kuniga bir marta oladi
}
