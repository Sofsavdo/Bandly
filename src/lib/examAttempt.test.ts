import assert from 'node:assert/strict';
import { addHighlight, attemptRoute, clearFinishedAttempts, createAttempt, isExpired, loadAttempt, pendingGuestAttempts, remainingSeconds, saveAttempt, segments, setAnswer, submitAttempt, toggleFlag, unanswered, visibleAttempt } from './examAttempt';

const T0 = 1_700_000_000_000;
const a0 = createAttempt('reading:r1', 15, T0);
assert.equal(remainingSeconds(a0, T0), 900);
// Qayta yuklash vaqtni tiklamaydi: qolgan vaqt saqlangan muddatdan hisoblanadi
assert.equal(remainingSeconds(a0, T0 + 61_000), 839);
assert.equal(remainingSeconds(a0, T0 + 2_000_000), 0);
assert.equal(isExpired(a0, T0 + 900_000), true);
assert.equal(isExpired(a0, T0 + 899_000), false);

// Javoblar va belgilar
let a = setAnswer(a0, 3, 'True');
a = setAnswer(a, 5, 2);
assert.deepEqual(unanswered(a, [1, 3, 5]), [1]);
a = setAnswer(a, 5, undefined);
assert.deepEqual(unanswered(a, [3, 5]), [5]);
a = toggleFlag(a, 7); a = toggleFlag(a, 2);
assert.deepEqual(a.flags, [2, 7]);
a = toggleFlag(a, 7);
assert.deepEqual(a.flags, [2]);

// Topshirish bir martalik; topshirilgandan keyin o'zgarmaydi
const s1 = submitAttempt(a, T0 + 100_000);
const s2 = submitAttempt(s1, T0 + 200_000, true);
assert.equal(s2, s1, 'ikkinchi topshirish hech narsani o‘zgartirmaydi');
assert.equal(s1.submittedAt, T0 + 100_000);
assert.equal(setAnswer(s1, 1, 'False'), s1);
assert.equal(toggleFlag(s1, 1), s1);
assert.equal(isExpired(s1, T0 + 10_000_000), false);

// Highlight: birlashtirish va bo'laklash
let h = addHighlight([], { p: 0, start: 5, end: 10 });
h = addHighlight(h, { p: 0, start: 8, end: 15 });
h = addHighlight(h, { p: 1, start: 0, end: 3 });
h = addHighlight(h, { p: 0, start: 20, end: 20 }); // bo'sh oraliq e'tiborsiz
assert.deepEqual(h, [{ p: 0, start: 5, end: 15 }, { p: 1, start: 0, end: 3 }]);
const segs = segments('The quick brown fox jumps', h, 0);
assert.deepEqual(segs, [{ text: 'The q', hl: false }, { text: 'uick brown', hl: true }, { text: ' fox jumps', hl: false }]);
assert.equal(segs.map((s) => s.text).join(''), 'The quick brown fox jumps', 'matn o‘zgarmaydi');
assert.deepEqual(segments('abc', [{ p: 0, start: 1, end: 99 }], 0), [{ text: 'a', hl: false }, { text: 'bc', hl: true }]);

// ---- Mehmon mock: urinish egasi, kutayotgan urinishlar, chiqishda tozalash ----
const mem = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v), removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(), key: (i: number) => [...mem.keys()][i] ?? null, get length() { return mem.size; },
} as Storage;
// Object.keys(localStorage) ishlashi uchun kalitlarni xossa sifatida ham aks ettiramiz
const ls = localStorage as unknown as Record<string, unknown>;
const origSet = localStorage.setItem.bind(localStorage), origRem = localStorage.removeItem.bind(localStorage);
localStorage.setItem = (k, v) => { origSet(k, v); ls[k] = v; };
localStorage.removeItem = (k) => { origRem(k); delete ls[k]; };

const g0 = createAttempt('reading:reading-5', 20, T0, true);
assert.equal(g0.guest, true); assert.equal(createAttempt('reading:x', 20, T0).guest, undefined, 'hisobli urinishda bayroq yo‘q (eski yozuvlar bilan mos)');
// Mehmon faqat o'z baholanmagan urinishini ko'radi; hisobli foydalanuvchi hammasini (jumladan mehmon urinishini — u hisobga bog'lanadi)
assert.equal(visibleAttempt(g0, false), g0);
assert.equal(visibleAttempt(createAttempt('reading:x', 20, T0), false), null, 'oldingi hisobning urinishi mehmonga ko‘rinmaydi');
assert.equal(visibleAttempt({ ...g0, graded: {} }, false), null, 'baholangan urinish (hisob natijasi) mehmonga ko‘rinmaydi');
assert.equal(visibleAttempt(g0, true), g0, 'hisobga kirgach mehmon urinishi ochiladi');
assert.equal(visibleAttempt(null, true), null);

// Kutayotgan mehmon urinishi faqat: mehmon + topshirilgan + baholanmagan
saveAttempt(g0);                                                   // jarayonda — hali kutayotgan emas
assert.equal(pendingGuestAttempts().length, 0);
const gDone = submitAttempt(g0, T0 + 1000); saveAttempt(gDone);
assert.deepEqual(pendingGuestAttempts().map((x) => x.testKey), ['reading:reading-5']);
saveAttempt({ ...submitAttempt(createAttempt('listening:l1', 20, T0), T0 + 1), graded: {}, recorded: true }); // hisobli, baholangan
assert.equal(pendingGuestAttempts().length, 1, 'hisobli urinish kutayotganlarga kirmaydi');
// Qayta saqlash (refresh) holatni o'zgartirmaydi; ikki marta topshirish bitta natija
saveAttempt(gDone); assert.equal(loadAttempt('reading:reading-5')?.status, 'submitted'); assert.equal(submitAttempt(gDone, T0 + 9999), gDone);
// Baholangach kutayotgan emas
saveAttempt({ ...gDone, graded: {}, recorded: true }); assert.equal(pendingGuestAttempts().length, 0);

// Chiqishda: hisobning baholangan urinishi o'chadi; mehmon va baholanmagan urinishlar qoladi
saveAttempt({ ...gDone, graded: undefined, recorded: undefined });
clearFinishedAttempts();
assert.equal(loadAttempt('listening:l1'), null, 'baholangan hisob urinishi tozalandi');
assert.ok(loadAttempt('reading:reading-5'), 'mehmonning kutayotgan urinishi saqlandi');
const inProg = createAttempt('reading:r9', 20, T0); saveAttempt(inProg); clearFinishedAttempts();
assert.ok(loadAttempt('reading:r9'), 'jarayondagi urinish saqlandi');

assert.equal(attemptRoute('reading:reading-5'), '#/mocks/reading/reading-5');
assert.equal(attemptRoute('listening:st-ab12'), '#/mocks/listening/st-ab12');
assert.equal(attemptRoute('writing:x'), null);
assert.equal(attemptRoute('reading:../../x'), null, 'noto‘g‘ri kalitdan yo‘l yasalmaydi');
console.log('examAttempt.test: OK');
