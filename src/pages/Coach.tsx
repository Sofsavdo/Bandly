// AI ustoz: ovozli suhbat (qo'ng'iroq kabi). O'zbekcha va inglizcha: ustoz o'quvchi qaysi tilda gapirsa, shu tilda javob beradi.
// Xarakter har safar tanlanmaydi — Profil → Sozlamalar'dagi tanlov ishlatiladi. Ovoz: serverdagi neyron ovoz, bo'lmasa brauzer ovozi.
import { Keyboard, Mic, PhoneOff, Send, Square, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { JoinForm } from '../components/JoinForm';
import type { PersonaId } from '../content/personas';
import { getAccount, type Account } from '../lib/account';
import { coachSay, coachStatus, newTurnId, type CoachReply, type CoachStatus } from '../lib/coach';
import { hasVoice, listenTurn, say, SpeechError, stopSpeaking, sttSupported, ttsSupported } from '../lib/speech';
import { playUz } from '../lib/tts';
import { personaLevel, useProfile } from '../lib/store';
import { addMistake } from '../lib/mistakes';
import { logErrors } from '../lib/adaptive/store';
import { isTaxonomyId, type TaxonomyId } from '../lib/adaptive/taxonomy';
import { L } from '../i18n';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
type Lang = 'en-US' | 'uz-UZ';
const PHASE_UZ: Record<Phase, string> = { idle: L('Navbat sizda'), listening: 'Tinglayapman…', thinking: L('O‘ylayapman…'), speaking: L('Gapiryapman…'), error: L('Qayta urinib ko‘ring') };
const OPENER = L('Salom! Men Bandly ustoziman. Keling, ingliz tilida gaplashamiz — qiynalsangiz, o‘zbekcha so‘rang. So, how are you today?');
const LANG_KEY = 'bandly.coach.lang';
const PERSONA_BY_LEVEL: PersonaId[] = ['friendly', 'comedy', 'savage', 'savage'];
const isUzbek = (t: string): boolean => /[‘’ʻ]|\b(men|siz|salom|qanday|keling|yaxshi|bu|uchun|bilan|emas|ham|nima|qiling|ayting|so‘z)\b/i.test(t);

interface Msg { role: 'learner' | 'coach'; text: string; reply?: CoachReply }

/** Ustoz gapini aytadi: avval neyron ovoz (o'zbek va ingliz tilini biladi), bo'lmasa brauzer ovozi. */
async function speakLine(text: string, signal: { cancelled: boolean }): Promise<void> {
  const parts = text.length <= 270 ? [text] : text.split(/(?<=[.!?])\s+/).reduce<string[]>((a, s) => { const l = a.length - 1; if (l >= 0 && (a[l]! + ' ' + s).length <= 270) a[l] += ' ' + s; else a.push(s.slice(0, 270)); return a; }, []);
  for (const part of parts) {
    if (signal.cancelled) return;
    if (await playUz(part, 'happy', signal)) continue;
    if (!ttsSupported()) return;
    const uz = isUzbek(part) && hasVoice('uz');
    await say(part, signal, uz ? 'uz-UZ' : 'en-GB', { pitch: 1, rate: 0.95, volume: 1 });
  }
}

export default function Coach() {
  const p = useProfile();
  const persona = p.adult ? PERSONA_BY_LEVEL[personaLevel(p)] ?? 'friendly' : personaLevel(p) === 1 ? 'comedy' : 'friendly';
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [acc, setAcc] = useState<Account | null>(() => getAccount());
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [err, setErr] = useState('');
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [interim, setInterim] = useState('');
  const [voiceOn, setVoiceOn] = useState(true);
  const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem(LANG_KEY) === 'uz-UZ' ? 'uz-UZ' : 'en-US'; } catch { return 'en-US'; } });
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const pending = useRef<{ text: string; turnId: string } | null>(null);
  const live = useRef(false);
  const logRef = useRef<HTMLDivElement | null>(null);
  const msgsRef = useRef<Msg[]>(msgs); msgsRef.current = msgs;
  const started = msgs.length > 0;
  const stt = typeof window !== 'undefined' && sttSupported();

  useEffect(() => { void coachStatus().then(setStatus); return () => { live.current = false; sig.current.cancelled = true; stopSpeaking(); }; }, []);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, interim]);
  const pickLang = (l: Lang) => { setLang(l); try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ } };

  /** Ustoz gapiradi, keyin (ovozli rejimda) avtomatik ravishda o'quvchini tinglaydi — qo'ng'iroqdagidek. */
  const tutorSays = async (line: string) => {
    if (voiceOn) { setPhase('speaking'); sig.current = { cancelled: false }; try { await speakLine(line, sig.current); } catch { /* ovoz bo'lmasa ham suhbat davom etadi */ } }
    if (!live.current) return;
    setPhase('idle');
    if (stt && voiceOn && !typing) void listen();
  };

  const start = () => {
    live.current = true;
    setMsgs([{ role: 'coach', text: OPENER }]);
    void tutorSays(OPENER);
  };

  const end = () => { live.current = false; sig.current.cancelled = true; endRef.current?.(); stopSpeaking(); setMsgs([]); setPhase('idle'); setErr(''); pending.current = null; };

  const send = async (learnerText: string, retry = false) => {
    const t = learnerText.trim();
    if (!t || phase === 'thinking') return;
    stopSpeaking(); setErr('');
    const turn = retry && pending.current ? pending.current : { text: t, turnId: newTurnId() };
    pending.current = turn;
    if (!retry) setMsgs((m) => [...m, { role: 'learner', text: t }]);
    setText(''); setPhase('thinking');
    try {
      const history = msgsRef.current.map((m) => ({ role: m.role, text: m.text }));
      const r = await coachSay({ persona, mode: 'practice', adult: p.adult, level: p.level, history, text: turn.text, turnId: turn.turnId });
      pending.current = null;
      if (r.correction) {
        const tax: TaxonomyId[] = r.correction.errorType && isTaxonomyId(r.correction.errorType) ? [r.correction.errorType] : [];
        logErrors(tax);
        try { addMistake('coach', { kind: 'fix', wrong: r.correction.wrong, right: r.correction.right, whyUz: r.correction.whyUz }, tax); } catch { /* juftlik yaroqsiz */ }
      }
      const line = [r.reply, r.question].filter(Boolean).join(' ');
      setMsgs((m) => [...m, { role: 'coach', text: line, reply: r }]);
      await tutorSays(line);
    } catch (e) {
      setErr((e as Error).message); setPhase('error');
    }
  };

  async function listen() {
    if (phase === 'listening') { endRef.current?.(); return; }
    stopSpeaking(); setErr(''); setInterim(''); setPhase('listening');
    try {
      const r = await listenTurn({ silenceMs: 1600, maxMs: 45_000, noSpeechMs: 9000, lang, onInterim: setInterim, signal: { cancelled: false }, endRef });
      setInterim('');
      if (!live.current) return;
      setPhase('idle');
      if (r.text.trim()) await send(r.text);
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? 'Mikrofonga ruxsat berilmagan.' : code === 'nomic' ? 'Mikrofon topilmadi.' : code === 'network' ? L('Internet aloqasi uzildi.') : L('Nutqni tanib bo‘lmadi.'));
      setPhase('error');
    }
  }

  if (!started) return (
    <div className="tutor">
      <section className="tutor-call idle-call">
        <div className={`tutor-orb ${phase}`} aria-hidden="true"><span>B</span></div>
        <h2>{L('AI ustoz')}</h2>
        <p>{L('Ovozli suhbat: inglizcha gapiring, qiynalsangiz — o‘zbekcha so‘rang.')}</p>
        {status && !status.coach && <p className="notice">{L('AI ustoz tez orada ochiladi.')}</p>}
        {!acc
          ? <JoinForm onJoined={setAcc} text={L('Suhbat uchun hisobingizga kiring.')} />
          : <button className="btn primary lg" disabled={!status?.coach} onClick={start}><Mic size={20} />  {L('Suhbatni boshlash')}</button>}
      </section>
    </div>
  );

  const last = [...msgs].reverse().find((m) => m.reply?.correction);
  return (
    <div className="tutor">
      <section className="tutor-call">
        <div className="tutor-top">
          <div className={`tutor-orb sm ${phase}`} aria-hidden="true"><span>B</span></div>
          <div className="grow"><b>{L('Bandly ustoz')}</b><small aria-live="polite">{PHASE_UZ[phase]}</small></div>
          <div className="seg" role="group" aria-label={L('Siz gapiradigan til')}>
            <button type="button" className={lang === 'en-US' ? 'on' : ''} onClick={() => pickLang('en-US')}>{L('EN')}</button>
            <button type="button" className={lang === 'uz-UZ' ? 'on' : ''} onClick={() => pickLang('uz-UZ')}>{L('UZ')}</button>
          </div>
        </div>
        <div className="tutor-log" ref={logRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`bubble2 ${m.role}`}>
              {m.text}
              {m.reply?.correction && <div className="fix"><s>{m.reply.correction.wrong}</s> → <b>{m.reply.correction.right}</b>{m.reply.correction.whyUz && <span> · {m.reply.correction.whyUz}</span>}</div>}
            </div>
          ))}
          {phase === 'listening' && <div className="bubble2 learner ghost">{interim || '…'}</div>}
          {phase === 'thinking' && <div className="bubble2 coach ghost">…</div>}
        </div>
        {err && <p className="tutor-err">{err} {pending.current ? <button className="btn sm" onClick={() => void send(pending.current!.text, true)}>{L('Qayta yuborish')}</button> : stt && <button className="btn sm" onClick={() => void listen()}>{L('Qayta tinglash')}</button>}</p>}
        {typing && (
          <form className="tutor-type" onSubmit={(e) => { e.preventDefault(); void send(text); }}>
            <input type="text" value={text} maxLength={800} placeholder={L('Inglizcha yoki o‘zbekcha yozing…')} onChange={(e) => setText(e.target.value)} autoFocus />
            <button className="btn primary" disabled={!text.trim() || phase === 'thinking'} aria-label={L('Yuborish')}><Send size={18} /></button>
          </form>
        )}
        <div className="tutor-ctrl">
          <button type="button" className="icon-btn" onClick={() => { setTyping((t) => !t); if (phase === 'listening') endRef.current?.(); }} aria-label={L('Yozib yuborish')} aria-pressed={typing}><Keyboard size={20} /></button>
          {stt && (
            <button type="button" className={`mic-big ${phase === 'listening' ? 'on' : ''}`} disabled={phase === 'thinking'}
              onClick={() => { if (phase === 'speaking') { sig.current.cancelled = true; stopSpeaking(); } void listen(); }}
              aria-label={phase === 'listening' ? L('Tugatdim') : L('Gapirish')}>
              {phase === 'listening' ? <Square size={28} /> : <Mic size={30} />}
            </button>
          )}
          <button type="button" className="icon-btn" onClick={() => { setVoiceOn((v) => !v); sig.current.cancelled = true; stopSpeaking(); }} aria-label={voiceOn ? L('Ovozni o‘chirish') : L('Ovozni yoqish')}>{voiceOn ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
          <button type="button" className="icon-btn end" onClick={end} aria-label={L('Suhbatni tugatish')}><PhoneOff size={20} /></button>
        </div>
        {last?.reply?.correction && <span className="sr-only">{L('Oxirgi tuzatish:')} {last.reply.correction.right}</span>}
      </section>
    </div>
  );
}
