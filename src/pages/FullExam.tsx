import { ArrowRight, CheckCircle2, Circle, ClipboardCheck, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { listeningTests, readingTests } from '../content/mockTests';
import { levelIndex } from '../lib/levels';
import { recordMock } from '../lib/history';
import { syncMock } from '../lib/bands';
import { loadResults, type ResultRecord } from '../lib/storage';
import { setLevelFromExam, useProfile } from '../lib/store';
import { Illo } from '../components/Illo';
import { CertNotice } from '../components/CertNotice';
import { getAccount } from '../lib/account';
import { L } from '../i18n';

const KEY = 'bandly.fullexam.v1';
interface State { startedAt: number; listeningId: string; readingId: string; writingDone: boolean }

export const loadFull = (): State | null => { try { const j = localStorage.getItem(KEY); return j ? (JSON.parse(j) as State) : null; } catch { return null; } };
const saveFull = (s: State | null) => { try { if (s) localStorage.setItem(KEY, JSON.stringify(s)); else localStorage.removeItem(KEY); } catch { /* saqlash yo'q */ } };

const nearest = <T extends { level: Parameters<typeof levelIndex>[0] }>(list: T[], level: Parameters<typeof levelIndex>[0]): T =>
  [...list].sort((a, b) => Math.abs(levelIndex(a.level) - levelIndex(level)) - Math.abs(levelIndex(b.level) - levelIndex(level)))[0];

const since = (results: ResultRecord[], t0: number, pred: (r: ResultRecord) => boolean) => results.find((r) => Date.parse(r.date) >= t0 && pred(r));

/** Natija qurilmaga va (hisob bo'lsa) serverga yoziladi — o'sishni boshlang'ichdan o'lchash uchun. Bir xil natija qayta yozilmaydi. */
function RecordMock({ entry, final }: { entry: Parameters<typeof recordMock>[0]; final: boolean }) {
  const key = JSON.stringify(entry);
  useEffect(() => { recordMock(entry); syncMock(entry); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  // 4 bo'lim tugagach daraja shu natijadan yangilanadi (daraja testini qayta topshirish shart emas)
  useEffect(() => { if (final) setLevelFromExam(entry.overall, entry.at); }, [final, key]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

/** 4 bo'lim tugagach: server o'z natijalaridan to'liq imtihon natijasini yig'adi va sertifikat beradi (bir imtihon — bir marta). */
function FullCert({ st }: { st: State }) {
  const [r, setR] = useState<{ issued: { id: string; type: string }[]; missing: string[] } | null>(null);
  const [err, setErr] = useState('');
  useEffect(() => {
    void fetch('/api/exam/full', { method: 'POST', headers: { 'content-type': 'application/json', 'x-token': getAccount()?.token ?? '' }, body: JSON.stringify({ startedAt: st.startedAt, listeningId: st.listeningId, readingId: st.readingId }) })
      .then(async (x) => { const j = await x.json().catch(() => ({})) as { certificates?: { id: string; type: string }[]; certMissing?: string[]; error?: string }; if (!x.ok) throw new Error(j.error ?? String(x.status)); setR({ issued: j.certificates ?? [], missing: j.certMissing ?? [] }); })
      .catch((e: Error) => setErr(e.message));
  }, [st.startedAt, st.listeningId, st.readingId]);
  if (err) return <p className="notice">{err}</p>;
  return r ? <CertNotice issued={r.issued} missing={r.missing} /> : null;
}

export default function FullExam() {
  const p = useProfile();
  const [st, setSt] = useState<State | null>(loadFull());
  const results = loadResults();

  const start = () => {
    const s: State = { startedAt: Date.now(), listeningId: (listeningTests.find((t) => t.sections?.length && t.exam !== 'cefr') ?? nearest(listeningTests, p.level ?? 'B1')).id, readingId: (readingTests.find((t) => t.sections?.length && t.exam !== 'cefr') ?? nearest(readingTests, p.level ?? 'B1')).id, writingDone: false };
    saveFull(s); setSt(s);
  };
  const reset = () => { saveFull(null); setSt(null); };

  if (!st) {
    return (
      <div className="stage">
        <div className="stage-center">
          <span className="eyebrow"><ClipboardCheck size={15} />  {L('Imtihon simulyatsiyasi')}</span>
          <h1 className="say">{L('IELTS tartibida bir o‘tirishda')}</h1>
          <p className="lead" style={{ maxWidth: 620 }}><b>{L('Listening → Reading → Writing → Speaking')}</b>{L('. Taymer bilan, oxirida umumiy band.')}</p>
          <ul className="rules">
            <li>{L('Telefonni o‘chiring, naushnik taqing va to‘xtamasdan bajaring.')}</li>
            <li>{L('Listening va Reading bepul. Writing va Speaking’ni AI baholashi tarifingizga kiradi.')}</li>
          </ul>
          {levelIndex(p.level) < levelIndex('B2') && (
            <p className="notice" style={{ maxWidth: 620 }}>{L('IELTS qiyinligidagi imtihon. {0} darajada past natija — normal boshlanish.', [p.level ?? 'A2'])} <a href="#/mocks/reading">{L('o‘z pog‘onangizdagi testlar')}</a>{L('dan foydalaning.')}</p>
          )}
          <button className="btn primary lg" onClick={start}>{L('Imtihonni boshlash')} <ArrowRight size={18} /></button>
        </div>
      </div>
    );
  }

  const LT = listeningTests.find((t) => t.id === st.listeningId)!;
  const R = readingTests.find((t) => t.id === st.readingId)!;
  const rl = since(results, st.startedAt, (r) => r.kind === 'listening' && r.title === LT.title);
  const rr = since(results, st.startedAt, (r) => r.kind === 'reading' && r.title === R.title);
  const rw = since(results, st.startedAt, (r) => r.kind === 'writing' && typeof r.band === 'number');
  const rs = since(results, st.startedAt, (r) => r.kind === 'speaking');
  const parts = [
    { name: 'Listening', sub: L('{0} · {1} daqiqa', [LT.title.replace(/^Listening mini-test \d+: /, ''), LT.minutes]), res: rl, href: `#/mocks/listening/${LT.id}`, done: !!rl },
    { name: 'Reading', sub: L('{0} · {1} daqiqa', [R.title.replace(/^Reading mini-test \d+: /, ''), R.minutes]), res: rr, href: `#/mocks/reading/${R.id}`, done: !!rr },
    { name: 'Writing', sub: L('Task 2 insho: yozing va “AI baholash”ni bosing — 4 mezon bo‘yicha band chiqadi'), res: rw, href: '#/exam/writing', done: st.writingDone || !!rw },
    { name: 'Speaking', sub: L('Ustoz bilan jonli suhbat (Part 1–3)'), res: rs, href: '#/exam/speaking', done: !!rs },
  ];
  const bands = [rl?.band, rr?.band, rw?.band, rs?.band].filter((b): b is number => typeof b === 'number');
  const doneN = parts.filter((x) => x.done).length;
  // IELTS yaxlitlash (server bilan bir xil): o'rtacha .25 → .5, .75 → butun
  const overall = bands.length ? Math.floor((bands.reduce((a, b) => a + b, 0) / bands.length) * 2 + 0.5) / 2 : null;
  const all = doneN === 4;
  const entry = overall !== null && bands.length >= 2 && doneN >= 3 ? { at: st.startedAt, overall, listening: rl?.band, reading: rr?.band, writing: rw?.band, speaking: rs?.band } : null;
  const nextIdx = parts.findIndex((x) => !x.done);

  return (
    <div>
      <div className="card page-head with-illo t-butter">
        <h2><ClipboardCheck size={22} style={{ verticalAlign: -4 }} />  {L('To‘liq imtihon (')}{doneN}/4)</h2><Illo kind="clock" size={124} />
        <div className="bar" style={{ margin: '10px 0' }}><i style={{ width: `${(doneN / 4) * 100}%` }} /></div>
        <div className="exam-steps">
          {parts.map((x, i) => (
            <div key={x.name} className={`exam-step ${x.done ? 'done' : i === nextIdx ? 'now' : ''}`}>
              <span className="ico">{x.done ? <CheckCircle2 size={22} /> : <Circle size={22} />}</span>
              <div className="grow">
                <b>{i + 1}. {x.name}</b>
                <p className="evidence" style={{ margin: 0 }}>{x.sub}</p>
                {x.res && <p className="ok" style={{ margin: '2px 0 0' }}>{x.res.kind === 'speaking' || x.res.kind === 'writing' ? L('Bajarildi') : `${x.res.correct}/${x.res.total}`}{typeof x.res.band === 'number' ? ` · ${L('band')} ${x.res.band.toFixed(1)}` : ''}</p>}
              </div>
              {x.name === 'Writing' && !x.done && <button className="btn sm" onClick={() => { const n = { ...st, writingDone: true }; saveFull(n); setSt(n); }}>{L('Bajardim')}</button>}
              {!x.done && i === nextIdx && <a className="btn primary sm" href={x.href}>{L('Boshlash')}</a>}
              {!x.done && i !== nextIdx && x.name !== 'Writing' && <a className="btn sm" href={x.href}>{L('Ochish')}</a>}
              {x.name === 'Writing' && !x.done && i !== nextIdx && <a className="btn sm" href={x.href}>{L('Ochish')}</a>}
            </div>
          ))}
        </div>
      </div>

      {overall !== null && (
        <div className="stage">
          <div className="stage-center">
            <p className="evidence">{all ? L('Imtihon yakunlandi') : L('Hozirgacha {0} ta bo‘lim bo‘yicha', [bands.length])}</p>
            <div className="score">{overall.toFixed(1)}</div>
            <p className="lead">{L('Umumiy band')}</p>
            {all && p.level && <p className="evidence">{L('Darajangiz shu natija bo‘yicha yangilandi: {0}', [p.level])}</p>}
            {p.baselineBand !== null && <p>{overall > p.baselineBand ? <b className="ok">{L('Boshlang‘ich')} {p.baselineBand.toFixed(1)}  {L('dan +')}{(overall - p.baselineBand).toFixed(1)}  {L('yuqori.')}</b> : overall === p.baselineBand ? L('Boshlang‘ich natijangiz bilan teng.') : L('Boshlang‘ich bahodan past: yana mashq kerak.')}</p>}
          </div>
        </div>
      )}
      {all && <FullCert st={st} />}
      {entry && <RecordMock entry={entry} final={all} />}
      <div className="row"><button className="btn" onClick={reset}><RotateCcw size={16} />  {L('Yangi imtihon')}</button></div>
    </div>
  );
}
