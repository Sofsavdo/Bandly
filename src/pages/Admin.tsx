// Admin analitikasi: faollik, yangi o'quvchilar, saqlanib qolish, voronka, to'lovlar va AI xarajati (faqat admin).
import { BarChart3, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { CertAdmin } from '../components/CertAdmin';
import { L } from '../i18n';

interface Day { day: string; signups: number; active: number; paid: number; revenue: number; aiUsd: number }
interface Data {
  generatedAt: number;
  totals: { players: number; telegram: number; payingNow: number; subscribedNow?: number; dau: number; wau: number; mau: number };
  days: Day[]; retention: { cohort: number; d1: number | null; d7: number | null; d30: number | null };
  funnel: { step: string; n: number }[]; bySource: { source: string; events: number; xp: number }[];
  aiByFeature: { feature: string; usd: number }[]; revenue30: number; paid30: number;
  walls?: { walled: number; converted: number; rate: number | null; today: number };
  growth?: { events: Record<string, number>; signups: number; referredSignups: number; referredActivated: number; placementToSignupPct: number | null; referredSharePct: number | null };
  bands?: { learners: number; withBaseline: number; measured: number; avgGain: number | null; medianGain: number | null; shareHalf: number | null; shareOne: number | null; avgDays: number | null; officials: number; officialVsBaseline: number | null };
}

/** Oddiy ustunli grafik (SVG): kunlik qiymatlar, eng kattasi ustida raqam. */
function Bars({ days, pick, color, label }: { days: Day[]; pick: (d: Day) => number; color: string; label: string }) {
  const vals = days.map(pick), max = Math.max(1, ...vals), W = 600, H = 120, bw = W / vals.length;
  return (
    <figure className="abars">
      <figcaption>{label} <b>{vals.reduce((a, b) => a + b, 0).toLocaleString('uz-UZ')}</b></figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={label}>
        {vals.map((v, i) => <rect key={i} x={i * bw + 2} y={H - (v / max) * H} width={Math.max(2, bw - 4)} height={(v / max) * H} rx="3" fill={color} opacity={i === vals.length - 1 ? 1 : 0.75}><title>{`${days[i]!.day}: ${v}`}</title></rect>)}
        <text x="0" y={H + 14} fontSize="11" fill="currentColor" opacity=".6">{days[0]?.day.slice(5)}</text>
        <text x={W} y={H + 14} fontSize="11" fill="currentColor" opacity=".6" textAnchor="end">{days.at(-1)?.day.slice(5)}</text>
      </svg>
    </figure>
  );
}

export default function Admin() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState('');
  const [span, setSpan] = useState(30);
  const load = async () => {
    setErr('');
    try {
      const r = await fetch(`/api/admin/analytics?days=${span}`, { headers: { 'x-token': getAccount()?.token ?? '' } });
      const j = await r.json();
      if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
      setData(j as Data);
    } catch (e) { setErr((e as Error).message); }
  };
  useEffect(() => { void load(); }, [span]); // eslint-disable-line react-hooks/exhaustive-deps

  if (err) return <div className="card"><h2>{L('Analitika')}</h2><p className="notice">{err}</p></div>;
  if (!data) return <div className="card"><h2>{L('Analitika')}</h2><p className="muted">{L('Yuklanmoqda…')}</p></div>;
  const t = data.totals, top = Math.max(1, data.funnel[0]?.n ?? 1);
  const pct = (v: number | null) => (v === null ? '—' : `${v}%`);
  return (
    <div>
      <section className="card page-head t-sky">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0 }}><BarChart3 size={22} style={{ verticalAlign: -3 }} /> {L('Analitika')}</h2>
          <div className="row">
            <div className="seg" role="tablist" aria-label={L('Davr')}>{[7, 30, 90].map((d) => <button key={d} type="button" className={span === d ? 'on' : ''} onClick={() => setSpan(d)}>{L('{0} kun', [d])}</button>)}</div>
            <button className="icon-btn" onClick={() => void load()} aria-label={L('Yangilash')}><RefreshCw size={18} /></button>
          </div>
        </div>
      </section>

      <div className="kpis">
        <div className="kpi2"><span>{L('O‘quvchilar')}</span><b>{t.players}</b><small>{L('Telegram orqali: {0}', [t.telegram])}</small></div>
        <div className="kpi2"><span>{L('Bugun faol')}</span><b>{t.dau}</b><small>{L('7 kun: {0} · 30 kun: {1}', [t.wau, t.mau])}</small></div>
        <div className="kpi2"><span>{L('To‘lovchi obunachilar')}</span><b>{t.payingNow}</b><small>{t.players ? `${Math.round((t.payingNow / t.players) * 1000) / 10}%` : '—'}{t.subscribedNow !== undefined && t.subscribedNow !== t.payingNow ? ` · ${L('sovg‘a bilan: {0}', [t.subscribedNow])}` : ''}</small></div>
        <div className="kpi2"><span>{L('Tushum ({0} kun)', [span])}</span><b>{fmtSum(data.revenue30)}</b><small>{L('{0} ta to‘lov', [data.paid30])}</small></div>
      </div>

      <section className="card">
        <Bars days={data.days} pick={(d) => d.active} color="var(--brand)" label={L('Kunlik faol o‘quvchilar')} />
        <Bars days={data.days} pick={(d) => d.signups} color="var(--teal)" label={L('Yangi o‘quvchilar')} />
        <Bars days={data.days} pick={(d) => d.revenue} color="var(--yellow)" label={L('Tushum (so‘m)')} />
      </section>

      {data.walls && (
        <section className="card">
          <h3>{L('Bepul tarif: kunlik devor (30 kun)')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{L('Kunlik bepul darsni tugatib, yangisini ochmoqchi bo‘lgan (devorga urilgan) o‘quvchilar va ulardan 7 kun ichida to‘lov qilganlar.')}</p>
          <div className="kpis three">
            <div className="kpi2"><span>{L('Devorga urilgan')}</span><b>{data.walls.walled}</b></div>
            <div className="kpi2"><span>{L('7 kunda obuna olgan')}</span><b>{data.walls.converted}</b></div>
            <div className="kpi2"><span>{L('Konversiya')}</span><b>{data.walls.rate === null ? '—' : `${data.walls.rate}%`}</b></div>
            <div className="kpi2"><span>{L('Bugun devorda')}</span><b>{data.walls.today}</b></div>
          </div>
          <p className="note muted">{L('Chegaralarni Railway’da o‘zgartirish mumkin: FREE_LESSONS_PER_DAY, FREE_FIRST_DAY_LESSONS, FREE_WRITING_PER_WEEK, FREE_SPEAKING_PER_WEEK.')}</p>
        </section>
      )}
      {data.bands && (
        <section className="card">
          <h3>{L('Band o‘sishi (haqiqiy natijalar)')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{L('Boshlang‘ich to‘liq imtihondan kamida 14 kun keyin yana imtihon topshirganlar hisoblanadi. Marketingda faqat shu raqamlarga tayaning.')}</p>
          <div className="kpis three">
            <div className="kpi2"><span>{L('Boshlang‘ich o‘lchangan')}</span><b>{data.bands.withBaseline}</b></div>
            <div className="kpi2"><span>{L('Qayta o‘lchangan')}</span><b>{data.bands.measured}</b></div>
            <div className="kpi2"><span>{L('O‘rtacha o‘sish')}</span><b>{data.bands.avgGain === null ? '—' : `${data.bands.avgGain >= 0 ? '+' : ''}${data.bands.avgGain.toFixed(2)}`}</b></div>
            <div className="kpi2"><span>{L('Mediana')}</span><b>{data.bands.medianGain === null ? '—' : `${data.bands.medianGain >= 0 ? '+' : ''}${data.bands.medianGain.toFixed(1)}`}</b></div>
            <div className="kpi2"><span>{L('+0.5 va undan ko‘p')}</span><b>{pct(data.bands.shareHalf)}</b></div>
            <div className="kpi2"><span>{L('+1.0 va undan ko‘p')}</span><b>{pct(data.bands.shareOne)}</b></div>
            <div className="kpi2"><span>{L('O‘rtacha muddat')}</span><b>{data.bands.avgDays === null ? '—' : L('{0} kun', [data.bands.avgDays])}</b></div>
            <div className="kpi2"><span>{L('Rasmiy natija kiritgan')}</span><b>{data.bands.officials}</b></div>
            <div className="kpi2"><span>{L('Rasmiy − boshlang‘ich')}</span><b>{data.bands.officialVsBaseline === null ? '—' : `${data.bands.officialVsBaseline >= 0 ? '+' : ''}${data.bands.officialVsBaseline.toFixed(2)}`}</b></div>
          </div>
          {data.bands.measured < 30 && <p className="notice">{L('Hozircha {0} ta o‘lchov. Ishonchli xulosa uchun kamida 30 ta qayta o‘lchangan o‘quvchi kerak.', [data.bands.measured])}</p>}
        </section>
      )}

      <div className="dash2">
        <section className="card">
          <h3>{L('Saqlanib qolish')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{L('Oxirgi 60 kunda ro‘yxatdan o‘tgan {0} kishi', [data.retention.cohort])}</p>
          <div className="kpis three">
            <div className="kpi2"><span>D1</span><b>{pct(data.retention.d1)}</b></div>
            <div className="kpi2"><span>D7</span><b>{pct(data.retention.d7)}</b></div>
            <div className="kpi2"><span>D30</span><b>{pct(data.retention.d30)}</b></div>
          </div>
        </section>
        {data.growth && (
          <section className="card">
            <h3>{L('O‘sish voronkasi ({0} kun)', [span])}</h3>
            <div className="kpis">
              <div className="kpi2"><span>{L('Daraja testi → ro‘yxat')}</span><b>{pct(data.growth.placementToSignupPct)}</b><small>{L('Maqsad: 35%')} · {data.growth.events.placement_done} → {data.growth.signups}</small></div>
              <div className="kpi2"><span>{L('Taklif orqali kelganlar')}</span><b>{pct(data.growth.referredSharePct)}</b><small>{L('{0} ta, faollashgan: {1}', [data.growth.referredSignups, data.growth.referredActivated])}</small></div>
              <div className="kpi2"><span>{L('Ulashishlar')}</span><b>{(data.growth.events.share_placement_tg ?? 0) + (data.growth.events.share_placement_img ?? 0) + (data.growth.events.duel_share ?? 0)}</b><small>{L('Duel taklifini ochgan mehmonlar: {0}', [data.growth.events.duel_guest_view ?? 0])}</small></div>
              <div className="kpi2"><span>{L('Daraja testini boshlagan')}</span><b>{data.growth.events.placement_start ?? 0}</b><small>{L('SEO sahifadan: {0}', [data.growth.events.seo_cta ?? 0])}</small></div>
            </div>
          </section>
        )}
        <section className="card">
          <h3>{L('Voronka')}</h3>
          <div className="funnel">
            {data.funnel.map((f) => <div key={f.step} className="fstep"><span>{L(f.step)}</span><i style={{ width: `${(f.n / top) * 100}%` }} /><b>{f.n}</b></div>)}
          </div>
        </section>
      </div>

      <div className="dash2">
        <section className="card">
          <h3>{L('Faoliyat turlari ({0} kun)', [span])}</h3>
          <table className="data"><thead><tr><th>{L('Tur')}</th><th>{L('Hodisa')}</th><th>{L('XP')}</th></tr></thead>
            <tbody>{data.bySource.map((s) => <tr key={s.source}><td>{s.source}</td><td>{s.events}</td><td>{s.xp}</td></tr>)}</tbody></table>
        </section>
        <section className="card">
          <h3>{L('AI xarajati ({0} kun)', [span])}</h3>
          <table className="data"><thead><tr><th>{L('Funksiya')}</th><th>{L('USD')}</th></tr></thead>
            <tbody>{data.aiByFeature.map((s) => <tr key={s.feature}><td>{s.feature}</td><td>${s.usd.toFixed(2)}</td></tr>)}</tbody></table>
          <p className="muted">{L('Jami: ${0}', [data.days.reduce((a, d) => a + d.aiUsd, 0).toFixed(2)])}</p>
        </section>
      </div>
      <CertAdmin />
    </div>
  );
}
