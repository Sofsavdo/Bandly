// Yangi dars bo'limlarini tekshiradi: npx tsx scripts/content/check-units.ts <modul yo'li> <EXPORT1,EXPORT2> [vocab modul yo'li] [vocab export]
// Tekshiruvlar: validateLesson, javob kalitlari, to'liq gaplar, id takrorlanmasligi, dars so'zlari umumiy ro'yxatda borligi.
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { ALL_LESSONS, IELTS_LESSONS } from '../../src/content/lessons';
import { validateLesson, checkItem, correctAnswerText, fullSentence } from '../../src/lib/lessons';
import { vocab, type Word } from '../../src/content/vocab';
import type { Unit } from '../../src/content/lessons/types';

const [mod, names, vmod, vname] = process.argv.slice(2);
if (!mod || !names) { console.error('usage: check-units.ts <module> <EXPORTS> [vocabModule] [vocabExport]'); process.exit(2); }
const m = await import(pathToFileURL(resolve(mod)).href) as Record<string, Unit>;
const extra: Word[] = vmod && vname ? ((await import(pathToFileURL(resolve(vmod)).href)) as Record<string, Word[]>)[vname] ?? [] : [];
const pool = [...vocab, ...extra.filter((w) => !vocab.some((v) => v.id === w.id))];
const baseWord = (en: string): string => en.split(/\s+[–-]\s+/)[0]!.trim().toLowerCase();
const errs: string[] = [];
const existing = new Set([...ALL_LESSONS, ...IELTS_LESSONS].map((x) => x.lesson.id));
const seen = new Set<string>();
const dupVocab = extra.filter((w) => vocab.some((v) => v.id === w.id || v.word.toLowerCase() === w.word.toLowerCase()));
if (dupVocab.length) errs.push(`vocab: already in shared list (remove from your file, lessons can use them directly): ${dupVocab.map((w) => w.word).join(', ')}`);
let lessons = 0, items = 0;
for (const n of names.split(',')) {
  const u = m[n];
  if (!u) { errs.push(`export ${n} not found`); continue; }
  if (u.status !== 'pilot') errs.push(`${u.id}: status must be 'pilot'`);
  if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(u.level)) errs.push(`${u.id}: bad level`);
  for (const l of u.lessons) {
    lessons++;
    if (existing.has(l.id) || seen.has(l.id)) errs.push(`${l.id}: duplicate lesson id`); seen.add(l.id);
    errs.push(...validateLesson(l));
    if (!l.writing) errs.push(`${l.id}: writing task required`);
    if ((l.vocab ?? []).length < 3) errs.push(`${l.id}: needs ≥3 vocab`);
    for (const v of l.vocab ?? []) if (!pool.some((w) => w.word.toLowerCase() === baseWord(v.en))) errs.push(`${l.id}: vocab "${v.en}" not in shared word list — add it to your vocab file`);
    const all = [...l.practice, ...l.check];
    const pr = all.map((it) => (it.kind === 'order' ? it.answer : `${it.listen ?? ''}|${it.prompt}`));
    if (new Set(pr).size !== pr.length) errs.push(`${l.id}: repeated item`);
    for (const it of all) {
      items++;
      const ans = it.kind === 'choice' ? it.answer : it.kind === 'gap' ? it.accept[0]! : it.answer.split(' ');
      if (!checkItem(it, ans)) errs.push(`${l.id}: key fails "${correctAnswerText(it)}"`);
      const f = fullSentence(it);
      if (f && /___|\(|\)|\s{2}/.test(f)) errs.push(`${l.id}: full sentence not clean: "${f}" (avoid hints in brackets AFTER the gap or put them so the filled sentence reads cleanly)`);
    }
  }
}
if (errs.length) { console.error(errs.join('\n')); console.error(`\n${errs.length} problem(s)`); process.exit(1); }
console.log(`OK: ${lessons} lessons, ${items} items, ${extra.length} new words`);
