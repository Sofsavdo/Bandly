// Gemini Live qo'ng'irog'i (ovozdan-ovozga): mikrofon ovozi uzluksiz 16 kHz PCM bo'lib serverga boradi, Sellzen AI ovozi 24 kHz PCM
// bo'laklarda keladi va darhol navbat bilan chalinadi. Gap tugashini va gapni bo'lishni Gemini o'zi aniqlaydi ("interrupted").
import { micContext, parkMic } from './voiceTurn';
import { L } from '../i18n';

export interface LiveHandlers {
  onReady(): void;
  onSpeaking(on: boolean): void;
  onLevel(v: number): void;
  onHeard(text: string): void;
  onSaid(text: string): void;
  onError(message: string, beforeReady: boolean): void;
  onLimit(message: string): void;
  onClosed(): void;
}
export interface LiveCall { end(): void }

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

export async function startLive(o: { token: string; adult: boolean; level: string | null; lang: string }, h: LiveHandlers): Promise<LiveCall> {
  const { stream, ctx } = await micContext();
  if (ctx.state === 'suspended') await ctx.resume().catch(() => undefined);
  if (!loaded.has(ctx)) { await ctx.audioWorklet.addModule(URL.createObjectURL(new Blob([WORKLET], { type: 'application/javascript' }))); loaded.add(ctx); }
  const src = ctx.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(ctx, 'sellzen-mic');
  const mute = ctx.createGain(); mute.gain.value = 0;
  src.connect(node); node.connect(mute); mute.connect(ctx.destination);
  const out = ctx.createGain(); out.connect(ctx.destination);

  const proto = location.protocol === 'https:' ? 'wss' : 'ws';
  // Token URL'da emas (proksi loglariga tushmasin) — subprotocol sarlavhasida (server/live.ts tokenFromProtocols)
  const q = new URLSearchParams({ adult: o.adult ? '1' : '0', level: o.level ?? '', lang: o.lang });
  const ws = new WebSocket(`${proto}://${location.host}/api/ai/live?${q}`, ['sellzen.v1', `tk.${o.token}`]);
  ws.binaryType = 'arraybuffer';

  let ready = false, ended = false, speaking = false, nextAt = 0, floor = 0.01;
  const playing = new Set<AudioBufferSourceNode>();
  const carry: number[] = [];
  let pendingPcm: Int16Array[] = [], pendingLen = 0;

  const setSpeaking = (on: boolean) => { if (speaking !== on) { speaking = on; h.onSpeaking(on); } };
  const stopPlayback = () => { for (const s of playing) { try { s.stop(); } catch { /* */ } } playing.clear(); nextAt = ctx.currentTime; setSpeaking(false); };

  node.port.onmessage = (e: MessageEvent<Float32Array>) => {
    if (!ready || ws.readyState !== WebSocket.OPEN) return;
    const f = e.data;
    const v = rms(f);
    if (!speaking) { h.onLevel(Math.min(1, v * 12)); if (v < floor * 2.5) floor = floor * 0.97 + v * 0.03; }
    // Sellzen AI gapirayotganda: karnaydan qaytgan uning o'z ovozini yubormaymiz — faqat baland gap (gapni bo'lish) o'tadi
    const pass = !speaking || v > Math.max(0.06, floor * 8);
    const pcm = downsample(pass ? f : new Float32Array(f.length), ctx.sampleRate, carry);
    pendingPcm.push(pcm); pendingLen += pcm.length;
    if (pendingLen >= 640) { // ~40 ms bo'laklar
      const buf = new Int16Array(pendingLen); let off = 0;
      for (const p of pendingPcm) { buf.set(p, off); off += p.length; }
      pendingPcm = []; pendingLen = 0;
      ws.send(buf.buffer);
    }
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
    let m: { type?: string; text?: string; message?: string };
    try { m = JSON.parse(e.data as string); } catch { return; }
    if (m.type === 'ready') { ready = true; h.onReady(); }
    else if (m.type === 'interrupted') stopPlayback();
    else if (m.type === 'in' && m.text) h.onHeard(m.text);
    else if (m.type === 'out' && m.text) h.onSaid(m.text);
    else if (m.type === 'limit') h.onLimit(m.message ?? '');
    else if (m.type === 'error') h.onError(m.message ?? L('Xato'), !ready);
  };
  ws.onerror = () => { if (!ended) h.onError(L('Aloqa yo‘q'), !ready); };
  ws.onclose = () => { cleanup(); if (!ended) { ended = true; h.onClosed(); } };

  function cleanup() {
    stopPlayback();
    try { src.disconnect(); node.disconnect(); mute.disconnect(); out.disconnect(); } catch { /* */ }
    node.port.onmessage = null;
    parkMic();
  }
  return {
    end() {
      if (ended) return;
      ended = true;
      try { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'end' })); ws.close(); } catch { /* */ }
      cleanup();
    },
  };
}
