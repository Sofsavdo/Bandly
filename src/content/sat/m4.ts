import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// SAT kursi — Math (4/4): Geometry and Trigonometry. ORIGINAL Sellzen materiali. SAT da asosiy geometriya formulalari test bilan birga ko‘rsatiladi, lekin ularni bilish tezlikni oshiradi.
export const SAT_MATH_GEOMETRY: Unit = {
  id: 'sat-m4', level: 'B2', title: 'SAT Math: Geometry and Trigonometry', titleUz: 'SAT Math: geometriya va trigonometriya',
  situationUz: 'Burchaklar va uchburchaklar, yuza va hajm, aylana va sektor, to‘g‘ri burchakli uchburchakda sin, cos, tan va radian.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-m4-l1', title: 'Lines, angles and triangles', titleUz: 'To‘g‘ri chiziqlar, burchaklar va uchburchaklar',
      objectiveUz: 'Burchaklar yig‘indisi, parallel chiziqlar va kesuvchi hosil qilgan burchaklar, o‘xshash uchburchaklar va Pifagor teoremasini ishlatasiz.',
      objective: 'Use angle sums, angles formed by parallel lines and a transversal, similar triangles and the Pythagorean theorem.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Asosiy burchak qoidalari: uchburchak burchaklari yig‘indisi 180°; to‘g‘ri chiziqdagi qo‘shni burchaklar yig‘indisi 180°; vertikal burchaklar teng. Parallel ikki chiziqni kesuvchi kesib o‘tsa: mos burchaklar teng, ichki almashinuvchi burchaklar teng, bir tomonli ichki burchaklar yig‘indisi 180°. Teng yonli uchburchakda asosdagi burchaklar teng; tengtomonli uchburchakda har biri 60°.',
        'O‘xshash uchburchaklar: burchaklari teng bo‘lsa, mos tomonlar nisbati teng (k). Yuzalar nisbati k², hajmlar nisbati k³. Masalan, tomonlari 2 : 3 nisbatda bo‘lsa, yuzalari 4 : 9. Savolda “mos tomon” larni to‘g‘ri juftlang (eng kichik burchak qarshisidagi tomon — eng kichik tomon).',
        'To‘g‘ri burchakli uchburchakda a² + b² = c² (c — gipotenuza). Pifagor uchliklari: 3-4-5, 5-12-13, 8-15-17, 7-24-25 (va ularga proporsional). Maxsus uchburchaklar: 45°-45°-90° → tomonlar 1 : 1 : √2; 30°-60°-90° → 1 : √3 : 2 (kichik katet = gipotenuzaning yarmi). Uchburchak tengsizligi: har bir tomon qolgan ikkitasi yig‘indisidan kichik.',
      ],
      table: [
        { form: '∠A + ∠B + ∠C = 180°', example: '40° + 70° + 70° = 180°' },
        { form: 'o‘xshash: tomonlar k, yuza k², hajm k³', example: '2 : 3 → yuza 4 : 9' },
        { form: 'a² + b² = c²;  45-45-90: 1:1:√2;  30-60-90: 1:√3:2', example: '6, 8, 10' },
      ],
      examples: [
        { en: 'A triangle has angles 50° and 60°. The third angle is 180° − 110° = 70°.', uz: 'Yig‘indi 180°.' },
        { en: 'Legs 6 and 8 → hypotenuse √(36 + 64) = 10', uz: '3-4-5 ning ikki baravari.' },
        { en: 'Similar triangles with sides in ratio 2 : 3 have areas in ratio 4 : 9', uz: 'Yuzalar nisbati k².' },
        { en: 'A 30°-60°-90° triangle with hypotenuse 10 has short leg 5 and long leg 5√3', uz: 'Kichik katet — gipotenuzaning yarmi.' },
      ],
      vocab: [{ en: 'triangle', uz: 'uchburchak' }, { en: 'hypotenuse', uz: 'gipotenuza' }, { en: 'similar', uz: 'o‘xshash (geometriyada)' }, { en: 'angle', uz: 'burchak' }],
      practice: [
        gap('Two angles of a triangle are 50° and 60°. What is the third angle in degrees? ___', ['70', '70.0'], '180 − 110 = 70.'),
        ch('A right triangle has legs 6 and 8. What is the length of its hypotenuse?', ['10', '12', '14', '48'], 0, '√(36 + 64) = 10.'),
        ch('Two similar triangles have sides in the ratio 2 : 3. What is the ratio of their areas?', ['2 : 3', '4 : 6', '4 : 9', '8 : 27'], 2, 'Yuza nisbati k² = 4 : 9.'),
        gap('In a 30°-60°-90° triangle the hypotenuse is 10. The shorter leg is ___', ['5', '5.0'], 'Kichik katet = gipotenuzaning yarmi.'),
        ch('Two parallel lines are cut by a transversal. One of the angles is 65°. What is the measure of the alternate interior angle?', ['25°', '65°', '115°', '295°'], 1, 'Ichki almashinuvchi burchaklar teng.'),
        multi('Choose ALL Pythagorean triples.', ['3, 4, 5', '5, 12, 13', '6, 7, 8', '8, 15, 17', '4, 5, 6'], [0, 1, 3], '6² + 7² = 85 ≠ 64; 4² + 5² = 41 ≠ 36.'),
      ],
      check: [
        ch('A triangle has sides 5, 12 and x, where x is the hypotenuse of a right triangle. What is x?', ['13', '14', '15', '17'], 0, '5-12-13.'),
        gap('An isosceles triangle has a vertex angle of 40°. Each base angle is ___ degrees.', ['70', '70.0'], '(180 − 40) / 2 = 70.'),
        ch('A 45°-45°-90° triangle has legs of length 7. What is the hypotenuse?', ['7', '7√2', '14', '7√3'], 1, 'Gipotenuza = katet · √2.'),
        gap('Two supplementary angles: one is 112°. The other is ___ degrees.', ['68', '68.0'], '180 − 112 = 68.'),
        ch('Triangle ABC ~ triangle DEF with AB = 4 and DE = 10. If BC = 6, what is EF?', ['12', '15', '18', '24'], 1, 'k = 10 / 4 = 2,5; 6 · 2,5 = 15.'),
        multi('Choose ALL true statements.', ['Vertical angles are equal.', 'The angles of a triangle add to 180°.', 'Areas of similar figures scale by k.', 'In a 30°-60°-90° triangle the short leg is half the hypotenuse.', 'An equilateral triangle has three 60° angles.'], [0, 1, 3, 4], 'Yuzalar k² bo‘yicha o‘zgaradi.'),
      ],
    },
    {
      id: 'sat-m4-l2', title: 'Area and volume', titleUz: 'Yuza va hajm',
      objectiveUz: 'Asosiy shakllarning yuzasi va hajmini formula bilan hisoblaysiz, birliklarni (kvadrat, kub) to‘g‘ri yozasiz va o‘lchamlar o‘zgarganda yuza va hajm qanday o‘zgarishini bilasiz.',
      objective: 'Compute areas and volumes of common shapes, use square and cubic units and know how scaling changes area and volume.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Yuza formulalari: to‘g‘ri to‘rtburchak l · w; uchburchak ½ · b · h; parallelogram b · h; trapetsiya ½(b₁ + b₂)h; doira πr². Aylana uzunligi 2πr. Hajm: prizma / quti = asos yuzasi × balandlik (V = lwh); silindr πr²h; konus ⅓πr²h; shar 4/3 πr³; piramida ⅓ · asos yuzasi · h. SAT da bu formulalar test boshida ko‘rsatiladi, lekin yodlab olsangiz vaqt tejaysiz.',
        'Birliklar: yuza — kvadrat birlik (cm²), hajm — kub birlik (cm³). Aralash shakl: qismlarga bo‘ling (to‘rtburchak + yarim doira) yoki katta shakldan kichigini ayiring (“soyalangan soha” = katta yuza − kichik yuza). Hajm masalalarida suyuqlik: 1 litr = 1000 cm³.',
        'Masshtab: chiziqli o‘lcham k marta o‘zgarsa — yuza k², hajm k³. Silindr radiusi 2 marta oshsa — hajm 4 marta; balandligi ham 2 marta oshsa — 8 marta. Teskari savollar: hajm berilgan, balandlikni toping — formulani tenglamaga aylantiring (V = πr²h → h = V / πr²).',
      ],
      table: [
        { form: 'A: ½bh;  ½(b₁ + b₂)h;  πr²', example: 'uchburchak, trapetsiya, doira' },
        { form: 'V: lwh;  πr²h;  ⅓πr²h;  4/3 πr³', example: 'quti, silindr, konus, shar' },
        { form: 'k marta: yuza k², hajm k³', example: 'radius ×2 → doira yuzasi ×4' },
      ],
      examples: [
        { en: 'Triangle with b = 10, h = 6: A = ½ · 10 · 6 = 30', uz: 'Asos va unga tushirilgan balandlik.' },
        { en: 'Cylinder r = 3, h = 5: V = π · 9 · 5 = 45π', uz: 'πr²h.' },
        { en: 'Trapezoid bases 6 and 10, h = 4: A = ½(16)(4) = 32', uz: 'O‘rta chiziq × balandlik.' },
        { en: 'Doubling the radius of a circle multiplies its area by 4', uz: 'Yuza k² bo‘yicha.' },
      ],
      vocab: [{ en: 'area', uz: 'yuza' }, { en: 'volume', uz: 'hajm' }, { en: 'radius', uz: 'radius' }, { en: 'cylinder', uz: 'silindr' }],
      practice: [
        gap('What is the area of a triangle with base 10 and height 6? ___', ['30', '30.0'], '½ · 10 · 6 = 30.'),
        ch('A cylinder has radius 3 and height 5. What is its volume?', ['15π', '30π', '45π', '90π'], 2, 'π · 3² · 5 = 45π.'),
        gap('A trapezoid has bases 6 and 10 and height 4. What is its area? ___', ['32', '32.0'], '½ · (6 + 10) · 4 = 32.'),
        ch('If the radius of a circle is doubled, its area is multiplied by', ['2', '4', '8', '16'], 1, 'Yuza k² = 4.'),
        ch('A rectangular box is 4 cm by 5 cm by 6 cm. What is its volume?', ['15 cm³', '74 cm³', '120 cm³', '148 cm³'], 2, '4 · 5 · 6 = 120.'),
        multi('Choose ALL true statements.', ['Circle area = πr².', 'Circumference = 2πr.', 'Cone volume = πr²h.', 'Box volume = lwh.', 'Triangle area = ½bh.'], [0, 1, 3, 4], 'Konus: ⅓πr²h.'),
      ],
      check: [
        ch('A rectangle has area 48 and width 6. What is its length?', ['6', '7', '8', '9'], 2, '48 / 6 = 8.'),
        gap('A cube has edge length 4. What is its volume? ___', ['64', '64.0'], '4³ = 64.'),
        ch('A circle has circumference 10π. What is its radius?', ['2', '5', '10', '20'], 1, '2πr = 10π → r = 5.'),
        gap('The shaded region is a 10 × 10 square with a 4 × 4 square removed. Its area is ___', ['84', '84.0'], '100 − 16 = 84.'),
        ch('A cylinder’s radius doubles and its height stays the same. Its volume is multiplied by', ['2', '4', '6', '8'], 1, 'V ~ r²: ×4.'),
        multi('Choose ALL true statements.', ['Area is measured in square units.', 'Volume is measured in cubic units.', 'If every length doubles, volume doubles.', '1 liter = 1,000 cm³.', 'The area of a circle uses r².'], [0, 1, 3, 4], 'Hamma uzunlik 2 marta oshsa — hajm 8 marta oshadi.'),
      ],
    },
    {
      id: 'sat-m4-l3', title: 'Circles: arcs, sectors and equations', titleUz: 'Aylana: yoy, sektor va tenglama',
      objectiveUz: 'Yoy uzunligi va sektor yuzasini markaziy burchak bo‘yicha topasiz, aylana tenglamasini o‘qiysiz va markaz bilan radiusni aniqlaysiz.',
      objective: 'Find arc length and sector area from the central angle and read the equation of a circle to get its center and radius.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Aylana: uzunligi C = 2πr, doira yuzi A = πr². Markaziy burchak θ (gradusda) bo‘lsa: yoy uzunligi = (θ / 360) · 2πr; sektor yuzi = (θ / 360) · πr². Ya’ni butunning shu ulushini oling. Masalan r = 6, θ = 60°: yoy = (1/6) · 12π = 2π; sektor = (1/6) · 36π = 6π.',
        'Burchaklar: markaziy burchak = u tiralgan yoyning gradus o‘lchovi; shu yoyga tiralgan ichki chizilgan burchak (inscribed) yarmiga teng. Diametrga tiralgan ichki burchak 90°. Urinma radiusga urinish nuqtasida perpendikulyar. Xordalar kesishganda kesmalar ko‘paytmasi teng.',
        'Aylana tenglamasi: (x − h)² + (y − k)² = r²: markaz (h, k), radius r. Misol: (x − 2)² + (y + 3)² = 25 → markaz (2, −3), radius 5. x² + y² + bx + cy + d = 0 shakli berilsa — to‘la kvadratga keltiring. Nuqta aylanada yotadimi — koordinatalarni qo‘yib tekshiring.',
      ],
      table: [
        { form: 'yoy = (θ/360) · 2πr;  sektor = (θ/360) · πr²', example: 'r = 6, θ = 60° → 2π;  6π' },
        { form: 'inscribed burchak = markaziy / 2', example: '80° → 40°' },
        { form: '(x − h)² + (y − k)² = r²', example: '(x − 2)² + (y + 3)² = 25 → (2, −3), r = 5' },
      ],
      examples: [
        { en: 'r = 6, θ = 60°: arc = (60/360) · 2π · 6 = 2π', uz: 'Ulush 1/6.' },
        { en: 'r = 6, θ = 60°: sector = (1/6) · π · 36 = 6π', uz: 'Shu ulush yuzdan.' },
        { en: '(x − 2)² + (y + 3)² = 25 → center (2, −3), radius 5', uz: 'y + 3 = y − (−3).' },
        { en: 'An inscribed angle on an arc of 80° measures 40°', uz: 'Yarmi.' },
      ],
      vocab: [{ en: 'circle', uz: 'aylana, doira' }, { en: 'arc', uz: 'yoy' }, { en: 'sector', uz: 'sektor' }, { en: 'chord', uz: 'xorda' }],
      practice: [
        gap('A circle has radius 6. What is the length of a 60° arc? Give the coefficient of π. ___π', ['2', '2.0'], '(60 / 360) · 2π · 6 = 2π.'),
        gap('A circle has radius 6. The area of a 60° sector is ___π', ['6', '6.0'], '(1/6) · π · 36 = 6π.'),
        ch('What is the center of the circle (x − 2)² + (y + 3)² = 25?', ['(2, 3)', '(−2, 3)', '(2, −3)', '(−2, −3)'], 2, '(x − h): h = 2; (y − k) = (y + 3): k = −3.'),
        gap('What is the radius of the circle (x − 2)² + (y + 3)² = 25? ___', ['5', '5.0'], 'r² = 25 → r = 5.'),
        ch('An inscribed angle intercepts an arc of 80°. Its measure is', ['40°', '80°', '160°', '20°'], 0, 'Ichki chizilgan burchak — yoyning yarmi.'),
        multi('Choose ALL true statements.', ['An angle inscribed in a semicircle is 90°.', 'A tangent is perpendicular to the radius at the point of tangency.', 'Circumference = πr².', 'Area = πr².', 'A diameter is the longest chord.'], [0, 1, 3, 4], 'Aylana uzunligi 2πr.'),
      ],
      check: [
        gap('A circle has circumference 12π. What is its area? Give the coefficient of π. ___π', ['36', '36.0'], '2πr = 12π → r = 6; A = 36π.'),
        ch('A 90° sector of a circle with radius 4 has area', ['2π', '4π', '8π', '16π'], 1, '(1/4) · π · 16 = 4π.'),
        ch('Which equation describes a circle with center (1, 2) and radius 3?', ['(x − 1)² + (y − 2)² = 9', '(x + 1)² + (y + 2)² = 9', '(x − 1)² + (y − 2)² = 3', 'x² + y² = 9'], 0, 'r² = 9.'),
        gap('The center of x² + y² = 49 is (0, 0) and its radius is ___', ['7', '7.0'], 'r² = 49.'),
        ch('The point (3, 4) lies on a circle with center (0, 0). The radius is', ['5', '7', '12', '25'], 0, '√(9 + 16) = 5.'),
        multi('Choose ALL true statements.', ['Equal chords are equally distant from the center.', 'A central angle equals its intercepted arc in degrees.', 'The equation (x − 3)² + y² = 4 has center (3, 0).', 'An inscribed angle is twice the central angle.', 'Arc length is a fraction of the circumference.'], [0, 1, 2, 4], 'Ichki chizilgan burchak markaziyning yarmi.'),
      ],
    },
    {
      id: 'sat-m4-l4', title: 'Right-triangle trigonometry and radians', titleUz: 'To‘g‘ri burchakli uchburchakda trigonometriya va radian',
      objectiveUz: 'sin, cos, tan ni qarama-qarshi katet / qo‘shni katet / gipotenuza nisbati sifatida topasiz, to‘ldiruvchi burchaklar munosabatini bilasiz va gradusni radianga almashtirasiz.',
      objective: 'Find sin, cos and tan as side ratios, use the complementary-angle relation and convert between degrees and radians.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'To‘g‘ri burchakli uchburchakda o‘tkir burchak A uchun: sin A = qarama-qarshi katet / gipotenuza; cos A = qo‘shni katet / gipotenuza; tan A = qarama-qarshi / qo‘shni (SOH-CAH-TOA). Tomonlari 3, 4, 5: A burchak qarshisida 3 bo‘lsa sin A = 3/5, cos A = 4/5, tan A = 3/4. Bir chiziqda sin²A + cos²A = 1.',
        'To‘ldiruvchi burchaklar: A + B = 90° bo‘lsa sin A = cos B va cos A = sin B (SAT ning sevimli savoli: “sin 20° = cos x, x = ?” → x = 70°). Maxsus burchaklar: sin 30° = 1/2, cos 30° = √3/2, sin 45° = cos 45° = √2/2, sin 60° = √3/2, cos 60° = 1/2.',
        'Radian: 180° = π radian, shuning uchun 1° = π/180 rad; 90° = π/2; 60° = π/3; 45° = π/4; 30° = π/6. Radiandan gradusga: ko‘paytiring 180/π ga. Yoy uzunligi radianda: s = rθ. Eng ko‘p xato — kalkulyator rejimi (degree / radian). SAT Desmos kalkulyatori bilan: rejimni tekshiring.',
      ],
      table: [
        { form: 'sin = qarama-qarshi / gipotenuza', example: 'tomonlari 3-4-5: sin A = 3/5' },
        { form: 'cos A = sin(90° − A)', example: 'sin 20° = cos 70°' },
        { form: '180° = π rad', example: '60° = π/3' },
      ],
      examples: [
        { en: 'Right triangle with sides 3, 4, 5 and A opposite 3: sin A = 3/5, cos A = 4/5, tan A = 3/4', uz: 'SOH-CAH-TOA.' },
        { en: 'If sin 20° = cos x°, then x = 70', uz: 'x = 90 − 20.' },
        { en: '60° = 60 · π/180 = π/3 radians', uz: 'Gradusni π/180 ga ko‘paytiring.' },
        { en: 'sin A = 3/5 → cos A = √(1 − 9/25) = 4/5', uz: 'sin² + cos² = 1.' },
      ],
      vocab: [{ en: 'sine', uz: 'sinus' }, { en: 'cosine', uz: 'kosinus' }, { en: 'tangent', uz: 'tangens' }, { en: 'radian', uz: 'radian' }],
      practice: [
        ch('In a right triangle with sides 3, 4 and 5, angle A is opposite the side of length 3. What is sin A?', ['3/4', '3/5', '4/5', '5/3'], 1, 'qarama-qarshi / gipotenuza = 3/5.'),
        gap('If sin 20° = cos x°, what is x? ___', ['70', '70.0'], 'sin A = cos(90° − A): x = 70.'),
        ch('How many radians is 60°?', ['π/6', 'π/4', 'π/3', 'π/2'], 2, '60 · π/180 = π/3.'),
        ch('If sin A = 3/5 and A is acute, what is cos A?', ['3/4', '4/5', '5/3', '5/4'], 1, '√(1 − 9/25) = 4/5.'),
        ch('What is tan A if the opposite side is 5 and the adjacent side is 12?', ['5/12', '12/5', '5/13', '12/13'], 0, 'qarama-qarshi / qo‘shni = 5/12.'),
        multi('Choose ALL true statements.', ['sin 30° = 1/2', 'cos 60° = 1/2', 'sin 45° = cos 45°', 'tan 45° = 0', '180° = π radians'], [0, 1, 2, 4], 'tan 45° = 1.'),
      ],
      check: [
        ch('A right triangle has legs 5 and 12. If A is opposite the leg of length 5, what is cos A?', ['5/13', '12/13', '5/12', '13/12'], 1, 'Gipotenuza 13; qo‘shni 12 → 12/13.'),
        gap('How many degrees is π/4 radians? ___', ['45', '45.0'], '(π/4) · 180/π = 45.'),
        ch('If cos B = sin 35°, with B acute, then B =', ['35°', '55°', '65°', '145°'], 1, 'B = 90° − 35° = 55°.'),
        gap('A ladder 10 m long makes 30° with the ground. How high does it reach? (m) ___', ['5', '5.0'], 'sin 30° = h / 10 → h = 5.'),
        ch('In a right triangle, hypotenuse 13 and one leg 5. What is tan of the angle opposite the 5?', ['5/12', '12/5', '5/13', '13/5'], 0, 'Boshqa katet 12: tan = 5/12.'),
        multi('Choose ALL true statements.', ['sin²A + cos²A = 1', 'sin A = cos(90° − A)', 'tan A = sin A / cos A', '1 radian = 180°', 'Check the calculator is in the right degree/radian mode.'], [0, 1, 2, 4], '180° = π radian, 1 radian emas.'),
      ],
    },
  ],
};
