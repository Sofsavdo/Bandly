// Nutqni matnga aylantirish (Sellzen uchun): ElevenLabs Scribe. Brauzerdagi bepul tanish o'zbekcha va o'zbekcha
// talaffuzli inglizchani yomon tushunadi; Scribe esa aralash gapni (inglizcha + ona tili) xatolari bilan — so'zma-so'z yozadi,
// shu bilan ustoz grammatik xatoni ko'ra oladi. Ovoz serverda saqlanmaydi: faqat tanilgan matn qaytadi.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';
import { tzDay } from './day';

export interface SttConfig { key: string; model: string; dailySecondsPerUser: number; globalDailySeconds: number; pricePerHour: number; fetchImpl?: typeof fetch; /** faqat sinov uchun (STT_BASE_URL): soxta Scribe serveri; standart — ElevenLabs */ baseUrl?: string }
export const MAX_AUDIO = 3 * 1024 * 1024; // ~90 soniya opus
const MIMES = ['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/aac', 'video/webm'];

/** Kalit va limitlar bo'lmasa — o'chiq (mijoz brauzer tanishiga qaytadi). */
export function sttConfigFromEnv(env: NodeJS.ProcessEnv = process.env): SttConfig | null {
  const key = (env.ELEVENLABS_API_KEY ?? '').trim();
  const global = Number(env.STT_GLOBAL_DAILY_MINUTES ?? 600);
  if (!key || !(global > 0) || env.STT_PROVIDER === 'none') return null;
  // Narx: ElevenLabs Scribe — $0.20 / soat audio (2026-11, rasmiy narx sahifasi; avval $0.40 edi)
  return { key, model: env.STT_MODEL ?? 'scribe_v2', dailySecondsPerUser: Number(env.STT_DAILY_MINUTES ?? 40) * 60, globalDailySeconds: global * 60, pricePerHour: Number(env.PRICE_STT_PER_HOUR ?? 0.2), ...(env.STT_BASE_URL ? { baseUrl: env.STT_BASE_URL.trim().replace(/\/+$/, '') } : {}) };
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

/** score — so'zlarning o'rtacha logprob'i (≤ 0; 0 ga yaqin — ishonchli). Scribe so'z ro'yxatida bermasa — null. */
export interface SttResult { text: string; lang: string | null; seconds: number; score?: number | null }

/** Ovozni ElevenLabs'ga yuboradi. Til avtomatik aniqlanadi (o'quvchi inglizcha va ona tilini aralashtiradi). */
/** Interfeys tili → Scribe til kodi (ISO 639-3). */
export const NATIVE_STT_CODE: Record<string, string> = { uz: 'uzb', ru: 'rus', kk: 'kaz', ky: 'kir', tg: 'tgk', en: 'uzb' };

/** Tanish: avval tilni o'zi aniqlaydi; qisqa gapda boshqa til (masalan, marathi yoki shved) chiqsa — ingliz tili deb qayta tanadi.
 *  O'quvchi faqat ingliz tilida yoki o'z ona tilida gapiradi. */
/** Ishonch chegarasi: undan past bo'lsa ona tili natijasi shubhali — inglizcha ham sinab ko'riladi (haqiqiy sinovda toza gap −0.01…−0.1, shovqinli/tushunarsiz −0.2…−0.5). */
export const LOW_CONFIDENCE = -0.2;
/** O'quvchi gapini tanish. Til avtomatik ANIQLANMAYDI: ElevenLabs avto-aniqlashi qisqa o'zbekchani ingliz (p≈0.5), turk, serb, belarus deb adashtiradi va
 *  kirill yozuvda yozib yuboradi (2026-11-24 haqiqiy sinov, "Darsga o'tamiz" → «Дарске ўтамиz»). Ona tili ko'rsatmasi (masalan uzb) bilan esa o'zbekcha ham,
 *  aksentli inglizcha va aralash gap ham to'g'ri lotin yozuvida chiqadi. Shuning uchun odatda BITTA so'rov; faqat natija bo'sh yoki ishonchsiz bo'lsa ingliz
 *  ko'rsatmasi bilan ikkinchi marta sinab, ishonchlisi olinadi. Mashqlar (expect='en') — faqat inglizcha. */
/** expect: 'en' — faqat inglizcha; 'any' — avval ona tili, ishonch past bo'lsa inglizcha; 'en-first' — o'quvchi oxirgi navbatlarda inglizcha gapirgan:
 *  avval inglizcha (ko'p hollarda bitta so'rov yetadi — jurnal 2026-11-25: ko'p navbatda ikki marta tanilardi), ishonch past bo'lsa ona tili. */
/** Ikkinchi til so'rovini kutmasdan boshlash muddati (ms): birinchi so'rov shundan uzoq cho'zilsa, ikkinchisi parallel ketadi. */
export const HEDGE_MS = 1200;
export async function transcribeLearner(cfg: SttConfig, audio: Buffer, mime: string, native = 'uzb', expect: 'en' | 'any' | 'en-first' = 'any', hedgeMs = HEDGE_MS): Promise<SttResult & { forced: boolean; billedSeconds: number }> {
  if (expect === 'en' || native === 'eng') { const r = await transcribe(cfg, audio, mime, 'eng'); return { ...r, forced: false, billedSeconds: r.seconds }; }
  const firstEn = expect === 'en-first';
  const sure = (r: SttResult) => !!r.text && (r.score === null || r.score === undefined || r.score >= LOW_CONFIDENCE) && !(firstEn && /[\u0400-\u04FF]/.test(r.text));
  // Odatda BITTA so'rov. Ikkinchi til so'rovi: birinchisi ishonchsiz/bo'sh chiqsa YOKI hedgeMs dan uzoq cho'zilsa — parallel boshlanadi
  // (jurnal 2026-11-26: navbatlarning ~28 % ida ikkinchi tanish ketma-ket kutilardi — "qotib qolish"). Birinchisi ishonchli chiqsa ikkinchisi bekor qilinadi.
  const stop = new AbortController();
  let secondP: Promise<SttResult | null> | null = null;
  const startSecond = (): Promise<SttResult | null> => (secondP ??= transcribe(cfg, audio, mime, firstEn ? native : 'eng', stop.signal).catch(() => null));
  const hedge = setTimeout(() => { void startSecond(); }, hedgeMs); hedge.unref?.();
  const a = await transcribe(cfg, audio, mime, firstEn ? 'eng' : native).catch(async (err: unknown) => { clearTimeout(hedge); const b = await startSecond(); if (b?.text) return null; throw err; });
  clearTimeout(hedge);
  if (a && sure(a)) { if (secondP) stop.abort(); return { ...a, forced: firstEn, billedSeconds: a.seconds }; }
  const e = await startSecond();
  if (!a) return { ...e!, forced: !firstEn, billedSeconds: e!.seconds }; // birinchisi xato, ikkinchisi tanidi
  const billed = a.seconds + (e?.seconds ?? 0); // ikkala so'rov ham to'lanadi
  const aIsEn = firstEn;
  if (!e || !e.text) return { ...a, forced: aIsEn, billedSeconds: billed };
  // inglizcha so'rovdagi kirill matn — noto'g'ri tanilgan (o'quvchi ona tilida gapirgan)
  const aScore = firstEn && /[\u0400-\u04FF]/.test(a.text) ? Number.NEGATIVE_INFINITY : (a.score ?? Number.NEGATIVE_INFINITY);
  if (!a.text || (e.score ?? Number.NEGATIVE_INFINITY) > aScore || aScore === Number.NEGATIVE_INFINITY) return { ...e, forced: !aIsEn, billedSeconds: billed };
  return { ...a, forced: aIsEn, billedSeconds: billed };
}

export async function transcribe(cfg: SttConfig, audio: Buffer, mime: string, language?: string, signal?: AbortSignal): Promise<SttResult> {
  const type = mime.split(';')[0]!.trim().toLowerCase();
  if (!MIMES.includes(type)) throw new ApiError(415, 'Audio formati qo‘llab-quvvatlanmaydi');
  if (audio.length < 800) throw new ApiError(400, 'Ovoz juda qisqa');
  if (audio.length > MAX_AUDIO) throw new ApiError(413, 'Ovoz juda uzun (90 soniyagacha)');
  const form = new FormData();
  form.append('model_id', cfg.model);
  form.append('tag_audio_events', 'false');
  if (language) form.append('language_code', language);
  form.append('file', new Blob([new Uint8Array(audio)], { type }), `turn.${type.split('/')[1]}`);
  const r = await (cfg.fetchImpl ?? fetch)(`${cfg.baseUrl ?? 'https://api.elevenlabs.io'}/v1/speech-to-text`, { method: 'POST', headers: { 'xi-api-key': cfg.key }, body: form, signal: signal ? AbortSignal.any([AbortSignal.timeout(30_000), signal]) : AbortSignal.timeout(30_000) });
  if (!r.ok) throw new ApiError(502, `Nutqni tanib bo‘lmadi (${r.status})`);
  const j = await r.json() as { text?: string; language_code?: string; words?: { end?: number; type?: string; logprob?: number }[] };
  const words = (j.words ?? []).filter((w) => w.type !== 'spacing');
  const seconds = words.length ? Math.max(...words.map((w) => w.end ?? 0)) : 0;
  const lps = words.filter((w) => w.type === 'word' && typeof w.logprob === 'number').map((w) => w.logprob!);
  return { text: (j.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 2000), lang: j.language_code ?? null, seconds, score: lps.length ? lps.reduce((x, y) => x + y, 0) / lps.length : null };
}
