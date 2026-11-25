import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 10: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: "Hello, Westfield Home Removals, Madina speaking." },
  { speaker: 'B', text: "Hi. I'm moving house next month, and I'd like to get a price for the move." },
  { speaker: 'A', text: 'Of course. Where are you moving from and to?' },
  { speaker: 'B', text: "From a flat in the city centre to a house in Ashbury. It's about fifteen miles." },
  { speaker: 'A', text: 'And how big is the flat?' },
  { speaker: 'B', text: 'Two bedrooms. It’s on the third floor, and there’s no lift, unfortunately.' },
  { speaker: 'A', text: "That's important to know, because we'll need an extra person to help carry things down the stairs. What date are you moving?" },
  { speaker: 'B', text: 'The twenty-ninth of March. It’s a Friday.' },
  { speaker: 'A', text: "Fridays are busy, but we still have a van free that day. For a two-bedroom flat, the price would be four hundred and eighty pounds, including the extra person." },
  { speaker: 'B', text: "Does that include packing?" },
  { speaker: 'A', text: "No. We can pack everything for you for an extra hundred and fifty pounds, or we can deliver boxes so you can pack yourself. The boxes are free." },
  { speaker: 'B', text: "We'll pack ourselves, I think. Could you deliver the boxes a week before?" },
  { speaker: 'A', text: 'Certainly. How many would you like? For a flat your size, people usually need about thirty.' },
  { speaker: 'B', text: "Thirty sounds right. We've got a piano, though. Is that a problem?" },
  { speaker: 'A', text: "Not a problem, but there is an extra charge of sixty pounds, because it needs special equipment." },
  { speaker: 'B', text: "OK. And what about insurance?" },
  { speaker: 'A', text: "Everything is insured up to ten thousand pounds. Now, could I take your name, please?" },
  { speaker: 'B', text: "Yes, it's Luke Fairbairn. That's F, A, I, R, B, A, I, R, N." },
  { speaker: 'A', text: "Thank you. And the address of the new house?" },
  { speaker: 'B', text: 'Seven Elm Grove, Ashbury.' },
  { speaker: 'A', text: "Lovely. I'll email you the quote today. If you're happy with it, we'll need a deposit of fifty pounds to hold the date." },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good morning, and welcome to Hilltop Farm Park. My name is George, and I look after the visitor programme here. I'd like to give you a quick overview before you set off." },
  { speaker: 'B', text: "The farm has been in the same family for five generations. Twenty years ago, prices for milk fell so low that the family decided to open the farm to the public. Today, visitors make up about half of the farm's income." },
  { speaker: 'B', text: "Let me tell you about the main areas. Straight ahead is the animal barn, where you can see our cows, sheep and goats. At eleven o'clock and three o'clock, you can help to feed the baby animals. Please wash your hands at the sinks by the exit afterwards." },
  { speaker: 'B', text: "To the left of the barn is the play area for children under ten. Beyond that is the maze, which is made from tall maize plants. It's new this year, and it takes most families about half an hour to find the way out." },
  { speaker: 'B', text: "If you'd like to see more of the farm, a tractor ride leaves from the car park every hour. It goes around the edge of the fields and down to the river. It’s included in your ticket, but places are limited, so get there early." },
  { speaker: 'B', text: "Our farm shop sells meat, cheese and vegetables produced here, and our café uses the same produce. I can strongly recommend the homemade ice cream, which is made with our own milk." },
  { speaker: 'B', text: "Finally, please keep dogs on a lead at all times, and remember that they're not allowed in the animal barn. Thank you, and enjoy your day." },
];

const PART3: L[] = [
  { speaker: 'C', text: "Hi, Daniel. Have you got a minute to talk about our report on the town's recycling?" },
  { speaker: 'D', text: "Sure, Sarah. I've just finished going through the figures from the council." },
  { speaker: 'C', text: 'What do they show?' },
  { speaker: 'D', text: "Recycling rates went up quite a lot when the council introduced separate bins for food waste. But they've stayed about the same for the last three years." },
  { speaker: 'C', text: "So something else is needed now. Did the council say why?" },
  { speaker: 'D', text: "They think a lot of people are still confused about which plastics can be recycled. Many items go in the wrong bin, and then a whole load has to be thrown away." },
  { speaker: 'C', text: "That matches what people said in our interviews. Several said the instructions on the bins are too complicated." },
  { speaker: 'D', text: "So one recommendation could be clearer labels, with pictures instead of long lists." },
  { speaker: 'C', text: "Yes. And what about flats? The figures for flats are much lower than for houses." },
  { speaker: 'D', text: "That's mainly because of space. People in flats don't have room for several bins, and the shared bins are often a long way from the building." },
  { speaker: 'C', text: "We should include that. Now, how are we going to organise the report?" },
  { speaker: 'D', text: "I'll write the section on the council's figures, since I've been working on them." },
  { speaker: 'C', text: "And I'll do the section on the interviews." },
  { speaker: 'D', text: "Who should write the recommendations?" },
  { speaker: 'C', text: "Let's write them together. It's the most important part." },
  { speaker: 'D', text: "Good idea. And could you check the whole report at the end? You're better at spotting mistakes than me." },
  { speaker: 'C', text: "Fine. And you can make the charts." },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good morning. Today we're going to look at the science of memory, and in particular at why we forget things." },
  { speaker: 'A', text: "In the late nineteenth century, a German psychologist, Hermann Ebbinghaus, carried out a famous series of experiments on himself. He learned lists of nonsense syllables, such as 'dax' and 'bok', and tested how many he could remember after different periods of time." },
  { speaker: 'A', text: "He found that forgetting happens very quickly at first. Within an hour, he had forgotten more than half of what he had learned. After that, the rate of forgetting slowed down. This pattern is now known as the forgetting curve." },
  { speaker: 'A', text: "Ebbinghaus also discovered that reviewing material at increasing intervals makes it much easier to remember. This idea, known as spaced repetition, is used today in many language-learning apps." },
  { speaker: 'A', text: "Another important finding is that we remember information better when we test ourselves than when we simply read it again. Researchers call this the testing effect. Students often prefer rereading, because it feels easier, but it is much less effective." },
  { speaker: 'A', text: "Sleep also plays a key role. During deep sleep, the brain appears to replay and strengthen the memories formed during the day. Students who stay up all night before an exam may therefore remember less, not more." },
  { speaker: 'A', text: "Finally, emotion affects memory. Events that make us feel strong emotions, whether happy or frightening, are usually remembered more clearly. However, these memories are not always accurate, even when we feel very confident about them. In the next lecture we will discuss how this affects witnesses in court." },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull10: ListeningTest = {
  id: 'listening-full-10',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 10',
  minutes: 35,
  names: { A: 'Madina', B: 'Luke / George', C: 'Sarah', D: 'Daniel' },
  context: '4 qism: 1) uy ko‘chirish xizmatiga buyurtma (telefon); 2) ferma bog‘iga tashrif haqida ma’lumot; 3) ikki talabaning chiqindilarni qayta ishlash haqidagi hisoboti; 4) xotira va unutish ilmi haqida ma’ruza.',
  script: SCRIPT,
  sections: [
    { at: 0, title: 'Part 1 — Questions 1–10' },
    { at: PART1.length, title: 'Part 2 — Questions 11–20' },
    { at: PART1.length + PART2.length, title: 'Part 3 — Questions 21–30' },
    { at: PART1.length + PART2.length + PART3.length, title: 'Part 4 — Questions 31–40' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–10: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { instruction: 'Part 2 — Questions 11–15: Choose the correct letter.', questionIds: [11, 12, 13, 14, 15] },
    { instruction: 'Part 2 — Questions 16–20: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [16, 17, 18, 19, 20] },
    { instruction: 'Part 3 — Questions 21–26: Choose the correct letter.', questionIds: [21, 22, 23, 24, 25, 26] },
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose A (Sarah), B (Daniel) or C (both).', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Moving to a house in ______', answers: ['ashbury'], evidence: 'Part 1: "to a house in Ashbury".' },
    { id: 2, type: 'fill', text: 'Flat is on floor number ______ (no lift)', answers: ['3', 'three', 'third'], evidence: 'Part 1: "It’s on the third floor, and there’s no lift".' },
    { id: 3, type: 'fill', text: 'Moving date: 29 ______', answers: ['march'], evidence: 'Part 1: "The twenty-ninth of March."' },
    { id: 4, type: 'fill', text: 'Price of the move: £______', answers: ['480', 'four hundred and eighty'], evidence: 'Part 1: "four hundred and eighty pounds, including the extra person".' },
    { id: 5, type: 'fill', text: 'Boxes needed: about ______', answers: ['30', 'thirty'], evidence: 'Part 1: "people usually need about thirty" — "Thirty sounds right."' },
    { id: 6, type: 'fill', text: 'Boxes delivered one ______ before the move', answers: ['week'], evidence: 'Part 1: "Could you deliver the boxes a week before?"' },
    { id: 7, type: 'fill', text: 'Extra charge for moving the ______: £60', answers: ['piano'], evidence: 'Part 1: "We\'ve got a piano" — "an extra charge of sixty pounds".' },
    { id: 8, type: 'fill', text: 'Surname: ______', answers: ['fairbairn'], evidence: 'Part 1: "Luke Fairbairn. That\'s F, A, I, R, B, A, I, R, N."' },
    { id: 9, type: 'fill', text: 'New address: 7 ______ Grove', answers: ['elm'], evidence: 'Part 1: "Seven Elm Grove, Ashbury."' },
    { id: 10, type: 'fill', text: 'Deposit to hold the date: £______', answers: ['50', 'fifty'], evidence: 'Part 1: "a deposit of fifty pounds to hold the date".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'Why did the family open the farm to the public?', options: ['Milk prices fell very low.', 'The council asked them to.', 'They wanted to retire.', 'They had too many animals.'], answer: 0, evidence: 'Part 2: "prices for milk fell so low that the family decided to open the farm to the public".' },
    { id: 12, type: 'mcq', text: 'How much of the farm’s income comes from visitors?', options: ['About a quarter', 'About a third', 'About half', 'Most of it'], answer: 2, evidence: 'Part 2: "visitors make up about half of the farm\'s income".' },
    { id: 13, type: 'mcq', text: 'What is new this year?', options: ['The play area', 'The maze', 'The tractor ride', 'The café'], answer: 1, evidence: 'Part 2: "the maze … It\'s new this year".' },
    { id: 14, type: 'mcq', text: 'What is said about the tractor ride?', options: ['It costs extra.', 'It leaves from the barn.', 'It only runs in the morning.', 'Places are limited.'], answer: 3, evidence: 'Part 2: "It’s included in your ticket, but places are limited".' },
    { id: 15, type: 'mcq', text: 'Where are dogs NOT allowed?', options: ['In the animal barn', 'In the car park', 'In the café', 'In the maze'], answer: 0, evidence: 'Part 2: "they\'re not allowed in the animal barn".' },
    { id: 16, type: 'fill', text: 'The farm has belonged to the family for five ______.', answers: ['generations'], evidence: 'Part 2: "in the same family for five generations".' },
    { id: 17, type: 'fill', text: 'Visitors should wash their ______ after feeding the animals.', answers: ['hands'], evidence: 'Part 2: "Please wash your hands at the sinks by the exit afterwards."' },
    { id: 18, type: 'fill', text: 'The maze is made from tall ______ plants.', answers: ['maize'], evidence: 'Part 2: "made from tall maize plants".' },
    { id: 19, type: 'fill', text: 'The tractor ride goes down to the ______.', answers: ['river'], evidence: 'Part 2: "down to the river".' },
    { id: 20, type: 'fill', text: 'Recommended in the café: homemade ______.', answers: ['ice cream', 'icecream'], evidence: 'Part 2: "I can strongly recommend the homemade ice cream".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'What happened when separate food waste bins were introduced?', options: ['Recycling rates went up.', 'Recycling rates fell.', 'Nothing changed.'], answer: 0, evidence: 'Part 3: "Recycling rates went up quite a lot when the council introduced separate bins for food waste."' },
    { id: 22, type: 'mcq', text: 'What has happened in the last three years?', options: ['Rates have continued to rise.', 'Rates have stayed about the same.', 'Rates have fallen sharply.'], answer: 1, evidence: 'Part 3: "they\'ve stayed about the same for the last three years".' },
    { id: 23, type: 'mcq', text: 'According to the council, what is the main problem?', options: ['Bins are collected too rarely.', 'People are confused about plastics.', 'Recycling is too expensive.'], answer: 1, evidence: 'Part 3: "a lot of people are still confused about which plastics can be recycled".' },
    { id: 24, type: 'mcq', text: 'What do they recommend for the bins?', options: ['Clearer labels with pictures', 'Bigger bins', 'More frequent collections'], answer: 0, evidence: 'Part 3: "clearer labels, with pictures instead of long lists".' },
    { id: 25, type: 'mcq', text: 'Why are recycling rates lower in flats?', options: ['People in flats are younger.', 'Flats produce less waste.', 'There is little space for bins.'], answer: 2, evidence: 'Part 3: "That\'s mainly because of space."' },
    { id: 26, type: 'mcq', text: 'Which part of the report do they think is most important?', options: ['The figures', 'The interviews', 'The recommendations'], answer: 2, evidence: 'Part 3: "Let\'s write them together. It\'s the most important part."' },
    { id: 27, type: 'mcq', text: 'Section on the council’s figures', options: ['Sarah', 'Daniel', 'Both'], answer: 1, evidence: 'Part 3: Daniel: "I\'ll write the section on the council\'s figures".' },
    { id: 28, type: 'mcq', text: 'Section on the interviews', options: ['Sarah', 'Daniel', 'Both'], answer: 0, evidence: 'Part 3: Sarah: "And I\'ll do the section on the interviews."' },
    { id: 29, type: 'mcq', text: 'The recommendations', options: ['Sarah', 'Daniel', 'Both'], answer: 2, evidence: 'Part 3: "Let\'s write them together."' },
    { id: 30, type: 'mcq', text: 'Checking the whole report', options: ['Sarah', 'Daniel', 'Both'], answer: 0, evidence: 'Part 3: Daniel: "could you check the whole report at the end?" — Sarah: "Fine."' },
    // Part 4
    { id: 31, type: 'fill', text: 'Ebbinghaus carried out experiments on ______.', answers: ['himself'], evidence: 'Part 4: "carried out a famous series of experiments on himself".' },
    { id: 32, type: 'fill', text: 'He learned lists of ______ syllables.', answers: ['nonsense'], evidence: 'Part 4: "He learned lists of nonsense syllables".' },
    { id: 33, type: 'fill', text: 'Within an ______, he forgot more than half.', answers: ['hour'], evidence: 'Part 4: "Within an hour, he had forgotten more than half".' },
    { id: 34, type: 'fill', text: 'This pattern is called the forgetting ______.', answers: ['curve'], evidence: 'Part 4: "This pattern is now known as the forgetting curve."' },
    { id: 35, type: 'fill', text: 'Reviewing at increasing intervals is called ______ repetition.', answers: ['spaced'], evidence: 'Part 4: "This idea, known as spaced repetition".' },
    { id: 36, type: 'fill', text: 'Students often prefer ______, though it is less effective.', answers: ['rereading'], evidence: 'Part 4: "Students often prefer rereading, because it feels easier".' },
    { id: 37, type: 'fill', text: 'Memories are strengthened during deep ______.', answers: ['sleep'], evidence: 'Part 4: "During deep sleep, the brain appears to replay and strengthen the memories".' },
    { id: 38, type: 'fill', text: 'Staying up all night before an exam may mean remembering ______.', answers: ['less'], evidence: 'Part 4: "may therefore remember less, not more".' },
    { id: 39, type: 'fill', text: 'Events with strong ______ are remembered more clearly.', answers: ['emotions', 'emotion'], evidence: 'Part 4: "Events that make us feel strong emotions … are usually remembered more clearly."' },
    { id: 40, type: 'fill', text: 'Next lecture: how this affects ______ in court.', answers: ['witnesses'], evidence: 'Part 4: "how this affects witnesses in court".' },
  ],
};
