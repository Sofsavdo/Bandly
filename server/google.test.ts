// Google ID token tekshiruvi: haqiqiy RS256 imzo (vaqtinchalik kalit juftligi) + soxta JWKS serveri. Tarmoq va Google hisobi ishlatilmaydi.
import assert from 'node:assert/strict';
import { createSign, generateKeyPairSync } from 'node:crypto';
import { GoogleAuthError, resetGoogleKeyCache, verifyGoogleIdToken } from './google';

const CLIENT = '1234567890-abc.apps.googleusercontent.com';
const NOW = 1_800_000_000_000, S = NOW / 1000;
const mk = () => { const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 }); return { privateKey, jwk: { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' } }; };
const A = mk(), B = mk();
const b64u = (x: Buffer | string) => Buffer.from(x).toString('base64url');
function token(claims: Record<string, unknown>, key = A.privateKey, header: Record<string, unknown> = { alg: 'RS256', kid: 'k1', typ: 'JWT' }, tamper?: (sig: string) => string) {
  const body = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(claims))}`;
  const sig = createSign('RSA-SHA256').update(body).sign(key).toString('base64url');
  return `${body}.${tamper ? tamper(sig) : sig}`;
}
const good = { iss: 'https://accounts.google.com', aud: CLIENT, sub: '109876543210987654321', exp: S + 3600, iat: S - 10, email: 'a@b.c', email_verified: true, given_name: 'Gulnora', name: 'Gulnora Karimova' };
let fetches = 0; let keys = [A.jwk]; let fail = false;
const fakeFetch = (async () => { fetches++; if (fail) return { ok: false, status: 500, headers: new Headers(), json: async () => ({}) }; return { ok: true, status: 200, headers: new Headers({ 'cache-control': 'public, max-age=3600' }), json: async () => ({ keys }) }; }) as unknown as typeof fetch;
const rejects = async (t: unknown, re: RegExp, label: string, c = CLIENT) => assert.rejects(verifyGoogleIdToken(t, c, fakeFetch, NOW), (e: unknown) => e instanceof GoogleAuthError && re.test(e.message), label);

// To'g'ri token
const p = await verifyGoogleIdToken(token(good), CLIENT, fakeFetch, NOW);
assert.deepEqual(p, { sub: good.sub, name: 'Gulnora' });
assert.equal((await verifyGoogleIdToken(token({ ...good, iss: 'accounts.google.com' }), CLIENT, fakeFetch, NOW)).sub, good.sub, 'ikkala emitent shakli');
assert.equal((await verifyGoogleIdToken(token({ ...good, given_name: undefined }), CLIENT, fakeFetch, NOW)).name, 'Gulnora Karimova');
assert.equal(fetches, 1, 'kalitlar keshlanadi (har kirishda Google so‘ralmaydi)');

// Rad etiladiganlar
await rejects(token({ ...good, aud: 'boshqa-sayt.apps.googleusercontent.com' }), /identifikatori mos emas/, 'boshqa saytga berilgan token');
await rejects(token({ ...good, iss: 'https://evil.example' }), /emitenti/, 'emitent');
await rejects(token({ ...good, exp: S - 600 }), /eskirgan/, 'muddati o‘tgan');
await rejects(token({ ...good, iat: S + 3600 }), /vaqti noto‘g‘ri/, 'kelajakda berilgan');
await rejects(token({ ...good, email_verified: false }), /tasdiqlanmagan/, 'pochta tasdiqlanmagan');
await rejects(token({ ...good, email_verified: 'true' }), /tasdiqlanmagan/, 'email_verified qat’iy true');
await rejects(token({ ...good, sub: '' }), /identifikatori yo‘q/, 'sub yo‘q');
await rejects(token({ ...good, sub: 'abc' }), /identifikatori yo‘q/, 'sub shakli');
await rejects(token(good, B.privateKey), /imzosi noto‘g‘ri/, 'boshqa kalit bilan imzolangan');
await rejects(token(good, A.privateKey, undefined, (s) => s.slice(0, -4) + 'AAAA'), /imzosi noto‘g‘ri/, 'imzo buzilgan');
const parts = token(good).split('.');
await rejects(`${parts[0]}.${b64u(JSON.stringify({ ...good, sub: '999999999999' }))}.${parts[2]}`, /imzosi noto‘g‘ri/, 'ma’lumot o‘zgartirilgan, imzo eski');
await rejects(`${b64u(JSON.stringify({ alg: 'none', kid: 'k1' }))}.${b64u(JSON.stringify(good))}.`, /imzo turi/, 'alg=none hujumi');
await rejects(token(good, A.privateKey, { alg: 'HS256', kid: 'k1' }), /imzo turi/, 'alg=HS256 (ochiq kalit sir sifatida) hujumi');
await rejects(token(good, A.privateKey, { alg: 'RS256' }), /imzo turi/, 'kid yo‘q');
for (const bad of [undefined, null, 5, '', 'a.b', 'a.b.c.d', 'x'.repeat(5000), '###.###.###']) await rejects(bad, /noto‘g‘ri/, `buzuq: ${String(bad).slice(0, 12)}`);

// Kalitlar almashgan: noma'lum kid → bir marta yangilanadi
keys = [B.jwk && { ...B.jwk, kid: 'k2' }, A.jwk] as typeof keys; const before = fetches;
assert.equal((await verifyGoogleIdToken(token(good, B.privateKey, { alg: 'RS256', kid: 'k2' }), CLIENT, fakeFetch, NOW)).sub, good.sub, 'yangi kalit (rotatsiya)');
assert.equal(fetches, before + 1);
await rejects(token(good, A.privateKey, { alg: 'RS256', kid: 'yo‘q' }), /kaliti topilmadi/, 'noma’lum kid');
// Google kalitlarini olib bo'lmasa — kesh bo'sh bo'lsa rad, kesh bor bo'lsa ishlayveradi
resetGoogleKeyCache(); fail = true;
await rejects(token(good), /kalitlarini olib bo‘lmadi/, 'Google ishlamasa (kesh yo‘q)');
fail = false; await verifyGoogleIdToken(token(good), CLIENT, fakeFetch, NOW); fail = true;
assert.equal((await verifyGoogleIdToken(token({ ...good, exp: S + 4 * 3600 }), CLIENT, fakeFetch, NOW + 2 * 3600_000)).sub, good.sub, 'kesh muddati o‘tgach Google ishlamasa ham, eski kalit bilan davom etadi');
console.log('google.test: OK');
