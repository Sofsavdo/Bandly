import { useState } from 'react';
import { DIGITAL_SAT as F } from '../content/examFormats';
import { SAT_MATH, SAT_RW, type SatItem } from '../content/satPractice';
import { checkItem, type ItemAnswer } from '../lib/lessons';
import { addXp } from '../lib/store';
import { ItemView } from './LessonItem';

function Practice({ items, title }: { items: SatItem[]; title: string }) {
  const [ans, setAns] = useState<ItemAnswer[]>([]);
  const [done, setDone] = useState(false);
  const correct = items.filter((x, i) => checkItem(x.item, ans[i])).length;
  const byDomain = [...new Set(items.map((x) => x.domain))].map((d) => {
    const idx = items.map((x, i) => (x.domain === d ? i : -1)).filter((i) => i >= 0);
    return { d, ok: idx.filter((i) => checkItem(items[i]!.item, ans[i])).length, n: idx.length };
  });
  return (
    <div>
      <h3>{title}</h3>
      {items.map((x, i) => (
        <div key={i}>
          <p className="muted" style={{ fontSize: 12, margin: '10px 0 0' }}>{x.domain}</p>
          <ItemView item={x.item} value={ans[i]} revealed={done} onChange={(v) => setAns((a) => { const n = [...a]; n[i] = v; return n; })} />
        </div>
      ))}
      {!done
        ? <button className="btn primary" style={{ marginTop: 12 }} disabled={!ans.some((a) => a !== undefined)} onClick={() => { setDone(true); addXp(correct * 2); }}>Natijani ko‘rish</button>
        : (
          <div style={{ marginTop: 12 }}>
            <p className="row"><span className="pill">{correct}/{items.length} to‘g‘ri</span>{byDomain.map((b) => <span key={b.d} className="pill" style={{ whiteSpace: 'normal' }}>{b.d}: {b.ok}/{b.n}</span>)}</p>
            <button className="btn" onClick={() => { setAns([]); setDone(false); }}>Qayta ishlash</button>
          </div>
        )}
    </div>
  );
}

/** Digital SAT: verified structure + Bandly's ORIGINAL practice items. No SAT score is estimated. */
export function SatPrep() {
  const [set, setSet] = useState<'rw' | 'math' | null>(null);
  return (
    <div>
      <div className="card">
        <h3>Digital SAT</h3>
        <p className="muted" style={{ fontSize: 13 }}>Rasmiy College Board sahifalari {F.verifiedAt} sanasida tekshirildi.</p>
        <div className="stack">
          {F.sections.map((s) => (
            <div key={s.nameUz} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}>
              <span><b>{s.nameUz}</b> <span className="muted">· {s.questions} savol · {s.modules}</span></span><b>{s.minutes} daq</b>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 0', borderTop: '1px solid var(--line)' }}><span>Jami (bo‘limlar orasida {F.totals.breakMin} daqiqa tanaffus)</span><b>{F.totals.questions} savol · {F.totals.minutes} daq</b></div>
        </div>
        <p style={{ marginTop: 10 }}>{F.adaptiveUz}</p>
        <p><b>Ball:</b> umumiy {F.scores.total}, {F.scores.section}.</p>
        <p className="muted">{F.passagesUz}</p>
        <p><b>Bo‘limlar mazmuni:</b></p>
        <ul>{F.domains.map((d) => <li key={d.name}><b>{d.section === 'rw' ? 'R&W' : 'Math'} · {d.name}</b> <span className="muted">— {d.uz}</span></li>)}</ul>
        <ul className="muted" style={{ fontSize: 13 }}>{F.notesUz.map((n) => <li key={n}>{n}</li>)}</ul>
        <p className="muted" style={{ fontSize: 13 }}>Manbalar: {F.sources.map((x, i) => <span key={x.url}>{i ? ' · ' : ''}<a href={x.url} target="_blank" rel="noreferrer">{x.title}</a></span>)}</p>
      </div>
      <div className="card">
        <h3>Bandly mashqi (rasmiy emas)</h3>
        <p className="muted" style={{ fontSize: 13 }}>Savollar Bandly tomonidan SAT bo‘limlari uslubida yozilgan; rasmiy College Board materiali emas va SAT ballini taxmin qilmaydi. Har javobdan keyin izoh ko‘rasiz.</p>
        <p className="row">
          <button type="button" className={`chipbtn ${set === 'rw' ? 'on' : ''}`} onClick={() => setSet('rw')}>Reading and Writing · {SAT_RW.length} savol</button>
          <button type="button" className={`chipbtn ${set === 'math' ? 'on' : ''}`} onClick={() => setSet('math')}>Math · {SAT_MATH.length} savol</button>
        </p>
        {set === 'rw' && <Practice key="rw" items={SAT_RW} title="Reading and Writing" />}
        {set === 'math' && <Practice key="math" items={SAT_MATH} title="Math" />}
      </div>
    </div>
  );
}
