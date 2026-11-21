import { BookOpen, Headphones } from 'lucide-react';
import { Illo } from '../components/Illo';
import { LadderCard } from '../components/LadderCard';
import { listeningTests, readingTests } from '../content/mockTests';
import { loadResults } from '../lib/storage';
import { examLadder } from '../lib/examLadder';
import { levelIndex } from '../lib/levels';
import { useProfile } from '../lib/store';
import { L } from '../i18n';

type T = (typeof readingTests)[number] | (typeof listeningTests)[number];

export default function TestList({ track, kind }: { track: 'exam' | 'mocks'; kind: 'reading' | 'listening' }) {
  const p = useProfile();
  const all: T[] = kind === 'reading' ? readingTests : listeningTests;
  const results = loadResults().filter((r) => r.kind === kind);
  const ladder = examLadder(all.map((t) => ({ id: t.id, title: t.title, level: t.level, exam: t.exam, full: !!t.sections?.length })), results, p.level);
  const wi = levelIndex(ladder.working);
  const isFull = (t: T) => !!t.sections?.length && t.exam !== 'cefr';
  const groups: { title: string; note?: string; tests: T[] }[] = [
    { title: L('Sizning pog‘onangiz ({0})', [ladder.working]), tests: all.filter((t) => t.exam !== 'cefr' && !isFull(t) && t.level === ladder.working) },
    { title: L('Keyingi pog‘ona — qiyinroq'), tests: all.filter((t) => t.exam !== 'cefr' && !isFull(t) && levelIndex(t.level) === wi + 1) },
    { title: L('To‘liq imtihon — haqiqiy sharoit'), note: ladder.fullReady ? undefined : L('IELTS qiyinligi (C1). Avval o‘z pog‘onangizni bajaring.'), tests: all.filter(isFull) },
    { title: L('Takrorlash va boshqa testlar'), tests: all.filter((t) => t.exam === 'cefr' || (!isFull(t) && (levelIndex(t.level) < wi || levelIndex(t.level) > wi + 1))) },
  ].filter((g) => g.tests.length);
  const Icon = kind === 'reading' ? BookOpen : Headphones;
  const href = (id: string) => `#/${track}/${kind}/${id}`;
  return (
    <div>
      <div className={`card page-head with-illo ${kind === 'reading' ? 't-sky' : 't-coral'}`}>
        <h2 style={{ margin: 0 }}>{kind === 'reading' ? 'Reading' : 'Listening'} <em className="it">{L('testlari')}</em></h2>
        <p style={{ margin: '6px 0 0' }}>{L('IELTS formati va taymer — qiyinlik darajangizga mos.')} <span className="badge on">{L('Bepul')}</span></p>
        {!p.level && <p className="evidence" style={{ margin: '6px 0 0' }}><a href="#/placement">{L('Darajangizni aniqlang')}</a>  {L('— testlar sizga moslab tartiblanadi.')}</p>}
        <Illo kind={kind === 'reading' ? 'books' : 'headphones'} size={128} />
      </div>
      <LadderCard ladder={ladder} href={href} />
      {groups.map((g) => (
        <section key={g.title}>
          <h3 className="list-h">{g.title}</h3>
          {g.note && <p className="muted" style={{ margin: '-4px 4px 8px' }}>{g.note}</p>}
          <div className="lrows">
            {g.tests.map((t, i) => {
              const mine = results.filter((r) => r.title === t.title);
              const best = mine.length ? mine.reduce((a, b) => (b.correct / b.total > a.correct / a.total ? b : a)) : null;
              const pct = best ? best.correct / best.total : 0;
              return (
                <a key={t.id} className="lrow" href={href(t.id)}>
                  <span className={`sq ${['sky', 'coral', 'lilac', 'mint', 'butter', 'peach'][i % 6]}`}><Icon /></span>
                  <span className="grow">
                    <small>{t.exam === 'cefr' ? 'CEFR' : `IELTS · ${t.level}`}{best && pct >= 0.7 ? L(' · o‘tildi ✓') : ''}</small>
                    <b>{t.title.replace(/^(Reading|Listening) mini-test \d+: /, '')}</b>
                    <span className="lbar"><i style={{ width: `${pct * 100}%` }} /></span>
                  </span>
                  <span className="meta">{t.minutes}  {L('daq')}<br />{best ? `${best.correct}/${best.total}` : L('{0} savol', [t.questions.length])}</span>
                </a>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
