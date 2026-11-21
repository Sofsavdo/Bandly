# Sellzen (sellzen.uz) — chuqur tahlil va o'sish rejasi (2026-11-21)

Manbalar: GitHub kodi (`main`, 71c9c85), Railway (Sellzen / production, oxirgi 7 kun loglari va metrikalari),
lokal production build (mobil emulyatsiya), raqobatchilar bo'yicha ochiq manbalar.

## 1. Hozirgi holat — qisqacha

| Soha | Holat | Baho |
|---|---|---|
| Kontent | 144 dars (A1–C2), 41 bepul test, 1074 so'z, IELTS kursi (36 dars), 100+ Speaking mavzu, 54 Writing topshiriq | Kuchli — raqobatchilarning ko'pchiligidan keng |
| Texnik sifat | ~35k qator TypeScript, 90+ test fayli, hammasi o'tadi, build toza | Yaxshi |
| AI | Gemini (matn + Live ovoz), ElevenLabs TTS/STT | Ishlaydi, lekin bitta provayderga bog'liq — uzilishlar bor |
| To'lov | Hamyon (kartaga o'tkazma) ulangan | Ishlaydi; Payme/Click yo'q |
| Kirish | Faqat Telegram orqali | O'zbekiston uchun to'g'ri tanlov |
| Trafik | 7 kunda ~4,5 ming so'rov, bir necha faol IP | Hali traction yo'q — o'sish bosqichidan oldin |
| Server | Railway, **sfo (San-Fransisko)** regioni, 1 instance, SQLite + volume | Toshkentdan uzoq; deploylarda uzilish |

## 2. Topilgan xatolar va kamchiliklar

### Tuzatildi (shu branchda)
1. **Buzuq URL → 500 xato.** Skaner `//%2e%2e%2f.env` yuborganda `new URL()` yiqilib 500 qaytardi (Railway logida stack trace). Endi 400.
2. **AI bitta provayderga bog'liq.** 19-noyabr loglarida Gemini'ning uchala modeli ham 503/timeout bergan — AI ustoz ishlamay qolgan. `AI_BACKUP_PROVIDER/API_KEY/MODEL` qo'shildi: Gemini band bo'lsa yoki kalit/mablag' tugasa avtomatik boshqa provayderga (masalan Claude Haiku) o'tadi. Testlar bilan.
3. **Mehmon faqat bosh sahifani ko'rardi.** Bosh sahifada "3 daqiqalik daraja testi" va'da qilingan, lekin uni ochish uchun ro'yxatdan o'tish shart edi; narxlarni ham ko'rib bo'lmasdi. Endi `#/placement` va `#/pricing` mehmonga ochiq; bosh sahifadagi asosiy tugma — "Darajamni aniqlash".
4. **Daraja testi natijasida ulashish yo'q edi.** "Telegramda ulashish" ("Mening darajam B1. Sen ham 3 daqiqada tekshir!") va mehmon uchun "Bepul ro'yxatdan o'tish" tugmasi qo'shildi.
5. **Log shovqini.** Har ishga tushishda `ExperimentalWarning: SQLite` "error" sifatida yozilardi — o'chirildi. Production repodagi `Dockerfile` bilan quriladi (2026-11-21 build logida tasdiqlandi); flag Dockerfile CMD'da va `npm start` skriptida ham bor.

### Hali qolgan (egasining qarori yoki kattaroq ish kerak)
| # | Muammo | Dalil | Tavsiya |
|---|---|---|---|
| A | **Server regioni sfo** | Volume `region: sfo`; foydalanuvchilar Uzbektelecom IP'laridan | Railway'da regionni **Europe West (Amsterdam)** ga ko'chirish: kechikish ~250ms → ~80ms. Volume ko'chadi, oldin zaxira oling |
| B | **Har deployda 15 soniyagacha uzilish** | HTTP logda `connection dial timeout` 502'lar; 18-noyabrda 10+ deploy | Volume bor servisda Railway eski va yangi nusxani bir vaqtda ishlatmaydi. Healthcheck (`/api/health`) allaqachon sozlangan (2026-11-21 tekshirildi) — uzilish volume qayta ulanishidan. Yechim: deployni kechasi qiling, o'zgarishlarni bitta deployga yig'ing |
| C | **JS bundle 1,74 MB (gzip 569 KB)** | `vite build` | 3G/4G'da birinchi ochilish sekin. Sahifalarni `React.lazy` bilan bo'lish (i18n "boot" tartibini saqlagan holda) — keyingi ish |
| D | **Hash-routing (`#/...`)** | Google `#/` sahifalarni alohida indekslamaydi | SEO trafik faqat `public/vositalar/*.html` statik sahifalardan keladi. Ko'proq statik SEO sahifa yarating (pastga qarang) |
| E | **Telegram bot hali `@Bandly_robot`** | Railway log | Rebrend tugashi uchun `@SellzenBot` kabi yangi nom (BotFather'da username o'zgartirib bo'lmaydi — yangi bot + eski botda yo'naltirish xabari) |
| F | **Duel havolasi mehmonga yopiq** | `authRoute` | Do'st havolani ochganda avval login ko'radi. Duel sahifasida mehmonga "X sizni chaqirdi, ball: 870" ko'rsatib, keyin Telegram login so'rash — virallik uchun eng muhim o'zgarish |
| G | **To'lov faqat kartaga o'tkazma** | Logda bitta bekor qilingan to'lov (129 000) | Payme/Click (yoki Uzum) qo'shish — konversiyani sezilarli oshiradi |

## 3. Raqobatchilar (O'zbekiston, 2026-noyabr)

| Raqobatchi | Nima beradi | Sellzen'dan farqi |
|---|---|---|
| [Multitest.uz](https://multitest.uz/) | CEFR Multilevel mock, AI Speaking/Writing, bepul | Multilevel'ga to'liq yo'naltirilgan, kompyuter imtihoni simulyatori |
| [Mocky.uz](https://mocky.uz/) | IELTS mock, real imtihon interfeysi nusxasi | Faqat mock; o'quv kursi yo'q |
| [MyMockExam.uz](https://mymockexam.uz/en) | Bepul IELTS/CEFR mock | Faqat mock |
| [MockCenter.uz](https://mockcenter.uz/en) | IELTS, CEFR, SAT, DTM, hatto haydovchilik testlari | Keng, lekin sayoz |
| [ENWIS](https://www.enwis.uz/en) | IELTS, CEFR, DTM; AI Speaking | Eng yaqin to'liq raqobatchi |
| [CEFR AI](https://www.cefrai.uz/) | AI Writing/Speaking feedback, **29 000 so'm/oy dan** | Narx bo'yicha bosim — Sellzen 69–129 ming |
| [ScoreUp](https://play.google.com/store/apps/details?id=com.score_up.uz) | Android ilova, IELTS/CEFR mock | Play Market'da bor — Sellzen'da native ilova yo'q |
| [IELTS Buddy](https://ieltsbuddy-landing.pages.dev/) | Telegram Mini App ichida AI Speaking | Telegram'da — xuddi Sellzen kabi |
| Makon AI | $380k investitsiya, 50k+ foydalanuvchi, shaxsiy o'quv rejasi ([manba](https://digitalbusiness.kz/en/2026-10-12/19-year-old-uzbek-founder-launched-an-ai-exam-prep-startup-and-raised-380000/)) | Eng kuchli moliyalangan raqobatchi |
| Global: Duolingo, Praktika, Speak, ELSA | O'yinlashtirish, AI suhbat | O'zbekcha tushuntirish yo'q, IELTS/Multilevel formatida emas |

**Xulosa:** "Mock test" bozori to'lib ketgan va bepul. Sellzen'ning ustunligi mock'da emas, balki:
**(1) o'zbekcha tushuntiradigan AI ustoz + ovozli suhbat, (2) A1 dan IELTS/Multilevel gacha bitta yo'l, (3) o'yinlashtirish (duel, liga, boss).**
Pozitsiya: *"Ingliz tilini noldan IELTS 7 gacha — o'zbekcha AI ustoz bilan"*, mock esa bepul jalb qilish vositasi.

## 4. Tez viral bo'lish rejasi (O'zbekiston → Markaziy Osiyo)

O'zbekistonda o'sish kanallari: **Telegram** (kanallar, guruhlar, Mini App), **Instagram Reels / TikTok**, **o'quv markazlari va maktab o'qituvchilari**.

### Mahsulot ichidagi viral halqalar (ustuvorlik tartibida)
1. **Ro'yxatsiz qiymat → ulashish.** Daraja testi (bajarildi) → natija kartasi rasm sifatida (PNG, Instagram story o'lchamida 1080×1920: "Mening darajam B2 · IELTS ~6.0 · sellzen.uz") — Telegram/Instagram'da ulashish.
2. **Duel mehmonga ochiq** (F band). "Do'stingni chaqir" — g'olib ikkalasiga ham XP. Duel natijasi ham kartochka.
3. **Referal:** taklif qilgan va taklif qilingan — ikkalasiga 7 kunlik All Access. (Server tomonida `referral.ts` bor — mukofotni kuchaytirish kifoya.)
4. **Guruh/sinf rejimi o'qituvchilar uchun bepul** (`groups.ts` bor): o'qituvchi 30 o'quvchini qo'shadi → 30 ta yangi foydalanuvchi. O'quv markazlarga "bepul uy vazifasi platformasi" sifatida taklif qiling.
5. **Haftalik liga Telegram kanalida e'lon** (top-10 laqablar) — ijtimoiy isbot.
6. **Sertifikat** (bor): to'liq mockdan keyin chiroyli sertifikat + QR tekshiruv — LinkedIn/Instagram'da ulashiladi.

### Marketing (deyarli bepul)
- **"AI ustoz so'kadi" kontenti** — "Jallod" rejimidagi kulgili Speaking lavhalari (ekran yozuvi) Reels/TikTok uchun ideal viral format. 18+ cheklovni saqlang.
- Haftasiga 3 ta Reels: "IELTS'da o'zbeklar qiladigan 5 xato", "Band 5 vs Band 7 javob".
- Telegram IELTS kanallari (100k+) bilan barter: kanal obunachilariga 1 oy bepul promo-kod.
- **Kreator dasturi** (`creator.ts` bor): bloger o'z kodi orqali kelgan to'lovlardan 20–30%.
- SEO: statik sahifalar (`public/vositalar`) ko'paytirilsin — "IELTS band kalkulyator", "Multilevel ball hisoblash", "IELTS Speaking Part 2 mavzulari 2026", "CEFR B2 qancha ball" — o'zbek va rus tilida.

### Narx (raqobatga mos)
- Hozirgi 69/99/129 ming so'm CEFR AI (29k) va bepul mock saytlariga nisbatan baland. Tavsiya: **49 000 so'm/oy** asosiy tarif, **haftalik 15 000** (o'quvchilar uchun psixologik oson), imtihon oldi "30 kunlik intensiv" paketi. Railway'da `PLAN_PRICE_*` bilan kodni o'zgartirmasdan sinab ko'rish mumkin.

### Markaziy Osiyoga kengayish
- i18n tizimi tayyor (≥98% tarjima bo'lgan til avtomatik yoqiladi). Navbat: **rus** (butun mintaqa), **qozoq** (Qozog'istonda IELTS talabi katta; ENT), **qirg'iz**, **tojik**.
- Har mamlakatning milliy imtihoni: O'zbekiston — Multilevel/DTM, Qozog'iston — ENT ingliz tili, Qirg'iziston — ORT.
- To'lov: Qozog'istonda Kaspi, Qirg'izistonda Mbank/Elsom.

## 5. 30 kunlik ish rejasi

| Hafta | Ish |
|---|---|
| 1 | Railway: Amsterdam regioniga ko'chirish, `AI_BACKUP_*` (Claude Haiku) qo'shish, healthcheck. Duel mehmonga ochiq. Natija kartochkasi (PNG). |
| 2 | Payme/Click. Narx testi (49k). Yangi Telegram bot nomi. 5 ta yangi SEO sahifa. |
| 3 | O'quv markazlar uchun bepul guruh rejimi taklifi (10 ta markaz). Reels kontent zavodi (haftasiga 3). |
| 4 | Rus tili (to'liq tarjima). Bundle bo'lish (tez ochilish). Natijalarni o'lchash: kunlik faol, daraja testi → ro'yxat konversiyasi, ro'yxat → to'lov. |

**O'lchanadigan maqsadlar (30 kun):** daraja testi → ro'yxatdan o'tish ≥ 35%, har yangi foydalanuvchidan ≥ 0,3 taklif (K-faktor), to'lovga o'tish ≥ 2%.

## 6. Bajarilish holati (2026-11-21, branch `claude/bandly-analysis-improvement-ywgxrb`)

| Reja bandi | Holat |
|---|---|
| Healthcheck | Railway'da allaqachon bor (`/api/health`); production `Dockerfile` bilan quriladi (build logi), ogohlantirish flag'i Dockerfile va start skriptida |
| AI zaxira provayderi | Kod tayyor (`AI_BACKUP_*`); kalitni Railway'ga qo'shish — egasi |
| Duel mehmonga ochiq | Bajarildi (+ duel havolasida referal kodi) |
| Natija kartochkasi PNG | Bajarildi: daraja testi natijasi 1080×1920 story, referal havolasi bilan |
| 5 ta SEO sahifa | Bajarildi: 5 uz + 3 ru sahifa, hreflang/canonical, FAQ; eski "Sellzen" logotipi tuzatildi |
| Referal: ikkala tomonga kunlar | Kod tayyor, standart o'chiq (`REF_PLAN_DAYS`, `REF_PLAN_MONTHLY_CAP`) — yoqish egasi qarori |
| Voronka o'lchovi | Bajarildi: anonim hodisalar, admin'da "daraja testi → ro'yxat" va referal ulushi; sovg'a obunalar to'lovchiga qo'shilmaydi |
| Bundle bo'lish | Qisman: xodim/sertifikat sahifalari alohida (app −87 KB); asosiy hajm — darslar kontenti, keyingi bosqich |
| Region (Amsterdam), bot nomi, narx testi, Payme/Click | Egasi qarori / shartnoma kerak |
| Xavfsizlik: WS crash (R1), token URL'da (R2) | Tuzatildi, regression testlar bilan |
| Tashqi zaxira (R4) | Kod tayyor: har kunlik nusxa S3-mos omborga (Railway Bucket) — bucket yaratish va `BACKUP_S3_*` — egasi |
| Mock natijasini ulashish | Bajarildi: story rasm, "taxminiy band" belgisi, referal havola |
| Bandly → Sellzen qoldiqlari | Tozalandi: ichki nomlar (CSS, audio worklet, Telegram callback, to'lov hodisasi, npm paket), hujjatlar (32+ fayl), bot ko'rinadigan nomi/tavsifi avtomatik. Ataylab qoldirilganlar va sabablari — README "Brend" jadvali |
