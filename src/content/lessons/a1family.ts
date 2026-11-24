import type { Unit } from './types';
import { ch, gap, ord } from './helpers';

// A1: "Mening oilam va do'stlarim" — kunlik tanishuv mavzusi: oila a'zolari + egalik sifatlari, odamlarni tanishtirish, oila haqida qisqa hikoya.
// "Oila va odamlar" (a1-u4: ko'plik, to'ldiruvchi olmoshlar, savol so'zlari) dan keyin keladi; present simple va to be ustiga quriladi. Original kontent, status 'pilot'.
export const A1_U11: Unit = {
  id: 'a1-u11', level: 'A1', title: 'My family and friends', titleUz: 'Mening oilam va do‘stlarim',
  situationUz: 'Oilangiz va do‘stlaringizni tanishtirish: kim kimning nimasi, ismi, yoshi, kasbi va qayerda yashashi.',
  status: 'pilot',
  lessons: [
    {
      id: 'a1-u11-l1', title: 'Family members: my, your, his, her, our, their', titleUz: 'Oila a’zolari: my, your, his, her, our, their',
      objectiveUz: 'Oila a’zolarini ingliz tilida ataysiz va my, your, his, her, our, their bilan kimniki ekanini bildirasiz.',
      objective: 'Name family members and use possessive adjectives my, your, his, her, our, their.',
      taxonomyIds: ['G.pronoun', 'V.word_choice'], minutes: 9,
      explanationUz: [
        'Oila a’zolari: mother (ona), father (ota), brother (aka yoki uka), sister (opa yoki singil), grandmother (buvi), grandfather (bobo), uncle (amaki yoki tog‘a), aunt (xola yoki amma). Ingliz tilida aka bilan ukani alohida aytmaydilar — ikkalasi ham brother.',
        'Kimniki ekanini bildirish uchun otdan OLDIN egalik sifati qo‘yiladi: my (mening), your (sening, sizning), his (uning — erkak), her (uning — ayol), our (bizning), their (ularning). Masalan: “This is my mother. Her name is Nilufar.”',
        'His va her ni eganing jinsiga qarab tanlang: Anvar — his name, Madina — her name. Egalik sifatidan keyin a / an qo‘yilmaydi: “my a brother” emas, “my brother”.',
      ],
      table: [
        { form: 'my / your', example: 'my mother, your brother' },
        { form: 'his (erkak) / her (ayol)', example: 'his father, her sister' },
        { form: 'our / their', example: 'our grandmother, their uncle' },
      ],
      examples: [
        { en: 'This is my mother. Her name is Nilufar.', uz: 'Bu mening onam. Uning ismi Nilufar.' },
        { en: 'My father is a doctor, and his name is Karim.', uz: 'Otam shifokor, uning ismi Karim.' },
        { en: 'Our grandmother lives in Samarkand.', uz: 'Buvimiz Samarqandda yashaydi.' },
        { en: 'Their brother is ten years old.', uz: 'Ularning ukasi o‘n yoshda.' },
      ],
      vocab: [{ en: 'mother', uz: 'ona' }, { en: 'father', uz: 'ota' }, { en: 'brother', uz: 'aka / uka' }, { en: 'sister', uz: 'opa / singil' }],
      practice: [
        ch('This is my brother. ___ name is Anvar.', ['Her', 'His', 'Their'], 1, 'Brother — o‘g‘il bola, shuning uchun his.'),
        ch('My sister is a teacher. ___ school is near our house.', ['Her', 'His', 'Your'], 0, 'Sister — qiz yoki ayol, shuning uchun her.'),
        ch('We have a big family. ___ house is in Tashkent.', ['Our', 'Their', 'Her'], 0, 'We (biz) → our (bizning).'),
        gap('They love ___ grandmother very much. (they)', ['their'], 'They (ular) → their (ularning).'),
        ord(['father', 'is', 'My', 'a', 'driver'], 'My father is a driver', 'My + ot + is + a + kasb.'),
      ],
      check: [
        ch('I live with ___ parents.', ['my', 'me', 'I'], 0, 'I (men) → my (mening).'),
        ch('Madina and Dilnoza are sisters. ___ mother is a nurse.', ['Her', 'Their', 'Our'], 1, 'Ikki kishi — their (ularning).'),
        ch('Karim is my uncle. ___ wife is my aunt.', ['Her', 'His', 'Your'], 1, 'Karim — erkak, shuning uchun his wife.'),
        gap('Hello! What is ___ name? (you)', ['your'], 'You (sen, siz) → your (sening, sizning).'),
        gap('We visit ___ grandfather every Friday. (we)', ['our'], 'We (biz) → our (bizning).'),
        ord(['is', 'Her', 'Malika', 'name'], 'Her name is Malika', 'Her + name + is + ism.'),
      ],
      writing: {
        promptUz: 'Oilangizdagi ikki kishi haqida yozing: ular kim va ismi nima? (my va his yoki her dan foydalaning)', minWords: 12,
        require: [{ re: String.raw`\bmy\b`, labelUz: '“my” ishlatilgan' }, { re: String.raw`\b(his|her)\b`, labelUz: '“his” yoki “her” ishlatilgan' }],
        model: 'This is my father. His name is Karim. This is my sister. Her name is Dilnoza. She is a student.',
      },
    },
    {
      id: 'a1-u11-l2', title: 'Introducing people: This is…, These are…, He’s, She’s, They’re', titleUz: 'Tanishtirish: This is… / These are… / He’s, She’s, They’re',
      objectiveUz: 'Boshqa odamlarni tanishtirasiz: This is my friend. These are my parents. He’s, she’s, they’re bilan qisqa ma’lumot berasiz.',
      objective: 'Introduce people with This is / These are and give short facts with he’s, she’s, they’re.',
      taxonomyIds: ['G.sva', 'G.pronoun'], minutes: 8,
      explanationUz: [
        'Bitta odamni tanishtirganda “This is…” (Bu …), bir nechta odamni “These are…” (Bular …) deymiz. Masalan: “This is my friend Aziz.” — “These are my parents.”',
        'Tanishtirgandan keyin ma’lumot berish uchun he’s, she’s, they’re ishlatiladi: he’s = he is, she’s = she is, they’re = they are. “She’s a nurse. He’s twenty. They’re from Bukhara.”',
        'Odam bitta bo‘lsa — is (he’s, she’s), bir nechta bo‘lsa — are (they’re). “They is” deyilmaydi: They are teachers.',
      ],
      table: [
        { form: 'This is + bitta odam', example: 'This is my friend Aziz.' },
        { form: 'These are + bir nechta odam', example: 'These are my parents.' },
        { form: 'he’s / she’s / they’re', example: 'She’s a nurse. They’re teachers.' },
      ],
      examples: [
        { en: 'This is my friend Aziz. He’s a student.', uz: 'Bu mening do‘stim Aziz. U talaba.' },
        { en: 'This is my sister. She’s twenty years old.', uz: 'Bu mening singlim. U yigirma yoshda.' },
        { en: 'These are my parents. They’re from Bukhara.', uz: 'Bular mening ota-onam. Ular Buxorodan.' },
        { en: 'These are my cousins. They’re very funny.', uz: 'Bular mening amakivachchalarim. Ular juda quvnoq.' },
      ],
      vocab: [{ en: 'parents', uz: 'ota-ona' }, { en: 'friend', uz: 'do‘st' }, { en: 'cousin', uz: 'amakivachcha / xolavachcha' }, { en: 'student', uz: 'talaba' }],
      practice: [
        ch('___ is my teacher.', ['This', 'These', 'They'], 0, 'Bitta odam — This is…'),
        ch('___ are my friends.', ['This', 'These', 'He'], 1, 'Bir nechta odam — These are…'),
        ch('My sister is a doctor. ___ twenty-five.', ['She’s', 'They’re', 'He’s'], 0, 'Sister — bitta qiz yoki ayol: she’s.'),
        gap('My parents are teachers. ___ (they are) very kind.', ['they’re', 'they are'], 'Bir nechta odam — they’re (they are).'),
        ord(['my', 'This', 'is', 'brother'], 'This is my brother', 'This is + my + ot.'),
      ],
      check: [
        ch('___ are my grandparents.', ['This', 'These', 'She’s'], 1, 'Bir nechta odam — These are…'),
        ch('Look! ___ is my uncle.', ['This', 'These', 'They’re'], 0, 'Bitta odam — This is…'),
        ch('Anvar is my cousin. ___ fifteen years old.', ['He’s', 'She’s', 'They’re'], 0, 'Anvar — erkak, bitta: he’s.'),
        ch('My friends are from Samarkand. ___ students.', ['They’re', 'She’s', 'He’s'], 0, 'Bir nechta odam — they’re.'),
        gap('These ___ my brothers. (be)', ['are'], 'These bilan are ishlatiladi.'),
        ord(['are', 'These', 'parents', 'my'], 'These are my parents', 'These are + ko‘plikdagi ot.'),
      ],
      writing: {
        promptUz: 'Do‘stingizni tanishtiring: “This is…” bilan boshlang, keyin “He’s” yoki “She’s” bilan ma’lumot bering (3–4 ta gap).', minWords: 12,
        require: [{ re: String.raw`\bThis is\b`, labelUz: '“This is” ishlatilgan' }, { re: String.raw`\b(he|she)('s| is)\b`, labelUz: '“He’s” yoki “She’s” ishlatilgan' }],
        model: 'This is my friend Madina. She’s eighteen years old. She’s a student. She’s from Tashkent.',
      },
    },
    {
      id: 'a1-u11-l3', title: 'My family in five sentences', titleUz: 'Oilam haqida qisqa hikoya',
      objectiveUz: 'Oilangiz haqida 4–5 gapdan iborat qisqa hikoyani aytasiz va yozasiz: kim, necha yoshda, kasbi va qayerda yashashi.',
      objective: 'Describe your family in 4–5 sentences: who, age, job and where they live.',
      taxonomyIds: ['G.word_order', 'V.word_choice'], minutes: 9,
      explanationUz: [
        'Hikoyani bitta namunaga solib yozish oson: (1) kim bilan yashaysiz — “I live with my parents and my sister.” (2) har biri haqida: yosh, kasb — “My father is forty-five. He is a driver.” (3) qayerda yashaysiz — “We live in Tashkent.”',
        'Yosh haqida “He is 45” yoki “He is 45 years old” deymiz (“He has 45” demang — o‘zbekchadan so‘zma-so‘z o‘girmang). Kasbdan oldin a yoki an: a driver, an engineer.',
        'Gaplarni bog‘lash uchun and va but ishlating: “My mother is a teacher, and my father is a driver.” “I have a brother, but I don’t have a sister.”',
      ],
      table: [
        { form: 'I live with + kim bilan', example: 'I live with my parents.' },
        { form: 'ism + is + yosh yoki kasb', example: 'My father is forty-five. He is a driver.' },
        { form: 'We live in + shahar', example: 'We live in Tashkent.' },
      ],
      examples: [
        { en: 'I live with my parents and my two sisters.', uz: 'Men ota-onam va ikki singlim bilan yashayman.' },
        { en: 'My father is forty-five. He is a driver.', uz: 'Otam qirq besh yoshda. U haydovchi.' },
        { en: 'My mother is a teacher, and my brother is a student.', uz: 'Onam o‘qituvchi, akam esa talaba.' },
        { en: 'We live in a small house in Tashkent.', uz: 'Biz Toshkentda kichik uyda yashaymiz.' },
      ],
      vocab: [{ en: 'live', uz: 'yashamoq' }, { en: 'driver', uz: 'haydovchi' }, { en: 'engineer', uz: 'muhandis' }, { en: 'house', uz: 'uy' }],
      practice: [
        ch('My father is forty. He ___ a driver.', ['is', 'are', 'has'], 0, 'He bilan is ishlatiladi.'),
        ch('My mother is ___ teacher.', ['a', 'an', 'the'], 0, 'Kasbdan oldin a yoki an; teacher undosh bilan boshlanadi — a.'),
        ch('Dilnoza is ___ engineer.', ['a', 'an', 'the'], 1, 'Engineer unli tovush bilan boshlanadi — an.'),
        gap('We ___ in Samarkand. (live)', ['live'], 'We bilan live (fe’lga -s qo‘shilmaydi).'),
        ord(['with', 'I', 'my', 'parents', 'live'], 'I live with my parents', 'I + live + with + my parents.'),
      ],
      check: [
        ch('My brother ___ twenty years old.', ['is', 'are', 'has'], 0, 'Yosh haqida: is + son.'),
        ch('I live ___ my grandmother.', ['with', 'in', 'at'], 0, 'With — kim bilan yashashni bildiradi.'),
        ch('They live ___ Bukhara.', ['in', 'with', 'on'], 0, 'Shahar oldidan in ishlatiladi.'),
        gap('My sister is ___ nurse. (a / an)', ['a'], 'Nurse undosh bilan boshlanadi — a.'),
        gap('My uncle is ___ engineer. (a / an)', ['an'], 'Engineer unli bilan boshlanadi — an.'),
        ord(['teacher', 'a', 'is', 'mother', 'My'], 'My mother is a teacher', 'My + ot + is + a + kasb.'),
      ],
      writing: {
        promptUz: 'Oilangiz haqida 4–5 gap yozing: kim bilan yashaysiz, ota-onangiz kim bo‘lib ishlaydi, qayerda yashaysiz.', minWords: 18,
        require: [{ re: String.raw`\b(I|we) live\b`, labelUz: '“I live” yoki “We live” ishlatilgan' }, { re: String.raw`\b(is|are) (a|an) \w+`, labelUz: 'kasb aytilgan (is a / is an …)' }],
        model: 'I live with my parents and my sister. My father is a driver. My mother is a teacher. My sister is a student. We live in Tashkent.',
      },
    },
  ],
};
