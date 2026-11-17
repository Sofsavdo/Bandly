// B2B: maktab va o'quv markazlari uchun guruhlar. O'qituvchi guruh ochadi, o'quvchilar kod bilan qo'shiladi,
// o'qituvchi har bir o'quvchining faolligini ko'radi (o'quvchi kod bilan o'zi qo'shilgani — rozilik). To'lov/litsenziya yo'q (egasi qarori).
import { randomBytes } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';

const DAY = 86_400_000;
export const MAX_GROUPS = 30, MAX_MEMBERS = 200;

export function ensureGroupTables(db: DatabaseSync): void {
  db.exec('CREATE TABLE IF NOT EXISTS groups (id INTEGER PRIMARY KEY AUTOINCREMENT, owner_id INTEGER NOT NULL REFERENCES players(id), name TEXT NOT NULL, code TEXT NOT NULL UNIQUE, created_at INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0)');
  db.exec('CREATE TABLE IF NOT EXISTS group_members (group_id INTEGER NOT NULL REFERENCES groups(id), player_id INTEGER NOT NULL REFERENCES players(id), joined_at INTEGER NOT NULL, PRIMARY KEY (group_id, player_id))');
}

const ALPH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const newCode = () => [...randomBytes(6)].map((b) => ALPH[b % ALPH.length]).join('');
export const isGroupCode = (s: unknown): s is string => typeof s === 'string' && /^[A-Z2-9]{6}$/.test(s.trim().toUpperCase());

export function createGroup(db: DatabaseSync, ownerId: number, name: string, now = Date.now()): { id: number; code: string } {
  const n = name.replace(/\s+/g, ' ').trim().slice(0, 60);
  if (n.length < 2) throw new ApiError(400, 'Guruh nomi juda qisqa');
  const count = (db.prepare('SELECT COUNT(*) AS n FROM groups WHERE owner_id = ? AND archived = 0').get(ownerId) as { n: number }).n;
  if (count >= MAX_GROUPS) throw new ApiError(400, 'Guruhlar soni chegarasiga yetdingiz');
  for (;;) {
    const code = newCode();
    try { const r = db.prepare('INSERT INTO groups (owner_id, name, code, created_at) VALUES (?, ?, ?, ?)').run(ownerId, n, code, now); return { id: Number(r.lastInsertRowid), code }; } catch { /* takror kod */ }
  }
}

export function joinGroup(db: DatabaseSync, playerId: number, code: string, now = Date.now()): { id: number; name: string } {
  const g = db.prepare('SELECT id, name, owner_id FROM groups WHERE code = ? AND archived = 0').get(code.trim().toUpperCase()) as { id: number; name: string; owner_id: number } | undefined;
  if (!g) throw new ApiError(404, 'Guruh topilmadi. Kodni tekshiring.');
  const size = (db.prepare('SELECT COUNT(*) AS n FROM group_members WHERE group_id = ?').get(g.id) as { n: number }).n;
  if (size >= MAX_MEMBERS) throw new ApiError(400, 'Guruh to‘lgan');
  db.prepare('INSERT OR IGNORE INTO group_members (group_id, player_id, joined_at) VALUES (?, ?, ?)').run(g.id, playerId, now);
  return { id: g.id, name: g.name };
}

export function leaveGroup(db: DatabaseSync, playerId: number, groupId: number): void {
  db.prepare('DELETE FROM group_members WHERE group_id = ? AND player_id = ?').run(groupId, playerId);
}

/** Guruh egasi (yoki admin) — aks holda 403. */
function ownGroup(db: DatabaseSync, groupId: number, ownerId: number, isAdmin: boolean): { id: number; name: string; code: string } {
  const g = db.prepare('SELECT id, name, code, owner_id FROM groups WHERE id = ? AND archived = 0').get(groupId) as { id: number; name: string; code: string; owner_id: number } | undefined;
  if (!g || (!isAdmin && g.owner_id !== ownerId)) throw new ApiError(404, 'Guruh topilmadi');
  return g;
}

export function removeMember(db: DatabaseSync, groupId: number, ownerId: number, isAdmin: boolean, playerId: number): void {
  ownGroup(db, groupId, ownerId, isAdmin);
  db.prepare('DELETE FROM group_members WHERE group_id = ? AND player_id = ?').run(groupId, playerId);
}
export function archiveGroup(db: DatabaseSync, groupId: number, ownerId: number, isAdmin: boolean): void {
  ownGroup(db, groupId, ownerId, isAdmin);
  db.prepare('UPDATE groups SET archived = 1 WHERE id = ?').run(groupId);
}

export function myGroups(db: DatabaseSync, ownerId: number): { id: number; name: string; code: string; members: number; active7: number }[] {
  return (db.prepare(`SELECT g.id, g.name, g.code, (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS members,
      (SELECT COUNT(DISTINCT e.player_id) FROM group_members m JOIN xp_events e ON e.player_id = m.player_id WHERE m.group_id = g.id AND e.accepted > 0 AND e.ts >= ?) AS active7
    FROM groups g WHERE g.owner_id = ? AND g.archived = 0 ORDER BY g.created_at DESC`).all(Date.now() - 7 * DAY, ownerId) as { id: number; name: string; code: string; members: number; active7: number }[]);
}

export function joinedGroups(db: DatabaseSync, playerId: number): { id: number; name: string; teacher: string }[] {
  return db.prepare('SELECT g.id, g.name, p.nickname AS teacher FROM group_members m JOIN groups g ON g.id = m.group_id JOIN players p ON p.id = g.owner_id WHERE m.player_id = ? AND g.archived = 0').all(playerId) as { id: number; name: string; teacher: string }[];
}

export interface MemberRow { id: number; nickname: string; level: string | null; streak: number; xp7: number; lessons: number; lessons7: number; lastMock: { title: string; correct: number; total: number; band: number | null } | null; lastActive: number | null }

/** O'qituvchi uchun: har bir o'quvchi — daraja, seriya, 7 kunlik XP, o'tilgan darslar, oxirgi mock, oxirgi faollik. */
export function groupReport(db: DatabaseSync, groupId: number, ownerId: number, isAdmin: boolean, now = Date.now()): { id: number; name: string; code: string; members: MemberRow[] } {
  const g = ownGroup(db, groupId, ownerId, isAdmin);
  const rows = db.prepare(`SELECT p.id, p.nickname, p.streak, pr.data,
      (SELECT COALESCE(SUM(accepted),0) FROM xp_events e WHERE e.player_id = p.id AND e.ts >= ?) AS xp7,
      (SELECT MAX(ts) FROM xp_events e WHERE e.player_id = p.id AND e.accepted > 0) AS last
    FROM group_members m JOIN players p ON p.id = m.player_id LEFT JOIN progress pr ON pr.player_id = p.id WHERE m.group_id = ? ORDER BY p.nickname`).all(now - 7 * DAY, g.id) as { id: number; nickname: string; streak: number; data: string | null; xp7: number; last: number | null }[];
  const members = rows.map((r): MemberRow => {
    let level: string | null = null, lessons = 0, lessons7 = 0, lastMock: MemberRow['lastMock'] = null;
    try {
      const d = r.data ? JSON.parse(r.data) as Record<string, string> : {};
      level = (JSON.parse(d['bandly.profile.v1'] ?? '{}') as { level?: string | null }).level ?? null;
      const lp = JSON.parse(d['bandly.lessons.v1'] ?? '{}') as Record<string, { passedAt: number | null }>;
      for (const v of Object.values(lp)) { if (v?.passedAt) { lessons++; if (v.passedAt >= now - 7 * DAY) lessons7++; } }
      const res = JSON.parse(d['bandly.results.v1'] ?? '[]') as { kind: string; title: string; correct: number; total: number; band?: number }[];
      const m = res.find((x) => x.kind === 'reading' || x.kind === 'listening');
      if (m) lastMock = { title: m.title, correct: m.correct, total: m.total, band: typeof m.band === 'number' ? m.band : null };
    } catch { /* buzilgan progress — bo'sh ko'rsatiladi */ }
    return { id: r.id, nickname: r.nickname, level, streak: r.streak, xp7: r.xp7, lessons, lessons7, lastMock, lastActive: r.last };
  });
  return { id: g.id, name: g.name, code: g.code, members };
}
