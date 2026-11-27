import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { addCall, callLeft, callUsed, ensureCallTable, ttsSeconds } from './callMinutes';

const db = new DatabaseSync(':memory:');
ensureCallTable(db);
const nov = Date.UTC(2026, 10, 17, 10), dec = Date.UTC(2026, 11, 2, 10);
assert.equal(callLeft(db, 1, false, nov, 3600), 0, 'obunasiz — oylik daqiqa yo‘q');
assert.equal(callLeft(db, 1, true, nov, 3600), 3600);
addCall(db, 1, 120, nov); addCall(db, 1, ttsSeconds(450), nov); addCall(db, 1, -5, nov);
assert.equal(callUsed(db, 1, nov), 150);
assert.equal(callLeft(db, 1, true, nov, 3600), 3450);
assert.equal(callUsed(db, 2, nov), 0, 'boshqa o‘quvchi alohida');
assert.equal(callLeft(db, 1, true, dec, 3600), 3600, 'yangi oy — hisob qaytadan');
addCall(db, 1, 4000, nov);
assert.equal(callLeft(db, 1, true, nov, 3600), 0, 'manfiy bo‘lmaydi');
// Premium (egasi, 2026-11-26): kuniga 30 daqiqa — har kuni yangilanadi; boshqa tariflar — oylik
{
  const { voiceLeft, premiumDailySeconds } = await import('./callMinutes');
  const { ensureLiveTable, recordLive } = await import('./live');
  const { createDb } = await import('./db');
  const { planOf } = await import('./entitle');
  const { publicLimits } = await import('./settings');
  const d2 = createDb(); ensureCallTable(d2); ensureLiveTable(d2);
  assert.equal(premiumDailySeconds(), 30 * 60, 'standart: kuniga 30 daqiqa');
  const day1 = Date.UTC(2026, 10, 26, 8), day2 = Date.UTC(2026, 10, 27, 8);
  assert.equal(voiceLeft(d2, 7, 'premium', day1), 1800);
  recordLive(d2, 7, 1700, day1);
  assert.equal(voiceLeft(d2, 7, 'premium', day1), 100, 'bugungi qoldiq');
  recordLive(d2, 7, 500, day1); assert.equal(voiceLeft(d2, 7, 'premium', day1), 0, 'manfiy bo‘lmaydi');
  assert.equal(voiceLeft(d2, 7, 'premium', day2), 1800, 'ertasi kuni yana 30 daqiqa');
  assert.equal(voiceLeft(d2, 7, null, day1), 0, 'obunasiz — 0');
  // Egasi (2026-11-27): General 60, Exam 90, All Access 120 daqiqa / oy
  assert.equal(voiceLeft(d2, 7, 'general', day1), 60 * 60, 'General — 60 daqiqa / oy');
  assert.equal(voiceLeft(d2, 7, 'exam', day1), 90 * 60, 'Exam — 90 daqiqa / oy');
  assert.equal(voiceLeft(d2, 7, 'all', day1), 120 * 60, 'All Access — 120 daqiqa / oy');
  const id = Number(d2.prepare('INSERT INTO players (token, nickname, created_at, updated_at) VALUES (?, ?, ?, ?)').run('tp', 'np', day1, day1).lastInsertRowid);
  for (const t of ['exam', 'grammar', 'mocks', 'voice']) d2.prepare('INSERT INTO subscriptions (player_id, track, until) VALUES (?, ?, ?)').run(id, t, day1 + 86_400_000);
  assert.equal(planOf(d2, id, day1), 'premium');
  const pl = publicLimits({}).plans.premium; assert.equal(pl.voiceDaily, 30); assert.equal(pl.voiceMin, 900); assert.equal(pl.writing, 60);
}
console.log('callMinutes: OK');
