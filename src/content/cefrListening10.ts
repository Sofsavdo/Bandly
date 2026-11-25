import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 10: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'B', text: 'One. Can I take your order?' },
  { speaker: 'C', text: "Yes, I'll have the chicken soup and a salad, please." },
  { speaker: 'B', text: "Sorry, we've run out of soup." },
  { speaker: 'C', text: 'Then just the salad, please.' },
  { speaker: 'A', text: 'Two. When does the exhibition close?' },
  { speaker: 'D', text: "It was supposed to close this Sunday, but it's so popular they've extended it until the end of the month." },
  { speaker: 'D', text: "Three. Why didn't you answer my call?" },
  { speaker: 'A', text: 'I was in a meeting and my phone was on silent. Sorry!' },
  { speaker: 'B', text: 'Four. Passengers for the ten thirty train to Tashkent, please note that the train is running about twenty minutes late.' },
  { speaker: 'C', text: 'Five. Which dress should I wear to the wedding, the blue one or the green one?' },
  { speaker: 'A', text: "The green one. You wore the blue one to Nigora's birthday." },
  { speaker: 'D', text: "Six. I'd like to join the gym. Is there a student discount?" },
  { speaker: 'B', text: 'Yes, students get fifteen per cent off if they show a student card.' },
  { speaker: 'A', text: 'Seven. How did you get here so quickly?' },
  { speaker: 'C', text: "I borrowed my brother's bicycle. It's much faster than the bus in the rush hour." },
  { speaker: 'B', text: "Eight. Hi, it's Alistair. I'm afraid I can't come to the meeting tomorrow. Could you send me the notes afterwards?" },
];

const P2: L[] = [
  { speaker: 'B', text: 'Welcome to the International Book Fair, which runs from the fourth to the eighth of May at the Exhibition Centre. More than three hundred publishers from twenty countries are taking part this year.' },
  { speaker: 'B', text: 'The fair is open from ten until seven each day. On the final day, it closes earlier, at four, and many publishers sell their books at reduced prices.' },
  { speaker: 'B', text: 'Authors will sign books in Hall B every afternoon. You can find the full timetable in the free programme available at the entrance.' },
  { speaker: 'B', text: 'For children, there is a reading corner with story sessions every hour, starting at eleven.' },
  { speaker: 'B', text: 'Tickets cost five dollars, and entry is free for students and teachers with ID.' },
];

const P3: L[] = [
  { speaker: 'C', text: 'Max, the manager wants us to organise a team day for the office next month. Any ideas?' },
  { speaker: 'D', text: 'Last year we went bowling, and people enjoyed it, but it was a bit short.' },
  { speaker: 'C', text: "What about a cooking class? We'd have to work together, and then we'd eat what we've made." },
  { speaker: 'D', text: "That's fun, but there are thirty of us. Most cooking schools only take twelve." },
  { speaker: 'C', text: "Good point. What about a boat trip on the lake? There's a company that does day trips with lunch included." },
  { speaker: 'D', text: 'Some people get seasick, though, even on lakes.' },
  { speaker: 'C', text: "Then maybe a treasure hunt in the old city? Teams follow clues around the streets. It's outdoors, it works for any number of people, and it's cheap." },
  { speaker: 'D', text: 'I like that. We could finish with dinner at a restaurant.' },
  { speaker: 'C', text: "Great. I'll find a company that organises treasure hunts, and you can book the restaurant." },
  { speaker: 'D', text: "Deal. Let's ask the manager about the budget first, though." },
];

const P4: L[] = [
  { speaker: 'A', text: 'Today I’m talking to Max, who started a business that turns plastic waste into building materials. Max, where did the idea come from?' },
  { speaker: 'D', text: 'During my engineering degree, I visited a landfill site for a project. I was shocked by the amount of plastic there, and I started wondering if it could be used for something.' },
  { speaker: 'A', text: 'What do you actually make?' },
  { speaker: 'D', text: 'Paving tiles, the kind you see on pavements. We mix melted plastic with sand. The tiles are stronger and lighter than concrete ones.' },
  { speaker: 'A', text: 'Where do you get the plastic?' },
  { speaker: 'D', text: 'From local collection points and from restaurants. At first we had to pay for it, but now many businesses give it to us for free, because it saves them disposal costs.' },
  { speaker: 'A', text: 'How many people work for you?' },
  { speaker: 'D', text: 'We started with three, me and two friends. Now we employ twenty-two people.' },
  { speaker: 'A', text: 'What has been your biggest problem?' },
  { speaker: 'D', text: 'Convincing customers. People thought tiles made from rubbish would be poor quality. We had to have them tested by an independent laboratory before the city council would buy them.' },
  { speaker: 'A', text: "What's next?" },
  { speaker: 'D', text: "We'd like to open a second factory in another region next year." },
];

const P5: L[] = [
  { speaker: 'A', text: "Today we're going to look at the history of calendars. The earliest calendars were based on the moon, because its changes are easy to see. A lunar month is about twenty-nine and a half days." },
  { speaker: 'A', text: 'The problem is that twelve lunar months make only about three hundred and fifty-four days, which is shorter than a solar year. So the seasons gradually moved through the calendar.' },
  { speaker: 'A', text: 'The ancient Egyptians used a calendar of three hundred and sixty-five days, which was closely linked to the yearly flooding of the Nile, so important for their farming.' },
  { speaker: 'A', text: 'In 46 BC, Julius Caesar introduced a calendar with a leap year every four years. However, it was still slightly too long, and by the sixteenth century it was about ten days out of step with the seasons.' },
  { speaker: 'A', text: "In 1582, Pope Gregory the Thirteenth introduced the calendar most of the world uses today, and ten days were simply removed from that year. Next week we'll look at calendars that are still used for religious and cultural purposes." },
];

export const cefrListening10: ListeningTest = {
  id: 'cefr-listening-10',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 10',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) kitob yarmarkasi haqida e’lon; 3) ofis uchun jamoaviy kun rejasi; 4) plastikdan qurilish materiali yasaydigan tadbirkor bilan intervyu; 5) taqvim tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'What will the woman have?', options: ['Chicken soup', 'Soup and a salad', 'Just a salad'], answer: 2, evidence: 'Part 1, 1: "we\'ve run out of soup" — "Then just the salad, please."' },
    { id: 2, type: 'mcq', text: 'When does the exhibition close now?', options: ['This Sunday', 'At the end of the month', 'Next year'], answer: 1, evidence: 'Part 1, 2: "they\'ve extended it until the end of the month".' },
    { id: 3, type: 'mcq', text: 'Why didn’t the woman answer the call?', options: ['She was in a meeting.', 'Her phone was broken.', 'She was driving.'], answer: 0, evidence: 'Part 1, 3: "I was in a meeting and my phone was on silent."' },
    { id: 4, type: 'mcq', text: 'How late is the Tashkent train?', options: ['Ten minutes', 'Thirty minutes', 'About twenty minutes'], answer: 2, evidence: 'Part 1, 4: "the train is running about twenty minutes late".' },
    { id: 5, type: 'mcq', text: 'Which dress does her friend suggest?', options: ['The blue one', 'The green one', 'A new one'], answer: 1, evidence: 'Part 1, 5: "The green one."' },
    { id: 6, type: 'mcq', text: 'What discount do students get?', options: ['15 per cent', '50 per cent', '5 per cent'], answer: 0, evidence: 'Part 1, 6: "students get fifteen per cent off".' },
    { id: 7, type: 'mcq', text: 'How did the woman get there?', options: ['By bus', 'By taxi', 'By bicycle'], answer: 2, evidence: 'Part 1, 7: "I borrowed my brother\'s bicycle."' },
    { id: 8, type: 'mcq', text: 'What does Alistair ask for?', options: ['A new meeting time', 'The notes from the meeting', 'A phone call'], answer: 1, evidence: 'Part 1, 8: "Could you send me the notes afterwards?"' },
    { id: 9, type: 'fill', text: 'The fair starts on 4 ______', answers: ['may'], evidence: 'Part 2: "from the fourth to the eighth of May".' },
    { id: 10, type: 'fill', text: 'Publishers come from ______ countries', answers: ['20', 'twenty'], evidence: 'Part 2: "from twenty countries".' },
    { id: 11, type: 'fill', text: 'Closing time on the final day: ______ pm', answers: ['4', 'four'], evidence: 'Part 2: "On the final day, it closes earlier, at four".' },
    { id: 12, type: 'fill', text: 'Book signing: Hall ______', answers: ['b'], evidence: 'Part 2: "Authors will sign books in Hall B every afternoon."' },
    { id: 13, type: 'fill', text: 'Children’s story sessions: every ______', answers: ['hour'], evidence: 'Part 2: "story sessions every hour, starting at eleven".' },
    { id: 14, type: 'fill', text: 'Free entry for students and ______ with ID', answers: ['teachers'], evidence: 'Part 2: "entry is free for students and teachers with ID".' },
    { id: 15, type: 'mcq', text: 'What was the problem with last year’s bowling?', options: ['It was too expensive.', 'It was a bit short.', 'Nobody enjoyed it.'], answer: 1, evidence: 'Part 3: "people enjoyed it, but it was a bit short".' },
    { id: 16, type: 'mcq', text: 'Why is a cooking class not suitable?', options: ['There are too many people.', 'It is too far away.', 'Nobody likes cooking.'], answer: 0, evidence: 'Part 3: "there are thirty of us. Most cooking schools only take twelve."' },
    { id: 17, type: 'mcq', text: 'What is the problem with the boat trip?', options: ['Lunch is not included.', 'It is too expensive.', 'Some people get seasick.'], answer: 2, evidence: 'Part 3: "Some people get seasick, though, even on lakes."' },
    { id: 18, type: 'mcq', text: 'What do they choose?', options: ['A treasure hunt in the old city', 'Bowling again', 'A picnic'], answer: 0, evidence: 'Part 3: "maybe a treasure hunt in the old city?" — "I like that."' },
    { id: 19, type: 'mcq', text: 'How will the day end?', options: ['With a boat trip', 'With dinner at a restaurant', 'With a party in the office'], answer: 1, evidence: 'Part 3: "We could finish with dinner at a restaurant."' },
    { id: 20, type: 'mcq', text: 'What will they do first?', options: ['Book the restaurant', 'Find a treasure hunt company', 'Ask the manager about the budget'], answer: 2, evidence: 'Part 3: "Let\'s ask the manager about the budget first".' },
    { id: 21, type: 'mcq', text: 'Where did Max get the idea for his business?', options: ['From a TV programme', 'From visiting a landfill site', 'From his father’s factory'], answer: 1, evidence: 'Part 4: "I visited a landfill site for a project".' },
    { id: 22, type: 'mcq', text: 'What does the company make?', options: ['Paving tiles', 'Plastic bottles', 'Bricks'], answer: 0, evidence: 'Part 4: "Paving tiles, the kind you see on pavements."' },
    { id: 23, type: 'mcq', text: 'What is mixed with the melted plastic?', options: ['Concrete', 'Glass', 'Sand'], answer: 2, evidence: 'Part 4: "We mix melted plastic with sand."' },
    { id: 24, type: 'mcq', text: 'How do the tiles compare with concrete ones?', options: ['They are cheaper but weaker.', 'They are stronger and lighter.', 'They are heavier.'], answer: 1, evidence: 'Part 4: "The tiles are stronger and lighter than concrete ones."' },
    { id: 25, type: 'mcq', text: 'Why do businesses now give their plastic for free?', options: ['It saves them disposal costs.', 'The law requires it.', 'Max pays them later.'], answer: 0, evidence: 'Part 4: "because it saves them disposal costs".' },
    { id: 26, type: 'mcq', text: 'How many people work for the company now?', options: ['Three', 'Twelve', 'Twenty-two'], answer: 2, evidence: 'Part 4: "Now we employ twenty-two people."' },
    { id: 27, type: 'mcq', text: 'What has been the biggest problem?', options: ['Finding plastic', 'Convincing customers', 'Finding workers'], answer: 1, evidence: 'Part 4: "Convincing customers."' },
    { id: 28, type: 'mcq', text: 'What did the city council need before buying the tiles?', options: ['Tests by an independent laboratory', 'A lower price', 'A larger factory'], answer: 0, evidence: 'Part 4: "We had to have them tested by an independent laboratory before the city council would buy them."' },
    { id: 29, type: 'fill', text: 'The earliest calendars were based on the ______.', answers: ['moon'], evidence: 'Part 5: "The earliest calendars were based on the moon".' },
    { id: 30, type: 'fill', text: 'Twelve lunar months are shorter than a ______ year.', answers: ['solar'], evidence: 'Part 5: "which is shorter than a solar year".' },
    { id: 31, type: 'fill', text: 'As a result, the ______ moved through the calendar.', answers: ['seasons'], evidence: 'Part 5: "So the seasons gradually moved through the calendar."' },
    { id: 32, type: 'fill', text: 'The Egyptian calendar was linked to the flooding of the ______.', answers: ['nile'], evidence: 'Part 5: "the yearly flooding of the Nile".' },
    { id: 33, type: 'fill', text: 'Julius Caesar introduced a ______ year every four years.', answers: ['leap'], evidence: 'Part 5: "a calendar with a leap year every four years".' },
    { id: 34, type: 'fill', text: 'By the 16th century the calendar was about ______ days out of step.', answers: ['ten', '10'], evidence: 'Part 5: "about ten days out of step with the seasons".' },
    { id: 35, type: 'fill', text: 'In 1582, ten days were ______ from the year.', answers: ['removed'], evidence: 'Part 5: "ten days were simply removed from that year".' },
  ],
};
