import { Mic, RotateCcw, Share2, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { BRICKS_PER_FLOOR, LEVELS, LINKER_BONUS, ROUND_MS, START_GRACE_MS, bricksOf, checkFall, floorsOf, levelOf, pickTopic, reaction, result, score, wobble, type ChallengeLevel, type RoundResult } from '../lib/silenceGame';
import { listenTurn, say, SpeechError, stopSpeaking, sttSupported } from '../lib/speech';
import { findIssues } from '../lib/grammarCheck';
import { addMistake } from '../lib/mistakes';
import { renderCard, shareCard } from '../lib/shareCard';
import { addXp, useProfile } from '../lib/store';
import { L } from '../i18n';

type Phase = 'setup' | 'playing' | 'over';

/** Minora: qavatlar pastdan yuqoriga; oltin qavat — unda bog'lovchi bor edi. Eng yuqori qavat jimlikda tebranadi. */
function Tower({ floors, gold, goal, shake, falling }: { floors: number; gold: Set<number>; goal: number; shake: number; falling: boolean }) {
  const shown = Math.max(floors, 1);
  return (
    <div className="minora" aria-label={L('Minora: {0} qavat, maqsad {1}', [floors, goal])} role="img">
      <div className="minora-goal" style={{ bottom: `${Math.min(goal, 34) * 9 + 16}px` }}><span>{L('Maqsad')} · {goal}</span></div>
      <div className="minora-stack">
        {Array.from({ length: Math.min(shown, 34) }, (_, i) => {
          const top = i === shown - 1 && floors > 0;
          return <i key={i} className={`${gold.has(i) ? 'gold' : ''} ${i >= floors ? 'ghost' : ''} ${top && shake > 0.35 ? 'shake' : ''} ${top && falling ? 'fall' : ''}`} style={top ? { animationDuration: `${Math.max(0.12, 0.6 - shake * 0.45)}s` } : undefined} />;
        })}
        <b className="minora-dome" />
      </div>
      <div className="minora-base" />
    </div>
  );
}

/** "Jim qolma! — Minora": gapirgan sari minora o'sadi, bog'lovchilar oltin g'isht, jimlikda qavat quladi. */
export default function Challenge() {
  const p = useProfile();
  const [level, setLevelState] = useState<ChallengeLevel>(() => { try { const v = localStorage.getItem('bandly.challenge.level'); return (LEVELS.some((l) => l.id === v) ? v : 'easy') as ChallengeLevel; } catch { return 'easy'; } });
  const setLevel = (l: ChallengeLevel) => { setLevelState(l); try { localStorage.setItem('bandly.challenge.level', l); } catch { /* ignore */ } };
  const [phase, setPhase] = useState<Phase>('setup');
  const [topic, setTopic] = useState(() => pickTopic(p.level));
  const [live, setLive] = useState('');
  const [now, setNow] = useState(Date.now());
  const [fallen, setFallen] = useState(0);
  const [falling, setFalling] = useState(false);
  const [gold, setGold] = useState<Set<number>>(new Set());
  const [res, setRes] = useState<RoundResult | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const startAt = useRef(0);
  const lastVoice = useRef(0);
  const fallenRef = useRef(0);
  const linkersSeen = useRef(0);
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const stt = typeof window !== 'undefined' && sttSupported();
  const lv = levelOf(level);
  const lim = lv.silenceMs;
  const b = bricksOf(live);
  const floors = floorsOf(b.bricks, fallen);

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => () => { sig.current.cancelled = true; stopSpeaking(); }, []);
  // Jimlik chegarasidan oshsa — bitta qavat quladi, jimlik hisobi qaytadan boshlanadi
  useEffect(() => {
    if (phase !== 'playing') return;
    const silent = now - lastVoice.current;
    if (checkFall(silent, lim, floorsOf(b.bricks, fallenRef.current))) {
      fallenRef.current += 1; setFallen(fallenRef.current); lastVoice.current = Date.now();
      setFalling(true); setTimeout(() => setFalling(false), 450);
      try { navigator.vibrate?.(120); } catch { /* */ }
    }
  }, [now, phase, lim, b.bricks]);
  // Yangi bog'lovchi aytildi — hozirgi eng yuqori qavat oltin bo'ladi
  useEffect(() => {
    if (phase !== 'playing' || b.linkers <= linkersSeen.current) return;
    linkersSeen.current = b.linkers;
    setGold((g) => new Set(g).add(Math.max(0, floors - 1)));
  }, [b.linkers, phase, floors]);

  const play = async () => {
    setErr(''); setLive(''); setRes(null); setMsg(''); setFallen(0); fallenRef.current = 0; linkersSeen.current = 0; setGold(new Set());
    try { await say(topic.en, { cancelled: false }, 'en-GB'); } catch { /* mavzuni ovozda o'qish ixtiyoriy */ }
    sig.current = { cancelled: false };
    startAt.current = Date.now(); lastVoice.current = Date.now() + START_GRACE_MS; setNow(Date.now()); setPhase('playing');
    try {
      const r = await listenTurn({
        silenceMs: ROUND_MS * 2, noSpeechMs: ROUND_MS * 2, // jimlik raundni tugatmaydi — faqat qavat quladi
        maxMs: ROUND_MS, lang: 'en-US', signal: sig.current, endRef, live: true,
        onInterim: (t) => { setLive(t); lastVoice.current = Date.now(); },
        onStatus: (s) => { if (s === 'speech') lastVoice.current = Date.now(); },
      });
      const rr = result(level, Date.now() - startAt.current, r.text, fallenRef.current);
      setLive(r.text); setRes(rr); setPhase('over');
      addXp(Math.min(40, Math.round(score(rr) / 10)));
      for (const i of findIssues(r.text)) { try { addMistake('coach', { kind: 'fix', wrong: i.wrong, right: i.right, whyUz: i.ruleUz }, []); } catch { /* skip */ } }
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? L('Mikrofonga ruxsat berilmagan.') : code === 'nomic' ? L('Mikrofon topilmadi.') : code === 'network' ? L('Nutqni tanish uchun internet kerak.') : L('Nutqni tanish to‘xtab qoldi. Qayta urinib ko‘ring.'));
      setPhase('setup');
    }
  };

  const silent = phase === 'playing' ? Math.max(0, now - lastVoice.current) : 0;
  const shake = wobble(silent, lim);
  const left = phase === 'playing' ? Math.max(0, ROUND_MS - (now - startAt.current)) : ROUND_MS;
  const issues = res ? findIssues(live) : [];

  const share = async () => {
    if (!res) return;
    const blob = await renderCard({ title: L('Jim qolma! — Minora · {0}', [levelOf(res.level).labelUz]), body: L('{0} qavatli minora qurdim!', [res.floors]), sub: L('{0} so‘z · {1} oltin g‘isht · {2} ball', [res.words, res.linkers, score(res)]), foot: L('Sellzen — sen ham sinab ko‘r') });
    if (!blob) return;
    const r = await shareCard(blob, 'sellzen-minora', L('Jim qolma! — {0} qavat, {1} ball. {2}/#/challenge', [res.floors, score(res), location.origin]));
    setMsg(r === 'shared' ? L('Ulashildi') : L('Rasm yuklab olindi'));
  };

  return (
    <div>
      {phase === 'setup' && (
        <section className="card page-head t-peach challenge-start">
          <h1 style={{ margin: 0, fontSize: 'clamp(24px, 3.4vw, 34px)', lineHeight: 1.08 }}>{L('Jim qolma! — Minora')}</h1>
          <p style={{ margin: '4px 0 10px' }}>{L('{0} soniya gapiring: har so‘z — g‘isht, har {1} g‘isht — bir qavat. Jim qolsangiz, yuqori qavat quladi.', [ROUND_MS / 1000, BRICKS_PER_FLOOR])}</p>
          <ul className="minora-rules">
            <li><b className="brick" /> {L('Oddiy so‘z — 1 g‘isht')}</li>
            <li><b className="brick gold" /> {L('Bog‘lovchi (because, however, for example…) — oltin g‘isht, {0} barobar', [LINKER_BONUS])}</li>
          </ul>
          <div className="topic-card">
            <small>{L('Mavzu')}</small>
            <b>{topic.en}</b>
            <span>{topic.uz}</span>
            <button type="button" className="icon-btn sm" onClick={() => setTopic(pickTopic(p.level))} aria-label={L('Boshqa mavzu')}><RotateCcw size={16} /></button>
          </div>
          <div className="seg" role="group" aria-label={L('Daraja')} style={{ margin: '12px 0' }}>{LEVELS.map((l) => <button key={l.id} type="button" className={level === l.id ? 'on' : ''} onClick={() => setLevel(l.id)}>{l.labelUz.split(/ ·| \(/)[0]}</button>)}</div>
          <p className="muted" style={{ margin: '0 0 12px' }}>{Number.isFinite(lim) ? L('{0} s jim qolsangiz, bitta qavat quladi. Maqsad: {1} qavat.', [lim / 1000, lv.goal]) : L('Qavatlar qulamaydi. Maqsad: {0} qavat.', [lv.goal])}</p>
          <div><button type="button" className="btn primary lg" disabled={!stt} onClick={() => void play()}><Mic size={18} />  {L('Qurishni boshlash')}</button></div>
          {!stt && <p className="bad">{L('Bu brauzerda mikrofon ishlamaydi — Chrome’da oching.')}</p>}
          {err && <p className="bad">{err}</p>}
        </section>
      )}

      {phase === 'playing' && (
        <section className="card" style={{ textAlign: 'center' }}>
          <p><b>{topic.en}</b></p>
          <Tower floors={floors} gold={gold} goal={lv.goal} shake={shake} falling={falling} />
          <p aria-live="polite" className="row" style={{ justifyContent: 'center' }}>
            <span className="pill">{L('Qoldi:')} {Math.ceil(left / 1000)} s</span>
            <span className="pill">{L('{0} qavat', [floors])}</span>
            <span className="pill">{L('{0} oltin', [b.linkers])}</span>
            {Number.isFinite(lim) && <span className={`pill ${shake > 0.6 ? 'bad' : ''}`}>{L('Jimlik: {0} / {1} s', [(silent / 1000).toFixed(1), lim / 1000])}</span>}
          </p>
          <p className="muted" style={{ minHeight: 48 }}>{live || L('Gapiring…')}</p>
          <button type="button" className="btn" onClick={() => endRef.current?.()}><Square size={14} />  {L('To‘xtatish')}</button>
        </section>
      )}

      {phase === 'over' && res && (
        <section className="card">
          <h3>{res.reachedGoal ? L('Minora qurildi! {0} qavat 🏛', [res.floors]) : L('{0} qavat — maqsadgacha {1} qoldi', [res.floors, Math.max(0, lv.goal - res.floors)])}</h3>
          <Tower floors={res.floors} gold={gold} goal={lv.goal} shake={0} falling={false} />
          <p className="row">
            <span className="pill">{res.words}  {L('so‘z')}</span><span className="pill">{L('{0} oltin g‘isht', [res.linkers])}</span><span className="pill">{L('{0} qavat quladi', [res.fallen])}</span><span className="pill">{res.wpm}  {L('so‘z/daqiqa')}</span><span className="pill">{score(res)}  {L('ball')}</span>
          </p>
          <p>{reaction(res, p.adult && p.roastLevel >= 2)}</p>
          {issues.length > 0 && (
            <>
              <h3>{L('Xatolar')}</h3>
              <ul>{issues.map((i) => <li key={i.id + i.wrong}><span className="bad">{i.wrong}</span> → <span className="ok">{i.right}</span> <span className="muted">{i.ruleUz}</span></li>)}</ul>
            </>
          )}
          <p className="row">
            <button type="button" className="btn primary" onClick={() => { setTopic(pickTopic(p.level)); setPhase('setup'); }}><RotateCcw size={14} />  {L('Yana qurish')}</button>
            <button type="button" className="btn" onClick={() => void share()}><Share2 size={14} />  {L('Natijani ulashish')}</button>
          </p>
          {msg && <p className="muted">{msg}</p>}
        </section>
      )}
    </div>
  );
}
