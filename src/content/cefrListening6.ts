import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 6: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'B', text: 'One. Can I help you?' },
  { speaker: 'C', text: "Yes, I'd like a return ticket to Samarkand, please, coming back on Sunday." },
  { speaker: 'A', text: 'Two. Have you seen my glasses?' },
  { speaker: 'D', text: "They're on the kitchen table, next to the newspaper." },
  { speaker: 'C', text: 'Three. Is the swimming pool open today?' },
  { speaker: 'B', text: "It's closed this morning for cleaning, but it opens again at two." },
  { speaker: 'D', text: "Four. I've decided to study medicine." },
  { speaker: 'A', text: 'Really? I thought you wanted to be an engineer.' },
  { speaker: 'D', text: 'I did, but after volunteering at the hospital, I changed my mind.' },
  { speaker: 'B', text: 'Five. Attention, shoppers. The store will close in fifteen minutes. Please take your items to the checkout.' },
  { speaker: 'A', text: 'Six. What did you think of the new teacher?' },
  { speaker: 'C', text: "She's very strict, but her explanations are really clear." },
  { speaker: 'D', text: "Seven. Hello, I'm calling about the bicycle you're selling. Does it have lights?" },
  { speaker: 'B', text: 'It has a front light, but the back one is broken.' },
  { speaker: 'C', text: 'Eight. How are you getting to the airport?' },
  { speaker: 'A', text: "My brother was going to drive me, but his car's at the garage, so I'll take a taxi." },
];

const P2: L[] = [
  { speaker: 'B', text: 'Hello, and welcome to the Green Valley Hiking Club. We organise walks every weekend from March to November. Most walks are between ten and fifteen kilometres long and take around five hours, including a lunch break.' },
  { speaker: 'B', text: 'Members meet at the central bus station at eight in the morning, and we travel together by minibus. The cost of transport is included in the membership fee.' },
  { speaker: 'B', text: 'Membership costs forty dollars for the season. You can also join a single walk for six dollars, which is a good way to see if hiking is for you.' },
  { speaker: 'B', text: 'Please wear strong walking boots, because trainers are not suitable on mountain paths. You should also bring at least two litres of water, a waterproof jacket and your own lunch.' },
  { speaker: 'B', text: 'Our most popular event is the sunrise walk in July, which starts at four in the morning. Places are limited to twenty people, so book early.' },
];

const P3: L[] = [
  { speaker: 'C', text: 'So, Max, which of the two flats did you prefer?' },
  { speaker: 'D', text: "The one on Navoi Street is bigger, and the rent is the same. But it's on the fifth floor and there's no lift." },
  { speaker: 'C', text: "That would be hard when we buy furniture. What about the one near the university?" },
  { speaker: 'D', text: "It's smaller, but it's only a ten-minute walk to classes. We'd save on bus fares." },
  { speaker: 'C', text: "And it's got a washing machine, which the other one doesn't." },
  { speaker: 'D', text: "True. The only problem is the noise. It's above a café that stays open until midnight." },
  { speaker: 'C', text: 'I sleep badly when it’s noisy. Did you ask the owner about that?' },
  { speaker: 'D', text: 'Yes. She said the bedrooms are at the back, away from the street.' },
  { speaker: 'C', text: "Then let's take the one near the university. Can we move in next month?" },
  { speaker: 'D', text: "She said from the first of September. I'll call her today and tell her we'll take it." },
];

const P4: L[] = [
  { speaker: 'A', text: 'Today I’m talking to Max, who has been a firefighter for twelve years. Max, why did you choose this job?' },
  { speaker: 'D', text: 'When I was a teenager, there was a fire in our apartment building. The firefighters who came were so calm and professional that I decided then that I wanted to do the same.' },
  { speaker: 'A', text: 'What does a typical day look like?' },
  { speaker: 'D', text: 'People imagine we spend all our time fighting fires, but actually fires are only about a fifth of our calls. We also deal with car accidents, floods and people trapped in lifts.' },
  { speaker: 'A', text: 'What do you do when there are no emergencies?' },
  { speaker: 'D', text: 'We train a lot, and we check our equipment every morning. We also visit schools to teach children about fire safety.' },
  { speaker: 'A', text: "What's the hardest part of the job?" },
  { speaker: 'D', text: 'Working night shifts. I work two days, then two nights, then have four days off. My body never quite gets used to it.' },
  { speaker: 'A', text: 'Have you ever been afraid?' },
  { speaker: 'D', text: "Of course. Anyone who says they're never afraid is not telling the truth. But training helps you control the fear." },
  { speaker: 'A', text: 'What advice would you give someone who wants to become a firefighter?' },
  { speaker: 'D', text: "Get fit, and learn to work in a team. You can't do this job alone." },
];

const P5: L[] = [
  { speaker: 'A', text: 'Today I’d like to talk about how people kept food cold before refrigerators. For thousands of years, people stored ice collected in winter. In ancient Persia, builders created huge ice houses which kept ice frozen even through hot desert summers.' },
  { speaker: 'A', text: 'These buildings had thick walls and a tall dome shape, which helped hot air rise and escape. Water was often brought from underground canals and frozen in shallow pools on winter nights.' },
  { speaker: 'A', text: 'In the nineteenth century, ice became a major international business. Ice was cut from frozen lakes in North America and shipped as far as India, packed in sawdust to stop it melting.' },
  { speaker: 'A', text: 'The first practical refrigeration machines were developed in the mid-nineteenth century, and they were used first in breweries and meat-packing factories. Home refrigerators only became common in the 1930s in the United States, and much later in many other countries.' },
  { speaker: 'A', text: "Refrigeration changed diets around the world, because fresh food could be transported long distances. Next week, we'll discuss its environmental impact." },
];

export const cefrListening6: ListeningTest = {
  id: 'cefr-listening-6',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 6',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) piyoda sayohat klubi haqida e’lon; 3) ikki do‘stning ijaraga kvartira tanlashi; 4) o‘t o‘chiruvchi bilan intervyu; 5) muzlatgichdan oldingi davr haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'What kind of ticket does the woman want?', options: ['A single ticket', 'A return ticket', 'A weekly pass'], answer: 1, evidence: 'Part 1, 1: "I\'d like a return ticket to Samarkand".' },
    { id: 2, type: 'mcq', text: 'Where are the glasses?', options: ['In the bedroom', 'On the kitchen table', 'Under the newspaper'], answer: 1, evidence: 'Part 1, 2: "They\'re on the kitchen table, next to the newspaper."' },
    { id: 3, type: 'mcq', text: 'When does the pool open today?', options: ['At 2 pm', 'At 10 am', 'It is closed all day.'], answer: 0, evidence: 'Part 1, 3: "it opens again at two".' },
    { id: 4, type: 'mcq', text: 'Why did the man change his mind about his studies?', options: ['Engineering was too hard.', 'His parents wanted it.', 'He volunteered at a hospital.'], answer: 2, evidence: 'Part 1, 4: "after volunteering at the hospital, I changed my mind".' },
    { id: 5, type: 'mcq', text: 'When will the store close?', options: ['In five minutes', 'In fifteen minutes', 'In fifty minutes'], answer: 1, evidence: 'Part 1, 5: "The store will close in fifteen minutes."' },
    { id: 6, type: 'mcq', text: 'What does the woman think of the new teacher?', options: ['She is strict but clear.', 'She is kind but boring.', 'She is often late.'], answer: 0, evidence: 'Part 1, 6: "She\'s very strict, but her explanations are really clear."' },
    { id: 7, type: 'mcq', text: 'What is wrong with the bicycle?', options: ['The front light is missing.', 'The tyres are flat.', 'The back light is broken.'], answer: 2, evidence: 'Part 1, 7: "the back one is broken".' },
    { id: 8, type: 'mcq', text: 'How will the woman get to the airport?', options: ['Her brother will drive her.', 'By taxi', 'By bus'], answer: 1, evidence: 'Part 1, 8: "so I\'ll take a taxi".' },
    { id: 9, type: 'fill', text: 'Walks run from March to ______', answers: ['november'], evidence: 'Part 2: "every weekend from March to November".' },
    { id: 10, type: 'fill', text: 'A walk takes around ______ hours', answers: ['5', 'five'], evidence: 'Part 2: "take around five hours".' },
    { id: 11, type: 'fill', text: 'Meeting point: the central bus ______', answers: ['station'], evidence: 'Part 2: "Members meet at the central bus station".' },
    { id: 12, type: 'fill', text: 'Price of a single walk: $______', answers: ['6', 'six'], evidence: 'Part 2: "join a single walk for six dollars".' },
    { id: 13, type: 'fill', text: 'Bring at least ______ litres of water', answers: ['2', 'two'], evidence: 'Part 2: "at least two litres of water".' },
    { id: 14, type: 'fill', text: 'The sunrise walk takes place in ______', answers: ['july'], evidence: 'Part 2: "the sunrise walk in July".' },
    { id: 15, type: 'mcq', text: 'What is the problem with the flat on Navoi Street?', options: ['It is more expensive.', 'It is on the fifth floor with no lift.', 'It is too small.'], answer: 1, evidence: 'Part 3: "it\'s on the fifth floor and there\'s no lift".' },
    { id: 16, type: 'mcq', text: 'What is an advantage of the flat near the university?', options: ['It is a short walk to classes.', 'It is bigger.', 'It has a garden.'], answer: 0, evidence: 'Part 3: "it\'s only a ten-minute walk to classes".' },
    { id: 17, type: 'mcq', text: 'What does the flat near the university have?', options: ['A lift', 'A balcony', 'A washing machine'], answer: 2, evidence: 'Part 3: "it\'s got a washing machine, which the other one doesn\'t".' },
    { id: 18, type: 'mcq', text: 'What is the problem with the flat near the university?', options: ['Noise from a café', 'High rent', 'No furniture'], answer: 0, evidence: 'Part 3: "The only problem is the noise. It\'s above a café".' },
    { id: 19, type: 'mcq', text: 'What did the owner say about the noise?', options: ['The café will close soon.', 'The bedrooms are at the back.', 'The windows are double.'], answer: 1, evidence: 'Part 3: "She said the bedrooms are at the back, away from the street."' },
    { id: 20, type: 'mcq', text: 'What will Max do today?', options: ['Visit the other flat', 'Pay a deposit', 'Call the owner'], answer: 2, evidence: 'Part 3: "I\'ll call her today and tell her we\'ll take it."' },
    { id: 21, type: 'mcq', text: 'Why did Max become a firefighter?', options: ['His father was a firefighter.', 'He saw firefighters at a fire in his building.', 'He wanted a job with good pay.'], answer: 1, evidence: 'Part 4: "there was a fire in our apartment building … I decided then that I wanted to do the same".' },
    { id: 22, type: 'mcq', text: 'What part of their calls are fires?', options: ['About a fifth', 'About half', 'Most of them'], answer: 0, evidence: 'Part 4: "fires are only about a fifth of our calls".' },
    { id: 23, type: 'mcq', text: 'Which of these do firefighters also deal with?', options: ['Lost pets', 'Stolen cars', 'People trapped in lifts'], answer: 2, evidence: 'Part 4: "We also deal with car accidents, floods and people trapped in lifts."' },
    { id: 24, type: 'mcq', text: 'What do they do every morning?', options: ['Check their equipment', 'Visit schools', 'Run five kilometres'], answer: 0, evidence: 'Part 4: "we check our equipment every morning".' },
    { id: 25, type: 'mcq', text: 'Who do they teach about fire safety?', options: ['Office workers', 'Children in schools', 'Shop owners'], answer: 1, evidence: 'Part 4: "We also visit schools to teach children about fire safety."' },
    { id: 26, type: 'mcq', text: 'What is the hardest part of the job for Max?', options: ['The danger', 'The training', 'Working night shifts'], answer: 2, evidence: 'Part 4: "Working night shifts."' },
    { id: 27, type: 'mcq', text: 'What does Max say about fear?', options: ['He has never felt it.', 'Training helps you control it.', 'It makes the job impossible.'], answer: 1, evidence: 'Part 4: "training helps you control the fear".' },
    { id: 28, type: 'mcq', text: 'What advice does Max give?', options: ['Get fit and learn to work in a team', 'Study engineering first', 'Start as a volunteer'], answer: 0, evidence: 'Part 4: "Get fit, and learn to work in a team."' },
    { id: 29, type: 'fill', text: 'People stored ______ collected in winter.', answers: ['ice'], evidence: 'Part 5: "people stored ice collected in winter".' },
    { id: 30, type: 'fill', text: 'Persian ice houses had thick ______.', answers: ['walls'], evidence: 'Part 5: "These buildings had thick walls".' },
    { id: 31, type: 'fill', text: 'A tall ______ shape helped hot air escape.', answers: ['dome'], evidence: 'Part 5: "a tall dome shape, which helped hot air rise and escape".' },
    { id: 32, type: 'fill', text: 'Water was frozen in shallow ______ on winter nights.', answers: ['pools'], evidence: 'Part 5: "frozen in shallow pools on winter nights".' },
    { id: 33, type: 'fill', text: 'Shipped ice was packed in ______.', answers: ['sawdust'], evidence: 'Part 5: "packed in sawdust to stop it melting".' },
    { id: 34, type: 'fill', text: 'Home refrigerators became common in the USA in the ______.', answers: ['1930s'], evidence: 'Part 5: "Home refrigerators only became common in the 1930s in the United States".' },
    { id: 35, type: 'fill', text: 'Refrigeration changed ______ around the world.', answers: ['diets'], evidence: 'Part 5: "Refrigeration changed diets around the world".' },
  ],
};
