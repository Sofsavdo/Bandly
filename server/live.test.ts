import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { WebSocket, WebSocketServer } from 'ws';
import { handsTurnBack } from './coach';
import { attachLive, ctxPrompt, navIntent, navRoute, partlyTurn, PARTLY_SCORE, pcmRms, pcmToWav, sanitizeCtx, tokenFromProtocols, unsureTurn, UNSURE_SCORE, wrongLanguage, ensureLiveTable, liveAllowance, liveConfigFromEnv, liveUsedToday, recordLive, setupMessage } from './live';

// Sozlama: Gemini kaliti bo'lsa yoqiq, GEMINI_LIVE=0 o'chiradi
assert.equal(liveConfigFromEnv(null, {}), null);
const cfg0 = { ...liveConfigFromEnv('AQ.k', {})!, nudgeMs: 60_000 }; // davom ettirish — alohida testda qisqa kutish bilan
assert.equal(cfg0.model, 'gemini-3.8-live'); assert.equal(cfg0.voice, 'Puck'); assert.equal(cfg0.freeDailySeconds, 300);
assert.equal(liveConfigFromEnv('AQ.k', { GEMINI_LIVE: '0' }), null);

// Ruxsat: xodim — sessiya chegarasi; obunachi — oylik qoldiq; bepul — kunlik bepul daqiqa
assert.equal(liveAllowance(cfg0, { staff: true, subscriberLeftSec: 0, freeUsedTodaySec: 9999 }), 600);
assert.equal(liveAllowance(cfg0, { staff: false, subscriberLeftSec: 120, freeUsedTodaySec: 0 }), 120);
assert.equal(liveAllowance(cfg0, { staff: false, subscriberLeftSec: 0, freeUsedTodaySec: 200 }), 100);
assert.equal(liveAllowance(cfg0, { staff: false, subscriberLeftSec: 0, freeUsedTodaySec: 400 }), 0);

const sm = setupMessage(cfg0, 'gemini-3.8-live', 'SYS') as { setup: Record<string, any> }; // eslint-disable-line @typescript-eslint/no-explicit-any
assert.equal(sm.setup.model, 'models/gemini-3.8-live');
assert.deepEqual(sm.setup.generationConfig.responseModalities, ['AUDIO']);
assert.equal(sm.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Puck');
assert.equal(sm.setup.systemInstruction.parts[0].text, 'SYS');
// O'quvchi o'ylab, pauza bilan gapiradi: gap tugashini shoshilmay aniqlaydi (past sezgirlik, 900 ms jimlik; LIVE_SILENCE_MS 300–2000)
assert.deepEqual(sm.setup.realtimeInputConfig.automaticActivityDetection, { endOfSpeechSensitivity: 'END_SENSITIVITY_LOW', prefixPaddingMs: 200, silenceDurationMs: 900 });
assert.equal(liveConfigFromEnv('k', { LIVE_SILENCE_MS: '50' } as never)!.silenceMs, 300);
// Noto'g'ri til: boshqa yozuvlar, o'zbek uchun kirill, ispan/portugal so'zlari; ingliz va o'zbek matni — to'g'ri
for (const t of ['你好，我们开始吧', '안녕하세요', 'مرحبا', 'Hola, ¿cómo estás? Muy bien, gracias', 'Olá, você está bem? Muito obrigado']) assert.equal(wrongLanguage(t, 'uz'), true, t);
assert.equal(wrongLanguage('Привет, как дела?', 'uz'), true, 'o‘zbek (lotin) uchun kirill — xato');
assert.equal(wrongLanguage('Привет, как дела?', 'ru'), false, 'rus tili tanlangan bo‘lsa — to‘g‘ri');
// Qirg'iz / tojik / qozoq / rus o'quvchiga o'zbekcha javob — xato; qozoq/qirg'iz/tojikka sof ruscha — xato; o'z tilida — to'g'ri
for (const c of ['ky', 'tg', 'kk', 'ru', 'en']) assert.equal(wrongLanguage('Kechirasiz, tushunmadim — yana bir bor ayting.', c), true, `uz → ${c}`);
assert.equal(wrongLanguage('Kechirasiz, tushunmadim — yana bir bor ayting.', 'uz'), false);
for (const c of ['ky', 'tg', 'kk']) assert.equal(wrongLanguage('Что ты сказал? Скажи ещё раз, пожалуйста, очень плохо слышно.', c), true, `ru → ${c}`);
assert.equal(wrongLanguage('Кечириңиз, түшүнгөн жокмун — дагы бир жолу айтып бересизби?', 'ky'), false);
assert.equal(wrongLanguage('Бубахшед, нафаҳмидам — боз як бор гуфта метавонед?', 'tg'), false);
assert.equal(wrongLanguage('Кешіріңіз, түсінбедім — тағы бір рет айтыңызшы.', 'kk'), false);
assert.equal(wrongLanguage('Not "I go" — "I went". Go to school and say it again, please.', 'ky'), false, 'inglizcha — har doim mumkin');
for (const t of ['Not "I go" — "I went", it is past! Say it again.', 'Eshitmadim! Qattiqroq gapir. Bu nima endi?', 'What do you do para... sorry, for fun?']) assert.equal(wrongLanguage(t, 'uz'), false, t);

// To'liq yo'l: soxta Gemini serveri. Birinchi model "topilmaydi" (1008), zaxira model ishlaydi.
const db = new DatabaseSync(':memory:'); ensureLiveTable(db);
const upstream = new WebSocketServer({ port: 0 });
const seenModels: string[] = []; const gotAudio: number[] = []; let sawGreeting = false;
upstream.on('connection', (ws, req) => {
  assert.match(req.url ?? '', /key=AQ\.k/);
  ws.on('message', (raw) => {
    const m = JSON.parse(raw.toString());
    if (m.setup) {
      seenModels.push(m.setup.model);
      if (m.setup.model === 'models/bad-model') { ws.close(1008, 'model not found'); return; }
      ws.send(JSON.stringify({ setupComplete: {} }));
      return;
    }
    if (m.clientContent) { sawGreeting = true; return; }
    if (m.realtimeInput) {
      assert.equal(m.realtimeInput.audio.mimeType, 'audio/pcm;rate=16000');
      gotAudio.push(Buffer.from(m.realtimeInput.audio.data, 'base64').length);
      const pcm = Buffer.alloc(480).toString('base64');
      ws.send(JSON.stringify({ serverContent: { inputTranscription: { text: 'I go school' }, modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: pcm } }] } } }));
      ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Hahaha! Not I go — I went!' }, turnComplete: true } }));
    }
  });
});
await new Promise((r) => upstream.once('listening', r));
const upPort = (upstream.address() as { port: number }).port;

const cfg = { ...cfg0, model: 'bad-model', fallbackModel: 'gemini-2.5-flash-native-audio-preview-12-2025', url: `ws://127.0.0.1:${upPort}` };
const ended: { pid: number; secs: number; model: string }[] = []; const styles: number[] = [];
const http = createServer((_q, s) => { s.end(); });
attachLive(http, {
  db, cfg,
  auth: (t) => (t === 'good' ? { id: 7, staff: false, subscriberLeftSec: 0 } : null),
  prompt: (o) => { styles.push(o.style); return `bandi adult=${o.adult} native=${o.native}`; },
  native: (l) => (l === 'ru' ? 'Russian' : 'Uzbek'),
  onEnd: (pid, secs, model) => { ended.push({ pid, secs, model }); recordLive(db, pid, secs); },
  log: () => undefined,
});
await new Promise<void>((r) => http.listen(0, '127.0.0.1', () => r()));
const port = (http.address() as { port: number }).port;

// noto'g'ri token
{
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?token=bad`);
  const msg = await new Promise<string>((r) => ws.on('message', (d) => r(d.toString())));
  assert.equal(JSON.parse(msg).code, 401);
}
// to'g'ri: ready → ovoz yuboriladi → Sellzen ovozi (ikkilik) va matn nusxalari keladi
{
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?token=good&adult=1&lang=uz&level=B1`);
  const events: string[] = []; let audioBytes = 0; const emotions: string[] = [];
  await new Promise<void>((resolve) => {
    ws.on('message', (d, bin) => {
      if (bin) { audioBytes += (d as Buffer).length; return; }
      const m = JSON.parse(d.toString()); events.push(m.type); if (m.type === 'emotion') emotions.push(m.value);
      if (m.type === 'ready') ws.send(Buffer.alloc(640), { binary: true });
      if (m.type === 'turn') resolve();
    });
  });
  ws.send(JSON.stringify({ type: 'end' }));
  await new Promise((r) => ws.on('close', r));
  assert.deepEqual(seenModels, ['models/bad-model', 'models/gemini-2.5-flash-native-audio-preview-12-2025'], 'zaxira modelga o‘tdi');
  assert.ok(sawGreeting, 'Sellzen suhbatni o‘zi boshlaydi');
  assert.deepEqual(gotAudio, [640]);
  assert.equal(audioBytes, 480);
  assert.deepEqual(events.filter((e) => e !== 'in' && e !== 'out'), ['ready', 'emotion', 'turn']);
  assert.deepEqual(emotions, ['laugh'], 'kulgi ekranga hissiyot sifatida yuborildi');
  assert.deepEqual(styles, [2], '18+ va uslub berilmagan — Qattiq (2)');
  assert.ok(events.includes('in') && events.includes('out'));
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(ended.length, 1); assert.equal(ended[0]!.pid, 7); assert.equal(ended[0]!.model, 'gemini-2.5-flash-native-audio-preview-12-2025');
  assert.ok(liveUsedToday(db, 7) > 0);
}
// bepul daqiqa tugagan — darhol "limit"
{
  recordLive(db, 7, 10_000);
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?token=good`);
  const msg = await new Promise<string>((r) => ws.on('message', (d) => r(d.toString())));
  assert.equal(JSON.parse(msg).type, 'limit');
}
// Token subprotocol sarlavhasida (URL'da emas): server protokolni tanlaydi va tokenni o'qiydi
{
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?lang=uz`, ['sellzen.v1', 'tk.good']);
  const msg = await new Promise<string>((r) => ws.on('message', (d) => r(d.toString())));
  assert.equal(ws.protocol, 'sellzen.v1', 'server sellzen.v1 protokolini tanladi');
  assert.equal(JSON.parse(msg).type, 'limit', 'token sarlavhadan o‘qildi (401 emas, kunlik limit)');
  const bad = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live`, ['sellzen.v1', 'tk.bad']);
  assert.equal(JSON.parse(await new Promise<string>((r) => bad.on('message', (d) => r(d.toString())))).code, 401);
}
assert.equal(tokenFromProtocols('sellzen.v1, tk.abc123'), 'abc123');
assert.equal(tokenFromProtocols(undefined), null);
// Buzuq manzilli upgrade so'rovi jarayonni yiqitmaydi (avval: new URL() istisnosi event handler ichida → crash)
{
  const { connect } = await import('node:net');
  const sock = connect(port, '127.0.0.1');
  await new Promise<void>((r) => sock.on('connect', () => r()));
  sock.write('GET //%2e%2e%2f%2eenv HTTP/1.1\r\nHost: x\r\nConnection: Upgrade\r\nUpgrade: websocket\r\nSec-WebSocket-Version: 13\r\nSec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\r\n');
  await new Promise<void>((r) => sock.on('close', () => r()));
  // server hali tirik: oddiy ulanish ishlaydi
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?token=bad`);
  assert.equal(JSON.parse(await new Promise<string>((r) => ws.on('message', (d) => r(d.toString())))).code, 401, 'buzuq so‘rovdan keyin server ishlayapti');
}
// Noto'g'ri tilga o'tish himoyasi + xotira oqimi (alohida soxta Gemini): ustoz xitoycha gapira boshlasa — ovoz to'xtaydi,
// mijozga 'interrupted', matn yuborilmaydi, modelga "faqat ingliz/o'zbek, qayta so'ra" ko'rsatmasi ketadi; suhbat yozuvi onTranscript'ga
{
  const up2 = new WebSocketServer({ port: 0 });
  const toModel: string[] = [];
  up2.on('connection', (ws) => {
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.setup) { ws.send(JSON.stringify({ setupComplete: {} })); return; }
      if (m.clientContent) { toModel.push(m.clientContent.turns[0].parts[0].text); if (toModel.length === 1) {
        for (const t of ['I go school', 'yesterday I go park', 'he like football']) { ws.send(JSON.stringify({ serverContent: { inputTranscription: { text: t } } })); ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Not that! Again.' }, turnComplete: true } })); }
        ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: '你好，我们' }, modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] } } }));
        ws.send(JSON.stringify({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] }, turnComplete: true } }));
        ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Eshitmadim, qattiqroq gapir!' }, turnComplete: true } }));
      } }
    });
  });
  await new Promise((r) => up2.once('listening', r));
  const transcripts: { pid: number; n: number; lang: string }[] = []; const kicks: string[] = [];
  const http2 = createServer((_q, s) => { s.end(); });
  attachLive(http2, {
    db, cfg: { ...cfg0, url: `ws://127.0.0.1:${(up2.address() as { port: number }).port}` },
    auth: (t) => (t === 'm' ? { id: 9, staff: true, subscriberLeftSec: 0 } : null),
    prompt: (o) => `first=${o.firstCall} mem=${o.memory}`,
    native: () => 'Uzbek (Latin script)',
    context: () => ({ firstCall: false, memory: 'MEMORY x' }),
    kickoff: (o) => { const k = `kick first=${o.firstCall} mem=${o.hasMemory}`; kicks.push(k); return k; },
    onTranscript: (pid, turns, lang) => transcripts.push({ pid, n: turns.filter((t) => t.who === 'learner').length, lang }),
    onEnd: () => undefined, log: () => undefined,
  });
  await new Promise<void>((r) => http2.listen(0, '127.0.0.1', () => r()));
  const ws = new WebSocket(`ws://127.0.0.1:${(http2.address() as { port: number }).port}/api/ai/live?lang=uz`, ['sellzen.v1', 'tk.m']);
  const events: { type: string; text?: string }[] = []; let audio = 0;
  await new Promise<void>((resolve) => ws.on('message', (d, bin) => { if (bin) { audio++; return; } const m = JSON.parse(d.toString()); events.push(m); if (m.type === 'out' && /Eshitmadim/.test(m.text)) resolve(); }));
  await new Promise((r) => setTimeout(r, 100)); // modelga ketgan tuzatish xabari yetib kelsin
  assert.deepEqual(kicks, ['kick first=false mem=true'], 'qo‘ng‘iroq boshi: tanishtirmaydi, xotiradan boshlaydi');
  assert.ok(events.some((e) => e.type === 'interrupted'), 'mijozda ovoz to‘xtatildi');
  assert.ok(!events.some((e) => e.type === 'out' && /你好/.test(e.text ?? '')), 'xitoycha matn mijozga yuborilmadi');
  assert.equal(audio, 0, 'noto‘g‘ri tildagi ovoz mijozga yuborilmadi');
  assert.match(toModel[1] ?? '', /forbidden language.*ONLY English or Uzbek/, 'modelga qayta so‘rash ko‘rsatmasi ketdi');
  ws.send(JSON.stringify({ type: 'end' }));
  await new Promise((r) => setTimeout(r, 50));
  assert.deepEqual(transcripts, [{ pid: 9, n: 3, lang: 'uz' }], 'suhbat yozuvi (3 ta o‘quvchi navbati) xotira uchun berildi');
  http2.close(); up2.close();
}
// Gemini sozlashni kechiktirsa: zaxira modelga o'tadi; u ham javob bermasa — mijozga aniq xato ("o'ylayapman"da qolib ketmaydi)
{
  const up3 = new WebSocketServer({ port: 0 });
  const seen: string[] = [];
  up3.on('connection', (ws) => ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.setup) { seen.push(m.setup.model); if (/fb-model/.test(m.setup.model) && process.env.__FB_OK === '1') ws.send(JSON.stringify({ setupComplete: {} })); } }));
  await new Promise((r) => up3.once('listening', r));
  const logs: string[] = [];
  const mk = (fallbackModel: string | null) => { const h = createServer((_q, s) => { s.end(); }); attachLive(h, {
    db, cfg: { ...cfg0, fallbackModel, setupTimeoutMs: 150, url: `ws://127.0.0.1:${(up3.address() as { port: number }).port}` },
    auth: () => ({ id: 11, staff: true, subscriberLeftSec: 0 }), prompt: () => 'p', native: () => 'Uzbek', onEnd: () => undefined, log: (m) => logs.push(m),
  }); return h; };
  const run = async (h: ReturnType<typeof createServer>) => { await new Promise<void>((r) => h.listen(0, '127.0.0.1', () => r()));
    const ws = new WebSocket(`ws://127.0.0.1:${(h.address() as { port: number }).port}/api/ai/live`, ['sellzen.v1', 'tk.x']);
    const m = await new Promise<{ type: string; code?: number }>((r) => ws.on('message', (d, bin) => { if (!bin) r(JSON.parse(d.toString())); }));
    ws.close(); h.close(); return m; };
  const t0 = Date.now();
  const r1 = await run(mk(null));
  assert.equal(r1.type, 'error'); assert.equal(r1.code, 504, 'sozlash kechikdi — aniq xato'); assert.ok(Date.now() - t0 < 2000, 'tez qaytadi');
  assert.ok(logs.some((l) => /setup-timeout/.test(l)));
  process.env.__FB_OK = '1'; seen.length = 0;
  const r2 = await run(mk('models/fb-model'));
  assert.equal(r2.type, 'ready', 'zaxira model bilan ulandi'); assert.equal(seen.length, 2, 'avval asosiy, keyin zaxira model');
  delete process.env.__FB_OK; up3.close();
}
http.close(); upstream.close();
// Bepul foydalanuvchilar uchun platformaning kunlik umumiy chegarasi (xarajat nazorati)
{
  const capped = liveConfigFromEnv('k', { LIVE_FREE_GLOBAL_DAILY_MINUTES: '100' } as never)!;
  assert.equal(capped.freeGlobalDailySeconds, 6000);
  assert.equal(liveAllowance(capped, { staff: false, subscriberLeftSec: 0, freeUsedTodaySec: 0, platformUsedTodaySec: 5970 }), 30, 'umumiy byudjet oxirida — qolgan soniyalar');
  assert.equal(liveAllowance(capped, { staff: false, subscriberLeftSec: 0, freeUsedTodaySec: 0, platformUsedTodaySec: 7000 }), 0, 'byudjet tugadi — bepulga Live yo‘q');
  assert.ok(liveAllowance(capped, { staff: false, subscriberLeftSec: 600, freeUsedTodaySec: 0, platformUsedTodaySec: 7000 }) > 0, 'obunachiga ta’sir qilmaydi');
  assert.equal(liveConfigFromEnv('k', {} as never)!.freeGlobalDailySeconds, 0, 'standart — chegarasiz (avvalgidek)');
}
// ---- Bosib-gapirish (push-to-talk): navbatni o'quvchi boshqaradi ----
{
  // Sozlama: avtomatik aniqlash o'chiq, ustozni faqat ataylab bosish bo'ladi; qo'lsiz rejim (eski mijozlar) o'zgarmagan
  const p = setupMessage(cfg0, 'm', 'SYS', true) as { setup: { realtimeInputConfig: Record<string, unknown> } };
  assert.deepEqual(p.setup.realtimeInputConfig, { automaticActivityDetection: { disabled: true }, activityHandling: 'START_OF_ACTIVITY_INTERRUPTS' });
  assert.equal((setupMessage(cfg0, 'm', 'SYS') as { setup: { realtimeInputConfig: { automaticActivityDetection: { silenceDurationMs: number } } } }).setup.realtimeInputConfig.automaticActivityDetection.silenceDurationMs, 900);

  // Navigatsiya: faqat ochishni aniq buyurganda ("darsga o't"); "menga o'rgat" yoki dars haqida savol — suhbat davom etadi
  for (const t of ["darsga o't", 'darsga o‘tamiz', "darsni och", 'darsga kiraylik', 'Go to the lesson', 'open my lesson please', 'start the next lesson', 'перейдём к уроку', 'открой урок', 'сабаққа өтейік', 'сабакка өтөлү']) assert.equal(navIntent(t), 'lesson', t);
  assert.equal(navIntent("rejani och"), 'plan'); assert.equal(navIntent('show me my plan'), 'plan');
  assert.equal(navIntent("xatolarimni och"), 'mistakes'); assert.equal(navIntent('open my mistakes'), 'mistakes');
  assert.equal(navIntent("o'yinlarga o't"), 'games'); assert.equal(navIntent('open games'), 'games');
  for (const t of ["menga ingliz tilini o'rgat", 'Can you teach me English?', 'I want to learn English', 'bu darsda nima bor?', 'dars qiziq edi', 'what is the lesson about?', 'I went to the market yesterday', 'bugun ob-havo yaxshi', 'научи меня английскому', 'meni kechiring']) assert.equal(navIntent(t), null, t);
  // Kontekst: kesiladi, begona yo'nalish rad etiladi, ko'rsatma matni tuziladi
  const cx = sanitizeCtx({ level: 'B1', goal: 'IELTS', minutes: 20, examDays: 23, today: [{ title: 'Present perfect <b>', minutes: 12, why: 'repeated error: tenses', route: '#/learn/b1-u3-l2' }, { title: 'Evil', route: 'javascript:alert(1)' }], weak: ['tenses', 'articles'], mistakesDue: 6, done: ['Past simple'] })!;
  assert.equal(cx.today[0]!.route, '#/learn/b1-u3-l2'); assert.equal(cx.today[1]!.route, '', 'ruxsat etilmagan yo‘nalish olib tashlandi'); assert.ok(!/[<>]/.test(cx.today[0]!.title));
  const cp = ctxPrompt(cx); assert.match(cp, /LEARNER CONTEXT/); assert.match(cp, /level B1; goal: IELTS; 20 min\/day; exam in 23 days/); assert.match(cp, /1\) "Present perfect b"/); assert.match(cp, /6 saved mistakes/);
  assert.equal(ctxPrompt(null), ''); assert.equal(ctxPrompt(sanitizeCtx({})), ''); assert.equal(sanitizeCtx('x'), null);
  assert.equal(navRoute('lesson', cx), '#/learn/b1-u3-l2'); assert.equal(navRoute('lesson', null), '#/learn'); assert.equal(navRoute('plan', cx), '#/'); assert.equal(navRoute('mistakes', cx), '#/mistakes');
  // WAV: sarlavha to'g'ri; PCM balandligi
  assert.equal(UNSURE_SCORE, -0.75); assert.equal(PARTLY_SCORE, -0.4); assert.match(partlyTurn('he go'), /«he go».*Answer it normally.*never treat one odd/s); assert.match(unsureTurn('salom'), /«salom»/); assert.match(unsureTurn('x'), /did not catch it/);
  const wav = pcmToWav(Buffer.alloc(3200)); assert.equal(wav.length, 3244); assert.equal(wav.subarray(0, 4).toString(), 'RIFF'); assert.equal(wav.readUInt32LE(24), 16000); assert.equal(wav.readUInt32LE(40), 3200);
  const loud = Buffer.alloc(3200); for (let i = 0; i < 1600; i++) loud.writeInt16LE(i % 2 ? 16000 : -16000, i * 2);
  assert.ok(pcmRms(loud) > 0.4 && pcmRms(Buffer.alloc(3200)) === 0);

  const up = new WebSocketServer({ port: 0 });
  const seen: Record<string, unknown>[] = [];
  up.on('connection', (ws) => {
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString()); seen.push(m);
      if (m.setup) { ws.send(JSON.stringify({ setupComplete: {} })); return; }
      if (m.realtimeInput?.activityEnd) {
        ws.send(JSON.stringify({ serverContent: { inputTranscription: { text: "darsga o'tamiz" } } }));
        ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Sure!' }, modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] }, turnComplete: true } }));
      }
    });
  });
  await new Promise((r) => up.once('listening', r));
  const prompts: boolean[] = [];
  const h = createServer((_q, s) => { s.end(); });
  attachLive(h, {
    db, cfg: { ...cfg0, url: `ws://127.0.0.1:${(up.address() as { port: number }).port}`, wrapLeadSec: 4 },
    auth: (t) => (t === 'p' ? { id: 21, staff: true, subscriberLeftSec: 0 } : null),
    prompt: (o) => { prompts.push(o.ptt); return 'SYS'; },
    native: () => 'Uzbek (Latin script)', tr: (_l, t) => `[tr] ${t}`,
    onEnd: () => undefined, log: () => undefined,
  });
  await new Promise<void>((r) => h.listen(0, '127.0.0.1', () => r()));
  const hp = (h.address() as { port: number }).port;
  const ws = new WebSocket(`ws://127.0.0.1:${hp}/api/ai/live?lang=uz&ptt=1&ctx=1`, ['sellzen.v1', 'tk.p']);
  ws.on('open', () => ws.send(JSON.stringify({ type: 'ctx', ctx: { level: 'B1', today: [{ title: 'Present perfect', minutes: 12, why: 'weak skill', route: '#/learn/b1-u3-l2' }] } })));
  const msgs: { type: string; [k: string]: unknown }[] = [];
  ws.on('message', (d, bin) => { if (!bin) msgs.push(JSON.parse(d.toString())); });
  await new Promise<void>((r) => { const t = setInterval(() => { if (msgs.some((m) => m.type === 'ready')) { clearInterval(t); r(); } }, 10); });
  const ready = msgs.find((m) => m.type === 'ready')!;
  assert.equal(ready.ptt, true); assert.equal(ready.capSec, 600, 'ruxsat etilgan soniyalar mijozga aytiladi (10:00 taymer)');
  assert.deepEqual(prompts, [true], 'ko‘rsatma bosib-gapirish rejimini biladi');
  const audioMsgs = () => seen.filter((m) => (m as { realtimeInput?: { audio?: unknown } }).realtimeInput?.audio).length;
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  ws.send(Buffer.alloc(640), { binary: true }); await wait(60);
  assert.equal(audioMsgs(), 0, 'tugma bosilmagan paytdagi ovoz (shovqin) Gemini’ga bormaydi');
  ws.send(JSON.stringify({ type: 'activity', on: false })); await wait(40);
  assert.equal(seen.some((m) => (m as { realtimeInput?: { activityEnd?: unknown } }).realtimeInput?.activityEnd), false, 'bosilmagan — "qo‘yib yuborildi" e’tiborsiz');
  ws.send(JSON.stringify({ type: 'activity', on: true })); ws.send(JSON.stringify({ type: 'activity', on: true }));
  ws.send(Buffer.alloc(640), { binary: true }); ws.send(Buffer.alloc(640), { binary: true }); await wait(80);
  assert.equal(audioMsgs(), 2, 'bosib turilganda ovoz yuboriladi');
  assert.equal(seen.filter((m) => (m as { realtimeInput?: { activityStart?: unknown } }).realtimeInput?.activityStart).length, 1, 'takroriy "bosildi" bitta activityStart');
  ws.send(JSON.stringify({ type: 'activity', on: false }));
  await new Promise<void>((r) => { const t = setInterval(() => { if (msgs.some((m) => m.type === 'turn')) { clearInterval(t); r(); } }, 10); });
  assert.ok(seen.some((m) => (m as { realtimeInput?: { activityEnd?: unknown } }).realtimeInput?.activityEnd), 'qo‘yib yuborildi → activityEnd');
  const nv = msgs.filter((m) => m.type === 'navigate');
  assert.equal(nv.length, 1, '"darsga o‘tamiz" — tugma emas, mijoz o‘zi o‘tadi (qo‘ng‘iroqda bir marta)'); assert.equal(nv[0]!.route, '#/learn/b1-u3-l2', 'bugungi rejadagi dars');
  assert.ok(!msgs.some((m) => m.type === 'suggest'), 'eski "Darslarga o‘tish" tugmasi xabari yo‘q');
  assert.match(JSON.stringify(seen.find((m) => (m as { clientContent?: unknown }).clientContent)), /LEARNER CONTEXT.*level B1.*Present perfect/, 'ustozga o‘quvchi konteksti (reja) berildi');
  ws.send(Buffer.alloc(640), { binary: true }); await wait(60);
  assert.equal(audioMsgs(), 2, 'qo‘yib yuborilgandan keyin ovoz yana yuborilmaydi');
  ws.send(JSON.stringify({ type: 'end' })); await new Promise((r) => ws.on('close', r));
  h.close(); up.close();
}
// ---- Tanish (Scribe) rejimi: ovoz serverda yig'iladi → matn → Gemini; xato bo'lsa — ovoz Gemini'ga ----
{
  const up = new WebSocketServer({ port: 0 });
  const seen: Record<string, any>[] = []; // eslint-disable-line @typescript-eslint/no-explicit-any
  let upWs: import('ws').WebSocket | null = null;
  up.on('connection', (ws) => {
    upWs = ws;
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString()); seen.push(m);
      if (m.setup) { ws.send(JSON.stringify({ setupComplete: {} })); return; }
      const t = m.clientContent?.turns?.[0]?.parts?.[0]?.text as string | undefined;
      if (t && /^\(The learner/.test(t)) { // salomlashish: uzoq gapiradigan (turnComplete yo'q) ustoz
        ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Salom! ' }, modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] } } }));
        return;
      }
      if (t) { ws.send(JSON.stringify({ serverContent: { interrupted: true } })); ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Javob: ' + t }, modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] }, turnComplete: true } })); }
      if (m.realtimeInput?.activityEnd) ws.send(JSON.stringify({ serverContent: { inputTranscription: { text: 'gemini eshitdi' }, outputTranscription: { text: 'ok' }, turnComplete: true } }));
    });
  });
  await new Promise((r) => up.once('listening', r));
  const asrCalls: { wavBytes: number; lang: string; prefer?: string }[] = []; const prompts: { ptt: boolean; asr: boolean }[] = [];
  let asrMode: 'text' | 'empty' | 'fail' | 'nav' | 'unsure' | 'partly' = 'text';
  const h = createServer((_q, s2) => { s2.end(); });
  attachLive(h, {
    db, cfg: { ...cfg0, url: `ws://127.0.0.1:${(up.address() as { port: number }).port}` },
    auth: () => ({ id: 31, staff: true, subscriberLeftSec: 0 }),
    prompt: (o) => { prompts.push({ ptt: o.ptt, asr: o.asr }); return 'SYS'; },
    native: () => 'Uzbek (Latin script)',
    asr: async (_pid, wav, lang, prefer) => { asrCalls.push({ wavBytes: wav.length, lang, prefer }); if (asrMode === 'fail') throw new Error('limit'); if (asrMode === 'empty') return { text: '', lang: null }; if (asrMode === 'unsure') return { text: "darsga o'tamiz", lang: 'uzb', score: -0.9 }; if (asrMode === 'partly') return { text: 'men kecha school ga bordim', lang: 'uzb', score: -0.55 }; return { text: asrMode === 'nav' ? "darsga o'tamiz" : 'I go to school yesterday', lang: 'eng', score: -0.05 }; },
    onEnd: () => undefined, log: () => undefined,
  });
  await new Promise<void>((r) => h.listen(0, '127.0.0.1', () => r()));
  const ws = new WebSocket(`ws://127.0.0.1:${(h.address() as { port: number }).port}/api/ai/live?lang=uz&ptt=1`, ['sellzen.v1', 'tk.x']);
  const msgs: { type: string; [k: string]: unknown }[] = []; let audioIn = 0;
  ws.on('message', (d, bin) => { if (bin) audioIn++; else msgs.push(JSON.parse(d.toString())); });
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const until = async (f: () => boolean, ms = 3000) => { for (let i = 0; i < ms / 10; i++) { if (f()) return; await wait(10); } assert.fail('kutilgan holat bo‘lmadi'); };
  await until(() => msgs.some((m) => m.type === 'ready'));
  assert.equal(msgs.find((m) => m.type === 'ready')!.asr, true, 'mijozga tanish rejimi aytiladi'); assert.deepEqual(prompts, [{ ptt: true, asr: true }], 'ko‘rsatma tanish rejimini biladi');
  await until(() => audioIn >= 1); // ustoz salomlashmoqda (hali tugamagan)
  const press = async (frames: number, hold = 40) => { ws.send(JSON.stringify({ type: 'activity', on: true })); for (let i = 0; i < frames; i++) ws.send(Buffer.alloc(3200), { binary: true }); await wait(hold); ws.send(JSON.stringify({ type: 'activity', on: false })); };
  const upCount = (f: (m: Record<string, any>) => boolean) => seen.filter(f).length; // eslint-disable-line @typescript-eslint/no-explicit-any

  // 0) Tasodifiy qisqa tegish (egasi, 2026-11-27: "uzilib gapiryapti"): ustoz to'xtatilmaydi, javobining ovozi davom etadi
  {
    const t0 = audioIn;
    ws.send(JSON.stringify({ type: 'activity', on: true })); await wait(60); ws.send(JSON.stringify({ type: 'activity', on: false, discard: true }));
    await wait(400);
    assert.equal(msgs.some((m) => m.type === 'interrupted'), false, 'qisqa tegish ustozni to‘xtatmadi');
    upWs!.send(JSON.stringify({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] } } }));
    await until(() => audioIn > t0);
  }
  // 1) Ustoz gapirayotganda bosildi: "interrupted", eski javobning qolgan ovozi tashlanadi; gap Scribe → matn → Gemini; Gemini'ga ovoz bormaydi
  const a0 = audioIn;
  ws.send(JSON.stringify({ type: 'activity', on: true }));
  await until(() => msgs.some((m) => m.type === 'interrupted'));
  upWs!.send(JSON.stringify({ serverContent: { modelTurn: { parts: [{ inlineData: { mimeType: 'audio/pcm;rate=24000', data: Buffer.alloc(480).toString('base64') } }] } } })); await wait(80);
  assert.equal(audioIn, a0, 'bosilgandan keyin eski javobning ovozi tashlandi');
  for (let i = 0; i < 10; i++) ws.send(Buffer.alloc(3200), { binary: true });
  ws.send(JSON.stringify({ type: 'activity', on: false }));
  await until(() => msgs.some((m) => m.type === 'in'));
  assert.deepEqual(asrCalls.map((c) => c.lang), ['uz']); assert.equal(asrCalls[0]!.wavBytes, 44 + 10 * 3200, 'Scribe\'ga yig‘ilgan ovoz WAV bo‘lib bordi');
  assert.equal(msgs.find((m) => m.type === 'in')!.text, 'I go to school yesterday');
  await until(() => audioIn > a0); // yangi javob eshitiladi
  assert.equal(upCount((m) => !!m.realtimeInput), 0, 'tanish ishladi — Gemini\'ga ovoz ham, activity ham yuborilmadi');
  assert.equal(upCount((m) => m.clientContent?.turns?.[0]?.parts?.[0]?.text === 'I go to school yesterday'), 1, 'Gemini\'ga matn bordi');

  // 2) Juda qisqa navbat — Scribe chaqirilmaydi; bo'sh matn — "noVoice", Gemini'ga hech narsa bormaydi
  const n0 = asrCalls.length, c0 = upCount((m) => !!m.clientContent);
  await press(1); await until(() => msgs.filter((m) => m.type === 'noVoice').length >= 1); assert.equal(asrCalls.length, n0, 'qisqa navbat Scribe\'ga yuborilmaydi');
  asrMode = 'empty'; await press(10); await until(() => msgs.filter((m) => m.type === 'noVoice').length >= 2); assert.equal(asrCalls.length, n0 + 1);
  assert.equal(upCount((m) => !!m.clientContent), c0, 'bo‘sh matn Gemini\'ga yuborilmadi');

  // 3) Tanish ishlamadi (limit/xato) — navbat ovozi Gemini'ga yuboriladi (activityStart → ovoz → activityEnd); Gemini'ning o'z matni ko'rsatiladi
  asrMode = 'fail'; const r0 = upCount((m) => !!m.realtimeInput?.audio);
  await press(10); await until(() => msgs.some((m) => m.type === 'in' && m.text === 'gemini eshitdi'));
  assert.ok(upCount((m) => !!m.realtimeInput?.audio) - r0 >= 10, 'ovoz Gemini\'ga yuborildi'); assert.equal(upCount((m) => !!m.realtimeInput?.activityStart), 1); assert.equal(upCount((m) => !!m.realtimeInput?.activityEnd), 1);

  // 3b) Past ishonchli tanish: matn ustozga "ishonchsiz" belgisi bilan boradi (o'quvchi ayblanmasin), navigatsiya ishga tushmaydi
  asrMode = 'unsure'; await press(10); await until(() => upCount((m) => /NOT sure/.test(m.clientContent?.turns?.[0]?.parts?.[0]?.text ?? '')) >= 1);
  assert.ok(upCount((m) => /NOT sure about this turn.*darsga o'tamiz.*NEVER mock, insult or blame/s.test(m.clientContent?.turns?.[0]?.parts?.[0]?.text ?? '')) >= 1, 'ishonchsiz matn ogohlantirish bilan yuborildi');
  assert.equal(msgs.filter((m) => m.type === 'navigate').length, 0, 'ishonchsiz matn bilan ekran ochilmaydi');
  assert.equal(msgs.filter((m) => m.type === 'in').at(-1)!.text, "darsga o'tamiz", 'o‘quvchiga tanilgan matn ko‘rsatiladi');
  // 3c) "Asosan ishonchli" (-0.4…-0.75, jurnalda aksentli inglizchaning ko'pi): ustoz odatdagidek javob beradi, faqat aniq grammatik xatoni tuzatadi
  asrMode = 'partly'; await press(10); await until(() => upCount((m) => /fairly confident/.test(m.clientContent?.turns?.[0]?.parts?.[0]?.text ?? '')) >= 1);
  assert.ok(upCount((m) => /fairly confident.*men kecha school ga bordim.*Answer it normally/s.test(m.clientContent?.turns?.[0]?.parts?.[0]?.text ?? '')) === 1);
  assert.equal(upCount((m) => /NOT sure/.test(m.clientContent?.turns?.[0]?.parts?.[0]?.text ?? '')), 1, 'asosan ishonchli navbat "ishonchsiz" deb yuborilmadi');
  // 4) "darsga o'tamiz" — tanilgan matn bo'yicha navigatsiya (bir marta)
  asrMode = 'nav'; await press(10); await until(() => msgs.some((m) => m.type === 'navigate'));
  assert.equal(msgs.find((m) => m.type === 'navigate')!.route, '#/learn');
  // 4b) Tasodifiy qisqa tegish (discard): yig'ilgan ovoz tashlanadi — Scribe'ga ham, ustozga ham bormaydi
  { const n0 = asrCalls.length, c0 = upCount((m) => !!m.clientContent);
    ws.send(JSON.stringify({ type: 'activity', on: true })); for (let i = 0; i < 10; i++) ws.send(Buffer.alloc(3200), { binary: true }); await wait(40);
    ws.send(JSON.stringify({ type: 'activity', on: false, discard: true })); await wait(300);
    assert.equal(asrCalls.length, n0, 'qisqa tegish Scribe’ga yuborilmadi'); assert.equal(upCount((m) => !!m.clientContent), c0, 'ustozga hech narsa bormadi'); }
  // 5) Moslashuvchan Scribe tartibi: o'zbekcha navbat (3b) streakni nolga tushirdi; ketma-ket 2 ta inglizcha navbatdan keyin — avval inglizcha
  assert.deepEqual(asrCalls.slice(-2).map((c) => c.prefer), ['native', 'native'], 'o‘zbekchadan keyin yana ona tili birinchi');
  asrMode = 'text'; const in0 = msgs.filter((m) => m.type === 'in').length;
  await press(10); await until(() => msgs.filter((m) => m.type === 'in').length > in0);
  await press(10); await until(() => msgs.filter((m) => m.type === 'in').length > in0 + 1);
  assert.deepEqual(asrCalls.slice(-2).map((c) => c.prefer), ['native', 'en'], 'ikki inglizcha navbatdan keyin Scribe avval inglizcha taniydi');
  ws.send(JSON.stringify({ type: 'end' })); await new Promise((r) => ws.on('close', r));
  h.close(); up.close();
}
// Vaqt tugashi: ustozga oldindan "fikrni tugat, xayrlash" deyiladi; chegara turi (sessiya / kvota) mijozga aytiladi
{
  const up = new WebSocketServer({ port: 0 });
  const toModel: string[] = [];
  up.on('connection', (ws) => ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.setup) ws.send(JSON.stringify({ setupComplete: {} })); else if (m.clientContent) toModel.push(m.clientContent.turns[0].parts[0].text); }));
  await new Promise((r) => up.once('listening', r));
  const h = createServer((_q, s) => { s.end(); });
  attachLive(h, {
    db, cfg: { ...cfg0, url: `ws://127.0.0.1:${(up.address() as { port: number }).port}`, wrapLeadSec: 3, get maxSessionSec() { return 6; } },
    auth: () => ({ id: 22, staff: true, subscriberLeftSec: 0 }),
    prompt: () => 'SYS', native: () => 'Uzbek (Latin script)', tr: (_l, t) => `[tr] ${t}`,
    onEnd: () => undefined, log: () => undefined,
  });
  await new Promise<void>((r) => h.listen(0, '127.0.0.1', () => r()));
  const ws = new WebSocket(`ws://127.0.0.1:${(h.address() as { port: number }).port}/api/ai/live?lang=uz`, ['sellzen.v1', 'tk.x']);
  const msgs: { type: string; [k: string]: unknown }[] = [];
  ws.on('message', (d, bin) => { if (!bin) msgs.push(JSON.parse(d.toString())); });
  await new Promise((r) => ws.on('close', r));
  // 2026-11-26: sessiya chegarasida suhbat TUGAMAYDI — mijoz o'zi qayta ulanadi (resume), shuning uchun ustoz xayrlashmaydi
  assert.ok(!toModel.some((t) => /call ends in about/.test(t)), 'sessiya chegarasida xayrlashuv eslatmasi yo‘q');
  const lim = msgs.find((m) => m.type === 'limit')!;
  assert.equal(lim.kind, 'session'); assert.equal(lim.resume, true, 'mijozga: suhbatni davom ettir'); assert.match(String(lim.message), /^\[tr\] Suhbat vaqti tugadi/, 'sessiya tugashi — obuna taklif qilinmaydi, xabar tarjima qilinadi');
  h.close(); up.close();
}
// 2026-11-25: ishonchsiz navbatda ustoz javob beradi (eng ehtimolli ma'no), ketma-ket ikkinchi marta qayta so'ramaydi
{
  const u1 = unsureTurn('men kecha bozor bordim'), u2 = unsureTurn('men kecha bozor bordim', true);
  assert.ok(/most likely meant and ANSWER that/.test(u1) && /Do NOT correct grammar from this turn/.test(u1) && /Only if it makes no sense at all/.test(u1));
  assert.ok(/do NOT ask again/.test(u2) && !/Only if it makes no sense at all/.test(u2), 'ikkinchi ishonchsiz navbatda qayta so‘ramaydi');
}
// 2026-11-26: erkak/ayol ustoz ovozi; qayta ulanishda salomlashmasdan davom etish; bitta o'quvchida bitta faol qo'ng'iroq; kechikish jurnali
{
  const L = await import('./live');
  const cfgF = L.liveConfigFromEnv('AQ.k', {})!;
  assert.equal(cfgF.voiceFemale, 'Leda'); assert.equal(L.liveConfigFromEnv('AQ.k', { GEMINI_LIVE_VOICE_FEMALE: 'Kore' })!.voiceFemale, 'Kore');
  const sm = L.setupMessage(cfgF, 'm', 'SYS', true, 'Leda') as { setup: { generationConfig: { speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: string } } } } } };
  assert.equal(sm.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Leda');
  const k = L.continueKick('Learner: I go to school\nSellzen: We say «I went».', 'Uzbek (Latin script)');
  assert.ok(/Do NOT greet/.test(k) && /SAME conversation/.test(k) && k.includes('I go to school'), 'qayta ulanish: oldingi gaplardan davom');
  assert.equal(L.sanitizeCtx({ recent: 'Learner: hi <x>' })?.recent, 'Learner: hi x');
  assert.equal(L.statLine({ waits: [1000, 3000], asrMs: [500] }), ' kutish=2.0/3.0s asr=0.5/0.5s');

  // Ikkinchi ulanish (shu o'quvchi) — birinchisi yopiladi; ?voice=f — ayol ovozi Gemini'ga boradi; ?cont=1 — salomlashmaydi
  const db2 = new DatabaseSync(':memory:'); ensureLiveTable(db2);
  const up = new WebSocketServer({ port: 0 });
  const setups: string[] = []; const kicks: string[] = [];
  up.on('connection', (ws) => ws.on('message', (raw) => { const m = JSON.parse(raw.toString()); if (m.setup) { setups.push(m.setup.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName); ws.send(JSON.stringify({ setupComplete: {} })); } else if (m.clientContent) kicks.push(m.clientContent.turns[0].parts[0].text); }));
  await new Promise((r) => up.once('listening', r));
  const h = createServer((_q, sres) => { sres.end(); });
  const logs: string[] = [];
  L.attachLive(h, { db: db2, cfg: { ...cfgF, url: `ws://127.0.0.1:${(up.address() as { port: number }).port}` }, auth: () => ({ id: 31, staff: true, subscriberLeftSec: 0 }), prompt: () => 'SYS', native: () => 'Uzbek (Latin script)', onEnd: () => undefined, log: (m) => logs.push(m), kickoff: () => 'HELLO-KICK' });
  await new Promise<void>((r) => h.listen(0, '127.0.0.1', () => r()));
  const port = (h.address() as { port: number }).port;
  const open = (q: string) => new Promise<WebSocket>((res) => { const w = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?lang=uz&${q}`, ['sellzen.v1', 'tk.x']); w.on('message', (d, bin) => { if (!bin && JSON.parse(d.toString()).type === 'ready') res(w); }); });
  const w1 = await open('voice=f');
  const closed1 = new Promise((r) => w1.on('close', r));
  const w2 = await open('cont=1');
  await closed1; // birinchi ulanish yopildi
  for (let i = 0; i < 40 && kicks.length < 2; i++) await new Promise((r) => setTimeout(r, 25));
  assert.deepEqual(setups, ['Leda', 'Puck'], 'ayol ovozi; ikkinchisi standart (erkak)');
  assert.equal(kicks[0], 'HELLO-KICK'); assert.ok(/Do NOT greet/.test(kicks[1] ?? ''), 'qayta ulanish — salomlashuvsiz davom');
  assert.ok(logs.some((l) => / \(replaced\)/.test(l)), 'eski ulanish "replaced" bilan yopildi');
  w2.close(); await new Promise((r) => setTimeout(r, 50)); h.close(); up.close();
}
// Ustoz savolsiz to'xtab qoldi (egasi, 2026-11-27: "barakalla yoki so'kish bilan to'xtab qolyapti, men gapirmaguncha jim turibdi"):
// o'quvchi jim tursa — bir marta davom ettirish so'raladi; savol bilan tugasa, o'quvchi bosib gapira boshlasa yoki xayrlashsa — yo'q; takror-takror emas
{
  assert.equal(handsTurnBack('Barakalla! Juda zo‘r.'), false);
  assert.equal(handsTurnBack('Seriously? «I go yesterday»? It is «I went».'), false, 'savol belgisi oxirida emas — topshiriq yo‘q');
  assert.equal(handsTurnBack('Nice! What did you eat for breakfast?'), true);
  assert.equal(handsTurnBack('Zo‘r! Endi shu gapni o‘tgan zamonda ayting.'), true);
  assert.equal(handsTurnBack('Kecha nima qildingiz'), true, 'savol belgisisiz savol so‘zi');
  assert.equal(handsTurnBack('Good job today. Goodbye!'), true, 'xayrlashuv');
  assert.equal(handsTurnBack(''), true);
  const up = new WebSocketServer({ port: 0 }); const texts: string[] = [];
  let reply = 'Barakalla! Juda zo‘r.';
  up.on('connection', (ws) => {
    ws.on('message', (raw) => {
      const m = JSON.parse(raw.toString());
      if (m.setup) { ws.send(JSON.stringify({ setupComplete: {} })); return; }
      const t = m.clientContent?.turns?.[0]?.parts?.[0]?.text as string | undefined;
      if (t) { texts.push(t); ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: /waiting for you/.test(t) ? 'Hmm, xo‘sh.' : reply }, turnComplete: true } })); }
    });
  });
  await new Promise((r) => up.once('listening', r));
  const h = createServer((_q, s) => { s.end(); }); const logs: string[] = [];
  attachLive(h, { db, cfg: { ...cfg0, url: `ws://127.0.0.1:${(up.address() as { port: number }).port}`, nudgeMs: 150 }, auth: (t) => (t === 'n' ? { id: 41, staff: true, subscriberLeftSec: 0 } : null), prompt: () => 'SYS', native: () => 'Uzbek (Latin script)', tr: (_l, t) => t, onEnd: () => undefined, log: (l) => logs.push(l) });
  await new Promise<void>((r) => h.listen(0, '127.0.0.1', () => r()));
  const ws = new WebSocket(`ws://127.0.0.1:${(h.address() as { port: number }).port}/api/ai/live?lang=uz&ptt=1`, ['sellzen.v1', 'tk.n']);
  const msgs: { type: string }[] = []; ws.on('message', (d, bin) => { if (!bin) msgs.push(JSON.parse(d.toString())); });
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 300 && !msgs.some((m) => m.type === 'ready'); i++) await wait(10);
  const nudges = () => texts.filter((t) => /waiting for you/.test(t)).length;
  await wait(500); // salomlashuv "Barakalla!" bilan tugadi (savolsiz) → bir marta davom ettirish; javobi ham savolsiz — ikkinchi marta emas
  assert.equal(nudges(), 1, 'savolsiz to‘xtadi — bir marta davom ettirildi');
  await wait(400); assert.equal(nudges(), 1, 'takror-takror emas (o‘quvchi gapirguncha)');
  // O'quvchi gapirdi (bosib turdi va qo'yib yubordi) → yana savolsiz javob → yana davom ettirish mumkin; lekin bosib turgan paytda — yo'q
  ws.send(JSON.stringify({ type: 'activity', on: true })); await wait(300);
  assert.equal(nudges(), 1, 'o‘quvchi gapirayotganda davom ettirilmaydi');
  ws.send(JSON.stringify({ type: 'activity', on: false })); await wait(50);
  upSend(up, 'Hahaha, voy tovba!'); await wait(450);
  assert.equal(nudges(), 2, 'o‘quvchi gapirgandan keyingi savolsiz javob — yana davom ettirildi');
  ws.send(JSON.stringify({ type: 'activity', on: true })); ws.send(JSON.stringify({ type: 'activity', on: false })); await wait(30);
  reply = 'Zo‘r! Kecha nima qildingiz?'; upSend(up, reply); await wait(450);
  assert.equal(nudges(), 2, 'savol bilan tugadi — davom ettirish kerak emas');
  ws.send(JSON.stringify({ type: 'end' })); await new Promise((r) => ws.on('close', r)); await wait(30);
  assert.ok(logs.some((l) => / nudge=2/.test(l)), 'logda davom ettirishlar soni');
  h.close(); up.close();
}
function upSend(up: WebSocketServer, text: string): void { for (const c of up.clients) c.send(JSON.stringify({ serverContent: { outputTranscription: { text }, turnComplete: true } })); }
console.log('live: OK');
