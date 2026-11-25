import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 8: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'A', text: 'One. Where shall we meet tomorrow?' },
  { speaker: 'C', text: 'Outside the library, at ten.' },
  { speaker: 'A', text: "The library's closed tomorrow. Let's meet at the café opposite." },
  { speaker: 'C', text: 'OK.' },
  { speaker: 'B', text: 'Two. How much is this jacket?' },
  { speaker: 'D', text: "It's eighty dollars, but everything is twenty per cent off today, so it's sixty-four." },
  { speaker: 'C', text: 'Three. Did you pass your driving test?' },
  { speaker: 'D', text: 'Not this time. I was fine on the road, but I failed the parking.' },
  { speaker: 'B', text: 'Four. Attention, please. Flight HY six oh four to Istanbul is now boarding at gate eleven.' },
  { speaker: 'A', text: 'Five. What are you making for dinner?' },
  { speaker: 'D', text: "I was going to make soup, but we've got no onions, so I'm making pasta instead." },
  { speaker: 'C', text: 'Six. How was your first day at work?' },
  { speaker: 'A', text: 'Busy, but everyone was really friendly. My manager took me out for lunch.' },
  { speaker: 'D', text: 'Seven. Excuse me, does this road go to the stadium?' },
  { speaker: 'B', text: "Yes, but it's quite far. You'd better take the number twelve bus from that stop." },
  { speaker: 'B', text: 'Eight. Are you free on Thursday afternoon?' },
  { speaker: 'C', text: "I have an exam in the morning, but I'm free after two." },
];

const P2: L[] = [
  { speaker: 'B', text: 'Hello and welcome to the City Zoo. This summer we have two new arrivals: a pair of red pandas, which you can see in the Asian forest area near the main entrance.' },
  { speaker: 'B', text: 'The zoo is open from nine in the morning until seven in the evening during the summer months. The last entry is one hour before closing.' },
  { speaker: 'B', text: 'Every day at noon, our keepers give a short talk at the penguin pool, and at three o’clock you can watch the sea lions being fed.' },
  { speaker: 'B', text: 'Please do not feed the animals yourself. Human food can make them seriously ill. There are picnic areas next to the playground where you can eat your own food.' },
  { speaker: 'B', text: "If you'd like to support our work, you can adopt an animal for a year. You'll receive a certificate, a photo and free entry for one day." },
];

const P3: L[] = [
  { speaker: 'C', text: 'Max, our exams start in three weeks. We should make a study plan.' },
  { speaker: 'D', text: 'I know. I always leave everything to the last minute.' },
  { speaker: 'C', text: "Let's start with the hardest subject. For me, that's statistics." },
  { speaker: 'D', text: 'For me too. Shall we study it together? We could meet at the library every morning.' },
  { speaker: 'C', text: 'Mornings are difficult for me because I work at a café until eleven. Could we do afternoons?' },
  { speaker: 'D', text: 'Afternoons are fine. Say from two until five, with a short break.' },
  { speaker: 'C', text: 'Good. And I think we should do practice papers, not just read our notes. Last year that helped me a lot.' },
  { speaker: 'D', text: 'Where can we find them?' },
  { speaker: 'C', text: 'The department website has papers from the last five years.' },
  { speaker: 'D', text: "Great. I'll download them tonight. What about the weekends?" },
  { speaker: 'C', text: "Let's take Sundays off. We need some rest, or we'll be too tired." },
];

const P4: L[] = [
  { speaker: 'A', text: 'Today I’m with Max, who has spent the last four years teaching in a small school in the mountains. Max, why did you choose to work there?' },
  { speaker: 'D', text: 'After university, I wanted to see a different part of the country, and there was a shortage of teachers in rural areas. I planned to stay one year, but I loved it.' },
  { speaker: 'A', text: 'How big is the school?' },
  { speaker: 'D', text: "There are only forty-five pupils, from age seven to seventeen. I teach English and also, sometimes, geography, because there aren't enough teachers." },
  { speaker: 'A', text: "What's different about teaching there?" },
  { speaker: 'D', text: "The classes are small, so I know every pupil well. But we have very few resources. For a long time we didn't have internet at all." },
  { speaker: 'A', text: 'And now?' },
  { speaker: 'D', text: 'Two years ago a charity installed satellite internet. It changed everything. The pupils can now take part in online competitions with schools in the city.' },
  { speaker: 'A', text: "What's the hardest thing?" },
  { speaker: 'D', text: 'Winter. The road is sometimes closed by snow for several days, and then nobody can get in or out.' },
  { speaker: 'A', text: 'Will you stay?' },
  { speaker: 'D', text: "For now, yes. But in the future I'd like to train other teachers who want to work in rural schools." },
];

const P5: L[] = [
  { speaker: 'A', text: "Today's lecture is about the spice trade. For centuries, spices such as pepper, cinnamon and cloves were among the most valuable goods in the world. They were used not only to flavour food but also as medicines and to preserve meat." },
  { speaker: 'A', text: 'Most spices grew only in tropical parts of Asia, especially India and the islands of what is now Indonesia. They reached Europe through a long chain of traders, and their price increased at every stage of the journey.' },
  { speaker: 'A', text: 'In the Middle Ages, pepper was so expensive that it was sometimes used to pay rent or taxes. Merchants in Venice became extremely rich by controlling the trade in the Mediterranean.' },
  { speaker: 'A', text: 'The desire to buy spices directly was one of the main reasons European explorers searched for a sea route to Asia in the fifteenth century. When they succeeded, prices gradually fell.' },
  { speaker: 'A', text: "Today, spices are cheap and found in every kitchen. Next week, we'll look at the history of sugar." },
];

export const cefrListening8: ListeningTest = {
  id: 'cefr-listening-8',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 8',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) hayvonot bog‘i haqida e’lon; 3) imtihonga tayyorgarlik rejasi; 4) tog‘ maktabidagi o‘qituvchi bilan intervyu; 5) ziravorlar savdosi tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'Where will they meet tomorrow?', options: ['Outside the library', 'At the café opposite the library', 'At the station'], answer: 1, evidence: 'Part 1, 1: "Let\'s meet at the café opposite." — "OK."' },
    { id: 2, type: 'mcq', text: 'How much is the jacket today?', options: ['$80', '$60', '$64'], answer: 2, evidence: 'Part 1, 2: "so it\'s sixty-four".' },
    { id: 3, type: 'mcq', text: 'Why did the man fail his driving test?', options: ['He failed the parking.', 'He drove too fast.', 'He was late.'], answer: 0, evidence: 'Part 1, 3: "I failed the parking".' },
    { id: 4, type: 'mcq', text: 'Which gate is the Istanbul flight boarding at?', options: ['Gate 4', 'Gate 11', 'Gate 6'], answer: 1, evidence: 'Part 1, 4: "is now boarding at gate eleven".' },
    { id: 5, type: 'mcq', text: 'What is the man making for dinner?', options: ['Soup', 'Pasta', 'Onion salad'], answer: 1, evidence: 'Part 1, 5: "so I\'m making pasta instead".' },
    { id: 6, type: 'mcq', text: 'How was the woman’s first day at work?', options: ['Busy, but people were friendly', 'Quiet and boring', 'Difficult and stressful'], answer: 0, evidence: 'Part 1, 6: "Busy, but everyone was really friendly."' },
    { id: 7, type: 'mcq', text: 'What does the man advise?', options: ['Walking to the stadium', 'Taking a taxi', 'Taking the number 12 bus'], answer: 2, evidence: 'Part 1, 7: "You\'d better take the number twelve bus".' },
    { id: 8, type: 'mcq', text: 'When is the woman free on Thursday?', options: ['In the morning', 'After two', 'In the evening only'], answer: 1, evidence: 'Part 1, 8: "I\'m free after two".' },
    { id: 9, type: 'fill', text: 'New arrivals: two red ______', answers: ['pandas'], evidence: 'Part 2: "a pair of red pandas".' },
    { id: 10, type: 'fill', text: 'Summer closing time: ______ pm', answers: ['7', 'seven'], evidence: 'Part 2: "until seven in the evening".' },
    { id: 11, type: 'fill', text: 'Last entry: one ______ before closing', answers: ['hour'], evidence: 'Part 2: "The last entry is one hour before closing."' },
    { id: 12, type: 'fill', text: 'Keepers’ talk at noon: at the ______ pool', answers: ['penguin'], evidence: 'Part 2: "a short talk at the penguin pool".' },
    { id: 13, type: 'fill', text: 'Picnic areas: next to the ______', answers: ['playground'], evidence: 'Part 2: "picnic areas next to the playground".' },
    { id: 14, type: 'fill', text: 'Adopters receive a certificate, a ______ and free entry for a day', answers: ['photo', 'photograph'], evidence: 'Part 2: "You\'ll receive a certificate, a photo and free entry for one day."' },
    { id: 15, type: 'mcq', text: 'When do their exams start?', options: ['In three weeks', 'Next week', 'In three months'], answer: 0, evidence: 'Part 3: "our exams start in three weeks".' },
    { id: 16, type: 'mcq', text: 'Which subject is hardest for both of them?', options: ['Economics', 'Statistics', 'English'], answer: 1, evidence: 'Part 3: "For me, that\'s statistics." — "For me too."' },
    { id: 17, type: 'mcq', text: 'Why can’t Hope study in the mornings?', options: ['She has classes.', 'The library is closed.', 'She works at a café.'], answer: 2, evidence: 'Part 3: "I work at a café until eleven".' },
    { id: 18, type: 'mcq', text: 'When will they study together?', options: ['From two until five', 'From nine until twelve', 'In the evenings'], answer: 0, evidence: 'Part 3: "Say from two until five, with a short break."' },
    { id: 19, type: 'mcq', text: 'Where can they find practice papers?', options: ['In the library', 'From their teacher', 'On the department website'], answer: 2, evidence: 'Part 3: "The department website has papers from the last five years."' },
    { id: 20, type: 'mcq', text: 'What do they decide about the weekends?', options: ['They will study on both days.', 'They will take Sundays off.', 'They will take Saturdays off.'], answer: 1, evidence: 'Part 3: "Let\'s take Sundays off."' },
    { id: 21, type: 'mcq', text: 'Why did Max go to work in the mountains?', options: ['He was born there.', 'He wanted to see a different part of the country.', 'The salary was higher.'], answer: 1, evidence: 'Part 4: "I wanted to see a different part of the country".' },
    { id: 22, type: 'mcq', text: 'How long did he plan to stay?', options: ['One year', 'Four years', 'Two years'], answer: 0, evidence: 'Part 4: "I planned to stay one year".' },
    { id: 23, type: 'mcq', text: 'How many pupils are there at the school?', options: ['Fifteen', 'Seventy', 'Forty-five'], answer: 2, evidence: 'Part 4: "There are only forty-five pupils".' },
    { id: 24, type: 'mcq', text: 'What else does he sometimes teach?', options: ['Maths', 'Geography', 'History'], answer: 1, evidence: 'Part 4: "and also, sometimes, geography".' },
    { id: 25, type: 'mcq', text: 'What is an advantage of the school?', options: ['He knows every pupil well.', 'It has many resources.', 'It is near the city.'], answer: 0, evidence: 'Part 4: "The classes are small, so I know every pupil well."' },
    { id: 26, type: 'mcq', text: 'What changed two years ago?', options: ['A new road was built.', 'More teachers arrived.', 'A charity installed satellite internet.'], answer: 2, evidence: 'Part 4: "Two years ago a charity installed satellite internet."' },
    { id: 27, type: 'mcq', text: 'What is the hardest thing about working there?', options: ['The winter, when the road can be closed', 'The low salary', 'The long working day'], answer: 0, evidence: 'Part 4: "Winter. The road is sometimes closed by snow".' },
    { id: 28, type: 'mcq', text: 'What would Max like to do in the future?', options: ['Move back to the city', 'Train other teachers for rural schools', 'Open his own school'], answer: 1, evidence: 'Part 4: "I\'d like to train other teachers who want to work in rural schools".' },
    { id: 29, type: 'fill', text: 'Spices were also used as medicines and to ______ meat.', answers: ['preserve'], evidence: 'Part 5: "as medicines and to preserve meat".' },
    { id: 30, type: 'fill', text: 'Most spices grew only in tropical parts of ______.', answers: ['asia'], evidence: 'Part 5: "Most spices grew only in tropical parts of Asia".' },
    { id: 31, type: 'fill', text: 'Their price increased at every ______ of the journey.', answers: ['stage'], evidence: 'Part 5: "their price increased at every stage of the journey".' },
    { id: 32, type: 'fill', text: 'Pepper was sometimes used to pay rent or ______.', answers: ['taxes'], evidence: 'Part 5: "used to pay rent or taxes".' },
    { id: 33, type: 'fill', text: 'Merchants in ______ became extremely rich.', answers: ['venice'], evidence: 'Part 5: "Merchants in Venice became extremely rich".' },
    { id: 34, type: 'fill', text: 'Explorers searched for a ______ route to Asia.', answers: ['sea'], evidence: 'Part 5: "searched for a sea route to Asia".' },
    { id: 35, type: 'fill', text: 'Next week: the history of ______.', answers: ['sugar'], evidence: 'Part 5: "we\'ll look at the history of sugar".' },
  ],
};
