// Creator Growth P1: hamkor profili/statusi, kampaniyalar, video/post topshirish va tasdiqlash, admin CRM ro'yxati, CSV.
// Qoidalar: creator FAQAT o'z yozuvlarini ko'radi; admin hammasini; ko'rishlar soni (claimed_views) hamisha TASDIQLANMAGAN — faqat admin tekshirgach verified_views;
// o'quvchilarning shaxsiy ma'lumoti (ism, Telegram ID, telefon, email, ball) hech bir javobda yo'q.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, tx } from './db';
import { audit } from './certificates';
import { creatorFunnel, LANGS, linksOf, type Funnel } from './creatorLinks';

const DAY = 86_400_000;
export const CREATOR_STATUSES = ['invited', 'applied', 'approved', 'paused', 'rejected'] as const;
export type CreatorStatus = (typeof CREATOR_STATUSES)[number];
export const POST_STATUSES = ['draft', 'submitted', 'needs_changes', 'approved', 'rejected'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'telegram', 'facebook', 'x', 'other'] as const;
export type Platform = (typeof PLATFORMS)[number];
const HOSTS: Record<Exclude<Platform, 'other'>, RegExp> = {
  instagram: /(^|\.)instagram\.com$/, tiktok: /(^|\.)tiktok\.com$/, youtube: /(^|\.)(youtube\.com|youtu\.be)$/, telegram: /^(t\.me|telegram\.me)$/, facebook: /(^|\.)(facebook\.com|fb\.watch)$/, x: /(^|\.)(x\.com|twitter\.com)$/,
};
const clean = (s: unknown, max: number): string => (typeof s === 'string' ? s.replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, max) : '');
const one = <T>(db: DatabaseSync, sql: string, ...p: (string | number)[]): T | undefined => db.prepare(sql).get(...p) as T | undefined;
const isCreator = (db: DatabaseSync, id: number): boolean => one<{ role: string | null }>(db, 'SELECT role FROM players WHERE id = ?', id)?.role === 'creator';

// ---------------- Profil ----------------
export interface CreatorProfile { playerId: number; nickname: string; status: CreatorStatus; locale: string | null; country: string | null; platforms: string | null; social: string | null; note: string | null; rankOptIn: boolean }
export function profileOf(db: DatabaseSync, playerId: number): CreatorProfile {
  const r = one<Record<string, unknown>>(db, `SELECT p.id, p.nickname, cp.status, cp.locale, cp.country, cp.platforms, cp.social, cp.note, cp.rank_opt_in FROM players p LEFT JOIN creator_profiles cp ON cp.player_id = p.id WHERE p.id = ?`, playerId);
  if (!r) throw new ApiError(404, 'Hamkor topilmadi');
  return { playerId, nickname: String(r.nickname), status: (r.status as CreatorStatus | null) ?? 'approved', locale: (r.locale as string | null) ?? null, country: (r.country as string | null) ?? null, platforms: (r.platforms as string | null) ?? null, social: (r.social as string | null) ?? null, note: (r.note as string | null) ?? null, rankOptIn: Number(r.rank_opt_in ?? 0) === 1 };
}
function upsertProfile(db: DatabaseSync, id: number, f: Record<string, string | number | null>, now: number): void {
  db.prepare("INSERT OR IGNORE INTO creator_profiles (player_id, status, created_at, updated_at) VALUES (?, 'approved', ?, ?)").run(id, now, now);
  const cols = Object.keys(f); if (!cols.length) return;
  db.prepare(`UPDATE creator_profiles SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE player_id = ?`).run(...(Object.values(f) as (string | number | null)[]), now, id);
}
const LOCALES = [...LANGS, ''];
/** Admin: hamkor statusi va profili (ijtimoiy username, davlat, til, platformalar, izoh). Audit jurnaliga yoziladi. */
export function adminSetProfile(db: DatabaseSync, adminId: number, nickname: unknown, b: Record<string, unknown>, now = Date.now()): CreatorProfile {
  const p = one<{ id: number }>(db, 'SELECT id FROM players WHERE lower(nickname) = lower(?)', String(nickname ?? ''));
  if (!p || !isCreator(db, p.id)) throw new ApiError(404, 'Hamkor (rol: creator) topilmadi');
  const f: Record<string, string | number | null> = {};
  if (b.status !== undefined) { if (!(CREATOR_STATUSES as readonly unknown[]).includes(b.status)) throw new ApiError(400, 'Status noto‘g‘ri'); f.status = String(b.status); }
  if (b.locale !== undefined) { if (!LOCALES.includes(String(b.locale))) throw new ApiError(400, 'Til noto‘g‘ri'); f.locale = String(b.locale) || null; }
  for (const k of ['country', 'platforms', 'social', 'note'] as const) if (b[k] !== undefined) f[k] = clean(b[k], k === 'note' ? 1000 : 300) || null;
  const before = profileOf(db, p.id);
  upsertProfile(db, p.id, f, now);
  audit(db, adminId, 'creator.profile', before.nickname, { from: before.status, set: f }, now);
  return profileOf(db, p.id);
}
/** Creator: o'z profilini yangilaydi (status va admin izohini emas). rankOptIn — ommaviy reytingda ko'rinish (standart: yo'q). */
export function selfSetProfile(db: DatabaseSync, id: number, b: Record<string, unknown>, now = Date.now()): CreatorProfile {
  const f: Record<string, string | number | null> = {};
  if (b.locale !== undefined) { if (!LOCALES.includes(String(b.locale))) throw new ApiError(400, 'Til noto‘g‘ri'); f.locale = String(b.locale) || null; }
  for (const k of ['country', 'platforms', 'social'] as const) if (b[k] !== undefined) f[k] = clean(b[k], 300) || null;
  if (b.rankOptIn !== undefined) f.rank_opt_in = b.rankOptIn === true ? 1 : 0;
  upsertProfile(db, id, f, now);
  return profileOf(db, id);
}

// ---------------- Kampaniyalar ----------------
export const CAMPAIGN_STATUSES = ['draft', 'active', 'paused', 'ended'] as const;
export interface Campaign { id: number; name: string; brief: string; rules: string; requiresVideo: boolean; startsAt: number | null; endsAt: number | null; status: string }
const toCampaign = (r: Record<string, unknown>): Campaign => ({ id: Number(r.id), name: String(r.name), brief: String(r.brief), rules: String(r.rules), requiresVideo: Number(r.requires_video) === 1, startsAt: r.starts_at === null ? null : Number(r.starts_at), endsAt: r.ends_at === null ? null : Number(r.ends_at), status: String(r.status) });
const ts = (v: unknown): number | null => { if (v === null || v === undefined || v === '') return null; const n = typeof v === 'number' ? v : Date.parse(String(v)); if (!Number.isFinite(n)) throw new ApiError(400, 'Sana noto‘g‘ri'); return n; };

/** Kampaniya yaratish: standart `draft`. Mukofot kampaniyada EMAS — alohida qoidada (creator_reward_rules, standart o'chiq). */
export function createCampaign(db: DatabaseSync, adminId: number, b: Record<string, unknown>, now = Date.now()): Campaign {
  const name = clean(b.name, 80); if (name.length < 3) throw new ApiError(400, 'Kampaniya nomi kamida 3 belgi');
  const startsAt = ts(b.startsAt), endsAt = ts(b.endsAt); if (startsAt && endsAt && endsAt <= startsAt) throw new ApiError(400, 'Tugash sanasi boshlanishdan keyin bo‘lsin');
  const id = Number(db.prepare('INSERT INTO creator_campaigns (name, brief, rules, requires_video, starts_at, ends_at, status, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(name, clean(b.brief, 4000), clean(b.rules, 2000), b.requiresVideo === true ? 1 : 0, startsAt, endsAt, 'draft', adminId, now, now).lastInsertRowid);
  audit(db, adminId, 'campaign.create', String(id), { name }, now);
  return toCampaign(one<Record<string, unknown>>(db, 'SELECT * FROM creator_campaigns WHERE id = ?', id)!);
}
export function updateCampaign(db: DatabaseSync, adminId: number, id: number, b: Record<string, unknown>, now = Date.now()): Campaign {
  const c = one<Record<string, unknown>>(db, 'SELECT * FROM creator_campaigns WHERE id = ?', id); if (!c) throw new ApiError(404, 'Kampaniya topilmadi');
  const f: Record<string, string | number | null> = {};
  if (b.name !== undefined) { const n = clean(b.name, 80); if (n.length < 3) throw new ApiError(400, 'Kampaniya nomi kamida 3 belgi'); f.name = n; }
  if (b.brief !== undefined) f.brief = clean(b.brief, 4000); if (b.rules !== undefined) f.rules = clean(b.rules, 2000);
  if (b.requiresVideo !== undefined) f.requires_video = b.requiresVideo === true ? 1 : 0;
  if (b.startsAt !== undefined) f.starts_at = ts(b.startsAt); if (b.endsAt !== undefined) f.ends_at = ts(b.endsAt);
  if (b.status !== undefined) { if (!(CAMPAIGN_STATUSES as readonly unknown[]).includes(b.status)) throw new ApiError(400, 'Status noto‘g‘ri'); f.status = String(b.status); }
  const cols = Object.keys(f);
  if (cols.length) db.prepare(`UPDATE creator_campaigns SET ${cols.map((k) => `${k} = ?`).join(', ')}, updated_at = ? WHERE id = ?`).run(...(Object.values(f) as (string | number | null)[]), now, id);
  audit(db, adminId, 'campaign.update', String(id), f, now);
  return toCampaign(one<Record<string, unknown>>(db, 'SELECT * FROM creator_campaigns WHERE id = ?', id)!);
}
/** Admin hammasini; creator — faqat faol va muddati o'tmagan kampaniyalarni (moliyaviy sozlamalarsiz). */
export function listCampaigns(db: DatabaseSync, admin: boolean, now = Date.now()): Campaign[] {
  const rows = (db.prepare('SELECT * FROM creator_campaigns ORDER BY id DESC').all() as Record<string, unknown>[]).map(toCampaign);
  if (admin) return rows;
  return rows.filter((c) => c.status === 'active' && (!c.startsAt || c.startsAt <= now) && (!c.endsAt || c.endsAt >= now));
}

// ---------------- Post / video topshirish ----------------
export function normalizePostUrl(raw: unknown, platform: string): { url: string; norm: string } {
  const s = typeof raw === 'string' ? raw.trim() : '';
  if (!s || s.length > 500) throw new ApiError(400, 'Post havolasi noto‘g‘ri');
  let u: URL; try { u = new URL(s); } catch { throw new ApiError(400, 'Post havolasi noto‘g‘ri'); }
  if (u.protocol !== 'https:' || u.username || u.password) throw new ApiError(400, 'Post havolasi https:// bilan boshlansin (login/parolsiz)');
  const host = u.hostname.toLowerCase().replace(/^(www|m|mobile|vm)\./, '');
  if (platform !== 'other' && !HOSTS[platform as Exclude<Platform, 'other'>]?.test(u.hostname.toLowerCase())) throw new ApiError(400, 'Havola tanlangan platformaga mos emas');
  const keep = host === 'youtube.com' || host === 'youtu.be' ? ['v'] : [];
  const q = [...u.searchParams.entries()].filter(([k]) => keep.includes(k)).map(([k, v]) => `${k}=${v}`).join('&');
  const norm = `${host}${u.pathname.replace(/\/+$/, '')}${q ? `?${q}` : ''}`.toLowerCase();
  return { url: u.toString(), norm };
}
export interface PostHistory { ts: number; from: string | null; to: string; note: string | null; byAdmin: boolean }
export interface Post { id: number; creatorId: number; campaignId: number | null; linkCode: string | null; platform: string; url: string | null; lang: string | null; postedOn: string | null; caption: string | null; status: PostStatus;
  claimedViews: number | null; viewsVerified: boolean; verifiedViews: number | null; adminNote: string | null; evidence: string | null; history: PostHistory[]; creator?: string }
function toPost(db: DatabaseSync, r: Record<string, unknown>, withCreator = false): Post {
  const hist = (db.prepare('SELECT h.ts, h.from_status AS f, h.to_status AS t, h.note, h.actor_id AS a FROM creator_post_history h WHERE h.post_id = ? ORDER BY h.id').all(Number(r.id)) as { ts: number; f: string | null; t: string; note: string | null; a: number | null }[])
    .map((h) => ({ ts: h.ts, from: h.f, to: h.t, note: h.note, byAdmin: h.a !== null && h.a !== Number(r.creator_id) }));
  return { id: Number(r.id), creatorId: Number(r.creator_id), campaignId: r.campaign_id === null ? null : Number(r.campaign_id), linkCode: (r.link_code as string | null) ?? null, platform: String(r.platform), url: (r.url as string | null) ?? null, lang: (r.lang as string | null) ?? null,
    postedOn: (r.posted_on as string | null) ?? null, caption: (r.caption as string | null) ?? null, status: r.status as PostStatus, claimedViews: r.claimed_views === null ? null : Number(r.claimed_views),
    viewsVerified: r.verified_views !== null, verifiedViews: r.verified_views === null ? null : Number(r.verified_views), adminNote: (r.admin_note as string | null) ?? null, evidence: (r.evidence as string | null) ?? null, history: hist,
    ...(withCreator ? { creator: one<{ nickname: string }>(db, 'SELECT nickname FROM players WHERE id = ?', Number(r.creator_id))?.nickname } : {}) };
}
const logPost = (db: DatabaseSync, id: number, actor: number | null, from: string | null, to: string, note: string | null, now: number) =>
  db.prepare('INSERT INTO creator_post_history (post_id, ts, actor_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?, ?)').run(id, now, actor, from, to, note);

/** Creator post/video qoralamasini saqlaydi yoki topshiradi (submit=true). Topshirishda platforma, URL, til, sana, caption va O'Z tracking linki majburiy.
 *  Bio linki bilan organik referral uchun post topshirish SHART EMAS (bu faqat kampaniya/kontent bonusi uchun). Ko'rishlar soni creator yozgan — tasdiqlanmagan. */
export function savePost(db: DatabaseSync, creatorId: number, b: Record<string, unknown>, now = Date.now()): Post {
  return tx(db, () => {
    const platform = String(b.platform ?? ''); if (!(PLATFORMS as readonly string[]).includes(platform)) throw new ApiError(400, 'Platforma noto‘g‘ri');
    const submit = b.submit === true;
    const id = b.id === undefined || b.id === null ? null : Number(b.id);
    const prev = id === null ? undefined : one<Record<string, unknown>>(db, 'SELECT * FROM creator_posts WHERE id = ? AND creator_id = ?', id, creatorId);
    if (id !== null && !prev) throw new ApiError(404, 'Post topilmadi');
    if (prev && !['draft', 'needs_changes'].includes(String(prev.status))) throw new ApiError(409, 'Bu postni endi tahrirlab bo‘lmaydi');
    const lang = b.lang === undefined || b.lang === null || b.lang === '' ? null : String(b.lang); if (lang !== null && !(LANGS as readonly string[]).includes(lang)) throw new ApiError(400, 'Til noto‘g‘ri');
    const postedOn = b.postedOn === undefined || b.postedOn === null || b.postedOn === '' ? null : String(b.postedOn);
    if (postedOn !== null) { const t = /^\d{4}-\d{2}-\d{2}$/.test(postedOn) ? Date.parse(`${postedOn}T00:00:00Z`) : NaN; if (!Number.isFinite(t) || t > now + DAY || t < now - 400 * DAY) throw new ApiError(400, 'Sana noto‘g‘ri'); }
    const caption = clean(b.caption, 2000) || null;
    const views = b.claimedViews === undefined || b.claimedViews === null || b.claimedViews === '' ? null : Number(b.claimedViews);
    if (views !== null && (!Number.isInteger(views) || views < 0 || views > 1e10)) throw new ApiError(400, 'Ko‘rishlar soni noto‘g‘ri');
    let linkCode: string | null = null;
    if (b.linkCode !== undefined && b.linkCode !== null && b.linkCode !== '') { linkCode = String(b.linkCode); if (!linksOf(db, creatorId).some((l) => l.code === linkCode)) throw new ApiError(400, 'Tracking link topilmadi (o‘zingizniki bo‘lishi kerak)'); }
    let campaignId: number | null = null;
    if (b.campaignId !== undefined && b.campaignId !== null && b.campaignId !== '') {
      campaignId = Number(b.campaignId); const c = listCampaigns(db, false, now).find((x) => x.id === campaignId); if (!c) throw new ApiError(400, 'Kampaniya topilmadi yoki faol emas');
    }
    let url: string | null = null, norm: string | null = null;
    if (b.url !== undefined && b.url !== null && String(b.url).trim() !== '') { const n = normalizePostUrl(b.url, platform); url = n.url; norm = n.norm; }
    if (submit) {
      if (!url) throw new ApiError(400, 'Post havolasi majburiy'); if (!lang) throw new ApiError(400, 'Til majburiy'); if (!postedOn) throw new ApiError(400, 'Joylangan sana majburiy');
      if (!caption || caption.length < 10) throw new ApiError(400, 'Caption kamida 10 belgi bo‘lsin'); if (!linkCode) throw new ApiError(400, 'Tracking link tanlash majburiy');
    }
    if (norm && one(db, "SELECT 1 FROM creator_posts WHERE url_norm = ? AND status != 'rejected' AND id != ?", norm, id ?? -1)) throw new ApiError(409, 'Bu post havolasi allaqachon topshirilgan');
    const status: PostStatus = submit ? 'submitted' : (prev?.status as PostStatus | undefined) ?? 'draft';
    let pid: number;
    if (prev) { pid = Number(prev.id); db.prepare('UPDATE creator_posts SET campaign_id=?, link_code=?, platform=?, url=?, url_norm=?, lang=?, posted_on=?, caption=?, claimed_views=?, status=?, updated_at=? WHERE id=?').run(campaignId, linkCode, platform, url, norm, lang, postedOn, caption, views, status, now, pid); }
    else { pid = Number(db.prepare('INSERT INTO creator_posts (creator_id, campaign_id, link_code, platform, url, url_norm, lang, posted_on, caption, claimed_views, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(creatorId, campaignId, linkCode, platform, url, norm, lang, postedOn, caption, views, status, now, now).lastInsertRowid); logPost(db, pid, creatorId, null, 'draft', null, now); }
    if (submit) logPost(db, pid, creatorId, String(prev?.status ?? 'draft'), 'submitted', null, now); // qoralama/o'zgartirish so'ralgan → topshirildi
    return toPost(db, one<Record<string, unknown>>(db, 'SELECT * FROM creator_posts WHERE id = ?', pid)!);
  });
}
export const postsOf = (db: DatabaseSync, creatorId: number): Post[] => (db.prepare('SELECT * FROM creator_posts WHERE creator_id = ? ORDER BY id DESC').all(creatorId) as Record<string, unknown>[]).map((r) => toPost(db, r));
export const postsForAdmin = (db: DatabaseSync, status?: string): Post[] => (db.prepare(`SELECT * FROM creator_posts ${status ? 'WHERE status = ?' : "WHERE status != 'draft'"} ORDER BY updated_at DESC LIMIT 300`).all(...(status ? [status] : [])) as Record<string, unknown>[]).map((r) => toPost(db, r, true));

/** Admin qarori. Faqat topshirilgan post ko'rib chiqiladi; rad etish/o'zgartirish so'rashda izoh majburiy; admin URL ocholmasa boshqa dalil (evidence) yuborishi mumkin. */
export function reviewPost(db: DatabaseSync, adminId: number, postId: number, b: { decision?: unknown; note?: unknown; verifiedViews?: unknown; evidence?: unknown }, now = Date.now()): Post {
  return tx(db, () => {
    const p = one<Record<string, unknown>>(db, 'SELECT * FROM creator_posts WHERE id = ?', postId); if (!p) throw new ApiError(404, 'Post topilmadi');
    const to = String(b.decision ?? ''); if (!['approved', 'rejected', 'needs_changes'].includes(to)) throw new ApiError(400, 'Qaror noto‘g‘ri');
    if (p.status !== 'submitted') throw new ApiError(409, 'Faqat topshirilgan post ko‘rib chiqiladi');
    const note = clean(b.note, 1000) || null; if (to !== 'approved' && !note) throw new ApiError(400, 'Izoh majburiy');
    const ev = clean(b.evidence, 1000) || null;
    let vv: number | null = null;
    if (b.verifiedViews !== undefined && b.verifiedViews !== null && b.verifiedViews !== '') { vv = Number(b.verifiedViews); if (!Number.isInteger(vv) || vv < 0 || vv > 1e10) throw new ApiError(400, 'Tasdiqlangan ko‘rishlar soni noto‘g‘ri'); }
    db.prepare('UPDATE creator_posts SET status = ?, admin_note = ?, reviewed_by = ?, reviewed_at = ?, evidence = COALESCE(?, evidence), verified_views = COALESCE(?, verified_views), verified_by = CASE WHEN ? IS NULL THEN verified_by ELSE ? END, verify_method = CASE WHEN ? IS NULL THEN verify_method ELSE \'manual\' END, updated_at = ? WHERE id = ?')
      .run(to, note, adminId, now, ev, vv, vv, adminId, vv, now, postId);
    logPost(db, postId, adminId, 'submitted', to, note, now);
    audit(db, adminId, 'creator.post.review', String(postId), { to, verifiedViews: vv }, now);
    return toPost(db, one<Record<string, unknown>>(db, 'SELECT * FROM creator_posts WHERE id = ?', postId)!, true);
  });
}

// ---------------- Admin CRM ro'yxati va CSV ----------------
export interface CreatorRow { id: number; nickname: string; status: CreatorStatus; locale: string | null; country: string | null; platforms: string | null; note: string | null; links: number; funnel: Funnel; openFlags: number; posts: Record<string, number> }
export function adminCreators(db: DatabaseSync, q: { text?: string; status?: string; locale?: string; campaignId?: number; from: number; to: number }, now = Date.now(), env: NodeJS.ProcessEnv = process.env): CreatorRow[] {
  const rows = db.prepare("SELECT id FROM players WHERE role = 'creator' ORDER BY nickname").all() as { id: number }[];
  const out: CreatorRow[] = [];
  for (const { id } of rows) {
    const p = profileOf(db, id);
    if (q.text && !p.nickname.toLowerCase().includes(q.text.toLowerCase())) continue;
    if (q.status && p.status !== q.status) continue;
    if (q.locale && p.locale !== q.locale) continue;
    const links = linksOf(db, id);
    if (q.campaignId !== undefined && !links.some((l) => l.campaignId === q.campaignId)) continue;
    const posts: Record<string, number> = {};
    for (const r of db.prepare('SELECT status, COUNT(*) AS n FROM creator_posts WHERE creator_id = ? GROUP BY status').all(id) as { status: string; n: number }[]) posts[r.status] = r.n;
    out.push({ id, nickname: p.nickname, status: p.status, locale: p.locale, country: p.country, platforms: p.platforms, note: p.note, links: links.length,
      funnel: creatorFunnel(db, { creatorId: id, from: q.from, to: q.to, campaignId: q.campaignId }, now, env), posts,
      openFlags: Number(one<{ n: number }>(db, 'SELECT COUNT(*) AS n FROM creator_flags WHERE creator_id = ? AND resolved = 0', id)?.n ?? 0) });
  }
  return out.sort((a, b) => b.funnel.netRevenue - a.funnel.netRevenue || b.funnel.activated - a.funnel.activated || a.nickname.localeCompare(b.nickname));
}
export interface FlagRow { id: number; creator: string; linkCode: string | null; kind: string; detail: string | null; ts: number; resolved: boolean }
export const listFlags = (db: DatabaseSync, resolved = false): FlagRow[] => (db.prepare('SELECT f.id, p.nickname AS creator, f.link_code AS linkCode, f.kind, f.detail, f.ts, f.resolved FROM creator_flags f JOIN players p ON p.id = f.creator_id WHERE f.resolved = ? ORDER BY f.ts DESC LIMIT 300').all(resolved ? 1 : 0) as (Omit<FlagRow, 'resolved'> & { resolved: number })[]).map((r) => ({ ...r, resolved: r.resolved === 1 }));
export function resolveFlag(db: DatabaseSync, adminId: number, id: number, now = Date.now()): void {
  const r = db.prepare('UPDATE creator_flags SET resolved = 1, resolved_by = ?, resolved_at = ? WHERE id = ? AND resolved = 0').run(adminId, now, id);
  if (!Number(r.changes)) throw new ApiError(404, 'Belgi topilmadi');
  audit(db, adminId, 'creator.flag.resolve', String(id), null, now);
}
/** CSV katak: formula in'ektsiyasidan himoya (=, +, -, @ bilan boshlansa — apostrof) va tirnoqlash. */
export const csvCell = (v: unknown): string => { let s = v === null || v === undefined ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
/** Faqat agregat ustunlar — o'quvchilarning shaxsiy ma'lumoti yo'q. */
export function creatorsCsv(rows: CreatorRow[]): string {
  const head = ['nickname', 'status', 'locale', 'country', 'links', 'unique_clicks', 'signups', 'activated', 'retained_d7', 'paid', 'net_revenue_uzs', 'refunded_uzs', 'open_flags'];
  return [head.join(','), ...rows.map((r) => [r.nickname, r.status, r.locale, r.country, r.links, r.funnel.uniqueClicks, r.funnel.signups, r.funnel.activated, r.funnel.d7.active, r.funnel.paid, r.funnel.netRevenue, r.funnel.refundedSum, r.openFlags].map(csvCell).join(','))].join('\n') + '\n';
}
