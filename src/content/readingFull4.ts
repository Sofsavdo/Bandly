import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. Few substances have shaped human history as much as salt. The body needs it to function, and before refrigeration it was the most important way of preserving food. Meat and fish packed in salt could be stored for months and carried on long journeys, which made salt essential for armies, sailors and traders. For this reason, places where salt could be obtained easily often became centres of wealth and power.',
  'B. Salt was produced in two main ways. In warm coastal areas, seawater was let into shallow ponds, where the sun and wind evaporated the water and left a layer of salt behind. Inland, salt was dug from underground deposits, the remains of ancient seas that had dried up millions of years earlier. In some regions, people also boiled water from salty springs in large pans over wood fires, a method that used enormous quantities of fuel.',
  'C. Because salt was valuable and could not be produced everywhere, it was traded over long distances. Across the Sahara, camel caravans carried slabs of salt southwards and returned with gold, and in some markets the two were said to be exchanged weight for weight. In Europe, roads used for transporting salt became important trade routes, and several towns grew wealthy by charging tolls on the salt that passed through them.',
  'D. Rulers soon realised that salt could be taxed. Everyone needed it, so a tax on salt was easy to collect and difficult to avoid. In ancient China, the state controlled the production and sale of salt for long periods, and the income helped to pay for armies and public works. In France, a hated salt tax called the gabelle was in force for centuries and became one of the grievances behind the revolution of 1789.',
  'E. Resistance to salt taxes could have political consequences far beyond the economy. In 1930, Mahatma Gandhi led a march of about 385 kilometres to the sea at Dandi to protest against the British tax on salt in India. When he picked up a handful of natural salt from the shore, he broke the law in a way that everyone could understand. The protest attracted attention around the world and became an important moment in the movement for Indian independence.',
  'F. Today, salt is cheap and plentiful, and most of it is not eaten at all. The greater part of world production is used by the chemical industry and for clearing ice from roads in winter. In many countries, health authorities now warn that people eat too much salt, much of it hidden in bread, processed meat and ready meals, and they encourage manufacturers to reduce the amount they add.',
];

const P2 = [
  'A. Foxes are among the most adaptable of all wild mammals. Originally animals of woodland and open country, red foxes began to appear in British cities in significant numbers in the 1930s, when new suburbs with large gardens spread across the edges of towns. These areas offered shelter, plenty of food and relatively few dangers, and foxes have since become a familiar sight in many cities in Europe, North America and Australia.',
  'B. City foxes eat a remarkably varied diet. Studies that examined the contents of their stomachs found that a large part of their food is provided, directly or indirectly, by people: scraps left out by residents, food taken from bins and meat put out deliberately for them. They also catch rats, mice and birds, and they eat earthworms, insects and fruit. This flexibility is one of the main reasons for their success.',
  'C. Urban foxes usually live in family groups that share a territory. A group typically consists of a breeding pair and their cubs, sometimes together with one or two adults from earlier litters that help to look after the young. In cities, territories tend to be much smaller than in the countryside because food is concentrated in a smaller area. Researchers using radio collars have found that some urban foxes rarely travel more than a kilometre from the place where they rest during the day.',
  'D. The relationship between foxes and city residents is mixed. Many people enjoy seeing them and some put out food every night. Others complain about noise, damage to gardens and the smell of the animals’ dens, and occasionally there are calls for foxes to be removed. However, experts point out that removing foxes from an area is rarely effective for long, because animals from neighbouring territories quickly move into the empty space.',
  'E. Living in cities appears to have changed foxes in some ways. Studies comparing urban and rural populations have found that city foxes tend to be bolder, approaching people and unfamiliar objects more readily. Some researchers have also reported small differences in the shape of the skull, which may be connected with a diet that requires less hunting. Whether these differences are the result of genetic change or of learning during each animal’s lifetime is not yet clear.',
  'F. Road traffic is the main cause of death for urban foxes, and the average fox in a city lives for only about two years, although individuals can survive much longer in captivity. Disease also plays a part: outbreaks of mange, a skin condition caused by tiny mites, have at times reduced fox numbers dramatically in some cities. Despite these dangers, urban populations have generally recovered, a sign of how well foxes have adapted to life among humans.',
];

const P3 = [
  'A. For most of the twentieth century, the success of a national economy was judged mainly by one figure: gross domestic product, or GDP, the total value of goods and services produced in a country. GDP was developed in the 1930s to help governments understand the economy during the Great Depression, and it remains extremely useful for that purpose. Yet even one of its early designers, the economist Simon Kuznets, warned that it was not a measure of welfare.',
  'B. Critics point out that GDP counts activity, not well-being. A traffic accident increases GDP because it creates spending on repairs and medical care, while unpaid work such as caring for children or elderly relatives does not count at all. GDP also says nothing about how income is distributed, so it can rise even when most people’s lives are not improving. Nor does it take into account the damage done to the environment by economic activity.',
  'C. In response, researchers have tried to measure well-being more directly. One approach is simply to ask people how satisfied they are with their lives, usually on a scale from zero to ten. Surveys of this kind are now carried out in many countries, and they produce surprisingly consistent results. People who are unemployed, lonely or in poor health report lower satisfaction, while those with strong relationships and a sense of purpose report higher levels.',
  'D. One much-discussed finding concerns the link between income and happiness. Within a country at any given time, richer people tend to report higher life satisfaction than poorer people. Yet in some countries, average satisfaction changed little over decades during which average income rose considerably. One explanation is that people compare themselves with others, so that when everyone becomes richer, no one feels much better off. This puzzle is often called the Easterlin paradox, after the economist who first described it in 1974.',
  'E. Several governments now publish measures of well-being alongside GDP. Bhutan has long promoted the idea of Gross National Happiness, and New Zealand introduced a well-being budget in 2019, requiring new spending to be justified in terms of its effect on areas such as mental health and child poverty. In the United Kingdom, the national statistics office has asked questions about life satisfaction in its regular surveys since 2011.',
  'F. Sceptics doubt that such measures can guide policy. People’s answers may depend on their mood on the day of the survey or on cultural differences in how willing they are to describe themselves as happy. There is also a risk that governments might focus on improving the scores rather than people’s actual lives. Supporters accept that the measures are imperfect, but they argue that a single number like GDP has never been an adequate guide either, and that a wider set of indicators gives a more honest picture of how a country is doing.',
];

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
const H2 = [
  'i. How foxes came to the city',
  'ii. A diet that depends on people',
  'iii. Why foxes avoid people',
  'iv. Small territories and family life',
  'v. Opinions divided among residents',
  'vi. Possible changes in behaviour and body',
  'vii. Threats to survival',
  'viii. Plans to move foxes back to the countryside',
];

export const readingFull4: ReadingTest = {
  id: 'reading-full-4',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 4',
  minutes: 60,
  passageTitle: 'Reading Passage 1: The Value of Salt',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: The Value of Salt' },
    { at: P1.length, title: 'Reading Passage 2: Foxes in the City' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: Beyond GDP' },
  ],
  groups: [
    { instruction: 'Questions 1–6 (Passage 1): Which paragraph, A–F, contains the following information? Choose the correct letter.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–13 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–26 (Passage 2): Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [20, 21, 22, 23, 24, 25, 26] },
    { instruction: 'Questions 27–31 (Passage 3): Choose the correct letter.', questionIds: [27, 28, 29, 30, 31] },
    { instruction: 'Questions 32–36 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [32, 33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'match', text: 'a protest that gained international attention', options: LETTERS, answer: 4, evidence: 'P1 E: "The protest attracted attention around the world".' },
    { id: 2, type: 'match', text: 'a method of production that required a lot of fuel', options: LETTERS, answer: 1, evidence: 'P1 B: boiling salty water "used enormous quantities of fuel".' },
    { id: 3, type: 'match', text: 'the main modern uses of salt', options: LETTERS, answer: 5, evidence: 'P1 F: most salt "is used by the chemical industry and for clearing ice from roads".' },
    { id: 4, type: 'match', text: 'why salt was important before modern food storage', options: LETTERS, answer: 0, evidence: 'P1 A: "before refrigeration it was the most important way of preserving food".' },
    { id: 5, type: 'match', text: 'towns that profited from salt passing through them', options: LETTERS, answer: 2, evidence: 'P1 C: "several towns grew wealthy by charging tolls on the salt".' },
    { id: 6, type: 'match', text: 'a tax that contributed to a revolution', options: LETTERS, answer: 3, evidence: 'P1 D: the gabelle "became one of the grievances behind the revolution of 1789".' },
    { id: 7, type: 'tfng', text: 'Underground salt deposits were formed from ancient seas.', answer: 'True', evidence: 'P1 B: deposits are "the remains of ancient seas that had dried up".' },
    { id: 8, type: 'tfng', text: 'Salt and gold were sometimes exchanged in equal weights.', answer: 'True', evidence: 'P1 C: "the two were said to be exchanged weight for weight".' },
    { id: 9, type: 'tfng', text: 'A tax on salt was difficult for people to avoid.', answer: 'True', evidence: 'P1 D: a tax on salt "was easy to collect and difficult to avoid".' },
    { id: 10, type: 'tfng', text: 'In ancient China, income from salt helped to pay for armies.', answer: 'True', evidence: 'P1 D: "the income helped to pay for armies and public works".' },
    { id: 11, type: 'tfng', text: 'Gandhi’s march lasted more than three weeks.', answer: 'Not Given', evidence: 'P1 E gives the distance (about 385 kilometres) but not how long the march lasted.' },
    { id: 12, type: 'tfng', text: 'Most salt produced today is used in food.', answer: 'False', evidence: 'P1 F: "most of it is not eaten at all".' },
    { id: 13, type: 'tfng', text: 'Health authorities want manufacturers to add more salt to food.', answer: 'False', evidence: 'P1 F: they "encourage manufacturers to reduce the amount they add".' },
    // Passage 2
    { id: 14, type: 'match', text: 'Paragraph A', options: H2, answer: 0, evidence: 'P2 A: foxes "began to appear in British cities … in the 1930s".' },
    { id: 15, type: 'match', text: 'Paragraph B', options: H2, answer: 1, evidence: 'P2 B: "a large part of their food is provided, directly or indirectly, by people".' },
    { id: 16, type: 'match', text: 'Paragraph C', options: H2, answer: 3, evidence: 'P2 C: family groups; "territories tend to be much smaller than in the countryside".' },
    { id: 17, type: 'match', text: 'Paragraph D', options: H2, answer: 4, evidence: 'P2 D: "The relationship between foxes and city residents is mixed."' },
    { id: 18, type: 'match', text: 'Paragraph E', options: H2, answer: 5, evidence: 'P2 E: city foxes "tend to be bolder" and there may be differences "in the shape of the skull".' },
    { id: 19, type: 'match', text: 'Paragraph F', options: H2, answer: 6, evidence: 'P2 F: traffic and disease as causes of death.' },
    { id: 20, type: 'fill', text: 'Foxes first moved into new ______ with large gardens.', answers: ['suburbs'], evidence: 'P2 A: "new suburbs with large gardens".' },
    { id: 21, type: 'fill', text: 'Scientists studied the contents of foxes’ ______ to learn about their diet.', answers: ['stomachs'], evidence: 'P2 B: "examined the contents of their stomachs".' },
    { id: 22, type: 'fill', text: 'Some groups include adults from earlier ______ that help with the young.', answers: ['litters'], evidence: 'P2 C: "adults from earlier litters that help to look after the young".' },
    { id: 23, type: 'fill', text: 'Researchers tracked foxes using ______.', answers: ['radio collars'], evidence: 'P2 C: "Researchers using radio collars".' },
    { id: 24, type: 'fill', text: 'Removing foxes rarely works because animals from ______ move in.', answers: ['neighbouring territories'], evidence: 'P2 D: "animals from neighbouring territories quickly move into the empty space".' },
    { id: 25, type: 'fill', text: 'The main cause of death for urban foxes is ______.', answers: ['road traffic'], evidence: 'P2 F: "Road traffic is the main cause of death".' },
    { id: 26, type: 'fill', text: 'Mange is a skin condition caused by tiny ______.', answers: ['mites'], evidence: 'P2 F: "a skin condition caused by tiny mites".' },
    // Passage 3
    { id: 27, type: 'mcq', text: 'Why was GDP originally developed?', options: ['To measure happiness', 'To help governments understand the economy during the Depression', 'To compare countries’ health systems', 'To calculate taxes'], answer: 1, evidence: 'P3 A: GDP was developed "to help governments understand the economy during the Great Depression".' },
    { id: 28, type: 'mcq', text: 'What does the example of a traffic accident show?', options: ['GDP counts activity rather than well-being.', 'Accidents are becoming more common.', 'Medical care is expensive.', 'GDP ignores transport.'], answer: 0, evidence: 'P3 B: "GDP counts activity, not well-being. A traffic accident increases GDP".' },
    { id: 29, type: 'mcq', text: 'Which group reports higher life satisfaction?', options: ['People who are unemployed', 'People who are lonely', 'People with strong relationships', 'People in poor health'], answer: 2, evidence: 'P3 C: "those with strong relationships and a sense of purpose report higher levels".' },
    { id: 30, type: 'mcq', text: 'What is one explanation of the Easterlin paradox?', options: ['Surveys are inaccurate.', 'People compare themselves with others.', 'Income did not really rise.', 'Rich people are less honest.'], answer: 1, evidence: 'P3 D: "people compare themselves with others".' },
    { id: 31, type: 'mcq', text: 'What concern do sceptics raise?', options: ['Well-being measures are too expensive.', 'Governments might improve scores rather than lives.', 'Nobody answers the surveys.', 'GDP will disappear.'], answer: 1, evidence: 'P3 F: "governments might focus on improving the scores rather than people’s actual lives".' },
    { id: 32, type: 'tfng', text: 'Simon Kuznets believed GDP measured welfare accurately.', answer: 'False', evidence: 'P3 A: Kuznets "warned that it was not a measure of welfare".' },
    { id: 33, type: 'tfng', text: 'Caring for elderly relatives without pay is included in GDP.', answer: 'False', evidence: 'P3 B: unpaid work such as caring for relatives "does not count at all".' },
    { id: 34, type: 'tfng', text: 'Life-satisfaction surveys give fairly consistent results.', answer: 'True', evidence: 'P3 C: "they produce surprisingly consistent results".' },
    { id: 35, type: 'tfng', text: 'New Zealand’s well-being budget reduced child poverty within two years.', answer: 'Not Given', evidence: 'P3 E describes the budget but gives no results.' },
    { id: 36, type: 'tfng', text: 'Supporters of well-being measures admit that they are imperfect.', answer: 'True', evidence: 'P3 F: "Supporters accept that the measures are imperfect".' },
    { id: 37, type: 'fill', text: 'GDP says nothing about how income is ______.', answers: ['distributed'], evidence: 'P3 B: "GDP also says nothing about how income is distributed".' },
    { id: 38, type: 'fill', text: 'Surveys usually ask people to rate their satisfaction on a ______ from zero to ten.', answers: ['scale'], evidence: 'P3 C: "usually on a scale from zero to ten".' },
    { id: 39, type: 'fill', text: 'Bhutan has promoted the idea of Gross National ______.', answers: ['happiness'], evidence: 'P3 E: "Bhutan has long promoted the idea of Gross National Happiness".' },
    { id: 40, type: 'fill', text: 'Survey answers may depend on people’s ______ on the day.', answers: ['mood'], evidence: 'P3 F: "People’s answers may depend on their mood on the day of the survey".' },
  ],
};
