import type { ReadingTest } from './types';

// IELTS zinapoyasi uchun qo'shimcha Reading mini-testlari (har darajaga 2 tadan): IELTS savol turlari, matn o'quvchi darajasida.
// Original mashq matnlari (Sellzen). Rasmiy IELTS materiali emas.

const TFNG = (from: number, to: number) => `Questions ${from}–${to}: Do the following statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.`;

// ---------- A2 ----------
export const reading11: ReadingTest = {
  id: 'reading-11', level: 'A2', title: 'Reading mini-test 11: A Family Bakery', minutes: 12,
  passageTitle: 'A Family Bakery',
  paragraphs: [
    'A. Dilnoza’s family has a small bakery in Namangan. Her grandfather opened it forty years ago, and now her father and mother work there every day. The bakery is on a quiet street near a school.',
    'B. The day starts very early. Dilnoza’s father begins work at four o’clock in the morning, because the bread must be ready when the shop opens at seven. He makes round bread in a traditional clay oven called a tandir. On a normal day, he bakes about three hundred loaves.',
    'C. Her mother makes cakes and sweet pastries. These are popular with students from the school, who often buy something on their way home. On Fridays, she also makes a special bread with onions, and people sometimes wait outside before the shop opens.',
    'D. Dilnoza is nineteen and studies business at college. She helps in the bakery at weekends. Last year, she started a page for the bakery on social media. Now customers can see photos of new cakes and order them for birthdays and weddings.',
    'E. Her father is happy with the changes, but he says the most important thing has not changed: good flour, hot ovens and hard work. Dilnoza hopes to open a second shop in the city centre one day.',
  ],
  groups: [
    { instruction: TFNG(1, 5), questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–8: Choose the correct letter.', questionIds: [6, 7, 8] },
    { instruction: 'Questions 9–11: Complete the sentences. Write ONE WORD AND/OR A NUMBER from the passage for each answer.', questionIds: [9, 10, 11] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'Dilnoza’s grandfather started the bakery.', answer: 'True', evidence: 'A: "Her grandfather opened it forty years ago".' },
    { id: 2, type: 'tfng', text: 'The bakery is in the centre of Namangan.', answer: 'False', evidence: 'A: "on a quiet street near a school"; E: she hopes to open a shop in the city centre.' },
    { id: 3, type: 'tfng', text: 'The shop opens at four o’clock in the morning.', answer: 'False', evidence: 'B: father begins work at four; "the shop opens at seven".' },
    { id: 4, type: 'tfng', text: 'The bakery sells more cakes than bread.', answer: 'Not Given', evidence: 'The text gives the number of loaves but not the number of cakes sold.' },
    { id: 5, type: 'tfng', text: 'Dilnoza works in the bakery on Saturdays and Sundays.', answer: 'True', evidence: 'D: "She helps in the bakery at weekends."' },
    { id: 6, type: 'mcq', text: 'Who often buys cakes and pastries?', options: ['Teachers', 'Students from the school', 'Tourists'], answer: 1, evidence: 'C: "popular with students from the school".' },
    { id: 7, type: 'mcq', text: 'What is special about Fridays?', options: ['The shop closes early.', 'There is bread with onions.', 'Cakes are cheaper.'], answer: 1, evidence: 'C: "On Fridays, she also makes a special bread with onions".' },
    { id: 8, type: 'mcq', text: 'What can customers do on the bakery’s social media page?', options: ['Order cakes for special days', 'Learn to make bread', 'Pay for their bread'], answer: 0, evidence: 'D: customers can "order them for birthdays and weddings".' },
    { id: 9, type: 'fill', text: 'The bread is made in a clay oven called a ______.', answers: ['tandir'], evidence: 'B: "a traditional clay oven called a tandir".' },
    { id: 10, type: 'fill', text: 'Dilnoza’s father bakes about ______ loaves a day.', answers: ['three hundred', '300'], evidence: 'B: "he bakes about three hundred loaves".' },
    { id: 11, type: 'fill', text: 'Dilnoza studies ______ at college.', answers: ['business'], evidence: 'D: "studies business at college".' },
  ],
};

export const reading12: ReadingTest = {
  id: 'reading-12', level: 'A2', title: 'Reading mini-test 12: The Night Sky Club', minutes: 12,
  passageTitle: 'The Night Sky Club',
  paragraphs: [
    'A. Every Thursday evening, about twenty students meet on the roof of School Number 12. They are members of the Night Sky Club. The club started three years ago, when a physics teacher, Mr Saidov, brought his own telescope to school.',
    'B. At first, only five students came. Now the club is so popular that new members must wait for a place. Students from twelve to seventeen years old can join, and membership is free.',
    'C. In each meeting, Mr Saidov talks for about fifteen minutes about a planet, a star or the Moon. Then the students use the telescopes. The school now has three telescopes, because parents collected money to buy two more.',
    'D. The best nights are clear and cold. When it is cloudy, the club stays inside and watches films about space or does experiments. In summer, there are no meetings, because it does not get dark until very late.',
    'E. Two former members now study physics at university. One of them, Laylo, says the club changed her life: before she joined, she did not like science at all. Mr Saidov wants to take the club to a mountain camp next spring, where the sky is darker than in the city.',
  ],
  groups: [
    { instruction: TFNG(1, 5), questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–8: Choose the correct letter.', questionIds: [6, 7, 8] },
    { instruction: 'Questions 9–11: Complete the sentences. Write ONE WORD AND/OR A NUMBER from the passage for each answer.', questionIds: [9, 10, 11] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'The club meets once a week.', answer: 'True', evidence: 'A: "Every Thursday evening".' },
    { id: 2, type: 'tfng', text: 'Students have to pay to join the club.', answer: 'False', evidence: 'B: "membership is free".' },
    { id: 3, type: 'tfng', text: 'The first telescope belonged to Mr Saidov.', answer: 'True', evidence: 'A: he "brought his own telescope to school".' },
    { id: 4, type: 'tfng', text: 'Most members want to become scientists.', answer: 'Not Given', evidence: 'E mentions two former members studying physics, but not what most members want.' },
    { id: 5, type: 'tfng', text: 'The club meets every week of the year.', answer: 'False', evidence: 'D: "In summer, there are no meetings".' },
    { id: 6, type: 'mcq', text: 'How did the school get two more telescopes?', options: ['The city gave them.', 'Parents collected money.', 'Students made them.'], answer: 1, evidence: 'C: "parents collected money to buy two more".' },
    { id: 7, type: 'mcq', text: 'What does the club do on cloudy nights?', options: ['It cancels the meeting.', 'It watches films or does experiments.', 'It goes to the mountains.'], answer: 1, evidence: 'D: "watches films about space or does experiments".' },
    { id: 8, type: 'mcq', text: 'How did Laylo feel about science before she joined?', options: ['She did not like it.', 'She loved it.', 'She was good at it.'], answer: 0, evidence: 'E: "she did not like science at all".' },
    { id: 9, type: 'fill', text: 'When the club started, only ______ students came.', answers: ['five', '5'], evidence: 'B: "At first, only five students came."' },
    { id: 10, type: 'fill', text: 'Mr Saidov talks for about ______ minutes at the start of each meeting.', answers: ['fifteen', '15'], evidence: 'C: "for about fifteen minutes".' },
    { id: 11, type: 'fill', text: 'Next spring, the club may go to a mountain ______.', answers: ['camp'], evidence: 'E: "take the club to a mountain camp".' },
  ],
};

// ---------- B1 ----------
export const reading13: ReadingTest = {
  id: 'reading-13', level: 'B1', title: 'Reading mini-test 13: The Kitchen That Feeds a Neighbourhood', minutes: 15,
  passageTitle: 'The Kitchen That Feeds a Neighbourhood',
  paragraphs: [
    'A. In an old building near the railway station, a group of volunteers cooks lunch for anyone who needs it. The community kitchen opened five years ago with one gas cooker and a few borrowed pans. Today it serves around two hundred meals every weekday, and nobody is asked to explain why they have come.',
    'B. Most of the food is donated. Supermarkets give fruit and vegetables that are close to their sell-by date but still perfectly good to eat, and local farmers bring what they cannot sell at the market. The organisers estimate that without these donations, the kitchen would need about four times more money to operate.',
    'C. The visitors are a mixed group. Some are elderly people living alone on small pensions; others are students, workers on low wages or families who have had an unexpected expense. For many of them, the meal is only part of the reason for coming. “People come for the food,” says the founder, Gulnora Rashidova, “but they come back for the company.”',
    'D. Running the kitchen is not easy. Volunteers must follow strict hygiene rules, and the building needs repairs that the kitchen cannot yet afford. Finding enough helpers for the busy winter months is also a constant problem, because many volunteers are students who go home during the holidays.',
    'E. Recently, the kitchen started a cooking class on Saturday mornings. Visitors learn to make cheap, healthy dishes from simple ingredients, and some of them have later become volunteers themselves. Ms Rashidova believes this is the kitchen’s greatest success: turning people who receive help into people who give it.',
  ],
  groups: [
    { instruction: TFNG(1, 5), questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Choose the correct letter.', questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–12: Complete the sentences. Write NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.', questionIds: [10, 11, 12] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'Visitors must explain why they need a free meal.', answer: 'False', evidence: 'A: "nobody is asked to explain why they have come".' },
    { id: 2, type: 'tfng', text: 'The food from supermarkets is unsafe to eat.', answer: 'False', evidence: 'B: it is "still perfectly good to eat".' },
    { id: 3, type: 'tfng', text: 'The kitchen receives money from the city government.', answer: 'Not Given', evidence: 'B discusses donated food, not government money.' },
    { id: 4, type: 'tfng', text: 'Many visitors value meeting other people.', answer: 'True', evidence: 'C: "they come back for the company".' },
    { id: 5, type: 'tfng', text: 'It is harder to find volunteers in winter.', answer: 'True', evidence: 'D: "Finding enough helpers for the busy winter months is also a constant problem".' },
    { id: 6, type: 'mcq', text: 'How did the kitchen begin?', options: ['With a large grant', 'With very little equipment', 'In a new building', 'With paid cooks'], answer: 1, evidence: 'A: "one gas cooker and a few borrowed pans".' },
    { id: 7, type: 'mcq', text: 'According to the organisers, what would happen without donated food?', options: ['The kitchen would close at weekends.', 'It would cost about four times more to run.', 'Fewer students would volunteer.', 'Meals would be smaller.'], answer: 1, evidence: 'B: "the kitchen would need about four times more money to operate".' },
    { id: 8, type: 'mcq', text: 'Why are there fewer volunteers during the holidays?', options: ['The building is closed.', 'Many volunteers are students who go home.', 'The hygiene rules change.', 'There are fewer visitors.'], answer: 1, evidence: 'D: "many volunteers are students who go home during the holidays".' },
    { id: 9, type: 'mcq', text: 'What does Ms Rashidova see as the kitchen’s greatest success?', options: ['Serving two hundred meals a day', 'Getting food from farmers', 'People who were helped becoming helpers', 'Repairing the building'], answer: 2, evidence: 'E: "turning people who receive help into people who give it".' },
    { id: 10, type: 'fill', text: 'The kitchen serves about ______ meals every weekday.', answers: ['two hundred', '200'], evidence: 'A: "around two hundred meals every weekday".' },
    { id: 11, type: 'fill', text: 'Some visitors are elderly people who live on small ______.', answers: ['pensions'], evidence: 'C: "living alone on small pensions".' },
    { id: 12, type: 'fill', text: 'Volunteers have to follow strict ______ rules.', answers: ['hygiene'], evidence: 'D: "Volunteers must follow strict hygiene rules".' },
  ],
};

export const reading14: ReadingTest = {
  id: 'reading-14', level: 'B1', title: 'Reading mini-test 14: Why Board Games Are Back', minutes: 15,
  passageTitle: 'Why Board Games Are Back',
  paragraphs: [
    'A. Twenty years ago, many people expected board games to disappear. Video games were becoming more realistic every year, and it seemed that nobody would want to sit around a table moving pieces of wood and cardboard. Instead, the opposite has happened: sales of board games have grown steadily, and new games are published every week.',
    'B. One reason is the games themselves. Older family games often depended mostly on luck, so players could not do much to change the result. Many modern games are different. They ask players to plan, trade and cooperate, and in some of them everyone works together against the game instead of against each other.',
    'C. Another reason is social. People spend much of the day looking at screens, and a board game offers a chance to meet face to face. Board game cafés, where customers pay a small fee to play from a large collection, have opened in many cities. Staff explain the rules, so customers do not have to read long instruction books.',
    'D. The internet has also helped, even though board games are not digital. Designers can now raise money for a new game by asking future players to pay for it in advance online. Videos that show how to play a game have made it easier for people to choose what to buy.',
    'E. Teachers have noticed the trend too. Some use games in class to practise maths, history or languages, because students are often more willing to make mistakes in a game. However, critics warn that the best modern games can be expensive, and that some are so complicated that they take longer to learn than to play.',
  ],
  groups: [
    { instruction: TFNG(1, 5), questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Choose the correct letter.', questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–12: Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [10, 11, 12] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'Board game sales have fallen in the last twenty years.', answer: 'False', evidence: 'A: "sales of board games have grown steadily".' },
    { id: 2, type: 'tfng', text: 'In some modern games, all the players work as a team.', answer: 'True', evidence: 'B: "everyone works together against the game".' },
    { id: 3, type: 'tfng', text: 'Board game cafés are more popular with students than with families.', answer: 'Not Given', evidence: 'C describes the cafés but does not compare types of customers.' },
    { id: 4, type: 'tfng', text: 'In board game cafés, customers must learn the rules from books.', answer: 'False', evidence: 'C: "Staff explain the rules, so customers do not have to read long instruction books."' },
    { id: 5, type: 'tfng', text: 'Some board games are now paid for by players before they are made.', answer: 'True', evidence: 'D: designers ask "future players to pay for it in advance online".' },
    { id: 6, type: 'mcq', text: 'What was a problem with many older family games?', options: ['They were too expensive.', 'The result depended mostly on luck.', 'They took too long.', 'They needed many players.'], answer: 1, evidence: 'B: "Older family games often depended mostly on luck".' },
    { id: 7, type: 'mcq', text: 'According to paragraph C, why do people play board games?', options: ['To win money', 'To meet people face to face', 'To learn new rules', 'To avoid going out'], answer: 1, evidence: 'C: "a chance to meet face to face".' },
    { id: 8, type: 'mcq', text: 'How have online videos helped board games?', options: ['They replace the games.', 'They help people decide what to buy.', 'They make games cheaper.', 'They teach designers.'], answer: 1, evidence: 'D: videos "have made it easier for people to choose what to buy".' },
    { id: 9, type: 'mcq', text: 'Why do some teachers use games in class?', options: ['Students are less afraid of making mistakes.', 'Games are cheaper than books.', 'Lessons become shorter.', 'Parents ask for them.'], answer: 0, evidence: 'E: "students are often more willing to make mistakes in a game".' },
    { id: 10, type: 'fill', text: 'Many modern games ask players to plan, ______ and cooperate.', answers: ['trade'], evidence: 'B: "They ask players to plan, trade and cooperate".' },
    { id: 11, type: 'fill', text: 'Customers at board game cafés pay a small ______.', answers: ['fee'], evidence: 'C: "customers pay a small fee".' },
    { id: 12, type: 'fill', text: 'Critics say some games are so ______ that they take a long time to learn.', answers: ['complicated'], evidence: 'E: "some are so complicated that they take longer to learn than to play".' },
  ],
};

// ---------- B2 ----------
const H15 = [
  'i. A technology with a long history',
  'ii. The main methods explained',
  'iii. Why the process needs so much energy',
  'iv. An environmental problem at the end of the process',
  'v. Reasons for cautious optimism',
  'vi. A cheaper alternative to rain',
  'vii. Countries that refuse to use the technology',
];

export const reading15: ReadingTest = {
  id: 'reading-15', level: 'B2', title: 'Reading mini-test 15: Drinking Water from the Sea', minutes: 18,
  passageTitle: 'Drinking Water from the Sea',
  paragraphs: [
    'A. People have known for thousands of years that salt can be separated from seawater; sailors in ancient times boiled seawater and collected the steam to produce small amounts of drinking water. What has changed is the scale. Today, thousands of desalination plants around the world supply water to cities, and in some dry countries most of the drinking water now comes from the sea.',
    'B. Two main methods are used. The older one, thermal desalination, heats seawater so that it evaporates, leaving the salt behind, and then cools the vapour to produce fresh water. The newer and now more common method, reverse osmosis, pushes seawater at high pressure through extremely fine membranes that allow water molecules to pass but block the salt.',
    'C. Both methods need large amounts of energy. Heating water requires fuel, while the pumps used in reverse osmosis must work against the natural tendency of water to move from a less salty solution to a saltier one. As a result, desalinated water is usually considerably more expensive than water taken from rivers or underground, and plants that run on fossil fuels add to carbon emissions.',
    'D. A second problem concerns what is left over. For every litre of fresh water produced, a plant may produce more than a litre of brine, a very salty liquid that often also contains chemicals used to clean the equipment. When brine is returned to the sea, it tends to sink and spread across the seabed, where it can harm plants and animals that are not adapted to such high salt levels.',
    'E. Engineers are working on both problems. The energy needed for reverse osmosis has fallen dramatically over recent decades thanks to better membranes and devices that recover energy from the high-pressure brine. Some new plants are powered by solar or wind energy, and researchers are testing ways to extract useful minerals from brine instead of simply disposing of it. Few experts believe desalination alone can solve water shortages, but many see it as an increasingly important part of the solution.',
  ],
  groups: [
    { instruction: 'Questions 1–5: The passage has five paragraphs, A–E. Choose the correct heading for each paragraph from the list of headings.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: TFNG(6, 9), questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–13: Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [10, 11, 12, 13] },
  ],
  questions: [
    { id: 1, type: 'match', text: 'Paragraph A', options: H15, answer: 0, evidence: 'A: ancient sailors boiled seawater; "What has changed is the scale."' },
    { id: 2, type: 'match', text: 'Paragraph B', options: H15, answer: 1, evidence: 'B: "Two main methods are used."' },
    { id: 3, type: 'match', text: 'Paragraph C', options: H15, answer: 2, evidence: 'C: "Both methods need large amounts of energy."' },
    { id: 4, type: 'match', text: 'Paragraph D', options: H15, answer: 3, evidence: 'D: brine "can harm plants and animals".' },
    { id: 5, type: 'match', text: 'Paragraph E', options: H15, answer: 4, evidence: 'E: progress on both problems; "an increasingly important part of the solution".' },
    { id: 6, type: 'tfng', text: 'Reverse osmosis is now used more often than thermal desalination.', answer: 'True', evidence: 'B: "The newer and now more common method, reverse osmosis".' },
    { id: 7, type: 'tfng', text: 'Desalinated water is usually cheaper than river water.', answer: 'False', evidence: 'C: it is "usually considerably more expensive than water taken from rivers".' },
    { id: 8, type: 'tfng', text: 'Brine usually rises to the surface of the sea.', answer: 'False', evidence: 'D: "it tends to sink and spread across the seabed".' },
    { id: 9, type: 'tfng', text: 'Solar-powered plants produce the cheapest desalinated water.', answer: 'Not Given', evidence: 'E says some plants use solar energy but gives no price comparison.' },
    { id: 10, type: 'fill', text: 'In reverse osmosis, seawater is pushed through very fine ______.', answers: ['membranes'], evidence: 'B: "through extremely fine membranes".' },
    { id: 11, type: 'fill', text: 'Ancient sailors collected the ______ from boiling seawater.', answers: ['steam'], evidence: 'A: "boiled seawater and collected the steam".' },
    { id: 12, type: 'fill', text: 'Brine may also contain ______ used to clean equipment.', answers: ['chemicals'], evidence: 'D: "chemicals used to clean the equipment".' },
    { id: 13, type: 'fill', text: 'Researchers hope to extract useful ______ from brine.', answers: ['minerals'], evidence: 'E: "ways to extract useful minerals from brine".' },
  ],
};

export const reading16: ReadingTest = {
  id: 'reading-16', level: 'B2', title: 'Reading mini-test 16: How Habits Form', minutes: 18,
  passageTitle: 'How Habits Form',
  paragraphs: [
    'A. Much of what we do each day is not the result of conscious decisions. We brush our teeth, take the same route to work and check our phones without really thinking about it. Psychologists estimate that a large share of everyday behaviour is habitual, and this is not necessarily a bad thing: habits free the mind to concentrate on new or difficult problems.',
    'B. A habit typically forms through repetition in a stable context. A cue — a time, a place or a feeling — is followed by an action, and the action is followed by some kind of reward. Over time, the link between cue and action becomes so strong that the cue alone is enough to trigger the behaviour, even when the reward is no longer especially wanted.',
    'C. How long does this take? A frequently repeated claim is that a new habit forms in exactly twenty-one days, but research does not support such a precise figure. In one well-known study, volunteers who tried to adopt a simple daily behaviour, such as drinking water after breakfast, took anywhere from a few weeks to most of a year before the action felt automatic. On average, it took a little over two months.',
    'D. The same research produced an encouraging finding: missing a single day did not seriously damage the process. What mattered more was the overall consistency of repetition. This suggests that people who give up after one failure may be abandoning their effort far too early.',
    'E. Breaking an unwanted habit is generally harder than forming a new one, because the old link between cue and action remains in memory. One effective approach is to change the environment so that the cue appears less often — for example, leaving a phone in another room while studying. Another is to replace the unwanted action with a different one that follows the same cue and offers a similar reward.',
  ],
  groups: [
    { instruction: TFNG(1, 6), questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–9: Choose the correct letter.', questionIds: [7, 8, 9] },
    { instruction: 'Questions 10–13: Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [10, 11, 12, 13] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'The writer believes that habits are mostly harmful.', answer: 'False', evidence: 'A: "this is not necessarily a bad thing: habits free the mind".' },
    { id: 2, type: 'tfng', text: 'A strong habit can continue even when the reward is not wanted.', answer: 'True', evidence: 'B: the cue triggers the behaviour "even when the reward is no longer especially wanted".' },
    { id: 3, type: 'tfng', text: 'Research confirms that habits form in exactly twenty-one days.', answer: 'False', evidence: 'C: "research does not support such a precise figure".' },
    { id: 4, type: 'tfng', text: 'Women formed habits faster than men in the study.', answer: 'Not Given', evidence: 'C gives the range and average but no comparison between men and women.' },
    { id: 5, type: 'tfng', text: 'Missing one day seriously harmed the formation of a habit.', answer: 'False', evidence: 'D: "missing a single day did not seriously damage the process".' },
    { id: 6, type: 'tfng', text: 'It is usually easier to stop a habit than to start one.', answer: 'False', evidence: 'E: "Breaking an unwanted habit is generally harder than forming a new one".' },
    { id: 7, type: 'mcq', text: 'According to paragraph A, what is one benefit of habits?', options: ['They make people healthier.', 'They let the mind focus on harder problems.', 'They save money.', 'They improve memory.'], answer: 1, evidence: 'A: "habits free the mind to concentrate on new or difficult problems".' },
    { id: 8, type: 'mcq', text: 'On average, how long did a new behaviour take to become automatic in the study?', options: ['Exactly three weeks', 'A little over two months', 'Most of a year', 'A few days'], answer: 1, evidence: 'C: "On average, it took a little over two months."' },
    { id: 9, type: 'mcq', text: 'Why does leaving a phone in another room help?', options: ['The cue appears less often.', 'The reward becomes bigger.', 'The habit is forgotten at once.', 'It replaces studying.'], answer: 0, evidence: 'E: change the environment "so that the cue appears less often".' },
    { id: 10, type: 'fill', text: 'Summary: A habit forms through ______ in a stable context.', answers: ['repetition'], evidence: 'B: "through repetition in a stable context".' },
    { id: 11, type: 'fill', text: 'A ______, such as a time or a place, comes before the action.', answers: ['cue'], evidence: 'B: "A cue — a time, a place or a feeling — is followed by an action".' },
    { id: 12, type: 'fill', text: 'The action is followed by a ______.', answers: ['reward'], evidence: 'B: "the action is followed by some kind of reward".' },
    { id: 13, type: 'fill', text: 'What matters most is the overall ______ of repetition.', answers: ['consistency'], evidence: 'D: "the overall consistency of repetition".' },
  ],
};

// ---------- C1 ----------
export const reading17: ReadingTest = {
  id: 'reading-17', level: 'C1', title: 'Reading mini-test 17: The Price of “Free”', minutes: 20,
  passageTitle: 'The Price of “Free”',
  paragraphs: [
    'A. Many of the most widely used digital services cost their users nothing. Search engines, social networks, video platforms and countless mobile apps are offered free of charge, yet the companies behind them are among the most valuable in the world. The apparent paradox disappears once one recognises that, in many of these markets, the user is not the customer in the conventional sense. The customers are advertisers, and what they are buying is access to users’ attention.',
    'B. Attention, unlike money, cannot be increased: every person has the same twenty-four hours in a day. Economists have therefore described a competition in which services are designed not merely to be useful but to be difficult to put down. Features such as endless scrolling, automatic playing of the next video and notifications timed to draw people back are not accidental; they are the product of extensive testing to discover which designs keep users engaged for longest.',
    'C. Defenders of the model argue that it has made valuable tools available to billions of people who could never have paid for them, and that targeted advertising is less wasteful than broadcasting the same advertisement to everyone. They also point out that users are free to leave at any time. Critics respond that this freedom is weaker than it appears, because the value of a social network depends on how many of one’s friends use it, so leaving can carry a real social cost.',
    'D. Concerns have also been raised about the information that makes targeted advertising possible. Detailed records of what people search for, watch and buy can reveal a great deal about their health, finances and beliefs. Several jurisdictions have introduced laws requiring companies to obtain clearer consent before collecting such data and to explain how it will be used, although enforcement remains uneven.',
    'E. Alternatives exist. Some services charge a subscription and promise not to show advertisements; others are run by non-profit organisations or funded by donations. Whether such models can grow large enough to compete is uncertain, as most users have become accustomed to paying nothing. What seems likely is that the question of who pays for digital services, and in what form, will remain at the centre of debates about technology for many years.',
  ],
  groups: [
    { instruction: TFNG(1, 5), questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Choose the correct letter.', questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–13: Complete the summary. Write ONE WORD ONLY from the passage for each answer.', questionIds: [10, 11, 12, 13] },
  ],
  questions: [
    { id: 1, type: 'tfng', text: 'Many free digital services are run by very valuable companies.', answer: 'True', evidence: 'A: the companies "are among the most valuable in the world".' },
    { id: 2, type: 'tfng', text: 'Features that keep users scrolling usually appear by chance.', answer: 'False', evidence: 'B: such features "are not accidental".' },
    { id: 3, type: 'tfng', text: 'Targeted advertising earns more money than television advertising.', answer: 'Not Given', evidence: 'C says it is "less wasteful", but no earnings are compared.' },
    { id: 4, type: 'tfng', text: 'All countries now strictly enforce data protection laws.', answer: 'False', evidence: 'D: "several jurisdictions" have laws, and "enforcement remains uneven".' },
    { id: 5, type: 'tfng', text: 'Some services promise not to show adverts in return for a regular payment.', answer: 'True', evidence: 'E: "Some services charge a subscription and promise not to show advertisements".' },
    { id: 6, type: 'mcq', text: 'According to paragraph A, who are the real customers of many free services?', options: ['Users', 'Advertisers', 'Governments', 'Software designers'], answer: 1, evidence: 'A: "The customers are advertisers".' },
    { id: 7, type: 'mcq', text: 'Why does the writer compare attention with money?', options: ['Both can be saved.', 'Attention cannot be increased.', 'Money is more limited.', 'Both are taxed.'], answer: 1, evidence: 'B: "Attention, unlike money, cannot be increased".' },
    { id: 8, type: 'mcq', text: 'What is the critics’ answer to the claim that users can simply leave?', options: ['Leaving is technically impossible.', 'Leaving a network can have a social cost.', 'Users do not want to leave.', 'Companies charge a fee to leave.'], answer: 1, evidence: 'C: "leaving can carry a real social cost".' },
    { id: 9, type: 'mcq', text: 'What does the writer predict in the final paragraph?', options: ['Subscriptions will replace advertising.', 'Non-profit services will become the largest.', 'The question of payment will stay at the centre of debate.', 'Users will start paying for everything.'], answer: 2, evidence: 'E: the question "will remain at the centre of debates".' },
    { id: 10, type: 'fill', text: 'Summary: Services are tested to find designs that keep users ______ for as long as possible.', answers: ['engaged'], evidence: 'B: "which designs keep users engaged for longest".' },
    { id: 11, type: 'fill', text: 'Defenders say the model is less ______ than showing one advertisement to everyone.', answers: ['wasteful'], evidence: 'C: "targeted advertising is less wasteful".' },
    { id: 12, type: 'fill', text: 'New laws require clearer ______ before data is collected.', answers: ['consent'], evidence: 'D: "obtain clearer consent before collecting such data".' },
    { id: 13, type: 'fill', text: 'Some services are funded by ______ instead of adverts.', answers: ['donations'], evidence: 'E: "funded by donations".' },
  ],
};

const H18 = [
  'i. Why straight rivers were once preferred',
  'ii. The unexpected costs of control',
  'iii. Giving rivers room again',
  'iv. Measuring the results',
  'v. Obstacles to wider adoption',
  'vi. The rising price of farmland',
  'vii. A return to traditional fishing methods',
];

export const reading18: ReadingTest = {
  id: 'reading-18', level: 'C1', title: 'Reading mini-test 18: Letting Rivers Run Wild', minutes: 20,
  passageTitle: 'Letting Rivers Run Wild',
  paragraphs: [
    'A. For much of the nineteenth and twentieth centuries, engineers in many countries set out to tame their rivers. Winding channels were straightened, banks were reinforced with stone and concrete, and wetlands along the rivers were drained. The aims were understandable: straighter rivers carried boats more efficiently, drained land could be farmed or built on, and fixed banks seemed to promise protection from floods.',
    'B. Over time, however, the drawbacks of this approach became apparent. A straightened river flows faster, so water that once spread slowly across meadows now rushes downstream, sometimes increasing the risk of flooding in towns further along its course. The loss of wetlands removed natural sponges that had stored water during heavy rain, as well as habitats for fish, birds and insects. In some regions, populations of freshwater species fell sharply.',
    'C. In recent decades, a different philosophy has gained ground. Instead of confining rivers, some projects deliberately allow them to reconnect with their floodplains. Old meanders are reopened, artificial banks are removed and low-lying land is set aside so that it can flood safely when water levels rise. The idea is not to abandon flood protection but to work with natural processes rather than against them.',
    'D. Monitoring of restored rivers has produced generally positive results. Several projects have recorded the return of species that had disappeared from the area, and restored floodplains have been shown to slow the passage of floodwater, reducing peak levels downstream. Researchers caution, though, that ecosystems can take many years to recover, and that results vary greatly depending on the size of the project and the condition of the surrounding landscape.',
    'E. Expanding such schemes is not straightforward. Restoring a floodplain often means taking land out of agricultural use, which requires negotiation and compensation for farmers. Projects must also be coordinated across many landowners and, for larger rivers, across regional or national borders. Nevertheless, with flood damage becoming more costly, an increasing number of authorities regard making space for water as a sensible investment rather than a luxury.',
  ],
  groups: [
    { instruction: 'Questions 1–5: The passage has five paragraphs, A–E. Choose the correct heading for each paragraph from the list of headings.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Choose the correct letter.', questionIds: [6, 7, 8, 9] },
    { instruction: 'Questions 10–13: Complete the sentences. Write ONE WORD ONLY from the passage for each answer.', questionIds: [10, 11, 12, 13] },
  ],
  questions: [
    { id: 1, type: 'match', text: 'Paragraph A', options: H18, answer: 0, evidence: 'A: straight rivers "carried boats more efficiently" and seemed to protect from floods.' },
    { id: 2, type: 'match', text: 'Paragraph B', options: H18, answer: 1, evidence: 'B: "the drawbacks of this approach became apparent".' },
    { id: 3, type: 'match', text: 'Paragraph C', options: H18, answer: 2, evidence: 'C: rivers are allowed "to reconnect with their floodplains".' },
    { id: 4, type: 'match', text: 'Paragraph D', options: H18, answer: 3, evidence: 'D: "Monitoring of restored rivers has produced generally positive results."' },
    { id: 5, type: 'match', text: 'Paragraph E', options: H18, answer: 4, evidence: 'E: "Expanding such schemes is not straightforward."' },
    { id: 6, type: 'mcq', text: 'Why can a straightened river increase flooding downstream?', options: ['It carries more boats.', 'Its water moves faster.', 'Its banks are weaker.', 'It contains more fish.'], answer: 1, evidence: 'B: "A straightened river flows faster … sometimes increasing the risk of flooding in towns further along".' },
    { id: 7, type: 'mcq', text: 'What is the aim of the new approach described in paragraph C?', options: ['To stop all flood protection', 'To work with natural processes', 'To build higher concrete banks', 'To drain more wetlands'], answer: 1, evidence: 'C: "to work with natural processes rather than against them".' },
    { id: 8, type: 'mcq', text: 'What do researchers warn about restoration projects?', options: ['They always fail in small rivers.', 'Recovery can take many years.', 'They make floods worse.', 'They are cheaper than expected.'], answer: 1, evidence: 'D: "ecosystems can take many years to recover".' },
    { id: 9, type: 'mcq', text: 'Why do more authorities now support making space for water?', options: ['Farmers have asked for it.', 'Flood damage is becoming more costly.', 'National borders have changed.', 'Concrete has become expensive.'], answer: 1, evidence: 'E: "with flood damage becoming more costly".' },
    { id: 10, type: 'fill', text: 'Engineers reinforced river banks with stone and ______.', answers: ['concrete'], evidence: 'A: "banks were reinforced with stone and concrete".' },
    { id: 11, type: 'fill', text: 'Wetlands acted as natural ______ that stored water during heavy rain.', answers: ['sponges'], evidence: 'B: "natural sponges that had stored water during heavy rain".' },
    { id: 12, type: 'fill', text: 'Some projects reopen old ______ in the river.', answers: ['meanders'], evidence: 'C: "Old meanders are reopened".' },
    { id: 13, type: 'fill', text: 'Farmers who lose land usually need to receive ______.', answers: ['compensation'], evidence: 'E: "negotiation and compensation for farmers".' },
  ],
};
