import type { Item } from './types';

export const ch = (prompt: string, options: string[], answer: number, explainUz: string): Item => ({ kind: 'choice', prompt, options, answer, explainUz });
export const gap = (prompt: string, accept: string[], explainUz: string): Item => ({ kind: 'gap', prompt, accept, explainUz });
/** words are given already shuffled; answer is the correct sentence */
export const ord = (words: string[], answer: string, explainUz: string): Item => ({ kind: 'order', words, answer, explainUz });
/** Listening: avval audio (listen — ovoz chiqarib o'qiladigan matn) eshitiladi, matn faqat javobdan keyin ko'rinadi. */
export const lch = (listen: string, prompt: string, options: string[], answer: number, explainUz: string): Item => ({ kind: 'choice', prompt, options, answer, explainUz, listen });
export const lgap = (listen: string, prompt: string, accept: string[], explainUz: string): Item => ({ kind: 'gap', prompt, accept, explainUz, listen });
