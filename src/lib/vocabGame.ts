import { vocab, type Word } from '../content/vocab';
import { say } from './speech';

export const shuffle = <T,>(a: readonly T[]): T[] => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

export interface Option { id: string; text: string }

/** To'g'ri javob + 3 ta chalg'ituvchi (boshqa so'zlar). dir='en': inglizcha so'z → o'zbekcha ma'no. */
export function buildOptions(target: Word, dir: 'en' | 'uz', pool: readonly Word[] = vocab): Option[] {
  // Variantlar matni takrorlanmasin: bir xil ma'noli (piyoda — pedestrian / on foot) yoki ro'yxatda ikki marta uchraydigan so'z
  // chalg'ituvchi bo'lib chiqsa, ikkita bir xil javob ko'rinib, to'g'risi "xato" deb hisoblanardi
  const show = (w: Word) => (dir === 'en' ? w.uz : w.word).trim().toLowerCase();
  const used = new Set([show(target)]);
  const others: Word[] = [];
  for (const w of shuffle(pool)) { if (others.length >= 3) break; const t = show(w); if (w.id === target.id || used.has(t)) continue; used.add(t); others.push(w); }
  return shuffle([target, ...others]).map((w) => ({ id: w.id, text: dir === 'en' ? w.uz : w.word }));
}

/** Juftlik o'yini uchun: so'zi ham, ma'nosi ham takrorlanmaydigan so'zlar (birinchi uchragani qoladi). */
export function distinctWords(ids: readonly string[], byId: Record<string, Word>, size: number): string[] {
  const en = new Set<string>(), uz = new Set<string>(), out: string[] = [];
  for (const id of ids) { const w = byId[id]; if (!w || out.length >= size) continue; const a = w.word.trim().toLowerCase(), b = w.uz.trim().toLowerCase(); if (en.has(a) || uz.has(b)) continue; en.add(a); uz.add(b); out.push(id); }
  return out;
}

/** Imlo o'yini: shu ma'noga ega har qanday so'z to'g'ri (masalan, «taxminan» — roughly ham, approximately ham). */
export function spellingAccepts(target: Word, typed: string, pool: readonly Word[] = vocab): boolean {
  const n = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = n(typed); if (!t) return false;
  if (t === n(target.word)) return true;
  const uz = target.uz.trim().toLowerCase();
  return pool.some((w) => w.uz.trim().toLowerCase() === uz && n(w.word) === t);
}

/** Misol gapda so'zni yashiradi (yechim ochilib qolmasligi uchun o'zak bo'yicha). */
export function blankExample(w: Word): string {
  // Ibora (ko'p so'zli): butun iborani yashiramiz
  if (w.word.includes(' ')) return w.example.replace(new RegExp(w.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '_____');
  const stem = w.word.slice(0, Math.max(4, w.word.length - 2)).replace(/[^a-z-]/gi, '');
  const re = new RegExp(`${stem}[a-z-]*`, 'i');
  return w.example.replace(re, '_____');
}

/** So'zni eshittirish: avval tayyor neyron ovoz, bo'lmasa brauzer ovozi. */
export const speak = (text: string): void => { void say(text, { cancelled: false }, 'en-GB'); };
