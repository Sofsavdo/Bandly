// Admin analitikasi: faollik, yangi o'quvchilar, saqlanib qolish, voronka, to'lovlar va AI xarajati (faqat admin).
import { BarChart3, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { CertAdmin } from '../components/CertAdmin';
import { LeadsPanel, PaymentsPanel, StaffPanel, UsersPanel } from '../components/AdminOps';
import { L } from '../i18n';

interface Day { day: string; signups: number; active: number; paid: number; revenue: number; aiUsd: number }
interface Data {
  generatedAt: number;
  totals: { players: number; telegram: number; payingNow: number; subscribedNow?: number; dau: number; wau: number; mau: number };
  days: Day[]; retention: { cohort: number; d1: number | null; d7: number | null; d30: number | null };
  funnel: { step: string; n: number }[]; bySource: { source: string; events: number; xp: number }[];
  aiByFeature: { feature: string; usd: number }[]; revenue30: number; paid30: number;
  walls?: { walled: number; converted: number; rate: number | null; today: number };
  backup?: { enabled: boolean; keepDays: number; newestLocalAt: number | null; localCount: number; lastError: string | null; offsite: 'not_configured' | 'misconfigured' | 'configured'; lastOffsiteAt: number | null; lastOffsiteError: string | null; stale: boolean };
  growth?: { events: Record<string, { total: number; unique: number }>; visitors: { landing: number; signupStart: number; pricing: number; checkout: number; landingToSignupStartPct: number | null }; cohort: { signups: number; placement: number; lesson: number; mock: number; paid: number; renewed: number; placementPct: number | null; lessonPct: number | null; mockPct: number | null; paidPct: number | null }; previous: { signups: number; placement: number; lesson: number; mock: number; paid: number; renewed: number }; referredSignups: number; referredActivated: number; referredSharePct: number | null };
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
  const [tab, setTab] = useState<'stats' | 'leads' | 'users' | 'payments' | 'staff' | 'certs'>('stats');
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

  if (err) return <div className="card"><h2>{L('Admin kabineti')}</h2><p className="notice">{err}</p></div>;
  if (!data) return <div className="card"><h2>{L('Admin kabineti')}</h2><p className="muted">{L('Yuklanmoqda…')}</p></div>;
  const tabs = (
    <div className="seg" role="tablist" aria-label={L('Admin kabineti')} style={{ marginBottom: 14 }}>
      {([['stats', L('Analitika')], ['leads', L('Lidlar')], ['users', L('Foydalanuvchilar')], ['payments', L('To‘lovlar')], ['staff', L('Xodimlar')], ['certs', L('Sertifikatlar')]] as const).map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
    </div>
  );
  if (tab !== 'stats') return <div>{tabs}{tab === 'leads' ? <LeadsPanel /> : tab === 'users' ? <UsersPanel /> : tab === 'payments' ? <PaymentsPanel /> : tab === 'staff' ? <StaffPanel /> : <CertAdmin />}</div>;
  const t = data.totals, top = Math.max(1, data.funnel[0]?.n ?? 1);
  const pct = (v: number | null) => (v === null ? '—' : `${v}%`);
  return (
    <div>
      {tabs}
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
        {data.backup && (
          <section className="card">
            <h3>{L('Zaxira nusxa')}</h3>
            <div className="kpis">
              <div className="kpi2"><span>{L('Oxirgi mahalliy nusxa')}</span><b>{data.backup.newestLocalAt ? new Date(data.backup.newestLocalAt).toLocaleString() : '—'}</b><small>{L('{0} ta nusxa, {1} kun saqlanadi', [data.backup.localCount, data.backup.keepDays])}</small></div>
              <div className="kpi2"><span>{L('Tashqi ombor')}</span><b>{data.backup.offsite === 'configured' ? L('ulangan') : data.backup.offsite === 'misconfigured' ? L('noto‘g‘ri sozlangan') : L('ulanmagan')}</b><small>{data.backup.lastOffsiteAt ? new Date(data.backup.lastOffsiteAt).toLocaleString() : L('hali yuborilmagan')}</small></div>
            </div>
            {!data.backup.enabled && <p className="notice">{L('Avtomatik zaxira o‘chiq.')}</p>}
            {data.backup.stale && <p className="notice">{L('Oxirgi 27 soatda yangi nusxa olinmagan.')}</p>}
            {data.backup.lastError && <p className="notice">{L('Mahalliy nusxa xatosi: {0}', [data.backup.lastError])}</p>}
            {data.backup.lastOffsiteError && <p className="notice">{L('Tashqi nusxa xatosi: {0}', [data.backup.lastOffsiteError])}</p>}
            {data.backup.offsite !== 'configured' && <p className="muted" style={{ fontSize: 13 }}>{L('Nusxalar server diski ichida: disk yo‘qolsa, ular ham yo‘qoladi. BACKUP_S3_* sozlang.')}</p>}
          </section>
        )}
        {data.growth && (() => {
          const g = data.growth; const ev = (k: string) => g.events[k] ?? { total: 0, unique: 0 };
          const delta = (cur: number, prev: number) => (prev ? `${cur >= prev ? '+' : ''}${Math.round(((cur - prev) / prev) * 100)}%` : '—');
          return (
            <section className="card">
              <h3>{L('O‘sish voronkasi ({0} kun)', [span])}</h3>
              <p className="muted" style={{ fontSize: 13 }}>{L('Mehmon bosqichlari — noyob brauzerlar; ro‘yxatdan keyingi bosqichlar — shu davrda ro‘yxatdan o‘tganlar (bir odam bir marta). Qavsda — oldingi teng davrga nisbatan.')}</p>
              <div className="kpis">
                <div className="kpi2"><span>{L('Landing → «Bepul boshlash»')}</span><b>{pct(g.visitors.landingToSignupStartPct)}</b><small>{g.visitors.landing} → {g.visitors.signupStart}</small></div>
                <div className="kpi2"><span>{L('Ro‘yxatdan o‘tdi')}</span><b>{g.cohort.signups}</b><small>({delta(g.cohort.signups, g.previous.signups)})</small></div>
                <div className="kpi2"><span>{L('Daraja testi')}</span><b>{pct(g.cohort.placementPct)}</b><small>{g.cohort.placement} ({delta(g.cohort.placement, g.previous.placement)})</small></div>
                <div className="kpi2"><span>{L('Birinchi dars')}</span><b>{pct(g.cohort.lessonPct)}</b><small>{g.cohort.lesson} ({delta(g.cohort.lesson, g.previous.lesson)})</small></div>
                <div className="kpi2"><span>{L('Narxlarni ko‘rdi / to‘lovni boshladi')}</span><b>{g.visitors.pricing} / {g.visitors.checkout}</b><small>{L('noyob brauzerlar')}</small></div>
                <div className="kpi2"><span>{L('To‘lov qildi')}</span><b>{pct(g.cohort.paidPct)}</b><small>{g.cohort.paid} · {L('qayta to‘lov: {0}', [g.cohort.renewed])}</small></div>
                <div className="kpi2"><span>{L('Taklif orqali kelganlar')}</span><b>{pct(g.referredSharePct)}</b><small>{L('{0} ta, faollashgan: {1}', [g.referredSignups, g.referredActivated])}</small></div>
                <div className="kpi2"><span>{L('Ulashishlar')}</span><b>{ev('share_placement_tg').total + ev('share_placement_img').total + ev('duel_share').total + ev('share_mock').total}</b><small>{L('jami bosishlar')}</small></div>
              </div>
            </section>
          );
        })()}
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
          <div className="table-scroll"><table className="data"><thead><tr><th>{L('Tur')}</th><th>{L('Hodisa')}</th><th>{L('XP')}</th></tr></thead>
            <tbody>{data.bySource.map((s) => <tr key={s.source}><td>{s.source}</td><td>{s.events}</td><td>{s.xp}</td></tr>)}</tbody></table></div>
        </section>
        <section className="card">
          <h3>{L('AI xarajati ({0} kun)', [span])}</h3>
          <div className="table-scroll"><table className="data"><thead><tr><th>{L('Funksiya')}</th><th>{L('USD')}</th></tr></thead>
            <tbody>{data.aiByFeature.map((s) => <tr key={s.feature}><td>{s.feature}</td><td>${s.usd.toFixed(2)}</td></tr>)}</tbody></table></div>
          <p className="muted">{L('Jami: ${0}', [data.days.reduce((a, d) => a + d.aiUsd, 0).toFixed(2)])}</p>
        </section>
      </div>
    </div>
  );
}
