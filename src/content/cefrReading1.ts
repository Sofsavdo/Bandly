import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi: 35 savol, 60 daqiqa (umumiy hajm va vaqt rasmiy manbada tasdiqlangan —
// examFormats.ts). Ichki qismlar va topshiriq turlari rasmiy manbada ko'rsatilmagan: bu yerdagi tuzilish Bandly'niki.
// Original mashq materiali; metodist tekshiruvini kutmoqda (PXD-05).
const T1 = [
  '1) NOTICE — City Library: From 1 March the library will close at 6 pm on Fridays instead of 8 pm. Books can still be returned at any time using the box next to the main door.',
  '2) MESSAGE — Hi Sardor, the football match on Saturday has moved from the school field to the sports centre because the field is being repaired. Same time, 10 am. Bring your own water — the café there is closed at weekends. Aziz',
  '3) ADVERTISEMENT — Room for rent: a quiet single room in a shared flat, ten minutes’ walk from the university. Bills are included in the price. Suitable for a non-smoking student. No pets, please. Call Malika after 5 pm.',
];

const T2 = [
  'Learning a language online used to mean watching recorded lessons alone at a computer. Today, many learners prefer live classes with a real teacher, even if the teacher is in another country. Some say the most important advantage is flexibility: lessons can be taken early in the morning or late at night, around work and family duties.',
  'However, online learning is not suitable for everyone. Learners who find it difficult to organise their time often stop after a few weeks, especially when nobody checks whether they have done their homework. Teachers report that students who set a fixed time for lessons every week are far more likely to continue.',
  'Another concern is speaking practice. In a large online group, each learner may speak for only a few minutes. For this reason, some schools now limit online groups to six students, while others offer extra conversation sessions with a partner. Many learners also use apps between lessons, although most teachers see these as a supplement rather than a replacement for real conversation.',
];

const T3 = [
  'A. For centuries, the Silk Road connected China with the Mediterranean, and cities such as Samarkand and Bukhara grew rich from the trade that passed through them. Merchants stopped in these cities to rest, exchange goods and find fresh animals for the next stage of the journey.',
  'B. The routes carried far more than silk. Paper, spices, glass, metals and horses moved in both directions. Just as important were ideas: religions, scientific knowledge and artistic styles spread along the same roads as the goods.',
  'C. Travel was slow and often dangerous. Caravans could take months to cross deserts and mountains, and they faced extreme heat, cold and the risk of attack. Caravanserais — inns built at regular distances along the routes — offered shelter and safety for travellers and their animals.',
  'D. In the fifteenth and sixteenth centuries, the importance of the land routes declined. European traders increasingly used sea routes, which could carry larger loads more cheaply, and political changes made some parts of the land routes less secure.',
  'E. Today, interest in the Silk Road has returned. Historic buildings in Samarkand, Bukhara and Khiva attract visitors from all over the world, and many caravanserais have been restored. Tourism has become an important source of income for the region.',
  'F. At the same time, new transport projects — railways, roads and pipelines — are once again linking Central Asia with China and Europe. Some writers describe these as a “new Silk Road”, although the goods they carry are very different from those of the past.',
];

const T4 = [
  'Many people believe that creativity is a rare talent that some people are born with and others are not. Psychologists, however, increasingly see it as a skill that can be developed with practice. Studies of successful artists and scientists show that they often produce a large number of ideas, most of which are never used. Quantity, it seems, is one of the routes to quality.',
  'One factor that appears to help is a period of rest after hard work on a problem. People frequently report that a solution came to them while they were walking or taking a shower, rather than while they were sitting at a desk. Researchers believe that during such breaks the mind continues to work on the problem without our being aware of it.',
  'Fear of criticism, on the other hand, seems to reduce creativity. When people expect their ideas to be judged harshly, they tend to suggest only safe and familiar solutions. For this reason, many organisations separate the stage of producing ideas from the stage of evaluating them.',
  'Finally, creativity often grows from combining knowledge from different fields. An engineer who studies biology, or a designer who learns about psychology, may notice connections that specialists miss. This suggests that schools which encourage students to explore several subjects may be preparing them better for creative work.',
];

const T5 = [
  'The idea that the language we speak shapes the way we think has fascinated scholars for more than a century. In its strongest form, the claim is that speakers of different languages live in different mental worlds, unable to understand concepts for which their language has no words. Few researchers today accept this extreme position, not least because translation between languages, though imperfect, is clearly possible.',
  'A weaker version of the idea, however, has received considerable support. Experiments suggest that language can influence what people notice and remember. For example, languages differ in how they describe the position of objects. Some rely on terms such as “left” and “right”, which depend on the speaker’s body, while others use fixed directions such as north and south. Speakers of the second type of language tend to remember the arrangement of objects in terms of those fixed directions, even in tasks that do not involve speaking.',
  'Critics point out that such differences may be caused not by language itself but by the culture and environment in which the language is used. A community that lives in open landscape may need fixed directions for practical reasons, and the language simply reflects this need. Separating the effect of language from the effect of culture is therefore one of the central difficulties in this area of research.',
  'Whatever the final answer, the debate has had practical consequences. It has encouraged researchers to study a wider range of languages, many of which are spoken by small communities and are at risk of disappearing. Each of these languages, linguists argue, represents a unique way of organising human experience, and its loss would be a loss to science as well as to its speakers.',
];

const H3 = [
  'i. Why the land routes became less important',
  'ii. Goods and ideas that travelled together',
  'iii. A modern version of an old connection',
  'iv. Places of rest on a difficult journey',
  'v. Rich cities on a long trade route',
  'vi. The return of visitors to historic cities',
  'vii. The invention of paper money',
];

export const cefrReading1: ReadingTest = {
  id: 'cefr-reading-1',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 1',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Learning languages online (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The Silk Road (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Can creativity be learned? (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Language and thought (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What is changing at the library?', options: ['Its opening day', 'Its closing time on Fridays', 'The place to return books'], answer: 1, evidence: 'Text 1: "close at 6 pm on Fridays instead of 8 pm".' },
    { id: 2, type: 'mcq', text: 'When can books be returned?', options: ['Only until 6 pm', 'Only on Fridays', 'At any time'], answer: 2, evidence: 'Text 1: "Books can still be returned at any time".' },
    { id: 3, type: 'mcq', text: 'Why has the football match moved?', options: ['The field is being repaired.', 'The weather will be bad.', 'The sports centre is cheaper.'], answer: 0, evidence: 'Text 2: "because the field is being repaired".' },
    { id: 4, type: 'mcq', text: 'What should Sardor bring?', options: ['Football boots', 'Water', 'Money for the café'], answer: 1, evidence: 'Text 2: "Bring your own water".' },
    { id: 5, type: 'mcq', text: 'What is included in the rent?', options: ['Bills', 'Meals', 'Internet only'], answer: 0, evidence: 'Text 3: "Bills are included in the price".' },
    { id: 6, type: 'mcq', text: 'Who is the room suitable for?', options: ['A family with a dog', 'A non-smoking student', 'Two friends'], answer: 1, evidence: 'Text 3: "Suitable for a non-smoking student".' },
    { id: 7, type: 'tfng', text: 'In the past, online language learning was mainly done alone.', answer: 'True', evidence: 'Part 2: "used to mean watching recorded lessons alone".' },
    { id: 8, type: 'tfng', text: 'All online teachers live in the same country as their students.', answer: 'False', evidence: 'Part 2: "even if the teacher is in another country".' },
    { id: 9, type: 'tfng', text: 'Flexibility is described as an important advantage of online classes.', answer: 'True', evidence: 'Part 2: "the most important advantage is flexibility".' },
    { id: 10, type: 'tfng', text: 'Online lessons are cheaper than classroom lessons.', answer: 'Not Given', evidence: 'Part 2 does not compare prices.' },
    { id: 11, type: 'tfng', text: 'Students with a fixed weekly lesson time are more likely to continue.', answer: 'True', evidence: 'Part 2: "students who set a fixed time … are far more likely to continue".' },
    { id: 12, type: 'tfng', text: 'Every online school limits groups to six students.', answer: 'False', evidence: 'Part 2: "some schools now limit online groups to six students, while others…".' },
    { id: 13, type: 'tfng', text: 'Most teachers think apps can replace real conversation.', answer: 'False', evidence: 'Part 2: teachers see apps "as a supplement rather than a replacement".' },
    { id: 14, type: 'tfng', text: 'Learners who use apps learn grammar faster.', answer: 'Not Given', evidence: 'Part 2 does not discuss grammar learning speed.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 4, evidence: 'Part 3 A: Samarkand and Bukhara "grew rich from the trade".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 1, evidence: 'Part 3 B: goods and "ideas … spread along the same roads".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 3, evidence: 'Part 3 C: caravanserais "offered shelter and safety".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 0, evidence: 'Part 3 D: "the importance of the land routes declined".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 5, evidence: 'Part 3 E: historic buildings "attract visitors from all over the world".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 2, evidence: 'Part 3 F: new projects described as a "new Silk Road".' },
    { id: 21, type: 'fill', text: 'Psychologists increasingly see creativity as a ______ that can be developed.', answers: ['skill'], evidence: 'Part 4: "a skill that can be developed with practice".' },
    { id: 22, type: 'fill', text: 'Successful artists and scientists often produce a large ______ of ideas.', answers: ['number'], evidence: 'Part 4: "produce a large number of ideas".' },
    { id: 23, type: 'fill', text: 'According to the text, ______ is one of the routes to quality.', answers: ['quantity'], evidence: 'Part 4: "Quantity, it seems, is one of the routes to quality."' },
    { id: 24, type: 'fill', text: 'A period of ______ after hard work on a problem appears to help.', answers: ['rest'], evidence: 'Part 4: "a period of rest after hard work".' },
    { id: 25, type: 'fill', text: 'Solutions often come while people are walking or taking a ______.', answers: ['shower'], evidence: 'Part 4: "while they were walking or taking a shower".' },
    { id: 26, type: 'fill', text: 'Fear of ______ seems to reduce creativity.', answers: ['criticism'], evidence: 'Part 4: "Fear of criticism … seems to reduce creativity".' },
    { id: 27, type: 'fill', text: 'Many organisations separate producing ideas from ______ them.', answers: ['evaluating'], evidence: 'Part 4: "separate the stage of producing ideas from the stage of evaluating them".' },
    { id: 28, type: 'fill', text: 'Creativity often grows from combining knowledge from different ______.', answers: ['fields'], evidence: 'Part 4: "combining knowledge from different fields".' },
    { id: 29, type: 'mcq', text: 'Why do few researchers accept the strongest form of the idea?', options: ['It is too old.', 'Translation between languages is possible.', 'It was never tested.', 'Most languages are similar.'], answer: 1, evidence: 'Part 5: "not least because translation between languages … is clearly possible".' },
    { id: 30, type: 'mcq', text: 'What do experiments suggest language can influence?', options: ['Intelligence', 'What people notice and remember', 'How fast people learn', 'Which culture people choose'], answer: 1, evidence: 'Part 5: "language can influence what people notice and remember".' },
    { id: 31, type: 'mcq', text: 'Words such as “left” and “right” depend on', options: ['the time of day.', 'the speaker’s body.', 'fixed directions.', 'the landscape.'], answer: 1, evidence: 'Part 5: "terms such as “left” and “right”, which depend on the speaker’s body".' },
    { id: 32, type: 'mcq', text: 'Speakers of languages with fixed directions tend to', options: ['forget the position of objects.', 'remember arrangements using those directions.', 'avoid tasks without speaking.', 'prefer left and right.'], answer: 1, evidence: 'Part 5: they "remember the arrangement of objects in terms of those fixed directions".' },
    { id: 33, type: 'mcq', text: 'What do critics suggest?', options: ['The experiments were too small.', 'Culture and environment may cause the differences.', 'Fixed directions are rare.', 'Language has no effect at all.'], answer: 1, evidence: 'Part 5: differences "may be caused not by language itself but by the culture and environment".' },
    { id: 34, type: 'mcq', text: 'What is described as one of the central difficulties?', options: ['Finding speakers of rare languages', 'Separating the effect of language from culture', 'Translating experimental tasks', 'Measuring memory'], answer: 1, evidence: 'Part 5: "Separating the effect of language from the effect of culture is … one of the central difficulties".' },
    { id: 35, type: 'mcq', text: 'According to linguists, why does the loss of a language matter?', options: ['It makes travel harder.', 'It is a loss to science as well as to its speakers.', 'It reduces the number of books.', 'It makes translation impossible.'], answer: 1, evidence: 'Part 5: "its loss would be a loss to science as well as to its speakers".' },
  ],
};
