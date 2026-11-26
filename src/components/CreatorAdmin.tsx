// Admin → Hamkorlar (Creator CRM): hamkorlar ro'yxati va statusi, kampaniyalar, post tasdiqlash, firibgarlik belgilari, mukofot daftari va CSV.
// Faqat agregat ko'rsatkichlar: o'quvchilarning shaxsiy ma'lumoti bu ekranda ham, CSV'da ham yo'q.
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { LEDGER_KIND, LEDGER_STATUS, POST_STATUS, RULE_KIND } from './CreatorPosts';
import { L } from '../i18n';

async function call<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, { method: body === undefined ? 'GET' : 'POST', headers: { 'x-token': getAccount()?.token ?? '', ...(body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({})) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}
interface Fun { uniqueClicks: number; signups: number; activated: number; d7: { active: number }; paid: number; netRevenue: number; refundedSum: number; rates: { clickToSignup: number | null; signupToActivation: number | null; activationToPaid: number | null; refundRate: number | null } }
interface Creator { id: number; nickname: string; status: string; locale: string | null; country: string | null; platforms: string | null; note: string | null; links: number; funnel: Fun; openFlags: number; posts: Record<string, number> }
interface Camp { id: number; name: string; brief: string; status: string; requiresVideo: boolean; endsAt: number | null }
interface Rule { id: number; name: string; kind: string; campaignId: number | null; pct: number | null; amountMinor: number | null; holdDays: number; windowDays: number; capPerCreatorMinor: number | null; budgetMinor: number | null; capPerItemMinor: number | null; startsAt: number | null; endsAt: number | null; enabled: boolean; spentMinor: number; remainingMinor: number | null }
interface Cost { creatorId: number; nickname: string; pending: number; approved: number; paid: number; total: number }
interface Kpis { funnel: Fun & { clicks: number }; rewardCostMinor: number; cacPerActivatedMinor: number | null; cacPerPayerMinor: number | null }
interface LedgerRow { id: number; creator?: string; kind: string; amountMinor: number; status: string; createdAt: number; paymentId?: string | null; note: string | null; basis: { pct?: number; capped?: boolean } | null }
interface AdminPost { id: number; creator?: string; platform: string; url: string | null; lang: string | null; postedOn: string | null; caption: string | null; claimedViews: number | null; status: string }
interface Flag { id: number; creator: string; kind: string; detail: string | null; ts: number }
const STATUSES = ['invited', 'applied', 'approved', 'paused', 'rejected'];
const pct = (x: number | null): string => (x === null ? '—' : `${x}%`);
const minorToSom = (m: number): string => fmtSum(Math.round(m / 100));

export function CreatorAdmin() {
  const [sec, setSec] = useState<'apps' | 'creators' | 'campaigns' | 'posts' | 'videos' | 'flags' | 'ledger'>('apps');
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  // useCallback: bo'limlar `run`ni yuklash effektiga bog'laydi — har renderda yangi funksiya cheksiz qayta yuklashga olib kelardi
  const run = useCallback(async (fn: () => Promise<unknown>, ok?: string) => { setErr(''); setMsg(''); try { await fn(); if (ok) setMsg(ok); } catch (e) { setErr((e as Error).message); } }, []);
  return (
    <div>
      <div className="seg" role="tablist" aria-label={L('Hamkorlar bo‘limlari')}>
        {([['apps', L('Arizalar')], ['creators', L('Hamkorlar')], ['campaigns', L('Kampaniyalar')], ['posts', L('Postlar')], ['videos', L('Video to‘lovlari')], ['flags', L('Gumonli holatlar')], ['ledger', L('Mukofot daftari')]] as const).map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={sec === k} className={sec === k ? 'on' : ''} onClick={() => setSec(k)}>{l}</button>)}
      </div>
      {err && <p className="notice" role="alert">{err}</p>}{msg && <p className="evidence" role="status">{msg}</p>}
      {sec === 'apps' ? <Applications run={run} /> : sec === 'creators' ? <Creators run={run} /> : sec === 'campaigns' ? <Campaigns run={run} /> : sec === 'posts' ? <Posts run={run} /> : sec === 'videos' ? <VideoPay run={run} /> : sec === 'flags' ? <Flags run={run} /> : <Ledger run={run} />}
    </div>
  );
}
type Run = (fn: () => Promise<unknown>, ok?: string) => Promise<void>;

function Creators({ run }: { run: Run }) {
  const [d, setD] = useState<{ creators: Creator[]; kpis: Kpis } | null>(null);
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
  const load = useCallback(() => void run(async () => setList((await call<{ campaigns: Camp[] }>('/api/creatoradmin/campaigns')).campaigns)), [run]);
  useEffect(load, [load]);
  return (
    <>
      <p className="muted" style={{ fontSize: 13 }}>{L('Kampaniya — brief va talablar. Mukofot kampaniyada emas, «Mukofot daftari» bo‘limidagi qoidalarda belgilanadi.')}</p>
      <div className="row" style={{ margin: '10px 0' }}>
        <input className="input" value={f.name} placeholder={L('Kampaniya nomi')} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <input className="input" value={f.brief} placeholder={L('Kreativ brief')} onChange={(e) => setF({ ...f, brief: e.target.value })} />
        <input className="input" value={f.rules} placeholder={L('Post talablari')} onChange={(e) => setF({ ...f, rules: e.target.value })} />
        <input className="input" type="date" value={f.endsAt} onChange={(e) => setF({ ...f, endsAt: e.target.value })} aria-label={L('Tugash sanasi')} />
        <label className="evidence"><input type="checkbox" checked={f.requiresVideo} onChange={(e) => setF({ ...f, requiresVideo: e.target.checked })} /> {L('Video majburiy')}</label>
        <button className="btn primary sm" onClick={() => void run(async () => { await call('/api/creatoradmin/campaigns', { ...f, endsAt: f.endsAt || null }); setF({ name: '', brief: '', rules: '', requiresVideo: false, endsAt: '' }); load(); }, L('Kampaniya qoralama sifatida yaratildi'))}>{L('Yaratish')}</button>
      </div>
      <div className="table-scroll"><table className="data"><thead><tr><th>{L('Nomi')}</th><th>{L('Holat')}</th></tr></thead><tbody>
        {list.map((c) => <tr key={c.id}><td><b>{c.name}</b>{c.requiresVideo ? <small className="muted"> · {L('video majburiy')}</small> : null}</td>
          <td><select value={c.status} aria-label={L('Holat')} onChange={(e) => void run(async () => { await call(`/api/creatoradmin/campaigns/${c.id}`, { status: e.target.value }); load(); })}>{['draft', 'active', 'paused', 'ended'].map((st) => <option key={st} value={st}>{st}</option>)}</select></td></tr>)}
      </tbody></table></div>
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

interface Tier { min: number; som: number }
interface VTerms { enabled: boolean; baseSom: number; windowDays: number; viewTiers: Tier[]; learnerTiers: Tier[]; instagram: string; updatedAt: number | null }
interface VCalc { baseSom: number; views: number; viewBonusSom: number; learners: number; learnerBonusSom: number; totalSom: number }
interface VItem { postId: number; creator?: string; platform: string; url: string | null; postedOn: string | null; dueAt: number | null; due: boolean; learners: number; claimedViews: number | null; entry: { id: number; amountMinor: number; status: string; basis: VCalc | null } | null }
const bonus = (t: Tier[], n: number): number => t.reduce((s, x) => (n >= x.min ? x.som : s), 0);
const day = (t: number | null): string => (t === null ? '—' : new Date(t).toISOString().slice(0, 10));

/** Video uchun to'lov: shartlarni tahrirlash, tasdiqlangan videolar navbati va 15-kun hisob-kitobi (admin tekshiradi → tasdiqlaydi → to'landi). */
function VideoPay({ run }: { run: Run }) {
  const [d, setD] = useState<{ terms: VTerms; videos: VItem[] } | null>(null);
  const [t, setT] = useState<VTerms | null>(null);
  const [form, setForm] = useState<Record<number, { views: string; base: string; bio: boolean; comment: boolean; tag: boolean; note: string; ref: string }>>({});
  const load = useCallback(() => void run(async () => { const r = await call<{ terms: VTerms; videos: VItem[] }>('/api/creatoradmin/videos'); setD(r); setT(r.terms); }), [run]);
  useEffect(load, [load]);
  if (!d || !t) return <p className="muted">{L('Yuklanmoqda…')}</p>;
  const saveTerms = () => void run(async () => { const r = await call<{ terms: VTerms }>('/api/creatoradmin/video-terms', t); setT(r.terms); load(); }, L('Shartlar saqlandi'));
  const tierRows = (k: 'viewTiers' | 'learnerTiers', unit: string) => (
    <div>
      {t[k].map((x, i) => (
        <div className="row" key={i}>
          <input className="input" type="number" min={1} value={x.min} aria-label={L('Norma ({0})', [unit])} onChange={(e) => setT({ ...t, [k]: t[k].map((y, j) => (j === i ? { ...y, min: Number(e.target.value) } : y)) })} />
          <input className="input" type="number" min={1} value={x.som} aria-label={L('Bonus (so‘m)')} onChange={(e) => setT({ ...t, [k]: t[k].map((y, j) => (j === i ? { ...y, som: Number(e.target.value) } : y)) })} />
          <button className="btn sm" type="button" onClick={() => setT({ ...t, [k]: t[k].filter((_, j) => j !== i) })}>{L('O‘chirish')}</button>
        </div>))}
      {t[k].length < 6 && <button className="btn sm" type="button" onClick={() => setT({ ...t, [k]: [...t[k], { min: 1, som: 1 }] })}>{L('Pog‘ona qo‘shish')}</button>}
    </div>
  );
  return (
    <>
      <section className="card" style={{ margin: '10px 0' }}>
        <h3 style={{ marginTop: 0 }}>{L('Shartlar')}</h3>
        <label className="evidence" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={t.enabled} onChange={(e) => setT({ ...t, enabled: e.target.checked })} /> {L('Dastur yoqilgan (hamkorlik sahifasida ko‘rinadi)')}</label>
        <div className="row">
          <label>{L('Asosiy to‘lov (so‘m)')}<input className="input" type="number" min={0} value={t.baseSom} onChange={(e) => setT({ ...t, baseSom: Number(e.target.value) })} /></label>
          <label>{L('Hisoblash muddati (kun)')}<input className="input" type="number" min={1} max={90} value={t.windowDays} onChange={(e) => setT({ ...t, windowDays: Number(e.target.value) })} /></label>
          <label>{L('Instagram sahifamiz')}<input className="input" value={t.instagram} placeholder={'sellzen.uz'} onChange={(e) => setT({ ...t, instagram: e.target.value })} /></label>
        </div>
        <h4 className="list-h">{L('Ko‘rishlar bonusi: norma (ko‘rish) → bonus (so‘m)')}</h4>{tierRows('viewTiers', L('ko‘rish'))}
        <h4 className="list-h">{L('O‘quvchilar bonusi: norma (o‘quvchi) → bonus (so‘m)')}</h4>{tierRows('learnerTiers', L('o‘quvchi'))}
        <p className="muted" style={{ fontSize: 13 }}>{L('Eng yuqori erishilgan pog‘ona to‘lanadi. O‘zgarish faqat keyingi hisob-kitoblarga ta’sir qiladi.')}</p>
        <button className="btn primary sm" onClick={saveTerms}>{L('Shartlarni saqlash')}</button>
      </section>
      <h3>{L('Tasdiqlangan videolar')}</h3>
      {d.videos.length === 0 && <p className="muted">{L('Tasdiqlangan video yo‘q. Avval Postlar bo‘limida videoni tasdiqlang.')}</p>}
      {d.videos.map((v) => {
        const fm = form[v.postId] ?? { views: '', base: '', bio: false, comment: false, tag: false, note: '', ref: '' };
        const set = (x: Partial<typeof fm>) => setForm({ ...form, [v.postId]: { ...fm, ...x } });
        const views = Number(fm.views) || 0, base = fm.base === '' ? d.terms.baseSom : Number(fm.base);
        const vb = bonus(d.terms.viewTiers, views), lb = bonus(d.terms.learnerTiers, v.learners);
        const settle = () => void run(async () => { await call(`/api/creatoradmin/videos/${v.postId}/settle`, { views: fm.views === '' ? null : Number(fm.views), baseSom: fm.base === '' ? null : Number(fm.base), bio: fm.bio, comment: fm.comment, tag: fm.tag, note: fm.note }); load(); }, L('Hisoblandi — endi tasdiqlang'));
        const decide = (decision: string) => void run(async () => { await call(`/api/creatoradmin/ledger/${v.entry!.id}/decision`, { decision, note: fm.note }); load(); }, L('Qaror saqlandi'));
        const paid = () => void run(async () => { await call(`/api/creatoradmin/ledger/${v.entry!.id}/paid`, { ref: fm.ref }); load(); }, L('To‘langan deb belgilandi'));
        const b = v.entry?.basis;
        return (
          <div key={v.postId} className="card" style={{ margin: '0 0 8px' }}>
            <b>{v.creator}</b> · {v.platform} · {L('joylangan: {0}', [v.postedOn ?? '—'])} · {L('hisob kuni: {0}', [day(v.dueAt)])}
            <p style={{ margin: '4px 0' }}>{v.url ? <a href={v.url} target="_blank" rel="noreferrer noopener">{v.url}</a> : '—'}</p>
            <p className="evidence" style={{ margin: '4px 0' }}>{L('Shu video havolasi orqali kelgan o‘quvchilar: {0}', [v.learners])} · {L('Bloger yozgan ko‘rishlar: {0}', [v.claimedViews ?? '—'])}</p>
            {v.entry && b ? (
              <>
                <p style={{ margin: '4px 0' }}>{L('Asosiy {0} + ko‘rishlar ({1}) {2} + o‘quvchilar ({3}) {4} = {5} so‘m', [fmtSum(b.baseSom), fmtSum(b.views), fmtSum(b.viewBonusSom), b.learners, fmtSum(b.learnerBonusSom), fmtSum(b.totalSom)])} · <b>{LEDGER_STATUS()[v.entry.status] ?? v.entry.status}</b></p>
                {v.entry.status === 'pending' && <div className="row"><input className="input" value={fm.note} placeholder={L('Izoh (rad etishda majburiy)')} onChange={(e) => set({ note: e.target.value })} /><button className="btn primary sm" onClick={() => decide('approved')}>{L('Tasdiqlash')}</button><button className="btn sm" onClick={() => decide('rejected')}>{L('Rad etish')}</button></div>}
                {v.entry.status === 'approved' && <div className="row"><input className="input" value={fm.ref} placeholder={L('To‘lov havolasi yoki izohi')} onChange={(e) => set({ ref: e.target.value })} /><button className="btn primary sm" onClick={paid}>{L('To‘landi')}</button></div>}
              </>
            ) : !v.due ? (
              <p className="muted" style={{ margin: 0 }}>{L('Hisob {0} kuni ochiladi.', [day(v.dueAt)])}</p>
            ) : (
              <>
                <div className="row">
                  <input className="input" type="number" min={0} value={fm.views} placeholder={L('{0}-kundagi ko‘rishlar', [d.terms.windowDays])} onChange={(e) => set({ views: e.target.value })} />
                  <input className="input" type="number" min={d.terms.baseSom} value={fm.base} placeholder={L('Asosiy: {0}', [fmtSum(d.terms.baseSom)])} onChange={(e) => set({ base: e.target.value })} />
                  <input className="input" value={fm.note} placeholder={L('Izoh (ixtiyoriy)')} onChange={(e) => set({ note: e.target.value })} />
                </div>
                <div className="row">
                  <label className="evidence"><input type="checkbox" checked={fm.bio} onChange={(e) => set({ bio: e.target.checked })} /> {L('Havola bio’da bor')}</label>
                  <label className="evidence"><input type="checkbox" checked={fm.comment} onChange={(e) => set({ comment: e.target.checked })} /> {L('Havola izohda bor')}</label>
                  <label className="evidence"><input type="checkbox" checked={fm.tag} onChange={(e) => set({ tag: e.target.checked })} /> {L('Instagram sahifamiz belgilangan')}</label>
                </div>
                <p style={{ margin: '4px 0' }}>{L('Hisob: {0} + {1} + {2} = {3} so‘m', [fmtSum(base), fmtSum(vb), fmtSum(lb), fmtSum(base + vb + lb)])}</p>
                <button className="btn primary sm" disabled={fm.views === '' || !fm.bio || !fm.comment || !fm.tag} onClick={settle}>{L('Hisoblash')}</button>
              </>
            )}
          </div>);
      })}
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

const RULE_HELP = (): Record<string, string> => ({
  paid_pct: L('Hamkor orqali kelgan o‘quvchi to‘lov qilganda — to‘lov summasining foizi. Pul qaytarilsa, mukofot ham qaytariladi.'),
  activated_flat: L('Hamkor orqali kelib, mazmunli faollik (dars yoki mock) qilgan har bir o‘quvchi uchun belgilangan summa. Faqat ro‘yxatdan o‘tgani uchun mukofot yo‘q.'),
  first_paid_flat: L('Hamkor orqali kelgan o‘quvchi birinchi marta to‘lov qilganda belgilangan summa.'),
  verified_views_per_1k: L('Siz tasdiqlagan har 1000 ko‘rish uchun belgilangan summa (har bir post uchun chegara bilan). Hamkorning o‘zi yozgan ko‘rishlar hisobga olinmaydi.'),
});
const ymd = (ts: number | null): string => (ts === null ? '' : new Date(ts).toISOString().slice(0, 10));
function terms(r: Rule): string {
  const v = r.kind === 'paid_pct' ? `${r.pct}%` : r.amountMinor === null ? '—' : minorToSom(r.amountMinor);
  const extra = [r.capPerCreatorMinor !== null ? L('hamkorga ≤ {0}', [minorToSom(r.capPerCreatorMinor)]) : '', r.capPerItemMinor !== null ? L('postga ≤ {0}', [minorToSom(r.capPerItemMinor)]) : '', r.startsAt || r.endsAt ? `${ymd(r.startsAt) || '…'} → ${ymd(r.endsAt) || '…'}` : ''].filter(Boolean).join(' · ');
  return `${RULE_KIND()[r.kind] ?? r.kind}: ${v} · ${L('kutish {0} kun', [r.holdDays])} · ${L('muddat {0} kun', [r.windowDays])}${extra ? ` · ${extra}` : ''}`;
}
function Ledger({ run }: { run: Run }) {
  const [d, setD] = useState<{ entries: LedgerRow[]; balances: { pending: number; approved: number; paid: number }; rules: Rule[]; attribution?: 'first' | 'last' } | null>(null);
  const [costs, setCosts] = useState<Cost[]>([]); const [camps, setCamps] = useState<Camp[]>([]);
  const blank = { name: '', kind: 'activated_flat', pct: '', amount: '', hold: '7', window: '180', cap: '', budget: '', item: '', campaignId: '', starts: '', ends: '' };
  const [rf, setRf] = useState(blank); const [editId, setEditId] = useState<number | null>(null); const [confirm, setConfirm] = useState(false);
  const [refund, setRefund] = useState({ paymentId: '', amount: '', note: '' }); const [man, setMan] = useState({ nickname: '', amount: '', note: '', ruleId: '' });
  const load = useCallback(() => void run(async () => { setD(await call('/api/creatoradmin/ledger')); setCosts((await call<{ costs: Cost[] }>('/api/creatoradmin/costs')).costs); setCamps((await call<{ campaigns: Camp[] }>('/api/creatoradmin/campaigns')).campaigns); }), [run]);
  useEffect(load, [load]);
  const [rules, setRules] = useState<Rule[]>([]);
  const loadRules = useCallback(() => void run(async () => setRules((await call<{ rules: Rule[] }>('/api/creatoradmin/rules')).rules)), [run]);
  useEffect(loadRules, [loadRules]);
  const st = LEDGER_STATUS(); const kinds = LEDGER_KIND();
  // Summalar so'mda kiritiladi (tizim tiyinda saqlaydi); bo'sh — chegara/qiymat yo'q
  const som = (x: string): number | null => (x.trim() === '' ? null : Math.round(Number(x.replace(/\s/g, '')) * 100));
  const fromMinor = (m: number | null): string => (m === null ? '' : String(m / 100));
  const body = () => ({ name: rf.name, pct: rf.kind === 'paid_pct' && rf.pct.trim() !== '' ? Number(rf.pct) : undefined, amountMinor: rf.kind === 'paid_pct' ? undefined : som(rf.amount), holdDays: Number(rf.hold), windowDays: Number(rf.window), capPerCreatorMinor: som(rf.cap), budgetMinor: som(rf.budget), capPerItemMinor: rf.kind === 'verified_views_per_1k' ? som(rf.item) : null, campaignId: rf.campaignId === '' ? null : Number(rf.campaignId), startsAt: rf.starts || null, endsAt: rf.ends || null });
  const save = () => void run(async () => {
    if (editId === null) await call('/api/creatoradmin/rules', { kind: rf.kind, ...body() }); else await call(`/api/creatoradmin/rules/${editId}`, body());
    setRf(blank); setEditId(null); loadRules();
  }, editId === null ? L('Qoida qoralama (o‘chiq) sifatida yaratildi') : L('Qoida yangilandi — yoqish uchun «Yoqish» tugmasini bosing'));
  const startEdit = (r: Rule) => { setEditId(r.id); setRf({ name: r.name, kind: r.kind, pct: r.pct === null ? '' : String(r.pct), amount: fromMinor(r.amountMinor), hold: String(r.holdDays), window: String(r.windowDays), cap: fromMinor(r.capPerCreatorMinor), budget: fromMinor(r.budgetMinor), item: fromMinor(r.capPerItemMinor), campaignId: r.campaignId === null ? '' : String(r.campaignId), starts: ymd(r.startsAt), ends: ymd(r.endsAt) }); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); };
  return (
    <>
      <div className="card">
        <b>{L('Mukofot qoidalari')}</b>
        <p className="muted" style={{ fontSize: 13 }}>{L('Mukofot turi, summasi va shartlari to‘liq shu yerda sozlanadi — kod o‘zgarmaydi. Ro‘yxatdan o‘tganlik va tasdiqlanmagan ko‘rishlar uchun mukofot yo‘q. Qoida avval o‘chiq (qoralama) bo‘ladi; yoqish uchun summa/foiz, hamkor chegarasi va umumiy byudjet kerak. Summalar so‘mda kiritiladi.')}</p>
        <ol className="muted" style={{ fontSize: 13, margin: '0 0 10px 18px', padding: 0 }}>
          <li>{L('Qoida yarating va shartlarini kiriting.')}</li>
          <li>{L('«Egasi tasdiqlagan» ni belgilab, «Yoqish» ni bosing.')}</li>
          <li>{L('Mukofotlar «Kutilmoqda» bo‘lib hisoblanadi (har 6 soatda yoki «Hozir hisoblash»); kutish muddatidan keyin «Tasdiqlash», tashqarida to‘lab «To‘langan deb belgilash» ni bosing.')}</li>
          <li>{L('Shartlarni o‘zgartirish: qoidani o‘chiring → «Tahrirlash» → saqlang → qayta yoqing. Eski yozuvlar o‘zgarmaydi.')}</li>
        </ol>
        <p className="muted" style={{ fontSize: 13 }}><b>{L('Hamkor krediti')}:</b> {d?.attribution === 'first' ? L('birinchi bosilgan havola') : L('oxirgi bosilgan havola')} — {L('o‘zgartirish: «Limitlar» → «Creator (hamkor) dasturi». Faqat yangi hisob-kitoblarga ta’sir qiladi.')}</p>
        <div className="table-scroll"><table className="data"><thead><tr><th>{L('Qoida')}</th><th>{L('Shartlar')}</th><th>{L('Sarflandi / byudjet')}</th><th /></tr></thead><tbody>
          {rules.map((r) => <tr key={r.id}><td><b>{r.name}</b><small className="muted"> · {r.campaignId === null ? L('kampaniyasiz') : camps.find((c) => c.id === r.campaignId)?.name ?? r.campaignId}</small>{r.enabled && <small className="muted"> · {L('yoqilgan')}</small>}</td><td>{terms(r)}</td>
            <td>{minorToSom(r.spentMinor)} / {r.budgetMinor === null ? '—' : minorToSom(r.budgetMinor)}</td>
            <td>{r.enabled ? <button className="btn sm" onClick={() => void run(async () => { await call(`/api/creatoradmin/rules/${r.id}/disable`, {}); loadRules(); load(); }, L('Qoida o‘chirildi'))}>{L('O‘chirish')}</button>
              : <><button className="btn sm" onClick={() => startEdit(r)}>{L('Tahrirlash')}</button> <button className="btn primary sm" onClick={() => void run(async () => { await call(`/api/creatoradmin/rules/${r.id}/enable`, { confirmOwnerApproved: confirm }); loadRules(); load(); }, L('Qoida yoqildi'))}>{L('Yoqish')}</button></>}</td></tr>)}
        </tbody></table></div>
        {rules.length === 0 && <p className="muted">{L('Hali qoida yo‘q. Quyida birinchi qoidani yarating.')}</p>}
        <label className="evidence"><input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} /> {L('Egasi tasdiqlagan (yoqish uchun belgilang)')}</label>
        <h4 className="list-h">{editId === null ? L('Yangi qoida') : L('Qoidani tahrirlash')}</h4>
        <p className="muted" style={{ fontSize: 13 }}>{RULE_HELP()[rf.kind]}</p>
        <div className="row">
          <input className="input" value={rf.name} placeholder={L('Qoida nomi')} aria-label={L('Qoida nomi')} onChange={(e) => setRf({ ...rf, name: e.target.value })} />
          <select value={rf.kind} disabled={editId !== null} onChange={(e) => setRf({ ...rf, kind: e.target.value })} aria-label={L('Mukofot turi')}>{Object.entries(RULE_KIND()).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          {rf.kind === 'paid_pct' ? <input className="input" inputMode="decimal" value={rf.pct} placeholder={L('Foiz, % (masalan 10)')} aria-label={L('Foiz, %')} onChange={(e) => setRf({ ...rf, pct: e.target.value })} /> : <input className="input" inputMode="numeric" value={rf.amount} placeholder={L('Summa, so‘m')} aria-label={L('Summa, so‘m')} onChange={(e) => setRf({ ...rf, amount: e.target.value })} />}
          <input className="input" inputMode="numeric" value={rf.hold} placeholder={L('Kutish, kun')} aria-label={L('Kutish, kun')} onChange={(e) => setRf({ ...rf, hold: e.target.value })} />
          <input className="input" inputMode="numeric" value={rf.window} placeholder={L('Muddat, kun')} aria-label={L('Muddat, kun')} onChange={(e) => setRf({ ...rf, window: e.target.value })} />
          <input className="input" inputMode="numeric" value={rf.cap} placeholder={L('Hamkor chegarasi, so‘m')} aria-label={L('Hamkor chegarasi, so‘m')} onChange={(e) => setRf({ ...rf, cap: e.target.value })} />
          <input className="input" inputMode="numeric" value={rf.budget} placeholder={L('Umumiy byudjet, so‘m')} aria-label={L('Umumiy byudjet, so‘m')} onChange={(e) => setRf({ ...rf, budget: e.target.value })} />
          {rf.kind === 'verified_views_per_1k' && <input className="input" inputMode="numeric" value={rf.item} placeholder={L('Post chegarasi, so‘m')} aria-label={L('Post chegarasi, so‘m')} onChange={(e) => setRf({ ...rf, item: e.target.value })} />}
          <label className="muted" style={{ fontSize: 13 }}>{L('Boshlanishi')} <input className="input" type="date" value={rf.starts} onChange={(e) => setRf({ ...rf, starts: e.target.value })} /></label>
          <label className="muted" style={{ fontSize: 13 }}>{L('Tugashi')} <input className="input" type="date" value={rf.ends} onChange={(e) => setRf({ ...rf, ends: e.target.value })} /></label>
          <select value={rf.campaignId} onChange={(e) => setRf({ ...rf, campaignId: e.target.value })} aria-label={L('Kampaniya')}><option value="">{L('Kampaniyasiz')}</option>{camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <button className="btn sm primary" onClick={save}>{editId === null ? L('Qoida yaratish') : L('Saqlash')}</button>
          {editId !== null && <button className="btn sm" onClick={() => { setEditId(null); setRf(blank); }}>{L('Bekor qilish')}</button>}
          <button className="btn sm" onClick={() => void run(async () => { const r = await call<{ created: number; disabled: boolean }>('/api/creatoradmin/accrue', {}); load(); alert(r.disabled ? L('Yoqilgan qoida yo‘q') : L('Yangi yozuvlar: {0}', [r.created])); })}>{L('Hozir hisoblash')}</button>
        </div>
      </div>
      {d && <div className="kpis"><div className="kpi2"><span>{L('Kutilmoqda')}</span><b>{minorToSom(d.balances.pending)}</b></div><div className="kpi2"><span>{L('Tasdiqlangan')}</span><b>{minorToSom(d.balances.approved)}</b></div><div className="kpi2"><span>{L('To‘langan')}</span><b>{minorToSom(d.balances.paid)}</b></div></div>}
      <div className="card"><b>{L('Creator boshiga xarajat')}</b>
        <div className="table-scroll"><table className="data"><thead><tr><th>{L('Laqab')}</th><th>{L('Kutilmoqda')}</th><th>{L('Tasdiqlangan')}</th><th>{L('To‘langan')}</th><th>{L('Jami')}</th></tr></thead><tbody>
          {costs.map((c) => <tr key={c.creatorId}><td>{c.nickname}</td><td>{minorToSom(c.pending)}</td><td>{minorToSom(c.approved)}</td><td>{minorToSom(c.paid)}</td><td><b>{minorToSom(c.total)}</b></td></tr>)}</tbody></table></div>
        {costs.length === 0 && <p className="muted">{L('Hali xarajat yo‘q.')}</p>}
      </div>
      <div className="card"><b>{L('Qo‘lda bonus / tuzatish kiritish')}</b>
        <p className="muted" style={{ fontSize: 13 }}>{L('Musbat summa — bonus, manfiy — tuzatish. Sabab majburiy; yozuv «kutilmoqda» bo‘ladi va umumiy tasdiqlash oqimidan o‘tadi.')}</p>
        <div className="row"><input className="input" value={man.nickname} placeholder={L('Hamkor laqabi')} onChange={(e) => setMan({ ...man, nickname: e.target.value })} /><input className="input" value={man.amount} placeholder={L('Summa (tiyin; manfiy — tuzatish)')} onChange={(e) => setMan({ ...man, amount: e.target.value })} /><input className="input" value={man.note} placeholder={L('Sabab')} onChange={(e) => setMan({ ...man, note: e.target.value })} />
          <select value={man.ruleId} onChange={(e) => setMan({ ...man, ruleId: e.target.value })} aria-label={L('Qoida')}><option value="">{L('Qoidasiz')}</option>{rules.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          <button className="btn sm" onClick={() => void run(async () => { await call('/api/creatoradmin/manual', { nickname: man.nickname, amountMinor: Number(man.amount), note: man.note, ruleId: man.ruleId || null }); setMan({ nickname: '', amount: '', note: '', ruleId: '' }); load(); loadRules(); }, L('Yozuv qo‘shildi'))}>{L('Qo‘shish')}</button></div></div>
      <div className="card"><b>{L('Qaytarilgan to‘lovni qayd etish')}</b>
        <div className="row"><input className="input" value={refund.paymentId} placeholder={L('To‘lov identifikatori')} onChange={(e) => setRefund({ ...refund, paymentId: e.target.value })} /><input className="input" value={refund.amount} placeholder={L('Summa (tiyin; bo‘sh — to‘liq)')} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} /><input className="input" value={refund.note} placeholder={L('Izoh')} onChange={(e) => setRefund({ ...refund, note: e.target.value })} />
          <button className="btn sm" onClick={() => void run(async () => { await call('/api/creatoradmin/refund', { paymentId: refund.paymentId, amountMinor: refund.amount ? Number(refund.amount) : undefined, note: refund.note }); setRefund({ paymentId: '', amount: '', note: '' }); load(); }, L('Qaytarish qayd etildi'))}>{L('Qayd etish')}</button></div></div>
      <div className="table-scroll"><table className="data"><thead><tr><th>{L('Sana')}</th><th>{L('Laqab')}</th><th>{L('Turi')}</th><th>{L('Summa')}</th><th>{L('Holat')}</th><th /></tr></thead><tbody>
        {d?.entries.map((e) => <tr key={e.id}><td>{new Date(e.createdAt).toLocaleDateString()}</td><td>{e.creator}</td><td>{kinds[e.kind] ?? e.kind}{e.basis?.capped ? <small className="muted"> · {L('chegara')}</small> : null}{e.note ? <small className="muted"> · {e.note}</small> : null}</td><td>{minorToSom(e.amountMinor)}</td><td>{st[e.status] ?? e.status}</td>
          <td>{e.status === 'pending' && e.kind !== 'reversal' && <><button className="btn sm" onClick={() => void run(async () => { await call(`/api/creatoradmin/ledger/${e.id}/decision`, { decision: 'approved' }); load(); })}>{L('Tasdiqlash')}</button> <button className="btn sm" onClick={() => { const note = prompt(L('Rad etish sababi')) ?? ''; void run(async () => { await call(`/api/creatoradmin/ledger/${e.id}/decision`, { decision: 'rejected', note }); load(); }); }}>{L('Rad etish')}</button></>}
            {e.status === 'approved' && e.kind !== 'reversal' && e.kind !== 'adjustment' && e.amountMinor > 0 && <button className="btn sm" onClick={() => { const ref = prompt(L('To‘lov havolasi/izohi (tashqarida bajarilgan o‘tkazma)')) ?? ''; void run(async () => { await call(`/api/creatoradmin/ledger/${e.id}/paid`, { ref }); load(); }); }}>{L('To‘langan deb belgilash')}</button>}</td></tr>)}
      </tbody></table></div>
    </>
  );
}

/** Hamkorlik sahifasidan kelgan arizalar: aloqa, havola, auditoriya; holat — yangi → bog'lanildi → tasdiqlandi/rad etildi.
 *  Tasdiqlangach hamkor rolini "Xodimlar" bo'limida laqab bo'yicha beriladi (o'quvchi hisobi bo'lsa — laqabi shu yerda ko'rinadi). */
interface PartnerApp { id: number; kind: string; name: string; link: string; audience: string; contact: string; note: string | null; nickname: string | null; status: string; adminNote: string | null; createdAt: number }
const APP_STATUS: Record<string, string> = { new: L('Yangi'), contacted: L('Bog‘lanildi'), approved: L('Tasdiqlandi'), rejected: L('Rad etildi') };
const APP_KIND: Record<string, string> = { blogger: L('Bloger'), teacher: L('O‘qituvchi'), learner: L('O‘quvchi') };
function Applications({ run }: { run: (fn: () => Promise<unknown>, ok?: string) => Promise<void> }) {
  const [apps, setApps] = useState<PartnerApp[] | null>(null);
  const load = useCallback(() => { void call<{ apps: PartnerApp[] }>('/api/staff/partners').then((r) => setApps(r.apps)).catch(() => setApps([])); }, []);
  useEffect(load, [load]);
  if (!apps) return <p className="muted">{L('Yuklanmoqda…')}</p>;
  if (!apps.length) return <p className="muted">{L('Hali ariza yo‘q. Ommaviy sahifa: #/partners')}</p>;
  const href = (l: string) => (l.startsWith('@') ? `https://t.me/${l.slice(1)}` : l);
  return (
    <div className="table-scroll">
      <table className="data">
        <thead><tr><th>{L('Sana')}</th><th>{L('Kim')}</th><th>{L('Sahifa')}</th><th>{L('Auditoriya')}</th><th>{L('Aloqa')}</th><th>{L('Holat')}</th></tr></thead>
        <tbody>
          {apps.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.createdAt).toLocaleDateString()}</td>
              <td><b>{a.name}</b><br /><span className="muted">{APP_KIND[a.kind] ?? a.kind}{a.nickname ? ` · ${a.nickname}` : ''}</span>{a.note && <><br /><span className="muted">{a.note}</span></>}</td>
              <td><a href={href(a.link)} target="_blank" rel="noopener noreferrer">{a.link.replace(/^https?:\/\//, '').slice(0, 40)}</a></td>
              <td>{a.audience}</td>
              <td>{a.contact}</td>
              <td>
                <select value={a.status} aria-label={L('Holat')} onChange={(e) => void run(async () => { await call('/api/staff/partners', { id: a.id, status: e.target.value, note: a.adminNote ?? '' }); load(); }, L('Saqlandi'))}>
                  {Object.entries(APP_STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
