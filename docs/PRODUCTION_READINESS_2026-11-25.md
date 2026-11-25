# Sellzen: ishlab chiqarishga tayyorlik auditi (2026-11-25)

Bu hujjat reklama boshlashdan oldingi tekshiruv natijasi: nima tekshirildi, nima tuzatildi, nima hali egasi tomonidan hal qilinishi kerak.

## 1. Tekshirilgan joylar

| Soha | Qanday tekshirildi | Natija |
|---|---|---|
| Production holati | Railway: deploy, 24 soatlik 5xx darajasi, CPU/xotira/disk, jurnaldagi xatolar | 5xx — 0,31% (2870 so‘rovda 9 ta), resurslar bo‘sh (xotira 0,25 / 8 GB). Xatolar asosan Gemini (503 band, 429 limit, vaqt tugadi) |
| Kontent tuzilishi | `npm run test:ci` (barcha darslar, mashq javoblari, vokabulyar, takrorlar), inglizcha matnlarni lug‘at bilan imlo tekshiruvi, takroriy misollar | 396 dars, 1584 misol; takror — 10 ta misol (ahamiyatsiz); inglizcha imlo xatosi topilmadi (noto‘g‘ri variantlar ataylab) |
| Tarjimalar | 5 tilda to‘liqlik, alifbo, aralash yozuv, raqam/o‘rinbosar mosligi, tillararo so‘z aralashuvi, atamalar izchilligi | Quyida «Tuzatilganlar» |
| Interfeys | Brauzerda 6 til × 3 kenglik (320/360/390 px) × 18 sahifa: gorizontal siqilish, tarjimasiz matn, JS xatolari | Tarjimasiz o‘zbekcha matn topilmadi; JS xatosi yo‘q; o‘quv xaritasida uzun bo‘lim nomlari chetdan chiqardi — tuzatildi |
| Xavfsizlik/sarlavhalar | `curl -I`, HTTPS, kesh, siqish | HTTPS, `nosniff`, `referrer-policy`, `permissions-policy` bor; CSP va `X-Frame-Options` yo‘q (Telegram Mini App uchun ataylab ochiq) |
| Huquqiy | Kod va sahifalar qidirildi | Maxfiylik va foydalanish shartlari sahifasi **yo‘q edi** — qo‘shildi |
| Reklama kuzatuvi | UTM/click-id qidirildi | UTM yo‘q; lekin «hamkor havolasi» (`/r/<kod>`) voronkani (bosish → ro‘yxat → faollashish → to‘lov) o‘lchaydi |

## 2. Tuzatilganlar (shu PR)

1. **Tarjima atamalari**
   - Qirg‘izcha: «majhul nisbat» noto‘g‘ri «туюк» deb berilgan edi (бу «yopiq» degani) — «ырксыз мамиле» ga o‘zgartirildi.
   - Qirg‘izcha: inglizcha so‘zga qo‘shimchalar yopishtirib yozilgan (254 matn, masalan «Speakingде») — defis bilan ajratildi.
   - Qirg‘izcha: O‘zbekiston puli «сом» (bu Qirg‘iziston puli) deb yozilgan edi — «сум».
   - Tojikcha: «majhul» shakli 3 xil yozilgan (мачҳул / мафъулӣ / сиғаи мафъулӣ) — «маҷҳул» ga birlashtirildi; «ball» ba’zan «хол» (nuqta/benuqson) edi — «бал».
   - Qozoqcha: «Boss» «Бос» (qozoqchada «bo‘sh») deb yozilgan edi — «Босс».
   - Imlo xatolari (lotin harflar kirill so‘z ichida, qozoq harfi qirg‘izchada) tuzatildi.
2. **O‘quv xaritasi**: bo‘lim nomi (masalan «Dalil va manbalarni tanqidiy tahlil qilish») telefon ekranidan chiqib ketardi — endi qatorga bo‘linadi va chetga surilmaydi.
3. **Aniqlik**: bosh sahifadagi «Ovozim saqlanadimi?» javobi «faqat matn yuboriladi» degan edi, vaholanki ovozli ustoz bilan gaplashganda ovoz AI xizmatlariga real vaqtda uzatiladi (yozib saqlanmaydi). Javob to‘g‘rilandi.
4. **Huquqiy sahifalar**: `/maxfiylik`, `/shartlar` (o‘zbekcha) va `/ru/konfidentsialnost`, `/ru/usloviya` (ruscha); pastki qism va kirish sahifasida havola; sitemap’da.
5. **Hisobni o‘chirish** (maxfiylik huquqi). Ilgari foydalanuvchi o‘z ma’lumotlarini o‘chirishning hech qanday yo‘li yo‘q edi. Endi `Profil → Hisobni o‘chirish`: shaxsiy ma’lumotlar (progress, natijalar, ustoz xotirasi, telefon, sessiyalar, hodisalar) o‘chiriladi, hisob anonimlashtiriladi, to‘lov va obuna yozuvlari hisob-kitob uchun anonim holda qoladi. Xodim hisobini o‘chirib bo‘lmaydi. `server/erase.ts` + `server/erase.test.ts`.

## 3. Reklamadan oldin egasi hal qilishi kerak

Bular kod bilan hal bo‘lmaydi yoki egasining qarori kerak:

- **Yuridik shaxs ma’lumotlari.** Maxfiylik va shartlar sahifasida kompaniya nomi, STIR, manzil, aloqa telefoni yo‘q (faqat Telegram `@Sellzenbot`). Reklama platformalari va to‘lov xizmatlari buni so‘rashi mumkin. Matnni yurist ko‘zdan kechirsin.
- **Ma’lumotlarni O‘zbekistonda saqlash talabi.** O‘zbekiston qonunchiligi fuqarolarning shaxsiy ma’lumotlarini mamlakat ichidagi serverda saqlashni talab qilishi mumkin. Hozir hosting Railway (Yevropa, `europe-west4`). Yurist bilan tekshiring.
- **To‘lovni qaytarish siyosati** (shartlarda faqat «alohida ko‘rib chiqiladi» deyilgan).
- **Gemini (AI) limiti.** Jurnalda 429 `RESOURCE_EXHAUSTED` va 503 xatolari bor. Reklama bilan yuklama oshadi: Google AI hisobida to‘lov/limitni oshirish va `AI_GLOBAL_DAILY_CALLS` qiymatini tekshirish kerak.
- **ElevenLabs krediti.** Hisobda 40 000 dan ~9 000 belgi qoldi (Starter, 18-dekabrda yangilanadi). Yangi A2–C2 darslari uchun ~88 000 belgilik ovoz hali yaratilmagan (egasi: «ovozlash oxiriga qolsin»).
- **Tarjimalar ona tili egasi tomonidan tekshirilmagan** (ayniqsa qozoq, qirg‘iz, tojik). Reklamadan oldin har tildan bitta odam sahifalarni ko‘zdan kechirishi tavsiya etiladi.
- **Metodist ko‘rigi.** Barcha darslar `pilot` holatida.
- **Reklama havolalari.** Har kampaniya uchun admin panelida «hamkor» va unga `/r/<kod>` havola oching — shu orqali ro‘yxat va to‘lov kampaniyaga bog‘lanadi.

## 4. Kuzatish (reklama boshlangach)

- Railway: `http-error-rate` (5xx > 1% bo‘lsa tekshiring), `[ai]` jurnali (429 / 503), xotira.
- Admin: voronka (bosish → ro‘yxat → faollashish → to‘lov), AI xarajati.
- ElevenLabs hisobi (ustoz ovozi va nutqni tanish shu kreditdan ketadi).
