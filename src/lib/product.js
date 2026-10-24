// One product shape for the whole site, whether it came from the API or the bundled list.
export function normalizeProduct(p) {
  const range = p.priceDisplay && /\d\s*-\s*\d/.test(p.priceDisplay) ? p.priceDisplay.replace(/\s*₸.*/, '') : null;
  const unit = p.priceDisplay && p.priceDisplay.includes('/') ? p.priceDisplay.split('/')[1].trim().replace(/(\d)\s*g$/, '$1 г') : null;
  return {
    id: String(p.id),
    name: p.name,
    description: p.description || '',
    category: p.category || 'honey',
    price: Number(p.price) || 0,
    oldPrice: p.old_price ? Number(p.old_price) : null,
    priceNote: p.price_note ?? range,
    unit: p.unit ?? unit,
    image: p.image || '/images/Honey-Nutrition.jpg',
    badge: p.badge || null,
    stock: p.stock || 'in',
  };
}

export const notifyText = (name) => `Сәлеметсіз бе! «${name}» қашан келеді? Келгенде хабарлаңызшы.`;
