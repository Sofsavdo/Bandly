import { Check, Flag, Lock, Play, RotateCcw, Star, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { UNITS, lessonNodeId } from '../content/lessons';
import type { Lesson, Unit } from '../content/lessons/types';
import { stateOf } from '../lib/adaptive/mastery';
import { loadAdaptive } from '../lib/adaptive/store';
import { nodeState, type NodeState } from '../lib/gamify';
import { isUnlocked, type ProgressMap } from '../lib/lessons';

const LEVEL_NAME: Record<string, string> = { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper-intermediate', C1: 'Advanced', C2: 'Proficiency' };
const ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const STATE_UZ: Record<NodeState, string> = { locked: 'yopiq', open: 'ochiq', current: 'hozirgi dars', passed: 'tugallangan', mastered: 'to‘liq o‘zlashtirilgan', revise: 'takrorlash vaqti keldi' };

interface Sel { unit: Unit; lesson: Lesson; index: number; state: NodeState }

/** General English o'quv xaritasi (GAMIFIED_LEARNING_SPEC.md §2). Ochilish qoidasi isUnlocked() bilan bir xil. */
export function LearningMap({ progress, level, currentId }: { progress: ProgressMap; level: string | null; currentId: string | null }) {
  const [sel, setSel] = useState<Sel | null>(null);
  const curRef = useRef<HTMLButtonElement | null>(null);
  const saved = loadAdaptive();
  const now = Date.now();
  const levels = ORDER.filter((l) => UNITS.some((u) => u.level === l));

  // Ilova sahifa almashganda tepaga qaytaradi — undan keyin hozirgi tugunga o'tamiz
  useEffect(() => { const t = setTimeout(() => curRef.current?.scrollIntoView({ block: 'center' }), 60); return () => clearTimeout(t); }, []);
  useEffect(() => {
    if (!sel) return;
    const on = (e: KeyboardEvent) => { if (e.key === 'Escape') setSel(null); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [sel]);

  return (
    <div className="lmap">
      {levels.map((lv) => {
        const units = UNITS.filter((u) => u.level === lv);
        const lessons = units.flatMap((u) => u.lessons);
        const passed = lessons.filter((l) => progress[l.id]?.passedAt).length;
        const assumed = !!level && ORDER.indexOf(lv) < ORDER.indexOf(level);
        return (
          <section key={lv} className={`lmap-level lv-${lv}`} aria-labelledby={`lv-${lv}`}>
            <header className="lmap-head">
              <span className={`lvl-tag ${lv}`}>{lv}</span>
              <h3 id={`lv-${lv}`}>{LEVEL_NAME[lv]}</h3>
              <span className="pill">{passed}/{lessons.length}</span>
              {assumed && <span className="pill muted" title="Daraja testi natijasiga ko‘ra">o‘tilgan deb hisoblangan</span>}
              {level === lv && <span className="pill">Sizning darajangiz</span>}
            </header>
            {units.map((u) => (
              <div key={u.id} className="lmap-unit">
                <p className="lmap-unit-title"><b>{u.titleUz}</b> <span className="muted">· {u.situationUz}</span></p>
                <ol className="lmap-path">
                  {u.lessons.map((l, i) => {
                    const pr = progress[l.id];
                    const rec = saved.mastery[lessonNodeId(l.id)];
                    const st = nodeState(isUnlocked(u, i, progress), !!pr?.passedAt, l.id === currentId, rec ? stateOf(rec, now) : null);
                    const Icon = st === 'locked' ? Lock : st === 'mastered' ? Star : st === 'passed' ? Check : st === 'revise' ? RotateCcw : st === 'current' ? Play : null;
                    return (
                      <li key={l.id} className={`lmap-node pos-${i % 4}`}>
                        <button type="button" ref={l.id === currentId ? curRef : undefined} className={`node ${st}`} onClick={() => setSel({ unit: u, lesson: l, index: i, state: st })}
                          aria-label={`${i + 1}-dars: ${l.titleUz}, ${STATE_UZ[st]}`}>
                          {Icon ? <Icon size={st === 'current' ? 26 : 22} /> : <span className="num">{i + 1}</span>}
                        </button>
                        <span className="lmap-label">{l.titleUz}</span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            ))}
            <a className="lmap-milestone" href="#/skills"><Flag size={16} /> {lv} bosqichini tekshirish — Reading / Listening darajasi</a>
          </section>
        );
      })}

      {sel && (
        <div className="sheet-backdrop" role="presentation" onClick={() => setSel(null)}>
          <div className="sheet card" role="dialog" aria-modal="true" aria-labelledby="node-title" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="icon-btn sm sheet-x" onClick={() => setSel(null)} aria-label="Yopish"><X size={16} /></button>
            <p className="row"><span className={`lvl-tag ${sel.unit.level}`}>{sel.unit.level}</span><span className="pill">{sel.unit.titleUz}</span><span className="pill">{STATE_UZ[sel.state]}</span></p>
            <h3 id="node-title">{sel.index + 1}. {sel.lesson.titleUz}</h3>
            <p>{sel.lesson.objectiveUz}</p>
            <p className="row">
              <span className="pill">⏱ {sel.lesson.minutes} daq</span>
              <span className="pill">⭐ ~{sel.lesson.check.length * 3 + 15} XP</span>
              <span className="pill">❤ 5 jon</span>
              {progress[sel.lesson.id] && <span className="pill">Eng yaxshi: {Math.round(progress[sel.lesson.id]!.best * 100)}%</span>}
            </p>
            {sel.state === 'locked'
              ? <p className="notice">Bu dars avvalgi darsdan o‘tganingizdan keyin ochiladi.</p>
              : <a className="btn primary" href={`#/learn/${sel.lesson.id}`} autoFocus><Play size={16} /> {sel.state === 'passed' || sel.state === 'mastered' ? 'Takrorlash' : sel.state === 'revise' ? 'Takrorlashni boshlash' : 'Boshlash'}</a>}
          </div>
        </div>
      )}
    </div>
  );
}
