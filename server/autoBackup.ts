// Kunlik avtomatik zaxira nusxa: server ishlab turganda bazaning izchil nusxasi (VACUUM INTO, asosiy faylga yozmaydi)
// shu disk ichidagi backups/ papkasiga olinadi, tekshiriladi va 14 kundan eskilari o'chiriladi (eng yangi yaroqli nusxa doim qoladi).
// Disk butunlay yo'qolishidan himoya qilmaydi — buning uchun nusxani tashqi joyga ham ko'chirish kerak (egasining qarori).
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { checkSnapshot, prune, snapshot } from '../scripts/backup/lib';

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

export function startAutoBackup(dbFile: string, env: NodeJS.ProcessEnv = process.env): void {
  if (dbFile === ':memory:' || env.BACKUP_DISABLED === '1') return;
  const dir = env.BACKUP_DIR ?? join(dirname(dbFile), 'backups');
  const keep = Number(env.BACKUP_KEEP_DAYS ?? 14) || 14;
  const tick = () => { try { const f = backupIfDue(dbFile, dir, keep); if (f) console.log(`backup: ${f}`); } catch (e) { console.error('backup failed:', (e as Error).message); } };
  setTimeout(tick, 60_000).unref(); // ishga tushgandan 1 daqiqa keyin
  setInterval(tick, 3_600_000).unref(); // har soat tekshiradi, kuniga bir marta oladi
}
