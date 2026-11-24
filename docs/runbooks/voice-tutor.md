# Runbook — Ovozli ustoz (Gemini Live + Scribe): bosib-gapirish, tanish, reja, navigatsiya

Holat: production'ga faqat egasi "Merge qil" degandan keyin chiqadi. Limit/narx/baza sxemasi o'zgarmagan (pastdagi "Xarajat" bo'limiga qarang).

## Qanday ishlaydi (qisqacha)
1. **Boshlash:** Sellzen yuziga tegiladi (alohida "boshlash" tugmasi yo'q). Qo'ng'iroq **butun ekran** (skrol/siljish yo'q): tepada taymer `0:34 / 5:00` (bepul) yoki `/ 10:00` (obunachi, ko'pi bilan) va kichik "tugatish" tugmasi (yuqori o'ng burchak).
2. **Gapirish:** sensorli ekranda **ekranning istalgan joyiga** tegib turiladi (yuzga ham, burchakka ham), qo'yib yuborilganda ustoz javob beradi. Desktopda — sichqoncha bilan yuz/markazni bosib turish yoki **Probel (Space)**. Qisqa tegish (<300 ms) — "qulf": yozuv davom etadi, yana tegilganda tugaydi. Tugatish tugmasi va matn maydoni gapirishni boshlamaydi.
3. **Tanish (Scribe):** ovoz serverga ketadi (faqat tegib turilganda), qo'yib yuborilganda server uni **ElevenLabs Scribe** bilan matnga aylantiradi va **Gemini'ga matn** yuboradi. Gemini o'zbek tilini rasman qo'llab-quvvatlamaydi, Scribe esa o'zbekcha va aksentli inglizchani aniq tanaydi (mavjud `server/stt.ts`: til avtomatik aniqlanadi, kerak bo'lsa inglizcha qayta tanish). Ekranda "SIZ" qatorida Scribe matni ko'rinadi.
   - **Zaxira:** Scribe xato bersa yoki kunlik limit (`STT_DAILY_MINUTES`, `STT_GLOBAL_DAILY_MINUTES`) tugasa — shu navbat ovozi Gemini'ga (activityStart → ovoz → activityEnd) yuboriladi; o'quvchi javobsiz qolmaydi.
   - **O'chirish:** `LIVE_ASR=gemini` — eski usul (ovoz to'g'ridan-to'g'ri Gemini'ga). `ELEVENLABS_API_KEY` yo'q bo'lsa — avtomatik shu usul.
4. **Kontekst:** qo'ng'iroq boshida mijoz o'quvchining haqiqiy ma'lumotini yuboradi (`src/lib/liveContext.ts`): daraja, maqsad, kuniga daqiqa, imtihongacha kun, bugungi reja (dars nomlari, sabab), takrorlanadigan xatolar, saqlangan xatolar soni, oxirgi o'tilgan darslar. Server qisqartiradi, yo'nalishlarni oq ro'yxatdan tekshiradi va salomlashish ko'rsatmasiga `LEARNER CONTEXT` qilib qo'shadi. Ustoz suhbatni shu asosda olib boradi: dars haqidagi savollarga javob beradi, "menga o'rgat" desa o'rgatadi (ikkita-uchta misol, bitta gapni aytdiradi, tekshiradi), kichik topshiriq beradi va javobini tekshiradi. To'qilgan dars/ball aytmaydi.
5. **Navigatsiya:** "darsga o't / darsni och / open the lesson / открой урок / сабаққа өтейік …" (6 til), "rejani och", "xatolarimni och", "o'yinlarga o't" kabi **aniq buyruq** aytilsa, tugma ko'rsatilmaydi: ustoz bir gap bilan tasdiqlaydi va u gapni tugatgach (ko'pi 7 s) qo'ng'iroq yakunlanadi (suhbat xotirasi saqlanadi) va ilova o'sha sahifani ochadi (bugungi rejadagi birinchi dars `#/learn/<id>`). "Menga o'rgat", dars haqida savol — navigatsiya emas, suhbat davom etadi. (`navIntent` — `server/live.ts`; qo'ng'iroqda bir marta.)
6. **Vaqt:** tugashidan 25 s oldin ustoz fikrini tugatib xayrlashadi. Chegara turi mijozga aytiladi: sessiya (10 daqiqa) tugaganda obuna taklif qilinmaydi, kunlik/oylik daqiqa tugaganda taklif qilinadi.
7. **Ustozni to'xtatish:** ustoz gapirayotganda ekranga ataylab tegish ustozni to'xtatadi (qolgan eski ovozi tashlanadi). Shovqin ustozni bo'lmaydi: tegilmagan paytdagi ovoz serverga ham, Scribe'ga ham, Gemini'ga ham bormaydi.

## Protokol (WebSocket `/api/ai/live?ptt=1&ctx=1`, token — subprotocol sarlavhasida)
Mijoz → server: ikkilik 16 kHz PCM16 (faqat tegib turilganda); `{type:'ctx', ctx}` (ulanishdan keyin birinchi); `{type:'activity', on}`; `{type:'end'}`.
Server → mijoz: ikkilik 24 kHz PCM16 (ustoz ovozi); `ready{capSec, ptt, asr}`, `in{text}` (Scribe matni), `out{text}`, `turn`, `interrupted`, `emotion`, `noVoice` (Scribe bo'sh matn qaytardi yoki navbat juda qisqa), `navigate{route, kind}`, `limit{kind, message}`, `error`.
`ptt=1` yubormaydigan eski (keshlangan) mijozlar qo'lsiz rejimda ishlashda davom etadi; `ctx=1` yubormasa — salomlashish kontekstni kutmaydi.

## Ovoz sifati
- Mikrofon → 16 kHz: oynali sinc past chastota filtri (`makeResampler`, `src/lib/liveCall.ts`; avvalgi "o'rtacha olish" aliasing berardi). Birlik testi: 12 kHz tovush kuchli bostiriladi, kadrlab berilsa natija o'zgarmaydi.
- Tanish rejimida bosilgan zahoti yoziladi (client'da ovoz chegarasi yo'q); Gemini ovozni o'zi eshitadigan zaxira rejimda juda past chegara (RMS 0.004) va 1 soniyadan uzoq bosilgan navbat baribir yuboriladi.

## Diagnostika (Railway jurnali; ovozning o'zi va matn yozilmaydi)
Qo'ng'iroq tugaganda: `[live] <id> 40s <model> (client) navbat=5 tanish=5/0/0 8s lvl=-22dB`
- `navbat` — tegib gapirilgan navbatlar soni; `tanish=ok/bo'sh/xato` — Scribe natijalari (bo'sh ko'p bo'lsa — mikrofon/shovqin muammosi; xato ko'p bo'lsa — limit yoki ElevenLabs);
- `8s` — yuborilgan ovoz soniyalari; `lvl` — o'rtacha ovoz balandligi (dBFS): −35 dan past bo'lsa mikrofon juda past; −15 dan baland bo'lsa kesilishi mumkin.
- Alohida `[stt] live 1.9s til=uzb belgi=42` qatorlari (til va belgi soni).

## Xarajat (o'zgargan joylar — egasi bilsin)
- Qo'shimcha: har bir navbat uchun Scribe (mavjud integratsiya, mavjud limitlar: foydalanuvchiga kuniga 40 daqiqa, platformaga 600 daqiqa). `transcribeLearner` tilni aniqlash uchun ko'pincha **ikki so'rov** (avto + inglizcha) yuboradi — narx ≈ 2 × $0.4/soat × gapirilgan vaqt (taxminan 4 daqiqa gap uchun ~$0.05). `recordAiCost` (feature `stt`) orqali admin xarajat jadvalida ko'rinadi.
- Tejash: Gemini'ga ovoz kirishi (audio tokenlar) deyarli yo'qoladi, faqat matn boradi; Gemini chiqish ovozi o'zgarmagan.
- Qo'ng'iroq daqiqalari qayta sanalmaydi (faqat qo'ng'iroq davomiyligi hisoblanadi). Limit/narx/`LIVE_*` sozlamalari o'zgarmagan.

## Sinov
- Birlik: `server/live.test.ts` (ptt, tanish yo'li: WAV, matn → Gemini, bo'sh/qisqa navbat, xatoda ovoz Gemini'ga, ustozni to'xtatish va eski ovozni tashlash, navigatsiya buyruqlari, kontekst, vaqt eslatmasi, limit turi), `server/coach.test.ts`, `src/lib/ptt.test.ts`, `src/lib/liveCall.test.ts` (resampler), `src/lib/liveContext.test.ts`, `src/components/aiAvatar.test.ts`.
- Brauzer: `npx tsx e2e/voice.ts` (`npm run test:e2e` ichida): haqiqiy server + soxta Gemini Live + **soxta Scribe** (`STT_BASE_URL`) + fayldan soxta mikrofon. J1–J8: yuzga tegib boshlash, tegilmaguncha hech narsa yuborilmasligi, Scribe → matn, ustozni to'xtatish, Space, qulf, "darsga o'tamiz" navigatsiyasi, 6 xil ekran o'lchami (skrol yo'q, tugatish tugmasi ko'rinadi, yuz siljimaydi), sensorli ekranda istalgan joyga tegish. `E2E_ONLY=J5,J7` — tanlangan qadamlar; `E2E_SHOTS=<papka>` — ekran rasmlari.
- **Haqiqiy Gemini/Scribe bilan sinalmagan** (kalit/xarajat yo'q).

## Deploydan keyin tekshirish (haqiqiy telefon + desktop)
1. Telefon (kichik ekran ham): yuzga tegib qo'ng'iroqni boshlang — butun ekran, skrol yo'q, yuz va matn joyidan siljimaydi.
2. Ekranning istalgan joyiga tegib turib o'zbekcha gapiring: "Siz" qatorida to'g'ri matn chiqadi, ustoz javob beradi. Inglizcha aksentli gap ham.
3. Ustoz uzun gapirayotganda ekranga tegib to'xtating; tegmasangiz — fikrini tugatadi.
4. "Bugun nimani o'rganamiz?" / "bu darsda nima bor?" — ustoz rejadagi darslardan aytadi. "Menga o'rgat" — o'rgatadi, topshiriq beradi, javobingizni tekshiradi.
5. "Darsga o't" — ustoz bir gap aytadi va ilova dars sahifasini ochadi (tugma emas).
6. Railway jurnalida `[live] … tanish=ok/bo'sh/xato` qatorini ko'ring: `xato` yuqori bo'lsa — ElevenLabs/limit; `bo'sh` yuqori bo'lsa — mikrofon.
7. Muammo bo'lsa tezkor chora: Railway'da `LIVE_ASR=gemini` (Scribe o'chadi, ovoz Gemini'ga boradi) — kodni o'zgartirmasdan.

## Ma'lum cheklovlar
- Gemini Live'ning tilga rioya qilishi 100% kafolatlanmaydi (modelga ko'rsatma); noto'g'ri tilga o'tish himoyasi (`wrongLanguage`) o'zgarmagan.
- Tanish rejimida talaffuz haqida Gemini fikr bildira olmaydi (u faqat matnni ko'radi); grammatika va so'z tanlash xatolari matndan aniq ko'rinadi.
- Navigatsiya faqat aniq buyruqlar bo'yicha (regex, 6 til); boshqacha ifodalangan so'rov suhbat sifatida ko'riladi. Kerak bo'lsa Gemini function-calling bilan kengaytirish mumkin (haqiqiy modelda sinash kerak).
- Qo'ng'iroq dars sahifasiga o'tganda tugaydi (suhbat xotirasi saqlanadi); darsdan qaytgach yangi qo'ng'iroq boshlanadi.
