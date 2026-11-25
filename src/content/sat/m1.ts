import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// SAT kursi — Math (1/2): Algebra. ORIGINAL Sellzen materiali; yechimlar sonlar bilan, izohlar iloji boricha formulalar tilida.
export const SAT_MATH_ALGEBRA: Unit = {
  id: 'sat-m1', level: 'B2', title: 'SAT Math: Algebra', titleUz: 'SAT Math: algebra',
  situationUz: 'Digital SAT Math ning eng katta bo‘limlaridan biri: chiziqli tenglamalar, chiziqli funksiyalar va grafiklar, tenglamalar sistemasi, tengsizliklar.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-m1-l1', title: 'Linear equations in one variable', titleUz: 'Bir o‘zgaruvchili chiziqli tenglamalar',
      objectiveUz: 'ax + b = c ko‘rinishidagi tenglamalarni tez yechasiz, yechim yo‘q va cheksiz ko‘p yechim holatlarini ajratasiz va so‘zli masalani tenglamaga aylantirasiz.',
      objective: 'Solve linear equations quickly, tell apart one, no and infinitely many solutions, and turn word problems into equations.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Bir o‘zgaruvchili chiziqli tenglama: ax + b = c. Yechish — x ni yolg‘iz qoldirish: avval b ni ikkala tomondan ayiring, keyin a ga bo‘ling. Doim tenglamaning ikki tomoniga BIR XIL amal qo‘llang. Qavslar bo‘lsa avval oching (distributiv qonun), so‘ng o‘xshash hadlarni jamlang.',
        'SAT da tez-tez uchraydigan uch holat: (1) bitta yechim — x oldidagi koeffitsientlar teng emas; (2) yechim yo‘q — soddalashtirgach 0 = 5 kabi yolg‘on tenglik chiqadi (x lar ikki tomonda teng, erkin hadlar boshqa); (3) cheksiz ko‘p yechim — 0 = 0 chiqadi. “Which value of k gives no solution?” savolida x oldidagi koeffitsientlarni tenglang, erkin hadlarni teng QILMANG.',
        'So‘zli masala: o‘zgaruvchini aniq ta’riflang (t = xabarlar soni), tenglama tuzing (12 + 0,05t = 15,50), yeching va javobni savolga moslang (butun son bo‘lishi kerakmi?). Tez usul: javob variantlarini tenglamaga qo‘yib tekshirish (backsolving) — SAT da ruxsat etilgan va vaqt tejaydi. Doim oxirgi javobni asl tenglamaga qo‘yib tekshiring.',
      ],
      table: [
        { form: 'ax + b = c → x = (c − b) / a', example: '3x + 7 = 22 → x = 5' },
        { form: '0 = 0 → cheksiz ko‘p yechim', example: '2(x + 1) = 2x + 2' },
        { form: '0 = 5 → yechim yo‘q', example: '2x + 3 = 2x + 8' },
      ],
      examples: [
        { en: '3x + 7 = 22  →  3x = 15  →  x = 5', uz: 'Avval 7 ni ayiring, keyin 3 ga bo‘ling.' },
        { en: '2(x − 4) = 10  →  x − 4 = 5  →  x = 9', uz: 'Avval 2 ga bo‘ling yoki qavsni oching.' },
        { en: '2x + 3 = 2x + 8  →  3 = 8 (false)  →  no solution', uz: 'Yolg‘on tenglik chiqdi — yechim yo‘q.' },
        { en: '12 + 0.05t = 15.50  →  0.05t = 3.50  →  t = 70', uz: 'Obuna narxi masalasi: 3,50 / 0,05 = 70.' },
      ],
      vocab: [{ en: 'variable', uz: 'o‘zgaruvchi' }, { en: 'coefficient', uz: 'koeffitsient' }, { en: 'constant', uz: 'o‘zgarmas (erkin had)' }, { en: 'equation', uz: 'tenglama' }],
      practice: [
        ch('If 4x − 9 = 15, what is the value of x?', ['4', '6', '8', '24'], 1, '4x = 24 → x = 6.'),
        ch('If 2(x + 3) = 18, what is the value of x?', ['3', '6', '9', '12'], 1, 'x + 3 = 9 → x = 6.'),
        gap('If 5x + 2 = 3x + 14, what is the value of x? ___', ['6', '6.0'], '2x = 12 → x = 6.'),
        ch('How many solutions does 3(x + 2) = 3x + 6 have?', ['None', 'Exactly one', 'Exactly two', 'Infinitely many'], 3, '3x + 6 = 3x + 6 → 0 = 0: cheksiz ko‘p.'),
        gap('For what value of k does 5x + 3 = kx + 3 have infinitely many solutions? k = ___', ['5'], 'Koeffitsientlar teng bo‘lishi kerak (erkin hadlar allaqachon teng): k = 5.'),
        multi('Choose ALL equations with exactly one solution.', ['2x + 1 = 7', '3x = 3x + 1', '4x − 2 = 4x − 2', '5x + 5 = 20', 'x + x = 2x + 3'], [0, 3], '2x+1=7 → x=3; 5x+5=20 → x=3. Qolganlarida 0=1, 0=0, 0=3 chiqadi.'),
      ],
      check: [
        ch('If 7x − 5 = 30, what is the value of x?', ['3', '4', '5', '6'], 2, '7x = 35 → x = 5.'),
        ch('If (x − 2) / 3 = 4, what is the value of x?', ['6', '10', '12', '14'], 3, 'x − 2 = 12 → x = 14.'),
        gap('A taxi charges $3 plus $2 per kilometer. A fare was $19. How many kilometers? ___', ['8', '8.0'], '3 + 2d = 19 → 2d = 16 → d = 8.'),
        ch('For which values of k does 3x + 4 = 3x + k have NO solution?', ['k = 4', 'any k ≠ 4', 'k = 0', 'no value of k'], 1, 'x qismi teng; erkin hadlar farq qilsa yechim yo‘q: k ≠ 4.'),
        gap('If 3(2x − 1) = 15, then x = ___', ['3', '3.0'], '6x − 3 = 15 → 6x = 18 → x = 3.'),
        multi('Choose ALL true statements.', ['An equation that simplifies to 0 = 0 has infinitely many solutions.', 'An equation that simplifies to 0 = 7 has no solution.', 'Every linear equation has exactly one solution.', 'Backsolving with the answer choices is allowed.', 'Open parentheses before combining like terms.'], [0, 1, 3, 4], 'Har bir chiziqli tenglamaning bitta yechimi bor degan fikr noto‘g‘ri.'),
      ],
    },
    {
      id: 'sat-m1-l2', title: 'Linear functions and graphs', titleUz: 'Chiziqli funksiyalar va ularning grafiklari',
      objectiveUz: 'Qiyalik va kesishma bilan y = mx + b ni tuzasiz, grafikni va jadvalni o‘qiysiz, parallel va perpendikulyar chiziqlarni topasiz va masaladagi m, b ma’nosini izohlaysiz.',
      objective: 'Write y = mx + b from a slope and a point, read graphs and tables, find parallel and perpendicular lines and interpret m and b in context.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Chiziqli funksiya: y = mx + b. m — qiyalik (slope) = (y₂ − y₁) / (x₂ − x₁): x bir birlikka oshganda y qanchaga o‘zgaradi. b — y-kesishma (y-intercept): x = 0 dagi qiymat. Standart shakl Ax + By = C da qiyalik −A / B. Ikki nuqta berilsa: avval m, keyin bitta nuqtani qo‘yib b ni toping.',
        'So‘zli masalada m — “har bir … uchun o‘zgarish” (rate), b — boshlang‘ich qiymat. “Hisob 500 dollardan boshlanib, haftasiga 20 dollarga kamayadi” → y = 500 − 20x: qiyalik −20, kesishma 500. “What does 20 represent?” — haftalik kamayish. Birliklarga e’tibor bering: qiyalik birligi = y birligi / x birligi.',
        'Parallel chiziqlarning qiyaligi teng; perpendikulyar chiziqlarning qiyaliklari ko‘paytmasi −1 ga teng (m₁ · m₂ = −1; teskari va qarama-qarshi ishorali). Gorizontal chiziq y = c (qiyalik 0); vertikal chiziq x = c (qiyalik aniqlanmagan). Nuqta chiziqda yotadimi — koordinatalarini tenglamaga qo‘yib tekshiring.',
      ],
      table: [
        { form: 'm = (y₂ − y₁) / (x₂ − x₁)', example: '(1, 3), (3, 7) → m = 2' },
        { form: 'y = mx + b', example: 'y = 2x + 1' },
        { form: 'Ax + By = C → m = −A / B', example: '2x + 3y = 6 → m = −2/3' },
      ],
      examples: [
        { en: '(1, 3) and (3, 7): m = (7 − 3)/(3 − 1) = 2;  b = 3 − 2·1 = 1;  y = 2x + 1', uz: 'Avval qiyalik, keyin kesishma.' },
        { en: 'y = 500 − 20x: starts at 500 and decreases by 20 each week', uz: '500 — boshlang‘ich qiymat, −20 — haftalik o‘zgarish.' },
        { en: '2x + 3y = 6  →  3y = −2x + 6  →  y = −(2/3)x + 2', uz: 'y ni yolg‘iz qoldirib qiyalikni toping.' },
        { en: 'Parallel to y = 3x + 2: slope 3.  Perpendicular: slope −1/3.', uz: 'Parallel — teng qiyalik; perpendikulyar — teskari va qarama-qarshi ishorali.' },
      ],
      vocab: [{ en: 'slope', uz: 'qiyalik' }, { en: 'intercept', uz: 'kesishma nuqtasi' }, { en: 'linear', uz: 'chiziqli' }, { en: 'rate', uz: 'o‘zgarish tezligi' }],
      practice: [
        gap('What is the slope of the line through (2, 5) and (6, 13)? ___', ['2', '2.0'], '(13 − 5) / (6 − 2) = 8 / 4 = 2.'),
        ch('What is the y-intercept of y = 4x − 7?', ['−7', '4', '7', '−4'], 0, 'b = −7.'),
        ch('The line 3x + 2y = 12 has slope', ['−3/2', '3/2', '−2/3', '2/3'], 0, '2y = −3x + 12 → y = −(3/2)x + 6.'),
        ch('A tank holds 80 L and loses 4 L every minute. Which equation gives the volume V after t minutes?', ['V = 80 + 4t', 'V = 80 − 4t', 'V = 4t − 80', 'V = 80t − 4'], 1, 'Boshlang‘ich 80, har daqiqada −4.'),
        gap('Line L is parallel to y = −2x + 9 and passes through (0, 3). Its equation is y = −2x + ___', ['3'], 'Parallel: m = −2; (0, 3) → b = 3.'),
        multi('Choose ALL points on the line y = 2x − 1.', ['(0, −1)', '(1, 1)', '(2, 4)', '(3, 5)', '(−1, −3)'], [0, 1, 3, 4], '(2, 4): 2·2 − 1 = 3 ≠ 4. Qolgan nuqtalar tenglamani qanoatlantiradi.'),
      ],
      check: [
        ch('A line has slope 3 and passes through (1, 2). Which is its equation?', ['y = 3x − 1', 'y = 3x + 2', 'y = 3x − 3', 'y = x + 3'], 0, 'y − 2 = 3(x − 1) → y = 3x − 1.'),
        gap('A line passes through (0, 4) and (2, 0). What is its slope? ___', ['-2', '−2'], '(0 − 4) / (2 − 0) = −2.'),
        ch('Which line is perpendicular to y = 2x + 1?', ['y = 2x − 1', 'y = −2x + 1', 'y = −(1/2)x + 3', 'y = (1/2)x + 3'], 2, 'Perpendikulyar qiyalik: −1/2.'),
        ch('A gym charges a $30 joining fee and $20 per month. Which equation gives the cost C after m months?', ['C = 30m + 20', 'C = 20m + 30', 'C = 50m', 'C = 20 + 30m'], 1, 'Boshlang‘ich 30, oylik 20: C = 20m + 30.'),
        gap('In y = 0.5x + 12, the number 12 is the ___ -intercept. (one letter)', ['y'], 'b — y-kesishma.'),
        multi('Choose ALL lines parallel to y = 3x − 4.', ['y = 3x + 7', 'y = −3x − 4', '3x − y = 1', 'y = (1/3)x', '6x − 2y = 5'], [0, 2, 4], 'Qiyalik 3: y = 3x + 7; 3x − y = 1 → y = 3x − 1; 6x − 2y = 5 → y = 3x − 2,5.'),
      ],
    },
    {
      id: 'sat-m1-l3', title: 'Systems of linear equations', titleUz: 'Chiziqli tenglamalar sistemasi',
      objectiveUz: 'Sistemani qo‘yish yoki qo‘shish usuli bilan yechasiz, yechimlar sonini (0, 1, cheksiz) aniqlaysiz va ikki noma’lumli so‘zli masalani tuzasiz.',
      objective: 'Solve systems by substitution or elimination, decide the number of solutions and set up two-unknown word problems.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Ikki tenglama sistemasi — ikkalasini birdan qanoatlantiruvchi (x, y) juftligi. Usullar: (1) qo‘yish (substitution): birinchi tenglamadan y = … toping va ikkinchisiga qo‘ying; (2) qo‘shish / ayirish (elimination): koeffitsientlarni tenglashtirib, tenglamalarni qo‘shing yoki ayiring — bir noma’lum yo‘qoladi. SAT da odatda eliminatsiya tezroq.',
        'Yechimlar soni: qiyaliklar turlicha → aynan bitta yechim (chiziqlar kesishadi); qiyalik teng, kesishma turlicha → yechim yo‘q (parallel chiziqlar); ikki tenglama bir xil chiziq → cheksiz ko‘p yechim. “For what value of k does the system have no solution?” — x va y koeffitsientlari mutanosib bo‘lsin, erkin had mutanosib bo‘lmasin.',
        'So‘zli masalada ikkita noma’lum → ikkita tenglama: “Kattalar chiptasi $8, bolalarniki $5. 30 chipta $198 ga sotildi.” → a + c = 30; 8a + 5c = 198. Savolga qarang: kattalar sonimi, jami daromadmi? Tekshirish: juftlikni ikkala tenglamaga qo‘ying.',
      ],
      table: [
        { form: 'bitta yechim: qiyaliklar farq qiladi', example: 'y = x + 1; y = 2x − 1 → (2, 3)' },
        { form: 'yechim yo‘q: parallel', example: 'y = 2x + 1; y = 2x + 5' },
        { form: 'cheksiz: bir xil chiziq', example: 'y = 2x + 1; 2y = 4x + 2' },
      ],
      examples: [
        { en: 'x + y = 10 and x − y = 2  →  add: 2x = 12  →  x = 6, y = 4', uz: 'Qo‘shilganda y yo‘qoladi.' },
        { en: 'y = 2x + 1 and y = −x + 7  →  2x + 1 = −x + 7  →  x = 2, y = 5', uz: 'Ikkala y teng bo‘lgani uchun o‘ng tomonlarni tenglang.' },
        { en: '2x + 3y = 12 and 4x + 6y = 20  →  2 × first = 24 ≠ 20  →  no solution', uz: 'Chiziqlar parallel: yechim yo‘q.' },
        { en: 'a + c = 30; 8a + 5c = 198  →  8a + 5(30 − a) = 198  →  3a = 48  →  a = 16', uz: 'Qo‘yish usuli: 16 ta kattalar chiptasi.' },
      ],
      vocab: [{ en: 'system', uz: 'sistema' }, { en: 'solution', uz: 'yechim' }, { en: 'substitute', uz: 'o‘rniga qo‘ymoq' }, { en: 'eliminate', uz: 'yo‘qotmoq (bir noma’lumni)' }],
      practice: [
        gap('If x + y = 10 and x − y = 2, what is the value of x? ___', ['6', '6.0'], 'Qo‘shing: 2x = 12 → x = 6.'),
        gap('If y = 2x + 1 and y = −x + 7, what is the value of x? ___', ['2', '2.0'], '2x + 1 = −x + 7 → 3x = 6 → x = 2.'),
        ch('How many solutions does the system y = 3x + 2, y = 3x − 5 have?', ['None', 'One', 'Two', 'Infinitely many'], 0, 'Qiyalik teng, kesishma farq qiladi: parallel.'),
        ch('Adult tickets cost $8 and child tickets $5. A total of 30 tickets sold for $198. How many adult tickets were sold?', ['14', '15', '16', '18'], 2, 'a + c = 30; 8a + 5c = 198 → 3a = 48 → a = 16.'),
        gap('In the system 2x + ky = 6 and 4x + 10y = 12, for what k are there infinitely many solutions? k = ___', ['5'], 'Ikkinchisi birinchisidan 2 baravar: 2k = 10 → k = 5 (2 · 6 = 12 ✓).'),
        multi('Choose ALL systems with exactly one solution.', ['y = x + 1; y = 2x', 'y = 2x + 3; y = 2x − 3', 'x + y = 4; x − y = 0', 'y = 4x; 2y = 8x', 'x + 2y = 5; 2x + 4y = 11'], [0, 2], 'Qiyaliklar turlicha bo‘lsa — bitta yechim: (1) va (3). (2), (5) parallel; (4) bir xil chiziq.'),
      ],
      check: [
        gap('If 3x + y = 14 and x − y = 2, what is the value of x? ___', ['4', '4.0'], 'Qo‘shing: 4x = 16 → x = 4.'),
        gap('If 2x + y = 11 and x − y = 1, what is the value of y? ___', ['3', '3.0'], 'Qo‘shing: 3x = 12 → x = 4; y = 11 − 8 = 3.'),
        ch('The system 3x − 2y = 5 and 6x − 4y = 10 has', ['no solution', 'one solution', 'two solutions', 'infinitely many solutions'], 3, 'Ikkinchisi = 2 × birinchisi: bir xil chiziq.'),
        ch('Pens cost $2 and notebooks $5. Maria bought 8 items for $28. How many notebooks did she buy?', ['2', '3', '4', '5'], 2, 'p + n = 8; 2p + 5n = 28 → 3n = 12 → n = 4.'),
        ch('At which point do y = x + 3 and y = 2x − 1 intersect?', ['(4, 7)', '(3, 6)', '(2, 5)', '(5, 8)'], 0, 'x + 3 = 2x − 1 → x = 4; y = 7.'),
        multi('Choose ALL true statements.', ['Distinct parallel lines have no common point.', 'Substitution and elimination give the same solution.', 'Two lines with different slopes meet exactly once.', 'A system of two linear equations always has one solution.', 'Identical lines have infinitely many common points.'], [0, 1, 2, 4], 'To‘g‘ri: parallel → yo‘q; usullar bir xil javob; turli qiyalik → 1 nuqta; bir xil chiziq → cheksiz. “Doim bitta” — xato.'),
      ],
    },
    {
      id: 'sat-m1-l4', title: 'Linear inequalities', titleUz: 'Chiziqli tengsizliklar',
      objectiveUz: 'Tengsizlikni yechasiz (manfiyga ko‘paytirganda belgi o‘zgarishini unutmaysiz), so‘zli masalalarda at least / at most ni to‘g‘ri belgilaysiz va butun son javobini topasiz.',
      objective: 'Solve linear inequalities (flipping the sign when multiplying by a negative), translate at least / at most and find whole-number answers.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Chiziqli tengsizlik tenglama kabi yechiladi, ammo bitta muhim farq bor: MANFIY songa ko‘paytirsangiz yoki bo‘lsangiz, tengsizlik belgisi teskarisiga o‘zgaradi: −2x > 6 → x < −3. Javob oraliq: x < −3 — sonlar o‘qida ochiq (○), ≤ va ≥ da esa yopiq (●) nuqta.',
        'So‘zli masalalar: “at least” (kamida) → ≥; “at most”, “no more than” (ko‘pi bilan) → ≤; “more than” → >; “fewer than” → <. 50 dollar bor, kitob 8 dollar: 8n ≤ 50 → n ≤ 6,25 → ko‘pi bilan 6 ta kitob (butun son talab qilinsa pastga yaxlitlanadi; “kamida” savolida yuqoriga).',
        'Ikki tengsizlik birga berilsa — ikkalasini qanoatlantiruvchi sonlar (kesishma): 2x + 1 > 7 va x < 5 → 3 < x < 5. Tengsizlik grafigi: y > mx + b — chiziqdan yuqoridagi soha (chiziq nuqtali, > uchun). Nuqta yechimmi? — koordinatalarni qo‘yib tekshiring.',
      ],
      table: [
        { form: 'manfiyga bo‘lganda belgi o‘zgaradi', example: '−2x > 6 → x < −3' },
        { form: 'at least → ≥, at most → ≤', example: 'at least 5 → n ≥ 5' },
        { form: 'butun son: maksimum uchun pastga yaxlitlash', example: '8n ≤ 50 → n ≤ 6' },
      ],
      examples: [
        { en: '3x − 5 < 10  →  3x < 15  →  x < 5', uz: 'Tenglama kabi, belgi saqlanadi.' },
        { en: '−2x ≥ 8  →  x ≤ −4', uz: 'Manfiyga bo‘lganda belgi o‘zgaradi.' },
        { en: '8n ≤ 50  →  n ≤ 6.25  →  at most 6 books', uz: 'Butun son: 6 ta.' },
        { en: '2x + 1 > 7 and x < 5  →  3 < x < 5', uz: 'Ikki shart kesishmasi.' },
      ],
      vocab: [{ en: 'inequality', uz: 'tengsizlik' }, { en: 'at least', uz: 'kamida' }, { en: 'at most', uz: 'ko‘pi bilan' }, { en: 'interval', uz: 'oraliq' }],
      practice: [
        ch('Which is the solution of 3x − 5 < 10?', ['x < 5', 'x > 5', 'x < 15', 'x > 15'], 0, '3x < 15 → x < 5.'),
        ch('Which is the solution of −2x ≥ 8?', ['x ≥ −4', 'x ≤ −4', 'x ≥ 4', 'x ≤ 4'], 1, '−2 ga bo‘lganda belgi o‘zgaradi: x ≤ −4.'),
        gap('A student has $50 and each book costs $8. What is the greatest number of books she can buy? ___', ['6'], '8n ≤ 50 → n ≤ 6,25 → 6.'),
        ch('Which inequality matches “at least 12 points”?', ['p > 12', 'p ≥ 12', 'p < 12', 'p ≤ 12'], 1, 'at least → ≥.'),
        ch('Which value of x satisfies both 2x + 1 > 7 and x < 5?', ['2', '3', '4', '6'], 2, 'x > 3 va x < 5 → x = 4.'),
        multi('Choose ALL solutions of x − 3 ≥ 2.', ['5', '6', '4', '5.5', '2'], [0, 1, 3], 'x ≥ 5: 5, 6 va 5,5 mos.'),
      ],
      check: [
        ch('Which is the solution of 4 − x > 1?', ['x > 3', 'x < 3', 'x < −3', 'x > −3'], 1, '−x > −3 → x < 3.'),
        gap('How many positive integers x satisfy 2x < 11? ___', ['5'], 'x < 5,5 → 1, 2, 3, 4, 5: beshta.'),
        ch('A plan costs $25 plus $4 per GB. To pay at most $65, the number of GB g satisfies', ['25 + 4g ≤ 65', '25 + 4g ≥ 65', '4g ≤ 65', '25g + 4 ≤ 65'], 0, '“at most” → ≤.'),
        gap('For 25 + 4g ≤ 65, what is the greatest whole number g? ___', ['10'], '4g ≤ 40 → g ≤ 10.'),
        ch('Which inequality has the solution x ≥ 2?', ['−3x ≤ −6', '−3x ≥ −6', '3x ≤ 6', 'x ≤ 2'], 0, '−3x ≤ −6 → x ≥ 2 (belgi o‘zgaradi).'),
        multi('Choose ALL true statements.', ['Dividing by a negative number flips the inequality sign.', '“No more than” means ≤.', 'x < 3 includes the number 3.', '“At least” means ≥.', 'Adding the same number to both sides keeps the sign.'], [0, 1, 3, 4], 'x < 3 da 3 yo‘q — qolganlari to‘g‘ri.'),
      ],
    },
  ],
};
