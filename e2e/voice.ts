// Ovozli ustoz E2E (Playwright): haqiqiy server + qurilgan sayt + SOXTA Gemini Live serveri + soxta mikrofon (fayldan), 390 px mobil.
// Haqiqiy AI xarajati, haqiqiy foydalanuvchi ma'lumoti ishlatilmaydi.
//   J1. Qo'ng'iroq ochiladi: taymer "0:xx / 5:00"; tugma bosilmaguncha Gemini'ga hech narsa (ovoz ham) bormaydi
//   J2. Avatarni bosib turish: activityStart → ovoz → qo'yib yuborish → activityEnd; ustoz javobi ekranda, hissiyot (yurak) va "Siz/Sellzen" matni
//   J3. Probel (Space) bosib turish — desktopdagi kabi; ustoz gapirayotganda bosish — ustozni to'xtatadi (ataylab)
//   J4. Qisqa tegish — qulf: yozuv davom etadi, yana tegish tugatadi
//   J5. Ovoz yo'q (jim mikrofon): bo'sh navbat yuborilmaydi, "Ovoz eshitilmadi" xabari
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocketServer } from 'ws';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright') as typeof import('playwright');
if (!existsSync('dist/index.html')) throw new Error('dist/ yo‘q — avval `npm run build`');

const dir = mkdtempSync(join(tmpdir(), 'sz-e2e-voice-'));
// Soxta mikrofon fayli: 48 kHz mono 16-bit, 3 soniya "gap" (bo'g'inlar) yoki jimlik
const wav = (name: string, loud: boolean): string => {
  const rate = 48000, n = rate * 3; const buf = Buffer.alloc(44 + n * 2);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  // "Gap" — bo'g'inlar: 330 ms ovoz (turli balandlik, garmonikalar) + 170 ms pauza. Barqaror ton emas: WebRTC shovqin bostirgichi barqaror tonni shovqin deb o'chirib yuboradi.
  const f0s = [140, 200, 170, 230, 150, 210];
  for (let i = 0; i < n; i++) {
    const t = i / rate, syl = Math.floor(t / 0.5), local = t - syl * 0.5;
    let v = 0;
    if (loud && local < 0.33) { const env = Math.sin(Math.PI * local / 0.33) ** 0.6, f0 = f0s[syl % f0s.length]!; for (let h = 1; h <= 8; h++) v += Math.sin(2 * Math.PI * f0 * h * t + h) / h; v *= 0.33 * env / 2.2; }
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v)) * 32767), 44 + i * 2);
  }
  const f = join(dir, name); writeFileSync(f, buf); return f;
};
const LOUD = wav('talk.wav', true), QUIET = wav('quiet.wav', false);

// ---- Soxta Gemini Live ----
const seen: { t: number; kind: string; setup?: Record<string, any> }[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
const T0 = Date.now();
let speakingTimer: ReturnType<typeof setInterval> | null = null;
const tone = (ms: number): string => { const n = Math.round(24 * ms); const b = Buffer.alloc(n * 2); for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.sin(i / 9) * 9000), i * 2); return b.toString('base64'); };
const up = new WebSocketServer({ port: 0 });
up.on('connection', (ws) => {
  const say = (text: string, chunks: number, last = true) => {
    let i = 0;
    if (speakingTimer) clearInterval(speakingTimer);
    speakingTimer = setInterval(() => {
      if (i === 0) ws.send(JSON.stringify({ serverContent: { outputTranscription: { text } } }));
      ws.send(JSON.stringify({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: tone(400) } }] } } }));
      if (++i >= chunks) { clearInterval(speakingTimer!); speakingTimer = null; if (last) ws.send(JSON.stringify({ serverContent: { turnComplete: true } })); }
    }, 380);
  };
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.setup) { seen.push({ t: Date.now() - T0, kind: 'setup', setup: m.setup }); ws.send(JSON.stringify({ setupComplete: {} })); return; }
    if (m.clientContent) { seen.push({ t: Date.now() - T0, kind: 'kickoff' }); say('Salom! Bugun nima haqida gaplashamiz?', 2); return; }
    const ri = m.realtimeInput;
    if (ri?.audio) { seen.push({ t: Date.now() - T0, kind: 'audio' }); return; }
    if (ri?.activityStart) { seen.push({ t: Date.now() - T0, kind: 'start' }); if (speakingTimer) { clearInterval(speakingTimer); speakingTimer = null; ws.send(JSON.stringify({ serverContent: { interrupted: true } })); } return; }
    if (ri?.activityEnd) {
      seen.push({ t: Date.now() - T0, kind: 'end' });
      ws.send(JSON.stringify({ serverContent: { inputTranscription: { text: 'teach me English, I go to school yesterday' } } }));
      setTimeout(() => say('Qoyil! Juda zo‘r gapirdingiz, endi shu gapni to‘liq ayting.', 9), 200); // uzun javob (~3.4 s): gapirayotganda bosib to'xtatish mumkin
    }
  });
});
await new Promise((r) => up.once('listening', r));
const upPort = (up.address() as { port: number }).port;

// ---- Soxta AI (faqat holat uchun) ----
const ai = createServer((req, res) => { req.resume(); req.on('end', () => { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ choices: [{ message: { content: '{}' } }], usage: { prompt_tokens: 1, completion_tokens: 1 } })); }); });
await new Promise<void>((r) => ai.listen(0, '127.0.0.1', () => r()));
const aiPort = (ai.address() as { port: number }).port;

const PORT = 38000 + Math.floor(Math.random() * 2000);
const base = `http://127.0.0.1:${PORT}`;
const env: NodeJS.ProcessEnv = {};
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE|PAY_DEMO/i.test(k)) env[k] = v;
Object.assign(env, {
  PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: join(dir, 'v.sqlite'), BACKUP_DISABLED: '1', NODE_ENV: 'test',
  AI_PROVIDER: 'openai', AI_API_KEY: 'sk-e2e-not-real', AI_MODEL: 'e2e-model', AI_FALLBACK_MODEL: ' ', AI_BASE_URL: `http://127.0.0.1:${aiPort}`, AI_GLOBAL_DAILY_CALLS: '100',
  GEMINI_LIVE_KEY: 'e2e-fake-live-key', GEMINI_LIVE_URL: `ws://127.0.0.1:${upPort}`, GEMINI_LIVE_MODEL: 'e2e-live', GEMINI_LIVE_FALLBACK_MODEL: ' ',
});
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));

const problems: string[] = [];
let scenario = '';
const step = async (name: string, fn: () => Promise<void>) => { scenario = name; const t0 = Date.now(); await fn(); console.log(`  ✓ ${name} (${Date.now() - t0} ms)`); };
const kinds = (from = 0) => seen.filter((s) => s.t >= from && s.kind !== 'setup').map((s) => s.kind);
const count = (kind: string, from = 0) => seen.filter((s) => s.kind === kind && s.t >= from).length;
const now = () => Date.now() - T0;
const waitCount = async (kind: string, n: number, from: number, ms = 4000) => { for (let i = 0; i < ms / 50; i++) { if (count(kind, from) >= n) return; await wait(50); } assert.fail(`${kind} ${n} marta kelmadi (${count(kind, from)}): ${kinds(from).join(',')}`); };
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const args = (f: string) => ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${f}`, '--autoplay-policy=no-user-gesture-required'];
const browsers: import('playwright').Browser[] = [];

async function openCall(f: string, token: string) {
  const b = await chromium.launch({ args: args(f) }); browsers.push(b);
  const ctx = await b.newContext({ viewport: { width: 390, height: 800 }, isMobile: true, hasTouch: false, permissions: ['microphone'], deviceScaleFactor: 1 });
  await ctx.addInitScript(([t]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('bandly.account.v1', JSON.stringify({ token: t, nickname: 'Voice E2E' })); localStorage.setItem('bandly.onboard.v1', JSON.stringify({ goal: 'ielts', minutes: 20 })); localStorage.setItem('bandly.profile.v1', JSON.stringify({ level: 'B1', xp: 0, adult: false })); } }, [token]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(`${scenario}: JS xato ${e.message.slice(0, 160)}`));
  p.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 500) problems.push(`${scenario}: HTTP ${r.status()} ${r.url().slice(base.length)}`); });
  await p.goto(`${base}/#/coach`);
  const start = p.getByRole('button', { name: /Qo‘ng‘iroqni boshlash/ });
  await start.waitFor({ timeout: 15000 });
  for (let i = 0; i < 50 && await start.isDisabled(); i++) await wait(100);
  await start.click();
  await p.locator('.ptt-pad').waitFor({ timeout: 15000 });
  return p;
}
const statusText = (p: import('playwright').Page) => p.locator('.voice-status').innerText();
const waitStatus = async (p: import('playwright').Page, re: RegExp, ms = 6000) => { for (let i = 0; i < ms / 50; i++) { if (re.test(await statusText(p))) return; await wait(50); } assert.fail(`holat ${re} bo'lmadi: «${await statusText(p)}»`); };
const padBox = async (p: import('playwright').Page) => { const b = (await p.locator('.ptt-pad').boundingBox())!; return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
const shot = (p: import('playwright').Page, name: string) => process.env.E2E_SHOTS ? p.screenshot({ path: join(process.env.E2E_SHOTS, `${name}.png`) }) : Promise.resolve();

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* hali ishga tushmoqda */ }
    if (i > 150 || srv.exitCode !== null) throw new Error('server ishga tushmadi:\n' + log);
    await wait(200);
  }
  const token = (await (await fetch(`${base}/api/join`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nickname: 'VoiceE2E' }) })).json() as { token: string }).token;
  assert.ok(token);

  let p!: import('playwright').Page;
  await step('J1. Qo‘ng‘iroq ochiladi, tugma bosilmaguncha hech narsa yuborilmaydi', async () => {
    p = await openCall(LOUD, token);
    await waitStatus(p, /Sellzen gapiryapti|Navbat sizda/);
    assert.match(await p.locator('.voice-top .muted').innerText(), /\/ 5:00/, 'taymer: o‘tgan / ruxsat etilgan vaqt');
    const setup = seen.find((s) => s.kind === 'setup')!.setup!;
    assert.equal(setup.realtimeInputConfig.automaticActivityDetection.disabled, true, 'bosib-gapirish: avtomatik aniqlash o‘chiq');
    await waitStatus(p, /Navbat sizda/, 8000);
    const t = now(); await wait(1500);
    assert.equal(count('audio', t) + count('start', t), 0, 'tugma bosilmagan — mikrofon ovozi Gemini’ga bormaydi (shovqin ustozni bo‘lmaydi)');
    assert.match(await p.locator('.voice-sub').innerText(), /bosib turib gapiring/, 'ko‘rsatma');
    await shot(p, 'j1-idle');
  });

  await step('J2. Avatarni bosib turish → gapirish → qo‘yib yuborish → ustoz javobi', async () => {
    const c = await padBox(p); const t = now();
    await p.mouse.move(c.x, c.y); await p.mouse.down();
    await waitStatus(p, /Tinglayapman/, 3000);
    await wait(1600); await shot(p, 'j2-listening');
    await p.mouse.up();
    await waitStatus(p, /O‘ylayapman|Sellzen gapiryapti/, 3000);
    await waitStatus(p, /Sellzen gapiryapti/, 6000);
    const k = kinds(t);
    assert.equal(k[0], 'start', 'avval activityStart'); assert.ok(count('audio', t) > 5, 'bosib turilganda ovoz yuborildi');
    assert.equal(k.filter((x) => x === 'end').length, 1); assert.ok(k.lastIndexOf('audio') < k.indexOf('end'), 'ovoz activityEnd’dan oldin tugadi');
    assert.match(await p.locator('.vl.you').innerText(), /teach me English/, 'o‘quvchi gapi (Siz)');
    await p.locator('.vl.bot').waitFor();
    assert.match(await p.locator('.vl.bot').innerText(), /Qoyil/, 'ustoz gapi (Sellzen)');
    assert.equal(await p.locator('.ai-avatar.mood-love').count(), 1, 'iliq maqtov — yurak shaklidagi avatar');
    await p.locator('a.voice-lessons').waitFor({ timeout: 3000 }); // "ingliz tilini o'rgat" — darslarga yo'naltirish
    assert.equal(await p.locator('a.voice-lessons').getAttribute('href'), '#/learn');
    await shot(p, 'j2-speaking-heart');
  });

  await step('J3. Ustoz gapirayotganda ataylab bosish ustozni to‘xtatadi; Probel (Space) ham shunday', async () => {
    await waitStatus(p, /Sellzen gapiryapti/, 3000);
    const t = now();
    await p.keyboard.down('Space');
    await waitStatus(p, /Tinglayapman/, 3000);
    await wait(1400);
    await p.keyboard.up('Space');
    await waitCount('end', 1, t);
    const k = kinds(t);
    assert.equal(k[0], 'start', 'Space → activityStart (ustoz to‘xtadi)'); assert.equal(k.filter((x) => x === 'end').length, 1);
    await waitStatus(p, /Sellzen gapiryapti/, 6000);
    await waitStatus(p, /Navbat sizda/, 12000); // ustoz fikrini oxirigacha aytdi (ustidan kesilmadi)
  });

  await step('J4. Qisqa tegish — qulf; yana tegish tugatadi', async () => {
    const c = await padBox(p); const t = now();
    await p.mouse.move(c.x, c.y); await p.mouse.down(); await wait(90); await p.mouse.up();
    await waitStatus(p, /Tinglayapman/, 2000);
    assert.match(await p.locator('.voice-sub').innerText(), /yana bosing/, 'qulflangan: yana bosing');
    await wait(1500);
    assert.equal(count('end', t), 0, 'qulflangan yozuv o‘zi tugamaydi');
    await p.mouse.down(); await wait(60); await p.mouse.up();
    await waitCount('end', 1, t);
    assert.equal(count('end', t), 1); assert.ok(count('audio', t) > 5);
  });

  await step('J5. Jim mikrofon: bo‘sh navbat yuborilmaydi, tushunarli xabar', async () => {
    const q = await openCall(QUIET, token);
    await waitStatus(q, /Navbat sizda/, 12000);
    const c = await padBox(q); const t = now();
    await q.mouse.move(c.x, c.y); await q.mouse.down(); await wait(1500); await q.mouse.up();
    await waitStatus(q, /Ovoz eshitilmadi/, 3000);
    assert.equal(count('start', t) + count('end', t) + count('audio', t), 0, 'ovoz yo‘q — Gemini’ga hech narsa yuborilmadi');
    await shot(q, 'j5-no-voice');
  });

  assert.deepEqual(problems, [], 'brauzerda JS xatosi yoki 5xx bo‘lmasligi kerak');
  console.log('e2e voice: OK');
} catch (e) {
  console.error(`\n✗ ${scenario}\n`, e, '\n--- server log (oxiri) ---\n', log.slice(-1500), '\n', problems.join('\n'));
  process.exitCode = 1;
} finally {
  for (const b of browsers) await b.close();
  srv.kill(); up.close(); ai.close();
  rmSync(dir, { recursive: true, force: true });
}
