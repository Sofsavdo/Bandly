// Bugungi reja ketma-ket bajarilayotganda pastda turadigan panel: qaysi vazifa, "Keyingisi", to'xtatish.
// Dars vazifasi o'tilgach keyingisiga o'zi o'tadi.
import { ArrowRight, Check, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { loadProgress } from '../lib/lessons';
import { getRun, nextTask, onRun, stopRun } from '../lib/planRun';
import { L } from '../i18n';

export function PlanRunBar({ hash }: { hash: string }) {
  const [, force] = useState(0);
  useEffect(() => onRun(() => force((x) => x + 1)), []);
  const run = getRun();
  const task = run?.tasks[run.i];
  const [passed, setPassed] = useState(false);
  useEffect(() => {
    setPassed(false);
    if (!task?.lessonId) return;
    const t = setInterval(() => { if (loadProgress()[task.lessonId!]?.passedAt) { setPassed(true); clearInterval(t); } }, 1200);
    return () => clearInterval(t);
  }, [task?.lessonId, run?.i]);
  const active = !!run && !!task && hash !== '#/';
  useEffect(() => { document.body.classList.toggle('has-planrun', active); return () => document.body.classList.remove('has-planrun'); }, [active]);
  useEffect(() => { if (!passed) return; const t = setTimeout(nextTask, 1800); return () => clearTimeout(t); }, [passed]);
  if (!run || !task || hash === '#/') return null;
  const last = run.i === run.tasks.length - 1;
  return (
    <div className="planrun" role="region" aria-label={L('Bugungi reja')}>
      <div className="planrun-dots" aria-hidden="true">{run.tasks.map((_, k) => <i key={k} className={k < run.i ? 'done' : k === run.i ? 'now' : ''} />)}</div>
      <div className="grow"><small>{L('Reja {0}/{1}', [run.i + 1, run.tasks.length])}</small><b>{passed ? <><Check size={15} /> {L('Bajarildi')}</> : task.title}</b></div>
      <button className="btn primary sm" onClick={nextTask}>{last ? L('Tugatish') : L('Keyingisi')} <ArrowRight size={15} /></button>
      <button className="icon-btn" onClick={stopRun} aria-label={L('Rejani to‘xtatish')}><X size={16} /></button>
    </div>
  );
}
