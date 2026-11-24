import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 2: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki (cefrReading1 bilan bir xil). Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Riverside Sports Centre: The swimming pool will be closed for cleaning from Monday 12 to Wednesday 14 May. The gym and tennis courts will stay open as usual. Members who have booked a swimming lesson on these days will receive a free extra lesson in June.',
  '2) EMAIL — Dear parents, the school trip to the science museum is now on Thursday, not Tuesday, because the museum is closed for a private event. The bus will leave at 8.30 am. Children need a packed lunch, but they do not need money, as entrance is free for school groups. Mrs Karimova',
  '3) ADVERTISEMENT — Weekend cooking course for beginners: learn to make bread, soup and three simple desserts in two Saturday mornings. All ingredients are provided. Places are limited to eight people, so early booking is recommended. Bring an apron.',
];

const T2 = [
  'In many cities, more and more people are choosing to cycle to work. For some, the main reason is money: a bicycle costs far less to run than a car, and there are no parking charges. Others say they cycle because it allows them to exercise without having to find extra time for the gym.',
  'City councils have responded in different ways. Some have built separate cycle lanes, so that cyclists do not have to share the road with buses and lorries. Where such lanes exist, the number of cyclists usually rises quickly. Other cities have introduced bike-sharing schemes, which let people rent a bicycle for a short journey using a mobile phone.',
  'Not everyone is enthusiastic, though. Some drivers complain that cycle lanes make the roads narrower and traffic slower. Cyclists, for their part, often say that the biggest problem is not traffic but the weather: in winter, many of them leave their bicycles at home and take public transport instead.',
];

const T3 = [
  'A. In towns and villages across Central Asia, the choyxona, or tea house, has long been more than a place to drink tea. Traditionally, men gathered there in the late afternoon to talk about the day’s news, discuss family matters and settle small disagreements.',
  'B. A typical tea house was built near water — a canal, a stream or a pool — and shaded by large trees. Guests sat on wide wooden platforms covered with carpets and cushions, and in summer the cool air from the water made these places especially popular.',
  'C. Green tea was the usual drink, served in small bowls rather than cups. The host poured a little tea into a bowl and returned it to the pot several times before serving, a custom that is said to help the tea develop its full flavour.',
  'D. Food also played an important part. On special occasions, a large dish of plov was cooked in a huge pot over an open fire, and preparing it was often the job of an experienced cook who was respected throughout the neighbourhood.',
  'E. During the twentieth century, as cities grew and lifestyles changed, many traditional tea houses disappeared. Younger people increasingly preferred cafés and restaurants, and the custom of meeting every afternoon became less common.',
  'F. Recently, however, the tea house has enjoyed something of a revival. Modern versions combine traditional decoration with comfortable furniture and Wi-Fi, and they attract families and tourists as well as the older men who were once their main visitors.',
];

const T4 = [
  'Teenagers are often described as lazy because they find it hard to get up in the morning. Scientists, however, have discovered that their behaviour has a biological cause. During adolescence, the body begins to produce the sleep hormone melatonin later in the evening, so most teenagers do not feel tired until around eleven o’clock at night.',
  'Because school usually starts early, many teenagers do not get the eight to ten hours of sleep that doctors recommend. A lack of sleep can affect concentration, memory and mood, and it has been linked to lower marks in subjects such as mathematics.',
  'Some schools have experimented with a later start to the school day. In several studies, students who began lessons an hour later slept longer, were absent less often and reported feeling less stressed. Teachers also noticed that pupils were more alert in morning lessons.',
  'Changing the timetable is not always easy, however. Parents may need to change their working hours, and bus companies must adjust their routes. Experts therefore suggest that families can also help by limiting the use of screens in the evening, because the light from phones can delay sleep even further.',
];

const T5 = [
  'It has become common to hear that the internet is changing the way we remember. Why, the argument goes, should anyone memorise a date, a phone number or a fact when it can be found in seconds? Some researchers have described a tendency to forget information that we expect to be able to look up later, and they have suggested that we now treat the internet as a kind of external memory.',
  'This is not entirely new. Long before computers, people relied on books, diaries and other people to store information for them. Within families, for example, one person might be responsible for remembering birthdays while another keeps track of money. What has changed is the size and speed of the external store, and the fact that it is available almost everywhere.',
  'Whether this is a problem depends partly on what we use our memory for. Critics argue that understanding a subject deeply requires knowledge stored in our own heads, because we can only connect ideas that we actually know. A person who must search for every basic fact, they say, will find it hard to think creatively or to notice when information is false.',
  'Others are more optimistic. They point out that freeing the mind from routine facts may leave more capacity for analysis and judgement. The challenge for schools, in their view, is not to ban search engines but to teach students which knowledge is worth learning by heart and how to evaluate what they find online.',
];

const H3 = [
  'i. A place for conversation and community',
  'ii. A drink served in a special way',
  'iii. Why the old buildings were destroyed by law',
  'iv. A setting chosen for comfort',
  'v. A tradition that began to fade',
  'vi. A meal prepared by a respected person',
  'vii. An old institution with a new look',
];

export const cefrReading2: ReadingTest = {
  id: 'cefr-reading-2',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 2',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Cycling to work (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The tea house (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Teenagers and sleep (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Memory in the age of the internet (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Which facility will be closed for three days?', options: ['The gym', 'The tennis courts', 'The swimming pool'], answer: 2, evidence: 'Text 1: "The swimming pool will be closed for cleaning".' },
    { id: 2, type: 'mcq', text: 'What will members with a booked swimming lesson get?', options: ['A free extra lesson', 'Their money back', 'A lesson in the gym'], answer: 0, evidence: 'Text 1: "will receive a free extra lesson in June".' },
    { id: 3, type: 'mcq', text: 'Why has the date of the school trip changed?', options: ['The bus is not available.', 'The museum has a private event.', 'Tuesday is a holiday.'], answer: 1, evidence: 'Text 2: "because the museum is closed for a private event".' },
    { id: 4, type: 'mcq', text: 'What should the children take on the trip?', options: ['Money for tickets', 'A packed lunch', 'Nothing at all'], answer: 1, evidence: 'Text 2: "Children need a packed lunch, but they do not need money".' },
    { id: 5, type: 'mcq', text: 'What do people on the cooking course NOT need to bring?', options: ['Ingredients', 'An apron', 'Their booking'], answer: 0, evidence: 'Text 3: "All ingredients are provided."' },
    { id: 6, type: 'mcq', text: 'Why should people book early?', options: ['The price will rise.', 'The course starts soon.', 'Only eight people can join.'], answer: 2, evidence: 'Text 3: "Places are limited to eight people, so early booking is recommended."' },
    { id: 7, type: 'tfng', text: 'Running a bicycle is much cheaper than running a car.', answer: 'True', evidence: 'Part 2: "a bicycle costs far less to run than a car".' },
    { id: 8, type: 'tfng', text: 'Some people cycle so that they do not need extra time for exercise.', answer: 'True', evidence: 'Part 2: "it allows them to exercise without having to find extra time for the gym".' },
    { id: 9, type: 'tfng', text: 'Most cyclists are under thirty years old.', answer: 'Not Given', evidence: 'Part 2 does not mention the age of cyclists.' },
    { id: 10, type: 'tfng', text: 'The number of cyclists usually falls after separate lanes are built.', answer: 'False', evidence: 'Part 2: "Where such lanes exist, the number of cyclists usually rises quickly."' },
    { id: 11, type: 'tfng', text: 'Bike-sharing schemes can be used with a mobile phone.', answer: 'True', evidence: 'Part 2: "rent a bicycle for a short journey using a mobile phone".' },
    { id: 12, type: 'tfng', text: 'Bike-sharing is free in most cities.', answer: 'Not Given', evidence: 'Part 2 says people "rent" bicycles but gives no information about prices.' },
    { id: 13, type: 'tfng', text: 'All drivers support the building of cycle lanes.', answer: 'False', evidence: 'Part 2: "Some drivers complain that cycle lanes make the roads narrower".' },
    { id: 14, type: 'tfng', text: 'Cyclists say that traffic is their biggest problem.', answer: 'False', evidence: 'Part 2: "the biggest problem is not traffic but the weather".' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 0, evidence: 'Part 3 A: men gathered "to talk about the day’s news, discuss family matters".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 3, evidence: 'Part 3 B: built near water, shaded by trees, with "carpets and cushions".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 1, evidence: 'Part 3 C: tea "served in small bowls rather than cups" and returned to the pot.' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 5, evidence: 'Part 3 D: plov prepared by "an experienced cook who was respected".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 4, evidence: 'Part 3 E: "the custom of meeting every afternoon became less common".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 6, evidence: 'Part 3 F: "Modern versions combine traditional decoration with comfortable furniture and Wi-Fi".' },
    { id: 21, type: 'fill', text: 'Teenagers are often described as ______ because they find it hard to get up.', answers: ['lazy'], evidence: 'Part 4: "Teenagers are often described as lazy".' },
    { id: 22, type: 'fill', text: 'During adolescence, the body produces ______ later in the evening.', answers: ['melatonin'], evidence: 'Part 4: "the body begins to produce the sleep hormone melatonin later in the evening".' },
    { id: 23, type: 'fill', text: 'A lack of sleep can affect concentration, memory and ______.', answers: ['mood'], evidence: 'Part 4: "A lack of sleep can affect concentration, memory and mood".' },
    { id: 24, type: 'fill', text: 'Lack of sleep has been linked to lower marks in subjects such as ______.', answers: ['mathematics'], evidence: 'Part 4: "lower marks in subjects such as mathematics".' },
    { id: 25, type: 'fill', text: 'Students who started an hour later were ______ less often.', answers: ['absent'], evidence: 'Part 4: "were absent less often".' },
    { id: 26, type: 'fill', text: 'Teachers noticed that pupils were more ______ in morning lessons.', answers: ['alert'], evidence: 'Part 4: "pupils were more alert in morning lessons".' },
    { id: 27, type: 'fill', text: '______ companies must adjust their routes if the timetable changes.', answers: ['bus'], evidence: 'Part 4: "bus companies must adjust their routes".' },
    { id: 28, type: 'fill', text: 'The light from ______ can delay sleep even further.', answers: ['phones'], evidence: 'Part 4: "the light from phones can delay sleep even further".' },
    { id: 29, type: 'mcq', text: 'According to some researchers, people tend to forget information that', options: ['they read on a screen.', 'they expect to be able to look up later.', 'is not important to them.', 'they learned as children.'], answer: 1, evidence: 'Part 5: "a tendency to forget information that we expect to be able to look up later".' },
    { id: 30, type: 'mcq', text: 'The example of families in paragraph 2 shows that', options: ['families forget birthdays more often today.', 'money is harder to manage than dates.', 'people shared the work of remembering before computers.', 'diaries are more reliable than the internet.'], answer: 2, evidence: 'Part 5: "Long before computers, people relied on books, diaries and other people to store information for them."' },
    { id: 31, type: 'mcq', text: 'What, according to the writer, has changed?', options: ['The size and speed of the external store', 'The number of facts people need', 'The way families organise money', 'The reliability of books'], answer: 0, evidence: 'Part 5: "What has changed is the size and speed of the external store".' },
    { id: 32, type: 'mcq', text: 'Critics believe that deep understanding requires', options: ['fast access to search engines.', 'knowledge stored in our own heads.', 'help from other people.', 'creative teachers.'], answer: 1, evidence: 'Part 5: "understanding a subject deeply requires knowledge stored in our own heads".' },
    { id: 33, type: 'mcq', text: 'According to critics, a person who must search for every basic fact may find it hard to', options: ['use a computer.', 'remember phone numbers.', 'work in a team.', 'notice when information is false.'], answer: 3, evidence: 'Part 5: "will find it hard to think creatively or to notice when information is false".' },
    { id: 34, type: 'mcq', text: 'Optimists believe that freeing the mind from routine facts may', options: ['make people lazier.', 'leave more capacity for analysis and judgement.', 'reduce the need for schools.', 'improve memory for dates.'], answer: 1, evidence: 'Part 5: "may leave more capacity for analysis and judgement".' },
    { id: 35, type: 'mcq', text: 'In the optimists’ view, what should schools do?', options: ['Ban search engines in class', 'Test students on more facts', 'Teach which knowledge to learn by heart and how to evaluate sources', 'Replace books with computers'], answer: 2, evidence: 'Part 5: "not to ban search engines but to teach students which knowledge is worth learning by heart and how to evaluate what they find online".' },
  ],
};
