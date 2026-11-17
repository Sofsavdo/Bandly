import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Bandly). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. Few machines have changed everyday life as quietly as the bicycle. Its story begins in 1817, when the German inventor Karl Drais built a two-wheeled “running machine”. It had no pedals: the rider sat on a wooden frame and pushed against the ground with both feet. Drais hoped it would offer an alternative to the horse, but the machine was heavy, uncomfortable and difficult to steer on rough roads, and interest soon faded.',
  'B. Pedals appeared several decades later, when makers in France attached cranks directly to the front wheel. Because each turn of the pedals produced only one turn of that wheel, designers who wanted more speed simply made the front wheel larger. The result was the high-wheeled machine of the 1870s, later nicknamed the “penny-farthing”. It was fast, but the rider sat high above the ground, and a sudden stop could throw him over the handlebars. Riding it was regarded as a sport for brave young men rather than a practical form of transport.',
  'C. The decisive change came in the 1880s with the so-called safety bicycle. It had two wheels of similar size and a chain that carried power from the pedals to the rear wheel. Gearing meant that speed no longer depended on wheel size, so the rider could sit lower and put a foot on the ground. Soon afterwards, the air-filled tyre, developed by John Boyd Dunlop in 1888, made journeys far smoother than solid rubber had allowed.',
  'D. The social effects were remarkable. In the 1890s, cycling became a craze in Europe and North America. For the first time, many working people could travel several kilometres to a job without paying for a train or keeping a horse. The bicycle also gave women a new independence of movement, and the fashion for long, heavy skirts began to change because they were impractical for riding.',
  'E. During the twentieth century, cars pushed bicycles to the side of many roads, especially in wealthy countries. Yet the machine never disappeared. In several cities, planners have recently built separate lanes and parking for bicycles, arguing that they reduce traffic and improve public health. Today, electric bicycles, which add a small motor to the rider’s own effort, are introducing cycling to people who once thought hills or long distances made it impossible.',
];

const P2 = [
  'A. Most people are familiar with the experience of studying something carefully, only to find a week later that much of it has gone. In the 1880s, the German psychologist Hermann Ebbinghaus tried to measure this loss. Using himself as the only subject, he memorised lists of meaningless syllables and tested how many he could recall after different intervals. His results suggested that forgetting is fastest soon after learning and then slows down, a pattern now known as the forgetting curve.',
  'B. Later research has shown that the curve is not fixed. One of the most reliable findings in psychology is the spacing effect: material that is reviewed several times, with gaps between the sessions, is remembered far longer than material studied for the same total time in a single block. Cramming the night before an examination may produce a reasonable score the next morning, but most of what was learned disappears soon afterwards.',
  'C. A second powerful technique is retrieval practice. When learners try to recall information without looking at it — for example, by answering questions or writing down everything they remember — they strengthen the memory more than when they simply reread their notes. Rereading feels productive because the material looks familiar, but familiarity is not the same as being able to produce the information when it is needed.',
  'D. Why should effortful recall be so effective? One explanation is that each successful retrieval makes the route to a memory easier to find next time. Another is that recall shows learners which parts they have not yet mastered, so they can direct their attention there. Interestingly, researchers have found that a failed attempt to remember, if it is followed by the correct answer, can still improve later recall.',
  'E. Sleep also plays an important part. Studies in which people learn new material in the evening and are tested the following morning suggest that a night of sleep helps to stabilise what has been learned. Students who give up sleep to study longer may therefore weaken the very memories they are trying to build.',
  'F. None of these findings is new, yet they are often ignored. Many students continue to highlight, reread and cram, partly because these methods feel easier. Some teachers now build short, low-pressure quizzes into their lessons and return to earlier topics weeks later. The aim is not to test students more, but to turn remembering itself into a way of learning.',
];

const P3 = [
  'A. On a summer afternoon, the centre of a large city can be several degrees warmer than the countryside around it. This difference, called the urban heat island effect, has been observed in cities on every continent. It is usually strongest at night, when the surrounding fields cool quickly while streets and buildings go on releasing the heat they absorbed during the day.',
  'B. Several features of cities produce the effect. Dark surfaces such as asphalt roads and roofs absorb a large share of the sunlight that falls on them. Concrete and brick store this heat and release it slowly. In addition, cities have fewer trees and less open soil, so less water evaporates — a process that naturally cools the air. Heat from vehicles, factories and air conditioners adds a further, smaller contribution.',
  'C. The consequences are more than a matter of comfort. During heatwaves, high night-time temperatures prevent the body from recovering, and older people and those with health problems face the greatest risk. Hotter cities also use more electricity for cooling, which can place pressure on power networks at the moments of highest demand.',
  'D. Some solutions are surprisingly simple. Painting roofs in light colours reflects more sunlight back into the sky, and so-called cool pavements use materials that stay cooler under the sun. Trees provide shade and release water vapour through their leaves, and parks of even modest size can be measurably cooler than the streets around them. Green roofs, covered with plants, insulate buildings and absorb rainwater as well as cooling the air.',
  'E. However, none of these measures is a complete answer. Light-coloured surfaces can reflect sunlight onto nearby buildings and pedestrians, and trees need water, space and years of care before they offer much shade. In dry regions, planners must balance the cooling benefits of vegetation against the limited supply of water. Experts therefore tend to recommend a combination of measures chosen to suit each neighbourhood.',
  'F. Traditional architecture offers further ideas. In many hot countries, older districts were built with narrow streets that remain in shade for most of the day, thick walls that slow the movement of heat, and inner courtyards with plants or water. Some architects argue that these designs, developed over centuries, deserve as much attention as new technology. As summers become hotter, the question of how to keep cities cool is likely to become one of the central challenges of urban planning.',
];

const H2 = [
  'i. An early attempt to measure memory loss',
  'ii. Why testing yourself works',
  'iii. The danger of studying for too long',
  'iv. Spreading study over time',
  'v. Learning by trying to remember',
  'vi. The role of rest in keeping memories',
  'vii. Old knowledge that is rarely used',
  'viii. How computers have changed studying',
];

export const readingFull1: ReadingTest = {
  id: 'reading-full-1',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 1',
  minutes: 60,
  passageTitle: 'Reading Passage 1: The Quiet Revolution of the Bicycle',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: The Quiet Revolution of the Bicycle' },
    { at: P1.length, title: 'Reading Passage 2: Why We Forget — and How to Remember' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: Keeping Cities Cool' },
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
    { id: 1, type: 'tfng', text: 'Drais’s running machine was moved by the rider’s feet pushing on the ground.', answer: 'True', evidence: 'P1 A: "It had no pedals: the rider … pushed against the ground with both feet."' },
    { id: 2, type: 'tfng', text: 'Drais’s machine quickly replaced the horse in German towns.', answer: 'False', evidence: 'P1 A: the machine was heavy and hard to steer, "and interest soon faded".' },
    { id: 3, type: 'tfng', text: 'The first pedals were connected to the front wheel.', answer: 'True', evidence: 'P1 B: makers "attached cranks directly to the front wheel".' },
    { id: 4, type: 'tfng', text: 'The penny-farthing was mainly bought by older riders.', answer: 'False', evidence: 'P1 B: it was "a sport for brave young men".' },
    { id: 5, type: 'tfng', text: 'The safety bicycle was invented in Britain.', answer: 'Not Given', evidence: 'P1 C gives the 1880s but does not say in which country it was invented.' },
    { id: 6, type: 'tfng', text: 'Women’s clothing changed partly because of cycling.', answer: 'True', evidence: 'P1 D: long, heavy skirts "began to change because they were impractical for riding".' },
    { id: 7, type: 'tfng', text: 'Electric bicycles are now cheaper than ordinary bicycles.', answer: 'Not Given', evidence: 'P1 E describes electric bicycles but says nothing about price.' },
    { id: 8, type: 'fill', text: 'On the penny-farthing, speed was increased by making the ______ larger.', answers: ['front wheel', 'wheel'], evidence: 'P1 B: designers "made the front wheel larger".' },
    { id: 9, type: 'fill', text: 'In the safety bicycle, a ______ took power to the rear wheel.', answers: ['chain'], evidence: 'P1 C: "a chain that carried power from the pedals to the rear wheel".' },
    { id: 10, type: 'fill', text: 'Thanks to ______, speed no longer depended on the size of the wheel.', answers: ['gearing'], evidence: 'P1 C: "Gearing meant that speed no longer depended on wheel size".' },
    { id: 11, type: 'fill', text: 'Dunlop’s tyre was filled with ______.', answers: ['air'], evidence: 'P1 C: "the air-filled tyre".' },
    { id: 12, type: 'fill', text: 'In the 1890s, cycling became a ______ in Europe and North America.', answers: ['craze'], evidence: 'P1 D: "cycling became a craze".' },
    { id: 13, type: 'fill', text: 'Some city planners have built separate ______ for bicycles.', answers: ['lanes', 'lanes and parking'], evidence: 'P1 E: "built separate lanes and parking for bicycles".' },
    // Passage 2
    { id: 14, type: 'match', text: 'Paragraph A', options: H2, answer: 0, evidence: 'P2 A: Ebbinghaus "tried to measure this loss".' },
    { id: 15, type: 'match', text: 'Paragraph B', options: H2, answer: 3, evidence: 'P2 B: the spacing effect — reviewing "with gaps between the sessions".' },
    { id: 16, type: 'match', text: 'Paragraph C', options: H2, answer: 4, evidence: 'P2 C: retrieval practice — trying to recall without looking.' },
    { id: 17, type: 'match', text: 'Paragraph D', options: H2, answer: 1, evidence: 'P2 D: "Why should effortful recall be so effective?"' },
    { id: 18, type: 'match', text: 'Paragraph E', options: H2, answer: 5, evidence: 'P2 E: sleep "helps to stabilise what has been learned".' },
    { id: 19, type: 'match', text: 'Paragraph F', options: H2, answer: 6, evidence: 'P2 F: "None of these findings is new, yet they are often ignored."' },
    { id: 20, type: 'mcq', text: 'What did Ebbinghaus use in his experiments?', options: ['Lists of real words', 'Syllables with no meaning', 'Groups of students', 'Short stories'], answer: 1, evidence: 'P2 A: "he memorised lists of meaningless syllables".' },
    { id: 21, type: 'mcq', text: 'According to the forgetting curve, forgetting is', options: ['equal over time.', 'slowest just after learning.', 'fastest just after learning.', 'impossible to measure.'], answer: 2, evidence: 'P2 A: "forgetting is fastest soon after learning and then slows down".' },
    { id: 22, type: 'mcq', text: 'Why does rereading notes feel useful, according to the writer?', options: ['It takes a long time.', 'The material looks familiar.', 'Teachers recommend it.', 'It improves sleep.'], answer: 1, evidence: 'P2 C: "Rereading feels productive because the material looks familiar".' },
    { id: 23, type: 'mcq', text: 'What do researchers say about a failed attempt to remember?', options: ['It always harms memory.', 'It is useful if the correct answer follows.', 'It only helps young learners.', 'It should be avoided before exams.'], answer: 1, evidence: 'P2 D: a failed attempt, "if it is followed by the correct answer, can still improve later recall".' },
    { id: 24, type: 'fill', text: 'Studying everything in one session the night before an exam is called ______.', answers: ['cramming'], evidence: 'P2 B: "Cramming the night before an examination".' },
    { id: 25, type: 'fill', text: 'Students who give up ______ to study may weaken their memories.', answers: ['sleep'], evidence: 'P2 E: "Students who give up sleep to study longer may therefore weaken the very memories".' },
    { id: 26, type: 'fill', text: 'Some teachers now use short, low-pressure ______ in lessons.', answers: ['quizzes'], evidence: 'P2 F: "short, low-pressure quizzes".' },
    // Passage 3
    { id: 27, type: 'mcq', text: 'When is the urban heat island effect usually strongest?', options: ['In the early morning', 'At midday', 'In the afternoon', 'At night'], answer: 3, evidence: 'P3 A: "It is usually strongest at night".' },
    { id: 28, type: 'mcq', text: 'Which factor does the writer describe as the smallest contribution?', options: ['Dark surfaces', 'Stored heat in buildings', 'Lack of evaporation', 'Heat from vehicles and machines'], answer: 3, evidence: 'P3 B: heat from vehicles, factories and air conditioners "adds a further, smaller contribution".' },
    { id: 29, type: 'mcq', text: 'Why are high night-time temperatures dangerous?', options: ['They damage roads.', 'The body cannot recover.', 'They reduce rainfall.', 'People cannot sleep outside.'], answer: 1, evidence: 'P3 C: they "prevent the body from recovering".' },
    { id: 30, type: 'mcq', text: 'What is a problem with light-coloured surfaces?', options: ['They are very expensive.', 'They can reflect sunlight onto people and buildings.', 'They need a lot of water.', 'They make roofs heavier.'], answer: 1, evidence: 'P3 E: they "can reflect sunlight onto nearby buildings and pedestrians".' },
    { id: 31, type: 'mcq', text: 'What do experts generally recommend?', options: ['Planting trees everywhere', 'Using only new technology', 'A mix of measures for each area', 'Moving people out of city centres'], answer: 2, evidence: 'P3 E: "a combination of measures chosen to suit each neighbourhood".' },
    { id: 32, type: 'tfng', text: 'The urban heat island effect has been found only in tropical cities.', answer: 'False', evidence: 'P3 A: "observed in cities on every continent".' },
    { id: 33, type: 'tfng', text: 'Evaporation of water helps to cool the air.', answer: 'True', evidence: 'P3 B: evaporation is "a process that naturally cools the air".' },
    { id: 34, type: 'tfng', text: 'Hot cities use more electricity for cooling.', answer: 'True', evidence: 'P3 C: "Hotter cities also use more electricity for cooling".' },
    { id: 35, type: 'tfng', text: 'Green roofs are cheaper to build than light-coloured roofs.', answer: 'Not Given', evidence: 'P3 D mentions the benefits of green roofs but not their cost.' },
    { id: 36, type: 'tfng', text: 'Small parks have no measurable effect on temperature.', answer: 'False', evidence: 'P3 D: "parks of even modest size can be measurably cooler".' },
    { id: 37, type: 'fill', text: 'Older districts in hot countries often have narrow streets that stay in ______ most of the day.', answers: ['shade'], evidence: 'P3 F: "narrow streets that remain in shade for most of the day".' },
    { id: 38, type: 'fill', text: 'Thick ______ slow the movement of heat.', answers: ['walls'], evidence: 'P3 F: "thick walls that slow the movement of heat".' },
    { id: 39, type: 'fill', text: 'Inner ______ with plants or water also help.', answers: ['courtyards'], evidence: 'P3 F: "inner courtyards with plants or water".' },
    { id: 40, type: 'fill', text: 'In dry regions, the benefits of vegetation must be balanced against the limited supply of ______.', answers: ['water'], evidence: 'P3 E: "balance the cooling benefits of vegetation against the limited supply of water".' },
  ],
};
