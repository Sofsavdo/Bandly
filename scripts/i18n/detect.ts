// Tabiiy til matnini (tarjima qilinadigan) koddan ajratish qoidalari — extract, codemod va guard testi uchun umumiy.
export const UZ_WORDS = /\b(va|yoki|bilan|uchun|emas|kerak|qiling|bo‘l\w*|bo'l\w*|ta|sahifa\w*|dars\w*|savol\w*|javob\w*|bepul|daqiqa\w*|kun\w*|hisob\w*|ustoz\w*|xato\w*|tanlang|boshla\w*|tugat\w*|kirish|chiqish|natija\w*|daraja\w*|mashq\w*|so‘z\w*|o‘yin\w*|reja\w*|vazifa\w*|qoldi|siz\w*|men|biz|bu|shu|har|hali|yana|keyin|oldin|qayta|yangi|eski|hamma|barcha|ochish|yopish|saqlash|yuborish|tekshir\w*|o‘tish|orqaga|davom\w*|to‘lov\w*|obuna\w*|tarif\w*|ball\w*|ovoz\w*|gap\w*|tinglash|o‘qish|yozish|gapirish|xatolar\w*|takror\w*|bosqich\w*|guruh\w*|liga\w*|reyting\w*|profil\w*|sozlama\w*|til|tilda|tilni|matn\w*|test\w*|imtihon\w*|vaqt\w*|soniya\w*|marta|kunlik|haftalik|oylik|yil\w*|oy|hafta\w*|ism\w*|laqab\w*|parol|kod\w*|nusxa\w*|yuklab|yuklash|ulash\w*|kuting|xatolik|muvaffaqiyat\w*|tayyor|yoqilgan|o‘chirilgan|yoqish|o‘chirish|mavzu\w*|misol\w*|qoida\w*|tushuntirish|ma’no\w*|tarjima\w*|eslatma\w*|belgi\w*|seriya\w*|jon|kombo|yutuq\w*|sovg‘a|ochiq|yopiq|qulf\w*|eng|juda|ko‘p|kam|katta|kichik|yaxshi|zo‘r|qiyin|oson|o‘rta)\b/i;

/** Kod emas, foydalanuvchiga ko'rinadigan o'zbekcha matnmi? */
export function isUzText(s: string): boolean {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length < 2 || !/[A-Za-zА-Яа-я]/.test(t)) return false;
  if (/^(#\/|\/|https?:|www\.|data:|mailto:|bandly\.|[a-z][\w-]*\.[a-z]{2,4}$)/i.test(t)) return false; // yo'l, URL, fayl
  if (/^[a-z0-9_.:-]+$/.test(t)) return false;                    // id, kalit, css klass
  if (/^[a-z][\w-]*( [a-z][\w-]*)+$/.test(t) && !UZ_WORDS.test(t)) return false; // "btn primary sm"
  return /[‘’ʻ]/.test(t) || UZ_WORDS.test(t) || /[ʼ]/.test(t);
}

/** JSX matni uchun kengroq qoida: matn tugunidagi istalgan so'z ko'rinadi (ingliz atamalari ham tarjimaga beriladi). */
export function isJsxText(s: string): boolean {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length >= 2 && /[A-Za-z]{2,}/.test(t) && !/^[\d\s.,:;·/%+–—-]+$/.test(t);
}

/** JSX atributlari: shulardagi matn ko'rinadi yoki ekran o'quvchi o'qiydi. */
export const TEXT_ATTRS = new Set(['title', 'placeholder', 'aria-label', 'alt', 'label', 'text', 'summary', 'aria-description', 'aria-roledescription']);
