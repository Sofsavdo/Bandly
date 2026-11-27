// Karta-xabarlarini o'qiydigan Telegram sessiyasini yaratadi (bir marta, O'Z KOMPYUTERINGIZDA). Natija — SESSION qatori:
// uni FAQAT Railway Variables'ga (TG_SESSION) qo'ying; hech kimga yubormang, repoga yozmang — u akkauntga to'liq kirishdir.
// Ishga tushirish:  TG_API_ID=... TG_API_HASH=... npm run pay:login
//   (TG_API_ID va TG_API_HASH — https://my.telegram.org → API development tools, shu akkaunt bilan kirib oling.)
import { createInterface } from 'node:readline/promises';
import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { LogLevel } from 'telegram/extensions/Logger';

const apiId = Number(process.env.TG_API_ID);
const apiHash = (process.env.TG_API_HASH ?? '').trim();
if (!apiId || !apiHash) { console.error('TG_API_ID va TG_API_HASH kerak (my.telegram.org).'); process.exit(1); }

const rl = createInterface({ input: process.stdin, output: process.stdout });
const client = new TelegramClient(new StringSession(''), apiId, apiHash, { connectionRetries: 5 });
client.setLogLevel(LogLevel.ERROR);
await client.start({
  phoneNumber: () => rl.question('Telefon raqam (+998...): '),
  phoneCode: () => rl.question('Telegram yuborgan kod: '),
  password: () => rl.question('2 bosqichli parol (yo‘q bo‘lsa — Enter): '),
  onError: (e) => { console.error('Xato:', e.message); return Promise.resolve(false); },
});
const me = await client.getMe();
console.log(`\nUlandi: ${(me as { firstName?: string }).firstName ?? ''} (id ${String((me as { id: unknown }).id)})`);
console.log('\nSESSION (maxfiy!) — Railway Variables → TG_SESSION:\n');
console.log(client.session.save());
console.log('\nKeyingi qadam: Telegram → Sozlamalar → Qurilmalar ro‘yxatida shu sessiya ko‘rinadi; bekor qilsangiz, qayta kirish kerak bo‘ladi.');
rl.close();
await client.disconnect();
process.exit(0);
