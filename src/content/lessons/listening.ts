import type { Item, Lesson } from './types';
import { L } from '../../i18n';

// Darslarda eshitib tushunish deyarli yo'q edi (2046 mashqdan 11 tasida audio). Har darsning o'z misollaridan 2 ta "tinglab ma'nosini top" mashqi yasaladi:
// ingliz gapi ovoz bilan o'qiladi (matn yashirin, 2 marta eshitiladi), o'quvchi o'zbekcha ma'nosini tanlaydi; noto'g'ri variantlar shu darsning boshqa misollari.
// Yangi kontent yozilmaydi — mavjud (allaqachon tarjima qilingan) gaplardan quriladi; audio kesh bilan shu gaplar "Gapir" bosqichida ham ishlatiladi.
export const LISTEN_PROMPT = L('Tinglang: bu gap nimani anglatadi?');

export function listeningFromExamples(l: Lesson, take = 2): Item[] {
  if (l.practice.filter((it) => it.kind !== 'order' && it.listen).length >= take) return []; // darsning o'z audio mashqlari bor
  const ex = l.examples.filter((e) => e.en.trim() && e.uz.trim());
  if (ex.length < 3) return [];
  const picks = [...new Set([0, Math.min(2, ex.length - 1)])].slice(0, take);
  const out: Item[] = [];
  for (const k of picks) {
    const right = ex[k]!;
    const others = [...new Set(ex.filter((_, i) => i !== k).map((e) => e.uz).filter((u) => u !== right.uz))];
    if (others.length < 2) continue;
    const distract = [others[k % others.length]!, others[(k + 1) % others.length]!];
    if (distract[0] === distract[1]) continue;
    const pos = k % 3;
    const options = [...distract]; options.splice(pos, 0, right.uz);
    out.push({ kind: 'choice', prompt: LISTEN_PROMPT, options, answer: pos, explainUz: right.uz, listen: right.en, meaning: true });
  }
  return out;
}
