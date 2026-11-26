// Kirish E2E (Playwright): Telegram sozlangan server (soxta bot tokeni; Telegram tarmog'iga chiqilmaydi) + qurilgan sayt, 390 px mobil.
//   H1. Telegram vidjeti (soxta skript imzolangan foydalanuvchini sellzenTgAuth ga uzatadi) → kirildi
//   H2. Vidjet domeni mos emas (BotFather domeni boshqa manzil) → vidjet ko'rsatilmaydi, asosiy manzilga havola bor
//   H4. Vidjet skripti yuklanmasa (telegram.org yopiq) → tushunarli xabar + anonim hisoblagich (botga kirish yo'li olib tashlangan)
//   H5. Telefon raqam + parol: ro'yxatdan o'tish → chiqish → qayta kirish; xato parol → xabar
//   H6. Google: soxta GIS skripti + soxta JWKS (haqiqiy RS256 imzo): kirish; boshqa ilovaga berilgan token rad etiladi
//   H7. Hisob kodi bilan kirish bo'limi yo'q; bog'lanmagan hisob chiqishda ogohlantiriladi
//   H8. Parolni tiklash: botdan bir martalik havola → yangi parol; eski parol ishlamaydi; eskirgan havola aniq aytiladi
import assert from 'node:assert/strict';
import { createHash, createHmac, createSign, generateKeyPairSync } from 'node:crypto';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { saveBotPhone } from '../server/leads';
import { offerReset } from '../server/passwordReset';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright') as typeof import('playwright');
if (!existsSync('dist/index.html')) throw new Error('dist/ yo‘q — avval `npm run build`');

const TOKEN = '123456:E2E_TOKEN_not_real_0123456789abcdef';
const dir = mkdtempSync(join(tmpdir(), 'sz-e2e-login-'));
// Soxta Google JWKS (haqiqiy RS256 kalit juftligi): server tokenni xuddi Google'niki kabi tekshiradi
const GCLIENT = 'e2e-client.apps.googleusercontent.com';
const gkeys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwks = createServer((_q, r) => { r.setHeader('content-type', 'application/json'); r.setHeader('cache-control', 'max-age=600'); r.end(JSON.stringify({ keys: [{ ...gkeys.publicKey.export({ format: 'jwk' }), kid: 'e2e1', alg: 'RS256', use: 'sig' }] })); });
await new Promise<void>((r) => jwks.listen(0, '127.0.0.1', () => r()));
const jwksPort = (jwks.address() as { port: number }).port;
const gtoken = (claims: Record<string, unknown>) => { const b64 = (x: unknown) => Buffer.from(JSON.stringify(x)).toString('base64url'); const body = `${b64({ alg: 'RS256', kid: 'e2e1', typ: 'JWT' })}.${b64(claims)}`; return `${body}.${createSign('RSA-SHA256').update(body).sign(gkeys.privateKey).toString('base64url')}`; };
const gclaims = (over: Record<string, unknown> = {}) => ({ iss: 'https://accounts.google.com', aud: GCLIENT, sub: '104455667788990011223', exp: Math.floor(Date.now() / 1000) + 3600, iat: Math.floor(Date.now() / 1000) - 5, email: 'g@example.test', email_verified: true, given_name: 'Gulnora', ...over });
const PORT = 36000 + Math.floor(Math.random() * 2000);
const base = `http://127.0.0.1:${PORT}`;
const env: NodeJS.ProcessEnv = {};
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE|PAY_DEMO/i.test(k)) env[k] = v;
Object.assign(env, { PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: join(dir, 'l.sqlite'), BACKUP_DISABLED: '1', NODE_ENV: 'test', TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'Sellzenbot', PUBLIC_URL: 'https://www.sellzen.test', GOOGLE_CLIENT_ID: GCLIENT, GOOGLE_JWKS_URL: `http://127.0.0.1:${jwksPort}/certs` });
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));

const sign = (u: Record<string, string | number>) => createHmac('sha256', createHash('sha256').update(TOKEN).digest()).update(Object.keys(u).sort().map((k) => `${k}=${u[k]}`).join('\n')).digest('hex');

const browser = await chromium.launch();
const problems: string[] = [];
let scenario = '';
const newPage = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
  await ctx.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({ contentType: 'application/javascript', body: '/* test: Google skripti yuklanmadi */' })); // tarmoqqa chiqilmaydi; H6 o'zinikini qo'yadi
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(`${scenario}: JS xato ${e.message.slice(0, 160)}`));
  p.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 500) problems.push(`${scenario}: HTTP ${r.status()} ${r.url().slice(base.length)}`); });
  return { ctx, p };
};
const step = async (name: string, fn: () => Promise<void>) => { scenario = name; const t0 = Date.now(); await fn(); console.log(`  ✓ ${name} (${Date.now() - t0} ms)`); };
const account = (p: import('playwright').Page) => p.evaluate(() => JSON.parse(localStorage.getItem('bandly.account.v1') ?? 'null') as { token: string; nickname: string; tg?: boolean } | null);

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/api/auth/config`)).ok) break; } catch { /* hali ishga tushmoqda */ }
    if (i > 150 || srv.exitCode !== null) throw new Error('server ishga tushmadi:\n' + log);
    await new Promise((r) => setTimeout(r, 200));
  }
  const cfg = await (await fetch(`${base}/api/auth/config`)).json() as { telegram: { bot: string; host: string } | null };
  assert.equal(cfg.telegram?.bot, 'Sellzenbot'); assert.equal(cfg.telegram?.host, 'www.sellzen.test', 'config vidjet domenini (PUBLIC_URL) qaytaradi');

  await step('H1. Telegram vidjeti → kirildi', async () => {
    const { ctx, p } = await newPage();
    await p.route('**/api/auth/config', (r) => r.fulfill({ json: { telegram: { bot: 'Sellzenbot', host: `127.0.0.1:${PORT}` } } })); // domen mos
    const user: Record<string, string | number> = { id: 880001, first_name: 'Vidjet', username: 'vidjet_user', auth_date: Math.floor(Date.now() / 1000) }; user.hash = sign(user);
    await p.route('https://telegram.org/js/telegram-widget.js**', (r) => r.fulfill({ contentType: 'application/javascript', body: `document.currentScript.insertAdjacentHTML('beforebegin','<button id="fake-tg" type="button">Log in with Telegram</button>'); document.addEventListener('click', (e) => { if (e.target && e.target.id === 'fake-tg') window.sellzenTgAuth(${JSON.stringify(user)}); });` }));
    await p.goto(`${base}/#/login`);
    await p.locator('#fake-tg').waitFor({ timeout: 8000 });
    assert.equal(await p.locator('button:has-text("Telegram bot orqali kirish")').count(), 0, 'botga kirish tugmasi yo‘q (olib tashlangan)');
    await p.locator('#fake-tg').click();
    await p.waitForURL(/#\/start/, { timeout: 10000 });
    const a = await account(p); assert.ok(a?.token && a.tg === true && a.nickname === 'vidjet_user');
    await ctx.close();
  });

  await step('H2. Vidjet domeni mos emas → vidjet yo‘q, asosiy manzilga havola bor', async () => {
    const { ctx, p } = await newPage();
    let widgetRequested = false;
    await p.route('https://telegram.org/js/telegram-widget.js**', (r) => { widgetRequested = true; return r.abort(); });
    await p.goto(`${base}/#/login`); await p.waitForTimeout(1800); // sahifa 127.0.0.1:PORT da, BotFather domeni www.sellzen.test
    const txt = await p.evaluate(() => document.querySelector('main')?.innerText ?? '');
    assert.equal(widgetRequested, false, 'noto‘g‘ri domenda vidjet yuklanmaydi ("Bot domain invalid" ko‘rsatilmaydi)');
    assert.match(txt, /www\.sellzen\.test/, 'asosiy manzil ko‘rsatiladi');
    assert.equal(await p.locator('a[href="https://www.sellzen.test/#/login"]').count(), 1, 'asosiy manzilga havola');
    assert.equal(await p.locator('button:has-text("Telegram bot orqali kirish")').count(), 0);
    await ctx.close();
  });

  await step('H4. Vidjet skripti yuklanmasa → xabar va hisoblagich', async () => {
    const { ctx, p } = await newPage();
    await p.route('**/api/auth/config', (r) => r.fulfill({ json: { phone: true, telegram: { bot: 'Sellzenbot', host: `127.0.0.1:${PORT}` } } }));
    await p.route('https://telegram.org/js/telegram-widget.js**', (r) => r.abort());
    let counted = false;
    p.on('request', (r) => { if (r.url().endsWith('/api/event') && /login_widget_missing/.test(r.postData() ?? '')) counted = true; });
    await p.goto(`${base}/#/login`);
    await p.getByText('Telegram tugmasi chiqmadi?').waitFor({ timeout: 12000 });
    for (let i = 0; i < 20 && !counted; i++) await p.waitForTimeout(100);
    assert.ok(counted, 'login_widget_missing hisoblagichi yuborildi');
    assert.equal(await p.locator('details.alt-phone summary').count(), 1, 'boshqa usul (telefon) mavjud');
    await ctx.close();
  });

  await step('H5. Telefon raqam + parol: ro‘yxatdan o‘tish → chiqish → qayta kirish', async () => {
    const { ctx, p } = await newPage();
    await p.goto(`${base}/#/login`);
    await p.locator('details.alt-phone summary').click();
    await p.getByRole('button', { name: 'Ro‘yxatdan o‘tish', exact: true }).first().click();
    await p.getByPlaceholder('+998 90 123 45 67').fill('+998 90 777 88 99');
    await p.getByPlaceholder('Parol (kamida 8 belgi)').fill('mening-parolim-1');
    await p.getByPlaceholder('Ismingiz (ixtiyoriy)').fill('Telefon E2E');
    await p.locator('form button[type=submit]').click();
    for (let i = 0; i < 60 && !(await account(p)); i++) await p.waitForTimeout(150);
    const a = await account(p); assert.ok(a?.token && a.nickname === 'Telefon E2E' && a.tg === true, 'ro‘yxatdan o‘tildi');
    // Chiqish (qurilmadan) va qayta kirish: boshqa formatdagi raqam bilan
    await p.evaluate(() => { localStorage.removeItem('bandly.account.v1'); });
    await p.goto(`${base}/#/login`); await p.reload();
    await p.locator('details.alt-phone summary').click();
    await p.getByPlaceholder('+998 90 123 45 67').fill('90 777 88 99');
    await p.getByPlaceholder('Parol', { exact: true }).fill('xato-parol-123');
    await p.locator('form button[type=submit]').click();
    await p.locator('.alt-login .notice').waitFor({ timeout: 8000 });
    assert.match(await p.locator('.alt-login .notice').innerText(), /noto‘g‘ri/, 'xato parol — tushunarli xabar');
    assert.equal(await account(p), null, 'xato parol bilan kirilmadi');
    await p.getByPlaceholder('Parol', { exact: true }).fill('mening-parolim-1');
    await p.locator('form button[type=submit]').click();
    for (let i = 0; i < 60 && !(await account(p)); i++) await p.waitForTimeout(150);
    const b = await account(p); assert.ok(b?.token && b.nickname === 'Telefon E2E' && b.token !== a!.token, 'qayta kirildi (o‘sha hisob, yangi sessiya)');
    await ctx.close();
  });

  await step('H6. Google: kirish va boshqa ilovaga berilgan tokenni rad etish', async () => {
    const { ctx, p } = await newPage();
    await ctx.route('https://accounts.google.com/gsi/client', (r) => r.fulfill({ contentType: 'application/javascript', body: `window.__gcb = null; window.google = { accounts: { id: {
      initialize: (o) => { window.__gcb = o.callback; },
      renderButton: (el) => { el.innerHTML = '<button id="fake-google" type="button">Google</button>'; el.querySelector('button').addEventListener('click', () => window.__gcb({ credential: window.__gtoken })); } } } };` }));
    const run = async (token: string) => { await p.evaluate((t) => { (window as unknown as { __gtoken: string }).__gtoken = t; }, token); await p.locator('#fake-google').click(); };
    await p.goto(`${base}/#/login`);
    await p.locator('#fake-google').waitFor({ timeout: 8000 });
    await run(gtoken(gclaims({ aud: 'boshqa-ilova.apps.googleusercontent.com' })));
    await p.locator('.alt-login .notice').waitFor({ timeout: 8000 });
    assert.equal(await account(p), null, 'boshqa ilovaga berilgan token bilan kirilmadi');
    await run(gtoken(gclaims()));
    for (let i = 0; i < 60 && !(await account(p)); i++) await p.waitForTimeout(150);
    const a = await account(p); assert.ok(a?.token && a.nickname === 'Gulnora' && a.tg === true, 'Google bilan kirildi');
    await ctx.close();
  });

  await step('H7. Hisob kodi bilan kirish yo‘q; bog‘lanmagan hisob chiqishdan oldin ogohlantiriladi', async () => {
    const { ctx, p } = await newPage();
    await p.goto(`${base}/#/login`);
    await p.locator('.alt-login, .join-form, main').first().waitFor({ timeout: 8000 });
    const txt = await p.evaluate(() => document.querySelector('main')?.innerText ?? '');
    assert.doesNotMatch(txt, /hisob kodi|account code|код аккаунта/i, 'kirish sahifasida hisob kodi bo‘limi yo‘q');
    assert.equal(await p.locator('main input[placeholder*="kod" i], main details:has-text("kod")').count(), 0, 'kod kiritish maydoni yo‘q');
    // Eski (hech narsaga bog'lanmagan) hisobni taqlid qilamiz: haqiqiy sessiya tokeni, lekin tg bayrog'isiz
    const r = await fetch(`${base}/api/auth/phone/register`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ phone: '+998901112233', password: 'eski-hisob-parol-1', nickname: 'Eski E2E' }) });
    const reg = await r.json() as { token: string; nickname: string };
    await p.evaluate((a) => localStorage.setItem('bandly.account.v1', JSON.stringify({ token: a.token, nickname: a.nickname })), reg);
    await p.goto(`${base}/#/profile`); await p.reload();
    await p.getByRole('button', { name: 'Chiqish' }).first().click();
    const dlg = p.locator('[role=dialog]');
    await dlg.waitFor({ timeout: 8000 });
    const d = await dlg.innerText();
    assert.match(d, /bog‘lanmagan/, 'bog‘lanmagan hisob haqida ogohlantirish');
    assert.equal(await dlg.locator('a[href="#/profile"]').count(), 1, '«Hisobni bog‘lash» havolasi');
    assert.doesNotMatch(d, /nusxa|kod/i, 'chiqish oynasida hisob kodi nusxalash yo‘q');
    await ctx.close();
  });

  await step('H8. Parolni tiklash: botdan kelgan bir martalik havola → yangi parol → eski parol ishlamaydi; eskirgan havola aniq aytiladi', async () => {
    const phone = '+998907776655', post = (path: string, body: unknown) => fetch(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    assert.equal((await post('/api/auth/phone/register', { phone, password: 'birinchi-parol-1', nickname: 'Reset E2E' })).status, 200);
    // Bot: o'quvchi Telegram'da o'z raqamini ulashgan (Telegram tasdiqlagan) → bot bir martalik havola yaratadi
    const db = new DatabaseSync(join(dir, 'l.sqlite'));
    saveBotPhone(db, 424242, phone); const o = offerReset(db, 424242); db.close();
    assert.ok(o.ok);
    const { ctx, p } = await newPage();
    await p.goto(`${base}/#/login`);
    await p.getByText('Telefon raqam va parol bilan').click();
    assert.equal(await p.locator('a.forgot[href="https://t.me/Sellzenbot?start=reset"]').count(), 1, 'kirish oynasida «Parolni unutdingizmi?» havolasi');
    await p.goto(`${base}/#/reset?t=${'0'.repeat(48)}`);
    await p.getByText('Havola eskirgan yoki allaqachon ishlatilgan').waitFor({ timeout: 8000 });
    await p.goto(`${base}/#/reset?t=${o.ok ? o.token : ''}`); await p.reload();
    await p.getByPlaceholder('Yangi parol (kamida 8 belgi)').fill('ikkinchi-parol-2');
    await p.getByPlaceholder('Parolni takrorlang').fill('ikkinchi-parol-2');
    await p.getByRole('button', { name: 'Parolni saqlash' }).click();
    await p.getByText('Parol yangilandi. Hisobingizga kirdingiz.').waitFor({ timeout: 8000 });
    assert.equal((await post('/api/auth/phone/login', { phone, password: 'birinchi-parol-1' })).status, 401, 'eski parol ishlamaydi');
    assert.equal((await post('/api/auth/phone/login', { phone, password: 'ikkinchi-parol-2' })).status, 200, 'yangi parol bilan kiriladi');
    await ctx.close();
  });

  assert.deepEqual(problems, [], 'JS xatosi yoki 5xx bo‘lmasligi kerak');
  console.log('e2e login: OK');
} catch (e) {
  console.error(`\n✗ ${scenario}\n`, e, '\n--- server log (oxiri) ---\n', log.slice(-1200), '\n', problems.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close(); srv.kill(); jwks.close();
  rmSync(dir, { recursive: true, force: true });
}
