import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 6: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Green Park Hotel: Breakfast is served in the garden restaurant from 7 to 10 am. Guests who need to leave before 7 can ask reception for a breakfast bag the evening before. Rooms must be left by 12 noon on the day of departure.',
  '2) EMAIL — Dear Mr Rakhimov, thank you for your application for the position of sales assistant. We would like to invite you to an interview on Friday at 3 pm. Please bring a copy of your passport and the names of two people who can give you a reference. Regards, Human Resources',
  '3) ADVERTISEMENT — English conversation club: every Wednesday evening at the city library. All levels are welcome, and the first meeting is free. After that, the club costs a small monthly fee, which pays for tea and materials. No booking is needed — just come along.',
];

const T2 = [
  'Board games, which many people thought had been replaced by video games, are enjoying a revival. In the last ten years, sales have increased in many countries, and special cafés where customers can play games while they eat and drink have opened in large cities.',
  'One reason for their popularity is that board games bring people together face to face. Players say that, unlike most video games, board games make them talk, laugh and argue with friends and family around the same table. Some parents also like them because they give children a break from screens.',
  'Modern board games are often very different from the classic games of the past. Many are cooperative, which means that players work together against the game rather than against each other. Others take several hours to play and have complex rules, so a member of staff in a games café may explain how to play.',
];

const T3 = [
  'A. Paper was invented in China more than two thousand years ago. Early paper was made from plant fibres, old cloth and fishing nets, which were soaked in water, beaten into a pulp and then spread on a screen to dry.',
  'B. For several centuries, the method of making paper was known only in East Asia. According to a well-known story, the secret reached Samarkand in the eighth century, and the city soon became famous for producing paper of very high quality.',
  'C. From Central Asia, papermaking spread to Baghdad, Damascus and Cairo, and later to Spain and Italy. Because paper was much cheaper than parchment made from animal skin, it allowed more books to be copied and more people to learn to read.',
  'D. The invention of the printing press in Europe in the fifteenth century greatly increased the demand for paper. Mills powered by water were built along rivers, and paper became one of the most important materials of the modern world.',
  'E. Until the nineteenth century, most paper in Europe was still made from old cloth, which was often in short supply. Inventors then found ways to make paper from wood, which made it far cheaper and allowed the production of newspapers for a mass audience.',
  'F. Today, digital technology has reduced the use of paper in offices, but total demand remains high, partly because of the growth of online shopping and the cardboard boxes it requires. Recycling and responsibly managed forests have become important ways to limit the environmental impact.',
];

const T4 = [
  'Electric cars are becoming a common sight in many cities. Unlike traditional cars, they do not burn petrol or diesel, so they produce no exhaust gases while they are being driven. This can improve the air quality in busy streets.',
  'However, electric cars are not completely clean. Making their batteries requires large amounts of energy and metals such as lithium, which must be mined. In addition, the electricity used to charge the cars may come from power stations that burn coal or gas.',
  'For many drivers, the main concern is range — the distance a car can travel before its battery needs charging. Although modern cars can travel much further than early models, drivers still worry about finding a charging point on long journeys.',
  'Governments in many countries are encouraging people to buy electric cars by offering lower taxes and free parking. As the number of charging points increases and battery prices fall, experts expect electric cars to become cheaper than petrol cars to buy as well as to run.',
];

const T5 = [
  'Most of us believe that we can do several things at once: answer a message while listening to a lecture, or follow a conversation while checking the news. Research on attention suggests that this belief is largely mistaken. Except for very simple or automatic activities, the brain does not truly perform two demanding tasks at the same time; instead, it switches rapidly between them.',
  'Each switch has a cost. When we move our attention from one task to another, it takes time to remember where we were and what we were trying to do, and errors become more likely. These costs are small for a single switch but can add up to a considerable loss of time and accuracy over a working day.',
  'Smartphones have made such switching more frequent. Notifications interrupt us many times an hour, and even when we ignore them, the expectation of a message can distract us. In one widely discussed study, students performed worse on tests of attention when their phones were simply on the desk, switched off, than when the phones were in another room — although later attempts to repeat this result have produced mixed findings.',
  'What can be done? Researchers suggest that people who need to concentrate should group similar tasks together, turn off notifications for set periods and keep their phones out of sight. Some organisations have experimented with “quiet hours” during which meetings and messages are discouraged. The aim is not to reject technology but to use it in a way that protects our limited capacity for attention.',
];

const H3 = [
  'i. Cheaper paper for a mass audience',
  'ii. A new material and how it was made',
  'iii. The secret reaches Central Asia',
  'iv. Why paper is no longer needed',
  'v. A machine that increased demand',
  'vi. A cheaper material that spread knowledge',
  'vii. Old demand, new solutions',
];

export const cefrReading6: ReadingTest = {
  id: 'cefr-reading-6',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 6',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: The return of board games (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The story of paper (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Electric cars (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: The myth of multitasking (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What can guests who leave before 7 am do?', options: ['Eat breakfast in their room', 'Ask for a breakfast bag the evening before', 'Get a refund for breakfast'], answer: 1, evidence: 'Text 1: "can ask reception for a breakfast bag the evening before".' },
    { id: 2, type: 'mcq', text: 'By what time must guests leave their rooms?', options: ['10 am', '7 am', '12 noon'], answer: 2, evidence: 'Text 1: "Rooms must be left by 12 noon on the day of departure."' },
    { id: 3, type: 'mcq', text: 'What is the purpose of the email?', options: ['To invite Mr Rakhimov to an interview', 'To offer Mr Rakhimov a job', 'To reject an application'], answer: 0, evidence: 'Text 2: "We would like to invite you to an interview on Friday".' },
    { id: 4, type: 'mcq', text: 'What should Mr Rakhimov bring?', options: ['A letter from his school', 'Two photographs', 'The names of two referees'], answer: 2, evidence: 'Text 2: "the names of two people who can give you a reference".' },
    { id: 5, type: 'mcq', text: 'How much does the first club meeting cost?', options: ['Nothing', 'A small fee', 'The price of tea'], answer: 0, evidence: 'Text 3: "the first meeting is free".' },
    { id: 6, type: 'mcq', text: 'What do people need to do before going to the club?', options: ['Book a place', 'Nothing — they can just come', 'Pass a level test'], answer: 1, evidence: 'Text 3: "No booking is needed — just come along."' },
    { id: 7, type: 'tfng', text: 'Sales of board games have increased in many countries.', answer: 'True', evidence: 'Part 2: "sales have increased in many countries".' },
    { id: 8, type: 'tfng', text: 'Board game cafés can only be found in small towns.', answer: 'False', evidence: 'Part 2: cafés "have opened in large cities".' },
    { id: 9, type: 'tfng', text: 'Players say board games make them talk and laugh with others.', answer: 'True', evidence: 'Part 2: "board games make them talk, laugh and argue".' },
    { id: 10, type: 'tfng', text: 'Children who play board games do better at school.', answer: 'Not Given', evidence: 'Part 2 does not mention school results.' },
    { id: 11, type: 'tfng', text: 'Some parents like board games because they give children a break from screens.', answer: 'True', evidence: 'Part 2: "they give children a break from screens".' },
    { id: 12, type: 'tfng', text: 'In cooperative games, players compete against each other.', answer: 'False', evidence: 'Part 2: "players work together against the game rather than against each other".' },
    { id: 13, type: 'tfng', text: 'All modern board games can be learned in a few minutes.', answer: 'False', evidence: 'Part 2: some "take several hours to play and have complex rules".' },
    { id: 14, type: 'tfng', text: 'Games cafés charge extra for explaining the rules.', answer: 'Not Given', evidence: 'Part 2 says staff may explain rules but says nothing about a charge.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 1, evidence: 'Part 3 A: "Paper was invented in China"; fibres "beaten into a pulp".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 2, evidence: 'Part 3 B: "the secret reached Samarkand in the eighth century".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 5, evidence: 'Part 3 C: paper "allowed more books to be copied and more people to learn to read".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 4, evidence: 'Part 3 D: "The invention of the printing press … greatly increased the demand for paper."' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 0, evidence: 'Part 3 E: wood "made it far cheaper and allowed the production of newspapers for a mass audience".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 6, evidence: 'Part 3 F: "total demand remains high"; recycling and managed forests limit the impact.' },
    { id: 21, type: 'fill', text: 'Electric cars produce no exhaust ______ while being driven.', answers: ['gases'], evidence: 'Part 4: "they produce no exhaust gases while they are being driven".' },
    { id: 22, type: 'fill', text: 'Electric cars can improve the air ______ in busy streets.', answers: ['quality'], evidence: 'Part 4: "This can improve the air quality in busy streets."' },
    { id: 23, type: 'fill', text: 'Making batteries requires large amounts of ______ and metals.', answers: ['energy'], evidence: 'Part 4: "requires large amounts of energy and metals such as lithium".' },
    { id: 24, type: 'fill', text: 'Metals such as ______ must be mined.', answers: ['lithium'], evidence: 'Part 4: "metals such as lithium, which must be mined".' },
    { id: 25, type: 'fill', text: 'The electricity may come from power stations that burn coal or ______.', answers: ['gas'], evidence: 'Part 4: "power stations that burn coal or gas".' },
    { id: 26, type: 'fill', text: 'The distance a car can travel before charging is called its ______.', answers: ['range'], evidence: 'Part 4: "range — the distance a car can travel before its battery needs charging".' },
    { id: 27, type: 'fill', text: 'Governments encourage buyers with lower ______ and free parking.', answers: ['taxes'], evidence: 'Part 4: "by offering lower taxes and free parking".' },
    { id: 28, type: 'fill', text: 'Experts expect battery ______ to fall.', answers: ['prices'], evidence: 'Part 4: "battery prices fall".' },
    { id: 29, type: 'mcq', text: 'What does research suggest about doing two demanding tasks at once?', options: ['The brain does it easily.', 'Only young people can do it.', 'It improves memory.', 'The brain actually switches between them.'], answer: 3, evidence: 'Part 5: "the brain does not truly perform two demanding tasks at the same time; instead, it switches rapidly between them".' },
    { id: 30, type: 'mcq', text: 'What is said about the cost of switching?', options: ['It is large for every single switch.', 'It is small for one switch but adds up over a day.', 'It only affects accuracy, not time.', 'It disappears with practice.'], answer: 1, evidence: 'Part 5: "These costs are small for a single switch but can add up".' },
    { id: 31, type: 'mcq', text: 'According to paragraph 3, even ignored notifications', options: ['improve our focus.', 'are quickly forgotten.', 'can still distract us through expectation.', 'save time later.'], answer: 2, evidence: 'Part 5: "even when we ignore them, the expectation of a message can distract us".' },
    { id: 32, type: 'mcq', text: 'In the study described, students performed worse when their phones were', options: ['on the desk and switched off.', 'in another room.', 'in their pockets and switched on.', 'used for the test.'], answer: 0, evidence: 'Part 5: "when their phones were simply on the desk, switched off".' },
    { id: 33, type: 'mcq', text: 'What does the writer say about later attempts to repeat the study?', options: ['They confirmed it completely.', 'They have produced mixed findings.', 'They were never carried out.', 'They found the opposite result.'], answer: 1, evidence: 'Part 5: "later attempts to repeat this result have produced mixed findings".' },
    { id: 34, type: 'mcq', text: 'Which piece of advice is given to people who need to concentrate?', options: ['Answer messages immediately.', 'Use two screens.', 'Work only at night.', 'Group similar tasks together.'], answer: 3, evidence: 'Part 5: "should group similar tasks together".' },
    { id: 35, type: 'mcq', text: 'What is the aim of the suggestions, according to the writer?', options: ['To reject technology', 'To protect our limited capacity for attention', 'To reduce working hours', 'To ban smartphones at work'], answer: 1, evidence: 'Part 5: "The aim is not to reject technology but to use it in a way that protects our limited capacity for attention."' },
  ],
};
