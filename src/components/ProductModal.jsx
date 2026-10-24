import { useEffect, useRef } from 'react';
import { useCart } from '../context/cart';
import { CATEGORIES } from '../data/products';
import { displayPrice, formatPrice } from '../lib/format';
import { whatsappUrl } from '../lib/config';
import { CartIcon, CloseIcon, WhatsAppIcon } from './Icons';
import QuantityStepper from './QuantityStepper';

export default function ProductModal({ product, onClose }) {
  const { addToCart, setQuantity, getQuantity, openCart } = useCart();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    closeRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [product, onClose]);

  if (!product) return null;
  const qty = getQuantity(product.id);
  const category = CATEGORIES.find((c) => c.id === product.category)?.label;

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal">
        <button ref={closeRef} className="icon-btn modal-close" onClick={onClose} aria-label="Жабу"><CloseIcon /></button>
        <div className="modal-media">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="modal-body">
          {category && <p className="eyebrow">{category}</p>}
          <h2 id="modal-title">{product.name}</h2>
          <p className="modal-price">{displayPrice(product)}</p>
          <p className="modal-desc">{product.description}</p>
          <div className="modal-actions">
            {qty > 0 ? (
              <>
                <QuantityStepper value={qty} onChange={(q) => setQuantity(product.id, q)} label={`${product.name}, саны`} />
                <button className="btn btn-primary" onClick={() => { onClose(); openCart(); }}>
                  Себетке өту · {formatPrice(product.price * qty)}
                </button>
              </>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => addToCart(product.id)}>
                <CartIcon /> Себетке қосу
              </button>
            )}
          </div>
          <a
            className="modal-ask"
            href={whatsappUrl(`Сәлеметсіз бе! «${product.name}» туралы сұрағым бар.`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon /> Бұл өнім туралы сұрау
          </a>
        </div>
      </div>
    </div>
  );
}
