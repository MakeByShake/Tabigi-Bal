import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartContext } from './cart';
import { products } from '../data/products';
import { whatsappUrl } from '../lib/config';
import { formatPrice } from '../lib/format';

const CART_KEY = 'tabigiBalCart';
const CUSTOMER_KEY = 'tabigiBalCustomer';

const productById = new Map(products.map((p) => [p.id, p]));

const EMPTY_CUSTOMER = { name: '', phone: '', method: 'delivery', address: '', comment: '' };

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be blocked (private mode); the cart still works for this visit.
  }
}

// Only id + quantity are stored. Name, price and photo always come from the
// current catalog, so a price change never leaves stale prices in old carts.
function loadCart() {
  const saved = readJson(CART_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved
    .filter((item) => productById.has(String(item.id)) && item.quantity > 0)
    .map((item) => ({ id: String(item.id), quantity: Math.min(99, Math.floor(item.quantity)) }));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [customer, setCustomer] = useState(() => ({ ...EMPTY_CUSTOMER, ...readJson(CUSTOMER_KEY, {}) }));
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => writeJson(CART_KEY, items), [items]);
  useEffect(() => writeJson(CUSTOMER_KEY, customer), [customer]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast({ message, key: Date.now() });
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    const q = Math.max(0, Math.min(99, Math.floor(Number(quantity) || 0)));
    setItems((prev) => {
      if (q === 0) return prev.filter((i) => i.id !== id);
      if (prev.some((i) => i.id === id)) return prev.map((i) => (i.id === id ? { ...i, quantity: q } : i));
      return [...prev, { id, quantity: q }];
    });
  }, []);

  const addToCart = useCallback((id) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i));
      return [...prev, { id, quantity: 1 }];
    });
    const product = productById.get(id);
    if (product) showToast(`«${product.name}» себетке қосылды`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);

  const cart = useMemo(
    () => items.map((i) => ({ ...productById.get(i.id), quantity: i.quantity })),
    [items],
  );
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const totalPrice = useMemo(() => cart.reduce((sum, i) => sum + i.price * i.quantity, 0), [cart]);
  const getQuantity = useCallback((id) => items.find((i) => i.id === id)?.quantity ?? 0, [items]);

  const updateCustomer = useCallback((patch) => setCustomer((prev) => ({ ...prev, ...patch })), []);

  const buildOrderMessage = useCallback(() => {
    const lines = ['Сәлеметсіз бе! Tabigi Bal-ға тапсырыс:', ''];
    cart.forEach((item, idx) => {
      const price = item.priceDisplay?.includes('-') ? ` (баға: ${item.priceDisplay})` : '';
      lines.push(`${idx + 1}. ${item.name} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}${price}`);
    });
    lines.push('', `Барлығы: ${formatPrice(totalPrice)}`, '');
    lines.push(`Аты: ${customer.name.trim()}`);
    lines.push(`Телефон: ${customer.phone.trim()}`);
    if (customer.method === 'delivery') {
      lines.push('Алу тәсілі: Жеткізу');
      lines.push(`Мекенжай: ${customer.address.trim()}`);
    } else {
      lines.push('Алу тәсілі: Өзім алып кетемін');
    }
    if (customer.comment.trim()) lines.push(`Пікір: ${customer.comment.trim()}`);
    return lines.join('\n');
  }, [cart, customer, totalPrice]);

  const checkout = useCallback(() => {
    window.open(whatsappUrl(buildOrderMessage()), '_blank', 'noopener');
    showToast('Тапсырыс WhatsApp-та ашылды');
  }, [buildOrderMessage, showToast]);

  const value = {
    cart,
    totalItems,
    totalPrice,
    getQuantity,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
    isCartOpen,
    openCart: () => setIsCartOpen(true),
    closeCart: () => setIsCartOpen(false),
    customer,
    updateCustomer,
    checkout,
    toast,
    showToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
