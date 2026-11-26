// Darsning o'yin qismlari: missiya, kashf etish kartalari, mini-o'yinlar, javob paneli, boss joni.
import { ArrowRight, CheckCircle2, Headphones, Lightbulb, Puzzle, Sparkles, Star, Swords, Target, Volume2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lesson, Unit } from '../content/lessons/types';
import { listenRound, pairsRound, reaction, type ListenItem, type PairsRound } from '../lib/lessonGame';
import { say, stopSpeaking } from '../lib/speech';
import { ClipButton } from './ClipButton';
import { useClip } from '../lib/useClip';
import { sfx } from '../lib/fx';
import { L } from '../i18n';

const playEn = (en: string, audio?: string) => { stopSpeaking(); if (audio) void new Audio(audio).play().catch(() => undefined); else void say(en, { cancelled: false }); };

/** Missiya: dars real vaziyatga bog'lanadi (task-based) — nima uchun o'rganilayotgani darhol ko'rinadi. */
export function MissionIntro({ unit, lesson, steps, onStart }: { unit: Unit; lesson: Lesson; steps: string[]; onStart: () => void }) {
  return (
    <section className="card mission">
      <p className="mission-say"><b>{L('Missiya:')}</b> {unit.situationUz}</p>
      <h2 style={{ margin: '12px 0 4px' }}><Target size={20} /> {lesson.titleUz}</h2>
      <p className="muted" style={{ margin: 0 }}>{lesson.objectiveUz}</p>
      <ol className="mission-steps">{steps.map((s, i) => <li key={s}><b>{i + 1}</b>{s}</li>)}</ol>
      <p className="mission-loot"><span><Star size={16} />{L('3 yulduzgacha')}</span><span><Sparkles size={16} />{L('XP ballari')}</span><span><Swords size={16} />{L('oxirida boss jang')}</span></p>
      <button className="btn primary block" onClick={onStart} autoFocus>{L('Missiyani boshlash')} <ArrowRight size={16} /></button>
    </section>
  );
}

type Card = { kind: 'examples' } | { kind: 'rule'; text: string; n: number } | { kind: 'table' } | { kind: 'media' } | { kind: 'vocab' } | { kind: 'pairs'; round: PairsRound } | { kind: 'listen'; items: ListenItem[] };

/** Kashf etish: avval misollar (qoidani o'zingiz sezing), keyin qoida bo'laklari, so'zlar va ikkita mini-o'yin. Har karta bittadan. */
export function DiscoverDeck({ lesson, onDone, onAddWords, wordsMsg }: { lesson: Lesson; onDone: () => void; onAddWords?: () => void; wordsMsg?: string }) {
  const cards = useMemo<Card[]>(() => {
    const c: Card[] = [];
    if (lesson.media?.length) c.push({ kind: 'media' });
    c.push({ kind: 'examples' });
    lesson.explanationUz.forEach((text, n) => c.push({ kind: 'rule', text, n }));
    if (lesson.table?.length) c.push({ kind: 'table' });
    if (lesson.vocab?.length) c.push({ kind: 'vocab' });
    const pr = pairsRound(lesson); if (pr) c.push({ kind: 'pairs', round: pr });
    const lr = listenRound(lesson); if (lr.length) c.push({ kind: 'listen', items: lr });
    return c;
  }, [lesson]);
  const [i, setI] = useState(0);
  const [gameDone, setGameDone] = useState<Record<number, boolean>>({});
  const ref = useRef<HTMLElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: 'nearest' }); }, [i]);
  const card = cards[i]!;
  const isGame = card.kind === 'pairs' || card.kind === 'listen';
  const canNext = !isGame || gameDone[i];
  const last = i === cards.length - 1;
  return (
    <section className="card deck" ref={ref}>
      <div className="deck-dots" aria-label={L('{0} / {1} karta', [i + 1, cards.length])}>{cards.map((_, k) => <i key={k} className={k < i ? 'done' : k === i ? 'now' : ''} />)}</div>
      <div className="deck-card" key={i}>
        {card.kind === 'media' && lesson.media!.map((m) => (
          <div key={m.url} className="lesson-media">
            {m.kind === 'video' ? <video src={m.url} controls preload="metadata" playsInline style={{ width: '100%', borderRadius: 12 }} /> : <audio src={m.url} controls preload="metadata" style={{ width: '100%' }} />}
            {m.transcript && <details className="fold"><summary>{L('Matni')}</summary><p style={{ whiteSpace: 'pre-line' }}>{m.transcript}</p></details>}
          </div>
        ))}
        {card.kind === 'examples' && (<>
          <h3><Lightbulb size={18} /> {L('Avval misollarga qarang')}</h3>
          <p className="muted">{L('Eshiting: qanday qonuniyat bor?')}</p>
          <ul className="ex-list">{lesson.examples.map((e) => (
            <li key={e.en}><ClipButton className="icon-btn" text={e.en} audio={e.audio} size={16} /><span><b>{e.en}</b><small className="muted">{e.uz}</small></span></li>
          ))}</ul>
        </>)}
        {card.kind === 'rule' && (<>
          <h3>{card.n === 0 ? L('Qoida — topdingizmi?') : L('Yana bir sir')}</h3>
          <p className="rule-text">{card.text}</p>
        </>)}
        {card.kind === 'table' && (<>
          <h3>{L('Shpargalka')}</h3>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>{lesson.table!.map((r) => <tr key={r.form}><td style={{ padding: '8px 6px', borderTop: '1px solid var(--line)' }}><b>{r.form}</b></td><td style={{ padding: '8px 6px', borderTop: '1px solid var(--line)' }}>{r.example}</td></tr>)}</tbody>
          </table>
        </>)}
        {card.kind === 'vocab' && (<>
          <h3>{L('Yangi so‘zlar')}</h3>
          <p className="muted">{L('Kartani bosing — tarjimasi ochiladi.')}</p>
          <div className="flip-grid">{lesson.vocab!.map((v) => <FlipCard key={v.en} front={v.en} back={v.uz} />)}</div>
          {onAddWords && <p className="row" style={{ marginTop: 10 }}><button type="button" className="btn sm" onClick={onAddWords}>{L('So‘zlarni takrorlashga qo‘shish')}</button>{wordsMsg && <span className="muted">{wordsMsg}</span>}</p>}
        </>)}
        {card.kind === 'pairs' && <PairsGame round={card.round} onDone={() => setGameDone((g) => ({ ...g, [i]: true }))} />}
        {card.kind === 'listen' && <ListenGame items={card.items} onDone={() => setGameDone((g) => ({ ...g, [i]: true }))} />}
      </div>
      <div className="row deck-nav">
        {i > 0 && <button className="btn" onClick={() => setI(i - 1)}>{L('Orqaga')}</button>}
        {!last && <button className="btn primary" disabled={!canNext} onClick={() => setI(i + 1)}>{L('Keyingi')} <ArrowRight size={14} /></button>}
        {last && <button className="btn primary" disabled={!canNext} onClick={onDone}>{L('Mashqqa o‘tish')} <ArrowRight size={14} /></button>}
      </div>
    </section>
  );
}

function FlipCard({ front, back }: { front: string; back: string }) {
  const [open, setOpen] = useState(false);
  return <button type="button" className={`flip ${open ? 'open' : ''}`} aria-pressed={open} onClick={() => { setOpen(!open); if (!open) playEn(front); }}><span>{open ? back : front}</span></button>;
}

/** Juftini top: inglizcha so'zni, keyin uning tarjimasini bosing. Xato juft — qizarib qaytadi. */
export function PairsGame({ round, onDone }: { round: PairsRound; onDone: () => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [bad, setBad] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const pickRight = (id: number) => {
    if (sel === null || done.has(id)) return;
    if (id === sel) {
      const n = new Set(done).add(id); setDone(n); setSel(null); sfx('ok');
      if (n.size === round.left.length) { sfx('ach'); onDone(); }
    } else { setBad(id); setMistakes((m) => m + 1); sfx('bad'); setTimeout(() => setBad(null), 450); }
  };
  const finished = done.size === round.left.length;
  return (
    <div>
      <h3><Puzzle size={18} /> {L('Juftini top')}</h3>
      <p className="muted">{finished ? L('Hammasi topildi! Xatolar: {0}', [mistakes]) : L('Inglizcha so‘zni, keyin uning tarjimasini bosing.')}</p>
      <div className="pairs">
        <div className="stack">{round.left.map((x) => <button key={x.id} type="button" className={`opt ${done.has(x.id) ? 'right' : sel === x.id ? 'sel' : ''}`} disabled={done.has(x.id)} onClick={() => { setSel(x.id); playEn(x.text); }}>{x.text}</button>)}</div>
        <div className="stack">{round.right.map((x) => <button key={x.id} type="button" className={`opt ${done.has(x.id) ? 'right' : bad === x.id ? 'bad shake' : ''}`} disabled={done.has(x.id) || sel === null} onClick={() => pickRight(x.id)}>{x.text}</button>)}</div>
      </div>
    </div>
  );
}

/** Eshit va tanla: gap ovozda o'qiladi (matni yashirin), ma'nosini tanlang. */
export function ListenGame({ items, onDone }: { items: ListenItem[]; onDone: () => void }) {
  const [k, setK] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const it = items[k];
  const clip = useClip(it?.en ?? '', it?.audio);
  useEffect(() => { if (it && clip) playEn(it.en, it.audio); }, [k, clip]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!it) return <div><h3><Headphones size={18} /> {L('Eshit va tanla')}</h3><p className="ok"><CheckCircle2 size={16} /> {L('{0} / {1} to‘g‘ri — quloq ishlayapti!', [score, items.length])}</p></div>;
  const answered = pick !== null;
  const choose = (o: number) => { if (answered) return; setPick(o); const ok = o === it.answer; if (ok) setScore((s) => s + 1); sfx(ok ? 'ok' : 'bad'); };
  const next = () => { const n = k + 1; setPick(null); setK(n); if (n >= items.length) onDone(); };
  return (
    <div>
      <h3><Headphones size={18} /> {L('Eshit va tanla')} <small className="muted">{k + 1}/{items.length}</small></h3>
      {clip === false
        ? <p className="listen-script"><b>«{it.en}»</b></p> /* ovozi hali tayyor emas — jim o'yin o'rniga matn o'qiladi */
        : <button type="button" className="btn listen-btn" style={clip ? undefined : { visibility: 'hidden' }} onClick={() => playEn(it.en, it.audio)}><Volume2 size={18} /> {L('Yana eshitish')}</button>}
      <div className="stack" style={{ marginTop: 10 }}>
        {it.options.map((o, i) => <button key={o} type="button" className={`opt ${answered ? (i === it.answer ? 'right' : i === pick ? 'bad' : '') : ''}`} disabled={answered} onClick={() => choose(i)}>{o}</button>)}
      </div>
      {answered && <p style={{ marginTop: 8 }}><span className="muted">«{it.en}»</span> <button className="btn sm primary" onClick={next}>{k + 1 < items.length ? L('Keyingi') : L('Tayyor')}</button></p>}
    </div>
  );
}

/** Javobdan keyingi panel: rang, Sellzen reaksiyasi, to'g'ri javob va izoh, "Davom etish". */
export function FeedbackSheet({ ok, n, answer, explain, onNext, xp, sentence }: { ok: boolean; n: number; answer: string; explain: string; onNext: () => void; xp?: number; sentence?: string | null }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus({ preventScroll: true }); btn.current?.scrollIntoView({ block: 'nearest' }); }, []);
  return (
    <div className={`fb-sheet ${ok ? 'ok' : 'bad'}`} role="status">
      <div className="fb-head">{ok ? <CheckCircle2 size={22} /> : <XCircle size={22} />}<b>{reaction(ok, n)}</b>{ok && xp ? <span className="xp-pop">+{xp}  {L('XP ballari')}</span> : null}</div>
      {!ok && !sentence && <p className="fb-answer">{L('To‘g‘ri javob:')} <b>{answer}</b></p>}
      {sentence && <p className="fb-answer fb-sentence"><ClipButton className="icon-btn sm" text={sentence} size={15} /><b>{sentence}</b></p>}
      <p className="fb-explain">{explain}</p>
      <button ref={btn} className={`btn block ${ok ? 'primary' : 'danger'}`} onClick={onNext}>{L('Davom etish')} <ArrowRight size={14} /></button>
    </div>
  );
}

/** Boss joni: yakuniy tekshiruvda har to'g'ri javob — zarba. */
export function BossBar({ hp, label }: { hp: number; label: string }) {
  return (
    <div className="boss-bar" role="img" aria-label={L('Boss joni {0}%', [hp])}>
      <Swords size={18} /><span className="boss-name">{label}</span>
      <div className="boss-track"><i style={{ width: `${hp}%` }} /></div><b>{hp}%</b>
    </div>
  );
}
