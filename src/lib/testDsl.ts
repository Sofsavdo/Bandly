// Metodist uchun test matn formati (Word'dan nusxalab qo'yish mumkin). Namuna: TEST_TEMPLATE.
//   Title / Level / Minutes / Kind (reading | listening) / Context, Names (faqat listening)
//   [PASSAGE] — abzatslar (har biri alohida qator, "A. ..." bilan boshlash tavsiya etiladi)
//   [SCRIPT]  — "A: gap" qatorlari (listening)
//   [QUESTIONS] — "## Ko'rsatma" guruh boshlaydi; savol qatorlari:
//     T Gap | True/False/Not Given | @ dalil
//     M Savol | variant | *to'g'ri variant | variant | @ dalil
//     H Paragraph A | i. sarlavha | *ii. sarlavha | ... | @ dalil      (moslashtirish)
//     F Gap ______ bilan | javob1; javob2 | @ dalil
// Dalil (@) ixtiyoriy. Savol raqamlari avtomatik (1, 2, 3 …).
import type { ListeningTest, Question, ReadingTest } from '../content/types';
import { L } from '../i18n';

export interface TestDslError { line: number; message: string }
export type AnyTest = (ReadingTest & { kind: 'reading' }) | (ListeningTest & { kind: 'listening' });

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
const TF: Record<string, 'True' | 'False' | 'Not Given'> = { true: 'True', false: 'False', 'not given': 'Not Given', ng: 'Not Given', t: 'True', f: 'False' };

export function parseTest(text: string, id: string): { test: AnyTest | null; errors: TestDslError[] } {
  const errors: TestDslError[] = [];
  const err = (line: number, message: string) => errors.push({ line, message });
  const meta: Record<string, string> = {};
  const paragraphs: string[] = [];
  const script: ListeningTest['script'] = [];
  const groups: { instruction: string; questionIds: number[] }[] = [];
  const questions: Question[] = [];
  let section: 'meta' | 'passage' | 'script' | 'questions' = 'meta';
  text.split(/\r?\n/).forEach((raw, i) => {
    const n = i + 1; const line = raw.trim();
    if (!line) return;
    const sec = /^\[(PASSAGE|SCRIPT|QUESTIONS)\]$/i.exec(line);
    if (sec) { section = sec[1]!.toLowerCase() as typeof section; return; }
    if (section === 'meta') {
      const m = /^(\w+)\s*:\s*(.+)$/.exec(line);
      if (!m) return err(n, L('Sarlavha qismida “Kalit: qiymat” ko‘rinishi kerak (Title, Level, Minutes, Kind)'));
      meta[m[1]!.toLowerCase()] = m[2]!.trim(); return;
    }
    if (section === 'passage') { paragraphs.push(line); return; }
    if (section === 'script') {
      const m = /^([A-D])\s*:\s*(.+)$/.exec(line);
      if (!m) return err(n, L('Skript qatori “A: gap” ko‘rinishida bo‘lsin (A–D)'));
      script.push({ speaker: m[1] as 'A' | 'B' | 'C' | 'D', text: m[2]!.trim() }); return;
    }
    if (line.startsWith('##')) { groups.push({ instruction: line.replace(/^#+\s*/, ''), questionIds: [] }); return; }
    const g = groups[groups.length - 1];
    if (!g) return err(n, L('Savollardan oldin “## Ko‘rsatma” qatori kerak'));
    const kind = line[0]!.toUpperCase();
    let parts = line.slice(1).split('|').map((p) => p.trim());
    const ev = parts.find((p) => p.startsWith('@'));
    parts = parts.filter((p) => !p.startsWith('@'));
    const evidence = ev ? ev.replace(/^@\s*/, '') : L('Matnda tekshiring.');
    const qid = questions.length + 1;
    const qtext = parts.shift() ?? '';
    if (!qtext) return err(n, L('Savol matni bo‘sh'));
    if (kind === 'T') {
      const a = TF[(parts[0] ?? '').toLowerCase()];
      if (!a) return err(n, L('Javob: True, False yoki Not Given'));
      questions.push({ id: qid, type: 'tfng', text: qtext, answer: a, evidence });
    } else if (kind === 'M' || kind === 'H') {
      if (parts.length < 2) return err(n, L('Kamida 2 ta variant kerak'));
      const answer = parts.findIndex((p) => p.startsWith('*'));
      if (answer < 0 || parts.filter((p) => p.startsWith('*')).length > 1) return err(n, L('Bitta to‘g‘ri variant oldiga * qo‘ying'));
      questions.push({ id: qid, type: kind === 'M' ? 'mcq' : 'match', text: qtext, options: parts.map((p) => p.replace(/^\*\s*/, '')), answer, evidence });
    } else if (kind === 'F') {
      const answers = (parts[0] ?? '').split(';').map((x) => x.trim()).filter(Boolean);
      if (!answers.length) return err(n, L('Kamida bitta javob kerak'));
      questions.push({ id: qid, type: 'fill', text: qtext, answers, evidence });
    } else return err(n, L('Savol qatori T, M, H yoki F harfi bilan boshlanadi'));
    g.questionIds.push(qid);
  });
  const kind = (meta.kind ?? 'reading').toLowerCase();
  if (kind !== 'reading' && kind !== 'listening') err(0, L('Kind: reading yoki listening'));
  const level = (meta.level ?? '').toUpperCase() as (typeof LEVELS)[number];
  const minutes = Number(meta.minutes);
  const title = meta.title ?? '';
  if (errors.length) return { test: null, errors };
  const base = { id, level, title, minutes, groups, questions };
  const test: AnyTest = kind === 'listening'
    ? { ...base, kind: 'listening', context: meta.context ?? title, names: Object.fromEntries((meta.names ?? 'A=Speaker').split(';').map((x) => x.split('=').map((s) => s.trim())).filter((x) => x.length === 2 && /^[A-D]$/.test(x[0]!))) as ListeningTest['names'], script }
    : { ...base, kind: 'reading', passageTitle: meta.passage ?? title, paragraphs };
  return { test, errors: validateTest(test) };
}

const clean = (t: string) => t.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ');

/** Test yaxlitligi (grade.test qoidalari bilan bir xil): server e'lon qilishdan oldin shu bilan tekshiradi. */
export function validateTest(t: AnyTest): TestDslError[] {
  const e: TestDslError[] = [];
  const add = (message: string) => e.push({ line: 0, message });
  if (t.title.trim().length < 4) add(L('Title (nomi) kerak'));
  if (!LEVELS.includes(t.level as (typeof LEVELS)[number])) add(L('Level: A1, A2, B1, B2 yoki C1'));
  if (!(t.minutes >= 3 && t.minutes <= 60)) add('Minutes: 3 dan 60 gacha');
  if (t.questions.length < 8) add(L('Kamida 8 ta savol kerak'));
  if (t.kind === 'reading' && t.paragraphs.join(' ').split(/\s+/).length < 80) add(L('Matn juda qisqa (kamida 80 so‘z)'));
  if (t.kind === 'listening' && t.script.length < 4) add(L('Skriptda kamida 4 ta qator kerak'));
  if (t.kind === 'listening') for (const l of t.script) if (!t.names[l.speaker]) add(L('Names: {0} so‘zlovchining ismi berilmagan', [l.speaker]));
  if (t.groups.some((g) => g.questionIds.length === 0)) add(L('Bo‘sh savol guruhi bor'));
  const text = clean(t.kind === 'reading' ? t.paragraphs.join(' ') : t.script.map((l) => l.text).join(' '));
  for (const q of t.questions) {
    if (q.type === 'mcq' || q.type === 'match') { if (new Set(q.options).size !== q.options.length) add(L('{0}-savol: variantlar takrorlangan', [q.id])); }
    if (q.type === 'fill') {
      if (!q.text.includes('______')) add(L('{0}-savol: bo‘sh joy “______” (6 ta pastki chiziq) bilan belgilansin', [q.id]));
      const found = q.answers.some((a) => text.includes(clean(a).trim()));
      const numeric = q.answers.some((a) => /^\d+$/.test(a));
      if (!found && !numeric) add(L('{0}-savol: javob ({1}) matnda yo‘q', [q.id, q.answers.join(' / ')]));
    }
  }
  return e;
}

export const TEST_TEMPLATE = L('Title: Reading mini-test: A New Library\nLevel: A2\nMinutes: 12\nKind: reading\nPassage: A New Library\n\n[PASSAGE]\nA. Last year, our town opened a new library next to the park. It is open from nine in the morning until eight in the evening, but on Sundays it closes at five.\nB. The library has more than ten thousand books, a children\'s room and twenty computers. Visitors can use the computers for one hour a day.\nC. Membership is free for students. Other adults pay fifty thousand som a year. The library also has a small café on the first floor, which is very popular with students after school.\n\n[QUESTIONS]\n## Questions 1–4: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.\nT The library is next to the park. | True | @ A: "next to the park"\nT The library closes at eight every day. | False | @ A: "on Sundays it closes at five"\nT The library has a parking area. | Not Given | @ Parking is not mentioned.\nT Students do not pay for membership. | True | @ C: "Membership is free for students."\n## Questions 5–6: Choose the correct letter.\nM How long can visitors use a computer each day? | Thirty minutes | *One hour | Two hours | @ B: "for one hour a day"\nM Where is the café? | *On the first floor | Next to the park | In the children\'s room | @ C: "a small café on the first floor"\n## Questions 7–8: Complete the sentences. Write ONE WORD AND/OR A NUMBER.\nF There are ______ computers in the library. | twenty; 20 | @ B: "twenty computers"\nF The café is very popular with ______. | students | @ C: "very popular with students"\n');
