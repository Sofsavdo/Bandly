// Imtihon kontenti validatsiyasi (P1.5): har bir Reading/Listening testi (IELTS va CEFR) uchun javob kaliti, takror, tuzilma.
import assert from 'node:assert/strict';
import { readingTests } from './readingTests';
import { listeningTests } from './listeningTests';
import type { Question } from './types';

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
const problems: string[] = [];
const check = (id: string, qs: Question[], groups: { instruction: string; questionIds: number[] }[], minutes: number, body: string) => {
  if (!body.trim()) problems.push(`${id}: matn/skript bo‘sh`);
  const p = (m: string) => problems.push(`${id}: ${m}`);
  if (!qs.length) p('savol yo‘q');
  if (!(minutes > 0)) p('vaqt ko‘rsatilmagan');
  const ids = qs.map((q) => q.id);
  if (new Set(ids).size !== ids.length) p('savol id takrorlangan');
  const texts = qs.map((q) => norm(q.text));
  const dupText = texts.filter((t, i) => texts.indexOf(t) !== i && !/^_+$|^\d+$/.test(t) && t.length > 12);
  if (dupText.length) p(`takror savol matni: ${dupText[0]}`);
  const grouped = groups.flatMap((g) => g.questionIds);
  for (const id2 of ids) if (!grouped.includes(id2)) p(`savol ${id2} hech qaysi guruhda yo‘q (ko‘rsatma ko‘rinmaydi)`);
  for (const g of groups) { if (!g.instruction.trim()) p('guruh ko‘rsatmasi bo‘sh'); for (const x of g.questionIds) if (!ids.includes(x)) p(`guruhda mavjud bo‘lmagan savol ${x}`); }
  for (const q of qs) {
    if (!q.text.trim()) p(`savol ${q.id}: matn bo‘sh`);
    if (!q.evidence?.trim()) p(`savol ${q.id}: izoh/dalil (evidence) yo‘q`); // evidence — matnga ishora qiluvchi izoh (so'zma-so'z iqtibos shart emas)
    if (q.type === 'mcq' || q.type === 'match') {
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) p(`savol ${q.id}: javob indeksi noto‘g‘ri`);
      if (new Set(q.options.map(norm)).size !== q.options.length) p(`savol ${q.id}: variantlar takrorlangan`);
      if (q.options.length < 2) p(`savol ${q.id}: kamida 2 variant kerak`); // IELTS'da 2 variantli moslashtirish (kim nima qiladi) ham bor
    }
    if (q.type === 'fill' && (!q.answers.length || q.answers.some((a) => !a.trim()))) p(`savol ${q.id}: qabul qilinadigan javob yo‘q`);
    if (q.type === 'tfng' && !['True', 'False', 'Not Given'].includes(q.answer)) p(`savol ${q.id}: TFNG javobi noto‘g‘ri`);
  }
};
for (const t of readingTests) check(t.id, t.questions, t.groups, t.minutes, t.paragraphs.join(' '));
for (const t of listeningTests) check(t.id, t.questions, t.groups, t.minutes, t.script.map((s) => s.text).join(' '));
assert.deepEqual(problems, [], problems.slice(0, 20).join('\n'));
// «Fill» javobi matndan olinadi: Reading'da qabul qilinadigan javoblardan kamida bittasi matnda so'zma-so'z bo'lishi shart;
// Listening'da ham (raqamlardan tashqari — ular skriptda so'z bilan aytiladi: "forty-five", "oh seven seven…").
const flat = (s: string) => s.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9£$%.' -]/g, ' ').replace(/\s+/g, ' ').trim();
const notInText: string[] = [];
for (const t of readingTests) { const body = flat(t.paragraphs.join(' ')); for (const q of t.questions) if (q.type === 'fill' && !q.answers.some((a) => body.includes(flat(a)))) notInText.push(`${t.id} q${q.id}: ${q.answers.join(' | ')}`); }
for (const t of listeningTests) { const body = flat(t.script.map((x) => x.text).join(' ')); for (const q of t.questions) if (q.type === 'fill' && !q.answers.some((a) => /\d/.test(a)) && !q.answers.some((a) => body.includes(flat(a)))) notInText.push(`${t.id} q${q.id}: ${q.answers.join(' | ')}`); }
assert.deepEqual(notInText, [], `javob matnda yo‘q (metodist tekshirsin):\n${notInText.join('\n')}`);
// Test id lari barcha to'plamlarda noyob
const all = [...readingTests, ...listeningTests].map((t) => t.id);
assert.equal(new Set(all).size, all.length, 'test id takrorlangan');
// CEFR Multilevel: rasmiy manbada tasdiqlangan umumiy hajm (examFormats.ts) — Reading 35 savol / 60 daqiqa
const cefrR = readingTests.filter((t) => t.exam === 'cefr'), cefrL = listeningTests.filter((t) => t.exam === 'cefr');
for (const t of cefrR) { assert.equal(t.questions.length, 35, `${t.id}: CEFR Reading 35 savol`); assert.equal(t.minutes, 60, `${t.id}: 60 daqiqa`); }
console.log(`examContent.test: OK (${readingTests.length} reading, ${listeningTests.length} listening; CEFR: ${cefrR.length} reading, ${cefrL.length} listening)`);
