import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('tabigiBalCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        setCart([]);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('tabigiBalCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    showNotification(`${product.name} себетке қосылды`);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const increaseQuantity = (productId) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId) => {
    setCart(prevCart => {
      const item = prevCart.find(i => i.id === productId);
      if (item && item.quantity > 1) {
        return prevCart.map(i =>
          i.id === productId ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter(i => i.id !== productId);
    });
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 2300);
  };

  const checkout = () => {
    if (cart.length === 0) {
      showNotification('Себет бос, тапсырыс беру мүмкін емес');
      return;
    }

    let message = "Сәлем! Мен Tabigi Bal-дан тапсырыс бергім келеді:%0A%0A";
    cart.forEach(item => {
      message += `- ${item.name} x ${item.quantity} = ${item.price * item.quantity} ₸%0A`;
    });

    message += `%0AБарлығы: ${getTotalPrice()} ₸%0A%0A`;
    message += "Менің атым: [Есіміңізді енгізіңіз]%0A";
    message += "Менің телефоным: [Телефон нөміріңізді енгізіңіз]%0A";
    message += "Жеткізу мекенжайы: [Мекенжайды енгізіңіз]";

    window.open(`https://wa.me/77007380979?text=${message}`, '_blank');
  };

  return (
    <CartContext.Provider value={{
      cart,
      isCartOpen,
      notification,
      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      getTotalItems,
      getTotalPrice,
      openCart,
      closeCart,
      checkout
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
