import { Check, Flame, Lock, MapPin, Play, RotateCcw, Star, Trophy, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { UNITS, lessonNodeId } from '../content/lessons';
import type { Lesson, Unit } from '../content/lessons/types';
import { stateOf } from '../lib/adaptive/mastery';
import { loadAdaptive } from '../lib/adaptive/store';
import { levelProgress } from '../lib/game';
import { nodeState, type NodeState } from '../lib/gamify';
import { isUnlocked, type ProgressMap } from '../lib/lessons';
import { useProfile } from '../lib/store';
import { Prop, ZONES, type PropKind, type ZoneTheme } from './mapArt';

const LEVEL_NAME: Record<string, string> = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper-intermediate', C1: 'Advanced', C2: 'Proficiency' };
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const STATE_UZ: Record<NodeState, string> = { locked: 'yopiq', open: 'ochiq', current: 'hozirgi dars', passed: 'tugallangan', mastered: 'to‘liq o‘zlashtirilgan', revise: 'takrorlash vaqti keldi' };

// Geometriya: viewBox kengligi 400; x foizda, y pikselda (HTML tugunlar va SVG yo'l bir xil koordinatada).
const STEP = 128, TOP = 196, BOTTOM = 100, UNIT_GAP = 60;
const XS = [50, 27, 50, 73];

type Item =
  | { kind: 'lesson'; unit: Unit; lesson: Lesson; index: number; state: NodeState; stars: number; x: number; y: number }
  | { kind: 'trophy'; unit: Unit; done: boolean; x: number; y: number };

interface Sel { unit: Unit; lesson: Lesson; index: number; state: NodeState }

const starsFor = (best: number, passed: boolean): number => (!passed ? 0 : best >= 1 ? 3 : best >= 0.9 ? 2 : 1);

/** Ikki nuqta orasidagi silliq egri chiziq (vertikal urinmalar). */
function pathD(pts: { x: number; y: number }[]): string {
  if (!pts.length) return '';
  const X = (p: { x: number }) => (p.x / 100) * 400;
  let d = `M ${X(pts[0]!)} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]!, b = pts[i]!;
    const my = (a.y + b.y) / 2;
    d += ` C ${X(a)} ${my}, ${X(b)} ${my}, ${X(b)} ${b.y}`;
  }
  return d;
}

function Zone({ lv, progress, currentId, level, onPick, curRef }: { lv: string; progress: ProgressMap; currentId: string | null; level: string | null; onPick: (s: Sel) => void; curRef: React.MutableRefObject<HTMLButtonElement | null> }) {
  const t: ZoneTheme = ZONES[lv]!;
  const saved = loadAdaptive();
  const now = Date.now();
  const units = UNITS.filter((u) => u.level === lv);
  const items: Item[] = [];
  let y = TOP, k = 0;
  units.forEach((u, ui) => {
    if (ui > 0) y += UNIT_GAP;
    u.lessons.forEach((l, i) => {
      const pr = progress[l.id];
      const rec = saved.mastery[lessonNodeId(l.id)];
      const state = nodeState(isUnlocked(u, i, progress), !!pr?.passedAt, l.id === currentId, rec ? stateOf(rec, now) : null);
      items.push({ kind: 'lesson', unit: u, lesson: l, index: i, state, stars: starsFor(pr?.best ?? 0, !!pr?.passedAt), x: XS[k % 4]!, y });
      y += STEP; k++;
    });
    items.push({ kind: 'trophy', unit: u, done: u.lessons.every((l) => progress[l.id]?.passedAt), x: XS[k % 4]!, y });
    y += STEP; k++;
  });
  const H = y - STEP + BOTTOM;
  const lessons = items.filter((x): x is Extract<Item, { kind: 'lesson' }> => x.kind === 'lesson');
  const passedN = lessons.filter((x) => x.state === 'passed' || x.state === 'mastered' || x.state === 'revise').length;
  const reached = items.reduce((last, it, i) => ((it.kind === 'lesson' && it.state !== 'locked' && it.state !== 'open') || (it.kind === 'trophy' && it.done) ? i : last), -1);
  const assumed = !!level && ORDER.indexOf(lv) < ORDER.indexOf(level);
  const pct = lessons.length ? passedN / lessons.length : 0;
  const R = 22, C = 2 * Math.PI * R;
  // Dekoratsiyalar: har bir tugunning qarama-qarshi tomonida, zona mavzusiga qarab almashadi
  const SMALL: Record<string, PropKind> = { A1: 'bush', A2: 'tree', B1: 'tree', B2: 'pine', C1: 'stars', C2: 'stars' };
  const props = [
    ...items.map((it, i) => ({ kind: t.props[i % t.props.length]!, left: it.x <= 50 ? 80 + ((i * 7) % 9) : 6 + ((i * 5) % 8), top: it.y - 50 + ((i * 13) % 22), size: 58 + ((i * 11) % 20) })),
    // ikkinchi qatlam: kichik dekoratsiyalar tugunlar orasida (yo'ldan uzoqroq chetda)
    ...items.slice(0, -1).map((it, i) => ({ kind: i % 3 === 2 ? ('cloud' as PropKind) : SMALL[lv]!, left: it.x <= 50 ? 10 + ((i * 3) % 6) : 88 - ((i * 4) % 6), top: it.y + STEP / 2 - 18, size: 34 + ((i * 7) % 10) })),
  ];

  return (
    <section className={`zone lv-${lv}${t.night ? ' night' : ''}`} style={{ '--za': t.accent, '--zad': t.accentDark, height: H } as CSSProperties} aria-labelledby={`zone-${lv}`}>
      <div className="zone-bg" style={{ background: `linear-gradient(180deg, ${t.sky[0]}, ${t.sky[1]})` }} aria-hidden="true">
        <svg className="zone-hills" viewBox={`0 0 400 ${H}`} preserveAspectRatio="none">
          {Array.from({ length: Math.ceil(H / 300) }, (_, i) => {
            const by = 140 + i * 300;
            return <g key={i}>
              <path d={`M0 ${by + 60} Q 80 ${by} 170 ${by + 40} T 400 ${by + 20} V ${H} H 0 Z`} fill={t.hill[0]} opacity=".35" />
              <path d={`M0 ${by + 150} Q 120 ${by + 100} 230 ${by + 140} T 400 ${by + 120} V ${H} H 0 Z`} fill={t.hill[1]} opacity=".22" />
            </g>;
          })}
          <path d={pathD(items)} fill="none" stroke={t.roadEdge} strokeWidth="40" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={pathD(items)} fill="none" stroke={t.road} strokeWidth="32" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {reached > 0 && <path d={pathD(items.slice(0, reached + 1))} fill="none" stroke={t.accent} strokeWidth="10" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity=".9" />}
          <path d={pathD(items)} fill="none" stroke={t.night ? '#ffffff' : t.roadEdge} strokeOpacity={t.night ? 0.35 : 1} strokeWidth="3" strokeDasharray="2 14" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {props.map((p, i) => <div key={i} className="zone-prop" style={{ left: `${p.left}%`, top: p.top }}><Prop kind={p.kind} t={t} size={p.size} /></div>)}
      </div>

      <header className="zone-banner">
        <div className="zone-badge" aria-hidden="true">{lv}</div>
        <div className="grow">
          <h3 id={`zone-${lv}`}>{t.name} <span>· {LEVEL_NAME[lv]}</span></h3>
          <p>{t.sub}{assumed ? ' · o‘tilgan deb hisoblangan' : ''}{level === lv ? ' · sizning darajangiz' : ''}</p>
        </div>
        <svg className="zone-ring" viewBox="0 0 56 56" aria-label={`${passedN} / ${lessons.length} dars`} role="img">
          <circle cx="28" cy="28" r={R} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="6" />
          <circle cx="28" cy="28" r={R} fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 28 28)" />
          <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">{passedN}/{lessons.length}</text>
        </svg>
      </header>

      <ol className="zone-nodes" aria-label={`${lv} darslari`}>
        {items.map((it) => {
          if (it.kind === 'trophy') {
            return (
              <li key={`t-${it.unit.id}`} className="zn trophy-wrap" style={{ left: `${it.x}%`, top: it.y }}>
                <div className={`trophy ${it.done ? 'done' : ''}`} role="img" aria-label={`${it.unit.titleUz} bo‘limi ${it.done ? 'yakunlangan' : 'hali yakunlanmagan'}`}><Trophy size={24} /></div>
                <span className="zn-label">{it.unit.titleUz}</span>
              </li>
            );
          }
          const showSign = it.index === 0;
          const Icon = it.state === 'locked' ? Lock : it.state === 'mastered' ? Star : it.state === 'passed' ? Check : it.state === 'revise' ? RotateCcw : it.state === 'current' ? Play : null;
          return (
            <li key={it.lesson.id} className="zn" style={{ left: `${it.x}%`, top: it.y }}>
              {showSign && <span className="unit-sign" style={{ ['--dx' as string]: it.x < 50 ? '30px' : it.x > 50 ? '-30px' : '0px' }}>{it.unit.titleUz}</span>}
              {it.state === 'current' && <span className={`you-pin${it.x > 50 ? ' left' : ''}`}><MapPin size={14} /> Siz shu yerdasiz</span>}
              <button type="button" ref={it.state === 'current' ? curRef : undefined} className={`coin ${it.state}`}
                onClick={() => onPick({ unit: it.unit, lesson: it.lesson, index: it.index, state: it.state })}
                aria-label={`${it.index + 1}-dars: ${it.lesson.titleUz}, ${STATE_UZ[it.state]}${it.stars ? `, ${it.stars} yulduz` : ''}`}>
                <span className="coin-face">{Icon ? <Icon size={it.state === 'current' ? 30 : 24} strokeWidth={2.6} /> : <span className="num">{it.index + 1}</span>}</span>
              </button>
              {it.stars > 0 && <span className="zn-stars" aria-hidden="true">{[1, 2, 3].map((s) => <Star key={s} size={13} className={s <= it.stars ? 'on' : ''} />)}</span>}
              <span className={`zn-label${it.state === 'locked' ? ' dim' : ''}`}>{it.lesson.titleUz}</span>
            </li>
          );
        })}
      </ol>
      <a className="zone-gate" href="#/skills" style={{ top: H - 52 }}><Flag2 /> {lv} darajasini tekshirish</a>
    </section>
  );
}
function Flag2() { return <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21V4h11l-2 4 2 4H5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" /></svg>; }

/** General English o'quv xaritasi (GAMIFIED_LEARNING_SPEC.md §2). Ochilish qoidasi isUnlocked() bilan bir xil. */
export function LearningMap({ progress, level, currentId }: { progress: ProgressMap; level: string | null; currentId: string | null }) {
  const p = useProfile();
  const [sel, setSel] = useState<Sel | null>(null);
  const curRef = useRef<HTMLButtonElement | null>(null);
  const levels = ORDER.filter((l) => UNITS.some((u) => u.level === l));
  const lp = levelProgress(p.xp);
  const today = p.dailyXp;

  // Ilova sahifa almashganda tepaga qaytaradi — undan keyin hozirgi tugunga o'tamiz
  useEffect(() => { const t = setTimeout(() => curRef.current?.scrollIntoView({ block: 'center' }), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!sel) return;
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [sel]);

  return (
    <div className="lmap2">
      <div className="map-hud card">
        <div className="hud-lvl">
          <span className="hud-badge">L{lp.level}</span>
          <div className="grow">
            <b>Bandly darajasi {lp.level}</b>
            <div className="hud-bar" aria-label={`${lp.into} / ${lp.span} XP`}><i style={{ width: `${Math.round(lp.pct * 100)}%` }} /></div>
            <span className="muted">{lp.into} / {lp.span} XP · ingliz tili: {level ?? 'aniqlanmagan'}</span>
          </div>
        </div>
        <div className="hud-chips">
          <span className="chip-stat"><Flame size={16} /> {p.streak} kun</span>
          <span className="chip-stat"><Star size={16} /> {today}/{p.dailyGoal} XP</span>
        </div>
      </div>

      {levels.map((lv) => <Zone key={lv} lv={lv} progress={progress} currentId={currentId} level={level} onPick={setSel} curRef={curRef} />)}

      {currentId && <a className="map-fab" href={`#/learn/${currentId}`}><Play size={18} /> Davom ettirish</a>}

      {sel && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setSel(null)}>
          <div className={`sheet card lv-${sel.unit.level}`} role="dialog" aria-modal="true" aria-labelledby="node-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="icon-btn sm sheet-x" onClick={() => setSel(null)} aria-label="Yopish"><X size={16} /></button>
            <div className="sheet-head">
              <span className={`coin mini ${sel.state}`} aria-hidden="true"><span className="coin-face">{sel.index + 1}</span></span>
              <div>
                <p className="sheet-eyebrow">{sel.unit.level} · {ZONES[sel.unit.level]?.name} · {sel.unit.titleUz}</p>
                <h3 id="node-title">{sel.lesson.titleUz}</h3>
              </div>
            </div>
            <p>{sel.lesson.objectiveUz}</p>
            <div className="sheet-stats">
              <div><b>{sel.lesson.minutes}</b><span>daqiqa</span></div>
              <div><b>~{sel.lesson.check.length * 3 + 15}</b><span>XP</span></div>
              <div><b>5</b><span>jon</span></div>
              <div><b>{progress[sel.lesson.id] ? `${Math.round(progress[sel.lesson.id]!.best * 100)}%` : '—'}</b><span>eng yaxshi</span></div>
            </div>
            {sel.state === 'locked'
              ? <p className="notice">Bu dars avvalgi darsdan o‘tganingizdan keyin ochiladi.</p>
              : <a className="btn primary block" href={`#/learn/${sel.lesson.id}`} autoFocus><Play size={16} /> {sel.state === 'passed' || sel.state === 'mastered' ? 'Takrorlash' : sel.state === 'revise' ? 'Takrorlashni boshlash' : 'Boshlash'}</a>}
          </div>
        </div>
      )}
    </div>
  );
}
