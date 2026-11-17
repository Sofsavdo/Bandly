// AI ustoz — faqat ovozli suhbat (qo'ng'iroq kabi), bitta personaj: Bandi. Ekranda matn yo'q: ustoz ham, o'quvchi ham faqat gapiradi.
// Nutq serverda (ElevenLabs Scribe) aniq tanadi: tilni o'zi aniqlaydi, gap tugaganini sukutdan sezadi, ustoz gapirayotganda
// o'quvchi gapirsa — ustoz to'xtaydi. Xatolar "Xatolarim"ga jimgina yoziladi. Server tanishi bo'lmasa — brauzer tanishi.
import { Mic, PhoneOff, Square } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { JoinForm } from '../components/JoinForm';
import { getAccount, type Account } from '../lib/account';
import { coachSay, coachStatus, newTurnId, type CoachStatus } from '../lib/coach';
import { hasVoice, listenTurn, say, SpeechError, stopSpeaking, sttSupported, ttsSupported } from '../lib/speech';
import { playUz } from '../lib/tts';
import { recordTurn, recorderSupported, releaseMic, SttError, transcribeTurn, watchBargeIn } from '../lib/voiceTurn';
import { useProfile } from '../lib/store';
import { addMistake } from '../lib/mistakes';
import { logErrors } from '../lib/adaptive/store';
import { isTaxonomyId, type TaxonomyId } from '../lib/adaptive/taxonomy';
import { L, getLang } from '../i18n';

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
const NATIVE_STT: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', kk: 'kk-KZ', ky: 'ky-KG', tg: 'tg-TJ', en: 'uz-UZ' };
const nativeStt = (): string => NATIVE_STT[getLang()] ?? 'uz-UZ';
const isNative = (t: string): boolean => /[А-Яа-яЁёҚқҒғЎўҲҳӮӯҶҷӢӣ]/.test(t) || /[‘’ʻ]|\b(men|sen|siz|salom|qanday|keling|yaxshi|bu|uchun|bilan|emas|ham|nima|gapir|ayt)\b/i.test(t);
const mmss = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

interface Turn { role: 'learner' | 'coach'; text: string }

/** Ustoz gapini aytadi: avval neyron ovoz (o'zbek va ingliz tilini biladi), bo'lmasa brauzer ovozi. */
async function speakLine(text: string, signal: { cancelled: boolean }): Promise<void> {
  const parts = text.length <= 270 ? [text] : text.split(/(?<=[.!?])\s+/).reduce<string[]>((a, s) => { const l = a.length - 1; if (l >= 0 && (a[l]! + ' ' + s).length <= 270) a[l] += ' ' + s; else a.push(s.slice(0, 270)); return a; }, []);
  for (const part of parts) {
    if (signal.cancelled) return;
    if (await playUz(part, 'happy', signal, 'coach')) continue;
    if (!ttsSupported()) return;
    const nat = isNative(part) ? nativeStt() : null;
    const ok = nat && hasVoice(nat.slice(0, 2));
    await say(part, signal, ok ? nat! : 'en-GB', { pitch: 1, rate: 0.98, volume: 1 });
  }
}

export default function Coach() {
  const p = useProfile();
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [acc, setAcc] = useState<Account | null>(() => getAccount());
  const [live, setLive] = useState(false);
  const [phase, setPhaseState] = useState<Phase>('idle');
  const phaseRef = useRef<Phase>('idle');
  const setPhase = (ph: Phase) => { phaseRef.current = ph; setPhaseState(ph); };
  const [err, setErr] = useState('');
  const [lvl, setLvl] = useState(0);
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
  const canListen = server || (typeof window !== 'undefined' && sttSupported());

  const loadMinutes = () => { const a = getAccount(); if (a) void fetch('/api/coach/minutes', { headers: { 'x-token': a.token } }).then((r) => (r.ok ? r.json() : null)).then(setMinutes).catch(() => undefined); };
  useEffect(() => { loadMinutes(); }, [acc]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void coachStatus().then(setStatus); return () => { liveRef.current = false; sig.current.cancelled = true; listenSig.current.cancelled = true; endRef.current?.(); stopSpeaking(); releaseMic(); }; }, []);
  useEffect(() => { if (!live) return; const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, [live]);

  /** Ustoz gapiradi, keyin o'quvchini o'zi tinglaydi. O'quvchi gapni bo'lsa — ustoz to'xtaydi. */
  const tutorSays = async (line: string) => {
    setPhase('speaking');
    const s = { cancelled: false }; sig.current = s;
    const stopWatch = server ? await watchBargeIn(() => { s.cancelled = true; stopSpeaking(); }) : () => undefined;
    try { await speakLine(line, s); } catch { /* ovoz bo'lmasa ham suhbat davom etadi */ } finally { stopWatch(); }
    if (!liveRef.current) return;
    setPhase('idle');
    if (canListen) void listen();
  };

  const start = () => {
    liveRef.current = true; setLive(true); setSecs(0); setErr('');
    const opener = OPENERS[Math.floor(Math.random() * OPENERS.length)]!;
    turns.current = [{ role: 'coach', text: opener }];
    void tutorSays(opener);
  };

  const end = () => {
    liveRef.current = false; setLive(false);
    sig.current.cancelled = true; listenSig.current.cancelled = true; endRef.current?.();
    stopSpeaking(); releaseMic(); setPhase('idle'); setErr(''); setLvl(0); pending.current = null; turns.current = [];
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
      turns.current = [...turns.current, { role: 'coach', text: line }];
      if (turns.current.length % 8 === 0) loadMinutes();
      if (liveRef.current) await tutorSays(line);
    } catch (e) {
      setErr((e as Error).message); setPhase('error');
    }
  };

  async function listen() {
    if (phaseRef.current === 'listening') { endRef.current?.(); return; }
    stopSpeaking(); setErr(''); setPhase('listening');
    const ls = { cancelled: false }; listenSig.current = ls;
    try {
      let heard = '';
      if (server) {
        const r = await recordTurn({ silenceMs: 1300, maxMs: 60_000, noSpeechMs: 12_000, onLevel: setLvl, endRef, signal: ls });
        setLvl(0);
        if (!liveRef.current || ls.cancelled) return;
        if (!r.blob) { setPhase('idle'); return; } // gapirilmadi — tugmani bosib qayta gapiradi
        setPhase('thinking');
        heard = (await transcribeTurn(r)).text;
        if (!heard) { setPhase('idle'); setErr(L('Ovoz eshitilmadi. Qayta gapiring.')); return; }
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

  const orb = <div className={`tutor-orb xl ${phase}`} style={{ '--lvl': lvl } as CSSProperties} aria-hidden="true"><span>B</span></div>;

  if (!live) return (
    <div className="tutor">
      <section className="tutor-call voice idle-call">
        {orb}
        <h2>{L('Bandi')}</h2>
        <p>{L('Faqat ovozli suhbat: gapiring, Bandi tinglaydi, kuladi, kesatadi va xatoingizni aytadi.')}</p>
        {minutes?.subscribed && <span className="pill">{L('{0} daqiqa qoldi', [minutes.left])}</span>}
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
        </div>
        <div className="tutor-ctrl">
          {canListen && (
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
