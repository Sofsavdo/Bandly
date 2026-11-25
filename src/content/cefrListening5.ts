import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 5: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'C', text: 'One. Excuse me, is there a bank near here?' },
  { speaker: 'B', text: "Yes, go straight on and take the second turning on the right. It's next to the post office." },
  { speaker: 'A', text: "Two. Are you coming to Aziz's party on Saturday?" },
  { speaker: 'D', text: "I'd love to, but I have to work. I'll come round on Sunday to help clean up, though!" },
  { speaker: 'D', text: 'Three. How was the restaurant?' },
  { speaker: 'C', text: 'The food was delicious, but we waited forty minutes for a table.' },
  { speaker: 'B', text: 'Four. This is a message for passengers on the eight fifteen bus to Bukhara. The bus will leave from gate seven instead of gate two.' },
  { speaker: 'A', text: "Five. I'm looking for a present for my brother. He likes reading and football." },
  { speaker: 'C', text: 'How about this book about famous footballers?' },
  { speaker: 'A', text: "Perfect. He'll love it." },
  { speaker: 'C', text: 'Six. Shall we meet at the cinema at seven?' },
  { speaker: 'D', text: "I finish work at seven, so the seven fifteen film is too early for me. Let's go to the nine o'clock one." },
  { speaker: 'C', text: 'Fine.' },
  { speaker: 'B', text: "Seven. Doctor's surgery, how can I help?" },
  { speaker: 'A', text: "I'd like to cancel my appointment tomorrow. I'm feeling much better." },
  { speaker: 'D', text: "Eight. What's the weather going to be like tomorrow?" },
  { speaker: 'C', text: "Sunny in the morning, but it's going to rain in the afternoon, so take an umbrella." },
];

const P2: L[] = [
  { speaker: 'B', text: "Welcome to the Museum of Applied Arts. Our new exhibition, Threads of Gold, opens on the tenth of October and shows traditional embroidery from across Central Asia. It includes more than two hundred pieces, some of them over a hundred years old." },
  { speaker: 'B', text: 'The museum is open from ten until six every day except Monday. On Thursdays we stay open until nine in the evening, and entry after five is free.' },
  { speaker: 'B', text: 'Tickets cost fifty thousand sum for adults. Students with a valid card pay half price, and children under seven enter free.' },
  { speaker: 'B', text: "Guided tours in English take place at eleven and three every day and last about an hour. If you'd like to try embroidery yourself, there are workshops on Saturday mornings, but you need to book them online." },
  { speaker: 'B', text: 'Please note that photography is allowed, but without flash. Large bags must be left in the cloakroom on the ground floor.' },
];

const P3: L[] = [
  { speaker: 'C', text: "Max, we need to decide how to celebrate our graduation. Everyone's waiting for us to organise something." },
  { speaker: 'D', text: 'I thought we could have dinner at a restaurant. Something nice.' },
  { speaker: 'C', text: "That could be expensive for some people. Not everyone has a job yet." },
  { speaker: 'D', text: "True. What about a picnic in the botanical garden? It's free to get in, and everyone could bring some food." },
  { speaker: 'C', text: 'I like that, but what if it rains?' },
  { speaker: 'D', text: "There's a covered area near the lake that we can book for a small fee. I'll check if it's free on the twenty-first." },
  { speaker: 'C', text: 'Good. How many people are we inviting?' },
  { speaker: 'D', text: "Our whole group is twenty-four people. Let's invite our two main teachers as well." },
  { speaker: 'C', text: 'Fine. Should we have music?' },
  { speaker: 'D', text: "Rustam plays the guitar. I'll ask him to bring it." },
  { speaker: 'C', text: "Great. I'll make a list of who brings what, so we don't end up with ten cakes and no bread." },
];

const P4: L[] = [
  { speaker: 'A', text: 'My guest today is Hope, who started an English club for children in a small village. Hope, how did it begin?' },
  { speaker: 'C', text: "I grew up in the village and moved to the city to study. When I came back for the summer holidays, my neighbour's children kept asking me to teach them English words, so I started a small group under a tree in our garden." },
  { speaker: 'A', text: 'How many children came at first?' },
  { speaker: 'C', text: 'Just five. By the end of the summer there were almost thirty, so we had to move into the village library.' },
  { speaker: 'A', text: 'How do you teach without a classroom full of equipment?' },
  { speaker: 'C', text: "We use games, songs and stories. I don't give tests. I want them to enjoy English, not be afraid of it." },
  { speaker: 'A', text: 'Do you get paid?' },
  { speaker: 'C', text: "No, it's voluntary. But a local business donated books and a projector last year, which helped a lot." },
  { speaker: 'A', text: 'What has been the biggest success?' },
  { speaker: 'C', text: 'Two of my first students passed the entrance exam for a specialised school in the city this year. Their parents cried when they heard!' },
  { speaker: 'A', text: 'And the biggest challenge?' },
  { speaker: 'C', text: "Continuing during the school year. I live in the city now, so I teach online on Sunday evenings, but the internet in the village isn't always reliable." },
  { speaker: 'A', text: 'What are your plans?' },
  { speaker: 'C', text: "I'd like to train two older students to run the club when I'm not there." },
];

const P5: L[] = [
  { speaker: 'A', text: "Today we're going to look at the history of the postal service. In ancient Persia, a system of riders carried messages along royal roads. Each rider covered one day's journey and then passed the message to a fresh rider with a fresh horse." },
  { speaker: 'A', text: 'For most of history, however, sending a letter was expensive, and the cost was usually paid by the receiver, not the sender. If the receiver refused to pay, the letter was simply returned.' },
  { speaker: 'A', text: 'In 1840, Britain introduced the first adhesive postage stamp, known as the Penny Black. For the first time, the sender paid, and the price was the same for any distance within the country. The number of letters sent rose dramatically.' },
  { speaker: 'A', text: 'Other countries soon followed, and in 1874 the Universal Postal Union was created, so that letters could travel between countries under shared rules.' },
  { speaker: 'A', text: 'In the twentieth century, aeroplanes made international post much faster, but the arrival of email reduced the number of letters sent. Today, postal services survive mainly because of parcels from online shopping.' },
];

export const cefrListening5: ListeningTest = {
  id: 'cefr-listening-5',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 5',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) muzeydagi yangi ko‘rgazma haqida e’lon; 3) bitiruvni nishonlash rejasi; 4) qishloqda ingliz tili klubini ochgan qiz bilan intervyu; 5) pochta tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'Where is the bank?', options: ['Opposite the station', 'Next to the post office', 'On the first turning on the left'], answer: 1, evidence: 'Part 1, 1: "It\'s next to the post office."' },
    { id: 2, type: 'mcq', text: 'Why can’t the man go to the party?', options: ['He has to work.', 'He is ill.', 'He is travelling.'], answer: 0, evidence: 'Part 1, 2: "I\'d love to, but I have to work."' },
    { id: 3, type: 'mcq', text: 'What was the problem at the restaurant?', options: ['The food was cold.', 'It was expensive.', 'They waited a long time for a table.'], answer: 2, evidence: 'Part 1, 3: "we waited forty minutes for a table".' },
    { id: 4, type: 'mcq', text: 'Which gate will the Bukhara bus leave from?', options: ['Gate 2', 'Gate 7', 'Gate 15'], answer: 1, evidence: 'Part 1, 4: "The bus will leave from gate seven instead of gate two."' },
    { id: 5, type: 'mcq', text: 'What will the woman buy for her brother?', options: ['A football', 'A book about footballers', 'A football shirt'], answer: 1, evidence: 'Part 1, 5: "How about this book about famous footballers?" — "Perfect."' },
    { id: 6, type: 'mcq', text: 'Which film will they see?', options: ['The nine o’clock film', 'The seven fifteen film', 'The seven o’clock film'], answer: 0, evidence: 'Part 1, 6: "Let\'s go to the nine o\'clock one." — "Fine."' },
    { id: 7, type: 'mcq', text: 'Why is the woman cancelling her appointment?', options: ['She has to work.', 'She is going away.', 'She is feeling better.'], answer: 2, evidence: 'Part 1, 7: "I\'m feeling much better."' },
    { id: 8, type: 'mcq', text: 'What will the weather be like in the afternoon?', options: ['Sunny', 'Rainy', 'Windy'], answer: 1, evidence: 'Part 1, 8: "it\'s going to rain in the afternoon".' },
    { id: 9, type: 'fill', text: 'The exhibition opens on 10 ______', answers: ['october'], evidence: 'Part 2: "opens on the tenth of October".' },
    { id: 10, type: 'fill', text: 'Number of pieces: more than ______', answers: ['200', 'two hundred'], evidence: 'Part 2: "more than two hundred pieces".' },
    { id: 11, type: 'fill', text: 'The museum is closed on ______', answers: ['monday', 'mondays'], evidence: 'Part 2: "every day except Monday".' },
    { id: 12, type: 'fill', text: 'Thursdays: free entry after ______ pm', answers: ['5', 'five'], evidence: 'Part 2: "entry after five is free".' },
    { id: 13, type: 'fill', text: 'Embroidery workshops: ______ mornings', answers: ['saturday', 'saturdays'], evidence: 'Part 2: "workshops on Saturday mornings".' },
    { id: 14, type: 'fill', text: 'Large bags must be left in the ______', answers: ['cloakroom'], evidence: 'Part 2: "Large bags must be left in the cloakroom".' },
    { id: 15, type: 'mcq', text: 'Why does Hope not like the restaurant idea?', options: ['Not everyone can afford it.', 'Restaurants are fully booked.', 'The food is not good.'], answer: 0, evidence: 'Part 3: "That could be expensive for some people. Not everyone has a job yet."' },
    { id: 16, type: 'mcq', text: 'Where will the celebration be?', options: ['In a restaurant', 'At the university', 'In the botanical garden'], answer: 2, evidence: 'Part 3: "What about a picnic in the botanical garden?" — "I like that".' },
    { id: 17, type: 'mcq', text: 'What will they do if it rains?', options: ['Move to a café', 'Use a covered area near the lake', 'Change the date'], answer: 1, evidence: 'Part 3: "There\'s a covered area near the lake that we can book".' },
    { id: 18, type: 'mcq', text: 'Who else will they invite?', options: ['Their families', 'Their two main teachers', 'Students from other groups'], answer: 1, evidence: 'Part 3: "Let\'s invite our two main teachers as well."' },
    { id: 19, type: 'mcq', text: 'Who will provide music?', options: ['Rustam', 'Max', 'A band'], answer: 0, evidence: 'Part 3: "Rustam plays the guitar. I\'ll ask him to bring it."' },
    { id: 20, type: 'mcq', text: 'What will Hope do?', options: ['Book the covered area', 'Buy the food', 'Make a list of who brings what'], answer: 2, evidence: 'Part 3: "I\'ll make a list of who brings what".' },
    { id: 21, type: 'mcq', text: 'How did the English club begin?', options: ['Her neighbour’s children asked her to teach them.', 'The school asked her to start it.', 'She wanted to earn money.'], answer: 0, evidence: 'Part 4: "my neighbour\'s children kept asking me to teach them English words".' },
    { id: 22, type: 'mcq', text: 'Where did the first group meet?', options: ['In the library', 'Under a tree in her garden', 'In the school'], answer: 1, evidence: 'Part 4: "I started a small group under a tree in our garden".' },
    { id: 23, type: 'mcq', text: 'Why did the club move to the library?', options: ['It started raining.', 'The group grew to almost thirty.', 'The library offered free books.'], answer: 1, evidence: 'Part 4: "there were almost thirty, so we had to move into the village library".' },
    { id: 24, type: 'mcq', text: 'What does Hope NOT do in her lessons?', options: ['Sing songs', 'Tell stories', 'Give tests'], answer: 2, evidence: 'Part 4: "I don\'t give tests."' },
    { id: 25, type: 'mcq', text: 'What did a local business donate?', options: ['Books and a projector', 'Money for a teacher', 'A new building'], answer: 0, evidence: 'Part 4: "a local business donated books and a projector".' },
    { id: 26, type: 'mcq', text: 'What has been the biggest success?', options: ['The club won a prize.', 'Two students passed an entrance exam.', 'Parents started learning English.'], answer: 1, evidence: 'Part 4: "Two of my first students passed the entrance exam".' },
    { id: 27, type: 'mcq', text: 'What is the problem with teaching online?', options: ['The children are too busy.', 'She has no computer.', 'The internet is not always reliable.'], answer: 2, evidence: 'Part 4: "the internet in the village isn\'t always reliable".' },
    { id: 28, type: 'mcq', text: 'What does Hope plan to do?', options: ['Train older students to run the club', 'Move back to the village', 'Open a second club'], answer: 0, evidence: 'Part 4: "I\'d like to train two older students to run the club".' },
    { id: 29, type: 'fill', text: 'In ancient Persia, messages were carried by ______.', answers: ['riders'], evidence: 'Part 5: "a system of riders carried messages".' },
    { id: 30, type: 'fill', text: 'The cost was usually paid by the ______.', answers: ['receiver'], evidence: 'Part 5: "the cost was usually paid by the receiver, not the sender".' },
    { id: 31, type: 'fill', text: 'The first adhesive stamp was the Penny ______.', answers: ['black'], evidence: 'Part 5: "known as the Penny Black".' },
    { id: 32, type: 'fill', text: 'The price was the same for any ______ within the country.', answers: ['distance'], evidence: 'Part 5: "the price was the same for any distance".' },
    { id: 33, type: 'fill', text: 'The number of letters sent rose ______.', answers: ['dramatically'], evidence: 'Part 5: "The number of letters sent rose dramatically."' },
    { id: 34, type: 'fill', text: 'Since 1874, letters travel between countries under shared ______.', answers: ['rules'], evidence: 'Part 5: "travel between countries under shared rules".' },
    { id: 35, type: 'fill', text: 'Postal services survive mainly because of ______.', answers: ['parcels'], evidence: 'Part 5: "mainly because of parcels from online shopping".' },
  ],
};
