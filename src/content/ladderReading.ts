import type { ReadingTest } from './types';

// IELTS zinapoyasi uchun Reading mini-testlari: IELTS savol turlari, lekin matn va lug'at o'quvchi darajasida.
// Original mashq matnlari (Bandly). Rasmiy IELTS materiali emas.

export const reading7: ReadingTest = {
  id: 'reading-7', level: 'A2', title: 'Reading mini-test 7: A New Sports Centre', minutes: 12,
  passageTitle: 'A New Sports Centre',
  paragraphs: [
    'A. Last month, a new sports centre opened in Chilonzor. It is next to the metro station, so it is easy to get there. The centre is open every day from six in the morning until ten at night, but on Sundays it closes at eight.',
    'B. There is a big swimming pool, a gym and two halls for basketball and volleyball. The pool is the most popular part of the centre. In the mornings, many older people swim there before work. After school, the pool is full of children.',
    'C. Prices are not very high. One visit costs thirty thousand som, and a monthly card costs two hundred thousand. Students pay half price if they show their student card. Children under seven can use the pool for free with a parent.',
    'D. The centre also has classes. There are yoga classes on Monday and Wednesday evenings, and swimming lessons for children on Saturday mornings. You need to book classes at the reception desk or on the centre’s website. Classes are small, with only twelve people in each group.',
    'E. The manager, Mrs Karimova, says the centre is busier than she expected. She wants to open a small café next year, because many visitors ask for a place to have a drink after their exercise.',
  ],
  groups: [
    { instruction: 'Questions 1–5: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–8: Choose the correct letter.', questionIds: [6, 7, 8] },
    { instruction: 'Questions 9–11: Complete the sentences. Write ONE WORD AND/OR A NUMBER from the passage for each answer.', questionIds: [9, 10, 11] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'The sports centre is close to a metro station.', answer: 'True', evidence: 'A: "It is next to the metro station".' },
    { id: 2, type: 'tfng', text: 'The centre closes at ten o’clock every day.', answer: 'False', evidence: 'A: "on Sundays it closes at eight".' },
    { id: 3, type: 'tfng', text: 'The gym is the most popular part of the centre.', answer: 'False', evidence: 'B: "The pool is the most popular part of the centre."' },
    { id: 4, type: 'tfng', text: 'The centre has a parking area for cars.', answer: 'Not Given', evidence: 'The text does not mention parking.' },
    { id: 5, type: 'tfng', text: 'Young children can swim for free if a parent is with them.', answer: 'True', evidence: 'C: "Children under seven can use the pool for free with a parent."' },
    { id: 6, type: 'mcq', text: 'Who swims in the pool in the mornings?', options: ['Children', 'Older people', 'Students'], answer: 1, evidence: 'B: "In the mornings, many older people swim there".' },
    { id: 7, type: 'mcq', text: 'When are the yoga classes?', options: ['On Saturday mornings', 'On Monday and Wednesday evenings', 'Every day at six'], answer: 1, evidence: 'D: "yoga classes on Monday and Wednesday evenings".' },
    { id: 8, type: 'mcq', text: 'Why does the manager want to open a café?', options: ['Visitors want a drink after exercise.', 'The centre needs more money.', 'The pool is too busy.'], answer: 0, evidence: 'E: "many visitors ask for a place to have a drink after their exercise".' },
    { id: 9, type: 'fill', text: 'A monthly card costs ______ thousand som.', answers: ['two hundred', '200'], evidence: 'C: "a monthly card costs two hundred thousand".' },
    { id: 10, type: 'fill', text: 'Students pay ______ price with a student card.', answers: ['half'], evidence: 'C: "Students pay half price".' },
    { id: 11, type: 'fill', text: 'There are only ______ people in each class.', answers: ['twelve', '12'], evidence: 'D: "only twelve people in each group".' },
  ],
};

export const reading8: ReadingTest = {
  id: 'reading-8', level: 'A2', title: 'Reading mini-test 8: My First Job', minutes: 12,
  passageTitle: 'My First Job',
  paragraphs: [
    'A. When I was seventeen, I got my first job in a small bookshop in Samarkand. My uncle knew the owner, Mr Nazarov, and he told me about the job. I worked there every summer for three years.',
    'B. At first, my work was very simple. I cleaned the shelves, put new books in the right place and carried heavy boxes from the van. I did not talk to customers in the first month, because Mr Nazarov wanted me to learn where everything was.',
    'C. In the second month, I started to help customers. This was difficult for me, because I was quite shy. Many tourists came to the shop, and they often asked for maps and books about the history of the city. I had to speak English with them, and my English improved a lot.',
    'D. The pay was not high, but I saved most of my money. At the end of the third summer, I bought my first laptop. I still use it today for my university work.',
    'E. Now I study economics in Tashkent. I think the bookshop taught me important things: how to be patient, how to talk to people and how to manage money. I visit Mr Nazarov every time I go home.',
  ],
  groups: [
    { instruction: 'Questions 1–5: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–8: Choose the correct letter.', questionIds: [6, 7, 8] },
    { instruction: 'Questions 9–11: Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [9, 10, 11] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'The writer heard about the job from a family member.', answer: 'True', evidence: 'A: "My uncle knew the owner … and he told me about the job."' },
    { id: 2, type: 'tfng', text: 'The writer worked in the shop all year round.', answer: 'False', evidence: 'A: "I worked there every summer for three years."' },
    { id: 3, type: 'tfng', text: 'In the first month, the writer helped many customers.', answer: 'False', evidence: 'B: "I did not talk to customers in the first month".' },
    { id: 4, type: 'tfng', text: 'Mr Nazarov also owns a shop in Tashkent.', answer: 'Not Given', evidence: 'The text does not say this.' },
    { id: 5, type: 'tfng', text: 'The writer’s English got better because of the job.', answer: 'True', evidence: 'C: "my English improved a lot".' },
    { id: 6, type: 'mcq', text: 'What did tourists often ask for?', options: ['Postcards and pens', 'Maps and history books', 'Children’s books'], answer: 1, evidence: 'C: "they often asked for maps and books about the history of the city".' },
    { id: 7, type: 'mcq', text: 'Why was helping customers difficult at first?', options: ['The writer was shy.', 'The shop was always busy.', 'The books were expensive.'], answer: 0, evidence: 'C: "This was difficult for me, because I was quite shy."' },
    { id: 8, type: 'mcq', text: 'What does the writer study now?', options: ['History', 'English', 'Economics'], answer: 2, evidence: 'E: "Now I study economics in Tashkent."' },
    { id: 9, type: 'fill', text: 'The writer carried heavy boxes from the ______.', answers: ['van'], evidence: 'B: "carried heavy boxes from the van".' },
    { id: 10, type: 'fill', text: 'With the money from the job, the writer bought a ______.', answers: ['laptop'], evidence: 'D: "I bought my first laptop".' },
    { id: 11, type: 'fill', text: 'The job taught the writer how to be ______.', answers: ['patient'], evidence: 'E: "how to be patient".' },
  ],
};

export const reading9: ReadingTest = {
  id: 'reading-9', level: 'B1', title: 'Reading mini-test 9: The Return of the Bicycle Courier', minutes: 15,
  passageTitle: 'The Return of the Bicycle Courier',
  paragraphs: [
    'A. Ten years ago, most parcels in large cities were delivered by van. Today, more and more of them arrive by bicycle. Delivery companies say that bikes are often faster than vans in busy city centres, because they can use cycle lanes and do not need to look for parking spaces.',
    'B. Many of the new bikes are cargo bikes, which have a large box at the front or back. Some of them have a small electric motor, so riders can carry up to one hundred kilograms without becoming exhausted. A cargo bike costs much less than a van, and it does not need fuel.',
    'C. City councils are also interested. Fewer vans on the roads means less traffic and cleaner air. Some cities have created special areas where companies can leave large deliveries; from there, the parcels are taken to their final address by bike. This system is often called “the last mile”.',
    'D. However, the job is not easy. Couriers work outside in all weather, and in winter the roads can be dangerous. Many of them are paid for each delivery rather than for each hour, so a slow day means low earnings. Some couriers have started to ask companies for better pay and insurance.',
    'E. Experts believe the number of bicycle deliveries will keep growing, especially as online shopping becomes more popular. But they also say that bikes cannot replace vans completely: large or very heavy items, such as furniture, will still need to travel by road.',
  ],
  groups: [
    { instruction: 'Questions 1–5: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Choose the correct letter.', questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–12: Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [10, 11, 12] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'In city centres, bicycles can be quicker than vans.', answer: 'True', evidence: 'A: "bikes are often faster than vans in busy city centres".' },
    { id: 2, type: 'tfng', text: 'All cargo bikes have an electric motor.', answer: 'False', evidence: 'B: "Some of them have a small electric motor".' },
    { id: 3, type: 'tfng', text: 'A cargo bike is cheaper than a van.', answer: 'True', evidence: 'B: "A cargo bike costs much less than a van".' },
    { id: 4, type: 'tfng', text: 'Most couriers prefer to work in winter.', answer: 'Not Given', evidence: 'D says winter roads can be dangerous but not what couriers prefer.' },
    { id: 5, type: 'tfng', text: 'Experts think bikes will completely replace vans.', answer: 'False', evidence: 'E: "bikes cannot replace vans completely".' },
    { id: 6, type: 'mcq', text: 'Why can bikes deliver faster in cities?', options: ['They carry more parcels.', 'They use cycle lanes and need no parking.', 'Their riders work longer hours.', 'They have stronger motors.'], answer: 1, evidence: 'A: "they can use cycle lanes and do not need to look for parking spaces".' },
    { id: 7, type: 'mcq', text: 'Why are city councils interested in bike deliveries?', options: ['To earn money from couriers', 'To reduce traffic and pollution', 'To create more parking', 'To sell cargo bikes'], answer: 1, evidence: 'C: "less traffic and cleaner air".' },
    { id: 8, type: 'mcq', text: 'How are many couriers paid?', options: ['For each hour', 'For each delivery', 'Once a month', 'By the kilometre'], answer: 1, evidence: 'D: "paid for each delivery rather than for each hour".' },
    { id: 9, type: 'mcq', text: 'What will still need to travel by road?', options: ['Letters', 'Food', 'Furniture', 'Clothes'], answer: 2, evidence: 'E: "large or very heavy items, such as furniture".' },
    { id: 10, type: 'fill', text: 'With a motor, riders can carry up to one hundred ______.', answers: ['kilograms'], evidence: 'B: "carry up to one hundred kilograms".' },
    { id: 11, type: 'fill', text: 'Taking parcels from a special area to the final address is called “the ______”.', answers: ['last mile'], evidence: 'C: "This system is often called “the last mile”."' },
    { id: 12, type: 'fill', text: 'Some couriers want better pay and ______.', answers: ['insurance'], evidence: 'D: "ask companies for better pay and insurance".' },
  ],
};

export const reading10: ReadingTest = {
  id: 'reading-10', level: 'B2', title: 'Reading mini-test 10: Why We Trust Strangers Online', minutes: 18,
  passageTitle: 'Why We Trust Strangers Online',
  paragraphs: [
    'A. Every day, millions of people book rooms in the homes of people they have never met, or buy expensive second-hand items from strangers hundreds of kilometres away. A generation ago, most of these transactions would have seemed far too risky. What has changed is not human nature but the arrival of systems designed to build trust between people who will probably never meet again.',
    'B. The most familiar of these systems is the rating. After a transaction, both sides give each other a score and often a short written review. Over time, these scores form a public record. Researchers have found that people are strongly influenced by the first few reviews they read, and that a single very negative comment can outweigh several positive ones.',
    'C. Ratings have obvious weaknesses, however. Because many users feel awkward about criticising someone directly, average scores on some platforms are extremely high, which makes it difficult to tell an excellent seller from an ordinary one. In addition, some businesses pay for fake positive reviews, and platforms must spend considerable effort detecting them.',
    'D. Platforms therefore combine ratings with other signals. Verified identity documents, connected phone numbers and secure payment systems all reduce the risk that a user is not who they claim to be. Some platforms hold the buyer’s money until the item has arrived in good condition, so that neither side has to take the first step on trust alone.',
    'E. Interestingly, studies suggest that people trust online strangers who appear similar to themselves, for example in age or interests, more than those who seem different. Critics warn that this tendency can disadvantage certain groups, and some platforms have reduced the amount of personal information shown before a booking is confirmed.',
  ],
  groups: [
    { instruction: 'Questions 1–5: The passage has five paragraphs, A–E. Choose the correct heading for each paragraph.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–13: Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [10, 11, 12, 13] },
  ],
  questions: [
    { id: 1, type: 'match', text: 'Paragraph A', options: ['i. Additional ways of checking users', 'ii. A change made possible by new systems', 'iii. How scores and comments shape decisions', 'iv. Problems with rating systems', 'v. A preference for similar people', 'vi. The history of second-hand markets'], answer: 1, evidence: 'A: what has changed is "the arrival of systems designed to build trust".' },
    { id: 2, type: 'match', text: 'Paragraph B', options: ['i. Additional ways of checking users', 'ii. A change made possible by new systems', 'iii. How scores and comments shape decisions', 'iv. Problems with rating systems', 'v. A preference for similar people', 'vi. The history of second-hand markets'], answer: 2, evidence: 'B: people are "strongly influenced by the first few reviews".' },
    { id: 3, type: 'match', text: 'Paragraph C', options: ['i. Additional ways of checking users', 'ii. A change made possible by new systems', 'iii. How scores and comments shape decisions', 'iv. Problems with rating systems', 'v. A preference for similar people', 'vi. The history of second-hand markets'], answer: 3, evidence: 'C: "Ratings have obvious weaknesses".' },
    { id: 4, type: 'match', text: 'Paragraph D', options: ['i. Additional ways of checking users', 'ii. A change made possible by new systems', 'iii. How scores and comments shape decisions', 'iv. Problems with rating systems', 'v. A preference for similar people', 'vi. The history of second-hand markets'], answer: 0, evidence: 'D: verified documents, phone numbers and secure payment.' },
    { id: 5, type: 'match', text: 'Paragraph E', options: ['i. Additional ways of checking users', 'ii. A change made possible by new systems', 'iii. How scores and comments shape decisions', 'iv. Problems with rating systems', 'v. A preference for similar people', 'vi. The history of second-hand markets'], answer: 4, evidence: 'E: people trust strangers "who appear similar to themselves".' },
    { id: 6, type: 'tfng', text: 'The writer believes that human nature has become more trusting.', answer: 'False', evidence: 'A: "What has changed is not human nature".' },
    { id: 7, type: 'tfng', text: 'One very bad review can matter more than several good ones.', answer: 'True', evidence: 'B: "a single very negative comment can outweigh several positive ones".' },
    { id: 8, type: 'tfng', text: 'Most fake reviews are written by competitors.', answer: 'Not Given', evidence: 'C mentions businesses paying for fake positive reviews, not competitors.' },
    { id: 9, type: 'tfng', text: 'Some platforms now show less personal information before a booking is confirmed.', answer: 'True', evidence: 'E: "some platforms have reduced the amount of personal information shown".' },
    { id: 10, type: 'fill', text: 'High average scores make it hard to tell an excellent seller from an ______ one.', answers: ['ordinary'], evidence: 'C: "an excellent seller from an ordinary one".' },
    { id: 11, type: 'fill', text: 'Some businesses pay for fake positive ______.', answers: ['reviews'], evidence: 'C: "some businesses pay for fake positive reviews, and platforms must spend considerable effort detecting them".' },
    { id: 12, type: 'fill', text: 'Some platforms keep the buyer’s ______ until the item arrives.', answers: ['money'], evidence: 'D: "Some platforms hold the buyer’s money".' },
    { id: 13, type: 'fill', text: 'Critics say the preference for similar people can ______ certain groups.', answers: ['disadvantage'], evidence: 'E: "this tendency can disadvantage certain groups".' },
  ],
};
