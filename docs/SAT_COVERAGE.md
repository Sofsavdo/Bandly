# Digital SAT kursi qamrovi (Sellzen)

Sellzen endi Digital SAT uchun **to‘liq darslik** va **katta savollar banki** beradi (avval faqat 17 ta mashq savoli bor edi).

## Darslik (`#/sat`)

- **29 dars / 8 bo‘lim**, har bir dars: tushuntirish, jadval, misollar, SAT-uslubidagi mashq va yakuniy nazorat (kalit joylari tekis taqsimlangan).
- Ketma-ketlik: darslar tartib bilan ochiladi (o‘tilgan dars qayta qulflanmaydi); keyingi dars tugmasi R&W dan Math ga sakramaydi.
- Bepul tarifda kuniga 1 ta yangi dars (`course: 'sat'`).

| Bo‘lim (rasmiy domen) | Dars soni |
|---|---|
| R&W — Standard English Conventions: gap chegaralari, ega–kesim moslashuvi, tinish belgilari, olmosh/parallellik | 4 |
| R&W — Expression of Ideas: transitions, rhetorical synthesis, qisqalik va aniqlik | 3 |
| R&W — Craft and Structure: words in context, matn tuzilishi va vazifa, cross-text | 3 |
| R&W — Information and Ideas: asosiy fikr/detail, dalil (matn va grafik), inference | 3 |
| Math — Algebra: chiziqli tenglama, chiziqli funksiya, sistema, tengsizlik | 4 |
| Math — Advanced Math: ifodalar, kvadrat tenglama, ko‘rsatkichli funksiya, funksiya yozuvi | 4 |
| Math — Problem-Solving and Data Analysis: nisbat, foiz, statistika, ehtimollik | 4 |
| Math — Geometry and Trigonometry: yuza/hajm, burchaklar, aylana, trigonometriya | 4 |

## Savollar banki

- **R&W**: 8 ta asosiy + 81 ta bank savoli (har domen ≥ 20).
- **Math**: 9 ta asosiy + 80 ta bank savoli (har domen 20; ≈ 25% “student-produced response”).
- Mashq oynasida mavzu (domain) bo‘yicha filtr va 10 tadan to‘plamlar; natija mavzular kesimida.
- Math kalitlari `satPractice.test.ts` da mustaqil hisoblanadi; R&W javoblar o‘rni (A–D) tekis taqsimlanadi.

## Halol cheklovlar

- Barcha savol va darslar Sellzen’ning **original** matnlari; College Board materiali emas, SAT bali **baholanmaydi**.
- Kontent holati `pilot`: metodist ko‘rigidan o‘tmagan.
