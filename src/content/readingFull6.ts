import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. For more than two thousand years, lighthouses have guided ships along dangerous coasts. The most famous ancient example, the Pharos of Alexandria in Egypt, was completed in the third century BC and is thought to have stood over one hundred metres tall. Early lighthouses relied on open fires burning wood or coal at the top of a tower, but the light they gave was weak and the smoke often blackened the windows of later enclosed lanterns.',
  'B. Building lighthouses on exposed rocks was one of the great engineering challenges of the eighteenth and nineteenth centuries. The Eddystone Rocks off the south-west coast of England saw four lighthouses in less than a century. The first was destroyed by a storm in 1703, and the second by fire. The third, completed by John Smeaton in 1759, used interlocking blocks of granite cut so that each piece fitted tightly into its neighbours, a technique that influenced lighthouse construction for generations.',
  'C. Improvements in the light itself were equally important. In the 1780s, oil lamps with circular wicks produced a brighter, cleaner flame, and curved mirrors were placed behind them to direct the light out to sea. The decisive advance came in 1822, when the French physicist Augustin Fresnel designed a lens made of concentric rings of glass. It was far thinner and lighter than a conventional lens of the same size, and it could bend most of the light into a single powerful beam visible over thirty kilometres away.',
  'D. Each lighthouse needed to be identified by sailors at night. To make this possible, lights were given individual patterns: some flashed at fixed intervals, others showed a steady light interrupted by periods of darkness, and some used coloured glass. These patterns were published in lists so that a navigator who saw a light could work out exactly where the ship was. In fog, when lights could not be seen, many stations used horns, bells or sirens instead.',
  'E. The life of a lighthouse keeper was often lonely and demanding. Keepers had to clean the lens, trim the wicks and keep the light burning through every night, sometimes for weeks without leaving a rock in the middle of the sea. On remote stations, supplies arrived by boat when the weather allowed, and families occasionally lived in the towers or in cottages nearby. Some keepers kept detailed diaries, which are now valuable records of weather and shipping in the past.',
  'F. During the twentieth century, electricity replaced oil, and automatic equipment made resident keepers unnecessary. Most lighthouses in Britain had been automated by the end of the 1990s. Satellite navigation has since reduced the importance of lighthouses for large ships, but many are still maintained as a backup and for smaller boats. Others have been converted into museums, holiday accommodation or bird observatories, preserving buildings that have become symbols of the coast.',
];

const P2 = [
  'A. Desert locusts are usually solitary insects that live quietly in the dry regions stretching from West Africa to India. Most of the time they avoid one another and cause little damage. However, after periods of heavy rain, when vegetation grows quickly and locust numbers rise, a remarkable transformation can take place. As the insects are crowded together, they change their colour, behaviour and even body shape, and begin to move in groups.',
  'B. Researchers have found that the change is triggered partly by touch. When locusts are packed closely, repeated contact on the hind legs causes a rise in the chemical serotonin in their nervous system, which makes them attracted to each other rather than repelled. Within a few hours, a solitary locust can begin to behave like a gregarious one. Over several generations, the gregarious form becomes fully developed, with brighter colours and stronger flight muscles.',
  'C. Once they have formed swarms, locusts can travel great distances with the wind, often covering more than one hundred kilometres a day. A large swarm may contain tens of billions of insects and cover hundreds of square kilometres. Each locust can eat roughly its own weight in fresh food every day, so a swarm can destroy crops that would have fed thousands of people. In 2019 and 2020, swarms in East Africa were the worst seen in decades in some countries.',
  'D. Control has traditionally relied on spraying chemical pesticides, often from aircraft. This can be effective, but it is expensive, it may harm other insects, birds and fish, and it must be carried out quickly in remote areas. Increasingly, organisations favour early action: monitoring the areas where locusts breed and treating small groups before they can form swarms. Satellite data on rainfall and vegetation now help to predict where outbreaks are likely to begin.',
  'E. Biological methods offer an alternative. One product contains spores of a fungus that infects and kills locusts but does not harm most other animals. It works more slowly than chemical pesticides, taking several days to have an effect, which makes it most suitable for treating young locusts before they can fly. Its safety has made it attractive for use in sensitive areas such as farms that produce food for export.',
  'F. Locust swarms are not only a problem; in some places they are also food. Locusts are rich in protein, and they have been eaten in parts of Africa and the Middle East for centuries. Some researchers have suggested that collecting swarming locusts could provide both food and animal feed, although pesticides used in control campaigns can make them unsafe to eat.',
];

const P3 = [
  'A. For much of the twentieth century, many parents and teachers believed that learning two languages in early childhood would confuse children and slow their development. Some early studies seemed to support this view, finding that bilingual children scored lower on intelligence tests. Later researchers pointed out serious weaknesses in these studies: the bilingual children were often from poorer families and were frequently tested in a language they did not know well.',
  'B. In 1962, a study in Montreal by Elizabeth Peal and Wallace Lambert produced very different results. Comparing children from similar backgrounds, they found that bilingual children performed better on a range of tests, especially those requiring flexible thinking. Their work encouraged a new wave of research, and over the following decades, the idea of a bilingual advantage became widely accepted.',
  'C. The explanation most often proposed concerns control of attention. Research shows that in bilingual people both languages are active in the brain at the same time, even when only one is being used. To speak in the right language, a bilingual person must constantly suppress the other one. Some psychologists argued that this daily practice strengthens general mental abilities, such as switching between tasks and ignoring distractions.',
  'D. Studies of older adults added further interest. Research carried out in Canada in the 2000s reported that bilingual patients developed the symptoms of dementia several years later, on average, than monolingual patients with similar levels of education. The researchers did not claim that bilingualism prevents the disease, but suggested that it may help the brain to cope with damage for longer, an idea known as cognitive reserve.',
  'E. In the last fifteen years, however, the picture has become more complicated. Several large studies, some involving thousands of participants, found no clear difference between bilinguals and monolinguals on tests of attention and task-switching. Critics also argued that studies finding an advantage were more likely to be published than those that did not. The debate continues, and many researchers now believe that if a general cognitive advantage exists, it is smaller and less consistent than was once claimed.',
  'F. What is not in doubt is that bilingualism brings practical, social and cultural benefits. Speaking two languages allows people to communicate with a wider range of people, to keep close links with family and community, and to enjoy literature and media in more than one language. For these reasons, many educators argue that the case for supporting children’s home languages does not depend on proving that bilingualism makes them better at mental tests.',
];

const P2LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const readingFull6: ReadingTest = {
  id: 'reading-full-6',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 6',
  minutes: 60,
  passageTitle: 'Reading Passage 1: Lights on the Coast',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: Lights on the Coast' },
    { at: P1.length, title: 'Reading Passage 2: When Locusts Swarm' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: The Bilingual Brain' },
  ],
  groups: [
    { instruction: 'Questions 1–5 (Passage 1): Choose the correct letter.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–13 (Passage 1): Complete the notes. Write ONE WORD ONLY from the passage for each answer.', questionIds: [6, 7, 8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): Which paragraph, A–F, contains the following information? Choose the correct letter.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–26 (Passage 2): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [20, 21, 22, 23, 24, 25, 26] },
    { instruction: 'Questions 27–32 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [27, 28, 29, 30, 31, 32] },
    { instruction: 'Questions 33–36 (Passage 3): Choose the correct letter.', questionIds: [33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'mcq', text: 'What was a problem with early lighthouse fires?', options: ['They were too bright.', 'They gave weak light and produced smoke.', 'They needed electricity.', 'They could only burn oil.'], answer: 1, evidence: 'P1 A: "the light they gave was weak and the smoke often blackened the windows".' },
    { id: 2, type: 'mcq', text: 'What happened to the second Eddystone lighthouse?', options: ['It was destroyed by a storm.', 'It was destroyed by fire.', 'It was moved to a new rock.', 'It is still standing.'], answer: 1, evidence: 'P1 B: the first was destroyed by a storm, "and the second by fire".' },
    { id: 3, type: 'mcq', text: 'What was special about Smeaton’s method?', options: ['Blocks of stone fitted tightly into each other.', 'It used wood instead of stone.', 'It was cheaper than earlier methods.', 'It was copied from Egypt.'], answer: 0, evidence: 'P1 B: "interlocking blocks of granite cut so that each piece fitted tightly into its neighbours".' },
    { id: 4, type: 'mcq', text: 'What was an advantage of Fresnel’s lens?', options: ['It used coloured glass.', 'It was thinner and lighter than a normal lens of the same size.', 'It could be seen only at short distances.', 'It replaced the need for a flame.'], answer: 1, evidence: 'P1 C: "far thinner and lighter than a conventional lens of the same size".' },
    { id: 5, type: 'mcq', text: 'Why are lighthouses still maintained today?', options: ['Large ships depend on them completely.', 'They are a backup and useful for smaller boats.', 'Satellites do not work at sea.', 'Keepers still live in them.'], answer: 1, evidence: 'P1 F: many "are still maintained as a backup and for smaller boats".' },
    { id: 6, type: 'fill', text: 'Ancient example: the Pharos of ______', answers: ['alexandria'], evidence: 'P1 A: "the Pharos of Alexandria in Egypt".' },
    { id: 7, type: 'fill', text: 'Smeaton’s lighthouse was built of ______', answers: ['granite'], evidence: 'P1 B: "interlocking blocks of granite".' },
    { id: 8, type: 'fill', text: '1780s: curved ______ directed the light out to sea', answers: ['mirrors'], evidence: 'P1 C: "curved mirrors were placed behind them to direct the light out to sea".' },
    { id: 9, type: 'fill', text: 'Fresnel’s lens: concentric ______ of glass', answers: ['rings'], evidence: 'P1 C: "a lens made of concentric rings of glass".' },
    { id: 10, type: 'fill', text: 'Light patterns were published in ______ for navigators', answers: ['lists'], evidence: 'P1 D: "These patterns were published in lists".' },
    { id: 11, type: 'fill', text: 'In ______, stations used horns, bells or sirens', answers: ['fog'], evidence: 'P1 D: "In fog, when lights could not be seen".' },
    { id: 12, type: 'fill', text: 'Keepers’ ______ are now valuable records of weather and shipping', answers: ['diaries'], evidence: 'P1 E: "Some keepers kept detailed diaries, which are now valuable records".' },
    { id: 13, type: 'fill', text: 'Most British lighthouses were ______ by the end of the 1990s', answers: ['automated'], evidence: 'P1 F: "Most lighthouses in Britain had been automated by the end of the 1990s".' },
    // Passage 2
    { id: 14, type: 'match', text: 'a description of the damage that swarms can do to crops', options: P2LETTERS, answer: 2, evidence: 'P2 C: "a swarm can destroy crops that would have fed thousands of people".' },
    { id: 15, type: 'match', text: 'the chemical change that makes locusts attracted to each other', options: P2LETTERS, answer: 1, evidence: 'P2 B: "a rise in the chemical serotonin … makes them attracted to each other".' },
    { id: 16, type: 'match', text: 'the use of locusts as a source of food', options: P2LETTERS, answer: 5, evidence: 'P2 F: locusts "have been eaten in parts of Africa and the Middle East for centuries".' },
    { id: 17, type: 'match', text: 'the conditions that lead to a rise in locust numbers', options: P2LETTERS, answer: 0, evidence: 'P2 A: "after periods of heavy rain, when vegetation grows quickly and locust numbers rise".' },
    { id: 18, type: 'match', text: 'a method that is safe for most other animals', options: P2LETTERS, answer: 4, evidence: 'P2 E: a fungus that kills locusts "but does not harm most other animals".' },
    { id: 19, type: 'match', text: 'the use of satellite information to predict outbreaks', options: P2LETTERS, answer: 3, evidence: 'P2 D: "Satellite data on rainfall and vegetation now help to predict where outbreaks are likely to begin."' },
    { id: 20, type: 'tfng', text: 'Solitary desert locusts usually avoid one another.', answer: 'True', evidence: 'P2 A: "Most of the time they avoid one another".' },
    { id: 21, type: 'tfng', text: 'The change from solitary to gregarious behaviour takes several years.', answer: 'False', evidence: 'P2 B: "Within a few hours, a solitary locust can begin to behave like a gregarious one."' },
    { id: 22, type: 'tfng', text: 'Swarms can travel more than one hundred kilometres in a day.', answer: 'True', evidence: 'P2 C: "often covering more than one hundred kilometres a day".' },
    { id: 23, type: 'tfng', text: 'The 2019–2020 swarms in East Africa caused famine in every affected country.', answer: 'Not Given', evidence: 'P2 C says the swarms were the worst in decades but does not mention famine.' },
    { id: 24, type: 'tfng', text: 'Chemical pesticides can harm birds and fish.', answer: 'True', evidence: 'P2 D: spraying "may harm other insects, birds and fish".' },
    { id: 25, type: 'tfng', text: 'The fungus product acts faster than chemical pesticides.', answer: 'False', evidence: 'P2 E: "It works more slowly than chemical pesticides".' },
    { id: 26, type: 'tfng', text: 'Locusts collected during control campaigns are always safe to eat.', answer: 'False', evidence: 'P2 F: "pesticides used in control campaigns can make them unsafe to eat".' },
    // Passage 3
    { id: 27, type: 'tfng', text: 'Some early studies found that bilingual children did worse on intelligence tests.', answer: 'True', evidence: 'P3 A: "bilingual children scored lower on intelligence tests".' },
    { id: 28, type: 'tfng', text: 'In early studies, bilingual children were always tested in their strongest language.', answer: 'False', evidence: 'P3 A: they "were frequently tested in a language they did not know well".' },
    { id: 29, type: 'tfng', text: 'Peal and Lambert compared children from similar backgrounds.', answer: 'True', evidence: 'P3 B: "Comparing children from similar backgrounds".' },
    { id: 30, type: 'tfng', text: 'In bilingual people, only the language being used is active in the brain.', answer: 'False', evidence: 'P3 C: "both languages are active in the brain at the same time".' },
    { id: 31, type: 'tfng', text: 'The Canadian researchers claimed that bilingualism prevents dementia.', answer: 'False', evidence: 'P3 D: "The researchers did not claim that bilingualism prevents the disease".' },
    { id: 32, type: 'tfng', text: 'Bilingual children read more books than monolingual children.', answer: 'Not Given', evidence: 'P3 does not compare how many books children read.' },
    { id: 33, type: 'mcq', text: 'What is the most common explanation for a bilingual advantage?', options: ['Better memory for words', 'Control of attention', 'Higher family income', 'Earlier schooling'], answer: 1, evidence: 'P3 C: "The explanation most often proposed concerns control of attention."' },
    { id: 34, type: 'mcq', text: 'What did several large recent studies find?', options: ['A strong advantage for bilinguals', 'No clear difference on attention tests', 'A disadvantage for bilinguals', 'Differences only in older adults'], answer: 1, evidence: 'P3 E: they "found no clear difference between bilinguals and monolinguals on tests of attention".' },
    { id: 35, type: 'mcq', text: 'What criticism was made of studies that found an advantage?', options: ['They used too many participants.', 'They were more likely to be published.', 'They were all carried out in Canada.', 'They ignored older adults.'], answer: 1, evidence: 'P3 E: such studies "were more likely to be published than those that did not".' },
    { id: 36, type: 'mcq', text: 'What do many educators argue in the final paragraph?', options: ['Home languages should be replaced.', 'Supporting home languages does not depend on test results.', 'Bilingual children should take more tests.', 'Bilingualism has no benefits.'], answer: 1, evidence: 'P3 F: "the case for supporting children’s home languages does not depend on proving that bilingualism makes them better at mental tests".' },
    { id: 37, type: 'fill', text: 'To use the right language, bilingual people must ______ the other one.', answers: ['suppress'], evidence: 'P3 C: "a bilingual person must constantly suppress the other one".' },
    { id: 38, type: 'fill', text: 'Bilingual patients developed symptoms of ______ several years later on average.', answers: ['dementia'], evidence: 'P3 D: "bilingual patients developed the symptoms of dementia several years later".' },
    { id: 39, type: 'fill', text: 'The idea that the brain can cope with damage for longer is called cognitive ______.', answers: ['reserve'], evidence: 'P3 D: "an idea known as cognitive reserve".' },
    { id: 40, type: 'fill', text: 'Bilingualism helps people keep close links with family and ______.', answers: ['community'], evidence: 'P3 F: "to keep close links with family and community".' },
  ],
};
