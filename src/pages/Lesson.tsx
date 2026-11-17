import { ArrowLeft, ArrowRight, Flame, Heart, RotateCcw, Volume2 } from 'lucide-react';
import { ItemView } from '../components/LessonItem';
import { say, stopSpeaking, ttsSupported } from '../lib/speech';
import { useEffect, useMemo, useRef, useState } from 'react';
import { lessonById, lessonNodeId, lessonWordIds, ALL_LESSONS } from '../content/lessons';
import { checkItem, isUnlocked, loadProgress, PASS_RATE, saveAttempt, scoreCheck, type ItemAnswer } from '../lib/lessons';
import { addMistake } from '../lib/mistakes';
import { recordAnswer } from '../lib/adaptive/store';
import { addToReview, addXp, pushToast } from '../lib/store';
import { answer, checkXp, lessonXpDay, markLessonXp, MAX_HEARTS, newPace, newPlay, pace, refill, SLOW_DOWN_UZ, type LessonPlay, type Pace } from '../lib/gamify';
import { localDayKey } from '../lib/adaptive/store';
import { saveResult } from '../lib/storage';
import { LessonSpeak } from '../components/LessonSpeak';
import { LessonWrite } from '../components/LessonWrite';
import { Illo } from '../components/Illo';
import { PRing } from '../components/PRing';

type Step = 'learn' | 'practice' | 'speak' | 'write' | 'check' | 'result';
const STEP_UZ: Record<Exclude<Step, 'result'>, string> = { learn: 'Tushuntirish', practice: 'Mashq', speak: 'Gapirish', write: 'Yozish', check: 'Tekshiruv' };

export default function LessonPage({ id }: { id: string }) {
  const found = lessonById(id);
  const [step, setStep] = useState<Step>('learn');
  const [pAns, setPAns] = useState<ItemAnswer[]>([]);
  const [pShown, setPShown] = useState<boolean[]>([]);
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
  const tts = typeof window !== 'undefined' && ttsSupported();
  // Jon tugaganda "qayta o'rganish" paneli darhol ko'rinsin
  useEffect(() => { if (relearn !== null) document.querySelector('.relearn')?.scrollIntoView({ block: 'start' }); }, [relearn]);
  const next = useMemo(() => { const i = ALL_LESSONS.findIndex((x) => x.lesson.id === id); return i >= 0 ? ALL_LESSONS[i + 1] : undefined; }, [id]);

  if (!found) return <div className="card"><h2>Dars topilmadi</h2><a className="btn" href="#/learn">Darslar ro‘yxati</a></div>;
  const { unit, lesson, index } = found;
  if (!isUnlocked(unit, index, loadProgress())) return <div className="card"><h2>{lesson.titleUz}</h2><p>Bu dars avvalgi darsdan o‘tganingizdan keyin ochiladi.</p><a className="btn" href="#/learn">Darslar ro‘yxati</a></div>;

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
    saveResult({ kind: 'grammar', title: `Dars: ${lesson.titleUz}`, correct: r.correct, total: r.total });
    addXp(xp); markLessonXp(lesson.id, today); setGained((g) => g + xp);
    if (r.passed) addToReview(lessonWordIds(lesson.id), now); // lesson words join the spaced-repetition deck
    setResult(r); setStep('result');
  };
  const retry = () => { setCAns([]); setCShown([]); setSuppressedCheck(new Set()); setResult(null); setRound((x) => x + 1); setPlay((p) => ({ ...p, hearts: Math.max(p.hearts, 3) })); setStep('check'); };

  const revealPractice = (i: number) => {
    const ok = checkItem(lesson.practice[i]!, pAns[i]);
    setPShown((x) => { const n = [...x]; n[i] = true; return n; });
    const slow = paced(lesson.practice[i]!, pAns[i]);
    const a = answer(play, ok); // bitta bosish — bitta hodisa; yon ta'sirlar holat yangilovchisidan tashqarida
    const np = slow ? { ...a, xp: play.xp } : a;
    setPlay(np);
    if (ok && (np.combo === 3 || np.combo === 5 || np.combo === 10)) pushToast(`Combo ×${np.combo}!`, 'xp');
    if (!ok) {
      const nw = wrongs.includes(i) ? wrongs : [...wrongs, i];
      setWrongs(nw);
      if (np.hearts === 0) setRelearn(nw.length ? nw : [0, 1, 2]);
    }
  };
  const revealCheck = (i: number) => {
    const ok = checkItem(lesson.check[i]!, cAns[i]);
    setCShown((x) => { const n = [...x]; n[i] = true; return n; });
    if (paced(lesson.check[i]!, cAns[i])) setSuppressedCheck((x) => new Set(x).add(i));
    const np = { ...answer(play, ok), xp: play.xp }; // tekshiruv XP'si yakunda checkXp bilan hisoblanadi
    setPlay(np);
    if (ok && (np.combo === 3 || np.combo === 5 || np.combo === 10)) pushToast(`Combo ×${np.combo}!`, 'xp');
    if (!ok && np.hearts === 0) setRelearn(wrongs.length ? wrongs : [0, 1, 2]); // mashqdagi xatolar (yoki birinchi 3 ta) — tekshiruv javoblari ochiq bo'lgani uchun ular qayta berilmaydi
  };
  const finishPractice = () => {
    const key = `${lesson.id}:practice`;
    const today = localDayKey(Date.now());
    if (play.xp > 0 && lessonXpDay(key) !== today) { addXp(play.xp); markLessonXp(key, today); setGained((g) => g + play.xp); } // mashq XP kuniga bir marta
    setStep('speak');
  };
  const relearnPanel = () => relearn !== null && (
            <div className="relearn card">
        <h3><Heart size={18} /> Jonlar tugadi — keling, qoidani qayta ko‘rib chiqamiz</h3>
        <p>{lesson.explanationUz[0]}</p>
        <p className="muted">Shu savollarni to‘g‘ri yeching — 3 ta jon qaytadi.</p>
        {relearn.map((i) => (
          <div key={i}>
            <ItemView item={lesson.practice[i]!} value={rAns[i]} revealed={!!rShown[i]} onChange={(v) => setRAns((a) => ({ ...a, [i]: v }))} />
            {!rShown[i] && <button className="btn sm" disabled={rAns[i] === undefined} onClick={() => setRShown((x) => ({ ...x, [i]: true }))}>Tekshirish</button>}
            {rShown[i] && !checkItem(lesson.practice[i]!, rAns[i]) && <button className="btn sm" onClick={() => { setRAns((a) => { const n = { ...a }; delete n[i]; return n; }); setRShown((x) => ({ ...x, [i]: false })); }}><RotateCcw size={14} /> Yana urinish</button>}
          </div>
        ))}
        <button className="btn primary" disabled={!relearn.every((i) => rShown[i] && checkItem(lesson.practice[i]!, rAns[i]))} onClick={() => { setPlay((p) => refill(p)); setRelearn(null); setWrongs([]); setRAns({}); setRShown({}); }}>Tushundim — 3 ta jonni qaytarish</button>
      </div>
  );
  const steps = ['learn', 'practice', 'speak', ...(lesson.writing ? ['write' as const] : []), 'check'] as const;
  const stepIdx = step === 'result' ? steps.length : steps.indexOf(step as (typeof steps)[number]);

  return (
    <div>
      <a className="btn sm" href="#/learn"><ArrowLeft size={14} /> Darslar</a>
      <div className="lesson-hud sticky" aria-label="Dars holati">
        <div className="seg-progress" aria-label={`${Math.min(stepIdx + 1, steps.length)} / ${steps.length} qadam`}>{steps.map((st, i) => <i key={st} className={i < stepIdx ? 'done' : i === stepIdx ? 'now' : ''} />)}</div>
        <span className="hud-hearts" aria-label={`${play.hearts} ta jon`}>{Array.from({ length: MAX_HEARTS }, (_, i) => <Heart key={i} size={16} className={i < play.hearts ? 'full' : 'empty'} />)}</span>
        {play.combo >= 2 && <span className="hud-combo" aria-label={`Combo ${play.combo}`}><Flame size={16} /> ×{play.combo}</span>}
      </div>
      <section className="card page-head with-illo" style={{ marginTop: 10 }}>
        <small className="muted" style={{ fontWeight: 650 }}>{unit.level} · {unit.titleUz} · {lesson.minutes} daq</small>
        <h2 style={{ margin: '4px 0 6px' }}>{lesson.titleUz}</h2>
        <p style={{ margin: '0 0 12px' }}>{lesson.objectiveUz}</p>
        <Illo kind="books" size={124} />
        <div className="chips" role="tablist" style={{ margin: 0 }}>
          {(['learn', 'practice', 'speak', ...(lesson.writing ? ['write' as const] : []), 'check'] as const).map((s, i) => (
            <button key={s} role="tab" aria-selected={step === s} className={`chip ${step === s || (step === 'result' && s === 'check') ? 'on' : ''}`} onClick={() => setStep(s)}>{i + 1}. {STEP_UZ[s]}</button>
          ))}
        </div>
      </section>

      {step === 'learn' && (
        <section className="card">
          {lesson.media?.map((m) => (
            <div key={m.url} className="lesson-media">
              {m.kind === 'video' ? <video src={m.url} controls preload="metadata" playsInline style={{ width: '100%', borderRadius: 12 }} /> : <audio src={m.url} controls preload="metadata" style={{ width: '100%' }} />}
              {m.transcript && <details className="fold"><summary>Matni</summary><p style={{ whiteSpace: 'pre-line' }}>{m.transcript}</p></details>}
            </div>
          ))}
          {lesson.explanationUz.map((t) => <p key={t}>{t}</p>)}
          {lesson.table && (
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', margin: '10px 0' }}>
              <tbody>{lesson.table.map((r) => <tr key={r.form}><td style={{ padding: '8px 6px', borderTop: '1px solid var(--line)' }}><b>{r.form}</b></td><td style={{ padding: '8px 6px', borderTop: '1px solid var(--line)' }}>{r.example}</td></tr>)}</tbody>
            </table>
          )}
          <h3>Misollar</h3>
          <ul>{lesson.examples.map((e) => <li key={e.en}>{(tts || e.audio) && <button type="button" className="btn sm" aria-label={`Eshitish: ${e.en}`} style={{ padding: '2px 8px', marginRight: 6 }} onClick={() => { stopSpeaking(); if (e.audio) void new Audio(e.audio).play(); else void say(e.en, { cancelled: false }); }}><Volume2 size={14} /></button>}<b>{e.en}</b> <span className="muted">— {e.uz}</span></li>)}</ul>
          {tts && <p className="muted" style={{ fontSize: 13 }}>Ovoz qurilmangiz brauzeridagi sintezator orqali o‘qiladi; sifat qurilmaga bog‘liq.</p>}
          {lesson.vocab && (<><h3>Yangi so‘zlar</h3><p className="row">{lesson.vocab.map((v) => <span key={v.en} className="pill">{v.en} · {v.uz}</span>)}</p>
            <p className="row"><button type="button" className="btn sm" onClick={() => { const n = addToReview(lessonWordIds(lesson.id)); setVocabMsg(n ? `${n} ta so‘z takrorlash ro‘yxatiga qo‘shildi — ular O‘yinlar bo‘limida (Pairs, Spell, Word Rush) takrorlash uchun chiqadi.` : 'Bu so‘zlar allaqachon takrorlash ro‘yxatida.'); }}>So‘zlarni takrorlashga qo‘shish</button>{vocabMsg && <span className="muted">{vocabMsg}</span>}</p></>)}
          <button className="btn primary" onClick={() => setStep('practice')}>Mashqqa o‘tish <ArrowRight size={14} /></button>
        </section>
      )}

      {step === 'practice' && (
        <section className="card">
          {slowMsg && <p className="notice" role="status">{SLOW_DOWN_UZ}. Juda tez berilgan javoblarga XP yozilmaydi.</p>}
          <p className="muted">Xato — 1 jon. Ketma-ket to‘g‘ri javob — combo.</p>
          {lesson.practice.map((it, i) => (
            <div key={i}>
              <ItemView item={it} value={pAns[i]} revealed={!!pShown[i]} onChange={(v) => setPAns((a) => { const n = [...a]; n[i] = v; return n; })} />
              {!pShown[i] && <button className="btn sm" disabled={relearn !== null || pAns[i] === undefined || (Array.isArray(pAns[i]) && !(pAns[i] as string[]).length)} onClick={() => revealPractice(i)}>Tekshirish</button>}
            </div>
          ))}
          {relearn !== null && relearnPanel()}
          <button className="btn primary" style={{ marginTop: 14 }} disabled={relearn !== null} onClick={finishPractice}>Gapirish mashqiga o‘tish <ArrowRight size={14} /></button>
        </section>
      )}

      {step === 'speak' && (
        <section className="card">
          <LessonSpeak sentences={lesson.examples.map((e) => e.en)} />
          <button className="btn primary" style={{ marginTop: 14 }} onClick={() => setStep(lesson.writing ? 'write' : 'check')}>{lesson.writing ? 'Yozish mashqiga o‘tish' : 'Yakuniy tekshiruvga o‘tish'} <ArrowRight size={14} /></button>
        </section>
      )}

      {step === 'write' && lesson.writing && (
        <section className="card">
          <LessonWrite task={lesson.writing} />
          <button className="btn primary" style={{ marginTop: 14 }} onClick={() => setStep('check')}>Yakuniy tekshiruvga o‘tish <ArrowRight size={14} /></button>
        </section>
      )}

      {step === 'check' && (
        <section className="card" key={round}>
          {slowMsg && <p className="notice" role="status">{SLOW_DOWN_UZ}. Juda tez berilgan javoblarga XP yozilmaydi.</p>}
          <p className="muted">{lesson.check.length} ta savol. O‘tish uchun kamida {Math.ceil(PASS_RATE * lesson.check.length)} ta to‘g‘ri javob kerak. Har javob darhol tekshiriladi; xato javob 1 ta jon oladi.</p>
          {lesson.check.map((it, i) => (
            <div key={i}>
              <ItemView item={it} value={cAns[i]} revealed={!!cShown[i]} onChange={(v) => setCAns((a) => { const n = [...a]; n[i] = v; return n; })} />
              {!cShown[i] && <button className="btn sm" disabled={relearn !== null || cAns[i] === undefined || (Array.isArray(cAns[i]) && !(cAns[i] as string[]).length)} onClick={() => revealCheck(i)}>Tekshirish</button>}
            </div>
          ))}
          {relearn !== null && relearnPanel()}
          <button className="btn primary" style={{ marginTop: 14 }} disabled={relearn !== null || !cShown.some(Boolean)} onClick={submitCheck}>Natijani ko‘rish</button>
          <p className="muted" style={{ fontSize: 13 }}>Javob berilmagan savollar noto‘g‘ri hisoblanadi.</p>
        </section>
      )}

      {step === 'result' && result && (
        <section className="card">
          <div className="result-hero">
            <PRing value={result.correct} max={result.total} size={112} stroke={11} color={result.passed ? 'var(--green)' : 'var(--coral)'} label={`${result.correct}/${result.total} to‘g‘ri`}><b style={{ fontSize: 28 }}>{Math.round(result.rate * 100)}%</b></PRing>
            <div><h2 style={{ margin: 0 }}>{result.passed ? 'Dars o‘zlashtirildi!' : 'Hali biroz mashq kerak'}</h2><p className="muted" style={{ margin: '4px 0 0' }}>{result.correct}/{result.total} to‘g‘ri{gained > 0 ? ` · +${gained} XP` : ''}</p></div>
            {result.passed && <Illo kind="trophy" size={96} />}
          </div>
          {play.maxCombo >= 2 && <p className="row"><span className="pill"><Flame size={13} /> eng uzun combo ×{play.maxCombo}</span></p>}
          <details className="fold"><summary>Javoblarni ko‘rish</summary>
          {lesson.check.map((it, i) => <ItemView key={i} item={it} value={cAns[i]} revealed onChange={() => undefined} />)}
          </details>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn" onClick={retry}><RotateCcw size={14} /> Qayta topshirish</button>
            {result.passed && next && <a className="btn primary" href={`#/learn/${next.lesson.id}`}>Keyingi dars: {next.lesson.titleUz} <ArrowRight size={14} /></a>}
            {!result.passed && <button className="btn" onClick={() => setStep('learn')}>Tushuntirishni qayta o‘qish</button>}
          </div>
        </section>
      )}
    </div>
  );
}
