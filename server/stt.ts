// Nutqni matnga aylantirish (AI ustoz uchun): ElevenLabs Scribe. Brauzerdagi bepul tanish o'zbekcha va o'zbekcha
// talaffuzli inglizchani yomon tushunadi; Scribe esa aralash gapni (inglizcha + ona tili) xatolari bilan — so'zma-so'z yozadi,
// shu bilan ustoz grammatik xatoni ko'ra oladi. Ovoz serverda saqlanmaydi: faqat tanilgan matn qaytadi.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';
import { tzDay } from './day';

export interface SttConfig { key: string; model: string; dailySecondsPerUser: number; globalDailySeconds: number; pricePerHour: number; fetchImpl?: typeof fetch }
export const MAX_AUDIO = 3 * 1024 * 1024; // ~90 soniya opus
const MIMES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'video/webm'];

/** Kalit va limitlar bo'lmasa — o'chiq (mijoz brauzer tanishiga qaytadi). */
export function sttConfigFromEnv(env: NodeJS.ProcessEnv = process.env): SttConfig | null {
  const key = (env.ELEVENLABS_API_KEY ?? '').trim();
  const global = Number(env.STT_GLOBAL_DAILY_MINUTES ?? 600);
  if (!key || !(global > 0) || env.STT_PROVIDER === 'none') return null;
  return { key, model: env.STT_MODEL ?? 'scribe_v1', dailySecondsPerUser: Number(env.STT_DAILY_MINUTES ?? 40) * 60, globalDailySeconds: global * 60, pricePerHour: Number(env.PRICE_STT_PER_HOUR ?? 0.4) };
}

export function ensureSttTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS stt_usage (day TEXT NOT NULL, player_id INTEGER NOT NULL, seconds REAL NOT NULL DEFAULT 0, PRIMARY KEY (day, player_id))');
}

/** Kunlik limit: o'quvchi va platforma bo'yicha (soniyalarda). */
export function sttAllowed(db: DatabaseSync, cfg: SttConfig, playerId: number, now = Date.now()): void {
  const day = tzDay(now);
  const mine = (db.prepare('SELECT seconds FROM stt_usage WHERE day = ? AND player_id = ?').get(day, playerId) as { seconds: number } | undefined)?.seconds ?? 0;
  if (mine >= cfg.dailySecondsPerUser) throw new ApiError(429, 'Bugungi ovozli suhbat limiti tugadi. Ertaga davom etamiz yoki yozib yuboring.');
  const all = (db.prepare('SELECT COALESCE(SUM(seconds),0) AS s FROM stt_usage WHERE day = ?').get(day) as { s: number }).s;
  if (all >= cfg.globalDailySeconds) throw new ApiError(503, 'Ovozli tanish bugun vaqtincha band. Yozib yuboring.');
}
export function recordStt(db: DatabaseSync, playerId: number, seconds: number, now = Date.now()): void {
  db.prepare('INSERT INTO stt_usage (day, player_id, seconds) VALUES (?, ?, ?) ON CONFLICT(day, player_id) DO UPDATE SET seconds = seconds + excluded.seconds').run(tzDay(now), playerId, Math.max(1, seconds));
}

export interface SttResult { text: string; lang: string | null; seconds: number }

/** Ovozni ElevenLabs'ga yuboradi. Til avtomatik aniqlanadi (o'quvchi inglizcha va ona tilini aralashtiradi). */
/** Interfeys tili → Scribe til kodi (ISO 639-3). */
export const NATIVE_STT_CODE: Record<string, string> = { uz: 'uzb', ru: 'rus', kk: 'kaz', ky: 'kir', tg: 'tgk', en: 'uzb' };

/** Tanish: avval tilni o'zi aniqlaydi; qisqa gapda boshqa til (masalan, marathi yoki shved) chiqsa — ingliz tili deb qayta tanadi.
 *  O'quvchi faqat ingliz tilida yoki o'z ona tilida gapiradi. */
export async function transcribeLearner(cfg: SttConfig, audio: Buffer, mime: string, native = 'uzb'): Promise<SttResult & { forced: boolean }> {
  // Ikkalasi parallel: tilni o'zi aniqlagani va "ingliz tili" deb tanilgani — ketma-ket ikki marta kutilmaydi
  const [auto, eng] = await Promise.all([transcribe(cfg, audio, mime), transcribe(cfg, audio, mime, 'eng').catch(() => null)]);
  if (!auto.text || !auto.lang || auto.lang === 'eng' || auto.lang === native || !eng) return { ...auto, forced: false };
  return { ...eng, seconds: Math.max(auto.seconds, eng.seconds), forced: true };
}

export async function transcribe(cfg: SttConfig, audio: Buffer, mime: string, language?: string): Promise<SttResult> {
  const type = mime.split(';')[0]!.trim().toLowerCase();
  if (!MIMES.includes(type)) throw new ApiError(415, 'Audio formati qo‘llab-quvvatlanmaydi');
  if (audio.length < 800) throw new ApiError(400, 'Ovoz juda qisqa');
  if (audio.length > MAX_AUDIO) throw new ApiError(413, 'Ovoz juda uzun (90 soniyagacha)');
  const form = new FormData();
  form.append('model_id', cfg.model);
  form.append('tag_audio_events', 'false');
  if (language) form.append('language_code', language);
  form.append('file', new Blob([new Uint8Array(audio)], { type }), `turn.${type.split('/')[1]}`);
  const r = await (cfg.fetchImpl ?? fetch)('https://api.elevenlabs.io/v1/speech-to-text', { method: 'POST', headers: { 'xi-api-key': cfg.key }, body: form, signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new ApiError(502, `Nutqni tanib bo‘lmadi (${r.status})`);
  const j = await r.json() as { text?: string; language_code?: string; words?: { end?: number; type?: string }[] };
  const words = (j.words ?? []).filter((w) => w.type !== 'spacing');
  const seconds = words.length ? Math.max(...words.map((w) => w.end ?? 0)) : 0;
  return { text: (j.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 2000), lang: j.language_code ?? null, seconds };
}
