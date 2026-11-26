// Bloger kabinetining asosiy qismi (2026-11-26, egasi: "creator kabinet juda murakkab"): balans + videolar, 2 qadam.
// 1) "Yangi video" — video uchun alohida havola o'zi yaratiladi (bio va izohga qo'yiladi; o'quvchilar shu video bo'yicha sanaladi).
// 2) Video joylangach — faqat video havolasi va sana. Platforma havoladan aniqlanadi, til — interfeys tili.
// Har bir video holati bitta qatorda: tekshirilmoqda → hisob kuni → hisoblangan summa → to'lov sanasi → to'langan.
import { Copy, Plus, Video } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { getLang, L } from '../i18n';

interface Link { code: string; label: string; postRef: string | null; active: boolean; createdAt: number }
interface Post { id: number; platform: string; url: string | null; postedOn: string | null; status: string; linkCode: string | null; adminNote: string | null; createdAt?: number }
interface VItem { postId: number; dueAt: number | null; due: boolean; learners: number; entry: { amountMinor: number; status: string; payBy: number | null } | null }
interface Rewards { balances: { pending: number; approved: number; paid: number }; video?: { terms: { enabled: boolean; windowDays: number; payDays: number }; items: VItem[] } }

const MARK = 'sellzen-video'; // shu kabinetda video uchun yaratilgan havola belgisi (links.post_ref)
const LANGS = ['uz', 'en', 'ru', 'tg', 'ky', 'kk'];
const som = (minor: number): string => L('{0} so‘m', [fmtSum(Math.round(minor / 100))]);
const day = (t: number): string => new Date(t).toLocaleDateString();
const today = (): string => new Date().toISOString().slice(0, 10);
/** Platforma video havolasidan aniqlanadi (server baribir tekshiradi). */
export function platformOf(url: string): string {
  let h = ''; try { h = new URL(url.trim()).hostname.toLowerCase(); } catch { return 'other'; }
  if (/(^|\.)instagram\.com$/.test(h)) return 'instagram';
  if (/(^|\.)tiktok\.com$/.test(h)) return 'tiktok';
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(h)) return 'youtube';
  if (/^(t\.me|telegram\.me)$/.test(h)) return 'telegram';
  if (/(^|\.)(facebook\.com|fb\.watch)$/.test(h)) return 'facebook';
  if (/(^|\.)(x\.com|twitter\.com)$/.test(h)) return 'x';
  return 'other';
}

async function api<T>(path: string, body?: unknown): Promise<T> {
  const r = await fetch(path, { method: body === undefined ? 'GET' : 'POST', headers: { 'x-token': getAccount()?.token ?? '', ...(body !== undefined ? { 'content-type': 'application/json' } : {}) }, body: body === undefined ? undefined : JSON.stringify(body) });
  const j = await r.json().catch(() => ({})) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}

export function CreatorVideos() {
  const [links, setLinks] = useState<Link[]>([]); const [posts, setPosts] = useState<Post[]>([]); const [rw, setRw] = useState<Rewards | null>(null);
  const [form, setForm] = useState<Record<string, { url: string; date: string }>>({});
  const [err, setErr] = useState(''); const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const load = useCallback(() => {
    void api<{ links: Link[] }>('/api/creator/links').then((d) => setLinks(d.links)).catch(() => undefined);
    void api<{ posts: Post[] }>('/api/creator/posts').then((d) => setPosts(d.posts)).catch(() => undefined);
    void api<Rewards>('/api/creator/rewards').then(setRw).catch(() => undefined);
  }, []);
  useEffect(load, [load]);
  const run = async (fn: () => Promise<unknown>, ok: string) => { setErr(''); setMsg(''); setBusy(true); try { await fn(); setMsg(ok); load(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } };
  const used = new Set(posts.filter((p) => p.status !== 'rejected' && p.linkCode).map((p) => p.linkCode!));
  const waiting = links.filter((l) => l.active && l.postRef === MARK && !used.has(l.code));
  const shown = posts.filter((p) => p.status !== 'draft');
  const items = new Map((rw?.video?.items ?? []).map((i) => [i.postId, i]));
  const short = (c: string) => `${location.origin}/r/${c}`;
  const copy = (t: string) => { void navigator.clipboard?.writeText(t).then(() => setMsg(L('Havola nusxalandi'))); };
  const newVideo = () => void run(() => api('/api/creator/links', { kind: 'reel', label: L('Video {0}', [today()]), postRef: MARK }), L('Havola tayyor — uni bio va video izohiga qo‘ying'));
  const send = (l: Link) => { const f = form[l.code] ?? { url: '', date: today() };
    void run(() => api('/api/creator/posts', { platform: platformOf(f.url), url: f.url.trim(), postedOn: f.date, lang: LANGS.includes(getLang()) ? getLang() : 'uz', linkCode: l.code, submit: true }), L('Video yuborildi — admin tekshiradi')); };
  const wd = rw?.video?.terms.windowDays ?? 15, pd = rw?.video?.terms.payDays ?? 14;

  const statusOf = (p: Post): { text: string; tone: string } => {
    if (p.status === 'submitted') return { text: L('Admin tekshiryapti'), tone: 'muted' };
    if (p.status === 'needs_changes') return { text: L('O‘zgartirish kerak: {0}', [p.adminNote ?? '']), tone: 'notice' };
    if (p.status === 'rejected') return { text: L('Rad etildi: {0}', [p.adminNote ?? '']), tone: 'notice' };
    const it = items.get(p.id);
    if (!it) return { text: L('Tasdiqlandi'), tone: 'muted' };
    if (it.entry) {
      const e = it.entry;
      if (e.status === 'paid') return { text: L('{0} — to‘landi', [som(e.amountMinor)]), tone: 'ok' };
      if (e.status === 'approved') return { text: e.payBy ? L('{0} — {1} gacha to‘lanadi', [som(e.amountMinor), day(e.payBy)]) : L('{0} — to‘lanadi', [som(e.amountMinor)]), tone: 'ok' };
      if (e.status === 'rejected') return { text: L('Hisob rad etildi'), tone: 'notice' };
      return { text: L('{0} — tasdiq kutilmoqda', [som(e.amountMinor)]), tone: 'muted' };
    }
    if (it.due) return { text: L('Hisob kuni keldi — admin hisoblaydi · {0} o‘quvchi', [it.learners]), tone: 'muted' };
    return { text: L('Hisob kuni: {0} · hozircha {1} o‘quvchi', [it.dueAt ? day(it.dueAt) : '—', it.learners]), tone: 'muted' };
  };

  return (
    <>
      {rw && (
        <section className="card cv-balance">
          <h3>{L('Balansingiz')}</h3>
          <div className="cv-kpis">
            <div><span>{L('Tasdiq kutilmoqda')}</span><b>{som(rw.balances.pending)}</b></div>
            <div><span>{L('To‘lanadi')}</span><b>{som(rw.balances.approved)}</b></div>
            <div><span>{L('To‘langan')}</span><b>{som(rw.balances.paid)}</b></div>
          </div>
          <p className="muted">{L('Video {0}-kuni hisoblanadi, summa tasdiqlangach {1} kun ichida to‘lanadi.', [wd, pd])} <a href="#/partners">{L('Shartlar')}</a></p>
        </section>
      )}

      <section className="card cv-videos">
        <div className="cv-head"><h3><Video size={18} /> {L('Videolarim')}</h3><button className="btn primary sm" disabled={busy} onClick={newVideo}><Plus size={16} /> {L('Yangi video')}</button></div>
        {err && <p className="notice" role="alert">{err}</p>}{msg && <p className="evidence" role="status">{msg}</p>}

        {waiting.map((l) => { const f = form[l.code] ?? { url: '', date: today() }; const set = (x: Partial<typeof f>) => setForm({ ...form, [l.code]: { ...f, ...x } });
          return (
            <div key={l.code} className="cv-new">
              <p className="cv-step"><b>1</b>{L('Bu havolani profilingiz bio’siga va video izohiga qo‘ying:')}</p>
              <div className="invite-link"><code>{short(l.code)}</code><button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => copy(short(l.code))}><Copy size={16} /></button></div>
              <p className="cv-step"><b>2</b>{L('Videoni joylagach, uning havolasini kiriting:')}</p>
              <div className="cv-form">
                <input className="input" inputMode="url" value={f.url} placeholder={'https://www.instagram.com/reel/…'} aria-label={L('Video havolasi')} onChange={(e) => set({ url: e.target.value })} />
                <label>{L('Joylangan sana')}<input className="input" type="date" value={f.date} max={today()} onChange={(e) => set({ date: e.target.value })} /></label>
                <button className="btn primary" disabled={busy || !/^https:\/\//.test(f.url.trim())} onClick={() => send(l)}>{L('Yuborish')}</button>
              </div>
              <button className="btn sm ghost cv-cancel" disabled={busy} onClick={() => void run(() => api(`/api/creator/links/${l.code}/active`, { active: false }), L('Havola bekor qilindi'))}>{L('Bu havolani bekor qilish')}</button>
            </div>);
        })}

        {shown.length === 0 && waiting.length === 0 && <p className="muted">{L('Hali video yo‘q. «Yangi video» tugmasini bosing — havola olasiz, uni bio va izohga qo‘yib, videoni joylaysiz.')}</p>}
        {shown.length > 0 && (
          <ul className="cv-list">
            {shown.map((p) => { const s = statusOf(p); return (
              <li key={p.id}>
                <div><b>{p.platform}</b> · {p.postedOn ?? '—'}{p.url && <> · <a href={p.url} target="_blank" rel="noreferrer noopener">{L('ochish')}</a></>}</div>
                <p className={s.tone === 'ok' ? 'cv-ok' : s.tone}>{s.text}</p>
              </li>); })}
          </ul>
        )}
      </section>
    </>
  );
}
