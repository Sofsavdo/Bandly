import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 3: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Lost property: A black mobile phone was found in Room 204 on Tuesday afternoon. If it is yours, please collect it from the reception desk on the ground floor. You will need to tell us the colour of the phone case.',
  '2) MESSAGE — Hi Dilnoza, I can’t meet you at the cinema at 7 because my train is late. Could we see the 9 o’clock film instead? I’ve already bought the tickets online, so you don’t need to queue. See you at the entrance. Kamola',
  '3) ADVERTISEMENT — City Museum: free entry on the first Sunday of every month. Guided tours in English start at 11 am and 2 pm and last about an hour. Photography is allowed, but please do not use flash in the painting galleries.',
];

const T2 = [
  'Volunteering means giving your time to help others without being paid. People volunteer in many ways: some help in hospitals or schools, some clean parks and rivers, and others support older people who live alone. In recent years, the number of young volunteers has grown in many countries.',
  'Volunteers often say that they get as much from the experience as the people they help. They meet new friends, learn practical skills and feel more connected to their community. For students, volunteering can also be useful when applying for a job, because employers value experience of teamwork and responsibility.',
  'However, organisations that use volunteers face some difficulties. Many people are keen at the start but stop coming after a few weeks. To keep volunteers, successful organisations give them clear tasks, thank them regularly and offer short training sessions. Some also let volunteers choose the hours that suit them best.',
];

const T3 = [
  'A. Bees are among the most important insects on Earth. By carrying pollen from one flower to another, they help plants to produce fruit and seeds. A large part of the food we eat, from apples to almonds, depends at least partly on this work.',
  'B. Honeybees live in highly organised colonies. Each colony has a single queen, which lays the eggs, and thousands of female workers, which collect food, build the wax cells and look after the young. Male bees have only one role: to mate with a queen.',
  'C. When a worker bee finds a good source of food, she returns to the hive and performs a “dance”. The direction and length of the dance tell other bees where the flowers are and how far away they are.',
  'D. In many parts of the world, the number of bees has fallen sharply. Scientists believe there are several causes, including the loss of wild flowers, the use of certain chemicals on farms, diseases and changes in the climate.',
  'E. Farmers and governments have started to respond. Some farmers now leave strips of wild flowers at the edges of their fields, and several countries have limited the use of chemicals that are particularly harmful to bees.',
  'F. Ordinary people can help too. Planting flowers in gardens and on balconies, avoiding garden chemicals and buying honey from local beekeepers are all small steps that, taken together, can make a difference.',
];

const T4 = [
  'Fast fashion is the name given to clothes that are designed, produced and sold very quickly and at low prices. Instead of two collections a year, some shops now introduce new styles every week, encouraging customers to buy more often.',
  'The low prices have a hidden cost. Producing clothes uses large amounts of water and energy, and many cheap garments are made from synthetic materials that are produced from oil. When these clothes are washed, tiny plastic fibres can enter rivers and the sea.',
  'Another problem is waste. Because cheap clothes are often of poor quality, they wear out quickly, and many are thrown away after being worn only a few times. Most of these clothes end up in landfill, where they may take many years to break down.',
  'Some consumers are changing their habits. Second-hand clothes shops and online platforms for swapping clothes have become more popular, especially among young people. Others are learning to repair their clothes instead of replacing them, and some brands now offer to take back old garments for recycling.',
];

const T5 = [
  'Does money make people happy? For most of the twentieth century, economists assumed that the answer was simply yes: the more people earned, the better off they were. When researchers began to ask people directly how satisfied they were with their lives, however, the picture turned out to be more complicated.',
  'Surveys consistently show that, within a country, richer people report higher life satisfaction than poorer people. The effect is strongest at lower incomes, where extra money pays for basic needs such as food, housing and health care. At higher incomes, each additional amount of money seems to bring a smaller increase in satisfaction.',
  'One explanation is that people judge their situation by comparing themselves with others. If everyone’s income rises at the same rate, nobody feels richer than their neighbours, and satisfaction may change very little. Another explanation is adaptation: people quickly get used to a higher standard of living, so that a new car or a bigger house soon stops giving pleasure.',
  'Some researchers suggest that how people spend money matters as much as how much they have. Spending on experiences, such as travel or concerts, appears to produce longer-lasting satisfaction than spending on objects, and spending on other people — buying gifts or giving to charity — often makes the giver happier than spending on themselves.',
];

const H3 = [
  'i. How information about food is shared',
  'ii. Action taken by farmers and governments',
  'iii. Why bees sting',
  'iv. The value of bees to food production',
  'v. Simple things everyone can do',
  'vi. A society with different roles',
  'vii. Possible reasons for a decline',
];

export const cefrReading3: ReadingTest = {
  id: 'cefr-reading-3',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 3',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Volunteering (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: Bees (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Fast fashion (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Money and happiness (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Where can the owner collect the phone?', options: ['In Room 204', 'At the reception desk', 'At the lost property office'], answer: 1, evidence: 'Text 1: "please collect it from the reception desk on the ground floor".' },
    { id: 2, type: 'mcq', text: 'What must the owner say to get the phone back?', options: ['The colour of the case', 'The phone number', 'The time they lost it'], answer: 0, evidence: 'Text 1: "You will need to tell us the colour of the phone case."' },
    { id: 3, type: 'mcq', text: 'Why does Kamola want to change the time?', options: ['The cinema is full.', 'She has not bought tickets.', 'Her train is late.'], answer: 2, evidence: 'Text 2: "because my train is late".' },
    { id: 4, type: 'mcq', text: 'Why doesn’t Dilnoza need to queue?', options: ['The tickets were bought online.', 'The film starts late.', 'The cinema is empty on weekdays.'], answer: 0, evidence: 'Text 2: "I’ve already bought the tickets online, so you don’t need to queue."' },
    { id: 5, type: 'mcq', text: 'When is entry to the museum free?', options: ['Every Sunday', 'On the first Sunday of the month', 'During guided tours'], answer: 1, evidence: 'Text 3: "free entry on the first Sunday of every month".' },
    { id: 6, type: 'mcq', text: 'What is NOT allowed in the painting galleries?', options: ['Taking photographs', 'Joining a tour', 'Using flash'], answer: 2, evidence: 'Text 3: "please do not use flash in the painting galleries".' },
    { id: 7, type: 'tfng', text: 'Volunteers are not paid for their work.', answer: 'True', evidence: 'Part 2: "giving your time to help others without being paid".' },
    { id: 8, type: 'tfng', text: 'The number of young volunteers has fallen in many countries.', answer: 'False', evidence: 'Part 2: "the number of young volunteers has grown in many countries".' },
    { id: 9, type: 'tfng', text: 'Most volunteers work in hospitals.', answer: 'Not Given', evidence: 'Part 2 lists hospitals as one option but gives no figures.' },
    { id: 10, type: 'tfng', text: 'Volunteers often feel they gain from the experience.', answer: 'True', evidence: 'Part 2: "they get as much from the experience as the people they help".' },
    { id: 11, type: 'tfng', text: 'Employers value experience of teamwork.', answer: 'True', evidence: 'Part 2: "employers value experience of teamwork and responsibility".' },
    { id: 12, type: 'tfng', text: 'Most people continue volunteering for many years.', answer: 'False', evidence: 'Part 2: "Many people are keen at the start but stop coming after a few weeks."' },
    { id: 13, type: 'tfng', text: 'Successful organisations pay volunteers a small amount of money.', answer: 'False', evidence: 'Part 2: they "give them clear tasks, thank them regularly and offer short training sessions"; volunteers are "without being paid".' },
    { id: 14, type: 'tfng', text: 'Volunteers who choose their own hours stay longer than other volunteers.', answer: 'Not Given', evidence: 'Part 2 says some organisations let volunteers choose their hours but does not compare how long they stay.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 3, evidence: 'Part 3 A: "A large part of the food we eat … depends at least partly on this work."' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 5, evidence: 'Part 3 B: queen, workers and males each have a role.' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 0, evidence: 'Part 3 C: the dance tells "other bees where the flowers are".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 6, evidence: 'Part 3 D: "Scientists believe there are several causes".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 1, evidence: 'Part 3 E: "Farmers and governments have started to respond."' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 4, evidence: 'Part 3 F: "Ordinary people can help too."' },
    { id: 21, type: 'fill', text: 'Some shops introduce new styles every ______.', answers: ['week'], evidence: 'Part 4: "some shops now introduce new styles every week".' },
    { id: 22, type: 'fill', text: 'Producing clothes uses large amounts of water and ______.', answers: ['energy'], evidence: 'Part 4: "uses large amounts of water and energy".' },
    { id: 23, type: 'fill', text: 'Many synthetic materials are produced from ______.', answers: ['oil'], evidence: 'Part 4: "synthetic materials that are produced from oil".' },
    { id: 24, type: 'fill', text: 'When synthetic clothes are washed, tiny plastic ______ can enter rivers.', answers: ['fibres', 'fibers'], evidence: 'Part 4: "tiny plastic fibres can enter rivers and the sea".' },
    { id: 25, type: 'fill', text: 'Cheap clothes are often of poor ______.', answers: ['quality'], evidence: 'Part 4: "cheap clothes are often of poor quality".' },
    { id: 26, type: 'fill', text: 'Most thrown-away clothes end up in ______.', answers: ['landfill'], evidence: 'Part 4: "Most of these clothes end up in landfill".' },
    { id: 27, type: 'fill', text: 'Some people are learning to ______ their clothes instead of replacing them.', answers: ['repair'], evidence: 'Part 4: "learning to repair their clothes instead of replacing them".' },
    { id: 28, type: 'fill', text: 'Some brands take back old garments for ______.', answers: ['recycling'], evidence: 'Part 4: "take back old garments for recycling".' },
    { id: 29, type: 'mcq', text: 'What did economists assume for most of the twentieth century?', options: ['Money has no effect on happiness.', 'Higher income always makes people better off.', 'Happiness cannot be measured.', 'Poor people are happier than rich people.'], answer: 1, evidence: 'Part 5: "the more people earned, the better off they were".' },
    { id: 30, type: 'mcq', text: 'What happened when researchers asked people directly about their lives?', options: ['The results confirmed the old view exactly.', 'Most people refused to answer.', 'The picture became more complicated.', 'Economists stopped studying income.'], answer: 2, evidence: 'Part 5: "the picture turned out to be more complicated".' },
    { id: 31, type: 'mcq', text: 'Where is the effect of money on satisfaction strongest?', options: ['At lower incomes', 'At higher incomes', 'In richer countries', 'Among older people'], answer: 0, evidence: 'Part 5: "The effect is strongest at lower incomes".' },
    { id: 32, type: 'mcq', text: 'If everyone’s income rises at the same rate, satisfaction may', options: ['fall sharply.', 'rise very quickly.', 'depend on age.', 'change very little.'], answer: 3, evidence: 'Part 5: "satisfaction may change very little".' },
    { id: 33, type: 'mcq', text: 'What does “adaptation” mean in paragraph 3?', options: ['Moving to a richer area', 'Getting used to a higher standard of living', 'Comparing yourself with neighbours', 'Saving money for the future'], answer: 1, evidence: 'Part 5: "people quickly get used to a higher standard of living".' },
    { id: 34, type: 'mcq', text: 'Which kind of spending appears to give longer-lasting satisfaction?', options: ['Spending on cars', 'Spending on houses', 'Spending on experiences', 'Spending on clothes'], answer: 2, evidence: 'Part 5: "Spending on experiences … appears to produce longer-lasting satisfaction".' },
    { id: 35, type: 'mcq', text: 'According to the text, spending on other people often', options: ['makes the giver happier.', 'causes financial problems.', 'is less satisfying than buying objects.', 'is only possible for the rich.'], answer: 0, evidence: 'Part 5: "often makes the giver happier than spending on themselves".' },
  ],
};
