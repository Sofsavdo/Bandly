import type { ReadingTest } from './types';

// CEFR Multilevel uslubidagi Reading mashq testi 7: 35 savol, 60 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki tuzilish Sellzen'niki. Original mashq materiali; metodist tekshiruvini kutmoqda.
const T1 = [
  '1) NOTICE — University Library: During the exam period, the library will be open 24 hours a day from 1 to 20 June. Students must show their student card to enter after 10 pm. Food is not allowed in the reading rooms, but drinks in closed bottles are.',
  '2) MESSAGE — Mum, I’ve gone to Nodira’s house to study for tomorrow’s chemistry test. Her father will drive me home at about 9. I’ve eaten already, so you don’t need to keep dinner for me. My phone battery is low, so call Nodira if you need me. Laylo',
  '3) ADVERTISEMENT — Lost dog: small, brown, with a white spot on his back. He answers to the name “Bobik” and is very friendly. Last seen near the central market on Saturday morning. A reward is offered for any information.',
];

const T2 = [
  'Keeping pets has become more popular in many cities in recent years. Cats and dogs are the most common, but some people prefer birds, fish or even reptiles. For many owners, a pet is not just an animal but a member of the family.',
  'Research suggests that pets can be good for our health. Dog owners, for example, tend to walk more than people without dogs, and spending time with animals may lower stress. Pets can also be good company for people who live alone, especially older people.',
  'However, owning a pet is a serious responsibility. Animals need food, exercise and visits to the vet, which can be expensive. Animal charities say that some people buy pets without thinking carefully, and later give them away when they realise how much time and money they require. For this reason, charities advise people to consider adopting an animal from a shelter and to find out about its needs first.',
];

const T3 = [
  'A. The Olympic Games began in ancient Greece more than two and a half thousand years ago. They were held every four years at Olympia in honour of the god Zeus, and athletes came from many Greek cities to compete.',
  'B. The ancient Games included running, wrestling, boxing, horse and chariot races, and the pentathlon, which combined five different events. Winners did not receive gold medals; instead, they were given a crown made of olive leaves, although they were often richly rewarded when they returned home.',
  'C. The Games continued for more than a thousand years but finally came to an end in the late fourth century, when the Roman Empire, which by then ruled Greece, stopped supporting such traditional festivals.',
  'D. The modern Olympic Games were the idea of a French educator, Pierre de Coubertin, who believed that sport could encourage peace and understanding between nations. The first modern Games were held in Athens in 1896.',
  'E. Since then, the Games have grown enormously. Today thousands of athletes from more than two hundred countries take part, Winter Games have been added, and the Paralympic Games give athletes with disabilities the chance to compete at the highest level.',
  'F. Hosting the Games, however, has become extremely expensive. Some cities have spent huge sums on stadiums that are rarely used afterwards, and in recent years fewer cities have applied to host the event.',
];

const T4 = [
  'Around a third of all the food produced in the world is lost or wasted. Some is lost on farms and during transport, but in richer countries a large share is thrown away by shops, restaurants and households.',
  'At home, food is often wasted because people buy more than they need. Special offers encourage shoppers to buy large quantities, and food is then forgotten at the back of the fridge until it goes bad. Confusion about date labels also plays a part: many people throw away food that is still safe to eat.',
  'Wasting food is not only a waste of money. When food rots in landfill, it produces methane, a gas that contributes to climate change. In addition, all the water, land and energy used to grow and transport the food are wasted too.',
  'There are simple ways to reduce waste. Planning meals for the week, making a shopping list and storing food correctly can all help. Some supermarkets now sell “ugly” fruit and vegetables at lower prices, and apps allow restaurants to sell leftover food cheaply at the end of the day.',
];

const T5 = [
  'For much of history, nostalgia — a longing for the past — was regarded as a kind of illness. In the seventeenth century, a Swiss doctor described it as a condition affecting soldiers who were far from home, and for a long time afterwards it was associated with sadness and an inability to cope with the present.',
  'In recent decades, however, psychologists have begun to see nostalgia in a more positive light. Studies in which people are asked to recall a meaningful event from their past suggest that nostalgic memories often increase feelings of social connection and give life a sense of meaning. Interestingly, people tend to become more nostalgic when they feel lonely or anxious, which suggests that nostalgia may help them to restore their mood.',
  'This does not mean that nostalgia is always helpful. When people constantly compare a disappointing present with an idealised past, nostalgia may make them less willing to accept change. Memories are also selective: we tend to remember the good parts of the past and forget the difficulties, so the “good old days” may never have been as good as we think.',
  'Businesses are well aware of nostalgia’s power. Advertisers frequently use music, images and products from earlier decades to create a warm emotional response, and old brands are regularly brought back in their original packaging. For consumers, recognising this strategy may be the first step towards deciding whether they are buying a product or simply a feeling.',
];

const H3 = [
  'i. The end of an ancient tradition',
  'ii. A festival for a god',
  'iii. The cost of being a host',
  'iv. Prizes and competitions in the past',
  'v. Why women could not compete',
  'vi. A larger and more varied event',
  'vii. The rebirth of an old idea',
];

export const cefrReading7: ReadingTest = {
  id: 'cefr-reading-7',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Reading — mashq testi 7',
  minutes: 60,
  passageTitle: 'Part 1: Short texts',
  paragraphs: [...T1, ...T2, ...T3, ...T4, ...T5],
  sections: [
    { at: 0, title: 'Part 1: Short texts (B1)' },
    { at: T1.length, title: 'Part 2: Living with pets (B1)' },
    { at: T1.length + T2.length, title: 'Part 3: The Olympic Games (B2)' },
    { at: T1.length + T2.length + T3.length, title: 'Part 4: Food waste (B2)' },
    { at: T1.length + T2.length + T3.length + T4.length, title: 'Part 5: Nostalgia (C1)' },
  ],
  groups: [
    { instruction: 'Part 1 — Questions 1–6: Read the short texts and choose the correct answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Part 2 — Questions 7–14: Do the statements agree with the text? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [7, 8, 9, 10, 11, 12, 13, 14] },
    { instruction: 'Part 3 — Questions 15–20: Choose the correct heading for each paragraph A–F. There is one extra heading.', questionIds: [15, 16, 17, 18, 19, 20] },
    { instruction: 'Part 4 — Questions 21–28: Complete the sentences. Write ONE WORD ONLY from the text for each answer.', questionIds: [21, 22, 23, 24, 25, 26, 27, 28] },
    { instruction: 'Part 5 — Questions 29–35: Choose the correct answer.', questionIds: [29, 30, 31, 32, 33, 34, 35] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What will students need to enter the library after 10 pm?', options: ['A special permit', 'Their student card', 'A teacher’s letter'], answer: 1, evidence: 'Text 1: "Students must show their student card to enter after 10 pm."' },
    { id: 2, type: 'mcq', text: 'What is allowed in the reading rooms?', options: ['Drinks in closed bottles', 'Sandwiches', 'Hot meals'], answer: 0, evidence: 'Text 1: "Food is not allowed … but drinks in closed bottles are."' },
    { id: 3, type: 'mcq', text: 'Why is Laylo at Nodira’s house?', options: ['To have dinner', 'To charge her phone', 'To study for a test'], answer: 2, evidence: 'Text 2: "to study for tomorrow’s chemistry test".' },
    { id: 4, type: 'mcq', text: 'Why should her mother call Nodira?', options: ['Laylo’s phone battery is low.', 'Nodira’s father asked her to.', 'Laylo has lost her phone.'], answer: 0, evidence: 'Text 2: "My phone battery is low, so call Nodira if you need me."' },
    { id: 5, type: 'mcq', text: 'How can the dog be recognised?', options: ['It is large and black.', 'It wears a red collar.', 'It has a white spot on its back.'], answer: 2, evidence: 'Text 3: "small, brown, with a white spot on his back".' },
    { id: 6, type: 'mcq', text: 'Where was the dog last seen?', options: ['Near the central market', 'In the park', 'At the vet'], answer: 0, evidence: 'Text 3: "Last seen near the central market on Saturday morning."' },
    { id: 7, type: 'tfng', text: 'Cats and dogs are the most common pets.', answer: 'True', evidence: 'Part 2: "Cats and dogs are the most common".' },
    { id: 8, type: 'tfng', text: 'Many owners see their pet as part of the family.', answer: 'True', evidence: 'Part 2: "a pet is not just an animal but a member of the family".' },
    { id: 9, type: 'tfng', text: 'Dog owners usually walk less than people without dogs.', answer: 'False', evidence: 'Part 2: "Dog owners … tend to walk more than people without dogs".' },
    { id: 10, type: 'tfng', text: 'Older people are more likely to own cats than dogs.', answer: 'Not Given', evidence: 'Part 2 does not compare which pets older people own.' },
    { id: 11, type: 'tfng', text: 'Visits to the vet can be expensive.', answer: 'True', evidence: 'Part 2: "visits to the vet, which can be expensive".' },
    { id: 12, type: 'tfng', text: 'Some people give pets away after realising how much they cost.', answer: 'True', evidence: 'Part 2: they "later give them away when they realise how much time and money they require".' },
    { id: 13, type: 'tfng', text: 'Charities advise people to buy pets from shops.', answer: 'False', evidence: 'Part 2: charities advise "adopting an animal from a shelter".' },
    { id: 14, type: 'tfng', text: 'Adopting from a shelter is cheaper than buying a pet.', answer: 'Not Given', evidence: 'Part 2 gives no prices for adoption.' },
    { id: 15, type: 'match', text: 'Paragraph A', options: H3, answer: 1, evidence: 'Part 3 A: held "in honour of the god Zeus".' },
    { id: 16, type: 'match', text: 'Paragraph B', options: H3, answer: 3, evidence: 'Part 3 B: events and "a crown made of olive leaves".' },
    { id: 17, type: 'match', text: 'Paragraph C', options: H3, answer: 0, evidence: 'Part 3 C: "finally came to an end in the late fourth century".' },
    { id: 18, type: 'match', text: 'Paragraph D', options: H3, answer: 6, evidence: 'Part 3 D: "The first modern Games were held in Athens in 1896."' },
    { id: 19, type: 'match', text: 'Paragraph E', options: H3, answer: 5, evidence: 'Part 3 E: "the Games have grown enormously"; Winter and Paralympic Games added.' },
    { id: 20, type: 'match', text: 'Paragraph F', options: H3, answer: 2, evidence: 'Part 3 F: "Hosting the Games, however, has become extremely expensive."' },
    { id: 21, type: 'fill', text: 'Around a ______ of all food produced is lost or wasted.', answers: ['third'], evidence: 'Part 4: "Around a third of all the food produced".' },
    { id: 22, type: 'fill', text: 'At home, people often buy more food than they ______.', answers: ['need'], evidence: 'Part 4: "people buy more than they need".' },
    { id: 23, type: 'fill', text: 'Special ______ encourage shoppers to buy large quantities.', answers: ['offers'], evidence: 'Part 4: "Special offers encourage shoppers to buy large quantities".' },
    { id: 24, type: 'fill', text: 'Confusion about date ______ leads people to throw away safe food.', answers: ['labels'], evidence: 'Part 4: "Confusion about date labels also plays a part".' },
    { id: 25, type: 'fill', text: 'Rotting food in landfill produces ______.', answers: ['methane'], evidence: 'Part 4: "it produces methane".' },
    { id: 26, type: 'fill', text: 'Planning ______ for the week can reduce waste.', answers: ['meals'], evidence: 'Part 4: "Planning meals for the week".' },
    { id: 27, type: 'fill', text: 'Some supermarkets sell “______” fruit and vegetables at lower prices.', answers: ['ugly'], evidence: 'Part 4: "sell “ugly” fruit and vegetables at lower prices".' },
    { id: 28, type: 'fill', text: 'Apps let restaurants sell ______ food cheaply.', answers: ['leftover'], evidence: 'Part 4: "sell leftover food cheaply at the end of the day".' },
    { id: 29, type: 'mcq', text: 'How was nostalgia regarded for much of history?', options: ['As a sign of intelligence', 'As a kind of illness', 'As a pleasant feeling', 'As a problem only for the old'], answer: 1, evidence: 'Part 5: "nostalgia … was regarded as a kind of illness".' },
    { id: 30, type: 'mcq', text: 'Who did the Swiss doctor describe as affected by nostalgia?', options: ['Children at school', 'Sailors at sea', 'Soldiers far from home', 'Farmers in winter'], answer: 2, evidence: 'Part 5: "a condition affecting soldiers who were far from home".' },
    { id: 31, type: 'mcq', text: 'According to recent studies, nostalgic memories often', options: ['increase feelings of social connection.', 'make people more anxious.', 'reduce the sense of meaning in life.', 'cause people to forget the present.'], answer: 0, evidence: 'Part 5: "nostalgic memories often increase feelings of social connection".' },
    { id: 32, type: 'mcq', text: 'What does the fact that lonely people become more nostalgic suggest?', options: ['Nostalgia causes loneliness.', 'Lonely people have better memories.', 'Nostalgia is a sign of illness.', 'Nostalgia may help people restore their mood.'], answer: 3, evidence: 'Part 5: "nostalgia may help them to restore their mood".' },
    { id: 33, type: 'mcq', text: 'When may nostalgia be unhelpful?', options: ['When people remember difficult times', 'When it makes people less willing to accept change', 'When it is shared with friends', 'When it is used in education'], answer: 1, evidence: 'Part 5: "nostalgia may make them less willing to accept change".' },
    { id: 34, type: 'mcq', text: 'Why may the “good old days” not have been as good as we think?', options: ['Memories are selective.', 'Life was more expensive.', 'Old photographs are unreliable.', 'People lived shorter lives.'], answer: 0, evidence: 'Part 5: "Memories are also selective: we tend to remember the good parts".' },
    { id: 35, type: 'mcq', text: 'What does the writer suggest consumers should do?', options: ['Avoid old brands completely', 'Buy products from earlier decades', 'Recognise how advertisers use nostalgia', 'Complain about advertising'], answer: 2, evidence: 'Part 5: "recognising this strategy may be the first step towards deciding whether they are buying a product or simply a feeling".' },
  ],
};
