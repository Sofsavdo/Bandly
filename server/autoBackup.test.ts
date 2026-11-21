import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { checkSnapshot } from '../scripts/backup/lib';
import { backupIfDue, backupStatus, runBackupTick, startAutoBackup } from './autoBackup';

const dir = mkdtempSync(join(tmpdir(), 'bandly-ab-'));
const src = join(dir, 'data.sqlite');
const db = new DatabaseSync(src); db.exec('CREATE TABLE t (x INTEGER); INSERT INTO t VALUES (1), (2);');
const out = join(dir, 'backups');
const t0 = new Date(Date.UTC(2026, 10, 18, 10));
const f1 = backupIfDue(src, out, 14, t0);
assert.ok(f1 && checkSnapshot(f1).ok, 'birinchi nusxa olinadi va yaroqli');
assert.equal(checkSnapshot(f1!).counts.t, 2, 'nusxada ma’lumot bor (tiklash mumkin)');
assert.equal(backupIfDue(src, out, 14, new Date(t0.getTime() + 3_600_000)), null, 'kuniga bir marta');
db.exec('INSERT INTO t VALUES (3)'); // server ishlayotganda yozuv
const f2 = backupIfDue(src, out, 14, new Date(t0.getTime() + 25 * 3_600_000));
assert.ok(f2); assert.equal(checkSnapshot(f2!).counts.t, 3);
// 20 kundan keyin: eskilari o'chiriladi, oxirgisi qoladi
backupIfDue(src, out, 14, new Date(t0.getTime() + 20 * 86_400_000));
const left = readdirSync(out).filter((f) => f.endsWith('.sqlite'));
assert.equal(left.length, 1, '14 kundan eski nusxalar o‘chirildi');
assert.equal((db.prepare('SELECT COUNT(*) AS n FROM t').get() as { n: number }).n, 3, 'asosiy bazaga tegilmadi');
// Holat: tashqi ombor sozlanmagan bo'lsa "configured" ko'rsatilmaydi; tashqi yuklash xatosi va mahalliy xato ko'rinadi
{
  const d2 = mkdtempSync(join(tmpdir(), 'bandly-st-')); const s2 = join(d2, 'data.sqlite');
  const db2 = new DatabaseSync(s2); db2.exec('CREATE TABLE t (x INTEGER); INSERT INTO t VALUES (1);'); db2.close();
  const err = console.error, log = console.log; console.error = () => undefined; console.log = () => undefined;
  startAutoBackup(s2, { BACKUP_DIR: join(d2, 'b') } as never); // timerlar unref — testni ushlab turmaydi
  let s = backupStatus();
  assert.equal(s.enabled, true); assert.equal(s.offsite, 'not_configured'); assert.equal(s.stale, true, 'hali nusxa yo‘q — eskirgan');
  startAutoBackup(s2, { BACKUP_DIR: join(d2, 'b'), BACKUP_S3_BUCKET: 'x' } as never);
  assert.equal(backupStatus().offsite, 'misconfigured', 'yarim sozlangan — xato sifatida');
  // muvaffaqiyatli mahalliy nusxa + tashqi yuklash xatosi
  const off = { bucket: 'b', endpoint: 'https://s3.test', region: 'auto', accessKeyId: 'k', secretAccessKey: 's', prefix: 'p/' } as never;
  await runBackupTick(s2, join(d2, 'b'), 14, off, async () => { throw new Error('403 SignatureDoesNotMatch'); }, new Date());
  s = backupStatus();
  assert.equal(s.localCount, 1); assert.equal(s.stale, false); assert.match(s.lastOffsiteError!, /403/); assert.equal(s.lastOffsiteAt, null);
  assert.ok(!JSON.stringify(s).includes('secret') && !JSON.stringify(s).includes('https://s3.test'), 'kalit/manzil qaytarilmaydi');
  // tashqi yuklash tiklandi
  await runBackupTick(s2, join(d2, 'b'), 14, off, async () => ({ key: 'p/x', bytes: 10 }), new Date(Date.now() + 25 * 3_600_000));
  assert.equal(backupStatus().lastOffsiteError, null); assert.ok(backupStatus().lastOffsiteAt);
  // buzuq baza — mahalliy xato holatga yoziladi
  const bad = join(d2, 'bad.sqlite'); (await import('node:fs')).writeFileSync(bad, 'not a database');
  await runBackupTick(bad, join(d2, 'c'), 14, null, undefined, new Date());
  assert.ok(backupStatus().lastError, 'yaroqsiz baza — xato ko‘rinadi');
  // tiklash: nusxadan ma'lumot o'qiladi
  const file = readdirSync(join(d2, 'b')).find((f) => f.endsWith('.sqlite'))!;
  const restored = new DatabaseSync(join(d2, 'b', file)); assert.equal((restored.prepare('SELECT COUNT(*) AS n FROM t').get() as { n: number }).n, 1); restored.close();
  console.error = err; console.log = log;
  rmSync(d2, { recursive: true, force: true });
}
db.close(); rmSync(dir, { recursive: true, force: true });
console.log('autoBackup.test: OK');
