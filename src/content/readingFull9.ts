import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. In the 1960s, the Aral Sea, which lies between Kazakhstan and Uzbekistan, was the fourth-largest lake in the world, covering about 68,000 square kilometres. It supported a fishing industry that employed tens of thousands of people, and the port towns of Aralsk in the north and Moynaq in the south were busy centres of fish processing. The sea was fed by two great rivers, the Amu Darya and the Syr Darya, which carry water from the mountains of Central Asia.',
  'B. From the 1960s, the Soviet government greatly expanded irrigated agriculture in the region, especially for growing cotton. Large amounts of water were taken from the two rivers through a network of canals, many of which were unlined, so that much of the water soaked into the ground or evaporated before it reached the fields. As a result, the volume of water reaching the Aral Sea fell sharply, and the sea began to shrink.',
  'C. The consequences were severe. By the 1980s, the shoreline had retreated many kilometres from the old ports, leaving fishing boats stranded in the desert. As the water evaporated, the remaining sea became much saltier, and most native fish species disappeared. The commercial fishing industry collapsed, and many people left the region in search of work.',
  'D. The exposed seabed created further problems. It was covered with salt and with residues of fertilisers and pesticides that had been washed into the sea from farmland. Strong winds carried this dust over large areas, affecting farmland and, according to many reports, the health of local people. The climate around the sea also changed: without the moderating effect of a large body of water, summers became hotter and winters colder.',
  'E. By the late 1980s, the sea had split into two separate bodies of water: the smaller North Aral Sea and the larger South Aral Sea. In 2005, with support from the World Bank, Kazakhstan completed the Kokaral Dam, which prevents water from the Syr Darya flowing into the southern part. The level of the North Aral Sea rose by several metres within a few years, the water became less salty, and fish returned, allowing a fishing industry to restart.',
  'F. The South Aral Sea has had a different fate. Its eastern basin dried up almost completely in 2014, and the remaining water is extremely salty. In Uzbekistan, efforts have focused on planting drought-resistant shrubs, such as saxaul, on the former seabed to hold the soil in place and reduce dust storms. Most experts believe that restoring the entire sea is no longer possible, but the recovery of the northern part shows that careful water management can bring real improvements.',
];

const P2 = [
  'A. More than three hundred million tonnes of plastic are produced every year, and only a small proportion is recycled. Much of the rest is buried in landfill, burned or released into the environment, where it can remain for centuries. Scientists have therefore been interested in a surprising possibility: that living organisms could help to break plastic down.',
  'B. In 2016, a team of Japanese researchers reported that they had found a bacterium capable of feeding on PET, the plastic used to make most drinks bottles. They discovered it in samples collected outside a bottle-recycling plant, where it had apparently adapted to the plastic waste around it. The bacterium, later named Ideonella sakaiensis, produces two enzymes that work together to break PET into its basic chemical building blocks, which it then uses as food.',
  'C. The natural process is very slow: in the original experiments, it took the bacterium about six weeks to break down a thin film of plastic at a comfortable temperature. Scientists have since tried to improve the enzymes. In 2018, researchers studying the structure of one enzyme accidentally produced a version that worked faster than the original. Later work, using computer models and laboratory testing, created enzymes able to break down PET in a matter of hours or days.',
  'D. One attraction of this approach is that the building blocks produced by the enzymes can be used to make new plastic of the same quality as the original. Conventional mechanical recycling, in which plastic is cleaned, melted and remoulded, tends to reduce its quality each time, so that bottles are often turned into lower-value products such as clothing fibres. Enzymatic recycling could, in principle, allow the same material to be used again and again.',
  'E. Several companies are now developing enzymatic recycling on an industrial scale, and the first factories have been planned. However, important obstacles remain. Many enzymes work best at temperatures close to the point at which PET begins to soften, and plastic waste must usually be ground into small pieces before treatment. The cost of the process must also be competitive with producing new plastic from oil, which is often very cheap.',
  'F. Researchers stress that such technologies are not a solution to plastic pollution on their own. Enzymes that break down PET do not work on most other common plastics, such as polyethylene and polypropylene, and releasing plastic-eating organisms into the environment would raise serious questions about their effects. Reducing the amount of plastic produced and improving collection, they argue, remain the most important steps.',
];

const P3 = [
  'A. Almost everyone has had the experience of hearing a song and suddenly remembering a particular period of their life. Psychologists have found that music is especially effective at triggering memories of events from the past, and that these memories are often vivid and emotional. Studies in which participants listened to popular songs from different decades found that songs from their late teens and early twenties were most strongly associated with personal memories.',
  'B. One reason for the strength of these links may be the way music is processed in the brain. Listening to music involves many areas at once, including those concerned with hearing, movement, emotion and memory. Brain-imaging studies have found that familiar music activates a region near the front of the brain known as the medial prefrontal cortex, which is also involved in recalling information about ourselves. The more familiar and emotionally significant the music, the stronger the response.',
  'C. These findings have attracted particular interest from people caring for patients with dementia. Even when patients have lost the ability to remember recent events or to recognise members of their family, many can still sing the words of songs they learned when they were young. Researchers believe that musical memory may be stored partly in areas of the brain that are damaged relatively late in the course of the disease.',
  'D. Music-based activities have therefore been introduced in many care homes. Some programmes create personal playlists of songs that were important to each resident. Care staff report that listening to these songs can calm patients who are anxious, encourage them to talk and help them to connect with their families. A number of small studies have found reductions in agitation and in the use of some medicines, although larger trials have produced more mixed results.',
  'E. Music has also been studied as a tool for learning. Many people learned the alphabet as children by singing it, and some research suggests that setting information to a melody can help people remember it. However, the benefits appear to be limited. Music helps most when the melody is simple and familiar, and when the information is short; for longer and more complex material, learning the tune itself may take too much effort.',
  'F. Not all findings about music and the mind have stood up to closer examination. In 1993, a study reported that students who listened to a piece by Mozart performed better on a spatial reasoning task for a short time afterwards. The result was widely reported as evidence that listening to classical music makes people more intelligent, an idea that became known as the Mozart effect. Later studies found that the effect was small, short-lived and probably caused by improved mood and alertness rather than anything special about Mozart’s music.',
];

const P3LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export const readingFull9: ReadingTest = {
  id: 'reading-full-9',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 9',
  minutes: 60,
  passageTitle: 'Reading Passage 1: The Disappearing Sea',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: The Disappearing Sea' },
    { at: P1.length, title: 'Reading Passage 2: Bacteria That Eat Plastic' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: Music and Memory' },
  ],
  groups: [
    { instruction: 'Questions 1–7 (Passage 1): Complete the notes. Write ONE WORD ONLY from the passage for each answer.', questionIds: [1, 2, 3, 4, 5, 6, 7] },
    { instruction: 'Questions 8–13 (Passage 1): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): Choose the correct letter.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–26 (Passage 2): Complete the summary. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [20, 21, 22, 23, 24, 25, 26] },
    { instruction: 'Questions 27–32 (Passage 3): Which paragraph, A–F, contains the following information? Choose the correct letter.', questionIds: [27, 28, 29, 30, 31, 32] },
    { instruction: 'Questions 33–37 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [33, 34, 35, 36, 37] },
    { instruction: 'Questions 38–40 (Passage 3): Choose the correct letter.', questionIds: [38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'fill', text: 'Main crop grown with water from the rivers: ______', answers: ['cotton'], evidence: 'P1 B: "especially for growing cotton".' },
    { id: 2, type: 'fill', text: 'Many canals were ______, so water was lost into the ground', answers: ['unlined'], evidence: 'P1 B: "many of which were unlined, so that much of the water soaked into the ground".' },
    { id: 3, type: 'fill', text: 'As the sea shrank, the water became more ______', answers: ['salty', 'saltier'], evidence: 'P1 C: "the remaining sea became much saltier".' },
    { id: 4, type: 'fill', text: 'Dust from the seabed contained salt and residues of fertilisers and ______', answers: ['pesticides'], evidence: 'P1 D: "residues of fertilisers and pesticides".' },
    { id: 5, type: 'fill', text: 'Climate change: summers became hotter and winters ______', answers: ['colder'], evidence: 'P1 D: "summers became hotter and winters colder".' },
    { id: 6, type: 'fill', text: 'The Kokaral ______ helped the North Aral Sea to recover', answers: ['dam'], evidence: 'P1 E: "Kazakhstan completed the Kokaral Dam".' },
    { id: 7, type: 'fill', text: 'In Uzbekistan, shrubs such as ______ were planted on the former seabed', answers: ['saxaul'], evidence: 'P1 F: "drought-resistant shrubs, such as saxaul".' },
    { id: 8, type: 'tfng', text: 'In the 1960s, the Aral Sea was the largest lake in the world.', answer: 'False', evidence: 'P1 A: it "was the fourth-largest lake in the world".' },
    { id: 9, type: 'tfng', text: 'Moynaq was a centre of fish processing.', answer: 'True', evidence: 'P1 A: Aralsk and Moynaq "were busy centres of fish processing".' },
    { id: 10, type: 'tfng', text: 'Most native fish species survived the rise in salt levels.', answer: 'False', evidence: 'P1 C: "most native fish species disappeared".' },
    { id: 11, type: 'tfng', text: 'The Kokaral Dam was paid for entirely by Uzbekistan.', answer: 'False', evidence: 'P1 E: Kazakhstan completed the dam "with support from the World Bank".' },
    { id: 12, type: 'tfng', text: 'The North Aral Sea now has the same area as in the 1960s.', answer: 'Not Given', evidence: 'P1 E says its level rose by several metres but gives no comparison of area with the 1960s.' },
    { id: 13, type: 'tfng', text: 'Most experts think the whole sea can no longer be restored.', answer: 'True', evidence: 'P1 F: "Most experts believe that restoring the entire sea is no longer possible".' },
    // Passage 2
    { id: 14, type: 'mcq', text: 'Where was the PET-eating bacterium found?', options: ['In the ocean', 'Outside a bottle-recycling plant', 'In a university laboratory', 'In a landfill site in Europe'], answer: 1, evidence: 'P2 B: "samples collected outside a bottle-recycling plant".' },
    { id: 15, type: 'mcq', text: 'How long did the bacterium take to break down a thin film of plastic?', options: ['A few hours', 'About two days', 'About six weeks', 'Several years'], answer: 2, evidence: 'P2 C: "it took the bacterium about six weeks".' },
    { id: 16, type: 'mcq', text: 'How was a faster enzyme first produced in 2018?', options: ['By accident', 'By changing the temperature', 'By using a new bacterium', 'By adding chemicals'], answer: 0, evidence: 'P2 C: researchers "accidentally produced a version that worked faster".' },
    { id: 17, type: 'mcq', text: 'What is a weakness of mechanical recycling?', options: ['It is illegal in many countries.', 'It tends to reduce the quality of the plastic.', 'It needs bacteria.', 'It only works on clothing.'], answer: 1, evidence: 'P2 D: it "tends to reduce its quality each time".' },
    { id: 18, type: 'mcq', text: 'Which plastics are NOT broken down by PET enzymes?', options: ['Drinks bottles', 'Polyethylene and polypropylene', 'Thin PET films', 'Recycled PET'], answer: 1, evidence: 'P2 F: they "do not work on most other common plastics, such as polyethylene and polypropylene".' },
    { id: 19, type: 'mcq', text: 'What do researchers say are the most important steps against plastic pollution?', options: ['Releasing bacteria into the sea', 'Reducing plastic production and improving collection', 'Burning more plastic', 'Building more landfill sites'], answer: 1, evidence: 'P2 F: "Reducing the amount of plastic produced and improving collection … remain the most important steps."' },
    { id: 20, type: 'fill', text: 'Every year, more than three hundred million ______ of plastic are produced.', answers: ['tonnes'], evidence: 'P2 A: "More than three hundred million tonnes of plastic are produced every year".' },
    { id: 21, type: 'fill', text: 'Ideonella sakaiensis produces two ______ that work together.', answers: ['enzymes'], evidence: 'P2 B: it "produces two enzymes that work together".' },
    { id: 22, type: 'fill', text: 'The enzymes break PET into its basic chemical ______.', answers: ['building blocks'], evidence: 'P2 B: "break PET into its basic chemical building blocks".' },
    { id: 23, type: 'fill', text: 'Improved enzymes were created using ______ and laboratory testing.', answers: ['computer models'], evidence: 'P2 C: "using computer models and laboratory testing".' },
    { id: 24, type: 'fill', text: 'Bottles from mechanical recycling often become clothing ______.', answers: ['fibres'], evidence: 'P2 D: "lower-value products such as clothing fibres".' },
    { id: 25, type: 'fill', text: 'Plastic waste must usually be ______ into small pieces first.', answers: ['ground'], evidence: 'P2 E: "plastic waste must usually be ground into small pieces before treatment".' },
    { id: 26, type: 'fill', text: 'The process must compete on cost with new plastic made from ______.', answers: ['oil'], evidence: 'P2 E: "producing new plastic from oil, which is often very cheap".' },
    // Passage 3
    { id: 27, type: 'match', text: 'a claim about intelligence that was later found to be exaggerated', options: P3LETTERS, answer: 5, evidence: 'P3 F: the Mozart effect was "small, short-lived".' },
    { id: 28, type: 'match', text: 'the part of the brain that responds to familiar music', options: P3LETTERS, answer: 1, evidence: 'P3 B: familiar music "activates … the medial prefrontal cortex".' },
    { id: 29, type: 'match', text: 'the age at which songs are most linked to personal memories', options: P3LETTERS, answer: 0, evidence: 'P3 A: "songs from their late teens and early twenties were most strongly associated with personal memories".' },
    { id: 30, type: 'match', text: 'personal playlists for people in care homes', options: P3LETTERS, answer: 3, evidence: 'P3 D: "Some programmes create personal playlists".' },
    { id: 31, type: 'match', text: 'the limits of using songs to memorise information', options: P3LETTERS, answer: 4, evidence: 'P3 E: "the benefits appear to be limited".' },
    { id: 32, type: 'match', text: 'patients who can sing songs but not recognise family members', options: P3LETTERS, answer: 2, evidence: 'P3 C: patients who cannot "recognise members of their family" can "still sing the words of songs".' },
    { id: 33, type: 'tfng', text: 'Memories triggered by music are often emotional.', answer: 'True', evidence: 'P3 A: "these memories are often vivid and emotional".' },
    { id: 34, type: 'tfng', text: 'Listening to music uses only the brain’s hearing areas.', answer: 'False', evidence: 'P3 B: it "involves many areas at once, including those concerned with hearing, movement, emotion and memory".' },
    { id: 35, type: 'tfng', text: 'Large trials have all confirmed that music reduces agitation in dementia.', answer: 'False', evidence: 'P3 D: "larger trials have produced more mixed results".' },
    { id: 36, type: 'tfng', text: 'Music therapy in care homes is paid for by the government.', answer: 'Not Given', evidence: 'P3 D does not say who pays for the programmes.' },
    { id: 37, type: 'tfng', text: 'The 1993 study used a piece of music by Mozart.', answer: 'True', evidence: 'P3 F: students "listened to a piece by Mozart".' },
    { id: 38, type: 'mcq', text: 'Why might musical memory survive in dementia?', options: ['It is stored in areas damaged relatively late.', 'Patients practise singing every day.', 'Music cures the disease.', 'Songs are easier than words.'], answer: 0, evidence: 'P3 C: it "may be stored partly in areas of the brain that are damaged relatively late".' },
    { id: 39, type: 'mcq', text: 'When does setting information to music help most?', options: ['When the information is long and complex', 'When the melody is simple and familiar and the information is short', 'When the learner plays an instrument', 'When the music is classical'], answer: 1, evidence: 'P3 E: "when the melody is simple and familiar, and when the information is short".' },
    { id: 40, type: 'mcq', text: 'What probably explains the results of the 1993 study?', options: ['Special features of Mozart’s music', 'Improved mood and alertness', 'Higher intelligence of the students', 'Longer practice time'], answer: 1, evidence: 'P3 F: "probably caused by improved mood and alertness".' },
  ],
};
