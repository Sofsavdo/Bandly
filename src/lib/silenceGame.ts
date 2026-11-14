// "Jim qolma!" — Bandly's own timed speaking challenge (inspired by the general idea of time-limited speaking; no competitor assets).
// Rules (documented, thresholds are gameplay HYPOTHESES to be tested — DR-12):
//  - a round lasts ROUND_MS; the learner must keep speaking about a topic;
//  - if no speech is detected for longer than the level's silence limit, the round ends (in "relaxed" mode it never ends early);
//  - speech detection uses the browser's recogniser, whose own latency (~0.5–1.5 s) is part of the limit — hence pressure-free mode exists.
export type ChallengeLevel = 'relaxed' | 'easy' | 'medium' | 'hard' | 'extreme';
export const LEVELS: { id: ChallengeLevel; labelUz: string; silenceMs: number }[] = [
  { id: 'relaxed', labelUz: 'Bosimsiz (yutqazish yo‘q)', silenceMs: Number.POSITIVE_INFINITY },
  { id: 'easy', labelUz: 'Oson · 12 s', silenceMs: 12_000 },
  { id: 'medium', labelUz: 'O‘rta · 10 s', silenceMs: 10_000 },
  { id: 'hard', labelUz: 'Qiyin · 5 s', silenceMs: 5_000 },
  { id: 'extreme', labelUz: 'Juda qiyin · 2.5 s', silenceMs: 2_500 },
];
export const ROUND_MS = 60_000;
export const START_GRACE_MS = 3_000; // extra time to start talking after the topic appears

export const levelOf = (id: ChallengeLevel) => LEVELS.find((l) => l.id === id)!;

/** 0 = safe, 1 = the limit is reached. */
export function danger(silentMs: number, limitMs: number): number {
  if (!Number.isFinite(limitMs)) return 0;
  return Math.max(0, Math.min(1, silentMs / limitMs));
}

export const countWords = (t: string): number => (t.replace(/[’‘]/g, "'").match(/[A-Za-z']+/g) ?? []).length;

export interface RoundResult { survived: boolean; ms: number; words: number; wpm: number; level: ChallengeLevel }
export function result(level: ChallengeLevel, elapsedMs: number, transcript: string, roundMs = ROUND_MS): RoundResult {
  const ms = Math.min(elapsedMs, roundMs);
  const words = countWords(transcript);
  return { survived: level === 'relaxed' || elapsedMs >= roundMs - 250, ms, words, wpm: ms > 0 ? Math.round(words / (ms / 60_000)) : 0, level };
}

/** Score: words spoken, multiplied by difficulty; surviving the full round adds a bonus. Deterministic. */
export function score(r: RoundResult): number {
  const mult: Record<ChallengeLevel, number> = { relaxed: 0.5, easy: 1, medium: 1.3, hard: 1.8, extreme: 2.5 };
  return Math.round(r.words * mult[r.level] + (r.survived && r.level !== 'relaxed' ? 50 * mult[r.level] : 0));
}

export type Tier = 'silent' | 'tryhard' | 'solid' | 'fluent';
export function tier(r: RoundResult): Tier {
  if (r.words < 8) return 'silent';
  if (!r.survived) return 'tryhard';
  return r.wpm >= 90 ? 'fluent' : 'solid';
}

/** Reactions: kind by default; the savage set is used only for learners who confirmed 18+ (same rule as the AI Coach). Language mistakes only — never the person. */
const REACT: Record<Tier, { kind: string; savage: string }> = {
  silent: { kind: 'Boshlanishi qiyin bo‘ladi — keyingi safar birinchi gapni tayyorlab qo‘ying va to‘xtamang!', savage: 'Shu ham gapirishmi? Mikrofon ham zerikib uxlab qoldi. Qaytadan, bu safar jiddiy!' },
  tryhard: { kind: 'Yaxshi urinish! Jim qolib qoldingiz — “Well…”, “Let me think…” kabi iboralar bilan vaqt yuting.', savage: 'Yarmida o‘chib qolding-ku, eshak! Jim turgandan ko‘ra “Well, actually…” deb boshla!' },
  solid: { kind: 'Zo‘r! Raund oxirigacha gapirdingiz. Endi tezlikni va so‘z boyligini oshiramiz.', savage: 'Hm, tirik qolding. Hayronman. Lekin sekinroq gapirding — keyingi safar tezroq!' },
  fluent: { kind: 'Ajoyib ravonlik! Daqiqasiga 90+ so‘z — bu juda yaxshi natija.', savage: 'Voy, miya ishlaydi-ku! Bugun so‘kmayman. Faqat bugun.' },
};
export const reaction = (r: RoundResult, savage: boolean): string => (savage ? REACT[tier(r)].savage : REACT[tier(r)].kind);

export const TOPICS: { band: 'low' | 'mid' | 'high'; en: string; uz: string }[] = [
  { band: 'low', en: 'Describe your favourite food and how it is made.', uz: 'Sevimli taomingiz va u qanday tayyorlanishi' },
  { band: 'low', en: 'Talk about your family.', uz: 'Oilangiz haqida' },
  { band: 'low', en: 'Describe your typical day from morning to night.', uz: 'Odatiy kuningiz' },
  { band: 'low', en: 'Talk about your best friend.', uz: 'Eng yaqin do‘stingiz' },
  { band: 'low', en: 'Describe your home.', uz: 'Uyingiz' },
  { band: 'low', en: 'What did you do last weekend?', uz: 'O‘tgan dam olish kunlari nima qildingiz?' },
  { band: 'mid', en: 'Describe a trip that you will never forget.', uz: 'Unutilmas sayohatingiz' },
  { band: 'mid', en: 'Is social media good or bad for young people? Why?', uz: 'Ijtimoiy tarmoqlar yoshlar uchun foydalimi?' },
  { band: 'mid', en: 'Talk about a skill you want to learn and why.', uz: 'O‘rganmoqchi bo‘lgan ko‘nikmangiz' },
  { band: 'mid', en: 'Describe a person who has influenced you.', uz: 'Sizga ta’sir qilgan inson' },
  { band: 'mid', en: 'What would you do if you won a million dollars?', uz: 'Million dollar yutsangiz nima qilardingiz?' },
  { band: 'mid', en: 'Compare life in a big city and in a village.', uz: 'Shahar va qishloq hayotini taqqoslang' },
  { band: 'high', en: 'Should university education be free for everyone?', uz: 'Oliy ta’lim hamma uchun bepul bo‘lishi kerakmi?' },
  { band: 'high', en: 'How will artificial intelligence change jobs in the next ten years?', uz: 'Sun’iy intellekt kasblarni qanday o‘zgartiradi?' },
  { band: 'high', en: 'Is it better to work for a big company or to start your own business?', uz: 'Katta kompaniya yoki o‘z biznesingiz?' },
  { band: 'high', en: 'What is the biggest environmental problem in your country and how can it be solved?', uz: 'Mamlakatingizdagi eng katta ekologik muammo' },
  { band: 'high', en: 'Do rich countries have a duty to help poorer ones?', uz: 'Boy davlatlar kambag‘allarga yordam berishi shartmi?' },
  { band: 'high', en: 'Should children be allowed to use smartphones at school?', uz: 'Maktabda smartfon ruxsat etilishi kerakmi?' },
];
export function pickTopic(level: string | null | undefined, rnd: () => number = Math.random) {
  const band = !level || level === 'A1' || level === 'A2' ? 'low' : level === 'B1' || level === 'B2' ? 'mid' : 'high';
  const pool = TOPICS.filter((t) => t.band === band);
  return pool[Math.floor(rnd() * pool.length)]!;
}
