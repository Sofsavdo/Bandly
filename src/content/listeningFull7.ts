import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 7: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: 'Good morning, Coastline Car Hire. Sarah speaking.' },
  { speaker: 'B', text: "Hello. I'd like to hire a car for a week next month, please." },
  { speaker: 'A', text: 'Certainly. What dates do you need it for?' },
  { speaker: 'B', text: 'From the third to the tenth of July.' },
  { speaker: 'A', text: 'And where would you like to collect it? We have an office at the airport and one at the train station.' },
  { speaker: 'B', text: "The airport, please. My flight lands at about two in the afternoon." },
  { speaker: 'A', text: "Fine. What size of car would you like? We have small, medium and large." },
  { speaker: 'B', text: "There are four of us, with quite a lot of luggage, so I think medium isn't big enough. Large, please." },
  { speaker: 'A', text: 'The large car is sixty-five pounds a day, or four hundred pounds for the whole week.' },
  { speaker: 'B', text: "We'll take the weekly rate. Is insurance included?" },
  { speaker: 'A', text: 'Basic insurance is included. Full insurance costs an extra twelve pounds a day, which I would recommend, because the roads in the hills are quite narrow.' },
  { speaker: 'B', text: "OK, we'll have the full insurance. And can my wife drive as well?" },
  { speaker: 'A', text: "Yes, an additional driver is free, but she'll need to show her licence when you collect the car." },
  { speaker: 'B', text: 'And we need a child seat for our youngest. She’s three.' },
  { speaker: 'A', text: "No problem. That's five pounds for the week. Now, can I take your name?" },
  { speaker: 'B', text: "It's Martin Galloway. G, A, double L, O, W, A, Y." },
  { speaker: 'A', text: 'And an email address?' },
  { speaker: 'B', text: 'martin dot galloway at fastmail dot com.' },
  { speaker: 'A', text: 'Thank you. One more thing: the car must be returned with a full tank of fuel. Otherwise, we charge for filling it.' },
  { speaker: 'B', text: "Understood. We'll return it full." },
];

const PART2: L[] = [
  { speaker: 'B', text: "Hello everyone, and welcome to your first day at Northgate College. I'm Daniel Brooks, the student services manager, and I'm going to tell you about the support that's available to you." },
  { speaker: 'B', text: "Let's start with the Student Centre, which is the large white building opposite the main entrance. That's where you'll find our advice team. They can help with anything from accommodation problems to money worries, and you don't need an appointment in the mornings." },
  { speaker: 'B', text: 'If you need help with your studies, especially with academic writing, go to the Learning Hub on the first floor of the library. They run free workshops every week, and you can also book a one-to-one session with a tutor.' },
  { speaker: 'B', text: 'For health problems, the college nurse is available every weekday from nine to one. If you need a doctor, you should register with the medical centre in the town, which is a ten-minute walk away. Please do this in your first week, rather than waiting until you are ill.' },
  { speaker: 'B', text: 'Many students find the first few weeks difficult, especially if they are living away from home for the first time. Our counselling service is free and confidential, and there is usually no waiting list in September.' },
  { speaker: 'B', text: "Now, sport and clubs. The sports hall is behind the science block. Membership of the gym costs fifty pounds a year for students, which is much cheaper than the gyms in town. There are also more than forty clubs and societies, and you can join them at the clubs fair next Wednesday in the main hall." },
  { speaker: 'B', text: 'Finally, please make sure you collect your student ID card from reception before Friday. You will need it to use the library and to get discounts on local buses.' },
];

const PART3: L[] = [
  { speaker: 'C', text: "Professor Hale, thank you for seeing us. We wanted to talk about our marketing project on the new bakery." },
  { speaker: 'A', text: 'Of course, Leila. And Ravi, good to see you. How far have you got?' },
  { speaker: 'D', text: "We've finished the customer survey. We asked a hundred and twenty people in the shopping street what they look for in a bakery." },
  { speaker: 'A', text: 'And what was the main result?' },
  { speaker: 'C', text: "Freshness came first, by a long way. Price was second, which surprised us, because the area is quite wealthy." },
  { speaker: 'A', text: "Not so surprising, perhaps. People in wealthy areas still compare prices. Did you ask about opening hours?" },
  { speaker: 'D', text: "Yes. Most people wanted the bakery to open earlier, at about seven, so they could buy something on the way to work." },
  { speaker: 'A', text: "That's a useful practical point for the owner. What about your sample? Who did you survey?" },
  { speaker: 'C', text: "That's a weakness, I think. We did it on weekday afternoons, so we mainly spoke to retired people and parents with small children." },
  { speaker: 'A', text: "Yes, you'll need to acknowledge that. Workers are under-represented. Could you add some responses from an online survey?" },
  { speaker: 'D', text: "We could share a link on the bakery's social media page. I'll set that up." },
  { speaker: 'A', text: 'Good. And for the final report, I want to see clear recommendations, not just results.' },
  { speaker: 'C', text: "I'll draft the recommendations, then. I've already got some ideas about a loyalty card." },
  { speaker: 'D', text: 'And I can analyse the new online responses when they come in.' },
  { speaker: 'A', text: 'Who is going to present to the owner?' },
  { speaker: 'C', text: "Ravi should do it. He's met her already." },
  { speaker: 'D', text: "OK. And Leila, could you prepare the summary sheet that we'll leave with her?" },
  { speaker: 'C', text: 'Sure.' },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good afternoon. Today I want to talk about camels, and in particular about how they are adapted to life in the desert." },
  { speaker: 'A', text: 'There are two main kinds of camel. The dromedary, which has one hump, lives mainly in the Middle East and North Africa. The Bactrian camel, which has two humps, is found in the cold deserts of Central Asia, including parts of Mongolia and China.' },
  { speaker: 'A', text: 'A common belief is that camels store water in their humps. In fact, the hump is made of fat. When food is scarce, the camel can break down this fat for energy. A camel that has not eaten for a long time will have a hump that is small and leans to one side.' },
  { speaker: 'A', text: 'Camels are remarkably good at saving water. Their kidneys produce very concentrated urine, and their body temperature can rise by several degrees during the day before they start to sweat. At night, the body cools down again, so the camel loses very little water.' },
  { speaker: 'A', text: 'When a camel does find water, it can drink an enormous amount very quickly, up to a hundred litres in about ten minutes. Most other animals would become seriously ill if they drank so much so fast.' },
  { speaker: 'A', text: 'Their bodies are also protected against sand. Camels have two rows of long eyelashes, and they can close their nostrils during sandstorms. Their wide feet spread out on the sand, which stops them from sinking.' },
  { speaker: 'A', text: 'For thousands of years, camels have been essential to desert peoples. They provide transport, milk, meat, wool and leather. In recent years, camel milk has attracted interest because it contains more vitamin C than cow’s milk.' },
  { speaker: 'A', text: 'However, wild Bactrian camels are now critically endangered, with probably fewer than a thousand left. In the next lecture, we will look at the efforts being made to protect them.' },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull7: ListeningTest = {
  id: 'listening-full-7',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 7',
  minutes: 35,
  names: { A: 'Sarah', B: 'Martin / Daniel', C: 'Leila', D: 'Ravi' },
  context: '4 qism: 1) avtomobil ijarasi (telefon); 2) kollejda talabalarga yordam xizmatlari; 3) talabalar va professorning nonvoyxona loyihasi muhokamasi; 4) tuyalarning cho‘lga moslashuvi haqida ma’ruza.',
  script: SCRIPT,
  sections: [
    { at: 0, title: 'Part 1 — Questions 1–10' },
    { at: PART1.length, title: 'Part 2 — Questions 11–20' },
    { at: PART1.length + PART2.length, title: 'Part 3 — Questions 21–30' },
    { at: PART1.length + PART2.length + PART3.length, title: 'Part 4 — Questions 31–40' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–10: Complete the booking form. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { instruction: 'Part 2 — Questions 11–15: Choose the correct letter.', questionIds: [11, 12, 13, 14, 15] },
    { instruction: 'Part 2 — Questions 16–20: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [16, 17, 18, 19, 20] },
    { instruction: 'Part 3 — Questions 21–26: Choose the correct letter.', questionIds: [21, 22, 23, 24, 25, 26] },
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Leila or Ravi.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Hire dates: 3 to 10 ______', answers: ['july'], evidence: 'Part 1: "From the third to the tenth of July."' },
    { id: 2, type: 'fill', text: 'Collect the car at the ______', answers: ['airport'], evidence: 'Part 1: "The airport, please."' },
    { id: 3, type: 'fill', text: 'Size of car: ______', answers: ['large'], evidence: 'Part 1: "Large, please."' },
    { id: 4, type: 'fill', text: 'Price for the week: £______', answers: ['400', 'four hundred'], evidence: 'Part 1: "four hundred pounds for the whole week".' },
    { id: 5, type: 'fill', text: 'Full insurance: extra £______ per day', answers: ['12', 'twelve'], evidence: 'Part 1: "Full insurance costs an extra twelve pounds a day".' },
    { id: 6, type: 'fill', text: 'Additional driver must show her ______', answers: ['licence', 'license'], evidence: 'Part 1: "she\'ll need to show her licence".' },
    { id: 7, type: 'fill', text: 'Extra item: a child ______', answers: ['seat'], evidence: 'Part 1: "we need a child seat for our youngest".' },
    { id: 8, type: 'fill', text: 'Cost of the extra item: £______', answers: ['5', 'five'], evidence: 'Part 1: "That\'s five pounds for the week."' },
    { id: 9, type: 'fill', text: 'Surname: ______', answers: ['galloway'], evidence: 'Part 1: "Martin Galloway. G, A, double L, O, W, A, Y."' },
    { id: 10, type: 'fill', text: 'Return the car with a full tank of ______', answers: ['fuel'], evidence: 'Part 1: "returned with a full tank of fuel".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'Where is the Student Centre?', options: ['Behind the science block', 'Opposite the main entrance', 'Next to the library', 'In the main hall'], answer: 1, evidence: 'Part 2: "the large white building opposite the main entrance".' },
    { id: 12, type: 'mcq', text: 'When can students see the advice team without an appointment?', options: ['In the mornings', 'In the evenings', 'On Fridays', 'At any time'], answer: 0, evidence: 'Part 2: "you don\'t need an appointment in the mornings".' },
    { id: 13, type: 'mcq', text: 'What does the Learning Hub mainly help with?', options: ['Finding a job', 'Using computers', 'Academic writing', 'Money problems'], answer: 2, evidence: 'Part 2: "If you need help with your studies, especially with academic writing".' },
    { id: 14, type: 'mcq', text: 'What does the speaker advise about the medical centre?', options: ['Visit only in an emergency', 'Phone before going', 'Use the college nurse instead', 'Register in the first week'], answer: 3, evidence: 'Part 2: "Please do this in your first week, rather than waiting until you are ill."' },
    { id: 15, type: 'mcq', text: 'What is said about the counselling service?', options: ['It is usually full in September.', 'It is free and confidential.', 'It is only for first-year students.', 'It is in the town.'], answer: 1, evidence: 'Part 2: "Our counselling service is free and confidential".' },
    { id: 16, type: 'fill', text: 'College nurse: weekdays from 9 to ______', answers: ['1', 'one'], evidence: 'Part 2: "every weekday from nine to one".' },
    { id: 17, type: 'fill', text: 'Gym membership for students: £______ a year', answers: ['50', 'fifty'], evidence: 'Part 2: "fifty pounds a year for students".' },
    { id: 18, type: 'fill', text: 'Number of clubs and societies: more than ______', answers: ['40', 'forty'], evidence: 'Part 2: "more than forty clubs and societies".' },
    { id: 19, type: 'fill', text: 'Clubs fair: next ______', answers: ['wednesday'], evidence: 'Part 2: "the clubs fair next Wednesday in the main hall".' },
    { id: 20, type: 'fill', text: 'Collect the ID card from reception before ______', answers: ['friday'], evidence: 'Part 2: "collect your student ID card from reception before Friday".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'What did customers say was most important?', options: ['Price', 'Freshness', 'Friendly staff'], answer: 1, evidence: 'Part 3: "Freshness came first, by a long way."' },
    { id: 22, type: 'mcq', text: 'Why were the students surprised by the result for price?', options: ['The area is quite wealthy.', 'The bakery is cheap.', 'Few people answered.'], answer: 0, evidence: 'Part 3: "Price was second, which surprised us, because the area is quite wealthy."' },
    { id: 23, type: 'mcq', text: 'What did most people want about opening hours?', options: ['Later closing', 'Opening on Sundays', 'Earlier opening'], answer: 2, evidence: 'Part 3: "Most people wanted the bakery to open earlier, at about seven".' },
    { id: 24, type: 'mcq', text: 'What is the weakness of their sample?', options: ['It was too small.', 'Workers are under-represented.', 'It only included students.'], answer: 1, evidence: 'Part 3: "Workers are under-represented."' },
    { id: 25, type: 'mcq', text: 'How will they get more responses?', options: ['With an online survey', 'By surveying on Saturdays', 'By asking the owner'], answer: 0, evidence: 'Part 3: "Could you add some responses from an online survey?"' },
    { id: 26, type: 'mcq', text: 'What does the professor want in the final report?', options: ['More graphs', 'A shorter introduction', 'Clear recommendations'], answer: 2, evidence: 'Part 3: "I want to see clear recommendations, not just results."' },
    { id: 27, type: 'mcq', text: 'Setting up the online survey link', options: ['Leila', 'Ravi'], answer: 1, evidence: 'Part 3: Ravi: "I\'ll set that up."' },
    { id: 28, type: 'mcq', text: 'Drafting the recommendations', options: ['Leila', 'Ravi'], answer: 0, evidence: 'Part 3: Leila: "I\'ll draft the recommendations, then."' },
    { id: 29, type: 'mcq', text: 'Presenting to the owner', options: ['Leila', 'Ravi'], answer: 1, evidence: 'Part 3: Leila: "Ravi should do it." — Ravi: "OK."' },
    { id: 30, type: 'mcq', text: 'Preparing the summary sheet', options: ['Leila', 'Ravi'], answer: 0, evidence: 'Part 3: "Leila, could you prepare the summary sheet" — "Sure."' },
    // Part 4
    { id: 31, type: 'fill', text: 'The Bactrian camel has ______ humps.', answers: ['2', 'two'], evidence: 'Part 4: "The Bactrian camel, which has two humps".' },
    { id: 32, type: 'fill', text: 'The hump is made of ______.', answers: ['fat'], evidence: 'Part 4: "the hump is made of fat".' },
    { id: 33, type: 'fill', text: 'A hungry camel’s hump becomes small and leans to one ______.', answers: ['side'], evidence: 'Part 4: "small and leans to one side".' },
    { id: 34, type: 'fill', text: 'Camels’ ______ produce very concentrated urine.', answers: ['kidneys'], evidence: 'Part 4: "Their kidneys produce very concentrated urine".' },
    { id: 35, type: 'fill', text: 'Their body temperature can rise before they start to ______.', answers: ['sweat'], evidence: 'Part 4: "can rise by several degrees during the day before they start to sweat".' },
    { id: 36, type: 'fill', text: 'A camel can drink up to ______ litres in about ten minutes.', answers: ['100', 'a hundred', 'hundred'], evidence: 'Part 4: "up to a hundred litres in about ten minutes".' },
    { id: 37, type: 'fill', text: 'Camels have two rows of long ______.', answers: ['eyelashes'], evidence: 'Part 4: "Camels have two rows of long eyelashes".' },
    { id: 38, type: 'fill', text: 'They can close their ______ during sandstorms.', answers: ['nostrils'], evidence: 'Part 4: "they can close their nostrils during sandstorms".' },
    { id: 39, type: 'fill', text: 'Camel milk contains more vitamin ______ than cow’s milk.', answers: ['c'], evidence: 'Part 4: "it contains more vitamin C than cow’s milk".' },
    { id: 40, type: 'fill', text: 'Probably fewer than a ______ wild Bactrian camels are left.', answers: ['thousand', '1000'], evidence: 'Part 4: "with probably fewer than a thousand left".' },
  ],
};
