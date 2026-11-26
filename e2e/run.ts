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
//   I. Creator linki → bridge → veb → ro'yxat → creator kabinetida voronka
//   J. Hamkorlik: mehmon bosh sahifadan hamkorlik sahifasiga o'tadi, video to'lovi shartlari va hisob misolini ko'radi, ariza qoldiradi (rozilik majburiy) →
//      admin «Arizalar»da ko'radi va holatini o'zgartiradi; «Video to'lovlari»da shartni tahrirlaydi — sahifada yangi qiymat
//   K. Admin paneli: hamkor mukofot qoidasi — so'mda yaratish, tahrirlash, yoqish (egasi tasdig'i bilan); kredit rejimi «Limitlar»da
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
  ADMIN_NICKNAMES: 'E2E Admin',
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
  let adminToken = '';

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
    // 2026-11-24: natija avtomatik saqlanadi ("Dasturni saqlash" tugmasi yo'q — bosilmasa ham daraja yo'qolmaydi)
    assert.match(await text(p), /Darajangiz saqlandi/, 'natija avtomatik saqlandi');
    assert.equal(await p.getByRole('button', { name: 'Dasturni saqlash' }).count(), 0, 'saqlash tugmasi yo‘q');
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
    // Xarita: har zonada "can-do" qatori; "Yo'l tanlang" oynasi (General English ⇄ IELTS ⇄ CEFR ⇄ SAT ⇄ Imtihon)
    await p.goto(`${base}/#/learn`); await p.waitForTimeout(1500);
    assert.ok((await p.locator('.zone-cando').count()) >= 6, 'har daraja zonasida can-do sarlavha');
    await p.locator('.chip-route').first().click();
    await p.getByRole('dialog').waitFor({ timeout: 5000 });
    assert.deepEqual(await p.locator('.route-item').evaluateAll((els) => els.map((e) => e.getAttribute('href'))), ['#/learn', '#/ielts', '#/cefr', '#/sat', '#/exam'], 'yo‘l tanlash havolalari');
    await p.getByRole('button', { name: 'Yopish' }).first().click();
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

  await step('F2. SAT kursi: sahifa → dars ochiladi → mashq to‘plamlari (mavzu filtri, 10 talik sahifalar)', async () => {
    const p = await learner();
    await p.goto(`${base}/#/sat`); await p.waitForTimeout(1500);
    assert.match(await text(p), /SAT kursi/, 'SAT kursi sahifasi ochildi');
    const links = await p.locator('main a.lcard').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
    assert.ok(links.length >= 1 && links.every((h) => /^#\/learn\/sat-/.test(h)), `SAT dars havolalari: ${links.join(',')}`);
    await p.goto(`${base}/${links[0]}`); await p.waitForTimeout(1500);
    assert.ok((await text(p)).length > 200, 'SAT darsi ochildi');
    assert.ok((await p.locator('main a[href="#/sat"]').count()) >= 1, 'darsdan SAT kursiga qaytish havolasi bor');
    // Mashq savollari: 10 talik to'plamlar + mavzu filtri
    await p.goto(`${base}/#/exam`); await p.waitForTimeout(1200);
    await p.getByRole('tab', { name: /SAT/ }).first().click().catch(() => undefined);
    await p.getByRole('button', { name: /Reading and Writing/ }).first().click(); await p.waitForTimeout(800);
    assert.match(await text(p), /· 1\/\d+/, 'to‘plam raqami ko‘rsatildi');
    assert.ok((await p.locator('main .q').count()) === 10 || (await p.locator('main .q').count()) > 0, 'to‘plamda savollar bor');
    const topic = p.getByRole('button', { name: /Craft and Structure/ }).first();
    await topic.click(); await p.waitForTimeout(500);
    assert.match(await text(p), /Craft and Structure/, 'mavzu filtri ishlaydi');
    await p.context().close();
  });

  await step('F3. CEFR va SAT kurslari: kirish → dars → dars ichida ham «Imtihon» bo‘limi (General English emas)', async () => {
    const p = await learner();
    const activeTab = () => p.evaluate(() => document.querySelector('nav.tabbar a.active')?.getAttribute('href') ?? '');
    const title = () => p.evaluate(() => document.title);
    // CEFR: Imtihon → CEFR tabi → kurs kartasi → kurs sahifasi → dars
    await p.goto(`${base}/#/exam`); await p.waitForTimeout(1200);
    await p.getByRole('tab', { name: /CEFR/ }).first().click(); await p.waitForTimeout(500);
    await p.locator('main a[href="#/cefr"]').first().click(); await p.waitForTimeout(1000);
    assert.match(await text(p), /CEFR kursi/, 'CEFR kursi sahifasi ochildi');
    assert.equal(await activeTab(), '#/exam', 'CEFR kursida pastki panelda «Imtihon» faol');
    assert.match(await title(), /^CEFR kursi/, 'sarlavha — CEFR kursi');
    const cefrLink = await p.locator('main a.lcard').first().getAttribute('href');
    assert.match(cefrLink ?? '', /^#\/learn\//, 'CEFR kursida dars havolasi bor');
    await p.locator('main a.lcard').first().click(); await p.waitForTimeout(1500);
    assert.match(p.url(), /#\/learn\//, 'dars ochildi');
    assert.equal(await activeTab(), '#/exam', 'CEFR kursidan ochilgan dars ichida ham «Imtihon» faol');
    assert.ok((await p.locator('main a[href="#/cefr"]').count()) >= 1, 'darsdan CEFR kursiga qaytish havolasi bor');
    // General English xaritasiga o'tilsa kontekst tozalanadi: o'sha dars endi General English darsi
    await p.goto(`${base}/#/learn`); await p.waitForTimeout(1200);
    assert.equal(await activeTab(), '#/learn', 'General English xaritasida «Darslar» faol');
    await p.goto(`${base}/${cefrLink}`); await p.waitForTimeout(1200);
    assert.equal(await activeTab(), '#/learn', 'xaritadan keyin ochilgan dars — General English');
    assert.equal(await p.locator('main a[href="#/cefr"]').count(), 0, 'General English darsida CEFR havolasi yo‘q');
    // SAT: Imtihon → SAT tabi → kurs kartasi → dars (sat-)
    await p.goto(`${base}/#/exam`); await p.waitForTimeout(1200);
    await p.getByRole('tab', { name: /SAT/ }).first().click(); await p.waitForTimeout(500);
    const satCard = await p.locator('main a.ielts-card').first().getAttribute('href');
    assert.match(satCard ?? '', /^#\/learn\/sat-/, 'SAT tabida birinchi karta — SAT kursi darsi');
    await p.locator('main a.ielts-card').first().click(); await p.waitForTimeout(1500);
    assert.equal(await activeTab(), '#/exam', 'SAT darsida «Imtihon» faol (General English emas)');
    assert.match(await title(), /^SAT kursi/, 'sarlavha — SAT kursi');
    await p.goto(`${base}/#/sat`); await p.waitForTimeout(1000);
    assert.equal(await activeTab(), '#/exam', 'SAT kursi sahifasida «Imtihon» faol');
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
    assert.match(await text(p), /Reja shu test natijangizga tayanadi/, 'reja qaysi natijaga tayanishi aytilgan');
    assert.doesNotMatch(await text(p), /taxminiy|kafolatlanmaydi|rasmiy IELTS bahosi emas/, 'egasi (2026-11-26): ishonchni pasaytiruvchi so‘zlar reja kartasida ko‘rinmaydi (shartlar sahifasida bor)');
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

  await step('I. Creator linki → bridge sahifa → veb → ro‘yxat → creator kabinetida voronka', async () => {
    const mk = async (nickname: string) => String((await api('/api/join', { method: 'POST', body: JSON.stringify({ nickname }) })).json.token);
    const adminT = await mk('E2E Admin'), crT = await mk('E2E Creator'); adminToken = adminT;
    assert.equal((await api('/api/staff/role', { method: 'POST', token: adminT, body: JSON.stringify({ nickname: 'E2E Creator', role: 'creator' }) })).status, 200);
    const link = (await api('/api/creator/links', { method: 'POST', token: crT, body: JSON.stringify({ kind: 'reel', label: 'E2E Reel', lang: 'ru' }) })).json.link as { code: string };
    // Haqiqiy mobil brauzer UA (HeadlessChrome — bot sifatida filtrlanadi: bu ham to'g'ri xulq)
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
    const p = await ctx.newPage();
    p.on('pageerror', (e) => problems.push(`${scenario}: JS xato ${e.message.slice(0, 160)}`));
    await p.goto(`${base}/r/${link.code}`);
    assert.match(await p.evaluate(() => document.documentElement.lang), /ru/, 'bridge sahifa link tilida');
    assert.ok(await p.locator('#web').count(), 'veb-saytda davom etish tugmasi');
    assert.equal(await p.locator('a[href^="https://t.me/"]').count(), 0, 'bot sozlanmagan — Telegram tugmasi yo‘q');
    await p.locator('#web').click();
    await p.waitForURL(/\/\?ref=[a-z2-9]+&cid=[a-f0-9]{16}#\//);
    await p.waitForSelector('.w-hero', { timeout: 10000 });
    const ls = await p.evaluate(() => ({ ref: localStorage.getItem('bandly.ref'), first: localStorage.getItem('bandly.ref.first'), cid: localStorage.getItem('bandly.cid') }));
    assert.ok(ls.ref?.includes(link.code) && ls.first?.includes(link.code) && /[a-f0-9]{16}/.test(ls.cid ?? ''), 'ref, first-touch va click identifikatori saqlandi');
    await p.locator('.w-hero a.btn.primary').first().click();   // signup_start (click bilan bog'lanadi); sahifa link tilida (ru), shuning uchun matn emas, element bo'yicha
    await p.waitForURL(/#\/login/); await p.waitForTimeout(500);
    const nick = p.locator('input[type=text][maxlength="20"]').first(); await nick.fill('E2E Talaba'); await nick.press('Enter'); // til (ru) va matndan mustaqil
    await p.waitForURL(/#\/start/);
    const ov = (await api('/api/creator/overview?days=30', { token: crT })).json;
    assert.equal(ov.funnel.signups, 1, 'ro‘yxatdan o‘tish creator voronkasida'); assert.equal(ov.funnel.uniqueClicks, 1); assert.equal(ov.funnel.landingViews, 1, 'bridge JS ko‘rishi'); assert.equal(ov.funnel.signupStarts, 1, 'signup_start click bilan bog‘landi');
    assert.equal(ov.links[0].signups, 1);
    // Creator kabineti (brauzerda): link va voronka ko'rinadi, o'quvchi ma'lumoti yo'q
    const c = await page(() => undefined, { 'bandly.account.v1': JSON.stringify({ token: crT, nickname: 'E2E Creator' }) });
    await c.goto(`${base}/#/creator`); await c.getByText('Batafsil statistika').click(); await c.getByText('Havolalar va voronka').waitFor({ timeout: 10000 });
    await c.getByText('E2E Reel').first().waitFor({ timeout: 8000 });
    assert.match(await text(c), /Voronka/); assert.match(await text(c), new RegExp(`/r/${link.code}`), 'qisqa havola ko‘rsatiladi');
    assert.doesNotMatch(await text(c), /E2E Talaba/, 'creator o‘quvchi laqabini ko‘rmaydi');
    await p.context().close(); await c.context().close();
  });

  await step('J. Hamkorlik: mehmon bosh sahifadan hamkorlik sahifasiga o‘tadi, ariza qoldiradi → admin «Arizalar»da ko‘radi', async () => {
    const g = await page();
    await g.goto(`${base}/#/welcome`);
    await g.locator('a.partner-promo').click();
    await g.getByRole('heading', { name: 'Sellzen haqida video qiling — pul ishlang' }).waitFor({ timeout: 8000 });
    await g.getByRole('heading', { name: 'Bitta video uchun qancha olasiz?' }).waitFor({ timeout: 8000 });
    // Egasining 3 ta misoli: bonuslar ustma-ust qo'shilmaydi
    const ex = (await g.locator('.vp-examples').innerText()).replace(/[\s\u00a0\u202f]+/g, ' ');
    assert.match(ex, /9 999 ko‘rish, 49 o‘quvchi faqat video uchun 50 000 so‘m/, '1-misol: normaga yetmagan — faqat video uchun');
    assert.match(ex, /99 000 ko‘rish, 99 o‘quvchi 50 000 \+ 50 000 \+ 50 000 = 150 000 so‘m/, '2-misol');
    assert.match(ex, /100 000 ko‘rish, 100 o‘quvchi 50 000 \+ 200 000 \+ 150 000 = 400 000 so‘m/, '3-misol: eng yuqori');
    assert.match((await g.locator('.vp-month').innerText()).replace(/[\s\u00a0\u202f]+/g, ' '), /15 × 400 000 = 6 000 000 so‘mgacha/, 'oyiga 15 video');
    assert.ok(await g.getByText('Summa tasdiqlangach 14 kun ichida to‘lanadi.').count(), 'to‘lov muddati ko‘rinadi');
    await g.getByLabel('Ismingiz').fill('E2E Bloger');
    await g.getByLabel('Sahifangiz yoki kanalingiz').fill('tiktok.com/@e2e.bloger');
    await g.getByLabel('Obunachilar soni').selectOption('10k-100k');
    await g.getByLabel('Telegram yoki telefon').fill('@e2e_bloger');
    const send = g.getByRole('button', { name: 'Ariza yuborish' });
    assert.ok(await send.isDisabled(), 'rozilikdan oldin yuborib bo‘lmaydi');
    await g.getByLabel('Ma’lumotlarimni hamkorlik bo‘yicha bog‘lanish uchun ishlatishga roziman').check();
    await send.click();
    await g.getByText('Arizangiz qabul qilindi').waitFor({ timeout: 8000 });
    const a = await page(() => undefined, { 'bandly.account.v1': JSON.stringify({ token: adminToken, nickname: 'E2E Admin' }) });
    await a.goto(`${base}/#/admin`);
    await a.getByRole('tab', { name: 'Hamkorlar' }).click();
    await a.getByRole('tab', { name: 'Arizalar' }).click();
    await a.getByText('E2E Bloger').waitFor({ timeout: 8000 });
    assert.ok(await a.getByText('@e2e_bloger').count(), 'aloqa ko‘rinadi');
    await a.getByLabel('Holat').first().selectOption('contacted');
    await a.getByText('Saqlandi').waitFor({ timeout: 8000 });
    const apps = (await api('/api/staff/partners', { token: adminToken })).json.apps as { name: string; status: string }[];
    assert.equal(apps.find((x) => x.name === 'E2E Bloger')?.status, 'contacted');
    // Admin video to'lov shartlarini tahrirlaydi — hamkorlik sahifasi yangi qiymatni ko'rsatadi
    await a.getByRole('tab', { name: 'Video to‘lovlari' }).click();
    await a.getByText('Shartlarni o‘zgartirish').click();
    await a.getByLabel('Instagram sahifamiz').fill('sellzen.uz');
    await a.getByRole('button', { name: 'Shartlarni saqlash' }).click();
    await a.getByText('Shartlar saqlandi').waitFor({ timeout: 8000 });
    assert.equal((await api('/api/partners/terms')).json.video.instagram, 'sellzen.uz');
    await g.goto(`${base}/#/partners`); await g.reload();
    await g.getByText('Videoda Instagram sahifamizni belgilang: @sellzen.uz.').waitFor({ timeout: 8000 });
  });

  await step('K. Admin paneli: hamkor mukofot qoidasi — so‘mda yaratish, tahrirlash, yoqish; kredit rejimi «Limitlar»da', async () => {
    const a = await page(() => undefined, { 'bandly.account.v1': JSON.stringify({ token: adminToken, nickname: 'E2E Admin' }) });
    await a.goto(`${base}/#/admin`);
    await a.getByRole('tab', { name: 'Hamkorlar' }).click();
    await a.getByRole('tab', { name: 'Mukofot daftari' }).click();
    await a.getByText('Hali qoida yo‘q').waitFor({ timeout: 8000 });
    // Summalar SO'MDA: 50 000 so'm → serverda 5 000 000 tiyin
    await a.getByPlaceholder('Qoida nomi').fill('E2E faollashgan');
    await a.getByPlaceholder('Summa, so‘m').fill('50000'); await a.getByPlaceholder('Kutish, kun').fill('0'); await a.getByPlaceholder('Muddat, kun').fill('90');
    await a.getByPlaceholder('Hamkor chegarasi, so‘m').fill('200000'); await a.getByPlaceholder('Umumiy byudjet, so‘m').fill('1000000');
    await a.getByRole('button', { name: 'Qoida yaratish' }).click();
    await a.getByText('E2E faollashgan').first().waitFor({ timeout: 8000 });
    let rules = ((await api('/api/creatoradmin/rules', { token: adminToken })).json.rules ?? []) as { name: string; amountMinor: number; capPerCreatorMinor: number; budgetMinor: number; holdDays: number; windowDays: number; enabled: boolean }[];
    let r = rules.find((x) => x.name === 'E2E faollashgan')!;
    assert.deepEqual([r.amountMinor, r.capPerCreatorMinor, r.budgetMinor, r.holdDays, r.windowDays, r.enabled], [5_000_000, 20_000_000, 100_000_000, 0, 90, false], 'so‘m → tiyin; qoida o‘chiq (qoralama) yaratildi');
    // Tahrirlash: summa 70 000 so'm
    await a.getByRole('button', { name: 'Tahrirlash' }).first().click();
    await a.getByPlaceholder('Summa, so‘m').fill('70000');
    await a.getByRole('button', { name: 'Saqlash' }).click();
    for (let i = 0; i < 40; i++) { rules = ((await api('/api/creatoradmin/rules', { token: adminToken })).json.rules ?? []); r = rules.find((x) => x.name === 'E2E faollashgan')!; if (r.amountMinor === 7_000_000) break; await a.waitForTimeout(150); }
    assert.equal(r.amountMinor, 7_000_000, 'tahrirlangan summa saqlandi'); assert.equal(r.capPerCreatorMinor, 20_000_000, 'boshqa shartlar o‘zgarmadi');
    // Yoqish: "Egasi tasdiqlagan" belgisisiz yoqilmaydi; belgilansa yoqiladi
    await a.getByRole('button', { name: 'Yoqish' }).first().click(); await a.waitForTimeout(400);
    assert.equal(((await api('/api/creatoradmin/rules', { token: adminToken })).json.rules as { enabled: boolean }[])[0]!.enabled, false, 'egasi tasdig‘isiz yoqilmaydi');
    await a.getByLabel('Egasi tasdiqlagan').check(); await a.getByRole('button', { name: 'Yoqish' }).first().click();
    for (let i = 0; i < 40; i++) { if (((await api('/api/creatoradmin/rules', { token: adminToken })).json.rules as { enabled: boolean }[])[0]!.enabled) break; await a.waitForTimeout(150); }
    assert.equal(((await api('/api/creatoradmin/rules', { token: adminToken })).json.rules as { enabled: boolean }[])[0]!.enabled, true, 'tasdiqlangach qoida yoqildi');
    assert.match(await text(a), /oxirgi bosilgan havola/, 'kredit rejimi ko‘rsatiladi');
    // Kredit rejimi — Limitlar bo'limida (admin boshqaradi)
    await a.getByRole('tab', { name: 'Limitlar' }).click();
    await a.locator('.limit-tabs').getByRole('tab', { name: 'Bonuslar' }).click(); // 2026-11-24: Limitlar bo'limlarga ajratilgan
    await a.getByText('Creator (hamkor) dasturi').waitFor({ timeout: 8000 });
    assert.match(await text(a), /Creator krediti: qaysi havola hisobga olinadi/);
    await a.context().close();
  });

  await step('L. Elchi: kabinetdagi elchi havolasi → bloger kiradi, ariza qoldiradi (1 000 dan kam — yo‘q) → elchi kabinetida va admin arizasida ko‘rinadi', async () => {
    const mk = async (nickname: string) => String((await api('/api/join', { method: 'POST', body: JSON.stringify({ nickname }) })).json.token);
    const elT = await mk('E2E Elchi'), blT = await mk('E2E Elchi Bloger');
    assert.equal((await api('/api/staff/role', { method: 'POST', token: adminToken, body: JSON.stringify({ nickname: 'E2E Elchi', role: 'creator' }) })).status, 200);
    const el = await page(() => undefined, { 'bandly.account.v1': JSON.stringify({ token: elT, nickname: 'E2E Elchi' }) });
    await el.goto(`${base}/#/creator`);
    await el.getByRole('heading', { name: 'Elchi: blogerlarni olib keling' }).waitFor({ timeout: 10000 });
    const cab = (await el.locator('.elchi-card').innerText()).replace(/[\s  ]+/g, ' ');
    assert.match(cab, /Har faol bloger uchun 25 000 so‘m\. Oyda 5 ta — \+50 000 so‘m\. Oyda 10 ta — \+150 000 so‘m\./, 'egasi tasdiqlagan summalar');
    const link = (await el.locator('.elchi-card code').innerText()).trim();
    assert.match(link, /#\/partners\?elchi=[a-z2-9]{6,10}$/);
    // Mehmon: elchi havolasi — avval kirish kerak
    const g = await page();
    await g.goto(link.replace(/^https?:\/\/[^/]+/, base));
    await g.getByRole('heading', { name: 'Video qilmaysizmi? Elchi bo‘ling' }).waitFor({ timeout: 8000 });
    await g.getByText('Sizni Sellzen elchisi taklif qildi.').waitFor({ timeout: 8000 });
    assert.equal(await g.getByRole('button', { name: 'Ariza yuborish' }).count(), 0, 'mehmon elchi havolasi bilan ariza yubormaydi');
    assert.ok(await g.getByRole('link', { name: 'Kirish va ariza yuborish' }).count(), 'kirish havolasi');
    await g.context().close();
    // Bloger hisobi bilan
    const b = await page(() => undefined, { 'bandly.account.v1': JSON.stringify({ token: blT, nickname: 'E2E Elchi Bloger' }) });
    await b.goto(link.replace(/^https?:\/\/[^/]+/, base));
    await b.getByText('Sizni Sellzen elchisi taklif qildi.').waitFor({ timeout: 8000 });
    await b.getByLabel('Ismingiz').fill('E2E Elchi Bloger');
    await b.getByLabel('Sahifangiz yoki kanalingiz').fill('instagram.com/e2e.elchi.bloger');
    await b.getByLabel('Telegram yoki telefon').fill('@e2e_elchi_bloger');
    await b.getByLabel('Ma’lumotlarimni hamkorlik bo‘yicha bog‘lanish uchun ishlatishga roziman').check();
    await b.getByLabel('Obunachilar soni').selectOption('<1k');
    await b.getByText('Video uchun hamkorlikka kamida 1 000 obunachi kerak.', { exact: false }).waitFor({ timeout: 5000 });
    assert.ok(await b.getByRole('button', { name: 'Ariza yuborish' }).isDisabled(), '1 000 dan kam — yuborib bo‘lmaydi');
    await b.getByLabel('Obunachilar soni').selectOption('1k-10k');
    await b.getByRole('button', { name: 'Ariza yuborish' }).click();
    await b.getByText('Arizangiz qabul qilindi').waitFor({ timeout: 8000 });
    await b.context().close();
    const info = (await api('/api/creator/elchi', { token: elT })).json;
    assert.deepEqual(info.bloggers.map((x: { nickname: string; activeAt: number | null }) => [x.nickname, x.activeAt]), [['E2E Elchi Bloger', null]], 'bloger elchiga bog‘landi, hali faol emas');
    const apps = (await api('/api/staff/partners', { token: adminToken })).json.apps as { name: string; elchi: string | null }[];
    assert.equal(apps.find((x) => x.name === 'E2E Elchi Bloger')?.elchi, 'E2E Elchi', 'admin arizada elchini ko‘radi');
    await el.reload();
    await el.getByText('birinchi video kutilmoqda').waitFor({ timeout: 8000 });
    await el.context().close();
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
