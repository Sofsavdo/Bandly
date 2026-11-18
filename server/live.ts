// Gemini Live — ovozdan-ovozga (speech-to-speech) AI ustoz. Brauzer bizning serverga WebSocket bilan ulanadi, server esa
// Gemini Live API'ga (BidiGenerateContent): API kalit brauzerga chiqmaydi, daqiqalar va limitlar serverda hisoblanadi.
// Brauzer → server: ikkilik kadrlar = 16 kHz PCM16 mikrofon ovozi; JSON {type:'end'} — tugatish.
// Server → brauzer: ikkilik kadrlar = 24 kHz PCM16 Sellzen AI ovozi; JSON {type:'ready'|'interrupted'|'turn'|'in'|'out'|'error'|'limit'}.
import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import type { DatabaseSync } from 'node:sqlite';
import { WebSocket, WebSocketServer, type RawData } from 'ws';
import { tzDay } from './day';

export interface LiveConfig {
  key: string; model: string; fallbackModel: string | null; voice: string; url: string;
  freeDailySeconds: number; maxSessionSec: number; pricePerMin: number;
  /** Bepul foydalanuvchilar uchun platforma bo'yicha kunlik umumiy chegara (soniya); 0 — chegarasiz. Xarajat nazorati. */
  freeGlobalDailySeconds: number;
}

/** Gemini kaliti bo'lsa — yoqiq (GEMINI_LIVE=0 o'chiradi). */
export function liveConfigFromEnv(geminiKey: string | null, env: NodeJS.ProcessEnv = process.env): LiveConfig | null {
  if ((env.GEMINI_LIVE ?? '').trim() === '0') return null;
  const key = ((env.GEMINI_LIVE_KEY ?? '').trim() || geminiKey || '').trim();
  if (!key) return null;
  const fb = (env.GEMINI_LIVE_FALLBACK_MODEL ?? 'gemini-2.5-flash-native-audio-preview-12-2025').trim();
  const model = (env.GEMINI_LIVE_MODEL ?? '').trim() || 'gemini-3.8-live';
  return {
    key, model, fallbackModel: fb && fb !== model ? fb : null,
    voice: (env.GEMINI_LIVE_VOICE ?? '').trim() || 'Puck',
    url: (env.GEMINI_LIVE_URL ?? '').trim() || 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent',
    freeDailySeconds: Math.max(0, Number(env.LIVE_FREE_DAILY_MINUTES ?? 5)) * 60,
    maxSessionSec: Math.max(60, Number(env.LIVE_MAX_SESSION_MINUTES ?? 10) * 60),
    pricePerMin: Number(env.PRICE_LIVE_PER_MIN ?? 0.03),
    freeGlobalDailySeconds: Math.max(0, Number(env.LIVE_FREE_GLOBAL_DAILY_MINUTES ?? 0) || 0) * 60,
  };
}

export function ensureLiveTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS live_usage (day TEXT NOT NULL, player_id INTEGER NOT NULL, seconds REAL NOT NULL DEFAULT 0, PRIMARY KEY (day, player_id))');
}
export function liveUsedToday(db: DatabaseSync, playerId: number, now = Date.now()): number {
  return (db.prepare('SELECT seconds FROM live_usage WHERE day = ? AND player_id = ?').get(tzDay(now), playerId) as { seconds: number } | undefined)?.seconds ?? 0;
}
/** Bugun butun platformada ishlatilgan Live soniyalari. */
export function liveUsedTodayAll(db: DatabaseSync, now = Date.now()): number {
  return (db.prepare('SELECT COALESCE(SUM(seconds), 0) AS s FROM live_usage WHERE day = ?').get(tzDay(now)) as { s: number }).s;
}
export function recordLive(db: DatabaseSync, playerId: number, seconds: number, now = Date.now()): void {
  if (!(seconds > 0)) return;
  db.prepare('INSERT INTO live_usage (day, player_id, seconds) VALUES (?, ?, ?) ON CONFLICT(day, player_id) DO UPDATE SET seconds = seconds + excluded.seconds').run(tzDay(now), playerId, seconds);
}

/** Bu qo'ng'iroq uchun ruxsat etilgan soniyalar: xodim — sessiya chegarasi; obunachi — oylik daqiqalari; bepul — kunlik bepul daqiqa. */
export function liveAllowance(cfg: LiveConfig, who: { staff: boolean; subscriberLeftSec: number; freeUsedTodaySec: number; platformUsedTodaySec?: number }): number {
  if (who.staff) return cfg.maxSessionSec;
  if (who.subscriberLeftSec > 0) return Math.min(cfg.maxSessionSec, who.subscriberLeftSec);
  const personal = Math.max(0, cfg.freeDailySeconds - who.freeUsedTodaySec);
  // Platformaning kunlik bepul byudjeti tugasa — bepul foydalanuvchilarga ertagacha Live berilmaydi (obunachilarga ta'sir qilmaydi)
  const global = cfg.freeGlobalDailySeconds > 0 ? Math.max(0, cfg.freeGlobalDailySeconds - (who.platformUsedTodaySec ?? 0)) : Number.POSITIVE_INFINITY;
  return Math.min(cfg.maxSessionSec, personal, global);
}

/** Gemini Live'ga birinchi xabar: model, ovoz, Sellzen AI ko'rsatmasi, ikkala tomon matn nusxasi. */
export function setupMessage(cfg: LiveConfig, model: string, systemText: string): Record<string, unknown> {
  return {
    setup: {
      model: `models/${model}`,
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } } },
      systemInstruction: { parts: [{ text: systemText }] },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  };
}

interface LiveDeps {
  db: DatabaseSync;
  cfg: LiveConfig;
  /** Token → o'quvchi; null — yaroqsiz */
  auth: (token: string) => { id: number; staff: boolean; subscriberLeftSec: number } | null;
  prompt: (o: { adult: boolean; native: string; level: string | null }) => string;
  native: (lang: string) => string;
  /** Qo'ng'iroq tugadi: daqiqa va xarajat yoziladi */
  onEnd: (playerId: number, seconds: number, model: string) => void;
  log?: (msg: string) => void;
}

/** HTTP serverga /api/ai/live WebSocket yo'lini ulaydi. */
export function attachLive(server: Server, d: LiveDeps): void {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
  const log = d.log ?? ((m: string) => console.log(m));
  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url ?? '/', 'http://x');
    if (url.pathname !== '/api/ai/live') { socket.destroy(); return; }
    wss.handleUpgrade(req, socket, head, (client) => handleClient(client, url, d, log));
  });
}

function handleClient(client: WebSocket, url: URL, d: LiveDeps, log: (m: string) => void): void {
  const send = (o: Record<string, unknown>) => { if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(o)); };
  const who = d.auth(String(url.searchParams.get('token') ?? ''));
  if (!who) { send({ type: 'error', code: 401, message: 'Hisobga kiring' }); client.close(); return; }
  const allowance = liveAllowance(d.cfg, { staff: who.staff, subscriberLeftSec: who.subscriberLeftSec, freeUsedTodaySec: liveUsedToday(d.db, who.id), platformUsedTodaySec: liveUsedTodayAll(d.db) });
  if (allowance < 5) { send({ type: 'limit', message: 'Bugungi bepul ovozli suhbat daqiqalari tugadi. Obuna bilan — oyiga 60 daqiqa.' }); client.close(); return; }

  const lang = String(url.searchParams.get('lang') ?? 'uz').slice(0, 2);
  const systemText = d.prompt({ adult: url.searchParams.get('adult') === '1', native: d.native(lang), level: url.searchParams.get('level') });
  const started = Date.now();
  let upstream: WebSocket | null = null;
  let ready = false, closed = false, model = d.cfg.model, triedFallback = false;
  const pending: Buffer[] = []; // tayyor bo'lguncha kelgan mikrofon ovozi (ko'p emas)

  const finish = (why: string) => {
    if (closed) return;
    closed = true;
    clearTimeout(cap);
    try { upstream?.close(); } catch { /* */ }
    try { client.close(); } catch { /* */ }
    const secs = ready ? (Date.now() - started) / 1000 : 0;
    if (secs > 0) d.onEnd(who.id, secs, model);
    log(`[live] ${who.id} ${secs.toFixed(0)}s ${model} (${why})`);
  };
  const cap = setTimeout(() => { send({ type: 'limit', message: 'Ovozli suhbat vaqti tugadi.' }); finish('limit'); }, allowance * 1000);

  const connect = () => {
    const ws = new WebSocket(`${d.cfg.url}?key=${encodeURIComponent(d.cfg.key)}`);
    upstream = ws;
    ws.on('open', () => ws.send(JSON.stringify(setupMessage(d.cfg, model, systemText))));
    ws.on('message', (raw: RawData) => {
      let m: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
      try { m = JSON.parse(raw.toString()); } catch { return; }
      if (m.setupComplete) {
        ready = true;
        send({ type: 'ready' });
        // Sellzen AI suhbatni o'zi boshlaydi
        ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: '(The learner just joined the voice call. Greet them in your style in one or two sentences and ask a question.)' }] }], turnComplete: true } }));
        for (const b of pending.splice(0)) forward(b);
        return;
      }
      const sc = m.serverContent;
      if (sc) {
        for (const p of sc.modelTurn?.parts ?? []) if (p.inlineData?.data) { if (client.readyState === WebSocket.OPEN) client.send(Buffer.from(String(p.inlineData.data), 'base64')); }
        if (sc.inputTranscription?.text) send({ type: 'in', text: String(sc.inputTranscription.text) });
        if (sc.outputTranscription?.text) send({ type: 'out', text: String(sc.outputTranscription.text) });
        if (sc.interrupted) send({ type: 'interrupted' });
        if (sc.turnComplete) send({ type: 'turn' });
      }
      if (m.goAway) { send({ type: 'error', code: 503, message: 'Suhbat vaqti tugadi, qayta boshlang.' }); finish('goAway'); }
    });
    ws.on('close', (code: number, reason: Buffer) => {
      if (closed) return;
      const r = reason.toString().slice(0, 200);
      log(`[live] upstream yopildi ${code} ${model}${r ? `: ${r}` : ''}`);
      // Model topilmasa yoki sozlama rad etilsa — zaxira model bilan bir marta
      if (!ready && !triedFallback && d.cfg.fallbackModel) { triedFallback = true; model = d.cfg.fallbackModel; connect(); return; }
      send({ type: 'error', code: code === 1011 ? 503 : 502, message: ready ? 'Aloqa uzildi.' : 'Ovozli suhbat hozir ishlamayapti.' });
      finish(`upstream ${code}`);
    });
    ws.on('error', (e: Error) => log(`[live] upstream xato ${model}: ${e.message.slice(0, 160)}`));
  };

  const forward = (b: Buffer) => {
    if (upstream?.readyState !== WebSocket.OPEN) return;
    upstream.send(JSON.stringify({ realtimeInput: { audio: { data: b.toString('base64'), mimeType: 'audio/pcm;rate=16000' } } }));
  };

  client.on('message', (data: RawData, isBinary: boolean) => {
    if (isBinary) {
      const b = Buffer.isBuffer(data) ? data : Buffer.from(data as ArrayBuffer);
      if (ready) forward(b); else if (pending.length < 50) pending.push(b);
      return;
    }
    try { if ((JSON.parse(data.toString()) as { type?: string }).type === 'end') finish('client'); } catch { /* */ }
  });
  client.on('close', () => finish('client-close'));
  client.on('error', () => finish('client-error'));
  connect();
}
