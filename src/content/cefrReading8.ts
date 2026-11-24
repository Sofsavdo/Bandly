import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 8: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Bus route 42: Because of road works on Navoi Street, buses will not stop at the theatre from 3 to 17 April. Passengers should use the temporary stop outside the post office, about 200 metres away. Timetables are unchanged.',
  '2) EMAIL — Hi everyone, just a reminder that our class reunion is on Saturday 20th at the Chinor restaurant. Please let me know by Wednesday if you are coming, so I can tell the restaurant how many people to expect. Partners are welcome too. Shahlo',
  '3) ADVERTISEMENT — Part-time job: we are looking for a friendly person to work in our bookshop on Saturdays and Sundays. Experience is not necessary, but you must enjoy reading and be good with customers. Some knowledge of English would be useful.',
];

const T2 = [
  'A gap year is a period, usually of several months to a year, that young people take between finishing school and starting university. During this time, some work to save money, while others travel, volunteer or learn new skills.',
  'Supporters of gap years say that they help young people to become more independent and confident. Living away from home and dealing with new situations can teach them how to manage money, solve problems and communicate with people from different backgrounds. Some students also say that a gap year helped them to decide what they really wanted to study.',
  'However, not everyone agrees that a gap year is a good idea. Some parents worry that their children will lose the habit of studying and find it difficult to return to education. Travelling abroad can also be expensive, so gap years are not available to everyone. For this reason, some organisations now offer programmes that combine work and volunteering in the student’s own country.',
];

const T3 = [
  'A. The Ferghana Valley, surrounded by mountains, is one of the most fertile and densely populated regions of Central Asia. Rivers flowing down from the mountains bring water and rich soil, and for centuries farmers have grown fruit, grain and cotton there.',
  'B. The valley is divided between three countries — Uzbekistan, Kyrgyzstan and Tajikistan. The borders between them are long and complicated, and in some places villages belonging to one country are surrounded by the territory of another.',
  'C. The towns of the valley are famous for their crafts. Margilan is known for its silk, Rishtan for its blue and green ceramics, and Kokand, once the capital of a powerful state, for its palaces and mosques.',
  'D. Water has always been central to life in the valley. An ancient system of canals carries water from the rivers to the fields, and the right to use it was traditionally managed by local communities according to strict rules.',
  'E. In the twentieth century, the area of land used for growing cotton was greatly increased. This brought income but also problems: large amounts of water were taken from the rivers, and in some areas the soil became salty and less productive.',
  'F. In recent years, farmers have begun to grow a wider range of crops, including fruit and vegetables for export. At the same time, new roads and border crossings are making it easier for people and goods to move around the valley.',
];

const T4 = [
  'Noise is one of the most common forms of pollution in modern cities, yet it often receives less attention than polluted air or water. Traffic, aircraft, building work and loud music can all raise noise levels far above what is comfortable.',
  'Long-term exposure to noise can harm health. It can disturb sleep, increase stress and, according to some studies, raise the risk of heart disease. Children who go to school near busy airports have been found to have more difficulty with reading.',
  'Cities have tried various ways to reduce noise. Some have introduced lower speed limits at night, built walls along motorways and encouraged the use of quieter road surfaces. Electric buses, which are much quieter than diesel buses, are also helping in some places.',
  'Trees and parks can help too, although their effect on noise levels is often smaller than people imagine. Perhaps their greatest value is that they offer residents quiet places where they can escape the noise for a while and recover from the stress of city life.',
];

const T5 = [
  'Public trust in science is often described as being in crisis. Commentators point to disputes over vaccines, climate change and nutrition as evidence that large numbers of people no longer believe what scientists tell them. Surveys, however, present a more nuanced picture: in many countries, scientists remain among the most trusted professional groups, considerably ahead of politicians and journalists.',
  'Where distrust exists, it is often not a rejection of science as a whole but of particular findings that conflict with a person’s values, identity or interests. Someone may accept the science behind modern medicine while doubting research on climate change, especially if the policies associated with that research threaten their job or way of life.',
  'Scientists themselves may sometimes contribute to the problem. When early results are presented with too much confidence and are later revised, members of the public may conclude that scientists cannot make up their minds. Yet changing conclusions in the light of new evidence is precisely how science is supposed to work; the difficulty lies in communicating uncertainty honestly without appearing unreliable.',
  'Researchers who study science communication suggest several ways to build trust. Explaining not only what scientists know but how they know it, being open about uncertainty and listening to people’s concerns rather than simply correcting them all appear to help. Trust, they argue, is built slowly through relationships, and it cannot be demanded.',
];

const H3 = [
  'i. Water shared by rules',
  'ii. A region of many crafts',
  'iii. A green valley between mountains',
  'iv. New crops and better connections',
  'v. A crop with hidden costs',
  'vi. Tourism replaces farming',
  'vii. Complicated borders',
];

export const cefrReading8: ReadingTest = {
  id: 'cefr-reading-8',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 8',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Taking a gap year (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The Ferghana Valley (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Noise in the city (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Trust in science (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Why will buses not stop at the theatre?', options: ['The theatre is closed.', 'There are road works.', 'The timetable has changed.'], answer: 1, evidence: 'Text 1: "Because of road works on Navoi Street".' },
    { id: 2, type: 'mcq', text: 'Where should passengers wait for the bus?', options: ['Outside the post office', 'Opposite the theatre', 'At the next street'], answer: 0, evidence: 'Text 1: "use the temporary stop outside the post office".' },
    { id: 3, type: 'mcq', text: 'Why does Shahlo need answers by Wednesday?', options: ['The restaurant closes on Thursday.', 'She is going away.', 'To tell the restaurant how many people are coming'], answer: 2, evidence: 'Text 2: "so I can tell the restaurant how many people to expect".' },
    { id: 4, type: 'mcq', text: 'Who can come to the reunion?', options: ['Only former classmates', 'Former classmates and their partners', 'Anyone who pays'], answer: 1, evidence: 'Text 2: "Partners are welcome too."' },
    { id: 5, type: 'mcq', text: 'When is the bookshop job?', options: ['At weekends', 'Every evening', 'On weekdays'], answer: 0, evidence: 'Text 3: "on Saturdays and Sundays".' },
    { id: 6, type: 'mcq', text: 'What is necessary for the job?', options: ['Previous experience', 'Good English', 'Enjoying reading'], answer: 2, evidence: 'Text 3: "Experience is not necessary, but you must enjoy reading".' },
    { id: 7, type: 'tfng', text: 'A gap year is taken between school and university.', answer: 'True', evidence: 'Part 2: "between finishing school and starting university".' },
    { id: 8, type: 'tfng', text: 'All gap year students travel abroad.', answer: 'False', evidence: 'Part 2: "some work to save money, while others travel, volunteer or learn new skills".' },
    { id: 9, type: 'tfng', text: 'Supporters say gap years can help young people become more independent.', answer: 'True', evidence: 'Part 2: "help young people to become more independent and confident".' },
    { id: 10, type: 'tfng', text: 'Students who take a gap year get higher marks at university.', answer: 'Not Given', evidence: 'Part 2 does not mention university marks.' },
    { id: 11, type: 'tfng', text: 'Some students decided what to study during their gap year.', answer: 'True', evidence: 'Part 2: "a gap year helped them to decide what they really wanted to study".' },
    { id: 12, type: 'tfng', text: 'Some parents fear their children will lose the habit of studying.', answer: 'True', evidence: 'Part 2: "their children will lose the habit of studying".' },
    { id: 13, type: 'tfng', text: 'Gap years are available to everyone because they are cheap.', answer: 'False', evidence: 'Part 2: "Travelling abroad can also be expensive, so gap years are not available to everyone."' },
    { id: 14, type: 'tfng', text: 'Programmes in the student’s own country are run by universities.', answer: 'Not Given', evidence: 'Part 2 says "some organisations" offer them, without saying which.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 2, evidence: 'Part 3 A: "surrounded by mountains, is one of the most fertile".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 6, evidence: 'Part 3 B: "The borders between them are long and complicated".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 1, evidence: 'Part 3 C: "The towns of the valley are famous for their crafts."' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 0, evidence: 'Part 3 D: water "managed by local communities according to strict rules".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 4, evidence: 'Part 3 E: cotton "brought income but also problems".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 3, evidence: 'Part 3 F: "a wider range of crops" and "new roads and border crossings".' },
    { id: 21, type: 'fill', text: 'Noise often receives less ______ than polluted air or water.', answers: ['attention'], evidence: 'Part 4: "it often receives less attention than polluted air or water".' },
    { id: 22, type: 'fill', text: 'Long-term exposure to noise can disturb ______.', answers: ['sleep'], evidence: 'Part 4: "It can disturb sleep".' },
    { id: 23, type: 'fill', text: 'Some studies say noise raises the risk of ______ disease.', answers: ['heart'], evidence: 'Part 4: "raise the risk of heart disease".' },
    { id: 24, type: 'fill', text: 'Children at schools near busy airports have more difficulty with ______.', answers: ['reading'], evidence: 'Part 4: "have more difficulty with reading".' },
    { id: 25, type: 'fill', text: 'Some cities have introduced lower speed ______ at night.', answers: ['limits'], evidence: 'Part 4: "lower speed limits at night".' },
    { id: 26, type: 'fill', text: 'Some cities have built ______ along motorways.', answers: ['walls'], evidence: 'Part 4: "built walls along motorways".' },
    { id: 27, type: 'fill', text: 'Electric buses are much ______ than diesel buses.', answers: ['quieter'], evidence: 'Part 4: "much quieter than diesel buses".' },
    { id: 28, type: 'fill', text: 'Parks offer residents quiet places where they can ______ the noise.', answers: ['escape'], evidence: 'Part 4: "where they can escape the noise for a while".' },
    { id: 29, type: 'mcq', text: 'What do surveys show about trust in scientists?', options: ['Scientists are trusted less than politicians.', 'Trust in scientists has disappeared.', 'Scientists remain among the most trusted groups.', 'Only young people trust scientists.'], answer: 2, evidence: 'Part 5: "scientists remain among the most trusted professional groups".' },
    { id: 30, type: 'mcq', text: 'According to paragraph 2, distrust is often directed at', options: ['science as a whole.', 'particular findings that conflict with a person’s values.', 'modern medicine.', 'scientists from other countries.'], answer: 1, evidence: 'Part 5: "not a rejection of science as a whole but of particular findings that conflict with a person’s values".' },
    { id: 31, type: 'mcq', text: 'Why might someone doubt climate research while accepting medicine?', options: ['Climate research is newer.', 'The related policies may threaten their job or way of life.', 'Medicine is easier to understand.', 'Doctors are more friendly.'], answer: 1, evidence: 'Part 5: "especially if the policies associated with that research threaten their job or way of life".' },
    { id: 32, type: 'mcq', text: 'How may scientists contribute to the problem?', options: ['By refusing to speak to journalists', 'By presenting early results with too much confidence', 'By working too slowly', 'By hiding their data'], answer: 1, evidence: 'Part 5: "When early results are presented with too much confidence and are later revised".' },
    { id: 33, type: 'mcq', text: 'What does the writer say about changing conclusions?', options: ['It shows science is unreliable.', 'It should be avoided.', 'It happens only in nutrition.', 'It is how science is supposed to work.'], answer: 3, evidence: 'Part 5: "changing conclusions in the light of new evidence is precisely how science is supposed to work".' },
    { id: 34, type: 'mcq', text: 'Which of these is suggested as a way to build trust?', options: ['Being open about uncertainty', 'Correcting people more often', 'Publishing fewer studies', 'Avoiding difficult topics'], answer: 0, evidence: 'Part 5: "being open about uncertainty and listening to people’s concerns".' },
    { id: 35, type: 'mcq', text: 'What is the main point of the final paragraph?', options: ['Trust can be created quickly with good advertising.', 'Trust is built slowly and cannot be demanded.', 'People should trust scientists without question.', 'Science communication is not important.'], answer: 1, evidence: 'Part 5: "Trust, they argue, is built slowly through relationships, and it cannot be demanded."' },
  ],
};
