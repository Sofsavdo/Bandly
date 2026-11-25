import type { ListeningTest } from './types';

// To'liq formatli IELTS Listening mashq testi 4: 4 qism, 40 savol (≈ 30 daqiqa).
// Original mashq skripti (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const PART1: L[] = [
  { speaker: 'A', text: 'Good morning, Funzone Activity Centre. Lucy speaking.' },
  { speaker: 'B', text: "Hello. I'd like to book a birthday party for my daughter. She'll be eight next month." },
  { speaker: 'A', text: 'Lovely. What date were you thinking of?' },
  { speaker: 'B', text: 'Saturday the sixteenth of May, if possible.' },
  { speaker: 'A', text: 'Let me check. We have a morning slot from ten till twelve, or an afternoon slot from two till four.' },
  { speaker: 'B', text: 'The afternoon would be better. Her grandparents are travelling in that morning.' },
  { speaker: 'A', text: 'Fine. How many children will there be?' },
  { speaker: 'B', text: 'About fifteen, I think.' },
  { speaker: 'A', text: 'Our standard party is for up to twelve children, at a hundred and twenty pounds. Each extra child costs eight pounds.' },
  { speaker: 'B', text: "OK, that's fine. What activities do you offer?" },
  { speaker: 'A', text: "There's a choice of two: climbing or trampolining." },
  { speaker: 'B', text: "She loves climbing, so let's go for that." },
  { speaker: 'A', text: 'Good. And food? We offer pizza or sandwiches, and we provide the drinks.' },
  { speaker: 'B', text: "Pizza, please. But one of the children can't eat cheese, so could you make one plate without it?" },
  { speaker: 'A', text: "No problem, I'll note that. Will you bring a cake?" },
  { speaker: 'B', text: 'Yes, my wife is making one.' },
  { speaker: 'A', text: "Then we'll provide candles and plates. Now, can I take your name?" },
  { speaker: 'B', text: 'David Ashworth. A, S, H, W, O, R, T, H.' },
  { speaker: 'A', text: 'And a phone number?' },
  { speaker: 'B', text: 'Oh seven nine four five, three one two, six six eight.' },
  { speaker: 'A', text: 'Thank you. We need a deposit of thirty pounds to confirm the booking, and the rest is paid on the day.' },
  { speaker: 'B', text: 'Can I pay the deposit by bank transfer?' },
  { speaker: 'A', text: "Yes, or by card now. Also, please arrive fifteen minutes early so the children can put on their socks. They're compulsory for climbing, and we sell them at reception if anyone forgets." },
  { speaker: 'B', text: 'Great. Thanks for your help.' },
];

const PART2: L[] = [
  { speaker: 'B', text: "Good afternoon. This is Ben Harris with the local travel update, and today I want to tell you about the changes to Northfield's bus and tram services, which start on the first of September." },
  { speaker: 'B', text: "The biggest change is to the tram. At the moment, trams run every fifteen minutes during the day. From September, they'll run every ten minutes, and the last tram will leave the city centre at midnight instead of eleven, which should be welcome news for people working evening shifts." },
  { speaker: 'B', text: 'Bus route seven, which currently goes through the city centre, will be divided into two shorter routes, seven A and seven B. The council says this will make buses more reliable, because delays in one part of the route will no longer affect the whole line.' },
  { speaker: 'B', text: 'Fares are also changing. A single ticket will rise by twenty pence, to two pounds forty, but a new day ticket, which costs five pounds, will allow unlimited travel on both buses and trams. Children under eleven will continue to travel free.' },
  { speaker: 'B', text: "For the first time, passengers will be able to pay by tapping a bank card on the reader, so there's no need to buy a paper ticket in advance. Cash will still be accepted on buses, but not on trams." },
  { speaker: 'B', text: 'Some stops are moving too. The stop outside the old cinema on Park Street is closing, because the road is being widened. Passengers should use the new stop next to the hospital, which is only about a hundred metres away.' },
  { speaker: 'B', text: "And finally, the council wants to hear what you think. There's an online survey on its website until the end of October, and there will be a public meeting at the town hall on the twelfth of October at seven pm." },
];

const PART3: L[] = [
  { speaker: 'C', text: 'Tom, how did your interview with the café owner go?' },
  { speaker: 'D', text: 'Really well. She was very open. She told me they started posting on social media about a year ago, mainly because younger customers kept asking whether they had an account.' },
  { speaker: 'C', text: 'Did it make any difference to sales?' },
  { speaker: 'D', text: "She thinks so, but she doesn't have exact figures. The number of customers at weekends has gone up, but they also changed the menu at the same time, so it's hard to know which one caused the increase." },
  { speaker: 'C', text: "That's a problem for our analysis. We can't claim social media was the reason." },
  { speaker: 'D', text: "Exactly. We'll have to be careful how we word it." },
  { speaker: 'C', text: 'What kind of posts work best for them?' },
  { speaker: 'D', text: 'Photos of the food get lots of likes, but she said the posts that actually bring people in are the ones about events, like the live music on Friday evenings.' },
  { speaker: 'C', text: "Interesting. So likes aren't the same as sales." },
  { speaker: 'D', text: "Right. And short videos did much better than she expected. She's started making one a week." },
  { speaker: 'C', text: 'Who does all this? It must take a lot of time.' },
  { speaker: 'D', text: 'Her nephew did it at first, but he went to university, so now one of the waiters does it in quiet periods.' },
  { speaker: 'C', text: 'OK. For our report, I think we should recommend that they collect proper data, maybe by asking customers how they heard about the café.' },
  { speaker: 'D', text: "Good idea. I'd also suggest they reply to customer reviews. At the moment they ignore them, even the negative ones." },
  { speaker: 'C', text: "Now, the work. I'll write up the interview notes tonight." },
  { speaker: 'D', text: "Then I'll look for some research articles on small businesses and social media." },
  { speaker: 'C', text: "And who'll do the slides for the presentation?" },
  { speaker: 'D', text: "You're better at design than me. Could you?" },
  { speaker: 'C', text: 'Fine. Then you can prepare the handout.' },
];

const PART4: L[] = [
  { speaker: 'A', text: "Good morning. Today we're going to look at a plant that has had an enormous influence on world history: the potato." },
  { speaker: 'A', text: 'The potato was first grown in the Andes mountains of South America at least seven thousand years ago. The people of the region developed hundreds of varieties, suited to different heights and climates, and they also invented a way of preserving potatoes by freezing them at night and drying them in the sun during the day.' },
  { speaker: 'A', text: 'Spanish explorers brought the potato to Europe in the second half of the sixteenth century. At first, Europeans were suspicious of it. Because it grew underground and was related to some poisonous plants, many people believed it caused disease, and in some areas it was used mainly to feed animals.' },
  { speaker: 'A', text: 'Attitudes changed slowly. In France, a scientist named Antoine Parmentier, who had eaten potatoes as a prisoner of war, campaigned to persuade people of their value. According to a popular story, he placed guards around a field of potatoes, which made local people think the crop was valuable, and they came at night to steal it.' },
  { speaker: 'A', text: 'By the nineteenth century, the potato had become a basic food for millions of poor people in northern Europe. It produced more food per hectare than wheat, and it could be grown in poor soil. This helped populations to grow rapidly.' },
  { speaker: 'A', text: 'However, depending on a single crop was dangerous. In Ireland in the 1840s, a disease destroyed the potato harvest several years in a row. Around a million people died, and another million emigrated, many of them to North America.' },
  { speaker: 'A', text: "Today, the potato is the world's third most important food crop after rice and wheat, and China is now the largest producer. Scientists are working on new varieties that can resist disease and survive drought, which will be important as the climate changes." },
];

const SCRIPT = [...PART1, ...PART2, ...PART3, ...PART4];

export const listeningFull4: ListeningTest = {
  id: 'listening-full-4',
  level: 'C1',
  title: 'IELTS Listening — to‘liq mock 4',
  minutes: 35,
  names: { A: 'Lucy / Lecturer', B: 'David / Ben', C: 'Sophie', D: 'Tom' },
  context: '4 qism: 1) bolalar tug‘ilgan kunini band qilish (telefon); 2) shahar transportidagi o‘zgarishlar haqida radio xabari; 3) ikki talabaning kafe va ijtimoiy tarmoqlar haqidagi loyihasi; 4) kartoshka tarixi haqida ma’ruza.',
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
    { instruction: 'Part 3 — Questions 27–30: Who will do each task? Choose Sophie or Tom.', questionIds: [27, 28, 29, 30] },
    { instruction: 'Part 4 — Questions 31–40: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
  ],
  questions: [
    // Part 1
    { id: 1, type: 'fill', text: 'Daughter’s age at the party: ______', answers: ['8', 'eight'], evidence: 'Part 1: "She\'ll be eight next month."' },
    { id: 2, type: 'fill', text: 'Date: Saturday 16 ______', answers: ['may'], evidence: 'Part 1: "Saturday the sixteenth of May".' },
    { id: 3, type: 'fill', text: 'Time: the ______ slot', answers: ['afternoon'], evidence: 'Part 1: "The afternoon would be better."' },
    { id: 4, type: 'fill', text: 'Number of children: about ______', answers: ['15', 'fifteen'], evidence: 'Part 1: "About fifteen, I think."' },
    { id: 5, type: 'fill', text: 'Cost of each extra child: £______', answers: ['8', 'eight'], evidence: 'Part 1: "Each extra child costs eight pounds."' },
    { id: 6, type: 'fill', text: 'Activity: ______', answers: ['climbing'], evidence: 'Part 1: "She loves climbing, so let\'s go for that."' },
    { id: 7, type: 'fill', text: 'Food: ______', answers: ['pizza'], evidence: 'Part 1: "Pizza, please."' },
    { id: 8, type: 'fill', text: 'Special request: one plate without ______', answers: ['cheese'], evidence: 'Part 1: "one of the children can\'t eat cheese".' },
    { id: 9, type: 'fill', text: 'Surname: ______', answers: ['ashworth'], evidence: 'Part 1: "David Ashworth. A, S, H, W, O, R, T, H."' },
    { id: 10, type: 'fill', text: 'Deposit: £______', answers: ['30', 'thirty'], evidence: 'Part 1: "a deposit of thirty pounds".' },
    // Part 2
    { id: 11, type: 'mcq', text: 'From September, how often will trams run during the day?', options: ['Every five minutes', 'Every ten minutes', 'Every fifteen minutes', 'Every twenty minutes'], answer: 1, evidence: 'Part 2: "From September, they\'ll run every ten minutes".' },
    { id: 12, type: 'mcq', text: 'Why is bus route seven being divided?', options: ['To save money', 'Because of road works', 'To make buses more reliable', 'To reach new areas'], answer: 2, evidence: 'Part 2: "this will make buses more reliable".' },
    { id: 13, type: 'mcq', text: 'What will the new day ticket allow?', options: ['Unlimited travel on buses and trams', 'Travel on trams only', 'Free travel after 7 pm', 'Two return journeys'], answer: 0, evidence: 'Part 2: "will allow unlimited travel on both buses and trams".' },
    { id: 14, type: 'mcq', text: 'Who will continue to travel free?', options: ['Students', 'People over sixty-five', 'Hospital workers', 'Children under eleven'], answer: 3, evidence: 'Part 2: "Children under eleven will continue to travel free."' },
    { id: 15, type: 'mcq', text: 'Where will cash NOT be accepted?', options: ['On buses', 'On trams', 'At the town hall', 'At ticket machines'], answer: 1, evidence: 'Part 2: "Cash will still be accepted on buses, but not on trams."' },
    { id: 16, type: 'fill', text: 'Last tram from the city centre: ______', answers: ['midnight', '12'], evidence: 'Part 2: "the last tram will leave the city centre at midnight".' },
    { id: 17, type: 'fill', text: 'New price of a single ticket: £______', answers: ['2.40', '2.4', 'two pounds forty'], evidence: 'Part 2: "A single ticket will rise by twenty pence, to two pounds forty".' },
    { id: 18, type: 'fill', text: 'Passengers can pay by tapping a bank ______.', answers: ['card'], evidence: 'Part 2: "pay by tapping a bank card on the reader".' },
    { id: 19, type: 'fill', text: 'The new stop is next to the ______.', answers: ['hospital'], evidence: 'Part 2: "the new stop next to the hospital".' },
    { id: 20, type: 'fill', text: 'Public meeting: 12 ______ at the town hall', answers: ['october'], evidence: 'Part 2: "a public meeting at the town hall on the twelfth of October".' },
    // Part 3
    { id: 21, type: 'mcq', text: 'Why did the café start using social media?', options: ['Younger customers kept asking about it.', 'The owner’s nephew suggested it.', 'A competitor was doing it.'], answer: 0, evidence: 'Part 3: "younger customers kept asking whether they had an account".' },
    { id: 22, type: 'mcq', text: 'Why is it hard to judge the effect on sales?', options: ['The café has no records.', 'Sales fell at weekends.', 'The menu changed at the same time.'], answer: 2, evidence: 'Part 3: "they also changed the menu at the same time".' },
    { id: 23, type: 'mcq', text: 'Which posts actually bring customers in?', options: ['Photos of the food', 'Posts about events', 'Special offers'], answer: 1, evidence: 'Part 3: "the posts that actually bring people in are the ones about events".' },
    { id: 24, type: 'mcq', text: 'What surprised the owner?', options: ['How well short videos did', 'How many likes the photos got', 'How expensive advertising was'], answer: 0, evidence: 'Part 3: "short videos did much better than she expected".' },
    { id: 25, type: 'mcq', text: 'Who manages the social media now?', options: ['The owner’s nephew', 'The owner', 'One of the waiters'], answer: 2, evidence: 'Part 3: "now one of the waiters does it in quiet periods".' },
    { id: 26, type: 'mcq', text: 'What does Tom suggest the café should do?', options: ['Post more food photos', 'Reply to customer reviews', 'Hire a professional'], answer: 1, evidence: 'Part 3: "I\'d also suggest they reply to customer reviews."' },
    { id: 27, type: 'mcq', text: 'Writing up the interview notes', options: ['Sophie', 'Tom'], answer: 0, evidence: 'Part 3: Sophie: "I\'ll write up the interview notes tonight."' },
    { id: 28, type: 'mcq', text: 'Finding research articles', options: ['Sophie', 'Tom'], answer: 1, evidence: 'Part 3: Tom: "Then I\'ll look for some research articles".' },
    { id: 29, type: 'mcq', text: 'Making the slides', options: ['Sophie', 'Tom'], answer: 0, evidence: 'Part 3: Tom: "Could you?" — Sophie: "Fine."' },
    { id: 30, type: 'mcq', text: 'Preparing the handout', options: ['Sophie', 'Tom'], answer: 1, evidence: 'Part 3: Sophie: "Then you can prepare the handout."' },
    // Part 4
    { id: 31, type: 'fill', text: 'The potato was first grown in the ______ mountains.', answers: ['andes'], evidence: 'Part 4: "first grown in the Andes mountains".' },
    { id: 32, type: 'fill', text: 'Potatoes were preserved by freezing them and ______ them in the sun.', answers: ['drying'], evidence: 'Part 4: "freezing them at night and drying them in the sun".' },
    { id: 33, type: 'fill', text: 'At first, Europeans were ______ of the potato.', answers: ['suspicious'], evidence: 'Part 4: "At first, Europeans were suspicious of it."' },
    { id: 34, type: 'fill', text: 'In some areas it was used mainly to feed ______.', answers: ['animals'], evidence: 'Part 4: "it was used mainly to feed animals".' },
    { id: 35, type: 'fill', text: 'Parmentier had eaten potatoes as a ______ of war.', answers: ['prisoner'], evidence: 'Part 4: "who had eaten potatoes as a prisoner of war".' },
    { id: 36, type: 'fill', text: 'He placed ______ around a field of potatoes.', answers: ['guards'], evidence: 'Part 4: "he placed guards around a field of potatoes".' },
    { id: 37, type: 'fill', text: 'The potato could be grown in poor ______.', answers: ['soil'], evidence: 'Part 4: "it could be grown in poor soil".' },
    { id: 38, type: 'fill', text: 'In Ireland in the 1840s, a ______ destroyed the harvest.', answers: ['disease'], evidence: 'Part 4: "a disease destroyed the potato harvest".' },
    { id: 39, type: 'fill', text: 'The largest producer today is ______.', answers: ['china'], evidence: 'Part 4: "China is now the largest producer".' },
    { id: 40, type: 'fill', text: 'New varieties should resist disease and survive ______.', answers: ['drought'], evidence: 'Part 4: "resist disease and survive drought".' },
  ],
};
