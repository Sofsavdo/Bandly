import assert from 'node:assert/strict';
import { setupRoute } from './setupGate';

const st = (account: boolean, onboarded: boolean, level: string | null) => ({ account, onboarded, level });
assert.equal(setupRoute('#/', st(false, false, null)), null, 'mehmon — yo‘naltirilmaydi');
assert.equal(setupRoute('#/', st(true, false, null)), '#/start', 'kirdi — avval shaxsiy reja');
assert.equal(setupRoute('#/learn', st(true, true, null)), '#/placement', 'reja bor — daraja testi');
assert.equal(setupRoute('#/coach', st(true, true, 'B1')), null, 'hammasi bor — erkin');
assert.equal(setupRoute('#/start', st(true, false, null)), null, 'savolnomaning o‘zida aylanib qolmaydi');
assert.equal(setupRoute('#/placement', st(true, true, null)), null);
assert.equal(setupRoute('#/pricing', st(true, false, null)), null, 'to‘lov sahifasi ochiq');
console.log('setupGate: OK');
