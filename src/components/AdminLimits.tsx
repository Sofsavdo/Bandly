// Admin: tariflar limitlari va narxlari. Saqlangan qiymat Railway o'zgaruvchisidan ustun va darhol kuchga kiradi (server/settings.ts).
import { RotateCcw, Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtDate } from '../lib/pay';
import { L } from '../i18n';

type Group = 'free' | 'plans' | 'coach' | 'referral' | 'prices' | 'safety' | 'bot' | 'creator';
interface Item { key: string; group: Group; label: string; hint?: string; def: number; min: number; max: number; unit?: string; value: number; source: 'admin' | 'env' | 'default'; updatedAt: number | null }

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', 'content-type': 'application/json' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
  return j as T;
}

const GROUPS: { id: Group; title: string; note: string }[] = [
  { id: 'free', title: L('Bepul tarif'), note: L('Obunasiz o‘quvchilar uchun kunlik va haftalik chegaralar.') },
  { id: 'plans', title: L('Obuna tariflari'), note: L('Tariflar sahifasidagi raqamlar shu qiymatlardan avtomatik yangilanadi.') },
  { id: 'coach', title: L('Sellzen AI'), note: L('Hamma o‘quvchilar uchun.') },
  { id: 'referral', title: L('Taklif (referal) bonuslari'), note: L('Taklif qilingan o‘quvchi birinchi dars yoki daraja testini tugatganda ikkala tomonga beriladi.') },
  { id: 'creator', title: L('Creator (hamkor) dasturi'), note: L('Mukofot qoidalari (summa, foiz, byudjet, kutish muddati) «Hamkorlar → Mukofot daftari» bo‘limida sozlanadi. Bu yerda — umumiy qoida.') },
  { id: 'prices', title: L('Narxlar'), note: L('Oylik narx; 3 oylik (−10%) va 12 oylik (10 oy narxi) shundan hisoblanadi. Yangi to‘lovlarga qo‘llanadi.') },
  { id: 'bot', title: L('Telegram bot'), note: L('O‘chiq bo‘lsa, /start bosilganda darhol xush kelibsiz xabari keladi (reklama tarmoqlari talabi uchun).') },
  { id: 'safety', title: L('Xarajat himoyasi'), note: L('AI xarajati keskin oshib ketmasligi uchun umumiy chegaralar.') },
];
const UNIT: Record<string, string> = { min: L('daqiqa'), day: L('kun'), uzs: L('so‘m') };
const SOURCE: Record<Item['source'], string> = { admin: L('Admin panel'), env: 'Railway', default: L('Standart') };

export function LimitsPanel() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const load = async () => { try { setItems((await call<{ items: Item[] }>('/api/admin/settings')).items); setDraft({}); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } };
  useEffect(() => { void load(); }, []);

  const changed = useMemo(() => Object.entries(draft).filter(([k, v]) => { const it = items?.find((x) => x.key === k); return it && v.trim() !== '' && Number(v) !== it.value; }), [draft, items]);
  const invalid = changed.filter(([k, v]) => { const it = items!.find((x) => x.key === k)!; const n = Number(v); return !Number.isInteger(n) || n < it.min || n > it.max; });

  const save = async (values: Record<string, number | null>) => {
    setBusy(true); setMsg(null);
    try { setItems((await call<{ items: Item[] }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ values }) })).items); setDraft({}); setMsg({ ok: true, text: L('Saqlandi. O‘zgarish darhol kuchga kirdi.') }); }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setBusy(false); }
  };

  if (!items) return <section className="card">{msg ? <p className="notice">{msg.text}</p> : <p className="muted">{L('Yuklanmoqda…')}</p>}</section>;
  return (
    <div className="limits">
      <section className="card limits-bar">
        <div>
          <h3 style={{ margin: 0 }}>{L('Limitlar va narxlar')}</h3>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: 13 }}>{L('Bu yerda saqlangan qiymat Railway sozlamasidan ustun turadi va serverni qayta ishga tushirmasdan darhol ishlaydi. Har bir o‘zgarish jurnalga yoziladi.')}</p>
        </div>
        <div className="row">
          {changed.length > 0 && <button type="button" className="btn sm" onClick={() => setDraft({})} disabled={busy}>{L('Bekor qilish')}</button>}
          <button type="button" className="btn sm primary" disabled={busy || !changed.length || invalid.length > 0} onClick={() => void save(Object.fromEntries(changed.map(([k, v]) => [k, Number(v)])))}><Save size={15} /> {changed.length ? L('Saqlash ({0})', [changed.length]) : L('Saqlash')}</button>
        </div>
      </section>
      {msg && <p className={msg.ok ? 'notice ok' : 'notice'} role="status">{msg.text}</p>}
      {GROUPS.map((g) => {
        const list = items.filter((x) => x.group === g.id);
        if (!list.length) return null;
        return (
          <section key={g.id} className="card">
            <h3 style={{ marginTop: 0, marginBottom: 2 }}>{g.title}</h3>
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>{g.note}</p>
            <div className="limit-rows">
              {list.map((it) => {
                const v = draft[it.key] ?? String(it.value);
                const n = Number(v);
                const bad = v.trim() === '' || !Number.isInteger(n) || n < it.min || n > it.max;
                const dirty = !bad && n !== it.value;
                return (
                  <div key={it.key} className={`limit-row${dirty ? ' dirty' : ''}`}>
                    <label htmlFor={`lim-${it.key}`}>
                      <b>{L(it.label)}</b>
                      <small>{it.hint ? `${L(it.hint)} · ` : ''}{SOURCE[it.source]}{it.source === 'admin' && it.updatedAt ? ` · ${fmtDate(it.updatedAt)}` : ''} · {L('standart: {0}', [it.def.toLocaleString('ru-RU')])}</small>
                    </label>
                    <div className="limit-input">
                      {it.min === 0 && it.max === 1
                        ? <label className="switch"><input id={`lim-${it.key}`} type="checkbox" checked={v === '1'} onChange={(e) => setDraft({ ...draft, [it.key]: e.target.checked ? '1' : '0' })} /> {v === '1' ? L('Yoqilgan') : L('O‘chiq')}</label>
                        : <input id={`lim-${it.key}`} type="number" inputMode="numeric" min={it.min} max={it.max} step={1} value={v} aria-invalid={bad} onChange={(e) => setDraft({ ...draft, [it.key]: e.target.value })} />}
                      {it.unit && <span>{UNIT[it.unit]}</span>}
                      {it.source === 'admin' && <button type="button" className="icon-btn" title={L('Admin qiymatini o‘chirish')} aria-label={L('Admin qiymatini o‘chirish')} disabled={busy} onClick={() => { if (window.confirm(L('Admin qiymati o‘chirilib, Railway yoki standart qiymat qaytsinmi?'))) void save({ [it.key]: null }); }}><RotateCcw size={15} /></button>}
                    </div>
                    {bad && <small className="limit-err">{L('{0}–{1} oralig‘idagi butun son', [it.min.toLocaleString('ru-RU'), it.max.toLocaleString('ru-RU')])}</small>}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
