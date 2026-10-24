import { useCart } from '../context/cart';
import { displayPrice } from '../lib/format';
import { CartIcon } from './Icons';
import QuantityStepper from './QuantityStepper';

export default function ProductCard({ product, onOpen }) {
  const { addToCart, setQuantity, getQuantity } = useCart();
  const qty = getQuantity(product.id);

  return (
    <article className="product-card">
      <button className="product-media" onClick={() => onOpen(product)} aria-label={`${product.name} — толығырақ`}>
        <img src={product.image} alt={product.name} loading="lazy" decoding="async" />
        {product.badge && <span className="badge">{product.badge}</span>}
      </button>
      <div className="product-body">
        <h3 className="product-title">
          <button onClick={() => onOpen(product)}>{product.name}</button>
        </h3>
        <p className="product-desc">{product.description}</p>
        <div className="product-foot">
          <div className="product-price">
            {displayPrice(product)}
          </div>
          {qty > 0 ? (
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
