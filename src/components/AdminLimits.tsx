// Admin: tariflar limitlari va narxlari. Saqlangan qiymat Railway o'zgaruvchisidan ustun va darhol kuchga kiradi (server/settings.ts).
// Ko'rinish: bo'limlar alohida (bitta uzun ro'yxat emas), tarif limitlari jadvalda, o'zgarishlar pastdagi saqlash panelida.
import { RotateCcw, Save, TriangleAlert } from 'lucide-react';
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

/** Bo'limlar: bir vaqtda bittasi ko'rinadi. "Bonuslar" — referal va creator qoidalari birga. */
const SECTIONS: { id: string; title: string; note: string; groups: Group[] }[] = [
  { id: 'free', title: L('Bepul tarif'), note: L('Obunasiz o‘quvchilar uchun kunlik va haftalik chegaralar.'), groups: ['free'] },
  { id: 'plans', title: L('Obuna tariflari'), note: L('Tariflar sahifasidagi raqamlar shu qiymatlardan avtomatik yangilanadi.'), groups: ['plans'] },
  { id: 'prices', title: L('Narxlar'), note: L('Oylik narx; 3 oylik (−10%) va 12 oylik (10 oy narxi) shundan hisoblanadi. Yangi to‘lovlarga qo‘llanadi.'), groups: ['prices'] },
  { id: 'coach', title: L('Sellzen'), note: L('Hamma o‘quvchilar uchun.'), groups: ['coach'] },
  { id: 'bonus', title: L('Bonuslar'), note: L('Taklif qilingan o‘quvchi birinchi dars yoki daraja testini tugatganda ikkala tomonga beriladi.'), groups: ['referral', 'creator'] },
  { id: 'bot', title: L('Telegram bot'), note: L('O‘chiq bo‘lsa, /start bosilganda darhol xush kelibsiz xabari keladi (reklama tarmoqlari talabi uchun).'), groups: ['bot'] },
  { id: 'safety', title: L('Xarajat himoyasi'), note: L('AI xarajati keskin oshib ketmasligi uchun umumiy chegaralar.'), groups: ['safety'] },
];
const UNIT: Record<string, string> = { min: L('daqiqa'), day: L('kun'), uzs: L('so‘m') };
/** Ikki holatli, lekin "yoqilgan/o'chiq" emas — tanlov. */
const CHOICE: Record<string, [string, string]> = { CREATOR_CREDIT_FIRST: [L('Oxirgi bosilgan havola'), L('Birinchi bosilgan havola')] };
const PLAN_ROWS = [['GENERAL', 'General English'], ['EXAM', 'Exam Preparation'], ['ALL', 'All Access']] as const;
const isPlanCell = (k: string) => /^PLAN_(GENERAL|EXAM|ALL)_(WRITING|SPEAKING)$/.test(k);
const fmtN = (n: number) => n.toLocaleString('ru-RU');

export function LimitsPanel() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sec, setSec] = useState(SECTIONS[0]!.id);
  const load = async () => { try { setItems((await call<{ items: Item[] }>('/api/admin/settings')).items); setDraft({}); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); } };
  useEffect(() => { void load(); }, []);

  const byKey = useMemo(() => new Map((items ?? []).map((x) => [x.key, x])), [items]);
  const isBad = (it: Item, v: string) => { const n = Number(v); return v.trim() === '' || !Number.isInteger(n) || n < it.min || n > it.max; };
  const changed = useMemo(() => Object.entries(draft).filter(([k, v]) => { const it = byKey.get(k); return it && !isBad(it, v) && Number(v) !== it.value; }), [draft, byKey]);
  const invalid = Object.entries(draft).filter(([k, v]) => { const it = byKey.get(k); return it && isBad(it, v); });

  const save = async (values: Record<string, number | null>) => {
    setBusy(true); setMsg(null);
    try { setItems((await call<{ items: Item[] }>('/api/admin/settings', { method: 'PUT', body: JSON.stringify({ values }) })).items); setDraft({}); setMsg({ ok: true, text: L('Saqlandi. O‘zgarish darhol kuchga kirdi.') }); }
    catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    finally { setBusy(false); }
  };

  if (!items) return <section className="card">{msg ? <p className="notice">{msg.text}</p> : <p className="muted">{L('Yuklanmoqda…')}</p>}</section>;
  const cur = SECTIONS.find((s) => s.id === sec)!;
  const inSec = (s: (typeof SECTIONS)[number]) => items.filter((x) => s.groups.includes(x.group));
  const dirtyIn = (s: (typeof SECTIONS)[number]) => changed.filter(([k]) => s.groups.includes(byKey.get(k)!.group)).length;
  const aiOff = byKey.get('AI_GLOBAL_DAILY_CALLS')?.value === 0;

  const meta = (it: Item) => (
    <small>
      {it.hint ? `${L(it.hint)} · ` : ''}
      {CHOICE[it.key] ? L('standart: {0}', [CHOICE[it.key]![it.def]!]) : it.min === 0 && it.max === 1 ? L('standart: {0}', [it.def ? L('Yoqilgan') : L('O‘chiq')]) : L('standart: {0}', [fmtN(it.def)])}
      {it.source === 'admin' ? ` · ${L('o‘zgartirilgan')}${it.updatedAt ? ` ${fmtDate(it.updatedAt)}` : ''}` : it.source === 'env' ? ' · Railway' : ''}
    </small>
  );
  const reset = (it: Item) => it.source === 'admin' && (
    <button type="button" className="icon-btn" title={L('Standartga qaytarish')} aria-label={L('Standartga qaytarish')} disabled={busy}
      onClick={() => { if (window.confirm(L('Admin qiymati o‘chirilib, Railway yoki standart qiymat qaytsinmi?'))) void save({ [it.key]: null }); }}><RotateCcw size={15} /></button>
  );
  const field = (it: Item, compact = false) => {
    const v = draft[it.key] ?? String(it.value);
    const set = (x: string) => setDraft({ ...draft, [it.key]: x });
    if (CHOICE[it.key]) return <select id={`lim-${it.key}`} value={v} onChange={(e) => set(e.target.value)}>{CHOICE[it.key]!.map((t, i) => <option key={i} value={String(i)}>{t}</option>)}</select>;
    if (it.min === 0 && it.max === 1) return <label className="toggle"><input id={`lim-${it.key}`} type="checkbox" role="switch" checked={v === '1'} onChange={(e) => set(e.target.checked ? '1' : '0')} /><i aria-hidden="true" /><span>{v === '1' ? L('Yoqilgan') : L('O‘chiq')}</span></label>;
    return <><input id={`lim-${it.key}`} type="number" inputMode="numeric" min={it.min} max={it.max} step={1} value={v} aria-invalid={isBad(it, v)} aria-label={compact ? L(it.label) : undefined} onChange={(e) => set(e.target.value)} />{!compact && it.unit && <span>{UNIT[it.unit]}</span>}</>;
  };
  const row = (it: Item) => {
    const v = draft[it.key] ?? String(it.value);
    const bad = isBad(it, v);
    return (
      <div key={it.key} className={`limit-row${!bad && Number(v) !== it.value ? ' dirty' : ''}`}>
        <label htmlFor={`lim-${it.key}`}><b>{L(it.label)}</b>{meta(it)}</label>
        <div className="limit-input">{field(it)}{reset(it)}</div>
        {bad && <small className="limit-err">{L('{0}–{1} oralig‘idagi butun son', [fmtN(it.min), fmtN(it.max)])}</small>}
      </div>
    );
  };
  const list = inSec(cur);
  const plan = list.filter((x) => isPlanCell(x.key));

  return (
    <div className="limits">
      <section className="card">
        <h3 style={{ margin: 0 }}>{L('Limitlar va narxlar')}</h3>
        <p className="muted" style={{ margin: '4px 0 12px', fontSize: 13 }}>{L('O‘zgarish saqlangach darhol ishlaydi va jurnalga yoziladi.')}</p>
        {aiOff && <p className="notice" style={{ margin: '0 0 12px' }}><TriangleAlert size={15} />  {L('AI butunlay o‘chiq: «Platforma bo‘yicha kuniga AI so‘rovlari» 0 ga teng.')} <button type="button" className="linkbtn" onClick={() => setSec('safety')}>{L('Sozlash')}</button></p>}
        <div className="limit-tabs" role="tablist" aria-label={L('Bo‘lim')}>
          {SECTIONS.map((s) => { const d = dirtyIn(s); return <button key={s.id} type="button" role="tab" aria-selected={sec === s.id} className={sec === s.id ? 'on' : ''} onClick={() => setSec(s.id)}>{s.title}{d > 0 && <span className="dot">{d}</span>}</button>; })}
        </div>
      </section>
      {msg && <p className={msg.ok ? 'notice ok' : 'notice'} role="status">{msg.text}</p>}
      <section className="card">
        <h3 style={{ marginTop: 0, marginBottom: 2 }}>{cur.title}</h3>
        <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>{cur.note}</p>
        {plan.length > 0 && (
          <div className="table-scroll">
            <table className="data plan-matrix">
              <thead><tr><th>{L('AI baholash, oyiga')}</th><th>{L('Writing')}</th><th>{L('Speaking')}</th></tr></thead>
              <tbody>{PLAN_ROWS.map(([id, name]) => (
                <tr key={id}><td><b>{name}</b></td>{(['WRITING', 'SPEAKING'] as const).map((k) => { const it = byKey.get(`PLAN_${id}_${k}`); if (!it) return <td key={k} />; const v = draft[it.key] ?? String(it.value); return <td key={k} className={!isBad(it, v) && Number(v) !== it.value ? 'dirty' : ''}><div className="limit-input">{field(it, true)}{reset(it)}</div></td>; })}</tr>
              ))}</tbody>
            </table>
          </div>
        )}
        <div className="limit-rows">
          {cur.groups.map((g, gi) => {
            const rows = list.filter((x) => x.group === g && !isPlanCell(x.key));
            return [gi > 0 && rows.length ? <h4 key={`h-${g}`} className="limit-sub">{L('Creator (hamkor) dasturi')}</h4> : null, ...rows.map(row)];
          })}
        </div>
      </section>
      {(changed.length > 0 || invalid.length > 0) && (
        <div className="limit-savebar" role="region" aria-label={L('Saqlash')}>
          <span>{invalid.length ? L('Xato qiymat bor') : L('{0} ta o‘zgarish', [changed.length])}</span>
          <button type="button" className="btn sm" onClick={() => setDraft({})} disabled={busy}>{L('Bekor qilish')}</button>
          <button type="button" className="btn sm primary" disabled={busy || !changed.length || invalid.length > 0} onClick={() => void save(Object.fromEntries(changed.map(([k, v]) => [k, Number(v)])))}><Save size={15} /> {L('Saqlash')}</button>
        </div>
      )}
    </div>
  );
}
