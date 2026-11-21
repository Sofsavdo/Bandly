// Test natijasidan keyin: berilgan sertifikatlar yoki sertifikat olish uchun nima yetishmasligi.
import { Award } from 'lucide-react';
import { L } from '../i18n';

export function CertNotice({ issued, missing }: { issued: { id: string; type: string }[]; missing: string[] }) {
  if (issued.length) return (
    <p className="notice cert-notice"><Award size={16} />  {issued.some((c) => c.type === 'achievement') ? L('Tabriklaymiz! Sizga Sellzen yutuq sertifikati berildi.') : L('Sizga Sellzen ishtirok sertifikati berildi.')}{' '}
      <a className="btn sm primary" href="#/certificates">{L('Sertifikatlarim')}</a></p>
  );
  if (missing.length) return (
    <p className="notice cert-notice"><Award size={16} />  {L('Sertifikat uchun profilga to‘liq ism va rasm qo‘shing.')}{' '}
      <a className="btn sm" href="#/certificates">{L('Ma’lumotni kiritish')}</a></p>
  );
  return null;
}
