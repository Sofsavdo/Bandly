import type { Item, Unit } from '../lessons/types';
import { ch, gap } from '../lessons/helpers';

/** "Barcha to‘g‘ri variantlarni tanlang": to‘g‘ri variantlarning aynan o‘zi tanlanishi kerak. */
const multi = (prompt: string, options: string[], answers: number[], explainUz: string): Item => ({ kind: 'multi', prompt, options, answers, explainUz });

// SAT kursi — Reading and Writing (2/2): Expression of Ideas, Craft and Structure, Information and Ideas. ORIGINAL Sellzen materiali.
export const SAT_RW_EXPRESSION: Unit = {
  id: 'sat-rw2', level: 'B2', title: 'SAT R&W: Expression of Ideas', titleUz: 'SAT Reading & Writing: fikrni ifodalash',
  situationUz: 'Gaplar orasidagi mantiqiy bog‘lanish (transitions), qaydlardan maqsadga mos gap tuzish (rhetorical synthesis) va qisqa, aniq yozuv.',
  status: 'pilot',
  lessons: [
    {
      id: 'sat-rw2-l1', title: 'Transitions: finding the logical relationship', titleUz: 'Transitions: gaplar orasidagi mantiqiy bog‘lanish',
      objectiveUz: 'Ikki gap orasidagi munosabatni (qarama-qarshilik, natija, misol, qo‘shish…) o‘zingiz nomlaysiz va unga mos transition ni tanlaysiz.',
      objective: 'Name the relationship between two sentences and pick the transition that expresses it.',
      taxonomyIds: ['W.coherence', 'V.word_choice'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Transition savolida gaplar orasida bo‘sh joy bor va to‘g‘ri bog‘lovchi iborani tanlaysiz. Birinchi qadam — variantlarga qaramay, ikki gapni o‘qib, ular orasidagi munosabatni so‘z bilan ayting: qo‘shish, qarama-qarshilik, natija, misol, qayta aytish yoki ketma-ketlik. Faqat shundan keyin variantlarga qarang.',
        'Asosiy guruhlar: qo‘shish — moreover, furthermore, in addition, also; qarama-qarshilik — however, but, yet, nevertheless, in contrast, on the other hand; natija — therefore, thus, consequently, as a result; misol — for example, for instance, specifically; qayta aytish — in other words, that is; o‘xshashlik — similarly, likewise; ketma-ketlik — first, next, then, finally, meanwhile, subsequently; tan olish — admittedly, granted, of course.',
        'Xatolar: (1) “For example” faqat oldingi umumiy fikrga aniq misol kelganda; (2) “Therefore” faqat haqiqiy sabab-natijada — ikkinchi gap shunchaki yana bir fakt bo‘lsa, in addition; (3) “However” faqat ikkinchi gap birinchisiga ZID bo‘lsa. Har bir ikkinchi gapni birinchisidan keyin kelgan fikr sifatida tekshiring: “bu uni davom ettiryaptimi yoki unga qarshi chiqyaptimi?”',
        'Tinish belgilarini ham unutmang: however, therefore, for example kabi so‘zlar gap boshida vergul bilan; ikki mustaqil gap orasida ular oldidan nuqta-vergul (“…; however, …”). Agar ikkita variant ma’nosi bir xil bo‘lsa (however / nevertheless), tinish belgisi yoki gap tuzilishi farqni hal qiladi.',
      ],
      table: [
        { form: 'qo‘shish: moreover, in addition', example: 'The park is large. Moreover, it is free.' },
        { form: 'qarama-qarshilik: however, nevertheless', example: 'The test was hard; however, most students passed.' },
        { form: 'natija: therefore, as a result', example: 'Rainfall dropped. As a result, crops failed.' },
      ],
      examples: [
        { en: 'Solar panels are now much cheaper. However, many families still cannot afford them.', uz: 'Ikkinchi gap birinchisiga zid (arzonlashdi, lekin hamma ololmaydi) — However.' },
        { en: 'The new metro line cut travel time in half. As a result, ridership doubled.', uz: 'Birinchi — sabab, ikkinchi — natija: As a result.' },
        { en: 'Many birds migrate at night. For example, warblers fly south after sunset.', uz: 'Umumiy fikrdan keyin aniq misol: For example.' },
        { en: 'The first test used 20 subjects. In addition, the second test used 50.', uz: 'Yana bir fakt qo‘shilmoqda: In addition.' },
      ],
      vocab: [{ en: 'transition', uz: 'o‘tish (bog‘lovchi ibora)' }, { en: 'contrast', uz: 'qarama-qarshilik' }, { en: 'consequently', uz: 'shu sababli, natijada' }, { en: 'moreover', uz: 'bundan tashqari' }],
      practice: [
        ch('Many cities have expanded their bus networks. ___, ridership in some areas has not grown.', ['For example', 'However', 'Therefore', 'Similarly'], 1, 'Ikkinchi gap birinchisiga zid: However.'),
        ch('The reservoir was nearly empty by August. ___, officials introduced water-use limits.', ['In contrast', 'Nevertheless', 'As a result', 'Likewise'], 2, 'Ikkinchi gap birinchisining natijasi: As a result.'),
        ch('Some desert plants store water in their stems. ___, the saguaro cactus can hold hundreds of liters.', ['For instance', 'Meanwhile', 'Instead', 'Otherwise'], 0, 'Umumiy fikrdan keyin aniq misol: For instance.'),
        ch('The first draft was clear and well organized. ___, it needed a stronger conclusion.', ['Moreover', 'Nevertheless', 'Therefore', 'For example'], 1, 'Yaxshi, lekin yetishmovchilik: Nevertheless (qarama-qarshilik).'),
        gap('Complete: Mia trained daily for a year. ___, she finished the marathon. (a result word: “as a ___”, one word)', ['result'], '“As a result” — natija bog‘lovchisi.'),
        multi('Choose ALL the pairs that express a contrast.', ['however / nevertheless', 'for example / for instance', 'in contrast / on the other hand', 'therefore / consequently', 'but / yet'], [0, 2, 4], 'Qarama-qarshilik: however, nevertheless, in contrast, on the other hand, but, yet. Boshqalar — misol va natija.'),
      ],
      check: [
        ch('Sleep studies often rely on self-reports. ___, wearable devices now record sleep objectively.', ['Therefore', 'In contrast', 'For example', 'Likewise'], 1, 'Eski usul va yangi usul qarama-qarshi qo‘yilmoqda: In contrast.'),
        ch('The author argues that cities need more parks. ___, she cites a study linking green space to lower stress.', ['In addition', 'However', 'For instance', 'Instead'], 2, 'Da’voga misol/dalil keltirilmoqda: For instance.'),
        ch('The bridge opened in May. ___, traffic on the old road fell by half.', ['Subsequently', 'Nevertheless', 'For example', 'In other words'], 0, 'Ketma-ketlik va natija: Subsequently (keyinchalik).'),
        ch('The treaty reduced emissions in most member states. ___, emissions rose slightly in two of them.', ['Consequently', 'Moreover', 'Even so', 'Thus'], 2, 'Qisman istisno — qarama-qarshilik: Even so.'),
        gap('“In other ___” introduces a restatement. (one word)', ['words'], 'In other words — qayta aytish.'),
        multi('Choose ALL the options that could correctly fill the blank: “The plan was expensive. ___, the council approved it.”', ['However', 'Nevertheless', 'Therefore', 'Even so', 'For example'], [0, 1, 3], 'Qimmat edi, lekin tasdiqlandi — qarama-qarshilik: However, Nevertheless, Even so.'),
      ],
    },
    {
      id: 'sat-rw2-l2', title: 'Rhetorical synthesis: notes and goals', titleUz: 'Rhetorical synthesis: qaydlardan maqsadga mos gap',
      objectiveUz: 'Berilgan qaydlardan faqat maqsadga kerakli faktlarni tanlab, to‘g‘ri va aniq bitta gap tuzilgan variantni topasiz.',
      objective: 'From a set of notes, find the sentence that uses only the facts needed for the stated goal.',
      taxonomyIds: ['W.task_response', 'W.organisation'], minutes: 12, skipSpeak: true,
      explanationUz: [
        'Rhetorical synthesis savolida 3–5 ta qisqa qayd (bullet points) va bitta maqsad beriladi: “The student wants to emphasize a difference between …” yoki “to introduce … to an audience unfamiliar with …”. Avval MAQSADni aniq belgilang (nimani ta’kidlash, kim uchun), keyin qaydlardan faqat shu maqsadga kerakli faktlarni ajrating.',
        'To‘g‘ri variant: (1) maqsadga to‘g‘ridan to‘g‘ri javob beradi; (2) qaydlardagi faktlarni to‘g‘ri bog‘laydi (sabab-natijani o‘zgartirmaydi); (3) qaydlarda yo‘q ma’lumot qo‘shmaydi; (4) qisqa va aniq. Tuzoqlar: to‘g‘ri fakt, lekin boshqa maqsadga mos; ortiqcha faktlarni to‘plagan uzun gap; ikki faktni noto‘g‘ri qiyoslash.',
        'Maqsadga qarab qolip: farqni ta’kidlash — “…, whereas …” / “…, but …”; o‘xshashlik — “both … and …”; yangi atamani tanishtirish — “X, a Y that Z”; usulni ko‘rsatish — “To test …, researchers …”; ahamiyatini ko‘rsatish — “…, which suggests …”. Maqsad so‘zlariga qarab (emphasize, introduce, explain, compare, support a claim) shaklni tanlang.',
      ],
      table: [
        { form: 'farqni ta’kidlash', example: '…, whereas … / …, but …' },
        { form: 'yangi atamani tanishtirish', example: 'The quokka, a small marsupial found in Western Australia, …' },
        { form: 'usul va maqsad', example: 'To test the filter, researchers measured …' },
      ],
      examples: [
        { en: 'Goal: emphasize a difference. Notes: Tashkent metro opened in 1977; it has 4 lines. London’s Underground opened in 1863; it has 11 lines.', uz: 'Maqsad — farq: “…opened in 1977 and has four lines, whereas London’s … opened in 1863 and has eleven.”' },
        { en: 'Goal: introduce a term. Notes: the aye-aye is a lemur; found in Madagascar; hunts insects at night.', uz: 'Atamani tanishtirish: “The aye-aye, a lemur found in Madagascar, hunts insects at night.”' },
        { en: 'Goal: explain a method. Notes: researchers measured river temperature; they used sensors; the study lasted five years.', uz: 'Usul: “To track river temperature, researchers used sensors for five years.”' },
        { en: 'Wrong move: adding a fact that is not in the notes, such as “and it is the oldest in Asia”.', uz: 'Qaydlarda yo‘q ma’lumot qo‘shish — odatiy xato.' },
      ],
      vocab: [{ en: 'emphasize', uz: 'alohida ta’kidlab ko‘rsatmoq' }, { en: 'audience', uz: 'auditoriya' }, { en: 'unfamiliar', uz: 'notanish' }, { en: 'synthesis', uz: 'umumlashtirish, sintez' }],
      practice: [
        ch('Notes: • The kakapo is a parrot. • It lives in New Zealand. • It cannot fly. Goal: introduce the kakapo to readers who don’t know it.', ['The kakapo, a New Zealand parrot, cannot fly.', 'Parrots live in New Zealand.', 'The kakapo cannot fly, and neither can most birds.', 'New Zealand is home to the kakapo, a bird that flies well.'], 0, 'Tanishtirish: ot + qisqa ta’rif (a New Zealand parrot) + asosiy xususiyat. Boshqalar qaydlarga zid yoki ortiqcha.'),
        ch('Notes: • Study A used 40 participants. • Study B used 400 participants. Goal: emphasize a difference in sample size.', ['Study A used 40 participants, whereas Study B used 400.', 'Both studies used participants.', 'Study B was published after Study A.', 'Study A and Study B were about participants.'], 0, 'Farq ta’kidlanadi: “whereas” bilan ikki raqam yonma-yon.'),
        ch('Notes: • Researchers wanted to measure noise. • They placed 12 sensors along the road. Goal: explain the method.', ['Noise is a problem on roads.', 'To measure noise, researchers placed 12 sensors along the road.', 'Researchers placed sensors because noise is loud.', 'Twelve roads have sensors.'], 1, 'Usul: maqsad (to measure noise) + harakat (placed 12 sensors).'),
        ch('Which feature makes a rhetorical-synthesis answer wrong?', ['It adds a fact that is not in the notes.', 'It is shorter than the others.', 'It uses a semicolon correctly.', 'It answers the stated goal.'], 0, 'Qaydlarda yo‘q fakt qo‘shish — asosiy xatolardan biri.'),
        gap('A sentence that shows a difference often uses “___” to connect two facts. (one word starting with w)', ['whereas'], '“whereas” — farqni yonma-yon qo‘yadi.'),
        multi('Choose ALL good habits for rhetorical synthesis questions.', ['Read the goal first.', 'Choose the longest option.', 'Check that every fact is in the notes.', 'Prefer the option that answers the goal directly.', 'Add outside knowledge.'], [0, 2, 3], 'Maqsadni birinchi o‘qing, faktlar qaydlarda borligini tekshiring, maqsadga bevosita javob bering.'),
      ],
      check: [
        ch('Notes: • The monarch butterfly migrates up to 4,000 km. • It travels from Canada to Mexico. Goal: emphasize the distance of the migration.', ['Monarchs migrate from Canada to Mexico, a trip of up to 4,000 km.', 'Monarch butterflies are orange and black.', 'Mexico has many butterflies.', 'Monarchs migrate every year, but not far.'], 0, 'Maqsad — masofa: raqam (4,000 km) va marshrut.'),
        ch('Notes: • Aziz designed the app. • It translates signs. • It works offline. Goal: describe what the app does for travelers.', ['Aziz designed an offline app that translates signs for travelers.', 'Aziz works offline.', 'Travelers translate signs by themselves.', 'The app was designed to be online.'], 0, 'Ilovaning vazifasi: translates signs, works offline.'),
        ch('Notes: • Basalt is a volcanic rock. • It is dark. • It forms when lava cools quickly. Goal: introduce basalt to readers unfamiliar with geology.', ['Basalt, a dark volcanic rock, forms when lava cools quickly.', 'Lava is hot.', 'Dark rocks cool quickly.', 'Volcanic rock is dark, so basalt is lava.'], 0, 'Atama + qisqa ta’rif + qanday hosil bo‘ladi.'),
        ch('Notes: • Library A: 12,000 books. • Library B: 3,000 books. Goal: emphasize how much larger A’s collection is.', ['Library A holds four times as many books as Library B.', 'Both libraries hold books.', 'Library B holds more books than Library A.', 'Library A is open longer.'], 0, '12,000 / 3,000 = 4: to‘g‘ri qiyoslash.'),
        gap('In rhetorical synthesis, first read the stated ___ . (one word)', ['goal'], 'Avval maqsadni belgilang.'),
        multi('Choose ALL wrong moves for the goal “emphasize a similarity”.', ['Saying “whereas”', 'Saying “both … and …”', 'Listing only differences', 'Using facts from the notes', 'Adding a fact from outside the notes'], [0, 2, 4], 'Xato: whereas (farq), faqat farqlarni sanash, qaydlardan tashqari fakt.'),
      ],
    },
    {
      id: 'sat-rw2-l3', title: 'Concision and precision', titleUz: 'Qisqalik va aniqlik: ortiqcha so‘zlarni olib tashlash',
      objectiveUz: 'Ortiqcha so‘z va takrorni (redundancy) topasiz, ma’noni saqlagan holda eng qisqa grammatik to‘g‘ri variantni tanlaysiz.',
      objective: 'Spot wordiness and redundancy and choose the shortest correct option that keeps the meaning.',
      taxonomyIds: ['V.word_choice', 'W.sentence_variety'], minutes: 10, skipSpeak: true,
      explanationUz: [
        'SAT da ma’nosi bir xil bo‘lgan variantlar orasida odatda eng QISQA va aniq javob to‘g‘ri bo‘ladi — agar u grammatik to‘g‘ri bo‘lsa. Ortiqchalik turlari: takror (“past history”, “revert back”, “end result”, “free gift”, “each and every”, “completely eliminate”) va bo‘sh iboralar (“due to the fact that” → because, “at this point in time” → now, “in order to” → to).',
        'Aniqlik (precision): umumiy so‘z (“thing”, “big”, “good”) o‘rniga aniq so‘z (“factor”, “significant”, “beneficial”). Uslub izchilligi: rasmiy ilmiy matnda norasmiy so‘z (“kids”, “a lot of”) emas, “children”, “many” tanlanadi. Ega aniq bo‘lsin: “It is believed that …” o‘rniga “Researchers believe …”.',
        'Ehtiyot bo‘ling: qisqa variant ba’zan grammatikani buzadi (bog‘lovchisiz ikki gap, mos kelmaydigan olmosh) yoki ma’noni o‘zgartiradi. Har safar: (1) ma’no saqlandimi, (2) grammatika (chegara, moslashuv) to‘g‘rimi, (3) shundan keyingina eng qisqasini tanlang.',
      ],
      table: [
        { form: 'takror: past history, revert back, end result', example: 'history, revert, result' },
        { form: 'bo‘sh ibora → bitta so‘z', example: 'due to the fact that → because' },
        { form: 'umumiy so‘z → aniq so‘z', example: 'a big change → a significant change' },
      ],
      examples: [
        { en: 'Because of the fact that the road was closed, we took the train.', uz: 'Ortiqcha: “Because of the fact that” → “Because”.' },
        { en: 'The committee will revert back to the original plan.', uz: 'Revert — allaqachon “qaytmoq”: “back” ortiqcha.' },
        { en: 'The study’s end result confirmed the hypothesis.', uz: '“End” ortiqcha: result — natija.' },
        { en: 'It is believed by researchers that the effect is small.', uz: 'Qisqasi: “Researchers believe the effect is small.”' },
      ],
      vocab: [{ en: 'redundant', uz: 'ortiqcha, takror' }, { en: 'concise', uz: 'qisqa va aniq' }, { en: 'precise', uz: 'aniq' }, { en: 'wordy', uz: 'so‘zga boy (ortiqcha so‘zli)' }],
      practice: [
        ch('The scientist ___ the final conclusion of her study at the conference.', ['presented the final conclusion', 'presented the conclusion', 'was presenting the final conclusion of', 'did present the final conclusion'], 1, '“Final conclusion” — takror; “conclusion” yetarli.'),
        ch('Because of the fact that demand rose, prices increased.', ['No change', 'Because demand rose,', 'Due to the fact that demand rose,', 'On account of the fact that demand rose,'], 1, 'Qisqa va aniq: Because.'),
        ch('The company decided to ___ back to its earlier policy.', ['revert', 'revert back', 'return back again', 'go back again'], 0, 'Revert — o‘zi “qaytmoq”.'),
        ch('Which phrase is redundant?', ['free gift', 'new policy', 'public library', 'small town'], 0, 'Gift — doim bepul: “free gift” takror.'),
        gap('Replace “in order to” with one word: She walked to work ___ save money.', ['to'], '“in order to” → to.'),
        multi('Choose ALL redundant phrases.', ['past history', 'future plans', 'each and every', 'close proximity', 'clear explanation'], [0, 2, 3], 'Takror: past history, each and every, close proximity. Future plans va clear explanation — takror emas.'),
      ],
      check: [
        ch('The results of the experiment were ___ and clear to everyone.', ['obvious', 'obvious and evident', 'completely and totally obvious', 'very obviously'], 0, 'Eng qisqa va grammatik to‘g‘ri variant.'),
        ch('At this point in time, the museum is closed.', ['No change', 'Now,', 'At the present moment of time,', 'At this current point,'], 1, '“At this point in time” → now.'),
        ch('Researchers ___ that the effect is small.', ['believe', 'are of the belief', 'hold the belief', 'have a belief'], 0, 'Aniq fe’l: believe.'),
        ch('Which version keeps the meaning and is the most concise?', ['The reason why the bridge closed was because of flooding.', 'The bridge closed because of flooding.', 'The reason the bridge closed was due to the fact of flooding.', 'The bridge closed for the reason of flooding.'], 1, '“Reason why … was because” — takror; eng qisqasi 2-variant.'),
        gap('“Basic fundamentals” is redundant; use only “___ ”. (one word)', ['fundamentals', 'basics'], '“Basic” va “fundamental” bir xil ma’no.'),
        multi('Choose ALL the options that are both concise and grammatical.', ['The plan failed because funding ran out.', 'The plan failed on account of the fact that funding ran out.', 'The plan failed; funding ran out.', 'The plan, failed funding ran out.', 'Funding ran out, so the plan failed.'], [0, 2, 4], 'To‘g‘ri: because, nuqta-vergul, so. Xato: ortiqcha ibora; noto‘g‘ri vergul.'),
      ],
    },
  ],
};
