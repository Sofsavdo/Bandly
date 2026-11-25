import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 3: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'B', text: 'One. Excuse me, is this seat free?' },
  { speaker: 'C', text: "Sorry, my friend is sitting there. She's just gone to get some coffee. But the seat by the window is free." },
  { speaker: 'A', text: 'Two. How was your holiday in Turkey?' },
  { speaker: 'D', text: 'The hotel was lovely, but it rained almost every day, so we spent most of the time indoors.' },
  { speaker: 'C', text: "Three. I've lost my keys again!" },
  { speaker: 'D', text: 'Have you looked in your coat pocket? You had them when we came in.' },
  { speaker: 'C', text: 'Oh, here they are.' },
  { speaker: 'B', text: 'Four. Can I help you?' },
  { speaker: 'A', text: "Yes, I'm looking for a birthday card for my son. He's turning ten." },
  { speaker: 'B', text: 'Cards are on the second shelf, next to the wrapping paper.' },
  { speaker: 'D', text: 'Five. This is a message for all students. The English exam has been moved from Room 6 to the main hall, because more students registered than expected.' },
  { speaker: 'A', text: 'Six. Shall I call a taxi?' },
  { speaker: 'B', text: "There's no need. It's a lovely evening, and it's only a fifteen-minute walk." },
  { speaker: 'C', text: "Seven. Hello, I'd like to make an appointment with Dr Karimov." },
  { speaker: 'D', text: "He's on holiday this week. Dr Saidova has a free appointment tomorrow at eleven. Would that suit you?" },
  { speaker: 'C', text: "Yes, that's fine." },
  { speaker: 'B', text: 'Eight. What would you like to drink?' },
  { speaker: 'A', text: "I usually have coffee, but it's late, so I'll have a glass of orange juice." },
];

const P2: L[] = [
  { speaker: 'B', text: "Good morning and welcome to the Greenfield College open day. I'm the head of admissions. Today you'll have the chance to see our classrooms, meet teachers and ask questions about our courses." },
  { speaker: 'B', text: "The day begins with a short presentation in the main hall at ten o'clock. After that, you can join one of the guided tours, which leave every thirty minutes from the reception area." },
  { speaker: 'B', text: "At midday, there'll be a free lunch in the student canteen, which is on the ground floor of the new building. In the afternoon, teachers will be available in the library to answer questions about specific courses." },
  { speaker: 'B', text: "If you'd like to apply, the deadline for applications is the fifteenth of March. You'll need two references, one of which should be from a teacher." },
  { speaker: 'B', text: 'Finally, the college car park is full today, so if you came by car, please park in the supermarket car park opposite the college.' },
];

const P3: L[] = [
  { speaker: 'C', text: 'Max, have you heard? Mr Rahimov is retiring at the end of the month.' },
  { speaker: 'D', text: "Yes, I heard. We should organise something for him. He's been here for thirty years." },
  { speaker: 'C', text: 'I was thinking of a small party in the office, on his last Friday.' },
  { speaker: 'D', text: 'The office is a bit small. What about the restaurant across the road? They have a private room.' },
  { speaker: 'C', text: "That would be nicer, but it's expensive. How many people do you think would come?" },
  { speaker: 'D', text: 'Probably around twenty-five. If everyone paid ten dollars, we could cover the food.' },
  { speaker: 'C', text: "OK, let's ask the restaurant. What about a present?" },
  { speaker: 'D', text: "He's always talking about his garden. Maybe some gardening tools?" },
  { speaker: 'C', text: 'His daughter told me he already has everything for the garden. She suggested a book about the history of our city. He loves history.' },
  { speaker: 'D', text: 'Perfect. And we could all sign a card.' },
  { speaker: 'C', text: "I'll collect the money and buy the present. Could you book the restaurant?" },
  { speaker: 'D', text: "Sure. I'll call them this afternoon." },
];

const P4: L[] = [
  { speaker: 'A', text: 'My guest today is Max, who has just returned from an extraordinary journey: he cycled from Tashkent to London. Max, how long did it take?' },
  { speaker: 'D', text: 'Just over five months. I left in April and arrived in London in the middle of September.' },
  { speaker: 'A', text: 'Why did you decide to do it?' },
  { speaker: 'D', text: "I wanted to raise money for a children's hospital in Tashkent. My younger brother was treated there when he was small, and I wanted to thank them." },
  { speaker: 'A', text: 'How much did you raise?' },
  { speaker: 'D', text: "Around fifteen thousand dollars, which is more than double what I'd hoped." },
  { speaker: 'A', text: 'What was the hardest part?' },
  { speaker: 'D', text: 'Not the mountains, surprisingly. It was the wind. In some places, I was cycling against strong wind for days, and I could only travel forty or fifty kilometres a day.' },
  { speaker: 'A', text: 'Where did you sleep?' },
  { speaker: 'D', text: 'Mostly in a small tent. But people were incredibly kind. Many families invited me into their homes, and I often got a hot meal and a bed.' },
  { speaker: 'A', text: 'Did anything go wrong?' },
  { speaker: 'D', text: "My bike was damaged in Turkey when a truck hit it while it was parked. Luckily, I wasn't on it. A local mechanic repaired it for free when he heard what I was doing." },
  { speaker: 'A', text: 'Would you do it again?' },
  { speaker: 'D', text: "Yes, but next time I'd go with a friend. Being alone for so long was harder than I expected." },
];

const P5: L[] = [
  { speaker: 'A', text: 'Today I want to talk about chocolate, a food that has travelled a long way from its origins. Chocolate comes from the seeds of the cacao tree, which grows only in hot, wet regions close to the equator.' },
  { speaker: 'A', text: 'The first people to use cacao lived in Central and South America, more than three thousand years ago. The Maya and later the Aztecs made a bitter drink from the seeds, often mixed with chilli. Cacao seeds were so valuable that the Aztecs used them as money.' },
  { speaker: 'A', text: 'Spanish explorers brought cacao to Europe in the sixteenth century. Europeans found the drink too bitter, so they added sugar, and for about two hundred years chocolate remained a drink for the rich.' },
  { speaker: 'A', text: 'Solid chocolate as we know it was developed in the nineteenth century. A new machine made it possible to separate cocoa butter from the rest of the bean, and in 1875 a Swiss chocolate maker produced the first milk chocolate by adding dried milk.' },
  { speaker: 'A', text: 'Today, most of the world’s cacao is grown in West Africa, often on small family farms. Many of these farmers earn very little, and there are serious concerns about child labour. For this reason, some companies now buy cacao only from farms that have been independently checked.' },
  { speaker: 'A', text: "In our next lecture, we'll look at the history of sugar and its connection with chocolate." },
];

export const cefrListening3: ListeningTest = {
  id: 'cefr-listening-3',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 3',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) kollejning ochiq eshiklar kuni haqida e’lon; 3) hamkasbni nafaqaga kuzatish rejasi; 4) Toshkentdan Londongacha velosipedda sayohat qilgan yigit bilan intervyu; 5) shokolad tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'Where can the man sit?', options: ['Next to the woman', 'By the window', 'At the next table'], answer: 1, evidence: 'Part 1, 1: "the seat by the window is free".' },
    { id: 2, type: 'mcq', text: 'What was the problem on holiday?', options: ['The weather', 'The hotel', 'The food'], answer: 0, evidence: 'Part 1, 2: "it rained almost every day".' },
    { id: 3, type: 'mcq', text: 'Where were the keys?', options: ['In the car', 'On the table', 'In her coat pocket'], answer: 2, evidence: 'Part 1, 3: "Have you looked in your coat pocket?" — "Oh, here they are."' },
    { id: 4, type: 'mcq', text: 'What is the woman looking for?', options: ['Wrapping paper', 'A birthday card', 'A present for her son'], answer: 1, evidence: 'Part 1, 4: "I\'m looking for a birthday card for my son."' },
    { id: 5, type: 'mcq', text: 'Why has the exam room changed?', options: ['More students registered than expected.', 'Room 6 is being repaired.', 'The exam time has changed.'], answer: 0, evidence: 'Part 1, 5: "because more students registered than expected".' },
    { id: 6, type: 'mcq', text: 'How will they get there?', options: ['By taxi', 'By bus', 'On foot'], answer: 2, evidence: 'Part 1, 6: "it\'s only a fifteen-minute walk".' },
    { id: 7, type: 'mcq', text: 'Which doctor will the woman see?', options: ['Dr Karimov', 'Dr Saidova', 'She will not see a doctor this week.'], answer: 1, evidence: 'Part 1, 7: "Dr Saidova has a free appointment tomorrow at eleven." — "Yes, that\'s fine."' },
    { id: 8, type: 'mcq', text: 'What will the woman drink?', options: ['Orange juice', 'Coffee', 'Tea'], answer: 0, evidence: 'Part 1, 8: "I\'ll have a glass of orange juice".' },
    { id: 9, type: 'fill', text: 'Presentation in the main hall at ______ o’clock', answers: ['10', 'ten'], evidence: 'Part 2: "a short presentation in the main hall at ten o\'clock".' },
    { id: 10, type: 'fill', text: 'Guided tours leave every ______ minutes', answers: ['30', 'thirty'], evidence: 'Part 2: "which leave every thirty minutes".' },
    { id: 11, type: 'fill', text: 'Free lunch: in the student ______', answers: ['canteen'], evidence: 'Part 2: "a free lunch in the student canteen".' },
    { id: 12, type: 'fill', text: 'Afternoon: teachers answer questions in the ______', answers: ['library'], evidence: 'Part 2: "teachers will be available in the library".' },
    { id: 13, type: 'fill', text: 'Application deadline: 15 ______', answers: ['march'], evidence: 'Part 2: "the deadline for applications is the fifteenth of March".' },
    { id: 14, type: 'fill', text: 'Parking today: the ______ car park opposite the college', answers: ['supermarket'], evidence: 'Part 2: "park in the supermarket car park opposite the college".' },
    { id: 15, type: 'mcq', text: 'Why is Mr Rahimov leaving?', options: ['He has a new job.', 'He is moving to another city.', 'He is retiring.'], answer: 2, evidence: 'Part 3: "Mr Rahimov is retiring at the end of the month."' },
    { id: 16, type: 'mcq', text: 'Where does Max suggest having the party?', options: ['In the restaurant across the road', 'In the office', 'At Mr Rahimov’s home'], answer: 0, evidence: 'Part 3: "What about the restaurant across the road?"' },
    { id: 17, type: 'mcq', text: 'How many people does Max expect to come?', options: ['About ten', 'About twenty-five', 'About thirty'], answer: 1, evidence: 'Part 3: "Probably around twenty-five."' },
    { id: 18, type: 'mcq', text: 'How much would each person pay?', options: ['Five dollars', 'Twenty-five dollars', 'Ten dollars'], answer: 2, evidence: 'Part 3: "If everyone paid ten dollars, we could cover the food."' },
    { id: 19, type: 'mcq', text: 'What present will they buy?', options: ['A book about the history of the city', 'Gardening tools', 'A watch'], answer: 0, evidence: 'Part 3: "She suggested a book about the history of our city."' },
    { id: 20, type: 'mcq', text: 'What will Max do?', options: ['Collect the money', 'Book the restaurant', 'Buy the present'], answer: 1, evidence: 'Part 3: "Could you book the restaurant?" — "Sure. I\'ll call them this afternoon."' },
    { id: 21, type: 'mcq', text: 'How long did Max’s journey take?', options: ['About three months', 'Almost a year', 'Just over five months'], answer: 2, evidence: 'Part 4: "Just over five months."' },
    { id: 22, type: 'mcq', text: 'Why did Max make the journey?', options: ['To raise money for a children’s hospital', 'To write a travel book', 'To visit relatives in London'], answer: 0, evidence: 'Part 4: "I wanted to raise money for a children\'s hospital in Tashkent."' },
    { id: 23, type: 'mcq', text: 'How did the money he raised compare with what he had hoped?', options: ['It was less.', 'It was more than double.', 'It was about the same.'], answer: 1, evidence: 'Part 4: "more than double what I\'d hoped".' },
    { id: 24, type: 'mcq', text: 'What was the hardest part of the journey?', options: ['The mountains', 'The cold', 'The wind'], answer: 2, evidence: 'Part 4: "Not the mountains, surprisingly. It was the wind."' },
    { id: 25, type: 'mcq', text: 'Where did Max sleep most of the time?', options: ['In a small tent', 'In hotels', 'With friends'], answer: 0, evidence: 'Part 4: "Mostly in a small tent."' },
    { id: 26, type: 'mcq', text: 'What happened in Turkey?', options: ['He became ill.', 'His bike was damaged by a truck.', 'He lost his passport.'], answer: 1, evidence: 'Part 4: "My bike was damaged in Turkey when a truck hit it while it was parked."' },
    { id: 27, type: 'mcq', text: 'Who repaired the bike?', options: ['Max himself', 'The truck driver', 'A local mechanic'], answer: 2, evidence: 'Part 4: "A local mechanic repaired it for free".' },
    { id: 28, type: 'mcq', text: 'What would Max do differently next time?', options: ['Go with a friend', 'Take a different route', 'Take more money'], answer: 0, evidence: 'Part 4: "next time I\'d go with a friend".' },
    { id: 29, type: 'fill', text: 'The cacao tree grows in hot, wet regions close to the ______.', answers: ['equator'], evidence: 'Part 5: "hot, wet regions close to the equator".' },
    { id: 30, type: 'fill', text: 'The Maya and the Aztecs made a bitter ______ from the seeds.', answers: ['drink'], evidence: 'Part 5: "made a bitter drink from the seeds".' },
    { id: 31, type: 'fill', text: 'The drink was often mixed with ______.', answers: ['chilli', 'chili'], evidence: 'Part 5: "often mixed with chilli".' },
    { id: 32, type: 'fill', text: 'The Aztecs used cacao seeds as ______.', answers: ['money'], evidence: 'Part 5: "the Aztecs used them as money".' },
    { id: 33, type: 'fill', text: 'Europeans added ______ to the drink.', answers: ['sugar'], evidence: 'Part 5: "so they added sugar".' },
    { id: 34, type: 'fill', text: 'The first milk chocolate was made by a ______ chocolate maker.', answers: ['swiss'], evidence: 'Part 5: "a Swiss chocolate maker produced the first milk chocolate".' },
    { id: 35, type: 'fill', text: 'Today most cacao is grown in West ______.', answers: ['africa'], evidence: 'Part 5: "most of the world’s cacao is grown in West Africa".' },
  ],
};
