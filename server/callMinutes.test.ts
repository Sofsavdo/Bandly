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
console.log('callMinutes: OK');
