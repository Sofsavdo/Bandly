import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 9: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: "Good afternoon, Summit Fitness. This is Maria. How can I help?" },
  { speaker: 'B', text: "Hi. I'm thinking of joining, and I'd like some information about memberships." },
  { speaker: 'A', text: 'Sure. We have two options: standard and premium. Standard gives you the gym and the swimming pool. Premium also includes all our classes and the sauna.' },
  { speaker: 'B', text: 'How much are they?' },
  { speaker: 'A', text: 'Standard is thirty-two pounds a month, and premium is forty-five.' },
  { speaker: 'B', text: "I'm mainly interested in classes, especially yoga, so I suppose premium makes more sense." },
  { speaker: 'A', text: 'Yes. We have yoga every morning at seven, and on Tuesday and Thursday evenings.' },
  { speaker: 'B', text: "Is there a contract? I might be moving abroad next year." },
  { speaker: 'A', text: "The minimum contract is three months. After that, you just give us one month's notice." },
  { speaker: 'B', text: "That's fine. Do I need to do anything before I start?" },
  { speaker: 'A', text: 'Every new member has a free induction with a trainer, which takes about forty minutes. They show you how to use the machines safely and help you set some goals.' },
  { speaker: 'B', text: 'Good idea. Could I book that now?' },
  { speaker: 'A', text: "Of course. Let me take your details first. Your name?" },
  { speaker: 'B', text: "Kevin Okafor. O, K, A, F, O, R." },
  { speaker: 'A', text: 'And your date of birth?' },
  { speaker: 'B', text: 'The second of February, nineteen ninety-five.' },
  { speaker: 'A', text: 'Do you have any injuries or health problems?' },
  { speaker: 'B', text: 'I sometimes have pain in my lower back, so I need to be careful with heavy weights.' },
  { speaker: 'A', text: "I'll let the trainer know. The first available induction is on Monday at six thirty in the evening." },
  { speaker: 'B', text: "That works. Should I bring anything?" },
  { speaker: 'A', text: 'Just sports clothes, a towel and a padlock for the lockers.' },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good morning, everyone, and welcome to the Old Town walking tour. I'm Simon, and I'll be with you for the next two hours. Before we start, a few practical things." },
  { speaker: 'B', text: "We'll be walking about three kilometres in total, mostly on cobbled streets, so please watch your step. There are a few steep hills, but we'll stop regularly, and there's a bench at almost every stop if you need a rest." },
  { speaker: 'B', text: "Our first stop is the town gate, just behind me. It was built in the thirteenth century as part of the town walls. Most of the walls were knocked down in the nineteenth century to make room for new roads, but this gate survived because local people campaigned to save it." },
  { speaker: 'B', text: "From there, we'll walk up Bridge Street to the market square. A market has been held there every Saturday for over seven hundred years, and it's still one of the best places to buy local cheese and honey." },
  { speaker: 'B', text: "Next, we'll visit St Mary's Church. Please note that the tower is closed for repairs at the moment, so we can't climb it. However, the inside of the church is open, and the painted ceiling is well worth seeing." },
  { speaker: 'B', text: "After that, we'll go down to the river, where you'll see the old mill. It's now a museum, and it still grinds flour on the first Sunday of every month. Entry isn't included in this tour, but you'll get a discount if you show your tour ticket." },
  { speaker: 'B', text: "We'll finish at the castle gardens, where there's a lovely view over the valley. The tour ends at about midday, which is a good time to try one of the cafés in Castle Lane." },
];

const PART3: L[] = [
  { speaker: 'C', text: "So, Ahmed, we need to decide on the topic for our sociology research project. Have you had any ideas?" },
  { speaker: 'D', text: "I was thinking about how teenagers use their phones at night. There's a lot in the news about it." },
  { speaker: 'C', text: "That's interesting, but it might be hard to get permission to survey teenagers. We'd need their parents to agree." },
  { speaker: 'D', text: "True. What about university students instead? We could look at how phone use affects their sleep." },
  { speaker: 'C', text: "That's easier. We can survey students here. But we need to make the question narrower. Sleep and phones is a huge topic." },
  { speaker: 'D', text: 'Maybe we could focus on first-year students living in halls of residence.' },
  { speaker: 'C', text: "Good. And I think we should use a sleep diary as well as a questionnaire. Questionnaires only tell us what people think they do." },
  { speaker: 'D', text: "A diary for how long? Students won't keep it for more than a week." },
  { speaker: 'C', text: "A week is enough, I think. We could offer a small reward, like a coffee voucher, to people who complete it." },
  { speaker: 'D', text: "OK. What about ethics? We'll need to fill in the ethics form." },
  { speaker: 'C', text: "Yes, and we must make sure the data is anonymous. No names on the diaries." },
  { speaker: 'D', text: "Right. Shall we split the work now? I'm happy to write the questionnaire." },
  { speaker: 'C', text: "Fine. I'll design the sleep diary then. And I'll fill in the ethics form, because I did one last year." },
  { speaker: 'D', text: "Thanks. Then I'll contact the halls to ask if we can put up posters." },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good afternoon. In today's lecture, I'm going to talk about the role of trees in cities, an area of research that has grown rapidly in the last twenty years." },
  { speaker: 'A', text: 'Perhaps the most obvious benefit of urban trees is shade. On a hot summer day, the temperature under a large tree can be several degrees lower than in an open street. Trees also cool the air by releasing water through their leaves.' },
  { speaker: 'A', text: 'Trees can also reduce flooding. Their roots help water to soak into the ground, and their leaves catch rain before it reaches the streets. In cities with many hard surfaces, this can make a significant difference after heavy storms.' },
  { speaker: 'A', text: 'There are economic benefits too. Studies in several countries have found that houses on streets with trees tend to sell for higher prices, and shops on tree-lined streets may attract more customers.' },
  { speaker: 'A', text: 'Researchers have also looked at the effect of trees on health. Some studies suggest that people who can see trees from their windows report lower levels of stress, and one well-known study found that hospital patients with a view of trees recovered slightly faster after surgery.' },
  { speaker: 'A', text: 'However, urban trees face many problems. Their roots have little space, the soil is often compacted, and pollution and salt from winter roads can damage them. As a result, many street trees live much shorter lives than trees in forests.' },
  { speaker: 'A', text: 'Choosing the right species is therefore essential. Planners now try to plant a wide variety of trees, so that a single disease cannot destroy them all. Next week, we will look at how some cities use maps of every tree to plan their care.' },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull9: ListeningTest = {
  id: 'listening-full-9',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 9',
  minutes: 35,
  names: { A: 'Maria', B: 'Kevin / Simon', C: 'Aziza', D: 'Ahmed' },
  context: '4 qism: 1) sport zaliga a’zo bo‘lish (telefon); 2) eski shahar bo‘ylab piyoda ekskursiya; 3) ikki talabaning sotsiologik tadqiqot rejasi; 4) shahardagi daraxtlar foydasi haqida ma’ruza.',
  script: SCRIPT,
  sections: [
    { at: 0, title: 'Part 1 — Questions 1–10' },
    { at: PART1.length, title: 'Part 2 — Questions 11–20' },
    { at: PART1.length + PART2.length, title: 'Part 3 — Questions 21–30' },
    { at: PART1.length + PART2.length + PART3.length, title: 'Part 4 — Questions 31–40' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–10: Complete the form. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { instruction: 'Part 2 — Questions 11–15: Choose the correct letter.', questionIds: [11, 12, 13, 14, 15] },
    { instruction: 'Part 2 — Questions 16–20: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [16, 17, 18, 19, 20] },
    { instruction: 'Part 3 — Questions 21–26: Choose the correct letter.', questionIds: [21, 22, 23, 24, 25, 26] },
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Aziza or Ahmed.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Membership type chosen: ______', answers: ['premium'], evidence: 'Part 1: "I suppose premium makes more sense."' },
    { id: 2, type: 'fill', text: 'Monthly cost: £______', answers: ['45', 'forty-five'], evidence: 'Part 1: "premium is forty-five".' },
    { id: 3, type: 'fill', text: 'Main interest: ______ classes', answers: ['yoga'], evidence: 'Part 1: "I\'m mainly interested in classes, especially yoga".' },
    { id: 4, type: 'fill', text: 'Minimum contract: ______ months', answers: ['3', 'three'], evidence: 'Part 1: "The minimum contract is three months."' },
    { id: 5, type: 'fill', text: 'Induction length: about ______ minutes', answers: ['40', 'forty'], evidence: 'Part 1: "which takes about forty minutes".' },
    { id: 6, type: 'fill', text: 'Surname: ______', answers: ['okafor'], evidence: 'Part 1: "Kevin Okafor. O, K, A, F, O, R."' },
    { id: 7, type: 'fill', text: 'Date of birth: 2 ______ 1995', answers: ['february'], evidence: 'Part 1: "The second of February, nineteen ninety-five."' },
    { id: 8, type: 'fill', text: 'Health note: pain in lower ______', answers: ['back'], evidence: 'Part 1: "I sometimes have pain in my lower back".' },
    { id: 9, type: 'fill', text: 'Induction day: ______', answers: ['monday'], evidence: 'Part 1: "on Monday at six thirty in the evening".' },
    { id: 10, type: 'fill', text: 'Bring: sports clothes, a towel and a ______', answers: ['padlock'], evidence: 'Part 1: "a towel and a padlock for the lockers".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'How long is the walk in total?', options: ['About one kilometre', 'About two kilometres', 'About three kilometres', 'About five kilometres'], answer: 2, evidence: 'Part 2: "We\'ll be walking about three kilometres in total".' },
    { id: 12, type: 'mcq', text: 'Why did the town gate survive?', options: ['Local people campaigned to save it.', 'It was rebuilt in the 19th century.', 'It was part of the church.', 'The road went around it.'], answer: 0, evidence: 'Part 2: "this gate survived because local people campaigned to save it".' },
    { id: 13, type: 'mcq', text: 'What can visitors NOT do at St Mary’s Church?', options: ['Go inside', 'See the painted ceiling', 'Take photographs', 'Climb the tower'], answer: 3, evidence: 'Part 2: "the tower is closed for repairs at the moment, so we can\'t climb it".' },
    { id: 14, type: 'mcq', text: 'When does the old mill still grind flour?', options: ['Every Saturday', 'On the first Sunday of every month', 'Every day at midday', 'Only in summer'], answer: 1, evidence: 'Part 2: "it still grinds flour on the first Sunday of every month".' },
    { id: 15, type: 'mcq', text: 'What do tour members get at the mill museum?', options: ['Free entry', 'A free bag of flour', 'A discount', 'A guided tour'], answer: 2, evidence: 'Part 2: "you\'ll get a discount if you show your tour ticket".' },
    { id: 16, type: 'fill', text: 'Most streets on the tour are ______.', answers: ['cobbled'], evidence: 'Part 2: "mostly on cobbled streets".' },
    { id: 17, type: 'fill', text: 'Most of the town walls were knocked down to make room for new ______.', answers: ['roads'], evidence: 'Part 2: "to make room for new roads".' },
    { id: 18, type: 'fill', text: 'The market is a good place to buy local cheese and ______.', answers: ['honey'], evidence: 'Part 2: "to buy local cheese and honey".' },
    { id: 19, type: 'fill', text: 'The tour finishes at the castle ______.', answers: ['gardens'], evidence: 'Part 2: "We\'ll finish at the castle gardens".' },
    { id: 20, type: 'fill', text: 'Recommended cafés are in Castle ______.', answers: ['lane'], evidence: 'Part 2: "one of the cafés in Castle Lane".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'Why does Aziza reject the topic of teenagers’ phone use?', options: ['It is not interesting.', 'They would need parents’ permission.', 'It has been studied too much.'], answer: 1, evidence: 'Part 3: "it might be hard to get permission to survey teenagers. We\'d need their parents to agree."' },
    { id: 22, type: 'mcq', text: 'Which group do they decide to focus on?', options: ['First-year students in halls of residence', 'All university students', 'Students who live at home'], answer: 0, evidence: 'Part 3: "focus on first-year students living in halls of residence" — "Good."' },
    { id: 23, type: 'mcq', text: 'Why does Aziza want a sleep diary?', options: ['It is cheaper.', 'Questionnaires only show what people think they do.', 'The tutor requires it.'], answer: 1, evidence: 'Part 3: "Questionnaires only tell us what people think they do."' },
    { id: 24, type: 'mcq', text: 'How long will students keep the diary?', options: ['Three days', 'A month', 'A week'], answer: 2, evidence: 'Part 3: "A week is enough, I think."' },
    { id: 25, type: 'mcq', text: 'What reward will they offer?', options: ['A coffee voucher', 'Course credit', 'Cash'], answer: 0, evidence: 'Part 3: "a small reward, like a coffee voucher".' },
    { id: 26, type: 'mcq', text: 'What do they say about the data?', options: ['It must be anonymous.', 'It will be published online.', 'It will be shared with the halls.'], answer: 0, evidence: 'Part 3: "we must make sure the data is anonymous".' },
    { id: 27, type: 'mcq', text: 'Writing the questionnaire', options: ['Aziza', 'Ahmed'], answer: 1, evidence: 'Part 3: Ahmed: "I\'m happy to write the questionnaire."' },
    { id: 28, type: 'mcq', text: 'Designing the sleep diary', options: ['Aziza', 'Ahmed'], answer: 0, evidence: 'Part 3: Aziza: "I\'ll design the sleep diary then."' },
    { id: 29, type: 'mcq', text: 'Filling in the ethics form', options: ['Aziza', 'Ahmed'], answer: 0, evidence: 'Part 3: Aziza: "I\'ll fill in the ethics form".' },
    { id: 30, type: 'mcq', text: 'Contacting the halls about posters', options: ['Aziza', 'Ahmed'], answer: 1, evidence: 'Part 3: Ahmed: "I\'ll contact the halls to ask if we can put up posters."' },
    // Part 4
    { id: 31, type: 'fill', text: 'The most obvious benefit of urban trees is ______.', answers: ['shade'], evidence: 'Part 4: "the most obvious benefit of urban trees is shade".' },
    { id: 32, type: 'fill', text: 'Trees cool the air by releasing water through their ______.', answers: ['leaves'], evidence: 'Part 4: "by releasing water through their leaves".' },
    { id: 33, type: 'fill', text: 'Trees can reduce ______.', answers: ['flooding'], evidence: 'Part 4: "Trees can also reduce flooding."' },
    { id: 34, type: 'fill', text: 'Their ______ help water soak into the ground.', answers: ['roots'], evidence: 'Part 4: "Their roots help water to soak into the ground".' },
    { id: 35, type: 'fill', text: 'Houses on streets with trees tend to sell for higher ______.', answers: ['prices'], evidence: 'Part 4: "tend to sell for higher prices".' },
    { id: 36, type: 'fill', text: 'People who can see trees report lower levels of ______.', answers: ['stress'], evidence: 'Part 4: "report lower levels of stress".' },
    { id: 37, type: 'fill', text: 'Patients with a view of trees recovered faster after ______.', answers: ['surgery'], evidence: 'Part 4: "recovered slightly faster after surgery".' },
    { id: 38, type: 'fill', text: 'City soil is often ______.', answers: ['compacted'], evidence: 'Part 4: "the soil is often compacted".' },
    { id: 39, type: 'fill', text: 'Pollution and ______ from winter roads can damage trees.', answers: ['salt'], evidence: 'Part 4: "pollution and salt from winter roads can damage them".' },
    { id: 40, type: 'fill', text: 'Planting many species means one ______ cannot destroy them all.', answers: ['disease'], evidence: 'Part 4: "so that a single disease cannot destroy them all".' },
  ],
};
