// Gemini Live qo'ng'irog'i (ovozdan-ovozga): Sellzen ovozi 24 kHz PCM bo'laklarda keladi va darhol navbat bilan chalinadi.
// Bosib-gapirish rejimi (ptt, standart): mikrofon ovozi FAQAT tugma bosilib turganda 16 kHz PCM bo'lib serverga boradi; qo'yib yuborilganda
// ustoz javob beradi. Shovqin ustozni bo'lmaydi, gap o'rtasida eshitish rejimiga o'tilmaydi; ustozni faqat tugmani ataylab bosish to'xtatadi.
// Server ovozni ElevenLabs Scribe bilan matnga aylantiradi (asr=true): bunda bosilgan zahoti yozish boshlanadi, "ovoz bormi" degan qaror serverniki.
// Qo'lsiz rejim (ptt=false): uzluksiz oqim, gap tugashini va gapni bo'lishni Gemini o'zi aniqlaydi ("interrupted").
import { micContext, parkMic } from './voiceTurn';
import { MIN_VOICED_MS, QUIET_RMS, TAIL_MS, TAP_MS, tallyVoiced } from './ptt';
import { L } from '../i18n';

export interface LiveHandlers {
  /** capSec — server ruxsat bergan qo'ng'iroq uzunligi (soniya): ekrandagi "03:12 / 10:00" taymeri uchun */
  onReady(info: { capSec: number; ptt: boolean; asr: boolean }): void;
  onSpeaking(on: boolean): void;
  onLevel(v: number): void;
  onHeard(text: string): void;
  onSaid(text: string): void;
  /** resume — server: suhbatni qayta ulanib davom ettirish mumkin (aloqa uzildi, Gemini sessiyasi yopildi) */
  onError(message: string, beforeReady: boolean, resume?: boolean): void;
  /** kind: 'session' — qo'ng'iroq vaqti (10 daqiqa) tugadi; 'quota' — kunlik/oylik daqiqalar tugadi (obuna taklif qilinadi) */
  /** resume — 10 daqiqalik sessiya tugadi, lekin daqiqalar bor: mijoz jimgina qayta ulanadi va suhbat davom etadi */
  onLimit(message: string, kind: 'session' | 'quota', resume?: boolean): void;
  onClosed(): void;
  /** Ustoz javobi (yoki o'quvchi gapi) tugadi — ekrandagi matn keyingi navbatda yangilanadi */
  onTurn?(): void;
  /** Gap eshitilmadi (jim mikrofon / bo'sh matn): ustozga hech narsa yuborilmadi */
  onNoVoice?(): void;
  /** O'quvchi ilovada biror joyni ochishni buyurdi ("darsga o't"): ustoz javobini tugatgach mijoz o'tadi */
  onNavigate?(route: string): void;
  /** Ustoz hissiyoti (server ustoz matnidan aniqlaydi): ekrandagi effekt uchun */
  onEmotion?(e: 'angry' | 'laugh' | 'happy' | 'impressed' | 'disappointed' | 'serious' | 'sarcastic' | 'neutral'): void;
}
export interface LiveCall {
  end(): void;
  /** Bosib-gapirish: true — tugma bosildi (yozish boshlanadi), false — qo'yib yuborildi (ustoz javob beradi). Qo'lsiz rejimda ta'sir qilmaydi. */
  /** discard — juda qisqa (tasodifiy) tegish: yig'ilgan ovoz yuborilmaydi, ustoz javob bermaydi */
  talk(on: boolean, discard?: boolean): void;
}

export const liveSupported = (): boolean => typeof window !== 'undefined' && typeof WebSocket !== 'undefined' && typeof AudioWorkletNode !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

const WORKLET = `class SellzenMic extends AudioWorkletProcessor { process(inputs) { const ch = inputs[0] && inputs[0][0]; if (ch) this.port.postMessage(ch.slice(0)); return true; } } registerProcessor('sellzen-mic', SellzenMic);`;
const loaded = new WeakSet<AudioContext>();

/** Mikrofon chastotasi → 16 kHz: oynali sinc past chastota filtri (7.2 kHz dan yuqori tovushlar — aliasing — kesiladi) + kasr o'rinli tanlash.
 *  Kadrlar orasida holat saqlanadi (chastota/faza uzilmaydi). Avvalgi "o'rtacha olish" usuli yuqori chastotalarni buzib, tanishni yomonlashtirardi. */
export function makeResampler(fromRate: number, toRate = 16000): { process(input: Float32Array): Int16Array; reset(): void } {
  const ratio = fromRate / toRate;
  const fc = Math.min(0.5, (toRate * 0.45) / fromRate); // kesish chastotasi (kirish chastotasining ulushi)
  const half = Math.max(2, Math.ceil(ratio * 8));        // har tomonga tugun soni (~17 ta chiqish tuguni sinc'ga to'g'ri keladi)
  let buf: number[] = [], pos = 0;
  const reset = () => { buf = new Array(half).fill(0); pos = half; };
  reset();
  const weight = (x: number): number => {
    const a = Math.abs(x); if (a >= half) return 0;
    const sinc = x === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * x) / (Math.PI * x);
    return sinc * (0.5 + 0.5 * Math.cos((Math.PI * x) / half)); // Hann oynasi
  };
  const process = (input: Float32Array): Int16Array => {
    for (let i = 0; i < input.length; i++) buf.push(input[i]!);
    const out: number[] = [];
    while (pos + half < buf.length) {
      let s = 0, ws = 0;
      for (let k = Math.ceil(pos - half); k <= Math.floor(pos + half); k++) { const w = weight(k - pos); s += buf[k]! * w; ws += w; }
      const v = Math.max(-1, Math.min(1, ws ? s / ws : 0));
      out.push(v < 0 ? v * 0x8000 : v * 0x7fff);
      pos += ratio;
    }
    const drop = Math.max(0, Math.floor(pos - half)); // kerak bo'lmagan eski tugunlarni tashlaymiz
    if (drop) { buf = buf.slice(drop); pos -= drop; }
    return Int16Array.from(out);
  };
  return { process, reset };
}
// Ustoz ovozi uzilib eshitilardi (egasi, 2026-11-27): bo'laklar atigi 30 ms zaxira bilan chalinardi — internet bir lahza sekinlashsa
// (Telegram, mobil tarmoq) navbatdagi bo'lak kechikib, so'zlar orasida uzilish bo'lardi. Endi javob boshida kichik bufer (LEAD0),
// javob o'rtasida bo'lak kechiksa (uzilish) — bufer shu suhbat davomida kattalashadi (LEAD_MAX gacha).
export const LEAD0 = 0.2, LEAD_STEP = 0.1, LEAD_MAX = 0.6;
/** Keyingi bo'lak qachon chalinadi: navbatda ovoz bor — uning orqasidan; javob boshida — bufer bilan; javob o'rtasida ovoz tugab qolgan — uzilish (bufer oshadi). */
export function planChunk(now: number, nextAt: number, lead: number, inReply: boolean): { at: number; underrun: boolean; lead: number } {
  if (nextAt > now + 0.005) return { at: nextAt, underrun: false, lead };
  if (!inReply) return { at: now + lead, underrun: false, lead };
  const l = Math.min(LEAD_MAX, lead + LEAD_STEP);
  return { at: now + l, underrun: true, lead: l };
}
const rms = (f: Float32Array): number => { let s = 0; for (let i = 0; i < f.length; i++) s += f[i]! * f[i]!; return Math.sqrt(s / Math.max(1, f.length)); };

export async function startLive(o: { token: string; adult: boolean; level: string | null; lang: string; style?: number; ptt?: boolean; /** ustoz ovozi */ voice?: 'male' | 'female'; /** qayta ulanish: ustoz salomlashmaydi, suhbatni davom ettiradi */ cont?: boolean; /** o'quvchi konteksti: daraja, bugungi reja, zaif joylar (ustoz suhbatni tavsiya asosida olib boradi) */ ctx?: unknown }, h: LiveHandlers): Promise<LiveCall> {
  const ptt = o.ptt !== false;
  // Server (va Gemini) bilan ulanish mikrofon tayyorlanishi bilan PARALLEL boshlanadi — kutish vaqti qisqaradi.
  // Mikrofon tayyor bo'lguncha kelgan xabarlar navbatda turadi va keyin qayta ishlanadi.
  const proto0 = location.protocol === 'https:' ? 'wss' : 'ws';
  const q0 = new URLSearchParams({ adult: o.adult ? '1' : '0', level: o.level ?? '', lang: o.lang, style: String(o.style ?? (o.adult ? 2 : 0)), ...(ptt ? { ptt: '1' } : {}), ...(o.ctx ? { ctx: '1' } : {}), ...(o.voice === 'female' ? { voice: 'f' } : {}), ...(o.cont ? { cont: '1' } : {}) });
  const ws = new WebSocket(`${proto0}://${location.host}/api/ai/live?${q0}`, ['sellzen.v1', `tk.${o.token}`]);
  ws.binaryType = 'arraybuffer';
  ws.onopen = () => { if (o.ctx) { try { ws.send(JSON.stringify({ type: 'ctx', ctx: o.ctx })); } catch { /* kontekstsiz ham ishlaydi */ } } };
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
  // Og'iz harakati ustoz ovozining AYNAN eshitilayotgan qismiga bog'lanadi (analizator chiqishda). Avval daraja bo'lak KELGANDA o'rnatilardi:
  // bo'laklar oldindan tez kelgani uchun og'iz ovozdan oldin harakatlanar, oxirgi soniyalarda esa qotib qolardi.
  const meter = ctx.createAnalyser(); meter.fftSize = 512; out.connect(meter);
  const mbuf = new Float32Array(meter.fftSize);
  let meterTimer: ReturnType<typeof setInterval> | null = null, mouth = 0;
  const meterTick = () => {
    meter.getFloatTimeDomainData(mbuf);
    let s2 = 0; for (let i = 0; i < mbuf.length; i++) s2 += mbuf[i]! * mbuf[i]!;
    const v = Math.min(1, Math.sqrt(s2 / mbuf.length) * 6);
    mouth = v > mouth ? v : mouth * 0.6 + v * 0.4; // tez ochiladi, silliq yopiladi
    h.onLevel(mouth < 0.02 ? 0 : mouth);
  };

  // Token URL'da emas (proksi loglariga tushmasin) — subprotocol sarlavhasida (server/live.ts tokenFromProtocols)

  let ready = false, ended = false, speaking = false, nextAt = 0, floor = 0.01, asr = false;
  let lead = LEAD0, inReply = false, gaps = 0, gapsSent = 0;
  const playing = new Set<AudioBufferSourceNode>();
  const rs = makeResampler(ctx.sampleRate);
  let pendingPcm: Int16Array[] = [], pendingLen = 0;

  const setSpeaking = (on: boolean) => {
    if (speaking === on) return;
    speaking = on; h.onSpeaking(on);
    if (on && !meterTimer) { mouth = 0; meterTimer = setInterval(meterTick, 50); }
    if (!on && meterTimer) { clearInterval(meterTimer); meterTimer = null; mouth = 0; }
  };
  const stopPlayback = () => { for (const s of playing) { try { s.stop(); } catch { /* */ } } playing.clear(); nextAt = ctx.currentTime; inReply = false; setSpeaking(false); };

  const flush = (force = false) => {
    if (!pendingLen || (!force && pendingLen < 640)) return; // ~40 ms bo'laklar
    const buf = new Int16Array(pendingLen); let off = 0;
    for (const p of pendingPcm) { buf.set(p, off); off += p.length; }
    pendingPcm = []; pendingLen = 0;
    ws.send(buf.buffer);
  };
  const push = (pcm: Int16Array) => { pendingPcm.push(pcm); pendingLen += pcm.length; flush(); };

  // ---- Bosib-gapirish holati ----
  // asr (server tanishi): bosilgan zahoti yoziladi — hech qanday ovoz chegarasi yo'q (server bo'sh/qisqa navbatni o'zi rad etadi).
  // Gemini ovozni o'zi eshitsa: ovoz bor-yo'qligini past chegara bilan sezamiz (faqat butunlay jim mikrofon), 1 soniya bosib turgan bo'lsa — baribir yuboramiz.
  // hold — ustoz gapirayotganda bosildi: TAP_MS o'tguncha kutamiz (tasodifiy qisqa tegish ustozni to'xtatmaydi, faqat ovozi pasayadi)
  let hold: ReturnType<typeof setTimeout> | null = null;
  const cancelHold = () => { if (hold) { clearTimeout(hold); hold = null; } out.gain.value = 1; };
  let talking = false, tail: ReturnType<typeof setTimeout> | null = null, started = false, voicedMs = 0, heldMs = 0, pre: Int16Array[] = [], preLen = 0;
  const capturing = () => talking || tail !== null;
  // barge — o'quvchi ustozni ataylab to'xtatdi (TAP_MS bosib turdi): server javobni darhol to'xtatadi; muteIn — yo'ldagi eski javob bo'laklari chalinmaydi
  let muteIn = false;
  const sendActivity = (on: boolean, discard = false, barge = false) => { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(discard ? { type: 'activity', on, discard } : barge ? { type: 'activity', on, barge } : { type: 'activity', on })); };
  const begin = (barge = false) => { // navbat ochiladi, yig'ilgan boshlanish yuboriladi
    started = true; sendActivity(true, false, barge);
    for (const p of pre) push(p);
    pre = []; preLen = 0;
  };
  const finishTalk = () => {
    muteIn = false;
    if (started) { flush(true); sendActivity(false); }
    else h.onNoVoice?.(); // butunlay jim — bo'sh navbat yuborilmaydi
    started = false; pre = []; preLen = 0; voicedMs = 0; heldMs = 0; rs.reset();
  };

  node.port.onmessage = (e: MessageEvent<Float32Array>) => {
    if (!ready || ws.readyState !== WebSocket.OPEN) return;
    const f = e.data;
    const v = rms(f);
    if (ptt) {
      if (!capturing()) return; // tugma bosilmagan: ovoz serverga bormaydi
      h.onLevel(Math.min(1, v * 12));
      const pcm = rs.process(f);
      if (started) { push(pcm); return; }
      pre.push(pcm); preLen += pcm.length;
      if (hold) return; // ustozni to'xtatish tasdiqlanmagan — karnaydagi ustoz ovozi navbatni ochmasin
      while (preLen > 48_000 && pre.length > 1) preLen -= pre.shift()!.length; // ~3 soniyagacha
      const frameMs = (f.length / ctx.sampleRate) * 1000;
      voicedMs = tallyVoiced(voicedMs, v, QUIET_RMS, frameMs); heldMs += frameMs;
      if (voicedMs >= MIN_VOICED_MS || heldMs >= 1000) begin();
      return;
    }
    if (!speaking) { h.onLevel(Math.min(1, v * 12)); if (v < floor * 2.5) floor = floor * 0.97 + v * 0.03; }
    // Sellzen gapirayotganda: karnaydan qaytgan uning o'z ovozini yubormaymiz — faqat baland gap (gapni bo'lish) o'tadi
    const pass = !speaking || v > Math.max(0.06, floor * 8);
    push(rs.process(pass ? f : new Float32Array(f.length)));
  };

  ws.onmessage = (e: MessageEvent) => {
    if (typeof e.data !== 'string') {
      const i16 = new Int16Array(e.data as ArrayBuffer);
      if (!i16.length || muteIn) return;
      const f = new Float32Array(i16.length);
      for (let i = 0; i < i16.length; i++) f[i] = i16[i]! / 0x8000;
      const b = ctx.createBuffer(1, f.length, 24000);
      b.copyToChannel(f, 0);
      const s = ctx.createBufferSource(); s.buffer = b; s.connect(out);
      const p = planChunk(ctx.currentTime, nextAt, lead, inReply);
      if (p.underrun) gaps++;
      lead = p.lead; inReply = true;
      s.start(p.at); nextAt = p.at + b.duration; playing.add(s);
      setSpeaking(true);
      s.onended = () => { playing.delete(s); if (!playing.size && ctx.currentTime >= nextAt - 0.05) setSpeaking(false); };
      return;
    }
    let m: { type?: string; text?: string; message?: string; value?: string; kind?: string; capSec?: number; ptt?: boolean; asr?: boolean; route?: string; resume?: boolean };
    try { m = JSON.parse(e.data as string); } catch { return; }
    if (m.type === 'ready') { ready = true; asr = m.asr === true; h.onReady({ capSec: Number(m.capSec) || 0, ptt: m.ptt === true, asr }); }
    // Javob tugadi: hissiyot effekti ovoz chalinib bo'lgach o'chadi (keyingi javobda eski hissiyot qolmasin)
    else if (m.type === 'turn') { inReply = false; if (gaps !== gapsSent && ws.readyState === WebSocket.OPEN) { gapsSent = gaps; ws.send(JSON.stringify({ type: 'stats', gaps, leadMs: Math.round(lead * 1000) })); } h.onTurn?.(); const left = Math.max(0, (nextAt - ctx.currentTime) * 1000); setTimeout(() => h.onEmotion?.('neutral'), left + 400); }
    else if (m.type === 'interrupted') { muteIn = false; stopPlayback(); h.onTurn?.(); }
    else if (m.type === 'in' && m.text) h.onHeard(m.text);
    else if (m.type === 'out' && m.text) h.onSaid(m.text);
    else if (m.type === 'noVoice') h.onNoVoice?.();
    else if (m.type === 'navigate' && typeof m.route === 'string') h.onNavigate?.(m.route);
    else if (m.type === 'limit') h.onLimit(m.message ?? '', m.kind === 'session' ? 'session' : 'quota', m.resume === true);
    else if (m.type === 'emotion' && (m.value === 'angry' || m.value === 'laugh' || m.value === 'happy' || m.value === 'impressed' || m.value === 'disappointed' || m.value === 'serious' || m.value === 'sarcastic')) h.onEmotion?.(m.value);
    else if (m.type === 'error') h.onError(m.message ?? L('Xato'), !ready, m.resume === true);
  };
  ws.onerror = () => { if (!ended) h.onError(L('Aloqa yo‘q'), !ready); };
  ws.onclose = () => { cleanup(); if (!ended) { ended = true; h.onClosed(); } };
  // Mikrofon tayyorlanayotganda kelgan xabarlar (ready, salomlashish ovozi) — endi tartib bilan qayta ishlanadi
  const onMsg = ws.onmessage as (e: MessageEvent) => void;
  for (const e of early.splice(0)) onMsg(e);
  if (earlyClose && !ended) { cleanup(); ended = true; h.onClosed(); }

  function cleanup() {
    if (tail) { clearTimeout(tail); tail = null; }
    if (hold) { clearTimeout(hold); hold = null; }
    stopPlayback();
    try { src.disconnect(); node.disconnect(); mute.disconnect(); out.disconnect(); } catch { /* */ }
    node.port.onmessage = null;
    parkMic();
  }
  return {
    talk(on: boolean, discard = false) {
      if (!ptt || !ready || ended) return;
      if (!on && discard) { // tasodifiy qisqa tegish: navbat bekor — ovoz yuborilmaydi
        if (tail) { clearTimeout(tail); tail = null; }
        if (!talking) return;
        if (hold) cancelHold(); // ustoz to'xtatilmagan edi — gapini davom ettiradi
        talking = false; pendingPcm = []; pendingLen = 0;
        if (started) sendActivity(false, true);
        started = false; pre = []; preLen = 0; voicedMs = 0; heldMs = 0; rs.reset();
        return;
      }
      if (on) {
        if (tail) { clearTimeout(tail); tail = null; talking = true; return; } // qayta bosildi: o'sha navbat davom etadi
        if (talking) return;
        talking = true; started = false; voicedMs = 0; heldMs = 0; pre = []; preLen = 0; rs.reset();
        if (speaking) { // ustozni to'xtatish faqat TAP_MS bosib turilganda (tasodifiy tegish gapni kesmaydi); shu orada ovozi pasayadi
          out.gain.value = 0.35;
          hold = setTimeout(() => { hold = null; out.gain.value = 1; if (!talking || ended) return; stopPlayback(); muteIn = true; begin(true); }, TAP_MS);
          return;
        }
        if (asr) begin(); // tanish rejimi: navbat darhol ochiladi
      } else {
        if (!talking) return;
        talking = false;
        if (hold) { cancelHold(); pre = []; preLen = 0; return; } // TAP_MS dan qisqa — ustoz gapini davom ettiradi
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
