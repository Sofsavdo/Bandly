import type { Word } from './vocab';

// A2 9–10 va B1 9–10-bo'limlar (lessons/midplus.ts) darslaridagi yangi so'zlar. Ta'rif va misollar original.
const g = (word: string, pos: string, uz: string, def: string, example: string, level: Word['level'] | 'C2'): Word =>
  ({ id: `gn-${word.toLowerCase().replace(/[^a-z]+/g, '-')}`, word, pos, uz, def, example, topic: 'General English', level: level === 'C2' ? 'C1' : level });

export const newWordsB: Word[] = [
  // ---------- A2 ----------
  g('bridge', 'n', 'ko‘prik', 'a structure that is built over a river or road so that people can cross it', 'We walked across the old bridge to the market.', 'A2'),
  g('path', 'n', 'so‘qmoq, yo‘lak', 'a narrow way for walking, often through a park or the countryside', 'Follow this path and you will see the lake.', 'A2'),
  g('hill', 'n', 'tepalik', 'an area of high land, smaller than a mountain', 'Our house is at the top of a small hill.', 'A2'),
  g('forest', 'n', 'o‘rmon', 'a large area of land covered with trees', 'There are wild animals in this forest.', 'A2'),
  g('climb', 'v', 'chiqmoq, tirmashib chiqmoq', 'to go up something, often using your hands and feet', 'The children love to climb trees in the garden.', 'A2'),
  g('map', 'n', 'xarita', 'a drawing of an area that shows roads, rivers, towns etc.', 'Can you find our street on the map?', 'A2'),
  g('signal', 'n', 'aloqa (telefon signali)', 'the electronic waves that let a phone or radio work', 'There is no signal in the mountains, so I can’t call you.', 'A2'),
  g('fog', 'n', 'tuman', 'thick cloud near the ground that makes it difficult to see', 'The plane was late because of the fog.', 'A2'),
  g('everyone', 'pron', 'hamma, har bir kishi', 'every person', 'Everyone in my class has a smartphone.', 'A2'),
  g('nothing', 'pron', 'hech narsa', 'not anything', 'There is nothing in the fridge — let’s go shopping.', 'A2'),
  g('somewhere', 'adv', 'qayerdadir, biror joyda', 'in or to a place that you do not know or do not name', 'I left my glasses somewhere in this room.', 'A2'),
  g('nobody', 'pron', 'hech kim', 'no person', 'Nobody answered the phone, so I left a message.', 'A2'),
  g('charger', 'n', 'quvvatlagich (zaryadlovchi)', 'a device that puts electricity into the battery of a phone or laptop', 'I forgot my phone charger at home.', 'A2'),
  g('of course', 'phr', 'albatta', 'used to say yes politely, or to show that something is not surprising', 'Could I sit here? — Of course.', 'A2'),
  g('repeat', 'v', 'takrorlamoq', 'to say or do something again', 'Could you repeat the question, please?', 'A2'),
  g('message', 'n', 'xabar', 'a short piece of written or spoken information that you send to someone', 'I sent you a message this morning.', 'A2'),
  g('call back', 'phr', 'qayta qo‘ng‘iroq qilmoq', 'to phone someone again, or to phone someone who phoned you', 'I’m busy now — I’ll call back later.', 'A2'),
  g('hold on', 'phr', 'kutib turmoq (telefonda)', 'to wait for a short time, especially on the phone', 'Hold on, please. I’ll get my brother.', 'A2'),
  g('hang up', 'phr', 'go‘shakni qo‘ymoq', 'to end a phone call', 'Please don’t hang up — let me explain.', 'A2'),
  g('proud', 'adj', 'faxrlanuvchi, g‘ururli', 'feeling pleased about something that you or someone close to you has done', 'My parents are proud of my exam results.', 'A2'),
  g('worried', 'adj', 'xavotirdagi', 'unhappy because you think something bad may happen', 'I’m worried about my little brother — he’s not home yet.', 'A2'),
  g('afraid', 'adj', 'qo‘rqqan', 'feeling fear; frightened', 'My sister is afraid of spiders.', 'A2'),
  g('famous', 'adj', 'mashhur', 'known by a lot of people', 'Bukhara is famous for its old mosques.', 'A2'),
  // ---------- B1 ----------
  g('point', 'n', 'fikr, mulohaza (bahsda)', 'an idea or opinion that someone gives in a discussion', 'That’s a good point — I didn’t think of that.', 'B1'),
  g('exactly', 'adv', 'aynan; xuddi shunday', 'used to agree strongly with what someone has just said', 'So we should leave before the traffic starts? — Exactly.', 'B1'),
  g('definitely', 'adv', 'albatta, shubhasiz', 'without any doubt; certainly', 'I’ll definitely come to your wedding.', 'B1'),
  g('because', 'conj', 'chunki, …gani uchun', 'used to give the reason for something', 'I stayed at home because I had a cold.', 'B1'),
  g('hurry', 'v', 'shoshilmoq', 'to do something or go somewhere quickly because there is not much time', 'Hurry up! The film starts in five minutes.', 'B1'),
  g('ought to', 'modal', '…ishi kerak (maslahat)', 'used to say what is the right or sensible thing to do', 'You ought to tell your teacher about the problem.', 'B1'),
  g('email', 'n', 'elektron xat (e-mail)', 'a message that you send from one computer or phone to another', 'Thanks for your email — I’ll reply tonight.', 'B1'),
  g('hear from', 'phr', '…dan xabar olmoq', 'to get a letter, email, phone call etc. from someone', 'It was great to hear from you after so long.', 'B1'),
];
