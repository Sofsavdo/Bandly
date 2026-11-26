// Blogerlarga har bir video uchun to'lov. Egasi (2026-11-26) belgilagan model:
//   - har bir tasdiqlangan video uchun asosiy to'lov (kamida 50 000 so'm);
//   - talablar: sellzen.uz yoki shaxsiy havola bio'da va izohda, Sellzen Instagram sahifasi belgilangan;
//   - bonus: shu videoning (umumiy emas) ko'rishlari — 10 000 → +50 000, 100 000 → +200 000 so'm;
//     shu video havolasi orqali kelgan o'quvchilar — 50 → +50 000, 100+ → +150 000 so'm (har biri bir martalik, eng yuqori pog'ona);
//   - hisob video joylanganidan 15 kun o'tgach BIR MARTA qilinadi; keyingi o'sish (20–30-kun) qo'shimcha to'lanmaydi;
//   - hisobni admin qiladi va tasdiqlaydi; tasdiqlangan summa 14 kun ichida to'lanadi; summalar, normalar va muddatlarni admin tahrirlaydi.
// Misollar (egasi): 9 999 ko'rish + 49 o'quvchi → 50 000; 99 000 + 99 → 50 000 + 50 000 + 50 000 = 150 000; 100 000 + 100 → 50 000 + 200 000 + 150 000 = 400 000.
// "Kelgan o'quvchi" — videoning shaxsiy havolasi orqali 15 kun ichida ro'yxatdan o'tib, shu muddatda kamida bitta dars/test boshlagan
// o'quvchi (soxta hisoblar sanalmasligi uchun; o'z-o'zini taklif va gumonli belgilar chiqarib tashlanadi).
// Pul daftarga (creator_ledger) kind='video' yozuvi bo'lib tushadi: kutilmoqda → admin tasdiqlaydi → to'langan (mavjud oqim).
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, tx } from './db';
import { audit } from './certificates';
import { creatorOk, flaggedPlayer, LEDGER_CURRENCY } from './creatorLedger';
import { creditMode } from './creatorLinks';

const DAY = 86_400_000;
export interface Tier { min: number; som: number }
export interface VideoTerms { enabled: boolean; baseSom: number; windowDays: number; payDays: number; viewTiers: Tier[]; learnerTiers: Tier[]; instagram: string; updatedAt: number | null }

/** Egasi tasdiqlagan boshlang'ich shartlar (admin keyin o'zgartira oladi). */
export const DEFAULT_TERMS: Omit<VideoTerms, 'updatedAt'> = {
  enabled: true, baseSom: 50_000, windowDays: 15, payDays: 14,
  viewTiers: [{ min: 10_000, som: 50_000 }, { min: 100_000, som: 200_000 }],
  learnerTiers: [{ min: 50, som: 50_000 }, { min: 100, som: 150_000 }],
  instagram: '',
};

const one = <T>(db: DatabaseSync, sql: string, ...p: (string | number)[]): T | undefined => db.prepare(sql).get(...p) as T | undefined;

export function videoTerms(db: DatabaseSync): VideoTerms {
  const r = one<{ json: string; updated_at: number }>(db, 'SELECT json, updated_at FROM creator_video_terms WHERE id = 1');
  if (!r) return { ...DEFAULT_TERMS, updatedAt: null };
  try { return { ...DEFAULT_TERMS, ...(JSON.parse(r.json) as Partial<VideoTerms>), updatedAt: r.updated_at }; } catch { return { ...DEFAULT_TERMS, updatedAt: r.updated_at }; }
}

const int = (v: unknown, lo: number, hi: number, what: string): number => {
  const n = Number(v); if (!Number.isInteger(n) || n < lo || n > hi) throw new ApiError(400, `${what}: ${lo}–${hi} oralig‘idagi butun son`); return n;
};
function tiers(v: unknown, what: string): Tier[] {
  if (!Array.isArray(v) || v.length > 6) throw new ApiError(400, `${what}: 0–6 ta pog‘ona`);
  const t = v.map((x: { min?: unknown; som?: unknown }) => ({ min: int(x?.min, 1, 1e9, `${what} — norma`), som: int(x?.som, 1, 1e8, `${what} — summa`) })).sort((a, b) => a.min - b.min);
  for (let i = 1; i < t.length; i++) if (t[i]!.min === t[i - 1]!.min) throw new ApiError(400, `${what}: normalar takrorlanmasin`);
  return t;
}

/** Admin shartlarni o'zgartiradi. O'zgarish faqat KEYINGI hisob-kitoblarga ta'sir qiladi (hisoblangan yozuvlar o'zgarmaydi). Audit jurnaliga yoziladi. */
export function setVideoTerms(db: DatabaseSync, adminId: number, b: Record<string, unknown>, now = Date.now()): VideoTerms {
  const cur = videoTerms(db);
  const insta = b.instagram === undefined ? cur.instagram : String(b.instagram ?? '').trim().replace(/^@/, '');
  if (insta && !/^[A-Za-z0-9_.]{2,30}$/.test(insta)) throw new ApiError(400, 'Instagram sahifa nomi noto‘g‘ri (masalan, sellzen.uz)');
  const next: Omit<VideoTerms, 'updatedAt'> = {
    enabled: b.enabled === undefined ? cur.enabled : b.enabled === true,
    baseSom: b.baseSom === undefined ? cur.baseSom : int(b.baseSom, 0, 1e8, 'Asosiy to‘lov (so‘m)'),
    windowDays: b.windowDays === undefined ? cur.windowDays : int(b.windowDays, 1, 90, 'Hisoblash muddati (kun)'),
    payDays: b.payDays === undefined ? cur.payDays : int(b.payDays, 1, 60, 'To‘lov muddati (kun)'),
    viewTiers: b.viewTiers === undefined ? cur.viewTiers : tiers(b.viewTiers, 'Ko‘rishlar bonusi'),
    learnerTiers: b.learnerTiers === undefined ? cur.learnerTiers : tiers(b.learnerTiers, 'O‘quvchilar bonusi'),
    instagram: insta,
  };
  db.prepare('INSERT INTO creator_video_terms (id, json, updated_by, updated_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_by = excluded.updated_by, updated_at = excluded.updated_at').run(JSON.stringify(next), adminId, now);
  audit(db, adminId, 'creator.video.terms', '1', next, now);
  return videoTerms(db);
}

/** Eng yuqori erishilgan pog'ona summasi (pog'onalar qo'shilmaydi). */
export const tierBonus = (t: Tier[], n: number): number => t.reduce((s, x) => (n >= x.min ? x.som : s), 0);
export interface Calc { baseSom: number; views: number; viewBonusSom: number; learners: number; learnerBonusSom: number; totalSom: number }
export const calcVideo = (t: VideoTerms, views: number, learners: number, baseSom = t.baseSom): Calc => {
  const v = tierBonus(t.viewTiers, views), l = tierBonus(t.learnerTiers, learners);
  return { baseSom, views, viewBonusSom: v, learners, learnerBonusSom: l, totalSom: baseSom + v + l };
};

interface PostRow { id: number; creator_id: number; link_code: string | null; posted_on: string | null; status: string; platform: string; url: string | null; claimed_views: number | null }
const postedAt = (p: PostRow): number | null => (p.posted_on && /^\d{4}-\d{2}-\d{2}$/.test(p.posted_on) ? Date.parse(`${p.posted_on}T00:00:00Z`) : null);

/** Shu video havolasi orqali hisoblash muddatida kelib, shu muddatda darsni boshlagan o'quvchilar soni. */
export function videoLearners(db: DatabaseSync, p: PostRow, windowDays: number, env: NodeJS.ProcessEnv = process.env): number {
  const from = postedAt(p); if (from === null || !p.link_code) return 0;
  const to = from + windowDays * DAY; const m = creditMode(env);
  const rows = db.prepare(`SELECT a.player_id AS pid, a.fp, a.last_click AS click FROM creator_attrib a WHERE a.${m}_link = ? AND a.${m}_creator = ? AND a.created_at >= ? AND a.created_at < ?
      AND EXISTS (SELECT 1 FROM xp_events x WHERE x.player_id = a.player_id AND x.source IN ('placement','lesson','mock') AND x.accepted > 0 AND x.ts < ?)`)
    .all(p.link_code, p.creator_id, from, to, to) as { pid: number; fp: string | null; click: string | null }[];
  return rows.filter((r) => r.pid !== p.creator_id && !flaggedPlayer(db, p.creator_id, r.pid, r.fp, r.click)).length;
}

/** payBy — tasdiqlangan summaning oxirgi to'lov sanasi (tasdiqlangan kun + hisob paytidagi to'lov muddati); overdue — muddat o'tgan, hali to'lanmagan. */
export interface VideoEntry { id: number; amountMinor: number; status: string; basis: (Calc & { payDays?: number }) | null; decidedAt: number | null; payBy: number | null; overdue: boolean }
const entryOf = (db: DatabaseSync, postId: number, now = Date.now()): VideoEntry | null => {
  const e = one<{ id: number; amount_minor: number; status: string; basis: string | null; decided_at: number | null }>(db, 'SELECT id, amount_minor, status, basis, decided_at FROM creator_ledger WHERE event_key = ?', `video:${postId}`);
  if (!e) return null;
  let basis: VideoEntry['basis'] = null; try { basis = JSON.parse(e.basis ?? 'null') as VideoEntry['basis']; } catch { /* eski yozuv */ }
  const payDays = basis?.payDays ?? DEFAULT_TERMS.payDays;
  // To'lov muddati faqat TASDIQLANGANDA boshlanadi (to'langandan keyin ham ko'rsatiladi — muddatida to'langanini tekshirish uchun)
  const payBy = (e.status === 'approved' || e.status === 'paid') && e.decided_at !== null ? approvedAt(db, e.id, e.decided_at) + payDays * DAY : null;
  return { id: e.id, amountMinor: e.amount_minor, status: e.status, basis, decidedAt: e.decided_at, payBy, overdue: e.status === 'approved' && payBy !== null && now > payBy };
};
/** Tasdiqlangan vaqt (to'langanda decided_at o'zgaradi — shuning uchun tarixdan olinadi). */
const approvedAt = (db: DatabaseSync, ledgerId: number, fallback: number): number =>
  one<{ ts: number }>(db, "SELECT ts FROM creator_ledger_history WHERE ledger_id = ? AND to_status = 'approved' ORDER BY id LIMIT 1", ledgerId)?.ts ?? fallback;

export interface VideoItem { postId: number; creator?: string; platform: string; url: string | null; postedOn: string | null; dueAt: number | null; due: boolean; learners: number; claimedViews: number | null; entry: VideoEntry | null }
function item(db: DatabaseSync, p: PostRow, t: VideoTerms, now: number, withCreator: boolean): VideoItem {
  const at = postedAt(p); const dueAt = at === null ? null : at + t.windowDays * DAY;
  return { postId: p.id, ...(withCreator ? { creator: one<{ nickname: string }>(db, 'SELECT nickname FROM players WHERE id = ?', p.creator_id)?.nickname } : {}), platform: p.platform, url: p.url, postedOn: p.posted_on,
    dueAt, due: dueAt !== null && now >= dueAt, learners: videoLearners(db, p, t.windowDays), claimedViews: p.claimed_views, entry: entryOf(db, p.id, now) };
}
/** Admin: tasdiqlangan videolar — hisob sanasi, o'quvchilar soni va hisob holati (hisoblanmaganlari va muddati yetganlari avval). */
export function videoQueue(db: DatabaseSync, now = Date.now()): VideoItem[] {
  const t = videoTerms(db);
  const rows = db.prepare("SELECT * FROM creator_posts WHERE status = 'approved' ORDER BY posted_on DESC, id DESC LIMIT 300").all() as unknown as PostRow[];
  const items = rows.map((p) => item(db, p, t, now, true));
  // Avval: muddati o'tgan to'lovlar, to'lanishi kerak bo'lganlar, hisobi kelganlar; keyin kutilayotganlar; oxirida to'langanlar
  const rank = (i: VideoItem) => (i.entry?.overdue ? 0 : i.entry?.status === 'approved' ? 1 : i.entry?.status === 'pending' ? 2 : !i.entry && i.due ? 3 : !i.entry ? 4 : 5);
  return items.sort((a, b) => rank(a) - rank(b) || (a.dueAt ?? 0) - (b.dueAt ?? 0));
}
/** Creator: o'z videolari bo'yicha hisob sanasi va natija (shaxsiy ma'lumotsiz). */
export function videoPayOf(db: DatabaseSync, creatorId: number, now = Date.now()): { terms: VideoTerms; items: VideoItem[] } {
  const t = videoTerms(db);
  const rows = db.prepare("SELECT * FROM creator_posts WHERE creator_id = ? AND status = 'approved' ORDER BY id DESC").all(creatorId) as unknown as PostRow[];
  return { terms: t, items: rows.map((p) => item(db, p, t, now, false)) };
}

/** Admin hisob-kitobi: video joylanganidan muddat (15 kun) o'tgach, shu kungi ko'rishlar va talablar tekshirilib, BIR MARTA. Yozuv "kutilmoqda" holatida — keyin admin tasdiqlaydi va to'langan deb belgilaydi. */
export function settleVideo(db: DatabaseSync, adminId: number, postId: number, b: { views?: unknown; baseSom?: unknown; bio?: unknown; comment?: unknown; tag?: unknown; note?: unknown }, now = Date.now()): VideoEntry {
  return tx(db, () => {
    const t = videoTerms(db);
    if (!t.enabled) throw new ApiError(409, 'Video uchun to‘lov dasturi o‘chirilgan');
    const p = one<PostRow>(db, 'SELECT * FROM creator_posts WHERE id = ?', postId); if (!p) throw new ApiError(404, 'Video topilmadi');
    if (p.status !== 'approved') throw new ApiError(409, 'Avval videoni tasdiqlang (Postlar bo‘limi)');
    if (!creatorOk(db, p.creator_id)) throw new ApiError(409, 'Hamkor faol emas');
    if (entryOf(db, postId, now)) throw new ApiError(409, 'Bu video uchun hisob allaqachon qilingan — har bir video bir marta to‘lanadi');
    const at = postedAt(p); if (at === null) throw new ApiError(409, 'Videoning joylangan sanasi yo‘q');
    const dueAt = at + t.windowDays * DAY;
    if (now < dueAt) throw new ApiError(409, `Hisob ${new Date(dueAt).toISOString().slice(0, 10)} kuni qilinadi (joylanganiga ${t.windowDays} kun to‘lganda)`);
    if (b.bio !== true || b.comment !== true || b.tag !== true) throw new ApiError(400, 'Talablar tasdiqlanmagan: havola bio’da va izohda, Instagram sahifamiz belgilangan bo‘lishi kerak');
    const views = int(b.views, 0, 1e10, `${t.windowDays}-kundagi ko‘rishlar`);
    const base = b.baseSom === undefined || b.baseSom === null || b.baseSom === '' ? t.baseSom : int(b.baseSom, t.baseSom, 1e8, 'Asosiy to‘lov (so‘m)');
    const c = calcVideo(t, views, videoLearners(db, p, t.windowDays), base);
    const note = typeof b.note === 'string' ? b.note.trim().slice(0, 500) || null : null;
    const id = Number(db.prepare("INSERT INTO creator_ledger (creator_id, campaign_id, kind, event_key, amount_minor, currency, status, basis, note, created_at) VALUES (?, NULL, 'video', ?, ?, ?, 'pending', ?, ?, ?)")
      .run(p.creator_id, `video:${postId}`, c.totalSom * 100, LEDGER_CURRENCY, JSON.stringify({ ...c, windowDays: t.windowDays, payDays: t.payDays, checks: { bio: true, comment: true, tag: true } }), note, now).lastInsertRowid);
    db.prepare('INSERT INTO creator_ledger_history (ledger_id, ts, actor_id, from_status, to_status, note) VALUES (?, ?, ?, NULL, ?, ?)').run(id, now, adminId, 'pending', 'video_settle');
    db.prepare("UPDATE creator_posts SET verified_views = ?, verified_by = ?, verify_method = 'day_window', updated_at = ? WHERE id = ?").run(views, adminId, now, postId);
    audit(db, adminId, 'creator.video.settle', String(postId), c, now);
    return entryOf(db, postId, now)!;
  });
}
