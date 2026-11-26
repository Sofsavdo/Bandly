// Hamkor kabineti (2026-11-26, egasi: "juda murakkab"): yuqorida balans va videolar (CreatorVideos), qolgani yig'ilgan bo'limlarda:
// tayyor post matnlari, batafsil statistika (umumiy havola, ko'rsatkichlar, havolalar va voronka, kampaniyalar, to'lovlar tarixi, reyting).
import { Copy, Megaphone, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { CreatorLinks } from '../components/CreatorLinks';
import { CreatorPosts } from '../components/CreatorPosts';
import { CreatorVideos } from '../components/CreatorVideos';
import { CreatorElchi } from '../components/CreatorElchi';
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
    <div className="creator-cab">
      <section className="card page-head t-peach">
        <h2 style={{ margin: 0 }}><Megaphone size={22} style={{ verticalAlign: -3 }} /> {L('Hamkor kabineti')}</h2>
        <p style={{ margin: '6px 0 0' }}>{L('Video joylang yoki blogerlarni olib keling — ikkalasi uchun ham to‘lov olasiz. Shu yerda holat va balansingiz.')}</p>
      </section>
      <CreatorVideos />
      <CreatorElchi />
      <details className="card fold">
        <summary><h3 style={{ display: 'inline', margin: 0 }}>{L('Tayyor post matnlari')}</h3></summary>
        <p className="muted" style={{ fontSize: 13 }}>{L('Nusxalang va Telegram, Instagram yoki TikTok’da ulashing — havolangiz matn ichida. Eng yaxshi natija: o‘z daraja testi natijangizni yoki mock balingizni ko‘rsatib, obunachilarni bellashuvga chaqirish.')}</p>
        <div className="promo-list">
          {[
            L('Ingliz tili darajangizni 3 daqiqada bilib oling 👇 Men sinab ko‘rdim — natija darhol chiqadi, keyin shaxsiy reja tuzib beradi. Bepul: {0}', [link]),
            L('IELTS’ga tayyorlanyapsizmi? Sellzen’da bepul mock testlar (Listening, Reading), AI Writing va Speaking bahosi bor. Mening balimni yengib ko‘ring: {0}', [link]),
            L('Ingliz tilida gapirishdan qo‘rqasizmi? Sellzen ovozli ustozi bilan har kuni 5 daqiqa gaplashing — xatolaringizni o‘zbekcha tushuntiradi va eslab qoladi. Sinab ko‘ring: {0}', [link]),
            L('Узнай свой уровень английского за 3 минуты — бесплатно, с личным планом и AI-репетитором: {0}', [link]),
          ].map((txt) => (
            <div key={txt} className="promo">
              <p>{txt}</p>
              <button className="btn sm" onClick={() => { void navigator.clipboard?.writeText(txt).then(() => setMsg(L('Matn nusxalandi'))); }}><Copy size={14} /> {L('Nusxalash')}</button>
            </div>
          ))}
        </div>
      </details>
      <details className="card fold">
        <summary><h3 style={{ display: 'inline', margin: 0 }}>{L('Batafsil statistika')}</h3></summary>
        <p className="muted" style={{ marginBottom: 6 }}>{L('Umumiy havolangiz (video bilan bog‘liq bo‘lmagan takliflar uchun):')}</p>
        <div className="invite-link"><code>{link}</code>
          <button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => { void navigator.clipboard?.writeText(link).then(() => setMsg(L('Havola nusxalandi'))); }}><Copy size={16} /></button>
          <button className="icon-btn sm" aria-label={L('Ulashish')} onClick={() => { void navigator.share?.({ title: 'Sellzen', url: link }).catch(() => undefined); }}><Share2 size={16} /></button>
        </div>
        {msg && <p className="evidence">{msg}</p>}
        <div className="kpis">
          <div className="kpi2"><span>{L('Kelganlar')}</span><b>{m.invited}</b><small>{L('30 kun: {0}', [m.invited30])}</small></div>
          <div className="kpi2"><span>{L('Faollashgan')}</span><b>{m.activated}</b><small>{L('birinchi darsni tugatgan')}</small></div>
          <div className="kpi2"><span>{L('To‘lov qilgan')}</span><b>{m.payers}</b><small>{L('konversiya {0}%', [conv])}</small></div>
        </div>
        <h4 className="list-h">{L('Oylar bo‘yicha')}</h4>
        <div className="table-scroll"><table className="data"><thead><tr><th>{L('Oy')}</th><th>{L('Kelganlar')}</th><th>{L('To‘lov qilgan')}</th></tr></thead>
          <tbody>{m.months.map((x) => <tr key={x.month}><td>{x.month}</td><td>{x.signups}</td><td>{x.payers}</td></tr>)}</tbody></table></div>
        <CreatorLinks bot={d.bot} />
        <CreatorPosts />
      </details>
      {d.all && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Barcha hamkorlar (admin)')}</h3>
          {d.all.length === 0 ? <p className="muted">{L('Hali hamkor yo‘q. Admin kabineti → Xodimlar bo‘limida «hamkor (bloger)» rolini bering.')}</p> : (
            <div className="table-scroll"><table className="data"><thead><tr><th>{L('Laqab')}</th><th>{L('Kelganlar')}</th><th>{L('Faol')}</th><th>{L('To‘lov qilgan')}</th><th>{L('Tushum')}</th></tr></thead>
              <tbody>{d.all.map((x) => <tr key={x.code}><td>{x.nickname}</td><td>{x.invited}</td><td>{x.activated}</td><td>{x.payers}</td><td>{fmtSum(x.revenue)}</td></tr>)}</tbody></table></div>
          )}
        </section>
      )}
    </div>
  );
}
