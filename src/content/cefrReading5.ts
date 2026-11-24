import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 5: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Dental Clinic: Patients who cannot come to their appointment must tell us at least 24 hours before. If you do not, you may be charged a fee. Appointments can be changed by phone or on our website.',
  '2) MESSAGE — Hi Jasur, the concert tonight starts at 8, but the doors open at 7. Let’s meet outside the main entrance at 7.15 so we can find good seats. Don’t forget your student card — it gives us a discount at the café inside. Bekzod',
  '3) ADVERTISEMENT — Flat to rent near the city centre: two bedrooms, a large kitchen and a balcony. The flat is on the fourth floor, but there is a lift. Available from 1 September. A minimum stay of twelve months is required.',
];

const T2 = [
  'Street food is ready-to-eat food sold in public places such as markets, squares and the sides of busy roads. In many countries it is an important part of everyday life, because it is cheap, quick and often delicious. Millions of people buy their breakfast or lunch from street sellers every day.',
  'For tourists, street food is often one of the highlights of a trip. It allows visitors to try local dishes and to see how ordinary people eat. Some cities now organise walking tours that take visitors from one food stall to another, with a guide who explains the history of each dish.',
  'However, some people worry about hygiene. Sellers do not always have running water, and food may be kept outside in hot weather. For this reason, several cities have introduced rules that require street sellers to have a licence and to follow basic safety standards. Many sellers welcome these rules, because they help customers to trust them.',
];

const T3 = [
  'A. The Kyzylkum, whose name means “red sand”, is one of the largest deserts in Central Asia. It lies between two great rivers, the Amu Darya and the Syr Darya, and covers a large part of Uzbekistan as well as areas of Kazakhstan and Turkmenistan.',
  'B. Life in the desert is shaped by extremes. Summers are very hot and dry, while winters can be surprisingly cold. Rain falls mainly in spring, and for a few weeks after it the desert is covered with grasses and flowers.',
  'C. Although the land looks empty, it supports a variety of animals. Lizards, tortoises and snakes are common, and some larger animals, such as gazelles, are able to survive for long periods with very little water.',
  'D. For centuries, people lived in the desert by moving with their animals in search of grass and water. Wells were extremely valuable, and their location was knowledge that families passed from one generation to the next.',
  'E. In the twentieth century, the discovery of natural gas, gold and other minerals brought great changes. New towns were built for the workers, together with roads and railways that connected the desert to the rest of the country.',
  'F. Today the desert also faces new pressures. Water taken from the rivers for farming has reduced the amount that reaches the region, and scientists are studying how changes in the climate may affect its plants and animals in the future.',
];

const T4 = [
  'Recycling is often presented as the simplest way for ordinary people to protect the environment. Yet in many countries only a small proportion of the plastic that is collected is actually turned into new products. The rest is burned, buried or sent abroad.',
  'One reason is that there are many different types of plastic, and they cannot all be recycled together. Bottles, food containers and bags are often made from different materials, and if they are mixed, the quality of the recycled plastic falls.',
  'Another problem is contamination. Containers that still have food or drink in them can spoil a whole load of material. For this reason, recycling centres ask people to rinse containers before putting them in the bin.',
  'Many experts argue that recycling alone is not enough. They say that the most effective approach is to reduce the amount of plastic we use in the first place, for example by choosing products with less packaging, carrying reusable bags and bottles, and buying food loose rather than wrapped.',
];

const T5 = [
  'It is widely claimed that anyone can become an expert in almost any field if they practise for about ten thousand hours. The figure became famous through popular books, which drew on research into musicians and other high performers. The message was attractive because it suggested that success depends on effort rather than talent.',
  'The researchers whose work inspired the claim have pointed out that it is a simplification. In their studies, the most important factor was not simply the number of hours but the type of practice. What they called “deliberate practice” involves working on specific weaknesses, usually with the guidance of a teacher, and receiving immediate feedback. Playing a piece of music that one already knows well does not count.',
  'Later studies have also suggested that practice explains only part of the difference between people. In some activities, such as games and music, the amount of practice accounts for a considerable share of the variation in performance; in others, its role appears to be smaller. Factors such as the age at which people start, their working memory and even their personality may also matter.',
  'None of this means that practice is unimportant. For most learners, a sensible conclusion is that how they practise matters at least as much as how long. Short, focused sessions that target particular problems, followed by honest feedback, are likely to be more valuable than many hours of comfortable repetition.',
];

const H3 = [
  'i. A changing environment',
  'ii. A desert between two rivers',
  'iii. Wealth from under the ground',
  'iv. Animals adapted to hard conditions',
  'v. A climate of contrasts',
  'vi. The building of a great canal',
  'vii. A traditional way of life',
];

export const cefrReading5: ReadingTest = {
  id: 'cefr-reading-5',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 5',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Street food (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The Kyzylkum desert (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: The limits of recycling (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: The ten-thousand-hour idea (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What must patients do if they cannot come?', options: ['Pay a fee immediately', 'Tell the clinic at least 24 hours before', 'Visit the clinic in person'], answer: 1, evidence: 'Text 1: "must tell us at least 24 hours before".' },
    { id: 2, type: 'mcq', text: 'How can appointments be changed?', options: ['By phone or on the website', 'Only at the reception', 'By email only'], answer: 0, evidence: 'Text 1: "Appointments can be changed by phone or on our website."' },
    { id: 3, type: 'mcq', text: 'Why does Bekzod want to meet at 7.15?', options: ['The concert starts then.', 'To buy tickets', 'To find good seats'], answer: 2, evidence: 'Text 2: "so we can find good seats".' },
    { id: 4, type: 'mcq', text: 'What does the student card give them?', options: ['Free entry to the concert', 'A discount at the café', 'Better seats'], answer: 1, evidence: 'Text 2: "it gives us a discount at the café inside".' },
    { id: 5, type: 'mcq', text: 'What is true about the flat?', options: ['It is on the ground floor.', 'It has three bedrooms.', 'There is a lift in the building.'], answer: 2, evidence: 'Text 3: "The flat is on the fourth floor, but there is a lift."' },
    { id: 6, type: 'mcq', text: 'What is required from people who rent the flat?', options: ['A stay of at least twelve months', 'A job in the city centre', 'Moving in before September'], answer: 0, evidence: 'Text 3: "A minimum stay of twelve months is required."' },
    { id: 7, type: 'tfng', text: 'Street food is usually expensive.', answer: 'False', evidence: 'Part 2: "it is cheap, quick and often delicious".' },
    { id: 8, type: 'tfng', text: 'Millions of people buy meals from street sellers every day.', answer: 'True', evidence: 'Part 2: "Millions of people buy their breakfast or lunch from street sellers every day."' },
    { id: 9, type: 'tfng', text: 'Street food allows tourists to see how ordinary people eat.', answer: 'True', evidence: 'Part 2: it allows visitors "to see how ordinary people eat".' },
    { id: 10, type: 'tfng', text: 'Food walking tours are more expensive than restaurant meals.', answer: 'Not Given', evidence: 'Part 2 does not mention the price of tours.' },
    { id: 11, type: 'tfng', text: 'On food tours, a guide explains the history of each dish.', answer: 'True', evidence: 'Part 2: "a guide who explains the history of each dish".' },
    { id: 12, type: 'tfng', text: 'Street sellers always have running water.', answer: 'False', evidence: 'Part 2: "Sellers do not always have running water".' },
    { id: 13, type: 'tfng', text: 'Some cities require street sellers to have a licence.', answer: 'True', evidence: 'Part 2: rules "require street sellers to have a licence".' },
    { id: 14, type: 'tfng', text: 'Most sellers are against the new safety rules.', answer: 'False', evidence: 'Part 2: "Many sellers welcome these rules".' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 1, evidence: 'Part 3 A: "It lies between two great rivers".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 4, evidence: 'Part 3 B: "Summers are very hot and dry, while winters can be surprisingly cold."' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 3, evidence: 'Part 3 C: animals "able to survive for long periods with very little water".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 6, evidence: 'Part 3 D: "people lived in the desert by moving with their animals".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 2, evidence: 'Part 3 E: "the discovery of natural gas, gold and other minerals".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 0, evidence: 'Part 3 F: "Today the desert also faces new pressures."' },
    { id: 21, type: 'fill', text: 'Only a small ______ of collected plastic is turned into new products.', answers: ['proportion'], evidence: 'Part 4: "only a small proportion of the plastic that is collected".' },
    { id: 22, type: 'fill', text: 'Plastic that is not recycled may be burned, buried or sent ______.', answers: ['abroad'], evidence: 'Part 4: "The rest is burned, buried or sent abroad."' },
    { id: 23, type: 'fill', text: 'If different plastics are mixed, the ______ of the recycled plastic falls.', answers: ['quality'], evidence: 'Part 4: "the quality of the recycled plastic falls".' },
    { id: 24, type: 'fill', text: 'Another problem for recycling is ______.', answers: ['contamination'], evidence: 'Part 4: "Another problem is contamination."' },
    { id: 25, type: 'fill', text: 'Recycling centres ask people to ______ containers first.', answers: ['rinse'], evidence: 'Part 4: "ask people to rinse containers".' },
    { id: 26, type: 'fill', text: 'Experts say the most effective approach is to ______ the amount of plastic we use.', answers: ['reduce'], evidence: 'Part 4: "to reduce the amount of plastic we use".' },
    { id: 27, type: 'fill', text: 'People can choose products with less ______.', answers: ['packaging'], evidence: 'Part 4: "choosing products with less packaging".' },
    { id: 28, type: 'fill', text: 'Food can be bought ______ rather than wrapped.', answers: ['loose'], evidence: 'Part 4: "buying food loose rather than wrapped".' },
    { id: 29, type: 'mcq', text: 'Why was the ten-thousand-hour message attractive?', options: ['It was based on a large survey.', 'It suggested success depends on effort rather than talent.', 'It applied only to musicians.', 'It promised quick results.'], answer: 1, evidence: 'Part 5: "it suggested that success depends on effort rather than talent".' },
    { id: 30, type: 'mcq', text: 'What did the original researchers say about the claim?', options: ['It is completely correct.', 'It was invented by journalists.', 'It is a simplification.', 'It applies only to sport.'], answer: 2, evidence: 'Part 5: "it is a simplification".' },
    { id: 31, type: 'mcq', text: 'Which of the following is NOT part of “deliberate practice”?', options: ['Working on specific weaknesses', 'Receiving immediate feedback', 'Guidance from a teacher', 'Playing a piece one already knows well'], answer: 3, evidence: 'Part 5: "Playing a piece of music that one already knows well does not count."' },
    { id: 32, type: 'mcq', text: 'What have later studies suggested?', options: ['Practice explains only part of the difference between people.', 'Practice has no effect on performance.', 'Talent cannot be measured.', 'Older learners practise more.'], answer: 0, evidence: 'Part 5: "practice explains only part of the difference between people".' },
    { id: 33, type: 'mcq', text: 'According to paragraph 3, the role of practice', options: ['is the same in all activities.', 'varies between activities.', 'is largest in sport.', 'decreases with age.'], answer: 1, evidence: 'Part 5: in some activities practice "accounts for a considerable share"; "in others, its role appears to be smaller".' },
    { id: 34, type: 'mcq', text: 'Which factor is mentioned as possibly important besides practice?', options: ['Family income', 'The number of teachers', 'Working memory', 'The weather'], answer: 2, evidence: 'Part 5: "their working memory and even their personality may also matter".' },
    { id: 35, type: 'mcq', text: 'What is the writer’s main advice to learners?', options: ['Practise for as many hours as possible.', 'Choose an activity that matches your talent.', 'Avoid feedback until you are confident.', 'Focus on how you practise, not only how long.'], answer: 3, evidence: 'Part 5: "how they practise matters at least as much as how long".' },
  ],
};
