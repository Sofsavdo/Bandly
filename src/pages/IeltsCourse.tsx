import { ArrowRight, CheckCircle2, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
import { PRing } from '../components/PRing';
import { IELTS_TRACKS, type IeltsSkill } from '../content/ielts';
import { ieltsUnlocked, nextIeltsLesson } from '../content/lessons';
import type { Unit } from '../content/lessons/types';
import { loadProgress } from '../lib/lessons';
import { useProfile } from '../lib/store';
import { freeLeft } from '../lib/freeQuota';
import { L } from '../i18n';

/** IELTS kursi: imtihon ko'nikmalari darslari (Start → Core). Har dars real savol turi bilan tugaydi, so'ng testga yo'naltiradi. */
const SKILL_UZ: Record<IeltsSkill, string> = { reading: 'Reading', listening: 'Listening', writing: 'Writing', speaking: 'Speaking' };

export default function IeltsCourse() {
  const p = useProfile();
  const progress = loadProgress();
  const all = IELTS_TRACKS.flatMap((t) => [...t.start.lessons, ...t.core.lessons]);
  const passed = all.filter((l) => progress[l.id]?.passedAt).length;
  const next = nextIeltsLesson(progress, p.level);
  const [skill, setSkill] = useState<IeltsSkill | 'all'>(() => (next ? IELTS_TRACKS.find((t) => t.start.id === next.unit.id || t.core.id === next.unit.id)?.skill ?? 'all' : 'all'));
  const unitBlock = (u: Unit, tier: string) => {
    const done = u.lessons.filter((l) => progress[l.id]?.passedAt).length;
    return (
      <section key={u.id}>
        <div className="unit-head"><span className={`lvl-tag ${u.level}`}>{tier}</span><h3>{u.titleUz}</h3><span className="muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }}>{done}/{u.lessons.length}</span></div>
        <p className="muted" style={{ margin: '0 0 10px' }}>{u.situationUz}</p>
        <div className="lcards">
          {u.lessons.map((l, i) => {
            const open = ieltsUnlocked(u, i, progress, p.level);
            const pr = progress[l.id];
            const best = pr ? Math.round(pr.best * 100) : 0;
            const body = (
              <>
                <h3>{i + 1}. {l.titleUz}</h3>
                <p>{l.objectiveUz}</p>
                <PRing value={best} max={100} size={50} stroke={5} dark color="var(--peach)" label={L('Eng yaxshi natija {0}%', [best])}><b style={{ fontSize: 12 }}>{pr?.passedAt ? <CheckCircle2 size={16} color="var(--on-inv)" /> : `${best}%`}</b></PRing>
                <div className="lfoot"><span className="lstart">{pr?.passedAt ? L('Takrorlash') : open ? L('Boshlash') : <><Lock size={13} />  {L('Yopiq')}</>}</span><span className="muted" style={{ fontSize: 12.5 }}>{l.minutes}  {L('daq')}</span></div>
              </>
            );
            return open
              ? <a key={l.id} className={`lcard ${pr?.passedAt ? 'done' : ''}`} href={`#/learn/${l.id}`}>{body}</a>
              : <div key={l.id} className="lcard locked" aria-disabled="true">{body}</div>;
          })}
        </div>
      </section>
    );
  };
  return (
    <div>
      <section className="card page-head">
        <h2 style={{ margin: 0 }}><GraduationCap size={22} />  {L('IELTS kursi')}</h2>
        <p style={{ margin: '6px 0 4px' }}>{L('Savol turlari, usullar va vaqt: bilimingizni ballga aylantiring.')}</p>
        <p className="muted" style={{ margin: '0 0 12px' }}>{passed}/{all.length}  {L('dars')}{freeLeft('ielts') !== null && <> · <a href="#/pricing">{L('Bugun bepul: {0} ta yangi dars', [freeLeft('ielts') ?? 0])}</a></>}</p>
        {next && <><p className="muted" style={{ margin: '0 0 8px', fontSize: 14 }}>{L('Keyingi dars:')} <b>{next.lesson.titleUz}</b></p><a className="btn primary" href={`#/learn/${next.lesson.id}`}>{passed ? L('Davom ettirish') : L('Boshlash')} <ArrowRight size={16} /></a></>}
      </section>
      <div className="chips" role="tablist" aria-label={L('Ko‘nikma')}>
        <button type="button" role="tab" aria-selected={skill === 'all'} className={`chip ${skill === 'all' ? 'on' : ''}`} onClick={() => setSkill('all')}>{L('Barchasi')}</button>
        {IELTS_TRACKS.map((t) => { const n = [...t.start.lessons, ...t.core.lessons]; const d = n.filter((l) => progress[l.id]?.passedAt).length; return <button key={t.skill} type="button" role="tab" aria-selected={skill === t.skill} className={`chip ${skill === t.skill ? 'on' : ''}`} onClick={() => setSkill(t.skill)}>{SKILL_UZ[t.skill]} {d}/{n.length}</button>; })}
      </div>
      {IELTS_TRACKS.filter((t) => skill === 'all' || t.skill === skill).map((t) => (
        <div key={t.skill} className="ielts-track">
          <h2 className="list-h">{SKILL_UZ[t.skill]}</h2>
          {unitBlock(t.start, 'Start')}
          {unitBlock(t.core, 'Core')}
          <a className="btn" href={t.practiceHref}>{L('{0} bo‘yicha imtihon mashqi', [SKILL_UZ[t.skill]])} <ArrowRight size={14} /></a>
        </div>
      ))}
    </div>
  );
}

/** Imtihon sahifasidagi qisqa karta: kurs holati va keyingi dars. */
export function IeltsCourseCard() {
  const p = useProfile();
  const progress = loadProgress();
  const all = IELTS_TRACKS.flatMap((t) => [...t.start.lessons, ...t.core.lessons]);
  const passed = all.filter((l) => progress[l.id]?.passedAt).length;
  const next = nextIeltsLesson(progress, p.level);
  return (
    <a className="card ielts-card" href={next ? `#/learn/${next.lesson.id}` : '#/ielts'}>
      <span className="ielts-card-ic" aria-hidden="true"><GraduationCap size={22} /></span>
      <span className="ielts-card-tx">
        <b>{L('IELTS kursi')} · {passed}/{all.length}  {L('dars')}</b>
        <span className="muted">{next ? L('Keyingi dars: {0}', [next.lesson.titleUz]) : L('Barcha darslar o‘tildi — testlarda mustahkamlang')}</span>
      </span>
      <ArrowRight size={18} />
    </a>
  );
}
