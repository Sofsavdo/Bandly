import assert from 'node:assert/strict';
import { authRoute, needsLogin, nextOf, setupRoute } from './setupGate';

const st = (account: boolean, onboarded: boolean, level: string | null) => ({ account, onboarded, level });
assert.equal(setupRoute('#/', st(false, false, null)), null, 'mehmon — yo‘naltirilmaydi');
assert.equal(setupRoute('#/', st(true, false, null)), '#/start', 'kirdi — avval shaxsiy reja');
assert.equal(setupRoute('#/learn', st(true, true, null)), '#/placement', 'reja bor — daraja testi');
assert.equal(setupRoute('#/coach', st(true, true, 'B1')), null, 'hammasi bor — erkin');
assert.equal(setupRoute('#/start', st(true, false, null)), null, 'savolnomaning o‘zida aylanib qolmaydi');
assert.equal(setupRoute('#/placement', st(true, true, null)), null);
assert.equal(setupRoute('#/pricing', st(true, false, null)), null, 'to‘lov sahifasi ochiq');
// Mehmon bosh sahifa, daraja testi va narxlarni ko'radi; qolgan hamma ichki sahifa — login sahifasiga, qaytish manzili bilan
for (const h of ['', '#/', '#/welcome', '#/placement', '#/pricing', '#/duel/ABCD', '#/duel/abc123']) assert.equal(authRoute(h, false), null, `mehmon ochadi: ${h || '(bo‘sh)'}`);
for (const h of ['#/start', '#/mocks', '#/mocks/full', '#/mocks/reading', '#/mocks/reading/reading-11', '#/learn', '#/learn/a1-u1-l1', '#/ielts', '#/exam', '#/exam/writing', '#/coach', '#/profile', '#/results', '#/games', '#/duel', '#/duel/AB', '#/duel/ABCD/x', '#/certificates', '#/grammar'])
  assert.equal(authRoute(h, false), `#/login?next=${encodeURIComponent(h)}`, `mehmonga yopiq: ${h}`);
assert.equal(authRoute('#/login?next=%23%2Fmocks', false), null, 'login sahifasining o‘zi ochiq');
assert.equal(authRoute('#/login?next=%23%2Fmocks%2Freading%2Freading-5', true), '#/mocks/reading/reading-5', 'kirgandan keyin so‘ralgan sahifa');
assert.equal(authRoute('#/login', true), '#/', 'qaytish manzili yo‘q — bosh sahifa');
assert.equal(nextOf('#/login?next=https%3A%2F%2Fevil.example'), '#/', 'tashqi manzilga yo‘naltirilmaydi');
assert.equal(nextOf('#/login?next=%23%2Flogin%3Fnext%3D%23%2F'), '#/', 'login → login aylanmasi yo‘q');
assert.equal(authRoute('#/learn', true), null, 'kirgan o‘quvchiga hamma sahifa ochiq');
assert.equal(needsLogin('#/mocks', false), true, 'mehmonga Mock Arena yopiq');
console.log('setupGate: OK');
