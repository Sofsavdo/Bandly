import type { WritingPrompt } from './writing';
import type { EssayTypeId } from './writingGuide';

// IELTS Writing topshiriqlari banki (original, Bandly). Rasmiy IELTS materiali emas.
// Task 1 — ma'lumotlar jadval ko'rinishida (grafik o'rniga); Task 2 — beshta insho turi bo'yicha.

const t1 = (id: string, title: string, prompt: string, head: string[], rows: string[][]): WritingPrompt =>
  ({ id: `w1-${id}`, task: 1, title: `Task 1: ${title}`, prompt: `${prompt} Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`, table: { head, rows }, minWords: 150, minutes: 20 });
const t2 = (id: string, type: EssayTypeId, title: string, prompt: string): WritingPrompt =>
  ({ id: `w2-${id}`, task: 2, type, title: `Task 2: ${title}`, prompt, minWords: 250, minutes: 40 });

export const writingBank: WritingPrompt[] = [
  // ---------------- Task 1 ----------------
  t1('energy', 'Electricity sources', 'The table shows the share of electricity produced from different sources in one country in 2005, 2015 and 2025.',
    ['Source', '2005', '2015', '2025'], [['Coal', '48%', '36%', '18%'], ['Natural gas', '30%', '34%', '31%'], ['Hydro', '15%', '16%', '17%'], ['Solar and wind', '2%', '9%', '30%'], ['Other', '5%', '5%', '4%']]),
  t1('tourists', 'Tourist arrivals', 'The table shows the number of international tourists (in millions) who visited four countries between 2016 and 2024.',
    ['Country', '2016', '2020', '2024'], [['Country A', '12.4', '3.1', '15.8'], ['Country B', '8.0', '2.2', '7.5'], ['Country C', '5.6', '1.9', '9.3'], ['Country D', '2.1', '0.6', '4.0']]),
  t1('spending', 'Household spending', 'The table shows how an average family spent its monthly income in 1995 and 2025.',
    ['Category', '1995', '2025'], [['Food', '42%', '27%'], ['Housing', '18%', '31%'], ['Transport', '9%', '14%'], ['Education', '6%', '11%'], ['Entertainment', '5%', '9%'], ['Other', '20%', '8%']]),
  t1('reading', 'Reading habits', 'The table shows the percentage of people in three age groups who read books, newspapers and online articles every week.',
    ['Age group', 'Books', 'Newspapers', 'Online articles'], [['16–30', '34%', '8%', '86%'], ['31–50', '41%', '22%', '74%'], ['51+', '52%', '47%', '38%']]),
  t1('water', 'Water use', 'The table shows how water was used in three regions of the world in 2020.',
    ['Region', 'Agriculture', 'Industry', 'Homes'], [['Region 1', '81%', '9%', '10%'], ['Region 2', '44%', '38%', '18%'], ['Region 3', '23%', '55%', '22%']]),
  t1('students', 'Students abroad', 'The table shows the number of students from one country studying abroad, by destination, in 2014 and 2024.',
    ['Destination', '2014', '2024'], [['United Kingdom', '2,100', '5,400'], ['South Korea', '900', '6,800'], ['Germany', '1,300', '2,600'], ['Turkey', '1,800', '4,900'], ['USA', '1,500', '2,200']]),
  t1('phones', 'Phone ownership', 'The table shows the percentage of adults owning a mobile phone and a smartphone in one country from 2008 to 2024.',
    ['Year', 'Mobile phone', 'Smartphone'], [['2008', '62%', '4%'], ['2012', '81%', '19%'], ['2016', '90%', '48%'], ['2020', '95%', '77%'], ['2024', '97%', '91%']]),
  t1('commute', 'Commuting time', 'The table shows the average time (in minutes) people in five cities spent travelling to work each day in 2010 and 2024.',
    ['City', '2010', '2024'], [['City A', '38', '52'], ['City B', '44', '41'], ['City C', '25', '33'], ['City D', '57', '49'], ['City E', '30', '30']]),
  t1('waste', 'Household waste', 'The table shows what happened to household waste in one city in 2000 and 2025.',
    ['Method', '2000', '2025'], [['Landfill', '78%', '35%'], ['Recycling', '9%', '41%'], ['Burning for energy', '6%', '18%'], ['Composting', '7%', '6%']]),
  t1('jobs', 'Employment by sector', 'The table shows the percentage of workers employed in four sectors in one country in 1990, 2005 and 2025.',
    ['Sector', '1990', '2005', '2025'], [['Agriculture', '44%', '31%', '17%'], ['Industry', '21%', '24%', '22%'], ['Services', '30%', '39%', '52%'], ['Technology', '5%', '6%', '9%']]),
  t1('cinema', 'Cinema and streaming', 'The table shows the average number of films watched per person per year in cinemas and on streaming services in one country.',
    ['Year', 'Cinema', 'Streaming'], [['2012', '4.1', '0.8'], ['2016', '3.7', '6.2'], ['2020', '0.9', '24.5'], ['2024', '2.6', '29.1']]),
  t1('process-bread', 'How bread is made', 'The table lists the stages of commercial bread production in a factory, with the time each stage takes.',
    ['Stage', 'Description', 'Time'], [['1', 'Flour, water, yeast and salt are mixed', '12 min'], ['2', 'Dough rests and rises in a warm room', '90 min'], ['3', 'Dough is divided and shaped by machine', '15 min'], ['4', 'Loaves rise again in tins', '45 min'], ['5', 'Loaves are baked in a tunnel oven', '30 min'], ['6', 'Bread is cooled, sliced and packed', '60 min']]),
  t1('map-town', 'Changes in a town', 'The table compares the main features of a small town centre in 2000 and today.',
    ['Feature', '2000', 'Today'], [['Market', 'Open-air market in the square', 'Covered market hall'], ['Main street', 'Two-way traffic', 'Pedestrian zone'], ['Park', 'Small park by the river', 'Park doubled in size with a playground'], ['Factory', 'Textile factory', 'Shopping centre and flats'], ['Parking', 'Street parking', 'Multi-storey car park near the station']]),
  // ---------------- Task 2 ----------------
  t2('ads-children', 'agree', 'Advertising to children', 'Advertising aimed at children should be banned. To what extent do you agree or disagree?'),
  t2('online-learning', 'evaluate', 'Online learning', 'Online courses are becoming more popular than traditional classes. Do the advantages of this development outweigh the disadvantages?'),
  t2('elderly', 'problem', 'An ageing population', 'In many countries the proportion of older people is increasing. What problems does this cause, and what can be done to solve them?'),
  t2('fast-food', 'cause', 'Fast food', 'People are eating more fast food than ever before. Why is this happening, and what effects does it have on individuals and society?'),
  t2('museums', 'discuss', 'Free museums', 'Some people think museums should be free for everyone, while others believe visitors should pay. Discuss both views and give your own opinion.'),
  t2('space', 'agree', 'Space exploration', 'Governments spend too much money on space exploration when there are serious problems on Earth. To what extent do you agree or disagree?'),
  t2('traffic', 'problem', 'Traffic congestion', 'Traffic congestion is a growing problem in many cities. What are the main causes, and what measures could be taken to reduce it?'),
  t2('gap-year', 'evaluate', 'A gap year', 'Some students take a year off between school and university to work or travel. Do the advantages of this outweigh the disadvantages?'),
  t2('social-media', 'cause', 'Social media and young people', 'Young people spend several hours a day on social media. What are the reasons for this, and what effects does it have on them?'),
  t2('homework', 'discuss', 'Homework', 'Some people believe that schoolchildren should not be given homework, while others think it is essential. Discuss both views and give your own opinion.'),
  t2('tourism', 'evaluate', 'International tourism', 'International tourism has grown rapidly in recent decades. Do the benefits for local communities outweigh the problems?'),
  t2('languages', 'agree', 'Learning languages', 'Children should start learning a foreign language at primary school rather than secondary school. To what extent do you agree or disagree?'),
  t2('crime', 'discuss', 'Prison or education', 'Some people think the best way to reduce crime is to give longer prison sentences, while others believe education is more effective. Discuss both views and give your own opinion.'),
  t2('plastic', 'problem', 'Plastic pollution', 'Plastic waste is damaging oceans and wildlife around the world. What are the causes of this problem, and what solutions can you suggest?'),
  t2('celebrities', 'cause', 'Celebrity culture', 'Many young people today want to become famous rather than have a traditional career. Why is this, and is it a positive or negative development?'),
  t2('robots', 'agree', 'Automation and jobs', 'Robots and artificial intelligence will soon replace most human jobs. To what extent do you agree or disagree?'),
  t2('sport-funding', 'discuss', 'Funding for sport', 'Some people say governments should spend money on professional sport, while others think it should be spent on public sports facilities. Discuss both views and give your own opinion.'),
  t2('cash', 'evaluate', 'A cashless society', 'In some countries people hardly use cash any more. Is this a positive or negative development?'),
  t2('obesity', 'problem', 'Childhood obesity', 'Childhood obesity is increasing in many parts of the world. What are the main causes, and what can parents and schools do about it?'),
  t2('history', 'agree', 'Studying history', 'Studying the past is a waste of time; students should focus on subjects that prepare them for the future. To what extent do you agree or disagree?'),
  t2('rural', 'cause', 'Leaving the countryside', 'In many developing countries young people are leaving rural areas to work in cities. What are the causes of this, and what effects does it have on the countryside?'),
  t2('family-time', 'problem', 'Family time', 'Families spend less time together than they used to. Why is this happening, and how can families be encouraged to spend more time together?'),
  t2('public-transport', 'agree', 'Free public transport', 'Public transport should be free in all cities. To what extent do you agree or disagree?'),
  t2('competition', 'discuss', 'Competition or cooperation', 'Some people believe children should be taught to compete, while others think they should learn to cooperate. Discuss both views and give your own opinion.'),
];
