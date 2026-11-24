# Sellzen — bozor holati, raqobatchilar va yuborilgan ilova skrinshotlari tahlili (2026-11-24)

Bu hujjat mahsulot egasi uchun. Kod holati bo'yicha raqamlar **tekshirilgan** (repodan sanalgan). Raqobatchilar bo'yicha ma'lumot
ikki turga bo'lingan: **[T]** — shu kuni ochiq manbadan tekshirilgan; **[E]** — egasi bergan yoki avvalgi hujjatlardan olingan, qayta tekshirilmagan.

## 1. Qisqa xulosa

**Hozircha raqobatchilardan umumiy ravishda o'tib ketgan emasmiz.** Lekin uchta joyda real ustunlik bor va to'rtta joyda aniq ortda qolyapmiz.
Ustunliklar tez qaytariladigan narsa emas (bir mahsulotda hamma yo'nalish + o'zbekcha tushuntirish + ovozli AI); kamchiliklarni esa 1–2 oyda yopish mumkin.

| | Holat |
|---|---|
| **Oldindamiz** | (1) Bitta mahsulotda: General English A1–C2 + IELTS kursi + CEFR/SAT + mock arena + o'yinlar + ovozli ustoz. (2) O'zbek tilida tushuntirish va 6 tilli interfeys. (3) Ovozli Sellzen (Gemini Live + Scribe, 4 xarakter, dars/reja konteksti) va xarajat himoyasi admin panelda. |
| **Teng** | Mock testlar (Reading/Listening, bepul), kunlik reja, liga/XP/streak, Telegram bot, referal va creator dasturi. |
| **Ortdamiz** | (1) Dars ichidagi mashq turlari kam (3 xil) va AI mikro-fikr yo'q. (2) Boshlang'ich (A1) darslar kam. (3) Kontent hali "pilot" — metodist tasdig'i yo'q. (4) Ilova emas, brauzer (offline yo'q); ijtimoiy isbot (sharhlar, natija hikoyalari) yo'q. |

## 2. Sellzen'ning hozirgi hajmi (kod bo'yicha, shu kunda)

- **General English:** 63 bo'lim, **189 dars** (A1 39, A2/B1/B2/C1/C2 — 30 tadan). Har darsda: Uzbekcha tushuntirish, jadval, 4 misol, 4 so'z, 5 mashq + 6 nazorat savoli (+2 ta eshitib tushunish), yozma topshiriq.
- **IELTS kursi:** 36 dars. **Mock:** 21 Reading + 20 Listening test. **So'zlar:** 1195 (SRS, o'yinlar). **Grammatika:** 80 savol, **mashq banki:** 54.
- **Mashq turlari dars ichida:** faqat `choice`, `gap`, `order` (2046 mashqdan 11 tasida audio bor edi; endi har darsga 2 ta, jami ~380 audio mashq).
- **Kontent holati:** barcha bo'limlar `pilot` — metodist tomonidan tasdiqlangan deb belgilanmagan.

## 3. Raqobatchilar

### Jahon
- **Praktika** (AI ustoz, ovozli) — [T] taxminan **$8/oy** (yillik to'lovda; App Store'da $9.99–$39.99/oy turlicha ko'rinadi, mintaqaga qarab o'zgaradi), doimiy bepul tarif yo'q, 7 kunlik sinov. Manba: [Praktika App Store](https://apps.apple.com/us/app/-/id1624701477), [sharh](https://makeheadway.com/blog/praktika-review/).
- **GoPrep** (IELTS; avval IELTS.GG) — [T] onboarding qisqa test: **maqsad bal, imtihon sanasi, eng qiyin bo'lim → shaxsiy reja → keyin narx**; mock test, AI baholash, moslashuvchan kunlik reja va **ovozli «Preppy»** pullik; bepul qismi: kalkulyatorlar va ikki o'yin. AQSH App Store narxi ≈ **$19.49/oy, $74.99/yil** (manbalar bir-biriga mos kelmaydi). Manba: [GoPrep App Store](https://apps.apple.com/tj/app/goprep-formerly-ielts-gg/id6787395636), [IELTSbiz sharhi](https://ieltsbiz.com/blog/goprep-review). *Ularning sahifalarini bu muhitda to'g'ridan-to'g'ri ocholmadim — ma'lumot qidiruv natijasi va uchinchi tomon sharhlariga tayanadi.*
- **Duolingo, Speak, ELSA** — [E] mexanika namunasi (streak, liga, qisqa mashqlar, ovozli mashq); narxlari bu hujjatda qayta tekshirilmagan.

### O'zbekiston [E]
IELTS yo'nalishida: Trylab (39 000 / 69 000 so'm), Flamona (43 000 / 69 000), PrepGo (82 500), Scorify (49 000 / 129 000), BandMate Pro (199 000), MockCenter, IELTSUp, IELTSMock, Englev, MockSpace, Karvon, Ibrat Academy.
Narxlar egasi tomonidan berilgan (`docs/audit/master-spec-v2/MONETIZATION_SPEC.md`). Rasmiy tayyorgarlik: British Council **IELTS Ready Premium** (shaxsiy reja + 40 ta mashq test) — [British Council UZ](https://www.britishcouncil.uz/en/exam/ielts/readypremium).
Mahalliy ilovalarning dars ichidagi chuqurligi, foydalanuvchi soni va retention'i haqida **tekshirilgan ma'lumot yo'q** — qidiruvda ishonchli manba topilmadi.

## 4. Daraja testi / onboarding bo'yicha GoPrep xulosasi

GoPrep'da **alohida majburiy "daraja testi" haqida ma'lumot topilmadi**; ular 3 savollik qisqa so'rovdan (maqsad bal, sana, eng qiyin bo'lim) reja tuzadi va darajani keyin mashq natijasidan moslashtiradi.
Bizda: 8 savollik savolnoma + 20 savollik test (jami ~5 daqiqa). Aniq xulosa:
1. Daraja testi **bir marta** bo'lsin (yangi o'quvchi uchun majburiy) — #108 da shunday qilindi: daraja bor o'quvchiga qayta so'ralmaydi, natija o'zi saqlanadi.
2. Keyingi daraja yangilanishi **mock/to'liq imtihon natijasidan** keladi (#108: to'liq imtihon umumiy banddan darajani yangilaydi) — qayta test faqat o'quvchi o'zi xohlasa.
3. Savolnomani kamaytirish mumkin (8 → 5: «sabab» va o'zi baholagan «daraja» test bilan ustma-ust) — A/B bilan sinash tavsiya etiladi; shoshilib o'zgartirilmadi.

## 5. Yuborilgan ilova skrinshotlari (20 ta) — bizda nima bor, nimani olsa bo'ladi

Ilova nomi skrinshotda ko'rinmaydi. Bu General English'ga yo'naltirilgan, Duolingo uslubidagi o'zbek tilidagi ilova: 5 modul × 25 missiya, har missiya ~8 qadam.

| Ularda | Bizda | Qaror |
|---|---|---|
| **Modul tanlash** — 5 modul, har birida «can-do» sarlavha («Hello!», «I can talk about many topics»), «Sakrab o'tish», foiz | A1–C2 xarita zonalari; zona oxirida «darajasini tekshirish» (sakrab o'tish vazifasini bajaradi); «can-do» sarlavhalar yo'q | **Olish:** har zona/bo'limga «Men nima qila olaman» sarlavhasi (past xarajat, motivatsiya) |
| **Missiyalar** (yo'l tanlash oynasi: General / IELTS Academic / liga) | GE yo'li va IELTS kursi alohida sahifalarda | **Olish:** xaritada bitta «Yo'l tanlash» oynasi (GE ⇄ IELTS ⇄ SAT) — o'rta-past |
| **Streak ekrani** («1 kun», haftalik doiralar, «Ulashish») | streak chipi, liga, muzlatish; kun yakunidagi bayram ekrani va ulashish yo'q | **Olish:** kun yakunida streak kartochkasi + ulashish (rasm kartochka vositasi bor) — past-o'rta |
| **Missiya yakuni** — yulduz, XP, aniqlik %, vaqt; «6/8» nuqtalari | yulduz va XP bor; aniqlik/vaqt plitkalari yo'q | **Olish:** 4 plitka + keyingi qadam chizig'i — past |
| **Bo'sh joyni to'ldirish** (belgi bilan, to'g'ri/noto'g'ri izoh o'zbekcha) | ✔ `choice/gap/order`, har mashqda `explainUz`, yashil/qizil javob oynasi | Bor |
| **Eshitish** (to'lqin chizig'i, 2 variant) | ✔ `listen` (2 marta eshitish, matn javobdan keyin); endi har darsda 2 ta | Bor; **to'lqin vizualizatsiyasi** ixtiyoriy |
| **«Barcha to'g'ri gaplarni tanlang»** (ko'p tanlov) | ✘ | **Olish:** `multi` mashq turi (past-o'rta) |
| **«Belgilash»** — matndan javob gapni sudrab belgilash | ✘ | **Olish (soddalashtirib):** gapni bosib tanlash (o'rta); sudrab belgilash keyinroq |
| **Speaking** — kartochka, mikrofon, **AI fikr-mulohaza + «Yaxshilangan variant» + matn + A1 halqasi + o'z ovozini eshitish** | dars ichida faqat tanilgan so'zlar ko'rsatiladi (baho/izoh yo'q) | **Olish — eng katta farq.** Scribe + Gemini Flash‑Lite, qisqa JSON javob; har foydalanuvchiga kunlik chegara (admin panelda) — o'rta |
| **Writing** — bitta gap + AI fikr | dars ichida qoidaga asoslangan tekshiruv (AI yo'q) | Speaking bilan bitta endpoint (`/api/lesson/feedback`) — o'rta |
| Personajlar (yuz ifodasi javobga qarab) | qo'ng'iroqda yuz bor; dars ekranlarida rasm | Ixtiyoriy (past ustuvorlik) |
| 1.5× XP kuchaytirgich, «Ligalar — Yangi» tugmasi | liga va XP vazifalari bor; kuchaytirgich yo'q | Keyinroq (retention sinovidan so'ng) |

**Nusxa ko'chirmaslik:** ularning rasmlari, personajlari, nomlari va matnlari olinmaydi (`growth-marketing` ko'rsatmasi: faqat tamoyillar).

## 6. Tavsiya etilgan ketma-ketlik

**1–2 hafta (tez, past xavf):** missiya yakuni plitkalari; streak kartochkasi + ulashish; can-do sarlavhalar; `multi` mashq turi; A1 ga yana 3 bo'lim (maktab/ish kuni, uy va xonalar, hobbi va bo'sh vaqt).
**3–5 hafta:** dars ichida AI fikr (speaking + writing) — eng ko'p qiymat; xarajat: har urinish ~0.3–1 sent (taxminiy, o'lchab tasdiqlanadi), bepul tarifda kuniga 3–5 ta.
**6–10 hafta:** metodist tekshiruvi va «pilot» belgisini olib tashlash (A1–B1 dan boshlab); PWA/offline darslar; ijtimoiy isbot (haqiqiy natija hikoyalari, ruxsat bilan).
**Doimiy:** haftalik loglarni ko'rish (`[live] … tanish=`, `[stt] … ishonch=`), AI band bo'lganda zaxira provayder.

## 7. Ochiq xavflar (egasi qarori yoki tashqi omil)
- Gemini sig'imi: 503/«vaqt tugadi» takrorlanadi; zaxira model zanjiri ishlaydi, lekin 2026-11-24 13:17 (UTC) da uchala model ham javob bermagan holat bo'lgan. Ikkinchi provayder kaliti tavsiya etiladi.
- Ovozni matnga o'girish: haqiqiy foydalanuvchi talaffuzida ishonch past (-0.2…-0.4) — kuzatish kerak; past ishonchli matn endi ustozga «ishonchsiz» deb yuboriladi.
- Hajmli servis: har deploy 3–15 soniyalik uzilish — `docs/runbooks/railway-deploys.md`.

## 8. Kodga kiritilganlar (shu hujjat takliflaridan)

| Taklif | Holat | Qayerda |
|---|---|---|
| Missiya yakuni plitkalari (yulduz, XP, aniqlik, vaqt + bo'lim nuqtalari) | **Bajarildi** | `src/components/ResultTiles.tsx`, `src/lib/lessonStats.ts` |
| Kunlik seriya kartochkasi (haftalik nuqtalar + ulashish) | **Bajarildi** (dars yakunida, kunlik maqsad bajarilganda) | `StreakCard`, `weekDots` |
| «Can-do» sarlavhalar (har daraja zonasida) | **Bajarildi** (inglizcha, tarjima kerak emas) | `CAN_DO` — `mapArt.tsx` |
| «Yo'l tanlang» oynasi (General English ⇄ IELTS ⇄ Imtihon) | **Bajarildi** | `LearningMap.tsx` |
| «Barcha to'g'ri javobni tanlang» (`multi` mashq turi) | **Bajarildi**: tur, tekshiruv, metodist formati (`+` qator), 3 ta mashq | `types.ts`, `lessons.ts`, `LessonItem.tsx`, `lessonDsl.ts` |
| Dars ichida AI fikr (yozma topshiriq) | **Bajarildi**: `/api/ai/lesson`, kuniga 5 ta (admin: Limitlar → Sellzen), xatoda chegara qaytariladi | `server/ai.ts`, `AiFeedback.tsx` |
| Kontent chuqurligi «pol» testi | **Bajarildi** | `src/content/depth.test.ts` |
| Dars ichida **speaking** uchun AI fikr | Keyingi bosqich (dars speaking'i hozir shadowing — erkin gapirish topshirig'i kerak) | — |
| Gapni bosib belgilash («tap-to-mark») mashqi | Keyingi bosqich | — |
| A1 ga yana 3 bo'lim (maktab/ish kuni, uy va xonalar, hobbi) | Keyingi bosqich (har dars ~30 matn × 5 til) | — |
| Kunlik streak — to'liq ekranli bayram | Keyingi bosqich (hozir natija ekranida kartochka) | — |
| PWA / offline darslar | Keyingi bosqich | — |
