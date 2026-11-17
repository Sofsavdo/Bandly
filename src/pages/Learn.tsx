import { ArrowRight, CheckCircle2, List, Lock, Map as MapIcon } from 'lucide-react';
import { Illo } from '../components/Illo';
import { PRing } from '../components/PRing';
import { useState } from 'react';
import { LearningMap } from '../components/LearningMap';
import { QuestsCard } from '../components/QuestsCard';
import { UNITS } from '../content/lessons';
import { isUnlocked, loadProgress, nextLesson } from '../lib/lessons';
import { useProfile } from '../lib/store';

/** General English path: level → unit → lesson. Pilot slice (A1–C2). */
const VIEW_KEY = 'bandly.learnview.v1';
const loadView = (): 'map' | 'list' => { try { return localStorage.getItem(VIEW_KEY) === 'list' ? 'list' : 'map'; } catch { return 'map'; } };

export default function Learn() {
  const p = useProfile();
  const [view, setView] = useState<'map' | 'list'>(loadView);
  const [lvlF, setLvlF] = useState<string>(() => (p.level && UNITS.some((u) => u.level === p.level) ? p.level : 'all'));
  const pick = (v: 'map' | 'list') => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };
  const progress = loadProgress();
  const total = UNITS.reduce((s, u) => s + u.lessons.length, 0);
  const next = nextLesson(UNITS, progress, p.level);
  const passed = UNITS.flatMap((u) => u.lessons).filter((l) => progress[l.id]?.passedAt).length;
  const levels = [...new Set(UNITS.map((u) => u.level))];
  const shown = lvlF === 'all' ? UNITS : UNITS.filter((u) => u.level === lvlF);
  return (
    <div>
      <section className="card page-head with-illo learn-head">
        <h2 style={{ margin: 0 }}>Yangi darsni <em className="it">tanlang</em></h2>
        <p style={{ margin: '6px 0 14px' }}>{passed}/{total} dars · {p.level ? `darajangiz ${p.level}` : <a href="#/placement">darajani aniqlash</a>}</p>
        <div className="row" style={{ gap: 10 }}>
          <div className="seg" role="tablist" aria-label="Ko‘rinish">
            <button type="button" role="tab" aria-selected={view === 'map'} className={view === 'map' ? 'on' : ''} onClick={() => pick('map')}><MapIcon size={15} /> Xarita</button>
            <button type="button" role="tab" aria-selected={view === 'list'} className={view === 'list' ? 'on' : ''} onClick={() => pick('list')}><List size={15} /> Ro‘yxat</button>
          </div>
          {next && <a className="btn primary" href={`#/learn/${next.lessonId}`}>Davom ettirish <ArrowRight size={16} /></a>}
        </div>
        <Illo kind="map" size={130} />
      </section>
      {view === 'map' && (
        <div className="learn-grid">
          <LearningMap progress={progress} level={p.level} currentId={next?.lessonId ?? null} />
          <aside className="learn-side" aria-label="Bugungi vazifalar">{p.level && <QuestsCard />}</aside>
        </div>
      )}
      {view === 'list' && <>
        <div className="chips" role="tablist" aria-label="Daraja">
          <button type="button" className={`chip ${lvlF === 'all' ? 'on' : ''}`} onClick={() => setLvlF('all')}>Barchasi</button>
          {levels.map((l) => <button key={l} type="button" className={`chip ${lvlF === l ? 'on' : ''}`} onClick={() => setLvlF(l)}>{l}{p.level === l ? ' · siz' : ''}</button>)}
        </div>
        {shown.map((u) => {
          const done = u.lessons.filter((l) => progress[l.id]?.passedAt).length;
          return (
            <section key={u.id}>
              <div className="unit-head"><span className={`lvl-tag ${u.level}`}>{u.level}</span><h3>{u.titleUz}</h3><span className="muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }}>{done}/{u.lessons.length}</span></div>
              <div className="lcards">
                {u.lessons.map((l, i) => {
                  const open = isUnlocked(u, i, progress);
                  const pr = progress[l.id];
                  const best = pr ? Math.round(pr.best * 100) : 0;
                  const body = (
                    <>
                      <h3>{i + 1}. {l.titleUz}</h3>
                      <p>{l.objectiveUz}</p>
                      <PRing value={best} max={100} size={50} stroke={5} dark color="var(--peach)" label={`Eng yaxshi natija ${best}%`}><b style={{ fontSize: 12 }}>{pr?.passedAt ? <CheckCircle2 size={16} color="#fff" /> : `${best}%`}</b></PRing>
                      <div className="lfoot"><span className="lstart">{pr?.passedAt ? 'Takrorlash' : open ? 'Boshlash' : <><Lock size={13} /> Yopiq</>}</span><span className="muted" style={{ fontSize: 12.5 }}>{l.minutes} daq</span></div>
                    </>
                  );
                  return open
                    ? <a key={l.id} className={`lcard ${pr?.passedAt ? 'done' : ''}`} href={`#/learn/${l.id}`}>{body}</a>
                    : <div key={l.id} className="lcard locked" aria-disabled="true">{body}</div>;
                })}
              </div>
            </section>
          );
        })}
      </>}
    </div>
  );
}
