import { ArrowRight, CheckCircle2, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
import { PRing } from '../components/PRing';
import { SAT_TRACKS, type SatSection } from '../content/sat';
import { nextSatLesson, satUnlocked } from '../content/lessons';
import type { Unit } from '../content/lessons/types';
import { loadProgress } from '../lib/lessons';
import { freeLeft } from '../lib/freeQuota';
import { openExamTab } from '../lib/examTab';
import { L } from '../i18n';

/** SAT kursi: Digital SAT darslik. Reading & Writing va Math — ikki yo'l; har dars qoida, misollar, mashq va SAT uslubidagi tekshiruv bilan tugaydi. */
const SECTION_UZ: Record<SatSection, string> = { rw: 'Reading & Writing', math: 'Math' };

export default function SatCourse() {
  const progress = loadProgress();
  const all = SAT_TRACKS.flatMap((t) => t.units.flatMap((u) => u.lessons));
  const passed = all.filter((l) => progress[l.id]?.passedAt).length;
  const next = nextSatLesson(progress);
  const [section, setSection] = useState<SatSection | 'all'>('all');
  const unitBlock = (u: Unit) => {
    const done = u.lessons.filter((l) => progress[l.id]?.passedAt).length;
    return (
      <section key={u.id}>
        <div className="unit-head"><h3>{u.titleUz}</h3><span className="muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }}>{done}/{u.lessons.length}</span></div>
        <p className="muted" style={{ margin: '0 0 10px' }}>{u.situationUz}</p>
        <div className="lcards">
          {u.lessons.map((l, i) => {
            const open = satUnlocked(u, i, progress);
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
        <h2 style={{ margin: 0 }}><GraduationCap size={22} />  {L('SAT kursi')}</h2>
        <p style={{ margin: '6px 0 4px' }}>{L('Digital SAT darsligi: qoidalar, usullar va SAT uslubidagi savollar.')}</p>
        <p className="muted" style={{ margin: '0 0 12px' }}>{passed}/{all.length}  {L('dars')}{freeLeft('sat') !== null && <> · <a href="#/pricing">{L('Bugun bepul: {0} ta yangi dars', [freeLeft('sat') ?? 0])}</a></>}</p>
        {next && <><p className="muted" style={{ margin: '0 0 8px', fontSize: 14 }}>{L('Keyingi dars:')} <b>{next.lesson.titleUz}</b></p><a className="btn primary" href={`#/learn/${next.lesson.id}`}>{passed ? L('Davom etish') : L('Boshlash')} <ArrowRight size={14} /></a></>}
      </section>
      <div className="chips" role="tablist" aria-label={L('Bo‘lim')}>
        <button type="button" role="tab" aria-selected={section === 'all'} className={`chip ${section === 'all' ? 'on' : ''}`} onClick={() => setSection('all')}>{L('Barchasi')}</button>
        {SAT_TRACKS.map((t) => { const n = t.units.flatMap((u) => u.lessons); const d = n.filter((l) => progress[l.id]?.passedAt).length; return <button key={t.section} type="button" role="tab" aria-selected={section === t.section} className={`chip ${section === t.section ? 'on' : ''}`} onClick={() => setSection(t.section)}>{SECTION_UZ[t.section]} · {d}/{n.length}</button>; })}
      </div>
      {SAT_TRACKS.filter((t) => section === 'all' || t.section === section).map((t) => (
        <div key={t.section} className="ielts-track">
          <h2 className="list-h">{SECTION_UZ[t.section]}</h2>
          {t.units.map(unitBlock)}
          <a className="btn" href="#/exam" onClick={() => openExamTab('sat')}>{L('{0} bo‘yicha mashq savollari', [SECTION_UZ[t.section]])} <ArrowRight size={14} /></a>
        </div>
      ))}
    </div>
  );
}

/** Imtihon sahifasidagi (SAT tabi) qisqa karta: kurs holati va keyingi dars. */
export function SatCourseCard() {
  const progress = loadProgress();
  const all = SAT_TRACKS.flatMap((t) => t.units.flatMap((u) => u.lessons));
  const passed = all.filter((l) => progress[l.id]?.passedAt).length;
  const next = nextSatLesson(progress);
  return (
    <a className="card ielts-card" href={next ? `#/learn/${next.lesson.id}` : '#/sat'}>
      <span className="ielts-card-ic" aria-hidden="true"><GraduationCap size={22} /></span>
      <span className="ielts-card-tx">
        <b>{L('SAT kursi')} · {passed}/{all.length}  {L('dars')}</b>
        <span className="muted">{next ? L('Keyingi dars: {0}', [next.lesson.titleUz]) : L('Barcha darslar o‘tildi — savollar bilan mustahkamlang')}</span>
      </span>
      <ArrowRight size={18} />
    </a>
  );
}
