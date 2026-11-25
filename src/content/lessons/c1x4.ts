import type { Item, Unit } from './types';
import { ch, gap, ord } from './helpers';

/** "Barcha to‘g‘ri gaplarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// C1 to‘ldirish (4): aniqlik — artikl, tinish belgilari va xatolarni tuzatish. Original kontent (Sellzen), status 'pilot'.
export const C1_U20: Unit = {
  id: 'c1-u20', level: 'C1', title: 'Accuracy: articles, punctuation and error correction', titleUz: 'Aniqlik: artikl, tinish belgilari va xatolarni tuzatish',
  situationUz: 'Murakkab holatlarda artiklni to‘g‘ri tanlaysiz, tinish belgilarini ishlatasiz va matndagi tipik xatolarni topib tuzatasiz.',
  status: 'pilot',
  lessons: [
    {
      id: 'c1-u20-l1', title: 'Articles in complex contexts', titleUz: 'Murakkab holatlarda artikllar',
      objectiveUz: 'Umumlashtirishda, mavhum otlar, o‘ziga xos nomlar va ijtimoiy muassasalar bilan a / an / the / artiklsiz variantlarni to‘g‘ri tanlaysiz.',
      objective: 'You choose a / an / the / zero article correctly with generalisations, abstract nouns, proper names and institutions.',
      taxonomyIds: ['G.article', 'V.collocation'], minutes: 10,
      explanationUz: [
        'Umumlashtirish: ko‘plik yoki sanalmaydigan ot artiklsiz — “Dogs are loyal.” “Honesty matters.” Sanaladigan birlikda the umumiy turni bildiradi (rasmiy): “The tiger is endangered.” a / an sinf yoki kasbni bildiradi: “She is an engineer.” “What a surprise!” “such a mess”. Mavhum ot aniq holatda the oladi: “the honesty of the staff”.',
        'The bilan: yagona narsa (the sun), superlativ va ordinal (the best, the second), daryo, okean, tizma, mamlakat nomi ko‘plikda (the Thames, the Alps, the Netherlands, the USA). Artiklsiz: shahar, ko‘cha, tog‘ cho‘qqisi (Mount Everest), ko‘pchilik mamlakatlar, tillar, fanlar, ovqat nomlari. Muassasa: “in hospital” (bemor), “in the hospital” (ziyoratchi); “go to school” (o‘qish), “go to the school” (bino).',
        'Guruhlar: the + sifat — “the rich”, “the elderly”. Miqdor: “a few” (bor) — “few” (deyarli yo‘q); “a little” — “little”. Xatolar: “the life is hard” (umumiy ma’noda artiklsiz: “life is hard”), “an university” (a university), “in the future” (umuman kelajak — in the future; “in future” — bundan buyon). Ikkilansangiz: umumiy mi yoki aniq mi? — shuni so‘rang.',
      ],
      table: [
        { form: 'umumiy: ko‘plik yoki sanalmaydigan — artiklsiz', example: 'Honesty matters.' },
        { form: 'the: yagona, superlativ, daryo / tizma / ko‘plik nomi', example: 'the Thames, the best' },
        { form: 'muassasa: in hospital / in the hospital', example: 'She is in hospital.' },
      ],
      examples: [
        { en: 'Dogs are loyal, but the tiger is an endangered species.', uz: 'Itlar sodiq, lekin yo‘lbars — yo‘qolib borayotgan tur.' },
        { en: 'She is an engineer, and she works near the Thames.', uz: 'U muhandis va Temza daryosi yaqinida ishlaydi.' },
        { en: 'My father is in hospital, and I visited him in the hospital yesterday.', uz: 'Otam kasalxonada yotibdi va kecha uni kasalxonada ko‘rdim.' },
        { en: 'The rich should pay more tax, and the elderly need better care.', uz: 'Boylar ko‘proq soliq to‘lashi kerak, keksalarga esa yaxshiroq g‘amxo‘rlik zarur.' },
      ],
      vocab: [{ en: 'loyal', uz: 'sodiq' }, { en: 'species', uz: 'tur' }, { en: 'elderly', uz: 'keksa' }, { en: 'honesty', uz: 'halollik' }],
      practice: [
        ch('___ matters in every friendship.', ['Honesty', 'The honesty', 'An honesty'], 0, 'umumiy mavhum ot.'),
        ch('She works near ___ Thames.', ['the', 'a', '(no article)'], 0, 'daryo nomi: the.'),
        ch('He is ___ university student.', ['a', 'an', 'the'], 0, 'a university: undosh tovush.'),
        gap('My father is in ___ ; he had an operation. (hospital)', ['hospital'], 'bemor: artiklsiz.'),
        gap('___ elderly need better care. (The)', ['The'], 'the + sifat.'),
        ord(['the', 'tiger', 'is', 'an', 'endangered', 'species'], 'The tiger is an endangered species', 'umumiy tur.'),
      ],
      check: [
        ch('Which sentence is correct?', ['Life is hard sometimes.', 'The life is hard sometimes.', 'A life is hard sometimes.'], 0, 'umumiy ma’no.'),
        ch('Which phrase means “from now on”?', ['in future', 'in the future', 'in a future'], 0, 'in future.'),
        ch('Which sentence is correct?', ['We climbed Mount Everest.', 'We climbed the Mount Everest.', 'We climbed an Mount Everest.'], 0, 'tog‘ cho‘qqisi: artiklsiz.'),
        gap('He is ___ honest man. (an)', ['an'], 'an + unli tovush.'),
        gap('She has ___ few friends here, so she feels lonely. (very)', ['very'], 'few — deyarli yo‘q.'),
        multi('Choose ALL the correct sentences.', ['She is an engineer.', 'She is engineer.', 'We visited the Alps.', 'We visited Alps.', 'What a surprise!'], [0, 2, 4], 'artikl.'),
      ],
      writing: {
        promptUz: 'Shahringiz haqida 6–7 gap yozing va artikllarni ongli ishlating: a / an, the (daryo, noyob joy), artiklsiz umumiy ot va muassasa (in hospital, at school). Kamida 4 ta artikl holatini ko‘rsating.', minWords: 55,
        require: [{ re: String.raw`\b(a|an) \w+`, labelUz: 'a / an bor' }, { re: String.raw`\bthe (river|city|centre|center|mountains|best|oldest|largest|biggest|university|market|park)\b`, labelUz: 'the bor' }, { re: String.raw`\b(at school|in hospital|at university|go to school|go to work|in prison|at home)\b`, labelUz: 'muassasa artiklsiz bor' }],
        model: 'I live in a small city near the mountains. The river that crosses the centre is the longest in the region, and an old bridge connects the two parts of the town. Education matters here, so most children go to school until the age of seventeen. My sister works as a nurse and is in hospital most days. Life is quiet, but the people are friendly, and the market is the best place to meet them.',
      },
    },
    {
      id: 'c1-u20-l2', title: 'Punctuation that changes meaning', titleUz: 'Ma’noni o‘zgartiradigan tinish belgilari',
      objectiveUz: 'Vergul, nuqtali vergul, ikki nuqta, tire va apostrofni to‘g‘ri ishlatasiz va comma splice kabi xatolardan qochasiz; belgi ma’noni qanday o‘zgartirishini bilasiz.',
      objective: 'You use commas, semicolons, colons, dashes and apostrophes correctly, avoid errors such as the comma splice and know how punctuation changes meaning.',
      taxonomyIds: ['W.sentence_variety', 'V.spelling'], minutes: 10,
      explanationUz: [
        'Vergul: kirish iboralardan keyin (“However, …”, “In my view, …”), ro‘yxatda, qo‘shimcha ma’lumotli nisbiy gapni ajratishda (“My brother, who lives in Paris, is a chef.” — bitta aka). Ajratuvchi ma’lumot — vergulsiz: “My brother who lives in Paris is a chef” (bir necha aka). Ega bilan fe’l orasiga vergul qo‘yilmaydi.',
        'Nuqtali vergul (;) ikkita bog‘liq mustaqil gapni bog‘laydi: “He was tired; nevertheless, he continued.” Ikki nuqta (:) tushuntirish yoki ro‘yxat oldidan: “She had one aim: to win.” Tire (—) kutilmagan qo‘shimcha yoki urg‘u: “The result — to everyone’s surprise — was a draw.” Comma splice (ikki gapni faqat vergul bilan bog‘lash) xato: “It was late, we left” → “It was late, so we left.”',
        'Apostrof: egalik (the manager’s office, the students’ rooms) va qisqartma (it’s = it is). its — egalik, it’s — it is / it has. Ko‘plik uchun apostrof ishlatilmaydi: “CDs”, “the 1990s”. Qo‘shtirnoq: iqtibos va nom. Ma’no farqi: “Let’s eat, Grandma!” — “Let’s eat Grandma!”. Yozgach hamma gapni ovoz chiqarib o‘qing — pauzalar vergulni ko‘rsatadi.',
      ],
      table: [
        { form: 'qo‘shimcha ma’lumot: vergul bilan; aniqlovchi: vergulsiz', example: 'My brother, who lives in Paris, is a chef.' },
        { form: '; — ikki bog‘liq gap; : — tushuntirish', example: 'He was tired; nevertheless, he continued.' },
        { form: 'its — egalik; it’s — it is', example: 'The cat licked its paw.' },
      ],
      examples: [
        { en: 'My brother, who lives in Paris, is a chef, but my cousin who lives in Rome is a teacher.', uz: 'Parijda yashaydigan akam oshpaz, lekin Rimda yashaydigan amakivachcham o‘qituvchi.' },
        { en: 'He was tired; nevertheless, he continued working.', uz: 'U charchagan edi; shunga qaramay, ishlashni davom ettirdi.' },
        { en: 'She had only one aim: to win the championship.', uz: 'Uning faqat bitta maqsadi bor edi: chempionlikni qo‘lga kiritish.' },
        { en: 'The cat licked its paw, and it’s clear that it’s hungry.', uz: 'Mushuk panjasini yaladi va uning och ekani ma’lum.' },
      ],
      vocab: [{ en: 'comma', uz: 'vergul' }, { en: 'semicolon', uz: 'nuqtali vergul' }, { en: 'apostrophe', uz: 'apostrof' }, { en: 'championship', uz: 'chempionat' }],
      practice: [
        ch('Which sentence has a comma splice?', ['It was late, we left.', 'It was late, so we left.', 'It was late; we left.'], 0, 'ikki gap faqat vergul bilan.'),
        ch('Choose the correct form: The cat licked ___ paw.', ['its', 'it’s', 'its’'], 0, 'egalik: its.'),
        ch('Which punctuation introduces an explanation?', ['a colon', 'a comma', 'a hyphen'], 0, 'ikki nuqta.'),
        ch('Which mark fits? He was tired ___ nevertheless, he continued.', [';', ':', '’'], 0, 'nuqtali vergul.'),
        ch('Which mark fits? She had one aim ___ to win.', [':', ';', '’'], 0, 'ikki nuqta.'),
        ord(['the', 'students’', 'rooms', 'are', 'on', 'the', 'second', 'floor'], 'The students’ rooms are on the second floor', 'ko‘plikdagi egalik.'),
      ],
      check: [
        ch('“My brother, who lives in Paris, is a chef.” means…', ['I have one brother.', 'I have several brothers.', 'I have no brother.'], 0, 'vergul bilan: bitta aka.'),
        ch('Which is correct?', ['It’s clear that the team lost its way.', 'Its clear that the team lost it’s way.', 'It’s clear that the team lost it’s way.'], 0, 'its / it’s.'),
        ch('Which uses a dash correctly?', ['The result — to everyone’s surprise — was a draw.', 'The result, — was a draw.', 'The — result was a draw.'], 0, 'tire.'),
        ch('Which sentence is correct?', ['However, the plan failed.', 'However the plan failed.', 'However; the plan failed.'], 0, 'kirish iborasidan keyin vergul.'),
        ch('Which is correct?', ['the 1990s', 'the 1990’s', 'the 1990s’'], 0, 'apostrofsiz ko‘plik.'),
        multi('Choose ALL the correct sentences.', ['She was late; however, she was calm.', 'She was late, however she was calm.', 'The manager’s office is open.', 'The managers office is open.', 'He had a goal: to win.'], [0, 2, 4], 'tinish belgilari.'),
      ],
      writing: {
        promptUz: 'Quyidagi mavzuda 6–7 gap yozing: “My city in one paragraph”. Kamida 1 ta nuqtali vergul, 1 ta ikki nuqta, 1 ta egalik apostrofi va qo‘shimcha ma’lumotli vergulli nisbiy gap ishlating.', minWords: 55,
        require: [{ re: String.raw`;`, labelUz: 'nuqtali vergul bor' }, { re: String.raw`:`, labelUz: 'ikki nuqta bor' }, { re: String.raw`\b\w+['’]s\b`, labelUz: 'apostrof bor' }, { re: String.raw`, (who|which) [^,]+,`, labelUz: 'vergulli nisbiy gap bor' }],
        model: 'My city has one main attraction: its old market. The market, which dates from the fifteenth century, is open every day; however, it is busiest on Sundays. My uncle, who sells carpets there, says it’s the heart of the city. The town’s cafés serve excellent tea, and the visitors’ comments are always positive. Nevertheless, there is one problem: traffic.',
      },
    },
    {
      id: 'c1-u20-l3', title: 'Error correction: spotting typical C1 mistakes', titleUz: 'Xatolarni tuzatish: C1 darajasidagi tipik xatolar',
      objectiveUz: 'Matnda tipik xatolarni (kelishuv, zamon, predlog, parallellik, ortiqcha so‘z, so‘z tartibi) topasiz va to‘g‘rilaysiz; o‘z yozuvingizni tizimli tekshirasiz.',
      objective: 'You find and correct typical mistakes in a text (agreement, tense, prepositions, parallelism, redundancy, word order) and check your own writing systematically.',
      taxonomyIds: ['G.sva', 'G.word_order'], minutes: 10,
      explanationUz: [
        'Tipik xatolar: 1) Kelishuv: “The number of students are growing” → “is”; “a number of students are” (ko‘plik); “The news is” (sanalmaydi). 2) Zamon izchilligi: “When I arrived, she already left” → “had already left”. 3) Predlog: “depend of / discuss about / explain me” → “depend on / discuss / explain to me”.',
        'Parallellik: “She likes swimming, to run and cycling” → “swimming, running and cycling”. Ortiqcha so‘z: “return back”, “free gift”, “future plans” → “return”, “gift”, “plans”. So‘z tartibi: indirect questions “Could you tell me where is the station?” → “where the station is”. Dangling modifier: “Walking home, the rain started” → “Walking home, I got wet”.',
        'Tizimli tekshirish: gapni bir marta bir xil xato turi uchun o‘qing: kelishuv → zamon → predlog → artikl → tinish belgilari → imlo. Eng ko‘p xato qiladigan 5 turingizni daftarga yozing. Yozgach yuqoridan emas, oxirgi gapdan boshlab o‘qing — imlo xatolarini ko‘proq payqaysiz. Qoida: bitta tuzatish yangi xatoga olib kelmasin.',
      ],
      table: [
        { form: 'kelishuv: the number of … is / a number of … are', example: 'The number of students is growing.' },
        { form: 'parallellik: swimming, running and cycling', example: 'She likes swimming, running and cycling.' },
        { form: 'so‘roq o‘zlashtirma: where the station is', example: 'Could you tell me where the station is?' },
      ],
      examples: [
        { en: 'The number of students is growing, and a number of them are studying abroad.', uz: 'Talabalar soni oshmoqda va ularning bir qismi chet elda o‘qimoqda.' },
        { en: 'She likes swimming, running and cycling at weekends.', uz: 'U dam olish kunlari suzish, yugurish va velosiped haydashni yaxshi ko‘radi.' },
        { en: 'Could you tell me where the station is?', uz: 'Vokzal qayerdaligini ayta olasizmi?' },
        { en: 'Walking home, I got wet in the rain.', uz: 'Uyga piyoda ketayotib, yomg‘irda ho‘l bo‘ldim.' },
      ],
      vocab: [{ en: 'proofread', uz: 'tekshirib o‘qimoq' }, { en: 'agreement', uz: 'kelishuv' }, { en: 'redundant', uz: 'ortiqcha' }, { en: 'parallel', uz: 'parallel' }],
      practice: [
        ch('Which sentence is correct?', ['The number of students is growing.', 'The number of students are growing.', 'The numbers of students is growing.'], 0, 'number of — birlik.'),
        ch('Which sentence is correct?', ['She likes swimming, running and cycling.', 'She likes swimming, to run and cycling.', 'She likes to swim, running and cycle.'], 0, 'parallellik.'),
        ch('Which is correct?', ['Could you tell me where the station is?', 'Could you tell me where is the station?', 'Could you tell me where the station it is?'], 0, 'darak tartib.'),
        gap('We discussed the plan ___ the manager for hours. (with)', ['with'], 'discuss sth with sb.'),
        gap('When I arrived, she had already ___ . (leave)', ['left'], 'oldin: had left.'),
        ord(['walking', 'home', 'i', 'got', 'wet', 'in', 'the', 'rain'], 'Walking home I got wet in the rain', 'ega mos.'),
      ],
      check: [
        ch('Which phrase is redundant?', ['return back', 'return', 'come back'], 0, 'ortiqcha so‘z.'),
        ch('Choose the correct phrase.', ['depend on', 'depend of', 'depend at'], 0, 'predlog.'),
        ch('The best proofreading strategy is…', ['check one error type at a time', 'read once quickly', 'ignore small mistakes'], 0, 'tizimli tekshirish.'),
        gap('A number of students ___ studying abroad. (are)', ['are'], 'a number of — ko‘plik.'),
        gap('She explained the problem ___ me. (to)', ['to'], 'explain to sb.'),
        multi('Choose ALL the correct sentences.', ['The news is good.', 'The news are good.', 'She discussed the plan with us.', 'She discussed about the plan with us.', 'He returned the book.'], [0, 2, 4], 'to‘g‘ri shakl.'),
      ],
      writing: {
        promptUz: 'Quyidagi xatoli matnni to‘g‘rilab, 5–6 gap qilib qayta yozing: “The number of student are growing and many of them discuss about the problem. When I arrived, she already left. She like swimming, to run and cycling.” Tuzatilgan matn va 2 ta tuzatish sababini ham yozing.', minWords: 50,
        require: [{ re: String.raw`\bthe number of students? is\b`, labelUz: 'number of … is tuzatilgan' }, { re: String.raw`\bhad already left\b`, labelUz: 'had already left tuzatilgan' }, { re: String.raw`\b(swimming|swims|to swim),? (running|runs|to run) and (cycling|cycles|to cycle)\b`, labelUz: 'parallellik tuzatilgan' }],
        model: 'The number of students is growing, and many of them discuss the problem. When I arrived, she had already left. She likes swimming, running and cycling. I corrected the subject–verb agreement because the number of takes a singular verb. I also removed the unnecessary preposition after discuss, since the verb does not need one, and I used had already left for the earlier action.',
      },
    },
  ],
};
