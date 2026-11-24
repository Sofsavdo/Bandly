// Gemini Live qo'ng'irog'i (ovozdan-ovozga): Sellzen ovozi 24 kHz PCM bo'laklarda keladi va darhol navbat bilan chalinadi.
// Bosib-gapirish rejimi (ptt, standart): mikrofon ovozi FAQAT tugma bosilib turganda 16 kHz PCM bo'lib serverga boradi; qo'yib yuborilganda
// ustoz javob beradi. Shovqin ustozni bo'lmaydi, gap o'rtasida eshitish rejimiga o'tilmaydi; ustozni faqat tugmani ataylab bosish to'xtatadi.
// Qo'lsiz rejim (ptt=false): uzluksiz oqim, gap tugashini va gapni bo'lishni Gemini o'zi aniqlaydi ("interrupted").
import { micContext, parkMic } from './voiceTurn';
import { MIN_VOICED_MS, TAIL_MS, VOICED_RMS, tallyVoiced } from './ptt';
import { L } from '../i18n';

export interface LiveHandlers {
  /** capSec — server ruxsat bergan qo'ng'iroq uzunligi (soniya): ekrandagi "03:12 / 10:00" taymeri uchun */
  onReady(info: { capSec: number; ptt: boolean }): void;
  onSpeaking(on: boolean): void;
  onLevel(v: number): void;
  onHeard(text: string): void;
  onSaid(text: string): void;
  onError(message: string, beforeReady: boolean): void;
  /** kind: 'session' — qo'ng'iroq vaqti (10 daqiqa) tugadi; 'quota' — kunlik/oylik daqiqalar tugadi (obuna taklif qilinadi) */
  onLimit(message: string, kind: 'session' | 'quota'): void;
  onClosed(): void;
  /** Ustoz javobi (yoki o'quvchi gapi) tugadi — ekrandagi matn keyingi navbatda yangilanadi */
  onTurn?(): void;
  /** Tugma bosilib-qo'yib yuborildi, lekin ovoz eshitilmadi: hech narsa yuborilmadi */
  onNoVoice?(): void;
  /** O'quvchi ingliz tilini o'rganishni so'radi: ekranda "Darslarga o'tish" */
  onSuggest?(kind: 'lessons'): void;
  /** Ustoz hissiyoti (server ustoz matnidan aniqlaydi): ekrandagi effekt uchun */
  onEmotion?(e: 'angry' | 'laugh' | 'happy' | 'impressed' | 'disappointed' | 'neutral'): void;
}
export interface LiveCall {
  end(): void;
  /** Bosib-gapirish: true — tugma bosildi (yozish boshlanadi), false — qo'yib yuborildi (ustoz javob beradi). Qo'lsiz rejimda ta'sir qilmaydi. */
  talk(on: boolean): void;
}

export const liveSupported = (): boolean => typeof window !== 'undefined' && typeof WebSocket !== 'undefined' && typeof AudioWorkletNode !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

const WORKLET = `class SellzenMic extends AudioWorkletProcessor { process(inputs) { const ch = inputs[0] && inputs[0][0]; if (ch) this.port.postMessage(ch.slice(0)); return true; } } registerProcessor('sellzen-mic', SellzenMic);`;
const loaded = new WeakSet<AudioContext>();

/** Float32 (kontekst chastotasi) → Int16 16 kHz (o'rtacha bilan siqish). */
export function downsample(input: Float32Array, fromRate: number, carry: number[]): Int16Array {
  const ratio = fromRate / 16000;
  const all = carry.length ? Float32Array.from([...carry, ...input]) : input;
  const n = Math.floor(all.length / ratio);
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i * ratio), b = Math.floor((i + 1) * ratio);
    let s = 0; for (let k = a; k < b; k++) s += all[k]!;
    const v = Math.max(-1, Math.min(1, s / Math.max(1, b - a)));
    out[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  carry.length = 0;
  for (let k = Math.floor(n * ratio); k < all.length; k++) carry.push(all[k]!);
  return out;
}
const rms = (f: Float32Array): number => { let s = 0; for (let i = 0; i < f.length; i++) s += f[i]! * f[i]!; return Math.sqrt(s / Math.max(1, f.length)); };

export async function startLive(o: { token: string; adult: boolean; level: string | null; lang: string; style?: number; ptt?: boolean }, h: LiveHandlers): Promise<LiveCall> {
  const ptt = o.ptt !== false;
  // Server (va Gemini) bilan ulanish mikrofon tayyorlanishi bilan PARALLEL boshlanadi — kutish vaqti qisqaradi.
  // Mikrofon tayyor bo'lguncha kelgan xabarlar navbatda turadi va keyin qayta ishlanadi.
  const proto0 = location.protocol === 'https:' ? 'wss' : 'ws';
  const q0 = new URLSearchParams({ adult: o.adult ? '1' : '0', level: o.level ?? '', lang: o.lang, style: String(o.style ?? (o.adult ? 2 : 0)), ...(ptt ? { ptt: '1' } : {}) });
  const ws = new WebSocket(`${proto0}://${location.host}/api/ai/live?${q0}`, ['sellzen.v1', `tk.${o.token}`]);
  ws.binaryType = 'arraybuffer';
  const early: MessageEvent[] = [];
  let earlyClose = false;
  ws.onmessage = (e) => { early.push(e); };
  ws.onclose = () => { earlyClose = true; };
  let mic: Awaited<ReturnType<typeof micContext>>;
  try { mic = await micContext(); } catch (e) { try { ws.close(); } catch { /* */ } throw e; }
  const { stream, ctx } = mic;
  if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined);
  if (!loaded.has(ctx)) { await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))); loaded.add(ctx); }
  const src = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, 'sellzen-mic');
  const mute = ctx.createGain(); mute.gain.value = 0;
  src.connect(node); node.connect(mute); mute.connect(ctx.destination);
  const out = ctx.createGain(); out.connect(ctx.destination);

  // Token URL'da emas (proksi loglariga tushmasin) — subprotocol sarlavhasida (server/live.ts tokenFromProtocols)

  let ready = false, ended = false, speaking = false, nextAt = 0, floor = 0.01;
  const playing = new Set<AudioBufferSourceNode>();
  const carry: number[] = [];
  let pendingPcm: Int16Array[] = [], pendingLen = 0;

  const setSpeaking = (on: boolean) => { if (speaking !== on) { speaking = on; h.onSpeaking(on); } };
  const stopPlayback = () => { for (const s of playing) { try { s.stop(); } catch { /* */ } } playing.clear(); nextAt = ctx.currentTime; setSpeaking(false); };

  const flush = (force = false) => {
    if (!pendingLen || (!force && pendingLen < 640)) return; // ~40 ms bo'laklar
    const buf = new Int16Array(pendingLen); let off = 0;
    for (const p of pendingPcm) { buf.set(p, off); off += p.length; }
    pendingPcm = []; pendingLen = 0;
    ws.send(buf.buffer);
  };
  const push = (pcm: Int16Array) => { pendingPcm.push(pcm); pendingLen += pcm.length; flush(); };

  // ---- Bosib-gapirish holati ----
  let talking = false, tail: ReturnType<typeof setTimeout> | null = null, started = false, voicedMs = 0, pre: Int16Array[] = [], preLen = 0;
  const capturing = () => talking || tail !== null;
  const sendActivity = (on: boolean) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'activity', on })); };
  const begin = () => { // gap boshlandi (yoki ustozni ataylab to'xtatdi): navbatni ochamiz va yig'ilgan boshlanishni yuboramiz
    started = true; sendActivity(true);
    for (const p of pre) push(p);
    pre = []; preLen = 0;
  };
  const finishTalk = () => {
    if (started) { flush(true); sendActivity(false); }
    else h.onNoVoice?.(); // ovoz eshitilmadi — bo'sh navbat yuborilmaydi
    started = false; pre = []; preLen = 0; voicedMs = 0; carry.length = 0;
  };

  node.port.onmessage = (e: MessageEvent<Float32Array>) => {
    if (!ready || ws.readyState !== WebSocket.OPEN) return;
    const f = e.data;
    const v = rms(f);
    if (ptt) {
      if (!capturing()) return; // tugma bosilmagan: ovoz serverga bormaydi
      h.onLevel(Math.min(1, v * 12));
      const pcm = downsample(f, ctx.sampleRate, carry);
      if (started) { push(pcm); return; }
      pre.push(pcm); preLen += pcm.length;
      while (preLen > 48_000 && pre.length > 1) preLen -= pre.shift()!.length; // ~3 soniyagacha
      voicedMs = tallyVoiced(voicedMs, v, VOICED_RMS, (f.length / ctx.sampleRate) * 1000); // yumshoq chegara: o'quvchi ataylab bosgan — faqat butunlay jim mikrofon "ovoz yo'q" hisoblanadi
      if (voicedMs >= MIN_VOICED_MS) begin();
      return;
    }
    if (!speaking) { h.onLevel(Math.min(1, v * 12)); if (v < floor * 2.5) floor = floor * 0.97 + v * 0.03; }
    // Sellzen gapirayotganda: karnaydan qaytgan uning o'z ovozini yubormaymiz — faqat baland gap (gapni bo'lish) o'tadi
    const pass = !speaking || v > Math.max(0.06, floor * 8);
    push(downsample(pass ? f : new Float32Array(f.length), ctx.sampleRate, carry));
  };

  ws.onmessage = (e: MessageEvent) => {
    if (typeof e.data !== 'string') {
      const i16 = new Int16Array(e.data as ArrayBuffer);
      if (!i16.length) return;
      const f = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f[i] = i16[i]! / 0x8000;
      const b = ctx.createBuffer(1, f.length, 24000);
      b.copyToChannel(f, 0);
      const s = ctx.createBufferSource(); s.buffer = b; s.connect(out);
      const at = Math.max(ctx.currentTime + 0.03, nextAt);
      s.start(at); nextAt = at + b.duration; playing.add(s);
      setSpeaking(true); h.onLevel(Math.min(1, rms(f) * 6));
      s.onended = () => { playing.delete(s); if (!playing.size && ctx.currentTime >= nextAt - 0.05) setSpeaking(false); };
      return;
    }
    let m: { type?: string; text?: string; message?: string; value?: string; kind?: string; capSec?: number; ptt?: boolean };
    try { m = JSON.parse(e.data as string); } catch { return; }
    if (m.type === 'ready') { ready = true; h.onReady({ capSec: Number(m.capSec) || 0, ptt: m.ptt === true }); }
    // Javob tugadi: hissiyot effekti ovoz chalinib bo'lgach o'chadi (keyingi javobda eski hissiyot qolmasin)
    else if (m.type === 'turn') { h.onTurn?.(); const left = Math.max(0, (nextAt - ctx.currentTime) * 1000); setTimeout(() => h.onEmotion?.('neutral'), left + 400); }
    else if (m.type === 'interrupted') { stopPlayback(); h.onTurn?.(); }
    else if (m.type === 'in' && m.text) h.onHeard(m.text);
    else if (m.type === 'out' && m.text) h.onSaid(m.text);
    else if (m.type === 'limit') h.onLimit(m.message ?? '', m.kind === 'session' ? 'session' : 'quota');
    else if (m.type === 'suggest' && m.kind === 'lessons') h.onSuggest?.('lessons');
    else if (m.type === 'emotion' && (m.value === 'angry' || m.value === 'laugh' || m.value === 'happy' || m.value === 'impressed' || m.value === 'disappointed')) h.onEmotion?.(m.value);
    else if (m.type === 'error') h.onError(m.message ?? L('Xato'), !ready);
  };
  ws.onerror = () => { if (!ended) h.onError(L('Aloqa yo‘q'), !ready); };
  ws.onclose = () => { cleanup(); if (!ended) { ended = true; h.onClosed(); } };
  // Mikrofon tayyorlanayotganda kelgan xabarlar (ready, salomlashish ovozi) — endi tartib bilan qayta ishlanadi
  const onMsg = ws.onmessage as (e: MessageEvent) => void;
  for (const e of early.splice(0)) onMsg(e);
  if (earlyClose && !ended) { cleanup(); ended = true; h.onClosed(); }

  function cleanup() {
    if (tail) { clearTimeout(tail); tail = null; }
    stopPlayback();
    try { src.disconnect(); node.disconnect(); mute.disconnect(); out.disconnect(); } catch { /* */ }
    node.port.onmessage = null;
    parkMic();
  }
  return {
    talk(on: boolean) {
      if (!ptt || !ready || ended) return;
      if (on) {
        if (tail) { clearTimeout(tail); tail = null; talking = true; return; } // qayta bosildi: o'sha navbat davom etadi
        if (talking) return;
        talking = true; started = false; voicedMs = 0; pre = []; preLen = 0; carry.length = 0;
        if (speaking) { stopPlayback(); begin(); } // ustozni ataylab to'xtatish: navbat darhol ochiladi (ustoz tinadi)
      } else {
        if (!talking) return;
        talking = false;
        tail = setTimeout(() => { tail = null; finishTalk(); }, TAIL_MS); // oxirgi so'z kesilmasin
      }
    },
    end() {
      if (ended) return;
      ended = true;
      try { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'end' })); ws.close(); } catch { /* */ }
      cleanup();
    },
  };
}
