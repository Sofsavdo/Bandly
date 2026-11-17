// Bo'lim boss sinovi (GAMIFIED_LEARNING_SPEC.md §3.5). Bitta ekranda bitta savol, 3 ta jon, o'tish ≥ 80%.
// Boss ixtiyoriy (PXD-17): keyingi bo'lim baribir dars zanjiri bilan ochiladi.
import { ArrowLeft, ArrowRight, Flame, Heart, RotateCcw, Swords, Trophy } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ItemView } from '../components/LessonItem';
import { lessonById, lessonNodeId, UNITS } from '../content/lessons';
import type { Item } from '../content/lessons/types';
import { effectiveMastery, stateOf } from '../lib/adaptive/mastery';
import { loadAdaptive, recordAnswer } from '../lib/adaptive/store';
import { BOSS_HEARTS, BOSS_PASS, BOSS_SIZE, BOSS_XP_FIRST, BOSS_XP_REPEAT, bossAvailable, loadBoss, loadRun, saveBossResult, saveRun, selectBossItems, type BossRef, type BossRun } from '../lib/boss';
import { answer, newPace, pace, SLOW_DOWN_UZ, type LessonPlay, type Pace } from '../lib/gamify';
import { checkItem, loadProgress, type ItemAnswer } from '../lib/lessons';
import { addMistake, openMistakes } from '../lib/mistakes';
import { addBossWin, addXp, pushToast } from '../lib/store';
import { L } from '../i18n';

const itemOf = (r: BossRef): Item | undefined => lessonById(r.lessonId)?.lesson[r.part][r.index];
const masteryOf = (lessonId: string, now: number): number => { const rec = loadAdaptive().mastery[lessonNodeId(lessonId)]; return rec ? effectiveMastery(rec, now) : 0; };

function newRun(unitId: string, now: number): BossRun {
  const unit = UNITS.find((u) => u.id === unitId)!;
  const progress = loadProgress();
  const saved = loadAdaptive();
  const openByLesson: Record<string, number> = {};
  for (const m of openMistakes()) if (m.ref.kind === 'lesson') openByLesson[m.ref.lessonId] = (openByLesson[m.ref.lessonId] ?? 0) + 1;
  const needsRevision = new Set(Object.keys(progress).filter((id) => { const rec = saved.mastery[lessonNodeId(id)]; return rec && stateOf(rec, now) === 'needs_revision'; }));
  const seed = `${unitId}:${now}`;
  const refs = selectBossItems(unit, UNITS, progress, { openMistakes: openByLesson, needsRevision }, seed);
  const before = Object.fromEntries([...new Set(refs.map((r) => r.lessonId))].map((id) => [id, masteryOf(id, now)]));
  return { unitId, seed, refs, answers: [], shown: [], hearts: BOSS_HEARTS, startedAt: now, done: null, before, suppressed: 0 };
}

export default function Boss({ unitId }: { unitId: string }) {
  const unit = UNITS.find((u) => u.id === unitId);
  const [run, setRunState] = useState<BossRun | null>(() => loadRun(unitId));
  const [started, setStarted] = useState(false);
  const [play, setPlay] = useState<LessonPlay>({ hearts: BOSS_HEARTS, combo: 0, maxCombo: 0, xp: 0 });
  const [gained, setGained] = useState(0);
  const [slow, setSlow] = useState(false);
  const [cur, setCur] = useState(0);
  const paceRef = useRef<Pace>(newPace(Date.now()));
  const record = useMemo(() => loadBoss()[unitId], [unitId, run?.done]);
  const setRun = (r: BossRun | null) => { setRunState(r); saveRun(r && !r.done ? r : null); };

  if (!unit) return <div className="card"><h2>{L('Bo‘lim topilmadi')}</h2><a className="btn" href="#/learn">{L('Darslar xaritasi')}</a></div>;
  const progress = loadProgress();
  if (!bossAvailable(unit, progress)) return (
    <div className="card boss-intro">
      <h2><Swords size={20} /> {unit.titleUz}  {L('— boss sinovi')}</h2>
      <p>{L('Boss sinovi bo‘limning barcha darslaridan o‘tganingizdan keyin ochiladi (')}{unit.lessons.filter((l) => progress[l.id]?.passedAt).length}/{unit.lessons.length}).</p>
      <a className="btn" href="#/learn"><ArrowLeft size={14} />  {L('Xaritaga qaytish')}</a>
    </div>
  );

  const unitIdx = UNITS.findIndex((u) => u.id === unit.id);
  const nextUnit = UNITS[unitIdx + 1];

  // ---------- Kirish ----------
  if (!started || !run) {
    const resumable = run && !run.done ? run : null;
    const answered = resumable ? resumable.shown.filter(Boolean).length : 0;
    const start = (fresh: boolean) => {
      const r = fresh || !resumable ? newRun(unit.id, Date.now()) : resumable;
      paceRef.current = newPace(Date.now());
      setPlay({ hearts: r.hearts, combo: 0, maxCombo: 0, xp: 0 }); setGained(0); setSlow(false);
      const first = r.refs.findIndex((_, i) => !r.shown[i]);
      setCur(first === -1 ? r.refs.length - 1 : first);
      setRun(r); setStarted(true);
    };
    return (
      <div>
        <a className="btn sm" href="#/learn"><ArrowLeft size={14} />  {L('Xarita')}</a>
        <section className="card boss-intro" style={{ marginTop: 10 }}>
          <div className="boss-emblem" aria-hidden="true"><Swords size={34} /></div>
          <p className="row" style={{ justifyContent: 'center' }}><span className={`lvl-tag ${unit.level}`}>{unit.level}</span><span className="pill">{unit.titleUz}</span></p>
          <h2>{L('Boss sinovi')}</h2>
          <p>{L('Bo‘lim bo‘yicha')} {BOSS_SIZE}  {L('ta savol: ko‘pi shu bo‘limdan, qolgani oldingi bo‘limlardan takror. Vaqt cheklovi yo‘q.')}</p>
          <ul className="boss-rules">
            <li><Heart size={15} /> {BOSS_HEARTS}  {L('ta jon — sinov davomida jon qaytmaydi')}</li>
            <li><Trophy size={15} />  {L('O‘tish uchun kamida')} {Math.round(BOSS_PASS * 100)}{L('% to‘g‘ri javob')}</li>
            <li><Flame size={15} />  {L('Birinchi g‘alaba +')}{BOSS_XP_FIRST}  {L('XP, keyingilari +')}{BOSS_XP_REPEAT}  {L('XP')}</li>
          </ul>
          <p className="muted" style={{ fontSize: 13 }}>{L('Ixtiyoriy sinov.')}</p>
          {record && <p className="row" style={{ justifyContent: 'center' }}><span className="pill">{L('Urinishlar:')} {record.attempts}</span><span className="pill">{L('Eng yaxshi:')} {Math.round(record.best * 100)}%</span>{record.passedAt && <span className="pill boss-won"><Trophy size={13} />  {L('Yutilgan')}</span>}</p>}
          <div className="row" style={{ justifyContent: 'center' }}>
            {resumable && <button className="btn primary" onClick={() => start(false)}>{L('Davom ettirish (')}{answered}/{resumable.refs.length}) <ArrowRight size={14} /></button>}
            <button className={`btn ${resumable ? '' : 'primary'}`} onClick={() => start(true)}>{resumable ? L('Yangidan boshlash') : L('Boshlash')} <Swords size={14} /></button>
          </div>
        </section>
      </div>
    );
  }

  const total = run.refs.length;
  const idx = Math.min(cur, total - 1);
  const correct = run.refs.filter((r, i) => run.shown[i] && checkItem(itemOf(r)!, run.answers[i] as ItemAnswer)).length;

  // ---------- Natija ----------
  if (run.done) {
    const rate = correct / total;
    const wrong = run.refs.map((r, i) => ({ r, i })).filter(({ r, i }) => run.shown[i] && !checkItem(itemOf(r)!, run.answers[i] as ItemAnswer));
    const fixLessons = [...new Set(wrong.map(({ r }) => r.lessonId))];
    const now = Date.now();
    return (
      <div>
        <a className="btn sm" href="#/learn"><ArrowLeft size={14} />  {L('Xarita')}</a>
        <section className={`card boss-result ${run.done}`} style={{ marginTop: 10 }}>
          <div className="boss-emblem" aria-hidden="true">{run.done === 'won' ? <Trophy size={34} /> : <Swords size={34} />}</div>
          <h2>{run.done === 'won' ? 'Boss yengildi!' : run.hearts === 0 ? L('Jonlar tugadi') : L('Bu safar yetmadi')}</h2>
          <p className="row" style={{ justifyContent: 'center' }}>
            <span className="pill">{correct}/{total}  {L('to‘g‘ri')}</span><span className="pill">{Math.round(rate * 100)}%</span>
            {gained > 0 && <span className="pill">+{gained}  {L('XP')}</span>}{play.maxCombo >= 2 && <span className="pill"><Flame size={13} />  {L('combo ×')}{play.maxCombo}</span>}
          </p>
          {run.suppressed > 0 && <p className="muted" style={{ fontSize: 13 }}>{run.suppressed}  {L('ta juda tez javob XP hisobiga kirmadi.')}</p>}
          <h3>{L('O‘zlashtirish o‘zgarishi')}</h3>
          <ul className="boss-deltas">
            {Object.entries(run.before).map(([id, b]) => { const a = masteryOf(id, now); const l = lessonById(id)?.lesson; return <li key={id}><span>{l?.titleUz ?? id}</span><b>{Math.round(b * 100)}% → {Math.round(a * 100)}%</b></li>; })}
          </ul>
          {fixLessons.length > 0 && (<>
            <h3>{L('Nimani tuzatish kerak')}</h3>
            <ul className="boss-fix">{fixLessons.map((id) => <li key={id}><a href={`#/learn/${id}`}>{lessonById(id)?.lesson.titleUz ?? id}</a> <span className="muted">— {wrong.filter(({ r }) => r.lessonId === id).length}  {L('ta xato')}</span></li>)}</ul>
            <p className="muted" style={{ fontSize: 13 }}>{L('Xato javoblar “Xatolar ustida ishlash” ro‘yxatiga qo‘shildi.')}</p>
          </>)}
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            {fixLessons.length > 0 && <a className="btn" href="#/mistakes">{L('Xatolar ustida ishlash')}</a>}
            <button className="btn" onClick={() => { setRunState(null); setStarted(false); }}><RotateCcw size={14} />  {L('Qayta urinish')}</button>
            {run.done === 'won' && <a className="btn primary" href={nextUnit ? `#/learn/${nextUnit.lessons[0]!.id}` : '#/learn'}>{nextUnit ? L('Keyingi bo‘lim: {0}', [nextUnit.titleUz]) : L('Xaritaga qaytish')} <ArrowRight size={14} /></a>}
          </div>
          {wrong.length > 0 && <details style={{ marginTop: 12 }}><summary>{L('Xato javoblar va izohlar (')}{wrong.length})</summary>{wrong.map(({ r, i }) => <ItemView key={i} item={itemOf(r)!} value={run.answers[i] as ItemAnswer} revealed onChange={() => undefined} />)}</details>}
        </section>
      </div>
    );
  }

  // ---------- Savol ----------
  const ref = run.refs[idx]!;
  const item = itemOf(ref)!;
  const value = run.answers[idx] as ItemAnswer;
  const revealed = !!run.shown[idx];
  const empty = value === undefined || (Array.isArray(value) && !value.length) || (typeof value === 'string' && !value.trim());
  const reveal = () => {
    const now = Date.now();
    const ok = checkItem(item, value);
    const lesson = lessonById(ref.lessonId)!.lesson;
    recordAnswer(lessonNodeId(ref.lessonId), ok, lesson.taxonomyIds, now);
    if (!ok) addMistake('lesson', { kind: 'lesson', lessonId: ref.lessonId, part: ref.part, index: ref.index }, lesson.taxonomyIds, now);
    const p = pace(paceRef.current, now, item.kind === 'choice' && typeof value === 'number' ? value : null);
    paceRef.current = p.pace;
    if (p.suppress && !slow) pushToast(SLOW_DOWN_UZ, 'xp');
    setSlow(p.suppress);
    const np = answer(play, ok);
    setPlay(np);
    if (ok && (np.combo === 3 || np.combo === 5 || np.combo === 10)) pushToast(`Combo ×${np.combo}!`, 'xp');
    const shown = [...run.shown]; shown[idx] = true;
    setRun({ ...run, shown, hearts: np.hearts, suppressed: run.suppressed + (p.suppress && ok ? 1 : 0) });
  };
  const advance = () => {
    const nextIdx = run.refs.findIndex((_, i) => !run.shown[i]);
    if (run.hearts > 0 && nextIdx !== -1) { paceRef.current = { ...paceRef.current, lastAt: Date.now() }; setCur(nextIdx); return; }
    finish();
  };
  const finish = () => {
    const rate = correct / total;
    const passed = run.hearts > 0 && rate >= BOSS_PASS;
    const { firstWin } = saveBossResult(unit.id, rate, passed);
    if (passed) {
      const base = firstWin ? BOSS_XP_FIRST : BOSS_XP_REPEAT;
      const xp = Math.round(base * (correct - run.suppressed) / Math.max(1, correct)); // juda tez javoblar ulushi XP'dan chiqariladi
      if (firstWin) addBossWin(xp); else addXp(xp);
      setGained(xp);
    }
    setRun({ ...run, done: passed ? 'won' : 'lost' });
  };
  const answered = run.shown.filter(Boolean).length;

  return (
    <div>
      <button className="btn sm" onClick={() => { setStarted(false); }}><ArrowLeft size={14} />  {L('To‘xtatish')}</button>
      <div className="lesson-hud sticky" aria-label={L('Boss holati')}>
        <div className="seg-progress" aria-label={L('{0} / {1} savol', [answered, total])}>{run.refs.map((_, i) => <i key={i} className={run.shown[i] ? 'done' : i === idx ? 'now' : ''} />)}</div>
        <span className="hud-hearts" aria-label={L('{0} ta jon', [play.hearts])}>{Array.from({ length: BOSS_HEARTS }, (_, i) => <Heart key={i} size={16} className={i < play.hearts ? 'full' : 'empty'} />)}</span>
        {play.combo >= 2 && <span className="hud-combo"><Flame size={16} /> ×{play.combo}</span>}
      </div>
      <section className="card boss-q" style={{ marginTop: 10 }} key={idx}>
        <p className="row"><span className="pill"><Swords size={13} />  {L('Boss ·')} {unit.titleUz}</span><span className="pill">{idx + 1}/{total}</span>{!unit.lessons.some((l) => l.id === ref.lessonId) && <span className="pill">{L('Takror')}</span>}</p>
        {slow && <p className="notice" role="status">{SLOW_DOWN_UZ}{L('. Juda tez berilgan javoblarga XP yozilmaydi.')}</p>}
        <ItemView item={item} value={value} revealed={revealed} onChange={(v) => { const answers = [...run.answers]; answers[idx] = v; setRun({ ...run, answers }); }} />
        {!revealed && <button className="btn primary" disabled={empty} onClick={reveal}>{L('Tekshirish')}</button>}
        {revealed && <button className="btn primary" onClick={advance}>{run.hearts === 0 || answered >= total ? L('Natijani ko‘rish') : L('Keyingi savol')} <ArrowRight size={14} /></button>}
      </section>
    </div>
  );
}
