import assert from 'node:assert/strict';
import { UNITS } from '../content/lessons';
import { BOSS_SIZE, bossAvailable, rng, selectBossItems, type BossRef } from './boss';
import type { ProgressMap } from './lessons';

const unitOf = (id: string) => UNITS.find((u) => u.lessons.some((l) => l.id === id))!;
const k = (x: BossRef) => `${x.lessonId}:${x.part}:${x.index}`;
const now = 1_700_000_000_000;
const passAll = (ids: string[], best = 1): ProgressMap => Object.fromEntries(ids.map((id) => [id, { attempts: 1, best, passedAt: now }]));
const sig = { openMistakes: {}, needsRevision: new Set<string>() };

// RNG deterministik
const a = rng('x'); const b = rng('x');
assert.deepEqual([a(), a(), a()], [b(), b(), b()]);

// Birinchi bo'lim: oldingi bo'lim yo'q → 12 ta savol, hammasi shu bo'limdan
const u0 = UNITS[0]!;
const p0 = passAll(u0.lessons.map((l) => l.id));
assert.equal(bossAvailable(u0, p0), true);
assert.equal(bossAvailable(u0, {}), false);
const s0 = selectBossItems(u0, UNITS, p0, sig, 'seed-1');
assert.equal(s0.length, BOSS_SIZE);
assert.ok(s0.every((x) => u0.lessons.some((l) => l.id === x.lessonId)));
assert.equal(new Set(s0.map(k)).size, s0.length, 'takrorlanish yo‘q');
assert.deepEqual(s0, selectBossItems(u0, UNITS, p0, sig, 'seed-1'), 'bir xil urug‘ — bir xil savollar');
assert.notDeepEqual(s0, selectBossItems(u0, UNITS, p0, sig, 'seed-2'));
// Har bir darsdan savol bor
for (const l of u0.lessons) assert.ok(s0.some((x) => x.lessonId === l.id), `dars ${l.id} vakili bor`);

// Uchinchi bo'lim: oldingi o'tilgan darslardan ~30% takror, xatosi ko'p dars ustun
const u2 = UNITS[2]!;
const earlier = UNITS.slice(0, 2).flatMap((u) => u.lessons.map((l) => l.id));
const p2 = { ...passAll(earlier, 0.9), ...passAll(u2.lessons.map((l) => l.id)) };
const mistakeLesson = earlier[1]!;
const s2 = selectBossItems(u2, UNITS, p2, { openMistakes: { [mistakeLesson]: 3 }, needsRevision: new Set() }, 'seed-3');
assert.equal(s2.length, BOSS_SIZE);
const rev = s2.filter((x) => !u2.lessons.some((l) => l.id === x.lessonId));
assert.ok(rev.length >= 3 && rev.length <= 4, `≈30% takror: ${rev.length}`);
assert.ok(rev.every((x) => earlier.includes(x.lessonId)), 'takror faqat oldingi o‘tilgan darslardan');
assert.ok(rev.some((x) => x.lessonId === mistakeLesson), 'ochiq xatosi bor dars takrorga tushadi');
assert.equal(new Set(s2.map(k)).size, s2.length);
assert.equal(unitOf(u2.lessons[0]!.id).id, u2.id);
console.log('boss.test: OK');
