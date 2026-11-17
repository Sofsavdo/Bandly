import { BookOpen, CheckCircle2, Clock, Flame, Headphones, Mic, PenLine, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { dailyTasks, homeworkStreak, timeLeft, type HwId } from '../lib/homework';
import { loadResults } from '../lib/storage';
import { useProfile } from '../lib/store';
import { L } from '../i18n';

const ICON: Record<HwId, LucideIcon> = { listening: Headphones, reading: BookOpen, writing: PenLine, speaking: Mic };

export default function Homework() {
  const p = useProfile();
  const [tab, setTab] = useState<'todo' | 'done'>('todo');
  void p.today; // vazifa belgilari yangilanganda qayta chiziladi
  const results = loadResults();
  const tasks = dailyTasks(p.level, results);
  const todo = tasks.filter((t) => !t.done), done = tasks.filter((t) => t.done);
  const list = tab === 'todo' ? todo : done;
  const streak = homeworkStreak(results);
  return (
    <div>
      <div className="card">
        <div className="myplan-head">
          <div>
            <h2 style={{ margin: 0 }}>{L('Uyga vazifa')}</h2>
            <p className="evidence">{L('Har kuni 4 ta vazifa: darajangizga (')}{p.level ?? 'B1'}{L(') mos tanlanadi, ertasi kuni yangilanadi. Imtihon rejimidagi kabi har kuni ozdan: eng samarali usul shu.')}</p>
          </div>
          <div className="row"><span className="pill"><Flame size={14} color="#ff7a1a" fill="#ff7a1a" />  {L('Ketma-ket:')} {streak}  {L('kun')}</span><span className="pill">{L('Bugun:')} {done.length}/4</span></div>
        </div>
        <div className="bar" style={{ margin: '10px 0' }}><i style={{ width: `${(done.length / 4) * 100}%` }} /></div>
        {!p.level && <p className="evidence"><a href="#/placement">{L('Darajangizni aniqlang')}</a>{L(': vazifalar sizga moslab beriladi.')}</p>}
        <div className="price-tabs" role="tablist">
          <button className={tab === 'todo' ? 'on' : ''} onClick={() => setTab('todo')}>{L('Bajarilmagan ·')} {todo.length}</button>
          <button className={tab === 'done' ? 'on' : ''} onClick={() => setTab('done')}>{L('Bajarilgan ·')} {done.length}</button>
        </div>
      </div>
      {list.length === 0 && <div className="card center">{tab === 'todo' ? L('Bugungi vazifalar tugadi. Ertaga yangilari paydo bo‘ladi!') : L('Hali bajarilgan vazifa yo‘q.')}</div>}
      <div className="hw-grid">
        {list.map((t, i) => {
          const Ico = ICON[t.id];
          return (
            <div key={t.id} className={`hw-card ${t.done ? 'done' : ''}`}>
              <div className="hw-top"><span className="hw-ico"><Ico size={22} /></span><span className="hw-n">{String(tasks.indexOf(t) + 1).padStart(2, '0')}</span></div>
              <small className="hw-kind">{t.title}</small>
              <h3>{t.sub}</h3>
              {t.done ? (
                <p className="ok"><CheckCircle2 size={16} style={{ verticalAlign: -3 }} /> {t.result!.kind === 'speaking' ? 'Bajarildi' : `${t.result!.correct}/${t.result!.total}`}{typeof t.result!.band === 'number' ? ` · taxminiy band ${t.result!.band.toFixed(1)}` : ''}</p>
              ) : (
                <p className="evidence"><Clock size={14} style={{ verticalAlign: -2 }} />  {L('Bugun 23:59 gacha ·')} {timeLeft(t.deadline)}</p>
              )}
              <a className={`btn ${t.done ? '' : 'primary'}`} href={t.href}>{t.done ? L('Qayta ko‘rish') : L('Boshlash')}</a>
              <span hidden>{i}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
