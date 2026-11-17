// AI ustoz: ovozli suhbat (qo'ng'iroq kabi). O'zbekcha va inglizcha: ustoz o'quvchi qaysi tilda gapirsa, shu tilda javob beradi,
// inglizcha xatoni esa o'quvchining tilida tushuntiradi. Nutq serverda (ElevenLabs Scribe) aniq tanadi: tilni o'zi aniqlaydi,
// gap tugaganini sukutdan sezadi, ustoz gapirayotganda o'quvchi gapirsa — ustoz to'xtaydi. Server tanishi bo'lmasa — brauzer tanishi.
// Xarakter (mehribon / qattiqqo'l / shafqatsiz 18+) bir marta tanlanadi va eslab qolinadi.
import { Keyboard, Mic, PhoneOff, Send, Square, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { JoinForm } from '../components/JoinForm';
import type { PersonaId } from '../content/personas';
import { getAccount, type Account } from '../lib/account';
import { coachSay, coachStatus, newTurnId, type CoachReply, type CoachStatus } from '../lib/coach';
import { hasVoice, listenTurn, say, SpeechError, stopSpeaking, sttSupported, ttsSupported } from '../lib/speech';
import { playUz } from '../lib/tts';
import { recordTurn, recorderSupported, releaseMic, SttError, transcribeTurn, watchBargeIn } from '../lib/voiceTurn';
import { personaLevel, useProfile } from '../lib/store';
import { addMistake } from '../lib/mistakes';
import { logErrors } from '../lib/adaptive/store';
import { isTaxonomyId, type TaxonomyId } from '../lib/adaptive/taxonomy';
import { L, getLang } from '../i18n';

type Phase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
type Lang = string; // nutqni tanish tili: en-US yoki o'quvchining ona tili
const PHASE_UZ: Record<Phase, string> = { idle: L('Navbat sizda'), listening: L('Tinglayapman…'), thinking: L('O‘ylayapman…'), speaking: L('Gapiryapman…'), error: L('Qayta urinib ko‘ring') };
const OPENER = L('Salom! Men Bandly ustoziman. Keling, ingliz tilida gaplashamiz — qiynalsangiz, o‘zbekcha so‘rang. So, how are you today?');
const LANG_KEY = 'bandly.coach.lang';
const PERSONA_KEY = 'bandly.coach.persona';
const PERSONA_BY_LEVEL: PersonaId[] = ['friendly', 'strict', 'savage', 'savage'];
type CallPersona = 'friendly' | 'strict' | 'savage';
const CALL_PERSONAS: { id: CallPersona; label: string; adult?: boolean }[] = [
  { id: 'friendly', label: L('Mehribon') }, { id: 'strict', label: L('Qattiqqo‘l') }, { id: 'savage', label: L('Shafqatsiz 18+'), adult: true },
];
const savedPersona = (): CallPersona | null => { try { const v = localStorage.getItem(PERSONA_KEY); return v === 'friendly' || v === 'strict' || v === 'savage' ? v : null; } catch { return null; } };
// Ona tili: interfeys tili (inglizcha interfeysda — o'zbekcha)
const NATIVE_STT: Record<string, string> = { uz: 'uz-UZ', ru: 'ru-RU', kk: 'kk-KZ', ky: 'ky-KG', tg: 'tg-TJ', en: 'uz-UZ' };
const nativeStt = (): string => NATIVE_STT[getLang()] ?? 'uz-UZ';
const isNative = (t: string): boolean => /[А-Яа-яЁёҚқҒғЎўҲҳӮӯҶҷӢӣ]/.test(t) || isUzbek(t);
const isUzbek = (t: string): boolean => /[‘’ʻ]|\b(men|siz|salom|qanday|keling|yaxshi|bu|uchun|bilan|emas|ham|nima|qiling|ayting|so‘z)\b/i.test(t);

interface Msg { role: 'learner' | 'coach'; text: string; reply?: CoachReply }

/** Ustoz gapini aytadi: avval neyron ovoz (o'zbek va ingliz tilini biladi), bo'lmasa brauzer ovozi. */
async function speakLine(text: string, signal: { cancelled: boolean }): Promise<void> {
  const parts = text.length <= 270 ? [text] : text.split(/(?<=[.!?])\s+/).reduce<string[]>((a, s) => { const l = a.length - 1; if (l >= 0 && (a[l]! + ' ' + s).length <= 270) a[l] += ' ' + s; else a.push(s.slice(0, 270)); return a; }, []);
  for (const part of parts) {
    if (signal.cancelled) return;
    if (await playUz(part, 'happy', signal, 'coach')) continue;
    if (!ttsSupported()) return;
    const nat = isNative(part) ? nativeStt() : null;
    const ok = nat && hasVoice(nat.slice(0, 2));
    await say(part, signal, ok ? nat! : 'en-GB', { pitch: 1, rate: 0.95, volume: 1 });
  }
}

export default function Coach() {
  const p = useProfile();
  const [picked, setPicked] = useState<CallPersona | null>(savedPersona);
  const fallback = (p.adult ? PERSONA_BY_LEVEL[personaLevel(p)] : personaLevel(p) >= 1 ? 'strict' : 'friendly') as CallPersona;
  const persona: CallPersona = (picked === 'savage' && !p.adult) ? 'strict' : picked ?? fallback;
  const pickPersona = (id: CallPersona) => { setPicked(id); try { localStorage.setItem(PERSONA_KEY, id); } catch { /* ignore */ } };
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [acc, setAcc] = useState<Account | null>(() => getAccount());
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [phase, setPhaseState] = useState<Phase>('idle');
  const [err, setErr] = useState('');
  // Holat ref orqali ham saqlanadi: navbatlar ketma-ket (bitta render ichida) o'zgarganda eskirgan qiymat o'qilmasin
  const phaseRef = useRef<Phase>('idle');
  const setPhase = (ph: Phase) => { phaseRef.current = ph; setPhaseState(ph); };
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const [interim, setInterim] = useState('');
  const [voiceOn, setVoiceOn] = useState(true);
  const [lang, setLang] = useState<Lang>(() => { try { return localStorage.getItem(LANG_KEY) === 'native' ? nativeStt() : 'en-US'; } catch { return 'en-US'; } });
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const listenSig = useRef({ cancelled: false });
  const pending = useRef<{ text: string; turnId: string } | null>(null);
  const live = useRef(false);
  const logRef = useRef<HTMLDivElement | null>(null);
  const msgsRef = useRef<Msg[]>(msgs); msgsRef.current = msgs;
  const started = msgs.length > 0;
  const [serverDown, setServerDown] = useState(false);
  const [lvl, setLvl] = useState(0);
  // Server tanishi (aniq, tilni o'zi aniqlaydi) — bo'lmasa brauzer tanishi
  const server = !!status?.stt && recorderSupported() && !serverDown;
  const stt = server || (typeof window !== 'undefined' && sttSupported());

  const [minutes, setMinutes] = useState<{ subscribed: boolean; left: number; total: number } | null>(null);
  const loadMinutes = () => { const a = getAccount(); if (a) void fetch('/api/coach/minutes', { headers: { 'x-token': a.token } }).then((r) => (r.ok ? r.json() : null)).then(setMinutes).catch(() => undefined); };
  useEffect(() => { loadMinutes(); }, [acc]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { void coachStatus().then(setStatus); return () => { live.current = false; sig.current.cancelled = true; stopSpeaking(); releaseMic(); }; }, []);
  useEffect(() => { logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' }); }, [msgs, interim]);
  const pickLang = (l: Lang) => { setLang(l); try { localStorage.setItem(LANG_KEY, l === 'en-US' ? 'en' : 'native'); } catch { /* ignore */ } };

  /** Ustoz gapiradi, keyin (ovozli rejimda) avtomatik ravishda o'quvchini tinglaydi — qo'ng'iroqdagidek. */
  const tutorSays = async (line: string) => {
    if (voiceOn) {
      setPhase('speaking'); const s = { cancelled: false }; sig.current = s;
      // Gapni bo'lish: o'quvchi gapira boshlasa ustoz darhol to'xtaydi va tinglaydi
      const stopWatch = server && !typing ? await watchBargeIn(() => { s.cancelled = true; stopSpeaking(); }) : () => undefined;
      try { await speakLine(line, s); } catch { /* ovoz bo'lmasa ham suhbat davom etadi */ } finally { stopWatch(); }
    }
    if (!live.current) return;
    setPhase('idle');
    if (stt && voiceOn && !typing) void listen();
  };

  const start = () => {
    live.current = true;
    setMsgs([{ role: 'coach', text: OPENER }]);
    void tutorSays(OPENER);
  };

  const end = () => { live.current = false; sig.current.cancelled = true; listenSig.current.cancelled = true; endRef.current?.(); stopSpeaking(); releaseMic(); setMsgs([]); setPhase('idle'); setErr(''); pending.current = null; };

  const send = async (learnerText: string, retry = false) => {
    const t = learnerText.trim();
    if (!t || phaseRef.current === 'thinking') return;
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
      if (msgsRef.current.length % 6 === 0) loadMinutes();
      await tutorSays(line);
    } catch (e) {
      setErr((e as Error).message); setPhase('error');
    }
  };

  async function listen() {
    if (phaseRef.current === 'listening') { endRef.current?.(); return; }
    stopSpeaking(); setErr(''); setInterim(''); setPhase('listening');
    const ls = { cancelled: false }; listenSig.current = ls;
    try {
      let heard = '';
      if (server) {
        const r = await recordTurn({ silenceMs: 1300, maxMs: 60_000, noSpeechMs: 12_000, onLevel: setLvl, endRef, signal: ls });
        setLvl(0);
        if (!live.current || ls.cancelled) return;
        if (!r.blob) { setPhase('idle'); return; } // gapirilmadi — tugmani bosib qayta gapiradi
        setPhase('thinking'); setInterim('');
        heard = (await transcribeTurn(r)).text;
        if (!heard) { setPhase('idle'); setErr(L('Ovoz eshitilmadi. Qayta gapiring.')); return; }
      } else {
        const r = await listenTurn({ silenceMs: 1600, maxMs: 45_000, noSpeechMs: 9000, lang, onInterim: setInterim, signal: ls, endRef });
        setInterim('');
        heard = r.text.trim();
      }
      if (!live.current) return;
      setPhase('idle');
      if (heard) await send(heard);
    } catch (e) {
      setLvl(0);
      if (e instanceof SttError) {
        // Limit tugadi yoki xizmat band — bu qo'ng'iroqda brauzer tanishiga o'tamiz
        if (e.status === 429 || e.status === 503) setServerDown(true);
        setErr(e.message); setPhase('error'); return;
      }
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? L('Mikrofonga ruxsat berilmagan.') : code === 'nomic' ? L('Mikrofon topilmadi.') : code === 'network' ? L('Internet aloqasi uzildi.') : L('Nutqni tanib bo‘lmadi.'));
      setPhase('error');
    }
  }

  const personaSeg = (
    <div className="seg tutor-persona" role="group" aria-label={L('Ustoz xarakteri')}>
      {CALL_PERSONAS.filter((c) => !c.adult || p.adult).map((c) => <button key={c.id} type="button" className={persona === c.id ? 'on' : ''} aria-pressed={persona === c.id} onClick={() => pickPersona(c.id)}>{c.label}</button>)}
    </div>
  );

  if (!started) return (
    <div className="tutor">
      <section className="tutor-call idle-call">
        <div className={`tutor-orb ${phase}`} aria-hidden="true"><span>B</span></div>
        <h2>{L('AI ustoz')}</h2>
        <p>{L('Ovozli suhbat: inglizcha gapiring, qiynalsangiz — o‘zbekcha so‘rang.')}</p>
        {personaSeg}
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
          <div className={`tutor-orb sm ${phase}`} style={{ '--lvl': lvl } as CSSProperties} aria-hidden="true"><span>B</span></div>
          <div className="grow"><b>{L('Bandly ustoz')}</b><small aria-live="polite">{PHASE_UZ[phase]}{minutes?.subscribed ? <span className="tutor-min"> · {L('{0} daqiqa qoldi', [minutes.left])}</span> : null}</small></div>
          {!server && <div className="seg" role="group" aria-label={L('Siz gapiradigan til')}>
            <button type="button" className={lang === 'en-US' ? 'on' : ''} onClick={() => pickLang('en-US')}>{L('EN')}</button>
            <button type="button" className={lang === 'uz-UZ' ? 'on' : ''} onClick={() => pickLang('uz-UZ')}>{L('UZ')}</button>
          </div>}
        </div>
        {personaSeg}
        <div className="tutor-log" ref={logRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`bubble2 ${m.role}`}>
              {m.text}
              {m.reply?.correction && <div className="fix"><s>{m.reply.correction.wrong}</s> → <b>{m.reply.correction.right}</b>{m.reply.correction.whyUz && <span> · {m.reply.correction.whyUz}</span>}</div>}
            </div>
          ))}
          {phase === 'listening' && <div className="bubble2 learner ghost">{interim || (server ? <span className="vu" style={{ '--lvl': lvl } as CSSProperties}><i /><i /><i /><i /><i /></span> : '…')}</div>}
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
              onClick={() => { if (phase === 'speaking') { sig.current.cancelled = true; stopSpeaking(); return; } void listen(); }}
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
