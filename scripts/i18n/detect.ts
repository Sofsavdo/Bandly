// Tabiiy til matnini (tarjima qilinadigan) koddan ajratish qoidalari — extract, codemod va guard testi uchun umumiy.
export const UZ_WORDS = /\b(va|yoki|bilan|uchun|emas|kerak|qiling|bo‘l\w*|bo'l\w*|ta|sahifa\w*|dars\w*|savol\w*|javob\w*|bepul|daqiqa\w*|kun\w*|hisob\w*|ustoz\w*|xato\w*|tanlang|boshla\w*|tugat\w*|kirish|chiqish|natija\w*|daraja\w*|mashq\w*|so‘z\w*|o‘yin\w*|reja\w*|vazifa\w*|qoldi|siz\w*|men|biz|bu|shu|har|hali|yana|keyin|oldin|qayta|yangi|eski|hamma|barcha|ochish|yopish|saqlash|yuborish|tekshir\w*|o‘tish|orqaga|davom\w*|to‘lov\w*|obuna\w*|tarif\w*|ball\w*|ovoz\w*|gap\w*|tinglash|o‘qish|yozish|gapirish|xatolar\w*|takror\w*|bosqich\w*|guruh\w*|liga\w*|reyting\w*|profil\w*|sozlama\w*|til|tilda|tilni|matn\w*|test\w*|imtihon\w*|vaqt\w*|soniya\w*|marta|kunlik|haftalik|oylik|yil\w*|oy|hafta\w*|ism\w*|laqab\w*|parol|kod\w*|nusxa\w*|yuklab|yuklash|ulash\w*|kuting|xatolik|muvaffaqiyat\w*|tayyor|yoqilgan|o‘chirilgan|yoqish|o‘chirish|mavzu\w*|misol\w*|qoida\w*|tushuntirish|ma’no\w*|tarjima\w*|eslatma\w*|belgi\w*|seriya\w*|jon|kombo|yutuq\w*|sovg‘a|ochiq|yopiq|qulf\w*|eng|juda|ko‘p|kam|katta|kichik|yaxshi|zo‘r|qiyin|oson|o‘rta)\b/i;

/** O'zbekchaga xos belgilar: o‘/g‘, "q" dan keyin "u" emas (maqsad, qadam), o'zbek qo'shimchalari va so'zlari. */
const UZ_EXTRA = /\b(xayrli|tong|kech|hazil|yumshoq|qattiq|jallod|mehmon|hammasi|aralash|kuchaytiring|tahlil|joylar|sayohat|sifatlar|zamonlar|predloglar|artikllar|idiomalar|kollokatsiyalar|taqqoslash|nisbiy|majhul|shart|modal|fe‘l\w*|mahalla|mukammallik|tungi|shahar|murakkab|umumiy|ingliz|o‘zbek\w*|qadam\w*|birinchi|ikkinchi|ovchisi|yodlangan|o‘ynalgan|bosqich\w*|tayyorgarlik\w*|dushanba|seshanba|chorshanba|payshanba|juma|shanba|yakshanba|eshitish|lavha|iboralar\w*|tushunish|tinglab|ta‘lim|global|muammolar|uslubida|mashq|testi|tayyorgarligim|bajarildi|pauza|grammatika|sotib|olish|aytish|keyingi|topilmadi|baho\w*|talab|uyingiz|yopiq|ochiq|tugallangan)\b/i;
const UZ_SUFFIX = /\b[a-z‘’]{3,}(lar|larni|larga|lardan|dagi|gacha|ingiz|imiz|sizmi|moq|ladi|yapti|moqda)\b/i;
export const looksUz = (t: string): boolean => /[og][‘ʻ’]|[‘ʻ]|[ʼ]|\b[og]'[a-z]|[a-z][‘ʻ][a-z]|[a-z]’(?!(s|t|m|re|ve|ll|d)\b)[a-z]|^(Joy|Ravish|Sifat|Ot|Olmosh|Ega|Inkor|Odat|Farq|Faraz|Passiv|Egalik|Tenglik|Natija|Shart|Misol|Qoida)\b|^dan\b/i.test(t) || /q(?!u)[a-z]/i.test(t.replace(/\b(IELTS|Iraq|Qatar|FAQ)\b/g, '')) || UZ_WORDS.test(t) || UZ_EXTRA.test(t) || (UZ_SUFFIX.test(t) && /\s/.test(t));

/** Kod emas, foydalanuvchiga ko'rinadigan o'zbekcha matnmi? (oddiy satrlar uchun — id va klasslarni chetlab o'tadi) */
export function isUzText(s: string): boolean {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length < 2 || !/[A-Za-zА-Яа-я]/.test(t)) return false;
  if (/^(#\/|\/|https?:|www\.|data:|mailto:|bandly\.|[a-z][\w-]*\.[a-z]{2,4}$)/i.test(t)) return false; // yo'l, URL, fayl
  if (/^[a-z0-9_.:-]+$/.test(t) && !UZ_EXTRA.test(t)) return false;  // id, kalit, css klass
  if (/^[a-z][\w-]*( [a-z][\w-]*)+$/.test(t) && !UZ_WORDS.test(t) && !UZ_EXTRA.test(t)) return false; // "btn primary sm"
  return looksUz(t);
}
/** Shablon matni (`${n} savol`) uchun: bitta so'z ham bo'lishi mumkin, lekin yo'l/klass emas. */
export function isUzTemplate(parts: string[]): boolean {
  const t = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!/[A-Za-z]{2,}/.test(t) || /(#\/|\/api|https?:|\.(mp3|png|svg|json)|^[\w-]*$)/.test(parts.join('').trim()) && !looksUz(t)) return false;
  if (/^[a-z][\w-]*( [a-z][\w-]*)*$/.test(t) && !looksUz(t)) return false;
  return looksUz(t);
}

/** JSX matni uchun kengroq qoida: matn tugunidagi istalgan so'z ko'rinadi (ingliz atamalari ham tarjimaga beriladi). */
export function isJsxText(s: string): boolean {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length >= 2 && /[A-Za-z]{2,}/.test(t) && !/^[\d\s.,:;·/%+–—-]+$/.test(t);
}

/** JSX atributlari: shulardagi matn ko'rinadi yoki ekran o'quvchi o'qiydi. */
export const TEXT_ATTRS = new Set(['title', 'placeholder', 'aria-label', 'alt', 'label', 'text', 'summary', 'aria-description', 'aria-roledescription']);

// Dars kontenti uchun qat'iyroq: inglizcha misollar tasodifan tarjimaga tushmasin (en: "ten men" kabi).
const UZ_STRICT = /[og][‘ʻ]|\b(va|yoki|bilan|uchun|emas|kerak|qiling|bo‘l\w*|so‘z\w*|gap\w*|fe’l\w*|ot|sifat\w*|zamon\w*|misol\w*|ma’no\w*|qoida\w*|savol\w*|javob\w*|ishlatiladi|yoziladi|aytiladi|bo‘ladi|qo‘shiladi|hozir|o‘tgan|kelasi|ko‘plik|birlik|inkor|so‘roq|darajasi|haqida|nima|qanday|qachon|qayerda|nega|kim|men|sen|u|biz|siz|ular)\b/i;
/** Ma'lumot maydoni o'zbekcha matnmi: maydon nomi *Uz/uz yoki matnning o'zi aniq o'zbekcha. Inglizcha maydonlar (en, text, sentence, options...) — yo'q. */
export function isUzContent(key: string, s: string): boolean {
  const t = s.trim();
  if (t.length < 2 || !/[A-Za-z]/.test(t)) return false;
  if (/^(en|text|sentence|sentences|q|question|options|answer|answers|correct|example|model|title|transcript|script|passage|word|words|ipa|audio|url|id|kind|level|pos|accept)$/i.test(key)) return /uz$/i.test(key) || (key === 'title' && (/[og][‘ʻ]|[a-z][‘ʻ][a-z]|\b(va|bilan|uchun)\b/i.test(t) || UZ_EXTRA.test(t)));
  if (/uz$/i.test(key)) return true;
  if (/^(topic|name|label|tag|group|category|labelUz|nameUz)$/i.test(key) && /[A-Za-z]{3,}/.test(t) && t.length < 60) return true; // ko'rinadigan nomlar (mavzu, xarakter, guruh)
  if (/[a-z][‘ʻ][a-z]|\b[og]'[a-z]/i.test(t)) return true;
  if (/^[A-Z][a-z]+( [a-z]+)* [a-z]+[.?!]$/.test(t) && !/[og][‘ʻ]/.test(t)) return false; // inglizcha gap
  return /[og][‘ʻ]/.test(t) || UZ_EXTRA.test(t) || /q(?!u)[a-z]/i.test(t.replace(/\b(IELTS|Iraq|Qatar)\b/g, '')) || (UZ_STRICT.test(t) && /[‘ʻ’]|\b(va|bilan|uchun|emas|kerak)\b/.test(t)) || (UZ_SUFFIX.test(t) && !/\b(the|a|an|is|are|of|to|and)\b/i.test(t));
}
