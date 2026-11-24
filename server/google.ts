// Google bilan kirish (Google Identity Services): brauzer Google'dan ID token (JWT, RS256) oladi va serverga yuboradi.
// Server tokenni Google'ning ochiq kalitlari (JWKS) bilan O'ZI tekshiradi: imzo, aud (bizning GOOGLE_CLIENT_ID), iss, muddat, email_verified.
// Saqlanadigan yagona ma'lumot — Google `sub` (barqaror identifikator); email saqlanmaydi. GOOGLE_CLIENT_ID sozlanmagan bo'lsa funksiya o'chiq.
import { createPublicKey, verify, type JsonWebKey } from 'node:crypto';

export class GoogleAuthError extends Error {}
export interface GoogleProfile { sub: string; name: string | null }
type Fetch = typeof fetch;
const JWKS_URL = 'https://www.googleapis.com/oauth2/v3/certs';
// Faqat test muhitida (NODE_ENV=test) kalitlar manzili almashtiriladi — E2E soxta JWKS serveri uchun. Productionda e'tiborga olinmaydi.
const jwksUrl = (): string => (process.env.NODE_ENV === 'test' && process.env.GOOGLE_JWKS_URL) || JWKS_URL;
const ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com']);
const SKEW_S = 120;

let cache: { at: number; ttl: number; keys: Map<string, JsonWebKey> } | null = null;
export const resetGoogleKeyCache = (): void => { cache = null; };
async function keyFor(kid: string, f: Fetch, now: number): Promise<JsonWebKey | undefined> {
  for (let attempt = 0; attempt < 2; attempt++) {
    // Kalit topilmasa (Google kalitlarni almashtirgan bo'lishi mumkin) bir marta yangilab ko'ramiz
    if (!cache || now - cache.at > cache.ttl || attempt === 1) {
      const r = await f(jwksUrl(), { signal: AbortSignal.timeout(8000) }).catch(() => null);
      if (!r?.ok) { if (cache?.keys.has(kid)) break; throw new GoogleAuthError('Google kalitlarini olib bo‘lmadi'); }
      const j = (await r.json().catch(() => null)) as { keys?: (JsonWebKey & { kid?: string })[] } | null;
      const max = /max-age=(\d+)/.exec(r.headers.get('cache-control') ?? '')?.[1];
      cache = { at: now, ttl: Math.min(Math.max(Number(max ?? 3600), 300), 86_400) * 1000, keys: new Map((j?.keys ?? []).filter((k) => k.kid && k.kty === 'RSA').map((k) => [k.kid!, k])) };
    }
    const k = cache.keys.get(kid);
    if (k) return k;
  }
  return cache?.keys.get(kid);
}
const b64u = (s: string): Buffer => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

/** ID tokenni tekshiradi. Har qanday nomuvofiqlikda GoogleAuthError (401). */
export async function verifyGoogleIdToken(idToken: unknown, clientId: string, f: Fetch = fetch, now = Date.now()): Promise<GoogleProfile> {
  if (typeof idToken !== 'string' || idToken.length > 4096) throw new GoogleAuthError('Google ma‘lumoti noto‘g‘ri');
  const parts = idToken.split('.');
  if (parts.length !== 3) throw new GoogleAuthError('Google ma‘lumoti noto‘g‘ri');
  let header: { alg?: string; kid?: string }, claims: Record<string, unknown>;
  try { header = JSON.parse(b64u(parts[0]!).toString('utf8')); claims = JSON.parse(b64u(parts[1]!).toString('utf8')); } catch { throw new GoogleAuthError('Google ma‘lumoti noto‘g‘ri'); }
  if (header.alg !== 'RS256' || !header.kid) throw new GoogleAuthError('Google imzo turi qabul qilinmaydi'); // "none" va HS256 hujumlariga qarshi: faqat RS256
  const jwk = await keyFor(header.kid, f, now);
  if (!jwk) throw new GoogleAuthError('Google imzo kaliti topilmadi');
  let ok = false;
  try { ok = verify('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), b64u(parts[2]!)); } catch { ok = false; }
  if (!ok) throw new GoogleAuthError('Google imzosi noto‘g‘ri');
  const nowS = Math.floor(now / 1000);
  if (typeof claims.iss !== 'string' || !ISSUERS.has(claims.iss)) throw new GoogleAuthError('Google emitenti noto‘g‘ri');
  if (claims.aud !== clientId) throw new GoogleAuthError('Google ilova identifikatori mos emas'); // boshqa saytga berilgan token bizda ishlamaydi
  if (typeof claims.exp !== 'number' || claims.exp + SKEW_S < nowS) throw new GoogleAuthError('Google kirish ma‘lumoti eskirgan — qaytadan urinib ko‘ring');
  if (typeof claims.iat === 'number' && claims.iat - SKEW_S > nowS) throw new GoogleAuthError('Google ma‘lumoti vaqti noto‘g‘ri');
  if (typeof claims.sub !== 'string' || !/^\d{5,40}$/.test(claims.sub)) throw new GoogleAuthError('Google identifikatori yo‘q');
  if (claims.email !== undefined && claims.email_verified !== true) throw new GoogleAuthError('Google pochtasi tasdiqlanmagan');
  const name = typeof claims.given_name === 'string' ? claims.given_name : typeof claims.name === 'string' ? claims.name : null;
  return { sub: claims.sub, name };
}
