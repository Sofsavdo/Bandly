// Haftalik ligalar (GAMIFIED_LEARNING_SPEC §3.6, G2): 5 daraja, har hafta 30 kishilik guruhlar, XP — server jurnalidan.
// Hafta oxirida (o'quvchi keyingi haftada birinchi XP olganda) natija hisoblanadi: yuqori 7 — ko'tariladi, quyi 5 — tushadi.
import type { DatabaseSync } from 'node:sqlite';
import { weekStart } from './db';

export const TIERS = ['Bronza', 'Kumush', 'Oltin', 'Zumrad', 'Olmos'] as const;
export const GROUP_SIZE = 30;
export const PROMOTE = 7;
export const DEMOTE = 5;
const WEEK = 7 * 86_400_000;

export function ensureLeagueTables(db: DatabaseSync): void {
  const cols = (db.prepare('PRAGMA table_info(players)').all() as { name: string }[]).map((c) => c.name);
  if (!cols.includes('league_tier')) db.exec('ALTER TABLE players ADD COLUMN league_tier INTEGER NOT NULL DEFAULT 0');
  db.exec('CREATE TABLE IF NOT EXISTS league_groups (id INTEGER PRIMARY KEY AUTOINCREMENT, week INTEGER NOT NULL, tier INTEGER NOT NULL, size INTEGER NOT NULL DEFAULT 0)');
  db.exec('CREATE INDEX IF NOT EXISTS league_groups_week ON league_groups (week, tier)');
  db.exec('CREATE TABLE IF NOT EXISTS league_members (week INTEGER NOT NULL, player_id INTEGER NOT NULL, group_id INTEGER NOT NULL, tier INTEGER NOT NULL, settled INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (week, player_id))');
}

const weeklyXp = (db: DatabaseSync, playerId: number, week: number): number =>
  (db.prepare('SELECT COALESCE(SUM(delta),0) AS s FROM xp_log WHERE player_id = ? AND ts >= ? AND ts < ?').get(playerId, week, week + WEEK) as { s: number }).s;

export function standings(db: DatabaseSync, groupId: number, week: number): { player_id: number; nickname: string; xp: number }[] {
  const rows = db.prepare('SELECT m.player_id, p.nickname FROM league_members m JOIN players p ON p.id = m.player_id WHERE m.group_id = ?').all(groupId) as { player_id: number; nickname: string }[];
  return rows.map((r) => ({ ...r, xp: weeklyXp(db, r.player_id, week) })).sort((a, b) => b.xp - a.xp || a.player_id - b.player_id);
}

/** O'tgan haftalarning hisoblanmagan natijalarini hisoblaydi (darajani ko'taradi/tushiradi). */
export function settle(db: DatabaseSync, playerId: number, now = Date.now()): void {
  const cur = weekStart(now);
  const open = db.prepare('SELECT week, group_id, tier FROM league_members WHERE player_id = ? AND settled = 0 AND week < ? ORDER BY week').all(playerId, cur) as { week: number; group_id: number; tier: number }[];
  for (const m of open) {
    const st = standings(db, m.group_id, m.week);
    const i = st.findIndex((r) => r.player_id === playerId);
    const n = st.length;
    let tier = m.tier;
    if (i >= 0 && i < PROMOTE && st[i]!.xp > 0 && n > PROMOTE) tier = Math.min(TIERS.length - 1, tier + 1);
    else if (i >= 0 && n > PROMOTE + DEMOTE && i >= n - DEMOTE) tier = Math.max(0, tier - 1);
    db.prepare('UPDATE players SET league_tier = ? WHERE id = ?').run(tier, playerId);
    db.prepare('UPDATE league_members SET settled = 1 WHERE week = ? AND player_id = ?').run(m.week, playerId);
  }
}

/** Shu hafta faol bo'lgan o'quvchini o'z darajasidagi bo'sh guruhga qo'shadi (bir marta). */
export function joinWeek(db: DatabaseSync, playerId: number, now = Date.now()): number {
  const week = weekStart(now);
  const have = db.prepare('SELECT group_id FROM league_members WHERE week = ? AND player_id = ?').get(week, playerId) as { group_id: number } | undefined;
  if (have) return have.group_id;
  settle(db, playerId, now);
  const tier = (db.prepare('SELECT league_tier FROM players WHERE id = ?').get(playerId) as { league_tier: number }).league_tier;
  let g = db.prepare('SELECT id FROM league_groups WHERE week = ? AND tier = ? AND size < ? ORDER BY id LIMIT 1').get(week, tier, GROUP_SIZE) as { id: number } | undefined;
  if (!g) g = { id: Number(db.prepare('INSERT INTO league_groups (week, tier, size) VALUES (?, ?, 0)').run(week, tier).lastInsertRowid) };
  db.prepare('INSERT INTO league_members (week, player_id, group_id, tier) VALUES (?, ?, ?, ?)').run(week, playerId, g.id, tier);
  db.prepare('UPDATE league_groups SET size = size + 1 WHERE id = ?').run(g.id);
  return g.id;
}

export interface LeagueView { tier: number; tierName: string; week: number; endsAt: number; joined: boolean; promote: number; demote: number; rows: { rank: number; nickname: string; xp: number; me: boolean; zone: 'up' | 'down' | null }[] }
export function leagueView(db: DatabaseSync, playerId: number, now = Date.now()): LeagueView {
  settle(db, playerId, now);
  const week = weekStart(now);
  const tier = (db.prepare('SELECT league_tier FROM players WHERE id = ?').get(playerId) as { league_tier: number }).league_tier;
  const m = db.prepare('SELECT group_id FROM league_members WHERE week = ? AND player_id = ?').get(week, playerId) as { group_id: number } | undefined;
  const base = { tier, tierName: TIERS[tier]!, week, endsAt: week + WEEK, promote: PROMOTE, demote: DEMOTE };
  if (!m) return { ...base, joined: false, rows: [] };
  const st = standings(db, m.group_id, week);
  const n = st.length;
  return { ...base, joined: true, rows: st.map((r, i) => ({ rank: i + 1, nickname: r.nickname, xp: r.xp, me: r.player_id === playerId,
    zone: i < PROMOTE && n > PROMOTE && tier < TIERS.length - 1 ? 'up' : n > PROMOTE + DEMOTE && i >= n - DEMOTE && tier > 0 ? 'down' : null })) };
}
