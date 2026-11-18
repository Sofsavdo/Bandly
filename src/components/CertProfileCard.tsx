// Sertifikat uchun profil: to'liq ism va profil rasmi (ikkalasi ham shart). Profil va Sertifikatlarim sahifalarida.
import { Camera, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { certProfile, saveFullName, uploadPhoto, type CertProfile } from '../lib/certificates';
import { L } from '../i18n';

export function CertProfileCard({ onChange }: { onChange?: (p: CertProfile) => void }) {
  const [p, setP] = useState<CertProfile | null>(null);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => { void certProfile().then((x) => { setP(x); setName(x.fullName ?? ''); }).catch(() => setP({ fullName: null, photoUrl: null })); }, []);
  const done = (x: CertProfile) => { setP(x); onChange?.(x); };
  const onFile = async (f: File | undefined) => {
    if (!f) return; setBusy(true); setMsg('');
    try { done(await uploadPhoto(f)); setMsg(L('Rasm saqlandi.')); } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); if (file.current) file.current.value = ''; }
  };
  const onName = async () => {
    setBusy(true); setMsg('');
    try { done(await saveFullName(name)); setMsg(L('Ism saqlandi.')); } catch (e) { setMsg((e as Error).message); } finally { setBusy(false); }
  };
  if (!p) return null;
  return (
    <section className="card cert-profile" id="cert-profile">
      <h3>{L('Sertifikat uchun ma’lumot')}</h3>
      <div className="cert-profile-row">
        <button type="button" className="cert-photo" onClick={() => file.current?.click()} disabled={busy} aria-label={L('Profil rasmini yuklash')}>
          {p.photoUrl ? <img src={p.photoUrl} alt="" /> : <Camera size={28} />}
        </button>
        <div className="cert-profile-fields">
          <label htmlFor="cert-name" className="muted">{L('Ism va familiya (sertifikatda shunday yoziladi)')}</label>
          <div className="row">
            <input id="cert-name" type="text" value={name} maxLength={60} placeholder={L('Aziza Karimova')} onChange={(e) => setName(e.target.value)} />
            <button className="btn sm primary" disabled={busy || name.trim() === (p.fullName ?? '') || name.trim().length < 3} onClick={() => void onName()}>{L('Saqlash')}</button>
          </div>
          <button type="button" className="btn sm" onClick={() => file.current?.click()} disabled={busy}><Camera size={14} /> {p.photoUrl ? L('Rasmni almashtirish') : L('Profil rasmini yuklash')}</button>
          <input ref={file} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        </div>
      </div>
      <p className="muted cert-req">
        <span className={p.fullName ? 'ok' : ''}>{p.fullName ? <Check size={14} /> : '•'} {L('To‘liq ism')}</span>
        <span className={p.photoUrl ? 'ok' : ''}>{p.photoUrl ? <Check size={14} /> : '•'} {L('Yuz aniq ko‘rinadigan rasm (JPG, PNG, WebP)')}</span>
      </p>
      {msg && <p className="notice" role="status">{msg}</p>}
    </section>
  );
}
