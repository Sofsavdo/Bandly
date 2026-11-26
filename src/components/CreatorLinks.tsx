// Creator kabineti: post/platforma bo'yicha tracking linklar va voronka (visit → signup → faollashish → D7 → to'lov → qaytarish).
// Faqat agregat: o'quvchilarning shaxsiy ma'lumoti (ism, Telegram ID, telefon, email, ball) hech qachon ko'rsatilmaydi.
import { Copy, Link2, Pause, Play } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

export interface LinkRow { code: string; kind: string; label: string; lang: string | null; postRef: string | null; campaignId: number | null; active: boolean; clicks: number; uniqueClicks: number; signups: number; activated: number; paid: number; netRevenue: number }
export interface FunnelData {
  clicks: number; uniqueClicks: number; filteredClicks: number; landingViews: number; signupStarts: number; signups: number; placement: number; mock: number; planOpen: number; firstLesson: number; activated: number;
  d7: { eligible: number; active: number }; checkout: number; paid: number; refunded: number; grossRevenue: number; refundedSum: number; netRevenue: number;
  rates: { clickToSignup: number | null; signupToActivation: number | null; activatedToD7: number | null; activationToPaid: number | null; refundRate: number | null };
  weakest: 'click_to_signup' | 'signup_to_activation' | 'activated_to_d7' | 'activation_to_paid' | null;
}
const KIND_UZ = (): Record<string, string> => ({ bio: L('Bio havolasi'), reel: 'Instagram Reel', tiktok: 'TikTok', telegram: L('Telegram post'), youtube: 'YouTube', campaign: L('Kampaniya'), other: L('Boshqa') });
const LANGS = ['uz', 'en', 'ru', 'tg', 'ky', 'kk'];
const pct = (x: number | null): string => (x === null ? '—' : `${x}%`);
const WEAK = (): Record<string, string> => ({ click_to_signup: L('Klikdan ro‘yxatdan o‘tishga'), signup_to_activation: L('Ro‘yxatdan faollashishga'), activated_to_d7: L('Faollashgandan 7-kun qaytishga'), activation_to_paid: L('Faollashgandan to‘lovga') });

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', ...(init?.body ? { 'content-type': 'application/json' } : {}) } });
  const j = await r.json().catch(() => ({})) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}

export function FunnelView({ f }: { f: FunnelData }) {
  const steps: [string, number, string | null][] = [
    [L('Noyob tashrif (klik)'), f.uniqueClicks, null],
    [L('Sahifani ko‘rdi'), f.landingViews, pct(f.uniqueClicks ? Math.round((f.landingViews / f.uniqueClicks) * 1000) / 10 : null)],
    [L('Ro‘yxatdan o‘tishni boshladi'), f.signupStarts, null],
    [L('Ro‘yxatdan o‘tdi'), f.signups, pct(f.rates.clickToSignup)],
    [L('Daraja testini tugatdi'), f.placement, null], [L('Mock testni tugatdi'), f.mock, null], [L('Rejani ochdi'), f.planOpen, null], [L('Birinchi darsni tugatdi'), f.firstLesson, null],
    [L('Faollashdi (7 kun ichida)'), f.activated, pct(f.rates.signupToActivation)],
    [L('7-kun qaytdi'), f.d7.active, pct(f.rates.activatedToD7)],
    [L('To‘lovga o‘tdi (checkout)'), f.checkout, null], [L('To‘ladi'), f.paid, pct(f.rates.activationToPaid)], [L('Qaytarildi'), f.refunded, pct(f.rates.refundRate)],
  ];
  const max = Math.max(1, ...steps.map((s) => s[1]));
  return (
    <div>
      <div className="stack">
        {steps.map(([name, n, rate]) => (
          <div key={name} className="tr-row"><span>{name}</span><span className="tr-bar" aria-hidden="true"><i style={{ width: `${(n / max) * 100}%`, background: 'var(--brand)' }} /></span><b>{n}{rate ? <small className="muted"> · {rate}</small> : null}</b></div>
        ))}
      </div>
      <p className="muted" style={{ fontSize: 13 }}>{L('Klik: {0} (noyob: {1}); filtrlangan (bot, takror, ichki): {2}.', [f.clicks, f.uniqueClicks, f.filteredClicks])} {L('Tashrif — kun va qurilma bo‘yicha noyob.')}</p>
      <p className="muted" style={{ fontSize: 13, margin: 0 }}>{L('Sof tushum: {0} so‘m (tushum {1} − qaytarilgan {2}).', [fmtSum(f.netRevenue), fmtSum(f.grossRevenue), fmtSum(f.refundedSum)])}</p>
      {f.weakest && <p className="notice" style={{ marginTop: 8 }}>{L('Eng zaif bosqich: {0}.', [WEAK()[f.weakest]!])}</p>}
    </div>
  );
}

export function CreatorLinks({ bot }: { bot: string | null }) {
  const [d, setD] = useState<{ days: number; funnel: FunnelData; links: LinkRow[] } | null>(null);
  const [days, setDays] = useState(30);
  const [kind, setKind] = useState(''); const [lang, setLang] = useState('');
  const [form, setForm] = useState({ kind: 'bio', label: '', lang: '', postRef: '' });
  const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const load = useCallback(() => { const q = new URLSearchParams({ days: String(days), ...(kind ? { kind } : {}), ...(lang ? { lang } : {}) }); void api<{ days: number; funnel: FunnelData; links: LinkRow[] }>(`/api/creator/overview?${q}`).then(setD).catch((e: Error) => setErr(e.message)); }, [days, kind, lang]);
  useEffect(load, [load]);
  const short = (c: string) => `${location.origin}/r/${c}`;
  const copy = (t: string) => { void navigator.clipboard?.writeText(t).then(() => setMsg(L('Havola nusxalandi'))); };
  const create = async () => { setErr(''); try { await api('/api/creator/links', { method: 'POST', body: JSON.stringify({ ...form, lang: form.lang || null }) }); setForm({ ...form, label: '', postRef: '' }); setMsg(L('Link yaratildi')); load(); } catch (e) { setErr((e as Error).message); } };
  const toggle = async (c: string, active: boolean) => { try { await api(`/api/creator/links/${c}/active`, { method: 'POST', body: JSON.stringify({ active }) }); load(); } catch (e) { setErr((e as Error).message); } };
  const kinds = KIND_UZ();
  const best = d ? [...d.links].filter((l) => l.kind !== 'bio').sort((a, b) => b.activated - a.activated || b.paid - a.paid || b.signups - a.signups).slice(0, 3).filter((l) => l.signups > 0) : [];
  return (
    <>
      <section className="card">
        <h3 style={{ marginTop: 0 }}><Link2 size={18} style={{ verticalAlign: -3 }} />  {L('Havolalar va voronka')}</h3>
        <p className="muted" style={{ fontSize: 13 }}>{L('Har bir post, video yoki bio uchun alohida link yarating — qaysi biri o‘quvchi olib kelganini ko‘rasiz. Bio uchun yengil sahifa ochiladi: foydalanuvchi veb-saytda davom etadi yoki Telegram’ni ochadi.')}</p>
        <div className="row">
          <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} aria-label={L('Link turi')}>{Object.entries(kinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <input className="input" value={form.label} maxLength={60} placeholder={L('Nomi (masalan: IELTS Reel #1)')} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <select value={form.lang} onChange={(e) => setForm({ ...form, lang: e.target.value })} aria-label={L('Til')}><option value="">{L('Til: avtomatik')}</option>{LANGS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
          <input className="input" value={form.postRef} maxLength={80} placeholder={L('Post identifikatori (ixtiyoriy)')} onChange={(e) => setForm({ ...form, postRef: e.target.value })} />
          <button className="btn primary sm" disabled={form.label.trim().length < 2} onClick={() => void create()}>{L('Link yaratish')}</button>
        </div>
        {err && <p className="notice" role="alert">{err}</p>}{msg && <p className="evidence">{msg}</p>}
        <div className="row" style={{ margin: '10px 0' }}>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label={L('Davr')}>{[7, 30, 90].map((n) => <option key={n} value={n}>{L('Oxirgi {0} kun', [n])}</option>)}</select>
          <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label={L('Platforma')}><option value="">{L('Barcha platformalar')}</option>{Object.entries(kinds).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select value={lang} onChange={(e) => setLang(e.target.value)} aria-label={L('Til')}><option value="">{L('Barcha tillar')}</option>{LANGS.map((l) => <option key={l} value={l}>{l}</option>)}</select>
        </div>
        {!d ? <p className="muted">{L('Yuklanmoqda…')}</p> : d.links.length === 0 ? <p className="muted">{L('Hali link yo‘q.')}</p> : (
          <div className="stack">
            {d.links.map((l) => (
              <div key={l.code} className="card" style={{ margin: 0, opacity: l.active ? 1 : .6 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <b>{l.label} <small className="muted">· {kinds[l.kind] ?? l.kind}{l.lang ? ` · ${l.lang}` : ''}{l.postRef ? ` · ${l.postRef}` : ''}</small></b>
                  <span className="row">
                    <button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => copy(short(l.code))}><Copy size={16} /></button>
                    <button className="icon-btn sm" aria-label={l.active ? L('To‘xtatish') : L('Yoqish')} onClick={() => void toggle(l.code, !l.active)}>{l.active ? <Pause size={16} /> : <Play size={16} />}</button>
                  </span>
                </div>
                <code style={{ wordBreak: 'break-all' }}>{short(l.code)}</code>
                {bot && <p className="muted" style={{ fontSize: 12, margin: '4px 0' }}>{L('Telegram havolasi:')} <button className="linkbtn" onClick={() => copy(`https://t.me/${bot}?start=ref_${l.code}`)}>{L('nusxalash')}</button></p>}
                <p className="muted" style={{ fontSize: 13, margin: '4px 0 0' }}>{L('Klik {0} · noyob {1} · ro‘yxat {2} · faol {3} · to‘lagan {4} · sof tushum {5} so‘m', [l.clicks, l.uniqueClicks, l.signups, l.activated, l.paid, fmtSum(l.netRevenue)])}</p>
              </div>
            ))}
          </div>
        )}
      </section>
      {d && (
        <section className="card">
          <h3 style={{ marginTop: 0 }}>{L('Voronka')}</h3>
          <FunnelView f={d.funnel} />
          {best.length > 0 && <><h4 className="list-h">{L('Eng yaxshi ishlagan postlar')}</h4><ol>{best.map((l) => <li key={l.code}>{l.label} — {L('{0} ta faollashgan, {1} ta to‘lagan', [l.activated, l.paid])}</li>)}</ol></>}
        </section>
      )}
    </>
  );
}
