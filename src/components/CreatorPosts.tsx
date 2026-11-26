// Creator kabineti: kampaniyalar va kreativ brief, video/post topshirish va holati, mukofot holati (faqat mavjud dalil), profil va ixtiyoriy reyting.
import { Megaphone, Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

interface Campaign { id: number; name: string; brief: string; rules: string; requiresVideo: boolean; endsAt: number | null }
interface Post { id: number; platform: string; url: string | null; lang: string | null; postedOn: string | null; caption: string | null; status: string; claimedViews: number | null; viewsVerified: boolean; verifiedViews: number | null; adminNote: string | null; history: { ts: number; to: string; note: string | null; byAdmin: boolean }[]; linkCode: string | null; campaignId: number | null }
interface Entry { id: number; kind: string; amountMinor: number; currency: string; status: string; createdAt: number }
interface Link { code: string; label: string }
interface VideoPay { terms: { enabled: boolean; baseSom: number; windowDays: number }; items: { postId: number; platform: string; postedOn: string | null; dueAt: number | null; due: boolean; learners: number; entry: { amountMinor: number; status: string } | null }[] }
const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'telegram', 'facebook', 'x', 'other'];
const LANGS = ['uz', 'en', 'ru', 'tg', 'ky', 'kk'];

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', ...(init?.body ? { 'content-type': 'application/json' } : {}) } });
  const j = await r.json().catch(() => ({})) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}
export const POST_STATUS = (): Record<string, string> => ({ draft: L('Qoralama'), submitted: L('Ko‘rib chiqilmoqda'), needs_changes: L('O‘zgartirish kerak'), approved: L('Tasdiqlangan'), rejected: L('Rad etilgan') });
export const RULE_KIND = (): Record<string, string> => ({ paid_pct: L('To‘lovdan foiz'), activated_flat: L('Faollashgan o‘quvchi boshiga'), first_paid_flat: L('Birinchi to‘lov boshiga'), verified_views_per_1k: L('Har 1000 tasdiqlangan ko‘rish uchun') });
export const LEDGER_KIND = (): Record<string, string> => ({ commission: L('Komissiya'), cpa_activated: L('Faollashgan o‘quvchi'), cpa_first_paid: L('Birinchi to‘lov'), views: L('Tasdiqlangan ko‘rishlar'), video: L('Video to‘lovi'), bonus: L('Bonus'), adjustment: L('Tuzatish'), reversal: L('Qaytarish ushlanmasi') });
export const LEDGER_STATUS = (): Record<string, string> => ({ pending: L('Kutilmoqda'), approved: L('Tasdiqlangan'), rejected: L('Rad etilgan'), paid: L('To‘langan') });
const fmtDate = (t: number): string => new Date(t).toLocaleDateString();
const BRAND_RULES = (): string[] => [
  L('Reklama ekanini aniq belgilang (masalan, #reklama yoki #ad).'),
  L('Natijani kafolatlamang: «band beramiz», «albatta o‘tasiz» kabi da’volar mumkin emas.'),
  L('Sellzen rasmiy IELTS tashkilotlari bilan bog‘liq emas — «rasmiy IELTS» deb da’vo qilmang.'),
  L('18+ ustoz xarakterini voyaga yetmaganlarga qaratilgan reklamada ko‘rsatmang.'),
];

export function CreatorPosts() {
  const [camps, setCamps] = useState<Campaign[]>([]); const [posts, setPosts] = useState<Post[]>([]); const [links, setLinks] = useState<Link[]>([]);
  const [rw, setRw] = useState<{ entries: Entry[]; balances: { pending: number; approved: number; paid: number; currency: string }; enabled: boolean; video?: VideoPay; inHoldMinor: number; terms: { kind: string; name: string; pct: number | null; amountMinor: number | null; holdDays: number; endsAt: number | null }[] } | null>(null);
  const [rk, setRk] = useState<Record<string, { nickname: string; value: number }[]> | null>(null);
  const [prof, setProf] = useState<{ rankOptIn: boolean; status: string } | null>(null);
  const [err, setErr] = useState(''); const [msg, setMsg] = useState('');
  const blank = { platform: 'instagram', url: '', lang: 'uz', postedOn: new Date().toISOString().slice(0, 10), caption: '', linkCode: '', campaignId: '', claimedViews: '' };
  const [f, setF] = useState(blank);
  const load = useCallback(() => {
    void api<{ campaigns: Campaign[] }>('/api/creator/campaigns').then((d) => setCamps(d.campaigns)).catch(() => undefined);
    void api<{ posts: Post[] }>('/api/creator/posts').then((d) => setPosts(d.posts)).catch(() => undefined);
    void api<{ links: Link[] }>('/api/creator/links').then((d) => setLinks(d.links)).catch(() => undefined);
    void api<NonNullable<typeof rw>>('/api/creator/rewards').then(setRw).catch(() => undefined);
    void api<Record<string, { nickname: string; value: number }[]>>('/api/creator/ranking').then(setRk).catch(() => undefined);
    void api<{ profile: { rankOptIn: boolean; status: string } }>('/api/creator/profile').then((d) => setProf(d.profile)).catch(() => undefined);
  }, []);
  useEffect(load, [load]);
  const send = async (submit: boolean) => { setErr(''); setMsg(''); try { await api('/api/creator/posts', { method: 'POST', body: JSON.stringify({ ...f, campaignId: f.campaignId || null, claimedViews: f.claimedViews === '' ? null : Number(f.claimedViews), submit }) }); setMsg(submit ? L('Post topshirildi — admin ko‘rib chiqadi') : L('Qoralama saqlandi')); setF(blank); load(); } catch (e) { setErr((e as Error).message); } };
  const rankLabels: [string, string][] = [['verifiedReach', L('Tasdiqlangan qamrov')], ['activatedLearners', L('Faollashgan o‘quvchilar')], ['retainedLearners', L('Qaytgan o‘quvchilar (7-kun)')], ['netPaidConversions', L('Sof to‘lovga o‘tganlar')]];
  const st = POST_STATUS();
  return (
    <>
      <section className="card">
        <h3 style={{ marginTop: 0 }}><Megaphone size={18} style={{ verticalAlign: -3 }} />  {L('Kampaniyalar va kreativ brief')}</h3>
        {camps.length === 0 ? <p className="muted">{L('Hozircha faol kampaniya yo‘q. Bio havolangiz uchun video topshirish shart emas — organik takliflar o‘z-o‘zidan hisoblanadi.')}</p> : camps.map((c) => (
          <div key={c.id} className="card" style={{ margin: '0 0 8px' }}><b>{c.name}</b>{c.endsAt ? <small className="muted"> · {L('muddati: {0}', [fmtDate(c.endsAt)])}</small> : null}
            <p style={{ margin: '4px 0' }}>{c.brief}</p>{c.rules && <p className="muted" style={{ margin: 0 }}>{c.rules}</p>}
            <p className="evidence" style={{ margin: '4px 0 0' }}>{c.requiresVideo ? L('Bu kampaniya uchun video-post havolasi majburiy.') : L('Video-post havolasi majburiy emas.')}</p></div>
        ))}
        <h4 className="list-h">{L('Brend qoidalari (hammasi uchun)')}</h4>
        <ul>{BRAND_RULES().map((r) => <li key={r}>{r}</li>)}</ul>
      </section>
      <section className="card">
        <h3 style={{ marginTop: 0 }}>{L('Video / post topshirish')}</h3>
        <p className="muted" style={{ fontSize: 13 }}>{L('Kampaniya yoki kontent bonusi uchun. Platforma, havola, til, sana, caption va tracking link majburiy. Ko‘rishlar sonini siz yozasiz — admin tekshirmaguncha u tasdiqlanmagan hisoblanadi.')}</p>
        <div className="row">
          <select value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })} aria-label={L('Platforma')}>{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</select>
          <input className="input" value={f.url} placeholder={L('Post havolasi')} inputMode="url" onChange={(e) => setF({ ...f, url: e.target.value })} aria-label={L('Post havolasi')} />
          <select value={f.lang} onChange={(e) => setF({ ...f, lang: e.target.value })} aria-label={L('Til')}>{LANGS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          <input className="input" type="date" value={f.postedOn} onChange={(e) => setF({ ...f, postedOn: e.target.value })} aria-label={L('Joylangan sana')} />
          <select value={f.linkCode} onChange={(e) => setF({ ...f, linkCode: e.target.value })} aria-label={L('Tracking link')}><option value="">{L('Tracking link tanlang')}</option>{links.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select>
          <select value={f.campaignId} onChange={(e) => setF({ ...f, campaignId: e.target.value })} aria-label={L('Kampaniya')}><option value="">{L('Kampaniyasiz')}</option>{camps.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <input className="input" type="number" min={0} value={f.claimedViews} placeholder={L('Ko‘rishlar (tasdiqlanmagan)')} onChange={(e) => setF({ ...f, claimedViews: e.target.value })} />
        </div>
        <textarea className="input" rows={3} style={{ width: '100%', marginTop: 8 }} value={f.caption} placeholder={L('Caption (reklama belgisi bilan)')} onChange={(e) => setF({ ...f, caption: e.target.value })} />
        <div className="row"><button className="btn sm" onClick={() => void send(false)}>{L('Qoralama saqlash')}</button><button className="btn primary sm" onClick={() => void send(true)}>{L('Topshirish')}</button></div>
        {err && <p className="notice" role="alert">{err}</p>}{msg && <p className="evidence">{msg}</p>}
        {posts.length > 0 && <div className="table-scroll"><table className="data"><thead><tr><th>{L('Platforma')}</th><th>{L('Sana')}</th><th>{L('Holat')}</th><th>{L('Ko‘rishlar')}</th></tr></thead><tbody>
          {posts.map((p) => <tr key={p.id}><td>{p.platform}{p.url ? <small className="muted"> · <a href={p.url} target="_blank" rel="noreferrer noopener">{L('havola')}</a></small> : null}</td><td>{p.postedOn ?? '—'}</td>
            <td><b>{st[p.status] ?? p.status}</b>{p.adminNote ? <small className="muted"> · {p.adminNote}</small> : null}</td>
            <td>{p.viewsVerified ? <>{p.verifiedViews} <small className="muted">({L('tasdiqlangan')})</small></> : p.claimedViews !== null ? <>{p.claimedViews} <small className="muted">({L('tasdiqlanmagan')})</small></> : '—'}</td></tr>)}
        </tbody></table></div>}
      </section>
      {rw?.video?.terms.enabled && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Video uchun to‘lov')}</h3>
          <p className="muted" style={{ fontSize: 13 }}>{L('Tasdiqlangan har bir video joylanganiga {0} kun to‘lganda bir marta hisoblanadi: asosiy to‘lov + ko‘rishlar va kelgan o‘quvchilar bonusi.', [rw.video.terms.windowDays])}</p>
          {rw.video.items.length === 0 ? <p className="muted">{L('Tasdiqlangan video hali yo‘q. Videoni yuqoridagi shakl orqali topshiring.')}</p> : (
            <div className="table-scroll"><table className="data"><thead><tr><th>{L('Video')}</th><th>{L('Hisob kuni')}</th><th>{L('Kelgan o‘quvchilar')}</th><th>{L('Natija')}</th></tr></thead><tbody>
              {rw.video.items.map((v) => <tr key={v.postId}><td>{v.platform} · {v.postedOn ?? '—'}</td><td>{v.dueAt ? fmtDate(v.dueAt) : '—'}</td><td>{v.learners}</td>
                <td>{v.entry ? <><b>{fmtSum(Math.round(v.entry.amountMinor / 100))} {L('so‘m')}</b> <small className="muted">· {LEDGER_STATUS()[v.entry.status] ?? v.entry.status}</small></> : v.due ? L('Admin hisoblaydi') : L('Hisob kutilmoqda')}</td></tr>)}
            </tbody></table></div>)}
        </section>
      )}
      {rw && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Bonus / komissiya holati')}</h3>
          {!rw.enabled && !rw.video?.terms.enabled && <p className="muted">{L('Hozircha mukofot dasturi yoqilmagan: hisoblash va to‘lovlar admin tasdiqlagan qoidalar bilan keyin boshlanadi. Hamkorlik shartlari alohida kelishiladi.')}</p>}
          {rw.terms.length > 0 && (<><h4 className="list-h">{L('Amaldagi mukofot shartlari')}</h4><ul>{rw.terms.map((t) => <li key={t.name}><b>{t.name}</b> — {RULE_KIND()[t.kind] ?? t.kind}: {t.kind === 'paid_pct' ? `${t.pct}%` : `${fmtSum(Math.round((t.amountMinor ?? 0) / 100))} ${L('so‘m')}`} · {L('kutish davri {0} kun', [t.holdDays])}{t.endsAt ? ` · ${L('muddati: {0}', [fmtDate(t.endsAt)])}` : ''}</li>)}</ul></>)}
          <div className="kpis">
            <div className="kpi2"><span>{L('Kutish davrida')}</span><b>{fmtSum(Math.round(rw.inHoldMinor / 100))}</b></div>
            <div className="kpi2"><span>{L('Kutilmoqda')}</span><b>{fmtSum(Math.round(rw.balances.pending / 100))}</b></div>
            <div className="kpi2"><span>{L('Tasdiqlangan')}</span><b>{fmtSum(Math.round(rw.balances.approved / 100))}</b></div>
            <div className="kpi2"><span>{L('To‘langan')}</span><b>{fmtSum(Math.round(rw.balances.paid / 100))}</b></div>
          </div>
          {rw.entries.length > 0 && <div className="table-scroll"><table className="data"><thead><tr><th>{L('Sana')}</th><th>{L('Turi')}</th><th>{L('Summa')}</th><th>{L('Holat')}</th></tr></thead><tbody>
            {rw.entries.map((e) => <tr key={e.id}><td>{fmtDate(e.createdAt)}</td><td>{LEDGER_KIND()[e.kind] ?? e.kind}</td><td>{fmtSum(Math.round(e.amountMinor / 100))} {e.currency === 'UZS' ? L('so‘m') : e.currency}</td><td>{LEDGER_STATUS()[e.status] ?? e.status}</td></tr>)}</tbody></table></div>}
          <p className="muted" style={{ fontSize: 13, marginBottom: 0 }}>{L('Mukofot faqat shartlarda ko‘rsatilgan hodisalar uchun hisoblanadi. Qaytarilgan to‘lovlar ayriladi; ro‘yxatdan o‘tganlik va tasdiqlanmagan ko‘rishlar uchun to‘lov yo‘q. Kutish davridagi summa taxminiy.')}</p>
        </section>
      )}
      <section className="card">
        <h3 style={{ marginTop: 0 }}><Trophy size={18} style={{ verticalAlign: -3 }} />  {L('Hamkorlar reytingi')}</h3>
        <label className="evidence" style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input type="checkbox" checked={prof?.rankOptIn ?? false} onChange={(e) => void api('/api/creator/profile', { method: 'POST', body: JSON.stringify({ rankOptIn: e.target.checked }) }).then(load).catch((x: Error) => setErr(x.message))} /> {L('Laqabim va agregat ko‘rsatkichlarim reytingda ko‘rinsin')}</label>
        {rk && rankLabels.map(([k, label]) => (rk[k]?.length ?? 0) > 0 && <div key={k}><h4 className="list-h">{label}</h4><ol>{rk[k]!.map((e) => <li key={e.nickname}>{e.nickname} — {e.value}</li>)}</ol></div>)}
        {rk && rankLabels.every(([k]) => (rk[k]?.length ?? 0) === 0) && <p className="muted">{L('Reytingda hozircha hech kim yo‘q (faqat ruxsat bergan hamkorlar ko‘rinadi).')}</p>}
      </section>
    </>
  );
}
