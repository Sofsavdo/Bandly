import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. Maps are among the oldest forms of human communication. A clay tablet found in Iraq, made around 600 BC, shows the world as a flat disc surrounded by a ring of water, with the city of Babylon near its centre. Such early maps were not intended to be accurate guides for travellers. They expressed how people understood their place in the world, mixing geography with religion and myth.',
  'B. The ancient Greeks took a more scientific approach. In the third century BC, the scholar Eratosthenes, working in Alexandria, estimated the circumference of the Earth by comparing the angle of the sun’s rays in two cities at the same time of year. His result was remarkably close to the true figure. Later, the astronomer Ptolemy described how to represent the curved surface of the Earth on a flat surface and listed the positions of thousands of places using a system similar to latitude and longitude.',
  'C. During the medieval period, much of this knowledge was preserved and developed by scholars in the Islamic world. In 1154, the geographer al-Idrisi completed a large map of the known world for King Roger II of Sicily, based on the reports of travellers and merchants. It was considered the most accurate world map of its time, and, unlike most European maps today, it placed south at the top.',
  'D. The age of European ocean exploration created a demand for maps that sailors could use to plot a course. In 1569, the Flemish mapmaker Gerardus Mercator published a world map on which lines of constant compass direction appeared as straight lines. This made it extremely useful for navigation. However, the projection greatly enlarges areas far from the equator, so that Greenland appears almost as large as Africa, although Africa is in fact about fourteen times bigger.',
  'E. In the eighteenth and nineteenth centuries, governments began to survey their territories systematically. Using a method called triangulation, surveyors measured angles between distant points with great precision and calculated distances mathematically. The work was slow: the Great Trigonometrical Survey of India, which began in 1802, took several decades. One of its achievements was the first accurate measurement of the height of the world’s highest mountain.',
  'F. Today, most maps are produced digitally from aerial photographs and satellite images, and global positioning systems allow anyone with a phone to see their exact location. Yet the basic problem that Ptolemy described has not disappeared: every flat map of a round Earth involves some distortion. Mapmakers still have to choose which features — shape, area, distance or direction — to represent faithfully and which to sacrifice.',
];

const P2 = [
  'A. Along tropical and subtropical coastlines, where the land meets the sea, grow forests unlike any others. Mangroves are trees and shrubs that can survive in salty water and in mud that contains very little oxygen. They are found in more than one hundred countries, and although they cover only a small fraction of the world’s forested area, they provide a wide range of benefits to both nature and people.',
  'B. Mangroves have developed several ways of coping with their difficult environment. Many species have roots that grow above the ground, either arching out from the trunk or rising vertically from the mud like pencils. These aerial roots take in oxygen from the air. To deal with salt, some species prevent most of it from entering their roots, while others take it in and then release it through special glands on their leaves, where it can sometimes be seen as small white crystals.',
  'C. The tangled roots of mangroves provide shelter for young fish, crabs and shrimps, protecting them from larger predators. Scientists estimate that a large proportion of the fish caught in some tropical regions spend part of their lives in mangrove forests. The forests also support birds, reptiles and mammals, and in parts of Asia they are home to animals such as the fishing cat and, in the Sundarbans of India and Bangladesh, the Bengal tiger.',
  'D. Mangroves also protect people. Their dense roots reduce the energy of waves and help to protect coastal communities from storms. After the Indian Ocean tsunami of 2004, some studies reported that villages behind healthy mangrove forests suffered less damage than those where the forests had been cleared, although other factors, such as the shape of the coastline, also played a part. In addition, the roots trap sediment, which helps the land to build up and can slow erosion.',
  'E. A further benefit has attracted attention in recent years. Mangrove forests store large amounts of carbon, not only in their trees but especially in the waterlogged soil beneath them, where dead plant material decays very slowly. Per hectare, they can store several times as much carbon as many forests on land. When mangroves are destroyed, much of this carbon may be released into the atmosphere.',
  'F. Despite their value, mangroves have been cleared on a large scale, particularly to make way for shrimp farms, rice fields and coastal development. Since 1980, a significant share of the world’s mangroves has been lost, although the rate of loss has slowed in recent years. Restoration projects have had mixed results: planting large numbers of seedlings in the wrong places has often failed, and experts now emphasise restoring the natural flow of water so that mangroves can return by themselves.',
];

const P3 = [
  'A. Every wave of new technology has been accompanied by fears that machines would take away people’s jobs. In early nineteenth-century England, groups of textile workers known as Luddites broke into factories and destroyed weaving machines that threatened their livelihoods. In the 1960s, government committees in the United States studied the possibility that automation would lead to mass unemployment. In both cases, the worst fears were not realised: total employment continued to grow, although many individual workers suffered.',
  'B. Economists explain this pattern in several ways. Machines that make goods cheaper leave people with more money to spend on other things, which creates jobs elsewhere in the economy. New technologies also create entirely new kinds of work. Few people in 1980 could have imagined that millions would one day be employed in developing websites or managing social media. Finally, machines often take over particular tasks rather than whole jobs, changing what workers do rather than replacing them completely.',
  'C. The automatic teller machine, or ATM, is often cited as an example. When ATMs spread in the United States from the 1970s onwards, many people expected the number of bank tellers to fall sharply. Instead, it rose for several decades. Because ATMs reduced the cost of running a branch, banks opened more branches, and tellers spent less time handling cash and more time advising customers and selling services.',
  'D. Some researchers argue that recent developments may be different. Earlier machines mainly replaced physical work and routine tasks that followed clear rules. Advances in artificial intelligence allow computers to perform tasks that once seemed to require human judgement, such as recognising images, translating text and analysing documents. A widely discussed study published in 2013 estimated that almost half of jobs in the United States were at high risk of automation within two decades, although later studies using different methods produced much lower figures.',
  'E. Even where total employment does not fall, the effects of automation may be unequal. Research suggests that in recent decades, jobs requiring medium levels of skill, such as clerical and some factory work, have declined in many wealthy countries, while both highly paid professional jobs and lower-paid service jobs have grown. This process, sometimes called job polarisation, may contribute to rising inequality.',
  'F. How societies should respond is a matter of debate. Many economists emphasise education and retraining, so that workers can move into new occupations as old ones disappear. Others argue for stronger social protection, such as unemployment insurance and support for workers who change careers later in life. A smaller group supports more radical ideas, such as a basic income paid to every citizen. What most agree on is that the outcome is not determined by technology alone, but by the choices that governments, businesses and workers make.',
];

const H3 = [
  'i. An old fear that proved largely unfounded',
  'ii. Reasons why jobs are not simply lost',
  'iii. A machine that increased employment',
  'iv. Why this time might be different',
  'v. Winners and losers in the labour market',
  'vi. Policies for a changing world of work',
  'vii. The end of the factory',
  'viii. How computers learn languages',
];

export const readingFull7: ReadingTest = {
  id: 'reading-full-7',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 7',
  minutes: 60,
  passageTitle: 'Reading Passage 1: Picturing the World',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: Picturing the World' },
    { at: P1.length, title: 'Reading Passage 2: Forests Between Land and Sea' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: Will Machines Take Our Jobs?' },
  ],
  groups: [
    { instruction: 'Questions 1–7 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5, 6, 7] },
    { instruction: 'Questions 8–13 (Passage 1): Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–18 (Passage 2): Choose the correct letter.', questionIds: [14, 15, 16, 17, 18] },
    { instruction: 'Questions 19–26 (Passage 2): Complete the notes. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [19, 20, 21, 22, 23, 24, 25, 26] },
    { instruction: 'Questions 27–32 (Passage 3): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [27, 28, 29, 30, 31, 32] },
    { instruction: 'Questions 33–36 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Choose the correct letter.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'tfng', text: 'The Babylonian clay map was designed to help travellers find their way.', answer: 'False', evidence: 'P1 A: "Such early maps were not intended to be accurate guides for travellers."' },
    { id: 2, type: 'tfng', text: 'Eratosthenes’ estimate of the Earth’s size was close to the real figure.', answer: 'True', evidence: 'P1 B: "His result was remarkably close to the true figure."' },
    { id: 3, type: 'tfng', text: 'Ptolemy travelled to all the places on his list.', answer: 'Not Given', evidence: 'P1 B says Ptolemy listed thousands of places but not that he visited them.' },
    { id: 4, type: 'tfng', text: 'Al-Idrisi’s map was based partly on information from merchants.', answer: 'True', evidence: 'P1 C: "based on the reports of travellers and merchants".' },
    { id: 5, type: 'tfng', text: 'Al-Idrisi’s map showed north at the top, like modern maps.', answer: 'False', evidence: 'P1 C: "it placed south at the top".' },
    { id: 6, type: 'tfng', text: 'On Mercator’s map, Greenland looks much smaller than it really is.', answer: 'False', evidence: 'P1 D: Greenland "appears almost as large as Africa", so it is enlarged, not reduced.' },
    { id: 7, type: 'tfng', text: 'Modern digital maps have solved the problem of distortion.', answer: 'False', evidence: 'P1 F: "every flat map of a round Earth involves some distortion".' },
    { id: 8, type: 'fill', text: 'Eratosthenes compared the angle of the sun’s ______ in two cities.', answers: ['rays'], evidence: 'P1 B: "comparing the angle of the sun’s rays in two cities".' },
    { id: 9, type: 'fill', text: 'Al-Idrisi made his map for a king of ______.', answers: ['sicily'], evidence: 'P1 C: "for King Roger II of Sicily".' },
    { id: 10, type: 'fill', text: 'Mercator’s map was especially useful for ______.', answers: ['navigation'], evidence: 'P1 D: "This made it extremely useful for navigation."' },
    { id: 11, type: 'fill', text: 'Africa is about fourteen times bigger than ______.', answers: ['greenland'], evidence: 'P1 D: Greenland appears almost as large as Africa, "although Africa is in fact about fourteen times bigger".' },
    { id: 12, type: 'fill', text: 'Surveyors used a method called ______ to calculate distances.', answers: ['triangulation'], evidence: 'P1 E: "Using a method called triangulation".' },
    { id: 13, type: 'fill', text: 'Today, most maps are made from aerial photographs and ______ images.', answers: ['satellite'], evidence: 'P1 F: "from aerial photographs and satellite images".' },
    // Passage 2
    { id: 14, type: 'mcq', text: 'What do the aerial roots of mangroves do?', options: ['Store salt', 'Take in oxygen from the air', 'Catch fish', 'Hold rainwater'], answer: 1, evidence: 'P2 B: "These aerial roots take in oxygen from the air."' },
    { id: 15, type: 'mcq', text: 'How do some mangrove species get rid of salt?', options: ['Through glands on their leaves', 'Through their flowers', 'By growing in fresh water', 'By shedding their roots'], answer: 0, evidence: 'P2 B: they "release it through special glands on their leaves".' },
    { id: 16, type: 'mcq', text: 'Which animal lives in the Sundarbans?', options: ['The snow leopard', 'The Bengal tiger', 'The African elephant', 'The polar bear'], answer: 1, evidence: 'P2 C: "in the Sundarbans of India and Bangladesh, the Bengal tiger".' },
    { id: 17, type: 'mcq', text: 'What does the writer say about the 2004 tsunami studies?', options: ['Mangroves made no difference.', 'Other factors also influenced the damage.', 'All villages were destroyed.', 'The studies were never published.'], answer: 1, evidence: 'P2 D: "other factors, such as the shape of the coastline, also played a part".' },
    { id: 18, type: 'mcq', text: 'What approach to restoration do experts now emphasise?', options: ['Planting as many seedlings as possible', 'Restoring the natural flow of water', 'Building sea walls', 'Moving shrimp farms inland'], answer: 1, evidence: 'P2 F: "experts now emphasise restoring the natural flow of water".' },
    { id: 19, type: 'fill', text: 'Habitat: tropical and subtropical ______', answers: ['coastlines'], evidence: 'P2 A: "Along tropical and subtropical coastlines".' },
    { id: 20, type: 'fill', text: 'Mud contains very little ______', answers: ['oxygen'], evidence: 'P2 A: "mud that contains very little oxygen".' },
    { id: 21, type: 'fill', text: 'Roots shelter young fish, crabs and ______', answers: ['shrimps'], evidence: 'P2 C: "shelter for young fish, crabs and shrimps".' },
    { id: 22, type: 'fill', text: 'Roots reduce the energy of ______', answers: ['waves'], evidence: 'P2 D: "Their dense roots reduce the energy of waves".' },
    { id: 23, type: 'fill', text: 'Roots trap ______, helping land to build up', answers: ['sediment'], evidence: 'P2 D: "the roots trap sediment".' },
    { id: 24, type: 'fill', text: 'Most carbon is stored in the ______ beneath the trees', answers: ['waterlogged soil', 'soil'], evidence: 'P2 E: "especially in the waterlogged soil beneath them".' },
    { id: 25, type: 'fill', text: 'Main cause of clearing: ______, rice fields and development', answers: ['shrimp farms'], evidence: 'P2 F: "to make way for shrimp farms, rice fields and coastal development".' },
    { id: 26, type: 'fill', text: 'Restoration has had ______ results', answers: ['mixed'], evidence: 'P2 F: "Restoration projects have had mixed results".' },
    // Passage 3
    { id: 27, type: 'match', text: 'Paragraph A', options: H3, answer: 0, evidence: 'P3 A: "In both cases, the worst fears were not realised".' },
    { id: 28, type: 'match', text: 'Paragraph B', options: H3, answer: 1, evidence: 'P3 B: "Economists explain this pattern in several ways."' },
    { id: 29, type: 'match', text: 'Paragraph C', options: H3, answer: 2, evidence: 'P3 C: the number of tellers "rose for several decades".' },
    { id: 30, type: 'match', text: 'Paragraph D', options: H3, answer: 3, evidence: 'P3 D: "Some researchers argue that recent developments may be different."' },
    { id: 31, type: 'match', text: 'Paragraph E', options: H3, answer: 4, evidence: 'P3 E: "the effects of automation may be unequal".' },
    { id: 32, type: 'match', text: 'Paragraph F', options: H3, answer: 5, evidence: 'P3 F: "How societies should respond is a matter of debate."' },
    { id: 33, type: 'tfng', text: 'The Luddites were textile workers.', answer: 'True', evidence: 'P3 A: "groups of textile workers known as Luddites".' },
    { id: 34, type: 'tfng', text: 'Total employment fell in the United States after the 1960s.', answer: 'False', evidence: 'P3 A: "total employment continued to grow".' },
    { id: 35, type: 'tfng', text: 'Bank tellers were paid more after ATMs were introduced.', answer: 'Not Given', evidence: 'P3 C describes the number and work of tellers but not their pay.' },
    { id: 36, type: 'tfng', text: 'Later studies agreed with the 2013 estimate of jobs at risk.', answer: 'False', evidence: 'P3 D: "later studies using different methods produced much lower figures".' },
    { id: 37, type: 'mcq', text: 'According to economists, machines that make goods cheaper', options: ['always reduce employment.', 'leave people more money to spend elsewhere.', 'only affect factory workers.', 'make new technology unnecessary.'], answer: 1, evidence: 'P3 B: they "leave people with more money to spend on other things".' },
    { id: 38, type: 'mcq', text: 'Why did banks open more branches?', options: ['Customers disliked ATMs.', 'ATMs reduced the cost of running a branch.', 'The government required it.', 'Tellers demanded more work.'], answer: 1, evidence: 'P3 C: "Because ATMs reduced the cost of running a branch, banks opened more branches".' },
    { id: 39, type: 'mcq', text: 'Which kind of job has declined in many wealthy countries?', options: ['Highly paid professional jobs', 'Lower-paid service jobs', 'Jobs requiring medium levels of skill', 'Jobs in website development'], answer: 2, evidence: 'P3 E: "jobs requiring medium levels of skill … have declined".' },
    { id: 40, type: 'mcq', text: 'What do most people agree on, according to the last paragraph?', options: ['A basic income is necessary.', 'Technology alone decides the outcome.', 'Choices by governments, businesses and workers shape the outcome.', 'Retraining never works.'], answer: 2, evidence: 'P3 F: the outcome is determined "by the choices that governments, businesses and workers make".' },
  ],
};
