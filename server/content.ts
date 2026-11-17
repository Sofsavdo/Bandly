// Darslar kontenti bazada (metodist kabineti uchun). Statik darslar (src/content/lessons) birinchi ishga tushganda
// bazaga "e'lon qilingan" holda yoziladi; keyin bazadagi versiya asosiy bo'ladi (metodist tahrirlari ustun).
// Kodga yangi statik dars qo'shilsa, bazada yo'q bo'lsa qo'shiladi — mavjudlarini hech qachon ustidan yozmaydi.
import type { DatabaseSync } from 'node:sqlite';
import { randomBytes } from 'node:crypto';
import { UNITS as STATIC_UNITS } from '../src/content/lessons';
import type { Lesson, Unit } from '../src/content/lessons/types';
import { validateLesson } from '../src/lib/lessons';
import { ApiError } from './db';

export type Status = 'draft' | 'published' | 'archived';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
type UnitMeta = Omit<Unit, 'lessons'>;
interface Row { kind: 'unit' | 'lesson'; id: string; parent: string | null; level: string; position: number; status: Status; data: string; published: string | null; updated_at: number; updated_by: string | null }

export function ensureContentTables(db: DatabaseSync): void {
  db.exec(`CREATE TABLE IF NOT EXISTS content (
    kind TEXT NOT NULL, id TEXT PRIMARY KEY, parent TEXT, level TEXT NOT NULL, position INTEGER NOT NULL,
    status TEXT NOT NULL, data TEXT NOT NULL, published TEXT, updated_at INTEGER NOT NULL, updated_by TEXT)`);
  db.exec('CREATE TABLE IF NOT EXISTS content_versions (vid INTEGER PRIMARY KEY AUTOINCREMENT, id TEXT NOT NULL, data TEXT NOT NULL, action TEXT NOT NULL, by TEXT, at INTEGER NOT NULL)');
  db.exec('CREATE INDEX IF NOT EXISTS content_versions_id ON content_versions (id, at)');
}

const unitMeta = (u: Unit): UnitMeta => { const { lessons: _l, ...m } = u; return m; };

/** Statik kontentdan bazada yo'q bo'lganlarini qo'shadi (e'lon qilingan holda). */
export function seedContent(db: DatabaseSync, units: Unit[] = STATIC_UNITS, now = Date.now()): number {
  ensureContentTables(db);
  const has = db.prepare('SELECT 1 FROM content WHERE id = ?');
  const ins = db.prepare('INSERT INTO content (kind, id, parent, level, position, status, data, published, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  let n = 0;
  units.forEach((u, ui) => {
    if (!has.get(u.id)) { const d = JSON.stringify(unitMeta(u)); ins.run('unit', u.id, null, u.level, (ui + 1) * 10, 'published', d, d, now, 'seed'); n++; }
    u.lessons.forEach((l, li) => {
      if (!has.get(l.id)) { const d = JSON.stringify(l); ins.run('lesson', l.id, u.id, u.level, (li + 1) * 10, 'published', d, d, now, 'seed'); n++; }
    });
  });
  return n;
}

const rows = (db: DatabaseSync): Row[] => db.prepare('SELECT * FROM content').all() as unknown as Row[];
const lvl = (l: string) => LEVELS.indexOf(l as (typeof LEVELS)[number]);
const byOrder = (a: Row, b: Row) => lvl(a.level) - lvl(b.level) || a.position - b.position || a.id.localeCompare(b.id);

/** O'quvchilar uchun: faqat e'lon qilingan, arxivlanmagan bo'limlar va darslar (tartib bilan). */
export function publishedUnits(db: DatabaseSync): Unit[] {
  const all = rows(db).filter((r) => r.status !== 'archived' && r.published);
  const units = all.filter((r) => r.kind === 'unit').sort(byOrder);
  return units.map((u) => ({
    ...(JSON.parse(u.published!) as UnitMeta),
    lessons: all.filter((r) => r.kind === 'lesson' && r.parent === u.id).sort(byOrder).map((r) => JSON.parse(r.published!) as Lesson),
  })).filter((u) => u.lessons.length > 0);
}
/** Kontent versiyasi (mijoz keshi uchun). */
export const contentVersion = (db: DatabaseSync): number => (db.prepare("SELECT COALESCE(MAX(updated_at),0) AS v FROM content WHERE published IS NOT NULL").get() as { v: number }).v;

// ---------------- Metodist kabineti ----------------
export interface TreeLesson { id: string; position: number; status: Status; dirty: boolean; title: string; errors: string[]; data: Lesson }
export interface TreeUnit { id: string; level: string; position: number; status: Status; dirty: boolean; data: UnitMeta; lessons: TreeLesson[] }
export function studioTree(db: DatabaseSync): TreeUnit[] {
  const all = rows(db);
  return all.filter((r) => r.kind === 'unit').sort(byOrder).map((u) => ({
    id: u.id, level: u.level, position: u.position, status: u.status, dirty: u.data !== u.published, data: JSON.parse(u.data) as UnitMeta,
    lessons: all.filter((r) => r.kind === 'lesson' && r.parent === u.id).sort(byOrder).map((r) => {
      const data = JSON.parse(r.data) as Lesson;
      return { id: r.id, position: r.position, status: r.status, dirty: r.data !== r.published, title: data.titleUz, errors: validateLesson(data), data };
    }),
  }));
}

const get = (db: DatabaseSync, id: string): Row => {
  const r = db.prepare('SELECT * FROM content WHERE id = ?').get(id) as Row | undefined;
  if (!r) throw new ApiError(404, 'Topilmadi');
  return r;
};
const version = (db: DatabaseSync, id: string, data: string, action: string, by: string, now: number) =>
  db.prepare('INSERT INTO content_versions (id, data, action, by, at) VALUES (?, ?, ?, ?, ?)').run(id, data, action, by, now);

function cleanLesson(id: string, raw: unknown): Lesson {
  if (!raw || typeof raw !== 'object') throw new ApiError(400, 'Dars ma’lumoti noto‘g‘ri');
  const l = { ...(raw as Lesson), id };
  if (typeof l.titleUz !== 'string' || !l.titleUz.trim()) throw new ApiError(400, 'Dars nomi (titleUz) kerak');
  for (const k of ['explanationUz', 'examples', 'practice', 'check', 'taxonomyIds'] as const) if (!Array.isArray(l[k])) (l as unknown as Record<string, unknown>)[k] = [];
  if (JSON.stringify(l).length > 200_000) throw new ApiError(413, 'Dars juda katta');
  return l;
}

/** Darsni saqlaydi (qoralama). O'quvchilar uni faqat "e'lon qilish"dan keyin ko'radi. */
export function saveLesson(db: DatabaseSync, id: string, data: unknown, by: string, now = Date.now()): { errors: string[] } {
  const r = get(db, id);
  if (r.kind !== 'lesson') throw new ApiError(400, 'Bu dars emas');
  const l = cleanLesson(id, data);
  const json = JSON.stringify(l);
  db.prepare("UPDATE content SET data = ?, updated_at = ?, updated_by = ?, status = CASE WHEN status = 'archived' THEN 'draft' ELSE status END WHERE id = ?").run(json, now, by, id);
  version(db, id, json, 'save', by, now);
  return { errors: validateLesson(l) };
}

export function createLesson(db: DatabaseSync, unitId: string, data: unknown, by: string, now = Date.now()): { id: string; errors: string[] } {
  const u = get(db, unitId);
  if (u.kind !== 'unit') throw new ApiError(400, 'Bo‘lim topilmadi');
  const id = `${unitId}-m${randomBytes(3).toString('hex')}`;
  const l = cleanLesson(id, data ?? { titleUz: 'Yangi dars', title: 'New lesson', objectiveUz: '', objective: '', taxonomyIds: [], minutes: 15, explanationUz: [], examples: [], practice: [], check: [] });
  const pos = ((db.prepare('SELECT COALESCE(MAX(position),0) AS p FROM content WHERE parent = ?').get(unitId) as { p: number }).p) + 10;
  const json = JSON.stringify(l);
  db.prepare('INSERT INTO content (kind, id, parent, level, position, status, data, published, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)').run('lesson', id, unitId, u.level, pos, 'draft', json, now, by);
  version(db, id, json, 'create', by, now);
  return { id, errors: validateLesson(l) };
}

export function createUnit(db: DatabaseSync, level: string, data: { titleUz?: string; title?: string; situationUz?: string }, by: string, now = Date.now()): { id: string } {
  if (lvl(level) < 0) throw new ApiError(400, 'Daraja A1–C2 bo‘lishi kerak');
  if (!data?.titleUz?.trim()) throw new ApiError(400, 'Bo‘lim nomi kerak');
  const id = `${level.toLowerCase()}-m${randomBytes(3).toString('hex')}`;
  const meta: UnitMeta = { id, level: level as Unit['level'], title: data.title?.trim() || data.titleUz.trim(), titleUz: data.titleUz.trim(), situationUz: data.situationUz?.trim() ?? '', status: 'pilot' };
  const pos = ((db.prepare("SELECT COALESCE(MAX(position),0) AS p FROM content WHERE kind = 'unit' AND level = ?").get(level) as { p: number }).p) + 10;
  const json = JSON.stringify(meta);
  db.prepare('INSERT INTO content (kind, id, parent, level, position, status, data, published, updated_at, updated_by) VALUES (?, ?, NULL, ?, ?, ?, ?, NULL, ?, ?)').run('unit', id, level, pos, 'draft', json, now, by);
  version(db, id, json, 'create', by, now);
  return { id };
}

export function saveUnit(db: DatabaseSync, id: string, data: { titleUz?: string; title?: string; situationUz?: string }, by: string, now = Date.now()): void {
  const r = get(db, id);
  if (r.kind !== 'unit') throw new ApiError(400, 'Bu bo‘lim emas');
  const cur = JSON.parse(r.data) as UnitMeta;
  const meta = { ...cur, titleUz: data.titleUz?.trim() || cur.titleUz, title: data.title?.trim() || cur.title, situationUz: data.situationUz?.trim() ?? cur.situationUz };
  const json = JSON.stringify(meta);
  db.prepare('UPDATE content SET data = ?, updated_at = ?, updated_by = ? WHERE id = ?').run(json, now, by, id);
  version(db, id, json, 'save', by, now);
}

/** E'lon qilish: xatosi bor dars e'lon qilinmaydi. Bo'lim e'lon qilinsa, uning darslari alohida e'lon qilinadi. */
export function publish(db: DatabaseSync, id: string, by: string, now = Date.now()): void {
  const r = get(db, id);
  if (r.kind === 'lesson') {
    const errs = validateLesson(JSON.parse(r.data) as Lesson);
    if (errs.length) throw new ApiError(422, `Darsda xatolar bor: ${errs.slice(0, 3).join('; ')}`);
  }
  db.prepare("UPDATE content SET published = data, status = 'published', updated_at = ?, updated_by = ? WHERE id = ?").run(now, by, id);
  version(db, id, r.data, 'publish', by, now);
}
/** Arxivlash (o'chirish): o'quvchilardan yashiriladi, lekin tarix va tiklash imkoni saqlanadi. */
export function archive(db: DatabaseSync, id: string, by: string, now = Date.now()): void {
  const r = get(db, id);
  db.prepare("UPDATE content SET status = 'archived', updated_at = ?, updated_by = ? WHERE id = ?").run(now, by, id);
  version(db, id, r.data, 'archive', by, now);
}
export function restore(db: DatabaseSync, id: string, by: string, now = Date.now()): void {
  const r = get(db, id);
  db.prepare('UPDATE content SET status = ?, updated_at = ?, updated_by = ? WHERE id = ?').run(r.published ? 'published' : 'draft', now, by, id);
  version(db, id, r.data, 'restore', by, now);
}
/** Tartibni o'zgartirish: berilgan ro'yxat tartibida pozitsiyalar (bir bo'lim ichidagi darslar yoki bir darajadagi bo'limlar). */
export function reorder(db: DatabaseSync, ids: string[], by: string, now = Date.now()): void {
  if (!Array.isArray(ids) || !ids.length || ids.length > 200) throw new ApiError(400, 'Ro‘yxat noto‘g‘ri');
  const rs = ids.map((id) => get(db, String(id)));
  const sameGroup = rs.every((r) => r.kind === rs[0]!.kind && r.parent === rs[0]!.parent && (r.kind === 'lesson' || r.level === rs[0]!.level));
  if (!sameGroup) throw new ApiError(400, 'Faqat bir guruh ichida tartiblash mumkin');
  const up = db.prepare('UPDATE content SET position = ?, updated_at = ?, updated_by = ? WHERE id = ?');
  rs.forEach((r, i) => up.run((i + 1) * 10, now, by, r.id));
  // E'lon qilingan versiya ham yangi tartibni ko'rsatadi (published ustuni o'zgarmaydi, tartib — position)
}
export const history = (db: DatabaseSync, id: string) => db.prepare('SELECT vid, action, by, at FROM content_versions WHERE id = ? ORDER BY vid DESC LIMIT 50').all(id);

// ---------------- Ovozlashtirish (ElevenLabs) ----------------
/** Darsdagi misollarni ovozlashtiradi: ovozi yo'qlarini yaratib, URL'ini qoralamaga yozadi (e'lon qilingach o'quvchiga chiqadi). */
export async function voiceLesson(db: DatabaseSync, id: string, by: string, synth: (text: string) => Promise<string>, maxChars: number, now = Date.now()): Promise<{ voiced: number; chars: number }> {
  const r = get(db, id);
  if (r.kind !== 'lesson') throw new ApiError(400, 'Bu dars emas');
  const l = JSON.parse(r.data) as Lesson;
  const todo = l.examples.filter((e) => !e.audio && e.en.trim());
  const chars = todo.reduce((s, e) => s + e.en.length, 0);
  if (!todo.length) return { voiced: 0, chars: 0 };
  if (chars > maxChars) throw new ApiError(429, `Bugungi ovozlashtirish chegarasi yetmaydi (${chars} belgi kerak, ${maxChars} qoldi)`);
  for (const e of todo) e.audio = await synth(e.en);
  const json = JSON.stringify(l);
  db.prepare('UPDATE content SET data = ?, updated_at = ?, updated_by = ? WHERE id = ?').run(json, now, by, id);
  version(db, id, json, 'voice', by, now);
  return { voiced: todo.length, chars };
}
