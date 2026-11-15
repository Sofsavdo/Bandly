// Ovoz demosi uchun sinov gaplari (original matn). Eleven v4 audio teglari: [laughs], [sarcastic], [shouting] va h.k.
// «...» = o'quvchining xatosi o'zbek harflarida; inglizcha so'zlar to'g'ridan-to'g'ri yoziladi.
// 'savage' darajadagi gaplar faqat egasi tinglashi uchun; mahsulotda OD-06b qarorigacha o'chiq.

export type DemoTone = 'friendly' | 'comedy' | 'savage' | 'examiner' | 'teacher' | 'dialect';
export interface DemoLine { id: string; tone: DemoTone; text: string; note?: string }

export const ALLOWED_TAGS = [
  'warmly', 'laughs', 'laughs harder', 'starts laughing', 'sarcastic', 'shouting', 'sighs', 'frustrated sigh',
  'excited', 'mischievously', 'measured', 'clearly', 'curious', 'dismissive',
  'Fergana valley accent', 'Khorezm accent', 'Tashkent accent',
] as const;

export const DEMO_LINES: DemoLine[] = [
  { id: '01-friendly', tone: 'friendly', text: '[warmly] Yaxshi urinish! Faqat «shkul» emas — school. Qani, yana bir marta ayt.' },
  { id: '02-comedy', tone: 'comedy', text: '[laughs] Sen «tink» deding-a? Think! Tilni tishlar orasiga qo‘y, uyalma.' },
  { id: '03-sarcastic', tone: 'comedy', text: '[sarcastic] Voy, zo‘r-ku… «I go yesterday». Ingliz tili hozir yig‘layapti. I went yesterday!' },
  { id: '04-savage', tone: 'savage', text: '[shouting] Voy, ahmoq-ey! «Shkul» deysanmi?! School! Skul! Qaytar!' },
  { id: '05-savage', tone: 'savage', text: '[frustrated sigh] Ingliz tilini bilaman deb o‘ylayapsanmi? [shouting] «Vork» emas — work! Lablarni dumaloq qil!' },
  { id: '06-savage', tone: 'savage', text: '[laughs harder] Bu talaffuz bilan odam bo‘lmaysan-ku! [mischievously] Island — «s» o‘qilmaydi: aylend.' },
  { id: '07-examiner', tone: 'examiner', text: '[measured] Good. Now, part two. Describe a place you visited recently. You have one minute to prepare.' },
  { id: '08-teacher', tone: 'teacher', text: 'Bugun present perfect bilan past simple farqini o‘rganamiz. I have been to Samarkand — bu tajriba. I went to Samarkand last year — aniq vaqt.' },
  { id: '09-ipa', tone: 'teacher', text: 'To‘g‘risi /skuːl/, «shkul» emas. Yana: /skuːl/.', note: 'v4 IPA support test' },
  { id: '10-model', tone: 'teacher', text: '[clearly] Comfortable. Three syllables, not four. Comfortable.' },
  { id: '11-praise', tone: 'friendly', text: '[excited] Zo‘r! I have been studying English for two years — mukammal gap!' },
  { id: '12-dialect', tone: 'dialect', text: '[Fergana valley accent] Ha, endi bo‘pti-da, gapir-chi, qanaqa qilib school deysan?', note: 'experimental: dialect via tag, unverified' },
];

export const totalChars = (lines: DemoLine[] = DEMO_LINES): number => lines.reduce((s, l) => s + l.text.length, 0);
