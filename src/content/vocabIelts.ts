import type { Word } from './vocab';

// IELTS kursi darslaridagi imtihon so'zlari (savol turlari, strategiya). Ta'rif va misollar original.
// id: ie-<so'z>. SRS takrorlash va "juftini top" o'yinlariga qo'shiladi.
const i = (word: string, pos: string, uz: string, def: string, example: string, level: Word['level']): Word =>
  ({ id: `ie-${word.toLowerCase().replace(/[^a-z]+/g, '-')}`, word, pos, uz, def, example, topic: 'IELTS skills', level });

export const ieltsCourseWords: Word[] = [
  // ---------- Reading ----------
  i('passage', 'n', 'matn (o‘qish uchun)', 'a short piece of writing taken from a longer text', 'Read the passage and answer the questions.', 'B1'),
  i('transfer', 'v', 'ko‘chirmoq (javoblarni)', 'to move information from one place to another', 'You must transfer your answers to the answer sheet.', 'B1'),
  i('blank', 'n', 'bo‘sh joy', 'an empty space where something should be written', 'Do not leave any blank on your answer sheet.', 'A2'),
  i('band score', 'n', 'IELTS bali (band)', 'a result on the IELTS scale from 0 to 9', 'She needs a band score of 6.5 for university.', 'B1'),
  i('skim', 'v', 'tez ko‘zdan kechirmoq', 'to read quickly to get the general idea', 'Skim the article before you read the questions.', 'B1'),
  i('scan', 'v', 'aniq narsani qidirib o‘qimoq', 'to look quickly through a text for a particular piece of information', 'Scan the timetable for the departure time.', 'B1'),
  i('main idea', 'n', 'asosiy g‘oya', 'the most important point of a text or paragraph', 'The main idea of the paragraph is in the first sentence.', 'A2'),
  i('key word', 'n', 'kalit so‘z', 'an important word that helps you find information', 'Underline the key word in each question.', 'A2'),
  i('synonym', 'n', 'sinonim, ma’nodosh so‘z', 'a word with the same or nearly the same meaning as another', '“Big” is a synonym of “large”.', 'B1'),
  i('purchase', 'v', 'sotib olmoq (rasmiy)', 'to buy something (formal)', 'Tickets can be purchased online.', 'B2'),
  i('statement', 'n', 'da’vo, gap (tekshiriladigan)', 'a sentence that says something is true', 'Decide if each statement agrees with the text.', 'B1'),
  i('contradict', 'v', 'zid bo‘lmoq', 'to say the opposite of something', 'The second report contradicts the first one.', 'B2'),
  i('not given', 'phr', 'berilmagan (matnda yo‘q)', 'used when a text gives no information about something', 'If the text says nothing about it, the answer is not given.', 'B1'),
  i('information', 'n', 'ma’lumot', 'facts or details about something', 'The leaflet has information about bus times.', 'A2'),
  i('word limit', 'n', 'so‘z chegarasi', 'the largest number of words you may write', 'Check the word limit before you write your answer.', 'B1'),
  i('spelling', 'n', 'imlo', 'the way a word is written with the correct letters', 'Wrong spelling loses marks in IELTS.', 'A2'),
  i('instruction', 'n', 'ko‘rsatma', 'information that tells you how to do something', 'Read every instruction carefully.', 'A2'),
  i('heading', 'n', 'abzats sarlavhasi', 'a title at the top of a paragraph or section', 'Choose the correct heading for paragraph B.', 'B1'),
  i('summarise', 'v', 'qisqacha ifodalamoq', 'to give the main points in a few words', 'Can you summarise the article in two sentences?', 'B2'),
  i('detail', 'n', 'tafsilot', 'a small fact or piece of information', 'Do not choose a heading because of one detail.', 'B1'),
  i('overall', 'adj', 'umumiy, butun holda', 'considering everything; in general', 'The overall trend is clear from the chart.', 'B2'),
  i('view', 'n', 'nuqtai nazar, fikr', 'an opinion or belief about something', 'In my view, the plan is too expensive.', 'B1'),
  i('writer', 'n', 'muallif (matn yozgan)', 'the person who wrote a text', 'The writer believes cities need more parks.', 'A2'),
  i('hedging', 'n', 'ehtiyotkor ifoda', 'careful language that makes a claim less certain', 'Words like “may” and “might” are hedging.', 'C1'),
  i('distractor', 'n', 'chalg‘ituvchi variant', 'a wrong option designed to look correct', 'This option is a distractor: it uses words from the text.', 'B2'),
  i('eliminate', 'v', 'chiqarib tashlamoq', 'to remove something because it is wrong or not needed', 'First eliminate the options that are clearly wrong.', 'B2'),
  i('partly', 'adv', 'qisman', 'to some degree but not completely', 'The answer is only partly correct.', 'B1'),
  i('feature', 'n', 'xususiyat, belgi', 'an important or typical part of something', 'The best feature of the phone is its camera.', 'B1'),
  i('definition', 'n', 'ta’rif', 'a statement of the meaning of a word', 'Paragraph D gives a definition of microplastics.', 'B1'),
  i('comparison', 'n', 'taqqoslash', 'looking at how two things are similar or different', 'The paragraph makes a comparison between trains and cars.', 'B1'),
  i('researcher', 'n', 'tadqiqotchi', 'a person who studies a subject to find new facts', 'The researcher tested the idea on 500 students.', 'B1'),
  i('stuck', 'adj', 'qotib qolgan (davom eta olmayotgan)', 'unable to continue with something difficult', 'If you get stuck on a question, move to the next one.', 'B1'),
  i('move on', 'phr', 'davom etmoq, o‘tib ketmoq', 'to start doing the next thing', 'Guess the answer and move on.', 'B1'),
  i('time management', 'n', 'vaqtni boshqarish', 'planning how to use your time well', 'Good time management helps you finish the test.', 'B1'),
  i('come back', 'phr', 'qaytib kelmoq', 'to return to a place or task', 'Mark the hard question and come back to it later.', 'A2'),
];
