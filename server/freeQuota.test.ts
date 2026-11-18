import assert from 'node:assert/strict';
import { ApiError, createDb, join } from './db';
import { extend } from './payments';
import { freeLimitsFromEnv, freeStatus, unlockLesson, wallStats } from './freeQuota';
import { DEFAULT_LIMITS } from '../src/lib/freeRules';

const T0 = Date.UTC(2026, 10, 18, 6); // Toshkent 11:00
const DAY = 86_400_000;
const db = createDb();
const free = join(db, 'FreeQ', T0), sub = join(db, 'SubQ', T0);
const id = (n: string) => (db.prepare('SELECT id FROM players WHERE nickname = ?').get(n) as { id: number }).id;
extend(db, id('SubQ'), 'grammar', 30, T0);
const L = DEFAULT_LIMITS;

// Birinchi kun: 3 ta General English darsi, 4-si — devor
for (const l of ['a1-u1-l1', 'a1-u1-l2', 'a1-u1-l3']) assert.ok(unlockLesson(db, free.token, 'ge', l, L, T0).ok, l);
const wall = unlockLesson(db, free.token, 'ge', 'a1-u2-l1', L, T0);
assert.equal(wall.ok, false); assert.equal(wall.resetAt, Date.UTC(2026, 10, 18, 19));
assert.ok(unlockLesson(db, free.token, 'ge', 'a1-u1-l2', L, T0).ok, 'ochilgan dars — takrorlash');
assert.ok(unlockLesson(db, free.token, 'ielts', 'ie-rs-l1', L, T0).ok, 'IELTS kursining o‘z kvotasi');
// Ertasi kun: 1 ta
assert.ok(unlockLesson(db, free.token, 'ge', 'a1-u2-l1', L, T0 + DAY).ok);
assert.equal(unlockLesson(db, free.token, 'ge', 'a1-u2-l2', L, T0 + DAY).ok, false);
// Obunachi (General) — General English cheksiz, lekin IELTS kursi uchun Exam kerak
for (let i = 1; i <= 6; i++) assert.ok(unlockLesson(db, sub.token, 'ge', `a1-u3-l${i}`, L, T0).subscribed);
assert.equal(unlockLesson(db, sub.token, 'ielts', 'ie-rs-l1', L, T0).subscribed, false);
// Holat va statistika
const st = freeStatus(db, free.token, L, T0 + DAY);
assert.equal(Object.keys(st.state.unlocked).length, 5); assert.equal(st.state.firstDay, '2026-11-18'); assert.deepEqual(st.subscribed, { grammar: false, exam: false });
const ws = wallStats(db, T0 + DAY);
assert.equal(ws.walled, 1); assert.equal(ws.converted, 0); assert.equal(ws.today, 1);
assert.throws(() => unlockLesson(db, free.token, 'xx', 'a1', L, T0), (e: ApiError) => e.status === 400);
assert.throws(() => unlockLesson(db, 'yolgon', 'ge', 'a1-u1-l1', L, T0), (e: ApiError) => e.status === 401);
// Railway o'zgaruvchilari bilan sozlash
assert.deepEqual(freeLimitsFromEnv({ FREE_LESSONS_PER_DAY: '2', FREE_FIRST_DAY_LESSONS: '5', FREE_WRITING_PER_WEEK: '0' } as never), { perDay: 2, firstDay: 5, writingPerWeek: 0, speakingPerWeek: 1 });
assert.deepEqual(freeLimitsFromEnv({ FREE_LESSONS_PER_DAY: 'abc' } as never).perDay, 1);
console.log('freeQuota.test: OK');
