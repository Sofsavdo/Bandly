// Zaxira nusxani tashqi S3-mos omborga yuborish (Railway Bucket, Cloudflare R2, AWS S3, MinIO).
// Nega: kunlik nusxa baza bilan bir volume'da turadi — volume yo'qolsa ikkalasi ham yo'qoladi (CONTEXT R4).
// Qaramliksiz: AWS Signature V4 node:crypto bilan. BACKUP_S3_* bo'lmasa — o'chiq (hech narsa yuborilmaydi).
// Saqlash muddati omborning lifecycle qoidasi bilan boshqariladi (masalan 30 kun) — bu yerda o'chirish yo'q.
import { createHash, createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { gzipSync } from 'node:zlib';

export interface OffsiteConfig {
  endpoint: string;      // https://t3.storageapi.dev (Railway), https://<account>.r2.cloudflarestorage.com, https://s3.<region>.amazonaws.com
  bucket: string;
  region: string;        // Railway/R2: "auto"
  accessKeyId: string;
  secretAccessKey: string;
  prefix: string;        // ombordagi papka, masalan "sellzen-backups/"
  urlStyle: 'virtual' | 'path';
}

export function offsiteConfigFromEnv(env: NodeJS.ProcessEnv = process.env): OffsiteConfig | null {
  const v = (k: string) => (env[k] ?? '').trim();
  const endpoint = v('BACKUP_S3_ENDPOINT').replace(/\/$/, ''), bucket = v('BACKUP_S3_BUCKET');
  const accessKeyId = v('BACKUP_S3_ACCESS_KEY_ID'), secretAccessKey = v('BACKUP_S3_SECRET_ACCESS_KEY');
  if (!endpoint && !bucket && !accessKeyId && !secretAccessKey) return null; // umuman sozlanmagan — o'chiq
  // Yarim sozlangan: jim o'chiq qolsa "tashqi zaxira bor" degan yolg'on taassurot beradi — xato sifatida ko'rsatiladi (qiymatlar emas, nomlar)
  const missing = [['BACKUP_S3_ENDPOINT', endpoint], ['BACKUP_S3_BUCKET', bucket], ['BACKUP_S3_ACCESS_KEY_ID', accessKeyId], ['BACKUP_S3_SECRET_ACCESS_KEY', secretAccessKey]].filter(([, x]) => !x).map(([k]) => k);
  if (missing.length) throw new Error(`Tashqi zaxira to‘liq sozlanmagan, yetishmaydi: ${missing.join(', ')}`);
  if (!/^https?:\/\/[^/\s]+$/.test(endpoint)) throw new Error('BACKUP_S3_ENDPOINT: https://host ko‘rinishida bo‘lishi kerak');
  const prefix = v('BACKUP_S3_PREFIX') || 'sellzen-backups/';
  return { endpoint, bucket, region: v('BACKUP_S3_REGION') || 'auto', accessKeyId, secretAccessKey, prefix: prefix.endsWith('/') ? prefix : `${prefix}/`, urlStyle: v('BACKUP_S3_URL_STYLE') === 'path' ? 'path' : 'virtual' };
}

const sha256 = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');
const hmac = (k: Buffer | string, s: string) => createHmac('sha256', k).update(s).digest();
/** S3 yo'li uchun URI kodlash: "/" saqlanadi, qolgani RFC 3986 bo'yicha. */
const encodeKey = (key: string) => key.split('/').map((p) => encodeURIComponent(p).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)).join('/');

/** PUT so'rovi uchun manzil va imzolangan sarlavhalar (AWS SigV4). Sof funksiya: soat tashqaridan beriladi (test uchun). */
export function signPut(cfg: OffsiteConfig, key: string, body: Buffer, contentType: string, now = new Date()): { url: string; headers: Record<string, string> } {
  const u = new URL(cfg.endpoint);
  const host = cfg.urlStyle === 'virtual' ? `${cfg.bucket}.${u.host}` : u.host;
  const path = cfg.urlStyle === 'virtual' ? `/${encodeKey(key)}` : `/${encodeURIComponent(cfg.bucket)}/${encodeKey(key)}`;
  const amzDate = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); // YYYYMMDDTHHMMSSZ
  const date = amzDate.slice(0, 8);
  const payloadHash = sha256(body);
  const headers: Record<string, string> = { 'content-type': contentType, host, 'x-amz-content-sha256': payloadHash, 'x-amz-date': amzDate };
  const names = Object.keys(headers).sort();
  const canonical = ['PUT', path, '', ...names.map((n) => `${n}:${headers[n]}`), '', names.join(';'), payloadHash].join('\n');
  const scope = `${date}/${cfg.region}/s3/aws4_request`;
  const toSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256(canonical)].join('\n');
  const kSigning = hmac(hmac(hmac(hmac(`AWS4${cfg.secretAccessKey}`, date), cfg.region), 's3'), 'aws4_request');
  const signature = createHmac('sha256', kSigning).update(toSign).digest('hex');
  headers.authorization = `AWS4-HMAC-SHA256 Credential=${cfg.accessKeyId}/${scope}, SignedHeaders=${names.join(';')}, Signature=${signature}`;
  return { url: `${u.protocol}//${host}${path}`, headers };
}

type FetchLike = (url: string, init: { method: string; headers: Record<string, string>; body: Buffer }) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** Nusxani gzip qilib yuklaydi. Qaytaradi: ombordagi kalit va yuborilgan bayt. Xato bo'lsa istisno (sabab, kalitlarsiz). */
export async function uploadBackup(cfg: OffsiteConfig, file: string, opts: { fetchImpl?: FetchLike; now?: Date } = {}): Promise<{ key: string; bytes: number }> {
  const body = gzipSync(readFileSync(file), { level: 9 });
  const key = `${cfg.prefix}${basename(file)}.gz`;
  const { url, headers } = signPut(cfg, key, body, 'application/gzip', opts.now);
  const f = opts.fetchImpl ?? (fetch as unknown as FetchLike);
  const res = await f(url, { method: 'PUT', headers, body });
  if (!res.ok) {
    const t = (await res.text().catch(() => '')).replace(/\s+/g, ' ').slice(0, 200);
    throw new Error(`offsite upload HTTP ${res.status}${t ? `: ${t}` : ''}`);
  }
  return { key, bytes: body.length };
}
