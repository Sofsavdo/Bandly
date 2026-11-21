// Ixtiyoriy telefon raqami (rozilik bilan): mutaxassis rejani va obunani tushuntirib berishi uchun. Telegram orqali
// tasdiqlangan raqamni ulashish yoki qo'lda yozish. Raqam faqat Sellzen jamoasi qo'ng'irog'i uchun ishlatiladi.
import { Phone, Send } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { loadAnswers } from '../lib/onboarding';
import { L } from '../i18n';

export function LeadCard({ goal, level, minutes }: { goal?: string; level?: string; minutes?: number }) {
  const [state, setState] = useState<{ has: boolean; bot: string | null } | null>(null);
  const [phone, setPhone] = useState('+998 ');
  const [ok, setOk] = useState(false);
  const [msg, setMsg] = useState('');
  const token = getAccount()?.token ?? '';
  useEffect(() => { if (token) void fetch('/api/lead', { headers: { 'x-token': token } }).then((r) => (r.ok ? r.json() : null)).then((j) => setState(j)).catch(() => undefined); }, [token]);
  if (!token || !state || state.has) return null;
  if (msg === 'saved') return <section className="card lead-card"><p className="ok" style={{ margin: 0 }}>{L('Rahmat! Mutaxassisimiz tez orada bog‘lanadi.')}</p></section>;
  const save = async () => {
    const r = await fetch('/api/lead', { method: 'POST', headers: { 'x-token': token, 'content-type': 'application/json' }, body: JSON.stringify({ phone, consent: ok, goal: goal ?? loadAnswers()?.goal, level, minutes: minutes ?? loadAnswers()?.minutes }) });
    const j = await r.json().catch(() => ({}));
    setMsg(r.ok ? 'saved' : (j as { error?: string }).error ?? L('Xato'));
  };
  return (
    <section className="card lead-card">
      <h3><Phone size={17} />  {L('Bepul maslahat')}</h3>
      <p className="muted" style={{ margin: '2px 0 10px', fontSize: 14 }}>{L('Mutaxassisimiz rejangizni tushuntirib beradi va savollaringizga javob beradi.')}</p>
      {state.bot && <a className="btn block" href={`https://t.me/${state.bot}?start=phone`} target="_blank" rel="noopener noreferrer"><Send size={15} />  {L('Telegram orqali raqamni ulashish')}</a>}
      <div className="lead-form">
        <input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label={L('Telefon raqami')} />
        <button className="btn primary" disabled={!ok || phone.replace(/\D/g, '').length < 9} onClick={() => void save()}>{L('Yuborish')}</button>
      </div>
      <label className="lead-consent"><input type="checkbox" checked={ok} onChange={(e) => setOk(e.target.checked)} /> {L('Sellzen jamoasi shu raqam orqali men bilan bog‘lanishiga roziman.')}</label>
      {msg && msg !== 'saved' && <p className="notice">{msg}</p>}
    </section>
  );
}
