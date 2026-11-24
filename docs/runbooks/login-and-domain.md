# Kirish usullari va domen (qisqa runbook)

Saytda **faqat uchta** kirish usuli bor: Telegram, telefon raqam + parol, Google. Eski "hisob kodi" bilan kirish olib tashlangan.

## Telegram
- Vidjet faqat BotFather'da belgilangan domenda ishlaydi: `/setdomain` → `PUBLIC_URL` dagi host (hozir `sellzen.uz`). Boshqa domenda vidjet ko'rsatilmaydi, asosiy manzilga havola chiqadi.
- Tekshirish: `https://oauth.telegram.org/embed/Sellzenbot?origin=https://sellzen.uz` — "Bot domain invalid" chiqmasligi kerak.
- Vidjet 7 soniyada chiqmasa foydalanuvchiga boshqa usul tavsiya qilinadi, `login_widget_missing` hisoblagichi yoziladi (Admin → analitika).

## Telefon raqam + parol
- Parol faqat scrypt xeshi sifatida saqlanadi. 5 ta xato urinish/15 daqiqa (raqamga), 20 ta/15 daqiqa va 10 ta yangi hisob/soat (IP'ga).
- **Cheklov:** raqam SMS bilan tasdiqlanmaydi va parolni tiklash yo'q (SMS provayder — pullik servis, egasi roziligi kerak). Parol esdan chiqsa, foydalanuvchi Telegram yoki Google bilan kiradi.

## Google
- Google Cloud Console → APIs & Services → Credentials → OAuth client (Web). **Authorized JavaScript origins:** `https://sellzen.uz` (va kerak bo'lsa `https://www.sellzen.uz`).
- Railway Variables: `GOOGLE_CLIENT_ID=<client id>` (maxfiy emas, lekin jurnalga yozilmaydi). O'rnatilmaguncha Google tugmasi ko'rinmaydi.
- Server ID tokenni Google JWKS bilan o'zi tekshiradi (RS256, `aud`, `iss`, muddat, `email_verified`). Faqat `sub` saqlanadi.

## Domen va Cloudflare
- `sellzen.uz` va `www.sellzen.uz` Cloudflare orqali (proxied), SSL/TLS rejimi **Full**.
- Ba'zi mobil tarmoqlarda `ERR_QUIC_PROTOCOL_ERROR` / `ERR_CONNECTION_RESET` chiqsa: Cloudflare → Network → **HTTP/3 (QUIC) o'chiq**; SSL/TLS → Edge Certificates → **Encrypted Client Hello o'chiq**. Tekshirish: `curl -sI https://sellzen.uz | grep -i alt-svc` — `h3` bo'lmasligi kerak.
- Serverda domenlar orasida 301 yo'naltirish **qilinmaydi** (brauzer 301 ni uzoq eslab qoladi — 2026-11-23 hodisasi). Yo'naltirish kerak bo'lsa, Cloudflare'da vaqtinchalik 302 qoidasi bilan.
- Railway'dagi apex sertifikat holati `VALIDATING_OWNERSHIP` bo'lib turishi mumkin — Cloudflare proksi bo'lgani uchun foydalanuvchiga ta'sir qilmaydi.

## Eski (bog'lanmagan) hisoblar
- Faqat token bilan ochilgan eski hisob Profil → "Hisobingizni bog'lang" orqali Telegram/Google/telefonga bog'lanadi; XP, progress va obuna saqlanadi.
- Bog'lanmagan hisobdan chiqishda ogohlantirish va "Hisobni bog'lash" tugmasi chiqadi (qayta kirish yo'li yo'q).
