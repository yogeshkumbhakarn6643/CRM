const day = 86400000;
const now = Date.now();
const ago = (d, h = 0) => new Date(now - d * day - h * 3600000).toISOString();

export const BRAND = { name: 'NovaTrade', mark: 'N' };

export const DEMO_LOGIN = { email: 'yogesh@demo-trader.com', password: 'demo-pass-123' };

export const ACCOUNT_TYPES = [
  {
    id: 'standard',
    code: 'STD',
    name: 'Standard',
    leverage: '1:200',
    minDeposit: 100,
    spread: 'From 1.2 pips',
    commission: 'None',
    text: 'Balanced pricing for everyday market access.',
  },
  {
    id: 'pro',
    code: 'PRO',
    name: 'Pro',
    leverage: '1:500',
    minDeposit: 1000,
    spread: 'From 0.1 pips',
    commission: '$3.5 per lot',
    text: 'Raw spreads with a flat commission per side.',
  },
  {
    id: 'swapfree',
    code: 'SWF',
    name: 'Swap-free',
    leverage: '1:100',
    minDeposit: 200,
    spread: 'From 1.5 pips',
    commission: 'None',
    text: 'No overnight swap charges, admin fee after 7 days.',
  },
  {
    id: 'demo',
    code: 'DEM',
    name: 'Demo',
    leverage: '1:500',
    minDeposit: 0,
    spread: 'Live pricing',
    commission: 'None',
    text: 'Practice with virtual funds. Resets at any time.',
  },
];

const series = (base, n = 30, vol = 0.012) => {
  let v = base;
  const out = [];
  for (let i = 0; i < n; i++) {
    v = v * (1 + (Math.sin(i * 1.7 + base) * vol) + (i % 5 === 0 ? vol / 2 : 0));
    out.push(Math.round(v * 100) / 100);
  }
  out[out.length - 1] = base;
  return out;
};

export const seedState = () => ({
  auth: { loggedIn: false },
  user: {
    firstName: 'Yogesh',
    lastName: '',
    email: DEMO_LOGIN.email,
    phone: '+44 7700 900123',
    country: 'United Kingdom',
    city: 'Manchester',
    address: '14 Demo Street',
    postcode: 'M1 2AB',
    dob: '1991-04-12',
    clientId: 'NT-204871',
    memberSince: '2025-02-18',
    tier: 'Silver',
    twoFactor: false,
  },
  kyc: {
    status: 'in_review',
    steps: [
      { id: 'email', label: 'Email confirmed', state: 'done' },
      { id: 'profile', label: 'Personal details', state: 'done' },
      { id: 'identity', label: 'Identity document', state: 'done', file: 'passport_front.jpg' },
      { id: 'address', label: 'Proof of address', state: 'pending', file: null },
      { id: 'questionnaire', label: 'Suitability questionnaire', state: 'todo' },
    ],
  },
  prefs: {
    theme: 'light',
    language: 'English',
    currency: 'USD',
    emailAlerts: true,
    smsAlerts: false,
    pushAlerts: true,
    marketing: false,
    weeklyDigest: true,
  },
  wallet: { USD: 2350.0, EUR: 640.5 },
  accounts: [
    {
      id: '5102938',
      type: 'standard',
      name: 'Standard USD',
      platform: 'MT5',
      server: 'NovaTrade-Live01',
      mode: 'live',
      currency: 'USD',
      leverage: '1:200',
      balance: 12480.55,
      equity: 12712.3,
      marginUsed: 1840.2,
      openPositions: 3,
      created: ago(260),
      history: series(12480.55),
    },
    {
      id: '5102944',
      type: 'pro',
      name: 'Pro USD',
      platform: 'MT5',
      server: 'NovaTrade-Live02',
      mode: 'live',
      currency: 'USD',
      leverage: '1:500',
      balance: 5210.0,
      equity: 5144.8,
      marginUsed: 620.0,
      openPositions: 1,
      created: ago(120),
      history: series(5210, 30, 0.018),
    },
    {
      id: '9001127',
      type: 'demo',
      name: 'Practice',
      platform: 'MT5',
      server: 'NovaTrade-Demo',
      mode: 'demo',
      currency: 'USD',
      leverage: '1:500',
      balance: 10000,
      equity: 10000,
      marginUsed: 0,
      openPositions: 0,
      created: ago(40),
      history: series(10000, 30, 0.004),
    },
  ],
  transactions: [
    { id: 'TX-90412', kind: 'deposit', method: 'Bank wire', account: '5102938', amount: 2500, fee: 0, status: 'completed', date: ago(2, 3) },
    { id: 'TX-90388', kind: 'transfer', from: '5102938', to: '5102944', amount: 750, fee: 0, status: 'completed', date: ago(5, 1) },
    { id: 'TX-90351', kind: 'withdrawal', method: 'Bank wire', account: '5102944', amount: 400, fee: 0, status: 'processing', date: ago(6, 5) },
    { id: 'TX-90302', kind: 'deposit', method: 'Card', account: '5102944', amount: 1200, fee: 18, status: 'completed', date: ago(12, 2) },
    { id: 'TX-90277', kind: 'deposit', method: 'USDT (TRC20)', account: 'wallet', amount: 900, fee: 1, status: 'completed', date: ago(19, 8) },
    { id: 'TX-90211', kind: 'withdrawal', method: 'E-wallet', account: '5102938', amount: 300, fee: 3, status: 'rejected', date: ago(27, 4), note: 'Name on e-wallet did not match profile.' },
    { id: 'TX-90190', kind: 'deposit', method: 'Bank wire', account: '5102938', amount: 5000, fee: 0, status: 'completed', date: ago(44, 6) },
  ],
  rewards: {
    points: 2840,
    lifetime: 4120,
    nextTarget: 4000,
    ledger: [
      { id: 'R1', text: 'Identity verified', points: 500, date: ago(30) },
      { id: 'R2', text: 'Two-step login reminder viewed', points: 50, date: ago(25) },
      { id: 'R3', text: 'Risk awareness module completed', points: 300, date: ago(18) },
      { id: 'R5', text: 'Redeemed: Market webinar seat', points: -400, date: ago(7) },
      { id: 'R6', text: 'Monthly statement reviewed', points: 100, date: ago(3) },
    ],
    requests: [{ id: 'RQ-118', item: 'Market webinar seat', points: 400, status: 'fulfilled', date: ago(7) }],
  },
  challenges: [
    { id: 'c1', title: 'Verify your identity', text: 'Upload a valid ID and proof of address.', reward: 500, progress: 4, total: 5, mark: 'ID' },
    { id: 'c2', title: 'Turn on two-step login', text: 'Protect your workspace with an authenticator app.', reward: 250, progress: 0, total: 1, mark: '2F' },
    { id: 'c3', title: 'Risk awareness series', text: 'Finish the four short lessons on leverage and margin.', reward: 400, progress: 3, total: 4, mark: 'RK' },
    { id: 'c4', title: 'Review three statements', text: 'Open and review your monthly statements.', reward: 150, progress: 1, total: 3, mark: 'ST' },
  ],
  catalogue: [
    { id: 'g1', title: 'Market webinar seat', text: 'A live session with our education team.', points: 400, stock: 'Unlimited', mark: 'WB' },
    { id: 'g2', title: 'Platform guide e-book', text: 'Step-by-step MT5 walkthrough.', points: 250, stock: 'Unlimited', mark: 'EB' },
    { id: 'g3', title: 'Withdrawal fee waiver', text: 'Waives the fee on your next card withdrawal.', points: 900, stock: '3 per year', mark: 'FW' },
    { id: 'g4', title: 'Premium charts, 1 month', text: 'Advanced charting package add-on.', points: 1800, stock: 'Limited', mark: 'PC' },
    { id: 'g5', title: 'Branded notebook', text: 'A5 hardback, posted to your address.', points: 1200, stock: '42 left', mark: 'NB' },
    { id: 'g6', title: 'One-to-one coaching call', text: '30 minutes with a platform specialist.', points: 3500, stock: '8 left', mark: '1:1' },
  ],
  statements: [
    { id: 'ST-2610', period: 'October 2026', account: '5102938', year: 2026, type: 'Monthly', size: '142 KB', date: ago(16), reviewed: true },
    { id: 'ST-2609', period: 'September 2026', account: '5102938', year: 2026, type: 'Monthly', size: '138 KB', date: ago(46), reviewed: false },
    { id: 'ST-2608', period: 'August 2026', account: '5102944', year: 2026, type: 'Monthly', size: '96 KB', date: ago(77), reviewed: false },
    { id: 'ST-2607', period: 'July 2026', account: '5102938', year: 2026, type: 'Monthly', size: '131 KB', date: ago(108), reviewed: false },
    { id: 'ST-2512', period: 'December 2025', account: '5102938', year: 2025, type: 'Annual', size: '420 KB', date: ago(320), reviewed: true },
  ],
  tickets: [
    {
      id: 'SUP-3041',
      subject: 'Withdrawal still processing',
      category: 'Payments',
      priority: 'Normal',
      status: 'open',
      date: ago(1, 4),
      messages: [
        { from: 'me', text: 'Hi, my withdrawal TX-90351 has been processing for a few days. Can you check?', date: ago(1, 4) },
        { from: 'agent', name: 'Sophie (Support)', text: 'Thanks Yogesh. Our payments team is reviewing it, you will receive an update within 24 hours.', date: ago(1, 2) },
      ],
    },
    {
      id: 'SUP-2987',
      subject: 'Proof of address format',
      category: 'Verification',
      priority: 'Low',
      status: 'resolved',
      date: ago(10),
      messages: [
        { from: 'me', text: 'Can I upload a bank statement as proof of address?', date: ago(10) },
        { from: 'agent', name: 'Daniel (Compliance)', text: 'Yes, a bank statement issued within the last 3 months is accepted.', date: ago(9, 20) },
      ],
    },
  ],
  chat: [
    { from: 'agent', name: 'Nova assistant', text: 'Hello Yogesh, how can we help you today?', date: ago(0, 1) },
  ],
  notifications: [
    { id: 'n1', title: 'Deposit completed', text: '$2,500.00 credited to Standard USD 5102938.', kind: 'success', read: false, date: ago(2, 3), link: '/cashier' },
    { id: 'n2', title: 'Proof of address needed', text: 'Upload a recent utility bill or bank statement to finish verification.', kind: 'warn', read: false, date: ago(3), link: '/profile?tab=verification' },
    { id: 'n3', title: 'October statement ready', text: 'Your monthly statement for account 5102938 is available.', kind: 'info', read: false, date: ago(16), link: '/statements' },
    { id: 'n4', title: 'Statement ready to review', text: 'Review your September statement to earn points on Rewards.', kind: 'info', read: true, date: ago(9), link: '/statements' },
    { id: 'n5', title: 'Scheduled maintenance', text: 'MT5 servers will be updated Saturday 02:00 - 03:00 UTC.', kind: 'info', read: true, date: ago(20) },
  ],
  arena: {
    matches: [
      { id: 'm1', symbol: 'EUR/USD', prompt: 'Closes above 1.0900 on Friday?', closes: ago(-3), up: 1240, down: 760, pick: null, status: 'open' },
      { id: 'm2', symbol: 'XAU/USD', prompt: 'Gold ends the week higher?', closes: ago(-2), up: 1562, down: 638, pick: 'up', status: 'open' },
      { id: 'm3', symbol: 'US500', prompt: 'Index finishes month in positive?', closes: ago(-12), up: 905, down: 740, pick: null, status: 'open' },
      { id: 'm4', symbol: 'GBP/USD', prompt: 'Closed above 1.2700 last Friday?', closes: ago(3), up: 610, down: 662, pick: 'down', status: 'settled', outcome: 'down' },
    ],
    board: [
      { name: 'Maya Patel', score: 1840 },
      { name: 'Jonas Becker', score: 1720 },
      { name: 'Yogesh', score: 1505, you: true },
      { name: 'Lucia Romero', score: 1490 },
      { name: 'Kenji Tanaka', score: 1310 },
      { name: 'Amara Okafor', score: 1180 },
    ],
  },
});
