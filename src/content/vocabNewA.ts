import type { Word } from './vocab';

// A1 boshlang‘ich (a1-s1, a1-s2) va A1 yakuniy (a1-u9, a1-u10) bo‘limlaridagi yangi so‘zlar. Ta’rif va misollar original.
const g = (word: string, pos: string, uz: string, def: string, example: string, level: Word['level'] | 'C2'): Word =>
  ({ id: `gn-${word.toLowerCase().replace(/[^a-z]+/g, '-')}`, word, pos, uz, def, example, topic: 'General English', level: level === 'C2' ? 'C1' : level });

export const newWordsA: Word[] = [
  // ---------- a1-s1: First steps ----------
  g('alphabet', 'n', 'alifbo', 'all the letters of a language in order', 'The English alphabet has 26 letters.', 'A1'),
  g('letter', 'n', 'harf', 'a sign like A, B or C that we use to write words', 'My name starts with the letter D.', 'A1'),
  g('spell', 'v', 'harflab aytmoq / yozmoq', 'to say or write the letters of a word in the right order', 'Can you spell your surname, please?', 'A1'),
  g('sound', 'n', 'tovush', 'something that you hear', 'The “th” sound is new for many learners.', 'A1'),
  g('ship', 'n', 'kema', 'a very big boat that goes on the sea', 'The ship carries cars to another country.', 'A1'),
  g('sheep', 'n', 'qo‘y', 'a farm animal with soft white wool', 'My grandfather has got ten sheep.', 'A1'),
  g('think', 'v', 'o‘ylamoq', 'to have an idea or opinion in your mind', 'I think English is interesting.', 'A1'),
  g('number', 'n', 'son, raqam', 'a word or sign like 1, 2 or 3', 'What is your phone number?', 'A1'),
  g('thirteen', 'num', 'o‘n uch', 'the number 13', 'My brother is thirteen years old.', 'A1'),
  g('thirty', 'num', 'o‘ttiz', 'the number 30', 'Our teacher is thirty years old.', 'A1'),
  // ---------- a1-s2: First words ----------
  g('hello', 'excl', 'salom', 'a word you say when you meet someone', 'Hello! My name is Aziz.', 'A1'),
  g('please', 'adv', 'iltimos (so‘raganda)', 'a polite word you use when you ask for something', 'Can you help me, please?', 'A1'),
  g('repeat', 'v', 'takrorlamoq', 'to say something again', 'Can you repeat the question, please?', 'A1'),
  g('colour', 'n', 'rang', 'red, blue, green and so on', 'What colour is your bag?', 'A1'),
  g('pen', 'n', 'ruchka', 'a thing you use to write with ink', 'Can I use your pen, please?', 'A1'),
  g('red', 'adj', 'qizil', 'having the colour of blood or a tomato', 'She has got a red umbrella.', 'A1'),
  g('boy', 'n', 'o‘g‘il bola', 'a male child or young man', 'That boy is my cousin.', 'A1'),
  g('girl', 'n', 'qiz bola', 'a female child or young woman', 'The girl in the photo is my sister.', 'A1'),
  // ---------- a1-u9: Clothes, weather and seasons ----------
  g('wear', 'v', 'kiymoq, kiyib yurmoq', 'to have clothes, shoes or glasses on your body', 'I wear a white shirt to work.', 'A1'),
  g('shoes', 'n', 'poyabzal, tufli', 'things you wear on your feet', 'These shoes are very comfortable.', 'A1'),
  g('dress', 'n', 'ko‘ylak (ayollar)', 'a piece of clothing for a woman or girl that covers the body and legs', 'She wears a long dress at weddings.', 'A1'),
  g('sunny', 'adj', 'quyoshli', 'with a lot of light from the sun', 'It is sunny and warm today.', 'A1'),
  g('winter', 'n', 'qish', 'the coldest season of the year', 'In winter it often snows in Tashkent.', 'A1'),
  g('hair', 'n', 'soch', 'the thin threads that grow on your head', 'My sister has got long black hair.', 'A1'),
  g('eye', 'n', 'ko‘z', 'the part of the face that you see with', 'He has got big brown eyes.', 'A1'),
  g('glasses', 'n', 'ko‘zoynak', 'two pieces of glass in a frame that help you see better', 'My teacher wears glasses.', 'A1'),
  // ---------- a1-u10: Getting around ----------
  g('bus', 'n', 'avtobus', 'a big vehicle that carries a lot of passengers along a fixed route', 'I go to work by bus.', 'A1'),
  g('train', 'n', 'poyezd', 'a line of carriages that travels on a railway', 'We go to Samarkand by train.', 'A1'),
  g('on foot', 'phr', 'piyoda (yurib)', 'walking, not using a car or bus', 'The school is near, so I go on foot.', 'A1'),
  g('size', 'n', 'o‘lcham, razmer', 'how big or small something is (small, medium, large)', 'Have you got this shirt in a large size?', 'A1'),
  g('cash', 'n', 'naqd pul', 'money in coins and notes', 'Can I pay in cash?', 'A1'),
  g('card', 'n', 'karta (bank kartasi)', 'a small plastic card that you use to pay', 'I usually pay by card.', 'A1'),
  g('receipt', 'n', 'chek (xarid cheki)', 'a piece of paper that shows what you paid', 'Here is your receipt. Thank you!', 'A1'),
  g('message', 'n', 'xabar', 'a short piece of writing that you send to someone', 'I send my mum a message every day.', 'A1'),
  g('because', 'conj', 'chunki', 'a word that gives the reason for something', 'I am happy because it is Friday.', 'A1'),
  g('but', 'conj', 'lekin, ammo', 'a word that joins two different or opposite ideas', 'I like tea, but I don’t like coffee.', 'A1'),
  g('email', 'n', 'elektron xat', 'a message that you send from a computer or phone', 'Write me an email about your city.', 'A1'),
];
