import assert from 'node:assert/strict';
import { BOT_LOGIN_MAX, BOT_LOGIN_TTL, BotLogins } from './botLogin';

const T0 = 1_800_000_000_000;
const b = new BotLogins();
const s = b.start(T0)!;
assert.match(s.code, /^[a-f0-9]{32}$/); assert.match(s.poll, /^[a-f0-9]{32}$/);
assert.notEqual(s.code, s.poll, 'havoladagi kod so‘rash kaliti emas');
assert.equal(b.poll(s.poll, T0 + 1000), 'pending');
// Havolani ko'rgan begona odam (kod bilan) tokenni so'rab ololmaydi
assert.equal(b.poll(s.code, T0 + 1000), 'gone');
let issued = 0;
const issue = () => { issued++; return { token: 'tok-1', nickname: 'Ali' }; };
assert.equal(b.confirm(s.code, issue, T0 + 2000), true);
assert.equal(b.confirm(s.code, issue, T0 + 2500), false, 'ikkinchi tasdiq yangi sessiya ochmaydi');
assert.equal(issued, 1);
assert.equal(b.poll(s.code, T0 + 3000), 'gone', 'tasdiqdan keyin ham kod bilan token berilmaydi');
assert.deepEqual(b.poll(s.poll, T0 + 3000), { token: 'tok-1', nickname: 'Ali' });
assert.equal(b.poll(s.poll, T0 + 3500), 'gone', 'token bir martalik');
// Muddat: 10 daqiqadan keyin tasdiq ham, so'rov ham ishlamaydi, sessiya ochilmaydi
const s2 = b.start(T0)!;
assert.equal(b.confirm(s2.code, issue, T0 + BOT_LOGIN_TTL + 1), false);
assert.equal(issued, 1);
assert.equal(b.poll(s2.poll, T0 + BOT_LOGIN_TTL + 1), 'gone');
assert.equal(b.confirm('f'.repeat(32), issue, T0), false, 'noma’lum kod');
// Himoya: ochiq kodlar soni cheklangan, eskilari tozalanadi
const c = new BotLogins();
for (let i = 0; i < BOT_LOGIN_MAX; i++) c.start(T0);
assert.equal(c.start(T0 + 1), null);
assert.ok(c.start(T0 + BOT_LOGIN_TTL + 1), 'eskilari tozalangach yana ochiladi');
console.log('botLogin.test: OK');
