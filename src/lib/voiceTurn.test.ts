import assert from 'node:assert/strict';
import { nextFloor, shouldSend, speechThreshold } from './voiceTurn';

// Jim xonada: past chegaradan yuqori ovoz — nutq; shovqinli xonada chegara ko'tariladi
assert.equal(speechThreshold(0.002), 0.014);
assert.ok(Math.abs(speechThreshold(0.02) - 0.064) < 1e-9);
// Gapni bo'lish uchun chegara ancha baland (karnaydagi ustoz ovozi o'quvchi deb olinmasin)
assert.ok(speechThreshold(0.01, true) > speechThreshold(0.01) * 1.5);
// Shovqin darajasi faqat jim paytlarda yangilanadi: baland nutq floor'ni ko'tarmaydi
assert.equal(nextFloor(0.01, 0.2), 0.01);
let f = 0.01; for (let i = 0; i < 200; i++) f = nextFloor(f, 0.004);
assert.ok(f < 0.0045 && f > 0.0039, `floor moslashadi: ${f}`);
// Yozuvni yuborish qarori: gap aniqlansa — yuboriladi; aniqlanmasa ham o'quvchi "Tugatdim" bosgan va mikrofon ovoz olgan bo'lsa yuboriladi
const base = { cancelled: false, speechAt: 0, speechMs: 0, manual: false, recMs: 5000, peak: 0.02 };
assert.equal(shouldSend({ ...base, speechAt: 100, speechMs: 1500 }), true);
assert.equal(shouldSend({ ...base, speechAt: 100, speechMs: 300 }), false, 'yo‘tal/shovqin — yuborilmaydi');
assert.equal(shouldSend({ ...base, manual: true }), true, 'past ovozli telefon: gap sezilmadi, lekin "Tugatdim" bosildi');
assert.equal(shouldSend({ ...base, manual: true, peak: 0.001 }), false, 'mikrofon butunlay jim — yuborilmaydi');
assert.equal(shouldSend({ ...base, manual: true, recMs: 400 }), false, 'tasodifiy bosish — yuborilmaydi');
assert.equal(shouldSend({ ...base, manual: false }), false, 'avtomatik kutish tugadi, gap yo‘q — yuborilmaydi');
assert.equal(shouldSend({ ...base, manual: true, cancelled: true }), false);
console.log('voiceTurn: OK');
