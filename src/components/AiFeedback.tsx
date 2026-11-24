import { Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aiEnabled, aiLessonFeedback, type LessonFeedback } from '../lib/ai';
import { getAccount } from '../lib/account';
import { LEVEL_INFO } from '../lib/levels';
import { ClipButton } from './ClipButton';
import { L } from '../i18n';

type St = { phase: 'idle' } | { phase: 'loading' } | { phase: 'ok'; r: LessonFeedback } | { phase: 'err'; msg: string };

/** Dars ichidagi yozma topshiriq uchun Sellzen fikri: qisqa izoh (o'quvchi tilida), "yaxshilangan variant" (eshitish mumkin) va taxminiy daraja.
 *  Faqat hisobga kirgan o'quvchiga va AI yoqilgan bo'lsa ko'rinadi; kunlik chegara serverda (admin panelda sozlanadi). */
export function AiFeedback({ target, text, level }: { target: string; text: string; level?: string | null }) {
  const [on, setOn] = useState(false);
  const [st, setSt] = useState<St>({ phase: 'idle' });
  useEffect(() => { let alive = true; void aiEnabled().then((v) => { if (alive) setOn(v); }); return () => { alive = false; }; }, []);
  if (!on || !getAccount() || !text.trim()) return null;
  const ask = async () => {
    setSt({ phase: 'loading' });
    try { setSt({ phase: 'ok', r: await aiLessonFeedback(target, text, level) }); } catch (e) { setSt({ phase: 'err', msg: (e as Error).message }); }
  };
  const lv = st.phase === 'ok' && st.r.level && st.r.level in LEVEL_INFO ? (st.r.level as keyof typeof LEVEL_INFO) : null;
  return (
    <div className="ai-fb">
      {st.phase !== 'ok' && <button type="button" className="btn sm" disabled={st.phase === 'loading'} onClick={() => void ask()}><Sparkles size={14} />  {st.phase === 'loading' ? L('Sellzen o‘ylayapti…') : L('Sellzen fikrini olish')}</button>}
      {st.phase === 'err' && <p className="notice" role="status">{st.msg}</p>}
      {st.phase === 'ok' && (
        <div className="ai-fb-card">
          <div className="ai-fb-head"><b><Sparkles size={15} />  {L('Fikr-mulohaza')}</b>{lv && <span className="pill">{lv} · {LEVEL_INFO[lv].name}</span>}</div>
          <p>{st.r.feedback}</p>
          {st.r.better && <div className="ai-fb-better"><small>{L('Yaxshilangan variant')}</small><p><ClipButton className="icon-btn sm" text={st.r.better} size={14} />  <b>{st.r.better}</b></p></div>}
          <small className="muted">{L('Bugun yana {0} ta fikr olasiz', [st.r.left])}</small>
        </div>
      )}
    </div>
  );
}
