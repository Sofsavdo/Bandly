// AI xarajatini HAQIQIY token sonidan o'lchash: har provayder javobida qaytaradigan usage ma'lumoti (Gemini usageMetadata,
// OpenAI usage, Anthropic usage) olinadi va narx (USD / 1 mln token) bilan ko'paytiriladi. Narx Railway o'zgaruvchilaridan,
// berilmasa — standart narx ("estimated" belgisi bilan). Kim va qaysi funksiya uchun ekanini AsyncLocalStorage konteksti beradi.
import { AsyncLocalStorage } from 'node:async_hooks';

export interface Usage { inTok: number; outTok: number }
/** Ovozli (Live) sessiya: matn va audio tokenlari alohida narxlanadi. */
export interface LiveUsage { textIn: number; audioIn: number; textOut: number; audioOut: number }

const num = (v: unknown): number => (Number.isFinite(Number(v)) && Number(v) > 0 ? Math.round(Number(v)) : 0);

/** Provayder javobidan token soni. Topilmasa — null (xarajat yozilmaydi, taxmin qilinmaydi). */
export function parseUsage(provider: string, j: Record<string, any>): Usage | null { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (provider === 'anthropic') { const u = j?.usage; return u ? { inTok: num(u.input_tokens) + num(u.cache_read_input_tokens) + num(u.cache_creation_input_tokens), outTok: num(u.output_tokens) } : null; }
  if (provider === 'openai') { const u = j?.usage; return u ? { inTok: num(u.prompt_tokens), outTok: num(u.completion_tokens) } : null; }
  const u = j?.usageMetadata; // gemini: o'ylash tokenlari chiqish narxida hisoblanadi
  return u ? { inTok: num(u.promptTokenCount), outTok: num(u.candidatesTokenCount) + num(u.thoughtsTokenCount) } : null;
}

export interface TextPrice { inPerM: number; outPerM: number; estimated: boolean }
/** Matn modeli narxi: AI_PRICE_IN_PER_M / AI_PRICE_OUT_PER_M (USD, 1 mln token uchun). */
export function textPrice(env: Record<string, string | undefined> = process.env): TextPrice {
  const i = Number(env.AI_PRICE_IN_PER_M), o = Number(env.AI_PRICE_OUT_PER_M);
  const set = Number.isFinite(i) && i > 0 && Number.isFinite(o) && o > 0;
  return set ? { inPerM: i, outPerM: o, estimated: false } : { inPerM: 0.5, outPerM: 3, estimated: true };
}
export const textCost = (u: Usage, p: TextPrice): number => (u.inTok * p.inPerM + u.outTok * p.outPerM) / 1e6;

export interface LivePrice { textIn: number; audioIn: number; textOut: number; audioOut: number; estimated: boolean }
/** Live (native audio) narxi, USD / 1 mln token: PRICE_LIVE_{TEXT_IN,AUDIO_IN,TEXT_OUT,AUDIO_OUT}_PER_M. */
export function livePrice(env: Record<string, string | undefined> = process.env): LivePrice {
  const g = (k: string) => { const v = Number(env[k]); return Number.isFinite(v) && v > 0 ? v : null; };
  const t = { textIn: g('PRICE_LIVE_TEXT_IN_PER_M'), audioIn: g('PRICE_LIVE_AUDIO_IN_PER_M'), textOut: g('PRICE_LIVE_TEXT_OUT_PER_M'), audioOut: g('PRICE_LIVE_AUDIO_OUT_PER_M') };
  return { textIn: t.textIn ?? 0.5, audioIn: t.audioIn ?? 3, textOut: t.textOut ?? 2, audioOut: t.audioOut ?? 12, estimated: Object.values(t).some((v) => v === null) };
}
export const liveCost = (u: LiveUsage, p: LivePrice): number => (u.textIn * p.textIn + u.audioIn * p.audioIn + u.textOut * p.textOut + u.audioOut * p.audioOut) / 1e6;

/** Live xabaridagi usageMetadata'ni yig'indiga qo'shadi (modallik bo'yicha: TEXT / AUDIO). Har burilish oxirida keladi. */
export function addLiveUsage(acc: LiveUsage, meta: Record<string, any> | undefined): void { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!meta) return;
  const split = (details: unknown, total: number, kind: 'in' | 'out') => {
    const list = Array.isArray(details) ? details as { modality?: string; tokenCount?: number }[] : [];
    let audio = 0, text = 0;
    for (const d of list) { if (String(d.modality).toUpperCase() === 'AUDIO') audio += num(d.tokenCount); else text += num(d.tokenCount); }
    if (!list.length) text = total; // tafsilot bo'lmasa — matn narxida (pastroq baholamaslik uchun audio chiqishi alohida)
    if (kind === 'in') { acc.audioIn += audio; acc.textIn += text; } else { acc.audioOut += audio; acc.textOut += text; }
  };
  split(meta.promptTokensDetails, num(meta.promptTokenCount), 'in');
  split(meta.responseTokensDetails, num(meta.responseTokenCount) + num(meta.thoughtsTokenCount), 'out');
}
export const emptyLive = (): LiveUsage => ({ textIn: 0, audioIn: 0, textOut: 0, audioOut: 0 });

// ---- Kontekst: qaysi o'quvchi va funksiya uchun so'rov ketmoqda ----
export interface AiCtx { playerId: number | null; feature: string }
const store = new AsyncLocalStorage<AiCtx>();
type Sink = (ctx: AiCtx, provider: string, model: string, u: Usage) => void;
let sink: Sink | null = null;
export const setUsageSink = (s: Sink | null): void => { sink = s; };
export const withAiCtx = <T>(ctx: AiCtx, fn: () => Promise<T>): Promise<T> => store.run(ctx, fn);
/** ai.complete ichidan chaqiriladi; kontekst bo'lmasa (masalan tarjima — o'zi alohida hisoblaydi) yozilmaydi. */
export function reportUsage(provider: string, model: string, u: Usage | null): void {
  const ctx = store.getStore();
  if (!ctx || !u || !sink || (u.inTok === 0 && u.outTok === 0)) return;
  try { sink(ctx, provider, model, u); } catch (e) { console.warn('[ai-cost] yozilmadi:', (e as Error).message); }
}
