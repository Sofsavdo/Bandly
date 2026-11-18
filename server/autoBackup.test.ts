import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { checkSnapshot } from '../scripts/backup/lib';
import { backupIfDue } from './autoBackup';

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
db.close(); rmSync(dir, { recursive: true, force: true });
console.log('autoBackup.test: OK');
