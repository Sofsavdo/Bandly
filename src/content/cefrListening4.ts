import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 4: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'C', text: 'One. Excuse me, how often do the trains to the airport run?' },
  { speaker: 'B', text: 'Every half an hour during the day, but only once an hour after nine in the evening.' },
  { speaker: 'A', text: 'Two. Did you buy the blue shirt in the end?' },
  { speaker: 'D', text: 'No, they only had it in small. I got the white one instead.' },
  { speaker: 'D', text: "Three. Hello, I'm calling to cancel my appointment on Friday." },
  { speaker: 'B', text: 'No problem. Would you like to book another day?' },
  { speaker: 'D', text: 'Yes, Monday afternoon, if possible.' },
  { speaker: 'B', text: 'Monday at three is free. I’ll put you down for that.' },
  { speaker: 'C', text: 'Four. What do you want to do this weekend?' },
  { speaker: 'A', text: "I'd love to go to the mountains, but the forecast says heavy rain. Let's go to the new museum instead." },
  { speaker: 'B', text: 'Five. Attention, please. Because of a technical problem, the lift in the east building is not working. Please use the stairs or the lift in the west building.' },
  { speaker: 'A', text: 'Six. How much is a ticket for the concert?' },
  { speaker: 'C', text: 'Normally it’s fifteen dollars, but students pay ten.' },
  { speaker: 'A', text: "Great, I've got my student card with me." },
  { speaker: 'D', text: 'Seven. You look tired.' },
  { speaker: 'C', text: "I am. My neighbours had a party until three in the morning, and I couldn't sleep." },
  { speaker: 'B', text: "Eight. Hello, I'm phoning about the flat you advertised. Is it still available?" },
  { speaker: 'A', text: "I'm afraid someone took it yesterday, but I have a similar one on the same street." },
];

const P2: L[] = [
  { speaker: 'B', text: 'Good news for swimmers: the City Sports Centre swimming pool will reopen on Monday the third of April, after six months of repairs. The pool now has a new roof and a new heating system, so the water will be warmer than before.' },
  { speaker: 'B', text: 'Opening hours are from seven in the morning until ten at night on weekdays, and from eight until six at weekends. Early morning sessions, before nine, are for adults only.' },
  { speaker: 'B', text: 'A single swim costs four dollars for adults and two dollars for children. If you swim regularly, a monthly card at thirty dollars is much better value.' },
  { speaker: 'B', text: 'Swimming lessons for children start again in May. There are groups for beginners and for more experienced swimmers. To book a place, please visit the reception desk; lessons cannot be booked by phone.' },
  { speaker: 'B', text: 'Finally, please remember that swimming caps are now compulsory for everyone. They can be bought at reception for one dollar.' },
];

const P3: L[] = [
  { speaker: 'C', text: "Max, I've found two English courses, and I can't decide which one is better." },
  { speaker: 'D', text: 'Tell me about them.' },
  { speaker: 'C', text: "The first is at the university language centre. It's three evenings a week, and it costs two hundred dollars a month. The second is online, with a teacher in London, twice a week, for a hundred and twenty." },
  { speaker: 'D', text: 'The online one is cheaper. But do you want to sit at a computer after work?' },
  { speaker: 'C', text: "That's my worry. I already look at a screen all day. And at the language centre I'd meet other students and practise speaking." },
  { speaker: 'D', text: 'How long does it take you to get to the university?' },
  { speaker: 'C', text: "About forty minutes by bus. That's the main disadvantage." },
  { speaker: 'D', text: "Could you ask if they have a weekend group? Then you wouldn't have to travel after work." },
  { speaker: 'C', text: 'Good idea. Actually, they do have a Saturday morning class. It’s four hours long.' },
  { speaker: 'D', text: "Four hours is a lot, but it's only once a week. I'd go for that." },
  { speaker: 'C', text: "You're right. I'll call them tomorrow and ask whether there are any places left." },
];

const P4: L[] = [
  { speaker: 'A', text: "Today I'm talking to Max, who gave up a job in the city to run his family's apricot farm. Max, why did you go back to the farm?" },
  { speaker: 'D', text: "My grandfather was getting too old to manage it, and nobody else in the family wanted to take it over. I didn't want the farm to be sold, so I decided to try it for one year." },
  { speaker: 'A', text: 'And now?' },
  { speaker: 'D', text: 'That was six years ago! I never went back to the city.' },
  { speaker: 'A', text: 'What has changed since you took over?' },
  { speaker: 'D', text: 'The biggest change is that we now dry most of our apricots instead of selling them fresh. Fresh fruit must be sold within a few days, but dried apricots can be stored for months and sold abroad.' },
  { speaker: 'A', text: 'Who buys them?' },
  { speaker: 'D', text: 'At first we only sold at local markets. Now about half goes to buyers in Russia and Kazakhstan.' },
  { speaker: 'A', text: "What's the most difficult part of the work?" },
  { speaker: 'D', text: 'Spring frosts. If the temperature falls below zero when the trees are flowering, we can lose most of the harvest in one night. Two years ago that happened, and we lost about seventy per cent of the crop.' },
  { speaker: 'A', text: 'Is there anything you can do?' },
  { speaker: 'D', text: "We've installed a system that sprays water on the trees on cold nights. It sounds strange, but the ice actually protects the flowers." },
  { speaker: 'A', text: 'Would you recommend farming to young people?' },
  { speaker: 'D', text: 'Yes, but they need to learn modern methods. I took an online course in farm management, and it helped me much more than I expected.' },
];

const P5: L[] = [
  { speaker: 'A', text: "Today's lecture is about the history of money. Before money existed, people exchanged goods directly, a system known as barter. A farmer might exchange grain for tools. The problem was that both people had to want what the other one had." },
  { speaker: 'A', text: 'To solve this, many societies began to use objects that everyone accepted as valuable, such as shells, salt or cattle. Later, metal became popular, because it was durable and could be divided into small pieces.' },
  { speaker: 'A', text: 'The first coins were made in Lydia, in what is now Turkey, more than two and a half thousand years ago. They were made of a natural mixture of gold and silver, and they were stamped with a picture.' },
  { speaker: 'A', text: 'Paper money was first used in China, around a thousand years ago. Merchants found metal coins too heavy to carry over long distances, so they left them with trusted traders and received paper receipts instead.' },
  { speaker: 'A', text: 'In Europe, banknotes became common only in the seventeenth century. For a long time, their value was linked to gold, which meant that people could, in theory, exchange their notes for a fixed amount of gold at the bank.' },
  { speaker: 'A', text: "Today, most money exists only as numbers in computers. Next week we'll look at how cards and mobile payments have changed the way we shop." },
];

export const cefrListening4: ListeningTest = {
  id: 'cefr-listening-4',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 4',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) suzish havzasi qayta ochilishi haqida e’lon; 3) ikki do‘stning ingliz tili kursini tanlashi; 4) o‘rik bog‘i egasi bilan intervyu; 5) pul tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'How often do airport trains run after 9 pm?', options: ['Every half an hour', 'Once an hour', 'Every two hours'], answer: 1, evidence: 'Part 1, 1: "only once an hour after nine in the evening".' },
    { id: 2, type: 'mcq', text: 'What did the man buy?', options: ['A white shirt', 'A blue shirt', 'Nothing'], answer: 0, evidence: 'Part 1, 2: "I got the white one instead."' },
    { id: 3, type: 'mcq', text: 'When is the new appointment?', options: ['On Friday', 'On Monday morning', 'On Monday afternoon'], answer: 2, evidence: 'Part 1, 3: "Monday at three is free."' },
    { id: 4, type: 'mcq', text: 'Where will they go this weekend?', options: ['To the mountains', 'To the new museum', 'To the cinema'], answer: 1, evidence: 'Part 1, 4: "Let\'s go to the new museum instead."' },
    { id: 5, type: 'mcq', text: 'What should people in the east building do?', options: ['Use the stairs or the lift in the west building', 'Wait for the lift to be repaired', 'Leave the building'], answer: 0, evidence: 'Part 1, 5: "Please use the stairs or the lift in the west building."' },
    { id: 6, type: 'mcq', text: 'How much will the woman pay for the concert?', options: ['Fifteen dollars', 'Five dollars', 'Ten dollars'], answer: 2, evidence: 'Part 1, 6: "students pay ten" — "I\'ve got my student card".' },
    { id: 7, type: 'mcq', text: 'Why is the woman tired?', options: ['She worked late.', 'Her neighbours had a party.', 'She was travelling.'], answer: 1, evidence: 'Part 1, 7: "My neighbours had a party until three in the morning".' },
    { id: 8, type: 'mcq', text: 'What is true about the flat?', options: ['It is still available.', 'The price has gone up.', 'It has already been taken.'], answer: 2, evidence: 'Part 1, 8: "someone took it yesterday".' },
    { id: 9, type: 'fill', text: 'The pool reopens on Monday 3 ______.', answers: ['april'], evidence: 'Part 2: "will reopen on Monday the third of April".' },
    { id: 10, type: 'fill', text: 'Repairs lasted ______ months.', answers: ['6', 'six'], evidence: 'Part 2: "after six months of repairs".' },
    { id: 11, type: 'fill', text: 'Sessions before 9 am are for ______ only.', answers: ['adults'], evidence: 'Part 2: "Early morning sessions, before nine, are for adults only."' },
    { id: 12, type: 'fill', text: 'Monthly card: $______', answers: ['30', 'thirty'], evidence: 'Part 2: "a monthly card at thirty dollars".' },
    { id: 13, type: 'fill', text: 'Children’s lessons start again in ______.', answers: ['may'], evidence: 'Part 2: "Swimming lessons for children start again in May."' },
    { id: 14, type: 'fill', text: 'Compulsory for everyone: swimming ______', answers: ['caps'], evidence: 'Part 2: "swimming caps are now compulsory for everyone".' },
    { id: 15, type: 'mcq', text: 'How often is the evening course at the language centre?', options: ['Twice a week', 'Three evenings a week', 'Once a week'], answer: 1, evidence: 'Part 3: "It\'s three evenings a week".' },
    { id: 16, type: 'mcq', text: 'How much does the online course cost?', options: ['$120', '$200', '$40'], answer: 0, evidence: 'Part 3: "twice a week, for a hundred and twenty".' },
    { id: 17, type: 'mcq', text: 'What is Hope’s worry about the online course?', options: ['The teacher is far away.', 'It is too expensive.', 'She already looks at a screen all day.'], answer: 2, evidence: 'Part 3: "I already look at a screen all day."' },
    { id: 18, type: 'mcq', text: 'What is the main disadvantage of the language centre?', options: ['The journey takes about forty minutes.', 'The groups are too large.', 'There are no other students.'], answer: 0, evidence: 'Part 3: "About forty minutes by bus. That\'s the main disadvantage."' },
    { id: 19, type: 'mcq', text: 'What does Max suggest?', options: ['Choosing the online course', 'Asking about a weekend group', 'Finding a private teacher'], answer: 1, evidence: 'Part 3: "Could you ask if they have a weekend group?"' },
    { id: 20, type: 'mcq', text: 'What will Hope do tomorrow?', options: ['Start the online course', 'Visit the university', 'Call to ask about places'], answer: 2, evidence: 'Part 3: "I\'ll call them tomorrow and ask whether there are any places left."' },
    { id: 21, type: 'mcq', text: 'Why did Max go back to the farm?', options: ['He lost his job in the city.', 'He did not want the farm to be sold.', 'His parents asked him to.'], answer: 1, evidence: 'Part 4: "I didn\'t want the farm to be sold".' },
    { id: 22, type: 'mcq', text: 'How long has Max been running the farm?', options: ['Six years', 'One year', 'Ten years'], answer: 0, evidence: 'Part 4: "That was six years ago!"' },
    { id: 23, type: 'mcq', text: 'What is the biggest change since he took over?', options: ['They sell only fresh fruit.', 'They grow new kinds of fruit.', 'They dry most of their apricots.'], answer: 2, evidence: 'Part 4: "we now dry most of our apricots instead of selling them fresh".' },
    { id: 24, type: 'mcq', text: 'What is the advantage of dried apricots?', options: ['They can be stored for months.', 'They are easier to grow.', 'They taste sweeter.'], answer: 0, evidence: 'Part 4: "dried apricots can be stored for months and sold abroad".' },
    { id: 25, type: 'mcq', text: 'Where does about half of the fruit go now?', options: ['To local markets', 'To buyers in Russia and Kazakhstan', 'To factories in the city'], answer: 1, evidence: 'Part 4: "Now about half goes to buyers in Russia and Kazakhstan."' },
    { id: 26, type: 'mcq', text: 'What is the most difficult part of the work?', options: ['Finding workers', 'Spring frosts', 'Summer heat'], answer: 1, evidence: 'Part 4: "Spring frosts."' },
    { id: 27, type: 'mcq', text: 'How much of the crop did they lose two years ago?', options: ['About half', 'Almost all', 'About seventy per cent'], answer: 2, evidence: 'Part 4: "we lost about seventy per cent of the crop".' },
    { id: 28, type: 'mcq', text: 'What helped Max more than he expected?', options: ['An online course in farm management', 'Advice from his grandfather', 'A bank loan'], answer: 0, evidence: 'Part 4: "I took an online course in farm management, and it helped me much more than I expected."' },
    { id: 29, type: 'fill', text: 'Exchanging goods directly is called ______.', answers: ['barter'], evidence: 'Part 5: "a system known as barter".' },
    { id: 30, type: 'fill', text: 'Objects used as money included shells, salt and ______.', answers: ['cattle'], evidence: 'Part 5: "such as shells, salt or cattle".' },
    { id: 31, type: 'fill', text: 'Metal became popular because it was ______.', answers: ['durable'], evidence: 'Part 5: "because it was durable".' },
    { id: 32, type: 'fill', text: 'The first coins were made in ______.', answers: ['lydia'], evidence: 'Part 5: "The first coins were made in Lydia".' },
    { id: 33, type: 'fill', text: 'Paper money was first used in ______.', answers: ['china'], evidence: 'Part 5: "Paper money was first used in China".' },
    { id: 34, type: 'fill', text: 'Merchants found metal coins too ______ to carry.', answers: ['heavy'], evidence: 'Part 5: "Merchants found metal coins too heavy to carry".' },
    { id: 35, type: 'fill', text: 'The value of banknotes was linked to ______.', answers: ['gold'], evidence: 'Part 5: "their value was linked to gold".' },
  ],
};
