# Telegram aloqa xabarlari

Telegram’ga ulangan har bir o‘quvchiga **kamida 2–3 kunda bitta** qisqa, foydali xabar yuboriladi. Maqsad — o‘quvchini ilovaga qaytarish, spam qilmasdan.

## Qanday ishlaydi
- Har 10 daqiqada tekshiriladi; faqat **18:00–21:00 (Toshkent)** oralig‘ida yuboriladi.
- Xabar oxirgi bot xabaridan (aloqa xabari, seriya eslatmasi yoki liga natijasi) **kamida 2 kun** o‘tgan o‘quvchiga yuboriladi. Shuning uchun bitta odam kuniga bittadan ko‘p xabar olmaydi.
- Yangi hisobga dastlabki 20 soatda yozilmaydi.
- 6 xil xabar aylanib keladi (dars, Sellzen ustoz bilan gaplashish, so‘z o‘yini, reyting, mock test, kichik odat). Har birida ilovaning tegishli sahifasini ochadigan tugma bor.
- Matn o‘quvchining tilida (en, ru, kk, ky, tg, uz) yuboriladi.
- Har xabarda `/stop` haqida eslatma bor. `/stop` — to‘xtatish, `/remind` — qayta yoqish. Bot bloklangan bo‘lsa, shu odamga xabarlar avtomatik o‘chadi.
- `TG_REMINDERS=1` yoqilgan bo‘lsa, seriyasi bor va bugun o‘qimagan o‘quvchiga umumiy xabar yozilmaydi: unga seriya eslatmasi boradi.

## Sozlama
| O‘zgaruvchi | Ma’no |
|---|---|
| `TG_NUDGES` | Sukut bo‘yicha yoqilgan. `0` — butunlay o‘chirish |
| `TG_REMINDERS=1` | Seriya eslatmalari va liga natijalari (alohida, sukut bo‘yicha o‘chiq) |

## Kod
`server/nudges.ts` (mantiq va matnlar), `server/nudges.test.ts` (test). Jurnalda: `nudges sent: N`.

## Eslatma
Birinchi yoqilganda hech qachon xabar olmagan barcha ulangan o‘quvchilar (har aylanishda 200 tagacha) navbat bilan xabar oladi.
