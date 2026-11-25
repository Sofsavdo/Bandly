// Ko'p tanlovli savollarda to'g'ri javob doim birinchi/ikkinchi o'rinda turib qolmasligi uchun: to'g'ri variantni aniq tartibda
// (0, 1, 2, 3, 0, …) o'rinlarga ko'chiradi; qolgan variantlarning o'zaro tartibi saqlanadi. Sonli variantlar (o'sish tartibida berilgan) o'zgarmaydi.
// Natija deterministik: bir xil kirish — doim bir xil chiqish (testlar va "Javoblarni ko'rish" barqaror).
import type { Item } from './lessons/types';

const NUMERIC = /^[−-]?\$?[\d.,/]+\s?(%|°|π|√\d*|km|cm|m|kg|L|miles?|hours?|minutes?|[a-zA-Z]{0,3}[²³]?)?$/;
const numeric = (opts: string[]): boolean => opts.every((o) => NUMERIC.test(o.trim()));

export function balanceChoices(items: Item[], start = 0): Item[] {
  let k = start;
  return items.map((it) => {
    if (it.kind !== 'choice' || numeric(it.options)) return it;
    const target = k++ % it.options.length;
    const right = it.options[it.answer]!;
    const rest = it.options.filter((_, i) => i !== it.answer);
    const options = [...rest.slice(0, target), right, ...rest.slice(target)];
    return { ...it, options, answer: target };
  });
}
