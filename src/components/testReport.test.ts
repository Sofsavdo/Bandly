import assert from 'node:assert/strict';
import { byType, weakest } from './TestReport';

const qs = [{ id: 1, type: 'tfng' as const }, { id: 2, type: 'tfng' as const }, { id: 3, type: 'tfng' as const }, { id: 4, type: 'fill' as const }, { id: 5, type: 'fill' as const }, { id: 6, type: 'fill' as const }, { id: 7, type: 'mcq' as const }];
const g = { 1: { correct: true }, 2: { correct: false }, 3: { correct: false }, 4: { correct: true }, 5: { correct: true }, 6: { correct: true }, 7: { correct: false } } as never;
const rows = byType(qs, g);
assert.deepEqual(rows.find((r) => r.type === 'tfng'), { type: 'tfng', correct: 1, total: 3 });
assert.equal(weakest(rows)!.type, 'tfng', 'eng zaif — kamida 3 savolli, 70% dan past tur');
assert.equal(weakest(rows.filter((r) => r.type !== 'tfng')), null, '1 savolli tur hisobga olinmaydi');
console.log('testReport.test: OK');
