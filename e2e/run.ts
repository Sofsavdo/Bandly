// Brauzer E2E ssenariylari (Playwright): haqiqiy server jarayoni + qurilgan sayt (dist) + soxta Hamyon + soxta AI + vaqtinchalik baza.
// Haqiqiy pul, haqiqiy AI xarajati yoki haqiqiy foydalanuvchi ma'lumoti ishlatilmaydi.
// Ishga tushirish: npm run test:e2e  (avval `npm run build`). Ekran: 390 px (mobil), xatolar: sahifa JS xatosi va 5xx javoblar.
//   A. Mehmon → daraja testi → natija → ro'yxatdan o'tish (daraja saqlanadi, testga qaytarilmaydi)
//   B. Ro'yxatdan o'tgan o'quvchi → General English darsi → mashq → progress serverga saqlanadi (kesh kalitlarisiz)
//   C. IELTS Reading mock → topshirish → natija → natijalar tarixida
//   D. Writing → AI baholash (soxta AI) → Writing Lab tuzatishi → «Xatolarim»ga tushadi
//   F. Tariflar → to'lov (soxta Hamyon callback) → obuna ochiladi
//   G. Obuna muddati tugadi → pullik bo'lim yopiladi
//   H. Mehmon mock → natija yopiq → ro'yxatdan o'tish → natija akkauntga bog'lanadi (bir marta), shaxsiy reja
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { createServer, type IncomingMessage } from 'node:http';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hamyonSign } from '../server/hamyon';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright') as typeof import('playwright');
if (!existsSync('dist/index.html')) throw new Error('dist/ yo‘q — avval `npm run build`');

const SHOP = { shopId: '77', shopKey: 'e2e-shop-key' };
const dir = mkdtempSync(join(tmpdir(), 'sz-e2e-'));
const DB = join(dir, 'e2e.sqlite');
const body = (req: IncomingMessage) => new Promise<string>((r) => { let s = ''; req.on('data', (c) => (s += c)); req.on('end', () => r(s)); });

// ---- Soxta Hamyon ----
const hp = new Map<string, { amount: number; order: string }>();
const hamyon = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://x'); res.setHeader('content-type', 'application/json');
  if (url.pathname === '/payment/create') { const f = Object.fromEntries(new URLSearchParams(await body(req))); const id = `E${hp.size + 1}`; hp.set(id, { amount: Number(f.amount), order: f.order_id! }); return res.end(JSON.stringify({ payment_id: id, card: '8600000000000000', amount: Number(f.amount), expires_in: 300 })); }
  if (url.pathname === '/payment/status') return res.end(JSON.stringify({ status: 'pending', amount: 0, shop_id: SHOP.shopId }));
  await body(req); res.end('{}');
});
// ---- Soxta AI (OpenAI formati): Writing baholash JSON'i; tuzatish o'quvchi matnidagi iboraga ----
const ai = createServer(async (req, res) => {
  await body(req); res.setHeader('content-type', 'application/json');
  const ev = { task_response: 6, coherence: 6.5, lexical: 6, grammar: 5.5, strengths: ['Clear position'], improve: ['Use more linking words'], focus: 'Grammar: articles', corrections: [{ said: 'people is', better: 'people are', why: 'Ko‘plik — are', criterion: 'grammar' }, { said: 'this phrase is not in the text', better: 'x', criterion: 'lexical' }] };
  res.end(JSON.stringify({ choices: [{ message: { content: JSON.stringify(ev) } }], usage: { prompt_tokens: 10, completion_tokens: 10 } }));
});
const listen = (s: ReturnType<typeof createServer>) => new Promise<number>((r) => s.listen(0, '127.0.0.1', () => r((s.address() as { port: number }).port)));
const [hamyonPort, aiPort] = [await listen(hamyon), await listen(ai)];

const PORT = 34000 + Math.floor(Math.random() * 2000);
const env: NodeJS.ProcessEnv = {};
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE|PAY_DEMO/i.test(k)) env[k] = v;
Object.assign(env, {
  PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: DB, BACKUP_DISABLED: '1', NODE_ENV: 'test',
  HAMYON_SHOP_ID: SHOP.shopId, HAMYON_SHOP_KEY: SHOP.shopKey, HAMYON_BASE_URL: `http://127.0.0.1:${hamyonPort}`,
  API_RATE_PER_MIN: '5000', // barcha ssenariylar bitta IP'dan: umumiy tezlik cheklovi (productionda 120/daq) sinovni to'sib qo'ymasin
  AI_PROVIDER: 'openai', AI_API_KEY: 'sk-e2e-not-real', AI_MODEL: 'e2e-model', AI_FALLBACK_MODEL: ' ', AI_BASE_URL: `http://127.0.0.1:${aiPort}`, AI_GLOBAL_DAILY_CALLS: '100',
});
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));
const base = `http://127.0.0.1:${PORT}`;
const api = async (path: string, init: RequestInit & { token?: string } = {}) => {
  const r = await fetch(base + path, { ...init, headers: { 'content-type': 'application/json', ...(init.token ? { 'x-token': init.token } : {}) } });
  return { status: r.status, json: await r.json().catch(() => ({})) as Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const browser = await chromium.launch();
const problems: string[] = [];
let scenario = '';
async function page(init?: (ls: Record<string, string>) => void, seed: Record<string, string> = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  if (init) await ctx.addInitScript(([s]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); } }, [seed]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(`${scenario}: JS xato ${e.message.slice(0, 160)}`));
  p.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 500) problems.push(`${scenario}: HTTP ${r.status()} ${r.request().method()} ${r.url().slice(base.length)}`); });
  return p;
}
const text = (p: import('playwright').Page) => p.evaluate(() => document.querySelector('main')?.innerText ?? '');
const step = async (name: string, fn: () => Promise<void>) => { scenario = name; const t0 = Date.now(); await fn(); console.log(`  ✓ ${name} (${Date.now() - t0} ms)`); };

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* hali ishga tushmoqda */ }
    if (i > 150 || srv.exitCode !== null) throw new Error('server ishga tushmadi:\n' + log);
    await new Promise((r) => setTimeout(r, 200));
  }
  let token = '';

  await step('A. Mehmon → daraja testi → natija → ro‘yxatdan o‘tish', async () => {
    const p = await page();
    await p.goto(`${base}/#/placement`);
    await p.getByRole('button', { name: 'Testni boshlash' }).click();
    for (let i = 0; i < 80 && !/Sizning darajangiz/.test(await text(p)); i++) {
      const opt = p.locator('main button.opt, main .opts button, main button.option').first();
      await opt.waitFor({ timeout: 5000 }); await opt.click();
      const nx = p.locator('main button:has-text("Keyingi"), main button:has-text("Tekshirish"), main button:has-text("Davom")').first();
      if (await nx.count() && await nx.isEnabled()) await nx.click();
    }
    assert.match(await text(p), /Sizning darajangiz: (A1|A2|B1|B2|C1|C2)/, 'natija ko‘rsatildi');
    await p.getByRole('button', { name: 'Dasturni saqlash' }).click();
    const level = await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.profile.v1') ?? '{}').level as string);
    assert.ok(level, 'daraja qurilmada saqlandi');
    await p.locator('main a:has-text("Bepul ro‘yxatdan o‘tish")').click();
    await p.waitForURL(/#\/login/);
    await p.getByPlaceholder('Laqab').fill('E2E Learner');
    await p.getByRole('button', { name: 'Davom etish' }).click();
    await p.waitForURL(/#\/start/);
    const acc = await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.account.v1') ?? 'null') as { token: string } | null);
    assert.ok(acc?.token, 'hisob ochildi');
    token = acc!.token;
    assert.equal(await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.profile.v1') ?? '{}').level), level, 'ro‘yxatdan keyin daraja yo‘qolmadi');
    await p.context().close();
  });

  const learner = (extra: Record<string, string> = {}) => page(() => undefined, {
    'bandly.account.v1': JSON.stringify({ token, nickname: 'E2E Learner' }),
    'bandly.onboard.v1': JSON.stringify({ goal: 'ielts', minutes: 20 }),
    'bandly.profile.v1': JSON.stringify({ level: 'A1', xp: 0 }),
    ...extra,
  });

  await step('B. General English darsi → mashq → progress serverga saqlanadi', async () => {
    const p = await learner();
    const rev0 = (await api('/api/progress', { token })).json.rev as number;
    await p.goto(`${base}/#/learn/a1-u1-l1`);
    await p.waitForTimeout(1200);
    assert.ok((await text(p)).length > 50, 'dars ochildi');
    // Bir necha mashq qadami: variant tanlash / tekshirish / keyingi
    for (let i = 0; i < 25; i++) {
      const b = p.locator('main button.opt:not([disabled]), main button.chip:not([disabled]), main button:has-text("Tekshirish"):not([disabled]), main button:has-text("Keyingi"):not([disabled]), main button:has-text("Boshlash"):not([disabled]), main button:has-text("Davom"):not([disabled])').first();
      if (!(await b.count())) break;
      await b.click(); await p.waitForTimeout(120);
    }
    // Sahifa yashirilganda (ilova yopilganda) progress yuboriladi
    await p.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    let g = (await api('/api/progress', { token })).json;
    for (let i = 0; i < 30 && g.rev === rev0; i++) { await p.waitForTimeout(200); g = (await api('/api/progress', { token })).json; }
    assert.ok(g.rev > rev0, 'progress serverga yozildi');
    const keys = Object.keys(g.data ?? {});
    assert.ok(keys.includes('bandly.profile.v1'), 'profil saqlandi');
    assert.ok(!keys.some((k) => /content\.v|i18n\./.test(k)), `kesh kalitlari yuborilmadi: ${keys.join(',')}`);
    await p.context().close();
  });

  await step('C. IELTS Reading mock → topshirish → natijalar tarixi', async () => {
    const p = await learner();
    await p.goto(`${base}/#/mocks/reading/reading-5`);
    await p.getByRole('button', { name: 'Testni boshlash' }).click();
    await p.locator('main input[type=radio]').first().waitFor({ state: 'attached' });
    // Har savolga birinchi variant (radio tugmalar label ichida, vizual yashirilgan — foydalanuvchi kabi label bosiladi)
    const answered = await p.evaluate(() => { const seen = new Set<string>(); for (const r of document.querySelectorAll<HTMLInputElement>('main input[type=radio]')) { if (seen.has(r.name)) continue; seen.add(r.name); (r.closest('label') ?? r).click(); } return seen.size; });
    assert.ok(answered >= 5, `savollar: ${answered}`);
    await p.locator('main button:has-text("Topshirish")').first().click();
    await p.locator('button:has-text("Topshirish")').last().click(); // tasdiqlash
    await p.waitForTimeout(1500);
    assert.match(await text(p), /\d+\s*\/\s*\d+|band|Band/i, 'natija ko‘rsatildi');
    await p.goto(`${base}/#/results`); await p.waitForTimeout(1500);
    assert.match(await text(p), /Reading/i, 'natijalar tarixida');
    await p.context().close();
  });

  await step('D. Writing → AI baholash → Writing Lab → Xatolarim', async () => {
    const p = await learner();
    await p.goto(`${base}/#/exam/writing`); await p.waitForTimeout(1500);
    const ta = p.locator('main textarea').first();
    await ta.waitFor({ timeout: 8000 });
    const essay = 'Nowadays many people is moving to big cities because they want better jobs and education. ' + 'In my opinion this trend has both advantages and disadvantages for society and for families. '.repeat(3);
    await ta.fill(essay);
    await p.locator('main button:has-text("Baholash"), main button:has-text("AI baho"), main button:has-text("Tekshirish")').first().click();
    await p.locator('main .lab-list').waitFor({ timeout: 15000 });
    const lab = await p.locator('main .lab-list').innerText();
    assert.match(lab, /people is/); assert.match(lab, /people are/);
    assert.doesNotMatch(lab, /not in the text/, 'matnda yo‘q "tuzatish" ko‘rsatilmaydi');
    const mistakes = await p.evaluate(() => localStorage.getItem('bandly.mistakes.v1') ?? '');
    assert.match(mistakes, /people are/, 'tuzatish takrorlash ro‘yxatiga tushdi');
    await p.context().close();
  });

  await step('F. Tariflar → to‘lov → obuna ochiladi', async () => {
    const p = await learner();
    await p.goto(`${base}/#/pricing`); await p.waitForTimeout(1200);
    const buy = p.locator('main button:has-text("Sotib olish"), main button:has-text("To‘lash"), main button:has-text("Obuna bo‘lish"), main button:has-text("Tanlash")').first();
    await buy.waitFor({ timeout: 8000 });
    await buy.click();
    // Server to'lov yaratdi (soxta Hamyon) — karta va aniq summa ko'rsatiladi
    for (let i = 0; i < 40 && !hp.size; i++) await p.waitForTimeout(150);
    assert.equal(hp.size, 1, 'to‘lov yaratildi');
    await p.getByText(/8600/).first().waitFor({ timeout: 8000 }); // karta raqami (to'lov oynasi)
    const [hid, h] = [...hp.entries()][0]!;
    // Hamyon complete callback (imzo bilan)
    const f = new URLSearchParams({ shop_id: SHOP.shopId, payment_id: hid, amount: String(h.amount), order_id: h.order, status: 'paid', sign: hamyonSign(SHOP, hid, h.amount) });
    assert.equal((await fetch(`${base}/api/pay/hamyon/complete`, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: f })).status, 200);
    const me = (await api('/api/me', { token })).json;
    assert.ok(me.plan, 'obuna ochildi');
    const all = () => p.evaluate(() => document.body.innerText);
    for (let i = 0; i < 80 && !/muvaffaqiyat|faollashdi|ochildi|qabul qilindi|Rahmat/i.test(await all()); i++) await p.waitForTimeout(250);
    assert.match(await all(), /muvaffaqiyat|faollashdi|ochildi|qabul qilindi|Rahmat/i, 'foydalanuvchiga to‘lov natijasi ko‘rsatildi');
    await p.context().close();
  });

  await step('G. Obuna muddati tugadi → pullik bo‘lim yopiladi', async () => {
    const raw = new DatabaseSync(DB);
    raw.prepare("UPDATE subscriptions SET until = ? WHERE player_id = (SELECT id FROM players WHERE nickname = 'E2E Learner')").run(Date.now() - 60_000);
    raw.close();
    const me = (await api('/api/me', { token })).json;
    assert.equal(me.plan, null, 'server obunani yopdi');
    assert.ok(Object.values(me.subs as Record<string, number | null>).every((v) => v === null));
    const p = await learner();
    await p.goto(`${base}/#/pricing`); await p.waitForTimeout(1500);
    assert.doesNotMatch(await text(p), /Faol obuna|amal qiladi:/i, 'tariflar sahifasida faol obuna ko‘rsatilmaydi');
    await p.context().close();
  });

  await step('H. Mehmon mock → natija yopiq → ro‘yxatdan o‘tish → natija akkauntga bog‘lanadi, reja chiqadi', async () => {
    const p = await page();
    const gradeCalls: string[] = [];
    p.on('request', (r) => { if (r.url().includes('/api/mock/grade')) gradeCalls.push(r.headers()['x-token'] ?? ''); });
    await p.goto(`${base}/#/mocks/reading/reading-5`);
    await p.getByRole('button', { name: 'Testni boshlash' }).click();
    assert.doesNotMatch(p.url(), /#\/login/, 'mehmon login devoriga yo‘naltirilmadi');
    await p.locator('main input[type=radio]').first().waitFor({ state: 'attached' });
    const answerAll = () => p.evaluate(() => { const seen = new Set<string>(); for (const r of document.querySelectorAll<HTMLInputElement>('main input[type=radio]')) { if (seen.has(r.name)) continue; seen.add(r.name); (r.closest('label') ?? r).click(); } return seen.size; });
    assert.ok(await answerAll() >= 5, 'savollar javoblandi');
    // Sahifa yangilansa javoblar yo'qolmaydi
    await p.reload(); await p.locator('main input[type=radio]:checked').first().waitFor({ state: 'attached', timeout: 8000 });
    await p.locator('main button:has-text("Topshirish")').first().click();
    await p.locator('button:has-text("Topshirish")').last().click(); // tasdiqlash
    await p.getByText('Natijani ko‘rish va saqlash uchun bepul ro‘yxatdan o‘ting').waitFor({ timeout: 8000 });
    assert.doesNotMatch(await text(p), /Band:|To‘g‘ri javob/, 'mehmonga natija va javob kalitlari ko‘rsatilmaydi');
    assert.equal(gradeCalls.length, 0, 'mehmon uchun baholash so‘rovi yuborilmadi (kalitlar serverda qoladi)');
    // Yangilash: gate qoladi, javoblar qurilmada
    await p.reload(); await p.getByText('Natijangiz tayyor').first().waitFor({ timeout: 8000 });
    const att = await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.attempt.v1.reading:reading-5') ?? 'null') as { guest?: boolean; status: string; answers: Record<string, unknown> });
    assert.ok(att?.guest === true && att.status === 'submitted' && Object.keys(att.answers).length >= 5, 'mehmon urinishi qurilmada saqlangan');
    assert.equal(await p.getByRole('button', { name: 'Qayta boshlash' }).count(), 0, 'natijani ochmasdan javoblarni o‘chirib bo‘lmaydi');
    // Ro'yxatdan o'tish → o'sha test sahifasiga qaytadi va natija darhol ochiladi (savolnomaga yo'naltirilmaydi)
    await p.locator('main a:has-text("Bepul ro‘yxatdan o‘tish va natijani ochish")').first().click();
    await p.waitForURL(/#\/login/);
    await p.getByPlaceholder('Laqab').fill('Mehmon Mock');
    await p.getByRole('button', { name: 'Davom etish' }).click();
    await p.getByText('Natijangiz hisobingizga saqlandi.').waitFor({ timeout: 15000 }).catch(async (e) => { throw new Error(`natija ochilmadi: ${p.url()} :: ${(await text(p)).slice(0, 900)} :: ${e.message.split('\n')[0]}`); });
    assert.match(p.url(), /#\/mocks\/reading\/reading-5/, 'natija sahifasida qoldi');
    assert.match(await text(p), /\d+\s*\/\s*\d+/, 'natija (to‘g‘ri javoblar soni) ochildi');
    assert.ok(gradeCalls.length >= 1 && gradeCalls.every((t) => t.length > 10), 'baholash faqat hisob tokeni bilan');
    await p.getByText('Natijangiz asosida shaxsiy reja').waitFor({ timeout: 8000 });
    assert.match(await text(p), /taxminiy tavsiya/, 'reja taxminiy tavsiya ekani aytilgan');
    assert.match(await text(p), /kafolatlanmaydi/, 'kafolat yo‘q ogohlantirishi');
    const hrefs = await p.locator('.mock-plan a.path-step').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
    assert.ok(hrefs.length >= 1 && hrefs.every((h) => /^#\/(learn\/[\w-]+|mocks\/(reading|listening)\/[\w-]+|placement)$/.test(h)), `reja havolalari bevosita: ${hrefs.join(', ')}`);
    await p.waitForTimeout(1800); // 600 ms dan keyin savolnomaga qaytarib yubormasligi kerak
    assert.match(p.url(), /#\/mocks\/reading\/reading-5/, 'natijani ko‘rib bo‘lmay savolnomaga yo‘naltirilmadi');
    // Yangilash: natija ikki marta yozilmaydi
    await p.reload(); await p.getByText('Natijangiz asosida shaxsiy reja').waitFor({ timeout: 10000 });
    await p.waitForTimeout(800);
    const results = await p.evaluate(() => (JSON.parse(localStorage.getItem('bandly.results.v1') ?? '[]') as { title: string }[]).length);
    assert.equal(results, 1, 'natijalar tarixida bitta yozuv');
    // Takroriy so'rov (callback/refresh): server bitta natija, XP ikki marta berilmaydi
    const tk = (await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.account.v1') ?? 'null') as { token: string }))!.token;
    const attemptId = String((await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.attempt.v1.reading:reading-5') ?? 'null') as { startedAt: number })).startedAt);
    const answers = (await p.evaluate(() => JSON.parse(localStorage.getItem('bandly.attempt.v1.reading:reading-5') ?? 'null') as { answers: Record<string, unknown> })).answers;
    const g1 = (await api('/api/mock/grade', { method: 'POST', token: tk, body: JSON.stringify({ kind: 'reading', testId: 'reading-5', answers, attemptId }) })).json;
    const g2 = (await api('/api/mock/grade', { method: 'POST', token: tk, body: JSON.stringify({ kind: 'reading', testId: 'reading-5', answers, attemptId }) })).json;
    assert.equal(g1.resultId, g2.resultId, 'takroriy baholash bitta natija yozuvi'); assert.equal(g2.xp, 0, 'takroriy baholashda XP qayta berilmaydi');
    const raw = new DatabaseSync(DB);
    const n = (raw.prepare("SELECT COUNT(*) AS n FROM exam_results WHERE player_id = (SELECT id FROM players WHERE nickname = 'Mehmon Mock') AND test_id = 'reading-5'").get() as { n: number }).n;
    raw.close();
    assert.equal(n, 1, 'bazada bitta natija');
    await p.context().close();
  });

  assert.deepEqual(problems, [], 'brauzerda JS xatosi yoki 5xx bo‘lmasligi kerak');
  console.log('e2e: OK');
} catch (e) {
  console.error(`\n✗ ${scenario}\n`, e, '\n--- server log (oxiri) ---\n', log.slice(-1500), '\n', problems.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close(); srv.kill(); hamyon.close(); ai.close();
  rmSync(dir, { recursive: true, force: true });
}
