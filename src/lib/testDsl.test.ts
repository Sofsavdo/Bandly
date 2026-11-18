import assert from 'node:assert/strict';
import { parseTest, TEST_TEMPLATE, validateTest } from './testDsl';
import { readingTests } from '../content/readingTests';
import { listeningTests } from '../content/listeningTests';

const r = parseTest(TEST_TEMPLATE, 'st-demo');
assert.deepEqual(r.errors, [], JSON.stringify(r.errors));
assert.equal(r.test!.kind, 'reading'); assert.equal(r.test!.questions.length, 8); assert.equal(r.test!.groups.length, 3);
const q5 = r.test!.questions[4]!; assert.equal(q5.type, 'mcq'); assert.equal(q5.type === 'mcq' && q5.answer, 1);
assert.equal(r.test!.questions[2]!.type === 'tfng' && r.test!.questions[2]!.answer, 'Not Given');
// xatolar qator raqami bilan
const bad = parseTest(TEST_TEMPLATE.replace('| *One hour |', '| One hour |').replace('F The café', 'X The café'), 'st-x');
assert.ok(bad.errors.some((e) => /\*/.test(e.message)) && bad.errors.some((e) => /T, M, H yoki F/.test(e.message)) && bad.errors.every((e) => e.line > 0));
// mazmun tekshiruvi: matnda yo'q javob, kam savol
const wrong = parseTest(TEST_TEMPLATE.replace('| students | @', '| teachers | @'), 'st-y');
assert.ok(wrong.errors.some((e) => /matnda yo‘q/.test(e.message)));
assert.ok(parseTest(TEST_TEMPLATE.split('## Questions 7')[0]!.replace('Questions 5–6', 'x'), 'st-z').errors.some((e) => /8 ta savol/.test(e.message)));
// listening
const lis = parseTest(`Title: Listening: At the gym\nLevel: B1\nMinutes: 8\nKind: listening\nNames: A=Receptionist; B=Ali\n\n[SCRIPT]\nA: Good morning, how can I help?\nB: I want to join the gym.\nA: It costs forty dollars a month.\nB: Great, and when do you open?\nA: We open at six thirty.\nB: Thanks.\n\n[QUESTIONS]\n## Questions 1–8: Complete the notes.\n${Array.from({ length: 8 }, () => 'F Price: ______ dollars | forty; 40').join('\n')}\n`, 'st-l');
assert.deepEqual(lis.errors, []); assert.equal(lis.test!.kind, 'listening'); assert.equal(lis.test!.names.B, 'Ali');
// barcha mavjud testlar ham shu tekshiruvdan o'tadi (qoidalar izchil)
for (const t of readingTests) assert.deepEqual(validateTest({ ...t, kind: 'reading' }), [], t.id);
for (const t of listeningTests) assert.deepEqual(validateTest({ ...t, kind: 'listening' }), [], t.id);
console.log('testDsl.test: OK');
