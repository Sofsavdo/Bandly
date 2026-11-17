import { getAccount } from './account';
import type { Emotion } from '../content/roasts';

// Server orqali o'zbekcha neyron ovoz (agar serverda TTS_KEY sozlangan bo'lsa). Ovoz yozib olinmaydi: faqat matn yuboriladi.
interface TtsStatus { enabled: boolean; provider: 'azure' | 'elevenlabs' | 'none' }
let status: Promise<TtsStatus> | null = null;
const ttsStatus = (): Promise<TtsStatus> =>
  (status ??= fetch('/api/tts/status').then((r) => (r.ok ? r.json() : {})).then((j: { enabled?: boolean; provider?: TtsStatus['provider'] }) => ({ enabled: !!j.enabled, provider: j.enabled ? j.provider ?? 'azure' : 'none' })).catch(() => ({ enabled: false, provider: 'none' as const })));
export const uzTtsEnabled = (): Promise<boolean> => ttsStatus().then((s) => s.enabled);
/** ElevenLabs ovozida kulgi, jahl va h.k. ovozning o'zida bo'ladi — brauzerdagi qo'shimcha "ha-ha" kerak emas. */
export const uzTtsExpressive = (): Promise<boolean> => ttsStatus().then((s) => s.enabled && s.provider === 'elevenlabs');

const STYLE: Record<Emotion, { rate: number; pitch: number }> = {
  happy: { rate: 1.0, pitch: 6 },
  angry: { rate: 1.15, pitch: -10 },
  laugh: { rate: 1.1, pitch: 12 },
  disappointed: { rate: 0.85, pitch: -12 },
  impressed: { rate: 1.0, pitch: 10 },
};

let current: HTMLAudioElement | null = null;
export const stopUz = (): void => { if (current) { current.pause(); current = null; } };

/** Ovozni oldindan tayyorlaydi (serverdan oladi), lekin chalmaydi. null — xizmat o'chiq/limit/xato. part>0 — shu javobning davomi (limitga qayta sanalmaydi). */
/** Oxirgi rad etish sababi: 429 — kunlik ovoz limiti tugadi. */
export let lastTtsStatus = 0;
export async function prepareUz(text: string, emotion: Emotion, feature?: 'coach', part = 0): Promise<string | null> {
  const acc = getAccount();
  if (!acc || !(await uzTtsEnabled())) return null;
  try {
    const r = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token: acc.token, text, emotion, feature, part, ...STYLE[emotion] }), signal: AbortSignal.timeout(12_000) });
    lastTtsStatus = r.status;
    return r.ok ? URL.createObjectURL(await r.blob()) : null;
  } catch { lastTtsStatus = 0; return null; }
}

/** Tayyor ovozni chaladi (signal bekor qilsa — to'xtaydi). */
export function playPrepared(url: string, signal: { cancelled: boolean }): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const a = new Audio(url);
    current = a;
    let done = false;
    const finish = (ok: boolean) => { if (done) return; done = true; clearInterval(poll); URL.revokeObjectURL(url); if (current === a) current = null; resolve(ok); };
    const poll = setInterval(() => { if (signal.cancelled) { a.pause(); finish(true); } }, 120);
    a.onended = () => finish(true);
    a.onerror = () => finish(false);
    a.play().catch(() => finish(false));
  });
}

/** O'zbekcha matnni chaladi. Muvaffaqiyatli bo'lsa true; xizmat o'chiq/limit/xato bo'lsa false (chaqiruvchi zaxira ovozga o'tadi). */
export async function playUz(text: string, emotion: Emotion, signal: { cancelled: boolean }, feature?: 'coach'): Promise<boolean> {
  if (signal.cancelled) return false;
  const url = await prepareUz(text, emotion, feature);
  if (!url || signal.cancelled) { if (url) URL.revokeObjectURL(url); return false; }
  return playPrepared(url, signal);
}
