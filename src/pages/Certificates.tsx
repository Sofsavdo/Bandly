// Sertifikatlarim: olingan sertifikatlar, ko'rish, PDF/PNG yuklab olish, tekshirish havolasini nusxalash.
import { Award, Copy, Download, Eye, FileText, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CertProfileCard } from '../components/CertProfileCard';
import { claimCertificates, myCertificates, TYPE_UZ, type CertProfile } from '../lib/certificates';
import { downloadPdf, downloadPng, previewUrl, type CertView } from '../lib/certRender';
import { L } from '../i18n';

const result = (c: CertView): string => {
  const d = c.data;
  const sk = (['listening', 'reading', 'writing', 'speaking'] as const).filter((k) => typeof d.skills[k] === 'number').map((k) => `${k[0]!.toUpperCase()} ${d.skills[k]!.toFixed(1)}`).join(' · ');
  if (typeof d.overall === 'number') return `${sk ? `${sk} · ` : ''}Overall ${d.overall.toFixed(1)}${d.cefr ? ` · ${d.cefr}` : ''}`;
  if (typeof d.percent === 'number') return `${d.percent}%${d.cefr && c.type === 'achievement' ? ` · ${d.cefr}` : ''}`;
  return '—';
};

export function CertPreview({ cert, onClose }: { cert: CertView; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { let u = ''; void previewUrl(cert).then((x) => { u = x; setUrl(x); }); return () => { if (u) URL.revokeObjectURL(u); }; }, [cert]);
  return (
    <>
      <div className="drawer-back" style={{ zIndex: 70 }} onClick={onClose} />
      <div className="modal card cert-modal" role="dialog" aria-modal="true" aria-label={L('Sertifikat')}>
        <div className="row" style={{ justifyContent: 'space-between' }}><b>{cert.id}</b><button className="icon-btn" aria-label={L('Yopish')} onClick={onClose}><X size={18} /></button></div>
        {url ? <img className="cert-img" src={url} alt={L('Sertifikat {0}', [cert.id])} /> : <p className="muted">{L('Tayyorlanmoqda…')}</p>}
      </div>
    </>
  );
}

export default function Certificates() {
  const [list, setList] = useState<CertView[] | null>(null);
  const [profile, setProfile] = useState<CertProfile | null>(null);
  const [err, setErr] = useState('');
  const [open, setOpen] = useState<CertView | null>(null);
  const [busy, setBusy] = useState('');
  const [copied, setCopied] = useState('');
  const load = () => myCertificates().then((r) => { setList(r.certificates); setProfile(r.profile); }).catch((e: Error) => setErr(e.message));
  useEffect(() => { void load(); }, []);
  const ready = !!profile?.fullName && !!profile?.photoUrl;
  const onProfile = async (p: CertProfile) => { setProfile(p); if (p.fullName && p.photoUrl) { try { const r = await claimCertificates(); setList(r.certificates); } catch (e) { setErr((e as Error).message); } } };
  const act = async (id: string, f: () => Promise<void>) => { setBusy(id); try { await f(); } catch (e) { setErr((e as Error).message); } finally { setBusy(''); } };
  return (
    <div>
      <section className="card page-head">
        <h2 style={{ margin: 0 }}><Award size={22} />  {L('Sertifikatlarim')}</h2>
        <p style={{ margin: '6px 0 0' }}>{L('Sertifikat to‘liq imtihon uchun beriladi: Listening, Reading, Writing va Speaking bo‘yicha ballar hamda Overall ko‘rsatiladi. 1 yil amal qiladi.')} <a href="#/mocks/full">{L('To‘liq imtihonni boshlash')}</a></p>
      </section>
      {profile && !ready && <p className="notice">{L('Sertifikat olish uchun to‘liq ismingiz va o‘zingizning haqiqiy rasmingizni (yuzingiz aniq ko‘rinadigan) profilga yuklang. Sertifikatga shu rasm qo‘yiladi.')}</p>}
      {profile && (!ready || list?.length === 0) && <CertProfileCard onChange={(p) => void onProfile(p)} />}
      {err && <p className="notice" role="alert">{err}</p>}
      {list === null && !err && <p className="muted">{L('Yuklanmoqda…')}</p>}
      {list && list.length === 0 && <div className="card"><p style={{ margin: 0 }}>{L('Hozircha sertifikat yo‘q.')} <a href="#/mocks/full">{L('To‘liq imtihonni topshiring')}</a></p></div>}
      {list && list.length > 0 && (
        <ul className="cert-list">
          {list.map((c) => (
            <li key={c.id} className={`cert-row ${c.type} ${c.status}`}>
              <div className="cert-main">
                <span className={`badge ${c.type === 'achievement' ? 'on' : ''}`}>{TYPE_UZ[c.type]}</span>
                {c.status === 'revoked' && <span className="badge danger">{L('Bekor qilingan')}</span>}
                {c.status === 'expired' && <span className="badge danger">{L('Muddati tugagan')}</span>}
                <b className="cert-exam">{c.data.examName}</b>
                <span className="cert-score">{result(c)}</span>
                <span className="muted cert-meta">{new Date(c.issuedAt).toLocaleDateString('uz-UZ')} — {new Date(c.validUntil).toLocaleDateString('uz-UZ')} · {c.id}</span>
              </div>
              <div className="cert-actions">
                <button className="btn sm" onClick={() => setOpen(c)}><Eye size={14} /> {L('Ko‘rish')}</button>
                <button className="btn sm" disabled={busy === c.id} onClick={() => void act(c.id, () => downloadPdf(c))}><FileText size={14} />  {L('PDF')}</button>
                <button className="btn sm" disabled={busy === c.id} onClick={() => void act(c.id, () => downloadPng(c))}><Download size={14} />  {L('PNG')}</button>
                <button className="btn sm" onClick={async () => { await navigator.clipboard.writeText(c.verifyUrl).catch(() => {}); setCopied(c.id); setTimeout(() => setCopied(''), 1800); }}><Copy size={14} /> {copied === c.id ? L('Nusxalandi') : L('Havola')}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {open && <CertPreview cert={open} onClose={() => setOpen(null)} />}
    </div>
  );
}
