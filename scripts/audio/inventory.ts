// Ilovadagi barcha ovozlanadigan inglizcha matnlar ro'yxati (ElevenLabs bilan oldindan yaratish uchun).
// Har bir yozuv: kalit (clipKey yoki listening test id), matn, toifa. Bir xil matn bir marta ovozlanadi.
import { clipKey } from '../../src/lib/clipHash';
import { ALL_LESSONS, IELTS_LESSONS } from '../../src/content/lessons';
import { vocab } from '../../src/content/vocab';
import { part1Topics, part2Cards } from '../../src/content/speaking';
import { scenes } from '../../src/content/scenes';
import { listeningTests } from '../../src/content/listeningTests';
import { ROUND_OFF } from '../../src/lib/examiner';
import { roastLines } from '../../src/content/roasts';
import { SKILL_SETS } from '../../src/content/skillCheck';
import { TOPICS } from '../../src/lib/silenceGame';
import { splitSentences } from '../../src/lib/speech';

/** Speaking imtihonchisining doimiy gaplari (examiner.ts dagi qoliplar, ikkala variant: oson / odatiy). */
const EXAMINER_LINES = [
  "Good morning. I'm Sellzen, and I'll be your examiner today. Could you tell me your full name, please?",
  'Thank you. Now, in this first part, I would like to ask you some questions about yourself.',
  'Could you tell me a little more about that?',
  ...['about one minute', 'one to two minutes'].flatMap((d) => [
    `Thank you. Now I am going to give you a topic, and I would like you to talk about it for ${d}. You have one minute to think. Here is your topic.`,
    `All right. Remember, you have ${d}. Please begin speaking now.`,
  ]),
  'Thank you very much. That is the end of the speaking test.',
  'Please continue. You still have some time.',
  'Thank you. Now let us talk about some more general questions related to this topic.',
  'The test is finished.',
];

export type Category = 'listening' | 'lesson' | 'lesson-listen' | 'listening-skill' | 'word' | 'speaking' | 'shadow';
export interface Clip { key: string; text: string; category: Category }
export interface ListeningJob { id: string; lines: { speaker: string; text: string }[]; chars: number }

const clean = (s: string): string => s.replace(/\s+/g, ' ').trim();

export function clipInventory(): Clip[] {
  const out = new Map<string, Clip>();
  const add = (text: string, category: Category) => {
    const t = clean(text);
    if (!t || !/[A-Za-z]/.test(t)) return;
    const key = clipKey(t);
    if (!out.has(key)) out.set(key, { key, text: t, category });
  };
  for (const { lesson } of [...ALL_LESSONS, ...IELTS_LESSONS]) {
    for (const e of lesson.examples) if (!e.audio) add(e.en, 'lesson');
    for (const v of lesson.vocab ?? []) add(v.en, 'word');
    for (const it of [...lesson.practice, ...lesson.check]) if (it.kind !== 'order' && it.listen) add(it.listen, 'lesson-listen');
  }
  for (const w of vocab) add(w.word, 'word');
  // Speaking: butun savol + gaplarga bo'lingan qismlar (imtihonchi qolipli gaplarni savol bilan qo'shib aytadi)
  const speak = (t: string) => { add(t, 'speaking'); for (const p of splitSentences(t)) add(p, 'speaking'); };
  for (const t of part1Topics) for (const q of t.questions) speak(q);
  for (const c of part2Cards) { speak(c.title); for (const p of c.points) speak(`You should say ${p}.`.replace('.,', '.')); for (const q of c.part3) speak(q); }
  for (const l of [...EXAMINER_LINES, ...ROUND_OFF]) speak(l);
  // Reaksiyalar: o'rniga so'z qo'yiladigan ({wrong}) qoliplar oldindan ovozlanmaydi
  const walk = (v: unknown): void => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { const r = v as { en?: unknown }; if (typeof r.en === 'string') { if (!r.en.includes('{')) speak(r.en); } else Object.values(v).forEach(walk); } };
  walk(roastLines);
  speak('Ha, ha, ha, ha!');
  for (const t of TOPICS) speak(t.en);
  for (const set of SKILL_SETS) add(set.listening.script, 'listening-skill' as Category);
  for (const s of scenes as unknown as { lines?: { en?: string; text?: string }[] }[]) for (const l of s.lines ?? []) add(l.en ?? l.text ?? '', 'shadow');
  return [...out.values()];
}

export function listeningInventory(): ListeningJob[] {
  return listeningTests.map((t) => ({ id: t.id, lines: t.script.map((l) => ({ speaker: l.speaker, text: clean(l.text) })), chars: t.script.reduce((s, l) => s + clean(l.text).length, 0) }));
}

if (process.argv[1]?.endsWith('inventory.ts')) {
  const clips = clipInventory();
  const by: Record<string, { n: number; chars: number }> = {};
  for (const c of clips) { by[c.category] ??= { n: 0, chars: 0 }; by[c.category]!.n++; by[c.category]!.chars += c.text.length; }
  const lis = listeningInventory();
  console.log('clips:', by, 'total chars', clips.reduce((s, c) => s + c.text.length, 0));
  console.log('listening:', lis.length, 'tests,', lis.reduce((s, l) => s + l.chars, 0), 'chars');
  for (const l of lis) console.log('  ', l.id, l.chars);
}
