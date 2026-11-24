import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 4: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Central Pharmacy: From next week we will open on Sundays from 10 am to 4 pm. On weekdays our hours are unchanged. Prescriptions handed in before midday will be ready the same afternoon.',
  '2) ANNOUNCEMENT — Passengers travelling to Samarkand: the 14.20 train will leave from platform 3 instead of platform 1 today. The train is expected to arrive about fifteen minutes late. Tea and snacks are available in carriage 5.',
  '3) ADVERTISEMENT — Second-hand bicycle for sale. Two years old, in very good condition, with new tyres and a basket. Suitable for a teenager or a small adult. The price can be discussed. Please send a message — no calls after 9 pm.',
];

const T2 = [
  'Since 2020, millions of office workers around the world have started working from home for at least part of the week. For many, the biggest benefit is not having to travel. Time that was once spent in traffic or on crowded buses can now be used for sleep, exercise or family.',
  'Working from home also has disadvantages. Some people find it hard to separate their work from their private life, and they end up answering emails late in the evening. Others miss the informal conversations with colleagues that often lead to new ideas and help new employees to learn.',
  'As a result, many companies have chosen a “hybrid” model, in which staff spend some days in the office and some at home. Managers say that the office is now used mainly for meetings and teamwork, while tasks that need concentration are done at home. Some firms have reduced the size of their offices to save money.',
];

const T3 = [
  'A. Chess is one of the oldest board games still played today. Most historians believe that it developed in India around the sixth century, in a form known as chaturanga, and then spread to Persia, where it became known as shatranj.',
  'B. From Persia, the game travelled west with traders and scholars. By the eleventh century it was known across the Arab world and in parts of Europe, and in the following centuries it became a favourite pastime of kings and nobles.',
  'C. The game played at that time was slower than modern chess. The piece now called the queen could only move one square diagonally. In the late fifteenth century, players in southern Europe gave the queen much greater power, and the game became faster and more aggressive.',
  'D. In the nineteenth century, chess became more organised. Clubs were founded in many cities, the first international tournaments were held, and players began to use clocks to limit the time each player could take.',
  'E. The arrival of computers changed the game again. In 1997, a computer defeated the world champion in a match for the first time. Today, even a mobile phone can run a program that is stronger than any human player.',
  'F. Rather than destroying interest in chess, computers have helped it grow. Players of all levels use programs to study and practise, and online platforms allow millions of people to play against opponents from other countries at any time of day.',
];

const T4 = [
  'In many cities, empty spaces between buildings are being turned into community gardens. On rooftops, in old car parks and even on the walls of buildings, residents are growing vegetables, fruit and flowers.',
  'Supporters say that urban gardens bring several benefits. They provide fresh food for local people, and they make neighbourhoods greener and more attractive. Plants also help to cool the air in summer, which is important in cities where concrete and asphalt store heat.',
  'Gardens can have social benefits as well. Working together on a shared project gives neighbours a reason to meet and talk, and many gardens organise events where children learn how food is grown. Doctors have also noted that gardening is good for mental health, as it reduces stress.',
  'There are challenges, however. In some areas, the soil is polluted and must be replaced before anything can be planted. Water can be expensive, and gardens depend on volunteers who may lose interest. Some projects have also had to close when the land was sold for building.',
];

const T5 = [
  'False information is nothing new, but the speed at which it can now spread is. On social media, a misleading story can reach millions of people within hours, long before anyone has had time to check whether it is true. Studies of online sharing have found that false stories often travel further and faster than accurate ones, perhaps because they tend to be more surprising or emotional.',
  'One common response has been fact-checking: journalists or independent organisations examine popular claims and publish corrections. Fact-checking can be effective, but it has limits. Corrections usually reach fewer people than the original story, and people who strongly believe a claim may reject a correction that challenges their views.',
  'Some researchers have therefore turned to a different approach, sometimes called “prebunking”. Instead of correcting false stories after they appear, people are shown in advance the techniques that are often used to mislead, such as using emotional language, presenting false experts or offering only two options when there are more. The idea is similar to a vaccine: a weak exposure is meant to build resistance to the real thing.',
  'Early results are encouraging, although it is not yet clear how long the effect lasts. Most experts agree that no single method will solve the problem. Platforms, schools, journalists and individual users all have a part to play, and perhaps the most valuable habit of all is simply to pause and check before sharing.',
];

const H3 = [
  'i. Changes that made the game faster',
  'ii. A game that began in Asia',
  'iii. Machines that beat people',
  'iv. Why chess was banned in Europe',
  'v. Spreading through trade and royalty',
  'vi. Technology that increased popularity',
  'vii. Rules and organisation',
];

export const cefrReading4: ReadingTest = {
  id: 'cefr-reading-4',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 4',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Working from home (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The history of chess (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Gardens in the city (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Fighting false information (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What is new at the pharmacy?', options: ['Longer weekday hours', 'Sunday opening', 'Free prescriptions'], answer: 1, evidence: 'Text 1: "we will open on Sundays from 10 am to 4 pm".' },
    { id: 2, type: 'mcq', text: 'When will a prescription be ready the same afternoon?', options: ['If it is handed in before midday', 'Only on Sundays', 'If you phone first'], answer: 0, evidence: 'Text 1: "Prescriptions handed in before midday will be ready the same afternoon."' },
    { id: 3, type: 'mcq', text: 'What has changed for the Samarkand train today?', options: ['The departure time', 'The destination', 'The platform'], answer: 2, evidence: 'Text 2: "will leave from platform 3 instead of platform 1".' },
    { id: 4, type: 'mcq', text: 'What is said about the arrival of the train?', options: ['It will be on time.', 'It will be about fifteen minutes late.', 'It will arrive early.'], answer: 1, evidence: 'Text 2: "expected to arrive about fifteen minutes late".' },
    { id: 5, type: 'mcq', text: 'What is true about the bicycle?', options: ['It has new tyres.', 'It is brand new.', 'It is for young children.'], answer: 0, evidence: 'Text 3: "with new tyres and a basket".' },
    { id: 6, type: 'mcq', text: 'How should buyers contact the seller?', options: ['By phone at any time', 'By visiting the shop', 'By sending a message'], answer: 2, evidence: 'Text 3: "Please send a message — no calls after 9 pm."' },
    { id: 7, type: 'tfng', text: 'Many workers say not travelling is the biggest benefit of working from home.', answer: 'True', evidence: 'Part 2: "the biggest benefit is not having to travel".' },
    { id: 8, type: 'tfng', text: 'People who work from home earn more money.', answer: 'Not Given', evidence: 'Part 2 does not mention salaries.' },
    { id: 9, type: 'tfng', text: 'Some home workers answer emails late in the evening.', answer: 'True', evidence: 'Part 2: "they end up answering emails late in the evening".' },
    { id: 10, type: 'tfng', text: 'Informal conversations with colleagues help new employees to learn.', answer: 'True', evidence: 'Part 2: conversations "help new employees to learn".' },
    { id: 11, type: 'tfng', text: 'In a hybrid model, staff work only from home.', answer: 'False', evidence: 'Part 2: "staff spend some days in the office and some at home".' },
    { id: 12, type: 'tfng', text: 'Managers say tasks that need concentration are mainly done in the office.', answer: 'False', evidence: 'Part 2: "tasks that need concentration are done at home".' },
    { id: 13, type: 'tfng', text: 'Some companies have made their offices smaller to save money.', answer: 'True', evidence: 'Part 2: "Some firms have reduced the size of their offices to save money."' },
    { id: 14, type: 'tfng', text: 'Most employees prefer the hybrid model to working full-time in the office.', answer: 'Not Given', evidence: 'Part 2 gives managers’ views, not employees’ preferences.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 1, evidence: 'Part 3 A: chess "developed in India around the sixth century".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 4, evidence: 'Part 3 B: it "travelled west with traders" and became "a favourite pastime of kings and nobles".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 0, evidence: 'Part 3 C: "the game became faster and more aggressive".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 6, evidence: 'Part 3 D: clubs, tournaments and clocks — "chess became more organised".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 2, evidence: 'Part 3 E: "a computer defeated the world champion in a match for the first time".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 5, evidence: 'Part 3 F: "Rather than destroying interest in chess, computers have helped it grow."' },
    { id: 21, type: 'fill', text: 'Gardens are being created on rooftops, in old car parks and on the ______ of buildings.', answers: ['walls'], evidence: 'Part 4: "even on the walls of buildings".' },
    { id: 22, type: 'fill', text: 'Urban gardens provide ______ food for local people.', answers: ['fresh'], evidence: 'Part 4: "They provide fresh food for local people".' },
    { id: 23, type: 'fill', text: 'Plants help to ______ the air in summer.', answers: ['cool'], evidence: 'Part 4: "Plants also help to cool the air in summer".' },
    { id: 24, type: 'fill', text: 'Concrete and asphalt store ______.', answers: ['heat'], evidence: 'Part 4: "concrete and asphalt store heat".' },
    { id: 25, type: 'fill', text: 'Many gardens organise events where ______ learn how food is grown.', answers: ['children'], evidence: 'Part 4: "events where children learn how food is grown".' },
    { id: 26, type: 'fill', text: 'Doctors say gardening reduces ______.', answers: ['stress'], evidence: 'Part 4: "gardening is good for mental health, as it reduces stress".' },
    { id: 27, type: 'fill', text: 'In some areas the ______ is polluted and must be replaced.', answers: ['soil'], evidence: 'Part 4: "the soil is polluted and must be replaced".' },
    { id: 28, type: 'fill', text: 'Some gardens closed when the land was sold for ______.', answers: ['building'], evidence: 'Part 4: "when the land was sold for building".' },
    { id: 29, type: 'mcq', text: 'According to the writer, what is new about false information?', options: ['Its existence', 'The speed at which it spreads', 'Its emotional content', 'The number of people who believe it'], answer: 1, evidence: 'Part 5: "False information is nothing new, but the speed at which it can now spread is."' },
    { id: 30, type: 'mcq', text: 'Why might false stories travel further than accurate ones?', options: ['They are usually shorter.', 'They are shared by famous people.', 'They tend to be more surprising or emotional.', 'They are easier to translate.'], answer: 2, evidence: 'Part 5: "perhaps because they tend to be more surprising or emotional".' },
    { id: 31, type: 'mcq', text: 'What is one limit of fact-checking?', options: ['Corrections usually reach fewer people than the original story.', 'It is too expensive for most newspapers.', 'Journalists are not trained to do it.', 'It takes several months.'], answer: 0, evidence: 'Part 5: "Corrections usually reach fewer people than the original story".' },
    { id: 32, type: 'mcq', text: 'How does “prebunking” differ from fact-checking?', options: ['It uses only experts.', 'It deletes false stories.', 'It is done by social media companies.', 'It prepares people before they meet false stories.'], answer: 3, evidence: 'Part 5: "people are shown in advance the techniques that are often used to mislead".' },
    { id: 33, type: 'mcq', text: 'Which of these is given as a technique used to mislead?', options: ['Quoting official statistics', 'Offering only two options when there are more', 'Using long sentences', 'Publishing at night'], answer: 1, evidence: 'Part 5: "offering only two options when there are more".' },
    { id: 34, type: 'mcq', text: 'Why does the writer compare prebunking to a vaccine?', options: ['Both are produced by scientists.', 'Both last for life.', 'A weak exposure is meant to build resistance.', 'Both are compulsory.'], answer: 2, evidence: 'Part 5: "a weak exposure is meant to build resistance to the real thing".' },
    { id: 35, type: 'mcq', text: 'What does the writer suggest at the end?', options: ['Platforms alone should solve the problem.', 'Prebunking will soon replace fact-checking.', 'Social media should be closed.', 'Users should pause and check before sharing.'], answer: 3, evidence: 'Part 5: "perhaps the most valuable habit of all is simply to pause and check before sharing".' },
  ],
};
