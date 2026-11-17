import assert from 'node:assert/strict';
import { ApiError, createDb, getProgress, join, putProgress } from './db';

const db = createDb();
const a = join(db, 'Ali');
const b = join(db, 'Vali');
assert.deepEqual(getProgress(db, a.token), { data: null, rev: 0, updated_at: 0 }, 'yangi hisobda progress yo‘q');
assert.equal(putProgress(db, a.token, { 'bandly.profile.v1': '{"xp":120}' }, 0, 1000).rev, 1);
assert.equal(getProgress(db, a.token).data!['bandly.profile.v1'], '{"xp":120}');
assert.equal(getProgress(db, b.token).data, null, 'boshqa hisob ko‘rmaydi');
// Eski versiya ustidan yozib bo'lmaydi (boshqa qurilma yangilagan)
assert.throws(() => putProgress(db, a.token, { 'bandly.profile.v1': '{"xp":5}' }, 0), (e: ApiError) => e.status === 409);
assert.equal(putProgress(db, a.token, { 'bandly.profile.v1': '{"xp":130}' }, 1).rev, 2);
// Kalit va hajm tekshiruvi
assert.throws(() => putProgress(db, a.token, { 'evil': 'x' }, 2), (e: ApiError) => e.status === 400);
assert.throws(() => putProgress(db, a.token, { 'bandly.x': 5 }, 2), (e: ApiError) => e.status === 400);
assert.throws(() => putProgress(db, a.token, [], 2), (e: ApiError) => e.status === 400);
assert.throws(() => putProgress(db, a.token, { 'bandly.big': 'x'.repeat(700_000) }, 2), (e: ApiError) => e.status === 413);
assert.throws(() => getProgress(db, 'yolgon'), (e: ApiError) => e.status === 401);
console.log('progress.test: OK');
