import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { WebSocket, WebSocketServer } from 'ws';
import { attachLive, ensureLiveTable, liveAllowance, liveConfigFromEnv, liveUsedToday, recordLive, setupMessage } from './live';

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
      ws.send(JSON.stringify({ serverContent: { outputTranscription: { text: 'Not I go — I went!' }, turnComplete: true } }));
    }
  });
});
await new Promise((r) => upstream.once('listening', r));
const upPort = (upstream.address() as { port: number }).port;

const cfg = { ...cfg0, model: 'bad-model', fallbackModel: 'gemini-2.5-flash-native-audio-preview-12-2025', url: `ws://127.0.0.1:${upPort}` };
const ended: { pid: number; secs: number; model: string }[] = [];
const http = createServer((_q, s) => { s.end(); });
attachLive(http, {
  db, cfg,
  auth: (t) => (t === 'good' ? { id: 7, staff: false, subscriberLeftSec: 0 } : null),
  prompt: (o) => `bandi adult=${o.adult} native=${o.native}`,
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
// to'g'ri: ready → ovoz yuboriladi → Bandi ovozi (ikkilik) va matn nusxalari keladi
{
  const ws = new WebSocket(`ws://127.0.0.1:${port}/api/ai/live?token=good&adult=1&lang=uz&level=B1`);
  const events: string[] = []; let audioBytes = 0;
  await new Promise<void>((resolve) => {
    ws.on('message', (d, bin) => {
      if (bin) { audioBytes += (d as Buffer).length; return; }
      const m = JSON.parse(d.toString()); events.push(m.type);
      if (m.type === 'ready') ws.send(Buffer.alloc(640), { binary: true });
      if (m.type === 'turn') resolve();
    });
  });
  ws.send(JSON.stringify({ type: 'end' }));
  await new Promise((r) => ws.on('close', r));
  assert.deepEqual(seenModels, ['models/bad-model', 'models/gemini-2.5-flash-native-audio-preview-12-2025'], 'zaxira modelga o‘tdi');
  assert.ok(sawGreeting, 'Bandi suhbatni o‘zi boshlaydi');
  assert.deepEqual(gotAudio, [640]);
  assert.equal(audioBytes, 480);
  assert.deepEqual(events.filter((e) => e !== 'in' && e !== 'out'), ['ready', 'turn']);
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
