import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// SAT kursi — Reading and Writing (1/2): Standard English Conventions va Expression of Ideas.
// ORIGINAL Sellzen o‘quv materiali: College Board materiali emas, SAT ball taxmin qilinmaydi. Digital SAT bo‘limlari tuzilishi rasmiy sahifalar asosida (examFormats).
export const SAT_RW_CONVENTIONS: Unit = {
  id: 'sat-rw1', level: 'B2', title: 'SAT R&W: Standard English Conventions', titleUz: 'SAT Reading & Writing: grammatika va tinish belgilari',
  situationUz: 'Digital SAT dagi eng “formulali” savollar: gap chegaralari, tinish belgilari, moslashuv, zamon, olmosh, parallellik. Qoidani bilsangiz, har bir savol 20–30 soniyada yechiladi.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-rw1-l1', title: 'Sentence boundaries: fragments, run-ons, comma splices', titleUz: 'Gap chegaralari: bo‘lak, birikib ketgan gap, vergul bilan ulash xatosi',
      objectiveUz: 'Mustaqil gapni boshqasi bilan to‘g‘ri ulaysiz (nuqta, nuqta-vergul, vergul + bog‘lovchi) va fragment, run-on, comma splice xatolarini topasiz.',
      objective: 'Join independent clauses correctly and spot fragments, run-ons and comma splices.',
      taxonomyIds: ['G.complex_structure', 'W.coherence'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'SAT dagi “Boundaries” savollari gap chegarasini tekshiradi. Mustaqil gap (independent clause) — ega + kesim bor va o‘zi fikr tugatadi: “It rained.” Ikki mustaqil gapni to‘rt xil to‘g‘ri ulash mumkin: (1) nuqta — “It rained. We stayed home.” (2) nuqta-vergul — “It rained; we stayed home.” (3) vergul + FANBOYS (for, and, nor, but, or, yet, so) — “It rained, so we stayed home.” (4) bo‘ysunish — “Because it rained, we stayed home.”',
        'Eng ko‘p xato — comma splice: ikki mustaqil gapni FAQAT vergul bilan ulash (“It rained, we stayed home.” — xato). Run-on (fused sentence) — ikkisini hech qanday belgisiz yozish (“It rained we stayed home.”). Fragment — to‘liq fikr bermaydigan bo‘lak: “Although it rained.” (bo‘ysunuvchi bog‘lovchi bor, bosh gap yo‘q).',
        'Nuqta-vergul (;) faqat ikki MUSTAQIL gap orasida turadi: ikkala tomon ham alohida gap bo‘la olishi kerak. Ikki nuqta (:) dan OLDIN to‘liq gap bo‘lishi shart, keyin ro‘yxat, izoh yoki misol keladi: “She packed three things: a map, a compass and water.” Ikki nuqtadan oldin “She packed:” kabi to‘liq bo‘lmagan qism qo‘yilsa — xato.',
        'Tez usul: belgidan oldin va keyingi qismni alohida o‘qing va “bu to‘liq gapmi?” deb so‘rang. Ikkalasi ham to‘liq bo‘lsa — nuqta, nuqta-vergul yoki vergul + FANBOYS ishlaydi (faqat vergul — yo‘q). Bir tomoni bo‘lak bo‘lsa — nuqta yoki nuqta-vergul ishlamaydi. however, therefore kabi so‘zlar bog‘lovchi emas: ularning oldida nuqta-vergul yoki nuqta kerak.',
      ],
      table: [
        { form: '. yoki ; (ikki tomon ham to‘liq gap)', example: 'The river froze; the ferry stopped.' },
        { form: ', + for / and / nor / but / or / yet / so', example: 'The river froze, so the ferry stopped.' },
        { form: ': (oldidan to‘liq gap)', example: 'She packed three things: a map, a compass and water.' },
      ],
      examples: [
        { en: 'The river froze; the ferry stopped running.', uz: 'Ikki mustaqil gap nuqta-vergul bilan to‘g‘ri ulangan.' },
        { en: 'The river froze, so the ferry stopped running.', uz: 'Vergul + so (FANBOYS) — to‘g‘ri ulash.' },
        { en: 'Although the river froze, the ferry kept running.', uz: 'Although qismi bo‘ysunuvchi: undan keyin vergul va bosh gap keladi.' },
        { en: 'She packed three things: a map, a compass and water.', uz: 'Ikki nuqtadan oldin to‘liq gap, keyin ro‘yxat.' },
      ],
      vocab: [{ en: 'clause', uz: 'gap qismi (sodda gap)' }, { en: 'fragment', uz: 'bo‘lak, tugallanmagan gap' }, { en: 'semicolon', uz: 'nuqta-vergul' }, { en: 'conjunction', uz: 'bog‘lovchi' }],
      practice: [
        ch('Which choice is punctuated correctly?', ['The bridge was closed, traffic was rerouted.', 'The bridge was closed; traffic was rerouted.', 'The bridge was closed traffic was rerouted.', 'The bridge was closed; and traffic was rerouted.'], 1, 'Ikki mustaqil gap nuqta-vergul bilan to‘g‘ri. Faqat vergul — comma splice; “; and” — noto‘g‘ri.'),
        ch('Which choice is a complete sentence?', ['Because the lab lost its funding.', 'The lab, which lost its funding.', 'The lab lost its funding.', 'Losing its funding in the spring.'], 2, 'Faqat “The lab lost its funding.” da ega + kesim bor va fikr tugagan.'),
        ch('Mia studied all night, ___ she still felt unprepared.', ['but', 'however', 'therefore', 'otherwise'], 0, 'Vergul bilan faqat FANBOYS ulaydi: but. However / therefore — bog‘lovchi emas.'),
        ch('Which choice correctly uses a colon?', ['She needs: a map and a compass.', 'She needs three things: a map, a compass, and water.', 'She needs three things, a map: a compass, and water.', 'She needs three: things a map, a compass, and water.'], 1, 'Ikki nuqtadan OLDIN to‘liq gap bo‘lishi kerak: “She needs three things”.'),
        gap('“The test ended, the students left.” This error is called a comma ___.', ['splice'], 'Ikki mustaqil gapni faqat vergul bilan ulash — comma splice.'),
        multi('Choose ALL the sentences that are punctuated correctly.', ['The lake froze; the ferry stopped.', 'The lake froze, the ferry stopped.', 'The lake froze, so the ferry stopped.', 'Although the lake froze.', 'The lake froze the ferry stopped.'], [0, 2], 'To‘g‘ri: nuqta-vergul va vergul + so. Xato: comma splice, fragment (Although…), run-on.'),
      ],
      check: [
        ch('The council approved the plan___ construction began in June.', [', and', ',', ' and,', ' ;and'], 0, 'Ikki mustaqil gap: vergul + and to‘g‘ri; yolg‘iz vergul — comma splice.'),
        ch('Which choice is a fragment?', ['Rain fell all morning.', 'When the rain finally stopped.', 'We waited under the bridge.', 'The streets were empty.'], 1, 'When bilan boshlangan bo‘ysunuvchi qism bosh gapsiz — fragment.'),
        ch('The author’s argument is simple___ readers should trust local data.', [':', ',', ' and,', ' but,'], 0, 'Ikki nuqtadan oldin to‘liq gap, keyin izoh (readers should trust local data) — to‘g‘ri.'),
        ch('The film was long___ it never felt slow.', ['; yet', ', yet,', ' yet', ';, yet'], 0, 'Ikkala tomon to‘liq gap; “yet” oldidan nuqta-vergul yoki vergul qo‘yish mumkin, variantlardan faqat “; yet” tinish jihatdan to‘g‘ri.'),
        gap('A group of words that lacks a complete thought is a sentence ___ . (one word)', ['fragment'], 'To‘liq fikr bermaydigan bo‘lak — fragment.'),
        multi('Choose ALL the options that correctly join: “The shop closed” and “the owner retired”.', ['The shop closed; the owner retired.', 'The shop closed, the owner retired.', 'The shop closed, and the owner retired.', 'The shop closed and the owner retired.', 'The shop closed, however the owner retired.'], [0, 2, 3], 'To‘g‘ri: nuqta-vergul, vergul + and, hatto vergulsiz and ham qisqa gapda qabul qilinadi. “, however” — xato (comma splice).'),
      ],
    },
    {
      id: 'sat-rw1-l2', title: 'Punctuation inside sentences: commas, dashes, apostrophes', titleUz: 'Gap ichidagi tinish belgilari: vergul, tire, apostrof',
      objectiveUz: 'Ortiqcha ma’lumotni (nonessential) vergul yoki tire bilan ajratasiz, vergulni noto‘g‘ri joyga qo‘ymaysiz va apostrofni (egalik, qisqartma) to‘g‘ri ishlatasiz.',
      objective: 'Set off nonessential information, avoid unnecessary commas and use apostrophes correctly.',
      taxonomyIds: ['W.coherence', 'V.spelling'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Vergul qoidasi №1: ortiqcha (nonessential) ma’lumot — olib tashlasangiz ham gap ma’nosi buzilmaydigan qism — ikki tomondan BIR XIL belgi bilan ajratiladi: ikkita vergul, ikkita tire yoki qavs. “My sister, who lives in Samarkand, is a nurse.” Bir tomonda vergul, ikkinchisida tire (“, … —”) — xato.',
        'Muhim (essential) ma’lumot — olib tashlansa ma’no o‘zgaradi — vergulsiz yoziladi: “The student who won the prize is my cousin.” (qaysi talaba ekani shu qism bilan aniqlanadi). Ega va kesim orasiga, kesim va to‘ldiruvchi orasiga yolg‘iz vergul qo‘yilmaydi: “The results of the survey, were clear.” — xato.',
        'Vergul yana kerak: (1) ro‘yxat elementlari orasida; (2) kirish qismdan keyin (“After the storm, the road reopened.”); (3) ikki mustaqil gap orasida vergul + FANBOYS. Apostrof: egalik — “the student’s book” (bitta talaba), “the students’ books” (ko‘p talaba); qisqartma — “it’s” = it is; “its” — uning (egalik). Ko‘plik uchun apostrof qo‘yilmaydi: “three books”, “three book’s” emas.',
        'Tire (—) vergul yoki qavs o‘rnida ham ishlaydi, lekin juft bo‘lishi kerak; ikki nuqta oldida to‘liq gap turadi. Savolda variantlar faqat tinish belgisi bilan farq qilsa: avval ortiqcha qismni toping, so‘ng ikki chegarada ham bir xil belgi borligini tekshiring.',
      ],
      table: [
        { form: 'ortiqcha qism: ,…, yoki —…— yoki (…)', example: 'My sister, who lives in Samarkand, is a nurse.' },
        { form: 'muhim qism: vergulsiz', example: 'The student who won the prize is my cousin.' },
        { form: 'apostrof: egalik ’s / s’; qisqartma it’s = it is', example: 'the students’ books; it’s late' },
      ],
      examples: [
        { en: 'The author, a former engineer, writes about bridges.', uz: 'Ortiqcha qism ikki vergul bilan ajratilgan.' },
        { en: 'The book that I borrowed was overdue.', uz: 'Muhim qism (that I borrowed) — vergulsiz.' },
        { en: 'After the long storm, the road finally reopened.', uz: 'Kirish qismdan keyin vergul.' },
        { en: 'The students’ projects were displayed in the hall.', uz: 'Ko‘p talabaning loyihalari: students’ (egalik apostrofi so‘ngda).' },
      ],
      vocab: [{ en: 'nonessential', uz: 'ortiqcha, ikkinchi darajali' }, { en: 'apostrophe', uz: 'apostrof' }, { en: 'dash', uz: 'tire' }, { en: 'possessive', uz: 'egalik shakli' }],
      practice: [
        ch('Which choice is punctuated correctly?', ['Her brother, a skilled pilot, lives abroad.', 'Her brother, a skilled pilot lives abroad.', 'Her brother a skilled pilot, lives abroad.', 'Her brother, a skilled pilot; lives abroad.'], 0, 'Ortiqcha qism (a skilled pilot) ikki tomondan vergul bilan ajratiladi.'),
        ch('Which choice is punctuated correctly?', ['The results of the survey, were clear.', 'The results, of the survey were clear.', 'The results of the survey were clear.', 'The results of, the survey were clear.'], 2, 'Ega va kesim orasiga yolg‘iz vergul qo‘yilmaydi.'),
        ch('The ___ stories were published in a single volume.', ['writers’', 'writer’s’', 'writers', 'writer’s'], 0, 'Bir nechta yozuvchining hikoyalari: writers’ (ko‘plik + egalik).'),
        ch('The company moved ___ headquarters to Tashkent.', ['its', 'it’s', 'its’', 'it’s’'], 0, 'Egalik — its (apostrofsiz). it’s = it is.'),
        gap('Complete: “___ late, so we took a taxi.” (It is, contracted)', ['It’s'], 'It’s = it is (qisqartma).'),
        multi('Choose ALL the correctly punctuated sentences.', ['My uncle, who is a pilot, visits every June.', 'The tree that fell was very old.', 'The tree, that fell was very old.', 'Three book’s were missing.', 'After lunch, we left.'], [0, 1, 4], 'To‘g‘ri: ortiqcha qism vergulda; muhim qism vergulsiz; kirish qismdan keyin vergul. Xato: “that” qismi vergul bilan; “book’s” ko‘plik uchun.'),
      ],
      check: [
        ch('Which choice is punctuated correctly?', ['The museum, which opened in 1920, attracts many visitors.', 'The museum, which opened in 1920 attracts many visitors.', 'The museum which opened in 1920, attracts many visitors.', 'The museum, which opened in 1920; attracts many visitors.'], 0, 'Ortiqcha qism (which opened in 1920) ikki tomondan bir xil — ikkita vergul bilan ajratiladi.'),
        ch('Which choice is correct?', ['My neighbors dog barked all night.', 'My neighbor’s dog barked all night.', 'My neighbors’s dog barked all night.', 'My neighbor’s, dog barked all night.'], 1, 'Bitta qo‘shni itiga egalik: neighbor’s.'),
        ch('Which choice is punctuated correctly?', ['When the bell rang the class ended.', 'When the bell rang, the class ended.', 'When, the bell rang the class ended.', 'When the bell rang; the class ended.'], 1, 'Kirish qism (When…) dan keyin vergul.'),
        ch('Which choice is punctuated correctly?', ['The report — which took a year to write — was published in May.', 'The report, which took a year to write — was published in May.', 'The report — which took a year to write, was published in May.', 'The report which took a year to write — was published in May.'], 0, 'Juft tire to‘g‘ri: ikkala chegarada bir xil belgi bo‘lishi kerak.'),
        gap('Possessive of “children” (no -s plural): the ___ toys.', ['children’s'], 'Ko‘plik -s bilan tugamaydi: children’s.'),
        multi('Choose ALL the sentences with a correct apostrophe.', ['It’s a long road.', 'The dog wagged its tail.', 'Its raining outside.', 'Both teams’ coaches agreed.', 'The tomato’s were ripe.'], [0, 1, 3], 'To‘g‘ri: it’s = it is; its — egalik; teams’ — ko‘plik egalik. Xato: “Its raining”, “tomato’s” (ko‘plik).'),
      ],
    },
    {
      id: 'sat-rw1-l3', title: 'Subject–verb agreement and verb forms', titleUz: 'Ega–kesim moslashuvi, zamon va fe’l shakli',
      objectiveUz: 'Ega va kesimni (orada turgan so‘zlarga qaramay) moslaysiz, zamon izchilligini saqlaysiz va fe’lning to‘g‘ri shaklini (-ing, -ed, to + fe’l) tanlaysiz.',
      objective: 'Make verbs agree with their subjects across interrupting phrases, keep tenses consistent and choose the right verb form.',
      taxonomyIds: ['G.sva', 'G.tense'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Asosiy qoida: fe’l EGA bilan moslashadi, undan oldingi yoki keyingi so‘z bilan emas. SAT bu qoidani ega va kesim orasiga uzun qism qo‘yib sinaydi: “The collection of rare manuscripts ___ (is / are) open to visitors.” Ega — collection (birlik), shuning uchun is. “of rare manuscripts”, “which includes …”, “along with …” kabi qismlarni vaqtincha olib tashlab o‘qing.',
        'Maxsus holatlar: (1) “each, every, either, neither, everyone, nobody” — birlik. (2) “A and B” (qo‘shilgan ega) — ko‘plik: “Tea and coffee are popular.” (3) “A or B”, “neither A nor B” — fe’l YAQINROQ egaga moslashadi: “Neither the students nor the teacher was late.” (4) “The number of … is / A number of … are.” (5) Gap boshida “There” bo‘lsa, ega fe’ldan keyin keladi: “There are three options.”',
        'Zamon izchilligi: gapda bir davr bo‘lsa, fe’llar bir xil davrda turadi (“She opened the file and read the report.”). Zamon ko‘rsatkichiga e’tibor: “In 2010, the city ___ (built / builds) a new library.” — o‘tgan zamon. Umumiy haqiqat va ilmiy faktlar — hozirgi zamon (“Water boils at 100°C.”).',
        'Fe’l shakli: “to + fe’l” (maqsad: “She went to the library to study.”), “-ing” (predlogdan keyin: “after finishing”), “-ed / III shakl” (sifatdosh: “the document signed by both parties”). Sifatdosh bilan boshlangan gapda boshlovchi qism gapning egasini tavsiflashi kerak (modifier) — keyingi darsda.',
      ],
      table: [
        { form: 'ega ≠ oradagi qism', example: 'The collection of rare manuscripts is open.' },
        { form: 'each / every / everyone / neither → birlik', example: 'Each of the volunteers receives a certificate.' },
        { form: 'A and B → ko‘plik; A or B → yaqin ega', example: 'Neither the students nor the teacher was late.' },
      ],
      examples: [
        { en: 'The results of the experiments are published online.', uz: 'Ega — results (ko‘plik), shuning uchun are; “of the experiments” fe’lni belgilamaydi.' },
        { en: 'Each of the volunteers receives a certificate.', uz: 'Each — birlik: receives.' },
        { en: 'Neither the manager nor the employees were informed.', uz: 'Nor dan keyingi ega (employees) ko‘plik — were.' },
        { en: 'In 2015 the company opened an office in Samarkand.', uz: 'Vaqt ko‘rsatkichi (2015) — o‘tgan zamon.' },
      ],
      vocab: [{ en: 'agreement', uz: 'moslashuv, kelishuv' }, { en: 'singular', uz: 'birlik' }, { en: 'plural', uz: 'ko‘plik' }, { en: 'consistent', uz: 'izchil' }],
      practice: [
        ch('The collection of rare manuscripts ___ open to visitors on Fridays.', ['is', 'are', 'were', 'have been'], 0, 'Ega — collection (birlik): is.'),
        ch('Neither the manager nor the employees ___ informed about the change.', ['was', 'were', 'is', 'has been'], 1, 'Nor dan keyin yaqin ega — employees (ko‘plik): were.'),
        ch('Each of the new machines ___ been tested.', ['have', 'has', 'are', 'were'], 1, 'Each — birlik: has.'),
        ch('In 1998, the city ___ a new bridge across the river.', ['builds', 'built', 'has built', 'will build'], 1, 'Aniq o‘tgan yil — o‘tgan zamon (built).'),
        gap('There ___ three possible explanations for the result. (is / are)', ['are'], 'There dan keyin ega — explanations (ko‘plik): are.'),
        multi('Choose ALL the sentences with correct agreement.', ['The key to the solutions is simple.', 'The keys to the solution is simple.', 'Tea and coffee are popular here.', 'Everyone were ready.', 'A number of students are absent.'], [0, 2, 4], 'To‘g‘ri: key (birlik) → is; A and B → are; a number of → are. Xato: keys…is; everyone…were.'),
        ch('Water ___ at 100 degrees Celsius at sea level.', ['boiled', 'boils', 'is boiled', 'had boiled'], 1, 'Umumiy ilmiy fakt — hozirgi zamon: boils.'),
      ],
      check: [
        ch('The price of fuel and electricity ___ risen sharply this year.', ['has', 'have', 'are', 'were'], 0, '“The price” — ega (birlik); of fuel and electricity — o‘rta qism. has.'),
        ch('Either the coach or the players ___ responsible.', ['is', 'are', 'was', 'has been'], 1, 'Or dan keyin yaqin ega — players (ko‘plik): are.'),
        ch('The number of applicants ___ increased every year.', ['have', 'has', 'are', 'were'], 1, 'The number of … — birlik: has.'),
        ch('She opened the file, ___ the report and made notes.', ['reads', 'read', 'has read', 'will read'], 1, 'Gapdagi davr izchil: opened → read (o‘tgan zamon).'),
        gap('Everyone in the group ___ a copy of the schedule. (receive, present)', ['receives'], 'Everyone — birlik: receives.'),
        multi('Choose ALL the sentences in which the verb form is correct.', ['She went to the library to study.', 'After finishing the exam, he left.', 'He suggested to take a break.', 'The document signed by both parties is valid.', 'They enjoy to play chess.'], [0, 1, 3], 'To‘g‘ri: maqsad (to study), predlogdan keyin -ing, sifatdosh (signed). Xato: suggested + -ing (suggested taking), enjoy + -ing.'),
      ],
    },
    {
      id: 'sat-rw1-l4', title: 'Pronouns, modifiers, parallelism and plural nouns', titleUz: 'Olmosh, aniqlovchi, parallellik va ko‘plik shakli',
      objectiveUz: 'Olmosh va u ishora qilgan otni moslaysiz, boshlovchi aniqlovchi (modifier) ni to‘g‘ri otga bog‘laysiz va parallel tuzilmani saqlaysiz.',
      objective: 'Match pronouns to their antecedents, attach opening modifiers to the right noun and keep parallel structure.',
      taxonomyIds: ['G.pronoun', 'G.complex_structure'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Olmosh (pronoun) o‘zi ishora qilgan otga (antecedent) son va shaxs bo‘yicha moslashadi: “The committee made its decision.” (committee — birlik, shuning uchun its, their emas.) Noaniq olmosh xatosi: “When Aziz met Karim, he was late.” — he kim? SAT bunday gapda aniq otni qo‘yishni talab qiladi.',
        'Boshlovchi aniqlovchi (opening modifier) — gap boshidagi qism (sifatdosh yoki sifat birikmasi) — vergul bilan ajratiladi va undan KEYINGI gap egasini tavsiflaydi. “Walking to school, the rain started.” — xato (rain yurmaydi). To‘g‘risi: “Walking to school, Dilnoza noticed the rain.” Savolda variantlarning BOSHLANISHIga qarang: kim qilyapti?',
        'Parallellik: ro‘yxat yoki qiyoslashdagi bo‘laklar bir xil grammatik shaklda: “She likes reading, writing and painting.” (hammasi -ing), “to read, to write, to paint”. Xato: “She likes reading, to write and painting.” Qiyoslashda ham: “faster than driving” emas, “faster than driving a car”… Bir turdagi narsa bilan bir turdagi narsani solishtiring: “The climate of Tashkent is milder than that of Moscow.”',
        'Ko‘plik va egalik: “the city’s parks” (bitta shahar), “the cities’ parks”. Olmosh egaligi — its / their / his (apostrofsiz). Who — odamlar, which — narsalar, that — ikkalasi (muhim qismda). Who (ega) va whom (to‘ldiruvchi): “The nurse who helped me” / “the nurse whom I thanked”.',
      ],
      table: [
        { form: 'olmosh = antecedent bilan moslashadi', example: 'The committee made its decision.' },
        { form: 'opening modifier → keyingi ega', example: 'Walking to school, Dilnoza noticed the rain.' },
        { form: 'parallel: bir xil shakl', example: 'She likes reading, writing and painting.' },
      ],
      examples: [
        { en: 'The company announced its new policy on Monday.', uz: 'Company — birlik: its.' },
        { en: 'Having finished the report, Aziz sent it to his manager.', uz: 'Boshlovchi qism Aziz ga tegishli — ega shu: Aziz.' },
        { en: 'The program helps students find internships, write résumés and prepare for interviews.', uz: 'Uchta bo‘lak bir xil shaklda (find, write, prepare).' },
        { en: 'The nurse who helped me was kind.', uz: 'Odam uchun who.' },
      ],
      vocab: [{ en: 'pronoun', uz: 'olmosh' }, { en: 'antecedent', uz: 'olmosh ishora qilgan ot' }, { en: 'modifier', uz: 'aniqlovchi' }, { en: 'parallel', uz: 'parallel, bir xil tuzilmali' }],
      practice: [
        ch('The committee announced ___ decision on Friday.', ['their', 'its', 'it’s', 'theirs'], 1, 'Committee — birlik; egalik: its (apostrofsiz).'),
        ch('Walking along the river, ___.', ['the cold wind surprised Dilnoza', 'Dilnoza was surprised by the cold wind', 'a cold wind was surprising', 'the wind made a surprise'], 1, 'Boshlovchi qism (Walking…) kimni tavsiflaydi? Dilnoza — ega bo‘lishi kerak.'),
        ch('She enjoys hiking, swimming and ___.', ['to cycle', 'cycling', 'cycled', 'to be cycling'], 1, 'Parallellik: hiking, swimming, cycling (hammasi -ing).'),
        ch('The nurse ___ helped me was very kind.', ['which', 'who', 'whom', 'whose'], 1, 'Odam (ega) — who.'),
        gap('Pronoun: “The students finished ___ projects.” (their / its)', ['their'], 'Students — ko‘plik: their.'),
        multi('Choose ALL the sentences with parallel structure.', ['He likes to read, to write and to paint.', 'He likes reading, writing and painting.', 'He likes reading, to write and painting.', 'The plan is cheap, quick and it is safe.', 'The plan is cheap, quick and safe.'], [0, 1, 4], 'Parallel: hammasi to + fe’l, hammasi -ing, hammasi sifat. Xato: aralash shakllar.'),
      ],
      check: [
        ch('Dilnoza and Madina presented ___ research at the conference.', ['their', 'her', 'its', 'his'], 0, 'Ikki kishi (ko‘plik) — their.'),
        ch('Having finished the exam, ___.', ['the room was quiet', 'Aziz handed in his paper', 'the teacher collected papers', 'a bell rang'], 1, 'Having finished — Aziz ga tegishli: ega Aziz bo‘lishi kerak.'),
        ch('The climate of Tashkent is milder than ___ of Moscow.', ['it', 'those', 'that', 'which'], 2, 'Climate bilan climate solishtiriladi: that of Moscow.'),
        ch('The woman ___ I met at the conference is a physicist.', ['who', 'whom', 'whose', 'which'], 1, 'I met — to‘ldiruvchi: whom (norasmiy who ham ishlatiladi, SAT da whom).'),
        gap('Complete with who or which: “The book ___ I borrowed was overdue.”', ['which', 'that'], 'Narsa uchun which / that.'),
        multi('Choose ALL the sentences with a clear pronoun.', ['The mayor thanked the volunteers, and she praised their work.', 'When Aziz met Karim, he was late.', 'The company changed its policy.', 'They say it will rain tomorrow.', 'Dilnoza told Madina that Dilnoza’s bag was ready.'], [0, 2], 'Aniq: mayor — she (bitta ayol); company — its. Noaniq: he (kim?), they (kim?).'),
      ],
    },
  ],
};
