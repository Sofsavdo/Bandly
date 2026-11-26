import { ArrowRight, CheckCircle2, GraduationCap, Lock } from 'lucide-react';
import { useState } from 'react';
import { PRing } from '../components/PRing';
import { UNITS } from '../content/lessons';
import type { Unit } from '../content/lessons/types';
import { CEFR_HREF, rememberCourse } from '../lib/courseFrom';
import { openExamTab } from '../lib/examTab';
import { freeLeft } from '../lib/freeQuota';
import { isUnlocked, loadProgress, type ProgressMap } from '../lib/lessons';
import { CEFR, type Cefr } from '../lib/levels';
import { useProfile } from '../lib/store';
import { L } from '../i18n';

/**
 * CEFR kursi (Multilevel): darajalar bo'yicha General English darslari, lekin "Imtihon" bo'limi ichida —
 * dars ichida ham, orqaga qaytishda ham yo'l CEFR kursi bo'lib qoladi (General English xaritasiga tushib qolmaydi).
 * Multilevel'ga xos alohida dars matnlari yo'q: kurs daraja darslari + strategiya (IELTS kursi) + mashq testlaridan iborat.
 */
const unitsAt = (lv: Cefr): Unit[] => UNITS.filter((u) => u.level === lv);
const lessonsAt = (lv: Cefr) => unitsAt(lv).flatMap((u) => u.lessons);
const passedCount = (lv: Cefr, progress: ProgressMap) => lessonsAt(lv).filter((l) => progress[l.id]?.passedAt).length;

export default function CefrCourse() {
  const p = useProfile();
  const progress = loadProgress();
  const ctx = { units: UNITS, level: p.level };
  // Boshlang'ich daraja: o'quvchining darajasi (aniqlanmagan bo'lsa B1 — Multilevel'ning quyi chegarasi)
  const [lv, setLv] = useState<Cefr>(p.level ?? 'B1');
  const units = unitsAt(lv);
  const total = lessonsAt(lv).length;
  const passed = passedCount(lv, progress);
  let next: { unit: Unit; id: string; title: string } | undefined;
  for (const u of units) { const i = u.lessons.findIndex((l, k) => isUnlocked(u, k, progress, ctx) && !progress[l.id]?.passedAt); if (i >= 0) { next = { unit: u, id: u.lessons[i]!.id, title: u.lessons[i]!.titleUz }; break; } }
  const open = () => rememberCourse(CEFR_HREF);
  const left = freeLeft('ge');
  return (
    <div>
      <section className="card page-head">
        <h2 style={{ margin: 0 }}><GraduationCap size={22} />  {L('CEFR kursi')}</h2>
        <p style={{ margin: '6px 0 4px' }}>{L('Multilevel imtihoniga tayyorgarlik: daraja darslari, strategiyalar va mashq testlari.')}</p>
        <p className="muted" style={{ margin: '0 0 12px' }}>{lv}: {passed}/{total}  {L('dars')}{left !== null && <> · <a href="#/pricing">{L('Bugun bepul: {0} ta yangi dars', [left])}</a></>}</p>
        {!p.level && <p className="muted" style={{ margin: '0 0 10px', fontSize: 14 }}><a href="#/placement">{L('3 daqiqalik test — yo‘l shu natijaga qarab tuziladi.')}</a></p>}
        {next && <><p className="muted" style={{ margin: '0 0 8px', fontSize: 14 }}>{L('Keyingi dars:')} <b>{next.title}</b></p><a className="btn primary" href={`#/learn/${next.id}`} onClick={open}>{passed ? L('Davom ettirish') : L('Boshlash')} <ArrowRight size={16} /></a></>}
      </section>
      <div className="chips" role="tablist" aria-label={L('Daraja')}>
        {CEFR.map((c) => <button key={c} type="button" role="tab" aria-selected={lv === c} className={`chip ${lv === c ? 'on' : ''}`} onClick={() => setLv(c)}>{c} · {passedCount(c, progress)}/{lessonsAt(c).length}{p.level === c ? ' ★' : ''}</button>)}
      </div>
      {units.map((u) => {
        const done = u.lessons.filter((l) => progress[l.id]?.passedAt).length;
        return (
          <details key={u.id} className="cefr-unit" open={next?.unit.id === u.id}>
            <summary className="unit-head"><span className={`lvl-tag ${u.level}`}>{u.level}</span><h3>{u.titleUz}</h3><span className="muted" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }}>{done}/{u.lessons.length}</span></summary>
            <p className="muted" style={{ margin: '0 0 10px' }}>{u.situationUz}</p>
            <div className="lcards">
              {u.lessons.map((l, i) => {
                const ok = isUnlocked(u, i, progress, ctx);
                const pr = progress[l.id];
                const best = pr ? Math.round(pr.best * 100) : 0;
                const body = (
                  <>
                    <h3>{i + 1}. {l.titleUz}</h3>
                    <p>{l.objectiveUz}</p>
                    <PRing value={best} max={100} size={50} stroke={5} dark color="var(--peach)" label={L('Eng yaxshi natija {0}%', [best])}><b style={{ fontSize: 12 }}>{pr?.passedAt ? <CheckCircle2 size={16} color="var(--on-inv)" /> : `${best}%`}</b></PRing>
                    <div className="lfoot"><span className="lstart">{pr?.passedAt ? L('Takrorlash') : ok ? L('Boshlash') : <><Lock size={13} />  {L('Yopiq')}</>}</span><span className="muted" style={{ fontSize: 12.5 }}>{l.minutes}  {L('daq')}</span></div>
                  </>
                );
                return ok
                  ? <a key={l.id} className={`lcard ${pr?.passedAt ? 'done' : ''}`} href={`#/learn/${l.id}`} onClick={open}>{body}</a>
                  : <div key={l.id} className="lcard locked" aria-disabled="true">{body}</div>;
              })}
            </div>
          </details>
        );
      })}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>{L('Imtihon uchun mashq')}</h3>
        <div className="stack">
          <a className="path-step" href="#/exam" onClick={() => openExamTab('cefr')}><b>{L('Mock testlar')}</b><span>{L('Reading va Listening — rasmiy hajm va vaqt bilan. Xatolar izohi bilan.')}</span></a>
          <a className="path-step" href="#/ielts"><b>{L('IELTS kursi')}</b><span>{L('IELTS kursidagi Reading/Listening strategiya darslari Multilevel uchun ham ishlaydi (asosiy g‘oya, kalit so‘zlar, vaqtni boshqarish).')}</span></a>
          <a className="path-step" href="#/grammar"><b>{L('Grammatika')}</b><span>{L('Imtihonda ko‘p uchraydigan mavzular, o‘zbekcha izohlar bilan.')}</span></a>
        </div>
      </section>
    </div>
  );
}

/** Imtihon sahifasidagi (CEFR tabi) qisqa karta: kurs holati va keyingi dars. */
export function CefrCourseCard() {
  const p = useProfile();
  const progress = loadProgress();
  const lv: Cefr = p.level ?? 'B1';
  const total = lessonsAt(lv).length;
  const passed = passedCount(lv, progress);
  return (
    <a className="card ielts-card" href="#/cefr">
      <span className="ielts-card-ic" aria-hidden="true"><GraduationCap size={22} /></span>
      <span className="ielts-card-tx">
        <b>{L('CEFR kursi')} · {lv}: {passed}/{total}  {L('dars')}</b>
        <span className="muted">{L('Multilevel imtihoniga tayyorgarlik: daraja darslari, strategiyalar va mashq testlari.')}</span>
      </span>
      <ArrowRight size={18} />
    </a>
  );
}
