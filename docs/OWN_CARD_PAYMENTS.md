# O'z karta-to'lov moduli (Hamyon'ga bog'liq bo'lmagan yo'l)

Holat: **kuzatuv bosqichi**. Standart rejim `off` — hech narsa o'zgarmaydi, to'lov Hamyon orqali ishlayveradi.

## Qanday ishlaydi
1. Foydalanuvchi tarif tanlaydi, server to'lov ochadi: **bizning karta** va **aniq summa** (narx + 1, 2, … so'm — har ochiq to'lovga bir xil bo'lmagan summa).
2. Foydalanuvchi shu summani o'tkazadi. Karta egasining Telegram akkauntiga CardXabar / HUMOcard botidan «pul tushdi» xabari keladi.
3. Server shu xabarni o'qiydi (`server/cardWatch.ts`), summani ochiq to'lov bilan aynan solishtiradi (`server/cardPay.ts`) va obunani **bir marta** beradi (`applyResult` — Hamyon bilan bir xil yetkazish yo'li).

Telegram'da bot boshqa botning xabarini ko'ra olmaydi — shuning uchun karta egasining **akkaunti** (MTProto sessiyasi) kerak. Bu cheklov Hamyon'da ham, bizda ham bir xil; farq — sessiya kimning qo'lida va kim javob beradi.

## Rejimlar (`PAY_OWN_MODE`)
| Rejim | Nima qiladi | Obuna beradimi |
|---|---|---|
| `off` | Hech narsa | — |
| `capture` | Xabarlarni yozib oladi (30 kun saqlanadi) | yo'q |
| `shadow` | Xabarni ochiq to'lovlarga (Hamyon to'lovlari ham) solishtiradi, «yetkazgan bo'lardi» deb yozadi | yo'q |
| `live` | Yangi to'lovlar bizning kartaga ochiladi, xabar kelganda obuna beriladi | ha |

`GET /api/admin/pay/notices` (admin): xabarlar ro'yxati va **shadow hisoboti** — Hamyon yetkazgan to'lovlardan nechtasini o'z modulimiz ham topgan bo'lardi (`found`/`missed`), va biz «yetkazardik», Hamyon esa yo'q bo'lganlar (`wrong`).

## Ishga tushirish tartibi
1. https://my.telegram.org → *API development tools*: `api_id` va `api_hash` oling.
2. Kompyuteringizda: `TG_API_ID=… TG_API_HASH=… npm run pay:login` — telefon, kod (va bo'lsa 2 bosqichli parol) kiriting; chiqqan **SESSION** qatorini Railway Variables'ga `TG_SESSION` qilib qo'ying. Hech kimga yubormang.
3. Railway Variables: `PAY_OWN_MODE=capture`, `TG_API_ID`, `TG_API_HASH`, `TG_SESSION`. Deploy tugagach jurnalda `[cardpay] Telegram ulandi` chiqadi.
4. Bir necha haqiqiy to'lov/o'tkazma qiling, Telegram'dagi xabarlarni (kartani yashirib) **bizga ko'rsating** — `parseCardNotice` hozir faqat taxminiy namunalar bilan sinalgan, haqiqiy format bilan tasdiqlanishi shart.
5. `PAY_OWN_MODE=shadow`: Hamyon bilan yonma-yon yuring. `/api/admin/pay/notices` da `missed` va `wrong` bo'sh bo'lsa (kamida ~1–2 hafta yoki 30+ to'lov) tayyor.
6. `PAY_OWN_MODE=live`, `PAY_OWN_CARD=<karta>`: yangi to'lovlar bizning kartaga. Hamyon'dagi ochiq to'lovlar o'z yo'lida yakunlanadi.

**Qaytarish:** `PAY_OWN_MODE=off` (yoki `shadow`) — yangi to'lovlar yana Hamyon'ga ketadi; ochiq `own_` to'lovlar muddati tugaguncha o'z holicha yakunlanadi.

## Xavfsizlik va xavflar
- **TG_SESSION = Telegram akkauntga to'liq kirish.** Faqat Railway Variables'da. Imkoni bo'lsa, faqat karta-botlari bog'langan **alohida akkaunt** ishlating. Xavf sezsangiz: Telegram → Sozlamalar → Qurilmalar → sessiyani tugating (modul ishlashdan to'xtaydi).
- **Sessiya bir vaqtda bitta jarayonda.** Ikki joyda ishlasa Telegram sessiyani bekor qiladi. Modul DB «lease» bilan bitta nusxani ta'minlaydi va SIGTERM'da bo'shatadi; lokal sinov uchun **productionniki bilan bir xil sessiyani ishlatmang** (alohida `npm run pay:login` qiling).
- **Soxta xabar:** faqat belgilangan botlarning yuboruvchi ID'sidan kelgan xabarlar o'qiladi.
- **Summa to'qnashuvi:** ochiq va yaqinda yopilgan (grace) to'lovlar summasi qayta berilmaydi; bir nechta nomzod bo'lsa — avtomatik yetkazilmaydi (`ambiguous`), qo'lda obuna beriladi.
- **Aniqlanmagan xabar** (format noma'lum, kirim/chiqim aniq emas, kasrli summa) — avtomatik yetkazilmaydi.
- **Maxfiylik:** xabar matnida karta bo'laklari, balans, ba'zan boshqa odam ismi bo'lishi mumkin: 30 kundan keyin o'chiriladi, jurnalga matn yozilmaydi.
- **Shartlar:** CardXabar (PLUM) va Telegram shartlari avtomatlashtirilgan o'qishni cheklashi mumkin — shartlarni o'zingiz tekshiring. Yuridik/soliq jihatlari (kartaga to'lov qabul qilish) ham sizning qaroringiz; rasmiy yo'l — Payme/Click/Uzum kabi merchant shartnoma.
- **Tashqi xizmat tarmog'i:** Telegram ulanishi Railway'dan chiqadi; `api.telegram.org` emas, MTProto (TCP) — Railway tarmog'i cheklanmagan bo'lishi kerak.

## Hali tasdiqlanmagan
- CardXabar/HUMOcard xabarlarining haqiqiy matni (parser sintetik namunalar bilan sinalgan).
- Haqiqiy Telegram'ga ulanish (bu muhitda Telegram hisobi yo'q — ulagich soxta oqim bilan sinalgan, GramJS importi tekshirilgan).
