// Shop contacts in one place, so a number change is a one-line edit.
export const CONTACTS = {
  phoneDigits: '77007380979',
  phoneDisplay: '+7 700 738 0979',
  email: 'tabigi.ball@gmail.com',
  instagram: 'https://www.instagram.com/tabigi_balkz',
  telegram: 'https://t.me/+77007380979',
  address: 'Алматы обл., Шамалған, Сауытқан 59',
  mapUrl: 'https://2gis.kz/almaty/search/Шамалған%20Сауытқан%2059',
  hours: 'Дүйсенбі – Сенбі, 9:00 – 18:00',
};

export const whatsappUrl = (text = '') =>
  `https://wa.me/${CONTACTS.phoneDigits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

export const LOGO_SRC = '/images/Tabigi Bal Logo.jpg';
