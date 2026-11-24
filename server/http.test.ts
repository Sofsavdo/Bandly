// HTTP integratsiya testi: haqiqiy server jarayoni + soxta Hamyon serveri + vaqtinchalik baza.
// Haqiqiy pul, haqiqiy AI yoki haqiqiy foydalanuvchi ma'lumoti ishlatilmaydi: barcha kalitlar test qiymatlari, tarmoq faqat 127.0.0.1.
// Tekshiriladi: to'lov oqimi (yaratish → prepare → complete), imzo, summa, takroriy/kech/noma'lum callback, obuna ochilishi va tugashi;
// PUT /api/progress (eski mijoz keshi bilan ham 200, haqiqatan katta progress — 413, server yiqilmaydi); bot orqali kirish kodlari.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer, type IncomingMessage } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hamyonSign } from './hamyon';

const SHOP = { shopId: '77', shopKey: 'test-shop-key' };
const dir = mkdtempSync(join(tmpdir(), 'sz-http-'));
const DB = join(dir, 't.sqlite');

// ---- Soxta Hamyon: create to'lov ochadi, status so'ralganda belgilangan holatni qaytaradi ----
const hamyon = { n: 0, status: new Map<string, { status: string; amount: number }>(), cancels: 0 };
const body = (req: IncomingMessage) => new Promise<string>((r) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => r(s)); });
const fakeHamyon = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x');
  res.setHeader('content-type', 'application/json');
  if (req.method === 'POST' && url.pathname === '/payment/create') {
    const f = Object.fromEntries(new URLSearchParams(await body(req)));
    if (f.shop_key !== SHOP.shopKey) return res.end(JSON.stringify({ error: 'bad key' }));
    const id = `HP${++hamyon.n}`;
    hamyon.status.set(id, { status: 'pending', amount: Number(f.amount) });
    return res.end(JSON.stringify({ payment_id: id, card: '8600000000000000', amount: Number(f.amount), expires_in: 300 }));
  }
  if (url.pathname === '/payment/status') { const s = hamyon.status.get(url.searchParams.get('payment_id') ?? ''); return res.end(JSON.stringify(s ? { ...s, shop_id: SHOP.shopId } : { error: 'not found' })); }
  if (url.pathname === '/payment/cancel') { await body(req); hamyon.cancels++; return res.end('{}'); }
  res.statusCode = 404; res.end('{}');
});
await new Promise<void>((r) => fakeHamyon.listen(0, '127.0.0.1', r));
const hamyonPort = (fakeHamyon.address() as { port: number }).port;

// ---- Soxta AI provayder (OpenAI formati): 503 / JSON emas / bo'sh — haqiqiy AI va xarajat yo'q ----
const aiMode = { mode: '503' as '503' | 'garbage' | 'empty', calls: 0 };
const fakeAi = createServer(async (req, res) => {
  await body(req); aiMode.calls++;
  if (aiMode.mode === '503') { res.statusCode = 503; res.setHeader('content-type', 'application/json'); return res.end(JSON.stringify({ error: { message: 'overloaded' } })); }
  if (aiMode.mode === 'garbage') { res.setHeader('content-type', 'text/html'); return res.end('<html>gateway</html>'); }
  res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ choices: [{ message: { content: '' } }] }));
});
await new Promise<void>((r) => fakeAi.listen(0, '127.0.0.1', r));
const aiPort = (fakeAi.address() as { port: number }).port;

// ---- Server: maxfiy o'zgaruvchilar meros qilib olinmaydi ----
const PORT = 32000 + Math.floor(Math.random() * 2000);
const env: NodeJS.ProcessEnv = {};
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE/i.test(k)) env[k] = v;
Object.assign(env, { PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: DB, BACKUP_DISABLED: '1', NODE_ENV: 'test', HAMYON_SHOP_ID: SHOP.shopId, HAMYON_SHOP_KEY: SHOP.shopKey, HAMYON_BASE_URL: `http://127.0.0.1:${hamyonPort}`,
  AI_PROVIDER: 'openai', AI_API_KEY: 'sk-test-not-real', AI_MODEL: 'test-model', AI_FALLBACK_MODEL: ' ', AI_BASE_URL: `http://127.0.0.1:${aiPort}`, AI_GLOBAL_DAILY_CALLS: '100' });
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));
const base = `http://127.0.0.1:${PORT}`;
try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* hali ishga tushmoqda */ }
    if (i > 150 || srv.exitCode !== null) throw new Error('server ishga tushmadi:\n' + log);
    await new Promise((r) => setTimeout(r, 200));
  }
  const api = async (path: string, init: RequestInit & { token?: string } = {}) => {
    const r = await fetch(base + path, { ...init, headers: { 'content-type': 'application/json', ...(init.token ? { 'x-token': init.token } : {}), ...(init.headers ?? {}) } });
    return { status: r.status, json: await r.json().catch(() => ({})) as Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
  };
  const form = (path: string, f: Record<string, string>) => fetch(base + path, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(f) }).then(async (r) => ({ status: r.status, json: await r.json().catch(() => ({})) }));
  const signed = (paymentId: string, amount: number | string, extra: Record<string, string> = {}) => ({ shop_id: SHOP.shopId, payment_id: paymentId, amount: String(amount), sign: hamyonSign(SHOP, paymentId, amount), ...extra });

  const u = await api('/api/join', { method: 'POST', body: JSON.stringify({ nickname: 'HttpTest' }) });
  assert.equal(u.status, 200, JSON.stringify(u.json));
  const token = String(u.json.token);
  const me = async () => (await api('/api/me', { token })).json;
  assert.equal((await me()).plan, null, 'boshida obuna yo‘q');

  // 1) Narx serverdan: mijoz yuborgan "amount" e'tiborsiz qoldiriladi
  const cfg = (await api('/api/pay/config')).json;
  const price = cfg.periods.find((p: { days: number }) => p.days === 30).prices.general as number;
  const c1 = await api('/api/pay/create', { method: 'POST', body: JSON.stringify({ token, track: 'general', days: 30, amount: 1 }) });
  assert.equal(c1.status, 200, JSON.stringify(c1.json));
  assert.equal(c1.json.amount, price, 'summa server narxidan');
  const pay1 = String(c1.json.id), hp1 = [...hamyon.status.keys()].at(-1)!;
  // Noto'g'ri tarif / muddat
  assert.equal((await api('/api/pay/create', { method: 'POST', body: JSON.stringify({ token, track: 'vip', days: 30 }) })).status, 400);
  assert.equal((await api('/api/pay/create', { method: 'POST', body: JSON.stringify({ token, track: 'general', days: 7 }) })).status, 400);

  // 2) Imzo noto'g'ri — 403, hech narsa ochilmaydi
  assert.equal((await form('/api/pay/hamyon/complete', { ...signed(hp1, price), order_id: pay1, status: 'paid', sign: 'x'.repeat(32) })).status, 403);
  assert.equal((await me()).plan, null);
  // 3) Boshqa summa (imzo to'g'ri, lekin summa kam) — yetkazilmaydi
  assert.equal((await form('/api/pay/hamyon/complete', signed(hp1, price - 1000, { order_id: pay1, status: 'paid' }))).status, 200);
  assert.equal((await me()).plan, null, 'kam summa obuna bermaydi');
  // 4) Noma'lum/oraliq status — to'lov ochiq qoladi (bekor bo'lmaydi)
  await form('/api/pay/hamyon/prepare', signed(hp1, price, { order_id: pay1 }));
  await form('/api/pay/hamyon/complete', signed(hp1, price, { order_id: pay1, status: 'processing' }));
  assert.equal((await api(`/api/pay/status/${pay1}`, { token })).json.status, 'prepared', 'oraliq status to‘lovni yopmaydi');
  // 5) Muvaffaqiyatli to'lov — obuna ochiladi
  assert.equal((await form('/api/pay/hamyon/complete', signed(hp1, price, { order_id: pay1, status: 'paid' }))).status, 200);
  const m1 = await me();
  assert.equal(m1.plan, 'general');
  const until1 = m1.subs.grammar as number;
  // 6) Callback ikki marta keldi — muddat ikki marta qo'shilmaydi
  await form('/api/pay/hamyon/complete', signed(hp1, price, { order_id: pay1, status: 'paid' }));
  assert.equal((await me()).subs.grammar, until1, 'takroriy callback obunani uzaytirmaydi');
  // 7) To'langan to'lovga keyin "cancel" kelsa — obuna saqlanadi
  await form('/api/pay/hamyon/complete', signed(hp1, price, { order_id: pay1, status: 'cancel' }));
  assert.equal((await me()).subs.grammar, until1);

  // 8) Rad etildi / bekor qilindi — obuna berilmaydi; keyin kech kelgan "paid" (pul kelgan) yetkaziladi
  const c2 = await api('/api/pay/create', { method: 'POST', body: JSON.stringify({ token, track: 'exam', days: 30 }) });
  const pay2 = String(c2.json.id), hp2 = [...hamyon.status.keys()].at(-1)!, price2 = Number(c2.json.pay_amount);
  await form('/api/pay/hamyon/complete', signed(hp2, price2, { order_id: pay2, status: 'cancel' }));
  assert.equal((await api(`/api/pay/status/${pay2}`, { token })).json.status, 'cancelled');
  assert.equal((await me()).subs.exam, null, 'bekor qilingan to‘lov obuna bermaydi');
  await form('/api/pay/hamyon/complete', signed(hp2, price2, { order_id: pay2, status: 'paid' }));
  const m2 = await me();
  assert.ok(m2.subs.exam > Date.now(), 'kech kelgan to‘lov yetkaziladi');
  assert.equal(m2.plan, 'all', 'general + exam = hammasi');
  // 9) Uzaytirish: amaldagi muddat ustiga qo'shiladi (eski obuna yo'qolmaydi)
  const c3 = await api('/api/pay/create', { method: 'POST', body: JSON.stringify({ token, track: 'general', days: 30 }) });
  const pay3 = String(c3.json.id), hp3 = [...hamyon.status.keys()].at(-1)!;
  await form('/api/pay/hamyon/complete', signed(hp3, Number(c3.json.pay_amount), { order_id: pay3, status: 'paid' }));
  assert.equal((await me()).subs.grammar, until1 + 30 * 86_400_000, 'muddat ustiga qo‘shiladi');
  // ---- AI ishlamay qolsa: tushunarli xabar, oylik baholash kvotasi qaytariladi, sayt ishlashda davom etadi ----
  const essay = Array.from({ length: 45 }, (_, i) => `word${i}`).join(' ');
  const usedBefore = (await me()).ai.writing.used as number;
  for (const mode of ['503', 'garbage', 'empty'] as const) {
    aiMode.mode = mode; aiMode.calls = 0;
    const w = await api('/api/ai/writing', { method: 'POST', body: JSON.stringify({ token, text: essay, task: 2 }) });
    assert.ok(w.status === 503 || w.status === 502, `${mode}: ${w.status}`);
    assert.ok(typeof w.json.error === 'string' && w.json.error.length > 5 && !/stack|Error:/.test(w.json.error), `${mode}: tushunarli xabar`);
    assert.equal(aiMode.calls, 1, `${mode}: bitta model sozlamasida bir marta so'raladi (ortiqcha xarajat yo'q)`);
    assert.equal((await me()).ai.writing.used, usedBefore, `${mode}: AI javob bermasa kvota sarflanmaydi`);
  }
  assert.equal((await api('/api/health')).status, 200);
  assert.equal((await api('/api/pay/config')).status, 200, 'AI ishlamasa ham boshqa API ishlaydi');

  // 10) Callback yo'qolsa: foydalanuvchi status so'raganda Hamyondan o'qib yetkaziladi
  const c4 = await api('/api/pay/create', { method: 'POST', body: JSON.stringify({ token, track: 'exam', days: 30 }) });
  const pay4 = String(c4.json.id), hp4 = [...hamyon.status.keys()].at(-1)!;
  const examBefore = (await me()).subs.exam as number;
  hamyon.status.set(hp4, { status: 'paid', amount: Number(c4.json.pay_amount) });
  assert.equal((await api(`/api/pay/status/${pay4}`, { token })).json.status, 'success');
  assert.equal((await me()).subs.exam, examBefore + 30 * 86_400_000);
  // 11) Boshqa foydalanuvchi to'lovni ko'ra olmaydi
  const other = String((await api('/api/join', { method: 'POST', body: JSON.stringify({ nickname: 'Boshqa' }) })).json.token);
  assert.equal((await api(`/api/pay/status/${pay1}`, { token: other })).status, 404);

  // 12) Obuna muddati tugadi — pullik imkoniyat yopiladi (bazada muddatni o'tmishga suramiz)
  const raw = new DatabaseSync(DB);
  raw.prepare("UPDATE subscriptions SET until = ? WHERE player_id = (SELECT id FROM players WHERE nickname = 'HttpTest')").run(Date.now() - 1000);
  raw.close();
  const m3 = await me();
  assert.equal(m3.plan, null, 'muddati tugagan obuna yopiladi');
  assert.equal(m3.subs.exam, null);

  // ---- Progress (PUT /api/progress 502 regressiyasi) ----
  const prog = (data: Record<string, string>, rev: number) => api('/api/progress', { method: 'PUT', token, body: JSON.stringify({ data, rev }) });
  const p1 = await prog({ 'bandly.lessons.v1': '{"a1-u1-l1":{"passedAt":1}}', 'bandly.content.v2': 'x'.repeat(1_500_000), 'bandly.i18n.langs': '["uz"]' }, 0);
  assert.equal(p1.status, 200, 'eski mijozning kesh bilan kelgan progressi saqlanadi (avval 502 edi)');
  const g1 = (await api('/api/progress', { token })).json;
  assert.deepEqual(Object.keys(g1.data), ['bandly.lessons.v1'], 'kesh saqlanmaydi');
  const p2 = await prog({ 'bandly.results.v1': 'y'.repeat(700_000) }, g1.rev);
  assert.equal(p2.status, 413, 'haqiqatan katta progress — aniq 413, ulanish uzilmaydi');
  assert.equal((await prog({ 'bandly.results.v1': '[]' }, 999)).status, 409, 'eski versiya ustidan yozilmaydi');
  assert.equal((await prog({ 'notbandly': '1' }, g1.rev)).status, 400);
  assert.equal((await api('/api/progress', { method: 'PUT', token: 'yoq', body: JSON.stringify({ data: {}, rev: 0 }) })).status, 401);
  assert.equal((await api('/api/health')).status, 200, 'server ishlashda davom etadi');

  // ---- Bot orqali kirish: bot ulanmagan bo'lsa 503, noma'lum kod 410 ----
  assert.equal((await api('/api/auth/bot/start', { method: 'POST' })).status, 503);
  assert.equal((await api(`/api/auth/bot/${'0'.repeat(32)}`)).status, 410);
  console.log('http.test: OK');
} finally {
  srv.kill(); fakeHamyon.close(); fakeAi.close();
  rmSync(dir, { recursive: true, force: true });
}
