import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 2: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'C', text: 'One. Excuse me, where can I buy a ticket for the museum?' },
  { speaker: 'B', text: 'Not here, this is the café. The ticket desk is on the left as you go in through the main door.' },
  { speaker: 'A', text: 'Two. What time is the meeting tomorrow?' },
  { speaker: 'D', text: 'It was at nine, but the manager moved it to half past ten because she has a doctor’s appointment first.' },
  { speaker: 'C', text: "Three. I'd like to return these shoes. They're too small." },
  { speaker: 'B', text: 'Would you like a bigger size or your money back?' },
  { speaker: 'C', text: 'A bigger size, please. I really like them.' },
  { speaker: 'D', text: 'Four. Did you enjoy the film last night?' },
  { speaker: 'A', text: 'The acting was great, but it was far too long. I nearly fell asleep in the last hour.' },
  { speaker: 'B', text: 'Five. Good morning, passengers. Due to heavy snow, all flights to Moscow are delayed by at least two hours. Please check the screens for further information.' },
  { speaker: 'A', text: 'Six. Are you going to drive to the conference?' },
  { speaker: 'C', text: "No, parking there is impossible. I'm going to take the metro. It's only three stops." },
  { speaker: 'D', text: 'Seven. Hello, I booked a table for four people at eight o’clock, but could we make it six people?' },
  { speaker: 'B', text: "Let me see. Yes, that's fine, but we'll need to move you to the terrace." },
  { speaker: 'A', text: 'Eight. Which present should we buy for Grandma, the scarf or the book?' },
  { speaker: 'D', text: "She's got lots of scarves. Let's get her the cookery book. She loves trying new recipes." },
];

const P2: L[] = [
  { speaker: 'B', text: "Hello and welcome to the City Library's summer programme. This year's reading challenge for children starts on the first of July and finishes at the end of August. Children who read six books during the summer will receive a certificate and a medal." },
  { speaker: 'B', text: 'Registration is free. You can register at any branch, or online on our website. Children under eight should register with a parent.' },
  { speaker: 'B', text: "Every Wednesday morning there's a storytelling session in the children's room on the second floor. It starts at ten thirty and lasts about forty-five minutes. Places are limited to twenty children, so please arrive early." },
  { speaker: 'B', text: "For adults, we're running a series of evening talks by local writers. The first is on the twelfth of July, and tickets cost three pounds. All the money goes towards buying new books for the library." },
  { speaker: 'B', text: "Please note that the library will be closed on public holidays, and that from August, we'll be open until eight in the evening on Thursdays." },
];

const P3: L[] = [
  { speaker: 'C', text: 'Max, are we still going to Khiva next month?' },
  { speaker: 'D', text: "Of course! I've been looking at how to get there. The train is cheaper, but the plane is much faster." },
  { speaker: 'C', text: 'How long does the train take?' },
  { speaker: 'D', text: 'About fourteen hours from Tashkent. The flight is under two hours.' },
  { speaker: 'C', text: "I don't mind the train if we take the night one. We can sleep on the way and save the cost of a hotel for one night." },
  { speaker: 'D', text: "Good thinking. Then let's book the night train. What about accommodation?" },
  { speaker: 'C', text: "My cousin recommended a small guesthouse inside the old city walls. It's family-run, and breakfast is included." },
  { speaker: 'D', text: 'Sounds better than a big hotel. How much is it?' },
  { speaker: 'C', text: 'Around thirty dollars a night for a double room.' },
  { speaker: 'D', text: "Fine. What do you want to see? I'd love to climb one of the minarets." },
  { speaker: 'C', text: "Me too, but I've read that the climb is very steep and narrow. I'd also like to visit the craft workshops. They make wooden doors and carpets." },
  { speaker: 'D', text: "Let's do both. And it's good that we're going in spring rather than summer. It gets extremely hot there." },
  { speaker: 'C', text: "That's why I suggested next month. April should be perfect." },
];

const P4: L[] = [
  { speaker: 'A', text: "Welcome to 'Small Business Stories'. My guest today is Hope, who opened a bookshop café in her home town three years ago. Hope, where did the idea come from?" },
  { speaker: 'C', text: 'When I was a student, I spent a year abroad and found a little café full of second-hand books. People sat there for hours reading and talking. When I came home, I realised there was nothing like that in my town.' },
  { speaker: 'A', text: 'How did you pay for it?' },
  { speaker: 'C', text: "Partly with my savings, but mostly with a loan from the bank. My parents offered to help, but I didn't want to risk their money." },
  { speaker: 'A', text: 'What was the biggest challenge in the first year?' },
  { speaker: 'C', text: "Finding the right staff. I needed people who knew about books and could also make good coffee. That's a rare combination!" },
  { speaker: 'A', text: 'Where do your books come from?' },
  { speaker: 'C', text: 'Most are donated by customers. In exchange, they get a free drink. We also buy some new books from local authors.' },
  { speaker: 'A', text: 'And how is business now?' },
  { speaker: 'C', text: 'Much better than I expected. The café makes most of the money, to be honest. The books bring people in, but the coffee and cakes pay the bills.' },
  { speaker: 'A', text: 'Do you have any plans for the future?' },
  { speaker: 'C', text: "I'd like to start a children's reading club on Saturday mornings. Many parents have asked for it." },
  { speaker: 'A', text: 'What advice would you give someone starting a small business?' },
  { speaker: 'C', text: "Listen to your customers. Almost every good idea we've had came from them." },
];

const P5: L[] = [
  { speaker: 'A', text: "Today we're going to look at an everyday object with a surprisingly long history: the umbrella. The first umbrellas were used not against rain but against the sun. In ancient Egypt, China and Persia, they were a symbol of power, and only kings and important people were allowed to carry them." },
  { speaker: 'A', text: 'The Chinese are believed to have been the first to make umbrellas that kept out the rain. They covered paper umbrellas with wax or oil to make them waterproof.' },
  { speaker: 'A', text: 'In Europe, umbrellas were used mainly by women until the eighteenth century. Men who carried them were often laughed at in the street. This changed partly thanks to an English traveller, Jonas Hanway, who carried an umbrella in London for about thirty years and helped to make it acceptable for men.' },
  { speaker: 'A', text: 'Early European umbrellas were heavy, because their frames were made of wood or whalebone. In the 1850s, a steel frame was introduced, which made umbrellas lighter and stronger, and much closer to the design we know today.' },
  { speaker: 'A', text: 'In the twentieth century, the folding umbrella became popular, because it could easily be carried in a bag. Today, millions of umbrellas are sold every year, and unfortunately, a very large number are left behind on public transport.' },
  { speaker: 'A', text: "Next time, we'll look at the history of another everyday object: the pencil." },
];

export const cefrListening2: ListeningTest = {
  id: 'cefr-listening-2',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 2',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) kutubxonaning yozgi dasturi haqida e’lon; 3) ikki do‘stning Xivaga sayohat rejasi; 4) kitob-kafe egasi bilan intervyu; 5) soyabon tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'Where is the museum ticket desk?', options: ['In the café', 'Upstairs', 'On the left of the main door'], answer: 2, evidence: 'Part 1, 1: "The ticket desk is on the left as you go in through the main door."' },
    { id: 2, type: 'mcq', text: 'What time is the meeting now?', options: ['At 10.30', 'At 9.00', 'At 11.00'], answer: 0, evidence: 'Part 1, 2: "moved it to half past ten".' },
    { id: 3, type: 'mcq', text: 'What does the woman want?', options: ['Her money back', 'A bigger size', 'A different colour'], answer: 1, evidence: 'Part 1, 3: "A bigger size, please."' },
    { id: 4, type: 'mcq', text: 'What was wrong with the film?', options: ['The acting was poor.', 'The cinema was cold.', 'It was too long.'], answer: 2, evidence: 'Part 1, 4: "it was far too long".' },
    { id: 5, type: 'mcq', text: 'Why are the flights delayed?', options: ['Heavy snow', 'A strike', 'A technical problem'], answer: 0, evidence: 'Part 1, 5: "Due to heavy snow, all flights to Moscow are delayed".' },
    { id: 6, type: 'mcq', text: 'How will the woman get to the conference?', options: ['By car', 'By metro', 'By taxi'], answer: 1, evidence: 'Part 1, 6: "I\'m going to take the metro."' },
    { id: 7, type: 'mcq', text: 'What does the caller want to change?', options: ['The time', 'The date', 'The number of people'], answer: 2, evidence: 'Part 1, 7: "could we make it six people?"' },
    { id: 8, type: 'mcq', text: 'What will they buy for Grandma?', options: ['A cookery book', 'A scarf', 'Some flowers'], answer: 0, evidence: 'Part 1, 8: "Let\'s get her the cookery book."' },
    { id: 9, type: 'fill', text: 'Children must read ______ books during the summer.', answers: ['6', 'six'], evidence: 'Part 2: "Children who read six books during the summer".' },
    { id: 10, type: 'fill', text: 'Prize: a certificate and a ______', answers: ['medal'], evidence: 'Part 2: "will receive a certificate and a medal".' },
    { id: 11, type: 'fill', text: 'Storytelling session: every ______ morning', answers: ['wednesday'], evidence: 'Part 2: "Every Wednesday morning there\'s a storytelling session".' },
    { id: 12, type: 'fill', text: 'Maximum number of children at storytelling: ______', answers: ['20', 'twenty'], evidence: 'Part 2: "Places are limited to twenty children".' },
    { id: 13, type: 'fill', text: 'Evening talks for adults are given by local ______.', answers: ['writers'], evidence: 'Part 2: "a series of evening talks by local writers".' },
    { id: 14, type: 'fill', text: 'From August, open until 8 pm on ______', answers: ['thursdays', 'thursday'], evidence: 'Part 2: "open until eight in the evening on Thursdays".' },
    { id: 15, type: 'mcq', text: 'Why does Hope want to take the night train?', options: ['It is faster than the plane.', 'They can sleep and save a hotel night.', 'The plane tickets are sold out.'], answer: 1, evidence: 'Part 3: "We can sleep on the way and save the cost of a hotel for one night."' },
    { id: 16, type: 'mcq', text: 'How long does the train journey take?', options: ['Under two hours', 'About ten hours', 'About fourteen hours'], answer: 2, evidence: 'Part 3: "About fourteen hours from Tashkent."' },
    { id: 17, type: 'mcq', text: 'Who recommended the guesthouse?', options: ['Hope’s cousin', 'A travel website', 'Max’s friend'], answer: 0, evidence: 'Part 3: "My cousin recommended a small guesthouse".' },
    { id: 18, type: 'mcq', text: 'What is included in the price of the guesthouse?', options: ['Dinner', 'Breakfast', 'A city tour'], answer: 1, evidence: 'Part 3: "breakfast is included".' },
    { id: 19, type: 'mcq', text: 'What does Hope say about climbing the minaret?', options: ['It is closed to visitors.', 'It is very expensive.', 'The climb is steep and narrow.'], answer: 2, evidence: 'Part 3: "the climb is very steep and narrow".' },
    { id: 20, type: 'mcq', text: 'Why are they going in April?', options: ['It is extremely hot in summer.', 'Tickets are cheaper.', 'There is a festival.'], answer: 0, evidence: 'Part 3: "rather than summer. It gets extremely hot there."' },
    { id: 21, type: 'mcq', text: 'Where did the idea for the bookshop café come from?', options: ['A television programme', 'A year abroad as a student', 'Her parents’ shop'], answer: 1, evidence: 'Part 4: "I spent a year abroad and found a little café full of second-hand books".' },
    { id: 22, type: 'mcq', text: 'How did Hope mainly pay for the business?', options: ['With a loan from the bank', 'With her savings', 'With money from her parents'], answer: 0, evidence: 'Part 4: "mostly with a loan from the bank".' },
    { id: 23, type: 'mcq', text: 'Why did she not accept her parents’ help?', options: ['They had no money.', 'She wanted to prove herself.', 'She did not want to risk their money.'], answer: 2, evidence: 'Part 4: "I didn\'t want to risk their money".' },
    { id: 24, type: 'mcq', text: 'What was the biggest challenge in the first year?', options: ['Finding a building', 'Finding the right staff', 'Attracting customers'], answer: 1, evidence: 'Part 4: "Finding the right staff."' },
    { id: 25, type: 'mcq', text: 'Where do most of the books come from?', options: ['They are donated by customers.', 'They are bought online.', 'They are bought from local authors.'], answer: 0, evidence: 'Part 4: "Most are donated by customers."' },
    { id: 26, type: 'mcq', text: 'What do customers get for donating books?', options: ['A discount', 'A free book', 'A free drink'], answer: 2, evidence: 'Part 4: "In exchange, they get a free drink."' },
    { id: 27, type: 'mcq', text: 'What makes most of the money?', options: ['The books', 'The café', 'Children’s events'], answer: 1, evidence: 'Part 4: "The café makes most of the money".' },
    { id: 28, type: 'mcq', text: 'What does Hope plan to start?', options: ['A second café', 'An online shop', 'A children’s reading club'], answer: 2, evidence: 'Part 4: "I\'d like to start a children\'s reading club on Saturday mornings."' },
    { id: 29, type: 'fill', text: 'The first umbrellas protected people from the ______.', answers: ['sun'], evidence: 'Part 5: "not against rain but against the sun".' },
    { id: 30, type: 'fill', text: 'In ancient times, umbrellas were a symbol of ______.', answers: ['power'], evidence: 'Part 5: "they were a symbol of power".' },
    { id: 31, type: 'fill', text: 'The Chinese covered paper umbrellas with wax or ______.', answers: ['oil'], evidence: 'Part 5: "covered paper umbrellas with wax or oil".' },
    { id: 32, type: 'fill', text: 'Until the 18th century, European umbrellas were used mainly by ______.', answers: ['women'], evidence: 'Part 5: "umbrellas were used mainly by women".' },
    { id: 33, type: 'fill', text: 'Jonas Hanway carried an umbrella in ______ for about thirty years.', answers: ['london'], evidence: 'Part 5: "carried an umbrella in London for about thirty years".' },
    { id: 34, type: 'fill', text: 'In the 1850s, a ______ frame was introduced.', answers: ['steel'], evidence: 'Part 5: "a steel frame was introduced".' },
    { id: 35, type: 'fill', text: 'Many umbrellas are left behind on public ______.', answers: ['transport'], evidence: 'Part 5: "left behind on public transport".' },
  ],
};
