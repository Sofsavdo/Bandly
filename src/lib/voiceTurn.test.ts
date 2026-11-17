import assert from 'node:assert/strict';
import { nextFloor, speechThreshold } from './voiceTurn';

// Jim xonada: past chegaradan yuqori ovoz — nutq; shovqinli xonada chegara ko'tariladi
assert.equal(speechThreshold(0.002), 0.018);
assert.ok(Math.abs(speechThreshold(0.02) - 0.06) < 1e-9);
// Gapni bo'lish uchun chegara ancha baland (karnaydagi ustoz ovozi o'quvchi deb olinmasin)
assert.ok(speechThreshold(0.01, true) > speechThreshold(0.01) * 1.5);
// Shovqin darajasi faqat jim paytlarda yangilanadi: baland nutq floor'ni ko'tarmaydi
assert.equal(nextFloor(0.01, 0.2), 0.01);
let f = 0.01; for (let i = 0; i < 200; i++) f = nextFloor(f, 0.004);
assert.ok(f < 0.0045 && f > 0.0039, `floor moslashadi: ${f}`);
console.log('voiceTurn: OK');
