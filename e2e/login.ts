// Kirish E2E (Playwright): Telegram sozlangan server (soxta bot tokeni; Telegram tarmog'iga chiqilmaydi) + qurilgan sayt, 390 px mobil.
//   H1. Telegram vidjeti (soxta skript imzolangan foydalanuvchini sellzenTgAuth ga uzatadi) → kirildi
//   H2. Vidjet domeni mos emas (BotFather domeni boshqa manzil) → vidjet ko'rsatilmaydi, asosiy manzilga havola va bot tugmasi bor
//   H3. Bot orqali kirish: tugma → t.me havolasi → sahifa QAYTA YUKLANADI (brauzer xotiradan chiqargan holat) → botda tasdiqlash → o'zi kiradi
//   H4. Vidjet skripti yuklanmasa (telegram.org yopiq) → tushunarli xabar + anonim hisoblagich
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright') as typeof import('playwright');
if (!existsSync('dist/index.html')) throw new Error('dist/ yo‘q — avval `npm run build`');

const TOKEN = '123456:E2E_TOKEN_not_real_0123456789abcdef';
const dir = mkdtempSync(join(tmpdir(), 'sz-e2e-login-'));
const PORT = 36000 + Math.floor(Math.random() * 2000);
const base = `http://127.0.0.1:${PORT}`;
const env: NodeJS.ProcessEnv = {};
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE|PAY_DEMO/i.test(k)) env[k] = v;
Object.assign(env, { PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: join(dir, 'l.sqlite'), BACKUP_DISABLED: '1', NODE_ENV: 'test', TELEGRAM_BOT_TOKEN: TOKEN, TELEGRAM_BOT_USERNAME: 'Sellzenbot', PUBLIC_URL: 'https://www.sellzen.test' });
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));

const sign = (u: Record<string, string | number>) => createHmac('sha256', createHash('sha256').update(TOKEN).digest()).update(Object.keys(u).sort().map((k) => `${k}=${u[k]}`).join('\n')).digest('hex');
const webhookSecret = createHmac('sha256', 'bandly-webhook').update(TOKEN).digest('hex').slice(0, 48);
const hook = (update: unknown) => fetch(`${base}/api/telegram/webhook`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': webhookSecret }, body: JSON.stringify(update) });

const browser = await chromium.launch();
const problems: string[] = [];
let scenario = '';
const newPage = async () => {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: true });
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
    assert.equal(await p.locator('button:has-text("Telegram bot orqali kirish")').count(), 1, 'bot tugmasi ham bor');
    await p.locator('#fake-tg').click();
    await p.waitForURL(/#\/start/, { timeout: 10000 });
    const a = await account(p); assert.ok(a?.token && a.tg === true && a.nickname === 'vidjet_user');
    await ctx.close();
  });

  await step('H2. Vidjet domeni mos emas → vidjet yo‘q, havola va bot tugmasi bor', async () => {
    const { ctx, p } = await newPage();
    let widgetRequested = false;
    await p.route('https://telegram.org/js/telegram-widget.js**', (r) => { widgetRequested = true; return r.abort(); });
    await p.goto(`${base}/#/login`); await p.waitForTimeout(1800); // sahifa 127.0.0.1:PORT da, BotFather domeni www.sellzen.test
    const txt = await p.evaluate(() => document.querySelector('main')?.innerText ?? '');
    assert.equal(widgetRequested, false, 'noto‘g‘ri domenda vidjet yuklanmaydi ("Bot domain invalid" ko‘rsatilmaydi)');
    assert.match(txt, /www\.sellzen\.test/, 'asosiy manzil ko‘rsatiladi');
    assert.equal(await p.locator('a[href="https://www.sellzen.test/#/login"]').count(), 1, 'asosiy manzilga havola');
    assert.equal(await p.locator('button:has-text("Telegram bot orqali kirish")').isEnabled(), true);
    await ctx.close();
  });

  await step('H3. Bot orqali kirish: sahifa qayta yuklansa ham davom etadi', async () => {
    const { ctx, p } = await newPage();
    let tme = '';
    await ctx.route('https://t.me/**', (r) => { tme = r.request().url(); return r.fulfill({ contentType: 'text/html', body: 'tg' }); });
    await p.goto(`${base}/#/login`);
    await p.getByRole('button', { name: 'Telegram bot orqali kirish' }).click();
    for (let i = 0; i < 50 && !tme; i++) await p.waitForTimeout(100);
    const code = new URL(tme).searchParams.get('start')?.replace(/^login_/, '');
    assert.match(code ?? '', /^[a-f0-9]{32}$/, `t.me havolasi: ${tme}`);
    const pending = await p.evaluate(() => JSON.parse(localStorage.getItem('sz.botlogin') ?? 'null') as { poll: string; until: number } | null);
    assert.ok(pending && pending.poll !== code, 'maxfiy poll kaliti saqlandi va havoladagi koddan farq qiladi');
    // Android brauzer sahifani xotiradan chiqardi: qayta yuklash
    await p.reload(); await p.waitForTimeout(1200);
    assert.ok(/Botda tasdiqlang/.test(await p.evaluate(() => document.querySelector('main')?.innerText ?? '')), 'qaytganda kutish holati tiklandi');
    // Foydalanuvchi Telegram'da bot xabaridagi «Ha, kirish» ni bosadi
    const from = { id: 880002, first_name: 'Bot', username: 'bot_user' };
    assert.equal((await hook({ update_id: 1, message: { message_id: 1, chat: { id: 880002, type: 'private' }, from, text: `/start login_${code}` } })).status, 200);
    assert.equal((await hook({ update_id: 2, callback_query: { id: 'q1', from, data: `login:${code}`, message: { message_id: 5, chat: { id: 880002 } } } })).status, 200);
    for (let i = 0; i < 100 && !(await account(p)); i++) await p.waitForTimeout(150);
    const a = await account(p);
    assert.ok(a?.token && a.nickname === 'bot_user' && a.tg === true, 'bot orqali kirildi');
    assert.equal(await p.evaluate(() => localStorage.getItem('sz.botlogin')), null, 'kutish kaliti tozalandi');
    await ctx.close();
  });

  await step('H4. Vidjet skripti yuklanmasa → xabar va hisoblagich', async () => {
    const { ctx, p } = await newPage();
    await p.route('**/api/auth/config', (r) => r.fulfill({ json: { telegram: { bot: 'Sellzenbot', host: `127.0.0.1:${PORT}` } } }));
    await p.route('https://telegram.org/js/telegram-widget.js**', (r) => r.abort());
    let counted = false;
    p.on('request', (r) => { if (r.url().endsWith('/api/event') && /login_widget_missing/.test(r.postData() ?? '')) counted = true; });
    await p.goto(`${base}/#/login`);
    await p.getByText('Telegram tugmasi chiqmadi?').waitFor({ timeout: 12000 });
    for (let i = 0; i < 20 && !counted; i++) await p.waitForTimeout(100);
    assert.ok(counted, 'login_widget_missing hisoblagichi yuborildi');
    assert.equal(await p.locator('button:has-text("Telegram bot orqali kirish")').isEnabled(), true);
    await ctx.close();
  });

  assert.deepEqual(problems, [], 'JS xatosi yoki 5xx bo‘lmasligi kerak');
  console.log('e2e login: OK');
} catch (e) {
  console.error(`\n✗ ${scenario}\n`, e, '\n--- server log (oxiri) ---\n', log.slice(-1200), '\n', problems.join('\n'));
  process.exitCode = 1;
} finally {
  await browser.close(); srv.kill();
  rmSync(dir, { recursive: true, force: true });
}
