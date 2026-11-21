// Gemini Live — ovozdan-ovozga (speech-to-speech) AI ustoz. Brauzer bizning serverga WebSocket bilan ulanadi, server esa
// Gemini Live API'ga (BidiGenerateContent): API kalit brauzerga chiqmaydi, daqiqalar va limitlar serverda hisoblanadi.
// Brauzer → server: ikkilik kadrlar = 16 kHz PCM16 mikrofon ovozi; JSON {type:'end'} — tugatish.
// Server → brauzer: ikkilik kadrlar = 24 kHz PCM16 Sellzen ovozi; JSON {type:'ready'|'interrupted'|'turn'|'in'|'out'|'error'|'limit'}.
import type { IncomingMessage, Server } from 'node:http';
import type { Duplex } from 'node:stream';
import type { DatabaseSync } from 'node:sqlite';
import { WebSocket, WebSocketServer, type RawData } from 'ws';
import { tzDay } from './day';
import { CALL_MONTH_SECONDS } from './callMinutes';
import { clampStyle, emotionOf, type LiveEmotion } from './coach';

export interface LiveConfig {
  key: string; model: string; fallbackModel: string | null; voice: string; url: string;
  freeDailySeconds: number; maxSessionSec: number; pricePerMin: number;
  /** Gap tugadi deb hisoblash uchun jimlik (ms): qanchalik kichik — shunchalik tez javob, lekin o'ylab gapirganda bo'lib yuborish xavfi. */
  silenceMs: number;
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
    silenceMs: Math.min(2000, Math.max(300, Number(env.LIVE_SILENCE_MS ?? 900) || 900)),
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

/** Gemini Live'ga birinchi xabar: model, ovoz, Sellzen ko'rsatmasi, ikkala tomon matn nusxasi. */
export function setupMessage(cfg: LiveConfig, model: string, systemText: string): Record<string, unknown> {
  return {
    setup: {
      model: `models/${model}`,
      generationConfig: { responseModalities: ['AUDIO'], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.voice } } } },
      systemInstruction: { parts: [{ text: systemText }] },
      // Navbat almashish: o'quvchilar o'ylab, to'xtab gapiradi — sezgirlik past va ~0.9 s jimlik (0.6 s + yuqori sezgirlik gapni
      // o'rtasida kesib, ustoz "tushunmadim, qattiqroq gapir" deyaverardi — 2026-11-21 shikoyati). LIVE_SILENCE_MS bilan sozlanadi.
      realtimeInputConfig: { automaticActivityDetection: { endOfSpeechSensitivity: 'END_SENSITIVITY_LOW', prefixPaddingMs: 200, silenceDurationMs: cfg.silenceMs } },
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
  };
}

/** Ustoz javobi ruxsat etilmagan tilga o'tib ketdimi (matn nusxasi bo'yicha)? Ruxsat: ingliz + o'quvchi tili.
 *  Boshqa yozuvlar (xitoy, koreys, arab…) darhol; lotin yozuvidagi ispan/portugal — kamida 2 ta xos so'z bo'lsa. */
const FOREIGN_SCRIPT = /[\u3040-\u30ff\u3400-\u9fff\uac00-\ud7af\u0600-\u06ff\u0590-\u05ff\u0e00-\u0e7f\u0900-\u097f\u10a0-\u10ff\u0530-\u058f]/;
const CYRILLIC = /[\u0400-\u04ff]/;
const ES_PT = new Set(['que', 'não', 'nao', 'você', 'voce', 'está', 'estás', 'obrigado', 'obrigada', 'hola', 'gracias', 'porque', 'también', 'também', 'tambem', 'muy', 'pero', 'estoy', 'eres', 'usted', 'bueno', 'entonces', 'então', 'isso', 'fala', 'falar', 'hablar', 'habla', 'puedes', 'pode', 'olá', 'claro', 'ahora', 'agora', 'cómo', 'como', 'qué', 'por', 'favor', 'mucho', 'muito', 'bien', 'bem', 'tienes', 'tem', 'del', 'los', 'las', 'uma', 'una', 'para', 'esto', 'este', 'esta', 'sim']);
export function wrongLanguage(text: string, nativeCode: string): boolean {
  if (FOREIGN_SCRIPT.test(text)) return true;
  if (CYRILLIC.test(text) && !['ru', 'kk', 'ky', 'tg'].includes(nativeCode)) return true;
  const words = new Set(text.toLowerCase().normalize('NFC').split(/[^\p{L}']+/u).filter(Boolean));
  let hits = 0;
  for (const w of words) if (ES_PT.has(w)) hits++;
  return hits >= 3;
}

interface LiveDeps {
  db: DatabaseSync;
  cfg: LiveConfig;
  /** Token → o'quvchi; null — yaroqsiz */
  auth: (token: string) => { id: number; staff: boolean; subscriberLeftSec: number } | null;
  prompt: (o: { adult: boolean; native: string; level: string | null; firstCall: boolean; memory: string; style: 0 | 1 | 2 | 3 }) => string;
  /** O'quvchi uchun: birinchi qo'ng'iroqmi va xotira matni (ko'rsatmaga qo'shiladi) */
  context?: (playerId: number) => { firstCall: boolean; memory: string };
  /** Qo'ng'iroq boshidagi ko'rsatma (o'quvchi hali gapirmagan) */
  kickoff?: (o: { firstCall: boolean; hasMemory: boolean }) => string;
  /** Qo'ng'iroq tugagach suhbat yozuvi (xotira uchun) */
  onTranscript?: (playerId: number, turns: { who: 'learner' | 'coach'; text: string }[], nativeCode: string) => void;
  native: (lang: string) => string;
  /** Qo'ng'iroq tugadi: daqiqa va xarajat yoziladi */
  onEnd: (playerId: number, seconds: number, model: string) => void;
  log?: (msg: string) => void;
}

/** Mijoz tokenni URL'da emas, WebSocket subprotocol sarlavhasida yuboradi: ['sellzen.v1', 'tk.<token>'] —
 *  URL proksi/kirish loglariga tushadi, sarlavha tushmaydi. */
export const LIVE_PROTOCOL = 'sellzen.v1';
export function tokenFromProtocols(header: string | string[] | undefined): string | null {
  const list = (Array.isArray(header) ? header.join(',') : header ?? '').split(',').map((x) => x.trim());
  const t = list.find((x) => x.startsWith('tk.'));
  return t ? t.slice(3) : null;
}

/** HTTP serverga /api/ai/live WebSocket yo'lini ulaydi. */
export function attachLive(server: Server, d: LiveDeps): void {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024, handleProtocols: (p) => (p.has(LIVE_PROTOCOL) ? LIVE_PROTOCOL : false) });
  const log = d.log ?? ((m: string) => console.log(m));
  server.on('upgrade', (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    // Buzuq manzil (skanerlar) — event handler ichida istisno butun jarayonni yiqitardi; endi ulanish shunchaki yopiladi
    let url: URL;
    try { url = new URL(req.url ?? '/', 'http://x'); } catch { socket.destroy(); return; }
    if (url.pathname !== '/api/ai/live') { socket.destroy(); return; }
    // Eski (keshlangan) mijozlar uchun vaqtincha ?token= ham qabul qilinadi
    const token = tokenFromProtocols(req.headers['sec-websocket-protocol']) ?? url.searchParams.get('token') ?? '';
    wss.handleUpgrade(req, socket, head, (client) => handleClient(client, url, token, d, log));
  });
}

function handleClient(client: WebSocket, url: URL, token: string, d: LiveDeps, log: (m: string) => void): void {
  const send = (o: Record<string, unknown>) => { if (client.readyState === WebSocket.OPEN) client.send(JSON.stringify(o)); };
  const who = d.auth(token);
  if (!who) { send({ type: 'error', code: 401, message: 'Hisobga kiring' }); client.close(); return; }
  const allowance = liveAllowance(d.cfg, { staff: who.staff, subscriberLeftSec: who.subscriberLeftSec, freeUsedTodaySec: liveUsedToday(d.db, who.id), platformUsedTodaySec: liveUsedTodayAll(d.db) });
  if (allowance < 5) { send({ type: 'limit', message: `Bugungi bepul ovozli suhbat daqiqalari tugadi. Obuna bilan — oyiga ${Math.round(CALL_MONTH_SECONDS / 60)} daqiqa.` }); client.close(); return; }

  const lang = String(url.searchParams.get('lang') ?? 'uz').slice(0, 2);
  const ctx = d.context?.(who.id) ?? { firstCall: false, memory: '' };
  const adult = url.searchParams.get('adult') === '1';
  // Xarakter (profil): 0 Yumshoq, 1 Hazil, 2 Qattiq, 3 Jallod; 2–3 faqat 18+ bilan
  const style = clampStyle(url.searchParams.get('style') ?? (adult ? 2 : 0), adult);
  const systemText = d.prompt({ adult, native: d.native(lang), level: url.searchParams.get('level'), firstCall: ctx.firstCall, memory: ctx.memory, style });
  // Suhbat yozuvi (xotira uchun) va noto'g'ri til himoyasi
  const turns: { who: 'learner' | 'coach'; text: string }[] = [];
  const addText = (who: 'learner' | 'coach', t: string) => { const last = turns[turns.length - 1]; if (last && last.who === who) last.text = `${last.text}${t}`.slice(-600); else turns.push({ who, text: t.slice(0, 600) }); if (turns.length > 80) turns.shift(); };
  let turnOut = '', muted = false, wrongCount = 0, emo: LiveEmotion = 'neutral';
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
    if (turns.filter((t) => t.who === 'learner').length >= 3) { try { d.onTranscript?.(who.id, turns, lang); } catch { /* xotira ixtiyoriy */ } }
    log(`[live] ${who.id} ${secs.toFixed(0)}s ${model} (${why})${wrongCount ? ` til-xato:${wrongCount}` : ''}`);
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
        // Sellzen suhbatni o'zi boshlaydi
        const kick = d.kickoff?.({ firstCall: ctx.firstCall, hasMemory: !!ctx.memory }) ?? '(The learner just joined the voice call. Greet them in your style in one or two sentences and ask a question.)';
        ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: kick }] }], turnComplete: true } }));
        for (const b of pending.splice(0)) forward(b);
        return;
      }
      const sc = m.serverContent;
      if (sc) {
        if (sc.outputTranscription?.text) {
          const t = String(sc.outputTranscription.text);
          turnOut += t;
          // Ustoz ruxsat etilmagan tilga o'tib ketdi (odatda o'quvchi ovozi noto'g'ri tanilgan): ovozni to'xtatamiz va qayta so'ratamiz
          if (!muted && wrongLanguage(turnOut, lang)) {
            muted = true; wrongCount++;
            send({ type: 'interrupted' });
            const nat = d.native(lang).replace(/\s*\(.*\)\s*$/, '');
            ws.send(JSON.stringify({ clientContent: { turns: [{ role: 'user', parts: [{ text: `(System: your last reply was in a forbidden language — the learner's audio was misheard. Speak ONLY English or ${nat}. Now say ONE short line in ${nat}, in your style, that you did not catch that and ask them to say it again (do not tell them to speak louder).)` }] }], turnComplete: true } }));
          } else if (!muted) {
            send({ type: 'out', text: t }); addText('coach', t);
            // Ekrandagi hissiyot effekti (jahl — olov, kulgi, quvonch): faqat o'zgarganda yuboriladi
            const e = emotionOf(turnOut);
            if (e !== 'neutral' && e !== emo) { emo = e; send({ type: 'emotion', value: e }); }
          }
        }
        if (!muted) for (const p of sc.modelTurn?.parts ?? []) if (p.inlineData?.data) { if (client.readyState === WebSocket.OPEN) client.send(Buffer.from(String(p.inlineData.data), 'base64')); }
        if (sc.inputTranscription?.text) { const t = String(sc.inputTranscription.text); send({ type: 'in', text: t }); addText('learner', t); }
        if (sc.interrupted) { send({ type: 'interrupted' }); turnOut = ''; muted = false; }
        if (sc.turnComplete) { send({ type: 'turn' }); turnOut = ''; muted = false; emo = 'neutral'; }
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
