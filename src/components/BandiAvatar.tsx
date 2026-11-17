// Bandi — AI ustozning o'z personaji (original SVG illyustratsiya, tashqi rasm yo'q). Kattalar uchun: yosh, o'ziga ishongan,
// hazilkash yigit — xudi, bo'yniga osilgan quloqchin, soqol izi. Holatga qarab: ko'z qisadi, tinglaydi (quloqchin yonadi),
// o'ylaydi (tepaga qaraydi), gapiradi (og'iz harakatlanadi), kuladi, jahl qiladi, kesatadi (bir qosh ko'tariladi).
import type { CSSProperties } from 'react';
import type { CoachEmotion } from '../content/personas';
import { L } from '../i18n';

export type BandiPhase = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

const BROWS: Record<string, { l: string; r: string }> = {
  neutral: { l: 'translate(0 0)', r: 'translate(0 0)' },
  happy: { l: 'translate(0 -3)', r: 'translate(0 -3)' },
  laugh: { l: 'translate(0 -5) rotate(-6 109 98)', r: 'translate(0 -5) rotate(6 131 98)' },
  angry: { l: 'translate(0 3) rotate(14 109 98)', r: 'translate(0 3) rotate(-14 131 98)' },
  disappointed: { l: 'rotate(-12 109 98)', r: 'rotate(12 131 98)' },
  impressed: { l: 'translate(0 -6)', r: 'translate(0 -6)' },
  serious: { l: 'translate(0 2)', r: 'translate(0 2)' },
  sarcastic: { l: 'translate(0 1)', r: 'translate(0 -8) rotate(-10 131 98)' },
  thinking: { l: 'translate(0 -2)', r: 'translate(0 -7) rotate(-6 131 98)' },
};

function Mouth({ phase, emotion }: { phase: BandiPhase; emotion: CoachEmotion }) {
  const lip = '#6b2a35';
  if (phase === 'speaking' && (emotion === 'laugh' || emotion === 'happy')) return (
    <g className="b-mouth talk laugh"><path d="M100 146 Q120 178 140 146 Z" fill={lip} /><path d="M103 147 Q120 152 137 147 L136 152 Q120 156 104 152 Z" fill="#fff" /><ellipse cx="120" cy="165" rx="9" ry="4" fill="#e0707f" /></g>
  );
  if (phase === 'speaking') return (
    <g className="b-mouth talk"><ellipse cx="120" cy="153" rx="13" ry="8" fill={lip} /><path d="M108 150 Q120 147 132 150 L131 153 Q120 151 109 153 Z" fill="#fff" opacity=".9" /><ellipse cx="120" cy="158" rx="7" ry="3" fill="#e0707f" /></g>
  );
  if (phase === 'thinking') return <path className="b-mouth" d="M110 154 Q118 151 132 153" stroke={lip} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (phase === 'listening') return <path className="b-mouth" d="M106 150 Q120 160 134 150" stroke={lip} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (emotion === 'angry' || phase === 'error') return <path className="b-mouth" d="M106 157 Q120 148 134 157" stroke={lip} strokeWidth="4" fill="none" strokeLinecap="round" />;
  if (emotion === 'impressed') return <ellipse className="b-mouth" cx="120" cy="153" rx="6" ry="8" fill={lip} />;
  // o'ziga xos qiyshiq tabassum (smirk)
  return <path className="b-mouth" d="M103 151 Q121 160 138 145" stroke={lip} strokeWidth="4" fill="none" strokeLinecap="round" />;
}

export function BandiAvatar({ phase, emotion = 'neutral', level = 0, size = 200 }: { phase: BandiPhase; emotion?: CoachEmotion; level?: number; size?: number }) {
  const browKey = phase === 'thinking' ? 'thinking' : phase === 'error' ? 'disappointed' : phase === 'speaking' ? emotion : phase === 'listening' ? 'happy' : 'sarcastic';
  const brows = BROWS[browKey] ?? BROWS.neutral!;
  const look = phase === 'thinking' ? 'translate(-3 -4)' : phase === 'speaking' ? 'translate(1 0)' : 'translate(0 0)';
  const skin = '#f0c09b', skinDark = '#d99f7c', hair = '#211821', ink = '#1b1d38';
  return (
    <svg className={`bandi ${phase} e-${emotion}`} width={size} height={size} viewBox="0 0 240 240" role="img" aria-label={L('Bandi')} style={{ '--lvl': level } as CSSProperties}>
      <defs>
        <radialGradient id="bandi-halo" cx="50%" cy="45%" r="55%"><stop offset="0" stopColor="#c9bfff" /><stop offset="1" stopColor="#7b61ff" /></radialGradient>
        <linearGradient id="bandi-hood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2d55" /><stop offset="1" stopColor={ink} /></linearGradient>
        <clipPath id="bandi-clip"><circle cx="120" cy="120" r="118" /></clipPath>
      </defs>
      <circle className="b-halo" cx="120" cy="120" r="118" fill="url(#bandi-halo)" />
      <g clipPath="url(#bandi-clip)">
        <g className="b-body">
          {/* xudi */}
          <path d="M22 250 C 26 214, 58 196, 98 190 L 142 190 C 182 196, 214 214, 218 250 Z" fill="url(#bandi-hood)" />
          <path d="M84 196 C 96 214, 144 214, 156 196 C 148 204, 132 208, 120 208 C 108 208, 92 204, 84 196 Z" fill="#363a6e" />
          <path d="M108 206 L 104 232" stroke="#b9adff" strokeWidth="3" strokeLinecap="round" /><path d="M132 206 L 136 232" stroke="#b9adff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="104" cy="234" r="3" fill="#ffb48a" /><circle cx="136" cy="234" r="3" fill="#ffb48a" />
          {/* bo'yin */}
          <path d="M102 160 L 102 192 Q 120 202 138 192 L 138 160 Z" fill={skinDark} />
          {/* bo'yindagi quloqchin */}
          <g className="b-phones">
            <path d="M80 186 Q 120 214 160 186" stroke="#5fd0bd" strokeWidth="8" fill="none" strokeLinecap="round" />
            <rect x="66" y="172" width="20" height="28" rx="9" fill="#3fb3a0" /><rect x="154" y="172" width="20" height="28" rx="9" fill="#3fb3a0" />
            <rect x="70" y="177" width="6" height="18" rx="3" fill="#8be3d4" opacity=".7" />
          </g>
        </g>
        <g className="b-head">
          {/* quloqlar */}
          <ellipse cx="66" cy="118" rx="9" ry="14" fill={skinDark} /><ellipse cx="174" cy="118" rx="9" ry="14" fill={skinDark} />
          {/* yuz */}
          <path d="M66 106 C 66 66, 92 50, 120 50 C 148 50, 174 66, 174 106 C 174 140, 163 163, 142 174 C 128 181, 112 181, 98 174 C 77 163, 66 140, 66 106 Z" fill={skin} />
          <path d="M148 60 C 168 74, 176 100, 172 128 C 166 158, 150 174, 124 178 C 150 168, 164 146, 166 116 C 168 92, 162 74, 148 60 Z" fill={skinDark} opacity=".45" />
          {/* soqol izi */}
          <path d="M74 132 C 80 160, 98 176, 120 178 C 142 176, 160 160, 166 132 C 160 150, 146 164, 120 166 C 94 164, 80 150, 74 132 Z" fill="#5b3d36" opacity=".26" />
          <path d="M102 145 Q 120 137 138 145 Q 120 141 102 145 Z" fill="#5b3d36" opacity=".3" />
          {/* soch */}
          <path d="M64 104 C 60 66, 84 40, 118 38 C 152 34, 184 52, 180 94 C 179 100, 177 104, 175 106 C 171 86, 158 72, 138 70 C 120 68, 102 76, 88 70 C 80 80, 70 90, 64 104 Z" fill={hair} />
          <path d="M84 62 C 102 34, 152 28, 176 52 C 160 44, 128 44, 108 60 C 100 66, 92 66, 84 62 Z" fill="#3a2a3c" />
          <path d="M112 50 C 130 40, 156 42, 168 50" stroke="#4d3a50" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* qoshlar */}
          <g className="b-brows">
            <rect x="94" y="95" width="28" height="7.5" rx="3" fill={hair} transform={brows.l} />
            <rect x="128" y="95" width="28" height="7.5" rx="3" fill={hair} transform={brows.r} />
          </g>
          {/* ko'zlar */}
          <g className="b-eyes">
            <ellipse cx="108" cy="114" rx="11" ry="7.5" fill="#fff" /><ellipse cx="142" cy="114" rx="11" ry="7.5" fill="#fff" />
            <g transform={look}>
              <circle cx="109" cy="115" r="5.5" fill="#2b1f2e" /><circle cx="143" cy="115" r="5.5" fill="#2b1f2e" />
              <circle cx="111" cy="113" r="1.7" fill="#fff" /><circle cx="145" cy="113" r="1.7" fill="#fff" />
            </g>
          </g>
          {/* burun */}
          <path d="M124 118 Q 118 134 122 138 Q 127 141 132 137" stroke="#c98d6a" strokeWidth="3" fill="none" strokeLinecap="round" />
          {(emotion === 'laugh' || emotion === 'happy') && phase === 'speaking' && <g opacity=".35"><ellipse cx="90" cy="138" rx="10" ry="6" fill="#ff8a7a" /><ellipse cx="156" cy="138" rx="10" ry="6" fill="#ff8a7a" /></g>}
          <Mouth phase={phase} emotion={emotion} />
        </g>
        {phase === 'thinking' && <g className="b-dots"><circle cx="184" cy="54" r="6" fill="#fff" /><circle cx="200" cy="38" r="8" fill="#fff" /><circle cx="218" cy="20" r="10" fill="#fff" /></g>}
      </g>
    </svg>
  );
}
