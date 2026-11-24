import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 10: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Shopping Centre car park: From 1 October, the first two hours of parking will be free for all visitors. After that, the charge is 5,000 sum per hour. Please keep your ticket, as you will need it to leave the car park.',
  '2) EMAIL — Dear Ms Yusupova, your order of three books has been sent today. Two of the books will arrive by Thursday. The third is temporarily out of stock and will be sent separately next week at no extra cost. Thank you for shopping with us. Customer Service',
  '3) ADVERTISEMENT — Volunteers wanted for the city marathon on Sunday 5 May. Tasks include giving water to runners, helping at the finish line and giving directions to visitors. Volunteers will receive a free T-shirt and lunch. Minimum age: 16.',
];

const T2 = [
  'Public libraries were once mainly places where people borrowed books and studied in silence. Today, many libraries are changing. In addition to books, they lend e-books, films and even tools, and they offer free internet access to people who do not have it at home.',
  'Many libraries also organise activities for different groups. Children can attend story sessions, teenagers can join coding clubs, and older people can take classes on how to use smartphones. Some libraries have special rooms where small businesses can hold meetings.',
  'Not everyone welcomes these changes. Some regular users complain that libraries have become noisy and that there is less space for books. Librarians reply that they must attract new visitors in order to survive, and that most libraries still have quiet areas for reading and study.',
];

const T3 = [
  'A. Bridges have been built for thousands of years, from simple logs laid across streams to structures several kilometres long. Whatever their size, they all have the same basic purpose: to carry a load safely across an obstacle such as a river, a valley or a road.',
  'B. Among the oldest types is the arch bridge. The curved shape of the arch carries the weight of the bridge outwards to the supports at each end. The Romans built many stone arch bridges, and some of them are still in use today, nearly two thousand years later.',
  'C. The development of iron and later steel in the eighteenth and nineteenth centuries allowed engineers to build much longer bridges. These materials are strong but relatively light, and they made it possible to cross wide rivers and deep valleys that had previously been impossible to bridge.',
  'D. Suspension bridges, in which the road hangs from huge cables supported by tall towers, can cover the greatest distances. However, early examples showed that they could be dangerous in strong winds, and engineers had to learn how to make them more stable.',
  'E. Modern engineers use computer models to test how a bridge will behave under different conditions, including heavy traffic, earthquakes and storms. Sensors fixed to the structure can also warn them if parts of a bridge begin to move or crack.',
  'F. Bridges are not only practical structures; many have become symbols of the cities in which they stand. Some attract tourists from around the world, and their images appear on postcards, coins and banknotes.',
];

const T4 = [
  'Some companies have started to hold meetings while walking instead of sitting in a meeting room. Supporters say that walking meetings are a simple way to add physical activity to the working day, especially for people who spend many hours at a desk.',
  'Walking may also help people to think. Several studies have found that people produce more creative ideas while walking than while sitting, and some participants say that conversations feel more relaxed and honest when people walk side by side rather than facing each other across a table.',
  'Walking meetings are not suitable for every purpose, however. They work best for small groups of two or three people. It is difficult to look at documents or take detailed notes while walking, and noise from traffic can make it hard to hear.',
  'Managers who use walking meetings suggest planning a route in advance, preferably through a park or a quiet street. They also advise telling participants beforehand so that they can wear comfortable shoes, and writing down the main decisions as soon as the meeting ends.',
];

const T5 = [
  'Machine translation has improved dramatically over the past decade. Systems based on large neural networks, trained on enormous collections of texts in many languages, now produce translations that are often fluent and, for many everyday purposes, perfectly adequate. For travellers, students and businesses, the ability to understand a text in an unfamiliar language within seconds has become almost taken for granted.',
  'Yet fluency can be deceptive. Because modern systems are designed to produce natural-sounding sentences, their errors can be harder to spot than the obvious mistakes of earlier programs. A translation may read smoothly while changing the meaning of a sentence, omitting a negative or misunderstanding a technical term. In legal or medical contexts, such errors can have serious consequences.',
  'Performance also varies greatly between languages. Systems work best for language pairs for which huge amounts of translated text are available, such as English and French. For languages with fewer digital resources, which include many languages spoken by millions of people, the quality is often considerably lower, although it is improving.',
  'Professional translators have not disappeared, but their work is changing. Many now spend part of their time editing machine output rather than translating from scratch, and they increasingly focus on texts where cultural knowledge, style and accuracy matter most, such as literature, advertising and legal documents. For language learners, meanwhile, the question is no longer whether to use such tools, but how to use them without losing the benefits of working through a text themselves.',
];

const H3 = [
  'i. Using technology to keep bridges safe',
  'ii. The danger of building in water',
  'iii. Long distances and a lesson about wind',
  'iv. More than a way to cross',
  'v. One purpose, many forms',
  'vi. New materials, longer spans',
  'vii. An ancient shape that lasts',
];

export const cefrReading10: ReadingTest = {
  id: 'cefr-reading-10',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 10',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Libraries today (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: Bridges (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Walking meetings (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Machine translation (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'How long can visitors park for free?', options: ['One hour', 'Two hours', 'All day'], answer: 1, evidence: 'Text 1: "the first two hours of parking will be free".' },
    { id: 2, type: 'mcq', text: 'Why should drivers keep their ticket?', options: ['To get a discount', 'To leave the car park', 'To enter the shops'], answer: 1, evidence: 'Text 1: "you will need it to leave the car park".' },
    { id: 3, type: 'mcq', text: 'How many books will arrive by Thursday?', options: ['Three', 'One', 'Two'], answer: 2, evidence: 'Text 2: "Two of the books will arrive by Thursday."' },
    { id: 4, type: 'mcq', text: 'What will happen to the third book?', options: ['It will be sent next week at no extra cost.', 'The order will be cancelled.', 'Ms Yusupova must pay for delivery.'], answer: 0, evidence: 'Text 2: "will be sent separately next week at no extra cost".' },
    { id: 5, type: 'mcq', text: 'Which of these is a volunteer task?', options: ['Running the marathon', 'Selling T-shirts', 'Giving water to runners'], answer: 2, evidence: 'Text 3: "Tasks include giving water to runners".' },
    { id: 6, type: 'mcq', text: 'What will volunteers receive?', options: ['A T-shirt and lunch', 'Money', 'A medal'], answer: 0, evidence: 'Text 3: "Volunteers will receive a free T-shirt and lunch."' },
    { id: 7, type: 'tfng', text: 'In the past, libraries were mainly places for borrowing books and quiet study.', answer: 'True', evidence: 'Part 2: "places where people borrowed books and studied in silence".' },
    { id: 8, type: 'tfng', text: 'Some libraries lend tools.', answer: 'True', evidence: 'Part 2: "they lend e-books, films and even tools".' },
    { id: 9, type: 'tfng', text: 'Internet access in libraries is expensive.', answer: 'False', evidence: 'Part 2: "they offer free internet access".' },
    { id: 10, type: 'tfng', text: 'Older people can learn how to use smartphones at some libraries.', answer: 'True', evidence: 'Part 2: "older people can take classes on how to use smartphones".' },
    { id: 11, type: 'tfng', text: 'Coding clubs are the most popular library activity.', answer: 'Not Given', evidence: 'Part 2 does not say which activity is most popular.' },
    { id: 12, type: 'tfng', text: 'Some regular users complain that libraries have become noisy.', answer: 'True', evidence: 'Part 2: "Some regular users complain that libraries have become noisy".' },
    { id: 13, type: 'tfng', text: 'Librarians say most libraries no longer have quiet areas.', answer: 'False', evidence: 'Part 2: "most libraries still have quiet areas for reading and study".' },
    { id: 14, type: 'tfng', text: 'The number of library visitors has doubled in recent years.', answer: 'Not Given', evidence: 'Part 2 gives no figures about visitors.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 4, evidence: 'Part 3 A: "they all have the same basic purpose".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 6, evidence: 'Part 3 B: Roman arch bridges "are still in use today".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 5, evidence: 'Part 3 C: iron and steel "allowed engineers to build much longer bridges".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 2, evidence: 'Part 3 D: suspension bridges "can cover the greatest distances" but were "dangerous in strong winds".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 0, evidence: 'Part 3 E: computer models and sensors that "warn them if parts of a bridge begin to move or crack".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 3, evidence: 'Part 3 F: "Bridges are not only practical structures".' },
    { id: 21, type: 'fill', text: 'Walking meetings add physical ______ to the working day.', answers: ['activity'], evidence: 'Part 4: "a simple way to add physical activity to the working day".' },
    { id: 22, type: 'fill', text: 'Walking meetings are useful for people who spend many hours at a ______.', answers: ['desk'], evidence: 'Part 4: "people who spend many hours at a desk".' },
    { id: 23, type: 'fill', text: 'People produce more ______ ideas while walking.', answers: ['creative'], evidence: 'Part 4: "people produce more creative ideas while walking".' },
    { id: 24, type: 'fill', text: 'Conversations can feel more relaxed and ______ when people walk side by side.', answers: ['honest'], evidence: 'Part 4: "conversations feel more relaxed and honest".' },
    { id: 25, type: 'fill', text: 'Walking meetings work best for ______ groups.', answers: ['small'], evidence: 'Part 4: "They work best for small groups of two or three people."' },
    { id: 26, type: 'fill', text: 'Noise from ______ can make it hard to hear.', answers: ['traffic'], evidence: 'Part 4: "noise from traffic can make it hard to hear".' },
    { id: 27, type: 'fill', text: 'Managers suggest planning a ______ in advance.', answers: ['route'], evidence: 'Part 4: "planning a route in advance".' },
    { id: 28, type: 'fill', text: 'Participants should be told beforehand so they can wear comfortable ______.', answers: ['shoes'], evidence: 'Part 4: "so that they can wear comfortable shoes".' },
    { id: 29, type: 'mcq', text: 'On what are modern translation systems trained?', options: ['Dictionaries only', 'Enormous collections of texts in many languages', 'Recordings of speech', 'The work of a few translators'], answer: 1, evidence: 'Part 5: "trained on enormous collections of texts in many languages".' },
    { id: 30, type: 'mcq', text: 'Why can errors in modern systems be harder to spot?', options: ['The translations are very short.', 'The errors are hidden in long texts.', 'The systems produce natural-sounding sentences.', 'Users rarely read the translations.'], answer: 2, evidence: 'Part 5: "Because modern systems are designed to produce natural-sounding sentences, their errors can be harder to spot".' },
    { id: 31, type: 'mcq', text: 'Which of these errors is mentioned?', options: ['Omitting a negative', 'Using the wrong alphabet', 'Translating names', 'Adding extra pages'], answer: 0, evidence: 'Part 5: "omitting a negative or misunderstanding a technical term".' },
    { id: 32, type: 'mcq', text: 'In which contexts can errors have serious consequences?', options: ['Tourism and travel', 'Legal or medical contexts', 'Social media', 'Language learning'], answer: 1, evidence: 'Part 5: "In legal or medical contexts, such errors can have serious consequences."' },
    { id: 33, type: 'mcq', text: 'Why is quality often lower for some languages?', options: ['They have more difficult grammar.', 'They are spoken by few people.', 'Translators refuse to work with them.', 'They have fewer digital resources.'], answer: 3, evidence: 'Part 5: "For languages with fewer digital resources … the quality is often considerably lower".' },
    { id: 34, type: 'mcq', text: 'How is the work of professional translators changing?', options: ['They have stopped working with literature.', 'Many now edit machine output.', 'They only work with English and French.', 'They have been completely replaced.'], answer: 1, evidence: 'Part 5: "Many now spend part of their time editing machine output".' },
    { id: 35, type: 'mcq', text: 'According to the writer, what is the question for language learners now?', options: ['Whether translation tools are legal', 'How to use the tools without losing the benefits of working through a text', 'Which tool is the cheapest', 'Whether to stop learning languages'], answer: 1, evidence: 'Part 5: "how to use them without losing the benefits of working through a text themselves".' },
  ],
};
