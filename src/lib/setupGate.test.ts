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
// Mehmon bo'limlarni ko'radi; kirish faqat harakatda (dars, AI ustoz, test, o'yin, profil...) — login sahifasiga, qaytish manzili bilan
for (const h of ['', '#/', '#/welcome', '#/placement', '#/learn', '#/ielts', '#/exam', '#/mocks', '#/mocks/reading', '#/mocks/listening', '#/games', '#/pricing', '#/tools', '#/duel/ABCD', '#/duel/abc123']) assert.equal(authRoute(h, false), null, `mehmon ko‘radi: ${h || '(bo‘sh)'}`);
for (const h of ['#/start', '#/mocks/full', '#/learn/a1-u1-l1', '#/exam/writing', '#/exam/speaking', '#/coach', '#/profile', '#/results', '#/games/pairs', '#/duel', '#/duel/AB', '#/duel/ABCD/x', '#/certificates', '#/grammar', '#/practice', '#/mistakes', '#/league'])
  assert.equal(authRoute(h, false), `#/login?next=${encodeURIComponent(h)}`, `mehmonga yopiq: ${h}`);
assert.equal(authRoute('#/login?next=%23%2Fmocks', false), null, 'login sahifasining o‘zi ochiq');
assert.equal(authRoute('#/login?next=%23%2Fmocks%2Freading%2Freading-5', true), '#/mocks/reading/reading-5', 'kirgandan keyin so‘ralgan sahifa');
assert.equal(authRoute('#/login', true), '#/', 'qaytish manzili yo‘q — bosh sahifa');
assert.equal(nextOf('#/login?next=https%3A%2F%2Fevil.example'), '#/', 'tashqi manzilga yo‘naltirilmaydi');
assert.equal(nextOf('#/login?next=%23%2Flogin%3Fnext%3D%23%2F'), '#/', 'login → login aylanmasi yo‘q');
assert.equal(nextOf('#/login?next=%23%2Fpartners%3Felchi%3Dab3cd5e'), '#/partners?elchi=ab3cd5e', 'elchi havolasi kirishdan keyin saqlanadi');
assert.equal(authRoute('#/learn', true), null, 'kirgan o‘quvchiga hamma sahifa ochiq');
assert.equal(needsLogin('#/mocks', false), false, 'mehmon Mock Arena ro‘yxatini ko‘radi');
// Mehmon mock: bitta Reading/Listening testini topshira oladi (baholash ro'yxatdan o'tgandan keyin); boshqa "harakat"lar yopiq
for (const h of ['#/mocks/reading/reading-11', '#/exam/listening/listening-3', '#/mocks/reading/reading-5?x=1'])
  assert.equal(authRoute(h, false), null, `mehmon mock testi ochiq: ${h}`);
for (const h of ['#/mocks/full', '#/mocks/writing/x', '#/mocks/reading/a/b', '#/mocks/reading/', '#/exam/speaking'])
  assert.notEqual(authRoute(h, false), null, `yopiq qoladi: ${h}`);
// Ro'yxatdan o'tgach mehmon mock natijasi ochilguncha savolnomaga yo'naltirilmaydi; keyin odatdagidek
assert.equal(setupRoute('#/mocks/reading/reading-5', { account: true, onboarded: false, level: null, guestMock: true }), null, 'mehmon mock sahifasi — natija ko‘rilguncha savolnomaga yo‘naltirilmaydi');
assert.equal(setupRoute('#/mocks/reading/reading-5', { account: true, onboarded: false, level: null, guestMock: false }), '#/start', 'mehmon urinishi yo‘q — odatiy tartib');
assert.equal(setupRoute('#/learn/ie-rs-l1', { account: true, onboarded: false, level: null, direct: true }), null, 'reja havolasi bevosita ochiladi');
assert.equal(setupRoute('#/learn/ie-rs-l1', { account: true, onboarded: false, level: null, direct: false }), '#/start', 'boshqa sahifalar uchun qoida o‘zgarmadi');
console.log('setupGate: OK');
// 2026-11-24: daraja bor bo'lsa — savolnoma bo'lmasa ham qayta yo'naltirilmaydi; hisob progressi o'qilmagan bo'lsa — kutiladi
assert.equal(setupRoute('#/learn', { account: true, onboarded: false, level: 'B1', verified: true }), null, 'daraja bor — savolnoma qayta so‘ralmaydi');
assert.equal(setupRoute('#/learn', { account: true, onboarded: false, level: null, verified: false }), null, 'progress hali yuklanmagan — yo‘naltirilmaydi');
assert.equal(setupRoute('#/learn', { account: true, onboarded: false, level: null, verified: true }), '#/start', 'yangi o‘quvchi — savolnoma');
assert.equal(setupRoute('#/learn', { account: true, onboarded: true, level: null, verified: true }), '#/placement', 'reja bor, daraja yo‘q — daraja testi');
