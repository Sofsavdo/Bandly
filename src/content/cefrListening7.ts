import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 7: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'C', text: 'One. What time does the next train to Fergana leave?' },
  { speaker: 'B', text: 'At twelve forty, from platform four.' },
  { speaker: 'A', text: 'Two. Did you enjoy the concert?' },
  { speaker: 'D', text: "The music was great, but we were sitting right at the back, so we couldn't see much." },
  { speaker: 'D', text: 'Three. Could I have a coffee, please?' },
  { speaker: 'B', text: 'Small or large?' },
  { speaker: 'D', text: 'Large, with milk but no sugar.' },
  { speaker: 'B', text: 'Four. This is an announcement for all hotel guests. Breakfast this morning is served in the garden restaurant, as the main dining room is being painted.' },
  { speaker: 'A', text: 'Five. Why are you late?' },
  { speaker: 'C', text: 'Sorry, the bus broke down and I had to walk the last two kilometres.' },
  { speaker: 'C', text: "Six. I can't decide between the red phone case and the black one." },
  { speaker: 'A', text: "Get the red one. It'll be easier to find in your bag." },
  { speaker: 'D', text: 'Seven. Are you going on holiday this summer?' },
  { speaker: 'A', text: "We wanted to go to the seaside, but it's too expensive, so we're visiting my grandparents in the mountains." },
  { speaker: 'B', text: "Eight. Hello, I'd like to book a table for Friday evening." },
  { speaker: 'C', text: "I'm sorry, we're fully booked on Friday. We have tables on Saturday." },
  { speaker: 'B', text: "Saturday's fine." },
];

const P2: L[] = [
  { speaker: 'B', text: 'Welcome to the City Language Café. Every Tuesday evening, people meet here to practise foreign languages over tea. The meetings start at six thirty and finish at half past eight.' },
  { speaker: 'B', text: "Each table has a different language. At the moment we have tables for English, Russian, Korean and German. If you'd like to start a new table, please speak to one of the organisers." },
  { speaker: 'B', text: 'Entry is free, but we ask everyone to buy at least one drink from the café to support the owners, who let us use the room.' },
  { speaker: 'B', text: 'Every thirty minutes, a bell rings, and you can move to another table if you wish. This helps people practise more than one language and meet new people.' },
  { speaker: 'B', text: 'Once a month we organise a quiz night, with prizes such as books and cinema tickets. The next one is on the twenty-fifth of this month.' },
];

const P3: L[] = [
  { speaker: 'C', text: "Max, Mum and Dad's thirtieth wedding anniversary is next month. We need to decide on a present." },
  { speaker: 'D', text: 'I thought we could buy them a new television. Theirs is very old.' },
  { speaker: 'C', text: "They hardly watch TV. I think they'd prefer an experience, something they can do together." },
  { speaker: 'D', text: 'Like what?' },
  { speaker: 'C', text: "Maybe a weekend in a hotel in the mountains. Dad's always talking about how he used to go hiking when he was young." },
  { speaker: 'D', text: "That's a nice idea, but Mum doesn't like long car journeys." },
  { speaker: 'C', text: 'The hotel I found is near a train station, and the journey is only two hours.' },
  { speaker: 'D', text: 'OK. How much is it?' },
  { speaker: 'C', text: "About three hundred dollars for two nights, including meals. If we pay half each, it's not too bad." },
  { speaker: 'D', text: 'Fine. Should we tell them, or make it a surprise?' },
  { speaker: 'C', text: "A surprise, but we'll need to check that they're free that weekend. I'll ask Dad casually." },
  { speaker: 'D', text: "And I'll book the hotel once you've checked." },
];

const P4: L[] = [
  { speaker: 'A', text: 'My guest today is Hope, a wildlife photographer whose pictures of snow leopards have appeared in magazines around the world. Hope, how did you start?' },
  { speaker: 'C', text: 'My grandfather gave me his old camera when I was twelve. I started by photographing birds in our garden, and I never stopped.' },
  { speaker: 'A', text: 'Why snow leopards?' },
  { speaker: 'C', text: "They're one of the hardest animals to photograph. They live in remote mountains, they're very shy, and their colour helps them hide among the rocks. I liked the challenge." },
  { speaker: 'A', text: 'How long did it take to get your first good photo?' },
  { speaker: 'C', text: 'Almost three years. I spent weeks at a time in the mountains, often in temperatures of minus twenty.' },
  { speaker: 'A', text: 'How do you find them?' },
  { speaker: 'C', text: "Mostly with camera traps, which are cameras that take a picture automatically when an animal walks past. Local shepherds also tell me where they've seen tracks." },
  { speaker: 'A', text: 'Has your work helped protect the animals?' },
  { speaker: 'C', text: "I hope so. Some of my photos have been used by conservation groups to show people that snow leopards still live in their area. When people know they're there, they're more likely to protect them." },
  { speaker: 'A', text: 'What advice would you give young photographers?' },
  { speaker: 'C', text: 'Be patient, and respect the animals. No photo is worth disturbing them.' },
];

const P5: L[] = [
  { speaker: 'A', text: "Today's topic is the history of writing. The earliest known writing system developed in Mesopotamia, in what is now Iraq, more than five thousand years ago. It was used at first to record trade, such as how much grain or how many animals someone owned." },
  { speaker: 'A', text: 'Writing was made by pressing a sharp reed into wet clay tablets, which were then dried in the sun. Thousands of these tablets have survived, because dried clay lasts a very long time.' },
  { speaker: 'A', text: 'Early writing systems used hundreds of signs, so only professional scribes could read and write. The invention of the alphabet, in which each sign represents a sound, made reading and writing much easier to learn, because learners only needed to remember a small number of letters.' },
  { speaker: 'A', text: 'In Central Asia, many different scripts have been used over the centuries. The Uzbek language itself has been written in Arabic, Latin and Cyrillic scripts within the last hundred years.' },
  { speaker: 'A', text: "Next week we'll look at the invention of printing and how it spread knowledge." },
];

export const cefrListening7: ListeningTest = {
  id: 'cefr-listening-7',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 7',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) til kafesi haqida e’lon; 3) ota-onaga sovg‘a tanlash; 4) yovvoyi tabiat fotografi bilan intervyu; 5) yozuv tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'When does the next train to Fergana leave?', options: ['At 12.14', 'At 12.40', 'At 4.12'], answer: 1, evidence: 'Part 1, 1: "At twelve forty, from platform four."' },
    { id: 2, type: 'mcq', text: 'What was the problem at the concert?', options: ['The music was too loud.', 'It started late.', 'They could not see much.'], answer: 2, evidence: 'Part 1, 2: "we were sitting right at the back, so we couldn\'t see much".' },
    { id: 3, type: 'mcq', text: 'What does the man order?', options: ['A large coffee with milk', 'A small coffee with sugar', 'A large black coffee'], answer: 0, evidence: 'Part 1, 3: "Large, with milk but no sugar."' },
    { id: 4, type: 'mcq', text: 'Where is breakfast served this morning?', options: ['In the main dining room', 'In the garden restaurant', 'In the guests’ rooms'], answer: 1, evidence: 'Part 1, 4: "Breakfast this morning is served in the garden restaurant".' },
    { id: 5, type: 'mcq', text: 'Why is the woman late?', options: ['She overslept.', 'She missed the bus.', 'The bus broke down.'], answer: 2, evidence: 'Part 1, 5: "the bus broke down".' },
    { id: 6, type: 'mcq', text: 'Which phone case does her friend recommend?', options: ['The red one', 'The black one', 'Neither'], answer: 0, evidence: 'Part 1, 6: "Get the red one."' },
    { id: 7, type: 'mcq', text: 'Where is the woman going this summer?', options: ['To the seaside', 'To her grandparents in the mountains', 'Abroad'], answer: 1, evidence: 'Part 1, 7: "we\'re visiting my grandparents in the mountains".' },
    { id: 8, type: 'mcq', text: 'When will the man eat at the restaurant?', options: ['On Friday', 'On Sunday', 'On Saturday'], answer: 2, evidence: 'Part 1, 8: "Saturday\'s fine."' },
    { id: 9, type: 'fill', text: 'Meetings: every ______ evening', answers: ['tuesday'], evidence: 'Part 2: "Every Tuesday evening, people meet here".' },
    { id: 10, type: 'fill', text: 'Number of language tables at the moment: ______', answers: ['4', 'four'], evidence: 'Part 2: "tables for English, Russian, Korean and German".' },
    { id: 11, type: 'fill', text: 'To start a new table, speak to an ______', answers: ['organiser', 'organizer'], evidence: 'Part 2: "please speak to one of the organisers".' },
    { id: 12, type: 'fill', text: 'Everyone should buy at least one ______', answers: ['drink'], evidence: 'Part 2: "buy at least one drink from the café".' },
    { id: 13, type: 'fill', text: 'A bell rings every ______ minutes', answers: ['30', 'thirty'], evidence: 'Part 2: "Every thirty minutes, a bell rings".' },
    { id: 14, type: 'fill', text: 'Next quiz night: the ______ of this month', answers: ['25th', '25', 'twenty-fifth'], evidence: 'Part 2: "The next one is on the twenty-fifth of this month."' },
    { id: 15, type: 'mcq', text: 'What does Max suggest first?', options: ['A new television', 'A holiday abroad', 'A dinner'], answer: 0, evidence: 'Part 3: "I thought we could buy them a new television."' },
    { id: 16, type: 'mcq', text: 'Why does Hope disagree?', options: ['A TV is too expensive.', 'Their parents hardly watch TV.', 'They already bought one.'], answer: 1, evidence: 'Part 3: "They hardly watch TV."' },
    { id: 17, type: 'mcq', text: 'Why does Hope think the mountains are a good idea?', options: ['Their mother loves the mountains.', 'It is cheap there.', 'Their father used to go hiking.'], answer: 2, evidence: 'Part 3: "Dad\'s always talking about how he used to go hiking".' },
    { id: 18, type: 'mcq', text: 'What is Max worried about?', options: ['Their mother doesn’t like long car journeys.', 'The hotel is full.', 'The weather in the mountains.'], answer: 0, evidence: 'Part 3: "Mum doesn\'t like long car journeys".' },
    { id: 19, type: 'mcq', text: 'How will they pay for the present?', options: ['Max will pay for it all.', 'They will pay half each.', 'Their relatives will help.'], answer: 1, evidence: 'Part 3: "If we pay half each, it\'s not too bad."' },
    { id: 20, type: 'mcq', text: 'What will Hope do?', options: ['Book the hotel', 'Buy train tickets', 'Check that their parents are free'], answer: 2, evidence: 'Part 3: "we\'ll need to check that they\'re free that weekend. I\'ll ask Dad casually."' },
    { id: 21, type: 'mcq', text: 'How did Hope start photography?', options: ['She took a course at school.', 'Her grandfather gave her a camera.', 'She worked for a magazine.'], answer: 1, evidence: 'Part 4: "My grandfather gave me his old camera when I was twelve."' },
    { id: 22, type: 'mcq', text: 'What did she photograph first?', options: ['Birds in the garden', 'Mountains', 'Her family'], answer: 0, evidence: 'Part 4: "I started by photographing birds in our garden".' },
    { id: 23, type: 'mcq', text: 'Why did she choose snow leopards?', options: ['They are easy to find.', 'A magazine asked her to.', 'She liked the challenge.'], answer: 2, evidence: 'Part 4: "They\'re one of the hardest animals to photograph … I liked the challenge."' },
    { id: 24, type: 'mcq', text: 'How long did it take to get her first good photo?', options: ['Almost three years', 'About three months', 'One winter'], answer: 0, evidence: 'Part 4: "Almost three years."' },
    { id: 25, type: 'mcq', text: 'How does she mostly find the animals?', options: ['By following tracks herself', 'With camera traps', 'From a helicopter'], answer: 1, evidence: 'Part 4: "Mostly with camera traps".' },
    { id: 26, type: 'mcq', text: 'Who else helps her?', options: ['Park rangers', 'Other photographers', 'Local shepherds'], answer: 2, evidence: 'Part 4: "Local shepherds also tell me where they\'ve seen tracks."' },
    { id: 27, type: 'mcq', text: 'How have her photos been used?', options: ['To sell tourist trips', 'By conservation groups', 'In school books'], answer: 1, evidence: 'Part 4: "Some of my photos have been used by conservation groups".' },
    { id: 28, type: 'mcq', text: 'What is her advice to young photographers?', options: ['Be patient and respect the animals', 'Buy an expensive camera', 'Travel as much as possible'], answer: 0, evidence: 'Part 4: "Be patient, and respect the animals."' },
    { id: 29, type: 'fill', text: 'The earliest known writing developed in ______.', answers: ['mesopotamia'], evidence: 'Part 5: "The earliest known writing system developed in Mesopotamia".' },
    { id: 30, type: 'fill', text: 'Writing was first used to record ______.', answers: ['trade'], evidence: 'Part 5: "It was used at first to record trade".' },
    { id: 31, type: 'fill', text: 'Signs were pressed into wet ______ tablets.', answers: ['clay'], evidence: 'Part 5: "pressing a sharp reed into wet clay tablets".' },
    { id: 32, type: 'fill', text: 'The tablets were dried in the ______.', answers: ['sun'], evidence: 'Part 5: "which were then dried in the sun".' },
    { id: 33, type: 'fill', text: 'Only professional ______ could read and write.', answers: ['scribes'], evidence: 'Part 5: "only professional scribes could read and write".' },
    { id: 34, type: 'fill', text: 'In an alphabet, each sign represents a ______.', answers: ['sound'], evidence: 'Part 5: "in which each sign represents a sound".' },
    { id: 35, type: 'fill', text: 'Next week’s topic: the invention of ______.', answers: ['printing'], evidence: 'Part 5: "Next week we\'ll look at the invention of printing".' },
  ],
};
