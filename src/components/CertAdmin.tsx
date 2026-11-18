// Admin: sertifikatlar (qidirish, bekor qilish), modul bo'yicha berish mezonlari, sertifikat sozlamalari va audit log.
import { Award, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAccount } from '../lib/account';
import type { CertView } from '../lib/certRender';
import { TYPE_UZ } from '../lib/certificates';
import { L } from '../i18n';

interface Rule { module: string; participation: boolean; achievement: boolean; minBand: number; minPercent: number; minAnsweredPct: number }
interface AuditRow { id: number; ts: number; action: string; target: string | null; detail: string | null; actor: string | null }
type Row = CertView & { nickname: string; revokeReason: string | null };
const MOD_UZ: Record<string, string> = { 'ielts-skill': L('IELTS formatidagi bo‘lim testi (Reading/Listening)'), 'ielts-full': L('To‘liq IELTS formatidagi imtihon'), cefr: L('CEFR formatidagi test') };

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const r = await fetch(`/api/certadmin/${path}`, { ...init, headers: { 'content-type': 'application/json', 'x-token': getAccount()?.token ?? '' } });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error((j as { error?: string }).error ?? L('Xato {0}', [r.status]));
  return j as T;
}

export function CertAdmin() {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState<Row[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [set, setSet] = useState<{ signerName: string; signerTitle: string } | null>(null);
  const [audit, setAudit] = useState<AuditRow[]>([]);
  const [msg, setMsg] = useState('');
  const search = () => api<{ certificates: Row[] }>(`list?q=${encodeURIComponent(q)}`).then((r) => setRows(r.certificates)).catch((e: Error) => setMsg(e.message));
  const loadAll = () => { void search(); void api<{ rules: Rule[] }>('rules').then((r) => setRules(r.rules)).catch(() => undefined); void api<{ signerName: string; signerTitle: string }>('settings').then(setSet).catch(() => undefined); void api<{ audit: AuditRow[] }>('audit?limit=50').then((r) => setAudit(r.audit)).catch(() => undefined); };
  useEffect(loadAll, []); // eslint-disable-line react-hooks/exhaustive-deps
  const revoke = async (id: string) => {
    const reason = window.prompt(L('Bekor qilish sababi (3–300 belgi):')) ?? '';
    if (!reason.trim()) return;
    try { await api('revoke', { method: 'POST', body: JSON.stringify({ id, reason }) }); setMsg(L('{0} bekor qilindi.', [id])); loadAll(); } catch (e) { setMsg((e as Error).message); }
  };
  const saveRule = async (r: Rule) => { try { const j = await api<{ rules: Rule[] }>('rules', { method: 'PUT', body: JSON.stringify(r) }); setRules(j.rules); setMsg(L('Mezon saqlandi.')); void api<{ audit: AuditRow[] }>('audit?limit=50').then((x) => setAudit(x.audit)); } catch (e) { setMsg((e as Error).message); } };
  const saveSet = async () => { if (!set) return; try { setSet(await api('settings', { method: 'PUT', body: JSON.stringify(set) })); setMsg(L('Sozlamalar saqlandi.')); } catch (e) { setMsg((e as Error).message); } };
  const upd = (i: number, patch: Partial<Rule>) => setRules((rs) => rs.map((r, k) => (k === i ? { ...r, ...patch } : r)));
  return (
    <section className="card cert-admin">
      <h3><Award size={18} />  {L('Sertifikatlar')}</h3>
      {msg && <p className="notice" role="status">{msg}</p>}
      <div className="row"><input type="search" value={q} placeholder={L('ID, ism yoki imtihon')} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void search(); }} /><button className="btn sm" onClick={() => void search()}><Search size={14} /> {L('Qidirish')}</button></div>
      <div className="table-scroll"><table className="data">
        <thead><tr><th>{L('ID')}</th><th>{L('Egasi')}</th><th>{L('Turi')}</th><th>{L('Imtihon')}</th><th>{L('Holati')}</th><th /></tr></thead>
        <tbody>{rows.map((c) => (
          <tr key={c.id}><td><a href={c.verifyUrl.replace(/^https?:\/\/[^/]+/, '')} target="_blank" rel="noreferrer">{c.id}</a></td><td>{c.data.name} <span className="muted">@{c.nickname}</span></td><td>{TYPE_UZ[c.type]}</td><td>{c.data.examName}</td>
            <td>{c.status === 'valid' ? L('Amalda') : <span title={c.revokeReason ?? ''}>{L('Bekor qilingan')}</span>}</td>
            <td>{c.status === 'valid' && <button className="btn sm danger" onClick={() => void revoke(c.id)}>{L('Bekor qilish')}</button>}</td></tr>
        ))}</tbody>
      </table></div>
      <h4>{L('Berish mezonlari')}</h4>
      {rules.map((r, i) => (
        <div key={r.module} className="cert-rule">
          <b>{MOD_UZ[r.module] ?? r.module}</b>
          <label><input type="checkbox" checked={r.participation} onChange={(e) => upd(i, { participation: e.target.checked })} /> {L('Ishtirok sertifikati')}</label>
          <label><input type="checkbox" checked={r.achievement} onChange={(e) => upd(i, { achievement: e.target.checked })} /> {L('Yutuq sertifikati')}</label>
          {r.module === 'cefr'
            ? <label>{L('Yutuq uchun minimal natija, %')} <input type="number" min={0} max={100} value={r.minPercent} onChange={(e) => upd(i, { minPercent: Number(e.target.value) })} /></label>
            : <label>{L('Yutuq uchun minimal band')} <input type="number" min={0} max={9} step={0.5} value={r.minBand} onChange={(e) => upd(i, { minBand: Number(e.target.value) })} /></label>}
          <label>{L('Javob berilgan savollar, kamida %')} <input type="number" min={0} max={100} value={r.minAnsweredPct} onChange={(e) => upd(i, { minAnsweredPct: Number(e.target.value) })} /></label>
          <button className="btn sm primary" onClick={() => void saveRule(r)}>{L('Saqlash')}</button>
        </div>
      ))}
      {set && <>
        <h4>{L('Sertifikat dizayni')}</h4>
        <div className="cert-rule">
          <label>{L('Imzo egasi')} <input type="text" maxLength={60} value={set.signerName} onChange={(e) => setSet({ ...set, signerName: e.target.value })} /></label>
          <label>{L('Lavozimi')} <input type="text" maxLength={60} value={set.signerTitle} onChange={(e) => setSet({ ...set, signerTitle: e.target.value })} /></label>
          <button className="btn sm primary" onClick={() => void saveSet()}>{L('Saqlash')}</button>
        </div>
      </>}
      <h4>{L('Audit log')}</h4>
      <div className="table-scroll"><table className="data">
        <thead><tr><th>{L('Vaqt')}</th><th>{L('Kim')}</th><th>{L('Amal')}</th><th>{L('Obyekt')}</th></tr></thead>
        <tbody>{audit.map((a) => <tr key={a.id}><td>{new Date(a.ts).toLocaleString('uz-UZ')}</td><td>{a.actor ?? 'admin-token'}</td><td>{a.action}</td><td>{a.target ?? '—'}</td></tr>)}</tbody>
      </table></div>
    </section>
  );
}
