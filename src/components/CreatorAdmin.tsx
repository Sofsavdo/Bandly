// Admin → Hamkorlar (Creator CRM): hamkorlar ro'yxati va statusi, kampaniyalar, post tasdiqlash, firibgarlik belgilari, mukofot daftari va CSV.
// Faqat agregat ko'rsatkichlar: o'quvchilarning shaxsiy ma'lumoti bu ekranda ham, CSV'da ham yo'q.
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { LEDGER_STATUS, POST_STATUS } from './CreatorPosts';
import { L } from '../i18n';

async function call<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, { method: body === undefined ? 'GET' : 'POST', headers: { 'x-token': getAccount()?.token ?? '', ...(body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({})) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}
interface Fun { uniqueClicks: number; signups: number; activated: number; d7: { active: number }; paid: number; netRevenue: number; refundedSum: number; rates: { clickToSignup: number | null; signupToActivation: number | null; activationToPaid: number | null; refundRate: number | null } }
interface Creator { id: number; nickname: string; status: string; locale: string | null; country: string | null; platforms: string | null; note: string | null; links: number; funnel: Fun; openFlags: number; posts: Record<string, number> }
interface Camp { id: number; name: string; brief: string; status: string; requiresVideo: boolean; rewardEnabled: boolean; budgetMinor: number | null; capPerCreatorMinor: number | null; endsAt: number | null }
interface Program { commissionEnabled: boolean; commissionPct: number | null; globalBudgetMinor: number | null; capPerCreatorMinor: number | null; windowDays: number; attribution: string }
interface Kpis { funnel: Fun & { clicks: number }; rewardCostMinor: number; cacPerActivatedMinor: number | null; cacPerPayerMinor: number | null }
interface LedgerRow { id: number; creator?: string; kind: string; amountMinor: number; status: string; createdAt: number; paymentId?: string | null; basis: { pct?: number; capped?: boolean } | null }
interface AdminPost { id: number; creator?: string; platform: string; url: string | null; lang: string | null; postedOn: string | null; caption: string | null; claimedViews: number | null; status: string }
interface Flag { id: number; creator: string; kind: string; detail: string | null; ts: number }
const STATUSES = ['invited', 'applied', 'approved', 'paused', 'rejected'];
const pct = (x: number | null): string => (x === null ? '—' : `${x}%`);
const minorToSom = (m: number): string => fmtSum(Math.round(m / 100));

export function CreatorAdmin() {
  const [sec, setSec] = useState<'creators' | 'campaigns' | 'posts' | 'flags' | 'ledger'>('creators');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const run = async (fn: () => Promise<unknown>, ok?: string) => { setErr(''); setMsg(''); try { await fn(); if (ok) setMsg(ok); } catch (e) { setErr((e as Error).message); } };
  return (
    <div>
      <div className="seg" role="tablist" aria-label={L('Hamkorlar bo‘limlari')}>
        {([['creators', L('Hamkorlar')], ['campaigns', L('Kampaniyalar')], ['posts', L('Postlar')], ['flags', L('Gumonli holatlar')], ['ledger', L('Mukofot daftari')]] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={sec === k} className={sec === k ? 'on' : ''} onClick={() => setSec(k)}>{l}</button>)}
      </div>
      {err && <p className="notice" role="alert">{err}</p>}{msg && <p className="evidence" role="status">{msg}</p>}
      {sec === 'creators' ? <Creators run={run} /> : sec === 'campaigns' ? <Campaigns run={run} /> : sec === 'posts' ? <Posts run={run} /> : sec === 'flags' ? <Flags run={run} /> : <Ledger run={run} />}
    </div>
  );
}
type Run = (fn: () => Promise<unknown>, ok?: string) => Promise<void>;

function Creators({ run }: { run: Run }) {
  const [d, setD] = useState<{ creators: Creator[]; kpis: Kpis; program: Program } | null>(null);
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [locale, setLocale] = useState(''); const [days, setDays] = useState(30); const [open, setOpen] = useState<number | null>(null);
  const load = useCallback(() => { const p = new URLSearchParams({ days: String(days), ...(q ? { q } : {}), ...(status ? { status } : {}), ...(locale ? { locale } : {}) }); void run(async () => setD(await call(`/api/creatoradmin/list?${p}`))); }, [days, q, status, locale, run]);
  useEffect(load, [load]);
  const save = (c: Creator, b: Record<string, unknown>) => void run(async () => { await call('/api/creatoradmin/profile', { nickname: c.nickname, ...b }); load(); }, L('Saqlandi'));
  const csv = () => void run(async () => { const r = await fetch(`/api/creatoradmin/export.csv?days=${days}`, { headers: { 'x-token': getAccount()?.token ?? '' } }); if (!r.ok) throw new Error(L('Xato {0}', [r.status])); const u = URL.createObjectURL(await r.blob()); const a = document.createElement('a'); a.href = u; a.download = 'sellzen-creators.csv'; a.click(); URL.revokeObjectURL(u); });
  return (
    <>
      <div className="row" style={{ margin: '10px 0' }}>
        <input className="input" value={q} placeholder={L('Laqab bo‘yicha qidirish')} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={L('Holat')}><option value="">{L('Barcha holatlar')}</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select value={locale} onChange={(e) => setLocale(e.target.value)} aria-label={L('Til')}><option value="">{L('Barcha tillar')}</option>{['uz', 'en', 'ru', 'tg', 'ky', 'kk'].map((l) => <option key={l} value={l}>{l}</option>)}</select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label={L('Davr')}>{[7, 30, 90, 365].map((n) => <option key={n} value={n}>{L('Oxirgi {0} kun', [n])}</option>)}</select>
        <button className="btn sm" onClick={csv}>{L('CSV yuklab olish')}</button>
      </div>
      {d && (
        <div className="kpis">
          <div className="kpi2"><span>{L('Klik → ro‘yxat')}</span><b>{pct(d.kpis.funnel.rates.clickToSignup)}</b></div>
          <div className="kpi2"><span>{L('Ro‘yxat → faollashish')}</span><b>{pct(d.kpis.funnel.rates.signupToActivation)}</b></div>
          <div className="kpi2"><span>{L('Faollashish → to‘lov')}</span><b>{pct(d.kpis.funnel.rates.activationToPaid)}</b></div>
          <div className="kpi2"><span>{L('Qaytarish ulushi')}</span><b>{pct(d.kpis.funnel.rates.refundRate)}</b></div>
          <div className="kpi2"><span>{L('Sof tushum')}</span><b>{fmtSum(d.kpis.funnel.netRevenue)}</b></div>
          <div className="kpi2"><span>{L('Mukofot xarajati')}</span><b>{minorToSom(d.kpis.rewardCostMinor)}</b></div>
          <div className="kpi2"><span>{L('CAC (faollashgan boshiga)')}</span><b>{d.kpis.cacPerActivatedMinor === null ? '—' : minorToSom(d.kpis.cacPerActivatedMinor)}</b></div>
          <div className="kpi2"><span>{L('CAC (to‘lagan boshiga)')}</span><b>{d.kpis.cacPerPayerMinor === null ? '—' : minorToSom(d.kpis.cacPerPayerMinor)}</b></div>
        </div>
      )}
      <div className="table-scroll"><table className="data"><thead><tr><th>{L('Laqab')}</th><th>{L('Holat')}</th><th>{L('Noyob klik')}</th><th>{L('Ro‘yxat')}</th><th>{L('Faol')}</th><th>{L('7-kun')}</th><th>{L('To‘lagan')}</th><th>{L('Sof tushum')}</th><th>{L('Qaytarilgan')}</th><th>{L('Belgi')}</th></tr></thead><tbody>
        {d?.creators.map((c) => (
          <>
            <tr key={c.id}><td><button className="linkbtn" onClick={() => setOpen(open === c.id ? null : c.id)}>{c.nickname}</button><small className="muted"> {c.locale ?? ''}</small></td>
              <td><select value={c.status} aria-label={L('Holat')} onChange={(e) => save(c, { status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
              <td>{c.funnel.uniqueClicks}</td><td>{c.funnel.signups}</td><td>{c.funnel.activated}</td><td>{c.funnel.d7.active}</td><td>{c.funnel.paid}</td><td>{fmtSum(c.funnel.netRevenue)}</td><td>{fmtSum(c.funnel.refundedSum)}</td><td>{c.openFlags || ''}</td></tr>
            {open === c.id && <tr key={`${c.id}-p`}><td colSpan={10}><ProfileForm c={c} save={(b) => save(c, b)} /></td></tr>}
          </>
        ))}
      </tbody></table></div>
      {d?.creators.length === 0 && <p className="muted">{L('Hamkor topilmadi. Xodimlar bo‘limida «hamkor» rolini bering.')}</p>}
    </>
  );
}
function ProfileForm({ c, save }: { c: Creator; save: (b: Record<string, unknown>) => void }) {
  const [f, setF] = useState({ country: c.country ?? '', platforms: c.platforms ?? '', social: '', note: c.note ?? '', locale: c.locale ?? '' });
  return (
    <div className="row">
      <input className="input" value={f.country} placeholder={L('Davlat')} onChange={(e) => setF({ ...f, country: e.target.value })} />
      <input className="input" value={f.platforms} placeholder={L('Platformalar')} onChange={(e) => setF({ ...f, platforms: e.target.value })} />
      <input className="input" value={f.social} placeholder={L('Ijtimoiy username/linklar (bo‘sh — o‘zgarmaydi)')} onChange={(e) => setF({ ...f, social: e.target.value })} />
      <select value={f.locale} onChange={(e) => setF({ ...f, locale: e.target.value })} aria-label={L('Til')}><option value="">—</option>{['uz', 'en', 'ru', 'tg', 'ky', 'kk'].map((l) => <option key={l} value={l}>{l}</option>)}</select>
      <input className="input" value={f.note} placeholder={L('Admin izohi')} onChange={(e) => setF({ ...f, note: e.target.value })} />
      <button className="btn primary sm" onClick={() => save({ country: f.country, platforms: f.platforms, ...(f.social ? { social: f.social } : {}), note: f.note, locale: f.locale })}>{L('Saqlash')}</button>
    </div>
  );
}

function Campaigns({ run }: { run: Run }) {
  const [list, setList] = useState<Camp[]>([]); const [f, setF] = useState({ name: '', brief: '', rules: '', requiresVideo: false, endsAt: '' });
  const [rw, setRw] = useState({ id: 0, pct: '', budget: '', cap: '', confirm: false });
  const load = useCallback(() => void run(async () => setList((await call<{ campaigns: Camp[] }>('/api/creatoradmin/campaigns')).campaigns)), [run]);
  useEffect(load, [load]);
  return (
    <>
      <div className="row" style={{ margin: '10px 0' }}>
        <input className="input" value={f.name} placeholder={L('Kampaniya nomi')} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" value={f.brief} placeholder={L('Kreativ brief')} onChange={(e) => setF({ ...f, brief: e.target.value })} />
        <input className="input" value={f.rules} placeholder={L('Post talablari')} onChange={(e) => setF({ ...f, rules: e.target.value })} />
        <input className="input" type="date" value={f.endsAt} onChange={(e) => setF({ ...f, endsAt: e.target.value })} aria-label={L('Tugash sanasi')} />
        <label className="evidence"><input type="checkbox" checked={f.requiresVideo} onChange={(e) => setF({ ...f, requiresVideo: e.target.checked })} /> {L('Video majburiy')}</label>
        <button className="btn primary sm" onClick={() => void run(async () => { await call('/api/creatoradmin/campaigns', { ...f, endsAt: f.endsAt || null }); setF({ name: '', brief: '', rules: '', requiresVideo: false, endsAt: '' }); load(); }, L('Kampaniya qoralama sifatida yaratildi'))}>{L('Yaratish')}</button>
      </div>
      <div className="table-scroll"><table className="data"><thead><tr><th>{L('Nomi')}</th><th>{L('Holat')}</th><th>{L('Mukofot')}</th><th /></tr></thead><tbody>
        {list.map((c) => <tr key={c.id}><td><b>{c.name}</b>{c.requiresVideo ? <small className="muted"> · {L('video majburiy')}</small> : null}</td>
          <td><select value={c.status} aria-label={L('Holat')} onChange={(e) => void run(async () => { await call(`/api/creatoradmin/campaigns/${c.id}`, { status: e.target.value }); load(); })}>{['draft', 'active', 'paused', 'ended'].map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
          <td>{c.rewardEnabled ? <>{L('yoqilgan')} · {c.budgetMinor !== null ? minorToSom(c.budgetMinor) : ''} <button className="linkbtn" onClick={() => void run(async () => { await call(`/api/creatoradmin/campaigns/${c.id}/reward`, { enable: false }); load(); })}>{L('o‘chirish')}</button></> : <>{L('o‘chiq')} <button className="linkbtn" onClick={() => setRw({ ...rw, id: c.id })}>{L('sozlash')}</button></>}</td><td /></tr>)}
      </tbody></table></div>
      {rw.id > 0 && (
        <div className="card"><b>{L('Kampaniya mukofotini yoqish')}</b>
          <p className="muted" style={{ fontSize: 13 }}>{L('Faqat egasi tasdiqlagan foiz va summalar bilan. Valyuta: so‘m (UZS). Summalar tiyinda (1 so‘m = 100 tiyin).')}</p>
          <div className="row">
            <input className="input" value={rw.pct} placeholder={L('Foiz (masalan 5)')} onChange={(e) => setRw({ ...rw, pct: e.target.value })} />
            <input className="input" value={rw.budget} placeholder={L('Byudjet (tiyin)')} onChange={(e) => setRw({ ...rw, budget: e.target.value })} />
            <input className="input" value={rw.cap} placeholder={L('Creator chegarasi (tiyin)')} onChange={(e) => setRw({ ...rw, cap: e.target.value })} />
            <label className="evidence"><input type="checkbox" checked={rw.confirm} onChange={(e) => setRw({ ...rw, confirm: e.target.checked })} /> {L('Egasi tasdiqlagan')}</label>
            <button className="btn primary sm" onClick={() => void run(async () => { await call(`/api/creatoradmin/campaigns/${rw.id}/reward`, { pct: Number(rw.pct), currency: 'UZS', budgetMinor: Number(rw.budget), capPerCreatorMinor: Number(rw.cap), confirmOwnerApproved: rw.confirm }); setRw({ id: 0, pct: '', budget: '', cap: '', confirm: false }); load(); }, L('Mukofot yoqildi'))}>{L('Yoqish')}</button>
          </div>
        </div>
      )}
    </>
  );
}

function Posts({ run }: { run: Run }) {
  const [list, setList] = useState<AdminPost[]>([]); const [status, setStatus] = useState('submitted');
  const [form, setForm] = useState<Record<number, { note: string; views: string; evidence: string }>>({});
  const load = useCallback(() => void run(async () => setList((await call<{ posts: AdminPost[] }>(`/api/creatoradmin/posts?status=${status}`)).posts)), [run, status]);
  useEffect(load, [load]);
  const st = POST_STATUS();
  return (
    <>
      <div className="row" style={{ margin: '10px 0' }}><select value={status} onChange={(e) => setStatus(e.target.value)} aria-label={L('Holat')}>{['submitted', 'needs_changes', 'approved', 'rejected'].map((s) => <option key={s} value={s}>{st[s]}</option>)}</select></div>
      {list.length === 0 && <p className="muted">{L('Postlar yo‘q.')}</p>}
      {list.map((p) => { const fm = form[p.id] ?? { note: '', views: '', evidence: '' }; const set = (x: Partial<typeof fm>) => setForm({ ...form, [p.id]: { ...fm, ...x } });
        const decide = (decision: string) => void run(async () => { await call(`/api/creatoradmin/posts/${p.id}/review`, { decision, note: fm.note, verifiedViews: fm.views === '' ? null : Number(fm.views), evidence: fm.evidence }); load(); }, L('Qaror saqlandi'));
        return (
          <div key={p.id} className="card" style={{ margin: '0 0 8px' }}>
            <b>{p.creator}</b> · {p.platform} · {p.lang} · {p.postedOn} · {st[p.status]}
            <p style={{ margin: '4px 0' }}>{p.url ? <a href={p.url} target="_blank" rel="noreferrer noopener">{p.url}</a> : '—'}</p>
            <p className="muted" style={{ margin: 0 }}>{p.caption}</p>
            <p className="evidence" style={{ margin: '4px 0' }}>{L('Creator yozgan ko‘rishlar: {0} (tasdiqlanmagan)', [p.claimedViews ?? '—'])}</p>
            {p.status === 'submitted' && (
              <div className="row">
                <input className="input" value={fm.note} placeholder={L('Izoh (rad/o‘zgartirishda majburiy)')} onChange={(e) => set({ note: e.target.value })} />
                <input className="input" type="number" min={0} value={fm.views} placeholder={L('Tasdiqlangan ko‘rishlar')} onChange={(e) => set({ views: e.target.value })} />
                <input className="input" value={fm.evidence} placeholder={L('Boshqa dalil (havola ochilmasa)')} onChange={(e) => set({ evidence: e.target.value })} />
                <button className="btn primary sm" onClick={() => decide('approved')}>{L('Tasdiqlash')}</button><button className="btn sm" onClick={() => decide('needs_changes')}>{L('O‘zgartirish so‘rash')}</button><button className="btn sm" onClick={() => decide('rejected')}>{L('Rad etish')}</button>
              </div>)}
          </div>); })}
    </>
  );
}

function Flags({ run }: { run: Run }) {
  const [list, setList] = useState<Flag[]>([]);
  const load = useCallback(() => void run(async () => setList((await call<{ flags: Flag[] }>('/api/creatoradmin/flags')).flags)), [run]);
  useEffect(load, [load]);
  const KIND = (): Record<string, string> => ({ burst_clicks: L('Klik portlashi'), same_device_signups: L('Bir qurilmadan ko‘p hisob'), self_referral: L('O‘z-o‘zini taklif qilish gumoni'), click_reuse: L('Bitta click bilan ko‘p hisob') });
  return (
    <>
      <p className="muted" style={{ fontSize: 13 }}>{L('Bular faqat belgilar: hisoblar bloklanmaydi. Gumonli hamkorning mukofoti admin ko‘rib chiqmaguncha tasdiqlanmaydi.')}</p>
      {list.length === 0 && <p className="muted">{L('Ochiq belgi yo‘q.')}</p>}
      <ul>{list.map((f) => <li key={f.id}><b>{f.creator}</b> — {KIND()[f.kind] ?? f.kind}{(() => { try { const n = (JSON.parse(f.detail ?? '{}') as { n?: number }).n; return n ? ` (${n})` : ''; } catch { return ''; } })()} <button className="btn sm" onClick={() => void run(async () => { await call(`/api/creatoradmin/flags/${f.id}/resolve`, {}); load(); })}>{L('Ko‘rib chiqildi')}</button></li>)}</ul>
    </>
  );
}

function Ledger({ run }: { run: Run }) {
  const [d, setD] = useState<{ entries: LedgerRow[]; balances: { pending: number; approved: number; paid: number } } | null>(null);
  const [prog, setProg] = useState<Program | null>(null);
  const [pf, setPf] = useState({ pct: '', budget: '', cap: '', days: '', confirm: false });
  const [refund, setRefund] = useState({ paymentId: '', amount: '', note: '' });
  const load = useCallback(() => void run(async () => { setD(await call('/api/creatoradmin/ledger')); setProg((await call<{ program: Program }>('/api/creatoradmin/program')).program); }), [run]);
  useEffect(load, [load]);
  const st = LEDGER_STATUS();
  return (
    <>
      <div className="card">
        <b>{L('Komissiya dasturi')}: {prog?.commissionEnabled ? L('yoqilgan') : L('o‘chiq')}</b>
        <p className="muted" style={{ fontSize: 13 }}>{L('Standart — o‘chiq. Yoqish uchun foiz, creator chegarasi va umumiy byudjet kerak (tiyinda). Hech narsa avtomatik to‘lanmaydi: «to‘langan» faqat qo‘lda belgilanadi.')} {prog && L('Hozir: foiz {0}, chegara {1}, byudjet {2}, muddat {3} kun, kredit: {4}.', [prog.commissionPct ?? '—', prog.capPerCreatorMinor ?? '—', prog.globalBudgetMinor ?? '—', prog.windowDays, prog.attribution])}</p>
        <div className="row">
          <input className="input" value={pf.pct} placeholder={L('Foiz')} onChange={(e) => setPf({ ...pf, pct: e.target.value })} />
          <input className="input" value={pf.cap} placeholder={L('Creator chegarasi (tiyin)')} onChange={(e) => setPf({ ...pf, cap: e.target.value })} />
          <input className="input" value={pf.budget} placeholder={L('Umumiy byudjet (tiyin)')} onChange={(e) => setPf({ ...pf, budget: e.target.value })} />
          <input className="input" value={pf.days} placeholder={L('Muddat (kun)')} onChange={(e) => setPf({ ...pf, days: e.target.value })} />
          <label className="evidence"><input type="checkbox" checked={pf.confirm} onChange={(e) => setPf({ ...pf, confirm: e.target.checked })} /> {L('Egasi tasdiqlagan')}</label>
          <button className="btn sm" onClick={() => void run(async () => { await call('/api/creatoradmin/program', { ...(pf.pct ? { commissionPct: Number(pf.pct) } : {}), ...(pf.cap ? { capPerCreatorMinor: Number(pf.cap) } : {}), ...(pf.budget ? { globalBudgetMinor: Number(pf.budget) } : {}), ...(pf.days ? { windowDays: Number(pf.days) } : {}) }); load(); }, L('Saqlandi'))}>{L('Saqlash')}</button>
          <button className="btn primary sm" onClick={() => void run(async () => { await call('/api/creatoradmin/program', { commissionEnabled: true, confirmOwnerApproved: pf.confirm }); load(); }, L('Komissiya yoqildi'))}>{L('Yoqish')}</button>
          <button className="btn sm" onClick={() => void run(async () => { await call('/api/creatoradmin/program', { commissionEnabled: false }); load(); }, L('Komissiya o‘chirildi'))}>{L('O‘chirish')}</button>
          <button className="btn sm" onClick={() => void run(async () => { const r = await call<{ created: number; disabled: boolean }>('/api/creatoradmin/accrue', {}); load(); alert(r.disabled ? L('Dastur o‘chiq') : L('Yangi yozuvlar: {0}', [r.created])); })}>{L('Hisoblash')}</button>
        </div>
      </div>
      <div className="card"><b>{L('Qaytarilgan to‘lovni qayd etish')}</b>
        <div className="row"><input className="input" value={refund.paymentId} placeholder={L('To‘lov identifikatori')} onChange={(e) => setRefund({ ...refund, paymentId: e.target.value })} /><input className="input" value={refund.amount} placeholder={L('Summa (tiyin; bo‘sh — to‘liq)')} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} /><input className="input" value={refund.note} placeholder={L('Izoh')} onChange={(e) => setRefund({ ...refund, note: e.target.value })} />
          <button className="btn sm" onClick={() => void run(async () => { await call('/api/creatoradmin/refund', { paymentId: refund.paymentId, amountMinor: refund.amount ? Number(refund.amount) : undefined, note: refund.note }); setRefund({ paymentId: '', amount: '', note: '' }); load(); }, L('Qaytarish qayd etildi'))}>{L('Qayd etish')}</button></div></div>
      {d && <div className="kpis three"><div className="kpi2"><span>{L('Kutilmoqda')}</span><b>{minorToSom(d.balances.pending)}</b></div><div className="kpi2"><span>{L('Tasdiqlangan')}</span><b>{minorToSom(d.balances.approved)}</b></div><div className="kpi2"><span>{L('To‘langan')}</span><b>{minorToSom(d.balances.paid)}</b></div></div>}
      <div className="table-scroll"><table className="data"><thead><tr><th>{L('Sana')}</th><th>{L('Laqab')}</th><th>{L('Turi')}</th><th>{L('Summa')}</th><th>{L('Holat')}</th><th /></tr></thead><tbody>
        {d?.entries.map((e) => <tr key={e.id}><td>{new Date(e.createdAt).toLocaleDateString()}</td><td>{e.creator}</td><td>{e.kind}{e.basis?.capped ? <small className="muted"> · {L('chegara')}</small> : null}</td><td>{minorToSom(e.amountMinor)}</td><td>{st[e.status] ?? e.status}</td>
          <td>{e.status === 'pending' && e.kind !== 'reversal' && <><button className="btn sm" onClick={() => void run(async () => { await call(`/api/creatoradmin/ledger/${e.id}/decision`, { decision: 'approved' }); load(); })}>{L('Tasdiqlash')}</button> <button className="btn sm" onClick={() => { const note = prompt(L('Rad etish sababi')) ?? ''; void run(async () => { await call(`/api/creatoradmin/ledger/${e.id}/decision`, { decision: 'rejected', note }); load(); }); }}>{L('Rad etish')}</button></>}
            {e.status === 'approved' && e.kind !== 'reversal' && e.amountMinor > 0 && <button className="btn sm" onClick={() => { const ref = prompt(L('To‘lov havolasi/izohi (tashqarida bajarilgan o‘tkazma)')) ?? ''; void run(async () => { await call(`/api/creatoradmin/ledger/${e.id}/paid`, { ref }); load(); }); }}>{L('To‘langan deb belgilash')}</button>}</td></tr>)}
      </tbody></table></div>
    </>
  );
}
