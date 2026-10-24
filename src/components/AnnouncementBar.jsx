import { useState } from 'react';
import { useSite } from '../context/site';
import { CloseIcon } from './Icons';

const KEY = 'tabigiBalAnnouncementClosed';

export default function AnnouncementBar() {
  const { settings } = useSite();
  const text = settings.announcement?.enabled ? settings.announcement.text?.trim() : '';
  const [closed, setClosed] = useState(() => {
    try { return sessionStorage.getItem(KEY); } catch { return null; }
  });
  if (!text || closed === text) return null;

  const close = () => {
    setClosed(text);
    try { sessionStorage.setItem(KEY, text); } catch { /* storage blocked */ }
  };

  return (
    <div className="announcement" role="note">
      <p>{text}</p>
      <button onClick={close} aria-label="Жабу"><CloseIcon width={16} height={16} /></button>
    </div>
  );
}
