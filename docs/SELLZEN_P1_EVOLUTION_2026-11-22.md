# Sellzen — P1 evolyutsiya: audit, qarorlar va amalga oshirilgan ishlar (2026-11-22)

Manba — kod. Bu hujjat `claude/bandly-analysis-improvement-ywgxrb` branchidagi holatni tasvirlaydi (asos: `main` = `74d8f14`).
Production'ga **deploy qilinmagan** — egasining tasdig'i kerak.

## 1. Boshlang'ich holat (baseline)

| | |
|---|---|
| Branch | `claude/bandly-analysis-improvement-ywgxrb`, boshlang'ich commit `d908239` (tarkibi `main` `74d8f14` bilan bir xil) |
| Ishchi daraxt | toza |
| `npm run test:ci` | o'tdi (i18n check, `tsc --noEmit`, vite build, ~95 test to'plami, backup testi) |
| Lint | loyihada lint skripti **yo'q** (type-check `tsc` orqali) |
| Production | Railway deploy `086f0e5a` SUCCESS (`74d8f14`), start log: 56 yangi bo'lim/dars bazaga qo'shildi |

## 2. Tekshirilgan imkoniyatlar (kod + test bo'yicha)

Holatlar: **T** — amalga oshirilgan va test bilan qoplangan · **I** — amalga oshirilgan, production'da to'liq tekshirilmagan · **Q** — qisman · **R** — faqat reja · **Y** — yo'q.

| Imkoniyat | Holat | Dalil / izoh |
|---|---|---|
| General English darslari | T | 62 bo'lim / 186 dars / 2 046 savol (`lessons.test.ts`); hammasi `pilot` (metodist tekshiruvi yo'q) |
| IELTS kursi | T | 8 bo'lim / 36 dars |
| Reading/Listening mocklar | T | 21 reading, 20 listening; kalitlar faqat serverda (`chunks.test.ts`), yangi `examContent.test.ts` |
| CEFR Multilevel | Q | 1 reading (35 savol/60 daq., rasmiy hajm tasdiqlangan) + 1 listening to'plami — kontent kam |
| Digital SAT | Q | 18 original R&W savol, ball hisoblanmaydi |
| IELTS General Training | Q | faqat GT reading band jadvali |
| AI Writing baholash | I | 4 mezon (TA/TR, CC, LR, GRA), overall serverda; Gemini 503 holatlari kuzatilgan |
| AI Speaking baholash | I | Part 1–3 (60 s tayyorlanish, Part 2 uzun javob), 3 mezon; talaffuz **ataylab** `null` (faqat matn bor) — UI'da "baholanmaydi" |
| Live ovozli ustoz | I | Gemini Live, sessiya tiklash yo'q |
| O'yinlar, duel, boss, challenge, liga | T | o'z testlari bor |
| Xatolar + SRS | T | `mistakes.ts` (1/3/7 kun, 3 marta to'g'ri → hal) |
| Kunlik reja (moslashuvchan) | T | `recommend.ts` (sabab kodlari), `planLog.ts` (bajarilmasa yuk kamayadi), imtihon sanasi `exam_soon` |
| Streak muzlatish/tiklash | T | `gamify.ts` — qayta qurilmadi |
| Guruhlar / o'qituvchi | T | `server/groups.ts` (o'qituvchi egaligi, qo'shilish kodi, faollik) |
| Referal, kreator atributsiyasi | I | to'lov chiqarish yo'q (OD-14) |
| Sertifikatlar | I | |
| Telegram bot + Mini App | I | |
| 6 tilli interfeys | T | repo ichidagi `src/i18n/locales/*.json`, `locales.test.ts` 100% talab qiladi |
| Analitika | T (yangi) | oldin: agregat + anonim kunlik hodisalar; endi foydalanuvchi darajasidagi kohortalar (§4.1) |

Eskirgan hujjatlar: `plugins/.../CONTEXT.md` (144 dars, "tarjimalar DB'da", "client event pipeline yo'q") — §7 da yangilandi.

## 3. Takliflarni baholash

| Taklif | Qaror | Sabab |
|---|---|---|
| P1.1 Personal Learning Intelligence | **P1 — amalga oshirildi** | mavjud mastery/natija/xato ma'lumotlarini birlashtiradi; AI ishlatmaydi |
| P1.2 Imtihon sanasiga reja | **Mavjudni kengaytirish** | sana, maqsad, moslashuvchan reja bor edi; real imkoniyat bahosi, haftalik bosqichlar, mock jadvali qo'shildi |
| P1.3 Writing Improvement Lab | **Mavjudni kengaytirish** | sabab, mezon, dalil tekshiruvi, qayta yozish mashqi, xatolarga qo'shish |
| P1.4 Speaking Examiner | **Mavjud — tekshirildi** | Part 1–3 oqimi va 3 mezon tasdiqlandi; ikkinchi dvigatel qurilmadi; tuzatishlarga sabab + Writing Lab mashqi umumiy |
| P1.5 CEFR kontent | **Validatsiya — qilindi; kontent — keyingi ish** | yangi savollar rasmiy formatni tekshirgan holda yozilishi kerak; avtomatik tekshiruv tayyor |
| P1.6 B2B tashkilot | **Dizayn tayyor, kod — egasining qarorlaridan keyin** | rozilik, ma'lumot ko'rinishi va litsenziya qarorlari kerak (§5) |
| P1.7 Analytics 2.0 | **P1 — amalga oshirildi** | |
| Speaking Part 1–3 "yangi mahsulot" | **Rad etildi (dublikat)** | mavjud |
| Streak muzlatish | **Rad etildi (dublikat)** | `gamify.ts` da bor |
| Alohida guruh tizimi | **Rad etildi** | mavjud `groups` kengaytiriladi |
| Pullik Mock paketi | **Rad etildi** | egasining qarori: Mock Arena bepul |
| P2.1 Ota-ona hisoboti | P2 pilot | vasiylik modeli va rozilik kerak |
| P2.2 5 daqiqalik Listening Story | P2 pilot | kichik qo'lda tayyorlangan to'plam bilan |
| P2.3 Real-life Scenario Mode | P2 pilot | mavjud AI ustoz stsenariylari ustiga |
| P2.4 Creator Program | P2 — moliyaviy model va firibgarlik qoidalaridan keyin | |
| P2.5 Buddy Challenge | P2 pilot | duel/liga/guruh qayta ishlatiladi |
| P3 (qo'lyozma OCR, jonli guruh xonalari, fonema talaffuz, offline, kasbiy treklar, oilaviy obuna, inson examiner) | Kechiktirildi | §6 |

## 4. Amalga oshirilgan o'zgarishlar

### 4.1 Analytics 2.0 (P1.7)
- `server/userEvents.ts` — yangi jadval `user_events (player_id, name, day, first_ts, n)`, PK `(player_id, name, day)`: bir o'quvchi bir kunda bir hodisani bir marta. Additiv (`CREATE TABLE IF NOT EXISTS`), mavjud ma'lumotga tegmaydi.
- Ishonchli server ma'lumoti qayta yozilmaydi: ro'yxatdan o'tish (`players`), dars/mock/daraja testi (`xp_events`), Writing/Speaking baholash (`exam_results` module `ai`), to'lov (`payments`), AI xarajati (`ai_cost_events`).
- Brauzer hodisalari (`POST /api/uevent`, token majburiy, oq ro'yxat): `onboarding_done, lesson_start, mock_start, speaking_start, writing_start, plan_done, pricing_view, checkout_start, referral_share, insight_follow`.
- `cohortReport()` — kohorta (davrda ro'yxatdan o'tganlar) bo'yicha noyob o'quvchilar: qadamlar, faollashish (7 kun), D1/D7/D30 (faqat muddati kelganlar), bepul→pullik, faollashgan→pullik, uzaytirish; davr: faol o'quvchilar, ARPU, faol o'quvchiga AI xarajati, bitta AI baholash narxi; funksiyalardan foydalanish.
- Admin → Analitika → O'sish: "Kohorta" paneli va ta'riflar. Shaxsiy ma'lumot yo'q.
- Test: `server/userEvents.test.ts` (deduplikatsiya, rad etish, noyob hisob, 7 kunlik faollashish, retention, uzaytirish, ARPU, AI narxi, PII yo'qligi).

### 4.2 Shaxsiy o'quv tahlili (P1.1)
- `src/lib/insights.ts` — ko'nikma ballari (grammatika/so'z: mastery; reading/listening/writing/speaking: oxirgi 5 natija), takrorlanuvchi xatolar (30 kun, ≥ 2), tavsiya qoidalari (xatolar navbati → takrorlanuvchi xato darsi → eng zaif ko'nikma → o'lchanmagan ko'nikma → keyingi dars), o'zlashtirilgan dars qayta berilmaydi, tavsiya natijasini kuzatish (yaxshilandi/o'zgarmadi/pasaydi, ±3 ball).
- `src/components/InsightsCard.tsx` — bosh sahifada; ma'lumot bo'lmasa ko'rinmaydi (taxmin ko'rsatilmaydi). Natija `bandly.insights.v1` da (sinxronlanadi).
- Test: `src/lib/insights.test.ts`.

### 4.3 Imtihon sanasiga reja (P1.2)
- `src/lib/examPlan.ts` — qolgan kun/hafta, mavjud o'qish soati (tanlangan kunlik vaqt × 5/7), farq, xavf (`reached/ok/tight/unlikely/unknown/past`), 12 haftagacha bosqichlar (zaif ko'nikma birinchi, oxirgi 4 haftada har hafta mock, oxirgi hafta takrorlash), keyingi mock.
- `HOURS_PER_HALF_BAND = 50` — **ichki rejalashtirish taxmini, kalibrlanmagan**; UI'da "taxminiy, kafolat yo'q" deb yoziladi. Hozirgi ball bo'lmasa baho berilmaydi.
- `ExamHero`: "Tayyorgarlik rejasi" bo'limi; natija yo'q bo'lsa "0.0" o'rniga "—" (xato tuzatildi).
- Kunlik yuk tanlangan vaqtdan oshmaydi; bajarilmagan kunlarda mavjud `planLog` yengillashtirishi saqlanadi.
- Test: `src/lib/examPlan.test.ts`.

### 4.4 Writing Improvement Lab (P1.3) va Speaking (P1.4)
- `server/ai.ts`: tuzatishlarga `why` (o'quvchi tilida) va `criterion`; **dalil tekshiruvi** — `said` o'quvchi matnida bo'lmasa yoki o'zgarishsiz bo'lsa tashlanadi; promptda "faqat shu iborani, butun inshoni qayta yozmang".
- `EvalCard`: asl → yaxshiroq, sabab, mezon, qayta yozish mashqi, ko'p uchragan mezon; tuzatishlar "Xatolarim"ga (keyinchalik takrorlash — qo'llay olishini kuzatish); "AI bahosi — taxminiy, rasmiy IELTS bahosi emas", talaffuz baholanmasligi yoziladi.
- Speaking: Part 1–3 oqimi, 60 s tayyorlanish, matnli zaxira va natijalar tarixi mavjud — o'zgartirilmadi.
- Test: `server/ai.test.ts` ("ai writing lab").

### 4.5 Imtihon kontenti validatsiyasi (P1.5)
- `src/content/examContent.test.ts` — barcha reading/listening (IELTS + CEFR): kalit indeksi, takror id/savol matni/variantlar, guruhsiz savol, bo'sh ko'rsatma, izoh yo'qligi, CEFR Reading 35 savol/60 daqiqa.

## 5. B2B tashkilot — ma'lumot modeli (dizayn, kod hali yo'q)

```
organizations (id, name, logo_url, owner_id → players, created_at, status)
org_members   (org_id, player_id, role: 'owner'|'admin'|'teacher', added_at)   PK (org_id, player_id)
groups        + org_id NULL  (mavjud jadvalga additiv ustun; NULL = shaxsiy o'qituvchi guruhi — hozirgi xatti-harakat)
group_members + consent_at, consent_scope ('progress'|'progress+results')        (additiv)
org_licenses  (org_id, seats, until, created_by)   — faqat egasi narx/litsenziya modelini tasdiqlagandan keyin
```

Ruxsatlar (backend'da, har so'rovda):
- teacher — faqat o'z guruhlari va ularning a'zolari (hozirgi `groups.ts` qoidasi);
- org admin — tashkilot guruhlari ro'yxati va **agregat** hisobotlar; o'quvchining Writing/Speaking matnlari va javoblari — faqat o'quvchi `progress+results` roziligini bergan bo'lsa;
- owner — admin + a'zolarni boshqarish, egalikni o'tkazish (ikki tomonlama tasdiq);
- o'quvchi guruhdan chiqsa — rozilik bekor, tarixiy agregatlar qoladi, shaxsiy natijalar ko'rinmaydi;
- tashkilotlararo kirish yo'q: har so'rov `org_id` bo'yicha filtrlanadi; id lar taxmin qilinadigan ketma-ketlikda ochilmaydi.

Egasining qarorlari kerak: (1) o'quvchi roziligi matni va standart darajasi; (2) voyaga yetmaganlar siyosati; (3) litsenziya/narx modeli; (4) tashkilot logotipi sertifikatda ko'rinadimi.

## 6. P2 / P3 — qisqa baho

| Funksiya | MVP | Xarajat / xavf | O'lchov |
|---|---|---|---|
| Ota-ona hisoboti (P2) | o'quvchi taklif havolasi orqali vasiyni bog'laydi; haftalik bot xabari (dars, daqiqa, streak, keyingi qadam) | rozilik, noto'g'ri bog'lash; Telegram xabar limiti | bog'langanlar ulushi, D30 retention farqi |
| Listening Story (P2) | 10 ta qo'lda yozilgan 5 daqiqalik hikoya (A2–B1), mavjud TTS keshi, 3 savol | TTS bir martalik; kontent vaqti | boshlash → tugatish, 7 kunlik qaytish |
| Scenario Mode (P2) | AI ustoz stsenariylariga maqsad, muvaffaqiyat mezoni va yakuniy fikr | AI daqiqa xarajati (mavjud limitlar ichida) | stsenariy tugatish, takroriy foydalanish |
| Creator Program (P2) | mavjud referal + kreator atributsiyasi, kampaniya kodi | firibgarlik; moliyaviy model yo'q | tasdiqlangan faollashgan referallar |
| Buddy Challenge (P2) | do'st bilan haftalik maqsad (duel/liga qayta ishlatiladi), natija faqat rozilik bilan | maxfiylik | taklif → qabul → 7 kun faollik |
| Qo'lyozma OCR (P3) | — | vision API xarajati, rasm saqlash siyosati | — |
| Jonli guruh speaking (P3) | — | ko'p tomonlama audio, moderatsiya | — |
| Fonema talaffuz (P3) | — | brauzer STT fonema bermaydi; maxsus API kerak | — |
| Offline (P3), kasbiy treklar, oilaviy obuna, inson examiner (P3) | — | kontent/operatsion xarajat, narx qarorlari | — |

## 7. Hujjat tuzatishlari
- `CONTEXT.md`: darslar 186; tarjimalar repo ichidagi `src/i18n/locales/*.json`; analitika — foydalanuvchi darajasidagi kohortalar mavjud.

## 8. Qaytarish (rollback)
- Kod: branch PR'ni qaytarish (revert). `user_events` jadvali additiv — qoldirilsa zarar qilmaydi; kerak bo'lsa `DROP TABLE user_events` faqat egasining tasdig'i va backupdan keyin.
- `/api/uevent` o'chirilsa mijoz jim davom etadi (`trackUser` xatoni yutadi).
- AI prompt o'zgarishi: `parseEvaluation` eski formatni ham qabul qiladi (`why`/`criterion` ixtiyoriy).
