import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// SAT kursi — Math (3/4): Problem-Solving and Data Analysis. ORIGINAL Sellzen materiali.
export const SAT_MATH_DATA: Unit = {
  id: 'sat-m3', level: 'B2', title: 'SAT Math: Problem-Solving and Data Analysis', titleUz: 'SAT Math: masalalar va ma’lumotlar tahlili',
  situationUz: 'Nisbat va tezlik, foiz, o‘rtacha va tarqoqlik, nuqtali grafiklar, ehtimollik va tanlanma tadqiqotlari.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-m3-l1', title: 'Ratios, rates, proportions and unit conversion', titleUz: 'Nisbat, tezlik, proporsiya va o‘lchov birliklarini almashtirish',
      objectiveUz: 'Nisbatni butun bilan bog‘laysiz, proporsiya tuzasiz, tezlik va narx masalalarini yechasiz va o‘lchov birliklarini to‘g‘ri almashtirasiz.',
      objective: 'Relate ratios to totals, set up proportions, solve rate problems and convert units correctly.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Nisbat a : b — bo‘laklar. Butun = a + b bo‘lak; qismi = a / (a + b). Misol: o‘g‘il : qiz = 3 : 5, jami 40 o‘quvchi → bir bo‘lak = 40 / 8 = 5; qizlar = 5 · 5 = 25. Proporsiya a / b = c / d → ad = bc (kesishtirib ko‘paytirish). Tenglamani tuzishda BIR XIL birlikni suratga va maxrajga qo‘ying.',
        'Tezlik (rate): tezlik = masofa / vaqt; “unit rate” — 1 birlikka to‘g‘ri keladigan miqdor (narx 1 dona uchun, 1 daqiqada bosilgan bet). Tezlik doimiy bo‘lsa, masofa = tezlik × vaqt. Masala: 150 mil 2,5 soatda → 60 mil/soat → 4 soatda 240 mil.',
        'Birliklarni almashtirish: almashtirish koeffitsientini kasr shaklida ko‘paytiring, istalmagan birlik qisqaradi. 72 km/soat = 72 · (1000 m / 1 km) · (1 soat / 3600 s) = 20 m/s. Masshtab: xaritada 1 sm = 5 km → 7,5 sm = 37,5 km. Eng ko‘p xato — birliklarni aralashtirib yuborish (daqiqa va soat).',
      ],
      table: [
        { form: 'a : b → qism = a / (a + b)', example: '3 : 5, jami 40 → qiz 25' },
        { form: 'a / b = c / d → ad = bc', example: '2 / 12 = x / 30 → x = 5' },
        { form: 'birlik koeffitsienti ko‘paytiriladi', example: '72 km/h = 20 m/s' },
      ],
      examples: [
        { en: 'Boys : girls = 3 : 5 and 40 students. One part = 40 / 8 = 5, girls = 5 × 5 = 25', uz: 'Nisbatdan bo‘lakka o‘ting.' },
        { en: '150 miles in 2.5 hours = 60 mph;  4 hours → 240 miles', uz: 'Avval 1 soatdagi masofa (unit rate).' },
        { en: '2 cups for 12 cookies: x / 30 = 2 / 12  →  x = 5 cups', uz: 'Proporsiya: kesishtirib ko‘paytiring.' },
        { en: '72 km/h = 72 · 1000 / 3600 = 20 m/s', uz: 'Birliklarni koeffitsient bilan almashtirish.' },
      ],
      vocab: [{ en: 'ratio', uz: 'nisbat' }, { en: 'proportion', uz: 'proporsiya' }, { en: 'rate', uz: 'tezlik, me’yor' }, { en: 'convert', uz: 'o‘lchovni almashtirmoq' }],
      practice: [
        gap('The ratio of boys to girls is 3 : 5. If there are 40 students in all, how many are girls? ___', ['25', '25.0'], '40 / 8 = 5; 5 · 5 = 25.'),
        ch('A car travels 150 miles in 2.5 hours. At the same rate, how far does it travel in 4 hours?', ['200 miles', '225 miles', '240 miles', '260 miles'], 2, '150 / 2,5 = 60 mil/soat; 60 · 4 = 240.'),
        gap('A recipe uses 2 cups of flour for 12 cookies. How many cups for 30 cookies? ___', ['5', '5.0'], '2/12 = x/30 → x = 5.'),
        ch('If 6 pencils cost $2.40, how much do 15 pencils cost?', ['$5.00', '$6.00', '$7.20', '$9.00'], 1, '2,40 / 6 = 0,40; 0,40 · 15 = 6,00.'),
        gap('A speed of 72 km/h equals ___ m/s.', ['20', '20.0'], '72 · 1000 / 3600 = 20.'),
        multi('Choose ALL true proportions.', ['2/3 = 4/6', '3/5 = 6/9', '5/8 = 10/16', '4/7 = 8/15', '1/4 = 25/100'], [0, 2, 4], '3/5 = 6/10 (6/9 emas); 4/7 = 8/14 (8/15 emas).'),
      ],
      check: [
        ch('The ratio of red to blue marbles is 2 : 7. If there are 54 marbles in all, how many are blue?', ['12', '14', '42', '45'], 2, '54 / 9 = 6; 7 · 6 = 42.'),
        gap('A printer prints 45 pages in 3 minutes. How many pages does it print in 8 minutes? ___', ['120', '120.0'], '45 / 3 = 15 bet/daq; 15 · 8 = 120.'),
        ch('Which is the unit rate for 240 miles on 8 gallons?', ['25 mpg', '30 mpg', '32 mpg', '35 mpg'], 1, '240 / 8 = 30.'),
        gap('One inch is 2.54 cm. How many cm is a 10-inch screen? ___', ['25.4'], '10 · 2,54 = 25,4.'),
        ch('On a map, 1 cm = 5 km. Two towns are 7.5 cm apart. How far apart are they?', ['12.5 km', '35 km', '37.5 km', '75 km'], 2, '7,5 · 5 = 37,5.'),
        multi('Choose ALL rates equal to 60 miles per hour.', ['1 mile per minute', '90 miles in 1.5 hours', '100 miles in 2 hours', '30 miles in 30 minutes', '120 miles in 2 hours'], [0, 1, 3, 4], '100 / 2 = 50 mil/soat — teng emas.'),
      ],
    },
    {
      id: 'sat-m3-l2', title: 'Percentages and percent change', titleUz: 'Foizlar va foiz o‘zgarishi',
      objectiveUz: 'Foizni butun bilan bog‘laysiz, chegirma, soliq va o‘sishni hisoblaysiz, ketma-ket o‘zgarishlarni ko‘paytirib topasiz va foiz bilan foiz punktini ajratasiz.',
      objective: 'Link a percent to a whole, compute discounts, taxes and growth, multiply successive changes and tell percent from percentage points.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Asosiy munosabat: qism = (foiz / 100) × butun. Savollar uch turda: qismni topish (35% of 80 = 28), butunni topish (30% of x = 45 → x = 150), foizni topish (15 / 60 = 25%). O‘nlik kasrga o‘tkazing: 35% = 0,35. “is” → “=”, “of” → “×” deb tarjima qiling.',
        'Foiz o‘zgarishi = (yangi − eski) / eski × 100. 50 → 65: 15/50 = 30% ga oshgan. Ko‘paytiruvchi usul: x% o‘sish → (1 + x/100) ga ko‘paytiring; x% kamayish → (1 − x/100) ga. Chegirma 25% → 0,75 ga ko‘paytiring. Soliq 8% → 1,08.',
        'Ketma-ket o‘zgarishlar ko‘paytiriladi, qo‘shilmaydi: 20% oshib, 20% tushsa — 1,2 × 0,8 = 0,96 → 4% past (0% emas!). 10% va 20% chegirmalar ketma-ket: 0,9 × 0,8 = 0,72 → jami 28% chegirma. Foiz punkti (percentage point): 20% dan 30% gacha — 10 punkt, lekin 50% o‘sish. Savolda qaysi biri so‘ralganini aniqlang.',
      ],
      table: [
        { form: 'qism = foiz/100 × butun', example: '35% of 80 = 28' },
        { form: 'o‘zgarish % = (yangi − eski) / eski × 100', example: '50 → 65: 30%' },
        { form: 'ketma-ket: ko‘paytiring', example: '1,2 × 0,8 = 0,96' },
      ],
      examples: [
        { en: '35% of 80 = 0.35 × 80 = 28', uz: '“of” — ko‘paytirish.' },
        { en: '$40 shirt, 25% off: 40 × 0.75 = $30', uz: 'Chegirma: (1 − 0,25).' },
        { en: 'Up 20% then down 20%: 1.2 × 0.8 = 0.96 → 4% lower', uz: 'Ketma-ket o‘zgarish ko‘paytiriladi.' },
        { en: '20% to 30% is +10 percentage points, but a 50% increase', uz: 'Foiz punkti va foiz farqi.' },
      ],
      vocab: [{ en: 'percent', uz: 'foiz' }, { en: 'discount', uz: 'chegirma' }, { en: 'percent change', uz: 'foiz o‘zgarishi' }, { en: 'tax', uz: 'soliq' }],
      practice: [
        gap('What is 35% of 80? ___', ['28', '28.0'], '0,35 · 80 = 28.'),
        ch('A $40 shirt is discounted by 25%. What is the sale price?', ['$10', '$30', '$32', '$35'], 1, '40 · 0,75 = 30.'),
        gap('A value increases from 50 to 65. What is the percent increase? ___', ['30', '30.0'], '15 / 50 = 0,30.'),
        ch('A price rises by 20% and then falls by 20%. Compared with the original price, the final price is', ['the same', '4% lower', '4% higher', '20% lower'], 1, '1,2 · 0,8 = 0,96 → 4% past.'),
        gap('15 is what percent of 60? ___', ['25', '25.0'], '15 / 60 = 0,25.'),
        multi('Choose ALL true statements.', ['A rise from 20% to 30% is 10 percentage points.', 'A rise from 20% to 30% is a 50% increase.', '10% of 50 is 5.', 'A 100% increase doubles a value.', 'A 50% decrease followed by a 50% increase returns to the start.'], [0, 1, 2, 3], '0,5 · 1,5 = 0,75 — boshlang‘ich qiymatga qaytmaydi.'),
      ],
      check: [
        ch('A town grows from 2,000 to 2,300 people. What is the percent increase?', ['10%', '15%', '23%', '30%'], 1, '300 / 2000 = 0,15.'),
        gap('An item originally $80 is now $60. What is the percent discount? ___', ['25', '25.0'], '20 / 80 = 0,25.'),
        ch('A $50 item has an 8% sales tax. What is the total?', ['$52', '$54', '$58', '$62'], 1, '50 · 1,08 = 54.'),
        gap('If 30% of a number is 45, what is the number? ___', ['150', '150.0'], '45 / 0,30 = 150.'),
        ch('A 10% discount is followed by a 20% discount. What single discount is equivalent?', ['28%', '30%', '72%', '15%'], 0, '0,9 · 0,8 = 0,72 → 28% chegirma.'),
        multi('Choose ALL true statements.', ['To find a percent change, divide by the original value.', 'Successive percent changes are multiplied.', 'Successive percent changes are added.', 'A 25% discount means multiplying by 0.75.', 'A 5% increase means multiplying by 1.05.'], [0, 1, 3, 4], 'Ketma-ket o‘zgarishlar qo‘shilmaydi, ko‘paytiriladi.'),
      ],
    },
    {
      id: 'sat-m3-l3', title: 'Statistics: center, spread and scatterplots', titleUz: 'Statistika: markaz, tarqoqlik va nuqtali grafiklar',
      objectiveUz: 'O‘rtacha, mediana va diapazonni hisoblaysiz, standart og‘ish bo‘yicha ikki to‘plamni taqqoslaysiz va nuqtali grafikdagi eng yaxshi mos chiziqni izohlaysiz.',
      objective: 'Compute mean, median and range, compare standard deviations and interpret a scatterplot and its line of best fit.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Markaz o‘lchovlari: mean (o‘rtacha) = yig‘indi / soni; median — tartiblangan qatorning o‘rtasi (juft sonda ikki o‘rta sonning o‘rtachasi); mode — eng ko‘p uchragan. Range = eng katta − eng kichik. Mean ekstremal qiymatlarga (outlier) sezgir, median esa chidamli. Teskari masala: mean va soni berilsa, yig‘indi = mean × soni (5 son, mean 12 → yig‘indi 60).',
        'Standart og‘ish (standard deviation, SD) — qiymatlar o‘rtachadan qanchalik uzoqligi. SAT da hisoblash emas, taqqoslash so‘raladi: qiymatlar o‘rtacha atrofida zich bo‘lsa SD kichik, keng tarqalgan bo‘lsa katta. Hamma qiymatga son qo‘shilsa mean o‘zgaradi, SD o‘zgarmaydi; k ga ko‘paytirilsa mean va SD ikkalasi ham k marta o‘zgaradi.',
        'Nuqtali grafik (scatterplot) va eng yaxshi mos chiziq y = mx + b: m — x bir birlik oshganda y ning TAXMINIY o‘zgarishi; b — x = 0 dagi taxminiy y. Bog‘liqlik musbat (yuqoriga), manfiy (pastga) yoki yo‘q. Qoldiq (residual) = haqiqiy − bashorat qilingan. Ma’lumotlar oralig‘idan tashqarida bashorat (extrapolation) ishonchsiz. Bog‘liqlik sababni isbotlamaydi.',
      ],
      table: [
        { form: 'mean = yig‘indi / soni; sum = mean × n', example: '5 son, mean 12 → sum 60' },
        { form: 'median: o‘rtadagi (juftda o‘rtachasi)', example: '3, 4, 7, 9, 12 → 7' },
        { form: 'SD: tarqoqlik; son qo‘shish SD ni o‘zgartirmaydi', example: '{6, 8, 12, 14} > {10, 10, 10, 10}' },
      ],
      examples: [
        { en: 'Mean of 4, 8, 10, 14 = 36 / 4 = 9', uz: 'Yig‘indi 36, soni 4.' },
        { en: 'Median of 3, 9, 4, 12, 7 → sorted 3, 4, 7, 9, 12 → 7', uz: 'Avval tartiblang.' },
        { en: 'Line of best fit y = 2.5x + 10: each extra study hour adds about 2.5 points', uz: 'Qiyalik — taxminiy o‘zgarish.' },
        { en: 'Residual = actual − predicted', uz: 'Qoldiq: haqiqiy minus bashorat.' },
      ],
      vocab: [{ en: 'median', uz: 'mediana' }, { en: 'standard deviation', uz: 'standart og‘ish' }, { en: 'outlier', uz: 'ajralib turuvchi qiymat' }, { en: 'scatterplot', uz: 'nuqtali grafik' }],
      practice: [
        gap('What is the mean of 4, 8, 10 and 14? ___', ['9', '9.0'], '36 / 4 = 9.'),
        ch('What is the median of 3, 9, 4, 12, 7?', ['4', '7', '9', '12'], 1, 'Tartib: 3, 4, 7, 9, 12 → o‘rtasi 7.'),
        gap('The mean of five numbers is 12. What is their sum? ___', ['60', '60.0'], '5 · 12 = 60.'),
        ch('Which data set has the greatest standard deviation?', ['{10, 10, 10, 10}', '{6, 8, 12, 14}', '{9, 10, 10, 11}', '{10, 10, 11, 11}'], 1, 'Eng keng tarqalgan: {6, 8, 12, 14}.'),
        ch('A line of best fit is y = 2.5x + 10, where x is hours studied and y is the test score. The slope means that', ['each extra hour is associated with about 2.5 more points', 'every student scores 10', 'each point takes 2.5 hours', 'scores never exceed 10'], 0, 'Qiyalik — har bir qo‘shimcha soat uchun taxminiy o‘sish.'),
        multi('Choose ALL true statements.', ['The median is less affected by outliers than the mean.', 'Adding 5 to every value increases the mean by 5.', 'Adding 5 to every value increases the SD by 5.', 'Correlation proves causation.', 'The range is the maximum minus the minimum.'], [0, 1, 4], 'SD son qo‘shilganda o‘zgarmaydi; bog‘liqlik sababni isbotlamaydi.'),
      ],
      check: [
        ch('The mean of 5 numbers is 20. A sixth number, 32, is added. What is the new mean?', ['21', '22', '24', '26'], 1, '(100 + 32) / 6 = 22.'),
        gap('What is the median of 2, 5, 5, 9, 10 and 20? ___', ['7', '7.0'], '(5 + 9) / 2 = 7.'),
        ch('Using y = 3x + 4, what is the predicted y when x = 6?', ['18', '20', '22', '24'], 2, '3 · 6 + 4 = 22.'),
        ch('Points on a scatterplot fall from the upper left to the lower right. The association is', ['positive', 'negative', 'none', 'constant'], 1, 'Yuqoridan pastga — manfiy bog‘liqlik.'),
        gap('What is the range of 3, 11, 7 and 20? ___', ['17', '17.0'], '20 − 3 = 17.'),
        multi('Choose ALL true statements.', ['A prediction far outside the data range is unreliable.', 'A residual is actual minus predicted.', 'Multiplying every value by 2 doubles the SD.', 'A scatterplot with a rising pattern shows a positive association.', 'A large outlier cannot change the mean.'], [0, 1, 2, 3], 'Katta outlier mean ni o‘zgartiradi.'),
      ],
    },
    {
      id: 'sat-m3-l4', title: 'Probability, two-way tables and inference', titleUz: 'Ehtimollik, ikki o‘lchovli jadvallar va xulosa chiqarish',
      objectiveUz: 'Ehtimollikni qulay holatlar / barcha holatlar sifatida hisoblaysiz, ikki o‘lchovli jadvaldan shartli ehtimollik topasiz va tanlanma tadqiqotlaridan to‘g‘ri xulosa chiqarasiz.',
      objective: 'Compute probabilities, find conditional probabilities from two-way tables and draw valid conclusions from sample studies.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Ehtimollik P = qulay holatlar soni / barcha teng imkoniyatli holatlar soni (0 dan 1 gacha). Qopda 3 qizil, 5 ko‘k shar: P(qizil) = 3/8. Qarama-qarshi hodisa: P(A emas) = 1 − P(A). Mustaqil hodisalar: P(A va B) = P(A) · P(B): ikki tanga ham gerb — 1/2 · 1/2 = 1/4 = 0,25.',
        'Ikki o‘lchovli jadval (two-way table): shartli ehtimollikda MAXRAJ — shart bo‘lgan guruh. “Sport bilan shug‘ullanuvchilardan qanchasi musiqa bilan ham?” — maxraj: faqat sportchilar (60), surat: ikkalasi ham (24) → 24/60 = 2/5. Savolda “among” va “of those” so‘zlariga e’tibor bering — ular maxrajni belgilaydi.',
        'Tanlanma va xulosa: tasodifiy (random) tanlanma butun populyatsiyaga umumlashtirishga imkon beradi; ixtiyoriy (voluntary) so‘rov — yo‘q (tanlov xatosi). Xato chegarasi (margin of error): 52% ± 4% → populyatsiyada 48% dan 56% gacha. Tanlanma qancha katta bo‘lsa, xato chegarasi shuncha kichik. Sabab-oqibat xulosasi faqat tasodifiy taqsimlangan guruhlari bor eksperimentdan (random assignment) chiqariladi.',
      ],
      table: [
        { form: 'P = qulay / barcha', example: '3 qizil, 5 ko‘k → P(qizil) = 3/8' },
        { form: 'shartli ehtimollik: maxraj = shart guruhi', example: '24 / 60' },
        { form: 'random sample → populyatsiya; random assignment → sabab', example: '52% ± 4% → 48%–56%' },
      ],
      examples: [
        { en: 'A bag has 3 red and 5 blue marbles: P(red) = 3/8, P(blue) = 5/8', uz: 'Jami 8 ta shar.' },
        { en: 'Two coins: P(both heads) = 1/2 × 1/2 = 0.25', uz: 'Mustaqil hodisalar ko‘paytiriladi.' },
        { en: '60 play sports; 24 of them also play music → 24/60 = 2/5', uz: 'Shart: sportchilar (60).' },
        { en: 'Random sample of 400: 52% support, margin of error ±4% → 48% to 56% likely support in the whole city', uz: 'Xato chegarasi bilan oraliq.' },
      ],
      vocab: [{ en: 'probability', uz: 'ehtimollik' }, { en: 'sample', uz: 'tanlanma' }, { en: 'margin of error', uz: 'xato chegarasi' }, { en: 'population', uz: 'populyatsiya, to‘plam' }],
      practice: [
        ch('A bag has 3 red and 5 blue marbles. What is the probability of drawing a blue marble?', ['3/8', '5/8', '1/2', '5/3'], 1, '5 / 8.'),
        gap('Two fair coins are flipped. What is the probability that both land heads? (decimal) ___', ['0.25', '.25', '1/4'], '1/2 · 1/2 = 1/4 = 0,25.'),
        ch('Among 100 students, 60 play sports and 24 of those 60 also play music. What fraction of the sports players also play music?', ['24/100', '24/60', '60/100', '36/60'], 1, 'Maxraj — sportchilar (60): 24/60.'),
        ch('A random sample of 400 residents finds 52% support a plan, with a margin of error of ±4%. Which conclusion is best supported?', ['Between 48% and 56% of all residents likely support the plan.', 'Exactly 52% of all residents support the plan.', 'Support is below 48%.', 'Everyone supports the plan.'], 0, '52 ± 4 = 48–56%.'),
        gap('If P(rain) = 0.3, then P(no rain) = ___', ['0.7', '.7'], '1 − 0,3 = 0,7.'),
        multi('Choose ALL true statements.', ['A random sample lets us generalize to the population.', 'Random assignment to groups supports a cause-and-effect conclusion.', 'A larger random sample usually has a smaller margin of error.', 'A voluntary online poll is a random sample.', 'A probability can be greater than 1.'], [0, 1, 2], 'Ixtiyoriy so‘rov tasodifiy emas; ehtimollik 1 dan oshmaydi.'),
      ],
      check: [
        ch('A fair six-sided die is rolled once. What is the probability of rolling a number greater than 4?', ['1/6', '1/3', '1/2', '2/3'], 1, '5 va 6 → 2/6 = 1/3.'),
        ch('In a survey, 30 of 50 women and 20 of 50 men prefer tea. What fraction of the tea drinkers are women?', ['30/100', '30/50', '20/50', '50/100'], 1, 'Choyxo‘rlar jami 30 + 20 = 50; ularning 30 tasi ayol: 30/50 = 3/5.'),
        gap('A spinner has 4 equal sections: 1, 2, 3, 4. What is P(an even number)? (fraction or decimal) ___', ['1/2', '0.5', '.5'], '2/4 = 1/2.'),
        gap('Probabilities of all possible outcomes add up to ___', ['1', '1.0'], 'Ehtimolliklar yig‘indisi 1.'),
        ch('Which study design best supports a cause-and-effect conclusion?', ['A randomized experiment with a control group', 'A voluntary survey', 'A convenience sample', 'A case study of one person'], 0, 'Tasodifiy taqsimlangan nazorat guruhi bor eksperiment.'),
        multi('Choose ALL true statements.', ['P(A and B) = P(A)·P(B) for independent events.', 'P(not A) = 1 − P(A).', 'Margin of error shrinks as a random sample grows.', 'A survey of volunteers represents the whole population.', 'Conditional probability uses the given group as the denominator.'], [0, 1, 2, 4], 'Ixtiyoriylar butun populyatsiyani ifodalamaydi.'),
      ],
    },
  ],
};
