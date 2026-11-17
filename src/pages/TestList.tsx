import { BookOpen, Headphones } from 'lucide-react';
import { Illo } from '../components/Illo';
import { listeningTests, readingTests } from '../content/mockTests';
import { loadResults } from '../lib/storage';
import { levelIndex } from '../lib/levels';
import { useProfile } from '../lib/store';

export default function TestList({ track, kind }: { track: 'exam' | 'mocks'; kind: 'reading' | 'listening' }) {
  const p = useProfile();
  const all = kind === 'reading' ? readingTests : listeningTests;
  // Darajaga yaqinlari birinchi; daraja aniqlanmagan bo'lsa asl tartib
  const tests = p.level ? [...all].sort((a, b) => Math.abs(levelIndex(a.level) - levelIndex(p.level)) - Math.abs(levelIndex(b.level) - levelIndex(p.level))) : all;
  const near = (l: typeof all[number]['level']) => !!p.level && Math.abs(levelIndex(l) - levelIndex(p.level)) <= 1;
  const results = loadResults();
  const Icon = kind === 'reading' ? BookOpen : Headphones;
  return (
    <div>
      <div className={`card page-head with-illo ${kind === 'reading' ? 't-sky' : 't-coral'}`}>
        <h2 style={{ margin: 0 }}>{kind === 'reading' ? 'Reading' : 'Listening'} <em className="it">testlari</em></h2>
        <p style={{ margin: '6px 0 0' }}>Taymer va to‘liq tahlil bilan. <span className="badge on">Bepul</span></p>
        {!p.level && <p className="evidence" style={{ margin: '6px 0 0' }}><a href="#/placement">Darajangizni aniqlang</a> — testlar sizga moslab tartiblanadi.</p>}
        <Illo kind={kind === 'reading' ? 'books' : 'headphones'} size={128} />
      </div>
      <div className="lrows">
        {tests.map((t, i) => {
          const mine = results.filter((r) => r.title === t.title);
          const best = mine.length ? mine.reduce((a, b) => (b.correct > a.correct ? b : a)) : null;
          return (
            <a key={t.id} className="lrow" href={`#/${track}/${kind}/${t.id}`}>
              <span className={`sq ${['sky', 'coral', 'lilac', 'mint', 'butter', 'peach'][i % 6]}`}><Icon /></span>
              <span className="grow">
                <small>{t.exam === 'cefr' ? 'CEFR' : `IELTS · ${t.level}`}{near(t.level) ? ' · sizga mos' : ''}</small>
                <b>{t.title.replace(/^(Reading|Listening) mini-test \d+: /, '')}</b>
                <span className="lbar"><i style={{ width: best ? `${(best.correct / best.total) * 100}%` : '0%' }} /></span>
              </span>
              <span className="meta">{t.minutes} daq<br />{best ? `${best.correct}/${best.total}` : `${t.questions.length} savol`}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
