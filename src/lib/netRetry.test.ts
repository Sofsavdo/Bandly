import assert from 'node:assert/strict';
import { installNetRetry, shouldRetry, RETRY_DELAYS_MS } from './netRetry';

const O = 'https://sellzen.uz';
assert.equal(shouldRetry('GET', '/api/progress', O), true);
assert.equal(shouldRetry('GET', `${O}/api/health`, O), true);
assert.equal(shouldRetry('POST', '/api/progress', O), false, 'yozuv qayta yuborilmaydi');
assert.equal(shouldRetry('PUT', '/api/progress', O), false);
assert.equal(shouldRetry('GET', '/assets/app.js', O), false, 'faqat /api');
assert.equal(shouldRetry('GET', 'https://other.example/api/x', O), false, 'faqat o‘z domenimiz');

const mk = (script: (number | 'net')[]) => {
  const calls: string[] = []; let i = 0;
  const g = { location: { origin: O }, fetch: (async (input: RequestInfo | URL) => {
    calls.push(String(input));
    const s = script[Math.min(i++, script.length - 1)]!;
    if (s === 'net') throw new TypeError('Failed to fetch');
    return new Response('x', { status: s });
  }) as typeof fetch };
  const slept: number[] = [];
  installNetRetry(g, async (ms) => { slept.push(ms); });
  return { g, calls, slept };
};

// 503 → 503 → 200: ikki marta kutib, uchinchisida muvaffaqiyat
{ const t = mk([503, 503, 200]); const r = await t.g.fetch('/api/progress'); assert.equal(r.status, 200); assert.equal(t.calls.length, 3); assert.deepEqual(t.slept, RETRY_DELAYS_MS.slice(0, 2)); }
// tarmoq xatosi ham qayta uriniladi
{ const t = mk(['net', 200]); const r = await t.g.fetch('/api/me'); assert.equal(r.status, 200); assert.equal(t.calls.length, 2); }
// doimiy 502: urinishlar tugagach oxirgi javob qaytariladi (xato yashirilmaydi)
{ const t = mk([502]); const r = await t.g.fetch('/api/x'); assert.equal(r.status, 502); assert.equal(t.calls.length, RETRY_DELAYS_MS.length + 1); }
// 404/401 — qayta urinilmaydi
{ const t = mk([404]); const r = await t.g.fetch('/api/x'); assert.equal(r.status, 404); assert.equal(t.calls.length, 1); }
// POST — 503 bo'lsa ham bir marta
{ const t = mk([503]); const r = await t.g.fetch('/api/x', { method: 'POST' }); assert.equal(r.status, 503); assert.equal(t.calls.length, 1); }
console.log('netRetry.test: OK');
