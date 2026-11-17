import { DatabaseSync } from 'node:sqlite';
import { tzDay } from './day';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import { ensureXpTables } from './xp';
import { ensureReminderColumns } from './reminders';
import { ensureI18nTables } from './i18n';
import { ensureReferralColumns } from './referral';
import { ensureGroupTables } from './groups';
import { ensureLeagueNotifyColumn } from './leagueNotify';
import { ensureLeagueTables } from './league';
import { vocab } from '../src/content/vocab';

export const MAX_DELTA_PER_SYNC = 400; // bitta so'rovda qabul qilinadigan eng ko'p XP (aldovga qarshi)
export const MAX_DELTA_PER_HOUR = 1500;

export function createDb(path = ':memory:'): DatabaseSync {
  const db = new DatabaseSync(path);
  db.exec(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL,
      xp INTEGER NOT NULL DEFAULT 0,
      streak INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS players_nick ON players (lower(nickname));
    CREATE TABLE IF NOT EXISTS xp_log (
      player_id INTEGER NOT NULL REFERENCES players(id),
      ts INTEGER NOT NULL,
      delta INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS xp_log_ts ON xp_log (ts);
    CREATE TABLE IF NOT EXISTS ai_global_usage (
      day TEXT PRIMARY KEY,
      calls INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS ai_cost_events (
      id INTEGER PRIMARY KEY,
      ts INTEGER NOT NULL,
      day TEXT NOT NULL,
      player_id INTEGER REFERENCES players(id),
      feature TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      units INTEGER NOT NULL,
      unit_kind TEXT NOT NULL,
      cost_usd REAL NOT NULL,
      estimated INTEGER NOT NULL DEFAULT 1
    );
    CREATE INDEX IF NOT EXISTS ai_cost_day ON ai_cost_events (day);
    CREATE TABLE IF NOT EXISTS ai_usage (
      player_id INTEGER NOT NULL REFERENCES players(id),
      day TEXT NOT NULL,
      calls INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (player_id, day)
    );
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      player_id INTEGER NOT NULL REFERENCES players(id),
      track TEXT NOT NULL,
      days INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      hamyon_payment_id TEXT,
      hamyon_amount INTEGER,
      card TEXT,
      status TEXT NOT NULL,
      expire_at INTEGER,
      error TEXT,
      note TEXT,
      created_at INTEGER NOT NULL,
      paid_at INTEGER,
      checked_at INTEGER
    );
    CREATE INDEX IF NOT EXISTS payments_player ON payments (player_id, created_at);
    CREATE INDEX IF NOT EXISTS payments_open ON payments (status, created_at);
    CREATE TABLE IF NOT EXISTS subscriptions (
      player_id INTEGER NOT NULL REFERENCES players(id),
      track TEXT NOT NULL,
      until INTEGER NOT NULL,
      PRIMARY KEY (player_id, track)
    );
    CREATE TABLE IF NOT EXISTS duels (
      code TEXT PRIMARY KEY,
      words TEXT NOT NULL,
      creator_id INTEGER NOT NULL REFERENCES players(id),
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS duel_players (
      code TEXT NOT NULL REFERENCES duels(code),
      player_id INTEGER NOT NULL REFERENCES players(id),
      score INTEGER,
      correct INTEGER,
      ms INTEGER,
      finished_at INTEGER,
      PRIMARY KEY (code, player_id)
    );
  `);
  // Telegram orqali kirish (OD-05, 2026-11-15): qo'shimcha ustun, mavjud ma'lumotga tegmaydi
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('tg_id')) db.exec('ALTER TABLE players ADD COLUMN tg_id INTEGER');
  // Rollar (2026-11-17): admin va metodist kabineti uchun
  if (!cols.includes('role')) db.exec('ALTER TABLE players ADD COLUMN role TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS players_tg ON players (tg_id) WHERE tg_id IS NOT NULL');
  // Hisob progressi (2026-11-17): o'quvchining qurilmadagi ma'lumotlari hisobga saqlanadi — boshqa qurilmada kirsa ham ko'rinadi
  // Sessiyalar (2026-11-17): har qurilma — alohida token; bazada faqat SHA-256 xeshi saqlanadi. Eski players.token
  // vaqtincha qoladi (orqaga qaytish xavfsiz bo'lishi uchun) va birinchi ishlatilganda sessiyaga ko'chiriladi.
  db.exec('CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL REFERENCES players(id), token_hash TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, last_seen INTEGER NOT NULL, revoked_at INTEGER)');
  db.exec('CREATE INDEX IF NOT EXISTS sessions_player ON sessions (player_id)');
  ensureXpTables(db);
  ensureReminderColumns(db);
  ensureI18nTables(db);
  ensureReferralColumns(db);
  ensureGroupTables(db);
  ensureLeagueNotifyColumn(db);
  ensureLeagueTables(db);
  db.exec('CREATE TABLE IF NOT EXISTS progress (player_id INTEGER PRIMARY KEY REFERENCES players(id), data TEXT NOT NULL, rev INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)');
  return db;
}

export const PROGRESS_MAX = 600_000; // bayt (JSON)
/** Hisob progressini o'qiydi (yo'q bo'lsa data = null). */
export function getProgress(db: DatabaseSync, token: string): { data: Record<string, string> | null; rev: number; updated_at: number } {
  const p = byToken(db, token);
  const r = db.prepare('SELECT data, rev, updated_at FROM progress WHERE player_id = ?').get(p.id) as { data: string; rev: number; updated_at: number } | undefined;
  return r ? { data: JSON.parse(r.data) as Record<string, string>, rev: r.rev, updated_at: r.updated_at } : { data: null, rev: 0, updated_at: 0 };
}
/**
 * Hisob progressini yozadi. baseRev — mijoz oxirgi ko'rgan versiya: boshqa qurilma yangiroq versiya yozgan bo'lsa 409
 * (mijoz avval yangisini oladi) — shunda eski qurilma yangi progressni ustidan yozib yubormaydi.
 */
export function putProgress(db: DatabaseSync, token: string, data: unknown, baseRev: number, now = Date.now()): { rev: number } {
  const p = byToken(db, token);
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ApiError(400, 'Noto‘g‘ri ma’lumot');
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (!/^bandly\.[\w.:-]{1,80}$/.test(k) || typeof v !== 'string') throw new ApiError(400, 'Noto‘g‘ri kalit');
    clean[k] = v;
  }
  const json = JSON.stringify(clean);
  if (json.length > PROGRESS_MAX) throw new ApiError(413, 'Progress juda katta');
  const cur = db.prepare('SELECT rev FROM progress WHERE player_id = ?').get(p.id) as { rev: number } | undefined;
  if (cur && Number(baseRev) !== cur.rev) throw new ApiError(409, 'Progress boshqa qurilmada yangilangan');
  const rev = (cur?.rev ?? 0) + 1;
  db.prepare('INSERT INTO progress (player_id, data, rev, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(player_id) DO UPDATE SET data = excluded.data, rev = excluded.rev, updated_at = excluded.updated_at').run(p.id, json, rev, now);
  return { rev };
}

/**
 * Telegram foydalanuvchisi bilan kirish:
 *  1) shu Telegram id ga bog'langan hisob bo'lsa — o'sha hisob;
 *  2) aks holda qurilmadagi eski hisob (linkToken) Telegram'ga bog'lanmagan bo'lsa — unga bog'lanadi (XP va obuna saqlanadi);
 *  3) aks holda yangi hisob ochiladi, laqab Telegram ismidan (band bo'lsa raqam qo'shiladi).
 */
export function loginTelegram(db: DatabaseSync, tgId: number, nick: string, linkToken?: string, now = Date.now()): { token: string; nickname: string; linked: boolean; created: boolean } {
  const found = db.prepare('SELECT id, nickname FROM players WHERE tg_id = ?').get(tgId) as { id: number; nickname: string } | undefined;
  if (found) return { token: newSession(db, found.id, now), nickname: found.nickname, linked: false, created: false };
  if (linkToken) {
    const lid = playerIdOf(db, linkToken, now);
    const legacy = lid === null ? undefined : db.prepare('SELECT id, nickname FROM players WHERE id = ? AND tg_id IS NULL').get(lid) as { id: number; nickname: string } | undefined;
    if (legacy) {
      db.prepare('UPDATE players SET tg_id = ?, updated_at = ? WHERE id = ?').run(tgId, now, legacy.id);
      return { token: newSession(db, legacy.id, now), nickname: legacy.nickname, linked: true, created: false };
    }
  }
  for (let i = 0; i < 50; i++) {
    const n = i === 0 ? nick : `${nick.slice(0, 16)}${randomInt(10, 10000)}`;
    try {
      const id = Number(db.prepare('INSERT INTO players (token, nickname, tg_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)').run(placeholder(), n, tgId, now, now).lastInsertRowid);
      return { token: newSession(db, id, now), nickname: n, linked: false, created: true };
    } catch { /* laqab band — boshqasini sinaymiz */ }
  }
  throw new ApiError(409, 'Hisob ochib bo‘lmadi, qayta urinib ko‘ring');
}

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const NICK_RE = /^[\p{L}\p{N}_.\- ]{2,20}$/u;

export function join(db: DatabaseSync, nickname: string, now = Date.now()): { token: string; nickname: string } {
  const nick = (nickname ?? '').trim().replace(/\s+/g, ' ');
  if (!NICK_RE.test(nick)) throw new ApiError(400, 'Laqab 2–20 belgi: harf, raqam, bo‘shliq, _ . -');
  let id: number;
  try {
    id = Number(db.prepare('INSERT INTO players (token, nickname, created_at, updated_at) VALUES (?, ?, ?, ?)').run(placeholder(), nick, now, now).lastInsertRowid);
  } catch {
    throw new ApiError(409, 'Bu laqab band');
  }
  return { token: newSession(db, id, now), nickname: nick };
}

export interface Player { id: number; nickname: string; xp: number; streak: number }

export const hashToken = (t: string): string => createHash('sha256').update(t).digest('hex');
/** players.token ustuniga yoziladigan, hech qachon mijozga berilmaydigan qiymat (ustun NOT NULL UNIQUE). */
const placeholder = (): string => `s:${randomBytes(18).toString('hex')}`;
/** Yangi qurilma sessiyasi: xom token faqat mijozga qaytariladi, bazada xeshi. */
export function newSession(db: DatabaseSync, playerId: number, now = Date.now()): string {
  const token = randomBytes(24).toString('hex');
  db.prepare('INSERT INTO sessions (player_id, token_hash, created_at, last_seen) VALUES (?, ?, ?, ?)').run(playerId, hashToken(token), now, now);
  return token;
}
const TOKEN_RE = /^[a-f0-9]{48}$/;
/** Token egasini topadi: avval sessiyalar (xesh), keyin eski players.token (topilsa — sessiyaga ko'chiriladi). */
export function playerIdOf(db: DatabaseSync, token: string | undefined, now = Date.now()): number | null {
  if (!token || !TOKEN_RE.test(token)) return null;
  const h = hashToken(token);
  const s = db.prepare('SELECT id, player_id, revoked_at, last_seen FROM sessions WHERE token_hash = ?').get(h) as { id: number; player_id: number; revoked_at: number | null; last_seen: number } | undefined;
  if (s) {
    if (s.revoked_at) return null;
    if (now - s.last_seen > 3_600_000) db.prepare('UPDATE sessions SET last_seen = ? WHERE id = ?').run(now, s.id);
    return s.player_id;
  }
  const legacy = db.prepare('SELECT id FROM players WHERE token = ?').get(token) as { id: number } | undefined;
  if (!legacy) return null;
  db.prepare('INSERT OR IGNORE INTO sessions (player_id, token_hash, created_at, last_seen) VALUES (?, ?, ?, ?)').run(legacy.id, h, now, now);
  return legacy.id;
}
export const byToken = (db: DatabaseSync, token: string): Player => {
  const id = playerIdOf(db, token);
  const p = id === null ? undefined : db.prepare('SELECT id, nickname, xp, streak FROM players WHERE id = ?').get(id) as Player | undefined;
  if (!p) throw new ApiError(401, 'Noma’lum token');
  return p;
};
export type Role = 'admin' | 'methodologist' | 'creator' | 'teacher';
export const ROLES: Role[] = ['admin', 'methodologist', 'creator', 'teacher'];
/** Egasi Railway'da ADMIN_NICKNAMES (vergul bilan) kiritgan laqablar avtomatik admin bo'ladi. */
const adminNicks = (env: NodeJS.ProcessEnv = process.env): string[] => (env.ADMIN_NICKNAMES ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
export function roleOf(db: DatabaseSync, playerId: number, env: NodeJS.ProcessEnv = process.env): Role | null {
  const r = db.prepare('SELECT role, nickname FROM players WHERE id = ?').get(playerId) as { role: string | null; nickname: string } | undefined;
  if (!r) return null;
  if (adminNicks(env).includes(r.nickname.toLowerCase())) return 'admin';
  return (ROLES as string[]).includes(r.role ?? '') ? (r.role as Role) : null;
}
export const staffList = (db: DatabaseSync) => db.prepare("SELECT nickname, role FROM players WHERE role IS NOT NULL ORDER BY role, nickname").all() as { nickname: string; role: Role }[];
/** Token egasining roli talab qilinadi (admin hamma ruxsatga ega). */
export function requireRole(db: DatabaseSync, token: string, allowed: Role[]): Player & { role: Role } {
  const p = byToken(db, token);
  const role = roleOf(db, p.id);
  if (!role || (role !== 'admin' && !allowed.includes(role))) throw new ApiError(403, 'Bu bo‘lim uchun ruxsat yo‘q');
  return { ...p, role };
}
/** Laqab bo'yicha rol beradi yoki olib tashlaydi (role = null). */
export function setRole(db: DatabaseSync, nickname: string, role: Role | null): { nickname: string; role: Role | null } {
  if (role !== null && !ROLES.includes(role)) throw new ApiError(400, 'Noma’lum rol');
  const p = db.prepare('SELECT id, nickname FROM players WHERE lower(nickname) = lower(?)').get(nickname) as { id: number; nickname: string } | undefined;
  if (!p) throw new ApiError(404, 'Foydalanuvchi topilmadi');
  db.prepare('UPDATE players SET role = ? WHERE id = ?').run(role, p.id);
  return { nickname: p.nickname, role };
}

/** Chiqish: shu qurilma sessiyasi bekor qilinadi (eski umumiy token bo'lsa — u ham shu sessiya orqali bekor bo'ladi). */
export function revokeSession(db: DatabaseSync, token: string, now = Date.now()): void {
  if (!token || !TOKEN_RE.test(token)) return;
  playerIdOf(db, token, now); // eski tokenni sessiyaga ko'chiradi
  db.prepare('UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL').run(now, hashToken(token));
}

/** Mijoz o'zining umumiy XP sini yuboradi; server faqat chegaralangan o'sishni qabul qiladi. */
export function sync(db: DatabaseSync, token: string, _clientXp: number, streak: number, now = Date.now()): { xp: number; accepted: number } {
  // XP endi faqat hodisalar orqali (server/xp.ts, POST /api/xp); bu yerda mijozning umumiy XP siga ishonilmaydi.
  const p = byToken(db, token);
  const st = Number.isFinite(streak) ? Math.min(3650, Math.max(0, Math.floor(streak))) : p.streak;
  db.prepare('UPDATE players SET streak = ?, updated_at = ? WHERE id = ?').run(st, now, p.id);
  return { xp: p.xp, accepted: 0 };
}

/** Joriy haftaning boshi: dushanba 00:00 UTC */
export function weekStart(now: number): number {
  const d = new Date(now);
  const dow = (d.getUTCDay() + 6) % 7; // dushanba = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow);
}

export interface Row { rank: number; nickname: string; xp: number; streak: number; me: boolean }

export function leaderboard(db: DatabaseSync, period: 'week' | 'all', token: string | undefined, now = Date.now()): { top: Row[]; me: Row | null; since: number | null } {
  const since = period === 'week' ? weekStart(now) : null;
  const rows = (period === 'week'
    ? db.prepare(`SELECT p.id, p.nickname, p.streak, SUM(l.delta) AS xp FROM xp_log l JOIN players p ON p.id = l.player_id WHERE l.ts >= ? GROUP BY p.id ORDER BY xp DESC, p.id ASC`).all(since)
    : db.prepare('SELECT id, nickname, streak, xp FROM players WHERE xp > 0 ORDER BY xp DESC, id ASC').all()) as { id: number; nickname: string; streak: number; xp: number }[];
  const meId = playerIdOf(db, token, now);
  const ranked: Row[] = rows.map((r, i) => ({ rank: i + 1, nickname: r.nickname, xp: r.xp, streak: r.streak, me: meId !== null && r.id === meId }));
  return { top: ranked.slice(0, 20), me: ranked.find((r) => r.me) ?? null, since };
}

// ---------------- Duel ----------------
export const DUEL_WORDS = 10;
export const DUEL_TTL = 48 * 3_600_000;
export const DUEL_MAX_PLAYERS = 8;
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function createDuel(db: DatabaseSync, token: string, now = Date.now()): { code: string; words: string[] } {
  const p = byToken(db, token);
  const recent = (db.prepare('SELECT COUNT(*) AS n FROM duels WHERE creator_id = ? AND created_at > ?').get(p.id, now - 3_600_000) as { n: number }).n;
  if (recent >= 10) throw new ApiError(429, 'Soatiga 10 tadan ko‘p duel ochib bo‘lmaydi');
  const ids = vocab.map((w) => w.id);
  const words: string[] = [];
  while (words.length < DUEL_WORDS) {
    const id = ids[randomInt(ids.length)];
    if (!words.includes(id)) words.push(id);
  }
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
    try {
      db.prepare('INSERT INTO duels (code, words, creator_id, created_at) VALUES (?, ?, ?, ?)').run(code, JSON.stringify(words), p.id, now);
      db.prepare('INSERT INTO duel_players (code, player_id) VALUES (?, ?)').run(code, p.id);
      return { code, words };
    } catch { /* kod band, qayta uriniladi */ }
  }
  throw new ApiError(500, 'Kod yaratib bo‘lmadi');
}

export interface DuelInfo {
  code: string;
  words: string[];
  expired: boolean;
  full: boolean;
  players: { nickname: string; score: number | null; correct: number | null; ms: number | null; me: boolean; rank: number | null }[];
  iFinished: boolean;
}

export function getDuel(db: DatabaseSync, code: string, token: string | undefined, now = Date.now()): DuelInfo {
  const d = db.prepare('SELECT code, words, created_at FROM duels WHERE code = ?').get((code ?? '').toUpperCase()) as { code: string; words: string; created_at: number } | undefined;
  if (!d) throw new ApiError(404, 'Duel topilmadi');
  const rows = db.prepare(`SELECT p.id, p.nickname, dp.score, dp.correct, dp.ms FROM duel_players dp JOIN players p ON p.id = dp.player_id WHERE dp.code = ?
    ORDER BY (dp.score IS NULL), dp.score DESC, dp.ms ASC, dp.player_id ASC`).all(d.code) as { id: number; nickname: string; score: number | null; correct: number | null; ms: number | null }[];
  const meId = playerIdOf(db, token, now);
  let rank = 0;
  const players = rows.map((r) => ({
    nickname: r.nickname, score: r.score, correct: r.correct, ms: r.ms,
    me: meId !== null && r.id === meId, rank: r.score === null ? null : ++rank,
  }));
  return { code: d.code, words: JSON.parse(d.words) as string[], expired: now - d.created_at > DUEL_TTL, full: rows.length >= DUEL_MAX_PLAYERS, players, iFinished: players.some((p) => p.me && p.score !== null) };
}

export function submitDuel(db: DatabaseSync, token: string, code: string, score: number, correct: number, ms: number, now = Date.now()): DuelInfo {
  const p = byToken(db, token);
  const info = getDuel(db, code, token, now);
  if (info.expired) throw new ApiError(410, 'Duel muddati tugagan');
  if (info.iFinished) throw new ApiError(409, 'Siz allaqachon qatnashgansiz');
  const joined = info.players.some((x) => x.me);
  if (!joined && info.full) throw new ApiError(409, 'Duel to‘lgan');
  const c = Math.floor(correct), sc = Math.floor(score), t = Math.floor(ms);
  // Haqiqiy bo'lishi mumkin bo'lgan natijalar: har to'g'ri javob 100–150 ball, vaqt kamida 0.5 soniya/savol
  if (!(c >= 0 && c <= DUEL_WORDS) || !Number.isFinite(sc) || sc < c * 100 || sc > c * 150 || !(t >= DUEL_WORDS * 500 && t <= DUEL_WORDS * 60_000)) {
    throw new ApiError(400, 'Natija yaroqsiz');
  }
  if (!joined) db.prepare('INSERT INTO duel_players (code, player_id) VALUES (?, ?)').run(info.code, p.id);
  db.prepare('UPDATE duel_players SET score = ?, correct = ?, ms = ?, finished_at = ? WHERE code = ? AND player_id = ?').run(sc, c, t, now, info.code, p.id);
  return getDuel(db, info.code, token, now);
}

// ---------------- AI foydalanish limiti ----------------
/** Platform-wide daily ceiling for AI calls. FAIL-CLOSED: no configured limit (or 0) means no call is allowed. */
export function useGlobalAi(db: DatabaseSync, limit: number, now = Date.now()): number {
  if (!Number.isFinite(limit) || limit <= 0) throw new ApiError(503, 'AI ustoz hali sozlanmagan: umumiy kunlik chegara belgilanmagan.');
  const day = tzDay(now);
  const row = db.prepare('SELECT calls FROM ai_global_usage WHERE day = ?').get(day) as { calls: number } | undefined;
  if ((row?.calls ?? 0) >= limit) throw new ApiError(503, 'Bugungi umumiy AI chegarasi tugadi. Ertaga qayta urinib ko‘ring.');
  db.prepare('INSERT INTO ai_global_usage (day, calls) VALUES (?, 1) ON CONFLICT(day) DO UPDATE SET calls = calls + 1').run(day);
  return (row?.calls ?? 0) + 1;
}

export const AI_DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT ?? 120);

/** Har bir AI so'rovdan oldin chaqiriladi: token tekshiriladi va kunlik limit hisoblanadi. */
export function useAi(db: DatabaseSync, token: string, now = Date.now(), limit = AI_DAILY_LIMIT, bucket = ''): number {
  const p = byToken(db, token);
  const day = (bucket ? `${bucket}:` : '') + tzDay(now);
  const row = db.prepare('SELECT calls FROM ai_usage WHERE player_id = ? AND day = ?').get(p.id, day) as { calls: number } | undefined;
  if ((row?.calls ?? 0) >= limit) throw new ApiError(429, 'Bugungi AI limiti tugadi. Ertaga qayta urinib ko‘ring.');
  db.prepare('INSERT INTO ai_usage (player_id, day, calls) VALUES (?, ?, 1) ON CONFLICT(player_id, day) DO UPDATE SET calls = calls + 1').run(p.id, day);
  return (row?.calls ?? 0) + 1;
}

// ---------------- AI xarajatlari jurnali (AI_COST_CONTROL_SPEC.md §2) ----------------
export interface CostEvent { playerId: number | null; feature: string; provider: string; model: string; units: number; unitKind: 'chars' | 'seconds' | 'tokens'; costUsd: number; estimated?: boolean }

/** Har bir xarajatli AI chaqiruvini yozadi (keshdan berilganlar yozilmaydi). Kun = UTC sana. */
export function recordAiCost(db: DatabaseSync, e: CostEvent, now = Date.now()): void {
  db.prepare('INSERT INTO ai_cost_events (ts, day, player_id, feature, provider, model, units, unit_kind, cost_usd, estimated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(now, tzDay(now), e.playerId, e.feature, e.provider, e.model, Math.max(0, Math.round(e.units)), e.unitKind, Math.max(0, e.costUsd), e.estimated === false ? 0 : 1);
}

export interface CostRow { day: string; feature: string; provider: string; model: string; events: number; units: number; cost_usd: number; players: number }
/** Kun / funksiya / provayder / model bo'yicha jamlanma (egasining 30 kunlik test hisoboti uchun). */
export function aiCostSummary(db: DatabaseSync, days = 30, now = Date.now()): { rows: CostRow[]; total_usd: number } {
  const since = tzDay(now - Math.max(1, Math.min(366, days)) * 86_400_000);
  const rows = db.prepare(`SELECT day, feature, provider, model, COUNT(*) AS events, SUM(units) AS units, ROUND(SUM(cost_usd), 6) AS cost_usd, COUNT(DISTINCT player_id) AS players
    FROM ai_cost_events WHERE day >= ? GROUP BY day, feature, provider, model ORDER BY day DESC, cost_usd DESC`).all(since) as unknown as CostRow[];
  const total = rows.reduce((a, r) => a + r.cost_usd, 0);
  return { rows, total_usd: Math.round(total * 1e6) / 1e6 };
}

/** Platforma bo'yicha kunlik ovoz belgilar chegarasi. FAIL-CLOSED: chegara 0 bo'lsa hech narsa yuborilmaydi. */
export function useGlobalVoiceChars(db: DatabaseSync, limit: number, chars: number, now = Date.now()): number {
  if (!Number.isFinite(limit) || limit <= 0) throw new ApiError(503, 'Ovoz xizmati sozlanmagan: umumiy kunlik chegara belgilanmagan.');
  const day = `voice-chars:${tzDay(now)}`;
  const row = db.prepare('SELECT calls FROM ai_global_usage WHERE day = ?').get(day) as { calls: number } | undefined;
  const used = row?.calls ?? 0;
  if (used + chars > limit) throw new ApiError(503, 'Bugungi umumiy ovoz chegarasi tugadi.');
  db.prepare('INSERT INTO ai_global_usage (day, calls) VALUES (?, ?) ON CONFLICT(day) DO UPDATE SET calls = calls + ?').run(day, chars, chars);
  return used + chars;
}

/** Muvaffaqiyatsiz provayder chaqiruvidan keyin limitni qaytaradi (o'quvchi bizning xatomiz uchun to'lamaydi). */
export function refundAi(db: DatabaseSync, playerId: number, bucket: string, now = Date.now()): void {
  const day = (bucket ? `${bucket}:` : '') + tzDay(now);
  db.prepare('UPDATE ai_usage SET calls = MAX(0, calls - 1) WHERE player_id = ? AND day = ?').run(playerId, day);
}
/** Umumiy kunlik AI chegarasidan bitta chaqiruvni qaytaradi (provayder xato berganda). */
export function refundGlobalAi(db: DatabaseSync, now = Date.now()): void {
  db.prepare('UPDATE ai_global_usage SET calls = MAX(0, calls - 1) WHERE day = ?').run(tzDay(now));
}
export function refundGlobalVoiceChars(db: DatabaseSync, chars: number, now = Date.now()): void {
  db.prepare('UPDATE ai_global_usage SET calls = MAX(0, calls - ?) WHERE day = ?').run(chars, `voice-chars:${tzDay(now)}`);
}
