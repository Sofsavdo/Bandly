import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

export const SAT_RW_CRAFT: Unit = {
  id: 'sat-rw3', level: 'B2', title: 'SAT R&W: Craft and Structure', titleUz: 'SAT Reading & Writing: so‘z ma’nosi va matn tuzilishi',
  situationUz: 'Matndagi so‘zning ma’nosi, gap va abzasning vazifasi, muallif maqsadi va ikki matnning o‘zaro munosabati.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-rw3-l1', title: 'Words in context', titleUz: 'Matndagi so‘z ma’nosi (words in context)',
      objectiveUz: 'Bo‘sh joyga mos so‘zni yoki ma’nosi so‘ralgan so‘zni matn ishoralariga qarab topasiz; ohang va darajani solishtirasiz.',
      objective: 'Find the word that fits a blank or the meaning of a word in context by using clues, tone and intensity.',
      taxonomyIds: ['V.word_choice', 'R.inference'], minutes: 14, skipSpeak: true,
      explanationUz: [
        'Words in context savolida bo‘sh joyli parcha beriladi va to‘rt so‘zdan eng mosi so‘raladi. Eng muhim odat: variantlarga qaramasdan, parchani o‘qib bo‘sh joyga o‘zingiz bitta so‘z (prediction) yozing. Keyin shu ma’noga eng yaqin variantni toping. Variantlarni birinchi o‘qisangiz, “chiroyli” ko‘ringan so‘z sizni chalg‘itadi.',
        'Matn ishoralari (clues): zid ma’noni bildiruvchi so‘zlar — but, although, despite, however — bo‘sh joyni oldingi fikrning TESKARISI qiladi; davom ettiruvchilar — and, because, thus, so — bir xil yo‘nalishda. Misol: “Although critics expected the film to fail, it was a ___ success.” — prediction: “great / huge”, variantlardan: resounding.',
        'Ko‘p ma’noli so‘zlar (fine, run, charge, bear) matn bo‘yicha aniqlanadi. Variantlar “umuman to‘g‘ri” ko‘rinsa ham, daraja va ohang mos kelmaydi: “critical” va “catastrophic” bir xil emas; “slightly” va “drastically” ma’nosi farq qiladi. Parchaning umumiy ohangi (ijobiy / salbiy / neytral) ni ham hisobga oling.',
        'Eng ko‘p uchraydigan SAT so‘zlari: corroborate (tasdiqlamoq), undermine (susaytirmoq), ambiguous (noaniq), meticulous (puxta), skeptical (shubhali), mitigate (yengillashtirmoq), substantiate (isbotlamoq), advocate (yoqlamoq). Ildiz va qo‘shimchalar yordam beradi: un-, in-, anti-, mis-, -able, -ous.',
      ],
      table: [
        { form: 'but / although / despite → teskari ma’no', example: 'Although critics expected failure, the film was a resounding success.' },
        { form: 'and / because / thus → bir yo‘nalish', example: 'The plan was risky, and experts warned of its dangers.' },
        { form: 'ohang va daraja: critical ≠ catastrophic', example: 'minor / serious / catastrophic' },
      ],
      examples: [
        { en: 'Although critics expected the film to fail, it was a resounding success.', uz: 'Although → teskari ma’no: “katta muvaffaqiyat” = resounding.' },
        { en: 'Her argument was so meticulous that reviewers could find no gaps.', uz: 'Meticulous — juda puxta, hech qanday kamchiliksiz.' },
        { en: 'New evidence corroborated the earlier findings.', uz: 'Corroborated — tasdiqladi (oldingisini qo‘llab-quvvatladi).' },
        { en: 'The memo was so ambiguous that two teams read it in opposite ways.', uz: 'Ambiguous — noaniq: ikki xil tushunish mumkin.' },
      ],
      vocab: [{ en: 'corroborate', uz: 'tasdiqlamoq' }, { en: 'undermine', uz: 'susaytirmoq, obro‘sini tushirmoq' }, { en: 'ambiguous', uz: 'noaniq, ikki ma’noli' }, { en: 'mitigate', uz: 'yengillashtirmoq, kamaytirmoq' }],
      practice: [
        ch('The scientist’s findings were met with skepticism, but later studies ___ her conclusions, and the theory gained wide acceptance.', ['corroborated', 'undermined', 'ignored', 'postponed'], 0, 'But dan keyin “nazariya qabul qilindi” — keyingi tadqiqotlar uni tasdiqladi: corroborated.'),
        ch('The instructions were so ___ that two teams followed them in opposite ways.', ['ambiguous', 'meticulous', 'sturdy', 'inventive'], 0, 'Ikki xil tushunilgan — noaniq: ambiguous.'),
        ch('Planting trees along the river can ___ the effects of flooding.', ['mitigate', 'aggravate', 'announce', 'celebrate'], 0, 'Toshqin ta’sirini kamaytirish: mitigate.'),
        ch('Despite years of effort, the council’s plan failed to ___ the public’s concerns.', ['alleviate', 'ignite', 'borrow', 'paint'], 0, 'Despite → muvaffaqiyatsizlik: tashvishlarni yengillashtira olmadi: alleviate.'),
        gap('Opposite of “support”: the new data seemed to ___ the claim. (u…, 9 letters: “undermine”)', ['undermine'], 'Undermine — susaytirmoq (support ga zid).'),
        multi('Choose ALL the words that mean roughly “careful and thorough”.', ['meticulous', 'careless', 'painstaking', 'thorough', 'hasty'], [0, 2, 3], 'Meticulous, painstaking, thorough — puxta. Careless va hasty — teskari.'),
      ],
      check: [
        ch('The mayor’s statement was deliberately ___; it allowed both sides to claim victory.', ['vague', 'precise', 'hostile', 'brief'], 0, 'Ikkala tomon g‘alaba deb talqin qildi — noaniq: vague.'),
        ch('Because the author’s argument rested on a single anecdote, critics called it ___.', ['unsubstantiated', 'meticulous', 'comprehensive', 'rigorous'], 0, 'Faqat bitta anekdot — isbotlanmagan: unsubstantiated.'),
        ch('The committee’s ___ approach, reviewing every record twice, left no errors unnoticed.', ['painstaking', 'casual', 'erratic', 'impulsive'], 0, 'Har bir yozuvni ikki marta ko‘rish — puxta: painstaking.'),
        ch('In the sentence “The bank will bear the cost,” the word “bear” most nearly means', ['carry', 'tolerate', 'pay', 'endure'], 2, '“bear the cost” = xarajatni ko‘tarmoq/to‘lamoq: pay.'),
        gap('A word meaning “to confirm with evidence”: sub___ (one word, “substantiate”)', ['substantiate'], 'Substantiate — dalil bilan isbotlamoq.'),
        multi('Choose ALL the clue words that signal a CONTRAST.', ['although', 'however', 'because', 'despite', 'thus'], [0, 1, 3], 'Qarama-qarshilik ishoralari: although, however, despite. Because va thus — davomiylik.'),
      ],
    },
    {
      id: 'sat-rw3-l2', title: 'Text structure and purpose', titleUz: 'Matn tuzilishi va gap vazifasi (function, purpose)',
      objectiveUz: 'Gap yoki abzasning matndagi vazifasini (misol, qarshi fikr, ta’rif, xulosa) aniqlaysiz va muallif maqsadini belgilaysiz.',
      objective: 'Identify the function of a sentence or paragraph and the author’s purpose.',
      taxonomyIds: ['R.main_idea', 'R.inference'], minutes: 12, skipSpeak: true,
      explanationUz: [
        '“Function” savolida chizilgan gap yoki butun matnning VAZIFASI so‘raladi: “Which choice best describes the function of the underlined sentence?” Avval matnning rejasini tuzing: 1-gap — umumiy fikr, 2-gap — sabab, 3-gap (chizilgan) — ?, 4-gap — xulosa. Keyin chizilgan gap qaysi vazifani bajarayotganini ayting.',
        'Variantlar fe’l bilan boshlanadi, shu fe’lning ma’nosini bilish kerak: illustrates (misol keltiradi), counters (qarama-qarshi fikrga javob beradi), qualifies (da’voni cheklaydi), defines (ta’riflaydi), concedes (qisman tan oladi), emphasizes (ta’kidlaydi), introduces (tanishtiradi), summarizes (umumlashtiradi), challenges (shubha uyg‘otadi).',
        'Purpose (“maqsad”) savollarida muallif nima uchun yozgan: tanqid (to critique), taklif (to propose), tavsif (to describe a process), taqqoslash (to compare), tushuntirish (to explain). Mantiqiy so‘zlar tuzilmani ko‘rsatadi: however — zid fikr, for example — misol, therefore — xulosa, although — tan olish.',
        'Tuzoqlar: (1) variantda matnda bor ma’lumot aytilgan, lekin gapning ASOSIY vazifasi emas; (2) vazifa fe’li noto‘g‘ri (“counters” o‘rniga “illustrates”); (3) ekstremal so‘zlar (“completely rejects”). Eng aniq va qisqa vazifa tavsifini tanlang.',
      ],
      table: [
        { form: 'illustrates → misol', example: 'For example, the aye-aye …' },
        { form: 'counters / concedes → qarshi fikr / tan olish', example: 'Some argue …; however, …' },
        { form: 'defines / introduces → ta’rif / tanishtirish', example: 'A keystone species is …' },
      ],
      examples: [
        { en: 'Some historians argue that the road was built for trade. Yet records show that most of its traffic was military.', uz: '2-gap 1-gapdagi fikrga qarshi chiqadi: counters.' },
        { en: 'A keystone species is one whose presence shapes an entire ecosystem.', uz: 'Gap atamani ta’riflaydi: defines.' },
        { en: 'For example, removing sea otters can cause sea urchins to destroy kelp forests.', uz: 'Oldingi fikrga misol keltiradi: illustrates.' },
        { en: 'Admittedly, the survey was small; nevertheless, its results were consistent.', uz: 'Kamchilikni tan olib, keyin da’voni saqlaydi: concedes, then supports.' },
      ],
      vocab: [{ en: 'illustrate', uz: 'misol bilan ko‘rsatmoq' }, { en: 'concede', uz: 'tan olmoq' }, { en: 'counter', uz: 'qarshi chiqmoq, rad etmoq' }, { en: 'qualify', uz: 'cheklamoq (da’voni)' }],
      practice: [
        ch('Text: “Many people believe that multitasking saves time. A 2019 study, however, found that switching tasks lowered accuracy by 40%.” The underlined sentence (“A 2019 study … 40%”) primarily serves to', ['define multitasking', 'counter a common belief', 'illustrate a benefit', 'summarize the study’s method'], 1, '“However” zid fikrni keltiradi: ko‘pchilik fikriga qarshi dalil — counters.'),
        ch('“A keystone species is one whose presence shapes an entire ecosystem.” This sentence mainly serves to', ['criticize a theory', 'define a term', 'narrate an event', 'compare two animals'], 1, 'Atamani ta’riflaydi: defines.'),
        ch('Which verb best fits a sentence that gives a specific example of a general claim?', ['counters', 'illustrates', 'concedes', 'qualifies'], 1, 'Umumiy da’voga aniq misol — illustrates.'),
        ch('An author writes: “The plan is promising; still, it ignores the cost of maintenance.” The second clause mainly', ['restates the first', 'raises a limitation', 'gives a definition', 'summarizes the plan'], 1, '“still” dan keyin cheklov: limitation (qualifies).'),
        gap('“Admittedly” introduces a point that the author ___ . (c…, “concedes”)', ['concedes'], 'Admittedly → tan olish: concedes.'),
        multi('Choose ALL the phrases that usually signal an EXAMPLE.', ['for instance', 'specifically', 'however', 'such as', 'in contrast'], [0, 1, 3], 'Misol ishoralari: for instance, specifically, such as.'),
      ],
      check: [
        ch('Text: “Coastal wetlands protect towns from storms. For instance, in 2012, towns behind healthy marshes reported far less flood damage.” The underlined sentence mainly serves to', ['introduce a new topic', 'give a concrete example', 'reject the first claim', 'state a conclusion'], 1, 'For instance → aniq misol.'),
        ch('The primary purpose of a paragraph that outlines the steps of making paper is to', ['describe a process', 'critique a policy', 'compare two machines', 'argue for a change'], 0, 'Bosqichlar — jarayon tavsifi.'),
        ch('“Although the data are limited, they point in one direction.” The first clause mainly', ['concedes a weakness', 'defines a term', 'introduces a new method', 'repeats the claim'], 0, 'Although → cheklov tan olinadi: concedes.'),
        ch('Which option describes a sentence that narrows a broad claim (for example, “This holds only in cold climates”)?', ['It qualifies the claim.', 'It illustrates the claim.', 'It defines the claim.', 'It repeats the claim.'], 0, 'Da’voni toraytiradi: qualifies.'),
        gap('A sentence that explains what a word means “___ ” the word. (d…, “defines”)', ['defines'], 'Ta’riflaydi: defines.'),
        multi('Choose ALL the true statements about “function” questions.', ['Outline the passage first.', 'The correct answer names the sentence’s main job.', 'Choose any answer that is mentioned in the text.', 'Check the verb in each option.', 'Extreme words are often wrong.'], [0, 1, 3, 4], 'Reja tuzing, asosiy vazifani tanlang, fe’lni tekshiring, ekstremal so‘zlardan ehtiyot bo‘ling. “Matnda bor” kifoya emas.'),
      ],
    },
    {
      id: 'sat-rw3-l3', title: 'Cross-text connections', titleUz: 'Ikki matn o‘rtasidagi bog‘lanish',
      objectiveUz: 'Ikki qisqa matn da’vosini ajratasiz va ikkinchi muallif birinchisiga qanday munosabatda ekanini (qo‘llab-quvvatlash, rad etish, cheklash) aniqlaysiz.',
      objective: 'State the claim of each of two short texts and decide how the second author would respond to the first.',
      taxonomyIds: ['R.inference', 'R.detail'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Cross-text savolida ikkita qisqa matn (Text 1 va Text 2) beriladi. Odatda savol: “Based on the texts, how would the author of Text 2 most likely respond to the claim in Text 1?” Avval har bir matnning asosiy da’vosini bitta qisqa gapda yozing. Keyingi qadam — ikkinchi da’voning birinchisiga munosabati: qo‘llab-quvvatlaydi, rad etadi, qisman rozi bo‘ladi (cheklaydi) yoki yangi dalil qo‘shadi.',
        'Munosabat fe’llari: supports (qo‘llab-quvvatlaydi), challenges / refutes (rad etadi), qualifies (cheklaydi), extends (davom ettiradi), complements (to‘ldiradi), offers an alternative (muqobil beradi). Ko‘pincha ikki muallif bir mavzuda yozadi, lekin aniq bir da’voga turlicha qaraydi — javob aynan SHU da’voga bog‘liq bo‘lishi kerak.',
        'Tuzoqlar: (1) Text 2 mavzusi bir xil, lekin Text 1 dagi aniq da’voga javob bermaydi; (2) javobda haddan tashqari qat’iy so‘zlar (completely, always, never); (3) bir matn ma’lumotini boshqasiga aralashtirish. Har bir variantdagi har bir so‘z matndan dalil bilan tasdiqlanishi kerak.',
      ],
      table: [
        { form: 'qo‘llab-quvvatlaydi / to‘ldiradi', example: 'supports, complements, extends' },
        { form: 'rad etadi / zid', example: 'challenges, refutes, questions' },
        { form: 'cheklaydi (qisman rozi)', example: 'qualifies: “true in some cases, but …”' },
      ],
      examples: [
        { en: 'Text 1: Remote work always raises productivity. Text 2: In a survey of 500 firms, productivity rose in 60% of them and fell in 25%.', uz: 'Text 2 “always” ga qarshi dalil keltiradi: Text 1 ni cheklaydi/rad etadi.' },
        { en: 'Text 1: The comet’s tail points away from the Sun. Text 2: This happens because solar wind pushes dust and gas outward.', uz: 'Text 2 Text 1 dagi faktni izohlaydi: to‘ldiradi.' },
        { en: 'Text 1: Ancient farmers abandoned the valley because of drought. Text 2: Pollen records show wetter conditions, so drought is unlikely.', uz: 'Text 2 Text 1 sababini rad etadi.' },
        { en: 'Text 1: The festival raises local income. Text 2: It does, but mainly for hotel owners.', uz: 'Text 2 qisman rozi, lekin cheklaydi: qualifies.' },
      ],
      vocab: [{ en: 'refute', uz: 'rad etmoq' }, { en: 'complement', uz: 'to‘ldirmoq' }, { en: 'assert', uz: 'qat’iy da’vo qilmoq' }, { en: 'claim', uz: 'da’vo' }],
      practice: [
        ch('Text 1: A researcher argues that sleeping eight hours is necessary for everyone. Text 2: A study of 2,000 adults found that some people function well on six hours. How would the author of Text 2 most likely respond to Text 1?', ['By agreeing fully', 'By noting that the claim does not hold for everyone', 'By changing the topic', 'By defining sleep'], 1, 'Text 2 “everyone” ga qarshi dalil: da’voni cheklaydi.'),
        ch('Text 1: City parks increase property values. Text 2: Near the new park, home prices rose 12%. The relationship is best described as', ['Text 2 supports Text 1', 'Text 2 contradicts Text 1', 'Text 2 changes the subject', 'Text 2 defines parks'], 0, 'Aniq raqam Text 1 da’vosini qo‘llab-quvvatlaydi.'),
        ch('Which verb describes a response that agrees in part but adds a limit?', ['refutes', 'qualifies', 'extends', 'ignores'], 1, 'Qisman rozi + cheklov: qualifies.'),
        ch('Which answer is MOST likely a trap?', ['It uses the word “completely”.', 'It quotes a detail from Text 2.', 'It names both authors’ claims.', 'It matches a specific claim in Text 1.'], 0, '“completely” kabi ekstremal so‘z odatda matn bilan tasdiqlanmaydi.'),
        gap('Complete: to disprove a claim is to ___ it. (r…, “refute”)', ['refute'], 'Refute — rad etmoq.'),
        multi('Choose ALL good first steps for cross-text questions.', ['Write each text’s main claim in one sentence.', 'Skim only Text 2.', 'Decide how the claims relate.', 'Check each option against both texts.', 'Pick the option with the most extreme words.'], [0, 2, 3], 'Har ikki da’voni belgilang, munosabatni aniqlang, variantlarni ikkala matnga solishtiring.'),
      ],
      check: [
        ch('Text 1: Electric buses are cheaper than diesel buses over their lifetime. Text 2: Battery replacement costs have been higher than predicted, which narrows the gap. How would the author of Text 2 likely respond to Text 1?', ['By qualifying the claim', 'By refuting it entirely', 'By agreeing with no change', 'By ignoring cost'], 0, 'Text 2: farq torayadi (cheklaydi), butunlay rad etmaydi: qualifies.'),
        ch('Text 1: The poem’s imagery reflects the poet’s childhood. Text 2: Letters from the poet describe the same river, hills and orchard. Text 2 most nearly', ['supports Text 1 with evidence', 'refutes Text 1', 'changes the topic', 'defines imagery'], 0, 'Xatlar tasvirlarni tasdiqlaydi: supports.'),
        ch('Which phrase best signals that the second author accepts part of the first author’s claim?', ['Not at all', 'To some extent', 'Under no circumstances', 'In no way'], 1, '“To some extent” — qisman rozilik.'),
        ch('Text 1: Rivers always freeze in winter. Text 2: Fast-flowing rivers like the Zeravshan seldom freeze. Text 2 most strongly', ['challenges the word “always”', 'proves Text 1', 'defines winter', 'repeats Text 1'], 0, 'Text 2 “always” ni rad etuvchi istisno keltiradi.'),
        gap('A response that adds more detail to a claim “___ ” it. (e…, “extends”)', ['extends'], 'Extends — davom ettiradi.'),
        multi('Choose ALL the relationships that count as agreement.', ['supports', 'complements', 'refutes', 'extends', 'challenges'], [0, 1, 3], 'Rozilik: supports, complements, extends. Refutes va challenges — zid.'),
      ],
    },
  ],
};
