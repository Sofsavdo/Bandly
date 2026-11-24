// Telefon raqam + parol bilan kirish. Parol faqat scrypt xeshi (tuz bilan) sifatida saqlanadi; telefon E.164 ko'rinishida (+998901234567).
// ESLATMA: raqam SMS orqali TASDIQLANMAYDI (SMS provayder — pullik servis, egasi tasdig'i kerak). Shuning uchun raqam faqat kirish identifikatori;
// u lid/qo'ng'iroq uchun ishlatilmaydi (u uchun alohida rozilik bilan «Lidlar» modulida raqam qoldiriladi).
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, newSession, placeholder, playerIdOf, tx } from './db';

// ---- Telefon ----
/** Raqamni E.164 ga keltiradi: "+998 90 123-45-67", "998901234567", "901234567" → "+998901234567". Yaroqsiz bo'lsa null. */
export function normPhone(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const d = raw.replace(/[\s()\-.]/g, '').replace(/^\+/, '');
  if (!/^\d+$/.test(d)) return null;
  if (d.length === 9) return `+998${d}`;                                  // 90 123 45 67 (O'zbekiston, mamlakat kodisiz)
  if (d.length === 12 && d.startsWith('998')) return `+${d}`;
  if (d.startsWith('998')) return null;                                    // O'zbekiston raqami aynan 12 raqam
  return d.length >= 8 && d.length <= 15 && !d.startsWith('0') ? `+${d}` : null; // boshqa mamlakatlar (E.164: 8–15 raqam)
}

// ---- Parol ----
const N = 16384, R = 8, P = 1, KEYLEN = 32;
const scryptAsync = (pw: string, salt: Buffer, n = N): Promise<Buffer> => new Promise((res, rej) => scrypt(pw, salt, KEYLEN, { N: n, r: R, p: P, maxmem: 64 * 1024 * 1024 }, (e, k) => (e ? rej(e) : res(k))));
export function passwordProblem(pw: unknown, phone?: string): string | null {
  if (typeof pw !== 'string' || pw.length < 8) return 'Parol kamida 8 belgi bo‘lsin';
  if (pw.length > 128) return 'Parol juda uzun (128 belgigacha)';
  if (/^(.)\1+$/.test(pw)) return 'Parol juda oddiy';
  if (phone && pw.replace(/\D/g, '') === phone.replace(/\D/g, '')) return 'Parol telefon raqamingiz bo‘lmasin';
  return null;
}
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${N}$${salt.toString('base64')}$${(await scryptAsync(pw.normalize('NFKC'), salt)).toString('base64')}`;
}
/** Xesh bilan solishtiradi (doimiy vaqtda). Xesh yo'q/buzuq bo'lsa ham xuddi shuncha vaqt sarflanadi (raqam bor-yo'qligi vaqtdan bilinmasin). */
const DUMMY = { salt: randomBytes(16), hash: randomBytes(KEYLEN) };
export async function verifyPassword(pw: string, stored: string | null | undefined): Promise<boolean> {
  const m = /^scrypt\$(\d+)\$([A-Za-z0-9+/=]+)\$([A-Za-z0-9+/=]+)$/.exec(stored ?? '');
  const n = m ? Number(m[1]) : N;
  const salt = m ? Buffer.from(m[2]!, 'base64') : DUMMY.salt;
  const want = m ? Buffer.from(m[3]!, 'base64') : DUMMY.hash;
  const got = await scryptAsync(pw.normalize('NFKC'), salt, n === N ? n : N).catch(() => null);
  return !!m && !!got && got.length === want.length && timingSafeEqual(got, want);
}

// ---- Urinishlar cheklovi (xotirada: server qayta ishga tushsa nolga tushadi) ----
export class AttemptLimiter {
  private m = new Map<string, number[]>();
  constructor(private max = 5, private windowMs = 15 * 60_000) {}
  private recent(key: string, now: number): number[] { const a = (this.m.get(key) ?? []).filter((t) => now - t < this.windowMs); this.m.set(key, a); return a; }
  /** Bloklangan bo'lsa 429. */
  check(key: string, now = Date.now()): void { if (this.recent(key, now).length >= this.max) throw new ApiError(429, 'Juda ko‘p urinish. 15 daqiqadan keyin qayta urinib ko‘ring.'); }
  fail(key: string, now = Date.now()): void { this.recent(key, now).push(now); if (this.m.size > 20_000) for (const [k, v] of this.m) if (!v.some((t) => now - t < this.windowMs)) this.m.delete(k); }
  ok(key: string): void { this.m.delete(key); }
}

// ---- Baza (phone, pass_hash, google_sub ustunlari db.ts createDb ichida qo'shiladi) ----
const NICK_RE = /^[\p{L}\p{N}_.\- ]{2,20}$/u;
/** Taklif etilgan laqabni tozalaydi; yaroqsiz bo'lsa fallback. */
export const cleanNick = (raw: unknown, fallback: string): string => {
  const s = typeof raw === 'string' ? raw.trim().replace(/\s+/g, ' ').slice(0, 20) : '';
  return NICK_RE.test(s) ? s : fallback;
};

/** Qurilmadagi eski (hech qanday doimiy identifikatorsiz) hisobga bog'lash: XP, progress va obuna saqlanadi. */
function legacyAccount(db: DatabaseSync, linkToken: string | undefined, now: number): { id: number; nickname: string } | undefined {
  if (!linkToken) return undefined;
  const lid = playerIdOf(db, linkToken, now);
  if (lid === null) return undefined;
  return db.prepare('SELECT id, nickname FROM players WHERE id = ? AND tg_id IS NULL AND phone IS NULL AND google_sub IS NULL').get(lid) as { id: number; nickname: string } | undefined;
}
function newPlayer(db: DatabaseSync, nick: string, extra: { phone?: string; passHash?: string; googleSub?: string }, now: number): { id: number; nickname: string } {
  for (let i = 0; i < 50; i++) {
    const n = i === 0 ? nick : `${nick.slice(0, 16)}${Math.floor(10 + Math.random() * 9990)}`;
    try {
      const id = Number(db.prepare('INSERT INTO players (token, nickname, phone, pass_hash, google_sub, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(placeholder(), n, extra.phone ?? null, extra.passHash ?? null, extra.googleSub ?? null, now, now).lastInsertRowid);
      return { id, nickname: n };
    } catch (e) { if (!/UNIQUE/i.test(String((e as Error)?.message)) || /phone|google/i.test(String((e as Error)?.message))) throw e; /* laqab band — boshqasini sinaymiz */ }
  }
  throw new ApiError(409, 'Hisob ochib bo‘lmadi, qayta urinib ko‘ring');
}

/** Telefon + parol bilan yangi hisob. Raqam band bo'lsa 409. linkToken — qurilmadagi eski hisobni shu raqamga bog'laydi. */
export function registerPhone(db: DatabaseSync, phone: string, passHash: string, nickname: unknown, linkToken?: string, now = Date.now()): { token: string; nickname: string; linked: boolean } {
  return tx(db, () => {
    if (db.prepare('SELECT 1 FROM players WHERE phone = ?').get(phone)) throw new ApiError(409, 'Bu raqam bilan hisob bor — «Kirish» ni bosing');
    const legacy = legacyAccount(db, linkToken, now);
    if (legacy) {
      db.prepare('UPDATE players SET phone = ?, pass_hash = ?, updated_at = ? WHERE id = ?').run(phone, passHash, now, legacy.id);
      return { token: newSession(db, legacy.id, now), nickname: legacy.nickname, linked: true };
    }
    const p = newPlayer(db, cleanNick(nickname, `Foydalanuvchi ${phone.slice(-4)}`), { phone, passHash }, now);
    return { token: newSession(db, p.id, now), nickname: p.nickname, linked: false };
  });
}
/** Kirish uchun yozuv (parol tekshiruvi tashqarida — scrypt asinxron). */
export const phoneRecord = (db: DatabaseSync, phone: string): { id: number; nickname: string; pass_hash: string | null } | undefined =>
  db.prepare('SELECT id, nickname, pass_hash FROM players WHERE phone = ?').get(phone) as { id: number; nickname: string; pass_hash: string | null } | undefined;
export const sessionFor = (db: DatabaseSync, playerId: number, now = Date.now()): string => newSession(db, playerId, now);

/** Google hisobi (sub) bilan kirish/yaratish. Mavjud bo'lsa — o'sha hisob; aks holda eski hisobga bog'lanadi yoki yangi ochiladi. */
export function loginGoogle(db: DatabaseSync, sub: string, nick: string, linkToken?: string, now = Date.now()): { token: string; nickname: string; linked: boolean; created: boolean } {
  return tx(db, () => {
    const found = db.prepare('SELECT id, nickname FROM players WHERE google_sub = ?').get(sub) as { id: number; nickname: string } | undefined;
    if (found) return { token: newSession(db, found.id, now), nickname: found.nickname, linked: false, created: false };
    const legacy = legacyAccount(db, linkToken, now);
    if (legacy) {
      db.prepare('UPDATE players SET google_sub = ?, updated_at = ? WHERE id = ?').run(sub, now, legacy.id);
      return { token: newSession(db, legacy.id, now), nickname: legacy.nickname, linked: true, created: false };
    }
    const p = newPlayer(db, cleanNick(nick, 'Foydalanuvchi'), { googleSub: sub }, now);
    return { token: newSession(db, p.id, now), nickname: p.nickname, linked: false, created: true };
  });
}
