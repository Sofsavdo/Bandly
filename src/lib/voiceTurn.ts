// Sellzen uchun ovozli navbat: mikrofonni yozib oladi, gap tugaganini o'zi sezadi (sukut), ovozni serverga yuboradi,
// server uni ElevenLabs Scribe bilan matnga aylantiradi (inglizcha xatolar bilan so'zma-so'z, o'zbekcha ham aniq).
// Ovoz qurilmada ham, serverda ham saqlanmaydi. Mikrofon sessiyada BIR MARTA ochiladi: suhbatlar orasida faqat o'chirib qo'yiladi
// (Telegram va telefon brauzerlari har getUserMedia'da ruxsat so'raydi). Ilova yopilganda yoki 2 daqiqa fonda tursa — to'liq yopiladi.
import { getAccount } from './account';
import { L } from '../i18n';
import { SpeechError, type TurnOptions, type TurnResult } from './speech';
import { coachStatus } from './coach';

type Mic = { stream: MediaStream; ctx: AudioContext; an: AnalyserNode; buf: Float32Array; floor: number };
let mic: Mic | null = null;

export const recorderSupported = (): boolean =>
  typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined' && typeof AudioContext !== 'undefined';

/** Brauzer yoza oladigan format: Chrome/Firefox — webm/opus, Safari — mp4/aac. */
export function pickMime(): string {
  const c = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return c.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? '';
}

async function openMic(): Promise<Mic> {
  if (mic && mic.stream.getAudioTracks().some((t) => t.readyState === 'live')) {
    mic.stream.getAudioTracks().forEach((t) => { t.enabled = true; });
    if (mic.ctx.state === 'suspended') await Promise.race([mic.ctx.resume().catch(() => undefined), new Promise<void>((r) => setTimeout(r, 800))]);
    return mic;
  }
  // AudioContext bosish (user gesture) ichida yaratiladi: iOS/Telegram'da getUserMedia'dan keyin yaratilsa "suspended" qolib, ovoz darajasi doim 0 chiqadi
  let ctx: AudioContext | null = null;
  try { ctx = new AudioContext(); void ctx.resume().catch(() => undefined); } catch { ctx = null; }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
  } catch (e) {
    void ctx?.close().catch(() => undefined);
    const n = (e as DOMException).name;
    if (n === 'NotAllowedError' || n === 'SecurityError') throw new SpeechError('denied', L('Mikrofonga ruxsat berilmagan.'));
    if (n === 'NotFoundError' || n === 'OverconstrainedError') throw new SpeechError('nomic', L('Mikrofon topilmadi.'));
    throw new SpeechError('unstable', L('Mikrofonni ochib bo‘lmadi.'));
  }
  ctx ??= new AudioContext();
  const an = ctx.createAnalyser();
  an.fftSize = 1024;
  ctx.createMediaStreamSource(stream).connect(an);
  // resume() ba'zi qurilmalarda hech qachon tugamaydi: ko'pi bilan 0,8 s kutamiz (aks holda "Tinglayapman…" qotib qoladi)
  if (ctx.state === 'suspended') await Promise.race([ctx.resume().catch(() => undefined), new Promise<void>((r) => setTimeout(r, 800))]);
  mic = { stream, ctx, an, buf: new Float32Array(an.fftSize), floor: 0.004 };
  return mic;
}

/** Suhbat tugaganda: mikrofon o'chiriladi (ovoz olinmaydi), lekin ruxsat qayta so'ralmasligi uchun oqim saqlanadi. */
export function parkMic(): void {
  if (!mic) return;
  mic.stream.getAudioTracks().forEach((t) => { t.enabled = false; });
  void mic.ctx.suspend().catch(() => undefined);
}

/** Mikrofonni to'liq yopadi (ilova yopilganda yoki uzoq fonda turganda). */
export function releaseMic(): void {
  if (!mic) return;
  mic.stream.getTracks().forEach((t) => t.stop());
  void mic.ctx.close().catch(() => undefined);
  mic = null;
}

/** Hozirgi ovoz balandligi (RMS, 0..1). */
function level(m: Mic): number {
  m.an.getFloatTimeDomainData(m.buf);
  let s = 0;
  for (let i = 0; i < m.buf.length; i++) s += m.buf[i]! * m.buf[i]!;
  return Math.sqrt(s / m.buf.length);
}

/** Nutq chegarasi: shovqin darajasidan yuqori (xonadagi shovqinga moslashadi). Past chegara 0,014: ba'zi telefonlarda (avtomatik kuchaytirish o'chiq)
 *  odatiy ovoz 0,02 atrofida — avvalgi 0,024 chegara bunday ovozni "jim" deb hisoblardi. */
export const speechThreshold = (floor: number, strict = false): number => Math.max(strict ? 0.045 : 0.014, floor * (strict ? 6 : 3.2));
/** Bu darajadan past ovoz — mikrofon umuman ovoz olmayapti (o'chiq, yopiq yoki boshqa ilova band qilgan). */
export const HEARD_RMS = 0.006;
/** Shovqin darajasini sekin kuzatadi: faqat jim paytlarda yangilanadi. */
export const nextFloor = (floor: number, v: number): number => (v < floor * 2.5 ? floor * 0.95 + v * 0.05 : floor);

export interface RecordOptions {
  silenceMs: number;   // gapdan keyingi shuncha sukut — navbat tugadi
  maxMs: number;       // eng uzun navbat
  noSpeechMs: number;  // umuman gapirilmasa — bo'sh qaytadi
  onLevel?: (v: number) => void;      // to'lqin animatsiyasi uchun (0..1)
  onSpeech?: () => void;              // o'quvchi gapira boshladi
  endRef: { current: (() => void) | null }; // "Tugatdim" tugmasi
  signal: { cancelled: boolean };
}
/** Yozuv serverga yuboriladimi: gap aniqlangan (0,4 s dan uzun — qisqasi yo'tal/shovqin) yoki o'quvchi o'zi "Tugatdim" bosgan va mikrofon ovoz olgan. */
export function shouldSend(d: { cancelled: boolean; speechAt: number; speechMs: number; manual: boolean; recMs: number; peak: number }): boolean {
  if (d.cancelled) return false;
  if (d.speechAt > 0) return d.speechMs >= 400;
  return d.manual && d.recMs >= 900 && d.peak >= 0.004;
}

export interface Recording { blob: Blob | null; mime: string; speechMs: number; /** eng baland ovoz (RMS) */ peak: number; /** mikrofon biror ovoz oldimi */ heard: boolean }

/** Bitta navbatni yozadi: gap boshlanishini va tugashini o'zi sezadi. Gapirilmasa blob = null. */
export async function recordTurn(o: RecordOptions): Promise<Recording> {
  const m = await openMic();
  const mime = pickMime();
  const rec = new MediaRecorder(m.stream, mime ? { mimeType: mime, audioBitsPerSecond: 32_000 } : undefined);
  const parts: Blob[] = [];
  rec.ondataavailable = (e) => { if (e.data.size) parts.push(e.data); };
  const start = performance.now();
  let speechAt = 0, lastVoice = 0, loud = 0, peak = 0;
  return new Promise<Recording>((resolve, reject) => {
    let done = false;
    const finish = (manual = false) => {
      if (done) return;
      done = true;
      clearInterval(t);
      o.endRef.current = null;
      const recMs = performance.now() - start;
      const speechMs = speechAt ? lastVoice - speechAt : 0;
      // Avtomatik aniqlash gapni sezmagan, lekin o'quvchi o'zi "Tugatdim" bosgan va mikrofon ovoz olgan: baribir yuboramiz
      // (past ovozli telefonlarda shu yo'l "gapirsam eshitmayapti" muammosini yo'qotadi). Mikrofon butunlay jim bo'lsa — yuborilmaydi.
      const trusted = !speechAt && shouldSend({ cancelled: o.signal.cancelled, speechAt, speechMs, manual, recMs, peak });
      const send = shouldSend({ cancelled: o.signal.cancelled, speechAt, speechMs, manual, recMs, peak });
      const mt = rec.mimeType || mime || 'audio/webm';
      rec.onstop = () => resolve({ blob: send ? new Blob(parts, { type: mt }) : null, mime: mt, speechMs: speechAt ? speechMs : trusted ? recMs : 0, peak, heard: peak >= HEARD_RMS });
      try { rec.state !== 'inactive' ? rec.stop() : rec.onstop(new Event('stop')); } catch { resolve({ blob: null, mime, speechMs: 0, peak, heard: peak >= HEARD_RMS }); }
    };
    o.endRef.current = () => finish(true);
    rec.onerror = () => { if (!done) { done = true; clearInterval(t); o.endRef.current = null; reject(new SpeechError('unstable', L('Ovozni yozib bo‘lmadi.'))); } };
    try { rec.start(250); } catch { reject(new SpeechError('unstable', L('Ovozni yozib bo‘lmadi.'))); return; }
    const t = setInterval(() => {
      if (o.signal.cancelled) { finish(); return; }
      const now = performance.now(), v = level(m);
      if (v > peak) peak = v;
      o.onLevel?.(Math.min(1, v * 12));
      const th = speechThreshold(m.floor);
      if (v > th) {
        loud += 60;
        if (loud >= 240) { if (!speechAt) { speechAt = now - loud; o.onSpeech?.(); } lastVoice = now; } // ~0.25 s davomli ovoz — gap (qisqa shovqin emas)
      } else { loud = 0; m.floor = nextFloor(m.floor, v); }
      if (speechAt && now - lastVoice > o.silenceMs) finish();
      else if (!speechAt && now - start > o.noSpeechMs) finish();
      else if (now - start > o.maxMs) finish();
    }, 60);
  });
}

/** Ustoz gapirayotganda: o'quvchi gapira boshlasa (gapni bo'lsa) onSpeech chaqiriladi. Qaytgan funksiya kuzatuvni to'xtatadi.
 *  Karnaydan chiqqan ustoz ovozini o'quvchi deb o'ylamaslik uchun chegara baland va gap ~0.4 s davom etishi kerak. */
export async function watchBargeIn(onSpeech: () => void): Promise<() => void> {
  let m: Mic;
  try { m = await openMic(); } catch { return () => undefined; }
  let loud = 0, stopped = false;
  const t = setInterval(() => {
    if (stopped) return;
    const v = level(m);
    if (v > speechThreshold(m.floor, true)) { loud += 60; if (loud >= 420) { stopped = true; clearInterval(t); onSpeech(); } } else loud = Math.max(0, loud - 60);
  }, 60);
  return () => { stopped = true; clearInterval(t); };
}

export class SttError extends Error { constructor(public status: number, message: string) { super(message); } }

/** Yozilgan ovozni serverga yuboradi va tanilgan matnni qaytaradi. */
export async function transcribeTurn(r: Recording, expect: 'en' | 'any' = 'any'): Promise<{ text: string; lang: string | null }> {
  const a = getAccount();
  if (!a || !r.blob) return { text: '', lang: null };
  const res = await fetch('/api/ai/stt', { method: 'POST', headers: { 'content-type': r.mime.split(';')[0]!, 'x-token': a.token, 'x-expect': expect }, body: r.blob, signal: AbortSignal.timeout(35_000) })
    .catch(() => { throw new SttError(0, L('Internet aloqasi uzildi.')); });
  const j = (await res.json().catch(() => ({}))) as { text?: string; lang?: string | null; error?: string };
  if (!res.ok) throw new SttError(res.status, j.error ?? L('Nutqni tanib bo‘lmadi.'));
  return { text: (j.text ?? '').trim(), lang: j.lang ?? null };
}

// Ilova yopilsa yoki 2 daqiqa fonda tursa — mikrofon to'liq yopiladi (keyingi safar bir marta so'raladi)
if (typeof window !== 'undefined') {
  let hiddenAt = 0;
  window.addEventListener('pagehide', releaseMic);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { hiddenAt = Date.now(); setTimeout(() => { if (document.hidden && Date.now() - hiddenAt >= 119_000) releaseMic(); }, 120_000); }
  });
}

// ---------------- Barcha ovozli mashqlar uchun server tanishi ----------------
let serverOk: boolean | null = null;
const statusP: Promise<void> = typeof window !== 'undefined' ? coachStatus().then((st) => { serverOk = st.stt; }).catch(() => { serverOk = false; }) : Promise.resolve();
/** Server tanishi holati hali noma'lum (sahifa endi ochilgan): mikrofon bosilsa shu javobni kutamiz (ko'pi 3 s), aks holda
 *  Telegram ichida yo'q brauzer tanishiga tushib qolardi. */
export const sttStatusPending = (): boolean => serverOk === null && recorderSupported() && !!getAccount();
export const waitSttStatus = (): Promise<void> => Promise.race([statusP, new Promise<void>((r) => setTimeout(r, 3000))]);
/** Server tanishi ishlatiladimi (kalit bor, brauzer yozib oladi, o'quvchi kirgan, limit tugamagan). */
export const serverSttReady = (): boolean => serverOk === true && recorderSupported() && !!getAccount();

/** Brauzer tanishi o'rniga: bitta mikrofon, aniq server tanishi. Limit tugasa — shu sessiyada brauzer tanishiga qaytiladi. */
export async function serverTurn(o: TurnOptions): Promise<TurnResult> {
  const start = performance.now();
  o.onStatus?.('starting');
  const r = await recordTurn({ silenceMs: o.silenceMs, maxMs: o.maxMs, noSpeechMs: o.noSpeechMs ?? 12_000, endRef: o.endRef, signal: o.signal, onSpeech: () => o.onStatus?.('speech'), ...(o.onLevel ? { onLevel: o.onLevel } : {}) });
  o.onStatus?.('mic');
  if (!r.blob) return { text: '', seconds: 0, latencyMs: performance.now() - start, heard: r.heard };
  o.onInterim('…');
  try {
    // Mashqlar inglizcha: aksentli inglizchani server o'zbekcha deb aniqlab, ma'nosiz matn qaytarardi — endi faqat ingliz tilida taniladi
    const t = await transcribeTurn(r, o.mixed ? 'any' : 'en');
    return { text: t.text, seconds: r.speechMs / 1000, latencyMs: performance.now() - start, heard: true };
  } catch (e) {
    if (e instanceof SttError && (e.status === 429 || e.status === 503)) serverOk = false;
    throw e instanceof SttError ? new SpeechError(e.status === 0 ? 'network' : 'unstable', e.message) : e;
  }
}

/** Ochiq mikrofon (ruxsat bir marta so'raladi) — Gemini Live qo'ng'irog'i ham shu oqimni ishlatadi. */
export async function micContext(): Promise<{ stream: MediaStream; ctx: AudioContext }> {
  const m = await openMic();
  return { stream: m.stream, ctx: m.ctx };
}
