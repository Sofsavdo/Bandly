// Metodist kabinetida yaratilgan Reading/Listening testlari. Javob kalitlari faqat serverda; o'quvchiga javobsiz nusxa beriladi.
// Holatlar: draft → published (o'quvchilar ko'radi) → archived. Matn (manba) saqlanadi — keyin tahrirlash uchun.
import type { DatabaseSync } from 'node:sqlite';
import { parseTest, type AnyTest } from '../src/lib/testDsl';
import { stripTest } from '../src/content/mockShared';
import { ApiError } from './db';

export function ensureStudioTestsTable(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS studio_tests (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    source TEXT NOT NULL,
    data TEXT,
    published TEXT,
    updated_by TEXT,
    updated_at INTEGER NOT NULL
  )`);
}

export interface StudioTestRow { id: string; kind: string; status: string; title: string; level: string; questions: number; errors: { line: number; message: string }[]; dirty: boolean; updatedBy: string | null; updatedAt: number }

export function listStudioTests(db: DatabaseSync): (StudioTestRow & { source: string })[] {
  const rows = db.prepare('SELECT * FROM studio_tests ORDER BY updated_at DESC').all() as { id: string; kind: string; status: string; source: string; data: string | null; published: string | null; updated_by: string | null; updated_at: number }[];
  return rows.map((r) => {
    const { test, errors } = parseTest(r.source, r.id);
    return { id: r.id, kind: test?.kind ?? r.kind, status: r.status, title: test?.title ?? '—', level: test?.level ?? '—', questions: test?.questions.length ?? 0, errors, dirty: r.status === 'published' && r.data !== r.published, updatedBy: r.updated_by, updatedAt: r.updated_at, source: r.source };
  });
}

/** Saqlaydi (qoralama). Xatolar bo'lsa ham saqlanadi — e'lon qilish faqat xatosiz bo'lganda. */
export function saveStudioTest(db: DatabaseSync, id: string | null, source: string, by: string, now = Date.now()): { id: string; errors: { line: number; message: string }[] } {
  const src = String(source ?? '').slice(0, 60_000);
  const tid = id ?? `st-${now.toString(36)}`;
  if (!/^st-[a-z0-9]{4,20}$/.test(tid)) throw new ApiError(400, 'Test id noto‘g‘ri');
  const { test, errors } = parseTest(src, tid);
  const exists = db.prepare('SELECT status FROM studio_tests WHERE id = ?').get(tid) as { status: string } | undefined;
  if (id && !exists) throw new ApiError(404, 'Test topilmadi');
  const data = test && !errors.length ? JSON.stringify(test) : null;
  if (exists) db.prepare('UPDATE studio_tests SET source = ?, data = ?, kind = ?, updated_by = ?, updated_at = ? WHERE id = ?').run(src, data, test?.kind ?? 'reading', by, now, tid);
  else db.prepare('INSERT INTO studio_tests (id, kind, status, source, data, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(tid, test?.kind ?? 'reading', 'draft', src, data, by, now);
  return { id: tid, errors };
}

export function setStudioTestStatus(db: DatabaseSync, id: string, action: 'publish' | 'archive' | 'restore', by: string, now = Date.now()): void {
  const r = db.prepare('SELECT data, status FROM studio_tests WHERE id = ?').get(id) as { data: string | null; status: string } | undefined;
  if (!r) throw new ApiError(404, 'Test topilmadi');
  if (action === 'publish') {
    if (!r.data) throw new ApiError(400, 'Testda xatolar bor — avval tuzating');
    db.prepare('UPDATE studio_tests SET status = ?, published = data, updated_by = ?, updated_at = ? WHERE id = ?').run('published', by, now, id);
  } else db.prepare('UPDATE studio_tests SET status = ?, updated_by = ?, updated_at = ? WHERE id = ?').run(action === 'archive' ? 'archived' : 'draft', by, now, id);
}

/** E'lon qilingan testlar (javoblari bilan — faqat serverda baholash uchun). */
export function publishedStudioTests(db: DatabaseSync): AnyTest[] {
  const rows = db.prepare("SELECT published FROM studio_tests WHERE status = 'published' AND published IS NOT NULL").all() as { published: string }[];
  return rows.map((r) => JSON.parse(r.published) as AnyTest);
}

/** O'quvchiga: javobsiz nusxalar. */
export function publicStudioTests(db: DatabaseSync): { reading: unknown[]; listening: unknown[] } {
  const all = publishedStudioTests(db);
  const strip = (t: AnyTest) => { const { kind: _k, ...rest } = t; void _k; return stripTest(rest as never); };
  return { reading: all.filter((t) => t.kind === 'reading').map(strip), listening: all.filter((t) => t.kind === 'listening').map(strip) };
}
