import { CheckCircle2, Gift, Target } from 'lucide-react';
import { useState } from 'react';
import { localDayKey } from '../lib/adaptive/store';
import { claimQuest, dailyQuests, loadQuestDay, QUEST_XP } from '../lib/gamify';
import { loadProgress } from '../lib/lessons';
import { dueMistakes, load as loadMistakes } from '../lib/mistakes';
import { addXp, useProfile } from '../lib/store';
import { L } from '../i18n';

/** Kunlik vazifalar (GAMIFIED_LEARNING_SPEC.md §3.7): 3 ta, o'quvchi holatidan aniqlanadi; har biri bepul imkoniyat bilan bajariladi. */
export function QuestsCard() {
  const p = useProfile();
  const now = Date.now();
  const day = localDayKey(now);
  const mistakes = loadMistakes();
  const attempts = mistakes.reduce((s, m) => s + m.attempts, 0);
  const [qd, setQd] = useState(() => loadQuestDay(day, { games: p.gamesPlayed, mistakeAttempts: attempts }));
  const passedToday = Object.values(loadProgress()).filter((x) => x.passedAt && localDayKey(x.passedAt) === day).length;
  const quests = dailyQuests({
    day,
    lessonsPassedToday: passedToday,
    dailyXp: p.dailyDay === day ? p.dailyXp : 0,
    dailyGoal: p.dailyGoal,
    dueMistakes: dueMistakes(now, mistakes).length,
    mistakeAttemptsToday: Math.max(0, attempts - qd.base.mistakeAttempts),
    gamesToday: Math.max(0, p.gamesPlayed - qd.base.games),
  });
  const doneN = quests.filter((q) => qd.claimed.includes(q.id)).length;
  return (
    <section className="card quests" aria-labelledby="quests-h">
      <h3 id="quests-h"><Target size={18} />  {L('Bugungi vazifalar')} <span className="pill">{doneN}/{quests.length}</span></h3>
      <ul className="quest-list">
        {quests.map((q) => {
          const claimed = qd.claimed.includes(q.id);
          return (
            <li key={q.id} className={`quest${claimed ? ' claimed' : ''}`}>
              <div className="grow">
                <a href={q.href}><b>{q.titleUz}</b></a>
                <div className="audio-bar" style={{ marginTop: 6 }} aria-hidden="true"><i style={{ width: `${(q.progress / q.target) * 100}%` }} /></div>
                <span className="muted" style={{ fontSize: 12.5 }}>{q.progress}/{q.target}</span>
              </div>
              {claimed ? <span className="ok" aria-label={L('Olindi')}><CheckCircle2 size={20} /></span>
                : <button type="button" className="btn sm primary" disabled={!q.done} onClick={() => { const r = claimQuest(qd, q); if (r.xp) { addXp(r.xp); setQd(r.qd); } }}><Gift size={14} /> +{QUEST_XP}  {L('XP')}</button>}
            </li>
          );
        })}
      </ul>
      {doneN === quests.length && <p className="muted" style={{ fontSize: 13 }}>{L('Barcha vazifalar bajarildi — ertaga yangilari keladi.')}</p>}
    </section>
  );
}
