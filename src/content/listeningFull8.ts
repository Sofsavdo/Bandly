import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 8: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: 'Hello, Lakeside Hotel, reception. Anna speaking.' },
  { speaker: 'B', text: "Good morning. I'm organising a small conference for my company, and I wanted to ask about your meeting rooms." },
  { speaker: 'A', text: "Of course. How many people are you expecting?" },
  { speaker: 'B', text: 'About thirty-five.' },
  { speaker: 'A', text: 'Then the Willow Room would be best. It holds up to forty people, and it has a view of the lake.' },
  { speaker: 'B', text: 'That sounds nice. We need it for one day, on the eighteenth of November.' },
  { speaker: 'A', text: "Let me check. Yes, it's available. The room costs three hundred and fifty pounds for the day, and that includes a projector and screen." },
  { speaker: 'B', text: 'Is there a microphone too?' },
  { speaker: 'A', text: "We can provide one, but there's an extra charge of twenty pounds." },
  { speaker: 'B', text: "OK, we'll need that. What about food?" },
  { speaker: 'A', text: "We offer two options for lunch: a buffet at eighteen pounds per person, or a sit-down meal at twenty-six." },
  { speaker: 'B', text: "The buffet, I think. People like to move around and talk. And coffee during the breaks?" },
  { speaker: 'A', text: "Coffee and tea are included in the room price, twice during the day. Biscuits too." },
  { speaker: 'B', text: 'Excellent. Is there parking for our guests?' },
  { speaker: 'A', text: "Yes, the car park is free for conference guests, but it's small, so I'd suggest people share cars or come by train. The station is only five minutes' walk away." },
  { speaker: 'B', text: "Good. Can I book it now?" },
  { speaker: 'A', text: "Certainly. Can I have your name and company?" },
  { speaker: 'B', text: "Richard Thornton, from Marlow Design. Thornton is T, H, O, R, N, T, O, N." },
  { speaker: 'A', text: "Thank you. We'll need a deposit of twenty per cent, and final numbers for lunch at least a week before the event." },
  { speaker: 'B', text: "That's fine. I'll send the deposit today." },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good evening, and thank you for coming to this meeting about the Millbrook Festival. I'm the festival director, and I'd like to tell you about this year's plans." },
  { speaker: 'B', text: "The festival will take place over three days, from Friday the fourteenth to Sunday the sixteenth of June. As in previous years, most events will be in the town park, but this year we're adding a second stage in the market square for local bands." },
  { speaker: 'B', text: "Last year we had complaints about noise late at night, so all music will now finish at ten thirty on Friday and Saturday, and at nine on Sunday. We hope this will keep our neighbours happy." },
  { speaker: 'B', text: "Tickets for the whole weekend cost thirty pounds for adults, but they're free for children under twelve. People who live in the town can get a twenty per cent discount if they show proof of address." },
  { speaker: 'B', text: "One of the most popular parts of the festival has always been the food area. This year, we've decided that all food sellers must use plates and cups that can be composted. We're also providing free drinking water stations, so please bring a bottle." },
  { speaker: 'B', text: "We need around a hundred volunteers to help with things like setting up, giving directions and collecting rubbish. Volunteers get a free weekend ticket and a T-shirt. You can sign up at the library or on our website." },
  { speaker: 'B', text: "Finally, a word about transport. There will be no parking in the park itself. Extra buses will run from the station every twenty minutes, and there's free bike parking at the main gate." },
];

const PART3: L[] = [
  { speaker: 'C', text: "Ben, I've just read your draft of the essay on online learning. It's good, but there are a couple of things I'd change." },
  { speaker: 'D', text: 'Go on, Olivia. I was hoping you would say that.' },
  { speaker: 'C', text: "Well, your introduction is very long. You spend almost a page on the history of distance learning before you get to the actual question." },
  { speaker: 'D', text: "That's fair. I'll cut it down. What about the main section?" },
  { speaker: 'C', text: "The argument is clear, but you rely mostly on one study. The tutor said we needed at least five sources." },
  { speaker: 'D', text: "I know. I found others, but they disagreed with my argument, so I left them out." },
  { speaker: 'C', text: "You should include them. It's stronger if you discuss the evidence on both sides and explain why you still reach your conclusion." },
  { speaker: 'D', text: "OK. What did you think of my conclusion?" },
  { speaker: 'C', text: "I liked the point about students needing better time management skills. But you introduce a completely new idea at the end, about teachers' training. That should be in the main section, or left out." },
  { speaker: 'D', text: "Right. I'll move it. Now, can I ask you about our group presentation? When should we meet?" },
  { speaker: 'C', text: "I'm busy on Tuesday and Wednesday. How about Thursday morning?" },
  { speaker: 'D', text: "Thursday's fine. Shall we divide the topics now?" },
  { speaker: 'C', text: 'Yes. I can talk about the advantages for working adults, because I interviewed some of them.' },
  { speaker: 'D', text: "Then I'll cover the problems with technology, like poor internet connections." },
  { speaker: 'C', text: "Who's going to make the slides?" },
  { speaker: 'D', text: "I'll do them. You did them last time." },
  { speaker: 'C', text: "Thanks. And I'll write the questions for the audience at the end." },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good morning. Today's lecture is about volcanoes, and in particular about how scientists try to predict eruptions." },
  { speaker: 'A', text: 'There are around one thousand five hundred potentially active volcanoes on land, and many millions of people live close to them. The soil near volcanoes is often very fertile, which is one reason why people choose to farm there, despite the risks.' },
  { speaker: 'A', text: 'Before an eruption, magma, which is melted rock, rises towards the surface. As it moves, it causes small earthquakes. Scientists use instruments called seismometers to record these, and a sudden increase in their number is one of the most important warning signs.' },
  { speaker: 'A', text: 'The rising magma can also make the ground change shape. The side of a volcano may swell by several centimetres or even metres. This can be measured very accurately today using satellites, which can detect tiny movements from space.' },
  { speaker: 'A', text: 'Another warning sign is a change in the gases coming out of the volcano. Scientists collect samples and measure the amount of sulphur dioxide, which often increases as magma gets closer to the surface.' },
  { speaker: 'A', text: 'Despite all these methods, predicting the exact time of an eruption remains very difficult. Some volcanoes show signs of activity for years without erupting, while others erupt with very little warning. False alarms are also a problem: if people are evacuated too often for nothing, they may refuse to leave when a real eruption comes.' },
  { speaker: 'A', text: 'For this reason, communication is just as important as science. Successful warning systems involve local communities, explain the risks clearly and practise evacuation routes regularly. In our next lecture we will look at a case study where this approach saved thousands of lives.' },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull8: ListeningTest = {
  id: 'listening-full-8',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 8',
  minutes: 35,
  names: { A: 'Anna', B: 'Richard / Director', C: 'Olivia', D: 'Ben' },
  context: '4 qism: 1) mehmonxonada konferensiya xonasini band qilish (telefon); 2) shahar festivali rejalari; 3) ikki talabaning insho va taqdimot muhokamasi; 4) vulqon otilishini bashorat qilish haqida ma’ruza.',
  script: SCRIPT,
  sections: [
    { at: 0, title: 'Part 1 — Questions 1–10' },
    { at: PART1.length, title: 'Part 2 — Questions 11–20' },
    { at: PART1.length + PART2.length, title: 'Part 3 — Questions 21–30' },
    { at: PART1.length + PART2.length + PART3.length, title: 'Part 4 — Questions 31–40' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–10: Complete the booking notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    { instruction: 'Part 2 — Questions 11–15: Choose the correct letter.', questionIds: [11, 12, 13, 14, 15] },
    { instruction: 'Part 2 — Questions 16–20: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [16, 17, 18, 19, 20] },
    { instruction: 'Part 3 — Questions 21–26: Choose the correct letter.', questionIds: [21, 22, 23, 24, 25, 26] },
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Olivia or Ben.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Number of people: about ______', answers: ['35', 'thirty-five'], evidence: 'Part 1: "About thirty-five."' },
    { id: 2, type: 'fill', text: 'Room: the ______ Room', answers: ['willow'], evidence: 'Part 1: "the Willow Room would be best".' },
    { id: 3, type: 'fill', text: 'Date: 18 ______', answers: ['november'], evidence: 'Part 1: "on the eighteenth of November".' },
    { id: 4, type: 'fill', text: 'Room price for the day: £______', answers: ['350', 'three hundred and fifty'], evidence: 'Part 1: "The room costs three hundred and fifty pounds for the day".' },
    { id: 5, type: 'fill', text: 'Extra equipment: a ______ (£20)', answers: ['microphone'], evidence: 'Part 1: "Is there a microphone too?" — "an extra charge of twenty pounds".' },
    { id: 6, type: 'fill', text: 'Lunch: ______ at £18 per person', answers: ['buffet'], evidence: 'Part 1: "a buffet at eighteen pounds per person" — "The buffet, I think."' },
    { id: 7, type: 'fill', text: 'The station is ______ minutes’ walk away', answers: ['5', 'five'], evidence: 'Part 1: "The station is only five minutes\' walk away."' },
    { id: 8, type: 'fill', text: 'Contact surname: ______', answers: ['thornton'], evidence: 'Part 1: "Thornton is T, H, O, R, N, T, O, N."' },
    { id: 9, type: 'fill', text: 'Deposit: ______ per cent', answers: ['20', 'twenty'], evidence: 'Part 1: "a deposit of twenty per cent".' },
    { id: 10, type: 'fill', text: 'Final lunch numbers: at least one ______ before', answers: ['week'], evidence: 'Part 1: "final numbers for lunch at least a week before the event".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'What is new at this year’s festival?', options: ['A stage for local bands in the market square', 'Events in the town park', 'A fourth day', 'A film programme'], answer: 0, evidence: 'Part 2: "we\'re adding a second stage in the market square for local bands".' },
    { id: 12, type: 'mcq', text: 'Why will music finish earlier?', options: ['To save money', 'Because of complaints about noise', 'Because of the weather', 'To allow cleaning'], answer: 1, evidence: 'Part 2: "Last year we had complaints about noise late at night".' },
    { id: 13, type: 'mcq', text: 'Who can get a twenty per cent discount?', options: ['Students', 'Families', 'People who live in the town', 'Volunteers'], answer: 2, evidence: 'Part 2: "People who live in the town can get a twenty per cent discount".' },
    { id: 14, type: 'mcq', text: 'What must food sellers do this year?', options: ['Sell only local food', 'Close by nine', 'Pay a higher fee', 'Use plates and cups that can be composted'], answer: 3, evidence: 'Part 2: "all food sellers must use plates and cups that can be composted".' },
    { id: 15, type: 'mcq', text: 'What do volunteers receive?', options: ['Free food', 'A weekend ticket and a T-shirt', 'Payment', 'Free parking'], answer: 1, evidence: 'Part 2: "Volunteers get a free weekend ticket and a T-shirt."' },
    { id: 16, type: 'fill', text: 'Sunday music finishes at ______ pm.', answers: ['9', 'nine'], evidence: 'Part 2: "and at nine on Sunday".' },
    { id: 17, type: 'fill', text: 'Weekend ticket for adults: £______', answers: ['30', 'thirty'], evidence: 'Part 2: "thirty pounds for adults".' },
    { id: 18, type: 'fill', text: 'Bring a ______ for the free water stations.', answers: ['bottle'], evidence: 'Part 2: "free drinking water stations, so please bring a bottle".' },
    { id: 19, type: 'fill', text: 'Extra buses run every ______ minutes.', answers: ['20', 'twenty'], evidence: 'Part 2: "Extra buses will run from the station every twenty minutes".' },
    { id: 20, type: 'fill', text: 'Free ______ parking at the main gate.', answers: ['bike', 'bicycle'], evidence: 'Part 2: "there\'s free bike parking at the main gate".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'What is the problem with Ben’s introduction?', options: ['It is too long.', 'It has no question.', 'It is too informal.'], answer: 0, evidence: 'Part 3: "your introduction is very long".' },
    { id: 22, type: 'mcq', text: 'Why did Ben leave out some sources?', options: ['He could not find them.', 'They were too old.', 'They disagreed with his argument.'], answer: 2, evidence: 'Part 3: "they disagreed with my argument, so I left them out".' },
    { id: 23, type: 'mcq', text: 'What does Olivia advise about these sources?', options: ['Ignore them', 'Discuss the evidence on both sides', 'Put them in an appendix'], answer: 1, evidence: 'Part 3: "It\'s stronger if you discuss the evidence on both sides".' },
    { id: 24, type: 'mcq', text: 'What is wrong with the conclusion?', options: ['It repeats the introduction.', 'It is too short.', 'It introduces a new idea.'], answer: 2, evidence: 'Part 3: "you introduce a completely new idea at the end".' },
    { id: 25, type: 'mcq', text: 'When will they meet?', options: ['Tuesday', 'Wednesday', 'Thursday morning'], answer: 2, evidence: 'Part 3: "How about Thursday morning?" — "Thursday\'s fine."' },
    { id: 26, type: 'mcq', text: 'Why will Olivia talk about working adults?', options: ['She interviewed some of them.', 'She is a working adult.', 'The tutor asked her to.'], answer: 0, evidence: 'Part 3: "because I interviewed some of them".' },
    { id: 27, type: 'mcq', text: 'Advantages for working adults', options: ['Olivia', 'Ben'], answer: 0, evidence: 'Part 3: Olivia: "I can talk about the advantages for working adults".' },
    { id: 28, type: 'mcq', text: 'Problems with technology', options: ['Olivia', 'Ben'], answer: 1, evidence: 'Part 3: Ben: "Then I\'ll cover the problems with technology".' },
    { id: 29, type: 'mcq', text: 'Making the slides', options: ['Olivia', 'Ben'], answer: 1, evidence: 'Part 3: Ben: "I\'ll do them. You did them last time."' },
    { id: 30, type: 'mcq', text: 'Questions for the audience', options: ['Olivia', 'Ben'], answer: 0, evidence: 'Part 3: Olivia: "I\'ll write the questions for the audience at the end."' },
    // Part 4
    { id: 31, type: 'fill', text: 'Soil near volcanoes is often very ______.', answers: ['fertile'], evidence: 'Part 4: "The soil near volcanoes is often very fertile".' },
    { id: 32, type: 'fill', text: 'Magma is melted ______.', answers: ['rock'], evidence: 'Part 4: "magma, which is melted rock".' },
    { id: 33, type: 'fill', text: 'Rising magma causes small ______.', answers: ['earthquakes'], evidence: 'Part 4: "it causes small earthquakes".' },
    { id: 34, type: 'fill', text: 'These are recorded by instruments called ______.', answers: ['seismometers'], evidence: 'Part 4: "instruments called seismometers".' },
    { id: 35, type: 'fill', text: 'The side of a volcano may ______ by centimetres or metres.', answers: ['swell'], evidence: 'Part 4: "The side of a volcano may swell".' },
    { id: 36, type: 'fill', text: 'Ground movement can be measured using ______.', answers: ['satellites'], evidence: 'Part 4: "measured very accurately today using satellites".' },
    { id: 37, type: 'fill', text: 'Scientists measure the amount of sulphur ______.', answers: ['dioxide'], evidence: 'Part 4: "the amount of sulphur dioxide".' },
    { id: 38, type: 'fill', text: 'Frequent false ______ may make people refuse to leave.', answers: ['alarms'], evidence: 'Part 4: "False alarms are also a problem".' },
    { id: 39, type: 'fill', text: 'Successful systems involve local ______.', answers: ['communities'], evidence: 'Part 4: "Successful warning systems involve local communities".' },
    { id: 40, type: 'fill', text: 'Evacuation ______ should be practised regularly.', answers: ['routes'], evidence: 'Part 4: "practise evacuation routes regularly".' },
  ],
};
