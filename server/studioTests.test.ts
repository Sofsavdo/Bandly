import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { ensureStudioTestsTable, listStudioTests, publicStudioTests, publishedStudioTests, saveStudioTest, setStudioTestStatus } from './studioTests';
import { TEST_TEMPLATE } from '../src/lib/testDsl';
import { gradeMock } from './mockGrade';

const db = new DatabaseSync(':memory:');
ensureStudioTestsTable(db);
const bad = saveStudioTest(db, null, 'Title: x', 'metodist', 1_700_000_000_000);
assert.ok(bad.errors.length > 0 && /^st-/.test(bad.id), 'xatoli qoralama saqlanadi');
assert.throws(() => setStudioTestStatus(db, bad.id, 'publish', 'metodist'), /xatolar/);
const ok = saveStudioTest(db, null, TEST_TEMPLATE, 'metodist', 1_700_000_000_500);
assert.deepEqual(ok.errors, []);
assert.equal(publishedStudioTests(db).length, 0, 'qoralama o‘quvchiga ko‘rinmaydi');
setStudioTestStatus(db, ok.id, 'publish', 'metodist');
const pub = publicStudioTests(db);
assert.equal(pub.reading.length, 1); assert.equal(pub.listening.length, 0);
assert.ok(!JSON.stringify(pub).includes('"answer"') && !JSON.stringify(pub).includes('"answers"') && !JSON.stringify(pub).includes('evidence'), 'javob kalitlari chiqmaydi');
const g = gradeMock('reading', ok.id, { 1: 'True', 5: 1, 7: '20' }, publishedStudioTests(db));
assert.equal(g.correct, 3); assert.equal(g.total, 8);
// tahrirlash: e'lon qilingan versiya qayta e'longacha o'zgarmaydi
saveStudioTest(db, ok.id, TEST_TEMPLATE.replace('A New Library', 'A Newer Library'), 'metodist');
assert.ok(listStudioTests(db).find((t) => t.id === ok.id)!.dirty);
assert.ok(JSON.stringify(publicStudioTests(db)).includes('A New Library'));
setStudioTestStatus(db, ok.id, 'archive', 'metodist');
assert.equal(publicStudioTests(db).reading.length, 0, 'arxiv — o‘quvchidan yashirin');
assert.throws(() => saveStudioTest(db, 'st-nope00', TEST_TEMPLATE, 'm'), /topilmadi/);
console.log('studioTests.test: OK');
