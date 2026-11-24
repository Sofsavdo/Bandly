import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. Tea is the most widely consumed drink in the world after water. All true tea comes from a single plant, Camellia sinensis, an evergreen shrub that originated in the region where China, India and Myanmar meet. According to Chinese tradition, tea was discovered when leaves blew into a pot of boiling water, but historians believe that it was first used as a medicine, and only later became an everyday drink.',
  'B. During the Tang dynasty, which lasted from the seventh to the tenth century, tea drinking spread throughout China. Around 760, the writer Lu Yu produced The Classic of Tea, the first known book devoted to the subject, describing how tea should be grown, prepared and served. At that time, tea leaves were usually steamed and pressed into hard cakes, which were broken up and boiled. Loose-leaf tea, steeped in hot water as most people drink it today, became common several centuries later.',
  'C. Tea reached Japan with Buddhist monks, who used it to stay awake during long periods of meditation. Over time, the Japanese developed an elaborate ceremony in which powdered green tea is prepared and served according to precise rules. The ceremony was shaped in the sixteenth century by the tea master Sen no Rikyu, who emphasised simplicity, calm and respect between host and guest.',
  'D. Tea arrived in Europe in the early seventeenth century, carried by Dutch traders. At first it was an expensive luxury, but it became fashionable in Britain after the marriage of King Charles II to the Portuguese princess Catherine of Braganza in 1662, who was already fond of the drink. By the eighteenth century, tea was so popular that high taxes led to widespread smuggling, and it was estimated that more tea entered Britain illegally than legally.',
  'E. For a long time, China was the only major source of tea, and Britain paid for it largely with silver. To reduce this dependence, the British East India Company sought to grow tea in its own territories. In the 1830s, tea plants were discovered growing wild in Assam, in north-east India, and plantations were soon established there and later in Ceylon, now Sri Lanka. The botanist Robert Fortune also smuggled plants and seeds out of China in the 1840s, together with knowledge of how they were processed.',
  'F. The different types of tea — white, green, oolong and black — all come from the same plant. What distinguishes them is mainly how the leaves are processed after picking, and in particular how much they are allowed to oxidise. Green tea is heated soon after picking to stop oxidation, which keeps the leaves green, while black tea is fully oxidised, giving it a darker colour and stronger flavour. Oolong lies between the two.',
];

const P2 = [
  'A. Octopuses have long fascinated scientists because they combine a soft, boneless body with behaviour that appears remarkably intelligent. An octopus has around five hundred million neurons, a number comparable to that of a dog, but the way these nerve cells are arranged is very different from that of vertebrates. About two-thirds of them are located not in the brain but in the arms, which can respond to touch and taste with a considerable degree of independence.',
  'B. Laboratory studies have shown that octopuses can solve a variety of problems. They can learn to open jars to reach food inside, find their way through simple mazes, and distinguish between objects of different shapes and brightness. In some experiments, octopuses appeared to learn by watching other octopuses perform a task, although later attempts to repeat these results were not always successful.',
  'C. In the wild, octopuses show a striking ability to use objects. Researchers in Indonesia filmed veined octopuses carrying coconut shells across the sea floor and assembling them into shelters when needed. Because the animals carried the shells for later use, rather than simply hiding in them when they found them, some scientists consider this one of the first known examples of tool use by an invertebrate.',
  'D. Perhaps the most dramatic feature of octopuses is their ability to change colour and texture within a fraction of a second. Their skin contains thousands of cells filled with pigment, called chromatophores, which can be expanded or contracted by muscles controlled by the nervous system. Some species can also raise small bumps on their skin to imitate rocks or seaweed. Curiously, most octopuses are thought to be colour-blind, and researchers are still investigating how they match their surroundings so precisely.',
  'E. Keepers of octopuses in aquariums report that individual animals behave differently, with some appearing curious and bold and others shy. There are stories of octopuses escaping from their tanks at night, squirting water at particular members of staff and turning off lights by directing jets of water at them. Such accounts are difficult to test scientifically, but they have encouraged researchers to study personality in these animals.',
  'F. Despite their abilities, most octopuses live for only one or two years. Females usually die shortly after their eggs hatch, having stopped eating while guarding them. This short life raises a puzzle for scientists, because intelligence is usually associated with long-lived social animals that learn from others over many years. In octopuses, it seems to have evolved in solitary animals with brief lives, perhaps because hunting and avoiding predators in a complex environment required flexible behaviour.',
];

const P3 = [
  'A. In 1906, the British scientist Francis Galton visited a country fair where people were invited to guess the weight of an ox once it had been slaughtered and prepared. Galton collected around eight hundred guesses and calculated their middle value. To his surprise, the result was within one per cent of the true weight, closer than most individual guesses, including those of people who claimed expert knowledge. The idea that a group can be wiser than its members has since been called the wisdom of crowds.',
  'B. Research suggests that crowds are wise only under certain conditions. The most important is independence: each person must form a judgement without being influenced by the others. When individual errors are independent, they tend to cancel each other out, so that the average is accurate. Diversity also matters, because people who approach a problem in different ways are less likely to make the same mistakes.',
  'C. When these conditions are not met, groups can perform badly. If people can see others’ answers before giving their own, they tend to copy them, and the diversity of opinion that makes crowds accurate is lost. In one experiment, participants answered factual questions either alone or after being told the answers of others. Social information made the answers more similar to each other, but not more accurate, and it made participants more confident.',
  'D. The principle has many practical applications. Prediction markets, in which people buy and sell shares whose value depends on whether a future event happens, have produced forecasts of elections and other events that compare well with expert predictions. Online review systems and some forecasting tournaments also rely on combining many independent judgements. Even within a single person, averaging two separate estimates made at different times can produce a more accurate answer than either estimate alone.',
  'E. Crowds are not always reliable, however. Financial bubbles, in which prices rise far above any reasonable value before collapsing, show how a crowd can be carried away when people follow each other rather than thinking independently. In meetings, the views of the first or most senior speaker may dominate the discussion. Some organisations therefore ask members to write down their opinions privately before any discussion begins.',
  'F. The wisdom of crowds does not mean that expertise is useless. For many technical questions, the judgement of a few well-informed people is more reliable than the average of many uninformed ones. Researchers increasingly suggest combining the two: asking a diverse group of knowledgeable people for independent estimates and then averaging them. The lesson of Galton’s ox, they argue, is not that anyone’s guess is as good as anyone else’s, but that the way judgements are collected matters a great deal.',
];

const H2 = [
  'i. Intelligence spread throughout the body',
  'ii. Problem-solving in the laboratory',
  'iii. Carrying equipment for later use',
  'iv. Masters of disguise',
  'v. Individual differences in behaviour',
  'vi. A short life and an unexpected puzzle',
  'vii. How octopuses communicate with sound',
  'viii. Protecting octopuses from fishing',
];

export const readingFull8: ReadingTest = {
  id: 'reading-full-8',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 8',
  minutes: 60,
  passageTitle: 'Reading Passage 1: The Journey of Tea',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: The Journey of Tea' },
    { at: P1.length, title: 'Reading Passage 2: The Clever Octopus' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: The Wisdom of Crowds' },
  ],
  groups: [
    { instruction: 'Questions 1–6 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–13 (Passage 1): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [7, 8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–26 (Passage 2): Choose the correct letter.', questionIds: [20, 21, 22, 23, 24, 25, 26] },
    { instruction: 'Questions 27–32 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [27, 28, 29, 30, 31, 32] },
    { instruction: 'Questions 33–36 (Passage 3): Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Choose the correct letter.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'tfng', text: 'All true tea comes from one species of plant.', answer: 'True', evidence: 'P1 A: "All true tea comes from a single plant, Camellia sinensis".' },
    { id: 2, type: 'tfng', text: 'Historians agree that tea was discovered when leaves fell into boiling water.', answer: 'False', evidence: 'P1 A: that is the Chinese tradition, but "historians believe that it was first used as a medicine".' },
    { id: 3, type: 'tfng', text: 'Lu Yu’s book was translated into Japanese soon after it was written.', answer: 'Not Given', evidence: 'P1 B–C do not mention a translation of the book.' },
    { id: 4, type: 'tfng', text: 'Catherine of Braganza already liked tea before her marriage.', answer: 'True', evidence: 'P1 D: she "was already fond of the drink".' },
    { id: 5, type: 'tfng', text: 'In the eighteenth century, more tea may have entered Britain illegally than legally.', answer: 'True', evidence: 'P1 D: "it was estimated that more tea entered Britain illegally than legally".' },
    { id: 6, type: 'tfng', text: 'Black tea and green tea come from different plants.', answer: 'False', evidence: 'P1 F: "all come from the same plant".' },
    { id: 7, type: 'fill', text: 'During the Tang period, tea was steamed and pressed into ______.', answers: ['cakes'], evidence: 'P1 B: "steamed and pressed into hard cakes".' },
    { id: 8, type: 'fill', text: 'In Japan, monks used tea to stay awake during ______.', answers: ['meditation'], evidence: 'P1 C: "to stay awake during long periods of meditation".' },
    { id: 9, type: 'fill', text: 'The Japanese ceremony uses ______ green tea.', answers: ['powdered'], evidence: 'P1 C: "powdered green tea is prepared and served".' },
    { id: 10, type: 'fill', text: 'Britain originally paid for Chinese tea mainly with ______.', answers: ['silver'], evidence: 'P1 E: "Britain paid for it largely with silver".' },
    { id: 11, type: 'fill', text: 'Wild tea plants were found in ______ in the 1830s.', answers: ['assam'], evidence: 'P1 E: "tea plants were discovered growing wild in Assam".' },
    { id: 12, type: 'fill', text: 'Types of tea differ mainly in how much the leaves ______.', answers: ['oxidise'], evidence: 'P1 F: "how much they are allowed to oxidise".' },
    { id: 13, type: 'fill', text: 'Green tea is ______ soon after picking to stop oxidation.', answers: ['heated'], evidence: 'P1 F: "Green tea is heated soon after picking to stop oxidation".' },
    // Passage 2
    { id: 14, type: 'match', text: 'Paragraph A', options: H2, answer: 0, evidence: 'P2 A: "About two-thirds of them are located not in the brain but in the arms".' },
    { id: 15, type: 'match', text: 'Paragraph B', options: H2, answer: 1, evidence: 'P2 B: "Laboratory studies have shown that octopuses can solve a variety of problems."' },
    { id: 16, type: 'match', text: 'Paragraph C', options: H2, answer: 2, evidence: 'P2 C: octopuses "carried the shells for later use".' },
    { id: 17, type: 'match', text: 'Paragraph D', options: H2, answer: 3, evidence: 'P2 D: they change colour and texture to "imitate rocks or seaweed".' },
    { id: 18, type: 'match', text: 'Paragraph E', options: H2, answer: 4, evidence: 'P2 E: "individual animals behave differently".' },
    { id: 19, type: 'match', text: 'Paragraph F', options: H2, answer: 5, evidence: 'P2 F: "This short life raises a puzzle for scientists".' },
    { id: 20, type: 'mcq', text: 'How does the number of neurons in an octopus compare with a dog’s?', options: ['It is much smaller.', 'It is roughly similar.', 'It is ten times larger.', 'It has not been measured.'], answer: 1, evidence: 'P2 A: "around five hundred million neurons, a number comparable to that of a dog".' },
    { id: 21, type: 'mcq', text: 'What does the writer say about experiments on learning by watching?', options: ['They were always repeated successfully.', 'Later attempts to repeat them did not always succeed.', 'They were carried out only in the wild.', 'They proved octopuses cannot learn.'], answer: 1, evidence: 'P2 B: "later attempts to repeat these results were not always successful".' },
    { id: 22, type: 'mcq', text: 'Where were octopuses filmed carrying coconut shells?', options: ['Australia', 'Indonesia', 'Japan', 'Brazil'], answer: 1, evidence: 'P2 C: "Researchers in Indonesia filmed veined octopuses carrying coconut shells".' },
    { id: 23, type: 'mcq', text: 'What are chromatophores?', options: ['Muscles in the arms', 'Cells containing pigment', 'Bumps that imitate rocks', 'Eyes that see colour'], answer: 1, evidence: 'P2 D: "cells filled with pigment, called chromatophores".' },
    { id: 24, type: 'mcq', text: 'What is surprising about octopus camouflage?', options: ['It is very slow.', 'Most octopuses are thought to be colour-blind.', 'It only works at night.', 'It needs sunlight.'], answer: 1, evidence: 'P2 D: "most octopuses are thought to be colour-blind".' },
    { id: 25, type: 'mcq', text: 'Why are aquarium stories about octopuses treated with caution?', options: ['They are hard to test scientifically.', 'Keepers invented them.', 'They happened long ago.', 'Octopuses cannot leave tanks.'], answer: 0, evidence: 'P2 E: "Such accounts are difficult to test scientifically".' },
    { id: 26, type: 'mcq', text: 'Why is octopus intelligence a puzzle?', options: ['Octopuses live in large groups.', 'Intelligence is usually found in long-lived social animals.', 'Octopuses have no brain.', 'They live for many decades.'], answer: 1, evidence: 'P2 F: "intelligence is usually associated with long-lived social animals".' },
    // Passage 3
    { id: 27, type: 'tfng', text: 'The middle value of the guesses at the fair was very close to the ox’s real weight.', answer: 'True', evidence: 'P3 A: "the result was within one per cent of the true weight".' },
    { id: 28, type: 'tfng', text: 'Experts at the fair guessed more accurately than the group as a whole.', answer: 'False', evidence: 'P3 A: the group result was closer than most guesses, "including those of people who claimed expert knowledge".' },
    { id: 29, type: 'tfng', text: 'Galton won a prize for his calculation.', answer: 'Not Given', evidence: 'P3 A says nothing about a prize for Galton.' },
    { id: 30, type: 'tfng', text: 'Seeing other people’s answers made participants more accurate.', answer: 'False', evidence: 'P3 C: social information made answers more similar, "but not more accurate".' },
    { id: 31, type: 'tfng', text: 'Seeing other people’s answers made participants more confident.', answer: 'True', evidence: 'P3 C: "it made participants more confident".' },
    { id: 32, type: 'tfng', text: 'In prediction markets, people trade shares linked to future events.', answer: 'True', evidence: 'P3 D: people "buy and sell shares whose value depends on whether a future event happens".' },
    { id: 33, type: 'fill', text: 'The most important condition for a wise crowd is ______.', answers: ['independence'], evidence: 'P3 B: "The most important is independence".' },
    { id: 34, type: 'fill', text: 'When individual errors are independent, they tend to ______.', answers: ['cancel'], evidence: 'P3 B: "they tend to cancel each other out".' },
    { id: 35, type: 'fill', text: 'Prices rising far above any reasonable value are known as financial ______.', answers: ['bubbles'], evidence: 'P3 E: "Financial bubbles, in which prices rise far above any reasonable value".' },
    { id: 36, type: 'fill', text: 'Some organisations ask members to write down opinions ______ before discussion.', answers: ['privately'], evidence: 'P3 E: "ask members to write down their opinions privately before any discussion begins".' },
    { id: 37, type: 'mcq', text: 'Why does diversity help a crowd?', options: ['People with different approaches make different mistakes.', 'Larger groups are always better.', 'Diverse groups agree more quickly.', 'Experts are excluded.'], answer: 0, evidence: 'P3 B: such people "are less likely to make the same mistakes".' },
    { id: 38, type: 'mcq', text: 'What can improve a single person’s estimate?', options: ['Asking a friend', 'Averaging two estimates made at different times', 'Guessing quickly', 'Reading reviews'], answer: 1, evidence: 'P3 D: "averaging two separate estimates made at different times".' },
    { id: 39, type: 'mcq', text: 'What problem can occur in meetings?', options: ['Nobody speaks.', 'The first or most senior speaker dominates.', 'Too many ideas are produced.', 'Meetings are too short.'], answer: 1, evidence: 'P3 E: "the views of the first or most senior speaker may dominate the discussion".' },
    { id: 40, type: 'mcq', text: 'What do researchers increasingly recommend?', options: ['Ignoring experts completely', 'Averaging independent estimates from a diverse group of knowledgeable people', 'Letting the most senior person decide', 'Using only prediction markets'], answer: 1, evidence: 'P3 F: "asking a diverse group of knowledgeable people for independent estimates and then averaging them".' },
  ],
};
