import assert from 'node:assert/strict';
import { qualityReport, type QLesson } from './studioQuality';

const base = { titleUz: 'Dars', minutes: 10, practice: [{ kind: 'gap', prompt: 'I ___', accept: ['go'], explainUz: 'Hozirgi zamon: I bilan fe’l o‘zgarmaydi.' }], check: [{ kind: 'gap', prompt: 'He ___', accept: ['goes'], explainUz: 'ok' }] } as never;
const L = (id: string, o: Partial<QLesson> = {}): QLesson => ({ id, status: 'published', dirty: false, errors: [], data: base, ...o });
const r = qualityReport([
  { id: 'a1-u1', level: 'A1', lessons: [L('a'), L('b', { status: 'draft' }), L('c', { errors: ['c: no taxonomy ids'], dirty: true }), L('d', { status: 'archived' })] },
  { id: 'b1-u1', level: 'B1', lessons: [] },
], ['A1', 'B1']);
const a1 = r.rows[0]!;
assert.deepEqual({ lessons: a1.lessons, published: a1.published, drafts: a1.drafts, dirty: a1.dirty, withErrors: a1.withErrors, items: a1.items, minutes: a1.minutes }, { lessons: 3, published: 2, drafts: 1, dirty: 1, withErrors: 1, items: 6, minutes: 30 }, 'arxivdagi dars hisoblanmaydi');
assert.equal(a1.weakExplain, 3, 'qisqa izoh ("ok") har darsda');
assert.equal(a1.noMedia, 3);
assert.equal(r.rows[1]!.lessons, 0);
assert.equal(r.issues[0]!.id, 'c', 'xatoli dars birinchi');
assert.ok(r.issues.find((i) => i.id === 'b')!.problems.some((p) => /qoralama/.test(p)));
console.log('studioQuality: OK');
