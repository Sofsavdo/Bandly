# Runbook — Ovozli ustoz (Gemini Live): bosib-gapirish, vaqt, til, hissiyot

Holat: kod branch'da. Production'ga faqat egasi "Merge qil" degandan keyin chiqadi. Yangi pullik xizmat, yangi limit yoki narx yo'q:
mavjud `LIVE_*` sozlamalari va 10 daqiqalik sessiya chegarasi o'zgarmagan.

## Nima o'zgardi (Preppy/goprep.gg videolarini tahlil qilish asosida)
| Preppy'da | Sellzen'da endi |
|---|---|
| Mobil: avatarni bosib turib gapiriladi; qo'yib yuborilganda ustoz javob beradi | Avatar va pastdagi katta tugma — bosib turish. Qo'yib yuborish → ustoz javob beradi |
| Desktop: Probel (Space) bosib turiladi | Space bosib turish (matn maydonida ishlamaydi) |
| Atrofdagi shovqin ustozni bezovta qilmaydi | Tugma bosilmaganda mikrofon ovozi **serverga ham, Gemini'ga ham bormaydi** |
| Ustoz fikrini oxirigacha aytadi | Avtomatik "gapni bo'lish" o'chirilgan; ustozni faqat tugmani **ataylab bosish** to'xtatadi. Ko'rsatmada "2 gap" cheklovi o'rniga "to'liq fikr (2–5 gap)" |
| `00:34 / 10:00` taymer | `0:34 / 10:00` (haqiqiy ruxsat etilgan vaqt serverdan keladi: bepul — 5:00, obunachi — oylik qoldiqqa qarab, eng ko'pi 10:00) + progress chizig'i; oxirgi 30 soniya qizaradi |
| Suhbat mavzuga qarab davom etadi | Ustoz suhbat tilida **fikrni to'liq tugatadi**, tilni o'rtada almashtirmaydi; ingliz tiliga ataylab va e'lon qilib o'tadi |
| — | "Ingliz tilini o'rgat / teach me English" desa — mini-dars rejimi + ekranda **Darslarga o'tish** tugmasi (`#/learn`) |
| Avatar shakli/rangi hissiyotga qarab o'zgaradi (bulut, pufak, yurak, olovli qizil) | Yuzli avatar: holatga va hissiyotga qarab shakl+rang: navbat sizda — yashil tabletka; tinglash — ko'k tabletka; o'ylash — binafsha bulut; gapirish — shaftoli pufak (og'iz ovozga qarab ochiladi); quvonch — oval; iliq maqtov/g'urur ("qoyil", "proud of you") — pushti yurak; kulgi — sariq pufak; jahl — qizil tabletka (silkinadi, **olovsiz** — egasi avval olovni olib tashlashni so'ragan); hafsala — kulrang bulut + ko'z yoshi |
| Ekranda "YOU / PREPPY" matni | "SIZ / SELLZEN" oxirgi gaplar (qurilmada saqlanmaydi) |

## Qanday ishlaydi
- Mijoz `/api/ai/live?ptt=1` ga ulanadi (token — WebSocket subprotocol sarlavhasida, URL'da emas).
- Server Gemini'ga `automaticActivityDetection.disabled = true` + `activityHandling = START_OF_ACTIVITY_INTERRUPTS` yuboradi
  (nomlar rasmiy `google-genai` kutubxonasi 3.6.1 tiplaridan tasdiqlangan).
- Bosildi → mijoz `{type:'activity', on:true}`; server `realtimeInput.activityStart`. Qo'yib yuborildi → 250 ms "dum" (oxirgi so'z kesilmasin) → `activityEnd`.
- `ptt=1` ulanishda server tugma bosilmagan paytda kelgan ikkilik ovozni **tashlab yuboradi** (shovqin/ortiqcha ovoz Gemini'ga bormaydi, xarajat kamayadi); navbat 60 soniyadan keyin o'zi tugaydi; 400 tadan ortiq activity xabari e'tiborsiz.
- Qisqa tegish (< 300 ms) — **qulf**: yozuv davom etadi, keyingi tegish tugatadi (bosib tura olmaydiganlar uchun). 60 soniyada o'zi tugaydi.
- Ovoz kamida 200 ms "ovozli" bo'lmasa (jim/bloklangan mikrofon) — navbat Gemini'ga yuborilmaydi, "Ovoz eshitilmadi" xabari chiqadi. Chegara ataylab past (RMS 0.012): ataylab bosgan foydalanuvchi gapini tashlab yubormaslik uchun.
- Vaqt tugashidan 25 soniya oldin server ustozga "fikringni tugat, bitta maslahat ber va xayrlash" deb xabar beradi (to'satdan uzilmasin). Chegara turi mijozga aytiladi:
  `limit.kind = 'session'` (10 daqiqa — obuna taklif qilinmaydi) yoki `'quota'` (kunlik/oylik daqiqa — obuna havolasi).
- Eski (keshlangan) mijozlar `ptt=1` yubormaydi — ular avvalgidek qo'lsiz rejimda ishlashda davom etadi.
- Gemini Live ishlamasa — oddiy ovozli rejim (STT → matn AI → ovoz): u ham endi bosib-gapirish (tugma qo'yib yuborilguncha yozadi, sukutga qarab to'xtamaydi, shovqin bilan to'xtatilmaydi).

## Sozlamalar (o'zgarmagan)
`LIVE_MAX_SESSION_MINUTES` (standart 10), `LIVE_FREE_DAILY_MINUTES` (5), `LIVE_FREE_GLOBAL_DAILY_MINUTES`, `COACH_CALL_MONTH_MINUTES` — admin paneldan.
`LIVE_SILENCE_MS` faqat eski qo'lsiz rejimga ta'sir qiladi.

## Sinov
- Birlik: `server/live.test.ts` (sozlama, activity yo'naltirish, ovozni tashlash, darsga yo'naltirish, vaqt eslatmasi, limit turi), `server/coach.test.ts` (ko'rsatma), `src/lib/ptt.test.ts`, `src/components/aiAvatar.test.ts`.
- Brauzer: `npx tsx e2e/voice.ts` (`npm run test:e2e` ichida): haqiqiy server + **soxta Gemini** + fayldan soxta mikrofon; J1–J5. `E2E_SHOTS=<papka>` — ekran rasmlari.
- **Haqiqiy Gemini bilan sinalmagan** (kalit/xarajat yo'q): `activityStart/End` yuborilishi va ustozning "to'liq fikr/til" xulqi haqiqiy qurilmada egasi yoki QA tomonidan bir marta tekshirilishi kerak (chek-list pastda).

## Deploydan keyin tekshirish (haqiqiy telefon + desktop)
1. Telefon: qo'ng'iroq → avatarni bosib turib gapiring → qo'yib yuborganda ustoz javob beradi; tugma bosilmaganda atrofdagi shovqin/gap ustozga ta'sir qilmaydi.
2. Ustoz uzun gapirayotganda gapirmang — u fikrini tugatadi; avatarni bosing — ustoz to'xtab, sizni tinglaydi.
3. Desktop: Space bosib turib gapiring; matn maydonida Space yozuvni boshlamaydi.
4. O'zbekcha gapiring — ustoz o'zbekcha fikrni to'liq tugatadi; "ingliz tilini o'rgat" deng — mini-dars + "Darslarga o'tish" tugmasi.
5. Bepul hisobda taymer `/ 5:00`; obunachida eng ko'pi `/ 10:00`; vaqt tugashidan oldin ustoz xayrlashadi, "obuna" havolasi **faqat** kunlik/oylik daqiqa tugaganda chiqadi.
6. Muammo bo'lsa: PR'ni qaytarish (revert) — server eski qo'lsiz rejimni ham qo'llab-quvvatlaydi, qolgan hech narsa (baza, limitlar) o'zgarmagan.

## Ma'lum cheklovlar
- Bosib turish — Preppy kabi; qo'lsiz (hands-free) rejim endi yo'q. Kerak bo'lsa, `startLive({ ptt: false })` bilan qaytarish mumkin (server tayyor), lekin tugma/UI yo'q.
- Gemini'ning tilga rioya qilishi 100% kafolatlanmaydi (modelga ko'rsatma); noto'g'ri tilga o'tish himoyasi (`wrongLanguage`) o'zgarmagan.
- Avatar yuzi yangi (brend belgisi o'rniga); brend belgisi sahifa tepasida qoladi.
