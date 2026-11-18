// Sertifikatlar va sertifikat profili (to'liq ism, rasm) — mijoz API. Natija va sertifikat faqat serverda yaratiladi.
import { getAccount } from './account';
import type { CertView } from './certRender';
import { L } from '../i18n';

export interface CertProfile { fullName: string | null; photoUrl: string | null }
const hdr = (): Record<string, string> => ({ 'x-token': getAccount()?.token ?? '' });
async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let r: Response;
  try { r = await fetch(path, { ...init, headers: { ...hdr(), ...(init.headers as Record<string, string> | undefined) } }); } catch { throw new Error(L('Server bilan aloqa yo‘q')); }
  const j = (await r.json().catch(() => ({}))) as T & { error?: string };
  if (!r.ok) throw new Error(j.error ?? L('Xato {0}', [r.status]));
  return j;
}
export const myCertificates = () => call<{ certificates: CertView[]; profile: CertProfile }>('/api/certificates');
export const claimCertificates = () => call<{ issued: { id: string }[]; certificates: CertView[] }>('/api/certificates/claim', { method: 'POST' });
export const verifyCertificate = (id: string) => call<CertView>(`/api/certificates/verify/${encodeURIComponent(id)}`);
export const certProfile = () => call<CertProfile>('/api/profile/cert');
export const saveFullName = (fullName: string) => call<CertProfile>('/api/profile/cert', { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ fullName }) });

/** Rasmni brauzerda kvadrat qilib qirqadi va 640×640 JPEG ga aylantiradi (EXIF, joylashuv ma'lumoti olib tashlanadi), so'ng yuklaydi. */
export async function uploadPhoto(file: File): Promise<CertProfile> {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(L('Faqat JPG, PNG yoki WebP rasm yuklang'));
  if (file.size > 12 * 1024 * 1024) throw new Error(L('Rasm juda katta'));
  const bmp = await createImageBitmap(file).catch(() => { throw new Error(L('Rasmni ochib bo‘lmadi')); });
  const s = Math.min(bmp.width, bmp.height);
  if (s < 200) throw new Error(L('Rasm juda kichik (kamida 200×200)'));
  const cv = document.createElement('canvas'); cv.width = cv.height = 640;
  cv.getContext('2d')!.drawImage(bmp, (bmp.width - s) / 2, (bmp.height - s) / 2, s, s, 0, 0, 640, 640);
  const blob = await new Promise<Blob>((res, rej) => cv.toBlob((b) => (b ? res(b) : rej(new Error('jpeg'))), 'image/jpeg', 0.9));
  return call<CertProfile>('/api/profile/photo', { method: 'POST', headers: { 'content-type': 'image/jpeg' }, body: blob });
}
export const TYPE_UZ = { participation: L('Ishtirok sertifikati'), achievement: L('Yutuq sertifikati') } as const;
