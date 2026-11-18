import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
// Ovozlar (tools/audio-tasks.ts): A — Sarah (UK), B — Alistair (UK), C — Hope (US), D — Max (US).
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: 'Good afternoon, Greenway Community Centre. This is Helen speaking. How can I help?' },
  { speaker: 'B', text: "Hello. I saw a poster about your evening courses, and I'd like to book a place on one of them." },
  { speaker: 'A', text: "Certainly. Which course are you interested in?" },
  { speaker: 'B', text: "The photography course for beginners. I'm not sure if there are still places." },
  { speaker: 'A', text: "Let me check. Yes, there are three places left on the Thursday group. The Monday group is already full, I'm afraid." },
  { speaker: 'B', text: "Thursday is fine, actually. Probably better for me." },
  { speaker: 'A', text: "Good. I'll need to take a few details. Could I have your full name, please?" },
  { speaker: 'B', text: "Yes, it's Mark Fenwick." },
  { speaker: 'A', text: "Could you spell the surname?" },
  { speaker: 'B', text: "F, E, N, W, I, C, K." },
  { speaker: 'A', text: "Thank you. And your address?" },
  { speaker: 'B', text: "It's twenty-seven Mill Lane, in Ashford." },
  { speaker: 'A', text: "Twenty-seven Mill Lane. And a phone number we can reach you on?" },
  { speaker: 'B', text: "My mobile is oh seven nine six two, four four eight, three one oh." },
  { speaker: 'A', text: "Oh seven nine six two, four four eight, three one oh. Lovely. Now, the course runs for eight weeks, starting on the ninth of October." },
  { speaker: 'B', text: "And what time does it start?" },
  { speaker: 'A', text: "Classes begin at half past seven and finish at nine. They're held in Room 12, which is on the first floor, next to the library." },
  { speaker: 'B', text: "And how much does it cost?" },
  { speaker: 'A', text: "The full price is ninety-five pounds, but if you're a member of the centre, it's seventy." },
  { speaker: 'B', text: "I'm not a member. Is it worth joining?" },
  { speaker: 'A', text: "Membership is fifteen pounds a year, so you would save ten pounds on this course alone, and you'd also get a discount at the café." },
  { speaker: 'B', text: "Then I'll join. Do I need to bring my own camera?" },
  { speaker: 'A', text: "You can use your phone for the first two weeks. After that, the tutor recommends a simple digital camera, but the centre can lend you one if necessary. You'll also need a notebook." },
  { speaker: 'B', text: "That sounds fine. How do I pay?" },
  { speaker: 'A', text: "You can pay by card over the phone now, or in cash at reception before the first class." },
  { speaker: 'B', text: "I'll pay at reception, if that's all right." },
  { speaker: 'A', text: "Of course. Just one more thing: how did you hear about the course?" },
  { speaker: 'B', text: "A friend told me about it, and then I saw the poster at the station." },
  { speaker: 'A', text: "Wonderful. I'll send you a confirmation by text message today. We look forward to seeing you." },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good morning, everyone, and welcome to Hartley Gardens. My name is Tom, and I'm one of the volunteers here. Before you set off, I'd like to give you a short introduction and a few practical details." },
  { speaker: 'B', text: "The gardens were created in 1902 by a local doctor, Edward Hartley, who believed that fresh air and plants were good for his patients. After his death, the house was turned into a school for a while, and the gardens were neglected. They were only restored in the 1990s, when a group of local residents raised the money to save them." },
  { speaker: 'B', text: "Today the gardens cover about twelve hectares. If you look at the map you were given, you'll see that the main path goes in a circle. If you follow it all the way round, it takes about an hour and a half, but there are several shorter routes as well." },
  { speaker: 'B', text: "Let me mention a few of the highlights. Just past the entrance, on your left, is the Rose Garden. It's at its best in June, so you've come at the right time. Beyond that is the lake. Please don't feed the ducks, because bread is actually bad for them." },
  { speaker: 'B', text: "On the far side of the lake you'll find the glasshouse, which contains tropical plants. It's kept very warm, so you may want to take off your coat before you go in. Next to it is the children's play area, which was rebuilt last year." },
  { speaker: 'B', text: "One of our newest features is the Sensory Garden, near the north gate. It was designed for visitors with poor eyesight, so all the plants were chosen for their smell or the way they feel when you touch them. Please do touch them; that's what they're there for." },
  { speaker: 'B', text: "Now, some practical information. The café is in the old stable building, and it's open until five. The toilets are next to the café and also by the main car park. If you need help, our volunteers are wearing green jackets." },
  { speaker: 'B', text: "Finally, there's a talk by our head gardener at three o'clock this afternoon in the education centre. It's about growing vegetables in small spaces, and it's free, but places are limited, so please collect a ticket from the information desk if you'd like to attend." },
  { speaker: 'B', text: "That's all from me. Enjoy your visit." },
];

const PART3: L[] = [
  { speaker: 'C', text: "Hi, Daniel. Have you got a few minutes to talk about our presentation? It's only two weeks away now." },
  { speaker: 'D', text: "Sure, Emma. I've been reading about our topic, the four-day working week, and I think we've got plenty of material." },
  { speaker: 'C', text: "Good. I thought we could start with the trial that took place in Britain a few years ago. Most of the companies that took part decided to continue with the shorter week afterwards." },
  { speaker: 'D', text: "Yes, but I think we should be careful there. The companies chose to take part, so they were probably more enthusiastic than average. That might make the results look better than they would be in general." },
  { speaker: 'C', text: "That's a good point. We should mention it as a limitation." },
  { speaker: 'D', text: "What surprised me was that productivity didn't fall in most of the companies. I expected it to drop at least a little." },
  { speaker: 'C', text: "Me too. Apparently people cut down on long meetings and wasted time. One manager said meetings were reduced to thirty minutes." },
  { speaker: 'D', text: "And the staff reported less stress and better sleep. Although those results came from questionnaires, so they depend on what people said about themselves." },
  { speaker: 'C', text: "Right. Now, how should we divide the work? I'd be happy to do the background and the history of working hours." },
  { speaker: 'D', text: "Then I'll take the results of the trial. And maybe we can both do the conclusion together?" },
  { speaker: 'C', text: "Fine. What about visuals? Our tutor said she wanted fewer slides with words and more charts." },
  { speaker: 'D', text: "I can make the charts. I'm better with spreadsheets than you are, I think." },
  { speaker: 'C', text: "That's true! I'll find a short video clip, then. Something from an interview with an employee, maybe. Not more than a minute, though." },
  { speaker: 'D', text: "Good idea. One thing I'm worried about is the question time at the end. Some people are bound to ask whether this would work in hospitals or schools." },
  { speaker: 'C', text: "We should prepare an answer to that. The trial was mainly in offices, so we can say the evidence for other sectors is still limited." },
  { speaker: 'D', text: "Agreed. When shall we practise?" },
  { speaker: 'C', text: "How about next Wednesday afternoon in the library? We could book one of the study rooms." },
  { speaker: 'D', text: "Wednesday's fine, but the library rooms are always busy. Let's use the empty classroom on the second floor instead." },
  { speaker: 'C', text: "Perfect. I'll send you my part by Monday so you can read it first." },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good morning. Today I'm going to talk about honeybees, and in particular about how they communicate. For a long time, people wondered how bees that had found a good source of food were able to direct other bees to it. The answer came from the Austrian scientist Karl von Frisch, who studied bees for many years and later received a Nobel Prize for his work." },
  { speaker: 'A', text: "Von Frisch discovered that a bee returning to the hive performs a kind of dance on the surface of the honeycomb. When the food is close to the hive, the bee moves in small circles. This is called the round dance, and it simply tells the other bees that food is nearby." },
  { speaker: 'A', text: "When the food is further away, the bee performs what is known as the waggle dance. It runs forward in a straight line while shaking its body from side to side, then circles back and repeats the movement. The direction of the straight run shows the direction of the food in relation to the sun, and the length of the waggle tells the other bees the distance they need to fly." },
  { speaker: 'A', text: "What is remarkable is that the hive is usually dark, so the other bees cannot see the dance clearly. Instead, they follow the dancer closely and pick up the information through touch and vibration. They also learn the smell of the flowers from the dancer's body." },
  { speaker: 'A', text: "Of course, not every scientist accepted these findings at first. Some argued that bees simply followed the scent of the food. It was only later, when researchers used radar to track individual bees, that it became clear that the bees really did fly in the direction indicated by the dance." },
  { speaker: 'A', text: "Why does this matter today? Bees are responsible for pollinating a large proportion of the crops we eat, and in many regions bee populations have declined. Several causes have been suggested, including disease, the loss of wild flowers and the use of certain chemicals on farms." },
  { speaker: 'A', text: "Understanding how bees communicate can help farmers and planners. For example, if we know how far bees are prepared to fly, we can decide where to plant strips of flowers so that bees can reach them easily. In some cities, people are now encouraged to plant flowers on balconies and roofs." },
  { speaker: 'A', text: "In our next lecture, we'll look at how bees choose a new home when a colony becomes too large, a process in which, interestingly, the dance also plays a central role." },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];
const COURSES = ['photography', 'pottery', 'cooking', 'painting'];

export const listeningFull1: ListeningTest = {
  id: 'listening-full-1',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 1',
  minutes: 35,
  names: { A: 'Helen / Lecturer', B: 'Mark / Tom', C: 'Emma', D: 'Daniel' },
  context: '4 qism: 1) kursga yozilish (telefon); 2) bog‘ bo‘yicha qisqa ma’lumot; 3) ikki talabaning taqdimot muhokamasi; 4) asalarilar haqida ma’ruza.',
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
    { instruction: 'Part 2 — Questions 16–20: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [16, 17, 18, 19, 20] },
    { instruction: 'Part 3 — Questions 21–26: Choose the correct letter.', questionIds: [21, 22, 23, 24, 25, 26] },
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Emma or Daniel.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'mcq', text: 'Course chosen', options: COURSES, answer: 0, evidence: 'Part 1: "The photography course for beginners."' },
    { id: 2, type: 'fill', text: 'Day of the group: ______', answers: ['thursday'], evidence: 'Part 1: "three places left on the Thursday group".' },
    { id: 3, type: 'fill', text: 'Surname: ______', answers: ['fenwick'], evidence: 'Part 1: "F, E, N, W, I, C, K".' },
    { id: 4, type: 'fill', text: 'Address: 27 ______ Lane, Ashford', answers: ['mill'], evidence: 'Part 1: "twenty-seven Mill Lane, in Ashford".' },
    { id: 5, type: 'fill', text: 'Course length: ______ weeks', answers: ['8', 'eight'], evidence: 'Part 1: "the course runs for eight weeks".' },
    { id: 6, type: 'fill', text: 'Classes start at: ______ pm', answers: ['7.30', '7:30', 'half past seven'], evidence: 'Part 1: "Classes begin at half past seven".' },
    { id: 7, type: 'fill', text: 'Room: ______ (first floor)', answers: ['12', 'twelve'], evidence: 'Part 1: "held in Room 12".' },
    { id: 8, type: 'fill', text: 'Price for members: £______', answers: ['70', 'seventy'], evidence: 'Part 1: "if you\'re a member of the centre, it\'s seventy".' },
    { id: 9, type: 'fill', text: 'Also bring: a ______', answers: ['notebook'], evidence: 'Part 1: "You\'ll also need a notebook."' },
    { id: 10, type: 'fill', text: 'Payment: in cash at ______', answers: ['reception'], evidence: 'Part 1: "I\'ll pay at reception".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'Edward Hartley created the gardens because he', options: ['wanted to open a school.', 'believed plants helped his patients.', 'needed food for the town.', 'was a professional gardener.'], answer: 1, evidence: 'Part 2: he "believed that fresh air and plants were good for his patients".' },
    { id: 12, type: 'mcq', text: 'The gardens were restored by', options: ['the local council.', 'Hartley’s family.', 'a group of local residents.', 'a national charity.'], answer: 2, evidence: 'Part 2: "a group of local residents raised the money to save them".' },
    { id: 13, type: 'mcq', text: 'How long does the full circular walk take?', options: ['About 30 minutes', 'About an hour', 'About an hour and a half', 'About two hours'], answer: 2, evidence: 'Part 2: "it takes about an hour and a half".' },
    { id: 14, type: 'mcq', text: 'Why should visitors not feed the ducks?', options: ['The ducks are protected.', 'Bread is bad for them.', 'It attracts rats.', 'The lake is closed.'], answer: 1, evidence: 'Part 2: "bread is actually bad for them".' },
    { id: 15, type: 'mcq', text: 'The Sensory Garden was designed for people who', options: ['have young children.', 'cannot walk far.', 'have poor eyesight.', 'want to learn about medicine.'], answer: 2, evidence: 'Part 2: "designed for visitors with poor eyesight".' },
    { id: 16, type: 'fill', text: 'The Rose Garden is at its best in ______.', answers: ['june'], evidence: 'Part 2: "It\'s at its best in June".' },
    { id: 17, type: 'fill', text: 'The café is in the old ______ building.', answers: ['stable'], evidence: 'Part 2: "The café is in the old stable building".' },
    { id: 18, type: 'fill', text: 'Volunteers wear ______ jackets.', answers: ['green'], evidence: 'Part 2: "our volunteers are wearing green jackets".' },
    { id: 19, type: 'fill', text: 'The afternoon talk is about growing ______ in small spaces.', answers: ['vegetables'], evidence: 'Part 2: "growing vegetables in small spaces".' },
    { id: 20, type: 'fill', text: 'Tickets for the talk are at the information ______.', answers: ['desk'], evidence: 'Part 2: "collect a ticket from the information desk".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'Why does Daniel think the trial results should be treated with care?', options: ['The trial was too short.', 'The companies chose to take part.', 'Only large companies took part.', 'The results were not published.'], answer: 1, evidence: 'Part 3: "The companies chose to take part, so they were probably more enthusiastic".' },
    { id: 22, type: 'mcq', text: 'What surprised Daniel about the trial?', options: ['Productivity did not fall.', 'Staff worked longer days.', 'Most companies stopped the trial.', 'Meetings became longer.'], answer: 0, evidence: 'Part 3: "productivity didn\'t fall in most of the companies".' },
    { id: 23, type: 'mcq', text: 'According to Emma, how did companies save time?', options: ['By hiring more staff', 'By working at weekends', 'By cutting long meetings', 'By using new software'], answer: 2, evidence: 'Part 3: "people cut down on long meetings and wasted time".' },
    { id: 24, type: 'mcq', text: 'What is Daniel’s concern about the results on stress and sleep?', options: ['They were collected too late.', 'They came from questionnaires.', 'Only managers were asked.', 'They contradict other studies.'], answer: 1, evidence: 'Part 3: "those results came from questionnaires, so they depend on what people said".' },
    { id: 25, type: 'mcq', text: 'What did the tutor ask for?', options: ['A longer presentation', 'More written slides', 'More charts and fewer word slides', 'A printed handout'], answer: 2, evidence: 'Part 3: "fewer slides with words and more charts".' },
    { id: 26, type: 'mcq', text: 'Where will they practise?', options: ['In the library', 'In a study room', 'In an empty classroom', 'At Emma’s house'], answer: 2, evidence: 'Part 3: "Let\'s use the empty classroom on the second floor instead."' },
    { id: 27, type: 'mcq', text: 'Background and history of working hours', options: ['Emma', 'Daniel'], answer: 0, evidence: 'Part 3: Emma: "I\'d be happy to do the background and the history".' },
    { id: 28, type: 'mcq', text: 'Results of the trial', options: ['Emma', 'Daniel'], answer: 1, evidence: 'Part 3: Daniel: "Then I\'ll take the results of the trial."' },
    { id: 29, type: 'mcq', text: 'Charts', options: ['Emma', 'Daniel'], answer: 1, evidence: 'Part 3: Daniel: "I can make the charts."' },
    { id: 30, type: 'mcq', text: 'Short video clip', options: ['Emma', 'Daniel'], answer: 0, evidence: 'Part 3: Emma: "I\'ll find a short video clip".' },
    // Part 4
    { id: 31, type: 'fill', text: 'Karl von Frisch was from ______.', answers: ['austria'], evidence: 'Part 4: "the Austrian scientist Karl von Frisch".' },
    { id: 32, type: 'fill', text: 'He later received a ______ Prize.', answers: ['nobel'], evidence: 'Part 4: "later received a Nobel Prize".' },
    { id: 33, type: 'fill', text: 'Round dance: tells bees that food is ______.', answers: ['nearby', 'close'], evidence: 'Part 4: "it simply tells the other bees that food is nearby".' },
    { id: 34, type: 'fill', text: 'Waggle dance: direction is shown in relation to the ______.', answers: ['sun'], evidence: 'Part 4: "the direction of the food in relation to the sun".' },
    { id: 35, type: 'fill', text: 'The length of the waggle shows the ______ to the food.', answers: ['distance'], evidence: 'Part 4: "the length of the waggle tells the other bees the distance they need to fly".' },
    { id: 36, type: 'fill', text: 'In the dark hive, bees get information through touch and ______.', answers: ['vibration'], evidence: 'Part 4: "through touch and vibration".' },
    { id: 37, type: 'fill', text: 'Bees also learn the ______ of the flowers.', answers: ['smell', 'scent'], evidence: 'Part 4: "They also learn the smell of the flowers".' },
    { id: 38, type: 'fill', text: 'Scientists later used ______ to track individual bees.', answers: ['radar'], evidence: 'Part 4: "researchers used radar to track individual bees".' },
    { id: 39, type: 'fill', text: 'One suggested cause of decline is the loss of wild ______.', answers: ['flowers'], evidence: 'Part 4: "the loss of wild flowers".' },
    { id: 40, type: 'fill', text: 'Next lecture: how bees choose a new ______.', answers: ['home'], evidence: 'Part 4: "how bees choose a new home".' },
  ],
};
