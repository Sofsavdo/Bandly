import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { WebSocket, WebSocketServer } from 'ws';
import { attachLive, tokenFromProtocols, wrongLanguage, ensureLiveTable, liveAllowance, liveConfigFromEnv, liveUsedToday, recordLive, setupMessage } from './live';

// Sozlama: Gemini kaliti bo'lsa yoqiq, GEMINI_LIVE=0 o'chiradi
assert.equal(liveConfigFromEnv(null, {}), null);
const cfg0 = liveConfigFromEnv('AQ.k', {})!;
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
console.log('live: OK');
