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

## Mukofot/komissiya — standart O'CHIQ
Daftar to'lov tizimi EMAS: hech narsa avtomatik to'lanmaydi, to'lov integratsiyasi yo'q. Yoqish (admin, audit jurnali bilan): foiz + creator chegarasi + umumiy byudjet (tiyinda) + "egasi tasdiqlagan" belgisi. Kampaniya mukofoti alohida yoqiladi (foiz, UZS, byudjet, chegara). `CREATOR_COMMISSION_PCT` kabinetda faqat ko'rsatish uchun qoldi; daftar uni ishlatmaydi. Komissiya faqat `payments.status='success'`, qaytarilmagan qismdan, faollashgan o'quvchidan; qaytarish admin qayd etadi (`creator_refunds`) va teskari yozuv yaratadi. `paid` faqat qo'lda (havola/izoh bilan).

## DDL (faqat yangi jadvallar, `server/creatorSchema.ts`, `CREATE ... IF NOT EXISTS`)
`creator_links`, `creator_clicks`, `creator_click_events`, `creator_attrib`, `creator_profiles`, `creator_campaigns`, `creator_posts`, `creator_post_history`, `creator_flags`, `creator_refunds`, `creator_ledger`, `creator_ledger_history` + indekslar. `players`, `payments`, `xp_events` o'zgarmagan. Orqaga qaytarish: jadvallarni o'chirish yetarli (boshqa kod ularga bog'liq emas; referral eski ustunlar bilan ishlaydi).

## Maxfiylik va saqlash
IP bazaga yozilmaydi. `fp` — tuz bilan xeshlangan (IP+brauzer) qisqa belgi: 90 kundan keyin tozalanadi; clicklar 180 kundan keyin o'chadi (`purgeCreatorData`, kuniga bir marta). Creator javoblarida o'quvchining ismi/Telegram ID/telefon/email/balli yo'q.

## Cheklovlar va egasi qarorlari
- Qurilmalar orasida (telefondagi click → kompyuterda ro'yxat) atribusiya yo'q: kod URL/Telegram orqali ko'chmasa bog'lanmaydi.
- Komissiya muddati (`window_days`, standart 180) va first/last krediti — egasi tasdiqlashi kerak.
- Mukofot foizi/byudjeti/valyutasi (hozir faqat UZS) — egasi tasdiqlamaguncha yoqilmaydi.
