// Admin: o'z karta-to'lov moduli — rejim, kartalar (limit, yuklama), Telegram holati, sinov hisoboti (server/cardPayAdmin.ts).
import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtSum } from '../lib/pay';
import { L } from '../i18n';

interface Card { id: string; number: string; numberFmt: string; label: string; enabled: boolean; dailyLimit: number; monthlyLimit: number; priority: number; usedDay: number; usedMonth: number; reserved: number; full: boolean }
interface Notice { id: number; source: string; at: number; direction: string | null; amount: number | null; outcome: string | null; text: string }
interface Overview {
  config: { mode: string; strategy: string; reservePct: number; windowMin: number; sources: string[]; legacyCard: string };
  telegram: { configured: boolean; state: string; since: number; error: string; lastNoticeAt: number };
  cards: Card[]; notices: Notice[];
  shadow: { hamyonPaid: number; found: number; missed: string[]; wouldDeliver: number; wrong: string[] };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', 'content-type': 'application/json' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
  return j as T;
}

const inputStyle = { padding: 8, borderRadius: 10, border: '1.5px solid var(--line)', minWidth: 0 } as const;
const MODES: [string, string][] = [['off', L('O‘chiq')], ['capture', L('Yig‘ish: xabarlarni yozadi, obuna bermaydi')], ['shadow', L('Sinov: Hamyon bilan solishtiradi, obuna bermaydi')], ['live', L('Yoqilgan: yangi to‘lovlar bizning kartaga')]];
const TG: Record<string, string> = { disabled: L('o‘chiq'), connecting: L('ulanmoqda'), connected: L('ulangan'), standby: L('kutmoqda (boshqa nusxa ulangan)'), error: L('xato') };
const time = (ms: number): string => new Date(ms).toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const pct = (used: number, limit: number): number => (limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0);

function Usage({ label, used, reserved, limit }: { label: string; used: number; reserved: number; limit: number }) {
  return (
    <div style={{ fontSize: 12.5 }}>
      <span className="muted">{label}: </span><b>{fmtSum(used)}</b>{reserved > 0 && <span className="muted"> (+{fmtSum(reserved)} {L('band')})</span>}{limit > 0 ? <span className="muted"> / {fmtSum(limit)}</span> : <span className="muted"> · {L('cheklovsiz')}</span>}
      {limit > 0 && <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', marginTop: 3 }}><div style={{ width: `${pct(used + reserved, limit)}%`, height: '100%', borderRadius: 3, background: pct(used + reserved, limit) >= 90 ? 'var(--danger, #d33)' : 'var(--accent, #4a7dff)' }} /></div>}
    </div>
  );
}

function CardRow({ c, onSave, onDelete }: { c: Card; onSave: (id: string, body: Record<string, unknown>) => void; onDelete: (id: string) => void }) {
  const [d, setD] = useState({ label: c.label, dailyLimit: String(c.dailyLimit), monthlyLimit: String(c.monthlyLimit), priority: String(c.priority) });
  useEffect(() => setD({ label: c.label, dailyLimit: String(c.dailyLimit), monthlyLimit: String(c.monthlyLimit), priority: String(c.priority) }), [c]);
  const dirty = d.label !== c.label || d.dailyLimit !== String(c.dailyLimit) || d.monthlyLimit !== String(c.monthlyLimit) || d.priority !== String(c.priority);
  return (
    <div className="card" style={{ margin: '8px 0', opacity: c.enabled ? 1 : 0.6 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <b style={{ fontVariantNumeric: 'tabular-nums' }}>{c.numberFmt}</b>
        {c.full && <span className="badge">{L('To‘lgan')}</span>}
        <label style={{ marginLeft: 'auto', fontSize: 13 }}><input type="checkbox" checked={c.enabled} onChange={(e) => onSave(c.id, { enabled: e.target.checked })} /> {L('Yoqilgan')}</label>
        <button type="button" className="btn sm" onClick={() => { if (window.confirm(L('Karta o‘chirilsinmi?'))) onDelete(c.id); }} aria-label={L('O‘chirish')}><Trash2 size={15} /></button>
      </div>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', margin: '10px 0' }}>
        <Usage label={L('Bugun')} used={c.usedDay} reserved={c.reserved} limit={c.dailyLimit} />
        <Usage label={L('Shu oy')} used={c.usedMonth} reserved={c.reserved} limit={c.monthlyLimit} />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
        <label style={{ fontSize: 12.5 }}>{L('Nomi')}<br /><input style={{ ...inputStyle, width: 120 }} value={d.label} maxLength={40} onChange={(e) => setD({ ...d, label: e.target.value })} /></label>
        <label style={{ fontSize: 12.5 }}>{L('Kunlik limit')}<br /><input style={{ ...inputStyle, width: 120 }} inputMode="numeric" value={d.dailyLimit} onChange={(e) => setD({ ...d, dailyLimit: e.target.value })} /></label>
        <label style={{ fontSize: 12.5 }}>{L('Oylik limit')}<br /><input style={{ ...inputStyle, width: 130 }} inputMode="numeric" value={d.monthlyLimit} onChange={(e) => setD({ ...d, monthlyLimit: e.target.value })} /></label>
        <label style={{ fontSize: 12.5 }}>{L('Tartib')}<br /><input style={{ ...inputStyle, width: 70 }} inputMode="numeric" value={d.priority} onChange={(e) => setD({ ...d, priority: e.target.value })} /></label>
        <button type="button" className="btn sm primary" disabled={!dirty} onClick={() => onSave(c.id, { label: d.label, dailyLimit: Number(d.dailyLimit), monthlyLimit: Number(d.monthlyLimit), priority: Number(d.priority) })}><Save size={14} /> {L('Saqlash')}</button>
      </div>
    </div>
  );
}

export function OwnPayPanel() {
  const [ov, setOv] = useState<Overview | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [cfg, setCfg] = useState({ mode: 'off', strategy: 'spread', reservePct: '10', windowMin: '15' });
  const [nc, setNc] = useState({ number: '', label: '', dailyLimit: '', monthlyLimit: '' });
  const apply = (o: Overview): void => { setOv(o); setCfg({ mode: o.config.mode, strategy: o.config.strategy, reservePct: String(o.config.reservePct), windowMin: String(o.config.windowMin) }); };
  const run = async (path: string, method: string, body?: unknown, ok?: string): Promise<void> => {
    try { apply(await call<Overview>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) })); setMsg(ok ? { ok: true, text: ok } : null); } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
  };
  useEffect(() => { void call<Overview>('/api/admin/pay/own').then(apply).catch((e: Error) => setMsg({ ok: false, text: e.message })); }, []);
  useEffect(() => { const t = setInterval(() => { void call<Overview>('/api/admin/pay/own').then((o) => setOv(o)).catch(() => undefined); }, 15_000); return () => clearInterval(t); }, []);
  if (!ov) return <section className="card"><h3 style={{ marginTop: 0 }}>{L('O‘z karta-to‘lov (Hamyon’siz)')}</h3>{msg ? <p className="notice">{msg.text}</p> : <p className="muted">{L('Yuklanmoqda…')}</p>}</section>;
  const tg = ov.telegram;
  const tgText = !tg.configured ? L('sozlanmagan (Railway: TG_API_ID, TG_API_HASH, TG_SESSION)') : TG[tg.state] ?? tg.state;
  const cfgDirty = cfg.mode !== ov.config.mode || cfg.strategy !== ov.config.strategy || cfg.reservePct !== String(ov.config.reservePct) || cfg.windowMin !== String(ov.config.windowMin);
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('O‘z karta-to‘lov (Hamyon’siz)')}</h3>
      <p className="muted" style={{ marginTop: 0 }}>{L('Mijoz summani kartaga o‘tkazadi; Telegram’dagi karta-xabari botidan pul kelganini o‘qib, obuna avtomatik ochiladi. Karta limiti to‘lsa, boshqa karta ko‘rsatiladi.')}</p>
      {msg && <p className={msg.ok ? 'muted' : 'notice'} role="status">{msg.text}</p>}
      <p style={{ margin: '6px 0' }}><b>{'Telegram'}</b>{': '}{tgText}{tg.error && ` — ${tg.error}`} · <span className="muted">{L('Oxirgi xabar:')} {tg.lastNoticeAt ? time(tg.lastNoticeAt) : L('hali yo‘q')}</span></p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'end', margin: '10px 0' }}>
        <label style={{ fontSize: 13 }}>{L('Rejim')}<br /><select value={cfg.mode} onChange={(e) => setCfg({ ...cfg, mode: e.target.value })} style={inputStyle}>{MODES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></label>
        <label style={{ fontSize: 13 }}>{L('Karta tanlash usuli')}<br /><select value={cfg.strategy} onChange={(e) => setCfg({ ...cfg, strategy: e.target.value })} style={inputStyle}><option value="spread">{L('Barobar taqsimlash')}</option><option value="fill">{L('Birinchisi to‘lguncha')}</option></select></label>
        <label style={{ fontSize: 13 }}>{L('Limit zaxirasi, %')}<br /><input style={{ ...inputStyle, width: 70 }} inputMode="numeric" value={cfg.reservePct} onChange={(e) => setCfg({ ...cfg, reservePct: e.target.value })} /></label>
        <label style={{ fontSize: 13 }}>{L('To‘lov oynasi, daqiqa')}<br /><input style={{ ...inputStyle, width: 70 }} inputMode="numeric" value={cfg.windowMin} onChange={(e) => setCfg({ ...cfg, windowMin: e.target.value })} /></label>
        <button type="button" className="btn sm primary" disabled={!cfgDirty} onClick={() => { void run('/api/admin/pay/own/config', 'PUT', { mode: cfg.mode, strategy: cfg.strategy, reservePct: Number(cfg.reservePct), windowMin: Number(cfg.windowMin) }, L('Saqlandi.')); }}><Save size={14} /> {L('Saqlash')}</button>
      </div>
      <p className="muted" style={{ fontSize: 12.5 }}>{L('Zaxira: kartaga boshqa tushumlar ham kelishi mumkin, shuning uchun limitning oxirigacha olib borilmaydi. Limit 0 — cheklovsiz.')}</p>

      <h4 style={{ marginBottom: 4 }}>{L('Kartalar')}</h4>
      {ov.cards.length === 0 && <p className="muted">{ov.config.legacyCard ? L('Havzada karta yo‘q: Railway’dagi karta ishlatiladi ({0}), limitsiz.', [ov.config.legacyCard]) : L('Hali karta yo‘q.')}</p>}
      {ov.cards.map((c) => <CardRow key={c.id} c={c} onSave={(id, b) => { void run(`/api/admin/pay/cards/${id}`, 'PUT', b, L('Saqlandi.')); }} onDelete={(id) => { void run(`/api/admin/pay/cards/${id}`, 'DELETE'); }} />)}
      <form onSubmit={(e) => { e.preventDefault(); void run('/api/admin/pay/cards', 'POST', { number: nc.number, label: nc.label, dailyLimit: Number(nc.dailyLimit || 0), monthlyLimit: Number(nc.monthlyLimit || 0) }, L('Karta qo‘shildi.')).then(() => setNc({ number: '', label: '', dailyLimit: '', monthlyLimit: '' })); }} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end', marginTop: 10 }}>
        <label style={{ fontSize: 12.5 }}>{L('Karta raqami')}<br /><input style={{ ...inputStyle, width: 190 }} inputMode="numeric" value={nc.number} onChange={(e) => setNc({ ...nc, number: e.target.value })} placeholder="8600 0000 0000 0000" /></label>
        <label style={{ fontSize: 12.5 }}>{L('Nomi')}<br /><input style={{ ...inputStyle, width: 110 }} value={nc.label} maxLength={40} onChange={(e) => setNc({ ...nc, label: e.target.value })} /></label>
        <label style={{ fontSize: 12.5 }}>{L('Kunlik limit')}<br /><input style={{ ...inputStyle, width: 120 }} inputMode="numeric" value={nc.dailyLimit} onChange={(e) => setNc({ ...nc, dailyLimit: e.target.value })} placeholder="0" /></label>
        <label style={{ fontSize: 12.5 }}>{L('Oylik limit')}<br /><input style={{ ...inputStyle, width: 130 }} inputMode="numeric" value={nc.monthlyLimit} onChange={(e) => setNc({ ...nc, monthlyLimit: e.target.value })} placeholder="0" /></label>
        <button type="submit" className="btn sm primary" disabled={nc.number.replace(/\D/g, '').length !== 16}><Plus size={14} /> {L('Qo‘shish')}</button>
      </form>

      <details style={{ marginTop: 14 }}>
        <summary>{L('Sinov hisoboti (7 kun) va so‘nggi xabarlar')}</summary>
        <p style={{ margin: '8px 0' }}>{L('Hamyon yetkazgan: {0} · biz ham topgan bo‘lardik: {1} · topolmaganimiz: {2} · Hamyon yetkazmagan, biz yetkazardik: {3}', [ov.shadow.hamyonPaid, ov.shadow.found, ov.shadow.missed.length, ov.shadow.wrong.length])}</p>
        {ov.notices.length === 0 ? <p className="muted">{L('Hali xabar kelmagan.')}</p> : (
          <div className="table-scroll"><table className="data"><thead><tr><th>{L('Sana')}</th><th>{L('Summa')}</th><th>{L('Holat')}</th><th>{L('Xabar')}</th></tr></thead>
            <tbody>{ov.notices.map((n) => <tr key={n.id}><td><small>{time(n.at)}</small></td><td>{n.amount === null ? '—' : fmtSum(n.amount)}</td><td><small>{n.direction ?? ''} {n.outcome ?? ''}</small></td><td><small>{n.text.slice(0, 120)}</small></td></tr>)}</tbody></table></div>
        )}
      </details>
    </section>
  );
}
