import type { Evaluation } from '../lib/ai';
import { L } from '../i18n';

const LABEL: Record<string, string> = {
  fluency: 'Fluency & Coherence', lexical: 'Lexical Resource', grammar: 'Grammar', pronunciation: 'Pronunciation',
  task_response: 'Task Response', task_achievement: 'Task Achievement', coherence: 'Coherence & Cohesion',
};

export function EvalCard({ ev, title = L('AI baho') }: { ev: Evaluation; title?: string }) {
  const vals = Object.values(ev.bands).filter((x): x is number => x !== null);
  const low = vals.length ? Math.min(...vals) : null; // bandni tushirayotgan mezon
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}: <span className="big">{ev.overall.toFixed(1)}</span></h3>
      <div className="row">
        {Object.entries(ev.bands).map(([k, v]) => <span key={k} className={`pill ${v !== null && v === low ? 'low' : ''}`}>{LABEL[k] ?? k}: <b>{v === null ? L('baholanmaydi') : v.toFixed(1)}</b></span>)}
      </div>
      {ev.focus && <p className="eval-focus"><b>{L('+0.5 band uchun:')}</b> {ev.focus}</p>}
      {ev.strengths.length > 0 && <><h4>{L('Kuchli tomonlar')}</h4><ul>{ev.strengths.map((s) => <li key={s}>{s}</li>)}</ul></>}
      {ev.improve.length > 0 && <><h4>{L('Yaxshilash kerak')}</h4><ul>{ev.improve.map((s) => <li key={s}>{s}</li>)}</ul></>}
      {ev.corrections.length > 0 && (
        <>
          <h4>{L('Tuzatishlar')}</h4>
          <table className="data"><thead><tr><th>{L('Siz aytdingiz')}</th><th>{L('Yaxshiroq')}</th></tr></thead>
            <tbody>{ev.corrections.map((c) => <tr key={c.said}><td>{c.said}</td><td>{c.better}</td></tr>)}</tbody></table>
        </>
      )}
    </div>
  );
}
