import assert from 'node:assert/strict';
import { examLadder, type LadderTest } from './examLadder';

const T = (id: string, level: LadderTest['level'], full = false): LadderTest => ({ id, title: id, level, full });
const tests = [T('a1', 'A2'), T('a2', 'A2'), T('a3', 'A2'), T('b1', 'B1'), T('b2', 'B1'), T('c1', 'B2'), T('c2', 'B2'), T('d1', 'C1'), T('full1', 'C1', true), { ...T('cefr', 'B2'), exam: 'cefr' as const }];
const r = (title: string, correct: number, total = 10) => ({ title, correct, total });

// A1 o'quvchi — A2 pog'onasidan boshlaydi (A1 testlar yo'q), birinchi yechilmagan test tavsiya qilinadi
let l = examLadder(tests, [], 'A1');
assert.equal(l.working, 'A2'); assert.equal(l.next!.id, 'a1'); assert.equal(l.passed, 0); assert.equal(l.need, 2); assert.equal(l.fullReady, false);
assert.ok(l.pool.every((t) => t.level === 'A2' && !t.full), 'pog‘onada faqat o‘z darajasidagi mini testlar');

// 1 ta o'tildi — hali A2
l = examLadder(tests, [r('a1', 8)], 'A2');
assert.equal(l.working, 'A2'); assert.equal(l.passed, 1); assert.equal(l.next!.id, 'a2');
// 2 ta ≥70% — B1 ochiladi
l = examLadder(tests, [r('a2', 7), r('a1', 8)], 'A2');
assert.equal(l.working, 'B1'); assert.ok(l.climbed); assert.equal(l.next!.id, 'b1');
// 69% hisoblanmaydi
assert.equal(examLadder(tests, [r('a2', 6.9), r('a1', 8)], 'A2').working, 'A2');
// eng yaxshi natija hisoblanadi (avval yomon, keyin yaxshi)
assert.equal(examLadder(tests, [r('a2', 9), r('a2', 3), r('a1', 8)], 'A2').working, 'B1');

// B1 da qiynalyapti (oxirgi 2 urinish < 40%) — pastroqdan boshlash tavsiyasi
l = examLadder(tests, [r('b2', 2), r('b1', 3), r('a2', 8), r('a1', 9)], 'A2');
assert.equal(l.working, 'B1'); assert.equal(l.struggling, true);
// A2 da qiynalish — undan pastga yo'q, tavsiya yo'q
assert.equal(examLadder(tests, [r('a2', 1), r('a1', 2)], 'A2').struggling, false);

// Hammasi yechilgan, lekin hali o'tilmagan — eng zaif test qaytadan tavsiya qilinadi
l = examLadder(tests, [r('b2', 6), r('b1', 5), r('a2', 8), r('a1', 9)], 'A2');
assert.equal(l.next!.id, 'b1');

// C1 pog'onasi: mini testlardan keyin to'liq mock tavsiya; to'liq imtihonga tayyor
l = examLadder(tests, [r('d1', 9)], 'C1');
assert.equal(l.working, 'C1'); assert.equal(l.fullReady, true); assert.equal(l.next!.id, 'full1');
// B2 dagi o'quvchi B2 pog'onasini tugatsa — C1 va to'liq imtihon
l = examLadder(tests, [r('c1', 8), r('c2', 8)], 'B2');
assert.equal(l.working, 'C1'); assert.equal(l.fullReady, true);
console.log('examLadder.test: OK');
