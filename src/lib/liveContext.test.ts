import assert from 'node:assert/strict';
import { buildLiveContext } from './liveContext';

// Kontekst: haqiqiy ma'lumot, qisqa, yo'nalishlar ruxsat etilgan ko'rinishda; darajasiz — bo'sh reja
const ROUTE = /^#\/(?:learn(?:\/[a-z0-9._-]+)?|grammar|mistakes|games|exam|placement|mocks\/(?:reading|listening|writing|speaking))?$/i;
{
  const c = buildLiveContext({ level: 'B1', examDate: new Date(Date.now() + 23 * 86_400_000).toISOString().slice(0, 10) }) as { level: string; goal: string; examDays: number; today: { title: string; minutes: number; why: string; route: string }[]; weak: string[]; mistakesDue: number; done: string[] };
  assert.equal(c.level, 'B1'); assert.ok(c.examDays >= 22 && c.examDays <= 24, `${c.examDays}`);
  assert.ok(c.today.length >= 1 && c.today.length <= 5, `reja ${c.today.length}`);
  for (const t of c.today) { assert.ok(t.title.length > 0, 'sarlavha'); assert.match(t.route, ROUTE, t.route); }
  assert.match(c.today[0]!.route, /^#\/learn\/[a-z0-9-]+$/i, 'birinchi — kursdagi keyingi dars');
  assert.equal(c.mistakesDue, 0); assert.deepEqual(c.done, []);
}
{
  const c = buildLiveContext({ level: null }) as { today: unknown[]; level: null };
  assert.equal(c.level, null); assert.deepEqual(c.today, []);
}
console.log('liveContext: OK');
