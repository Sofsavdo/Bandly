import assert from 'node:assert/strict';
import { ApiError, createDb, join, requireRole, setRole } from './db';
import { archive, createLesson, createUnit, publish, publishedUnits, reorder, restore, saveLesson, seedContent, studioTree } from './content';
import { UNITS } from '../src/content/lessons';

const db = createDb();
// Rollar
const m = join(db, 'Metodist'), u = join(db, 'Oddiy');
assert.throws(() => requireRole(db, m.token, ['methodologist']), (e: ApiError) => e.status === 403, 'rolsiz kirish yo‘q');
setRole(db, 'Metodist', 'methodologist');
assert.equal(requireRole(db, m.token, ['methodologist']).role, 'methodologist');
assert.throws(() => requireRole(db, u.token, ['methodologist']), (e: ApiError) => e.status === 403);
assert.throws(() => setRole(db, 'Oddiy', 'boss' as never), (e: ApiError) => e.status === 400);
{ const { roleOf, byToken } = await import('./db'); assert.equal(roleOf(db, byToken(db, u.token).id, { ADMIN_NICKNAMES: ' oddiy , boshqa' }), 'admin', 'ADMIN_NICKNAMES (katta-kichik harf farqsiz)'); assert.equal(roleOf(db, byToken(db, u.token).id, {}), null); }

// Statik darslar bazaga bir marta yoziladi, qayta ishga tushganda takrorlanmaydi
const total = UNITS.length + UNITS.reduce((s, x) => s + x.lessons.length, 0);
assert.equal(seedContent(db), total);
assert.equal(seedContent(db), 0, 'qayta seed hech narsa qo‘shmaydi');
const pub = publishedUnits(db);
assert.deepEqual(pub.map((x) => x.id), UNITS.map((x) => x.id), 'e’lon qilingan tartib statik tartib bilan bir xil');
assert.deepEqual(pub[0]!.lessons[0], UNITS[0]!.lessons[0], 'dars mazmuni o‘zgarmagan');
// Statik kontent yangilansa (yangi bo'lim o'rtaga qo'shilsa, dars matni o'zgarsa) — metodist tegmagan qatorlar unga moslanadi
{
  const d2 = createDb();
  const old = UNITS.filter((x) => x.id !== 'a1-u2');
  seedContent(d2, old);
  const changed = UNITS.map((x) => (x.id === 'a1-u1' ? { ...x, lessons: x.lessons.map((l, i) => (i === 0 ? { ...l, titleUz: 'Yangilangan' } : l)) } : x));
  assert.equal(seedContent(d2, changed), 1 + UNITS.find((x) => x.id === 'a1-u2')!.lessons.length, 'faqat yangi bo‘lim qo‘shildi');
  const p2 = publishedUnits(d2);
  assert.deepEqual(p2.map((x) => x.id), UNITS.map((x) => x.id), 'yangi bo‘lim o‘z joyiga tushdi');
  assert.equal(p2[0]!.lessons[0]!.titleUz, 'Yangilangan', 'tegilmagan dars statikdan yangilandi');
}

// Tahrirlash: qoralama o'quvchilarga ko'rinmaydi, e'lon qilingach ko'rinadi
const L = UNITS[0]!.lessons[0]!;
const edited = { ...L, titleUz: 'Tahrirlangan nom' };
assert.deepEqual(saveLesson(db, L.id, edited, 'Metodist').errors, []);
assert.equal(publishedUnits(db)[0]!.lessons[0]!.titleUz, L.titleUz, 'qoralama hali ko‘rinmaydi');
assert.ok(studioTree(db)[0]!.lessons[0]!.dirty);
publish(db, L.id, 'Metodist');
seedContent(db); assert.equal(publishedUnits(db)[0]!.lessons[0]!.titleUz, 'Tahrirlangan nom', 'metodist tahriri seed bilan ustidan yozilmaydi');
assert.equal(publishedUnits(db)[0]!.lessons[0]!.titleUz, 'Tahrirlangan nom');
// Xatosi bor darsni e'lon qilib bo'lmaydi
const broken = { ...L, check: [] };
assert.ok(saveLesson(db, L.id, broken, 'Metodist').errors.length > 0);
assert.throws(() => publish(db, L.id, 'Metodist'), (e: ApiError) => e.status === 422);
saveLesson(db, L.id, edited, 'Metodist');
// Tartib, arxiv, tiklash
const unit0 = UNITS[0]!;
const ids = unit0.lessons.map((x) => x.id).reverse();
reorder(db, ids, 'Metodist');
assert.deepEqual(publishedUnits(db)[0]!.lessons.map((x) => x.id), ids);
assert.throws(() => reorder(db, [unit0.lessons[0]!.id, UNITS[1]!.lessons[0]!.id], 'Metodist'), (e: ApiError) => e.status === 400, 'boshqa bo‘lim darsi bilan aralashtirib bo‘lmaydi');
archive(db, ids[0]!, 'Metodist');
assert.ok(!publishedUnits(db)[0]!.lessons.some((x) => x.id === ids[0]), 'arxivlangan dars yashirin');
restore(db, ids[0]!, 'Metodist');
assert.ok(publishedUnits(db)[0]!.lessons.some((x) => x.id === ids[0]));
// Yangi bo'lim va dars: e'lon qilinmaguncha ko'rinmaydi; bo'sh bo'lim o'quvchiga chiqmaydi
const nu = createUnit(db, 'B1', { titleUz: 'Sayohat' }, 'Metodist');
const nl = createLesson(db, nu.id, undefined, 'Metodist');
assert.ok(nl.errors.length > 0, 'bo‘sh dars validatsiyadan o‘tmaydi');
saveLesson(db, nl.id, { ...UNITS[6]!.lessons[0]!, titleUz: 'Aeroportda' }, 'Metodist');
publish(db, nu.id, 'Metodist'); publish(db, nl.id, 'Metodist');
const b1 = publishedUnits(db).filter((x) => x.level === 'B1');
assert.equal(b1[b1.length - 1]!.id, nu.id, 'yangi bo‘lim darajasi oxiriga qo‘shiladi');
assert.equal(b1[b1.length - 1]!.lessons[0]!.id, nl.id, 'dars id si serverniki');
assert.throws(() => createUnit(db, 'Z9', { titleUz: 'x' }, 'Metodist'), (e: ApiError) => e.status === 400);
// Ovozlashtirish: faqat ovozi yo'q misollar, chegara tekshiriladi, qoralamaga yoziladi
{
  const { voiceLesson } = await import('./content');
  const lid = UNITS[1]!.lessons[0]!.id;
  const calls: string[] = [];
  const r1 = await voiceLesson(db, lid, 'Metodist', async (t) => { calls.push(t); return `/media/${calls.length}.mp3`; }, 10_000);
  assert.equal(r1.voiced, UNITS[1]!.lessons[0]!.examples.length);
  assert.equal((await voiceLesson(db, lid, 'Metodist', async () => 'x', 10_000)).voiced, 0, 'qayta ovozlashtirilmaydi');
  const draft = studioTree(db).flatMap((u) => u.lessons).find((x) => x.id === lid)!;
  assert.ok(draft.data.examples.every((e) => e.audio?.startsWith('/media/')) && draft.dirty, 'qoralamaga yozildi');
  const lid2 = UNITS[2]!.lessons[0]!.id;
  await assert.rejects(voiceLesson(db, lid2, 'Metodist', async () => 'x', 5), (e: ApiError) => e.status === 429, 'chegara');
}
console.log('content.test: OK');
