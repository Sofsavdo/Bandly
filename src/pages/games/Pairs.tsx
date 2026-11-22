import type { Mood } from '../../components/Mascot';
import { useEffect, useRef, useState } from 'react';
import { Illo } from '../../components/Illo';
import { vocabById, vocabForLevel } from '../../content/vocab';
import { LockCard } from '../../components/Gate';
import { fmt } from '../../components/hooks';
import { pickSession } from '../../lib/srs';
import { addXp, consumeGame, getProfile, recordReview } from '../../lib/store';
import { distinctWords, shuffle } from '../../lib/vocabGame';
import { recordWordItem } from '../../lib/adaptive/record';
import { L } from '../../i18n';

export default function Pairs() {
  const [phase, setPhase] = useState<'intro' | 'play' | 'end'>('intro');
  const [words, setWords] = useState<string[]>([]);
  const [rightOrder, setRightOrder] = useState<string[]>([]);
  const [selL, setSelL] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState<Record<string, number>>({});
  const [elapsed, setElapsed] = useState(0);
  const [earned, setEarned] = useState(0);
  const [mood, setMood] = useState<Mood>('idle');
  const [locked, setLocked] = useState(false);
  const mistakesRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  function start() {
    if (!consumeGame()) { setLocked(true); return; }
    const ids = distinctWords(pickSession(vocabForLevel(getProfile().level).map((w) => w.id), getProfile().srs, Date.now(), 14), vocabById, 6); // bir xil ma'noli so'zlar bir turda chiqmasin
    setWords(ids);
    setRightOrder(shuffle(ids));
    setSelL(null); setMatched([]); setMistakes({}); mistakesRef.current = {}; setElapsed(0); setMood('idle');
    setPhase('play');
  }

  function pickRight(id: string) {
    if (!selL || matched.includes(id)) return;
    if (id === selL) {
      recordReview(id, !mistakesRef.current[id]);
      recordWordItem(id, !mistakesRef.current[id]);
      const next = [...matched, id];
      setMatched(next);
      setSelL(null);
      setMood('happy');
      if (next.length === words.length) {
        const total = Object.values(mistakesRef.current).reduce((a, b) => a + b, 0);
        const xp = Math.max(10, 40 - total * 4 - Math.floor(elapsed / 10) * 2);
        setEarned(xp);
        addXp(xp);
        setPhase('end');
      }
    } else {
      mistakesRef.current = { ...mistakesRef.current, [selL]: (mistakesRef.current[selL] ?? 0) + 1 };
      setMistakes(mistakesRef.current);
      setWrongFlash(id);
      setMood('sad');
      setTimeout(() => setWrongFlash(null), 400);
      setSelL(null);
    }
  }

  if (locked) return <LockCard track="exam" reason="Bugungi bepul o‘yinlar tugadi. Istalgan obuna bilan o‘yinlar cheksiz." />;

  if (phase === 'intro') {
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Illo kind="star" size={96} /></div>
        <h2>{L('Juftlik')}</h2>
        <p>{L('So‘z va ma’noni juftlang.')}</p>
        <button className="btn primary" onClick={start}>{L('Boshlash')}</button>
      </div>
    );
  }

  if (phase === 'end') {
    const total = Object.values(mistakes).reduce((a, b) => a + b, 0);
    return (
      <div className="card" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}><Illo kind="star" size={96} /></div>
        <h2>{L('Hammasi topildi!')}</h2>
        <p>{L('Vaqt:')} {fmt(elapsed)}  {L('· Xatolar:')} {total} · <b>+{earned}  {L('XP')}</b></p>
        <div className="row" style={{ justifyContent: 'center' }}>
          <button className="btn primary" onClick={start}>{L('Yana o‘ynash')}</button>
          <a className="btn" href="#/games">{L('O‘yinlar')}</a>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="timer">{fmt(elapsed)}</span>
        <span className="pill">{matched.length} / {words.length}</span>
      </div>
      <div className="pairs" style={{ marginTop: 10 }}>
        <div style={{ display: 'grid', gap: 10 }}>
          {words.map((id) => (
            <button key={id} className={`opt ${matched.includes(id) ? 'done' : selL === id ? 'sel' : ''}`} onClick={() => setSelL(id)}>{vocabById[id].word}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {rightOrder.map((id) => (
            <button key={id} className={`opt ${matched.includes(id) ? 'done' : wrongFlash === id ? 'bad' : ''}`} onClick={() => pickRight(id)}>{vocabById[id].uz}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
