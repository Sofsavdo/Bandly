import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi: 35 savol, 45 daqiqa (umumiy hajm va vaqt rasmiy manbada tasdiqlangan).
// Ichki qismlar Bandly'niki (rasmiy manbada ko'rsatilmagan). Original mashq skripti; metodist tekshiruvini kutmoqda (PXD-05).
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope (US), D — Max (US).
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'C', text: 'One. Excuse me, does this bus go to the airport?' },
  { speaker: 'B', text: "Not this one, I'm afraid. You need the number forty-two. It leaves from the stop across the road every twenty minutes." },
  { speaker: 'A', text: "Two. Shall we eat at the Italian place tonight?" },
  { speaker: 'D', text: "I'd rather not. We had pizza on Monday. What about that new Korean restaurant near the park?" },
  { speaker: 'A', text: "Fine, let's try it." },
  { speaker: 'C', text: "Three. Hi, I'm calling about my order. It was supposed to arrive yesterday, but nothing came." },
  { speaker: 'B', text: "I'm sorry about that. I can see there was a problem with the address. I'll send it again today, and you'll get it by Thursday." },
  { speaker: 'D', text: "Four. How was the exam?" },
  { speaker: 'A', text: "The reading part was fine, but I ran out of time in the writing section. I only finished half of the second essay." },
  { speaker: 'B', text: "Five. Attention, please. The train to Samarkand will now depart from platform three, not platform five. Passengers are asked to move to platform three immediately." },
  { speaker: 'C', text: "Six. Are you coming to the gym this evening?" },
  { speaker: 'D', text: "I can't. My sister is arriving from Tashkent and I promised to pick her up from the station." },
  { speaker: 'A', text: "Seven. Doctor, I've had a headache for three days now." },
  { speaker: 'B', text: "Are you drinking enough water? And how many hours are you spending in front of a screen?" },
  { speaker: 'A', text: "Probably ten. I'm working on a big project." },
  { speaker: 'B', text: "Then I suggest regular breaks first. If it doesn't improve in a week, come back and see me." },
  { speaker: 'D', text: "Eight. I really like this jacket, but it's a bit expensive." },
  { speaker: 'C', text: "It's actually twenty per cent cheaper this weekend. The sale starts on Saturday." },
];

const P2: L[] = [
  { speaker: 'B', text: "Welcome to the Riverside Summer Festival. Here is some information to help you enjoy your day. The festival runs from ten in the morning until eleven at night. The main stage is in the centre of the park, and the first concert begins at two o'clock." },
  { speaker: 'B', text: "If you're interested in food, the market is next to the lake, where you can try dishes from more than twenty countries. Please remember that the festival is plastic-free, so bring your own bottle. Water is free at the fountains near each entrance." },
  { speaker: 'B', text: "For families, there's a children's area beside the north gate, with games and face painting. Children under twelve must be with an adult at all times. If you lose your group, go to the information tent, which is the large blue tent next to the main stage." },
  { speaker: 'B', text: "Finally, the festival ends with fireworks over the lake at ten thirty. The last buses back to the city centre leave at eleven fifteen, so please plan your journey home." },
];

const P3: L[] = [
  { speaker: 'C', text: "So, Bek, we need to choose a topic for our group project in economics. Any ideas?" },
  { speaker: 'D', text: "I was thinking about small family businesses in our city. My uncle runs a bakery, so we could interview him." },
  { speaker: 'C', text: "That's a nice idea, but our teacher said the project should include data, not only interviews. Could we get numbers from your uncle?" },
  { speaker: 'D', text: "He keeps records of his sales, and I think he'd share them if we don't publish his name." },
  { speaker: 'C', text: "Good. We could compare his sales before and after he started selling online. That would be interesting." },
  { speaker: 'D', text: "Agreed. He started online orders about two years ago. He says it was difficult at first because he had to learn to take good photos of the bread." },
  { speaker: 'C', text: "Ha! How about the presentation? I'm not very confident speaking in front of the class." },
  { speaker: 'D', text: "Then you could prepare the charts, and I'll present. But you should say at least one part, because the teacher gives marks to each person." },
  { speaker: 'C', text: "OK, I'll present the conclusion. That's the shortest part. When is the deadline again?" },
  { speaker: 'D', text: "The twentieth of May. Let's aim to finish a week earlier, so we have time to practise." },
];

const P4: L[] = [
  { speaker: 'A', text: "Today on 'Working Lives' I'm talking to Daniel, who left his job in a bank to become a mountain guide. Daniel, why did you make such a big change?" },
  { speaker: 'D', text: "Honestly, I was bored. The salary was good, but I spent all day in an office looking at numbers. At weekends I always went hiking, and one day I realised I was only really happy on Saturdays and Sundays." },
  { speaker: 'A', text: "Was it difficult to start?" },
  { speaker: 'D', text: "Very. I needed a qualification, which took almost a year, and during that time I had almost no income. My family was worried, especially my father, who thought I was making a mistake." },
  { speaker: 'A', text: "And now?" },
  { speaker: 'D', text: "Now he comes on some of my tours! He's changed his mind completely." },
  { speaker: 'A', text: "What's the hardest part of the job?" },
  { speaker: 'D', text: "The weather. You have to make decisions quickly. If a storm is coming, you must turn back, even if the group is disappointed. Safety always comes first." },
  { speaker: 'A', text: "Do you earn as much as before?" },
  { speaker: 'D', text: "No, less, maybe half in a bad year. But I spend less too, and I'm much healthier." },
  { speaker: 'A', text: "What advice would you give to people who want to change careers?" },
  { speaker: 'D', text: "Try the new work part-time first, if you can. I guided small groups at weekends for a year before I left the bank. That way I knew I really enjoyed it." },
];

const P5: L[] = [
  { speaker: 'A', text: "In today's lecture I want to look at the history of tea, one of the most widely drunk beverages in the world. Tea originated in China, where it was first used as a medicine before it became an everyday drink." },
  { speaker: 'A', text: "From China, tea spread to Japan, where a formal tea ceremony developed, and later along trade routes to Central Asia, India and Europe. In Central Asia, tea became an important part of hospitality: offering tea to a guest is still a sign of respect." },
  { speaker: 'A', text: "In Europe, tea arrived in the seventeenth century. At first it was very expensive, so only wealthy families could afford it. It was often kept in locked boxes to prevent servants from taking it." },
  { speaker: 'A', text: "Over time, prices fell, largely because of large plantations established in India and later in Sri Lanka. By the nineteenth century, tea had become a drink for all social classes in Britain." },
  { speaker: 'A', text: "The way tea is prepared varies a great deal. In some countries it is served with milk, in others with sugar, lemon or even salt. Green tea, which is not fermented, remains especially popular in East Asia and in parts of Central Asia." },
  { speaker: 'A', text: "Next week we'll discuss coffee, and compare how the two drinks influenced trade and social life." },
];

export const cefrListening1: ListeningTest = {
  id: 'cefr-listening-1',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 1',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) festival haqida e’lon; 3) ikki talabaning loyiha muhokamasi; 4) radio intervyu; 5) choy tarixi haqida ma’ruza.',
  script: [...P1, ...P2, ...P3, ...P4, ...P5],
  sections: [
    { at: 0, title: 'Part 1 — Questions 1–8' },
    { at: P1.length, title: 'Part 2 — Questions 9–14' },
    { at: P1.length + P2.length, title: 'Part 3 — Questions 15–20' },
    { at: P1.length + P2.length + P3.length, title: 'Part 4 — Questions 21–28' },
    { at: P1.length + P2.length + P3.length + P4.length, title: 'Part 5 — Questions 29–35' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–8: You will hear eight short conversations. Choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6, 7, 8] },
    { instruction: 'Part 2 — Questions 9–14: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct answer.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Choose the correct answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Which bus goes to the airport?', options: ['This bus', 'Number 42', 'Number 20'], answer: 1, evidence: 'Part 1, 1: "You need the number forty-two."' },
    { id: 2, type: 'mcq', text: 'Where will they eat tonight?', options: ['At an Italian restaurant', 'At a Korean restaurant', 'At home'], answer: 1, evidence: 'Part 1, 2: "What about that new Korean restaurant…" — "Fine, let\'s try it."' },
    { id: 3, type: 'mcq', text: 'Why did the order not arrive?', options: ['It was sold out.', 'There was a problem with the address.', 'The driver was ill.'], answer: 1, evidence: 'Part 1, 3: "there was a problem with the address".' },
    { id: 4, type: 'mcq', text: 'What was the problem in the exam?', options: ['The reading was too hard.', 'She ran out of time in writing.', 'She arrived late.'], answer: 1, evidence: 'Part 1, 4: "I ran out of time in the writing section".' },
    { id: 5, type: 'mcq', text: 'Which platform does the Samarkand train leave from now?', options: ['Platform 3', 'Platform 5', 'Platform 13'], answer: 0, evidence: 'Part 1, 5: "will now depart from platform three".' },
    { id: 6, type: 'mcq', text: 'Why can’t the man go to the gym?', options: ['He is ill.', 'He has to work late.', 'He is meeting his sister at the station.'], answer: 2, evidence: 'Part 1, 6: "I promised to pick her up from the station".' },
    { id: 7, type: 'mcq', text: 'What does the doctor suggest first?', options: ['Taking medicine', 'Taking regular breaks', 'Seeing a specialist'], answer: 1, evidence: 'Part 1, 7: "I suggest regular breaks first".' },
    { id: 8, type: 'mcq', text: 'When does the sale start?', options: ['Today', 'On Friday', 'On Saturday'], answer: 2, evidence: 'Part 1, 8: "The sale starts on Saturday."' },
    { id: 9, type: 'fill', text: 'First concert on the main stage: ______ o’clock', answers: ['2', 'two'], evidence: 'Part 2: "the first concert begins at two o\'clock".' },
    { id: 10, type: 'fill', text: 'Food market: next to the ______', answers: ['lake'], evidence: 'Part 2: "the market is next to the lake".' },
    { id: 11, type: 'fill', text: 'The festival is ______-free: bring your own bottle.', answers: ['plastic'], evidence: 'Part 2: "the festival is plastic-free".' },
    { id: 12, type: 'fill', text: 'Children’s area: beside the ______ gate', answers: ['north'], evidence: 'Part 2: "a children\'s area beside the north gate".' },
    { id: 13, type: 'fill', text: 'Information tent colour: ______', answers: ['blue'], evidence: 'Part 2: "the large blue tent next to the main stage".' },
    { id: 14, type: 'fill', text: 'Last buses to the city centre: 11.______ pm', answers: ['15', 'fifteen'], evidence: 'Part 2: "The last buses … leave at eleven fifteen".' },
    { id: 15, type: 'mcq', text: 'What business will the students study?', options: ['A café', 'A bakery', 'A clothes shop'], answer: 1, evidence: 'Part 3: "My uncle runs a bakery".' },
    { id: 16, type: 'mcq', text: 'What did the teacher say the project must include?', options: ['Data', 'Photos', 'A video'], answer: 0, evidence: 'Part 3: "the project should include data, not only interviews".' },
    { id: 17, type: 'mcq', text: 'On what condition will the uncle share his records?', options: ['If they pay him', 'If his name is not published', 'If they help in the shop'], answer: 1, evidence: 'Part 3: "if we don\'t publish his name".' },
    { id: 18, type: 'mcq', text: 'What was difficult for the uncle when he started selling online?', options: ['Delivering bread', 'Taking good photos', 'Setting prices'], answer: 1, evidence: 'Part 3: "he had to learn to take good photos of the bread".' },
    { id: 19, type: 'mcq', text: 'Which part will the woman present?', options: ['The introduction', 'The charts', 'The conclusion'], answer: 2, evidence: 'Part 3: "OK, I\'ll present the conclusion."' },
    { id: 20, type: 'mcq', text: 'When do they plan to finish the project?', options: ['On 13 May', 'On 20 May', 'On 27 May'], answer: 0, evidence: 'Part 3: deadline 20 May, "finish a week earlier" — 13 May.' },
    { id: 21, type: 'mcq', text: 'Why did Daniel leave the bank?', options: ['The salary was low.', 'He was bored.', 'He lost his job.'], answer: 1, evidence: 'Part 4: "Honestly, I was bored."' },
    { id: 22, type: 'mcq', text: 'How long did his qualification take?', options: ['About six months', 'Almost a year', 'Two years'], answer: 1, evidence: 'Part 4: "I needed a qualification, which took almost a year".' },
    { id: 23, type: 'mcq', text: 'Who was most worried about his decision?', options: ['His mother', 'His father', 'His wife'], answer: 1, evidence: 'Part 4: "especially my father".' },
    { id: 24, type: 'mcq', text: 'How does his father feel now?', options: ['He still disagrees.', 'He has changed his mind.', 'He does not talk about it.'], answer: 1, evidence: 'Part 4: "He\'s changed his mind completely."' },
    { id: 25, type: 'mcq', text: 'What does Daniel find hardest?', options: ['The weather', 'Long walks', 'Difficult clients'], answer: 0, evidence: 'Part 4: "The weather."' },
    { id: 26, type: 'mcq', text: 'What must a guide do if a storm is coming?', options: ['Wait in a hut', 'Turn back', 'Call for a helicopter'], answer: 1, evidence: 'Part 4: "If a storm is coming, you must turn back".' },
    { id: 27, type: 'mcq', text: 'How does his income compare with before?', options: ['It is higher.', 'It is the same.', 'It is lower.'], answer: 2, evidence: 'Part 4: "No, less, maybe half in a bad year."' },
    { id: 28, type: 'mcq', text: 'What advice does Daniel give?', options: ['Save money first', 'Try the new work part-time first', 'Get a degree'], answer: 1, evidence: 'Part 4: "Try the new work part-time first".' },
    { id: 29, type: 'fill', text: 'In China, tea was first used as a ______.', answers: ['medicine'], evidence: 'Part 5: "first used as a medicine".' },
    { id: 30, type: 'fill', text: 'In Japan, a formal tea ______ developed.', answers: ['ceremony'], evidence: 'Part 5: "a formal tea ceremony developed".' },
    { id: 31, type: 'fill', text: 'In Central Asia, offering tea to a guest is a sign of ______.', answers: ['respect'], evidence: 'Part 5: "a sign of respect".' },
    { id: 32, type: 'fill', text: 'In Europe, tea was kept in locked ______.', answers: ['boxes'], evidence: 'Part 5: "kept in locked boxes".' },
    { id: 33, type: 'fill', text: 'Prices fell because of large ______ in India and Sri Lanka.', answers: ['plantations'], evidence: 'Part 5: "large plantations established in India and later in Sri Lanka".' },
    { id: 34, type: 'fill', text: 'Green tea is not ______.', answers: ['fermented'], evidence: 'Part 5: "Green tea, which is not fermented".' },
    { id: 35, type: 'fill', text: 'Next week’s topic: ______', answers: ['coffee'], evidence: 'Part 5: "Next week we\'ll discuss coffee".' },
  ],
};
