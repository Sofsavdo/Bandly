// Mock testlar statistikasi: har bir test bo'yicha anonim natijalar (kim ekanligi saqlanmaydi — faqat test, ball, vaqt).
// O'quvchiga "boshqalar bilan solishtirish" faqat yetarli haqiqiy urinish yig'ilgandan keyin ko'rsatiladi (MIN_ATTEMPTS) — soxta raqam yo'q.
import type { DatabaseSync } from 'node:sqlite';

export const MIN_ATTEMPTS = 20;

export function ensureMockStatsTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS mock_stats (
    attempt_key TEXT PRIMARY KEY,
    test_id TEXT NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS mock_stats_test ON mock_stats(test_id);`);
}

/** Bir urinish bir marta sanaladi (qayta baholash so'rovlari takrorlamaydi). */
export function recordMockStat(db: DatabaseSync, testId: string, attemptId: string, correct: number, total: number, now = Date.now()): void {
  if (!/^[\w-]{3,40}$/.test(testId) || !/^[\w:.-]{6,60}$/.test(attemptId) || total <= 0 || correct < 0 || correct > total) return;
  db.prepare('INSERT OR IGNORE INTO mock_stats (attempt_key, test_id, correct, total, at) VALUES (?, ?, ?, ?, ?)').run(`${testId}:${attemptId}`, testId, correct, total, now);
}

export interface MockStats { count: number; avgPct?: number; percentile?: number }

/** Shu test bo'yicha statistika va berilgan natija boshqalarnikidan qanchasidan yuqori (percentile, teng natijalar yarmi bilan). */
export function mockStats(db: DatabaseSync, testId: string, correct: number): MockStats {
  const rows = db.prepare('SELECT correct, total FROM mock_stats WHERE test_id = ?').all(testId) as { correct: number; total: number }[];
  const count = rows.length;
  if (count < MIN_ATTEMPTS) return { count };
  const avgPct = Math.round((rows.reduce((s, r) => s + r.correct / r.total, 0) / count) * 100);
  const below = rows.filter((r) => r.correct < correct).length;
  const equal = rows.filter((r) => r.correct === correct).length;
  return { count, avgPct, percentile: Math.round(((below + equal / 2) / count) * 100) };
}
