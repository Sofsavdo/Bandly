import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. Glass is so common today that it is easy to forget how remarkable it is. It is made mainly from sand, one of the most ordinary materials on Earth, yet it can be clear enough to look through and strong enough to hold back the sea in an aquarium. The earliest objects made entirely of glass are small beads from Mesopotamia, dating from around 2500 BC. For many centuries afterwards, glass was a luxury, shaped into small bottles for perfume and oil by wrapping hot glass around a core of clay and sand.',
  'B. The great breakthrough came in the first century BC, probably somewhere on the eastern coast of the Mediterranean, when craftsmen discovered that a blob of molten glass could be inflated by blowing air into it through a hollow metal pipe. Glassblowing was faster than any earlier method, and it allowed vessels of many shapes and sizes to be produced. Under the Roman Empire, glass cups, jugs and storage jars became ordinary household items, and some wealthy Romans even fitted small panes of glass into their windows.',
  'C. After the fall of Rome, the skills survived in several centres, the most famous of which was Venice. In 1291, the city authorities ordered all glassmakers to move to the island of Murano. The official reason was the danger of fire in a city of wooden buildings, but the move also made it easier to protect the industry’s secrets. Murano craftsmen developed an exceptionally clear glass known as cristallo, and for a time they were forbidden to leave the republic. Some, however, were persuaded to move abroad, and their knowledge gradually spread across Europe.',
  'D. For most of its history, window glass was expensive and of poor quality. One common method involved spinning a large disc of glass, which produced panes that were thick at the centre and thin at the edges. In 1959, the British engineer Alastair Pilkington introduced the float process, in which molten glass is poured onto a bath of liquid tin. The glass spreads out into a perfectly flat sheet of even thickness, and no grinding or polishing is required. The method was so successful that it is still used to make almost all the flat glass produced in the world today.',
  'E. Modern glass has many uses that early craftsmen could not have imagined. Thin fibres of extremely pure glass carry telephone calls and internet data across oceans as pulses of light. Special glass protects the screens of mobile phones, and other types are designed to withstand sudden changes of temperature, which makes them suitable for laboratory equipment and cooking dishes. Architects use coated glass that lets in daylight while reflecting much of the sun’s heat, so that buildings need less energy for cooling.',
  'F. Glass also has an important environmental advantage: it can be melted down and remade again and again without any loss of quality. Using recycled glass also reduces the energy needed in production, because broken glass melts at a lower temperature than the raw materials. Nevertheless, recycling rates vary widely between countries. Where bottles of different colours are collected together, the mixture is less valuable, and some of it ends up being used to make materials for road building instead of new containers.',
];

const P2 = [
  'A. Coral reefs cover less than one per cent of the ocean floor, yet they are home to roughly a quarter of all known marine species. They also protect coastlines from waves and storms, and millions of people depend on them for food and income from tourism. Although a reef may look like rock, it is built by living animals. Each coral is a colony of tiny creatures called polyps, which produce hard skeletons of calcium carbonate. Over thousands of years, these skeletons build up into structures large enough to be seen from space.',
  'B. Most reef-building corals live in a close partnership with microscopic algae that grow inside their tissues. The algae use sunlight to make food, and they pass much of this food to the coral; in return, the coral gives the algae shelter and the nutrients they need. The algae also give many corals their bright colours. Because the algae need light, reef-building corals are found mainly in clear, shallow water.',
  'C. This partnership is easily disturbed. When the water becomes even one or two degrees warmer than normal for several weeks, the corals expel the algae. Without them, the corals lose their colour and appear white, a process known as bleaching. A bleached coral is not dead, but it is starving, and if high temperatures continue, it may die. Since the 1980s, mass bleaching events affecting whole regions have become far more frequent, and scientists link this trend to the warming of the oceans.',
  'D. Warming is not the only threat. As the ocean absorbs carbon dioxide from the atmosphere, the water becomes more acidic, which makes it harder for corals to build their skeletons. Closer to the shore, pollution from farms and cities can encourage the growth of seaweed that competes with corals for space. In some areas, fishing with explosives or poisons has destroyed large sections of reef, and careless anchoring by boats breaks fragile branches.',
  'E. Scientists and local communities are trying a range of responses. In coral gardening, small fragments of coral are grown on underwater frames, similar to plant nurseries, and later attached to damaged reefs. Researchers are also searching for corals that survive heat better than others, in the hope that these can be bred and planted more widely. In several countries, protected areas where fishing is restricted have helped reefs recover more quickly after bleaching, partly because fish that eat seaweed keep the reef surface clear.',
  'F. Most experts agree, however, that such projects can only buy time. Restoration is slow and expensive, and the areas that can be replanted are tiny compared with the size of the world’s reefs. The long-term survival of coral reefs, they argue, depends above all on limiting the rise in global temperatures. Without that, even the most successful local efforts may be overwhelmed.',
];

const P3 = [
  'A. Traditional economic theory assumes that people make rational choices: they weigh the costs and benefits of each option and choose the one that serves their interests best. Since the 1970s, however, psychologists and economists have collected a great deal of evidence that real decisions often depart from this model in systematic ways. People are influenced by how choices are presented, by what others are doing, and by the option that requires the least effort. The field that studies these patterns is known as behavioural economics.',
  'B. One of the most powerful influences is the default — the option that applies if a person does nothing. In some countries, citizens are automatically registered as organ donors unless they choose to opt out; in others, they must actively opt in. Studies have found that donor registration is dramatically higher in the first group of countries, even though the choice itself is the same. Similar effects have been observed in pension schemes: when employees are enrolled automatically, far more of them end up saving for retirement than when they have to sign up themselves.',
  'C. Ideas like these became widely known through the book Nudge, published in 2008 by the economist Richard Thaler and the legal scholar Cass Sunstein. A nudge, in their definition, is any aspect of the way a choice is presented that changes people’s behaviour in a predictable way without forbidding any options or significantly changing their economic incentives. Placing fruit at eye level in a school canteen is a nudge; banning chocolate is not.',
  'D. Governments soon took an interest. In 2010, the British government created a small team, later nicknamed the nudge unit, to apply these insights to public policy. One of its early projects involved letters sent to people who had not paid their taxes on time. Adding a single sentence stating that most people in the recipient’s town had already paid increased the proportion who paid promptly. Because changes of this kind cost very little, they were attractive at a time when public budgets were under pressure.',
  'E. Not everyone welcomed these developments. Some critics argued that nudging is a form of manipulation, because it works by exploiting weaknesses in human thinking rather than by persuading people with reasons. Others questioned who decides what is in a person’s best interest. Supporters reply that every choice must be presented in some way, so there is no neutral option: a canteen has to put the food somewhere. In their view, it is better to arrange choices deliberately and openly than to leave them to chance or to commercial interests.',
  'F. More recently, researchers have raised a different concern. When results from many studies were combined, the average effect of nudges turned out to be smaller than early reports had suggested, partly because studies with striking results were more likely to be published. Some interventions that worked well in one country failed elsewhere. Most researchers now see nudges as a useful but modest tool, best combined with other measures rather than treated as a cheap replacement for them.',
];

const H3 = [
  'i. A reply to the charge of manipulation',
  'ii. The power of doing nothing',
  'iii. A challenge to an established view of decision-making',
  'iv. A definition illustrated by food',
  'v. Why nudges always fail abroad',
  'vi. A low-cost tool adopted by the state',
  'vii. A more cautious assessment of the evidence',
  'viii. The rising cost of school meals',
];

export const readingFull3: ReadingTest = {
  id: 'reading-full-3',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 3',
  minutes: 60,
  passageTitle: 'Reading Passage 1: The Story of Glass',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: The Story of Glass' },
    { at: P1.length, title: 'Reading Passage 2: Reefs Under Pressure' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: The Science of Nudging' },
  ],
  groups: [
    { instruction: 'Questions 1–6 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–13 (Passage 1): Complete the notes. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [7, 8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–18 (Passage 2): Choose the correct letter.', questionIds: [14, 15, 16, 17, 18] },
    { instruction: 'Questions 19–23 (Passage 2): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [19, 20, 21, 22, 23] },
    { instruction: 'Questions 24–26 (Passage 2): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [24, 25, 26] },
    { instruction: 'Questions 27–32 (Passage 3): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [27, 28, 29, 30, 31, 32] },
    { instruction: 'Questions 33–36 (Passage 3): Choose the correct letter.', questionIds: [33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'tfng', text: 'The oldest known objects made only of glass come from Mesopotamia.', answer: 'True', evidence: 'P1 A: "The earliest objects made entirely of glass are small beads from Mesopotamia".' },
    { id: 2, type: 'tfng', text: 'Glassblowing was first developed in Rome itself.', answer: 'False', evidence: 'P1 B: it was discovered "probably somewhere on the eastern coast of the Mediterranean".' },
    { id: 3, type: 'tfng', text: 'Fire risk was the reason given for moving Venetian glassmakers to Murano.', answer: 'True', evidence: 'P1 C: "The official reason was the danger of fire in a city of wooden buildings".' },
    { id: 4, type: 'tfng', text: 'Murano glassmakers were paid more than other craftsmen in Venice.', answer: 'Not Given', evidence: 'P1 C describes their skills and restrictions but says nothing about pay.' },
    { id: 5, type: 'tfng', text: 'Glass made by the float process needs to be polished before use.', answer: 'False', evidence: 'P1 D: "no grinding or polishing is required".' },
    { id: 6, type: 'tfng', text: 'Recycled glass loses some quality each time it is melted.', answer: 'False', evidence: 'P1 F: it "can be melted down and remade again and again without any loss of quality".' },
    { id: 7, type: 'fill', text: 'Main raw material of glass: ______', answers: ['sand'], evidence: 'P1 A: "It is made mainly from sand".' },
    { id: 8, type: 'fill', text: 'Early bottles: hot glass wrapped around a ______ of clay and sand', answers: ['core'], evidence: 'P1 A: "wrapping hot glass around a core of clay and sand".' },
    { id: 9, type: 'fill', text: 'Glassblowing tool: a hollow ______', answers: ['metal pipe', 'pipe'], evidence: 'P1 B: "through a hollow metal pipe".' },
    { id: 10, type: 'fill', text: 'Very clear Venetian glass: ______', answers: ['cristallo'], evidence: 'P1 C: "an exceptionally clear glass known as cristallo".' },
    { id: 11, type: 'fill', text: 'Float process: molten glass poured onto liquid ______', answers: ['tin'], evidence: 'P1 D: "poured onto a bath of liquid tin".' },
    { id: 12, type: 'fill', text: 'Glass ______ carry phone calls and internet data as light', answers: ['fibres', 'thin fibres'], evidence: 'P1 E: "Thin fibres of extremely pure glass carry telephone calls and internet data".' },
    { id: 13, type: 'fill', text: 'Mixed-colour glass is sometimes used for ______ instead of new containers', answers: ['road building'], evidence: 'P1 F: "used to make materials for road building instead of new containers".' },
    // Passage 2
    { id: 14, type: 'mcq', text: 'What proportion of known marine species live on coral reefs?', options: ['Less than one per cent', 'About a quarter', 'About half', 'Almost all'], answer: 1, evidence: 'P2 A: "home to roughly a quarter of all known marine species".' },
    { id: 15, type: 'mcq', text: 'What do the algae give the coral?', options: ['Shelter', 'Calcium', 'Food', 'Protection from waves'], answer: 2, evidence: 'P2 B: the algae "pass much of this food to the coral".' },
    { id: 16, type: 'mcq', text: 'Why are reef-building corals found mainly in shallow water?', options: ['The water there is warmer.', 'Their algae need light.', 'There are fewer fish.', 'The water contains more food.'], answer: 1, evidence: 'P2 B: "Because the algae need light, reef-building corals are found mainly in clear, shallow water."' },
    { id: 17, type: 'mcq', text: 'What does the writer say about a bleached coral?', options: ['It is already dead.', 'It is starving but alive.', 'It has become more colourful.', 'It recovers within days.'], answer: 1, evidence: 'P2 C: "A bleached coral is not dead, but it is starving".' },
    { id: 18, type: 'mcq', text: 'How do protected areas help reefs recover?', options: ['Fish that eat seaweed are not removed.', 'Tourists are kept away.', 'The water is cooled.', 'New corals are planted there.'], answer: 0, evidence: 'P2 E: recovery is quicker "partly because fish that eat seaweed keep the reef surface clear".' },
    { id: 19, type: 'fill', text: 'Each coral consists of many tiny animals called ______.', answers: ['polyps'], evidence: 'P2 A: "tiny creatures called polyps".' },
    { id: 20, type: 'fill', text: 'Their hard skeletons are made of calcium ______.', answers: ['carbonate'], evidence: 'P2 A: "skeletons of calcium carbonate".' },
    { id: 21, type: 'fill', text: 'When the water gets too warm, corals lose their colour; this is called ______.', answers: ['bleaching'], evidence: 'P2 C: "a process known as bleaching".' },
    { id: 22, type: 'fill', text: 'Water that absorbs carbon dioxide becomes more ______.', answers: ['acidic'], evidence: 'P2 D: "the water becomes more acidic".' },
    { id: 23, type: 'fill', text: 'Pollution near the coast can encourage ______ that competes with corals.', answers: ['seaweed'], evidence: 'P2 D: "the growth of seaweed that competes with corals for space".' },
    { id: 24, type: 'tfng', text: 'Mass bleaching events have become more common since the 1980s.', answer: 'True', evidence: 'P2 C: "Since the 1980s, mass bleaching events … have become far more frequent".' },
    { id: 25, type: 'tfng', text: 'Coral gardening is cheaper than protecting reefs from fishing.', answer: 'Not Given', evidence: 'P2 E–F describe coral gardening and say restoration is expensive, but do not compare its cost with protection from fishing.' },
    { id: 26, type: 'tfng', text: 'Most experts believe restoration projects alone can save the world’s reefs.', answer: 'False', evidence: 'P2 F: such projects "can only buy time"; survival depends on "limiting the rise in global temperatures".' },
    // Passage 3
    { id: 27, type: 'match', text: 'Paragraph A', options: H3, answer: 2, evidence: 'P3 A: real decisions "depart from this model in systematic ways".' },
    { id: 28, type: 'match', text: 'Paragraph B', options: H3, answer: 1, evidence: 'P3 B: the default is "the option that applies if a person does nothing".' },
    { id: 29, type: 'match', text: 'Paragraph C', options: H3, answer: 3, evidence: 'P3 C: "Placing fruit at eye level in a school canteen is a nudge".' },
    { id: 30, type: 'match', text: 'Paragraph D', options: H3, answer: 5, evidence: 'P3 D: the government created a nudge unit; such changes "cost very little".' },
    { id: 31, type: 'match', text: 'Paragraph E', options: H3, answer: 0, evidence: 'P3 E: critics call it manipulation; "Supporters reply that every choice must be presented in some way".' },
    { id: 32, type: 'match', text: 'Paragraph F', options: H3, answer: 6, evidence: 'P3 F: the average effect "turned out to be smaller than early reports had suggested".' },
    { id: 33, type: 'mcq', text: 'What did studies of organ donation show?', options: ['People in all countries make the same choice.', 'Registration is much higher where people must opt out.', 'Most people refuse to register.', 'Registration depends on age.'], answer: 1, evidence: 'P3 B: registration "is dramatically higher in the first group of countries" (where people opt out).' },
    { id: 34, type: 'mcq', text: 'According to Thaler and Sunstein, a nudge does NOT', options: ['change behaviour.', 'forbid any options.', 'work in a predictable way.', 'involve how a choice is presented.'], answer: 1, evidence: 'P3 C: a nudge changes behaviour "without forbidding any options".' },
    { id: 35, type: 'mcq', text: 'What change increased prompt tax payments?', options: ['Higher fines', 'A sentence about what most local people had done', 'A phone call from an official', 'A shorter deadline'], answer: 1, evidence: 'P3 D: "Adding a single sentence stating that most people in the recipient’s town had already paid".' },
    { id: 36, type: 'mcq', text: 'Why might early reports have overstated the effect of nudges?', options: ['Studies with striking results were more likely to be published.', 'Researchers used too few countries.', 'Governments hid negative results.', 'The tax letters were not real.'], answer: 0, evidence: 'P3 F: "partly because studies with striking results were more likely to be published".' },
    { id: 37, type: 'fill', text: 'Traditional theory assumes that people make ______.', answers: ['rational choices'], evidence: 'P3 A: "people make rational choices".' },
    { id: 38, type: 'fill', text: 'When employees are enrolled automatically, more of them save for ______.', answers: ['retirement'], evidence: 'P3 B: "far more of them end up saving for retirement".' },
    { id: 39, type: 'fill', text: 'Thaler and Sunstein published the book Nudge in ______.', answers: ['2008'], evidence: 'P3 C: "the book Nudge, published in 2008".' },
    { id: 40, type: 'fill', text: 'Most researchers now regard nudges as a useful but ______ tool.', answers: ['modest'], evidence: 'P3 F: "a useful but modest tool".' },
  ],
};
