import type { ListeningTest } from './types';

// IELTS zinapoyasi uchun Listening mini-testlari: IELTS savol turlari (forma, test), lekin nutq va lug'at darajaga mos.
// Original skriptlar (Sellzen). Rasmiy IELTS materiali emas. Audio: tayyor bo'lguncha brauzer ovozi.

export const listening6: ListeningTest = {
  id: 'listening-6', level: 'A2', title: 'Listening mini-test 6: Joining a library', minutes: 7,
  names: { A: 'Librarian', B: 'Madina' }, context: 'Kutubxonaga a’zo bo‘lish haqida qisqa suhbat (A2 daraja).',
  script: [
    { speaker: 'A', text: 'Hello. Can I help you?' },
    { speaker: 'B', text: 'Yes, please. I want to join the library. What do I need to do?' },
    { speaker: 'A', text: 'It is easy. I just need your name, address and phone number. What is your name?' },
    { speaker: 'B', text: 'Madina Yusupova. That is Y, U, S, U, P, O, V, A.' },
    { speaker: 'A', text: 'Thank you. And your address?' },
    { speaker: 'B', text: 'Forty-two Navoi Street.' },
    { speaker: 'A', text: 'Forty-two Navoi Street. Good. The card is free for students. Are you a student?' },
    { speaker: 'B', text: 'Yes, I am a student at the medical college.' },
    { speaker: 'A', text: 'Then the card is free. You can borrow six books at one time, and you can keep them for three weeks.' },
    { speaker: 'B', text: 'Three weeks. And what time does the library open?' },
    { speaker: 'A', text: 'We open at nine in the morning and close at seven in the evening. On Saturdays we close at two. We are closed on Sundays.' },
    { speaker: 'B', text: 'Can I use the computers here?' },
    { speaker: 'A', text: 'Yes, the computer room is on the second floor. You can use a computer for one hour a day.' },
    { speaker: 'B', text: 'Great. Thank you very much.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–8: Choose the correct letter.', questionIds: [7, 8] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Family name: ______', answers: ['yusupova'], evidence: '"Y, U, S, U, P, O, V, A".' },
    { id: 2, type: 'fill', text: 'Address: ______ Navoi Street', answers: ['42', 'forty-two', 'forty two'], evidence: '"Forty-two Navoi Street."' },
    { id: 3, type: 'fill', text: 'Number of books at one time: ______', answers: ['6', 'six'], evidence: '"You can borrow six books".' },
    { id: 4, type: 'fill', text: 'Keep books for: ______ weeks', answers: ['3', 'three'], evidence: '"you can keep them for three weeks".' },
    { id: 5, type: 'fill', text: 'Saturday closing time: ______ o’clock', answers: ['2', 'two'], evidence: '"On Saturdays we close at two."' },
    { id: 6, type: 'fill', text: 'Computer room: ______ floor', answers: ['second', '2nd', '2'], evidence: '"on the second floor".' },
    { id: 7, type: 'mcq', text: 'Why is the library card free for Madina?', options: ['She is a student.', 'She lives near the library.', 'It is her first visit.'], answer: 0, evidence: '"The card is free for students."' },
    { id: 8, type: 'mcq', text: 'How long can she use a computer each day?', options: ['Thirty minutes', 'One hour', 'Two hours'], answer: 1, evidence: '"for one hour a day".' },
  ],
};

export const listening7: ListeningTest = {
  id: 'listening-7', level: 'A2', title: 'Listening mini-test 7: A trip to Chimgan', minutes: 7,
  names: { A: 'Guide', B: 'Tourist' }, context: 'Tog‘ga ekskursiya haqida ma’lumot (A2 daraja).',
  script: [
    { speaker: 'A', text: 'Good morning, everyone, and welcome to our day trip to Chimgan. My name is Botir and I am your guide today.' },
    { speaker: 'A', text: 'The bus leaves at eight thirty from the front of the hotel, so please be there ten minutes early.' },
    { speaker: 'A', text: 'The journey takes about two hours. We will stop once at a small village for tea.' },
    { speaker: 'B', text: 'Excuse me, do we need to bring lunch?' },
    { speaker: 'A', text: 'No, lunch is included. We will eat at a restaurant near the lake at one o’clock. But please bring water and a warm jacket, because it is cold in the mountains.' },
    { speaker: 'B', text: 'Can we go up the mountain by cable car?' },
    { speaker: 'A', text: 'Yes. The cable car ticket is not in the price. It costs eighty thousand som, and you pay at the station.' },
    { speaker: 'B', text: 'What time do we come back?' },
    { speaker: 'A', text: 'We leave Chimgan at five and arrive at the hotel at about seven in the evening.' },
    { speaker: 'A', text: 'One more thing: please do not walk far from the group. If you get lost, call me. My number is on your ticket.' },
  ],
  groups: [
    { instruction: 'Questions 1–5: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–8: Choose the correct letter.', questionIds: [6, 7, 8] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Guide’s name: ______', answers: ['botir'], evidence: '"My name is Botir".' },
    { id: 2, type: 'fill', text: 'The bus leaves at ______', answers: ['8:30', '8.30', 'eight thirty', 'half past eight'], evidence: '"The bus leaves at eight thirty".' },
    { id: 3, type: 'fill', text: 'Journey time: about ______ hours', answers: ['2', 'two'], evidence: '"The journey takes about two hours."' },
    { id: 4, type: 'fill', text: 'Lunch at a restaurant near the ______', answers: ['lake'], evidence: '"at a restaurant near the lake".' },
    { id: 5, type: 'fill', text: 'Cable car ticket: ______ thousand som', answers: ['80', 'eighty'], evidence: '"It costs eighty thousand som".' },
    { id: 6, type: 'mcq', text: 'What should tourists bring?', options: ['Lunch and a camera', 'Water and a warm jacket', 'Money for tea'], answer: 1, evidence: '"please bring water and a warm jacket".' },
    { id: 7, type: 'mcq', text: 'What time will they arrive back at the hotel?', options: ['At five', 'At six', 'At about seven'], answer: 2, evidence: '"arrive at the hotel at about seven in the evening".' },
    { id: 8, type: 'mcq', text: 'Where is the guide’s phone number?', options: ['On the ticket', 'On the bus', 'At the hotel desk'], answer: 0, evidence: '"My number is on your ticket."' },
  ],
};

export const listening8: ListeningTest = {
  id: 'listening-8', level: 'B1', title: 'Listening mini-test 8: Volunteering at a festival', minutes: 9,
  names: { A: 'Coordinator', B: 'Jasur' }, context: 'Festivalda ko‘ngilli bo‘lib ishlash haqida suhbat (B1 daraja).',
  script: [
    { speaker: 'A', text: 'Hi, thanks for coming in. So you’re interested in volunteering at the food festival this year?' },
    { speaker: 'B', text: 'Yes. I saw the advert online. I’ve never volunteered before, but I’d really like to try.' },
    { speaker: 'A', text: 'That’s no problem — about half of our volunteers are new each year. The festival runs for three days, from the fourteenth to the sixteenth of September.' },
    { speaker: 'B', text: 'Do I have to work all three days?' },
    { speaker: 'A', text: 'No, we ask for a minimum of two shifts. Each shift is five hours. The morning shift starts at nine, and the afternoon shift starts at two.' },
    { speaker: 'B', text: 'I have classes on the Friday, so the weekend would be better for me.' },
    { speaker: 'A', text: 'Fine. There are a few different jobs. Some volunteers work at the information desk, some help with recycling, and some sell tickets for the cooking competitions.' },
    { speaker: 'B', text: 'The information desk sounds interesting. I speak Russian and some English, so I could help visitors from abroad.' },
    { speaker: 'A', text: 'Perfect, we need people with languages there. Volunteers don’t get paid, but you’ll get a free T-shirt, meals during your shift, and a certificate at the end.' },
    { speaker: 'B', text: 'A certificate would be useful for my CV. Is there any training?' },
    { speaker: 'A', text: 'Yes, there’s a short training session on the Wednesday before the festival, at six in the evening, in the town hall. It lasts about ninety minutes.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–10: Choose the correct letter.', questionIds: [7, 8, 9, 10] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Festival dates: 14th–______ September', answers: ['16th', '16', 'sixteenth'], evidence: '"from the fourteenth to the sixteenth of September".' },
    { id: 2, type: 'fill', text: 'Minimum number of shifts: ______', answers: ['2', 'two'], evidence: '"a minimum of two shifts".' },
    { id: 3, type: 'fill', text: 'Length of each shift: ______ hours', answers: ['5', 'five'], evidence: '"Each shift is five hours."' },
    { id: 4, type: 'fill', text: 'Afternoon shift starts at: ______', answers: ['2', 'two', '2 pm', '2:00', 'two o’clock'], evidence: '"the afternoon shift starts at two".' },
    { id: 5, type: 'fill', text: 'Chosen job: ______ desk', answers: ['information'], evidence: '"The information desk sounds interesting."' },
    { id: 6, type: 'fill', text: 'Training place: the ______', answers: ['town hall'], evidence: '"in the town hall".' },
    { id: 7, type: 'mcq', text: 'What does the coordinator say about new volunteers?', options: ['They must have experience.', 'About half are new each year.', 'They only work one shift.', 'They sell tickets.'], answer: 1, evidence: '"about half of our volunteers are new each year".' },
    { id: 8, type: 'mcq', text: 'Why can’t Jasur work on Friday?', options: ['He has a job.', 'He has classes.', 'He is travelling.', 'He is ill.'], answer: 1, evidence: '"I have classes on the Friday".' },
    { id: 9, type: 'mcq', text: 'Which of these do volunteers NOT receive?', options: ['A T-shirt', 'Meals', 'Payment', 'A certificate'], answer: 2, evidence: '"Volunteers don’t get paid".' },
    { id: 10, type: 'mcq', text: 'How long is the training session?', options: ['About 30 minutes', 'About an hour', 'About 90 minutes', 'Two hours'], answer: 2, evidence: '"It lasts about ninety minutes."' },
  ],
};

export const listening9: ListeningTest = {
  id: 'listening-9', level: 'B2', title: 'Listening mini-test 9: A talk on urban gardens', minutes: 9,
  names: { A: 'Speaker' }, context: 'Shahar bog‘lari haqida ma’ruza (B2 daraja, IELTS Part 4 uslubida).',
  script: [
    { speaker: 'A', text: 'Good afternoon. Today I want to talk about urban gardens — small areas of land in cities where residents grow their own fruit and vegetables.' },
    { speaker: 'A', text: 'Although they are often seen as a modern trend, community gardens have a long history. During periods of food shortage in the twentieth century, many governments actually encouraged people to grow food in parks and empty plots.' },
    { speaker: 'A', text: 'Today the motivation is rather different. In a recent survey of garden members in three European cities, the most common reason given was not saving money, but meeting neighbours. Food production came only third, after improving mental health.' },
    { speaker: 'A', text: 'The environmental benefits are real but should not be exaggerated. Gardens absorb rainwater, which reduces the risk of flooding, and they provide habitats for insects such as bees. However, the amount of food they produce is small compared with the needs of a city.' },
    { speaker: 'A', text: 'One challenge is soil quality. Land in cities may contain metals from old industries, so many projects grow vegetables in raised beds filled with clean soil rather than directly in the ground.' },
    { speaker: 'A', text: 'Another challenge is security of tenure — in other words, how long a group can stay on the land. Many gardens are created on sites that are waiting for development, and after a few years the land is sold. Successful projects therefore try to sign long-term agreements with the city council.' },
    { speaker: 'A', text: 'Finally, research suggests that gardens work best when they are designed with local people rather than for them. Projects that involved residents from the planning stage had far more members after five years.' },
  ],
  groups: [
    { instruction: 'Questions 1–5: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–10: Choose the correct letter.', questionIds: [6, 7, 8, 9, 10] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Main reason people join (survey): meeting ______', answers: ['neighbours', 'neighbors'], evidence: '"the most common reason given was … meeting neighbours".' },
    { id: 2, type: 'fill', text: 'Gardens absorb ______, which reduces flood risk', answers: ['rainwater'], evidence: '"Gardens absorb rainwater".' },
    { id: 3, type: 'fill', text: 'Gardens provide habitats for insects such as ______', answers: ['bees'], evidence: '"insects such as bees".' },
    { id: 4, type: 'fill', text: 'City soil may contain ______ from old industries', answers: ['metals'], evidence: '"may contain metals from old industries".' },
    { id: 5, type: 'fill', text: 'Many projects use raised ______ with clean soil', answers: ['beds'], evidence: '"grow vegetables in raised beds".' },
    { id: 6, type: 'mcq', text: 'What does the speaker say about the history of community gardens?', options: ['They started in the last ten years.', 'Governments once encouraged them.', 'They were banned in parks.', 'They were only found in Europe.'], answer: 1, evidence: '"many governments actually encouraged people to grow food".' },
    { id: 7, type: 'mcq', text: 'In the survey, food production was', options: ['the most common reason.', 'the second reason.', 'the third reason.', 'not mentioned.'], answer: 2, evidence: '"Food production came only third".' },
    { id: 8, type: 'mcq', text: 'What is the speaker’s view of the environmental benefits?', options: ['They are very large.', 'They are real but limited.', 'They do not exist.', 'They are not yet known.'], answer: 1, evidence: '"real but should not be exaggerated".' },
    { id: 9, type: 'mcq', text: 'What does “security of tenure” refer to?', options: ['Protection from theft', 'How long a group can stay on the land', 'The cost of the land', 'Rules about who can join'], answer: 1, evidence: '"how long a group can stay on the land".' },
    { id: 10, type: 'mcq', text: 'Which projects had more members after five years?', options: ['Those in city centres', 'Those designed with residents', 'Those with paid staff', 'Those on development sites'], answer: 1, evidence: '"Projects that involved residents from the planning stage had far more members".' },
  ],
};
