import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 6: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: 'Hello, Greenhill Library, Emma speaking. How can I help you?' },
  { speaker: 'B', text: "Hi. I'd like to join the library. I've just moved here, and I was told I could register by phone." },
  { speaker: 'A', text: "That's right. I can take your details now, and you'll collect your card when you first visit. What's your name?" },
  { speaker: 'B', text: "Jonathan Mercer. That's M, E, R, C, E, R." },
  { speaker: 'A', text: 'And your address?' },
  { speaker: 'B', text: 'Eighteen Orchard Close. The postcode is G H four, seven P T.' },
  { speaker: 'A', text: 'Thank you. And a contact number?' },
  { speaker: 'B', text: 'Oh seven seven three eight, two two nine, four one five.' },
  { speaker: 'A', text: 'Lovely. Now, membership is free for adults, but if you want to borrow films, there’s a charge of one pound fifty per film for a week.' },
  { speaker: 'B', text: "That's fine. How many books can I borrow at once?" },
  { speaker: 'A', text: 'Up to twelve, for three weeks. You can renew them online twice, unless someone else has reserved them.' },
  { speaker: 'B', text: 'And are there any fines if I bring them back late?' },
  { speaker: 'A', text: "Not any more. The council stopped fines last year, but you can't borrow anything new until the late items are returned." },
  { speaker: 'B', text: 'Good to know. Do you have computers I can use? I need to print some documents for work.' },
  { speaker: 'A', text: 'Yes, computer use is free for an hour a day. Printing costs ten pence a page in black and white.' },
  { speaker: 'B', text: 'And when are you open?' },
  { speaker: 'A', text: "Nine till seven on weekdays, except Wednesday, when we close at one. On Saturdays it's ten till four, and we're closed on Sundays." },
  { speaker: 'B', text: 'Do you run any groups? My son is six, and he loves stories.' },
  { speaker: 'A', text: "There's a storytelling session for children every Saturday morning at half past ten. You don't need to book." },
  { speaker: 'B', text: "Perfect. One last thing: what do I need to bring to collect my card?" },
  { speaker: 'A', text: 'Just something with your address on it, such as a recent bill.' },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good evening, and welcome to this information session about the Riverside Community Garden. I'm Paul, and I chair the garden committee." },
  { speaker: 'B', text: 'The garden was set up eight years ago on land that used to be a car park. The council agreed to rent it to us for a very small amount, on condition that it stays open to the public during the day.' },
  { speaker: 'B', text: 'At the moment we have forty-five individual plots, which members rent for twenty pounds a year. There is a waiting list, I’m afraid, and it usually takes about a year to get a plot. However, you don’t need your own plot to get involved: anyone can help in the shared areas.' },
  { speaker: 'B', text: 'The shared areas include the fruit trees near the entrance, the herb garden next to the shed, and the pond at the far end, which we created three years ago to attract wildlife. It has been very successful, and we now regularly see frogs and dragonflies.' },
  { speaker: 'B', text: 'We have a few rules. Most importantly, no chemicals of any kind are used in the garden. We also ask members to collect rainwater rather than using the tap, which is only for emergencies in very dry weather.' },
  { speaker: 'B', text: 'Every Sunday morning there is a group work session from nine until twelve. Tools are provided, but please bring your own gloves. Afterwards, we usually share a pot of tea and whatever cake someone has baked.' },
  { speaker: 'B', text: 'Finally, our biggest event of the year is the harvest festival in September, when we sell surplus produce. All the money raised goes towards buying seeds and repairing equipment.' },
];

const PART3: L[] = [
  { speaker: 'C', text: "Hi, Mia here. Is now a good time to talk about our assignment on urban birds, Jack?" },
  { speaker: 'D', text: "Yes, fine. I've been looking at the data we collected in the park. We counted birds at the same four places every morning for two weeks." },
  { speaker: 'C', text: 'And what did you find?' },
  { speaker: 'D', text: 'The biggest numbers were always near the café. Which makes sense, because people drop food there.' },
  { speaker: 'C', text: "Did we see more species near the café too?" },
  { speaker: 'D', text: "No, actually. The greatest variety was by the old hedge on the north side, even though the total numbers were lower there." },
  { speaker: 'C', text: "That's interesting. I suppose the hedge gives them shelter and insects to eat." },
  { speaker: 'D', text: 'Probably. One thing that worries me is the weather. It rained on three of the mornings, and we saw far fewer birds on those days.' },
  { speaker: 'C', text: "We should just mention that in the discussion. We can't change it now." },
  { speaker: 'D', text: "Agreed. Now, Dr Patel said our first draft was too descriptive. She wants more analysis." },
  { speaker: 'C', text: 'I think we should compare our results with a published study. I found one from another city that used almost the same method.' },
  { speaker: 'D', text: 'Great. That will help. What about the graphs? Mine were a bit messy.' },
  { speaker: 'C', text: "I'll redo them. I've got a better program for that. Could you rewrite the introduction? It needs to explain why urban birds matter." },
  { speaker: 'D', text: "Sure. And I'll update the reference list. Some of the references are in the wrong format." },
  { speaker: 'C', text: 'Thanks. I can write the comparison with the other study, since I found it.' },
  { speaker: 'D', text: "Fine. Let's meet on Thursday to put it all together. The deadline is next Monday." },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good morning. In today's lecture we're going to look at the history of glass windows, and how they changed the way people lived." },
  { speaker: 'A', text: 'Glass itself has been made for more than four thousand years, but for most of that time it was used for beads and small containers. The Romans were among the first to put glass in windows, but their glass was thick and cloudy, and it was used mainly in public baths and wealthy homes.' },
  { speaker: 'A', text: 'For centuries afterwards, ordinary houses had no glass at all. Windows were simply openings covered with wooden shutters, cloth or animal skin. As a result, homes were dark, and people had to choose between light and warmth.' },
  { speaker: 'A', text: 'In medieval Europe, glass was so expensive that wealthy families sometimes took their windows with them when they moved from one house to another. Churches were an exception: they used coloured glass to tell stories from the Bible to people who could not read.' },
  { speaker: 'A', text: 'Things began to change in the seventeenth century, when new methods made it possible to produce larger and clearer sheets of glass. However, in England, a tax on windows was introduced in 1696. Some owners bricked up their windows to avoid paying it, and you can still see these blocked windows on old buildings today.' },
  { speaker: 'A', text: 'The tax was abolished in 1851, partly because doctors argued that dark, airless homes were bad for health. In the same year, the Crystal Palace was built in London for a great exhibition. It was made almost entirely of glass and iron, and it showed what the new materials could do.' },
  { speaker: 'A', text: 'The modern method of making flat glass, by floating it on a bed of melted tin, was developed in the 1950s. It made large windows cheap, and it is still used today. Next week, we will consider how architects are now designing windows that save energy.' },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull6: ListeningTest = {
  id: 'listening-full-6',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 6',
  minutes: 35,
  names: { A: 'Emma', B: 'Jonathan / Paul', C: 'Mia', D: 'Jack' },
  context: '4 qism: 1) kutubxonaga a’zo bo‘lish (telefon); 2) jamoat bog‘i haqida ma’lumot; 3) ikki talabaning shahar qushlari haqidagi tadqiqoti; 4) deraza oynasi tarixi haqida ma’ruza.',
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
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Mia or Jack.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Surname: ______', answers: ['mercer'], evidence: 'Part 1: "Jonathan Mercer. That\'s M, E, R, C, E, R."' },
    { id: 2, type: 'fill', text: 'Address: 18 ______ Close', answers: ['orchard'], evidence: 'Part 1: "Eighteen Orchard Close."' },
    { id: 3, type: 'fill', text: 'Cost of borrowing a film for a week: £______', answers: ['1.50', '1.5', 'one pound fifty'], evidence: 'Part 1: "one pound fifty per film for a week".' },
    { id: 4, type: 'fill', text: 'Maximum number of books: ______', answers: ['12', 'twelve'], evidence: 'Part 1: "Up to twelve, for three weeks."' },
    { id: 5, type: 'fill', text: 'Books can be renewed online ______ times', answers: ['2', 'two', 'twice'], evidence: 'Part 1: "You can renew them online twice".' },
    { id: 6, type: 'fill', text: 'Free computer use: one ______ a day', answers: ['hour'], evidence: 'Part 1: "computer use is free for an hour a day".' },
    { id: 7, type: 'fill', text: 'Black-and-white printing: ______p a page', answers: ['10', 'ten'], evidence: 'Part 1: "Printing costs ten pence a page".' },
    { id: 8, type: 'fill', text: 'Early closing day: ______', answers: ['wednesday'], evidence: 'Part 1: "except Wednesday, when we close at one".' },
    { id: 9, type: 'fill', text: 'Children’s storytelling: every ______ morning', answers: ['saturday'], evidence: 'Part 1: "every Saturday morning at half past ten".' },
    { id: 10, type: 'fill', text: 'To collect the card, bring proof of address, e.g. a recent ______', answers: ['bill'], evidence: 'Part 1: "such as a recent bill".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'What was the land used for before the garden?', options: ['A school', 'A car park', 'A farm', 'A factory'], answer: 1, evidence: 'Part 2: "on land that used to be a car park".' },
    { id: 12, type: 'mcq', text: 'What condition did the council set?', options: ['The garden must stay open to the public in the day.', 'Members must live nearby.', 'No buildings may be added.', 'The rent must rise each year.'], answer: 0, evidence: 'Part 2: "on condition that it stays open to the public during the day".' },
    { id: 13, type: 'mcq', text: 'How long does it usually take to get a plot?', options: ['A few weeks', 'Six months', 'About a year', 'Two years'], answer: 2, evidence: 'Part 2: "it usually takes about a year to get a plot".' },
    { id: 14, type: 'mcq', text: 'Why was the pond created?', options: ['To provide water for plants', 'For children to play', 'To attract wildlife', 'To keep fish'], answer: 2, evidence: 'Part 2: "the pond … which we created three years ago to attract wildlife".' },
    { id: 15, type: 'mcq', text: 'When may members use the tap?', options: ['Only in emergencies in very dry weather', 'Every Sunday morning', 'Whenever they need it', 'Only in the herb garden'], answer: 0, evidence: 'Part 2: "the tap, which is only for emergencies in very dry weather".' },
    { id: 16, type: 'fill', text: 'Plot rent: twenty pounds a ______.', answers: ['year'], evidence: 'Part 2: "members rent for twenty pounds a year".' },
    { id: 17, type: 'fill', text: 'The herb garden is next to the ______.', answers: ['shed'], evidence: 'Part 2: "the herb garden next to the shed".' },
    { id: 18, type: 'fill', text: 'No ______ of any kind may be used.', answers: ['chemicals'], evidence: 'Part 2: "no chemicals of any kind are used in the garden".' },
    { id: 19, type: 'fill', text: 'Volunteers should bring their own ______.', answers: ['gloves'], evidence: 'Part 2: "please bring your own gloves".' },
    { id: 20, type: 'fill', text: 'Festival money is spent on seeds and repairing ______.', answers: ['equipment'], evidence: 'Part 2: "buying seeds and repairing equipment".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'Where were the largest numbers of birds seen?', options: ['Near the café', 'By the old hedge', 'Near the pond'], answer: 0, evidence: 'Part 3: "The biggest numbers were always near the café."' },
    { id: 22, type: 'mcq', text: 'Where was the greatest variety of species?', options: ['Near the café', 'In the open grass', 'By the old hedge'], answer: 2, evidence: 'Part 3: "The greatest variety was by the old hedge on the north side".' },
    { id: 23, type: 'mcq', text: 'What problem does Jack mention with the data?', options: ['Some counts were lost.', 'It rained on some mornings.', 'They counted at different times.'], answer: 1, evidence: 'Part 3: "It rained on three of the mornings, and we saw far fewer birds".' },
    { id: 24, type: 'mcq', text: 'What do they decide to do about the weather problem?', options: ['Collect more data', 'Remove those days', 'Mention it in the discussion'], answer: 2, evidence: 'Part 3: "We should just mention that in the discussion."' },
    { id: 25, type: 'mcq', text: 'What did Dr Patel say about the first draft?', options: ['It was too descriptive.', 'It was too long.', 'It had too many graphs.'], answer: 0, evidence: 'Part 3: "our first draft was too descriptive. She wants more analysis."' },
    { id: 26, type: 'mcq', text: 'What does Mia suggest adding?', options: ['More interviews', 'A comparison with a published study', 'Photographs of the birds'], answer: 1, evidence: 'Part 3: "we should compare our results with a published study".' },
    { id: 27, type: 'mcq', text: 'Redoing the graphs', options: ['Mia', 'Jack'], answer: 0, evidence: 'Part 3: Mia: "I\'ll redo them."' },
    { id: 28, type: 'mcq', text: 'Rewriting the introduction', options: ['Mia', 'Jack'], answer: 1, evidence: 'Part 3: Mia: "Could you rewrite the introduction?" — Jack: "Sure."' },
    { id: 29, type: 'mcq', text: 'Updating the reference list', options: ['Mia', 'Jack'], answer: 1, evidence: 'Part 3: Jack: "I\'ll update the reference list."' },
    { id: 30, type: 'mcq', text: 'Writing the comparison with the other study', options: ['Mia', 'Jack'], answer: 0, evidence: 'Part 3: Mia: "I can write the comparison with the other study".' },
    // Part 4
    { id: 31, type: 'fill', text: 'Early glass was used mainly for beads and small ______.', answers: ['containers'], evidence: 'Part 4: "it was used for beads and small containers".' },
    { id: 32, type: 'fill', text: 'Roman window glass was thick and ______.', answers: ['cloudy'], evidence: 'Part 4: "their glass was thick and cloudy".' },
    { id: 33, type: 'fill', text: 'Ordinary windows were covered with wooden ______, cloth or skin.', answers: ['shutters'], evidence: 'Part 4: "covered with wooden shutters, cloth or animal skin".' },
    { id: 34, type: 'fill', text: 'People had to choose between light and ______.', answers: ['warmth'], evidence: 'Part 4: "people had to choose between light and warmth".' },
    { id: 35, type: 'fill', text: 'Wealthy families sometimes took their windows when they ______.', answers: ['moved'], evidence: 'Part 4: "took their windows with them when they moved".' },
    { id: 36, type: 'fill', text: 'Churches used coloured glass to tell ______ from the Bible.', answers: ['stories'], evidence: 'Part 4: "used coloured glass to tell stories from the Bible".' },
    { id: 37, type: 'fill', text: 'In 1696 England introduced a ______ on windows.', answers: ['tax'], evidence: 'Part 4: "a tax on windows was introduced in 1696".' },
    { id: 38, type: 'fill', text: 'Doctors argued that dark homes were bad for ______.', answers: ['health'], evidence: 'Part 4: "dark, airless homes were bad for health".' },
    { id: 39, type: 'fill', text: 'The Crystal Palace was made of glass and ______.', answers: ['iron'], evidence: 'Part 4: "made almost entirely of glass and iron".' },
    { id: 40, type: 'fill', text: 'Modern flat glass is floated on melted ______.', answers: ['tin'], evidence: 'Part 4: "by floating it on a bed of melted tin".' },
  ],
};
