import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// SAT kursi — Math (2/4): Advanced Math. ORIGINAL Sellzen materiali.
export const SAT_MATH_ADVANCED: Unit = {
  id: 'sat-m2', level: 'B2', title: 'SAT Math: Advanced Math', titleUz: 'SAT Math: ilg‘or algebra',
  situationUz: 'Ifodalarni ochish va ko‘paytuvchilarga ajratish, kvadrat tenglamalar, ko‘rsatkichli funksiyalar, funksiya yozuvi va ildizli tenglamalar.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-m2-l1', title: 'Equivalent expressions: expanding, factoring, exponents', titleUz: 'Teng kuchli ifodalar: qavs ochish, ko‘paytuvchilarga ajratish, darajalar',
      objectiveUz: 'Ifodalarni qavs ochib va ko‘paytuvchilarga ajratib soddalashtirasiz, qisqa ko‘paytirish formulalari va daraja qoidalarini ishlatasiz.',
      objective: 'Simplify expressions by expanding and factoring and apply special-product and exponent rules.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Qavs ochish: a(b + c) = ab + ac; (x + a)(x + b) = x² + (a + b)x + ab. Qisqa ko‘paytirish formulalari SAT da juda ko‘p uchraydi: (x + a)² = x² + 2ax + a²; (x − a)² = x² − 2ax + a²; (x + a)(x − a) = x² − a². Har bir qavsni ikkinchisining hadlariga ko‘paytiring va oxirida o‘xshash hadlarni qo‘shing.',
        'Ko‘paytuvchilarga ajratish: avval umumiy ko‘paytuvchini (GCF) chiqaring: 6x² + 9x = 3x(2x + 3). x² + bx + c da yig‘indisi b, ko‘paytmasi c bo‘lgan ikki son p va q ni toping: x² + 5x + 6 = (x + 2)(x + 3). Kvadratlar ayirmasi: x² − 9 = (x − 3)(x + 3). Tekshirish: qavslarni qayta oching.',
        'Daraja qoidalari: xᵃ · xᵇ = xᵃ⁺ᵇ; xᵃ / xᵇ = xᵃ⁻ᵇ; (xᵃ)ᵇ = xᵃᵇ; x⁻ᵃ = 1 / xᵃ; x^(1/2) = √x; x⁰ = 1. Kasr ifodani soddalashtirishda umumiy KO‘PAYTUVCHI qisqartiriladi, had emas: (x² − 1)/(x − 1) = (x − 1)(x + 1)/(x − 1) = x + 1 (x ≠ 1). SAT da ikki ifoda “equivalent” bo‘lsa, x ning har qanday qiymatida bir xil natija beradi — shubhada x = 2 qo‘yib sinang.',
      ],
      table: [
        { form: '(x ± a)² = x² ± 2ax + a²', example: '(x + 3)² = x² + 6x + 9' },
        { form: 'x² − a² = (x − a)(x + a)', example: 'x² − 9 = (x − 3)(x + 3)' },
        { form: 'xᵃ · xᵇ = xᵃ⁺ᵇ; (xᵃ)ᵇ = xᵃᵇ', example: 'x³ · x⁴ = x⁷; (x²)³ = x⁶' },
      ],
      examples: [
        { en: '(x + 3)² = x² + 6x + 9', uz: 'O‘rta had = 2 · 3 · x. “x² + 9” xato.' },
        { en: 'x² + 5x + 6 = (x + 2)(x + 3)   [2 + 3 = 5, 2 · 3 = 6]', uz: 'Yig‘indi 5, ko‘paytma 6 bo‘lgan sonlar.' },
        { en: '6x² + 9x = 3x(2x + 3)', uz: 'Avval umumiy ko‘paytuvchi.' },
        { en: '(x² − 1)/(x − 1) = x + 1   (x ≠ 1)', uz: 'Ko‘paytuvchi qisqaradi: (x − 1).' },
      ],
      vocab: [{ en: 'expression', uz: 'ifoda' }, { en: 'factor', uz: 'ko‘paytuvchi' }, { en: 'expand', uz: 'qavsni ochmoq' }, { en: 'exponent', uz: 'daraja ko‘rsatkichi' }],
      practice: [
        ch('Which expression is equivalent to (x + 3)²?', ['x² + 9', 'x² + 6x + 9', 'x² + 3x + 9', '2x + 6'], 1, '(x + 3)² = x² + 2·3·x + 9.'),
        ch('Which is the factored form of x² + 5x + 6?', ['(x + 1)(x + 6)', '(x + 2)(x + 3)', '(x − 2)(x − 3)', '(x + 5)(x + 1)'], 1, '2 + 3 = 5; 2 · 3 = 6.'),
        ch('(x − 4)(x + 4) equals', ['x² − 16', 'x² + 16', 'x² − 8x + 16', 'x² − 4'], 0, 'Kvadratlar ayirmasi: x² − 16.'),
        gap('If x³ · x⁴ = xⁿ, then n = ___', ['7', '7.0'], 'Ko‘rsatkichlar qo‘shiladi: 3 + 4 = 7.'),
        ch('Which is equivalent to 6x² + 9x?', ['3x(2x + 3)', '3(2x² + 9x)', 'x(6x + 9x)', '9x(x + 1)'], 0, '3x · 2x = 6x²; 3x · 3 = 9x.'),
        multi('Choose ALL expressions equivalent to x² − 9.', ['(x − 3)(x + 3)', '(x − 3)²', 'x² − 3²', '(x + 3)²', 'x² − 6x + 9'], [0, 2], '(x − 3)(x + 3) = x² − 9; x² − 3² = x² − 9. Qolganlari boshqa ifodalar.'),
      ],
      check: [
        ch('Which expression is equivalent to (2x − 1)(x + 4)?', ['2x² + 7x − 4', '2x² − 7x − 4', '2x² + 9x − 4', '2x² + 7x + 4'], 0, '2x² + 8x − x − 4 = 2x² + 7x − 4.'),
        ch('Which is the factored form of x² − 7x + 12?', ['(x − 3)(x − 4)', '(x + 3)(x + 4)', '(x − 2)(x − 6)', '(x − 1)(x − 12)'], 0, '−3 + (−4) = −7; (−3)(−4) = 12.'),
        gap('If (x²)³ = xᵐ, then m = ___', ['6', '6.0'], 'Ko‘rsatkichlar ko‘paytiriladi: 2 · 3 = 6.'),
        ch('For x ≠ 1, (x² − 1) / (x − 1) is equivalent to', ['x + 1', 'x − 1', 'x² + 1', '1'], 0, '(x − 1)(x + 1) / (x − 1) = x + 1.'),
        gap('If x⁻² = 1 / xᵏ, then k = ___', ['2', '2.0'], 'x⁻² = 1 / x².'),
        multi('Choose ALL true statements.', ['(x + 2)² = x² + 4', '(x + 2)² = x² + 4x + 4', 'x⁰ = 1 for x ≠ 0', 'x^(1/2) = √x', 'x² · x³ = x⁶'], [1, 2, 3], '(x + 2)² ≠ x² + 4; x² · x³ = x⁵.'),
      ],
    },
    {
      id: 'sat-m2-l2', title: 'Quadratic equations and functions', titleUz: 'Kvadrat tenglamalar va funksiyalar',
      objectiveUz: 'Kvadrat tenglamani ko‘paytuvchilarga ajratib yoki formula bilan yechasiz, diskriminant bo‘yicha yechimlar sonini topasiz va parabola uchini (vertex) aniqlaysiz.',
      objective: 'Solve quadratics by factoring or the formula, use the discriminant to count solutions and find the vertex of a parabola.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 16, skipSpeak: true,
      explanationUz: [
        'Kvadrat tenglama ax² + bx + c = 0. Yechish usullari: (1) ko‘paytuvchilarga ajratish: x² − 5x + 6 = (x − 2)(x − 3) = 0 → x = 2 yoki x = 3; (2) kvadrat formula: x = (−b ± √(b² − 4ac)) / (2a). Diskriminant D = b² − 4ac: D > 0 — ikkita haqiqiy ildiz; D = 0 — bitta; D < 0 — haqiqiy ildiz yo‘q. Ildizlar yig‘indisi = −b/a, ko‘paytmasi = c/a.',
        'Parabola y = ax² + bx + c: a > 0 bo‘lsa yuqoriga, a < 0 bo‘lsa pastga ochiladi; uchi x = −b / (2a) da. Vertex shakli y = a(x − h)² + k: uchi (h, k), simmetriya o‘qi x = h. x-kesishmalar (zeros) = tenglama yechimlari; y-kesishma = c. Savol “minimum / maximum value” bo‘lsa — uchining y qiymati (k).',
        'Fizik masala: h(t) = −16t² + v₀t + h₀ (oyoq/soniya): eng baland nuqta t = −b / (2a) da, eng katta balandlik — shu t dagi h. Yerga tushish — h = 0 tenglamasi (musbat ildiz). Tenglamani tuzishda o‘zgaruvchilarning ma’nosini aniqlang va javobni savol so‘ragan kattalikka moslang.',
      ],
      table: [
        { form: 'x = (−b ± √(b² − 4ac)) / 2a', example: 'x² − 5x + 6 = 0 → x = 2, 3' },
        { form: 'D = b² − 4ac: >0 ikki, =0 bitta, <0 yo‘q', example: 'x² + 6x + 9: D = 0' },
        { form: 'vertex: x = −b / 2a;  y = a(x − h)² + k', example: 'y = (x − 3)² + 2 → vertex (3, 2)' },
      ],
      examples: [
        { en: 'x² − 5x + 6 = 0  →  (x − 2)(x − 3) = 0  →  x = 2 or x = 3', uz: 'Ko‘paytma 0 bo‘lsa, ko‘paytuvchilardan biri 0.' },
        { en: 'x² + 6x + c = 0 has one solution when D = 36 − 4c = 0  →  c = 9', uz: 'D = 0 — bitta yechim.' },
        { en: 'y = (x − 3)² + 2  →  vertex (3, 2), minimum value 2', uz: 'Vertex shaklida (h, k) to‘g‘ridan to‘g‘ri ko‘rinadi.' },
        { en: 'h(t) = −16t² + 64t  →  t = 64 / 32 = 2  →  h(2) = −64 + 128 = 64 ft', uz: 'Eng baland nuqta: t = −b / 2a.' },
      ],
      vocab: [{ en: 'quadratic', uz: 'kvadrat (tenglama)' }, { en: 'discriminant', uz: 'diskriminant' }, { en: 'vertex', uz: 'parabola uchi' }, { en: 'parabola', uz: 'parabola' }],
      practice: [
        ch('What are the solutions of x² − 5x + 6 = 0?', ['x = 2 and x = 3', 'x = −2 and x = −3', 'x = 1 and x = 6', 'x = −1 and x = −6'], 0, '(x − 2)(x − 3) = 0.'),
        gap('What is the x-coordinate of the vertex of y = (x − 3)² + 2? ___', ['3', '3.0'], 'Vertex shakli: (h, k) = (3, 2).'),
        ch('For which value of c does x² + 6x + c = 0 have exactly one real solution?', ['3', '6', '9', '12'], 2, 'D = 36 − 4c = 0 → c = 9.'),
        gap('What is the sum of the solutions of x² − 8x + 12 = 0? ___', ['8', '8.0'], 'Yig‘indi = −b/a = 8 (ildizlar 2 va 6).'),
        ch('What is the discriminant of 2x² + 3x + 5?', ['−31', '31', '−11', '9'], 0, 'D = 9 − 4·2·5 = −31 < 0: haqiqiy ildiz yo‘q.'),
        multi('Choose ALL equations with two distinct real solutions.', ['x² − 4 = 0', 'x² + 4 = 0', 'x² − 4x + 4 = 0', 'x² − 3x − 4 = 0', 'x² + 1 = 0'], [0, 3], 'x² − 4 = 0 → ±2; x² − 3x − 4: D = 25 > 0. Boshqalarda D ≤ 0.'),
      ],
      check: [
        ch('What are the zeros of f(x) = x² − 4x + 3?', ['1 and 3', '−1 and −3', '2 and 2', '1 and −3'], 0, '(x − 1)(x − 3) = 0.'),
        gap('What is the x-coordinate of the vertex of y = x² − 6x + 5? ___', ['3', '3.0'], 'x = −b / 2a = 6 / 2 = 3.'),
        ch('A ball’s height is h(t) = −16t² + 64t. What is its maximum height?', ['64', '100', '144', '256'], 0, 't = 2: h = −64 + 128 = 64.'),
        gap('What is the product of the solutions of x² − 7x + 10 = 0? ___', ['10', '10.0'], 'Ko‘paytma = c / a = 10.'),
        ch('Which equation has solutions x = −2 and x = 5?', ['x² − 3x − 10 = 0', 'x² + 3x − 10 = 0', 'x² − 7x + 10 = 0', 'x² + 7x + 10 = 0'], 0, '(x + 2)(x − 5) = x² − 3x − 10.'),
        multi('Choose ALL true statements about y = x² − 2x − 3.', ['Its zeros are −1 and 3.', 'Its y-intercept is −3.', 'It opens downward.', 'Its vertex is at x = 1.', 'Its minimum value is −4.'], [0, 1, 3, 4], 'x = 1 da y = 1 − 2 − 3 = −4. a = 1 > 0: yuqoriga ochiladi (3-variant xato).'),
      ],
    },
    {
      id: 'sat-m2-l3', title: 'Exponential growth and decay', titleUz: 'Ko‘rsatkichli o‘sish va kamayish',
      objectiveUz: 'y = a·bˣ funksiyasini tuzasiz va izohlaysiz, o‘sish va kamayish foizini topasiz, murakkab foiz formulasidan foydalanasiz va chiziqli o‘sishdan farqlaysiz.',
      objective: 'Build and interpret y = a·bˣ, find growth and decay rates, use compound interest and tell exponential from linear growth.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Ko‘rsatkichli funksiya y = a · bˣ: a — boshlang‘ich qiymat (x = 0), b — o‘sish ko‘paytuvchisi. b > 1 — o‘sish, 0 < b < 1 — kamayish. b = 1 + r (r — davr uchun o‘sish foizi, o‘nlik kasrda): 5% o‘sish → b = 1,05; 25% kamayish → b = 0,75. Chiziqli o‘sishda har davr bir xil MIQDOR qo‘shiladi, ko‘rsatkichliida esa bir xil MARTA ko‘paytiriladi.',
        'Murakkab foiz: A = P(1 + r/n)^(nt). Yiliga bir marta bo‘lsa: A = P(1 + r)^t. Masalan, 1000 dollar, 4% yillik: A = 1000(1,04)^t. “Har 3 yilda ikki baravar” → y = a · 2^(t/3). Jadvalda qiymatlar bir xil marta ko‘paysa — ko‘rsatkichli; bir xil miqdorga ortsa — chiziqli.',
        'Tenglama 2ˣ = 32 kabi bo‘lsa, asoslarni tenglang: 2ˣ = 2⁵ → x = 5. (1/2)ˣ = 8 → 2⁻ˣ = 2³ → x = −3. Javoblarni tekshirishda variantni funksiyaga qo‘yib ko‘ring. Izoh savolida “a” — boshlang‘ich qiymat, “b − 1” — davr uchun o‘zgarish foizi ekanini yodda tuting.',
      ],
      table: [
        { form: 'y = a·bˣ: b = 1 + r', example: '5% o‘sish → b = 1,05' },
        { form: 'kamayish: 0 < b < 1', example: '25% kamayish → b = 0,75' },
        { form: 'A = P(1 + r)^t', example: '1000(1,04)^t' },
      ],
      examples: [
        { en: 'P(t) = 500 · 2ᵗ  →  P(3) = 500 · 8 = 4,000', uz: 'Har davr ikki baravar.' },
        { en: 'f(x) = 100(1.05)ˣ increases by 5% each unit', uz: 'b = 1,05 → 5% o‘sish.' },
        { en: '12,000 people grow 3% a year → 12,000 · 1.03 = 12,360 after one year', uz: 'Bir yildan keyin: 12 360.' },
        { en: '2ˣ = 32  →  x = 5;   (1/2)ˣ = 8  →  x = −3', uz: 'Asoslarni tenglang.' },
      ],
      vocab: [{ en: 'exponential', uz: 'ko‘rsatkichli' }, { en: 'growth', uz: 'o‘sish' }, { en: 'decay', uz: 'kamayish' }, { en: 'initial', uz: 'boshlang‘ich' }],
      practice: [
        ch('A population is P(t) = 500 · 2ᵗ. What is P(3)?', ['1,500', '3,000', '4,000', '1,000'], 2, '500 · 2³ = 500 · 8 = 4,000.'),
        ch('The function f(x) = 100(1.05)ˣ increases by what percent each unit of x?', ['0.05%', '5%', '50%', '105%'], 1, 'b = 1,05 = 1 + 0,05 → 5%.'),
        gap('A value triples every year and starts at 4. What is its value after 2 years? ___', ['36', '36.0'], '4 · 3² = 36.'),
        ch('The function y = 80(0.75)ᵗ represents', ['a 25% decrease each period', 'a 75% increase each period', 'a 75% decrease each period', 'a 25% increase each period'], 0, 'b = 0,75 = 1 − 0,25 → 25% kamayish.'),
        gap('If 2ˣ = 32, then x = ___', ['5', '5.0'], '32 = 2⁵.'),
        multi('Choose ALL exponential growth functions.', ['y = 3(1.2)ˣ', 'y = 5(0.8)ˣ', 'y = 2(2)ˣ', 'y = 4x + 1', 'y = 10(1.01)ˣ'], [0, 2, 4], 'O‘sish: b > 1. (0,8)ˣ — kamayish; 4x + 1 — chiziqli.'),
      ],
      check: [
        ch('A bank account starts at $1,000 and earns 4% interest compounded annually. Which function gives the balance after t years?', ['1000(1.04)ᵗ', '1000(0.04)ᵗ', '1000 + 0.04t', '1000(4)ᵗ'], 0, 'A = P(1 + r)ᵗ.'),
        gap('If (1/2)ˣ = 8, then x = ___', ['-3', '−3'], '(1/2)^−3 = 2³ = 8.'),
        ch('A town of 12,000 grows by 3% per year. What is the population after one year?', ['12,360', '12,030', '15,000', '12,003'], 0, '12,000 · 1,03 = 12,360.'),
        gap('A quantity starts at 10 and doubles every 5 years. What is its value after 15 years? ___', ['80', '80.0'], '15 / 5 = 3 marta ikki baravar: 10 · 2³ = 80.'),
        ch('Which table shows exponential growth?', ['x: 0,1,2,3 → y: 5,10,15,20', 'x: 0,1,2,3 → y: 5,10,20,40', 'x: 0,1,2,3 → y: 5,8,11,14', 'x: 0,1,2,3 → y: 40,30,20,10'], 1, 'Har qadamda ×2 — ko‘rsatkichli. Qolganlari chiziqli.'),
        multi('Choose ALL true statements.', ['In y = a·bˣ, a is the value at x = 0.', 'If 0 < b < 1, the function decays.', 'Linear growth multiplies by a constant factor.', 'A 10% annual increase means b = 1.10.', 'A 20% decrease means b = 0.80.'], [0, 1, 3, 4], 'Chiziqli o‘sish — bir xil MIQDOR qo‘shish; ko‘rsatkichli — bir xil MARTA ko‘paytirish.'),
      ],
    },
    {
      id: 'sat-m2-l4', title: 'Function notation, transformations, radical equations', titleUz: 'Funksiya yozuvi, o‘zgartirishlar va ildizli tenglamalar',
      objectiveUz: 'f(x) yozuvidan foydalanasiz (qiymat topish, kompozitsiya), grafik siljish va akslantirishlarni aniqlaysiz va ildizli tenglamalarda chet (extraneous) yechimni tekshirasiz.',
      objective: 'Use function notation, identify graph shifts and reflections, and check extraneous solutions in radical equations.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Funksiya yozuvi f(x): f(3) — x o‘rniga 3 ni qo‘ying. Kompozitsiya g(f(x)): avval ichki funksiyani hisoblang, natijani tashqisiga qo‘ying. “f(a) = 10” bo‘lsa — tenglama tuzing va a ni toping. Jadval yoki grafik berilsa, f(x) = y juftlikni o‘qing.',
        'Grafik o‘zgarishlar: y = f(x) + k — k ga yuqoriga; y = f(x − h) — h ga O‘NGGA (minus — o‘ngga!); y = −f(x) — x o‘qiga nisbatan akslanadi; y = f(−x) — y o‘qiga nisbatan; y = a · f(x) — vertikal cho‘ziladi. Parabola uchun: y = (x − 3)² + 2 uchi (3, 2).',
        'Ildizli tenglama: ildizni yolg‘iz qoldiring, ikki tomonni kvadratga oshiring, yeching va ALBATTA asl tenglamaga qo‘yib tekshiring — kvadratga oshirish “chet yechim” (extraneous) berishi mumkin. Masalan x = √(x + 2): x² = x + 2 → x = 2 yoki −1; x = −1 da chap tomon −1, o‘ng tomon √1 = 1 — mos kelmaydi.',
        'Chiziq va parabola kesishishi: ikki tenglamani tenglang va hosil bo‘lgan kvadrat tenglamani yeching; kesishish nuqtalari soni = ildizlar soni (diskriminant). Tez usul: javob nuqtalarini ikkala tenglamaga qo‘yib tekshiring.',
      ],
      table: [
        { form: 'f(x) + k ↑;  f(x − h) →;  −f(x) ⇅', example: 'f(x − 2) o‘ngga 2' },
        { form: 'g(f(x)): avval ichki', example: 'f(x) = x + 1, g(x) = 2x: g(f(3)) = 8' },
        { form: '√ tenglama: kvadratga oshir va tekshir', example: 'x = √(x + 2) → faqat x = 2' },
      ],
      examples: [
        { en: 'f(x) = 2x² − 3x  →  f(4) = 32 − 12 = 20', uz: 'x o‘rniga 4 ni qo‘ying.' },
        { en: 'f(x) = x + 1, g(x) = 2x  →  g(f(3)) = g(4) = 8', uz: 'Avval f(3) = 4.' },
        { en: '√(x + 5) = 3  →  x + 5 = 9  →  x = 4', uz: 'Kvadratga oshiring.' },
        { en: 'x = √(x + 2)  →  x = 2 (x = −1 is extraneous)', uz: 'Chet yechimni tekshirish bilan topasiz.' },
      ],
      vocab: [{ en: 'function', uz: 'funksiya' }, { en: 'reflection', uz: 'akslantirish' }, { en: 'extraneous', uz: 'chet (ortiqcha) yechim' }, { en: 'radical', uz: 'ildiz' }],
      practice: [
        gap('If f(x) = 2x² − 3x, what is f(4)? ___', ['20', '20.0'], '2 · 16 − 12 = 20.'),
        ch('The graph of y = f(x) + 3 is the graph of y = f(x) shifted', ['up 3 units', 'down 3 units', 'right 3 units', 'left 3 units'], 0, '+k tashqarida: yuqoriga.'),
        ch('If f(x) = x + 1 and g(x) = 2x, what is g(f(3))?', ['7', '8', '9', '6'], 1, 'f(3) = 4; g(4) = 8.'),
        ch('What is the solution of √(x + 5) = 3?', ['x = 4', 'x = 2', 'x = 14', 'x = −4'], 0, 'x + 5 = 9 → x = 4.'),
        gap('If f(x) = x² − 2x, what is f(−1)? ___', ['3', '3.0'], '1 + 2 = 3.'),
        multi('Choose ALL true statements.', ['y = f(x − 2) shifts the graph right 2 units.', 'y = −f(x) reflects the graph across the x-axis.', 'y = f(x) + 2 shifts the graph left 2 units.', 'y = f(−x) reflects the graph across the y-axis.', 'y = f(x + 1) shifts the graph right 1 unit.'], [0, 1, 3], 'f(x) + 2 — yuqoriga; f(x + 1) — chapga.'),
      ],
      check: [
        ch('If f(x) = 3x − 2 and f(a) = 10, what is a?', ['2', '3', '4', '5'], 2, '3a − 2 = 10 → a = 4.'),
        ch('How many points of intersection do y = x + 2 and y = x² have?', ['0', '1', '2', '3'], 2, 'x² = x + 2 → (x − 2)(x + 1) = 0: ikkita (x = 2, −1).'),
        gap('Solve √(2x + 1) = 5. x = ___', ['12', '12.0'], '2x + 1 = 25 → x = 12.'),
        ch('What is the solution of x = √(x + 2)?', ['−1', '2', '−1 and 2', 'no solution'], 1, 'x² = x + 2 → x = 2 yoki −1; −1 chet yechim (ildiz manfiy bo‘lmaydi).'),
        gap('If f(x) = x² − 3x and f(a) = 10 with a > 0, then a = ___', ['5', '5.0'], 'a² − 3a − 10 = 0 → (a − 5)(a + 2) = 0 → a = 5.'),
        multi('Choose ALL statements that are true.', ['A squared radical equation can create an extraneous solution.', 'Always check solutions in the original equation.', 'y = f(x) − 4 shifts the graph down 4 units.', 'g(f(x)) means compute g first.', 'The vertex of y = (x + 1)² − 5 is (−1, −5).'], [0, 1, 2, 4], 'g(f(x)) — avval f hisoblanadi (ichki funksiya).'),
      ],
    },
  ],
};
