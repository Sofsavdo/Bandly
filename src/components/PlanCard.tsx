import { CalendarCheck, ArrowRight } from 'lucide-react';
import { ALL_NODES, nodeById, skillNodeTitle, topicOfNode } from '../content/curriculum/inventory';
import { ALL_LESSONS } from '../content/lessons';
import { loadAdaptive } from '../lib/adaptive/store';
import type { PlanTask } from '../lib/adaptive/recommend';
import { useEffect, useState } from 'react';
import { adjustMinutes, loadLog, recordPlanned, review } from '../lib/planLog';
import { localDayKey } from '../lib/adaptive/store';
import { buildDailyPlan } from '../lib/dailyPlan';
import { GOALS, MINUTES, loadPrefs, savePrefs, weekStart, weeklyLessonTarget, type PlanPrefs } from '../lib/planPrefs';
import { loadSkills } from '../lib/skillCheck';
import { loadProgress } from '../lib/lessons';
import { setTarget } from '../lib/store';
import { levelIndex, type Cefr } from '../lib/levels';
import { useProfile } from '../lib/store';
import { dueMistakes } from '../lib/mistakes';
import { L } from '../i18n';

const ERR_UZ: Record<string, string> = {
  'G.tense': 'zamonlar', 'G.article': 'artikllar', 'G.preposition': 'predloglar', 'G.sva': 'ega-kesim moslashuvi', 'G.word_order': L('so‘z tartibi'), 'G.modal': L('modal fe’llar'),
  'G.conditional': L('shart gaplar'), 'G.plural': L('ko‘plik'), 'G.pronoun': 'olmoshlar', 'G.quantifier': 'miqdor', 'G.passive': 'majhul nisbat', 'G.relative_clause': L('nisbiy gaplar'),
  'G.comparison': 'taqqoslash', 'G.gerund_infinitive': 'gerund/infinitiv', 'G.complex_structure': 'murakkab tuzilmalar', 'V.word_choice': L('so‘z tanlash'), 'V.spelling': 'imlo',
  'R.inference': 'xulosa chiqarish (Reading)', 'R.detail': 'tafsilotni topish (Reading)', 'R.main_idea': L('asosiy g‘oya (Reading)'),
  'L.detail': 'tafsilotni eshitish (Listening)', 'L.gist': 'umumiy mazmun (Listening)', 'L.distractor': L('chalg‘ituvchi javoblar (Listening)'),
};
const levelOf = (l: string): number => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(l);

function whyUz(t: PlanTask): string {
  switch (t.reason) {
    case 'revision_due': return L('Takrorlash vaqti keldi ({0} kun kechikkan).', [t.params.days]);
    case 'repeated_error': return L('Yaqinda «{0}» xatosini {1} marta qildingiz — shu ustida ishlaymiz.', [ERR_UZ[String(t.params.taxonomy)] ?? t.params.taxonomy, t.params.count]);
    case 'exam_soon': return L('Imtihongacha {0} kun qoldi.', [t.params.days]);
    case 'goal_match': return L('Tanlagan maqsadingizga mos (yoki tekshiruv bo‘yicha zaif ko‘nikma).');
    case 'weak_skill': return L('Hozirgi o‘zlashtirish darajangiz: {0}%.', [t.params.mastery]);
    default: return L('Yo‘lingizdagi keyingi qadam.');
  }
}

/** "Today's plan": built only from the learner's real placement level and answered items; never invented numbers. */
export function PlanCard() {
  const p = useProfile();
  if (!p.level) {
    return (
      <section className="card"><h3><CalendarCheck size={18} />  {L('Bugungi reja')}</h3>
        <p className="muted">{L('Reja sizning real darajangizga qurilishi uchun avval daraja testini topshiring.')}</p>
        <a className="btn sm primary" href="#/placement">{L('Darajani aniqlash')} <ArrowRight size={14} /></a>
      </section>
    );
  }
  return <PlanBody />;
}

/** Separate component so its hooks always run in the same order (the level check above returns early). */
function PlanBody() {
  const p = useProfile();
  const [prefs, setPrefs] = useState<PlanPrefs>(() => loadPrefs());
  const [edit, setEdit] = useState(false);
  const [full, setFull] = useState(false);
  const mistakesDue = dueMistakes().length;
  const skills = loadSkills();
  const examDate = p.examDate ? new Date(p.examDate).getTime() : undefined;
  const saved = loadAdaptive();
  const today = localDayKey(Date.now());
  const rv = review(loadLog(), saved.mastery, today);
  const load = adjustMinutes(prefs.minutes, rv);
  const minutes = full ? prefs.minutes : load.minutes;
  const { tasks: plan, weak } = buildDailyPlan({ level: p.level!, saved, prefs: { ...prefs, minutes }, skills, examDate, now: Date.now() });
  const planKey = plan.map((t) => t.nodeId).join(',');
  useEffect(() => { recordPlanned(today, planKey ? planKey.split(',') : []); }, [today, planKey]);
  const weekTarget = weeklyLessonTarget(prefs.minutes);
  const since = weekStart();
  const lp = loadProgress();
  const weekDone = Object.values(lp).filter((x) => x.passedAt && x.passedAt >= since).length;
  const update = (np: PlanPrefs) => { setPrefs(np); savePrefs(np); };
  return (
    <section className="card">
      <h3><CalendarCheck size={18} />  {L('Bugungi reja')} <span className="pill">{plan.reduce((s, t) => s + t.minutes, 0)}  {L('daqiqa')}</span></h3>
      <p className="row">
        <span className="pill">{L('Maqsad:')} {GOALS.find((g) => g.id === prefs.goal)!.labelUz}</span>
        <span className="pill">{L('Kuniga')} {prefs.minutes}  {L('daq')}</span>
        <span className="pill">{L('Bu hafta:')} {weekDone}/{weekTarget}  {L('dars')}</span>
        <button type="button" className="btn sm" onClick={() => setEdit((e) => !e)}>{edit ? L('Yopish') : L('Rejani sozlash')}</button>
      </p>
      {edit && (
        <div className="q">
          <p><b>{L('Maqsadingiz')}</b></p>
          <p className="row">{GOALS.map((g) => <button key={g.id} type="button" className={`chipbtn ${prefs.goal === g.id ? 'on' : ''}`} onClick={() => update({ ...prefs, goal: g.id })}>{g.labelUz}</button>)}</p>
          <p><b>{L('Kuniga qancha vaqt ajrata olasiz?')}</b></p>
          <p className="row">{MINUTES.map((m) => <button key={m} type="button" className={`chipbtn ${prefs.minutes === m ? 'on' : ''}`} onClick={() => update({ ...prefs, minutes: m })}>{m}  {L('daq')}</button>)}</p>
          {prefs.goal !== 'general' && (
            <p className="row"><label>{L('Imtihon sanasi:')} <input type="date" value={p.examDate ?? ''} onChange={(e) => setTarget(p.target, e.target.value || null)} /></label></p>
          )}
          <p className="muted" style={{ fontSize: 13 }}>{L('Haftalik maqsad: kuniga')} {prefs.minutes}  {L('daqiqa × 5 kun ÷ ~12 daqiqalik dars =')} {weekTarget}  {L('ta dars.')}</p>
        </div>
      )}
      {load.lowered && !full && <p className="muted" style={{ fontSize: 14 }}>{L('Oxirgi')} {rv.days}  {L('kunda rejaning')} {Math.round((rv.rate ?? 0) * 100)}{L('% i bajarildi, shuning uchun bugungi reja')} {prefs.minutes} → {load.minutes}  {L('daqiqaga yengillashtirildi.')} <button type="button" className="btn sm" onClick={() => setFull(true)}>{L('To‘liq rejani ko‘rsatish')}</button></p>}
      {load.suggestMore && <p className="muted" style={{ fontSize: 14 }}>{L('Oxirgi')} {rv.days}  {L('kunda rejaning')} {Math.round((rv.rate ?? 0) * 100)}{L('% ini bajardingiz — zo‘r! Xohlasangiz, “Rejani sozlash”da kunlik vaqtni oshiring.')}</p>}
      {weak.length > 0 && <p className="muted" style={{ fontSize: 14 }}>{L('Ko‘nikmalar tekshiruvi bo‘yicha')} {weak.map((w) => (w === 'reading' ? 'Reading' : 'Listening')).join(' va ')}  {L('umumiy darajangizdan past — rejada unga ko‘proq joy beriladi.')}</p>}
      {prefs.goal === 'sat' && <a className="path-step" href="#/exam"><b>{L('SAT mashqi')}</b><span>{L('Imtihon → SAT: Reading and Writing va Math savollari')}</span></a>}
      {prefs.goal === 'cefr' && <a className="path-step" href="#/exam"><b>{L('CEFR Multilevel')}</b><span>{L('Imtihon → CEFR: format va yozma ish mashqi')}</span></a>}
      {mistakesDue > 0 && <a className="path-step" href="#/mistakes"><b>{L('Xatolar ustida ishlash ·')} {mistakesDue}  {L('ta')}</b><span>{L('Avval qilgan xatolaringiz takrorlash vaqti keldi — eng foydali 5 daqiqa.')}</span></a>}
      {plan.length === 0 && <p className="muted">{L('Bugun uchun yangi vazifa topilmadi. Grammar bo‘limida mashq qilib ko‘ring.')}</p>}
      <div className="stack">
        {plan.map((t) => {
          const node = nodeById(t.nodeId);
          const isVocab = node?.skill === 'vocabulary';
          const skillTitle = skillNodeTitle(t.nodeId);
          const lesson = ALL_LESSONS.find((x) => `ge.lesson.${x.lesson.id}` === t.nodeId);
          const title = lesson ? L('Dars: {0}', [lesson.lesson.titleUz]) : skillTitle ?? (isVocab ? L('So‘z boyligi · {0}', [node!.level]) : (topicOfNode(t.nodeId) ?? t.nodeId));
          const href = lesson ? `#/learn/${lesson.lesson.id}` : node?.skill === 'reading' ? '#/mocks/reading' : node?.skill === 'listening' ? '#/mocks/listening' : isVocab ? '#/games' : '#/grammar';
          return (
            <a key={t.nodeId} className="path-step" href={href} onClick={() => { if (href === '#/grammar') { try { sessionStorage.setItem('bandly.nextTopic', title); } catch { /* ignore */ } } }}>
              <b>{title}</b><span>{t.minutes}  {L('daq ·')} {whyUz(t)}</span>
            </a>
          );
        })}
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{L('Reja natijalaringizga qarab har kuni yangilanadi.')}</p>
    </section>
  );
}
