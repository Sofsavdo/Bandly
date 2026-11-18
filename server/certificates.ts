// Sellzen sertifikatlari. Faqat server tasdiqlagan natijalar (Mock Arena baholash, AI Writing/Speaking baholash, to'liq imtihon)
// asosida beriladi — mijoz yuborgan ballga ishonilmaydi. Ikki tur: Participation (test to'liq topshirilgan) va Achievement
// (admin belgilagan mezonga erishilgan). Har sertifikat — taxmin qilib bo'lmaydigan yagona ID (60 bit), egasining ismi va rasmi
// berilgan paytdagi nusxasi bilan (keyin profil o'zgarsa ham sertifikat o'zgarmaydi). Bekor qilish va admin harakatlari audit logda.
import type { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { copyFileSync, existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { ApiError } from './db';

export type CertType = 'participation' | 'achievement';
export type ResultKind = 'reading' | 'listening' | 'writing' | 'speaking' | 'full';
export type CertModule = 'ielts-skill' | 'ielts-full' | 'cefr';
export interface Skills { listening?: number; reading?: number; writing?: number; speaking?: number }

export interface ExamResult {
  id: number; player_id: number; module: CertModule | 'ai'; kind: ResultKind; test_id: string; title: string;
  correct: number | null; total: number | null; answered: number | null; band: number | null; level: string | null;
  skills: Skills; overall: number | null; at: number;
}
export interface Rule { module: CertModule; participation: boolean; achievement: boolean; minBand: number; minPercent: number; minAnsweredPct: number }

const DEFAULT_RULES: Rule[] = [
  { module: 'ielts-skill', participation: true, achievement: true, minBand: 6.5, minPercent: 0, minAnsweredPct: 80 },
  { module: 'ielts-full', participation: true, achievement: true, minBand: 6.0, minPercent: 0, minAnsweredPct: 80 },
  { module: 'cefr', participation: true, achievement: true, minBand: 0, minPercent: 80, minAnsweredPct: 80 },
];
export const MODULE_LABEL: Record<CertModule, string> = {
  'ielts-skill': 'Sellzen Mock Test · IELTS format',
  'ielts-full': 'Sellzen Full Mock Exam · IELTS format',
  cefr: 'Sellzen Mock Test · CEFR format',
};

export function ensureCertTables(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS exam_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id), module TEXT NOT NULL, kind TEXT NOT NULL,
    test_id TEXT NOT NULL, title TEXT NOT NULL, attempt_key TEXT NOT NULL, correct INTEGER, total INTEGER, answered INTEGER,
    band REAL, level TEXT, skills TEXT NOT NULL DEFAULT '{}', overall REAL, at INTEGER NOT NULL)`);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS exam_results_attempt ON exam_results (player_id, attempt_key)');
  db.exec('CREATE INDEX IF NOT EXISTS exam_results_player ON exam_results (player_id, at)');
  db.exec(`CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY, player_id INTEGER NOT NULL REFERENCES players(id), result_id INTEGER NOT NULL REFERENCES exam_results(id),
    type TEXT NOT NULL, data TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'valid', revoked_at INTEGER, revoke_reason TEXT, created_at INTEGER NOT NULL)`);
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS certificates_once ON certificates (result_id, type)');
  db.exec('CREATE INDEX IF NOT EXISTS certificates_player ON certificates (player_id, created_at)');
  db.exec(`CREATE TABLE IF NOT EXISTS cert_rules (module TEXT PRIMARY KEY, participation INTEGER NOT NULL, achievement INTEGER NOT NULL,
    min_band REAL NOT NULL, min_percent REAL NOT NULL, min_answered_pct REAL NOT NULL)`);
  db.exec('CREATE TABLE IF NOT EXISTS cert_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)');
  db.exec('CREATE TABLE IF NOT EXISTS admin_audit (id INTEGER PRIMARY KEY AUTOINCREMENT, ts INTEGER NOT NULL, actor_id INTEGER, action TEXT NOT NULL, target TEXT, detail TEXT)');
  const ins = db.prepare('INSERT OR IGNORE INTO cert_rules (module, participation, achievement, min_band, min_percent, min_answered_pct) VALUES (?, ?, ?, ?, ?, ?)');
  for (const r of DEFAULT_RULES) ins.run(r.module, r.participation ? 1 : 0, r.achievement ? 1 : 0, r.minBand, r.minPercent, r.minAnsweredPct);
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('full_name')) db.exec('ALTER TABLE players ADD COLUMN full_name TEXT');
  if (!cols.includes('photo')) db.exec('ALTER TABLE players ADD COLUMN photo TEXT');
}

export function audit(db: DatabaseSync, actorId: number | null, action: string, target: string | null, detail: unknown = null, now = Date.now()): void {
  db.prepare('INSERT INTO admin_audit (ts, actor_id, action, target, detail) VALUES (?, ?, ?, ?, ?)').run(now, actorId, action, target, detail === null ? null : JSON.stringify(detail).slice(0, 2000));
}
export const auditLog = (db: DatabaseSync, limit = 100) => db.prepare(`SELECT a.id, a.ts, a.action, a.target, a.detail, p.nickname AS actor FROM admin_audit a LEFT JOIN players p ON p.id = a.actor_id ORDER BY a.id DESC LIMIT ?`).all(Math.min(500, Math.max(1, limit)));

// ---------------- Qoidalar va sozlamalar ----------------
const MODULES: CertModule[] = ['ielts-skill', 'ielts-full', 'cefr'];
export function rules(db: DatabaseSync): Rule[] {
  return (db.prepare('SELECT * FROM cert_rules').all() as { module: CertModule; participation: number; achievement: number; min_band: number; min_percent: number; min_answered_pct: number }[])
    .filter((r) => r.module === 'ielts-full') // faqat to'liq imtihon (bo'lim testlari uchun sertifikat berilmaydi)
    .map((r) => ({ module: r.module, participation: !!r.participation, achievement: !!r.achievement, minBand: r.min_band, minPercent: r.min_percent, minAnsweredPct: r.min_answered_pct }));
}
const ruleOf = (db: DatabaseSync, m: CertModule): Rule => rules(db).find((r) => r.module === m) ?? DEFAULT_RULES.find((r) => r.module === m)!;
export function setRule(db: DatabaseSync, actorId: number, input: Partial<Rule> & { module?: unknown }, now = Date.now()): Rule {
  const m = String(input.module) as CertModule;
  if (!MODULES.includes(m)) throw new ApiError(400, 'Noma’lum modul');
  const cur = ruleOf(db, m);
  const num = (v: unknown, lo: number, hi: number, step: number, d: number) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? Math.round(n / step) * step : d; };
  const next: Rule = {
    module: m,
    participation: typeof input.participation === 'boolean' ? input.participation : cur.participation,
    achievement: typeof input.achievement === 'boolean' ? input.achievement : cur.achievement,
    minBand: input.minBand === undefined ? cur.minBand : num(input.minBand, 0, 9, 0.5, cur.minBand),
    minPercent: input.minPercent === undefined ? cur.minPercent : num(input.minPercent, 0, 100, 1, cur.minPercent),
    minAnsweredPct: input.minAnsweredPct === undefined ? cur.minAnsweredPct : num(input.minAnsweredPct, 0, 100, 1, cur.minAnsweredPct),
  };
  db.prepare('INSERT INTO cert_rules (module, participation, achievement, min_band, min_percent, min_answered_pct) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(module) DO UPDATE SET participation = excluded.participation, achievement = excluded.achievement, min_band = excluded.min_band, min_percent = excluded.min_percent, min_answered_pct = excluded.min_answered_pct')
    .run(m, next.participation ? 1 : 0, next.achievement ? 1 : 0, next.minBand, next.minPercent, next.minAnsweredPct);
  audit(db, actorId, 'cert.rule.update', m, { before: cur, after: next }, now);
  return next;
}
export interface CertSettings { signerName: string; signerTitle: string; issuer: string }
const DEFAULT_SETTINGS: CertSettings = { signerName: 'Sellzen Academic Board', signerTitle: 'Assessment & Certification', issuer: 'Sellzen' };
export function settings(db: DatabaseSync): CertSettings {
  const rows = db.prepare('SELECT key, value FROM cert_settings').all() as { key: keyof CertSettings; value: string }[];
  const out = { ...DEFAULT_SETTINGS };
  for (const r of rows) if (r.key in out) out[r.key] = r.value;
  return out;
}
export function setSettings(db: DatabaseSync, actorId: number, input: Partial<CertSettings>, now = Date.now()): CertSettings {
  const cur = settings(db);
  for (const k of ['signerName', 'signerTitle'] as const) {
    const v = input[k];
    if (typeof v !== 'string') continue;
    const t = v.trim().replace(/\s+/g, ' ');
    if (t.length < 2 || t.length > 60 || /[<>]/.test(t)) throw new ApiError(400, 'Matn 2–60 belgi bo‘lishi kerak');
    db.prepare('INSERT INTO cert_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(k, t);
  }
  const next = settings(db);
  audit(db, actorId, 'cert.settings.update', null, { before: cur, after: next }, now);
  return next;
}

// ---------------- Natijalar (faqat server yozadi) ----------------
const parseSkills = (s: string): Skills => { try { const j = JSON.parse(s) as Skills; return j && typeof j === 'object' ? j : {}; } catch { return {}; } };
const rowToResult = (r: Record<string, unknown>): ExamResult => ({ ...(r as unknown as ExamResult), skills: parseSkills(String(r.skills ?? '{}')) });
export const resultById = (db: DatabaseSync, id: number): ExamResult | null => { const r = db.prepare('SELECT * FROM exam_results WHERE id = ?').get(id) as Record<string, unknown> | undefined; return r ? rowToResult(r) : null; };

/** Natijani yozadi; bir xil urinish (attemptKey) qayta yuborilsa — mavjud yozuv qaytariladi (takror natija yaratilmaydi). */
export function recordResult(db: DatabaseSync, playerId: number, r: { module: CertModule | 'ai'; kind: ResultKind; testId: string; title: string; attemptKey: string; correct?: number; total?: number; answered?: number; band?: number | null; level?: string | null; skills?: Skills; overall?: number | null }, now = Date.now()): { result: ExamResult; created: boolean } {
  const ex = db.prepare('SELECT * FROM exam_results WHERE player_id = ? AND attempt_key = ?').get(playerId, r.attemptKey) as Record<string, unknown> | undefined;
  if (ex) return { result: rowToResult(ex), created: false };
  const id = Number(db.prepare(`INSERT INTO exam_results (player_id, module, kind, test_id, title, attempt_key, correct, total, answered, band, level, skills, overall, at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(playerId, r.module, r.kind, r.testId, r.title.slice(0, 160), r.attemptKey, r.correct ?? null, r.total ?? null, r.answered ?? null,
    r.band ?? null, r.level ?? null, JSON.stringify(r.skills ?? {}), r.overall ?? null, now).lastInsertRowid);
  return { result: resultById(db, id)!, created: true };
}

const roundOverall = (xs: number[]): number => Math.floor((xs.reduce((a, b) => a + b, 0) / xs.length) * 2 + 0.5) / 2;
/** To'liq imtihon: shu o'quvchining imtihon boshlanganidan keyingi server natijalaridan (L, R, W, S) yig'iladi. To'rttasi ham bo'lishi shart. */
export function composeFull(db: DatabaseSync, playerId: number, startedAt: number, listeningId: string, readingId: string, now = Date.now()): ExamResult {
  if (!Number.isFinite(startedAt) || startedAt > now || now - startedAt > 3 * 86_400_000) throw new ApiError(400, 'Imtihon vaqti noto‘g‘ri');
  const pick = (kind: ResultKind, testId?: string) => db.prepare(`SELECT * FROM exam_results WHERE player_id = ? AND kind = ? AND at >= ? ${testId ? 'AND test_id = ?' : ''} ORDER BY at ASC LIMIT 1`)
    .get(...([playerId, kind, startedAt, ...(testId ? [testId] : [])] as [number, string, number])) as Record<string, unknown> | undefined;
  const l = pick('listening', listeningId), r = pick('reading', readingId), w = pick('writing'), s = pick('speaking');
  if (!l || !r || !w || !s) throw new ApiError(409, 'To‘liq imtihonning 4 bo‘limi ham topshirilishi kerak');
  const skills: Skills = { listening: Number(l.band), reading: Number(r.band), writing: Number(w.band), speaking: Number(s.band) };
  if (Object.values(skills).some((x) => !Number.isFinite(x))) throw new ApiError(409, 'Bo‘lim natijasi yetarli emas');
  const answered = Number(l.answered ?? 0) + Number(r.answered ?? 0), total = Number(l.total ?? 0) + Number(r.total ?? 0);
  return recordResult(db, playerId, { module: 'ielts-full', kind: 'full', testId: `${listeningId}+${readingId}`, title: 'Listening · Reading · Writing · Speaking', attemptKey: `full:${startedAt}`,
    answered, total, skills, overall: roundOverall(Object.values(skills) as number[]) }, now).result;
}

// ---------------- Sertifikat berish ----------------
const ALPH = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32 (I, L, O, U yo'q)
export function newCertId(): string {
  const b = randomBytes(8); let n = b.readBigUInt64BE() >> 4n; let s = '';
  for (let i = 0; i < 12; i++) { s = ALPH[Number(n & 31n)] + s; n >>= 5n; }
  return `SZ-${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8)}`;
}
export const CERT_ID_RE = /^SZ-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}-[0-9A-HJKMNP-TV-Z]{4}$/;

/** IELTS bandidan CEFR darajasi (ielts.org "IELTS and the CEFR" jadvali bo'yicha chegaralar). */
export const cefrOfBand = (b: number): string => (b >= 8.5 ? 'C2' : b >= 7 ? 'C1' : b >= 5.5 ? 'B2' : b >= 4 ? 'B1' : 'A2');

export interface CertData {
  name: string; photo: string; examName: string; module: CertModule; kind: ResultKind; testDate: string;
  skills: Skills; overall: number | null; cefr: string | null; correct: number | null; total: number | null; percent: number | null; signerName: string; signerTitle: string; validUntil?: number;
}
export interface Profile { fullName: string | null; photo: string | null }
export const profileOf = (db: DatabaseSync, playerId: number): Profile => {
  const r = db.prepare('SELECT full_name, photo FROM players WHERE id = ?').get(playerId) as { full_name: string | null; photo: string | null } | undefined;
  return { fullName: r?.full_name ?? null, photo: r?.photo ?? null };
};

const SKILL_KEYS = ['listening', 'reading', 'writing', 'speaking'] as const;
/** Sertifikat amal qilish muddati: berilgan kundan 1 yil. */
export const VALID_MS = 365 * 86_400_000;

export interface Eligibility { module: CertModule | null; participation: boolean; achievement: boolean; reason: string | null }
/** Natija qaysi sertifikatlarga loyiq (profilga bog'liq emas). */
export function eligibility(db: DatabaseSync, r: ExamResult): Eligibility {
  // Sertifikat faqat to'liq imtihon uchun: 4 ko'nikma (Listening, Reading, Writing, Speaking) va Overall — bitta ball bilan sertifikat berilmaydi
  if (r.kind !== 'full' || r.module !== 'ielts-full' || SKILL_KEYS.some((k) => typeof r.skills[k] !== 'number')) return { module: null, participation: false, achievement: false, reason: 'Sertifikat faqat to‘liq imtihon (4 bo‘lim) uchun beriladi' };
  const m = r.module as CertModule; const rule = ruleOf(db, m);
  const answeredPct = r.total ? ((r.answered ?? 0) / r.total) * 100 : 0;
  if (answeredPct < rule.minAnsweredPct) return { module: m, participation: false, achievement: false, reason: `Test to‘liq yakunlanmagan: savollarning kamida ${rule.minAnsweredPct}% iga javob bering` };
  const pct = r.total ? Math.round(((r.correct ?? 0) / r.total) * 100) : 0;
  const score = m === 'cefr' ? pct >= rule.minPercent : (r.overall ?? r.band ?? -1) >= rule.minBand;
  return { module: m, participation: rule.participation, achievement: rule.achievement && score, reason: null };
}

function buildData(db: DatabaseSync, r: ExamResult, name: string, photo: string, now: number): CertData {
  const s = settings(db); const m = r.module as CertModule;
  const pct = r.total ? Math.round(((r.correct ?? 0) / r.total) * 100) : null;
  const skills: Skills = r.kind === 'full' ? r.skills : r.module === 'cefr' ? {} : { [r.kind]: r.band ?? undefined };
  const overall = r.kind === 'full' ? r.overall : r.module === 'cefr' ? null : r.band;
  const cefr = r.module === 'cefr' ? (r.level ?? null) : overall !== null && overall !== undefined ? cefrOfBand(overall) : null;
  return { name, photo, examName: `${MODULE_LABEL[m]} — ${r.title}`, module: m, kind: r.kind, testDate: new Date(r.at + 5 * 3_600_000).toISOString().slice(0, 10),
    skills, overall: overall ?? null, cefr, correct: r.correct, total: r.total, percent: pct, signerName: s.signerName, signerTitle: s.signerTitle, validUntil: now + VALID_MS };
}

/** Natija uchun sertifikat(lar) yaratadi. Profil rasmi va to'liq ism shart. Takror chaqirilsa — mavjudlari qoladi (bir natija — bir turdan bitta). */
export function issueFor(db: DatabaseSync, playerId: number, resultId: number, mediaDir: string, now = Date.now()): { issued: { id: string; type: CertType }[]; missing: ('photo' | 'name')[]; reason: string | null } {
  const r = resultById(db, resultId);
  if (!r || r.player_id !== playerId) throw new ApiError(404, 'Natija topilmadi');
  const e = eligibility(db, r);
  if (!e.module || (!e.participation && !e.achievement)) return { issued: [], missing: [], reason: e.reason };
  const pr = profileOf(db, playerId);
  const missing: ('photo' | 'name')[] = [];
  if (!pr.photo || !existsSync(`${mediaDir}/${pr.photo}`)) missing.push('photo');
  if (!pr.fullName) missing.push('name');
  if (missing.length) return { issued: [], missing, reason: 'Sertifikat uchun profil rasmi va to‘liq ism kerak' };
  const issued: { id: string; type: CertType }[] = [];
  for (const type of [e.participation && 'participation', e.achievement && 'achievement'].filter(Boolean) as CertType[]) {
    if (db.prepare('SELECT 1 FROM certificates WHERE result_id = ? AND type = ?').get(resultId, type)) continue;
    let id = newCertId(); while (db.prepare('SELECT 1 FROM certificates WHERE id = ?').get(id)) id = newCertId();
    const ext = pr.photo!.split('.').pop();
    const photo = `cert-${id.toLowerCase()}.${ext}`;
    copyFileSync(`${mediaDir}/${pr.photo}`, `${mediaDir}/${photo}`); // berilgan paytdagi rasm nusxasi
    db.prepare('INSERT INTO certificates (id, player_id, result_id, type, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, playerId, resultId, type, JSON.stringify(buildData(db, r, pr.fullName!, photo, now)), now);
    issued.push({ id, type });
  }
  return { issued, missing: [], reason: null };
}
/** Profil to'ldirilgandan keyin: shu o'quvchining sertifikatsiz qolgan loyiq natijalari uchun beradi. */
export function claimAll(db: DatabaseSync, playerId: number, mediaDir: string, now = Date.now()): { id: string; type: CertType }[] {
  const ids = (db.prepare("SELECT id FROM exam_results WHERE player_id = ? AND kind IN ('reading','listening','full') ORDER BY at DESC LIMIT 200").all(playerId) as { id: number }[]).map((x) => x.id);
  return ids.flatMap((id) => issueFor(db, playerId, id, mediaDir, now).issued);
}

// ---------------- Ko'rish ----------------
interface CertRow { id: string; player_id: number; result_id: number; type: CertType; data: string; status: 'valid' | 'revoked'; revoked_at: number | null; revoke_reason: string | null; created_at: number }
export interface CertView { id: string; type: CertType; status: 'valid' | 'revoked' | 'expired'; issuedAt: number; validUntil: number; revokedAt: number | null; data: CertData; verifyUrl: string; photoUrl: string }
export const verifyUrl = (id: string, base = process.env.PUBLIC_CERT_BASE ?? 'https://sellzen.uz') => `${base.replace(/\/$/, '')}/certificate/${id}`;
const view = (r: CertRow, now = Date.now()): CertView => {
  const data = JSON.parse(r.data) as CertData;
  const validUntil = data.validUntil ?? r.created_at + VALID_MS; // eski yozuvlar: berilgan kundan 1 yil
  const status = r.status === 'revoked' ? 'revoked' : now > validUntil ? 'expired' : 'valid';
  return { id: r.id, type: r.type, status, issuedAt: r.created_at, validUntil, revokedAt: r.revoked_at, data: { ...data, validUntil }, verifyUrl: verifyUrl(r.id), photoUrl: `/media/${data.photo}` };
};
export const myCertificates = (db: DatabaseSync, playerId: number): CertView[] => (db.prepare('SELECT * FROM certificates WHERE player_id = ? ORDER BY created_at DESC').all(playerId) as unknown as CertRow[]).map(view);
/** Ommaviy tekshirish: faqat sertifikatdagi ma'lumot (ism, rasm, natija) — hisob, Telegram yoki boshqa shaxsiy ma'lumot qaytarilmaydi. */
export function publicCertificate(db: DatabaseSync, id: string, now = Date.now()): CertView {
  const key = String(id ?? '').toUpperCase();
  if (!CERT_ID_RE.test(key)) throw new ApiError(404, 'Sertifikat topilmadi');
  const r = db.prepare('SELECT * FROM certificates WHERE id = ?').get(key) as CertRow | undefined;
  if (!r) throw new ApiError(404, 'Sertifikat topilmadi');
  return view(r, now);
}

// ---------------- Admin ----------------
export function searchCertificates(db: DatabaseSync, q: string, limit = 50) {
  const like = `%${q.trim().slice(0, 60)}%`;
  return (db.prepare(`SELECT c.*, p.nickname FROM certificates c JOIN players p ON p.id = c.player_id
    WHERE (? = '%%' OR c.id LIKE ? OR p.nickname LIKE ? OR json_extract(c.data, '$.name') LIKE ? OR json_extract(c.data, '$.examName') LIKE ?)
    ORDER BY c.created_at DESC LIMIT ?`).all(like, like, like, like, like, Math.min(200, limit)) as unknown as (CertRow & { nickname: string })[])
    .map((r) => ({ ...view(r), nickname: r.nickname, revokeReason: r.revoke_reason }));
}
export function revokeCertificate(db: DatabaseSync, actorId: number, id: string, reason: string, now = Date.now()): CertView {
  const why = String(reason ?? '').trim();
  if (why.length < 3 || why.length > 300) throw new ApiError(400, 'Bekor qilish sababini yozing (3–300 belgi)');
  const r = db.prepare('SELECT * FROM certificates WHERE id = ?').get(String(id).toUpperCase()) as CertRow | undefined;
  if (!r) throw new ApiError(404, 'Sertifikat topilmadi');
  if (r.status === 'revoked') throw new ApiError(409, 'Sertifikat allaqachon bekor qilingan');
  db.prepare("UPDATE certificates SET status = 'revoked', revoked_at = ?, revoke_reason = ? WHERE id = ?").run(now, why, r.id);
  audit(db, actorId, 'cert.revoke', r.id, { reason: why }, now);
  return publicCertificate(db, r.id);
}

// ---------------- Profil rasmi ----------------
export const PHOTO_MAX = 2 * 1024 * 1024;
/** Fayl turini mazmunidan aniqlaydi (kengaytma yoki content-type ga ishonilmaydi): faqat JPEG, PNG, WebP. */
export function imageKind(b: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg';
  if (b.length > 12 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (b.length > 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'webp';
  return null;
}
export function savePhoto(db: DatabaseSync, playerId: number, buf: Buffer, mediaDir: string): { photo: string } {
  if (buf.length > PHOTO_MAX) throw new ApiError(413, 'Rasm 2 MB dan kichik bo‘lsin');
  const kind = imageKind(buf);
  if (!kind) throw new ApiError(415, 'Faqat JPG, PNG yoki WebP rasm yuklang');
  mkdirSync(mediaDir, { recursive: true });
  const file = `avatar-${randomBytes(12).toString('hex')}.${kind}`;
  writeFileSync(`${mediaDir}/${file}`, buf);
  const old = profileOf(db, playerId).photo;
  db.prepare('UPDATE players SET photo = ? WHERE id = ?').run(file, playerId);
  if (old && /^avatar-[a-f0-9]+\.\w+$/.test(old)) { try { unlinkSync(`${mediaDir}/${old}`); } catch { /* yo'q */ } }
  return { photo: file };
}
export function setFullName(db: DatabaseSync, playerId: number, name: unknown): { fullName: string } {
  const t = String(name ?? '').trim().replace(/\s+/g, ' ');
  if (t.length < 3 || t.length > 60 || !/^[\p{L}][\p{L}\p{M}'’ʼ‘`.\- ]+$/u.test(t) || !t.includes(' ')) throw new ApiError(400, 'To‘liq ism va familiyani yozing (3–60 harf)');
  db.prepare('UPDATE players SET full_name = ? WHERE id = ?').run(t, playerId);
  return { fullName: t };
}
