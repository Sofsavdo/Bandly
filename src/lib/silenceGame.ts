import { L } from '../i18n';
// "Jim qolma! — Minora": Bandly'ning o'z gapirish o'yini.
// Mexanika: har bir aytilgan so'z minoraga g'isht bo'lib qo'shiladi (BRICKS_PER_FLOOR g'isht = 1 qavat).
// Bog'lovchi iboralar (because, however, for example…) "oltin g'isht" — LINKER_BONUS g'isht beradi: ravon, bog'langan nutqni o'rgatadi.
// Jim qolinsa, eng yuqori qavat tebranadi; daraja chegarasidan oshsa, bitta qavat quladi (o'yin tugamaydi). Raund ROUND_MS davom etadi.
// Chegaralar o'yin GIPOTEZALARI (DR-12): sinov natijalariga qarab o'zgartiriladi. Nutqni tanish kechikishi (~0.5–1.5 s) chegaraga kiradi.
export type ChallengeLevel = 'relaxed' | 'easy' | 'medium' | 'hard';
export const LEVELS: { id: ChallengeLevel; labelUz: string; silenceMs: number; goal: number }[] = [
  { id: 'relaxed', labelUz: L('Bosimsiz (qavat qulamaydi)'), silenceMs: Number.POSITIVE_INFINITY, goal: 15 },
  { id: 'easy', labelUz: L('Yengil · 8 s'), silenceMs: 8_000, goal: 20 },
  { id: 'medium', labelUz: L('O‘rta · 6 s'), silenceMs: 6_000, goal: 25 },
  { id: 'hard', labelUz: L('Qiyin · 4 s'), silenceMs: 4_000, goal: 30 },
];
export const ROUND_MS = 90_000;
export const START_GRACE_MS = 4_000; // mavzu chiqqandan keyin gapni boshlash uchun qo'shimcha vaqt
export const BRICKS_PER_FLOOR = 5;
export const LINKER_BONUS = 3; // oltin g'isht = 3 oddiy g'isht

export const levelOf = (id: ChallengeLevel) => LEVELS.find((l) => l.id === id) ?? LEVELS[1]!;

/** Bog'lovchi iboralar (uzunroqlari avval tekshiriladi, bir so'z ikki marta sanalmaydi). */
export const LINKERS = ['for example', 'for instance', 'on the other hand', 'as a result', 'in addition', 'because', 'however', 'although', 'therefore', 'actually', 'moreover', 'besides', 'firstly', 'secondly', 'finally', 'also', 'so', 'but'];

export const countWords = (t: string): number => (t.replace(/[’‘]/g, "'").match(/[A-Za-z']+/g) ?? []).length;

/** Matndagi bog'lovchilar soni (uzun iboralar avval olinadi). */
export function countLinkers(t: string): number {
  let s = ` ${t.toLowerCase().replace(/[’‘]/g, "'").replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ')} `;
  let n = 0;
  for (const l of [...LINKERS].sort((a, b) => b.length - a.length)) {
    const parts = s.split(` ${l} `);
    n += parts.length - 1;
    s = parts.join(' | ');
  }
  return n;
}

/** Aytilganlardan g'isht: har so'z 1 ta; har bog'lovchi qo'shimcha (LINKER_BONUS − 1). */
export function bricksOf(transcript: string): { bricks: number; words: number; linkers: number } {
  const words = countWords(transcript);
  const linkers = countLinkers(transcript);
  return { words, linkers, bricks: words + linkers * (LINKER_BONUS - 1) };
}

/** Minoraning hozirgi balandligi (qavatlar): g'ishtlardan qurilgani minus qulaganlar, 0 dan past emas. */
export const floorsOf = (bricks: number, fallen: number): number => Math.max(0, Math.floor(bricks / BRICKS_PER_FLOOR) - fallen);

/** Tebranish: 0 = tinch, 1 = qavat qulash arafasida. */
export function wobble(silentMs: number, limitMs: number): number {
  if (!Number.isFinite(limitMs)) return 0;
  return Math.max(0, Math.min(1, silentMs / limitMs));
}

/** Jimlik chegaradan oshdimi — bitta qavat quladi va jimlik hisobi qaytadan boshlanadi. Qurilgan qavat bo'lmasa, qulash yo'q. */
export function checkFall(silentMs: number, limitMs: number, floorsNow: number): boolean {
  return Number.isFinite(limitMs) && silentMs >= limitMs && floorsNow > 0;
}

export interface RoundResult { floors: number; fallen: number; words: number; linkers: number; wpm: number; ms: number; level: ChallengeLevel; reachedGoal: boolean }
export function result(level: ChallengeLevel, elapsedMs: number, transcript: string, fallen: number, roundMs = ROUND_MS): RoundResult {
  const ms = Math.max(0, Math.min(elapsedMs, roundMs));
  const b = bricksOf(transcript);
  const floors = floorsOf(b.bricks, fallen);
  return { floors, fallen, words: b.words, linkers: b.linkers, wpm: ms > 0 ? Math.round(b.words / (ms / 60_000)) : 0, ms, level, reachedGoal: floors >= levelOf(level).goal };
}

/** Ball: qavatlar × daraja ko'paytmasi; maqsadga yetilsa bonus. Deterministik. */
export function score(r: RoundResult): number {
  const mult: Record<ChallengeLevel, number> = { relaxed: 1, easy: 2, medium: 3, hard: 4 };
  return r.floors * mult[r.level] * 10 + (r.reachedGoal ? 50 * mult[r.level] : 0);
}

export type Tier = 'silent' | 'shaky' | 'solid' | 'master';
export function tier(r: RoundResult): Tier {
  if (r.words < 10) return 'silent';
  if (!r.reachedGoal) return r.fallen > 0 ? 'shaky' : 'solid';
  return r.linkers >= 5 ? 'master' : 'solid';
}

/** Reaksiyalar: odatiy — mehribon; 18+ tasdiqlaganlarga — keskin (AI ustoz bilan bir xil qoida). Faqat tilga, hech qachon shaxsga. */
const REACT: Record<Tier, { kind: string; savage: string }> = {
  silent: { kind: L('Minora endi poydevor qo‘ydi. Keyingi safar birinchi gapni oldindan o‘ylab qo‘ying va to‘xtamang!'), savage: L('Bu minora emas, bitta g‘isht-ku! Qaytadan, bu safar jiddiy!') },
  shaky: { kind: L('Yaxshi qurdingiz, lekin jim qolganda qavatlar quladi. “Well…”, “Let me think…” bilan vaqt yuting.'), savage: L('Qurding-u, o‘zing buzding! Jim turgandan ko‘ra “Well, actually…” de!') },
  solid: { kind: L('Mustahkam minora! Endi oltin g‘ishtlarni — because, however, for example — ko‘proq ishlating.'), savage: L('Hm, minora turibdi. Lekin oltin g‘isht kam — bog‘lovchilarsiz bu oddiy uy!') },
  master: { kind: L('Ustoz quruvchi! Uzoq gapirdingiz va fikrlarni bog‘lovchilar bilan uladingiz — IELTS Speaking’da aynan shu kerak.'), savage: L('Voy, haqiqiy me’mor ekansan-ku! Bugun so‘kmayman. Faqat bugun.') },
};
export const reaction = (r: RoundResult, savage: boolean): string => (savage ? REACT[tier(r)].savage : REACT[tier(r)].kind);

export const TOPICS: { band: 'low' | 'mid' | 'high'; en: string; uz: string }[] = [
  { band: 'low', en: 'Describe your favourite food and how it is made.', uz: L('Sevimli taomingiz va u qanday tayyorlanishi') },
  { band: 'low', en: 'Talk about your family.', uz: L('Oilangiz haqida') },
  { band: 'low', en: 'Describe your typical day from morning to night.', uz: L('Odatiy kuningiz') },
  { band: 'low', en: 'Talk about your best friend.', uz: L('Eng yaqin do‘stingiz') },
  { band: 'low', en: 'Describe your home.', uz: L('Uyingiz') },
  { band: 'low', en: 'What did you do last weekend?', uz: L('O‘tgan dam olish kunlari nima qildingiz?') },
  { band: 'low', en: 'Describe a visit to a bazaar. What can you buy there?', uz: L('Bozorga borish: u yerda nimalar sotiladi?') },
  { band: 'low', en: 'How does your family make plov?', uz: L('Oilangizda osh qanday tayyorlanadi?') },
  { band: 'low', en: L('Describe your neighbourhood, your mahalla.'), uz: L('Mahallangiz haqida') },
  { band: 'mid', en: 'Describe a trip that you will never forget.', uz: L('Unutilmas sayohatingiz') },
  { band: 'mid', en: 'Is social media good or bad for young people? Why?', uz: L('Ijtimoiy tarmoqlar yoshlar uchun foydalimi?') },
  { band: 'mid', en: 'Talk about a skill you want to learn and why.', uz: L('O‘rganmoqchi bo‘lgan ko‘nikmangiz') },
  { band: 'mid', en: 'Describe a person who has influenced you.', uz: L('Sizga ta’sir qilgan inson') },
  { band: 'mid', en: 'What would you do if you won a million dollars?', uz: L('Million dollar yutsangiz nima qilardingiz?') },
  { band: 'mid', en: 'Compare life in a big city and in a village.', uz: L('Shahar va qishloq hayotini taqqoslang') },
  { band: 'mid', en: 'Describe a wedding you have been to.', uz: L('Borgan to‘yingizni tasvirlang') },
  { band: 'mid', en: 'How do people in your country celebrate Navruz?', uz: L('Navro‘z qanday nishonlanadi?') },
  { band: 'mid', en: 'Describe a place in Uzbekistan that you would show to a foreign friend.', uz: L('Chet ellik do‘stingizga ko‘rsatadigan joyingiz') },
  { band: 'high', en: 'Should university education be free for everyone?', uz: L('Oliy ta’lim hamma uchun bepul bo‘lishi kerakmi?') },
  { band: 'high', en: 'How will artificial intelligence change jobs in the next ten years?', uz: L('Sun’iy intellekt kasblarni qanday o‘zgartiradi?') },
  { band: 'high', en: 'Is it better to work for a big company or to start your own business?', uz: L('Katta kompaniya yoki o‘z biznesingiz?') },
  { band: 'high', en: 'What is the biggest environmental problem in your country and how can it be solved?', uz: L('Mamlakatingizdagi eng katta ekologik muammo') },
  { band: 'high', en: 'Do rich countries have a duty to help poorer ones?', uz: L('Boy davlatlar kambag‘allarga yordam berishi shartmi?') },
  { band: 'high', en: 'Should children be allowed to use smartphones at school?', uz: L('Maktabda smartfon ruxsat etilishi kerakmi?') },
  { band: 'high', en: 'Are big traditional weddings still a good idea today?', uz: L('Katta an’anaviy to‘ylar bugun ham to‘g‘rimi?') },
  { band: 'high', en: 'Should young people live with their parents until they marry?', uz: L('Yoshlar turmush qurguncha ota-onasi bilan yashashi kerakmi?') },
];
export function pickTopic(level: string | null | undefined, rnd: () => number = Math.random) {
  const band = !level || level === 'A1' || level === 'A2' ? 'low' : level === 'B1' || level === 'B2' ? 'mid' : 'high';
  const pool = TOPICS.filter((t) => t.band === band);
  return pool[Math.floor(rnd() * pool.length)]!;
}
