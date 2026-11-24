import { lessonStars } from '../lib/lessonGame';
import { Check, Flame, Lock, Play, RotateCcw, Star, Swords, Trophy, X } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { UNITS, lessonNodeId } from '../content/lessons';
import type { Lesson, Unit } from '../content/lessons/types';
import { stateOf } from '../lib/adaptive/mastery';
import { loadAdaptive } from '../lib/adaptive/store';
import { levelProgress, dayKey, displayStreak } from '../lib/game';
import { nodeState, type NodeState } from '../lib/gamify';
import { isUnlocked, type ProgressMap } from '../lib/lessons';
import { loadBoss } from '../lib/boss';
import { useProfile } from '../lib/store';
import { ZONES, ZONE_ILLO, type ZoneTheme } from './mapArt';
import { Illo } from './Illo';
import { L } from '../i18n';

const LEVEL_NAME: Record<string, string> = { A1: L('Beginner'), A2: L('Elementary'), B1: L('Intermediate'), B2: L('Upper-intermediate'), C1: L('Advanced'), C2: L('Proficiency') };
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const STATE_UZ: Record<NodeState, string> = { locked: L('yopiq'), open: L('ochiq'), current: L('hozirgi dars'), passed: L('tugallangan'), mastered: L('to‘liq o‘zlashtirilgan'), revise: L('takrorlash vaqti keldi') };

// Geometriya: viewBox kengligi 400; x foizda, y pikselda (HTML tugunlar va SVG yo'l bir xil koordinatada).
const STEP = 128, TOP = 236, BOTTOM = 150, UNIT_GAP = 60;
const XS = [50, 27, 50, 73];

type Item =
  | { kind: 'lesson'; unit: Unit; lesson: Lesson; index: number; state: NodeState; stars: number; x: number; y: number }
  | { kind: 'trophy'; unit: Unit; done: boolean; won: boolean; x: number; y: number };

interface Sel { unit: Unit; lesson: Lesson; index: number; state: NodeState }

const starsFor = lessonStars;

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
  const bosses = loadBoss();
  const now = Date.now();
  const units = UNITS.filter((u) => u.level === lv);
  const items: Item[] = [];
  let y = TOP, k = 0;
  units.forEach((u, ui) => {
    if (ui > 0) y += UNIT_GAP;
    u.lessons.forEach((l, i) => {
      const pr = progress[l.id];
      const rec = saved.mastery[lessonNodeId(l.id)];
      const state = nodeState(isUnlocked(u, i, progress, { units: UNITS, level }), !!pr?.passedAt, l.id === currentId, rec ? stateOf(rec, now) : null);
      items.push({ kind: 'lesson', unit: u, lesson: l, index: i, state, stars: starsFor(pr?.best ?? 0, !!pr?.passedAt), x: XS[k % 4]!, y });
      y += STEP; k++;
    });
    items.push({ kind: 'trophy', unit: u, done: u.lessons.every((l) => progress[l.id]?.passedAt), won: !!bosses[u.id]?.passedAt, x: XS[k % 4]!, y });
    y += STEP; k++;
  });
  const H = y - STEP + BOTTOM;
  // Yo'l pastdan tepaga ko'tariladi: birinchi dars zonaning pastida, oxirgisi (boss) tepada
  const lastY = y - STEP;
  for (const it of items) it.y = TOP + lastY - it.y;
  const lessons = items.filter((x): x is Extract<Item, { kind: 'lesson' }> => x.kind === 'lesson');
  const passedN = lessons.filter((x) => x.state === 'passed' || x.state === 'mastered' || x.state === 'revise').length;
  const reached = items.reduce((last, it, i) => ((it.kind === 'lesson' && it.state !== 'locked' && it.state !== 'open') || (it.kind === 'trophy' && it.done) ? i : last), -1);
  const assumed = !!level && ORDER.indexOf(lv) < ORDER.indexOf(level);
  const pct = lessons.length ? passedN / lessons.length : 0;
  const R = 22, C = 2 * Math.PI * R;
  // Bezaklar: har ikkinchi tugunning qarama-qarshi tomonida bitta 3.0 tasvir (siyrak — yo'lni to'smaydi)
  const kinds = ZONE_ILLO[lv]!;
  const props = items.filter((_, i) => i % 2 === 1).map((it, i) => ({ kind: kinds[i % kinds.length]!, left: it.x <= 50 ? 84 : 16, top: it.y - 44, size: 76 + ((i * 11) % 16), tilt: ((i * 37) % 17) - 8 }));
  const blobs = Array.from({ length: Math.ceil(H / 420) }, (_, i) => ({ top: 120 + i * 420, left: i % 2 ? 78 : 18, c: i % 2 ? t.hill[1] : t.hill[0] }));

  return (
    <section className={`zone lv-${lv}${t.night ? ' night' : ''}`} style={{ '--za': t.accent, '--zad': t.accentDark, height: H } as CSSProperties} aria-labelledby={`zone-${lv}`}>
      <div className="zone-bg" style={{ background: `linear-gradient(180deg, ${t.sky[0]}, ${t.sky[1]})` }} aria-hidden="true">
        {blobs.map((g, i) => <span key={i} className="zone-blob" style={{ top: g.top, left: `${g.left}%`, background: g.c }} />)}
        <svg className="zone-hills" viewBox={`0 0 400 ${H}`} preserveAspectRatio="none">
          <path d={pathD(items)} fill="none" stroke={t.night ? 'rgba(0,0,0,.35)' : 'rgba(20,22,43,.07)'} strokeWidth="30" strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="translate(0 6)" />
          <path d={pathD(items)} fill="none" stroke={t.road} strokeWidth="26" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          {reached > 0 && <path d={pathD(items.slice(0, reached + 1))} fill="none" stroke={t.accent} strokeWidth="8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          <path d={pathD(items)} fill="none" stroke={t.roadEdge} strokeWidth="3" strokeDasharray="1 12" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        {props.map((p, i) => <div key={i} className="zone-prop" style={{ left: `${p.left}%`, top: p.top, transform: `translateX(-50%) rotate(${p.tilt}deg)` }}><Illo kind={p.kind} size={p.size} /></div>)}
      </div>

      <header className="zone-banner">
        <div className="zone-badge" aria-hidden="true">{lv}</div>
        <div className="grow">
          <h3 id={`zone-${lv}`}>{t.name} <span>· {LEVEL_NAME[lv]}</span></h3>
          <p>{t.sub}{assumed ? L(' · o‘tilgan deb hisoblangan') : ''}{level === lv ? L(' · sizning darajangiz') : ''}</p>
        </div>
        <svg className="zone-ring" viewBox="0 0 56 56" aria-label={L('{0} / {1} dars', [passedN, lessons.length])} role="img">
          <circle cx="28" cy="28" r={R} fill="none" stroke="currentColor" strokeOpacity=".15" strokeWidth="6" />
          <circle cx="28" cy="28" r={R} fill="none" stroke={t.accent} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 28 28)" />
          <text x="28" y="32" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">{passedN}/{lessons.length}</text>
        </svg>
      </header>

      <ol className="zone-nodes" aria-label={L('{0} darslari', [lv])}>
        {items.map((it) => {
          if (it.kind === 'trophy') {
            return (
              <li key={`t-${it.unit.id}`} className="zn trophy-wrap" style={{ left: `${it.x}%`, top: it.y }}>
                {it.done
                  ? <a className={`trophy boss ${it.won ? 'done' : 'ready'}`} href={`#/boss/${it.unit.id}`} aria-label={`${it.unit.titleUz}: boss sinovi${it.won ? ' — yutilgan' : L(' — ochiq')}`}>{it.won ? <Trophy size={24} /> : <Swords size={24} />}</a>
                  : <div className="trophy" role="img" aria-label={L('{0}: boss sinovi barcha darslardan keyin ochiladi', [it.unit.titleUz])}><Lock size={22} /></div>}
                <span className="zn-label">{it.done && !it.won ? <b className="boss-tag">{L('BOSS')}</b> : null}{it.unit.titleUz}</span>
              </li>
            );
          }
          const showSign = it.index === 0;
          const Icon = it.state === 'locked' ? Lock : it.state === 'mastered' ? Star : it.state === 'passed' ? Check : it.state === 'revise' ? RotateCcw : it.state === 'current' ? Play : null;
          return (
            <li key={it.lesson.id} className="zn" style={{ left: `${it.x}%`, top: it.y }}>
              {showSign && <span className="unit-sign" style={{ ['--dx' as string]: it.x < 50 ? '30px' : it.x > 50 ? '-30px' : '0px' }}>{it.unit.titleUz}</span>}
              <button type="button" ref={it.state === 'current' ? curRef : undefined} className={`coin ${it.state}`}
                onClick={() => onPick({ unit: it.unit, lesson: it.lesson, index: it.index, state: it.state })}
                aria-label={L('{0}-dars: {1}, {2}{3}', [it.index + 1, it.lesson.titleUz, STATE_UZ[it.state], it.stars ? L(', {0} yulduz', [it.stars]) : ''])}>
                <span className="coin-face">{Icon ? <Icon size={it.state === 'current' ? 30 : 24} strokeWidth={2.6} /> : <span className="num">{it.index + 1}</span>}</span>
              </button>
              {it.stars > 0 && <span className="zn-stars" aria-hidden="true">{[1, 2, 3].map((s) => <Star key={s} size={13} className={s <= it.stars ? 'on' : ''} />)}</span>}
              <span className={`zn-label${it.state === 'locked' ? ' dim' : ''}`}>{it.lesson.titleUz}</span>
            </li>
          );
        })}
      </ol>
      <a className="zone-gate" href="#/skills" style={{ top: TOP - 102 }}><Flag2 /> {lv}  {L('darajasini tekshirish')}</a>
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

  // Xarita darhol hozirgi dars joyida ochiladi (tepadan pastga "yugurmaydi"): bo'yashdan oldin, animatsiyasiz
  useLayoutEffect(() => {
    const el = curRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    window.scrollTo({ top: Math.max(0, window.scrollY + r.top - window.innerHeight / 2 + r.height / 2), left: 0, behavior: 'instant' });
  }, []);
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
            <b>{L('Sellzen darajasi')} {lp.level}</b>
            <div className="hud-bar" role="progressbar" aria-valuemin={0} aria-valuemax={lp.span} aria-valuenow={lp.into} aria-label={L('Bosqich XP')}><i style={{ width: `${Math.round(lp.pct * 100)}%` }} /></div>
            <span className="muted">{lp.into} / {lp.span}  {L('XP · ingliz tili:')} {level ?? 'aniqlanmagan'}</span>
          </div>
        </div>
        <div className="hud-chips">
          <span className="chip-stat"><Flame size={16} /> {displayStreak(p, dayKey())}  {L('kun')}</span>{p.freezes > 0 && <span className="chip-stat" title={L('Seriya muzlatishlari: o‘tkazib yuborilgan kunni yopadi')}>❄ {p.freezes}</span>}
          <span className="chip-stat"><Star size={16} /> {today}/{p.dailyGoal}  {L('XP')}</span>
        </div>
      </div>

      {[...levels].reverse().map((lv) => <Zone key={lv} lv={lv} progress={progress} currentId={currentId} level={level} onPick={setSel} curRef={curRef} />)}

      {currentId && <a className="map-fab" href={`#/learn/${currentId}`}><Play size={18} />  {L('Davom ettirish')}</a>}

      {sel && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setSel(null)}>
          <div className={`sheet card lv-${sel.unit.level}`} role="dialog" aria-modal="true" aria-labelledby="node-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="icon-btn sm sheet-x" onClick={() => setSel(null)} aria-label={L('Yopish')}><X size={16} /></button>
            <div className="sheet-head">
              <span className={`coin mini ${sel.state}`} aria-hidden="true"><span className="coin-face">{sel.index + 1}</span></span>
              <div>
                <p className="sheet-eyebrow">{sel.unit.level} · {ZONES[sel.unit.level]?.name} · {sel.unit.titleUz}</p>
                <h3 id="node-title">{sel.lesson.titleUz}</h3>
              </div>
            </div>
            <p>{sel.lesson.objectiveUz}</p>
            <div className="sheet-stats">
              <div><b>{sel.lesson.minutes}</b><span>{L('daqiqa')}</span></div>
              <div><b>~{sel.lesson.check.length * 3 + 15}</b><span>{L('XP')}</span></div>
              <div><b>5</b><span>{L('jon')}</span></div>
              <div><b>{progress[sel.lesson.id] ? `${Math.round(progress[sel.lesson.id]!.best * 100)}%` : '—'}</b><span>{L('eng yaxshi')}</span></div>
            </div>
            {sel.state === 'locked'
              ? <p className="notice">{L('Bu dars avvalgi darsdan o‘tganingizdan keyin ochiladi.')}</p>
              : <a className="btn primary block" href={`#/learn/${sel.lesson.id}`} autoFocus><Play size={16} /> {sel.state === 'passed' || sel.state === 'mastered' ? L('Takrorlash') : sel.state === 'revise' ? L('Takrorlashni boshlash') : L('Boshlash')}</a>}
          </div>
        </div>
      )}
    </div>
  );
}
