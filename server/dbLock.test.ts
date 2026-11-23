// Bazaga boshqa ulanish (kunlik zaxira nusxa — VACUUM INTO, yoki tekshiruv) o'qib turganida server yozuvi darhol
// "database is locked" bilan yiqilmasligi kerak: busy_timeout bilan qisqa kutib, keyin yoziladi.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join as pjoin } from 'node:path';
import { createDb, join } from './db';

const dir = mkdtempSync(pjoin(tmpdir(), 'sz-lock-'));
const file = pjoin(dir, 'l.sqlite');
try {
  const db = createDb(file);
  join(db, 'Alfaqul');
  // Boshqa jarayon o'qish tranzaksiyasini 600 ms ushlab turadi (zaxira nusxa olinayotgandek)
  const reader = spawn(process.execPath, ['-e', `
    const { DatabaseSync } = require('node:sqlite');
    const r = new DatabaseSync(${JSON.stringify(file)});
    r.exec('BEGIN'); r.prepare('SELECT COUNT(*) FROM players').get();
    process.stdout.write('locked\\n');
    setTimeout(() => { r.exec('COMMIT'); r.close(); }, 600);
  `], { stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise<void>((res) => reader.stdout.once('data', () => res()));
  const t0 = Date.now();
  assert.doesNotThrow(() => join(db, 'Zetabek'), 'o‘qish qulfi paytida yozuv kutadi, yiqilmaydi');
  assert.ok(Date.now() - t0 >= 100, 'haqiqatan qulf bor edi va kutildi');
  await new Promise((res) => reader.once('exit', res));
  assert.equal((db.prepare('SELECT COUNT(*) AS n FROM players').get() as { n: number }).n, 2);
  db.close();
  console.log('dbLock.test: OK');
} finally { rmSync(dir, { recursive: true, force: true }); }
