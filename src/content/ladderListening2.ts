import type { ListeningTest } from './types';

// IELTS zinapoyasi uchun qo'shimcha Listening mini-testlari: IELTS savol turlari (forma, eslatma, test), nutq darajaga mos.
// Original skriptlar (Bandly). Rasmiy IELTS materiali emas. Audio: tayyor bo'lguncha brauzer ovozi.

// ---------- A2 ----------
export const listening10: ListeningTest = {
  id: 'listening-10', level: 'A2', title: 'Listening mini-test 10: Ordering a birthday cake', minutes: 7,
  names: { A: 'Baker', B: 'Customer' }, context: 'Telefon orqali tort buyurtma qilish (A2 daraja, IELTS Part 1 uslubida).',
  script: [
    { speaker: 'A', text: 'Good afternoon, Sweet Corner Bakery. How can I help you?' },
    { speaker: 'B', text: 'Hello. I would like to order a birthday cake for my daughter, please.' },
    { speaker: 'A', text: 'Of course. Can I have your name, please?' },
    { speaker: 'B', text: 'Yes, it is Nodira Alimova. Alimova is A, L, I, M, O, V, A.' },
    { speaker: 'A', text: 'Thank you. When do you need the cake?' },
    { speaker: 'B', text: 'On Friday. Oh, no, sorry, the party is on Saturday. So Saturday morning, please.' },
    { speaker: 'A', text: 'Saturday morning. What kind of cake would you like? We have chocolate, strawberry and lemon.' },
    { speaker: 'B', text: 'She loves strawberry, so strawberry, please.' },
    { speaker: 'A', text: 'And how many people will eat the cake?' },
    { speaker: 'B', text: 'About fifteen. Ten children and five adults.' },
    { speaker: 'A', text: 'Then I recommend the medium size. It costs one hundred and twenty thousand som. Would you like to write something on the cake?' },
    { speaker: 'B', text: 'Yes, please. Happy birthday, Malika. She will be eight.' },
    { speaker: 'A', text: 'Lovely. You can collect the cake from ten o’clock. Can I have your phone number?' },
    { speaker: 'B', text: 'It is nine nine eight, double three, four five six.' },
    { speaker: 'A', text: 'Thank you. See you on Saturday.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Complete the order form. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–8: Choose the correct letter.', questionIds: [7, 8] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Customer’s family name: ______', answers: ['alimova'], evidence: '"Alimova is A, L, I, M, O, V, A."' },
    { id: 2, type: 'fill', text: 'Day of collection: ______', answers: ['saturday'], evidence: '"On Friday. Oh, no, sorry, the party is on Saturday."' },
    { id: 3, type: 'fill', text: 'Flavour: ______', answers: ['strawberry'], evidence: '"strawberry, please".' },
    { id: 4, type: 'fill', text: 'Number of people: ______', answers: ['15', 'fifteen'], evidence: '"About fifteen."' },
    { id: 5, type: 'fill', text: 'Collect from: ______ o’clock', answers: ['10', 'ten'], evidence: '"You can collect the cake from ten o’clock."' },
    { id: 6, type: 'fill', text: 'Phone: ______', answers: ['99833456'], evidence: '"nine nine eight, double three, four five six" = 99833456.' },
    { id: 7, type: 'mcq', text: 'Which size does the baker recommend?', options: ['Small', 'Medium', 'Large'], answer: 1, evidence: '"I recommend the medium size."' },
    { id: 8, type: 'mcq', text: 'How old will Malika be?', options: ['Five', 'Eight', 'Ten'], answer: 1, evidence: '"She will be eight."' },
  ],
};

export const listening11: ListeningTest = {
  id: 'listening-11', level: 'A2', title: 'Listening mini-test 11: A new bus route', minutes: 7,
  names: { A: 'Announcer' }, context: 'Yangi avtobus yo‘nalishi haqida e’lon (A2 daraja, IELTS Part 2 uslubida).',
  script: [
    { speaker: 'A', text: 'Good morning. This is an announcement from the city transport office about the new number forty-five bus.' },
    { speaker: 'A', text: 'From next Monday, the number forty-five bus will go from the railway station to the new university campus.' },
    { speaker: 'A', text: 'The bus will run every twenty minutes from six in the morning until eleven at night. At weekends, it will run every thirty minutes.' },
    { speaker: 'A', text: 'The journey from the station to the campus takes about twenty-five minutes. The bus will stop at the central market, the city hospital and the sports stadium.' },
    { speaker: 'A', text: 'A single ticket costs two thousand som. You can pay with a transport card or with your phone. Sorry, I must correct that: you cannot pay with cash on this bus.' },
    { speaker: 'A', text: 'Students with a student card can buy a monthly pass for half the normal price. You can buy the pass at the ticket office in the railway station.' },
    { speaker: 'A', text: 'All the new buses have air conditioning and free wi-fi. For more information, please visit our website.' },
  ],
  groups: [
    { instruction: 'Questions 1–5: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–8: Choose the correct letter.', questionIds: [6, 7, 8] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Bus number: ______', answers: ['45', 'forty-five', 'forty five'], evidence: '"the new number forty-five bus".' },
    { id: 2, type: 'fill', text: 'Weekdays: a bus every ______ minutes', answers: ['20', 'twenty'], evidence: '"every twenty minutes".' },
    { id: 3, type: 'fill', text: 'Journey time: about ______ minutes', answers: ['25', 'twenty-five', 'twenty five'], evidence: '"takes about twenty-five minutes".' },
    { id: 4, type: 'fill', text: 'Single ticket: ______ som', answers: ['2000', '2,000', 'two thousand'], evidence: '"A single ticket costs two thousand som."' },
    { id: 5, type: 'fill', text: 'Buy a monthly pass at the ticket office in the railway ______', answers: ['station'], evidence: '"at the ticket office in the railway station".' },
    { id: 6, type: 'mcq', text: 'Where does the bus NOT stop?', options: ['The central market', 'The city hospital', 'The city library'], answer: 2, evidence: 'Stops: market, hospital, stadium — no library.' },
    { id: 7, type: 'mcq', text: 'How can passengers pay?', options: ['With cash only', 'With a transport card or phone', 'Only at the station'], answer: 1, evidence: '"pay with a transport card or with your phone … you cannot pay with cash".' },
    { id: 8, type: 'mcq', text: 'What do students pay for a monthly pass?', options: ['The normal price', 'Half the normal price', 'Nothing'], answer: 1, evidence: '"a monthly pass for half the normal price".' },
  ],
};

// ---------- B1 ----------
export const listening12: ListeningTest = {
  id: 'listening-12', level: 'B1', title: 'Listening mini-test 12: Renting a flat', minutes: 9,
  names: { A: 'Agent', B: 'Sardor' }, context: 'Kvartira ijarasi bo‘yicha agent bilan suhbat (B1 daraja, IELTS Part 1 uslubida).',
  script: [
    { speaker: 'A', text: 'Hello, City Homes, Elena speaking.' },
    { speaker: 'B', text: 'Hi, I am calling about the flat on Lake Road that I saw on your website. Is it still available?' },
    { speaker: 'A', text: 'Yes, it is. It is a two-bedroom flat on the fourth floor. There is a lift, which is useful.' },
    { speaker: 'B', text: 'And how much is the rent?' },
    { speaker: 'A', text: 'The rent is four hundred and fifty dollars a month. Electricity and gas are not included, but water and internet are.' },
    { speaker: 'B', text: 'OK. Is there a deposit?' },
    { speaker: 'A', text: 'Yes, one month’s rent. You pay that before you move in, and you get it back when you leave, if everything is in good condition.' },
    { speaker: 'B', text: 'Is the flat furnished?' },
    { speaker: 'A', text: 'Partly. There is a sofa, beds and a dining table, and the kitchen has a fridge and a cooker. There is no washing machine yet, but the owner plans to buy one next month.' },
    { speaker: 'B', text: 'That sounds fine. Is it near public transport? I work in the city centre.' },
    { speaker: 'A', text: 'The nearest metro station is about five minutes on foot, and from there it is three stops to the centre.' },
    { speaker: 'B', text: 'Great. Can I see it this week?' },
    { speaker: 'A', text: 'How about Wednesday at five thirty? Actually, I have another viewing then. Could you come at six fifteen instead?' },
    { speaker: 'B', text: 'Six fifteen on Wednesday is fine. My name is Sardor Tursunov — T, U, R, S, U, N, O, V.' },
    { speaker: 'A', text: 'Thank you, Mr Tursunov. Please bring your passport and a letter from your employer.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Complete the form. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–10: Choose the correct letter.', questionIds: [7, 8, 9, 10] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Address: ______ Road', answers: ['lake'], evidence: '"the flat on Lake Road".' },
    { id: 2, type: 'fill', text: 'Floor: ______', answers: ['fourth', '4th', '4'], evidence: '"on the fourth floor".' },
    { id: 3, type: 'fill', text: 'Rent: $______ a month', answers: ['450', 'four hundred and fifty'], evidence: '"four hundred and fifty dollars a month".' },
    { id: 4, type: 'fill', text: 'Missing item: a ______ (the owner will buy it next month)', answers: ['washing machine'], evidence: '"There is no washing machine yet".' },
    { id: 5, type: 'fill', text: 'Viewing time: Wednesday at ______', answers: ['6.15', '6:15', 'six fifteen', '18.15', '18:15'], evidence: '"Could you come at six fifteen instead?"' },
    { id: 6, type: 'fill', text: 'Name: Sardor ______', answers: ['tursunov'], evidence: '"T, U, R, S, U, N, O, V".' },
    { id: 7, type: 'mcq', text: 'Which bills are included in the rent?', options: ['Electricity and gas', 'Water and internet', 'All bills'], answer: 1, evidence: '"Electricity and gas are not included, but water and internet are."' },
    { id: 8, type: 'mcq', text: 'When will Sardor get the deposit back?', options: ['After six months', 'When he leaves, if the flat is in good condition', 'Never'], answer: 1, evidence: '"you get it back when you leave, if everything is in good condition".' },
    { id: 9, type: 'mcq', text: 'How far is the metro station?', options: ['Five minutes on foot', 'Three stops by bus', 'Fifteen minutes by car'], answer: 0, evidence: '"about five minutes on foot".' },
    { id: 10, type: 'mcq', text: 'What must Sardor bring to the viewing?', options: ['The deposit', 'His passport and a letter from his employer', 'A bank card'], answer: 1, evidence: '"bring your passport and a letter from your employer".' },
  ],
};

export const listening13: ListeningTest = {
  id: 'listening-13', level: 'B1', title: 'Listening mini-test 13: A museum tour', minutes: 9,
  names: { A: 'Guide' }, context: 'Muzey bo‘ylab ekskursiya oldidan ma’lumot (B1 daraja, IELTS Part 2 uslubida).',
  script: [
    { speaker: 'A', text: 'Welcome to the City History Museum. Before we start the tour, let me tell you how the museum is organised.' },
    { speaker: 'A', text: 'We are now in the main hall on the ground floor. The ticket desk is behind you, and the cloakroom is on your left, next to the stairs. Please leave large bags there. It is free.' },
    { speaker: 'A', text: 'On the ground floor, you can see our oldest objects: pottery and tools that are more than two thousand years old. Many visitors think the coins are the most interesting part, but in my opinion the best thing here is the model of the ancient city.' },
    { speaker: 'A', text: 'On the first floor, there is an exhibition about the Silk Road, with clothes, maps and musical instruments. This floor also has a small cinema, where a short film is shown every hour. The film lasts twenty minutes.' },
    { speaker: 'A', text: 'The second floor was closed for repairs last year, but it opened again this month. It now has an interactive room for children, where they can try on traditional costumes.' },
    { speaker: 'A', text: 'You are welcome to take photos, but please do not use a flash, because the light can damage old fabrics.' },
    { speaker: 'A', text: 'The café is on the top floor, and it has a wonderful view of the old town. The museum closes at six, but the café stays open until seven.' },
    { speaker: 'A', text: 'Our tour will take about an hour and a half. If you have any questions, just ask. Shall we begin?' },
  ],
  groups: [
    { instruction: 'Questions 1–5: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Choose the correct letter.', questionIds: [6, 7, 8, 9] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Cloakroom: on the left, next to the ______', answers: ['stairs'], evidence: '"the cloakroom is on your left, next to the stairs".' },
    { id: 2, type: 'fill', text: 'Oldest objects: more than ______ years old', answers: ['2000', '2,000', 'two thousand'], evidence: '"more than two thousand years old".' },
    { id: 3, type: 'fill', text: 'First floor: exhibition about the Silk ______', answers: ['road'], evidence: '"an exhibition about the Silk Road".' },
    { id: 4, type: 'fill', text: 'Length of the film: ______ minutes', answers: ['20', 'twenty'], evidence: '"The film lasts twenty minutes."' },
    { id: 5, type: 'fill', text: 'Café closing time: ______ o’clock', answers: ['7', 'seven'], evidence: '"the café stays open until seven".' },
    { id: 6, type: 'mcq', text: 'What does the guide think is the best thing on the ground floor?', options: ['The coins', 'The model of the ancient city', 'The pottery'], answer: 1, evidence: '"in my opinion the best thing here is the model of the ancient city".' },
    { id: 7, type: 'mcq', text: 'What is new on the second floor?', options: ['A cinema', 'A room where children can try on costumes', 'A café'], answer: 1, evidence: '"an interactive room for children, where they can try on traditional costumes".' },
    { id: 8, type: 'mcq', text: 'Why should visitors not use a flash?', options: ['It disturbs other visitors.', 'It can damage old fabrics.', 'It is too expensive.'], answer: 1, evidence: '"the light can damage old fabrics".' },
    { id: 9, type: 'mcq', text: 'How long is the tour?', options: ['About an hour', 'About an hour and a half', 'About two hours'], answer: 1, evidence: '"about an hour and a half".' },
  ],
};

// ---------- B2 ----------
export const listening14: ListeningTest = {
  id: 'listening-14', level: 'B2', title: 'Listening mini-test 14: Planning a group presentation', minutes: 10,
  names: { A: 'Tutor', B: 'Aziza', C: 'Tom' }, context: 'Talabalar va o‘qituvchi guruh taqdimotini rejalashtirmoqda (B2 daraja, IELTS Part 3 uslubida).',
  script: [
    { speaker: 'A', text: 'So, Aziza and Tom, you have chosen to present on food waste in university canteens. How are you planning to collect your data?' },
    { speaker: 'B', text: 'We were going to interview the canteen managers, but they are very busy, so we have decided to weigh the food that is thrown away instead, for one week.' },
    { speaker: 'C', text: 'And we will add a short online questionnaire for students, to find out why they leave food.' },
    { speaker: 'A', text: 'Good. Measuring is much more reliable than asking people to guess. But one week may not be typical. Is there an exam period coming up?' },
    { speaker: 'C', text: 'Yes, actually, exams start in two weeks. I see what you mean — fewer students eat in the canteen then.' },
    { speaker: 'B', text: 'So perhaps we should measure this week and next week, before the exams.' },
    { speaker: 'A', text: 'That would be better. Now, how will you divide the work?' },
    { speaker: 'B', text: 'I am good with numbers, so I will analyse the data and make the charts.' },
    { speaker: 'C', text: 'And I will write the questionnaire. I was also going to design the slides, but Aziza says my slides always have too much text.' },
    { speaker: 'B', text: 'It is true! I think we should design the slides together.' },
    { speaker: 'A', text: 'Fine. One more thing: your presentation is fifteen minutes, plus five minutes for questions. Do not try to include everything. Choose your three strongest findings.' },
    { speaker: 'C', text: 'Should we suggest solutions as well?' },
    { speaker: 'A', text: 'Yes, definitely. The marks for recommendations are often where groups lose points. Make sure each one is based on your own evidence.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Choose the correct letter.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–9: Complete the sentences. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [7, 8, 9] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Why did the students decide not to interview the canteen managers?', options: ['The managers refused.', 'The managers are very busy.', 'The tutor did not allow it.'], answer: 1, evidence: 'Aziza: "they are very busy, so we have decided to weigh the food".' },
    { id: 2, type: 'mcq', text: 'What does the tutor think about weighing the food?', options: ['It is more reliable than asking people.', 'It takes too long.', 'It is less useful than a questionnaire.'], answer: 0, evidence: 'Tutor: "Measuring is much more reliable than asking people to guess."' },
    { id: 3, type: 'mcq', text: 'Why might one week of data be a problem?', options: ['The canteen is closed some days.', 'It may not be typical because of exams.', 'The scales are not accurate.'], answer: 1, evidence: 'Tutor: "one week may not be typical. Is there an exam period coming up?"' },
    { id: 4, type: 'mcq', text: 'Who will analyse the data?', options: ['Aziza', 'Tom', 'The tutor'], answer: 0, evidence: 'Aziza: "I will analyse the data and make the charts."' },
    { id: 5, type: 'mcq', text: 'What do the students decide about the slides?', options: ['Tom will design them.', 'Aziza will design them.', 'They will design them together.'], answer: 2, evidence: 'Aziza: "we should design the slides together."' },
    { id: 6, type: 'mcq', text: 'According to the tutor, where do groups often lose marks?', options: ['In the introduction', 'In the recommendations', 'In the charts'], answer: 1, evidence: 'Tutor: "The marks for recommendations are often where groups lose points."' },
    { id: 7, type: 'fill', text: 'Tom will write a short online ______ for students.', answers: ['questionnaire'], evidence: 'Tom: "we will add a short online questionnaire for students".' },
    { id: 8, type: 'fill', text: 'The presentation lasts ______ minutes, plus time for questions.', answers: ['15', 'fifteen'], evidence: 'Tutor: "your presentation is fifteen minutes, plus five minutes for questions".' },
    { id: 9, type: 'fill', text: 'The tutor advises choosing the ______ strongest findings.', answers: ['3', 'three'], evidence: 'Tutor: "Choose your three strongest findings."' },
  ],
};

export const listening15: ListeningTest = {
  id: 'listening-15', level: 'B2', title: 'Listening mini-test 15: Recycling old electronics', minutes: 10,
  names: { A: 'Speaker' }, context: 'Eski elektronika qayta ishlash markazi haqida nutq (B2 daraja, IELTS Part 2 uslubida).',
  script: [
    { speaker: 'A', text: 'Thank you for coming to this information evening about the new electronics recycling centre, which opens next month on Industrial Avenue.' },
    { speaker: 'A', text: 'Many people keep old phones and laptops in a drawer for years. This is a waste, because these devices contain valuable metals, including small amounts of gold, silver and copper, which can be recovered and used again.' },
    { speaker: 'A', text: 'They also contain substances that can be harmful if devices are thrown away with ordinary rubbish, which is why it is important to bring them to a specialist centre.' },
    { speaker: 'A', text: 'The centre will accept phones, computers, televisions and small kitchen appliances such as kettles and toasters. It will not accept large items such as fridges or washing machines; for those, the council offers a separate collection service, which you can book by phone.' },
    { speaker: 'A', text: 'Many of you have asked about personal data. Before you bring a phone or a laptop, please delete your files and return it to its factory settings. If you are not sure how, staff at the centre can do it for you, free of charge.' },
    { speaker: 'A', text: 'Devices that still work will not be broken up immediately. Our partner, a local charity, will repair them and give them to schools and families who cannot afford new ones. Last year, a similar scheme in a neighbouring city provided more than three thousand laptops to students.' },
    { speaker: 'A', text: 'The centre will be open from Tuesday to Saturday. It was originally planned to open on Sundays, but because of staff shortages, it will be closed on Sundays and Mondays for the first six months.' },
    { speaker: 'A', text: 'Finally, anyone who brings in three or more items in the first month will receive a voucher for a free cinema ticket.' },
  ],
  groups: [
    { instruction: 'Questions 1–4: Choose the correct letter.', questionIds: [1, 2, 3, 4] },
    { instruction: 'Questions 5–9: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [5, 6, 7, 8, 9] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'Why does the speaker say keeping old phones in a drawer is a waste?', options: ['They take up space.', 'They contain valuable metals.', 'They lose their data.'], answer: 1, evidence: '"these devices contain valuable metals".' },
    { id: 2, type: 'mcq', text: 'Which item will the centre NOT accept?', options: ['A toaster', 'A television', 'A fridge'], answer: 2, evidence: '"It will not accept large items such as fridges".' },
    { id: 3, type: 'mcq', text: 'What will happen to devices that still work?', options: ['They will be broken up.', 'They will be repaired and given away.', 'They will be sold abroad.'], answer: 1, evidence: '"a local charity will repair them and give them to schools and families".' },
    { id: 4, type: 'mcq', text: 'On which days will the centre be closed at first?', options: ['Saturdays and Sundays', 'Sundays and Mondays', 'Mondays and Tuesdays'], answer: 1, evidence: '"it will be closed on Sundays and Mondays for the first six months".' },
    { id: 5, type: 'fill', text: 'Location: Industrial ______', answers: ['avenue'], evidence: '"on Industrial Avenue".' },
    { id: 6, type: 'fill', text: 'Large items: book a separate ______ service by phone', answers: ['collection'], evidence: '"a separate collection service, which you can book by phone".' },
    { id: 7, type: 'fill', text: 'Before bringing a phone, return it to its factory ______', answers: ['settings'], evidence: '"return it to its factory settings".' },
    { id: 8, type: 'fill', text: 'Neighbouring city: more than ______ laptops given to students', answers: ['3000', '3,000', 'three thousand'], evidence: '"more than three thousand laptops".' },
    { id: 9, type: 'fill', text: 'Bring three or more items in the first month: get a free cinema ______', answers: ['ticket'], evidence: '"a voucher for a free cinema ticket".' },
  ],
};

export const listening16: ListeningTest = {
  id: 'listening-16', level: 'B2', title: 'Listening mini-test 16: Advice for new students', minutes: 10,
  names: { A: 'Adviser' }, context: 'Yangi talabalarga maslahatlar (B2 daraja, IELTS Part 2 uslubida).',
  script: [
    { speaker: 'A', text: 'Hello, everyone, and welcome to the university. I work in the Student Support Centre, and I want to give you some practical advice for your first few weeks.' },
    { speaker: 'A', text: 'First, registration. You must complete your online registration by the end of this week. If you miss the deadline, you will not be able to borrow library books or use the sports facilities until it is done.' },
    { speaker: 'A', text: 'Second, timetables. Your timetable will appear in the student app, not on paper. Check it every morning, because room changes are common in the first month.' },
    { speaker: 'A', text: 'Many new students ask how much independent study they should do. As a rough guide, for every hour in class, plan about two hours of study on your own. That might sound a lot, but it is the main difference between school and university.' },
    { speaker: 'A', text: 'Students often think the library is only for books. In fact, the most useful service is the academic writing centre on the ground floor, where tutors will read a draft of your essay and give you feedback. You need to book an appointment at least two days in advance.' },
    { speaker: 'A', text: 'Money is another common worry. The university has a hardship fund for students who face unexpected costs. It is not a loan, so you do not have to pay it back, but you will need to show evidence of your situation.' },
    { speaker: 'A', text: 'Finally, look after your health. Register with the medical centre in your first week, not when you are already ill. And remember that the counselling service is free and confidential.' },
  ],
  groups: [
    { instruction: 'Questions 1–5: Choose the correct letter.', questionIds: [1, 2, 3, 4, 5] },
    { instruction: 'Questions 6–9: Complete the notes. Write ONE WORD AND/OR A NUMBER for each answer.', questionIds: [6, 7, 8, 9] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What happens if students miss the registration deadline?', options: ['They must pay a fine.', 'They cannot use the library or sports facilities.', 'They lose their place.'], answer: 1, evidence: '"you will not be able to borrow library books or use the sports facilities".' },
    { id: 2, type: 'mcq', text: 'Why should students check their timetable every morning?', options: ['Rooms often change at first.', 'Lessons are cancelled.', 'It is only on paper.'], answer: 0, evidence: '"room changes are common in the first month".' },
    { id: 3, type: 'mcq', text: 'According to the adviser, what is the most useful library service?', options: ['Borrowing books', 'The academic writing centre', 'The computer room'], answer: 1, evidence: '"the most useful service is the academic writing centre".' },
    { id: 4, type: 'mcq', text: 'What is true about the hardship fund?', options: ['Students must pay it back.', 'It does not need to be repaid.', 'It is only for international students.'], answer: 1, evidence: '"It is not a loan, so you do not have to pay it back".' },
    { id: 5, type: 'mcq', text: 'When should students register with the medical centre?', options: ['When they are ill', 'In their first week', 'Before exams'], answer: 1, evidence: '"Register with the medical centre in your first week".' },
    { id: 6, type: 'fill', text: 'Timetables appear in the student ______', answers: ['app'], evidence: '"Your timetable will appear in the student app".' },
    { id: 7, type: 'fill', text: 'Independent study: about ______ hours for every hour in class', answers: ['2', 'two'], evidence: '"plan about two hours of study on your own".' },
    { id: 8, type: 'fill', text: 'Writing centre: book at least ______ days in advance', answers: ['2', 'two'], evidence: '"at least two days in advance".' },
    { id: 9, type: 'fill', text: 'The counselling service is free and ______', answers: ['confidential'], evidence: '"the counselling service is free and confidential".' },
  ],
};

// ---------- C1 ----------
export const listening17: ListeningTest = {
  id: 'listening-17', level: 'C1', title: 'Listening mini-test 17: How we measure time (lecture)', minutes: 10,
  names: { A: 'Lecturer' }, context: 'Vaqtni o‘lchash tarixi haqida ma’ruza (C1 daraja, IELTS Part 4 uslubida).',
  script: [
    { speaker: 'A', text: 'Today I want to look at how societies have measured time, and in particular at why accurate timekeeping became so important.' },
    { speaker: 'A', text: 'The earliest methods relied on the sky. Sundials, which use the shadow cast by the sun, were widely used in the ancient world. Their obvious limitation was that they were useless at night and on cloudy days.' },
    { speaker: 'A', text: 'Water clocks offered a partial solution. They measured time by the steady flow of water from one container to another, and some were remarkably sophisticated. However, the rate of flow changed with temperature, so their accuracy was limited.' },
    { speaker: 'A', text: 'Mechanical clocks appeared in Europe around the end of the thirteenth century, often in church towers. Interestingly, the first ones had no faces at all; they simply rang a bell to mark the hours.' },
    { speaker: 'A', text: 'A major improvement came in the seventeenth century with the pendulum, which made clocks far more accurate. But a pendulum does not work well on a moving ship, and this created a serious problem for navigation, because sailors needed accurate time to calculate their longitude, that is, their east–west position.' },
    { speaker: 'A', text: 'The solution was the marine chronometer, a clock designed to keep accurate time despite the movement of the sea and changes in temperature. It is no exaggeration to say that it made long ocean voyages much safer.' },
    { speaker: 'A', text: 'The next turning point was the railway. Before trains, each town kept its own local time, based on the position of the sun. That made timetables extremely confusing, so railway companies pushed for standard time across whole regions, and eventually time zones were agreed internationally.' },
    { speaker: 'A', text: 'Today, the most precise clocks are atomic clocks, which measure the vibrations of atoms. They are so accurate that they would lose less than a second over millions of years, and they are essential for satellite navigation systems.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Complete the notes. Write ONE WORD ONLY for each answer.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–10: Choose the correct letter.', questionIds: [7, 8, 9, 10] },
  ],
  questions: [
    { id: 1, type: 'fill', text: 'Sundials use the ______ cast by the sun.', answers: ['shadow'], evidence: '"use the shadow cast by the sun".' },
    { id: 2, type: 'fill', text: 'Water clocks: rate of flow changed with ______.', answers: ['temperature'], evidence: '"the rate of flow changed with temperature".' },
    { id: 3, type: 'fill', text: 'The first mechanical clocks rang a ______ to mark the hours.', answers: ['bell'], evidence: '"they simply rang a bell to mark the hours".' },
    { id: 4, type: 'fill', text: 'The ______ made clocks far more accurate in the 17th century.', answers: ['pendulum'], evidence: '"the pendulum, which made clocks far more accurate".' },
    { id: 5, type: 'fill', text: 'Sailors needed accurate time to calculate their ______.', answers: ['longitude'], evidence: '"to calculate their longitude".' },
    { id: 6, type: 'fill', text: 'Atomic clocks are essential for satellite ______ systems.', answers: ['navigation'], evidence: '"essential for satellite navigation systems".' },
    { id: 7, type: 'mcq', text: 'What was the main limitation of sundials?', options: ['They were expensive.', 'They did not work at night or in cloudy weather.', 'They were hard to move.'], answer: 1, evidence: '"useless at night and on cloudy days".' },
    { id: 8, type: 'mcq', text: 'What does the lecturer find interesting about the first mechanical clocks?', options: ['They had no faces.', 'They were made of wood.', 'They were used on ships.'], answer: 0, evidence: '"the first ones had no faces at all".' },
    { id: 9, type: 'mcq', text: 'Why did railway companies want standard time?', options: ['Local times made timetables confusing.', 'Trains needed atomic clocks.', 'Sailors asked for it.'], answer: 0, evidence: '"That made timetables extremely confusing, so railway companies pushed for standard time".' },
    { id: 10, type: 'mcq', text: 'What does the lecturer say about the marine chronometer?', options: ['It was too expensive for most ships.', 'It made long voyages much safer.', 'It used a pendulum.'], answer: 1, evidence: '"it made long ocean voyages much safer".' },
  ],
};

export const listening18: ListeningTest = {
  id: 'listening-18', level: 'C1', title: 'Listening mini-test 18: Seminar on city noise', minutes: 10,
  names: { A: 'Professor', B: 'Leila', C: 'Daniel' }, context: 'Shahar shovqini va sog‘liq haqida seminar (C1 daraja, IELTS Part 3 uslubida).',
  script: [
    { speaker: 'A', text: 'Let’s discuss the article on urban noise. Leila, what did you find most surprising?' },
    { speaker: 'B', text: 'Honestly, the health effects. I had assumed noise was mainly an annoyance, but the article links long-term exposure to traffic noise with disturbed sleep and even higher blood pressure.' },
    { speaker: 'C', text: 'I agree that the sleep evidence is strong. I’m less convinced about the blood pressure link, though. People who live on busy roads are often poorer, so other factors could explain it.' },
    { speaker: 'A', text: 'That is a fair point, Daniel, and the authors acknowledge it. Did they control for income?' },
    { speaker: 'C', text: 'Partly. They adjusted for income, but not for air pollution, which usually comes from the same traffic.' },
    { speaker: 'B', text: 'True, but that does not make the noise harmless. It just means it is hard to separate the two.' },
    { speaker: 'A', text: 'Now, what about solutions? The article mentions several.' },
    { speaker: 'B', text: 'Quieter road surfaces seemed the most practical to me. They can be laid during normal repairs, so the extra cost is small.' },
    { speaker: 'C', text: 'I thought lower speed limits were more promising. They reduce noise and accidents at the same time. But I accept they are politically difficult.' },
    { speaker: 'A', text: 'And noise barriers?' },
    { speaker: 'B', text: 'They work well beside motorways, but in city streets there is simply no room for them.' },
    { speaker: 'A', text: 'Good. For next week, I’d like you each to find one city that has measured noise before and after a policy change, and summarise the results in no more than one page.' },
  ],
  groups: [
    { instruction: 'Questions 1–6: Choose the correct letter.', questionIds: [1, 2, 3, 4, 5, 6] },
    { instruction: 'Questions 7–9: Complete the sentences. Write ONE WORD ONLY for each answer.', questionIds: [7, 8, 9] },
  ],
  questions: [
    { id: 1, type: 'mcq', text: 'What surprised Leila most about the article?', options: ['The cost of noise barriers', 'The health effects of noise', 'The number of cars in cities'], answer: 1, evidence: 'Leila: "Honestly, the health effects."' },
    { id: 2, type: 'mcq', text: 'What is Daniel’s view of the evidence?', options: ['Both links are equally strong.', 'The sleep link is stronger than the blood pressure link.', 'Neither link is convincing.'], answer: 1, evidence: 'Daniel: "the sleep evidence is strong. I’m less convinced about the blood pressure link".' },
    { id: 3, type: 'mcq', text: 'What factor did the authors NOT adjust for?', options: ['Income', 'Air pollution', 'Age'], answer: 1, evidence: 'Daniel: "They adjusted for income, but not for air pollution".' },
    { id: 4, type: 'mcq', text: 'Why does Leila prefer quieter road surfaces?', options: ['They also reduce accidents.', 'They can be laid during normal repairs at little extra cost.', 'They are popular with voters.'], answer: 1, evidence: 'Leila: "They can be laid during normal repairs, so the extra cost is small."' },
    { id: 5, type: 'mcq', text: 'What disadvantage of lower speed limits does Daniel mention?', options: ['They are politically difficult.', 'They do not reduce noise.', 'They are expensive.'], answer: 0, evidence: 'Daniel: "I accept they are politically difficult."' },
    { id: 6, type: 'mcq', text: 'Why are noise barriers unsuitable in city streets?', options: ['They are ugly.', 'There is no room for them.', 'They do not work.'], answer: 1, evidence: 'Leila: "in city streets there is simply no room for them".' },
    { id: 7, type: 'fill', text: 'Long-term traffic noise is linked with higher blood ______.', answers: ['pressure'], evidence: 'Leila: "even higher blood pressure".' },
    { id: 8, type: 'fill', text: 'People living on busy roads are often ______, so other factors may explain the results.', answers: ['poorer'], evidence: 'Daniel: "People who live on busy roads are often poorer".' },
    { id: 9, type: 'fill', text: 'Each student must find a city that measured noise before and after a ______ change.', answers: ['policy'], evidence: 'Professor: "measured noise before and after a policy change".' },
  ],
};
