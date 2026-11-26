// Imtihon kurslari (IELTS, SAT, CEFR) General English bo'limi sifatida ko'rinmasin: yuqori menyu, pastki panel, sarlavha.
import assert from 'node:assert/strict';
import { SECTIONS, courseContext, sectionOf, tabActive } from './nav';
import { CEFR_HREF, clearCourse, currentCourse, rememberCourse } from '../lib/courseFrom';
import { ALL_LESSONS, IELTS_LESSONS, SAT_LESSONS } from '../content/lessons';

const exam = SECTIONS.find((s) => s.id === 'exam')!;
const geLesson = ALL_LESSONS[0]!.lesson.id;
const satLesson = SAT_LESSONS[0]!.lesson.id;
const ieLesson = IELTS_LESSONS[0]!.lesson.id;

// SAT / IELTS darslari va kurs sahifalari — "Imtihon" bo'limida
for (const [hash, label] of [['#/sat', 'nav.satCourse'], ['#/cefr', 'nav.cefrCourse'], [`#/learn/${satLesson}`, 'nav.satCourse'], [`#/learn/${ieLesson}`, 'nav.ieltsCourse']] as const) {
  const w = sectionOf(hash);
  assert.equal(w?.section.id, 'exam', `${hash} — Imtihon bo‘limi`);
  assert.equal(w?.page.label, label, `${hash} — sarlavha ${label}`);
  assert.equal(tabActive(hash, '#/exam'), true, `${hash} — pastki panelda Imtihon faol`);
  assert.equal(tabActive(hash, '#/learn'), false, `${hash} — pastki panelda General English faol emas`);
}

// Oddiy General English darsi va xaritasi — o'z bo'limida
assert.equal(sectionOf(`#/learn/${geLesson}`)?.section.id, 'learn');
assert.equal(sectionOf('#/learn')?.section.id, 'learn');
assert.equal(tabActive(`#/learn/${geLesson}`, '#/learn'), true);
assert.equal(tabActive('#/learn', '#/exam'), false);
assert.equal(courseContext(`#/learn/${geLesson}`, null), null);

// CEFR kursidan ochilgan General English darsi — CEFR kursi bo'limi (kontekst sessiyada saqlanadi)
assert.equal(courseContext(`#/learn/${geLesson}`, CEFR_HREF)?.href, CEFR_HREF);
assert.equal(courseContext('#/learn', CEFR_HREF), null, 'xarita har doim General English');
assert.equal(courseContext(`#/learn/${satLesson}`, CEFR_HREF)?.href, '#/sat', 'SAT darsi o‘z kursida qoladi');

// Kontekst: muddati o'tadi va tozalanadi (sessionStorage Node'da yo'q — xotiradagi almashtirgich bilan)
const mem = new Map<string, string>();
(globalThis as unknown as { sessionStorage: Storage }).sessionStorage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k) } as unknown as Storage;
assert.equal(currentCourse(), null);
rememberCourse(CEFR_HREF, 1000);
assert.equal(currentCourse(1000 + 60_000), CEFR_HREF);
assert.equal(currentCourse(1000 + 4 * 3_600_000), null, '3 soatdan keyin eskiradi');
rememberCourse(CEFR_HREF);
assert.equal(sectionOf(`#/learn/${geLesson}`)?.page.href, CEFR_HREF);
clearCourse();
assert.equal(sectionOf(`#/learn/${geLesson}`)?.section.id, 'learn');

// Imtihon bo'limining ichki menyusida hamma kurs sahifalari "Imtihon" yorlig'i ostida
assert.ok(exam.children.some((c) => c.href === '#/exam'));
console.log('nav: OK');
