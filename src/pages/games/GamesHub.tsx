import { ArrowRight, BookOpen, Mic, Puzzle, Swords, Zap } from 'lucide-react';
import { vocabForLevel } from '../../content/vocab';
import { isDue, isMastered } from '../../lib/srs';
import { useProfile } from '../../lib/store';
import { Illo } from '../../components/Illo';
import { L } from '../../i18n';

const games = [
  { href: '#/challenge', icon: <Mic size={26} color="#ff6b5b" />, cls: '', title: L('Jim qolma! — Minora'), text: L('Gapiring — minora o‘sadi') },
  { href: '#/games/rush', icon: <Zap size={26} color="#ffb02e" />, cls: '', title: L('So‘z poygasi'), text: L('60 soniya, 3 jon, kombo ball') },
  { href: '#/games/pairs', icon: <Puzzle size={26} color="#5cd6ff" />, cls: 'g2', title: L('Juftlik'), text: L('So‘z va ma’noni juftlang') },
  { href: '#/games/spell', icon: <BookOpen size={26} color="#ff8fb1" />, cls: 'g3', title: L('Imlo sinovi'), text: L('Misol gapdan so‘zni yozing') },
  { href: '#/duel', icon: <Swords size={26} color="#8bff9c" />, cls: 'g4', title: L('Duel'), text: L('Do‘st bilan bir xil so‘zlarda') },
];

export default function GamesHub() {
  const p = useProfile();
  const vocab = vocabForLevel(p.level);
  const now = Date.now();
  const mastered = vocab.filter((w) => isMastered(p.srs[w.id])).length;
  const due = vocab.filter((w) => p.srs[w.id] && isDue(p.srs[w.id], now)).length;
  const fresh = vocab.filter((w) => !p.srs[w.id]).length;
  const topics = [...new Set(vocab.map((w) => w.topic))];
  return (
    <div>
      <div className="card page-head with-illo t-pink">
        <h2>{L('So‘z o‘yinlari')}</h2><Illo kind="star" size={124} />
        <p>{L('Bepul va cheksiz.')}</p>
        <div className="row pills-row">
          <span className="pill">{L('Yangi')} {fresh}</span>
          <span className="pill">{L('Takrorlash')} {due}</span>
          <span className="pill">{L('Yodlangan')} {mastered}</span>
        </div>
      </div>
      <div className="game-list">
        {games.map((g) => (
          <a key={g.href} className={`gm-row ${g.cls}`} href={g.href}><span className="gico">{g.icon}</span><span className="gtx"><b>{g.title}</b><small>{g.text}</small></span><ArrowRight size={18} /></a>
        ))}
      </div>
      <details className="card fold">
        <summary><h3 style={{ display: 'inline', margin: 0 }}>{L('Mavzular bo‘yicha')} · {mastered}/{vocab.length}</h3></summary>
        <div className="topic-grid">
        {topics.map((t) => {
          const list = vocab.filter((w) => w.topic === t);
          const m = list.filter((w) => isMastered(p.srs[w.id])).length;
          return (
            <div key={t} style={{ margin: '8px 0' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}><span>{t}</span><span className="evidence">{m} / {list.length}</span></div>
              <div className="bar"><i style={{ width: `${(m / list.length) * 100}%` }} /></div>
            </div>
          );
        })}
        </div>
      </details>
    </div>
  );
}
