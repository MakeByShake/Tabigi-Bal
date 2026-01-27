import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    });
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-info">
        <h3 className="product-title">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-price">
          {product.priceDisplay || `${product.price} ₸`}
        </div>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          Себетке қосу
        </button>
      </div>
    </div>
  );
}
