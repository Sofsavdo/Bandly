// AI ustoz — faqat ovozli suhbat (qo'ng'iroq kabi), bitta personaj: Bandi. Ekranda matn yo'q: ustoz ham, o'quvchi ham faqat gapiradi.
// Nutq serverda (ElevenLabs Scribe) aniq tanadi: tilni o'zi aniqlaydi, gap tugaganini sukutdan sezadi, ustoz gapirayotganda
// o'quvchi gapirsa — ustoz to'xtaydi. Xatolar "Xatolarim"ga jimgina yoziladi. Server tanishi bo'lmasa — brauzer tanishi.
import { Mic, PhoneOff, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { JoinForm } from '../components/JoinForm';
import { getAccount, type Account } from '../lib/account';
import { coachSay, coachStatus, newTurnId, type CoachStatus } from '../lib/coach';
import { listenTurn, SpeechError, sayWithVoice, stopSpeaking, sttSupported, ttsSupported, tutorVoice } from '../lib/speech';
import { lastTtsStatus, playPrepared, prepareUz } from '../lib/tts';
import { parkMic, recordTurn, recorderSupported, SttError, transcribeTurn, watchBargeIn } from '../lib/voiceTurn';
import { useProfile } from '../lib/store';
import { liveSupported, startLive, type LiveCall } from '../lib/liveCall';
import { getLang } from '../i18n';
import { BandiAvatar } from '../components/BandiAvatar';
import type { CoachEmotion } from '../content/personas';
import { addMistake } from '../lib/mistakes';
import { logErrors } from '../lib/adaptive/store';
import { isTaxonomyId, type TaxonomyId } from '../lib/adaptive/taxonomy';
import { L } from '../i18n';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
const PHASE_UZ: Record<Phase, string> = { idle: L('Gapiring — tinglayman'), listening: L('Tinglayapman…'), thinking: L('O‘ylayapman…'), speaking: L('Bandi gapiryapti'), error: L('Qayta urinib ko‘ring') };
// Suhbat boshlanishi har safar boshqacha (bir xil gap bilan boshlamaslik uchun)
const OPENERS = [
  L('Salom! Men Bandi. Inglizcha gaplashamiz — qiynalsang, o‘zbekcha so‘ra. So, how was your day?'),
  L('Oh, look who’s here! Okay, English only... mostly. What did you do today?'),
  L('Salom, chempion! Quick question: tea or coffee, and why? Go!'),
  L('Hey hey! I’m Bandi. Gapir, men tinglayman. What’s the most interesting thing you did this week?'),
  L('Hello there! Let’s see if your English is as good as you think. Tell me about yourself in three sentences.'),
  L('Salom! Bugun sen gapirasan, men kulaman. Tell me, what annoys you the most in your city?'),
];
// AI javob bermasa (provayder band yoki aloqa yo'q) — Bandi buni ovoz bilan aytadi, jim turib qolmaydi
const SORRY = [
  L('Uff, aloqam biroz qotib qoldi. Yana bir marta ayting-chi?'),
  L('Kechirasiz, miyam bir soniya o‘chib qoldi. Qaytadan ayting!'),
  L('Hmm, eshitolmay qoldim. Yana bir bor, iltimos.'),
];
const mmss = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

interface Turn { role: 'learner' | 'coach'; text: string }

/** Javobni gaplarga bo'ladi (birinchi bo'lak qisqa — Bandi tezroq gapira boshlasin). */
export function chunkReply(text: string): string[] {
  const sents = text.split(/(?<=[.!?…])\s+/).map((x) => x.trim()).filter(Boolean);
  const out: string[] = [];
  for (const s of sents) { const l = out.length - 1; if (l >= 1 && (out[l]! + ' ' + s).length <= 220) out[l] += ' ' + s; else out.push(s.slice(0, 270)); }
  return out.length ? out : [text.slice(0, 270)];
}

/** Ustoz gapini aytadi: neyron ovoz gapma-gap — birinchi gap tayyor bo'lishi bilan chalinadi, keyingisi shu payt tayyorlanadi.
 *  Neyron ovoz bo'lmasa — brauzer ovozi. */
/** Bitta qo'ng'iroqda bitta ovoz: neyron ovoz ishlasa — faqat u (bir bo'lak xato bo'lsa, qayta urinadi, boshqa ovozga o'tmaydi);
 *  kunlik limit tugasa — butun qo'ng'iroq bitta doimiy brauzer (erkak) ovoziga o'tadi. Ayol/erkak ovozi aralashmaydi. */
type VoiceMode = 'neural' | 'browser' | null;
let callVoice: VoiceMode = null;
export const resetCallVoice = (): void => { callVoice = null; };
async function speakLine(text: string, signal: { cancelled: boolean }, emotion: 'happy' | 'angry' | 'laugh' = 'happy'): Promise<'ok' | 'limit'> {
  const parts = chunkReply(text);
  let limited = false;
  if (callVoice !== 'browser') {
    let next: Promise<string | null> = prepareUz(parts[0]!, emotion, 'coach', 0);
    for (let i = 0; i < parts.length; i++) {
      if (signal.cancelled) return 'ok';
      let url = await next;
      if (!url && i === 0 && callVoice === null) { limited = lastTtsStatus === 429; callVoice = 'browser'; break; } // neyron ovoz hali ishlamagan (limit yoki o'chiq) — butun qo'ng'iroq bitta brauzer ovozida
      if (!url && !signal.cancelled) url = await prepareUz(parts[i]!, emotion, 'coach', i); // bir marta qayta
      if (i + 1 < parts.length) next = prepareUz(parts[i + 1]!, emotion, 'coach', i + 1);
      if (url) { callVoice = 'neural'; if (!signal.cancelled) await playPrepared(url, signal); else URL.revokeObjectURL(url); }
      // url yo'q (tarmoq xatosi) — bu bo'lak o'tkazib yuboriladi, boshqa ovoz bilan aytilmaydi
    }
    if (callVoice !== 'browser') return 'ok';
  }
  if (lastTtsStatus === 429) limited = true;
  if (!browserVoiceUsable()) return limited ? 'limit' : 'ok';
  const voice = tutorVoice();
  for (const part of parts) { if (signal.cancelled) break; await sayWithVoice(part, signal, voice); }
  return limited ? 'limit' : 'ok';
}
/** Brauzer ovozi haqiqatan bormi (Telegram ichidagi Android brauzerida ko'pincha ovoz yo'q — jim qoladi). */
const browserVoiceUsable = (): boolean => ttsSupported() && window.speechSynthesis.getVoices().length > 0;

export default function Coach() {
  const p = useProfile();
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [acc, setAcc] = useState<Account | null>(() => getAccount());
  const [live, setLive] = useState(false);
  const [phase, setPhaseState] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');
  const setPhase = (ph: Phase) => { phaseRef.current = ph; setPhaseState(ph); };
  const [err, setErr] = useState('');
  const [limitHit, setLimitHit] = useState(false);
  const [lvl, setLvl] = useState(0);
  const [emotion, setEmotionState] = useState<CoachEmotion>('neutral');
  const emoRef = useRef<CoachEmotion>('neutral');
  const setEmotion = (e: CoachEmotion) => { emoRef.current = e; setEmotionState(e); };
  const [secs, setSecs] = useState(0);
  const [serverDown, setServerDown] = useState(false);
  const [minutes, setMinutes] = useState<{ subscribed: boolean; left: number; total: number } | null>(null);
  const turns = useRef<Turn[]>([]);
  const liveRef = useRef(false);
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const listenSig = useRef({ cancelled: false });
  const pending = useRef<{ text: string; turnId: string } | null>(null);
  const server = !!status?.stt && recorderSupported() && !serverDown;
  const liveRefCall = useRef<LiveCall | null>(null);
  const [liveFailed, setLiveFailed] = useState(false);
  const useLive = !!status?.live && liveSupported() && !liveFailed;
  const canListen = server || (typeof window !== 'undefined' && sttSupported());

  const loadMinutes = () => { const a = getAccount(); if (a) void fetch('/api/coach/minutes', { headers: { 'x-token': a.token } }).then((r) => (r.ok ? r.json() : null)).then(setMinutes).catch(() => undefined); };
  useEffect(() => { loadMinutes(); }, [acc]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void coachStatus().then(setStatus); return () => { liveRefCall.current?.end(); liveRef.current = false; sig.current.cancelled = true; listenSig.current.cancelled = true; endRef.current?.(); stopSpeaking(); parkMic(); }; }, []);
  useEffect(() => { if (!live) return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, [live]);

  /** Ustoz gapiradi, keyin o'quvchini o'zi tinglaydi. O'quvchi gapni bo'lsa — ustoz to'xtaydi. */
  const tutorSays = async (line: string) => {
    setPhase('speaking');
    const s = { cancelled: false }; sig.current = s;
    const stopWatch = server ? await watchBargeIn(() => { s.cancelled = true; stopSpeaking(); }) : () => undefined;
    try { const res = await speakLine(line, s, emoRef.current === 'laugh' ? 'laugh' : emoRef.current === 'angry' ? 'angry' : 'happy'); if (res === 'limit') { setLimitHit(true); if (!browserVoiceUsable()) { end(); return; } } } catch { /* ovoz bo'lmasa ham suhbat davom etadi */ } finally { stopWatch(); }
    if (!liveRef.current) return;
    setPhase('idle');
    if (canListen) void listen();
  };

  /** Gemini Live: ovozdan-ovozga. Ishga tushmasa (model yo'q, tarmoq) — eski usulga (tanish → AI → ovoz) o'tadi. */
  const startLiveCall = async (): Promise<boolean> => {
    const a = getAccount();
    if (!a) return false;
    setPhase('thinking');
    return new Promise<boolean>((resolve) => {
      let settled = false;
      const done = (ok: boolean) => { if (!settled) { settled = true; resolve(ok); } };
      void startLive({ token: a.token, adult: p.adult, level: p.level, lang: getLang() }, {
        onReady: () => { setPhase('listening'); done(true); },
        onSpeaking: (on) => setPhase(on ? 'speaking' : 'listening'),
        onLevel: (v) => setLvl(v),
        onHeard: () => undefined,
        onSaid: (t) => { if (/\bha(ha)+\b|lol/i.test(t)) setEmotion('laugh'); else if (/damn|hell|shit|what the|ahmoq|tentak|eshak/i.test(t)) setEmotion('angry'); },
        onError: (msg, beforeReady) => { if (beforeReady) { liveRefCall.current?.end(); liveRefCall.current = null; setLiveFailed(true); done(false); } else { setErr(msg); end(); } },
        onLimit: () => { setLimitHit(true); end(); },
        onClosed: () => { if (settled && liveRef.current) end(); done(false); },
      }).then((c) => { liveRefCall.current = c; }).catch(() => { setLiveFailed(true); done(false); });
    });
  };

  const start = () => {
    liveRef.current = true; setLive(true); setSecs(0); setErr(''); setEmotion('happy'); resetCallVoice();
    if (useLive) { void startLiveCall().then((ok) => { if (!ok && liveRef.current) startClassic(); }); return; }
    startClassic();
  };
  const startClassic = () => {
    setPhase('idle');
    const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)]!;
    turns.current = [{ role: 'coach', text: opener }];
    void tutorSays(opener);
  };

  const end = () => {
    liveRefCall.current?.end(); liveRefCall.current = null;
    liveRef.current = false; setLive(false);
    sig.current.cancelled = true; listenSig.current.cancelled = true; endRef.current?.();
    stopSpeaking(); parkMic(); setPhase('idle'); setErr(''); setLvl(0); pending.current = null; turns.current = [];
    loadMinutes();
  };

  const send = async (learnerText: string, retry = false) => {
    const t = learnerText.trim();
    if (!t || phaseRef.current === 'thinking') return;
    setErr('');
    const turn = retry && pending.current ? pending.current : { text: t, turnId: newTurnId() };
    pending.current = turn;
    if (!retry) turns.current = [...turns.current, { role: 'learner', text: t }];
    setPhase('thinking');
    try {
      const history = turns.current.slice(0, -1);
      const r = await coachSay({ persona: 'bandi', mode: 'practice', adult: p.adult, level: p.level, history, text: turn.text, turnId: turn.turnId });
      pending.current = null;
      if (r.correction) {
        const tax: TaxonomyId[] = r.correction.errorType && isTaxonomyId(r.correction.errorType) ? [r.correction.errorType] : [];
        logErrors(tax);
        try { addMistake('coach', { kind: 'fix', wrong: r.correction.wrong, right: r.correction.right, whyUz: r.correction.whyUz }, tax); } catch { /* juftlik yaroqsiz */ }
      }
      const line = [r.reply, r.question].filter(Boolean).join(' ');
      setEmotion(r.emotion);
      turns.current = [...turns.current, { role: 'coach', text: line }];
      if (turns.current.length % 8 === 0) loadMinutes();
      if (liveRef.current) await tutorSays(line);
    } catch (e) {
      // Bandi jim qolmaydi: qisqa ovozli uzr aytadi va yana tinglaydi (o'quvchi gapini qayta aytadi)
      setErr((e as Error).message); pending.current = null;
      turns.current = turns.current.slice(0, -1);
      if (liveRef.current) { const line = SORRY[Math.floor(Math.random() * SORRY.length)]!; setEmotion('disappointed'); await tutorSays(line); } else setPhase('error');
    }
  };

  async function listen() {
    if (phaseRef.current === 'listening') { endRef.current?.(); return; }
    stopSpeaking(); setErr(''); setPhase('listening');
    const ls = { cancelled: false }; listenSig.current = ls;
    try {
      let heard = '';
      if (server) {
        const r = await recordTurn({ silenceMs: 1000, maxMs: 60_000, noSpeechMs: 12_000, onLevel: setLvl, endRef, signal: ls });
        setLvl(0);
        if (!liveRef.current || ls.cancelled) return;
        if (!r.blob) { setPhase('idle'); return; } // gapirilmadi — tugmani bosib qayta gapiradi
        setPhase('thinking');
        heard = (await transcribeTurn(r)).text;
        if (!heard) { setPhase('idle'); if (liveRef.current) void listen(); return; } // aniq so'z chiqmadi — jim qolmay qayta tinglaydi
      } else {
        heard = (await listenTurn({ silenceMs: 1600, maxMs: 45_000, noSpeechMs: 9000, lang: 'en-US', onInterim: () => undefined, signal: ls, endRef })).text.trim();
      }
      if (!liveRef.current) return;
      setPhase('idle');
      if (heard) await send(heard);
    } catch (e) {
      setLvl(0);
      if (e instanceof SttError) {
        if (e.status === 429 || e.status === 503) setServerDown(true); // limit tugadi — bu qo'ng'iroqda brauzer tanishiga o'tamiz
        setErr(e.message); setPhase('error'); return;
      }
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? L('Mikrofonga ruxsat berilmagan.') : code === 'nomic' ? L('Mikrofon topilmadi.') : code === 'network' ? L('Internet aloqasi uzildi.') : L('Nutqni tanib bo‘lmadi.'));
      setPhase('error');
    }
  }

  /** Katta tugma: ustoz gapirayotgan bo'lsa — to'xtatadi; tinglayotgan bo'lsa — "tugatdim"; xato bo'lsa — qayta yuboradi; aks holda tinglaydi. */
  const mic = () => {
    if (phase === 'speaking') { sig.current.cancelled = true; stopSpeaking(); return; }
    if (phase === 'error' && pending.current) { void send(pending.current.text, true); return; }
    void listen();
  };

  const orb = <div className={`bandi-wrap ${phase}`} aria-hidden="true"><BandiAvatar phase={phase} emotion={phase === 'speaking' ? emotion : 'neutral'} level={lvl} size={live ? 220 : 170} /></div>;

  if (!live) return (
    <div className="tutor">
      <section className="tutor-call voice idle-call">
        {orb}
        <h2>{L('Bandi')}</h2>
        <p>{L('Faqat ovozli suhbat: gapiring, Bandi tinglaydi, kuladi, kesatadi va xatoingizni aytadi.')}</p>
        {minutes?.subscribed && <span className="pill">{L('{0} daqiqa qoldi', [minutes.left])}</span>}
        {limitHit && <p className="notice voice-limit">{L('Bugungi bepul ovozli javoblar tugadi — Bandi ovozi ertaga qaytadi.')} <a href="#/pricing">{L('Obuna: oyiga 60 daqiqa')}</a></p>}
        {status && !status.coach && <p className="notice">{L('AI ustoz tez orada ochiladi.')}</p>}
        {!acc
          ? <JoinForm onJoined={setAcc} text={L('Suhbat uchun hisobingizga kiring.')} />
          : <button className="btn primary lg" disabled={!status?.coach} onClick={start}><Mic size={20} />  {L('Qo‘ng‘iroqni boshlash')}</button>}
      </section>
    </div>
  );

  return (
    <div className="tutor">
      <section className="tutor-call voice">
        <div className="voice-top">
          <b>{L('Bandi')}</b>
          <span className="muted">{mmss(secs)}{minutes?.subscribed ? ` · ${L('{0} daqiqa qoldi', [minutes.left])}` : ''}</span>
        </div>
        <div className="voice-stage">
          {orb}
          <p className="voice-status" aria-live="polite">{PHASE_UZ[phase]}</p>
          {err && <p className="tutor-err">{err}</p>}
          {limitHit && <p className="notice voice-limit">{L('Bugungi bepul ovozli javoblar tugadi — Bandi ovozi ertaga qaytadi.')} <a href="#/pricing">{L('Obuna: oyiga 60 daqiqa')}</a></p>}
        </div>
        <div className="tutor-ctrl">
          {canListen && !liveRefCall.current && (
            <button type="button" className={`mic-big ${phase === 'listening' ? 'on' : ''}`} disabled={phase === 'thinking'} onClick={mic}
              aria-label={phase === 'listening' ? L('Tugatdim') : phase === 'speaking' ? L('Gapni bo‘lish') : L('Gapirish')}>
              {phase === 'listening' ? <Square size={28} /> : <Mic size={30} />}
            </button>
          )}
          <button type="button" className="icon-btn end" onClick={end} aria-label={L('Suhbatni tugatish')}><PhoneOff size={22} /></button>
        </div>
      </section>
    </div>
  );
}
