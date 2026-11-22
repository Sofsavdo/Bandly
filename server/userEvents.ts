// Analytics 2.0 — kirgan o'quvchining hodisalari va kohorta ko'rsatkichlari.
//
// Tamoyil: serverda ishonchli saqlanadigan ma'lumot QAYTA yozilmaydi — u o'z jadvalidan o'qiladi:
//   ro'yxatdan o'tish → players.created_at; dars/daraja testi/mock tugatildi → xp_events (source, accepted > 0);
//   Writing/Speaking baholandi → exam_results (module 'ai'); to'lov boshlandi/to'landi → payments; AI xarajati → ai_cost_events;
//   referal → players.referred_by / ref_rewarded.
// Faqat brauzerda bo'ladigan harakatlar (boshlash, onboarding, reja bajarildi, tariflarni ko'rish, ulashish) user_events ga yoziladi:
//   (player_id, name, day) — bir o'quvchi bir kunda bir hodisani BIR marta (takror yuborish sonni oshirmaydi), n — urinishlar soni.
// Shaxsiy ma'lumot yo'q: faqat ichki player_id, hodisa nomi va kun. Hisobot faqat agregat sonlarni qaytaradi.
import type { DatabaseSync } from 'node:sqlite';
import { TZ_OFFSET_MS, tzDay } from './day';

export const USER_EVENTS = [
  'onboarding_done', 'lesson_start', 'mock_start', 'speaking_start', 'writing_start',
  'plan_done', 'pricing_view', 'checkout_start', 'referral_share', 'insight_follow',
] as const;
export type UserEvent = (typeof USER_EVENTS)[number];
export const isUserEvent = (x: unknown): x is UserEvent => (USER_EVENTS as readonly unknown[]).includes(x);

export function ensureUserEventsTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS user_events (
    player_id INTEGER NOT NULL REFERENCES players(id), name TEXT NOT NULL, day TEXT NOT NULL, first_ts INTEGER NOT NULL, n INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (player_id, name, day))`);
  db.exec('CREATE INDEX IF NOT EXISTS user_events_name_ts ON user_events (name, first_ts)');
}

/** Hodisani yozadi. 'new' — shu kun uchun birinchi marta, 'repeat' — takror (faqat n oshadi), 'rejected' — noma'lum nom. */
export function recordUserEvent(db: DatabaseSync, playerId: number, name: unknown, now = Date.now()): 'new' | 'repeat' | 'rejected' {
  if (!isUserEvent(name) || !Number.isInteger(playerId) || playerId <= 0) return 'rejected';
  const r = db.prepare('INSERT INTO user_events (player_id, name, day, first_ts, n) VALUES (?, ?, ?, ?, 1) ON CONFLICT(player_id, name, day) DO UPDATE SET n = MIN(n + 1, 1000)').run(playerId, name, tzDay(now), now);
  const fresh = db.prepare('SELECT n FROM user_events WHERE player_id = ? AND name = ? AND day = ?').get(playerId, name, tzDay(now)) as { n: number };
  return Number(r.changes) && fresh.n === 1 ? 'new' : 'repeat';
}

const DAY = 86_400_000;
const dayIdx = (ts: number) => Math.floor((ts + TZ_OFFSET_MS) / DAY);
const pct = (a: number, b: number): number | null => (b > 0 ? Math.round((a / b) * 1000) / 10 : null);

/** Ta'riflar (Admin → Analitika'da ko'rsatiladi). */
export const DEFINITIONS = {
  cohort: 'Tanlangan davrda ro‘yxatdan o‘tgan o‘quvchilar. Har bir qadam — shu o‘quvchilardan nechtasi (noyob) ro‘yxatdan keyin istalgan vaqtda bajargan.',
  activation: 'Faollashgan: ro‘yxatdan o‘tgandan keyin 7 kun ichida kamida bitta dars, mock yoki daraja testini tugatgan.',
  retention: 'D1/D7/D30: ro‘yxatdan o‘tgan kundan aynan 1/7/30 kun o‘tib XP olgan o‘quvchilar ulushi. Faqat shu kun allaqachon kelgan o‘quvchilar hisoblanadi.',
  paid: 'To‘lagan: kamida bitta muvaffaqiyatli to‘lov. Referal yoki admin sovg‘a qilgan kunlar to‘lov emas.',
  renewal: 'Uzaytirgan: kamida ikki muvaffaqiyatli to‘lov.',
  active: 'Faol o‘quvchi: davr ichida kamida bir kun XP olgan (noyob).',
  arpu: 'Faol o‘quvchiga daromad: davr daromadi ÷ faol o‘quvchilar.',
  aiPerActive: 'Faol o‘quvchiga AI xarajati: davrdagi AI xarajati (USD) ÷ faol o‘quvchilar.',
  aiPerSession: 'Bitta yakunlangan AI baholashga xarajat: writing/speaking baholash xarajati ÷ saqlangan baholashlar soni.',
} as const;

export interface CohortStep { key: string; users: number; pct: number | null }
export interface CohortReport {
  from: number; to: number;
  signups: number;
  steps: CohortStep[];
  retention: { d1: number | null; d7: number | null; d30: number | null; eligible: { d1: number; d7: number; d30: number } };
  activated: number; activationPct: number | null;
  paid: number; activationToPaidPct: number | null; freeToPaidPct: number | null;
  renewed: number; renewalPct: number | null;
  period: { activeUsers: number; revenue: number; arpu: number | null; aiUsd: number; aiUsdPerActive: number | null; aiEvalUsd: number; aiEvals: number; aiUsdPerEval: number | null };
  adoption: { feature: string; users: number }[];
}

/** Kohorta hisobotlari: [from, to) oralig'ida ro'yxatdan o'tganlar. Barcha foizlar — noyob o'quvchilar bo'yicha, hodisalar yig'indisi bo'yicha emas. */
export function cohortReport(db: DatabaseSync, from: number, to: number, now = Date.now()): CohortReport {
  ensureUserEventsTable(db);
  const cohort = db.prepare('SELECT id, created_at AS c FROM players WHERE created_at >= ? AND created_at < ?').all(from, to) as { id: number; c: number }[];
  const ids = new Set(cohort.map((u) => u.id));
  const created = new Map(cohort.map((u) => [u.id, u.c]));
  const count = (rows: { p: number; ts: number }[], within?: number): number => {
    const seen = new Set<number>();
    for (const r of rows) { const c = created.get(r.p); if (c !== undefined && r.ts >= c && (within === undefined || r.ts < c + within)) seen.add(r.p); }
    return seen.size;
  };
  const xp = (src: string) => db.prepare('SELECT x.player_id AS p, x.ts FROM xp_events x JOIN players p ON p.id = x.player_id WHERE p.created_at >= ? AND p.created_at < ? AND x.source = ? AND x.accepted > 0').all(from, to, src) as { p: number; ts: number }[];
  const ue = (name: UserEvent) => db.prepare('SELECT e.player_id AS p, e.first_ts AS ts FROM user_events e JOIN players p ON p.id = e.player_id WHERE p.created_at >= ? AND p.created_at < ? AND e.name = ?').all(from, to, name) as { p: number; ts: number }[];
  const ai = (kind: string) => db.prepare("SELECT r.player_id AS p, r.at AS ts FROM exam_results r JOIN players p ON p.id = r.player_id WHERE p.created_at >= ? AND p.created_at < ? AND r.module = 'ai' AND r.kind = ?").all(from, to, kind) as { p: number; ts: number }[];
  const pay = (status: string | null) => db.prepare(`SELECT y.player_id AS p, COALESCE(y.paid_at, y.created_at) AS ts FROM payments y JOIN players p ON p.id = y.player_id WHERE p.created_at >= ? AND p.created_at < ?${status ? ' AND y.status = ?' : ''}`).all(...(status ? [from, to, status] : [from, to])) as { p: number; ts: number }[];
  const lessons = xp('lesson'), mocks = xp('mock'), placement = xp('placement');
  const paidRows = pay('success');
  const steps: [string, number][] = [
    ['onboarding_done', count(ue('onboarding_done'))],
    ['placement_done', count(placement)],
    ['lesson_start', count(ue('lesson_start'))],
    ['lesson_done', count(lessons)],
    ['mock_start', count(ue('mock_start'))],
    ['mock_done', count(mocks)],
    ['speaking_start', count(ue('speaking_start'))],
    ['speaking_evaluated', count(ai('speaking'))],
    ['writing_evaluated', count(ai('writing'))],
    ['plan_done', count(ue('plan_done'))],
    ['pricing_view', count(ue('pricing_view'))],
    ['checkout_start', count([...ue('checkout_start'), ...pay(null)])],
    ['payment_done', count(paidRows)],
    ['referral_share', count(ue('referral_share'))],
  ];
  const signups = cohort.length;
  // Faollashish: 7 kun ichida dars/mock/daraja testi
  const activatedIds = new Set<number>();
  for (const r of [...lessons, ...mocks, ...placement]) { const c = created.get(r.p); if (c !== undefined && r.ts >= c && r.ts < c + 7 * DAY) activatedIds.add(r.p); }
  const paidIds = new Set(paidRows.filter((r) => ids.has(r.p)).map((r) => r.p));
  const paidCount = new Map<number, number>(); for (const r of paidRows) paidCount.set(r.p, (paidCount.get(r.p) ?? 0) + 1);
  const renewed = [...paidCount.values()].filter((n) => n >= 2).length;
  // Saqlanib qolish (kohorta ichida, aynan N-kun)
  const today = dayIdx(now);
  const active = new Map<number, Set<number>>();
  for (const r of db.prepare('SELECT x.player_id AS p, x.ts FROM xp_events x JOIN players p ON p.id = x.player_id WHERE p.created_at >= ? AND p.created_at < ? AND x.accepted > 0').all(from, to) as { p: number; ts: number }[]) { if (!active.has(r.p)) active.set(r.p, new Set()); active.get(r.p)!.add(dayIdx(r.ts)); }
  const ret = (n: number) => { const el = cohort.filter((u) => dayIdx(u.c) + n <= today); return { el: el.length, rate: el.length ? pct(el.filter((u) => active.get(u.id)?.has(dayIdx(u.c) + n)).length, el.length) : null }; };
  const r1 = ret(1), r7 = ret(7), r30 = ret(30);
  // Davr ko'rsatkichlari (shu davrdagi BARCHA faol o'quvchilar, kohortadan qat'i nazar)
  const activeUsers = (db.prepare('SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE accepted > 0 AND ts >= ? AND ts < ?').get(from, to) as { n: number }).n;
  const revenue = (db.prepare("SELECT COALESCE(SUM(COALESCE(hamyon_amount, amount)), 0) AS s FROM payments WHERE status = 'success' AND paid_at >= ? AND paid_at < ?").get(from, to) as { s: number }).s;
  const aiUsd = (db.prepare('SELECT COALESCE(SUM(cost_usd), 0) AS s FROM ai_cost_events WHERE ts >= ? AND ts < ?').get(from, to) as { s: number }).s;
  const aiEvalUsd = (db.prepare("SELECT COALESCE(SUM(cost_usd), 0) AS s FROM ai_cost_events WHERE ts >= ? AND ts < ? AND feature IN ('writing_eval', 'speaking_eval')").get(from, to) as { s: number }).s;
  const aiEvals = (db.prepare("SELECT COUNT(*) AS n FROM exam_results WHERE module = 'ai' AND at >= ? AND at < ?").get(from, to) as { n: number }).n;
  const round2 = (x: number) => Math.round(x * 100) / 100, round4 = (x: number) => Math.round(x * 10_000) / 10_000;
  const adopt = (sql: string) => (db.prepare(sql).get(from, to) as { n: number }).n;
  return {
    from, to, signups,
    steps: steps.map(([key, users]) => ({ key, users, pct: pct(users, signups) })),
    retention: { d1: r1.rate, d7: r7.rate, d30: r30.rate, eligible: { d1: r1.el, d7: r7.el, d30: r30.el } },
    activated: activatedIds.size, activationPct: pct(activatedIds.size, signups),
    paid: paidIds.size, activationToPaidPct: pct([...paidIds].filter((p) => activatedIds.has(p)).length, activatedIds.size), freeToPaidPct: pct(paidIds.size, signups),
    renewed, renewalPct: pct(renewed, paidIds.size),
    period: {
      activeUsers, revenue, arpu: activeUsers ? Math.round(revenue / activeUsers) : null,
      aiUsd: round2(aiUsd), aiUsdPerActive: activeUsers ? round4(aiUsd / activeUsers) : null,
      aiEvalUsd: round2(aiEvalUsd), aiEvals, aiUsdPerEval: aiEvals ? round4(aiEvalUsd / aiEvals) : null,
    },
    adoption: [
      { feature: 'lesson', users: adopt("SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE source = 'lesson' AND accepted > 0 AND ts >= ? AND ts < ?") },
      { feature: 'mock', users: adopt("SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE source = 'mock' AND accepted > 0 AND ts >= ? AND ts < ?") },
      { feature: 'writing_eval', users: adopt("SELECT COUNT(DISTINCT player_id) AS n FROM exam_results WHERE module = 'ai' AND kind = 'writing' AND at >= ? AND at < ?") },
      { feature: 'speaking_eval', users: adopt("SELECT COUNT(DISTINCT player_id) AS n FROM exam_results WHERE module = 'ai' AND kind = 'speaking' AND at >= ? AND at < ?") },
      { feature: 'coach', users: adopt("SELECT COUNT(DISTINCT player_id) AS n FROM ai_cost_events WHERE feature IN ('coach', 'live') AND ts >= ? AND ts < ?") },
      { feature: 'plan_done', users: adopt('SELECT COUNT(DISTINCT player_id) AS n FROM user_events WHERE name = \'plan_done\' AND first_ts >= ? AND first_ts < ?') },
      { feature: 'insight_follow', users: adopt('SELECT COUNT(DISTINCT player_id) AS n FROM user_events WHERE name = \'insight_follow\' AND first_ts >= ? AND first_ts < ?') },
    ],
  };
}
