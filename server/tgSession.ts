import type { DatabaseSync } from 'node:sqlite';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { ApiError } from './db';

// Admin panel orqali olingan Telegram sessiyasi bazada SHIFRLANGAN saqlanadi (AES-256-GCM). Sessiya = Telegram akkauntga to'liq kirish,
// shuning uchun baza nusxasi (zaxira, tashqi ombor) sizib chiqsa ham kalitsiz ochilmaydi. Kalit shu serverning maxfiy o'zgaruvchilaridan
// olinadi (PAY_SESSION_KEY, bo'lmasa ADMIN_TOKEN, bo'lmasa TELEGRAM_BOT_TOKEN); ular almashsa — sessiya o'qilmaydi va qayta ulash kerak.

export function sessionKey(env: NodeJS.ProcessEnv = process.env): Buffer | null {
  const secret = [env.PAY_SESSION_KEY, env.ADMIN_TOKEN, env.TELEGRAM_BOT_TOKEN].map((v) => (v ?? '').trim()).find((v) => v.length >= 8);
  return secret ? createHash('sha256').update(`sellzen:tg-session:v1:${secret}`).digest() : null;
}

export function encryptSecret(plain: string, key: Buffer): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), ct.toString('base64url')].join('.');
}
export function decryptSecret(blob: string, key: Buffer): string | null {
  try {
    const [v, iv, tag, ct] = blob.split('.');
    if (v !== 'v1' || !iv || !tag || !ct) return null;
    const d = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
    d.setAuthTag(Buffer.from(tag, 'base64url'));
    return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8');
  } catch { return null; }
}

export function ensureSecretTable(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS pay_secrets (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL)');
}

const NAME = 'tg_session';
export function saveSession(db: DatabaseSync, session: string, env: NodeJS.ProcessEnv = process.env, now = Date.now()): void {
  const key = sessionKey(env);
  if (!key) throw new ApiError(500, 'Maxfiy kalit yo‘q: serverda ADMIN_TOKEN yoki PAY_SESSION_KEY sozlanishi kerak');
  db.prepare('INSERT INTO pay_secrets (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at').run(NAME, encryptSecret(session, key), now);
}
export function loadSession(db: DatabaseSync, env: NodeJS.ProcessEnv = process.env): string | null {
  const key = sessionKey(env);
  if (!key) return null;
  try {
    const r = db.prepare('SELECT value FROM pay_secrets WHERE key = ?').get(NAME) as { value: string } | undefined;
    return r ? decryptSecret(r.value, key) : null;
  } catch { return null; }
}
export const hasStoredSession = (db: DatabaseSync): boolean => { try { return !!db.prepare('SELECT 1 FROM pay_secrets WHERE key = ?').get(NAME); } catch { return false; } };
export const clearSession = (db: DatabaseSync): void => { db.prepare('DELETE FROM pay_secrets WHERE key = ?').run(NAME); };
