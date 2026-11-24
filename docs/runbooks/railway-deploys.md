# Railway: deploy paytidagi uzilish va uni kamaytirish

**Holat (2026-11-24, tekshirilgan):** servis `bandly`/production, 1 nusxa, `/data` hajmi (SQLite) ulangan, healthcheck `/api/health`.
Hajmli servisda Railway eski va yangi nusxani bir vaqtda ushlay olmaydi: yangi versiya chiqqanda eski konteyner to'xtatiladi, keyin yangisi
ko'tariladi — bu **3–15 soniyalik uzilish** (shu paytda 502/503, ochiq ovozli qo'ng'iroqlar uziladi). Bu xato emas, hajm (volume) tufayli.
Jurnalda `Stopping Container` → `Starting Container` oralig'i ~1–3 s, ilovaning o'zi yana ~2–3 s da ishga tushadi.

## Nima qilingan
| Chora | Joyi | Natija |
|---|---|---|
| `RAILWAY_DEPLOYMENT_DRAINING_SECONDS=10` | Railway service variable | SIGTERM dan keyin SIGKILL gacha 10 s beriladi (oldin 0 — ochiq so'rovlar darhol uzilardi) |
| Toza o'chirish | `server/index.ts` (SIGTERM) | yangi ulanish yo'q, bo'sh keep-alive yopiladi, 5 s dan keyin qolganlari, 8 s da chiqish |
| Salomatlik tekshiruvi | `/api/health` | baza javob bermasa yoki o'chirilayotgan bo'lsa 503 (Railway yangi nusxani faqat sog'lom bo'lsa faol qiladi) |
| Mijoz qayta urinishi | `src/lib/netRetry.ts` | faqat GET/HEAD `/api/*`: tarmoq xatosi yoki 502/503/504 da 0.7/1.6/3.2 s kutib 3 marta qayta uriniladi (yozuvlar qayta yuborilmaydi) |
| Eski sahifa | `vite:preloadError` (main.tsx) | deploydan keyin yo'qolgan chunk — sahifa o'zi bir marta yangilanadi |

## Amaliy qoidalar
- **Merge'larni to'plang:** har merge = bitta deploy = bitta uzilish. Kun davomida 5 ta kichik PR o'rniga 1–2 ta to'plam.
- **Vaqt:** chiqarishni Toshkent vaqti bilan 02:00–07:00 yoki ish kunlari 10:00–16:00 ga qo'ying; 18:00–23:00 (eng ko'p ovozli suhbat) da emas.
- **Tekshiruv:** deploydan keyin 2 daqiqa ichida `http-error-rate` va `[live]` jurnallarini ko'ring. Normal: 1 ta 5xx (deploy oynasi), keyin 0.
- **Haqiqiy uzilmaydigan deploy** kerak bo'lsa: SQLite → Postgres (Railway) ga o'tish va ≥2 nusxa. Hozirgi hajm uchun bu shart emas.
- **Restart siyosati:** `restartPolicyMaxRetries=5` — ketma-ket 5 marta qulasa servis to'xtab qoladi; qulash haqida ogohlantirish (Railway Notifications → Deploy failed/Crashed) yoqilgan bo'lsin.
- **AI band bo'lsa** (Gemini 503/"vaqt tugadi"): bu Railway emas, provayder sig'imi — zaxira model zanjiri ishlaydi (jurnal: `zaxira ... javob berdi`). Doimiy bo'lsa: ikkinchi provayder kaliti (egasi tomonidan).
