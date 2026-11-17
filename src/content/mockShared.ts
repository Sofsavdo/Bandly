// Mock Arena: javob kalitlari brauzerga yuborilmaydi. Brauzer faqat "ochiq" nusxani oladi (mockPublic.json),
// baholashni server qiladi (POST /api/mock/grade). Bu fayl ikkalasi uchun umumiy turlar va tozalash funksiyasi.
import type { ListeningTest, Question, ReadingTest } from './types';

type Strip<T> = T extends unknown ? Omit<T, 'answer' | 'answers' | 'evidence'> : never;
export type PublicQuestion = Strip<Question>;
export type PublicReadingTest = Omit<ReadingTest, 'questions'> & { questions: PublicQuestion[] };
export type PublicListeningTest = Omit<ListeningTest, 'questions'> & { questions: PublicQuestion[] };

export function stripQuestion(q: Question): PublicQuestion {
  const { answer: _a, answers: _b, evidence: _c, ...rest } = q as Question & { answer?: unknown; answers?: unknown };
  return rest as PublicQuestion;
}
export const stripTest = <T extends ReadingTest | ListeningTest>(t: T) => ({ ...t, questions: t.questions.map(stripQuestion) });

/** Server javobi: har savol bo'yicha natija (topshirilgandan keyin ko'rsatiladi). */
export interface GradedItem { correct: boolean; answer: string; evidence: string }
export type Graded = Record<number, GradedItem>;
