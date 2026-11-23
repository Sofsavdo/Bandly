import { ArrowLeft, ArrowRight, Flame, Heart, RotateCcw, Star } from 'lucide-react';
import { trackUser } from '../lib/track';
import { ClipButton } from '../components/ClipButton';
import { ItemView } from '../components/LessonItem';
import { useEffect, useMemo, useRef, useState } from 'react';
import { lessonById, lessonNodeId, lessonWordIds, nextInCourse, isIeltsLesson, ieltsUnlocked, UNITS } from '../content/lessons';
import { checkItem, correctAnswerText, fullSentence, isUnlocked, loadProgress, PASS_RATE, saveAttempt, scoreCheck, type ItemAnswer } from '../lib/lessons';
import { advanceQueue, bossHp, lessonStars } from '../lib/lessonGame';
import { BossBar, DiscoverDeck, FeedbackSheet, MissionIntro } from '../components/LessonGames';
import { confetti, sfx } from '../lib/fx';
import { addMistake } from '../lib/mistakes';
import { recordAnswer } from '../lib/adaptive/store';
import { addToReview, addXp, getProfile, pushToast } from '../lib/store';
import { answer, checkXp, lessonXpDay, markLessonXp, MAX_HEARTS, newPace, newPlay, pace, refill, SLOW_DOWN_UZ, type LessonPlay, type Pace } from '../lib/gamify';
import { localDayKey } from '../lib/adaptive/store';
import { saveResult } from '../lib/storage';
import { LessonSpeak } from '../components/LessonSpeak';
import { LessonWrite } from '../components/LessonWrite';
import { Illo } from '../components/Illo';
import { PRing } from '../components/PRing';
import { DailyLimit } from '../components/DailyLimit';
import { requestUnlock } from '../lib/freeQuota';
import { L } from '../i18n';

type Step = 'learn' | 'practice' | 'speak' | 'write' | 'check' | 'result';
const STEP_UZ: Record<Exclude<Step, 'result'>, string> = { learn: L('Kashf et'), practice: L('Mashq'), speak: L('Gapir'), write: L('Yoz'), check: L('Boss jang') };

export default function LessonPage({ id }: { id: string }) {
  const found = lessonById(id);
  const [started, setStarted] = useState(false);
  const [limitAt, setLimitAt] = useState<number | null>(null); // kunlik bepul dars tugagan bo'lsa — qachon ochiladi
  const [step, setStepState] = useState<Step>('learn');
  const [reached, setReached] = useState(0); // eng uzoq ochilgan qadam (oldinga sakrab bo'lmaydi)
  const [speakDone, setSpeakDone] = useState(false);
  const [writeDone, setWriteDone] = useState(false);
  // Mashq: bitta topshiriq ekranda; xato topshiriq oxirida yana bir marta qaytadi
  const [pQueue, setPQueue] = useState<number[]>(() => (lessonById(id)?.lesson.practice ?? []).map((_, i) => i));
  const [pRetried, setPRetried] = useState<Set<number>>(new Set());
  const [pVal, setPVal] = useState<ItemAnswer>(undefined);
  const [pFb, setPFb] = useState<{ ok: boolean; xp: number } | null>(null);
  const [pTurn, setPTurn] = useState(0);
  const [cCur, setCCur] = useState(0);
  const [cFb, setCFb] = useState<boolean | null>(null);
  const [cAns, setCAns] = useState<ItemAnswer[]>([]);
  const [result, setResult] = useState<ReturnType<typeof scoreCheck> | null>(null);
  const [round, setRound] = useState(0);
  const [vocabMsg, setVocabMsg] = useState('');
  // O'yin qatlami (GAMIFIED_LEARNING_SPEC.md §3.2–3.3): jon va combo faqat mashqda; jon tugasa — xatolar ustida qayta ishlash
  const [play, setPlay] = useState<LessonPlay>(newPlay);
  const [wrongs, setWrongs] = useState<number[]>([]);
  const [relearn, setRelearn] = useState<number[] | null>(null);
  const [rAns, setRAns] = useState<Record<number, ItemAnswer>>({});
  const [rShown, setRShown] = useState<Record<number, boolean>>({});
  const [gained, setGained] = useState(0);
  const [cShown, setCShown] = useState<boolean[]>([]);
  // Shoshilinch javoblarga XP berilmaydi (mastery baribir yoziladi)
  const paceRef = useRef<Pace>(newPace(Date.now()));
  const [suppressedCheck, setSuppressedCheck] = useState<Set<number>>(new Set());
  const [slowMsg, setSlowMsg] = useState(false);
  const paced = (item: { kind: string }, v: ItemAnswer): boolean => {
    const r = pace(paceRef.current, Date.now(), item.kind === 'choice' && typeof v === 'number' ? v : null);
    paceRef.current = r.pace;
    if (r.suppress && !slowMsg) { setSlowMsg(true); pushToast(SLOW_DOWN_UZ, 'xp'); }
    if (!r.suppress) setSlowMsg(false);
    return r.suppress;
  };
  // Jon tugaganda "qayta o'rganish" paneli darhol ko'rinsin
  useEffect(() => { if (relearn !== null) document.querySelector('.relearn')?.scrollIntoView({ block: 'start' }); }, [relearn]);
  // G'alaba: konfeti va fanfara
  useEffect(() => { if (step === 'result' && result?.passed) { confetti(); sfx('level'); } }, [step, result]);
  useEffect(() => { window.scrollTo({ top: 0 }); }, [step, started]);
  const next = useMemo(() => nextInCourse(id), [id]);
  const ielts = isIeltsLesson(id);
  const back = ielts ? '#/ielts' : '#/learn';

  if (!found) return <div className="card"><h2>{L('Dars topilmadi')}</h2><a className="btn" href={back}>{L('Darslar ro‘yxati')}</a></div>;
  const { unit, lesson, index } = found;
  if (!(ielts ? ieltsUnlocked(unit, index, loadProgress(), getProfile().level) : isUnlocked(unit, index, loadProgress(), { units: UNITS, level: getProfile().level }))) return <div className="card"><h2>{lesson.titleUz}</h2><p>{ielts && index === 0 ? L('Bu bo‘lim Start darslarini tugatganingizdan keyin (yoki darajangiz B2 bo‘lsa) ochiladi.') : L('Bu dars avvalgi darsdan o‘tganingizdan keyin ochiladi.')}</p><a className="btn" href={back}>{L('Darslar ro‘yxati')}</a></div>;

  const ORDER: Step[] = ['learn', 'practice', ...(lesson.skipSpeak ? [] : ['speak' as const]), ...(lesson.writing ? ['write' as const] : []), 'check', 'result'];
  /** Qadamga o'tish: faqat ochilgan qadamlar yoki navbatdagisi. */
  const setStep = (s: Step) => { const i = ORDER.indexOf(s); setReached((r) => Math.max(r, i)); setStepState(s); };
  const submitCheck = () => {
    const r = scoreCheck(lesson.check, cAns);
    const now = Date.now();
    lesson.check.forEach((it, i) => recordAnswer(lessonNodeId(lesson.id), checkItem(it, cAns[i]), lesson.taxonomyIds, now));
    lesson.check.forEach((it, i) => { if (!checkItem(it, cAns[i])) addMistake('lesson', { kind: 'lesson', lessonId: lesson.id, part: 'check', index: i }, lesson.taxonomyIds, now); }); // wrong answers come back in “Xatolar ustida ishlash”
    const firstPassEver = !loadProgress()[lesson.id]?.passedAt;
    const today = localDayKey(now);
    const counted = r.correct - lesson.check.filter((it, i) => suppressedCheck.has(i) && checkItem(it, cAns[i])).length;
    const xp = checkXp(counted, r.passed, firstPassEver, lessonXpDay(lesson.id) === today); // takror bir kunda kamroq (GAMIFIED §3.1)
    saveAttempt(lesson.id, r, now);
    saveResult({ kind: 'grammar', title: L('Dars: {0}', [lesson.titleUz]), correct: r.correct, total: r.total });
    addXp(xp, 'lesson', `${lesson.id}:check:${today}`); markLessonXp(lesson.id, today); setGained((g) => g + xp);
    if (r.passed) addToReview(lessonWordIds(lesson.id), now); // lesson words join the spaced-repetition deck
    setResult(r); setStep('result');
  };
  const retry = () => { setCAns([]); setCShown([]); setCCur(0); setCFb(null); setSuppressedCheck(new Set()); setResult(null); setRound((x) => x + 1); setPlay((p) => ({ ...p, hearts: Math.max(p.hearts, 3) })); setStep('check'); };

  const revealPractice = () => {
    const i = pQueue[0]!;
    const ok = checkItem(lesson.practice[i]!, pVal);
    const slow = paced(lesson.practice[i]!, pVal);
    const a = answer(play, ok); // bitta bosish — bitta hodisa; yon ta'sirlar holat yangilovchisidan tashqarida
    const np = slow || pRetried.has(i) ? { ...a, xp: play.xp } : a; // qaytgan topshiriqqa XP yo'q
    setPlay(np);
    setPFb({ ok, xp: np.xp - play.xp });
    sfx(ok ? 'ok' : 'bad');
    if (ok && (np.combo === 3 || np.combo === 5 || np.combo === 10)) pushToast(`Combo ×${np.combo}!`, 'xp');
    if (!ok) {
      const nw = wrongs.includes(i) ? wrongs : [...wrongs, i];
      setWrongs(nw);
      if (np.hearts === 0) setRelearn(nw.length ? nw : [0, 1, 2]);
    }
  };
  const nextPractice = () => {
    const r = advanceQueue(pQueue, !!pFb?.ok, pRetried);
    setPQueue(r.queue); setPRetried(r.retried); setPVal(undefined); setPFb(null); setPTurn((t) => t + 1);
  };
  const revealCheck = (i: number) => {
    const ok = checkItem(lesson.check[i]!, cAns[i]);
    setCShown((x) => { const n = [...x]; n[i] = true; return n; });
    setCFb(ok); sfx(ok ? 'ok' : 'bad');
    if (paced(lesson.check[i]!, cAns[i])) setSuppressedCheck((x) => new Set(x).add(i));
    const np = { ...answer(play, ok), xp: play.xp }; // tekshiruv XP'si yakunda checkXp bilan hisoblanadi
    setPlay(np);
    if (ok && (np.combo === 3 || np.combo === 5 || np.combo === 10)) pushToast(`Combo ×${np.combo}!`, 'xp');
    if (!ok && np.hearts === 0) setRelearn(wrongs.length ? wrongs : [0, 1, 2]); // mashqdagi xatolar (yoki birinchi 3 ta) — tekshiruv javoblari ochiq bo'lgani uchun ular qayta berilmaydi
  };
  const finishPractice = () => {
    const key = `${lesson.id}:practice`;
    const today = localDayKey(Date.now());
    if (play.xp > 0 && lessonXpDay(key) !== today) { addXp(play.xp, 'lesson', `${lesson.id}:practice:${today}`); markLessonXp(key, today); setGained((g) => g + play.xp); } // mashq XP kuniga bir marta
    setStep(lesson.skipSpeak ? (lesson.writing ? 'write' : 'check') : 'speak');
  };
  const relearnPanel = () => relearn !== null && (
            <div className="relearn card">
        <h3><Heart size={18} />  {L('Jonlar tugadi — keling, qoidani qayta ko‘rib chiqamiz')}</h3>
        <p>{lesson.explanationUz[0]}</p>
        <p className="muted">{L('Shu savollarni to‘g‘ri yeching — 3 ta jon qaytadi.')}</p>
        {relearn.map((i) => (
          <div key={i}>
            <ItemView item={lesson.practice[i]!} value={rAns[i]} revealed={!!rShown[i]} onChange={(v) => setRAns((a) => ({ ...a, [i]: v }))} />
            {!rShown[i] && <button className="btn sm" disabled={rAns[i] === undefined} onClick={() => setRShown((x) => ({ ...x, [i]: true }))}>{L('Tekshirish')}</button>}
            {rShown[i] && !checkItem(lesson.practice[i]!, rAns[i]) && <button className="btn sm" onClick={() => { setRAns((a) => { const n = { ...a }; delete n[i]; return n; }); setRShown((x) => ({ ...x, [i]: false })); }}><RotateCcw size={14} />  {L('Yana urinish')}</button>}
          </div>
        ))}
        <button className="btn primary" disabled={!relearn.every((i) => rShown[i] && checkItem(lesson.practice[i]!, rAns[i]))} onClick={() => { setPlay((p) => refill(p)); setRelearn(null); setWrongs([]); setRAns({}); setRShown({}); }}>{L('Tushundim — 3 ta jonni qaytarish')}</button>
      </div>
  );
  const steps = ['learn', 'practice', ...(lesson.skipSpeak ? [] : ['speak' as const]), ...(lesson.writing ? ['write' as const] : []), 'check'] as const;
  const stepIdx = step === 'result' ? steps.length : steps.indexOf(step as (typeof steps)[number]);

  return (
    <div>
      <a className="btn sm" href={back}><ArrowLeft size={14} />  {ielts ? L('IELTS kursi') : L('Darslar')}</a>
      <div className="lesson-hud sticky" aria-label={L('Dars holati')}>
        <div className="seg-progress" role="img" aria-label={L('{0} / {1} qadam', [Math.min(stepIdx + 1, steps.length), steps.length])}>{steps.map((st, i) => <i key={st} className={i < stepIdx ? 'done' : i === stepIdx ? 'now' : ''} />)}</div>
        <span className="hud-hearts" role="img" aria-label={L('{0} ta jon', [play.hearts])}>{Array.from({ length: MAX_HEARTS }, (_, i) => <Heart key={i} size={16} className={i < play.hearts ? 'full' : 'empty'} />)}</span>
        {play.combo >= 2 && <span className="hud-combo" role="img" aria-label={`Combo ${play.combo}`}><Flame size={16} /> ×{play.combo}</span>}
      </div>
      {!started && limitAt !== null ? (
        <DailyLimit course={ielts ? 'ielts' : 'ge'} resetAt={limitAt} back={back} />
      ) : !started ? (
        <MissionIntro unit={unit} lesson={lesson} steps={steps.map((st) => STEP_UZ[st])} onStart={() => {
          // Bepul tarif: o'tilgan dars — takrorlash bepul; yangi dars — kunlik kvotadan (obunachiga cheklov yo'q)
          trackUser('lesson_start');
          if (loadProgress()[lesson.id]?.passedAt) { setStarted(true); return; }
          void requestUnlock(ielts ? 'ielts' : 'ge', lesson.id).then((r) => { if (r.ok) setStarted(true); else setLimitAt(r.resetAt); });
        }} />
      ) : (
      <section className="card page-head lesson-head" style={{ marginTop: 10 }}>
        <small className="muted" style={{ fontWeight: 650 }}>{unit.level} · {unit.titleUz} · {lesson.minutes}  {L('daq')}</small>
        <h2 style={{ margin: '4px 0 10px' }}>{lesson.titleUz}</h2>
        <div className="chips" role="tablist" style={{ margin: 0 }}>
          {steps.map((s, i) => (
            <button key={s} role="tab" aria-selected={step === s} disabled={i > reached} className={`chip ${step === s || (step === 'result' && s === 'check') ? 'on' : ''}`} onClick={() => { if (i <= reached) setStep(s); }}>{i + 1}. {STEP_UZ[s]}</button>
          ))}
        </div>
      </section>
      )}

      {started && step === 'learn' && (
        <DiscoverDeck lesson={lesson} onDone={() => setStep('practice')} wordsMsg={vocabMsg}
          onAddWords={() => { const n = addToReview(lessonWordIds(lesson.id)); setVocabMsg(n ? L('{0} ta so‘z takrorlash ro‘yxatiga qo‘shildi — ular O‘yinlar bo‘limida (Pairs, Spell, Word Rush) takrorlash uchun chiqadi.', [n]) : L('Bu so‘zlar allaqachon takrorlash ro‘yxatida.')); }} />
      )}

      {started && step === 'practice' && (
        <section className="card game-card">
          {slowMsg && <p className="notice" role="status">{SLOW_DOWN_UZ}{L('. Juda tez berilgan javoblarga XP yozilmaydi.')}</p>}
          <div className="game-meta"><div className="mini-track" role="img" aria-label={L('{0} / {1} topshiriq', [lesson.practice.length - pQueue.length, lesson.practice.length])}><i style={{ width: `${(100 * (lesson.practice.length - pQueue.length)) / Math.max(1, lesson.practice.length)}%` }} /></div><span>{L('Qoldi: {0}', [pQueue.length])}</span>{pQueue[0] !== undefined && pRetried.has(pQueue[0]) && <span className="pill retry-pill"><RotateCcw size={12} /> {L('Xato qaytdi')}</span>}</div>
          {pQueue[0] !== undefined ? (() => {
            const i = pQueue[0];
            const it = lesson.practice[i]!;
            return (
              <div key={pTurn}>
                <ItemView item={it} value={pVal} revealed={!!pFb} quiet onChange={(v) => setPVal(v)} />
                {!pFb && <button className="btn primary block" disabled={relearn !== null || pVal === undefined || (Array.isArray(pVal) && !pVal.length) || (typeof pVal === 'string' && !pVal.trim())} onClick={revealPractice}>{L('Tekshirish')}</button>}
                {pFb && relearn === null && <FeedbackSheet ok={pFb.ok} n={pTurn} xp={pFb.xp} answer={correctAnswerText(it)} sentence={fullSentence(it)} explain={it.explainUz} onNext={nextPractice} />}
              </div>
            );
          })() : (
            <div className="game-done">
              <h3><Flame size={18} /> {L('Mashq tugadi!')}</h3>
              <p className="muted">{L('+{0} XP · eng uzun combo ×{1}', [play.xp, play.maxCombo])}</p>
              <button className="btn primary block" onClick={finishPractice}>{L('Gapirish mashqiga o‘tish')} <ArrowRight size={14} /></button>
            </div>
          )}
          {relearn !== null && relearnPanel()}
        </section>
      )}

      {started && step === 'speak' && (
        <section className="card">
          <LessonSpeak sentences={lesson.examples.map((e) => e.en)} onDone={() => setSpeakDone(true)} />
          <button className="btn primary" style={{ marginTop: 14 }} disabled={!speakDone} onClick={() => setStep(lesson.writing ? 'write' : 'check')}>{lesson.writing ? L('Yozish mashqiga o‘tish') : L('Yakuniy tekshiruvga o‘tish')} <ArrowRight size={14} /></button>
        </section>
      )}

      {started && step === 'write' && lesson.writing && (
        <section className="card">
          <LessonWrite task={lesson.writing} onDone={() => setWriteDone(true)} />
          <button className="btn primary" style={{ marginTop: 14 }} disabled={!writeDone} onClick={() => setStep('check')}>{L('Yakuniy tekshiruvga o‘tish')} <ArrowRight size={14} /></button>
        </section>
      )}

      {started && step === 'check' && (
        <section className="card game-card boss-card" key={round}>
          <BossBar hp={bossHp(lesson.check.length, lesson.check.filter((it, i) => cShown[i] && checkItem(it, cAns[i])).length)} label={L('Dars bossi')} />
          {slowMsg && <p className="notice" role="status">{SLOW_DOWN_UZ}{L('. Juda tez berilgan javoblarga XP yozilmaydi.')}</p>}
          <p className="muted game-meta">{L('Savol {0} / {1} · g‘alaba uchun kamida {2} ta to‘g‘ri javob', [Math.min(cCur + 1, lesson.check.length), lesson.check.length, Math.ceil(PASS_RATE * lesson.check.length)])}</p>
          {lesson.check[cCur] && (() => {
            const it = lesson.check[cCur]!;
            return (
              <div key={cCur}>
                <ItemView item={it} value={cAns[cCur]} revealed={!!cShown[cCur]} quiet onChange={(v) => setCAns((a) => { const n = [...a]; n[cCur] = v; return n; })} />
                {!cShown[cCur] && <button className="btn primary block" disabled={relearn !== null || cAns[cCur] === undefined || (Array.isArray(cAns[cCur]) && !(cAns[cCur] as string[]).length) || (typeof cAns[cCur] === 'string' && !(cAns[cCur] as string).trim())} onClick={() => revealCheck(cCur)}>{L('Zarba berish')}</button>}
                {cShown[cCur] && cFb !== null && relearn === null && <FeedbackSheet ok={cFb} n={cCur + 3} answer={correctAnswerText(it)} sentence={fullSentence(it)} explain={it.explainUz} onNext={() => { setCFb(null); if (cCur + 1 >= lesson.check.length) submitCheck(); else setCCur(cCur + 1); }} />}
              </div>
            );
          })()}
          {relearn !== null && relearnPanel()}
        </section>
      )}

      {step === 'result' && result && (
        <section className="card">
          <div className="result-hero">
            <PRing value={result.correct} max={result.total} size={112} stroke={11} color={result.passed ? 'var(--green)' : 'var(--coral)'} label={L('{0}/{1} to‘g‘ri', [result.correct, result.total])}><b style={{ fontSize: 28 }}>{Math.round(result.rate * 100)}%</b></PRing>
            <div><h2 style={{ margin: 0 }}>{result.passed ? L('Boss yengildi — missiya bajarildi!') : L('Bu safar boss yutdi')}</h2>
              <p className="stars-row" aria-label={L('{0} ta yulduz', [lessonStars(result.rate, result.passed)])}>{[0, 1, 2].map((k) => <Star key={k} size={26} className={k < lessonStars(result.rate, result.passed) ? 'on' : ''} />)}</p>
              <p className="muted" style={{ margin: '4px 0 0' }}>{result.correct}/{result.total}  {L('to‘g‘ri')}{gained > 0 ? ` · +${gained} XP` : ''}</p>
              {!result.passed && <p className="muted" style={{ margin: '4px 0 0' }}>{L('Xatolar «Xatolarim» bo‘limiga tushdi. Qoidani yana bir ko‘rib, qayta jang qiling.')}</p>}</div>
            {result.passed && <Illo kind="trophy" size={96} />}
          </div>
          {play.maxCombo >= 2 && <p className="row"><span className="pill"><Flame size={13} />  {L('eng uzun combo ×')}{play.maxCombo}</span></p>}
          {/* Esda tuting: darsning asosiy g'oyasi va 3 ta namuna gap — mustahkamlash uchun (takrorlash ro'yxatiga ham tushadi) */}
          <div className="takeaway">
            <b>{L('Esda tuting')}</b>
            <p>{lesson.objectiveUz}</p>
            <ul>{lesson.examples.slice(0, 3).map((e) => <li key={e.en}><ClipButton className="icon-btn sm" text={e.en} audio={e.audio} size={14} /><span><b>{e.en}</b><small>{e.uz}</small></span></li>)}</ul>
          </div>
          <details className="fold"><summary>{L('Javoblarni ko‘rish')}</summary>
          {lesson.check.map((it, i) => <ItemView key={i} item={it} value={cAns[i]} revealed onChange={() => undefined} />)}
          </details>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={retry}><RotateCcw size={14} />  {L('Qayta jang')}</button>
            {result.passed && next && <a className="btn primary" href={`#/learn/${next.lesson.id}`}>{L('Keyingi dars:')} {next.lesson.titleUz} <ArrowRight size={14} /></a>}
            {result.passed && !next && ielts && <a className="btn primary" href="#/ielts">{L('IELTS kursiga qaytish')} <ArrowRight size={14} /></a>}
            {!result.passed && <button className="btn" onClick={() => setStep('learn')}>{L('Qoidani qayta ko‘rish')}</button>}
          </div>
        </section>
      )}
    </div>
  );
}
