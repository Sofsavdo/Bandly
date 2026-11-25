// Ovozli ustoz E2E (Playwright): haqiqiy server + qurilgan sayt + SOXTA Gemini Live serveri + SOXTA Scribe (ElevenLabs) + fayldan soxta mikrofon.
// Haqiqiy AI xarajati, haqiqiy foydalanuvchi ma'lumoti ishlatilmaydi.
//   J1. Sellzen sahifasi ochilishi bilan qo'ng'iroq o'zi boshlanadi (hech narsa bosilmaydi); taymer "0:xx / 5:00"; tegilmaguncha Gemini'ga va Scribe'ga ovoz bormaydi;
//       tugatilgach qayta o'zi boshlanmaydi, yuzga tegib yana boshlash mumkin
//   J2. Ekranga tegib turish → ovoz serverga → qo'yib yuborish → Scribe matni "Siz" qatorida, Gemini'ga MATN boradi (ovoz emas); ustoz javobi, hissiyot (yurak)
//   J3. Ustoz gapirayotganda ataylab tegish ustozni to'xtatadi (eski ovoz tashlanadi); Probel (Space) ham shunday; ustoz fikrini tugatadi
//   J4. Qisqa (tasodifiy) tegish — hech narsa yuborilmaydi; bosib turish — tinglaydi, qo'yib yuborish — javob (qulf rejimi yo'q)
//   J5. Scribe bo'sh matn qaytardi (jim/tushunarsiz navbat) — "Ovoz eshitilmadi", Gemini'ga hech narsa bormaydi
//   J6. "Darsga o'tamiz" desa — tugma emas, ilova o'zi dars sahifasini ochadi (qo'ng'iroq tugaydi)
//   J7. Ekran: 6 xil o'lchamda sahifa skrol qilinmaydi, tugatish tugmasi ko'rinadi, holatlar almashganda yuz joyidan siljimaydi
//   J9. Uzun javob: matn qisilmaydi (qisqartirilmaydi), oxirgi gap to'liq ko'rinadi, eski gaplar yuqoriga chiqib ketadi; 2 xil ekranda
//   J8. Sensorli ekran: ekranning istalgan joyiga (yuqori burchak ham) tegib gapirish; tugatish tugmasi gapirishni boshlamaydi
//   J11. Yuz ifodasi erkin (jahlda titraydi, kulganda sakraydi), lekin ekrandagi boshqa elementlar (holat, matn, tugma) qimirlamaydi, sahifa skrol bo'lmaydi
//   J10. IELTS darsi "Gapir": ovoz ko'rsatkichi, gap serverga boradi va natija chiqadi; jim mikrofon aniq aytiladi, ikki urinishdan keyin o'tkazib yuborish mumkin
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { WebSocketServer } from 'ws';
import { lessonById } from '../src/content/lessons';

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

// ---- Soxta Scribe (ElevenLabs STT): navbat WAV'i jim bo'lsa — bo'sh matn; aks holda stsenariy bo'yicha matn ----
let scribeText = 'teach me English, I go to school yesterday';
const scribeCalls: { bytes: number; loud: boolean }[] = [];
const scribe = createServer((req, res) => {
  const chunks: Buffer[] = []; req.on('data', (c) => chunks.push(c)); req.on('end', () => {
    const body = Buffer.concat(chunks); const at = body.indexOf('RIFF'); const pcm = at >= 0 ? body.subarray(at + 44) : Buffer.alloc(0);
    let s = 0, c = 0; for (let i = 0; i + 1 < pcm.length; i += 8) { const v = pcm.readInt16LE(i) / 32768; s += v * v; c++; }
    const isWav = at >= 0; // dars mashqlari MediaRecorder (webm/mp4) yuboradi: jimlikni mijoz o'zi filtrlaydi, bu yerga faqat gap keladi
    const loud = isWav ? Math.sqrt(s / Math.max(1, c)) > 0.015 : body.length > 800; scribeCalls.push({ bytes: isWav ? pcm.length : body.length, loud });
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify(loud && scribeText ? { text: scribeText, language_code: 'eng', words: [{ end: pcm.length / 32000, type: 'word' }] } : { text: '', language_code: 'eng', words: [] }));
  });
});
await new Promise<void>((r) => scribe.listen(0, '127.0.0.1', () => r()));
const scribePort = (scribe.address() as { port: number }).port;

// ---- Soxta Gemini Live ----
const seen: { t: number; kind: string; setup?: Record<string, any>; text?: string }[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
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
    const text = m.clientContent?.turns?.[0]?.parts?.[0]?.text as string | undefined;
    if (text && /^\(The learner/.test(text)) { seen.push({ t: Date.now() - T0, kind: 'kickoff', text }); say('Salom! Bugun nima haqida gaplashamiz?', 2); return; }
    if (text) { // o'quvchi gapi (Scribe matni): eski javob to'xtaydi, yangisi boshlanadi
      seen.push({ t: Date.now() - T0, kind: 'text', text });
      if (speakingTimer) { clearInterval(speakingTimer); speakingTimer = null; ws.send(JSON.stringify({ serverContent: { interrupted: true } })); }
      const LONGREPLY = 'Present perfect zamoni o‘tgan paytda boshlangan, lekin natijasi hozirgi paytga bog‘liq bo‘lgan ishlarni bildiradi. Masalan: I have finished my homework — men uy vazifamni tugatdim va u endi tayyor. Yasalishi: have yoki has va fe’lning uchinchi shakli. Endi o‘zingiz bitta gap tuzing: I have already visited Samarkand — va shu gapni to‘liq ayting.';
      const EMO: Record<string, string> = { ANGRY: 'What the hell was that?! Seriously? «I go yesterday»?! It is «I went» — say it again, properly this time!', LAUGH: 'Hahaha! Oh come on, you said you ate the homework? Hahaha, say it again!' };
      const emo = /^(ANGRY|LAUGH)/.exec(text)?.[1];
      if (emo) { setTimeout(() => say(EMO[emo]!, 12), 150); return; }
      setTimeout(() => say(/LONG/.test(text) ? LONGREPLY : /darsga/i.test(text) ? 'Mayli, hozir ochamiz!' : 'Qoyil! Juda zo‘r gapirdingiz, endi shu gapni to‘liq ayting.', /LONG/.test(text) ? 3 : /darsga/i.test(text) ? 2 : 9), 150); // uzun javob (~3.4 s): gapirayotganda bosib to'xtatish mumkin
      return;
    }
    const ri = m.realtimeInput;
    if (ri?.audio) { seen.push({ t: Date.now() - T0, kind: 'audio' }); return; }
    if (ri?.activityStart) { seen.push({ t: Date.now() - T0, kind: 'start' }); return; }
    if (ri?.activityEnd) seen.push({ t: Date.now() - T0, kind: 'end' });
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
for (const [k, v] of Object.entries(process.env)) if (!/KEY|TOKEN|SECRET|HAMYON|TELEGRAM|^AI_|GEMINI|ELEVEN|S3|ADMIN|PUBLIC_URL|PRICE|PAY_DEMO|^STT_|^LIVE_/i.test(k)) env[k] = v;
Object.assign(env, {
  PORT: String(PORT), HOST: '127.0.0.1', DB_PATH: join(dir, 'v.sqlite'), BACKUP_DISABLED: '1', NODE_ENV: 'test',
  AI_PROVIDER: 'openai', AI_API_KEY: 'sk-e2e-not-real', AI_MODEL: 'e2e-model', AI_FALLBACK_MODEL: ' ', AI_BASE_URL: `http://127.0.0.1:${aiPort}`, AI_GLOBAL_DAILY_CALLS: '100',
  GEMINI_LIVE_KEY: 'e2e-fake-live-key', GEMINI_LIVE_URL: `ws://127.0.0.1:${upPort}`, GEMINI_LIVE_MODEL: 'e2e-live', GEMINI_LIVE_FALLBACK_MODEL: ' ',
  ELEVENLABS_API_KEY: 'e2e-fake-eleven-key', STT_BASE_URL: `http://127.0.0.1:${scribePort}`, // soxta Scribe
});
const srv = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { env, stdio: ['ignore', 'pipe', 'pipe'] });
let log = ''; srv.stdout.on('data', (c) => (log += c)); srv.stderr.on('data', (c) => (log += c));

const problems: string[] = [];
let scenario = '';
const step = async (name: string, fn: () => Promise<void>) => { if (process.env.E2E_ONLY && !process.env.E2E_ONLY.split(',').some((x) => name.startsWith(x))) return; scenario = name; const t0 = Date.now(); await fn(); console.log(`  ✓ ${name} (${Date.now() - t0} ms)`); };
const kinds = (from = 0) => seen.filter((s) => s.t >= from && s.kind !== 'setup').map((s) => s.kind);
const count = (kind: string, from = 0) => seen.filter((s) => s.kind === kind && s.t >= from).length;
const now = () => Date.now() - T0;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const waitCount = async (kind: string, n: number, from: number, ms = 5000) => { for (let i = 0; i < ms / 50; i++) { if (count(kind, from) >= n) return; await wait(50); } assert.fail(`${kind} ${n} marta kelmadi (${count(kind, from)}): ${kinds(from).join(',')}`); };
const args = (f: string) => ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-audio-capture=${f}`, '--autoplay-policy=no-user-gesture-required'];
const browsers: import('playwright').Browser[] = [];
type Page = import('playwright').Page;

async function openCall(f: string, token: string, viewport = { width: 390, height: 800 }, touch = false) {
  const b = await chromium.launch({ args: args(f) }); browsers.push(b);
  const ctx = await b.newContext({ viewport, isMobile: touch, hasTouch: touch, permissions: ['microphone'], deviceScaleFactor: 1 });
  await ctx.addInitScript(([t]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('bandly.account.v1', JSON.stringify({ token: t, nickname: 'Voice E2E' })); localStorage.setItem('bandly.onboard.v1', JSON.stringify({ goal: 'ielts', minutes: 20 })); localStorage.setItem('bandly.profile.v1', JSON.stringify({ level: 'B1', xp: 0, adult: false })); } }, [token]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(`${scenario}: JS xato ${e.message.slice(0, 160)}`));
  p.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 500) problems.push(`${scenario}: HTTP ${r.status()} ${r.url().slice(base.length)}`); });
  await p.goto(`${base}/#/coach`);
  // Egasi (2026-11-25): Sellzen ochilishi bilan qo'ng'iroq o'zi boshlanadi — hech narsa bosilmaydi
  await p.locator('.call').waitFor({ timeout: 15000 });
  return p;
}
/** Dars sahifasini ochadi va "Gapir" bosqichigacha o'tadi (kashf → mashq → gapirish). */
async function openLessonSpeak(f: string, token: string, lessonId: string) {
  const b = await chromium.launch({ args: args(f) }); browsers.push(b);
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, permissions: ['microphone'], deviceScaleFactor: 1 });
  await ctx.addInitScript(([t]) => { try { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('bandly.account.v1', JSON.stringify({ token: t, nickname: 'Voice E2E', tg: true })); localStorage.setItem('bandly.profile.v1', JSON.stringify({ level: 'B1', placementAt: new Date().toISOString() })); localStorage.setItem('bandly.onboard.v1', JSON.stringify({ goal: 'ielts', why: 'abroad', when: 'm3', examDate: null, target: '6.5', level: 'B1', hard: [], minutes: 20, tutor: 'friendly' })); } } catch { /* */ } }, [token]);
  const p = await ctx.newPage();
  p.on('pageerror', (e) => problems.push(`${scenario}: JS xato ${e.message.slice(0, 160)}`));
  const lesson = lessonById(lessonId)!.lesson;
  const items = [...lesson.practice, ...lesson.check];
  await p.goto(`${base}/#/learn/${lessonId}`);
  const speakShown = async () => /Eshiting, so‘ng mikrofonni bosib ayting|Brauzer nutqni tanimaydi/.test((await p.locator('main').innerText()).replace(/\s+/g, ' '));
  for (let i = 0; i < 200 && !(await speakShown()); i++) {
    const body = (await p.locator('main').innerText()).replace(/\s+/g, ' ');
    if (/Juftini top/.test(body)) for (const v of lesson.vocab ?? []) { await p.locator('main button:not([disabled])', { hasText: new RegExp(`^${v.en}$`) }).first().click({ timeout: 800 }).catch(() => undefined); await p.locator('main button:not([disabled])', { hasText: v.uz }).first().click({ timeout: 800 }).catch(() => undefined); }
    if (/Eshit va tanla/.test(body)) {
      const mm = /«([^»]+)»/.exec(body); const ex = lesson.examples.find((e) => e.en === mm?.[1]);
      if (ex) await p.locator('main button:not([disabled])', { hasText: ex.uz }).first().click({ timeout: 800 }).catch(() => undefined);
      else for (const b2 of await p.locator('main .opts button, main button.opt, main .stack button').all()) { await b2.click({ timeout: 400 }).catch(() => undefined); const ok = p.locator('main button:not([disabled])', { hasText: /^Tayyor/ }).first(); if (await ok.count()) await ok.click({ timeout: 400 }).catch(() => undefined); await wait(120); if (!/Eshit va tanla/.test((await p.locator('main').innerText()))) break; }
    }
    const prompt = (await p.locator('main .q p b, main .boss-q p b, main [class*=item] p b').first().textContent({ timeout: 300 }).catch(() => null))?.trim();
    const it = prompt ? items.find((x) => (x.kind !== 'order' && x.prompt === prompt) || (x.kind === 'order' && /So‘zlardan to‘g‘ri gap tuzing/.test(prompt))) : undefined;
    if (it && !(await p.locator('.opt.right, .opt.bad').count())) {
      if (it.kind === 'choice') await p.locator('main button.opt', { hasText: it.options[it.answer]! }).first().click({ timeout: 2000 }).catch(() => undefined);
      else if (it.kind === 'gap') await p.locator('main input[type=text]').first().fill(it.accept[0]!).catch(() => undefined);
      else if (it.kind === 'order') for (const w of it.answer.split(' ')) await p.locator('main button.chipbtn:not([disabled])', { hasText: new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click({ timeout: 1500 }).catch(() => undefined);
    }
    let clicked = false;
    for (const label of [/^Yakuniy tekshiruvga/, /^Keyingi savol/, /^Davom etish/, /^Tushunarli/, /^Missiyani boshlash/, /^Keyingi/, /^Davom/, /^Tekshirish/, /^Gapirish mashqiga/]) {
      const b3 = p.locator('main button:not([disabled]):visible', { hasText: label }).first();
      if (await b3.count()) { await b3.click({ timeout: 1500 }).catch(() => undefined); clicked = true; break; }
    }
    if (!clicked) { const any = p.locator('main button.primary:not([disabled]):visible').first(); if (await any.count()) await any.click({ timeout: 1500 }).catch(() => undefined); }
    await wait(140);
  }
  assert.ok(await speakShown(), `${lessonId}: "Gapir" bosqichiga yetib bo‘lmadi: ${(await p.locator('main').innerText()).replace(/\s+/g, ' ').slice(0, 300)} | tugmalar: ${JSON.stringify(await p.locator('main button:visible').allInnerTexts())}`);
  return { p, lesson };
}
const statusText = (p: Page) => p.locator('.call-status').innerText();
const waitStatus = async (p: Page, re: RegExp, ms = 6000) => { for (let i = 0; i < ms / 50; i++) { if (re.test(await statusText(p))) return; await wait(50); } assert.fail(`holat ${re} bo'lmadi: «${await statusText(p)}»`); };
const faceCenter = async (p: Page) => { const b = (await p.locator('.call-face').boundingBox())!; return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
const shot = (p: Page, name: string) => process.env.E2E_SHOTS ? p.screenshot({ path: join(process.env.E2E_SHOTS, `${name}.png`) }) : Promise.resolve();

try {
  for (let i = 0; ; i++) {
    try { if ((await fetch(`${base}/api/health`)).ok) break; } catch { /* hali ishga tushmoqda */ }
    if (i > 150 || srv.exitCode !== null) throw new Error('server ishga tushmadi:\n' + log);
    await wait(200);
  }
  const token = (await (await fetch(`${base}/api/join`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ nickname: 'VoiceE2E' }) })).json() as { token: string }).token;
  assert.ok(token);

  let p!: Page;
  await step('J1. Sellzen ochilishi bilan qo‘ng‘iroq o‘zi boshlanadi; tegilmaguncha hech narsa yuborilmaydi', async () => {
    p = await openCall(LOUD, token);
    await waitStatus(p, /Sellzen gapiryapti|Navbat sizda/);
    assert.match(await p.locator('.call-time').innerText(), /\/ 5:00/, 'taymer: o‘tgan / ruxsat etilgan vaqt');
    const setup = seen.find((s) => s.kind === 'setup')!.setup!;
    assert.equal(setup.realtimeInputConfig.automaticActivityDetection.disabled, true, 'bosib-gapirish: avtomatik aniqlash o‘chiq');
    assert.match(seen.find((s) => s.kind === 'kickoff')!.text!, /LEARNER CONTEXT.*level B1/, 'ustozga o‘quvchi konteksti (daraja, reja) berildi');
    await waitStatus(p, /Navbat sizda/, 8000);
    const t = now(), s0 = scribeCalls.length; await wait(1500);
    assert.equal(count('audio', t) + count('start', t) + (scribeCalls.length - s0), 0, 'tegilmagan — mikrofon ovozi Gemini’ga ham, Scribe’ga ham bormaydi');
    assert.match(await p.locator('.call-sub').innerText(), /tegib turib gapiring|Space/, 'ko‘rsatma');
    assert.equal(await p.locator('button:has-text("Qo‘ng‘iroqni boshlash")').count(), 0, 'alohida "boshlash" tugmasi yo‘q');
    assert.equal(await p.locator('.mic-big, .ptt-pad').count(), 0, 'alohida mikrofon tugmasi yo‘q');
    await shot(p, 'j1-idle');
  });

  await step('J2. Tegib turish → Scribe matni → Gemini’ga matn → ustoz javobi', async () => {
    const c = await faceCenter(p); const t = now(), s0 = scribeCalls.length;
    await p.mouse.move(c.x, c.y); await p.mouse.down();
    await waitStatus(p, /Tinglayapman/, 3000);
    await wait(1600); await shot(p, 'j2-listening');
    await p.mouse.up();
    await p.locator('.vl.you').first().waitFor({ timeout: 8000 });
    assert.match(await p.locator('.vl.you').last().innerText(), /teach me English/, 'Scribe matni "Siz" qatorida');
    assert.ok(scribeCalls.length - s0 >= 1, 'Scribe chaqirildi (til aniqlash + inglizcha qayta tanish: 1–2 so‘rov)'); assert.ok(scribeCalls.at(-1)!.loud && scribeCalls.at(-1)!.bytes > 16000, 'Scribe’ga navbat ovozi bordi (WAV)');
    await waitStatus(p, /Sellzen gapiryapti/, 6000);
    const k = kinds(t);
    assert.ok(!k.includes('audio') && !k.includes('start') && !k.includes('end'), `Gemini’ga ovoz/activity bormadi: ${k.join(',')}`);
    assert.equal(count('text', t), 1, 'Gemini’ga o‘quvchi gapi MATN bo‘lib bordi');
    assert.match(seen.filter((s) => s.kind === 'text').at(-1)!.text!, /teach me English/);
    await p.locator('.vl.bot').last().waitFor();
    assert.match(await p.locator('.vl.bot').last().innerText(), /Qoyil/, 'ustoz gapi (Sellzen)');
    assert.equal(await p.locator('.ai-avatar.mood-love').count(), 1, 'iliq maqtov — yurak shaklidagi avatar');
    assert.equal(await p.locator('a:has-text("Darslarga o‘tish")').count(), 0, '"Darslarga o‘tish" tugmasi yo‘q (ustoz o‘zi yo‘naltiradi)');
    await shot(p, 'j2-speaking-heart');
  });

  await step('J3. Ustoz gapirayotganda ataylab tegish ustozni to‘xtatadi; Probel; ustoz fikrini tugatadi', async () => {
    await waitStatus(p, /Sellzen gapiryapti/, 3000);
    const t = now(), s0 = scribeCalls.length;
    await p.keyboard.down('Space');
    await waitStatus(p, /Tinglayapman/, 3000);
    await wait(1400);
    await p.keyboard.up('Space');
    for (let i = 0; i < 100 && scribeCalls.length === s0; i++) await wait(50);
    assert.ok(scribeCalls.length - s0 >= 1, 'Space → Scribe');
    await waitCount('text', 1, t, 6000);
    await waitStatus(p, /Sellzen gapiryapti/, 6000);
    await waitStatus(p, /Navbat sizda/, 12000); // ustoz fikrini oxirigacha aytdi (ustidan kesilmadi)
  });

  await step('J4. Qisqa (tasodifiy) tegish — hech narsa yuborilmaydi; qo‘l olinsa tinglash doim to‘xtaydi', async () => {
    const c = await faceCenter(p); const s0 = scribeCalls.length, t = now();
    await p.mouse.move(c.x, c.y); await p.mouse.down(); await wait(90); await p.mouse.up();
    await waitStatus(p, /Navbat sizda/, 3000);
    await wait(1200);
    assert.equal(scribeCalls.length, s0, 'qisqa tegish Scribe’ga yuborilmadi');
    assert.equal(count('text', t), 0, 'ustozga hech narsa bormadi');
    assert.doesNotMatch(await p.locator('.call-status').innerText(), /Ovoz eshitilmadi|Tinglayapman/, 'qulf yo‘q, "ovoz eshitilmadi" ham chiqmaydi');
    // Bosib turish — tinglaydi; qo'yib yuborish — to'xtaydi va ustoz javob beradi
    await p.mouse.down(); await waitStatus(p, /Tinglayapman/, 2000); await wait(1200); await p.mouse.up();
    for (let i = 0; i < 100 && scribeCalls.length === s0; i++) await wait(50);
    assert.equal(scribeCalls.length - s0, 1, 'bosib turilgan gap bir marta yuborildi');
    await waitStatus(p, /Sellzen gapiryapti/, 6000); await waitStatus(p, /Navbat sizda/, 12000);
  });

  await step('J7. Ekran: skrol yo‘q, tugatish tugmasi ko‘rinadi, yuz siljimaydi (6 xil o‘lcham)', async () => {
    for (const vp of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 390, height: 844 }, { width: 412, height: 915 }, { width: 768, height: 1024 }, { width: 1280, height: 720 }]) {
      await p.setViewportSize(vp); await wait(250);
      const m = await p.evaluate(() => {
        const end = document.querySelector('.call-end')!.getBoundingClientRect(), face = document.querySelector('.call-face')!.getBoundingClientRect(), call = document.querySelector('.call')!.getBoundingClientRect();
        return { sh: document.documentElement.scrollHeight, sw: document.documentElement.scrollWidth, iw: innerWidth, ih: innerHeight, call: { w: call.width, h: call.height, x: call.x, y: call.y }, end: { x: end.x, y: end.y, w: end.width, h: end.height }, faceTop: face.top, faceW: face.width, bodyOverflow: document.body.style.overflow, callScroll: document.querySelector('.call')!.scrollHeight - document.querySelector('.call')!.clientHeight, noteOverflow: document.querySelector('.call-stage')!.scrollHeight - document.querySelector('.call-stage')!.clientHeight };
      });
      const tag = `${vp.width}×${vp.height}`;
      await shot(p, `j7-${vp.width}x${vp.height}`);
      assert.ok(m.sw <= m.iw + 1, `${tag}: gorizontal siljish bor (${m.sw}/${m.iw})`);
      assert.ok(Math.abs(m.call.w - m.iw) <= 1 && Math.abs(m.call.h - m.ih) <= 1 && m.call.x === 0 && m.call.y === 0, `${tag}: qo‘ng‘iroq butun ekranni egallamaydi`);
      assert.ok(m.end.x >= 0 && m.end.y >= 0 && m.end.x + m.end.w <= m.iw && m.end.y + m.end.h <= m.ih && m.end.w >= 40, `${tag}: tugatish tugmasi ko‘rinmaydi/kichik`);
      assert.ok(m.callScroll <= 1 && m.noteOverflow <= 1, `${tag}: ichki kontent sig‘maydi (${m.callScroll}, ${m.noteOverflow})`);
      assert.equal(m.bodyOverflow, 'hidden', 'sahifa orqada siljimaydi');
      await p.mouse.wheel(0, 900); await wait(120); assert.equal(await p.evaluate(() => Math.round(scrollY)), 0, `${tag}: g‘ildirak/skrol sahifani siljitdi`);
      assert.ok(m.faceW >= 70, `${tag}: yuz juda kichik ${m.faceW}`);
    }
    await p.setViewportSize({ width: 390, height: 800 }); await wait(250);
    // Holatlar almashganda yuz va tugatish tugmasi joyidan siljimaydi (hint/matn o'zgarsa ham)
    // (yuz bosilganda biroz kattalashadi — bu transform, tartibni siljitmaydi; shuning uchun yuzdan pastdagi/yuqoridagi qotirilgan elementlar o'lchanadi)
    const pos = () => p.evaluate(() => ({ status: Math.round(document.querySelector('.call-status')!.getBoundingClientRect().top), lines: Math.round(document.querySelector('.call-lines')!.getBoundingClientRect().top), end: Math.round(document.querySelector('.call-end')!.getBoundingClientRect().top), faceBox: Math.round(document.querySelector('.call-face')!.getBoundingClientRect().height) > 0 }));
    const base0 = await pos(); const c = await faceCenter(p);
    await p.mouse.move(c.x, c.y); await p.mouse.down(); await wait(500); assert.deepEqual(await pos(), base0, 'tinglayotganda siljimadi');
    await p.mouse.up(); await waitStatus(p, /Sellzen gapiryapti|O‘ylayapman/, 6000); await wait(800); assert.deepEqual(await pos(), base0, 'gapirayotganda/matn chiqqanda siljimadi');
    await shot(p, 'j7-fit');
    await waitStatus(p, /Navbat sizda/, 14000);
  });

  await step('J6. "Darsga o‘tamiz" — tugma emas, ilova dars sahifasini ochadi', async () => {
    scribeText = "darsga o'tamiz";
    const c = await faceCenter(p);
    await p.mouse.move(c.x, c.y); await p.mouse.down(); await wait(1500); await p.mouse.up();
    await p.waitForFunction(() => /^#\/learn/.test(location.hash), null, { timeout: 15000 });
    assert.match(await p.evaluate(() => location.hash), /^#\/learn\/[a-z0-9-]+$/i, 'bugungi rejadagi dars ochildi');
    assert.equal(await p.locator('.call').count(), 0, 'qo‘ng‘iroq yakunlandi');
    scribeText = 'teach me English, I go to school yesterday';
  });

  await step('J5. Jim mikrofon: bo‘sh matn — "Ovoz eshitilmadi", Gemini’ga hech narsa bormaydi', async () => {
    // Scribe jim/tushunarsiz navbatga bo'sh matn qaytaradi (haqiqiy jim mikrofonni Chromium'ning shovqin bostirgichi/AGC bilan aniq simulyatsiya qilib bo'lmaydi — shuning uchun javob stsenariyi)
    scribeText = '';
    const q = await openCall(QUIET, token);
    await waitStatus(q, /Navbat sizda/, 12000);
    const c = await faceCenter(q); const t = now(), n0 = count('text', t);
    await q.mouse.move(c.x, c.y); await q.mouse.down(); await wait(1500); await q.mouse.up();
    await waitStatus(q, /Ovoz eshitilmadi/, 6000);
    assert.equal(count('text', t) - n0 + count('start', t) + count('audio', t), 0, 'ovoz yo‘q — Gemini’ga hech narsa yuborilmadi');
    await shot(q, 'j5-no-voice');
    // Tugatilgan qo'ng'iroq o'zi qayta boshlanmaydi; Sellzen yuziga tegib yana boshlash mumkin; kutish sahifasi skrol bo'lmaydi
    await q.locator('.call-end').click();
    await q.locator('.start-face').waitFor({ timeout: 5000 }); await wait(1500);
    assert.equal(await q.locator('.call').count(), 0, 'tugatilgan qo‘ng‘iroq o‘zi qayta boshlanmadi');
    for (const [w, h] of [[320, 568], [360, 640], [390, 800], [1280, 720]] as const) {
      await q.setViewportSize({ width: w, height: h }); await wait(300);
      const sc = await q.evaluate(() => ({ h: document.documentElement.scrollHeight - innerHeight, w: document.documentElement.scrollWidth - innerWidth }));
      assert.ok(sc.h <= 1 && sc.w <= 1, `Sellzen kutish sahifasi ${w}x${h} da skrol bo‘lmaydi (${JSON.stringify(sc)})`);
      await shot(q, `j5-idle-${w}`);
    }
    await q.setViewportSize({ width: 390, height: 800 });
    await q.locator('.start-face').click({ force: true });
    await q.locator('.call').waitFor({ timeout: 10000 });
    scribeText = 'teach me English, I go to school yesterday';
  });

  await step('J9. Uzun javob: matn qisilmaydi, oxirgi gaplar to‘liq ko‘rinadi, eski gaplar yuqoriga chiqadi', async () => {
    const p9 = await openCall(LOUD, token);
    await waitStatus(p9, /Navbat sizda/, 12000);
    for (const vp of [{ width: 390, height: 800 }, { width: 320, height: 568 }]) {
      await p9.setViewportSize(vp); await wait(200);
      scribeText = 'LONG please explain present perfect';
      const c = await faceCenter(p9);
      await p9.mouse.move(c.x, c.y); await p9.mouse.down(); await wait(1200); await p9.mouse.up();
      await waitStatus(p9, /Sellzen gapiryapti/, 8000); await waitStatus(p9, /Navbat sizda/, 15000);
      const m = await p9.evaluate(() => {
        const lines = document.querySelector('.call-lines')!.getBoundingClientRect();
        const all = [...document.querySelectorAll('.call-lines .vl')] as HTMLElement[];
        const last = all[all.length - 1]!; const r = last.getBoundingClientRect(); const first = all[0]!.getBoundingClientRect();
        return { n: all.length, lastText: last.innerText, lastTop: r.top, lastBottom: r.bottom, linesTop: lines.top, linesBottom: lines.bottom, bubbleClipped: last.scrollHeight - last.clientHeight, firstTop: first.top, stageOverflow: document.querySelector('.call-stage')!.scrollHeight - document.querySelector('.call-stage')!.clientHeight, lineH: parseFloat(getComputedStyle(last).lineHeight) };
      });
      const tag = `${vp.width}×${vp.height}`;
      assert.match(m.lastText, /uchinchi shakli.*to‘liq ayting\.$/s, `${tag}: oxirgi gap to‘liq (qisqartirilmagan)`);
      assert.ok(m.bubbleClipped <= 1, `${tag}: xabar ichida qisilish bor (${m.bubbleClipped})`);
      assert.ok(m.lastBottom <= m.linesBottom + 1 && m.lastTop >= m.linesTop - 1, `${tag}: oxirgi xabar oyna ichida to‘liq ko‘rinmaydi (${m.lastTop}–${m.lastBottom} / ${m.linesTop}–${m.linesBottom})`);
      assert.ok(m.lastBottom - m.lastTop > m.lineH * 3, `${tag}: uzun xabar bir necha qatorda`);
      assert.ok(m.stageOverflow <= 1, `${tag}: sahifa/oyna sig‘maydi (${m.stageOverflow})`);
      if (vp.height === 568) assert.ok(m.n >= 4 && m.firstTop < m.linesTop, `${tag}: eski gaplar yuqoriga chiqib ketdi (${m.n} xabar)`);
      await shot(p9, `j9-${vp.width}x${vp.height}`);
    }
    scribeText = 'teach me English, I go to school yesterday';
  });

  await step('J8. Sensorli ekran: istalgan joyga tegib gapirish; tugatish tugmasi gapirtirmaydi', async () => {
    const t0 = await openCall(LOUD, token, { width: 390, height: 800 }, true);
    await waitStatus(t0, /Navbat sizda/, 12000);
    const touch = (type: string, x: number, y: number) => t0.evaluate(([ty, xx, yy]) => { const el = document.elementFromPoint(xx as number, yy as number)!; el.dispatchEvent(new PointerEvent(ty as string, { pointerType: 'touch', pointerId: 7, isPrimary: true, bubbles: true, cancelable: true, clientX: xx as number, clientY: yy as number, button: 0 })); }, [type, x, y] as const);
    const s0 = scribeCalls.length;
    await touch('pointerdown', 30, 30); // yuqori burchak (yuzdan uzoq) — baribir gapirish boshlanadi
    await waitStatus(t0, /Tinglayapman/, 3000); await wait(1400); await touch('pointerup', 30, 30);
    for (let i = 0; i < 100 && scribeCalls.length === s0; i++) await wait(50);
    assert.ok(scribeCalls.length - s0 >= 1, 'yuqori burchakka tegish ham gapirishni boshladi');
    await waitStatus(t0, /Sellzen gapiryapti/, 6000);
    // Tugatish tugmasiga tegish — gapirishni boshlamaydi
    const end = (await t0.locator('.call-end').boundingBox())!;
    await touch('pointerdown', end.x + end.width / 2, end.y + end.height / 2); await touch('pointerup', end.x + end.width / 2, end.y + end.height / 2);
    await wait(300); assert.ok(!/Tinglayapman/.test(await statusText(t0)), 'tugatish tugmasi gapirishni boshlamadi');
    await t0.locator('.call-end').click(); await t0.locator('.start-face').waitFor({ timeout: 5000 });
  });

  await step('J11. Jahl va kulgi: yuz ifodali harakatlanadi, matn va tugmalar qimirlamaydi', async () => {
    const p11 = await openCall(LOUD, token, { width: 390, height: 800 });
    await waitStatus(p11, /Navbat sizda/, 12000);
    for (const emo of ['ANGRY', 'LAUGH']) {
      scribeText = `${emo} I go school yesterday`;
      const c = await faceCenter(p11);
      await p11.mouse.move(c.x, c.y); await p11.mouse.down(); await wait(1200); await p11.mouse.up();
      await waitStatus(p11, /Sellzen gapiryapti/, 8000); await wait(300);
      // 3 soniya davomida har 50 ms: yuz rasmi (aylanish/siljish bilan), holat qatori, matn oynasi va tugatish tugmasi
      const samples = await p11.evaluate(async () => {
        const out: { fx: number; fy: number; fw: number; st: number; ln: number; lh: number; en: number; wrap: number; scroll: number; sy: number; lvl: number }[] = [];
        const de = document.documentElement;
        for (let i = 0; i < 60; i++) {
          const f = (document.querySelector('.call-face .ai-face') ?? document.querySelector('.call-face'))!.getBoundingClientRect();
          const ln = document.querySelector('.call-lines')!.getBoundingClientRect();
          out.push({ fx: f.x, fy: f.y, fw: f.width, st: document.querySelector('.call-status')!.getBoundingClientRect().top, ln: ln.top, lh: ln.height, en: document.querySelector('.call-end')!.getBoundingClientRect().top, wrap: document.querySelector('.call-face')!.getBoundingClientRect().top, scroll: de.scrollWidth - de.clientWidth, sy: window.scrollY, lvl: Number(((document.querySelector('.call-face .ai-avatar') as HTMLElement | null)?.style.getPropertyValue('--lvl')) || 0) });
          await new Promise((r) => setTimeout(r, 50));
        }
        return out;
      });
      const span = (k: keyof typeof samples[number]) => Math.max(...samples.map((s) => s[k])) - Math.min(...samples.map((s) => s[k]));
      const moves = samples.slice(1).filter((s, i) => Math.abs(s.fx - samples[i]!.fx) > 1.5).length; // yuzning gorizontal sakrashlari soni
      const m = { fx: span('fx'), fy: span('fy'), fw: span('fw'), st: span('st'), ln: span('ln'), lh: span('lh'), en: span('en'), wrap: span('wrap'), moves, scroll: Math.max(...samples.map((s) => s.scroll)), sy: span('sy') };
      console.log(`    ${emo}: ${JSON.stringify(Object.fromEntries(Object.entries(m).map(([k, v]) => [k, Math.round(v * 10) / 10])))}`);
      await shot(p11, `j11-${emo.toLowerCase()}`);
      // Egasi (2026-11-25): yuz ifodasini cheklama — o'rtadagi ustoz istalgan harakatni qilishi mumkin, faqat boshqa elementlar silkinmasin
      assert.ok(m.st <= 1 && m.ln <= 1 && m.lh <= 1 && m.en <= 1 && m.wrap <= 1, `${emo}: yuz harakati boshqa elementlarni qimirlatdi (holat ${m.st}, matn ${m.ln}/${m.lh}, tugma ${m.en}, yuz o‘rni ${m.wrap})`);
      assert.ok(m.scroll <= 1 && m.sy <= 1, `${emo}: yuz harakatidan sahifa yonga kengaydi yoki skrol bo‘ldi (${m.scroll}, ${m.sy})`);
      // Og'iz ustoz ovozi eshitilayotganda ochiladi (chiqishdagi analizator; avval bo'lak kelganda o'rnatilib, oxirida qotib qolardi)
      const lv = samples.map((x) => x.lvl); assert.ok(Math.max(...lv) > 0.1, `${emo}: gapirganda og‘iz ochilmadi (lvl max ${Math.max(...lv)})`);
      if (emo === 'ANGRY') assert.ok(m.moves >= 10, `jahl yuzda ko‘rinmayapti (${m.moves} ta harakat / 3 s)`);
      else assert.ok(m.fy >= 3, `kulgi yuzda ko‘rinmayapti (y ${m.fy})`);
      await waitStatus(p11, /Navbat sizda/, 15000);
    }
    scribeText = 'teach me English, I go to school yesterday';
  });

  await step('J10. IELTS darsi "Gapir": ovoz ko‘rsatkichi + gap serverga boradi; jim mikrofon aniq aytiladi, ikki urinishdan keyin o‘tkazib yuborish', async () => {
    const savedText = scribeText; scribeText = 'I am a student and I study economics';
    // 1) Odatiy mikrofon: "Aytish" → ko'rsatkich harakatlanadi → "Tugatdim" → gap serverga → natija chiqadi
    const a = await openLessonSpeak(LOUD, token, 'ie-ss-l1');
    const sttOk: number[] = []; a.p.on('response', (r) => { if (r.url().includes('/api/ai/stt')) sttOk.push(r.status()); });
    await a.p.locator('main button', { hasText: 'Aytish' }).first().click();
    await a.p.locator('.mic-meter').waitFor({ timeout: 5000 });
    let moved = false;
    for (let i = 0; i < 40 && !moved; i++) { const st = (await a.p.locator('.mic-meter').getAttribute('style')) ?? ''; const m = /--lvl:\s*([0-9.]+)/.exec(st); if (m && Number(m[1]) > 0.05) moved = true; else await wait(50); }
    assert.ok(moved, 'ovoz ko‘rsatkichi gapirganda harakatlanmadi');
    await wait(1200);
    await a.p.locator('main button', { hasText: 'Tugatdim' }).first().click();
    await a.p.locator('main', { hasText: 'tanildi' }).waitFor({ timeout: 8000 });
    assert.deepEqual(sttOk, [200], 'gap serverga bir marta yuborildi');
    await a.p.context().browser()!.close();

    // 2) Jim mikrofon (ovoz umuman kelmayapti): 3,5 s dan keyin maslahat; aniq xabar; serverga hech narsa bormaydi; ikkinchi urinishdan keyin "O'tkazib yuborish"
    const s0 = scribeCalls.length;
    const q = await openLessonSpeak(QUIET, token, 'ie-ss-l1');
    const first = q.lesson.examples[0]!.en, second = q.lesson.examples[1]!.en;
    await q.p.locator('main button', { hasText: 'Aytish' }).first().click();
    await q.p.locator('main', { hasText: 'Ovoz kelmayapti' }).waitFor({ timeout: 8000 });
    await q.p.locator('main button', { hasText: 'Tugatdim' }).first().click();
    await q.p.locator('main', { hasText: 'Mikrofondan ovoz kelmadi' }).waitFor({ timeout: 6000 });
    assert.equal(await q.p.locator('main button', { hasText: 'O‘tkazib yuborish' }).count(), 0, 'birinchi urinishdan keyin hali o‘tkazib yuborish yo‘q');
    await q.p.locator('main button', { hasText: 'Aytish' }).first().click();
    await wait(1400);
    await q.p.locator('main button', { hasText: 'Tugatdim' }).first().click();
    await q.p.locator('main button', { hasText: 'O‘tkazib yuborish' }).first().waitFor({ timeout: 6000 });
    assert.equal(scribeCalls.length, s0, 'jim mikrofon Scribe’ga hech narsa yubormadi');
    assert.ok(!(await q.p.locator('main').innerText()).includes(second), 'ikkinchi gap hali ko‘rinmasligi kerak');
    await q.p.locator('main button', { hasText: 'O‘tkazib yuborish' }).first().click();
    await q.p.locator('main', { hasText: 'O‘tkazib yuborildi' }).waitFor({ timeout: 4000 });
    assert.ok((await q.p.locator('main').innerText()).includes(second), 'o‘tkazilgach keyingi gap ochildi');
    assert.ok(first.length > 0);
    scribeText = savedText;
  });

  assert.deepEqual(problems, [], 'brauzerda JS xatosi yoki 5xx bo‘lmasligi kerak');
  console.log('e2e voice: OK');
} catch (e) {
  console.error(`\n✗ ${scenario}\n`, e, '\n--- server log (oxiri) ---\n', log.slice(-1500), '\n', problems.join('\n'));
  process.exitCode = 1;
} finally {
  for (const b of browsers) await b.close();
  srv.kill(); up.close(); ai.close(); scribe.close();
  rmSync(dir, { recursive: true, force: true });
}
