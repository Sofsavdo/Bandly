// Bepul tarif kvotasi (serverda — hisobli o'quvchilar uchun; mehmonlar uchun ilova shu qoidalarni qurilmada qo'llaydi).
// Qoidalar src/lib/freeRules.ts da (server va ilova bir xil hisoblaydi). Chegaralar Railway o'zgaruvchilari bilan sozlanadi.
import type { DatabaseSync } from 'node:sqlite';
import { COURSE_TRACK, DEFAULT_LIMITS, applyUnlock, decide, emptyState, isCourse, nextReset, tashkentDay, validLessonId, weekKey, type Course, type FreeLimits, type FreeState } from '../src/lib/freeRules';
import { ApiError, byToken } from './db';

const num = (v: string | undefined, d: number) => { const n = Number(v); return Number.isFinite(n) && n >= 0 ? Math.floor(n) : d; };
export function freeLimitsFromEnv(env: NodeJS.ProcessEnv = process.env): FreeLimits {
  return {
    perDay: num(env.FREE_LESSONS_PER_DAY, DEFAULT_LIMITS.perDay),
    firstDay: num(env.FREE_FIRST_DAY_LESSONS, DEFAULT_LIMITS.firstDay),
    writingPerWeek: num(env.FREE_WRITING_PER_WEEK, DEFAULT_LIMITS.writingPerWeek),
    speakingPerWeek: num(env.FREE_SPEAKING_PER_WEEK, DEFAULT_LIMITS.speakingPerWeek),
  };
}

export function ensureFreeTables(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS free_unlocks (
    player_id INTEGER NOT NULL, lesson_id TEXT NOT NULL, course TEXT NOT NULL, day TEXT NOT NULL, at INTEGER NOT NULL,
    PRIMARY KEY (player_id, lesson_id)
  );
  CREATE TABLE IF NOT EXISTS free_walls (
    player_id INTEGER NOT NULL, day TEXT NOT NULL, course TEXT NOT NULL, at INTEGER NOT NULL,
    PRIMARY KEY (player_id, day, course)
  );`);
}

const hasTrack = (db: DatabaseSync, playerId: number, track: string, now: number): boolean =>
  !!db.prepare('SELECT 1 FROM subscriptions WHERE player_id = ? AND track = ? AND until > ? LIMIT 1').get(playerId, track, now);

function stateOf(db: DatabaseSync, playerId: number): FreeState {
  const rows = db.prepare('SELECT lesson_id, course, day FROM free_unlocks WHERE player_id = ? ORDER BY at').all(playerId) as { lesson_id: string; course: Course; day: string }[];
  const s = emptyState();
  for (const r of rows) { s.unlocked[r.lesson_id] = { course: r.course, day: r.day }; s.firstDay ??= r.day; }
  return s;
}

export interface FreeStatus { limits: FreeLimits; subscribed: { grammar: boolean; exam: boolean }; state: FreeState; today: string; resetAt: number }
export function freeStatus(db: DatabaseSync, token: string, limits: FreeLimits, now = Date.now()): FreeStatus {
  const p = byToken(db, token);
  return { limits, subscribed: { grammar: hasTrack(db, p.id, 'grammar', now), exam: hasTrack(db, p.id, 'exam', now) }, state: stateOf(db, p.id), today: tashkentDay(now), resetAt: nextReset(now) };
}

/** Yangi darsni ochish. Obunachi — har doim mumkin (kvota sarflanmaydi). Rad etilsa — "devor" qayd etiladi (konversiya tahlili uchun). */
export function unlockLesson(db: DatabaseSync, token: string, course: unknown, lessonId: unknown, limits: FreeLimits, now = Date.now()): { ok: boolean; left: number; resetAt: number; subscribed: boolean } {
  if (!isCourse(course) || !validLessonId(lessonId)) throw new ApiError(400, 'Noto‘g‘ri so‘rov');
  const p = byToken(db, token);
  const resetAt = nextReset(now);
  if (hasTrack(db, p.id, COURSE_TRACK[course], now)) return { ok: true, left: Number.POSITIVE_INFINITY, resetAt, subscribed: true };
  const today = tashkentDay(now);
  const s = stateOf(db, p.id);
  const d = decide(s, course, lessonId, today, limits);
  if (!d.ok) {
    db.prepare('INSERT OR IGNORE INTO free_walls (player_id, day, course, at) VALUES (?, ?, ?, ?)').run(p.id, today, course, now);
    return { ok: false, left: 0, resetAt, subscribed: false };
  }
  if (!d.already) { applyUnlock(s, course, lessonId, today); db.prepare('INSERT OR IGNORE INTO free_unlocks (player_id, lesson_id, course, day, at) VALUES (?, ?, ?, ?, ?)').run(p.id, lessonId, course, today, now); }
  return { ok: true, left: d.left, resetAt, subscribed: false };
}

/** Obunasiz o'quvchining haftalik bepul AI baholashi: kalit va chegara. */
export const freeAssessKey = (kind: 'writing' | 'speaking', now: number): string => `assess-free-${kind}:${weekKey(now)}`;
export const freeAssessLimit = (kind: 'writing' | 'speaking', limits: FreeLimits): number => (kind === 'writing' ? limits.writingPerWeek : limits.speakingPerWeek);

/** Admin uchun: devorga urilganlar va ulardan 7 kun ichida obuna olganlar (haqiqiy ma'lumot). */
export function wallStats(db: DatabaseSync, now = Date.now(), days = 30): { walled: number; converted: number; rate: number | null; today: number } {
  const since = now - days * 86_400_000;
  const firsts = db.prepare('SELECT player_id, MIN(at) AS at FROM free_walls WHERE at > ? GROUP BY player_id').all(since) as { player_id: number; at: number }[];
  const paid = db.prepare("SELECT 1 FROM payments WHERE player_id = ? AND status = 'success' AND paid_at BETWEEN ? AND ? LIMIT 1");
  const converted = firsts.filter((f) => paid.get(f.player_id, f.at, f.at + 7 * 86_400_000)).length;
  const today = (db.prepare('SELECT COUNT(*) AS n FROM free_walls WHERE day = ?').get(tashkentDay(now)) as { n: number }).n;
  return { walled: firsts.length, converted, rate: firsts.length ? Math.round((converted / firsts.length) * 1000) / 10 : null, today };
}
