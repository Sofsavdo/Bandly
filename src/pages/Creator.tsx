// Hamkor kabineti: shaxsiy havola, kelgan o'quvchilar, faollashganlar, to'lov qilganlar va tushum (oylar bo'yicha).
import { Copy, Megaphone, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

interface Stats { nickname: string; code: string; invited: number; invited30: number; activated: number; payers: number; revenue: number; revenue30: number; commissionPct: number | null; commission: number | null; months: { month: string; signups: number; payers: number; revenue: number }[] }

export default function Creator() {
  const [d, setD] = useState<{ me: Stats; all: Stats[] | null; bot: string | null } | null>(null);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    void fetch('/api/creator', { headers: { 'x-token': getAccount()?.token ?? '' } }).then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status])); setD(j); }).catch((e: Error) => setErr(e.message));
  }, []);
  if (err) return <div className="card"><h2>{L('Hamkor kabineti')}</h2><p className="notice">{err}</p><p className="muted">{L('Hamkor bo‘lish uchun administrator bilan bog‘laning.')}</p></div>;
  if (!d) return <div className="card"><h2>{L('Hamkor kabineti')}</h2><p className="muted">{L('Yuklanmoqda…')}</p></div>;
  const m = d.me, link = d.bot ? `https://t.me/${d.bot}?start=ref_${m.code}` : `${location.origin}/?ref=${m.code}`;
  const conv = m.invited ? Math.round((m.payers / m.invited) * 1000) / 10 : 0;
  return (
    <div>
      <section className="card page-head t-peach">
        <h2 style={{ margin: 0 }}><Megaphone size={22} style={{ verticalAlign: -3 }} /> {L('Hamkor kabineti')}</h2>
        <p style={{ margin: '6px 0 12px' }}>{L('Havolangiz orqali kelgan o‘quvchilar va ularning to‘lovlari.')}</p>
        <div className="invite-link" style={{ background: 'var(--surface)' }}><code>{link}</code>
          <button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => { void navigator.clipboard?.writeText(link).then(() => setMsg(L('Havola nusxalandi'))); }}><Copy size={16} /></button>
          <button className="icon-btn sm" aria-label={L('Ulashish')} onClick={() => { void navigator.share?.({ title: 'Sellzen', url: link }).catch(() => undefined); }}><Share2 size={16} /></button>
        </div>
        {msg && <p className="evidence">{msg}</p>}
      </section>
      <div className="kpis">
        <div className="kpi2"><span>{L('Kelganlar')}</span><b>{m.invited}</b><small>{L('30 kun: {0}', [m.invited30])}</small></div>
        <div className="kpi2"><span>{L('Faollashgan')}</span><b>{m.activated}</b><small>{L('birinchi darsni tugatgan')}</small></div>
        <div className="kpi2"><span>{L('To‘lov qilgan')}</span><b>{m.payers}</b><small>{L('konversiya {0}%', [conv])}</small></div>
        <div className="kpi2"><span>{L('Tushum')}</span><b>{fmtSum(m.revenue)}</b><small>{L('30 kun: {0}', [fmtSum(m.revenue30)])}</small></div>
      </div>
      <section className="card">
        <h3 style={{ marginTop: 0 }}>{L('Oylar bo‘yicha')}</h3>
        <table className="data"><thead><tr><th>{L('Oy')}</th><th>{L('Kelganlar')}</th><th>{L('To‘lov qilgan')}</th><th>{L('Tushum')}</th></tr></thead>
          <tbody>{m.months.map((x) => <tr key={x.month}><td>{x.month}</td><td>{x.signups}</td><td>{x.payers}</td><td>{fmtSum(x.revenue)}</td></tr>)}</tbody></table>
        <p className="muted" style={{ marginBottom: 0 }}>{m.commissionPct === null ? L('Hamkorlik shartlari alohida kelishiladi.') : L('Hamkorlik ulushi ({0}%): {1} so‘m', [m.commissionPct, fmtSum(m.commission ?? 0)])}</p>
      </section>
      {d.all && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Barcha hamkorlar (admin)')}</h3>
          {d.all.length === 0 ? <p className="muted">{L('Hali hamkor yo‘q. Metodist kabineti → Admin: xodimlar bo‘limida «hamkor» rolini bering.')}</p> : (
            <table className="data"><thead><tr><th>{L('Laqab')}</th><th>{L('Kelganlar')}</th><th>{L('Faol')}</th><th>{L('To‘lov qilgan')}</th><th>{L('Tushum')}</th></tr></thead>
              <tbody>{d.all.map((x) => <tr key={x.code}><td>{x.nickname}</td><td>{x.invited}</td><td>{x.activated}</td><td>{x.payers}</td><td>{fmtSum(x.revenue)}</td></tr>)}</tbody></table>
          )}
        </section>
      )}
    </div>
  );
}
