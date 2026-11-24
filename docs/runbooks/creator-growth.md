# Creator Growth: tracking, atribusiya, mukofot daftari (qisqa runbook)

Holat 2026-11-24. Bu hujjat joriy KOD bilan tekshirilgan (`server/creator*.ts`); `docs/audit/master-spec-v2/CREATOR_PROGRAM_SPEC.md` — eski reja.

## Nima ishlaydi
- **Link:** creator Creator kabinetida bio/Reel/TikTok/Telegram/YouTube/kampaniya uchun alohida link yaratadi. Qisqa havola: `https://sellzen.uz/r/<kod>`. Kod `ref_code` alifbosida (8 belgi), shuning uchun eski `?ref=KOD` va Telegram `ref_KOD` oqimi o'zgarishsiz ishlaydi (link kodi ham, eski shaxsiy kod ham tushuniladi).
- **Bridge:** `/r/<kod>` yengil HTML (SPA yuklanmaydi): "Veb-saytda davom etish" yoki "Telegram'da ochish" (`t.me/<bot>?start=ref_<kod>`). 6 til; matnlar umumiy tarjima katalogidan (`trServer`).
- **Click:** `creator_clicks`. *Xom* = inson, takrorsiz; *noyob* = link + barmoq izi + kun bo'yicha birinchi; *filtrlangan* = bot/HEAD/UA yo'q/10 soniyalik takror/`CREATOR_INTERNAL_IPS`. Bridge JS ishlagach `landing_view` (botlar JS bajarmaydi).
- **Atribusiya:** FAQAT hisob yaratilganda (`attachAttribution`). `players.referred_by` — mavjud xulq (oxirgi tegilgan kod, 30 kun, birinchi bog'lash yutadi) O'ZGARMAGAN. `creator_attrib` ichida first-touch va last-touch alohida. Hisobot/komissiya krediti: `CREATOR_ATTRIBUTION=last|first` (standart `last` = `referred_by`).
- **Voronka** (serverda jadvallardan; mijozdan kelgan tushum/to'lov/bonus qiymatiga ishonilmaydi): noyob klik → sahifa ko'rildi → signup_start → ro'yxat → placement/mock/plan_open/birinchi dars → faollashdi (7 kun) → D7 (7–13-kunlar XP) → checkout → to'ladi → qaytarildi. Sof tushum = to'lov − qaytarilgan.
- **Post/video:** draft → submitted → needs_changes/approved/rejected; URL tekshiruvi (https, platforma domeni), dublikat aniqlash, qaror tarixi. Ko'rishlar soni creator yozgan — *tasdiqlanmagan*; `verified_views` faqat admin. Bio linki uchun post SHART EMAS.
- **Admin:** Admin → Hamkorlar (ro'yxat/filtr/status/profil, kampaniya, post tasdiqlash, gumonli holatlar, mukofot daftari, CSV). CSV faqat admin, faqat agregat.

## Mukofot — QOIDALAR (admin sozlaydi, standart O'CHIQ)
Mukofot kodda emas, **qoidalarda** (`creator_reward_rules`): model keyinchalik o'zgarsa — kod emas, qoida o'zgaradi. To'rt tur:
| Tur | Nimaga to'lanadi |
|---|---|
| `paid_pct` | o'quvchining muvaffaqiyatli, qaytarilmagan to'lovidan foiz |
| `activated_flat` | faollashgan o'quvchi boshiga qat'iy summa (7 kun ichida dars/daraja testi/mock; bir marta) |
| `first_paid_flat` | o'quvchining birinchi muvaffaqiyatli to'lovi boshiga qat'iy summa (bir marta) |
| `verified_views_per_1k` | ADMIN tasdiqlagan ko'rishlarning har 1000 tasi uchun (post chegarasi majburiy) |

**Hech qachon to'lanmaydi:** ro'yxatdan o'tganlik (signup) va creator yozgan (tasdiqlanmagan) ko'rishlar uchun.
Har qoidada: kutish davri (`hold_days`, standart 7: qaytarish/shubha vaqti), muddat (`window_days`, standart 180), creator chegarasi, umumiy byudjet, ixtiyoriy kampaniya/sana. Yoqish: summa/foiz + creator chegarasi + byudjet + "egasi tasdiqlagan" belgisi (audit jurnali). **Yoqilgan qoidani o'zgartirib bo'lmaydi — avval o'chiriladi.** Pul tiyinda (UZS), hozircha faqat UZS.
Hisoblash AVTOMATIK (har 6 soatda va "Hozir hisoblash"), faqat yoqilgan qoida bo'lsa; yozuvlar "kutilmoqda" bo'ladi: admin tasdiqlaydi (yoki rad etadi), "to'langan" faqat qo'lda (havola/izoh bilan) — to'lov integratsiyasi yo'q. Qaytarilgan to'lov (`creator_refunds`): komissiya mutanosib, birinchi-to'lov summasi faqat to'liq qaytarilsa teskari yozuv bilan ayriladi. Gumonli (o'z-o'zini taklif, bir qurilmadan ko'p hisob, click qayta ishlatilgan) o'quvchilar mukofot olmaydi.
**Admin ko'radi:** qoida bo'yicha sarflangan/byudjet, creator boshiga kutilmoqda/tasdiqlangan/to'langan/jami, KPI (mukofot xarajati, CAC), qo'lda bonus/tuzatish kiritish (sabab majburiy, qoida byudjetiga sanaladi).
**Creator ko'radi:** amaldagi shartlar, kutish davridagi taxminiy summa, kutilmoqda/tasdiqlangan/to'langan va o'z yozuvlari (to'lovchi, byudjet, to'lov identifikatori yo'q).
`CREATOR_COMMISSION_PCT` kabinet UI'sida endi ko'rsatilmaydi va daftarda ishlatilmaydi (API maydoni orqaga moslik uchun qoldi).

## DDL (faqat yangi jadvallar, `server/creatorSchema.ts`, `CREATE ... IF NOT EXISTS`)
`creator_links`, `creator_clicks`, `creator_click_events`, `creator_attrib`, `creator_profiles`, `creator_campaigns`, `creator_posts`, `creator_post_history`, `creator_flags`, `creator_reward_rules`, `creator_refunds`, `creator_ledger` (rule_id, parent_id), `creator_ledger_history` + indekslar. `players`, `payments`, `xp_events` o'zgarmagan. Orqaga qaytarish: jadvallarni o'chirish yetarli (boshqa kod ularga bog'liq emas; referral eski ustunlar bilan ishlaydi).

## Maxfiylik va saqlash
IP bazaga yozilmaydi. `fp` — tuz bilan xeshlangan (IP+brauzer) qisqa belgi: 90 kundan keyin tozalanadi; clicklar 180 kundan keyin o'chadi (`purgeCreatorData`, kuniga bir marta). Creator javoblarida o'quvchining ismi/Telegram ID/telefon/email/balli yo'q.

## Cheklovlar va egasi qarorlari
- Qurilmalar orasida (telefondagi click → kompyuterda ro'yxat) atribusiya yo'q: kod URL/Telegram orqali ko'chmasa bog'lanmaydi.
- Kutish davri/muddat (standart 7/180 kun) va first/last krediti — egasi tasdiqlashi kerak.
- Qoidalarning foizi/summasi/byudjeti (hozir faqat UZS) — egasi tasdiqlamaguncha yoqilmaydi. Ko'rishlar uchun mukofotni yoqish xavfi yuqori: faqat admin tasdiqlagan ko'rishlar va post chegarasi bilan.
