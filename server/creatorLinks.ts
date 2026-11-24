// Creator tracking: post/platforma bo'yicha link → click → ro'yxatdan o'tish → faollashish → to'lov (Creator Growth, P0).
// Qoidalar (testlangan, server/creatorLinks.test.ts):
//  * Link kodi `ref_code` alifbosida (8 belgi): eski `?ref=KOD` va Telegram `ref_KOD` oqimlari KODNI O'ZGARTIRMASDAN link kodini ham tushunadi.
//  * Atribusiya FAQAT hisob yaratilganda bog'lanadi (mavjud foydalanuvchi retroaktiv bog'lanmaydi). `players.referred_by` (mavjud xulq: oxirgi tegilgan kod, 30 kun,
//    birinchi bog'lash yutadi) o'zgarmaydi; creator_attrib ichida first-touch va last-touch ALOHIDA saqlanadi. Komissiya/hisobot krediti: CREATOR_ATTRIBUTION=last|first (standart last).
//  * Voronka serverda JADVALLARDAN hisoblanadi (xp_events, payments, exam_results, user_events); mijozdan kelgan tushum/to'lov/bonus qiymatiga ishonilmaydi.
//  * Click: xom (inson, takrorsiz) va taxminan noyob (link + barmoq izi + kun) alohida; botlar, 10 soniyalik takrorlar va ichki IP'lar alohida "filtrlangan" hisoblanadi.
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';
import { hashVid } from './events';
import { tzDay } from './day';
import { attachReferral } from './referral';

const DAY = 86_400_000;
export const ATTRIBUTION_WINDOW_DAYS = 30;
export const LINK_KINDS = ['bio', 'reel', 'tiktok', 'telegram', 'youtube', 'campaign', 'other'] as const;
export type LinkKind = (typeof LINK_KINDS)[number];
export const LANGS = ['uz', 'en', 'ru', 'tg', 'ky', 'kk'] as const;
const ALPH = 'abcdefghjkmnpqrstuvwxyz23456789';
const MAX_LINKS_PER_CREATOR = 50;
export const creditMode = (env: NodeJS.ProcessEnv = process.env): 'first' | 'last' => (env.CREATOR_ATTRIBUTION === 'first' ? 'first' : 'last');

// ---------------- Linklar ----------------
export interface CreatorLink { code: string; creatorId: number; kind: LinkKind; label: string; campaignId: number | null; postRef: string | null; lang: string | null; active: boolean; createdAt: number }
const rowToLink = (r: Record<string, unknown>): CreatorLink => ({ code: String(r.code), creatorId: Number(r.creator_id), kind: r.kind as LinkKind, label: String(r.label), campaignId: r.campaign_id === null ? null : Number(r.campaign_id), postRef: (r.post_ref as string | null) ?? null, lang: (r.lang as string | null) ?? null, active: Number(r.active) === 1, createdAt: Number(r.created_at) });

const clean = (s: unknown, max: number): string => (typeof s === 'string' ? s.replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max) : '');
/** Link kodi: ref_code alifbosida, hech bir ref_code va link kodi bilan to'qnashmaydi. */
function newCode(db: DatabaseSync): string {
  for (let i = 0; i < 50; i++) {
    const code = [...randomBytes(8)].map((b) => ALPH[b % ALPH.length]).join('');
    if (!db.prepare('SELECT 1 FROM creator_links WHERE code = ?').get(code) && !db.prepare('SELECT 1 FROM players WHERE ref_code = ?').get(code)) return code;
  }
  throw new ApiError(500, 'Link kodini yaratib bo‘lmadi');
}

export function createLink(db: DatabaseSync, creatorId: number, b: { kind?: unknown; label?: unknown; campaignId?: unknown; postRef?: unknown; lang?: unknown }, now = Date.now()): CreatorLink {
  const kind = String(b.kind ?? '') as LinkKind;
  if (!LINK_KINDS.includes(kind)) throw new ApiError(400, 'Link turi noto‘g‘ri');
  const label = clean(b.label, 60); if (label.length < 2) throw new ApiError(400, 'Link nomi kamida 2 belgi bo‘lsin');
  const lang = b.lang === undefined || b.lang === null || b.lang === '' ? null : String(b.lang);
  if (lang !== null && !(LANGS as readonly string[]).includes(lang)) throw new ApiError(400, 'Til noto‘g‘ri');
  const postRef = clean(b.postRef, 80) || null;
  let campaignId: number | null = null;
  if (b.campaignId !== undefined && b.campaignId !== null && b.campaignId !== '') {
    campaignId = Number(b.campaignId);
    const c = db.prepare("SELECT status FROM creator_campaigns WHERE id = ?").get(campaignId) as { status: string } | undefined;
    if (!c || c.status !== 'active') throw new ApiError(400, 'Kampaniya topilmadi yoki faol emas');
  }
  const n = (db.prepare('SELECT COUNT(*) AS n FROM creator_links WHERE creator_id = ?').get(creatorId) as { n: number }).n;
  if (n >= MAX_LINKS_PER_CREATOR) throw new ApiError(429, 'Linklar soni chegarasiga yetdingiz');
  const code = newCode(db);
  db.prepare('INSERT INTO creator_links (code, creator_id, kind, label, campaign_id, post_ref, lang, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)').run(code, creatorId, kind, label, campaignId, postRef, lang, now);
  return rowToLink(db.prepare('SELECT * FROM creator_links WHERE code = ?').get(code) as Record<string, unknown>);
}

export const linksOf = (db: DatabaseSync, creatorId: number): CreatorLink[] =>
  (db.prepare('SELECT * FROM creator_links WHERE creator_id = ? ORDER BY created_at DESC, code').all(creatorId) as Record<string, unknown>[]).map(rowToLink);

/** Creator o'z linkini (yoki admin istalganini) yoqadi/to'xtatadi. To'xtatilgan link foydalanuvchini saytga yo'naltiradi, lekin yangi atribusiya yozmaydi. */
export function setLinkActive(db: DatabaseSync, code: string, active: boolean, actor: { id: number; admin: boolean }): CreatorLink {
  const l = db.prepare('SELECT * FROM creator_links WHERE code = ?').get(code) as Record<string, unknown> | undefined;
  if (!l || (!actor.admin && Number(l.creator_id) !== actor.id)) throw new ApiError(404, 'Link topilmadi');
  db.prepare('UPDATE creator_links SET active = ? WHERE code = ?').run(active ? 1 : 0, code);
  return rowToLink({ ...l, active: active ? 1 : 0 });
}

/** Kod → kim (faqat hozir faol va tasdiqlangan hamkor). */
export function resolveCreatorCode(db: DatabaseSync, code: unknown): { creatorId: number; link: CreatorLink | null; source: 'link' | 'ref' } | null {
  if (typeof code !== 'string' || !/^[a-z2-9]{6,10}$/.test(code)) return null;
  const l = db.prepare(`SELECT l.* FROM creator_links l JOIN players p ON p.id = l.creator_id LEFT JOIN creator_profiles cp ON cp.player_id = l.creator_id
    WHERE l.code = ? AND l.active = 1 AND p.role = 'creator' AND COALESCE(cp.status, 'approved') = 'approved'`).get(code) as Record<string, unknown> | undefined;
  if (l) return { creatorId: Number(l.creator_id), link: rowToLink(l), source: 'link' };
  const r = db.prepare("SELECT id, role FROM players WHERE ref_code = ?").get(code) as { id: number; role: string | null } | undefined;
  return r ? { creatorId: r.id, link: null, source: 'ref' } : null;
}

// ---------------- Click ----------------
const BOT_RE = /bot\b|bots\b|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegrambot|twitterbot|linkedinbot|pinterest|discordbot|skypeuri|embedly|quora link|vkshare|okhttp|python-requests|python-urllib|aiohttp|go-http-client|curl\/|wget|httpclient|headless|lighthouse|pingdom|uptimerobot|monitor|scanner|preview|apis-google|mediapartners/i;
export const isBotUa = (ua: string | undefined): boolean => !ua || ua.length < 8 || BOT_RE.test(ua);
const internalIps = (env: NodeJS.ProcessEnv): Set<string> => new Set((env.CREATOR_INTERNAL_IPS ?? '').split(',').map((s) => s.trim()).filter(Boolean));
const fpOf = (db: DatabaseSync, ip: string, ua: string | undefined): string => hashVid(db, `fp:${ip}|${ua ?? ''}`);
export { fpOf as clientFingerprint };

const bursts = new Map<string, { at: number; n: number }>();
function burst(fp: string, now: number): boolean {
  const b = bursts.get(fp);
  if (!b || now - b.at > 60_000) { if (bursts.size > 50_000) bursts.clear(); bursts.set(fp, { at: now, n: 1 }); return false; }
  return ++b.n > 30;
}

export interface ClickResult { link: CreatorLink; clickId: string | null; bot: 0 | 1 | 2; dup: boolean; unique: boolean }
/** /r/<kod> bosilganda. Qaytaradi null: kod noma'lum/yopiq (chaqiruvchi shunchaki saytga yo'naltiradi). Botlar ham yoziladi, lekin "filtrlangan" sifatida. */
export function recordClick(db: DatabaseSync, code: string, req: { ip: string; ua?: string; method?: string }, now = Date.now(), env: NodeJS.ProcessEnv = process.env): ClickResult | null {
  const r = resolveCreatorCode(db, code);
  if (!r?.link) return null;
  const fp = fpOf(db, req.ip, req.ua);
  let bot: 0 | 1 | 2 = 0;
  if (internalIps(env).has(req.ip)) bot = 2;
  else if ((req.method ?? 'GET') !== 'GET' || isBotUa(req.ua) || burst(fp, now)) bot = 1;
  const day = tzDay(now);
  const dup = bot === 0 && !!db.prepare('SELECT 1 FROM creator_clicks WHERE link_code = ? AND fp = ? AND bot = 0 AND ts > ? LIMIT 1').get(code, fp, now - 10_000);
  const unique = bot === 0 && !dup && !db.prepare('SELECT 1 FROM creator_clicks WHERE link_code = ? AND fp = ? AND day = ? AND bot = 0 AND dup = 0 LIMIT 1').get(code, fp, day);
  const id = randomBytes(8).toString('hex');
  db.prepare('INSERT INTO creator_clicks (id, link_code, creator_id, ts, day, fp, bot, dup, uniq) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, code, r.creatorId, now, day, fp, bot, dup ? 1 : 0, unique ? 1 : 0);
  return { link: r.link, clickId: bot === 0 ? id : null, bot, dup, unique };
}

export const CLICK_EVENTS = ['landing_view', 'signup_start', 'placement_start', 'placement_done', 'pricing_view', 'checkout_start'] as const;
export type ClickEvent = (typeof CLICK_EVENTS)[number];
export const isClickId = (x: unknown): x is string => typeof x === 'string' && /^[a-f0-9]{16}$/.test(x);

/** Click identifikatoriga bog'langan anonim hodisa: bir click bir hodisani bir marta sanaydi; 30 kundan eski click va bot clicklar e'tiborsiz. */
export function recordClickEvent(db: DatabaseSync, cid: unknown, name: unknown, now = Date.now()): boolean {
  if (!isClickId(cid) || !(CLICK_EVENTS as readonly unknown[]).includes(name)) return false;
  const c = db.prepare('SELECT ts FROM creator_clicks WHERE id = ? AND bot = 0').get(cid) as { ts: number } | undefined;
  if (!c || now - c.ts > ATTRIBUTION_WINDOW_DAYS * DAY || now < c.ts) return false;
  const ok = Number(db.prepare('INSERT OR IGNORE INTO creator_click_events (click_id, name, ts) VALUES (?, ?, ?)').run(cid, name as string, now).changes) > 0;
  if (ok && name === 'landing_view') db.prepare('UPDATE creator_clicks SET landed_ts = ? WHERE id = ? AND landed_ts IS NULL').run(now, cid);
  return ok;
}

// ---------------- Atribusiya (hisob yaratilganda) ----------------
export interface Touch { ref?: unknown; ref0?: unknown; cid?: unknown }
const isCreator = (db: DatabaseSync, id: number): boolean => ((db.prepare('SELECT role FROM players WHERE id = ?').get(id) as { role: string | null } | undefined)?.role) === 'creator';

/** Yangi hisob uchun: eski referral bog'lash (mavjud xulq) + creator atribusiyasi (first/last). Faqat hisob YARATILGAN joylardan chaqiriladi. */
export function attachAttribution(db: DatabaseSync, playerId: number, t: Touch, fp: string | null, now = Date.now()): { bound: boolean; attributed: boolean } {
  const bound = attachReferral(db, playerId, t.ref);
  if (!bound) return { bound: false, attributed: false };
  const refId = (db.prepare('SELECT referred_by FROM players WHERE id = ?').get(playerId) as { referred_by: number | null }).referred_by;
  const last = resolveCreatorCode(db, t.ref);
  if (!last || !refId || !isCreator(db, last.creatorId) || last.creatorId === playerId) return { bound: true, attributed: false };
  const first = (resolveCreatorCode(db, t.ref0) && isCreator(db, resolveCreatorCode(db, t.ref0)!.creatorId) ? resolveCreatorCode(db, t.ref0) : null) ?? last;
  // Click: faqat 30 kun ichidagi, inson, SHU link bo'yicha click
  let clickId: string | null = null, clickTs: number | null = null;
  if (isClickId(t.cid)) {
    const c = db.prepare('SELECT link_code, ts FROM creator_clicks WHERE id = ? AND bot = 0').get(t.cid) as { link_code: string; ts: number } | undefined;
    if (c && c.link_code === last.link?.code && now - c.ts <= ATTRIBUTION_WINDOW_DAYS * DAY && c.ts <= now) { clickId = t.cid; clickTs = c.ts; }
  }
  const firstSameAsLast = first.link?.code === last.link?.code && first.creatorId === last.creatorId;
  db.prepare(`INSERT OR IGNORE INTO creator_attrib (player_id, first_creator, first_link, first_click, first_ts, last_creator, last_link, last_click, last_ts, source, fp, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(playerId, first.creatorId, first.link?.code ?? null, firstSameAsLast ? clickId : null, firstSameAsLast ? clickTs : null,
    last.creatorId, last.link?.code ?? null, clickId, clickTs ?? now, last.source, fp, now);
  if (clickId) recordClickEvent(db, clickId, 'signup_start', now); // ro'yxatdan o'tish boshlangan deb ham sanaladi (hodisa yo'qolgan bo'lsa)
  flagSignup(db, playerId, last.creatorId, last.link?.code ?? null, clickId, fp, now);
  return { bound: true, attributed: true };
}

// ---------------- Firibgarlik belgilari (aniqlash; avtomatik jazo yo'q — admin ko'radi) ----------------
export function addFlag(db: DatabaseSync, creatorId: number, linkCode: string | null, kind: string, detail: string, key: string, now = Date.now()): boolean {
  return Number(db.prepare('INSERT OR IGNORE INTO creator_flags (creator_id, link_code, kind, detail, dedupe_key, ts) VALUES (?, ?, ?, ?, ?, ?)').run(creatorId, linkCode, kind, detail.slice(0, 300), key, now).changes) > 0;
}
function flagSignup(db: DatabaseSync, playerId: number, creatorId: number, link: string | null, clickId: string | null, fp: string | null, now: number): void {
  const day = tzDay(now);
  if (fp) {
    const n = (db.prepare('SELECT COUNT(*) AS n FROM creator_attrib WHERE last_creator = ? AND fp = ? AND created_at > ?').get(creatorId, fp, now - DAY) as { n: number }).n;
    if (n >= 3) addFlag(db, creatorId, link, 'same_device_signups', JSON.stringify({ n }), `sds:${creatorId}:${fp}:${day}`, now);
    const hint = db.prepare('SELECT fp_hint FROM creator_profiles WHERE player_id = ?').get(creatorId) as { fp_hint: string | null } | undefined;
    if (hint?.fp_hint && hint.fp_hint === fp) addFlag(db, creatorId, link, 'self_referral', '{}', `sr:${creatorId}:${playerId}`, now);
  }
  if (clickId) {
    const n = (db.prepare('SELECT COUNT(*) AS n FROM creator_attrib WHERE last_click = ?').get(clickId) as { n: number }).n;
    if (n >= 3) addFlag(db, creatorId, link, 'click_reuse', JSON.stringify({ n }), `cr:${clickId}`, now);
  }
}
/** Klik portlashi: bitta link bo'yicha kun ichida bitta barmoq izidan ko'p klik — kabinet/admin ochilganda tekshiriladi. */
export function scanClickBursts(db: DatabaseSync, now = Date.now()): number {
  let n = 0;
  const rows = db.prepare(`SELECT creator_id AS c, link_code AS l, fp, COUNT(*) AS k FROM creator_clicks WHERE ts > ? AND bot = 0 AND fp IS NOT NULL GROUP BY creator_id, link_code, fp HAVING COUNT(*) >= 8`).all(now - DAY) as { c: number; l: string; fp: string; k: number }[];
  for (const r of rows) if (addFlag(db, r.c, r.l, 'burst_clicks', JSON.stringify({ n: r.k }), `bc:${r.l}:${r.fp}:${tzDay(now)}`, now)) n++;
  return n;
}
/** Creator kabinetini ochgan qurilma izi: keyingi ro'yxatdan o'tishlar shu qurilmadan bo'lsa — o'z-o'zini taklif qilish gumoni. */
export function noteCreatorDevice(db: DatabaseSync, creatorId: number, fp: string, now = Date.now()): void {
  db.prepare("INSERT INTO creator_profiles (player_id, status, created_at, updated_at, fp_hint) VALUES (?, 'approved', ?, ?, ?) ON CONFLICT(player_id) DO UPDATE SET fp_hint = excluded.fp_hint").run(creatorId, now, now, fp);
}

/** Saqlash muddati: klik va hodisalar 180 kun, barmoq izi 90 kun. */
export function purgeCreatorData(db: DatabaseSync, now = Date.now()): void {
  db.prepare('DELETE FROM creator_click_events WHERE click_id IN (SELECT id FROM creator_clicks WHERE ts < ?)').run(now - 180 * DAY);
  db.prepare('DELETE FROM creator_clicks WHERE ts < ?').run(now - 180 * DAY);
  db.prepare('UPDATE creator_clicks SET fp = NULL WHERE fp IS NOT NULL AND ts < ?').run(now - 90 * DAY);
  db.prepare('UPDATE creator_attrib SET fp = NULL WHERE fp IS NOT NULL AND created_at < ?').run(now - 90 * DAY);
}

// ---------------- Voronka (serverda jadvallardan) ----------------
export interface FunnelOpts { creatorId?: number; linkCode?: string; from: number; to: number; kind?: string; lang?: string; campaignId?: number; mode?: 'first' | 'last' }
export interface Funnel {
  from: number; to: number; mode: 'first' | 'last';
  clicks: number; uniqueClicks: number; filteredClicks: number; landingViews: number; signupStarts: number;
  signups: number; placement: number; mock: number; planOpen: number; firstLesson: number; activated: number;
  d7: { eligible: number; active: number }; checkout: number; paid: number; refunded: number;
  grossRevenue: number; refundedSum: number; netRevenue: number;
  rates: { clickToSignup: number | null; signupToActivation: number | null; activatedToD7: number | null; activationToPaid: number | null; refundRate: number | null };
  weakest: 'click_to_signup' | 'signup_to_activation' | 'activated_to_d7' | 'activation_to_paid' | null;
}
const pct = (a: number, b: number): number | null => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);
const num = (db: DatabaseSync, sql: string, ...p: (string | number)[]): number => Number((db.prepare(sql).get(...p) as { n: number | null } | undefined)?.n ?? 0);

export function creatorFunnel(db: DatabaseSync, o: FunnelOpts, now = Date.now(), env: NodeJS.ProcessEnv = process.env): Funnel {
  const mode = o.mode ?? creditMode(env);
  const m = mode === 'first' ? 'first' : 'last';
  // Clicklar (o'z linklari bo'yicha, kredit rejimiga bog'liq emas)
  const cw: string[] = ['c.ts >= ?', 'c.ts < ?']; const cp: (string | number)[] = [o.from, o.to];
  if (o.creatorId !== undefined) { cw.push('c.creator_id = ?'); cp.push(o.creatorId); }
  if (o.linkCode) { cw.push('c.link_code = ?'); cp.push(o.linkCode); }
  if (o.kind) { cw.push('l.kind = ?'); cp.push(o.kind); }
  if (o.lang) { cw.push('l.lang = ?'); cp.push(o.lang); }
  if (o.campaignId !== undefined) { cw.push('l.campaign_id = ?'); cp.push(o.campaignId); }
  const cfrom = `FROM creator_clicks c LEFT JOIN creator_links l ON l.code = c.link_code WHERE ${cw.join(' AND ')}`;
  const clicks = num(db, `SELECT COUNT(*) AS n ${cfrom} AND c.bot = 0 AND c.dup = 0`, ...cp);
  const uniqueClicks = num(db, `SELECT COUNT(*) AS n ${cfrom} AND c.uniq = 1`, ...cp);
  const filteredClicks = num(db, `SELECT COUNT(*) AS n ${cfrom} AND (c.bot > 0 OR c.dup = 1)`, ...cp);
  const landingViews = num(db, `SELECT COUNT(*) AS n ${cfrom} AND c.bot = 0 AND c.landed_ts IS NOT NULL`, ...cp);
  const signupStarts = num(db, `SELECT COUNT(DISTINCT e.click_id) AS n FROM creator_click_events e JOIN creator_clicks c ON c.id = e.click_id LEFT JOIN creator_links l ON l.code = c.link_code WHERE e.name = 'signup_start' AND ${cw.join(' AND ')}`, ...cp);
  // Kredit olgan hisoblar
  const aw: string[] = [`a.${m}_creator IS NOT NULL`, 'a.created_at >= ?', 'a.created_at < ?']; const ap: (string | number)[] = [o.from, o.to];
  if (o.creatorId !== undefined) { aw.push(`a.${m}_creator = ?`); ap.push(o.creatorId); }
  if (o.linkCode) { aw.push(`a.${m}_link = ?`); ap.push(o.linkCode); }
  if (o.kind) { aw.push('l.kind = ?'); ap.push(o.kind); }
  if (o.lang) { aw.push('l.lang = ?'); ap.push(o.lang); }
  if (o.campaignId !== undefined) { aw.push('l.campaign_id = ?'); ap.push(o.campaignId); }
  const set = `(SELECT a.player_id FROM creator_attrib a LEFT JOIN creator_links l ON l.code = a.${m}_link WHERE ${aw.join(' AND ')})`;
  const signups = num(db, `SELECT COUNT(*) AS n FROM players WHERE id IN ${set}`, ...ap);
  const xp = (src: string) => num(db, `SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE source = ? AND accepted > 0 AND player_id IN ${set}`, src, ...ap);
  const placement = xp('placement'), mock = xp('mock'), firstLesson = xp('lesson');
  const planOpen = num(db, `SELECT COUNT(DISTINCT player_id) AS n FROM user_events WHERE name = 'plan_open' AND player_id IN ${set}`, ...ap);
  const activated = num(db, `SELECT COUNT(*) AS n FROM players p WHERE p.id IN ${set} AND EXISTS (SELECT 1 FROM xp_events x WHERE x.player_id = p.id AND x.source IN ('placement','lesson','mock') AND x.accepted > 0 AND x.ts >= p.created_at AND x.ts < p.created_at + ${7 * DAY})`, ...ap);
  const eligible = num(db, `SELECT COUNT(*) AS n FROM players p WHERE p.id IN ${set} AND p.created_at <= ?`, ...ap, now - 7 * DAY);
  const d7active = num(db, `SELECT COUNT(*) AS n FROM players p WHERE p.id IN ${set} AND p.created_at <= ? AND EXISTS (SELECT 1 FROM xp_events x WHERE x.player_id = p.id AND x.accepted > 0 AND x.ts >= p.created_at + ${7 * DAY} AND x.ts < p.created_at + ${14 * DAY})`, ...ap, now - 7 * DAY);
  const checkout = num(db, `SELECT COUNT(DISTINCT player_id) AS n FROM payments WHERE player_id IN ${set}`, ...ap);
  const pay = db.prepare(`SELECT COUNT(DISTINCT player_id) AS n, COALESCE(SUM(COALESCE(hamyon_amount, amount)), 0) AS s FROM payments WHERE status = 'success' AND player_id IN ${set}`).get(...ap) as { n: number; s: number };
  const ref = db.prepare(`SELECT COUNT(DISTINCT p.player_id) AS n, COALESCE(SUM(r.amount_minor), 0) AS m FROM creator_refunds r JOIN payments p ON p.id = r.payment_id WHERE p.status = 'success' AND p.player_id IN ${set}`).get(...ap) as { n: number; m: number };
  const refundedSum = Math.round(ref.m / 100); // jadvalda kichik birlikda (tiyin); hisobotda so'm
  const rates = {
    clickToSignup: pct(signups, uniqueClicks), signupToActivation: pct(activated, signups), activatedToD7: pct(d7active, eligible),
    activationToPaid: pct(pay.n, activated), refundRate: pct(ref.n, pay.n),
  };
  // Eng zaif bosqich: namuna kamida 10 bo'lgan bosqichlar ichida eng past konversiya
  const cand: [Funnel['weakest'], number | null, number][] = [['click_to_signup', rates.clickToSignup, uniqueClicks], ['signup_to_activation', rates.signupToActivation, signups], ['activated_to_d7', rates.activatedToD7, eligible], ['activation_to_paid', rates.activationToPaid, activated]];
  const ok = cand.filter((c) => c[1] !== null && c[2] >= 10).sort((a, b) => (a[1] as number) - (b[1] as number));
  return {
    from: o.from, to: o.to, mode, clicks, uniqueClicks, filteredClicks, landingViews, signupStarts, signups, placement, mock, planOpen, firstLesson, activated,
    d7: { eligible, active: d7active }, checkout, paid: pay.n, refunded: ref.n, grossRevenue: pay.s, refundedSum, netRevenue: pay.s - refundedSum, rates, weakest: ok[0]?.[0] ?? null,
  };
}
