// Tarjima sifati darvozasi: AI natijasi bazaga yozilishidan oldin tekshiriladi.
// Rad etiladi: (1) kirill harflarida yozilgan o'zbekcha ("ruscha" o'rniga), (2) lotinda qolib ketgan o'zbekcha,
// (3) o'zgartirilgan inglizcha atamalar va misollar (IELTS, Present Simple, "I am agree" kabi), (4) {o'rin}lar mos emas.
/** Tarjimada qolib ketgan o'zbekcha (inglizcha bilan umumiy so'zlarsiz: test, mock va h.k. hisobga olinmaydi). */
const UZ_LEFT = /[og][‘ʻ]|\b(va|bilan|uchun|emas|kerak|qiling|bo‘ladi|sizning|siz|darslar|dars|savol\w*|javob\w*|bepul|daqiqa\w*|kunlik|hisob\w*|ustoz\w*|xato\w*|tanlang|natija\w*|daraja\w*|mashq\w*|reja\w*|vazifa\w*|qoldi|xaritasi|bugun\w*|yana|keyingi|boshlash)\b/i;
const looksUz = (s: string): boolean => UZ_LEFT.test(s) || /q(?!u)[a-z]/i.test(s.replace(/\b(IELTS|Iraq|Qatar|FAQ)\b/g, ''));

export type QLang = 'en' | 'ru' | 'kk' | 'ky' | 'tg';

/** Doim lotinda, o'zgarishsiz qolishi shart bo'lgan atamalar. */
const PROTECTED = [
  'Bandly', 'IELTS', 'CEFR', 'Multilevel', 'SAT', 'XP', 'AI', 'Telegram', 'Mock Arena', 'General English', 'Exam Preparation', 'All Access',
  'Reading', 'Listening', 'Writing', 'Speaking', 'Task 1', 'Task 2', 'Part 1', 'Part 2', 'Part 3', 'College Board', 'Hamyon',
  'Present Simple', 'Present Continuous', 'Present Perfect', 'Past Simple', 'Past Continuous', 'Past Perfect', 'Future Simple', 'Passive voice', 'Reported speech',
];
/** Inglizcha bog'lovchi so'zlar: manbada lotinda bo'lsa (misol gap), tarjimada ham lotinda qolishi kerak. */
const EN_FUNCTION = /\b(the|is|are|am|was|were|have|has|had|will|would|can|could|should|must|do|does|did|been|going|got|than|which|who|that|if|I|you|he|she|it|we|they|my|your|not|don’t|doesn’t|didn’t)\b/g;

const CYR2LAT: Record<string, string> = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'j', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'x', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sh', ъ: '', ы: 'i', ь: '', э: 'e', ю: 'yu', я: 'ya', ў: 'o', қ: 'q', ғ: 'g', ҳ: 'h' };
const lat = (s: string) => s.toLowerCase().replace(/[а-яёўқғҳ]/g, (c) => CYR2LAT[c] ?? c);
const words = (s: string) => (s.toLowerCase().replace(/[‘’ʻ'`]/g, '').match(/[a-z]{3,}/g) ?? []);

/** Xato sababi (o'zbekcha) yoki null — tarjima qabul qilinadi. */
export function rejectReason(src: string, tr: string, lang: QLang): string | null {
  const ph = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
  if (!tr.trim()) return 'bo‘sh';
  if (ph(src) !== ph(tr)) return '{o‘rin}lar mos emas';
  if (tr.length > src.length * 4 + 40) return 'juda uzun';
  for (const term of PROTECTED) if (src.includes(term) && !tr.includes(term)) return `«${term}» o‘zgartirilgan`;
  const srcEn = src.match(EN_FUNCTION) ?? [], trEn = tr.match(EN_FUNCTION) ?? [];
  if (srcEn.length >= 2 && trEn.length < Math.ceil(srcEn.length * 0.7)) return 'inglizcha misol tarjima qilingan';
  if (/[og][‘ʻ]/i.test(tr)) return 'lotincha o‘zbekcha qolgan';
  if (lang !== 'en') {
    if (/ў/i.test(tr)) return 'o‘zbek kirill harfi (ў)';
    if ((lang === 'ru' || lang === 'ky') && /[қғҳ]/i.test(tr)) return 'o‘zbek kirill harflari (қ, ғ, ҳ)';
    if (lang === 'kk' && /ҳ/i.test(tr)) return 'o‘zbek kirill harfi (ҳ)';
    // Lotin qismi: manbadagi inglizcha qismdan tashqari o'zbekcha so'z qolmasin
    const latinPart = tr.replace(/[^A-Za-z‘’ʻ' ]+/g, ' ');
    if (looksUz(latinPart)) return 'lotincha o‘zbekcha so‘z qolgan';
    // Kirillcha qism o'zbekchaning harfma-harf o'girilgani emasmi? (manba so'zlari bilan ko'p mos kelsa — rad)
    const cyr = (tr.match(/[А-Яа-яЁёЎўҚқҒғҲҳӘәӨөҮүҰұІіҢңҺһӢӣӮӯҶҷ]+/g) ?? []).map(lat).filter((w) => w.length >= 3);
    const srcW = new Set(words(src));
    if (cyr.length >= 3 && cyr.filter((w) => srcW.has(w)).length / cyr.length >= 0.5) return 'kirill harfida yozilgan o‘zbekcha';
  } else {
    if (looksUz(tr.replace(/“[^”]*”|"[^"]*"/g, ' '))) return 'o‘zbekcha qolgan';
  }
  return null;
}
