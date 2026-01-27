import { useCart } from '../context/CartContext';

export default function CartPanel() {
  const {
    cart,
    isCartOpen,
    closeCart,
    getTotalPrice,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    updateQuantity,
    checkout
  } = useCart();

  return (
    <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
      <div className="cart-header">
        <h3 className="cart-title">Менің себетім</h3>
        <button className="close-cart" onClick={closeCart}>✕</button>
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <p className="empty-cart-message">Себетіңіз бос</p>
        ) : (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <div className="cart-item-name">{item.name}</div>
                <div className="cart-item-price">{item.price} ₸</div>
                <div className="cart-item-quantity">
                  <button
                    className="quantity-btn minus"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    className="quantity-input"
                    value={item.quantity}
                    min="1"
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                  />
                  <button
                    className="quantity-btn plus"
                    onClick={() => increaseQuantity(item.id)}
                  >
                    +
                  </button>
                  <button
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <span>Барлығы:</span>
          <span id="cart-total-price">{getTotalPrice()} ₸</span>
        </div>
        <button className="checkout-btn" onClick={checkout}>
          Тапсырыс беру
        </button>
      </div>
    </div>
  );
}
