import { Mic, RotateCcw, Share2, Square } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { LEVELS, ROUND_MS, START_GRACE_MS, danger, levelOf, pickTopic, reaction, result, score, type ChallengeLevel, type RoundResult } from '../lib/silenceGame';
import { listenTurn, say, SpeechError, stopSpeaking, sttSupported, ttsSupported } from '../lib/speech';
import { findIssues } from '../lib/grammarCheck';
import { addMistake } from '../lib/mistakes';
import { renderCard, shareCard } from '../lib/shareCard';
import { addXp, useProfile } from '../lib/store';
import { Illo } from '../components/Illo';

type Phase = 'setup' | 'playing' | 'over';

/** "Jim qolma!" — keep talking; a balloon inflates while you are silent and pops at the level's limit. */
export default function Challenge() {
  const p = useProfile();
  const [level, setLevelState] = useState<ChallengeLevel>(() => { try { const v = localStorage.getItem('bandly.challenge.level'); return (LEVELS.some((l) => l.id === v) ? v : 'easy') as ChallengeLevel; } catch { return 'easy'; } });
  const setLevel = (l: ChallengeLevel) => { setLevelState(l); try { localStorage.setItem('bandly.challenge.level', l); } catch { /* ignore */ } };
  const [phase, setPhase] = useState<Phase>('setup');
  const [topic, setTopic] = useState(() => pickTopic(p.level));
  const [live, setLive] = useState('');
  const [now, setNow] = useState(Date.now());
  const [res, setRes] = useState<RoundResult | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const startAt = useRef(0);
  const lastVoice = useRef(0);
  const endRef = useRef<(() => void) | null>(null);
  const sig = useRef({ cancelled: false });
  const stt = typeof window !== 'undefined' && sttSupported();
  const lim = levelOf(level).silenceMs;

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(t);
  }, [phase]);
  useEffect(() => () => { sig.current.cancelled = true; stopSpeaking(); }, []);

  const play = async () => {
    setErr(''); setLive(''); setRes(null); setMsg('');
    if (ttsSupported()) { try { await say(topic.en, { cancelled: false }, 'en-GB'); } catch { /* reading the topic aloud is optional */ } }
    sig.current = { cancelled: false };
    startAt.current = Date.now(); lastVoice.current = Date.now() + START_GRACE_MS; setNow(Date.now()); setPhase('playing');
    try {
      const r = await listenTurn({
        silenceMs: Number.isFinite(lim) ? lim : ROUND_MS * 2,
        noSpeechMs: Number.isFinite(lim) ? lim + START_GRACE_MS : ROUND_MS * 2,
        maxMs: ROUND_MS, lang: 'en-US', signal: sig.current, endRef,
        onInterim: (t) => { setLive(t); lastVoice.current = Date.now(); },
        onStatus: (s) => { if (s === 'speech') lastVoice.current = Date.now(); },
      });
      const rr = result(level, Date.now() - startAt.current, r.text);
      setRes(rr); setPhase('over');
      addXp(Math.min(40, Math.round(score(rr) / 5)));
      for (const i of findIssues(r.text)) { try { addMistake('coach', { kind: 'fix', wrong: i.wrong, right: i.right, whyUz: i.ruleUz }, []); } catch { /* skip */ } }
    } catch (e) {
      const code = e instanceof SpeechError ? e.code : 'unstable';
      setErr(code === 'denied' ? 'Mikrofonga ruxsat berilmagan.' : code === 'nomic' ? 'Mikrofon topilmadi.' : code === 'network' ? 'Nutqni tanish uchun internet kerak.' : 'Nutqni tanish to‘xtab qoldi. Qayta urinib ko‘ring.');
      setPhase('setup');
    }
  };

  const silent = phase === 'playing' ? Math.max(0, now - lastVoice.current) : 0;
  const d = danger(silent, lim);
  const left = phase === 'playing' ? Math.max(0, ROUND_MS - (now - startAt.current)) : ROUND_MS;
  const issues = res ? findIssues(live) : [];

  const share = async () => {
    if (!res) return;
    const blob = await renderCard({ title: `Jim qolma! · ${levelOf(res.level).labelUz}`, body: res.survived ? `${Math.round(res.ms / 1000)} soniya to‘xtamay gapirdim!` : `${Math.round(res.ms / 1000)} soniyada jim qoldim…`, sub: `${res.words} so‘z · ${res.wpm} so‘z/daqiqa · ${score(res)} ball`, foot: 'Bandly — sen ham sinab ko‘r' });
    if (!blob) return;
    const r = await shareCard(blob, 'bandly-jim-qolma', `Jim qolma! — ${score(res)} ball. ${location.origin}/#/challenge`);
    setMsg(r === 'shared' ? 'Ulashildi' : 'Rasm yuklab olindi');
  };

  return (
    <div>
      {phase === 'setup' && (
        <section className="card page-head with-illo t-peach challenge-start">
          <h1 style={{ margin: 0, fontSize: 'clamp(24px, 3.4vw, 34px)', lineHeight: 1.08 }}>Jim qolma!</h1>
          <p style={{ margin: '4px 0 14px' }}>{ROUND_MS / 1000} soniya to‘xtamay gapiring.</p>
          <Illo kind="mic" size={124} />
          <div className="topic-card">
            <small>Mavzu</small>
            <b>{topic.en}</b>
            <span>{topic.uz}</span>
            <button type="button" className="icon-btn sm" onClick={() => setTopic(pickTopic(p.level))} aria-label="Boshqa mavzu"><RotateCcw size={16} /></button>
          </div>
          <div className="seg" role="group" aria-label="Daraja" style={{ margin: '12px 0' }}>{LEVELS.map((l) => <button key={l.id} type="button" className={level === l.id ? 'on' : ''} onClick={() => setLevel(l.id)}>{l.labelUz.split(/ ·| \(/)[0]}</button>)}</div>
          <div><button type="button" className="btn primary lg" disabled={!stt} onClick={() => void play()}><Mic size={18} /> Boshlash</button></div>
          {!stt && <p className="bad">Bu brauzerda mikrofon ishlamaydi — Chrome’da oching.</p>}
          {err && <p className="bad">{err}</p>}
        </section>
      )}

      {phase === 'playing' && (
        <section className="card" style={{ textAlign: 'center' }}>
          <p><b>{topic.en}</b></p>
          <div aria-hidden="true" style={{ margin: '18px auto', width: 60 + d * 160, height: 60 + d * 160, borderRadius: '50%', background: `hsl(${130 - d * 130} 75% 55%)`, transition: 'width .1s, height .1s, background .1s', boxShadow: d > 0.75 ? '0 0 30px rgba(229,55,43,.6)' : 'none' }} />
          <p aria-live="polite" className="row" style={{ justifyContent: 'center' }}>
            <span className="pill">Qoldi: {Math.ceil(left / 1000)} s</span>
            <span className="pill">{Number.isFinite(lim) ? `Jimlik: ${(silent / 1000).toFixed(1)} / ${(lim / 1000).toFixed(1)} s` : 'Bosimsiz rejim'}</span>
          </p>
          <p className="muted" style={{ minHeight: 48 }}>{live || 'Gapiring…'}</p>
          <button type="button" className="btn" onClick={() => endRef.current?.()}><Square size={14} /> To‘xtatish</button>
        </section>
      )}

      {phase === 'over' && res && (
        <section className="card">
          <h3>{res.survived ? (res.level === 'relaxed' ? 'Raund tugadi' : 'Omon qoldingiz! 🎈') : 'Shar yorildi! 💥'}</h3>
          <p className="row">
            <span className="pill">{Math.round(res.ms / 1000)} s</span><span className="pill">{res.words} so‘z</span><span className="pill">{res.wpm} so‘z/daqiqa</span><span className="pill">{score(res)} ball</span>
          </p>
          <p>{reaction(res, p.adult && p.roastLevel >= 2)}</p>
          {issues.length > 0 && (
            <>
              <h3>Xatolar</h3>
              <ul>{issues.map((i) => <li key={i.id + i.wrong}><span className="bad">{i.wrong}</span> → <span className="ok">{i.right}</span> <span className="muted">{i.ruleUz}</span></li>)}</ul>
            </>
          )}
          <p className="row">
            <button type="button" className="btn primary" onClick={() => { setTopic(pickTopic(p.level)); setPhase('setup'); }}><RotateCcw size={14} /> Yana</button>
            <button type="button" className="btn" onClick={() => void share()}><Share2 size={14} /> Natijani ulashish</button>
          </p>
          {msg && <p className="muted">{msg}</p>}
        </section>
      )}
    </div>
  );
}
