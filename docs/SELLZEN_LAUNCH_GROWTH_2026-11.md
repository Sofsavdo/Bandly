# Sellzen — yakuniy ishga tushirish va o'sish (grow) rejasi (2026-11-21)

Bu hujjat ikki savolga javob beradi: **ishga tushirishga nima tayyor, nima qolgan** va **birinchi 90 kunda qanday o'sish kerak**.
Raqamlar kod va Railway'dan olingan. Taxminlar alohida belgilangan.

---

## 1. Mahsulot holati (shu PR bilan)

| Yo'nalish | Holat |
|---|---|
| Kirish | Mehmon **faqat landingni** ko'radi (imkoniyatlar, "Qanday ishlaydi", narxlar, savollar). Qolgan hamma narsa — Telegram orqali bir bosishda ro'yxatdan o'tgandan keyin |
| Birinchi kirish | Ro'yxat → **maqsad va shaxsiy reja** (`#/start`, ustoz uslubi ham shu yerda) → **daraja testi** (`#/placement`). Bu ikki qadam bajarilmaguncha boshqa sahifalar ochilmaydi — har bir o'quvchi darajasi va maqsadini birinchi kundayoq biladi |
| General English | 144 dars (A1–C2, har darajada 24 ta), 1 584 mashq, Grammar (alohida bo'lim — darslarni to'ldiradi, takror emas), so'z o'yinlari |
| IELTS | 36 darslik kurs (Reading, Listening, Writing, Speaking strategiyalari) + mock testlar + AI Writing/Speaking baho |
| CEFR Multilevel | **Yangi: "O'rganish yo'li"** — daraja → shu darajadagi darslar → grammatika → o'qish/tinglash strategiyalari → mashq testlari → gapirish/yozish. Mashq to'plami hali kam (1 Reading + 1 Listening) |
| SAT | **Yangi: "O'rganish yo'li"** — B2–C1 darslar, grammatika, so'z boyligi, mashq savollari (8 R&W + 9 Math — ramziy) |
| Ovozli ustoz | Aksentli ingliz tilini tushunadi (endi "qattiqroq gapir" deb qayta-qayta so'ramaydi), gap tugashini shoshilmay kutadi, **tanlangan xarakter bilan gapiradi** (Yumshoq / Hazil / Qattiq 18+ / Jallod 18+), **ekranda hissiyot** (jahl — olov va qizarish, kulgi, quvonch, afsus), avvalgi xatolarni eslaydi |
| Mashqlardagi mikrofon | Matnni ovoz chiqarib o'qish, speaking, shadowing — endi faqat ingliz tili sifatida taniladi (aksent o'zbekcha deb adashtirilmaydi); sahifa endi ochilganda ham server tanishini kutadi |
| Navigatsiya | Bo'lim ichki menyusi bo'limning **hamma sahifalarida** sarlavha ostida **yopishib turadi**, to'liq kenglikda, yonga aylantirmasdan. Bosh sahifada **tezkor kirish**: AI ustoz, Mock Arena, O'yinlar, Duel, IELTS kursi, Xatolarim |
| Admin kabineti | Analitika + **Foydalanuvchilar** (qidirish, obunalar, to'lovlar, qo'lda obuna berish — audit jurnali bilan) + **To'lovlar** (so'nggi 100) + **Xodimlar** (metodist / hamkor / o'qituvchi rollari) + Sertifikatlar |
| Metodist kabineti | Darslar va testlarni tahrirlash, AI import, tarjimalar + **yangi "Sifat"**: har daraja bo'yicha qoralamalar, xatolar, izohi qisqa mashqlar, mediasiz darslar va bir bosishda tahrirlash |
| Hamkor (bloger) kabineti | Shaxsiy havola, kelganlar → faollashganlar → to'lovchilar → tushum, oylar bo'yicha + **tayyor post matnlari** (uz/ru, havola ichida) |

## 2. Ishga tushirishdan oldin — egasi bajaradigan ishlar (bloklovchi)

| # | Ish | Nega | Qayerda |
|---|---|---|---|
| 1 | `sellzen.uz` (www'siz) DNS: CNAME → Railway domeni yoki www'ga yo'naltirish | QR kodlar, reklama havolalari, SEO canonical ochilmaydi | Domen registratori |
| 2 | Bitta haqiqiy to'lovni sinab, Admin → To'lovlar'da ko'rinishini tekshirish | Hamyon kalitlari ulangan (server logi: "To'lov: Hamyon"), lekin haqiqiy to'lov bilan sinalmagan | Sayt + Admin kabineti |
| 3 | Xarajat chegaralarini qo'yish: `AI_GLOBAL_DAILY_CALLS`, `VOICE_GLOBAL_DAILY_CHARS`, `STT_GLOBAL_DAILY_MINUTES`, `LIVE_FREE_GLOBAL_DAILY_MINUTES` | Viral oqimda bepul foydalanuvchilar AI byudjetni bir kunda yeb qo'ymasligi uchun | Railway variables |
| 4 | Zaxira AI kaliti (`AI_BACKUP_*`) | Gemini 503 to'lqinlarida AI baho va ustoz to'xtamasin | Railway variables |
| 5 | Tashqi zaxira nusxa (`BACKUP_S3_*`) | Hozir zaxira bir xil diskda — disk yo'qolsa hammasi yo'qoladi | Railway bucket yoki S3 |
| 6 | Railway regionini Amsterdamga ko'chirish (rejalashtirilgan, tungi soatda) | Toshkent ↔ San-Fransisko ~250 ms har yo'nalishda — ovozli suhbat kechikadi | Railway (egasi qarori) |
| 7 | GitHub Actions billing | CI har PR'da avtomatik ishlashi uchun (hozir 2–3 s da to'xtaydi) | GitHub Settings |
| 8 | O'zgargan o'zbekcha matnlarni ru/kk/ky/tg ga qayta tarjima | Yangi landing, kabinet va yo'l matnlari | Metodist kabineti → Tarjimalar |
| 9 | `ADMIN_NICKNAMES` da o'z laqabingiz, metodist va 3–5 bloger laqablariga rol | Kabinetlar ishlashi uchun | Railway + Admin → Xodimlar |

## 3. Ishga tushirish kuni (runbook)

1. **Kechasi (Toshkent 02:00–05:00)** deploy — har deployda qisqa uzilish bor (disk ulangan xizmat).
2. Tekshiruv (10 daqiqa): `https://www.sellzen.uz` ochiladi → "Bepul boshlash" → Telegram login → reja → daraja testi → bosh sahifa; AI ustoz qo'ng'irog'i (30 s); bitta mock test; to'lov sahifasi.
3. Railway loglari: `[ai]` 5xx, `til-xato` soni, to'lov xatolari. Admin → Analitika: ro'yxat va voronka.
4. Telegram bot webhook ishlayotganini tekshirish (`/start` → havola).
5. Birinchi e'lon: o'z kanalingiz + 3–5 bloger (pastdagi 5-bo'lim).

## 4. O'lchovlar (har kuni 5 daqiqa, Admin → Analitika)

| Ko'rsatkich | Maqsad (1-oy, taxmin) | Nima qilinadi agar past bo'lsa |
|---|---|---|
| Landing → ro'yxat | ≥ 25 % | Landing sarlavhasi, "Bepul boshlash" tugmasi, Telegram ichidan ochish |
| Ro'yxat → daraja testi tugatildi | ≥ 70 % | Reja savolnomasini qisqartirish |
| 1-kun → 7-kun qaytish | ≥ 25 % | Kunlik reja, seriya eslatmasi (Telegram bot) |
| Bepul → pullik | 2–4 % | Kunlik devor (Admin'da "Bepul tarif: kunlik devor"), narx, 3 oylik taklif |
| AI xarajati / faol foydalanuvchi | < 300 so'm/kun | Chegaralar (2-bo'lim, 3-band) |
| Duel / ulashish soni | o'sib borishi | Ulashish kartochkasi va duel taklifini ko'proq ko'rsatish |

## 5. O'sish (grow) — 90 kunlik reja

### Ichki o'sish halqalari (allaqachon kodda bor)
- **Natija kartochkasi** (daraja, mock band) — Instagram/Telegram story uchun 1080×1920, ichida referal havola.
- **Duel taklifi** — do'stni bellashuvga chaqirish; mehmon taklif havolasini ochsa, ro'yxatdan o'tib, darhol o'sha duelga qaytadi.
- **Referal** — `REF_XP`, `REF_PLAN_DAYS`, `REF_PLAN_MONTHLY_CAP` bilan ikkala tomonga bonus (hozir standart o'chiq — 2-haftada yoqish tavsiya etiladi: masalan 7 kun obuna, oyiga 5 tagacha).
- **Reyting va ligalar** — haftalik bellashuv.

### 1–30 kun: "Daraja testi" kampaniyasi
- Asosiy xabar: *"Ingliz tili darajangizni 3 daqiqada biling — bepul"*. Har kuni 1 qisqa video (Reels/TikTok): ovozli ustoz jahl qilib olov chiqaradigan lahza, kulgili xato, "B1 dan B2 ga 30 kunda".
- **Mikro-blogerlar** (10–50 ming obunachi, ta'lim/talabalar): 10–15 ta, CPA modeli — har to'lovdan ulush (Hamkor kabinetida avtomatik hisob). Tayyor post matnlari kabinetda.
- Telegram: ingliz tili kanallariga "kunlik so'z" va "kunlik duel" postlari.

### 31–60 kun: imtihon mavsumi
- CEFR Multilevel va IELTS sanalariga 4–6 hafta qolganda: **bepul to'liq mock haftaligi** + natija kartochkasi ulashish.
- O'quv markazlari va maktablar uchun **Guruhlar** (o'qituvchi kabineti) — B2B: o'qituvchi guruh ochadi, o'quvchilar kod bilan kiradi, hisobot ko'radi.
- Referal bonusini yoqish.

### 61–90 kun: saqlash va daromad
- Kunlik reja + seriya + xotirali ustoz — qaytish sababi.
- 3 oylik va 12 oylik tariflarni (−10 % / 2 oy bepul) imtihon oldidan aksiya bilan.
- Natijalar: "Sellzen bilan +0.5 band" — haqiqiy o'quvchi hikoyalari (ruxsat bilan).

## 6. Kontent ustuvorligi (metodist uchun, "Sifat" bo'limidan foydalanib)

1. **CEFR Multilevel** mashq to'plamlari: kamida 10 Reading + 10 Listening (O'zbekistonda asosiy imtihon).
2. **To'liq IELTS mocklar**: kamida 10 Academic Reading va 10 Listening (hozir 3 va 1 tasi to'liq).
3. Izohi qisqa mashqlarni tuzatish ("Sifat" ro'yxati — xatoli darslar birinchi).
4. A1–A2: darslar va so'zlar hajmini oshirish (eng ko'p yangi foydalanuvchi shu darajada).
5. Har bo'limga 1 ta qisqa dialog audio (ElevenLabs ulangan).
6. Barcha darslar hozir "pilot" — metodist ko'rigidan o'tkazib, ko'rik jurnaliga yozish.

## 7. Xavflar

| Xavf | Belgisi | Chora |
|---|---|---|
| AI xarajati keskin oshadi | Admin → AI xarajati | Kunlik global chegaralar, zaxira provayder |
| Deploy paytida uzilish | 502 loglar | Faqat tungi deploy, o'zgarishlarni to'plab chiqarish |
| Kontent hajmi kam (CEFR, to'liq mock) | Imtihon bo'limida qaytish past | 6-bo'lim 1–2 bandlar |
| Gemini 503 | `[ai]` 5xx | `AI_BACKUP_*` |
| Disk yo'qolishi | — | Tashqi zaxira (2-bo'lim, 5-band) |
| Bitta server (SQLite) | Kuniga 10 000+ faol foydalanuvchida yozuv navbati | O'lchab, keyin Postgres (spec tayyor: `docs/audit/phase-0.2/FINAL_MIGRATION_SPEC.md`) |

## 8. AI xarajatini o'lchash (2026-11-21 tuzatildi)

- **Avval**: matnli AI (AI ustoz chati, Writing/Speaking baholash, savollar) xarajati **umuman yozilmas edi**; ovozli suhbat daqiqasiga $0.03 deb taxmin qilinardi. Admin'dagi AI xarajati shuning uchun past ko'rinardi.
- **Endi**: har javobdagi provayder qaytargan **haqiqiy token soni** yoziladi (Gemini `usageMetadata`, OpenAI/Anthropic `usage`), ovozli suhbatda Gemini Live'ning audio/matn tokenlari alohida. Xarajat = token × narx.
- **Narxni aniqlash uchun** Railway'ga qo'ying (USD, 1 mln token uchun, Google AI Studio narx sahifasidagi qiymatlar): `AI_PRICE_IN_PER_M`, `AI_PRICE_OUT_PER_M`, `PRICE_LIVE_TEXT_IN_PER_M`, `PRICE_LIVE_AUDIO_IN_PER_M`, `PRICE_LIVE_TEXT_OUT_PER_M`, `PRICE_LIVE_AUDIO_OUT_PER_M`. Qo'yilmasa standart narx ishlatiladi va yozuv "estimated" deb belgilanadi.
- Ovoz (ElevenLabs TTS) — haqiqiy belgilar soni × narx; nutqni tanish (STT) — haqiqiy soniyalar × `PRICE_STT_PER_HOUR`.
- Eng aniq tekshiruv: oy oxirida Admin'dagi jami summani Google AI Studio va ElevenLabs hisob-fakturasi bilan solishtirish.

## 9. Ishlamayotgan / yoqilmagan qismlar (2026-11-21, Railway o'zgaruvchilari bo'yicha)

| Qism | Holat | Nima kerak |
|---|---|---|
| Seriya eslatmalari va liga xabarlari (Telegram) | Kod bor, **o'chiq** | `TG_REMINDERS=1` |
| Referal bonusi (ikkala tomonga obuna kunlari) | Kod bor, **o'chiq** | `REF_PLAN_DAYS=7` (tavsiya) |
| Tashqi zaxira nusxa | **O'chiq** | `BACKUP_S3_*` |
| Zaxira AI provayder | **O'chiq** | `AI_BACKUP_*` |
| Bepul ovozli suhbat uchun umumiy kunlik chegara | **Yo'q** (xarajat xavfi) | `LIVE_FREE_GLOBAL_DAILY_MINUTES` |
| AI narxlari | Standart (taxminiy) | 8-bo'limdagi narx o'zgaruvchilari |
| Talaffuzni akustik baholash | Yo'q (faqat matn bo'yicha) | Alohida loyiha |
| Ovozli suhbat uzilsa davom ettirish | Yo'q | Live session resumption |
| O'zbekcha ovoz sifati (Live) | Gemini Live hujjatlarida o'zbek tili qo'llab-quvvatlanadigan tillar ro'yxatida tasdiqlanmagan — sheva/xato so'zlar shundan. Ko'rsatma adabiy tilni talab qiladi, lekin to'liq kafolat yo'q | Kuzatish; zarur bo'lsa izohlarni ekranda matn qilib ko'rsatish |
| Kontent hajmi | CEFR: 1 Reading + 1 Listening to'plam; to'liq IELTS mock: Reading 3, Listening 2; SAT Math 9 savol | Metodist (6-bo'lim) |

Ishlaydigan (tekshirilgan): kirish (Telegram), darslar, mock testlar (20 ta Listening — tayyor audio fayllar), AI ustoz (matn va ovoz), AI baholash, to'lov ulangan, sertifikatlar, guruhlar, kabinetlar, Telegram bot.

## 10. Lidlar (sotuv bo'limi)

- O'quvchi **o'z roziligi bilan** raqam qoldiradi: shaxsiy reja oxirida va Profil'da "Bepul maslahat" kartochkasi (qo'lda yoki Telegram orqali — raqamni Telegram tasdiqlaydi).
- Operator uchun rol: **operator (sotuv)** — Admin → Xodimlar'da beriladi; operator faqat `#/leads` sahifasini ko'radi (admin — Admin → Lidlar).
- Ro'yxatda: laqab, telefon, maqsad, daraja, kunlik vaqt, ro'yxatdan o'tgan sana, XP, obuna holati; holat (yangi → qo'ng'iroq qilindi → qiziqdi → obuna oldi / rad etdi) va izoh; CSV eksport.
- **Huquqiy eslatma**: O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi qonuni (2021-yildan) O'zbekiston fuqarolarining shaxsiy ma'lumotlarini O'zbekiston hududidagi serverlarda saqlashni talab qiladi; server hozir AQSh (Railway, sfo). Telefon raqamlarini yig'ishni keng boshlashdan oldin yurist bilan maslahatlashing (mahalliy server yoki ro'yxatdan o'tkazish).
- Operator skripti uchun asos: o'quvchining maqsadi va darajasi ro'yxatda bor — "IELTS 6.5 maqsadingiz bor ekan, B1 darajadan boshlaysiz, kuniga 20 daqiqa bilan ~N hafta" kabi suhbat.
