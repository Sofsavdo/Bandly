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

const ERR_UZ: Record<string, string> = {
  'G.tense': 'zamonlar', 'G.article': 'artikllar', 'G.preposition': 'predloglar', 'G.sva': 'ega-kesim moslashuvi', 'G.word_order': 'so‘z tartibi', 'G.modal': 'modal fe’llar',
  'G.conditional': 'shart gaplar', 'G.plural': 'ko‘plik', 'G.pronoun': 'olmoshlar', 'G.quantifier': 'miqdor', 'G.passive': 'majhul nisbat', 'G.relative_clause': 'nisbiy gaplar',
  'G.comparison': 'taqqoslash', 'G.gerund_infinitive': 'gerund/infinitiv', 'G.complex_structure': 'murakkab tuzilmalar', 'V.word_choice': 'so‘z tanlash', 'V.spelling': 'imlo',
  'R.inference': 'xulosa chiqarish (Reading)', 'R.detail': 'tafsilotni topish (Reading)', 'R.main_idea': 'asosiy g‘oya (Reading)',
  'L.detail': 'tafsilotni eshitish (Listening)', 'L.gist': 'umumiy mazmun (Listening)', 'L.distractor': 'chalg‘ituvchi javoblar (Listening)',
};
const levelOf = (l: string): number => ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].indexOf(l);

function whyUz(t: PlanTask): string {
  switch (t.reason) {
    case 'revision_due': return `Takrorlash vaqti keldi (${t.params.days} kun kechikkan).`;
    case 'repeated_error': return `Yaqinda «${ERR_UZ[String(t.params.taxonomy)] ?? t.params.taxonomy}» xatosini ${t.params.count} marta qildingiz — shu ustida ishlaymiz.`;
    case 'exam_soon': return `Imtihongacha ${t.params.days} kun qoldi.`;
    case 'goal_match': return 'Tanlagan maqsadingizga mos (yoki tekshiruv bo‘yicha zaif ko‘nikma).';
    case 'weak_skill': return `Hozirgi o‘zlashtirish darajangiz: ${t.params.mastery}%.`;
    default: return 'Yo‘lingizdagi keyingi qadam.';
  }
}

/** "Today's plan": built only from the learner's real placement level and answered items; never invented numbers. */
export function PlanCard() {
  const p = useProfile();
  if (!p.level) {
    return (
      <section className="card"><h3><CalendarCheck size={18} /> Bugungi reja</h3>
        <p className="muted">Reja sizning real darajangizga qurilishi uchun avval daraja testini topshiring.</p>
        <a className="btn sm primary" href="#/placement">Darajani aniqlash <ArrowRight size={14} /></a>
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
      <h3><CalendarCheck size={18} /> Bugungi reja <span className="pill">taxminiy · {plan.reduce((s, t) => s + t.minutes, 0)} daqiqa</span></h3>
      <p className="row">
        <span className="pill">Maqsad: {GOALS.find((g) => g.id === prefs.goal)!.labelUz}</span>
        <span className="pill">Kuniga {prefs.minutes} daq</span>
        <span className="pill">Bu hafta: {weekDone}/{weekTarget} dars</span>
        <button type="button" className="btn sm" onClick={() => setEdit((e) => !e)}>{edit ? 'Yopish' : 'Rejani sozlash'}</button>
      </p>
      {edit && (
        <div className="q">
          <p><b>Maqsadingiz</b></p>
          <p className="row">{GOALS.map((g) => <button key={g.id} type="button" className={`chipbtn ${prefs.goal === g.id ? 'on' : ''}`} onClick={() => update({ ...prefs, goal: g.id })}>{g.labelUz}</button>)}</p>
          <p><b>Kuniga qancha vaqt ajrata olasiz?</b></p>
          <p className="row">{MINUTES.map((m) => <button key={m} type="button" className={`chipbtn ${prefs.minutes === m ? 'on' : ''}`} onClick={() => update({ ...prefs, minutes: m })}>{m} daq</button>)}</p>
          {prefs.goal !== 'general' && (
            <p className="row"><label>Imtihon sanasi: <input type="date" value={p.examDate ?? ''} onChange={(e) => setTarget(p.target, e.target.value || null)} /></label></p>
          )}
          <p className="muted" style={{ fontSize: 13 }}>Haftalik maqsad: kuniga {prefs.minutes} daqiqa × 5 kun ÷ ~12 daqiqalik dars = {weekTarget} ta dars.</p>
        </div>
      )}
      {load.lowered && !full && <p className="muted" style={{ fontSize: 14 }}>Oxirgi {rv.days} kunda rejaning {Math.round((rv.rate ?? 0) * 100)}% i bajarildi, shuning uchun bugungi reja {prefs.minutes} → {load.minutes} daqiqaga yengillashtirildi. <button type="button" className="btn sm" onClick={() => setFull(true)}>To‘liq rejani ko‘rsatish</button></p>}
      {load.suggestMore && <p className="muted" style={{ fontSize: 14 }}>Oxirgi {rv.days} kunda rejaning {Math.round((rv.rate ?? 0) * 100)}% ini bajardingiz — zo‘r! Xohlasangiz, “Rejani sozlash”da kunlik vaqtni oshiring.</p>}
      {weak.length > 0 && <p className="muted" style={{ fontSize: 14 }}>Ko‘nikmalar tekshiruvi bo‘yicha {weak.map((w) => (w === 'reading' ? 'Reading' : 'Listening')).join(' va ')} umumiy darajangizdan past — rejada unga ko‘proq joy beriladi.</p>}
      {prefs.goal === 'sat' && <a className="path-step" href="#/exam"><b>SAT mashqi</b><span>Imtihon → SAT: Reading and Writing va Math savollari</span></a>}
      {prefs.goal === 'cefr' && <a className="path-step" href="#/exam"><b>CEFR Multilevel</b><span>Imtihon → CEFR: format va yozma ish mashqi (rasmiy so‘z hajmida)</span></a>}
      {mistakesDue > 0 && <a className="path-step" href="#/mistakes"><b>Xatolar ustida ishlash · {mistakesDue} ta</b><span>Avval qilgan xatolaringiz takrorlash vaqti keldi — eng foydali 5 daqiqa.</span></a>}
      {plan.length === 0 && <p className="muted">Bugun uchun yangi vazifa topilmadi. Grammar bo‘limida mashq qilib ko‘ring.</p>}
      <div className="stack">
        {plan.map((t) => {
          const node = nodeById(t.nodeId);
          const isVocab = node?.skill === 'vocabulary';
          const skillTitle = skillNodeTitle(t.nodeId);
          const lesson = ALL_LESSONS.find((x) => `ge.lesson.${x.lesson.id}` === t.nodeId);
          const title = lesson ? `Dars: ${lesson.lesson.titleUz}` : skillTitle ?? (isVocab ? `So‘z boyligi · ${node!.level}` : (topicOfNode(t.nodeId) ?? t.nodeId));
          const href = lesson ? `#/learn/${lesson.lesson.id}` : node?.skill === 'reading' ? '#/mocks/reading' : node?.skill === 'listening' ? '#/mocks/listening' : isVocab ? '#/games' : '#/grammar';
          return (
            <a key={t.nodeId} className="path-step" href={href} onClick={() => { if (href === '#/grammar') { try { sessionStorage.setItem('bandly.nextTopic', title); } catch { /* ignore */ } } }}>
              <b>{title}</b><span>{t.minutes} daq · {whyUz(t)}</span>
            </a>
          );
        })}
      </div>
      <p className="muted" style={{ fontSize: 13 }}>Reja daraja testingiz hamda General English darslari, Grammar, Gap tuzish, so‘z o‘yinlari, Reading va Listening testlaridagi javoblaringiz asosida tuziladi; bilimingiz o‘zgarganda yangilanadi.</p>
    </section>
  );
}
