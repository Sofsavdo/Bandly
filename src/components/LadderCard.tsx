// IELTS zinapoyasi kartasi: hozirgi pog'ona, o'tish sharti va keyingi tavsiya etilgan test.
import { ArrowRight, Footprints, PartyPopper, TriangleAlert } from 'lucide-react';
import { STAGE, type Ladder } from '../lib/examLadder';
import { L } from '../i18n';

export function LadderCard({ ladder, href }: { ladder: Ladder; href: (id: string) => string }) {
  const st = STAGE[ladder.working];
  return (
    <div className="card ladder">
      <div className="ladder-steps" aria-hidden="true">{(['A2', 'B1', 'B2', 'C1'] as const).map((lv) => <i key={lv} className={lv === ladder.working ? 'now' : ['A2', 'B1', 'B2', 'C1'].indexOf(lv) < ['A2', 'B1', 'B2', 'C1'].indexOf(ladder.working) ? 'done' : ''}><b>{lv}</b></i>)}</div>
      <h3 style={{ margin: '10px 0 2px' }}><Footprints size={18} />  {L('Pog‘onangiz: {0} · {1}', [ladder.working, st.name])}</h3>
      <p className="muted" style={{ margin: 0 }}>{st.descUz}</p>
      {ladder.climbed && <p className="ok" style={{ margin: '6px 0 0' }}><PartyPopper size={15} />  {L('Oldingi pog‘onani bajardingiz — yangi pog‘ona ochildi!')}</p>}
      {ladder.working !== 'C1' && <p style={{ margin: '8px 0 0' }}>{L('Keyingi pog‘onaga o‘tish: shu darajadagi {0} ta testdan 70% va undan yuqori. Bajarildi: {1}/{0}', [ladder.need, Math.min(ladder.passed, ladder.need)])}</p>}
      {ladder.struggling && <p className="notice"><TriangleAlert size={15} />  {L('Qiyin bo‘ldi — pastroq pog‘onani takrorlang.')}</p>}
      {ladder.next && <div className="ladder-next"><span className="muted">{L('Keyingi test')}</span><b>{ladder.next.title.replace(/^(Reading|Listening) mini-test \d+: /, '')}</b><a className="btn primary" href={href(ladder.next.id)}>{L('Boshlash')} <ArrowRight size={15} /></a></div>}
    </div>
  );
}
