import assert from 'node:assert/strict';
import { ApiError, byToken, createDb, join, putProgress } from './db';
import { archiveGroup, createGroup, groupReport, joinGroup, joinedGroups, leaveGroup, myGroups, removeMember } from './groups';
import { awardXp } from './xp';

const db = createDb();
const NOW = Date.UTC(2026, 10, 17, 9);
const tAcc = join(db, 'Ustoz', NOW), t = byToken(db, tAcc.token);
const other = byToken(db, join(db, 'Begona', NOW).token);
const sAcc = join(db, 'Talaba', NOW), s = byToken(db, sAcc.token);

const g = createGroup(db, t.id, '  9-B sinf  IELTS ', NOW);
assert.match(g.code, /^[A-Z2-9]{6}$/);
assert.throws(() => createGroup(db, t.id, 'x'), ApiError);
assert.deepEqual(joinGroup(db, s.id, g.code.toLowerCase(), NOW), { id: g.id, name: '9-B sinf IELTS' });
joinGroup(db, s.id, g.code, NOW); // takror — xato emas, bir marta
assert.throws(() => joinGroup(db, s.id, 'ZZZZZZ'), ApiError);
assert.equal(joinedGroups(db, s.id)[0]!.teacher, 'Ustoz');

// Hisobot: daraja, darslar, mock, 7 kunlik XP
putProgress(db, sAcc.token, { 'bandly.profile.v1': JSON.stringify({ level: 'B1' }), 'bandly.lessons.v1': JSON.stringify({ a: { passedAt: NOW - 86_400_000 }, b: { passedAt: NOW - 20 * 86_400_000 }, c: { passedAt: null } }), 'bandly.results.v1': JSON.stringify([{ kind: 'reading', title: 'Mock 1', correct: 30, total: 40, band: 6.5 }]) }, 0, NOW);
awardXp(db, s.id, 'lesson-xyz-1', 'lesson', 40, NOW - 3600_000);
const r = groupReport(db, g.id, t.id, false, NOW);
assert.equal(r.members.length, 1);
const m = r.members[0]!;
assert.deepEqual([m.level, m.lessons, m.lessons7, m.xp7, m.lastMock?.band], ['B1', 2, 1, 40, 6.5]);
assert.equal(myGroups(db, t.id)[0]!.members, 1);

// Begona o'qituvchi ko'ra olmaydi; admin ko'ra oladi
assert.throws(() => groupReport(db, g.id, other.id, false, NOW), ApiError);
assert.equal(groupReport(db, g.id, other.id, true, NOW).members.length, 1);
// Chiqarish va arxiv
removeMember(db, g.id, t.id, false, s.id); assert.equal(groupReport(db, g.id, t.id, false, NOW).members.length, 0);
joinGroup(db, s.id, g.code, NOW); leaveGroup(db, s.id, g.id); assert.equal(joinedGroups(db, s.id).length, 0);
archiveGroup(db, g.id, t.id, false); assert.equal(myGroups(db, t.id).length, 0);
assert.throws(() => joinGroup(db, s.id, g.code), ApiError);
console.log('groups: OK');
