// Profil: o'qituvchi bergan kod bilan guruhga qo'shilish (o'qituvchi faollikni ko'radi).
import { LogOut, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import { L } from '../i18n';

export function JoinGroupCard() {
  const acc = getAccount();
  const [code, setCode] = useState('');
  const [mine, setMine] = useState<{ id: number; name: string; teacher: string }[]>([]);
  const [msg, setMsg] = useState('');
  const call = async (method: string, path: string, body?: unknown) => {
    const r = await fetch(`/api/groups/${path}`, { method, headers: { 'x-token': acc?.token ?? '', 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status])); return j;
  };
  const load = () => void call('GET', 'mine').then((j) => setMine((j as { groups: typeof mine }).groups)).catch(() => undefined);
  useEffect(() => { if (acc) load(); }, [acc?.token]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!acc) return null;
  return (
    <section className="card">
      <h3 style={{ marginTop: 0 }}><Users size={18} style={{ verticalAlign: -3 }} /> {L('Guruhga qo‘shilish')}</h3>
      {mine.map((g) => <p key={g.id} className="row" style={{ justifyContent: 'space-between', margin: '4px 0' }}><span><b>{g.name}</b> <span className="muted">· {g.teacher}</span></span><button className="btn sm" onClick={async () => { await call('POST', 'leave', { id: g.id }).catch(() => undefined); load(); }}><LogOut size={14} /> {L('Chiqish')}</button></p>)}
      <form className="row" onSubmit={async (e) => { e.preventDefault(); try { const g = await call('POST', 'join', { code }) as { name: string }; setMsg(L('«{0}» guruhiga qo‘shildingiz.', [g.name])); setCode(''); load(); } catch (er) { setMsg((er as Error).message); } }}>
        <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} maxLength={6} placeholder={L('O‘qituvchi bergan kod')} style={{ flex: 1, minWidth: 140, letterSpacing: '.12em' }} />
        <button className="btn sm primary" disabled={code.trim().length !== 6}>{L('Qo‘shilish')}</button>
      </form>
      {msg && <p className="evidence">{msg}</p>}
    </section>
  );
}
