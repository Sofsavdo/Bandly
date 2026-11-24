import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. Silk is produced by the caterpillar of a moth, Bombyx mori, which spins a cocoon of a single continuous thread before it changes into an adult. According to Chinese legend, the discovery was made by an empress who noticed a cocoon fall into her cup of hot tea and unwind into a fine thread. Whatever the truth of the story, archaeological evidence shows that silk was being produced in China at least five thousand years ago.',
  'B. Producing silk is a demanding process. The caterpillars, usually called silkworms, eat only the leaves of the mulberry tree, and large quantities are needed: in its life of about a month, a single silkworm multiplies its weight roughly ten thousand times. When the cocoons are complete, most are heated to prevent the moths from emerging and breaking the thread. The cocoons are then softened in hot water, and the ends of several threads are found and wound together onto a reel.',
  'C. For many centuries, China guarded the secret of silk production carefully. Silk cloth was exported along the trade routes that later became known as the Silk Road, and in Rome it was so highly valued that some writers complained about the amount of gold leaving the empire to pay for it. According to a story told by the historian Procopius, silkworm eggs were finally smuggled to the Byzantine Empire in the sixth century by monks who hid them inside hollow walking sticks.',
  'D. Silk production gradually spread across Asia and Europe. Central Asian cities became important centres of weaving, and in the Fergana Valley, which includes parts of modern Uzbekistan, silk has been produced for many centuries. The town of Margilan is still famous for atlas and adras, traditional fabrics decorated with patterns created by a technique known as ikat, in which the threads are tied and dyed before weaving so that the design appears as the cloth is woven.',
  'E. In Europe, Italy and France developed major silk industries from the late medieval period onwards, and in the nineteenth century the French city of Lyon was one of the world’s leading producers of silk cloth. In the 1850s and 1860s, however, a disease spread among silkworms in Europe, causing heavy losses. The scientist Louis Pasteur was asked to investigate, and he showed how infected eggs could be identified and removed, helping the industry to recover.',
  'F. In the twentieth century, synthetic fibres such as nylon, introduced in the 1930s, replaced silk in many uses, including stockings and parachutes. Nevertheless, silk remains valued for its softness, strength and shine, and China and India are now the world’s largest producers. Scientists are also exploring new uses for silk proteins, from surgical stitches to coatings that help fresh fruit last longer.',
];

const P2 = [
  'A. In 1995, after an absence of about seventy years, wolves were reintroduced to Yellowstone National Park in the United States. Wolves had been deliberately eliminated from the park in the early twentieth century, when they were regarded as dangerous predators that threatened livestock and game animals. Their return, with animals brought from Canada, was one of the most closely studied wildlife experiments in history.',
  'B. Without wolves, the number of elk in Yellowstone had grown considerably. The elk grazed heavily on young trees and shrubs, particularly willow and aspen along the rivers. When wolves returned, they began to hunt elk, and the elk population fell. According to some researchers, the elk also changed their behaviour, spending less time in open river valleys where they were more likely to be attacked.',
  'C. Some scientists argued that these changes set off a chain of effects through the ecosystem, a process known as a trophic cascade. With less grazing, willows and aspens were able to grow again in some places. Beavers, which use willow for food and building, increased in number, and their dams created ponds that provided habitats for fish, birds and amphibians. The return of vegetation along the riverbanks was even said to have reduced erosion.',
  'D. This account became widely known and was presented in popular films as evidence that a single species can transform a whole landscape. However, some ecologists have questioned how strong the effects really were. They point out that the recovery of trees has been patchy, and that other factors were changing at the same time. Hunting by humans outside the park, a series of dry years, and the growing number of bears and cougars, which also prey on young elk, all affected elk numbers.',
  'E. The question of whether elk really avoided risky areas has also been debated. Studies using GPS collars found that elk did not always move away from places where wolves were common, and that their behaviour depended on the time of day and the season. Some researchers concluded that the so-called landscape of fear was weaker than had been suggested, while others continued to find evidence of it in particular areas.',
  'F. Most scientists agree that the reintroduction of wolves has had important effects, but they emphasise that ecosystems are complex and that it is rarely possible to attribute changes to a single cause. The Yellowstone experience has nevertheless influenced debates about bringing back large predators elsewhere, including the return of wolves to parts of Europe. In such cases, the interests of farmers, whose animals may be attacked, must be balanced against the goals of conservation.',
];

const P3 = [
  'A. Few children today have many opportunities to be bored. Smartphones, tablets and organised activities fill much of their free time, and many parents feel that it is their responsibility to keep their children entertained. Yet a growing number of psychologists and educators argue that occasional boredom may be valuable, because it encourages children to use their imagination and to find their own ways of occupying themselves.',
  'B. Boredom is usually defined as an unpleasant state in which a person wants to be engaged in a satisfying activity but is unable to find one. Researchers distinguish it from relaxation, which is pleasant and chosen. Because boredom is uncomfortable, it acts as a signal: it tells us that what we are doing is not rewarding and pushes us to look for something more meaningful. In this sense, it has been compared with hunger or pain.',
  'C. Several studies have explored the link between boredom and creativity. In one well-known experiment, carried out in Britain, participants were first asked to copy numbers from a telephone directory for fifteen minutes, a deliberately dull task. They were then asked to think of as many uses as possible for a pair of plastic cups. Those who had done the boring task came up with more ideas than a group that had not, and the effect was stronger when the first task was even more boring.',
  'D. The explanation proposed by the researchers is that boredom leads the mind to wander, and daydreaming can produce unexpected connections between ideas. However, they also note that not all forms of boredom are helpful. Chronic boredom, which lasts for long periods, has been linked with anxiety, overeating and risky behaviour, especially among teenagers who feel they have nothing meaningful to do.',
  'E. Critics of the boredom-creativity research point out that the experiments were mostly small and carried out with adults rather than children. The tasks used to measure creativity, such as listing uses for everyday objects, may not reflect the kind of creativity that matters in real life. Some later studies have also failed to find a clear effect. More research is needed, they argue, before firm advice can be given to parents.',
  'F. Nevertheless, many educators suggest that children benefit from unstructured time in which no activity is planned for them. They do not recommend leaving children with nothing to do for long periods, but rather allowing them to experience short spells of boredom and to find their own solutions. Simple materials, such as paper, cardboard boxes or a garden, can provide the starting point for games and projects that children invent for themselves.',
];

const H2 = [
  'i. A deliberate return after many decades',
  'ii. Effects of too many grazing animals and their response to a predator',
  'iii. A chain of changes through the ecosystem',
  'iv. Doubts about a popular story',
  'v. Mixed evidence on fear and movement',
  'vi. Lessons for other places',
  'vii. Why wolves were moved from Canada',
  'viii. The economic cost of the project',
];

export const readingFull10: ReadingTest = {
  id: 'reading-full-10',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 10',
  minutes: 60,
  passageTitle: 'Reading Passage 1: The Thread of Silk',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: The Thread of Silk' },
    { at: P1.length, title: 'Reading Passage 2: The Return of the Wolves' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: In Praise of Boredom' },
  ],
  groups: [
    { instruction: 'Questions 1–6 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–13 (Passage 1): Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [7, 8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–26 (Passage 2): Choose the correct letter.', questionIds: [20, 21, 22, 23, 24, 25, 26] },
    { instruction: 'Questions 27–31 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [27, 28, 29, 30, 31] },
    { instruction: 'Questions 32–36 (Passage 3): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [32, 33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Choose the correct letter.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'tfng', text: 'Archaeological evidence confirms the story of the empress and the cup of tea.', answer: 'False', evidence: 'P1 A: "Whatever the truth of the story" — the evidence shows only that silk was produced at least five thousand years ago.' },
    { id: 2, type: 'tfng', text: 'Silkworms feed on the leaves of several different trees.', answer: 'False', evidence: 'P1 B: silkworms "eat only the leaves of the mulberry tree".' },
    { id: 3, type: 'tfng', text: 'Some Roman writers were unhappy about the money spent on silk.', answer: 'True', evidence: 'P1 C: "some writers complained about the amount of gold leaving the empire to pay for it".' },
    { id: 4, type: 'tfng', text: 'The monks who smuggled silkworm eggs were later rewarded by the emperor.', answer: 'Not Given', evidence: 'P1 C does not say whether the monks were rewarded.' },
    { id: 5, type: 'tfng', text: 'In ikat, the design is created by dyeing the threads before weaving.', answer: 'True', evidence: 'P1 D: "the threads are tied and dyed before weaving".' },
    { id: 6, type: 'tfng', text: 'Pasteur developed a medicine that cured infected silkworms.', answer: 'False', evidence: 'P1 E: he showed "how infected eggs could be identified and removed", not a cure.' },
    { id: 7, type: 'fill', text: 'A silkworm’s cocoon is made of a single continuous ______.', answers: ['thread'], evidence: 'P1 A: "a cocoon of a single continuous thread".' },
    { id: 8, type: 'fill', text: 'Silkworms eat only the leaves of the ______ tree.', answers: ['mulberry'], evidence: 'P1 B: "the leaves of the mulberry tree".' },
    { id: 9, type: 'fill', text: 'The cocoons are softened in hot water and the threads are wound onto a ______.', answers: ['reel'], evidence: 'P1 B: "wound together onto a reel".' },
    { id: 10, type: 'fill', text: 'Silkworm eggs were reportedly hidden inside hollow walking ______.', answers: ['sticks'], evidence: 'P1 C: "inside hollow walking sticks".' },
    { id: 11, type: 'fill', text: 'The town of ______ is famous for atlas and adras.', answers: ['margilan'], evidence: 'P1 D: "The town of Margilan is still famous for atlas and adras".' },
    { id: 12, type: 'fill', text: 'In the nineteenth century, ______ was a leading centre of silk cloth production.', answers: ['lyon'], evidence: 'P1 E: "the French city of Lyon was one of the world’s leading producers".' },
    { id: 13, type: 'fill', text: 'Nylon replaced silk in stockings and ______.', answers: ['parachutes'], evidence: 'P1 F: "including stockings and parachutes".' },
    // Passage 2
    { id: 14, type: 'match', text: 'Paragraph A', options: H2, answer: 0, evidence: 'P2 A: "after an absence of about seventy years, wolves were reintroduced".' },
    { id: 15, type: 'match', text: 'Paragraph B', options: H2, answer: 1, evidence: 'P2 B: elk "grazed heavily"; when wolves returned, the elk "also changed their behaviour".' },
    { id: 16, type: 'match', text: 'Paragraph C', options: H2, answer: 2, evidence: 'P2 C: "a chain of effects through the ecosystem, a process known as a trophic cascade".' },
    { id: 17, type: 'match', text: 'Paragraph D', options: H2, answer: 3, evidence: 'P2 D: "some ecologists have questioned how strong the effects really were".' },
    { id: 18, type: 'match', text: 'Paragraph E', options: H2, answer: 4, evidence: 'P2 E: GPS studies found mixed evidence on whether elk avoided risky areas.' },
    { id: 19, type: 'match', text: 'Paragraph F', options: H2, answer: 5, evidence: 'P2 F: Yellowstone "has nevertheless influenced debates about bringing back large predators elsewhere".' },
    { id: 20, type: 'mcq', text: 'Why were wolves removed from Yellowstone in the early twentieth century?', options: ['They carried disease.', 'They were seen as a threat to livestock and game animals.', 'They had become too few to survive.', 'Tourists were afraid of them.'], answer: 1, evidence: 'P2 A: they "were regarded as dangerous predators that threatened livestock and game animals".' },
    { id: 21, type: 'mcq', text: 'Where did the reintroduced wolves come from?', options: ['Alaska', 'Canada', 'Europe', 'Other American parks'], answer: 1, evidence: 'P2 A: "with animals brought from Canada".' },
    { id: 22, type: 'mcq', text: 'Which trees did elk graze heavily?', options: ['Pine and oak', 'Willow and aspen', 'Birch and maple', 'Mulberry and willow'], answer: 1, evidence: 'P2 B: "particularly willow and aspen along the rivers".' },
    { id: 23, type: 'mcq', text: 'How did beavers benefit other species?', options: ['They ate elk.', 'Their dams created ponds used by fish, birds and amphibians.', 'They planted trees.', 'They drove away bears.'], answer: 1, evidence: 'P2 C: "their dams created ponds that provided habitats for fish, birds and amphibians".' },
    { id: 24, type: 'mcq', text: 'Which of these is mentioned as another factor affecting elk numbers?', options: ['Disease among elk', 'Hunting by humans outside the park', 'A rise in tourism', 'Wet weather'], answer: 1, evidence: 'P2 D: "Hunting by humans outside the park, a series of dry years, and the growing number of bears and cougars".' },
    { id: 25, type: 'mcq', text: 'What did studies using GPS collars find?', options: ['Elk always avoided wolves.', 'Elk behaviour depended on time of day and season.', 'Elk left the park.', 'Wolves avoided elk.'], answer: 1, evidence: 'P2 E: "their behaviour depended on the time of day and the season".' },
    { id: 26, type: 'mcq', text: 'What do most scientists emphasise in the final paragraph?', options: ['Wolves alone caused all the changes.', 'It is rarely possible to attribute changes to a single cause.', 'Wolves should be removed again.', 'Farmers support predators.'], answer: 1, evidence: 'P2 F: "it is rarely possible to attribute changes to a single cause".' },
    // Passage 3
    { id: 27, type: 'tfng', text: 'Many parents feel they should keep their children entertained.', answer: 'True', evidence: 'P3 A: "many parents feel that it is their responsibility to keep their children entertained".' },
    { id: 28, type: 'tfng', text: 'Researchers treat boredom and relaxation as the same state.', answer: 'False', evidence: 'P3 B: "Researchers distinguish it from relaxation".' },
    { id: 29, type: 'tfng', text: 'In the British experiment, the boring task lasted fifteen minutes.', answer: 'True', evidence: 'P3 C: participants copied numbers "for fifteen minutes".' },
    { id: 30, type: 'tfng', text: 'Chronic boredom has been linked with anxiety.', answer: 'True', evidence: 'P3 D: "Chronic boredom … has been linked with anxiety".' },
    { id: 31, type: 'tfng', text: 'Most boredom experiments were carried out with young children.', answer: 'False', evidence: 'P3 E: they were "carried out with adults rather than children".' },
    { id: 32, type: 'fill', text: 'Boredom acts as a ______ that an activity is not rewarding.', answers: ['signal'], evidence: 'P3 B: "it acts as a signal".' },
    { id: 33, type: 'fill', text: 'It has been compared with hunger or ______.', answers: ['pain'], evidence: 'P3 B: "it has been compared with hunger or pain".' },
    { id: 34, type: 'fill', text: 'In the experiment, participants listed uses for plastic ______.', answers: ['cups'], evidence: 'P3 C: "uses for a pair of plastic cups".' },
    { id: 35, type: 'fill', text: 'Researchers think boredom causes the mind to ______.', answers: ['wander'], evidence: 'P3 D: "boredom leads the mind to wander".' },
    { id: 36, type: 'fill', text: '______ can produce unexpected connections between ideas.', answers: ['daydreaming'], evidence: 'P3 D: "daydreaming can produce unexpected connections between ideas".' },
    { id: 37, type: 'mcq', text: 'What happened when the first task was even more boring?', options: ['Participants gave up.', 'The effect on creativity was stronger.', 'Participants produced fewer ideas.', 'There was no difference.'], answer: 1, evidence: 'P3 C: "the effect was stronger when the first task was even more boring".' },
    { id: 38, type: 'mcq', text: 'What is one criticism of the boredom-creativity research?', options: ['The experiments were too large.', 'Creativity tasks may not reflect real-life creativity.', 'Children were not interested.', 'The results were never published.'], answer: 1, evidence: 'P3 E: the tasks "may not reflect the kind of creativity that matters in real life".' },
    { id: 39, type: 'mcq', text: 'What do many educators recommend?', options: ['Leaving children with nothing to do for long periods', 'Short spells of unstructured time', 'More organised activities', 'More screen time'], answer: 1, evidence: 'P3 F: "allowing them to experience short spells of boredom and to find their own solutions".' },
    { id: 40, type: 'mcq', text: 'Which of these is given as an example of simple materials?', options: ['Smartphones', 'Cardboard boxes', 'Telephone directories', 'Plastic cups'], answer: 1, evidence: 'P3 F: "paper, cardboard boxes or a garden".' },
  ],
};
