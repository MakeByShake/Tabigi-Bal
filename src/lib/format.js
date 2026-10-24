const nf = new Intl.NumberFormat('ru-RU');

// 12000 -> "12 000 ₸"
export const formatPrice = (value) => `${nf.format(value)}\u00A0₸`;

// "1000-1400" -> "1 000–1 400 ₸"; otherwise the exact price.
export const displayPrice = (product) =>
  product.priceNote
    ? `${product.priceNote.replace(/\d+/g, (d) => nf.format(Number(d))).replace(/\s*-\s*/, '–')}\u00A0₸`
    : formatPrice(product.price);

export const discountPercent = (p) =>
  p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;

// Kazakh does not inflect nouns after numerals, so one word works for every count.
export const itemsLabel = (count) => `${count} тауар`;
