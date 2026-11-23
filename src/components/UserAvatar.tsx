// Foydalanuvchi avatari: Telegram profil rasmi bo'lsa — rasm, bo'lmasa yoki yuklanmasa — ismning bosh harfi.
import { useState } from 'react';
import type { Account } from '../lib/account';

export function UserAvatar({ acc, className = 'avatar' }: { acc: Account | null; className?: string }) {
  const [broken, setBroken] = useState(false);
  const letter = (acc?.nickname ?? 'S').slice(0, 1).toUpperCase();
  return (
    <span className={`${className}${acc?.photo && !broken ? ' has-photo' : ''}`} aria-hidden="true">
      {acc?.photo && !broken ? <img src={acc.photo} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" onError={() => setBroken(true)} /> : letter}
    </span>
  );
}
