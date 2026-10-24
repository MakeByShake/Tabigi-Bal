import { useEffect, useRef, useState } from 'react';
import { useCart } from '../context/cart';
import { useSite } from '../context/site';
import { formatPrice, itemsLabel } from '../lib/format';
import { CartIcon, CloseIcon, PinIcon, TrashIcon, TruckIcon, WhatsAppIcon } from './Icons';
import QuantityStepper from './QuantityStepper';

// Accepts +7 / 8 / 7 prefixes and any spacing; needs 10 digits after the country code.
const isValidPhone = (value) => /^(\+?7|8)?\d{10}$/.test(value.replace(/[\s()-]/g, ''));

export default function CartPanel() {
  const {
    cart, totalItems, totalPrice, isCartOpen, closeCart,
    setQuantity, removeFromCart, clearCart, customer, updateCustomer, checkout,
  } = useCart();
  const { settings: site } = useSite();
  const [step, setStep] = useState('cart');
  const [touched, setTouched] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isCartOpen) return;
    const onKey = (e) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    document.body.classList.add('no-scroll');
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.classList.remove('no-scroll');
    };
  }, [isCartOpen, closeCart]);

  const currentStep = cart.length === 0 ? 'cart' : step;

  const errors = {
    name: !customer.name.trim() && 'Атыңызды жазыңыз',
    phone: !isValidPhone(customer.phone) && 'Телефон нөмірін толық жазыңыз',
    address: customer.method === 'delivery' && !customer.address.trim() && 'Мекенжайды жазыңыз',
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const submit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!hasErrors) checkout();
  };

  const field = (name) => ({
    value: customer[name],
    onChange: (e) => updateCustomer({ [name]: e.target.value }),
    'aria-invalid': touched && !!errors[name],
  });

  return (
    <>
      <div className={`drawer-backdrop ${isCartOpen ? 'is-open' : ''}`} onClick={closeCart} aria-hidden="true" />
      <aside
        className={`cart-drawer ${isCartOpen ? 'is-open' : ''}`}
        aria-label="Себет"
        aria-hidden={!isCartOpen}
        inert={!isCartOpen}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="drawer-head">
          <div>
            <h3>{currentStep === 'cart' ? 'Себет' : 'Тапсырысты рәсімдеу'}</h3>
            {cart.length > 0 && <p className="muted">{itemsLabel(totalItems)} · {formatPrice(totalPrice)}</p>}
          </div>
          <button className="icon-btn" onClick={closeCart} aria-label="Себетті жабу"><CloseIcon /></button>
        </div>

        {cart.length > 0 && (
          <ol className="steps-bar" aria-label="Қадамдар">
            <li className={currentStep === 'cart' ? 'is-active' : 'is-done'}>
              <button onClick={() => setStep('cart')}>1. Себет</button>
            </li>
            <li className={currentStep === 'details' ? 'is-active' : ''}>
              <button onClick={() => setStep('details')}>2. Деректер</button>
            </li>
          </ol>
        )}

        {cart.length === 0 ? (
          <div className="drawer-empty">
            <div className="empty-icon"><CartIcon width={36} height={36} /></div>
            <p className="empty-title">Себетіңіз әзірге бос</p>
            <p className="muted">Каталогтан ұнаған балды таңдаңыз</p>
            <a href="#products" className="btn btn-primary" onClick={closeCart}>Каталогқа өту</a>
          </div>
        ) : currentStep === 'cart' ? (
          <>
            <ul className="drawer-body cart-list">
              {cart.map((item) => (
                <li key={item.id} className={`cart-row ${item.available ? '' : 'is-out'}`}>
                  <img src={item.image} alt="" loading="lazy" />
                  <div className="cart-row-info">
                    <div className="cart-row-top">
                      <span className="cart-row-name">{item.name}</span>
                      <button className="icon-btn icon-btn-sm" onClick={() => removeFromCart(item.id)} aria-label={`${item.name} — өшіру`}>
                        <TrashIcon width={18} height={18} />
                      </button>
                    </div>
                    {item.available
                      ? <span className="muted small">{formatPrice(item.price)} / {item.unit || 'дана'}{item.priceNote ? ' (шамамен)' : ''}</span>
                      : <span className="out-label small">Қазір жоқ — тапсырысқа кірмейді</span>}
                    <div className="cart-row-bottom">
                      <QuantityStepper value={item.quantity} onChange={(q) => setQuantity(item.id, q)} size="sm" label={`${item.name}, саны`} />
                      <strong>{formatPrice(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                </li>
              ))}
              <li className="cart-clear">
                <button className="link-btn" onClick={clearCart}>Себетті тазалау</button>
              </li>
            </ul>
            <div className="drawer-foot">
              <div className="total-row"><span>Барлығы</span><strong>{formatPrice(totalPrice)}</strong></div>
              <button className="btn btn-primary btn-lg btn-block" onClick={() => setStep('details')}>
                Рәсімдеуге өту
              </button>
            </div>
          </>
        ) : (
          <form className="checkout-form" onSubmit={submit} noValidate>
            <div className="drawer-body">
              <label className="field">
                <span>Атыңыз *</span>
                <input type="text" autoComplete="name" placeholder="Мысалы: Айгерім" {...field('name')} />
                {touched && errors.name && <em>{errors.name}</em>}
              </label>
              <label className="field">
                <span>Телефон *</span>
                <input type="tel" autoComplete="tel" inputMode="tel" placeholder="+7 700 000 00 00" {...field('phone')} />
                {touched && errors.phone && <em>{errors.phone}</em>}
              </label>

              <fieldset className="field">
                <legend>Алу тәсілі</legend>
                <div className="segmented">
                  <label className={customer.method === 'delivery' ? 'is-active' : ''}>
                    <input type="radio" name="method" value="delivery" checked={customer.method === 'delivery'} onChange={() => updateCustomer({ method: 'delivery' })} />
                    <TruckIcon /> Жеткізу
                  </label>
                  <label className={customer.method === 'pickup' ? 'is-active' : ''}>
                    <input type="radio" name="method" value="pickup" checked={customer.method === 'pickup'} onChange={() => updateCustomer({ method: 'pickup' })} />
                    <PinIcon /> Алып кету
                  </label>
                </div>
              </fieldset>

              {customer.method === 'delivery' ? (
                <label className="field">
                  <span>Мекенжай *</span>
                  <input type="text" autoComplete="street-address" placeholder="Көше, үй, пәтер" {...field('address')} />
                  {touched && errors.address && <em>{errors.address}</em>}
                  <small className="muted">{site.delivery}</small>
                </label>
              ) : (
                <div className="pickup-note">
                  <PinIcon />
                  <div>
                    <strong>{site.address}</strong>
                    <span className="muted small">{site.hours}</span>
                  </div>
                </div>
              )}

              <label className="field">
                <span>Пікір <span className="muted">(міндетті емес)</span></span>
                <textarea rows="2" placeholder="Ыңғайлы уақыт, тілектер…" {...field('comment')} />
              </label>
            </div>
            <div className="drawer-foot">
              <div className="total-row"><span>Барлығы</span><strong>{formatPrice(totalPrice)}</strong></div>
              <button type="submit" className="btn btn-whatsapp btn-lg btn-block">
                <WhatsAppIcon /> WhatsApp арқылы жіберу
              </button>
              <p className="muted small center">Тапсырыс дайын хабарлама болып WhatsApp-та ашылады — тек «Жіберу» басыңыз.</p>
            </div>
          </form>
        )}
      </aside>
    </>
  );
}
