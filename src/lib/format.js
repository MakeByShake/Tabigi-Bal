const nf = new Intl.NumberFormat('ru-RU');

// 12000 -> "12 000 ₸"
export const formatPrice = (value) => `${nf.format(value)}\u00A0₸`;

// Uses the price range text when a product has one ("1000-1400 ₸" -> "1 000–1 400 ₸").
export const displayPrice = (product) =>
  product.priceDisplay
    ? product.priceDisplay.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1\u00A0').replace(/(\d)\s*-\s*(\d)/, '$1–$2')
    : formatPrice(product.price);

// Kazakh does not inflect nouns after numerals, so one word works for every count.
export const itemsLabel = (count) => `${count} тауар`;
