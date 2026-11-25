import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 3: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: "Good evening, Baggage Services. My name's Jane. How can I help?" },
  { speaker: 'B', text: "Hello. I've just arrived on the flight from Istanbul, and my suitcase didn't come out onto the belt." },
  { speaker: 'A', text: "I'm sorry to hear that. Let me take some details. Could I have your name, please?" },
  { speaker: 'B', text: "Robert Hensley. That's H, E, N, S, L, E, Y." },
  { speaker: 'A', text: 'Thank you. Can you describe the suitcase?' },
  { speaker: 'B', text: "It's a large, dark green suitcase with four wheels. It's quite new." },
  { speaker: 'A', text: 'Any distinguishing features? A label, perhaps?' },
  { speaker: 'B', text: "Yes, there's a yellow ribbon tied to the handle, so I can recognise it easily." },
  { speaker: 'A', text: "That's helpful. And what's inside, roughly?" },
  { speaker: 'B', text: 'Mostly clothes, and a pair of running shoes. Oh, and some books. Nothing very valuable, fortunately. I kept my laptop with me.' },
  { speaker: 'A', text: "Good. Now, where are you staying? We'll deliver the bag to you once we find it." },
  { speaker: 'B', text: 'At the Kingsley Hotel, on Bridge Street, for the next five nights.' },
  { speaker: 'A', text: 'Kingsley. K, I, N, G, S, L, E, Y?' },
  { speaker: 'B', text: "That's right." },
  { speaker: 'A', text: 'And a contact number?' },
  { speaker: 'B', text: 'My mobile is oh seven eight four one, two six six, nine oh five.' },
  { speaker: 'A', text: "Thank you. In most cases, bags arrive on the next flight, which lands tomorrow morning. We'll deliver it by the afternoon." },
  { speaker: 'B', text: 'And if I need to buy some things tonight? A toothbrush and so on?' },
  { speaker: 'A', text: 'You can claim back up to fifty pounds for essential items. Just keep the receipts and send them to us by email.' },
  { speaker: 'B', text: 'OK. Is there a reference number?' },
  { speaker: 'A', text: 'Yes, your reference is G, H, X, four seven one. You can use it to track your bag on our website.' },
  { speaker: 'B', text: 'Thanks very much.' },
  { speaker: 'A', text: "You're welcome. And if you haven't heard from us by Thursday, please call this number again." },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good morning, ladies and gentlemen, and welcome aboard the Valley Steam Railway. I'm the manager, and before we set off I'd like to tell you a little about the line and about today's journey." },
  { speaker: 'B', text: 'The railway was originally built in 1870 to carry coal from the mines in the hills down to the port. Passengers were carried too, but they were never the main source of income. When the mines closed in the 1960s, the line was closed as well, and for nearly twenty years the tracks were left to rust.' },
  { speaker: 'B', text: 'In 1983, a group of enthusiasts formed a society to bring the railway back to life. Almost all the work was done by volunteers, and the first section reopened in 1991. Today we have over four hundred members, and only six paid staff.' },
  { speaker: 'B', text: "The locomotive pulling us today is called the Duchess. She was built in 1924 and spent most of her working life in Scotland before she came to us. She needs about two tonnes of coal for a day's work, and the driver and fireman have to start preparing her at six in the morning." },
  { speaker: 'B', text: "Our journey today takes about fifty minutes in each direction. We'll stop first at Millbrook, where there's a short wait while the train takes on water. The end of the line is Castleton, where you'll have an hour and a half to explore before we return." },
  { speaker: 'B', text: "At Castleton, the station café is open, and I can recommend the homemade soup. If you'd like to see the castle, it's a ten-minute walk up the hill, but please note that it closes at four, so don't leave it too late." },
  { speaker: 'B', text: "For those who are interested in the history of the line, there's a small museum in the old ticket office at Castleton. Entry is free, although donations are welcome." },
  { speaker: 'B', text: "A couple of safety points. Please don't lean out of the windows, especially in the tunnels, and keep children seated while the train is moving. Thank you, and enjoy the journey." },
];

const PART3: L[] = [
  { speaker: 'C', text: 'Leo, we need to finalise the plans for our river study. The fieldwork is next Friday.' },
  { speaker: 'D', text: "Right. I've been looking at the map. I think we should take our measurements at three points along the river: near the source, in the middle, and just before it reaches the town." },
  { speaker: 'C', text: "Three sounds sensible. The tutor said four, didn't she?" },
  { speaker: 'D', text: "She said at least three. Four would be better, but the fourth site is on private land, and we haven't got permission." },
  { speaker: 'C', text: 'Then three it is. What are we measuring at each point?' },
  { speaker: 'D', text: 'Width, depth and speed of the water. And I thought we could test the water quality too.' },
  { speaker: 'C', text: "We don't have the equipment for that, though. The department only has one testing kit, and another group has already booked it." },
  { speaker: 'D', text: "Ah. Then let's leave out water quality and do it properly next term." },
  { speaker: 'C', text: "Fine. How are we getting there? The bus doesn't go anywhere near the source." },
  { speaker: 'D', text: 'My brother has offered to drive us, but only in the morning. So we should start at the source and work our way down towards the town, where we can catch the bus back.' },
  { speaker: 'C', text: "Clever. What about safety? The river might be high if it's been raining." },
  { speaker: 'D', text: "We should check the weather forecast the night before. And we must wear proper boots, not trainers. If the water is above our knees, we don't go in." },
  { speaker: 'C', text: "Agreed. Now, who's doing what on the day? I'm happy to take the measurements in the water." },
  { speaker: 'D', text: "Then I'll write everything down. I'll also take the photographs at each site." },
  { speaker: 'C', text: "And afterwards, when we write it up, could you draw the maps? You're much better at that." },
  { speaker: 'D', text: 'OK, if you do the calculations. Statistics give me a headache.' },
  { speaker: 'C', text: 'Deal. One more thing: we should take some extra food. Last time I did fieldwork we were out much longer than planned.' },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good morning. Today's topic is one that we rarely think of as a subject for science: laughter." },
  { speaker: 'A', text: 'Laughter is much older than language. Researchers have observed laughter-like sounds in apes when they play and tickle each other, and some scientists believe that rats produce similar sounds, although these are too high for humans to hear.' },
  { speaker: 'A', text: 'One of the most interesting findings is that most laughter has little to do with jokes. In one well-known study, researchers listened to people talking in public places and found that only a small proportion of laughter followed anything that could be called funny. Most of it followed ordinary remarks such as "See you later".' },
  { speaker: 'A', text: 'This suggests that laughter is mainly a social signal. It tells others that we are friendly and that we are enjoying their company. We are around thirty times more likely to laugh when we are with other people than when we are alone.' },
  { speaker: 'A', text: 'Laughter is also contagious. When we hear someone laughing, the parts of the brain that prepare the face to smile become active. This is why television comedies have sometimes used recorded laughter: it makes viewers more likely to laugh themselves.' },
  { speaker: 'A', text: 'What about health? Laughter has been linked to a reduction in stress hormones, and some studies suggest that it can increase our tolerance of pain, possibly because it releases natural chemicals called endorphins. However, many of these studies were small, and more research is needed before we can make strong claims.' },
  { speaker: 'A', text: 'Interestingly, the speaker usually laughs more than the listener. And in conversations between people of different status, it is often the person with less power who laughs more, which suggests that laughter can also be a way of showing agreement or respect.' },
  { speaker: 'A', text: "In the next session, we'll look at crying, which, as you'll see, has some surprising similarities to laughter." },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull3: ListeningTest = {
  id: 'listening-full-3',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 3',
  minutes: 35,
  names: { A: 'Jane / Lecturer', B: 'Robert / Manager', C: 'Nadia', D: 'Leo' },
  context: '4 qism: 1) aeroportda yo‘qolgan yuk haqida ariza; 2) bug‘ poyezdida sayohat oldidan ma’lumot; 3) ikki talabaning daryo tadqiqoti rejasi; 4) kulgi ilmi haqida ma’ruza.',
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
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Nadia or Leo.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Flight from: ______', answers: ['istanbul'], evidence: 'Part 1: "I\'ve just arrived on the flight from Istanbul".' },
    { id: 2, type: 'fill', text: 'Surname: ______', answers: ['hensley'], evidence: 'Part 1: "Robert Hensley. That\'s H, E, N, S, L, E, Y."' },
    { id: 3, type: 'fill', text: 'Suitcase colour: dark ______', answers: ['green'], evidence: 'Part 1: "a large, dark green suitcase with four wheels".' },
    { id: 4, type: 'fill', text: 'Special feature: a yellow ______ on the handle', answers: ['ribbon'], evidence: 'Part 1: "there\'s a yellow ribbon tied to the handle".' },
    { id: 5, type: 'fill', text: 'Contents: clothes, running shoes and some ______', answers: ['books'], evidence: 'Part 1: "a pair of running shoes. Oh, and some books".' },
    { id: 6, type: 'fill', text: 'Staying at: the ______ Hotel', answers: ['kingsley'], evidence: 'Part 1: "At the Kingsley Hotel".' },
    { id: 7, type: 'fill', text: 'Hotel address: ______ Street', answers: ['bridge'], evidence: 'Part 1: "on Bridge Street".' },
    { id: 8, type: 'fill', text: 'Length of stay: ______ nights', answers: ['5', 'five'], evidence: 'Part 1: "for the next five nights".' },
    { id: 9, type: 'fill', text: 'Essential items: can claim up to £______', answers: ['50', 'fifty'], evidence: 'Part 1: "claim back up to fifty pounds for essential items".' },
    { id: 10, type: 'fill', text: 'Call again if no news by ______', answers: ['thursday'], evidence: 'Part 1: "if you haven\'t heard from us by Thursday".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'The railway was first built to carry', options: ['passengers.', 'fish from the port.', 'coal from the mines.', 'farm products.'], answer: 2, evidence: 'Part 2: "built in 1870 to carry coal from the mines".' },
    { id: 12, type: 'mcq', text: 'Why did the line close?', options: ['The mines closed.', 'A new road was built.', 'The port closed.', 'The tracks were damaged by floods.'], answer: 0, evidence: 'Part 2: "When the mines closed in the 1960s, the line was closed as well".' },
    { id: 13, type: 'mcq', text: 'How many paid staff does the railway have today?', options: ['Four', 'Six', 'Twenty', 'Four hundred'], answer: 1, evidence: 'Part 2: "only six paid staff".' },
    { id: 14, type: 'mcq', text: 'Where did the Duchess spend most of her working life?', options: ['In Wales', 'At the port', 'In Ireland', 'In Scotland'], answer: 3, evidence: 'Part 2: "spent most of her working life in Scotland".' },
    { id: 15, type: 'mcq', text: 'Why does the train stop at Millbrook?', options: ['To change drivers', 'To take on water', 'To let passengers see the castle', 'To collect coal'], answer: 1, evidence: 'Part 2: "a short wait while the train takes on water".' },
    { id: 16, type: 'fill', text: 'The journey takes about fifty ______ each way.', answers: ['minutes'], evidence: 'Part 2: "takes about fifty minutes in each direction".' },
    { id: 17, type: 'fill', text: 'The station café: try the homemade ______.', answers: ['soup'], evidence: 'Part 2: "I can recommend the homemade soup".' },
    { id: 18, type: 'fill', text: 'The castle closes at ______ o’clock.', answers: ['4', 'four'], evidence: 'Part 2: "it closes at four".' },
    { id: 19, type: 'fill', text: 'The museum is in the old ticket ______.', answers: ['office'], evidence: 'Part 2: "a small museum in the old ticket office".' },
    { id: 20, type: 'fill', text: 'Do not lean out of the windows, especially in the ______.', answers: ['tunnels'], evidence: 'Part 2: "especially in the tunnels".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'At how many points will they take measurements?', options: ['Two', 'Three', 'Four'], answer: 1, evidence: 'Part 3: "Then three it is."' },
    { id: 22, type: 'mcq', text: 'Why will they not use the fourth site?', options: ['It is too far away.', 'It is dangerous.', 'They do not have permission.'], answer: 2, evidence: 'Part 3: "the fourth site is on private land, and we haven\'t got permission".' },
    { id: 23, type: 'mcq', text: 'Why will they not test the water quality?', options: ['The equipment is not available.', 'The tutor did not ask for it.', 'It would take too long.'], answer: 0, evidence: 'Part 3: "The department only has one testing kit, and another group has already booked it."' },
    { id: 24, type: 'mcq', text: 'How will they get to the source of the river?', options: ['By bus', 'Leo’s brother will drive them.', 'On foot'], answer: 1, evidence: 'Part 3: "My brother has offered to drive us, but only in the morning."' },
    { id: 25, type: 'mcq', text: 'Where will they finish the fieldwork?', options: ['Near the town', 'At the source', 'In the middle of the river'], answer: 0, evidence: 'Part 3: "work our way down towards the town, where we can catch the bus back".' },
    { id: 26, type: 'mcq', text: 'Which safety rule do they agree on?', options: ['They will only go if it has not rained.', 'They will wear trainers.', 'They will not go in if the water is above their knees.'], answer: 2, evidence: 'Part 3: "If the water is above our knees, we don\'t go in."' },
    { id: 27, type: 'mcq', text: 'Taking measurements in the water', options: ['Nadia', 'Leo'], answer: 0, evidence: 'Part 3: Nadia: "I\'m happy to take the measurements in the water."' },
    { id: 28, type: 'mcq', text: 'Taking photographs', options: ['Nadia', 'Leo'], answer: 1, evidence: 'Part 3: Leo: "I\'ll also take the photographs at each site."' },
    { id: 29, type: 'mcq', text: 'Drawing the maps', options: ['Nadia', 'Leo'], answer: 1, evidence: 'Part 3: Nadia: "could you draw the maps?" — Leo: "OK".' },
    { id: 30, type: 'mcq', text: 'Doing the calculations', options: ['Nadia', 'Leo'], answer: 0, evidence: 'Part 3: Leo: "if you do the calculations" — Nadia: "Deal."' },
    // Part 4
    { id: 31, type: 'fill', text: 'Laughter-like sounds have been observed in ______ when they play.', answers: ['apes'], evidence: 'Part 4: "laughter-like sounds in apes when they play".' },
    { id: 32, type: 'fill', text: 'Similar sounds made by ______ are too high for humans to hear.', answers: ['rats'], evidence: 'Part 4: "rats produce similar sounds, although these are too high for humans to hear".' },
    { id: 33, type: 'fill', text: 'Most laughter has little to do with ______.', answers: ['jokes'], evidence: 'Part 4: "most laughter has little to do with jokes".' },
    { id: 34, type: 'fill', text: 'Laughter is mainly a ______ signal.', answers: ['social'], evidence: 'Part 4: "laughter is mainly a social signal".' },
    { id: 35, type: 'fill', text: 'We are about ______ times more likely to laugh with other people.', answers: ['30', 'thirty'], evidence: 'Part 4: "around thirty times more likely to laugh".' },
    { id: 36, type: 'fill', text: 'Laughter is ______: hearing it prepares our face to smile.', answers: ['contagious'], evidence: 'Part 4: "Laughter is also contagious."' },
    { id: 37, type: 'fill', text: 'TV comedies have used ______ laughter.', answers: ['recorded'], evidence: 'Part 4: "television comedies have sometimes used recorded laughter".' },
    { id: 38, type: 'fill', text: 'Laughter may increase our tolerance of ______.', answers: ['pain'], evidence: 'Part 4: "increase our tolerance of pain".' },
    { id: 39, type: 'fill', text: 'It may release natural chemicals called ______.', answers: ['endorphins'], evidence: 'Part 4: "natural chemicals called endorphins".' },
    { id: 40, type: 'fill', text: 'Topic of the next session: ______', answers: ['crying'], evidence: 'Part 4: "In the next session, we\'ll look at crying".' },
  ],
};
