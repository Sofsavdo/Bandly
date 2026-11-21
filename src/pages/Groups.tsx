// O'qituvchi kabineti (B2B): guruhlar, qo'shilish kodi, har bir o'quvchining faolligi.
import { ArrowLeft, Copy, Plus, Trash2, UserMinus, Users } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { L } from '../i18n';

interface G { id: number; name: string; code: string; members: number; active7: number }
interface M { id: number; nickname: string; level: string | null; streak: number; xp7: number; lessons: number; lessons7: number; lastMock: { title: string; correct: number; total: number; band: number | null } | null; lastActive: number | null }

async function api<T>(method: string, path: string, body?: unknown): Promise<T> {
  const r = await fetch(`/api/groups${path}`, { method, headers: { 'x-token': getAccount()?.token ?? '', ...(body ? { 'content-type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
  return j as T;
}
const ago = (t: number | null) => { if (!t) return '—'; const d = Math.floor((Date.now() - t) / 86_400_000); return d <= 0 ? L('bugun') : L('{0} kun oldin', [d]); };

export default function Groups() {
  const [groups, setGroups] = useState<G[] | null>(null);
  const [open, setOpen] = useState<{ id: number; name: string; code: string; members: M[] } | null>(null);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const load = useCallback(async () => { try { setGroups((await api<{ groups: G[] }>('GET', '')).groups); } catch (e) { setMsg((e as Error).message); } }, []);
  useEffect(() => { void load(); }, [load]);
  const view = async (id: number) => { try { setOpen(await api('GET', `/${id}`)); } catch (e) { setMsg((e as Error).message); } };

  if (open) return (
    <div>
      <button className="btn sm" onClick={() => { setOpen(null); void load(); }}><ArrowLeft size={14} /> {L('Guruhlar')}</button>
      <section className="card page-head t-mint" style={{ marginTop: 10 }}>
        <h2 style={{ margin: 0 }}>{open.name}</h2>
        <p style={{ margin: '6px 0 0' }}>{L('Qo‘shilish kodi:')} <b className="gcode">{open.code}</b> <button className="icon-btn sm" aria-label={L('Nusxalash')} onClick={() => void navigator.clipboard?.writeText(open.code)}><Copy size={14} /></button></p>
        <p className="muted" style={{ margin: '4px 0 0' }}>{L('O‘quvchilar: Profil → «Guruhga qo‘shilish» bo‘limiga shu kodni yozadi.')}</p>
      </section>
      {open.members.length === 0 ? <p className="card muted">{L('Hali o‘quvchi qo‘shilmagan.')}</p> : (
        <section className="card" style={{ overflowX: 'auto' }}>
          <div className="table-scroll"><table className="data">
            <thead><tr><th>{L('O‘quvchi')}</th><th>{L('Daraja')}</th><th>{L('Seriya')}</th><th>{L('XP (7 kun)')}</th><th>{L('Darslar')}</th><th>{L('Oxirgi mock')}</th><th>{L('Faollik')}</th><th /></tr></thead>
            <tbody>{open.members.map((m) => (
              <tr key={m.id} className={m.xp7 === 0 ? 'idle' : ''}>
                <td><b>{m.nickname}</b></td><td>{m.level ?? '—'}</td><td>{m.streak}</td><td>{m.xp7}</td>
                <td>{m.lessons}{m.lessons7 ? <small className="ok"> +{m.lessons7}</small> : null}</td>
                <td>{m.lastMock ? `${m.lastMock.correct}/${m.lastMock.total}${m.lastMock.band !== null ? ` · ${m.lastMock.band.toFixed(1)}` : ''}` : '—'}</td>
                <td>{ago(m.lastActive)}</td>
                <td><button className="icon-btn sm" aria-label={L('Guruhdan chiqarish')} onClick={async () => { if (!confirm(L('{0} guruhdan chiqarilsinmi?', [m.nickname]))) return; await api('DELETE', `/${open.id}/members/${m.id}`).catch(() => undefined); await view(open.id); }}><UserMinus size={14} /></button></td>
              </tr>
            ))}</tbody>
          </table></div>
          <p className="muted" style={{ marginBottom: 0 }}>{L('7 kun ichida faol bo‘lmaganlar xira ko‘rsatiladi.')}</p>
        </section>
      )}
    </div>
  );

  return (
    <div>
      <section className="card page-head t-mint">
        <h2 style={{ margin: 0 }}><Users size={22} style={{ verticalAlign: -3 }} /> {L('Guruhlarim')}</h2>
        <p style={{ margin: '6px 0 12px' }}>{L('Guruh oching, kodni o‘quvchilarga bering va ularning faolligini kuzating.')}</p>
        <form className="row" onSubmit={async (e) => { e.preventDefault(); try { await api('POST', '', { name }); setName(''); await load(); } catch (er) { setMsg((er as Error).message); } }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={L('Guruh nomi, masalan: 9-B IELTS')} style={{ flex: 1, minWidth: 180 }} />
          <button className="btn primary" disabled={name.trim().length < 2}><Plus size={16} /> {L('Guruh ochish')}</button>
        </form>
        {msg && <p className="notice">{msg}</p>}
      </section>
      <div className="lrows">
        {groups?.map((g) => (
          <div key={g.id} className="lrow">
            <span className="sq mint"><Users /></span>
            <button type="button" className="grow" style={{ all: 'unset', cursor: 'pointer', flex: 1 }} onClick={() => void view(g.id)}>
              <small>{L('Kod: {0}', [g.code])}</small><b>{g.name}</b>
            </button>
            <span className="meta">{L('{0} o‘quvchi', [g.members])}<br />{L('faol: {0}', [g.active7])}</span>
            <button className="icon-btn sm" aria-label={L('Guruhni yopish')} onClick={async () => { if (!confirm(L('«{0}» guruhi yopilsinmi?', [g.name]))) return; await api('DELETE', `/${g.id}`).catch(() => undefined); await load(); }}><Trash2 size={14} /></button>
          </div>
        ))}
        {groups && groups.length === 0 && <p className="muted">{L('Hali guruh yo‘q.')}</p>}
      </div>
    </div>
  );
}
