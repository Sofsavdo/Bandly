// Admin uchun bot statistikasi (/stat): faqat admin rolidagi, Telegram orqali bog'langan hisob egasiga yuboriladi.
// Faqat o'qish (SELECT). Matnlar faqat o'zbekcha — admin xabari tarjima qilinmaydi (i18n katalogidan chiqarilgan).
import type { DatabaseSync } from 'node:sqlite';
import { roleOf } from './db';
import { TZ_OFFSET_MS, tzDay, tzDayStart } from './day';

const DAY = 86_400_000;

/** Telegram foydalanuvchisi admin hisobiga bog'langanmi (players.tg_id + admin roli, ADMIN_NICKNAMES ham hisobga olinadi). */
export function isAdminTg(db: DatabaseSync, tgId: number, env: NodeJS.ProcessEnv = process.env): boolean {
  try {
    const rows = db.prepare('SELECT id FROM players WHERE tg_id = ?').all(tgId) as { id: number }[];
    return rows.some((r) => roleOf(db, r.id, env) === 'admin');
  } catch { return false; }
}

const num = (n: number) => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
const usd = (n: number) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;

export interface StatNumbers {
  players: { total: number; telegram: number; today: number; week: number; month: number };
  active: { today: number; week: number; month: number };
  subs: { paid: number; gift: number; general: number; exam: number; all: number; premium: number };
  pay: { today: [number, number]; week: [number, number]; month: [number, number]; total: [number, number] };
  phones: number;
  voiceToday: { minutes: number; freeMinutes: number; people: number };
  ai: { today: number; month: number };
}

/** Barcha raqamlar bitta joyda (test qilish oson). Jadval bo'lmasa — 0. */
export function statNumbers(db: DatabaseSync, now = Date.now()): StatNumbers {
  const safe = <T>(f: () => T, dflt: T): T => { try { return f(); } catch { return dflt; } };
  const n = (sql: string, ...a: (number | string)[]) => safe(() => Number((db.prepare(sql).get(...a) as { n: number | null } | undefined)?.n ?? 0), 0);
  const d0 = tzDayStart(now), d7 = d0 - 6 * DAY, d30 = d0 - 29 * DAY;
  const pay = (from: number): [number, number] => safe(() => {
    const r = db.prepare("SELECT COUNT(*) AS c, COALESCE(SUM(COALESCE(hamyon_amount, amount)), 0) AS s FROM payments WHERE status = 'success' AND paid_at >= ?").get(from) as { c: number; s: number };
    return [r.c, r.s];
  }, [0, 0]);
  // Faol obunalar: o'quvchi bo'yicha treklar → tarif (planOf bilan bir xil qoida)
  const subs = { paid: 0, gift: 0, general: 0, exam: 0, all: 0, premium: 0 };
  for (const r of safe(() => db.prepare(`SELECT s.player_id AS p, GROUP_CONCAT(s.track) AS t,
      EXISTS (SELECT 1 FROM payments y WHERE y.player_id = s.player_id AND y.status = 'success') AS paid
      FROM subscriptions s WHERE s.until > ? GROUP BY s.player_id`).all(now) as { p: number; t: string; paid: number }[], [])) {
    const t = new Set(String(r.t).split(','));
    const plan = t.has('voice') && t.has('exam') && t.has('grammar') ? 'premium' : t.has('exam') && t.has('grammar') ? 'all' : t.has('exam') ? 'exam' : t.has('grammar') ? 'general' : null;
    if (!plan) continue;
    subs[plan]++;
    if (r.paid) subs.paid++; else subs.gift++;
  }
  const today = tzDay(now);
  return {
    players: {
      total: n('SELECT COUNT(*) AS n FROM players'), telegram: n('SELECT COUNT(*) AS n FROM players WHERE tg_id IS NOT NULL'),
      today: n('SELECT COUNT(*) AS n FROM players WHERE created_at >= ?', d0), week: n('SELECT COUNT(*) AS n FROM players WHERE created_at >= ?', d7), month: n('SELECT COUNT(*) AS n FROM players WHERE created_at >= ?', d30),
    },
    active: {
      today: n('SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE accepted > 0 AND ts >= ?', d0),
      week: n('SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE accepted > 0 AND ts >= ?', d7),
      month: n('SELECT COUNT(DISTINCT player_id) AS n FROM xp_events WHERE accepted > 0 AND ts >= ?', d30),
    },
    subs,
    pay: { today: pay(d0), week: pay(d7), month: pay(d30), total: pay(0) },
    phones: n('SELECT COUNT(*) AS n FROM tg_phones'),
    voiceToday: {
      minutes: n('SELECT COALESCE(SUM(seconds), 0) / 60.0 AS n FROM live_usage WHERE day = ?', today),
      freeMinutes: n('SELECT COALESCE(SUM(seconds), 0) / 60.0 AS n FROM live_free_usage WHERE day = ?', today),
      people: n('SELECT COUNT(*) AS n FROM live_usage WHERE day = ? AND seconds > 0', today),
    },
    ai: { today: n('SELECT COALESCE(SUM(cost_usd), 0) AS n FROM ai_cost_events WHERE ts >= ?', d0), month: n('SELECT COALESCE(SUM(cost_usd), 0) AS n FROM ai_cost_events WHERE ts >= ?', d30) },
  };
}

/** /stat xabari. channelMembers — Telegram kanal a'zolari soni (olinmasa — null, qator ko'rsatilmaydi). */
export function statText(s: StatNumbers, now = Date.now(), channelMembers: number | null = null, channel = ''): string {
  const p = ([c, sum]: [number, number]) => `${num(c)} ta — ${num(sum)} so‘m`;
  const time = new Date(now + TZ_OFFSET_MS).toISOString().slice(11, 16);
  return [
    `📊 Sellzen statistikasi — ${tzDay(now)}, ${time} (Toshkent)`,
    '',
    `👥 O‘quvchilar: ${num(s.players.total)} (Telegram orqali ${num(s.players.telegram)})`,
    `   Yangi: bugun +${num(s.players.today)} · 7 kun +${num(s.players.week)} · 30 kun +${num(s.players.month)}`,
    `🔥 Faol (dars/test qilgan): bugun ${num(s.active.today)} · 7 kun ${num(s.active.week)} · 30 kun ${num(s.active.month)}`,
    '',
    `💳 Faol obunachilar: ${num(s.subs.paid + s.subs.gift)} (to‘lagan ${num(s.subs.paid)}, sovg‘a/bonus ${num(s.subs.gift)})`,
    `   General ${num(s.subs.general)} · Exam ${num(s.subs.exam)} · All Access ${num(s.subs.all)} · Premium ${num(s.subs.premium)}`,
    '',
    '💰 To‘lovlar:',
    `   Bugun: ${p(s.pay.today)}`,
    `   7 kun: ${p(s.pay.week)}`,
    `   30 kun: ${p(s.pay.month)}`,
    `   Jami: ${p(s.pay.total)}`,
    '',
    `📱 Botda raqam qoldirganlar: ${num(s.phones)}`,
    ...(channelMembers !== null ? [`📢 Kanal (${channel}) a‘zolari: ${num(channelMembers)}`] : []),
    `🎙 Ovozli suhbat bugun: ${num(s.voiceToday.minutes)} daqiqa (bepul ${num(s.voiceToday.freeMinutes)}), ${num(s.voiceToday.people)} kishi`,
    `🤖 AI xarajati: bugun ${usd(s.ai.today)} · 30 kun ${usd(s.ai.month)}`,
  ].join('\n');
}
