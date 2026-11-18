import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { MIN_ATTEMPTS, ensureMockStatsTable, mockStats, recordMockStat } from './mockStats';

const db = new DatabaseSync(':memory:');
ensureMockStatsTable(db);
recordMockStat(db, 'reading-7', '1700000000001', 5, 10);
recordMockStat(db, 'reading-7', '1700000000001', 9, 10); // bir urinish bir marta
assert.deepEqual(mockStats(db, 'reading-7', 5), { count: 1 }, 'kam urinish — solishtirish ko‘rsatilmaydi');
recordMockStat(db, 'bad id!', '1700000000002', 5, 10); recordMockStat(db, 'reading-7', 'x', 5, 10); recordMockStat(db, 'reading-7', '1700000000003', 11, 10);
assert.equal(mockStats(db, 'reading-7', 5).count, 1, 'yaroqsiz yozuvlar rad etiladi');
for (let i = 0; i < MIN_ATTEMPTS; i++) recordMockStat(db, 'reading-7', `17000000001${String(i).padStart(2, '0')}`, i % 11, 10);
const s = mockStats(db, 'reading-7', 8);
assert.equal(s.count, MIN_ATTEMPTS + 1); assert.ok(s.avgPct! > 30 && s.avgPct! < 60); assert.ok(s.percentile! > 60 && s.percentile! < 100, `${s.percentile}`);
assert.equal(mockStats(db, 'reading-7', 0).percentile! < 10, true);
assert.deepEqual(mockStats(db, 'listening-9', 5), { count: 0 });
console.log('mockStats.test: OK');
