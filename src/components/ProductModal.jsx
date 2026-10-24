import { useEffect, useRef } from 'react';
import { useCart } from '../context/cart';
import { useSite } from '../context/site';
import { CATEGORIES } from '../data/products';
import { displayPrice, formatPrice } from '../lib/format';
import { BellIcon, CartIcon, CloseIcon, WhatsAppIcon } from './Icons';
import QuantityStepper from './QuantityStepper';
import { ProductBadges } from './ProductCard';
import { notifyText } from '../lib/product';

export default function ProductModal({ product, onClose }) {
  const { addToCart, setQuantity, getQuantity, openCart } = useCart();
  const { wa } = useSite();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!product) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [product, onClose]);

  if (!product) return null;
  const qty = getQuantity(product.id);
  const out = product.stock === 'out';
  const category = CATEGORIES.find((c) => c.id === product.category)?.label;

  return (
    <div className="modal-root" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal">
        <button ref={closeRef} className="icon-btn modal-close" onClick={onClose} aria-label="Жабу"><CloseIcon /></button>
        <div className={`modal-media ${out ? 'is-out' : ''}`}>
          <img src={product.image} alt={product.name} />
          <ProductBadges product={product} />
        </div>
        <div className="modal-body">
          {category && <p className="eyebrow">{category}</p>}
          <h2 id="modal-title">{product.name}</h2>
          <p className="modal-price">
            {displayPrice(product)}
            {product.unit && <span className="modal-unit"> / {product.unit}</span>}
            {product.oldPrice > product.price && <s>{formatPrice(product.oldPrice)}</s>}
          </p>
          <p className="modal-desc">{product.description}</p>
          <div className="modal-actions">
            {out ? (
              <a className="btn btn-ghost btn-lg" href={wa(notifyText(product.name))} target="_blank" rel="noopener noreferrer">
                <BellIcon /> Келгенде хабарлау
              </a>
            ) : qty > 0 ? (
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
          {out && <p className="muted small out-note">Бұл өнім уақытша жоқ. Батырманы басыңыз — келгенде WhatsApp арқылы хабарлаймыз.</p>}
          {!out && (
            <a className="modal-ask" href={wa(`Сәлеметсіз бе! «${product.name}» туралы сұрағым бар.`)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Бұл өнім туралы сұрау
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
