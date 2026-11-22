# Sellzen — to'liq texnik audit va tuzatishlar (2026-11-21)

Hujjat kodni o'qib, testlarni ishga tushirib va Railway loglarini ko'rib yozilgan. Har bir band: muammo, jiddiylik, sabab, fayllar, tuzatish, test, holat va tashqi bog'liqlik.
Maxfiy qiymatlar (kalitlar, tokenlar, env qiymatlari) bu hujjatda yo'q — faqat o'zgaruvchi **nomlari** keltirilgan.

Jiddiylik: **K** — kritik (pul, ma'lumot yoki xavfsizlik), **Y** — yuqori (asosiy funksiya yoki qaror uchun noto'g'ri raqam), **O** — o'rta, **P** — past.

## 1. Xulosa

| Ko'rsatkich | Qiymat |
|---|---|
| Tekshirilgan yo'nalishlar | 9 (kirish, analitika, hodisalar, AI/Live, zaxira, to'lov, xavfsizlik, bundle, hujjatlar) + lokalizatsiya |
| Tasdiqlangan va tuzatilgan muammolar | 12 |
| Tasdiqlanmagan (kod to'g'ri chiqdi) | 3 |
| Qaror bilan qoldirilgan / hujjatlashtirilgan | 4 |
| Interfeys tarjimasi | 2 101 matn × 5 til = 100% (test bilan majburiy) |
| Kontent tushuntirishlari tarjimasi | 5 702 matn × 5 til = 100% (test bilan majburiy) |

## 2. Tuzatilgan muammolar

| # | Muammo | J. | Sabab | Fayllar | Tuzatish | Test | Holat |
|---|---|---|---|---|---|---|---|
| 1 | Admin "daraja testi → ro'yxat" foizi 100% dan oshishi mumkin edi | Y | Ikki xil to'plam (hodisa soni va o'yinchilar soni) bo'lingan; vaqt oynasi mos emas | `server/analytics.ts`, `src/pages/Admin.tsx` | Kogorta voronkasi: davrda ro'yxatdan o'tganlarning daraja testi / dars / mock / to'lov ≥1 / qayta to'lov ≥2 ulushi, oldingi teng davr bilan farq | `server/analytics.test.ts` (kogorta raqamlari, eski o'yinchining to'lovi kogortaga kirmasligi) | Tuzatildi |
| 2 | Bir IP ortidagi turli foydalanuvchilar bitta deb sanalardi; IP almashsa bitta foydalanuvchi ikki marta | Y | Deduplikatsiya IP bo'yicha | `server/events.ts`, `src/lib/track.ts`, `server/index.ts` | Anonim brauzer ID (`bandly.vid`), serverda tuzli sha256; jami va noyob alohida; 10 daqiqada 120 hodisa chegarasi; 180 kun saqlash | `server/analytics.test.ts` (umumiy IP → 3 noyob; IP o'zgarsa takror; xom IP/ID saqlanmaydi; suiiste'mol 10/130 rad) | Tuzatildi |
| 3 | Voronkada landing, ro'yxat boshlash, narxlar, to'lovni boshlash qadamlari yo'q edi | O | Hodisalar yuborilmagan | `src/pages/Home.tsx`, `src/pages/Pricing.tsx`, `src/lib/pay.ts`, `server/events.ts` | `landing_view`, `signup_start`, `pricing_view`, `checkout_start` | analytics test | Tuzatildi |
| 4 | Admin to'lov ro'yxatlari "to'lagan" sonini 0 ko'rsatardi | K | Kod `'paid'` holatini qidirgan, bazada `'success'` | `server/adminUsers.ts`, `server/leads.ts`, `src/components/AdminOps.tsx` | `'success'` ishlatiladi | `server/leads.test.ts`, `server/adminUsers.test.ts` (regressiya) | Tuzatildi |
| 5 | Production'da to'lov sozlanmasa demo (bepul obuna) yoqilib qolishi mumkin edi | K | Demo shartsiz `!HAMYON` | `server/pricing.ts` (`demoMode`), `server/index.ts` | To'lov ulangan bo'lsa demo yo'q; `PAY_DEMO` aniq qiymati ustun; aks holda faqat `NODE_ENV !== 'production'` | `server/payments.test.ts` | Tuzatildi |
| 6 | Zaxira ishlayaptimi — ko'rinmasdi | Y | Holat saqlanmagan | `server/autoBackup.ts`, `server/index.ts`, `src/pages/Admin.tsx` | `backupStatus()`: oxirgi nusxa, soni, xato, tashqi ombor holati, 27 soatdan eski — ogohlantirish | `server/autoBackup.test.ts` (sozlanmagan, chala sozlangan, yuklash xatosi va tiklanish, buzuq baza, tiklangan faylni o'qish) | Tuzatildi |
| 7 | `BACKUP_S3_*` chala sozlansa jim o'chib qolardi | O | Chala konfiguratsiya "yo'q" deb qabul qilingan | `server/offsite.ts` | Yetishmagan o'zgaruvchi nomlari bilan xato | `server/offsite.test.ts` | Tuzatildi |
| 8 | Live suhbat o'rtasida uzilsa foydalanuvchi sababini bilmasdi | O | Xato holati faqat ulanishda belgilangan | `src/pages/Coach.tsx` | Suhbat o'rtasidagi xato ham oddiy ovozli rejimga o'tkazadi va xabar beradi | qo'lda (kod yo'li); avtomatik test yo'q | Tuzatildi |
| 9 | Bot telefon raqamidan keyin jim qolardi | Y | `sendPhoto` URL orqali — Telegram faylni yuklay olmagan | `server/telegram.ts`, `server/botFlow.ts`, `server/index.ts` | Fayl yuklanadi, `file_id` keshlanadi, rasm bo'lmasa matn | `server/botFlow.test.ts` | Tuzatildi (PR #72) |
| 10 | Interfeys faqat qisman tarjima qilingan; tarjimalar faqat bazada (AI) | Y | Kodda tarjima manbai yo'q edi | `src/i18n/locales/*.json`, `server/i18n.ts`, `scripts/i18n/*` | 2 101 interfeys/server/bot matni 5 tilda kodda; server birlashtiradi; til interfeys 100% bo'lganda yoqiladi | `scripts/i18n/locales.test.ts` | Tuzatildi |
| 11 | Reja kartasidagi 6 ta xato turi nomi tarjima qilinmasdi | P | `L()` ga o'ralmagan | `src/components/PlanCard.tsx` | `L()` | locales test (interfeys 100%) | Tuzatildi |
| 12 | Katalogga SQL, server loglari, ovoz ID kabi texnik qatorlar tushardi | P | Extractor filtri tor | `scripts/i18n/extract.ts`, `src/i18n/keep-english.json` | Texnik va inglizcha imtihon qatorlari chiqarib tashlanadi | extract + locales test | Tuzatildi |

## 3. Tekshirilib, muammo topilmaganlar

| Yo'nalish | Natija |
|---|---|
| SQL injection | So'rovlar parametrli (`?`); satr ichiga qo'yiladigan qiymatlar faqat kod konstantalari |
| Xavfsiz bo'lmagan HTML | `dangerouslySetInnerHTML` foydalanuvchi matni bilan ishlatilmaydi |
| Bot tokeni | Repoda yo'q (qidiruv bilan tekshirildi); faqat Railway `TELEGRAM_BOT_TOKEN` da |

## 4. Qaror bilan qoldirilgan / hujjatlashtirilgan

| Masala | Qaror |
|---|---|
| Mehmon kirishi | Egasining qarori: faqat landing va SEO sahifalari ochiq. Ochiq `getDuel` faqat laqab, ball va so'zlarni qaytaradi — maqbul |
| Ikkinchi Live provayder | Qo'shilmadi; zaxira — avtomatik oddiy ovozli rejim |
| Bundle bo'lish | Asosiy bo'lak 1.67 MB (gzip 547 KB), asosan dars kontenti (≈574 KB) va IELTS (≈148 KB) — sinxron ishlatiladi, hozir bo'lish foyda bermaydi |
| Narxlar | O'zgartirilmadi (tasdiq kerak) |

## 5. Lokalizatsiya

| Qatlam | uz | ru | en | kk | ky | tg |
|---|---|---|---|---|---|---|
| Interfeys, server xabarlari, bot (2 101 matn) | manba | 100% | 100% | 100% | 100% | 100% |
| Sahifa sarlavhasi va meta tavsif (ish vaqtida) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Bot (Telegram `language_code` bo'yicha) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Dars va mashq tushuntirishlari, ko'rsatmalar, glossariy, mock tavsiflari (5 702 matn) | manba | 100% | 100% | 100% | 100% | 100% |
| Jami katalog (7 803 matn) | manba | 100% | 100% | 100% | 100% | 100% |
| SEO vositalar sahifalari | ✓ | ✓ | — | — | — | — |

Katalog avtomatik yig'iladi (`scripts/i18n/extract.ts`); evristika o'tkazib yuboradigan aralash satrlar (formulalar «sifat + ly», ko'rsatmalar «(inkor)») `src/i18n/extra-content.json` da qo'lda ro'yxatlangan va kontentda borligi tekshiriladi. Ish vaqtidagi tekshiruv (ilova tarjima qiladigan modullar → barcha kontent modullari) tarjima qilinmagan o'zbekcha satr qoldirmadi; qolgan 35 ta satr — inglizcha o'quv materiali va identifikatorlar.

Inglizcha o'quv materiali himoyasi: so'zlar, misol gaplar, matnlar, skriptlar, AI ko'rsatmalari va javob variantlari katalogga kirmaydi (`englishOnly`, `keep-english.json`); qo'shtirnoq ichidagi inglizcha iboralar har bir tarjimada harfma-harf saqlanishi test bilan tekshiriladi.

Terminlar lug'ati (izchillik uchun): dars — урок / сабақ / сабак / дарс; daraja — уровень / деңгей / деңгээл / сатҳ; obuna — подписка / жазылым / жазылуу / обуна; duel — дуэль / жарыс / беттеш / дуэл; brendlar (Sellzen, IELTS, CEFR, SAT, Mock Arena, XP) tarjima qilinmaydi.

## 6. Ochiq ishlar va tashqi bog'liqliklar

| Ish | Kim | Izoh |
|---|---|---|
| Tarjimalarni ona tilida so'zlashuvchi muharrir ko'rib chiqishi | jamoa / metodist | Tarjimalar to'liq, lekin inson-muharrir tekshiruvi o'tkazilmagan (ayniqsa kk/ky/tg); tuzatishlar `src/i18n/locales/*.json` ga |
| Yangi kontent qo'shilganda tarjima | jamoa | locales test endi butun katalogni talab qiladi — tarjimasiz yangi o'zbekcha matn CI ni yiqitadi |
| SEO sahifalarini en/kk/ky/tg ga kengaytirish | jamoa | hreflang va sitemap bilan |
| Tashqi zaxira | ega | `BACKUP_S3_*` o'zgaruvchilari |
| Bot tokenini almashtirish | ega | Chatda ko'rsatilgan; BotFather'da yangilab Railway `TELEGRAM_BOT_TOKEN` ga qo'yish |
| Telegram Login domeni | ega | BotFather → `/setdomain` |
| Sozlanmagan ixtiyoriy env | ega | `TG_REMINDERS`, `REF_PLAN_DAYS`, `AI_BACKUP_*`, `LIVE_FREE_GLOBAL_DAILY_MINUTES`, `AI_PRICE_*` / `PRICE_LIVE_*` |
| Shaxsiy ma'lumotlar (telefon) | ega | O'zbekiston qonunchiligi bo'yicha saqlash joyi bo'yicha yuridik maslahat |
| Production i18n qamrovi | — | Sessiya proksi sayt domenini to'sadi; Railway loglari orqali tekshiriladi |

## 7. Tekshiruv buyruqlari

```bash
npx tsx scripts/i18n/extract.ts
npx tsx scripts/i18n/locales.test.ts
npx tsc --noEmit -p .
npm run test:ci
npx vite build
```
