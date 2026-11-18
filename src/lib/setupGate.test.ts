import assert from 'node:assert/strict';
import { needsLogin, setupRoute } from './setupGate';

const st = (account: boolean, onboarded: boolean, level: string | null) => ({ account, onboarded, level });
assert.equal(setupRoute('#/', st(false, false, null)), null, 'mehmon — yo‘naltirilmaydi');
assert.equal(setupRoute('#/', st(true, false, null)), '#/start', 'kirdi — avval shaxsiy reja');
assert.equal(setupRoute('#/learn', st(true, true, null)), '#/placement', 'reja bor — daraja testi');
assert.equal(setupRoute('#/coach', st(true, true, 'B1')), null, 'hammasi bor — erkin');
assert.equal(setupRoute('#/start', st(true, false, null)), null, 'savolnomaning o‘zida aylanib qolmaydi');
assert.equal(setupRoute('#/placement', st(true, true, null)), null);
assert.equal(setupRoute('#/pricing', st(true, false, null)), null, 'to‘lov sahifasi ochiq');
// Mehmon: bepul Mock Arena ochiq, qolgani hisob bilan
for (const h of ['#/', '#/welcome', '#/start', '#/pricing', '#/mocks', '#/mocks/full', '#/mocks/reading', '#/mocks/listening', '#/mocks/reading/reading-11', '#/mocks/listening/listening-3'])
  assert.equal(needsLogin(h, false), false, `mehmon ochadi: ${h}`);
for (const h of ['#/learn', '#/learn/a1-u1-l1', '#/profile', '#/coach', '#/exam', '#/exam/writing', '#/results', '#/games', '#/mocks/writing', '#/mocksx', '#/duel/ABCD'])
  assert.equal(needsLogin(h, false), true, `mehmonga yopiq: ${h}`);
assert.equal(needsLogin('#/learn', true), false, 'kirgan o‘quvchiga ochiq');
console.log('setupGate: OK');
