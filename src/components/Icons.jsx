const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

const make = (paths) => (props) => (
  <svg {...base} {...props}>
    {paths}
  </svg>
);

export const Icon = {
  home: make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h14V9.5" /><path d="M10 20v-6h4v6" /></>),
  accounts: make(<><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3 10h18" /><path d="M7 15h4" /></>),
  cashier: make(<><path d="M12 3v18" /><path d="M17 7.5c0-1.9-2.2-3-5-3s-5 1.1-5 3 2.2 2.7 5 3.5 5 1.6 5 3.5-2.2 3-5 3-5-1.1-5-3" /></>),
  transfer: make(<><path d="M4 8h14l-3.5-3.5" /><path d="M20 16H6l3.5 3.5" /></>),
  statements: make(<><path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5" /><path d="M10 13h6M10 17h6" /></>),
  rewards: make(<><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" /></>),
  live: make(<><circle cx="12" cy="12" r="2.5" /><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4M4.9 4.9a10 10 0 0 0 0 14.2M19.1 19.1a10 10 0 0 0 0-14.2" /></>),
  support: make(<><path d="M4 13a8 8 0 1 1 16 0" /><rect x="3" y="13" width="4" height="6" rx="1.5" /><rect x="17" y="13" width="4" height="6" rx="1.5" /><path d="M19 19c0 1.5-2 2.5-5 2.5" /></>),
  bell: make(<><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></>),
  user: make(<><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6" /></>),
  more: make(<><circle cx="5" cy="12" r="1.3" /><circle cx="12" cy="12" r="1.3" /><circle cx="19" cy="12" r="1.3" /></>),
  plus: make(<><path d="M12 5v14M5 12h14" /></>),
  close: make(<><path d="M6 6l12 12M18 6 6 18" /></>),
  check: make(<><path d="m5 12.5 4.5 4.5L19 7.5" /></>),
  chevron: make(<><path d="m9 6 6 6-6 6" /></>),
  chevronDown: make(<><path d="m6 9 6 6 6-6" /></>),
  search: make(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>),
  logout: make(<><path d="M15 4h4v16h-4" /><path d="M10 8l-4 4 4 4" /><path d="M6 12h10" /></>),
  download: make(<><path d="M12 4v11" /><path d="m7.5 10.5 4.5 4.5 4.5-4.5" /><path d="M5 20h14" /></>),
  upload: make(<><path d="M12 15V4" /><path d="M7.5 8.5 12 4l4.5 4.5" /><path d="M5 20h14" /></>),
  copy: make(<><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" /></>),
  shield: make(<><path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z" /><path d="m8.8 12 2.2 2.2 4.2-4.4" /></>),
  send: make(<><path d="M21 3 10 14" /><path d="M21 3 14.5 21l-4.5-7-7-4.5z" /></>),
  eye: make(<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>),
  eyeOff: make(<><path d="M3 3l18 18" /><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.2 6.3C3.6 8 2 12 2 12s3.5 7 10 7a9.6 9.6 0 0 0 4.5-1.1" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>),
  sun: make(<><circle cx="12" cy="12" r="3.6" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" /></>),
  moon: make(<><path d="M19.4 15.1A7.7 7.7 0 0 1 8.9 4.6 8.2 8.2 0 1 0 19.4 15Z" /></>),
  globe: make(<><circle cx="12" cy="12" r="8.5" /><path d="M3.8 12h16.4M12 3.5c2.1 2.3 3.2 5.1 3.2 8.5s-1.1 6.2-3.2 8.5C9.9 18.2 8.8 15.4 8.8 12S9.9 5.8 12 3.5Z" /></>),
  card: make(<><rect x="3" y="5.5" width="18" height="13" rx="2.5" /><path d="M3 10h18" /></>),
  bank: make(<><path d="M3 9.5 12 4l9 5.5" /><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" /><path d="M3 20.5h18" /></>),
  coin: make(<><circle cx="12" cy="12" r="8.5" /><path d="M9 9h4.5a2 2 0 0 1 0 4H9h5a2 2 0 0 1 0 4H9M11 7v2M11 17v2" /></>),
  wallet: make(<><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" /><rect x="4" y="8" width="16" height="11" rx="2.5" /><circle cx="16" cy="13.5" r="1.2" /></>),
  chat: make(<><path d="M4 5h16v11H9l-5 4z" /></>),
  ticket: make(<><path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z" /><path d="M14 7v10" strokeDasharray="2 2" /></>),
  settings: make(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" /></>),
  info: make(<><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8h.01" /></>),
  trash: make(<><path d="M4 7h16M9 7V4h6v3M6.5 7l1 13h9l1-13" /></>),
  arrowUp: make(<><path d="M12 19V5M6 11l6-6 6 6" /></>),
  arrowDown: make(<><path d="M12 5v14M6 13l6 6 6-6" /></>),
  menu: make(<><path d="M4 7h16M4 12h16M4 17h16" /></>),
};
