import type { Unit } from './types';
import { ch, gap, ord } from './helpers';

// C2 9–10-bo'limlar. C2_U3 (idiomalar, juft iboralar), C2_U5 (uslubni o'zgartirish) va C2_U8 (akademik fe'llar, paraphrase)
// ustiga quriladi: jonli nutqdagi idiomalar va ularning uslubi, maqol / idioma / kollokatsiya farqi, lo'nda va sintezli
// akademik yozuv, akademik phrasal verblar. Original kontent, status 'pilot'.

const PLAN_IDIOM = String.raw`(up in the air|back to the drawing board|ball is in (my|your|our|their|his|her) court|(get|gets|got|getting) the ball rolling|on the same page)`;
const ACAD_PV = String.raw`(carr(y|ies|ied|ying) out|account(s|ed|ing)? for|rul(e|es|ed|ing) (it |this |them )?out|br(ing|ings|ought|inging) about|point(s|ed|ing)? out)`;

export const C2_U9: Unit = {
  id: 'c2-u9', level: 'C2', title: 'Idiomatic English for natural speech', titleUz: 'Tabiiy nutq uchun idiomalar',
  situationUz: 'Ish va kundalik suhbatlarda ona tilida so‘zlashuvchilar kabi idiomalarni o‘rinli ishlatish va ularni yozma ishda qachon ishlatmaslikni bilish.',
  status: 'pilot',
  lessons: [
    {
      id: 'c2-u9-l1', title: 'Idioms for decisions and plans', titleUz: 'Qaror va reja idiomalari: the ball is in your court, up in the air',
      objectiveUz: 'Qaror va rejalar haqidagi 5 ta zamonaviy idiomani (the ball is in your court, up in the air, back to the drawing board…) to‘g‘ri shakl va ma’noda ishlatasiz.',
      objective: 'Use five current idioms about decisions and plans with the correct form and meaning.',
      taxonomyIds: ['V.collocation', 'S.fluency'], minutes: 11,
      explanationUz: [
        'Ish va o‘qish haqidagi suhbatlarda rejalar haqida gapiradigan idiomalar juda ko‘p ishlatiladi: the ball is in your court (endi navbat sizda — qaror yoki keyingi qadam sizdan), up in the air (hali hal qilinmagan, noaniq), back to the drawing board (reja ishlamadi — boshidan boshlaymiz).',
        'Yana ikkitasi: get the ball rolling (ishni boshlab yubormoq) va be on the same page (bir xil fikrda, bir xil tushunchada bo‘lmoq). Shakli qat’iy: “the ball is in your court” (on your side emas), “up in the air” (“on the air” — bu “efirda” degani!), “back to the drawing board” (birlikda, the bilan).',
        'O‘zbek o‘quvchilarining odatiy xatosi — idiomani so‘zma-so‘z tarjima qilish yoki o‘xshash iboralarni aralashtirish: “We are on the same side” — “bir tarafdamiz” (boshqa ma’no). Idiomadagi fe’l zamon bo‘yicha o‘zgaradi (She got the ball rolling), qolgan so‘zlar esa o‘zgarmaydi.',
      ],
      table: [
        { form: 'the ball is in your court', example: 'I’ve sent my offer — the ball is in your court now.' },
        { form: 'up in the air', example: 'Our holiday plans are still up in the air.' },
        { form: 'back to the drawing board', example: 'The client hated the design, so it’s back to the drawing board.' },
        { form: 'get the ball rolling / be on the same page', example: 'Let me get the ball rolling with a quick summary.' },
      ],
      examples: [
        { en: 'The date of the wedding is still up in the air because the venue hasn’t confirmed.', uz: 'To‘y sanasi hali aniq emas, chunki to‘yxona tasdiqlamadi.' },
        { en: 'We’ve made you a fair offer, so the ball is in your court.', uz: 'Biz sizga adolatli taklif qildik, endi qaror sizda.' },
        { en: 'The prototype failed every test, so it was back to the drawing board.', uz: 'Namuna barcha sinovlardan o‘tolmadi, shuning uchun hammasini boshidan boshlashga to‘g‘ri keldi.' },
        { en: 'Before we start, let’s make sure we’re all on the same page about the budget.', uz: 'Boshlashdan oldin budjet bo‘yicha hammamiz bir xil fikrda ekanimizga ishonch hosil qilaylik.' },
      ],
      vocab: [{ en: 'the ball is in your court', uz: 'navbat sizda (qaror sizdan)' }, { en: 'back to the drawing board', uz: 'boshidan boshlamoq (reja ishlamagach)' }, { en: 'up in the air', uz: 'hali hal qilinmagan, noaniq' }, { en: 'on the same page', uz: 'bir xil fikrda, hamfikr' }],
      practice: [
        ch('“Our plans for the summer are still up in the air” means the plans are ___.', ['cancelled', 'not decided yet', 'very exciting'], 1, 'up in the air — hali hal qilinmagan.'),
        ch('The investors rejected our idea, so it’s ___.', ['back to the drawing board', 'on the same page', 'the ball in your court'], 0, 'Reja rad etildi — boshidan boshlaymiz: back to the drawing board.'),
        ch('Which form is correct?', ['The ball is on your side.', 'The ball is in your court.', 'The ball is in your field.'], 1, 'Idioma tennisdan olingan: the ball is in your court.'),
        gap('Shall I get the ball ___ by introducing the first speaker?', ['rolling'], 'get the ball rolling — ishni boshlab yubormoq.'),
        ord(['page', 'the', 'same', 'They', 'on', 'weren’t'], 'They weren’t on the same page', 'on the same page — bir xil fikrda (bu yerda inkor: kelisha olmagan).'),
      ],
      check: [
        ch('Your manager says, “I’ve given you my feedback — the ball is in your court.” What should you do?', ['Wait for the manager to decide', 'Take the next step yourself', 'Play tennis with the manager'], 1, 'Navbat sizda — endi siz harakat qilasiz.'),
        ch('Which sentence uses the idiom correctly?', ['The results are still up in the air, so we can’t announce them.', 'The results are still on the air, so we can’t announce them.', 'The results are still in the air up, so we can’t announce them.'], 0, 'up in the air; “on the air” — efirda degani.'),
        ch('“We need to get on the same page” means we need to ___.', ['read the same book', 'agree on what we understand and want', 'work in the same office'], 1, 'Bir xil tushunchaga kelish.'),
        gap('Nobody liked the new logo, so it was back to the drawing ___.', ['board'], 'back to the drawing board.'),
        gap('I’ve made my decision; now the ___ is in your court.', ['ball'], 'the ball is in your court.'),
        ord(['rolling', 'got', 'ball', 'She', 'the'], 'She got the ball rolling', 'Fe’l zamonga qarab o‘zgaradi: got the ball rolling.'),
      ],
      writing: {
        promptUz: 'Hamkasbingizga qisqa xabar (email) yozing: loyiha rejasi o‘zgardi. Kamida 3 ta idiomani ishlating (up in the air, back to the drawing board, the ball is in your court, get the ball rolling, on the same page).', minWords: 50,
        require: [
          { re: String.raw`\b${PLAN_IDIOM}\b`, labelUz: 'idioma' },
          { re: String.raw`\b${PLAN_IDIOM}\b[\s\S]*\b${PLAN_IDIOM}\b`, labelUz: 'kamida 2 ta idioma' },
          { re: String.raw`\b${PLAN_IDIOM}\b[\s\S]*\b${PLAN_IDIOM}\b[\s\S]*\b${PLAN_IDIOM}\b`, labelUz: 'kamida 3 ta idioma' },
        ],
        forbid: [{ re: String.raw`\b(ball is on (your|my|our) side|in the air up|drawing boards)\b`, labelUz: 'idioma shakli buzilgan' }],
        model: 'Hi Aziza, a quick update on the website project. The launch date is still up in the air because the client has changed their mind about the design. They didn’t like our first version, so it’s back to the drawing board for the homepage. Could you get the ball rolling on a new layout? Once you’ve sent me a draft, the ball is in my court. Thanks, Bekzod',
      },
    },
    {
      id: 'c2-u9-l2', title: 'Idioms and register: when not to use them', titleUz: 'Idiomalar va uslub: qachon ishlatmaslik kerak',
      objectiveUz: 'Idiomaning og‘zaki nutqqa yoki rasmiy yozuvga mosligini baholaysiz va IELTS essesida norasmiy idiomalarni neytral muqobil bilan almashtirasiz.',
      objective: 'Judge whether an idiom suits speech or formal writing and replace informal idioms with neutral equivalents in essays.',
      taxonomyIds: ['V.word_choice', 'W.task_response'], minutes: 12,
      explanationUz: [
        'Idiomalar bir xil emas. Og‘zaki, norasmiy idiomalar — a piece of cake, a no-brainer, hit the books, cost an arm and a leg — Speaking’da tabiiy eshitiladi, lekin IELTS Writing Task 2 essesida uslubni buzadi va Lexical Resource bahosini pasaytirishi mumkin.',
        'Ba’zi obrazli iboralar esa neytral va rasmiy matnda ham ishlatiladi: a double-edged sword, pave the way for, a vicious circle, the tip of the iceberg — ular gazeta va ilmiy maqolalarda ham uchraydi. Qoida: shubha bo‘lsa, neytral muqobilni tanlang: a piece of cake → straightforward, cost an arm and a leg → be extremely expensive.',
        'Eskirgan va siyqasi chiqqan (cliché) iboralardan qoching: “It’s raining cats and dogs” darsliklarda ko‘p, ammo bugun deyarli ishlatilmaydi — “It’s pouring (down)” tabiiyroq. Imtihonchi yodlangan, kontekstga mos kelmaydigan idiomani darhol sezadi: bitta o‘rinli idioma o‘nta sun’iy idiomadan yaxshiroq.',
      ],
      table: [
        { form: 'og‘zaki: a piece of cake → straightforward', example: 'The application process is straightforward.' },
        { form: 'og‘zaki: cost an arm and a leg → be extremely expensive', example: 'Private healthcare can be extremely expensive.' },
        { form: 'essega mos: a double-edged sword', example: 'Social media is a double-edged sword for teenagers.' },
        { form: 'essega mos: pave the way for', example: 'Cheaper solar panels could pave the way for cleaner cities.' },
      ],
      examples: [
        { en: 'Tourism is a double-edged sword: it creates jobs but can damage local culture.', uz: 'Turizm ikki tig‘li qilich: ish o‘rinlari yaratadi, lekin mahalliy madaniyatga zarar yetkazishi mumkin.' },
        { en: 'Renting a flat in the city centre costs an arm and a leg.', uz: 'Shahar markazida kvartira ijaraga olish juda qimmatga tushadi (og‘zaki uslub).' },
        { en: 'In an essay, write “extremely expensive” rather than “costs an arm and a leg”.', uz: 'Esseda “costs an arm and a leg” emas, “extremely expensive” deb yozing.' },
        { en: 'Online banking has paved the way for a cashless economy.', uz: 'Onlayn bank xizmatlari naqd pulsiz iqtisodiyotga yo‘l ochdi.' },
      ],
      vocab: [{ en: 'cliché', uz: 'siyqasi chiqqan ibora' }, { en: 'overused', uz: 'haddan tashqari ko‘p ishlatilgan' }, { en: 'a double-edged sword', uz: 'ikki tig‘li qilich (foydasi ham, zarari ham bor)' }, { en: 'pave the way for', uz: 'yo‘l ochmoq, zamin tayyorlamoq' }],
      practice: [
        ch('Which idiom is acceptable in a formal IELTS essay?', ['a piece of cake', 'a double-edged sword', 'a no-brainer'], 1, 'a double-edged sword — neytral, rasmiy matnda ham uchraydi.'),
        ch('Which is the best formal equivalent of “costs an arm and a leg”?', ['is extremely expensive', 'is a bit pricey', 'is a rip-off'], 0, 'Neytral va rasmiy; qolganlari og‘zaki.'),
        ch('Which expression sounds old-fashioned to most native speakers today?', ['It’s pouring down.', 'It’s raining cats and dogs.', 'It’s really wet out there.'], 1, 'raining cats and dogs — eskirgan, darslik iborasi.'),
        gap('Free online courses have paved the ___ for lifelong learning.', ['way'], 'pave the way for — yo‘l ochmoq.'),
        ord(['sword', 'is', 'a', 'double-edged', 'Technology'], 'Technology is a double-edged sword', 'a double-edged sword — foydasi ham, zarari ham bor.'),
      ],
      check: [
        ch('A student writes in an essay: “Learning to code is a piece of cake.” What is the problem?', ['The idiom is grammatically wrong.', 'The idiom is too informal for an essay.', 'The idiom has the wrong meaning.'], 1, 'Shakli to‘g‘ri, lekin essega juda norasmiy.'),
        ch('Choose the best sentence for an academic essay.', ['Living in big cities costs an arm and a leg.', 'Living in big cities is a total rip-off.', 'Living in large cities can be prohibitively expensive.'], 2, 'Rasmiy, neytral lug‘at: prohibitively expensive.'),
        ch('Which phrase best replaces “a no-brainer” in formal writing? “Investing in public transport is a no-brainer.”', ['an obvious choice', 'a stupid idea', 'a difficult decision'], 0, 'a no-brainer — o‘ylab o‘tirishga hojat yo‘q, aniq to‘g‘ri tanlov.'),
        gap('Poverty and poor health can form a vicious ___. (yomon doira)', ['circle'], 'a vicious circle — essega mos obrazli ibora.'),
        gap('Many idioms in old textbooks are now ___ and sound unnatural. (eskirgan)', ['old-fashioned', 'outdated', 'dated'], 'old-fashioned / outdated — eskirgan.'),
        ord(['the', 'Cheap', 'way', 'flights', 'paved', 'mass', 'tourism', 'for', 'have'], 'Cheap flights have paved the way for mass tourism', 'have paved the way for — yo‘l ochgan.'),
      ],
      writing: {
        promptUz: 'Bu norasmiy Speaking javobini IELTS essesi uslubida qayta yozing: “Getting into a top university is no piece of cake, and private tutors cost an arm and a leg, so tutoring is a double-edged sword.” Norasmiy idiomalarni neytral so‘zlar bilan almashtiring, essega mos bitta obrazli iborani qoldiring, qisqartmalardan qoching.', minWords: 50,
        require: [
          { re: String.raw`\b(double-edged sword|pave[sd]? the way|paving the way|vicious circle|tip of the iceberg)\b`, labelUz: 'essega mos obrazli ibora' },
          { re: String.raw`\b(expensive|costly|unaffordable)\b`, labelUz: 'neytral muqobil (expensive, costly…)' },
          { re: String.raw`\b(difficult|challenging|demanding|competitive)\b`, labelUz: 'neytral muqobil (challenging, competitive…)' },
        ],
        forbid: [
          { re: String.raw`\b(piece of cake|arm and a leg|no-brainer|hit the books|raining cats and dogs|rip-off)\b`, labelUz: 'norasmiy idioma essega mos emas' },
          { re: String.raw`\b(it's|don't|can't|isn't|aren't|won't|doesn't)\b`, labelUz: 'qisqartma (rasmiy uslubda ishlatilmaydi)' },
        ],
        model: 'Gaining admission to a leading university is highly competitive, and private tuition can be prohibitively expensive for ordinary families. As a result, the system risks favouring wealthier applicants. Private tutoring is therefore a double-edged sword: it can raise standards for those who can afford it, but it may also widen the gap between rich and poor students.',
      },
    },
    {
      id: 'c2-u9-l3', title: 'Proverbs, idioms and collocations', titleUz: 'Maqol, idioma va kollokatsiya farqi',
      objectiveUz: 'Maqol, idioma va kollokatsiyani bir-biridan farqlaysiz va maqolni nutqda (qisqartirilgan shaklda ham) o‘rinli ishlatasiz.',
      objective: 'Distinguish proverbs, idioms and collocations and use proverbs appropriately, including shortened forms.',
      taxonomyIds: ['V.collocation', 'V.word_choice'], minutes: 11,
      explanationUz: [
        'Uch tushuncha ko‘p aralashtiriladi. Maqol (proverb) — to‘liq gap, xalq donoligi yoki maslahat: “Actions speak louder than words.” Idioma (idiom) — ma’nosi so‘zlardan kelib chiqmaydigan ibora, gapning bir bo‘lagi: “She let the cat out of the bag” (sirni oshkor qilib qo‘ydi). Kollokatsiya (collocation) — ma’nosi tushunarli, lekin tabiiy birikadigan so‘zlar: heavy rain, make a decision.',
        'Ona tilida so‘zlashuvchilar maqolni ko‘pincha qisqartirib aytadi, chunki davomini hamma biladi: “Well, every cloud…” (= every cloud has a silver lining — har yomonlikning bir yaxshi tomoni bor), “When in Rome…” (= do as the Romans do — qayerda bo‘lsang, o‘sha yerning odatiga amal qil). Maqoldan ibora ham yasaladi: a silver lining (yaxshi tomon).',
        'O‘zbek maqolini so‘zma-so‘z tarjima qilmang: “bir o‘q bilan ikki quyon” inglizchada “kill two birds with one stone” (quyon va o‘q emas — qush va tosh!). IELTS essesida maqol ishlatmang — u yerda siyqa (cliché) eshitiladi; Speaking’da esa bitta o‘rinli maqol tabiiy jaranglaydi.',
      ],
      table: [
        { form: 'proverb — to‘liq gap', example: 'Actions speak louder than words.' },
        { form: 'idiom — gap bo‘lagi', example: 'He finally let the cat out of the bag.' },
        { form: 'collocation — tabiiy birikma', example: 'We had heavy rain all night.' },
        { form: 'qisqartirilgan maqol', example: 'I lost my job, but every cloud…' },
      ],
      examples: [
        { en: 'He keeps promising to help, but actions speak louder than words.', uz: 'U yordam beraman deb va’da qilaveradi, lekin gap emas, ish muhim.' },
        { en: 'The flight was cancelled, but the silver lining was an extra day in Samarkand.', uz: 'Reys bekor qilindi, lekin buning yaxshi tomoni — Samarqandda yana bir kun qoldik.' },
        { en: 'Don’t put all your eggs in one basket — apply to several universities.', uz: 'Butun umidingizni bitta narsaga bog‘lamang — bir nechta universitetga hujjat topshiring.' },
        { en: 'You finished the course in the end — better late than never!', uz: 'Oxiri kursni tugatding — kech bo‘lsa ham, hech bo‘lmagandan yaxshi!' },
      ],
      vocab: [{ en: 'proverb', uz: 'maqol' }, { en: 'silver lining', uz: 'yaxshi tomon (yomon vaziyatdagi)' }, { en: 'actions speak louder than words', uz: 'gap emas, ish muhim' }, { en: 'collocation', uz: 'tabiiy so‘z birikmasi' }],
      practice: [
        ch('“Actions speak louder than words” is ___.', ['a proverb', 'a collocation', 'a phrasal verb'], 0, 'To‘liq gap va maslahat — maqol.'),
        ch('“Make a decision” is ___.', ['a proverb', 'an idiom', 'a collocation'], 2, 'Ma’nosi tushunarli, so‘zlar tabiiy birikadi — kollokatsiya.'),
        ch('A friend lost her job and says, “Well, every cloud…”. What does she mean?', ['Bad weather is coming.', 'Something good may come out of this.', 'She is very angry.'], 1, 'every cloud (has a silver lining) — har yomonlikning yaxshi tomoni bor.'),
        gap('Losing the match had a silver ___ — the coach finally changed the team.', ['lining'], 'a silver lining — yaxshi tomon.'),
        ord(['eggs', 'Don’t', 'your', 'one', 'all', 'in', 'basket', 'put'], 'Don’t put all your eggs in one basket', 'Maqol: butun umidni bitta narsaga bog‘lama.'),
      ],
      check: [
        ch('Which is the correct English proverb?', ['Kill two rabbits with one bullet.', 'Kill two birds with one stone.', 'Kill two birds with one bullet.'], 1, 'Inglizchada qush va tosh: kill two birds with one stone.'),
        ch('Which is an idiom, not a proverb?', ['Better late than never.', 'let the cat out of the bag', 'Actions speak louder than words.'], 1, 'Gap bo‘lagi, to‘liq gap emas — idioma.'),
        ch('Where is a proverb LEAST appropriate?', ['in a chat with a friend', 'in an IELTS Task 2 essay', 'in IELTS Speaking Part 1'], 1, 'Esseda maqol siyqa va norasmiy eshitiladi.'),
        gap('He said he’d changed, but actions speak louder than ___.', ['words'], 'actions speak louder than words.'),
        gap('When in ___, do as the Romans do.', ['Rome'], 'When in Rome, do as the Romans do.'),
        ord(['has', 'Every', 'lining', 'a', 'cloud', 'silver'], 'Every cloud has a silver lining', 'To‘liq maqol.'),
      ],
      writing: {
        promptUz: 'Do‘stingizga maslahat xati yozing: u faqat bitta universitetga hujjat topshirmoqchi. Kamida bitta maqol (yoki uning qisqa shakli) va bitta kollokatsiya (make a decision, take a risk…) ishlating.', minWords: 50,
        require: [
          { re: String.raw`\b(actions speak louder than words|every cloud|silver lining|all your eggs in one basket|better late than never|when in rome)\b`, labelUz: 'maqol (yoki uning qisqa shakli)' },
          { re: String.raw`\b(make|makes|made|making|take|takes|took|taking) (a|an|the) (decision|risk|chance|choice)\b`, labelUz: 'kollokatsiya (make a decision, take a risk…)' },
        ],
        forbid: [{ re: String.raw`\b(kill two rabbits|one bullet|do a decision)\b`, labelUz: 'so‘zma-so‘z tarjima yoki xato kollokatsiya' }],
        model: 'Dear Dilnoza, I know you have your heart set on one university, but please don’t put all your eggs in one basket. Apply to at least three places, so that you can make a decision when the offers arrive. Taking a risk is fine, but have a back-up plan. And if the first answer is no, remember that every cloud has a silver lining. Love, Malika',
      },
    },
  ],
};

export const C2_U10: Unit = {
  id: 'c2-u10', level: 'C2', title: 'Polished academic writing', titleUz: 'Sayqallangan akademik yozuv',
  situationUz: 'Magistratura arizasi, ilmiy maqola yoki IELTS essesi: fikrni lo‘nda yozish, manbalarni o‘zaro bog‘lash va akademik uslubni saqlash.',
  status: 'pilot',
  lessons: [
    {
      id: 'c2-u10-l1', title: 'Concision: cutting wordiness', titleUz: 'Lo‘ndalik: ortiqcha so‘zlarni qisqartirish',
      objectiveUz: 'Cho‘zilgan va takroriy iboralarni (due to the fact that, future plans) topib, gapni ma’nosini yo‘qotmasdan qisqaroq qayta yozasiz.',
      objective: 'Identify wordy and redundant phrases and rewrite sentences more concisely without losing meaning.',
      taxonomyIds: ['W.sentence_variety', 'V.word_choice'], minutes: 10,
      explanationUz: [
        'C2 darajasidagi yozuv — uzun emas, lo‘nda yozuv. Ko‘p o‘quvchilar esse “akademikroq” ko‘rinsin deb uzun iboralar qo‘shadi: due to the fact that → because, in spite of the fact that → although, at this point in time → now, in the event that → if, a large number of → many.',
        'Takror (redundancy) — bir ma’noni ikki marta aytish: future plans (reja doim kelajak haqida), past history, end result, return back, completely unanimous. O‘zbekchada “eng optimal” deyish ortiqcha bo‘lgani kabi, inglizchada “return back” ham ortiqcha: return yetarli.',
        'Bo‘sh nominalizatsiyadan ham qoching: make an investigation into → investigate, give consideration to → consider. Nominalizatsiya ma’lumotni zichlasa foydali, faqat fe’lni “cho‘zsa” — ortiqcha. Hech narsa qo‘shmaydigan kirish iboralarini o‘chiring: “It is important to note that…”, “It should be mentioned that…”.',
      ],
      table: [
        { form: 'due to the fact that → because', example: 'Sales fell because prices rose.' },
        { form: 'future plans → plans; return back → return', example: 'She plans to return to Tashkent.' },
        { form: 'make an investigation into → investigate', example: 'The committee will investigate the complaint.' },
        { form: 'It is important to note that… → (o‘chiring)', example: 'Most participants were under thirty.' },
      ],
      examples: [
        { en: 'Because the data were incomplete, the results remain tentative.', uz: 'Ma’lumotlar to‘liq bo‘lmagani uchun natijalar hali taxminiy.' },
        { en: 'The council will consider the proposal next month.', uz: 'Kengash taklifni kelasi oy ko‘rib chiqadi.' },
        { en: 'Although the sample was small, the findings are striking.', uz: 'Tanlanma kichik bo‘lsa-da, natijalar e’tiborga loyiq.' },
        { en: 'The vote was unanimous, so the plan went ahead.', uz: 'Bir ovozdan qaror qilindi, shuning uchun reja amalga oshirildi.' },
      ],
      vocab: [{ en: 'concise', uz: 'ixcham, lo‘nda' }, { en: 'redundant', uz: 'ortiqcha, takroriy' }, { en: 'wordy', uz: 'cho‘zilgan, ortiqcha so‘zli' }, { en: 'succinct', uz: 'qisqa va lo‘nda' }],
      practice: [
        ch('Choose the most concise version.', ['Due to the fact that it rained, the match was cancelled.', 'Because it rained, the match was cancelled.', 'Owing to the fact that it was raining, the match was cancelled.'], 1, 'due to / owing to the fact that → because.'),
        ch('Which phrase is redundant?', ['future plans', 'detailed plans', 'ambitious plans'], 0, 'Reja doim kelajak haqida — “future” ortiqcha.'),
        ch('“Give consideration to” can be replaced by ___.', ['consider', 'considerate', 'considering about'], 0, 'Bo‘sh nominalizatsiya o‘rniga fe’l: consider.'),
        gap('___ the price was high, demand stayed strong. (in spite of the fact that → bir so‘z)', ['Although', 'Though'], 'in spite of the fact that → although.'),
        ord(['investigate', 'will', 'police', 'The', 'the', 'incident'], 'The police will investigate the incident', 'make an investigation into → investigate.'),
      ],
      check: [
        ch('Which sentence contains a redundancy?', ['The committee was unanimous', 'The committee was completely unanimous', 'The committee agreed'], 1, 'unanimous o‘zi “to‘liq bir ovozdan” — completely ortiqcha.'),
        ch('The most concise replacement for “at this point in time” is ___.', ['now', 'at this moment in time', 'presently in time'], 0, 'at this point in time → now.'),
        ch('Which sentence is the most concise and still formal?', ['It is important to note that most participants were women.', 'Most participants were women.', 'It should be mentioned that it is a fact that most participants were women.'], 1, 'Bo‘sh kirish iborasi kerak emas.'),
        gap('The researchers will ___ the causes of the decline. (make an investigation into → bir fe’l)', ['investigate', 'examine'], 'Aniq fe’l: investigate.'),
        gap('She decided to return ___ her home town. (return back emas)', ['to'], 'return to — back ortiqcha.'),
        ord(['plans', 'Our', 'changed', 'have'], 'Our plans have changed', 'future plans emas — plans yetarli.'),
      ],
      writing: {
        promptUz: 'Bu cho‘zilgan gapni ma’nosini saqlab, lo‘nda qilib qayta yozing va mavzu bo‘yicha yana 2–3 ta lo‘nda gap qo‘shing: “It is important to note that, due to the fact that a large number of students have future plans to study abroad, universities should give consideration to the introduction of more courses that are taught in English.”', minWords: 50,
        require: [
          { re: String.raw`\b(because|since|as)\b`, labelUz: 'because / since (due to the fact that o‘rniga)' },
          { re: String.raw`\b(consider|introduce|introducing|offer)\b`, labelUz: 'aniq fe’l (consider, introduce…)' },
        ],
        forbid: [{ re: String.raw`\b(due to the fact that|in spite of the fact that|future plans|give consideration to|a large number of|it is important to note that|at this point in time|return back|completely unanimous)\b`, labelUz: 'ortiqcha yoki takroriy ibora' }],
        model: 'Because many students plan to study abroad, universities should consider introducing more courses taught in English. Such courses would help students adapt to academic life overseas and would also attract international applicants. However, institutions must ensure that teaching quality does not fall as a result. Lecturers may need training before they teach in a second language.',
      },
    },
    {
      id: 'c2-u10-l2', title: 'Synthesising sources', titleUz: 'Manbalarni sintez qilish: Both X and Y…, consistent with…',
      objectiveUz: 'Ikki-uch manbaning fikrini bir gapda bog‘lab (both… and…, consistent with, in contrast to, building on), ularni shunchaki ketma-ket sanamasdan sintez qilasiz.',
      objective: 'Synthesise two or three sources in one sentence using expressions such as consistent with, in contrast to and building on.',
      taxonomyIds: ['W.coherence', 'W.task_response'], minutes: 12,
      explanationUz: [
        'Akademik yozuvda manbalarni bittadan sanab chiqish (“Hall says… Ito says… Khan says…”) — zaif usul. Sintez — manbalarni o‘zaro bog‘lash: qaysilari kelishadi, qaysilari qarama-qarshi, kim kimning ishini davom ettirgan.',
        'Kelishuv: Both Hall (2021) and Ito (2023) argue that…; Ito’s findings are consistent with / echo those of Hall; There is broad consensus that…; Khan concurs. Qarama-qarshilik: In contrast to Hall, Ito found…; Whereas Hall emphasises X, Ito focuses on Y. Davom ettirish: Building on Hall’s work, Ito shows…; Khan goes further, arguing that…',
        'Odatiy xatolar: “consistent to” (to‘g‘risi — consistent with), “concur to Lee” (to‘g‘risi — concur with Lee), “those of” ni tushirib qoldirish: “Ito’s results echo those of Hall” (Hall’ning natijalarini). Har manba uchun “says” ishlatmang — contend, maintain, demonstrate kabi aniq fe’llarni qo‘llang.',
      ],
      table: [
        { form: 'Both X and Y argue that…', example: 'Both Karimova and Hall argue that homework benefits older pupils.' },
        { form: 'X’s findings are consistent with / echo those of Y', example: 'Hall’s findings echo those of Karimova.' },
        { form: 'In contrast to X, Y… / Whereas X…, Y…', example: 'In contrast to Hall, Ito found no effect on younger children.' },
        { form: 'Building on X, Y… / Y goes further', example: 'Building on this work, Ito goes further, arguing that homework can harm motivation.' },
      ],
      examples: [
        { en: 'There is broad consensus that reading at home improves children’s vocabulary.', uz: 'Uyda kitob o‘qish bolalarning so‘z boyligini oshirishi haqida keng kelishuv mavjud.' },
        { en: 'These results are consistent with earlier studies of urban schools.', uz: 'Bu natijalar shahar maktablari bo‘yicha avvalgi tadqiqotlarga mos keladi.' },
        { en: 'Whereas Hall emphasises cost, Ito focuses on long-term benefits.', uz: 'Hall asosan xarajatni ta’kidlasa, Ito uzoq muddatli foydaga e’tibor qaratadi.' },
        { en: 'Building on Karimova’s survey, Ito interviewed forty teachers.', uz: 'Karimovaning so‘rovnomasini davom ettirib, Ito qirq nafar o‘qituvchi bilan suhbat o‘tkazdi.' },
      ],
      vocab: [{ en: 'synthesise', uz: 'sintez qilmoq, birlashtirib xulosa chiqarmoq' }, { en: 'consensus', uz: 'umumiy kelishuv, yakdil fikr' }, { en: 'concur', uz: 'qo‘shilmoq, fikriga rozi bo‘lmoq (rasmiy)' }, { en: 'corroborate', uz: 'tasdiqlamoq, dalil bilan quvvatlamoq' }],
      practice: [
        ch('Which sentence synthesises the sources rather than listing them?', ['Hall says homework helps. Ito says homework helps.', 'Both Hall and Ito argue that homework helps.', 'Hall says homework helps, and also Ito says it.'], 1, 'Both… and… — ikki manba bitta fikrda bog‘landi.'),
        ch('Ito’s results are consistent ___ those of Hall.', ['with', 'to', 'for'], 0, 'consistent with — qolip.'),
        ch('Choose the expression that shows DISAGREEMENT between sources.', ['In contrast to Hall, Ito…', 'Building on Hall’s work, Ito…', 'Ito concurs with Hall…'], 0, 'In contrast to — qarama-qarshilik.'),
        gap('There is broad ___ among researchers that sleep affects memory. (yakdil fikr)', ['consensus'], 'broad consensus — keng kelishuv.'),
        ord(['echo', 'findings', 'Her', 'those', 'of', 'earlier', 'studies'], 'Her findings echo those of earlier studies', 'echo those of — … ning natijalarini takrorlaydi.'),
      ],
      check: [
        ch('“Lee’s data corroborate Khan’s conclusion” means Lee’s data ___.', ['support it', 'reject it', 'ignore it'], 0, 'corroborate — tasdiqlamoq, quvvatlamoq.'),
        ch('Which is correct?', ['Khan concurs with Lee.', 'Khan concurs to Lee.', 'Khan concurs Lee.'], 0, 'concur with someone.'),
        ch('Which sentence shows that one study extends another?', ['Whereas Smith studied adults, Lee studied children.', 'Building on Smith’s model, Lee adds a third variable.', 'Smith and Lee disagree completely.'], 1, 'Building on — davom ettirish, kengaytirish.'),
        gap('In contrast ___ earlier studies, this survey found no gender gap.', ['to', 'with'], 'in contrast to (yoki with).'),
        gap('Ito goes ___, arguing that homework may actually harm motivation. (yanada uzoqroq)', ['further'], 'go further — fikrni yanada kuchaytirmoq.'),
        ord(['synthesise', 'You', 'must', 'sources', 'the'], 'You must synthesise the sources', 'synthesise — manbalarni bog‘lab xulosa chiqarmoq.'),
      ],
      writing: {
        promptUz: 'Uch manba haqida qisqa sintez paragraf yozing (manbalar o‘ylab topilgan): Karimova (2020) — onlayn ta’lim arzonroq; Hall (2022) — onlayn ta’lim arzon va qulay; Ito (2023) — onlayn talabalar o‘zini yolg‘iz his qiladi. Kelishuv va qarama-qarshilikni ko‘rsating.', minWords: 50,
        require: [
          { re: String.raw`\b(both \w+ and \w+|consistent with|echo(es|ed)?|concur(s|red)?|corroborate[sd]?|consensus)\b`, labelUz: 'kelishuv (both… and…, consistent with, echo…)' },
          { re: String.raw`\b(in contrast (to|with)|by contrast|whereas|while|however)\b`, labelUz: 'qarama-qarshilik (in contrast to, whereas…)' },
        ],
        forbid: [{ re: String.raw`\b(consistent to|concurs? to|concurred to)\b`, labelUz: 'consistent with / concur with bo‘lishi kerak' }],
        model: 'Both Karimova (2020) and Hall (2022) argue that online learning reduces the cost of higher education, and Hall’s findings are consistent with Karimova’s earlier survey. Hall goes further, suggesting that flexible timetables make study more accessible. In contrast to these studies, Ito (2023) focuses on the social cost of learning alone, reporting that many online students feel isolated.',
      },
    },
    {
      id: 'c2-u10-l3', title: 'Academic phrasal verbs', titleUz: 'Akademik phrasal verblar: carry out, account for, rule out',
      objectiveUz: 'Akademik matnda ham ishlatiladigan phrasal verblarni (carry out, account for, rule out, bring about, point out) norasmiylaridan (get rid of, come up with) farqlab, to‘g‘ri ishlatasiz.',
      objective: 'Use phrasal verbs that are acceptable in academic writing (carry out, account for, rule out, bring about, point out) and distinguish them from informal ones.',
      taxonomyIds: ['V.word_choice', 'V.collocation'], minutes: 11,
      explanationUz: [
        '“Shifting register” darsida phrasal verbni rasmiy fe’l bilan almashtirishni o‘rgandik (find out → ascertain). Ammo hamma phrasal verb norasmiy emas! Ba’zilari ilmiy maqolalarda juda keng ishlatiladi: carry out research (tadqiqot o‘tkazmoq), account for 40% (tashkil etmoq), rule out a possibility (istisno qilmoq), bring about change (yuzaga keltirmoq), point out (ta’kidlab o‘tmoq).',
        'Esseda almashtirish kerak bo‘lgan norasmiylari: get rid of → eliminate, come up with → devise / propose, put up with → tolerate, cut down on → reduce. Ular xato emas, lekin akademik matnda og‘zaki eshitiladi.',
        'Ma’no nozikligi: account for ikki ma’noli — “Women account for 60% of students” (tashkil etadi) va “This accounts for the rise” (o‘sishning sababini tushuntiradi). O‘zbek o‘quvchilarining xatosi — yuklamani tushirib qoldirish: “carry research” emas, carry out research. Olmosh o‘rtada turadi: rule it out (rule out it emas).',
      ],
      table: [
        { form: 'carry out (research, a survey, an experiment)', example: 'The team carried out a survey of 500 households.' },
        { form: 'account for (= tashkil etmoq / tushuntirmoq)', example: 'Exports account for a third of national income.' },
        { form: 'rule out / bring about', example: 'Scientists cannot rule out a link between the two.' },
        { form: 'norasmiy → rasmiy: get rid of → eliminate, come up with → devise', example: 'The council devised a plan to eliminate waste.' },
      ],
      examples: [
        { en: 'The study was carried out in three regions of Uzbekistan.', uz: 'Tadqiqot O‘zbekistonning uchta viloyatida o‘tkazildi.' },
        { en: 'Lower fuel prices may account for the rise in car use.', uz: 'Avtomobildan foydalanish ortishini yoqilg‘i narxining pasayishi bilan izohlash mumkin.' },
        { en: 'The authors point out that the sample was small.', uz: 'Mualliflar tanlanma kichik bo‘lganini ta’kidlab o‘tadi.' },
        { en: 'Investment in education can bring about lasting social change.', uz: 'Ta’limga sarmoya kiritish uzoq muddatli ijtimoiy o‘zgarishlarni yuzaga keltirishi mumkin.' },
      ],
      vocab: [{ en: 'carry out', uz: 'o‘tkazmoq, amalga oshirmoq (tadqiqot)' }, { en: 'account for', uz: 'tashkil etmoq; sababini tushuntirmoq' }, { en: 'rule out', uz: 'istisno qilmoq' }, { en: 'bring about', uz: 'yuzaga keltirmoq, sabab bo‘lmoq' }],
      practice: [
        ch('Which phrasal verb is perfectly acceptable in academic writing?', ['get rid of', 'carry out', 'come up with'], 1, 'carry out — ilmiy matnda keng ishlatiladi.'),
        ch('“Students under 25 account for half of all users” means they ___.', ['explain half of all users', 'make up half of all users', 'pay for half of all users'], 1, 'account for + miqdor — tashkil etmoq.'),
        ch('Which is a formal replacement for “come up with” in “come up with a solution”?', ['devise', 'rule out', 'account for'], 0, 'come up with → devise / propose.'),
        gap('The researchers carried ___ a series of interviews with teachers.', ['out'], 'carry out — out tushib qolmasin.'),
        ord(['out', 'cannot', 'We', 'it', 'rule'], 'We cannot rule it out', 'Olmosh o‘rtada: rule it out.'),
      ],
      check: [
        ch('Choose the correct sentence.', ['The team carried a survey of 500 people.', 'The team carried out a survey of 500 people.', 'The team carried out of a survey 500 people.'], 1, 'carry out a survey.'),
        ch('“This theory accounts for the sudden drop” means the theory ___ the drop.', ['explains', 'causes', 'ignores'], 0, 'account for — sababini tushuntirmoq.'),
        ch('In an essay, “We must get rid of plastic bags” is best rewritten as “We must ___ plastic bags.”', ['eliminate', 'rule out', 'carry out'], 0, 'get rid of → eliminate.'),
        gap('Further tests are needed to rule ___ other causes.', ['out'], 'rule out — istisno qilmoq.'),
        gap('The new law could bring ___ a fall in road accidents.', ['about'], 'bring about — yuzaga keltirmoq.'),
        ord(['out', 'pointed', 'that', 'The', 'author', 'data', 'were', 'limited', 'the'], 'The author pointed out that the data were limited', 'point out that — ta’kidlab o‘tmoq.'),
      ],
      writing: {
        promptUz: 'Tadqiqot natijasi haqida qisqa akademik paragraf yozing (mavzu: maktab o‘quvchilarining uyqusi). Kamida 3 ta akademik phrasal verb (carry out, account for, rule out, bring about, point out) ishlating va norasmiylaridan qoching.', minWords: 50,
        require: [
          { re: String.raw`\b${ACAD_PV}\b`, labelUz: 'akademik phrasal verb' },
          { re: String.raw`\b${ACAD_PV}\b[\s\S]*\b${ACAD_PV}\b`, labelUz: 'kamida 2 ta akademik phrasal verb' },
          { re: String.raw`\b${ACAD_PV}\b[\s\S]*\b${ACAD_PV}\b[\s\S]*\b${ACAD_PV}\b`, labelUz: 'kamida 3 ta akademik phrasal verb' },
        ],
        forbid: [{ re: String.raw`\b(get rid of|got rid of|come up with|came up with|put up with|cut down on|kind of|a lot of)\b`, labelUz: 'norasmiy ibora (akademik matnga mos emas)' }],
        model: 'A survey of 1,200 secondary school pupils was carried out in Tashkent in 2024. Screen use late at night accounted for most of the variation in sleep time. The authors point out that the data were self-reported, so measurement error cannot be ruled out. Nevertheless, they suggest that a ban on phones after ten in the evening could bring about a measurable improvement in sleep.',
      },
    },
  ],
};
