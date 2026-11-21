import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

import { EL_MODELS, TUTOR_VOICE, type ElModel } from './elevenlabs';
import type { Emotion } from '../src/content/roasts';

// O'zbekcha ovoz. Ikki xizmat: Azure Speech (TTS_KEY + TTS_REGION) yoki ElevenLabs (TTS_PROVIDER=elevenlabs + ELEVENLABS_API_KEY).
// Kalit faqat serverda. Sozlanmagan yoki chegarasi 0 bo'lsa xizmat o'chiq (fail-closed) va mijoz brauzer ovoziga o'tadi.
export type TtsProvider = 'azure' | 'elevenlabs' | 'none';
export interface TtsConfig {
  provider: TtsProvider; key: string; region: string; voice: string; cacheDir: string; fetchImpl?: typeof fetch;
  model?: ElModel;            // faqat elevenlabs
  globalDailyChars?: number;  // faqat elevenlabs: butun platforma bo'yicha kunlik belgilar chegarasi
  pricePer1kChars?: number;   // xarajat hisobi uchun taxminiy narx (USD / 1000 belgi)
}

export class TtsError extends Error { constructor(public status: number, message: string) { super(message); } }

export const MAX_TEXT = 280;
export const TTS_DAILY_LIMIT = Number(process.env.TTS_DAILY_LIMIT ?? 400);

/** Bir foydalanuvchiga kuniga nechta yangi (xarajatli) ovozli javob — egasi qarori OD-25: 5 ta. Keshdan berilganlar hisoblanmaydi. */
export const VOICE_DAILY_ANSWERS = Number(process.env.VOICE_DAILY_ANSWERS ?? 5);

const EL_PRICE: Record<ElModel, number> = { eleven_v4: 0.08, eleven_v4_turbo: 0.04 }; // ElevenLabs API narx sahifasi, 2026-11-14

export function ttsConfigFromEnv(cacheDir: string, env: NodeJS.ProcessEnv = process.env): TtsConfig {
  if ((env.TTS_PROVIDER ?? '').trim() === 'elevenlabs') {
    const key = (env.ELEVENLABS_API_KEY ?? '').trim();
    const limit = Number(env.VOICE_GLOBAL_DAILY_CHARS ?? 0);
    if (!key || !Number.isFinite(limit) || limit <= 0) return { provider: 'none', key: '', region: '', voice: '', cacheDir };
    const voice = /^[A-Za-z0-9]{10,40}$/.test(env.ELEVENLABS_VOICE_ID ?? '') ? env.ELEVENLABS_VOICE_ID! : TUTOR_VOICE.voiceId;
    const model = (EL_MODELS as readonly string[]).includes(env.ELEVENLABS_MODEL ?? '') ? (env.ELEVENLABS_MODEL as ElModel) : TUTOR_VOICE.modelId;
    const price = Number(env.PRICE_ELEVENLABS_PER_1K_CHARS);
    return { provider: 'elevenlabs', key, region: '', voice, model, cacheDir, globalDailyChars: limit, pricePer1kChars: Number.isFinite(price) && price > 0 ? price : EL_PRICE[model] };
  }
  const key = env.TTS_KEY ?? '';
  const region = (env.TTS_REGION ?? '').trim();
  if (!key || !/^[a-z0-9-]{3,30}$/i.test(region)) return { provider: 'none', key: '', region: '', voice: '', cacheDir };
  const voice = env.TTS_VOICE && /^[a-z]{2}-[A-Z]{2}-[A-Za-z]+Neural$/.test(env.TTS_VOICE) ? env.TTS_VOICE : 'uz-UZ-MadinaNeural';
  return { provider: 'azure', key, region, voice, cacheDir };
}

const esc = (s: string) => s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c] as string);

export const ssml = (voice: string, text: string, rate = 1, pitch = 0): string =>
  `<speak version='1.0' xml:lang='uz-UZ' xmlns='http://www.w3.org/2001/10/synthesis'><voice name='${voice}'><prosody rate='${Math.round(rate * 100)}%' pitch='${pitch >= 0 ? '+' : ''}${pitch}%'>${esc(text)}</prosody></voice></speak>`;

export const cacheKey = (voice: string, text: string, rate: number, pitch: number, extra = ''): string =>
  createHash('sha256').update(`${voice}|${rate}|${pitch}|${extra ? `${extra}|` : ''}${text}`).digest('hex').slice(0, 32);

/** Emotsiya → Eleven v4 audio tegi (rasmiy hujjatdagi teglar). Teglarni faqat server qo'yadi. */
export const EL_TAG: Record<Emotion, string> = { happy: '[warmly]', angry: '[shouting]', laugh: '[laughs]', disappointed: '[sighs]', impressed: '[excited]' };
const EMOTIONS = Object.keys(EL_TAG) as Emotion[];
export const isEmotion = (e: unknown): e is Emotion => EMOTIONS.includes(e as Emotion);

/** Mijoz matnidagi [ ... ] teglarini olib tashlaydi (o'quvchi gapi orqali teg kiritib bo'lmasin). */
export const stripTags = (t: string): string => t.replace(/\[[^\]]*\]?/g, ' ').replace(/[[\]]/g, ' ').replace(/\s+/g, ' ').trim();

export interface SynthOpts { rate?: number; pitch?: number; emotion?: Emotion }

function elText(text: string, emotion?: Emotion): string {
  const body = stripTags(text);
  if (!body) throw new TtsError(400, 'Matn bo‘sh');
  return emotion ? `${EL_TAG[emotion]} ${body}` : body;
}

/** Keshda bormi (xarajatsiz)? Marshrut limitni faqat yangi (xarajatli) so'rovga qo'llash uchun ishlatadi. */
export function isCached(cfg: TtsConfig, text: string, opts: SynthOpts = {}): boolean {
  if (cfg.provider === 'none') return false;
  return existsSync(cacheFile(cfg, text, opts));
}

function cacheFile(cfg: TtsConfig, text: string, opts: SynthOpts): string {
  if (cfg.provider === 'elevenlabs') return join(cfg.cacheDir, `el-${cacheKey(cfg.voice, elText(text, opts.emotion), 1, 0, cfg.model)}.mp3`);
  const rate = Math.min(1.4, Math.max(0.7, opts.rate ?? 1));
  const pitch = Math.min(30, Math.max(-30, Math.round(opts.pitch ?? 0)));
  return join(cfg.cacheDir, `${cacheKey(cfg.voice, text, rate, pitch)}.mp3`);
}

/** Taxminiy xarajat (USD) — xarajat jurnali uchun; haqiqiy hisob provayder hisob-fakturasidan tekshiriladi. */
export const estimateCostUsd = (cfg: TtsConfig, chars: number): number => (cfg.provider === 'elevenlabs' ? (chars / 1000) * (cfg.pricePer1kChars ?? 0) : (chars / 1_000_000) * 15);

export function cleanText(raw: unknown): string {
  const t = String(raw ?? '').replace(/\s+/g, ' ').trim();
  if (!t) throw new TtsError(400, 'Matn bo‘sh');
  if (t.length > MAX_TEXT) throw new TtsError(400, 'Matn juda uzun');
  return t;
}

/** Matnni mp3 ga o'giradi. Bir xil matn diskdan beriladi (xarajat va kechikish yo'q). `chars` = provayderga yuborilgan belgilar (keshda 0). */
export async function synthesize(cfg: TtsConfig, text: string, opts: SynthOpts = {}): Promise<{ audio: Buffer; cached: boolean; chars: number }> {
  if (cfg.provider === 'none') throw new TtsError(503, 'Ovoz xizmati yoqilmagan');
  if (cfg.provider === 'elevenlabs') return synthesizeEl(cfg, text, opts);
  const rate = Math.min(1.4, Math.max(0.7, opts.rate ?? 1));
  const pitch = Math.min(30, Math.max(-30, Math.round(opts.pitch ?? 0)));
  const file = join(cfg.cacheDir, `${cacheKey(cfg.voice, text, rate, pitch)}.mp3`);
  if (existsSync(file)) return { audio: readFileSync(file), cached: true, chars: 0 };
  const f = cfg.fetchImpl ?? fetch;
  let r: Response;
  try {
    r = await f(`https://${cfg.region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: { 'ocp-apim-subscription-key': cfg.key, 'content-type': 'application/ssml+xml', 'x-microsoft-outputformat': 'audio-24khz-48kbitrate-mono-mp3', 'user-agent': 'sellzen-tts' },
      body: ssml(cfg.voice, text, rate, pitch),
      signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new TtsError(502, 'Ovoz xizmatiga ulanib bo‘lmadi'); }
  if (!r.ok) throw new TtsError(502, `Ovoz xizmati xatosi (${r.status})`);
  const audio = Buffer.from(await r.arrayBuffer());
  if (audio.length < 200) throw new TtsError(502, 'Ovoz xizmati bo‘sh javob berdi');
  mkdirSync(cfg.cacheDir, { recursive: true });
  writeFileSync(file, audio);
  return { audio, cached: false, chars: text.length };
}

async function synthesizeEl(cfg: TtsConfig, text: string, opts: SynthOpts): Promise<{ audio: Buffer; cached: boolean; chars: number }> {
  const input = elText(text, opts.emotion);
  const file = cacheFile(cfg, text, opts);
  if (existsSync(file)) return { audio: readFileSync(file), cached: true, chars: 0 };
  const f = cfg.fetchImpl ?? fetch;
  let r: Response;
  try {
    r = await f(`https://api.elevenlabs.io/v1/text-to-speech/${cfg.voice}?output_format=mp3_44100_128`, {
      method: 'POST',
      headers: { 'xi-api-key': cfg.key, 'content-type': 'application/json', accept: 'audio/mpeg' },
      body: JSON.stringify({ text: input, model_id: cfg.model }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch { throw new TtsError(502, 'Ovoz xizmatiga ulanib bo‘lmadi'); }
  if (!r.ok) throw new TtsError(502, `Ovoz xizmati xatosi (${r.status})`);
  const audio = Buffer.from(await r.arrayBuffer());
  if (audio.length < 200) throw new TtsError(502, 'Ovoz xizmati bo‘sh javob berdi');
  mkdirSync(cfg.cacheDir, { recursive: true });
  writeFileSync(file, audio);
  return { audio, cached: false, chars: input.length };
}
