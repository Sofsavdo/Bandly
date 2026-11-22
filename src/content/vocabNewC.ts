import type { Word } from './vocab';

// B2 9–10 va C1 9–10-bo'limlar (src/content/lessons/upperplus.ts) uchun yangi so'zlar. Ta'rif va misollar original.
const g = (word: string, pos: string, uz: string, def: string, example: string, level: Word['level'] | 'C2'): Word =>
  ({ id: `gn-${word.toLowerCase().replace(/[^a-z]+/g, '-')}`, word, pos, uz, def, example, topic: 'General English', level: level === 'C2' ? 'C1' : level });

export const newWordsC: Word[] = [
  // ---------- B2: data and change ----------
  g('steadily', 'adv', 'bir maromda, barqaror', 'gradually and at an even, regular rate', 'The number of online students grew steadily over the decade.', 'B2'),
  g('plummet', 'v', 'keskin tushib ketmoq', 'to fall very quickly and suddenly by a large amount', 'Ticket sales plummeted when the new stadium closed.', 'B2'),
  g('level off', 'phr v', 'barqarorlashmoq (o‘sish yoki tushishdan keyin)', 'to stop rising or falling and stay at the same level', 'After years of growth, house prices began to level off.', 'B2'),
  g('approximately', 'adv', 'taxminan, qariyb', 'close to an exact number but not exactly it', 'Approximately 40% of the workers were under thirty.', 'B2'),
  g('forecast', 'n', 'bashorat, prognoz', 'a statement about what is expected to happen, based on information', 'The latest forecast shows a fall in demand next year.', 'B2'),
  g('decade', 'n', 'o‘n yillik', 'a period of ten years', 'Car ownership doubled over the last decade.', 'B2'),
  // ---------- B2: collocations and word building ----------
  g('make progress', 'phr', 'oldinga siljimoq, yutuqqa erishmoq', 'to improve or move forward towards a goal', 'Learners make progress faster when they practise every day.', 'B2'),
  g('take responsibility', 'phr', 'javobgarlikni o‘z zimmasiga olmoq', 'to accept that something is your duty or your fault', 'Good managers take responsibility for their team’s mistakes.', 'B2'),
  g('have an impact', 'phr', 'kuchli ta’sir qilmoq', 'to have a strong effect on someone or something', 'Small daily habits can have an impact on your health.', 'B2'),
  g('make an effort', 'phr', 'harakat qilmoq, kuch sarflamoq', 'to try hard to do something', 'Try to make an effort to speak only English in class.', 'B2'),
  g('employment', 'n', 'ish bilan bandlik', 'the state of having a paid job; work that is available', 'The new factory will create employment for young people.', 'B2'),
  g('awareness', 'n', 'xabardorlik, ongli bilish', 'knowledge or understanding of a situation or problem', 'There is growing awareness of the dangers of plastic.', 'B2'),
  g('effective', 'adj', 'samarali', 'producing the result that is wanted', 'Regular practice is the most effective way to learn vocabulary.', 'B2'),
  g('careless', 'adj', 'e’tiborsiz, beparvo', 'not taking enough care, so that mistakes happen', 'I lost marks for careless spelling mistakes.', 'B2'),
  g('dishonest', 'adj', 'insofsiz, nohalol', 'not telling the truth or not behaving fairly', 'It is dishonest to copy someone else’s essay.', 'B2'),
  g('irresponsible', 'adj', 'mas’uliyatsiz', 'not thinking about the results of your actions', 'Driving after two hours’ sleep is irresponsible.', 'B2'),
  g('misunderstand', 'v', 'noto‘g‘ri tushunmoq', 'to understand something wrongly', 'Many students misunderstand the question and lose marks.', 'B2'),
  g('overestimate', 'v', 'ortiqcha baholamoq', 'to think that something is bigger, better or more important than it really is', 'We overestimated how many guests would come.', 'B2'),
  // ---------- C1: evidence and argument ----------
  g('findings', 'n pl', 'tadqiqot natijalari', 'the information or conclusions that a study produces', 'The findings indicate a link between sleep and memory.', 'C1'),
  g('flawed', 'adj', 'nuqsonli, kamchilikli', 'containing a mistake or weakness that makes it less valid', 'The survey was flawed because only one city was included.', 'C1'),
  g('inconclusive', 'adj', 'aniq xulosa bermaydigan', 'not leading to a firm conclusion or decision', 'The results of the trial were inconclusive.', 'C1'),
  g('sample', 'n', 'tanlanma (tadqiqot ishtirokchilari)', 'a small group chosen to represent a larger population in a study', 'A sample of 2,000 adults took part in the survey.', 'C1'),
  g('overlook', 'v', 'e’tibordan chetda qoldirmoq', 'to fail to notice or consider something important', 'This argument overlooks the cost to taxpayers.', 'C1'),
  g('counterargument', 'n', 'qarshi dalil', 'an argument that opposes another argument', 'A strong essay addresses the main counterargument.', 'C1'),
  g('valid', 'adj', 'asosli, o‘rinli', 'based on good reasoning or evidence and therefore acceptable', 'Both sides make valid points.', 'C1'),
  g('undermine', 'v', 'putur yetkazmoq, zaiflashtirmoq', 'to make something weaker or less convincing, often gradually', 'One false statistic can undermine the whole report.', 'C1'),
  // ---------- C1: paraphrase and collocation ----------
  g('equivalent', 'n', 'muqobil, teng ma’noli narsa', 'a word, amount or thing that has the same value or meaning as another', '“Purchase” is a more formal equivalent of “buy”.', 'C1'),
  g('rephrase', 'v', 'boshqacha so‘zlar bilan aytmoq', 'to say or write something again using different words', 'If the examiner looks confused, rephrase your answer.', 'C1'),
  g('widely', 'adv', 'keng miqyosda', 'by many people or in many places', 'It is widely believed that the city will host the games.', 'C1'),
  g('deeply', 'adv', 'chuqur, qattiq', 'very much; to a great degree (often with feelings)', 'Local residents are deeply concerned about the new road.', 'C1'),
  g('highly', 'adv', 'juda, yuqori darajada', 'very; to a high degree (often with likely, effective, skilled)', 'It is highly unlikely that the law will change.', 'C1'),
  g('bitterly', 'adv', 'qattiq (alam, xafagarchilik bilan)', 'in a way that shows strong sadness, anger or disappointment', 'The fans were bitterly disappointed by the result.', 'C1'),
  g('pose a threat', 'phr', 'xavf tug‘dirmoq', 'to be a possible danger to someone or something', 'Rising sea levels pose a threat to coastal cities.', 'C1'),
  g('tackle', 'v', 'hal qilishga kirishmoq', 'to make a determined effort to deal with a difficult problem', 'The government has promised to tackle youth unemployment.', 'C1'),
  g('bridge the gap', 'phr', 'tafovutni qisqartirmoq', 'to reduce the difference between two groups or things', 'Free online courses can help bridge the gap between city and village schools.', 'C1'),
];
