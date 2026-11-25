// Sellzen — ovozli suhbat (qo'ng'iroq kabi), bitta personaj: Sellzen. Qo'ng'iroq ekrani BITTA ekranga sig'adi (skrol yo'q, joylar band qilingan).
// Boshlash: Sellzen yuziga tegish. Gapirish (push-to-talk): ekranga (yuziga) tegib turish — qo'yib yuborilganda ustoz javob beradi; desktopda Probel.
// Tugatish: yuqori burchakdagi kichik tugma. Shovqin ustozni bo'lmaydi, ustoz fikrini tugatadi; uni faqat ekranga ataylab tegish to'xtatadi.
// Nutq serverda (ElevenLabs Scribe) aniq tanadi. Ustoz o'quvchi rejasini biladi, "darsga o't" desa o'tkazadi. Xatolar "Xatolarim"ga jimgina yoziladi.
import { PhoneOff } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { JoinForm } from '../components/JoinForm';
import { getAccount, type Account } from '../lib/account';
import { coachSay, coachStatus, newTurnId, type CoachStatus } from '../lib/coach';
import { listenTurn, SpeechError, stopSpeaking, sttSupported } from '../lib/speech';
import { lastTtsStatus, playPrepared, prepareUz } from '../lib/tts';
import { parkMic, recordTurn, recorderSupported, resumeAudio, SttError, transcribeTurn } from '../lib/voiceTurn';
import { lockTelegramSwipes } from '../lib/telegram';
import { MAX_TALK_MS, PTT_IDLE, pttStep, type PttInput, type PttState } from '../lib/ptt';
import { personaLevel, useProfile } from '../lib/store';
import { liveSupported, startLive, type LiveCall } from '../lib/liveCall';
import { buildLiveContext } from '../lib/liveContext';
import { getLang } from '../i18n';
import { AiAvatar } from '../components/AiAvatar';
import type { CoachEmotion } from '../content/personas';
import { addMistake } from '../lib/mistakes';
import { logErrors } from '../lib/adaptive/store';
import { isTaxonomyId, type TaxonomyId } from '../lib/adaptive/taxonomy';
import { L } from '../i18n';
import { FREE_INFO, SALE_PLANS } from '../config';

type Phase = 'idle' | 'connecting' | 'listening' | 'thinking' | 'speaking' | 'error';
const PHASE_UZ: Record<Phase, string> = { connecting: L('Ulanmoqda…'), idle: L('Navbat sizda'), listening: L('Tinglayapman…'), thinking: L('O‘ylayapman…'), speaking: L('Sellzen gapiryapti'), error: L('Qayta urinib ko‘ring') };
// Suhbat boshlanishi har safar boshqacha (bir xil gap bilan boshlamaslik uchun)
const OPENERS = [
  L('Salom! Inglizcha gaplashamiz, qiynalsangiz o‘zbekcha so‘rang. So, how was your day?'),
  L('Oh, look who’s here! Okay, English only... mostly. What did you do today?'),
  L('Salom, chempion! Quick question: tea or coffee, and why? Go!'),
  L('Salom! Gapiring, tinglayman. What’s the most interesting thing you did this week?'),
  L('Hello there! Let’s see if your English is as good as you think. Tell me about yourself in three sentences.'),
  L('Salom! Bugun sen gapirasan, men kulaman. Tell me, what annoys you the most in your city?'),
];
// AI javob bermasa (provayder band yoki aloqa yo'q) — Sellzen buni ovoz bilan aytadi, jim turib qolmaydi
const SORRY = [
  L('Uff, aloqam biroz qotib qoldi. Yana bir marta ayting-chi?'),
  L('Kechirasiz, miyam bir soniya o‘chib qoldi. Qaytadan ayting!'),
  L('Hmm, eshitolmay qoldim. Yana bir bor, iltimos.'),
];
const mmss = (s: number): string => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

interface Turn { role: 'learner' | 'coach'; text: string }

/** Javobni gaplarga bo'ladi (birinchi bo'lak qisqa — Sellzen tezroq gapira boshlasin). */
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
/** 'silent' — hech qaysi bo'lak ovozda aytilmadi (provayder xatosi): javob ekranda matn bo'lib ko'rsatiladi. */
export async function speakLine(text: string, signal: { cancelled: boolean }, emotion: 'happy' | 'angry' | 'laugh' = 'happy'): Promise<'ok' | 'limit' | 'silent'> {
  const parts = chunkReply(text);
  let limited = false; let played = false;
  if (callVoice !== 'browser') {
    let next: Promise<string | null> = prepareUz(parts[0]!, emotion, 'coach', 0);
    for (let i = 0; i < parts.length; i++) {
      if (signal.cancelled) return 'ok';
      let url = await next;
      if (!url && i === 0 && callVoice === null) { limited = lastTtsStatus === 429; break; } // neyron ovoz ishlamadi (limit yoki o'chiq) — brauzer ovozi ishlatilmaydi, javob matnda qoladi
      if (!url && !signal.cancelled) url = await prepareUz(parts[i]!, emotion, 'coach', i); // bir marta qayta
      if (i + 1 < parts.length) next = prepareUz(parts[i + 1]!, emotion, 'coach', i + 1);
      if (url) { callVoice = 'neural'; played = true; if (!signal.cancelled) await playPrepared(url, signal); else URL.revokeObjectURL(url); }
      // url yo'q (tarmoq xatosi) — bu bo'lak o'tkazib yuboriladi, boshqa ovoz bilan aytilmaydi
    }
    if (!limited) return played || signal.cancelled ? 'ok' : 'silent';
  }
  if (lastTtsStatus === 429) limited = true;
  // Brauzer ovozi ishlatilmaydi (egasi qarori): ElevenLabs ovozi ishlamasa, javob matn ko'rinishida qoladi.
  return limited ? 'limit' : 'silent';
}

export default function Coach() {
  const p = useProfile();
  const [status, setStatus] = useState<CoachStatus | null>(null);
  const [acc, setAcc] = useState<Account | null>(() => getAccount());
  const [live, setLive] = useState(false);
  const [phase, setPhaseState] = useState<Phase>('idle');
  const [caption, setCaption] = useState(''); // ovoz ishlamaganda Sellzen javobining matni
  const [typed, setTyped] = useState('');
  const [textMode, setTextMode] = useState(false); // mikrofon/tanish ishlamasa — yozib javob berish
  const phaseRef = useRef<Phase>('idle');
  const setPhase = (ph: Phase) => { phaseRef.current = ph; setPhaseState(ph); };
  const [err, setErr] = useState('');
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const VOICE_LIMIT = L('Bugungi bepul ovozli javoblar tugadi — Sellzen ovozi ertaga qaytadi.');
  const [lvl, setLvl] = useState(0);
  const [emotion, setEmotionState] = useState<CoachEmotion>('neutral');
  const emoRef = useRef<CoachEmotion>('neutral');
  const setEmotion = (e: CoachEmotion) => { emoRef.current = e; setEmotionState(e); };
  const [secs, setSecs] = useState(0);
  const [capSec, setCapSec] = useState(0); // server ruxsat bergan qo'ng'iroq uzunligi (taymer: 03:12 / 10:00)
  const [talking, setTalking] = useState(false); // tugma bosib turilibdi (yoki qulflangan)
  const [latched, setLatched] = useState(false);
  const [liveOn, setLiveOn] = useState(false);
  // Suhbat tarixi (Siz / Sellzen): chat kabi — eski gaplar yuqoriga chiqib ketadi, oxirgilari to'liq ko'rinadi (qisqartirilmaydi)
  const [msgs, setMsgs] = useState<{ id: number; who: 'you' | 'bot'; text: string }[]>([]);
  // Matn oynasi ixcham (ekranning ~chorak qismi), lekin oxirgi gap har doim to'liq ko'rinadi: oyna kamida oxirgi xabar balandligicha
  const linesRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { const el = linesRef.current; const last = el?.lastElementChild as HTMLElement | null; el?.style.setProperty('--last-h', `${last ? last.offsetHeight + 30 : 0}px`); }, [msgs]);
  const [hint, setHint] = useState('');
  const [limitKind, setLimitKind] = useState<'session' | 'quota'>('quota');
  const msgId = useRef(0); const youFresh = useRef(true); const botFresh = useRef(true);
  const pttState = useRef<PttState>(PTT_IDLE);
  const talkingRef = useRef(false);
  const thinkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nav = useRef<{ route: string; spoke: boolean; timer: ReturnType<typeof setTimeout> | null } | null>(null); // "darsga o't": ustoz tasdiqlab bo'lgach o'tamiz
  const finePointer = typeof window !== 'undefined' && !!window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;
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

  const pushMsg = (who: 'you' | 'bot', text: string) => { const t = text.trim(); if (t) setMsgs((m) => [...m, { id: ++msgId.current, who, text: t.slice(0, 700) }].slice(-30)); };
  /** Oqim bo'lagi (Gemini matni bo'laklab keladi): oxirgi xabar shu tomonniki bo'lsa — davom ettiradi, aks holda yangi xabar. */
  const appendMsg = (who: 'you' | 'bot', text: string) => setMsgs((m) => {
    const i = m.length - 1;
    if (i >= 0 && m[i]!.who === who) { const c = m.slice(); c[i] = { ...c[i]!, text: (c[i]!.text + text).slice(-700) }; return c; }
    const t = text.trimStart(); return t ? [...m, { id: ++msgId.current, who, text: t.slice(0, 700) }].slice(-30) : m;
  });
  const showSaid = (t: string) => { botFresh.current = true; pushMsg('bot', t); };
  /** "Darsga o't" kabi buyruq: qo'ng'iroq yakunlanadi (xotira saqlanadi) va ilova so'ralgan joyni ochadi. */
  const goNav = () => {
    const n = nav.current; if (!n) return; nav.current = null; if (n.timer) clearTimeout(n.timer);
    end(); if (/^#\/[\w/.-]*$/.test(n.route)) window.location.hash = n.route;
  };
  /** Ustoz gapiradi (fikrini oxirigacha), keyin navbat o'quvchida: u tugmani bosib turib gapiradi. Ustozni faqat tugmani ataylab bosish to'xtatadi. */
  const tutorSays = async (line: string) => {
    setPhase('speaking'); showSaid(line);
    const s = { cancelled: false }; sig.current = s;
    try {
      const res = await speakLine(line, s, emoRef.current === 'laugh' ? 'laugh' : emoRef.current === 'angry' ? 'angry' : 'happy');
      if (res === 'limit') { setCaption(line); setLimitMsg(VOICE_LIMIT); end(); return; }
      setCaption(res === 'silent' ? line : ''); // ovoz chiqmadi — javob matn bo'lib ko'rinadi, suhbat davom etadi
    } catch { setCaption(line); }
    if (!liveRef.current) return;
    if (!talkingRef.current) setPhase('idle');
  };

  /** Gemini Live: ovozdan-ovozga. Ishga tushmasa (model yo'q, tarmoq) — eski usulga (tanish → AI → ovoz) o'tadi. */
  const startLiveCall = async (): Promise<boolean> => {
    const a = getAccount();
    if (!a) return false;
    setPhase('connecting');
    return new Promise<boolean>((resolve) => {
      let settled = false;
      // 10 s ichida ulanmasa — kutib qolmaymiz: oddiy ovozli rejimga o'tamiz
      const guard = setTimeout(() => { if (!settled) { liveRefCall.current?.end(); liveRefCall.current = null; setLiveFailed(true); done(false); } }, 10_000);
      const done = (ok: boolean) => { if (!settled) { settled = true; clearTimeout(guard); resolve(ok); } };
      void startLive({ token: a.token, adult: p.adult, level: p.level, lang: getLang(), style: personaLevel(p), ctx: buildLiveContext(p) }, {
        onReady: (info) => { setCapSec(info.capSec); setLiveOn(true); setPhase('idle'); done(true); },
        onSpeaking: (on) => {
          if (thinkTimer.current) { clearTimeout(thinkTimer.current); thinkTimer.current = null; }
          setPhase(on ? 'speaking' : talkingRef.current ? 'listening' : 'idle'); if (!on) setLvl(0);
          const n = nav.current; if (n) { if (on) n.spoke = true; else if (n.spoke) setTimeout(goNav, 500); } // ustoz tasdiqlab bo'lgach — o'tamiz
        },
        onLevel: (v) => setLvl(v),
        onHeard: (t) => { if (youFresh.current) { youFresh.current = false; pushMsg('you', t); } else appendMsg('you', t); },
        onSaid: (t) => {
          if (botFresh.current) { botFresh.current = false; pushMsg('bot', t); } else appendMsg('bot', t);
          // Hissiyot faqat serverdan keladi (onEmotion: butun javob bo'yicha). Avvalgi mijoz tekshiruvi "Hello" so'zidagi "hell"ni so'kinish deb, salomlashishda jahl yuzini ko'rsatardi.
        },
        onTurn: () => { botFresh.current = true; if (phaseRef.current === 'thinking') setPhase('idle'); },
        onNoVoice: () => { setPhase('idle'); setHint(L('Ovoz eshitilmadi — mikrofonga yaqinroq gapirib ko‘ring.')); },
        onNavigate: (route) => { if (nav.current) return; nav.current = { route, spoke: false, timer: setTimeout(goNav, 7000) }; }, // ustoz tasdiqlamasa ham 7 soniyada o'tamiz
        onError: (msg, beforeReady) => { if (beforeReady) { liveRefCall.current?.end(); liveRefCall.current = null; setLiveFailed(true); done(false); } else { setErr(msg); setLiveFailed(true); end(); } }, // keyingi urinish — oddiy ovozli rejim (STT + matn AI + ovoz)
        onLimit: (m, kind) => { setLimitKind(kind); setLimitMsg(m || (kind === 'session' ? L('Suhbat vaqti tugadi — yangi suhbatni boshlashingiz mumkin.') : L('Bugungi bepul ovozli suhbat daqiqalari tugadi. Yangi daqiqalar ertaga beriladi.'))); end(); },
        onClosed: () => { if (settled && liveRef.current) end(); done(false); },
        onEmotion: (e) => setEmotion(e),
      }).then((c) => { liveRefCall.current = c; }).catch(() => { setLiveFailed(true); done(false); });
    });
  };

  const start = () => {
    liveRef.current = true; setLive(true); setSecs(0); setCapSec(0); setErr(''); setEmotion('happy'); resetCallVoice();
    setLimitMsg(null); setLimitKind('quota'); setHint(''); setMsgs([]); youFresh.current = true; botFresh.current = true; pttState.current = PTT_IDLE; setTalking(false); talkingRef.current = false; setLatched(false);
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
    if (nav.current?.timer) clearTimeout(nav.current.timer); nav.current = null;
    setLiveOn(false); setTalking(false); talkingRef.current = false; setLatched(false); pttState.current = PTT_IDLE; if (thinkTimer.current) { clearTimeout(thinkTimer.current); thinkTimer.current = null; }
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
      // Profil xarakteri: Yumshoq → friendly, Hazil → comedy, Qattiq → bandi, Jallod → savage (18+ server ham tekshiradi)
      const r = await coachSay({ persona: (['friendly', 'comedy', 'bandi', 'savage'] as const)[personaLevel(p)] ?? 'friendly', mode: 'practice', adult: p.adult, level: p.level, history, text: turn.text, turnId: turn.turnId });
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
      // Sellzen jim qolmaydi: qisqa ovozli uzr aytadi va yana tinglaydi (o'quvchi gapini qayta aytadi)
      setErr((e as Error).message); pending.current = null;
      turns.current = turns.current.slice(0, -1);
      if (liveRef.current) { const line = SORRY[Math.floor(Math.random() * SORRY.length)]!; setEmotion('disappointed'); await tutorSays(line); } else setPhase('error');
    }
  };

  /** Klassik rejim (Live bo'lmaganda): tugma bosilib turguncha yozadi, qo'yib yuborilganda (endRef) tugaydi — sukutga qarab o'zi to'xtamaydi. */
  async function listen() {
    stopSpeaking(); setErr(''); setPhase('listening');
    const ls = { cancelled: false }; listenSig.current = ls;
    try {
      let heard = '';
      if (server) {
        const r = await recordTurn({ silenceMs: 1e9, maxMs: MAX_TALK_MS, noSpeechMs: 1e9, onLevel: setLvl, endRef, signal: ls });
        setLvl(0);
        if (!liveRef.current) return;
        if (ls.cancelled) { setPhase('idle'); return; }
        if (!r.blob) { setPhase('idle'); setHint(L('Ovoz eshitilmadi — mikrofonga yaqinroq gapirib ko‘ring.')); return; } // gapirilmadi — tugmani bosib qayta gapiradi
        setPhase('thinking');
        heard = (await transcribeTurn(r)).text;
        if (!heard) { setPhase('idle'); setHint(L('Ovoz eshitilmadi — mikrofonga yaqinroq gapirib ko‘ring.')); return; } // aniq so'z chiqmadi — o'quvchi qayta bosib gapiradi
      } else {
        heard = (await listenTurn({ silenceMs: 1e9, maxMs: MAX_TALK_MS, noSpeechMs: 1e9, lang: 'en-US', mixed: true, onInterim: () => undefined, signal: ls, endRef })).text.trim();
      }
      if (!liveRef.current) return;
      setPhase('idle');
      if (heard) { pushMsg('you', heard); await send(heard); }
    } catch (e) {
      setLvl(0);
      if (e instanceof SttError) {
        if (e.status === 429 || e.status === 503) setServerDown(true); // limit tugadi — bu qo'ng'iroqda brauzer tanishiga o'tamiz
        setErr(e.message); setTextMode(true); setPhase('error'); return;
      }
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? L('Mikrofonga ruxsat berilmagan.') : code === 'nomic' ? L('Mikrofon topilmadi.') : code === 'network' ? L('Internet aloqasi uzildi.') : L('Nutqni tanib bo‘lmadi.'));
      setTextMode(true); setPhase('error');
    }
  }

  // ---- Bosib-gapirish: bosildi → yozish boshlanadi; qo'yib yuborildi → ustoz javob beradi. Qisqa tegish — qulf (yana tegib tugatiladi). ----
  const startTalk = () => {
    setHint(''); setErr(''); youFresh.current = true; botFresh.current = true;
    talkingRef.current = true; setTalking(true);
    if (liveRefCall.current) { liveRefCall.current.talk(true); setPhase('listening'); setLvl(0); return; }
    if (phaseRef.current === 'speaking') { sig.current.cancelled = true; stopSpeaking(); } // ustozni ataylab to'xtatish
    void listen();
  };
  const stopTalk = () => {
    talkingRef.current = false; setTalking(false);
    if (liveRefCall.current) {
      liveRefCall.current.talk(false); setPhase('thinking'); setLvl(0);
      // javob kelmasa (aloqa sust) — "o'ylayapman"da qotib qolmaymiz
      if (thinkTimer.current) clearTimeout(thinkTimer.current);
      thinkTimer.current = setTimeout(() => { thinkTimer.current = null; if (phaseRef.current === 'thinking') setPhase('idle'); }, 15_000);
      return;
    }
    if (endRef.current) endRef.current(); else listenSig.current.cancelled = true; // mikrofon hali ochilmagan (ruxsat so'ralmoqda) — navbat bekor
  };
  const press = (e: PttInput) => {
    if (e.type === 'down') resumeAudio(); // avtomatik boshlangan qo'ng'iroqda ovoz birinchi tegishda yoqiladi (iOS/Telegram)
    if (e.type === 'down') { const ph = phaseRef.current; if (!liveRef.current || ph === 'connecting' || (!liveRefCall.current && ph === 'thinking')) return; }
    const [n, a] = pttStep(pttState.current, e); pttState.current = n;
    setLatched(n.mode === 'latched');
    if (a === 'start') startTalk(); else if (a === 'stop') stopTalk();
  };
  const pressRef = useRef(press); pressRef.current = press;
  // Desktop: Probel — bosib turib gapirish (matn kiritish maydonida ishlamaydi). Sahifa fonga o'tsa yoki oyna fokusini yo'qotsa — yozish bekor.
  useEffect(() => {
    if (!live) return;
    const skip = (t: EventTarget | null) => { const el = t as HTMLElement | null; if (!el?.tagName) return false; return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable || (el.tagName === 'BUTTON' && !el.dataset.ptt) || el.tagName === 'A'; };
    const down = (e: KeyboardEvent) => { if (e.code !== 'Space' || skip(e.target)) return; e.preventDefault(); if (!e.repeat) pressRef.current({ type: 'down', at: performance.now() }); };
    const up = (e: KeyboardEvent) => { if (e.code !== 'Space' || skip(e.target)) return; e.preventDefault(); pressRef.current({ type: 'up', at: performance.now() }); };
    const cancel = () => pressRef.current({ type: 'cancel' });
    const vis = () => { if (document.hidden) cancel(); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', cancel); document.addEventListener('visibilitychange', vis);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', cancel); document.removeEventListener('visibilitychange', vis); };
  }, [live]);
  // Bir navbat 60 soniyadan oshmaydi (qulflangan yozuv ochiq qolib ketmasin)
  useEffect(() => { if (!talking) return; const t = setTimeout(() => pressRef.current({ type: 'cancel' }), MAX_TALK_MS); return () => clearTimeout(t); }, [talking]);
  // Butun qo'ng'iroq ekrani — bosiladigan maydon (sensorli ekranda istalgan joyga tegish; sichqonchada faqat yuz/markaz). Tugmalar (tugatish, matn maydoni) — bundan mustasno.
  const padProps = {
    onPointerDown: (e: RPointerEvent<HTMLElement>) => {
      const t = e.target as HTMLElement;
      if (t.closest('[data-nopress]')) return;
      if (e.pointerType === 'mouse' && (e.button !== 0 || !t.closest('[data-pad]'))) return;
      e.preventDefault(); try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* */ }
      press({ type: 'down', at: performance.now() });
    },
    onPointerUp: () => press({ type: 'up', at: performance.now() }),
    onPointerCancel: () => press({ type: 'cancel' }),
    onContextMenu: (e: { preventDefault(): void }) => e.preventDefault(),
  };
  // Qo'ng'iroq paytida sahifa orqada siljimasin; Telegram oynasi ham pastga surilib yig'ilmasin
  useEffect(() => { if (!live) return; const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; lockTelegramSwipes(true); return () => { document.body.style.overflow = prev; lockTelegramSwipes(false); }; }, [live]);
  // Egasi (2026-11-25): "Sellzenga kirishim bilan boshlayversin — ichkariga ikki marta kirishga majbur bo'lyapman". Sahifa ochilishi bilan
  // qo'ng'iroq o'zi boshlanadi (bir marta; o'quvchi tugatsa — qayta boshlanmaydi, yuzga tegib yana boshlash mumkin).
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || live || !acc || !status?.coach || limitMsg) return;
    autoStarted.current = true; start();
  }, [acc, status, live, limitMsg]); // eslint-disable-line react-hooks/exhaustive-deps

  const orb = <div className={`ai-orb-wrap ${phase}`} aria-hidden="true"><AiAvatar phase={phase === 'connecting' ? 'thinking' : phase} emotion={phase === 'speaking' ? emotion : 'neutral'} level={lvl} size={live ? 'var(--face)' : 'min(46vw, 190px)'} look={personaLevel(p)} /></div>;

  // ---- Qo'ng'iroqdan oldin: Sellzen yuziga tegish — qo'ng'iroq boshlanadi (alohida "boshlash" tugmasi yo'q) ----
  if (!live) return (
    <div className="tutor">
      <section className="tutor-call voice idle-call">
        <button type="button" className="start-face" onClick={start} disabled={!acc || !status?.coach} aria-label={L('Qo‘ng‘iroqni boshlash')}>{orb}</button>
        <h2>{L('Sellzen')}</h2>
        <p>{acc ? L('Gaplashish uchun Sellzen yuziga tegining') : L('Gapiring — Sellzen tinglaydi va xatoingizni tuzatadi.')}</p>
        {acc && minutes === null && <span className="pill" style={{ visibility: 'hidden' }} aria-hidden="true">{L('Bepul: kuniga {0} daqiqa', [FREE_INFO.liveMinutesPerDay])}</span>}{/* daqiqalar yuklanguncha joy band — sahifa sakramaydi */}
        {minutes?.subscribed ? <span className="pill">{L('{0} daqiqa qoldi', [minutes.left])}</span> : minutes && FREE_INFO.liveMinutesPerDay > 0 ? <span className="pill">{L('Bepul: kuniga {0} daqiqa', [FREE_INFO.liveMinutesPerDay])}</span> : null}
        {limitMsg && <p className="notice voice-limit" role="status">{limitMsg} {limitKind === 'quota' && <a href="#/pricing">{L('Obuna: oyiga {0} daqiqa', [SALE_PLANS[0]!.voiceMin])}</a>}</p>}
        {status && !status.coach && <p className="notice">{L('Sellzen tez orada ochiladi.')}</p>}
        {!acc && <JoinForm onJoined={setAcc} text={L('Suhbat uchun hisobingizga kiring.')} />}
      </section>
    </div>
  );

  // ---- Qo'ng'iroq: butun ekran, joylar band qilingan (siljish va skrol yo'q) ----
  const canTalk = liveOn || canListen;
  const nearEnd = capSec > 0 && capSec - secs <= 30;
  const statusText = phase === 'idle' && hint ? hint : PHASE_UZ[phase];
  const subHint = phase === 'listening' ? (latched ? L('Gapingiz tugagach yana tegining') : L('Gapingiz tugagach qo‘yib yuboring — Sellzen javob beradi'))
    : phase === 'speaking' ? L('Gapirmoqchi bo‘lsangiz — ekranga tegining, Sellzen to‘xtaydi')
    : phase === 'idle' && canTalk ? (finePointer ? L('Probelni (Space) bosib turib gapiring') : L('Ekranga tegib turib gapiring'))
    : '';
  return (
    <div className={`tutor-call call${phase === 'speaking' && emotion !== 'neutral' ? ` emo-${emotion}` : ''}${talking ? ' talking' : ''}`} role="group" aria-label={L('Bosib turib gapirish')} {...(canTalk ? padProps : {})}>
      <header className="call-top">
        <span className="call-who">{L('Sellzen')}</span>
        <span className={`call-time${nearEnd ? ' warn' : ''}`}>{mmss(secs)}{capSec > 0 ? ` / ${mmss(capSec)}` : ''}{minutes?.subscribed ? ` · ${L('{0} daqiqa qoldi', [minutes.left])}` : ''}</span>
        <button type="button" data-nopress className="call-end" onClick={end} aria-label={L('Suhbatni tugatish')}><PhoneOff size={20} /></button>
      </header>
      <div className={`call-bar${nearEnd ? ' warn' : ''}`} aria-hidden="true">{capSec > 0 && <i style={{ width: `${Math.min(100, (secs / capSec) * 100)}%` }} />}</div>
      <main className="call-stage" data-pad>
        <div className={`call-face${talking ? ' on' : ''}`}>{orb}</div>
        <p className="call-status" aria-live="polite">{statusText}</p>
        <p className="call-sub">{subHint}</p>
        <div className="call-lines" aria-live="polite" ref={linesRef}>
          {msgs.map((m) => <p key={m.id} className={`vl ${m.who}`}><b>{m.who === 'you' ? L('Siz') : L('Sellzen')}</b> {m.text}</p>)}
        </div>
        {(err || limitMsg || (liveFailed && !!status?.live)) && (
          <div className="call-notes">
            {liveFailed && !!status?.live && <p className="notice" role="status">{L('Jonli ovozli suhbat hozir ishlamayapti — oddiy ovozli rejimda davom etamiz: siz gapirasiz, Sellzen matn va ovoz bilan javob beradi.')}</p>}
            {err && <p className="tutor-err">{err}</p>}
            {limitMsg && <p className="notice voice-limit" role="status">{limitMsg} {limitKind === 'quota' && <a href="#/pricing">{L('Obuna: oyiga {0} daqiqa', [SALE_PLANS[0]!.voiceMin])}</a>}</p>}
          </div>
        )}
      </main>
      <footer className="call-foot">
        {(textMode || !canListen || !!caption) && !liveOn && (
          <form data-nopress className="tutor-type" onSubmit={(e) => { e.preventDefault(); const v = typed.trim(); if (v) { setTyped(''); void send(v); } }}>
            <input type="text" value={typed} maxLength={500} placeholder={L('Javobingizni ingliz tilida yozing')} aria-label={L('Javobingizni ingliz tilida yozing')} onChange={(e) => setTyped(e.target.value)} />
            <button type="submit" className="btn primary sm" disabled={!typed.trim() || phase === 'thinking'}>{L('Yuborish')}</button>
          </form>
        )}
      </footer>
    </div>
  );
}
