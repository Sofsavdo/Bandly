import type { Word } from './vocab';
import { newWordsA } from './vocabNewA';
import { newWordsB } from './vocabNewB';
import { newWordsC } from './vocabNewC';
import { newWordsD } from './vocabNewD';

/** 2026-11 qo'shilgan darslar (Starter, A1–C2 9–10-bo'limlar) so'zlari. Bir xil so'z bir necha faylda bo'lsa — birinchisi olinadi. */
const seen = new Set<string>();
export const newCourseWords: Word[] = [...newWordsA, ...newWordsB, ...newWordsC, ...newWordsD].filter((w) => (seen.has(w.id) ? false : (seen.add(w.id), true)));
