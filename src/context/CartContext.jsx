import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CartContext } from './cart';
import { useSite } from './site';
import { formatPrice } from '../lib/format';

const CART_KEY = 'tabigiBalCart';
const CUSTOMER_KEY = 'tabigiBalCustomer';
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

// Only id + quantity are stored; name, price and stock always come from the live catalog.
function loadCart() {
  const saved = readJson(CART_KEY, []);
  if (!Array.isArray(saved)) return [];
  return saved
    .filter((item) => item && item.id != null && item.quantity > 0)
    .map((item) => ({ id: String(item.id), quantity: Math.min(99, Math.floor(item.quantity)) }));
}

// Short code the shop can match between WhatsApp and the admin orders list.
const newOrderCode = () => `TB-${Math.floor(1000 + Math.random() * 9000)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;

export function CartProvider({ children }) {
  const { productById, wa, settings } = useSite();
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
    const product = productById.get(id);
    if (!product || product.stock === 'out') return;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i));
      return [...prev, { id, quantity: 1 }];
    });
    showToast(`«${product.name}» себетке қосылды`);
  }, [productById, showToast]);

  const removeFromCart = useCallback((id) => setItems((prev) => prev.filter((i) => i.id !== id)), []);
  const clearCart = useCallback(() => setItems([]), []);

  const cart = useMemo(
    () => items
      .filter((i) => productById.has(i.id))
      .map((i) => {
        const p = productById.get(i.id);
        return { ...p, quantity: i.quantity, available: p.stock !== 'out' };
      }),
    [items, productById],
  );
  const orderable = useMemo(() => cart.filter((i) => i.available), [cart]);
  const totalItems = useMemo(() => orderable.reduce((sum, i) => sum + i.quantity, 0), [orderable]);
  const totalPrice = useMemo(() => orderable.reduce((sum, i) => sum + i.price * i.quantity, 0), [orderable]);
  const getQuantity = useCallback((id) => items.find((i) => i.id === id)?.quantity ?? 0, [items]);

  const updateCustomer = useCallback((patch) => setCustomer((prev) => ({ ...prev, ...patch })), []);

  const buildOrderMessage = useCallback((code) => {
    const lines = [`Сәлеметсіз бе! Tabigi Bal-ға тапсырыс №${code}:`, ''];
    orderable.forEach((item, idx) => {
      const unit = item.unit ? ` (${item.unit})` : '';
      const range = item.priceNote ? ` (баға: ${item.priceNote} ₸)` : '';
      lines.push(`${idx + 1}. ${item.name}${unit} × ${item.quantity} = ${formatPrice(item.price * item.quantity)}${range}`);
    });
    lines.push('', `Барлығы: ${formatPrice(totalPrice)}`, '');
    lines.push(`Аты: ${customer.name.trim()}`);
    lines.push(`Телефон: ${customer.phone.trim()}`);
    if (customer.method === 'delivery') {
      lines.push('Алу тәсілі: Жеткізу');
      lines.push(`Мекенжай: ${customer.address.trim()}`);
    } else {
      lines.push(`Алу тәсілі: Өзім алып кетемін (${settings.address})`);
    }
    if (customer.comment.trim()) lines.push(`Пікір: ${customer.comment.trim()}`);
    return lines.join('\n');
  }, [orderable, customer, totalPrice, settings.address]);

  const checkout = useCallback(() => {
    if (!orderable.length) return;
    const code = newOrderCode();
    // Open WhatsApp synchronously (inside the click) so phones don't block it as a popup.
    window.open(wa(buildOrderMessage(code)), '_blank', 'noopener');
    // Save the order for the admin panel; keepalive lets it finish even if the tab goes away.
    fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ code, customer, items: orderable.map((i) => ({ id: i.id, quantity: i.quantity })) }),
    }).catch(() => {});
    showToast('Тапсырыс WhatsApp-та ашылды');
  }, [orderable, wa, buildOrderMessage, customer, showToast]);

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
