// Creator Growth P2: mukofot QOIDALARI va DAFTARI (ledger). Bu to'lov tizimi EMAS: hech narsa avtomatik to'lanmaydi, to'lov integratsiyasi yo'q.
//
// MODEL. Mukofot kodda emas, admin sozlaydigan QOIDALARda (creator_reward_rules). Model keyinchalik o'zgarsa — kod emas, qoida o'zgaradi. To'rt tur:
//   paid_pct              — o'quvchining muvaffaqiyatli, qaytarilmagan to'lovidan foiz
//   activated_flat        — faollashgan o'quvchi boshiga qat'iy summa (bir marta; faollashish = 7 kun ichida dars/daraja testi/mock bajarilgan)
//   first_paid_flat       — o'quvchining BIRINCHI muvaffaqiyatli to'lovi boshiga qat'iy summa (bir marta)
//   verified_views_per_1k — ADMIN TASDIQLAGAN ko'rishlarning har 1000 tasi uchun (faqat tasdiqlangan post; creator yozgan ko'rishga hech qachon to'lanmaydi)
// Ro'yxatdan o'tganlik (signup) va tasdiqlanmagan ko'rishlar uchun mukofot turi YO'Q.
//
// XAVFSIZLIK. Qoida standart O'CHIQ; yoqish — admin, "egasi tasdiqlagan" belgisi + creator chegarasi + umumiy byudjet bilan, audit jurnaliga yoziladi.
// Yoqilgan qoidaning shartlarini o'zgartirib bo'lmaydi (avval o'chiriladi). Pul kichik birlikda (UZS: tiyin = so'm × 100) + valyuta; hozircha faqat UZS (to'lovlar valyutasi).
// Idempotentlik: har hodisa bitta yozuv (event_key UNIQUE). Kutish davri (hold_days): qaytarish/shubha vaqti o'tgach hisoblanadi. Qaytarilgan to'lov — teskari yozuv.
// Mavjud referral XP/obuna kunlari mukofoti (referral.ts) bilan ARALASHMAYDI. CREATOR_COMMISSION_PCT daftarda ishlatilmaydi.
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, tx } from './db';
import { audit } from './certificates';
import { creatorFunnel, creditMode } from './creatorLinks';

const DAY = 86_400_000;
export const LEDGER_CURRENCY = 'UZS';
const TIYIN = 100;
export const REWARD_KINDS = ['paid_pct', 'activated_flat', 'first_paid_flat', 'verified_views_per_1k'] as const;
export type RewardKind = (typeof REWARD_KINDS)[number];
export const LEDGER_STATUSES = ['pending', 'approved', 'rejected', 'paid'] as const;
const KIND_OF: Record<RewardKind, string> = { paid_pct: 'commission', activated_flat: 'cpa_activated', first_paid_flat: 'cpa_first_paid', verified_views_per_1k: 'views' };

// ---------------- Qoidalar ----------------
export interface Rule { id: number; name: string; campaignId: number | null; kind: RewardKind; pct: number | null; amountMinor: number | null; currency: string; holdDays: number; windowDays: number;
  capPerCreatorMinor: number | null; budgetMinor: number | null; capPerItemMinor: number | null; startsAt: number | null; endsAt: number | null; enabled: boolean; approvedAt: number | null }
const nn = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));
const toRule = (r: Record<string, unknown>): Rule => ({ id: Number(r.id), name: String(r.name), campaignId: nn(r.campaign_id), kind: r.kind as RewardKind, pct: nn(r.pct), amountMinor: nn(r.amount_minor), currency: String(r.currency), holdDays: Number(r.hold_days), windowDays: Number(r.window_days),
  capPerCreatorMinor: nn(r.cap_per_creator_minor), budgetMinor: nn(r.budget_minor), capPerItemMinor: nn(r.cap_per_item_minor), startsAt: nn(r.starts_at), endsAt: nn(r.ends_at), enabled: Number(r.enabled) === 1, approvedAt: nn(r.approved_at) });
const one = <T>(db: DatabaseSync, sql: string, ...p: (string | number)[]): T | undefined => db.prepare(sql).get(...p) as T | undefined;
const posInt = (v: unknown, what: string): number | null => { if (v === null || v === undefined || v === '') return null; const n = Number(v); if (!Number.isInteger(n) || n <= 0 || n > 1e13) throw new ApiError(400, `${what}: musbat butun son (kichik birlikda)`); return n; };
const inRange = (v: unknown, lo: number, hi: number, what: string, dflt: number): number => { if (v === undefined || v === null || v === '') return dflt; const n = Number(v); if (!Number.isInteger(n) || n < lo || n > hi) throw new ApiError(400, `${what}: ${lo}–${hi}`); return n; };
const dt = (v: unknown): number | null => { if (v === null || v === undefined || v === '') return null; const n = typeof v === 'number' ? v : Date.parse(String(v)); if (!Number.isFinite(n)) throw new ApiError(400, 'Sana noto‘g‘ri'); return n; };

export const listRules = (db: DatabaseSync): Rule[] => (db.prepare('SELECT * FROM creator_reward_rules ORDER BY id DESC').all() as Record<string, unknown>[]).map(toRule);
function fields(db: DatabaseSync, b: Record<string, unknown>, kind: RewardKind): Record<string, string | number | null> {
  const f: Record<string, string | number | null> = {};
  if (b.name !== undefined) { const n = typeof b.name === 'string' ? b.name.replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 80) : ''; if (n.length < 3) throw new ApiError(400, 'Qoida nomi kamida 3 belgi'); f.name = n; }
  if (b.campaignId !== undefined) { if (b.campaignId === null || b.campaignId === '') f.campaign_id = null; else { if (!one(db, 'SELECT 1 FROM creator_campaigns WHERE id = ?', Number(b.campaignId))) throw new ApiError(404, 'Kampaniya topilmadi'); f.campaign_id = Number(b.campaignId); } }
  if (b.pct !== undefined) { if (kind !== 'paid_pct') f.pct = null; else { const n = Number(b.pct); if (!Number.isFinite(n) || n <= 0 || n > 90) throw new ApiError(400, 'Foiz 0 dan katta va 90 dan oshmasin'); f.pct = n; } }
  if (b.amountMinor !== undefined) f.amount_minor = kind === 'paid_pct' ? null : posInt(b.amountMinor, 'Summa');
  if (b.holdDays !== undefined) f.hold_days = inRange(b.holdDays, 0, 90, 'Kutish davri (kun)', 7);
  if (b.windowDays !== undefined) f.window_days = inRange(b.windowDays, 1, 730, 'Muddat (kun)', 180);
  if (b.capPerCreatorMinor !== undefined) f.cap_per_creator_minor = posInt(b.capPerCreatorMinor, 'Creator chegarasi');
  if (b.budgetMinor !== undefined) f.budget_minor = posInt(b.budgetMinor, 'Umumiy byudjet');
  if (b.capPerItemMinor !== undefined) f.cap_per_item_minor = posInt(b.capPerItemMinor, 'Post chegarasi');
  if (b.startsAt !== undefined) f.starts_at = dt(b.startsAt);
  if (b.endsAt !== undefined) f.ends_at = dt(b.endsAt);
  return f;
}
/** Yangi qoida — HAMISHA o'chiq (qoralama). Yoqish alohida (enableRule). */
export function createRule(db: DatabaseSync, adminId: number, b: Record<string, unknown>, now = Date.now()): Rule {
  const kind = String(b.kind ?? '') as RewardKind; if (!REWARD_KINDS.includes(kind)) throw new ApiError(400, 'Mukofot turi noto‘g‘ri');
  const f = fields(db, { name: b.name, campaignId: b.campaignId ?? null, pct: b.pct, amountMinor: b.amountMinor, holdDays: b.holdDays, windowDays: b.windowDays, capPerCreatorMinor: b.capPerCreatorMinor, budgetMinor: b.budgetMinor, capPerItemMinor: b.capPerItemMinor, startsAt: b.startsAt, endsAt: b.endsAt }, kind);
  if (!f.name) throw new ApiError(400, 'Qoida nomi kamida 3 belgi');
  if (f.starts_at && f.ends_at && Number(f.ends_at) <= Number(f.starts_at)) throw new ApiError(400, 'Tugash sanasi boshlanishdan keyin bo‘lsin');
  const g = (k: string): number | null => (f[k] as number | null | undefined) ?? null;
  const id = Number(db.prepare(`INSERT INTO creator_reward_rules (name, campaign_id, kind, pct, amount_minor, currency, hold_days, window_days, cap_per_creator_minor, budget_minor, cap_per_item_minor, starts_at, ends_at, enabled, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, '${LEDGER_CURRENCY}', ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`).run(f.name as string, g('campaign_id'), kind, g('pct'), g('amount_minor'), g('hold_days') ?? 7, g('window_days') ?? 180, g('cap_per_creator_minor'), g('budget_minor'), g('cap_per_item_minor'), g('starts_at'), g('ends_at'), adminId, now, now).lastInsertRowid);
  audit(db, adminId, 'reward.rule.create', String(id), { kind, name: f.name }, now);
  return toRule(one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', id)!);
}
/** Faqat O'CHIQ qoidaning shartlari o'zgaradi (yoqilgan qoidaning shartlari jimgina o'zgarmasin). */
export function updateRule(db: DatabaseSync, adminId: number, id: number, b: Record<string, unknown>, now = Date.now()): Rule {
  const r = one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', id); if (!r) throw new ApiError(404, 'Qoida topilmadi');
  if (Number(r.enabled) === 1) throw new ApiError(409, 'Yoqilgan qoidani o‘zgartirib bo‘lmaydi — avval o‘chiring');
  const f = fields(db, b, r.kind as RewardKind); const cols = Object.keys(f);
  if (cols.length) db.prepare(`UPDATE creator_reward_rules SET ${cols.map((c) => `${c} = ?`).join(', ')}, updated_at = ? WHERE id = ?`).run(...(Object.values(f) as (string | number | null)[]), now, id);
  audit(db, adminId, 'reward.rule.update', String(id), f, now);
  return toRule(one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', id)!);
}
/** Yoqish: "egasi tasdiqlagan" + (foiz yoki summa) + creator chegarasi + umumiy byudjet majburiy (byudjetsiz mukofot yoqilmaydi). */
export function enableRule(db: DatabaseSync, adminId: number, id: number, b: { confirmOwnerApproved?: unknown }, now = Date.now()): Rule {
  const r = one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', id); if (!r) throw new ApiError(404, 'Qoida topilmadi');
  const rule = toRule(r);
  if (rule.kind === 'paid_pct' ? rule.pct === null : rule.amountMinor === null) throw new ApiError(409, 'Yoqishdan oldin foiz yoki summani kiriting');
  if (rule.capPerCreatorMinor === null || rule.budgetMinor === null) throw new ApiError(409, 'Yoqishdan oldin creator chegarasi va umumiy byudjetni kiriting');
  if (rule.kind === 'verified_views_per_1k' && rule.capPerItemMinor === null) throw new ApiError(409, 'Ko‘rishlar mukofoti uchun post chegarasi majburiy');
  if (b.confirmOwnerApproved !== true) throw new ApiError(409, 'Egasi tasdiqlagan qiymatlar ekani tasdiqlanmagan');
  db.prepare('UPDATE creator_reward_rules SET enabled = 1, approved_by = ?, approved_at = ?, updated_at = ? WHERE id = ?').run(adminId, now, now, id);
  audit(db, adminId, 'reward.rule.enable', String(id), { kind: rule.kind, pct: rule.pct, amountMinor: rule.amountMinor, budget: rule.budgetMinor, cap: rule.capPerCreatorMinor }, now);
  return toRule(one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', id)!);
}
export function disableRule(db: DatabaseSync, adminId: number, id: number, now = Date.now()): Rule {
  if (!one(db, 'SELECT 1 FROM creator_reward_rules WHERE id = ?', id)) throw new ApiError(404, 'Qoida topilmadi');
  db.prepare('UPDATE creator_reward_rules SET enabled = 0, updated_at = ? WHERE id = ?').run(now, id); audit(db, adminId, 'reward.rule.disable', String(id), null, now);
  return toRule(one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', id)!);
}
const live = (r: Rule, now: number): boolean => r.enabled && (!r.startsAt || r.startsAt <= now) && (!r.endsAt || r.endsAt >= now);

// ---------------- Nomzodlar (hisoblash va "kutilmoqda" taxmini uchun umumiy) ----------------
interface Cand { creatorId: number; key: string; amountMinor: number; matureAt: number; kind: string; paymentId: string | null; basis: Record<string, unknown> }
const hist = (db: DatabaseSync, ledgerId: number, actor: number | null, from: string | null, to: string, note: string | null, now: number): void => { db.prepare('INSERT INTO creator_ledger_history (ledger_id, ts, actor_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?, ?)').run(ledgerId, now, actor, from, to, note); };
const creatorOk = (db: DatabaseSync, id: number): boolean => one<{ ok: number }>(db, "SELECT COUNT(*) AS ok FROM players p LEFT JOIN creator_profiles cp ON cp.player_id = p.id WHERE p.id = ? AND p.role = 'creator' AND COALESCE(cp.status, 'approved') = 'approved'", id)?.ok === 1;
const activatedEver = (db: DatabaseSync, pid: number): boolean => !!one(db, "SELECT 1 FROM xp_events WHERE player_id = ? AND source IN ('placement','lesson','mock') AND accepted > 0 LIMIT 1", pid);
const flaggedPlayer = (db: DatabaseSync, creator: number, pid: number, fp: string | null, click: string | null): boolean =>
  !!one(db, 'SELECT 1 FROM creator_flags WHERE dedupe_key = ?', `sr:${creator}:${pid}`)
  || (fp !== null && !!one(db, "SELECT 1 FROM creator_flags WHERE resolved = 0 AND kind = 'same_device_signups' AND dedupe_key LIKE ?", `sds:${creator}:${fp}:%`))
  || (click !== null && !!one(db, 'SELECT 1 FROM creator_flags WHERE resolved = 0 AND dedupe_key = ?', `cr:${click}`));
const campCond = (r: Rule, col: string): { sql: string; p: number[] } => (r.campaignId === null ? { sql: `${col} IS NULL`, p: [] } : { sql: `${col} = ?`, p: [r.campaignId] });

function candidates(db: DatabaseSync, r: Rule, m: 'first' | 'last'): Cand[] {
  const out: Cand[] = []; const key = (s: string) => `r${r.id}:${s}`;
  const cc = campCond(r, 'l.campaign_id'); const lo = r.startsAt ?? 0, hi = r.endsAt ?? 8.64e15;
  const A = `a.${m}_creator`;
  if (r.kind === 'paid_pct' || r.kind === 'first_paid_flat') {
    const pays = db.prepare(`SELECT p.id, p.player_id AS pid, p.paid_at AS at, COALESCE(p.hamyon_amount, p.amount) AS amt, ${A} AS creator, pl.created_at AS signedAt, a.fp, a.last_click AS click
      FROM payments p JOIN creator_attrib a ON a.player_id = p.player_id JOIN players pl ON pl.id = p.player_id LEFT JOIN creator_links l ON l.code = a.${m}_link
      WHERE p.status = 'success' AND ${A} IS NOT NULL AND ${cc.sql} AND p.paid_at >= ? AND p.paid_at <= ? ORDER BY p.paid_at, p.id`).all(...cc.p, lo, hi) as { id: string; pid: number; at: number; amt: number; creator: number; signedAt: number; fp: string | null; click: string | null }[];
    const firstSeen = new Set<number>();
    for (const p of pays) {
      const first = !firstSeen.has(p.pid); firstSeen.add(p.pid);
      if (r.kind === 'first_paid_flat' && !first) continue;
      if (p.at - p.signedAt > r.windowDays * DAY || p.creator === p.pid || !creatorOk(db, p.creator) || !activatedEver(db, p.pid) || flaggedPlayer(db, p.creator, p.pid, p.fp, p.click)) continue;
      const refunded = Number(one<{ s: number }>(db, 'SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_refunds WHERE payment_id = ?', p.id)?.s ?? 0);
      const total = p.amt * TIYIN, base = total - refunded; if (base <= 0) continue;
      if (r.kind === 'paid_pct') out.push({ creatorId: p.creator, key: key(`pay:${p.id}`), amountMinor: Math.round((base * (r.pct ?? 0)) / 100), matureAt: p.at + r.holdDays * DAY, kind: KIND_OF.paid_pct, paymentId: p.id, basis: { pct: r.pct, baseMinor: base } });
      else out.push({ creatorId: p.creator, key: key(`fpaid:${p.pid}`), amountMinor: r.amountMinor ?? 0, matureAt: p.at + r.holdDays * DAY, kind: KIND_OF.first_paid_flat, paymentId: p.id, basis: { flat: r.amountMinor } });
    }
  } else if (r.kind === 'activated_flat') {
    const rows = db.prepare(`SELECT a.player_id AS pid, ${A} AS creator, pl.created_at AS signedAt, a.fp, a.last_click AS click,
        (SELECT MIN(x.ts) FROM xp_events x WHERE x.player_id = a.player_id AND x.source IN ('placement','lesson','mock') AND x.accepted > 0 AND x.ts >= pl.created_at AND x.ts < pl.created_at + ${7 * DAY}) AS actAt
      FROM creator_attrib a JOIN players pl ON pl.id = a.player_id LEFT JOIN creator_links l ON l.code = a.${m}_link
      WHERE ${A} IS NOT NULL AND ${cc.sql} AND a.created_at >= ? AND a.created_at <= ?`).all(...cc.p, lo, hi) as { pid: number; creator: number; signedAt: number; fp: string | null; click: string | null; actAt: number | null }[];
    for (const p of rows) {
      if (p.actAt === null || p.creator === p.pid || !creatorOk(db, p.creator) || flaggedPlayer(db, p.creator, p.pid, p.fp, p.click)) continue;
      out.push({ creatorId: p.creator, key: key(`act:${p.pid}`), amountMinor: r.amountMinor ?? 0, matureAt: p.actAt + r.holdDays * DAY, kind: KIND_OF.activated_flat, paymentId: null, basis: { flat: r.amountMinor, activatedAt: p.actAt } });
    }
  } else {
    const cp = campCond(r, 'campaign_id');
    const posts = db.prepare(`SELECT id, creator_id AS creator, verified_views AS v, COALESCE(reviewed_at, updated_at) AS at FROM creator_posts WHERE status = 'approved' AND verified_views IS NOT NULL AND verified_by IS NOT NULL AND verified_views >= 1000 AND ${cp.sql} AND COALESCE(reviewed_at, updated_at) >= ? AND COALESCE(reviewed_at, updated_at) <= ?`).all(...cp.p, lo, hi) as { id: number; creator: number; v: number; at: number }[];
    for (const p of posts) {
      if (!creatorOk(db, p.creator)) continue;
      let amt = Math.floor(p.v / 1000) * (r.amountMinor ?? 0); if (r.capPerItemMinor !== null) amt = Math.min(amt, r.capPerItemMinor);
      out.push({ creatorId: p.creator, key: key(`views:${p.id}`), amountMinor: amt, matureAt: p.at + r.holdDays * DAY, kind: KIND_OF.verified_views_per_1k, paymentId: null, basis: { verifiedViews: p.v, perThousandMinor: r.amountMinor } });
    }
  }
  return out.filter((c) => c.amountMinor > 0 && !one(db, 'SELECT 1 FROM creator_ledger WHERE event_key = ?', c.key));
}
const spent = (db: DatabaseSync, where: string, ...p: (string | number)[]): number => Number(one<{ s: number }>(db, `SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE status != 'rejected' AND ${where}`, ...p)?.s ?? 0);

export interface AccrualReport { created: number; skipped: Record<string, number>; disabled: boolean; byRule: Record<number, number> }
/** Yoqilgan qoidalar bo'yicha yetilgan (kutish davri o'tgan) hodisalar uchun "kutilmoqda" yozuvlarini yaratadi. Qoida yoqilmagan bo'lsa hech narsa qilmaydi. Takror chaqirish xavfsiz. */
export function accrueRewards(db: DatabaseSync, now = Date.now(), env: NodeJS.ProcessEnv = process.env): AccrualReport {
  const rep: AccrualReport = { created: 0, skipped: {}, disabled: true, byRule: {} };
  const m = creditMode(env);
  for (const r of listRules(db).filter((x) => live(x, now))) {
    rep.disabled = false;
    for (const c of candidates(db, r, m)) {
      if (c.matureAt > now) { rep.skipped.hold = (rep.skipped.hold ?? 0) + 1; continue; }
      tx(db, () => {
        const remainCreator = (r.capPerCreatorMinor ?? 0) - spent(db, 'rule_id = ? AND creator_id = ?', r.id, c.creatorId), remainBudget = (r.budgetMinor ?? 0) - spent(db, 'rule_id = ?', r.id);
        const amt = Math.min(c.amountMinor, remainCreator, remainBudget);
        if (amt <= 0) { rep.skipped.cap_or_budget = (rep.skipped.cap_or_budget ?? 0) + 1; return; }
        const ins = db.prepare("INSERT OR IGNORE INTO creator_ledger (creator_id, campaign_id, rule_id, kind, event_key, payment_id, amount_minor, currency, status, basis, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)")
          .run(c.creatorId, r.campaignId, r.id, c.kind, c.key, c.paymentId, amt, LEDGER_CURRENCY, JSON.stringify({ ...c.basis, capped: amt < c.amountMinor, credit: m }), now);
        if (Number(ins.changes)) { hist(db, Number(ins.lastInsertRowid), null, null, 'pending', 'accrual', now); rep.created++; rep.byRule[r.id] = (rep.byRule[r.id] ?? 0) + 1; }
      });
    }
  }
  return rep;
}

// ---------------- Qaytarish (refund) ----------------
/** Admin qaytarilgan to'lovni qayd etadi (avtomatik qaytarish integratsiyasi yo'q). Bu to'lovdan hisoblangan yozuvlar uchun teskari yozuv (idempotent):
 *  foizli komissiya — mutanosib; birinchi-to'lov summasi — faqat to'liq qaytarilsa to'liq. */
export function recordRefund(db: DatabaseSync, adminId: number, paymentId: unknown, amountMinor: unknown, note: unknown, now = Date.now()): { reversal: number } {
  return tx(db, () => {
    const p = one<{ id: string; status: string; a: number }>(db, 'SELECT id, status, COALESCE(hamyon_amount, amount) AS a FROM payments WHERE id = ?', String(paymentId ?? ''));
    if (!p || p.status !== 'success') throw new ApiError(404, 'Muvaffaqiyatli to‘lov topilmadi');
    const total = p.a * TIYIN; const amt = amountMinor === undefined || amountMinor === null || amountMinor === '' ? total : Number(amountMinor);
    if (!Number.isInteger(amt) || amt <= 0 || amt > total) throw new ApiError(400, 'Qaytarilgan summa noto‘g‘ri (to‘lovdan oshmasin, kichik birlikda)');
    if (one(db, 'SELECT 1 FROM creator_refunds WHERE payment_id = ?', p.id)) throw new ApiError(409, 'Bu to‘lov uchun qaytarish allaqachon qayd etilgan');
    db.prepare('INSERT INTO creator_refunds (payment_id, amount_minor, currency, at, recorded_by, note) VALUES (?, ?, ?, ?, ?, ?)').run(p.id, amt, LEDGER_CURRENCY, now, adminId, typeof note === 'string' ? note.slice(0, 300) : null);
    audit(db, adminId, 'creator.refund', p.id, { amt }, now);
    let reversed = 0;
    for (const e of db.prepare("SELECT * FROM creator_ledger WHERE payment_id = ? AND kind IN ('commission','cpa_first_paid') AND status != 'rejected'").all(p.id) as { id: number; creator_id: number; campaign_id: number | null; rule_id: number | null; kind: string; amount_minor: number; status: string }[]) {
      const rev = e.kind === 'commission' ? -Math.round((e.amount_minor * amt) / total) : amt >= total ? -e.amount_minor : 0;
      if (rev === 0) continue;
      const st = e.status === 'pending' ? 'pending' : 'approved'; // teskari yozuv asosiy yozuv holatiga ergashadi
      const r = db.prepare("INSERT OR IGNORE INTO creator_ledger (creator_id, campaign_id, rule_id, parent_id, kind, event_key, payment_id, amount_minor, currency, status, basis, created_at) VALUES (?, ?, ?, ?, 'reversal', ?, ?, ?, ?, ?, ?, ?)")
        .run(e.creator_id, e.campaign_id, e.rule_id, e.id, `refund:${e.id}`, p.id, rev, LEDGER_CURRENCY, st, JSON.stringify({ refundedMinor: amt, ofPaymentMinor: total }), now);
      if (Number(r.changes)) { hist(db, Number(r.lastInsertRowid), adminId, null, st, 'refund', now); reversed += rev; }
    }
    return { reversal: reversed };
  });
}

// ---------------- Daftar qatorlari ----------------
export interface LedgerRow { id: number; creatorId: number; creator?: string; campaignId: number | null; ruleId: number | null; kind: string; amountMinor: number; currency: string; status: string; basis: unknown; note: string | null; createdAt: number; decidedAt: number | null; paymentId?: string | null; paidRef?: string | null }
const toRow = (r: Record<string, unknown>, admin: boolean): LedgerRow => ({ id: Number(r.id), creatorId: Number(r.creator_id), ...(admin ? { creator: String(r.nickname ?? ''), paymentId: (r.payment_id as string | null) ?? null, paidRef: (r.paid_ref as string | null) ?? null } : {}), campaignId: nn(r.campaign_id), ruleId: nn(r.rule_id), kind: String(r.kind), amountMinor: Number(r.amount_minor), currency: String(r.currency), status: String(r.status),
  basis: (() => { try { return JSON.parse(String(r.basis ?? 'null')); } catch { return null; } })(), note: (r.note as string | null) ?? null, createdAt: Number(r.created_at), decidedAt: nn(r.decided_at) });
const rowById = (db: DatabaseSync, id: number): LedgerRow => toRow(one<Record<string, unknown>>(db, 'SELECT l.*, p.nickname FROM creator_ledger l JOIN players p ON p.id = l.creator_id WHERE l.id = ?', id)!, true);

// ---------------- Qo'lda yozuv (admin kiritadi) ----------------
/** Admin qo'lda bonus (musbat) yoki tuzatish (manfiy) kiritadi: creator, summa (kichik birlikda), SABAB (majburiy). Yozuv "kutilmoqda" holatida boshlanadi va umumiy tasdiqlash/to'lov oqimidan o'tadi; audit jurnaliga yoziladi.
 *  ruleId berilsa — o'sha qoidaning byudjetiga sanaladi va byudjetdan oshmasligi tekshiriladi. */
export function addManualEntry(db: DatabaseSync, adminId: number, b: { nickname?: unknown; amountMinor?: unknown; note?: unknown; ruleId?: unknown }, now = Date.now()): LedgerRow {
  return tx(db, () => {
    const c = one<{ id: number; role: string | null }>(db, 'SELECT id, role FROM players WHERE lower(nickname) = lower(?)', String(b.nickname ?? ''));
    if (!c || c.role !== 'creator') throw new ApiError(404, 'Hamkor (rol: creator) topilmadi');
    const amt = Number(b.amountMinor); if (!Number.isInteger(amt) || amt === 0 || Math.abs(amt) > 1e11) throw new ApiError(400, 'Summa: nolga teng bo‘lmagan butun son (kichik birlikda)');
    const note = typeof b.note === 'string' ? b.note.trim().slice(0, 500) : ''; if (note.length < 5) throw new ApiError(400, 'Sabab kamida 5 belgi');
    let ruleId: number | null = null, campaignId: number | null = null;
    if (b.ruleId !== undefined && b.ruleId !== null && b.ruleId !== '') {
      const r = one<Record<string, unknown>>(db, 'SELECT * FROM creator_reward_rules WHERE id = ?', Number(b.ruleId)); if (!r) throw new ApiError(404, 'Qoida topilmadi');
      ruleId = Number(r.id); campaignId = nn(r.campaign_id);
      if (amt > 0 && spent(db, 'rule_id = ?', ruleId) + amt > Number(r.budget_minor ?? 0)) throw new ApiError(409, 'Qoida byudjetidan oshib ketadi');
    }
    const id = Number(db.prepare("INSERT INTO creator_ledger (creator_id, campaign_id, rule_id, kind, event_key, amount_minor, currency, status, basis, note, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)")
      .run(c.id, campaignId, ruleId, amt > 0 ? 'bonus' : 'adjustment', `manual:${randomBytes(8).toString('hex')}`, amt, LEDGER_CURRENCY, JSON.stringify({ manual: true, by: adminId }), note, now).lastInsertRowid);
    hist(db, id, adminId, null, 'pending', note, now); audit(db, adminId, 'creator.ledger.manual', String(id), { amt }, now);
    return rowById(db, id);
  });
}

// ---------------- Qaror va to'lov belgisi ----------------
export function decideEntry(db: DatabaseSync, adminId: number, id: number, decision: unknown, note: unknown, now = Date.now()): LedgerRow {
  return tx(db, () => {
    const to = String(decision ?? ''); if (to !== 'approved' && to !== 'rejected') throw new ApiError(400, 'Qaror noto‘g‘ri');
    const e = one<Record<string, unknown>>(db, 'SELECT * FROM creator_ledger WHERE id = ?', id); if (!e) throw new ApiError(404, 'Yozuv topilmadi');
    if (e.status !== 'pending') throw new ApiError(409, 'Faqat kutilayotgan yozuvga qaror qilinadi');
    if (e.kind === 'reversal') throw new ApiError(409, 'Teskari yozuv asosiy yozuv bilan birga hal bo‘ladi');
    const n = typeof note === 'string' ? note.trim().slice(0, 500) : ''; if (to === 'rejected' && !n) throw new ApiError(400, 'Rad etishda izoh majburiy');
    db.prepare('UPDATE creator_ledger SET status = ?, decided_by = ?, decided_at = ?, note = COALESCE(?, note) WHERE id = ?').run(to, adminId, now, n || null, id);
    hist(db, id, adminId, 'pending', to, n || null, now); audit(db, adminId, `creator.ledger.${to}`, String(id), null, now);
    // Kutilayotgan teskari yozuvlar asosiy yozuv bilan birga hal bo'ladi (asosiy rad etilsa — qaytarish yozuvi ham bekor)
    for (const rv of db.prepare("SELECT id FROM creator_ledger WHERE parent_id = ? AND kind = 'reversal' AND status = 'pending'").all(id) as { id: number }[]) {
      db.prepare('UPDATE creator_ledger SET status = ?, decided_by = ?, decided_at = ? WHERE id = ?').run(to, adminId, now, rv.id); hist(db, rv.id, adminId, 'pending', to, 'with_parent', now);
    }
    return rowById(db, id);
  });
}
/** To'lov BELGISI (qo'lda): haqiqiy o'tkazma tashqarida bajarilgan; bu yerda faqat havola/izoh yoziladi. Faqat tasdiqlangan musbat yozuv. */
export function markPaid(db: DatabaseSync, adminId: number, id: number, paidRef: unknown, now = Date.now()): LedgerRow {
  return tx(db, () => {
    const e = one<Record<string, unknown>>(db, 'SELECT * FROM creator_ledger WHERE id = ?', id); if (!e) throw new ApiError(404, 'Yozuv topilmadi');
    if (e.status !== 'approved' || e.kind === 'reversal' || e.kind === 'adjustment' || Number(e.amount_minor) <= 0) throw new ApiError(409, 'Faqat tasdiqlangan (musbat) mukofot to‘langan deb belgilanadi');
    const ref = typeof paidRef === 'string' ? paidRef.trim().slice(0, 200) : ''; if (ref.length < 3) throw new ApiError(400, 'To‘lov havolasi/izohi majburiy');
    db.prepare("UPDATE creator_ledger SET status = 'paid', paid_ref = ?, decided_by = ?, decided_at = ? WHERE id = ? AND status = 'approved'").run(ref, adminId, now, id);
    hist(db, id, adminId, 'approved', 'paid', ref, now); audit(db, adminId, 'creator.ledger.paid', String(id), null, now);
    return rowById(db, id);
  });
}

// ---------------- Ko'rinishlar: creator (o'ziniki) va admin (xarajat) ----------------
export interface Balances { pending: number; approved: number; paid: number; currency: string }
export function balances(db: DatabaseSync, creatorId?: number): Balances {
  const q = (st: string) => Number(one<{ s: number }>(db, `SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE status = ? ${creatorId !== undefined ? 'AND creator_id = ?' : ''}`, ...(creatorId !== undefined ? [st, creatorId] : [st]))?.s ?? 0);
  return { pending: q('pending'), approved: q('approved'), paid: q('paid'), currency: LEDGER_CURRENCY };
}
export interface Terms { kind: RewardKind; name: string; pct: number | null; amountMinor: number | null; holdDays: number; endsAt: number | null; campaignId: number | null }
/** Creator FAQAT o'z yozuvlarini va amaldagi shartlarni ko'radi (byudjet, to'lovchi shaxsi, to'lov identifikatori va admin izohlarisiz). `inHoldMinor` — kutish davrida turgan, hali hisoblanmagan TAXMINIY summa. */
export function creatorEarnings(db: DatabaseSync, creatorId: number, now = Date.now(), env: NodeJS.ProcessEnv = process.env): { entries: LedgerRow[]; balances: Balances; terms: Terms[]; inHoldMinor: number; enabled: boolean } {
  const rules = listRules(db).filter((r) => live(r, now)); const m = creditMode(env);
  let inHold = 0;
  for (const r of rules) for (const c of candidates(db, r, m)) if (c.creatorId === creatorId && c.matureAt > now) inHold += c.amountMinor;
  return {
    entries: (db.prepare('SELECT * FROM creator_ledger WHERE creator_id = ? ORDER BY id DESC LIMIT 200').all(creatorId) as Record<string, unknown>[]).map((r) => ({ ...toRow(r, false), note: null, basis: null })),
    balances: balances(db, creatorId), inHoldMinor: inHold, enabled: rules.length > 0,
    terms: rules.map((r) => ({ kind: r.kind, name: r.name, pct: r.pct, amountMinor: r.amountMinor, holdDays: r.holdDays, endsAt: r.endsAt, campaignId: r.campaignId })),
  };
}
export const adminLedger = (db: DatabaseSync, status?: string): LedgerRow[] => (db.prepare(`SELECT l.*, p.nickname FROM creator_ledger l JOIN players p ON p.id = l.creator_id ${status ? 'WHERE l.status = ?' : ''} ORDER BY l.id DESC LIMIT 300`).all(...(status ? [status] : [])) as Record<string, unknown>[]).map((r) => toRow(r, true));
export const ledgerHistory = (db: DatabaseSync, id: number) => db.prepare('SELECT ts, actor_id AS actor, from_status AS "from", to_status AS "to", note FROM creator_ledger_history WHERE ledger_id = ? ORDER BY id').all(id);
export interface CostRow { creatorId: number; nickname: string; pending: number; approved: number; paid: number; total: number }
/** Creator boshiga xarajat: kutilmoqda / tasdiqlangan / to'langan va jami (rad etilganlarsiz; teskari yozuvlar ayrilgan). */
export function creatorCosts(db: DatabaseSync): CostRow[] {
  return (db.prepare(`SELECT l.creator_id AS creatorId, p.nickname,
      COALESCE(SUM(CASE WHEN l.status = 'pending' THEN l.amount_minor END), 0) AS pending, COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.amount_minor END), 0) AS approved, COALESCE(SUM(CASE WHEN l.status = 'paid' THEN l.amount_minor END), 0) AS paid
    FROM creator_ledger l JOIN players p ON p.id = l.creator_id GROUP BY l.creator_id ORDER BY (pending + approved + paid) DESC`).all() as Omit<CostRow, 'total'>[]).map((r) => ({ ...r, total: r.pending + r.approved + r.paid }));
}
export interface RuleUsage extends Rule { spentMinor: number; remainingMinor: number | null }
export const ruleUsage = (db: DatabaseSync): RuleUsage[] => listRules(db).map((r) => { const s = spent(db, 'rule_id = ?', r.id); return { ...r, spentMinor: s, remainingMinor: r.budgetMinor === null ? null : r.budgetMinor - s }; });

// ---------------- Reyting (opt-in) va KPI ----------------
export interface RankingEntry { nickname: string; value: number }
/** Ommaviy reyting: FAQAT rank_opt_in=1 va tasdiqlangan hamkorlar; laqab va agregat. To'rt alohida ro'yxat — bitta "vanity" ball yo'q. */
export function creatorRanking(db: DatabaseSync, now = Date.now(), env: NodeJS.ProcessEnv = process.env): { verifiedReach: RankingEntry[]; activatedLearners: RankingEntry[]; retainedLearners: RankingEntry[]; netPaidConversions: RankingEntry[] } {
  const ids = db.prepare("SELECT p.id, p.nickname FROM players p JOIN creator_profiles cp ON cp.player_id = p.id WHERE p.role = 'creator' AND cp.rank_opt_in = 1 AND cp.status = 'approved'").all() as { id: number; nickname: string }[];
  const rows = ids.map((c) => {
    const f = creatorFunnel(db, { creatorId: c.id, from: now - 90 * DAY, to: now + 1 }, now, env);
    const reach = Number(one<{ s: number }>(db, "SELECT COALESCE(SUM(verified_views), 0) AS s FROM creator_posts WHERE creator_id = ? AND status = 'approved' AND verified_views IS NOT NULL", c.id)?.s ?? 0);
    return { nickname: c.nickname, reach, activated: f.activated, retained: f.d7.active, net: Math.max(0, f.paid - f.refunded) };
  });
  const top = (k: 'reach' | 'activated' | 'retained' | 'net'): RankingEntry[] => rows.filter((r) => r[k] > 0).sort((a, b) => b[k] - a[k] || a.nickname.localeCompare(b.nickname)).slice(0, 10).map((r) => ({ nickname: r.nickname, value: r[k] }));
  return { verifiedReach: top('reach'), activatedLearners: top('activated'), retainedLearners: top('retained'), netPaidConversions: top('net') };
}
/** Admin KPI: click→signup, signup→activation, activated→D7, activation→paid, sof tushum, mukofot xarajati, CAC (faollashgan/to'lagan boshiga), qaytarish ulushi. */
export function programKpis(db: DatabaseSync, from: number, to: number, now = Date.now(), env: NodeJS.ProcessEnv = process.env) {
  const f = creatorFunnel(db, { from, to }, now, env);
  const cost = Number(one<{ s: number }>(db, "SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE status IN ('approved','paid') AND created_at >= ? AND created_at < ?", from, to)?.s ?? 0);
  const per = (n: number): number | null => (n > 0 ? Math.round(cost / n) : null);
  return { funnel: f, rewardCostMinor: cost, cacPerActivatedMinor: per(f.activated), cacPerPayerMinor: per(f.paid), currency: LEDGER_CURRENCY, netRevenueMinor: f.netRevenue * TIYIN };
}
