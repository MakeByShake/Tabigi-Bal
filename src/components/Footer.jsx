import { useSite } from '../context/site';
import { LOGO_SRC, mapUrl } from '../lib/config';
import { ClockIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TelegramIcon, WhatsAppIcon } from './Icons';

export default function Footer() {
  const { settings: s, wa } = useSite();
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a href="#top" className="brand">
            <img src={LOGO_SRC} alt="" width="44" height="44" />
            <span className="brand-name">Tabigi <span>Bal</span></span>
          </a>
          <p>
            Табиғи бал өндірісі. Көпжылдық тәжірибе мен араға деген сүйіспеншілік арқылы жұмыс істейміз.
          </p>
          <div className="footer-social">
            <a href={wa()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
            {s.telegram && <a href={s.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><TelegramIcon /></a>}
            {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>}
          </div>
        </div>

        <div>
          <h4>Хабарласу</h4>
          <ul className="footer-list">
            <li><PhoneIcon /><a href={`tel:+${s.whatsapp}`}>{s.phone}</a></li>
            <li><WhatsAppIcon /><a href={wa()} target="_blank" rel="noopener noreferrer">WhatsApp-қа жазу</a></li>
            {s.email && <li><MailIcon /><a href={`mailto:${s.email}`}>{s.email}</a></li>}
          </ul>
        </div>

        <div>
          <h4>Өзіңіз келіп алу</h4>
          <ul className="footer-list">
            <li><PinIcon /><a href={mapUrl(s.address)} target="_blank" rel="noopener noreferrer">{s.address}</a></li>
            <li><ClockIcon /><span>{s.hours}</span></li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} Tabigi Bal. Барлық құқықтар қорғалған.</span>
        <a href="#top">Жоғарыға ↑</a>
      </div>
    </footer>
  );
}
