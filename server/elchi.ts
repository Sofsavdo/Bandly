// Elchi dasturi (egasi, 2026-11-26): video qilmaydiganlar ham blogerlarni hamkorlikka olib kelib pul ishlaydi.
//   - elchi — tasdiqlangan hamkor (creator); u bir vaqtda bloger ham bo'la oladi (o'z videolari uchun alohida to'lov);
//   - bloger elchi havolasi (#/partners?elchi=<kod>) orqali hisobiga kirib ariza qoldiradi → elchiga bog'lanadi (bir marta, birinchisi);
//   - "faol bloger" — birinchi videosining hisobi admin tomonidan TASDIQLANGAN bloger; shu paytda elchiga bir martalik summa (25 000 so'm);
//   - oylik bonus: shu oyda faol bo'lgan blogerlar soni bo'yicha — 5 ta → +50 000, 10 ta → +150 000 so'm (qo'shilmaydi, eng yuqorisi);
//   - eng kam auditoriya — 1 000 obunachi (ariza formasi va bog'lash shu shart bilan); oylik byudjet chegarasi yo'q;
//   - summalar admin panelda (video shartlari bilan birga: videoPay.ts) tahrirlanadi; pul daftarga (creator_ledger) tushadi va 14 kun ichida to'lanadi.
// Himoya: o'zini o'zi olib kelish, avvaldan hamkor bo'lganlar va bir qurilma gumoni sanalmaydi.
import type { DatabaseSync } from 'node:sqlite';
import { audit } from './certificates';
import { tx } from './db';
import { addFlag } from './creatorLinks';
import { creatorOk, flaggedPlayer, LEDGER_CURRENCY } from './creatorLedger';
import { resolveCreatorCode } from './creatorLinks';
import { tzDay } from './day';
import { refCodeOf } from './referral';
import { tierBonus, videoTerms, type Tier } from './videoPay';

const one = <T>(db: DatabaseSync, sql: string, ...p: (string | number)[]): T | undefined => db.prepare(sql).get(...p) as T | undefined;
/** Elchi hisobiga kiradigan auditoriya (1 000 obunachidan kam emas). */
export const ELCHI_AUDIENCES = ['1k-10k', '10k-100k', '100k+'];

export function ensureElchiTables(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS elchi_bloggers (
    blogger_id INTEGER PRIMARY KEY REFERENCES players(id), elchi_id INTEGER NOT NULL REFERENCES players(id), app_id INTEGER, created_at INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS elchi_bloggers_elchi ON elchi_bloggers (elchi_id, created_at);`);
  // fp — bloger arizasidagi qurilma izi (to'lov paytida yana tekshiriladi)
  const cols = (db.prepare('PRAGMA table_info(elchi_bloggers)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('fp')) db.exec('ALTER TABLE elchi_bloggers ADD COLUMN fp TEXT');
}

/** Elchi kirgan qurilmalardan biri shu izmi (creator_profiles.fp_hint — oxirgi kirish qurilmasi). */
const sameDevice = (db: DatabaseSync, elchiId: number, fp: string): boolean => one<{ fp_hint: string | null }>(db, 'SELECT fp_hint FROM creator_profiles WHERE player_id = ?', elchiId)?.fp_hint === fp;
/** Elchi kodi → elchi id (faqat tasdiqlangan hamkor). */
export function elchiByCode(db: DatabaseSync, code: unknown): number | null {
  const r = resolveCreatorCode(db, code);
  return r && creatorOk(db, r.creatorId) ? r.creatorId : null;
}

/** Arizadan keyin blogerni elchiga bog'laydi. Bog'lanmaydi: o'zi, allaqachon hamkor, allaqachon boshqa elchiga bog'langan, kichik auditoriya, bir qurilma gumoni. */
export function bindElchi(db: DatabaseSync, elchiId: number, bloggerId: number, appId: number, audience: string, fp: string | null, now = Date.now()): boolean {
  if (elchiId === bloggerId || !ELCHI_AUDIENCES.includes(audience)) return false;
  if (one(db, "SELECT 1 FROM players WHERE id = ? AND role = 'creator'", bloggerId)) return false; // avvaldan hamkor — elchi olib kelmagan
  if (one(db, 'SELECT 1 FROM creator_flags WHERE dedupe_key = ?', `sr:${elchiId}:${bloggerId}`)) return false; // tasdiqlangan o'z-o'zini taklif
  // O'zining ikkinchi hisobi bo'lishi mumkin (elchi kirgan qurilma = bloger qurilmasi): bog'lanadi, lekin to'lov admin tasdig'ini kutadi
  // (bir uy yoki bir Wi-Fi'da bir xil telefon ishlatadigan ikki odam ham bo'lishi mumkin — to'lov indamay yo'qolmasin)
  if (fp && sameDevice(db, elchiId, fp)) addFlag(db, elchiId, null, 'same_device_signups', JSON.stringify({ elchi: true, blogger: bloggerId }), `sds:${elchiId}:${fp}:elchi${bloggerId}`, now);
  const r = db.prepare('INSERT OR IGNORE INTO elchi_bloggers (blogger_id, elchi_id, app_id, created_at, fp) VALUES (?, ?, ?, ?, ?)').run(bloggerId, elchiId, appId, now, fp);
  return r.changes > 0;
}

const month = (t: number): string => tzDay(t).slice(0, 7);

/** Video hisobi tasdiqlanganda chaqiriladi: blogerning BIRINCHI tasdiqlangan videosi — elchiga summa va kerak bo'lsa oylik bonus. Takroriy chaqiruv xavfsiz (event_key UNIQUE). */
export function onVideoApproved(db: DatabaseSync, ledgerId: number, now = Date.now()): { paid: number; tier: number } {
  return tx(db, () => onVideoApprovedTx(db, ledgerId, now)); // summa va oylik bonus birga yoziladi yoki hech biri
}
function onVideoApprovedTx(db: DatabaseSync, ledgerId: number, now: number): { paid: number; tier: number } {
  const e = one<{ creator_id: number; kind: string; status: string }>(db, 'SELECT creator_id, kind, status FROM creator_ledger WHERE id = ?', ledgerId);
  if (!e || e.kind !== 'video' || (e.status !== 'approved' && e.status !== 'paid')) return { paid: 0, tier: 0 };
  const b = one<{ elchi_id: number; fp: string | null }>(db, 'SELECT elchi_id, fp FROM elchi_bloggers WHERE blogger_id = ?', e.creator_id);
  if (!b || !creatorOk(db, b.elchi_id)) return { paid: 0, tier: 0 };
  // To'lov paytida qayta tekshiruv: gumon bo'lsa (bir qurilma, ochiq belgi) — summa yoziladi, lekin admin tasdig'ini kutadi va oylik bonusga kirmaydi
  const suspect = flaggedPlayer(db, b.elchi_id, e.creator_id, b.fp, null) || (!!b.fp && sameDevice(db, b.elchi_id, b.fp));
  const t = videoTerms(db);
  if (!t.enabled || t.elchiSom <= 0) return { paid: 0, tier: 0 };
  const ins = (key: string, kind: string, som: number, basis: Record<string, unknown>, pending = false): boolean => {
    const st = pending ? 'pending' : 'approved';
    const r = db.prepare(`INSERT OR IGNORE INTO creator_ledger (creator_id, campaign_id, kind, event_key, amount_minor, currency, status, basis, note, created_at, decided_at)
      VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(b.elchi_id, kind, key, som * 100, LEDGER_CURRENCY, st, JSON.stringify({ ...basis, payDays: t.payDays }), pending ? 'Gumon: bir qurilma — admin tekshiradi' : null, now, pending ? null : now);
    if (!r.changes) return false;
    db.prepare('INSERT INTO creator_ledger_history (ledger_id, ts, actor_id, from_status, to_status, note) VALUES (?, ?, NULL, NULL, ?, ?)').run(Number(r.lastInsertRowid), now, st, pending ? 'elchi_suspect' : 'elchi_auto');
    return true;
  };
  if (!ins(`elchi:${e.creator_id}`, 'elchi', t.elchiSom, { blogger: e.creator_id, video: ledgerId, month: month(now) }, suspect)) return { paid: 0, tier: 0 };
  if (suspect) return { paid: t.elchiSom, tier: 0 };
  audit(db, null, 'creator.elchi.active', String(e.creator_id), { elchi: b.elchi_id, som: t.elchiSom }, now);
  // Oylik bonus: shu oydagi faol blogerlar soni; avval berilgan bonus ayirib tashlanadi (pog'onalar qo'shilmaydi)
  const m = month(now);
  const active = activeIn(db, b.elchi_id, m);
  const target = tierBonus(t.elchiTiers, active);
  const given = Number(one<{ s: number }>(db, "SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE creator_id = ? AND kind = 'elchi_tier' AND event_key LIKE ? AND status != 'rejected'", b.elchi_id, `elchi_tier:${b.elchi_id}:${m}:%`)?.s ?? 0) / 100;
  const extra = target - given;
  if (extra > 0) ins(`elchi_tier:${b.elchi_id}:${m}:${active}`, 'elchi_tier', extra, { month: m, active, tierSom: target });
  return { paid: t.elchiSom, tier: Math.max(0, extra) };
}

/** Oylik bonus uchun: shu oyda TASDIQLANGAN faol blogerlar (gumon bilan kutilayotganlari kirmaydi). */
const activeIn = (db: DatabaseSync, elchiId: number, m: string): number =>
  (db.prepare("SELECT created_at AS c FROM creator_ledger WHERE creator_id = ? AND kind = 'elchi' AND status IN ('approved', 'paid')").all(elchiId) as { c: number }[]).filter((r) => month(r.c) === m).length;

export interface ElchiInfo {
  total: number; activeTotal: number;
  code: string; som: number; tiers: Tier[]; payDays: number; windowDays: number; enabled: boolean;
  month: string; activeThisMonth: number; next: { need: number; som: number } | null;
  bloggers: { nickname: string; joinedAt: number; activeAt: number | null }[];
  earnedSom: number;
}
/** Elchi kabineti: havola kodi, shartlar, olib kelgan blogerlari (laqab, qachon faol bo'lgan) va keyingi bonusgacha qancha qolgani. */
export function elchiInfo(db: DatabaseSync, elchiId: number, now = Date.now()): ElchiInfo {
  const t = videoTerms(db); const m = month(now);
  const rows = db.prepare(`SELECT p.nickname, b.created_at AS joined, b.blogger_id AS id FROM elchi_bloggers b JOIN players p ON p.id = b.blogger_id WHERE b.elchi_id = ? ORDER BY b.created_at DESC LIMIT 200`).all(elchiId) as { nickname: string; joined: number; id: number }[];
  const act = new Map((db.prepare("SELECT event_key AS k, created_at AS c FROM creator_ledger WHERE creator_id = ? AND kind = 'elchi' AND status != 'rejected'").all(elchiId) as { k: string; c: number }[]).map((r) => [Number(r.k.slice(6)), r.c]));
  const active = activeIn(db, elchiId, m);
  const nextTier = t.elchiTiers.find((x) => x.min > active) ?? null;
  const cur = tierBonus(t.elchiTiers, active);
  const earned = Number(one<{ s: number }>(db, "SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE creator_id = ? AND kind IN ('elchi', 'elchi_tier') AND status != 'rejected'", elchiId)?.s ?? 0) / 100;
  return {
    total: Number(one<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM elchi_bloggers WHERE elchi_id = ?', elchiId)?.n ?? 0),
    activeTotal: Number(one<{ n: number }>(db, "SELECT COUNT(*) AS n FROM creator_ledger WHERE creator_id = ? AND kind = 'elchi' AND status != 'rejected'", elchiId)?.n ?? 0),
    code: refCodeOf(db, elchiId), som: t.elchiSom, tiers: t.elchiTiers, payDays: t.payDays, windowDays: t.windowDays, enabled: t.enabled && t.elchiSom > 0,
    month: m, activeThisMonth: active, next: nextTier ? { need: nextTier.min - active, som: nextTier.som - cur } : null,
    bloggers: rows.map((r) => ({ nickname: r.nickname, joinedAt: r.joined, activeAt: act.get(r.id) ?? null })),
    earnedSom: earned,
  };
}

/** Admin: ariza qaysi elchi orqali kelgan (laqab). */
export function elchiNickOfApp(db: DatabaseSync, appId: number): string | null {
  return one<{ nickname: string }>(db, 'SELECT p.nickname FROM elchi_bloggers b JOIN players p ON p.id = b.elchi_id WHERE b.app_id = ?', appId)?.nickname ?? null;
}

/** Xavfsizlik to'ri (har soat, mukofot hisoblash bilan birga): tasdiqlangan video bo'lsa-yu, elchi summasi yozilmagan bo'lsa — yozadi (takror yozmaydi). */
export function reconcileElchi(db: DatabaseSync, now = Date.now()): number {
  const rows = db.prepare(`SELECT MIN(l.id) AS id FROM creator_ledger l JOIN elchi_bloggers b ON b.blogger_id = l.creator_id
    WHERE l.kind = 'video' AND l.status IN ('approved', 'paid')
      AND NOT EXISTS (SELECT 1 FROM creator_ledger x WHERE x.event_key = 'elchi:' || l.creator_id) GROUP BY l.creator_id`).all() as { id: number }[];
  let n = 0;
  for (const r of rows) { try { if (onVideoApproved(db, r.id, now).paid > 0) n++; } catch { /* keyingi safar */ } }
  return n;
}
