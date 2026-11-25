import type { ListeningTest } from './types';

// CEFR Multilevel uslubidagi Listening mashq testi 9: 35 savol, 45 daqiqa (hajm va vaqt — examFormats.ts).
// Ichki qismlar Sellzen'niki (cefrListening1 bilan bir xil). Original mashq skripti; metodist tekshiruvini kutmoqda.
// Ovozlar: A — Sarah (UK), B — Alistair (UK), C — Hope, D — Max.
type L = { speaker: 'A' | 'B' | 'C' | 'D'; text: string };

const P1: L[] = [
  { speaker: 'C', text: 'One. Excuse me, where is the nearest pharmacy?' },
  { speaker: 'B', text: "There's one in the shopping centre, on the ground floor, next to the supermarket." },
  { speaker: 'A', text: 'Two. Do you want to watch a film tonight?' },
  { speaker: 'D', text: "I'm too tired. Let's just order some food and go to bed early." },
  { speaker: 'D', text: 'Three. How long have you been learning Korean?' },
  { speaker: 'C', text: 'About two years. I started when I got a job with a Korean company.' },
  { speaker: 'B', text: 'Four. Ladies and gentlemen, due to strong winds, the boat trip to the island has been cancelled. Tickets will be refunded at the ticket office.' },
  { speaker: 'A', text: 'Five. Can I pay by card?' },
  { speaker: 'B', text: "I'm afraid our card machine isn't working today. There's a cash machine just across the street." },
  { speaker: 'C', text: "Six. What's wrong with your phone?" },
  { speaker: 'D', text: 'I dropped it yesterday and now the screen is cracked. It still works, though.' },
  { speaker: 'D', text: 'Seven. Are you going to the football match on Saturday?' },
  { speaker: 'A', text: "I was, but the tickets sold out in an hour. I'll watch it on TV at my uncle's." },
  { speaker: 'B', text: 'Eight. Your appointment is at four. Please arrive ten minutes early to fill in a form.' },
  { speaker: 'C', text: 'Thank you. I will.' },
];

const P2: L[] = [
  { speaker: 'B', text: 'Welcome, everyone. I’d like to tell you about our new university library, which opened last month. The building has five floors and space for more than eight hundred students.' },
  { speaker: 'B', text: 'The ground floor has the café and an exhibition area. Group study rooms are on the first and second floors, and the top two floors are silent study areas.' },
  { speaker: 'B', text: 'The library is open twenty-four hours a day during exam periods. At other times, it closes at midnight.' },
  { speaker: 'B', text: 'Students can borrow up to fifteen books at a time. Group study rooms can be booked for a maximum of three hours per day using the library app.' },
  { speaker: 'B', text: 'Finally, if you need help finding books or using databases, our librarians run short training sessions every Monday at one o’clock.' },
];

const P3: L[] = [
  { speaker: 'C', text: "Max, my colleague's dog has had puppies, and she's looking for homes for them. Shall we take one?" },
  { speaker: 'D', text: "I'd love a dog, but who would look after it during the day? We both work." },
  { speaker: 'C', text: 'I work from home three days a week now. And my mother lives nearby; she could take it for walks on the other days.' },
  { speaker: 'D', text: 'That might work. But our flat is quite small.' },
  { speaker: 'C', text: "These dogs don't grow very big. And there's a park five minutes away." },
  { speaker: 'D', text: 'What about holidays?' },
  { speaker: 'C', text: "My sister has a garden. She said she'd look after it when we travel." },
  { speaker: 'D', text: "You've thought of everything! What about the cost? Food, the vet and so on?" },
  { speaker: 'C', text: "I've calculated about fifty dollars a month. We can manage that." },
  { speaker: 'D', text: "OK. Let's go and see the puppies at the weekend before we decide." },
];

const P4: L[] = [
  { speaker: 'A', text: 'My guest today is Hope, who recently became one of the first female pilots at her airline. Hope, when did you decide to become a pilot?' },
  { speaker: 'C', text: 'Quite late, actually. I studied economics and worked in a bank for five years. Then I took a short flight in a small plane for my thirtieth birthday, and I knew immediately that I wanted to fly.' },
  { speaker: 'A', text: 'Was the training difficult?' },
  { speaker: 'C', text: 'Very. It took two years, and there was a lot of physics and mathematics. But the hardest part was the simulator tests, where they give you emergencies like engine failure.' },
  { speaker: 'A', text: 'How did your family react?' },
  { speaker: 'C', text: 'My mother was worried about safety, but my father was very supportive. He even helped me pay for part of the training.' },
  { speaker: 'A', text: 'What do you enjoy most?' },
  { speaker: 'C', text: "The view from the cockpit at sunrise. It's different every time." },
  { speaker: 'A', text: "And what's challenging?" },
  { speaker: 'C', text: "The irregular hours. Sometimes I start work at four in the morning. It's hard to plan time with friends." },
  { speaker: 'A', text: 'What would you say to young women who want to fly?' },
  { speaker: 'C', text: "Don't let anyone tell you it's not a job for women. Work hard on maths and physics at school, and visit a flying club if you can." },
];

const P5: L[] = [
  { speaker: 'A', text: "Today we're going to look at the history of glasses. Before glasses existed, people with poor eyesight had few options. Some scholars used polished stones to make letters look bigger when reading." },
  { speaker: 'A', text: 'The first glasses appeared in Italy at the end of the thirteenth century. They had no arms, so they had to be held in front of the eyes or balanced on the nose.' },
  { speaker: 'A', text: 'These early glasses only helped people who had difficulty seeing things close up, a problem that often comes with age. Glasses for people who could not see things far away appeared about two hundred years later.' },
  { speaker: 'A', text: 'Arms that rest on the ears were introduced in London in the eighteenth century, which made glasses much more comfortable.' },
  { speaker: 'A', text: "In the twentieth century, contact lenses were developed, and more recently, laser surgery. Even so, glasses remain the most common way of correcting eyesight. Next time, we'll look at the history of the hearing aid." },
];

export const cefrListening9: ListeningTest = {
  id: 'cefr-listening-9',
  exam: 'cefr',
  level: 'B2',
  title: 'CEFR Multilevel uslubida Listening — mashq testi 9',
  minutes: 45,
  names: { A: 'Sarah', B: 'Alistair', C: 'Hope', D: 'Max' },
  context: '5 qism: 1) sakkizta qisqa suhbat; 2) yangi universitet kutubxonasi haqida e’lon; 3) kuchukcha olish haqida suhbat; 4) uchuvchi qiz bilan intervyu; 5) ko‘zoynak tarixi haqida ma’ruza.',
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
    { id: 1, type: 'mcq', text: 'Where is the pharmacy?', options: ['Next to the supermarket', 'On the first floor', 'Opposite the shopping centre'], answer: 0, evidence: 'Part 1, 1: "on the ground floor, next to the supermarket".' },
    { id: 2, type: 'mcq', text: 'What will they do tonight?', options: ['Go to the cinema', 'Order food and go to bed early', 'Cook dinner together'], answer: 1, evidence: 'Part 1, 2: "Let\'s just order some food and go to bed early."' },
    { id: 3, type: 'mcq', text: 'Why did the woman start learning Korean?', options: ['She visited Korea.', 'She likes Korean films.', 'She got a job with a Korean company.'], answer: 2, evidence: 'Part 1, 3: "I started when I got a job with a Korean company."' },
    { id: 4, type: 'mcq', text: 'Why has the boat trip been cancelled?', options: ['Strong winds', 'Heavy rain', 'A problem with the boat'], answer: 0, evidence: 'Part 1, 4: "due to strong winds, the boat trip … has been cancelled".' },
    { id: 5, type: 'mcq', text: 'What should the customer do?', options: ['Pay by card later', 'Get cash from a machine across the street', 'Come back tomorrow'], answer: 1, evidence: 'Part 1, 5: "There\'s a cash machine just across the street."' },
    { id: 6, type: 'mcq', text: 'What is wrong with the man’s phone?', options: ['It doesn’t work.', 'The battery is dead.', 'The screen is cracked.'], answer: 2, evidence: 'Part 1, 6: "now the screen is cracked. It still works, though."' },
    { id: 7, type: 'mcq', text: 'Where will the woman watch the match?', options: ['At the stadium', 'At her uncle’s', 'In a café'], answer: 1, evidence: 'Part 1, 7: "I\'ll watch it on TV at my uncle\'s."' },
    { id: 8, type: 'mcq', text: 'What time should the woman arrive?', options: ['At 3.50', 'At 4.00', 'At 4.10'], answer: 0, evidence: 'Part 1, 8: "Your appointment is at four. Please arrive ten minutes early".' },
    { id: 9, type: 'fill', text: 'Number of floors: ______', answers: ['5', 'five'], evidence: 'Part 2: "The building has five floors".' },
    { id: 10, type: 'fill', text: 'Space for more than ______ students', answers: ['800', 'eight hundred'], evidence: 'Part 2: "space for more than eight hundred students".' },
    { id: 11, type: 'fill', text: 'Silent study: the top ______ floors', answers: ['2', 'two'], evidence: 'Part 2: "the top two floors are silent study areas".' },
    { id: 12, type: 'fill', text: 'Closing time outside exam periods: ______', answers: ['midnight', '12'], evidence: 'Part 2: "At other times, it closes at midnight."' },
    { id: 13, type: 'fill', text: 'Students can borrow up to ______ books', answers: ['15', 'fifteen'], evidence: 'Part 2: "borrow up to fifteen books at a time".' },
    { id: 14, type: 'fill', text: 'Training sessions: every ______ at 1 pm', answers: ['monday'], evidence: 'Part 2: "every Monday at one o’clock".' },
    { id: 15, type: 'mcq', text: 'What is Max’s first concern?', options: ['The cost of a dog', 'Who would look after it during the day', 'The size of the flat'], answer: 1, evidence: 'Part 3: "who would look after it during the day? We both work."' },
    { id: 16, type: 'mcq', text: 'How often does Hope work from home?', options: ['Three days a week', 'Every day', 'Once a week'], answer: 0, evidence: 'Part 3: "I work from home three days a week now."' },
    { id: 17, type: 'mcq', text: 'Who could walk the dog on the other days?', options: ['A neighbour', 'Hope’s sister', 'Hope’s mother'], answer: 2, evidence: 'Part 3: "my mother lives nearby; she could take it for walks".' },
    { id: 18, type: 'mcq', text: 'What is near their flat?', options: ['A park', 'A vet', 'A pet shop'], answer: 0, evidence: 'Part 3: "there\'s a park five minutes away".' },
    { id: 19, type: 'mcq', text: 'Who would look after the dog during holidays?', options: ['Hope’s colleague', 'Hope’s sister', 'A dog hotel'], answer: 1, evidence: 'Part 3: "My sister has a garden. She said she\'d look after it".' },
    { id: 20, type: 'mcq', text: 'What will they do at the weekend?', options: ['Buy food for the dog', 'Visit the vet', 'Go and see the puppies'], answer: 2, evidence: 'Part 3: "Let\'s go and see the puppies at the weekend before we decide."' },
    { id: 21, type: 'mcq', text: 'What did Hope do before becoming a pilot?', options: ['She worked in a bank.', 'She was a flight attendant.', 'She taught physics.'], answer: 0, evidence: 'Part 4: "I studied economics and worked in a bank for five years."' },
    { id: 22, type: 'mcq', text: 'What made her decide to fly?', options: ['A school trip to an airport', 'A short flight for her birthday', 'A film about pilots'], answer: 1, evidence: 'Part 4: "I took a short flight in a small plane for my thirtieth birthday".' },
    { id: 23, type: 'mcq', text: 'How long did the training take?', options: ['One year', 'Five years', 'Two years'], answer: 2, evidence: 'Part 4: "It took two years".' },
    { id: 24, type: 'mcq', text: 'What was the hardest part of the training?', options: ['The simulator tests', 'The physics lessons', 'The medical check'], answer: 0, evidence: 'Part 4: "the hardest part was the simulator tests".' },
    { id: 25, type: 'mcq', text: 'Who helped pay for her training?', options: ['Her mother', 'Her father', 'The airline'], answer: 1, evidence: 'Part 4: "He even helped me pay for part of the training."' },
    { id: 26, type: 'mcq', text: 'What does she enjoy most?', options: ['Visiting new cities', 'Meeting passengers', 'The view at sunrise'], answer: 2, evidence: 'Part 4: "The view from the cockpit at sunrise."' },
    { id: 27, type: 'mcq', text: 'What is challenging about the job?', options: ['The irregular hours', 'The low salary', 'The bad weather'], answer: 0, evidence: 'Part 4: "The irregular hours."' },
    { id: 28, type: 'mcq', text: 'What does she advise young women?', options: ['To study economics first', 'To work hard on maths and physics', 'To work in a bank'], answer: 1, evidence: 'Part 4: "Work hard on maths and physics at school".' },
    { id: 29, type: 'fill', text: 'Some scholars used polished ______ to make letters bigger.', answers: ['stones'], evidence: 'Part 5: "Some scholars used polished stones".' },
    { id: 30, type: 'fill', text: 'The first glasses appeared in ______.', answers: ['italy'], evidence: 'Part 5: "The first glasses appeared in Italy".' },
    { id: 31, type: 'fill', text: 'Early glasses had no ______.', answers: ['arms'], evidence: 'Part 5: "They had no arms".' },
    { id: 32, type: 'fill', text: 'Difficulty seeing things close up often comes with ______.', answers: ['age'], evidence: 'Part 5: "a problem that often comes with age".' },
    { id: 33, type: 'fill', text: 'Arms resting on the ears were introduced in ______.', answers: ['london'], evidence: 'Part 5: "introduced in London in the eighteenth century".' },
    { id: 34, type: 'fill', text: 'Glasses are still the most ______ way of correcting eyesight.', answers: ['common'], evidence: 'Part 5: "glasses remain the most common way of correcting eyesight".' },
    { id: 35, type: 'fill', text: 'Next time: the history of the hearing ______.', answers: ['aid'], evidence: 'Part 5: "the history of the hearing aid".' },
  ],
};
