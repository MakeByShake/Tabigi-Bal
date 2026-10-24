export const whatsappUrl = (phoneDigits, text = '') =>
  `https://wa.me/${phoneDigits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const mapUrl = (address) => `https://2gis.kz/almaty/search/${encodeURIComponent(address)}`;

export const LOGO_SRC = '/images/Tabigi Bal Logo.jpg';
