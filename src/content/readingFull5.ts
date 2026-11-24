import type { ReadingTest } from './types';

// To'liq formatli IELTS Academic Reading mashq testi: 3 ta matn, 40 savol, 60 daqiqa.
// Original mashq materiali (Sellzen). Rasmiy IELTS materiali emas; metodist tekshiruvini kutmoqda (PXD-05).
const P1 = [
  'A. In the dry lands of Iran, Central Asia and North Africa, farmers faced a problem for thousands of years: water was available deep underground at the foot of the mountains, but the fields lay far away on the plains. The solution they developed was the qanat, a gently sloping underground tunnel that carries groundwater by gravity from an aquifer to the surface. The oldest known qanats in Iran are believed to be around three thousand years old, and some of them are still in use.',
  'B. Building a qanat began with the search for water. A specialist digger, known in Persian as a muqanni, would sink a test well near the foot of a hill to find the level of the water table. If enough water was found, this became the mother well. The team then dug a line of vertical shafts across the plain, usually twenty to thirty metres apart, and connected their bottoms with a tunnel that sloped very slightly downwards towards the fields.',
  'C. The shafts served several purposes. They allowed the diggers to remove soil from the tunnel, supplied fresh air to the men working underground and provided access for repairs. From the air, a qanat can be recognised by the long line of circular mounds of earth around the openings of these shafts, which stretch across the landscape like a row of craters.',
  'D. The gradient of the tunnel was critical. If it was too steep, the fast-flowing water would wear away the walls and cause them to collapse; if it was too shallow, the water would hardly move. Experienced diggers judged the slope with simple instruments and great skill, and the work was dangerous: collapses and lack of air killed many of them. A long qanat could take years, or even decades, to complete.',
  'E. Because the water travels underground, very little of it is lost through evaporation, a major advantage in hot climates. The flow cannot be switched off, so communities developed detailed rules for sharing it. In many villages, each family was entitled to the water for a fixed number of hours, measured in traditional ways, and these rights could be inherited or sold.',
  'F. In the twentieth century, many qanats fell into disuse. Diesel and electric pumps made it possible to extract groundwater quickly from deep wells, and young people moved to the cities, leaving fewer workers to maintain the old tunnels. However, pumping has caused water tables to fall in many regions, and some qanats have dried up as a result. In 2016, eleven Persian qanats were added to the UNESCO World Heritage list, and there is renewed interest in them as an example of sustainable water management.',
];

const P2 = [
  'A. All animals with a nervous system appear to need some form of rest, but the way they sleep varies enormously. Giraffes in the wild may sleep for less than five hours a day, often in short periods of a few minutes, while some bats sleep for nearly twenty hours. Large plant-eating animals generally sleep less than small ones, possibly because they need to spend so much time feeding and because lying down makes them vulnerable to predators.',
  'B. Some animals have developed remarkable ways of sleeping without losing contact with their surroundings. Dolphins and some other marine mammals rest one half of the brain at a time while the other half remains alert. This allows them to continue swimming and to come up to the surface to breathe. A similar ability has been found in some birds, which can sleep with one eye open, watching for danger, especially when they are at the edge of a group.',
  'C. Birds that migrate long distances face a particular problem. In 2016, researchers fitted small devices that recorded brain activity to frigatebirds, which can stay in the air for weeks while crossing the ocean. They found that the birds did sleep while flying, but only for about forty minutes a day in total, mostly in periods of a few seconds. On land, the same birds slept for more than twelve hours a day, which suggests that they were able to cope with a severe lack of sleep for limited periods.',
  'D. Why sleep exists at all is still debated. One theory is that it saves energy, since body temperature and metabolism fall during sleep. Another is that it allows the brain to carry out maintenance work, such as clearing away waste products that build up during the day. A third theory links sleep to memory and learning, pointing to experiments in which animals deprived of sleep perform worse at tasks they have recently learned.',
  'E. Studying sleep in wild animals is difficult. Much early research was carried out on animals in zoos and laboratories, where they are safe and well fed and may sleep far more than they would in nature. When researchers measured the sleep of wild sloths in Panama, for example, they found that the animals slept less than ten hours a day, compared with the almost sixteen hours recorded in captivity.',
  'F. Such findings have led some scientists to argue that the amount of sleep an animal takes is shaped by its environment as much as by its biology. Animals appear to adjust their sleep to the risks and opportunities around them, sleeping less when food is scarce or danger is near. Understanding this flexibility may eventually help to explain why humans, too, vary so much in how much sleep they need.',
];

const P3 = [
  'A. In medical research, a placebo is a treatment with no active ingredient, such as a sugar pill or an injection of salt water, given to patients who believe it may be real. For more than half a century, placebos have been used in clinical trials as a point of comparison: a new drug is considered effective only if it produces better results than a placebo. But the fact that many patients improve after taking a placebo has itself become a subject of scientific study.',
  'B. The placebo effect is strongest for symptoms that people experience and report themselves, such as pain, nausea and tiredness. It has little or no effect on conditions that can be measured objectively, such as the growth of a tumour or the level of a substance in the blood. Researchers have found that the details of a treatment can influence its effect: in some studies, two pills worked better than one, injections worked better than pills, and expensive-looking treatments worked better than cheap ones.',
  'C. Brain-imaging studies have helped to show that placebo effects are not simply imaginary. When patients who expect pain relief receive a placebo, areas of the brain involved in processing pain become less active, and the brain releases its own natural painkillers. In one well-known experiment, a drug that blocks these natural painkillers also reduced the effect of the placebo, suggesting that the two are directly connected.',
  'D. Expectation appears to be a key factor, but it is not the only one. Learning also plays a role: a person who has repeatedly taken an effective medicine may respond to an identical-looking pill even without being told what it is. The relationship between doctor and patient matters too. In a study of patients with a common digestive disorder, those who received a placebo together with warm and attentive care from a practitioner reported greater improvement than those who received the same placebo with little attention.',
  'E. Perhaps the most surprising finding concerns so-called open-label placebos. In several studies, patients were told openly that they were receiving inactive pills, but that such pills had helped other people through the mind–body connection. Many of these patients still reported meaningful improvement in their symptoms. The studies were small, and researchers caution that further work is needed, but the results challenge the assumption that deception is necessary for a placebo to work.',
  'F. The use of placebos in ordinary medical practice raises difficult ethical questions. Giving a patient a treatment without telling them it is inactive may damage the trust between doctor and patient. On the other hand, some researchers argue that understanding the placebo effect could help doctors to make real treatments more effective, by paying attention to the way medicines are explained and to the patient’s expectations. In this sense, they suggest, every treatment contains a placebo element.',
];

const H1 = [
  'i. Finding the source',
  'ii. A long-lasting solution to a dry climate',
  'iii. Openings with more than one function',
  'iv. A delicate and dangerous task',
  'v. Rules for a constant supply',
  'vi. Decline and a new appreciation',
  'vii. The cost of building materials',
];

export const readingFull5: ReadingTest = {
  id: 'reading-full-5',
  level: 'C1',
  title: 'IELTS Academic Reading — to‘liq mock 5',
  minutes: 60,
  passageTitle: 'Reading Passage 1: Underground Water Channels of the Desert',
  paragraphs: [...P1, ...P2, ...P3],
  sections: [
    { at: 0, title: 'Reading Passage 1: Underground Water Channels of the Desert' },
    { at: P1.length, title: 'Reading Passage 2: How Animals Sleep' },
    { at: P1.length + P2.length, title: 'Reading Passage 3: The Power of the Placebo' },
  ],
  groups: [
    { instruction: 'Questions 1–6 (Passage 1): The passage has six paragraphs, A–F. Choose the correct heading for each paragraph from the list of headings.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–13 (Passage 1): Complete the sentences. Write NO MORE THAN TWO WORDS from the passage for each answer.', questionIds: [7, 8, 9, 10, 11, 12, 13] },
    { instruction: 'Questions 14–19 (Passage 2): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [14, 15, 16, 17, 18, 19] },
    { instruction: 'Questions 20–23 (Passage 2): Choose the correct letter.', questionIds: [20, 21, 22, 23] },
    { instruction: 'Questions 24–26 (Passage 2): Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [24, 25, 26] },
    { instruction: 'Questions 27–31 (Passage 3): Choose the correct letter.', questionIds: [27, 28, 29, 30, 31] },
    { instruction: 'Questions 32–36 (Passage 3): Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.', questionIds: [32, 33, 34, 35, 36] },
    { instruction: 'Questions 37–40 (Passage 3): Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [37, 38, 39, 40] },
  ],
  questions: [
    // Passage 1
    { id: 1, type: 'match', text: 'Paragraph A', options: H1, answer: 1, evidence: 'P1 A: qanats solved the problem of water in dry lands, and "some of them are still in use".' },
    { id: 2, type: 'match', text: 'Paragraph B', options: H1, answer: 0, evidence: 'P1 B: "Building a qanat began with the search for water."' },
    { id: 3, type: 'match', text: 'Paragraph C', options: H1, answer: 2, evidence: 'P1 C: "The shafts served several purposes."' },
    { id: 4, type: 'match', text: 'Paragraph D', options: H1, answer: 3, evidence: 'P1 D: "The gradient of the tunnel was critical" and "the work was dangerous".' },
    { id: 5, type: 'match', text: 'Paragraph E', options: H1, answer: 4, evidence: 'P1 E: "The flow cannot be switched off, so communities developed detailed rules for sharing it."' },
    { id: 6, type: 'match', text: 'Paragraph F', options: H1, answer: 5, evidence: 'P1 F: many qanats "fell into disuse", but there is "renewed interest in them".' },
    { id: 7, type: 'fill', text: 'A qanat carries groundwater from an ______ to the surface.', answers: ['aquifer'], evidence: 'P1 A: "carries groundwater by gravity from an aquifer to the surface".' },
    { id: 8, type: 'fill', text: 'The first test well that found enough water became the ______.', answers: ['mother well'], evidence: 'P1 B: "this became the mother well".' },
    { id: 9, type: 'fill', text: 'The tunnel sloped very ______ downwards towards the fields.', answers: ['slightly'], evidence: 'P1 B: "a tunnel that sloped very slightly downwards towards the fields".' },
    { id: 10, type: 'fill', text: 'Around each shaft opening there is a circular ______ of earth.', answers: ['mound', 'mounds'], evidence: 'P1 C: "the long line of circular mounds of earth".' },
    { id: 11, type: 'fill', text: 'If the tunnel was too steep, the walls could ______.', answers: ['collapse'], evidence: 'P1 D: the water "would wear away the walls and cause them to collapse".' },
    { id: 12, type: 'fill', text: 'Underground water loses very little through ______.', answers: ['evaporation'], evidence: 'P1 E: "very little of it is lost through evaporation".' },
    { id: 13, type: 'fill', text: 'Many qanats fell out of use after the arrival of diesel and ______ pumps.', answers: ['electric'], evidence: 'P1 F: "Diesel and electric pumps made it possible to extract groundwater".' },
    // Passage 2
    { id: 14, type: 'tfng', text: 'Wild giraffes may sleep for less than five hours a day.', answer: 'True', evidence: 'P2 A: "Giraffes in the wild may sleep for less than five hours a day".' },
    { id: 15, type: 'tfng', text: 'Small plant-eating animals generally sleep less than large ones.', answer: 'False', evidence: 'P2 A: "Large plant-eating animals generally sleep less than small ones".' },
    { id: 16, type: 'tfng', text: 'Dolphins can keep swimming while part of the brain rests.', answer: 'True', evidence: 'P2 B: they rest "one half of the brain at a time" and can "continue swimming".' },
    { id: 17, type: 'tfng', text: 'Frigatebirds sleep more in the air than on land.', answer: 'False', evidence: 'P2 C: about forty minutes a day in the air, "more than twelve hours a day" on land.' },
    { id: 18, type: 'tfng', text: 'The devices fitted to frigatebirds were later used on dolphins.', answer: 'Not Given', evidence: 'P2 C does not say the devices were used on other animals.' },
    { id: 19, type: 'tfng', text: 'Zoo animals may sleep more than the same animals in the wild.', answer: 'True', evidence: 'P2 E: in zoos and laboratories animals "may sleep far more than they would in nature".' },
    { id: 20, type: 'mcq', text: 'Why might some birds sleep with one eye open?', options: ['To find food', 'To watch for danger', 'To keep warm', 'To follow the group’s direction'], answer: 1, evidence: 'P2 B: they sleep "with one eye open, watching for danger".' },
    { id: 21, type: 'mcq', text: 'What did the frigatebird study suggest?', options: ['The birds never sleep while flying.', 'The birds can manage with very little sleep for a time.', 'The birds sleep only at night.', 'The birds sleep more during long flights.'], answer: 1, evidence: 'P2 C: "they were able to cope with a severe lack of sleep for limited periods".' },
    { id: 22, type: 'mcq', text: 'How long did wild sloths in Panama sleep?', options: ['Almost sixteen hours a day', 'About twenty hours a day', 'Less than ten hours a day', 'About forty minutes a day'], answer: 2, evidence: 'P2 E: "the animals slept less than ten hours a day".' },
    { id: 23, type: 'mcq', text: 'What do some scientists conclude in the last paragraph?', options: ['Sleep is controlled only by biology.', 'The environment strongly influences how much animals sleep.', 'Humans need more sleep than animals.', 'Wild animals cannot be studied.'], answer: 1, evidence: 'P2 F: sleep "is shaped by its environment as much as by its biology".' },
    { id: 24, type: 'fill', text: 'One theory says that sleep saves ______, because metabolism falls.', answers: ['energy'], evidence: 'P2 D: "One theory is that it saves energy".' },
    { id: 25, type: 'fill', text: 'Another says the brain clears away ______ products during sleep.', answers: ['waste'], evidence: 'P2 D: "clearing away waste products that build up during the day".' },
    { id: 26, type: 'fill', text: 'A third links sleep to memory and ______.', answers: ['learning'], evidence: 'P2 D: "A third theory links sleep to memory and learning".' },
    // Passage 3
    { id: 27, type: 'mcq', text: 'How are placebos used in clinical trials?', options: ['To reduce the cost of a trial', 'As a point of comparison for new drugs', 'To treat patients who refuse drugs', 'To measure blood levels'], answer: 1, evidence: 'P3 A: placebos "have been used in clinical trials as a point of comparison".' },
    { id: 28, type: 'mcq', text: 'For which kind of condition is the placebo effect strongest?', options: ['Symptoms that people report themselves', 'The growth of tumours', 'Levels of substances in the blood', 'Broken bones'], answer: 0, evidence: 'P3 B: "strongest for symptoms that people experience and report themselves".' },
    { id: 29, type: 'mcq', text: 'What did brain-imaging studies show?', options: ['Placebo effects are imaginary.', 'The brain releases natural painkillers.', 'Pain areas become more active.', 'Only injections affect the brain.'], answer: 1, evidence: 'P3 C: "the brain releases its own natural painkillers".' },
    { id: 30, type: 'mcq', text: 'In the study of a digestive disorder, which patients improved most?', options: ['Those who received a real drug', 'Those who received no treatment', 'Those who received a placebo with warm care', 'Those who received a placebo with little attention'], answer: 2, evidence: 'P3 D: those with "warm and attentive care from a practitioner reported greater improvement".' },
    { id: 31, type: 'mcq', text: 'What do researchers say about open-label placebo studies?', options: ['They prove deception is necessary.', 'They were small and need further work.', 'They were carried out on animals.', 'They showed no improvement.'], answer: 1, evidence: 'P3 E: "The studies were small, and researchers caution that further work is needed".' },
    { id: 32, type: 'tfng', text: 'A placebo contains no active ingredient.', answer: 'True', evidence: 'P3 A: "a placebo is a treatment with no active ingredient".' },
    { id: 33, type: 'tfng', text: 'In some studies, two pills had a stronger effect than one.', answer: 'True', evidence: 'P3 B: "two pills worked better than one".' },
    { id: 34, type: 'tfng', text: 'A drug that blocks natural painkillers made the placebo work better.', answer: 'False', evidence: 'P3 C: it "also reduced the effect of the placebo".' },
    { id: 35, type: 'tfng', text: 'Open-label placebos are now widely prescribed by doctors.', answer: 'Not Given', evidence: 'P3 E describes small studies; nothing is said about doctors prescribing them widely.' },
    { id: 36, type: 'tfng', text: 'Some researchers believe every treatment includes a placebo element.', answer: 'True', evidence: 'P3 F: "every treatment contains a placebo element".' },
    { id: 37, type: 'fill', text: 'A typical placebo might be a ______ pill.', answers: ['sugar'], evidence: 'P3 A: "such as a sugar pill".' },
    { id: 38, type: 'fill', text: '______ appears to be a key factor in the placebo effect.', answers: ['expectation'], evidence: 'P3 D: "Expectation appears to be a key factor".' },
    { id: 39, type: 'fill', text: 'Patients in open-label studies were told the pills were ______.', answers: ['inactive'], evidence: 'P3 E: "they were receiving inactive pills".' },
    { id: 40, type: 'fill', text: 'Secretly giving a placebo may damage the ______ between doctor and patient.', answers: ['trust'], evidence: 'P3 F: "may damage the trust between doctor and patient".' },
  ],
};
