// Faqat inglizcha (yoki brend/qisqartma) matnni aniqlash — bunday matn hech qaysi tilga tarjima qilinmaydi.
import { createRequire } from 'node:module';
import { looksUz } from './detect';

let EN: Set<string> | null = null;
const dict = (): Set<string> => (EN ??= new Set(createRequire(import.meta.url)('an-array-of-english-words') as string[]));

/** Barcha so'zlari ingliz lug'atida (275 ming so'z) yoki IELTS, XP kabi qisqartma — va o'zbekcha belgisi yo'q. */
export function englishOnly(t: string): boolean {
  if (!/^[A-Za-z0-9 .,:;!?'’()/&+·–—{}%#×=→−²³⁴⁵⁶ˣᵗ₀₁₂≠≤≥<>≈±÷√π°½∞$^*∠θ∪∩∈ⁿ⁻\[\]|-]+$/.test(t) || looksUz(t)) return false;
  const toks = t.replace(/\{\w+\}/g, ' ').match(/[A-Za-z]+/g) ?? [];
  return toks.length > 0 && toks.every((w) => /^[A-Z]{2,6}$/.test(w) || w.length === 1 || dict().has(w.toLowerCase()));
}
