import assert from 'node:assert/strict';
import { tzDay, tzDayStart } from './day';

// 2026-11-17 02:00 Toshkent = 2026-11-16 21:00 UTC → Toshkent sanasi 17-noyabr
const t = Date.UTC(2026, 10, 16, 21, 0);
assert.equal(tzDay(t), '2026-11-17');
assert.equal(tzDayStart(t), Date.UTC(2026, 10, 16, 19, 0)); // 17-noyabr 00:00 Toshkent
// 23:59 Toshkent hali o'sha kun
assert.equal(tzDay(Date.UTC(2026, 10, 17, 18, 59)), '2026-11-17');
assert.equal(tzDay(Date.UTC(2026, 10, 17, 19, 0)), '2026-11-18');
console.log('day: OK');
