import { useState } from 'react';
import { useCart } from '../context/CartContext';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { getTotalItems, openCart } = useCart();
  const totalItems = getTotalItems();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header>
      <div className="logo">
        <img src="/images/Tabigi Bal Logo.jpg" alt="Tabigi Ball Logo" />
        <h2>Tabigi Bal</h2>
      </div>

      <ul className={mobileMenuOpen ? 'active' : ''}>
        <li><a href="#welcome" onClick={closeMobileMenu}>Біз Туралы</a></li>
        <li><a href="#products" onClick={closeMobileMenu}>Біздің өнімдер</a></li>
        <li><a href="#why-us" onClick={closeMobileMenu}>Не үшін біз?</a></li>
        <li><a href="#contact" onClick={closeMobileMenu}>Хабарда болу үшін</a></li>
      </ul>

      <div className="icons">
        <div className="cart-icon-container" onClick={openCart}>
          <img src="/images/cart.png" alt="Shopping Cart" />
          {totalItems > 0 && (
            <span className="cart-count">{totalItems}</span>
          )}
        </div>
        <a href="https://www.instagram.com/tabigi_balkz?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
          <img src="/images/instagram.png" alt="Instagram" />
        </a>
        <a href="https://t.me/+77007380979" target="_blank" rel="noopener noreferrer">
          <img src="/images/telegram.png" alt="Telegram" />
        </a>
        <a href="https://wa.me/+7007380979" target="_blank" rel="noopener noreferrer">
          <img src="/images/apple.png" alt="WhatsApp" />
        </a>
      </div>

      {/* Mobile icons container */}
      <div className="mobile-icons">
        <div className="mobile-cart-icon" onClick={openCart}>
          <img src="/images/cart.png" alt="Mobile Cart" />
          {totalItems > 0 && (
            <span className="cart-count">{totalItems}</span>
          )}
        </div>
        <button 
          className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
