// Haftalik liga natijasi (Telegram): yangi hafta boshlangach, o'tgan haftada ligada qatnashganlarga bitta xabar —
// ko'tarildi / tushdi / qoldi va o'rni. Seriya eslatmalari bilan bir xil sozlama (TG_REMINDERS=1, /stop bilan o'chadi).
import type { DatabaseSync } from 'node:sqlite';
import { weekStart } from './db';
import { TIERS, settle, standings } from './league';

export function ensureLeagueNotifyColumn(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('league_notified')) db.exec('ALTER TABLE players ADD COLUMN league_notified INTEGER NOT NULL DEFAULT 0');
}

export interface LeagueResult { playerId: number; tgId: number; lang: string | null; rank: number; n: number; before: number; after: number }

/** O'tgan hafta natijalari (xabar yuborilmaganlar uchun); har biri uchun liga darajasi ham shu yerda yakunlanadi. */
export function pendingLeagueResults(db: DatabaseSync, now = Date.now(), limit = 300): LeagueResult[] {
  const last = weekStart(now) - 7 * 86_400_000;
  const rows = db.prepare(`SELECT m.player_id AS pid, m.group_id AS gid, m.tier, p.tg_id AS tg, p.lang FROM league_members m JOIN players p ON p.id = m.player_id
    WHERE m.week = ? AND p.tg_id IS NOT NULL AND p.remind = 1 AND p.league_notified < ? LIMIT ?`).all(last, last, limit) as { pid: number; gid: number; tier: number; tg: number; lang: string | null }[];
  return rows.map((r) => {
    const st = standings(db, r.gid, last);
    const i = st.findIndex((x) => x.player_id === r.pid);
    settle(db, r.pid, now);
    const after = (db.prepare('SELECT league_tier FROM players WHERE id = ?').get(r.pid) as { league_tier: number }).league_tier;
    return { playerId: r.pid, tgId: r.tg, lang: r.lang, rank: i + 1, n: st.length, before: r.tier, after };
  });
}

export function leagueMessage(r: LeagueResult, appUrl: string, tr: (s: string) => string = (s) => s): Record<string, unknown> {
  const fill = (s: string, ...v: (string | number)[]) => v.reduce<string>((acc, x, i) => acc.replace(`{${i}}`, String(x)), s);
  const tierName = (t: number) => tr(TIERS[t] ?? TIERS[0]);
  const text = r.after > r.before ? `🏆 ${fill(tr('Tabriklaymiz! O‘tgan haftada {0}-o‘rin — {1} ligasiga ko‘tarildingiz.'), r.rank, tierName(r.after))}`
    : r.after < r.before ? `📉 ${fill(tr('O‘tgan haftada {0}-o‘rin — {1} ligasiga tushdingiz. Bu hafta qaytib chiqing!'), r.rank, tierName(r.after))}`
    : `🏅 ${fill(tr('O‘tgan haftada {0}-o‘rin ({1} ligasi). Yangi hafta boshlandi!'), r.rank, tierName(r.after))}`;
  return { chat_id: r.tgId, text: `${text}\n\n${tr('Eslatmalarni o‘chirish: /stop')}`, reply_markup: { inline_keyboard: [[{ text: `🏆 ${tr('Reyting')}`, web_app: { url: appUrl } }]] } };
}

export async function runLeagueNotices(db: DatabaseSync, send: (b: Record<string, unknown>) => Promise<void>, appUrl: string, now = Date.now(), tr: (lang: string | null, s: string) => string = (_l, s) => s): Promise<number> {
  const last = weekStart(now) - 7 * 86_400_000;
  let n = 0;
  for (const r of pendingLeagueResults(db, now)) {
    db.prepare('UPDATE players SET league_notified = ?, last_bot_msg = ? WHERE id = ?').run(last, now, r.playerId);
    try { await send(leagueMessage(r, appUrl, (s) => tr(r.lang, s))); n++; }
    catch (e) { if (/403|blocked|deactivated|chat not found/i.test((e as Error).message)) db.prepare('UPDATE players SET remind = 0 WHERE id = ?').run(r.playerId); }
    await new Promise((res) => setTimeout(res, 40));
  }
  return n;
}
