// AI baho kartochkasi (Writing va Speaking). Writing Lab (P1.3): har bir tuzatish o'quvchining O'Z iborasiga bog'langan
// (server matnda yo'q iborani tashlab yuboradi), sababi o'quvchi tilida, mezoni ko'rsatiladi va qayta yozib mashq qilinadi.
// Tuzatishlar «Xatolarim»ga tushadi — keyinroq takrorlash orqali o'quvchi uni o'zlashtirganmi, kuzatiladi.
// Asl matn o'zgartirilmaydi; "yaxshiroq" variant — faqat shu ibora uchun namuna, kafolatlangan band emas.
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Evaluation } from '../lib/ai';
import type { TaxonomyId } from '../lib/adaptive/taxonomy';
import { addMistake, normPhrase, type MistakeSource } from '../lib/mistakes';
import { L } from '../i18n';

const LABEL: Record<string, string> = {
  fluency: 'Fluency & Coherence', lexical: 'Lexical Resource', grammar: 'Grammar', pronunciation: 'Pronunciation',
  task_response: 'Task Response', task_achievement: 'Task Achievement', coherence: 'Coherence & Cohesion',
};
type Crit = NonNullable<Evaluation['corrections'][number]['criterion']>;
const CRIT: Record<Crit, string> = { task: L('Topshiriqqa javob'), coherence: L('Bog‘lanish'), lexical: L('So‘z boyligi'), grammar: L('Grammatika'), fluency: L('Ravonlik') };
const TAX: Partial<Record<Crit, TaxonomyId[]>> = { lexical: ['V.word_choice'], coherence: ['W.coherence'], task: ['W.task_response'], fluency: ['S.fluency'] };

function Rewrite({ said, better }: { said: string; better: string }) {
  const [v, setV] = useState('');
  const [shown, setShown] = useState<null | 'ok' | 'diff'>(null);
  const check = () => setShown(normPhrase(v) === normPhrase(better) ? 'ok' : 'diff');
  return (
    <div className="lab-rewrite">
      <input type="text" value={v} onChange={(e) => { setV(e.target.value); setShown(null); }} placeholder={L('Shu iborani to‘g‘ri yozib ko‘ring')} aria-label={L('Qayta yozish: {0}', [said])} />
      <button type="button" className="btn sm" disabled={!v.trim() || normPhrase(v) === normPhrase(said)} onClick={check}>{L('Tekshirish')}</button>
      {shown === 'ok' && <small className="ok"><CheckCircle2 size={14} /> {L('To‘g‘ri!')}</small>}
      {shown === 'diff' && <small className="muted"><RotateCcw size={14} /> {L('Namuna bilan solishtiring: «{0}». Boshqa to‘g‘ri variant ham bo‘lishi mumkin.', [better])}</small>}
    </div>
  );
}

export function EvalCard({ ev, title = L('AI baho'), source = 'writing' }: { ev: Evaluation; title?: string; source?: MistakeSource }) {
  const vals = Object.values(ev.bands).filter((x): x is number => x !== null);
  const low = vals.length ? Math.min(...vals) : null; // bandni tushirayotgan mezon
  // Tuzatishlarni takrorlash ro'yxatiga (bir xil ibora qayta qo'shilmaydi — addMistake kalit bo'yicha birlashtiradi)
  useEffect(() => {
    for (const c of ev.corrections) { try { addMistake(source, { kind: 'fix', wrong: c.said, right: c.better, whyUz: c.why ?? '' }, (c.criterion && TAX[c.criterion]) || []); } catch { /* saqlab bo'lmadi */ } }
  }, [ev, source]);
  const byCrit = ev.corrections.reduce<Record<string, number>>((m, c) => { if (c.criterion) m[c.criterion] = (m[c.criterion] ?? 0) + 1; return m; }, {});
  const top = Object.entries(byCrit).sort((a, b) => b[1] - a[1])[0];
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>{title}: <span className="big">{ev.overall.toFixed(1)}</span></h3>
      <div className="row">
        {Object.entries(ev.bands).map(([k, v]) => <span key={k} className={`pill ${v !== null && v === low ? 'low' : ''}`}>{LABEL[k] ?? k}: <b>{v === null ? L('baholanmaydi') : v.toFixed(1)}</b></span>)}
      </div>
      <p className="muted" style={{ fontSize: 12, margin: '6px 0 0' }}>{L('AI bahosi — IELTS’ning 4 mezoni bo‘yicha.')}{ev.bands.pronunciation === null ? ` ${L('Talaffuz matn orqali baholanmaydi.')}` : ''}</p>
      {ev.focus && <p className="eval-focus"><b>{L('+0.5 band uchun:')}</b> {ev.focus}</p>}
      {ev.strengths.length > 0 && <><h4>{L('Kuchli tomonlar')}</h4><ul>{ev.strengths.map((s) => <li key={s}>{s}</li>)}</ul></>}
      {ev.improve.length > 0 && <><h4>{L('Yaxshilash kerak')}</h4><ul>{ev.improve.map((s) => <li key={s}>{s}</li>)}</ul></>}
      {ev.corrections.length > 0 && (
        <>
          <h4>{L('Writing Lab: iboralaringizni yaxshilang')}</h4>
          {top && top[1] >= 2 && <p className="muted" style={{ marginTop: 0 }}>{L('Ko‘p uchragan muammo: {0} ({1} ta).', [CRIT[top[0] as Crit], top[1]])}</p>}
          <ol className="lab-list">
            {ev.corrections.map((c) => (
              <li key={c.said}>
                <div className="lab-pair"><span className="lab-said">{c.said}</span><span aria-hidden="true">→</span><span className="lab-better">{c.better}</span>{c.criterion && <span className="pill">{CRIT[c.criterion]}</span>}</div>
                {c.why && <p className="lab-why">{c.why}</p>}
                <Rewrite said={c.said} better={c.better} />
              </li>
            ))}
          </ol>
          <p className="muted" style={{ fontSize: 12 }}>{L('Bu iboralar «Xatolarim» bo‘limiga qo‘shildi — keyinroq takrorlaysiz. Asl matningiz o‘zgarmaydi.')}</p>
        </>
      )}
    </div>
  );
}
