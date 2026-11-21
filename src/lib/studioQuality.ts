// Metodist kabineti: kontent sifati hisoboti (sof funksiya). Har daraja bo'yicha — darslar, e'lon qilinganlar, e'lon qilinmagan
// o'zgarishlar, tekshiruv xatolari, izohi juda qisqa mashqlar va mediasiz darslar; muammoli darslar ro'yxati (tahrirlash uchun).
import type { Lesson } from '../content/lessons/types';
import { L } from '../i18n';

export type QStatus = 'draft' | 'published' | 'archived';
export interface QLesson { id: string; status: QStatus; dirty: boolean; errors: string[]; data: Lesson }
export interface QUnit { id: string; level: string; lessons: QLesson[] }
export interface LevelRow { level: string; units: number; lessons: number; published: number; drafts: number; dirty: number; withErrors: number; weakExplain: number; noMedia: number; items: number; minutes: number }
export interface Issue { id: string; level: string; unitId: string; title: string; problems: string[]; severity: 0 | 1 | 2 }

/** Izoh shu belgidan qisqa bo'lsa — o'quvchiga "nega" tushuntirilmagan deb hisoblanadi. */
export const MIN_EXPLAIN = 20;

export function qualityReport(units: QUnit[], levels: readonly string[]): { rows: LevelRow[]; issues: Issue[] } {
  const issues: Issue[] = [];
  const rows = levels.map((level) => {
    const us = units.filter((u) => u.level === level);
    const row: LevelRow = { level, units: us.length, lessons: 0, published: 0, drafts: 0, dirty: 0, withErrors: 0, weakExplain: 0, noMedia: 0, items: 0, minutes: 0 };
    for (const u of us) for (const l of u.lessons) {
      if (l.status === 'archived') continue;
      row.lessons++;
      if (l.status === 'published') row.published++; else row.drafts++;
      if (l.dirty) row.dirty++;
      const items = [...(l.data.practice ?? []), ...(l.data.check ?? [])];
      row.items += items.length; row.minutes += l.data.minutes ?? 0;
      const weak = items.filter((it) => (it.explainUz ?? '').trim().length < MIN_EXPLAIN).length;
      const problems: string[] = [];
      if (l.errors.length) { row.withErrors++; problems.push(...l.errors.slice(0, 3)); }
      if (weak) { row.weakExplain++; problems.push(L('{0} ta mashqda izoh juda qisqa (< {1} belgi)', [weak, MIN_EXPLAIN])); }
      if (!l.data.media?.length) row.noMedia++;
      if (l.status === 'draft') problems.push(L('e’lon qilinmagan (qoralama)'));
      if (problems.length) issues.push({ id: l.id, level, unitId: u.id, title: l.data.titleUz, problems, severity: l.errors.length ? 0 : weak ? 1 : 2 });
    }
    return row;
  });
  // Avval xatoli, keyin izohi qisqa, keyin qoralamalar
  issues.sort((a, b) => a.severity - b.severity);
  return { rows, issues };
}
