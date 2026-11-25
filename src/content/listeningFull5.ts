import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 5: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: 'Good afternoon, Bright Futures Recruitment. Clare speaking. How can I help?' },
  { speaker: 'B', text: "Hello. I'm a student, and I'm looking for part-time work during the summer. A friend told me you might be able to help." },
  { speaker: 'A', text: "Certainly. I'll just take some details. What's your full name?" },
  { speaker: 'B', text: 'Andrew Pemberton. P, E, M, B, E, R, T, O, N.' },
  { speaker: 'A', text: 'And how old are you, Andrew?' },
  { speaker: 'B', text: "I'm nineteen." },
  { speaker: 'A', text: 'What are you studying?' },
  { speaker: 'B', text: "Engineering, at the technical college. I'm in my first year." },
  { speaker: 'A', text: 'When are you available?' },
  { speaker: 'B', text: "From the twentieth of June until the end of August. I'm going on holiday for a week in early August, though." },
  { speaker: 'A', text: "That's fine. How many hours a week would you like?" },
  { speaker: 'B', text: "About twenty. I don't want to work at weekends if I can avoid it, because I play football on Saturdays." },
  { speaker: 'A', text: 'OK. Have you had a job before?' },
  { speaker: 'B', text: "Yes, last summer I worked in a supermarket, mostly stacking shelves. And I sometimes help in my uncle's garage." },
  { speaker: 'A', text: "That's useful. We have quite a few jobs in warehouses at the moment, and one in a garden centre." },
  { speaker: 'B', text: 'The garden centre sounds nice. I like working outside.' },
  { speaker: 'A', text: "It pays ten pounds fifty an hour, and the hours are Monday to Friday, eight till twelve. You'd need to be able to lift heavy bags of soil." },
  { speaker: 'B', text: "That's no problem. How do I apply?" },
  { speaker: 'A', text: "I'll need a copy of your CV by email, and you'll have to bring your passport when you come in for a short interview. Could you come in tomorrow morning?" },
  { speaker: 'B', text: 'Yes, at around ten?' },
  { speaker: 'A', text: 'Perfect. Our office is on the second floor, above the bank on Queen Street.' },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good morning, everyone, and welcome to Blackrock Mine Museum. I'll be your guide this morning. The tour lasts about ninety minutes, and for part of it we'll be going underground, so I'll begin with some important information." },
  { speaker: 'B', text: "First, everyone must wear a helmet. You'll find them on the shelves next to the lift. Please choose one that fits well and adjust the strap under your chin. It gets cold underground, around ten degrees, even in summer, so if you've got a jacket, keep it with you." },
  { speaker: 'B', text: 'The mine was opened in 1780 and produced tin and copper for almost two hundred years. At its busiest, in the 1860s, it employed over a thousand people, including children as young as eight, who worked sorting the stones on the surface.' },
  { speaker: 'B', text: "We'll go down in the original lift cage, which travels about sixty metres underground. It's quite small, so we'll go down in groups of six. Anyone who doesn't like enclosed spaces can watch a short film about the mine in the visitor centre instead." },
  { speaker: 'B', text: "Underground, you'll see the tunnels where the miners worked, and the tools they used. Until the 1870s, they worked by candlelight, and each miner had to buy his own candles, which took a large part of his wages." },
  { speaker: 'B', text: "After the underground section, we'll visit the engine house, where you can see the huge steam engine that pumped water out of the mine. It's switched on every day at midday, so we'll time our visit so you can see it working." },
  { speaker: 'B', text: 'At the end of the tour, the café in the visitor centre serves hot drinks and lunch, and in the shop you can buy a piece of real tin ore as a souvenir.' },
];

const PART3: L[] = [
  { speaker: 'C', text: "Omar, we need to finish planning the film festival. It's only a month away." },
  { speaker: 'D', text: "I know. The good news is that we've received thirty-two films, which is more than last year." },
  { speaker: 'C', text: "That's great. But we can only show about twenty, so we'll have to choose." },
  { speaker: 'D', text: "I suggest we ask three lecturers from the media department to help judge. Then nobody can say we chose our friends' films." },
  { speaker: 'C', text: 'Good idea. What about the venue? Last year we used the lecture theatre, but the sound was terrible.' },
  { speaker: 'D', text: "The student union has offered us their main hall. It's bigger and the sound system is much better. The only problem is that we can't use it before six in the evening." },
  { speaker: 'C', text: "That's fine. The festival was going to be in the evening anyway. How are we going to sell tickets?" },
  { speaker: 'D', text: "Online. Last year people queued at the door, and it was chaos. If we sell them online, we'll know exactly how many people are coming." },
  { speaker: 'C', text: 'And the price?' },
  { speaker: 'D', text: 'I think we should keep it at three pounds. We want as many students as possible to come.' },
  { speaker: 'C', text: "Agreed. Now, the prize. Last year it was a cinema voucher, which wasn't very exciting." },
  { speaker: 'D', text: 'A local camera shop has offered to give a camera lens as first prize. That would be much more useful for a film-maker.' },
  { speaker: 'C', text: "Brilliant. So, tasks. I'll contact the lecturers about judging." },
  { speaker: 'D', text: "Then I'll book the hall and set up the ticket website." },
  { speaker: 'C', text: 'What about publicity? Someone needs to make posters.' },
  { speaker: 'D', text: "You're the artist. Could you design them?" },
  { speaker: 'C', text: "OK. And can you write the programme? You've seen most of the films already." },
  { speaker: 'D', text: 'Sure.' },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good afternoon. Today I'd like to talk about how people have measured time, and how the need for accurate time changed society." },
  { speaker: 'A', text: "The earliest method was simply to watch the sun. The ancient Egyptians used shadow clocks, simple instruments that cast a shadow which moved during the day. The obvious problem was that they didn't work at night or on cloudy days." },
  { speaker: 'A', text: 'To solve this, people developed water clocks, in which water dripped slowly from one container into another. They were used in Egypt, Babylon and China, and some of them were extremely complex, with moving figures and bells.' },
  { speaker: 'A', text: 'Mechanical clocks appeared in Europe in the late thirteenth century, usually in church towers. They had no faces at first; they simply rang a bell every hour. They were also very inaccurate, often losing or gaining as much as fifteen minutes a day.' },
  { speaker: 'A', text: 'A major improvement came in the seventeenth century, when the Dutch scientist Christiaan Huygens built the first pendulum clock. It was accurate to within about a minute a day, and clocks soon began to be given minute hands.' },
  { speaker: 'A', text: 'Accurate time was particularly important at sea. To find their position, sailors needed to know the exact time at their home port. In the eighteenth century, an English carpenter, John Harrison, spent decades building a clock that could keep accurate time on a moving ship, and his work saved countless lives.' },
  { speaker: 'A', text: 'Interestingly, until the nineteenth century, every town kept its own local time, based on the sun. It was the railways that changed this: timetables were impossible if every station had a different time, so railway companies introduced standard time across whole countries.' },
  { speaker: 'A', text: "In our next session, we'll look at atomic clocks, and at why modern technology, such as satellite navigation, depends on them." },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull5: ListeningTest = {
  id: 'listening-full-5',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 5',
  minutes: 35,
  names: { A: 'Clare / Lecturer', B: 'Andrew / Guide', C: 'Grace', D: 'Omar' },
  context: '4 qism: 1) yozgi ish uchun agentlikka ro‘yxatdan o‘tish (telefon); 2) eski kon muzeyida ekskursiya; 3) ikki talabaning kinofestival rejasi; 4) vaqtni o‘lchash tarixi haqida ma’ruza.',
  script: SCRIPT,
  sections: [
    { at: 0, title: 'Part 1 — Questions 1–10' },
    { at: PART1.length, title: 'Part 2 — Questions 11–20' },
    { at: PART1.length + PART2.length, title: 'Part 3 — Questions 21–30' },
    { at: PART1.length + PART2.length + PART3.length, title: 'Part 4 — Questions 31–40' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–10: Complete the form. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { instruction: 'Part 2 — Questions 11–15: Choose the correct letter.', questionIds: [11, 12, 13, 14, 15] },
    { instruction: 'Part 2 — Questions 16–20: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [16, 17, 18, 19, 20] },
    { instruction: 'Part 3 — Questions 21–26: Choose the correct letter.', questionIds: [21, 22, 23, 24, 25, 26] },
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Grace or Omar.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Surname: ______', answers: ['pemberton'], evidence: 'Part 1: "Andrew Pemberton. P, E, M, B, E, R, T, O, N."' },
    { id: 2, type: 'fill', text: 'Age: ______', answers: ['19', 'nineteen'], evidence: 'Part 1: "I\'m nineteen."' },
    { id: 3, type: 'fill', text: 'Subject studied: ______', answers: ['engineering'], evidence: 'Part 1: "Engineering, at the technical college."' },
    { id: 4, type: 'fill', text: 'Available from: 20 ______', answers: ['june'], evidence: 'Part 1: "From the twentieth of June".' },
    { id: 5, type: 'fill', text: 'Hours wanted per week: about ______', answers: ['20', 'twenty'], evidence: 'Part 1: "About twenty."' },
    { id: 6, type: 'fill', text: 'Prefers not to work at ______', answers: ['weekends'], evidence: 'Part 1: "I don\'t want to work at weekends".' },
    { id: 7, type: 'fill', text: 'Previous job: in a ______', answers: ['supermarket'], evidence: 'Part 1: "last summer I worked in a supermarket".' },
    { id: 8, type: 'fill', text: 'Job of interest: at a garden ______', answers: ['centre', 'center'], evidence: 'Part 1: "The garden centre sounds nice."' },
    { id: 9, type: 'fill', text: 'Pay: £______ per hour', answers: ['10.50', '10.5', 'ten pounds fifty'], evidence: 'Part 1: "It pays ten pounds fifty an hour".' },
    { id: 10, type: 'fill', text: 'Bring to the interview: ______', answers: ['passport'], evidence: 'Part 1: "you\'ll have to bring your passport".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'How long does the tour last?', options: ['About an hour', 'About ninety minutes', 'About two hours', 'Half a day'], answer: 1, evidence: 'Part 2: "The tour lasts about ninety minutes".' },
    { id: 12, type: 'mcq', text: 'Where are the helmets?', options: ['At the ticket desk', 'In the visitor centre', 'In the engine house', 'Next to the lift'], answer: 3, evidence: 'Part 2: "You\'ll find them on the shelves next to the lift."' },
    { id: 13, type: 'mcq', text: 'What is the temperature underground?', options: ['Around ten degrees', 'Around zero', 'Around twenty degrees', 'The same as outside'], answer: 0, evidence: 'Part 2: "It gets cold underground, around ten degrees, even in summer".' },
    { id: 14, type: 'mcq', text: 'What work did young children do at the mine?', options: ['They carried candles.', 'They worked the lift.', 'They sorted stones on the surface.', 'They pumped water.'], answer: 2, evidence: 'Part 2: "children as young as eight, who worked sorting the stones on the surface".' },
    { id: 15, type: 'mcq', text: 'What can visitors who do not like enclosed spaces do?', options: ['Wait in the café', 'Watch a film in the visitor centre', 'Visit the shop', 'Join a later tour'], answer: 1, evidence: 'Part 2: "can watch a short film about the mine in the visitor centre instead".' },
    { id: 16, type: 'fill', text: 'The mine produced tin and ______.', answers: ['copper'], evidence: 'Part 2: "produced tin and copper for almost two hundred years".' },
    { id: 17, type: 'fill', text: 'The lift goes about ______ metres underground.', answers: ['60', 'sixty'], evidence: 'Part 2: "travels about sixty metres underground".' },
    { id: 18, type: 'fill', text: 'Visitors go down in groups of ______.', answers: ['6', 'six'], evidence: 'Part 2: "we\'ll go down in groups of six".' },
    { id: 19, type: 'fill', text: 'Miners had to buy their own ______.', answers: ['candles'], evidence: 'Part 2: "each miner had to buy his own candles".' },
    { id: 20, type: 'fill', text: 'The steam engine pumped ______ out of the mine.', answers: ['water'], evidence: 'Part 2: "the huge steam engine that pumped water out of the mine".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'How many films have they received?', options: ['Twenty', 'Thirty', 'Thirty-two'], answer: 2, evidence: 'Part 3: "we\'ve received thirty-two films".' },
    { id: 22, type: 'mcq', text: 'Why does Omar want lecturers to help judge?', options: ['So the choice is seen as fair', 'Because they are film experts', 'Because the students are too busy'], answer: 0, evidence: 'Part 3: "Then nobody can say we chose our friends\' films."' },
    { id: 23, type: 'mcq', text: 'What was wrong with last year’s venue?', options: ['It was too small.', 'The sound was terrible.', 'It was too expensive.'], answer: 1, evidence: 'Part 3: "Last year we used the lecture theatre, but the sound was terrible."' },
    { id: 24, type: 'mcq', text: 'What is the problem with the main hall?', options: ['It cannot be used before 6 pm.', 'It has no sound system.', 'It is far from the campus.'], answer: 0, evidence: 'Part 3: "we can\'t use it before six in the evening".' },
    { id: 25, type: 'mcq', text: 'Why will they sell tickets online?', options: ['It is cheaper.', 'The union insists on it.', 'They will know exactly how many people are coming.'], answer: 2, evidence: 'Part 3: "we\'ll know exactly how many people are coming".' },
    { id: 26, type: 'mcq', text: 'What will the first prize be?', options: ['A cinema voucher', 'A camera lens', 'Free tickets'], answer: 1, evidence: 'Part 3: "a camera lens as first prize".' },
    { id: 27, type: 'mcq', text: 'Contacting the lecturers', options: ['Grace', 'Omar'], answer: 0, evidence: 'Part 3: Grace: "I\'ll contact the lecturers about judging."' },
    { id: 28, type: 'mcq', text: 'Booking the hall', options: ['Grace', 'Omar'], answer: 1, evidence: 'Part 3: Omar: "Then I\'ll book the hall".' },
    { id: 29, type: 'mcq', text: 'Designing the posters', options: ['Grace', 'Omar'], answer: 0, evidence: 'Part 3: Omar: "Could you design them?" — Grace: "OK."' },
    { id: 30, type: 'mcq', text: 'Writing the programme', options: ['Grace', 'Omar'], answer: 1, evidence: 'Part 3: Grace: "can you write the programme?" — Omar: "Sure."' },
    // Part 4
    { id: 31, type: 'fill', text: 'Shadow clocks did not work at night or on ______ days.', answers: ['cloudy'], evidence: 'Part 4: "they didn\'t work at night or on cloudy days".' },
    { id: 32, type: 'fill', text: 'In water clocks, water ______ slowly from one container into another.', answers: ['dripped'], evidence: 'Part 4: "water dripped slowly from one container into another".' },
    { id: 33, type: 'fill', text: 'Early mechanical clocks were usually in church ______.', answers: ['towers'], evidence: 'Part 4: "usually in church towers".' },
    { id: 34, type: 'fill', text: 'At first these clocks had no ______.', answers: ['faces'], evidence: 'Part 4: "They had no faces at first".' },
    { id: 35, type: 'fill', text: 'Huygens built the first ______ clock.', answers: ['pendulum'], evidence: 'Part 4: "built the first pendulum clock".' },
    { id: 36, type: 'fill', text: 'Clocks then began to be given ______ hands.', answers: ['minute'], evidence: 'Part 4: "clocks soon began to be given minute hands".' },
    { id: 37, type: 'fill', text: 'Sailors needed the exact time to find their ______.', answers: ['position'], evidence: 'Part 4: "To find their position, sailors needed to know the exact time".' },
    { id: 38, type: 'fill', text: 'John Harrison worked as a ______.', answers: ['carpenter'], evidence: 'Part 4: "an English carpenter, John Harrison".' },
    { id: 39, type: 'fill', text: 'Until the 19th century, every town kept its own ______ time.', answers: ['local'], evidence: 'Part 4: "every town kept its own local time".' },
    { id: 40, type: 'fill', text: 'Standard time was introduced because of the ______.', answers: ['railways'], evidence: 'Part 4: "It was the railways that changed this".' },
  ],
};
