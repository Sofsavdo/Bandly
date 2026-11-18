// Band o'lchovi: "+1 band" da'vosini ma'lumot bilan asoslash uchun.
// Har o'quvchining to'liq imtihon (mock) natijalari va o'zi kiritgan rasmiy IELTS natijalari serverda saqlanadi.
// Birinchi mock — boshlang'ich (baseline). Statistika faqat haqiqiy yozuvlardan hisoblanadi, hech narsa taxmin qilinmaydi.
import type { DatabaseSync } from 'node:sqlite';
import { ApiError } from './db';

export type BandSource = 'mock' | 'official';
export interface BandRecord {
  id: number; at: number; source: BandSource;
  listening: number | null; reading: number | null; writing: number | null; speaking: number | null;
  overall: number; testDate: string | null;
}

export function ensureBandTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS band_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT, player_id INTEGER NOT NULL, at INTEGER NOT NULL, source TEXT NOT NULL,
    listening REAL, reading REAL, writing REAL, speaking REAL, overall REAL NOT NULL, test_date TEXT, client_key TEXT)`);
  db.exec('CREATE INDEX IF NOT EXISTS band_records_player ON band_records (player_id, at)');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS band_records_key ON band_records (player_id, client_key)');
}

/** 0..9, qadam 0.5; aks holda null. */
const band = (v: unknown): number | null => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  if (!Number.isFinite(n) || n < 0 || n > 9 || Math.round(n * 2) !== n * 2) return null;
  return n;
};
/** IELTS yaxlitlash: o'rtacha .25 → .5, .75 → butun. */
export const roundOverall = (xs: number[]): number => Math.floor((xs.reduce((a, b) => a + b, 0) / xs.length) * 2 + 0.5) / 2;

/** Yangi yozuv. Mock: kamida 2 ko'nikma (bir xil client_key — qayta yuborilsa yangilanadi). Rasmiy: 4 ko'nikma va sana shart. */
export function addBand(db: DatabaseSync, playerId: number, b: Record<string, unknown>, now = Date.now()): BandRecord {
  const source: BandSource = b.source === 'official' ? 'official' : 'mock';
  const skills = { listening: band(b.listening), reading: band(b.reading), writing: band(b.writing), speaking: band(b.speaking) };
  const present = Object.values(skills).filter((x): x is number => x !== null);
  let testDate: string | null = null;
  if (source === 'official') {
    if (present.length !== 4) throw new ApiError(400, 'Rasmiy natija uchun 4 ta ko‘nikma bali kerak (0–9, 0.5 qadam).');
    testDate = typeof b.testDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(b.testDate) ? b.testDate : null;
    if (!testDate || Date.parse(testDate) > now + 86_400_000) throw new ApiError(400, 'Imtihon sanasini to‘g‘ri kiriting.');
  } else if (present.length < 2) throw new ApiError(400, 'Mock natijasi uchun kamida 2 ta ko‘nikma kerak.');
  const overall = roundOverall(present);
  // Rasmiy natija: bir sanaga bitta (qayta kiritilsa yangilanadi)
  const key = source === 'official' ? `official-${testDate}` : typeof b.key === 'string' && b.key.length <= 60 ? b.key : null;
  const at = source === 'mock' && typeof b.at === 'number' && b.at > 0 && b.at <= now ? b.at : now;
  if (key) {
    const ex = db.prepare('SELECT id FROM band_records WHERE player_id = ? AND client_key = ?').get(playerId, key) as { id: number } | undefined;
    if (ex) {
      db.prepare('UPDATE band_records SET listening = ?, reading = ?, writing = ?, speaking = ?, overall = ? WHERE id = ?')
        .run(skills.listening, skills.reading, skills.writing, skills.speaking, overall, ex.id);
      return listBands(db, playerId).find((r) => r.id === ex.id)!;
    }
  }
  const r = db.prepare('INSERT INTO band_records (player_id, at, source, listening, reading, writing, speaking, overall, test_date, client_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(playerId, at, source, skills.listening, skills.reading, skills.writing, skills.speaking, overall, testDate, key);
  return { id: Number(r.lastInsertRowid), at, source, ...skills, overall, testDate };
}

export function listBands(db: DatabaseSync, playerId: number): BandRecord[] {
  return (db.prepare('SELECT id, at, source, listening, reading, writing, speaking, overall, test_date FROM band_records WHERE player_id = ? ORDER BY at, id').all(playerId) as unknown as
    { id: number; at: number; source: BandSource; listening: number | null; reading: number | null; writing: number | null; speaking: number | null; overall: number; test_date: string | null }[])
    .map((r) => ({ id: r.id, at: r.at, source: r.source, listening: r.listening, reading: r.reading, writing: r.writing, speaking: r.speaking, overall: r.overall, testDate: r.test_date }));
}

export function deleteBand(db: DatabaseSync, playerId: number, id: number): void {
  db.prepare('DELETE FROM band_records WHERE player_id = ? AND id = ?').run(playerId, id);
}

/** O'quvchi uchun xulosa: boshlang'ich, oxirgi, o'sish, keyingi mock qachon. */
export const RETEST_DAYS = 14;
export function summary(records: BandRecord[], now = Date.now()): { baseline: BandRecord | null; latest: BandRecord | null; gain: number | null; nextMockAt: number | null; official: BandRecord | null } {
  const mocks = records.filter((r) => r.source === 'mock');
  const baseline = mocks[0] ?? null;
  const latest = mocks.length > 1 ? mocks[mocks.length - 1]! : null;
  const official = [...records].reverse().find((r) => r.source === 'official') ?? null;
  const last = mocks[mocks.length - 1];
  return {
    baseline, latest, official,
    gain: baseline && latest ? latest.overall - baseline.overall : null,
    nextMockAt: last ? Math.max(now, last.at + RETEST_DAYS * 86_400_000) : now,
  };
}

/** Admin: haqiqiy natijalar asosida o'sish statistikasi. Faqat boshlang'ichdan kamida 14 kun keyin mock topshirganlar hisoblanadi. */
export interface BandStats {
  learners: number; withBaseline: number; measured: number;
  avgGain: number | null; medianGain: number | null; shareHalf: number | null; shareOne: number | null; avgDays: number | null;
  officials: number; officialVsBaseline: number | null;
}
export function bandStats(db: DatabaseSync): BandStats {
  const rows = db.prepare('SELECT player_id, at, source, overall FROM band_records ORDER BY player_id, at, id').all() as unknown as { player_id: number; at: number; source: BandSource; overall: number }[];
  const by = new Map<number, typeof rows>();
  for (const r of rows) by.set(r.player_id, [...(by.get(r.player_id) ?? []), r]);
  const gains: number[] = [], days: number[] = [], offDiff: number[] = [];
  let withBaseline = 0, officials = 0;
  for (const list of by.values()) {
    const mocks = list.filter((r) => r.source === 'mock');
    const base = mocks[0];
    if (base) withBaseline++;
    const later = base ? [...mocks].reverse().find((r) => r.at - base.at >= RETEST_DAYS * 86_400_000) : undefined;
    if (base && later) { gains.push(later.overall - base.overall); days.push((later.at - base.at) / 86_400_000); }
    const off = [...list].reverse().find((r) => r.source === 'official');
    if (off) { officials++; if (base && off.at > base.at) offDiff.push(off.overall - base.overall); }
  }
  const avg = (xs: number[]) => (xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null);
  const sorted = [...gains].sort((a, b) => a - b);
  const median = sorted.length ? (sorted.length % 2 ? sorted[(sorted.length - 1) / 2]! : (sorted[sorted.length / 2 - 1]! + sorted[sorted.length / 2]!) / 2) : null;
  const share = (t: number) => (gains.length ? Math.round((gains.filter((g) => g >= t).length / gains.length) * 100) : null);
  return {
    learners: by.size, withBaseline, measured: gains.length,
    avgGain: avg(gains), medianGain: median, shareHalf: share(0.5), shareOne: share(1), avgDays: avg(days) === null ? null : Math.round(avg(days)!),
    officials, officialVsBaseline: avg(offDiff),
  };
}
