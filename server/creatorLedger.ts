// Creator Growth P2: komissiya/mukofot DAFTARI (ledger). Bu to'lov tizimi EMAS: hech narsa avtomatik to'lanmaydi, hech qanday to'lov integratsiyasi yo'q.
//  * Standart: butunlay O'CHIQ. Yoqish — faqat admin aniq foiz, chegara va byudjetni kiritgandan keyin (egasi tasdiqlagan qiymatlar) va audit jurnali bilan.
//  * Pul kichik birlikda (UZS: tiyin = so'm × 100) + valyuta. Manba — payments.status = 'success' (settled), qaytarilgan summa (creator_refunds) ayriladi.
//  * Idempotentlik: har hodisa bitta yozuv (event_key UNIQUE: pay:<id>, refund:<id>); jadval qayta hisoblansa ham takror yozilmaydi.
//  * Holatlar: pending → approved | rejected; approved → paid (faqat admin qo'lda, to'lov havolasi/izoh bilan). Har o'tish tarixga va audit jurnaliga yoziladi.
//  * Mukofot faqat tekshirilgan mazmunli faollikka (o'quvchi dars/daraja testi/mock bajargan) va haqiqiy to'lovga bog'lanadi — signup yoki ko'rishlarga emas.
//  * Mavjud referral XP/obuna kunlari mukofoti (referral.ts) bilan ARALASHMAYDI. CREATOR_COMMISSION_PCT hozirgidek faqat kabinetda ko'rsatiladi (creator.ts); daftar uni
//    ishlatmaydi — faqat admin sozlagan foiz (app_meta) ishlatiladi.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError, tx } from './db';
import { audit } from './certificates';
import { creatorFunnel, creditMode } from './creatorLinks';
import { listCampaigns } from './creatorOps';

const DAY = 86_400_000;
export const LEDGER_CURRENCY = 'UZS';          // to'lovlar valyutasi (Hamyon, so'm). Boshqa valyuta egasi tasdiqlamaguncha qo'llab-quvvatlanmaydi.
const TIYIN = 100;
export const LEDGER_STATUSES = ['pending', 'approved', 'rejected', 'paid'] as const;

// ---------------- Dastur sozlamalari (app_meta, standart: o'chiq) ----------------
export interface Program { commissionEnabled: boolean; commissionPct: number | null; globalBudgetMinor: number | null; capPerCreatorMinor: number | null; windowDays: number; currency: string; attribution: 'first' | 'last' }
const metaGet = (db: DatabaseSync, k: string): string | undefined => (db.prepare('SELECT value FROM app_meta WHERE key = ?').get(`creator.${k}`) as { value: string } | undefined)?.value;
const metaSet = (db: DatabaseSync, k: string, v: string | null): void => { if (v === null) db.prepare('DELETE FROM app_meta WHERE key = ?').run(`creator.${k}`); else db.prepare('INSERT INTO app_meta (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value').run(`creator.${k}`, v); };
const optNum = (s: string | undefined): number | null => { const n = Number(s); return s !== undefined && s !== '' && Number.isFinite(n) ? n : null; };

export function getProgram(db: DatabaseSync, env: NodeJS.ProcessEnv = process.env): Program {
  const pct = optNum(metaGet(db, 'commission_pct'));
  return { commissionEnabled: metaGet(db, 'commission_enabled') === '1' && pct !== null && pct > 0, commissionPct: pct, globalBudgetMinor: optNum(metaGet(db, 'global_budget_minor')), capPerCreatorMinor: optNum(metaGet(db, 'cap_per_creator_minor')),
    windowDays: optNum(metaGet(db, 'window_days')) ?? 180, currency: LEDGER_CURRENCY, attribution: creditMode(env) };
}
const intMinor = (v: unknown, what: string): number | null => { if (v === null || v === undefined || v === '') return null; const n = Number(v); if (!Number.isInteger(n) || n <= 0 || n > 1e13) throw new ApiError(400, `${what}: musbat butun son (kichik birlikda)`); return n; };
/** Admin dasturni sozlaydi. Yoqish uchun foiz, creator chegarasi VA umumiy byudjet majburiy (byudjetsiz mukofot yoqilmaydi). */
export function setProgram(db: DatabaseSync, adminId: number, b: Record<string, unknown>, now = Date.now()): Program {
  return tx(db, () => {
    if (b.commissionPct !== undefined) { const n = Number(b.commissionPct); if (b.commissionPct !== null && (!Number.isFinite(n) || n <= 0 || n > 90)) throw new ApiError(400, 'Foiz 0 dan katta va 90 dan oshmasin'); metaSet(db, 'commission_pct', b.commissionPct === null ? null : String(n)); }
    if (b.globalBudgetMinor !== undefined) metaSet(db, 'global_budget_minor', String(intMinor(b.globalBudgetMinor, 'Umumiy byudjet') ?? ''));
    if (b.capPerCreatorMinor !== undefined) metaSet(db, 'cap_per_creator_minor', String(intMinor(b.capPerCreatorMinor, 'Creator chegarasi') ?? ''));
    if (b.windowDays !== undefined) { const n = Number(b.windowDays); if (!Number.isInteger(n) || n < 1 || n > 730) throw new ApiError(400, 'Muddat 1–730 kun'); metaSet(db, 'window_days', String(n)); }
    if (b.commissionEnabled !== undefined) {
      if (b.commissionEnabled === true) {
        const p = getProgram(db);
        if (p.commissionPct === null || p.globalBudgetMinor === null || p.capPerCreatorMinor === null) throw new ApiError(409, 'Yoqishdan oldin foiz, creator chegarasi va umumiy byudjetni kiriting');
        if (b.confirmOwnerApproved !== true) throw new ApiError(409, 'Egasi tasdiqlagan qiymatlar ekani tasdiqlanmagan');
      }
      metaSet(db, 'commission_enabled', b.commissionEnabled === true ? '1' : '0');
    }
    audit(db, adminId, 'creator.program', null, { ...b, confirmOwnerApproved: undefined }, now);
    return getProgram(db);
  });
}
/** Kampaniya mukofotini yoqish: valyuta, foiz, chegara va byudjet aniq kiritilishi shart (standart — o'chiq). */
export function approveCampaignReward(db: DatabaseSync, adminId: number, id: number, b: { pct?: unknown; currency?: unknown; budgetMinor?: unknown; capPerCreatorMinor?: unknown; confirmOwnerApproved?: unknown }, now = Date.now()): void {
  const c = db.prepare('SELECT id FROM creator_campaigns WHERE id = ?').get(id); if (!c) throw new ApiError(404, 'Kampaniya topilmadi');
  const pct = Number(b.pct); if (!Number.isFinite(pct) || pct <= 0 || pct > 90) throw new ApiError(400, 'Foiz 0 dan katta va 90 dan oshmasin');
  if (b.currency !== LEDGER_CURRENCY) throw new ApiError(400, `Valyuta: faqat ${LEDGER_CURRENCY} (to‘lovlar valyutasi)`);
  const budget = intMinor(b.budgetMinor, 'Byudjet'), cap = intMinor(b.capPerCreatorMinor, 'Creator chegarasi'); if (budget === null || cap === null) throw new ApiError(400, 'Byudjet va creator chegarasi majburiy');
  if (b.confirmOwnerApproved !== true) throw new ApiError(409, 'Egasi tasdiqlagan qiymatlar ekani tasdiqlanmagan');
  db.prepare("UPDATE creator_campaigns SET reward_enabled = 1, reward_kind = 'commission_pct', reward_pct = ?, currency = ?, budget_minor = ?, cap_per_creator_minor = ?, updated_at = ? WHERE id = ?").run(pct, LEDGER_CURRENCY, budget, cap, now, id);
  audit(db, adminId, 'campaign.reward.enable', String(id), { pct, budget, cap }, now);
}
export function disableCampaignReward(db: DatabaseSync, adminId: number, id: number, now = Date.now()): void {
  db.prepare('UPDATE creator_campaigns SET reward_enabled = 0, updated_at = ? WHERE id = ?').run(now, id); audit(db, adminId, 'campaign.reward.disable', String(id), null, now);
}

// ---------------- Qaytarish (refund) ----------------
/** Admin qaytarilgan to'lovni qayd etadi (Hamyon kartaga o'tkazma — avtomatik qaytarish integratsiyasi yo'q). Ledgerda komissiya bo'lsa — mutanosib teskari yozuv (idempotent). */
export function recordRefund(db: DatabaseSync, adminId: number, paymentId: unknown, amountMinor: unknown, note: unknown, now = Date.now()): { reversal: number } {
  return tx(db, () => {
    const p = db.prepare("SELECT id, status, COALESCE(hamyon_amount, amount) AS a FROM payments WHERE id = ?").get(String(paymentId ?? '')) as { id: string; status: string; a: number } | undefined;
    if (!p || p.status !== 'success') throw new ApiError(404, 'Muvaffaqiyatli to‘lov topilmadi');
    const total = p.a * TIYIN; const amt = amountMinor === undefined || amountMinor === null || amountMinor === '' ? total : Number(amountMinor);
    if (!Number.isInteger(amt) || amt <= 0 || amt > total) throw new ApiError(400, 'Qaytarilgan summa noto‘g‘ri (to‘lovdan oshmasin, kichik birlikda)');
    if (db.prepare('SELECT 1 FROM creator_refunds WHERE payment_id = ?').get(p.id)) throw new ApiError(409, 'Bu to‘lov uchun qaytarish allaqachon qayd etilgan');
    db.prepare('INSERT INTO creator_refunds (payment_id, amount_minor, currency, at, recorded_by, note) VALUES (?, ?, ?, ?, ?, ?)').run(p.id, amt, LEDGER_CURRENCY, now, adminId, typeof note === 'string' ? note.slice(0, 300) : null);
    audit(db, adminId, 'creator.refund', p.id, { amt }, now);
    const orig = db.prepare("SELECT * FROM creator_ledger WHERE event_key = ? AND status != 'rejected'").get(`pay:${p.id}`) as { id: number; creator_id: number; campaign_id: number | null; amount_minor: number; status: string } | undefined;
    if (!orig) return { reversal: 0 };
    const rev = -Math.round((orig.amount_minor * amt) / total);
    if (rev === 0) return { reversal: 0 };
    // Teskari yozuv asosiy yozuv holatiga ergashadi: asosiy hali kutilayotgan bo'lsa — kutilayotgan (u hal bo'lganda birga hal bo'ladi); tasdiqlangan/to'langan bo'lsa — tasdiqlangan
    const st = orig.status === 'pending' ? 'pending' : 'approved';
    const r = db.prepare("INSERT OR IGNORE INTO creator_ledger (creator_id, campaign_id, kind, event_key, payment_id, amount_minor, currency, status, basis, created_at) VALUES (?, ?, 'reversal', ?, ?, ?, ?, ?, ?, ?)")
      .run(orig.creator_id, orig.campaign_id, `refund:${p.id}`, p.id, rev, LEDGER_CURRENCY, st, JSON.stringify({ refundedMinor: amt, ofPaymentMinor: total }), now);
    if (Number(r.changes)) hist(db, Number(r.lastInsertRowid), adminId, null, st, 'refund reversal', now);
    return { reversal: rev };
  });
}

// ---------------- Hisoblash (accrual) ----------------
const hist = (db: DatabaseSync, ledgerId: number, actor: number | null, from: string | null, to: string, note: string | null, now: number): void => { db.prepare('INSERT INTO creator_ledger_history (ledger_id, ts, actor_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?, ?)').run(ledgerId, now, actor, from, to, note); };
const spent = (db: DatabaseSync, where: string, ...p: (string | number)[]): number => Number((db.prepare(`SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE status != 'rejected' AND ${where}`).get(...p) as { s: number }).s);

export interface AccrualReport { created: number; skipped: Record<string, number>; disabled: boolean }
/** Yangi muvaffaqiyatli to'lovlar uchun komissiya yozuvlarini (pending) yaratadi. O'chiq bo'lsa hech narsa qilmaydi. Takror chaqirish xavfsiz (idempotent). */
export function accrueCommissions(db: DatabaseSync, now = Date.now(), env: NodeJS.ProcessEnv = process.env): AccrualReport {
  const prog = getProgram(db, env); const rep: AccrualReport = { created: 0, skipped: {}, disabled: false };
  const skip = (k: string) => { rep.skipped[k] = (rep.skipped[k] ?? 0) + 1; };
  const m = prog.attribution;
  const campaigns = new Map(listCampaigns(db, true, now).map((c) => [c.id, c]));
  const rewardRows = db.prepare('SELECT id, reward_pct AS pct FROM creator_campaigns WHERE reward_enabled = 1').all() as { id: number; pct: number }[];
  const campPct = new Map(rewardRows.map((r) => [r.id, r.pct]));
  if (!prog.commissionEnabled && campPct.size === 0) { rep.disabled = true; return rep; }
  const pays = db.prepare(`SELECT p.id, p.player_id AS pid, p.paid_at AS at, COALESCE(p.hamyon_amount, p.amount) AS a, a.${m}_creator AS creator, a.${m}_link AS link, l.campaign_id AS campaign, pl.created_at AS signedAt
    FROM payments p JOIN creator_attrib a ON a.player_id = p.player_id JOIN players pl ON pl.id = p.player_id LEFT JOIN creator_links l ON l.code = a.${m}_link
    WHERE p.status = 'success' AND a.${m}_creator IS NOT NULL AND NOT EXISTS (SELECT 1 FROM creator_ledger g WHERE g.event_key = 'pay:' || p.id) ORDER BY p.paid_at, p.id`).all() as { id: string; pid: number; at: number; a: number; creator: number; link: string | null; campaign: number | null; signedAt: number }[];
  for (const p of pays) {
    tx(db, () => {
      const role = db.prepare('SELECT p.role, COALESCE(cp.status, \'approved\') AS st FROM players p LEFT JOIN creator_profiles cp ON cp.player_id = p.id WHERE p.id = ?').get(p.creator) as { role: string | null; st: string } | undefined;
      if (role?.role !== 'creator' || role.st !== 'approved') return skip('creator_not_approved');
      if (p.creator === p.pid) return skip('self');
      if (p.at - p.signedAt > prog.windowDays * DAY) return skip('outside_window');
      if (db.prepare("SELECT 1 FROM creator_flags WHERE dedupe_key = ?").get(`sr:${p.creator}:${p.pid}`)) return skip('self_referral_flag');
      if (!db.prepare("SELECT 1 FROM xp_events WHERE player_id = ? AND source IN ('placement','lesson','mock') AND accepted > 0 LIMIT 1").get(p.pid)) return skip('not_activated');
      const camp = p.campaign !== null ? campaigns.get(p.campaign) : undefined;
      let pct: number | null, capCreator: number | null, budget: number | null, scope: string, scopeP: (string | number)[];
      if (camp) {
        if (!campPct.has(camp.id) || camp.status !== 'active' || (camp.endsAt !== null && p.at > camp.endsAt)) return skip('campaign_reward_off');
        pct = campPct.get(camp.id)!; capCreator = camp.capPerCreatorMinor; budget = camp.budgetMinor; scope = 'campaign_id = ?'; scopeP = [camp.id];
      } else {
        if (!prog.commissionEnabled) return skip('commission_off');
        pct = prog.commissionPct; capCreator = prog.capPerCreatorMinor; budget = prog.globalBudgetMinor; scope = 'campaign_id IS NULL'; scopeP = [];
      }
      if (!pct || capCreator === null || budget === null) return skip('no_limits');
      const refunded = (db.prepare('SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_refunds WHERE payment_id = ?').get(p.id) as { s: number }).s;
      const base = p.a * TIYIN - refunded; if (base <= 0) return skip('refunded');
      let amount = Math.round((base * pct) / 100);
      const remainCreator = capCreator - spent(db, `creator_id = ? AND ${scope}`, p.creator, ...scopeP), remainBudget = budget - spent(db, scope, ...scopeP);
      const clipped = Math.min(amount, remainCreator, remainBudget); if (clipped <= 0) return skip('cap_or_budget'); const capped = clipped < amount; amount = clipped;
      const r = db.prepare("INSERT OR IGNORE INTO creator_ledger (creator_id, campaign_id, kind, event_key, payment_id, amount_minor, currency, status, basis, created_at) VALUES (?, ?, 'commission', ?, ?, ?, ?, 'pending', ?, ?)")
        .run(p.creator, camp?.id ?? null, `pay:${p.id}`, p.id, amount, LEDGER_CURRENCY, JSON.stringify({ pct, baseMinor: base, capped, credit: m }), now);
      if (Number(r.changes)) { hist(db, Number(r.lastInsertRowid), null, null, 'pending', 'accrual', now); rep.created++; }
    });
  }
  return rep;
}

// ---------------- Qaror va to'lov belgisi ----------------
export interface LedgerRow { id: number; creatorId: number; creator?: string; campaignId: number | null; kind: string; amountMinor: number; currency: string; status: string; basis: unknown; note: string | null; createdAt: number; decidedAt: number | null; paymentId?: string | null; paidRef?: string | null }
const toRow = (r: Record<string, unknown>, admin: boolean): LedgerRow => ({ id: Number(r.id), creatorId: Number(r.creator_id), ...(admin ? { creator: String(r.nickname ?? ''), paymentId: (r.payment_id as string | null) ?? null, paidRef: (r.paid_ref as string | null) ?? null } : {}), campaignId: r.campaign_id === null ? null : Number(r.campaign_id), kind: String(r.kind), amountMinor: Number(r.amount_minor), currency: String(r.currency), status: String(r.status), basis: (() => { try { return JSON.parse(String(r.basis ?? 'null')); } catch { return null; } })(), note: (r.note as string | null) ?? null, createdAt: Number(r.created_at), decidedAt: r.decided_at === null ? null : Number(r.decided_at) });
export function decideEntry(db: DatabaseSync, adminId: number, id: number, decision: unknown, note: unknown, now = Date.now()): LedgerRow {
  return tx(db, () => {
    const to = String(decision ?? ''); if (to !== 'approved' && to !== 'rejected') throw new ApiError(400, 'Qaror noto‘g‘ri');
    const e = db.prepare('SELECT * FROM creator_ledger WHERE id = ?').get(id) as Record<string, unknown> | undefined; if (!e) throw new ApiError(404, 'Yozuv topilmadi');
    if (e.status !== 'pending') throw new ApiError(409, 'Faqat kutilayotgan yozuvga qaror qilinadi');
    if (e.kind === 'reversal') throw new ApiError(409, 'Teskari yozuv asosiy yozuv bilan birga hal bo‘ladi');
    const n = typeof note === 'string' ? note.trim().slice(0, 500) : ''; if (to === 'rejected' && !n) throw new ApiError(400, 'Rad etishda izoh majburiy');
    db.prepare('UPDATE creator_ledger SET status = ?, decided_by = ?, decided_at = ?, note = ? WHERE id = ?').run(to, adminId, now, n || null, id);
    hist(db, id, adminId, 'pending', to, n || null, now); audit(db, adminId, `creator.ledger.${to}`, String(id), null, now);
    // Shu to'lovning kutilayotgan teskari yozuvi: asosiy tasdiqlansa — tasdiqlanadi; rad etilsa — bekor (asosiy rad etilgan bo'lsa qaytarish komissiyasi yo'q)
    for (const rv of db.prepare("SELECT id FROM creator_ledger WHERE payment_id = ? AND kind = 'reversal' AND status = 'pending'").all(e.payment_id as string) as { id: number }[]) {
      db.prepare('UPDATE creator_ledger SET status = ?, decided_by = ?, decided_at = ? WHERE id = ?').run(to, adminId, now, rv.id); hist(db, rv.id, adminId, 'pending', to, 'with_parent', now);
    }
    return toRow(db.prepare('SELECT l.*, p.nickname FROM creator_ledger l JOIN players p ON p.id = l.creator_id WHERE l.id = ?').get(id) as Record<string, unknown>, true);
  });
}
/** To'lov BELGISI (qo'lda): haqiqiy o'tkazma tashqarida bajarilgan; bu yerda faqat havola/izoh yoziladi. Faqat tasdiqlangan komissiya/bonus. */
export function markPaid(db: DatabaseSync, adminId: number, id: number, paidRef: unknown, now = Date.now()): LedgerRow {
  return tx(db, () => {
    const e = db.prepare('SELECT * FROM creator_ledger WHERE id = ?').get(id) as Record<string, unknown> | undefined; if (!e) throw new ApiError(404, 'Yozuv topilmadi');
    if (e.status !== 'approved' || e.kind === 'reversal' || Number(e.amount_minor) <= 0) throw new ApiError(409, 'Faqat tasdiqlangan (musbat) komissiya to‘langan deb belgilanadi');
    const ref = typeof paidRef === 'string' ? paidRef.trim().slice(0, 200) : ''; if (ref.length < 3) throw new ApiError(400, 'To‘lov havolasi/izohi majburiy');
    db.prepare("UPDATE creator_ledger SET status = 'paid', paid_ref = ?, decided_by = ?, decided_at = ? WHERE id = ? AND status = 'approved'").run(ref, adminId, now, id);
    hist(db, id, adminId, 'approved', 'paid', ref, now); audit(db, adminId, 'creator.ledger.paid', String(id), null, now);
    return toRow(db.prepare('SELECT l.*, p.nickname FROM creator_ledger l JOIN players p ON p.id = l.creator_id WHERE l.id = ?').get(id) as Record<string, unknown>, true);
  });
}
export interface Balances { pending: number; approved: number; paid: number; currency: string }
export function balances(db: DatabaseSync, creatorId?: number): Balances {
  const q = (st: string) => Number((db.prepare(`SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE status = ? ${creatorId !== undefined ? 'AND creator_id = ?' : ''}`).get(...(creatorId !== undefined ? [st, creatorId] : [st])) as { s: number }).s);
  return { pending: q('pending'), approved: q('approved'), paid: q('paid'), currency: LEDGER_CURRENCY };
}
/** Creator FAQAT o'z yozuvlarini ko'radi (to'lovchi shaxsi, to'lov identifikatori va admin izohlari yo'q). */
export const creatorLedgerOf = (db: DatabaseSync, creatorId: number): { entries: LedgerRow[]; balances: Balances; enabled: boolean } => ({
  entries: (db.prepare('SELECT * FROM creator_ledger WHERE creator_id = ? ORDER BY id DESC LIMIT 200').all(creatorId) as Record<string, unknown>[]).map((r) => ({ ...toRow(r, false), note: null })),
  balances: balances(db, creatorId), enabled: getProgram(db).commissionEnabled || (db.prepare('SELECT 1 FROM creator_campaigns WHERE reward_enabled = 1 LIMIT 1').get() !== undefined) });
export const adminLedger = (db: DatabaseSync, status?: string): LedgerRow[] => (db.prepare(`SELECT l.*, p.nickname FROM creator_ledger l JOIN players p ON p.id = l.creator_id ${status ? 'WHERE l.status = ?' : ''} ORDER BY l.id DESC LIMIT 300`).all(...(status ? [status] : [])) as Record<string, unknown>[]).map((r) => toRow(r, true));
export const ledgerHistory = (db: DatabaseSync, id: number) => db.prepare('SELECT ts, actor_id AS actor, from_status AS "from", to_status AS "to", note FROM creator_ledger_history WHERE ledger_id = ? ORDER BY id').all(id);

// ---------------- Reyting (opt-in) va KPI ----------------
export interface RankingEntry { nickname: string; value: number }
/** Ommaviy reyting: FAQAT rank_opt_in=1 va tasdiqlangan hamkorlar; laqab va agregat. To'rt alohida ro'yxat — bitta "vanity" ball yo'q. */
export function creatorRanking(db: DatabaseSync, now = Date.now(), env: NodeJS.ProcessEnv = process.env): { verifiedReach: RankingEntry[]; activatedLearners: RankingEntry[]; retainedLearners: RankingEntry[]; netPaidConversions: RankingEntry[] } {
  const ids = db.prepare("SELECT p.id, p.nickname FROM players p JOIN creator_profiles cp ON cp.player_id = p.id WHERE p.role = 'creator' AND cp.rank_opt_in = 1 AND cp.status = 'approved'").all() as { id: number; nickname: string }[];
  const rows = ids.map((c) => {
    const f = creatorFunnel(db, { creatorId: c.id, from: now - 90 * DAY, to: now + 1 }, now, env);
    const reach = Number((db.prepare("SELECT COALESCE(SUM(verified_views), 0) AS s FROM creator_posts WHERE creator_id = ? AND status = 'approved' AND verified_views IS NOT NULL").get(c.id) as { s: number }).s);
    return { nickname: c.nickname, reach, activated: f.activated, retained: f.d7.active, net: Math.max(0, f.paid - f.refunded) };
  });
  const top = (k: 'reach' | 'activated' | 'retained' | 'net'): RankingEntry[] => rows.filter((r) => r[k] > 0).sort((a, b) => b[k] - a[k] || a.nickname.localeCompare(b.nickname)).slice(0, 10).map((r) => ({ nickname: r.nickname, value: r[k] }));
  return { verifiedReach: top('reach'), activatedLearners: top('activated'), retainedLearners: top('retained'), netPaidConversions: top('net') };
}
/** Admin KPI: click→signup, signup→activation, activated→D7, activation→paid, sof tushum, mukofot xarajati, CAC (faollashgan/to'lagan boshiga), qaytarish ulushi. */
export function programKpis(db: DatabaseSync, from: number, to: number, now = Date.now(), env: NodeJS.ProcessEnv = process.env) {
  const f = creatorFunnel(db, { from, to }, now, env);
  const cost = Number((db.prepare("SELECT COALESCE(SUM(amount_minor), 0) AS s FROM creator_ledger WHERE status IN ('approved','paid') AND created_at >= ? AND created_at < ?").get(from, to) as { s: number }).s);
  const per = (n: number): number | null => (n > 0 ? Math.round(cost / n) : null);
  return { funnel: f, rewardCostMinor: cost, cacPerActivatedMinor: per(f.activated), cacPerPayerMinor: per(f.paid), currency: LEDGER_CURRENCY, netRevenueMinor: f.netRevenue * TIYIN };
}
