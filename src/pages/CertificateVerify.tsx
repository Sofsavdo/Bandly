// Ommaviy tekshirish sahifasi: sellzen.uz/certificate/<ID> (QR-kod shu yerga olib keladi). Hisob talab qilinmaydi.
// Faqat sertifikatdagi ma'lumot ko'rsatiladi: ism, rasm, tur, imtihon, natijalar, sana, ID va holat.
import { BadgeCheck, ShieldX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Logo } from '../components/Logo';
import { TYPE_UZ, verifyCertificate } from '../lib/certificates';
import { TITLE, type CertView } from '../lib/certRender';
import { CertPreview } from './Certificates';
import { L } from '../i18n';

const SK: [keyof CertView['data']['skills'], string][] = [['listening', 'Listening'], ['reading', 'Reading'], ['writing', 'Writing'], ['speaking', 'Speaking']];

export default function CertificateVerify({ id }: { id: string }) {
  const [c, setC] = useState<CertView | null>(null);
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  useEffect(() => { document.title = `${id} — Sellzen`; void verifyCertificate(id).then(setC).catch((e: Error) => setErr(e.message)); }, [id]);
  return (
    <main className="container verify-page">
      <a href="/" className="verify-logo" aria-label={L('Sellzen')}><Logo size={40} /></a>
      {!c && !err && <p className="muted">{L('Tekshirilmoqda…')}</p>}
      {err && <section className="card verify-card bad"><ShieldX size={40} /><h1>{L('Sertifikat topilmadi')}</h1><p>{L('ID to‘g‘ri yozilganini tekshiring:')} <b>{id}</b></p></section>}
      {c && (
        <section className={`card verify-card ${c.status === 'valid' ? 'good' : 'bad'}`}>
          <div className="verify-status">{c.status === 'valid' ? <BadgeCheck size={34} /> : <ShieldX size={34} />}<b>{c.status === 'valid' ? L('Haqiqiy sertifikat') : c.status === 'expired' ? L('Muddati tugagan sertifikat') : L('Bekor qilingan sertifikat')}</b></div>
          {c.status === 'expired' && <p className="notice">{L('Sertifikat {0} gacha amal qilgan.', [new Date(c.validUntil).toLocaleDateString('uz-UZ')])}</p>}
          {c.status === 'revoked' && c.revokedAt && <p className="notice">{L('Bu sertifikat {0} sanada bekor qilingan.', [new Date(c.revokedAt).toLocaleDateString('uz-UZ')])}</p>}
          <div className="verify-body">
            <img className="verify-photo" src={c.photoUrl} alt="" />
            <div>
              <p className="eyebrow">{TITLE[c.type]}</p>
              <h1>{c.data.name}</h1>
              <p className="muted">{TYPE_UZ[c.type]}</p>
              <p><b>{c.data.examName}</b></p>
              <dl className="verify-dl">
                {SK.filter(([k]) => typeof c.data.skills[k] === 'number').map(([k, label]) => <div key={k}><dt>{label}</dt><dd>{c.data.skills[k]!.toFixed(1)}</dd></div>)}
                {typeof c.data.overall === 'number' && c.data.kind === 'full' && <div><dt>{L('Overall')}</dt><dd>{c.data.overall.toFixed(1)}</dd></div>}
                {c.data.module === 'cefr' && typeof c.data.percent === 'number' && <div><dt>{L('Natija')}</dt><dd>{c.data.percent}%</dd></div>}
                {c.data.cefr && (c.type === 'achievement' || c.data.module !== 'cefr') && <div><dt>{L('CEFR')}</dt><dd>{c.data.cefr}</dd></div>}
                <div><dt>{L('Imtihon sanasi')}</dt><dd>{c.data.testDate}</dd></div>
                <div><dt>{L('Berilgan sana')}</dt><dd>{new Date(c.issuedAt).toLocaleDateString('uz-UZ')}</dd></div>
                <div><dt>{L('Amal qiladi')}</dt><dd>{new Date(c.validUntil).toLocaleDateString('uz-UZ')}  {L('gacha')}</dd></div>
                <div><dt>{L('ID')}</dt><dd>{c.id}</dd></div>
              </dl>
              <button className="btn" onClick={() => setShow(true)}>{L('Sertifikatni ko‘rish')}</button>
            </div>
          </div>
        </section>
      )}
      {c && show && <CertPreview cert={c} onClose={() => setShow(false)} />}
    </main>
  );
}
