# Sellzen — 2-audit: ovozli ustoz, kontent to'liqligi, navigatsiya (2026-11-21)

Manba: kod (`main` + branch), avtomatik kontent hisobi (skript bilan), Playwright (360 px), Railway loglari.

## 1. Sellzen ovozli ustoz — shikoyatlar va tuzatishlar

| Shikoyat | Sabab (kodda) | Tuzatish (branchda, testlar bilan) |
|---|---|---|
| Ispan, portugal, xitoy tillarida gapiradi | Gemini Live tilni ovozdan o'zi aniqlaydi; o'zbekcha/shovqinli ovoz boshqa til deb tanilsa, model o'sha tilda javob beradi. Ko'rsatmada taqiq zaif edi | Ko'rsatma: faqat ingliz + o'quvchi tili. **Server himoyasi**: ustoz matnida boshqa yozuv (xitoy, koreys, arab…), o'zbek uchun kirill yoki ispan/portugal so'zlari chiqsa — ovoz uziladi, mijozda to'xtatiladi, modelga "faqat ingliz/o'zbek, qayta so'ra" ko'rsatmasi yuboriladi. Logda `til-xato:N` |
| Eshitmasa o'zicha gapiraveradi | "Taxmin qilma" qoidasi yo'q edi | Noaniq/boshqa tildagi ovoz — tanish xatosi: javob bermaydi, bitta qisqa gap: "Eshitmadim, qattiqroq gapir!" (18+ da qo'polroq) |
| Javob kech keladi, real-time emas | Gap tugashini aniqlash standart (uzun jimlik kutadi) | `realtimeInputConfig`: gap tugashiga yuqori sezgirlik, 600 ms jimlik (`LIVE_SILENCE_MS`). Qo'shimcha: server **San-Fransiskoda** — Toshkentdan har yo'nalishda ~250 ms; Amsterdam regioniga ko'chirish real-time hissini sezilarli yaxshilaydi (egasi qarori) |
| Har safar "Men Sellzen AI man" deydi | Persona matni har qo'ng'iroqda tanishtirishni buyurgan | Faqat **birinchi** qo'ng'iroqda (server bo'yicha, boshqa qurilmada ham to'g'ri). Keyin — ismsiz, darhol savol |
| "Sellzen" deyish yetarli | — | Ko'rsatma, interfeys, persona, imtihonchi gapi: "Sellzen" (`BRAND.ai`). Eslatma: o'zgargan o'zbekcha matnlarning ru/kk/ky/tg tarjimalari Studio'da qayta tarjima qilinishi kerak |
| Xatolarni eslab qolmaydi | Xotira yo'q edi | Har qo'ng'iroqdan keyin (≥3 o'quvchi navbati) suhbat yozuvi matn modeli bilan xato→to'g'ri juftlari va mavzularga aylantiriladi (`coach_memory`, shaxsiy ma'lumot filtri). Keyingi qo'ng'iroq shu xatolardan birini tekshirishdan boshlanadi |
| Inglizchaga o'tsa faqat inglizcha davom etadi | "Bitta javobda bitta til" qoidasi (ovoz sintezi uchun yozilgan) Live'da ham bor edi | Live: amaliyot ingliz tilida, tuzatishdan keyin **qisqa izoh ona tilida**, aralash gapirish ruxsat; A1–A2 da ko'proq ona tili |

Hali qolgan (ovoz):
- **Talaffuz bahosi yo'q** — faqat matn bo'yicha. Akustik baholash (masalan Azure Pronunciation Assessment) alohida loyiha.
- Qo'ng'iroq uzilsa davom ettirish (session resumption) yo'q — `goAway` da qayta boshlash kerak.
- Matnli zaxira rejim (`/api/ai/coach`, Live o'chiq bo'lganda) hali "bitta til" qoidasida — TTS bitta ovoz bilan gapirgani uchun.

## 2. Kontent to'liqligi (avtomatik hisob)

| Bo'lim | Hozir | Yetarlimi | Tavsiya |
|---|---|---|---|
| General English darslari | 48 bo'lim, 144 dars, 1 584 mashq (har darajada 24 dars, ~11 mashq/dars, 9–12 daq) | **Tuzilma yaxshi, hajm kam**: har daraja ~4–5 soat. CEFR bo'yicha bir daraja ~100–200 soat o'qishni talab qiladi | Har darajaga 2–3× ko'proq dars; ayniqsa C1–C2 (24 tadan) |
| Darslar holati | **Hammasi `pilot`**, metodist ko'rigidan o'tmagan | Pullik mahsulot uchun xavf | Metodist ko'rigi + ko'rik jurnali (`docs/content-reviews/`) |
| Avtomatik sifat | Javob indekslari to'g'ri; 6 ta mashqda izoh yo'q/juda qisqa (b1-u5-l2, b1-u7-l1, b2-u6-l1, c1-u5-l2, c2-u3-l3), c1-u5-l3 da takroriy variant; IELTS kursida 5 ta mashq 2 variantli, 2 tasi izohsiz | Kam, tuzatsa bo'ladi | Avtomatik test qo'shib, tuzatish |
| Media | Darslarda **0 ta** video/audio (faqat misollar ovozi) | Listening/real hayot suhbatlari uchun kam | Har bo'limga 1 ta qisqa dialog audio (ElevenLabs bor) |
| So'zlar | 1 074 ta: A1 111, A2 156, B1 257, B2 286, C1 264, **C2 0** | A1 juda kam (odatda ~500), C2 yo'q | A1–A2 ga +600, C2 qo'shish |
| Grammatika | 16 mavzu, 80 savol | Kam | 40+ mavzu, har biriga 15–20 savol |
| Daraja testi | 20 savol, har darajaga 4 ta (A1–C1), C2 va listening yo'q | Natija aniqligi past | 40–60 savollik bank, listening qismi, C2 |
| IELTS Reading | 21 test, shundan faqat **3 tasi to'liq** (35–40 savol) | To'liq mock uchun kam | Kamida 10 ta to'liq Academic + 5 ta General Training |
| IELTS Listening | 20 test, **1 tasi to'liq** (40 savol) | Kam | Kamida 10 ta to'liq test |
| CEFR Multilevel | 1 Reading + 1 Listening to'plami | Juda kam (O'zbekistonda asosiy imtihon!) | 10+ to'plam, Writing/Speaking formatlari |
| Digital SAT | 8 R&W + 9 Math | Ramziy | Ustuvorlik pastroq (bozor kichikroq) |
| Speaking | Part 1: 51, Part 2: 50 | Yetarli | — |
| Writing | Task 1: 15, Task 2: 39 | Yetarli | Task 1 ga grafik turlari ko'paytirilsin |
| Real hayot sahnalari | 10 ta | Kam | 30+ |

**Ustuvorlik (O'zbekiston bozori uchun):** 1) CEFR Multilevel to'plamlari, 2) to'liq IELTS mocklar, 3) A1–A2 so'z va dars hajmi, 4) metodist ko'rigi, 5) daraja testi banki.

## 3. Navigatsiya — mijoz adashadimi?

| Topilma | Holat |
|---|---|
| Telefonda pastki menyu faqat ikonkalar edi (yozuvlar CSS bilan yashirilgan) | **Tuzatildi**: Asosiy · Ingliz tili · AI ustoz · Imtihon · Profil |
| Yangi foydalanuvchi: kirish → shaxsiy reja savolnomasi → daraja testi → bosh sahifa | Mantiqiy, majburiy qadamlar aniq |
| Bosh sahifa | Asosiy tugma aniq ("Rejani boshlash"), lekin pastida bir xil darsga ikkinchi "Davom ettirish" kartasi, statistika, vazifalar, kun so'zi — uzun va takrorlanadi. Tavsiya: bitta asosiy harakat + yig'iladigan qo'shimcha bloklar |
| Menyu (7 bo'lim) | Tushunarli. Lekin landing sahifada asosiy mahsulot sifatida reklama qilingan **Mock Arena** menyuda alohida yo'q (Imtihon ichida), o'yinlar/duel "Mashq" va "Reyting" ichida yashiringan |
| Mehmon | Bosh sahifa, daraja testi, narxlar, duel taklifi ochiq; qolgani — Telegram orqali kirish |
| `sellzen.uz` (www'siz) DNS | Ochilmaydi — QR kodlar, SEO canonical. Egasi registratorda tuzatishi kerak |

## 4. Keyingi ishlar (ustuvorlik bo'yicha)

1. **Ovozli ustoz tuzatishlarini deploy qilish** (branchda tayyor) va 2–3 kun loglarda `til-xato` sonini kuzatish.
2. Railway regionini Amsterdamga ko'chirish (real-time ovoz uchun eng katta yutuq; egasi qarori).
3. `sellzen.uz` DNS, GitHub Actions billing.
4. Kontent: CEFR Multilevel to'plamlari → to'liq IELTS mocklar → A1–A2 hajmi → metodist ko'rigi.
5. Bosh sahifani soddalashtirish, Mock Arena'ni menyuga chiqarish.
6. O'zgargan matnlarni (Sellzen AI → Sellzen) Studio'da ru/kk/ky/tg ga qayta tarjima qilish.
