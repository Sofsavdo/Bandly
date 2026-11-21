import { useState } from 'react';
import { LISTENING_TABLE, READING_ACADEMIC_TABLE, READING_GENERAL_TABLE, overallBand, rawToBand } from '../lib/band';
import { Illo } from '../components/Illo';
import { L } from '../i18n';

const bands = Array.from({ length: 19 }, (_, i) => i / 2);

function Overall() {
  const [v, setV] = useState({ l: 6.5, r: 6.5, w: 6, s: 6 });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLSelectElement>) => setV({ ...v, [k]: Number(e.target.value) });
  const o = overallBand(v.l, v.r, v.w, v.s);
  const fields: [keyof typeof v, string][] = [['l', 'Listening'], ['r', 'Reading'], ['w', 'Writing'], ['s', 'Speaking']];
  return (
    <div className="card page-head with-illo t-mint">
      <h3>{L('Umumiy band kalkulyatori')}</h3>
      <div className="row">
        {fields.map(([k, label]) => (
          <label key={k}>{label}{' '}
            <select value={v[k]} onChange={set(k)}>{bands.map((b) => <option key={b} value={b}>{b.toFixed(1)}</option>)}</select>
          </label>
        ))}
      </div>
      <p className="big">{L('Overall:')} {o.toFixed(1)}</p>
      <p className="evidence">{L('4 ball o‘rtachasi 0.5 ga yaxlitlanadi.')}</p>
    </div>
  );
}

function Raw() {
  const [raw, setRaw] = useState(30);
  return (
    <div className="card">
      <h3>{L('To‘g‘ri javoblar → band (Listening / Reading)')}</h3>
      <label>{L('40 tadan to‘g‘ri javoblar:')} <input type="number" min={0} max={40} value={raw} onChange={(e) => setRaw(Math.max(0, Math.min(40, Number(e.target.value) || 0)))} /></label>
      <ul>
        <li>{L('Listening:')} <b>{rawToBand(raw, LISTENING_TABLE).toFixed(1)}</b></li>
        <li>{L('Reading Academic:')} <b>{rawToBand(raw, READING_ACADEMIC_TABLE).toFixed(1)}</b></li>
        <li>{L('Reading General Training:')} <b>{rawToBand(raw, READING_GENERAL_TABLE).toFixed(1)}</b></li>
      </ul>
    </div>
  );
}

export default function Tools() {
  return (
    <div>
      <div className="card"><h2>{L('Bepul asboblar')}</h2><Illo kind="books" size={124} /><p>{L('Ro‘yxatdan o‘tish shart emas.')}</p></div>
      <Overall />
      <Raw />
      <div className="card"><h3>{L('Boshqa bepul vositalar')}</h3><p className="row"><a className="btn" href="/vositalar/ielts-cefr-multilevel">{L('IELTS ↔ CEFR ↔ Multilevel')}</a><a className="btn" href="/vositalar/speaking-writing-mavzular">{L('Speaking va Writing mavzulari')}</a></p></div>
    </div>
  );
}
