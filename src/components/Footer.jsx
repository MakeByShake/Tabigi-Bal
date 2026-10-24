import { CONTACTS, LOGO_SRC, whatsappUrl } from '../lib/config';
import { ClockIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon, TelegramIcon, WhatsAppIcon } from './Icons';

export default function Footer() {
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
            <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
            <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><TelegramIcon /></a>
            <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          </div>
        </div>

        <div>
          <h4>Хабарласу</h4>
          <ul className="footer-list">
            <li><PhoneIcon /><a href={`tel:+${CONTACTS.phoneDigits}`}>{CONTACTS.phoneDisplay}</a></li>
            <li><WhatsAppIcon /><a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">WhatsApp-қа жазу</a></li>
            <li><MailIcon /><a href={`mailto:${CONTACTS.email}`}>{CONTACTS.email}</a></li>
          </ul>
        </div>

        <div>
          <h4>Өзіңіз келіп алу</h4>
          <ul className="footer-list">
            <li><PinIcon /><a href={CONTACTS.mapUrl} target="_blank" rel="noopener noreferrer">{CONTACTS.address}</a></li>
            <li><ClockIcon /><span>{CONTACTS.hours}</span></li>
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
