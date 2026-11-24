import assert from 'node:assert/strict';
import { IELTS_UNITS } from '../content/ielts';
import { lessonById } from '../content/lessons';
import { buildMockPlan, doableLesson, isTaskDone, WEAK_LESSON, type PlanInput, type PlanTest } from './mockPlan';

const T = (id: string, level: PlanTest['level'], exam: 'ielts' | 'cefr' = 'ielts', minutes = 20): PlanTest => ({ id, title: `Test ${id}`, level, exam, minutes });
const tests = {
  reading: [T('reading-1', 'B1'), T('reading-2', 'B1'), T('reading-3', 'B2'), T('cefr-r1', 'B1', 'cefr', 30)],
  listening: [T('listening-1', 'B1'), T('listening-2', 'B2'), T('cefr-l1', 'B1', 'cefr', 30)],
};
const base = (over: Partial<PlanInput> = {}): PlanInput => ({
  kind: 'reading', exam: 'ielts', takenTestId: 'reading-1', tests, results: { reading: [{ title: 'Test reading-1', correct: 5, total: 13 }], listening: [] },
  rows: [{ type: 'tfng', correct: 1, total: 5 }, { type: 'mcq', correct: 4, total: 5 }, { type: 'fill', correct: 2, total: 3 }],
  level: null, progress: {}, minutesPerDay: 20, freeLeftToday: 1, freePerDay: 1, ...over,
});

// Katalog: zaif turlarga bog'langan darslar mavjud (uydirma havola yo'q)
for (const k of ['reading', 'listening'] as const) for (const [t, id] of Object.entries(WEAK_LESSON[k])) assert.ok(lessonById(id!), `${k}/${t}: ${id} darsi katalogda yo'q`);

// Darslar ketma-ketligi: oldingi darslar o'tilmagan bo'lsa — birinchi ochiq dars (prereq); hammasi o'tilgan bo'lsa — null
const rsLessons = IELTS_UNITS.find((u) => u.lessons.some((l) => l.id === 'ie-rs-l4'))!.lessons.map((l) => l.id);
assert.deepEqual(doableLesson('ie-rs-l4', {}, null), { lessonId: rsLessons[0], prereq: true }, 'boshlovchi: avval ketma-ketlikdagi birinchi dars');
const passed = Object.fromEntries(rsLessons.slice(0, 3).map((id) => [id, { passedAt: 1 }]));
assert.deepEqual(doableLesson('ie-rs-l4', passed, null), { lessonId: 'ie-rs-l4', prereq: false }, 'oldingilari o‘tildi — aynan shu dars');
const all = Object.fromEntries(rsLessons.map((id) => [id, { passedAt: 1 }]));
assert.equal(doableLesson('ie-rs-l4', all, null), null, 'hammasi o‘tilgan — yangi dars yo‘q');
assert.equal(doableLesson('a1-u1-l1', {}, null), null, 'IELTS kursiga kirmagan dars rejaga qo‘shilmaydi');

// Daraja yo'q: reja daraja testidan boshlanadi; har vazifada bevosita havola; zaif tur dars + keyingi test + boshqa ko'nikma
let plan = buildMockPlan(base());
assert.equal(plan[0]!.type, 'placement'); assert.equal(plan[0]!.href, '#/placement');
const lessons = plan.filter((t) => t.type === 'lesson');
assert.equal(lessons.length, 1, 'tfng (1/5) va fill (2/3) zaif — ikkalasi ham bir xil boshlang‘ich darsga olib keladi: bitta vazifa (takror yo‘q)');
for (const t of plan) {
  if (t.type === 'lesson') assert.ok(lessonById(t.id.slice(7)), 'dars katalogda bor');
  if (t.type === 'mock') assert.ok(tests.reading.concat(tests.listening as never).some((x) => `mock:${x.id}` === t.id), 'test katalogda bor');
  assert.match(t.href, /^#\/(learn|mocks|placement)/);
}
assert.ok(plan.some((t) => t.type === 'mock' && t.reason === 'other_skill' && /listening/.test(t.href)), 'Listening natijasi yo‘q — shu ko‘nikma tavsiya qilinadi');
assert.ok(!plan.some((t) => t.id === 'mock:reading-1'), 'hozirgina topshirilgan test qayta tavsiya qilinmaydi');

// Daraja bor: placement yo'q
plan = buildMockPlan(base({ level: 'B1' }));
assert.ok(!plan.some((t) => t.type === 'placement'));

// Bepul kunlik limit hurmat qilinadi: bugun 0 ta yangi dars — dars ertaga; kuniga 1 ta — ikki dars ikki kunga
plan = buildMockPlan(base({ level: 'B2', freeLeftToday: 0, freePerDay: 1, rows: [{ type: 'tfng', correct: 0, total: 4 }, { type: 'match', correct: 1, total: 4 }] }));
const ls = plan.filter((t) => t.type === 'lesson');
assert.equal(ls.length, 2); assert.ok(ls.every((t) => t.day >= 2), 'bugungi limit tugagan — darslar keyingi kunlarda');
assert.notEqual(ls[0]!.day, ls[1]!.day, 'kuniga 1 ta dars');
assert.ok(plan.some((t) => t.day === 1 && t.type === 'mock'), 'bugun limitga tegmaydigan vazifa (mock) bor');
// Cheklovsiz (obunachi): hammasi mos kunlik vaqtga qarab
plan = buildMockPlan(base({ level: 'B2', freeLeftToday: null, freePerDay: null, minutesPerDay: 60, rows: [{ type: 'tfng', correct: 0, total: 4 }, { type: 'match', correct: 1, total: 4 }] }));
assert.ok(plan.filter((t) => t.day === 1).length >= 2, 'cheklovsiz — birinchi kunga bir nechta vazifa');
// Kunlik vaqt chegarasi
plan = buildMockPlan(base({ level: 'B1', freeLeftToday: null, freePerDay: null, minutesPerDay: 10 }));
for (let d = 1; d <= 3; d++) { const ts = plan.filter((t) => t.day === d); if (ts.length > 1) assert.ok(ts.reduce((s, t) => s + t.minutes, 0) <= 10, `kun ${d}: vaqt chegarasi`); }

// Kuchli natija: zaif tur yo'q — dars qo'shilmaydi (uydirma yo'q), keyingi testlar bor
plan = buildMockPlan(base({ level: 'B2', rows: [{ type: 'tfng', correct: 5, total: 5 }, { type: 'mcq', correct: 4, total: 5 }] }));
assert.equal(plan.filter((t) => t.type === 'lesson').length, 0);
assert.ok(plan.some((t) => t.type === 'mock'));
// Bitta turda 1 ta savol — ishonchsiz: zaif deb hisoblanmaydi
plan = buildMockPlan(base({ level: 'B2', rows: [{ type: 'match', correct: 0, total: 1 }] }));
assert.equal(plan.filter((t) => t.type === 'lesson').length, 0, 'bitta savol — ishonchsiz');
// Mos mashq topilmasa vazifa yaratilmaydi
plan = buildMockPlan(base({ level: 'B1', tests: { reading: [T('reading-1', 'B1')], listening: [] }, results: { reading: [], listening: [] }, rows: [] }));
assert.deepEqual(plan, [], 'yechilgan test va boshqa mashq yo‘q — bo‘sh reja');
// CEFR testi: keyingi tavsiya ham CEFR
plan = buildMockPlan(base({ level: 'B1', exam: 'cefr', takenTestId: 'cefr-r1', results: { reading: [], listening: [] }, rows: [] }));
assert.ok(plan.filter((t) => t.type === 'mock').every((t) => /cefr/.test(t.id)), 'CEFR testidan keyin CEFR testlari');

// Bajarilganlik — mavjud ma'lumotdan
const ctx = (o: Partial<Parameters<typeof isTaskDone>[1]> = {}) => ({ passedAt: () => null, resultAfter: () => false, level: null, since: 1000, ...o });
const L = buildMockPlan(base({ level: 'B1', rows: [{ type: 'tfng', correct: 0, total: 4 }] })).find((t) => t.type === 'lesson')!;
assert.equal(isTaskDone(L, ctx()), false);
assert.equal(isTaskDone(L, ctx({ passedAt: () => 500 })), false, 'reja tuzilishidan oldin o‘tilgan dars bajarilgan hisoblanmaydi');
assert.equal(isTaskDone(L, ctx({ passedAt: () => 2000 })), true);
const M = buildMockPlan(base({ level: 'B1' })).find((t) => t.type === 'mock')!;
assert.equal(isTaskDone(M, ctx({ resultAfter: (title, since) => title === M.title && since === 1000 })), true);
assert.equal(isTaskDone({ ...L, type: 'placement', id: 'placement' }, ctx({ level: 'B1' })), true);
console.log('mockPlan.test: OK');
