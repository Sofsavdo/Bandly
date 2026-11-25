import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

export const SAT_RW_INFO: Unit = {
  id: 'sat-rw4', level: 'B2', title: 'SAT R&W: Information and Ideas', titleUz: 'SAT Reading & Writing: ma’lumot va g‘oyalar',
  situationUz: 'Matnning asosiy fikri, aniq ma’lumotlar, da’voni qo‘llab-quvvatlovchi dalil (matn va grafik) va mantiqiy xulosa.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-rw4-l1', title: 'Central ideas and details', titleUz: 'Asosiy fikr va aniq ma’lumotlar',
      objectiveUz: 'Qisqa parchaning asosiy fikrini aniqlaysiz va aniq ma’lumot savoliga matn bo‘yicha javob topasiz; ortiqcha tor yoki keng variantlarni rad etasiz.',
      objective: 'Find the central idea of a short passage and locate specific details; reject options that are too narrow or too broad.',
      taxonomyIds: ['R.main_idea', 'R.detail'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Central idea (asosiy fikr) — butun parchani qamrab oladigan fikr; detail — aniq ma’lumot. Parchani o‘qiyotib har bir gapdan keyin “bu qanday vazifa bajaradi: umumiy fikrmi, misolmi, sababmi?” deb so‘rang. Asosiy fikr ko‘pincha birinchi yoki oxirgi gapda, yoki but / however dan keyin keladi.',
        'Main idea variantlari uch tuzoqqa bo‘linadi: (1) juda TOR — faqat bitta misolni aytadi; (2) juda KENG — parcha aytmagan umumlashtirish; (3) NOTO‘G‘RI — matnga zid yoki ma’nosi o‘zgargan. To‘g‘ri variant — parchaning HAMMA muhim qismini qamrab olgan, ortiqcha da’vo qilmagan javob.',
        'Detail savollarida javob matnda ANIQ yozilgan: variant matn bilan so‘zma-so‘z emas, ma’no bo‘yicha (paraphrase) mos keladi. Usul: savoldagi kalit so‘zni toping → matndagi o‘sha joyni o‘qing → variantlarni shu joy bilan solishtiring. O‘z bilimingizga tayanmang: “According to the text…” — faqat matn.',
        'Qo‘shimcha: raqam, sana va nom detail savollarida aniq tekshiriladi; “most nearly” kabi so‘zlar darajani bildiradi. Agar ikki variant ham to‘g‘ri tuyulsa, qaysi biri savolga to‘g‘ridan to‘g‘ri javob berayotganini (va matnda ham aniq turganini) tanlang.',
      ],
      table: [
        { form: 'juda tor = faqat bitta misol', example: 'Wrong: “Aziz measured sap.”' },
        { form: 'juda keng = parcha aytmagan', example: 'Wrong: “Trees are important.”' },
        { form: 'to‘g‘ri = hamma qismni qamrab oladi', example: 'Right: “Sap flow reveals how trees respond to drought.”' },
      ],
      examples: [
        { en: 'Passage: Dr. Rahimova measured the sap flow in 40 oak trees during a dry summer. Trees near the river kept normal flow, while trees on dry hills slowed theirs by half. She concludes that sap flow is a sensitive indicator of drought stress. Central idea: sap flow signals drought stress.', uz: 'Asosiy fikr — xulosa gapi: sap flow — qurg‘oqchilik ko‘rsatkichi.' },
        { en: 'Detail question: “According to the text, how much did trees on dry hills slow their sap flow?” Answer: by half.', uz: 'Aniq ma’lumot matnda: “by half”.' },
        { en: 'A trap option: “Rivers are important to oak trees.” (true in general but not the central idea)', uz: 'Juda keng/mavzudan chetga chiqqan: tuzoq.' },
        { en: 'A trap option: “Dr. Rahimova measured 40 trees.” (a detail, not the main idea)', uz: 'Juda tor: bu faqat detal.' },
      ],
      vocab: [{ en: 'indicator', uz: 'ko‘rsatkich' }, { en: 'central', uz: 'markaziy, asosiy' }, { en: 'detail', uz: 'tafsilot, aniq ma’lumot' }, { en: 'paraphrase', uz: 'boshqacha ifodalash' }],
      practice: [
        ch('Many commuters assume electric scooters are faster than buses. A 2022 study of 300 city trips, however, found that scooters were faster only for trips under two kilometers. Over longer distances, buses were equally fast or faster. Which choice best states the main idea?', ['Scooters are always slower than buses.', 'Scooters beat buses only on short trips.', 'Commuters prefer buses to scooters.', 'The study covered 300 trips.'], 1, '“However” dan keyin asosiy xulosa: scooters faqat qisqa yo‘lda tezroq.'),
        ch('Which kind of option is usually wrong for a main-idea question?', ['One that covers the whole passage', 'One that only describes a single example', 'One that paraphrases the conclusion', 'One that matches the passage’s purpose'], 1, 'Bitta misolni aytadigan variant juda tor.'),
        ch('“The festival lasts three days, and over 20,000 visitors attended last year.” According to the text, how many people attended last year?', ['3', '20,000', 'more than 20,000', 'fewer than 20,000'], 2, '“over 20,000” = 20,000 dan ko‘p: more than 20,000.'),
        ch('A passage says that honeybees communicate the location of food through a dance. Which main idea is TOO BROAD?', ['Honeybees use dance to share food locations.', 'Animals communicate in many ways.', 'Bees dance to show direction.', 'A bee’s dance shows distance to food.'], 1, '“Animals communicate in many ways” — parcha bunday keng da’vo qilmaydi.'),
        gap('A passage’s overall main point is its ___ idea. (one word)', ['central', 'main'], 'Central / main idea.'),
        multi('Choose ALL good strategies for detail questions.', ['Find the key word from the question in the text.', 'Use outside knowledge first.', 'Match the meaning, not only the words.', 'Check numbers and names carefully.', 'Choose the most general option.'], [0, 2, 3], 'Kalit so‘z, ma’noni solishtirish, raqam va nomlarni tekshirish.'),
      ],
      check: [
        ch('The city’s tram network was built in 1912 to serve factories. By the 1950s, however, most workers lived in the suburbs, and ridership fell. The system closed in 1968. What is the central idea?', ['Trams are old.', 'The tram system declined as city life changed.', 'Factories built trams.', 'The system closed in 1968.'], 1, 'Butun parcha: tizim shahar hayoti o‘zgargani sari susaydi.'),
        ch('“The river is 480 kilometers long and flows through three provinces.” According to the text, the river', ['flows through two provinces', 'is 480 km long', 'is shorter than 400 km', 'starts in the sea'], 1, 'Aniq ma’lumot: 480 km.'),
        ch('Which main-idea option is too narrow?', ['The experiment tested one plant only.', 'The experiment tested how plants respond to light.', 'Plants need light.', 'The study improved understanding of plant growth.'], 0, 'Faqat bitta o‘simlik — tor (boshqalar umumiyroq/to‘liqroq).'),
        ch('Which words in a passage often signal the author’s main point?', ['for example', 'however / therefore', 'such as', 'in addition'], 1, 'Zid fikr va xulosa so‘zlari: however / therefore.'),
        gap('A statement of the same idea in different words is a ___ . (one word)', ['paraphrase'], 'Paraphrase.'),
        multi('Choose ALL the options that are traps for main-idea questions.', ['Too narrow', 'Too broad', 'Contradicts the text', 'Covers the whole passage', 'Uses outside facts'], [0, 1, 2, 4], 'Tor, keng, zid va matndan tashqari — tuzoqlar. Hamma qismni qamrovchi — to‘g‘ri.'),
      ],
    },
    {
      id: 'sat-rw4-l2', title: 'Command of evidence: text and data', titleUz: 'Dalil bilan ishlash: matn va grafik/jadval',
      objectiveUz: 'Da’voni eng yaxshi qo‘llab-quvvatlovchi (yoki zaiflashtiruvchi) dalilni tanlaysiz va jadval yoki grafikdagi ma’lumotdan to‘g‘ri foydalanasiz.',
      objective: 'Choose the evidence that best supports or weakens a claim and use data from a table or graph accurately.',
      taxonomyIds: ['R.detail', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Textual evidence savoli da’vo (claim) beradi va qaysi dalil uni eng yaxshi qo‘llab-quvvatlashi (yoki zaiflashtirishi) so‘raladi. Tartib: (1) da’voni aniq gapirib bering va kalit iboralarini belgilang; (2) har bir variant da’voning ASOSIY qismiga bevosita dalil berayotganini tekshiring; (3) shunchaki mavzudosh yoki qisman mos variantni rad eting.',
        'Qo‘llab-quvvatlash va zaiflashtirish: supports — da’voni kuchaytiruvchi dalil; weakens — unga zid yoki unga muqobil tushuntirish beruvchi dalil. Ekstremal da’vo (all, always, never, proves) uchun dalil ham to‘liq bo‘lishi kerak; “some”, “often” kabi yumshoq da’voga bitta dalil yetadi.',
        'Quantitative evidence (jadval va grafik): avval sarlavha, o‘qlar, birliklar va legendani o‘qing. Savol “Which choice most effectively uses data from the graph to…” bo‘lsa, da’voga mos AYNAN SHU kategoriya va yil/qiymatni oling; taqqoslash so‘zlari (more than, half, twice, decreased) ni raqamlar bilan tekshiring. Tuzoq: raqam grafikda bor, lekin boshqa kategoriyaga tegishli.',
        'Hisob: ikki qiymat o‘rtasidagi o‘zgarish foizi = (yangi − eski) / eski × 100. “Twice as many” = 2 baravar; “half” = 50%. Qiymatlarni solishtirishdan oldin birliklar (kg / ton, % / son) bir xilligini tekshiring.',
      ],
      table: [
        { form: 'supports: da’voga to‘g‘ridan to‘g‘ri dalil', example: 'Claim: A helps B. Evidence: when A rose, B rose.' },
        { form: 'weakens: zid dalil yoki muqobil izoh', example: 'Evidence: B rose without A.' },
        { form: 'grafik: sarlavha → o‘qlar → birlik → qiymat', example: 'Check the category and the year.' },
      ],
      examples: [
        { en: 'Claim: Bike lanes increase commuter cycling. Best evidence: After two new lanes opened, daily bike trips on the street rose from 800 to 1,400.', uz: 'Da’voga to‘g‘ridan to‘g‘ri dalil: yo‘lak ochilgach velosiped soni oshdi.' },
        { en: 'Weakening evidence: Cycling rose just as much on streets that got no new lanes.', uz: 'Zaiflashtiradi: yo‘lak bo‘lmagan joyda ham o‘sdi — muqobil sabab.' },
        { en: 'Graph use: In 2020, 62% of firms sold online; in 2021, 71%. The increase was 9 percentage points.', uz: 'Foiz punkti: 71 − 62 = 9. (Foiz o‘zgarishi: 9/62 ≈ 14,5%.)' },
        { en: 'Trap: choosing a number from the wrong year or category.', uz: 'Raqam bor, lekin da’voga tegishli emas.' },
      ],
      vocab: [{ en: 'evidence', uz: 'dalil' }, { en: 'weaken', uz: 'zaiflashtirmoq' }, { en: 'strengthen', uz: 'kuchaytirmoq' }, { en: 'hypothesis', uz: 'gipoteza' }],
      practice: [
        ch('Claim: Reading aloud improves children’s vocabulary. Which finding most directly supports the claim?', ['Children who read aloud daily learned more new words than a matched group who did not.', 'Many children enjoy reading.', 'Libraries have more picture books than before.', 'Teachers prefer quiet classrooms.'], 0, 'Aynan da’voga dalil: ovoz chiqarib o‘qigan guruh ko‘proq so‘z o‘rgangan (nazorat guruhi bilan).'),
        ch('Claim: The new filter removes more microplastics than the old one. Which finding would WEAKEN the claim?', ['The new filter was tested on 20 samples.', 'The old filter removed the same amount in the same tests.', 'The new filter costs more.', 'Microplastics are very small.'], 1, 'Eskisi ham bir xil miqdorni olib tashlagan: da’voga zid.'),
        ch('A graph shows museum visitors: 2019 — 40,000; 2020 — 10,000; 2021 — 25,000. Which claim is supported?', ['Visitors rose every year.', 'Visitors fell in 2020 and partly recovered in 2021.', 'Visitors were highest in 2020.', 'Visitors doubled between 2019 and 2020.'], 1, '40k → 10k → 25k: pasayib, qisman tiklangan.'),
        gap('Sales rose from 80 to 100. The percent increase is ___ %. (number only)', ['25', '25.0'], '(100 − 80) / 80 = 20/80 = 25%.'),
        ch('Which claim needs the STRONGEST evidence?', ['Some students prefer morning classes.', 'Often, students prefer morning classes.', 'Every student prefers morning classes.', 'A few students prefer morning classes.'], 2, '“Every” — ekstremal da’vo: to‘liq dalil kerak.'),
        multi('Choose ALL good steps for evidence questions.', ['Restate the claim in your own words.', 'Check that the evidence addresses the main part of the claim.', 'Choose the option that merely shares a topic.', 'Check the graph’s title and units.', 'Compare the right category and year.'], [0, 1, 3, 4], 'Da’vo, dalil, grafik sarlavhasi/birlik va to‘g‘ri kategoriya. Faqat mavzudosh variant — tuzoq.'),
      ],
      check: [
        ch('Claim: Daily walking lowers blood pressure. Best evidence?', ['Participants who walked 30 minutes a day for 12 weeks had lower blood pressure than those who did not.', 'Many people like walking.', 'Walking shoes have improved.', 'Parks are open all year.'], 0, 'To‘g‘ridan to‘g‘ri dalil: yurgan guruhda bosim past.'),
        ch('A table: Plant A grew 12 cm, Plant B grew 18 cm, Plant C grew 6 cm. Which claim is supported?', ['Plant B grew the most.', 'Plant C grew the most.', 'All plants grew equally.', 'Plant A grew twice as much as Plant B.'], 0, 'Eng ko‘p o‘sgan — B (18 sm).'),
        ch('Claim: The drug reduces headaches. Which finding WEAKENS it?', ['Patients on a placebo reported the same reduction.', 'Patients felt better.', 'The drug is available in tablets.', 'The trial lasted four weeks.'], 0, 'Placebo guruhida ham shunday: dori ta’siri isbotlanmaydi.'),
        gap('A rise from 40 to 50 percent is a ___ percentage-point increase. (number only)', ['10', '10.0'], '50 − 40 = 10 foiz punkti.'),
        ch('Which phrase is a HEDGE (softens a claim)?', ['always', 'never', 'often', 'proves'], 2, 'Often — yumshoq: kuchsizroq dalil yetadi.'),
        multi('Choose ALL options that are traps in evidence questions.', ['Right number, wrong category', 'Topic-related but not on point', 'Directly tests the claim', 'Right category and year', 'Extreme wording'], [0, 1, 4], 'Tuzoqlar: boshqa kategoriya, faqat mavzudosh, ekstremal so‘zlar.'),
      ],
    },
    {
      id: 'sat-rw4-l3', title: 'Inferences: what logically follows', titleUz: 'Xulosa chiqarish: parchadan nima mantiqan kelib chiqadi',
      objectiveUz: '“Which choice most logically completes the text?” savollariga parchadagi dalillardan keyingi eng mantiqiy xulosa bilan javob berasiz.',
      objective: 'Answer “most logically completes the text” questions with the conclusion best supported by the evidence.',
      taxonomyIds: ['R.inference', 'R.main_idea'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Inference savolida parchaning oxirgi gapi bo‘sh va unga eng mantiqiy davomni tanlaysiz. Matn aytmagan, lekin dalillardan kelib chiqadigan fikr izlanadi. Qoida: javob parchadagi ma’lumotlardan BIR mantiqiy qadam — ortiqcha taxmin emas.',
        'Usul: (1) parchaning asosiy da’vosini va dalillarini ayting; (2) bo‘sh joyga o‘zingiz xulosa yozing; (3) o‘shaga eng yaqin variantni tanlang. Tuzoqlar: haddan tashqari qat’iy (proves, always), parchada yo‘q yangi fakt, mavzudan chetga chiqish, parchadagi ma’lumotga zid fikr.',
        'Ishoralar: “therefore”, “this suggests”, “if … then” — oldingi dalil bilan xulosa. SAT javobi “must be true” emas, “most logically follows” — matn bilan eng yaxshi mos keladigan. Yumshoq (may, suggests, likely) so‘zlar qat’iy (proves, definitely) so‘zlarga qaraganda xavfsizroq.',
      ],
      table: [
        { form: 'dalil → bir mantiqiy qadam', example: 'Many bees gone + fewer fruits → pollinators matter.' },
        { form: 'yumshoq so‘zlar yaxshiroq', example: 'suggests, may, likely' },
        { form: 'tuzoq: ekstremal / yangi fakt', example: 'proves, always, never' },
      ],
      examples: [
        { en: 'Orchards near wild meadows produced 30% more fruit than orchards far from them. Researchers think meadows host more pollinators. This suggests that ___ — Answer: preserving meadows near orchards may increase fruit yields.', uz: 'Dalildan keyingi mantiqiy qadam: o‘tloqlarni saqlash hosilni oshirishi mumkin.' },
        { en: 'Trap: “Meadows prove that pollination is the only factor in fruit yield.”', uz: 'Ekstremal: “prove”, “only”.' },
        { en: 'Trap: “Orchards should be destroyed.”', uz: 'Parchada asos yo‘q.' },
        { en: 'Safe pattern: evidence + “may” + direct implication.', uz: 'Xavfsiz shakl: dalil → ehtimoliy oqibat.' },
      ],
      vocab: [{ en: 'infer', uz: 'xulosa chiqarmoq' }, { en: 'imply', uz: 'ishora qilmoq, nazarda tutmoq' }, { en: 'logically', uz: 'mantiqan' }, { en: 'conclusion', uz: 'xulosa' }],
      practice: [
        ch('Cities with more street trees tend to be 2–3°C cooler in summer. Trees shade pavement and release water vapor. Therefore, a city that wants to lower summer temperatures could ___', ['plant more street trees.', 'remove all pavement.', 'stop using water.', 'ban summer.'], 0, 'Dalildan to‘g‘ridan to‘g‘ri xulosa: ko‘proq daraxt ekish.'),
        ch('A bakery’s sales rose each week after it began offering free samples. Which conclusion is best supported?', ['Free samples may have contributed to higher sales.', 'Free samples prove that no other factor matters.', 'The bakery should close.', 'Samples are expensive.'], 0, 'Yumshoq, dalilga mos xulosa: may have contributed.'),
        ch('Which wording makes an inference option risky?', ['may', 'suggests', 'proves', 'likely'], 2, '“proves” — ekstremal.'),
        gap('A cautious word meaning “probably”: ___ . (l…, 6 letters)', ['likely'], 'Likely — ehtimol.'),
        ch('Rivers in the region have shrunk by 40% since 1990, and farms downstream report water shortages. Which inference is most logical?', ['Reduced river flow may be affecting downstream farms.', 'Farms caused the rivers to shrink.', 'Rivers never change.', 'Water shortages are impossible.'], 0, 'Dalil: oqim kamaygan + qishloq xo‘jaligi tanqisligi: bog‘liqlik ehtimoli.'),
        multi('Choose ALL signs of a good inference answer.', ['It follows from the evidence.', 'It adds a new unrelated fact.', 'It uses careful wording.', 'It is only one logical step.', 'It contradicts the passage.'], [0, 2, 3], 'Dalildan kelib chiqadi, ehtiyotkor so‘z, bir mantiqiy qadam.'),
      ],
      check: [
        ch('In a trial, patients who slept eight hours scored 15% higher on memory tests than those who slept five. Researchers conclude sleep may help memory. Which conclusion is best?', ['Sleep loss could harm memory.', 'Memory is unrelated to sleep.', 'Eight hours is always required.', 'Tests are meaningless.'], 0, 'Dalilga mos: uyqu kam — xotira yomon bo‘lishi mumkin.'),
        ch('Because the lake’s oxygen level fell sharply after the factory opened, ___', ['scientists suspect the factory may be a factor.', 'the lake is perfect.', 'fish prefer low oxygen.', 'the factory is a lake.'], 0, 'Mantiqiy va ehtiyotkor: may be a factor.'),
        ch('Which option is an overreach?', ['The data suggest a link.', 'The data prove that this is the only cause.', 'The data may indicate a trend.', 'The data are consistent with the claim.'], 1, 'Overreach: “prove … only cause”.'),
        gap('To draw a conclusion from evidence is to ___ . (i…, 5 letters)', ['infer'], 'Infer — xulosa chiqarmoq.'),
        ch('A museum added audio guides and visitor reviews became more positive. A cautious inference is that', ['audio guides may have improved the visitor experience.', 'audio guides cause every positive review.', 'reviews are always honest.', 'museums should close.'], 0, 'Ehtiyotkor, dalilga mos.'),
        multi('Choose ALL wording that signals caution.', ['may', 'suggests', 'always', 'could', 'definitely'], [0, 1, 3], 'May, suggests, could — ehtiyotkor. Always va definitely — qat’iy.'),
      ],
    },
  ],
};
