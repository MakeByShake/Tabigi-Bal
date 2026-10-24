import { useCart } from '../context/cart';
import { useSite } from '../context/site';
import { discountPercent, displayPrice, formatPrice } from '../lib/format';
import { BellIcon, CartIcon } from './Icons';
import QuantityStepper from './QuantityStepper';
import { notifyText } from '../lib/product';

export function ProductBadges({ product }) {
  const off = discountPercent(product);
  return (
    <span className="badges">
      {product.stock === 'out' && <span className="badge badge-out">Қазір жоқ</span>}
      {product.stock === 'low' && <span className="badge badge-low">Аз қалды</span>}
      {off > 0 && <span className="badge badge-sale">−{off}%</span>}
      {product.badge && <span className="badge">{product.badge}</span>}
    </span>
  );
}

export default function ProductCard({ product, onOpen }) {
  const { addToCart, setQuantity, getQuantity } = useCart();
  const { wa } = useSite();
  const qty = getQuantity(product.id);
  const out = product.stock === 'out';

  return (
    <article className={`product-card ${out ? 'is-out' : ''}`}>
      <button className="product-media" onClick={() => onOpen(product)} aria-label={`${product.name} — толығырақ`}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        <ProductBadges product={product} />
      </button>
      <div className="product-body">
        <h3 className="product-title">
          <button onClick={() => onOpen(product)}>{product.name}</button>
        </h3>
        {product.unit && <span className="product-unit">{product.unit}</span>}
        <p className="product-desc">{product.description}</p>
        <div className="product-foot">
          <div className="product-price">
            {displayPrice(product)}
            {product.oldPrice > product.price && <s>{formatPrice(product.oldPrice)}</s>}
          </div>
          {out ? (
            <a className="btn btn-ghost btn-sm notify-btn" href={wa(notifyText(product.name))} target="_blank" rel="noopener noreferrer">
              <BellIcon /> Келгенде хабарла
            </a>
          ) : qty > 0 ? (
            <QuantityStepper value={qty} onChange={(q) => setQuantity(product.id, q)} size="sm" label={`${product.name}, саны`} />
          ) : (
            <button className="btn btn-primary btn-sm add-btn" onClick={() => addToCart(product.id)}>
              <CartIcon /> Қосу
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
