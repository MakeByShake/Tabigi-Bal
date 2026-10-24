import { useEffect, useState } from 'react';
import { useCart } from '../context/cart';
import { useSite } from '../context/site';
import { LOGO_SRC } from '../lib/config';
import { CartIcon, CloseIcon, InstagramIcon, ListIcon, TelegramIcon, WhatsAppIcon } from './Icons';

const NAV = [
  { href: '#products', label: 'Өнімдер' },
  { href: '#about', label: 'Біз туралы' },
  { href: '#how', label: 'Қалай тапсырыс беру' },
  { href: '#faq', label: 'Сұрақтар' },
  { href: '#contact', label: 'Байланыс' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, openCart } = useCart();
  const { settings: s, wa } = useSite();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="brand" aria-label="Tabigi Bal — басты бет">
          <img src={LOGO_SRC} alt="" width="44" height="44" />
          <span className="brand-name">Tabigi <span>Bal</span></span>
        </a>

        <nav className={`main-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Негізгі мәзір">
          <ul>
            {NAV.map((item) => (
              <li key={item.href}><a href={item.href} onClick={close}>{item.label}</a></li>
            ))}
          </ul>
          <div className="nav-social">
            <a href={wa()} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
            <a href={s.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram"><TelegramIcon /></a>
            <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
          </div>
        </nav>
        {menuOpen && <div className="nav-backdrop" onClick={close} aria-hidden="true" />}

        <div className="header-actions">
          <div className="header-social">
            <a href={s.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="icon-btn"><InstagramIcon /></a>
            <a href={s.telegram} target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="icon-btn"><TelegramIcon /></a>
          </div>
          <button className="cart-btn" onClick={openCart} aria-label={`Себет, ${totalItems} тауар`}>
            <CartIcon />
            <span className="cart-btn-label">Себет</span>
            {totalItems > 0 && <span className="cart-badge" key={totalItems}>{totalItems}</span>}
          </button>
          <button
            className="icon-btn menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Мәзірді жабу' : 'Мәзірді ашу'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <CloseIcon /> : <ListIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
