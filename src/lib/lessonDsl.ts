// Metodist uchun oddiy matn formati (Word/Excel'dan nusxalab qo'yish mumkin). Har bir savol — bitta qator:
//   ? Savol matni | variant | *to'g'ri variant | variant | izoh
//   _ Gap ___ bilan | javob1; javob2 | izoh
//   = To'g'ri tartibdagi gap | izoh          (so'zlar avtomatik aralashtiriladi)
// Izoh (oxirgi qism) — o'quvchi javobdan keyin ko'radigan tushuntirish.
import type { Item } from '../content/lessons/types';

export interface DslError { line: number; message: string }

const shuffleWords = (s: string): string[] => {
  const w = s.replace(/[.!?]+$/, '').split(/\s+/).filter(Boolean);
  // deterministik aralashtirish: har safar bir xil (testlar va oldindan ko'rish uchun)
  const out = [...w]; for (let i = out.length - 1; i > 0; i--) { const j = (i * 7 + out[i]!.length) % (i + 1); [out[i], out[j]] = [out[j]!, out[i]!]; }
  return out.join(' ') === w.join(' ') && out.length > 1 ? [...out.slice(1), out[0]!] : out;
};

export function parseItems(text: string): { items: Item[]; errors: DslError[] } {
  const items: Item[] = []; const errors: DslError[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim(); if (!line) return;
    const kind = line[0]; const parts = line.slice(1).split('|').map((p) => p.trim());
    const err = (message: string) => errors.push({ line: i + 1, message });
    if (kind === '?') {
      if (parts.length < 4) return err('Tanlov savolida kamida: savol | 2 ta variant | izoh');
      const explainUz = parts.pop()!; const prompt = parts.shift()!;
      const answer = parts.findIndex((p) => p.startsWith('*'));
      if (answer < 0) return err('To‘g‘ri variant oldiga * qo‘ying');
      if (parts.filter((p) => p.startsWith('*')).length > 1) return err('Faqat bitta to‘g‘ri variant bo‘lishi kerak');
      items.push({ kind: 'choice', prompt, options: parts.map((p) => p.replace(/^\*/, '').trim()), answer, explainUz });
    } else if (kind === '_') {
      if (parts.length < 3) return err('Bo‘sh joy savolida: gap ___ bilan | javob(lar) | izoh');
      if (!parts[0]!.includes('___')) return err('Gapda ___ (uchta pastki chiziq) bo‘lishi kerak');
      const accept = parts[1]!.split(';').map((x) => x.trim()).filter(Boolean);
      if (!accept.length) return err('Kamida bitta javob kerak');
      items.push({ kind: 'gap', prompt: parts[0]!, accept, explainUz: parts[2]! });
    } else if (kind === '=') {
      if (parts.length < 2) return err('Tartib savolida: to‘g‘ri gap | izoh');
      const answer = parts[0]!.replace(/[.!?]+$/, '');
      if (answer.split(/\s+/).length < 3) return err('Gapda kamida 3 ta so‘z bo‘lsin');
      items.push({ kind: 'order', words: shuffleWords(answer), answer, explainUz: parts[1]! });
    } else err('Qator ?, _ yoki = bilan boshlanishi kerak');
  });
  return { items, errors };
}

export function formatItems(items: Item[]): string {
  return items.map((it) => {
    if (it.kind === 'choice') return `? ${it.prompt} | ${it.options.map((o, i) => (i === it.answer ? `*${o}` : o)).join(' | ')} | ${it.explainUz}`;
    if (it.kind === 'gap') return `_ ${it.prompt} | ${it.accept.join('; ')} | ${it.explainUz}`;
    return `= ${it.answer} | ${it.explainUz}`;
  }).join('\n');
}

/** "chap ::: o'ng" qatorlari (misollar: inglizcha ::: o'zbekcha; jadval: shakl ::: misol). */
export const parsePairs = (text: string): [string, string][] => text.split(/\r?\n/).map((l) => l.split(':::').map((x) => x.trim())).filter((p) => p[0]).map((p) => [p[0]!, p[1] ?? '']);
export const formatPairs = (pairs: [string, string][]): string => pairs.map(([a, b]) => `${a} ::: ${b}`).join('\n');
