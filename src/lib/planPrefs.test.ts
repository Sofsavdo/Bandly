import assert from 'node:assert/strict';
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: () => undefined, clear: () => mem.clear(), key: () => null, length: 0 } as Storage;
const P = await import('./planPrefs');
const { planDay } = await import('./adaptive/recommend');
const { ALL_NODES } = await import('../content/curriculum/inventory');

assert.deepEqual(P.loadPrefs(), P.DEFAULT_PREFS);
P.savePrefs({ goal: 'ielts', minutes: 45 }); assert.deepEqual(P.loadPrefs(), { goal: 'ielts', minutes: 45 });
mem.set('bandly.planprefs.v1', '{"goal":"hack","minutes":999}'); assert.deepEqual(P.loadPrefs(), P.DEFAULT_PREFS, 'invalid values fall back');
assert.equal(P.weeklyLessonTarget(10), 4); assert.equal(P.weeklyLessonTarget(20), 8); assert.equal(P.weeklyLessonTarget(1), 1);
assert.deepEqual(P.goalTags('general'), ['general']); assert.deepEqual(P.goalTags('ielts', ['reading']), ['ielts', 'weak-reading']);
const ws = P.weekStart(Date.UTC(2026, 10, 14, 12)); assert.equal(new Date(ws).getDay(), 1); assert.ok(ws <= Date.UTC(2026, 10, 14, 12));

// the goal changes the plan (same builder as the Home card)
const { buildDailyPlan, weakSkills } = await import('./dailyPlan');
const now = Date.UTC(2026, 10, 14, 9);
const saved = { v: 1 as const, mastery: {}, errors: [] };
const gen = buildDailyPlan({ level: 'B1', saved, prefs: { goal: 'general', minutes: 30 }, skills: {}, now }).tasks;
const ielts = buildDailyPlan({ level: 'B1', saved, prefs: { goal: 'ielts', minutes: 30 }, skills: {}, now }).tasks;
assert.ok(/^ge\.(lesson|grammar|vocab)\./.test(gen[0]!.nodeId), `general goal starts with General English (${gen[0]!.nodeId})`);
assert.ok(/^ge\.(reading|listening)\./.test(ielts[0]!.nodeId), `IELTS goal starts with a skill node (${ielts[0]!.nodeId})`);
const m10 = buildDailyPlan({ level: 'B1', saved, prefs: { goal: 'general', minutes: 10 }, skills: {}, now }).tasks;
const m60 = buildDailyPlan({ level: 'B1', saved, prefs: { goal: 'general', minutes: 60 }, skills: {}, now }).tasks;
assert.ok(m60.length > m10.length && m10.reduce((a, t) => a + t.minutes, 0) <= 10, 'minutes budget respected');
const ielts45 = buildDailyPlan({ level: 'B1', saved, prefs: { goal: 'ielts', minutes: 45 }, skills: {}, now }).tasks;
const sk = ielts45.filter((t) => /^ge\.(reading|listening)\./.test(t.nodeId)).length;
assert.ok(sk >= 1 && sk <= Math.ceil(ielts45.length / 2) && ielts45.length - sk >= 1, 'exam goal mixes skill practice with General English');
// weak skills from the skill check
assert.deepEqual(weakSkills('B1', { reading: { level: 'A2' }, listening: { level: 'B1' } }), ['reading']);
const weakPlan = buildDailyPlan({ level: 'B1', saved, prefs: { goal: 'general', minutes: 30 }, skills: { reading: { level: 'A2' } }, now });
assert.deepEqual(weakPlan.weak, ['reading']); assert.ok(weakPlan.tasks.some((t) => t.nodeId.startsWith('ge.reading.')), 'weak reading gets into a general plan');
// different learners → different plans
const b2 = buildDailyPlan({ level: 'B2', saved, prefs: { goal: 'general', minutes: 30 }, skills: {}, now }).tasks;
assert.notDeepEqual(b2.map((t) => t.nodeId), gen.map((t) => t.nodeId), 'level changes the plan');
console.log('planPrefs.test: OK');
