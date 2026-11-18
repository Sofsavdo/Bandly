import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi 2: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Bandly). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
const P1 = [
  'A. For most of its life, the desert locust is an unremarkable insect. It lives alone in the dry regions of North Africa, the Middle East and South Asia, avoiding other locusts and feeding on whatever sparse vegetation it can find. In this solitary phase it is green or brown, moves mainly at night and rarely travels far. Farmers in these regions may not even notice it.',
  'B. Everything changes after heavy rain. Wet soil allows females to lay many more eggs, and fresh plants appear across the desert. As the vegetation later dries up and shrinks, the young locusts are pushed together into smaller and smaller areas. Researchers have found that repeated touching of the insects’ back legs triggers a remarkable transformation: within a few hours their behaviour changes, and over the following generations they become brightly coloured, more active and strongly attracted to one another.',
  'C. In this gregarious phase, locusts form bands of wingless young insects that march across the ground, and later swarms of adults that fly by day. A single swarm can cover several hundred square kilometres and contain billions of insects. Carried by the wind, swarms may travel well over a hundred kilometres in one day, and each insect can eat roughly its own weight in fresh food daily. Crops, pasture and trees can disappear in hours.',
  'D. Major outbreaks have affected dozens of countries at once, threatening the food supply of millions of people. Because swarms cross borders so easily, no single country can deal with them alone. International organisations therefore collect reports from field teams, satellites and weather stations to identify areas where conditions favour breeding, often weeks before a swarm forms.',
  'E. The main method of control is still the spraying of chemical pesticides, usually from vehicles or aircraft. However, this approach is expensive and can harm other wildlife and people. Scientists have developed a biological alternative based on a natural fungus that infects only locusts and related insects. It works more slowly than chemicals, so it is most useful when outbreaks are detected early.',
  'F. Climate is likely to make the problem harder to predict. Unusual cyclones and heavy rainfall over deserts can create ideal breeding conditions in places that are normally too dry. Experts argue that the best defence is not dramatic emergency spraying but steady, well-funded monitoring, so that small groups of locusts can be treated before they become swarms.',
];

const P2 = [
  'A. Parents often complain that teenagers stay up too late and cannot get out of bed in the morning. For a long time, this was seen simply as a question of discipline. Over the past few decades, however, sleep researchers have shown that the pattern has a strong biological basis.',
  'B. Every person has an internal body clock that tells the body when to feel alert and when to feel sleepy. One of its signals is the hormone melatonin, which rises in the evening. During adolescence, the release of melatonin starts later at night, so many teenagers do not feel sleepy until around eleven o’clock or later. This shift appears in young people in many different countries, which suggests it is not just a result of modern lifestyles.',
  'C. At the same time, teenagers still need a great deal of sleep — about eight to ten hours a night, according to most health guidelines. If they fall asleep late and must wake early for school, they lose sleep every weekday. Many try to catch up at the weekend by sleeping until midday, but this can push their body clock even later, making Monday morning harder still.',
  'D. The effects of this lack of sleep are wide-ranging. Tired students find it harder to concentrate and remember what they have learned, and they are more likely to feel irritable or low. Research has also linked short sleep with a higher risk of road accidents among young drivers and with poorer decisions about food.',
  'E. Some school districts have responded by moving the start of the school day later, often by about an hour. Studies of these changes have generally found that students sleep longer, are absent less often and are less likely to fall asleep in class. Not everyone supports the idea, though: later starts can create difficulties for school bus timetables, after-school sports and parents’ working hours.',
  'F. Experts say that teenagers themselves can also make a difference. Bright light from phones and laptops late in the evening can delay sleep further, so they recommend switching off screens an hour before bed and keeping a similar bedtime on school days and at weekends. Getting daylight in the morning may also help to move the body clock earlier.',
];

const P3 = [
  'A. The five-day working week, with two days of rest, became standard in many countries during the twentieth century. Today, a growing number of companies are experimenting with a further change: a four-day week with no loss of pay. Supporters believe that shorter hours can make workers healthier and happier without reducing the amount they produce.',
  'B. The idea rests on a simple observation. In many office jobs, not every hour at work is productive; time is lost in unnecessary meetings, interruptions and slow processes. If staff know they have only four days to complete their work, the argument goes, they will find ways to remove these inefficiencies. Some managers report that teams became more focused and that the number of meetings fell sharply.',
  'C. Several large trials have taken place in recent years, involving companies from many sectors. In most of them, employees reported lower stress, better sleep and more time for family and exercise, and the majority of participating companies chose to continue with the shorter week once the trial ended. Some firms also found that fewer employees left their jobs, which saved the cost of recruiting and training new staff.',
  'D. Critics point out, however, that the trials have important limitations. The companies that took part were volunteers, so they may have been especially well suited to the change. In addition, many results were based on workers’ own descriptions of how they felt rather than on independent measures of output. A system that works in a small software company may not suit a hospital, a factory or a shop that must stay open six days a week.',
  'E. For such organisations, a four-day week often means a different arrangement rather than fewer hours for everyone. Some use rotas so that staff work four longer days while the business stays open as usual. Others reduce hours gradually or offer the shorter week only to certain departments. These solutions can work, but they require careful planning and may increase costs in the short term.',
  'F. Whether the four-day week will become as common as the five-day week remains uncertain. Economists note that the earlier move to a shorter week happened over many decades and was linked to large increases in productivity. What seems clear is that the debate has encouraged many employers to think more carefully about how working time is used, and that may prove to be its most lasting effect.',
];

const H2 = [
  'i. A behaviour once blamed on character',
  'ii. How the body clock changes in adolescence',
  'iii. Why weekend lie-ins may not help',
  'iv. The risks of not sleeping enough',
  'v. Changing the school timetable',
  'vi. Practical steps young people can take',
  'vii. The cost of sleeping pills',
  'viii. Differences between boys and girls',
];

export const readingFull2: ReadingTest = {
  id: 'reading-full-2',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 2',
  minutes: 60,
  passageTitle: 'Reading Passage 1: When Locusts Swarm',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: When Locusts Swarm' },
    { at: P1.length, title: 'Reading Passage 2: The Teenage Body Clock' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: The Four-Day Week' },
  ],
  groups: [
    { instruction: 'Questions 1–7 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5, 6, 7] },
    { instruction: 'Questions 8–13 (Passage 1): Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–23 (Passage 2): Choose the correct letter.', questionIds: [20, 21, 22, 23] },
    { instruction: 'Questions 24–26 (Passage 2): Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [24, 25, 26] },
    { instruction: 'Questions 27–31 (Passage 3): Choose the correct letter.', questionIds: [27, 28, 29, 30, 31] },
    { instruction: 'Questions 32–36 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [32, 33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'tfng', text: 'In its solitary phase, the desert locust is mostly active at night.', answer: 'True', evidence: 'P1 A: it "moves mainly at night".' },
    { id: 2, type: 'tfng', text: 'Solitary locusts often cause serious damage to farms.', answer: 'False', evidence: 'P1 A: "Farmers in these regions may not even notice it."' },
    { id: 3, type: 'tfng', text: 'Heavy rain leads to an increase in the number of eggs laid.', answer: 'True', evidence: 'P1 B: "Wet soil allows females to lay many more eggs".' },
    { id: 4, type: 'tfng', text: 'Touching the back legs of locusts can change their behaviour within hours.', answer: 'True', evidence: 'P1 B: "within a few hours their behaviour changes".' },
    { id: 5, type: 'tfng', text: 'Locust swarms usually fly only at night.', answer: 'False', evidence: 'P1 C: "swarms of adults that fly by day".' },
    { id: 6, type: 'tfng', text: 'Satellites can show where conditions are good for breeding.', answer: 'True', evidence: 'P1 D: reports from "field teams, satellites and weather stations" identify areas where conditions favour breeding.' },
    { id: 7, type: 'tfng', text: 'The fungus treatment is cheaper than chemical pesticides.', answer: 'Not Given', evidence: 'P1 E says chemicals are expensive but gives no cost for the fungus.' },
    { id: 8, type: 'fill', text: 'In the gregarious phase, wingless young locusts form ______ that march across the ground.', answers: ['bands'], evidence: 'P1 C: "locusts form bands of wingless young insects that march".' },
    { id: 9, type: 'fill', text: 'Swarms are carried long distances by the ______.', answers: ['wind'], evidence: 'P1 C: "Carried by the wind".' },
    { id: 10, type: 'fill', text: 'Each locust can eat about its own ______ in fresh food every day.', answers: ['weight'], evidence: 'P1 C: "each insect can eat roughly its own weight in fresh food daily".' },
    { id: 11, type: 'fill', text: 'Pesticides are usually sprayed from vehicles or ______.', answers: ['aircraft'], evidence: 'P1 E: "usually from vehicles or aircraft".' },
    { id: 12, type: 'fill', text: 'The biological method uses a natural ______.', answers: ['fungus'], evidence: 'P1 E: "based on a natural fungus".' },
    { id: 13, type: 'fill', text: 'Experts believe the best defence is steady, well-funded ______.', answers: ['monitoring'], evidence: 'P1 F: "steady, well-funded monitoring".' },
    // Passage 2
    { id: 14, type: 'match', text: 'Paragraph A', options: H2, answer: 0, evidence: 'P2 A: it was "seen simply as a question of discipline".' },
    { id: 15, type: 'match', text: 'Paragraph B', options: H2, answer: 1, evidence: 'P2 B: during adolescence melatonin release "starts later at night".' },
    { id: 16, type: 'match', text: 'Paragraph C', options: H2, answer: 2, evidence: 'P2 C: sleeping until midday "can push their body clock even later".' },
    { id: 17, type: 'match', text: 'Paragraph D', options: H2, answer: 3, evidence: 'P2 D: "The effects of this lack of sleep are wide-ranging."' },
    { id: 18, type: 'match', text: 'Paragraph E', options: H2, answer: 4, evidence: 'P2 E: districts moved "the start of the school day later".' },
    { id: 19, type: 'match', text: 'Paragraph F', options: H2, answer: 5, evidence: 'P2 F: "teenagers themselves can also make a difference".' },
    { id: 20, type: 'mcq', text: 'Why does the writer think the late sleep pattern is not caused only by modern life?', options: ['It is found in many countries.', 'It began a few decades ago.', 'It affects adults as well.', 'It disappears at weekends.'], answer: 0, evidence: 'P2 B: the shift "appears in young people in many different countries".' },
    { id: 21, type: 'mcq', text: 'How much sleep do teenagers need, according to most guidelines?', options: ['Six to seven hours', 'About eight to ten hours', 'At least eleven hours', 'As much as adults'], answer: 1, evidence: 'P2 C: "about eight to ten hours a night".' },
    { id: 22, type: 'mcq', text: 'Which effect of short sleep is NOT mentioned?', options: ['Poor concentration', 'Road accidents', 'Weaker eyesight', 'Poorer food choices'], answer: 2, evidence: 'P2 D mentions concentration, mood, accidents and food, but not eyesight.' },
    { id: 23, type: 'mcq', text: 'What is one problem with later school start times?', options: ['Students sleep less.', 'Bus timetables become difficult.', 'Exam results fall.', 'Teachers refuse to work later.'], answer: 1, evidence: 'P2 E: later starts "can create difficulties for school bus timetables".' },
    { id: 24, type: 'fill', text: 'The hormone ______ helps to make people feel sleepy in the evening.', answers: ['melatonin'], evidence: 'P2 B: "the hormone melatonin, which rises in the evening".' },
    { id: 25, type: 'fill', text: 'Experts advise switching off ______ an hour before going to bed.', answers: ['screens'], evidence: 'P2 F: "switching off screens an hour before bed".' },
    { id: 26, type: 'fill', text: 'Morning ______ may help to move the body clock earlier.', answers: ['daylight'], evidence: 'P2 F: "Getting daylight in the morning may also help".' },
    // Passage 3
    { id: 27, type: 'mcq', text: 'What do supporters of the four-day week claim?', options: ['Workers will earn more.', 'Output can stay the same with fewer hours.', 'Companies will need more staff.', 'Meetings will become longer.'], answer: 1, evidence: 'P3 A: shorter hours can help "without reducing the amount they produce".' },
    { id: 28, type: 'mcq', text: 'According to paragraph B, where is time often wasted in offices?', options: ['Travelling to work', 'Training new staff', 'Unnecessary meetings', 'Lunch breaks'], answer: 2, evidence: 'P3 B: "time is lost in unnecessary meetings, interruptions and slow processes".' },
    { id: 29, type: 'mcq', text: 'What happened after most trials ended?', options: ['Most companies returned to five days.', 'Most companies kept the shorter week.', 'Workers asked for higher pay.', 'Governments made the four-day week law.'], answer: 1, evidence: 'P3 C: "the majority of participating companies chose to continue".' },
    { id: 30, type: 'mcq', text: 'Why do critics question the trial results?', options: ['The trials were too short.', 'The companies chose to take part.', 'Only factories were included.', 'Workers were paid less.'], answer: 1, evidence: 'P3 D: "The companies that took part were volunteers".' },
    { id: 31, type: 'mcq', text: 'What does the writer suggest may be the most lasting effect of the debate?', options: ['A law for all workers', 'Higher salaries', 'More careful thinking about working time', 'The end of the five-day week'], answer: 2, evidence: 'P3 F: it has encouraged employers "to think more carefully about how working time is used".' },
    { id: 32, type: 'tfng', text: 'In the trials, workers on a four-day week received lower pay.', answer: 'False', evidence: 'P3 A: "a four-day week with no loss of pay".' },
    { id: 33, type: 'tfng', text: 'Some firms saved money because fewer employees left.', answer: 'True', evidence: 'P3 C: fewer employees left, "which saved the cost of recruiting and training".' },
    { id: 34, type: 'tfng', text: 'Most of the trial results came from independent measurements of output.', answer: 'False', evidence: 'P3 D: many results were based on "workers’ own descriptions" rather than independent measures.' },
    { id: 35, type: 'tfng', text: 'Hospitals have reported the best results from the four-day week.', answer: 'Not Given', evidence: 'P3 D says the system may not suit a hospital; no hospital results are reported.' },
    { id: 36, type: 'tfng', text: 'Rota systems can allow a business to stay open as usual.', answer: 'True', evidence: 'P3 E: staff work four longer days "while the business stays open as usual".' },
    { id: 37, type: 'fill', text: 'Some organisations use ______ so that staff work four longer days.', answers: ['rotas'], evidence: 'P3 E: "Some use rotas".' },
    { id: 38, type: 'fill', text: 'Others offer the shorter week only to certain ______.', answers: ['departments'], evidence: 'P3 E: "only to certain departments".' },
    { id: 39, type: 'fill', text: 'These solutions require careful ______.', answers: ['planning'], evidence: 'P3 E: "they require careful planning".' },
    { id: 40, type: 'fill', text: 'The earlier move to a shorter week was linked to large increases in ______.', answers: ['productivity'], evidence: 'P3 F: "linked to large increases in productivity".' },
  ],
};
