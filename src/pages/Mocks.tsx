import { BookOpen, FlaskConical, Headphones, Ruler, Target } from 'lucide-react';
import { Tile } from '../components/Tile';
import { listeningTests, readingTests } from '../content/mockTests';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';

/** Mock Arena: free, automatically graded Reading and Listening mocks; the full simulation (with Writing/Speaking) stays in the subscription. */
export default function Mocks() {
  const p = useProfile();
  const res = loadResults().filter((r) => r.kind === 'reading' || r.kind === 'listening');
  const solved = new Set(res.map((r) => r.title)).size;
  const total = readingTests.length + listeningTests.length;
  const bands = res.filter((r) => typeof r.band === 'number').slice(0, 6).map((r) => r.band as number);
  const avg = bands.length ? Math.round((bands.reduce((a, b) => a + b, 0) / bands.length) * 2) / 2 : null;
  const free = <span className="badge on">Bepul</span>;
  const fullLock = !p.plan.mocks && <span className="badge">Obuna kerak</span>;
  return (
    <div>
      <div className="card">
        <h2>Mock Arena <span className="badge on">Reading va Listening bepul</span></h2>
        <p>Imtihon sharoitida: taymer, avtomatik baho (AI’siz, kalit bo‘yicha) va har savol bo‘yicha izoh. Natijalar qurilmangizda saqlanadi va “IELTS tayyorgarligi” hamda “Bugungi reja”ga ta’sir qiladi.</p>
        <p className="row">
          <span className="pill">Yechilgan: {solved}/{total}</span>
          <span className="pill">Urinishlar: {res.length}</span>
          <span className="pill">Oxirgi testlar o‘rtachasi: {avg !== null ? `${avg.toFixed(1)} (taxminiy)` : '—'}</span>
        </p>
        <p className="muted" style={{ fontSize: 13 }}>Ballar taxminiy va rasmiy IELTS natijasi emas. AI Writing/Speaking baholash va chuqur tahlil — premium.</p>
      </div>
      <div className="grid">
        <Tile href="#/mocks/reading" icon={BookOpen} tone="blue" title="IELTS Reading mini-mocklar" text={`${readingTests.length} ta test · 13 savoldan`} badge={free} />
        <Tile href="#/mocks/listening" icon={Headphones} tone="red" title="IELTS Listening mini-mocklar" text={`${listeningTests.length} ta test · 10 savoldan`} badge={free} />
        <Tile href="#/exam" icon={Target} tone="orange" title="IELTS tayyorgarligim" text="Ko‘nikmalar bo‘yicha taxminiy band va eng zaif tomoningiz" badge={free} />
        <Tile href="#/mocks/full" icon={FlaskConical} tone="purple" title="To‘liq imtihon simulyatsiyasi" text="Listening → Reading → Writing → Speaking, taymer bilan, umumiy band" badge={fullLock} />
        <Tile icon={Ruler} tone="ink" title="SAT va CEFR mock" text="Rasmiy formatlar tekshirilgach qo‘shiladi" badge={<span className="badge soon">tez orada</span>} />
      </div>
    </div>
  );
}
