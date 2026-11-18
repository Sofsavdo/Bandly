import assert from 'node:assert/strict';
import { ApiError, createDb, join, byToken } from './db';
import { addBand, bandStats, deleteBand, listBands, roundOverall, summary } from './bands';

const db = createDb();
const a = byToken(db, join(db, 'Ali').token).id;
const b = byToken(db, join(db, 'Vali').token).id;
const D = 86_400_000, t0 = Date.UTC(2026, 0, 1);

assert.equal(roundOverall([6, 6.5, 5.5, 6]), 6);
assert.equal(roundOverall([6, 6.5, 6.5, 6]), 6.5, '6.25 → 6.5');
assert.equal(roundOverall([6.5, 7, 7, 7]), 7, '6.875 → 7');

// Noto'g'ri qiymatlar rad etiladi
assert.throws(() => addBand(db, a, { listening: 6 }, t0), (e: ApiError) => e.status === 400, 'mock: kamida 2 ko‘nikma');
assert.throws(() => addBand(db, a, { listening: 6.3, reading: 6 }, t0), (e: ApiError) => e.status === 400, '0.5 qadam');
assert.throws(() => addBand(db, a, { source: 'official', listening: 6, reading: 6, writing: 6 }, t0), (e: ApiError) => e.status === 400, 'rasmiy: 4 ko‘nikma');
assert.throws(() => addBand(db, a, { source: 'official', listening: 6, reading: 6, writing: 6, speaking: 6, testDate: '2030-01-01' }, t0), (e: ApiError) => e.status === 400, 'kelajakdagi sana yo‘q');

// Ali: boshlang'ich 5.5, 10 kundan keyin 6 (hisoblanmaydi — 14 kun o'tmagan), 30 kundan keyin 6.5
addBand(db, a, { listening: 5.5, reading: 5.5, writing: 5, speaking: 6, key: 'm1', at: t0 }, t0);
addBand(db, a, { listening: 6, reading: 6, key: 'm2', at: t0 + 10 * D }, t0 + 10 * D);
const s1 = summary(listBands(db, a), t0 + 10 * D);
assert.equal(s1.baseline!.overall, 5.5); assert.equal(s1.gain, 0.5); assert.equal(s1.nextMockAt, t0 + 24 * D, 'keyingi mock — oxirgisidan 14 kun keyin');
assert.equal(bandStats(db).measured, 0, '14 kundan kam — o‘lchanmagan');
addBand(db, a, { listening: 6.5, reading: 6.5, writing: 6, speaking: 6.5, key: 'm3', at: t0 + 30 * D }, t0 + 30 * D);
// bir xil key qayta yuborilsa — yangilanadi, ikki marta yozilmaydi
addBand(db, a, { listening: 7, reading: 6.5, writing: 6, speaking: 6.5, key: 'm3', at: t0 + 30 * D }, t0 + 30 * D);
assert.equal(listBands(db, a).length, 3);
assert.equal(listBands(db, a)[2]!.overall, 6.5);

// Vali: boshlang'ich 6, 20 kundan keyin 6, keyin rasmiy 7
addBand(db, b, { listening: 6, reading: 6, writing: 6, speaking: 6, at: t0 }, t0);
addBand(db, b, { listening: 6, reading: 6, writing: 6, speaking: 6, at: t0 + 20 * D }, t0 + 20 * D);
const off = addBand(db, b, { source: 'official', listening: 7, reading: 7, writing: 6.5, speaking: 7, testDate: '2026-02-15' }, t0 + 46 * D);
assert.equal(off.overall, 7); assert.equal(summary(listBands(db, b)).official!.overall, 7);
addBand(db, b, { source: 'official', listening: 7, reading: 7, writing: 6.5, speaking: 7, testDate: '2026-02-15' }, t0 + 47 * D);
assert.equal(listBands(db, b).filter((r) => r.source === 'official').length, 1, 'bir sana — bitta rasmiy natija');

const st = bandStats(db);
assert.equal(st.learners, 2); assert.equal(st.withBaseline, 2); assert.equal(st.measured, 2);
assert.equal(st.avgGain, 0.5, '(1 + 0) / 2'); assert.equal(st.shareOne, 50); assert.equal(st.shareHalf, 50);
assert.equal(st.officials, 1); assert.equal(st.officialVsBaseline, 1);

// O'chirish faqat o'z yozuvini
deleteBand(db, b, listBands(db, a)[0]!.id);
assert.equal(listBands(db, a).length, 3, 'boshqaning yozuvi o‘chmaydi');
deleteBand(db, b, off.id);
assert.equal(listBands(db, b).length, 2);
console.log('bands.test: OK');
