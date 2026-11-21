// Darsni o'yinga aylantiruvchi sof funksiyalar (zamonaviy metodika):
// - Kashf etish (inductive): avval misollar, keyin qoida — o'quvchi qoidani o'zi "topadi".
// - Kichik bo'laklar (micro-learning): tushuntirish bitta-bitta kartada.
// - Esga olish (retrieval practice): so'z juftlari va "eshit va tanla" mini-o'yinlari darsning o'z ma'lumotidan yasaladi.
// - Xato qaytadi (spaced retrieval within session): xato javob berilgan topshiriq mashq oxirida yana bir marta chiqadi.
// - Boss jang: yakuniy tekshiruv — bossning "joni" har to'g'ri javobda kamayadi.
import type { Lesson } from '../content/lessons/types';
import { L } from '../i18n';

/** Yulduzlar: o'tmagan — 0; o'tgan — 1; 90%+ — 2; 100% — 3 (xaritadagi bilan bir xil). */
export const lessonStars = (best: number, passed: boolean): number => (!passed ? 0 : best >= 1 ? 3 : best >= 0.9 ? 2 : 1);

/** Barqaror aralashtirish (bir dars har safar bir xil tartibda — test va qayta kirishda chalkashmaydi). */
export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 100000) / 100000; };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j]!, a[i]!]; }
  return a;
}

export interface ListenItem { en: string; audio?: string; options: string[]; answer: number }
/** "Eshit va tanla": misol gapi o'qiladi, o'quvchi uning ma'nosini 3 ta variantdan tanlaydi. Misollar 3 tadan kam bo'lsa — yo'q. */
export function listenRound(lesson: Pick<Lesson, 'id' | 'examples'>, max = 3): ListenItem[] {
  const ex = lesson.examples.filter((e) => e.en.trim() && e.uz.trim());
  const uniq = [...new Map(ex.map((e) => [e.uz, e])).values()];
  if (uniq.length < 3) return [];
  return seededShuffle(uniq, lesson.id).slice(0, max).map((e, k) => {
    const others = seededShuffle(uniq.filter((o) => o.uz !== e.uz), `${lesson.id}:${k}`).slice(0, 2).map((o) => o.uz);
    const options = seededShuffle([e.uz, ...others], `${lesson.id}:o${k}`);
    return { en: e.en, audio: e.audio, options, answer: options.indexOf(e.uz) };
  });
}

export interface PairsRound { left: { id: number; text: string }[]; right: { id: number; text: string }[] }
/** "Juftini top": yangi so'zlar (ko'pi bilan 5 ta). 3 tadan kam bo'lsa — yo'q. */
export function pairsRound(lesson: Pick<Lesson, 'id' | 'vocab'>, max = 5): PairsRound | null {
  const v = [...new Map((lesson.vocab ?? []).filter((x) => x.en.trim() && x.uz.trim()).map((x) => [x.en.toLowerCase(), x])).values()];
  if (v.length < 3) return null;
  const pick = seededShuffle(v, lesson.id).slice(0, max).map((x, id) => ({ id, en: x.en, uz: x.uz }));
  return {
    left: pick.map((x) => ({ id: x.id, text: x.en })),
    right: seededShuffle(pick, `${lesson.id}:r`).map((x) => ({ id: x.id, text: x.uz })),
  };
}

/** Mashq navbati: to'g'ri — topshiriq chiqib ketadi; xato — oxiriga qaytadi (har topshiriq ko'pi bilan bir marta qaytadi). */
export function advanceQueue(queue: readonly number[], correct: boolean, retried: ReadonlySet<number>): { queue: number[]; retried: Set<number> } {
  const [head, ...rest] = queue;
  const r = new Set(retried);
  if (head === undefined) return { queue: [], retried: r };
  if (!correct && !r.has(head)) { r.add(head); return { queue: [...rest, head], retried: r }; }
  return { queue: rest, retried: r };
}

/** Boss joni foizda: har to'g'ri javob bitta "zarba". */
export const bossHp = (total: number, hits: number): number => (total <= 0 ? 0 : Math.max(0, Math.round(100 * (1 - hits / total))));

// Sellzen gaplari — bir xil gap ketma-ket takrorlanmasin
const PRAISE = [L('Zo‘r!'), L('Aynan shunday!'), L('Ana endi gap boshqa!'), L('To‘ppa-to‘g‘ri!'), L('Sellzen hayron qoldi!'), L('Daxshat!'), L('Shunaqa davom eting!')];
const OOPS = [L('Voy, bo‘lmadi'), L('Yaqin keldingiz, lekin yo‘q'), L('Sellzen kuldi — qayta ko‘ring'), L('Hmm, unaqa emas'), L('Xato, lekin bu ham dars')];
export function reaction(ok: boolean, n: number): string {
  const list = ok ? PRAISE : OOPS;
  return list[((n % list.length) + list.length) % list.length]!;
}
