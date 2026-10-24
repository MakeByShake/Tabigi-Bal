import { useCart } from '../context/cart';
import { whatsappUrl } from '../lib/config';
import { formatPrice, itemsLabel } from '../lib/format';
import { CartIcon, WhatsAppIcon } from './Icons';

// Phone: a bottom bar with the cart total stays in reach of the thumb.
// Desktop: a round WhatsApp button for quick questions.
export default function FloatingActions() {
  const { totalItems, totalPrice, openCart, isCartOpen } = useCart();
  const showBar = totalItems > 0 && !isCartOpen;

  return (
    <>
      <a
        href={whatsappUrl('Сәлеметсіз бе! Сұрағым бар.')}
        target="_blank"
        rel="noopener noreferrer"
        className={`fab-whatsapp ${showBar ? 'is-raised' : ''}`}
        aria-label="WhatsApp-қа жазу"
      >
        <WhatsAppIcon width={28} height={28} />
      </a>
      <div className={`mobile-cart-bar ${showBar ? 'is-visible' : ''}`} inert={!showBar}>
        <button onClick={openCart}>
          <span className="mcb-icon"><CartIcon /><span className="cart-badge">{totalItems}</span></span>
          <span className="mcb-text">
            <span className="muted small">{itemsLabel(totalItems)}</span>
            <strong>{formatPrice(totalPrice)}</strong>
          </span>
          <span className="mcb-cta">Себет →</span>
        </button>
      </div>
    </>
  );
}
