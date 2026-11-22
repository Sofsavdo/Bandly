import type { Word } from './vocab';

// C2 9–10-bo'limlar (src/content/lessons/c2plus.ts) uchun yangi so'zlar. Ta'rif va misollar original.
const g = (word: string, pos: string, uz: string, def: string, example: string, level: Word['level'] | 'C2'): Word =>
  ({ id: `gn-${word.toLowerCase().replace(/[^a-z]+/g, '-')}`, word, pos, uz, def, example, topic: 'General English', level: level === 'C2' ? 'C1' : level });

export const newWordsD: Word[] = [
  // ---------- C2: idioms for decisions and plans ----------
  g('back to the drawing board', 'idiom', 'boshidan boshlamoq (reja ishlamagach)', 'used when a plan has failed and you must start again', 'The client rejected the design, so it’s back to the drawing board.', 'C2'),
  g('up in the air', 'idiom', 'hali hal qilinmagan, noaniq', 'not yet decided or certain', 'Our travel plans are still up in the air.', 'C2'),
  g('on the same page', 'idiom', 'bir xil fikrda, hamfikr', 'agreeing about what you understand or want to do', 'Let’s check that we’re all on the same page before the meeting.', 'C2'),
  // ---------- C2: idioms and register ----------
  g('cliché', 'n', 'siyqasi chiqqan ibora', 'a phrase used so often that it no longer sounds fresh or original', 'Starting an essay with “Since the dawn of time” is a cliché.', 'C2'),
  g('overused', 'adj', 'haddan tashqari ko‘p ishlatilgan, siyqa', 'used so often that it has lost its effect', '“A piece of cake” is an overused idiom in exam answers.', 'C2'),
  // ---------- C2: proverbs, idioms and collocations ----------
  g('proverb', 'n', 'maqol', 'a short, well-known sentence that gives advice or states a general truth', '“Better late than never” is a common English proverb.', 'C2'),
  g('silver lining', 'n', 'yaxshi tomon (yomon vaziyatdagi)', 'a positive side of a bad situation', 'The silver lining of the delay was an extra day with my family.', 'C2'),
  g('actions speak louder than words', 'idiom', 'gap emas, ish muhim', 'what you do matters more than what you promise', 'He promised to help, but actions speak louder than words.', 'C2'),
  // ---------- C2: concision ----------
  g('redundant', 'adj', 'ortiqcha, takroriy', 'not needed because it repeats something already said', 'In “future plans”, the word “future” is redundant.', 'C2'),
  g('wordy', 'adj', 'cho‘zilgan, ortiqcha so‘zli', 'using more words than necessary', 'The introduction is too wordy; cut it by half.', 'C2'),
  g('succinct', 'adj', 'qisqa va lo‘nda', 'expressed clearly in very few words', 'She gave a succinct summary of the findings.', 'C2'),
  // ---------- C2: synthesising sources ----------
  g('synthesise', 'v', 'sintez qilmoq, birlashtirib xulosa chiqarmoq', 'to combine ideas from different sources into one connected whole', 'A good literature review synthesises the main studies.', 'C2'),
  g('consensus', 'n', 'umumiy kelishuv, yakdil fikr', 'general agreement among a group of people', 'There is broad consensus that sleep affects memory.', 'C2'),
  g('concur', 'v', 'qo‘shilmoq, fikriga rozi bo‘lmoq (rasmiy)', 'to agree with someone or with an opinion (formal)', 'Most experts concur with this view.', 'C2'),
  g('corroborate', 'v', 'tasdiqlamoq, qo‘shimcha dalil bilan quvvatlamoq', 'to provide evidence that supports a statement or finding', 'The new data corroborate earlier results.', 'C2'),
  // ---------- C2: academic phrasal verbs ----------
  g('carry out', 'phrasal verb', 'o‘tkazmoq, amalga oshirmoq (tadqiqot)', 'to do a piece of work, research or an experiment', 'The team will carry out a survey of 500 households.', 'C2'),
  g('account for', 'phrasal verb', 'tashkil etmoq; sababini tushuntirmoq', 'to form a particular amount of something; to explain the reason for something', 'Exports account for a third of national income.', 'C2'),
  g('rule out', 'phrasal verb', 'istisno qilmoq', 'to decide that something is not possible or not a cause', 'Doctors cannot rule out a serious infection.', 'C2'),
  g('bring about', 'phrasal verb', 'yuzaga keltirmoq, sabab bo‘lmoq', 'to make something happen, especially a change', 'The reform could bring about a fall in unemployment.', 'C2'),
];
