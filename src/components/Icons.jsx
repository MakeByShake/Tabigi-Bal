// Inline SVG icons: crisp at any size and they follow the text color.
const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const make = (paths) => {
  const Icon = (props) => <svg {...base} {...props}>{paths}</svg>;
  return Icon;
};

export const CartIcon = make(<>
  <path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L20.5 8H6.2" />
  <circle cx="10" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" />
</>);
export const CloseIcon = make(<path d="M6 6l12 12M18 6L6 18" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const MinusIcon = make(<path d="M5 12h14" />);
export const TrashIcon = make(<>
  <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
</>);
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>);
export const PhoneIcon = make(<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />);
export const MailIcon = make(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>);
export const PinIcon = make(<><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>);
export const ClockIcon = make(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const LeafIcon = make(<><path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z" /><path d="M5 19l8-8" /></>);
export const TruckIcon = make(<><path d="M2 6h11v10H2zM13 9h4l4 4v3h-8" /><circle cx="6" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></>);
export const SparkIcon = make(<path d="M12 3l2.2 5.6L20 9.5l-4.5 3.8L17 19l-5-3-5 3 1.5-5.7L4 9.5l5.8-.9z" />);
export const HexIcon = make(<path d="M12 2.5l8.2 4.75v9.5L12 21.5l-8.2-4.75v-9.5z" />);
export const CheckIcon = make(<path d="M5 12.5l4.5 4.5L19 7.5" />);
export const ArrowRightIcon = make(<path d="M5 12h14M13 6l6 6-6 6" />);
export const ChevronDownIcon = make(<path d="M6 9l6 6 6-6" />);
export const ListIcon = make(<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />);
export const BellIcon = make(<><path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>);
export const ChatIcon = make(<path d="M4 5h16v11H9l-5 4z" />);

export const WhatsAppIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.3.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3z" />
  </svg>
);

export const InstagramIcon = make(<>
  <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" fill="currentColor" />
</>);

export const TelegramIcon = (props) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M21.4 4.2 2.9 11.3c-1.3.5-1.2 1.2-.2 1.5l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.4l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.4-1.5zM9.6 14l8.2-5.2c.4-.2.7-.1.4.2l-6.9 6.3-.3 3-1.4-4.3z" />
  </svg>
);
