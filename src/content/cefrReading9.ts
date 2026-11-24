import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 9: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — Sunrise Language School: Registration for the autumn courses opens on 15 August. Students who registered for a summer course get a 10% discount. New students must take a short placement test before choosing a class.',
  '2) MESSAGE — Hi Timur, I’ve left the keys to the flat with our neighbour in number 12, because I’m working late tonight. There’s soup in the fridge — just heat it up. Please water the plants on the balcony, as it’s been very hot. Back around 11. Anvar',
  '3) ADVERTISEMENT — Photography workshop for teenagers aged 13–17. Learn how to take better pictures with your phone. Three sessions on Saturday afternoons in the city park. No special camera is needed. The workshop is free, but places must be reserved online.',
];

const T2 = [
  'More and more young people are learning to cook, and many of them are learning not from their parents but from short videos online. Recipe videos that last only a minute or two have become extremely popular, and some home cooks have millions of followers.',
  'People who cook at home say there are many advantages. Home-cooked food is usually healthier than takeaway meals, because the cook can control the amount of salt, sugar and oil. Cooking at home is also much cheaper, especially for students and families who need to manage their money carefully.',
  'However, learning from videos has its limits. Short videos often skip important steps, and they rarely explain why a recipe works. Cookery teachers say that beginners should start with a few simple dishes and repeat them until they feel confident, rather than trying a new recipe every day. They also recommend cooking with friends, because it makes the process more enjoyable.',
];

const T3 = [
  'A. In the 1420s, Mirzo Ulugbek, the grandson of Amir Temur and ruler of Samarkand, built one of the greatest observatories of the medieval world. Ulugbek was not only a ruler but also a serious scientist, and he gathered around him some of the best mathematicians and astronomers of his time.',
  'B. The most impressive part of the observatory was a huge instrument for measuring the position of the Sun, the Moon and the stars. Part of it was built into a deep trench cut into the hill, which helped to keep it stable and allowed very precise measurements.',
  'C. The scientists working at the observatory produced a famous catalogue of stars, which gave the positions of around a thousand stars. For centuries it was among the most accurate works of its kind, and it was later translated and studied in Europe.',
  'D. They also calculated the length of the year with remarkable accuracy. Their result differed from the value accepted today by only about a minute, an extraordinary achievement for observers working without telescopes.',
  'E. After Ulugbek’s death in 1449, the observatory was no longer used, and over time it was destroyed. Its exact location was eventually forgotten, and for several centuries the achievements of the Samarkand astronomers were known mainly from manuscripts.',
  'F. In 1908, an archaeologist discovered the remains of the observatory, including the underground part of the great instrument. Today the site is a museum, and it reminds visitors of a time when Samarkand was one of the world’s leading centres of science.',
];

const T4 = [
  'Many people feel more tired and less cheerful in winter, when the days are short. For most of them, this is a mild change in mood. For some, however, the effect is strong enough to affect their work and relationships, and doctors describe it as a form of depression linked to the seasons.',
  'Light plays an important role in regulating our internal body clock. Exposure to bright light in the morning helps the body to know when to be awake and when to sleep. When days are short and people spend most of their time indoors, this signal becomes weaker.',
  'One treatment that is often recommended is light therapy. Patients sit near a special lamp, which is much brighter than ordinary indoor lighting, for about half an hour each morning. Many people report that their mood improves within a few weeks.',
  'There are also simple steps that anyone can take. Going outside during the brightest part of the day, even when it is cloudy, can help. Regular exercise and keeping a fixed time for going to bed and getting up are also recommended, as both support a healthy body clock.',
];

const T5 = [
  'Every day, each of us makes a large number of decisions, from what to eat for breakfast to how to respond to a difficult email. Some psychologists have proposed that the ability to make good decisions, or to resist temptation, depends on a limited mental resource that is gradually used up during the day. According to this idea, sometimes called “decision fatigue”, people who have made many choices become more likely to take the easy option or to avoid deciding at all.',
  'The idea quickly became popular outside psychology. Business writers advised readers to make important decisions early in the day, and some well-known executives explained that they wore the same type of clothes every day in order to save their mental energy for more important matters.',
  'In recent years, however, the theory has faced serious challenges. Several large studies that tried to repeat the original experiments failed to find the same effect, and some researchers have argued that the results may depend partly on what people believe about their own willpower. People who think that their self-control is unlimited, for instance, appear less likely to show signs of fatigue.',
  'This does not mean that tiredness has no effect on decisions; long working hours, lack of sleep and hunger clearly influence how well we think. What remains uncertain is whether there is a single resource that every decision consumes. For practical purposes, the safest advice may simply be that important choices deserve time and attention, and should not be made when we are exhausted or rushed.',
];

const H3 = [
  'i. A precise measurement of time',
  'ii. A scientist ruler and his team',
  'iii. Rediscovery and a museum',
  'iv. A record of the night sky',
  'v. A giant instrument partly underground',
  'vi. Why Ulugbek left Samarkand',
  'vii. Decline and loss',
];

export const cefrReading9: ReadingTest = {
  id: 'cefr-reading-9',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 9',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Learning to cook (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: Ulugbek’s observatory (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Winter and mood (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Decision fatigue (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Who gets a discount on autumn courses?', options: ['All new students', 'Students who took a summer course', 'Students who register early'], answer: 1, evidence: 'Text 1: "Students who registered for a summer course get a 10% discount."' },
    { id: 2, type: 'mcq', text: 'What must new students do first?', options: ['Pay in advance', 'Choose a teacher', 'Take a placement test'], answer: 2, evidence: 'Text 1: "New students must take a short placement test before choosing a class."' },
    { id: 3, type: 'mcq', text: 'Where are the keys?', options: ['With the neighbour', 'Under the door mat', 'At Anvar’s work'], answer: 0, evidence: 'Text 2: "I’ve left the keys to the flat with our neighbour in number 12".' },
    { id: 4, type: 'mcq', text: 'What does Anvar ask Timur to do?', options: ['Cook dinner', 'Water the plants', 'Call him at 11'], answer: 1, evidence: 'Text 2: "Please water the plants on the balcony".' },
    { id: 5, type: 'mcq', text: 'What do participants need for the workshop?', options: ['A professional camera', 'A phone', 'Payment in advance'], answer: 1, evidence: 'Text 3: "Learn how to take better pictures with your phone. … No special camera is needed."' },
    { id: 6, type: 'mcq', text: 'What must people do to join the workshop?', options: ['Reserve a place online', 'Pay a small fee', 'Show a student card'], answer: 0, evidence: 'Text 3: "places must be reserved online".' },
    { id: 7, type: 'tfng', text: 'Many young people learn to cook from short online videos.', answer: 'True', evidence: 'Part 2: "many of them are learning not from their parents but from short videos online".' },
    { id: 8, type: 'tfng', text: 'Most recipe videos last more than ten minutes.', answer: 'False', evidence: 'Part 2: "Recipe videos that last only a minute or two have become extremely popular".' },
    { id: 9, type: 'tfng', text: 'Home cooks can control the amount of salt in their food.', answer: 'True', evidence: 'Part 2: "the cook can control the amount of salt, sugar and oil".' },
    { id: 10, type: 'tfng', text: 'Cooking at home is more expensive than buying takeaway meals.', answer: 'False', evidence: 'Part 2: "Cooking at home is also much cheaper".' },
    { id: 11, type: 'tfng', text: 'Short videos often explain why a recipe works.', answer: 'False', evidence: 'Part 2: "they rarely explain why a recipe works".' },
    { id: 12, type: 'tfng', text: 'Teachers advise beginners to repeat a few simple dishes.', answer: 'True', evidence: 'Part 2: "start with a few simple dishes and repeat them until they feel confident".' },
    { id: 13, type: 'tfng', text: 'Most popular online cooks are trained chefs.', answer: 'Not Given', evidence: 'Part 2 mentions "home cooks" with many followers but not their training.' },
    { id: 14, type: 'tfng', text: 'Cooking with friends is recommended because it is more enjoyable.', answer: 'True', evidence: 'Part 2: "cooking with friends, because it makes the process more enjoyable".' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 1, evidence: 'Part 3 A: "Ulugbek was not only a ruler but also a serious scientist".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 4, evidence: 'Part 3 B: "Part of it was built into a deep trench cut into the hill".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 3, evidence: 'Part 3 C: "a famous catalogue of stars".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 0, evidence: 'Part 3 D: "calculated the length of the year with remarkable accuracy".' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 6, evidence: 'Part 3 E: "it was destroyed. Its exact location was eventually forgotten".' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 2, evidence: 'Part 3 F: "an archaeologist discovered the remains"; "Today the site is a museum".' },
    { id: 21, type: 'fill', text: 'Many people feel more tired in winter, when the days are ______.', answers: ['short'], evidence: 'Part 4: "in winter, when the days are short".' },
    { id: 22, type: 'fill', text: 'For some people, the effect can affect their work and ______.', answers: ['relationships'], evidence: 'Part 4: "affect their work and relationships".' },
    { id: 23, type: 'fill', text: 'Light helps to regulate our internal body ______.', answers: ['clock'], evidence: 'Part 4: "regulating our internal body clock".' },
    { id: 24, type: 'fill', text: 'Bright light in the ______ helps the body know when to be awake.', answers: ['morning'], evidence: 'Part 4: "Exposure to bright light in the morning helps the body".' },
    { id: 25, type: 'fill', text: 'In light therapy, patients sit near a special ______.', answers: ['lamp'], evidence: 'Part 4: "Patients sit near a special lamp".' },
    { id: 26, type: 'fill', text: 'Many patients say their ______ improves within a few weeks.', answers: ['mood'], evidence: 'Part 4: "their mood improves within a few weeks".' },
    { id: 27, type: 'fill', text: 'Going outside helps even when it is ______.', answers: ['cloudy'], evidence: 'Part 4: "even when it is cloudy, can help".' },
    { id: 28, type: 'fill', text: 'Regular ______ supports a healthy body clock.', answers: ['exercise'], evidence: 'Part 4: "Regular exercise and keeping a fixed time for going to bed".' },
    { id: 29, type: 'mcq', text: 'According to the idea of decision fatigue, people who have made many choices', options: ['make better decisions.', 'are more likely to take the easy option.', 'feel more energetic.', 'become more creative.'], answer: 1, evidence: 'Part 5: "become more likely to take the easy option or to avoid deciding at all".' },
    { id: 30, type: 'mcq', text: 'Why did some executives wear the same type of clothes every day?', options: ['To look professional', 'To save money', 'To save mental energy', 'To follow company rules'], answer: 2, evidence: 'Part 5: "in order to save their mental energy for more important matters".' },
    { id: 31, type: 'mcq', text: 'What happened when large studies tried to repeat the original experiments?', options: ['They failed to find the same effect.', 'They found a stronger effect.', 'They were stopped early.', 'They confirmed the theory.'], answer: 0, evidence: 'Part 5: "failed to find the same effect".' },
    { id: 32, type: 'mcq', text: 'What may partly influence the results, according to some researchers?', options: ['The time of year', 'What people believe about their own willpower', 'The size of the group', 'The language of the test'], answer: 1, evidence: 'Part 5: "the results may depend partly on what people believe about their own willpower".' },
    { id: 33, type: 'mcq', text: 'People who think their self-control is unlimited', options: ['make more decisions.', 'are more often tired.', 'avoid difficult choices.', 'appear less likely to show signs of fatigue.'], answer: 3, evidence: 'Part 5: "appear less likely to show signs of fatigue".' },
    { id: 34, type: 'mcq', text: 'What does the writer say remains uncertain?', options: ['Whether sleep affects thinking', 'Whether a single resource is used by every decision', 'Whether hunger matters', 'Whether people make many decisions'], answer: 1, evidence: 'Part 5: "What remains uncertain is whether there is a single resource that every decision consumes."' },
    { id: 35, type: 'mcq', text: 'What practical advice does the writer give?', options: ['Make all decisions early in the morning.', 'Wear the same clothes every day.', 'Avoid important choices when exhausted or rushed.', 'Make decisions as quickly as possible.'], answer: 2, evidence: 'Part 5: important choices "should not be made when we are exhausted or rushed".' },
  ],
};
