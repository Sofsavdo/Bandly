// Admin kabineti: analitika (Umumiy · O'sish · Natijalar · Tizim), lidlar, foydalanuvchilar, to'lovlar, xodimlar, sertifikatlar.
// Analitika yuklanmasa ham boshqa tablar ishlaydi (avval xato butun kabinetni to'sardi).
import { BarChart3, RefreshCw } from 'lucide-react';
import { CohortPanel, type Cohort2 } from '../components/AdminCohort';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { CertAdmin } from '../components/CertAdmin';
import { LeadsPanel, PaymentsPanel, StaffPanel, UsersPanel } from '../components/AdminOps';
import { LimitsPanel } from '../components/AdminLimits';
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
  cohort2?: Cohort2; definitions?: Record<string, string>;
  bands?: { learners: number; withBaseline: number; measured: number; avgGain: number | null; medianGain: number | null; shareHalf: number | null; shareOne: number | null; avgDays: number | null; officials: number; officialVsBaseline: number | null };
}

type Tab = 'stats' | 'limits' | 'leads' | 'users' | 'payments' | 'staff' | 'certs';
type Sub = 'overview' | 'growth' | 'results' | 'system';

const num = (n: number) => n.toLocaleString('ru-RU');
const pct = (v: number | null) => (v === null ? '—' : `${v}%`);
const signed = (v: number | null, d = 2) => (v === null ? '—' : `${v >= 0 ? '+' : ''}${v.toFixed(d)}`);
/** Oldingi teng davrga nisbatan o'zgarish (foiz). */
function Delta({ cur, prev }: { cur: number; prev: number }) {
  if (!prev) return null;
  const d = Math.round(((cur - prev) / prev) * 100);
  return <em className={`adelta ${d >= 0 ? 'up' : 'down'}`}>{d >= 0 ? '▲' : '▼'} {Math.abs(d)}%</em>;
}

/** Oddiy ustunli grafik (SVG): kunlik qiymatlar. */
function Bars({ days, pick, color, label, fmt = num }: { days: Day[]; pick: (d: Day) => number; color: string; label: string; fmt?: (n: number) => string }) {
  const vals = days.map(pick), max = Math.max(1, ...vals), W = 600, H = 110, bw = W / Math.max(1, vals.length);
  return (
    <figure className="abars">
      <figcaption>{label} <b>{fmt(vals.reduce((a, b) => a + b, 0))}</b></figcaption>
      <svg viewBox={`0 0 ${W} ${H + 18}`} role="img" aria-label={label}>
        {vals.map((v, i) => <rect key={i} x={i * bw + 1.5} y={H - (v / max) * H} width={Math.max(2, bw - 3)} height={Math.max(v ? 2 : 0, (v / max) * H)} rx="3" fill={color} opacity={i === vals.length - 1 ? 1 : 0.75}><title>{`${days[i]!.day}: ${fmt(v)}`}</title></rect>)}
        <text x="0" y={H + 14} fontSize="11" fill="currentColor" opacity=".6">{days[0]?.day.slice(5)}</text>
        <text x={W} y={H + 14} fontSize="11" fill="currentColor" opacity=".6" textAnchor="end">{days.at(-1)?.day.slice(5)}</text>
      </svg>
    </figure>
  );
}

/** Voronka: har bosqich — soni, birinchi bosqichga nisbatan ulushi va oldingi davr bilan farqi. */
function Funnel({ steps }: { steps: { label: string; n: number; prev?: number }[] }) {
  const top = Math.max(1, steps[0]?.n ?? 1);
  return (
    <div className="afunnel">
      {steps.map((s, i) => (
        <div key={s.label} className="afstep">
          <span>{s.label}</span>
          <div className="afbar"><i style={{ width: `${Math.max(s.n ? 2 : 0, (s.n / top) * 100)}%` }} /></div>
          <b>{num(s.n)}</b>
          <small>{i === 0 ? '' : `${Math.round((s.n / top) * 1000) / 10}%`}</small>
          <small>{s.prev !== undefined ? <Delta cur={s.n} prev={s.prev} /> : null}</small>
        </div>
      ))}
    </div>
  );
}

const SOURCE: Record<string, string> = { lesson: L('Darslar'), boss: L('Boss jangi'), game: L('So‘z o‘yinlari'), exam: L('Imtihon'), grammar: L('Grammatika'), practice: L('Mashq'), mistakes: L('Xatolar ustida ishlash'), placement: L('Daraja testi'), quest: L('Kunlik vazifalar'), other: L('Boshqa'), mock: L('Mock test'), referral: L('Taklif bonusi') };
const FEATURE: Record<string, string> = { coach: L('AI ustoz (matn)'), live: L('AI ustoz (ovozli qo‘ng‘iroq)'), followup: L('Speaking savollari'), i18n: L('Tarjima'), stt: L('Nutqni tanish'), studio_voice: L('Studio ovozi'), tts_feedback: L('Ovozli izoh'), writing_eval: L('Writing baholash'), speaking_eval: L('Speaking baholash') };

export default function Admin() {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState('');
  const [span, setSpan] = useState(30);
  const [tab, setTab] = useState<Tab>('stats');
  const [sub, setSub] = useState<Sub>('overview');
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

  const tabs = (
    <div className="seg seg-scroll" role="tablist" aria-label={L('Admin kabineti')} style={{ marginBottom: 14 }}>
      {([['stats', L('Analitika')], ['limits', L('Limitlar')], ['leads', L('Lidlar')], ['users', L('Foydalanuvchilar')], ['payments', L('To‘lovlar')], ['staff', L('Xodimlar')], ['certs', L('Sertifikatlar')]] as const).map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>)}
    </div>
  );
  if (tab !== 'stats') return <div>{tabs}{tab === 'limits' ? <LimitsPanel /> : tab === 'leads' ? <LeadsPanel /> : tab === 'users' ? <UsersPanel /> : tab === 'payments' ? <PaymentsPanel /> : tab === 'staff' ? <StaffPanel /> : <CertAdmin />}</div>;

  const head = (
    <section className="card page-head t-sky">
      <div className="row" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <h2 style={{ margin: 0 }}><BarChart3 size={22} style={{ verticalAlign: -3 }} /> {L('Analitika')}</h2>
          {data && <small className="muted">{L('Yangilangan: {0}', [new Date(data.generatedAt).toLocaleString('ru-RU')])}</small>}
        </div>
        <div className="row">
          <div className="seg seg-inline" role="tablist" aria-label={L('Davr')}>{[7, 30, 90].map((d) => <button key={d} type="button" className={span === d ? 'on' : ''} onClick={() => setSpan(d)}>{L('{0} kun', [d])}</button>)}</div>
          <button className="icon-btn" onClick={() => void load()} aria-label={L('Yangilash')}><RefreshCw size={18} /></button>
        </div>
      </div>
      <div className="seg seg-scroll" role="tablist" aria-label={L('Bo‘lim')} style={{ marginTop: 12 }}>
        {([['overview', L('Umumiy')], ['growth', L('O‘sish')], ['results', L('Natijalar')], ['system', L('Xarajat va tizim')]] as const).map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={sub === k} className={sub === k ? 'on' : ''} onClick={() => setSub(k)}>{label}</button>)}
      </div>
    </section>
  );

  if (err) return <div>{tabs}{head}<div className="card"><p className="notice">{err}</p></div></div>;
  if (!data) return <div>{tabs}{head}<div className="card"><p className="muted">{L('Yuklanmoqda…')}</p></div></div>;

  const t = data.totals;
  const newInPeriod = data.days.reduce((a, d) => a + d.signups, 0);
  const aiTotal = data.days.reduce((a, d) => a + d.aiUsd, 0);
  const g = data.growth;
  const ev = (k: string) => g?.events[k] ?? { total: 0, unique: 0 };

  return (
    <div>
      {tabs}
      {head}

      {sub === 'overview' && <>
        <div className="kpis">
          <div className="kpi2"><span>{L('O‘quvchilar')}</span><b>{num(t.players)}</b><small>{L('Davrda yangi: {0}', [num(newInPeriod)])} · {L('Telegram orqali: {0}', [num(t.telegram)])}</small></div>
          <div className="kpi2"><span>{L('Bugun faol')}</span><b>{num(t.dau)}</b><small>{L('7 kun: {0} · 30 kun: {1}', [num(t.wau), num(t.mau)])}</small></div>
          <div className="kpi2"><span>{L('To‘lovchi obunachilar')}</span><b>{num(t.payingNow)}</b><small>{t.players ? `${Math.round((t.payingNow / t.players) * 1000) / 10}%` : '—'}{t.subscribedNow !== undefined && t.subscribedNow !== t.payingNow ? ` · ${L('sovg‘a bilan: {0}', [t.subscribedNow])}` : ''}</small></div>
          <div className="kpi2"><span>{L('Tushum ({0} kun)', [span])}</span><b>{fmtSum(data.revenue30)}</b><small>{L('{0} ta to‘lov', [data.paid30])}</small></div>
        </div>
        <div className="acharts">
          <section className="card"><Bars days={data.days} pick={(d) => d.active} color="var(--brand)" label={L('Kunlik faol o‘quvchilar')} /></section>
          <section className="card"><Bars days={data.days} pick={(d) => d.signups} color="var(--teal)" label={L('Yangi o‘quvchilar')} /></section>
          <section className="card"><Bars days={data.days} pick={(d) => d.revenue} color="var(--yellow)" label={L('Tushum (so‘m)')} fmt={(n) => fmtSum(n)} /></section>
        </div>
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Saqlanib qolish')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{L('Oxirgi 60 kunda ro‘yxatdan o‘tgan {0} kishi', [data.retention.cohort])}</p>
          <div className="kpis three">
            <div className="kpi2"><span>{L('1-kun')}</span><b>{pct(data.retention.d1)}</b></div>
            <div className="kpi2"><span>{L('7-kun')}</span><b>{pct(data.retention.d7)}</b></div>
            <div className="kpi2"><span>{L('30-kun')}</span><b>{pct(data.retention.d30)}</b></div>
          </div>
        </section>
      </>}

      {sub === 'growth' && <>
        {data.cohort2 && <CohortPanel c={data.cohort2} defs={data.definitions} />}
        {g && (
          <section className="card">
            <h3 style={{ marginTop: 0 }}>{L('Voronka: shu davrda ro‘yxatdan o‘tganlar')}</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>{L('Har bir odam bir marta hisoblanadi. Foiz — ro‘yxatdan o‘tganlarga nisbatan; o‘q — oldingi teng davrga nisbatan.')}</p>
            <Funnel steps={[
              { label: L('Ro‘yxatdan o‘tdi'), n: g.cohort.signups, prev: g.previous.signups },
              { label: L('Daraja testi'), n: g.cohort.placement, prev: g.previous.placement },
              { label: L('Birinchi dars'), n: g.cohort.lesson, prev: g.previous.lesson },
              { label: L('Mock test'), n: g.cohort.mock, prev: g.previous.mock },
              { label: L('To‘lov qildi'), n: g.cohort.paid, prev: g.previous.paid },
              { label: L('Qayta to‘lov'), n: g.cohort.renewed, prev: g.previous.renewed },
            ]} />
          </section>
        )}
        {g && (
          <section className="card">
            <h3 style={{ marginTop: 0 }}>{L('Mehmonlar (noyob brauzerlar)')}</h3>
            <div className="kpis">
              <div className="kpi2"><span>{L('Landingni ochdi')}</span><b>{num(g.visitors.landing)}</b></div>
              <div className="kpi2"><span>{L('«Bepul boshlash»ni bosdi')}</span><b>{num(g.visitors.signupStart)}</b><small>{pct(g.visitors.landingToSignupStartPct)}</small></div>
              <div className="kpi2"><span>{L('Narxlarni ko‘rdi')}</span><b>{num(g.visitors.pricing)}</b></div>
              <div className="kpi2"><span>{L('To‘lovni boshladi')}</span><b>{num(g.visitors.checkout)}</b></div>
            </div>
          </section>
        )}
        <div className="dash2">
          {g && (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>{L('Taklif va ulashish')}</h3>
              <div className="kpis three">
                <div className="kpi2"><span>{L('Taklif orqali kelgan')}</span><b>{num(g.referredSignups)}</b><small>{pct(g.referredSharePct)}</small></div>
                <div className="kpi2"><span>{L('Ulardan faollashgan')}</span><b>{num(g.referredActivated)}</b></div>
                <div className="kpi2"><span>{L('Ulashishlar')}</span><b>{num(ev('share_placement_tg').total + ev('share_placement_img').total + ev('duel_share').total + ev('share_mock').total)}</b></div>
              </div>
            </section>
          )}
          {data.walls && (
            <section className="card">
              <h3 style={{ marginTop: 0 }}>{L('Bepul tarif chegarasi (30 kun)')}</h3>
              <div className="kpis three">
                <div className="kpi2"><span>{L('Chegaraga yetgan')}</span><b>{num(data.walls.walled)}</b><small>{L('bugun: {0}', [data.walls.today])}</small></div>
                <div className="kpi2"><span>{L('7 kunda obuna olgan')}</span><b>{num(data.walls.converted)}</b></div>
                <div className="kpi2"><span>{L('Konversiya')}</span><b>{pct(data.walls.rate)}</b></div>
              </div>
            </section>
          )}
        </div>
        <details className="card">
          <summary><b>{L('Barcha vaqt voronkasi')}</b></summary>
          <Funnel steps={data.funnel.map((f) => ({ label: L(f.step), n: f.n }))} />
        </details>
      </>}

      {sub === 'results' && (data.bands ? (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Band o‘sishi (haqiqiy natijalar)')}</h3>
          <p className="muted" style={{ marginTop: 0 }}>{L('Boshlang‘ich to‘liq imtihondan kamida 14 kun keyin yana imtihon topshirganlar hisoblanadi. Marketingda faqat shu raqamlarga tayaning.')}</p>
          <div className="kpis">
            <div className="kpi2"><span>{L('Boshlang‘ich o‘lchangan')}</span><b>{num(data.bands.withBaseline)}</b></div>
            <div className="kpi2"><span>{L('Qayta o‘lchangan')}</span><b>{num(data.bands.measured)}</b></div>
            <div className="kpi2"><span>{L('O‘rtacha o‘sish')}</span><b>{signed(data.bands.avgGain)}</b><small>{L('Mediana')}: {signed(data.bands.medianGain, 1)}</small></div>
            <div className="kpi2"><span>{L('O‘rtacha muddat')}</span><b>{data.bands.avgDays === null ? '—' : L('{0} kun', [data.bands.avgDays])}</b></div>
            <div className="kpi2"><span>{L('+0.5 va undan ko‘p')}</span><b>{pct(data.bands.shareHalf)}</b></div>
            <div className="kpi2"><span>{L('+1.0 va undan ko‘p')}</span><b>{pct(data.bands.shareOne)}</b></div>
            <div className="kpi2"><span>{L('Rasmiy natija kiritgan')}</span><b>{num(data.bands.officials)}</b><small>{L('Rasmiy − boshlang‘ich')}: {signed(data.bands.officialVsBaseline)}</small></div>
          </div>
          {data.bands.measured < 30 && <p className="notice">{L('Hozircha {0} ta o‘lchov. Ishonchli xulosa uchun kamida 30 ta qayta o‘lchangan o‘quvchi kerak.', [data.bands.measured])}</p>}
        </section>
      ) : <div className="card"><p className="muted">{L('Hali ma’lumot yo‘q.')}</p></div>)}

      {sub === 'system' && <>
        <div className="dash2">
          <section className="card">
            <h3 style={{ marginTop: 0 }}>{L('AI xarajati ({0} kun)', [span])}</h3>
            <div className="kpis three">
              <div className="kpi2"><span>{L('Jami')}</span><b>${aiTotal.toFixed(2)}</b></div>
              <div className="kpi2"><span>{L('Kuniga o‘rtacha')}</span><b>${(aiTotal / Math.max(1, data.days.length)).toFixed(2)}</b></div>
              <div className="kpi2"><span>{L('Faol o‘quvchiga')}</span><b>{t.mau ? `$${(aiTotal / t.mau).toFixed(3)}` : '—'}</b></div>
            </div>
            <div className="table-scroll"><table className="data"><thead><tr><th>{L('Funksiya')}</th><th style={{ textAlign: 'right' }}>{L('USD')}</th></tr></thead>
              <tbody>{data.aiByFeature.length ? data.aiByFeature.map((s) => <tr key={s.feature}><td>{FEATURE[s.feature] ?? s.feature}</td><td style={{ textAlign: 'right' }}>${s.usd.toFixed(2)}</td></tr>) : <tr><td colSpan={2} className="muted">{L('Hali ma’lumot yo‘q.')}</td></tr>}</tbody></table></div>
          </section>
          <section className="card">
            <h3 style={{ marginTop: 0 }}>{L('Faoliyat turlari ({0} kun)', [span])}</h3>
            <div className="table-scroll"><table className="data"><thead><tr><th>{L('Tur')}</th><th style={{ textAlign: 'right' }}>{L('Hodisa')}</th><th style={{ textAlign: 'right' }}>{L('XP')}</th></tr></thead>
              <tbody>{data.bySource.length ? data.bySource.map((s) => <tr key={s.source}><td>{SOURCE[s.source] ?? s.source}</td><td style={{ textAlign: 'right' }}>{num(s.events)}</td><td style={{ textAlign: 'right' }}>{num(s.xp)}</td></tr>) : <tr><td colSpan={3} className="muted">{L('Hali ma’lumot yo‘q.')}</td></tr>}</tbody></table></div>
          </section>
        </div>
        {data.backup && (
          <section className="card">
            <h3 style={{ marginTop: 0 }}>{L('Zaxira nusxa')}</h3>
            <div className="kpis">
              <div className="kpi2"><span>{L('Oxirgi mahalliy nusxa')}</span><b style={{ fontSize: 20 }}>{data.backup.newestLocalAt ? new Date(data.backup.newestLocalAt).toLocaleString('ru-RU') : '—'}</b><small>{L('{0} ta nusxa, {1} kun saqlanadi', [data.backup.localCount, data.backup.keepDays])}</small></div>
              <div className="kpi2"><span>{L('Tashqi ombor')}</span><b style={{ fontSize: 20 }}>{data.backup.offsite === 'configured' ? L('ulangan') : data.backup.offsite === 'misconfigured' ? L('noto‘g‘ri sozlangan') : L('ulanmagan')}</b><small>{data.backup.lastOffsiteAt ? new Date(data.backup.lastOffsiteAt).toLocaleString('ru-RU') : L('hali yuborilmagan')}</small></div>
            </div>
            {!data.backup.enabled && <p className="notice">{L('Avtomatik zaxira o‘chiq.')}</p>}
            {data.backup.stale && <p className="notice">{L('Oxirgi 27 soatda yangi nusxa olinmagan.')}</p>}
            {data.backup.lastError && <p className="notice">{L('Mahalliy nusxa xatosi: {0}', [data.backup.lastError])}</p>}
            {data.backup.lastOffsiteError && <p className="notice">{L('Tashqi nusxa xatosi: {0}', [data.backup.lastOffsiteError])}</p>}
            {data.backup.offsite !== 'configured' && <p className="muted" style={{ fontSize: 13 }}>{L('Nusxalar server diski ichida: disk yo‘qolsa, ular ham yo‘qoladi. BACKUP_S3_* sozlang.')}</p>}
          </section>
        )}
      </>}
    </div>
  );
}
