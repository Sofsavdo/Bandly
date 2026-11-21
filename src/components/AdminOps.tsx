// Admin kabinetining ish bo'limlari: foydalanuvchini topish va qo'lda obuna berish, so'nggi to'lovlar, xodimlar (rollar).
import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { fmtDate, fmtSum } from '../lib/pay';
import { L } from '../i18n';

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, { ...init, headers: { 'x-token': getAccount()?.token ?? '', 'content-type': 'application/json' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
  return j as T;
}
const TRACK_UZ: Record<string, string> = { exam: L('Imtihon'), grammar: 'General English', mocks: L('Mock'), general: 'General English', all: 'All Access' };
const STATUS_UZ: Record<string, string> = { success: L('to‘langan'), pending: L('kutilmoqda'), prepared: L('kutilmoqda'), cancel: L('bekor'), cancelled: L('bekor'), expired: L('muddati o‘tgan'), error: L('xato') };
const inputStyle = { padding: 8, borderRadius: 10, border: '1.5px solid var(--line)', minWidth: 0 } as const;

interface User { id: number; nickname: string; xp: number; streak: number; role: string | null; createdAt: number; updatedAt: number; subs: { track: string; until: number }[]; paidCount: number; paidSum: number; lastPaidAt: number | null }

/** Qo'llab-quvvatlash: laqab bo'yicha topish, obunalarni ko'rish va qo'lda obuna berish (to'lov kelmay qolgan hollar, sovg'a, hamkorlar). */
export function UsersPanel() {
  const [q, setQ] = useState('');
  const [users, setUsers] = useState<User[] | null>(null);
  const [msg, setMsg] = useState('');
  const [plan, setPlan] = useState('all');
  const [days, setDays] = useState(30);
  const search = async () => { try { setUsers((await call<{ users: User[] }>(`/api/staff/users?q=${encodeURIComponent(q.trim())}`)).users); setMsg(''); } catch (e) { setMsg((e as Error).message); } };
  useEffect(() => { void search(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const give = async (nickname: string) => {
    if (!window.confirm(L('{0} ga {1} — {2} kun obuna berilsinmi?', [nickname, TRACK_UZ[plan]!, days]))) return;
    try { const r = await call<{ until: number }>('/api/staff/grant', { method: 'POST', body: JSON.stringify({ nickname, track: plan, days }) }); setMsg(L('{0}: obuna {1} gacha.', [nickname, fmtDate(r.until)])); await search(); } catch (e) { setMsg((e as Error).message); }
  };
  const now = Date.now();
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('Foydalanuvchilar')}</h3>
      <form className="row" onSubmit={(e) => { e.preventDefault(); void search(); }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L('Laqab bo‘yicha qidirish')} aria-label={L('Laqab bo‘yicha qidirish')} style={{ ...inputStyle, flex: '1 1 160px' }} />
        <button className="btn sm primary" type="submit"><Search size={15} /> {L('Qidirish')}</button>
      </form>
      <div className="row" style={{ marginTop: 10 }}>
        <span className="muted" style={{ fontSize: 13 }}>{L('Qo‘lda obuna:')}</span>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} aria-label={L('Tarif')}>{['all', 'general', 'exam'].map((t) => <option key={t} value={t}>{TRACK_UZ[t]}</option>)}</select>
        <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label={L('Muddat')}>{[7, 30, 90, 365].map((d) => <option key={d} value={d}>{L('{0} kun', [d])}</option>)}</select>
      </div>
      {msg && <p className="notice" role="status">{msg}</p>}
      {users && (users.length === 0 ? <p className="muted">{L('Topilmadi.')}</p> : (
        <div className="table-scroll"><table className="data"><thead><tr><th>{L('Laqab')}</th><th>{L('XP')}</th><th>{L('Obuna')}</th><th>{L('To‘lovlar')}</th><th>{L('Oxirgi faollik')}</th><th /></tr></thead>
          <tbody>{users.map((u) => {
            const active = u.subs.filter((s) => s.until > now);
            return (
              <tr key={u.id}>
                <td><b>{u.nickname}</b>{u.role && <small className="muted"> · {u.role}</small>}<br /><small className="muted">{fmtDate(u.createdAt)}</small></td>
                <td>{u.xp}<br /><small className="muted">🔥 {u.streak}</small></td>
                <td>{active.length ? active.map((s) => <div key={s.track}><small>{TRACK_UZ[s.track] ?? s.track}: {fmtDate(s.until)}</small></div>) : <small className="muted">{L('Bepul')}</small>}</td>
                <td>{u.paidCount ? <>{u.paidCount} · {fmtSum(u.paidSum)}</> : '—'}</td>
                <td><small>{fmtDate(u.updatedAt)}</small></td>
                <td><button className="btn sm" onClick={() => void give(u.nickname)}>{L('Obuna berish')}</button></td>
              </tr>
            );
          })}</tbody></table></div>
      ))}
    </section>
  );
}

interface Payment { id: string; nickname: string; track: string; days: number; amount: number; hamyon_amount: number | null; status: string; note: string | null; error: string | null; created_at: number; paid_at: number | null }

/** So'nggi 100 ta to'lov: holati, summasi, xatosi — to'lov bilan bog'liq murojaatlarni tez tekshirish uchun. */
export function PaymentsPanel() {
  const [list, setList] = useState<Payment[] | null>(null);
  const [msg, setMsg] = useState('');
  useEffect(() => { void call<{ payments: Payment[] }>('/api/staff/payments').then((j) => setList(j.payments)).catch((e: Error) => setMsg(e.message)); }, []);
  const paid = (list ?? []).filter((p) => p.status === 'success');
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('To‘lovlar (so‘nggi 100)')}</h3>
      {msg && <p className="notice">{msg}</p>}
      {list && <p className="muted">{L('To‘langan: {0} ta · {1} so‘m', [paid.length, fmtSum(paid.reduce((s, p) => s + (p.hamyon_amount ?? p.amount), 0))])}</p>}
      {list && (list.length === 0 ? <p className="muted">{L('Hali to‘lov yo‘q.')}</p> : (
        <div className="table-scroll"><table className="data"><thead><tr><th>{L('Sana')}</th><th>{L('Laqab')}</th><th>{L('Tarif')}</th><th>{L('Summa')}</th><th>{L('Holat')}</th></tr></thead>
          <tbody>{list.map((p) => <tr key={p.id}><td><small>{fmtDate(p.created_at)}</small></td><td>{p.nickname}</td><td>{TRACK_UZ[p.track] ?? p.track} · {p.days} {L('kun')}</td><td>{fmtSum(p.hamyon_amount ?? p.amount)}</td><td><span className={`badge${p.status === 'success' ? ' on' : ''}`}>{STATUS_UZ[p.status] ?? p.status}</span>{p.error && <><br /><small className="muted">{p.error}</small></>}</td></tr>)}</tbody></table></div>
      ))}
    </section>
  );
}

/** Xodimlar: metodist, hamkor (bloger), o'qituvchi rollarini laqab bo'yicha berish / olib tashlash. */
const ROLE_UZ: Record<string, string> = { admin: 'admin', methodologist: L('metodist'), creator: L('hamkor (bloger)'), teacher: L('o‘qituvchi'), sales: L('operator (sotuv)') };
export function StaffPanel() {
  const [list, setList] = useState<{ nickname: string; role: string }[]>([]);
  const [nick, setNick] = useState('');
  const [kind, setKind] = useState<'methodologist' | 'creator' | 'teacher' | 'sales'>('methodologist');
  const [msg, setMsg] = useState('');
  const load = async () => { try { setList((await call<{ staff: { nickname: string; role: string }[] }>('/api/staff')).staff); } catch (e) { setMsg((e as Error).message); } };
  useEffect(() => { void load(); }, []);
  const setRole = async (nickname: string, on: boolean) => { try { await call('/api/staff/role', { method: 'POST', body: JSON.stringify({ nickname, role: on ? kind : null }) }); setNick(''); setMsg(on ? L('{0} — {1}.', [nickname, ROLE_UZ[kind]!]) : L('{0} — rol olib tashlandi.', [nickname])); await load(); } catch (e) { setMsg((e as Error).message); } };
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}>{L('Xodimlar')}</h3>
      <p className="muted" style={{ fontSize: 13 }}>{L('Xodim avval saytda hisob ochadi, so‘ng rolni tanlab, laqabini yozing. Metodist — darslar, hamkor — referal, o‘qituvchi — guruhlar, operator — lidlar.')}</p>
      <div className="row"><select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} aria-label={L('Rol')}>{(['methodologist', 'creator', 'teacher', 'sales'] as const).map((r) => <option key={r} value={r}>{ROLE_UZ[r]}</option>)}</select><input value={nick} onChange={(e) => setNick(e.target.value)} placeholder={L('Laqab')} aria-label={L('Laqab')} style={inputStyle} /><button className="btn sm primary" disabled={nick.trim().length < 2} onClick={() => void setRole(nick.trim(), true)}>{L('Rol berish')}</button></div>
      <ul>{list.map((x) => <li key={x.nickname}>{x.nickname} — {ROLE_UZ[x.role] ?? x.role} {x.role !== 'admin' && <button className="btn sm" onClick={() => void setRole(x.nickname, false)}>{L('Olib tashlash')}</button>}</li>)}</ul>
      {msg && <p className="notice">{msg}</p>}
    </section>
  );
}

interface Lead { playerId: number; nickname: string; phone: string; source: string; goal: string | null; level: string | null; minutes: number | null; status: string; note: string | null; handledBy: string | null; signedUpAt: number; lastActiveAt: number; xp: number; subscribedUntil: number | null; paidCount: number; createdAt: number }
const LEAD_UZ: Record<string, string> = { new: L('yangi'), called: L('qo‘ng‘iroq qilindi'), no_answer: L('javob bermadi'), interested: L('qiziqdi'), paid: L('obuna oldi'), declined: L('rad etdi') };
const GOAL_UZ: Record<string, string> = { general: L('Umumiy ingliz tili'), ielts: 'IELTS', cefr: 'CEFR', sat: 'SAT', speaking: L('Gapirish'), work: L('Ish'), travel: L('Sayohat'), school: L('Maktab') };

/** Lidlar (operator / admin): rozilik bilan qoldirilgan raqamlar, maqsad va daraja, obuna holati; holat va izoh; CSV. */
export function LeadsPanel() {
  const [list, setList] = useState<Lead[] | null>(null);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const load = async () => { try { setList((await call<{ leads: Lead[] }>(`/api/staff/leads${filter ? `?status=${filter}` : ''}`)).leads); } catch (e) { setMsg((e as Error).message); } };
  useEffect(() => { void load(); }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const set = async (l: Lead, patch: { status?: string; note?: string }) => { try { await call('/api/staff/leads', { method: 'POST', body: JSON.stringify({ playerId: l.playerId, ...patch }) }); await load(); } catch (e) { setMsg((e as Error).message); } };
  const csv = () => {
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['nickname', 'phone', 'goal', 'level', 'minutes', 'status', 'note', 'signed_up', 'last_active', 'xp', 'subscribed_until', 'payments'];
    const rows = (list ?? []).map((l) => [l.nickname, l.phone, l.goal, l.level, l.minutes, l.status, l.note, new Date(l.signedUpAt).toISOString(), new Date(l.lastActiveAt).toISOString(), l.xp, l.subscribedUntil ? new Date(l.subscribedUntil).toISOString() : '', l.paidCount].map(esc).join(','));
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([[head.join(','), ...rows].join('\n')], { type: 'text/csv' })); a.download = `sellzen-leads-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };
  const now = Date.now();
  return (
    <section className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <h3 style={{ margin: 0 }}>{L('Lidlar')} {list && <span className="pill">{list.length}</span>}</h3>
        <div className="row">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label={L('Holat')}><option value="">{L('Hammasi')}</option>{Object.entries(LEAD_UZ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <button className="btn sm" onClick={csv} disabled={!list?.length}>{L('CSV')}</button>
        </div>
      </div>
      {msg && <p className="notice">{msg}</p>}
      {list && (list.length === 0 ? <p className="muted">{L('Hali lid yo‘q.')}</p> : (
        <div className="table-scroll"><table className="data wrap"><thead><tr><th>{L('O‘quvchi')}</th><th>{L('Telefon')}</th><th>{L('Maqsad')}</th><th>{L('Holat')}</th><th>{L('Izoh')}</th></tr></thead>
          <tbody>{list.map((l) => (
            <tr key={l.playerId}>
              <td><b>{l.nickname}</b><br /><small className="muted">{fmtDate(l.signedUpAt)} · {l.xp} {L('XP')}{l.subscribedUntil && l.subscribedUntil > now ? ` · ${L('obuna')} ${fmtDate(l.subscribedUntil)}` : ''}</small></td>
              <td><a href={`tel:${l.phone}`}>{l.phone}</a>{l.source === 'telegram' && <><br /><small className="muted">{L('Telegram ✓')}</small></>}</td>
              <td>{l.goal ? GOAL_UZ[l.goal] ?? l.goal : '—'}{l.level && ` · ${l.level}`}{l.minutes && <><br /><small className="muted">{L('{0} daq/kun', [l.minutes])}</small></>}</td>
              <td><select value={l.status} onChange={(e) => void set(l, { status: e.target.value })} aria-label={L('Holat')}>{Object.entries(LEAD_UZ).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>{l.handledBy && <><br /><small className="muted">{l.handledBy}</small></>}</td>
              <td><input defaultValue={l.note ?? ''} placeholder={L('Izoh')} onBlur={(e) => { if (e.target.value !== (l.note ?? '')) void set(l, { note: e.target.value }); }} style={{ ...inputStyle, width: '100%' }} /></td>
            </tr>
          ))}</tbody></table></div>
      ))}
    </section>
  );
}
